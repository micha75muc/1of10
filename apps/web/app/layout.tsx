import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "1of10 — Software Licenses",
  description:
    "Buy software licenses with a 10% chance of a full refund. Gamified E-Commerce.",
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
