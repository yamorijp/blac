/**
 * HTTP Private API : トレード
 */

"use strict";

const base = require('./base');


/**
 * 新規注文を出す
 *
 * https://lightning.bitflyer.jp/docs#新規注文を出す
 */
class SendChildOrder extends base.ProductCodeMixin(base.Request) {

  constructor() {
    super("POST", "/v1/me/sendchildorder",
      {product_code: "BTC_JPY", child_order_type: "MARKET"}, true);
  }

  _validation_schema() {
    let schema = {
      type: "object",
      required: ["product_code", "child_order_type", "side", "size"]
    };
    if (this._params.child_order_type == "LIMIT") {
      schema.required.push("price");
    }
    return schema;
  }

  child_order_type(v) {
    this._set("child_order_type", base.upper(v), {"enum": Object.values(base.CHILD_ORDER_TYPE)});
    return this;
  }

  side(v) {
    this._set("side", base.upper(v), {"enum": Object.values(base.SIDE)});
    return this;
  }

  price(v) {
    this._set("price", v, {type: "number"});
    return this;
  }

  size(v) {
    this._set("size", v, {type: "number"});
    return this;
  }

  minute_to_expire(v) {
    this._set("minute_to_expire", v, {type: "number"});
    return this;
  }

  time_in_force(v) {
    this._set("time_in_force", base.upper(v), {"enum": Object.values(base.TIME_IN_FORCE)});
    return this;
  }
}

/**
 * 注文をキャンセルする
 *
 * https://lightning.bitflyer.jp/docs#注文をキャンセルする
 */
class CancelChildOrder extends base.ProductCodeMixin(base.Request) {

  constructor() {
    super("POST", "/v1/me/cancelchildorder", {product_code: "BTC_JPY"}, true);
  }

  _validation_schema() {
    return {
      type: "object",
      anyOf: [
        {required: ["child_order_id"]},
        {required: ["child_order_acceptance_id"]}
      ],
      required: ["product_code"]
    };
  }

  child_order_id(v) {
    this._set("child_order_id", v, {type: "string"});
    if (v !== null)
      delete this._params["child_order_acceptance_id"];
    return this;
  }

  child_order_acceptance_id(v) {
    this._set("child_order_acceptance_id", v, {type: "string"});
    if (v !== null)
      delete this._params["child_order_id"];
    return this;
  }
}

/**
 * 全ての注文をキャンセルする
 *
 * https://lightning.bitflyer.jp/docs#すべての注文をキャンセルする
 */
class CancelAllChildOrders extends base.ProductCodeMixin(base.Request) {

  constructor() {
    super("POST", "/v1/me/cancelallchildorders", {product_code: "BTC_JPY"}, true);
  }

  _validation_schema() {
    return {
      type: "object",
      required: ["product_code"]
    };
  }
}

/**
 * 注文の一覧を取得
 *
 * https://lightning.bitflyer.jp/docs#注文の一覧を取得
 */
class GetChildOrders extends base.PagerMixin(base.ProductCodeMixin(base.Request)) {

  constructor() {
    super("GET", "/v1/me/getchildorders", {product_code: "BTC_JPY"}, true);
  }

  _validation_schema() {
    return {
      type: "object",
      required: ["product_code"]
    };
  }

  child_order_state(v) {
    this._set("child_order_state", base.upper(v), {"enum": Object.values(base.CHILD_ORDER_STATE)});
    return this;
  }

  parent_order_id(v) {
    this._set("child_order_id", v, {type: "string"});
    return this;
  }
}

/**
 * 約定の一覧を取得
 *
 * https://lightning.bitflyer.jp/docs#約定の一覧を取得
 */
class GetExecutions extends base.PagerMixin(base.ProductCodeMixin(base.Request)) {
  constructor() {
    super("GET", "/v1/me/getexecutions", {product_code: "BTC_JPY"}, true);
  }

  _validation_schema() {
    return {
      type: "object",
      required: ["product_code"]
    };
  }

  child_order_id(v) {
    this._set("child_order_id", v, {type: "string"});
    return this;
  }

  child_order_acceptance_id(v) {
    this._set("child_order_acceptance_id", v, {type: "string"});
    return this;
  }
}

/**
 * 建玉の一覧を取得
 *
 * https://lightning.bitflyer.jp/docs#建玉の一覧を取得
 */
class GetPositions extends base.PagerMixin(base.ProductCodeMixin(base.Request)) {
  constructor() {
    super("GET", "/v1/me/getpositions", {product_code: "FX_BTC_JPY"}, true);
  }

  _validation_schema() {
    return {
      type: "object",
      required: ["product_code"]
    };
  }
}

/**
 * 証拠金の変動履歴を取得
 *
 * https://lightning.bitflyer.jp/docs#証拠金の変動履歴を取得
 */
class GetCollateralHistory extends base.PagerMixin(base.ProductCodeMixin(base.Request)) {

  constructor() {
    super("GET", "/v1/me/getcollateralhistory", {}, true);
  }
}

/**
 * 取引手数料を取得
 *
 * https://lightning.bitflyer.jp/docs#取引手数料を取得
 */
class GetTradingCommission extends base.ProductCodeMixin(base.Request) {

  constructor() {
    super("GET", "/v1/me/gettradingcommission", {product_code: "BTC_JPY"}, true);
  }

  _validation_schema() {
    return {
      type: "object",
      required: ["product_code"]
    };
  }
}


module.exports.sendchildorder = SendChildOrder;
module.exports.cancelchildorder = CancelChildOrder;
module.exports.cancelallchildorders = CancelAllChildOrders;
module.exports.getchildorders = GetChildOrders;
module.exports.gettradingcommission = GetTradingCommission;
module.exports.getexecutions = GetExecutions;
module.exports.getpositions = GetPositions;
module.exports.getcollateralhistory = GetCollateralHistory;
