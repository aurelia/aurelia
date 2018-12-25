import { DI } from '@aurelia/kernel';
import { expect } from 'chai';
import {
  SinonSpy,
  spy
} from 'sinon';
import sinon from 'sinon';
import { parseCore } from '../../../jit/src';
import {
  AccessMember,
  AccessScope,
  Binding,
  BindingMode,
  ExpressionKind,
  IBindingTargetObserver,
  IExpression,
  IPropertyChangeNotifier,
  IPropertySubscriber,
  IScope,
  Lifecycle,
  LifecycleFlags,
  ObjectLiteral,
  PrimitiveLiteral,
  PropertyAccessor,
  Scope,
  SetterObserver,
  State,
  SubscriberFlags,
  ILifecycle
} from '../../src/index';
import { createScopeForTest } from '../shared';
import {
  _,
  createObserverLocator,
  eachCartesianJoinFactory,
  ensureNotCalled,
  massReset,
  massRestore,
  massSpy,
  verifyEqual
} from '../util';

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
  let dummySourceExpression: IExpression;
  let dummyTarget: Object;
  let dummyTargetProperty: string;
  let dummyMode: BindingMode;

  function setup(sourceExpression: any = dummySourceExpression, target: any = dummyTarget, targetProperty: string = dummyTargetProperty, mode: BindingMode = dummyMode) {
    const container = DI.createContainer();
    const observerLocator = createObserverLocator(container);
    const lifecycle = container.get(ILifecycle) as Lifecycle;
    const sut = new Binding(sourceExpression, target, targetProperty, mode, observerLocator, container);

    return { sut, lifecycle, container, observerLocator };
  }

  beforeEach(() => {
    dummySourceExpression = <any>{};
    dummyTarget = {foo: 'bar'};
    dummyTargetProperty = 'foo';
    dummyMode = BindingMode.twoWay;
  });

  describe('constructor', () => {
    const invalidInputs: any[] = [null, undefined, {}];

    for (const ii of invalidInputs) {
      it(`throws on invalid input parameters of type ${getName(ii)}`, () => {
        expect(() => new Binding(ii, ii, ii, ii, ii, ii)).to.throw;
      });
    }
  });


  describe('updateTarget()', () => {

  });

  describe('updateSource()', () => {

  });

  describe('handleChange()', () => {

  });

  it(`$bind() [to-view] works with 200 observers`, () => {
    const count = 200;
    let rawExpr = '';
    const ctx = {};
    const args = Array(count);
    for (let i = 0; i < count; ++i) {
      const prop = args[i] = `$${i}`;
      ctx[prop] = 1;
    }
    rawExpr += args.join('+');
    const expr = parseCore(rawExpr, 0);
    const container = DI.createContainer();
    const observerLocator = createObserverLocator(container);
    const lifecycle = container.get(ILifecycle) as Lifecycle;
    const target = {val: 0};
    const sut = new Binding(<any>expr, target, 'val', BindingMode.toView, observerLocator, container);
    const scope = Scope.create(ctx, null);

    sut.$bind(LifecycleFlags.fromBind, scope);
    lifecycle.processConnectQueue(LifecycleFlags.none);

    expect(target.val).to.equal(count);

    for (let i = 0; i < count; ++i) {
      ctx[args[i]] = 2;
    }

    expect(target.val).to.equal(count * 2);

    const ctx2 = {};
    for (let i = 0; i < count; ++i) {
      ctx2[args[i]] = 3;
    }
    const scope2 = Scope.create(ctx2, null);

    sut.$bind(LifecycleFlags.fromBind, scope2);

    expect(target.val).to.equal(count * 3);
  }).timeout(20000);

  describe('$bind() [one-time] assigns the target value', () => {
    eachCartesianJoinFactory(
      [
        <(() => [{foo:string}, string])[]>[
          () => [({ foo: 'bar' }), `{foo:'bar'} `],
          () => [({}),             `{}          `]
        ],
        <(() => [string, string])[]>[
          () => ['fooz', `'foo' `],
          () => ['barz', `'bar' `]
        ],
        <(() => [IExpression, string])[]>[
          () => [new ObjectLiteral(['foo'], [new PrimitiveLiteral(null)]), `{foo:null} `],
          () => [new AccessScope('foo'),                                   `foo        `],
          () => [new AccessMember(new AccessScope('foo'), 'bar'),          `foo.bar    `],
          () => [new PrimitiveLiteral(null),                               `null       `],
          () => [new PrimitiveLiteral(undefined),                          `undefined  `]
        ],
        <(() => [LifecycleFlags, string])[]>[
          () => [LifecycleFlags.fromBind,                                            `fromBind               `],
          () => [LifecycleFlags.updateTargetInstance,                                `updateTarget           `],
          () => [LifecycleFlags.updateTargetInstance | LifecycleFlags.fromFlush,`updateTarget|fromFlush `]
        ],
        <(() => [IScope, string])[]>[
          () => [createScopeForTest({foo: {bar: {}}}),       `{foo:{bar:{}}}       `],
          () => [createScopeForTest({foo: {bar: 42}}),       `{foo:{bar:42}}       `],
          () => [createScopeForTest({foo: {bar: undefined}}),`{foo:{bar:undefined}}`],
          () => [createScopeForTest({foo: {bar: null}}),     `{foo:{bar:null}}     `],
          () => [createScopeForTest({foo: {bar: 'baz'}}),    `{foo:{bar:'baz'}}    `]
        ]
      ],
      ([target, $1], [prop, $2], [expr, $3], [flags, $4], [scope, $5]) => {
        it(`$bind() [one-time]  target=${$1} prop=${$2} expr=${$3} flags=${$4} scope=${$5}`, () => {
          // - Arrange -
          const { sut, lifecycle, container, observerLocator } = setup(expr, target, prop, BindingMode.oneTime);
          const srcVal = expr.evaluate(LifecycleFlags.none, scope, container);
          const targetObserver = observerLocator.getAccessor(target, prop);
          const stub = sinon.stub(observerLocator, 'getAccessor').returns(targetObserver);
          stub.withArgs(target, prop);

          massSpy(targetObserver, 'setValue', 'getValue');
          massSpy(expr, 'evaluate');

          ensureNotCalled(sut, 'handleChange');
          ensureNotCalled(expr, 'assign', 'connect');

          // - Act -
          sut.$bind(flags, scope);
          lifecycle.processConnectQueue(flags);

          // - Assert -
          // double check we have the correct target observer
          expect(sut.targetObserver).to.be.instanceof(PropertyAccessor);
          expect(target['$observers']).to.equal(undefined);

          // verify the behavior inside $bind
          expect(expr.evaluate).to.have.been.calledOnce;
          expect(expr.evaluate).to.have.been.calledWithExactly(flags, scope, container);

          expect(targetObserver.setValue).to.have.been.calledOnce;
          expect(targetObserver.setValue).to.have.been.calledWithExactly(srcVal, flags | LifecycleFlags.updateTargetInstance);
          expect(lifecycle.flushCount).to.equal(0);
        });
      }
    )
  });

  describe('$bind() [to-view] assigns the target value and listens for changes', () => {
    eachCartesianJoinFactory(
      [
        <(() => [{foo:string}, string])[]>[
          () => [({ foo: 'bar' }), `{foo:'bar'} `],
          () => [({ foo: null }),  `{foo:null}  `],
          () => [({}),             `{}          `]
        ],
        <(() => [string, string])[]>[
          () => ['fooz', `'fooz' `], // the target properties are named a bit different to ensure no argument match collision occurs for the observerLocator stub
          () => ['barz', `'barz' `]
        ],
        <(() => [IExpression, string])[]>[
          () => [new ObjectLiteral(['foo'], [new PrimitiveLiteral(null)]), `{foo:null} `],
          () => [new AccessScope('foo'),                                   `foo        `],
          () => [new AccessMember(new AccessScope('foo'), 'bar'),          `foo.bar    `],
          () => [new PrimitiveLiteral(null),                               `null       `],
          () => [new PrimitiveLiteral(undefined),                          `undefined  `]
        ],
        <(() => [LifecycleFlags, string])[]>[
          () => [LifecycleFlags.fromBind,                                            `fromBind               `],
          () => [LifecycleFlags.updateTargetInstance,                                `updateTarget           `],
          () => [LifecycleFlags.updateTargetInstance | LifecycleFlags.fromFlush,`updateTarget|fromFlush `]
        ],
        <(() => [IScope, string])[]>[
          () => [createScopeForTest({foo: {bar: {}}}),       `{foo:{bar:{}}}       `],
          () => [createScopeForTest({foo: {bar: 42}}),       `{foo:{bar:42}}       `],
          () => [createScopeForTest({foo: {bar: undefined}}),`{foo:{bar:undefined}}`],
          () => [createScopeForTest({foo: {bar: null}}),     `{foo:{bar:null}}     `],
          () => [createScopeForTest({foo: {bar: 'baz'}}),    `{foo:{bar:'baz'}}    `]
        ]
      ],
      ([target, $1], [prop, $2], [expr, $3], [flags, $4], [scope, $5]) => {
        it(`$bind() [to-view]  target=${$1} prop=${$2} expr=${$3} flags=${$4} scope=${$5}`, () => {
          // - Arrange - Part 1
          const { sut, lifecycle, container, observerLocator } = setup(expr, target, prop, BindingMode.toView);
          const srcVal = expr.evaluate(LifecycleFlags.none, scope, container);
          const targetObserver = observerLocator.getAccessor(target, prop);

          const stub = sinon.stub(observerLocator, 'getAccessor').returns(targetObserver);
          stub.withArgs(target, prop);

          massSpy(targetObserver, 'setValue', 'getValue');
          massSpy(expr, 'evaluate', 'connect');
          massSpy(sut, 'addObserver', 'observeProperty');

          ensureNotCalled(sut, 'handleChange');

          // - Act - Part 1
          sut.$bind(flags, scope);
          lifecycle.processConnectQueue(flags);

          // - Assert - Part 1
          // verify the behavior inside $bind
          const observer00: SetterObserver = sut['_observer0'];
          const observer01: SetterObserver = sut['_observer1'];
          const observer02: SetterObserver = sut['_observer2'];
          if (expr instanceof AccessScope) {
            expect(observer00).to.be.instanceof(SetterObserver);
            expect(observer01).to.equal(undefined);
            expect(observer02).to.equal(undefined);
          } else if (expr instanceof AccessMember) {
            expect(observer00).to.be.instanceof(SetterObserver);
            expect(observer01).to.be.instanceof(SetterObserver);
            expect(observer02).to.equal(undefined);
          }

          expect(sut.targetObserver).to.be.instanceof(PropertyAccessor);
          expect(target['$observers']).to.equal(undefined);

          expect(expr.evaluate).to.have.been.calledOnce;
          expect(expr.evaluate).to.have.been.calledWithExactly(flags, scope, container);

          expect(expr.connect).to.have.been.calledOnce;
          expect(expr.connect).to.have.been.calledWithExactly(flags | LifecycleFlags.mustEvaluate, sut.$scope, sut);

          expect(targetObserver.setValue).to.have.been.calledOnce;
          expect(targetObserver.setValue).to.have.been.calledWithExactly(srcVal, flags | LifecycleFlags.updateTargetInstance);
          expect(lifecycle.flushCount).to.equal(0);

          // verify the behavior of the sourceExpression (redundant)
          if (expr instanceof AccessMember) {
            expect(sut.addObserver).to.have.been.calledTwice;
            expect(sut.observeProperty).to.have.been.calledTwice;

            const obj = scope.bindingContext[expr.object['name']];
            expect(sut.observeProperty).to.have.been.calledWithExactly(obj, expr.name);
            expect(sut.observeProperty).to.have.been.calledWithExactly(scope.bindingContext, expr.object['name']);
          } else if (expr instanceof AccessScope) {
            expect(sut.addObserver).to.have.been.calledOnce;
            expect(sut.observeProperty).to.have.been.calledOnce;
            expect(sut.observeProperty).to.have.been.calledWithExactly(scope.bindingContext, expr.name);
          } else {
            expect(sut.addObserver).not.to.have.been.called;
            expect(sut.observeProperty).not.to.have.been.called;
          }

          if (srcVal instanceof Object) {
            expect(target[prop]).to.deep.equal(srcVal);
          } else {
            expect(target[prop]).to.equal(srcVal);
          }

          // - Arrange - Part 2
          stub.restore();
          massRestore(targetObserver);
          massRestore(sut);
          massRestore(expr);
          if (observer00) {
            ensureNotCalled(observer00, 'addSubscriber', 'removeSubscriber');
            massSpy(observer00, 'setValue', 'getValue');
            if (observer01) {
              ensureNotCalled(observer01, 'addSubscriber', 'removeSubscriber');
              massSpy(observer01, 'setValue', 'getValue');
            }
            massSpy(sut, 'handleChange', 'addObserver', 'observeProperty', 'unobserve');
            massSpy(targetObserver, 'setValue', 'getValue');
            massSpy(expr, 'evaluate', 'connect');
          } else {
            ensureNotCalled(targetObserver, 'setValue', 'getValue');
            ensureNotCalled(sut, 'handleChange');
            ensureNotCalled(expr, 'evaluate', 'connect');
          }


          const newValue = {};

          // - Act - Part 2
          expr.assign(flags, scope, container, newValue);

          // - Assert - Part 2
          // verify that no observers were added/removed/changed (redundant)
          const observer10: SetterObserver = sut['_observer0'];
          const observer11: SetterObserver = sut['_observer1'];
          const observer12: SetterObserver = sut['_observer2'];
          if (expr instanceof AccessScope) {
            expect(observer10).to.be.instanceof(SetterObserver);
            expect(observer10).to.equal(observer00);
            expect(observer11).to.equal(undefined);
            expect(observer12).to.equal(undefined);
          } else if (expr instanceof AccessMember) {
            expect(observer10).to.be.instanceof(SetterObserver);
            expect(observer10).to.equal(observer00);
            expect(observer11).to.be.instanceof(SetterObserver);
            expect(observer11).to.equal(observer01);
            expect(observer12).to.equal(undefined);
          }

          if (observer00) {
            // verify the behavior of the sourceExpression / sourceObserver (redundant)
            flags = LifecycleFlags.updateTargetInstance;
            if (observer01) {
              expect(observer00.setValue).not.to.have.been.called;
              expect(observer01.setValue).to.have.been.calledOnce;
              expect(observer01.setValue).to.have.been.calledWithExactly(newValue, flags);
            } else {
              expect(observer00.setValue).to.have.been.calledOnce;
              expect(observer00.setValue).to.have.been.calledWithExactly(newValue, flags);
            }

            expect(sut.handleChange).to.have.been.calledOnce;
            expect(sut.handleChange).to.have.been.calledWithExactly(newValue, srcVal, flags);

            // verify the behavior inside handleChange
            if (expr.$kind === ExpressionKind.AccessScope && sut.observerSlots < 2) {
              expect(expr.evaluate).not.to.have.been.called;
            } else {
              expect(expr.evaluate).to.have.been.calledOnce;
              expect(expr.evaluate).to.have.been.calledWithExactly(flags, scope, container);
            }

            expect(targetObserver.getValue).to.have.been.calledOnce;
            expect(targetObserver.getValue).to.have.been.calledWithExactly();

            expect(targetObserver.setValue).to.have.been.calledOnce;
            expect(targetObserver.setValue).to.have.been.calledWithExactly(newValue, flags);

            expect(expr.connect).to.have.been.calledOnce;
            expect(expr.connect).to.have.been.calledWithExactly(flags, scope, sut);

            expect(sut.unobserve).to.have.been.calledOnce;
            expect(sut.unobserve).to.have.been.calledWithExactly(false);

            // verify the behavior of the sourceExpression (connect) (redundant)
            if (expr instanceof AccessMember) {
              expect(sut.addObserver).to.have.been.calledTwice;
              expect(sut.observeProperty).to.have.been.calledTwice;

              const obj = scope.bindingContext[expr.object['name']];
              expect(sut.observeProperty).to.have.been.calledWithExactly(obj, expr.name);
              expect(sut.observeProperty).to.have.been.calledWithExactly(scope.bindingContext, expr.object['name']);

              expect(sut.addObserver).to.have.been.calledWithExactly(observer00);
              expect(sut.addObserver).to.have.been.calledWithExactly(observer01);
            } else if (expr instanceof AccessScope) {
              expect(sut.addObserver).to.have.been.calledOnce;
              expect(sut.observeProperty).to.have.been.calledOnce;
              expect(sut.observeProperty).to.have.been.calledWithExactly(scope.bindingContext, expr.name);

              expect(sut.addObserver).to.have.been.calledWithExactly(observer00);
            }

            // verify the behavior of the targetObserver (redundant)
            expect(target[prop]).to.equal(newValue);
            expect(lifecycle.flushCount).to.equal(0);
          }
        });
      }
    )
  });

  describe('$bind() [from-view] does not assign the target, and listens for changes', () => {
    eachCartesianJoinFactory(
      [
        <(() => [{foo:string}, string])[]>[
          () => [({ foo: 'bar' }), `{foo:'bar'} `],
          () => [({ foo: null }),  `{foo:null}  `],
          () => [({}),             `{}          `]
        ],
        <(() => [string, string])[]>[
          () => ['foo', `'foo' `],
          () => ['bar', `'bar' `]
        ],
        <(() => [any, string])[]>[
          () => [{},        `{}        `],
          () => [null,      `null      `],
          () => [undefined, `undefined `],
          () => [42,        `42        `]
        ],
        <(() => [IExpression, string])[]>[
          () => [new AccessScope('foo'), `foo `]
        ],
        <(() => [LifecycleFlags, string])[]>[
          () => [LifecycleFlags.fromBind,                                            `fromBind               `],
          () => [LifecycleFlags.updateTargetInstance,                                `updateTarget           `],
          () => [LifecycleFlags.updateTargetInstance | LifecycleFlags.fromFlush,`updateTarget|fromFlush `]
        ],
        <(() => [IScope, string])[]>[
          () => [createScopeForTest({foo: {}}), `{foo:{}} `]
        ]
      ],
      ([target, $1], [prop, $2], [newValue, $3], [expr, $4], [flags, $5], [scope, $6]) => {
        it(`$bind() [from-view]  target=${$1} prop=${$2} newValue=${$3} expr=${$4} flags=${$5} scope=${$6}`, () => {
          // - Arrange - Part 1
          const { sut, lifecycle, container, observerLocator } = setup(expr, target, prop, BindingMode.fromView);
          const targetObserver = observerLocator.getObserver(target, prop) as IBindingTargetObserver;
          massSpy(targetObserver, 'subscribe');

          ensureNotCalled(expr, 'evaluate', 'connect', 'assign');
          ensureNotCalled(targetObserver, 'setValue', 'getValue', 'removeSubscriber', 'callSubscribers');
          ensureNotCalled(sut, 'handleChange');

          const initialVal = target[prop];

          // - Act - Part 1
          sut.$bind(flags, scope);
          lifecycle.processConnectQueue(flags);

          // - Assert - Part 1
          expect(lifecycle.flushCount).to.equal(0);

          expect(sut.targetObserver).to.be.instanceof(SetterObserver);
          expect(target['$observers'][prop]).to.be.instanceof(SetterObserver);

          expect(sut['_observer0']).to.equal(undefined);
          expect(sut['_observer1']).to.equal(undefined);

          // verify the behavior inside $bind
          expect(targetObserver.subscribe).to.have.been.calledOnce;
          expect(targetObserver.subscribe).to.have.been.calledWithExactly(sut);

          // - Arrange - Part 2
          massReset(targetObserver);
          massReset(sut);
          massReset(expr);
          ensureNotCalled(targetObserver, 'subscribe');
          massRestore(targetObserver, 'setValue', 'callSubscribers');
          massSpy(sut, 'handleChange');
          massSpy(expr, 'evaluate', 'assign');

          flags = LifecycleFlags.updateSourceExpression;

          // - Act - Part 2
          targetObserver.setValue(newValue, flags);

          // - Assert - Part 2
          expect(lifecycle.flushCount).to.equal(0);

          // verify the behavior of the targetObserver (redundant)
          expect(sut['_observer0']).to.equal(undefined);
          expect(sut['_observer1']).to.equal(undefined);

          if (initialVal !== newValue) {
            expect(sut.handleChange).to.have.been.calledOnce;
            expect(sut.handleChange).to.have.been.calledWithExactly(newValue, initialVal, flags);

            // verify the behavior inside handleChange
            if (expr.$kind === ExpressionKind.AccessScope && sut.observerSlots < 2) {
              expect(expr.evaluate).not.to.have.been.called;
            } else {
              expect(expr.evaluate).to.have.been.calledOnce;
              expect(expr.evaluate).to.have.been.calledWithExactly(flags, scope, container);
            }

            expect(expr.assign).to.have.been.calledOnce;
            expect(expr.assign).to.have.been.calledWithExactly(flags, scope, container, newValue);
          } else {
            // verify the behavior of the targetObserver (redundant)
            expect(sut.handleChange).not.to.have.been.called;

            // verify the behavior inside handleChange
            expect(expr.evaluate).not.to.have.been.called;
            expect(expr.assign).not.to.have.been.called;
          }
        });
      }
    )
  });

  describe('$bind() [two-way] assign the targets, and listens for changes', () => {
    eachCartesianJoinFactory(
      [
        <(() => [{foo:string}, string])[]>[
          () => [{ foo: 'bar' },       `{foo:'bar'}     `],
          () => [({ foo: null }),      `{foo:null}      `],
          () => [({ foo: undefined }), `{foo:undefined} `],
          () => [({}),                 `{}              `]
        ],
        <(() => [string, string])[]>[
          () => ['foo', `'foo' `],
          () => ['bar', `'bar' `]
        ],
        <(() => [any, string])[]>[
          () => [[{}, {}],      `{}, {} `],
          () => [[41, 43],      `41, 43 `]
        ],
        <(() => [IExpression, string])[]>[
          () => [new ObjectLiteral(['foo'], [new PrimitiveLiteral(null)]), `{foo:null} `],
          () => [new AccessScope('foo'),                                   `foo        `],
          () => [new AccessMember(new AccessScope('foo'), 'bar'),          `foo.bar    `],
          () => [new PrimitiveLiteral(null),                               `null       `],
          () => [new PrimitiveLiteral(undefined),                          `undefined  `]
        ],
        <(() => [LifecycleFlags, string])[]>[
          () => [LifecycleFlags.fromBind,             `fromBind     `],
          () => [LifecycleFlags.updateTargetInstance, `updateTarget `]
        ],
        <(() => [IScope, string])[]>[
          () => [createScopeForTest({foo: {}}),              `{foo:{}} `],
          () => [createScopeForTest({foo: {bar: {}}}),       `{foo:{bar:{}}}       `],
          () => [createScopeForTest({foo: {bar: 42}}),       `{foo:{bar:42}}       `],
          () => [createScopeForTest({foo: {bar: undefined}}),`{foo:{bar:undefined}}`],
          () => [createScopeForTest({foo: {bar: null}}),     `{foo:{bar:null}}     `],
          () => [createScopeForTest({foo: {bar: 'baz'}}),    `{foo:{bar:'baz'}}    `]
        ]
      ],
      ([target, $1], [prop, $2], [[newValue1, newValue2], $3], [expr, $4], [flags, $5], [scope, $6]) => {
        it(`$bind() [two-way]  target=${$1} prop=${$2} newValue1,newValue2=${$3} expr=${$4} flags=${$5} scope=${$6}`, () => {
          const originalScope = JSON.parse(JSON.stringify(scope));
          // - Arrange - Part 1
          const { sut, lifecycle, container, observerLocator } = setup(expr, target, prop, BindingMode.twoWay);
          const srcVal = expr.evaluate(LifecycleFlags.none, scope, container);
          const targetObserver = observerLocator.getObserver(target, prop) as IBindingTargetObserver;

          massSpy(targetObserver, 'setValue', 'getValue', 'callSubscribers', 'subscribe');
          massSpy(expr, 'evaluate', 'connect', 'assign');
          massSpy(sut, 'addObserver', 'observeProperty', 'handleChange', 'unobserve');

          // - Act - Part 1
          sut.$bind(flags, scope);
          lifecycle.processConnectQueue(flags);

          // - Assert - Part 1
          // verify the behavior inside $bind
          const observer00: SetterObserver = sut['_observer0'];
          const observer01: SetterObserver = sut['_observer1'];
          const observer02: SetterObserver = sut['_observer2'];

          const subscriber00: IPropertySubscriber = targetObserver['_subscriber0'];
          const subscriber01: IPropertySubscriber = targetObserver['_subscriber1'];
          if (expr instanceof AccessScope) {
            expect(observer00).to.be.instanceof(SetterObserver);
            expect(observer01).to.equal(undefined);
          } else if (expr instanceof AccessMember) {
            expect(observer00).to.be.instanceof(SetterObserver);
            expect(observer01).to.be.instanceof(SetterObserver);
            expect(observer02).to.equal(undefined);
          } else {
            expect(observer00).to.equal(undefined);
          }

          expect(subscriber00).to.equal(sut);
          expect(subscriber01).to.equal(null);

          expect(sut.targetObserver).to.equal(targetObserver);
          expect(sut.targetObserver).to.be.instanceof(SetterObserver);
          expect(target['$observers'][prop]).to.be.instanceof(SetterObserver);

          expect(expr.assign).not.to.have.been.called;

          expect(expr.evaluate).to.have.been.calledOnce;
          expect(expr.evaluate).to.have.been.calledWithExactly(flags, scope, container);

          expect(expr.connect).to.have.been.calledOnce;
          expect(expr.connect).to.have.been.calledWithExactly(flags | LifecycleFlags.mustEvaluate, scope, sut);

          expect(targetObserver.setValue).to.have.been.calledOnce;
          expect(targetObserver.setValue).to.have.been.calledWithExactly(srcVal, flags | LifecycleFlags.updateTargetInstance);

          expect(targetObserver.subscribe).to.have.been.calledOnce;
          expect(targetObserver.subscribe).to.have.been.calledWithExactly(sut);

          // verify the behavior of the sourceExpression (redundant)
          if (expr instanceof AccessMember) {
            expect(sut.addObserver).to.have.been.calledTwice;
            expect(sut.observeProperty).to.have.been.calledTwice
            const obj = scope.bindingContext[expr.object['name']];
            expect(sut.observeProperty).to.have.been.calledWithExactly(obj, expr.name);
            expect(sut.observeProperty).to.have.been.calledWithExactly(scope.bindingContext, expr.object['name']);
          } else if (expr instanceof AccessScope) {
            expect(sut.addObserver).to.have.been.calledOnce;
            expect(sut.observeProperty).to.have.been.calledOnce;
            expect(sut.observeProperty).to.have.been.calledWithExactly(scope.bindingContext, expr.name);
          } else {
            expect(sut.addObserver).not.to.have.been.called;
            expect(sut.observeProperty).not.to.have.been.called;
          }

          expect(lifecycle.flushCount).to.equal(0);
          expect(targetObserver['setValue']).to.have.been.calledOnce;
          expect(targetObserver['setValue']).to.have.been.calledWithExactly(srcVal, flags | LifecycleFlags.updateTargetInstance);

          // verify the behavior of the targetObserver (redundant)
          if (srcVal instanceof Object) {
            expect(target[prop]).to.deep.equal(srcVal);
            expect(targetObserver.currentValue).to.deep.equal(srcVal);
          } else {
            expect(target[prop]).to.equal(srcVal);
            expect(targetObserver.currentValue).to.equal(srcVal);
          }

          if (!(flags & LifecycleFlags.fromBind)) {
            expect(targetObserver.callSubscribers).to.have.been.calledOnce;
          } else {
            expect(targetObserver.callSubscribers).not.to.have.been.called;
          }
          expect(sut.handleChange).not.to.have.been.called;

          // - Arrange - Part 2
          massReset(targetObserver);
          massReset(sut);
          massReset(expr);
          if (observer00) {
            massSpy(observer00, 'setValue', 'getValue');
            if (observer01) {
              massSpy(observer01, 'setValue', 'getValue');
            }
            massSpy(sut, 'handleChange', 'addObserver', 'observeProperty', 'unobserve');
            massSpy(targetObserver, 'setValue', 'getValue');
            massSpy(expr, 'evaluate', 'connect');
          } else {
            ensureNotCalled(targetObserver, 'setValue');
            ensureNotCalled(sut, 'handleChange', 'addObserver', 'observeProperty', 'unobserve');
            ensureNotCalled(expr, 'evaluate', 'connect');
          }

          // - Act - Part 2
          expr.assign(flags, scope, container, newValue1);

          // - Assert - Part 2
          expect(lifecycle.flushCount).to.equal(0);
          // verify that no observers were added/removed/changed (redundant)
          const observer10: SetterObserver = sut['_observer0'];
          const observer11: SetterObserver = sut['_observer1'];
          const observer12: SetterObserver = sut['_observer2'];

          const subscriber10: IPropertySubscriber = targetObserver['_subscriber0'];
          const subscriber11: IPropertySubscriber = targetObserver['_subscriber1'];
          if (expr instanceof AccessScope) {
            expect(observer10).to.be.instanceof(SetterObserver);
            expect(observer10).to.equal(observer00);
            expect(observer11).to.equal(undefined);
            expect(observer12).to.equal(undefined);
          } else if (expr instanceof AccessMember) {
            expect(observer10).to.be.instanceof(SetterObserver);
            expect(observer10).to.equal(observer00);
            expect(observer11).to.be.instanceof(SetterObserver);
            expect(observer11).to.equal(observer01);
            expect(observer12).to.equal(undefined);
          } else {
            expect(observer10).to.equal(undefined);
          }

          expect(subscriber10).to.equal(sut);
          expect(subscriber11).to.equal(null);

          if (observer00) {
            // verify the behavior of the sourceExpression / sourceObserver (redundant)
            flags = LifecycleFlags.updateTargetInstance;
            if (observer01) {
              expect(observer00.setValue).not.to.have.been.called;
              expect(observer01.setValue).to.have.been.calledOnce;
              expect(observer01.setValue).to.have.been.calledWithExactly(newValue1, flags);
            } else {
              expect(observer00.setValue).to.have.been.calledOnce;
              expect(observer00.setValue).to.have.been.calledWithExactly(newValue1, flags);
            }

            expect(sut.handleChange).to.have.been.calledTwice;
            expect(sut.handleChange).to.have.been.calledWithExactly(newValue1, srcVal, flags);

            // verify the behavior inside handleChange
            if (expr.$kind === ExpressionKind.AccessScope && sut.observerSlots < 2) {
              expect(expr.evaluate).not.to.have.been.called;
            } else {
              expect(expr.evaluate).to.have.been.calledTwice;
              expect(expr.evaluate).to.have.been.calledWithExactly(flags, scope, container);
            }

            expect(targetObserver.getValue).to.have.been.calledTwice;
            expect(targetObserver.getValue).to.have.been.calledWithExactly();

            expect(targetObserver.setValue).to.have.been.calledOnce;
            expect(targetObserver.setValue).to.have.been.calledWithExactly(newValue1, flags);

            expect(expr.connect).to.have.been.calledTwice;
            expect(expr.connect).to.have.been.calledWithExactly(flags, scope, sut);

            expect(sut.unobserve).to.have.been.calledTwice;
            expect(sut.unobserve).to.have.been.calledWithExactly(false);

            expect(expr.assign).to.have.been.calledOnce;

            // verify the behavior of the sourceExpression (connect) (redundant)
            if (expr instanceof AccessMember) {
              expect((<SinonSpy>sut.addObserver).getCalls().length).to.equal(4);
              expect((<SinonSpy>sut.observeProperty).getCalls().length).to.equal(4);
              const obj = scope.bindingContext[expr.object['name']];
              expect(sut.observeProperty).to.have.been.calledWithExactly(obj, expr.name);
              expect(sut.observeProperty).to.have.been.calledWithExactly(scope.bindingContext, expr.object['name']);
              expect(sut.addObserver).to.have.been.calledWithExactly(observer00);
              if (observer01) {
                expect(sut.addObserver).to.have.been.calledWithExactly(observer01);
              }
            } else if (expr instanceof AccessScope) {
              expect((<SinonSpy>sut.addObserver).getCalls().length).to.equal(2);
              expect((<SinonSpy>sut.observeProperty).getCalls().length).to.equal(2);
              expect(sut.observeProperty).to.have.been.calledWithExactly(scope.bindingContext, expr.name);

              expect(sut.addObserver).to.have.been.calledWithExactly(observer00);
            }

            expect(targetObserver.currentValue).to.equal(newValue1);
            expect(target[prop]).to.equal(newValue1);
          }

          // - Arrange - Part 3
          const initialVal = target[prop];
          massRestore(targetObserver);
          massRestore(sut);
          massRestore(expr);
          if (observer00) {
            massRestore(observer00);
            massSpy(observer00, 'setValue', 'getValue');
          }
          if (observer01) {
            massRestore(observer01);
            massSpy(observer01, 'setValue', 'getValue');
          }
          massSpy(targetObserver, 'setValue', 'getValue', 'callSubscribers');
          massSpy(sut, 'handleChange');
          massSpy(expr, 'evaluate', 'assign');

          flags = LifecycleFlags.updateSourceExpression;

          // - Act - Part 3
          targetObserver.setValue(newValue2, flags);

          // - Assert - Part 3
          expect(lifecycle.flushCount).to.equal(0);

          // verify the behavior of the targetObserver (redundant)
          expect(sut.handleChange).to.have.been.called;
          expect(sut.handleChange).to.have.been.calledWithExactly(newValue2, initialVal, flags);

          expect(expr.evaluate).to.have.been.called;
          expect(expr.evaluate).to.have.been.calledWithExactly(flags, scope, container);

          // verify the behavior inside handleChange
          expect(expr.assign).to.have.been.calledOnce;
          expect(expr.assign).to.have.been.calledWithExactly(flags, scope, container, newValue2);

          // TODO: put in separate test / make a bit more thorough (this is quite rubbish but better than nothing)
          // - Arrange - Part 4
          massRestore(targetObserver);
          massRestore(sut, 'unobserve');
          massRestore(expr);
          sut.$bind(flags, originalScope);

          verifyEqual(target[prop], srcVal);
          verifyEqual(targetObserver.currentValue, srcVal);
        });
      }
    )
  });

  describe('$unbind()', () => {
    it('should not unbind if it is not already bound', () => {
      const { sut } = setup();
      const scope: any = {};
      sut['$scope'] = scope;
      sut.$unbind(LifecycleFlags.fromUnbind);
      expect(sut['$scope'] === scope).to.equal(true);
    });

    it('should unbind if it is bound', () => {
      const { sut } = setup();
      const scope: any = {};
      sut['$scope'] = scope;
      sut.$state = State.isBound;
      sut['targetObserver'] = <any>{};
      const unobserveSpy = spy(sut, 'unobserve');
      const unbindSpy = dummySourceExpression.unbind = spy();
      (<any>dummySourceExpression).$kind |= ExpressionKind.HasUnbind;
      sut.$unbind(LifecycleFlags.fromUnbind);
      expect(sut['$scope']).to.equal(null);
      expect(sut['$state'] & State.isBound).to.equal(0);
      //expect(unobserveSpy).to.have.been.calledWith(true);
      //expect(unbindSpy).to.have.been.calledWith(LifecycleFlags.fromUnbind, scope, sut);
    });
  });

  describe('addObserver()', () => {
    const countArr = [1, 5, 100];

    for (const count of countArr) {
      it(`adds ${count} observers`, () => {
        const { sut } = setup();
        let i = 0;
        while (i < count) {
          const observer = new MockObserver();
          sut.addObserver(observer);
          expect(sut[`_observer${i}`] === observer).to.equal(true);
          expect(sut[`_observerVersion${i}`] === 0).to.equal(true);
          i++;
        }
      });

      it(`calls subscribe() on ${count} observers`, () => {
        const { sut } = setup();
        let i = 0;
        while (i < count) {
          const observer = new MockObserver();
          sut.addObserver(observer);
          expect(observer.subscribe).to.have.been.calledWith(sut);
          i++;
        }
      });

      it(`does nothing when ${count} observers already exist`, () => {
        const { sut } = setup();
        let i = 0;
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
        const { sut } = setup();
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
          expect(sut[`_observerVersion${i}`] === version).to.equal(true);
          i++;
        }
      });

      it(`only updates the version for for added observers`, () => {
        const { sut } = setup();
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
          expect(sut[`_observerVersion${i}`] === version).to.equal(true);
          expect(sut[`_observerVersion${i + 1}`] === version).to.equal(false);
          i+= 2;
        }
      });
    }
  });

  describe('observeProperty()', () => {

  });

  describe('unobserve()', () => {

  });

  // TODO: create proper unparser
  function unparse(expr: IExpression): string {
    return expr instanceof AccessScope
      ? `AccessScope{${expr.name} | ${expr.ancestor}}`
      : expr instanceof AccessMember
        ? `AccessMember{${unparse(expr.object)}.${expr.name}}`
        : expr instanceof PrimitiveLiteral
          ? `Primitive{${expr.value}}`
          : expr.constructor.name;
  }
});

class MockObserver implements IBindingTargetObserver {
  _subscriberFlags?: SubscriberFlags;
  _subscriber0?: IPropertySubscriber;
  _subscriber1?: IPropertySubscriber;
  _subscriber2?: IPropertySubscriber;
  _subscribersRest?: IPropertySubscriber[];
  callSubscribers: IPropertyChangeNotifier;
  hasSubscribers: IBindingTargetObserver['hasSubscribers'];
  hasSubscriber: IBindingTargetObserver['hasSubscriber'];
  removeSubscriber: IBindingTargetObserver['removeSubscriber'];
  addSubscriber: IBindingTargetObserver['addSubscriber'];
  bind = spy();
  unbind = spy();
  dispose = spy();
  obj: any;
  propertyKey?: string | number | symbol;
  oldValue?: any;
  previousValue?: any;
  currentValue: any;
  hasChanges?: boolean;
  flush = spy();
  getValue = spy();
  setValue = spy();
  subscribe = spy();
  unsubscribe = spy();
}
