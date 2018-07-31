import { spy } from 'sinon';
import { AccessMember, PrimitiveLiteral, IExpression } from './../../../src/runtime/binding/ast';

import { Binding, IBindingTarget } from './../../../src/runtime/binding/binding';
import { IObserverLocator } from '../../../src/runtime/binding/observer-locator';
import { DI, IContainer } from '../../../src/kernel';
import { AccessScope } from '../../../src/runtime/binding/ast';
import { createScopeForTest } from './shared';
import { expect } from 'chai';
import { BindingMode } from '../../../src/runtime/binding/binding-mode';
import { BindingFlags } from '../../../src/runtime/binding/binding-flags';
import { sourceContext } from '../../../src/runtime/binding/binding-context';


/**
 * pad a string with spaces on the right-hand side until it's the specified length
 */
export function padRight(str: any, len: number): string {
  str = str + '';
  const strLen = str.length;
  if (strLen >= len) {
    return str;
  }
  return str + new Array(len - strLen + 1).join(' ');
}

const $nil: any = undefined;
const getName = (o: any) => Object.prototype.toString.call(o).slice(8, -1);

describe('Binding', () => {
  let container: IContainer;
  let observerLocator: IObserverLocator;
  let sut: Binding;
  let dummySourceExpression: IExpression;
  let dummyTarget: IBindingTarget;
  let dummyTargetProperty: string;
  let dummyMode: BindingMode;

  beforeEach(() => {
    container = DI.createContainer();
    observerLocator = container.get(IObserverLocator);
    dummySourceExpression = <any>{};
    dummyTarget = <any>{foo: 'bar'};
    dummyTargetProperty = 'foo';
    dummyMode = BindingMode.twoWay;
    sut = new Binding(dummySourceExpression, dummyTarget, dummyTargetProperty, dummyMode, observerLocator, container);
  });

  describe('constructor', () => {
    const invalidInputs: any[] = [null, undefined, {}];

    for (const ii of invalidInputs) {
      it(`does not throw on invalid input parameters of type ${getName(ii)}`, () => {
        sut = new Binding(ii, ii, ii, ii, ii, ii);
      });
    }
  });


  // TODO: a bunch of these fail (which might not necessarily indicate bugs, they just need to be split up a bit more and properly asserted)
  // describe('$bind()', () => {
  //   const bindingModeArr = [
  //     BindingMode.oneTime,
  //     BindingMode.toView,
  //     BindingMode.fromView,
  //     BindingMode.twoWay
  //   ];
  //   const targetArr = [
  //     document.createElement('div'),
  //     document.createTextNode('foo'),
  //     document.createElement('div').style,
  //     { foo: 'bar' }
  //   ];
  //   const targetPropertyArr = [
  //     'foo', 'textContent', 'innerText'
  //   ];
  //   const sourceExpressionArr = [
  //     new AccessScope('foo'),
  //     new AccessMember(new AccessScope('foo'), 'bar'),
  //     new PrimitiveLiteral(null)
  //   ];

  //   const title1 = '$bind() ';
  //   for (const bindingMode of bindingModeArr) {
  //     const title2 = title1 + ' bindingMode=' + padRight(`${bindingMode}`, 2);

  //     for (const target of targetArr) {
  //     const title3 = title2 + ' target=' + padRight(`${getName(target)}`, 20);
      
  //       for (const targetProperty of targetPropertyArr) {
  //         const title4 = title3 + ' targetProperty=' + padRight(`${targetProperty}`, 12);
          
  //         for (const sourceExpression of sourceExpressionArr) {
  //           const title5 = title4 + ' sourceExpression=' + padRight(`${sourceExpression.constructor.name}`, 16);
            
  //           const scopeArr = [
  //             createScopeForTest({foo: {bar: 42}}),
  //             createScopeForTest({foo: {bar: undefined}}),
  //             createScopeForTest({foo: {bar: 'baz'}})
  //           ];
          
  //           for (const scope of scopeArr) {
  //             const title = title5 + ' scope=' + padRight(`${getName(scope)}`, 2);
              
  //             it(title, () => {
  //               sut = new Binding(sourceExpression, target, targetProperty, bindingMode, observerLocator, container);
  //               sut.$bind(scope);
  //             });
  //           }
  //         }
  //       }
  //     }
  //   }
  // });


  describe('updateTarget()', () => {

  });
  
  describe('updateSource()', () => {

  });
  
  describe('call()', () => {

  });
  
  describe('$bind()', () => {

  });
  
  describe('$unbind()', () => {
    it('should not unbind if it is not already bound', () => {
      const scope: any = {};
      sut['$scope'] = scope;
      sut.$unbind(BindingFlags.none);
      expect(sut['$scope'] === scope).to.be.true;
    });

    it('should unbind if it is bound', () => {
      const scope: any = {};
      sut['$scope'] = scope;
      sut['$isBound'] = true;
      sut['targetObserver'] = <any>{};
      const unobserveSpy = spy(sut, 'unobserve');
      const unbindSpy = dummySourceExpression.unbind = spy();
      sut.$unbind(BindingFlags.none);
      expect(sut['$scope']).to.be.null;
      expect(sut['$isBound']).to.be.false;
      expect(unobserveSpy).to.have.been.calledWith(true);
      expect(unbindSpy).to.have.been.calledWith(BindingFlags.none, scope, sut);
    });
  });
  
  describe('connect()', () => {
    it(`does not connect if it is not bound`, () => {
      const sourceExpression = new MockExpression();
      const targetObserver = new MockObserver();
      sut = new Binding(sourceExpression, dummyTarget, dummyTargetProperty, dummyMode, observerLocator, container);
      sut['targetObserver'] = targetObserver;

      sut.connect(BindingFlags.mustEvaluate);

      expect(sourceExpression.connect).not.to.have.been.called;
      expect(sourceExpression.evaluate).not.to.have.been.called;
      expect(targetObserver.setValue).not.to.have.been.called;
    });

    it(`connects the sourceExpression`, () => {
      const sourceExpression = new MockExpression();
      const targetObserver = new MockObserver();
      sut = new Binding(sourceExpression, dummyTarget, dummyTargetProperty, dummyMode, observerLocator, container);
      sut['targetObserver'] = targetObserver;
      const scope: any = {};
      sut['$scope'] = scope;
      sut['$isBound'] = true;
      const flags = BindingFlags.none;

      sut.connect(BindingFlags.none);

      expect(sourceExpression.connect).to.have.been.calledWith(flags, scope, sut);
      expect(sourceExpression.evaluate).not.to.have.been.called;
      expect(targetObserver.setValue).not.to.have.been.called;
    });

    it(`evaluates the sourceExpression and updates the target with the retrieved value if mustEvaluate is on`, () => {
      const value: any = {};
      const sourceExpression = new MockExpression(value);
      const targetObserver = new MockObserver();
      sut = new Binding(sourceExpression, dummyTarget, dummyTargetProperty, dummyMode, observerLocator, container);
      sut['targetObserver'] = targetObserver;
      const scope: any = {};
      sut['$scope'] = scope;
      sut['$isBound'] = true;

      sut.connect(BindingFlags.mustEvaluate);

      expect(sourceExpression.connect).to.have.been.calledWith(BindingFlags.mustEvaluate, scope, sut);
      expect(sourceExpression.evaluate).to.have.been.calledWith(BindingFlags.mustEvaluate, scope, container);
      expect(targetObserver.setValue).to.have.been.calledWith(value);
    });
  });
  
  describe('addObserver()', () => {
    const countArr = [1, 5, 100];

    for (const count of countArr) {
      it(`adds ${count} observers`, () => {
        let i = 0;
        const flags = BindingFlags.none;
        while (i < count) {
          const observer = new MockObserver();
          sut.addObserver(observer);
          expect(sut[`_observer${i}`] === observer).to.be.true;
          expect(sut[`_observerVersion${i}`] === 0).to.be.true;
          i++;
        }
      });

      it(`calls subscribe() on ${count} observers with sourceContext`, () => {
        let i = 0;
        while (i < count) {
          const observer = new MockObserver();
          sut.addObserver(observer);
          expect(observer.subscribe).to.have.been.calledWith(sourceContext, sut);
          i++;
        }
      });

      it(`does nothing when ${count} observers already exist`, () => {
        let i = 0;
        const flags = BindingFlags.none;
        while (i < count) {
          const observer = new MockObserver();
          sut.addObserver(observer);
          observer.subscribe.resetHistory();
          i++;
        }
        i = 0;
        while (i < count) {
          const observer = sut[`_observer${i}`];
          sut.addObserver(observer);
          expect(observer.subscribe).not.to.have.been.called;
          i++;
        }
      });

      it(`updates the version for ${count} observers`, () => {
        let i = 0;
        const flags = BindingFlags.none;
        while (i < count) {
          const observer = new MockObserver();
          sut.addObserver(observer);
          i++;
        }
        const version = sut['version'] = 5;
        i = 0;
        while (i < count) {
          const observer = sut[`_observer${i}`];
          sut.addObserver(observer);
          expect(sut[`_observerVersion${i}`] === version).to.be.true;
          i++;
        }
      });

      it(`only updates the version for for added observers`, () => {
        const flags = BindingFlags.none;
        let i = 0;
        while (i < count) {
          const observer = new MockObserver();
          sut.addObserver(observer);
          i++;
        }
        const version = sut['version'] = 5;
        i = 0;
        while (i < count) {
          const observer = sut[`_observer${i}`];
          sut.addObserver(observer);
          i+= 2;
        }
        i = 0;
        while (i < count) {
          expect(sut[`_observerVersion${i}`] === version).to.be.true;
          expect(sut[`_observerVersion${i + 1}`] === version).to.be.false;
          i+= 2;
        }
      });
    }
  });
  
  describe('observeProperty()', () => {

  });
  
  describe('unobserve()', () => {

  });
});

class MockObserver {
  getValue = spy();
  setValue = spy();
  subscribe = spy();
  unsubscribe = spy();
}

class MockExpression implements IExpression {
  constructor(public value?: any) {
    this.evaluate = spy(this, 'evaluate');
  }
  evaluate() {
    return this.value;
  }
  connect = spy();
  assign = spy();
  bind = spy();
  unbind = spy();
}
