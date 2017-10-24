#!/usr/bin/env node

"use strict";

require('./core/polyfill');

const repl = require('repl');

const term = require('./core/terminal');
const command = require('./core/command');

const api = require('./lightning/api');
const pub = require('./lightning/builder/pub');
const pri = require('./lightning/builder/pri');

const version = require('./package.json').version;

const banner = `${term.yellow}${term.bold}
   _     _
  | |   | |
  | |__ | | __ _  ___
  | '_ \\| |/ _\` |/ __|
  | |_) | | (_| | (__
  |_.__/|_|\\__,_|\\___|
${term.reset}${term.yellow}
  bitflyer - lightning - api - console
${term.reset}

  コンテキスト変数:
    api      -> APIクライアント
    pub      -> パブリックAPI
    pri      -> プライベートAPIと認証

  コマンド:
    .help または .bf_* help を参照
    > .bf_buy help

  APIドキュメント:
    bitFlyer Lightning API - https://lightning.bitflyer.jp/docs

  例:
    > pri.set_credential(YOUR_API_KEY, YOUR_API_SECRET)
    > pri.getchildorders.create()
    > _.product_code("BTC_JPY").child_order_state("ACTIVE")
    > _.executeSync()


`;

const loadCredential = () => {
  try {
    const config = require('./.credential.json');
    if (config.api_key && config.api_secret) {
      pri.set_credential(config.api_key, config.api_secret);
      console.log(term.colorful(term.green, "  (.credential.json loaded)\n\n"));
    }
  } catch (e) {
    // not found
  }
};

const initContext = (context) => {
  context.api = api;
  context.pub = pub;
  context.pri = pri;
};


const main = (program) => {

  if (!program.nobanner) {
    process.stdout.write(term.clear);
    process.stdout.write(term.nl);
    process.stdout.write(banner);
  }

  loadCredential();

  let server = repl.start('> ');

  initContext(server.context);
  server.on('reset', initContext);

  Object.values(command.commands)
    .forEach(cmd => server.defineCommand(cmd.getName(), {
      help: cmd.getHelp(),
      action(arg) {
        cmd.doAction(server, arg);
      }
    }));
};


const program = require('commander');
program
  .version(require("./package.json").version)
  .description("bitflyer - lightning - api - console")
  .option("-n, --no-banner", "Don't show ugly startup banner", false)
  .on("--help", () => {
    console.log("");
    console.log("  Examples:");
    console.log("");
    console.log("    $ node console.js -n");
    console.log("");
  })
  .parse(process.argv);

main(program);
