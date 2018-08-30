import { spy } from 'sinon';
import { PLATFORM } from '../../../../kernel/src/index';
import { PrimitiveObserver, SetterObserver, ChangeSet, BindingFlags } from '../../../src/index';
import { expect } from 'chai';
import { SpySubscriber } from '../util';

const getName = (o: any) => Object.prototype.toString.call(o).slice(8, -1);

describe('PrimitiveObserver', () => {
  let sut: PrimitiveObserver;

  describe('getValue()', () => {
    const primitiveArr = [
      undefined, null, true, false, '', 'foo',
      Number.MAX_VALUE, Number.MAX_SAFE_INTEGER, Number.MIN_VALUE, Number.MIN_SAFE_INTEGER, 0, +Infinity, -Infinity, NaN,
      Symbol(), Symbol('foo'), Symbol.for('bar')
    ];
    const propertyNameArr = [undefined, null, 1, Symbol(), '', 'foo', 'length', 'valueOf'];
    for (const primitive of primitiveArr) {
      for (const propertyName of propertyNameArr) {
        it(`should correctly handle ${typeof primitive}[${typeof propertyName === 'string' ? `'${propertyName}'` : typeof propertyName}]`, () => {
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
            expect(actual).to.be.undefined;
          }
        });
      }
    }
  });

  describe('setValue()', () => {
    it('is a no-op', () => {
      expect(new PrimitiveObserver(null, 0).setValue === PLATFORM.noop).to.be.true;
    });
  });

  describe('subscribe()', () => {
    it('is a no-op', () => {
      expect(new PrimitiveObserver(null, 0).subscribe === PLATFORM.noop).to.be.true;
    });
  });

  describe('unsubscribe()', () => {
    it('is a no-op', () => {
      expect(new PrimitiveObserver(null, 0).unsubscribe === PLATFORM.noop).to.be.true;
    });
  });

  describe('doNotCache', () => {
    it('is true', () => {
      expect(new PrimitiveObserver(null, 0).doNotCache).to.be.true;
    });
  });
});

class Foo {}


describe('SetterObserver', () => {
  let sut: SetterObserver;

  describe('getValue()', () => {
    const objectArr = createObjectArr();
    const propertyNameArr = [undefined, null, Symbol(), '', 'foo', 'length', '__proto__'];
    for (const object of objectArr) {
      for (const propertyName of propertyNameArr) {
        it(`should correctly handle ${getName(object)}[${typeof propertyName}]`, () => {
          sut = new SetterObserver(object, <any>propertyName);
          sut.subscribe(new SpySubscriber());
          const actual = sut.getValue();
          // note: we're deliberately using explicit strict equality here (and in various other places) instead of expect(actual).to.equal(expected)
          // this is because .equal assertions can give false positives in certain edge cases, and triple-equals also speeds up the tests (which is needed with these quantities)
          // the obvious drawback is that the error messages are less helpful when tests fail, so a todo is to make a utility function that reports the differences when not equal
          expect(actual === object[propertyName]).to.be.true;
        });
      }
    }
  });

  describe('setValue()', () => {
    const valueArr = [undefined, null, 0, '', {}];
    const objectArr = createObjectArr();
    const propertyNameArr = [undefined, null, Symbol(), '', 'foo'];
    const flags = BindingFlags.updateTargetInstance;
    for (const object of objectArr) {
      for (const propertyName of propertyNameArr) {
        for (const value of valueArr) {
          it(`should correctly handle ${getName(object)}[${typeof propertyName}]=${getName(value)}`, () => {
            sut = new SetterObserver(object, <any>propertyName);
            sut.subscribe(new SpySubscriber());
            sut.setValue(value, flags);
            expect(object[propertyName] === value).to.be.true;
          });
        }
      }
    }
  });

  describe('subscribe()', () => {
    const propertyNameArr = [undefined, null, Symbol(), '', 'foo', 1];
    const objectArr = createObjectArr();
    const flags = BindingFlags.updateTargetInstance;
    for (const object of objectArr) {
      for (const propertyName of propertyNameArr) {
        it(`can handle ${getName(object)}[${typeof propertyName}]`, () => {
          sut = new SetterObserver(object, <any>propertyName);
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
            it(`should notify ${subscribers.length} subscriber(s) for ${getName(object)}[${typeof propertyName}]=${getName(value)}`, () => {
              sut = new SetterObserver(object, <any>propertyName);
              for (const subscriber of subscribers) {
                sut.subscribe(subscriber);
              }
              let prevValue = object[propertyName];
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

function createObjectArr(): any[] {
  return [
    {}, Object.create(null), new Number(), new Boolean(), new String(),
    document.createEvent('MouseEvent'), new Error(), new Foo(),
    new Uint8Array(), new WeakMap(), new WeakSet(), JSON.parse("{}"),
    /asdf/, function(){}, Promise.resolve(), new Proxy({}, {})
  ];
}
