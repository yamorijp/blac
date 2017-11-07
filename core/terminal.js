"use strict";

const black = '\u001b[30m';
const red = '\u001b[31m';
const green = '\u001b[32m';
const yellow = '\u001b[33m';
const blue = '\u001b[34m';
const magenta = '\u001b[35m';
const cyan = '\u001b[36m';
const white = '\u001b[37m';

const bold = '\u001b[1m';
const underline = '\u001b[4m';

const reset = '\u001b[0m';

const clear = "\x1Bc";
const separator = "------------------------------------------------";
const nl = "\n";

const colorful = (color, value) => color + value + reset;
const updown_color = (left, right) => {
  if (left == right) return white;
  return left > right ? green : red;
};

module.exports.black = black;
module.exports.red = red;
module.exports.green = green;
module.exports.yellow = yellow;
module.exports.blue = blue;
module.exports.magenta = magenta;
module.exports.cyan = cyan;
module.exports.white = white;

module.exports.bold = bold;
module.exports.underline = underline;

module.exports.reset = reset;
module.exports.clear = clear;
module.exports.separator = separator;
module.exports.nl = nl;
module.exports.colorful = colorful;
module.exports.updown_color = updown_color;
module.exports.bid_color = green;
module.exports.ask_color = red;
