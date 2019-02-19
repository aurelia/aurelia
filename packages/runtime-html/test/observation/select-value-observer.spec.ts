import { LifecycleFlags as LF } from '@aurelia/runtime';
import { expect } from 'chai';
import { spy } from 'sinon';
import { SelectValueObserver } from '../../src/index';
import { _, h, HTMLTestContext, TestContext, verifyEqual } from '../util';

type Anything = any;

// TODO: need many more tests here, this is just preliminary
describe('SelectValueObserver', function () {
  function createFixture(initialValue: Anything = '', options = [], multiple = false) {
    const ctx = TestContext.createHTMLTestContext();
    const { dom, lifecycle, observerLocator } = ctx;

    const optionElements = options.map(o => `<option value="${o}">${o}</option>`).join('\n');
    const markup = `<select ${multiple ? 'multiple' : ''}>\n${optionElements}\n</select>`;
    const el = ctx.createElementFromMarkup(markup) as HTMLSelectElement;
    const sut = observerLocator.getObserver(LF.none, el, 'value') as SelectValueObserver;
    sut.setValue(initialValue, LF.none);
    lifecycle.processFlushQueue(LF.none);

    return { ctx, lifecycle, el, sut, dom };
  }

  describe('setValue()', function () {
    const valuesArr = [['', 'foo', 'bar']];
    const initialArr = ['', 'foo', 'bar'];
    const nextArr = ['', 'foo', 'bar'];
    for (const values of valuesArr) {
      for (const initial of initialArr) {
        for (const next of nextArr) {
          it(`sets 'value' from "${initial}" to "${next}"`, function () {
            const { lifecycle, el } = createFixture(initial, values);

            lifecycle.processFlushQueue(LF.none);
            expect(el.value).to.equal(initial);

            el.options.item(values.indexOf(next)).selected = true;

            lifecycle.processFlushQueue(LF.none);
            expect(el.value).to.equal(next);
          });
        }
      }
    }
  });

  describe('bind()', function () {

    if (typeof MutationObserver !== 'undefined') {
      it('uses private method handleNodeChange as callback', async function () {
        for (const isMultiple of [true, false]) {
          const { ctx, el, sut } = createFixture([], [], isMultiple);
          const callbackSpy = spy(sut, 'handleNodeChange');
          sut.bind();
          expect(callbackSpy.calledOnce).to.equal(false);
          el.appendChild(ctx.createElement('option'));
          await Promise.resolve();
          expect(callbackSpy).to.have.been.calledOnce;
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
        sut.unbind();
        expect(count).to.equal(1);
        expect(sut['nodeObserver']).to.equal(null);
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
          unsubscribeCollection(observer: Anything) {
            expect(observer).to.equal(sut, 'It should have unsubscribe with right observer.');
            count++;
          }
        };
        sut['nodeObserver'] = nodeObserver;
        sut['arrayObserver'] = arrayObserver;
        sut.unbind();
        expect(count).to.equal(1);
        expect(sut['arrayObserver']).to.equal(null);
      }
    });
  });

  describe('synchronizeOptions', function () {

  });

  describe('synchronizeValue()', function () {
    describe('<select />', function () {

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
        expect(currentValue).to.be.instanceOf(Array);
        expect(currentValue['length']).to.equal(0);
        sut.synchronizeValue();
        expect(currentValue).to.equal(sut.currentValue);
        expect(currentValue['length']).to.equal(2);
      });

      it('synchronizes with null', function () {
        const { sut } = createMutiSelectSut(null, [
          option({ text: 'A', selected: true }),
          option({ text: 'B', selected: true }),
          option({ text: 'C' })
        ]);
        const currentValue = sut.currentValue as any;
        expect(currentValue).to.equal(null);
        sut.synchronizeValue();
        expect(currentValue).to.equal(sut.currentValue);
      });

      it('synchronizes with undefined', function () {
        const { sut } = createMutiSelectSut(undefined, [
          option({ text: 'A', selected: true }),
          option({ text: 'B', selected: true }),
          option({ text: 'C' })
        ]);
        const currentValue = sut.currentValue as any;
        expect(currentValue).to.equal(undefined);
        sut.synchronizeValue();
        expect(currentValue).to.equal(sut.currentValue);
      });

      it('synchronizes with array (2)', function () {
        const { sut } = createMutiSelectSut([], [
          option({ text: 'A', _model: { id: 1, name: 'select 1' }, selected: true }),
          option({ text: 'B', _model: { id: 2, name: 'select 2' }, selected: true }),
          option({ text: 'C' })
        ]);
        const currentValue = sut.currentValue as any[];
        sut.synchronizeValue();
        expect(currentValue).to.equal(sut.currentValue);
        expect(currentValue['length']).to.equal(2);
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
        expect(currentValue).to.equal(sut.currentValue);
        expect(currentValue['length']).to.equal(2);
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
        expect(currentValue).to.equal(sut.currentValue);
        verifyEqual(
          currentValue,
          [
            { id: 1, name: 'select 1' },
            { id: 2, name: 'select 2' },
            'CC'
          ]
        );
      });

      describe('with <optgroup>', function () {
        it('synchronizes with array', function () {
          const { sut } = createMutiSelectSut([], [
            optgroup({},
                     option({ text: 'A', _model: { id: 1, name: 'select 1' }, selected: true }),
                     option({ text: 'B', _model: { id: 2, name: 'select 2' }, selected: true }),
            ),
            option({ text: 'C', value: 'CC' })
          ]);
          const currentValue = sut.currentValue as any[];
          sut.synchronizeValue();
          expect(currentValue).to.equal(sut.currentValue);
          expect(currentValue['length']).to.equal(2);
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
          return h(ctx.doc, 'select',
                   { multiple: true },
                   ...options
          );
        };
      }
    });
  });

  function option(attributes: Record<string, any>) {
    return function(ctx: HTMLTestContext) {
      return h(ctx.doc, 'option', attributes);
    };
  }

  function optgroup(attributes: Record<string, any>, ...optionFactories: ((ctx: HTMLTestContext) => HTMLOptionElement)[]) {
    return function(ctx: HTMLTestContext) {
      return h(ctx.doc, 'optgroup', attributes, ...optionFactories.map(create => create(ctx)));
    };
  }
});
