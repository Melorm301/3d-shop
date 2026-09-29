/* ==========================================================================
   products.js - shop-identitet og produktdata
   --------------------------------------------------------------------------
   Alt redigerbart butiksindhold ligger her. Ingen af de andre filer behoever
   at kende priser, farver eller billedstier.

   Sådan tilføjer du et produkt:
   1. Læg billederne i images/products/ og brug filnavnet i "images".
   2. Kopiér en blok nedenfor og ret felterne.
   3. Produktet dukker automatisk op i shoppen, i "Latest off the printer"
      og i relaterede produkter.

   "sizes[].price" er prisen i ØRE (14900 = 149,00 DKK). Prisen vises ud fra
   den valgte størrelse. Ved rigtig betaling må prisen ALDRIG læses fra denne
   fil i browseren. Se handleCheckout() i cart.js.
   ========================================================================== */

window.Shop = (function () {
  "use strict";

  /* --- Butiksidentitet ---------------------------------------------------
     Ret navn, handle og mail her. Bruges i header, footer og på alle sider. */
  var config = {
    name: "LAYERLAB",
    handle: "@layerlab",
    email: "hej@layerlab.dk",
    instagram: "https://instagram.com/",
    currency: "DKK"
  };

  var products = [
    {
      id: "halloween-cat",
      name: "Halloween Cat",
      tagline: "Siddende kat i mat sort.",
      description:
        "En rolig, siddende kat med lukkede øjne og fine knurhår. Formen er holdt " +
        "enkel, så den passer lige så godt på skrivebordet som i vindueskarmen.",
      price: 14900,
      currency: "DKK",
      colors: [
        { name: "Black", hex: "#1A1917" },
        { name: "Bone White", hex: "#EFE9DC" },
        { name: "Burnt Orange", hex: "#C9500F" }
      ],
      sizes: [{ name: "One size", price: 14900 }],
      images: [
        "images/products/halloween-cat-01.jpg",
        "images/products/halloween-cat-02.jpg",
        "images/products/halloween-cat-03.jpg"
      ],
      featured: true,
      latest: { state: "ready", note: "Lige lagt op" }
    },

    {
      id: "fjord-wave-vase",
      name: "Fjord Wave Vase",
      tagline: "Vase med bløde bølger.",
      description:
        "Vasen har bløde, lodrette bølger, der giver liv i overfladen. Den kan " +
        "bruges til tørre blomster eller stå alene som dekoration.",
      price: 24900,
      currency: "DKK",
      colors: [
        { name: "Bone White", hex: "#EFE9DC" },
        { name: "Terracotta", hex: "#B5643F" },
        { name: "Charcoal", hex: "#3A3936" }
      ],
      sizes: [
        { name: "Small", price: 24900 },
        { name: "Medium", price: 27900 },
        { name: "Large", price: 34900 }
      ],
      images: [
        "images/products/fjord-wave-vase-01.jpg",
        "images/products/fjord-wave-vase-02.jpg"
      ],
      featured: true,
      latest: { state: "ready", note: "Sidste tre tilbage" },
      priceFrom: true
    },

    {
      id: "ghost-lady",
      name: "Ghost Lady",
      tagline: "Lille spøgelse med orange kant.",
      description:
        "En lille, venlig figur med en malet kant for neden. Den er fin som " +
        "enkeltstående pynt eller sammen med resten af efterårets ting.",
      price: 19900,
      currency: "DKK",
      colors: [
        { name: "White", hex: "#EFE9DC" },
        { name: "Burnt Orange", hex: "#C9500F" }
      ],
      sizes: [{ name: "One size", price: 19900 }],
      images: [
        "images/products/ghost-lady-01.jpg",
        "images/products/ghost-lady-02.jpg"
      ],
      featured: true,
      latest: { state: "ready", note: "Klar i denne uge" }
    },

    {
      id: "desk-organizer",
      name: "Minimal Desk Organizer",
      tagline: "Skellet bakke til skrivebordet.",
      description:
        "To rum til penne, clips og småting, så skrivebordet holder sig nogenlunde " +
        "ryddeligt. Den er nem at flytte rundt og nem at tørre af.",
      price: 18900,
      currency: "DKK",
      colors: [
        { name: "Charcoal", hex: "#3A3936" },
        { name: "Bone White", hex: "#EFE9DC" },
        { name: "Burnt Orange", hex: "#C9500F" }
      ],
      sizes: [
        { name: "Standard", price: 18900 },
        { name: "Wide", price: 22900 }
      ],
      images: [
        "images/products/desk-organizer-01.jpg",
        "images/products/desk-organizer-02.jpg"
      ],
      featured: true,
      latest: { state: "soon", note: "Kommer snart" },
      priceFrom: true
    },

    {
      id: "hex-planter",
      name: "Hex Planter",
      tagline: "Facetteret potte.",
      description:
        "Seks flader og en let skrå kant gør potten enkel at se på. Den kan bruges " +
        "til en lille plante eller stå tom som dekoration.",
      price: 21900,
      currency: "DKK",
      colors: [
        { name: "Terracotta", hex: "#B5643F" },
        { name: "Sand", hex: "#D6C3A1" },
        { name: "Charcoal", hex: "#3A3936" }
      ],
      sizes: [
        { name: "Small", price: 21900 },
        { name: "Large", price: 27900 }
      ],
      images: [
        "images/products/hex-planter-01.jpg",
        "images/products/hex-planter-02.jpg"
      ],
      featured: true,
      priceFrom: true
    },

    {
      id: "dice-tower",
      name: "Modular Dice Tower",
      tagline: "Tårn i to farver.",
      description:
        "Et lille tårn til terninger, hvor de to farver mødes midt på. Det kan " +
        "deles i to, så det er nemt at tage med.",
      price: 24900,
      currency: "DKK",
      colors: [
        { name: "Charcoal / Orange", hex: "#3A3936" },
        { name: "Bone / Charcoal", hex: "#EFE9DC" }
      ],
      sizes: [{ name: "One size", price: 24900 }],
      images: [
        "images/products/dice-tower-01.jpg",
        "images/products/dice-tower-02.jpg"
      ],
      featured: true
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
    return typeof limit === "number" ? list.slice(0, limit) : list;
  }

  function latest(limit) {
    var list = products.filter(function (p) { return !!p.latest; });
    return typeof limit === "number" ? list.slice(0, limit) : list;
  }

  function related(currentId, limit) {
    var list = products.filter(function (p) { return p.id !== currentId; });
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
    latest: latest,
    related: related,
    formatPrice: formatPrice,
    priceForSize: priceForSize
  };
})();
