(() => {
	'use strict';
	const data = window.STYKKHomeCatalog || {};
	const money = new Intl.NumberFormat('da-DK', { maximumFractionDigits: 0 });
	const featuredSection = document.querySelector('.elementor-element-32c3457');
	if (featuredSection && !document.getElementById('udvalgt')) featuredSection.id = 'udvalgt';

	Object.entries(data).forEach(([elementId, product]) => {
		const card = document.querySelector(`.elementor-element-${CSS.escape(elementId)}`);
		if (!card) return;
		const image = card.querySelector('img');
		if (image && product.image) {
			image.src = product.image;
			if (product.srcset) image.srcset = product.srcset;
			if (product.sizes) image.sizes = product.sizes;
			image.alt = product.alt || product.name;
		}
		const title = card.querySelector('h3');
		if (title) title.textContent = product.name;
		const paragraphs = card.querySelectorAll('p');
		const price = paragraphs[0];
		if (price) price.textContent = `${money.format(product.price)} DKK`;
		if (paragraphs[1] && product.categoryLabel) paragraphs[1].textContent = product.categoryLabel.toLocaleUpperCase('da');
		if (paragraphs[2]) paragraphs[2].textContent = product.description || '';
		card.querySelectorAll('a[href]').forEach(link => { link.href = product.url; });
		const action = [...card.querySelectorAll('a')].find(link => /Vælg variant|Spørg os|Se nærmere/.test(link.textContent));
		if (action) action.textContent = product.type === 'variable' ? 'Vælg variant　→' : 'Se nærmere　→';
	});
})();
