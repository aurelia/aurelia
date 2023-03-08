import { noop, Primitive, IIndexable } from '@aurelia/kernel';
import {
  PrimitiveObserver,
  SetterObserver
} from '@aurelia/runtime';
import { BindableObserver } from '@aurelia/runtime-html';
import { SpySubscriber, assert, TestContext, ChangeSet } from '@aurelia/testing';

const getName = (o: any) => Object.prototype.toString.call(o).slice(8, -1);

describe('2-runtime/property-observation.spec.ts', function () {
  function createFixture(obj: Primitive, key: PropertyKey) {
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
          const { sut } = createFixture(primitive, propertyName);
          if (primitive != null) {
            const actual = sut.getValue();
            assert.strictEqual(actual, primitive[propertyName], `actual`);
          } else {
            assert.throws(() => sut.getValue());
          }
        });
      }
    }
  });

  describe('setValue()', function () {
    it('is a no-op', function () {
      new PrimitiveObserver(null, 0).setValue();
    });
  });

  describe('subscribe()', function () {
    it('is a no-op', function () {
      new PrimitiveObserver(null, 0).subscribe();
    });
  });

  describe('unsubscribe()', function () {
    it('is a no-op', function () {
      new PrimitiveObserver(null, 0).unsubscribe();
    });
  });

  describe('doNotCache', function () {
    it('is true', function () {
      assert.strictEqual(new PrimitiveObserver(null, 0).doNotCache, true, `new PrimitiveObserver(null, 0).doNotCache`);
    });
  });

  describe('SetterObserver', function () {
    function createFixture(obj: IIndexable, key: string) {
      const ctx = TestContext.create();
      const sut = new SetterObserver(obj, key);

      return { ctx, sut };
    }

    describe('getValue()', function () {
      const objectArr = createObjectArr();
      const propertyNameArr = [undefined, null, Symbol(), '', 'foo', 'length', '__proto__'];
      for (const object of objectArr) {
        for (const propertyName of propertyNameArr) {
          it(`should correctly handle ${getName(object)}[${typeof propertyName}]`, function () {
            const { sut } = createFixture(object, propertyName as any);
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
      for (const object of objectArr) {
        for (const propertyName of propertyNameArr) {
          for (const value of valueArr) {
            it(`should correctly handle ${getName(object)}[${typeof propertyName}]=${getName(value)}`, function () {
              const { sut } = createFixture(object, propertyName as any);
              sut.subscribe(new SpySubscriber());
              sut.setValue(value);
              assert.strictEqual(object[propertyName], value, `object[propertyName]`);
            });
          }
        }
      }
    });

    describe('subscribe()', function () {
      const propertyNameArr = [undefined, null, Symbol(), '', 'foo', 1];
      const objectArr = createObjectArr();
      for (const object of objectArr) {
        for (const propertyName of propertyNameArr) {
          it(`can handle ${getName(object)}[${typeof propertyName}]`, function () {
            const { sut } = createFixture(object, propertyName as any);
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
                const { sut } = createFixture(object, propertyName as any);
                for (const subscriber of subscribers) {
                  sut.subscribe(subscriber);
                }
                const prevValue = object[propertyName];
                sut.setValue(value);
                for (const subscriber of subscribers) {
                  assert.deepStrictEqual(
                    subscriber.changes,
                    [
                      new ChangeSet(0, value, prevValue),
                    ],
                  );
                }
                if (calls === 2) {
                  sut.setValue(prevValue);
                  for (const subscriber of subscribers) {
                    assert.deepStrictEqual(
                      subscriber.changes,
                      [
                        new ChangeSet(0, value, prevValue),
                        new ChangeSet(1, prevValue, value),
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

  describe('BindableObserver', function () {
    function createFixture(obj: IIndexable, key: string) {
      const _ctx = TestContext.create();
      const sut = new BindableObserver(obj, key, `${key ? key.toString() : `${key}`}Changed`, noop, {} as any, { enableCoercion: false, coerceNullish: false });

      return { sut };
    }

    it('initializes the default callback to undefined', function () {
      const values = createObjectArr();
      values.forEach(_value => {
        const observer = createFixture({}, 'a');
        assert.strictEqual(observer['callback'], void 0, `observer['callback']`);
      });
    });

    describe('getValue()', function () {
      const objectArr = createObjectArr();
      const propertyNameArr = [undefined, null, Symbol(), '', 'foo', 'length', '__proto__'];
      for (const object of objectArr) {
        for (const propertyName of propertyNameArr) {
          it(`should correctly handle ${getName(object)}[${typeof propertyName}]`, function () {
            const { sut } = createFixture(object, propertyName as any);
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
      for (const object of objectArr) {
        for (const propertyName of propertyNameArr) {
          for (const value of valueArr) {
            it(`should correctly handle ${getName(object)}[${typeof propertyName}]=${getName(value)}`, function () {
              const { sut } = createFixture(object, propertyName as any);
              sut.subscribe(new SpySubscriber());
              sut.setValue(value);
              assert.strictEqual(object[propertyName], value, `object[propertyName]`);
            });
          }
        }
      }
    });

    describe('subscribe()', function () {
      const propertyNameArr = [undefined, null, Symbol(), '', 'foo', 1];
      const objectArr = createObjectArr();
      for (const object of objectArr) {
        for (const propertyName of propertyNameArr) {
          it(`can handle ${getName(object)}[${typeof propertyName}]`, function () {
            const { sut } = createFixture(object, propertyName as any);
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
                const { sut } = createFixture(object, propertyName as any);
                for (const subscriber of subscribers) {
                  sut.subscribe(subscriber);
                }
                const prevValue = object[propertyName];
                sut.setValue(value);
                for (const subscriber of subscribers) {
                  assert.deepStrictEqual(
                    subscriber.changes,
                    [
                      new ChangeSet(0, value, prevValue),
                    ],
                  );
                }
                if (calls === 2) {
                  sut.setValue(prevValue);
                  for (const subscriber of subscribers) {
                    assert.deepStrictEqual(
                      subscriber.changes,
                      [
                        new ChangeSet(0, value, prevValue),
                        new ChangeSet(1, prevValue, value),
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
});

class Foo { }

function createObjectArr(): any[] {
  return [
    // eslint-disable-next-line no-new-wrappers, no-new-wrappers
    {}, Object.create(null), new Number(), new Boolean(), new String(),
    new Error(), new Foo(), new Uint8Array(), new WeakMap(), new WeakSet(), JSON.parse('{}'),
    /asdf/, function () { return; }, Promise.resolve(), new Proxy({}, {})
  ];
}
