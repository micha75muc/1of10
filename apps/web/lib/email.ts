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
      from: process.env.RESEND_FROM_EMAIL ?? "1of10 <onboarding@resend.dev>",
      to: params.to,
      subject: params.subject,
      html: params.html,
    }),
  });
  return res.json();
}

export async function sendEmail(params: EmailParams) {
  // Production-Guard: EMAIL_MOCK darf NIE in Production aktiv sein —
  // sonst gehen Bestätigungsmails (inkl. Lizenzschlüssel) ins Leere.
  // Analoger Check zu lib/stripe.ts.
  if (process.env.EMAIL_MOCK === "true") {
    if (process.env.NODE_ENV === "production") {
      throw new Error(
        "FATAL: EMAIL_MOCK=true ist in Production nicht erlaubt — Bestätigungsmails würden in console verschwinden.",
      );
    }
    return sendMockEmail(params);
  }
  return sendRealEmail(params);
}

export function orderConfirmationEmail(order: {
  customerEmail: string;
  productName: string;
  amountTotal: number;
  isWinner: boolean;
  licenseKey?: string;
  /** True for Trend Micro, AVG, Norton etc. — customer needs to create
   * a vendor account before redeeming the key. We render an explainer
   * block so they don't bounce when they see the unknown sign-up step. */
  requiresVendorAccount?: boolean;
  vendorName?: string;
  vendorActivationUrl?: string;
}) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://1of10.de";
  const shareText = encodeURIComponent(
    `Gerade ${order.productName} bei 1of10 gekauft und den vollen Kaufpreis zurückbekommen! Die erstatten wirklich jeden 10. Kauf. 🎉`
  );
  const shareUrl = encodeURIComponent(appUrl);

  const winnerBlock = order.isWinner
    ? `<div style="background:#22c55e;color:white;padding:24px;border-radius:12px;margin:24px 0;text-align:center;">
        <h2 style="margin:0 0 8px;">🎉 Dein Kauf wurde erstattet!</h2>
        <p style="margin:0 0 16px;font-size:18px;">Wir haben dir <strong>${(order.amountTotal / 100).toFixed(2).replace(".", ",")} €</strong> zurückerstattet — als freiwillige Kulanzleistung.</p>
        <p style="margin:0 0 4px;">Dein Produkt behältst du natürlich.</p>
      </div>
      <div style="text-align:center;margin:20px 0;">
        <p style="margin:0 0 12px;font-size:14px;color:#666;">Teile deine Erfahrung:</p>
        <a href="https://twitter.com/intent/tweet?text=${shareText}&url=${shareUrl}" style="display:inline-block;background:#1DA1F2;color:white;padding:10px 20px;border-radius:8px;text-decoration:none;margin:4px;font-size:14px;">𝕏 Twittern</a>
        <a href="https://wa.me/?text=${shareText}%20${shareUrl}" style="display:inline-block;background:#25D366;color:white;padding:10px 20px;border-radius:8px;text-decoration:none;margin:4px;font-size:14px;">WhatsApp</a>
        <a href="https://www.reddit.com/submit?url=${shareUrl}&title=${shareText}" style="display:inline-block;background:#FF4500;color:white;padding:10px 20px;border-radius:8px;text-decoration:none;margin:4px;font-size:14px;">Reddit</a>
      </div>`
    : "";

  const keyBlock = order.licenseKey
    ? `<div style="background:#f4f4f5;border:1px solid #e4e4e7;border-radius:12px;padding:20px;margin:24px 0;">
        <h2 style="margin:0 0 8px;font-size:18px;">🔑 Dein Lizenzschlüssel</h2>
        <p style="margin:0 0 12px;font-size:13px;color:#555;">Bitte speichere diesen Code sicher — er ist dein Produktschlüssel.</p>
        <div style="background:#0f172a;color:#f8fafc;padding:16px;border-radius:8px;font-family:'Courier New',monospace;font-size:16px;word-break:break-all;letter-spacing:0.5px;text-align:center;">
          ${order.licenseKey}
        </div>
        <p style="margin:12px 0 0;font-size:12px;color:#666;">Bewahre diese E-Mail auf — du kannst den Schlüssel jederzeit unter <a href="${appUrl}/bestellstatus">${appUrl}/bestellstatus</a> erneut einsehen (Session-ID + E-Mail erforderlich).</p>
      </div>`
    : `<div style="background:#fef3c7;border:1px solid #fde68a;border-radius:12px;padding:16px;margin:24px 0;">
        <p style="margin:0;font-size:14px;color:#92400e;">🕒 Dein Lizenzschlüssel wird in Kürze manuell zugestellt. Bei Fragen antworte einfach auf diese E-Mail.</p>
      </div>`;

  const vendorName = order.vendorName ?? "der Hersteller";
  const vendorBlock = order.requiresVendorAccount
    ? `<div style="background:#eff6ff;border:1px solid #bfdbfe;border-radius:12px;padding:20px;margin:24px 0;">
        <h2 style="margin:0 0 8px;font-size:16px;color:#1e3a8a;">So aktivierst du deine Lizenz</h2>
        <p style="margin:0 0 14px;font-size:13px;color:#334155;">
          ${vendorName} verlangt für die Aktivierung ein <strong>kostenloses
          Konto</strong> — das ist bei Antiviren-Software branchenüblich und
          dauert ca. 2 Minuten. Keine zusätzlichen Kosten, kein Abo.
        </p>
        <ol style="margin:0;padding:0 0 0 20px;font-size:13px;color:#334155;line-height:1.6;">
          <li><strong>E-Mail von My-ESD prüfen.</strong> Du bekommst gleich ein zweites Mail mit dem 20-stelligen Aktivierungs-Code (PDF-Zertifikat). Absender: noreply@my-esd.com.</li>
          <li><strong>Kostenloses ${vendorName}-Konto anlegen.</strong> Über den Link im Zertifikat oder direkt unten.</li>
          <li><strong>Aktivierungs-Code eingeben.</strong> Software wird heruntergeladen und automatisch lizenziert.</li>
        </ol>
        ${
          order.vendorActivationUrl
            ? `<p style="margin:14px 0 0;"><a href="${order.vendorActivationUrl}" style="display:inline-block;background:#2563eb;color:white;padding:10px 18px;border-radius:8px;text-decoration:none;font-size:13px;font-weight:600;">Zur ${vendorName}-Aktivierungsseite ↗</a></p>`
            : ""
        }
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
      <p>Betrag: ${(order.amountTotal / 100).toFixed(2).replace(".", ",")} €</p>
      ${keyBlock}
      ${vendorBlock}
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
