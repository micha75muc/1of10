import { prisma } from "@repo/db";
import { redirect } from "next/navigation";
import CheckoutForm from "./checkout-form";

export const dynamic = "force-dynamic";

interface CheckoutPageProps {
  searchParams: Promise<{ productId?: string }>;
}

export default async function CheckoutPage({ searchParams }: CheckoutPageProps) {
  const { productId } = await searchParams;
  
  if (!productId) {
    redirect("/products");
  }

  const product = await prisma.product.findUnique({
    where: { id: productId },
  });

  if (!product) {
    redirect("/products");
  }

  return (
    <div className="mx-auto max-w-lg py-4">
      {/* Fortschrittsanzeige */}
      <nav aria-label="Checkout-Fortschritt" className="mb-8">
        <ol className="flex items-center justify-between text-sm">
          <li className="flex items-center gap-1.5 text-[var(--primary)]">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[var(--primary)] text-xs font-bold text-[var(--primary-foreground)]">✓</span>
            <span className="font-medium">Produkt gewählt</span>
          </li>
          <li className="mx-2 h-px flex-1 bg-[var(--primary)]" aria-hidden="true" />
          <li className="flex items-center gap-1.5 text-[var(--primary)]">
            <span className="flex h-6 w-6 items-center justify-center rounded-full border-2 border-[var(--primary)] text-xs font-bold text-[var(--primary)]">2</span>
            <span className="font-semibold">Deine Daten</span>
          </li>
          <li className="mx-2 h-px flex-1 bg-[var(--muted)]" aria-hidden="true" />
          <li className="flex items-center gap-1.5 text-[var(--muted-foreground)]">
            <span className="flex h-6 w-6 items-center justify-center rounded-full border-2 border-[var(--muted)] text-xs font-bold">3</span>
            <span>Bezahlung</span>
          </li>
        </ol>
      </nav>

      <h1 className="mb-2 text-3xl font-bold">Checkout</h1>
      <p className="mb-6 text-sm text-[var(--muted-foreground)]">
        Sichere Zahlung über Stripe — Lizenz sofort per E-Mail.
      </p>
      <CheckoutForm
        productId={product.id}
        productName={product.name}
        price={Number(product.sellPrice).toFixed(2)}
      />
      <div className="mt-8 flex flex-wrap items-center justify-center gap-6 text-xs text-[var(--muted-foreground)]">
        <span>🔒 SSL-verschlüsselt</span>
        <span>⚡ Sofort-Download</span>
        <span>✅ 100 % Original</span>
      </div>
    </div>
  );
}
