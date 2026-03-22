/**
 * Clara (Content) + Sophie (SEO): Rich product data for PDPs.
 * Features, highlights, system requirements, FAQ — keyed by SKU.
 * This enriches the minimal DB data without requiring schema changes.
 */

export interface ProductEnrichment {
  features: string[];
  highlights?: string[];
  systemReq?: string;
  faq?: { q: string; a: string }[];
}

const data: Record<string, ProductEnrichment> = {
  // ===== NORTON =====
  "NORTON-360-STD-1Y": {
    features: ["Echtzeitschutz vor Viren und Malware", "Secure VPN für anonymes Surfen", "Passwort-Manager", "10 GB Cloud-Backup", "1 Gerät, 1 Jahr", "Non-Subscription (kein Auto-Renew)"],
    highlights: ["Nr. 1 Antivirus weltweit", "VPN inklusive", "Kein automatisches Abo"],
    systemReq: "Windows 10/11, macOS 12+, Android 8+, iOS 15+. 2 GB RAM, 300 MB Speicherplatz.",
    faq: [
      { q: "Was bedeutet Non-Subscription?", a: "Ihr Schutz läuft 1 Jahr und verlängert sich NICHT automatisch. Keine versteckten Kosten." },
      { q: "Kann ich Norton auf dem Mac nutzen?", a: "Ja, Norton 360 Standard unterstützt Windows, macOS, Android und iOS." },
      { q: "Ist das VPN im Preis enthalten?", a: "Ja, Norton Secure VPN ist ohne Aufpreis enthalten." },
    ],
  },
  "NORTON-360-DLX-3D-1Y": {
    features: ["Schutz für 3 Geräte gleichzeitig", "Secure VPN (3 Geräte)", "Passwort-Manager", "25 GB Cloud-Backup", "Kindersicherung", "Non-Subscription"],
    highlights: ["3 Geräte zum Preis von einem", "Kindersicherung inklusive", "25 GB Cloud-Backup"],
    systemReq: "Windows 10/11, macOS 12+, Android 8+, iOS 15+. 2 GB RAM, 300 MB Speicherplatz pro Gerät.",
    faq: [
      { q: "Kann ich die 3 Lizenzen auf verschiedene Betriebssysteme aufteilen?", a: "Ja, z.B. 1x Windows, 1x Mac, 1x Android — frei wählbar." },
      { q: "Was ist die Kindersicherung?", a: "Sie können Webseiten-Filter, Zeitlimits und App-Kontrollen für Kinderprofile einrichten." },
    ],
  },
  "NORTON-360-DLX-5D-1Y": {
    features: ["Schutz für 5 Geräte gleichzeitig", "Secure VPN (5 Geräte)", "Passwort-Manager", "50 GB Cloud-Backup", "Kindersicherung", "Non-Subscription"],
    highlights: ["5 Geräte — ideal für Familien", "50 GB Cloud-Backup", "Plattformübergreifend"],
    systemReq: "Windows 10/11, macOS 12+, Android 8+, iOS 15+. 2 GB RAM, 300 MB Speicherplatz pro Gerät.",
  },
  "NORTON-360-PREM-10D-1Y": {
    features: ["Schutz für 10 Geräte", "Secure VPN (10 Geräte)", "Passwort-Manager", "75 GB Cloud-Backup", "Kindersicherung", "Dark Web Monitoring", "Non-Subscription"],
    highlights: ["10 Geräte — für die ganze Familie", "75 GB Cloud-Backup", "Dark Web Monitoring"],
    systemReq: "Windows 10/11, macOS 12+, Android 8+, iOS 15+. 2 GB RAM, 300 MB Speicherplatz pro Gerät.",
    faq: [
      { q: "Was ist Dark Web Monitoring?", a: "Norton überprüft automatisch, ob Ihre persönlichen Daten im Dark Web aufgetaucht sind und warnt Sie." },
      { q: "Lohnt sich Premium gegenüber Deluxe?", a: "Ja, wenn Sie mehr als 5 Geräte haben oder das Dark Web Monitoring nutzen möchten." },
    ],
  },

  // ===== McAFEE =====
  "MCAFEE-IS-1PC-1Y": {
    features: ["Echtzeitschutz vor Viren und Malware", "Web-Schutz beim Surfen", "Firewall", "1 PC, 1 Jahr"],
    highlights: ["Günstiger Einstieg", "Bewährter Schutz"],
    systemReq: "Windows 10/11. 2 GB RAM, 500 MB Speicherplatz.",
  },
  "MCAFEE-IS-3PC-1Y": {
    features: ["Schutz für 3 PCs", "Echtzeitschutz", "Web- und E-Mail-Schutz", "Firewall", "1 Jahr"],
    highlights: ["3 PCs schützen", "E-Mail-Schutz inklusive"],
    systemReq: "Windows 10/11. 2 GB RAM, 500 MB Speicherplatz pro PC.",
  },
  "MCAFEE-IS-10D-1Y": {
    features: ["Schutz für 10 Geräte", "Echtzeitschutz", "Web-Schutz", "Firewall", "Plattformübergreifend", "1 Jahr"],
    highlights: ["10 Geräte — bester Wert", "Plattformübergreifend"],
    systemReq: "Windows 10/11, macOS 10.15+, Android 7+, iOS 14+. 2 GB RAM.",
  },
  "MCAFEE-TP-1PC-1Y": {
    features: ["Antivirus + Anti-Malware", "Secure VPN", "Passwort-Manager", "Identitätsschutz", "Firewall", "1 PC, 1 Jahr"],
    highlights: ["VPN inklusive", "Identitätsschutz", "Total Protection"],
    systemReq: "Windows 10/11. 2 GB RAM, 500 MB Speicherplatz.",
    faq: [
      { q: "Was ist der Unterschied zwischen Internet Security und Total Protection?", a: "Total Protection enthält zusätzlich VPN, Passwort-Manager und Identitätsschutz." },
    ],
  },
  "MCAFEE-TP-10PC-1Y": {
    features: ["Schutz für 10 PCs", "Secure VPN (10 Geräte)", "Passwort-Manager", "Identitätsschutz", "Firewall", "1 Jahr"],
    highlights: ["10 Geräte", "VPN für alle", "Familien-Schutz"],
    systemReq: "Windows 10/11, macOS 10.15+, Android 7+, iOS 14+. 2 GB RAM.",
  },
  "MCAFEE-LIVESAFE-UNL-1Y": {
    features: ["Unbegrenzte Geräteanzahl", "Secure VPN", "Passwort-Manager", "Identitätsschutz", "Sicherer Speicher", "Plattformübergreifend", "1 Jahr"],
    highlights: ["Unbegrenzte Geräte", "Premium-Komplettschutz", "Sicherer Cloud-Speicher"],
    systemReq: "Windows 10/11, macOS 10.15+, Android 7+, iOS 14+, ChromeOS. 2 GB RAM.",
    faq: [
      { q: "Wirklich unbegrenzt viele Geräte?", a: "Ja, Sie können LiveSafe auf beliebig vielen Geräten in Ihrem Haushalt installieren — ohne Limit." },
      { q: "Was ist der sichere Speicher?", a: "Ein verschlüsselter Cloud-Bereich für sensible Dokumente wie Ausweise oder Verträge." },
    ],
  },

  // ===== TREND MICRO =====
  "TREND-IS-1PC-1Y": {
    features: ["Schutz vor Viren und Ransomware", "E-Mail-Schutzfilter", "Web Threat Protection", "1 PC, 1 Jahr"],
    highlights: ["Günstigster Einstieg", "Ransomware-Schutz"],
    systemReq: "Windows 10/11. 2 GB RAM, 1.5 GB Speicherplatz.",
  },
  "TREND-IS-3PC-1Y": {
    features: ["Schutz für 3 PCs", "Anti-Ransomware", "E-Mail-Schutz", "Social-Media-Schutz", "1 Jahr"],
    highlights: ["3 PCs", "Social-Media-Schutz"],
    systemReq: "Windows 10/11. 2 GB RAM, 1.5 GB Speicherplatz pro PC.",
  },
  "TREND-IS-5PC-2Y": {
    features: ["2 Jahre Schutz", "5 PCs", "Anti-Ransomware", "E-Mail-Schutz", "Pay Guard (sicheres Banking)"],
    highlights: ["2 Jahre — langfristig sparen", "5 PCs", "Sicheres Online-Banking"],
    systemReq: "Windows 10/11. 2 GB RAM, 1.5 GB Speicherplatz pro PC.",
  },
  "TREND-MAXSEC-5PC-1Y": {
    features: ["Schutz für 5 Geräte", "Anti-Ransomware", "Kindersicherung", "Social-Media-Schutz", "Pay Guard", "Plattformübergreifend", "1 Jahr"],
    highlights: ["5 Geräte, alle Plattformen", "Kindersicherung", "Maximum Security"],
    systemReq: "Windows 10/11, macOS 11+, Android 6+, iOS 14+, ChromeOS. 2 GB RAM.",
  },
  "TREND-MAXSEC-3PC-2Y": {
    features: ["2 Jahre Schutz", "3 Geräte", "Anti-Ransomware", "Kindersicherung", "Pay Guard"],
    highlights: ["2 Jahre Ruhe", "Kindersicherung inklusive"],
    systemReq: "Windows 10/11, macOS 11+, Android 6+, iOS 14+. 2 GB RAM.",
  },
  "TREND-MAXSEC-5PC-2Y": {
    features: ["2 Jahre Schutz", "5 Geräte", "Anti-Ransomware", "Kindersicherung", "Social-Media-Schutz", "Pay Guard"],
    highlights: ["2 Jahre + 5 Geräte", "Rundum-Schutz"],
    systemReq: "Windows 10/11, macOS 11+, Android 6+, iOS 14+, ChromeOS. 2 GB RAM.",
  },
  "TREND-MAXSEC-3PC-3Y": {
    features: ["3 Jahre Schutz", "3 Geräte", "Anti-Ransomware", "Kindersicherung", "Pay Guard", "Automatische Updates"],
    highlights: ["3 Jahre — maximales Sparpotenzial", "Set it and forget it"],
    systemReq: "Windows 10/11, macOS 11+, Android 6+, iOS 14+. 2 GB RAM.",
  },
  "TREND-MAXSEC-5PC-3Y": {
    features: ["3 Jahre Schutz", "5 Geräte", "Anti-Ransomware", "Kindersicherung", "Social-Media-Schutz", "Pay Guard"],
    highlights: ["3 Jahre + 5 Geräte = bester Deal", "Langzeit-Empfehlung"],
    systemReq: "Windows 10/11, macOS 11+, Android 6+, iOS 14+, ChromeOS. 2 GB RAM.",
    faq: [
      { q: "Warum 3 Jahre?", a: "Sie sparen über 50% gegenüber drei Einzeljahr-Käufen und haben 3 Jahre lang keinen Aufwand." },
    ],
  },

  // ===== BITDEFENDER =====
  "BITDEF-AV-1PC-1Y": {
    features: ["Preisgekrönter Virenschutz", "Anti-Phishing", "Sicheres Online-Banking", "VPN (200 MB/Tag)", "1 PC, 1 Jahr"],
    highlights: ["Nr. 1 in AV-Tests", "VPN inklusive", "Leichtgewichtig"],
    systemReq: "Windows 10/11. 2 GB RAM, 2.5 GB Speicherplatz.",
  },
  "BITDEF-AV-3PC-1Y": {
    features: ["Virenschutz für 3 PCs", "Anti-Phishing", "Sicheres Banking", "VPN (200 MB/Tag)", "Passwort-Manager", "1 Jahr"],
    highlights: ["3 PCs", "Passwort-Manager", "Top-bewerteter Schutz"],
    systemReq: "Windows 10/11. 2 GB RAM, 2.5 GB Speicherplatz pro PC.",
  },
  "BITDEF-IS-5PC-1Y": {
    features: ["5 PCs schützen", "Firewall", "Webcam-Schutz", "Kindersicherung", "Anti-Spam", "VPN (200 MB/Tag)", "1 Jahr"],
    highlights: ["Webcam-Schutz", "Firewall", "Kindersicherung"],
    systemReq: "Windows 10/11. 2 GB RAM, 2.5 GB Speicherplatz pro PC.",
  },
  "BITDEF-TS-5D-1Y": {
    features: ["5 Geräte, alle Plattformen", "Anti-Ransomware", "Webcam- & Mikrofon-Schutz", "Kindersicherung", "VPN (200 MB/Tag)", "Anti-Theft (Android)", "System-Optimierung", "1 Jahr"],
    highlights: ["Testsieger in unabhängigen Tests", "Plattformübergreifend", "Komplettsuite"],
    systemReq: "Windows 10/11, macOS 11+, Android 6+, iOS 14+. 2 GB RAM, 2.5 GB Speicherplatz.",
    faq: [
      { q: "Warum Bitdefender Total Security?", a: "Bitdefender wird regelmäßig als Nr. 1 in unabhängigen Tests (AV-Test, AV-Comparatives) ausgezeichnet." },
      { q: "Funktioniert der Schutz auf iPhone und Android?", a: "Ja, voller Schutz auf Windows, macOS, Android und iOS." },
    ],
  },
  "BITDEF-TS-10D-1Y": {
    features: ["10 Geräte, alle Plattformen", "Anti-Ransomware", "Webcam-Schutz", "Kindersicherung", "VPN (200 MB/Tag)", "Anti-Theft", "1 Jahr"],
    highlights: ["10 Geräte", "Ideal für Großfamilien", "Testsieger"],
    systemReq: "Windows 10/11, macOS 11+, Android 6+, iOS 14+. 2 GB RAM, 2.5 GB Speicherplatz.",
  },
  "BITDEF-TS-10D-2Y": {
    features: ["2 Jahre Schutz", "10 Geräte", "Alle Plattformen", "Anti-Ransomware", "Webcam-Schutz", "Kindersicherung", "VPN"],
    highlights: ["2 Jahre sparen", "10 Geräte", "Premium-Schutz"],
    systemReq: "Windows 10/11, macOS 11+, Android 6+, iOS 14+. 2 GB RAM, 2.5 GB Speicherplatz.",
  },
  "BITDEF-FAMILY-15D-1Y": {
    features: ["15 Geräte schützen", "Alle Plattformen", "Anti-Ransomware", "Webcam-Schutz", "Kindersicherung", "VPN (200 MB/Tag)", "1 Jahr"],
    highlights: ["15 Geräte — ultimatives Family Pack", "Testsieger-Schutz", "Alle Plattformen"],
    systemReq: "Windows 10/11, macOS 11+, Android 6+, iOS 14+. 2 GB RAM, 2.5 GB Speicherplatz.",
    faq: [
      { q: "Wofür brauche ich 15 Geräte?", a: "Smartphone + Tablet + Laptop + PC — für eine 4-köpfige Familie kommen schnell 12+ Geräte zusammen." },
    ],
  },

  // ===== PANDA =====
  "PANDA-ADV-1PC-1Y": {
    features: ["Echtzeit-Antivirus", "Anti-Ransomware", "Phishing-Schutz", "Cloud-basierte Erkennung", "1 PC, 1 Jahr"],
    highlights: ["Cloud-basiert = leichtgewichtig", "Budget-freundlich"],
    systemReq: "Windows 10/11. 1 GB RAM, 240 MB Speicherplatz.",
  },
  "PANDA-ADV-3PC-1Y": {
    features: ["3 PCs schützen", "Anti-Ransomware", "Phishing-Schutz", "Kindersicherung", "Wi-Fi-Schutz", "1 Jahr"],
    highlights: ["3 PCs", "Kindersicherung", "Wi-Fi-Schutz"],
    systemReq: "Windows 10/11. 1 GB RAM, 240 MB Speicherplatz pro PC.",
  },
  "PANDA-COMP-5PC-1Y": {
    features: ["5 PCs Komplettschutz", "VPN", "Passwort-Manager", "Datei-Verschlüsselung", "PC-Bereinigung", "Anti-Theft", "1 Jahr"],
    highlights: ["VPN + Passwort-Manager inkl.", "Datei-Verschlüsselung", "Komplett-Paket"],
    systemReq: "Windows 10/11. 1 GB RAM, 240 MB Speicherplatz pro PC.",
  },

  // ===== F-SECURE =====
  "FSEC-IS-1PC-1Y": {
    features: ["Banking-Schutz", "Browsing-Schutz", "Ransomware-Schutz", "Automatische Updates", "1 PC, 1 Jahr"],
    highlights: ["Finnische Qualität", "Banking-Schutz Spezialität"],
    systemReq: "Windows 10/11. 1 GB RAM, 800 MB Speicherplatz.",
  },
  "FSEC-SAFE-3D-1Y": {
    features: ["3 Geräte schützen", "Banking-Schutz", "Browsing-Schutz", "Kindersicherung", "Finder (Geräteortung)", "1 Jahr"],
    highlights: ["Aus Finnland — Privacy First", "Kindersicherung", "Geräteortung"],
    systemReq: "Windows 10/11, macOS 11+, Android 7+, iOS 14+. 1 GB RAM.",
    faq: [
      { q: "Warum F-Secure?", a: "F-Secure aus Finnland hat einen starken Fokus auf Datenschutz — keine Daten werden verkauft oder für Werbung genutzt." },
    ],
  },

  // ===== MICROSOFT OFFICE & 365 =====
  "MS365-PERSONAL-1Y": {
    features: ["Word, Excel, PowerPoint, Outlook", "1 TB OneDrive Cloud-Speicher", "Für 1 Person", "Auf bis zu 5 Geräten gleichzeitig", "Microsoft Editor (KI-Schreibhilfe)", "1 Jahr"],
    highlights: ["1 TB Cloud-Speicher", "Immer aktuelle Version", "Auf 5 Geräten nutzbar"],
    systemReq: "Windows 10/11, macOS (3 neueste Versionen), iOS, Android. Internetverbindung für Aktivierung.",
    faq: [
      { q: "Brauche ich Internet für Office?", a: "Nur für die Aktivierung und Updates. Sie können offline arbeiten." },
      { q: "Was passiert nach 1 Jahr?", a: "Ihr Abo läuft aus. Ihre Dateien bleiben erhalten, aber Sie können nicht mehr bearbeiten bis zur Verlängerung." },
    ],
  },
  "MS365-FAMILY-1Y": {
    features: ["Word, Excel, PowerPoint, Outlook", "Bis zu 6 Nutzer", "1 TB OneDrive pro Person (6 TB gesamt)", "Microsoft Editor", "Family Safety App", "1 Jahr"],
    highlights: ["6 Nutzer = 6 TB Speicher", "Family Safety inklusive", "Bestes Preis-Leistungs-Verhältnis"],
    systemReq: "Windows 10/11, macOS (3 neueste Versionen), iOS, Android. Internetverbindung für Aktivierung.",
    faq: [
      { q: "Können die 6 Nutzer in verschiedenen Haushalten sein?", a: "Ja, Sie können die Lizenzen mit Familie oder Freunden teilen — unabhängig vom Wohnort." },
    ],
  },
  "MS-OFFICE-HS-2021": {
    features: ["Word, Excel, PowerPoint", "Einmalkauf — kein Abo", "Dauerlizenz für 1 PC oder Mac", "Klassische Desktop-Apps"],
    highlights: ["Einmal kaufen, für immer nutzen", "Kein Abo nötig", "Für Abo-Verweigerer"],
    systemReq: "Windows 10/11 oder macOS (3 neueste Versionen). 4 GB RAM, 4 GB Speicherplatz.",
    faq: [
      { q: "Bekomme ich Updates?", a: "Sicherheitsupdates ja. Neue Features nein — dafür brauchen Sie Microsoft 365." },
      { q: "Auf wie vielen PCs kann ich installieren?", a: "Auf genau 1 PC oder Mac. Die Lizenz ist nicht übertragbar." },
    ],
  },
  "MS-OFFICE-HB-2021": {
    features: ["Word, Excel, PowerPoint, Outlook", "Einmalkauf — kein Abo", "Dauerlizenz für 1 PC oder Mac", "Geschäftliche E-Mails mit Outlook"],
    highlights: ["Mit Outlook für E-Mails", "Einmalkauf", "Ideal fürs Home-Office"],
    systemReq: "Windows 10/11 oder macOS (3 neueste Versionen). 4 GB RAM, 4 GB Speicherplatz.",
  },

  // ===== WINDOWS =====
  "WIN11-HOME-OEM": {
    features: ["Microsoft Windows 11 Home", "OEM-Lizenz (Neuinstallation)", "Digitale Lizenz per E-Mail", "Windows Hello (biometrische Anmeldung)", "Snap Layouts & Virtual Desktops", "Microsoft Store & Android Apps"],
    highlights: ["Für einen neuen PC", "Digitaler Key — sofort nutzbar", "Neuestes Windows"],
    systemReq: "64-bit Prozessor (1 GHz+), 4 GB RAM, 64 GB Speicher, TPM 2.0, UEFI Secure Boot.",
    faq: [
      { q: "Was bedeutet OEM?", a: "OEM-Lizenzen sind für die Erstinstallation auf einem neuen PC gedacht. Sie sind an das Mainboard gebunden und nicht übertragbar." },
      { q: "Kann ich von Windows 10 upgraden?", a: "OEM-Lizenzen sind für Neuinstallationen. Für ein Upgrade empfehlen wir eine Retail-Lizenz." },
    ],
  },
  "WIN11-PRO-OEM": {
    features: ["Microsoft Windows 11 Pro", "OEM-Lizenz (Neuinstallation)", "BitLocker-Verschlüsselung", "Remote Desktop", "Hyper-V Virtualisierung", "Gruppenrichtlinien", "Windows Sandbox"],
    highlights: ["Pro-Features: BitLocker + Remote Desktop", "Für Power-User und Business", "Hyper-V inklusive"],
    systemReq: "64-bit Prozessor (1 GHz+), 4 GB RAM, 64 GB Speicher, TPM 2.0, UEFI Secure Boot.",
    faq: [
      { q: "Brauche ich Pro oder reicht Home?", a: "Pro lohnt sich für BitLocker (Festplattenverschlüsselung), Remote Desktop und Hyper-V. Für normalen Heimgebrauch reicht Home." },
    ],
  },

  // ===== PARALLELS =====
  "PARALLELS-18-STD-1Y": {
    features: ["Windows auf dem Mac ausführen", "Nahtlose Integration (Coherence-Modus)", "Drag & Drop zwischen Mac und Windows", "Unterstützt DirectX 11", "Optimiert für Apple Silicon (M1/M2/M3)", "1 Mac, 1 Jahr"],
    highlights: ["Nr. 1 Virtualisierung für Mac", "Apple Silicon optimiert", "Windows + Mac gleichzeitig"],
    systemReq: "macOS 12 Monterey oder neuer. Apple M1/M2/M3 oder Intel. 4 GB RAM (8 GB empfohlen), 16 GB Speicher für Parallels + Speicher für Windows.",
    faq: [
      { q: "Brauche ich eine separate Windows-Lizenz?", a: "Ja, Parallels ist die Virtualisierungssoftware. Sie brauchen zusätzlich einen Windows-Key — z.B. unseren Windows 11 Home/Pro OEM." },
      { q: "Funktioniert es auf Apple Silicon Macs?", a: "Ja, Parallels ist vollständig für M1/M2/M3 optimiert. Es nutzt die ARM-Version von Windows 11." },
    ],
  },
};

export function getProductEnrichment(sku: string): ProductEnrichment | null {
  return data[sku] ?? null;
}
