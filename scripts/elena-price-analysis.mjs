#!/usr/bin/env node
/**
 * Elena (Finanzen): Kritische Preisanalyse — DB-Preise vs. reale DSD-EK vs. Marktpreise
 * 
 * Datenquellen:
 * - DB-Seed: packages/db/prisma/seed.ts (aktuelle Shop-Preise)
 * - DSD-EK: Tatsächliche Einkaufspreise von DSD Europe (exkl. MwSt, innergemeinschaftlich)
 * - Marktpreise: Recherche Amazon.de, Lizenzguru.de, idealo.de (März 2026)
 * 
 * Formel: Netto = VK × 0.9 (Shuffle-Bag 10% Erstattung) - EK - Stripe(VK × 0.029 + 0.25)
 * Kleinunternehmer §19 UStG → keine MwSt auf unsere Preise
 */

// ==========================================
// ALLE 26 DB-PRODUKTE MIT REALEN DATEN
// ==========================================
const products = [
  // ===== NORTON =====
  {
    sku: "NORTON-360-STD-1Y",
    name: "Norton 360 Standard 1D 1J",
    brand: "Norton",
    dbEK: 6.00,      // Seed-EK (optimistisch)
    realDsdEK: 16.00, // Wahrer DSD-EK exkl. MwSt
    dbVK: 14.99,      // Aktueller Shop-Preis
    marktPreis: 11.99, // Amazon Bestpreis
    marktRange: "8,90-14,99", // Lizenzguru/Amazon Range
    quelle: "Amazon €11,99 / Lizenzguru ab €8,90"
  },
  {
    sku: "NORTON-360-DLX-3D-1Y",
    name: "Norton 360 Deluxe 3D 1J",
    brand: "Norton",
    dbEK: 8.00,
    realDsdEK: 17.00,
    dbVK: 19.99,
    marktPreis: 17.99,
    marktRange: "11,90-21,99",
    quelle: "Amazon €21,99 / Lizenzguru ab €11,90"
  },
  {
    sku: "NORTON-360-DLX-5D-1Y",
    name: "Norton 360 Deluxe 5D 1J",
    brand: "Norton",
    dbEK: 11.75,
    realDsdEK: 19.00,
    dbVK: 24.99,
    marktPreis: 22.90,
    marktRange: "19,90-24,99",
    quelle: "Lizenzguru €22,90 / Amazon ~€24,99"
  },
  {
    sku: "NORTON-360-PREM-10D-1Y",
    name: "Norton 360 Premium 10D 1J",
    brand: "Norton",
    dbEK: 14.40,
    realDsdEK: 22.00,
    dbVK: 34.99,
    marktPreis: 27.95,
    marktRange: "19,90-34,90",
    quelle: "Amazon €24,99 / Lizenzguru €27,95"
  },

  // ===== McAFEE =====
  {
    sku: "MCAFEE-IS-1PC-1Y",
    name: "McAfee Internet Security 1PC 1J",
    brand: "McAfee",
    dbEK: 3.25,
    realDsdEK: 3.25, // McAfee IS nicht in DSD-Liste → günstiger OEM
    dbVK: 9.99,
    marktPreis: 7.99,
    marktRange: "5,99-12,99",
    quelle: "Amazon ~€7,99 / Idealo ~€8,99"
  },
  {
    sku: "MCAFEE-IS-3PC-1Y",
    name: "McAfee Internet Security 3PC 1J",
    brand: "McAfee",
    dbEK: 4.20,
    realDsdEK: 4.20,
    dbVK: 12.99,
    marktPreis: 9.99,
    marktRange: "7,99-14,99",
    quelle: "Amazon ~€9,99 / Idealo ~€11,99"
  },
  {
    sku: "MCAFEE-IS-10D-1Y",
    name: "McAfee Internet Security 10D 1J",
    brand: "McAfee",
    dbEK: 4.90,
    realDsdEK: 4.90,
    dbVK: 14.99,
    marktPreis: 11.99,
    marktRange: "9,99-17,99",
    quelle: "Geschätzt ~€11,99"
  },
  {
    sku: "MCAFEE-TP-1PC-1Y",
    name: "McAfee Total Protection 1PC 1J",
    brand: "McAfee",
    dbEK: 7.80,
    realDsdEK: 10.00, // DSD TP 3-PC EK
    dbVK: 14.99,
    marktPreis: 9.99,
    marktRange: "7,99-14,99",
    quelle: "Amazon ~€9,99"
  },
  {
    sku: "MCAFEE-TP-10PC-1Y",
    name: "McAfee Total Protection 10PC 1J",
    brand: "McAfee",
    dbEK: 11.80,
    realDsdEK: 16.00, // DSD TP Unlimited EK (nächster Vergleich)
    dbVK: 24.99,
    marktPreis: 19.99,
    marktRange: "14,99-29,99",
    quelle: "Amazon ~€19,99"
  },
  {
    sku: "MCAFEE-LIVESAFE-UNL-1Y",
    name: "McAfee LiveSafe Unbegrenzt 1J",
    brand: "McAfee",
    dbEK: 14.80,
    realDsdEK: 16.00, // DSD TP Unlimited
    dbVK: 29.99,
    marktPreis: 24.99,
    marktRange: "19,99-34,99",
    quelle: "Amazon ~€24,99 / Idealo ~€22,99"
  },

  // ===== TREND MICRO =====
  {
    sku: "TREND-IS-1PC-1Y",
    name: "Trend Micro IS 1PC 1J",
    brand: "Trend Micro",
    dbEK: 3.70,
    realDsdEK: 16.79, // DSD150002
    dbVK: 9.99,
    marktPreis: 9.99,
    marktRange: "7,99-14,99",
    quelle: "Amazon ~€12,99 / Idealo ~€9,99"
  },
  {
    sku: "TREND-IS-3PC-1Y",
    name: "Trend Micro IS 3PC 1J",
    brand: "Trend Micro",
    dbEK: 4.90,
    realDsdEK: 8.50, // Geschätzt proportional
    dbVK: 12.99,
    marktPreis: 11.99,
    marktRange: "9,99-16,99",
    quelle: "Amazon ~€14,99 / Geschätzt"
  },
  {
    sku: "TREND-IS-5PC-2Y",
    name: "Trend Micro IS 5PC 2J",
    brand: "Trend Micro",
    dbEK: 9.90,
    realDsdEK: 15.00, // Geschätzt
    dbVK: 19.99,
    marktPreis: 17.99,
    marktRange: "14,99-24,99",
    quelle: "Geschätzt ~€17,99"
  },
  {
    sku: "TREND-MAXSEC-5PC-1Y",
    name: "Trend MaxSec 5D 1J",
    brand: "Trend Micro",
    dbEK: 8.20,
    realDsdEK: 30.24, // DSD151022
    dbVK: 16.99,
    marktPreis: 16.99,
    marktRange: "14,99-24,99",
    quelle: "Idealo ~€19,99 / Geschätzt"
  },
  {
    sku: "TREND-MAXSEC-3PC-2Y",
    name: "Trend MaxSec 3D 2J",
    brand: "Trend Micro",
    dbEK: 7.50,
    realDsdEK: 26.87, // DSD151021
    dbVK: 14.99,
    marktPreis: 16.99,
    marktRange: "14,99-22,99",
    quelle: "Idealo ~€19,99 / Geschätzt"
  },
  {
    sku: "TREND-MAXSEC-5PC-2Y",
    name: "Trend MaxSec 5D 2J",
    brand: "Trend Micro",
    dbEK: 10.20,
    realDsdEK: 22.00, // Geschätzt zwischen 1J und 3J
    dbVK: 19.99,
    marktPreis: 22.99,
    marktRange: "19,99-29,99",
    quelle: "Geschätzt ~€22,99"
  },
  {
    sku: "TREND-MAXSEC-3PC-3Y",
    name: "Trend MaxSec 3D 3J",
    brand: "Trend Micro",
    dbEK: 12.10,
    realDsdEK: 28.00, // Geschätzt
    dbVK: 22.99,
    marktPreis: 24.99,
    marktRange: "19,99-29,99",
    quelle: "Geschätzt ~€24,99"
  },
  {
    sku: "TREND-MAXSEC-5PC-3Y",
    name: "Trend MaxSec 5D 3J",
    brand: "Trend Micro",
    dbEK: 13.90,
    realDsdEK: 32.00, // Geschätzt
    dbVK: 24.99,
    marktPreis: 29.99,
    marktRange: "24,99-39,99",
    quelle: "Geschätzt ~€29,99"
  },

  // ===== BITDEFENDER =====
  {
    sku: "BITDEF-AV-1PC-1Y",
    name: "Bitdefender AV+ 1PC 1J",
    brand: "Bitdefender",
    dbEK: 10.30,
    realDsdEK: 17.35, // 160085
    dbVK: 17.99,
    marktPreis: 14.99,
    marktRange: "12,99-19,99",
    quelle: "Amazon ~€14,99 / Idealo ~€12,99"
  },
  {
    sku: "BITDEF-AV-3PC-1Y",
    name: "Bitdefender AV+ 3PC 1J",
    brand: "Bitdefender",
    dbEK: 15.00,
    realDsdEK: 23.14, // 160088
    dbVK: 24.99,
    marktPreis: 19.99,
    marktRange: "17,99-29,99",
    quelle: "Amazon ~€19,99 / Idealo ~€18,99"
  },
  {
    sku: "BITDEF-IS-5PC-1Y",
    name: "Bitdefender IS 5PC 1J",
    brand: "Bitdefender",
    dbEK: 22.00,
    realDsdEK: 49.74, // 160100
    dbVK: 34.99,
    marktPreis: 29.99,
    marktRange: "24,99-39,99",
    quelle: "Amazon ~€29,99 / Idealo ~€27,99"
  },
  {
    sku: "BITDEF-TS-5D-1Y",
    name: "Bitdefender TS 5D 1J",
    brand: "Bitdefender",
    dbEK: 29.00,
    realDsdEK: 39.00, // 160103
    dbVK: 44.99,
    marktPreis: 34.99,
    marktRange: "29,99-49,99",
    quelle: "Amazon ~€34,99 / Idealo ~€32,99"
  },
  {
    sku: "BITDEF-TS-10D-1Y",
    name: "Bitdefender TS 10D 1J",
    brand: "Bitdefender",
    dbEK: 29.00,
    realDsdEK: 54.96, // 160106
    dbVK: 44.99,
    marktPreis: 39.99,
    marktRange: "34,99-54,99",
    quelle: "Idealo ~€39,99 / Amazon ~€44,99"
  },
  {
    sku: "BITDEF-TS-10D-2Y",
    name: "Bitdefender TS 10D 2J",
    brand: "Bitdefender",
    dbEK: 48.60,
    realDsdEK: 86.77, // 160107
    dbVK: 69.99,
    marktPreis: 59.99,
    marktRange: "49,99-79,99",
    quelle: "Idealo ~€59,99 / Geschätzt"
  },
  {
    sku: "BITDEF-FAMILY-15D-1Y",
    name: "Bitdefender Family 15D 1J",
    brand: "Bitdefender",
    dbEK: 30.00,
    realDsdEK: 56.40, // 160114
    dbVK: 49.99,
    marktPreis: 44.99,
    marktRange: "39,99-59,99",
    quelle: "Idealo ~€44,99 / Amazon ~€49,99"
  },

  // ===== PANDA =====
  {
    sku: "PANDA-ADV-1PC-1Y",
    name: "Panda Dome Advanced 1PC 1J",
    brand: "Panda",
    dbEK: 4.40,
    realDsdEK: 12.38, // 170007
    dbVK: 9.99,
    marktPreis: 9.99,
    marktRange: "7,99-14,99",
    quelle: "Amazon ~€12,99 / Idealo ~€9,99"
  },
  {
    sku: "PANDA-ADV-3PC-1Y",
    name: "Panda Dome Advanced 3PC 1J",
    brand: "Panda",
    dbEK: 6.80,
    realDsdEK: 20.64, // 170005
    dbVK: 14.99,
    marktPreis: 14.99,
    marktRange: "12,99-19,99",
    quelle: "Amazon ~€17,99 / Geschätzt"
  },
  {
    sku: "PANDA-COMP-5PC-1Y",
    name: "Panda Dome Complete 5PC 1J",
    brand: "Panda",
    dbEK: 22.00,
    realDsdEK: 30.97, // 170011
    dbVK: 34.99,
    marktPreis: 29.99,
    marktRange: "24,99-39,99",
    quelle: "Geschätzt ~€29,99"
  },

  // ===== F-SECURE =====
  {
    sku: "FSEC-IS-1PC-1Y",
    name: "F-Secure IS 1PC 1J",
    brand: "F-Secure",
    dbEK: 9.00,
    realDsdEK: 28.87, // 460017
    dbVK: 17.99,
    marktPreis: 17.99,
    marktRange: "14,99-24,99",
    quelle: "Amazon ~€19,99 / Idealo ~€17,99"
  },
  {
    sku: "FSEC-SAFE-3D-1Y",
    name: "F-Secure Safe 3D 1J",
    brand: "F-Secure",
    dbEK: 28.75,
    realDsdEK: 35.00, // Geschätzt (kein exaktes Match in DSD)
    dbVK: 44.99,
    marktPreis: 34.99,
    marktRange: "29,99-44,99",
    quelle: "Amazon ~€34,99 / Geschätzt"
  },

  // ===== MICROSOFT 365 =====
  {
    sku: "MS365-PERSONAL-1Y",
    name: "Microsoft 365 Personal 1J",
    brand: "Microsoft",
    dbEK: 45.00,
    realDsdEK: 72.50, // DSD270026
    dbVK: 59.99,
    marktPreis: 49.99,
    marktRange: "44,99-59,99",
    quelle: "Amazon €49,99 / Idealo €47,99"
  },
  {
    sku: "MS365-FAMILY-1Y",
    name: "Microsoft 365 Family 1J",
    brand: "Microsoft",
    dbEK: 45.00,
    realDsdEK: 92.50, // DSD270015
    dbVK: 69.99,
    marktPreis: 59.99,
    marktRange: "54,99-72,99",
    quelle: "Amazon €59,99 / Idealo €57,99"
  },
  {
    sku: "MS-OFFICE-HS-2021",
    name: "Office Home & Student 2021",
    brand: "Microsoft",
    dbEK: 85.00,
    realDsdEK: 85.00, // 270052
    dbVK: 109.99,
    marktPreis: 89.99,
    marktRange: "79,99-119,99",
    quelle: "Amazon ~€99,99 / Idealo ~€89,99"
  },
  {
    sku: "MS-OFFICE-HB-2021",
    name: "Office Home & Business 2021",
    brand: "Microsoft",
    dbEK: 180.00,
    realDsdEK: 176.00, // 270053
    dbVK: 219.99,
    marktPreis: 179.99,
    marktRange: "159,99-229,99",
    quelle: "Amazon ~€189,99 / Idealo ~€179,99"
  },
  {
    sku: "WIN11-HOME-OEM",
    name: "Windows 11 Home OEM",
    brand: "Microsoft",
    dbEK: 96.00,
    realDsdEK: 99.90, // DSD340083
    dbVK: 119.99,
    marktPreis: 99.99,
    marktRange: "89,99-129,99",
    quelle: "Amazon ~€109,99 / Idealo ~€99,99"
  },
  {
    sku: "WIN11-PRO-OEM",
    name: "Windows 11 Pro OEM",
    brand: "Microsoft",
    dbEK: 121.50,
    realDsdEK: 119.90, // DSD340084
    dbVK: 149.99,
    marktPreis: 129.99,
    marktRange: "109,99-159,99",
    quelle: "Amazon ~€139,99 / Idealo ~€129,99"
  },
  {
    sku: "PARALLELS-18-STD-1Y",
    name: "Parallels Desktop 18 Std 1J",
    brand: "Parallels",
    dbEK: 71.00,
    realDsdEK: 71.00, // Gleich
    dbVK: 89.99,
    marktPreis: 79.99,
    marktRange: "69,99-99,99",
    quelle: "Parallels.com €99,99 / Amazon ~€79,99"
  },
];


// ==========================================
// ANALYSE-ENGINE
// ==========================================

const fmt = (n) => n.toFixed(2).padStart(8);
const fmtPct = (n) => (n.toFixed(1) + '%').padStart(8);

function calcNetto(vk, ek) {
  const shuffleLoss = vk * 0.10;    // 10% der Käufe erstattet (Shuffle-Bag)
  const stripeFee = vk * 0.029 + 0.25;
  return vk - shuffleLoss - ek - stripeFee;
}

console.log('');
console.log('╔══════════════════════════════════════════════════════════════════════════════════════════════════╗');
console.log('║  ELENA (FINANZEN) — KRITISCHE PREISANALYSE 1of10                                               ║');
console.log('║  Datum: März 2026 | Kleinunternehmer §19 UStG | Shuffle-Bag 10% Erstattung                    ║');
console.log('╚══════════════════════════════════════════════════════════════════════════════════════════════════╝');

// ==========================================
// TEIL 1: SEED-EK vs. REAL-DSD-EK
// ==========================================
console.log('\n');
console.log('═══════════════════════════════════════════════════════════════════════════════════════');
console.log(' TEIL 1: EK-DISKREPANZ — Seed vs. realer DSD-EK');
console.log('═══════════════════════════════════════════════════════════════════════════════════════');
console.log('');
console.log('Produkt'.padEnd(35) + 'Seed-EK'.padStart(9) + 'DSD-EK'.padStart(9) + '  Diff'.padStart(9) + '  Status');
console.log('─'.repeat(85));

let discrepancies = 0;
for (const p of products) {
  const diff = p.realDsdEK - p.dbEK;
  const status = diff > 5 ? '🚨 KRITISCH' : diff > 1 ? '⚠️ ABWEICHUNG' : '✅ OK';
  if (diff > 1) discrepancies++;
  console.log(
    p.name.padEnd(35) +
    fmt(p.dbEK) +
    fmt(p.realDsdEK) +
    fmt(diff) +
    '  ' + status
  );
}
console.log('─'.repeat(85));
console.log(`⚠️  ${discrepancies} von ${products.length} Produkten haben eine EK-Diskrepanz > €1!`);


// ==========================================
// TEIL 2: PROFITABILITÄT MIT SEED-EK (aktuelle DB)
// ==========================================
console.log('\n');
console.log('═══════════════════════════════════════════════════════════════════════════════════════');
console.log(' TEIL 2a: Profitabilität bei AKTUELLEM SHOP-PREIS (VK) & SEED-EK');
console.log(' Formel: Netto = VK×0.9 - EK - Stripe(VK×0.029+0.25)');
console.log('═══════════════════════════════════════════════════════════════════════════════════════');
console.log('');
console.log('Produkt'.padEnd(35) + '   VK'.padStart(8) + '   EK'.padStart(8) + ' Netto'.padStart(8) + ' Marge%'.padStart(8) + '  Kategorie');
console.log('─'.repeat(90));

const seedResults = [];
for (const p of products) {
  const netto = calcNetto(p.dbVK, p.dbEK);
  const margePct = (netto / p.dbVK) * 100;
  const kat = netto > 3 ? '✅ PROFITABEL' : netto > 0 ? '⚡ MARGINAL' : '❌ VERLUST';
  seedResults.push({ ...p, netto, margePct, kat });
  console.log(
    p.name.padEnd(35) +
    fmt(p.dbVK) +
    fmt(p.dbEK) +
    fmt(netto) +
    fmtPct(margePct) +
    '  ' + kat
  );
}
console.log('─'.repeat(90));
const seedProfitable = seedResults.filter(r => r.netto > 3).length;
const seedMarginal = seedResults.filter(r => r.netto > 0 && r.netto <= 3).length;
const seedVerlust = seedResults.filter(r => r.netto <= 0).length;
const avgSeedNetto = seedResults.reduce((s, r) => s + r.netto, 0) / seedResults.length;
console.log(`Ø Netto: ${avgSeedNetto.toFixed(2)} € | ✅ ${seedProfitable} profitabel | ⚡ ${seedMarginal} marginal | ❌ ${seedVerlust} Verlust`);


// ==========================================
// TEIL 2b: PROFITABILITÄT MIT REALEM DSD-EK
// ==========================================
console.log('\n');
console.log('═══════════════════════════════════════════════════════════════════════════════════════');
console.log(' TEIL 2b: Profitabilität bei AKTUELLEM SHOP-PREIS (VK) & REALEM DSD-EK');
console.log(' ⚠️  DAS IST DIE REALITÄT wenn wir bei DSD bestellen!');
console.log('═══════════════════════════════════════════════════════════════════════════════════════');
console.log('');
console.log('Produkt'.padEnd(35) + '   VK'.padStart(8) + ' DSD-EK'.padStart(8) + ' Netto'.padStart(8) + ' Marge%'.padStart(8) + '  Kategorie');
console.log('─'.repeat(90));

const realResults = [];
for (const p of products) {
  const netto = calcNetto(p.dbVK, p.realDsdEK);
  const margePct = (netto / p.dbVK) * 100;
  const kat = netto > 3 ? '✅ PROFITABEL' : netto > 0 ? '⚡ MARGINAL' : '❌ VERLUST';
  realResults.push({ ...p, netto, margePct, kat });
  console.log(
    p.name.padEnd(35) +
    fmt(p.dbVK) +
    fmt(p.realDsdEK) +
    fmt(netto) +
    fmtPct(margePct) +
    '  ' + kat
  );
}
console.log('─'.repeat(90));
const realProfitable = realResults.filter(r => r.netto > 3).length;
const realMarginal = realResults.filter(r => r.netto > 0 && r.netto <= 3).length;
const realVerlust = realResults.filter(r => r.netto <= 0).length;
const avgRealNetto = realResults.reduce((s, r) => s + r.netto, 0) / realResults.length;
console.log(`Ø Netto: ${avgRealNetto.toFixed(2)} € | ✅ ${realProfitable} profitabel | ⚡ ${realMarginal} marginal | ❌ ${realVerlust} Verlust`);


// ==========================================
// TEIL 3: MARKTPREIS-VERGLEICH — Können wir konkurrieren?
// ==========================================
console.log('\n');
console.log('═══════════════════════════════════════════════════════════════════════════════════════');
console.log(' TEIL 3: MARKTPREIS-VERGLEICH — Unser VK vs. Markt');
console.log(' Frage: Ist unser Preis wettbewerbsfähig? (10%-Erstattung = Differenzierung)');
console.log('═══════════════════════════════════════════════════════════════════════════════════════');
console.log('');
console.log('Produkt'.padEnd(35) + 'Unser VK'.padStart(10) + '   Markt'.padStart(10) + '    Diff'.padStart(10) + '  Bewertung');
console.log('─'.repeat(90));

for (const p of products) {
  const diff = p.dbVK - p.marktPreis;
  const pctAbove = (diff / p.marktPreis * 100);
  let bew;
  if (diff <= 0) bew = '🔥 GÜNSTIGER als Markt';
  else if (pctAbove <= 15) bew = '👌 Akzeptabel (+' + pctAbove.toFixed(0) + '%)';
  else if (pctAbove <= 30) bew = '⚠️ Teuer (+' + pctAbove.toFixed(0) + '%)';
  else bew = '❌ Viel zu teuer (+' + pctAbove.toFixed(0) + '%)';
  
  console.log(
    p.name.padEnd(35) +
    fmt(p.dbVK) +
    fmt(p.marktPreis) +
    fmt(diff) +
    '  ' + bew
  );
}


// ==========================================
// TEIL 4: OPTIMALER VK bei REALEM DSD-EK
// ==========================================
console.log('\n');
console.log('═══════════════════════════════════════════════════════════════════════════════════════');
console.log(' TEIL 4: OPTIMALER VERKAUFSPREIS bei realem DSD-EK');
console.log(' Ziel: Mind. €3 Netto = Netto nach 10% Erstattung, Stripe, EK');
console.log(' Formel: MinVK = (EK + 3 + 0.25) / (0.9 - 0.029)');
console.log('═══════════════════════════════════════════════════════════════════════════════════════');
console.log('');
console.log('Produkt'.padEnd(35) + ' DSD-EK'.padStart(8) + ' MinVK€3'.padStart(9) + ' Markt€'.padStart(9) + ' Diff'.padStart(8) + '  Machbar?');
console.log('─'.repeat(95));

const recommendations = { behalten: [], preisAnpassen: [], rauswerfen: [] };

for (const p of products) {
  const minVK3 = (p.realDsdEK + 3 + 0.25) / (0.9 - 0.029);
  const diff = minVK3 - p.marktPreis;
  const pctAbove = (diff / p.marktPreis * 100);
  
  let machbar;
  if (diff <= 0) {
    machbar = '✅ JA — unter Markt';
    recommendations.behalten.push({ ...p, empfVK: Math.max(minVK3, p.marktPreis * 0.95).toFixed(2), minVK3: minVK3.toFixed(2) });
  } else if (pctAbove <= 20) {
    machbar = '⚡ KNAPP — +' + pctAbove.toFixed(0) + '% über Markt';
    recommendations.preisAnpassen.push({ ...p, empfVK: (p.marktPreis * 1.10).toFixed(2), minVK3: minVK3.toFixed(2), nettoAtMarkt: calcNetto(p.marktPreis * 1.10, p.realDsdEK).toFixed(2) });
  } else {
    machbar = '❌ NEIN — +' + pctAbove.toFixed(0) + '% über Markt';
    recommendations.rauswerfen.push({ ...p, minVK3: minVK3.toFixed(2), marktDiff: pctAbove.toFixed(0) });
  }
  
  console.log(
    p.name.padEnd(35) +
    fmt(p.realDsdEK) +
    ('€' + minVK3.toFixed(2)).padStart(9) +
    ('€' + p.marktPreis.toFixed(2)).padStart(9) +
    fmt(diff) +
    '  ' + machbar
  );
}


// ==========================================
// TEIL 5: HANDLUNGSEMPFEHLUNG
// ==========================================
console.log('\n');
console.log('╔══════════════════════════════════════════════════════════════════════════════════════════════════╗');
console.log('║  HANDLUNGSEMPFEHLUNG                                                                            ║');
console.log('╚══════════════════════════════════════════════════════════════════════════════════════════════════╝');

console.log('\n🟢 BEHALTEN & VERKAUFEN (' + recommendations.behalten.length + ' Produkte):');
console.log('   MinVK für €3 Netto liegt UNTER oder nahe Marktpreis → profitabel.');
console.log('   ───────────────────────────────────────────────────────────────');
for (const r of recommendations.behalten) {
  const netto = calcNetto(Number(r.empfVK), r.realDsdEK);
  console.log(`   ${r.name.padEnd(35)} EmpfVK: €${r.empfVK.padStart(7)} → Netto: €${netto.toFixed(2).padStart(6)}`);
}

console.log('\n🟡 MIT PREISANPASSUNG MÖGLICH (' + recommendations.preisAnpassen.length + ' Produkte):');
console.log('   Brauchen höheren VK als Markt, aber 10%-Erstattung kann das rechtfertigen.');
console.log('   ───────────────────────────────────────────────────────────────');
for (const r of recommendations.preisAnpassen) {
  console.log(`   ${r.name.padEnd(35)} VK: €${r.empfVK.padStart(7)} (Markt+10%) → Netto: €${r.nettoAtMarkt.padStart(6)}`);
}

console.log('\n🔴 RAUSWERFEN (' + recommendations.rauswerfen.length + ' Produkte):');
console.log('   DSD-EK zu hoch — selbst mit Aufschlag nicht konkurrenzfähig.');
console.log('   ───────────────────────────────────────────────────────────────');
for (const r of recommendations.rauswerfen) {
  console.log(`   ${r.name.padEnd(35)} DSD-EK: €${fmt(r.realDsdEK)} | MinVK: €${r.minVK3} (+${r.marktDiff}% über Markt)`);
}


// ==========================================
// TEIL 6: KERNPROBLEM-ANALYSE
// ==========================================
console.log('\n');
console.log('═══════════════════════════════════════════════════════════════════════════════════════');
console.log(' KERNPROBLEM-ANALYSE');
console.log('═══════════════════════════════════════════════════════════════════════════════════════');

const seedEKtotal = products.reduce((s, p) => s + p.dbEK, 0);
const realEKtotal = products.reduce((s, p) => s + p.realDsdEK, 0);
const ekIncrease = ((realEKtotal - seedEKtotal) / seedEKtotal * 100);

console.log(`
PROBLEM 1: EK-Diskrepanz
  Seed-EK Summe:     €${seedEKtotal.toFixed(2)}
  Realer DSD-EK:     €${realEKtotal.toFixed(2)}
  Differenz:         +${(realEKtotal - seedEKtotal).toFixed(2)} € (+${ekIncrease.toFixed(0)}%)
  → Die DB-Seed-Preise waren VIEL zu optimistisch!

PROBLEM 2: DSD-EK > Marktpreis bei einigen Produkten
  Das passiert bei Produkten wo Großhändler/Key-Shops
  über Volumen UND Grey-Market-Keys den Preis drücken.
  DSD verkauft offizielle Lizenzen — die sind teurer.

PROBLEM 3: Seed-EK vs. DSD-EK
  Die DB enthält aktuell die SEED-Preise, NICHT die DSD-Preise.
  → Wenn wir über DSD bestellen, sind die wahren Kosten HÖHER.
  → Die Seed-Preise müssen auf DSD-EK korrigiert werden!

STRATEGISCHE OPTIONEN:
  A) Seed-EK beibehalten (= andere EK-Quelle als DSD finden)
  B) DSD-EK akzeptieren → VK erhöhen + auf 10%-USP setzen
  C) Hybrid: Günstige Produkte über DSD, teure Produkte streichen
  D) Volumen-Rabatte mit DSD verhandeln
`);

// ==========================================
// TEIL 7: TOP-10 profitabelste Produkte (bei Seed-EK)
// ==========================================
console.log('═══════════════════════════════════════════════════════════════════════════════════════');
console.log(' TOP-10 PROFITABELSTE PRODUKTE (bei aktuellem Seed-EK & Shop-VK)');
console.log('═══════════════════════════════════════════════════════════════════════════════════════');
const sortedSeed = [...seedResults].sort((a, b) => b.netto - a.netto);
for (let i = 0; i < 10; i++) {
  const r = sortedSeed[i];
  console.log(`  ${(i+1).toString().padStart(2)}. ${r.name.padEnd(35)} Netto: €${r.netto.toFixed(2).padStart(6)}  (VK €${r.dbVK}, EK €${r.dbEK})`);
}

console.log('\n');
console.log('═══════════════════════════════════════════════════════════════════════════════════════');
console.log(' TOP-10 PROFITABELSTE PRODUKTE (bei REALEM DSD-EK & Shop-VK)');
console.log('═══════════════════════════════════════════════════════════════════════════════════════');
const sortedReal = [...realResults].sort((a, b) => b.netto - a.netto);
for (let i = 0; i < 10; i++) {
  const r = sortedReal[i];
  console.log(`  ${(i+1).toString().padStart(2)}. ${r.name.padEnd(35)} Netto: €${r.netto.toFixed(2).padStart(6)}  (VK €${r.dbVK}, DSD-EK €${r.realDsdEK})`);
}

console.log('\n');
console.log('═══════════════════════════════════════════════════════════════════════════════════════');
console.log(' FAZIT');
console.log('═══════════════════════════════════════════════════════════════════════════════════════');
console.log(`
  MIT SEED-EK (optimistisch):
    ✅ ${seedProfitable} profitabel (>€3) | ⚡ ${seedMarginal} marginal | ❌ ${seedVerlust} Verlust
    Ø Netto/Kauf: €${avgSeedNetto.toFixed(2)}
    → BEI SEED-EK wäre das Geschäft grundsätzlich funktionsfähig.

  MIT REALEM DSD-EK:
    ✅ ${realProfitable} profitabel (>€3) | ⚡ ${realMarginal} marginal | ❌ ${realVerlust} Verlust
    Ø Netto/Kauf: €${avgRealNetto.toFixed(2)}
    → Massive Verluste bei ${realVerlust} Produkten!

  EMPFEHLUNG:
    1. SOFORT klären: Woher kommen die Seed-EK-Preise?
       Sind das verhandelte Konditionen oder Wunschdenken?
    2. Wenn Seed-EK = reale Alternative (z.B. anderer Lieferant):
       → Nicht über DSD bestellen, sondern günstigere Quelle nutzen
    3. Wenn DSD einziger Lieferant:
       → ${recommendations.rauswerfen.length} Produkte RAUSNEHMEN
       → Fokus auf die ${recommendations.behalten.length} profitablen Produkte
       → VK-Preise der mittelguten Produkte anpassen (+10-20% über Markt)
    4. 10%-Erstattung kommunizieren als USP für den Aufpreis!
`);
