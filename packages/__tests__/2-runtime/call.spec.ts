import {
  AccessScopeExpression,
  BindingBehaviorExpression,
  CallScopeExpression,
  IsBindingBehavior,
  Scope,
  SetterObserver
} from '@aurelia/runtime';
import {
  CallBinding,
} from '@aurelia/runtime-html';
import {
  createObserverLocator,
  createScopeForTest,
  eachCartesianJoinFactory,
  assert,
  createContainer
} from '@aurelia/testing';

// eslint-disable-next-line mocha/no-skipped-tests
describe.skip('CallBinding', function () {
  function createFixture(ast: IsBindingBehavior, target: any, targetProperty: string) {
    const container = createContainer(); // Note: used to be RuntimeConfiguration.createContainer, needs deps
    const observerLocator = createObserverLocator(container);
    const sut = new CallBinding(
      container,
      observerLocator,
      ast as any,
      target,
      targetProperty,
    );

    return { sut, container, observerLocator };
  }

  describe('$bind -> $bind', function () {

    const targetVariations: (() => [{foo?: string}, string])[] = [
      () => [({}), `{}`],
      () => [({ fooz: () => { return; } }), `fooz:()=>{}`]
    ];

    const propVariations: (() => [string, string])[] = [
      () => ['fooz', `'fooz' `],
      () => ['barz', `'barz' `]
    ];

    const exprVariations: (() => [IsBindingBehavior, string])[] = [
      () => [new CallScopeExpression('theFunc', []),          `theFunc()`],
      () => [new BindingBehaviorExpression(new CallScopeExpression('theFunc', []), 'debounce', []),          `theFunc()`]
    ];

    const scopeVariations: (() => [Scope, string])[] = [
      () => [createScopeForTest({theFunc: () => { return; }}),       `{theFunc:()=>{}}       `]
    ];

    const renewScopeVariations: (() => [boolean, string])[] = [
      () => [true,       `true`],
      () => [false,       `false`]
    ];

    const inputs: [typeof targetVariations, typeof propVariations, typeof exprVariations, typeof scopeVariations, typeof renewScopeVariations]
       = [targetVariations, propVariations, exprVariations, scopeVariations, renewScopeVariations];

    eachCartesianJoinFactory(inputs, ([target, $1], [prop, $2], [expr, $3], [scope, $4], [renewScope, $5]) => {
      it(`$bind() target=${$1} prop=${$2} expr=${$3} scope=${$4} renewScope=${$5}`, function () {
        // - Arrange -
        const { sut, observerLocator } = createFixture(expr, target, prop);
        const targetObserver = observerLocator.getObserver(target, prop);

        // massSpy(scope.bindingContext, 'theFunc');
        // massSpy(sut, 'callSource');
        // massSpy(targetObserver, 'setValue', 'getValue');
        // massSpy(expr, 'evaluate', 'assign', 'connect');
        // expr['bind'] = spy();
        // expr['unbind'] = spy();

        // - Act -
        sut.$bind(scope);

        // - Assert -
        // double check we have the correct target observer
        assert.strictEqual(sut.targetObserver, targetObserver, `sut.targetObserver`);
        assert.instanceOf(sut.targetObserver, SetterObserver, `sut.targetObserver`);

        // expect(expr.bind).to.have.been.calledOnce;
        // assert.deepStrictEqual(
        //   expr.bind.calls,
        //   [
        //     [flags, scope, sut],
        //   ],
        //   `expr.bind`,
        // );

        // expect(targetObserver.setValue).to.have.been.calledOnce;
        // assert.strictEqual(lifecycle.flushCount, 0, `lifecycle.flushCount`);

        if (renewScope) {
          scope = { ...scope };
        }

        // - Arrange -
        // massReset(scope.bindingContext);
        // massReset(sut);
        // massReset(targetObserver);
        // massReset(expr);

        // - Act -
        sut.$bind(scope);

        // - Assert -
        assert.instanceOf(sut.targetObserver, SetterObserver, `sut.targetObserver`);
        assert.strictEqual(sut.targetObserver, targetObserver, `sut.targetObserver`);
        if (renewScope) {
          // called during $bind, then during $unbind, then during $bind again
          // expect(targetObserver.setValue).to.have.been.calledThrice;

          // expect(expr.unbind).to.have.been.calledOnce;
          // expect(expr.bind).to.have.been.calledOnce;
          // assert.deepStrictEqual(
          //   expr.bind.calls,
          //   [
          //     [flags, scope, sut],
          //   ],
          //   `expr.bind`,
          // );
        }

        // assert.strictEqual(lifecycle.flushCount, 0, `lifecycle.flushCount`);
      });
    }
    );
  });

  describe('$bind -> $unbind -> $unbind', function () {

    const targetVariations: (() => [{foo?: string}, string])[] = [
      () => [({}), `{}`],
      () => [({ fooz: () => { return; } }), `fooz:()=>{}`]
    ];

    const propVariations: (() => [string, string])[] = [
      () => ['fooz', `'fooz' `],
      () => ['barz', `'barz' `]
    ];

    const exprVariations: (() => [IsBindingBehavior, string])[] = [
      () => [new CallScopeExpression('theFunc', []),          `theFunc()`],
      () => [new BindingBehaviorExpression(new CallScopeExpression('theFunc', []), 'debounce', []),          `theFunc()`]
    ];

    const scopeVariations: (() => [Scope, string])[] = [
      () => [createScopeForTest({theFunc: () => { return; }}),       `{theFunc:()=>{}}       `]
    ];

    const inputs: [typeof targetVariations, typeof propVariations, typeof exprVariations, typeof scopeVariations]
       = [targetVariations, propVariations, exprVariations, scopeVariations];

    eachCartesianJoinFactory(inputs, ([target, $1], [prop, $2], [expr, $3], [scope, $4]) => {
      it(`$bind() target=${$1} prop=${$2} expr=${$3} scope=${$4}`, function () {
        // - Arrange -
        const { sut, observerLocator } = createFixture(expr, target, prop);
        const targetObserver = observerLocator.getObserver(target, prop);

        // massSpy(scope.bindingContext, 'theFunc');
        // massSpy(sut, 'callSource');
        // massSpy(targetObserver, 'setValue', 'getValue');
        // massSpy(expr, 'evaluate', 'assign', 'connect');
        // expr['bind'] = spy();
        // expr['unbind'] = spy();

        // - Act -
        sut.$bind(scope);

        // - Assert -
        // double check we have the correct target observer
        assert.strictEqual(sut.targetObserver, targetObserver, `sut.targetObserver`);
        assert.instanceOf(sut.targetObserver, SetterObserver, `sut.targetObserver`);

        // expect(expr.bind).to.have.been.calledOnce;
        // assert.deepStrictEqual(
        //   expr.bind.calls,
        //   [
        //     [flags, scope, sut],
        //   ],
        //   `expr.bind`,
        // );

        // expect(targetObserver.setValue).to.have.been.calledOnce;
        // assert.strictEqual(lifecycle.flushCount, 0, `lifecycle.flushCount`);

        // - Arrange -
        // massReset(scope.bindingContext);
        // massReset(sut);
        // massReset(targetObserver);
        // massReset(expr);

        // - Act -
        sut.$unbind();

        // - Assert -
        assert.instanceOf(sut.targetObserver, SetterObserver, `sut.targetObserver`);
        assert.strictEqual(sut.targetObserver, targetObserver, `sut.targetObserver`);

        // expect(expr.unbind).to.have.been.calledOnce;
        assert.strictEqual(target[prop], null, `target[prop]`);

        // assert.strictEqual(lifecycle.flushCount, 0, `lifecycle.flushCount`);

        // - Arrange -
        // massReset(scope.bindingContext);
        // massReset(sut);
        // massReset(targetObserver);
        // massReset(expr);

        // - Act -
        sut.$unbind();

        // - Assert -
        assert.instanceOf(sut.targetObserver, SetterObserver, `sut.targetObserver`);
        assert.strictEqual(sut.targetObserver, targetObserver, `sut.targetObserver`);

        // assert.strictEqual(lifecycle.flushCount, 0, `lifecycle.flushCount`);
        // expect(expr.unbind).not.to.have.been.called;
      });
    }
    );
  });

  describe('$bind -> call -> $unbind', function () {

    const targetVariations: (() => [{foo?: string}, string])[] = [
      () => [({}), `{}`],
      () => [({ fooz: () => { return; } }), `fooz:()=>{}`]
    ];

    const propVariations: (() => [string, string])[] = [
      () => ['fooz', `'fooz' `],
      () => ['barz', `'barz' `]
    ];

    const argsVariations: (() => [{}, string])[] = [
      () => [{ arg1: 'asdf' }, `{} `],
      () => [{ arg2: 42 }, `{} `],
      () => [{ arg3: null }, `{} `],
      () => [{ arg3: ';lkasdf', arg1: {}, arg2: 42  }, `{} `]
    ];

    const exprVariations: (() => [IsBindingBehavior, string])[] = [
      () => [new CallScopeExpression('theFunc', []),          `theFunc()`],
      () => [new CallScopeExpression('theFunc', [new AccessScopeExpression('arg1'), new AccessScopeExpression('arg2'), new AccessScopeExpression('arg3')]), `theFunc(arg1, arg2, arg3)`]
    ];

    const scopeVariations: (() => [Scope, string])[] = [
      () => [createScopeForTest({theFunc: () => { return; }}),       `{theFunc:()=>{}}       `]
    ];

    const inputs: [typeof targetVariations, typeof propVariations, typeof argsVariations, typeof exprVariations, typeof scopeVariations]
       = [targetVariations, propVariations, argsVariations, exprVariations, scopeVariations];

    eachCartesianJoinFactory(inputs, ([target, $1], [prop, $2], [args, $3], [expr, $4], [scope, $5]) => {
      it(`$bind() target=${$1} prop=${$2} args=${$3} expr=${$4} scope=${$5}`, function () {
        // - Arrange -
        const { sut, observerLocator } = createFixture(expr, target, prop);
        const targetObserver = observerLocator.getObserver(target, prop);

        // massSpy(scope.bindingContext, 'theFunc');
        // massSpy(sut, 'callSource');
        // massSpy(targetObserver, 'setValue', 'getValue');
        // massSpy(expr, 'evaluate', 'assign', 'connect');

        // - Act -
        sut.$bind(scope);

        // - Assert -
        // double check we have the correct target observer
        assert.strictEqual(sut.targetObserver, targetObserver, `sut.targetObserver`);
        assert.instanceOf(sut.targetObserver, SetterObserver, `sut.targetObserver`);

        // expect(targetObserver.setValue).to.have.been.calledOnce;
        // assert.strictEqual(lifecycle.flushCount, 0, `lifecycle.flushCount`);

        // - Arrange -
        // massReset(scope.bindingContext);
        // massReset(sut);
        // massReset(targetObserver);
        // massReset(expr);
        // massSpy(target, prop);

        // - Act -
        target[prop](args);

        // - Assert -
        // assert.deepStrictEqual((sut.callSource as SinonSpy).getCalls()[0].args[0], args, `(sut.callSource as SinonSpy).getCalls()[0].args[0]`);
        // expect(expr.evaluate).to.have.been.calledOnce;
        // expect(target[prop]).to.have.been.calledOnce;
        if (expr['args'].length === 3) {
          // expect(scope.bindingContext['theFunc']).to.have.been.calledWithExactly(args[expr['args'][0].name], args[expr['args'][1].name], args[expr['args'][2].name]);
        } else {
          // expect(scope.bindingContext['theFunc']).to.have.been.calledWithExactly();
        }

        // - Arrange -
        // massRestore(scope.bindingContext);
        // massRestore(sut);
        // massRestore(targetObserver);
        // massRestore(expr);

        // - Act -
        sut.$unbind();

        // - Assert -
        assert.strictEqual(target[prop], null, `target[prop]`);
      });
    }
    );
  });
});
