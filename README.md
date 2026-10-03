# NordForm

En dansk butik til 3D-printede opbevarings- og organiseringsprodukter. Ren HTML,
CSS og JavaScript. Ingen framework-, installations- eller buildkrav til butikken.

## Lokal preview

Kør fra projektmappen:

```sh
python3 -m http.server 4173 --bind 127.0.0.1
```

Åbn `http://127.0.0.1:4173/`. Filerne kan også åbnes direkte eller hostes statisk
på GitHub Pages. Brug en lokal server til at teste kurvens lagring på tværs af sider.

## Struktur

- `index.html`: produktorienteret forside, udvalgte objekter, historie,
  samlinger, printlag og specialprint.
- `shop.html`: søgning, samlinger, kategorier, sortering og quick add.
- `product.html?id=pen-case`: galleri, lysboks, produktinformation, varianter
  når de findes i data, antal og mobil købsknap.
- `cart.html`: browserlokal kurv og ordreoversigt.
- `checkout.html`: gennemse varer, tilføj en bemærkning og klargør Telegram-ordre.
- `contact.html`: direkte kontakt og formular til specialønsker.
- `faq.html`: eksisterende svar om produkter, bestilling, specialprint og levering.
- `css/style.css`: fælles tokens, typografi, komponenter, responsive regler og
  reduceret bevægelse.
- `js/products.js`: den eksisterende butiksidentitet, produktdata og priser i øre.
- `js/image-data.js`: billedmål og responsive versioner af produktbillederne.
- `js/ui.js`: genbrugelige billed-, ikon- og dialogfunktioner.
- `js/catalog.js`: produktkort og katalogfiltre.
- `js/product.js`: produktgalleri, metadata, varianter og købskontroller.
- `js/cart.js`: kurv, prisberegning, lagring, kurvskuffe og Telegram-kladder.
- `js/main.js`: fælles navigation, FAQ, kontaktformular og printlagsanimation.

Header og footer findes i HTML på alle sider, så navigationen ikke afhænger af
JavaScript. Dialoger bruger browserens native fokusstyring. Escape lukker dem,
og fokus returnerer til det element, der åbnede dem. Bevægelse respekterer
`prefers-reduced-motion`.

## Produkter og varianter

Alle otte eksisterende produkter, deres IDs, SKU'er, priser, tekster og originale
billeder er bevaret i `js/products.js`. Der er én eksisterende kategori: Peptides.
Samlingerne Cases, Holdere & indsatser og Stationer grupperer det eksisterende
udvalg efter funktion; de erstatter ikke kategoridata.

Samlingen vælges med `shop.html?collection=cases`, `holders` eller `stations`.
Søgning, kategori og sortering fungerer sammen.

Farve- og størrelseskontroller vises kun, når produktet faktisk har disse data.
Eksempel på dataskema:

```js
colors: [{ name: 'Sort', hex: '#252720' }],
sizes: [{ name: 'Lille', price: 14900 }, { name: 'Stor', price: 19900 }]
```

Kurven holder kombinationer af produkt, farve og størrelse adskilt. Den valgte
størrelses pris bruges i varetotal og Telegram-kladde. Produkter med flere
varianter henviser fra kataloget til produktsiden i stedet for at tilføje et
uklart valg direkte.

Den oprindelige lagringsnøgle `nordform.cart.v1` bevares. Tidligere kurve med
`{ id, qty }` læses fortsat. Antal begrænses til 1–99, ukendte produkter afvises,
og beskadigede data håndteres. Flere åbne faner synkroniseres. Hvis lagring er
blokeret, virker kurven i den aktuelle side uden vedvarende lagring.

## Bestilling og kontakt

**NordForm · CVR 41693908**. Telegram-brugernavnet ligger i `Shop.config` i
`js/products.js` og er fortsat **`@test`**. Ret det til virksomhedens rigtige
brugernavn, før butikken bruges til reelle ordreforespørgsler.

Checkout foretager ingen betaling og sender ingen besked automatisk. Kunden
åbner en ordrekladde i Telegram og vælger selv at sende den. Lagerstatus, fragt,
levering og betaling aftales direkte. Ordreteksten kan også kopieres.

Kontaktformularen validerer idé og antal og klargør en Telegram-besked med de
oplysninger, kunden har indtastet. Fotos og modeller kan vedhæftes i Telegram.
Der findes ingen upload-, betalings-, lager- eller formularserver i projektet.
Ordrebemærkninger og kontaktoplysninger gemmes ikke i localStorage.

## Billeder og SEO

Eksisterende billedfiler er bevaret. `*-480.webp` og `*-960.webp` er mindre,
fulde versioner af de samme billeder; ingen nye produkter eller billeder er
AI-genereret til redesignets brug. Billederne vises uden at beskære vigtige
produktdele. Den eksisterende billedkvalitet og baggrunde varierer.

Katalog og udvalgte produkter findes også som statisk HTML for hurtig første
visning og crawlbare produktlinks. JavaScript tilføjer filtre og kurvfunktioner.
Efter ændring af produktdata kan den statiske visning opdateres med:

```sh
node scripts/render-catalog.cjs
```

Det er en valgfri vedligeholdelseskommando, ikke et buildkrav. JavaScript bruger
altid de aktuelle produktdata. Billedvarianter og manifest kan opdateres med
`scripts/prepare-images.py` (Python med Pillow; kun til billedvedligeholdelse).

Sidetitler, beskrivelser, canonical- og Open Graph-tags, eksisterende
virksomhedsdata, dynamisk Product-schema, `sitemap.xml` og `robots.txt` er bevaret.
Kurv og checkout er `noindex,follow`. Ukendte produkt-IDs viser en tydelig fejl
frem for et andet produkt. Produktspecifik metadata kræver som før JavaScript;
separate statiske produkt-URLs kan være en senere forbedring.

Ved en ny designudgivelse ændres `?v=` på CSS- og scriptlinks, så besøgende med
cachede filer får de nye ressourcer sammen. Kanoniske URLs og sitemap skal
opdateres, hvis butikken flytter fra GitHub Pages til et andet domæne.

## Validering

Kør regressionstests uden ekstra pakker (Node.js 18 eller nyere):

```sh
node --test tests/*.test.cjs
```

Testene kontrollerer gamle kurve, prisberegning, varianter, antal, fjernelse,
synkronisering, interne links, fragmenter, billedfiler, metadata og JavaScript.

Browserkontrol ved redesign: alle syv sider ved 320, 375, 390, 430, 768, 1024,
1280, 1440 og 1920 px. Interaktioner kontrolleres i den faktiske browser:
filtre, søgning, sortering, galleri, lysboks, mobile menu/dialoger, fokus,
kurvkontroller, checkout og formularvalidering. Der sendes ingen testordrer.
