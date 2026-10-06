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
				const addToCart = form.querySelector('.single_add_to_cart_button');
				const normalize = value => String(value || '').trim().toLocaleLowerCase('da');
				const nativeTable = select.closest('.variations');
				if (nativeTable) nativeTable.setAttribute('aria-hidden', 'true');
				select.setAttribute('aria-hidden', 'true');
				select.tabIndex = -1;
				const sync = variation => {
					const selected = select.options[select.selectedIndex];
					const selectedLabel = normalize(selected?.text);
					chips.forEach(chip => chip.setAttribute('aria-pressed', String(normalize(chip.dataset.color) === selectedLabel)));
					const resolvedId = variation?.variation_id || form.querySelector('input.variation_id')?.value || '';
					const id = String(resolvedId) !== '0' ? String(resolvedId) : '';
					if (status) {
						if (id) status.dataset.variationId = String(id);
						else delete status.dataset.variationId;
					}
					if (addToCart) {
						addToCart.disabled = !id;
						addToCart.setAttribute('aria-disabled', String(!id));
						addToCart.classList.toggle('disabled', !id);
					}
				};
				chips.forEach(chip => {
					chip.setAttribute('aria-label', chip.dataset.color.trim());
					chip.addEventListener('click', () => {
					const option = [...select.options].find(item => normalize(item.text) === normalize(chip.dataset.color) || normalize(item.value) === normalize(chip.dataset.color));
					if (!option) return;
					select.value = option.value;
					if (window.jQuery) window.jQuery(select).trigger('change');
					else select.dispatchEvent(new Event('change', { bubbles: true }));
					if (status) status.textContent = `Valgt farve: ${option.text}`;
					window.setTimeout(sync, 50);
				});
				});
				select.addEventListener('change', () => {
					if (status) status.textContent = select.value ? `Valgt farve: ${select.options[select.selectedIndex].text}` : 'Vælg farve';
					window.setTimeout(sync, 50);
				});
				if (window.jQuery) {
					window.jQuery(form).on('found_variation', (_event, variation) => sync(variation));
					window.jQuery(form).on('reset_data hide_variation', () => sync());
				}
				form.addEventListener('submit', event => {
					const variationId = form.querySelector('input.variation_id')?.value;
					if (!select.value || !variationId || variationId === '0') {
						event.preventDefault();
						if (status) status.textContent = 'Vælg farve før du lægger produktet i kurven.';
						chips[0]?.focus();
					}
				}, true);
				sync();
			}
		}

		const summary = document.querySelector('.single-product .summary');
		if (!summary) return;
		const bar = document.createElement('div');
		bar.className = 'stykk-mobile-purchase';
		bar.setAttribute('aria-label', 'Produktvalg');
		const name = summary.querySelector('.product_title')?.textContent?.replace(/^Privat:\s*/, '').trim() || '';
		const price = summary.querySelector('.price')?.textContent?.trim() || '';
	bar.innerHTML = '<div><span></span><strong></strong></div><button type="button"></button>';
		bar.querySelector('span').textContent = name;
		bar.querySelector('strong').textContent = price;
		const mobileButton = bar.querySelector('button');
		const cartForm = document.querySelector('form.cart');
		const variableForm = cartForm?.matches('form.variations_form') ? cartForm : null;
		const canAdd = () => {
			if (!variableForm) return Boolean(cartForm?.querySelector('.single_add_to_cart_button'));
			const select = variableForm.querySelector('select[name^="attribute_"]');
			const variationId = variableForm.querySelector('input.variation_id')?.value;
			return Boolean(select?.value && variationId && variationId !== '0' && !variableForm.querySelector('.single_add_to_cart_button')?.disabled);
		};
		const updateMobileButton = () => {
			const ready = canAdd();
			mobileButton.textContent = ready ? 'Læg i kurv' : 'Vælg farve';
			mobileButton.setAttribute('aria-label', ready ? `Læg ${name} i kurven` : 'Vælg farve før du lægger produktet i kurven');
		};
		mobileButton.addEventListener('click', () => {
			if (canAdd()) {
				cartForm.querySelector('.single_add_to_cart_button')?.click();
				return;
			}
			const firstChip = document.querySelector('.stykk-color-chip');
			firstChip?.scrollIntoView({ behavior: 'smooth', block: 'center' });
			firstChip?.focus({ preventScroll: true });
			if (!firstChip) {
				const quantity = cartForm?.querySelector('.quantity input');
				quantity?.scrollIntoView({ behavior: 'smooth', block: 'center' });
				quantity?.focus({ preventScroll: true });
			}
		});
		document.querySelectorAll('.stykk-color-chip').forEach(chip => chip.addEventListener('click', () => window.setTimeout(updateMobileButton, 250)));
		if (window.jQuery && variableForm) {
			window.jQuery(variableForm).on('found_variation', updateMobileButton);
			window.jQuery(variableForm).on('reset_data hide_variation', updateMobileButton);
		}
		updateMobileButton();
		document.body.append(bar);
	};

	if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, { once: true });
	else init();
})();
