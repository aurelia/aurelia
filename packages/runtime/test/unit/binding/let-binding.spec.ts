import { spy } from 'sinon';
import { AccessMember, PrimitiveLiteral, IExpression, ExpressionKind, IBindingTargetObserver, Binding, IBindingTarget, IObserverLocator, AccessScope, BindingMode, BindingFlags, BindingContext, IScope } from '../../../src/index';
import { DI, IContainer } from '../../../../kernel/src/index';
import { createScopeForTest } from './shared';
import { expect } from 'chai';
import { LetBinding } from '../../../src/binding/let-binding';

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

describe('LetBinding', () => {
  let container: IContainer;
  let observerLocator: IObserverLocator;
  let sut: LetBinding;
  let dummySourceExpression: IExpression;
  let dummyTarget: IBindingTarget;
  let dummyTargetProperty: string;
  let dummyMode: BindingMode;

  beforeEach(() => {
    container = DI.createContainer();
    observerLocator = container.get(IObserverLocator);
    dummySourceExpression = <any>{};
    dummyTarget = <any>{ foo: 'bar' };
    dummyTargetProperty = 'foo';
    dummyMode = BindingMode.twoWay;
    sut = new LetBinding(dummySourceExpression, dummyTargetProperty, dummyMode, observerLocator, container);
  });

  describe('constructor', () => {
    const invalidInputs: any[] = [null, undefined, {}];

    for (const ii of invalidInputs) {
      it(`does not throw on invalid input parameters of type ${getName(ii)}`, () => {
        sut = new LetBinding(ii, ii, ii, ii, ii, ii);
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
    it('throws when called', () => {
      expect(() => sut.updateSource(null)).to.throw();
    });
  });

  describe('call()', () => {

  });

  describe('$bind()', () => {
    it('does not change target if scope was not changed', () => {
      const vm = {};
      const sourceExpression = new MockExpression();
      const scope = BindingContext.createScope(vm);
      sut = new LetBinding(<any>sourceExpression, 'foo', BindingMode.toView, observerLocator, container);
      sut.$bind(BindingFlags.none, scope);
      const target = sut.target;
      sut.$bind(BindingFlags.none, scope);
      expect(sut.target).to.equal(target, 'It should have not recreated target');
    });

    it('throws when binding mode is not [toView]', () => {
      const vm = {};
      const sourceExpression = new MockExpression();
      sut = new LetBinding(<any>sourceExpression, 'foo', BindingMode.fromView, observerLocator, container);
      expect(() => sut.$bind(BindingFlags.none, BindingContext.createScope(vm))).to.throw();
      sut = new LetBinding(<any>sourceExpression, 'foo', BindingMode.toView, observerLocator, container);
      expect(() => sut.$bind(BindingFlags.none, BindingContext.createScope(vm))).not.to.throw();
    });

    it('creates right target with toViewModel === true', () => {
      const vm = { vm: 5 };
      const sourceExpression = new MockExpression();
      sut = new LetBinding(<any>sourceExpression, 'foo', BindingMode.toView, observerLocator, container, true);
      sut.$bind(BindingFlags.none, BindingContext.createScope(vm));
      expect((sut.target as IScope).bindingContext).to.equal(vm, 'It should have used bindingContext to create target.');
    });

    it('creates right target with toViewModel === false', () => {
      const vm = { vm: 5 };
      const view = { view: 6 };
      const sourceExpression = new MockExpression();
      sut = new LetBinding(<any>sourceExpression, 'foo', BindingMode.toView, observerLocator, container);
      sut.$bind(BindingFlags.none, BindingContext.createScope(vm, <any>view));
      expect((sut.target as IScope).bindingContext).to.equal(view, 'It should have used overrideContext to create target.');
    });
  });

  describe('$unbind()', () => {
    // it('should not unbind if it is not already bound', () => {
    //   const scope: any = {};
    //   sut['$scope'] = scope;
    //   sut.$unbind(BindingFlags.fromUnbind);
    //   expect(sut['$scope'] === scope).to.be.true;
    // });

    // it('should unbind if it is bound', () => {
    //   const scope: any = {};
    //   sut['$scope'] = scope;
    //   sut['$isBound'] = true;
    //   sut['targetObserver'] = <any>{};
    //   const unobserveSpy = spy(sut, 'unobserve');
    //   const unbindSpy = dummySourceExpression.unbind = spy();
    //   sut.$unbind(BindingFlags.fromUnbind);
    //   expect(sut['$scope']).to.be.null;
    //   expect(sut['$isBound']).to.be.false;
    //   expect(unobserveSpy).to.have.been.calledWith(true);
    //   expect(unbindSpy).to.have.been.calledWith(BindingFlags.fromUnbind, scope, sut);
    // });
  });

  describe('connect()', () => {
    // it(`does not connect if it is not bound`, () => {
    //   const sourceExpression = new MockExpression();
    //   const targetObserver = new MockObserver();
    //   sut = new LetBinding(<any>sourceExpression, dummyTargetProperty, dummyMode, observerLocator, container);
    //   sut['targetObserver'] = targetObserver;

    //   sut.connect(BindingFlags.mustEvaluate);

    //   expect(sourceExpression.connect).not.to.have.been.called;
    //   expect(sourceExpression.evaluate).not.to.have.been.called;
    //   expect(targetObserver.setValue).not.to.have.been.called;
    // });

    // it(`connects the sourceExpression`, () => {
    //   const sourceExpression = new MockExpression();
    //   const targetObserver = new MockObserver();
    //   sut = new LetBinding(<any>sourceExpression, dummyTargetProperty, dummyMode, observerLocator, container);
    //   sut['targetObserver'] = targetObserver;
    //   const scope: any = {};
    //   sut['$scope'] = scope;
    //   sut['$isBound'] = true;
    //   const flags = BindingFlags.none;

    //   sut.connect(flags);

    //   expect(sourceExpression.connect).to.have.been.calledWith(flags, scope, sut);
    //   expect(sourceExpression.evaluate).not.to.have.been.called;
    //   expect(targetObserver.setValue).not.to.have.been.called;
    // });

    // it(`evaluates the sourceExpression and updates the target with the retrieved value if mustEvaluate is on`, () => {
    //   const value: any = {};
    //   const sourceExpression = new MockExpression(value);
    //   const targetObserver = new MockObserver();
    //   sut = new LetBinding(<any>sourceExpression, dummyTargetProperty, dummyMode, observerLocator, container);
    //   sut['targetObserver'] = targetObserver;
    //   const scope: any = {};
    //   sut['$scope'] = scope;
    //   sut['$isBound'] = true;

    //   sut.connect(BindingFlags.mustEvaluate);

    //   expect(sourceExpression.connect).to.have.been.calledWith(BindingFlags.mustEvaluate, scope, sut);
    //   expect(sourceExpression.evaluate).to.have.been.calledWith(BindingFlags.mustEvaluate, scope, container);
    //   expect(targetObserver.setValue).to.have.been.calledWith(value);
    // });
  });
});

class MockObserver implements IBindingTargetObserver {
  bind = spy();
  unbind = spy();
  dispose = spy();
  obj: any;
  propertyKey?: string | number | symbol;
  oldValue?: any;
  previousValue?: any;
  currentValue: any;
  hasChanges?: boolean;
  flushChanges = spy();
  getValue = spy();
  setValue = spy();
  subscribe = spy();
  unsubscribe = spy();
}

class MockExpression implements IExpression {
  public $kind = ExpressionKind.AccessScope;
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
