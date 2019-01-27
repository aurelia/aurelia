import { expect } from 'chai';
import { BlurCustomAttribute } from '../../../src/index';
import { HTMLTestContext, TestContext } from '../../util';

describe.only('BlurBindingBehavior', () => {
  let target: HTMLElement;
  let sut: BlurCustomAttribute;
  let ctx: HTMLTestContext;

  const falsyPansyValues = [false, 0, '', undefined, null];

  beforeEach(() => {
    ctx = TestContext.createHTMLTestContext();
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
        expect(Object.keys(accessed)[0]).to.eq('value', 'It should have accessed "value"');
        expect(Object.keys(accessed).length).to.eq(1, 'It should not have accessed any other properties beside "value".');
      });
    }

    it('returns true when invoked on child element', () => {
      const child = target.appendChild(ctx.createElement('div'));
      sut.value = true;
      const result = sut.contains(child);
      expect(result).to.be.true;
    });

    it('returns true when invoked on the its own element', () => {
      sut.value = true;
      expect(sut.contains(target)).to.be.true;
    });

    for (const value of falsyPansyValues) {
      it('bails when there is no thing linked and the hosting element does not contain the target', () => {
        let accessed: Record<string, number> = {};
        sut.value = true;
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

        for (const testValue of [document.body, ctx.createElement('div'), document.createDocumentFragment()]) {
          const result = sut.contains(testValue as unknown as Element);
          expect(result).to.be.false;
          const accessedProps = Object.keys(accessed);
          expect(accessedProps.length).to.eq(3);
          expect(accessedProps.toString()).to.eq(
            ['value', 'element', 'linkedWith'].toString(),
            'It should have accessed "value", "element", "linkedWith"'
          );
          accessed = {};
        }
      });
    }
  });
});
