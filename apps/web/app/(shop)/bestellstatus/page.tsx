import { prisma } from "@repo/db";
import Link from "next/link";
import type { Metadata } from "next";
import { CheckCircle, AlertCircle, Mail, Search } from "lucide-react";
import { ResendButton } from "../checkout/success/resend-button";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Bestellstatus prüfen",
  description:
    "Lizenzschlüssel und Bestellstatus prüfen — gib deine Session-ID und E-Mail ein. Du findest die Session-ID in deiner Bestätigungsmail.",
  alternates: { canonical: "/bestellstatus" },
  robots: { index: false, follow: false },
};

interface PageProps {
  searchParams: Promise<{ session_id?: string; email?: string }>;
}

export default async function BestellstatusPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const sessionId = params.session_id?.trim();
  const email = params.email?.trim().toLowerCase();

  // Nichts eingegeben → Lookup-Form mit hilfreichen Hinweisen
  if (!sessionId || !email) {
    return <LookupForm />;
  }

  const order = await prisma.order.findUnique({
    where: { stripeSessionId: sessionId },
    include: { product: { select: { name: true, requiresVendorAccount: true, vendorName: true, vendorActivationUrl: true } } },
  });

  // Wir bestätigen NIE, ob eine Session-ID existiert, bevor die E-Mail passt
  // (sonst wäre das Endpoint ein Order-ID-Enumerator). Bei Mismatch zeigen wir
  // beide Fälle generisch.
  if (!order || order.customerEmail.toLowerCase() !== email) {
    return (
      <div className="mx-auto max-w-md py-8">
        <div className="mb-6 rounded-xl border border-[var(--destructive)]/30 bg-[var(--destructive)]/5 p-6">
          <div className="mb-2 flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-[var(--destructive)]" aria-hidden="true" />
            <h1 className="text-xl font-bold">Keine Bestellung gefunden</h1>
          </div>
          <p className="text-sm text-[var(--muted-foreground)]">
            Wir konnten zu dieser Kombination aus Session-ID und E-Mail keine
            Bestellung finden. Mögliche Gründe:
          </p>
          <ul className="mt-3 list-disc pl-5 text-sm text-[var(--muted-foreground)] space-y-1">
            <li>Die Session-ID enthält einen Tippfehler.</li>
            <li>Die E-Mail-Adresse weicht von der genutzten Bestell-Adresse ab.</li>
            <li>Die Bestellung wurde noch nicht abgeschlossen — bitte ein paar Minuten warten.</li>
          </ul>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link
            href="/bestellstatus"
            className="rounded-lg border px-4 py-2 text-sm font-medium hover:bg-[var(--secondary)]"
          >
            Erneut prüfen
          </Link>
          <a
            href="mailto:info@medialess.de?subject=Bestellung%20nicht%20gefunden"
            className="rounded-lg bg-[var(--primary)] px-4 py-2 text-sm font-medium text-[var(--primary-foreground)] hover:opacity-90"
          >
            Support kontaktieren
          </a>
        </div>
      </div>
    );
  }

  const isPending = order.status !== "DELIVERED" && !order.licenseKey;

  return (
    <div className="mx-auto max-w-lg py-8">
      <h1 className="mb-2 text-2xl font-bold">Bestellstatus</h1>
      <p className="mb-6 text-sm text-[var(--muted-foreground)]">
        Bestellung vom{" "}
        {new Intl.DateTimeFormat("de-DE", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
        }).format(order.createdAt)}
      </p>

      <div className="mb-6 rounded-xl border bg-[var(--card)] p-6 space-y-3">
        <h2 className="font-semibold">Bestelldetails</h2>
        <div className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-2 text-sm">
          <span className="text-[var(--muted-foreground)]">Produkt</span>
          <span>{order.product.name}</span>
          <span className="text-[var(--muted-foreground)]">Status</span>
          <span>
            {order.status === "DELIVERED" ? (
              <span className="inline-flex items-center gap-1 text-[var(--success)]">
                <CheckCircle className="h-4 w-4" aria-hidden="true" /> Geliefert
              </span>
            ) : (
              order.status
            )}
          </span>
          <span className="text-[var(--muted-foreground)]">Betrag</span>
          <span className="font-semibold">
            {Number(order.amountTotal).toFixed(2).replace(".", ",")}&nbsp;€
          </span>
        </div>
      </div>

      {isPending ? (
        <div className="mb-6 rounded-xl border border-[var(--primary)]/30 bg-[var(--primary)]/5 p-6">
          <p className="text-sm">
            Deine Bestellung wird gerade verarbeitet. Der Lizenzschlüssel wird
            in Kürze per E-Mail zugestellt — meistens innerhalb weniger Minuten.
          </p>
          <p className="mt-2 text-xs text-[var(--muted-foreground)]">
            Bitte prüfe deinen Spam-Ordner. Falls nach 30 Minuten keine Mail
            angekommen ist:{" "}
            <a href="mailto:info@medialess.de" className="underline">
              info@medialess.de
            </a>
          </p>
        </div>
      ) : (
        order.licenseKey && (
          <div className="mb-6 rounded-xl border bg-[var(--card)] p-6">
            <h2 className="mb-3 font-semibold">🔑 Dein Lizenzschlüssel</h2>
            <div className="rounded-lg bg-[#0f172a] p-4 text-center font-mono text-base text-[#f8fafc] tracking-wider break-all">
              {order.licenseKey}
            </div>
            {order.product.requiresVendorAccount && order.product.vendorActivationUrl && (
              <a
                href={order.product.vendorActivationUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 inline-flex items-center gap-2 rounded-lg bg-[var(--brand-blue)] px-4 py-2 text-sm font-semibold text-white hover:opacity-90"
              >
                Zur {order.product.vendorName ?? "Hersteller"}-Aktivierungsseite ↗
              </a>
            )}
          </div>
        )
      )}

      <div className="rounded-xl border border-[var(--secondary)] bg-[var(--secondary)]/30 p-4 text-sm">
        <div className="mb-2 flex items-center gap-2 font-medium">
          <Mail className="h-4 w-4" aria-hidden="true" /> Bestätigungsmail erneut senden
        </div>
        <p className="mb-3 text-xs text-[var(--muted-foreground)]">
          Mail nicht angekommen oder versehentlich gelöscht? Wir können sie an{" "}
          <span className="font-medium text-[var(--foreground)]">
            {order.customerEmail}
          </span>{" "}
          erneut zustellen.
        </p>
        <ResendButton orderId={order.id} sessionId={sessionId} />
      </div>
    </div>
  );
}

function LookupForm() {
  return (
    <div className="mx-auto max-w-md py-8">
      <h1 className="mb-2 text-2xl font-bold">Bestellstatus prüfen</h1>
      <p className="mb-6 text-sm text-[var(--muted-foreground)]">
        Gib deine Session-ID und die E-Mail-Adresse aus deiner Bestätigungsmail
        ein, um den Status deiner Bestellung und deinen Lizenzschlüssel zu sehen.
      </p>

      <form method="GET" action="/bestellstatus" className="space-y-4">
        <div>
          <label htmlFor="bs-session-id" className="block mb-1.5 text-sm font-medium">
            Session-ID <span className="text-[var(--destructive)]">*</span>
          </label>
          <input
            id="bs-session-id"
            name="session_id"
            type="text"
            required
            placeholder="cs_test_… oder cs_live_…"
            autoComplete="off"
            className="w-full rounded-lg border px-4 py-2 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-[var(--ring)]"
            aria-describedby="bs-session-help"
          />
          <p id="bs-session-help" className="mt-1 text-xs text-[var(--muted-foreground)]">
            Die Session-ID steht in deiner Bestätigungsmail unter den
            Bestelldetails. Sie beginnt mit <code>cs_</code>.
          </p>
        </div>

        <div>
          <label htmlFor="bs-email" className="block mb-1.5 text-sm font-medium">
            E-Mail-Adresse <span className="text-[var(--destructive)]">*</span>
          </label>
          <input
            id="bs-email"
            name="email"
            type="email"
            required
            placeholder="deine@email.de"
            autoComplete="email"
            className="w-full rounded-lg border px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[var(--ring)]"
          />
        </div>

        <button
          type="submit"
          className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-[var(--primary)] px-6 py-3 font-semibold text-[var(--primary-foreground)] hover:opacity-90 transition"
        >
          <Search className="h-4 w-4" aria-hidden="true" />
          Bestellung suchen
        </button>
      </form>

      <div className="mt-8 rounded-xl border bg-[var(--card)] p-4 text-xs text-[var(--muted-foreground)]">
        <p className="mb-1 font-medium text-[var(--foreground)]">
          Mail nicht mehr da, Session-ID unbekannt?
        </p>
        <p>
          Schreib uns mit deiner Bestell-E-Mail an{" "}
          <a href="mailto:info@medialess.de" className="underline">
            info@medialess.de
          </a>{" "}
          — wir helfen dir innerhalb eines Werktags.
        </p>
      </div>
    </div>
  );
}
