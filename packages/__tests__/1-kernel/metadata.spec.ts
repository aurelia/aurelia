import { Metadata, metadata } from '@aurelia/kernel';
import { assert } from '@aurelia/testing';

describe('Metadata', function () {
  describe('define', function () {
    it('throws TypeError on invalid target', function () {
      assert.throws(() => Metadata.define('key', 'value', void 0, void 0), TypeError);
    });

    it('does not throw on valid target without key', function () {
      assert.doesNotThrow(() => Metadata.define('key', 'value', { }, void 0));
    });

    it('does not throw on valid target with valid key', function () {
      assert.doesNotThrow(() => Metadata.define('key', 'value', { }, 'name'));
    });
  });

  describe('delete', function () {
    it('throws TypeError on invalid target', function () {
      assert.throws(() => Metadata.delete('key', void 0, void 0), TypeError);
    });

    it('returns false when metadata does not exist and without key', function () {
      const obj = {};

      const actual = Metadata.delete('key', obj, void 0);

      assert.strictEqual(actual, false);
    });

    it('returns true when metadata exists and without key', function () {
      const obj = {};
      Metadata.define('key', 'value', obj, void 0);

      const actual = Metadata.delete('key', obj, void 0);

      assert.strictEqual(actual, true);
    });

    it('returns false when metadata exists on the prototype and without key', function () {
      const prototype = {};
      Metadata.define('key', 'value', prototype, void 0);
      const obj = Object.create(prototype);

      const actual = Metadata.delete('key', obj, void 0);

      assert.strictEqual(actual, false);
    });

    it('returns false when metadata existed but was deleted prior', function () {
      const obj = {};
      Metadata.define('key', 'value', obj, void 0);
      Metadata.delete('key', obj, void 0);
      const actual = Metadata.hasOwn('key', obj, void 0);
      assert.strictEqual(actual, false);
    });
  });

  describe('get', function () {
    it('throws TypeError on invalid target', function () {
      assert.throws(() => Metadata.get('key', void 0, void 0), TypeError);
    });

    it('returns undefined when metadata does not exist and without key', function () {
      const obj = {};

      const actual = Metadata.get('key', obj, void 0);

      assert.strictEqual(actual, void 0);
    });

    it('returns the value when metadata exists and without key', function () {
      const obj = {};
      Metadata.define('key', 'value', obj, void 0);

      const actual = Metadata.get('key', obj, void 0);

      assert.strictEqual(actual, 'value');
    });

    it('returns the value when metadata exists on the prototype and without key', function () {
      const prototype = {};
      const obj = Object.create(prototype);
      Metadata.define('key', 'value', prototype, void 0);

      const actual = Metadata.get('key', obj, void 0);

      assert.strictEqual(actual, 'value');
    });

    it('returns undefined when metadata does not exist and with key', function () {
      const obj = {};

      const actual = Metadata.get('key', obj, 'name');

      assert.strictEqual(actual, void 0);
    });

    it('returns the value when metadata exists and with key', function () {
      const obj = {};
      Metadata.define('key', 'value', obj, 'name');

      const actual = Metadata.get('key', obj, 'name');

      assert.strictEqual(actual, 'value');
    });

    it('returns the value when metadata exists on the prototype and with key', function () {
      const prototype = {};
      const obj = Object.create(prototype);
      Metadata.define('key', 'value', prototype, 'name');

      const actual = Metadata.get('key', obj, 'name');

      assert.strictEqual(actual, 'value');
    });

    describe('getKeys', function () {
      it('throws TypeError on invalid target', function () {
        assert.throws(() => Metadata.getKeys(void 0, void 0), TypeError);
      });

      it('returns empty array when metadata does not exist and without key', function () {
        const obj = {};

        const actual = Metadata.getKeys(obj, void 0);

        assert.deepStrictEqual(actual, []);
      });

      it('returns correct keys when metadata exists and without key', function () {
        const obj = {};
        Metadata.define('key', 'value', obj, void 0);

        const actual = Metadata.getKeys(obj, void 0);

        assert.deepStrictEqual(actual, ['key']);
      });

      it('returns correct keys when metadata exists on the prototype and without key', function () {
        const prototype = {};
        const obj = Object.create(prototype);
        Metadata.define('key', 'value', prototype, void 0);

        const actual = Metadata.getKeys(obj, void 0);

        assert.deepStrictEqual(actual, ['key']);
      });

      it('returns correct keys in definition order when metadata exists and without key', function () {
        const obj = {};
        Metadata.define('key1', 'value', obj, void 0);
        Metadata.define('key0', 'value', obj, void 0);

        const actual = Metadata.getKeys(obj, void 0);

        assert.deepStrictEqual(actual, ['key1', 'key0']);
      });

      it('returns correct keys in definition order when metadata exists and redefined and without key', function () {
        const obj = {};
        Metadata.define('key1', 'value', obj, void 0);
        Metadata.define('key0', 'value', obj, void 0);
        Metadata.define('key1', 'value', obj, void 0);

        const actual = Metadata.getKeys(obj, void 0);

        assert.deepStrictEqual(actual, ['key1', 'key0']);
      });

      it('returns correct keys in definition order and reverse hierarchical prototype order when metadata exists on target and prototype and without key', function () {
        const prototype = {};
        Metadata.define('key2', 'value', prototype, void 0);
        const obj = Object.create(prototype);
        Metadata.define('key1', 'value', obj, void 0);
        Metadata.define('key0', 'value', obj, void 0);

        const actual = Metadata.getKeys(obj, void 0);

        assert.deepStrictEqual(actual, ['key1', 'key0', 'key2']);
      });

      it('returns empty array when metadata does not exist and with key', function () {
        const obj = {};

        const actual = Metadata.getKeys(obj, 'name');

        assert.deepStrictEqual(actual, []);
      });

      it('returns correct keys when metadata exists and with key', function () {
        const obj = {};
        Metadata.define('key', 'value', obj, 'name');

        const actual = Metadata.getKeys(obj, 'name');

        assert.deepStrictEqual(actual, ['key']);
      });

      it('returns correct keys when metadata exists on the prototype and with key', function () {
        const prototype = {};
        const obj = Object.create(prototype);
        Metadata.define('key', 'value', prototype, 'name');

        const actual = Metadata.getKeys(obj, 'name');

        assert.deepStrictEqual(actual, ['key']);
      });

      it('returns correct keys in definition order when metadata exists and redefined and with key', function () {
        const obj = {};
        Metadata.define('key1', 'value', obj, 'name');
        Metadata.define('key0', 'value', obj, 'name');
        Metadata.define('key1', 'value', obj, 'name');

        const actual = Metadata.getKeys(obj, 'name');

        assert.deepStrictEqual(actual, ['key1', 'key0']);
      });

      it('returns correct keys in definition order and reverse hierarchical prototype order when metadata exists on target and prototype and with key', function () {
        const prototype = {};
        Metadata.define('key2', 'value', prototype, 'name');
        const obj = Object.create(prototype);
        Metadata.define('key1', 'value', obj, 'name');
        Metadata.define('key0', 'value', obj, 'name');

        const actual = Metadata.getKeys(obj, 'name');

        assert.deepStrictEqual(actual, ['key1', 'key0', 'key2']);
      });
    });
  });

  describe('getOwn', function () {
    it('throws TypeError on invalid target', function () {
      assert.throws(() => Metadata.getOwn('key', void 0, void 0), TypeError);
    });

    it('returns undefined when metadata does not exist and without key', function () {
      const obj = {};

      const actual = Metadata.getOwn('key', obj, void 0);

      assert.strictEqual(actual, void 0);
    });

    it('returns the value when metadata exists and without key', function () {
      const obj = {};
      Metadata.define('key', 'value', obj, void 0);

      const actual = Metadata.getOwn('key', obj, void 0);

      assert.strictEqual(actual, 'value');
    });

    it('returns undefined when metadata exists on the prototype and without key', function () {
      const prototype = {};
      const obj = Object.create(prototype);
      Metadata.define('key', 'value', prototype, void 0);

      const actual = Metadata.getOwn('key', obj, void 0);

      assert.strictEqual(actual, void 0);
    });

    it('returns undefined when metadata does not exist and with key', function () {
      const obj = {};

      const actual = Metadata.getOwn('key', obj, 'name');

      assert.strictEqual(actual, void 0);
    });

    it('returns the value when metadata exists and with key', function () {
      const obj = {};
      Metadata.define('key', 'value', obj, 'name');

      const actual = Metadata.getOwn('key', obj, 'name');

      assert.strictEqual(actual, 'value');
    });

    it('returns undefined when metadata exists on the prototype and with key', function () {
      const prototype = {};
      const obj = Object.create(prototype);
      Metadata.define('key', 'value', prototype, 'name');

      const actual = Metadata.getOwn('key', obj, 'name');

      assert.strictEqual(actual, void 0);
    });
  });

  describe('getOwnKeys', function () {
    it('throws TypeError on invalid target', function () {
      assert.throws(() => Metadata.getOwnKeys(void 0, void 0), TypeError);
    });

    it('returns empty array when metadata does not exist and without key', function () {
      const obj = {};

      const actual = Metadata.getOwnKeys(obj, void 0);

      assert.deepStrictEqual(actual, []);
    });

    it('returns correct keys when metadata exists and without key', function () {
      const obj = {};
      Metadata.define('key', 'value', obj, void 0);

      const actual = Metadata.getOwnKeys(obj, void 0);

      assert.deepStrictEqual(actual, ['key']);
    });

    it('returns correct keys when metadata exists on the prototype and without key', function () {
      const prototype = {};
      const obj = Object.create(prototype);
      Metadata.define('key', 'value', prototype, void 0);

      const actual = Metadata.getOwnKeys(obj, void 0);

      assert.deepStrictEqual(actual, []);
    });

    it('returns correct keys in definition order when metadata exists and without key', function () {
      const obj = {};
      Metadata.define('key1', 'value', obj, void 0);
      Metadata.define('key0', 'value', obj, void 0);

      const actual = Metadata.getOwnKeys(obj, void 0);

      assert.deepStrictEqual(actual, ['key1', 'key0']);
    });

    it('returns correct keys in definition order when metadata exists and redefined and without key', function () {
      const obj = {};
      Metadata.define('key1', 'value', obj, void 0);
      Metadata.define('key0', 'value', obj, void 0);
      Metadata.define('key1', 'value', obj, void 0);

      const actual = Metadata.getOwnKeys(obj, void 0);

      assert.deepStrictEqual(actual, ['key1', 'key0']);
    });

    it('returns empty array when metadata does not exist and with key', function () {
      const obj = {};

      const actual = Metadata.getOwnKeys(obj, 'name');

      assert.deepStrictEqual(actual, []);
    });

    it('returns correct keys when metadata exists and with key', function () {
      const obj = {};
      Metadata.define('key', 'value', obj, 'name');

      const actual = Metadata.getOwnKeys(obj, 'name');

      assert.deepStrictEqual(actual, ['key']);
    });

    it('returns correct keys when metadata exists on the prototype and with key', function () {
      const prototype = {};
      const obj = Object.create(prototype);
      Metadata.define('key', 'value', prototype, 'name');

      const actual = Metadata.getOwnKeys(obj, 'name');

      assert.deepStrictEqual(actual, []);
    });

    it('returns correct keys in definition order when metadata exists and redefined and with key', function () {
      const obj = {};
      Metadata.define('key1', 'value', obj, 'name');
      Metadata.define('key0', 'value', obj, 'name');
      Metadata.define('key1', 'value', obj, 'name');

      const actual = Metadata.getOwnKeys(obj, 'name');

      assert.deepStrictEqual(actual, ['key1', 'key0']);
    });
  });

  describe('has', function () {
    it('throws TypeError on invalid target', function () {
      assert.throws(() => Metadata.has('key', void 0, void 0), TypeError);
    });

    it('returns false when metadata does not exist and without key', function () {
      const obj = {};

      const actual = Metadata.has('key', obj, void 0);

      assert.strictEqual(actual, false);
    });

    it('returns true when metadata exists and without key', function () {
      const obj = {};
      Metadata.define('key', 'value', obj, void 0);

      const actual = Metadata.has('key', obj, void 0);

      assert.strictEqual(actual, true);
    });

    it('returns true when metadata exists on the prototype and without key', function () {
      const prototype = {};
      const obj = Object.create(prototype);
      Metadata.define('key', 'value', prototype, void 0);

      const actual = Metadata.has('key', obj, void 0);

      assert.strictEqual(actual, true);
    });

    it('returns false when metadata does not exist and with key', function () {
      const obj = {};

      const actual = Metadata.has('key', obj, 'name');

      assert.strictEqual(actual, false);
    });

    it('returns true when metadata exists and with key', function () {
      const obj = {};
      Metadata.define('key', 'value', obj, 'name');

      const actual = Metadata.has('key', obj, 'name');

      assert.strictEqual(actual, true);
    });

    it('returns true when metadata exists on the prototype and with key', function () {
      const prototype = {};
      const obj = Object.create(prototype);
      Metadata.define('key', 'value', prototype, 'name');

      const actual = Metadata.has('key', obj, 'name');

      assert.strictEqual(actual, true);
    });
  });

  describe('hasOwn', function () {
    it('throws TypeError on invalid target', function () {
      assert.throws(() => Metadata.hasOwn('key', void 0, void 0), TypeError);
    });

    it('returns false when metadata does not exist and without key', function () {
      const obj = {};

      const actual = Metadata.hasOwn('key', obj, void 0);

      assert.strictEqual(actual, false);
    });

    it('returns true when metadata exists and without key', function () {
      const obj = {};
      Metadata.define('key', 'value', obj, void 0);

      const actual = Metadata.hasOwn('key', obj, void 0);

      assert.strictEqual(actual, true);
    });

    it('returns false when metadata exists on the prototype and without key', function () {
      const prototype = {};
      const obj = Object.create(prototype);
      Metadata.define('key', 'value', prototype, void 0);

      const actual = Metadata.hasOwn('key', obj, void 0);

      assert.strictEqual(actual, false);
    });

    it('returns false when metadata does not exist and with key', function () {
      const obj = {};

      const actual = Metadata.hasOwn('key', obj, 'name');

      assert.strictEqual(actual, false);
    });

    it('returns true when metadata exists and with key', function () {
      const obj = {};
      Metadata.define('key', 'value', obj, 'name');

      const actual = Metadata.hasOwn('key', obj, 'name');

      assert.strictEqual(actual, true);
    });

    it('returns false when metadata exists on the prototype and with key', function () {
      const prototype = {};
      const obj = Object.create(prototype);
      Metadata.define('key', 'value', prototype, 'name');

      const actual = Metadata.hasOwn('key', obj, 'name');

      assert.strictEqual(actual, false);
    });
  });

  describe('metadata', function () {
    it('returns a decorator function', function () {
      const actual = metadata('key', 'value');

      assert.strictEqual(typeof actual, 'function');
    });

    it('throws TypeError on invalid target with valid key', function () {
      const decorator = metadata('key', 'value');

      assert.throws(() => decorator(void 0, 'name'), TypeError);
    });

    it('throws TypeError on valid target with invalid key', function () {
      const decorator = metadata('key', 'value');

      assert.throws(() => decorator({}, {} as any), TypeError);
    });

    it('adds metadata to the target and without key', function () {
      const decorator = metadata('key', 'value');
      const target = function () { /* do nothing */ };
      decorator(target);

      const actual = Metadata.hasOwn('key', target, void 0);

      assert.strictEqual(actual, true);
    });

    it('adds metadata to the target and with key', function () {
      const decorator = metadata('key', 'value');
      const target = {};
      decorator(target, 'name');

      const actual = Metadata.hasOwn('key', target, 'name');

      assert.strictEqual(actual, true);
    });
  });
});
