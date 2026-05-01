"""Auto-match DB-SKU -> DSD-Code by brand + costPrice tolerance.
Writes apps/web/lib/dsd-mappings.generated.ts. Run: py scripts/generate-dsd-mapping.py
"""
import json
import re
from pathlib import Path

REPO = Path(__file__).resolve().parent.parent

# DSD catalog (EK netto, NL-MwSt 21%)
DSD = [
    # G Data
    ("C2001ESD12001", "G Data", 18.088), ("C2001ESD24001", "G Data", 27.709),
    ("C2001ESD12003", "G Data", 27.709), ("C2001ESD24003", "G Data", 43.028),
    ("C2001ESD12005", "G Data", 36.176), ("C2001ESD24005", "G Data", 55.435),
    ("C2001ESD12010", "G Data", 57.741),
    ("C2002ESD12001", "G Data", 27.709), ("C2002ESD24001", "G Data", 41.876),
    ("C2002ESD12003", "G Data", 36.176), ("C2002ESD24003", "G Data", 53.666),
    ("C2002ESD12005", "G Data", 45.797), ("C2002ESD24005", "G Data", 68.426),
    ("C2003ESD12001", "G Data", 36.176), ("C2003ESD24001", "G Data", 53.666),
    ("C2003ESD12003", "G Data", 45.797), ("C2003ESD24003", "G Data", 68.426),
    ("C2003ESD12005", "G Data", 53.666), ("C2003ESD24005", "G Data", 80.261),
    ("C2003ESD12010", "G Data", 86.978),
    ("C2004ESD12001", "G Data", 27.709), ("C2004ESD24001", "G Data", 43.028),
    ("C2004ESD12005", "G Data", 53.666),
    # Kaspersky
    ("DSD101007", "Kaspersky", 57.531), ("DSD101009", "Kaspersky", 10.90),
    # ESET
    ("DSD110190", "ESET", 18.459), ("DSD110196", "ESET", 27.959),
    ("DSD110198", "ESET", 34.159),
    ("DSD111113", "ESET", 40.505), ("DSD111121", "ESET", 65.175),
    ("DSD111122", "ESET", 40.925), ("DSD111120", "ESET", 43.375),
    ("DSD111125", "ESET", 101.67), ("DSD111126", "ESET", 146.248),
    ("DSD111115", "ESET", 83.90),
    # Panda
    ("170006", "Panda", 8.245), ("170003", "Panda", 14.445),
    ("170009", "Panda", 16.510), ("170012", "Panda", 24.775),
    ("170007", "Panda", 12.375), ("170005", "Panda", 20.640),
    ("170010", "Panda", 22.705), ("170013", "Panda", 34.460),
    ("170008", "Panda", 16.510), ("170004", "Panda", 22.705),
    ("170011", "Panda", 30.970),
    ("170030", "Panda", 6.99), ("170031", "Panda", 8.99),
    ("170032", "Panda", 9.99), ("170033", "Panda", 10.99),
    ("170034", "Panda", 9.75), ("170035", "Panda", 14.95),
    # AVG
    ("AVGCAW1E1001", "AVG", 11.894), ("AVGCAW2E1001", "AVG", 19.269),
    ("AVGCAW3E1001", "AVG", 15.244),
    ("DSD300100", "AVG", 11.663), ("DSD300101", "AVG", 23.326),
    ("DSD300102", "AVG", 14.348), ("DSD300103", "AVG", 27.926),
    ("AVGISW1E1003", "AVG", 19.269), ("DSD300107", "AVG", 27.580),
    ("DSD300029", "AVG", 5.50), ("DSD300031", "AVG", 3.00),
    ("DSD300110", "AVG", 17.038), ("DSD300111", "AVG", 25.117),
    ("DSD300112", "AVG", 30.880), ("DSD300113", "AVG", 37.413),
    # Avast
    ("230077", "Avast", 23.996), ("230083", "Avast", 11.996),
    ("230004", "Avast", 23.996), ("230082", "Avast", 16.996),
    ("PRO-2-24M", "Avast", 16.996),
    # McAfee
    ("DSD260100", "McAfee", 10.00), ("DSD260010", "McAfee", 10.00),
    ("DSD260020", "McAfee", 16.00),
    ("MCAFEE-IS-1PC", "McAfee", 3.25), ("MCAFEE-IS-3PC", "McAfee", 4.20),
    ("MCAFEE-IS-10D", "McAfee", 4.90),
    ("DSD260030", "McAfee", 16.00),
    # Microsoft
    ("DSD270026", "Microsoft", 72.50), ("DSD270015", "Microsoft", 92.50),
    ("AAA-04918", "Microsoft", 90.5), ("8833910", "Microsoft", 40.5),
    ("270052", "Microsoft", 85.00), ("USO-00045", "Microsoft", 175.00),
    ("270053", "Microsoft", 176.00),
    ("DPY-00600", "Microsoft", 199.9), ("DPZ-00006", "Microsoft", 199.9),
    ("DSD340083", "Microsoft", 99.90), ("DSD340084", "Microsoft", 119.90),
    # Norton
    ("DSD190048", "Norton", 16.00), ("DSD190045", "Norton", 17.00),
    ("DSD190046", "Norton", 19.00), ("DSD190047", "Norton", 22.00),
    ("DSD190052", "Norton", 20.00), ("DSD190024", "Norton", 47.97),
    ("DSD191001", "Norton", 12.00), ("DSD191007", "Norton", 15.00),
    ("DSD191010", "Norton", 20.75),
    ("DSD190053", "Norton", 3.00), ("DSD190054", "Norton", 5.50),
    ("DSD192004", "Norton", 5.5), ("DSD192002", "Norton", 13.33),
    # Trend Micro
    ("DSD150002", "Trend Micro", 16.788), ("DSD151022", "Trend Micro", 30.236),
    ("DSD151021", "Trend Micro", 26.872), ("DSD151032", "Trend Micro", 58.250),
    # Bitdefender
    ("160085", "Bitdefender", 17.353), ("160086", "Bitdefender", 28.917),
    ("160088", "Bitdefender", 23.135), ("160089", "Bitdefender", 40.488),
    ("160091", "Bitdefender", 31.815), ("160092", "Bitdefender", 49.168),
    ("160094", "Bitdefender", 28.917), ("160095", "Bitdefender", 46.277),
    ("160097", "Bitdefender", 37.597), ("160098", "Bitdefender", 57.848),
    ("160100", "Bitdefender", 49.742), ("160101", "Bitdefender", 63.630),
    ("160103", "Bitdefender", 39.00), ("160104", "Bitdefender", 75.201),
    ("160106", "Bitdefender", 54.957), ("160107", "Bitdefender", 86.772),
    ("160114", "Bitdefender", 56.401), ("160115", "Bitdefender", 91.319),
    ("160109", "Bitdefender", 9.90), ("160110", "Bitdefender", 14.90),
    ("160112", "Bitdefender", 23.135), ("160113", "Bitdefender", 34.699),
    ("160117", "Bitdefender", 39.00), ("160118", "Bitdefender", 54.957),
    ("160120", "Bitdefender", 40.027), ("160121", "Bitdefender", 54.957),
    ("160126", "Bitdefender", 45.239), ("160127", "Bitdefender", 69.909),
    # F-Secure
    ("FCFXBR1N003E1", "F-Secure", 28.868), ("FCFXBR2N003E2", "F-Secure", 46.189),
    ("FCFXBR1N005E1", "F-Secure", 34.650),
    ("460017", "F-Secure", 28.868), ("460001", "F-Secure", 17.297),
    ("460007", "F-Secure", 40.00),
    ("460025", "F-Secure", 46.221), ("460026", "F-Secure", 57.792),
    # Acronis
    ("DSD180089", "Acronis", 30.983), ("DSD180063", "Acronis", 55.778),
    # ABBYY
    ("FR03T-VFPCL", "ABBYY", 126.746), ("FRCJM-MYPLS", "ABBYY", 159.596),
    # Parallels
    ("PARALLELS-STD", "Parallels", 71.00),
]

dsd = [{"sku": s, "brand": b, "ekBrutto": round(n * 1.21, 2)} for (s, b, n) in DSD]

# DB products from seed.ts
seed = (REPO / "packages/db/prisma/seed.ts").read_text(encoding="utf-8")
pat = re.compile(
    r'\{\s*sku:\s*"([^"]+)",\s*name:\s*"([^"]+)",\s*category:\s*"([^"]+)",\s*'
    r'brand:\s*"([^"]+)",\s*costPrice:\s*([\d.]+),\s*sellPrice:\s*([\d.]+)'
)
db_products = [
    {"sku": m.group(1), "name": m.group(2), "category": m.group(3),
     "brand": m.group(4), "costPrice": float(m.group(5)), "sellPrice": float(m.group(6))}
    for m in pat.finditer(seed)
]

def margin(p):
    return p["sellPrice"] * 0.9 - p["costPrice"] - (p["sellPrice"] * 0.029 + 0.25)

# Manual overrides where price-only matching is ambiguous (same EK, different products).
# Keep this list in sync with seed.ts when SKUs/products change.
OVERRIDES = {
    # McAfee: TP & LiveSafe share EK with Internet variants
    "MCAFEE-TP-1PC-1Y": "DSD260100",
    "MCAFEE-TP-3PC-1Y": "DSD260010",
    "MCAFEE-TP-UNL-1Y": "DSD260020",
    "MCAFEE-LIVESAFE-UNL-1Y": "DSD260030",
    # Norton: VPN ↔ AntiTrack mix-up
    "NORTON-ANTITRACK-3D-1Y": "DSD190054",
    "NORTON-VPN-5D-1Y": "DSD192004",
    # Avast: distinct SKUs per device count
    "AVAST-PREM-3D-1Y": "230082",
    "AVAST-PREM-2D-2Y": "PRO-2-24M",
    "AVAST-PREM-10D-1Y": "230077",
    "AVAST-ULTIMATE-1PC-1Y": "230004",
    # Panda
    "PANDA-ESS-5PC-1Y": "170009",
    "PANDA-COMP-1PC-1Y": "170008",
    "PANDA-ADV-5PC-1Y": "170010",
    # Bitdefender — pick the right product line by name
    "BITDEF-AV-MAC-1M-1Y": "160112",   # AV for Mac
    "BITDEF-AV-3PC-1Y": "160088",
    "BITDEF-AV-1PC-2Y": "160086",
    "BITDEF-IS-1PC-1Y": "160094",
    "BITDEF-TS-5D-1Y": "160103",
    "BITDEF-TS-10D-1Y": "160106",
    # G Data — same EK across product lines, name says which is which
    "GDATA-AV-3PC-1Y": "C2001ESD12003",  # Antivirus 3 PC 1J
    "GDATA-AV-5PC-1Y": "C2001ESD12005",  # Antivirus 5 PC 1J
    "GDATA-AV-1PC-2Y": "C2001ESD24001",  # Antivirus 1 PC 2J
    "GDATA-IS-1PC-1Y": "C2002ESD12001",  # Internet Security 1 PC 1J
    "GDATA-IS-3PC-1Y": "C2002ESD12003",
    "GDATA-IS-5PC-1Y": "C2002ESD12005",
    "GDATA-TS-1PC-1Y": "C2003ESD12001",
    "GDATA-TS-3PC-1Y": "C2003ESD12003",
    "GDATA-TS-5PC-1Y": "C2003ESD12005",
    "GDATA-AV-MAC-1M-1Y": "C2004ESD12001",
    # F-Secure
    "FSEC-IS-1PC-1Y": "460017",
    "FSEC-VPN-3D-1Y": "FCFXBR1N003E1",
    "FSEC-TOTAL-3D-1Y": "460025",
    # AVG IS 5PC
    "AVG-IS-5PC-1Y": "AVGISW1E1003",
}

mappings = {}
ambiguous = []
unmatched = []
unprofitable = []

for p in db_products:
    mg = margin(p)
    if mg < 1.5:
        unprofitable.append((p, round(mg, 2)))
        continue
    if p["sku"] in OVERRIDES:
        mappings[p["sku"]] = OVERRIDES[p["sku"]]
        continue
    cands = [d for d in dsd if d["brand"] == p["brand"] and abs(d["ekBrutto"] - p["costPrice"]) < 0.06]
    if len(cands) == 1:
        mappings[p["sku"]] = cands[0]["sku"]
    elif len(cands) > 1:
        mappings[p["sku"]] = cands[0]["sku"]
        ambiguous.append((p, [c["sku"] for c in cands]))
    else:
        unmatched.append((p, round(mg, 2)))

print(f"\n=== Mapping report ===")
print(f"DB products      : {len(db_products)}")
print(f"Mapped           : {len(mappings)}")
print(f"Ambiguous (auto) : {len(ambiguous)}")
print(f"Unmatched        : {len(unmatched)}")
print(f"Unprofitable     : {len(unprofitable)}")

if ambiguous:
    print("\n--- Ambiguous matches (chose first) ---")
    for p, cs in ambiguous:
        print(f"  {p['sku']:30s} cost={p['costPrice']}€  -> {cs}")

if unmatched:
    print("\n--- Unmatched ---")
    for p, mg in unmatched:
        print(f"  {p['sku']:30s} {p['brand']:14s} cost={p['costPrice']}€ margin={mg}€")

if unprofitable:
    print("\n--- Unprofitable (skipped) ---")
    for p, mg in unprofitable:
        print(f"  {p['sku']:30s} cost={p['costPrice']}€ sell={p['sellPrice']}€ margin={mg}€")

out = (REPO / "apps/web/lib/dsd-mappings.generated.ts")
ts = ("// AUTO-GENERATED by scripts/generate-dsd-mapping.py — do not edit by hand.\n"
      "// Maps internal DB SKU -> DSD product code (used by /api/admin/backfill-dsd).\n"
      "export const DSD_MAPPINGS: Record<string, string> = "
      + json.dumps(mappings, indent=2, ensure_ascii=False) + ";\n")
out.write_text(ts, encoding="utf-8")
print(f"\nWrote {out} ({len(mappings)} mappings)")
