import { expect } from 'chai';
import { BlurCustomAttribute } from '../../../src/index';
import { TestContext } from '../../util';

describe('BlurBindingBehavior', () => {
  let target: any;
  let sut: BlurCustomAttribute;

  const falsyPansyValues = [false, 0, '', undefined, null];

  beforeEach(() => {
    const ctx = TestContext.createHTMLTestContext();
    target = ctx.createElement('div');
    sut = new BlurCustomAttribute(target);
  });

  describe('contains()', () => {
    for (const value of falsyPansyValues) {
      it(`bails when value is already falsy: "${value}"`, () => {
        const accessed: Record<string, number> = {};
        sut.value = value as unknown as boolean;
        sut.contains = (function(originalFn: BlurCustomAttribute['contains']) {
          return function() {
            const proxy = new Proxy(this, {
              get(obj: BlurCustomAttribute, propertyName: string, receiver: unknown): unknown {
                accessed[propertyName] = (accessed[propertyName] || 0) + 1;
                return obj[propertyName];
              }
            });
            return originalFn.apply(proxy, arguments);
          };
        })(sut.contains);

        const result = sut.contains(document.body);
        expect(result).to.be.false;
        expect(Object.keys(accessed)[0]).to.eq('value', 'It should have accessed value');
        expect(Object.keys(accessed).length).to.eq(1, 'It should not have accessed any other properties beside "value".');
      });
    }
  });
});
