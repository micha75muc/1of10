// Elena (Finanzen) + Nestor (Beschaffung) — Vollständige DSD-Katalog-Analyse
// Quelle: DSD Portal Export (Products_pricelist.xlsx) — März 2026
// EK = Kaufpreis exkl. MwSt × 1.21 (21% NL-MwSt, kein Vorsteuerabzug als Kleinunternehmer §19 UStG)
// Netto = VK × 0.9 (Shuffle-Bag 10%) - EK_brutto - Stripe(VK × 0.029 + 0.25)
// MinVK für 3€ Netto = (3.25 + EK_brutto) / 0.871

const products = [
  // ===================== G DATA (Sektion 1) =====================
  // G Data SmallOffice Security - diverse Varianten
  { sku: 'C2001ESD12001', brand: 'G Data', name: 'G Data Antivirus 1 PC 1J (ESD)', ekNetto: 18.088 },
  { sku: 'C2001ESD24001', brand: 'G Data', name: 'G Data Antivirus 1 PC 2J', ekNetto: 27.709 },
  { sku: 'C2001ESD12003', brand: 'G Data', name: 'G Data Antivirus 3 PC 1J', ekNetto: 27.709 },
  { sku: 'C2001ESD24003', brand: 'G Data', name: 'G Data Antivirus 3 PC 2J', ekNetto: 43.028 },
  { sku: 'C2001ESD12005', brand: 'G Data', name: 'G Data Antivirus 5 PC 1J', ekNetto: 36.176 },
  { sku: 'C2001ESD24005', brand: 'G Data', name: 'G Data Antivirus 5 PC 2J', ekNetto: 55.435 },
  { sku: 'C2001ESD12010', brand: 'G Data', name: 'G Data Antivirus 10 PC 1J', ekNetto: 57.741 },
  
  { sku: 'C2002ESD12001', brand: 'G Data', name: 'G Data Internet Security 1 PC 1J', ekNetto: 27.709 },
  { sku: 'C2002ESD24001', brand: 'G Data', name: 'G Data Internet Security 1 PC 2J', ekNetto: 41.876 },
  { sku: 'C2002ESD12003', brand: 'G Data', name: 'G Data Internet Security 3 PC 1J', ekNetto: 36.176 },
  { sku: 'C2002ESD24003', brand: 'G Data', name: 'G Data Internet Security 3 PC 2J', ekNetto: 53.666 },
  { sku: 'C2002ESD12005', brand: 'G Data', name: 'G Data Internet Security 5 PC 1J', ekNetto: 45.797 },
  { sku: 'C2002ESD24005', brand: 'G Data', name: 'G Data Internet Security 5 PC 2J', ekNetto: 68.426 },
  
  { sku: 'C2003ESD12001', brand: 'G Data', name: 'G Data Total Security 1 PC 1J', ekNetto: 36.176 },
  { sku: 'C2003ESD24001', brand: 'G Data', name: 'G Data Total Security 1 PC 2J', ekNetto: 53.666 },
  { sku: 'C2003ESD12003', brand: 'G Data', name: 'G Data Total Security 3 PC 1J', ekNetto: 45.797 },
  { sku: 'C2003ESD24003', brand: 'G Data', name: 'G Data Total Security 3 PC 2J', ekNetto: 68.426 },
  { sku: 'C2003ESD12005', brand: 'G Data', name: 'G Data Total Security 5 PC 1J', ekNetto: 53.666 },
  { sku: 'C2003ESD24005', brand: 'G Data', name: 'G Data Total Security 5 PC 2J', ekNetto: 80.261 },

  { sku: 'C2003ESD12010', brand: 'G Data', name: 'G Data Total Security 10 PC 1J', ekNetto: 86.978 },
  
  { sku: 'C2004ESD12001', brand: 'G Data', name: 'G Data Antivirus Mac 1 Mac 1J', ekNetto: 27.709 },
  { sku: 'C2004ESD24001', brand: 'G Data', name: 'G Data Antivirus Mac 1 Mac 2J', ekNetto: 43.028 },
  
  { sku: 'C2004ESD12005', brand: 'G Data', name: 'G Data Antivirus Mac 5 Mac 1J', ekNetto: 53.666 },

  // G Data SmallOffice Security
  { sku: 'C2001BOX12SMB', brand: 'G Data', name: 'G Data SmallOffice Sec 5+1 Workst/Mobile 1J', ekNetto: 251.26 },
  // ... more G Data SmallOffice (skipping ultra-expensive business SKUs > 200€)
  
  // G Data Antivirus Business
  { sku: 'B2001ESD12001', brand: 'G Data', name: 'G Data Antivirus Bus 1 PC (ESD)', ekNetto: 27.709 },

  // ===================== Kaspersky (Sektion 2) =====================
  { sku: 'DSD101007', brand: 'Kaspersky', name: 'Kaspersky Total Security Multi Device 3 Devices 2J', ekNetto: 57.531 },
  { sku: 'DSD101009', brand: 'Kaspersky', name: 'Kaspersky Safe Kids 1 User 1J', ekNetto: 10.90 },
  
  // ===================== ESET (Sektion 3) =====================
  { sku: 'DSD110190', brand: 'ESET', name: 'ESET NOD32 Antivirus 3 Devices 1J', ekNetto: 18.459 },
  { sku: 'DSD110196', brand: 'ESET', name: 'ESET Internet Security 3 Devices 1J', ekNetto: 27.959 },
  { sku: 'DSD110198', brand: 'ESET', name: 'ESET Smart Security Premium 3 Devices 1J', ekNetto: 34.159 },
  
  { sku: 'DSD111113', brand: 'ESET', name: 'ESET Security Pack 3 Devices 1J MFS', ekNetto: 40.505 },
  { sku: 'DSD111121', brand: 'ESET', name: 'ESET Security Pack 3 Devices 2J MFS', ekNetto: 65.175 },
  { sku: 'DSD111122', brand: 'ESET', name: 'ESET Security Plus 3 Devices 1J MFS', ekNetto: 40.925 },
  { sku: 'DSD111120', brand: 'ESET', name: 'ESET Security Plus 5 Devices 1J MFS', ekNetto: 43.375 },
  { sku: 'DSD111125', brand: 'ESET', name: 'ESET Security Plus 10 Devices 1J MFS', ekNetto: 101.67 },
  { sku: 'DSD111126', brand: 'ESET', name: 'ESET Security Premium Plus 10 Devices 1J MFS', ekNetto: 146.248 },
  { sku: 'DSD111115', brand: 'ESET', name: 'ESET Security Premium 5 Devices 1J', ekNetto: 83.90 },
  
  // ===================== Panda (Sektion 4) =====================
  { sku: '170006', brand: 'Panda', name: 'Panda Dome Essential 1 PC 1J', ekNetto: 8.245 },
  { sku: '170003', brand: 'Panda', name: 'Panda Dome Essential 3 PC 1J', ekNetto: 14.445 },
  { sku: '170009', brand: 'Panda', name: 'Panda Dome Essential 5 PC 1J', ekNetto: 16.510 },
  { sku: '170012', brand: 'Panda', name: 'Panda Dome Essential 10 PC 1J', ekNetto: 24.775 },
  { sku: '170007', brand: 'Panda', name: 'Panda Dome Advanced 1 PC 1J', ekNetto: 12.375 },
  { sku: '170005', brand: 'Panda', name: 'Panda Dome Advanced 3 PC 1J', ekNetto: 20.640 },
  { sku: '170010', brand: 'Panda', name: 'Panda Dome Advanced 5 PC 1J', ekNetto: 22.705 },
  { sku: '170013', brand: 'Panda', name: 'Panda Dome Advanced 10 PC 1J', ekNetto: 34.460 },
  { sku: '170008', brand: 'Panda', name: 'Panda Dome Complete 1 PC 1J', ekNetto: 16.510 },
  { sku: '170004', brand: 'Panda', name: 'Panda Dome Complete 3 PC 1J', ekNetto: 22.705 },
  { sku: '170011', brand: 'Panda', name: 'Panda Dome Complete 5 PC 1J', ekNetto: 30.970 },
  { sku: '170030', brand: 'Panda', name: 'Panda Dome Essential 1 PC 1J OEM', ekNetto: 6.99 },
  { sku: '170031', brand: 'Panda', name: 'Panda Dome Advanced 1 PC 1J OEM', ekNetto: 8.99 },
  { sku: '170032', brand: 'Panda', name: 'Panda Dome Essential 3 PC 1J OEM', ekNetto: 9.99 },
  { sku: '170033', brand: 'Panda', name: 'Panda Dome Advanced 3 PC 1J OEM', ekNetto: 10.99 },
  { sku: '170034', brand: 'Panda', name: 'Panda Dome Complete 1 PC 1J OEM', ekNetto: 9.75 },
  { sku: '170035', brand: 'Panda', name: 'Panda Dome Complete 3 PC 1J OEM', ekNetto: 14.95 },
  { sku: '17M021', brand: 'Panda', name: 'Panda Dome Advanced 3 PC 1J OEM', ekNetto: 30.605 },
  
  // ===================== AVG (Sektion 5) =====================
  { sku: 'AVGCAW1E1001', brand: 'AVG', name: 'AVG Anti-Virus 3 PC 1J', ekNetto: 11.894 },
  { sku: 'AVGCAW2E1001', brand: 'AVG', name: 'AVG Anti-Virus 3 PC 2J', ekNetto: 19.269 },
  { sku: 'AVGCAW3E1001', brand: 'AVG', name: 'AVG Anti-Virus 5 PC 1J', ekNetto: 15.244 },
  { sku: 'DSD300100', brand: 'AVG', name: 'AVG Internet Security 1 PC 1J', ekNetto: 11.663 },
  { sku: 'DSD300101', brand: 'AVG', name: 'AVG Internet Security 1 PC 2J', ekNetto: 23.326 },
  { sku: 'DSD300102', brand: 'AVG', name: 'AVG Internet Security 3 PC 1J', ekNetto: 14.348 },
  { sku: 'DSD300103', brand: 'AVG', name: 'AVG Internet Security 3 PC 2J', ekNetto: 27.926 },
  { sku: 'AVGISW1E1003', brand: 'AVG', name: 'AVG Internet Security 5 PC 1J', ekNetto: 19.269 },  
  { sku: 'DSD300107', brand: 'AVG', name: 'AVG Internet Security 10 PC 1J', ekNetto: 27.580 },
  { sku: 'DSD300029', brand: 'AVG', name: 'AVG TuneUp 10 Devices 1J', ekNetto: 5.50 },
  { sku: 'DSD300031', brand: 'AVG', name: 'AVG TuneUp 3 Devices 1J', ekNetto: 3.00 },
  { sku: 'DSD300110', brand: 'AVG', name: 'AVG Ultimate 1 PC 1J', ekNetto: 17.038 },
  { sku: 'DSD300111', brand: 'AVG', name: 'AVG Ultimate 3 PC 1J', ekNetto: 25.117 },
  { sku: 'DSD300112', brand: 'AVG', name: 'AVG Ultimate 5 PC 1J', ekNetto: 30.880 },
  { sku: 'DSD300113', brand: 'AVG', name: 'AVG Ultimate 10 PC 1J', ekNetto: 37.413 },

  // ===================== Avast (Sektion 6) =====================  
  { sku: '230077', brand: 'Avast', name: 'Avast Premium Security 10 Devices 1J', ekNetto: 23.996 },
  { sku: '230083', brand: 'Avast', name: 'Avast Premium Security 1 PC 1J', ekNetto: 11.996 },
  
  // ===================== McAfee (Sektion 7) =====================
  { sku: 'DSD260100', brand: 'McAfee', name: 'McAfee Total Protection 1 PC 1J', ekNetto: 10.00 },
  { sku: 'DSD260010', brand: 'McAfee', name: 'McAfee Total Protection 3 PC (TP) 1J', ekNetto: 10.00 },
  { sku: 'DSD260020', brand: 'McAfee', name: 'McAfee Total Protection Unlimited Devices 1J', ekNetto: 16.00 },
  // McAfee IS (from our existing data)
  { sku: 'MCAFEE-IS-1PC', brand: 'McAfee', name: 'McAfee Internet Security 1 PC 1J', ekNetto: 3.25 },
  { sku: 'MCAFEE-IS-3PC', brand: 'McAfee', name: 'McAfee Internet Security 3 PC 1J', ekNetto: 4.20 },
  { sku: 'MCAFEE-IS-10D', brand: 'McAfee', name: 'McAfee Internet Security 10 Devices 1J', ekNetto: 4.90 },
  { sku: 'DSD260030', brand: 'McAfee', name: 'McAfee LiveSafe Unlimited Devices 1J', ekNetto: 16.00 },
  
  // ===================== Microsoft (Sektion 8) =====================
  { sku: 'DSD270026', brand: 'Microsoft', name: 'Microsoft 365 Personal 1J', ekNetto: 72.50 },
  { sku: 'DSD270015', brand: 'Microsoft', name: 'Microsoft 365 Family 1J', ekNetto: 92.50 },
  { sku: 'AAA-04918', brand: 'Microsoft', name: 'Microsoft 365 Business Standard 5 PC/MAC 1J', ekNetto: 90.5 },
  { sku: '8833910', brand: 'Microsoft', name: 'Microsoft 365 Business Basic 5 PC/MAC 1J', ekNetto: 40.5 },
  { sku: '270012-BUND', brand: 'Microsoft', name: 'Microsoft 365 Family BUNDLE - 6 licbs', ekNetto: 376.80 },
  { sku: '270052', brand: 'Microsoft', name: 'Office Home & Student 2021', ekNetto: 85.00 },
  { sku: 'USO-00045', brand: 'Microsoft', name: 'Office Home & Business 2021 Mac', ekNetto: 175.00 },
  { sku: '270053', brand: 'Microsoft', name: 'Office Home & Business 2021', ekNetto: 176.00 },
  { sku: 'T5E-16485', brand: 'Microsoft', name: 'Office Home & Business 2021', ekNetto: 176.00 },
  { sku: 'DPY-00600', brand: 'Microsoft', name: 'MS Office Home & Business 2024 1 PC/MAC', ekNetto: 199.9 },
  { sku: 'DPZ-00006', brand: 'Microsoft', name: 'MS Office Home & Business 2024 (Mac)', ekNetto: 199.9 },
  
  { sku: 'DSD340083', brand: 'Microsoft', name: 'Windows 11 Home OEM', ekNetto: 99.90 },
  { sku: 'DSD340084', brand: 'Microsoft', name: 'Windows 11 Pro OEM', ekNetto: 119.90 },
  { sku: 'PSC-10071', brand: 'Microsoft', name: 'Microsoft Windows 11 Pro 32/64-bit OEM', ekNetto: 99.90 },
  { sku: 'DSP-00860', brand: 'Microsoft', name: 'Microsoft eServices 11 Pro 32/64-bit OEM (D72)', ekNetto: 99.90 },

  // ===================== Norton (Sektion 9) =====================
  { sku: 'DSD190048', brand: 'Norton', name: 'Norton 360 Standard 1 Device 1J', ekNetto: 16.00 },
  { sku: 'DSD190045', brand: 'Norton', name: 'Norton 360 Deluxe 3 Devices 1J', ekNetto: 17.00 },
  { sku: 'DSD190046', brand: 'Norton', name: 'Norton 360 Deluxe 5 Devices 1J', ekNetto: 19.00 },
  { sku: 'DSD190047', brand: 'Norton', name: 'Norton 360 Premium 10 Devices 1J', ekNetto: 22.00 },
  { sku: 'DSD190052', brand: 'Norton', name: 'Norton 360 Premium 10 Devices 1J (Sub)', ekNetto: 20.00 },
  { sku: 'DSD190024', brand: 'Norton', name: 'Norton WiFi Privacy (VPN) 5 Devices 1J', ekNetto: 47.97 },
  { sku: 'DSD191001', brand: 'Norton', name: 'Norton 360 Deluxe + VPN 3 Devices v3.33 1J Best Buy/Champ', ekNetto: 12.00 },
  { sku: 'DSD191007', brand: 'Norton', name: 'Norton 360 Premium 5 Devices v5.33 1J Best Buy/Champ', ekNetto: 15.00 },
  { sku: 'DSD191010', brand: 'Norton', name: 'Norton 360 Premium 10 Devices Best Buy/Champ 1J', ekNetto: 20.75 },
  { sku: 'DSD190053', brand: 'Norton', name: 'Norton AntiTrack 1 Device 1J', ekNetto: 3.00 },
  { sku: 'DSD190054', brand: 'Norton', name: 'Norton AntiTrack 3 Devices 1J', ekNetto: 5.50 },

  // ===================== Trend Micro (Sektion 10) =====================
  { sku: 'DSD150002', brand: 'Trend Micro', name: 'Trend Micro Internet Security 1 PC 1J', ekNetto: 16.788 },
  { sku: 'DSD151022', brand: 'Trend Micro', name: 'Trend Micro Maximum Security 5 PC 1J', ekNetto: 30.236 },
  { sku: 'DSD151021', brand: 'Trend Micro', name: 'Trend Micro Maximum Security 3 PC 2J', ekNetto: 26.872 },
  { sku: 'DSD151032', brand: 'Trend Micro', name: 'Trend Micro Maximum Security 5 PC 3J', ekNetto: 58.250 },
  
  // ===================== Bitdefender (Sektion 11) =====================
  { sku: '160085', brand: 'Bitdefender', name: 'Bitdefender Antivirus Plus 1 PC 1J', ekNetto: 17.353 },
  { sku: '160086', brand: 'Bitdefender', name: 'Bitdefender Antivirus Plus 1 PC 2J', ekNetto: 28.917 },
  { sku: '160088', brand: 'Bitdefender', name: 'Bitdefender Antivirus Plus 3 PC 1J', ekNetto: 23.135 },
  { sku: '160089', brand: 'Bitdefender', name: 'Bitdefender Antivirus Plus 3 PC 2J', ekNetto: 40.488 },
  { sku: '160091', brand: 'Bitdefender', name: 'Bitdefender Antivirus Plus 5 PC 1J', ekNetto: 31.815 },
  { sku: '160092', brand: 'Bitdefender', name: 'Bitdefender Antivirus Plus 5 PC 2J', ekNetto: 49.168 },
  { sku: '160094', brand: 'Bitdefender', name: 'Bitdefender Internet Security 1 PC 1J', ekNetto: 28.917 },
  { sku: '160095', brand: 'Bitdefender', name: 'Bitdefender Internet Security 1 PC 2J', ekNetto: 46.277 },
  { sku: '160097', brand: 'Bitdefender', name: 'Bitdefender Internet Security 3 PC 1J', ekNetto: 37.597 },
  { sku: '160098', brand: 'Bitdefender', name: 'Bitdefender Internet Security 3 PC 2J', ekNetto: 57.848 },
  { sku: '160100', brand: 'Bitdefender', name: 'Bitdefender Internet Security 5 PC 1J', ekNetto: 49.742 },
  { sku: '160101', brand: 'Bitdefender', name: 'Bitdefender Internet Security 5 PC 2J', ekNetto: 63.630 },
  { sku: '160103', brand: 'Bitdefender', name: 'Bitdefender Total Security 5 Devices 1J', ekNetto: 39.00 },
  { sku: '160104', brand: 'Bitdefender', name: 'Bitdefender Total Security 5 Devices 2J', ekNetto: 75.201 },
  { sku: '160106', brand: 'Bitdefender', name: 'Bitdefender Total Security 10 Devices 1J', ekNetto: 54.957 },
  { sku: '160107', brand: 'Bitdefender', name: 'Bitdefender Total Security 10 Devices 2J', ekNetto: 86.772 },
  { sku: '160114', brand: 'Bitdefender', name: 'Bitdefender Family Pack 15 Devices 1J', ekNetto: 56.401 },
  { sku: '160115', brand: 'Bitdefender', name: 'Bitdefender Family Pack 15 Devices 2J', ekNetto: 91.319 },
  { sku: '160109', brand: 'Bitdefender', name: 'Bitdefender Antivirus Plus 1 PC OEM', ekNetto: 9.90 },
  { sku: '160110', brand: 'Bitdefender', name: 'Bitdefender Internet Security 1 PC OEM (Subscription)', ekNetto: 14.90 },
  { sku: '160112', brand: 'Bitdefender', name: 'Bitdefender Antivirus for Mac 1 Mac 1J', ekNetto: 23.135 },
  { sku: '160113', brand: 'Bitdefender', name: 'Bitdefender Antivirus for Mac 3 Mac 1J', ekNetto: 34.699 },
  { sku: '160117', brand: 'Bitdefender', name: 'Bitdefender Total Security Multi Device 5 Dev 1J', ekNetto: 39.00 },
  { sku: '160118', brand: 'Bitdefender', name: 'Bitdefender Total Security Multi Device 10 Dev 1J', ekNetto: 54.957 },
  
  // Bitdefender Internet Security OEM etc
  { sku: '160120', brand: 'Bitdefender', name: 'Bitdefender Antivirus for Mac 1 Mac 2J', ekNetto: 40.027 },
  { sku: '160121', brand: 'Bitdefender', name: 'Bitdefender Antivirus for Mac 3 Mac 2J', ekNetto: 54.957 },
  { sku: '160126', brand: 'Bitdefender', name: 'Bitdefender Antivirus for Mac 4 Mac 1J', ekNetto: 45.239 },
  { sku: '160127', brand: 'Bitdefender', name: 'Bitdefender Antivirus for Mac 4 Mac 2J', ekNetto: 69.909 },
  
  // ===================== F-Secure (Sektion 12) =====================
  { sku: 'FCFXBR1N003E1', brand: 'F-Secure', name: 'F-Secure Freedome VPN 3 Devices 1J', ekNetto: 28.868 },
  { sku: 'FCFXBR2N003E2', brand: 'F-Secure', name: 'F-Secure Freedome VPN 3 Devices 2J', ekNetto: 46.189 },
  { sku: 'FCFXBR1N005E1', brand: 'F-Secure', name: 'F-Secure Freedome VPN 5 Devices 1J', ekNetto: 34.650 },
  { sku: 'FCFXBR2N005E2', brand: 'F-Secure', name: 'F-Secure Freedome VPN 5 Devices 2J', ekNetto: 52.317 },
  { sku: '460017', brand: 'F-Secure', name: 'F-Secure Internet Security 1 PC 1J', ekNetto: 28.868 },
  { sku: '460001', brand: 'F-Secure', name: 'F-Secure VPN 1 Device 1J', ekNetto: 17.297 },
  { sku: '460007', brand: 'F-Secure', name: 'F-Secure Safe 5 Devices 1J', ekNetto: 40.00 },
  { sku: 'FGT1BREN001E2', brand: 'F-Secure', name: 'F-Secure Total Security & Privacy 3 Dev 2J', ekNetto: 75.012 },
  { sku: 'FGT1BREN002', brand: 'F-Secure', name: 'F-Secure Total Security 4 Devices 5 Users 2J', ekNetto: 87.429 },
  { sku: '460025', brand: 'F-Secure', name: 'F-Secure Total Security + OnTrack 3 Dev 1J', ekNetto: 46.221 },
  { sku: '460026', brand: 'F-Secure', name: 'F-Secure Total Security + OnTrack 5 Dev 1J', ekNetto: 57.792 },
  { sku: '460027', brand: 'F-Secure', name: 'F-Secure Total Security + OnTrack 5 Dev 3J', ekNetto: 86.264 },
  
  { sku: 'FCFM1IN003E1', brand: 'F-Secure', name: 'F-Secure Identity Protection 5 Devices 1J', ekNetto: 57.297 },
  { sku: 'FCFMBR1N003E2', brand: 'F-Secure', name: 'F-Secure Identity Protection 3 Devices 2J', ekNetto: 46.189 },
  { sku: 'FCFHBR1N005E1', brand: 'F-Secure', name: 'F-Secure Freedome VPN 5 Devices 1J', ekNetto: 34.650 },
  { sku: 'FCFC01NBR31', brand: 'F-Secure', name: 'F-Secure Internet Security 1 PC 1J', ekNetto: 28.000 },
  
  // ===================== Acronis (Sektion 13) =====================
  { sku: 'DSD180089', brand: 'Acronis', name: 'Acronis Cyber Protect Home Office Essential 1 PC 1J', ekNetto: 30.983 },
  { sku: 'DSD180063', brand: 'Acronis', name: 'Acronis Cyber Protect Home Office Advanced 1 PC 1J', ekNetto: 55.778 },
  { sku: 'HOAA3-1465', brand: 'Acronis', name: 'Acronis True Image Advanced 3 PC/MAC + 500 GB Cloud 1J', ekNetto: 75.25 },
  { sku: 'DSD181050', brand: 'Acronis', name: 'Acronis True Image Premium 1 PC/MAC + 1 TB Cloud 1J yr', ekNetto: 77.65 },
  { sku: 'DSD180GADS', brand: 'Acronis', name: 'Acronis True Image Advanced 5 PC/MAC + 1 TB Cloud 1J', ekNetto: 100.160 },
  { sku: 'DSD181096', brand: 'Acronis', name: 'Acronis True Image Premium 5 PC/MAC + 1 TB Cloud 1J', ekNetto: 122.555 },
  { sku: 'HOAA3-6425', brand: 'Acronis', name: 'Acronis True Image Essential 5 PC/MAC 1J', ekNetto: 46.90 },
  
  // ===================== ABBYY (Sektion 14) =====================
  { sku: 'FR03T-VFPCL', brand: 'ABBYY', name: 'ABBYY FineReader PDF 16 Standard 1 PC 1J', ekNetto: 126.746 },
  { sku: 'FRCJM-MYPLS', brand: 'ABBYY', name: 'ABBYY FineReader PDF 16 Corporate 1J', ekNetto: 159.596 },

  // ===================== Avast (more) =====================
  { sku: '230004', brand: 'Avast', name: 'Avast Ultimate 1 PC 1J', ekNetto: 23.996 },
  { sku: 'AVB-5-12M', brand: 'Avast', name: 'Avast Premium Security Multi Device 10 Dev 1J', ekNetto: 23.996 },
  { sku: 'PRO-5-12M', brand: 'Avast', name: 'Avast Premium Security Multi Device 10 Devices 1J', ekNetto: 23.996 },
  { sku: '230082', brand: 'Avast', name: 'Avast Premium Security 3 Devices 1J', ekNetto: 16.996 },
  { sku: 'PRO-2-24M', brand: 'Avast', name: 'Avast Premium Security 2 Devices 2J', ekNetto: 16.996 },

  // ===================== Norton (more) =====================
  { sku: 'DSD192004', brand: 'Norton', name: 'Norton VPN Privacy 5 Devices 1J', ekNetto: 5.5 },
  { sku: 'DSD192002', brand: 'Norton', name: 'Norton 360 Deluxe 3 Devices v3.33 + VPN 1J', ekNetto: 13.33 },
  { sku: 'DSD192006', brand: 'Norton', name: 'Norton 360 Premium 10 Devices + VPN 1J Champ', ekNetto: 20.75 },
  { sku: 'DSD191011', brand: 'Norton', name: 'Norton AntiTrack 1 Device 1J', ekNetto: 3.00 },
  
  // ===================== Parallels =====================
  { sku: 'PARALLELS-STD', brand: 'Parallels', name: 'Parallels Desktop 18 Standard 1J', ekNetto: 71.00 },  
];

// ============================
// ANALYSE
// ============================
function calc(ekNetto, vk) {
  const ekBrutto = ekNetto * 1.21;
  const netto = vk * 0.9 - ekBrutto - (vk * 0.029 + 0.25);
  return { ekBrutto, netto };
}

function minVK(ekNetto) {
  const ekBrutto = ekNetto * 1.21;
  return (3.25 + ekBrutto) / 0.871;
}

console.log('═══════════════════════════════════════════════════════════════════════════════════════════════');
console.log(' DSD VOLLSTÄNDIGER KATALOG — Profitabilitätsanalyse (' + products.length + ' Produkte)');
console.log(' EK = DSD-Netto × 1.21 | MinVK = (3.25 + EK_brutto) / 0.871 | Kleinunternehmer §19 UStG');
console.log('═══════════════════════════════════════════════════════════════════════════════════════════════');

// Group by brand
const brands = {};
for (const p of products) {
  if (!brands[p.brand]) brands[p.brand] = [];
  brands[p.brand].push(p);
}

const green = [];  // MinVK < 35€ (machbar als Street + Kulanz-Aufschlag)
const yellow = []; // MinVK 35-80€
const red = [];    // MinVK > 80€ (zu teuer)

for (const p of products) {
  const mv = minVK(p.ekNetto);
  const ekB = p.ekNetto * 1.21;
  p.ekBrutto = ekB;
  p.minVK = mv;
  
  if (mv <= 20) green.push(p);
  else if (mv <= 50) yellow.push(p);
  else red.push(p);
}

// Sort green by minVK ascending (cheapest first = best margin potential)
green.sort((a, b) => a.minVK - b.minVK);
yellow.sort((a, b) => a.minVK - b.minVK);

console.log('');
console.log('🟢 GRÜN — MinVK ≤ 20€ (' + green.length + ' Produkte) — BESTE MARGE-CHANCEN');
console.log('──────────────────────────────────────────────────────────────────────────');
console.log('Brand'.padEnd(14) + 'Produkt'.padEnd(52) + 'EK brutto'.padStart(10) + '  MinVK'.padStart(8));
for (const p of green) {
  console.log(p.brand.padEnd(14) + p.name.substring(0, 50).padEnd(52) + p.ekBrutto.toFixed(2).padStart(9) + '€' + p.minVK.toFixed(2).padStart(7) + '€');
}

console.log('');
console.log('🟡 GELB — MinVK 20-50€ (' + yellow.length + ' Produkte) — MÖGLICH MIT KULANZ-AUFSCHLAG');
console.log('──────────────────────────────────────────────────────────────────────────');
console.log('Brand'.padEnd(14) + 'Produkt'.padEnd(52) + 'EK brutto'.padStart(10) + '  MinVK'.padStart(8));
for (const p of yellow) {
  console.log(p.brand.padEnd(14) + p.name.substring(0, 50).padEnd(52) + p.ekBrutto.toFixed(2).padStart(9) + '€' + p.minVK.toFixed(2).padStart(7) + '€');
}

console.log('');
console.log('🔴 ROT — MinVK > 50€ (' + red.length + ' Produkte) — NUR FÜR PREMIUM-SEGMENT');
console.log('──────────────────────────────────────────────────────────────────────────');
console.log('Brand'.padEnd(14) + 'Produkt'.padEnd(52) + 'EK brutto'.padStart(10) + '  MinVK'.padStart(8));
for (const p of red) {
  console.log(p.brand.padEnd(14) + p.name.substring(0, 50).padEnd(52) + p.ekBrutto.toFixed(2).padStart(9) + '€' + p.minVK.toFixed(2).padStart(7) + '€');
}

console.log('');
console.log('═══════════════════════════════════════════════════════════════════════════════════════════════');
console.log(' ZUSAMMENFASSUNG');
console.log('═══════════════════════════════════════════════════════════════════════════════════════════════');
console.log('');
console.log('Gesamt: ' + products.length + ' Produkte');
console.log('🟢 GRÜN  (MinVK ≤ 20€):  ' + green.length + ' — Günstige Consumer-Produkte, hohe Marge');
console.log('🟡 GELB  (MinVK 20-50€): ' + yellow.length + ' — Mittelsegment, braucht Kulanz-Aufschlag');
console.log('🔴 ROT   (MinVK > 50€):  ' + red.length + ' — Premium/Business, schwer im Preiskampf');
console.log('');

// Brand summary
console.log('NACH MARKE:');
for (const [brand, prods] of Object.entries(brands).sort((a, b) => a[0].localeCompare(b[0]))) {
  const g = prods.filter(p => p.minVK <= 20).length;
  const y = prods.filter(p => p.minVK > 20 && p.minVK <= 50).length;
  const r = prods.filter(p => p.minVK > 50).length;
  console.log('  ' + brand.padEnd(14) + (' ' + prods.length + ' Produkte').padEnd(16) + '🟢' + g + ' 🟡' + y + ' 🔴' + r);
}

console.log('');
console.log('TOP 20 PRODUKTE NACH MARGE-POTENZIAL (niedrigster MinVK):');
console.log('──────────────────────────────────────────────────────────────────────────');
const top20 = [...products].sort((a, b) => a.minVK - b.minVK).slice(0, 20);
for (let i = 0; i < top20.length; i++) {
  const p = top20[i];
  console.log((i+1 + '.').padStart(3) + ' ' + p.brand.padEnd(14) + p.name.substring(0, 48).padEnd(50) + 'EK: ' + p.ekBrutto.toFixed(2).padStart(7) + '€  MinVK: ' + p.minVK.toFixed(2).padStart(7) + '€');
}
