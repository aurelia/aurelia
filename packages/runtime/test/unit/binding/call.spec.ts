import { CallScope, BindingBehavior, ExpressionKind } from './../../../src/binding/ast';
import { spy, SinonSpy } from 'sinon';
import { IExpression, IObserverLocator, AccessScope, BindingFlags, IScope, IChangeSet, SetterObserver, Call } from '../../../src/index';
import { DI } from '../../../../kernel/src/index';
import { createScopeForTest } from './shared';
import { expect } from 'chai';
import { _, massSpy, massReset, massRestore, eachCartesianJoinFactory } from '../util';

describe('Call', () => {
  function setup(sourceExpression: IExpression, target: any, targetProperty: string) {
    const container = DI.createContainer();
    const changeSet = container.get<IChangeSet>(IChangeSet);
    const observerLocator = container.get<IObserverLocator>(IObserverLocator);
    const sut = new Call(sourceExpression, target, targetProperty, observerLocator, container);

    return { sut, changeSet, container, observerLocator };
  }

  describe('$bind -> $bind', () => {

    eachCartesianJoinFactory(
      [
        <(() => [{}, string])[]>[
          () => [({}), `{}`],
          () => [({ fooz: () => {} }), `fooz:()=>{}`]
        ],
        <(() => [string, string])[]>[
          () => ['fooz', `'fooz' `],
          () => ['barz', `'barz' `]
        ],
        <(() => [IExpression, string])[]>[
          () => [new CallScope('theFunc', []),          `theFunc()`],
          () => [new BindingBehavior(new CallScope('theFunc', []), 'debounce', []),          `theFunc()`]
        ],
        <(() => [IScope, string])[]>[
          () => [createScopeForTest({theFunc: () => {}}),       `{theFunc:()=>{}}       `]
        ],
        <(() => [boolean, string])[]>[
          () => [true,       `true`],
          () => [false,       `false`]
        ]
      ],
      ([target, $1], [prop, $2], [expr, $3], [scope, $4], [renewScope, $5]) => {
        it(`$bind() target=${$1} prop=${$2} expr=${$3} scope=${$4} renewScope=${$5}`, () => {
          // - Arrange -
          const { sut, changeSet, observerLocator } = setup(expr, target, prop);
          const flags = BindingFlags.none;
          const targetObserver = observerLocator.getObserver(target, prop);

          massSpy(scope.bindingContext, 'theFunc');
          massSpy(sut, 'callSource');
          massSpy(targetObserver, 'setValue', 'getValue');
          massSpy(expr, 'evaluate', 'assign', 'connect');
          (<any>expr).$kind |= ExpressionKind.HasBind | ExpressionKind.HasUnbind;
          expr['bind'] = spy();
          expr['unbind'] = spy();

          // - Act -
          sut.$bind(flags, scope);

          // - Assert -
          // double check we have the correct target observer
          expect(sut.targetObserver).to.equal(targetObserver);
          expect(sut.targetObserver).to.be.instanceof(SetterObserver);

          expect(expr.bind).to.have.been.calledOnce;
          expect(expr.bind).to.have.been.calledWith(flags, scope, sut);

          expect(targetObserver.setValue).to.have.been.calledOnce;
          expect(changeSet.size).to.equal(0);

          if (renewScope) {
            scope = { ...scope };
          }

          // - Arrange -
          massReset(scope.bindingContext);
          massReset(sut);
          massReset(targetObserver);
          massReset(expr);

          // - Act -
          sut.$bind(flags, scope);

          // - Assert -
          expect(sut.targetObserver).to.be.instanceof(SetterObserver);
          expect(sut.targetObserver).to.equal(targetObserver);
          if (renewScope) {
            // called during $bind, then during $unbind, then during $bind again
            expect(targetObserver.setValue).to.have.been.calledThrice;

            expect(expr.unbind).to.have.been.calledOnce;
            expect(expr.bind).to.have.been.calledOnce;
            expect(expr.bind).to.have.been.calledWith(flags, scope, sut);
          }

          expect(changeSet.size).to.equal(0);
        });
      }
    )
  });

  describe('$bind -> $unbind -> $unbind', () => {

    eachCartesianJoinFactory(
      [
        <(() => [{}, string])[]>[
          () => [({}), `{}`],
          () => [({ fooz: () => {} }), `fooz:()=>{}`]
        ],
        <(() => [string, string])[]>[
          () => ['fooz', `'fooz' `],
          () => ['barz', `'barz' `]
        ],
        <(() => [IExpression, string])[]>[
          () => [new CallScope('theFunc', []),          `theFunc()`],
          () => [new BindingBehavior(new CallScope('theFunc', []), 'debounce', []),          `theFunc()`]
        ],
        <(() => [IScope, string])[]>[
          () => [createScopeForTest({theFunc: () => {}}),       `{theFunc:()=>{}}       `]
        ]
      ],
      ([target, $1], [prop, $2], [expr, $3], [scope, $4]) => {
        it(`$bind() target=${$1} prop=${$2} expr=${$3} scope=${$4}`, () => {
          // - Arrange -
          const { sut, changeSet, observerLocator } = setup(expr, target, prop);
          const flags = BindingFlags.none;
          const targetObserver = observerLocator.getObserver(target, prop);

          massSpy(scope.bindingContext, 'theFunc');
          massSpy(sut, 'callSource');
          massSpy(targetObserver, 'setValue', 'getValue');
          massSpy(expr, 'evaluate', 'assign', 'connect');
          (<any>expr).$kind |= ExpressionKind.HasBind | ExpressionKind.HasUnbind;
          expr['bind'] = spy();
          expr['unbind'] = spy();

          // - Act -
          sut.$bind(flags, scope);

          // - Assert -
          // double check we have the correct target observer
          expect(sut.targetObserver).to.equal(targetObserver);
          expect(sut.targetObserver).to.be.instanceof(SetterObserver);

          expect(expr.bind).to.have.been.calledOnce;
          expect(expr.bind).to.have.been.calledWith(flags, scope, sut);

          expect(targetObserver.setValue).to.have.been.calledOnce;
          expect(changeSet.size).to.equal(0);

          // - Arrange -
          massReset(scope.bindingContext);
          massReset(sut);
          massReset(targetObserver);
          massReset(expr);

          // - Act -
          sut.$unbind(flags);

          // - Assert -
          expect(sut.targetObserver).to.be.instanceof(SetterObserver);
          expect(sut.targetObserver).to.equal(targetObserver);

          expect(expr.unbind).to.have.been.calledOnce;
          expect(target[prop]).to.be.null;

          expect(changeSet.size).to.equal(0);

          // - Arrange -
          massReset(scope.bindingContext);
          massReset(sut);
          massReset(targetObserver);
          massReset(expr);

          // - Act -
          sut.$unbind(flags);

          // - Assert -
          expect(sut.targetObserver).to.be.instanceof(SetterObserver);
          expect(sut.targetObserver).to.equal(targetObserver);

          expect(changeSet.size).to.equal(0);
          expect(expr.unbind).not.to.have.been.called;
        });
      }
    )
  });

  describe('$bind -> call -> $unbind', () => {

    eachCartesianJoinFactory(
      [
        <(() => [{}, string])[]>[
          () => [({}), `{}`],
          () => [({ fooz: () => {} }), `fooz:()=>{}`]
        ],
        <(() => [string, string])[]>[
          () => ['fooz', `'fooz' `],
          () => ['barz', `'barz' `]
        ],
        <(() => [{}, string])[]>[
          () => [{ arg1: 'asdf' }, `{} `],
          () => [{ arg2: 42 }, `{} `],
          () => [{ arg3: null }, `{} `],
          () => [{ arg3: ';lkasdf', arg1: {}, arg2: 42  }, `{} `]
        ],
        <(() => [IExpression, string])[]>[
          () => [new CallScope('theFunc', []),          `theFunc()`],
          () => [new CallScope('theFunc', [new AccessScope('arg1'), new AccessScope('arg2'), new AccessScope('arg3')]), `theFunc(arg1, arg2, arg3)`]
        ],
        <(() => [IScope, string])[]>[
          () => [createScopeForTest({theFunc: () => {}}),       `{theFunc:()=>{}}       `]
        ]
      ],
      ([target, $1], [prop, $2], [args, $3], [expr, $4], [scope, $5]) => {
        it(`$bind() target=${$1} prop=${$2} args=${$3} expr=${$4} scope=${$5}`, () => {
          // - Arrange -
          const { sut, changeSet, observerLocator } = setup(expr, target, prop);
          const flags = BindingFlags.none;
          const targetObserver = observerLocator.getObserver(target, prop);

          massSpy(scope.bindingContext, 'theFunc');
          massSpy(sut, 'callSource');
          massSpy(targetObserver, 'setValue', 'getValue');
          massSpy(expr, 'evaluate', 'assign', 'connect');

          // - Act -
          sut.$bind(flags, scope);

          // - Assert -
          // double check we have the correct target observer
          expect(sut.targetObserver).to.equal(targetObserver);
          expect(sut.targetObserver).to.be.instanceof(SetterObserver);

          expect(targetObserver.setValue).to.have.been.calledOnce;
          expect(changeSet.size).to.equal(0);

          // - Arrange -
          massReset(scope.bindingContext);
          massReset(sut);
          massReset(targetObserver);
          massReset(expr);
          massSpy(target, prop);

          // - Act -
          target[prop](args);

          // - Assert -
          expect((<SinonSpy>sut.callSource).getCalls()[0].args[0]).to.deep.equal(args);
          expect(expr.evaluate).to.have.been.calledOnce;
          expect(target[prop]).to.have.been.calledOnce;
          if (expr['args'].length === 3) {
            expect(scope.bindingContext['theFunc']).to.have.been.calledWithExactly(args[expr['args'][0].name], args[expr['args'][1].name], args[expr['args'][2].name]);
          } else {
            expect(scope.bindingContext['theFunc']).to.have.been.calledWithExactly();
          }

          // - Arrange -
          massRestore(scope.bindingContext);
          massRestore(sut);
          massRestore(targetObserver);
          massRestore(expr);

          // - Act -
          sut.$unbind(flags);

          // - Assert -
          expect(target[prop]).to.be.null;
        });
      }
    )
  });
});
