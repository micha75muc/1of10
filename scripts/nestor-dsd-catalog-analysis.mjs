#!/usr/bin/env node
/**
 * Nestor (Beschaffung): Komplette DSD-Kataloganalyse
 * 
 * HINWEIS: DSD API hat einen Session-Bug (Cloudflare + PHP Sessions).
 * login.json gibt IMMER "success" zurück — auch OHNE Credentials.
 * Alle anderen Endpoints geben "Not logged in" zurück.
 * → Externer Blocker: DSD muss kontaktiert werden.
 * 
 * Analyse basiert auf:
 * 1. Bekannte DSD-Preise (real) aus elena-price-analysis.mjs
 * 2. DB-Preise (aktuell, bereits mit 21% NL-MwSt = brutto)
 * 3. Geschätzte DSD-Preise für neue Marken (basierend auf Distributormargen)
 * 4. Marktpreise (Amazon.de, Idealo, Lizenzguru — März 2026)
 * 
 * Formel:
 * - EK Brutto = DSD Netto × 1.21 (21% NL-MwSt, kein Vorsteuerabzug §19)
 * - MinVK (3€ Netto) = (3.25 + EK_brutto) / 0.871
 *   [0.871 = 1 - 10% Shuffle - 2.9% Stripe]
 * - Profitabel wenn MinVK ≤ Street Price
 */

// ================================================
// ALLE BEKANNTEN DSD-PRODUKTE (real + geschätzt)
// ================================================
const products = [
  // ===== NORTON (reale DSD-Preise) =====
  { brand: "Norton", name: "Norton 360 Standard 1D 1J", dsdNetto: 16.00, streetPrice: 14.99, source: "real", dsdCode: "DSD190048" },
  { brand: "Norton", name: "Norton 360 Deluxe 3D 1J", dsdNetto: 17.00, streetPrice: 21.99, source: "real", dsdCode: "DSD190045" },
  { brand: "Norton", name: "Norton 360 Deluxe 5D 1J", dsdNetto: 19.00, streetPrice: 24.99, source: "real", dsdCode: "DSD190046" },
  { brand: "Norton", name: "Norton 360 Premium 10D 1J", dsdNetto: 22.00, streetPrice: 29.99, source: "real", dsdCode: "DSD190047" },
  { brand: "Norton", name: "Norton 360 Advanced 10D 1J", dsdNetto: 28.00, streetPrice: 39.99, source: "est", dsdCode: "?" },
  { brand: "Norton", name: "Norton AntiVirus Plus 1D 1J", dsdNetto: 10.00, streetPrice: 12.99, source: "est", dsdCode: "?" },

  // ===== McAFEE (reale DSD-Preise) =====
  { brand: "McAfee", name: "McAfee Internet Security 1PC 1J (OEM)", dsdNetto: 3.25, streetPrice: 7.99, source: "real", dsdCode: "OEM" },
  { brand: "McAfee", name: "McAfee Internet Security 3PC 1J (OEM)", dsdNetto: 4.20, streetPrice: 9.99, source: "real", dsdCode: "OEM" },
  { brand: "McAfee", name: "McAfee Internet Security 10D 1J (OEM)", dsdNetto: 4.90, streetPrice: 11.99, source: "real", dsdCode: "OEM" },
  { brand: "McAfee", name: "McAfee Total Protection 1PC 1J", dsdNetto: 10.00, streetPrice: 14.99, source: "real", dsdCode: "DSD260021" },
  { brand: "McAfee", name: "McAfee Total Protection 10PC 1J", dsdNetto: 16.00, streetPrice: 24.99, source: "real", dsdCode: "DSD260020" },
  { brand: "McAfee", name: "McAfee LiveSafe Unbegrenzt 1J", dsdNetto: 16.00, streetPrice: 29.99, source: "real", dsdCode: "DSD260009" },
  { brand: "McAfee", name: "McAfee+ Premium Family 1J", dsdNetto: 22.00, streetPrice: 39.99, source: "est", dsdCode: "?" },

  // ===== BITDEFENDER (reale DSD-Preise) =====
  { brand: "Bitdefender", name: "Bitdefender Antivirus Plus 1PC 1J", dsdNetto: 17.35, streetPrice: 19.99, source: "real", dsdCode: "160085" },
  { brand: "Bitdefender", name: "Bitdefender Antivirus Plus 3PC 1J", dsdNetto: 23.14, streetPrice: 24.99, source: "real", dsdCode: "160088" },
  { brand: "Bitdefender", name: "Bitdefender Internet Security 1PC 1J", dsdNetto: 25.00, streetPrice: 24.99, source: "est", dsdCode: "160094" },
  { brand: "Bitdefender", name: "Bitdefender Internet Security 3PC 1J", dsdNetto: 33.00, streetPrice: 34.99, source: "est", dsdCode: "160097" },
  { brand: "Bitdefender", name: "Bitdefender Internet Security 5PC 1J", dsdNetto: 49.74, streetPrice: 39.99, source: "real", dsdCode: "160100" },
  { brand: "Bitdefender", name: "Bitdefender Total Security 5D 1J", dsdNetto: 39.00, streetPrice: 44.99, source: "real", dsdCode: "160103" },
  { brand: "Bitdefender", name: "Bitdefender Total Security 10D 1J", dsdNetto: 54.96, streetPrice: 49.99, source: "real", dsdCode: "160106" },
  { brand: "Bitdefender", name: "Bitdefender Total Security 10D 2J", dsdNetto: 86.77, streetPrice: 79.99, source: "real", dsdCode: "160107" },
  { brand: "Bitdefender", name: "Bitdefender Family Pack 15D 1J", dsdNetto: 56.40, streetPrice: 54.99, source: "real", dsdCode: "160114" },
  { brand: "Bitdefender", name: "Bitdefender Mobile Security Android 1J", dsdNetto: 8.00, streetPrice: 14.99, source: "est", dsdCode: "?" },

  // ===== TREND MICRO (reale DSD-Preise) =====
  { brand: "Trend Micro", name: "Trend Micro Internet Security 1PC 1J", dsdNetto: 16.79, streetPrice: 12.99, source: "real", dsdCode: "DSD150002" },
  { brand: "Trend Micro", name: "Trend Micro Max Security 5D 1J", dsdNetto: 30.24, streetPrice: 19.99, source: "real", dsdCode: "DSD151022" },
  { brand: "Trend Micro", name: "Trend Micro Max Security 3D 2J", dsdNetto: 26.87, streetPrice: 22.99, source: "real", dsdCode: "DSD151021" },
  { brand: "Trend Micro", name: "Trend Micro Max Security 5D 2J", dsdNetto: 35.00, streetPrice: 29.99, source: "est", dsdCode: "?" },
  { brand: "Trend Micro", name: "Trend Micro Max Security 3D 3J", dsdNetto: 38.00, streetPrice: 34.99, source: "est", dsdCode: "?" },
  { brand: "Trend Micro", name: "Trend Micro Max Security 5D 3J", dsdNetto: 42.00, streetPrice: 39.99, source: "est", dsdCode: "?" },
  { brand: "Trend Micro", name: "Trend Micro Antivirus+ 1PC 1J", dsdNetto: 12.00, streetPrice: 9.99, source: "est", dsdCode: "?" },

  // ===== PANDA (reale DSD-Preise) =====
  { brand: "Panda", name: "Panda Dome Essential 1PC 1J", dsdNetto: 8.00, streetPrice: 12.99, source: "est", dsdCode: "?" },
  { brand: "Panda", name: "Panda Dome Advanced 1PC 1J", dsdNetto: 12.38, streetPrice: 14.99, source: "real", dsdCode: "170007" },
  { brand: "Panda", name: "Panda Dome Advanced 3PC 1J", dsdNetto: 20.64, streetPrice: 19.99, source: "real", dsdCode: "170005" },
  { brand: "Panda", name: "Panda Dome Complete 5PC 1J", dsdNetto: 30.97, streetPrice: 34.99, source: "real", dsdCode: "170011" },
  { brand: "Panda", name: "Panda Dome Premium Unbegrenzt 1J", dsdNetto: 40.00, streetPrice: 49.99, source: "est", dsdCode: "?" },

  // ===== F-SECURE (reale DSD-Preise) =====
  { brand: "F-Secure", name: "F-Secure Internet Security 1PC 1J", dsdNetto: 28.87, streetPrice: 19.99, source: "real", dsdCode: "460017" },
  { brand: "F-Secure", name: "F-Secure Safe 3D 1J", dsdNetto: 35.00, streetPrice: 39.99, source: "est", dsdCode: "?" },
  { brand: "F-Secure", name: "F-Secure Total 3D 1J", dsdNetto: 42.00, streetPrice: 49.99, source: "est", dsdCode: "?" },

  // ===== MICROSOFT (reale DSD-Preise) =====
  { brand: "Microsoft", name: "Microsoft 365 Personal 1J", dsdNetto: 72.50, streetPrice: 49.99, source: "real", dsdCode: "DSD270026" },
  { brand: "Microsoft", name: "Microsoft 365 Family 1J", dsdNetto: 92.50, streetPrice: 59.99, source: "real", dsdCode: "DSD270015" },
  { brand: "Microsoft", name: "Office Home & Student 2021", dsdNetto: 85.00, streetPrice: 99.99, source: "real", dsdCode: "270052" },
  { brand: "Microsoft", name: "Office Home & Business 2021", dsdNetto: 176.00, streetPrice: 189.99, source: "real", dsdCode: "270053" },
  { brand: "Microsoft", name: "Windows 11 Home OEM", dsdNetto: 99.90, streetPrice: 109.99, source: "real", dsdCode: "DSD340083" },
  { brand: "Microsoft", name: "Windows 11 Pro OEM", dsdNetto: 119.90, streetPrice: 139.99, source: "real", dsdCode: "DSD340084" },
  { brand: "Microsoft", name: "Office Home & Student 2024", dsdNetto: 95.00, streetPrice: 119.99, source: "est", dsdCode: "?" },
  { brand: "Microsoft", name: "Office Home & Business 2024", dsdNetto: 190.00, streetPrice: 219.99, source: "est", dsdCode: "?" },

  // ===== PARALLELS =====
  { brand: "Parallels", name: "Parallels Desktop 18 Std 1J", dsdNetto: 71.00, streetPrice: 84.99, source: "real", dsdCode: "?" },
  { brand: "Parallels", name: "Parallels Desktop Pro 1J", dsdNetto: 80.00, streetPrice: 99.99, source: "est", dsdCode: "?" },

  // ===== KASPERSKY (geschätzte DSD-Preise) =====
  { brand: "Kaspersky", name: "Kaspersky Standard 1D 1J", dsdNetto: 8.00, streetPrice: 17.99, source: "est", dsdCode: "?" },
  { brand: "Kaspersky", name: "Kaspersky Standard 3D 1J", dsdNetto: 10.00, streetPrice: 22.99, source: "est", dsdCode: "?" },
  { brand: "Kaspersky", name: "Kaspersky Standard 5D 1J", dsdNetto: 13.00, streetPrice: 27.99, source: "est", dsdCode: "?" },
  { brand: "Kaspersky", name: "Kaspersky Plus 1D 1J", dsdNetto: 12.00, streetPrice: 24.99, source: "est", dsdCode: "?" },
  { brand: "Kaspersky", name: "Kaspersky Plus 3D 1J", dsdNetto: 15.00, streetPrice: 32.99, source: "est", dsdCode: "?" },
  { brand: "Kaspersky", name: "Kaspersky Plus 5D 1J", dsdNetto: 18.00, streetPrice: 39.99, source: "est", dsdCode: "?" },
  { brand: "Kaspersky", name: "Kaspersky Premium 1D 1J", dsdNetto: 16.00, streetPrice: 29.99, source: "est", dsdCode: "?" },
  { brand: "Kaspersky", name: "Kaspersky Premium 3D 1J", dsdNetto: 20.00, streetPrice: 39.99, source: "est", dsdCode: "?" },
  { brand: "Kaspersky", name: "Kaspersky Premium 5D 1J", dsdNetto: 25.00, streetPrice: 49.99, source: "est", dsdCode: "?" },
  { brand: "Kaspersky", name: "Kaspersky Safe Kids 1J", dsdNetto: 8.00, streetPrice: 14.99, source: "est", dsdCode: "?" },
  { brand: "Kaspersky", name: "Kaspersky Small Office Security 5PC 1J", dsdNetto: 55.00, streetPrice: 79.99, source: "est", dsdCode: "?" },
  { brand: "Kaspersky", name: "Kaspersky Internet Security Android 1J", dsdNetto: 5.00, streetPrice: 11.99, source: "est", dsdCode: "?" },

  // ===== ESET (geschätzte DSD-Preise) =====
  { brand: "ESET", name: "ESET HOME Security Essential 1D 1J", dsdNetto: 9.00, streetPrice: 24.99, source: "est", dsdCode: "?" },
  { brand: "ESET", name: "ESET HOME Security Essential 3D 1J", dsdNetto: 13.00, streetPrice: 34.99, source: "est", dsdCode: "?" },
  { brand: "ESET", name: "ESET HOME Security Essential 5D 1J", dsdNetto: 16.00, streetPrice: 44.99, source: "est", dsdCode: "?" },
  { brand: "ESET", name: "ESET HOME Security Premium 1D 1J", dsdNetto: 14.00, streetPrice: 34.99, source: "est", dsdCode: "?" },
  { brand: "ESET", name: "ESET HOME Security Premium 3D 1J", dsdNetto: 20.00, streetPrice: 44.99, source: "est", dsdCode: "?" },
  { brand: "ESET", name: "ESET HOME Security Premium 5D 1J", dsdNetto: 25.00, streetPrice: 54.99, source: "est", dsdCode: "?" },
  { brand: "ESET", name: "ESET HOME Security Ultimate 5D 1J", dsdNetto: 32.00, streetPrice: 64.99, source: "est", dsdCode: "?" },
  { brand: "ESET", name: "ESET NOD32 Antivirus 1D 1J", dsdNetto: 7.00, streetPrice: 19.99, source: "est", dsdCode: "?" },

  // ===== AVAST (geschätzte DSD-Preise) =====
  { brand: "Avast", name: "Avast Premium Security 1PC 1J", dsdNetto: 10.00, streetPrice: 29.99, source: "est", dsdCode: "?" },
  { brand: "Avast", name: "Avast Premium Security 10D 1J", dsdNetto: 18.00, streetPrice: 44.99, source: "est", dsdCode: "?" },
  { brand: "Avast", name: "Avast Ultimate 1PC 1J", dsdNetto: 18.00, streetPrice: 49.99, source: "est", dsdCode: "?" },
  { brand: "Avast", name: "Avast SecureLine VPN 5D 1J", dsdNetto: 8.00, streetPrice: 19.99, source: "est", dsdCode: "?" },
  { brand: "Avast", name: "Avast Cleanup Premium 1PC 1J", dsdNetto: 10.00, streetPrice: 24.99, source: "est", dsdCode: "?" },
  { brand: "Avast", name: "Avast Driver Updater 1PC 1J", dsdNetto: 8.00, streetPrice: 19.99, source: "est", dsdCode: "?" },

  // ===== AVG (geschätzte DSD-Preise) =====
  { brand: "AVG", name: "AVG Internet Security 1PC 1J", dsdNetto: 8.00, streetPrice: 24.99, source: "est", dsdCode: "?" },
  { brand: "AVG", name: "AVG Internet Security 10D 1J", dsdNetto: 14.00, streetPrice: 34.99, source: "est", dsdCode: "?" },
  { brand: "AVG", name: "AVG Ultimate 1PC 1J", dsdNetto: 14.00, streetPrice: 39.99, source: "est", dsdCode: "?" },
  { brand: "AVG", name: "AVG Ultimate 10D 1J", dsdNetto: 22.00, streetPrice: 54.99, source: "est", dsdCode: "?" },
  { brand: "AVG", name: "AVG TuneUp 1PC 1J", dsdNetto: 8.00, streetPrice: 19.99, source: "est", dsdCode: "?" },
  { brand: "AVG", name: "AVG Secure VPN 5D 1J", dsdNetto: 8.00, streetPrice: 19.99, source: "est", dsdCode: "?" },

  // ===== G DATA (geschätzte DSD-Preise) =====
  { brand: "G DATA", name: "G DATA Antivirus 1PC 1J", dsdNetto: 12.00, streetPrice: 24.99, source: "est", dsdCode: "?" },
  { brand: "G DATA", name: "G DATA Antivirus 3PC 1J", dsdNetto: 16.00, streetPrice: 29.99, source: "est", dsdCode: "?" },
  { brand: "G DATA", name: "G DATA Internet Security 1PC 1J", dsdNetto: 16.00, streetPrice: 29.99, source: "est", dsdCode: "?" },
  { brand: "G DATA", name: "G DATA Internet Security 3PC 1J", dsdNetto: 22.00, streetPrice: 39.99, source: "est", dsdCode: "?" },
  { brand: "G DATA", name: "G DATA Total Security 1PC 1J", dsdNetto: 20.00, streetPrice: 34.99, source: "est", dsdCode: "?" },
  { brand: "G DATA", name: "G DATA Total Security 3PC 1J", dsdNetto: 28.00, streetPrice: 44.99, source: "est", dsdCode: "?" },
  { brand: "G DATA", name: "G DATA Total Security 5PC 1J", dsdNetto: 32.00, streetPrice: 54.99, source: "est", dsdCode: "?" },
  { brand: "G DATA", name: "G DATA Mobile Security Android 1J", dsdNetto: 5.00, streetPrice: 9.99, source: "est", dsdCode: "?" },
];

// ================================================
// ANALYSE
// ================================================
const fmt = (n) => n.toFixed(2).padStart(8);

function analyze(p) {
  const ekBrutto = p.dsdNetto * 1.21;
  const minVK = (3.25 + ekBrutto) / 0.871;
  const margin = p.streetPrice - minVK;
  const marginPercent = (margin / p.streetPrice) * 100;
  
  // Empfohlener VK: Street Price oder MinVK + 10%, je nachdem was höher ist
  let empVK = Math.max(minVK, p.streetPrice * 0.95);
  empVK = Math.ceil(empVK) - 0.01; // auf x.99 runden
  
  // Netto-Gewinn bei empVK
  const nettoAtEmp = empVK * 0.871 - 0.25 - ekBrutto;
  
  let status;
  if (minVK <= p.streetPrice * 0.85) status = "GRUEN";
  else if (minVK <= p.streetPrice * 1.05) status = "GELB";
  else status = "ROT";
  
  return { ...p, ekBrutto, minVK, margin, marginPercent, empVK, nettoAtEmp, status };
}

const results = products.map(analyze);
const gruen = results.filter(r => r.status === "GRUEN");
const gelb = results.filter(r => r.status === "GELB");
const rot = results.filter(r => r.status === "ROT");

// ================================================
// OUTPUT
// ================================================
console.log('');
console.log('╔══════════════════════════════════════════════════════════════════════════════════════════════════════════╗');
console.log('║  NESTOR (BESCHAFFUNG) — KOMPLETTE DSD-KATALOGANALYSE                          26. März 2026           ║');
console.log('╠══════════════════════════════════════════════════════════════════════════════════════════════════════════╣');
console.log('║  ⚠️  DSD API DEFEKT: login.json gibt IMMER "success" — auch ohne Credentials!                          ║');
console.log('║  Session wird nie aufgebaut → Katalog-Abruf unmöglich. EXTERNER BLOCKER.                               ║');
console.log('║  Analyse basiert auf: bekannten DSD-Preisen + geschätzten Distributorpreisen.                          ║');
console.log('╚══════════════════════════════════════════════════════════════════════════════════════════════════════════╝');
console.log('');

// Summary
console.log('═══════════════════════════════════════════════════════════════════════════════════');
console.log(' ZUSAMMENFASSUNG');
console.log('═══════════════════════════════════════════════════════════════════════════════════');
console.log(`  Analysierte Produkte gesamt: ${results.length}`);
console.log(`  Davon mit realen DSD-Preisen: ${results.filter(r => r.source === 'real').length}`);
console.log(`  Davon mit geschätzten Preisen: ${results.filter(r => r.source === 'est').length}`);
console.log('');
console.log(`  🟢 GRÜN  (gute Marge, MinVK < 85% Street Price): ${gruen.length} Produkte`);
console.log(`  🟡 GELB  (knapp profitabel, MinVK 85-105% Street): ${gelb.length} Produkte`);
console.log(`  🔴 ROT   (nicht profitabel, MinVK > 105% Street):  ${rot.length} Produkte`);
console.log('');

// Brands in catalog
const brands = [...new Set(results.map(r => r.brand))];
console.log('  DSD-Marken im Analyse-Scope:');
for (const brand of brands.sort()) {
  const brandProds = results.filter(r => r.brand === brand);
  const brandGruen = brandProds.filter(r => r.status === "GRUEN").length;
  const brandGelb = brandProds.filter(r => r.status === "GELB").length;
  const brandRot = brandProds.filter(r => r.status === "ROT").length;
  console.log(`    ${brand.padEnd(15)} ${brandProds.length} Produkte  (🟢${brandGruen} 🟡${brandGelb} 🔴${brandRot})`);
}

// ================================================
// GRÜN — profitable Produkte
// ================================================
console.log('');
console.log('═══════════════════════════════════════════════════════════════════════════════════════════════════════════════════');
console.log(' 🟢 GRÜNE PRODUKTE — Gute Marge, sofort ins Sortiment aufnehmen');
console.log('═══════════════════════════════════════════════════════════════════════════════════════════════════════════════════');
console.log('');
console.log('Marke'.padEnd(14) + 'Produkt'.padEnd(42) + 'DSD Netto'.padStart(10) + 'EK Brutto'.padStart(10) + '  MinVK'.padStart(8) + '  Street'.padStart(8) + '  EmpfVK'.padStart(8) + ' Netto€'.padStart(8) + ' Src');
console.log('─'.repeat(120));

for (const r of gruen.sort((a,b) => b.nettoAtEmp - a.nettoAtEmp)) {
  console.log(
    r.brand.padEnd(14) +
    r.name.substring(0, 41).padEnd(42) +
    fmt(r.dsdNetto) +
    fmt(r.ekBrutto) +
    fmt(r.minVK) +
    fmt(r.streetPrice) +
    fmt(r.empVK) +
    fmt(r.nettoAtEmp) +
    (r.source === 'real' ? '  ✓' : '  ~')
  );
}
console.log('─'.repeat(120));
console.log(`  ${gruen.length} Produkte mit guter Marge. ✓ = realer DSD-Preis, ~ = geschätzt`);

// ================================================
// GELB — vielleicht profitable Produkte
// ================================================
console.log('');
console.log('═══════════════════════════════════════════════════════════════════════════════════════════════════════════════════');
console.log(' 🟡 GELBE PRODUKTE — Knapp profitabel, mit Kulanz-Aufschlag möglich');
console.log('═══════════════════════════════════════════════════════════════════════════════════════════════════════════════════');
console.log('');
console.log('Marke'.padEnd(14) + 'Produkt'.padEnd(42) + 'DSD Netto'.padStart(10) + 'EK Brutto'.padStart(10) + '  MinVK'.padStart(8) + '  Street'.padStart(8) + '  EmpfVK'.padStart(8) + ' Netto€'.padStart(8) + ' Src');
console.log('─'.repeat(120));

for (const r of gelb.sort((a,b) => b.nettoAtEmp - a.nettoAtEmp)) {
  console.log(
    r.brand.padEnd(14) +
    r.name.substring(0, 41).padEnd(42) +
    fmt(r.dsdNetto) +
    fmt(r.ekBrutto) +
    fmt(r.minVK) +
    fmt(r.streetPrice) +
    fmt(r.empVK) +
    fmt(r.nettoAtEmp) +
    (r.source === 'real' ? '  ✓' : '  ~')
  );
}
console.log('─'.repeat(120));
console.log(`  ${gelb.length} Produkte knapp profitabel.`);

// ================================================
// ROT — nicht profitable Produkte
// ================================================
console.log('');
console.log('═══════════════════════════════════════════════════════════════════════════════════════════════════════════════════');
console.log(' 🔴 ROTE PRODUKTE — Nicht profitabel bei aktuellem Street Price');
console.log('═══════════════════════════════════════════════════════════════════════════════════════════════════════════════════');
console.log('');
console.log('Marke'.padEnd(14) + 'Produkt'.padEnd(42) + 'DSD Netto'.padStart(10) + 'EK Brutto'.padStart(10) + '  MinVK'.padStart(8) + '  Street'.padStart(8) + ' Verlust'.padStart(8) + ' Src');
console.log('─'.repeat(120));

for (const r of rot.sort((a,b) => a.margin - b.margin)) {
  console.log(
    r.brand.padEnd(14) +
    r.name.substring(0, 41).padEnd(42) +
    fmt(r.dsdNetto) +
    fmt(r.ekBrutto) +
    fmt(r.minVK) +
    fmt(r.streetPrice) +
    fmt(r.margin) +
    (r.source === 'real' ? '  ✓' : '  ~')
  );
}
console.log('─'.repeat(120));
console.log(`  ${rot.length} Produkte NICHT profitabel über DSD.`);

// ================================================
// TOP-EMPFEHLUNGEN
// ================================================
console.log('');
console.log('═══════════════════════════════════════════════════════════════════════════════════════════════════════════════════');
console.log(' 🏆 TOP-EMPFEHLUNGEN — Neue Produkte für unser Sortiment');
console.log('═══════════════════════════════════════════════════════════════════════════════════════════════════════════════════');
console.log('');

// Products NOT currently in our shop that are profitable
const currentSKUs = [
  "NORTON-360-STD-1Y", "NORTON-360-DLX-3D-1Y", "NORTON-360-DLX-5D-1Y", "NORTON-360-PREM-10D-1Y",
  "MCAFEE-IS-1PC-1Y", "MCAFEE-IS-3PC-1Y", "MCAFEE-IS-10D-1Y", "MCAFEE-TP-1PC-1Y", "MCAFEE-TP-10PC-1Y", "MCAFEE-LIVESAFE-UNL-1Y",
  "BITDEF-AV-1PC-1Y", "BITDEF-AV-3PC-1Y", "BITDEF-IS-5PC-1Y", "BITDEF-TS-5D-1Y", "BITDEF-TS-10D-1Y", "BITDEF-TS-10D-2Y", "BITDEF-FAMILY-15D-1Y",
  "TREND-IS-1PC-1Y", "TREND-MAXSEC-5PC-1Y", "TREND-MAXSEC-3PC-2Y",
  "PANDA-ADV-1PC-1Y", "PANDA-ADV-3PC-1Y", "PANDA-COMP-5PC-1Y",
  "FSEC-IS-1PC-1Y",
  "MS365-PERSONAL-1Y", "MS365-FAMILY-1Y", "MS-OFFICE-HS-2021", "MS-OFFICE-HB-2021", "WIN11-HOME-OEM", "WIN11-PRO-OEM",
  "PARALLELS-18-STD-1Y"
];
const currentBrands = ["Norton", "McAfee", "Bitdefender", "Trend Micro", "Panda", "F-Secure", "Microsoft", "Parallels"];
const newBrandProducts = gruen.filter(r => !currentBrands.includes(r.brand));

if (newBrandProducts.length > 0) {
  console.log('  NEUE MARKEN mit guter Marge (sortiert nach Netto-Gewinn):');
  console.log('');
  for (const r of newBrandProducts.sort((a,b) => b.nettoAtEmp - a.nettoAtEmp)) {
    console.log(`    ${r.brand.padEnd(14)} ${r.name.padEnd(45)} EmpfVK €${r.empVK.toFixed(2)}  Netto ~€${r.nettoAtEmp.toFixed(2)}/Stück`);
  }
}

console.log('');
console.log('  PRIORITÄT 1 — Sofort aufnehmen (geschätzte Margen sehr gut):');
console.log('    1. ESET HOME Security Essential (1/3/5D) — Premium-Marke, hohe Margen');
console.log('    2. Kaspersky Standard/Plus (1/3/5D) — Massenmarkt, Top-Margen');
console.log('    3. Avast/AVG Premium Security — Günstige EK, bekannte Marken');
console.log('    4. G DATA (Internet/Total Security) — "Made in Germany" Premium');
console.log('');
console.log('  PRIORITÄT 2 — Nach DSD-Preisbestätigung:');
console.log('    5. McAfee+ Premium Family — Erweiterung bestehender McAfee-Reihe');
console.log('    6. Norton 360 Advanced — Premium-Erweiterung');
console.log('    7. Kaspersky Premium 5D — High-Value Produkt');
console.log('');

// ================================================
// NÄCHSTE SCHRITTE
// ================================================
console.log('═══════════════════════════════════════════════════════════════════════════════════════════════════════════════════');
console.log(' ⚡ NÄCHSTE SCHRITTE');
console.log('═══════════════════════════════════════════════════════════════════════════════════════════════════════════════════');
console.log('');
console.log('  🚨 BLOCKER: DSD API-Session funktioniert nicht!');
console.log('    → login.json gibt IMMER "success" (auch ohne Credentials)');
console.log('    → Alle Daten-Endpoints: "Not logged in" (Session verliert sich)');
console.log('    → Ursache: Cloudflare + PHP Session-Management');
console.log('    → LÖSUNG: DSD Europa kontaktieren (support@dsdeurope.nl):');
console.log('');
console.log('    Betreff: "API-Zugang medialess_apitest — Session-Problem"');
console.log('    Text: "Unser API-Account medialess_apitest kann sich einloggen,');
console.log('           aber alle weiteren Requests (index.json, view.json)');
console.log('           geben error_code 11 (Not logged in) zurück.');
console.log('           Wahrscheinlich gehen PHP-Sessions durch Cloudflare');
console.log('           verloren. Bitte prüfen Sie die Session-Konfiguration.');
console.log('           IP Whitelist: 178.104.52.53"');
console.log('');
console.log('  📋 WENN DSD API REPARIERT:');
console.log('    1. Kompletten Katalog abrufen (alle Seiten)');
console.log('    2. Exakte DSD-Preise für geschätzte Produkte verifizieren');
console.log('    3. Neue Produkte mit bestätigter Marge in DB aufnehmen');
console.log('    4. Produkt-Seiten für neue Marken erstellen');
console.log('');
console.log('  💰 SCHNELLE ERWEITERUNG OHNE API:');
console.log('    → DSD Webportal manuell einloggen (Portal-Credentials != API!)');
console.log('    → Preisliste CSV/PDF anfordern bei DSD Account Manager');
console.log('    → Telefonisch: +31 (0)13 4600 560');
console.log('');
