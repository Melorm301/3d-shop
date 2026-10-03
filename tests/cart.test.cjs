const test = require('node:test');
const assert = require('node:assert/strict');
const vm = require('node:vm');
const fs = require('node:fs');
const path = require('node:path');
const root = path.join(__dirname, '..');

// A minimal DOM isolates persisted cart data and pricing; real interaction is
// separately exercised in the browser, including modal focus and checkout.
function boot(saved, customProducts) {
  const listeners = {};
  const nodes = {};
  const storage = new Map([['nordform.cart.v1', saved || '[]']]);
  const element = () => ({ innerHTML: '', hidden: false, addEventListener() {}, focus() {} });
  const dialog = { ...element(), dataset: {}, open: false, setAttribute() {},
    querySelector(selector) { return nodes[selector] || (nodes[selector] = element()); },
    showModal() { this.open = true; }, close() { this.open = false; } };
  const document = { readyState: 'loading', activeElement: null,
    addEventListener(name, fn) { (listeners[name] ||= []).push(fn); },
    querySelectorAll() { return []; }, querySelector() { return null; },
    createElement() { return dialog; }, body: { appendChild() {}, classList: { add() {}, remove() {} } } };
  const context = { document, localStorage: { getItem: key => storage.get(key), setItem: (key, value) => storage.set(key, value) }, navigator: {}, console,
    setTimeout, requestAnimationFrame: fn => fn(), addEventListener(name, fn) { (listeners[name] ||= []).push(fn); } };
  context.window = context;
  vm.createContext(context);
  ['products.js', 'ui.js'].forEach(file => vm.runInContext(fs.readFileSync(path.join(root, 'js', file), 'utf8'), context));
  if (customProducts) context.Shop = { ...context.Shop, byId: id => customProducts.find(p => p.id === id) || null };
  vm.runInContext(fs.readFileSync(path.join(root, 'js', 'cart.js'), 'utf8'), context);
  listeners.DOMContentLoaded.forEach(fn => fn());
  return { cart: context.Cart, storage, nodes, emit: (event, value) => (listeners[event] || []).forEach(fn => fn(value)), dialog };
}

test('current carts survive, invalid entries are rejected and duplicate rows merge', () => {
  const { cart } = boot(JSON.stringify([{id:'rib-vaeg',qty:2},{id:'rib-vaeg',qty:3},{id:'deleted',qty:1},{id:'rib-vaeg',qty:-1},{id:'rib-vaeg',qty:1.5}]));
  assert.equal(cart.count(), 5);
  assert.equal(cart.items().length, 1);
  assert.equal(cart.subtotal(), 44500);
});

test('invalid storage recovers and valid additions persist under the original key', () => {
  const {cart,storage} = boot('{ broken');
  assert.equal(cart.count(),0);
  assert.equal(cart.add('rib-vaeg',2),true);
  assert.equal(cart.subtotal(),17800);
  const saved = storage.get('nordform.cart.v1');
  assert.equal(JSON.parse(saved)[0].qty,2);
  assert.equal(boot(saved).cart.subtotal(),17800);
});

test('quantities are positive integers, bounded, and unknown products cannot be added', () => {
  const {cart} = boot();
  for (const qty of [0,-1,1.5,NaN,'2']) assert.equal(cart.add('rib-vaeg',qty),false);
  assert.equal(cart.add('missing',1),false);
  cart.add('rib-vaeg',98); cart.add('rib-vaeg',10);
  assert.equal(cart.count(),99);
  assert.equal(cart.subtotal(),881100);
});

test('variant rows stay distinct and size prices drive cart totals', () => {
  const product = {id:'variant',name:'Variant',price:10000,currency:'DKK',images:['image.webp'],colors:[{name:'Sort',hex:'#000'},{name:'Hvid',hex:'#fff'}],sizes:[{name:'Lille',price:10000},{name:'Stor',price:20000}]};
  const {cart,nodes} = boot('[]',[product]);
  cart.add('variant',2,{color:'Sort',size:'Stor'});
  cart.add('variant',1,{color:'Hvid',size:'Lille'});
  cart.add('variant',1,{color:'Sort',size:'Stor'});
  assert.equal(cart.items().length,2);
  assert.equal(cart.subtotal(),70000);
  assert.match(nodes['[data-drawer-items]'].innerHTML,/Sort \/ Stor/);
  assert.match(nodes['[data-drawer-items]'].innerHTML,/600 DKK/);
});

test('returned cart items cannot mutate the live cart', () => {
  const {cart} = boot(); cart.add('rib-vaeg',1);
  cart.items()[0].qty = 50;
  assert.equal(cart.count(),1);
});

test('quantity and remove actions update totals through delegated controls', () => {
  const {cart,emit} = boot(); cart.add('rib-vaeg',2);
  function click(action) {
    const button = {dataset:{cartAction:action,itemKey:JSON.stringify(['rib-vaeg','Varm brun',''])}};
    emit('click',{target:{closest: selector => selector === '[data-cart-action]' ? button : null}});
  }
  click('increase');assert.equal(cart.subtotal(),26700);
  click('decrease');assert.equal(cart.count(),2);
  click('remove');assert.equal(cart.count(),0);
  cart.add('rib-vaeg',1);click('decrease');assert.equal(cart.count(),0);
});

test('storage changes synchronize the cart between tabs', () => {
  const {cart,storage,emit} = boot();
  storage.set('nordform.cart.v1',JSON.stringify([{id:'rib-vaeg',qty:4}]));
  emit('storage',{key:'nordform.cart.v1'});
  assert.equal(cart.count(),4);assert.equal(cart.subtotal(),35600);
});

 test('retired assortment is safely removed from persisted baskets',()=>{
  const {cart}=boot(JSON.stringify([{id:'pen-case',qty:2},{id:'peptide-case-50-vials',qty:1},{id:'bue-knage',qty:1}]));
  assert.equal(cart.count(),1);assert.equal(cart.items()[0].id,'bue-knage');assert.equal(cart.subtotal(),10900);
 });
