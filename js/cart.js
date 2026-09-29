/* ==========================================================================
   cart.js - kurv med localStorage
   --------------------------------------------------------------------------
   Kurven gemmer sig i browseren og overlever refresh. Alt hvad der står her
   er til VISNING. Ved rigtig betaling skal serveren selv slaa prisen op ud
   fra productId + variant, se handleCheckout() nederst.
   ========================================================================== */

window.Cart = (function () {
  "use strict";

  var STORAGE_KEY = "layerlab.cart.v1";
  var items = [];
  var listeners = [];

  /* --- Lager ------------------------------------------------------------- */

  function load() {
    try {
      var raw = window.localStorage.getItem(STORAGE_KEY);
      var parsed = raw ? JSON.parse(raw) : [];
      items = Array.isArray(parsed) ? parsed : [];
    } catch (err) {
      /* Privat browsing eller slukket storage: kurven lever kun i hukommelsen. */
      items = [];
    }
    return items;
  }

  function save() {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch (err) {
      /* Ignoreres bevidst, se load(). */
    }
    emit();
  }

  function emit() {
    for (var i = 0; i < listeners.length; i++) {
      listeners[i](snapshot());
    }
  }

  /* --- Hjaelpere --------------------------------------------------------- */

  function makeKey(id, color, size) {
    return [id, color || "", size || ""].join("::");
  }

  function findIndex(key) {
    for (var i = 0; i < items.length; i++) {
      if (items[i].key === key) return i;
    }
    return -1;
  }

  function count() {
    return items.reduce(function (sum, item) { return sum + item.qty; }, 0);
  }

  function subtotal() {
    return items.reduce(function (sum, item) { return sum + (item.price * item.qty); }, 0);
  }

  function snapshot() {
    return {
      items: items.slice(),
      count: count(),
      subtotal: subtotal()
    };
  }

  /* --- Handlinger -------------------------------------------------------- */

  /* item: { id, name, price, currency, color, size, qty, image } */
  function add(item) {
    var key = makeKey(item.id, item.color, item.size);
    var index = findIndex(key);

    if (index > -1) {
      items[index].qty += item.qty || 1;
    } else {
      items.push({
        key: key,
        id: item.id,
        name: item.name,
        price: item.price,
        currency: item.currency || "DKK",
        color: item.color || "",
        size: item.size || "",
        qty: item.qty || 1,
        image: item.image || ""
      });
    }
    save();
    return snapshot();
  }

  function setQty(key, qty) {
    var index = findIndex(key);
    if (index < 0) return snapshot();
    var next = Math.max(1, Math.min(99, Math.round(Number(qty) || 1)));
    items[index].qty = next;
    save();
    return snapshot();
  }

  function increment(key, delta) {
    var index = findIndex(key);
    if (index < 0) return snapshot();
    return setQty(key, items[index].qty + (delta || 1));
  }

  function remove(key) {
    var index = findIndex(key);
    if (index > -1) items.splice(index, 1);
    save();
    return snapshot();
  }

  function clear() {
    items = [];
    save();
    return snapshot();
  }

  function onChange(fn) {
    if (typeof fn === "function") listeners.push(fn);
  }

  /* --- Header-badge ------------------------------------------------------ */

  function renderBadge(state) {
    var data = state || snapshot();
    var nodes = document.querySelectorAll("[data-cart-count]");
    for (var i = 0; i < nodes.length; i++) {
      var node = nodes[i];
      node.textContent = String(data.count);
      node.hidden = data.count === 0;
    }
  }

  function bumpBadge() {
    var nodes = document.querySelectorAll("[data-cart-count]");
    for (var i = 0; i < nodes.length; i++) {
      (function (node) {
        node.classList.add("is-bumping");
        window.setTimeout(function () { node.classList.remove("is-bumping"); }, 320);
      })(nodes[i]);
    }
  }

  /* --- Betaling ----------------------------------------------------------
     Her kobles Stripe paa senere. Funktionen sender KUN id, variant og antal.
     Serveren (Cloudflare Worker) skal:
       1. slaa den rigtige pris op i sin egen produktliste,
       2. oprette en Stripe Checkout Session med line_items,
       3. returnere { url } som vi videresender til.
     Klientens priser nedenfor er alene til visning og maa ikke bruges til
     at beregne det beloeb der betales.                                      */

  function checkoutPayload() {
    return {
      items: items.map(function (item) {
        return {
          id: item.id,
          color: item.color,
          size: item.size,
          qty: item.qty
        };
      })
    };
  }

  function handleCheckout(onError) {
    if (!items.length) {
      if (onError) onError("Kurven er tom.");
      return;
    }

    /* Aabnet direkte fra filsystemet findes der ingen server at sporge.
       Vi springer kaldet over, saa konsollen holdes ren under lokal visning. */
    if (window.location.protocol === "file:") {
      if (onError) onError("siden er åbnet direkte fra filsystemet, så der er ingen server at sende til endnu");
      return;
    }

    fetch("/api/create-checkout-session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(checkoutPayload())
    })
      .then(function (res) {
        if (!res.ok) throw new Error("HTTP " + res.status);
        return res.json();
      })
      .then(function (data) {
        if (data && data.url) {
          window.location.href = data.url;
          return;
        }
        throw new Error("Intet checkout-url i svaret.");
      })
      .catch(function (err) {
        if (onError) onError(err.message);
      });
  }

  return {
    init: load,
    all: function () { return items.slice(); },
    count: count,
    subtotal: subtotal,
    snapshot: snapshot,
    add: add,
    setQty: setQty,
    increment: increment,
    remove: remove,
    clear: clear,
    onChange: onChange,
    renderBadge: renderBadge,
    bumpBadge: bumpBadge,
    handleCheckout: handleCheckout,
    checkoutPayload: checkoutPayload,
    makeKey: makeKey
  };
})();
