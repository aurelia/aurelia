import { AccessMember, PrimitiveLiteral } from './../../../src/runtime/binding/ast';

import { Binding, BindingMode, BindingFlags } from './../../../src/runtime/binding/binding';
import { IObserverLocator } from '../../../src/runtime/binding/observer-locator';
import { DI, IContainer } from '../../../src/kernel/di';
import { AccessScope } from '../../../src/runtime/binding/ast';
import { createScopeForTest } from './shared';
import { padRight } from '../util';

const getName = (o: any) => Object.prototype.toString.call(o).slice(8, -1);

describe('Binding', () => {
  let container: IContainer;
  let observerLocator: IObserverLocator;
  let sut: Binding;

  beforeEach(() => {
    container = DI.createContainer();
    observerLocator = container.get(IObserverLocator);

  });


  describe('$bind()', () => {
    const bindingModeArr = [
      BindingMode.oneTime,
      BindingMode.toView,
      BindingMode.fromView,
      BindingMode.twoWay
    ];
    const targetArr = [
      document.createElement('div'),
      document.createTextNode('foo'),
      document.createElement('div').style,
      { foo: 'bar' }
    ];
    const targetPropertyArr = [
      'foo', 'textContent', 'innerText'
    ];
    const sourceExpressionArr = [
      new AccessScope('foo'),
      new AccessMember(new AccessScope('foo'), 'bar'),
      new PrimitiveLiteral(null)
    ];

    const title1 = '$bind() ';
    for (const bindingMode of bindingModeArr) {
      const title2 = title1 + ' bindingMode=' + padRight(`${bindingMode}`, 2);

      for (const target of targetArr) {
      const title3 = title2 + ' target=' + padRight(`${getName(target)}`, 20);
      
        for (const targetProperty of targetPropertyArr) {
          const title4 = title3 + ' targetProperty=' + padRight(`${targetProperty}`, 10);
          
          for (const sourceExpression of sourceExpressionArr) {
            const title5 = title4 + ' sourceExpression=' + padRight(`${getName(sourceExpression)}`, 14);
            
            const scopeArr = [
              createScopeForTest({foo: {bar: 42}}),
              createScopeForTest({foo: {bar: undefined}}),
              createScopeForTest({foo: {bar: 'baz'}})
            ];
          
            for (const scope of scopeArr) {
              const title = title5 + ' scope=' + padRight(`${getName(scope)}`, 2);
              
              it(title, () => {
                sut = new Binding(sourceExpression, target, targetProperty, bindingMode, observerLocator, container);
                sut.$bind(BindingFlags.connectImmediate, scope);
              });
            }
          }
        }
      }
    }
  });


  describe('updateTarget()', () => {

  });
  
  describe('updateSource()', () => {

  });
  
  describe('call()', () => {

  });
  
  describe('$bind()', () => {

  });
  
  describe('$unbind()', () => {

  });
  
  describe('connect()', () => {

  });
  
  describe('addObserver()', () => {

  });
  
  describe('observeProperty()', () => {

  });
  
  describe('unobserve()', () => {

  });
});
