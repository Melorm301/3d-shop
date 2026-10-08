<?php
/** Scoped catalog search, category filtering, and sorting for the STYKK Shop draft. */
add_action('wp_footer', function () {
    if ((int) get_queried_object_id() !== 123) { return; }
    $stykk_catalog = json_decode('{"Rib / vægknage":{"category":"Bolig","isNew":false,"featured":true,"rank":1,"price":89,"estimatedPrice":true},"Bue / knage":{"category":"Bolig","isNew":false,"featured":true,"rank":2,"price":109,"estimatedPrice":true},"Rib / dørknage":{"category":"Bolig","isNew":false,"featured":true,"rank":3,"price":129,"estimatedPrice":true},"Klem / poseclip":{"category":"Tilbehør","isNew":false,"featured":false,"rank":99,"price":39,"estimatedPrice":true},"Skrå / holder":{"category":"Tilbehør","isNew":false,"featured":false,"rank":99,"price":79,"estimatedPrice":true},"Tak / rensdyrfigur":{"category":"Figurer","isNew":false,"featured":false,"rank":99,"price":119,"estimatedPrice":true},"Svøb / spøgelsesfigur":{"category":"Figurer","isNew":false,"featured":false,"rank":99,"price":89,"estimatedPrice":true},"Sno / flexifigur":{"category":"Legetøj","isNew":true,"featured":false,"rank":8,"price":49,"estimatedPrice":true},"Krible / flexifigur":{"category":"Legetøj","isNew":true,"featured":false,"rank":9,"price":29,"estimatedPrice":true},"Juletryk / kageform":{"category":"Køkken","isNew":true,"featured":false,"rank":10,"price":79,"estimatedPrice":true},"Hjerte / billedholder":{"category":"Tilbehør","isNew":true,"featured":false,"rank":11,"price":79,"estimatedPrice":true},"Fold / mobilholder":{"category":"Tilbehør","isNew":true,"featured":false,"rank":12,"price":69,"estimatedPrice":true},"Nordisk sol og bue":{"category":"Wall art","isNew":false,"featured":false,"rank":99,"price":399,"estimatedPrice":false},"Nordisk kvindesilhuet":{"category":"Wall art","isNew":false,"featured":false,"rank":99,"price":399,"estimatedPrice":false},"Nordisk oliventræ":{"category":"Wall art","isNew":false,"featured":false,"rank":99,"price":399,"estimatedPrice":false},"Portræt med gyldent ekko":{"category":"Wall art","isNew":false,"featured":false,"rank":99,"price":399,"estimatedPrice":false},"Portræt under rød sol":{"category":"Wall art","isNew":false,"featured":false,"rank":99,"price":399,"estimatedPrice":false},"New Nordic / Banksy":{"category":"Wall art","isNew":false,"featured":false,"rank":99,"price":399,"estimatedPrice":false},"Måne over fjorden":{"category":"Wall art","isNew":false,"featured":false,"rank":99,"price":399,"estimatedPrice":false}}', true);
    $stykk_wc_products = wc_get_products(array('limit' => -1, 'status' => array('publish', 'private')));
    usort($stykk_wc_products, function ($a, $b) { return (int) preg_replace('/\\D/', '', $a->get_sku()) <=> (int) preg_replace('/\\D/', '', $b->get_sku()); });
    $stykk_live_products = array();
    foreach ($stykk_wc_products as $stykk_product) {
        $stykk_terms = wp_get_post_terms($stykk_product->get_id(), 'product_cat', array('fields' => 'names'));
        $stykk_image_id = $stykk_product->get_image_id();
        $stykk_live_products[] = array(
            'name' => $stykk_product->get_name(),
            'sku' => $stykk_product->get_sku(),
            'price' => (float) $stykk_product->get_price(),
            'description' => wp_strip_all_tags($stykk_product->get_short_description()),
            'categories' => is_wp_error($stykk_terms) ? array() : $stykk_terms,
            'permalink' => get_permalink($stykk_product->get_id()),
            'image' => $stykk_image_id ? wp_get_attachment_image_url($stykk_image_id, 'large') : '',
            'alt' => $stykk_image_id ? get_post_meta($stykk_image_id, '_wp_attachment_image_alt', true) : ''
        );
    }
    $stykk_catalog_json = wp_json_encode($stykk_catalog, JSON_HEX_TAG | JSON_HEX_AMP | JSON_HEX_APOS | JSON_HEX_QUOT);
    $stykk_live_products_json = wp_json_encode($stykk_live_products, JSON_HEX_TAG | JSON_HEX_AMP | JSON_HEX_APOS | JSON_HEX_QUOT);
    ?>
    <style>
      body.postid-123{overflow-x:clip}#stykk-shop-grid .stykk-filter-hidden{display:none!important}#stykk-shop-grid{row-gap:56px!important}@media(max-width:767px){#stykk-shop-grid{row-gap:40px!important}}@media(max-width:479px){#stykk-shop-grid{grid-template-columns:1fr!important}}
      #stykk-catalog-tools{width:100%;max-width:1480px;margin:0 auto;padding:0 clamp(20px,4.3vw,80px) 24px;display:flex;align-items:center;flex-wrap:wrap;gap:12px 32px;color:var(--stykk-ink,#252923);font:inherit;font-size:14px;line-height:1.4}
      #stykk-catalog-tools .stykk-search{display:flex;align-items:center;flex:1 1 240px;min-width:180px;border-bottom:1px solid var(--stykk-line,#d6d4cc)}
      #stykk-catalog-tools input{width:100%;min-width:0;min-height:44px;padding:8px 0;border:0;background:transparent;color:inherit;font:inherit;outline-offset:3px}
      #stykk-catalog-tools label{display:flex;align-items:center;gap:8px;font-size:12px;color:var(--stykk-ink-soft,#64655b)}
      #stykk-catalog-tools select{min-height:44px;max-width:190px;border:0;background:transparent;color:inherit;font:inherit}
      #stykk-catalog-tools output{margin-left:auto;font:11px/1.4 monospace;text-transform:uppercase;letter-spacing:.05em;color:var(--stykk-ink-soft,#64655b)}
      #stykk-catalog-empty{max-width:1480px;margin:0 auto;padding:24px clamp(20px,4.3vw,80px) 96px;color:var(--stykk-ink-soft,#64655b)}
      #stykk-catalog-collections a[aria-pressed="true"]{border-color:var(--stykk-ink,#252923);background:rgba(37,41,35,.045)}
      @media(max-width:767px){#stykk-catalog-tools{display:grid;grid-template-columns:1fr 1fr;gap:8px 14px;padding-bottom:20px}#stykk-catalog-tools .stykk-search{grid-column:1/-1}#stykk-catalog-tools output{margin-left:0}}
      @media(max-width:479px){#stykk-catalog-tools{grid-template-columns:1fr}#stykk-catalog-tools .stykk-search{grid-column:auto}}
    </style>
    <script>
    (()=>{
      const catalog = <?php echo $stykk_catalog_json; ?>;
      const wooProducts = <?php echo $stykk_live_products_json; ?>;
      const collection = document.querySelector('.elementor-element-6964a5b1');
      const grid = document.querySelector('.elementor-element-11bf0160');
      if (!collection || !grid) return;
      grid.id = 'stykk-shop-grid';
      collection.id = 'stykk-catalog-collections';
      const cards = Array.from(grid.children);
      const liveProducts = Array.isArray(wooProducts) ? wooProducts : [];
      cards.forEach((card,index)=>{
        const product=liveProducts[index];if(!product)return;
        const image=card.querySelector('img');if(image&&product.image){image.src=product.image;image.removeAttribute('srcset');image.alt=product.alt||product.name;}
        const imageLink=card.querySelector('.e-image-link-base');if(imageLink)imageLink.href=product.permalink;
        const heading=card.querySelector('h3');if(heading){const headingLink=heading.querySelector('a');if(headingLink){headingLink.textContent=product.name;headingLink.href=product.permalink;}else heading.textContent=product.name;}
        const paragraphs=card.querySelectorAll('p');if(paragraphs[0])paragraphs[0].textContent=product.description||'';
        if(paragraphs[1]){const amount=new Intl.NumberFormat('da-DK',{maximumFractionDigits:0}).format(product.price||0);paragraphs[1].textContent=(catalog[product.name]?.estimatedPrice?'ca. ':'')+amount+' DKK';}
        card.querySelectorAll('a[href]').forEach(link=>link.href=product.permalink);
      });
      const controls = document.createElement('div');
      controls.id = 'stykk-catalog-tools';
      controls.setAttribute('role','search');
      controls.innerHTML = '<label class="stykk-search"><span aria-hidden="true">⌕</span><input type="search" aria-label="Søg i kollektionen" placeholder="Søg efter et STYKK…"></label><label>Sortering <select aria-label="Sortering"><option value="featured">Udvalgte først</option><option value="price-low">Pris: lav til høj</option><option value="price-high">Pris: høj til lav</option><option value="name">Navn: A–Å</option></select></label><output aria-live="polite"></output>';
      collection.after(controls);
      const empty = document.createElement('p'); empty.id='stykk-catalog-empty'; empty.hidden=true; empty.textContent='Vi fandt ikke den form. Prøv en anden søgning, eller vælg Alle STYKK.'; grid.after(empty);
      const input=controls.querySelector('input'), sort=controls.querySelector('select'), output=controls.querySelector('output');
      const categoryKey={'Bolig':'Bolig','Tilbehør':'Tilbehør','Figurer':'Figurer','Legetøj':'Legetøj','Køkken':'Køkken','Wall art':'Wall art'};
      const query=new URLSearchParams(window.location.search);
      const categoryFromQuery={'bolig':'Bolig','tilbehor':'Tilbehør','figurer':'Figurer','legetoj':'Legetøj','kokken':'Køkken','wall-art':'Wall art'};
      let active=categoryFromQuery[query.get('category')]||((query.get('collection')==='new')?'new':(query.get('collection')==='figures'?'Figurer':'all'));
      const info=card=>{const name=(card.querySelector('h3')?.innerText||'').trim();const live=liveProducts.find(product=>product.name===name)||{};return {name,meta:Object.assign({},catalog[name]||{},live),text:(card.innerText||'').toLocaleLowerCase('da')};};
      const render=()=>{
        let shown=0;
        collection.querySelectorAll('a').forEach(link=>{
          const label=(link.innerText||'').trim();
          const selected=active==='all'?label==='Alle STYKK':active==='new'?label==='Nyheder':label===active;
          link.setAttribute('aria-pressed',String(selected));
        });
        const arranged=cards.map(card=>({card,...info(card)}));
        arranged.sort((a,b)=>{
          const mode=sort.value;
          if(mode==='price-low')return (a.meta.price||0)-(b.meta.price||0);
          if(mode==='price-high')return (b.meta.price||0)-(a.meta.price||0);
          if(mode==='name')return a.name.localeCompare(b.name,'da');
          return (a.meta.featured?0:1)-(b.meta.featured?0:1)||(a.meta.rank||99)-(b.meta.rank||99);
        });
        arranged.forEach(item=>{
          const categoryOK=active==='all'||(active==='new'?item.meta.isNew:(item.meta.categories||[]).includes(categoryKey[active])||item.meta.category===categoryKey[active]);
          const searchOK=!input.value.trim()||item.text.includes(input.value.trim().toLocaleLowerCase('da'));
          const visible=categoryOK&&searchOK;
          item.card.hidden=!visible;item.card.classList.toggle('stykk-filter-hidden',!visible);
          if(visible)shown++;
          grid.appendChild(item.card);
        });
        output.textContent=shown+(shown===1?' produkt':' produkter');
        empty.hidden=shown!==0;
      };
      collection.querySelectorAll('a').forEach(link=>{
        link.setAttribute('role','button');
        link.setAttribute('aria-pressed','false');
        link.addEventListener('click',event=>{
          event.preventDefault();
          const label=(link.innerText||'').trim();
          active=label==='Alle STYKK'?'all':label==='Nyheder'?'new':label;
          collection.querySelectorAll('a').forEach(item=>item.setAttribute('aria-pressed',String(item===link)));
          render();
        });
      });
      input.addEventListener('input',render); sort.addEventListener('change',render); render();
    })();
    </script>
    <?php
}, 99);
