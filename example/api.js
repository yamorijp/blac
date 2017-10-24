"use strict";

/*
 * generic interface
 */
const API_KEY = "YOUR_API_KEY";
const API_SECRET = "YOUR_API_SECRET";

const api = require('../lightning/api');

new api.PublicAPI()
  .call("GET", "/v1/getticker", {
    product_code: "BTC_JPY"}
  )
  .then(console.log)
  .catch(console.error);

new api.PrivateAPI(API_KEY, API_SECRET)
  .call("POST", "/v1/sendchildorder", {
    product_code: "BTC_JPY",
    child_order_type: "LIMIT",
    side: "BUY",
    price: 30000,
    size: 0.1,
    minute_to_expire: 10000,
    time_in_force: "GTC"
  })
  .then(console.log)
  .catch(console.error);

new api.PrivateAPI(API_KEY, API_SECRET)
  .call("POST", "/v1/sendparentorder", {
    "order_method": "IFDOCO",
    "minute_to_expire": 10000,
    "time_in_force": "GTC",
    "parameters": [
      {
        "product_code": "BTC_JPY",
        "condition_type": "LIMIT",
        "side": "BUY",
        "price": 30000,
        "size": 0.1
      },
      {
        "product_code": "BTC_JPY",
        "condition_type": "LIMIT",
        "side": "SELL",
        "price": 32000,
        "size": 0.1
      },
      {
        "product_code": "BTC_JPY",
        "condition_type": "STOP_LIMIT",
        "side": "SELL",
        "price": 28800,
        "trigger_price": 29000,
        "size": 0.1
      }]
  })
  .then(console.log)
  .catch(console.error);

