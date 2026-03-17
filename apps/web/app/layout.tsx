import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "1of10 — Wir erstatten jeden 10. Kauf",
    template: "%s | 1of10",
  },
  description:
    "Digitale Produkte kaufen — Software, Tools, Plugins. Als freiwillige Kulanzleistung erstatten wir jeden 10. Kauf vollständig. Sofortige Lieferung per E-Mail.",
  keywords: [
    "Software kaufen",
    "digitale Produkte",
    "Erstattung",
    "1of10",
    "Plugins kaufen",
    "Antivirus kaufen",
    "VPN kaufen",
  ],
  openGraph: {
    title: "1of10 — Wir erstatten jeden 10. Kauf",
    description:
      "Digitale Produkte kaufen. Wir erstatten freiwillig jeden 10. Kauf vollständig — dein Produkt behältst du.",
    type: "website",
    locale: "de_DE",
    siteName: "1of10",
  },
  twitter: {
    card: "summary_large_image",
    title: "1of10 — Wir erstatten jeden 10. Kauf",
    description:
      "Digitale Produkte kaufen. Wir erstatten freiwillig jeden 10. Kauf.",
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

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="de">
      <body className="min-h-screen antialiased">{children}</body>
    </html>
  );
}
