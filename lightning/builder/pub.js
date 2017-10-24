/**
 * HTTP Public API
 */

"use strict";

const base = require('./base');


/**
 * マーケットの一覧
 *
 * https://lightning.bitflyer.jp/docs#マーケットの一覧
 */
class GetMarkets extends base.Request {
  constructor() {
    super("GET", "/v1/getmarkets", {}, false);
  }
}

/**
 * 板情報
 *
 * https://lightning.bitflyer.jp/docs#板情報
 */
class GetBoard extends base.ProductCodeMixin(base.Request) {

  constructor() {
    super("GET", "/v1/getboard", {product_code: "BTC_JPY"}, false);
  }

  _validation_schema() {
    return {
      type: "object",
      required: ["product_code"]
    };
  }
}

/**
 * Ticker
 *
 * https://lightning.bitflyer.jp/docs#ticker
 */
class GetTicker extends base.ProductCodeMixin(base.Request) {

  constructor() {
    super("GET", "/v1/getticker", {product_code: "BTC_JPY"}, false);
  }

  _validation_schema() {
    return {
      type: "object",
      required: ["product_code"]
    };
  }
}

/**
 * 約定履歴
 *
 * https://lightning.bitflyer.jp/docs#約定履歴
 */
class GetExecutions extends base.PagerMixin(base.ProductCodeMixin(base.Request)) {

  constructor() {
    super("GET", "/v1/getexecutions", {product_code: "BTC_JPY"}, false);
  }

  _validation_schema() {
    return {
      type: "object",
      required: ["product_code"]
    };
  }
}


/**
 * 板の状態
 *
 * https://lightning.bitflyer.jp/docs#板の状態
 */
class GetBoardState extends base.ProductCodeMixin(base.Request) {

  constructor() {
    super("GET", "/v1/getboardstate", {product_code: "BTC_JPY"}, false);
  }

  _validation_schema() {
    return {
      type: "object",
      required: ["product_code"]
    };
  }
}

/**
 * 取引所の状態
 *
 * https://lightning.bitflyer.jp/docs#取引所の状態
 */
class GetHealth extends base.ProductCodeMixin(base.Request) {

  constructor() {
    super("GET", "/v1/gethealth", {product_code: "BTC_JPY"}, false);
  }

  _validation_schema() {
    return {
      type: "object",
      required: ["product_code"]
    };
  }
}

/**
 * チャット
 *
 * https://lightning.bitflyer.jp/docs#チャット
 */
class GetChats extends base.Request {

  constructor() {
    super("GET", "/v1/getchats", {}, false);
  }

  from_date(v) {
    v = v.toISOString ? v.toISOString() : v;
    if (v instanceof Date) {
      v = v.toISOString();
    }
    this._set("from_date", v, {type: "string", format: "date-time"});
    return this;
  }
}

module.exports.getmarkets = module.exports.markets = GetMarkets;
module.exports.getboard = module.exports.board = GetBoard;
module.exports.getticker = module.exports.ticker = GetTicker;
module.exports.getexecutions = module.exports.executions = GetExecutions;
module.exports.getboardstate = GetBoardState;
module.exports.gethealth = GetHealth;
module.exports.getchats = GetChats;
