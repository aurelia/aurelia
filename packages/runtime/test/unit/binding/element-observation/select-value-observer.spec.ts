import { IObserverLocator, IChangeSet, SelectValueObserver, BindingFlags } from '../../../../src/index';
import { createElement, _, eachCartesianJoin, eachCartesianJoinFactory } from '../../util';
import { expect } from 'chai';
import { spy, SinonSpy } from 'sinon';
import { DI } from '../../../../../kernel/src/index';

const eventDefaults = { bubbles: true };

// TODO: need many more tests here, this is just preliminary
describe.only('SelectValueObserver', () => {
  function createFixture(initialValue = '', options = []) {
    const container = DI.createContainer();
    const observerLocator = <IObserverLocator>container.get(IObserverLocator);
    const changeSet = <IChangeSet>container.get(IChangeSet);
    const optionElements = options.map(o => `<option value="${o}">${o}</option>`).join('\n');
    const markup = `<select>\n${optionElements}\n</select>`;
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
});
