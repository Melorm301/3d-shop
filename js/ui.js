/* Shared primitives: escaping, responsive imagery and native modal behaviour. */
(function () {
  'use strict';
  var wired = new WeakSet();
  var previousFocus = new WeakMap();
  function esc(value) {
    return String(value == null ? '' : value).replace(/[&<>"']/g, function (char) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char];
    });
  }
  function icon(name) {
    var paths = {
      bag: '<path d="M5 8h14l-1 13H6L5 8Z"/><path d="M9 8a3 3 0 0 1 6 0"/>',
      x: '<path d="m6 6 12 12M18 6 6 18"/>',
      menu: '<path d="M4 8h16M4 16h16"/>',
      search: '<circle cx="10.5" cy="10.5" r="6.5"/><path d="m16 16 5 5"/>',
      maximize: '<path d="M8 3H3v5M16 3h5v5M3 16v5h5M16 21h5v-5"/>',
      chevronLeft: '<path d="m15 18-6-6 6-6"/>',
      chevronRight: '<path d="m9 18 6-6-6-6"/>',
      plus: '<path d="M5 12h14M12 5v14"/>'
    };
    return '<svg class="icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false">' + (paths[name] || '') + '</svg>';
  }
  function hydrate(root) {
    (root || document).querySelectorAll('[data-icon]').forEach(function (node) {
      node.innerHTML = icon(node.dataset.icon);
      node.removeAttribute('data-icon');
    });
  }
  function imageAttributes(src, sizes, eager) {
    var info = (window.NordFormImages || {})[src];
    var attributes = ' src="' + esc(src) + '" decoding="async"';
    if (!eager) attributes += ' loading="lazy"';
    if (info) {
      attributes += ' width="' + info.width + '" height="' + info.height + '"';
      attributes += ' srcset="' + info.sources.map(function (source) { return esc(source.src) + ' ' + source.width + 'w'; }).join(', ') + '" sizes="' + esc(sizes || '(max-width: 479px) 92vw, (max-width: 767px) 44vw, 30vw') + '"';
    }
    return attributes;
  }
  function imageHTML(src, alt, sizes) { return '<img' + imageAttributes(src, sizes) + ' alt="' + esc(alt) + '">'; }
  function openDialog(dialog) {
    if (!dialog || dialog.open) return;
    previousFocus.set(dialog, document.activeElement);
    if (!wired.has(dialog)) {
      wired.add(dialog);
      dialog.addEventListener('close', function () {
        if (!document.querySelector('dialog[open]')) document.body.classList.remove('has-modal');
        var target = previousFocus.get(dialog);
        if (target && target.isConnected && !document.querySelector('dialog[open]')) target.focus({ preventScroll: true });
      });
      dialog.addEventListener('click', function (event) {
        if (event.target !== dialog) return;
        var rect = dialog.getBoundingClientRect();
        if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) dialog.close();
      });
    }
    dialog.showModal();
    document.body.classList.add('has-modal');
  }
  window.NordFormUI = { esc: esc, icon: icon, hydrate: hydrate, imageHTML: imageHTML, imageAttributes: imageAttributes, openDialog: openDialog };
})();
