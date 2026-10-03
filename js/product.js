/* Gallery, genuine product variants and responsive purchase controls. */
(function () {
  'use strict';
  var ui = window.STYKKUI;
  function init() {
    var root = document.querySelector('[data-product-page]');
    if (!root) return;
    var id = new URLSearchParams(window.location.search).get('id');
    var product = id ? window.Shop.byId(id) : window.Shop.all()[0];
    if (!product) {
      root.hidden = true;
      root.insertAdjacentHTML('beforebegin', '<section class="wrap section"><p class="eyebrow">STYKK / Produkt</p><h1 class="h2">Den form kunne vi ikke finde.</h1><p class="body mt-md">Produktet findes ikke i vores nuværende udvalg.</p><a class="btn btn-primary mt-md" href="shop.html">Se alle objekter ↗</a></section>');
      document.title = 'Produkt ikke fundet · STYKK';
      var robots = document.createElement('meta'); robots.name = 'robots'; robots.content = 'noindex,follow'; document.head.appendChild(robots);
      return;
    }
    var state = { color: ((product.colors || [])[0] || {}).name || '', size: ((product.sizes || [])[0] || {}).name || '', imageIndex: 0 };
    document.title = product.name + " · " + window.Shop.config.name;
    var description = (product.tagline + " Se billeder og vejledende pris hos STYKK.").slice(0, 160);
    var descriptionMeta = document.querySelector('meta[name="description"]');
    if (descriptionMeta) descriptionMeta.content = description;
    var canonical = document.querySelector('link[rel="canonical"]');
    var productUrl = "https://melorm301.github.io/3d-shop/product.html?id=" + encodeURIComponent(product.id);
    if (canonical) canonical.href = productUrl;
    var ogTitle = document.querySelector('meta[property="og:title"]');
    var ogDescription = document.querySelector('meta[property="og:description"]');
    var ogUrl = document.querySelector('meta[property="og:url"]');
    var ogImage = document.querySelector('meta[property="og:image"]');
    if (ogTitle) ogTitle.content = document.title;
    if (ogDescription) ogDescription.content = description;
    if (ogUrl) ogUrl.content = productUrl;
    if (ogImage) ogImage.content = "https://melorm301.github.io/3d-shop/" + product.images[0];
    var productSchema = document.querySelector("[data-product-schema]");
    if (productSchema) {
      productSchema.textContent = JSON.stringify({
        "@context": "https://schema.org",
        "@type": "Product",
        name: product.name,
        description: product.description,
        image: product.images.map(function (image) { return "https://melorm301.github.io/3d-shop/" + image; }),
        sku: product.sku,
        category: product.category,
        brand: { "@type": "Brand", name: window.Shop.config.name },
        ...(product.estimatedPrice ? {} : { offers: {
          "@type": "Offer",
          url: productUrl,
          priceCurrency: product.currency,
          price: (product.price / 100).toFixed(2),
          seller: { "@type": "Organization", name: window.Shop.config.name }
        } })
      });
    }
    root.querySelector('[data-p-name]').textContent = product.name;
    root.querySelector('[data-p-description]').textContent = product.tagline;
    root.querySelector('[data-p-detail]').textContent = product.description;
    root.querySelector('[data-product-enquiry]').href = 'contact.html?product=' + encodeURIComponent(product.id) + '#custom';
    root.querySelector('[data-p-category]').textContent = product.category || '';
    root.querySelector('[data-p-sku]').textContent = product.sku ? 'Objekt / ' + product.sku : '';
    document.querySelector('[data-p-crumb]').textContent = product.name;
    root.querySelector('[data-mobile-product]').textContent = product.name;
    var quantity = 1;
    function paintPrice() {
      var price = (product.estimatedPrice ? 'ca. ' : '') + window.Shop.formatPrice(window.Shop.priceForSize(product, state.size), product.currency);
      root.querySelector('[data-p-price]').textContent = price;
      root.querySelector('[data-mobile-price]').textContent = price;
    }
    function initVariants(field, entries, initial) {
      var group = root.querySelector('[data-p-' + field + '-group]');
      var mount = root.querySelector('[data-p-' + field + ']');
      if (!entries || !entries.length || (field === 'sizes' && entries.length < 2)) { group.hidden = true; return; }
      group.hidden = false;
      var property = field === 'colors' ? 'color' : 'size';
      mount.innerHTML = entries.map(function (entry) {
        return '<button type="button" class="' + property + '-chip" aria-pressed="' + (entry.name === initial) + '" data-value="' + ui.esc(entry.name) + '">' +
          (field === 'colors' ? '<i style="background:' + ui.esc(entry.hex) + '" aria-hidden="true"></i>' : '') + ui.esc(entry.name) + '</button>';
      }).join('');
      mount.querySelectorAll('button').forEach(function (button) {
        button.addEventListener('click', function () {
          state[property] = button.dataset.value;
          mount.querySelectorAll('button').forEach(function (other) { other.setAttribute('aria-pressed', String(other === button)); });
          paintPrice();
        });
      });
    }
    initVariants('colors', product.colors, state.color);
    initVariants('sizes', product.sizes, state.size);
    paintPrice();
    var image = root.querySelector('[data-gallery-main]');
    var thumbs = root.querySelector('[data-gallery-thumbs]');
    var lightbox = root.querySelector('[data-lightbox]');
    var lightboxImage = root.querySelector('[data-lightbox-image]');
    function paintGallery() {
      var src = product.images[state.imageIndex];
      var info = (window.STYKKImages || {})[src];
      if (info) {
        image.setAttribute('srcset', info.sources.map(function (source) { return source.src + ' ' + source.width + 'w'; }).join(', '));
        image.setAttribute('sizes', '(max-width: 767px) 92vw, 51vw');
        image.width = info.width; image.height = info.height;
      }
      image.src = src;
      image.alt = ((product.imageAlts || [])[state.imageIndex] || product.name) + ', billede ' + (state.imageIndex + 1) + ' af ' + product.images.length;
      thumbs.querySelectorAll('button').forEach(function (button, index) { button.setAttribute('aria-current', String(index === state.imageIndex)); });
      if (lightbox.open) { lightboxImage.src = src; lightboxImage.alt = image.alt; }
    }
    function stepGallery(delta) { state.imageIndex = (state.imageIndex + delta + product.images.length) % product.images.length; paintGallery(); }
    if (product.images.length > 1) {
      thumbs.innerHTML = product.images.map(function (src, index) { return '<button class="gallery-thumb" type="button" data-index="' + index + '" aria-label="Vis billede ' + (index + 1) + ' af ' + product.images.length + '">' + ui.imageHTML(src, '', '90px') + '</button>'; }).join('');
      thumbs.querySelectorAll('button').forEach(function (button) {
        button.addEventListener('click', function () { state.imageIndex = Number(button.dataset.index); paintGallery(); });
        button.addEventListener('keydown', function (event) {
          if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
          event.preventDefault(); stepGallery(event.key === 'ArrowRight' ? 1 : -1);
          thumbs.querySelectorAll('button')[state.imageIndex].focus();
        });
      });
      var startX = null;
      image.addEventListener('pointerdown', function (event) { if (event.pointerType === 'touch') startX = event.clientX; });
      image.addEventListener('pointerup', function (event) {
        if (startX !== null && Math.abs(event.clientX - startX) > 45) stepGallery(event.clientX < startX ? 1 : -1);
        startX = null;
      });
      image.addEventListener('pointercancel', function () { startX = null; });
    } else thumbs.hidden = true;
    paintGallery();
    root.querySelector('[data-lightbox-open]').addEventListener('click', function () {
      lightboxImage.src = product.images[state.imageIndex]; lightboxImage.alt = image.alt; ui.openDialog(lightbox);
    });
    lightbox.querySelector('[data-lightbox-close]').addEventListener('click', function () { lightbox.close(); });
    lightbox.querySelector('[data-lightbox-prev]').addEventListener('click', function () { stepGallery(-1); });
    lightbox.querySelector('[data-lightbox-next]').addEventListener('click', function () { stepGallery(1); });
    lightbox.addEventListener('keydown', function (event) {
      if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') { event.preventDefault(); stepGallery(event.key === 'ArrowRight' ? 1 : -1); }
    });
    if (product.images.length < 2) lightbox.querySelector('.lightbox-nav').hidden = true;
    var minus = root.querySelector('[data-qty-minus]');
    var plus = root.querySelector('[data-qty-plus]');
    function paintQuantity() {
      root.querySelector('[data-p-qty]').textContent = String(quantity);
      minus.disabled = quantity === 1; plus.disabled = quantity === 99;
    }
    minus.addEventListener('click', function () { quantity = Math.max(1, quantity - 1); paintQuantity(); });
    plus.addEventListener('click', function () { quantity = Math.min(99, quantity + 1); paintQuantity(); });
    paintQuantity();
    var addButton = root.querySelector('[data-add-to-cart]');
    function add() { window.Cart.add(product.id, quantity, { color: state.color, size: state.size }); }
    addButton.addEventListener('click', add);
    root.querySelector('[data-mobile-add]').addEventListener('click', add);
    var mobileBuy = root.querySelector('[data-mobile-buy]');
    if ('IntersectionObserver' in window) {
      var buyObserver = new IntersectionObserver(function (entries) {
        mobileBuy.classList.toggle('is-visible', !entries[0].isIntersecting && entries[0].boundingClientRect.top < 0);
      }, { rootMargin: '-82px 0px 0px' });
      buyObserver.observe(addButton);
    }
    var related = root.querySelector('[data-related]');
    if (related) related.innerHTML = window.Shop.related(product.id, 3).map(window.STYKKCatalog.cardHTML).join('');
  }
  window.STYKKProduct = { init: init };
})();
