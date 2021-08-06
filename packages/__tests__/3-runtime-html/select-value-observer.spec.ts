import { LifecycleFlags as LF, LifecycleFlags, SelectValueObserver } from '@aurelia/runtime-html';
import { h, TestContext, verifyEqual, assert, createFixture } from '@aurelia/testing';

type Anything = any;

// TODO: need many more tests here, this is just preliminary
describe('3-runtime-html/select-value-observer.spec.ts', function () {
  describe('[UNIT]', function () {
    function createFixture(initialValue: Anything = '', options = [], multiple = false) {
      const ctx = TestContext.create();
      const { platform, observerLocator } = ctx;

      const optionElements = options.map(o => `<option value="${o}">${o}</option>`).join('\n');
      const markup = `<select ${multiple ? 'multiple' : ''}>\n${optionElements}\n</select>`;
      const el = ctx.createElementFromMarkup(markup) as HTMLSelectElement;
      const sut = observerLocator.getObserver(el, 'value') as SelectValueObserver;
      sut.setValue(initialValue, LF.fromBind);

      return { ctx, el, sut, platform };
    }

    describe('setValue()', function () {
      const valuesArr = [['', 'foo', 'bar']];
      const initialArr = ['', 'foo', 'bar'];
      const nextArr = ['', 'foo', 'bar'];
      for (const values of valuesArr) {
        for (const initial of initialArr) {
          for (const next of nextArr) {
            it(`sets 'value' from "${initial}" to "${next}"`, function () {
              const { el, sut } = createFixture(initial, values);

              assert.strictEqual(el.value, initial, `el.value`);

              sut.setValue(next, LifecycleFlags.none);

              assert.strictEqual(el.value, next, `el.value`);
            });
          }
        }
      }
    });

    describe('synchronizeOptions', function () {
      return;
    });

    describe('synchronizeValue()', function () {
      describe('<select />', function () {
        return;
      });
      // There is subtle difference in behavior of synchronization for SelectObserver
      // When synchronzing value without synchronizing Options prior
      // the behavior is different, as such, if currentValue is an array
      //    1. With synchronizeOptions: source => target => source. Or selected <option/> are based on value array
      //    2. Without synchronizeOptions: target => source. Or selected values are based on selected <option/>
      describe('<select multiple="true" />', function () {
        it('retrieves value freshly when not observing', function () {
          const initialValue = [];
          const { sut } = createMutiSelectSut(initialValue, [
            option({ text: 'A', selected: true }),
            option({ text: 'B', selected: true }),
            option({ text: 'C' })
          ]);

          assert.notStrictEqual(initialValue, sut.getValue());
          assert.deepEqual(['A', 'B'], sut.getValue(), `currentValue`);
        });

        it('disregards null existing value when not observing', function () {
          const { sut } = createMutiSelectSut(null, [
            option({ text: 'A', selected: true }),
            option({ text: 'B', selected: true }),
            option({ text: 'C' })
          ]);

          assert.deepEqual(['A', 'B'], sut.getValue(), `currentValue`);
        });

        it('disregard existing value when not observing', function () {
          const { sut } = createMutiSelectSut(undefined, [
            option({ text: 'A', selected: true }),
            option({ text: 'B', selected: true }),
            option({ text: 'C' })
          ]);

          assert.deepEqual(['A', 'B'], sut.getValue(), `currentValue`);
        });

        it('retrieves <option /> "model" if has', function () {
          const { sut } = createMutiSelectSut([], [
            option({ text: 'A', _model: { id: 1, name: 'select 1' }, selected: true }),
            option({ text: 'B', _model: { id: 2, name: 'select 2' }, selected: true }),
            option({ text: 'C' })
          ]);

          verifyEqual(
            [
              { id: 1, name: 'select 1' },
              { id: 2, name: 'select 2' }
            ],
            sut.getValue()
          );
        });

        it('synchronizes with array (3): disregard "value" when there is model', function () {
          const { sut } = createMutiSelectSut([], [
            option({ text: 'A', value: 'AA', _model: { id: 1, name: 'select 1' }, selected: true }),
            option({ text: 'B', value: 'BB', _model: { id: 2, name: 'select 2' }, selected: true }),
            option({ text: 'C', value: 'CC' })
          ]);

          const currentValue = sut.getValue() as any[];

          sut.syncValue();

          assert.deepEqual(currentValue, sut.getValue(), `currentValue`);
          assert.strictEqual(currentValue.length, 2, `currentValue['length']`);

          verifyEqual(
            currentValue,
            [
              { id: 1, name: 'select 1' },
              { id: 2, name: 'select 2' }
            ]
          );
        });

        it('synchronize regardless disabled state of <option/>', function () {
          const { sut } = createMutiSelectSut([], [
            option({ text: 'A', value: 'AA', _model: { id: 1, name: 'select 1' }, selected: true }),
            option({ text: 'B', value: 'BB', disabled: true, _model: { id: 2, name: 'select 2' }, selected: true }),
            option({ text: 'C', value: 'CC', disabled: true, selected: true })
          ]);

          const currentValue = sut.getValue() as any[];

          sut.syncValue();

          assert.deepEqual(currentValue, sut.getValue(), `currentValue`);

          verifyEqual(
            currentValue,
            [
              { id: 1, name: 'select 1' },
              { id: 2, name: 'select 2' },
              'CC'
            ]
          );
        });

        it('syncs array & <option/> mutation (from repeat etc...)', async function () {
          const { sut, el, ctx } = createMutiSelectSut([], [
            option({ text: 'A', value: 'AA', _model: { id: 1, name: 'select 1' }, selected: true }),
            option({ text: 'B', value: 'BB', disabled: true, _model: { id: 2, name: 'select 2' }, selected: true }),
            option({ text: 'C', value: 'CC', disabled: true, selected: true })
          ]);

          let handleChangeCallCount = 0;
          let currentValue = sut.getValue() as any[];
          const noopSubscriber = {
            handleChange() {
              handleChangeCallCount++;
            },
          };

          sut.syncValue();
          assert.deepEqual(currentValue, sut.getValue(), `currentValue`);
          sut.subscribe(noopSubscriber);

          el.add(option({ text: 'DD', value: 'DD', selected: true })(ctx));
          await Promise.resolve();

          // currentValue = sut.getValue() as any[];
          assert.strictEqual(handleChangeCallCount, 0);
          assert.strictEqual(el.options[3].value, 'DD');
          assert.strictEqual(el.options[3].selected, false);

          currentValue = sut.getValue() as any[];

          assert.deepEqual(
            currentValue,
            [
              { id: 1, name: 'select 1' },
              { id: 2, name: 'select 2' },
              'CC',
            ]
          );

          currentValue.push('DD');
          assert.strictEqual(handleChangeCallCount, 0);
          assert.strictEqual(el.options[3].value, 'DD');
          assert.strictEqual(el.options[3].selected, true);
          assert.deepEqual(
            currentValue,
            [
              { id: 1, name: 'select 1' },
              { id: 2, name: 'select 2' },
              'CC',
              'DD'
            ]
          );

          sut.unsubscribe(noopSubscriber);
        });

        describe('with <optgroup>', function () {
          it('synchronizes with array', function () {
            const { sut } = createMutiSelectSut([], [
              optgroup(
                {},
                option({ text: 'A', _model: { id: 1, name: 'select 1' }, selected: true }),
                option({ text: 'B', _model: { id: 2, name: 'select 2' }, selected: true }),
              ),
              option({ text: 'C', value: 'CC' })
            ]);

            let currentValue = sut.getValue() as any[];
            assert.strictEqual(currentValue.length, 2, `currentValue.length`);

            sut.syncValue();
            currentValue = sut.getValue() as any[];

            assert.deepEqual(
              sut.getValue(),
              [
                { id: 1, name: 'select 1' },
                { id: 2, name: 'select 2' }
              ]
            );
          });

        });

        type SelectValidChild = HTMLOptionElement | HTMLOptGroupElement;

        function createMutiSelectSut(initialValue: Anything[], optionFactories: ((ctx: TestContext) => SelectValidChild)[]) {
          const ctx = TestContext.create();
          const { observerLocator } = ctx;

          const el = select(...optionFactories.map(create => create(ctx)))(ctx);
          const sut = observerLocator.getObserver(el, 'value') as SelectValueObserver;
          sut.setValue(initialValue, LifecycleFlags.noFlush);

          return { ctx, el, sut };
        }

        function select(...options: SelectValidChild[]): (ctx: TestContext) => HTMLSelectElement {
          return function (ctx: TestContext) {
            return h(
              'select',
              { multiple: true },
              ...options
            );
          };
        }
      });
    });

    function option(attributes: Record<string, any>) {
      return function (ctx: TestContext) {
        return h('option', attributes);
      };
    }

    function optgroup(attributes: Record<string, any>, ...optionFactories: ((ctx: TestContext) => HTMLOptionElement)[]) {
      return function (ctx: TestContext) {
        return h('optgroup', attributes, ...optionFactories.map(create => create(ctx)));
      };
    }
  });

  it('handles source change', async function () {
    const { ctx, startPromise, component, tearDown } = createFixture(
      `<h3>Select Product</h3>
      <select value.bind="selectedProductId" ref="selectEl">
        <option model.bind="null">Choose...</option>
        <option repeat.for="product of products" model.bind="product.id">
            \${product.id} - \${product.name}
        </option>
      </select>

      <h3>Data</h3>
      Selected product ID: \${selectedProductId}
      <button click.trigger="clear()">clear</button>`,
      class App {
        public selectEl: HTMLSelectElement;
        public products = [
          { id: 0, name: "Motherboard" },
          { id: 1, name: "CPU" },
          { id: 2, name: "Memory" }
        ];
        public selectedProductId = null;
        public clear() {
          this.selectedProductId = null;
        }
      }
    );
    await startPromise;

    component.selectEl.selectedIndex = 2;
    component.selectEl.dispatchEvent(new ctx.CustomEvent('change'));
    assert.strictEqual(component.selectedProductId, 1);

    component.clear();
    assert.strictEqual(component.selectEl.selectedIndex, 2);
    ctx.platform.domWriteQueue.flush();
    assert.strictEqual(component.selectEl.selectedIndex, 0);

    await tearDown();
  });
});
