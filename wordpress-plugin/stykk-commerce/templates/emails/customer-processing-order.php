<?php
/**
 * STYKK customer order acceptance email.
 * Keeps WooCommerce's native order rows/totals while presenting a concise STYKK layout.
 */
defined( 'ABSPATH' ) || exit;

do_action( 'woocommerce_email_header', $email_heading, $email );
?>
<table class="stykk-email-introduction" width="100%" role="presentation" cellspacing="0" cellpadding="0" border="0">
	<tr><td>
		<p style="margin:0 0 10px;">Hej <?php echo esc_html( $order->get_billing_first_name() ?: 'der' ); ?>,</p>
		<p style="margin:0 0 22px;">Tak for din bestilling. Vi har nu accepteret ordre #<?php echo esc_html( $order->get_order_number() ); ?> og går i gang med at gøre den klar til dig.</p>
	</td></tr>
</table>

<?php
do_action( 'woocommerce_email_order_details', $order, $sent_to_admin, $plain_text, $email );
do_action( 'woocommerce_email_order_meta', $order, $sent_to_admin, $plain_text, $email );
?>

<table class="stykk-email-section" width="100%" role="presentation" cellspacing="0" cellpadding="0" border="0">
	<tr><td>
		<h2>Levering</h2>
		<p style="margin:0;">Forventet levering: 3–7 hverdage.</p>
	</td></tr>
</table>

<?php echo STYKK_Commerce::render_customer_email_addresses( $order ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>

<table class="stykk-email-section stykk-email-support" width="100%" role="presentation" cellspacing="0" cellpadding="0" border="0">
	<tr><td>
		<h2>Har du brug for hjælp?</h2>
		<p style="margin:0 0 8px;">Har du spørgsmål til din ordre, levering, retur eller noget helt andet, er du altid velkommen til at kontakte os.</p>
		<p style="margin:0 0 14px;">Skriv til <a href="mailto:support@stykk.dk">support@stykk.dk</a>.</p>
		<p style="margin:0;">De bedste hilsner,<br><strong>STYKK</strong></p>
	</td></tr>
</table>

<?php do_action( 'woocommerce_email_footer', $email ); ?>
