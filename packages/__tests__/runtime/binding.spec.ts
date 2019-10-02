import {
  AccessMemberExpression,
  AccessScopeExpression,
  BinaryExpression,
  PropertyBinding,
  BindingMode,
  ExpressionKind,
  IBindingTargetObserver,
  IExpression,
  ILifecycle,
  ISubscriber,
  IScope,
  LifecycleFlags as LF,
  ObjectLiteralExpression,
  PrimitiveLiteralExpression,
  PropertyAccessor,
  RuntimeConfiguration,
  Scope,
  SetterObserver,
  State
} from '@aurelia/runtime';
import {
  createObserverLocator,
  createScopeForTest,
  eachCartesianJoinFactory,
  verifyEqual,
  assert,
  createSpy,
} from '@aurelia/testing';

/**
 * pad a string with spaces on the right-hand side until it's the specified length
 */
export function padRight(str: any, len: number): string {
  str = `${str}`;
  const strLen = str.length;
  if (strLen >= len) {
    return str;
  }
  return str + new Array(len - strLen + 1).join(' ');
}

const $nil: any = undefined;
const getName = (o: any) => Object.prototype.toString.call(o).slice(8, -1);

describe('PropertyBinding', function () {
  let dummySourceExpression: IExpression;
  let dummyTarget: Record<string, unknown>;
  let dummyTargetProperty: string;
  let dummyMode: BindingMode;

  function setup(sourceExpression: any = dummySourceExpression, target: any = dummyTarget, targetProperty: string = dummyTargetProperty, mode: BindingMode = dummyMode) {
    const container = RuntimeConfiguration.createContainer();
    const observerLocator = createObserverLocator(container);
    const lifecycle = container.get(ILifecycle);
    const sut = new PropertyBinding(sourceExpression, target, targetProperty, mode, observerLocator, container);

    return { sut, lifecycle, container, observerLocator };
  }

  beforeEach(function () {
    dummySourceExpression = {} as any;
    dummyTarget = {foo: 'bar'};
    dummyTargetProperty = 'foo';
    dummyMode = BindingMode.twoWay;
  });

  describe('constructor', function () {
    const invalidInputs: any[] = [null, undefined, {}];

    for (const ii of invalidInputs) {
      it(`throws on invalid input parameters of type ${getName(ii)}`, function () {
        assert.throws(() => new PropertyBinding(ii, ii, ii, ii, ii, ii), `() => new PropertyBinding(ii, ii, ii, ii, ii, ii)`);
      });
    }
  });

  describe('updateTarget()', function () {

  });

  describe('updateSource()', function () {

  });

  describe('handleChange()', function () {

  });

  it(`$bind() [to-view] works with 200 observers`, function () {
    let expr: AccessScopeExpression | BinaryExpression;

    const count = 200;
    const rawExpr = '';
    const ctx = {};
    const args = Array(count);
    for (let i = 0; i < count; ++i) {
      const prop = args[i] = `$${i}`;
      ctx[prop] = 1;
      if (expr === undefined) {
        expr = new AccessScopeExpression(prop, 0);
      } else {
        expr = new BinaryExpression('+', expr, new AccessScopeExpression(prop, 0));
      }
    }
    const container = RuntimeConfiguration.createContainer();
    const observerLocator = createObserverLocator(container);
    const target = {val: 0};
    const sut = new PropertyBinding(expr as any, target, 'val', BindingMode.toView, observerLocator, container);
    const scope = Scope.create(LF.none, ctx, null);

    sut.$bind(LF.fromBind, scope);

    assert.strictEqual(target.val, count, `target.val`);

    for (let i = 0; i < count; ++i) {
      ctx[args[i]] = 2;
    }

    assert.strictEqual(target.val, count * 2, `target.val`);

    const ctx2 = {};
    for (let i = 0; i < count; ++i) {
      ctx2[args[i]] = 3;
    }
    const scope2 = Scope.create(LF.none, ctx2, null);

    sut.$bind(LF.fromBind, scope2);

    assert.strictEqual(target.val, count * 3, `target.val`);
  }).timeout(20000);

  describe('$bind() [one-time] assigns the target value', function () {
    const targetVariations: (() => [{foo?: string}, string])[] = [
      () => [({ foo: 'bar' }), `{foo:'bar'} `],
      () => [({}),             `{}          `]
    ];

    const propVariations: (() => [string, string])[] = [
      () => ['fooz', `'foo' `],
      () => ['barz', `'bar' `]
    ];

    const exprVariations: (() => [IExpression, string])[] = [
      () => [new ObjectLiteralExpression(['foo'], [new PrimitiveLiteralExpression(null)]), `{foo:null} `],
      () => [new AccessScopeExpression('foo'),                                   `foo        `],
      () => [new AccessMemberExpression(new AccessScopeExpression('foo'), 'bar'),          `foo.bar    `],
      () => [new PrimitiveLiteralExpression(null),                               `null       `],
      () => [new PrimitiveLiteralExpression(undefined),                          `undefined  `]
    ];

    const flagsVariations: (() => [LF, string])[] = [
      () => [LF.fromBind,                                            `fromBind               `],
      () => [LF.updateTargetInstance,                                `updateTarget           `],
      () => [LF.updateTargetInstance | LF.fromFlush, `updateTarget|fromFlush `]
    ];

    const scopeVariations: (() => [IScope, string])[] = [
      () => [createScopeForTest({foo: {bar: {}}}),       `{foo:{bar:{}}}       `],
      () => [createScopeForTest({foo: {bar: 42}}),       `{foo:{bar:42}}       `],
      () => [createScopeForTest({foo: {bar: undefined}}), `{foo:{bar:undefined}}`],
      () => [createScopeForTest({foo: {bar: null}}),     `{foo:{bar:null}}     `],
      () => [createScopeForTest({foo: {bar: 'baz'}}),    `{foo:{bar:'baz'}}    `]
    ];

    const inputs: [typeof targetVariations, typeof propVariations, typeof exprVariations, typeof flagsVariations, typeof scopeVariations]
       = [targetVariations, propVariations, exprVariations, flagsVariations, scopeVariations];

    eachCartesianJoinFactory(inputs, ([target, $1], [prop, $2], [expr, $3], [flags, $4], [scope, $5]) => {
        it(`$bind() [one-time]  target=${$1} prop=${$2} expr=${$3} flags=${$4} scope=${$5}`, function () {
          // - Arrange -
          const { sut, lifecycle, container, observerLocator } = setup(expr, target, prop, BindingMode.oneTime);
          const srcVal = expr.evaluate(LF.none, scope, container);
          const targetObserver = observerLocator.getAccessor(LF.none, target, prop);
          //const $stub = stub(observerLocator, 'getAccessor').returns(targetObserver);
          //$stub.withArgs(LF.none, target, prop);

          //massSpy(targetObserver, 'setValue', 'getValue');
          //massSpy(expr, 'evaluate');

          //ensureNotCalled(sut, 'handleChange');
          //ensureNotCalled(expr, 'assign', 'connect');

          // - Act -
          sut.$bind(flags, scope);

          // - Assert -
          // double check we have the correct target observer
          assert.instanceOf(sut.targetObserver, PropertyAccessor, `sut.targetObserver`);
          assert.strictEqual(target['$observers'], undefined, `target['$observers']`);

          // verify the behavior inside $bind
          //expect(expr.evaluate, `expr.evaluate`).to.have.been.calledOnce;
          //expect(expr.evaluate, `expr.evaluate`).to.have.been.calledWithExactly(flags, scope, container);

          //expect(targetObserver.setValue, `targetObserver.setValue`).to.have.been.calledOnce;
          //expect(targetObserver.setValue, `targetObserver.setValue`).to.have.been.calledWithExactly(srcVal, flags);
          //assert.strictEqual(lifecycle.flushCount, 0, `lifecycle.flushCount`);
        });
      }
    );
  });

  describe('$bind() [to-view] assigns the target value and listens for changes', function () {

    const targetVariations: (() => [{foo?: string}, string])[] = [
      () => [({ foo: 'bar' }), `{foo:'bar'} `],
      () => [({ foo: null }),  `{foo:null}  `],
      () => [({}),             `{}          `]
    ];

    const propVariations: (() => [string, string])[] = [
      () => ['fooz', `'fooz' `], // the target properties are named a bit different to ensure no argument match collision occurs for the observerLocator stub
      () => ['barz', `'barz' `]
    ];

    const exprVariations: (() => [IExpression, string])[] = [
      () => [new ObjectLiteralExpression(['foo'], [new PrimitiveLiteralExpression(null)]), `{foo:null} `],
      () => [new AccessScopeExpression('foo'),                                   `foo        `],
      () => [new AccessMemberExpression(new AccessScopeExpression('foo'), 'bar'),          `foo.bar    `],
      () => [new PrimitiveLiteralExpression(null),                               `null       `],
      () => [new PrimitiveLiteralExpression(undefined),                          `undefined  `]
    ];

    const flagsVariations: (() => [LF, string])[] = [
      () => [LF.fromBind,                                            `fromBind               `],
      () => [LF.updateTargetInstance,                                `updateTarget           `],
      () => [LF.updateTargetInstance | LF.fromFlush, `updateTarget|fromFlush `]
    ];

    const scopeVariations: (() => [IScope, string])[] = [
      () => [createScopeForTest({foo: {bar: {}}}),       `{foo:{bar:{}}}       `],
      () => [createScopeForTest({foo: {bar: 42}}),       `{foo:{bar:42}}       `],
      () => [createScopeForTest({foo: {bar: undefined}}), `{foo:{bar:undefined}}`],
      () => [createScopeForTest({foo: {bar: null}}),     `{foo:{bar:null}}     `],
      () => [createScopeForTest({foo: {bar: 'baz'}}),    `{foo:{bar:'baz'}}    `]
    ];

    const inputs: [typeof targetVariations, typeof propVariations, typeof exprVariations, typeof flagsVariations, typeof scopeVariations]
       = [targetVariations, propVariations, exprVariations, flagsVariations, scopeVariations];

    eachCartesianJoinFactory(inputs, ([target, $1], [prop, $2], [expr, $3], [flags, $4], [scope, $5]) => {
        it(`$bind() [to-view]  target=${$1} prop=${$2} expr=${$3} flags=${$4} scope=${$5}`, function () {
          // - Arrange - Part 1
          const { sut, lifecycle, container, observerLocator } = setup(expr, target, prop, BindingMode.toView);
          const srcVal = expr.evaluate(LF.none, scope, container);
          const targetObserver = observerLocator.getAccessor(LF.none, target, prop);

          //const $stub = stub(observerLocator, 'getAccessor').returns(targetObserver);
          //$stub.withArgs(LF.none, target, prop);

          //massSpy(targetObserver, 'setValue', 'getValue');
          //massSpy(expr, 'evaluate', 'connect');
          //massSpy(sut, 'addObserver', 'observeProperty');

          //ensureNotCalled(sut, 'handleChange');

          // - Act - Part 1
          sut.$bind(flags, scope);

          // - Assert - Part 1
          // verify the behavior inside $bind
          const observer00: SetterObserver = sut['_observer0'];
          const observer01: SetterObserver = sut['_observer1'];
          const observer02: SetterObserver = sut['_observer2'];
          if (expr instanceof AccessScopeExpression) {
            assert.instanceOf(observer00, SetterObserver, `observer00 #01`);
            assert.strictEqual(observer01, undefined, `observer01 #02`);
            assert.strictEqual(observer02, undefined, `observer02 #03`);
          } else if (expr instanceof AccessMemberExpression) {
            assert.instanceOf(observer00, SetterObserver, `observer00 #04`);
            assert.instanceOf(observer01, SetterObserver, `observer01 #05`);
            assert.strictEqual(observer02, undefined, `observer02 #06`);
          }

          assert.instanceOf(sut.targetObserver, PropertyAccessor, `sut.targetObserver #07`);
          assert.strictEqual(target['$observers'], undefined, `target['$observers'] #08`);

          //expect(expr.evaluate, `expr.evaluate #09`).to.have.been.calledOnce;
          //expect(expr.evaluate, `expr.evaluate #10`).to.have.been.calledWithExactly(flags, scope, container);

          //expect(expr.connect, `expr.connect #11`).to.have.been.calledOnce;
          //expect(expr.connect, `expr.connect #12`).to.have.been.calledWithExactly(flags, sut.$scope, sut);

          //expect(targetObserver.setValue, `targetObserver.setValue #13`).to.have.been.calledOnce;
          //expect(targetObserver.setValue, `targetObserver.setValue #14`).to.have.been.calledWithExactly(srcVal, flags);
          //assert.strictEqual(lifecycle.flushCount, 0, `lifecycle.flushCount #15`);

          // verify the behavior of the sourceExpression (redundant)
          if (expr instanceof AccessMemberExpression) {
            //expect(sut.addObserver, `sut.addObserver #16`).to.have.been.calledTwice;
            //expect(sut.observeProperty, `sut.observeProperty #17`).to.have.been.calledTwice;

            const obj = scope.bindingContext[expr.object['name']];
            //expect(sut.observeProperty, `sut.observeProperty #18`).to.have.been.calledWithExactly(flags , obj, expr.name);
            //expect(sut.observeProperty, `sut.observeProperty #19`).to.have.been.calledWithExactly(flags, scope.bindingContext, expr.object['name']);
          } else if (expr instanceof AccessScopeExpression) {
            //expect(sut.addObserver, `sut.addObserver #20`).to.have.been.calledOnce;
            //expect(sut.observeProperty, `sut.observeProperty #21`).to.have.been.calledOnce;
            //expect(sut.observeProperty, `sut.observeProperty #22`).to.have.been.calledWithExactly(flags, scope.bindingContext, expr.name);
          } else {
            //expect(sut.addObserver).not.to.have.been.called;
            //expect(sut.observeProperty).not.to.have.been.called;
          }

          if (srcVal instanceof Object) {
            assert.deepStrictEqual(target[prop], srcVal, `target[prop] #23`);
          } else {
            assert.strictEqual(target[prop], srcVal, `target[prop] #24`);
          }

          // - Arrange - Part 2
          //$stub.restore();
          //massRestore(targetObserver);
          //massRestore(sut);
          //massRestore(expr);
          if (observer00) {
            //ensureNotCalled(observer00, 'addSubscriber', 'removeSubscriber');
            //massSpy(observer00, 'setValue', 'getValue');
            if (observer01) {
              //ensureNotCalled(observer01, 'addSubscriber', 'removeSubscriber');
              //massSpy(observer01, 'setValue', 'getValue');
            }
            //massSpy(sut, 'handleChange', 'addObserver', 'observeProperty', 'unobserve');
            //massSpy(targetObserver, 'setValue', 'getValue');
            //massSpy(expr, 'evaluate', 'connect');
          } else {
            //ensureNotCalled(targetObserver, 'setValue', 'getValue');
            //ensureNotCalled(sut, 'handleChange');
            //ensureNotCalled(expr, 'evaluate', 'connect');
          }

          const newValue = {};

          // - Act - Part 2
          expr.assign(flags, scope, container, newValue);

          // - Assert - Part 2
          // verify that no observers were added/removed/changed (redundant)
          const observer10: SetterObserver = sut['_observer0'];
          const observer11: SetterObserver = sut['_observer1'];
          const observer12: SetterObserver = sut['_observer2'];
          if (expr instanceof AccessScopeExpression) {
            assert.instanceOf(observer10, SetterObserver, `observer10 #25`);
            assert.strictEqual(observer10, observer00, `observer10 #26`);
            assert.strictEqual(observer11, undefined, `observer11 #27`);
            assert.strictEqual(observer12, undefined, `observer12 #28`);
          } else if (expr instanceof AccessMemberExpression) {
            assert.instanceOf(observer10, SetterObserver, `observer10 #29`);
            assert.strictEqual(observer10, observer00, `observer10 #30`);
            assert.instanceOf(observer11, SetterObserver, `observer11 #31`);
            assert.strictEqual(observer11, observer01, `observer11 #32`);
            assert.strictEqual(observer12, undefined, `observer12 #33`);
          }

          if (observer00) {
            // verify the behavior of the sourceExpression / sourceObserver (redundant)
            if (observer01) {
              //expect(observer00.setValue).not.to.have.been.called;
              //expect(observer01.setValue, `observer01.setValue #34`).to.have.been.calledOnce;
              //expect(observer01.setValue, `observer01.setValue #35`).to.have.been.calledWithExactly(newValue, flags);
            } else {
              //expect(observer00.setValue, `observer00.setValue #36`).to.have.been.calledOnce;
              //expect(observer00.setValue, `observer00.setValue #37`).to.have.been.calledWithExactly(newValue, flags);
            }

            if (flags & LF.fromBind) {
              //expect(sut.handleChange, `sut.handleChange #38`).not.to.have.been.called;
              //expect(expr.evaluate).not.to.have.been.called;
              //expect(targetObserver.getValue, `targetObserver.getValue #42`).not.to.have.been.called;
              //expect(targetObserver.setValue, `targetObserver.setValue #44`).not.to.have.been.called;
              //expect(expr.connect, `expr.connect #46`).not.to.have.been.called;
              //expect(sut.unobserve, `sut.unobserve #48`).not.to.have.been.called;
              //expect(sut.addObserver, `sut.addObserver #56`).not.to.have.been.called;
              //expect(sut.observeProperty, `sut.observeProperty #57`).not.to.have.been.called;
              assert.notStrictEqual(target[prop], newValue, `target[prop] #60`);
              //assert.strictEqual(lifecycle.flushCount, 0, `lifecycle.flushCount #61`);
            } else {
              //expect(sut.handleChange, `sut.handleChange #38`).to.have.been.calledOnce;
              //expect(sut.handleChange, `sut.handleChange #39`).to.have.been.calledWithExactly(newValue, srcVal, flags);

              // verify the behavior inside handleChange
              if (expr.$kind === ExpressionKind.AccessScope && sut.observerSlots < 2) {
                //expect(expr.evaluate).not.to.have.been.called;
              } else {
                //expect(expr.evaluate, `expr.evaluate #40`).to.have.been.calledOnce;
                //expect(expr.evaluate, `expr.evaluate #41`).to.have.been.calledWithExactly(flags, scope, container);
              }

              //expect(targetObserver.getValue, `targetObserver.getValue #42`).to.have.been.calledOnce;
              //expect(targetObserver.getValue, `targetObserver.getValue #43`).to.have.been.calledWithExactly();

              //expect(targetObserver.setValue, `targetObserver.setValue #44`).to.have.been.calledOnce;
              //expect(targetObserver.setValue, `targetObserver.setValue #48`).to.have.been.calledWithExactly(newValue, flags);

              //expect(expr.connect, `expr.connect #46`).to.have.been.calledOnce;
              //expect(expr.connect, `expr.connect #47`).to.have.been.calledWithExactly(flags, scope, sut);

              //expect(sut.unobserve, `sut.unobserve #48`).to.have.been.calledOnce;
              //expect(sut.unobserve, `sut.unobserve #49`).to.have.been.calledWithExactly(false);

              // verify the behavior of the sourceExpression (connect) (redundant)
              if (expr instanceof AccessMemberExpression) {
                //expect(sut.addObserver, `sut.addObserver #50`).to.have.been.calledTwice;
                //expect(sut.observeProperty, `sut.observeProperty #51`).to.have.been.calledTwice;

                const obj = scope.bindingContext[expr.object['name']];
                //expect(sut.observeProperty, `sut.observeProperty #52`).to.have.been.calledWithExactly(flags, obj, expr.name);
                //expect(sut.observeProperty, `sut.observeProperty #53`).to.have.been.calledWithExactly(flags, scope.bindingContext, expr.object['name']);

                //expect(sut.addObserver, `sut.addObserver #54`).to.have.been.calledWithExactly(observer00);
                //expect(sut.addObserver, `sut.addObserver #55`).to.have.been.calledWithExactly(observer01);
              } else if (expr instanceof AccessScopeExpression) {
                //expect(sut.addObserver, `sut.addObserver #56`).to.have.been.calledOnce;
                //expect(sut.observeProperty, `sut.observeProperty #57`).to.have.been.calledOnce;
                //expect(sut.observeProperty, `sut.observeProperty #58`).to.have.been.calledWithExactly(flags, scope.bindingContext, expr.name);

                //expect(sut.addObserver, `sut.addObserver #59`).to.have.been.calledWithExactly(observer00);
              }

              // verify the behavior of the targetObserver (redundant)
              assert.strictEqual(target[prop], newValue, `target[prop] #60`);
              //assert.strictEqual(lifecycle.flushCount, 0, `lifecycle.flushCount #61`);
            }
          }
        });
      }
    );
  });

  describe('$bind() [from-view] does not assign the target, and listens for changes', function () {

    const targetVariations: (() => [{foo?: string}, string])[] = [
      () => [({ foo: 'bar' }), `{foo:'bar'} `],
      () => [({ foo: null }),  `{foo:null}  `],
      () => [({}),             `{}          `]
    ];

    const propVariations: (() => [string, string])[] = [
      () => ['foo', `'foo' `],
      () => ['bar', `'bar' `]
    ];

    const newValueVariations: (() => [any, string])[] = [
      () => [{},        `{}        `],
      () => [null,      `null      `],
      () => [undefined, `undefined `],
      () => [42,        `42        `]
    ];

    const exprVariations: (() => [IExpression, string])[] = [
      () => [new AccessScopeExpression('foo'), `foo `]
    ];

    const flagsVariations: (() => [LF, string])[] = [
      () => [LF.fromBind,                                            `fromBind               `],
      () => [LF.updateTargetInstance,                                `updateTarget           `],
      () => [LF.updateTargetInstance | LF.fromFlush, `updateTarget|fromFlush `]
    ];

    const scopeVariations: (() => [IScope, string])[] = [
      () => [createScopeForTest({foo: {}}), `{foo:{}} `]
    ];

    const inputs: [typeof targetVariations, typeof propVariations, typeof newValueVariations, typeof exprVariations, typeof flagsVariations, typeof scopeVariations]
       = [targetVariations, propVariations, newValueVariations, exprVariations, flagsVariations, scopeVariations];

    eachCartesianJoinFactory(inputs, ([target, $1], [prop, $2], [newValue, $3], [expr, $4], [flags, $5], [scope, $6]) => {
        it(`$bind() [from-view]  target=${$1} prop=${$2} newValue=${$3} expr=${$4} flags=${$5} scope=${$6}`, function () {
          // - Arrange - Part 1
          const { sut, lifecycle, container, observerLocator } = setup(expr, target, prop, BindingMode.fromView);
          const targetObserver = observerLocator.getObserver(LF.none, target, prop) as IBindingTargetObserver;
          //massSpy(targetObserver, 'subscribe');

          //ensureNotCalled(expr, 'evaluate', 'connect', 'assign');
          //ensureNotCalled(targetObserver, 'setValue', 'getValue', 'removeSubscriber', 'callSubscribers');
          //ensureNotCalled(sut, 'handleChange');

          const initialVal = target[prop];

          // - Act - Part 1
          sut.$bind(flags, scope);

          // - Assert - Part 1
          //assert.strictEqual(lifecycle.flushCount, 0, `lifecycle.flushCount`);

          assert.instanceOf(sut.targetObserver, SetterObserver, `sut.targetObserver`);
          assert.instanceOf(target['$observers'][prop], SetterObserver, `target['$observers'][prop]`);

          assert.strictEqual(sut['_observer0'], undefined, `sut['_observer0']`);
          assert.strictEqual(sut['_observer1'], undefined, `sut['_observer1']`);

          // verify the behavior inside $bind
          //expect(targetObserver.subscribe, `targetObserver.subscribe`).to.have.been.calledOnce;
          //expect(targetObserver.subscribe, `targetObserver.subscribe`).to.have.been.calledWithExactly(sut);

          // - Arrange - Part 2
          //massReset(targetObserver);
          //massReset(sut);
          //massReset(expr);
          //ensureNotCalled(targetObserver, 'subscribe');
          //massRestore(targetObserver, 'setValue', 'callSubscribers');
          //massSpy(sut, 'handleChange');
          //massSpy(expr, 'evaluate', 'assign');

          flags = LF.updateSourceExpression;

          // - Act - Part 2
          targetObserver.setValue(newValue, flags);

          // - Assert - Part 2
          //assert.strictEqual(lifecycle.flushCount, 0, `lifecycle.flushCount`);

          // verify the behavior of the targetObserver (redundant)
          assert.strictEqual(sut['_observer0'], undefined, `sut['_observer0']`);
          assert.strictEqual(sut['_observer1'], undefined, `sut['_observer1']`);

          if (initialVal !== newValue) {
            //expect(sut.handleChange, `sut.handleChange`).to.have.been.calledOnce;
            //expect(sut.handleChange, `sut.handleChange`).to.have.been.calledWithExactly(newValue, initialVal, flags);

            // verify the behavior inside handleChange
            if (expr.$kind === ExpressionKind.AccessScope && sut.observerSlots < 2) {
              //expect(expr.evaluate).not.to.have.been.called;
            } else {
              //expect(expr.evaluate, `expr.evaluate`).to.have.been.calledOnce;
              //expect(expr.evaluate, `expr.evaluate`).to.have.been.calledWithExactly(flags, scope, container);
            }

            //expect(expr.assign, `expr.assign`).to.have.been.calledOnce;
            //expect(expr.assign, `expr.assign`).to.have.been.calledWithExactly(flags, scope, container, newValue);
          } else {
            // verify the behavior of the targetObserver (redundant)
            //expect(sut.handleChange).not.to.have.been.called;

            // verify the behavior inside handleChange
            //expect(expr.evaluate).not.to.have.been.called;
            //expect(expr.assign).not.to.have.been.called;
          }
        });
      }
    );
  });

  describe('$bind() [two-way] assign the targets, and listens for changes', function () {

    const targetVariations: (() => [{foo?: string}, string])[] = [
      () => [{ foo: 'bar' },       `{foo:'bar'}     `],
      () => [({ foo: null }),      `{foo:null}      `],
      () => [({ foo: undefined }), `{foo:undefined} `],
      () => [({}),                 `{}              `]
    ];

    const propVariations: (() => [string, string])[] = [
      () => ['foo', `'foo' `],
      () => ['bar', `'bar' `]
    ];

    const newValueVariations: (() => [any, string])[] = [
      () => [[{}, {}],      `{}, {} `],
      () => [[41, 43],      `41, 43 `]
    ];

    const exprVariations: (() => [IExpression, string])[] = [
      () => [new ObjectLiteralExpression(['foo'], [new PrimitiveLiteralExpression(null)]), `{foo:null} `],
      () => [new AccessScopeExpression('foo'),                                   `foo        `],
      () => [new AccessMemberExpression(new AccessScopeExpression('foo'), 'bar'),          `foo.bar    `],
      () => [new PrimitiveLiteralExpression(null),                               `null       `],
      () => [new PrimitiveLiteralExpression(undefined),                          `undefined  `]
    ];

    const flagsVariations: (() => [LF, string])[] = [
      () => [LF.fromBind,             `fromBind     `],
      () => [LF.updateTargetInstance, `updateTarget `]
    ];

    const scopeVariations: (() => [IScope, string])[] = [
      () => [createScopeForTest({foo: {}}),              `{foo:{}} `],
      () => [createScopeForTest({foo: {bar: {}}}),       `{foo:{bar:{}}}       `],
      () => [createScopeForTest({foo: {bar: 42}}),       `{foo:{bar:42}}       `],
      () => [createScopeForTest({foo: {bar: undefined}}), `{foo:{bar:undefined}}`],
      () => [createScopeForTest({foo: {bar: null}}),     `{foo:{bar:null}}     `],
      () => [createScopeForTest({foo: {bar: 'baz'}}),    `{foo:{bar:'baz'}}    `]
    ];

    const inputs: [typeof targetVariations, typeof propVariations, typeof newValueVariations, typeof exprVariations, typeof flagsVariations, typeof scopeVariations]
       = [targetVariations, propVariations, newValueVariations, exprVariations, flagsVariations, scopeVariations];

    eachCartesianJoinFactory(inputs, ([target, $1], [prop, $2], [[newValue1, newValue2], $3], [expr, $4], [flags, $5], [scope, $6]) => {
        it(`$bind() [two-way]  target=${$1} prop=${$2} newValue1,newValue2=${$3} expr=${$4} flags=${$5} scope=${$6}`, function () {
          const originalScope = JSON.parse(JSON.stringify(scope));
          // - Arrange - Part 1
          const { sut, lifecycle, container, observerLocator } = setup(expr, target, prop, BindingMode.twoWay);
          const srcVal = expr.evaluate(LF.none, scope, container);
          const targetObserver = observerLocator.getObserver(LF.none, target, prop) as IBindingTargetObserver;

          //massSpy(targetObserver, 'setValue', 'getValue', 'callSubscribers', 'subscribe');
          //massSpy(expr, 'evaluate', 'connect', 'assign');
          //massSpy(sut, 'addObserver', 'observeProperty', 'handleChange', 'unobserve');

          // - Act - Part 1
          sut.$bind(flags, scope);

          // - Assert - Part 1
          // verify the behavior inside $bind
          const observer00: SetterObserver = sut['_observer0'];
          const observer01: SetterObserver = sut['_observer1'];
          const observer02: SetterObserver = sut['_observer2'];

          const subscriber00: ISubscriber = targetObserver['_subscriber0'];
          const subscriber01: ISubscriber = targetObserver['_subscriber1'];
          if (expr instanceof AccessScopeExpression) {
            assert.instanceOf(observer00, SetterObserver, `observer00 #01`);
            assert.strictEqual(observer01, undefined, `observer01 #02`);
          } else if (expr instanceof AccessMemberExpression) {
            assert.instanceOf(observer00, SetterObserver, `observer00 #03`);
            assert.instanceOf(observer01, SetterObserver, `observer01 #04`);
            assert.strictEqual(observer02, undefined, `observer02 #05`);
          } else {
            assert.strictEqual(observer00, undefined, `observer00 #06`);
          }

          assert.strictEqual(subscriber00, sut, `subscriber00 #07`);
          assert.strictEqual(subscriber01, undefined, `subscriber01 #08`);

          assert.strictEqual(sut.targetObserver, targetObserver, `sut.targetObserver #09`);
          assert.instanceOf(sut.targetObserver, SetterObserver, `sut.targetObserver #10`);
          assert.instanceOf(target['$observers'][prop], SetterObserver, `target['$observers'][prop] #11`);

          //expect(expr.assign).not.to.have.been.called;

          //expect(expr.evaluate, `expr.evaluate #12`).to.have.been.calledOnce;
          //expect(expr.evaluate, `expr.evaluate #13`).to.have.been.calledWithExactly(flags, scope, container);

          //expect(expr.connect, `expr.connect #14`).to.have.been.calledOnce;
          //expect(expr.connect, `expr.connect #15`).to.have.been.calledWithExactly(flags, scope, sut);

          //expect(targetObserver.setValue, `targetObserver.setValue #16`).to.have.been.calledOnce;
          //expect(targetObserver.setValue, `targetObserver.setValue #17`).to.have.been.calledWithExactly(srcVal, flags);

          //expect(targetObserver.subscribe, `targetObserver.subscribe #18`).to.have.been.calledOnce;
          //expect(targetObserver.subscribe, `targetObserver.subscribe #19`).to.have.been.calledWithExactly(sut);

          // verify the behavior of the sourceExpression (redundant)
          if (expr instanceof AccessMemberExpression) {
            //expect(sut.addObserver, `sut.addObserver #20`).to.have.been.calledTwice;
            //expect(sut.observeProperty, `sut.observeProperty #21`).to.have.been.calledTwice;
            const obj = scope.bindingContext[expr.object['name']];
            //expect(sut.observeProperty, `sut.observeProperty #22`).to.have.been.calledWithExactly(flags, obj, expr.name);
            //expect(sut.observeProperty, `sut.observeProperty #23`).to.have.been.calledWithExactly(flags, scope.bindingContext, expr.object['name']);
          } else if (expr instanceof AccessScopeExpression) {
            //expect(sut.addObserver, `sut.addObserver #24`).to.have.been.calledOnce;
            //expect(sut.observeProperty, `sut.observeProperty #25`).to.have.been.calledOnce;
            //expect(sut.observeProperty, `sut.observeProperty #26`).to.have.been.calledWithExactly(flags, scope.bindingContext, expr.name);
          } else {
            //expect(sut.addObserver).not.to.have.been.called;
            //expect(sut.observeProperty).not.to.have.been.called;
          }

          //assert.strictEqual(lifecycle.flushCount, 0, `lifecycle.flushCount #27`);
          //expect(targetObserver['setValue'], `targetObserver['setValue'] #28`).to.have.been.calledOnce;
          //expect(targetObserver['setValue'], `targetObserver['setValue'] #29`).to.have.been.calledWithExactly(srcVal, flags);

          // verify the behavior of the targetObserver (redundant)
          if (srcVal instanceof Object) {
            assert.deepStrictEqual(target[prop], srcVal, `target[prop] #30`);
            assert.deepStrictEqual(targetObserver.currentValue, srcVal, `targetObserver.currentValue #31`);
          } else {
            assert.strictEqual(target[prop], srcVal, `target[prop] #32`);
            assert.strictEqual(targetObserver.currentValue, srcVal, `targetObserver.currentValue #33`);
          }

          if (!(flags & LF.fromBind)) {
            //expect(targetObserver.callSubscribers, `targetObserver.callSubscribers #34`).to.have.been.calledOnce;
          } else {
            //expect(targetObserver.callSubscribers, `targetObserver.callSubscribers #35`).not.to.have.been.called;
          }
          //expect(sut.handleChange, `sut.handleChange #36`).not.to.have.been.called;

          // - Arrange - Part 2
          //massReset(targetObserver);
          //massReset(sut);
          //massReset(expr);
          if (observer00) {
            //massSpy(observer00, 'setValue', 'getValue');
            if (observer01) {
              //massSpy(observer01, 'setValue', 'getValue');
            }
            //massSpy(sut, 'handleChange', 'addObserver', 'observeProperty', 'unobserve');
            //massSpy(targetObserver, 'setValue', 'getValue');
            //massSpy(expr, 'evaluate', 'connect');
          } else {
            //ensureNotCalled(targetObserver, 'setValue');
            //ensureNotCalled(sut, 'handleChange', 'addObserver', 'observeProperty', 'unobserve');
            //ensureNotCalled(expr, 'evaluate');
          }

          // - Act - Part 2
          expr.assign(flags, scope, container, newValue1);

          // - Assert - Part 2
          //assert.strictEqual(lifecycle.flushCount, 0, `lifecycle.flushCount #37`);
          // verify that no observers were added/removed/changed (redundant)
          const observer10: SetterObserver = sut['_observer0'];
          const observer11: SetterObserver = sut['_observer1'];
          const observer12: SetterObserver = sut['_observer2'];

          const subscriber10: ISubscriber = targetObserver['_subscriber0'];
          const subscriber11: ISubscriber = targetObserver['_subscriber1'];
          if (expr instanceof AccessScopeExpression) {
            assert.instanceOf(observer10, SetterObserver, `observer10 #38`);
            assert.strictEqual(observer10, observer00, `observer10 #39`);
            assert.strictEqual(observer11, undefined, `observer11 #40`);
            assert.strictEqual(observer12, undefined, `observer12 #41`);
          } else if (expr instanceof AccessMemberExpression) {
            assert.instanceOf(observer10, SetterObserver, `observer10 #42`);
            assert.strictEqual(observer10, observer00, `observer10 #43`);
            assert.instanceOf(observer11, SetterObserver, `observer11 #44`);
            assert.strictEqual(observer11, observer01, `observer11 #45`);
            assert.strictEqual(observer12, undefined, `observer12 #46`);
          } else {
            assert.strictEqual(observer10, undefined, `observer10 #47`);
          }

          assert.strictEqual(subscriber10, sut, `subscriber10 #48`);
          assert.strictEqual(subscriber11, undefined, `subscriber11 #49`);

          if (observer00) {
            // verify the behavior of the sourceExpression / sourceObserver (redundant)
            if (observer01) {
              //expect(observer00.setValue).not.to.have.been.called;
              //expect(observer01.setValue, `observer01.setValue #50`).to.have.been.calledOnce;
              //expect(observer01.setValue, `observer01.setValue #51`).to.have.been.calledWithExactly(newValue1, flags);
            } else {
              //expect(observer00.setValue, `observer00.setValue #52`).to.have.been.calledOnce;
              //expect(observer00.setValue, `observer00.setValue #53`).to.have.been.calledWithExactly(newValue1, flags);
            }

            if (flags & LF.fromBind) {
              //expect(sut.handleChange, `sut.handleChange #54`).not.to.have.been.called;
              //expect(expr.evaluate, `expr.evaluate #56`).not.to.have.been.called;
              //expect(targetObserver.getValue, `targetObserver.getValue #59`).not.to.have.been.called;
              //expect(targetObserver.setValue, `targetObserver.setValue #61`).not.to.have.been.called;
              //expect(expr.connect, `expr.connect #63`).not.to.have.been.called;
              //expect(sut.unobserve, `sut.unobserve #65`).not.to.have.been.called;
              //expect(expr.assign, `expr.assign #67`).to.have.been.calledOnce;

              // verify the behavior of the sourceExpression (connect) (redundant)
              if (expr instanceof AccessMemberExpression) {
                //assert.strictEqual((sut.addObserver as SinonSpy).getCalls().length, 0, `(sut.addObserver as SinonSpy).getCalls().length #68`);
                //assert.strictEqual((sut.observeProperty as SinonSpy).getCalls().length, 0, `(sut.observeProperty as SinonSpy).getCalls().length #69`);
              } else if (expr instanceof AccessScopeExpression) {
                //assert.strictEqual((sut.addObserver as SinonSpy).getCalls().length, 0, `(sut.addObserver as SinonSpy).getCalls().length #74`);
                //assert.strictEqual((sut.observeProperty as SinonSpy).getCalls().length, 0, `(sut.observeProperty as SinonSpy).getCalls().length #75`);
              }
              assert.notStrictEqual(targetObserver.currentValue, newValue1, `targetObserver.currentValue #78`);
              assert.notStrictEqual(target[prop], newValue1, `target[prop] #79`);
            } else {
              //expect(sut.handleChange, `sut.handleChange #54`).to.have.been.calledOnce;
              //expect(sut.handleChange, `sut.handleChange #55`).to.have.been.calledWithExactly(newValue1, srcVal, flags);

              // verify the behavior inside handleChange
              if (expr.$kind === ExpressionKind.AccessScope && sut.observerSlots < 2) {
                //expect(expr.evaluate, `expr.evaluate #56`).not.to.have.been.called;
              } else {
                //expect(expr.evaluate, `expr.evaluate #57`).to.have.been.calledOnce;
                //expect(expr.evaluate, `expr.evaluate #58`).to.have.been.calledWithExactly(flags, scope, container);
              }

              //expect(targetObserver.getValue, `targetObserver.getValue #59`).to.have.been.calledOnce;
              //expect(targetObserver.getValue, `targetObserver.getValue #60`).to.have.been.calledWithExactly();

              //expect(targetObserver.setValue, `targetObserver.setValue #61`).to.have.been.calledOnce;
              //expect(targetObserver.setValue, `targetObserver.setValue #62`).to.have.been.calledWithExactly(newValue1, flags);

              //expect(expr.connect, `expr.connect #63`).to.have.been.calledOnce;
              //expect(expr.connect, `expr.connect #64`).to.have.been.calledWithExactly(flags, scope, sut);

              //expect(sut.unobserve, `sut.unobserve #65`).to.have.been.calledOnce;
              //expect(sut.unobserve, `sut.unobserve #66`).to.have.been.calledWithExactly(false);

              //expect(expr.assign, `expr.assign #67`).to.have.been.calledOnce;

              // verify the behavior of the sourceExpression (connect) (redundant)
              if (expr instanceof AccessMemberExpression) {
                //assert.strictEqual((sut.addObserver as SinonSpy).getCalls().length, 2, `(sut.addObserver as SinonSpy).getCalls().length #68`);
                //assert.strictEqual((sut.observeProperty as SinonSpy).getCalls().length, 2, `(sut.observeProperty as SinonSpy).getCalls().length #69`);
                const obj = scope.bindingContext[expr.object['name']];
                //expect(sut.observeProperty, `sut.observeProperty #70`).to.have.been.calledWithExactly(flags, obj, expr.name);
                //expect(sut.observeProperty, `sut.observeProperty #71`).to.have.been.calledWithExactly(flags, scope.bindingContext, expr.object['name']);
                //expect(sut.addObserver, `sut.addObserver #72`).to.have.been.calledWithExactly(observer00);
                if (observer01) {
                  //expect(sut.addObserver, `sut.addObserver #73`).to.have.been.calledWithExactly(observer01);
                }
              } else if (expr instanceof AccessScopeExpression) {
                //assert.strictEqual((sut.addObserver as SinonSpy).getCalls().length, 1, `(sut.addObserver as SinonSpy).getCalls().length #74`);
                //assert.strictEqual((sut.observeProperty as SinonSpy).getCalls().length, 1, `(sut.observeProperty as SinonSpy).getCalls().length #75`);
                //expect(sut.observeProperty, `sut.observeProperty #76`).to.have.been.calledWithExactly(flags, scope.bindingContext, expr.name);

                //expect(sut.addObserver, `sut.addObserver #77`).to.have.been.calledWithExactly(observer00);
              }

              assert.strictEqual(targetObserver.currentValue, newValue1, `targetObserver.currentValue #78`);
              assert.strictEqual(target[prop], newValue1, `target[prop] #79`);
            }
          }

          // - Arrange - Part 3
          const initialVal = target[prop];
          //massRestore(targetObserver);
          //massRestore(sut);
          //massRestore(expr);
          if (observer00) {
            //massRestore(observer00);
            //massSpy(observer00, 'setValue', 'getValue');
          }
          if (observer01) {
            //massRestore(observer01);
            //massSpy(observer01, 'setValue', 'getValue');
          }
          //massSpy(targetObserver, 'setValue', 'getValue', 'callSubscribers');
          //massSpy(sut, 'handleChange');
          //massSpy(expr, 'evaluate', 'assign');

          flags = LF.updateSourceExpression;

          // - Act - Part 3
          targetObserver.setValue(newValue2, flags);

          // - Assert - Part 3
          //assert.strictEqual(lifecycle.flushCount, 0, `lifecycle.flushCount #80`);

          // verify the behavior of the targetObserver (redundant)
          //expect(sut.handleChange, `sut.handleChange #81`).to.have.been.called;
          //expect(sut.handleChange, `sut.handleChange #82`).to.have.been.calledWithExactly(newValue2, initialVal, flags);

          //expect(expr.evaluate, `expr.evaluate #83`).to.have.been.called;
          //expect(expr.evaluate, `expr.evaluate #84`).to.have.been.calledWithExactly(flags, scope, container);

          // verify the behavior inside handleChange
          //expect(expr.assign, `expr.assign #85`).to.have.been.calledOnce;
          //expect(expr.assign, `expr.assign #86`).to.have.been.calledWithExactly(flags, scope, container, newValue2);

          // TODO: put in separate test / make a bit more thorough (this is quite rubbish but better than nothing)
          // - Arrange - Part 4
          //massRestore(targetObserver);
          //massRestore(sut, 'unobserve');
          //massRestore(expr);
          sut.$bind(flags, originalScope);

          verifyEqual(target[prop], srcVal);
          verifyEqual(targetObserver.currentValue, srcVal);
        });
      }
    );
  });

  describe('$unbind()', function () {
    it('should not unbind if it is not already bound', function () {
      const { sut } = setup();
      const scope: any = {};
      sut['$scope'] = scope;
      sut.$unbind(LF.fromUnbind);
      assert.strictEqual(sut['$scope'] === scope, true, `sut['$scope'] === scope`);
    });

    xit('should unbind if it is bound', function () {
      const { sut } = setup();
      const scope: any = {};
      sut['$scope'] = scope;
      sut.$state = State.isBound;
      sut['targetObserver'] = {} as any;
      const unobserveSpy = createSpy(sut, 'unobserve');
      const unbindSpy = dummySourceExpression.unbind = createSpy();
      (dummySourceExpression as any).$kind |= ExpressionKind.HasUnbind;
      sut.$unbind(LF.fromUnbind);
      assert.strictEqual(sut['$scope'], undefined, `sut['$scope']`);
      assert.strictEqual(sut['$state'] & State.isBound, 0, `sut['$state'] & State.isBound`);
      ////expect(unobserveSpy, `unobserveSpy`).to.have.been.calledWith(true);
      ////expect(unbindSpy, `unbindSpy`).to.have.been.calledWith(LF.fromUnbind, scope, sut);
    });
  });

  describe('addObserver()', function () {
    const countArr = [1, 5, 100];

    for (const count of countArr) {
      it(`adds ${count} observers`, function () {
        const { sut } = setup();
        let i = 0;
        while (i < count) {
          const observer = new MockObserver();
          sut.addObserver(observer);
          assert.strictEqual(sut[`_observer${i}`] === observer, true, `sut[\`_observer\${i}\`] === observer`);
          assert.strictEqual(sut[`_observerVersion${i}`] === 0, true, `sut[\`_observerVersion\${i}\`] === 0`);
          i++;
        }
      });

      it(`calls subscribe() on ${count} observers`, function () {
        const { sut } = setup();
        let i = 0;
        while (i < count) {
          const observer = new MockObserver();
          sut.addObserver(observer);
          assert.deepStrictEqual(
            observer.subscribe.calls,
            [
              [sut],
            ],
            `observer.subscribe.calls`,
          );
          i++;
        }
      });

      it(`does nothing when ${count} observers already exist`, function () {
        const { sut } = setup();
        let i = 0;
        while (i < count) {
          const observer = new MockObserver();
          sut.addObserver(observer);
          observer.subscribe.reset();
          i++;
        }
        i = 0;
        while (i < count) {
          const observer = sut[`_observer${i}`];
          sut.addObserver(observer);
          //expect(observer.subscribe).not.to.have.been.called;
          i++;
        }
      });

      it(`updates the version for ${count} observers`, function () {
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
          assert.strictEqual(sut[`_observerVersion${i}`] === version, true, `sut[\`_observerVersion\${i}\`] === version`);
          i++;
        }
      });

      it(`only updates the version for for added observers`, function () {
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
          i += 2;
        }
        i = 0;
        while (i < count) {
          assert.strictEqual(sut[`_observerVersion${i}`] === version, true, `sut[\`_observerVersion\${i}\`] === version`);
          assert.strictEqual(sut[`_observerVersion${i + 1}`] === version, false, `sut[\`_observerVersion\${i + 1}\`] === version`);
          i += 2;
        }
      });
    }
  });

  describe('observeProperty()', function () {

  });

  describe('unobserve()', function () {

  });

  // TODO: create proper unparser
  function unparse(expr: IExpression): string {
    return expr instanceof AccessScopeExpression
      ? `AccessScopeExpression{${expr.name} | ${expr.ancestor}}`
      : expr instanceof AccessMemberExpression
        ? `AccessMemberExpression{${unparse(expr.object)}.${expr.name}}`
        : expr instanceof PrimitiveLiteralExpression
          ? `Primitive{${expr.value}}`
          : expr.constructor.name;
  }
});

class MockObserver {
  public _subscriberFlags?: number;
  public _subscriber0?: ISubscriber;
  public _subscriber1?: ISubscriber;
  public _subscriber2?: ISubscriber;
  public _subscribersRest?: ISubscriber[];
  public callSubscribers: any;
  public hasSubscribers: IBindingTargetObserver['hasSubscribers'];
  public hasSubscriber: IBindingTargetObserver['hasSubscriber'];
  public removeSubscriber: IBindingTargetObserver['removeSubscriber'];
  public addSubscriber: IBindingTargetObserver['addSubscriber'];
  public bind = createSpy();
  public unbind = createSpy();
  public dispose = createSpy();
  public obj: any;
  public propertyKey?: string | number | symbol;
  public oldValue?: any;
  public previousValue?: any;
  public currentValue: any;
  public hasChanges?: boolean;
  public flush = createSpy();
  public getValue = createSpy();
  public setValue = createSpy();
  public subscribe = createSpy();
  public unsubscribe = createSpy();
}
