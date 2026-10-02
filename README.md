# NordForm - statisk shop

Et lille, sammenhaengende website til en hobbybaseret 3D-printshop. Ren HTML, CSS og
vanilla JavaScript. Ingen frameworks, ingen build-trin, ingen afhaengigheder.

Siden kan aabnes direkte fra filsystemet og hostes som statisk site paa fx GitHub Pages
eller Cloudflare Pages.

## Struktur

```
/
├── index.html        Forside med hero og udvalgte produkter
├── shop.html         Produktoversigt med kategorifilter og kurvknapper
├── product.html      Produktside: galleri, pris og kurvknap
├── cart.html         Browserlokal kurv
├── checkout.html     Ordreoversigt og Telegram-bestilling
├── faq.html          FAQ med kategorier og accordion
├── contact.html      Kontakt via Telegram
│
├── css/
│   └── style.css     Alt design: tokens, komponenter, responsive regler
│
├── js/
│   ├── products.js   Butiksidentitet og alle produktdata
│   ├── cart.js       Kurv og ordrekladde til Telegram
│   └── main.js       Faelles adfaerd og side-specifik logik
│
├── images/
│   ├── hero-studio.jpg
│   └── products/     Produktbilleder
│
└── assets/
    └── favicon.svg
```

`product.html` laeser produktet fra url'en, fx `product.html?id=pen-case`.
Indholdet kommer fra `js/products.js`.

## Ret butikken til

Virksomhedsnavn: **NordForm**. CVR: **41693908**. De centrale værdier og
Telegram-brugernavn staar i `config` i `js/products.js`. Telegram bruges til alle
produktspørgsmål og bestillinger.

**Farver og typografi** styres fra `:root` i `css/style.css`.

**Produkter** tilfoejes i `products`-arrayet i `js/products.js`:

```js
{
  id: "stl-navn",                 // bruges i produktets url
  name: "Produktnavn",
  tagline: "Kort linje, vises under navnet i shoppen",
  description: "Kort beskrivelse i 2-3 saetninger til produktsiden",
  price: 14900,                   // OERE. 14900 = 149,00 DKK
  currency: "DKK",
  colors: [{ name: "Black", hex: "#1A1917" }],
  sizes: [{ name: "One size", price: 14900 }],
  images: ["images/products/stl-navn-01.jpg"],
  featured: true,                 // vises i shop-grid'en
  priceFrom: true,                // viser "fra ..." naar der er flere stoerrelser
  latest: { state: "ready", note: "Lige lagt op" }
}
```

Hold produktsiden ren: navn, pris, en kort linje og en kort beskrivelse. Alt
teknisk om printet er bevidst udeladt.

## Billeder

Produktbillederne i `images/products/` er midlertidige AI-genererede studiofotos,
lavet til at kunne skiftes ud én til én. Brug samme filnavn, eller ret stierne i
`js/products.js`. Optimalt: 1448 x 1086 px (4:3) til produkter og 1672 x 941 px
til hero-billedet.

## Bestilling og kontakt

Kurven gemmes lokalt i kundens browser. Checkout sender ikke betaling eller
ordren automatisk: den åbner en ordrekladde i Telegram, som kunden selv vælger
at sende. Lagerstatus, fragt og betaling aftales derefter. Skift `telegram` i
`config` i `js/products.js`, når det endelige Telegram-brugernavn er klar.

SEO-grundlaget omfatter sidetitler, beskrivelser, canonical- og Open Graph-tags,
strukturerede data for virksomheden og produktsider samt `sitemap.xml` og
`robots.txt`. Indholdet hostes på GitHub Pages; tilpas de kanoniske URLs i
HTML-filerne og sitemap, hvis domænet ændres.

## Tilgaengelighed og detaljer

- Semantisk HTML, skip-link, fokusring og `prefers-reduced-motion` er respekteret.
- Alle sider deler ét stylesheet. Header og footer er gentaget i hver fil, fordi
  siden er statisk og skal kunne laeses uden JavaScript.
- `hidden` bruges til tilstande, saa indhold ikke vises forkert foer JavaScript koerer.
