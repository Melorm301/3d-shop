/* Browser-local cart and Telegram order handoff for the static GitHub Pages site. */
(function () {
  "use strict";

  var STORAGE_KEY = "nordform.cart.v1";
  var items = [];

  function load() {
    try {
      var saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
      items = Array.isArray(saved) ? saved.filter(function (item) {
        return item && window.Shop.byId(item.id) && Number.isInteger(item.qty) && item.qty > 0;
      }).map(function (item) {
        var product = window.Shop.byId(item.id);
        return { id: product.id, qty: Math.min(item.qty, 99) };
      }) : [];
    } catch (error) {
      items = [];
    }
    save();
  }

  function save() {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(items)); } catch (error) {}
    renderBadge();
    renderPage();
  }

  function productFor(item) {
    return window.Shop.byId(item.id);
  }

  function totalCount() {
    return items.reduce(function (sum, item) { return sum + item.qty; }, 0);
  }

  function subtotal() {
    return items.reduce(function (sum, item) {
      return sum + productFor(item).price * item.qty;
    }, 0);
  }

  function escapeHTML(value) {
    return String(value).replace(/[&<>"']/g, function (char) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;", "'": "&#39;" }[char];
    });
  }

  function renderBadge() {
    document.querySelectorAll("[data-cart-count]").forEach(function (node) {
      node.textContent = String(totalCount());
      node.hidden = totalCount() === 0;
    });
  }

  function rowHTML(item) {
    var product = productFor(item);
    return '<article class="cart-row">' +
      '<a class="cart-thumb" href="product.html?id=' + encodeURIComponent(product.id) + '"><img src="' + escapeHTML(product.images[0]) + '" alt="" width="160" height="120"></a>' +
      '<div class="cart-item-main"><a class="cart-item-name" href="product.html?id=' + encodeURIComponent(product.id) + '">' + escapeHTML(product.name) + '</a>' +
      '<span class="body-sm">' + window.Shop.formatPrice(product.price, product.currency) + ' pr. stk.</span></div>' +
      '<div class="cart-quantity" aria-label="Antal af ' + escapeHTML(product.name) + '">' +
      '<button type="button" data-cart-action="decrease" data-product-id="' + escapeHTML(product.id) + '" aria-label="Fjern én">−</button>' +
      '<span>' + item.qty + '</span>' +
      '<button type="button" data-cart-action="increase" data-product-id="' + escapeHTML(product.id) + '" aria-label="Tilføj én">+</button></div>' +
      '<strong class="cart-line-price">' + window.Shop.formatPrice(product.price * item.qty, product.currency) + '</strong>' +
      '<button class="cart-remove" type="button" data-cart-action="remove" data-product-id="' + escapeHTML(product.id) + '">Fjern</button></article>';
  }

  function setTelegramOrderLink(node) {
    if (!node) return;
    var cfg = window.Shop.config;
    var handle = cfg.telegram.replace(/^@/, "");
    var lines = ["Hej NordForm, jeg vil gerne bestille:"];
    items.forEach(function (item) {
      var product = productFor(item);
      lines.push("- " + product.name + " x " + item.qty + " (" + window.Shop.formatPrice(product.price * item.qty, product.currency) + ")");
    });
    lines.push("Varetotal: " + window.Shop.formatPrice(subtotal(), cfg.currency));
    lines.push("Vil I bekræfte lagerstatus, fragt og samlet pris?");
    node.href = "https://t.me/" + encodeURIComponent(handle) + "?text=" + encodeURIComponent(lines.join("\n"));
  }

  function renderPage() {
    var cartMount = document.querySelector("[data-cart-page]");
    var checkoutMount = document.querySelector("[data-checkout-page]");
    if (!cartMount && !checkoutMount) return;

    var empty = !items.length;
    var rows = items.map(rowHTML).join("");
    var total = window.Shop.formatPrice(subtotal(), window.Shop.config.currency);

    if (cartMount) {
      cartMount.innerHTML = empty
        ? '<div class="cart-empty"><p class="h3">Din kurv er tom</p><p class="body mt-md">Find noget, du vil have med.</p><a class="btn btn-primary mt-md" href="shop.html">Gå til shoppen</a></div>'
        : '<div class="cart-layout"><div class="cart-items">' + rows + '</div><aside class="cart-summary"><p class="eyebrow">Ordreoversigt</p><div class="cart-total"><span>Varetotal</span><strong>' + total + '</strong></div><p class="body-sm">Fragt og endelig total bekræftes på Telegram, før ordren aftales.</p><a class="btn btn-primary btn-block mt-md" href="checkout.html">Fortsæt til checkout</a><a class="link-quiet mt-md" href="shop.html">Fortsæt med at shoppe</a></aside></div>';
    }

    if (checkoutMount) {
      checkoutMount.innerHTML = empty
        ? '<div class="cart-empty"><p class="h3">Der er ingen varer at gå til checkout med</p><a class="btn btn-primary mt-md" href="shop.html">Gå til shoppen</a></div>'
        : '<div class="cart-layout"><div class="cart-items">' + rows + '</div><aside class="cart-summary"><p class="eyebrow">Gennemse din ordre</p><div class="cart-total"><span>Varetotal</span><strong>' + total + '</strong></div><p class="body-sm">Dette sender ikke en betaling. Telegram åbnes med din ordre som kladde. Beskeden sendes først, når du selv trykker Send. Lagerstatus, fragt og betaling aftales direkte bagefter.</p><a class="btn btn-primary btn-block mt-md" data-telegram-order target="_blank" rel="noopener noreferrer">Fortsæt til Telegram</a><a class="link-quiet mt-md" href="cart.html">Tilbage til kurven</a></aside></div>';
      setTelegramOrderLink(checkoutMount.querySelector("[data-telegram-order]"));
    }
  }

  function add(id, qty) {
    var product = window.Shop.byId(id);
    if (!product) return false;
    var item = items.find(function (entry) { return entry.id === id; });
    if (item) item.qty = Math.min(99, item.qty + (qty || 1));
    else items.push({ id: id, qty: Math.min(99, qty || 1) });
    save();
    return true;
  }

  document.addEventListener("click", function (event) {
    var addButton = event.target.closest("[data-add-product]");
    if (addButton) {
      add(addButton.getAttribute("data-add-product"), 1);
      var original = addButton.textContent;
      addButton.textContent = "Lagt i kurv";
      window.setTimeout(function () { addButton.textContent = original; }, 1200);
      return;
    }

    var actionButton = event.target.closest("[data-cart-action]");
    if (!actionButton) return;
    var id = actionButton.getAttribute("data-product-id");
    var item = items.find(function (entry) { return entry.id === id; });
    if (!item) return;
    var action = actionButton.getAttribute("data-cart-action");
    if (action === "remove" || (action === "decrease" && item.qty <= 1)) {
      items = items.filter(function (entry) { return entry.id !== id; });
    } else if (action === "decrease") item.qty -= 1;
    else if (action === "increase") item.qty = Math.min(99, item.qty + 1);
    save();
  });

  window.Cart = { add: add, count: totalCount, subtotal: subtotal, items: function () { return items.slice(); } };

  function init() {
    load();
    renderBadge();
    renderPage();
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
