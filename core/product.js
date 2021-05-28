"use strict";

const api = require('../lightning/api');

const PAIRS = {
  // price_fmt, volume_fmt
  'BTC_JPY': [0, 8],
  'XRP_JPY': [3, 8],
  'ETH_JPY': [0, 8],
  'XLM_JPY': [3, 8],
  'MONA_JPY': [3, 8],
  'FX_BTC_JPY': [0, 8],
  'ETH_BTC': [5, 8],
  'BCH_BTC': [5, 8]
};

class Product {

  constructor(name, code, price_formatter, volume_formatter) {
    this.name = name;
    this.code = code;
    this.price_formatter = price_formatter;
    this.volume_formatter = volume_formatter;
  }

  format_price(n) {
    return this.price_formatter(n);
  }

  format_volume(n) {
    return this.volume_formatter(n);
  }
}

class InvalidProductCodeError {

  constructor(product_code) {
    this.name = 'InvalidProductCodeError';
    this.product_code = product_code;
    this.message = `"${product_code}" isn't supported.`;
  }
}

const fixed_formatter = (digit) => {
  return (n) => n.toFixed(digit);
};


const find_pair = (code) => {
  if (code in PAIRS)
    return ([code].concat(PAIRS[code]));

  const product = new api.PublicAPI()
    .callSync("GET", "/v1/getmarkets")
    .find(row => row.product_code == code || row.alias == code);
  if (product) {
    const code_ = (product.alias) ?
      product.alias.split("_")[0] : code.replace(/_/g, "");
    return [product.product_code, code_.endsWith("BTC") ? 5 : 0, 8];
  } else {
    return null;
  }
};

const get_product = (code) => {
  code = code.toUpperCase();
  const pair = find_pair(code);
  if (pair) {
    return new Product(
      "bitFlyer " + pair[0].replace(/_/g, ""), pair[0],
      fixed_formatter(pair[1]),
      fixed_formatter(pair[2])
    );
  }
  throw new InvalidProductCodeError(code);
};

module.exports.get_product = get_product;
module.exports.InvalidProductCodeError = InvalidProductCodeError;
