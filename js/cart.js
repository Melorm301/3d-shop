/* Keep the original cart storage key and manual Telegram order handoff. */
(function () {
  'use strict';
  var STORAGE_KEY = 'nordform.cart.v1';
  var ui = window.NordFormUI;
  var items = [];
  var drawer;
  var orderNote = '';
  function normalize(item) {
    var product = item && window.Shop.byId(item.id);
    if (!product || !Number.isInteger(item.qty) || item.qty <= 0) return null;
    var colors = product.colors || [];
    var sizes = product.sizes || [];
    var color = colors.find(function (entry) { return entry.name === item.color; }) || colors[0];
    var size = sizes.find(function (entry) { return entry.name === item.size; }) || sizes[0];
    return { id: product.id, qty: Math.min(item.qty, 99), color: color ? color.name : '', size: size ? size.name : '' };
  }
  function key(item) { return JSON.stringify([item.id, item.color || '', item.size || '']); }
  function productFor(item) { return window.Shop.byId(item.id); }
  function unitPrice(item) { return window.Shop.priceForSize(productFor(item), item.size); }
  function totalCount() { return items.reduce(function (total, item) { return total + item.qty; }, 0); }
  function subtotal() { return items.reduce(function (total, item) { return total + unitPrice(item) * item.qty; }, 0); }
  function load() {
    try {
      var saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
      items = [];
      (Array.isArray(saved) ? saved : []).forEach(function (entry) {
        var item = normalize(entry);
        if (!item) return;
        var duplicate = items.find(function (existing) { return key(existing) === key(item); });
        if (duplicate) duplicate.qty = Math.min(99, duplicate.qty + item.qty);
        else items.push(item);
      });
    } catch (error) { items = []; }
    render();
  }
  function save() {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(items)); } catch (error) { /* Cart still works in memory. */ }
    render();
  }
  function rowHTML(item) {
    var product = productFor(item);
    var itemKey = ui.esc(key(item));
    var variant = [item.color, item.size].filter(Boolean).join(' / ');
    return '<article class="cart-row"><a class="cart-thumb" href="product.html?id=' + encodeURIComponent(product.id) + '" tabindex="-1">' + ui.imageHTML(product.images[0], '', '100px') + '</a>' +
      '<div class="cart-item-main"><a class="cart-item-name" href="product.html?id=' + encodeURIComponent(product.id) + '">' + ui.esc(product.name) + '</a>' +
      (variant ? '<span class="body-sm">' + ui.esc(variant) + '</span>' : '') + '<span class="body-sm">' + window.Shop.formatPrice(unitPrice(item), product.currency) + ' / stk.</span></div>' +
      '<strong class="cart-line-price">' + window.Shop.formatPrice(unitPrice(item) * item.qty, product.currency) + '</strong>' +
      '<div class="cart-quantity" role="group" aria-label="Antal af ' + ui.esc(product.name) + '">' +
      '<button type="button" data-cart-action="decrease" data-item-key="' + itemKey + '" aria-label="Fjern én ' + ui.esc(product.name) + '">−</button><span aria-live="polite">' + item.qty + '</span>' +
      '<button type="button" data-cart-action="increase" data-item-key="' + itemKey + '" aria-label="Tilføj én ' + ui.esc(product.name) + '"' + (item.qty >= 99 ? ' disabled' : '') + '>+</button></div>' +
      '<button class="cart-remove" type="button" data-cart-action="remove" data-item-key="' + itemKey + '" aria-label="Fjern ' + ui.esc(product.name) + ' fra kurven">Fjern</button></article>';
  }
  function emptyHTML() {
    return '<div class="cart-empty"><div class="cart-empty-mark" aria-hidden="true">∅</div><h2 class="h3">Plads til noget godt.</h2><p class="body mt-md">Din kurv er tom. Find en form, der passer ind i din hverdag.</p><a class="btn btn-primary mt-md" href="shop.html">Se udvalget <span class="arrow" aria-hidden="true">↗</span></a></div>';
  }
  function orderText() {
    var lines = ['Hej NordForm, jeg vil gerne bestille:'];
    items.forEach(function (item) {
      var product = productFor(item);
      var variant = [item.color, item.size].filter(Boolean).join(' / ');
      lines.push('– ' + product.name + (variant ? ' (' + variant + ')' : '') + ' × ' + item.qty + ' (' + window.Shop.formatPrice(unitPrice(item) * item.qty, product.currency) + ')');
    });
    lines.push('Varetotal: ' + window.Shop.formatPrice(subtotal()));
    if (orderNote.trim()) lines.push('Bemærkning: ' + orderNote.trim());
    lines.push('Vil I bekræfte lagerstatus, fragt og samlet pris?');
    return lines.join('\n');
  }
  function syncOrderLinks() {
    var handle = window.Shop.config.telegram.replace(/^@/, '');
    document.querySelectorAll('[data-telegram-order]').forEach(function (node) {
      node.href = 'https://t.me/' + encodeURIComponent(handle) + '?text=' + encodeURIComponent(orderText());
    });
  }
  function summaryHTML(checkout) {
    var total = window.Shop.formatPrice(subtotal());
    return '<aside class="cart-summary"><p class="eyebrow">' + (checkout ? 'Din ordreforespørgsel' : 'Det, du har valgt') + '</p>' +
      '<div class="cart-total"><span>Varetotal</span><strong>' + total + '</strong></div><div class="summary-line"><span>Fragt</span><span>Aftales</span></div><div class="summary-line"><span>Betaling</span><span>Aftales på Telegram</span></div>' +
      '<p class="body-sm mt-md">' + (checkout ? 'Telegram åbner med din ordre som kladde. Du sender selv beskeden. Lagerstatus, fragt og betaling aftales, før ordren bekræftes.' : 'Fragt og endelig total bekræftes på Telegram, før du bestiller.') + '</p>' +
      (checkout ? '<a class="btn btn-primary btn-block mt-md" data-telegram-order target="_blank" rel="noopener noreferrer">Åbn ordre i Telegram <span class="arrow" aria-hidden="true">↗</span></a><button class="order-copy mt-md" type="button" data-copy-order>Kopiér ordretekst</button><textarea class="copy-fallback" data-copy-fallback aria-label="Ordretekst til kopiering" readonly hidden></textarea><a class="link-quiet mt-md" href="cart.html">Tilbage til kurven</a>' : '<a class="btn btn-primary btn-block mt-md" href="checkout.html">Gennemse din ordre <span class="arrow" aria-hidden="true">↗</span></a><a class="link-quiet mt-md" href="shop.html">Fortsæt med at shoppe</a>') + '</aside>';
  }
  function render() {
    var focused = document.activeElement;
    var focusKey = focused && focused.dataset ? focused.dataset.itemKey : '';
    var focusAction = focused && focused.dataset ? focused.dataset.cartAction : '';
    var focusedMount = focused && focused.closest ? focused.closest('[data-cart-page], [data-checkout-page], [data-drawer-items]') : null;
    document.querySelectorAll('[data-cart-count]').forEach(function (node) {
      var changed = node.textContent !== String(totalCount());
      node.textContent = String(totalCount()); node.hidden = false;
      if (changed) { node.classList.remove('is-updated'); window.requestAnimationFrame(function () { node.classList.add('is-updated'); }); }
    });
    var rows = items.map(rowHTML).join('');
    document.querySelectorAll('[data-cart-page], [data-checkout-page]').forEach(function (mount) {
      var checkout = mount.hasAttribute('data-checkout-page');
      mount.innerHTML = !items.length ? emptyHTML() : '<div class="cart-layout"><div><div class="cart-items">' + rows + '</div>' +
        (checkout ? '<div class="field checkout-note"><label for="order-note">En bemærkning til din ordre <span>(valgfrit)</span></label><textarea id="order-note" data-order-note rows="3" maxlength="500" placeholder="Fx et spørgsmål til farve eller levering">' + ui.esc(orderNote) + '</textarea></div>' : '') + '</div>' + summaryHTML(checkout) + '</div>';
    });
    if (drawer) {
      drawer.querySelector('[data-drawer-items]').innerHTML = items.length ? '<div class="cart-items">' + rows + '</div>' : emptyHTML();
      var footer = drawer.querySelector('[data-drawer-footer]');
      footer.hidden = !items.length;
      footer.innerHTML = '<div class="cart-total"><span>Varetotal</span><strong>' + window.Shop.formatPrice(subtotal()) + '</strong></div><p class="body-sm">Fragt og betaling aftales på Telegram.</p><a class="btn btn-primary btn-block" href="checkout.html">Gennemse din ordre <span class="arrow" aria-hidden="true">↗</span></a><a class="link-quiet" href="cart.html">Se hele kurven</a>';
    }
    syncOrderLinks();
    if (focusKey && focusedMount) {
      var candidates = Array.from(focusedMount.querySelectorAll('[data-cart-action]'));
      var target = candidates.find(function (node) { return node.dataset.itemKey === focusKey && node.dataset.cartAction === focusAction && !node.disabled; }) || candidates.find(function (node) { return node.dataset.itemKey === focusKey && !node.disabled; }) || candidates[0] || focusedMount.querySelector('a');
      if (target) target.focus({ preventScroll: true });
    }
  }
  function openDrawer() {
    if (!drawer) return;
    var menu = document.querySelector('[data-mobile-nav]');
    if (menu && menu.open) menu.close();
    ui.openDialog(drawer);
  }
  function add(id, qty, variant) {
    qty = qty == null ? 1 : qty;
    if (!Number.isInteger(qty) || qty <= 0) return false;
    var item = normalize({ id: id, qty: qty, color: variant && variant.color, size: variant && variant.size });
    if (!item) return false;
    var existing = items.find(function (entry) { return key(entry) === key(item); });
    if (existing) existing.qty = Math.min(99, existing.qty + item.qty);
    else items.push(item);
    save();
    openDrawer();
    return true;
  }
  function init() {
    drawer = document.createElement('dialog');
    drawer.className = 'cart-drawer';
    drawer.setAttribute('aria-labelledby', 'drawer-title');
    drawer.innerHTML = '<div class="drawer-header"><h2 id="drawer-title">Din kurv<span class="accent-dot">.</span></h2><button class="icon-button" type="button" data-cart-close aria-label="Luk kurv" autofocus>' + ui.icon('x') + '</button></div><div class="drawer-items" data-drawer-items></div><div class="drawer-footer" data-drawer-footer></div>';
    document.body.appendChild(drawer);
    drawer.querySelector('[data-cart-close]').addEventListener('click', function () { drawer.close(); });
    load();
    window.addEventListener('storage', function (event) { if (event.key === STORAGE_KEY || event.key === null) load(); });
  }
  document.addEventListener('click', function (event) {
    var open = event.target.closest('[data-cart-open]');
    if (open && !event.ctrlKey && !event.metaKey && !event.shiftKey && event.button === 0 && drawer) { event.preventDefault(); openDrawer(); return; }
    var addButton = event.target.closest('[data-add-product]');
    if (addButton) { add(addButton.dataset.addProduct, 1); return; }
    var actionButton = event.target.closest('[data-cart-action]');
    if (actionButton) {
      var itemKey = actionButton.dataset.itemKey;
      var item = items.find(function (entry) { return key(entry) === itemKey; });
      if (!item) return;
      var action = actionButton.dataset.cartAction;
      if (action === 'remove' || (action === 'decrease' && item.qty === 1)) items = items.filter(function (entry) { return key(entry) !== itemKey; });
      else if (action === 'decrease') item.qty -= 1;
      else if (action === 'increase') item.qty = Math.min(99, item.qty + 1);
      save(); return;
    }
    var copy = event.target.closest('[data-copy-order]');
    if (copy) {
      if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(orderText()).then(function () {
        copy.textContent = 'Ordretekst kopieret';
        window.setTimeout(function () { copy.textContent = 'Kopiér ordretekst'; }, 1800);
      }).catch(showCopyFallback);
      else showCopyFallback();
    }
  });
  function showCopyFallback() {
    var field = document.querySelector('[data-copy-fallback]');
    if (field) { field.hidden = false; field.value = orderText(); field.focus(); field.select(); }
  }
  document.addEventListener('input', function (event) {
    if (event.target.matches('[data-order-note]')) { orderNote = event.target.value.slice(0, 500); syncOrderLinks(); }
  });
  window.Cart = { add: add, count: totalCount, subtotal: subtotal, items: function () { return items.map(function (item) { return Object.assign({}, item); }); }, open: openDrawer };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
