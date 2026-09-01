import https from "node:https";

export async function sendWhatsAppMessage(to: string, message: string): Promise<boolean> {
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    const fromNumber = process.env.TWILIO_WHATSAPP_FROM || "whatsapp:+14155238886"; // Default Twilio Sandbox number

    if (!accountSid || !authToken) {
        console.log(`⚠️ Twilio credentials not set. WhatsApp that would be sent to ${to}: \n\n${message}\n`);
        return false;
    }

    // Format to standard whatsapp format
    let formattedTo = to.trim();
    if (!formattedTo.startsWith("whatsapp:")) {
        const cleaned = formattedTo.replace(/[^\d+]/g, "");
        formattedTo = `whatsapp:${cleaned.startsWith("+") ? cleaned : "+" + cleaned}`;
    }

    const postData = new URLSearchParams({
        To: formattedTo,
        From: fromNumber,
        Body: message,
    }).toString();

    return new Promise((resolve) => {
        const options = {
            hostname: "api.twilio.com",
            port: 443,
            path: `/2010-04-01/Accounts/${accountSid}/Messages.json`,
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
                "Content-Length": Buffer.byteLength(postData),
                Authorization: "Basic " + Buffer.from(`${accountSid}:${authToken}`).toString("base64"),
            },
        };

        const req = https.request(options, (res) => {
            let body = "";
            res.on("data", (chunk) => {
                body += chunk;
            });
            res.on("end", () => {
                if (res.statusCode === 200 || res.statusCode === 201) {
                    try {
                        const data = JSON.parse(body);
                        console.log(`✅ WhatsApp message sent to ${to}: ${data.sid}`);
                    } catch {
                        console.log(`✅ WhatsApp message sent to ${to}`);
                    }
                    resolve(true);
                } else {
                    console.error(`❌ Failed to send WhatsApp message. Status: ${res.statusCode}. Response: ${body}`);
                    resolve(false);
                }
            });
        });

        req.on("error", (e) => {
            console.error(`❌ Twilio WhatsApp request error:`, e);
            resolve(false);
        });

        req.write(postData);
        req.end();
    });
}

interface OrderData {
    id: string;
    totalAmount: number;
    paymentMethod: string;
    address: {
        fullName: string;
        phone: string;
        street: string;
        city: string;
        region: string;
    };
    items: {
        name: string;
        quantity: number;
        unitPrice: number;
    }[];
}

export async function sendOrderWhatsAppNotification(order: OrderData) {
    const orderRef = order.id.slice(-8).toUpperCase();
    const itemsText = order.items
        .map((item) => `• ${item.name} x${item.quantity} (${(item.unitPrice * item.quantity).toFixed(2)} MAD)`)
        .join("\n");

    const message = `🌙 *IMAD Mode — Nouvelle Commande #${orderRef}* 

Bonjour ${order.address.fullName},

Nous vous remercions pour votre commande ! Voici votre récapitulatif :

*Articles :*
${itemsText}

*Total :* ${order.totalAmount.toFixed(2)} MAD
*Mode de Paiement :* ${order.paymentMethod === "COD" ? "Paiement à la livraison (COD)" : "Carte Bancaire"}

*Adresse de livraison :*
${order.address.street}, ${order.address.city} (${order.address.region})
Téléphone : ${order.address.phone}

Nous allons vous contacter très prochainement par WhatsApp ou téléphone pour valider la livraison. 
Merci pour votre confiance ! 🌿`;

    // Send message to customer
    await sendWhatsAppMessage(order.address.phone, message);

    // Send copy to store dashboard / shop owner
    const ownerPhone = process.env.WHATSAPP_PHONE;
    if (ownerPhone && ownerPhone !== "212XXXXXXXXX") {
        const ownerMessage = `⚡ *Nouvelle Commande sur IMAD Mode !*
    
Référence : #${orderRef}
Client : ${order.address.fullName}
Téléphone : ${order.address.phone}
Montant : ${order.totalAmount.toFixed(2)} MAD

*Articles :*
${itemsText}`;
        await sendWhatsAppMessage(ownerPhone, ownerMessage);
    }
}
