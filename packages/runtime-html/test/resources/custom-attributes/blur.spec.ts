import { expect } from 'chai';
import { spy } from 'sinon';
import { BlurCustomAttribute } from '../../../src/index';
import { HTMLTestContext, TestContext } from '../../util';

describe('BlurBindingBehavior', () => {
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
        sut.contains = (originalFn => {
          return function() {
            const proxy = new Proxy(this, {
              get(obj: BlurCustomAttribute, propertyName: string): unknown {
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

    it('bails when there is no thing linked and the hosting element does not contain the target', () => {
      let accessed: Record<string, number> = {};
      sut.value = true;
      sut.contains = (originalFn => {
        return function() {
          const proxy = new Proxy(this, {
            get(obj: BlurCustomAttribute, propertyName: string): unknown {
              accessed[propertyName] = (accessed[propertyName] || 0) + 1;
              return obj[propertyName];
            }
          });
          return originalFn.apply(proxy, arguments);
        };
      })(sut.contains);

      // though the interface of Blur.contains is Element as first argument,
      // it can work with any subclass of Node
      for (const testValue of [
        document.body,
        ctx.createElement('div'),
        document.createDocumentFragment(),
        ctx.createElement('div').attachShadow({ mode: 'open' }),
        ctx.createElement('div').attachShadow({ mode: 'closed' }),
        document.createComment('asdad'),
        document.createTextNode('sdasdas'),
        document.createElementNS('http://www.w3.org/1999/xhtml', 'asdasd:sadasd'),
        document,
        document.documentElement,
        document.createAttribute('asd')
      ]) {
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

    it('throws when given anything not a Node but also not null/undefined', () => {
      sut.value = true;
      for (const imcompatValue of [true, false, 'a', 5, Symbol(), Number, new Date(), {}, [], new Proxy({}, {})]) {
        expect(() => sut.contains(imcompatValue as unknown as Element)).to.throw();
      }
    });
  });

  describe('.triggerBlur()', () => {
    it('sets value to false', () => {
      for (const value of [true, 'a', 5, Symbol(), Number, new Date(), null, undefined, {}, [], new Proxy({}, {})]) {
        sut.value = value as unknown as boolean;
        sut.triggerBlur();
        expect(sut.value).to.be.false;
      }
    });

    it('calls onBlur() if present', () => {
      let count = 0;
      const onBlurSpy = spy(function() {
        count++;
      });
      sut.onBlur = onBlurSpy;
      const testValues = [true, 'a', 5, Symbol(), function() {/***/}, Number, new Date(), null, undefined, {}, [], new Proxy({}, {})];
      for (const value of testValues) {
        sut.value = value as unknown as boolean;
        sut.triggerBlur();
        expect(sut.value).to.be.false;
        expect(sut.onBlur).to.callCount(1);
        expect(onBlurSpy.calledWith()).to.be.true;
        onBlurSpy.resetHistory();
      }
      expect(count).to.eq(testValues.length);
    });

    it('does not call onBlur if value is not a function', () => {
      const testValues = [true, 'a', 5, Symbol(), new Date(), null, undefined, {}, [], new Proxy({}, {})];
      let onBlurValue: any;
      let accessCount = 0;
      sut = new Proxy(sut, {
        get($obj, propertyName) {
          if (propertyName === 'onBlur') {
            accessCount++;
          }
          return propertyName === 'onBlur' ? onBlurValue : $obj[propertyName];
        }
      });
      for (const value of testValues) {
        onBlurValue = value;
        sut.triggerBlur();
      }
      expect(accessCount).to.eq(testValues.length);
    });
  });
});
