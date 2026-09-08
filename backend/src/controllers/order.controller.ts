import { Request, Response } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma";
import { AppError } from "../middleware/error.middleware";
import { bridgeOrderToAdmin, OrderForBridge } from "../lib/telegram-bridge";
import { appendOrderToSheets, updateOrderStatusInSheets } from "../lib/notifications";

// Guest-only checkout schema — COD only (card payments disabled)
const createOrderSchema = z.object({
    paymentMethod: z.enum(["COD"]).default("COD"),
    notes: z.string().optional(),
    customer: z.object({
        fullName: z.string().min(1, "Full name is required"),
        phone: z.string().min(1, "Phone is required"),
        email: z.string().email().optional().or(z.literal("")),
        street: z.string().min(1, "Address is required"),
        city: z.string().min(1, "City is required"),
        region: z.string().min(1, "Region is required"),
        postalCode: z.string().optional(),
    }),
    items: z.array(
        z.object({
            productId: z.string(),
            variantId: z.string(),
            quantity: z.number().int().min(1),
        })
    ).min(1, "Cart cannot be empty"),
});

const ORDER_INCLUDE = {
    items: {
        include: {
            product: { select: { nameFr: true, nameAr: true, nameEn: true, images: true } },
            variant: { select: { colorNameFr: true, colorNameAr: true, size: true } },
        },
    },
};

export async function createOrder(req: Request, res: Response) {
    const body = createOrderSchema.parse(req.body);

    // Fetch products
    const productIds = body.items.map((i) => i.productId);
    const products = await prisma.product.findMany({
        where: { id: { in: productIds } },
        select: { id: true, price: true, nameFr: true, nameAr: true, nameEn: true, images: true },
    });

    // Validate stock for each variant
    const variantIds = body.items.map((i) => i.variantId);
    const variants = await prisma.productVariant.findMany({
        where: { id: { in: variantIds } },
    });
    const insufficient: string[] = [];
    for (const item of body.items) {
        const variant = variants.find((v: { id: string; stock: number }) => v.id === item.variantId);
        if (!variant || variant.stock < item.quantity) {
            insufficient.push(item.variantId);
        }
    }
    if (insufficient.length > 0) {
        throw new AppError(`Insufficient stock for variants: ${insufficient.join(", ")}`, 400);
    }

    // Calculate totals
    const settings = await prisma.storeSettings.findUnique({ where: { id: "settings" } });
    const shippingCost = settings?.shippingCost ?? 30;
    const freeShippingMin = settings?.freeShippingMin ?? 500;

    let itemsTotal = 0;
    const orderItems = body.items.map((item) => {
        const product = products.find((p: { id: string; price: unknown; nameFr: string; nameAr: string; nameEn: string; images: string[] }) => p.id === item.productId);
        if (!product) throw new AppError(`Product ${item.productId} not found`, 404);
        const unitPrice = Number(product.price);
        itemsTotal += unitPrice * item.quantity;
        return { productId: item.productId, variantId: item.variantId, quantity: item.quantity, unitPrice };
    });

    const appliedShipping = itemsTotal >= freeShippingMin ? 0 : Number(shippingCost);
    const totalAmount = itemsTotal + appliedShipping;

    // Create the order (no Address/User row — guest checkout is anonymous)
    const order = await prisma.order.create({
        data: {
            customerName: body.customer.fullName,
            customerPhone: body.customer.phone,
            customerEmail: body.customer.email || null,
            fullName: body.customer.fullName,
            phone: body.customer.phone,
            street: body.customer.street,
            city: body.customer.city,
            region: body.customer.region,
            postalCode: body.customer.postalCode,
            paymentMethod: "COD",
            paymentStatus: "PENDING",
            status: "PENDING",
            totalAmount,
            shippingCost: appliedShipping,
            notes: body.notes,
            items: { create: orderItems },
            events: {
                create: {
                    type: "created",
                    message: `New COD order from ${body.customer.fullName}`,
                },
            },
        },
        include: { ...ORDER_INCLUDE, events: true },
    });

    // Decrement stock
    await Promise.all(
        orderItems.map((item) =>
            prisma.productVariant.update({
                where: { id: item.variantId },
                data: { stock: { decrement: item.quantity } },
            })
        )
    );

    // ── Telegram → WhatsApp Bridge ──────────────────────────────────────
    // Telegram is the hub. The admin gets the order via Telegram (with a
    // wa.me link they can tap to open WhatsApp). If the customer has linked
    // their phone to the bot, they also receive an instant acknowledgment.
    // The whole pipeline is best-effort and never blocks the order.
    const locale = (req.headers["x-locale"] as "ar" | "fr" | "en" | undefined) ?? "fr";
    const bridgePayload: OrderForBridge = {
        id: order.id,
        customerName: order.customerName,
        customerPhone: order.customerPhone,
        customerEmail: order.customerEmail ?? null,
        fullName: order.fullName ?? null,
        city: order.city ?? null,
        region: order.region ?? null,
        totalAmount: order.totalAmount,
        paymentMethod: "COD",
        items: order.items.map((item: { product?: { nameFr: string } | null; quantity: number; unitPrice: number }) => ({
            name: item.product?.nameFr ?? "Produit",
            quantity: item.quantity,
            unitPrice: item.unitPrice,
        })),
        notes: order.notes ?? null,
    };

    bridgeOrderToAdmin(bridgePayload, { locale })
        .then((result) => {
            console.log(`🌉 Bridge result for #${order.id.slice(-6)}:`, result);
            if (result.manualActionNeeded) {
                console.warn(`⚠️ Manual follow-up required for order ${order.id}`);
            }
        })
        .catch((err) => console.error("Telegram bridge failed:", err));

    // Google Sheets append (best-effort, never block the order)
    await appendOrderToSheets(order).catch((err) =>
        console.error("Google Sheets append failed:", err)
    );

    res.status(201).json({ success: true, data: order });
}

export async function getOrder(req: Request, res: Response) {
    const { id } = req.params;
    const order = await prisma.order.findUnique({ where: { id }, include: ORDER_INCLUDE });
    if (!order) throw new AppError("Order not found", 404);
    res.json({ success: true, data: order });
}

export async function listOrders(req: Request, res: Response) {
    const { status, page = "1", limit = "20" } = req.query;
    const where: Record<string, unknown> = {};
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

    const order = await prisma.order.update({
        where: { id },
        data: {
            status,
            events: { create: { type: "status_changed", message: `Order marked as ${status}` } },
        },
        include: ORDER_INCLUDE,
    });

    await prisma.adminNotification.create({
        data: {
            type: "order_status",
            title: `Order #${order.id.slice(-6).toUpperCase()} → ${status}`,
            message: `${order.customerName} — ${order.totalAmount.toFixed(2)} MAD`,
            orderId: order.id,
        },
    });

    // Google Sheets status update sync (best-effort)
    await updateOrderStatusInSheets(order.id, status).catch((err) =>
        console.error("Google Sheets status update failed:", err)
    );

    res.json({ success: true, data: order });
}

// Admin: list notifications (polling endpoint)
export async function getAdminNotifications(_req: Request, res: Response) {
    const notifications = await prisma.adminNotification.findMany({
        orderBy: { createdAt: "desc" },
        take: 50,
    });
    const unread = await prisma.adminNotification.count({ where: { read: false } });
    res.json({ success: true, data: notifications, unread });
}

export async function markNotificationRead(req: Request, res: Response) {
    const { id } = req.params;
    await prisma.adminNotification.update({ where: { id }, data: { read: true } });
    res.json({ success: true });
}

export async function markAllNotificationsRead(_req: Request, res: Response) {
    await prisma.adminNotification.updateMany({ where: { read: false }, data: { read: true } });
    res.json({ success: true });
}
