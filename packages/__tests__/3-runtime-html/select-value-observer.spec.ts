import { LifecycleFlags as LF, LifecycleFlags, SelectValueObserver } from '@aurelia/runtime-html';
import { h, TestContext, verifyEqual, assert } from '@aurelia/testing';

type Anything = any;

// TODO: need many more tests here, this is just preliminary
describe('SelectValueObserver', function () {
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
      it('synchronizes with array', function () {
        const { sut } = createMutiSelectSut([], [
          option({ text: 'A', selected: true }),
          option({ text: 'B', selected: true }),
          option({ text: 'C' })
        ]);

        const currentValue = sut.currentValue as any[];
        assert.instanceOf(currentValue, Array);
        assert.strictEqual(currentValue['length'], 0, `currentValue['length']`);

        sut.synchronizeValue();

        assert.strictEqual(currentValue, sut.currentValue, `currentValue`);
        assert.strictEqual(currentValue['length'], 2, `currentValue['length']`);
      });

      it('synchronizes with null', function () {
        const { sut } = createMutiSelectSut(null, [
          option({ text: 'A', selected: true }),
          option({ text: 'B', selected: true }),
          option({ text: 'C' })
        ]);

        const currentValue = sut.currentValue as any;
        assert.strictEqual(currentValue, null, `currentValue`);

        sut.synchronizeValue();

        assert.strictEqual(currentValue, sut.currentValue, `currentValue`);
      });

      it('synchronizes with undefined', function () {
        const { sut } = createMutiSelectSut(undefined, [
          option({ text: 'A', selected: true }),
          option({ text: 'B', selected: true }),
          option({ text: 'C' })
        ]);

        const currentValue = sut.currentValue as any;
        assert.strictEqual(currentValue, undefined, `currentValue`);

        sut.synchronizeValue();

        assert.strictEqual(currentValue, sut.currentValue, `currentValue`);
      });

      it('synchronizes with array (2)', function () {
        const { sut } = createMutiSelectSut([], [
          option({ text: 'A', _model: { id: 1, name: 'select 1' }, selected: true }),
          option({ text: 'B', _model: { id: 2, name: 'select 2' }, selected: true }),
          option({ text: 'C' })
        ]);

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
      });

      it('synchronizes with array (3): disregard "value" when there is model', function () {
        const { sut } = createMutiSelectSut([], [
          option({ text: 'A', value: 'AA', _model: { id: 1, name: 'select 1' }, selected: true }),
          option({ text: 'B', value: 'BB', _model: { id: 2, name: 'select 2' }, selected: true }),
          option({ text: 'C', value: 'CC' })
        ]);

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
      });

      it('synchronize regardless disabled state of <option/>', function () {
        const { sut } = createMutiSelectSut([], [
          option({ text: 'A', value: 'AA', _model: { id: 1, name: 'select 1' }, selected: true }),
          option({ text: 'B', value: 'BB', disabled: true, _model: { id: 2, name: 'select 2' }, selected: true }),
          option({ text: 'C', value: 'CC', disabled: true, selected: true })
        ]);

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
      });

      it('syncs array & <option/> mutation (from repeat etc...)', async function () {
        const { sut, ctx } = createMutiSelectSut([], [
          option({ text: 'A', value: 'AA', _model: { id: 1, name: 'select 1' }, selected: true }),
          option({ text: 'B', value: 'BB', disabled: true, _model: { id: 2, name: 'select 2' }, selected: true }),
          option({ text: 'C', value: 'CC', disabled: true, selected: true })
        ]);

        let handleChangeCallCount = 0;
        const currentValue = sut.currentValue as any[];
        const noopSubscriber = {
          handleChange() {
            handleChangeCallCount++;
          },
        };

        sut.synchronizeValue();
        assert.strictEqual(currentValue, sut.currentValue, `currentValue`);
        sut.subscribe(noopSubscriber);

        sut.obj.add(option({ text: 'DD', value: 'DD', selected: true })(ctx));
        await Promise.resolve();

        assert.strictEqual(handleChangeCallCount, 0);
        assert.strictEqual(sut.obj.options[3].value, 'DD');
        assert.strictEqual(sut.obj.options[3].selected, false);
        assert.deepStrictEqual(
          currentValue,
          [
            { id: 1, name: 'select 1' },
            { id: 2, name: 'select 2' },
            'CC',
          ]
        );

        currentValue.push('DD');
        assert.strictEqual(handleChangeCallCount, 0);
        assert.strictEqual(sut.obj.options[3].value, 'DD');
        assert.strictEqual(sut.obj.options[3].selected, true);
        assert.deepStrictEqual(
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
        });

      });

      type SelectValidChild = HTMLOptionElement | HTMLOptGroupElement;

      function createMutiSelectSut(initialValue: Anything[], optionFactories: ((ctx: TestContext) => SelectValidChild)[]) {
        const ctx = TestContext.create();
        const { observerLocator } = ctx;

        const el = select(...optionFactories.map(create => create(ctx)))(ctx);
        const sut = observerLocator.getObserver(el, 'value') as SelectValueObserver;

        sut.oldValue = sut.currentValue = initialValue;
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
