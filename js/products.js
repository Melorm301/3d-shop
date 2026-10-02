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
     Ret navn og kontaktlinks her. Bruges på alle sider. */
  var config = {
    name: "NordForm",
    cvr: "41693908",
    telegram: "@test",
    currency: "DKK"
  };

  var products = [
    {
      id: "recon-station-v2",
      sku: "SH-RECON-V2",
      name: "Recon Station V2",
      tagline: "Kompakt station til vials og tilbehør ved rekonstituering.",
      description: "Kompakt station, der holder peptide-vials og tilbehør samlet ved rekonstituering af lyofiliseret peptidpulver. BAC-vand kan indgå, når det passer til det konkrete præparats anvisninger. Stationen er en organisatorisk holder og ikke medicinsk udstyr.",
      price: 12900,
      currency: "DKK",
      category: "Peptides",
      images: [
        "images/products/recon-station-v2-01.webp",
        "images/products/recon-station-v2-02.webp"
      ],
      featured: false
    },
    {
      id: "recon-station-v1",
      sku: "SH-RECON-V1",
      name: "Recon Station V1",
      tagline: "Cylindrisk station til vials og tilbehør ved rekonstituering.",
      description: "Cylindrisk station, der holder peptide-vials og tilbehør samlet ved rekonstituering af lyofiliseret peptidpulver. BAC-vand kan indgå, når det passer til det konkrete præparats anvisninger. Stationen er en organisatorisk holder og ikke medicinsk udstyr.",
      price: 15900,
      currency: "DKK",
      category: "Peptides",
      images: ["images/products/recon-station-v1-01.webp"],
      featured: false
    },
    {
      id: "insulin-ready-to-go-case",
      sku: "SH-CASE-INSULIN",
      name: "Insulin Ready-to-Go Case",
      tagline: "Kompakt rejsecase med opdelt opbevaring.",
      description: "Kompakt rejsecase med opdelt opbevaring.",
      price: 17900,
      currency: "DKK",
      category: "Peptides",
      images: [
        "images/products/insulin-ready-to-go-01.webp",
        "images/products/insulin-ready-to-go-02.webp"
      ],
      featured: true,
      featuredRank: 3
    },
    {
      id: "pen-holder-round-9",
      sku: "SH-PEN-009",
      name: "9 Pen Holder Round",
      tagline: "Rund holder med plads til op til 9 pens.",
      description: "Rund holder med plads til op til 9 pens.",
      price: 19900,
      currency: "DKK",
      category: "Peptides",
      images: [
        "images/products/pen-holder-round-01.webp",
        "images/products/pen-holder-round-02.webp",
        "images/products/pen-holder-round-03.webp",
        "images/products/pen-holder-round-04.webp"
      ],
      featured: false
    },
    {
      id: "peptide-case-50-vials",
      sku: "SH-CASE-VIAL50",
      name: "Peptide 50 Vials Case",
      tagline: "Case med plads til op til 50 vials.",
      description: "3D-printet case med plads til op til 50 vials.",
      price: 24900,
      currency: "DKK",
      category: "Peptides",
      images: [
        "images/products/peptide-case-50-vials-01.webp",
        "images/products/peptide-case-50-vials-02.webp"
      ],
      featured: false
    },
    {
      id: "pen-case",
      sku: "SH-PEN-CASE-005",
      name: "Pen Case",
      tagline: "Hardcase til pens og tilbehør.",
      description: "Hardcase med organiseret plads til pens og tilbehør.",
      price: 29900,
      currency: "DKK",
      category: "Peptides",
      images: [
        "images/products/pen-case-01.webp",
        "images/products/pen-case-02.webp",
        "images/products/pen-case-03.webp"
      ],
      featured: true,
      featuredRank: 1
    },
    {
      id: "prep-station-large",
      sku: "SH-PREP-LARGE",
      name: "Stor Prep Station",
      tagline: "Stor prep station med dispenser og opbevaringsrum.",
      description: "Stor prep station med dispenser og flere opbevaringsrum.",
      price: 29900,
      currency: "DKK",
      category: "Peptides",
      images: [
        "images/products/prep-station-large-01.webp",
        "images/products/prep-station-large-02.webp"
      ],
      featured: false
    },
    {
      id: "64-vial-powcan-insert",
      sku: "SH-64-VIAL-POWCAN",
      name: "64 Vial Powcan Insert",
      tagline: "Plads til 64 vials. Powcan-beholder medfølger.",
      description: "64-vials insert til Powcan-beholder. Prisen inkluderer både indsatsen og Powcan-beholderen.",
      price: 40000,
      currency: "DKK",
      category: "Peptides",
      images: [
        "images/products/64-vial-powcan-insert-01.webp",
        "images/products/64-vial-powcan-insert-02.webp",
        "images/products/64-vial-powcan-insert-03.webp"
      ],
      featured: true,
      featuredRank: 2
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
