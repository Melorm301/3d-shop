(() => {
	'use strict';

	const asTag = (element, tagName) => {
		if (!element || element.tagName.toLowerCase() === tagName) return element;
		const replacement = document.createElement(tagName);
		for (const attribute of element.attributes) replacement.setAttribute(attribute.name, attribute.value);
		replacement.style.display = getComputedStyle(element).display;
		while (element.firstChild) replacement.append(element.firstChild);
		element.replaceWith(replacement);
		return replacement;
	};

	const normalizeLandmarks = () => {
		// The Shop page is a single V4 Elementor tree. Restore header/main/footer landmarks
		// around its existing editable containers without changing their styles or content.
		const shopRoot = document.querySelector('.elementor-123 .elementor-element-2d2ac7e2');
		if (shopRoot && !shopRoot.querySelector('main')) {
			const children = [...shopRoot.children];
			if (children.length >= 3) {
				const header = asTag(children[0], 'header');
				const footer = asTag(children[children.length - 1], 'footer');
				const gap = getComputedStyle(shopRoot).rowGap;
				const main = document.createElement('main');
				main.className = 'stykk-shop-main';
				main.style.display = 'flex';
				main.style.flexDirection = 'column';
				main.style.rowGap = gap;
				shopRoot.insertBefore(main, footer);
				children.slice(1, -1).forEach(child => main.append(child));
				const primaryNav = [...header.querySelectorAll('.elementor-element')]
					.find(element => element.querySelectorAll('a[href]').length >= 4);
				if (primaryNav) asTag(primaryNav, 'nav');
			}
		}

		const main = document.querySelector('main') || document.querySelector('[role="main"]');
		if (main) {
			main.id = 'main-content';
			main.tabIndex = -1;
			main.setAttribute('role', 'main');
			const skip = document.querySelector('.stykk-skip-link');
			skip?.addEventListener('click', () => setTimeout(() => main.focus({ preventScroll: true }), 0));
		}

		document.querySelectorAll('nav').forEach(nav => {
			if (nav.hasAttribute('aria-label')) return;
			if (nav.closest('header')?.querySelector('.st-mobile-nav') === nav || nav.matches('.st-mobile-nav')) {
				nav.setAttribute('aria-label', 'Mobilmenu');
			} else if (nav.closest('footer')) {
				nav.setAttribute('aria-label', 'Footer navigation');
			} else {
				nav.setAttribute('aria-label', 'Hovedmenu');
			}
		});

		// Brand marks and navigation labels are styled text, not section headings.
		document.querySelectorAll('header h1, header h2, header h3, header h4, nav h1, nav h2, nav h3, nav h4')
			.forEach(heading => asTag(heading, 'span'));
		document.querySelectorAll('footer h1, footer h2, footer h3, footer h4').forEach(heading => {
			if (heading.textContent.trim() === 'STYKK') asTag(heading, 'span');
		});

		document.querySelectorAll('details').forEach(details => {
			const summary = details.querySelector(':scope > summary');
			const mobileHeaderDisclosure = details.closest('header') && details.querySelector('nav');
			if (!summary || (!mobileHeaderDisclosure && !/menu|☰/i.test(`${details.className} ${summary.textContent}`))) return;
			details.setAttribute('aria-label', 'Mobilmenu');
			const panel = details.querySelector(':scope > *:not(summary)');
			if (panel) {
				if (!panel.id) panel.id = 'stykk-mobile-menu-panel';
				summary.setAttribute('aria-controls', panel.id);
			}
			summary.setAttribute('aria-label', 'Åbn eller luk mobilmenu');
			const update = () => summary.setAttribute('aria-expanded', String(details.open));
			details.addEventListener('toggle', update);
			update();
		});
	};

	if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', normalizeLandmarks, { once: true });
	else normalizeLandmarks();
})();
