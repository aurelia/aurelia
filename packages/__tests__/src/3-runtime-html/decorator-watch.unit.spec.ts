import { DI } from '@aurelia/kernel';
import { AccessMemberExpression, AccessScopeExpression } from '@aurelia/expression-parser';
import { astEvaluate, ComputedWatcher, ExpressionWatcher } from '@aurelia/runtime-html';
import { assert, createObserverLocator, createScopeForTest } from '@aurelia/testing';

describe('3-runtime-html/decorator-watch.unit.spec.ts', function () {
  describe('ComputedWatcher', function () {
    it('works', function () {
      let getCallCount = 0;
      const callbackValues = [];
      const container = DI.createContainer();
      const observerLocator = createObserverLocator(container);
      const obj: any = {};
      const watcher = new ComputedWatcher(
        obj,
        observerLocator,
        o => {
          getCallCount++;
          return (o as any)['prop'];
        },
        (newValue) => {
          callbackValues.push(newValue);
        },
        true,
      );

      watcher.bind();
      assert.strictEqual(watcher['value'], undefined);
      assert.strictEqual(getCallCount, 1);
      assert.deepStrictEqual(callbackValues, []);

      obj.prop = 1;
      assert.strictEqual(watcher['value'], 1);
      assert.strictEqual(getCallCount, 2);
      assert.deepStrictEqual(callbackValues, [1]);

      obj.prop = 2;
      assert.strictEqual(watcher['value'], 2);
      assert.strictEqual(getCallCount, 3);
      assert.deepStrictEqual(callbackValues, [1, 2]);

      watcher._mixed = false;
      obj.prop = 3;
      assert.strictEqual(watcher['value'], 2);
      assert.strictEqual(getCallCount, 3);
      assert.deepStrictEqual(callbackValues, [1, 2]);
    });

    it('observes collection/collection length', function () {
      let getCallCount = 0;
      const callbackValues = [];
      const container = DI.createContainer();
      const observerLocator = createObserverLocator(container);
      const obj: any = {};
      const watcher = new ComputedWatcher(
        obj,
        observerLocator,
        o => {
          getCallCount++;
          return o;
        },
        (newValue) => {
          callbackValues.push(newValue);
        },
        true,
      );
      const arr = [];
      watcher._mixed = true;
      watcher.observeCollection(arr);
      arr.push(1);

      assert.strictEqual(getCallCount, 1);
      assert.deepStrictEqual(callbackValues, [obj]);

      // collection observation dropped last run
      arr.push(2);
      assert.strictEqual(getCallCount, 1);
      assert.deepStrictEqual(callbackValues, [obj]);

      // start again
      watcher.observe(arr, 'length');
      arr.push(3);
      assert.strictEqual(getCallCount, 2);
      // returning te same value, callback won't be call
      assert.deepStrictEqual(callbackValues, [obj]);
    });

    it('works with manual observation without proxy', function () {
      let getCallCount = 0;
      const callbackValues = [];
      const container = DI.createContainer();
      const observerLocator = createObserverLocator(container);
      const obj: any = {};
      const watcher = new ComputedWatcher(
        obj,
        observerLocator,
        (o: any, w) => {
          getCallCount++;
          w.observe(o, '_p');
          return o.prop;
        },
        (newValue) => {
          callbackValues.push(newValue);
        },
        false,
      );

      watcher.bind();
      assert.strictEqual(watcher['value'], undefined);
      assert.strictEqual(getCallCount, 1);
      assert.deepStrictEqual(callbackValues, []);

      obj.prop = 1;
      assert.strictEqual(watcher['value'], undefined);
      assert.strictEqual(getCallCount, 1);
      assert.deepStrictEqual(callbackValues, []);

      obj._p = 1;
      assert.strictEqual(watcher['value'], 1);
      assert.strictEqual(getCallCount, 2);
      assert.deepStrictEqual(callbackValues, [1]);
    });
  });

  describe('ExpressionWatcher', function () {
    it('observers', function () {
      let evaluateCallCount = 0;
      const callbackValues = [];
      const container = DI.createContainer();
      const observerLocator = createObserverLocator(container);
      const obj: any = { a: {} };
      const expr = new class AccessWrapExpression {
        $kind = 'Custom';
        constructor(
          private readonly ast = new AccessMemberExpression(
            new AccessScopeExpression('a'),
            'prop'
          )
        ) {}

        evaluate(...args: unknown[]) {
          evaluateCallCount++;
          assert.strictEqual(args[2], watcher);
          return astEvaluate.call(undefined, this.ast, ...args);
        }
      }();
      const watcher = new ExpressionWatcher(
        createScopeForTest(obj),
        container,
        observerLocator,
        expr as any,
        newValue => {
          callbackValues.push(newValue);
        }
      );
      // Object.defineProperty(expr, '$kind', { value: 'Custom' });
      // (expr as any).evaluate = function (...args: unknown[]) {
      //   evaluateCallCount++;
      //   assert.strictEqual(args[2], watcher);
      //   return (astEvaluate as any).call(undefined, this, ...args);
      // };

      obj.a.prop = 1;
      assert.strictEqual(evaluateCallCount, 0);
      assert.strictEqual(watcher['value'], void 0);
      assert.deepStrictEqual(callbackValues, []);

      watcher.bind();
      assert.strictEqual(evaluateCallCount, 1);
      assert.strictEqual(watcher['value'], 1);
      assert.deepStrictEqual(callbackValues, []);

      obj.a.prop = 2;
      assert.strictEqual(evaluateCallCount, 2);
      assert.strictEqual(watcher['value'], 2);
      assert.deepStrictEqual(callbackValues, [2]);

      watcher.unbind();
      assert.strictEqual(evaluateCallCount, 2);
      assert.strictEqual(watcher['value'], void 0);
      assert.deepStrictEqual(callbackValues, [2]);

      obj.a.prop = 3;
      assert.strictEqual(evaluateCallCount, 2);
      assert.strictEqual(watcher['value'], void 0);
      assert.deepStrictEqual(callbackValues, [2]);
    });
  });

});
