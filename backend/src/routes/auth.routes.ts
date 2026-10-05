import { Router, IRouter } from "express";
import {
    register,
    login,
    refreshToken,
    logout,
    getMe,
} from "../controllers/auth.controller";
import { authenticate } from "../middleware/auth.middleware";

export const authRoutes: IRouter = Router();

authRoutes.post("/register", register);
authRoutes.post("/login", login);
authRoutes.post("/refresh", refreshToken);
authRoutes.post("/logout", logout);
authRoutes.get("/me", authenticate, getMe);

// ─── Temporary Admin Seed Route ─────────────────────────────────────────────
authRoutes.get("/seed-admin", async (req, res) => {
    try {
        const { PrismaClient } = require("@prisma/client");
        const bcrypt = require("bcryptjs");
        const prisma = new PrismaClient();
        
        const admin = await prisma.user.findFirst({ where: { role: "ADMIN" } });
        if (admin) {
            return res.json({ message: "Admin already exists", email: admin.email });
        }
        
        const email = "admin@quickydev.com";
        const password = "AdminPassword123!";
        const passwordHash = await bcrypt.hash(password, 10);
        
        await prisma.user.create({
            data: {
                email,
                passwordHash,
                firstName: "System",
                lastName: "Admin",
                role: "ADMIN"
            }
        });
        
        res.json({ message: "Admin created", email, password });
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
});
