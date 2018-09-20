import { ObserverLocator, IChangeSet, IEventManager, IDirtyChecker, ISVGAnalyzer, DataAttributeAccessor, PrimitiveObserver, ClassAttributeAccessor, StyleAttributeAccessor, SelectValueObserver, ValueAttributeObserver, CheckedObserver, XLinkAttributeAccessor, DirtyCheckProperty, CustomSetterObserver, SetterObserver, CollectionLengthObserver, PropertyAccessor, ElementPropertyAccessor } from '../../../src/index';
import { expect } from 'chai';
import { DI } from '@aurelia/kernel';
import { _, createElement } from '../util';
import { spy } from 'sinon';
import { Reporter } from '@aurelia/kernel';

describe('ObserverLocator', () => {
  function setup() {
    const container = DI.createContainer();
    const cs = container.get<IChangeSet>(IChangeSet);
    const em = container.get<IEventManager>(IEventManager);
    const dc = container.get<IDirtyChecker>(IDirtyChecker);
    const sa = container.get<ISVGAnalyzer>(ISVGAnalyzer);
    const sut = new ObserverLocator(cs, em, dc, sa);

    return { sut };
  }

  for (const markup of [
    `<div class="foo"></div>`,
    `<div style="display:none;"></div>`,
    `<div css="display:none;"></div>`,
    `<input value="foo"></input>`,
    `<select value="foo"></select>`,
    `<input checked="foo"></input>`,
    `<input model="foo"></input>`,
    `<div xlink:type="foo"></div>`,
  ]) {
    const el = <Element>createElement(markup);
    const attr = el.attributes[0];
    const { sut } = setup();
    const expected = sut.getObserver(el, attr.name);
    it(_`getAccessor() - ${markup} - returns ${expected.constructor.name}`, () => {
      const actual = sut.getAccessor(el, attr.name);
      expect(actual).to.be.instanceof(expected['constructor']);
    });
  }

  for (const markup of [
    `<a href="foo"></a>`,
    `<img src="foo"></img>`,
    `<div _:=""></div>`,
    `<div _4:=""></div>`,
    `<div a:=""></div>`,
    `<div _:a=""></div>`,
    `<div _4:a=""></div>`,
    `<div a:a=""></div>`,
    `<div data-=""></div>`,
    `<div data-a=""></div>`,
    `<div aria-=""></div>`,
    `<div aria-a=""></div>`,
  ]) {
    it(_`getAccessor() - ${markup} - returns DataAttributeAccessor`, () => {
      const el = <Element>createElement(markup);
      const attr = el.attributes[0];
      const { sut } = setup();
      const actual = sut.getAccessor(el, attr.name);
      expect(actual.constructor.name).to.equal(DataAttributeAccessor.name);
      expect(actual).to.be.instanceof(DataAttributeAccessor);
    });
  }

  for (const markup of [
    `<a foo="foo"></a>`,
    `<img foo="foo"></img>`,
    `<div _=""></div>`,
    `<div 4=""></div>`,
    `<div a=""></div>`,
    `<div _a=""></div>`,
    `<div 4a=""></div>`,
    `<div aa=""></div>`,
    `<div data=""></div>`,
    `<div dataa=""></div>`,
    `<div aria=""></div>`,
    `<div ariaa=""></div>`,
  ]) {
    it(_`getAccessor() - ${markup} - returns ElementPropertyAccessor`, () => {
      const el = <Element>createElement(markup);
      const attr = el.attributes[0];
      const { sut } = setup();
      const actual = sut.getAccessor(el, attr.name);
      expect(actual.constructor.name).to.equal(ElementPropertyAccessor.name);
      expect(actual).to.be.instanceof(ElementPropertyAccessor);
    });
  }

  it(_`getAccessor() - {} - returns PropertyAccessor`, () => {
    const { sut } = setup();
    const obj = {};
    const actual = sut.getAccessor(obj, 'foo');
    expect(actual.constructor.name).to.equal(PropertyAccessor.name);
    expect(actual).to.be.instanceof(PropertyAccessor);
  });

  for (const obj of <any[]>[
    undefined, null, true, false, '', 'foo',
    Number.MAX_VALUE, Number.MAX_SAFE_INTEGER, Number.MIN_VALUE, Number.MIN_SAFE_INTEGER, 0, +Infinity, -Infinity, NaN
  ]) {
    it(_`getObserver() - ${obj} - returns PrimitiveObserver`, () => {
      const { sut } = setup();
      if (obj === null || obj === undefined) {
        expect(() => sut.getObserver(obj, 'foo')).to.throw;
      } else {
        const actual = sut.getObserver(obj, 'foo');
        expect(actual.constructor.name).to.equal(PrimitiveObserver.name);
        expect(actual).to.be.instanceof(PrimitiveObserver);
      }
    });
  }

  it(_`getObserver() - {} - twice in a row - reuses existing observer`, () => {
    const { sut } = setup();
    const obj = {};
    const expected = sut.getObserver(obj, 'foo');
    const actual = sut.getObserver(obj, 'foo');
    expect(actual).to.equal(expected);
  });

  it(_`getObserver() - {} - twice in a row different property - returns different observer`, () => {
    const { sut } = setup();
    const obj = {};
    const expected = sut.getObserver(obj, 'foo');
    const actual = sut.getObserver(obj, 'bar');
    expect(actual).not.to.equal(expected);
  });

  for (const { markup, ctor } of [
    { markup: `<div class=""></div>`, ctor: ClassAttributeAccessor },
    { markup: `<div style="color:green;"></div>`, ctor: StyleAttributeAccessor },
    { markup: `<div css="color:green;"></div>`, ctor: StyleAttributeAccessor },
    { markup: `<select value=""></select>`, ctor: SelectValueObserver },
    { markup: `<input value=""></input>`, ctor: ValueAttributeObserver },
    { markup: `<input checked="true"></input>`, ctor: CheckedObserver },
    { markup: `<input files=""></input>`, ctor: ValueAttributeObserver },
    { markup: `<textarea value=""></textarea>`, ctor: ValueAttributeObserver },
    { markup: `<div xlink:type=""></div>`, ctor: XLinkAttributeAccessor },
    { markup: `<div role=""></div>`, ctor: DataAttributeAccessor },
    { markup: `<div data-=""></div>`, ctor: DataAttributeAccessor },
    { markup: `<div data-a=""></div>`, ctor: DataAttributeAccessor },
    { markup: `<div aria-=""></div>`, ctor: DataAttributeAccessor },
    { markup: `<div aria-a=""></div>`, ctor: DataAttributeAccessor }
  ]) {
    it(_`getObserver() - ${markup} - returns ${ctor.name}`, () => {
      const el = <Element>createElement(markup);
      const attr = el.attributes[0];
      const { sut } = setup();
      const actual = sut.getObserver(el, attr.name);
      expect(actual.constructor.name).to.equal(ctor.name);
      expect(actual).to.be.instanceof(ctor);
    });
  }

  for (const hasGetter of [true, false]) {
    for (const hasGetObserver of hasGetter ? [true, false] : [false]) {
      for (const hasSetter of [true, false]) {
        for (const configurable of [true, false]) {
          for (const enumerable of [true, false]) {
            for (const hasOverrides of [true, false]) {
              for (const isVolatile of hasOverrides ? [true, false, undefined] : [false]) {
                for (const hasAdapterObserver of [true, false]) {
                  for (const adapterIsDefined of hasAdapterObserver ? [true, false] : [false]) {
                    const { sut } = setup();
                    const obj = {};
                    const dummyObserver = <any>{};
                    if (hasAdapterObserver) {
                      if (adapterIsDefined) {
                        sut.addAdapter({getObserver() { return dummyObserver }});
                      } else {
                        sut.addAdapter({getObserver() { return null }});
                      }
                    }
                    const descriptor = <PropertyDescriptor>{ configurable, enumerable };
                    if (hasGetter) {
                      function getter() {};
                      if (hasGetObserver) {
                        getter['getObserver'] = () => dummyObserver;
                      }
                      descriptor.get = getter;
                    }
                    if (hasSetter) {
                      function setter() {};
                      descriptor.set = setter;
                    }
                    if (hasOverrides) {
                      obj.constructor['computed'] = { isVolatile };
                    }
                    it(_`getObserver() - descriptor=${descriptor}, hasGetter=${hasGetter}, hasSetter=${hasSetter}, hasOverrides=${hasOverrides}, isVolatile=${isVolatile}, hasAdapterObserver=${hasAdapterObserver}, adapterIsDefined=${adapterIsDefined}`, () => {
                      Object.defineProperty(obj, 'foo', descriptor);
                      if (hasSetter && configurable && !hasGetter && !(hasAdapterObserver && adapterIsDefined)) {
                        expect(() => sut.getObserver(obj, 'foo')).to.throw(/18/);
                      } else {
                        const actual = sut.getObserver(obj, 'foo');
                        if ((hasGetter || hasSetter) && !hasGetObserver && hasAdapterObserver && adapterIsDefined) {
                          expect(actual).to.equal(dummyObserver);
                        } else if (!(hasGetter || hasSetter)) {
                          expect(actual.constructor.name).to.equal(SetterObserver.name);
                          expect(actual).to.be.instanceof(SetterObserver);
                        } else if (hasGetObserver) {
                          expect(actual).to.equal(dummyObserver);
                        } else {
                          if (!configurable) {
                            expect(actual.constructor.name).to.equal(DirtyCheckProperty.name);
                            expect(actual).to.be.instanceof(DirtyCheckProperty);
                          } else {
                            if (hasGetObserver) {
                              expect(actual).to.equal(dummyObserver);
                            } else {
                              if (hasSetter) {
                                expect(actual.constructor.name).to.equal(CustomSetterObserver.name);
                              }
                            }
                          }
                        }
                      }
                    });
                  }
                }
              }
            }
          }
        }
      }
    }
  }

  for (const hasGetObserver of [true, false]) {
    for (const hasAdapterObserver of [true, false]) {
      for (const adapterIsDefined of hasAdapterObserver ? [true, false] : [false]) {
        const descriptors = {
          ...Object.getOwnPropertyDescriptors(Node.prototype),
          ...Object.getOwnPropertyDescriptors(Element.prototype),
          ...Object.getOwnPropertyDescriptors(HTMLElement.prototype),
          ...Object.getOwnPropertyDescriptors(HTMLDivElement.prototype)
        };
        for (const property of Object.keys(descriptors)) {
          const { sut } = setup();
          const obj = document.createElement('div');
          const dummyObserver = <any>{};
          if (hasAdapterObserver) {
            if (adapterIsDefined) {
              sut.addAdapter({getObserver() { return dummyObserver }});
            } else {
              sut.addAdapter({getObserver() { return null }});
            }
          }
          it(_`getObserver() - obj=<div></div>, property=${property}, hasAdapterObserver=${hasAdapterObserver}, adapterIsDefined=${adapterIsDefined}`, () => {
            const actual = sut.getObserver(obj, property);
            if (property === 'textContent' || property === 'innerHTML' || property === 'scrollTop' || property === 'scrollLeft') {
              expect(actual.constructor.name).to.equal(ValueAttributeObserver.name);
            } else if (property === 'style' || property === 'css') {
              expect(actual.constructor.name).to.equal(StyleAttributeAccessor.name);
            } else if (descriptors[property].get === undefined) {
              expect(actual.constructor.name).to.equal(SetterObserver.name);
            } else {
              if (!(hasAdapterObserver && adapterIsDefined)) {
                expect(actual.constructor.name).to.equal(DirtyCheckProperty.name);
              } else if ((!hasGetObserver && hasAdapterObserver && adapterIsDefined) || hasGetObserver) {
                expect(actual).to.equal(dummyObserver);
              } else {
                expect(actual.constructor.name).to.equal(DirtyCheckProperty.name);
              }
            }
          });
        }
      }
    }
  }

  it(_`getObserver() - throws if $observers is undefined`, () => {
    const { sut } = setup();
    const obj = {};
    const write = Reporter.write;
    Reporter.write = spy();
    Object.defineProperty(obj, '$observers', { value: undefined })
    sut.getObserver(obj, 'foo');
    expect(Reporter.write).to.have.been.calledWith(0);
    Reporter.write = write;
  });

  it(_`getObserver() - Array.foo - returns ArrayObserver`, () => {
    const { sut } = setup();
    const obj = [];
    const actual = sut.getObserver(obj, 'foo');
    expect(actual.constructor.name).to.equal(DirtyCheckProperty.name);
    expect(actual).to.be.instanceof(DirtyCheckProperty);
  });

  it(_`getObserver() - Array.length - returns ArrayObserver`, () => {
    const { sut } = setup();
    const obj = [];
    const actual = sut.getObserver(obj, 'length');
    expect(actual.constructor.name).to.equal(CollectionLengthObserver.name);
    expect(actual).to.be.instanceof(CollectionLengthObserver);
  });

  it(_`getObserver() - Set.foo - returns SetObserver`, () => {
    const { sut } = setup();
    const obj = new Set();
    const actual = sut.getObserver(obj, 'foo');
    expect(actual.constructor.name).to.equal(DirtyCheckProperty.name);
    expect(actual).to.be.instanceof(DirtyCheckProperty);
  });

  it(_`getObserver() - Set.size - returns SetObserver`, () => {
    const { sut } = setup();
    const obj = new Set();
    const actual = sut.getObserver(obj, 'size');
    expect(actual.constructor.name).to.equal(CollectionLengthObserver.name);
    expect(actual).to.be.instanceof(CollectionLengthObserver);
  });

  it(_`getObserver() - Map.foo - returns MapObserver`, () => {
    const { sut } = setup();
    const obj = new Map();
    const actual = sut.getObserver(obj, 'foo');
    expect(actual.constructor.name).to.equal(DirtyCheckProperty.name);
    expect(actual).to.be.instanceof(DirtyCheckProperty);
  });

  it(_`getObserver() - Map.size - returns MapObserver`, () => {
    const { sut } = setup();
    const obj = new Map();
    const actual = sut.getObserver(obj, 'size');
    expect(actual.constructor.name).to.equal(CollectionLengthObserver.name);
    expect(actual).to.be.instanceof(CollectionLengthObserver);
  });

});
