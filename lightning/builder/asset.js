/**
 * HTTP Private API : 資産
 */

"use strict";

const base = require('./base');


/**
 * 資産残高を取得
 *
 * https://lightning.bitflyer.jp/docs#資産残高を取得
 */
class GetBalance extends base.Request {
  constructor() {
    super("GET", "/v1/me/getbalance", {}, true);
  }
}

/**
 * 証拠金の状態を取得
 *
 * https://lightning.bitflyer.jp/docs#証拠金の状態を取得
 */
class GetCollateral extends base.Request {
  constructor() {
    super("GET", "/v1/me/getcollateral", {}, true);
  }
}

module.exports.getbalance = GetBalance;
module.exports.getcollateral = GetCollateral;
