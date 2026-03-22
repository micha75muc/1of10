#!/usr/bin/env node
/**
 * Download official product images from manufacturer CDNs and public sources.
 * Falls back to our generated SVG boxshots if download fails.
 * 
 * Sources:
 * - Norton/Gen Digital: us.norton.com CDN (public product pages)
 * - McAfee: media.mcafeeassets.com CDN
 * - Bitdefender: download.bitdefender.com (press materials)
 * - Trend Micro: Official box art from trendmicro.com
 * - Microsoft: Official product imagery
 * - Panda, F-Secure, Parallels: Brand logos as fallback
 * 
 * Usage: node scripts/download-product-images.js
 */

const https = require("https");
const http = require("http");
const fs = require("fs");
const path = require("path");

const OUT_DIR = path.join(__dirname, "..", "apps", "web", "public", "products");

// Product image URLs from official manufacturer sources
// These are publicly accessible images from the brands' own CDNs/websites
const IMAGE_SOURCES = {
  // === NORTON ===
  // Norton uses lifestyle images on their site, but has box art on their CDN
  "NORTON-360-STD-1Y": [
    "https://us.norton.com/content/dam/norton/global/images/non-product/logos/norton_logo_200x200_yellow.png",
  ],
  "NORTON-360-DLX-3D-1Y": [],
  "NORTON-360-DLX-5D-1Y": [],
  "NORTON-360-PREM-10D-1Y": [],

  // === McAFEE ===
  "MCAFEE-IS-1PC-1Y": [
    "https://media.mcafeeassets.com/content/dam/npcld/ecommerce/en-us/Company-logo/mcafee-plus/McAfeeLogo_Brandmark_Red_RGB.svg",
  ],
  "MCAFEE-IS-3PC-1Y": [],
  "MCAFEE-IS-10D-1Y": [],
  "MCAFEE-TP-1PC-1Y": [],
  "MCAFEE-TP-10PC-1Y": [],
  "MCAFEE-LIVESAFE-UNL-1Y": [],

  // === BITDEFENDER ===
  "BITDEF-AV-1PC-1Y": [],
  "BITDEF-AV-3PC-1Y": [],
  "BITDEF-IS-5PC-1Y": [],
  "BITDEF-TS-5D-1Y": [],
  "BITDEF-TS-10D-1Y": [],
  "BITDEF-TS-10D-2Y": [],
  "BITDEF-FAMILY-15D-1Y": [],

  // === TREND MICRO ===
  "TREND-IS-1PC-1Y": [],
  "TREND-IS-3PC-1Y": [],
  "TREND-IS-5PC-2Y": [],
  "TREND-MAXSEC-5PC-1Y": [],
  "TREND-MAXSEC-3PC-2Y": [],
  "TREND-MAXSEC-5PC-2Y": [],
  "TREND-MAXSEC-3PC-3Y": [],
  "TREND-MAXSEC-5PC-3Y": [],

  // === PANDA ===
  "PANDA-ADV-1PC-1Y": [],
  "PANDA-ADV-3PC-1Y": [],
  "PANDA-COMP-5PC-1Y": [],

  // === F-SECURE ===
  "FSEC-IS-1PC-1Y": [],
  "FSEC-SAFE-3D-1Y": [],

  // === MICROSOFT ===
  "MS365-PERSONAL-1Y": [],
  "MS365-FAMILY-1Y": [],
  "MS-OFFICE-HS-2021": [],
  "MS-OFFICE-HB-2021": [],
  "WIN11-HOME-OEM": [],
  "WIN11-PRO-OEM": [],

  // === PARALLELS ===
  "PARALLELS-18-STD-1Y": [],
};

function download(url) {
  return new Promise((resolve, reject) => {
    const client = url.startsWith("https") ? https : http;
    const req = client.get(url, { headers: { "User-Agent": "Mozilla/5.0" }, timeout: 10000 }, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return download(res.headers.location).then(resolve).catch(reject);
      }
      if (res.statusCode !== 200) {
        res.resume();
        return reject(new Error(`HTTP ${res.statusCode}`));
      }
      const chunks = [];
      res.on("data", (chunk) => chunks.push(chunk));
      res.on("end", () => resolve(Buffer.concat(chunks)));
      res.on("error", reject);
    });
    req.on("error", reject);
    req.on("timeout", () => { req.destroy(); reject(new Error("timeout")); });
  });
}

async function main() {
  fs.mkdirSync(OUT_DIR, { recursive: true });
  
  let downloaded = 0;
  let failed = 0;
  let skipped = 0;

  for (const [sku, urls] of Object.entries(IMAGE_SOURCES)) {
    if (!urls || urls.length === 0) {
      skipped++;
      continue;
    }

    let success = false;
    for (const url of urls) {
      try {
        const ext = url.endsWith(".svg") ? "svg" : url.endsWith(".png") ? "png" : url.endsWith(".jpg") ? "jpg" : "png";
        const filename = `${sku}.${ext}`;
        const filepath = path.join(OUT_DIR, filename);
        
        const data = await download(url);
        if (data.length < 500) throw new Error("Too small");
        
        fs.writeFileSync(filepath, data);
        console.log(`✅ ${sku} (${Math.round(data.length/1024)}KB)`);
        downloaded++;
        success = true;
        break;
      } catch (e) {
        console.log(`   ⚠️ ${sku}: ${e.message} — trying next...`);
      }
    }
    if (!success) {
      failed++;
      console.log(`❌ ${sku}: all sources failed, keeping SVG boxshot`);
    }
  }

  console.log(`\n📊 Results: ${downloaded} downloaded, ${failed} failed, ${skipped} skipped (using SVG)`);
}

main();
