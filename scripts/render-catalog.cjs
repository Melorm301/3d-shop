/* Optional: refresh the crawlable HTML after changing products or images.
   The store itself remains plain static files, with no build requirement. */
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const root = path.join(__dirname, '..');
const context = {}; context.window = context; vm.createContext(context);
for (const file of ['products.js', 'image-data.js', 'ui.js', 'catalog.js']) {
  vm.runInContext(fs.readFileSync(path.join(root, 'js', file), 'utf8'), context);
}
for (const page of ['index.html','shop.html']) {
  const file = path.join(root, page);
  const source = fs.readFileSync(file, 'utf8');
  const next = source.replace(/(<div class="product-grid[^"\n]*" data-products[^>]*>)[\s\S]*?(<\/div>)/g, (match, start, end) => {
    const products = start.includes('data-product-source="all"') ? context.Shop.all().sort((a,b)=>(b.featured?1:0)-(a.featured?1:0)||(a.featuredRank||99)-(b.featuredRank||99)) : context.Shop.featured(3);
    return start+'\n'+products.map(context.STYKKCatalog.cardHTML).join('\n')+'\n'+end;
  });
  fs.writeFileSync(file, next);
}
console.log('Static catalog updated from existing product data.');
