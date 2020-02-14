import { Reporter } from '@aurelia/kernel';
import {
  CollectionLengthObserver,
  CustomSetterObserver,
  DirtyCheckProperty,
  LifecycleFlags as LF,
  PrimitiveObserver,
  PropertyAccessor,
  SetterObserver,
  CollectionSizeObserver,
  computed,
  GetterObserver
} from '@aurelia/runtime';
import {
  AttributeNSAccessor,
  CheckedObserver,
  ClassAttributeAccessor,
  DataAttributeAccessor,
  ElementPropertyAccessor,
  SelectValueObserver,
  StyleAttributeAccessor,
  ValueAttributeObserver,
  DOM
} from '@aurelia/runtime-html';
import { _, TestContext, assert, createSpy } from '@aurelia/testing';

describe('ObserverLocator', function () {
  function createFixture() {
    const ctx = TestContext.createHTMLTestContext();
    const sut = ctx.observerLocator;

    return { ctx, sut };
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
    const { ctx, sut } = createFixture();
    const el = ctx.createElementFromMarkup(markup);
    const attr = el.attributes[0];
    const expected = sut.getObserver(LF.none, el, attr.name);
    it(_`getAccessor() - ${markup} - returns ${expected.constructor.name}`, function () {
      const actual = sut.getAccessor(LF.none, el, attr.name);
      assert.instanceOf(actual, expected['constructor'], `actual`);
    });
  }

  // TODO: really need to verify all of this stuff with spec
  // for (const markup of [
  //   `<a href="foo"></a>`,
  //   `<img src="foo"></img>`,
  //   `<div _:=""></div>`,
  //   `<div _4:=""></div>`,
  //   `<div a:=""></div>`,
  //   `<div _:a=""></div>`,
  //   `<div _4:a=""></div>`,
  //   `<div a:a=""></div>`,
  //   `<div data-=""></div>`,
  //   `<div data-a=""></div>`,
  //   `<div aria-=""></div>`,
  //   `<div aria-a=""></div>`,
  // ]) {
  //   it(_`getAccessor() - ${markup} - returns DataAttributeAccessor`, function () {
  //     const el = ctx.createElement(markup) as Element;
  //     const attr = el.attributes[0];
  //     const { sut } = createFixture();
  //     const actual = sut.getAccessor(LF.none, el, attr.name);
  //     assert.strictEqual(actual.constructor.name, DataAttributeAccessor.name, `actual.constructor.name`);
  //     assert.instanceOf(actual, DataAttributeAccessor, `actual`);
  //   });
  // }
  for (const markup of [
    `<a href="foo"></a>`,
    `<img src="foo"></img>`,
    `<div data-=""></div>`,
    `<div data-a=""></div>`,
    `<div aria-=""></div>`,
    `<div aria-a=""></div>`,
  ]) {
    it(_`getAccessor() - ${markup} - returns DataAttributeAccessor`, function () {
      const { ctx, sut } = createFixture();
      const el = ctx.createElementFromMarkup(markup);
      const attr = el.attributes[0];
      const actual = sut.getAccessor(LF.none, el, attr.name);
      assert.strictEqual(actual.constructor.name, DataAttributeAccessor.name, `actual.constructor.name`);
      assert.instanceOf(actual, DataAttributeAccessor, `actual`);
    });
  }
  for (const markup of [
    `<div _:=""></div>`,
    `<div _4:=""></div>`,
    `<div a:=""></div>`,
    `<div _:a=""></div>`,
    `<div _4:a=""></div>`,
    `<div a:a=""></div>`
  ]) {
    it(_`getAccessor() - ${markup} - returns ElementPropertyAccessor`, function () {
      const { ctx, sut } = createFixture();
      const el = ctx.createElementFromMarkup(markup);
      const attr = el.attributes[0];
      const actual = sut.getAccessor(LF.none, el, attr.name);
      assert.strictEqual(actual.constructor.name, ElementPropertyAccessor.name, `actual.constructor.name`);
      assert.instanceOf(actual, ElementPropertyAccessor, `actual`);
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
    it(_`getAccessor() - ${markup} - returns ElementPropertyAccessor`, function () {
      const { ctx, sut } = createFixture();
      const el = ctx.createElementFromMarkup(markup);
      const attr = el.attributes[0];
      const actual = sut.getAccessor(LF.none, el, attr.name);
      assert.strictEqual(actual.constructor.name, ElementPropertyAccessor.name, `actual.constructor.name`);
      assert.instanceOf(actual, ElementPropertyAccessor, `actual`);
    });
  }

  it(_`getAccessor() - {} - returns PropertyAccessor`, function () {
    const { sut } = createFixture();
    const obj = {};
    const actual = sut.getAccessor(LF.none, obj, 'foo');
    assert.strictEqual(actual.constructor.name, PropertyAccessor.name, `actual.constructor.name`);
    assert.instanceOf(actual, PropertyAccessor, `actual`);
  });

  for (const obj of [
    undefined, null, true, false, '', 'foo',
    Number.MAX_VALUE, Number.MAX_SAFE_INTEGER, Number.MIN_VALUE, Number.MIN_SAFE_INTEGER, 0, +Infinity, -Infinity, NaN
  ] as any[]) {
    it(_`getObserver() - ${obj} - returns PrimitiveObserver`, function () {
      const { sut } = createFixture();
      if (obj == null) {
        assert.throws(() => sut.getObserver(LF.none, obj, 'foo'));
      } else {
        const actual = sut.getObserver(LF.none, obj, 'foo');
        assert.strictEqual(actual.constructor.name, PrimitiveObserver.name, `actual.constructor.name`);
        assert.instanceOf(actual, PrimitiveObserver, `actual`);
      }
    });
  }

  it(_`getObserver() - {} - twice in a row - reuses existing observer`, function () {
    const { sut } = createFixture();
    const obj = {};
    const expected = sut.getObserver(LF.none, obj, 'foo');
    const actual = sut.getObserver(LF.none, obj, 'foo');
    assert.strictEqual(actual, expected, `actual`);
  });

  it(_`getObserver() - {} - twice in a row different property - returns different observer`, function () {
    const { sut } = createFixture();
    const obj = {};
    const expected = sut.getObserver(LF.none, obj, 'foo');
    const actual = sut.getObserver(LF.none, obj, 'bar');
    assert.notStrictEqual(actual, expected, `actual`);
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
    { markup: `<div xlink:type=""></div>`, ctor: AttributeNSAccessor },
    { markup: `<div role=""></div>`, ctor: DataAttributeAccessor },
    { markup: `<div data-=""></div>`, ctor: DataAttributeAccessor },
    { markup: `<div data-a=""></div>`, ctor: DataAttributeAccessor },
    { markup: `<div aria-=""></div>`, ctor: DataAttributeAccessor },
    { markup: `<div aria-a=""></div>`, ctor: DataAttributeAccessor }
  ]) {
    it(_`getObserver() - ${markup} - returns ${ctor.name}`, function () {
      const { ctx, sut } = createFixture();
      const el = ctx.createElementFromMarkup(markup);
      const attr = el.attributes[0];
      const actual = sut.getObserver(LF.none, el, attr.name);
      assert.strictEqual(actual.constructor.name, ctor.name, `actual.constructor.name`);
      assert.instanceOf(actual, ctor, `actual`);
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
                    it(_`getObserver() - descriptor=${{ configurable, enumerable }}, hasGetter=${hasGetter}, hasSetter=${hasSetter}, hasOverrides=${hasOverrides}, isVolatile=${isVolatile}, hasAdapterObserver=${hasAdapterObserver}, adapterIsDefined=${adapterIsDefined}`, function () {
                      const { sut } = createFixture();
                      const obj = {};
                      const dummyObserver = {} as any;
                      if (hasAdapterObserver) {
                        if (adapterIsDefined) {
                          sut.addAdapter({getObserver() {
                            return dummyObserver;
                          }});
                        } else {
                          sut.addAdapter({getObserver() {
                            return null;
                          }});
                        }
                      }
                      const descriptor: PropertyDescriptor = { configurable, enumerable };
                      if (hasGetter) {
                        function getter() { return; }
                        if (hasGetObserver) {
                          getter['getObserver'] = () => dummyObserver;
                        }
                        descriptor.get = getter;
                      }
                      if (hasSetter) {
                        function setter() { return; }
                        descriptor.set = setter;
                      }
                      const proto = obj.constructor.prototype;
                      if (hasOverrides) {
                        computed({ volatile: isVolatile })(proto, 'foo');
                      }
                      Reflect.defineProperty(obj, 'foo', descriptor);
                      if (hasSetter && configurable && !hasGetter && !(hasAdapterObserver && adapterIsDefined)) {
                        assert.throws(() => sut.getObserver(LF.none, obj, 'foo'), /18/, `() => sut.getObserver(LF.none, obj, 'foo')`);
                      } else {
                        const actual = sut.getObserver(LF.none, obj, 'foo');
                        if ((hasGetter || hasSetter) && !hasGetObserver && hasAdapterObserver && adapterIsDefined) {
                          assert.strictEqual(actual, dummyObserver, `actual`);
                        } else if (!(hasGetter || hasSetter)) {
                          assert.strictEqual(actual.constructor.name, SetterObserver.name, `actual.constructor.name`);
                          assert.instanceOf(actual, SetterObserver, `actual`);
                        } else if (hasGetObserver) {
                          assert.strictEqual(actual, dummyObserver, `actual`);
                        } else {
                          if (!configurable) {
                            assert.strictEqual(actual.constructor.name, DirtyCheckProperty.name, `actual.constructor.name`);
                            assert.instanceOf(actual, DirtyCheckProperty, `actual`);
                          } else {
                            if (hasGetObserver) {
                              assert.strictEqual(actual, dummyObserver, `actual`);
                            } else {
                              if (hasSetter) {
                                if(isVolatile){
                                  assert.strictEqual(actual.constructor.name, GetterObserver.name, `actual.constructor.name`);
                                } else {
                                  assert.strictEqual(actual.constructor.name, CustomSetterObserver.name, `actual.constructor.name`);
                                }
                              }
                            }
                          }
                        }
                      }
                      delete proto.computed;
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
          ...Object.getOwnPropertyDescriptors(DOM.Node.prototype),
          ...Object.getOwnPropertyDescriptors(DOM.Element.prototype),
          ...Object.getOwnPropertyDescriptors(DOM.HTMLElement.prototype)
        };
        for (const property of Object.keys(descriptors)) {
          it(_`getObserver() - obj=<div></div>, property=${property}, hasAdapterObserver=${hasAdapterObserver}, adapterIsDefined=${adapterIsDefined}`, function () {
            const { ctx, sut } = createFixture();
            const obj = ctx.createElement('div');
            const dummyObserver = {} as any;
            if (hasAdapterObserver) {
              if (adapterIsDefined) {
                sut.addAdapter({getObserver() {
                  return dummyObserver;
                }});
              } else {
                sut.addAdapter({getObserver() {
                  return null;
                }});
              }
            }
            const actual = sut.getObserver(LF.none, obj, property);
            if (property === 'textContent' || property === 'innerHTML' || property === 'scrollTop' || property === 'scrollLeft') {
              assert.strictEqual(actual.constructor.name, ValueAttributeObserver.name, `actual.constructor.name`);
            } else if (property === 'style' || property === 'css') {
              assert.strictEqual(actual.constructor.name, StyleAttributeAccessor.name, `actual.constructor.name`);
            } else if (descriptors[property].get === undefined) {
              assert.strictEqual(actual.constructor.name, SetterObserver.name, `actual.constructor.name`);
            } else {
              if (!(hasAdapterObserver && adapterIsDefined)) {
                assert.strictEqual(actual.constructor.name, DirtyCheckProperty.name, `actual.constructor.name`);
              } else if ((!hasGetObserver && hasAdapterObserver && adapterIsDefined) || hasGetObserver) {
                assert.strictEqual(actual, dummyObserver, `actual`);
              } else {
                assert.strictEqual(actual.constructor.name, DirtyCheckProperty.name, `actual.constructor.name`);
              }
            }
          });
        }
      }
    }
  }

  it(_`getObserver() - throws if $observers is undefined`, function () {
    const { sut } = createFixture();
    const obj = {};
    const writeSpy = createSpy(Reporter, 'write');
    Reflect.defineProperty(obj, '$observers', { value: undefined });
    sut.getObserver(LF.none, obj, 'foo');

    writeSpy.restore();
    assert.deepStrictEqual(
      writeSpy.calls,
      [
        [0, {}],
      ],
      `writeSpy.calls`,
    );
  });

  it(_`getObserver() - Array.foo - returns ArrayObserver`, function () {
    const { sut } = createFixture();
    const obj = [];
    const actual = sut.getObserver(LF.none, obj, 'foo');
    assert.strictEqual(actual.constructor.name, SetterObserver.name, `actual.constructor.name`);
    assert.instanceOf(actual, SetterObserver, `actual`);
  });

  it(_`getObserver() - Array.length - returns ArrayObserver`, function () {
    const { sut } = createFixture();
    const obj = [];
    const actual = sut.getObserver(LF.none, obj, 'length');
    assert.strictEqual(actual.constructor.name, CollectionLengthObserver.name, `actual.constructor.name`);
    assert.instanceOf(actual, CollectionLengthObserver, `actual`);
  });

  it(_`getObserver() - Set.foo - returns SetObserver`, function () {
    const { sut } = createFixture();
    const obj = new Set();
    const actual = sut.getObserver(LF.none, obj, 'foo');
    assert.strictEqual(actual.constructor.name, SetterObserver.name, `actual.constructor.name`);
    assert.instanceOf(actual, SetterObserver, `actual`);
  });

  it(_`getObserver() - Set.size - returns SetObserver`, function () {
    const { sut } = createFixture();
    const obj = new Set();
    const actual = sut.getObserver(LF.none, obj, 'size');
    assert.strictEqual(actual.constructor.name, CollectionSizeObserver.name, `actual.constructor.name`);
    assert.instanceOf(actual, CollectionSizeObserver, `actual`);
  });

  it(_`getObserver() - Map.foo - returns MapObserver`, function () {
    const { sut } = createFixture();
    const obj = new Map();
    const actual = sut.getObserver(LF.none, obj, 'foo');
    assert.strictEqual(actual.constructor.name, SetterObserver.name, `actual.constructor.name`);
    assert.instanceOf(actual, SetterObserver, `actual`);
  });

  it(_`getObserver() - Map.size - returns MapObserver`, function () {
    const { sut } = createFixture();
    const obj = new Map();
    const actual = sut.getObserver(LF.none, obj, 'size');
    assert.strictEqual(actual.constructor.name, CollectionSizeObserver.name, `actual.constructor.name`);
    assert.instanceOf(actual, CollectionSizeObserver, `actual`);
  });

});
