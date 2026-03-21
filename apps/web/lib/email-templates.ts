/**
 * Professionelle HTML-E-Mail-Templates für 1of10.
 * Inline CSS, table-basiert für maximale Kompatibilität.
 */

interface OrderData {
  productName: string;
  amount: string;
  orderId: string;
  customerEmail: string;
}

const HEADER = `
<table width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;margin:0 auto;font-family:Arial,Helvetica,sans-serif;background:#ffffff;border:1px solid #e5e7eb;border-radius:8px;overflow:hidden;">
  <tr>
    <td style="background:#6d28d9;padding:24px 32px;text-align:center;">
      <h1 style="color:#ffffff;margin:0;font-size:24px;font-weight:700;">1of10</h1>
      <p style="color:#c4b5fd;margin:4px 0 0;font-size:12px;">Jeder 10. Kauf ist kostenlos</p>
    </td>
  </tr>`;

const FOOTER = `
  <tr>
    <td style="padding:24px 32px;background:#f9fafb;border-top:1px solid #e5e7eb;text-align:center;">
      <p style="margin:0;font-size:11px;color:#9ca3af;">
        1of10 · Michael Hahnel · Medialess<br/>
        <a href="https://1of10.de/impressum" style="color:#6d28d9;">Impressum</a> · 
        <a href="https://1of10.de/datenschutz" style="color:#6d28d9;">Datenschutz</a> · 
        <a href="https://1of10.de/widerruf" style="color:#6d28d9;">Widerruf</a>
      </p>
      <p style="margin:8px 0 0;font-size:10px;color:#d1d5db;">
        Gem. §19 UStG wird keine Umsatzsteuer erhoben.
      </p>
    </td>
  </tr>
</table>`;

export function orderConfirmationTemplate(data: OrderData): string {
  return `${HEADER}
  <tr>
    <td style="padding:32px;">
      <h2 style="margin:0 0 16px;font-size:20px;color:#111;">Danke für deine Bestellung!</h2>
      <p style="margin:0 0 24px;color:#6b7280;font-size:14px;line-height:1.6;">
        Dein Lizenzschlüssel wird in Kürze per E-Mail zugestellt.
      </p>
      <table width="100%" cellpadding="0" cellspacing="0" style="background:#f9fafb;border-radius:8px;padding:16px;">
        <tr><td style="padding:8px 16px;font-size:13px;color:#6b7280;">Produkt</td><td style="padding:8px 16px;font-size:13px;font-weight:600;">${data.productName}</td></tr>
        <tr><td style="padding:8px 16px;font-size:13px;color:#6b7280;">Betrag</td><td style="padding:8px 16px;font-size:13px;font-weight:600;">${data.amount} €</td></tr>
        <tr><td style="padding:8px 16px;font-size:13px;color:#6b7280;">Bestell-Nr.</td><td style="padding:8px 16px;font-size:13px;font-weight:600;">${data.orderId}</td></tr>
      </table>
      <p style="margin:24px 0 0;padding:16px;background:#fffbeb;border-radius:8px;font-size:12px;color:#92400e;border:1px solid #fde68a;">
        ⚖️ <strong>Hinweis:</strong> Gemäß BGB §356 Abs. 5 hast du beim Kauf dem Widerrufsverzicht für digitale Inhalte zugestimmt. Nach Lieferung des Lizenzschlüssels ist ein Widerruf ausgeschlossen.
      </p>
    </td>
  </tr>
${FOOTER}`;
}

export function winnerNotificationTemplate(data: OrderData): string {
  return `${HEADER}
  <tr>
    <td style="padding:32px;text-align:center;">
      <div style="font-size:48px;margin-bottom:16px;">🎉</div>
      <h2 style="margin:0 0 8px;font-size:24px;color:#111;">Herzlichen Glückwunsch!</h2>
      <p style="margin:0 0 24px;color:#6d28d9;font-size:16px;font-weight:600;">
        Dein Kauf wird vollständig erstattet!
      </p>
      <table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f3ff;border-radius:8px;padding:16px;text-align:left;">
        <tr><td style="padding:8px 16px;font-size:13px;color:#6b7280;">Produkt</td><td style="padding:8px 16px;font-size:13px;font-weight:600;">${data.productName}</td></tr>
        <tr><td style="padding:8px 16px;font-size:13px;color:#6b7280;">Erstattung</td><td style="padding:8px 16px;font-size:16px;font-weight:700;color:#059669;">${data.amount} €</td></tr>
      </table>
      <p style="margin:24px 0 0;font-size:13px;color:#6b7280;line-height:1.6;">
        Die Erstattung wird innerhalb von 5–10 Werktagen auf deine ursprüngliche Zahlungsmethode gutgeschrieben. Du musst nichts tun.
      </p>
      <p style="margin:24px 0 0;font-size:13px;color:#6b7280;">
        Du behältst dein Produkt natürlich — die Lizenz gehört dir. 🎁
      </p>
    </td>
  </tr>
${FOOTER}`;
}

export function refundConfirmationTemplate(data: OrderData): string {
  return `${HEADER}
  <tr>
    <td style="padding:32px;">
      <h2 style="margin:0 0 16px;font-size:20px;color:#111;">Erstattung veranlasst</h2>
      <p style="margin:0 0 24px;color:#6b7280;font-size:14px;line-height:1.6;">
        Wir haben die Erstattung für deine Bestellung veranlasst.
      </p>
      <table width="100%" cellpadding="0" cellspacing="0" style="background:#ecfdf5;border-radius:8px;padding:16px;">
        <tr><td style="padding:8px 16px;font-size:13px;color:#6b7280;">Produkt</td><td style="padding:8px 16px;font-size:13px;font-weight:600;">${data.productName}</td></tr>
        <tr><td style="padding:8px 16px;font-size:13px;color:#6b7280;">Erstattungsbetrag</td><td style="padding:8px 16px;font-size:16px;font-weight:700;color:#059669;">${data.amount} €</td></tr>
        <tr><td style="padding:8px 16px;font-size:13px;color:#6b7280;">Zeitrahmen</td><td style="padding:8px 16px;font-size:13px;">5–10 Werktage</td></tr>
      </table>
      <p style="margin:24px 0 0;font-size:13px;color:#6b7280;">
        Bei Fragen erreichst du uns unter info@medialess.de.
      </p>
    </td>
  </tr>
${FOOTER}`;
}
