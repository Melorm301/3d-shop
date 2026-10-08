<?php
/** STYKK plain-text customer acceptance email. */
defined( 'ABSPATH' ) || exit;

echo wp_strip_all_tags( $email_heading ) . "\n\n";
printf( "Hej %s,\n\n", $order->get_billing_first_name() ?: 'der' );
printf( "Tak for din bestilling. Vi har nu accepteret ordre #%s og går i gang med at gøre den klar til dig.\n\n", $order->get_order_number() );
do_action( 'woocommerce_email_order_details', $order, $sent_to_admin, true, $email );
do_action( 'woocommerce_email_order_meta', $order, $sent_to_admin, true, $email );
echo "Levering\nForventet levering: 3–7 hverdage.\n\n";
$shipping = trim( (string) $order->get_formatted_shipping_address() );
$billing  = trim( (string) $order->get_formatted_billing_address() );
echo "Leveringsadresse\n" . wp_strip_all_tags( $shipping ?: $billing ) . "\n";
if ( $order->get_shipping_phone() ?: $order->get_billing_phone() ) {
	echo ( $order->get_shipping_phone() ?: $order->get_billing_phone() ) . "\n";
}
if ( $order->get_billing_email() ) echo $order->get_billing_email() . "\n";
if ( $billing && $shipping && wp_strip_all_tags( $billing ) !== wp_strip_all_tags( $shipping ) ) {
	echo "\nFaktureringsadresse\n" . wp_strip_all_tags( $billing ) . "\n";
}
echo "\nHar du brug for hjælp?\n";
echo "Har du spørgsmål til din ordre, levering, retur eller noget helt andet, er du altid velkommen til at kontakte os.\n";
echo "Skriv til support@stykk.dk.\n\n";
echo "De bedste hilsner,\nSTYKK\n\n";
echo "STYKK – Design\nCVR 41693908\nsupport@stykk.dk\n";
echo 'Handelsbetingelser: ' . get_permalink( 303 ) . "\n";
echo 'Fortrydelse & retur: ' . get_permalink( 129 ) . "\n";
echo 'Privatlivspolitik: ' . get_permalink( 304 ) . "\n";
