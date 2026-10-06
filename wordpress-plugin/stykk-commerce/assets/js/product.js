(() => {
	'use strict';
	const init = () => {
		const form = document.querySelector('form.variations_form');
		if (form) {
			const select = [...form.querySelectorAll('select[name^="attribute_"]')].find(field => /farve/i.test(field.name))
				|| form.querySelector('select[name^="attribute_"]');
			if (select) {
				const chips = [...document.querySelectorAll('.stykk-color-chip')];
				const status = document.querySelector('[data-selected-color]');
				const sync = () => {
					const selectedLabel = select.options[select.selectedIndex]?.text.trim().toLocaleLowerCase('da');
					chips.forEach(chip => chip.setAttribute('aria-pressed', String(chip.dataset.color.trim().toLocaleLowerCase('da') === selectedLabel)));
					const id = form.querySelector('input.variation_id')?.value;
					if (status && id) status.dataset.variationId = id;
				};
				chips.forEach(chip => chip.addEventListener('click', () => {
					const option = [...select.options].find(item => item.text.trim().toLocaleLowerCase('da') === chip.dataset.color.trim().toLocaleLowerCase('da'));
					if (!option) return;
					select.value = option.value;
					select.dispatchEvent(new Event('change', { bubbles: true }));
					if (window.jQuery) window.jQuery(select).trigger('change');
					if (status) status.textContent = `Valgt farve: ${option.text}`;
					window.setTimeout(sync, 0);
				}));
				select.addEventListener('change', () => {
					if (status) status.textContent = select.value ? `Valgt farve: ${select.options[select.selectedIndex].text}` : 'Vælg farve';
					window.setTimeout(sync, 0);
				});
				if (window.jQuery) window.jQuery(form).on('found_variation', sync);
			}
		}

		const summary = document.querySelector('.single-product .summary');
		if (!summary) return;
		const bar = document.createElement('div');
		bar.className = 'stykk-mobile-purchase';
		bar.setAttribute('aria-label', 'Produktvalg');
		const name = summary.querySelector('.product_title')?.textContent?.replace(/^Privat:\s*/, '').trim() || '';
		const price = summary.querySelector('.price')?.textContent?.trim() || '';
		bar.innerHTML = '<div><span></span><strong></strong></div><button type="button">Vælg antal</button>';
		bar.querySelector('span').textContent = name;
		bar.querySelector('strong').textContent = price;
		bar.querySelector('button').addEventListener('click', () => {
			const quantity = document.querySelector('form.cart .quantity input');
			quantity?.scrollIntoView({ behavior: 'smooth', block: 'center' });
			quantity?.focus({ preventScroll: true });
		});
		document.body.append(bar);
	};

	if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, { once: true });
	else init();
})();
