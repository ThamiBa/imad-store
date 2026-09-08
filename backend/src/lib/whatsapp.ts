/**
 * WhatsApp helpers — 100% free, no Twilio required.
 * These generate wa.me deep links the customer can tap to open WhatsApp directly.
 */

/** Clean phone number for wa.me format */
function cleanPhone(phone: string): string {
    return phone.replace(/[^\d+]/g, "").replace(/^00/, "+");
}

/** Generate a wa.me link to open WhatsApp with a pre-filled message */
export function generateWhatsAppLink(to: string, message: string): string {
    const cleaned = cleanPhone(to);
    const encoded = encodeURIComponent(message);
    return `https://wa.me/${cleaned.replace("+", "")}?text=${encoded}`;
}

/** Generate a wa.me admin notification link for manual follow-up */
export function generateAdminWhatsAppLink(order: {
    id: string;
    customerName: string;
    customerPhone: string;
    city: string;
    region: string;
    totalAmount: number;
    paymentMethod: string;
    items: { name: string; quantity: number; unitPrice: number }[];
}): string {
    const ref = order.id.slice(-6).toUpperCase();
    const itemsText = order.items
        .map((i) => `• ${i.name} x${i.quantity} (${(i.unitPrice * i.quantity).toFixed(2)} MAD)`)
        .join("%0A");

    const msg = [
        `🛍️ *NOUVELLE COMMANDE #${ref}*`,
        ``,
        `👤 Client: ${order.customerName}`,
        `📞 Tél: ${order.customerPhone}`,
        `📍 ${order.city}, ${order.region}`,
        `💳 Paiement: ${order.paymentMethod}`,
        `💰 Total: *${order.totalAmount.toFixed(2)} MAD*`,
        ``,
        `*Articles:*`,
        itemsText,
    ].join("%0A");

    const adminPhone = process.env.WHATSAPP_PHONE ?? "";
    return generateWhatsAppLink(adminPhone, decodeURIComponent(msg));
}
