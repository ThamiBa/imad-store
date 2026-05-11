import { Request, Response } from "express";
import { z } from "zod";
import { stripe } from "../lib/stripe";
import { prisma } from "../lib/prisma";
import { AppError } from "../middleware/error.middleware";
import { sendOrderConfirmation } from "../lib/resend";

const intentSchema = z.object({
    amount: z.number().positive(), // in MAD cents (e.g. 25000 = 250.00 MAD)
    currency: z.string().default("mad"),
    orderId: z.string().optional(),
});

export async function createPaymentIntent(req: Request, res: Response) {
    const body = intentSchema.parse(req.body);

    const paymentIntent = await stripe.paymentIntents.create({
        amount: body.amount,
        currency: body.currency,
        metadata: { orderId: body.orderId ?? "" },
        automatic_payment_methods: { enabled: true },
    });

    res.json({
        success: true,
        data: { clientSecret: paymentIntent.client_secret },
    });
}

export async function handleWebhook(req: Request, res: Response) {
    const sig = req.headers["stripe-signature"];
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

    if (!sig || !webhookSecret) throw new AppError("Webhook configuration error", 500);

    let event;
    try {
        event = stripe.webhooks.constructEvent(req.body as Buffer, sig, webhookSecret);
    } catch (err: any) {
        console.error("Webhook signature failed:", err.message);
        res.status(400).json({ error: `Webhook Error: ${err.message}` });
        return;
    }

    if (event.type === "payment_intent.succeeded") {
        const paymentIntent = event.data.object;
        const orderId = paymentIntent.metadata?.orderId;

        if (orderId) {
            const order = await prisma.order.update({
                where: { id: orderId },
                data: {
                    paymentStatus: "PAID",
                    status: "CONFIRMED",
                    stripePaymentIntentId: paymentIntent.id,
                },
                include: {
                    items: { include: { product: true } },
                    user: { select: { email: true } },
                },
            });

            const email = order.guestEmail ?? order.user?.email;
            if (email) {
                await sendOrderConfirmation(email, {
                    id: order.id,
                    totalAmount: Number(order.totalAmount),
                    items: order.items.map((item: { product: { nameFr: string }; quantity: number; unitPrice: unknown }) => ({
                        name: item.product.nameFr,
                        quantity: item.quantity,
                        price: Number(item.unitPrice),
                    })),
                }).catch(console.error);
            }
        }
    }

    if (event.type === "payment_intent.payment_failed") {
        const paymentIntent = event.data.object;
        const orderId = paymentIntent.metadata?.orderId;
        if (orderId) {
            await prisma.order.update({
                where: { id: orderId },
                data: { paymentStatus: "FAILED", status: "CANCELLED" },
            });
        }
    }

    res.json({ received: true });
}
