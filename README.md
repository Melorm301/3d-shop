# LAYERLAB - statisk 3D-print shop

Et lille, sammenhaengende website til en hobbybaseret 3D-printshop. Ren HTML, CSS og
vanilla JavaScript. Ingen frameworks, ingen build-trin, ingen afhaengigheder.

Siden kan aabnes direkte fra filsystemet og hostes som statisk site paa fx GitHub Pages
eller Cloudflare Pages.

## Struktur

```
/
├── index.html        Forside: hero, shop, maker-sektion, printlog
├── product.html      Produktside: galleri, varianter, kurv, detaljer
├── cart.html         Kurv: varer, antal, opsummering, betaling
├── faq.html          FAQ med kategorier og accordion
├── contact.html      Kontaktformular og alternative kontaktveje
│
├── css/
│   └── style.css     Alt design: tokens, komponenter, responsive regler
│
├── js/
│   ├── products.js   Butiksidentitet og alle produktdata
│   ├── cart.js       Kurv med localStorage og checkout-forberedelse
│   └── main.js       Faelles adfaerd og side-specifik logik
│
├── images/
│   ├── hero-studio.jpg
│   └── products/     Produktbilleder
│
└── assets/
    └── favicon.svg
```

`product.html` laeser produktet fra url'en, fx `product.html?id=halloween-cat`.
Indholdet kommer fra `js/products.js`.

## Ret butikken til

**Navn, Instagram og mail** staar ét sted: `config` i `js/products.js`. Det bliver
indsat i header, footer og paa kontakt- og produktside.

**Farver og typografi** styres fra `:root` i `css/style.css`.

**Produkter** tilfoejes i `products`-arrayet i `js/products.js`:

```js
{
  id: "stl-navn",                 // bruges i url og i kurven
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

## Kurv

Kurven ligger i `localStorage` under noeglen `layerlab.cart.v1`. Den kan tilfoeje,
fjerne, aendre antal, beregne subtotal og vise antal varer i headeren.

**Vigtigt om priser:** priserne i browseren bruges kun til visning. Ved rigtig
betaling skal serveren selv slaa prisen op ud fra `id`, farve, stoerrelse og antal.
Det er forberedt i `checkoutPayload()` og `handleCheckout()` i `js/cart.js`.

## Saadan kobles Stripe paa senere

1. Opret en Cloudflare Worker paa ruten `/api/create-checkout-session`.
2. Send `{ items: [{ id, color, size, qty }] }` som i `checkoutPayload()`.
3. Slaa de rigtige priser op i Worker'ens egen produktliste (ikke fra klienten).
4. Opret en Stripe Checkout Session med `line_items` og returnér `{ url }`.
5. Klienten videresender allerede til `data.url`, naar svaret kommer.

Betaling kan ikke fuldfoeres, foer dette endpoint findes. Indtil da viser kurven en
besked om, at betalingen ikke er koblet paa.

## Kontaktformular

Formularen i `contact.html` sender ingen data endnu. Der ligger en kommentar i
filen med tre mulige veje: Cloudflare Pages Forms, eget Worker-endpoint eller en
mailtjeneste via Worker. Laeg aldrig noegler eller mailadgang i frontend-filerne.

## Tilgaengelighed og detaljer

- Semantisk HTML, skip-link, fokusring og `prefers-reduced-motion` er respekteret.
- Alle sider deler ét stylesheet. Header og footer er gentaget i hver fil, fordi
  siden er statisk og skal kunne laeses uden JavaScript.
- `hidden` bruges til tilstande, saa indhold ikke vises forkert foer JavaScript koerer.
