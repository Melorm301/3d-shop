/* ==========================================================================
   products.js - shop-identitet og produktdata
   --------------------------------------------------------------------------
   Alt redigerbart butiksindhold ligger her. Ingen af de andre filer behoever
   at kende priser, farver eller billedstier.

   Sådan tilføjer du et produkt:
   1. Læg billederne i images/stykk/ og brug filnavnet i "images".
   2. Kopiér en blok nedenfor og ret felterne.
   3. Produktet dukker automatisk op i shoppen, i forsidens udvalg
      og i relaterede produkter.

   "sizes[].price" er prisen i ØRE (14900 = 149,00 DKK). Prisen vises ud fra
   den valgte størrelse. Telegram-checkout er en manuel ordreforespørgsel;
   denne browserfil er ikke betalingsautoritet.
   ========================================================================== */

window.Shop = (function () {
  "use strict";

  /* --- Butiksidentitet ---------------------------------------------------
     Ret navn og kontaktlinks her. Bruges på alle sider. */
  var config = {
    name: "STYKK",
    cvr: "41693908",
    telegram: "@test",
    currency: "DKK"
  };

  // Vejledende designpriser, godkendt af ejeren til dette redesign.
  var products = [
  {
    "id": "rib-vaeg",
    "sku": "ST-001",
    "name": "Rib / vægknage",
    "tagline": "En enkel knage. En tydelig rytme.",
    "description": "En vægknage med lodrette ribber og en afrundet krog. Til de ting, du gerne vil have ved hånden. Billederne viser designet i flere farver; vi aftaler farve og montering med dig før bestilling.",
    "price": 8900,
    "currency": "DKK",
    "category": "Bolig",
    "images": [
      "images/stykk/rib-vaeg.webp"
    ],
    "featured": true,
    "featuredRank": 1,
    "estimatedPrice": true,
    "colors": [
      {
        "name": "Varm brun",
        "hex": "#aa7955"
      },
      {
        "name": "Lys",
        "hex": "#e3dfd5"
      },
      {
        "name": "Mørk",
        "hex": "#343737"
      }
    ],
    "imageAlts": [
      "Tre Rib-vægknager med afrundede kroge og lodrette ribber i brun, lys og mørk farve"
    ]
  },
  {
    "id": "bue-knage",
    "sku": "ST-002",
    "name": "Bue / knage",
    "tagline": "En blød bue til det, der skal hænge.",
    "description": "Den sammenhængende bue og den ribbede overflade giver knagen sit udtryk. En lille funktionel detalje på væggen. Farve, mål og montering aftales før bestilling.",
    "price": 10900,
    "currency": "DKK",
    "category": "Bolig",
    "images": [
      "images/stykk/bue-knage.webp",
      "images/stykk/bue-knage-02.webp"
    ],
    "featured": true,
    "featuredRank": 2,
    "estimatedPrice": true,
    "colors": [
      {
        "name": "Varm brun",
        "hex": "#aa7955"
      },
      {
        "name": "Lys",
        "hex": "#e3dfd5"
      },
      {
        "name": "Mørk",
        "hex": "#343737"
      }
    ],
    "imageAlts": [
      "Tre Bue-knager i brun, lys og mørk farve med en stofstrop i den brune knage",
      "Bue-knagens afrundede profil og ribbede overflade vist i tre farver"
    ]
  },
  {
    "id": "rib-doer",
    "sku": "ST-003",
    "name": "Rib / dørknage",
    "tagline": "Plads til mere. Lige ved døren.",
    "description": "En knage med to kroge og en form, der går over dørens kant. Den lodrette ribbestruktur forbinder den med Rib-vægknagen. Oplys dørens tykkelse, så vi kan afklare pasformen før bestilling.",
    "price": 12900,
    "currency": "DKK",
    "category": "Bolig",
    "images": [
      "images/stykk/rib-doer.webp"
    ],
    "featured": true,
    "featuredRank": 3,
    "estimatedPrice": true,
    "colors": [
      {
        "name": "Varm brun",
        "hex": "#aa7955"
      },
      {
        "name": "Lys",
        "hex": "#e3dfd5"
      },
      {
        "name": "Mørk",
        "hex": "#343737"
      }
    ],
    "imageAlts": [
      "Tre Rib-dørknager med to kroge, hængt over dørkanter"
    ]
  },
  {
    "id": "klem-clip",
    "sku": "ST-004",
    "name": "Klem / poseclip",
    "tagline": "En lille ting, der samler.",
    "description": "En ribbet clip til at samle kanten af en pose. De afrundede ender giver et roligt, enkelt udtryk. Spørg os om størrelse og anvendelse til den pose, du vil bruge den på.",
    "price": 3900,
    "currency": "DKK",
    "category": "Tilbehør",
    "images": [
      "images/stykk/klem-clip.webp"
    ],
    "featured": false,
    "featuredRank": 99,
    "estimatedPrice": true,
    "colors": [
      {
        "name": "Varm brun",
        "hex": "#aa7955"
      },
      {
        "name": "Lys",
        "hex": "#e3dfd5"
      },
      {
        "name": "Mørk",
        "hex": "#343737"
      }
    ],
    "imageAlts": [
      "Tre ribbede Klem-poseclips i brun, lys og mørk farve; den brune clip holder en pose lukket"
    ]
  },
  {
    "id": "skra-holder",
    "sku": "ST-005",
    "name": "Skrå / holder",
    "tagline": "Giv skærmen en fast plads.",
    "description": "En vinklet holder med en åben, trekantet form og støtte i bunden. Billedet viser en sort udgave. Fortæl os, hvilken enhed du vil bruge den til, så afklarer vi mål og pasform.",
    "price": 7900,
    "currency": "DKK",
    "category": "Tilbehør",
    "images": [
      "images/stykk/skra-holder.webp"
    ],
    "featured": false,
    "featuredRank": 99,
    "estimatedPrice": true,
    "imageAlts": [
      "Sort Skrå-holder med trekantet sideprofil og støtte i bunden på et skrivebord"
    ]
  },
  {
    "id": "tak-objekt",
    "sku": "ST-006",
    "name": "Tak / objekt",
    "tagline": "Ribber, kurver og et lille gevir.",
    "description": "Et dekorativt objekt med en bølgende, ribbet krop og et enkelt gevir. På en hylde, i vindueskarmen eller som en del af en sæsonopstilling. Pris er pr. objekt; farve og størrelse aftales.",
    "price": 11900,
    "currency": "DKK",
    "category": "Objekter",
    "images": [
      "images/stykk/tak-objekt.webp"
    ],
    "featured": false,
    "featuredRank": 99,
    "estimatedPrice": true,
    "colors": [
      {
        "name": "Grøn",
        "hex": "#697863"
      },
      {
        "name": "Sand",
        "hex": "#b99b7c"
      },
      {
        "name": "Rød",
        "hex": "#883c35"
      }
    ],
    "imageAlts": [
      "Tre Tak-objekter med gevir og bølgende ribber i grøn, sand og rød"
    ]
  },
  {
    "id": "svoeb-figur",
    "sku": "ST-007",
    "name": "Svøb / figur",
    "tagline": "En lille figur med sit eget udtryk.",
    "description": "En dekorativ spøgelsesfigur med bløde folder og et legende udtryk. Billedet viser en lys udgave i en efterårsopstilling. Farve og størrelse aftales før bestilling.",
    "price": 8900,
    "currency": "DKK",
    "category": "Objekter",
    "images": [
      "images/stykk/svoeb-figur.webp"
    ],
    "featured": false,
    "featuredRank": 99,
    "estimatedPrice": true,
    "imageAlts": [
      "Lys Svøb-spøgelsesfigur med foldet overflade i en efterårsopstilling"
    ]
  },
  {
    "id": "sno-flexifigur",
    "sku": "ST-008",
    "name": "Sno / flexifigur",
    "tagline": "En lille figur, der kan sno sig.",
    "description": "En leddelt figur med en buet, farverig form. Den kan formes og snoes i hånden. Prisen er vejledende pr. figur.",
    "price": 4900,
    "estimatedPrice": true,
    "estimatedUnit": "pr. figur",
    "currency": "DKK",
    "category": "Legetøj",
    "images": [
      "images/stykk/sno-flexifigur.webp"
    ],
    "isNew": true,
    "featuredRank": 8,
    "imageAlts": [
      "Række af farverige, leddelte figurer formet i buede slangeagtige kurver med en mindre pink figur foran"
    ]
  },
  {
    "id": "krible-flexifigur",
    "sku": "ST-009",
    "name": "Krible / flexifigur",
    "tagline": "Små dyr med en leddelt krop.",
    "description": "Små, farverige figurer med en rund krop og små detaljer. Billedet viser dem i flere farver og former. Prisen er vejledende pr. figur.",
    "price": 2900,
    "estimatedPrice": true,
    "estimatedUnit": "pr. figur",
    "currency": "DKK",
    "category": "Legetøj",
    "images": [
      "images/stykk/krible-flexifigur.webp"
    ],
    "isNew": true,
    "featuredRank": 9,
    "imageAlts": [
      "Små, farverige leddelte dyrefigurer vist på række i regnbuens farver med en pink figur separat"
    ]
  },
  {
    "id": "juletryk-kageform",
    "sku": "ST-010",
    "name": "Juletryk / kageform",
    "tagline": "Et lille juletryk til hjemmebag.",
    "description": "En rund kageform med præget julehilsen. Billedet viser formen sammen med småkager, hvor teksten står frem i dejen. Prisen er vejledende pr. form.",
    "price": 7900,
    "estimatedPrice": true,
    "estimatedUnit": "pr. form",
    "currency": "DKK",
    "category": "Køkken",
    "images": [
      "images/stykk/juletryk-kageform.webp"
    ],
    "isNew": true,
    "featuredRank": 10,
    "imageAlts": [
      "Rund kageform med Merry Christmas-tekst vist sammen med stemplede småkager"
    ]
  },
  {
    "id": "punkt-mobilholder",
    "sku": "ST-011",
    "name": "Punkt / mobilholder",
    "tagline": "Et blødt punkt til mobilen.",
    "description": "En lille, rund mobilholder med profileret overflade. Billedet viser en telefon, der står lodret i holderen. Prisen er vejledende pr. holder.",
    "price": 7900,
    "estimatedPrice": true,
    "estimatedUnit": "pr. holder",
    "currency": "DKK",
    "category": "Tilbehør",
    "images": [
      "images/stykk/punkt-mobilholder.webp"
    ],
    "isNew": true,
    "featuredRank": 11,
    "imageAlts": [
      "Lys mobilskærm placeret lodret i en lille rund, rosa holder på et bord"
    ]
  },
  {
    "id": "fold-mobilholder",
    "sku": "ST-012",
    "name": "Fold / mobilholder",
    "tagline": "En enkel vinkel til mobilen.",
    "description": "En sort mobilholder med vinklet ryg og en bred, lav forkant. Den kompakte form lader telefonen stå oprejst på bordet. Prisen er vejledende pr. holder.",
    "price": 6900,
    "estimatedPrice": true,
    "estimatedUnit": "pr. holder",
    "currency": "DKK",
    "category": "Tilbehør",
    "images": [
      "images/stykk/fold-mobilholder.webp"
    ],
    "isNew": true,
    "featuredRank": 12,
    "imageAlts": [
      "Sort, vinklet mobilholder med bred forkant og åben trekantet sideprofil"
    ]
  },
  {
    "id": "wallart-nordisk-sol-bue",
    "sku": "ST-013",
    "name": "Nordisk sol og bue",
    "tagline": "Grafisk ro med sol, blade og bløde former.",
    "description": "Smukt 3D-printet wall art med sorte grene, en varm sol og nordiske bueformer. Et lille kunstværk, der giver væggen personlighed. Ca. 20 × 20 × 0,3 cm.",
    "price": 39900,
    "currency": "DKK",
    "category": "Wall art",
    "images": ["images/stykk/wallart-nordisk-bue-sol.webp"],
    "imageAlts": ["Nordisk wall art med sorte blade, varm sol og grafisk bue på en lys væg"]
  },
  {
    "id": "wallart-nordisk-silhuet",
    "sku": "ST-014",
    "name": "Nordisk kvindesilhuet",
    "tagline": "En stille silhuet i solens varme skær.",
    "description": "Smukt 3D-printet wall art med en stiliseret kvindesilhuet, en varm sol og enkle nordiske former. Et stemningsfuldt blikfang i hjemmet. Ca. 20 × 20 × 0,3 cm.",
    "price": 39900,
    "currency": "DKK",
    "category": "Wall art",
    "images": ["images/stykk/wallart-nordisk-silhuet.webp"],
    "imageAlts": ["Nordisk wall art med kvindesilhuet, varm sol og grafiske former"]
  },
  {
    "id": "wallart-nordisk-oliventrae",
    "sku": "ST-015",
    "name": "Nordisk oliventræ",
    "tagline": "Et skulpturelt træ ved roligt vand.",
    "description": "Smukt 3D-printet wall art med et oliventræ, roligt vand og en varm sol. Den grafiske kontrast giver motivet et enkelt, nordisk udtryk. Ca. 20 × 20 × 0,3 cm.",
    "price": 39900,
    "currency": "DKK",
    "category": "Wall art",
    "images": ["images/stykk/wallart-nordisk-oliventrae.webp"],
    "imageAlts": ["Nordisk wall art med et mørkt oliventræ ved vandet under en varm sol"]
  },
  {
    "id": "wallart-portraet-guld-ekko",
    "sku": "ST-016",
    "name": "Portræt med gyldent ekko",
    "tagline": "Et udtryksfuldt portræt i sort, sand og okker.",
    "description": "Smukt 3D-printet wall art med et markant stencilportræt og varme okkerfarvede detaljer. Et kunstnerisk statement i et kompakt format. Ca. 20 × 20 × 0,3 cm.",
    "price": 39900,
    "currency": "DKK",
    "category": "Wall art",
    "images": ["images/stykk/wallart-portraet-guld-ekko.webp"],
    "imageAlts": ["Stencilportræt i sort, creme og okker vist som wall art på en lys væg"]
  },
  {
    "id": "wallart-portraet-roed-sol",
    "sku": "ST-017",
    "name": "Portræt under rød sol",
    "tagline": "Grafisk portræt med en stærk rød accent.",
    "description": "Smukt 3D-printet wall art med et stiliseret portræt, mørke penselstrøg og en dyb rød sol. Skabt til at tilføre farve og karakter til væggen. Ca. 20 × 20 × 0,3 cm.",
    "price": 39900,
    "currency": "DKK",
    "category": "Wall art",
    "images": ["images/stykk/wallart-portraet-roed-sol.webp"],
    "imageAlts": ["Stencilportræt under en rød sol med sorte og sandfarvede detaljer"]
  },
  {
    "id": "wallart-new-nordic-banksy",
    "sku": "ST-018",
    "name": "New Nordic / Banksy",
    "tagline": "Stencilkunst med bløde nordiske farver.",
    "description": "Smukt 3D-printet wall art med en liggende figur, grafiske skygger og en varm okkerfarvet sol. Et markant motiv med et roligt nordisk farvespil. Ca. 20 × 20 × 0,3 cm.",
    "price": 39900,
    "currency": "DKK",
    "category": "Wall art",
    "images": ["images/stykk/wallart-new-nordic-banksy.webp"],
    "imageAlts": ["Stencilinspireret wall art med liggende figur, okkersol og grafiske mørke former"]
  },
  {
    "id": "wallart-maane-over-fjord",
    "sku": "ST-019",
    "name": "Måne over fjorden",
    "tagline": "Et nordisk fjordlandskab i måneskin.",
    "description": "Smukt 3D-printet wall art med måne, fjord, bjerge og små træer samlet i et roligt, rundt motiv. Et lille stykke nordisk natur til væggen. Ca. 20 × 20 × 0,3 cm.",
    "price": 39900,
    "currency": "DKK",
    "category": "Wall art",
    "images": ["images/stykk/wallart-maane-over-fjord.webp"],
    "imageAlts": ["Rundt sort-hvidt fjordmotiv med måne, bjerge, vand og træer"]
  }
];

  /* --- Hjælpefunktioner -------------------------------------------------- */

  function all() {
    return products.slice();
  }

  function byId(id) {
    for (var i = 0; i < products.length; i++) {
      if (products[i].id === id) return products[i];
    }
    return null;
  }

  function featured(limit) {
    var list = products.filter(function (p) { return p.featured; });
    list.sort(function (a, b) {
      return (a.featuredRank || 0) - (b.featuredRank || 0);
    });
    return typeof limit === "number" ? list.slice(0, limit) : list;
  }

  function latest(limit) {
    var list = products.filter(function (p) { return !!p.latest; });
    return typeof limit === "number" ? list.slice(0, limit) : list;
  }

  function newArrivals(limit) {
    var list = products.filter(function (p) { return !!p.isNew; });
    list.sort(function (a, b) { return (a.featuredRank || 99) - (b.featuredRank || 99); });
    return typeof limit === "number" ? list.slice(0, limit) : list;
  }

  function productPrice(product) {
    var prefix = product && product.estimatedPrice ? "ca. " : "";
    var price = formatPrice(product ? product.price : 0, product ? product.currency : config.currency);
    var unit = product && product.estimatedUnit ? " / " + product.estimatedUnit : "";
    return prefix + price + unit;
  }

  function related(currentId, limit) {
    var current = byId(currentId);
    var list = products.filter(function (p) { return p.id !== currentId; });
    list.sort(function (a, b) { return Number(b.category === (current || {}).category) - Number(a.category === (current || {}).category); });
    return typeof limit === "number" ? list.slice(0, limit) : list;
  }

  /* 14900 -> "149 DKK", 14950 -> "149,50 DKK" */
  function formatPrice(ore, currency) {
    var kr = (Number(ore) || 0) / 100;
    var text = (Math.round(kr * 100) / 100).toFixed(kr % 1 === 0 ? 0 : 2).replace(".", ",");
    return text + " " + (currency || config.currency);
  }

  /* Effektiv pris for et produkt ud fra valgt størrelse. */
  function priceForSize(product, sizeName) {
    if (!product || !product.sizes || !product.sizes.length) {
      return product ? product.price : 0;
    }
    for (var i = 0; i < product.sizes.length; i++) {
      if (product.sizes[i].name === sizeName) return product.sizes[i].price;
    }
    return product.sizes[0].price;
  }

  return {
    config: config,
    all: all,
    byId: byId,
    featured: featured,
    newArrivals: newArrivals,
    productPrice: productPrice,
    latest: latest,
    related: related,
    formatPrice: formatPrice,
    priceForSize: priceForSize
  };
})();
