import { expect } from 'chai';
import { spy } from 'sinon';
import { DI, IContainer } from '../../../../kernel/src/index';
import { LetBinding } from '../../../src/binding/let-binding';
import { BindingContext, BindingFlags, BindingMode, ExpressionKind, IBindingTarget, IExpression, IObserverLocator, IScope } from '../../../src/index';

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

  describe('updateTarget()', () => {
    it('throws when called', () => {
      expect(() => sut.updateTarget(null)).to.throw();
    });
  });

  describe('updateSource()', () => {
    it('throws when called', () => {
      expect(() => sut.updateSource(null)).to.throw();
    });
  });

  describe('$bind()', () => {
    it('does not change target if scope was not changed', () => {
      const vm = {};
      const sourceExpression = new MockExpression();
      const scope = BindingContext.createScope(vm);
      sut = new LetBinding(<any>sourceExpression, 'foo', observerLocator, container);
      sut.$bind(BindingFlags.none, scope);
      const target = sut.target;
      sut.$bind(BindingFlags.none, scope);
      expect(sut.target).to.equal(target, 'It should have not recreated target');
    });

    it('throws when binding mode is not [toView]', () => {
      const vm = {};
      const sourceExpression = new MockExpression();
      sut = new LetBinding(<any>sourceExpression, 'foo', observerLocator, container);
      sut['mode'] = BindingMode.fromView;
      expect(() => sut.$bind(BindingFlags.none, BindingContext.createScope(vm))).to.throw();
      sut = new LetBinding(<any>sourceExpression, 'foo', observerLocator, container);
      sut['mode'] = BindingMode.toView;
      expect(() => sut.$bind(BindingFlags.none, BindingContext.createScope(vm))).not.to.throw();
    });

    it('creates right target with toViewModel === true', () => {
      const vm = { vm: 5 };
      const sourceExpression = new MockExpression();
      sut = new LetBinding(<any>sourceExpression, 'foo', observerLocator, container, true);
      sut.$bind(BindingFlags.none, BindingContext.createScope(vm));
      expect(sut.target).to.equal(vm, 'It should have used bindingContext to create target.');
    });

    it('creates right target with toViewModel === false', () => {
      const vm = { vm: 5 };
      const view = { view: 6 };
      const sourceExpression = new MockExpression();
      sut = new LetBinding(<any>sourceExpression, 'foo', observerLocator, container);
      sut.$bind(BindingFlags.none, BindingContext.createScope(vm, <any>view));
      expect(sut.target).to.equal(view, 'It should have used overrideContext to create target.');
    });
  });

  describe('handleChange()', () => {
    it('handles changes', () => {
      const vm = { vm: 5, foo: false };
      const sourceExpression = new MockExpression();
      sut = new LetBinding(<any>sourceExpression, 'foo', observerLocator, container, true);
      sut.$bind(BindingFlags.none, BindingContext.createScope(vm));
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

  describe('connect()', () => {
    it(`does not connect if it is not bound`, () => {
      const sourceExpression = new MockExpression();
      sut = new LetBinding(<any>sourceExpression, dummyTargetProperty, observerLocator, container);

      sut.connect(BindingFlags.mustEvaluate);

      expect(sourceExpression.connect).not.to.have.been.called;
      expect(sourceExpression.evaluate).not.to.have.been.called;
    });

    it(`connects the sourceExpression`, () => {
      const sourceExpression = new MockExpression();
      sut = new LetBinding(<any>sourceExpression, dummyTargetProperty, observerLocator, container);
      const target = {};
      const scope: any = {};
      sut['target'] = target;
      sut['$scope'] = scope;
      sut['$isBound'] = true;
      const flags = BindingFlags.none;

      sut.connect(flags);

      expect(sourceExpression.connect).to.have.been.calledWith(flags, scope, sut);
      expect(sourceExpression.evaluate).to.have.been.called;
    });
  });
});

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
