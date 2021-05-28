#!/usr/bin/env node

"use strict";

require('./core/polyfill');

const throttle = require('lodash.throttle');
const api = require('./lightning/api');
const pub = new api.PublicAPI();

const term = require('./core/terminal');
const model = require('./core/model');
const products = require('./core/product');

const render_wait = 200;

let product_map = new Map();
let tickers = null;


const _render = () => {
  let out = process.stdout;

  out.cork();

  out.write(term.clear);
  out.write(term.nl);

  out.write("  Exchange:".padEnd(20));
  out.write("bitFlyer Lightning".padStart(26));
  out.write(term.nl);

  out.write("  Last Update:".padEnd(20));
  out.write(new Date().toLocaleTimeString().padStart(26));
  out.write(term.nl);

  out.write(term.nl);

  out.write("  " + "Code".padEnd(8));
  out.write(" " + "Price".padStart(10));
  out.write(" " + "B/A".padStart(7));
  out.write(" " + "Volume".padStart(16));
  out.write(term.nl);

  out.write(term.separator + term.nl);

  product_map.forEach((p, id) => {
    const ticker = tickers.get(id);
    out.write("  " + p.code.padEnd(8));
    out.write(" " + term.colorful(
        term.updown_color(ticker.price, ticker.price_old),
        p.format_price(ticker.price).padStart(10)));
    out.write(" " + term.colorful(
        term.updown_color(ticker.ratio, 1.0),
        ticker.ratio.toFixed(2).padStart(7)));
    out.write(" " + p.format_volume(ticker.volume).padStart(16));
    out.write(term.nl);
  });

  out.write(term.separator + term.nl);
  out.write(term.nl);

  process.nextTick(() => out.uncork());
};
const render = throttle(_render, render_wait);


const main = (program) => {
  program.product
    .split(",").filter(s => s.trim())
    .forEach(s => {
      const p = products.get_product(s);
      product_map.set(p.code, p);
    });

  tickers = new model.TickerBoard(product_map);

  const codes = Array.from(product_map.keys());
  const reqs = codes.map(code =>
    pub.call("GET", "/v1/getticker", {product_code: code}));
  Promise.all(reqs)
    .then(res => {
      res.forEach(data => tickers.update(data.product_code, data));
      render();
    })
    .then(() => {
      const channels = codes.map(code => "lightning_ticker_" + code);
      new api.RealtimeAPI()
        .subscribe(channels)
        .attach((ch, data) => {
          tickers.update(data.product_code, data);
          render();
        });
    });
};

process.on("uncaughtException", (err) => {
  console.error("Error:", err.message || err);
  process.exit(1);
});

const program = require('commander');
program
  .version(require("./package.json").version)
  .description("Display QUOINEX's ticker")
  .option("-p, --product <code>",
    "Product codes, comma separated (default: BTC_JPY,ETH_BTC,BCH_BTC)",
    s => s.toUpperCase(),
    "BTC_JPY,ETH_BTC,BCH_BTC")
  .on("--help", () => {
    console.log("");
    console.log("  Examples:");
    console.log("");
    console.log("    $ node ticker.js -p BTC_JPY,ETH_BTC");
    console.log("");
  })
  .parse(process.argv);

main(program);

