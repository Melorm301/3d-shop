/* Shared identity, navigation and small enhancements. No external requests. */
(function () {
  'use strict';
  var ui = window.NordFormUI;
  function initIdentity() {
    var config = window.Shop.config;
    document.querySelectorAll('[data-shop-name]').forEach(function (node) { node.textContent = config.name; });
    document.querySelectorAll('[data-shop-cvr]').forEach(function (node) { node.textContent = config.cvr; });
    document.querySelectorAll('[data-shop-year]').forEach(function (node) { node.textContent = String(new Date().getFullYear()); });
    document.querySelectorAll('[data-shop-telegram]').forEach(function (node) { node.href = 'https://t.me/' + encodeURIComponent(config.telegram.replace(/^@/, '')); });
    document.querySelectorAll('[data-shop-telegram-handle]').forEach(function (node) { node.textContent = config.telegram; });
  }
  function initNavigation() {
    var header = document.querySelector('.site-header');
    var bar = header.querySelector('.header-bar');
    var toggle = document.querySelector('[data-nav-toggle]');
    var menu = document.querySelector('[data-mobile-nav]');
    function syncHeader() {
      document.documentElement.style.setProperty('--header-h', Math.round(bar.getBoundingClientRect().height) + 'px');
      header.classList.toggle('is-stuck', window.scrollY > 8);
    }
    syncHeader();
    window.addEventListener('scroll', function () { header.classList.toggle('is-stuck', window.scrollY > 8); }, { passive: true });
    window.addEventListener('resize', syncHeader);
    toggle.addEventListener('click', function () { ui.openDialog(menu); toggle.setAttribute('aria-expanded', 'true'); });
    menu.querySelector('[data-nav-close]').addEventListener('click', function () { menu.close(); });
    menu.addEventListener('close', function () { toggle.setAttribute('aria-expanded', 'false'); });
    menu.addEventListener('click', function (event) { if (event.target.closest('a')) menu.close(); });
    window.matchMedia('(min-width: 768px)').addEventListener('change', function (event) { if (event.matches && menu.open) menu.close(); });
  }
  function initAccordions() {
    document.querySelectorAll('.acc-trigger').forEach(function (trigger) {
      var panel = document.getElementById(trigger.getAttribute('aria-controls'));
      if (panel) { panel.inert = true; panel.setAttribute('aria-hidden', 'true'); }
      trigger.addEventListener('click', function () {
        var open = trigger.getAttribute('aria-expanded') !== 'true';
        trigger.setAttribute('aria-expanded', String(open));
        trigger.closest('.acc-item').classList.toggle('is-open', open);
        if (panel) { panel.inert = !open; panel.setAttribute('aria-hidden', String(!open)); }
      });
    });
  }
  function initCustomForm() {
    var form = document.querySelector('[data-custom-form]');
    if (!form) return;
    var success = form.querySelector('[data-custom-success]');
    form.addEventListener('input', function () { success.hidden = true; form.elements.idea.setCustomValidity(''); });
    form.addEventListener('submit', function (event) {
      event.preventDefault();
      var idea = form.elements.idea;
      idea.setCustomValidity(idea.value.trim().length < 5 ? 'Beskriv gerne din idé med mindst fem tegn.' : '');
      if (!form.reportValidity()) return;
      var fields = new FormData(form);
      var lines = ['Hej NordForm,'];
      if (String(fields.get('name')).trim()) lines.push('Mit navn er ' + String(fields.get('name')).trim() + '.');
      lines.push(String(fields.get('idea')).trim());
      if (String(fields.get('dimensions')).trim()) lines.push('Cirka mål: ' + String(fields.get('dimensions')).trim());
      lines.push('Antal: ' + fields.get('quantity'));
      lines.push('Vil I se på mulighederne og bekræfte pris og forventet tid?');
      form.querySelector('[data-custom-link]').href = 'https://t.me/' + encodeURIComponent(window.Shop.config.telegram.replace(/^@/, '')) + '?text=' + encodeURIComponent(lines.join('\n'));
      success.hidden = false; success.focus({ preventScroll: true }); success.scrollIntoView({ behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth', block: 'nearest' });
    });
  }
  function initLayerReveal() {
    if (!('IntersectionObserver' in window)) return;
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) { if (entry.isIntersecting) { entry.target.classList.add('is-in'); observer.unobserve(entry.target); } });
    }, { threshold: .2 });
    document.querySelectorAll('[data-reveal]').forEach(function (node) { observer.observe(node); });
  }
  function init() {
    ui.hydrate(); initIdentity(); initNavigation();
    var heroPrice = document.querySelector('[data-hero-price]');
    var heroProduct = window.Shop.byId('pen-holder-round-9');
    if (heroPrice && heroProduct) heroPrice.textContent = window.Shop.formatPrice(heroProduct.price, heroProduct.currency);
    window.NordFormCatalog.init(); window.NordFormProduct.init();
    initAccordions(); initCustomForm(); initLayerReveal();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
