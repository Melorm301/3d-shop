<?php
/**
 * Plugin Name: STYKK Commerce
 * Description: WooCommerce-backed catalog data, STYKK shop filters, and native variation color controls.
 * Version: 1.0.0
 * Author: STYKK
 */
if (!defined('ABSPATH')) exit;

final class STYKK_Commerce {
	/** Stable Elementor card wrapper => WooCommerce SKU. Never infer from order/name. */
	private static $cards = [
		'290f7a8'=>'ST-001','d1cdec'=>'ST-002','6f3f6d6c'=>'ST-003','5198fbf'=>'ST-004','1a0eab95'=>'ST-005',
		'3ef6b37d'=>'ST-006','3b9ac338'=>'ST-007','78e5b81b'=>'ST-008','4122fd36'=>'ST-009','74134539'=>'ST-010',
		'33d30dba'=>'ST-011','39aa5464'=>'ST-012','7eb74fde'=>'ST-013','4ca25e81'=>'ST-014','2a9ded4a'=>'ST-015',
		'88ccb23'=>'ST-016','2fdde5f4'=>'ST-017','1e9427b2'=>'ST-018','dde82c3'=>'ST-019'
	];
	public static function boot() {
		add_action('wp_footer',[__CLASS__,'shop_assets'],30);
		add_action('woocommerce_before_add_to_cart_form',[__CLASS__,'variation_note'],2);
		add_action('wp_footer',[__CLASS__,'variation_assets'],40);
	}
	private static function shop_page() { return is_page(123) || (function_exists('is_shop') && is_shop()); }
	public static function shop_assets() {
		if (!self::shop_page() || !function_exists('wc_get_product')) return;
		$products=[];
		foreach(self::$cards as $element=>$sku) {
			$p=wc_get_product(wc_get_product_id_by_sku($sku)); if (!$p || !$p->is_visible()) continue;
			$terms=wp_get_post_terms($p->get_id(),'product_cat',['fields'=>'slugs']);
			$rank=(int)$p->get_meta('_stykk_featured_rank',true);
			$featured='yes'===$p->get_meta('_stykk_featured',true);
			$is_new='yes'===$p->get_meta('_stykk_is_new',true);
			$products[$element]=['sku'=>$sku,'name'=>$p->get_name(),'price'=>(float)$p->get_price(),
			'description'=>wp_strip_all_tags($p->get_short_description()),'url'=>get_permalink($p->get_id()),
			'image'=>$p->get_image_id()?wp_get_attachment_image_url($p->get_image_id(),'large'):'',
			'alt'=>$p->get_image_id()?get_post_meta($p->get_image_id(),'_wp_attachment_image_alt',true):'',
			'categories'=>is_wp_error($terms)?[]:$terms,'rank'=>$rank?:99,'featured'=>$featured,'new'=>$is_new,
			'estimated'=>'yes'===$p->get_meta('_stykk_estimated_price',true)];
		}
		?>
		<style>
		#stykk-shop-grid .stykk-filter-hidden{display:none!important}#stykk-shop-grid{row-gap:56px!important}
		@media(max-width:767px){#stykk-shop-grid{row-gap:40px!important}}@media(max-width:479px){#stykk-shop-grid{grid-template-columns:1fr!important}}
		#stykk-catalog-tools{width:100%;max-width:1480px;margin:0 auto;padding:0 clamp(20px,4.3vw,80px) 24px;display:flex;align-items:center;flex-wrap:wrap;gap:12px 32px;color:var(--stykk-ink,#252923);font:inherit;font-size:14px;line-height:1.4}
		#stykk-catalog-tools .stykk-search{display:flex;align-items:center;flex:1 1 240px;min-width:180px;border-bottom:1px solid var(--stykk-line,#d6d4cc)}#stykk-catalog-tools input{width:100%;min-width:0;min-height:44px;padding:8px 0;border:0;background:transparent;color:inherit;font:inherit}
		#stykk-catalog-tools label{display:flex;align-items:center;gap:8px;font-size:12px;color:var(--stykk-ink-soft,#64655b)}#stykk-catalog-tools select{min-height:44px;max-width:190px;border:0;background:transparent;color:inherit;font:inherit}#stykk-catalog-tools output{margin-left:auto;font:11px/1.4 monospace;text-transform:uppercase;letter-spacing:.05em;color:var(--stykk-ink-soft,#64655b)}
		#stykk-catalog-empty{max-width:1480px;margin:0 auto;padding:24px clamp(20px,4.3vw,80px) 96px;color:var(--stykk-ink-soft,#64655b)}#stykk-catalog-collections a[aria-pressed="true"]{border-color:var(--stykk-ink,#252923);background:rgba(37,41,35,.045)}
		@media(max-width:767px){#stykk-catalog-tools{display:grid;grid-template-columns:1fr 1fr;gap:8px 14px;padding-bottom:20px}#stykk-catalog-tools .stykk-search{grid-column:1/-1}#stykk-catalog-tools output{margin-left:0}}@media(max-width:479px){#stykk-catalog-tools{grid-template-columns:1fr}#stykk-catalog-tools .stykk-search{grid-column:auto}}
		</style>
		<script type="application/json" id="stykk-woo-catalog"><?php echo wp_json_encode($products,JSON_HEX_TAG|JSON_HEX_AMP|JSON_HEX_APOS|JSON_HEX_QUOT); ?></script>
		<script>
		(()=>{const data=JSON.parse(document.getElementById('stykk-woo-catalog')?.textContent||'{}'),collection=document.querySelector('.elementor-element-6964a5b1'),grid=document.querySelector('.elementor-element-11bf0160');if(!collection||!grid)return;grid.id='stykk-shop-grid';collection.id='stykk-catalog-collections';const cards=Array.from(grid.children);cards.forEach(card=>{const key=Object.keys(data).find(id=>card.classList.contains('elementor-element-'+id));if(!key)return;const p=data[key];card.dataset.sku=p.sku;card.dataset.price=p.price;card.dataset.name=p.name;card.dataset.categories=p.categories.join(' ');card.dataset.featured=p.featured?'1':'0';card.dataset.rank=p.rank;card.dataset.new=p.new?'1':'0';const img=card.querySelector('img');if(img&&p.image){img.src=p.image;img.removeAttribute('srcset');img.alt=p.alt||p.name}card.querySelectorAll('a[href]').forEach(a=>a.href=p.url);const h=card.querySelector('h3');if(h){const l=h.querySelector('a');if(l)l.textContent=p.name;else h.textContent=p.name}const ps=card.querySelectorAll('p');if(ps[0])ps[0].textContent=p.description||'';if(ps[1])ps[1].textContent=(p.estimated?'ca. ':'')+new Intl.NumberFormat('da-DK',{maximumFractionDigits:0}).format(p.price)+' DKK'});
		const controls=document.createElement('div');controls.id='stykk-catalog-tools';controls.setAttribute('role','search');controls.innerHTML='<label class="stykk-search"><span aria-hidden="true">⌕</span><input type="search" aria-label="Søg i kollektionen" placeholder="Søg efter et STYKK…"></label><label>Sortering <select aria-label="Sortering"><option value="featured">Udvalgte først</option><option value="price-low">Pris: lav til høj</option><option value="price-high">Pris: høj til lav</option><option value="name">Navn: A–Å</option></select></label><output aria-live="polite"></output>';collection.after(controls);const empty=document.createElement('p');empty.id='stykk-catalog-empty';empty.hidden=true;empty.textContent='Vi fandt ikke den form. Prøv en anden søgning, eller vælg Alle STYKK.';grid.after(empty);
		const q=new URLSearchParams(location.search),cats={bolig:'bolig',tilbehor:'tilbehor',figurer:'figurer',legetoj:'legetoj',kokken:'kokken','wall-art':'wall-art'};let active=cats[q.get('category')]||(q.get('collection')==='new'?'new':'all');const input=controls.querySelector('input'),sort=controls.querySelector('select'),out=controls.querySelector('output');function render(){let shown=0;collection.querySelectorAll('a').forEach(a=>{const label=a.innerText.trim();const selected=active==='all'?label==='Alle STYKK':active==='new'?label==='Nyheder':a.href.includes('category='+active);a.setAttribute('aria-pressed',String(selected))});const arranged=cards.map(c=>({c,d:data[Object.keys(data).find(id=>c.classList.contains('elementor-element-'+id))]})).filter(x=>x.d);arranged.sort((a,b)=>sort.value==='price-low'?a.d.price-b.d.price:sort.value==='price-high'?b.d.price-a.d.price:sort.value==='name'?a.d.name.localeCompare(b.d.name,'da'):(Number(b.d.featured)-Number(a.d.featured))||a.d.rank-b.d.rank);arranged.forEach(({c,d})=>{const catOk=active==='all'||(active==='new'?d.new:d.categories.includes(active));const term=input.value.trim().toLocaleLowerCase('da');const text=(d.name+' '+d.description+' '+d.sku+' '+d.categories.join(' ')).toLocaleLowerCase('da');const visible=catOk&&(!term||text.includes(term));c.classList.toggle('stykk-filter-hidden',!visible);if(visible){grid.append(c);shown++}});empty.hidden=shown>0;out.textContent=shown+' STYKK'}collection.addEventListener('click',e=>{const a=e.target.closest('a');if(!a)return;const u=new URL(a.href,location.href);active=cats[u.searchParams.get('category')]||(u.searchParams.get('collection')==='new'?'new':'all');e.preventDefault();render()});input.addEventListener('input',render);sort.addEventListener('change',render);render()})();
		</script><?php
	}
	public static function variation_note() {
		if (!function_exists('wc_get_product')) return;$p=wc_get_product(get_queried_object_id());if(!$p||!$p->is_type('variable')||!in_array($p->get_sku(),['ST-001','ST-002','ST-003','ST-004','ST-006'],true))return;
		echo '<p class="stykk-variation-status" aria-live="polite">Vælg farve</p>';
	}
	public static function variation_assets() {
		if (!function_exists('wc_get_product')) return;$p=wc_get_product(get_queried_object_id());if(!$p||!$p->is_type('variable')||!in_array($p->get_sku(),['ST-001','ST-002','ST-003','ST-004','ST-006'],true))return;
		?> <script>document.addEventListener('DOMContentLoaded',()=>{const form=document.querySelector('form.variations_form');if(!form)return;const sel=[...form.querySelectorAll('select[name^="attribute_"]')].find(s=>/farve/i.test(s.name))||form.querySelector('select[name^="attribute_"]');if(!sel)return;const chips=[...document.querySelectorAll('.stykk-color-chip')],status=document.querySelector('[data-selected-color]');const style=document.createElement('style');style.textContent='form.variations_form .value select[name^="attribute_"]{position:absolute!important;width:1px!important;height:1px!important;overflow:hidden!important;clip:rect(0,0,0,0)!important;white-space:nowrap!important}';document.head.append(style);const sync=()=>{chips.forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.color.toLocaleLowerCase('da')===sel.options[sel.selectedIndex]?.text.toLocaleLowerCase('da'))));const id=form.querySelector('input.variation_id')?.value;if(status&&id)status.dataset.variationId=id};chips.forEach(b=>b.addEventListener('click',()=>{const option=[...sel.options].find(o=>o.text.trim().toLocaleLowerCase('da')===b.dataset.color.trim().toLocaleLowerCase('da'));if(!option)return;sel.value=option.value;sel.dispatchEvent(new Event('change',{bubbles:true}));if(window.jQuery)window.jQuery(sel).trigger('change');if(status)status.textContent='Valgt farve: '+option.text;setTimeout(sync,0)}));sel.addEventListener('change',()=>{if(status)status.textContent=sel.value?'Valgt farve: '+sel.options[sel.selectedIndex].text:'Vælg farve';setTimeout(sync,0)});if(window.jQuery)window.jQuery(form).on('found_variation',sync);});</script><?php
	}
}
STYKK_Commerce::boot();


/* Migrated from snippet 222; product presentation retained here under version control. */
/** STYKK WooCommerce single product presentation; product data remains in WooCommerce. */
if (!function_exists('stykk_product_color_chips')) {
    function stykk_product_color_chips() {
        global $product;
        if (!$product instanceof WC_Product) { return; }
        $raw = trim((string) $product->get_attribute('Farve'));
        if ($raw === '') { return; }
        $colors = preg_split('/\\s*(?:,|\\|)\\s*/u', $raw, -1, PREG_SPLIT_NO_EMPTY);
        $swatches = array(
            'Varm brun' => '#aa7955', 'Lys' => '#e3dfd5', 'Mørk' => '#343737',
            'Grøn' => '#697863', 'Sand' => '#b99b7c', 'Rød' => '#883c35',
            'Sort' => '#343737', 'Hvid' => '#e3dfd5', 'Pink' => '#d991a6',
            'Blå' => '#58768b', 'Gul' => '#d8b94f', 'Grå' => '#979995'
        );
        echo '<section class="stykk-product-colors" aria-label="Farvevalg"><p>Ønsket farve</p><div class="stykk-color-chips" role="group" aria-label="Farver vist på billederne">';
        foreach ($colors as $color) {
            $hex = isset($swatches[$color]) ? $swatches[$color] : '#d6d4cc';
            echo '<button type="button" class="stykk-color-chip" aria-pressed="false" data-color="' . esc_attr($color) . '"><i style="--swatch:' . esc_attr($hex) . '" aria-hidden="true"></i>' . esc_html($color) . '</button>';
        }
        echo '</div><small>Den konkrete nuance aftales før bestilling.</small><span class="screen-reader-text" aria-live="polite" data-selected-color></span></section>';
    }
}
if (!function_exists('stykk_product_details')) {
    function stykk_product_details() {
        global $product;
        if (!$product instanceof WC_Product) { return; }
        echo '<section class="stykk-product-details" aria-label="Produktdetaljer">';
        echo '<details open><summary>Om produktet</summary><div class="stykk-detail-copy">' . wp_kses_post(wpautop($product->get_description())) . '</div></details>';
        echo '<details><summary>Materiale &amp; detaljer</summary><p>Materiale, mål og farve bekræftes for det enkelte STYKK før bestilling. Billederne viser designets udtryk og mulige farver. De er ikke en oversigt over lagerførte varianter.</p></details>';
        echo '<details><summary>Fremstilling</summary><p>Hvert STYKK tager form med 3D-print. De fine lag er en del af udtrykket og minder om glæden ved at skabe, prøve og justere. Materialet vælges til det enkelte design.</p></details>';
        echo '<details><summary>Bestilling &amp; levering</summary><p>De fleste produkter printes efter bestilling. Lagerstatus, fragtpris, levering og betaling aftales, før en ordre bekræftes.</p></details>';
        echo '</section>';
    }
}
if (!function_exists('stykk_related_products')) {
    function stykk_related_products() {
        global $product;
        if (!$product instanceof WC_Product) { return; }
        $terms = wp_get_post_terms($product->get_id(), 'product_cat', array('fields' => 'ids'));
        $args = array('post_type' => 'product', 'post_status' => array('publish', 'private'), 'posts_per_page' => 3, 'post__not_in' => array($product->get_id()), 'orderby' => 'menu_order', 'order' => 'ASC');
        if (!is_wp_error($terms) && $terms) { $args['tax_query'] = array(array('taxonomy' => 'product_cat', 'field' => 'term_id', 'terms' => $terms)); }
        $query = new WP_Query($args);
        if (!$query->have_posts()) { return; }
        echo '<section class="stykk-related"><div class="stykk-related-head"><div><p class="stykk-eyebrow">Flere produkter</p><h2>Flere STYKK, samme omtanke.</h2></div><a href="' . esc_url(wc_get_page_permalink('shop')) . '">Til shoppen →</a></div><div class="stykk-related-grid">';
        while ($query->have_posts()) { $query->the_post(); $item = wc_get_product(get_the_ID()); if (!$item) { continue; }
            echo '<article class="stykk-related-card"><a href="' . esc_url(get_permalink()) . '">' . $item->get_image('woocommerce_thumbnail') . '<h3>' . esc_html($item->get_name()) . '</h3><p>' . esc_html(wp_strip_all_tags($item->get_short_description())) . '</p><span>' . wp_kses_post($item->get_price_html()) . '</span></a></article>';
        }
        echo '</div></section>';
        wp_reset_postdata();
    }
}
add_action('wp', function () {
    if (!function_exists('is_product') || !is_product()) { return; }
    remove_action('woocommerce_after_single_product_summary', 'woocommerce_output_product_data_tabs', 10);
    remove_action('woocommerce_after_single_product_summary', 'woocommerce_output_related_products', 20);
    add_action('woocommerce_single_product_summary', 'stykk_product_color_chips', 25);
    add_action('woocommerce_after_single_product_summary', 'stykk_product_details', 10);
    add_action('woocommerce_after_single_product_summary', 'stykk_related_products', 20);
});
add_action('wp_body_open', function () {
    if (!function_exists('is_product') || !is_product()) { return; }
    echo '<header class="stykk-product-header"><a href="' . esc_url(home_url('/')) . '" aria-label="STYKK, forside">STYKK</a><nav aria-label="Hovedmenu"><a href="' . esc_url(wc_get_page_permalink('shop')) . '">Shop</a></nav></header>';
});
add_action('wp_head', function () {
    if (!function_exists('is_product') || !is_product()) { return; }
    ?>
    <style>
      body.single-product{margin:0;background:#f4f1e9;color:#252923;font-family:"Helvetica Neue",Helvetica,Arial,sans-serif;line-height:1.55}
      body.single-product #site-header,body.single-product #site-footer{display:none!important}
      .stykk-product-header{height:82px;display:flex;align-items:center;justify-content:space-between;padding:0 clamp(20px,4.3vw,80px);border-bottom:1px solid #d6d4cc;background:#f4f1e9;position:sticky;top:0;z-index:20}
      .stykk-product-header>a{font-size:2.15rem;font-weight:700;letter-spacing:-.065em;line-height:1;text-decoration:none}.stykk-product-header nav a{font-size:.875rem;text-decoration:none;border-bottom:1px solid #aaa99f;padding:.6rem 0}
      body.single-product .site-main{width:100%;max-width:1480px;margin:0 auto;padding:24px clamp(20px,4.3vw,80px) 0}
      body.single-product .woocommerce-breadcrumb{margin:0 0 28px;color:#64655b;font-size:.75rem}
      body.single-product div.product{display:grid;grid-template-columns:minmax(0,1.25fr) minmax(0,1fr);min-width:0;column-gap:clamp(32px,6vw,96px);align-items:start}
      body.single-product div.product .woocommerce-product-gallery{width:100%;max-width:100%;min-width:0;float:none;margin:0;background:#eae6dc;overflow:hidden}
      body.single-product div.product .woocommerce-product-gallery__wrapper{margin:0}.woocommerce-product-gallery .woocommerce-product-gallery__image img{width:100%;height:auto;object-fit:contain}
      body.single-product div.product .summary{width:100%;float:none;margin:0;position:sticky;top:112px}
      body.single-product .product_title{font-size:clamp(2.4rem,4vw,4.5rem);line-height:1.05;letter-spacing:-.05em;font-weight:500;margin:0 0 1rem;color:#252923}
      body.single-product .summary .price{font-size:1.45rem;line-height:1.4;color:#252923;margin:1.5rem 0}.single-product .summary .price del{opacity:.55}
      body.single-product .woocommerce-product-details__short-description{font-size:1rem;color:#64655b;line-height:1.6}
      body.single-product .product_meta{font-size:.75rem;color:#64655b;margin-top:1.5rem;padding-top:1.2rem;border-top:1px solid #d6d4cc}
      body.single-product form.cart{display:flex;align-items:center;gap:12px;margin:1.4rem 0 1.2rem;padding-top:1.2rem;border-top:1px solid #d6d4cc}
      body.single-product form.cart .quantity input{height:48px;width:72px;border:1px solid #d6d4cc;background:transparent;text-align:center;color:#252923;font: .85rem monospace}
      body.single-product .single_add_to_cart_button{display:none!important}
      .stykk-product-colors{margin:1.5rem 0 0;padding-top:1.2rem;border-top:1px solid #d6d4cc}.stykk-product-colors>p{font:400 .7rem monospace;letter-spacing:.06em;text-transform:uppercase;color:#64655b;margin:0 0 .8rem}
      .stykk-color-chips{display:flex;flex-wrap:wrap;gap:8px}.stykk-color-chip{display:inline-flex;align-items:center;gap:8px;min-height:42px;padding:6px 10px;border:1px solid #d6d4cc;background:transparent;color:#252923;font-size:.85rem;cursor:pointer}.stykk-color-chip[aria-pressed="true"]{border-color:#252923;background:#ded9ce}.stykk-color-chip i{width:16px;height:16px;border:1px solid #aaa99f;border-radius:50%;background:var(--swatch)}.stykk-product-colors small{display:block;margin-top:10px;color:#64655b;font-size:.8rem}
      .stykk-product-details{grid-column:1/-1;margin-top:48px;border-top:1px solid #d6d4cc}.stykk-product-details details{padding:16px 0;border-bottom:1px solid #d6d4cc}.stykk-product-details summary{display:flex;justify-content:space-between;gap:12px;list-style:none;cursor:pointer;font-size:.9rem}.stykk-product-details summary::-webkit-details-marker{display:none}.stykk-product-details summary:after{content:"+";font:1.1rem monospace;color:#64655b}.stykk-product-details details[open] summary:after{content:"−"}.stykk-product-details p{max-width:75ch;margin:16px 0 4px;color:#64655b;font-size:.9rem}.stykk-detail-copy>*:last-child{margin-bottom:4px}
      .stykk-related{grid-column:1/-1;width:100%;margin:64px auto 0;padding:0 0 96px}.stykk-related-head{display:flex;align-items:end;justify-content:space-between;gap:24px;margin-bottom:32px}.stykk-eyebrow{font:400 .75rem monospace;letter-spacing:.06em;text-transform:uppercase;color:#64655b;margin:0}.stykk-related-head h2{font-size:clamp(2rem,4.6vw,4.75rem);line-height:1.07;letter-spacing:-.055em;margin:16px 0 0;font-weight:500}.stykk-related-head>a{font-size:.85rem;text-decoration:none;border-bottom:1px solid #aaa99f;padding-bottom:6px;white-space:nowrap}
      .stykk-related-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:24px}.stykk-related-card a{display:block;text-decoration:none}.stykk-related-card img{width:100%;aspect-ratio:4/3;object-fit:contain;background:#eae6dc}.stykk-related-card h3{font-size:1.1rem;font-weight:500;margin:16px 0 6px}.stykk-related-card p{font-size:.875rem;color:#64655b;margin:0 0 8px}.stykk-related-card span{font: .8rem monospace}
      .stykk-product-footer{width:100%;padding:56px clamp(20px,4.3vw,80px) 32px;background:#252923;color:#f4f1e9;display:flex;align-items:center;justify-content:space-between;gap:24px}.stykk-product-footer>a{font-size:clamp(4rem,16vw,16rem);line-height:1;letter-spacing:-.07em;font-weight:700;text-decoration:none}.stykk-product-footer>span,.stykk-product-footer>small{font-size:.75rem;color:#b8beaf}.stykk-mobile-purchase{display:none}
      @media(max-width:767px){body.single-product .site-main{padding-top:16px}body.single-product div.product{grid-template-columns:minmax(0,1fr);row-gap:28px}body.single-product div.product .summary{position:static}.stykk-product-details{margin-top:32px}.stykk-related{padding-bottom:32px}.stykk-related-grid{grid-template-columns:repeat(2,minmax(0,1fr));gap:24px 16px}.stykk-related-head{align-items:flex-start;flex-direction:column}.stykk-mobile-purchase{position:fixed;inset:auto 0 0;z-index:30;display:flex;align-items:center;justify-content:space-between;gap:12px;padding:10px 16px calc(10px + env(safe-area-inset-bottom));border-top:1px solid #d6d4cc;background:#f4f1e9}.stykk-mobile-purchase div{min-width:0;display:grid}.stykk-mobile-purchase span{font-size:.72rem;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.stykk-mobile-purchase strong{font: .85rem monospace}.stykk-mobile-purchase button{min-height:44px;padding:8px 14px;background:#252923;color:#f4f1e9;font-size:.85rem}body.single-product{padding-bottom:68px}.stykk-product-footer{flex-direction:column;align-items:flex-start;gap:16px}.stykk-product-footer>a{font-size:4rem}}
      @media(max-width:479px){.stykk-related-grid{grid-template-columns:1fr}.stykk-related-head h2{font-size:2.2rem}}
    </style>
    <script>
      document.addEventListener('DOMContentLoaded',()=>{
        document.querySelectorAll('.stykk-color-chip').forEach(button=>button.addEventListener('click',()=>{
          document.querySelectorAll('.stykk-color-chip').forEach(item=>item.setAttribute('aria-pressed',String(item===button)));
          const status=document.querySelector('[data-selected-color]');if(status)status.textContent='Ønsket farve: '+button.dataset.color;
        }));
        const summary=document.querySelector('.summary');if(!summary)return;
        const bar=document.createElement('div');bar.className='stykk-mobile-purchase';
        const name=summary.querySelector('.product_title')?.textContent?.replace(/^Privat:\s*/, '').trim()||'';
        const price=summary.querySelector('.price')?.textContent?.trim()||'';
        bar.innerHTML='<div><span></span><strong></strong></div><button type="button">Vælg antal</button>';
        bar.querySelector('span').textContent=name;bar.querySelector('strong').textContent=price;
        bar.querySelector('button').addEventListener('click',()=>{const qty=document.querySelector('form.cart .quantity input');qty?.scrollIntoView({behavior:'smooth',block:'center'});qty?.focus({preventScroll:true});});
        document.body.appendChild(bar);
      });
    </script>
    <?php
}, 99);
add_action('wp_footer', function () {
    if (!function_exists('is_product') || !is_product()) { return; }
    echo '<footer class="stykk-product-footer"><span>3D-print med nysgerrighed og kærlighed.</span><a href="' . esc_url(home_url('/')) . '">STYKK</a><small>© ' . esc_html(gmdate('Y')) . ' STYKK · Ét STYKK ad gangen.</small></footer>';
}, 1);
