import { PrismaClient } from "@prisma/client";
import { createHash } from "crypto";

const prisma = new PrismaClient();

// PREISE: costPrice = DSD-Netto × 1.21 (Brutto inkl. 21% NL-MwSt)
// Kleinunternehmer §19 UStG — kein Vorsteuerabzug, MwSt ist echte Kostenposition.
// uvpPrice = offizielle Hersteller-UVP (wenn bekannt)
// stockLevel: 50 (grün/günstig), 30 (gelb/mittel), 20 (rot/premium)

interface SeedProduct {
  sku: string;
  name: string;
  description: string;
  category: string;
  brand: string;
  costPrice: number;
  sellPrice: number;
  uvpPrice?: number;
  stockLevel: number;
}

const products: SeedProduct[] = [
  // =====================================================================
  // McAFEE — Internet Security (Legacy, kein UVP)
  // =====================================================================
  { sku: "MCAFEE-IS-1PC-1Y", name: "McAfee Internet Security 1 PC 1 Jahr", category: "Internet Security", brand: "McAfee", costPrice: 3.93, sellPrice: 9.99, stockLevel: 50, description: "Grundlegender Schutz vor Viren und Online-Bedrohungen für 1 PC." },
  { sku: "MCAFEE-IS-3PC-1Y", name: "McAfee Internet Security 3 PC 1 Jahr", category: "Internet Security", brand: "McAfee", costPrice: 5.08, sellPrice: 12.99, stockLevel: 50, description: "Schutz für 3 PCs vor Viren, Malware und Phishing." },
  { sku: "MCAFEE-IS-10D-1Y", name: "McAfee Internet Security 10 Geräte 1 Jahr", category: "Internet Security", brand: "McAfee", costPrice: 5.93, sellPrice: 14.99, stockLevel: 50, description: "Bis zu 10 Geräte schützen mit McAfees Internet-Security-Suite." },
  // McAfee — Total Protection
  { sku: "MCAFEE-TP-1PC-1Y", name: "McAfee Total Protection 1 PC 1 Jahr", category: "Total Security", brand: "McAfee", costPrice: 12.10, sellPrice: 17.99, uvpPrice: 109.95, stockLevel: 50, description: "Umfassender Schutz mit Antivirus, VPN und Identitätsschutz für 1 PC." },
  { sku: "MCAFEE-TP-3PC-1Y", name: "McAfee Total Protection 3 PC 1 Jahr", category: "Total Security", brand: "McAfee", costPrice: 12.10, sellPrice: 17.99, uvpPrice: 109.95, stockLevel: 50, description: "Antivirus, VPN und Identitätsschutz für 3 PCs." },
  { sku: "MCAFEE-TP-UNL-1Y", name: "McAfee Total Protection Unbegrenzte Geräte 1 Jahr", category: "Total Security", brand: "McAfee", costPrice: 19.36, sellPrice: 26.99, uvpPrice: 129.95, stockLevel: 30, description: "Schützen Sie alle Geräte ohne Limit. Antivirus, VPN und Identitätsschutz." },
  { sku: "MCAFEE-LIVESAFE-UNL-1Y", name: "McAfee LiveSafe Unbegrenzte Geräte 1 Jahr", category: "Total Security", brand: "McAfee", costPrice: 19.36, sellPrice: 29.99, uvpPrice: 129.95, stockLevel: 30, description: "Premium-Komplettschutz für unbegrenzte Geräte mit VPN und sicherem Speicher." },

  // =====================================================================
  // NORTON — 360 Suite + AntiTrack + VPN
  // =====================================================================
  { sku: "NORTON-ANTITRACK-1D-1Y", name: "Norton AntiTrack 1 Gerät 1 Jahr", category: "Utilities", brand: "Norton", costPrice: 3.63, sellPrice: 9.99, uvpPrice: 29.99, stockLevel: 50, description: "Schützt Ihre Privatsphäre — verhindert Tracking und Fingerprinting beim Surfen." },
  { sku: "NORTON-ANTITRACK-3D-1Y", name: "Norton AntiTrack 3 Geräte 1 Jahr", category: "Utilities", brand: "Norton", costPrice: 6.66, sellPrice: 14.99, uvpPrice: 39.99, stockLevel: 50, description: "Anti-Tracking-Schutz für 3 Geräte — Privatsphäre beim Surfen bewahren." },
  { sku: "NORTON-VPN-5D-1Y", name: "Norton VPN Privacy 5 Geräte 1 Jahr", category: "VPN", brand: "Norton", costPrice: 6.66, sellPrice: 12.99, uvpPrice: 39.99, stockLevel: 50, description: "Sicheres, anonymes Surfen auf bis zu 5 Geräten mit Norton VPN." },
  { sku: "NORTON-360-DLX-VPN-3D-1Y", name: "Norton 360 Deluxe + VPN 3 Geräte 1 Jahr", category: "Total Security", brand: "Norton", costPrice: 16.13, sellPrice: 22.99, uvpPrice: 109.99, stockLevel: 50, description: "Norton 360 Deluxe mit integriertem VPN — Schutz und Privatsphäre für 3 Geräte." },
  { sku: "NORTON-360-PREM-5D-1Y", name: "Norton 360 Premium 5 Geräte 1 Jahr", category: "Total Security", brand: "Norton", costPrice: 18.15, sellPrice: 24.99, uvpPrice: 139.99, stockLevel: 50, description: "Norton Premium-Schutz für 5 Geräte mit VPN, Cloud-Backup und Kindersicherung." },
  { sku: "NORTON-360-DLX-3D-1Y", name: "Norton 360 Deluxe 3 Geräte 1 Jahr", category: "Total Security", brand: "Norton", costPrice: 20.57, sellPrice: 27.99, uvpPrice: 109.99, stockLevel: 50, description: "VPN, Passwort-Manager, Kindersicherung und 25 GB Cloud-Backup für 3 Geräte." },
  { sku: "NORTON-360-DLX-5D-1Y", name: "Norton 360 Deluxe 5 Geräte 1 Jahr", category: "Total Security", brand: "Norton", costPrice: 22.99, sellPrice: 30.99, uvpPrice: 109.99, stockLevel: 30, description: "Bis zu 5 Geräte schützen mit VPN, Passwort-Manager und 50 GB Cloud-Backup." },
  { sku: "NORTON-360-PREM-10D-SUB-1Y", name: "Norton 360 Premium 10 Geräte 1 Jahr (Abo)", category: "Total Security", brand: "Norton", costPrice: 24.20, sellPrice: 32.99, uvpPrice: 139.99, stockLevel: 30, description: "Premium-Schutz für 10 Geräte als Abo-Lizenz. VPN und Kindersicherung inklusive." },
  { sku: "NORTON-360-PREM-10D-1Y", name: "Norton 360 Premium 10 Geräte 1 Jahr", category: "Total Security", brand: "Norton", costPrice: 26.62, sellPrice: 34.99, uvpPrice: 139.99, stockLevel: 30, description: "Schutz für bis zu 10 Geräte mit 75 GB Cloud-Backup und Kindersicherung." },

  // =====================================================================
  // AVG — Antivirus, Internet Security, TuneUp, Ultimate
  // =====================================================================
  { sku: "AVG-TUNEUP-3D-1Y", name: "AVG TuneUp 3 Geräte 1 Jahr", category: "Utilities", brand: "AVG", costPrice: 3.63, sellPrice: 9.99, stockLevel: 50, description: "PC-Optimierung: automatische Wartung, Bereinigung und Beschleunigung für 3 Geräte." },
  { sku: "AVG-TUNEUP-10D-1Y", name: "AVG TuneUp 10 Geräte 1 Jahr", category: "Utilities", brand: "AVG", costPrice: 6.66, sellPrice: 14.99, stockLevel: 50, description: "PC-Optimierung für 10 Geräte — mehr Speicherplatz und bessere Performance." },
  { sku: "AVG-AV-3PC-1Y", name: "AVG Antivirus 3 PC 1 Jahr", category: "Antivirus", brand: "AVG", costPrice: 14.39, sellPrice: 19.99, stockLevel: 50, description: "Zuverlässiger Virenschutz für 3 PCs mit Echtzeit-Erkennung." },
  { sku: "AVG-IS-1PC-1Y", name: "AVG Internet Security 1 PC 1 Jahr", category: "Internet Security", brand: "AVG", costPrice: 14.11, sellPrice: 19.99, stockLevel: 50, description: "Erweiterter Schutz vor Viren, Ransomware und Phishing für 1 PC." },
  { sku: "AVG-AV-5PC-1Y", name: "AVG Antivirus 5 PC 1 Jahr", category: "Antivirus", brand: "AVG", costPrice: 18.45, sellPrice: 24.99, stockLevel: 50, description: "Antivirus-Schutz für 5 PCs — Echtzeit-Erkennung und Web-Schutz." },
  { sku: "AVG-IS-3PC-1Y", name: "AVG Internet Security 3 PC 1 Jahr", category: "Internet Security", brand: "AVG", costPrice: 17.36, sellPrice: 24.99, stockLevel: 50, description: "Internet Security für 3 PCs — Firewall, E-Mail-Schutz und Anti-Ransomware." },
  { sku: "AVG-ULTIMATE-1PC-1Y", name: "AVG Ultimate 1 PC 1 Jahr", category: "Total Security", brand: "AVG", costPrice: 20.62, sellPrice: 27.99, stockLevel: 30, description: "Komplett-Paket: Internet Security + TuneUp + VPN für 1 PC." },
  { sku: "AVG-IS-5PC-1Y", name: "AVG Internet Security 5 PC 1 Jahr", category: "Internet Security", brand: "AVG", costPrice: 23.32, sellPrice: 29.99, stockLevel: 30, description: "Internet Security für 5 PCs — Firewall, Anti-Ransomware und Web-Schutz." },
  { sku: "AVG-IS-1PC-2Y", name: "AVG Internet Security 1 PC 2 Jahre", category: "Internet Security", brand: "AVG", costPrice: 28.22, sellPrice: 36.99, stockLevel: 30, description: "2 Jahre Schutz für 1 PC — günstiger als jährliche Verlängerung." },
  { sku: "AVG-ULTIMATE-3PC-1Y", name: "AVG Ultimate 3 PC 1 Jahr", category: "Total Security", brand: "AVG", costPrice: 30.39, sellPrice: 39.99, stockLevel: 30, description: "Komplett-Paket: Internet Security + TuneUp + VPN für 3 PCs." },
  { sku: "AVG-IS-3PC-2Y", name: "AVG Internet Security 3 PC 2 Jahre", category: "Internet Security", brand: "AVG", costPrice: 33.79, sellPrice: 42.99, stockLevel: 20, description: "2 Jahre Internet Security für 3 PCs — langfristiger Schutz." },
  { sku: "AVG-IS-10PC-1Y", name: "AVG Internet Security 10 PC 1 Jahr", category: "Internet Security", brand: "AVG", costPrice: 33.37, sellPrice: 42.99, stockLevel: 20, description: "Internet Security für 10 PCs — ideal für Familien und Kleinbüros." },
  { sku: "AVG-ULTIMATE-5PC-1Y", name: "AVG Ultimate 5 PC 1 Jahr", category: "Total Security", brand: "AVG", costPrice: 37.36, sellPrice: 46.99, stockLevel: 20, description: "Komplett-Paket mit VPN, TuneUp und Internet Security für 5 PCs." },
  { sku: "AVG-ULTIMATE-10PC-1Y", name: "AVG Ultimate 10 PC 1 Jahr", category: "Total Security", brand: "AVG", costPrice: 45.27, sellPrice: 55.99, stockLevel: 20, description: "Das ultimative Paket für 10 PCs — Security, VPN und Performance." },

  // =====================================================================
  // AVAST — Premium Security + Ultimate
  // =====================================================================
  { sku: "AVAST-PREM-1PC-1Y", name: "Avast Premium Security 1 PC 1 Jahr", category: "Internet Security", brand: "Avast", costPrice: 14.52, sellPrice: 22.99, uvpPrice: 72.99, stockLevel: 50, description: "Premium-Schutz für 1 PC — Antivirus, Firewall und Ransomware-Schutz." },
  { sku: "AVAST-PREM-3D-1Y", name: "Avast Premium Security 3 Geräte 1 Jahr", category: "Internet Security", brand: "Avast", costPrice: 20.57, sellPrice: 27.99, uvpPrice: 72.99, stockLevel: 30, description: "Premium-Schutz für 3 Geräte — plattformübergreifend." },
  { sku: "AVAST-PREM-2D-2Y", name: "Avast Premium Security 2 Geräte 2 Jahre", category: "Internet Security", brand: "Avast", costPrice: 20.57, sellPrice: 27.99, stockLevel: 30, description: "2 Jahre Premium-Schutz für 2 Geräte — langfristiger Schutz." },
  { sku: "AVAST-PREM-10D-1Y", name: "Avast Premium Security 10 Geräte 1 Jahr", category: "Internet Security", brand: "Avast", costPrice: 29.04, sellPrice: 37.99, uvpPrice: 72.99, stockLevel: 20, description: "Premium-Schutz für 10 Geräte — ideal für Familien." },
  { sku: "AVAST-ULTIMATE-1PC-1Y", name: "Avast Ultimate 1 PC 1 Jahr", category: "Total Security", brand: "Avast", costPrice: 29.04, sellPrice: 37.99, uvpPrice: 104.99, stockLevel: 20, description: "Komplett-Paket: Premium Security + VPN + Cleanup + AntiTrack." },

  // =====================================================================
  // PANDA — Dome Essential, Advanced, Complete
  // =====================================================================
  { sku: "PANDA-ESS-1PC-OEM-1Y", name: "Panda Dome Essential 1 PC 1 Jahr (OEM)", category: "Antivirus", brand: "Panda", costPrice: 8.46, sellPrice: 14.99, uvpPrice: 36.99, stockLevel: 50, description: "Basis-Virenschutz für 1 PC — leichtgewichtig und effektiv." },
  { sku: "PANDA-ESS-1PC-1Y", name: "Panda Dome Essential 1 PC 1 Jahr", category: "Antivirus", brand: "Panda", costPrice: 9.98, sellPrice: 16.99, uvpPrice: 36.99, stockLevel: 50, description: "Antivirus-Grundschutz für 1 PC mit Echtzeit-Erkennung." },
  { sku: "PANDA-ADV-1PC-OEM-1Y", name: "Panda Dome Advanced 1 PC 1 Jahr (OEM)", category: "Internet Security", brand: "Panda", costPrice: 10.88, sellPrice: 16.99, uvpPrice: 49.99, stockLevel: 50, description: "Erweiterter Schutz mit Anti-Ransomware und Kindersicherung." },
  { sku: "PANDA-COMP-1PC-OEM-1Y", name: "Panda Dome Complete 1 PC 1 Jahr (OEM)", category: "Total Security", brand: "Panda", costPrice: 11.80, sellPrice: 17.99, uvpPrice: 74.99, stockLevel: 50, description: "Komplett-Schutz mit VPN, Passwort-Manager und Dateiverschlüsselung." },
  { sku: "PANDA-ESS-3PC-OEM-1Y", name: "Panda Dome Essential 3 PC 1 Jahr (OEM)", category: "Antivirus", brand: "Panda", costPrice: 12.09, sellPrice: 17.99, uvpPrice: 36.99, stockLevel: 50, description: "Basis-Virenschutz für 3 PCs — OEM-Lizenz." },
  { sku: "PANDA-ADV-3PC-OEM-1Y", name: "Panda Dome Advanced 3 PC 1 Jahr (OEM)", category: "Internet Security", brand: "Panda", costPrice: 13.30, sellPrice: 19.99, uvpPrice: 49.99, stockLevel: 50, description: "Erweiterter Schutz für 3 PCs mit Anti-Ransomware und Kindersicherung." },
  { sku: "PANDA-ADV-1PC-1Y", name: "Panda Dome Advanced 1 PC 1 Jahr", category: "Internet Security", brand: "Panda", costPrice: 14.97, sellPrice: 22.99, uvpPrice: 49.99, stockLevel: 50, description: "Erweiterter Schutz für 1 PC mit Anti-Ransomware und Kindersicherung." },
  { sku: "PANDA-COMP-3PC-OEM-1Y", name: "Panda Dome Complete 3 PC 1 Jahr (OEM)", category: "Total Security", brand: "Panda", costPrice: 18.09, sellPrice: 24.99, uvpPrice: 74.99, stockLevel: 50, description: "Komplett-Schutz für 3 PCs — OEM-Lizenz." },
  { sku: "PANDA-ESS-3PC-1Y", name: "Panda Dome Essential 3 PC 1 Jahr", category: "Antivirus", brand: "Panda", costPrice: 17.48, sellPrice: 24.99, uvpPrice: 36.99, stockLevel: 30, description: "Antivirus-Grundschutz für 3 PCs." },
  { sku: "PANDA-ESS-5PC-1Y", name: "Panda Dome Essential 5 PC 1 Jahr", category: "Antivirus", brand: "Panda", costPrice: 19.98, sellPrice: 26.99, stockLevel: 30, description: "Antivirus-Grundschutz für 5 PCs — ideal für Familien." },
  { sku: "PANDA-COMP-1PC-1Y", name: "Panda Dome Complete 1 PC 1 Jahr", category: "Total Security", brand: "Panda", costPrice: 19.98, sellPrice: 26.99, uvpPrice: 74.99, stockLevel: 30, description: "Komplett-Schutz mit VPN, Passwort-Manager und Datei-Verschlüsselung." },
  { sku: "PANDA-ADV-3PC-1Y", name: "Panda Dome Advanced 3 PC 1 Jahr", category: "Internet Security", brand: "Panda", costPrice: 24.97, sellPrice: 32.99, uvpPrice: 49.99, stockLevel: 30, description: "Erweiterter Schutz für 3 PCs mit Anti-Ransomware." },
  { sku: "PANDA-ADV-5PC-1Y", name: "Panda Dome Advanced 5 PC 1 Jahr", category: "Internet Security", brand: "Panda", costPrice: 27.47, sellPrice: 34.99, uvpPrice: 49.99, stockLevel: 30, description: "Erweiterter Schutz für 5 PCs." },
  { sku: "PANDA-ESS-10PC-1Y", name: "Panda Dome Essential 10 PC 1 Jahr", category: "Antivirus", brand: "Panda", costPrice: 29.98, sellPrice: 39.99, stockLevel: 20, description: "Antivirus-Grundschutz für 10 PCs." },
  { sku: "PANDA-COMP-5PC-1Y", name: "Panda Dome Complete 5 PC 1 Jahr", category: "Total Security", brand: "Panda", costPrice: 37.47, sellPrice: 46.99, uvpPrice: 74.99, stockLevel: 20, description: "Komplett-Schutz für 5 PCs mit VPN und Verschlüsselung." },
  { sku: "PANDA-ADV-10PC-1Y", name: "Panda Dome Advanced 10 PC 1 Jahr", category: "Internet Security", brand: "Panda", costPrice: 41.70, sellPrice: 52.99, stockLevel: 20, description: "Erweiterter Schutz für 10 PCs." },

  // =====================================================================
  // BITDEFENDER — Antivirus Plus, Internet Security, Total Security, Mac
  // =====================================================================
  { sku: "BITDEF-AV-1PC-OEM-1Y", name: "Bitdefender Antivirus Plus 1 PC 1 Jahr (OEM)", category: "Antivirus", brand: "Bitdefender", costPrice: 11.98, sellPrice: 17.99, uvpPrice: 39.99, stockLevel: 50, description: "Leistungsstarker Virenschutz für 1 PC — OEM-Lizenz." },
  { sku: "BITDEF-IS-1PC-OEM-1Y", name: "Bitdefender Internet Security 1 PC 1 Jahr (OEM)", category: "Internet Security", brand: "Bitdefender", costPrice: 18.03, sellPrice: 24.99, uvpPrice: 49.99, stockLevel: 50, description: "Internet Security mit Firewall und Kindersicherung — OEM-Lizenz." },
  { sku: "BITDEF-AV-1PC-1Y", name: "Bitdefender Antivirus Plus 1 PC 1 Jahr", category: "Antivirus", brand: "Bitdefender", costPrice: 21.00, sellPrice: 27.99, uvpPrice: 39.99, stockLevel: 30, description: "Preisgekrönter Virenschutz — leicht, schnell und zuverlässig." },
  { sku: "BITDEF-AV-MAC-1M-1Y", name: "Bitdefender Antivirus für Mac 1 Mac 1 Jahr", category: "Mac", brand: "Bitdefender", costPrice: 27.99, sellPrice: 36.99, stockLevel: 30, description: "Virenschutz speziell für macOS — Echtzeit-Schutz und Adware-Erkennung." },
  { sku: "BITDEF-AV-3PC-1Y", name: "Bitdefender Antivirus Plus 3 PC 1 Jahr", category: "Antivirus", brand: "Bitdefender", costPrice: 27.99, sellPrice: 36.99, uvpPrice: 49.99, stockLevel: 30, description: "Preisgekrönter Virenschutz für 3 PCs." },
  { sku: "BITDEF-AV-1PC-2Y", name: "Bitdefender Antivirus Plus 1 PC 2 Jahre", category: "Antivirus", brand: "Bitdefender", costPrice: 34.99, sellPrice: 44.99, stockLevel: 20, description: "2 Jahre Virenschutz für 1 PC — günstiger als jährliche Verlängerung." },
  { sku: "BITDEF-IS-1PC-1Y", name: "Bitdefender Internet Security 1 PC 1 Jahr", category: "Internet Security", brand: "Bitdefender", costPrice: 34.99, sellPrice: 44.99, uvpPrice: 49.99, stockLevel: 20, description: "Umfassender Schutz mit Firewall, Kindersicherung und Anti-Spam." },
  { sku: "BITDEF-AV-5PC-1Y", name: "Bitdefender Antivirus Plus 5 PC 1 Jahr", category: "Antivirus", brand: "Bitdefender", costPrice: 38.50, sellPrice: 47.99, stockLevel: 20, description: "Virenschutz für 5 PCs — ideal für Familien." },
  { sku: "BITDEF-AV-MAC-3M-1Y", name: "Bitdefender Antivirus für Mac 3 Mac 1 Jahr", category: "Mac", brand: "Bitdefender", costPrice: 41.99, sellPrice: 52.99, stockLevel: 20, description: "Mac-Virenschutz für 3 Macs — Echtzeit-Schutz und Web-Filter." },
  { sku: "BITDEF-IS-3PC-1Y", name: "Bitdefender Internet Security 3 PC 1 Jahr", category: "Internet Security", brand: "Bitdefender", costPrice: 45.49, sellPrice: 56.99, uvpPrice: 69.99, stockLevel: 20, description: "Internet Security für 3 PCs — Firewall, Anti-Ransomware und Kindersicherung." },
  { sku: "BITDEF-TS-5D-1Y", name: "Bitdefender Total Security 5 Geräte 1 Jahr", category: "Total Security", brand: "Bitdefender", costPrice: 47.19, sellPrice: 57.99, uvpPrice: 94.99, stockLevel: 20, description: "Plattformübergreifender Schutz für 5 Geräte — Windows, Mac, Android, iOS." },
  { sku: "BITDEF-AV-3PC-2Y", name: "Bitdefender Antivirus Plus 3 PC 2 Jahre", category: "Antivirus", brand: "Bitdefender", costPrice: 48.99, sellPrice: 59.99, stockLevel: 20, description: "2 Jahre Virenschutz für 3 PCs." },
  { sku: "BITDEF-AV-MAC-1M-2Y", name: "Bitdefender Antivirus für Mac 1 Mac 2 Jahre", category: "Mac", brand: "Bitdefender", costPrice: 48.43, sellPrice: 59.99, stockLevel: 20, description: "2 Jahre Mac-Virenschutz — langfristiger Schutz." },
  { sku: "BITDEF-IS-1PC-2Y", name: "Bitdefender Internet Security 1 PC 2 Jahre", category: "Internet Security", brand: "Bitdefender", costPrice: 55.99, sellPrice: 69.99, stockLevel: 20, description: "2 Jahre Internet Security für 1 PC." },
  { sku: "BITDEF-IS-5PC-1Y", name: "Bitdefender Internet Security 5 PC 1 Jahr", category: "Internet Security", brand: "Bitdefender", costPrice: 60.19, sellPrice: 74.99, stockLevel: 20, description: "Internet Security für 5 PCs — Firewall und Anti-Ransomware." },
  { sku: "BITDEF-TS-10D-1Y", name: "Bitdefender Total Security 10 Geräte 1 Jahr", category: "Total Security", brand: "Bitdefender", costPrice: 66.50, sellPrice: 79.99, uvpPrice: 94.99, stockLevel: 20, description: "Plattformübergreifender Schutz für 10 Geräte." },
  { sku: "BITDEF-AV-5PC-2Y", name: "Bitdefender Antivirus Plus 5 PC 2 Jahre", category: "Antivirus", brand: "Bitdefender", costPrice: 59.49, sellPrice: 74.99, stockLevel: 20, description: "2 Jahre Virenschutz für 5 PCs." },
  { sku: "BITDEF-IS-3PC-2Y", name: "Bitdefender Internet Security 3 PC 2 Jahre", category: "Internet Security", brand: "Bitdefender", costPrice: 69.99, sellPrice: 84.99, stockLevel: 20, description: "2 Jahre Internet Security für 3 PCs." },
  { sku: "BITDEF-FAMILY-15D-1Y", name: "Bitdefender Family Pack 15 Geräte 1 Jahr", category: "Total Security", brand: "Bitdefender", costPrice: 68.25, sellPrice: 84.99, uvpPrice: 124.99, stockLevel: 20, description: "Familien-Schutz für bis zu 15 Geräte — alle Plattformen." },
  { sku: "BITDEF-AV-MAC-4M-1Y", name: "Bitdefender Antivirus für Mac 4 Mac 1 Jahr", category: "Mac", brand: "Bitdefender", costPrice: 54.74, sellPrice: 69.99, stockLevel: 20, description: "Mac-Virenschutz für 4 Macs." },
  { sku: "BITDEF-IS-5PC-2Y", name: "Bitdefender Internet Security 5 PC 2 Jahre", category: "Internet Security", brand: "Bitdefender", costPrice: 76.99, sellPrice: 94.99, stockLevel: 20, description: "2 Jahre Internet Security für 5 PCs." },
  { sku: "BITDEF-TS-5D-2Y", name: "Bitdefender Total Security 5 Geräte 2 Jahre", category: "Total Security", brand: "Bitdefender", costPrice: 90.99, sellPrice: 109.99, uvpPrice: 94.99, stockLevel: 20, description: "2 Jahre plattformübergreifender Schutz für 5 Geräte." },
  { sku: "BITDEF-TS-10D-2Y", name: "Bitdefender Total Security 10 Geräte 2 Jahre", category: "Total Security", brand: "Bitdefender", costPrice: 104.99, sellPrice: 129.99, uvpPrice: 94.99, stockLevel: 20, description: "2 Jahre plattformübergreifender Schutz für 10 Geräte." },
  { sku: "BITDEF-FAMILY-15D-2Y", name: "Bitdefender Family Pack 15 Geräte 2 Jahre", category: "Total Security", brand: "Bitdefender", costPrice: 110.50, sellPrice: 134.99, uvpPrice: 124.99, stockLevel: 20, description: "2 Jahre Familien-Schutz für 15 Geräte." },

  // =====================================================================
  // ESET — NOD32, Internet Security, Smart Security, Security Plus/Pack
  // =====================================================================
  { sku: "ESET-NOD32-3D-1Y", name: "ESET NOD32 Antivirus 3 Geräte 1 Jahr", category: "Antivirus", brand: "ESET", costPrice: 22.34, sellPrice: 29.99, uvpPrice: 59.99, stockLevel: 30, description: "Leichtgewichtiger Virenschutz für 3 Geräte — ressourcenschonend." },
  { sku: "ESET-IS-3D-1Y", name: "ESET Internet Security 3 Geräte 1 Jahr", category: "Internet Security", brand: "ESET", costPrice: 33.83, sellPrice: 42.99, stockLevel: 30, description: "Internet Security für 3 Geräte — Banking-Schutz und Anti-Phishing." },
  { sku: "ESET-SMARTSEC-3D-1Y", name: "ESET Smart Security Premium 3 Geräte 1 Jahr", category: "Total Security", brand: "ESET", costPrice: 41.33, sellPrice: 52.99, uvpPrice: 79.99, stockLevel: 20, description: "Premium-Schutz mit Passwort-Manager und Dateiverschlüsselung." },
  { sku: "ESET-SECPACK-3D-1Y", name: "ESET Security Pack 3 Geräte 1 Jahr", category: "Total Security", brand: "ESET", costPrice: 49.01, sellPrice: 62.99, stockLevel: 20, description: "Erweitertes Security-Paket für 3 Geräte mit MFS-Lizenz." },
  { sku: "ESET-SECPLUS-3D-1Y", name: "ESET Security Plus 3 Geräte 1 Jahr", category: "Total Security", brand: "ESET", costPrice: 49.52, sellPrice: 62.99, stockLevel: 20, description: "Security Plus für 3 Geräte — erweiterte Sicherheitsfunktionen." },
  { sku: "ESET-SECPLUS-5D-1Y", name: "ESET Security Plus 5 Geräte 1 Jahr", category: "Total Security", brand: "ESET", costPrice: 52.48, sellPrice: 67.99, stockLevel: 20, description: "Security Plus für 5 Geräte — umfassender Schutz." },

  // =====================================================================
  // KASPERSKY — Safe Kids
  // =====================================================================
  { sku: "KASP-SAFEKIDS-1U-1Y", name: "Kaspersky Safe Kids 1 User 1 Jahr", category: "Utilities", brand: "Kaspersky", costPrice: 13.19, sellPrice: 18.99, stockLevel: 50, description: "Kindersicherung: Standort-Tracking, App-Kontrolle und Bildschirmzeit-Management." },

  // =====================================================================
  // G DATA — Antivirus, Internet Security, Total Security
  // =====================================================================
  { sku: "GDATA-AV-1PC-1Y", name: "G Data Antivirus 1 PC 1 Jahr", category: "Antivirus", brand: "G Data", costPrice: 21.89, sellPrice: 29.99, uvpPrice: 29.95, stockLevel: 30, description: "Deutscher Virenschutz — doppelte Scan-Engine für maximale Erkennung." },
  { sku: "GDATA-AV-3PC-1Y", name: "G Data Antivirus 3 PC 1 Jahr", category: "Antivirus", brand: "G Data", costPrice: 33.53, sellPrice: 42.99, stockLevel: 20, description: "Virenschutz made in Germany für 3 PCs." },
  { sku: "GDATA-AV-5PC-1Y", name: "G Data Antivirus 5 PC 1 Jahr", category: "Antivirus", brand: "G Data", costPrice: 43.77, sellPrice: 54.99, stockLevel: 20, description: "Virenschutz für 5 PCs — doppelte Scan-Engine." },
  { sku: "GDATA-AV-1PC-2Y", name: "G Data Antivirus 1 PC 2 Jahre", category: "Antivirus", brand: "G Data", costPrice: 33.53, sellPrice: 42.99, stockLevel: 20, description: "2 Jahre Virenschutz für 1 PC — günstiger als jährlich." },
  { sku: "GDATA-IS-1PC-1Y", name: "G Data Internet Security 1 PC 1 Jahr", category: "Internet Security", brand: "G Data", costPrice: 33.53, sellPrice: 42.99, uvpPrice: 39.95, stockLevel: 20, description: "Internet Security made in Germany — Firewall und Banking-Schutz." },
  { sku: "GDATA-IS-3PC-1Y", name: "G Data Internet Security 3 PC 1 Jahr", category: "Internet Security", brand: "G Data", costPrice: 43.77, sellPrice: 54.99, stockLevel: 20, description: "Internet Security für 3 PCs — Firewall und Kindersicherung." },
  { sku: "GDATA-IS-5PC-1Y", name: "G Data Internet Security 5 PC 1 Jahr", category: "Internet Security", brand: "G Data", costPrice: 55.41, sellPrice: 69.99, stockLevel: 20, description: "Internet Security für 5 PCs." },
  { sku: "GDATA-TS-1PC-1Y", name: "G Data Total Security 1 PC 1 Jahr", category: "Total Security", brand: "G Data", costPrice: 43.77, sellPrice: 54.99, uvpPrice: 49.95, stockLevel: 20, description: "Komplett-Schutz mit Backup, Verschlüsselung und Kindersicherung." },
  { sku: "GDATA-TS-3PC-1Y", name: "G Data Total Security 3 PC 1 Jahr", category: "Total Security", brand: "G Data", costPrice: 55.41, sellPrice: 69.99, stockLevel: 20, description: "Komplett-Schutz für 3 PCs." },
  { sku: "GDATA-TS-5PC-1Y", name: "G Data Total Security 5 PC 1 Jahr", category: "Total Security", brand: "G Data", costPrice: 64.94, sellPrice: 79.99, stockLevel: 20, description: "Komplett-Schutz für 5 PCs." },
  { sku: "GDATA-IS-1PC-2Y", name: "G Data Internet Security 1 PC 2 Jahre", category: "Internet Security", brand: "G Data", costPrice: 50.67, sellPrice: 64.99, stockLevel: 20, description: "2 Jahre Internet Security für 1 PC." },
  { sku: "GDATA-AV-MAC-1M-1Y", name: "G Data Antivirus Mac 1 Mac 1 Jahr", category: "Mac", brand: "G Data", costPrice: 33.53, sellPrice: 42.99, stockLevel: 20, description: "Virenschutz made in Germany für macOS." },

  // =====================================================================
  // TREND MICRO — Internet Security, Maximum Security
  // =====================================================================
  { sku: "TREND-IS-1PC-1Y", name: "Trend Micro Internet Security 1 PC 1 Jahr", category: "Internet Security", brand: "Trend Micro", costPrice: 20.31, sellPrice: 27.99, stockLevel: 30, description: "Internet Security mit KI-gestützter Malware-Erkennung." },
  { sku: "TREND-MAXSEC-3PC-2Y", name: "Trend Micro Maximum Security 3 PC 2 Jahre", category: "Total Security", brand: "Trend Micro", costPrice: 32.52, sellPrice: 41.99, stockLevel: 30, description: "2 Jahre Maximum Security für 3 PCs — plattformübergreifend." },
  { sku: "TREND-MAXSEC-5PC-1Y", name: "Trend Micro Maximum Security 5 PC 1 Jahr", category: "Total Security", brand: "Trend Micro", costPrice: 36.59, sellPrice: 45.99, stockLevel: 20, description: "Maximum Security für 5 PCs — KI-gestützter Schutz." },
  { sku: "TREND-MAXSEC-5PC-3Y", name: "Trend Micro Maximum Security 5 PC 3 Jahre", category: "Total Security", brand: "Trend Micro", costPrice: 70.48, sellPrice: 84.99, stockLevel: 20, description: "3 Jahre Maximum Security für 5 PCs — langfristiger Schutz." },

  // =====================================================================
  // F-SECURE — VPN, Internet Security, Safe, Total Security
  // =====================================================================
  { sku: "FSEC-VPN-1D-1Y", name: "F-Secure VPN 1 Gerät 1 Jahr", category: "VPN", brand: "F-Secure", costPrice: 20.93, sellPrice: 27.99, uvpPrice: 29.99, stockLevel: 30, description: "Privatsphäre beim Surfen — verschlüsselte Verbindung für 1 Gerät." },
  { sku: "FSEC-IS-1PC-1Y", name: "F-Secure Internet Security 1 PC 1 Jahr", category: "Internet Security", brand: "F-Secure", costPrice: 34.93, sellPrice: 44.99, uvpPrice: 49.99, stockLevel: 20, description: "Finnischer Virenschutz — Banking-Schutz und Anti-Ransomware." },
  { sku: "FSEC-VPN-3D-1Y", name: "F-Secure VPN 3 Geräte 1 Jahr", category: "VPN", brand: "F-Secure", costPrice: 34.93, sellPrice: 44.99, stockLevel: 20, description: "VPN-Schutz für 3 Geräte — privat und anonym surfen." },
  { sku: "FSEC-VPN-5D-1Y", name: "F-Secure VPN 5 Geräte 1 Jahr", category: "VPN", brand: "F-Secure", costPrice: 41.93, sellPrice: 54.99, stockLevel: 20, description: "VPN-Schutz für 5 Geräte — Familie und Haushalt schützen." },
  { sku: "FSEC-SAFE-5D-1Y", name: "F-Secure Safe 5 Geräte 1 Jahr", category: "Internet Security", brand: "F-Secure", costPrice: 48.40, sellPrice: 59.99, uvpPrice: 69.99, stockLevel: 20, description: "Umfassender Schutz für 5 Geräte — Browsing- und Banking-Schutz." },
  { sku: "FSEC-TOTAL-3D-1Y", name: "F-Secure Total Security + OnTrack 3 Geräte 1 Jahr", category: "Total Security", brand: "F-Secure", costPrice: 55.93, sellPrice: 69.99, stockLevel: 20, description: "Komplettschutz mit Identity-Monitoring für 3 Geräte." },

  // =====================================================================
  // MICROSOFT — Office, Windows
  // =====================================================================
  { sku: "MS-OFFICE-HS-2021", name: "Microsoft Office Home & Student 2021", category: "Office", brand: "Microsoft", costPrice: 102.85, sellPrice: 124.99, uvpPrice: 149.00, stockLevel: 20, description: "Word, Excel und PowerPoint als Dauerlizenz. Einmalkauf, kein Abo." },
  { sku: "MS-OFFICE-HB-2021", name: "Microsoft Office Home & Business 2021", category: "Office", brand: "Microsoft", costPrice: 212.96, sellPrice: 249.99, uvpPrice: 299.00, stockLevel: 20, description: "Word, Excel, PowerPoint und Outlook als Dauerlizenz. Einmalkauf." },
  { sku: "MS-OFFICE-HB-MAC-2021", name: "Microsoft Office Home & Business 2021 Mac", category: "Office", brand: "Microsoft", costPrice: 211.75, sellPrice: 249.99, uvpPrice: 299.00, stockLevel: 20, description: "Office mit Outlook für Mac — Dauerlizenz, kein Abo." },
  { sku: "WIN11-HOME-OEM", name: "Microsoft Windows 11 Home OEM", category: "Windows", brand: "Microsoft", costPrice: 120.88, sellPrice: 144.99, uvpPrice: 145.00, stockLevel: 20, description: "Windows 11 Home als OEM-Lizenz. Für Neuinstallation auf einem PC." },
  { sku: "WIN11-PRO-OEM", name: "Microsoft Windows 11 Pro OEM", category: "Windows", brand: "Microsoft", costPrice: 120.88, sellPrice: 174.99, uvpPrice: 259.00, stockLevel: 20, description: "Windows 11 Pro als OEM-Lizenz. Mit BitLocker, Remote Desktop und Hyper-V." },

  // =====================================================================
  // ACRONIS — Cyber Protect / True Image
  // =====================================================================
  { sku: "ACRONIS-ESS-1PC-1Y", name: "Acronis Cyber Protect Home Office Essential 1 PC 1 Jahr", category: "Backup", brand: "Acronis", costPrice: 37.49, sellPrice: 46.99, uvpPrice: 49.99, stockLevel: 20, description: "Backup und Antivirus in einem — Schutz vor Datenverlust und Ransomware." },
  { sku: "ACRONIS-ADV-1PC-1Y", name: "Acronis Cyber Protect Home Office Advanced 1 PC 1 Jahr", category: "Backup", brand: "Acronis", costPrice: 67.49, sellPrice: 84.99, uvpPrice: 89.99, stockLevel: 20, description: "Erweitertes Backup mit Cloud-Speicher und Anti-Ransomware." },

  // =====================================================================
  // ABBYY — FineReader PDF
  // =====================================================================
  { sku: "ABBYY-FR-STD-1Y", name: "ABBYY FineReader PDF 16 Standard 1 PC 1 Jahr", category: "Utilities", brand: "ABBYY", costPrice: 153.36, sellPrice: 179.99, stockLevel: 20, description: "PDF-Editor mit OCR-Texterkennung — PDFs erstellen, bearbeiten und konvertieren." },
  { sku: "ABBYY-FR-CORP-1Y", name: "ABBYY FineReader PDF 16 Corporate 1 Jahr", category: "Utilities", brand: "ABBYY", costPrice: 193.11, sellPrice: 224.99, stockLevel: 20, description: "Corporate-Version mit erweiterten OCR- und Vergleichsfunktionen." },

  // =====================================================================
  // PARALLELS — Desktop für Mac
  // =====================================================================
  { sku: "PARALLELS-18-STD-1Y", name: "Parallels Desktop Standard 1 Jahr", category: "Mac", brand: "Parallels", costPrice: 85.91, sellPrice: 104.99, uvpPrice: 99.99, stockLevel: 20, description: "Windows auf dem Mac ausführen. Die beliebteste Virtualisierungslösung." },
];

function createShuffleBagSlots(): number[] {
  const size = Math.floor(Math.random() * 7) + 7; // 7–13
  const winnerIndex = Math.floor(Math.random() * size);
  return Array.from({ length: size }, (_, i) => (i === winnerIndex ? 1 : 0));
}

async function main(): Promise<void> {
  console.log(`🌱 Seeding ${products.length} products...`);

  for (const p of products) {
    const minimumMargin = 3.00;

    await prisma.product.upsert({
      where: { sku: p.sku },
      update: {
        name: p.name,
        description: p.description,
        category: p.category,
        brand: p.brand,
        costPrice: p.costPrice,
        sellPrice: p.sellPrice,
        uvpPrice: p.uvpPrice ?? null,
        minimumMargin,
        stockLevel: p.stockLevel,
      },
      create: {
        sku: p.sku,
        name: p.name,
        description: p.description,
        category: p.category,
        brand: p.brand,
        costPrice: p.costPrice,
        sellPrice: p.sellPrice,
        uvpPrice: p.uvpPrice ?? null,
        minimumMargin,
        stockLevel: p.stockLevel,
      },
    });

    console.log(`  ✅ ${p.sku} — ${p.name}`);
  }

  // Create initial ShuffleBag if none exists
  const activeBag = await prisma.shuffleBag.findFirst({ where: { isActive: true } });

  if (!activeBag) {
    const slots = createShuffleBagSlots();
    const slotsHash = createHash("sha256").update(JSON.stringify(slots)).digest("hex");

    await prisma.shuffleBag.create({
      data: { slots, currentIndex: 0, isActive: true, slotsHash },
    });

    console.log(`  🎲 ShuffleBag erstellt (${slots.length} Slots, Hash: ${slotsHash.slice(0, 12)}…)`);
  } else {
    console.log(`  🎲 ShuffleBag existiert bereits (ID: ${activeBag.id.slice(0, 8)}…)`);
  }

  console.log(`✅ Seed abgeschlossen — ${products.length} Produkte.`);
}

main()
  .catch((e: unknown) => {
    console.error("❌ Seed fehlgeschlagen:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
