/**
 * HTTP Private API : トレード (特殊注文)
 */

"use strict";

const base = require('./base');


/**
 * 新規の親注文を出す（特殊注文）
 */
class SendParentOrder extends base.Request {

  constructor() {
    super("POST", "/v1/me/sendparentorder", {parameters: []}, true);
  }

  order_method(v) {
    this._set("order_method", base.upper(v), {"enum": Object.values(base.ORDER_METHOD)});
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

  parameters(v) {
    this._set("parameters", v, {type: "array"});
    return this;
  }

  addChild(child) {
    if (child instanceof ChildOrder) {
      child._validate();
      this._params.parameters.push(child._params);
    } else {
      throw new Error("child must be ChildOrder instance");
    }
    return this;
  }
}


/**
 * 親注文に追加する子注文を生成する
 */
class ChildOrder extends base.ProductCodeMixin(base.Request) {

  constructor() {
    super("", "", {product_code: "BTC_JPY"}, false);
  }

  execute() {
    throw new Error("ChildOrder cannot execute");
  }

  addTo(parent) {
    parent.addChild(this);
    return this;
  }

  _validation_schema() {
    let schema = {
      type: "object",
      required: ["product_code", "condition_type", "side", "size"]
    };

    let ct = this._params.condition_type;
    if (ct == "LIMIT" || ct == "STOP_LIMIT") {
      schema.required.push("price");
    } else if (ct == "STOP" || ct == "STOP_LIMIT") {
      schema.required.push("trigger_price");
    } else if (ct == "TRAIL") {
      schema.required.push("offset");
    }

    return schema;
  }

  condition_type(v) {
    this._set("condition_type", base.upper(v), {"enum": Object.values(base.CONDITION_TYPE)});
    return this;
  }

  side(v) {
    this._set("side", base.upper(v), {"enum": Object.values(base.SIDE)});
    return this;
  }

  size(v) {
    this._set("size", v, {type: "number"});
    return this;
  }

  price(v) {
    this._set("price", v, {type: "number"});
    return this;
  }

  trigger_price(v) {
    this._set("trigger_price", v, {type: "number"});
    return this;
  }

  offset(v) {
    this._set("offset", v, {type: "number"});
    return this;
  }
}


/**
 * 親注文をキャンセルする
 */
class CancelParentOrder extends base.ProductCodeMixin(base.Request) {
  constructor() {
    super("POST", "/v1/me/cancelparentorder", {product_code: "BTC_JPY"}, true);
  }

  _validation_schema() {
    return {
      type: "object",
      anyOf: [
        {required: ["parent_order_id"]},
        {required: ["parent_order_acceptance_id"]}
      ],
      required: ["product_code"]
    };
  }

  parent_order_id(v) {
    this._set("parent_order_id", v, {type: "string"});
    if (v !== null)
      delete this._params["parent_order_acceptance_id"];
    return this;
  }

  parent_order_acceptance_id(v) {
    this._set("parent_order_acceptance_id", v, {type: "string"});
    if (v !== null)
      delete this._params["parent_order_id"];
    return this;
  }
}

/**
 * 親注文の一覧を取得
 */
class GetParentOrders extends base.PagerMixin(base.ProductCodeMixin(base.Request)) {
  constructor() {
    super("GET", "/v1/me/getparentorders", {product_code: "BTC_JPY"}, true);
  }

  _validation_schema() {
    return {
      type: "object",
      required: ["product_code"]
    };
  }

  parent_order_state(v) {
    this._set("parent_order_state", base.upper(v), {"enum": Object.values(base.PARENT_ORDER_STATE)});
    return this;
  }
}

/**
 * 親注文の詳細を取得
 */
class GetParentOrder extends base.Request {
  constructor() {
    super("GET", "/v1/me/getparentorder", {}, true);
  }

  _validation_schema() {
    return {
      type: "object",
      anyOf: [
        {required: ["parent_order_id"]},
        {required: ["parent_order_acceptance_id"]}
      ]
    };
  }

  parent_order_id(v) {
    this._set("parent_order_id", v, {type: "string"});
    if (v !== null)
      delete this._params["parent_order_acceptance_id"];
    return this;
  }

  parent_order_acceptance_id(v) {
    this._set("parent_order_acceptance_id", v, {type: "string"});
    if (v !== null)
      delete this._params["parent_order_id"];
    return this;
  }
}

module.exports.sendparentorder = SendParentOrder;
module.exports.childorder = ChildOrder;
module.exports.cancelparentorder = CancelParentOrder;
module.exports.getparentorders = GetParentOrders;
module.exports.getparentorder = GetParentOrder;
