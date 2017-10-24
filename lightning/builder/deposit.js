/**
 * HTTP Private API : 入出金
 */

"use strict";

const base = require('./base');


/**
 * 預入用アドレス取得
 *
 * https://lightning.bitflyer.jp/docs#預入用アドレス取得
 */
class GetAddresses extends base.Request {
  constructor() {
    super("GET", "/v1/me/getaddresses", {}, true);
  }
}

/**
 * 仮想通貨預入履歴
 *
 * https://lightning.bitflyer.jp/docs#仮想通貨預入履歴
 */
class GetCoinIns extends base.PagerMixin(base.Request) {
  constructor() {
    super("GET", "/v1/me/getcoinins", {}, true);
  }
}

/**
 * 仮想通貨送付履歴
 *
 * https://lightning.bitflyer.jp/docs#仮想通貨送付履歴
 */
class GetCoinOuts extends base.PagerMixin(base.Request) {
  constructor() {
    super("GET", "/v1/me/getcoinouts", {}, true);
  }
}

/**
 * 銀行口座一覧取得
 *
 * https://lightning.bitflyer.jp/docs#銀行口座一覧取得
 */
class GetBankAccounts extends base.Request {
  constructor() {
    super("GET", "/v1/me/getbankaccounts", {}, true);
  }
}

/**
 * 入金履歴
 *
 * https://lightning.bitflyer.jp/docs#入金履歴
 */
class GetDeposits extends base.PagerMixin(base.Request) {
  constructor() {
    super("GET", "/v1/me/getdeposits", {}, true);
  }
}

/**
 * 出金
 *
 * https://lightning.bitflyer.jp/docs#出金
 */
class Withdraw extends base.Request {
  constructor() {
    super("POST", "/v1/me/withdraw", {currency_code: "JPY"}, true);
  }

  _validation_schema() {
    return {
      type: "object",
      required: ["currency_code", "bank_account_id", "amount"]
    };
  }

  currency_code(v) {
    this._set("currency_code", base.upper(v), {"enum": Object.values(base.CURRENCY_CODE)});
    return this;
  }

  bank_account_id(v) {
    this._set("bank_account_id", v, {type: "number"});
    return this;
  }

  amount(v) {
    this._set("amount", v, {type: "number"});
    return this;
  }

  code(v) {
    this._set("code", v, {type: "string"});
    return this;
  }
}

/**
 * 出金履歴
 *
 * https://lightning.bitflyer.jp/docs#出金履歴
 */
class GetWithdrawals extends base.PagerMixin(base.Request){
  constructor() {
    super("GET", "/v1/me/getwithdrawals", {}, true);
  }

  message_id(v) {
    this._set("message_id", v, {type: "string"});
    return this;
  }
}


module.exports.getaddresses = GetAddresses;
module.exports.getcoinins = GetCoinIns;
module.exports.getcoinouts = GetCoinOuts;
module.exports.getbankaccounts = GetBankAccounts;
module.exports.getdeposits = GetDeposits;
module.exports.withdraw = Withdraw;
module.exports.getwithdrawals = GetWithdrawals;
