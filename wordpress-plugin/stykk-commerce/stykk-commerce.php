<?php
/**
 * Plugin Name: STYKK Commerce
 * Description: WooCommerce-backed catalog data, STYKK shop filters, and native variation color controls.
 * Version: 1.3.29
 * Author: STYKK
 */
if (!defined('ABSPATH')) exit;

final class STYKK_Commerce {
	private const VERSION = '1.3.29';
	private static $current_email_id = '';
	private static $temporary_legal_attachments = [];
	/** Stable Elementor card wrapper => WooCommerce SKU. Never infer from order/name. */
	private static $cards = [
		'290f7a8'=>'ST-001','d1cdec'=>'ST-002','6f3f6d6c'=>'ST-003','5198fbf'=>'ST-004','1a0eab95'=>'ST-005',
		'3ef6b37d'=>'ST-006','3b9ac338'=>'ST-007','78e5b81b'=>'ST-008','4122fd36'=>'ST-009','74134539'=>'ST-010',
		'33d30dba'=>'ST-011','39aa5464'=>'ST-012','7eb74fde'=>'ST-013','4ca25e81'=>'ST-014','2a9ded4a'=>'ST-015',
		'88ccb23'=>'ST-016','2fdde5f4'=>'ST-017','dde82c3'=>'ST-019'
	];
	/** Homepage product cards mapped by stable Elementor card ID => Woo SKU. */
	private static $home_cards = [
		'5b9e0e80'=>'ST-015','a31ff8c'=>'ST-016','77e51ec7'=>'ST-001','4e4c97eb'=>'ST-013',
		'7415fb68'=>'ST-014','10b7a3c9'=>'ST-019','2ac3035f'=>'ST-011','5fc83fba'=>'ST-012'
	];
	public static function boot() {
		remove_action('wp_head','feed_links',2);
		remove_action('wp_head','feed_links_extra',3);
		add_action('wp_enqueue_scripts',[__CLASS__,'enqueue_assets'],20);
		add_action('wp_head',[__CLASS__,'favicon'],1);
		add_action('wp_head',[__CLASS__,'seo_metadata'],2);
		add_filter('pre_get_document_title',[__CLASS__,'document_title']);
		add_filter('wp_get_attachment_image_attributes',[__CLASS__,'attachment_alt'],10,3);
		add_filter('elementor/widget/render_content',[__CLASS__,'elementor_image_alt'],20,2);
		add_filter('wp_robots',[__CLASS__,'robots']);
		add_filter('wp_sitemaps_posts_query_args',[__CLASS__,'sitemap_query_args'],10,2);
		add_action('wp_body_open',[__CLASS__,'skip_link'],1);
		add_action('woocommerce_before_add_to_cart_form',[__CLASS__,'variation_note'],2);
		add_action('wp_footer',[__CLASS__,'legal_footer'],20);
		add_filter('woocommerce_email_from_name',[__CLASS__,'email_from_name']);
		add_filter('woocommerce_email_styles',[__CLASS__,'email_styles'],20,2);
		add_filter('woocommerce_email_footer_text',[__CLASS__,'email_footer_text']);
		add_action('woocommerce_email_header',[__CLASS__,'set_current_email'],1,2);
		add_action('woocommerce_email_footer',[__CLASS__,'clear_current_email'],999,1);
		add_filter('woocommerce_locate_template',[__CLASS__,'email_template'],20,3);
		add_filter('woocommerce_order_item_thumbnail',[__CLASS__,'email_order_item_thumbnail'],20,2);
		add_filter('woocommerce_order_item_name',[__CLASS__,'email_order_item_name'],20,3);
		add_filter('woocommerce_email_recipient_customer_processing_order',[__CLASS__,'acceptance_test_recipient'],20,3);
		add_filter('woocommerce_get_order_item_totals',[__CLASS__,'email_order_totals'],20,3);
		add_filter('woocommerce_email_order_details_heading',[__CLASS__,'email_order_details_heading'],20,3);
		add_filter('woocommerce_email_subject_customer_on_hold_order',[__CLASS__,'receipt_email_subject'],20,3);
		add_filter('woocommerce_email_heading_customer_on_hold_order',[__CLASS__,'receipt_email_heading'],20,3);
		add_filter('woocommerce_email_additional_content_customer_on_hold_order',[__CLASS__,'receipt_email_content'],20,3);
		add_filter('woocommerce_email_subject_customer_processing_order',[__CLASS__,'acceptance_email_subject'],20,3);
		add_filter('woocommerce_email_heading_customer_processing_order',[__CLASS__,'acceptance_email_heading'],20,3);
		add_filter('woocommerce_email_additional_content_customer_processing_order',[__CLASS__,'acceptance_email_content'],20,3);
		add_filter('woocommerce_email_attachments',[__CLASS__,'acceptance_legal_attachments'],20,4);
		add_filter('woocommerce_email_additional_content_new_order',[__CLASS__,'admin_order_email_content'],20,3);
		add_action('wp_mail_succeeded',[__CLASS__,'cleanup_mail_attachments']);
		add_action('wp_mail_failed',[__CLASS__,'cleanup_mail_attachments']);
		add_filter('the_content',[__CLASS__,'checkout_closed_content'],99);
	}
	public static function email_from_name($name) { return 'STYKK'; }
	public static function set_current_email($heading,$email) {
		self::$current_email_id = is_object($email) && isset($email->id) ? (string)$email->id : '';
		if ('customer_processing_order'===self::$current_email_id) add_filter('pre_option_date_format',[__CLASS__,'email_date_format'],99,3);
	}
	public static function email_date_format($pre,$option=null,$default=null) { return 'j. F Y'; }
	public static function clear_current_email($email=null) {
		remove_filter('pre_option_date_format',[__CLASS__,'email_date_format'],99);
		self::$current_email_id='';
	}
	public static function email_styles($css,$email=null) {
		return $css . "\nbody, #outer_wrapper { background-color:#f1efe8 !important; color:#252923 !important; }\n" .
			"#wrapper, #template_container, #template_body, #body_content { background-color:#fbfaf6 !important; }\n" .
			"#template_header, #header_wrapper { background-color:#fbfaf6 !important; }\n" .
			"#template_header h1 { color:#252923 !important; font-family:Helvetica,Arial,sans-serif !important; font-weight:500 !important; letter-spacing:-.4px; }\n" .
			"#template_header_image .email-logo-text { color:#252923 !important; font-family:Helvetica,Arial,sans-serif !important; font-size:28px !important; font-weight:700 !important; letter-spacing:2px !important; margin:0 0 20px !important; text-align:left !important; }\n" .
			"#template_header_image .email-logo-text a { color:#252923 !important; }\n" .
			"body, #body_content, #body_content_inner { color:#252923 !important; font-family:Helvetica,Arial,sans-serif !important; }\n" .
			"a, .link { color:#414a36 !important; }\n" .
			"#template_footer, #template_footer td { background-color:#fbfaf6 !important; color:#64655b !important; }\n" .
			".stykk-email-section { border-top:1px solid #dedbd1; margin-top:24px; padding-top:18px; }\n" .
			".stykk-email-section h2 { color:#252923 !important; font-size:16px !important; font-weight:600 !important; line-height:1.35 !important; margin:0 0 8px !important; }\n" .
			".stykk-email-legal { font-size:13px !important; }\n" .
			".stykk-email-legal a { text-decoration:underline !important; }\n" .
			"table.td, table.order_items, table.order-totals { border:0 !important; border-collapse:collapse !important; }\n" .
			".order_item td, .order_item th, tr.order-totals th, tr.order-totals td { border-left:0 !important; border-right:0 !important; border-color:#dedbd1 !important; }\n" .
			".order-totals-last th, .order-totals-last td { color:#252923 !important; font-size:17px !important; font-weight:700 !important; }\n" .
			".email-order-item-thumbnail img { display:block !important; width:96px !important; height:auto !important; max-width:96px !important; }\n" .
			"#addresses .address { color:#252923 !important; font-size:14px !important; font-style:normal !important; line-height:1.55 !important; }\n" .
			"@media screen and (max-width:600px) { #wrapper { width:100% !important; } #body_content_inner_cell { padding:18px !important; } #template_header_image .email-logo-text { font-size:25px !important; } }\n";
	}
	public static function email_footer_text($text) {
		return 'STYKK - Design<br>CVR 41693908<br><a href="mailto:support@stykk.dk">support@stykk.dk</a><br><span style="font-size:11px;color:#85867d"><a href="' . esc_url(get_permalink(303)) . '" style="color:#77786f;text-decoration:none">Handelsbetingelser</a> &nbsp;·&nbsp; <a href="' . esc_url(get_permalink(129)) . '" style="color:#77786f;text-decoration:none">Fortrydelse &amp; retur</a> &nbsp;·&nbsp; <a href="' . esc_url(get_permalink(304)) . '" style="color:#77786f;text-decoration:none">Privatlivspolitik</a></span>';
	}
	public static function receipt_email_subject($subject,$order=null,$email=null) {
		return $order instanceof WC_Order ? 'Vi har modtaget din bestilling – ordre #' . $order->get_order_number() : 'Vi har modtaget din bestilling';
	}
	public static function receipt_email_heading($heading,$order=null,$email=null) { return 'Vi har modtaget din bestilling'; }
	public static function receipt_email_content($content,$order=null,$email=null) {
		$notice = 'Dette er alene en kvittering for, at STYKK har modtaget din bestilling. Bestillingen er endnu ikke accepteret, og købsaftalen er ikke bindende. Aftalen bliver først bindende, når STYKK sender en ordrebekræftelse, der accepterer bestillingen.';
		return trim($notice . "\n\n" . (string)$content);
	}
	public static function acceptance_email_subject($subject,$order=null,$email=null) {
		return $order instanceof WC_Order ? 'Ordrebekræftelse – ordre #' . $order->get_order_number() . ' | STYKK' : 'Ordrebekræftelse | STYKK';
	}
	public static function acceptance_email_heading($heading,$order=null,$email=null) { return 'Din bestilling er accepteret'; }
	public static function acceptance_email_content($content,$order=null,$email=null) {
		return '';
	}
	public static function email_template($template,$template_name,$template_path) {
		$templates=[
			'emails/customer-processing-order.php'=>'templates/emails/customer-processing-order.php',
			'emails/plain/customer-processing-order.php'=>'templates/emails/plain/customer-processing-order.php',
		];
		if (!isset($templates[$template_name])) return $template;
		$custom=plugin_dir_path(__FILE__).$templates[$template_name];
		return is_readable($custom) ? $custom : $template;
	}
	public static function email_order_details_heading($heading,$order=null,$email=null) {
		return 'customer_processing_order'===self::$current_email_id ? '' : $heading;
	}
	public static function email_order_item_thumbnail($image,$item) {
		if ('customer_processing_order'!==self::$current_email_id || !($item instanceof WC_Order_Item_Product)) return $image;
		$product=wc_get_product($item->get_variation_id());
		$parent=wc_get_product($item->get_product_id());
		$image_id=$product && $product->get_image_id() ? $product->get_image_id() : 0;
		if (!$image_id && $parent && $parent->get_image_id()) $image_id=$parent->get_image_id();
		if (!$image_id) $image_id=(int)get_post_thumbnail_id($item->get_product_id());
		if (!$image_id) return $image;
		$url=wp_get_attachment_image_url($image_id,'woocommerce_thumbnail');
		if (!$url) $url=wp_get_attachment_image_url($image_id,'full');
		if (!$url) return $image;
		$url=set_url_scheme($url,'https');
		$alt=trim((string)get_post_meta($image_id,'_wp_attachment_image_alt',true));
		if (''===$alt) $alt=$item->get_name();
		$image='<img src="'.esc_url($url).'" width="96" height="96" alt="'.esc_attr($alt).'" style="display:block;width:96px;height:auto;max-width:96px;border:0;outline:none;text-decoration:none;" />';
		$product_url=set_url_scheme(get_permalink($item->get_product_id()),'https');
		return $product_url ? '<a href="'.esc_url($product_url).'" style="display:inline-block;text-decoration:none;">'.$image.'</a>' : $image;
	}
	public static function email_order_item_name($name,$item,$link=null) {
		if ('customer_processing_order'!==self::$current_email_id || !($item instanceof WC_Order_Item_Product)) return $name;
		$product_url=set_url_scheme(get_permalink($item->get_product_id()),'https');
		return $product_url ? '<a href="'.esc_url($product_url).'" style="color:#252923;text-decoration:underline;">'.wp_kses_post($name).'</a>' : $name;
	}
	public static function acceptance_test_recipient($recipient,$order=null,$email=null) {
		if (!($order instanceof WC_Order) || !$order->get_meta('_stykk_email_qa_additional_recipient')) return $recipient;
		$recipients=array_filter(array_map('trim',explode(',',(string)$recipient)));
		$recipients[]='magnusn8990@gmail.com';
		return implode(', ',array_unique($recipients));
	}
	public static function email_order_totals($totals,$order=null,$tax_display=null) {
		if ('customer_processing_order' !== self::$current_email_id || !is_array($totals)) return $totals;
		if (isset($totals['shipping'])) {
			$totals['shipping']['label']='Fragt (Danmark):';
			unset($totals['shipping']['meta']);
		}
		unset($totals['tax']);
		return $totals;
	}
	public static function render_customer_email_addresses($order) {
		if (!($order instanceof WC_Order)) return '';
		$shipping=trim((string)$order->get_formatted_shipping_address());
		$billing=trim((string)$order->get_formatted_billing_address());
		$primary=$shipping ?: $billing;
		$html='<table class="stykk-email-section" width="100%" role="presentation" cellspacing="0" cellpadding="0" border="0"><tr><td><h2>Leveringsadresse</h2>';
		$html.='<p style="margin:0;line-height:1.55">'.($primary ? wp_kses_post($primary) : '—').'</p>';
		$phone=$order->get_shipping_phone() ?: $order->get_billing_phone();
		if ($phone) $html.='<p style="margin:5px 0 0">'.esc_html($phone).'</p>';
		if ($order->get_billing_email()) $html.='<p style="margin:2px 0 0"><a href="mailto:'.esc_attr($order->get_billing_email()).'">'.esc_html($order->get_billing_email()).'</a></p>';
		if ($billing && $shipping && wp_strip_all_tags($billing)!==wp_strip_all_tags($shipping)) {
			$html.='<p style="margin:12px 0 0;color:#64655b;font-size:13px"><strong>Faktureringsadresse</strong><br>'.wp_kses_post($billing).'</p>';
		}
		return $html.'</td></tr></table>';
	}
	public static function acceptance_legal_attachments($attachments,$email_id,$order=null,$email=null) {
		if ('customer_processing_order' !== $email_id || !$order instanceof WC_Order) return $attachments;
		$source = plugin_dir_path(__FILE__) . 'assets/pdf/STYKK - Ordrevilkår og fortrydelse.pdf';
		if (!is_readable($source)) return $attachments;
		$temp_dir = trailingslashit(get_temp_dir()) . 'stykk-order-' . absint($order->get_id()) . '-' . wp_generate_password(8,false,false);
		if (!wp_mkdir_p($temp_dir)) return $attachments;
		@chmod($temp_dir,0700);
		$file = trailingslashit($temp_dir) . 'STYKK – Ordrevilkår og fortrydelse.pdf';
		if (!@copy($source,$file)) {
			@rmdir($temp_dir);
			return $attachments;
		}
		@chmod($file,0600);
		self::$temporary_legal_attachments[] = $file;
		$attachments[] = $file;
		return $attachments;
	}
	public static function cleanup_mail_attachments($mail_data=null) {
		$sent_attachments = is_array($mail_data) && isset($mail_data['attachments']) ? (array)$mail_data['attachments'] : [];
		foreach (self::$temporary_legal_attachments as $index=>$file) {
			if (!$sent_attachments || in_array($file,$sent_attachments,true)) {
				if (file_exists($file)) unlink($file);
				@rmdir(dirname($file));
				unset(self::$temporary_legal_attachments[$index]);
			}
		}
	}
	public static function admin_order_email_content($content,$order=null,$email=null) {
		if (!$order instanceof WC_Order) return $content;
		$details = 'Ordre #' . $order->get_order_number() . ' · Status: ' . wc_get_order_status_name($order->get_status());
		$note = trim((string)$order->get_customer_note());
		if ($note !== '') $details .= "\nKundebemærkning: " . $note;
		return trim($details . "\n\n" . (string)$content);
	}
	public static function checkout_closed_content($content) {
		if (is_admin() || !is_page(127) || apply_filters('stykk_checkout_open',false)) return $content;
		return '<section class="stykk-checkout-closed" aria-labelledby="stykk-checkout-closed-title"><p class="stykk-eyebrow">STYKK · Kasse</p><h2 id="stykk-checkout-closed-title">Online betaling åbner snart</h2><p>Vi har endnu ikke åbnet for online bestilling og betaling. Du kan stadig se dine varer i kurven. Vi modtager ikke en ordre via denne side endnu.</p><div class="stykk-checkout-closed-actions"><a class="stykk-checkout-button" href="' . esc_url(wc_get_cart_url()) . '">Tilbage til kurven</a><a href="' . esc_url(wc_get_page_permalink('shop')) . '">Fortsæt til shoppen</a></div><p>Har du spørgsmål? Skriv til <a href="mailto:support@stykk.dk">support@stykk.dk</a>.</p><nav aria-label="Juridiske oplysninger"><a href="' . esc_url(get_permalink(303)) . '">Handelsbetingelser</a><a href="' . esc_url(get_permalink(304)) . '">Privatlivspolitik</a><a href="' . esc_url(get_permalink(129)) . '">Fortrydelse og retur</a></nav></section>';
	}
	public static function legal_footer() {
		if (is_admin()) return;
		$links = [
			'Handelsbetingelser' => get_permalink(303),
			'Privatlivspolitik' => get_permalink(304),
			'Fortrydelse og retur' => get_permalink(129),
		];
		echo '<div class="stykk-legal-footer"><nav aria-label="Juridiske oplysninger">';
		foreach ($links as $label => $url) {
			if ($url) echo '<a href="' . esc_url($url) . '">' . esc_html($label) . '</a>';
		}
		echo '</nav></div>';
	}
	private static function shop_page() { return is_page(123) || (function_exists('is_shop') && is_shop()); }
	private static function product_card_data($cards) {
		if (!function_exists('wc_get_product')) return [];
		$products=[];
		foreach($cards as $element=>$sku) {
			$p=wc_get_product(wc_get_product_id_by_sku($sku)); if (!$p || !$p->is_visible()) continue;
			$terms=wp_get_post_terms($p->get_id(),'product_cat',['fields'=>'slugs']);
			$term_names=wp_get_post_terms($p->get_id(),'product_cat',['fields'=>'names']);
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
			'categories'=>is_wp_error($terms)?[]:$terms,
			'categoryLabel'=>!is_wp_error($term_names)&&$term_names?reset($term_names):'',
			'type'=>$p->get_type(),'rank'=>$rank?:99,'featured'=>$featured,'new'=>$is_new];
		}
		return $products;
	}
	private static function catalog_data() { return self::shop_page() ? self::product_card_data(self::$cards) : []; }
	public static function enqueue_assets() {
		if (is_admin()) return;
		$base=plugin_dir_url(__FILE__);
		wp_enqueue_style('stykk-site',$base.'assets/css/site.css',[],self::VERSION);
		wp_enqueue_script('stykk-site',$base.'assets/js/site.js',[],self::VERSION,true);
		if (is_front_page()) {
			wp_enqueue_script('stykk-home',$base.'assets/js/home.js',['stykk-site'],self::VERSION,true);
			wp_add_inline_script('stykk-site','window.STYKKHomeCatalog='.wp_json_encode(self::product_card_data(self::$home_cards),JSON_HEX_TAG|JSON_HEX_AMP|JSON_HEX_APOS|JSON_HEX_QUOT).';','before');
		}
		if (self::shop_page()) {
			wp_enqueue_style('stykk-shop',$base.'assets/css/shop.css',['stykk-site'],self::VERSION);
			wp_enqueue_script('stykk-shop',$base.'assets/js/shop.js',['stykk-site'],self::VERSION,true);
			wp_add_inline_script('stykk-shop','window.STYKKCatalog='.wp_json_encode(self::catalog_data(),JSON_HEX_TAG|JSON_HEX_AMP|JSON_HEX_APOS|JSON_HEX_QUOT).';','before');
		}
		if (function_exists('is_product') && is_product()) {
			wp_enqueue_style('stykk-product',$base.'assets/css/product.css',['stykk-site'],self::VERSION);
			wp_enqueue_script('stykk-product',$base.'assets/js/product.js',['jquery','stykk-site'],self::VERSION,true);
			wp_enqueue_script('stykk-summary-fixed',$base.'assets/js/summary-fixed.js',['stykk-site'],self::VERSION,true);
		}
		if ((function_exists('is_cart') && is_cart()) || (function_exists('is_checkout') && is_checkout())) {
			wp_enqueue_style('stykk-commerce',$base.'assets/css/commerce.css',['stykk-site'],self::VERSION);
		}
	}
	public static function favicon() {
		printf('<link rel="icon" href="%s" type="image/svg+xml" sizes="any">' . "\n", esc_url(plugins_url('assets/favicon.svg',__FILE__)));
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
			229=>['title'=>'Kontakt STYKK — spørgsmål og produktinfo','description'=>'Kontakt STYKK om produkter, farver, mål eller en idé. Skriv til support@stykk.dk, så vender vi tilbage.'],
			230=>['title'=>'Specialdesign — fortæl STYKK om din idé','description'=>'Har du brug for en anden størrelse, særlig funktion eller et design fra bunden? Tal med STYKK om specialdesign.'],
			231=>['title'=>'FAQ — bestilling, betaling og levering | STYKK','description'=>'Læs om STYKKs produkter, bestilling, betaling, fragt og levering. Online bestilling åbner senere; spørgsmål besvares på e-mail.'],
			126=>['title'=>'Kurv | STYKK','description'=>'Gennemgå dine valgte STYKK. Online bestilling og betaling er endnu ikke åbnet.'],
			127=>['title'=>'Kasse | STYKK','description'=>'Bestilling og betaling åbner senere. Kontakt STYKK på support@stykk.dk, hvis du har spørgsmål.'],
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
        echo '<details><summary>Bestilling &amp; levering</summary><p>De fleste produkter printes efter bestilling. Ved levering i Danmark koster fragten 42 DKK pr. ordre, uanset antal varer. Online bestilling og betaling er endnu ikke åbnet.</p></details>';
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
    // Render related items after content-single-product closes so sticky summary is
    // bounded by the main product detail wrapper, not by the related-products area.
    add_action('woocommerce_after_single_product', 'stykk_related_products', 20);
});
add_action('wp_body_open', function () {
    $is_product = function_exists('is_product') && is_product();
    $is_cart = function_exists('is_cart') && is_cart();
    $is_checkout = function_exists('is_checkout') && is_checkout();
    if (!$is_product && !$is_cart && !$is_checkout) { return; }
    $links = ['Shop'=>wc_get_page_permalink('shop'),'Om STYKK'=>get_permalink(228),'Specialdesign'=>get_permalink(230),'Kontakt'=>get_permalink(229),'FAQ'=>get_permalink(231)];
    echo '<header class="stykk-product-header"><a class="stykk-product-brand" href="' . esc_url(home_url('/')) . '" aria-label="STYKK, forside">STYKK</a><nav class="stykk-product-desktop-nav" aria-label="Hovedmenu">';
    foreach ($links as $label=>$url) echo '<a href="' . esc_url($url) . '">' . esc_html($label) . '</a>';
    echo '<a href="' . esc_url(wc_get_cart_url()) . '">Kurv</a></nav><details class="stykk-product-mobile-menu"><summary aria-label="Åbn eller luk mobilmenu" aria-controls="stykk-product-mobile-menu-panel"><span aria-hidden="true">☰</span></summary><nav id="stykk-product-mobile-menu-panel" aria-label="Mobilmenu">';
    foreach ($links as $label=>$url) echo '<a href="' . esc_url($url) . '">' . esc_html($label) . '</a>';
    echo '<a href="' . esc_url(wc_get_cart_url()) . '">Kurv</a></nav></details></header>';
});

add_action('wp_footer', function () {
    $is_product = function_exists('is_product') && is_product();
    $is_cart = function_exists('is_cart') && is_cart();
    $is_checkout = function_exists('is_checkout') && is_checkout();
    if ($is_product) {
        echo '<footer class="stykk-product-footer"><span>3D-print med nysgerrighed og kærlighed.</span><a href="' . esc_url(home_url('/')) . '">STYKK</a><small>© ' . esc_html(gmdate('Y')) . ' STYKK · Ét STYKK ad gangen.</small></footer>';
    } elseif ($is_cart || $is_checkout) {
        echo '<footer class="stykk-commerce-footer"><a class="stykk-commerce-footer-brand" href="' . esc_url(home_url('/')) . '">STYKK</a><nav aria-label="Footer navigation"><a href="' . esc_url(wc_get_page_permalink('shop')) . '">Shop</a><a href="' . esc_url(get_permalink(231)) . '">FAQ</a><a href="' . esc_url(get_permalink(229)) . '">Kontakt</a></nav><small>© ' . esc_html(gmdate('Y')) . ' STYKK · Ét STYKK ad gangen.</small></footer>';
    }
}, 1);
