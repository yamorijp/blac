/**
 * HTTP Private API
 */


"use strict";

module.exports = Object.assign({},
  require('./auth'),
  require('./asset'),
  require('./deposit'),
  require('./trade'),
  require('./trade_sp')
);
