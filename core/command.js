"use strict";

const term = require('./terminal');
const api = require('../lightning/api');

const base = require('../lightning/builder/base');
const pub = require('../lightning/builder/pub');
const pri = require('../lightning/builder/pri');

const to_float = (s) => {
  let f = parseFloat(s);
  if (isNaN(f)) throw new Error("Error: could not convert string to number");
  return f;
};

const pass = (s) => s;

const upper = (s) => s.toUpperCase();

const price_or_market = (s) => s.toUpperCase() == 'MARKET' ? 'MARKET' : to_float(s);


class Command {
  constructor(name) {
    this._name = name;
    this._description = "";
    this._requireArgs = [];
    this._optionalArgs = [];
    this._action = () => {
    };
  }

  getName() {
    return this._name;
  }

  description(text) {
    this._description = text;
    return this;
  }

  getHelp() {
    return this._description;
  }

  getFullHelp() {
    return "\n    " + this._description + "\n" + this.getUsage();
  }

  requireArg(name, help, apply) {
    this._requireArgs.push({name: name, help: help, apply: apply});
    return this;
  }

  optionalArg(name, help, apply, defaultValue) {
    this._optionalArgs.push({name: name, help: help, apply: apply, _: defaultValue});
    return this;
  }

  action(func) {
    this._action = func;
    return this;
  }

  getUsage() {
    let usage = "\n    Usage: ." + this._name + " " +
      this._requireArgs.map(rule => "<" + rule.name + ">").join(" ") + " " +
      this._optionalArgs.map(rule => "[" + rule.name + "]").join(" ") + "\n";

    if (this._requireArgs.length || this._optionalArgs.length) {
      usage += "\n" + this.getUsageArgs() + "\n";
    }
    return usage;
  }

  getUsageArgs() {
    return [].concat(
      this._requireArgs.map(rule => `    <${rule.name}> ${rule.help}`),
      this._optionalArgs.map(rule => `    [${rule.name}] ${rule.help}`)
    ).join("\n");
  }

  parseArg(arg) {
    let argv = typeof arg === 'string' ? arg.trim().split(" ").filter(Boolean) : [];
    if (argv.length < this._requireArgs.length) throw new Error("Error: one or more arguments are required");

    return [].concat(
      this._requireArgs
        .map(rule => rule.apply(argv.shift())),
      this._optionalArgs
        .map(rule => argv.length ? rule.apply(argv.shift()) : rule._),
      argv
    );
  }

  doAction(context, arg) {
    if (arg == "help") {
      console.log(this.getFullHelp());
    } else {
      try {
        let argv = this.parseArg(arg);
        try {
          let data = this._action(argv);
          console.log(data);
        } catch (e) {
          console.error(term.colorful(term.yellow, e.message));
        }
      } catch (e) { // parse error
        console.error(term.colorful(term.yellow, e.message));
        console.log(this.getUsage());
      }
    }
    context.displayPrompt();
  }
}

module.exports.Command = Command;
module.exports.commands = {};

module.exports.commands.cls = new Command("bf_cls")
  .description("表示をクリアします")
  .action(argv => {
    return term.clear;
  });

module.exports.commands.markets = new Command("bf_markets")
  .description("マーケットの一覧を表示します")
  .action(argv => {
    return new pub.getmarkets().executeSync();
  });

module.exports.commands.health = new Command("bf_health")
  .description("取引所の稼動状況と板の状態を表示します")
  .optionalArg("product_code", "商品コード (default: BTC_JPY)", upper, "BTC_JPY")
  .action(argv => {
    return new pub.getboardstate()
      .product_code(argv[0]).executeSync();
  });

module.exports.commands.balance = new Command("bf_balance")
  .description("資産残高を表示します *")
  .action(argv => {
    return new pri.getbalance().executeSync();
  });

module.exports.commands.price = new Command("bf_price")
  .description("最終取引価格を表示します")
  .optionalArg("product_code", "商品コード (default: BTC_JPY)", upper, "BTC_JPY")
  .action(argv => {
    return new pub.ticker().product_code(argv[0]).executeSync();
  });

module.exports.commands.orders = new Command("bf_orders")
  .description("オープンな注文を最大10件表示します *")
  .optionalArg("product_code", "商品コード (default: BTC_JPY)", upper, "BTC_JPY")
  .action(argv => {
    return new pri.getchildorders()
      .product_code(argv[0])
      .child_order_state("ACTIVE")
      .count(10)
      .executeSync();
  });

module.exports.commands.histories = new Command("bf_histories")
  .description("注文の約定履歴を最大10件表示します *")
  .optionalArg("product_code", "商品コード (default: BTC_JPY)", upper, "BTC_JPY")
  .action(argv => {
    return new pri.getexecutions()
      .product_code(argv[0])
      .count(10)
      .executeSync();
  });

module.exports.commands.buy = new Command("bf_buy")
  .description("買い注文を発行します *")
  .requireArg("product_code", "商品コード", upper)
  .requireArg("price", "価格 (成行の場合は'MARKET'を指定)", price_or_market)
  .requireArg("size", "数量", parseFloat)
  .action(argv => {
    return new pri.sendchildorder()
      .product_code(argv[0])
      .side('BUY')
      .child_order_type(argv[1] == 'MARKET' ? 'MARKET' : 'LIMIT')
      .price(argv[1] == 'MARKET' ? null : argv[1])
      .size(argv[2])
      .executeSync();
  });

module.exports.commands.sell = new Command("bf_sell")
  .description("売り注文を発行します *")
  .requireArg("product_code", "商品コード", upper)
  .requireArg("price", "価格 (成行の場合は'MARKET'を指定)", price_or_market)
  .requireArg("size", "数量", parseFloat)
  .action(argv => {
    return new pri.sendchildorder()
      .product_code(argv[0])
      .side('SELL')
      .child_order_type(argv[1] == 'MARKET' ? 'MARKET' : 'LIMIT')
      .price(argv[1] == 'MARKET' ? null : argv[1])
      .size(argv[2])
      .executeSync();
  });

module.exports.commands.cancel = new Command("bf_cancel")
  .description("注文をキャンセルします *")
  .requireArg("product_code", "商品コード", upper)
  .requireArg("child_order_id", "オーダーIDまたは受付ID", pass)
  .action(argv => {
    let t = pri.cancelchildorder.create().product_code(argv[0]);
    if (/^.R/.test(argv[1])) t.child_order_acceptance_id(argv[1]);
    else t.child_order_id(argv[1]);

    return t.executeSync();
  });


module.exports.commands.set_key = new Command("bf_set_key")
  .description("API keyとAPI secretを登録します")
  .requireArg("api_key", "API key", pass)
  .requireArg("api_secret", "API secret", pass)
  .action(argv => {
    const pattern = /^[A-Za-z0-9/+]*=*$/;
    if (argv[0].match(pattern) && argv[1].match(pattern)) {
      pri.set_credential(argv[0], argv[1]);
      return "ok";
    } else {
      throw new Error("Error: API key and secret are invalid");
    }
  });

module.exports.commands.store_key = new Command("bf_store_key")
  .description("登録中のAPI keyとAPI secretをファイルに書き出します")
  .action(argv => {
    const c = pri.get_credential();
    if (c.api_key && c.api_secret) {
      require('fs').writeFileSync(
        ".credential.json", JSON.stringify(c), {mode: 384 /*0o600*/});
      return "'.credential.json' created";
    } else {
      throw new Error("Error: API key and API secret are null");
    }
  });
