import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Analytics } from "./components/analytics";
import { CookieBanner } from "./components/cookie-banner";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://1of10.de";

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: {
    default: "1of10 — Wir erstatten jeden 10. Kauf | Digitale Produkte",
    template: "%s | 1of10",
  },
  description:
    "Digitale Produkte kaufen bei 1of10. Als freiwillige Kulanzleistung erstatten wir jeden 10. Kauf vollständig. Norton, McAfee, Bitdefender und mehr — sofort per E-Mail.",
  keywords: [
    "Software kaufen",
    "Software-Lizenzen",
    "digitale Produkte",
    "günstige Software",
    "Erstattung",
    "1of10",
    "Plugins kaufen",
    "Antivirus kaufen",
    "VPN kaufen",
    "Game Keys",
    "Lizenzkeys",
  ],
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "1of10 — Wir erstatten jeden 10. Kauf",
    description:
      "Digitale Produkte kaufen. Wir erstatten freiwillig jeden 10. Kauf vollständig — dein Produkt behältst du. Sofort per E-Mail.",
    type: "website",
    url: BASE_URL,
    locale: "de_DE",
    siteName: "1of10",
    images: [{ url: `${BASE_URL}/og-image.png`, width: 1200, height: 630, alt: "1of10 — Wir erstatten jeden 10. Kauf" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "1of10 — Wir erstatten jeden 10. Kauf",
    description:
      "Digitale Produkte kaufen. Wir erstatten freiwillig jeden 10. Kauf vollständig.",
  },
  robots: {
    index: true,
    follow: true,
  },
  verification: {
    google: "6uEPS0Bxcp2Wz-_Uc3_dpqYBLU5mTEdlgiPS7eZkEzY",
  },
  icons: {
    icon: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
};

const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "1of10",
  url: BASE_URL,
  logo: `${BASE_URL}/logo.png`,
  description:
    "Online-Shop für Software-Lizenzen mit Gamified Refund — jeder 10. Kauf wird erstattet.",
  contactPoint: {
    "@type": "ContactPoint",
    email: "info@medialess.de",
    contactType: "customer service",
    availableLanguage: "German",
  },
  address: {
    "@type": "PostalAddress",
    streetAddress: "Nederlinger Str. 83",
    addressLocality: "München",
    postalCode: "80638",
    addressCountry: "DE",
  },
  foundingDate: "2026",
  founder: {
    "@type": "Person",
    name: "Michael Hahnel",
  },
  sameAs: [],
  keywords: "Software kaufen, Antivirus, VPN, Erstattung, 1of10",
};

const websiteJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "1of10",
  url: BASE_URL,
  description:
    "Software-Lizenzen günstig kaufen. Jeder 10. Kauf wird vollständig erstattet.",
  potentialAction: {
    "@type": "SearchAction",
    target: `${BASE_URL}/products?q={search_term_string}`,
    "query-input": "required name=search_term_string",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="de" className={inter.variable}>
      <body className="min-h-screen font-sans antialiased">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(organizationJsonLd),
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(websiteJsonLd),
          }}
        />
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-lg focus:bg-[var(--primary)] focus:px-4 focus:py-2 focus:text-[var(--primary-foreground)] focus:outline-none"
        >
          Zum Inhalt springen
        </a>
        {children}
        <CookieBanner />
        <Analytics />
      </body>
    </html>
  );
}
