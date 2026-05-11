import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { prisma } from "../lib/prisma";

export interface AuthRequest extends Request {
    user?: {
        id: string;
        email: string;
        role: string;
    };
}

export function authenticate(req: AuthRequest, res: Response, next: NextFunction): void {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith("Bearer ")) {
        res.status(401).json({ success: false, error: "No token provided" });
        return;
    }

    const token = authHeader.split(" ")[1];
    try {
        const payload = jwt.verify(token, process.env.JWT_SECRET!) as {
            id: string;
            email: string;
            role: string;
        };
        req.user = payload;
        next();
    } catch {
        res.status(401).json({ success: false, error: "Invalid or expired token" });
    }
}

export function requireAdmin(req: AuthRequest, res: Response, next: NextFunction): void {
    if (req.user?.role !== "ADMIN") {
        res.status(403).json({ success: false, error: "Admin access required" });
        return;
    }
    next();
}
