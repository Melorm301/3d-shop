# Audit før STYKK-redesign · 3. oktober 2026

Repository var rent ved start. Baseline: 11/11 Node-tests bestod.

## Arkitektur og det der bevares
Ren statisk HTML/CSS/JavaScript; syv sider, fælles CSS og separate moduler til data, katalog, galleri, UI og kurv. Ingen package.json, framework, compile-, lint- eller typecheck-pipeline. Produkt-ID'er, SKU'er, otte priser, billedfiler og eksisterende kurve bevares. native dialog, fokusstyring, søgning, sortering, filtre, billednavigation, lysboks, varianter, antal og formularvalidering videreføres.

Checkout er en manuel Telegram-forespørgsel, uden betalingsserver. Kontakt er også en kladde, som kunden selv sender. CVR 41693908 og GitHub Pages-URL stammer fra repoet. Telegram @test er en eksisterende placeholder, som kræver en rigtig kontakt før lancering.

## Det der ændres
NordForm-branding på alle sider, metadata og JS-globals. Forsidens pen-holder-hero, dekorative lagillustrationer, orange accentfelter og gentagen maker-copy erstattes af STYKK-typografi, kuraterede billeder og en rolig designfortælling. En egentlig Om-side tilføjes. Produktnavne og danske beskrivelser omarbejdes uden ændringer i kapacitet eller pris. Collections udvides omkring det nye materiale; gamle collection-URLs understøttes fortsat.

## Billedaudit
Alle ni WebP-billeder er visuelt gennemgået: vægknage, bueknage, knage over dør, poseclip, mobil-/skærmholder, dekorative gevirfigurer, spøgelsesfigur, en beslægtet bueknage samt QR-holder. Fotoet med QR-holder har indbrændt Customize/WiFi/3D PRINTABLE-grafik og fravælges. De to bueknagebilleder bruges på samme design. Der er ingen dokumenterede priser, belastningsgrænser, mål, variant-SKU'er eller produktspecifikke materialer for disse designs. De vises som forespørgselsprodukter, uden fiktive priser eller købsknapper. Billederne erstatter ikke billeder af de eksisterende varer.

## Næste kontrol
Regression af kurv og manuel ordre, quote-produkt uden køb, katalogfiltre, produktgalleri, formular, mobile dialoger, reduced motion, layout, links, metadata og lokale assetreferencer.

## Ændret scope efter ejerens instruktion
Ejeren bad efter audit udtrykkeligt om at fjerne hele det gamle sortiment og de gamle priser og anvende cirka-priser for de nye designs. Syv nye produkter erstatter derfor de otte tidligere varer. Priser er vejledende, gamle kurvposter afvises sikkert, og der hævdes ingen dokumenterede tekniske specifikationer.
