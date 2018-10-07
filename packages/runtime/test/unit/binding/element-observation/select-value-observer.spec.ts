import { IObserverLocator, IChangeSet, SelectValueObserver, BindingFlags, DOM } from '../../../../src/index';
import { createElement, _, eachCartesianJoin, eachCartesianJoinFactory } from '../../util';
import { expect } from 'chai';
import { spy, SinonSpy } from 'sinon';
import { DI, Primitive } from '../../../../../kernel/src/index';

const eventDefaults = { bubbles: true };

type Anything = any;

// TODO: need many more tests here, this is just preliminary
describe.only('SelectValueObserver', () => {
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
  });

  describe('synchronizeValue()', () => {

    describe('<select multiple="true" />', () => {
      // eachCartesianJoin<
      //   [string, string, boolean],
      //   [string, any, boolean],
      //   [string, boolean],
      //   [string, any, boolean],
      //   void
      // >([
      //     [
      //       [' true', 'true', true],
      //       ['false', 'false', false]
      //     ],
      //     [
      //       [`  -2`,  -2,  false],
      //       [`  -1`,  -1,  false],
      //       [`   0`,   0,  false],
      //       [`   1`,   1,   true],
      //       [`'-2'`, '-2', false],
      //       [`'-1'`, '-1', false],
      //       [` '0'`,  '0', false],
      //       [` '1'`,  '1',  true],
      //       [` '*'`,  '*',  true]
      //     ],
      //     [
      //       [' true', true],
      //       ['false', false]
      //     ],
      //     [
      //       [`  -2`,  -2,  false],
      //       [`  -1`,  -1,  false],
      //       [`   0`,   0,  false],
      //       [`   1`,   1,   true],
      //       [`'-2'`, '-2', false],
      //       [`'-1'`, '-1', false],
      //       [` '0'`,  '0', false],
      //       [` '1'`,  '1',  true],
      //       [` '*'`,  '*',  true]
      //     ]
      //   ],
      //   ([optionModel, optionText, selected]) => {

      //   }
      // );
      // eachCartesianJoin(
      //   [
      //     ['', 'foo', 'bar'],
      //     [
      //       ['', 'foo', 'bar']
      //     ],
      //   ],
      //   (initialValue, optionsValues) => {
      //     it('synchronizes values', () => {
      //       const { changeSet, el, sut } = createFixture(initialValue, optionsValues, true);

      //       sut.synchronizeValue();
      //     });
      //   }
      // );
    });
  });
});
