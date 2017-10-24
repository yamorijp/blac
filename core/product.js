"use strict";

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
    this.message = `'${product_code}' isn't supported. Please specify BTC_JPY, ETH_BTC or FX_BTC_JPY.`;
  }
}

const fixed_formatter = (digit) => {
  return (n) => n.toFixed(digit);
};

const btc_jpy = new Product(
  'BTC/JPY',
  'BTC_JPY',
  fixed_formatter(0),
  fixed_formatter(8)
);

const eth_btc = new Product(
  'ETH/BTC',
  'ETH_BTC',
  fixed_formatter(5),
  fixed_formatter(7)
);


const get_product = (code) => {
  code = code.toUpperCase();
  switch (code) {
    case 'BTC_JPY':
      return btc_jpy;
    case 'ETH_BTC':
      return eth_btc;
    case 'FX_BTC_JPY':
      return new Product('BTC-FX/JPY', 'FX_BTC_JPY', fixed_formatter(0), fixed_formatter(8));
    case 'BCH_BTC':
      return new Product('BCH/BTC', 'BCH_BTC', fixed_formatter(5), fixed_formatter(8));
  }
  if (code.startsWith("BTCJPY")) {
    return new Product(code, code, fixed_formatter(0), fixed_formatter(8));
  }
  if (code.startsWith("ETHBTC")) {
    return new Product(code, code, fixed_formatter(5), fixed_formatter(7));
  }

  throw new InvalidProductCodeError(code);
};

module.exports.BtcJpy = btc_jpy;
module.exports.EthBtc = eth_btc;
module.exports.get_product = get_product;
module.exports.InvalidProductCodeError = InvalidProductCodeError;
