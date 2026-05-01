import { getOrderBySessionId } from "../../../../lib/services/orders";
import Link from "next/link";
import { Trophy, CheckCircle, Mail, UserPlus, KeyRound } from "lucide-react";
import { OrderPending } from "./order-pending";
import { ResendButton } from "./resend-button";

export const dynamic = "force-dynamic";

interface SuccessPageProps {
  searchParams: Promise<{ session_id?: string }>;
}

export default async function SuccessPage({ searchParams }: SuccessPageProps) {
  const { session_id } = await searchParams;

  if (!session_id) {
    return (
      <div className="mx-auto max-w-md py-8 text-center">
        <div className="mb-6 text-5xl" aria-hidden="true">🤔</div>
        <h1 className="mb-3 text-2xl font-bold">Keine Bestellung in dieser URL</h1>
        <p className="mb-6 text-sm text-[var(--muted-foreground)]">
          Du bist auf der Bestätigungsseite gelandet, aber wir können hier
          keine Bestellung zuordnen.
        </p>
        <div className="mb-6 rounded-xl border bg-[var(--card)] p-5 text-left text-sm">
          <p className="mb-2 font-semibold">Wenn du gerade bezahlt hast:</p>
          <p className="text-[var(--muted-foreground)]">
            Die Bestätigungsmail kommt innerhalb der nächsten Minuten — bitte
            auch im Spam-Ordner nachsehen. Mit der Session-ID aus der Mail
            kannst du den Status hier prüfen:
          </p>
        </div>
        <div className="flex flex-wrap justify-center gap-3">
          <Link
            href="/bestellstatus"
            className="rounded-lg bg-[var(--primary)] px-5 py-2.5 text-sm font-semibold text-[var(--primary-foreground)] hover:opacity-90"
          >
            Bestellstatus prüfen
          </Link>
          <Link
            href="/products"
            className="rounded-lg border px-5 py-2.5 text-sm font-medium hover:bg-[var(--secondary)]"
          >
            Zurück zum Shop
          </Link>
        </div>
      </div>
    );
  }

  const order = await getOrderBySessionId(session_id);

  if (!order) {
    return <OrderPending />;
  }

  return (
    <div className="mx-auto max-w-lg py-4">
      {order.isWinner ? (
        <>
        {/* Confetti animation for winners */}
        <div className="winner-confetti" aria-hidden="true" />
        <div className="mb-8 rounded-xl border-2 border-[var(--gold)] bg-[var(--gold)]/10 p-8 text-center animate-slide-in">
          <div className="mb-4"><Trophy className="h-16 w-16 mx-auto text-[var(--gold)]" /></div>
          <h1 className="mb-2 text-3xl font-extrabold text-[var(--gold)]">
            Kaufpreis wird erstattet!
          </h1>
          <p className="text-lg">
            Du bist einer von 10 — der volle Kaufpreis von{" "}
            <span className="font-bold text-[var(--gold)]">
              {Number(order.amountTotal).toFixed(2).replace(".", ",")} €
            </span>{" "}
            wird dir automatisch zurückerstattet.
          </p>
          <p className="mt-3 text-sm text-[var(--muted-foreground)]">
            Erstattungsstatus:{" "}
            <span className="font-medium text-[var(--primary)]">
              {order.refundStatus === "COMPLETED"
                ? "Abgeschlossen"
                : order.refundStatus === "INITIATED"
                  ? "Wird verarbeitet"
                  : order.refundStatus}
            </span>
          </p>
          <p className="mt-3 rounded-lg border border-[var(--gold)]/40 bg-white/40 px-3 py-2 text-xs text-[var(--muted-foreground)]">
            <strong className="text-[var(--foreground)]">Hinweis:</strong> Die
            Erstattung ist eine <strong>freiwillige Kulanzleistung</strong> —
            kein Rechtsanspruch, kein Gewinnspiel. Dein Produkt behältst du in
            jedem Fall.
          </p>
          {/* Share buttons for viral loop */}
          <div className="mt-6 space-y-2">
            <p className="text-sm text-[var(--muted-foreground)]">Erzähl es weiter:</p>
            <div className="flex justify-center gap-3">
              <a
                href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(`Gerade ${order.product.name} bei 1of10.de gekauft und den vollen Kaufpreis zurückbekommen! Die erstatten wirklich jeden 10. Kauf. 🎉`)}&url=${encodeURIComponent("https://1of10.de")}`}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-lg bg-[#1DA1F2] px-4 py-2 text-sm font-medium text-white hover:opacity-90 transition"
              >
                𝕏 Teilen
              </a>
              <a
                href={`https://wa.me/?text=${encodeURIComponent(`Gerade ${order.product.name} bei 1of10.de gekauft und Geld zurückbekommen! 🎉 https://1of10.de`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-lg bg-[#25D366] px-4 py-2 text-sm font-medium text-white hover:opacity-90 transition"
              >
                WhatsApp
              </a>
            </div>
          </div>
        </div>
        </>
      ) : (
        <div className="mb-8 rounded-xl border bg-[var(--card)] p-8 text-center">
          <div className="mb-4"><CheckCircle className="h-16 w-16 mx-auto text-[var(--success)]" /></div>
          <h1 className="mb-2 text-3xl font-bold">Bestellung bestätigt!</h1>
          <p className="text-[var(--muted-foreground)]">
            Deine Lizenz wurde erfolgreich erworben. Diesmal keine
            Kaufpreiserstattung — aber bei deinem nächsten Kauf hast du wieder
            eine 10&nbsp;% Chance!
          </p>
        </div>
      )}

      {/* License Delivery Info */}
      <div className="mb-6 rounded-xl border border-[var(--primary)]/30 bg-[var(--primary)]/5 p-6">
        <div className="flex items-start gap-4">
          <span className="text-2xl">📧</span>
          <div>
            <p className="font-semibold text-[var(--primary)]">
              Bestellbestätigung gesendet
            </p>
            <p className="text-sm text-[var(--muted-foreground)]">
              Eine Bestätigung wurde an{" "}
              <span className="font-medium text-[var(--foreground)]">
                {order.customerEmail}
              </span>{" "}
              gesendet. Dein Lizenzschlüssel wird in Kürze separat zugestellt.
              Prüfe ggf. deinen Spam-Ordner.
            </p>
          </div>
        </div>
      </div>

      {/* Vendor Activation Explainer (Trend Micro, AVG, Norton, …) */}
      {order.product.requiresVendorAccount && (
        <div className="mb-6 rounded-xl border border-[var(--brand-blue)]/30 bg-[var(--brand-blue)]/5 p-6">
          <h2 className="mb-1 font-semibold text-[var(--foreground)]">
            So aktivierst du deine Lizenz
          </h2>
          <p className="mb-5 text-sm text-[var(--muted-foreground)]">
            {order.product.vendorName ?? "Der Hersteller"} verlangt für die
            Aktivierung ein kostenloses Konto — das ist bei
            Antiviren-Software branchenüblich und dauert ca. 2 Minuten.
          </p>
          <ol className="space-y-3 text-sm">
            <li className="flex items-start gap-3">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[var(--brand-blue)]/15 text-[var(--brand-blue)]">
                <Mail className="h-4 w-4" />
              </span>
              <div>
                <strong>1. E-Mail von My-ESD prüfen.</strong>{" "}
                <span className="text-[var(--muted-foreground)]">
                  Du bekommst gleich ein Lizenzzertifikat (PDF) mit deinem
                  20-stelligen Aktivierungs-Code. Absender: noreply@my-esd.com.
                </span>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[var(--brand-blue)]/15 text-[var(--brand-blue)]">
                <UserPlus className="h-4 w-4" />
              </span>
              <div>
                <strong>
                  2. Kostenloses {order.product.vendorName ?? "Hersteller"}-Konto
                  anlegen.
                </strong>{" "}
                <span className="text-[var(--muted-foreground)]">
                  Über den Link in der E-Mail oder direkt unten — keine
                  zusätzlichen Kosten, keine Abo-Falle.
                </span>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[var(--brand-blue)]/15 text-[var(--brand-blue)]">
                <KeyRound className="h-4 w-4" />
              </span>
              <div>
                <strong>3. Aktivierungs-Code eingeben.</strong>{" "}
                <span className="text-[var(--muted-foreground)]">
                  Software wird heruntergeladen und automatisch lizenziert.
                </span>
              </div>
            </li>
          </ol>
          {order.product.vendorActivationUrl && (
            <a
              href={order.product.vendorActivationUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-5 inline-flex items-center gap-2 rounded-lg bg-[var(--brand-blue)] px-4 py-2 text-sm font-semibold text-white hover:opacity-90 transition"
            >
              Zur Aktivierungsseite von {order.product.vendorName ?? "Hersteller"}
              <span aria-hidden="true">↗</span>
            </a>
          )}
        </div>
      )}

      {/* Order Details */}
      <div className="rounded-xl border bg-[var(--card)] p-6 space-y-3">
        <h2 className="font-semibold">Bestelldetails</h2>
        <div className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-2 text-sm">
          <span className="text-[var(--muted-foreground)]">Produkt</span>
          <span>{order.product.name}</span>
          <span className="text-[var(--muted-foreground)]">Betrag</span>
          <span className="font-semibold">
            {Number(order.amountTotal).toFixed(2).replace(".", ",")} €
          </span>
          <span className="text-[var(--muted-foreground)]">Status</span>
          <span>
            {order.status === "PAID"
              ? "Bezahlt ✓"
              : order.status === "REFUNDED"
                ? "Erstattet ✓"
                : order.status}
          </span>
          <span className="text-[var(--muted-foreground)]">E-Mail</span>
          <span>{order.customerEmail}</span>
          <span className="text-[var(--muted-foreground)]">Session-ID</span>
          <span className="font-mono text-xs break-all" title="Bei Support-Kontakt bitte angeben">
            {order.stripeSessionId}
          </span>
        </div>
      </div>

      {/* Resend Confirmation Email */}
      <div className="mt-4 rounded-xl border border-[var(--secondary)] bg-[var(--secondary)]/30 p-4 text-sm">
        <div className="mb-2 flex items-center gap-2 font-medium">
          <span aria-hidden="true">📧</span> Bestätigungsmail nicht angekommen?
        </div>
        <p className="mb-3 text-xs text-[var(--muted-foreground)]">
          Wir können sie an{" "}
          <span className="font-medium text-[var(--foreground)]">
            {order.customerEmail}
          </span>{" "}
          erneut zustellen. Prüfe vorher bitte deinen Spam-Ordner.
        </p>
        <ResendButton orderId={order.id} sessionId={order.stripeSessionId} />
      </div>

      <div className="mt-6 text-center">
        <Link
          href="/products"
          className="rounded-xl bg-[var(--primary)] px-8 py-3 font-semibold text-[var(--primary-foreground)] hover:opacity-90 transition inline-block"
        >
          Weiter einkaufen
        </Link>
      </div>

      <p className="mt-4 text-xs text-center text-[var(--muted-foreground)]">
        Gemäß deiner Zustimmung zum Widerrufsverzicht nach BGB §356 Abs. 5 ist
        ein Widerruf für digitale Inhalte ausgeschlossen.
      </p>
    </div>
  );
}
