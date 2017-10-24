"use strict";

const jschema = require('jsonschema');
const api = require('../api');

const PRODUCT_CODE = {
  BTC_JPY: "BTC_JPY",
  ETH_BTC: "ETH_BTC",
  FX_BTC_JPY: "FX_BTC_JPY",
  BCH_BTC: "BCH_BTC"
};

const CHILD_ORDER_TYPE = {
  LIMIT: "LIMIT",
  MARKET: "MARKET"
};

const SIDE = {
  BUY: "BUY",
  SELL: "SELL"
};

const CHILD_ORDER_STATE = {
  ACTIVE: "ACTIVE",
  COMPLETED: "COMPLETED",
  CANCELED: "CANCELED",
  EXPIRED: "EXPIRED",
  REJECTED: "REJECTED"
};

const PARENT_ORDER_STATE = {
  ACTIVE: "ACTIVE",
  COMPLETED: "COMPLETED",
  CANCELED: "CANCELED",
  EXPIRED: "EXPIRED",
  REJECTED: "REJECTED"
};

const ORDER_METHOD = {
  SIMPLE: "SIMPLE",
  IFD: "IFD",
  OCO: "OCO",
  IFDOCO: "IFDOCO"
};

const TIME_IN_FORCE = {
  GTC: "GTC",
  IOC: "IOC",
  FOK: "FOK"
};

const CONDITION_TYPE = {
  LIMIT: "LIMIT",
  MARKET: "MARKET",
  STOP: "STOP",
  STOP_LIMIT: "STOP_LIMIT",
  TRAIL: "TRAIL"
};

const CURRENCY_CODE = {
  JPY: "JPY"
};

let apiPrivate = new api.PrivateAPI(null, null);
let apiPublic = new api.PublicAPI();
let _credential = null;

/**
 * Builderで使用するAPI keyとAPI secretを登録
 */
const set_credential = (api_key, api_secret) => {
  _credential = {api_key: api_key, api_secret: api_secret};
};

/**
 * Builderで使用中のAPI KeyとAPI secretを取得
 */
const get_credential = () => _credential;

/**
 * API keyとAPI secretを削除
 */
const clear_credential = () => {
  set_credential(null, null);
};

/**
 * null以外は強制的に大文字文字列化
 */
const upper = (v) => v === null ? v : (v + "").toUpperCase();


/**
 * BuilderAPIベースクラス
 */
class Request {

  constructor(method, path, defaultParams, isPrivate) {
    this._method = method;
    this._path = path;
    this._params = defaultParams;
    this._is_private = isPrivate;
  }

  toString() {
    return `${this._method} ${this._path}\t${JSON.stringify(this._params)}`;
  }

  static create() {
    return new this();
  }

  execute(sync) {
    this._validate();
    let client;
    if (this._is_private) {
      let credential = get_credential();
      if (!credential) {
        throw new Error("Private API requires Credential. Please call 'auth.set_credential(API_KEY, API_SECRET)'.");
      }
      client = apiPrivate;
      client.setCredential(credential.api_key, credential.api_secret);
    } else {
      client = apiPublic;
    }

    if (sync) {
      return client.callSync(this._method, this._path, this._params);
    } else {
      return client.call(this._method, this._path, this._params);
    }
  }

  executeSync() {
    return this.execute(true);
  }

  _validate() {
    let result = jschema.validate(this._params, this._validation_schema());
    if (result.errors.length > 0) throw result;
  }

  _validation_schema() {
    return {};
  }

  _set(name, v, schema) {
    // null means delete
    if (v === null) {
      delete this._params[name];
      return;
    }
    let result = jschema.validate(v, schema, {propertyName: name});
    if (result.errors.length > 0) throw result;

    this._params[name] = result.instance;
  }

  setParams(data) {
    Object.entries(data).forEach(item => {
      if (typeof(this[item[0]]) === 'function') {
        this[item[0]](item[1]);
      }
    });
    return this;
  }
}


/**
 * Mixin: プロダクトコードプロパティを追加
 */
let ProductCodeMixin = (superclass) => class extends superclass {

  product_code(v) {
    this._set("product_code", v.toUpperCase(), {type: "string"});
    return this;
  }
};


/**
 * Mixin: ページング用プロパティを追加
 */
let PagerMixin = (superclass) => class extends superclass {

  count(v) {
    this._set("count", v, {type: "number"});
    return this;
  }

  before(v) {
    this._set("before", v, {type: "number"});
    return this;
  }

  after(v) {
    this._set("after", v, {type: "after"});
    return this;
  }
};


module.exports.PRODUCT_CODE = PRODUCT_CODE;
module.exports.CHILD_ORDER_TYPE = CHILD_ORDER_TYPE;
module.exports.SIDE = SIDE;
module.exports.CHILD_ORDER_STATE = CHILD_ORDER_STATE;
module.exports.PARENT_ORDER_STATE = PARENT_ORDER_STATE;
module.exports.ORDER_METHOD = ORDER_METHOD;
module.exports.TIME_IN_FORCE = TIME_IN_FORCE;
module.exports.CONDITION_TYPE = CONDITION_TYPE;
module.exports.CURRENCY_CODE = CURRENCY_CODE;

module.exports.get_credential = get_credential;
module.exports.set_credential = set_credential;
module.exports.clear_credential = clear_credential;
module.exports.upper = upper;

module.exports.Request = Request;
module.exports.PagerMixin = PagerMixin;
module.exports.ProductCodeMixin = ProductCodeMixin;
