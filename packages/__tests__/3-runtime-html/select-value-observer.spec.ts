import { LifecycleFlags as LF } from '@aurelia/runtime';
import { SelectValueObserver } from '@aurelia/runtime-html';
import { h, HTMLTestContext, TestContext, verifyEqual, assert, createSpy } from '@aurelia/testing';

type Anything = any;

// TODO: need many more tests here, this is just preliminary
describe('SelectValueObserver', function () {
  function createFixture(initialValue: Anything = '', options = [], multiple = false) {
    const ctx = TestContext.createHTMLTestContext();
    const { dom, lifecycle, observerLocator, scheduler } = ctx;

    const optionElements = options.map(o => `<option value="${o}">${o}</option>`).join('\n');
    const markup = `<select ${multiple ? 'multiple' : ''}>\n${optionElements}\n</select>`;
    const el = ctx.createElementFromMarkup(markup) as HTMLSelectElement;
    const sut = observerLocator.getObserver(LF.none, el, 'value') as SelectValueObserver;
    sut.setValue(initialValue, LF.fromBind);

    return { ctx, lifecycle, el, sut, dom, scheduler };
  }

  describe('setValue()', function () {
    const valuesArr = [['', 'foo', 'bar']];
    const initialArr = ['', 'foo', 'bar'];
    const nextArr = ['', 'foo', 'bar'];
    for (const values of valuesArr) {
      for (const initial of initialArr) {
        for (const next of nextArr) {
          it(`sets 'value' from "${initial}" to "${next}"`, function () {
            const { lifecycle, el, sut, scheduler } = createFixture(initial, values);

            assert.strictEqual(el.value, initial, `el.value`);

            sut.bind(LF.none);

            el.options.item(values.indexOf(next)).selected = true;

            scheduler.getRenderTaskQueue().flush();
            assert.strictEqual(el.value, next, `el.value`);

            sut.unbind(LF.none);
          });
        }
      }
    }
  });

  describe('bind()', function () {

    if (typeof MutationObserver !== 'undefined') {
      // TODO: fix the spy thing
      it.skip('uses private method handleNodeChange as callback', async function () {
        for (const isMultiple of [true, false]) {
          const { ctx, el, sut } = createFixture([], [], isMultiple);

          const callbackSpy = createSpy(sut, 'handleNodeChange', true);

          sut.bind(LF.none);

          el.appendChild(ctx.createElement('option'));

          await Promise.resolve();

          assert.strictEqual(callbackSpy.calls.length, 1, 'callbackSpy.calls.length');

          sut.unbind(LF.none);
        }
      });
    }
  });

  describe('unbind()', function () {
    it('disconnect node observer', function () {
      for (const isMultiple of [true, false]) {
        const { sut } = createFixture([], [], isMultiple);

        let count = 0;
        const nodeObserver: any = { disconnect() {
          count++;
        } };
        sut['nodeObserver'] = nodeObserver;

        sut.unbind(LF.none);

        assert.strictEqual(count, 1, `count`);
        assert.strictEqual(sut['nodeObserver'], null, `sut['nodeObserver']`);
      }
    });
    it('unsubscribes array observer', function () {
      for (const isMultiple of [true, false]) {
        const { sut } = createFixture([], [], isMultiple);
        let count = 0;
        const nodeObserver: any = { disconnect() {
          return;
        } };
        const arrayObserver: any = {
          unsubscribeFromCollection(observer: Anything) {
            assert.strictEqual(observer, sut, 'It should have unsubscribe with right observer.');
            count++;
          }
        };
        sut['nodeObserver'] = nodeObserver;
        sut['arrayObserver'] = arrayObserver;

        sut.unbind(LF.none);

        assert.strictEqual(count, 1, `count`);
        assert.strictEqual(sut['arrayObserver'], null, `sut['arrayObserver']`);
      }
    });
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
      it('synchronizes with array', function () {
        const { sut } = createMutiSelectSut([], [
          option({ text: 'A', selected: true }),
          option({ text: 'B', selected: true }),
          option({ text: 'C' })
        ]);

        sut.bind(LF.none);

        const currentValue = sut.currentValue as any[];
        assert.instanceOf(currentValue, Array);
        assert.strictEqual(currentValue['length'], 0, `currentValue['length']`);

        sut.synchronizeValue();

        assert.strictEqual(currentValue, sut.currentValue, `currentValue`);
        assert.strictEqual(currentValue['length'], 2, `currentValue['length']`);

        sut.unbind(LF.none);
      });

      it('synchronizes with null', function () {
        const { sut } = createMutiSelectSut(null, [
          option({ text: 'A', selected: true }),
          option({ text: 'B', selected: true }),
          option({ text: 'C' })
        ]);

        sut.bind(LF.none);

        const currentValue = sut.currentValue as any;
        assert.strictEqual(currentValue, null, `currentValue`);

        sut.synchronizeValue();

        assert.strictEqual(currentValue, sut.currentValue, `currentValue`);

        sut.unbind(LF.none);
      });

      it('synchronizes with undefined', function () {
        const { sut } = createMutiSelectSut(undefined, [
          option({ text: 'A', selected: true }),
          option({ text: 'B', selected: true }),
          option({ text: 'C' })
        ]);

        sut.bind(LF.none);

        const currentValue = sut.currentValue as any;
        assert.strictEqual(currentValue, undefined, `currentValue`);

        sut.synchronizeValue();

        assert.strictEqual(currentValue, sut.currentValue, `currentValue`);

        sut.unbind(LF.none);
      });

      it('synchronizes with array (2)', function () {
        const { sut } = createMutiSelectSut([], [
          option({ text: 'A', _model: { id: 1, name: 'select 1' }, selected: true }),
          option({ text: 'B', _model: { id: 2, name: 'select 2' }, selected: true }),
          option({ text: 'C' })
        ]);

        sut.bind(LF.none);

        const currentValue = sut.currentValue as any[];

        sut.synchronizeValue();

        assert.strictEqual(currentValue, sut.currentValue, `currentValue`);
        assert.strictEqual(currentValue['length'], 2, `currentValue['length']`);

        verifyEqual(
          currentValue,
          [
            { id: 1, name: 'select 1' },
            { id: 2, name: 'select 2' }
          ]
        );

        sut.unbind(LF.none);
      });

      it('synchronizes with array (3): disregard "value" when there is model', function () {
        const { sut } = createMutiSelectSut([], [
          option({ text: 'A', value: 'AA', _model: { id: 1, name: 'select 1' }, selected: true }),
          option({ text: 'B', value: 'BB', _model: { id: 2, name: 'select 2' }, selected: true }),
          option({ text: 'C', value: 'CC' })
        ]);

        sut.bind(LF.none);

        const currentValue = sut.currentValue as any[];

        sut.synchronizeValue();

        assert.strictEqual(currentValue, sut.currentValue, `currentValue`);
        assert.strictEqual(currentValue['length'], 2, `currentValue['length']`);

        verifyEqual(
          currentValue,
          [
            { id: 1, name: 'select 1' },
            { id: 2, name: 'select 2' }
          ]
        );

        sut.unbind(LF.none);
      });

      it('synchronize regardless disabled state of <option/>', function () {
        const { sut } = createMutiSelectSut([], [
          option({ text: 'A', value: 'AA', _model: { id: 1, name: 'select 1' }, selected: true }),
          option({ text: 'B', value: 'BB', disabled: true, _model: { id: 2, name: 'select 2' }, selected: true }),
          option({ text: 'C', value: 'CC', disabled: true, selected: true })
        ]);

        sut.bind(LF.none);

        const currentValue = sut.currentValue as any[];

        sut.synchronizeValue();

        assert.strictEqual(currentValue, sut.currentValue, `currentValue`);

        verifyEqual(
          currentValue,
          [
            { id: 1, name: 'select 1' },
            { id: 2, name: 'select 2' },
            'CC'
          ]
        );

        sut.unbind(LF.none);
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

          sut.bind(LF.none);

          const currentValue = sut.currentValue as any[];

          sut.synchronizeValue();

          assert.strictEqual(currentValue, sut.currentValue, `currentValue`);
          assert.strictEqual(currentValue['length'], 2, `currentValue['length']`);

          verifyEqual(
            currentValue,
            [
              { id: 1, name: 'select 1' },
              { id: 2, name: 'select 2' }
            ]
          );

          sut.unbind(LF.none);
        });

      });

      type SelectValidChild = HTMLOptionElement | HTMLOptGroupElement;

      function createMutiSelectSut(initialValue: Anything[], optionFactories: ((ctx: HTMLTestContext) => SelectValidChild)[]) {
        const ctx = TestContext.createHTMLTestContext();
        const { observerLocator } = ctx;

        const el = select(...optionFactories.map(create => create(ctx)))(ctx);
        const sut = observerLocator.getObserver(LF.none, el, 'value') as SelectValueObserver;

        sut.oldValue = sut.currentValue = initialValue;
        return { ctx, el, sut };
      }

      function select(...options: SelectValidChild[]): (ctx: HTMLTestContext) => HTMLSelectElement {
        return function(ctx: HTMLTestContext) {
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
    return function(ctx: HTMLTestContext) {
      return h('option', attributes);
    };
  }

  function optgroup(attributes: Record<string, any>, ...optionFactories: ((ctx: HTMLTestContext) => HTMLOptionElement)[]) {
    return function(ctx: HTMLTestContext) {
      return h('optgroup', attributes, ...optionFactories.map(create => create(ctx)));
    };
  }
});
