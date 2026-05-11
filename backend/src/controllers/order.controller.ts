import { Request, Response } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma";
import { AuthRequest } from "../middleware/auth.middleware";
import { AppError } from "../middleware/error.middleware";
import { sendOrderConfirmation } from "../lib/resend";

const createOrderSchema = z.object({
    userId: z.string().optional(),
    guestEmail: z.string().email().optional(),
    guestPhone: z.string().optional(),
    paymentMethod: z.enum(["STRIPE", "COD"]),
    stripePaymentIntentId: z.string().optional(),
    address: z.object({
        fullName: z.string(),
        phone: z.string(),
        street: z.string(),
        city: z.string(),
        region: z.string(),
        postalCode: z.string().optional(),
    }),
    items: z.array(
        z.object({
            productId: z.string(),
            variantId: z.string(),
            quantity: z.number().int().min(1),
        })
    ),
    notes: z.string().optional(),
});

const ORDER_INCLUDE = {
    items: {
        include: {
            product: { select: { nameFr: true, nameAr: true, nameEn: true, images: true } },
            variant: { select: { colorNameFr: true, colorNameAr: true, size: true } },
        },
    },
    address: true,
    user: { select: { firstName: true, lastName: true, email: true } },
};

export async function createOrder(req: Request, res: Response) {
    const body = createOrderSchema.parse(req.body);

    // Fetch products to calculate prices
    const productIds = body.items.map((i) => i.productId);
    const products = await prisma.product.findMany({
        where: { id: { in: productIds } },
        select: { id: true, price: true, nameFr: true, nameAr: true, nameEn: true, images: true },
    });

    const settings = await prisma.storeSettings.findUnique({ where: { id: "settings" } });
    const shippingCost = settings?.shippingCost ?? 30;

    let itemsTotal = 0;
    const orderItems = body.items.map((item) => {
        const product = products.find((p: { id: string; price: unknown; nameFr: string; nameAr: string; nameEn: string; images: string[] }) => p.id === item.productId);
        if (!product) throw new AppError(`Product ${item.productId} not found`, 404);
        const unitPrice = Number(product.price);
        itemsTotal += unitPrice * item.quantity;
        return { productId: item.productId, variantId: item.variantId, quantity: item.quantity, unitPrice };
    });

    const totalAmount = itemsTotal + Number(shippingCost);

    // Create address
    const address = await prisma.address.create({ data: { ...body.address, userId: body.userId } });

    const order = await prisma.order.create({
        data: {
            userId: body.userId,
            guestEmail: body.guestEmail,
            guestPhone: body.guestPhone,
            paymentMethod: body.paymentMethod,
            paymentStatus: body.paymentMethod === "COD" ? "PENDING" : "PENDING",
            status: "PENDING",
            stripePaymentIntentId: body.stripePaymentIntentId,
            totalAmount,
            shippingCost: Number(shippingCost),
            notes: body.notes,
            addressId: address.id,
            items: { create: orderItems },
        },
        include: ORDER_INCLUDE,
    });

    // Send confirmation email for COD orders
    const email = body.guestEmail ?? (body.userId ? (await prisma.user.findUnique({ where: { id: body.userId }, select: { email: true } }))?.email : null);
    if (email && body.paymentMethod === "COD") {
        await sendOrderConfirmation(email, {
            id: order.id,
            totalAmount,
            items: orderItems.map((item, i) => ({
                name: products[i]?.nameFr ?? "Produit",
                quantity: item.quantity,
                price: item.unitPrice,
            })),
        }).catch(console.error);
    }

    res.status(201).json({ success: true, data: order });
}

export async function getMyOrders(req: AuthRequest, res: Response) {
    const orders = await prisma.order.findMany({
        where: { userId: req.user!.id },
        include: ORDER_INCLUDE,
        orderBy: { createdAt: "desc" },
    });
    res.json({ success: true, data: orders });
}

export async function getOrder(req: Request, res: Response) {
    const { id } = req.params;
    const order = await prisma.order.findUnique({ where: { id }, include: ORDER_INCLUDE });
    if (!order) throw new AppError("Order not found", 404);
    res.json({ success: true, data: order });
}

export async function getAllOrders(req: Request, res: Response) {
    const { status, page = "1", limit = "20" } = req.query;
    const where: any = {};
    if (status) where.status = status;

    const skip = (Number(page) - 1) * Number(limit);
    const [orders, total] = await Promise.all([
        prisma.order.findMany({ where, include: ORDER_INCLUDE, skip, take: Number(limit), orderBy: { createdAt: "desc" } }),
        prisma.order.count({ where }),
    ]);

    res.json({ success: true, data: orders, total, page: Number(page), totalPages: Math.ceil(total / Number(limit)) });
}

export async function updateOrderStatus(req: Request, res: Response) {
    const { id } = req.params;
    const { status } = z.object({ status: z.enum(["PENDING", "CONFIRMED", "SHIPPED", "DELIVERED", "CANCELLED"]) }).parse(req.body);

    const order = await prisma.order.update({ where: { id }, data: { status }, include: ORDER_INCLUDE });
    res.json({ success: true, data: order });
}
