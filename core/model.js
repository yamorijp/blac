"use strict";

class Board {

  constructor() {
    this.bids = new Map();
    this.asks = new Map();
    this.locking = false;
    this.pendings = [];
    this.factor = 0.0;
    this.size = 24;
  }

  setGroupingFactor(n) {
    this.factor = n;
    return this;
  }

  setRowCount(n) {
    this.size = n;
    return this;
  }

  lock() {
    this.locking = true;
    return this;
  }

  unlock() {
    this.locking = false;
    this.pendings.forEach(data => this.update(data));
    this.pendings = [];
    return this;
  }

  setData(data) {
    this.bids.clear();
    data.bids.forEach(row => this.bids.set(row.price, row.size));
    this.asks.clear();
    data.asks.forEach(row => this.asks.set(row.price, row.size));
    return this;
  }

  update(data) {
    if (this.locking) {
      this.pendings.push(data);
    } else {
      data.bids.forEach(obj => {
        if (obj.size == 0.0) {
          this.bids.delete(obj.price);
        } else {
          this.bids.set(obj.price, obj.size);
        }
      });
      data.asks.forEach(obj => {
        if (obj.size == 0.0) {
          this.asks.delete(obj.price);
        } else {
          this.asks.set(obj.price, obj.size);
        }
      });
    }
    return this;
  }

  _grouping(data, factor, func) {
    let groups = new Map();
    data.forEach((size, price) => {
      let group = func(price / factor) * factor;
      groups.set(group, (groups.get(group) || 0.0) + size);
    });
    return groups;
  }

  getBids() {
    let rows = this.factor == 0.0 ? this.bids : this._grouping(this.bids, this.factor, Math.floor);
    return Array.from(rows.keys())
      .sort((a, b) => b - a)
      .slice(0, this.size)
      .map(price => [price, rows.get(price)])
  }

  getAsks() {
    let rows = this.factor == 0.0 ? this.asks : this._grouping(this.asks, this.factor, Math.ceil);
    return Array.from(rows.keys())
      .sort((a, b) => b - a)
      .slice(-this.size)
      .map(price => [price, rows.get(price)])
  }
}


class ExecutionBuffer {

  constructor() {
    this.capacity = 48;
    this.data = [];
    this.locking = false;
    this.pendings = [];
  }

  setCapacity(n) {
    this.capacity = n;
    return this;
  }

  lock() {
    this.locking = true;
    return this;
  }

  unlock() {
    this.locking = false;
    this.pendings.forEach(data => this.add(data));
    this.pendings = [];
    return this;
  }

  size() {
    return this.data.length;
  }

  _toEntity(row) {
    return {
      time: new Date(row.exec_date),
      side: row.side,
      price: row.price,
      size: row.size,
      total: row.price * row.size
    };
  }


  getStats() {
    let buy_volume = this.data
      .filter(row => row.side == 'BUY')
      .reduce((prev, curr) => prev + curr.size, 0.0);
    let sell_volume = this.data
      .filter(row => row.side == 'SELL')
      .reduce((prev, curr) => prev + curr.size, 0.0);
    let ratio = 1.0 * buy_volume / sell_volume;
    return {
      buy_volume: buy_volume,
      sell_volume: sell_volume,
      ratio: ratio
    };
  }

  set(obj) {
    this.data = obj.reverse()
      .slice(-this.capacity)
      .map(row => this._toEntity(row));
    return this;
  }

  add(obj) {
    if (!Array.isArray(obj)) obj = [obj];
    if (this.locking) {
      this.pendings.push(obj);
    } else {
      obj.reverse()
        .slice(-this.capacity)
        .map(row => this._toEntity(row))
        .forEach(row => this.data.push(row));
      if (this.data.length > this.capacity) {
        this.data = this.data.slice(-this.capacity);
      }
    }
    return this;
  }
}


class Ticker {

  constructor() {
    this.price_old = 0.0;
    this.price = 0.0;
    this.ratio = 0.0;
    this.volume = 0.0;
  }

  update(data) {
    this.price_old = this.price;
    this.price = data.ltp;
    this.ratio = (data.total_bid_depth / data.total_ask_depth);
    this.volume = data.volume_by_product;
    return this;
  }
}


class Health {

  constructor() {
    this.health = "";
    this.state = "";
  }

  update(data) {
    this.health = data.health;
    this.state = data.state;
    return this;
  }
}


module.exports.Board = Board;
module.exports.ExecutionBuffer = ExecutionBuffer;
module.exports.Ticker = Ticker;
module.exports.Health = Health;
