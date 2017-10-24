require('../core/polyfill');

const assert = require('assert');
const command = require('../core/command');
const pri = require('../lightning/builder/pri');

const upper = s => s.toUpperCase();
const pass = s => s;
const load_credential = () => {
  try {
    const config = require('../.credential.json');
    if (config.api_key && config.api_secret) {
      pri.set_credential(config.api_key, config.api_secret);
      return true;
    }
  } catch (e) {
  }
  return false;
};

describe('command class argument parser', () => {
  describe('required arguments', () => {
    const cmd = new command.Command()
      .requireArg("r1", "require arg1", upper)
      .requireArg("r2", "require arg2", upper);
    it('should return array', () => {
      assert.deepEqual(cmd.parseArg("hello world"), ["HELLO", "WORLD"]);
    });
    it('extra arguments are just added to array', () => {
      assert.deepEqual(cmd.parseArg("hello world mocha"), ["HELLO", "WORLD", "mocha"]);
    });
    it('should throw error if some arguments is missing', () => {
      assert.throws(() => cmd.parseArg("hello"), Error);
    });
  });

  describe('optional arguments', () => {
    const cmd = new command.Command()
      .optionalArg("o1", "optional arg1", upper, "default1")
      .optionalArg("o2", "optional arg1", upper, "default2");
    it('should return array', () => {
      assert.deepEqual(cmd.parseArg("hello world"), ["HELLO", "WORLD"]);
    });
    it('it is ok even if some arguments is missing', () => {
      assert.deepEqual(cmd.parseArg("hello"), ["HELLO", "default2"]);
      assert.deepEqual(cmd.parseArg(null), ["default1", "default2"]);
    });
  });

  describe('mix require and optional', () => {
    const cmd = new command.Command()
      .requireArg("r1", "require arg1", upper, "default1")
      .optionalArg("o1", "optional arg1", upper, "default2");
    it('should return array', () => {
      assert.deepEqual(cmd.parseArg("hello world"), ["HELLO", "WORLD"]);
    });
    it('optional arguments is processed after required one', () => {
      assert.deepEqual(cmd.parseArg("hello"), ["HELLO", "default2"]);
    });
    it('required arguments is require', () => {
      assert.throws(() => cmd.parseArg(""), Error);
    });
  });
});

describe('cls command', () => {
  const cmd = command.commands.cls;

  describe('_action', () => {
    it('should return clear code', () => {
      assert.equal(cmd._action([]), require('../core/terminal').clear);
    });
  });
});

describe('markets command', () => {
  const cmd = command.commands.markets;
  describe('_action', () => {
    it('should return getmarkets api response', () => {
      let resp = cmd._action([]);
      assert.ok(resp[0].product_code);
    });
  });
});

describe('health command', () => {
  const cmd = command.commands.health;

  describe('_action', () => {
    it('should return getboardstate api response', () => {
      let resp = cmd._action(["BTC_JPY"]);
      assert.ok(resp.health);
      assert.ok(resp.state);
    });
  });
});

describe('balance command', () => {
  const cmd = command.commands.balance;
  describe('_action', () => {

    it('should return getbalance api response', () => {
      if (!load_credential()) {
        assert.fail("this test requires credential!");
        return;
      }
      let resp = cmd._action([]);
      assert.ok(resp[0].currency_code);
      assert.ok(resp[0].amount);
    });

    it('require credential', () => {
      pri.clear_credential();
      assert.throws(() => cmd._action([]), Error);
    });
  });
});

describe('price command', () => {
  const cmd = command.commands.price;
  describe('_action', () => {
    it('should return ticker api response', () => {
      let resp = cmd._action(["BTC_JPY"]);
      assert.ok(resp.product_code);
      assert.ok(resp.ltp);
    });
  });
});


describe('orders command', () => {
  const cmd = command.commands.orders;
  describe('_action', () => {
    it('should return getchildorders api response', () => {
      if (!load_credential()) {
        assert.fail("this test requires credential!");
        return;
      }
      let resp = cmd._action(["BTC_JPY"]);
      assert.ok(Array.isArray(resp));
    });

    it('require credential', () => {
      pri.clear_credential();
      assert.throws(() => cmd._action([]), Error);
    });
  });
});

describe('histories command', () => {
  const cmd = command.commands.histories;
  describe('_action', () => {
    it('should return getexecutions api response', () => {
      if (!load_credential()) {
        assert.fail("this test requires credential!");
        return;
      }
      let resp = cmd._action(["BTC_JPY"]);
      assert.ok(Array.isArray(resp));
    });

    it('require credential', () => {
      pri.clear_credential();
      assert.throws(() => cmd._action([]), Error);
    });
  });
});

describe('buy command', () => {
  const cmd = command.commands.buy;
  describe('_action', () => {
    it('should return sendchildorder api response', () => {
      if (!load_credential()) {
        assert.fail("this test requires credential!");
        return;
      }

      // I'm not rich. I don't wanna pay GAS.
      // let data = cmd._action(["BTC_JPY", 600000, 0.001]);
      // assert.ok(data.child_order_acceptance_id);

      try {
        cmd._action(["BTC_JPY", 0.0, 0.0]);
        assert.fail("why no error?");
      } catch (e) {
        assert.ok(e instanceof Error);
        assert.equal(e.statusCode, 400);
      }
    });

    it('require credential', () => {
      pri.clear_credential();
      assert.throws(() => cmd._action([]), Error);
    });
  });
});

describe('sell command', () => {
  const cmd = command.commands.sell;
  describe('_action', () => {
    it('should return sendchildorder api response', () => {
      if (!load_credential()) {
        assert.fail("this test requires credential!");
        return;
      }

      // Before I said. I am a poor man.
      // let data = cmd._action(["BTC_JPY", 600000, 0.001]);
      // assert.ok(data.child_order_acceptance_id);

      try {
        cmd._action(["BTC_JPY", 0.0, 0.0]);
        assert.fail("why no error?");
      } catch (e) {
        assert.ok(e instanceof Error);
        assert.equal(e.statusCode, 400);
      }
    });

    it('require credential', () => {
      pri.clear_credential();
      assert.throws(() => cmd._action([]), Error);
    });
  });
});


describe('cancel command', () => {
  const cmd = command.commands.cancel;
  describe('_action', () => {
    it('should return cancelchildorder api response', () => {
      if (!load_credential()) {
        assert.fail("this test requires credential!");
        return;
      }

      let data = cmd._action(["BTC_JPY", "JOR20171022-064933-xxxxxx"]);
      assert.ok(true);
    });

    it('require credential', () => {
      pri.clear_credential();
      assert.throws(() => cmd._action([]), Error);
    });
  });
});
