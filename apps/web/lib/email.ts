/**
 * Email service — uses mock (console.log) when EMAIL_MOCK=true,
 * otherwise would use Resend API.
 */

interface EmailParams {
  to: string;
  subject: string;
  html: string;
}

/**
 * Verkäuferdaten (Impressum) — Anlage 1 Art. 246a EGBGB verlangt vollständige
 * Identität des Unternehmers in der Bestellbestätigung. Hier zentral, damit
 * Impressum & Mail nicht auseinanderdriften.
 */
const SELLER = {
  name: "Michael Hahnel",
  street: "Nederlinger Str. 83",
  city: "80638 München",
  country: "Deutschland",
  email: "info@medialess.de",
  phone: "0152 25389619",
} as const;

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

/**
 * Format-Helper für deutsche Datum/Beträge in der Mail.
 * Bewusst keine Intl-Aufrufe in HTML-Strings — Resend liefert nicht in
 * jedem Render-Kontext eine TZ-aware Locale.
 */
function formatEur(cents: number): string {
  return (cents / 100).toFixed(2).replace(".", ",") + " €";
}

function formatDate(d: Date): string {
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const yyyy = d.getFullYear();
  const hh = String(d.getHours()).padStart(2, "0");
  const mi = String(d.getMinutes()).padStart(2, "0");
  return `${dd}.${mm}.${yyyy}, ${hh}:${mi} Uhr`;
}

export function orderConfirmationEmail(order: {
  customerEmail: string;
  productName: string;
  amountTotal: number; // in Cent
  isWinner: boolean;
  licenseKey?: string;
  /** True for Trend Micro, AVG, Norton etc. — customer needs to create
   * a vendor account before redeeming the key. We render an explainer
   * block so they don't bounce when they see the unknown sign-up step. */
  requiresVendorAccount?: boolean;
  vendorName?: string;
  vendorActivationUrl?: string;
  /** Receipt-relevante Pflichtfelder (Anlage 1 Art. 246a EGBGB + §19 UStG). */
  orderId: string;
  orderDate: Date;
  customerName?: string;
}) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://1of10.de";
  const shareText = encodeURIComponent(
    `Gerade ${order.productName} bei 1of10 gekauft und den vollen Kaufpreis zurückbekommen! Die erstatten wirklich jeden 10. Kauf. 🎉`,
  );
  const shareUrl = encodeURIComponent(appUrl);
  const orderShortId = order.orderId.slice(0, 8).toUpperCase();

  // ---------- Header / Greeting ----------
  const greetingName = order.customerName?.trim()
    ? `Hallo ${order.customerName.trim().split(/\s+/)[0]},`
    : "Hallo,";

  // ---------- Receipt / Kaufbeleg-Block ----------
  // Pflicht laut §19 UStG: Hinweis "ohne Ausweis der Umsatzsteuer". Pflicht
  // laut Art. 246a EGBGB Anlage 1: Identität des Unternehmers, Gesamtpreis,
  // Datum, Vertragsgegenstand. Wir packen alles in einen klar abgesetzten
  // Block, damit der Kunde es als Kaufbeleg speichern kann.
  const receiptBlock = `
    <div style="background:#fafafa;border:1px solid #e5e5e5;border-radius:12px;padding:20px;margin:24px 0;">
      <h2 style="margin:0 0 12px;font-size:16px;">Kaufbeleg</h2>
      <table role="presentation" style="width:100%;font-size:13px;color:#333;border-collapse:collapse;">
        <tr><td style="padding:4px 0;color:#666;">Bestell-Nr.</td><td style="padding:4px 0;font-family:'Courier New',monospace;">${orderShortId}</td></tr>
        <tr><td style="padding:4px 0;color:#666;">Datum</td><td style="padding:4px 0;">${formatDate(order.orderDate)}</td></tr>
        <tr><td style="padding:4px 0;color:#666;">Produkt</td><td style="padding:4px 0;">${order.productName} (digitale Lizenz)</td></tr>
        <tr><td style="padding:4px 0;color:#666;">Gesamtbetrag</td><td style="padding:4px 0;font-weight:600;">${formatEur(order.amountTotal)}</td></tr>
        <tr><td style="padding:4px 0;color:#666;">Zahlungsart</td><td style="padding:4px 0;">Stripe (Kreditkarte/SEPA/etc.)</td></tr>
      </table>
      <p style="margin:12px 0 0;font-size:11px;color:#777;line-height:1.5;">
        Gemäß §19 UStG wird keine Umsatzsteuer erhoben und nicht ausgewiesen
        (Kleinunternehmerregelung). Verkäufer:
        <strong>${SELLER.name}</strong>, ${SELLER.street}, ${SELLER.city},
        ${SELLER.country} · ${SELLER.email}.
      </p>
    </div>
  `;

  const winnerBlock = order.isWinner
    ? `<div style="background:#22c55e;color:white;padding:24px;border-radius:12px;margin:24px 0;text-align:center;">
        <h2 style="margin:0 0 8px;">🎉 Dein Kauf wurde erstattet!</h2>
        <p style="margin:0 0 12px;font-size:18px;">Wir haben dir <strong>${formatEur(order.amountTotal)}</strong> als <strong>freiwillige Kulanzleistung</strong> zurückerstattet.</p>
        <p style="margin:0 0 4px;font-size:13px;opacity:0.9;">Dein Produkt behältst du natürlich. Es besteht kein Rechtsanspruch auf Erstattung.</p>
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
        <p style="margin:12px 0 0;font-size:12px;color:#666;">Bewahre diese E-Mail auf — du kannst den Schlüssel jederzeit unter <a href="${appUrl}/bestellstatus">${appUrl}/bestellstatus</a> erneut abrufen (Bestell-Nr. ${orderShortId} + deine E-Mail).</p>
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

  // ---------- Widerrufsbelehrung (Anlage 1 Art. 246a EGBGB) ----------
  // Vorzeitiges Erlöschen bei digitalen Inhalten — bewusst vollständig
  // beigefügt, damit die Bestätigungsmail allein als Vertragsdokument
  // ausreicht.
  const widerrufBlock = `
    <hr style="border:none;border-top:1px solid #e5e5e5;margin:32px 0 16px;"/>
    <div style="font-size:12px;color:#444;line-height:1.6;">
      <h3 style="font-size:14px;margin:0 0 8px;color:#222;">Widerrufsbelehrung</h3>
      <p style="margin:0 0 8px;">
        Sie haben das Recht, binnen vierzehn Tagen ohne Angabe von Gründen
        diesen Vertrag zu widerrufen. Die Widerrufsfrist beträgt vierzehn Tage
        ab dem Tag des Vertragsabschlusses. Um Ihr Widerrufsrecht auszuüben,
        müssen Sie uns (${SELLER.name}, ${SELLER.street}, ${SELLER.city},
        E-Mail: ${SELLER.email}) mittels einer eindeutigen Erklärung über Ihren
        Entschluss, diesen Vertrag zu widerrufen, informieren.
      </p>
      <p style="margin:0 0 8px;background:#fef9c3;border:1px solid #fde68a;border-radius:8px;padding:10px;">
        <strong>Vorzeitiges Erlöschen bei digitalen Inhalten:</strong>
        Das Widerrufsrecht erlischt bei Verträgen zur Lieferung digitaler
        Inhalte, die nicht auf einem körperlichen Datenträger geliefert werden,
        wenn der Unternehmer mit der Ausführung des Vertrags begonnen hat,
        nachdem der Verbraucher (1) ausdrücklich zugestimmt hat, dass mit der
        Ausführung vor Ablauf der Widerrufsfrist begonnen wird, und (2) seine
        Kenntnis davon bestätigt hat, dass er durch seine Zustimmung mit Beginn
        der Ausführung sein Widerrufsrecht verliert (§356 Abs. 5 BGB). Diese
        beiden Bestätigungen hast du im Checkout abgegeben.
      </p>
      <p style="margin:0 0 8px;">
        Vollständige Belehrung inkl. Muster-Widerrufsformular:
        <a href="${appUrl}/widerruf">${appUrl}/widerruf</a>.
      </p>
    </div>
  `;

  return {
    to: order.customerEmail,
    subject: order.isWinner
      ? `🎉 Dein Kauf wurde erstattet — Bestellung ${orderShortId} (1of10)`
      : `Bestellbestätigung — ${order.productName} (${orderShortId})`,
    html: `
      <div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;color:#222;max-width:640px;margin:0 auto;">
        <h1 style="font-size:22px;margin:0 0 8px;">Bestellbestätigung</h1>
        <p style="margin:0 0 16px;font-size:14px;">${greetingName}</p>
        <p style="margin:0 0 16px;font-size:14px;">vielen Dank für deinen Kauf von <strong>${order.productName}</strong>. Hier sind die Details:</p>
        ${receiptBlock}
        ${keyBlock}
        ${vendorBlock}
        ${winnerBlock}
        ${widerrufBlock}
        <p style="font-size:11px;color:#888;margin:24px 0 0;line-height:1.6;">
          Es gelten unsere <a href="${appUrl}/agb">AGB</a>,
          <a href="${appUrl}/datenschutz">Datenschutzerklärung</a> und das
          <a href="${appUrl}/impressum">Impressum</a>.
        </p>
      </div>
    `,
  };
}
