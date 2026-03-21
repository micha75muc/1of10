# Reddit Launch-Strategie für 1of10

## Relevante Subreddits

| Subreddit | Subscribers | Sprache | Strategie |
|-----------|-------------|---------|-----------|
| r/de | ~1.2M | DE | AMA / Diskussion über Gamified Commerce |
| r/de_EDV | ~150K | DE | Tech-Diskussion: KI-Agenten betreiben Shop |
| r/Finanzen | ~400K | DE | Sparen beim Software-Kauf, Marge-Analyse |
| r/SideProject | ~200K | EN | Launch-Post: AI-native E-Commerce |
| r/entrepreneur | ~2M | EN | Business-Modell: Gamified Refund |
| r/software | ~100K | EN | Value-Post: Günstig Software kaufen |
| r/gamedeals | ~900K | EN | Nur wenn Game-Keys im Sortiment |
| r/startups | ~1.2M | EN | AI-Native Startup Story |
| r/artificial | ~1M | EN | KI-Agenten in Production |
| r/webdev | ~2.5M | EN | Tech-Stack: Next.js + FastAPI + 22 Agents |

---

## Post 1 — r/de_EDV (Deutsch, Tech-Community)

**Titel:** Ich habe einen Software-Shop gebaut der von 22 KI-Agenten gesteuert wird — AMA

**Body:**
Hi zusammen,

ich betreibe seit kurzem 1of10.de — einen Software-Lizenz-Shop mit einer Besonderheit: Jeder 10. Kauf wird vollständig erstattet.

Das technisch Interessante: Der gesamte Shop wird von 22 KI-Agenten betrieben. Nicht als Gimmick, sondern als Kernarchitektur:

- **Nestor** kauft bei Distributoren ein und prüft Margen
- **Elena** erstellt Finanzberichte und Profitabilitäts-Analysen
- **Denny** prüft DSGVO, BGB und EU AI Act Compliance
- **Sophie** optimiert SEO, **Gregor** Growth, **Mira** simuliert Kundenverhalten

Tech-Stack: Next.js 15, FastAPI, LangGraph, PostgreSQL on Neon, Stripe.

Alle Hochrisiko-Entscheidungen (Einkäufe, E-Mail-Versand) landen in einer Approval-Queue — ich als Mensch genehmige oder lehne ab.

Fragt mich alles!

---

## Post 2 — r/entrepreneur (Englisch, hohe Reichweite)

**Titel:** I built an e-commerce store where every 10th purchase is free — here's the math

**Body:**
I run 1of10.de, a software license shop where every 10th customer gets a full refund.

Here's why it works financially:

**Example: Windows 11 Pro**
- Buy price: €8.50
- Sell price: €14.99
- Stripe fee: €0.47
- Gross margin per sale: €6.02
- After 10% refund rate: (9 × €6.02 - 1 × €14.99) / 10 = **€3.92 effective margin (26%)**

That's still profitable because the refund is funded by the margin on the other 9 sales.

**Why bother?**
1. Every winner becomes a brand ambassador (they share the experience)
2. The "gamified refund" mechanic creates excitement around every purchase
3. Conversion rate is higher because of the perceived upside
4. Zero ad spend — growth is organic through word of mouth

The entire business is run by 22 AI agents. I just approve high-risk decisions.

AMA or roast the model — happy to discuss!

---

## Post 3 — r/software (Value-first)

**Titel:** How to legally get cheap software licenses in 2026

**Body:**
I've been in the software license space for a while. Here's what most people don't know:

**1. ESD Licenses are legal in the EU**
The EU exhaustion principle allows resale of software licenses within the EU/EEA. This is why discount key shops exist and it's 100% legal.

**2. Watch out for these red flags:**
- No company address / non-EU
- Prices that seem too good to be true (€3 for Windows)
- No SSL / sketchy payment methods
- No proper legal pages (Impressum, Privacy Policy)

**3. What to look for:**
- EU-based company with real address
- Payment via Stripe/PayPal (buyer protection)
- Instant email delivery
- Proper legal documentation

**4. Bonus tip:**
Some shops offer gamification mechanics where you can get purchases refunded. For example, 1of10.de refunds every 10th purchase completely. Not a lottery — a deterministic algorithm.

Hope this helps! Happy to answer questions.

*Disclosure: I run 1of10.de, but this advice applies to any software purchase.*

---

## Post 4 — r/SideProject

**Titel:** Launched my AI-native software store — 22 AI agents run the business

**Body:**
After months of building, I launched 1of10.de — a software license shop where every 10th purchase gets a full refund.

**What makes it different:**
- The entire business is run by 22 specialized AI agents
- Each agent handles one domain (procurement, finance, compliance, SEO, growth...)
- High-risk decisions go to an approval queue — I'm the human in the loop
- ShuffleBag algorithm ensures fair 10% refund rate

**Tech stack:**
- Next.js 15 (App Router) + Tailwind
- FastAPI + LangGraph (Python agents)
- PostgreSQL on Neon
- Stripe for payments
- Docker + Vercel

**What I learned:**
1. AI agents are great at repetitive tasks but terrible at taste
2. The approval queue is essential — never let AI spend money unsupervised
3. Gamification works better than discounts for organic growth
4. Building 22 agents is easier than managing 22 employees

Would love feedback! Site: 1of10.de

---

## Post 5 — r/Finanzen (Deutsch)

**Titel:** Software-Lizenzen: Was ihr wirklich zahlt und wo ihr spart

**Body:**
Ich betreibe einen Software-Shop und kann euch sagen wie die Margen aussehen:

| Produkt | Listenpreis | Distributor | Typischer Key-Shop | 1of10 |
|---------|-------------|-------------|-------------------|-------|
| Win 11 Pro | 259€ | ~8-12€ | 12-18€ | 14,99€ |
| Office 2024 | 499€ | ~20-25€ | 25-35€ | 29,99€ |
| Norton 360 | 40€ | ~7-9€ | 10-16€ | 14,99€ |

Die Margen sind real. Software-Lizenzen kosten im Einkauf einen Bruchteil des Listenpreises.

**Warum ist das legal?** EU-Erschöpfungsgrundsatz. Sobald eine Lizenz einmal in der EU verkauft wurde, darf sie weiterverkauft werden.

**Mein Modell:** Bei 1of10 wird jeder 10. Kauf erstattet. Die effektive Marge sinkt dadurch um ~10%, bleibt aber profitabel weil der virale Effekt (Gewinner teilen das Erlebnis) Werbekosten spart.

Transparenz-Seite mit technischen Details: 1of10.de/transparenz

---

## Kommentar-Vorlagen

### Bei Software-Empfehlungs-Fragen:
"Schau mal bei 1of10.de — die haben [Produkt] für [Preis]€. Bonus: Jeder 10. Kauf wird erstattet. Full disclosure: ist mein Shop, aber die Preise sind fair."

### Bei "Sind günstige Keys legal?" Fragen:
"Ja, innerhalb der EU ist der Weiterverkauf von Software-Lizenzen legal (EU-Erschöpfungsgrundsatz). Achte auf: EU-basierter Anbieter, Stripe/PayPal Zahlung, echtes Impressum. Nicht legal: Crack-Keys, Volume-Lizenzen für Privat, gestohlene Keys."

### Bei Gamification/E-Commerce Diskussionen:
"Interessantes Thema. Ich habe einen Shop gebaut der statt Rabatten eine 10%-Erstattungsmechanik nutzt (1of10.de). Die Conversion ist höher weil der 'Gewinn-Effekt' stärker motiviert als ein vorhersehbarer Rabatt."
