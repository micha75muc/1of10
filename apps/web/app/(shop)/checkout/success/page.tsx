import { prisma } from "@repo/db";
import Link from "next/link";
import { Trophy, CheckCircle } from "lucide-react";
import { OrderPending } from "./order-pending";

export const dynamic = "force-dynamic";

interface SuccessPageProps {
  searchParams: Promise<{ session_id?: string }>;
}

export default async function SuccessPage({ searchParams }: SuccessPageProps) {
  const { session_id } = await searchParams;

  if (!session_id) {
    return (
      <div className="mx-auto max-w-md text-center">
        <h1 className="mb-4 text-3xl font-bold">Bestellung</h1>
        <p className="text-[var(--muted-foreground)]">
          Keine Session-ID gefunden.
        </p>
        <Link href="/products" className="mt-4 inline-block underline">
          Zurück zum Shop
        </Link>
      </div>
    );
  }

  const order = await prisma.order.findUnique({
    where: { stripeSessionId: session_id },
    include: { product: true },
  });

  if (!order) {
    return <OrderPending />;
  }

  return (
    <div className="mx-auto max-w-lg py-4">
      {order.isWinner ? (
        <>
        {/* Bea: Confetti animation for winners */}
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
          {/* Bea: Share buttons for viral loop */}
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
        </div>
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
