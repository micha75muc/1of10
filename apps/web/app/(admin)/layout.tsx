import Link from "next/link";
import { redirect } from "next/navigation";
import { verifySession } from "../../lib/auth";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Sven (Security): Admin-Bereich nur mit gültiger Session zugänglich
  const isLoggedIn = await verifySession();
  if (!isLoggedIn) {
    redirect("/admin/login");
  }

  return (
    <div className="min-h-screen">
      <header className="border-b bg-[var(--muted)] px-6 py-4">
        <nav className="mx-auto flex max-w-5xl items-center justify-between">
          <Link href="/admin" className="text-xl font-bold">
            1of10 Admin
          </Link>
          <div className="flex gap-6">
            <Link href="/admin" className="hover:underline">
              Dashboard
            </Link>
            <Link href="/admin/orders" className="hover:underline">
              Bestellungen
            </Link>
            <Link href="/admin/approvals" className="hover:underline">
              Approvals
            </Link>
            <Link
              href="/"
              className="text-[var(--muted-foreground)] hover:underline"
            >
              ← Shop
            </Link>
          </div>
        </nav>
      </header>
      <main className="mx-auto max-w-5xl p-6">{children}</main>
    </div>
  );
}
