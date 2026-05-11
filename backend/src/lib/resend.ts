import { Resend } from "resend";

if (!process.env.RESEND_API_KEY) {
    throw new Error("RESEND_API_KEY is not set");
}

export const resend = new Resend(process.env.RESEND_API_KEY);

export const EMAIL_FROM = process.env.EMAIL_FROM ?? "noreply@imad-store.ma";

// ─── Send Order Confirmation ─────────────────────────────────────────────────
export async function sendOrderConfirmation(
    to: string,
    orderData: { id: string; totalAmount: number; items: { name: string; quantity: number; price: number }[] }
) {
    const itemsHtml = orderData.items
        .map(
            (item) =>
                `<tr>
          <td>${item.name}</td>
          <td>${item.quantity}</td>
          <td>${item.price.toFixed(2)} MAD</td>
        </tr>`
        )
        .join("");

    await resend.emails.send({
        from: EMAIL_FROM,
        to,
        subject: `✅ Commande confirmée — #${orderData.id.slice(-8).toUpperCase()}`,
        html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: auto;">
        <h2>Merci pour votre commande 🌙</h2>
        <p>Votre commande <strong>#${orderData.id.slice(-8).toUpperCase()}</strong> a été confirmée.</p>
        <table border="1" cellpadding="8" cellspacing="0" style="border-collapse:collapse; width:100%;">
          <tr><th>Article</th><th>Qté</th><th>Prix</th></tr>
          ${itemsHtml}
          <tr><td colspan="2"><strong>Total</strong></td><td><strong>${orderData.totalAmount.toFixed(2)} MAD</strong></td></tr>
        </table>
        <p>Nous vous contacterons pour la livraison. Barakallah oufik! 🌿</p>
      </div>
    `,
    });
}
