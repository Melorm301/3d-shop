(() => {
  const product = document.querySelector('body.single-product div.product');
  const summary = product?.querySelector(':scope > .summary');
  const header = document.querySelector('.stykk-product-header');
  const related = document.querySelector('.stykk-related');
  if (!product || !summary || !header) return;

  const desktop = window.matchMedia('(min-width: 1025px)');
  let frame = 0;

  const update = () => {
    if (!desktop.matches) {
      summary.classList.remove('is-released');
      summary.style.removeProperty('--stykk-summary-top');
      product.style.removeProperty('--stykk-summary-space');
      return;
    }

    const headerBottom = header.getBoundingClientRect().bottom;
    const fixedTop = headerBottom + 16;
    summary.style.setProperty('--stykk-summary-top', `${fixedTop}px`);

    const summaryHeight = summary.getBoundingClientRect().height;
    product.style.setProperty('--stykk-summary-space', `${Math.ceil(summaryHeight)}px`);
    const fixedBottom = fixedTop + summaryHeight;

    // Release only at the geometric collision boundary. The related section
    // follows the product container by its 64px top margin; products without
    // related items use the product-container bottom as their boundary.
    const sectionGap = related
      ? Number.parseFloat(getComputedStyle(related).marginTop) || 64
      : 0;
    const release = related
      ? related.getBoundingClientRect().top <= fixedBottom + sectionGap
      : product.getBoundingClientRect().bottom <= fixedBottom;

    summary.classList.toggle('is-released', release);
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
    [header, product, summary, related].filter(Boolean).forEach(node => resizeObserver.observe(node));
  }

  if ('MutationObserver' in window) {
    const contentObserver = new MutationObserver(schedule);
    contentObserver.observe(summary, { childList: true, characterData: true, subtree: true });
  }
})();
