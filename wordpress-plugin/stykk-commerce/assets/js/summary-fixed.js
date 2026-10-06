(() => {
  const product = document.querySelector('body.single-product div.product');
  const summary = product?.querySelector(':scope > .summary');
  const header = document.querySelector('.stykk-product-header');
  if (!product || !summary || !header) return;

  const desktop = window.matchMedia('(min-width: 1025px)');
  let frame = 0;

  const update = () => {
    if (!desktop.matches) {
      summary.style.removeProperty('--stykk-summary-top');
      product.style.removeProperty('--stykk-summary-space');
      return;
    }

    summary.style.setProperty('--stykk-summary-top', `${header.getBoundingClientRect().bottom + 16}px`);
    const summaryHeight = summary.getBoundingClientRect().height;
    product.style.setProperty('--stykk-summary-space', `${Math.ceil(summaryHeight)}px`);
  };

  const schedule = () => {
    if (frame) return;
    frame = requestAnimationFrame(() => {
      frame = 0;
      update();
    });
  };

  update();
  window.addEventListener('scroll', schedule, { passive: true });
  window.addEventListener('resize', schedule, { passive: true });
  desktop.addEventListener('change', schedule);

  if ('ResizeObserver' in window) {
    const resizeObserver = new ResizeObserver(schedule);
    [header, summary].forEach(node => resizeObserver.observe(node));
  }

  if ('MutationObserver' in window) {
    const contentObserver = new MutationObserver(schedule);
    contentObserver.observe(summary, { childList: true, characterData: true, subtree: true });
  }
})();
