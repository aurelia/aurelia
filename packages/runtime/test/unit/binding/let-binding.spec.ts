import { expect } from 'chai';
import { spy } from 'sinon';
import { DI, IContainer } from '../../../../kernel/src/index';
import { LetBinding } from '../../../src/binding/let-binding';
import { BindingContext, BindingFlags, BindingMode, ExpressionKind, IBindingTarget, IExpression, IObserverLocator, IScope, Scope } from '../../../src/index';
import { MockExpression } from '../mock';

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
    sut = new LetBinding(dummySourceExpression, dummyTargetProperty, observerLocator, container);
  });

  describe('constructor', () => {
    const invalidInputs: any[] = [null, undefined, {}];

    for (const ii of invalidInputs) {
      it(`does not throw on invalid input parameters of type ${getName(ii)}`, () => {
        sut = new LetBinding(ii, ii, ii, ii, ii);
      });
    }
  });

  describe('$bind()', () => {
    it('does not change target if scope was not changed', () => {
      const vm = {};
      const sourceExpression = new MockExpression();
      const scope = Scope.create(vm, null);
      sut = new LetBinding(<any>sourceExpression, 'foo', observerLocator, container);
      sut.$bind(BindingFlags.none, scope);
      const target = sut.target;
      sut.$bind(BindingFlags.none, scope);
      expect(sut.target).to.equal(target, 'It should have not recreated target');
    });

    it('creates right target with toViewModel === true', () => {
      const vm = { vm: 5 };
      const sourceExpression = new MockExpression();
      sut = new LetBinding(<any>sourceExpression, 'foo', observerLocator, container, true);
      sut.$bind(BindingFlags.none, Scope.create(vm, null));
      expect(sut.target).to.equal(vm, 'It should have used bindingContext to create target.');
    });

    it('creates right target with toViewModel === false', () => {
      const vm = { vm: 5 };
      const view = { view: 6 };
      const sourceExpression = new MockExpression();
      sut = new LetBinding(<any>sourceExpression, 'foo', observerLocator, container);
      sut.$bind(BindingFlags.none, Scope.create(vm, <any>view));
      expect(sut.target).to.equal(view, 'It should have used overrideContext to create target.');
    });
  });

  describe('handleChange()', () => {
    it('handles changes', () => {
      const vm = { vm: 5, foo: false };
      const sourceExpression = new MockExpression();
      sut = new LetBinding(<any>sourceExpression, 'foo', observerLocator, container, true);
      sut.$bind(BindingFlags.none, Scope.create(vm, null));
      vm.foo = true;
      expect(sourceExpression.connect).to.have.been.callCount(1);
    });
  });

  describe('$unbind()', () => {
    it('should not unbind if it is not already bound', () => {
      const sourceExpression = new MockExpression();
      const scope: any = {};
      sut = new LetBinding(<any>sourceExpression, 'foo', observerLocator, container, true);
      sut['$scope'] = scope;
      sut.$unbind(BindingFlags.fromUnbind);
      expect(sut['$scope'] === scope).to.be.true;
    });

    it('should unbind if it is bound', () => {
      const sourceExpression = new MockExpression();
      const scope: any = {};
      sut = new LetBinding(<any>sourceExpression, 'foo', observerLocator, container, true);
      sut['$scope'] = scope;
      sut.$isBound = true;
      const unobserveSpy = spy(sut, 'unobserve');
      const unbindSpy = sourceExpression.unbind = spy();
      sut.$unbind(BindingFlags.fromUnbind);
      expect(sut['$scope']).to.be.null;
      expect(sut['$isBound']).to.be.false;
      expect(unobserveSpy).to.have.been.calledWith(true);
      expect(unbindSpy).to.have.been.calledWith(BindingFlags.fromUnbind, scope, sut);
    });
  });
});
