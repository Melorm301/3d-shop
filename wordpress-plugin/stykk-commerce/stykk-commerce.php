<?php
/**
 * Plugin Name: STYKK Commerce
 * Description: WooCommerce-backed catalog data, STYKK shop filters, and native variation color controls.
 * Version: 1.1.6
 * Author: STYKK
 */
if (!defined('ABSPATH')) exit;

final class STYKK_Commerce {
	private const VERSION = '1.1.6';
	/** Stable Elementor card wrapper => WooCommerce SKU. Never infer from order/name. */
	private static $cards = [
		'290f7a8'=>'ST-001','d1cdec'=>'ST-002','6f3f6d6c'=>'ST-003','5198fbf'=>'ST-004','1a0eab95'=>'ST-005',
		'3ef6b37d'=>'ST-006','3b9ac338'=>'ST-007','78e5b81b'=>'ST-008','4122fd36'=>'ST-009','74134539'=>'ST-010',
		'33d30dba'=>'ST-011','39aa5464'=>'ST-012','7eb74fde'=>'ST-013','4ca25e81'=>'ST-014','2a9ded4a'=>'ST-015',
		'88ccb23'=>'ST-016','2fdde5f4'=>'ST-017','1e9427b2'=>'ST-018','dde82c3'=>'ST-019'
	];
	public static function boot() {
		add_action('wp_enqueue_scripts',[__CLASS__,'enqueue_assets'],20);
		add_action('wp_head',[__CLASS__,'seo_metadata'],2);
		add_filter('pre_get_document_title',[__CLASS__,'document_title']);
		add_filter('wp_get_attachment_image_attributes',[__CLASS__,'attachment_alt'],10,3);
		add_filter('elementor/widget/render_content',[__CLASS__,'elementor_image_alt'],20,2);
		add_filter('wp_robots',[__CLASS__,'robots']);
		add_filter('wp_sitemaps_posts_query_args',[__CLASS__,'sitemap_query_args'],10,2);
		add_action('wp_body_open',[__CLASS__,'skip_link'],1);
		add_action('woocommerce_before_add_to_cart_form',[__CLASS__,'variation_note'],2);
	}
	private static function shop_page() { return is_page(123) || (function_exists('is_shop') && is_shop()); }
	private static function catalog_data() {
		if (!self::shop_page() || !function_exists('wc_get_product')) return [];
		$products=[];
		foreach(self::$cards as $element=>$sku) {
			$p=wc_get_product(wc_get_product_id_by_sku($sku)); if (!$p || !$p->is_visible()) continue;
			$terms=wp_get_post_terms($p->get_id(),'product_cat',['fields'=>'slugs']);
			$rank=(int)$p->get_meta('_stykk_featured_rank',true);
			$featured='yes'===$p->get_meta('_stykk_featured',true);
			$is_new='yes'===$p->get_meta('_stykk_is_new',true);
			$image_id=$p->get_image_id();
			$products[$element]=['sku'=>$sku,'name'=>$p->get_name(),'price'=>(float)$p->get_price(),
			'description'=>wp_strip_all_tags($p->get_short_description()),'url'=>get_permalink($p->get_id()),
			'image'=>$image_id?wp_get_attachment_image_url($image_id,'large'):'',
			'srcset'=>$image_id?wp_get_attachment_image_srcset($image_id,'large'):'',
			'sizes'=>$image_id?wp_get_attachment_image_sizes($image_id,'large'):'',
			'alt'=>$image_id?get_post_meta($image_id,'_wp_attachment_image_alt',true):'',
			'categories'=>is_wp_error($terms)?[]:$terms,'rank'=>$rank?:99,'featured'=>$featured,'new'=>$is_new,
			'estimated'=>'yes'===$p->get_meta('_stykk_estimated_price',true)];
		}
		return $products;
	}
	public static function enqueue_assets() {
		if (is_admin()) return;
		$base=plugin_dir_url(__FILE__);
		wp_enqueue_style('stykk-site',$base.'assets/css/site.css',[],self::VERSION);
		wp_enqueue_script('stykk-site',$base.'assets/js/site.js',[],self::VERSION,true);
		if (self::shop_page()) {
			wp_enqueue_style('stykk-shop',$base.'assets/css/shop.css',['stykk-site'],self::VERSION);
			wp_enqueue_script('stykk-shop',$base.'assets/js/shop.js',['stykk-site'],self::VERSION,true);
			wp_add_inline_script('stykk-shop','window.STYKKCatalog='.wp_json_encode(self::catalog_data(),JSON_HEX_TAG|JSON_HEX_AMP|JSON_HEX_APOS|JSON_HEX_QUOT).';','before');
		}
		if (function_exists('is_product') && is_product()) {
			wp_enqueue_style('stykk-product',$base.'assets/css/product.css',['stykk-site'],self::VERSION);
			wp_enqueue_script('stykk-product',$base.'assets/js/product.js',['jquery','stykk-site'],self::VERSION,true);
		}
	}
	public static function attachment_alt($attributes,$attachment,$size) {
		if (!self::shop_page() || !empty(trim((string)($attributes['alt'] ?? ''))) || !($attachment instanceof WP_Post)) return $attributes;
		static $product_alt_by_image=null;
		if (null===$product_alt_by_image) {
			$product_alt_by_image=[];
			if (function_exists('wc_get_product') && function_exists('wc_get_product_id_by_sku')) {
				foreach (self::$cards as $sku) {
					$product=wc_get_product(wc_get_product_id_by_sku($sku));
					if (!$product || !$product->get_image_id()) continue;
					$image_id=$product->get_image_id();
					$alt=trim((string)get_post_meta($image_id,'_wp_attachment_image_alt',true));
					$product_alt_by_image[$image_id]=$alt ?: $product->get_name();
				}
			}
		}
		if (isset($product_alt_by_image[$attachment->ID])) $attributes['alt']=$product_alt_by_image[$attachment->ID];
		return $attributes;
	}
	public static function elementor_image_alt($content,$widget) {
		if (!self::shop_page() || false===stripos($content,'<img')) return $content;
		static $product_alt_by_image=null;
		static $product_alt_by_url=[];
		static $product_sizes_by_image=[];
		static $product_sizes_by_url=[];
		if (null===$product_alt_by_image) {
			$product_alt_by_image=[];
			foreach (self::$cards as $sku) {
				$product=wc_get_product(wc_get_product_id_by_sku($sku));
				if (!$product || !$product->get_image_id()) continue;
				$image_id=$product->get_image_id();
				$alt=trim((string)get_post_meta($image_id,'_wp_attachment_image_alt',true));
				$product_alt_by_image[$image_id]=$alt ?: $product->get_name();
				$product_sizes_by_image[$image_id]=wp_get_attachment_image_sizes($image_id,'large') ?: '100vw';
				foreach (['large','full'] as $image_size) {
					$url=wp_get_attachment_image_url($image_id,$image_size);
					if ($url) {
						$product_alt_by_url[$url]=$product_alt_by_image[$image_id];
						$product_sizes_by_url[$url]=$product_sizes_by_image[$image_id];
					}
				}
			}
		}
		return preg_replace_callback('/<img\\b[^>]*>/i',static function($match) use ($product_alt_by_image,$product_alt_by_url,$product_sizes_by_image,$product_sizes_by_url) {
			$tag=$match[0];
			if (preg_match('/\\balt=(\\"|\\\')(.*?)\\1/i',$tag,$existing) && trim(html_entity_decode($existing[2],ENT_QUOTES))!=='') return $tag;
			if (!preg_match('/\\bsrc=(\\"|\\\')(.*?)\\1/i',$tag,$source)) return $tag;
			$url=html_entity_decode($source[2],ENT_QUOTES);
			$image_id=attachment_url_to_postid(esc_url_raw($url));
			$alt=$product_alt_by_url[$url] ?? ($product_alt_by_image[$image_id] ?? '');
			if (''===$alt) return $tag;
			$alt=esc_attr($alt);
			if (preg_match('/\\balt=(\\"|\\\').*?\\1/i',$tag)) $tag=preg_replace('/\\balt=(\\"|\\\').*?\\1/i','alt="'.$alt.'"',$tag,1);
			else $tag=preg_replace('/\\s*\\/>$/',' alt="'.$alt.'" />',$tag) ?: str_replace('>',' alt="'.$alt.'">',$tag);
			$sizes=$product_sizes_by_url[$url] ?? ($product_sizes_by_image[$image_id] ?? '');
			if (''!==$sizes && !preg_match('/\\bsizes=/i',$tag)) $tag=preg_replace('/\\s*\\/>$/',' sizes="'.esc_attr($sizes).'" />',$tag) ?: str_replace('>',' sizes="'.esc_attr($sizes).'">',$tag);
			return $tag;
		},$content);
	}
	public static function skip_link() {
		if (is_admin()) return;
		echo '<a class="stykk-skip-link" href="#main-content">Spring til hovedindhold</a>';
	}
	private static function seo_data() {
		$id=(int)get_queried_object_id();
		$pages=[
			81=>['title'=>'STYKK — 3D-printet design med form og funktion','description'=>'Egne idéer og udvalgte designs, skabt med glæde for 3D-print. Find funktionelle STYKK til hjemmet og hverdagen.'],
			123=>['title'=>'Shop STYKK — 3D-printet design til hverdagen','description'=>'Udforsk STYKKs kollektion af 3D-printet boligdesign, tilbehør, figurer og wall art. Se materialer, farver og priser.'],
			228=>['title'=>'Om STYKK — idéer, 3D-print og udvalgte designs','description'=>'Mød STYKK: et personligt univers af 3D-print, egne idéer og udvalgte designs skabt med omtanke.'],
			229=>['title'=>'Kontakt STYKK — spørgsmål og produktinfo','description'=>'Kontakt STYKK om produkter, farver, mål eller en idé. Skriv til admin@stykk.dk, så vender vi tilbage.'],
			230=>['title'=>'Specialdesign — fortæl STYKK om din idé','description'=>'Har du brug for en anden størrelse, særlig funktion eller et design fra bunden? Tal med STYKK om specialdesign.'],
			231=>['title'=>'FAQ — bestilling, betaling og levering | STYKK','description'=>'Læs om STYKKs produkter, bestilling, betaling, fragt og levering. Online bestilling åbner senere; spørgsmål besvares på e-mail.'],
			126=>['title'=>'Kurv | STYKK','description'=>'Gennemgå dine valgte STYKK. Online bestilling og betaling er endnu ikke åbnet.'],
			127=>['title'=>'Kasse | STYKK','description'=>'Bestilling og betaling åbner senere. Kontakt STYKK på admin@stykk.dk, hvis du har spørgsmål.'],
		];
		if (function_exists('is_product') && is_product()) {
			$product=wc_get_product($id); if (!$product) return [];
			$description=wp_strip_all_tags($product->get_short_description() ?: $product->get_description());
			return ['title'=>$product->get_name().' — 3D-printet design | STYKK','description'=>wp_trim_words($description ?: 'Udvalgt 3D-printet design fra STYKK.',28,''),'image'=>$product->get_image_id()?wp_get_attachment_image_url($product->get_image_id(),'large'):'','type'=>'product','product'=>$product];
		}
		if (!isset($pages[$id])) return [];
		$pages[$id]['image']=wp_get_attachment_image_url(83,'large') ?: '';
		$pages[$id]['type']='website';
		return $pages[$id];
	}
	public static function document_title($title) {
		$data=self::seo_data(); return $data['title'] ?? $title;
	}
	public static function robots($robots) {
		if (is_page([126,127])) {
			$robots['noindex']=true;
			unset($robots['index']);
		}
		return $robots;
	}
	public static function sitemap_query_args($args,$post_type) {
		if ('page'===$post_type) {
			$excluded=isset($args['post__not_in'])?(array)$args['post__not_in']:[];
			$args['post__not_in']=array_values(array_unique(array_merge($excluded,[126,127])));
		}
		return $args;
	}
	public static function seo_metadata() {
		$data=self::seo_data(); if (!$data) return;
		$url=wp_get_canonical_url() ?: home_url(add_query_arg([], $GLOBALS['wp']->request ?? ''));
		$image=$data['image'] ?? '';
		printf("\n<meta name=\"description\" content=\"%s\">\n",esc_attr($data['description']));
		printf("<meta property=\"og:type\" content=\"%s\">\n",esc_attr($data['type'] ?? 'website'));
		printf("<meta property=\"og:site_name\" content=\"STYKK\">\n<meta property=\"og:title\" content=\"%s\">\n<meta property=\"og:description\" content=\"%s\">\n<meta property=\"og:url\" content=\"%s\">\n",esc_attr($data['title']),esc_attr($data['description']),esc_url($url));
		if ($image) {
			$image_id=($data['product'] ?? null) instanceof WC_Product ? $data['product']->get_image_id() : 83;
			$image_alt=$image_id?get_post_meta($image_id,'_wp_attachment_image_alt',true):'';
			printf("<meta property=\"og:image\" content=\"%s\">\n<meta property=\"og:image:alt\" content=\"%s\">\n<meta name=\"twitter:card\" content=\"summary_large_image\">\n<meta name=\"twitter:title\" content=\"%s\">\n<meta name=\"twitter:description\" content=\"%s\">\n",esc_url($image),esc_attr($image_alt?:$data['title']),esc_attr($data['title']),esc_attr($data['description']));
		}
		if (($data['product'] ?? null) instanceof WC_Product) {
			$product=$data['product'];
			printf("<meta property=\"product:price:amount\" content=\"%s\">\n<meta property=\"product:price:currency\" content=\"DKK\">\n",esc_attr((string)$product->get_price()));
		}
	}
	public static function variation_note() {
		if (!function_exists('wc_get_product')) return;$p=wc_get_product(get_queried_object_id());if(!$p||!$p->is_type('variable')||!in_array($p->get_sku(),['ST-001','ST-002','ST-003','ST-004','ST-006'],true))return;
		echo '<p class="stykk-variation-status" aria-live="polite">Vælg farve</p>';
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
    $links = ['Shop'=>wc_get_page_permalink('shop'),'Om STYKK'=>get_permalink(228),'Specialdesign'=>get_permalink(230),'Kontakt'=>get_permalink(229),'FAQ'=>get_permalink(231)];
    echo '<header class="stykk-product-header"><a class="stykk-product-brand" href="' . esc_url(home_url('/')) . '" aria-label="STYKK, forside">STYKK</a><nav class="stykk-product-desktop-nav" aria-label="Hovedmenu">';
    foreach ($links as $label=>$url) echo '<a href="' . esc_url($url) . '">' . esc_html($label) . '</a>';
    echo '<a href="' . esc_url(wc_get_cart_url()) . '">Kurv</a></nav><details class="stykk-product-mobile-menu"><summary aria-label="Åbn eller luk mobilmenu" aria-controls="stykk-product-mobile-menu-panel"><span aria-hidden="true">☰</span></summary><nav id="stykk-product-mobile-menu-panel" aria-label="Mobilmenu">';
    foreach ($links as $label=>$url) echo '<a href="' . esc_url($url) . '">' . esc_html($label) . '</a>';
    echo '<a href="' . esc_url(wc_get_cart_url()) . '">Kurv</a></nav></details></header>';
});

add_action('wp_footer', function () {
    if (!function_exists('is_product') || !is_product()) { return; }
    echo '<footer class="stykk-product-footer"><span>3D-print med nysgerrighed og kærlighed.</span><a href="' . esc_url(home_url('/')) . '">STYKK</a><small>© ' . esc_html(gmdate('Y')) . ' STYKK · Ét STYKK ad gangen.</small></footer>';
}, 1);
