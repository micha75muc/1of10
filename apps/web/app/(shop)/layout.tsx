import Link from "next/link";
import { Logo } from "../components/logo";
import { MobileNav } from "../components/mobile-nav";
import { Gift, Mail, Phone } from "lucide-react";

export default function ShopLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col">
      {/* USP Banner */}
      <div className="bg-[var(--gold)]/10 border-b border-[var(--gold)]/20 text-center py-2.5 px-4">
        <Gift className="inline-block h-4 w-4 mr-1.5 -mt-0.5 text-[var(--gold)]" />
        <span className="text-sm font-medium">Wir erstatten jeden 10. Kauf</span>
        <span className="text-sm text-[var(--foreground)]/60"> — freiwillige Kulanzleistung</span>
      </div>

      {/* Header */}
      <header className="sticky top-0 z-50 border-b bg-[var(--background)]/95 backdrop-blur supports-[backdrop-filter]:bg-[var(--background)]/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex h-16 items-center justify-between">
          <div className="flex items-center">
            <Link href="/" className="mr-8 hover:opacity-90 transition">
              <Logo size="md" />
            </Link>
            <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
              <Link href="/products" className="text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors">Produkte</Link>
              <Link href="/blog" className="text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors">Ratgeber</Link>
              <Link href="/transparenz" className="text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors">Transparenz</Link>
            </nav>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/products"
              className="hidden md:inline-flex items-center gap-2 rounded-lg bg-[var(--foreground)] px-4 py-2 text-sm font-medium text-[var(--primary-foreground)] hover:opacity-90 transition"
            >
              Jetzt einkaufen
            </Link>
            <MobileNav />
          </div>
        </div>
      </header>

      <main id="main-content" className="mx-auto w-full max-w-7xl flex-1 px-4 sm:px-6 lg:px-8 py-6">{children}</main>

      {/* Footer */}
      <footer className="border-t bg-[var(--foreground)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <Link href="/" className="inline-flex items-center gap-2 mb-4">
                <span className="text-xl font-extrabold text-[var(--primary-foreground)]">
                  <span className="opacity-60">1</span>of<span>10</span>
                </span>
              </Link>
              <p className="text-sm text-[var(--primary-foreground)]/60 leading-relaxed">
                Autorisierte Software-Keys mit sofortiger Lieferung. Als freiwillige Kulanz erstatten wir jeden zehnten Kauf.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold mb-4 text-[var(--primary-foreground)]/70">Shop</h3>
              <ul className="space-y-3">
                <li><Link href="/products" className="text-sm text-[var(--primary-foreground)]/60 hover:text-[var(--primary-foreground)] transition-colors">Alle Produkte</Link></li>
                <li><Link href="/blog" className="text-sm text-[var(--primary-foreground)]/60 hover:text-[var(--primary-foreground)] transition-colors">Ratgeber</Link></li>
                <li><Link href="/transparenz" className="text-sm text-[var(--primary-foreground)]/60 hover:text-[var(--primary-foreground)] transition-colors">Transparenz</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-semibold mb-4 text-[var(--primary-foreground)]/70">Rechtliches</h3>
              <ul className="space-y-3">
                <li><Link href="/impressum" className="text-sm text-[var(--primary-foreground)]/60 hover:text-[var(--primary-foreground)] transition-colors">Impressum</Link></li>
                <li><Link href="/datenschutz" className="text-sm text-[var(--primary-foreground)]/60 hover:text-[var(--primary-foreground)] transition-colors">Datenschutz</Link></li>
                <li><Link href="/agb" className="text-sm text-[var(--primary-foreground)]/60 hover:text-[var(--primary-foreground)] transition-colors">AGB</Link></li>
                <li><Link href="/widerruf" className="text-sm text-[var(--primary-foreground)]/60 hover:text-[var(--primary-foreground)] transition-colors">Widerruf</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-semibold mb-4 text-[var(--primary-foreground)]/70">Kontakt</h3>
              <ul className="space-y-3">
                <li className="flex items-center text-sm text-[var(--primary-foreground)]/60">
                  <Mail className="h-4 w-4 mr-2 shrink-0" />
                  info@medialess.de
                </li>
                <li className="flex items-center text-sm text-[var(--primary-foreground)]/60">
                  <Phone className="h-4 w-4 mr-2 shrink-0" />
                  0152 25389619
                </li>
              </ul>
            </div>
          </div>
          <div className="mt-10 border-t border-[var(--primary-foreground)]/10 pt-8 flex flex-col sm:flex-row justify-between items-center gap-4">
            <p className="text-xs text-[var(--primary-foreground)]/60">
              © {new Date().getFullYear()} 1of10 · Michael Hahnel · München
            </p>
            <div className="flex items-center gap-4">
              <a href="https://de.trustpilot.com/review/1of10.de" target="_blank" rel="noopener noreferrer" className="text-xs text-[var(--primary-foreground)]/60 hover:text-[var(--primary-foreground)] transition-colors flex items-center gap-1">
                ★ Trustpilot
              </a>
              <p className="text-xs text-[var(--primary-foreground)]/60">
                Alle Preise Endpreise · gem. §19 UStG keine USt.
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
