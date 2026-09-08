import { Router, IRouter, Request, Response } from "express";
import https from "node:https";
import { prisma } from "../lib/prisma";

export const telegramRoutes: IRouter = Router();

/**
 * Telegram Bot webhook — when a customer messages the bot for the first
 * time, we record their phone → chat_id mapping so the bridge can DM them.
 *
 * The customer is expected to send `/start +212600000000` (their phone) so
 * we can correlate. Anything else triggers a friendly onboarding message.
 */
telegramRoutes.post("/webhook", async (req: Request, res: Response) => {
    try {
        const update = req.body;
        const message = update?.message;
        if (!message) return res.sendStatus(200);

        const chatId = String(message.chat.id);
        const text: string = (message.text ?? "").trim();
        const firstName: string | undefined = message.chat.first_name;
        const username: string | undefined = message.chat.username;

        // Match `/start <phone>` to link a phone number to this chat.
        const match = text.match(/^\/start(?:\s+(\+?\d[\d\s-]{6,}))?$/i);
        if (match && match[1]) {
            const phone = match[1].replace(/[\s-]/g, "");
            await prisma.telegramCustomer.upsert({
                where: { phone },
                create: { phone, chatId, firstName, username },
                update: { chatId, firstName, username },
            });
            await replyToTelegram(chatId,
                `✅ Merci ${firstName ?? ""} !\n\nVotre compte est lié. Vous recevrez désormais les confirmations de vos commandes ici.`
            );
        } else if (/^\/start$/i.test(text)) {
            await replyToTelegram(chatId,
                `👋 Bienvenue chez IMAD Mode !\n\nPour recevoir vos confirmations de commande, envoyez :\n/start +212600000000\n\n(Remplacez par votre numéro de téléphone)`
            );
        } else {
            await replyToTelegram(chatId,
                `Envoyez /start suivi de votre numéro de téléphone pour activer les notifications.\n\nExemple : /start +212600000000`
            );
        }

        res.sendStatus(200);
    } catch (err) {
        console.error("Telegram webhook error:", err);
        res.sendStatus(200); // Always 200 to avoid Telegram retries
    }
});

function replyToTelegram(chatId: string, text: string): Promise<void> {
    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    if (!botToken) return Promise.resolve();

    const postData = new URLSearchParams({ chat_id: chatId, text }).toString();
    const options = {
        hostname: "api.telegram.org",
        port: 443,
        path: `/bot${botToken}/sendMessage`,
        method: "POST",
        headers: {
            "Content-Type": "application/x-www-form-urlencoded",
            "Content-Length": Buffer.byteLength(postData),
        },
    };

    return new Promise((resolve) => {
        const req = https.request(options, (res) => {
            res.on("data", () => {});
            res.on("end", () => resolve());
        });
        req.on("error", () => resolve());
        req.write(postData);
        req.end();
    });
}
