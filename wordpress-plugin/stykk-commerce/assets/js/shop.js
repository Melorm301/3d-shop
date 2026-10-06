(() => {
	'use strict';
	const init = () => {
		const data = window.STYKKCatalog || {};
		const collection = document.querySelector('.elementor-element-6964a5b1');
		const grid = document.querySelector('.elementor-element-11bf0160');
		if (!collection || !grid) return;

		collection.id = 'stykk-catalog-collections';
		collection.setAttribute('role', 'group');
		collection.setAttribute('aria-label', 'Kollektioner');
		grid.id = 'stykk-shop-grid';
		grid.setAttribute('role', 'list');
		const cards = [...grid.children];
		const cardData = new Map();

		cards.forEach(card => {
			const entry = Object.entries(data).find(([elementId]) => card.classList.contains(`elementor-element-${elementId}`));
			if (!entry) return;
			const product = entry[1];
			cardData.set(card, product);
			card.dataset.sku = product.sku;
			card.dataset.price = String(product.price);
			card.dataset.name = product.name;
			card.dataset.categories = (product.categories || []).join(' ');
			card.dataset.featured = product.featured ? '1' : '0';
			card.dataset.rank = String(product.rank || 99);
			card.dataset.new = product.new ? '1' : '0';
			card.setAttribute('role', 'listitem');

			const image = card.querySelector('img');
			if (image && product.image) {
				image.src = product.image;
				if (product.srcset) image.srcset = product.srcset;
				else image.removeAttribute('srcset');
				if (product.sizes) image.sizes = product.sizes;
				image.alt = product.alt || product.name;
			}
			card.querySelectorAll('a[href]').forEach(link => { link.href = product.url; });
			const heading = card.querySelector('h3');
			if (heading) heading.textContent = product.name;
			const paragraphs = card.querySelectorAll('p');
			if (paragraphs[0]) paragraphs[0].textContent = product.description || '';
			if (paragraphs[1]) {
				paragraphs[1].textContent = `${product.estimated ? 'ca. ' : ''}${new Intl.NumberFormat('da-DK', { maximumFractionDigits: 0 }).format(product.price)} DKK`;
			}
		});

		const categories = { bolig: 'bolig', tilbehor: 'tilbehor', figurer: 'figurer', legetoj: 'legetoj', kokken: 'kokken', 'wall-art': 'wall-art' };
		[...collection.querySelectorAll('a[href]')].forEach(link => {
			const url = new URL(link.href, location.href);
			const category = url.searchParams.get('category');
			const filter = category && categories[category] ? categories[category] : url.searchParams.get('collection') === 'new' ? 'new' : 'all';
			const label = link.textContent.trim();
			const button = document.createElement('button');
			button.type = 'button';
			button.className = 'stykk-filter-button';
			button.dataset.filter = filter;
			button.textContent = label;
			button.setAttribute('aria-pressed', 'false');
			const heading = link.closest('h1,h2,h3,h4,h5,h6');
			(heading || link).replaceWith(button);
		});

		const tools = document.createElement('div');
		tools.id = 'stykk-catalog-tools';
		tools.setAttribute('role', 'search');
		tools.innerHTML = '<label class="stykk-search"><span aria-hidden="true">⌕</span><input type="search" aria-label="Søg i kollektionen" placeholder="Søg efter et STYKK…"></label><label>Sortering <select aria-label="Sortering"><option value="featured">Udvalgte først</option><option value="price-low">Pris: lav til høj</option><option value="price-high">Pris: høj til lav</option><option value="name">Navn: A–Å</option></select></label><output aria-live="polite"></output>';
		collection.after(tools);
		const input = tools.querySelector('input');
		const sort = tools.querySelector('select');
		const output = tools.querySelector('output');

		const sectionHeading = document.createElement('h2');
		sectionHeading.className = 'stykk-sr-only';
		sectionHeading.textContent = 'Produkter';
		grid.before(sectionHeading);
		const empty = document.createElement('p');
		empty.id = 'stykk-catalog-empty';
		empty.hidden = true;
		empty.textContent = 'Vi fandt ikke den form. Prøv en anden søgning, eller vælg Alle STYKK.';
		grid.after(empty);

		const query = new URLSearchParams(location.search);
		let active = categories[query.get('category')] || (query.get('collection') === 'new' ? 'new' : 'all');
		const render = () => {
			let shown = 0;
			collection.querySelectorAll('.stykk-filter-button').forEach(button => {
				button.setAttribute('aria-pressed', String(button.dataset.filter === active));
			});
			const ordered = [...cardData.entries()].sort(([a, productA], [b, productB]) => {
				if (sort.value === 'price-low') return productA.price - productB.price;
				if (sort.value === 'price-high') return productB.price - productA.price;
				if (sort.value === 'name') return productA.name.localeCompare(productB.name, 'da');
				return (Number(productB.featured) - Number(productA.featured)) || Number(productA.rank) - Number(productB.rank);
			});
			ordered.forEach(([card, product]) => {
				const categoryMatch = active === 'all' || (active === 'new' ? product.new : (product.categories || []).includes(active));
				const term = input.value.trim().toLocaleLowerCase('da');
				const haystack = `${product.name} ${product.description} ${product.sku} ${(product.categories || []).join(' ')}`.toLocaleLowerCase('da');
				const visible = categoryMatch && (!term || haystack.includes(term));
				card.classList.toggle('stykk-filter-hidden', !visible);
				if (visible) { grid.append(card); shown += 1; }
			});
			empty.hidden = shown > 0;
			output.textContent = `${shown} STYKK`;
		};
		collection.addEventListener('click', event => {
			const button = event.target.closest('.stykk-filter-button');
			if (!button) return;
			active = button.dataset.filter;
			const url = new URL(location.href);
			url.searchParams.delete('category');
			url.searchParams.delete('collection');
			if (categories[active]) url.searchParams.set('category', active);
			else if (active === 'new') url.searchParams.set('collection', 'new');
			history.replaceState({}, '', url);
			render();
		});
		input.addEventListener('input', render);
		sort.addEventListener('change', render);
		render();
	};

	if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, { once: true });
	else init();
})();
