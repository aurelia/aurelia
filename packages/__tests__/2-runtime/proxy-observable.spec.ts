import { ProxyObservable } from '@aurelia/runtime';
import { assert } from '@aurelia/testing';

describe('2-runtime/proxy-observable.spec.ts', function () {
  for (const { title, v, canWrap } of [
    // cant do
    { title: 'date', v: new Date(), canWrap: false },
    { title: 'date subclass', v: new class extends Date {}(), canWrap: false },
    { title: 'number', v: 1, canWrap: false },
    { title: 'string', v: '', canWrap: false },
    { title: 'bool', v: false, canWrap: false },
    { title: 'int 16', v: new Int16Array(), canWrap: false },

    // can do
    { title: 'proxy', v: new Proxy({}, {}), canWrap: true },
    { title: 'normal object', v: {}, canWrap: true },
    { title: 'Array', v: [], canWrap: true },
    { title: 'Array subclass', v: new class extends Array {}(), canWrap: true },
    { title: 'Map', v: new Map(), canWrap: true },
    { title: 'Map subclass', v: new class extends Map {}(), canWrap: true },
    { title: 'Set', v: new Set(), canWrap: true },
    { title: 'Set subclass', v: new class extends Set {}(), canWrap: true },
  ] as { title: string; v: unknown; canWrap: boolean }[]) {
    it(`it wraps/unwraps (${title}) (can${canWrap ? '' : 'not'} wrap)`, function () {
      const wrapped = ProxyObservable.wrap(v);
      if (canWrap) {
        assert.notStrictEqual(wrapped, v);
      } else {
        assert.strictEqual(wrapped, v);
      }
    });
  }
});
