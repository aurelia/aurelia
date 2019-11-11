import { PLATFORM, Primitive, IIndexable } from '@aurelia/kernel';
import {
  LifecycleFlags as LF,
  PrimitiveObserver,
  SelfObserver,
  SetterObserver
} from '@aurelia/runtime';
import { SpySubscriber, assert, TestContext, ChangeSet } from '@aurelia/testing';

const getName = (o: any) => Object.prototype.toString.call(o).slice(8, -1);

describe('PrimitiveObserver', function () {
  function setup(obj: Primitive, key: PropertyKey) {
    const sut = new PrimitiveObserver(obj, key);

    return { sut };
  }

  describe('getValue()', function () {
    const primitiveArr = [
      undefined, null, true, false, '', 'foo',
      Number.MAX_VALUE, Number.MAX_SAFE_INTEGER, Number.MIN_VALUE, Number.MIN_SAFE_INTEGER, 0, +Infinity, -Infinity, NaN,
      Symbol(), Symbol('foo'), Symbol.for('bar')
    ];
    const propertyNameArr = [undefined, null, 1, Symbol(), '', 'foo', 'length', 'valueOf'];
    for (const primitive of primitiveArr) {
      for (const propertyName of propertyNameArr) {
        const propName = typeof propertyName === 'string' ? `'${propertyName}'` : typeof propertyName;
        it(`should correctly handle ${typeof primitive}[${propName}]`, function () {
          const { sut } = setup(primitive, propertyName);
          if (propertyName === 'length') {
            if (typeof primitive === 'string') {
              const actual = sut.getValue();
              assert.strictEqual(actual, primitive.length, `actual`);
            } else if (primitive != null) {
              const actual = sut.getValue();
              assert.strictEqual(actual, void 0, `actual`);
            } else {
              assert.throws(() => sut.getValue());
            }
          } else {
            const actual = sut.getValue();
            assert.strictEqual(actual, undefined, `actual`);
          }
        });
      }
    }
  });

  describe('setValue()', function () {
    it('is a no-op', function () {
      assert.strictEqual(new PrimitiveObserver(null, 0).setValue === PLATFORM.noop, true, `new PrimitiveObserver(null, 0).setValue === PLATFORM.noop`);
    });
  });

  describe('subscribe()', function () {
    it('is a no-op', function () {
      assert.strictEqual(new PrimitiveObserver(null, 0).subscribe === PLATFORM.noop, true, `new PrimitiveObserver(null, 0).subscribe === PLATFORM.noop`);
    });
  });

  describe('unsubscribe()', function () {
    it('is a no-op', function () {
      assert.strictEqual(new PrimitiveObserver(null, 0).unsubscribe === PLATFORM.noop, true, `new PrimitiveObserver(null, 0).unsubscribe === PLATFORM.noop`);
    });
  });

  describe('doNotCache', function () {
    it('is true', function () {
      assert.strictEqual(new PrimitiveObserver(null, 0).doNotCache, true, `new PrimitiveObserver(null, 0).doNotCache`);
    });
  });
});

class Foo {}

describe('SetterObserver', function () {
  function setup(flags: LF, obj: IIndexable, key: string) {
    const ctx = TestContext.createHTMLTestContext();
    const lifecycle = ctx.lifecycle;
    const sut = new SetterObserver(lifecycle, flags, obj, key);

    return { sut };
  }

  describe('getValue()', function () {
    const objectArr = createObjectArr();
    const propertyNameArr = [undefined, null, Symbol(), '', 'foo', 'length', '__proto__'];
    for (const object of objectArr) {
      for (const propertyName of propertyNameArr) {
        it(`should correctly handle ${getName(object)}[${typeof propertyName}]`, function () {
          const { sut } = setup(LF.none, object, propertyName as any);
          sut.subscribe(new SpySubscriber());
          const actual = sut.getValue();
          assert.strictEqual(actual, object[propertyName], `actual`);
        });
      }
    }
  });

  describe('setValue()', function () {
    const valueArr = [undefined, null, 0, '', {}];
    const objectArr = createObjectArr();
    const propertyNameArr = [undefined, null, Symbol(), '', 'foo'];
    const flags = LF.updateTargetInstance;
    for (const object of objectArr) {
      for (const propertyName of propertyNameArr) {
        for (const value of valueArr) {
          it(`should correctly handle ${getName(object)}[${typeof propertyName}]=${getName(value)}`, function () {
            const { sut } = setup(LF.none, object, propertyName as any);
            sut.subscribe(new SpySubscriber());
            sut.setValue(value, flags);
            assert.strictEqual(object[propertyName], value, `object[propertyName]`);
          });
        }
      }
    }
  });

  describe('subscribe()', function () {
    const propertyNameArr = [undefined, null, Symbol(), '', 'foo', 1];
    const objectArr = createObjectArr();
    const flags = LF.updateTargetInstance;
    for (const object of objectArr) {
      for (const propertyName of propertyNameArr) {
        it(`can handle ${getName(object)}[${typeof propertyName}]`, function () {
          const { sut } = setup(LF.none, object, propertyName as any);
          sut.subscribe(new SpySubscriber());
        });
      }
    }

    const valueArr = [0, '', {}];
    const callsArr = [1, 2];
    for (const calls of callsArr) {
      for (const propertyName of propertyNameArr) {
        for (const value of valueArr) {
          const subscribersArr = [
            [new SpySubscriber()],
            [new SpySubscriber(), new SpySubscriber(), new SpySubscriber()],
            [new SpySubscriber(), new SpySubscriber(), new SpySubscriber(), new SpySubscriber(), new SpySubscriber(), new SpySubscriber(), new SpySubscriber(), new SpySubscriber(), new SpySubscriber(), new SpySubscriber()]
          ];
          for (const subscribers of subscribersArr) {
            const object = {};
            it(`should notify ${subscribers.length} subscriber(s) for ${getName(object)}[${typeof propertyName}]=${getName(value)}`, function () {
              const { sut } = setup(LF.none, object, propertyName as any);
              for (const subscriber of subscribers) {
                sut.subscribe(subscriber);
              }
              const prevValue = object[propertyName];
              sut.setValue(value, flags);
              for (const subscriber of subscribers) {
                assert.deepStrictEqual(
                  subscriber.changes,
                  [
                    new ChangeSet(0, flags & ~LF.update, value, prevValue),
                  ],
                );
              }
              if (calls === 2) {
                sut.setValue(prevValue, flags);
                for (const subscriber of subscribers) {
                  assert.deepStrictEqual(
                    subscriber.changes,
                    [
                      new ChangeSet(0, flags & ~LF.update, value, prevValue),
                      new ChangeSet(1, flags & ~LF.update, prevValue, value),
                    ],
                  );
                }
              }
              for (const subscriber of subscribers) {
                sut.unsubscribe(subscriber);
              }
            });
          }
        }
      }
    }
  });
});

describe('SelfObserver', function () {
  function setup(flags: LF, obj: IIndexable, key: string) {
    const ctx = TestContext.createHTMLTestContext();
    const lifecycle = ctx.lifecycle;
    const sut = new SelfObserver(lifecycle, flags, obj, key, `${key ? key.toString() : `${key}`}Changed`);

    return { sut };
  }

  it('initializes the default callback to undefined', function () {
    const values = createObjectArr();
    values.forEach(value => {
      const observer = setup(LF.none, {}, 'a');
      assert.strictEqual(observer['callback'], void 0, `observer['callback']`);
    });
  });

  describe('getValue()', function () {
    const objectArr = createObjectArr();
    const propertyNameArr = [undefined, null, Symbol(), '', 'foo', 'length', '__proto__'];
    for (const object of objectArr) {
      for (const propertyName of propertyNameArr) {
        it(`should correctly handle ${getName(object)}[${typeof propertyName}]`, function () {
          const { sut } = setup(LF.none, object, propertyName as any);
          sut.subscribe(new SpySubscriber());
          const actual = sut.getValue();
          assert.strictEqual(actual, object[propertyName], `actual`);
        });
      }
    }
  });

  describe('setValue()', function () {
    const valueArr = [undefined, null, 0, '', {}];
    const objectArr = createObjectArr();
    const propertyNameArr = [undefined, null, Symbol(), '', 'foo'];
    const flags = LF.updateTargetInstance;
    for (const object of objectArr) {
      for (const propertyName of propertyNameArr) {
        for (const value of valueArr) {
          it(`should correctly handle ${getName(object)}[${typeof propertyName}]=${getName(value)}`, function () {
            const { sut } = setup(LF.none, object, propertyName as any);
            sut.subscribe(new SpySubscriber());
            sut.setValue(value, flags);
            assert.strictEqual(object[propertyName], value, `object[propertyName]`);
          });
        }
      }
    }
  });

  describe('subscribe()', function () {
    const propertyNameArr = [undefined, null, Symbol(), '', 'foo', 1];
    const objectArr = createObjectArr();
    const flags = LF.updateTargetInstance;
    for (const object of objectArr) {
      for (const propertyName of propertyNameArr) {
        it(`can handle ${getName(object)}[${typeof propertyName}]`, function () {
          const { sut } = setup(LF.none, object, propertyName as any);
          sut.subscribe(new SpySubscriber());
        });
      }
    }

    const valueArr = [0, '', {}];
    const callsArr = [1, 2];
    for (const calls of callsArr) {
      for (const propertyName of propertyNameArr) {
        for (const value of valueArr) {
          const subscribersArr = [
            [new SpySubscriber()],
            [new SpySubscriber(), new SpySubscriber(), new SpySubscriber()],
            [new SpySubscriber(), new SpySubscriber(), new SpySubscriber(), new SpySubscriber(), new SpySubscriber(), new SpySubscriber(), new SpySubscriber(), new SpySubscriber(), new SpySubscriber(), new SpySubscriber()]
          ];
          for (const subscribers of subscribersArr) {
            const object = {};
            it(`should notify ${subscribers.length} subscriber(s) for ${getName(object)}[${typeof propertyName}]=${getName(value)}`, function () {
              const { sut } = setup(LF.none, object, propertyName as any);
              for (const subscriber of subscribers) {
                sut.subscribe(subscriber);
              }
              const prevValue = object[propertyName];
              sut.setValue(value, flags);
              for (const subscriber of subscribers) {
                assert.deepStrictEqual(
                  subscriber.changes,
                  [
                    new ChangeSet(0, flags & ~LF.update, value, prevValue),
                  ],
                );
              }
              if (calls === 2) {
                sut.setValue(prevValue, flags);
                for (const subscriber of subscribers) {
                  assert.deepStrictEqual(
                    subscriber.changes,
                    [
                      new ChangeSet(0, flags & ~LF.update, value, prevValue),
                      new ChangeSet(1, flags & ~LF.update, prevValue, value),
                    ],
                  );
                }
              }
              for (const subscriber of subscribers) {
                sut.unsubscribe(subscriber);
              }
            });
          }
        }
      }
    }
  });
});

function createObjectArr(): any[] {
  return [
    // eslint-disable-next-line no-new-wrappers, no-new-wrappers
    {}, Object.create(null), new Number(), new Boolean(), new String(),
    new Error(), new Foo(), new Uint8Array(), new WeakMap(), new WeakSet(), JSON.parse('{}'),
    /asdf/, function () { return; }, Promise.resolve(), new Proxy({}, {})
  ];
}
