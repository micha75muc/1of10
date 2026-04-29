Betreff: Vielen Dank für den Hinweis zur Cookie-Persistenz – kurzer Statusbericht & zwei Fragen

Sehr geehrter Herr van Gils,

vielen Dank für Ihren Hinweis vom 18.04. zur obligatorischen
Cookie-Übermittlung gegenüber der DSD-API. Der Tipp war
goldwert – wir hatten in unserem Python-Client tatsächlich zwei
Stellen, an denen die Session-Cookies verloren gingen
(Set-Cookie aus 302-Redirect-Response wurde verworfen, plus
Re-Instanziierung des HTTP-Clients pro Request). Beides ist
gefixt und unsere `login.json` → `activateProduct.json`-Kette
verläuft jetzt sauber innerhalb derselben Session.

Wir haben in den letzten Wochen folgende technische Hürden
gegenüber Ihrer API genommen und sind aktuell bis auf einen
Punkt produktionsreif:

  • HTTP-Basic-Auth + Session-Cookie-Handling (jetzt korrekt)
  • Vollständiger Katalog-Import (149 Produkte) inkl. Mehrsprachigkeit
  • Mapping unserer 119 SKUs auf DSD `productCode` über Brand,
    `numberOfUsers` und `yearsValid`
  • Übernahme Ihrer offiziellen `packshotImage`-URLs als
    Produktbilder auf unseren PDPs (statt eigenem Asset-Hosting)
  • End-to-End-Test des Bestellpfads inkl. Stripe-Webhook,
    Refund-Logik und Fulfillment-Pipeline – alles im Mock-Modus
    erfolgreich, da wir noch keine echten Orders ausgelöst haben

Damit verbleibt genau ein Punkt, den wir nicht testen können,
ohne echtes Geld auszugeben:

  Den vollständigen Roundtrip "Bestellung bei DSD → echter
  Lizenzschlüssel → Auslieferung an unseren Endkunden".

Daraus zwei Fragen:

  1. Bieten Sie für API-Partner einen Sandbox- oder
     Test-Account an, in dem `quickOrder.json` bzw.
     `activateProduct.json` einen Dummy-Schlüssel zurückgeben,
     ohne dass tatsächlich Bestand bewegt oder berechnet wird?
     Falls ja – würden Sie unseren Account `medialess_apitest`
     entsprechend freischalten oder uns einen separaten
     Sandbox-Zugang einrichten?

  2. Falls Sandbox-Tests nicht vorgesehen sind: Gibt es im
     Sortiment ein Produkt mit `acquisitionPrice = 0` (z. B.
     eine Trial- oder Demo-SKU), an dem wir den vollständigen
     Aktivierungs- und Auslieferungsprozess einmalig produktiv
     testen können? In unserem aktuellen Katalog-Dump habe ich
     dazu keinen Treffer gefunden.

Ergänzend ein kleiner Hinweis, falls für Ihr Katalog-Team
relevant: Bei folgenden 7 Produkten liefert die API als
`packshotImage` lediglich den Platzhalter `no-image.jpg`,
sodass wir auf unseren Produktseiten kein offizielles Boxshot
einbinden können:

  • DSD300029 – AVG TuneUp 10 Devices 1 Year
  • DSD300031 – AVG TuneUp 3 Devices 1 Year
  • DSD310025 – ABBYY FineReader Standard 1 Year
  • DSD180092 – Acronis (Essential & Advanced 1-PC)
  • 460025    – F-Secure Total 3 Devices 1 Year
  • GDSA-AR   – G DATA Internet Security 1-PC 1 Year

Über offizielle Bilder zu diesen SKUs wären wir sehr dankbar.

Vielen Dank im Voraus für Ihre Rückmeldung – wir freuen uns
darauf, in Kürze die ersten echten Bestellungen über DSD
abwickeln zu können.

Mit freundlichen Grüßen

Michael Hahnel
1of10 / medialess
info@medialess.de
München, Deutschland
