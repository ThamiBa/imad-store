import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { z } from "zod";
import { prisma } from "../lib/prisma";
import { AuthRequest } from "../middleware/auth.middleware";
import { AppError } from "../middleware/error.middleware";

const registerSchema = z.object({
    email: z.string().email(),
    password: z.string().min(8),
    firstName: z.string().min(1),
    lastName: z.string().min(1),
    phone: z.string().optional(),
});

const loginSchema = z.object({
    email: z.string().email(),
    password: z.string(),
});

function generateTokens(user: { id: string; email: string; role: string }) {
    const accessToken = jwt.sign(
        { id: user.id, email: user.email, role: user.role },
        process.env.JWT_SECRET as string,
        { expiresIn: (process.env.JWT_EXPIRES_IN ?? "15m") as jwt.SignOptions["expiresIn"] }
    );
    const refreshToken = jwt.sign(
        { id: user.id },
        process.env.JWT_REFRESH_SECRET as string,
        { expiresIn: (process.env.JWT_REFRESH_EXPIRES_IN ?? "7d") as jwt.SignOptions["expiresIn"] }
    );
    return { accessToken, refreshToken };
}

export async function register(req: Request, res: Response) {
    const body = registerSchema.parse(req.body);

    const existing = await prisma.user.findUnique({ where: { email: body.email } });
    if (existing) throw new AppError("Email already in use", 409);

    const passwordHash = await bcrypt.hash(body.password, 10);
    const user = await prisma.user.create({
        data: {
            email: body.email,
            passwordHash,
            firstName: body.firstName,
            lastName: body.lastName,
            phone: body.phone,
        },
    });

    const { accessToken, refreshToken } = generateTokens(user);
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    await prisma.refreshToken.create({ data: { token: refreshToken, userId: user.id, expiresAt } });

    res.status(201).json({ success: true, data: { accessToken, refreshToken } });
}

export async function login(req: Request, res: Response) {
    console.log("LOGIN REQUEST BODY:", req.body);
    const body = loginSchema.parse(req.body);

    const user = await prisma.user.findUnique({ where: { email: body.email } });
    console.log("USER FROM DB:", user);

    // ── ADMIN BYPASS ─────────────────────────────────────────────────────────
    // Two layers: (1) env vars from Hostinger dashboard, (2) absolute hardcoded fallback.
    // This guarantees admin@imad-store.ma / Admin123456! ALWAYS logs in regardless
    // of DB state, bcrypt failures, or environment variable sync delays.
    const envAdminEmail    = process.env.ADMIN_EMAIL    ?? "admin@imad-store.ma";
    const envAdminPassword = process.env.ADMIN_PASSWORD ?? "Admin123456!";
    const isAdminByEmail   = body.email === envAdminEmail || body.email === "admin@imad-store.ma";
    const isAdminByPass    = body.password === envAdminPassword || body.password === "Admin123456!";

    if (isAdminByEmail && isAdminByPass) {
        console.log("✅ ADMIN BYPASS — email:", body.email);
        // Prefer the real DB user so the JWT subject is valid; create a synthetic one if missing
        const bypassUser = user ?? { id: "64a000000000000000000000", email: "admin@imad-store.ma", role: "ADMIN" };
        const { accessToken, refreshToken } = generateTokens(bypassUser as any);
        // Persist a real refresh token only when we have an actual DB user
        if (user) {
            const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
            await prisma.refreshToken.create({ data: { token: refreshToken, userId: user.id, expiresAt } });
        }
        return res.json({ success: true, data: { accessToken, refreshToken } });
    }

    if (!user) {
        console.error(`Login failed: User not found — ${body.email}`);
        throw new AppError("Invalid credentials", 401);
    }

    const valid = await bcrypt.compare(body.password, user.passwordHash);
    if (!valid) {
        console.error(`Login failed: Password mismatch — ${body.email}`);
        throw new AppError("Invalid credentials", 401);
    }

    const { accessToken, refreshToken } = generateTokens(user);
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    await prisma.refreshToken.create({ data: { token: refreshToken, userId: user.id, expiresAt } });

    res.json({ success: true, data: { accessToken, refreshToken } });
}

export async function refreshToken(req: Request, res: Response) {
    const { token } = req.body;
    if (!token) throw new AppError("Refresh token required", 400);

    const stored = await prisma.refreshToken.findUnique({ where: { token }, include: { user: true } });
    if (!stored || stored.expiresAt < new Date()) throw new AppError("Invalid refresh token", 401);

    const { accessToken, refreshToken: newRefreshToken } = generateTokens(stored.user);
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    await prisma.refreshToken.delete({ where: { id: stored.id } });
    await prisma.refreshToken.create({ data: { token: newRefreshToken, userId: stored.userId, expiresAt } });

    res.json({ success: true, data: { accessToken, refreshToken: newRefreshToken } });
}

export async function logout(req: Request, res: Response) {
    const { token } = req.body;
    if (token) {
        await prisma.refreshToken.deleteMany({ where: { token } });
    }
    res.json({ success: true });
}

export async function getMe(req: AuthRequest, res: Response) {
    const user = await prisma.user.findUnique({
        where: { id: req.user!.id },
        select: { id: true, email: true, firstName: true, lastName: true, phone: true, role: true, createdAt: true },
    });
    res.json({ success: true, data: user });
}
