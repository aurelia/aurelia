import { ProxyObservable, nowrap, ConnectableSwitcher, IConnectable } from '@aurelia/runtime';
import { assert } from '@aurelia/testing';

describe('2-runtime/proxy-observable.spec.ts', function () {
  for (const { title, v, canWrap } of [
    // cant do
    { title: 'date', v: new Date(), canWrap: false },
    { title: 'date subclass', v: new class extends Date { }(), canWrap: false },
    { title: 'number', v: 1, canWrap: false },
    { title: 'string', v: '', canWrap: false },
    { title: 'bool', v: false, canWrap: false },
    { title: 'int 16', v: new Int16Array(), canWrap: false },

    // can do
    { title: 'proxy', v: new Proxy({}, {}), canWrap: true },
    { title: 'normal object', v: {}, canWrap: true },
    { title: 'Array', v: [], canWrap: true },
    { title: 'Array subclass', v: new class extends Array { }(), canWrap: true },
    { title: 'Map', v: new Map(), canWrap: true },
    { title: 'Map subclass', v: new class extends Map { }(), canWrap: true },
    { title: 'Set', v: new Set(), canWrap: true },
    { title: 'Set subclass', v: new class extends Set { }(), canWrap: true },
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

  it('does not wrap object that has been marked as "nowrap"', function () {
    @nowrap
    class MyModel { }

    @nowrap()
    class MyModel2 { }

    const m1 = new MyModel();
    assert.strictEqual(m1, ProxyObservable.wrap(m1));

    const m2 = new MyModel2();
    assert.strictEqual(m2, ProxyObservable.wrap(m2));
  });

  it('does not wrap object inheriting from marked class', function () {
    @nowrap
    class MyModel { }

    class MyActualModel extends MyModel { }

    const m = new MyActualModel();
    assert.strictEqual(m, ProxyObservable.wrap(m));
  });

  it('does not wrap PROP marked @nowrap', function () {
    class MyModel {
      @nowrap i18n = null;
    }

    let count = 0;
    const m = ProxyObservable.wrap(new MyModel());
    const connectable = {
      observe() {
        count = 1;
      },
    } as unknown as IConnectable;
    ConnectableSwitcher.enter(connectable);
    // eslint-disable-next-line @typescript-eslint/no-unused-expressions
    m.i18n;
    ConnectableSwitcher.exit(connectable);
    assert.strictEqual(count, 1);
  });

  it('does not wrap PROP marked from parent', function () {
    class BaseModel {
      @nowrap i18n = null;
    }
    class MyModel extends BaseModel {
    }

    let count = 0;
    const m = ProxyObservable.wrap(new MyModel());
    const connectable = {
      observe() {
        count++;
      },
    } as unknown as IConnectable;
    ConnectableSwitcher.enter(connectable);
    // eslint-disable-next-line @typescript-eslint/no-unused-expressions
    m.i18n;
    ConnectableSwitcher.exit(connectable);
    assert.strictEqual(count, 1);
  });
});
