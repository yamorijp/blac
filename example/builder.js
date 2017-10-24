"use strict";

/*
 * builder interface (repl向け)
 *
 * - パラメータセット時と実行時にバリデート
 *     throw jsonschema.ValidatorResult
 * - TABキーで補間
 */

const API_KEY = "YOUR_API_KEY";
const API_SECRET = "YOUR_API_SECRET";

const pub = require('../lightning/builder/pub');
const pri = require('../lightning/builder/pri');

pri.set_credential(API_KEY, API_SECRET);

pub.getticker.create()
  .product_code("btc_jpy")
  .execute()
  .then(console.log)
  .catch(console.error);

pri.sendchildorder.create()
  .product_code("btc_jpy")
  .child_order_type('limit')
  .side('buy')
  .price(30000)
  .size(0.1)
  .minute_to_expire(10000)
  .time_in_force('gtc')
  .execute()
  .then(console.log)
  .catch(console.error);

let parent = pri.sendparentorder.create()
  .order_method("ifdoco")
  .minute_to_expire(10000)
  .time_in_force('gtc');

pri.childorder.create()
  .product_code('btc_jpy')
  .condition_type('limit')
  .side('buy')
  .price(30000)
  .size(0.1)
  .addTo(parent);

pri.childorder.create()
  .product_code('btc_jpy')
  .condition_type('limit')
  .side('sell')
  .price(32000)
  .size(0.1)
  .addTo(parent);

pri.childorder.create()
  .product_code('btc_jpy')
  .condition_type('stop_limit')
  .side('sell')
  .price(28800)
  .trigger_price(29000)
  .size(0.1)
  .addTo(parent);

parent.execute()
  .then(console.log)
  .catch(console.error);
