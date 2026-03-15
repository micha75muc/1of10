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
