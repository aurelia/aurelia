import { IObserverLocator, IChangeSet, SelectValueObserver, BindingFlags, DOM } from '../../../../src/index';
import { createElement, _, eachCartesianJoin, eachCartesianJoinFactory } from '../../util';
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

  describe('synchronizeValue()', () => {

    describe('<select multiple="true" />', () => {

    });
  });
});
