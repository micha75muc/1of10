/**
 * Clara (Content) + Sophie (SEO): Rich product data for PDPs.
 * Features, highlights, system requirements, FAQ — keyed by SKU.
 * This enriches the minimal DB data without requiring schema changes.
 *
 * KATALOG-BEREINIGUNG 2026-03-26: Nur noch 14 profitable Produkte (DSD-EK).
 */

export interface ProductEnrichment {
  features: string[];
  highlights?: string[];
  systemReq?: string;
  faq?: { q: string; a: string }[];
}

const data: Record<string, ProductEnrichment> = {
  // ===== NORTON =====
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
  "NORTON-360-DLX-VPN-3D-1Y": {
    features: ["Norton 360 Deluxe Funktionsumfang", "Integriertes VPN", "Passwort-Manager", "25 GB Cloud-Backup", "Kindersicherung"],
    highlights: ["VPN inklusive", "3 Geräte schützen", "Champion-Edition"],
    systemReq: "Windows 10/11, macOS 12+, Android 8+, iOS 15+. 2 GB RAM, 300 MB Speicherplatz.",
  },
  "NORTON-360-PREM-5D-1Y": {
    features: ["Schutz für 5 Geräte", "Secure VPN", "Passwort-Manager", "50 GB Cloud-Backup", "Kindersicherung"],
    highlights: ["5 Geräte", "Premium zum Bestpreis", "Champion-Edition"],
    systemReq: "Windows 10/11, macOS 12+, Android 8+, iOS 15+. 2 GB RAM, 300 MB Speicherplatz.",
  },
  "NORTON-ANTITRACK-1D-1Y": {
    features: ["Anti-Tracking-Schutz", "Fingerprinting-Schutz", "Privatsphäre beim Surfen", "Cookie-Management"],
    highlights: ["Unsichtbar surfen", "Tracker blockieren"],
    systemReq: "Windows 10/11, macOS 12+. Browser: Chrome, Firefox, Edge.",
  },
  "NORTON-VPN-5D-1Y": {
    features: ["Verschlüsselte Verbindung", "Anonymes Surfen", "5 Geräte gleichzeitig", "No-Log-Policy"],
    highlights: ["5 Geräte", "No-Log VPN", "Öffentliche WLANs sicher nutzen"],
    systemReq: "Windows 10/11, macOS 12+, Android 8+, iOS 15+.",
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
  "MCAFEE-TP-3PC-1Y": {
    features: ["Schutz für 3 PCs", "Secure VPN", "Passwort-Manager", "Identitätsschutz", "Firewall"],
    highlights: ["3 PCs mit VPN", "Identitätsschutz"],
    systemReq: "Windows 10/11. 2 GB RAM, 500 MB Speicherplatz.",
  },
  "MCAFEE-TP-UNL-1Y": {
    features: ["Unbegrenzte Geräteanzahl", "Secure VPN", "Passwort-Manager", "Identitätsschutz", "Firewall", "1 Jahr"],
    highlights: ["Unbegrenzte Geräte", "VPN für alle"],
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

  // ===== AVG =====
  "AVG-TUNEUP-3D-1Y": {
    features: ["Automatische Wartung", "Junk-Dateien entfernen", "Programme beschleunigen", "3 Geräte"],
    highlights: ["PC schneller machen", "Automatische Optimierung"],
    systemReq: "Windows 10/11, macOS 10.14+, Android 6+.",
  },
  "AVG-IS-1PC-1Y": {
    features: ["Echtzeitschutz", "Firewall", "Anti-Ransomware", "E-Mail-Schutz", "Web-Schutz"],
    highlights: ["Firewall inklusive", "Ransomware-Schutz"],
    systemReq: "Windows 10/11. 1 GB RAM, 1.5 GB Speicherplatz.",
  },
  "AVG-ULTIMATE-1PC-1Y": {
    features: ["Internet Security", "TuneUp Optimierung", "VPN Privatsphäre", "Alles in einem Paket"],
    highlights: ["Security + TuneUp + VPN", "Komplett-Paket"],
    systemReq: "Windows 10/11. 2 GB RAM, 2 GB Speicherplatz.",
  },

  // ===== AVAST =====
  "AVAST-PREM-1PC-1Y": {
    features: ["Echtzeitschutz", "Anti-Ransomware", "WLAN-Inspektor", "Sandbox", "Phishing-Schutz"],
    highlights: ["Premium-Schutz", "Sandbox-Technologie"],
    systemReq: "Windows 10/11, macOS 10.14+. 1 GB RAM, 2 GB Speicherplatz.",
  },
  "AVAST-ULTIMATE-1PC-1Y": {
    features: ["Premium Security", "Cleanup Premium", "SecureLine VPN", "AntiTrack", "Alles in einem"],
    highlights: ["VPN + Cleanup inklusive", "Komplett-Paket"],
    systemReq: "Windows 10/11, macOS 10.14+. 2 GB RAM, 2 GB Speicherplatz.",
  },

  // ===== PANDA =====
  "PANDA-ESS-1PC-1Y": {
    features: ["Cloud-basierter Virenschutz", "Echtzeit-Erkennung", "USB-Schutz", "Rescue Kit"],
    highlights: ["Cloud-basiert — schnell", "Leichte Systembelastung"],
    systemReq: "Windows 10/11. 256 MB RAM, 240 MB Speicherplatz.",
  },
  "PANDA-COMP-1PC-1Y": {
    features: ["VPN (150 MB/Tag)", "Passwort-Manager", "Dateiverschlüsselung", "Anti-Ransomware", "Kindersicherung"],
    highlights: ["VPN inklusive", "Passwort-Manager", "Dateiverschlüsselung"],
    systemReq: "Windows 10/11, macOS 10.14+, Android 5+, iOS 14+. 256 MB RAM.",
  },

  // ===== BITDEFENDER =====
  "BITDEF-AV-1PC-1Y": {
    features: ["Preisgekrönter Antivirus", "Anti-Phishing", "VPN (200 MB/Tag)", "Passwort-Manager"],
    highlights: ["Nr. 1 bei AV-TEST", "Leicht und schnell"],
    systemReq: "Windows 10/11. 2 GB RAM, 2.5 GB Speicherplatz.",
  },
  "BITDEF-IS-1PC-1Y": {
    features: ["Firewall", "Kindersicherung", "Anti-Spam", "Webcam-Schutz", "Ransomware-Schutz"],
    highlights: ["Webcam-Schutz", "Firewall inklusive"],
    systemReq: "Windows 10/11. 2 GB RAM, 2.5 GB Speicherplatz.",
  },
  "BITDEF-TS-5D-1Y": {
    features: ["Plattformübergreifend", "Anti-Theft", "VPN", "Mikrofon-Schutz", "Kindersicherung", "5 Geräte"],
    highlights: ["Alle Plattformen", "Anti-Theft", "Mikrofon-Schutz"],
    systemReq: "Windows 10/11, macOS 12+, Android 6+, iOS 14+. 2 GB RAM, 2.5 GB Speicherplatz.",
  },
  "BITDEF-FAMILY-15D-1Y": {
    features: ["15 Geräte", "Plattformübergreifend", "Kindersicherung", "VPN", "Anti-Theft"],
    highlights: ["15 Geräte für die ganze Familie", "Kindersicherung inklusive"],
    systemReq: "Windows 10/11, macOS 12+, Android 6+, iOS 14+. 2 GB RAM.",
  },

  // ===== ESET =====
  "ESET-NOD32-3D-1Y": {
    features: ["Leichtgewichtiger Scanner", "Geringe Systembelastung", "Anti-Phishing", "3 Geräte"],
    highlights: ["Schnellster Scanner", "Geringe Systemlast"],
    systemReq: "Windows 10/11, macOS 12+, Linux. 1 GB RAM, 320 MB Speicherplatz.",
  },
  "ESET-SMARTSEC-3D-1Y": {
    features: ["Passwort-Manager", "Dateiverschlüsselung", "Anti-Theft", "Banking-Schutz", "3 Geräte"],
    highlights: ["Passwort-Manager", "Dateiverschlüsselung"],
    systemReq: "Windows 10/11, macOS 12+, Android 6+. 1 GB RAM, 320 MB Speicherplatz.",
  },

  // ===== G DATA =====
  "GDATA-AV-1PC-1Y": {
    features: ["Doppelte Scan-Engine", "Anti-Ransomware", "Banking-Schutz", "Made in Germany"],
    highlights: ["Deutsche Qualität", "Doppelte Engine", "Banking-Schutz"],
    systemReq: "Windows 10/11. 2 GB RAM, 1 GB Speicherplatz.",
  },
  "GDATA-IS-1PC-1Y": {
    features: ["Firewall", "Kindersicherung", "Banking-Schutz", "Anti-Spam", "Doppelte Engine"],
    highlights: ["Firewall inklusive", "Made in Germany"],
    systemReq: "Windows 10/11. 2 GB RAM, 2 GB Speicherplatz.",
  },

  // ===== TREND MICRO =====
  "TREND-IS-1PC-1Y": {
    features: ["KI-gestützte Erkennung", "Anti-Ransomware", "Web-Schutz", "E-Mail-Schutz"],
    highlights: ["KI-Schutz", "Einfache Bedienung"],
    systemReq: "Windows 10/11. 1 GB RAM, 1.5 GB Speicherplatz.",
  },
  "TREND-MAXSEC-5PC-1Y": {
    features: ["5 Geräte", "Plattformübergreifend", "Passwort-Manager", "Kindersicherung", "VPN"],
    highlights: ["5 Geräte schützen", "VPN inklusive"],
    systemReq: "Windows 10/11, macOS 12+, Android 8+, iOS 14+. 1 GB RAM.",
  },

  // ===== F-SECURE =====
  "FSEC-VPN-1D-1Y": {
    features: ["Verschlüsselte Verbindung", "Finnische Datenschutzgesetze", "No-Log-Policy", "Tracker-Schutz"],
    highlights: ["Finnischer Datenschutz", "No-Log VPN"],
    systemReq: "Windows 10/11, macOS 12+, Android 8+, iOS 15+.",
  },
  "FSEC-IS-1PC-1Y": {
    features: ["Banking-Schutz", "Anti-Ransomware", "Browsing-Schutz", "Finnische Qualität"],
    highlights: ["Banking-Schutz", "Finnische Sicherheit"],
    systemReq: "Windows 10/11. 1 GB RAM, 1 GB Speicherplatz.",
  },

  // ===== KASPERSKY =====
  "KASP-SAFEKIDS-1U-1Y": {
    features: ["GPS-Standort-Tracking", "App-Kontrolle", "Bildschirmzeit-Limits", "Webfilter", "YouTube-Überwachung"],
    highlights: ["GPS-Ortung", "Bildschirmzeit-Kontrolle", "YouTube-Filter"],
    systemReq: "Windows 10/11, macOS 12+, Android 6+, iOS 14+.",
    faq: [
      { q: "Kann ich den Standort meines Kindes sehen?", a: "Ja, Safe Kids zeigt den GPS-Standort in Echtzeit auf einer Karte." },
    ],
  },

  // ===== ACRONIS =====
  "ACRONIS-ESS-1PC-1Y": {
    features: ["Vollständiges Backup", "Anti-Ransomware", "Klonen von Festplatten", "Schnelle Wiederherstellung"],
    highlights: ["Backup + Antivirus", "Disk-Klonen"],
    systemReq: "Windows 10/11, macOS 12+. 2 GB RAM, 1.5 GB Speicherplatz.",
  },

  // ===== ABBYY =====
  "ABBYY-FR-STD-1Y": {
    features: ["OCR-Texterkennung", "PDF erstellen und bearbeiten", "PDF konvertieren", "Formulare ausfüllen"],
    highlights: ["Beste OCR am Markt", "PDF-Editor"],
    systemReq: "Windows 10/11. 4 GB RAM, 3 GB Speicherplatz.",
  },

  // ===== MICROSOFT OFFICE =====
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
  "MS-OFFICE-HB-MAC-2021": {
    features: ["Word, Excel, PowerPoint, Outlook", "Speziell für macOS", "Einmalkauf — kein Abo", "Dauerlizenz für 1 Mac"],
    highlights: ["Mac-optimiert", "Outlook inklusive", "Einmalkauf"],
    systemReq: "macOS (3 neueste Versionen). 4 GB RAM, 10 GB Speicherplatz.",
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
