# STYKK · Redesignrapport

Implementeret i `/Users/magnus/Documents/GitHub/3d-shop` den 3. oktober 2026.

## Designretning

En varm, rolig identitet med papirfarvede flader, mørk kul/grøn kontrast og en afdæmpet oliventone. STYKK står som en ren typografisk wordmark. Den stramme sans-serif kombineres med enkelte kursiverede seriford, især »omtanke«, som en gennemgående detalje. Systemfonte undgår downloads og afhængighed af en fonttjeneste.

Forsiden er bygget om fra bunden: Bue-knagen i et stort fotografisk hero, et forskudt udvalg af Rib/Bue-knager, en markant typografisk filosofi, en billedsektion med Tak-objekterne, en kort fortælling om fremstilling, specialdesign og personlig kontakt. De nummererede sektioner og forskudte billedformater giver siden sin egen rytme. Produktbilleder og funktioner bærer præsentationen; 3D-print forklares i produkt- og produktionsinformationen.

Mobilen har eget hero-flow, tilpassede billedproportioner, enkel fuldskærmsmenu, mindre typografi og en købsknap, der følger med, når produktets primære købskontrol er passeret. Motion er begrænset til let scroll-reveal, produkt-hover, billedskift og dialoger. Reduced motion slår animationer og transitions fra.

## Nyt sortiment

På ejerens efterfølgende instruktion er alle otte tidligere varer, deres priser og de gamle billedassets fjernet. Git-historikken bevarer det tidligere materiale. Ingen billeder af andre produkter bruges som erstatninger på gamle varer. Fem nye produkter fra billedmappen er siden tilføjet. STYKK-kataloget har nu 12 produkter.

| STYKK | Kategori | Vejledende pris pr. stk. |
| --- | --- | ---: |
| Rib / vægknage | Bolig | ca. 89 DKK |
| Bue / knage | Bolig | ca. 109 DKK |
| Rib / dørknage | Bolig | ca. 129 DKK |
| Klem / poseclip | Tilbehør | ca. 39 DKK |
| Skrå / holder | Tilbehør | ca. 79 DKK |
| Tak / objekt | Objekter | ca. 119 DKK |
| Svøb / figur | Objekter | ca. 89 DKK |
| Sno / flexifigur | Legetøj | ca. 49 DKK pr. figur |
| Krible / flexifigur | Legetøj | ca. 29 DKK pr. figur |
| Juletryk / kageform | Køkken | ca. 79 DKK pr. form |
| Punkt / mobilholder | Tilbehør | ca. 79 DKK pr. holder |
| Fold / mobilholder | Tilbehør | ca. 69 DKK pr. holder |

Priserne er lavet til redesignet som ønsket. De vises som cirka-priser og bekræftes i det manuelle ordreflow. Produktbeskrivelserne tager udgangspunkt i det synlige design og forklarer anvendelsen uden at opfinde mål, belastning, certificeringer, materialetyper eller lagerstatus. Farveønsker er baseret på billedmaterialet. Relaterede produkter prioriterer samme kategori.

## Billedmateriale

Alle ni tidligere billeder og de fem nyligt tilføjede billeder er gennemgået visuelt. De nye fem er kopieret ind i `images/stykk/` og har lokale responsive versioner på 480 og 960 px. Alle billeder ligger lokalt som WebP; der er ingen runtime-referencer til Desktop-mappen.

| Original fil | Lokal fil / brug |
| --- | --- |
| `2025-12-17_3396ce88626c58.webp` | `rib-vaeg.webp` · udvalgt produkt, shop, produktside |
| `2026-01-19_6be22053de21c8.webp` | `bue-knage.webp` · hero, Open Graph, shop, produktside |
| `2025-11-27_ea4e1ac2bd5808.webp` | `bue-knage-02.webp` · sekundært billede, galleri og hover |
| `2025-12-26_bcf9c97de89d8.webp` | `rib-doer.webp` · udvalgt produkt og Om STYKK |
| `90e8ad5362218437.webp` | `klem-clip.webp` · shop og produktside |
| `2025-11-09_bfe802a67d7dd.webp` | `skra-holder.webp` · shop og produktside |
| `2025-11-16_c540fbdd15f248.webp` | `tak-objekt.webp` · editorial-sektion, shop og produktside |
| `f71d36a3cf962f45.webp` | `svoeb-figur.webp` · shop og produktside |
| `2025-11-13_32e322732f9b5.webp` | `sno-flexifigur.webp` · nye Nyheder-sektion, shop og produktside |
| `dc148145f1ca4664.webp` | `krible-flexifigur.webp` · Nyheder, shop og produktside |
| `2025-11-02_732eec4bba7288.webp` | `juletryk-kageform.webp` · Nyheder, Køkken og produktside |
| `d0d76cc34fe73e53.webp` | `punkt-mobilholder.webp` · Nyheder, Tilbehør og produktside |
| `9ec3dc30d689d092.webp` | `fold-mobilholder.webp` · Nyheder, Tilbehør og produktside |
| `f08944412e2e6760.webp` | Fravalgt: indbrændt Customize/WiFi/3D PRINTABLE-reklamegrafik passer ikke til STYKK |

## Komponenter og indhold

- Ny forside, kollektionsside og selvstændig `about.html`.
- Ny wordmark, favicon og webmanifest; fælles STYKK-header/footer og mobilmenu.
- Produktdatasæt med navne, kategorier, billeder, billedbeskrivelser, vejledende priser, pris pr. enhed og farveønsker.
- Nyhedsfilter i shoppen og en femprodukters nyhedssektion på forsiden.
- Produktkort med rene billedflader og variantvalg, hvor flere farver vises.
- Produktvisning med stort galleri, keyboard-navigation, lysboks, variant-/antalvalg og sektionerne Om produktet, Materiale & detaljer, Fremstilling og Bestilling & levering.
- Kontaktformular kan åbnes med produktforespørgsel udfyldt. Den tilhørende PDP-link sender produktets ID med.
- Ordretekster, kundevendte tekster, metadata, strukturerede data og sitemap er opdateret til STYKK.

Den gamle orange identitet, laglogo, CSS-lagillustration, pen-holder-hero, gamle kategorier og maker-orienterede tekster er fjernet. Det gamle sortiment og billedlager indgår ikke længere i butikken.

## Bevidst bevaret

Den statiske arkitektur, native dialoger og kurvens funktioner er videreført. Der er ikke installeret nye biblioteker. Varianter, lagerfejl, antalbegrænsning, håndtering af beskadiget lagring, synkronisering mellem faner og kopiering af ordretekst fungerer fortsat.

Checkout er fortsat en manuel Telegram-forespørgsel. Ingen betalings- eller lagerfunktion er opfundet. CVR 41693908 og den eksisterende GitHub Pages-base-URL er bevaret fra repoet. Telegram-kontakten er stadig @test, fordi materialet ikke oplyser en rigtig kontakt.

Den interne nøgle `nordform.cart.v1` er bevaret, så tidligere browserdata håndteres sikkert. Udgåede produkt-ID'er afvises. Gammel branding optræder kun i denne migrationsdetalje, regressionstesten for udgåede varer og den historiske audit; ingen kundevendt gammel branding er tilbage. Produkt-URLs fra det gamle sortiment viser en forståelig »produkt ikke fundet«-side med vej tilbage til shoppen.

## Kontrolresultater

- Baseline før ændringer: 11/11 tests bestod. Efter redesign: 12/12 tests består.
- `node --test tests/*.test.cjs`: kurv, priser, varianter, antal, fjernelse, lagring, synkronisering, udgåede produkter, links, fragmenter, billedfiler, metadata og JavaScript-syntaks.
- `node scripts/render-catalog.cjs`: statisk HTML opdateret fra de nye produktdata.
- Billedforberedelse kørt; alle responsive kilder findes lokalt.
- `git diff --check`: ingen whitespace-fejl.
- Browser: otte sider ved 320, 390, 768, 1024 og 1440 px, i alt 40 layoutkontroller. Én synlig H1 pr. side og ingen vandret overflow.
- Visuel kontrol af desktop- og mobilforside, hele forsiden, Om STYKK, kollektion, produktvisning og editorial-billedsektion.
- Browserinteraktioner: kollektion, kategori, søgning, tomt søgeresultat/reset, prissortering, galleri, lysboks/Escape, farvevalg, antal, købsknap og separat kurvrække for samme produkt i to farver.
- Kurv: antal op/ned, fjernelse, persistens mellem sider, tom kurv, mobil købsknap og tom checkout.
- Checkout: vejledende varetotal, bemærkning, korrekt STYKK-ordretekst og kopiering. Ingen Telegram-ordre er sendt.
- Kontakt: tomt felt afvises, gyldig besked klargøres, mål/antal medtages og produktforespørgsel udfyldes korrekt.
- Mobilmenu: åbning, Escape og fokusretur til menuknappen. FAQ udvider korrekt.
- Ukendt produkt viser fejl og noindex. Product-schema bruger STYKK, ny SKU og korrekte billeder; vejledende designpriser udgives ikke som faste schema-tilbud.
- Ingen console errors eller warnings observeret i de kontrollerede flows.
- Ingen kundevendte gamle brandnavne eller referencer til de gamle produktassets. Ingen assets peger på en Desktop-mappe.

Projektet har ikke package.json, lint-konfiguration, TypeScript eller en build-pipeline. De relevante kontroller er derfor syntax-/regressionstests og statisk kataloggenerering. Der er ikke udført en Lighthouse-benchmark eller ekstern afsendelse af en ordre. Reduced-motion er implementeret med CSS-medieforespørgsel og observer-guard; browserens systempræference er ikke ændret i testen.

Performance understøttes af små WebP-filer, srcset/sizes, faste billedproportioner, lazy loading under folden, prioriteret hero, systemfonte og ingen eksterne JS-pakker. Hele billedmappen er ca. 624 KB på disk, inkl. alle originaler og responsive versioner; en besøgende henter de relevante størrelser.

## Næste iteration

1. Erstat @test med den rigtige Telegram-kontakt før reelle ordreforespørgsler.
2. Fastlæg endelige priser, mål, materialer, montering og levering for de viste designs. Erstat cirka-priser med bekræftede priser.
3. Supplér triptykbillederne med egne enkeltproduktbilleder, detaljefotos og procesbilleder. Det giver bedre produktgalleri og dokumentation for fremstillingen.
4. Ved ønske om automatiske køb: tilføj en egentlig ordre-/betalingsbackend og verificerede leveringsvilkår.
5. Overvej separate statiske produkt-URLs med færdige metadata og opdater de samlede SEO-URLs, hvis STYKK får eget domæne.

Den afsluttende genåbning af previewet og screenshot-eksport blev afvist af browserens sikkerhedskontrol, fordi administratorpolitikken ikke kunne verificeres. Den tidligere dokumenterede browserkontrol og visuelle gennemgang blev gennemført. Ingen alternativ adgang blev brugt til at omgå kontrollen.

Ændringerne er lokale. De er ikke deployet, committed eller pushet.

## Senest tilføjet fra billedmappen

Fem nye filer føjet til katalog og forside: Sno / flexifigur (ca. 49 DKK pr. figur), Krible / flexifigur (ca. 29 DKK pr. figur), Juletryk / kageform (ca. 79 DKK pr. form), Punkt / mobilholder (ca. 79 DKK pr. holder) og Fold / mobilholder (ca. 69 DKK pr. holder). To flexifigurer er separate modeller med hvert sit billede. Begge mobilholdere er medtaget, da den rosa kugleformede holder og den sorte vinkelformede model har forskellige udtryk. Alle priser er markeret vejledende.
