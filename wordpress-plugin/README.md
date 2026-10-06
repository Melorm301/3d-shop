# STYKK Commerce

Version-controlled WordPress/WooCommerce integration for stykk.dk. WooCommerce remains the product record source; product cards read names, prices, short descriptions, images, category slugs, canonical permalinks, and variable-product state from Woo records.

The shop preserves Page 123's Elementor card design. `STYKK_Commerce::$cards` is a stable Elementor-wrapper-ID to Woo SKU map; cards are never matched by order or display name. Featured/new ordering metadata is stored on Woo products as `_stykk_featured`, `_stykk_featured_rank`, `_stykk_is_new`, and `_stykk_estimated_price`.

Single-product presentation formerly deployed as snippet 222 is included in `stykk-commerce.php`. Color chips update the native Woo variation select, dispatch its change event, and allow WooCommerce to resolve the selected `variation_id`. Snippets 221 and 222 remain as no-op rollback stubs; their previous source is preserved under the timestamped `backups/stykk-p1-final-*` folder.

Deployment path: `wp-content/plugins/stykk-commerce/stykk-commerce.php`. Requires WooCommerce and Elementor. No payment gateway is enabled by this plugin.
