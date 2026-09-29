/* ==========================================================================
   main.js - faelles adfaerd for alle sider
   --------------------------------------------------------------------------
   Rækkefølge: ikoner -> indhold -> navigation -> animationer -> side-specifikt.
   Ingen frameworks, ingen build-trin. Kan køre direkte fra filsystemet.
   ========================================================================== */

(function () {
  "use strict";

  /* --- Ikoner (Lucide-geometri, inline så der ikke hentes noget udefra) ---- */

  var ICON_PATHS = {
    plus: '<path d="M5 12h14"/><path d="M12 5v14"/>',
    x: '<path d="M18 6 6 18"/><path d="m6 6 12 12"/>',
    menu: '<path d="M4 6h16"/><path d="M4 12h16"/><path d="M4 18h16"/>',
    maximize: '<path d="M8 3H5a2 2 0 0 0-2 2v3"/><path d="M21 8V5a2 2 0 0 0-2-2h-3"/><path d="M3 16v3a2 2 0 0 0 2 2h3"/><path d="M16 21h3a2 2 0 0 0 2-2v-3"/>',
    chevronLeft: '<path d="m15 18-6-6 6-6"/>',
    chevronRight: '<path d="m9 18 6-6-6-6"/>'
  };

  function iconSVG(name, extraClass) {
    var path = ICON_PATHS[name] || "";
    return '<svg class="icon ' + (extraClass || "") + '" viewBox="0 0 24 24" aria-hidden="true" focusable="false">' + path + "</svg>";
  }

  function hydrateIcons(root) {
    var scope = root || document;
    var nodes = scope.querySelectorAll("[data-icon]");
    for (var i = 0; i < nodes.length; i++) {
      var node = nodes[i];
      node.insertAdjacentHTML("afterbegin", iconSVG(node.getAttribute("data-icon"), node.getAttribute("data-icon-class")));
      node.removeAttribute("data-icon");
    }
  }

  /* --- Smaahjaelpere ------------------------------------------------------ */

  function esc(value) {
    return String(value == null ? "" : value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function qs(name) {
    var match = new RegExp("[?&]" + name + "=([^&]*)").exec(window.location.search);
    return match ? decodeURIComponent(match[1].replace(/\+/g, " ")) : "";
  }

  function reduceMotion() {
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }

  /* --- Butiksidentitet ud i markupen -------------------------------------- */

  function applyShopIdentity() {
    var cfg = window.Shop.config;

    document.querySelectorAll("[data-shop-name]").forEach(function (el) { el.textContent = cfg.name; });
    document.querySelectorAll("[data-shop-year]").forEach(function (el) { el.textContent = String(new Date().getFullYear()); });

    document.querySelectorAll("[data-shop-telegram]").forEach(function (el) {
      el.setAttribute("href", "https://t.me/" + encodeURIComponent(cfg.telegram.replace(/^@/, "")));
    });
    document.querySelectorAll("[data-shop-telegram-handle]").forEach(function (el) {
      el.textContent = cfg.telegram;
    });
  }

  /* --- Header og mobilnavigation ------------------------------------------ */

  function initHeader() {
    var header = document.querySelector(".site-header");
    if (!header) return;

    var bar = header.querySelector(".header-bar");

    function syncHeight() {
      var h = Math.round(bar.getBoundingClientRect().height);
      document.documentElement.style.setProperty("--header-h", h + "px");
    }

    function syncStuck() {
      header.classList.toggle("is-stuck", window.scrollY > 8);
    }

    syncHeight();
    syncStuck();
    window.addEventListener("scroll", syncStuck, { passive: true });
    window.addEventListener("resize", syncHeight);
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(syncHeight);
  }

  function initMobileNav() {
    var toggle = document.querySelector("[data-nav-toggle]");
    var panel = document.querySelector("[data-mobile-nav]");
    if (!toggle || !panel) return;

    function setOpen(open) {
      panel.classList.toggle("is-open", open);
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
      toggle.innerHTML = "";
      toggle.insertAdjacentHTML("afterbegin", iconSVG(open ? "x" : "menu"));
    }

    toggle.addEventListener("click", function () {
      setOpen(panel.classList.contains("is-open") === false);
    });

    panel.addEventListener("click", function (event) {
      if (event.target.closest("a")) setOpen(false);
    });

    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape" && panel.classList.contains("is-open")) setOpen(false);
    });

    window.matchMedia("(min-width: 1081px)").addEventListener("change", function (event) {
      if (event.matches) setOpen(false);
    });
  }

  /* --- Scroll-reveal ------------------------------------------------------ */

  var revealObserver = null;

  function initReveal(root) {
    var scope = root || document;
    var nodes = scope.querySelectorAll("[data-reveal]");
    if (!nodes.length) return;

    if (!("IntersectionObserver" in window) || reduceMotion()) {
      nodes.forEach(function (el) { el.classList.add("is-in"); });
      return;
    }

    if (!revealObserver) revealObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-in");
          revealObserver.unobserve(entry.target);
        }
      });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.06 });

    nodes.forEach(function (el) { revealObserver.observe(el); });
  }

  /* --- Produktkort -------------------------------------------------------- */

  var LAYOUTS = ["half", "half", "third", "third", "third", "full"];

  function cardHTML(product, layout) {
    var price = (product.priceFrom ? "fra " : "") + window.Shop.formatPrice(product.price, product.currency);

    return (
      '<a class="pcard pcard--' + layout + '" href="product.html?id=' + encodeURIComponent(product.id) + '" data-reveal>' +
        '<span class="pcard-media">' +
          '<img src="' + esc(product.images[0]) + '" alt="' + esc(product.name) + '" width="1448" height="1086" loading="lazy" decoding="async">' +
        "</span>" +
        '<span class="pcard-body">' +
          '<span class="pcard-meta">' +
            '<span class="pcard-name">' + esc(product.name) + "</span>" +
            '<span class="pcard-price">' + esc(price) + "</span>" +
          "</span>" +
          '<span class="category-tag">' + esc(product.category) + "</span>" +
          '<span class="pcard-desc body-sm">' + esc(product.tagline) + "</span>" +
        "</span>" +
      "</a>"
    );
  }

  function renderProductGrids() {
    var mounts = document.querySelectorAll("[data-products]");
    var categoryFilter = document.querySelector("[data-category-filter]");
    var countNode = document.querySelector("[data-product-count]");

    if (categoryFilter) {
      var categories = {};
      var allProducts = window.Shop.all();
      allProducts.forEach(function (product) {
        if (product.category) categories[product.category] = true;
      });
      Object.keys(categories).sort().forEach(function (category) {
        categoryFilter.insertAdjacentHTML("beforeend", '<option value="' + esc(category) + '">' + esc(category) + "</option>");
      });
    }

    function renderMount(mount) {
      var limit = parseInt(mount.getAttribute("data-limit"), 10);
      var list = mount.getAttribute("data-product-source") === "all"
        ? window.Shop.all()
        : (isNaN(limit) ? window.Shop.featured() : window.Shop.featured(limit));
      var category = mount.getAttribute("data-product-source") === "all" && categoryFilter
        ? categoryFilter.value
        : "all";

      if (category !== "all") {
        list = list.filter(function (product) { return product.category === category; });
      }
      if (countNode && mount.getAttribute("data-product-source") === "all") {
        countNode.textContent = list.length + (list.length === 1 ? " produkt" : " produkter");
      }
      if (revealObserver) {
        mount.querySelectorAll("[data-reveal]").forEach(function (el) { revealObserver.unobserve(el); });
      }
      mount.innerHTML = list.length
        ? list.map(function (product, index) {
            return cardHTML(product, LAYOUTS[index % LAYOUTS.length]);
          }).join("")
        : '<p class="catalog-empty">Ingen produkter i denne kategori endnu.</p>';
    }

    for (var i = 0; i < mounts.length; i++) {
      renderMount(mounts[i]);
    }
    if (categoryFilter) {
      categoryFilter.addEventListener("change", function () {
        for (var j = 0; j < mounts.length; j++) {
          renderMount(mounts[j]);
          initReveal(mounts[j]);
        }
      });
    }
  }

  function renderLatest(selector, limit) {
    var mount = document.querySelector(selector);
    if (!mount) return;

    var list = window.Shop.latest(limit || 3);
    mount.innerHTML = list.map(function (product) {
      var ready = product.latest.state === "ready";
      return (
        "<li><a class=\"latest-item\" href=\"product.html?id=" + encodeURIComponent(product.id) + "\" data-reveal>" +
          '<span class="latest-thumb"><img src="' + esc(product.images[0]) + '" alt="" width="200" height="200" loading="lazy" decoding="async"></span>' +
          '<span class="latest-name">' + esc(product.name) + "</span>" +
          '<span class="latest-note">' + esc(product.latest.note) + "</span>" +
          '<span class="latest-status" data-state="' + esc(product.latest.state) + '">' +
            (ready ? "Klar" : "På vej") +
          "</span>" +
        "</a></li>"
      );
    }).join("");
  }

  /* --- Accordion (FAQ) ---------------------------------------------------- */

  function initAccordions() {
    var triggers = document.querySelectorAll(".acc-trigger");
    for (var i = 0; i < triggers.length; i++) {
      (function (trigger) {
        trigger.addEventListener("click", function () {
          var item = trigger.closest(".acc-item");
          var open = !item.classList.contains("is-open");
          item.classList.toggle("is-open", open);
          trigger.setAttribute("aria-expanded", open ? "true" : "false");
        });
      })(triggers[i]);
    }
  }

  /* --- Produktside -------------------------------------------------------- */

  function initProductPage() {
    var root = document.querySelector("[data-product-page]");
    if (!root) return;

    var product = window.Shop.byId(qs("id")) || window.Shop.all()[0];
    if (!product) return;

    var state = {
      color: ((product.colors || [])[0] || {}).name || "",
      size: ((product.sizes || [])[0] || {}).name || "",
      imageIndex: 0
    };

    document.title = product.name + " · " + window.Shop.config.name;

    /* Tekst */
    root.querySelector("[data-p-name]").textContent = product.name;
    root.querySelector("[data-p-description]").textContent = product.description;
    var categoryNode = root.querySelector("[data-p-category]");
    if (categoryNode) categoryNode.textContent = product.category || "";

    var crumb = root.querySelector("[data-p-crumb]");
    if (crumb) crumb.textContent = product.name;

    /* Pris */
    var priceNode = root.querySelector("[data-p-price]");
    function paintPrice() {
      priceNode.textContent = window.Shop.formatPrice(
        window.Shop.priceForSize(product, state.size),
        product.currency
      );
    }

    /* Galleri */
    var mainImage = root.querySelector("[data-gallery-main]");
    var thumbs = root.querySelector("[data-gallery-thumbs]");

    function paintGallery() {
      var src = product.images[state.imageIndex] || product.images[0];
      mainImage.src = src;
      mainImage.alt = product.name + ", visning " + (state.imageIndex + 1);
      var buttons = thumbs.querySelectorAll(".gallery-thumb");
      for (var i = 0; i < buttons.length; i++) {
        buttons[i].setAttribute("aria-current", i === state.imageIndex ? "true" : "false");
      }
    }

    if (product.images.length > 1) {
      thumbs.innerHTML = product.images.map(function (src, index) {
        return (
          '<button class="gallery-thumb" type="button" data-index="' + index + '" aria-current="false" ' +
            'aria-label="Vis billede ' + (index + 1) + '">' +
            '<img src="' + esc(src) + '" alt="" loading="lazy" decoding="async">' +
          "</button>"
        );
      }).join("");
      thumbs.querySelectorAll(".gallery-thumb").forEach(function (button) {
        button.addEventListener("click", function () {
          state.imageIndex = parseInt(button.getAttribute("data-index"), 10) || 0;
          paintGallery();
        });
      });
    } else {
      thumbs.hidden = true;
    }
    paintGallery();

    /* Lysboks */
    var lightbox = root.querySelector("[data-lightbox]");
    var lightboxImage = root.querySelector("[data-lightbox-image]");
    var lightboxOpen = root.querySelector("[data-lightbox-open]");

    function openLightbox() {
      if (!lightbox || typeof lightbox.showModal !== "function") return;
      lightboxImage.src = product.images[state.imageIndex];
      lightboxImage.alt = product.name;
      lightbox.showModal();
    }

    function stepLightbox(delta) {
      var total = product.images.length;
      state.imageIndex = (state.imageIndex + delta + total) % total;
      paintGallery();
      lightboxImage.src = product.images[state.imageIndex];
    }

    if (lightboxOpen) lightboxOpen.addEventListener("click", openLightbox);
    if (lightbox) {
      lightbox.querySelector("[data-lightbox-close]").addEventListener("click", function () { lightbox.close(); });
      var prev = lightbox.querySelector("[data-lightbox-prev]");
      var next = lightbox.querySelector("[data-lightbox-next]");
      if (prev) prev.addEventListener("click", function () { stepLightbox(-1); });
      if (next) next.addEventListener("click", function () { stepLightbox(1); });
      lightbox.addEventListener("keydown", function (event) {
        if (event.key === "ArrowLeft") stepLightbox(-1);
        if (event.key === "ArrowRight") stepLightbox(1);
      });
    }

    /* Farver */
    var colorMount = root.querySelector("[data-p-colors]");
    var colorGroup = root.querySelector("[data-p-colors-group]");
    if (product.colors && product.colors.length) {
      colorMount.innerHTML = product.colors.map(function (color) {
        return (
          '<button class="color-chip" type="button" data-color="' + esc(color.name) + '" ' +
            'aria-pressed="' + (color.name === state.color ? "true" : "false") + '">' +
            '<i style="background:' + esc(color.hex) + '"></i>' + esc(color.name) +
          "</button>"
        );
      }).join("");
      colorMount.querySelectorAll(".color-chip").forEach(function (button) {
        button.addEventListener("click", function () {
          state.color = button.getAttribute("data-color");
          colorMount.querySelectorAll(".color-chip").forEach(function (other) {
            other.setAttribute("aria-pressed", other === button ? "true" : "false");
          });
        });
      });
    } else {
      colorGroup.hidden = true;
    }

    /* Størrelser */
    var sizeMount = root.querySelector("[data-p-sizes]");
    var sizeGroup = root.querySelector("[data-p-sizes-group]");
    if (product.sizes && product.sizes.length > 1) {
      sizeMount.innerHTML = product.sizes.map(function (size) {
        return (
          '<button class="size-chip" type="button" data-size="' + esc(size.name) + '" ' +
            'aria-pressed="' + (size.name === state.size ? "true" : "false") + '">' + esc(size.name) + "</button>"
        );
      }).join("");
      sizeMount.querySelectorAll(".size-chip").forEach(function (button) {
        button.addEventListener("click", function () {
          state.size = button.getAttribute("data-size");
          sizeMount.querySelectorAll(".size-chip").forEach(function (other) {
            other.setAttribute("aria-pressed", other === button ? "true" : "false");
          });
          paintPrice();
        });
      });
    } else {
      sizeGroup.hidden = true;
    }
    paintPrice();

    /* Relaterede produkter */
    var relatedMount = root.querySelector("[data-related]");
    if (relatedMount) {
      relatedMount.innerHTML = window.Shop.related(product.id, 3).map(function (item) {
        return cardHTML(item, "third");
      }).join("");
    }
  }

  /* --- Start -------------------------------------------------------------- */

  function init() {
    hydrateIcons();
    applyShopIdentity();

    initHeader();
    initMobileNav();

    /* Indhold foer reveal, saa nye kort ogsaa animerer ind. */
    renderProductGrids();
    initProductPage();
    initAccordions();
    initReveal();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
