import { DI, Registration } from '@aurelia/kernel';
import { IDOM, ILifecycle, IObserverLocator, LifecycleFlags } from '@aurelia/runtime';
import { expect } from 'chai';
import { spy } from 'sinon';
import { HTMLDOM, HTMLRuntimeConfiguration, SelectValueObserver } from '../../src/index';
import { _, createElement, h, verifyEqual } from '../util';

type Anything = any;

// TODO: need many more tests here, this is just preliminary
describe('SelectValueObserver', () => {
  function createFixture(initialValue: Anything = '', options = [], multiple = false) {
    const container = HTMLRuntimeConfiguration.createContainer();
    const dom = new HTMLDOM(document);
    Registration.instance(IDOM, dom).register(container, IDOM);
    const lifecycle = container.get(ILifecycle);
    const observerLocator = container.get(IObserverLocator);

    const optionElements = options.map(o => `<option value="${o}">${o}</option>`).join('\n');
    const markup = `<select ${multiple ? 'multiple' : ''}>\n${optionElements}\n</select>`;
    const el = createElement(markup) as HTMLSelectElement;
    const sut = observerLocator.getObserver(el, 'value') as SelectValueObserver;
    sut.setValue(initialValue, LifecycleFlags.none);
    lifecycle.processFlushQueue(LifecycleFlags.none);

    return { lifecycle, el, sut, dom };
  }

  describe('setValue()', () => {
    const valuesArr = [['', 'foo', 'bar']];
    const initialArr = ['', 'foo', 'bar'];
    const nextArr = ['', 'foo', 'bar'];
    for (const values of valuesArr) {
      for (const initial of initialArr) {
        for (const next of nextArr) {
          it(`sets 'value' from "${initial}" to "${next}"`, () => {
            const { lifecycle, el } = createFixture(initial, values);

            lifecycle.processFlushQueue(LifecycleFlags.none);
            expect(el.value).to.equal(initial);

            el.options.item(values.indexOf(next)).selected = true;

            lifecycle.processFlushQueue(LifecycleFlags.none);
            expect(el.value).to.equal(next);
          });
        }
      }
    }
  });

  describe('bind()', () => {

    it('uses private method handleNodeChange as callback', async () => {
      for (const isMultiple of [true, false]) {
        const { el, sut } = createFixture([], [], isMultiple);
        const callbackSpy = spy(sut, 'handleNodeChange');
        sut.bind();
        expect(callbackSpy.calledOnce).to.equal(false);
        el.appendChild(document.createElement('option'));
        await Promise.resolve();
        expect(callbackSpy).to.have.been.calledOnce;
      }
    });
  });

  describe('unbind()', () => {
    it('disconnect node observer', () => {
      for (const isMultiple of [true, false]) {
        const { sut } = createFixture([], [], isMultiple);
        let count = 0;
        sut['nodeObserver'] = { disconnect() { count++; } } as Anything;
        sut.unbind();
        expect(count).to.equal(1);
        expect(sut['nodeObserver']).to.equal(null);
      }
    });
    it('unsubscribes array observer', () => {
      for (const isMultiple of [true, false]) {
        const { sut } = createFixture([], [], isMultiple);
        let count = 0;
        sut['nodeObserver'] = { disconnect() { } } as Anything;
        sut['arrayObserver'] = {
          unsubscribeBatched(observer: Anything) {
            expect(observer).to.equal(sut, 'It should have unsubscribe with right observer.');
            count++;
          }
        } as Anything;
        sut.unbind();
        expect(count).to.equal(1);
        expect(sut['arrayObserver']).to.equal(null);
      }
    });
  });

  describe('synchronizeOptions', () => {

  });

  describe('synchronizeValue()', () => {
    describe('<select />', () => {

    });
    // There is subtle difference in behavior of synchronization for SelectObserver
    // When synchronzing value without synchronizing Options prior
    // the behavior is different, as such, if currentValue is an array
    //    1. With synchronizeOptions: source => target => source. Or selected <option/> are based on value array
    //    2. Without synchronizeOptions: target => source. Or selected values are based on selected <option/>
    describe('<select multiple="true" />', () => {
      it('synchronizes with array', () => {
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

      it('synchronizes with null', () => {
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

      it('synchronizes with undefined', () => {
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

      it('synchronizes with array (2)', () => {
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

      it('synchronizes with array (3): disregard "value" when there is model', () => {
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

      it('synchronize regardless disabled state of <option/>', () => {
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

      describe('with <optgroup>', () => {
        it('synchronizes with array', () => {
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

      function createMutiSelectSut(initialValue: Anything[], options: SelectValidChild[]) {
        const container = HTMLRuntimeConfiguration.createContainer();
        const dom = new HTMLDOM(document);
        Registration.instance(IDOM, dom).register(container, IDOM);
        const lifecycle = container.get(ILifecycle);
        const observerLocator = container.get(IObserverLocator);

        const el = select(...options);
        const sut = observerLocator.getObserver(el, 'value') as SelectValueObserver;
        sut.oldValue = sut.currentValue = initialValue;
        return { el, sut };
      }

      function select(...options: SelectValidChild[]): HTMLSelectElement {
        return h('select',
                 { multiple: true },
                 ...options
        );
      }
    });
  });

  function option(attributes: Record<string, any>) {
    return h('option', attributes);
  }

  function optgroup(attributes: Record<string, any>, ...options: HTMLOptionElement[]) {
    return h('optgroup', attributes, ...options);
  }
});
