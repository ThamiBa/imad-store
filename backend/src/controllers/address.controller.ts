import { Response } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma";
import { AuthRequest } from "../middleware/auth.middleware";
import { AppError } from "../middleware/error.middleware";

const addressSchema = z.object({
    fullName: z.string().min(1),
    phone: z.string().min(1),
    street: z.string().min(1),
    city: z.string().min(1),
    region: z.string().min(1),
    postalCode: z.string().optional(),
    isDefault: z.boolean().optional(),
});

export async function getAddresses(req: AuthRequest, res: Response) {
    const addresses = await prisma.address.findMany({
        where: { userId: req.user!.id },
        orderBy: { isDefault: "desc" },
    });
    res.json({ success: true, data: addresses });
}

export async function createAddress(req: AuthRequest, res: Response) {
    const body = addressSchema.parse(req.body);
    if (body.isDefault) {
        await prisma.address.updateMany({
            where: { userId: req.user!.id },
            data: { isDefault: false },
        });
    }
    const address = await prisma.address.create({
        data: { ...body, userId: req.user!.id },
    });
    res.status(201).json({ success: true, data: address });
}

export async function updateAddress(req: AuthRequest, res: Response) {
    const { id } = req.params;
    const body = addressSchema.partial().parse(req.body);
    if (body.isDefault) {
        await prisma.address.updateMany({
            where: { userId: req.user!.id, id: { not: id } },
            data: { isDefault: false },
        });
    }
    const address = await prisma.address.update({
        where: { id, userId: req.user!.id },
        data: body,
    });
    res.json({ success: true, data: address });
}

export async function deleteAddress(req: AuthRequest, res: Response) {
    const { id } = req.params;
    const address = await prisma.address.findFirst({
        where: { id, userId: req.user!.id },
    });
    if (!address) throw new AppError("Address not found", 404);
    await prisma.address.delete({ where: { id } });
    res.json({ success: true });
}
