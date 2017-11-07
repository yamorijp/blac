#!/usr/bin/env node

"use strict";

require('./core/polyfill');

const throttle = require('lodash.throttle');

const term = require('./core/terminal');
const api = require('./lightning/api');
const model = require('./core/model');
const products = require('./core/product');

const render_wait = 200;

let product = null;
let health = new model.Health();
let ticker = new model.Ticker();
let book = new model.OrderBook();


const _render = () => {
  let out = process.stdout;

  out.write(term.clear);
  out.write(term.nl);

  out.write("  Product:".padEnd(20));
  out.write(product.name.padStart(26));
  out.write(term.nl);

  out.write("  Last Price:".padEnd(20));
  out.write(term.colorful(
    ticker.price >= ticker.price_old ? term.green : term.red,
    product.format_price(ticker.price).padStart(26)));
  out.write(term.nl);

  out.write("  Bid/Ask Ratio:".padEnd(20));
  out.write(term.colorful(
    ticker.ratio >= 1.0 ? term.green : term.red,
    ticker.ratio.toFixed(2).padStart(26)));
  out.write(term.nl);

  out.write("  24H Volume:".padEnd(20));
  out.write(product.format_volume(ticker.volume).padStart(26));
  out.write(term.nl);

  out.write(term.separator + term.nl);

  book.getAsks().forEach(row => {
    out.write(product.format_volume(row[1]).padStart(16));
    out.write(" " + term.colorful(term.red, product.format_price(row[0]).padStart(12)) + " ");
    out.write("".padEnd(16));
    out.write(term.nl);
  });
  book.getBids().forEach(row => {
    out.write("".padEnd(16));
    out.write(" " + term.colorful(term.green, product.format_price(row[0]).padStart(12)) + " ");
    out.write(product.format_volume(row[1]).padStart(16));
    out.write(term.nl);
  });

  out.write(term.separator + term.nl);

  out.write(`  Service) ${health.health}    Market) ${health.state}`);
  out.write(term.nl);
};
const render = throttle(_render, render_wait);


const main = (program) => {
  product = products.get_product(program.product);
  book.lock()
    .setRowCount(program.row)
    .setGroupingFactor(program.group);

  let check_health = function () {
    new api.PublicAPI().call('GET', '/v1/getboardstate', {product_code: product.code})
      .then(data => {
        health.update(data);
        render();
      });
  };
  check_health();
  setInterval(check_health, 60000);

  let board_channel = 'lightning_board_' + product.code;
  let ticker_channel = 'lightning_ticker_' + product.code;
  new api.RealtimeAPI()
    .attach((channel, message) => {
      switch (channel) {
        case board_channel:
          book.update(message);
          break;
        case ticker_channel:
          ticker.update(message);
          break;
      }
      render();
    })
    .subscribe([board_channel, ticker_channel]);

  new api.PublicAPI()
    .call('GET', '/v1/board', {product_code: product.code})
    .then(data => {
      book.setData(data);
      book.unlock();
      render();
    });
};

process.on("uncaughtException", (err) => {
  console.error("Error:", err.message || err);
  process.exit(1);
});


const program = require('commander');
program
  .version(require("./package.json").version)
  .description("Display BitFlyer Lightning's order book")
  .option("-p, --product <code>", "Product code (BTC_JPY|ETH_BTC|BCH_BTC|FX_BTC_JPY)", s => s.toUpperCase(), "BTC_JPY")
  .option("-r, --row <n>", "Number of display rows (default: 24)", v => parseInt(v), 24)
  .option("-g, --group <n>", "Order grouping unit (default: 0.0)", v => parseFloat(v), 0.0)
  .on("--help", () => {
    console.log("");
    console.log("  Examples:");
    console.log("");
    console.log("    $ node book.js -p BTC_JPY -r 32 -g 1000");
    console.log("");
  })
  .parse(process.argv);

main(program);

