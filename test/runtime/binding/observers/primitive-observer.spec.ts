import { PLATFORM } from '../../../../src/kernel/platform';
import { PrimitiveObserver } from '../../../../src/runtime/binding/observers/property-observation';
import { expect } from 'chai';

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
