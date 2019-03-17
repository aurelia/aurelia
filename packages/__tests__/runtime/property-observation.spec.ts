import { PLATFORM } from '@aurelia/kernel';
import { expect } from 'chai';
import {
  LifecycleFlags as LF,
  PrimitiveObserver,
  SelfObserver,
  SetterObserver
} from '@aurelia/runtime';
import { SpySubscriber } from '@aurelia/testing';

const getName = (o: any) => Object.prototype.toString.call(o).slice(8, -1);

describe('PrimitiveObserver', function () {
  let sut: PrimitiveObserver;

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
          sut = new PrimitiveObserver(primitive, propertyName);
          if (propertyName === 'length') {
            if (typeof primitive === 'string') {
              const actual = sut.getValue();
              expect(actual).to.equal(primitive.length);
            } else {
              expect(() => sut.getValue()).to.throw;
            }
          } else {
            const actual = sut.getValue();
            expect(actual).to.equal(undefined);
          }
        });
      }
    }
  });

  describe('setValue()', function () {
    it('is a no-op', function () {
      expect(new PrimitiveObserver(null, 0).setValue === PLATFORM.noop).to.equal(true);
    });
  });

  describe('subscribe()', function () {
    it('is a no-op', function () {
      expect(new PrimitiveObserver(null, 0).subscribe === PLATFORM.noop).to.equal(true);
    });
  });

  describe('unsubscribe()', function () {
    it('is a no-op', function () {
      expect(new PrimitiveObserver(null, 0).unsubscribe === PLATFORM.noop).to.equal(true);
    });
  });

  describe('doNotCache', function () {
    it('is true', function () {
      expect(new PrimitiveObserver(null, 0).doNotCache).to.equal(true);
    });
  });
});

class Foo {}

describe('SetterObserver', function () {
  let sut: SetterObserver;

  describe('getValue()', function () {
    const objectArr = createObjectArr();
    const propertyNameArr = [undefined, null, Symbol(), '', 'foo', 'length', '__proto__'];
    for (const object of objectArr) {
      for (const propertyName of propertyNameArr) {
        it(`should correctly handle ${getName(object)}[${typeof propertyName}]`, function () {
          sut = new SetterObserver(LF.none, object, propertyName as any);
          sut.subscribe(new SpySubscriber());
          const actual = sut.getValue();
          // note: we're deliberately using explicit strict equality here (and in various other places) instead of expect(actual).to.equal(expected)
          // this is because .equal assertions can give false positives in certain edge cases, and triple-equals also speeds up the tests (which is needed with these quantities)
          // the obvious drawback is that the error messages are less helpful when tests fail, so a todo is to make a utility function that reports the differences when not equal
          expect(actual === object[propertyName]).to.equal(true);
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
            sut = new SetterObserver(LF.none, object, propertyName as any);
            sut.subscribe(new SpySubscriber());
            sut.setValue(value, flags);
            expect(object[propertyName] === value).to.equal(true);
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
          sut = new SetterObserver(LF.none, object, propertyName as any);
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
              sut = new SetterObserver(LF.none, object, propertyName as any);
              for (const subscriber of subscribers) {
                sut.subscribe(subscriber);
              }
              const prevValue = object[propertyName];
              sut.setValue(value, flags);
              for (const subscriber of subscribers) {
                expect(subscriber.handleChange).to.have.been.calledOnce;
                expect(subscriber.handleChange).to.have.been.calledWith(value, prevValue, flags);
              }
              if (calls === 2) {
                sut.setValue(prevValue, flags);
                for (const subscriber of subscribers) {
                  expect(subscriber.handleChange).to.have.been.calledWith(prevValue, value, flags);
                  expect(subscriber.handleChange).to.have.been.calledTwice;
                }
              }
              for (const subscriber of subscribers) {
                sut.unsubscribe(subscriber);
                subscriber.resetHistory();
              }
            });
          }
        }
      }
    }
  });
});

describe('Observer', function () {

  it('initializes the default callback to null', function () {
    const values = createObjectArr();
    values.forEach(value => {
      const observer = new SelfObserver(LF.none, {}, 'a', 'aChanged');
      expect(observer['callback']).to.equal(null);
    });
  });
});

function createObjectArr(): any[] {
  return [
    // tslint:disable-next-line:use-primitive-type no-construct
    {}, Object.create(null), new Number(), new Boolean(), new String(),
    new Error(), new Foo(), new Uint8Array(), new WeakMap(), new WeakSet(), JSON.parse('{}'),
    /asdf/, function () { return; }, Promise.resolve(), new Proxy({}, {})
  ];
}
