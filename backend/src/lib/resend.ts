import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST ?? "smtp.gmail.com",
  port: Number(process.env.SMTP_PORT ?? 587),
  secure: false, // true for 465, false for 587
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export const EMAIL_FROM = process.env.EMAIL_FROM ?? "noreply@imad-store.ma";

// ─── Send Order Confirmation ─────────────────────────────────────────────────
export async function sendOrderConfirmation(
  to: string,
  orderData: {
    id: string;
    totalAmount: number;
    items: { name: string; quantity: number; price: number }[];
  }
) {
  const itemsHtml = orderData.items
    .map(
      (item) =>
        `<tr>
          <td style="padding:8px;border:1px solid #eee">${item.name}</td>
          <td style="padding:8px;border:1px solid #eee;text-align:center">${item.quantity}</td>
          <td style="padding:8px;border:1px solid #eee">${item.price.toFixed(2)} MAD</td>
        </tr>`
    )
    .join("");

  await transporter.sendMail({
    from: `"Imad Store 🌙" <${EMAIL_FROM}>`,
    to,
    subject: `✅ Commande confirmée — #${orderData.id.slice(-8).toUpperCase()}`,
    html: `
      <div style="font-family:sans-serif;max-width:600px;margin:auto;padding:20px">
        <h2 style="color:#1a1a1a">Merci pour votre commande 🌙</h2>
        <p>Votre commande <strong>#${orderData.id.slice(-8).toUpperCase()}</strong> a été confirmée.</p>
        <table style="width:100%;border-collapse:collapse;margin:16px 0">
          <thead>
            <tr style="background:#f9f9f9">
              <th style="padding:8px;border:1px solid #eee;text-align:left">Article</th>
              <th style="padding:8px;border:1px solid #eee">Qté</th>
              <th style="padding:8px;border:1px solid #eee;text-align:left">Prix</th>
            </tr>
          </thead>
          <tbody>${itemsHtml}</tbody>
          <tfoot>
            <tr>
              <td colspan="2" style="padding:8px;border:1px solid #eee"><strong>Total</strong></td>
              <td style="padding:8px;border:1px solid #eee"><strong>${orderData.totalAmount.toFixed(2)} MAD</strong></td>
            </tr>
          </tfoot>
        </table>
        <p>Nous vous contacterons pour la livraison. Barakallah oufik! 🌿</p>
        <hr style="border:none;border-top:1px solid #eee;margin:24px 0"/>
        <p style="color:#888;font-size:12px">Imad Store — الأناقة في كل خطوة</p>
      </div>
    `,
  });
}
