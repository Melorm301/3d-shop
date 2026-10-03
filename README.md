# STYKK

Nordisk design, printet med omtanke. Statisk butik i HTML, CSS og JavaScript.

## Lokal preview

```sh
python3 -m http.server 4173 --bind 127.0.0.1
```

Åbn http://127.0.0.1:4173/. Ingen installation eller build er nødvendigt.

## Sider og moduler

- `index.html`: fotografisk hero, udvalgte STYKK, filosofi, dekorative objekter, fremstilling, specialdesign og kundeservice.
- `shop.html`: syv produkter i Bolig, Tilbehør og Objekter; søgning, kategori og sortering.
- `about.html`: brandets tilgang til form, funktion og materialevalg.
- `product.html?id=bue-knage`: galleri, lysboks, ønsket farve, antal, produktdetaljer og relaterede STYKK.
- `cart.html` og `checkout.html`: vedvarende kurv, vejledende varetotal, bemærkning og manuel ordrekladde.
- `contact.html`: kontakt og formular til specialdesign. `?product=bue-knage#custom` udfylder en produktforespørgsel.
- `faq.html`: materialer, farver, bestilling, tilpasning og levering.
- `js/products.js`: brandkonfiguration, produktbeskrivelser, vejledende priser i øre, visuelle farveønsker, billeder og alt-tekster.
- `js/image-data.js`: billedmål og responsive WebP-kilder.
- `js/ui.js`, `catalog.js`, `product.js`, `main.js`: delte UI-primitiver, katalog, produktvisning, navigation og formularer.
- `js/cart.js`: kurv, antal, variantegenskaber, totaler, lagring og Telegram-kladde.
- `css/style.css`: fælles typografi, flader, komponenter, responsive layouts og reduced-motion-regler.
- `images/stykk/`: otte originale referencebilleder og versioner til 480 og 960 px.
- `docs/REDESIGN-RAPPORT.md`: designvalg, billedoversigt, kontrolresultater og næste iteration.

## Sortiment og cirka-priser

Det tidligere sortiment er fjernet efter ejerens udtrykkelige instruktion. Der er syv nye STYKK med vejledende designpriser: Rib / vægknage 89 DKK, Bue / knage 109 DKK, Rib / dørknage 129 DKK, Klem / poseclip 39 DKK, Skrå / holder 79 DKK, Tak / objekt 119 DKK og Svøb / figur 89 DKK.

`estimatedPrice: true` markerer de vejledende priser. Produktschema indeholder derfor ikke et fast pristilbud. Prisen er pr. STYKK, selv om billederne viser flere farver. Farvevalg er ønsker baseret på billedmaterialet og bekræftes før bestilling. Der findes ingen dokumenterede produktmål, materialetyper, belastningsgrænser eller certificeringer i det nye materiale.

## Bestilling og kontakt

Brand: **STYKK**. Eksisterende CVR **41693908** er bevaret. Kontakt i `Shop.config.telegram` er stadig **@test**, en placeholder fra det oprindelige projekt. Udskift den med den rigtige kontakt før brug til reelle bestillinger. Statisk fallback-kontakt i HTML skal opdateres samtidig, hvis kontakt ændres.

Der er ingen betaling, lagerstyring eller formularserver. Checkout klargør en forespørgsel i Telegram, som kunden selv sender; endelig pris, materiale, mål, farve, levering og betaling aftales direkte. Ordreteksten kan kopieres. Kontaktformularen validerer input og laver tilsvarende en kladde uden automatisk afsendelse.

Kurven holder produkt/farve/størrelse adskilt og begrænser antal til 1–99. Ukendte og udgåede produkt-ID'er afvises. Den interne lagringsnøgle `nordform.cart.v1` bevares til sikker håndtering af eksisterende browserdata; den er ikke kundevendt branding. Kontaktoplysninger og ordrebemærkninger gemmes ikke i localStorage. Ved blokeret lagring virker kurven i hukommelsen på den aktuelle side.

## Vedligeholdelse

Efter ændringer i produktdata:

```sh
node scripts/render-catalog.cjs
```

Billedmanifest og responsive filer kan opdateres med Python og Pillow:

```sh
python3 scripts/prepare-images.py
```

Scriptet læser kun projektets egne `images/stykk/`-filer. Ingen assets afhænger af eksterne lokale mapper. Originalerne bevares, og billeddele ændres ikke.

## SEO og tilgængelighed

Alle sider har dansk sprog, titel, description, canonical og Open Graph. Forsiden har WebSite- og Organization-schema; produktsiden har dynamisk Product-schema. Sitemap indeholder de nye produkt-ID'er og Om-siden. Kurv og checkout er noindex. GitHub Pages-URL er bevaret; skift canonical, OG, dynamiske produkt-URLs, robots og sitemap ved et domæneskift.

Produktkort findes i statisk HTML for hurtig første visning og crawlbare links. Produktspecifik metadata kræver JavaScript; separate statiske produktsider kan være en senere forbedring.

Navigation, galleri og lysboks bruger native dialoger med Escape, fokusretur og keyboard-kontroller. Der er skip-link, labels, focus states, alternative billedtekster og reduced-motion-understøttelse. Systemfonte og CSS-animationer holder siden uafhængig af font-CDN'er og animationspakker.

## Validering

```sh
node --test tests/*.test.cjs
```

12 tests dækker prisberegning, farve/størrelsesvarianter, antal, fjernelse, lagring, udgåede varer, synkronisering, lokale links, fragmenter, assets, metadata og JavaScript-syntaks. Projektet har ingen separat lint-, typecheck- eller build-pipeline. Den statiske kataloggenerering er kørt.

Browserkontrol ved redesign: alle otte sider ved 320, 390, 768, 1024 og 1440 px. Søgning, sortering, kategori, galleri, lysboks, farveønske, kurv, mobil købsknap, fokusretur, kontaktvalidering, FAQ og ordrekladde er kontrolleret. Ingen eksterne testordrer er sendt.
