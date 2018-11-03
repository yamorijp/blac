/**
 * bitFlyer Lightning API : Generic Client
 */

"use strict";

const qs = require('qs');
const crypto = require('crypto');
const request = require('then-request');
const requestSync = require('sync-request');

const ENDPOINT = "https://api.bitflyer.jp";
const ENDPOINT_IO = 'https://io.lightstream.bitflyer.com'
const io = require('socket.io-client');

let debug = false;

const set_debug = b => debug = b;

const decode_json = data => data === "" ? "" : JSON.parse(data);

/**
 * HTTP Public API クライアント
 *
 *     new PublicAPI()
 *         .call("GET", "/v1/getticker", {product_code: "BTC_JPY"})
 *         .then(console.log)
 *         .catch(console.error)
 */
class PublicAPI {

  makeRequest(method, path, params) {
    params = params && Object.keys(params).length ? params : null;
    method = method.toUpperCase();

    if (method == 'GET' && params) path += '?' + qs.stringify(params);
    let body = (method != 'GET' && params) ? JSON.stringify(params) : "";

    let url = ENDPOINT + path;
    let options = {
      headers: {"Content-Type": "application/json"},
      body: body,
      timeout: 10000,
      socketTimeout: 10000
    };
    return {method: method, url: url, options: options};
  }

  /**
   * リモートAPI呼び出し
   *
   * @param method {string}
   * @param path {string}
   * @param params {object}
   * @returns {Promise}
   */
  call(method, path, params) {
    let req = this.makeRequest(method, path, params);
    if (debug) {
      return Promise.resolve(req);
    } else {
      return request(req.method, req.url, req.options).getBody('utf-8').then(decode_json);
    }
  }

  /**
   * リモートAPI呼び出し (同期)
   * ブロッキング処理につきサーバーでは使用しないこと
   *
   * @param method {string}
   * @param path {string}
   * @param params {object}
   * @return {object}
   */
  callSync(method, path, params) {
    let req = this.makeRequest(method, path, params);
    if (debug) {
      return req;
    } else {
      let res = requestSync(req.method, req.url, req.options);
      return decode_json(res.getBody('utf-8'));
    }
  }
}

/**
 * HTTP Private API クライアント
 *
 *     new PrivateAPI(API_KEY, API_SECRET)
 *         .call("GET", "/v1/me/getchildorders", {product_code: "BTC_JPY"})
 *         .then(console.log)
 *         .catch(console.error)
 */
class PrivateAPI extends PublicAPI {

  constructor(api_key, api_secret) {
    super();
    this.setCredential(api_key, api_secret);
  }

  /**
   * 認証情報を設定する
   * @param api_key
   * @param api_secret
   */
  setCredential(api_key, api_secret) {
    this.key = api_key;
    this.secret = api_secret;
  }

  signRequest(timestamp, method, path, body) {
    return crypto.createHmac('sha256', this.secret)
      .update(timestamp + method + path + body).digest('hex');
  }

  makeRequest(method, path, params) {
    params = params && Object.keys(params).length ? params : null;
    method = method.toUpperCase();
    if (params && method == "GET") path = path + "?" + qs.stringify(params);
    let body = params && method != "GET" ? JSON.stringify(params) : "";

    let timestamp = Date.now().toString();
    let sign = this.signRequest(timestamp, method, path, body);

    let url = ENDPOINT + path;
    let options = {
      headers: {
        'ACCESS-KEY': this.key,
        'ACCESS-TIMESTAMP': timestamp,
        'ACCESS-SIGN': sign,
        'Content-Type': 'application/json'
      },
      body: body,
      timeout: 10000,
      socketTimeout: 10000
    };

    return {method: method, url: url, options: options};
  }
}


/**
 * Realtime API クライアント
 *
 *     new RealtimeAPI()
 *         .attach((channel, message) => {
 *             console.log(channel, message);
 *         })
 *         .subscribe(['lightning_ticker_BTC_JPY']);
 */
class RealtimeAPI {

  constructor(url = ENDPOINT_IO) {
    this.url = url;
    this.channels = [];
    this.listeners = [];
    this.client = io(url, {transports: ['websocket']});
  }

  subscribe(channels) {
    if (!Array.isArray(channels)) channels = [channels];
    this.channels = channels;
    this.channels.forEach(ch => this.client.emit('subscribe', ch)
      .on(ch, message => this.onMessage({channel: ch, message: message})));
    return this;
  }

  unsubscribe() {
    this.channels.forEach(channel => this.client.emit('unsubscribe', channel).off(channel));
    this.channels = [];
    return this;
  }

  attach(listener) {
    this.listeners.push(listener);
    return this;
  }

  detach(listener) {
    this.listeners = this.listeners.filter(i => i != listener);
    return this;
  }

  onMessage(data) {
    if (!data || !data.message) return;
    this.listeners.forEach(listener => listener(data.channel, data.message));
  }
}

module.exports.PublicAPI = PublicAPI;
module.exports.PrivateAPI = PrivateAPI;
module.exports.RealtimeAPI = RealtimeAPI;
module.exports.set_debug = set_debug;
