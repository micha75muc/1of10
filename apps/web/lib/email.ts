/**
 * Email service — uses mock (console.log) when EMAIL_MOCK=true,
 * otherwise would use Resend API.
 */

interface EmailParams {
  to: string;
  subject: string;
  html: string;
}

async function sendMockEmail(params: EmailParams) {
  console.log("[Email Mock] Sending email:");
  console.log(`  To: ${params.to}`);
  console.log(`  Subject: ${params.subject}`);
  console.log(`  Body: ${params.html.substring(0, 200)}...`);
  return { id: `mock_email_${Date.now()}` };
}

async function sendRealEmail(params: EmailParams) {
  // Resend integration — placeholder for production
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: "1of10 <noreply@1of10.de>",
      to: params.to,
      subject: params.subject,
      html: params.html,
    }),
  });
  return res.json();
}

export async function sendEmail(params: EmailParams) {
  if (process.env.EMAIL_MOCK === "true") {
    return sendMockEmail(params);
  }
  return sendRealEmail(params);
}

export function orderConfirmationEmail(order: {
  customerEmail: string;
  productName: string;
  amountTotal: number;
  isWinner: boolean;
}) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://1of10-deploy.vercel.app";
  const shareText = encodeURIComponent(
    `Gerade ${order.productName} bei 1of10 gekauft und den vollen Kaufpreis zurückbekommen! Die erstatten wirklich jeden 10. Kauf. 🎉`
  );
  const shareUrl = encodeURIComponent(appUrl);

  const winnerBlock = order.isWinner
    ? `<div style="background:#22c55e;color:white;padding:24px;border-radius:12px;margin:24px 0;text-align:center;">
        <h2 style="margin:0 0 8px;">🎉 Dein Kauf wurde erstattet!</h2>
        <p style="margin:0 0 16px;font-size:18px;">Wir haben dir <strong>${(order.amountTotal / 100).toFixed(2)} €</strong> zurückerstattet — als freiwillige Kulanzleistung.</p>
        <p style="margin:0 0 4px;">Dein Produkt behältst du natürlich.</p>
      </div>
      <div style="text-align:center;margin:20px 0;">
        <p style="margin:0 0 12px;font-size:14px;color:#666;">Teile deine Erfahrung:</p>
        <a href="https://twitter.com/intent/tweet?text=${shareText}&url=${shareUrl}" style="display:inline-block;background:#1DA1F2;color:white;padding:10px 20px;border-radius:8px;text-decoration:none;margin:4px;font-size:14px;">𝕏 Twittern</a>
        <a href="https://wa.me/?text=${shareText}%20${shareUrl}" style="display:inline-block;background:#25D366;color:white;padding:10px 20px;border-radius:8px;text-decoration:none;margin:4px;font-size:14px;">WhatsApp</a>
        <a href="https://www.reddit.com/submit?url=${shareUrl}&title=${shareText}" style="display:inline-block;background:#FF4500;color:white;padding:10px 20px;border-radius:8px;text-decoration:none;margin:4px;font-size:14px;">Reddit</a>
      </div>`
    : "";

  return {
    to: order.customerEmail,
    subject: order.isWinner
      ? "🎉 Dein Kauf wurde erstattet — 1of10"
      : "Bestellbestätigung — 1of10",
    html: `
      <h1>Bestellbestätigung</h1>
      <p>Vielen Dank für deinen Kauf von <strong>${order.productName}</strong>.</p>
      <p>Betrag: ${(order.amountTotal / 100).toFixed(2)} €</p>
      ${winnerBlock}
      <hr/>
      <p style="font-size:12px;color:#888;">
        Gemäß deiner Zustimmung zum Widerrufsverzicht nach BGB §356 Abs. 5 
        bei digitalen Inhalten ist ein Widerruf für diese Bestellung ausgeschlossen.
        Es gelten unsere <a href="${appUrl}/agb">AGB</a> und 
        <a href="${appUrl}/datenschutz">Datenschutzerklärung</a>.
      </p>
    `,
  };
}
