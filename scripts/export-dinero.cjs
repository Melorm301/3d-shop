#!/usr/bin/env node
"use strict";

// Create a Dinero-importable CSV from the shop's source-of-truth product data.
// Run from the repository root: node scripts/export-dinero.cjs
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const root = path.resolve(__dirname, "..");
const source = fs.readFileSync(path.join(root, "js/products.js"), "utf8");
const context = { window: {} };
vm.runInNewContext(source, context, { filename: "js/products.js" });
const products = context.window.Shop.all();

function csvCell(value) {
  const text = String(value == null ? "" : value);
  return /[;"\r\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

const rows = [["Varenummer", "Varenavn", "Salgspris DKK"]];
for (const product of products) {
  const priceOre = Number(product.price);
  if (!product.sku || !product.name || !Number.isFinite(priceOre)) {
    throw new Error(`Produkt mangler varenummer, navn eller gyldig pris: ${product.id}`);
  }
  // Prices in products.js are stored as øre. Use Danish decimal comma and
  // semicolon-separated columns so amounts remain a single CSV cell.
  const price = (priceOre / 100).toFixed(2).replace(".", ",");
  rows.push([product.sku, product.name, price]);
}

const csv = rows.map((row) => row.map(csvCell).join(";")).join("\r\n") + "\r\n";
const outputDir = path.join(root, "exports");
fs.mkdirSync(outputDir, { recursive: true });
const outputPath = path.join(outputDir, "stykk-produkter-dinero.csv");
fs.writeFileSync(outputPath, csv, "utf8");
console.log(`Eksporterede ${products.length} produkter til ${path.relative(root, outputPath)}`);
