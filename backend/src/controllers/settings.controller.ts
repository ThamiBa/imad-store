import { Request, Response } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma";

export async function getSettings(_req: Request, res: Response) {
    let settings = await prisma.storeSettings.findUnique({ where: { id: "settings" } });
    if (!settings) {
        settings = await prisma.storeSettings.create({
            data: { id: "settings", shippingCost: 30, freeShippingMin: 500 },
        });
    }
    res.json({ success: true, data: settings });
}

const settingsSchema = z.object({
    whatsappPhone: z.string().optional(),
    shippingCost: z.number().positive().optional(),
    freeShippingMin: z.number().positive().optional(),
    codEnabled: z.boolean().optional(),
    stripeEnabled: z.boolean().optional(),
});

export async function updateSettings(req: Request, res: Response) {
    const body = settingsSchema.parse(req.body);
    const settings = await prisma.storeSettings.update({
        where: { id: "settings" },
        data: body,
    });
    res.json({ success: true, data: settings });
}
