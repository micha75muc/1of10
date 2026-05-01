import Link from "next/link";
import { Logo } from "../components/logo";
import { MobileNav } from "../components/mobile-nav";
import { Mail, Phone } from "lucide-react";

export default function ShopLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col">
      {/* Quiet top strip — Apple-style fine-print row, no gold flood. */}
      <div className="border-b border-[var(--border)] bg-[var(--secondary)] text-center py-2 px-4">
        <span className="text-[13px] text-[var(--foreground)]">
          <span className="text-[var(--gold)]">●</span>{" "}
          <span className="font-medium">Wir erstatten jeden 10. Kauf</span>
          <span className="text-[var(--muted-foreground)]"> — freiwillige Kulanzleistung.</span>
        </span>
      </div>

      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-[var(--border)] bg-[var(--background)]/85 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex h-14 items-center justify-between">
          <div className="flex items-center">
            <Link href="/" className="mr-8 hover:opacity-80 transition">
              <Logo size="md" />
            </Link>
            <nav className="hidden md:flex items-center gap-7 text-[13px] font-medium">
              <Link href="/products" className="text-[var(--foreground)]/85 hover:text-[var(--foreground)] transition-colors">Shop</Link>
              <Link href="/blog" className="text-[var(--foreground)]/85 hover:text-[var(--foreground)] transition-colors">Ratgeber</Link>
              <Link href="/transparenz" className="text-[var(--foreground)]/85 hover:text-[var(--foreground)] transition-colors">Transparenz</Link>
            </nav>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/products"
              className="hidden md:inline-flex items-center gap-2 rounded-full bg-[var(--primary)] px-4 py-1.5 text-[13px] font-medium text-[var(--primary-foreground)] hover:opacity-90 transition"
            >
              Jetzt einkaufen
            </Link>
            <MobileNav />
          </div>
        </div>
      </header>

      <main id="main-content" className="mx-auto w-full max-w-7xl flex-1 px-4 sm:px-6 lg:px-8 py-6">{children}</main>

      {/* Footer */}
      <footer className="border-t border-[var(--border)] bg-[var(--secondary)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <Link href="/" className="inline-flex items-center gap-2 mb-4">
                <Logo size="md" />
              </Link>
              <p className="text-sm text-[var(--muted-foreground)] leading-relaxed">
                Autorisierte Software-Keys mit sofortiger Lieferung. Als freiwillige Kulanz erstatten wir jeden zehnten Kauf.
              </p>
            </div>
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-[0.08em] mb-4 text-[var(--muted-foreground)]">Shop</h3>
              <ul className="space-y-3">
                <li><Link href="/products" className="text-sm text-[var(--foreground)] hover:underline underline-offset-4">Alle Produkte</Link></li>
                <li><Link href="/blog" className="text-sm text-[var(--foreground)] hover:underline underline-offset-4">Ratgeber</Link></li>
                <li><Link href="/transparenz" className="text-sm text-[var(--foreground)] hover:underline underline-offset-4">Transparenz</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-[0.08em] mb-4 text-[var(--muted-foreground)]">Rechtliches</h3>
              <ul className="space-y-3">
                <li><Link href="/impressum" className="text-sm text-[var(--foreground)] hover:underline underline-offset-4">Impressum</Link></li>
                <li><Link href="/datenschutz" className="text-sm text-[var(--foreground)] hover:underline underline-offset-4">Datenschutz</Link></li>
                <li><Link href="/agb" className="text-sm text-[var(--foreground)] hover:underline underline-offset-4">AGB</Link></li>
                <li><Link href="/widerruf" className="text-sm text-[var(--foreground)] hover:underline underline-offset-4">Widerruf</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-[0.08em] mb-4 text-[var(--muted-foreground)]">Kontakt</h3>
              <ul className="space-y-3">
                <li className="flex items-center text-sm text-[var(--foreground)]">
                  <Mail className="h-4 w-4 mr-2 shrink-0" />
                  info@medialess.de
                </li>
                <li className="flex items-center text-sm text-[var(--foreground)]">
                  <Phone className="h-4 w-4 mr-2 shrink-0" />
                  0152 25389619
                </li>
              </ul>
            </div>
          </div>
          <div className="mt-12 border-t border-[var(--border)] pt-6 flex flex-col sm:flex-row justify-between items-center gap-4">
            <p className="text-xs text-[var(--muted-foreground)]">
              © {new Date().getFullYear()} 1of10 · München
            </p>
            <p className="text-xs text-[var(--muted-foreground)]">
              Endpreise · gem. §19 UStG keine USt.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
