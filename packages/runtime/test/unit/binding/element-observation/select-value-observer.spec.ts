import { IObserverLocator, IChangeSet, SelectValueObserver, BindingFlags, DOM } from '../../../../src/index';
import { createElement, _, eachCartesianJoin, eachCartesianJoinFactory, h, verifyEqual } from '../../util';
import { expect } from 'chai';
import { spy, SinonSpy } from 'sinon';
import { DI, Primitive } from '../../../../../kernel/src/index';

const eventDefaults = { bubbles: true };

type Anything = any;

// TODO: need many more tests here, this is just preliminary
describe('SelectValueObserver', () => {
  function createFixture(initialValue: Anything = '', options = [], multiple = false) {
    const container = DI.createContainer();
    const observerLocator = <IObserverLocator>container.get(IObserverLocator);
    const changeSet = <IChangeSet>container.get(IChangeSet);
    const optionElements = options.map(o => `<option value="${o}">${o}</option>`).join('\n');
    const markup = `<select ${multiple ? 'multiple' : ''}>\n${optionElements}\n</select>`;
    const el = <HTMLSelectElement>createElement(markup);
    const sut = <SelectValueObserver>observerLocator.getObserver(el, 'value');
    sut.setValue(initialValue, BindingFlags.none);
    changeSet.flushChanges();

    return { changeSet, el, sut };
  }

  describe('setValue()', () => {
    const valuesArr = [['', 'foo', 'bar']];
    const initialArr = ['', 'foo', 'bar'];
    const nextArr = ['', 'foo', 'bar'];
    for (const values of valuesArr) {
      for (const initial of initialArr) {
        for (const next of nextArr) {
          it(`sets 'value' from "${initial}" to "${next}"`, () => {
            const { changeSet, el, sut } = createFixture(initial, values);

            changeSet.flushChanges();
            expect(el.value).to.equal(initial);

            el.options.item(values.indexOf(next)).selected = true;

            changeSet.flushChanges();
            expect(el.value).to.equal(next);
          });
        }
      }
    }
  });

  describe('bind()', () => {

    it('creates node mutation observer', () => {
      for (const isMultiple of [true, false]) {
        const { sut } = createFixture([], [], isMultiple);
        sut.bind();
        const nodeObserver = sut['nodeObserver'];
        expect(nodeObserver).not.to.be.undefined;
        expect(nodeObserver).to.be.instanceOf(
          DOM.createNodeObserver(document.createElement('div'), () => {}, { childList: true }).constructor,
          'It should have created instance from the same class with other node observer'
        );
      }
    });

    it('uses private method handleNodeChange as callback', (done) => {
      for (const isMultiple of [true, false]) {
        const { el, sut } = createFixture([], [], isMultiple);
        const callbackSpy = spy(sut, 'handleNodeChange');
        sut.bind();
        expect(callbackSpy.calledOnce).to.be.false;
        el.appendChild(document.createElement('option'));
        Promise.resolve()
          .then(() => expect(callbackSpy.calledOnce).to.be.true)
          .catch(ex => expect(ex).to.be.undefined)
          .then(() => done());
      }
    });
  });

  describe('unbind()', () => {
    it('disconnect node observer', () => {
      for (const isMultiple of [true, false]) {
        const { el, sut } = createFixture([], [], isMultiple);
        let count = 0;
        sut['nodeObserver'] = { disconnect() { count++; } } as Anything;
        sut.unbind();
        expect(count).to.equal(1);
        expect(sut['nodeObserver']).to.be.null;
      }
    });
    it('unsubscribes array observer', () => {
      for (const isMultiple of [true, false]) {
        const { el, sut } = createFixture([], [], isMultiple);
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
        expect(sut['arrayObserver']).to.be.null;
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
        expect(currentValue).to.be.null;
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
        expect(currentValue).to.be.undefined;
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
        const container = DI.createContainer();
        const observerLocator = <IObserverLocator>container.get(IObserverLocator);
        // const changeSet = <IChangeSet>container.get(IChangeSet);
        const el = select(...options);
        const sut = <SelectValueObserver>observerLocator.getObserver(el, 'value');
        sut.oldValue = sut.currentValue = initialValue;
        return { el, sut }
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
