const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const root = path.join(__dirname,'..');
const pages = fs.readdirSync(root).filter(name=>name.endsWith('.html'));
const context={};context.window=context;vm.createContext(context);
vm.runInContext(fs.readFileSync(path.join(root,'js/products.js'),'utf8'),context);
vm.runInContext(fs.readFileSync(path.join(root,'js/image-data.js'),'utf8'),context);

test('all local page links, fragments and static assets resolve',()=>{
 for(const page of pages){
  const source=fs.readFileSync(path.join(root,page),'utf8');
  for(const match of source.matchAll(/(?:href|src)="([^"]+)"/g)){
   const target=match[1].replace(/&amp;/g,'&');if(/^(https?:|data:)/.test(target))continue;
   const url=new URL(target,'https://local.test/'+page);
   const file=url.pathname.slice(1)||'index.html';
   assert.ok(fs.existsSync(path.join(root,file)),`${page}: missing ${target}`);
   if(url.hash){const destination=fs.readFileSync(path.join(root,file),'utf8');assert.ok(destination.includes('id="'+decodeURIComponent(url.hash.slice(1))+'"'),`${page}: broken fragment ${target}`);}
   if(file==='product.html'&&url.searchParams.has('id'))assert.ok(context.Shop.byId(url.searchParams.get('id')),`${page}: unknown product ${target}`);
  }
 }
});

test('every product image and responsive source exists',()=>{
 for(const product of context.Shop.all()){
  assert.ok(product.price>0&&Number.isInteger(product.price));
  for(const image of product.images){
   assert.ok(fs.existsSync(path.join(root,image)),image);
   const info=context.STYKKImages[image];assert.ok(info,image+' missing dimensions');
   for(const entry of info.sources)assert.ok(fs.existsSync(path.join(root,entry.src)),entry.src);
  }
 }
});

test('page semantics, metadata and business identity remain present',()=>{
 for(const page of pages){
  const source=fs.readFileSync(path.join(root,page),'utf8');
  assert.equal((source.match(/<h1\b/g)||[]).length,1,page+' h1');
  assert.match(source,/<html lang="da">/);assert.match(source,/<title>[^<]+STYKK[^<]*<\/title>|<title>STYKK[^<]*<\/title>/);
  assert.match(source,/<meta name="description" content="[^"]+">/);assert.match(source,/<link rel="canonical" href="https:\/\/melorm301.github.io\/3d-shop\//);
  assert.match(source,/41693908/);
  for(const match of source.matchAll(/<script type="application\/ld\+json"[^>]*>(.*?)<\/script>/gs))assert.doesNotThrow(()=>JSON.parse(match[1]));
 }
});

test('all JavaScript files parse without a build step',()=>{
 for(const file of fs.readdirSync(path.join(root,'js')).filter(file=>file.endsWith('.js'))){
  assert.doesNotThrow(()=>new vm.Script(fs.readFileSync(path.join(root,'js',file),'utf8')));
 }
});
