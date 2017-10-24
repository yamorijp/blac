/**
 * HTTP Private API : API
 */

"use strict";

const base = require('./base');

/**
 * APIキーの権限を取得
 *
 * https://lightning.bitflyer.jp/docs#api-キーの権限を取得
 */
class GetPermissions extends base.Request {
  constructor() {
    super("GET", "/v1/me/getpermissions", {}, true);
  }
}

module.exports.set_credential = base.set_credential;     // export
module.exports.get_credential = base.get_credential;     // export
module.exports.clear_credential = base.clear_credential; // export

module.exports.getpermissions = GetPermissions;
