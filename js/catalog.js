/* Product discovery, rendered from the existing Shop data. */
(function () {
  'use strict';
  var ui = window.NordFormUI;
  function collection(product) {
    if (/case/.test(product.id)) return 'cases';
    if (/station/.test(product.id)) return 'stations';
    return 'holders';
  }
  function cardHTML(product) {
    var price = (product.priceFrom ? 'fra ' : '') + window.Shop.formatPrice(product.price, product.currency);
    var colors = product.colors || [];
    var swatches = colors.length ? '<span class="pcard-swatches" aria-label="Tilgængelige farver: ' + ui.esc(colors.map(function (color) { return color.name; }).join(', ')) + '">' + colors.map(function (color) { return '<i style="background:' + ui.esc(color.hex) + '" aria-hidden="true"></i>'; }).join('') + '</span>' : '';
    return '<article class="pcard"><a class="pcard-link" href="product.html?id=' + encodeURIComponent(product.id) + '">' +
      '<span class="pcard-media">' + ui.imageHTML(product.images[0], product.name) +
      (product.images[1] ? '<img class="pcard-secondary"' + ui.imageAttributes(product.images[1]) + ' alt="" aria-hidden="true">' : '') +
      '<span class="pcard-image-count" aria-hidden="true">' + String(product.images.length).padStart(2, '0') + ' / Billeder</span></span>' +
      '<span class="pcard-body"><span class="pcard-meta"><span class="pcard-name">' + ui.esc(product.name) + '</span><span class="pcard-price">' + ui.esc(price) + '</span></span>' +
      '<span class="category-tag">' + ui.esc(product.category) + '</span><span class="pcard-desc body-sm">' + ui.esc(product.tagline) + '</span>' + swatches + '</span></a>' +
      (colors.length > 1 || (product.sizes || []).length > 1
        ? '<a class="btn btn-sm pcard-add" href="product.html?id=' + encodeURIComponent(product.id) + '">Vælg variant <span class="arrow" aria-hidden="true">↗</span></a>'
        : '<button class="btn btn-sm pcard-add" type="button" data-add-product="' + ui.esc(product.id) + '" aria-label="Læg ' + ui.esc(product.name) + ' i kurv">Læg i kurv <span class="arrow" aria-hidden="true">+</span></button>') + '</article>';
  }
  function init() {
    var mounts = document.querySelectorAll('[data-products]');
    var category = document.querySelector('[data-category-filter]');
    var search = document.querySelector('[data-product-search]');
    var sort = document.querySelector('[data-product-sort]');
    var count = document.querySelector('[data-product-count]');
    var buttons = document.querySelectorAll('[data-collection]');
    var active = new URLSearchParams(window.location.search).get('collection') || 'all';
    if (['all', 'cases', 'holders', 'stations'].indexOf(active) === -1) active = 'all';
    if (category) {
      var categories = Array.from(new Set(window.Shop.all().map(function (product) { return product.category; }).filter(Boolean))).sort();
      categories.forEach(function (value) { category.insertAdjacentHTML('beforeend', '<option value="' + ui.esc(value) + '">' + ui.esc(value) + '</option>'); });
    }
    function render() {
      buttons.forEach(function (button) { button.setAttribute('aria-pressed', String(button.dataset.collection === active)); });
      mounts.forEach(function (mount) {
        var all = mount.dataset.productSource === 'all';
        var list = all ? window.Shop.all() : window.Shop.featured(Number(mount.dataset.limit) || undefined);
        if (all) {
          list = list.filter(function (product) {
            var query = search ? search.value.trim().toLocaleLowerCase('da') : '';
            return (active === 'all' || collection(product) === active) &&
              (!category || category.value === 'all' || product.category === category.value) &&
              (!query || (product.name + ' ' + product.tagline + ' ' + product.category).toLocaleLowerCase('da').indexOf(query) !== -1);
          });
          list.sort(function (a, b) {
            var order = sort ? sort.value : 'featured';
            if (order === 'price-low') return a.price - b.price;
            if (order === 'price-high') return b.price - a.price;
            if (order === 'name') return a.name.localeCompare(b.name, 'da');
            return (b.featured ? 1 : 0) - (a.featured ? 1 : 0) || (a.featuredRank || 99) - (b.featuredRank || 99);
          });
          if (count) count.textContent = list.length + (list.length === 1 ? ' objekt' : ' objekter');
        }
        mount.innerHTML = list.length ? list.map(cardHTML).join('') : '<div class="catalog-empty"><h2 class="h3">Vi fandt ikke den form.</h2><p class="body mt-md">Prøv en anden søgning, eller se hele udvalget.</p><button class="btn btn-primary" type="button" data-reset-filters>Vis alle objekter ↗</button></div>';
      });
    }
    [category, sort].filter(Boolean).forEach(function (control) { control.addEventListener('change', render); });
    if (search) search.addEventListener('input', render);
    buttons.forEach(function (button) {
      button.addEventListener('click', function () {
        active = button.dataset.collection;
        var url = new URL(window.location.href);
        if (active === 'all') url.searchParams.delete('collection');
        else url.searchParams.set('collection', active);
        window.history.replaceState(null, '', url.href);
        render();
      });
    });
    document.addEventListener('click', function (event) {
      if (!event.target.closest('[data-reset-filters]')) return;
      active = 'all';
      if (search) search.value = '';
      if (category) category.value = 'all';
      if (sort) sort.value = 'featured';
      var url = new URL(window.location.href); url.searchParams.delete('collection'); window.history.replaceState(null, '', url.href);
      render();
      if (search) search.focus();
    });
    render();
  }
  window.NordFormCatalog = { init: init, cardHTML: cardHTML };
})();
