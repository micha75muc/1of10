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
  const winnerBlock = order.isWinner
    ? `<div style="background:#22c55e;color:white;padding:20px;border-radius:8px;margin:20px 0;">
        <h2>🎉 GEWONNEN! Du erhältst eine volle Erstattung!</h2>
        <p>Der Kaufpreis von ${(order.amountTotal / 100).toFixed(2)} € wird dir in Kürze erstattet.</p>
       </div>`
    : "";

  return {
    to: order.customerEmail,
    subject: order.isWinner
      ? "🎉 Du hast gewonnen! Volle Erstattung bei 1of10"
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
        Es gelten unsere AGB und Datenschutzerklärung, einsehbar auf unserer Webseite.
      </p>
    `,
  };
}
