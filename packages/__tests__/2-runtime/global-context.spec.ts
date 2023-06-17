import { AccessScopeExpression, AccessGlobalExpression, ExpressionType, IExpressionParser, registerGlobalContext, getGlobalContext } from '@aurelia/runtime';
import { Aurelia, CustomElement } from '@aurelia/runtime-html';
import {
  assert, TestContext,
} from '@aurelia/testing';

const globalNames = [
  // https://262.ecma-international.org/#sec-value-properties-of-the-global-object
  'globalThis',
  'Infinity',
  'NaN',

  // https://262.ecma-international.org/#sec-function-properties-of-the-global-object
  'isFinite',
  'isNaN',
  'parseFloat',
  'parseInt',
  'decodeURI',
  'decodeURIComponent',
  'encodeURI',
  'encodeURIComponent',

  // https://262.ecma-international.org/#sec-constructor-properties-of-the-global-object
  'AggregateError',
  'Array',
  'ArrayBuffer',
  'BigInt',
  'BigInt64Array',
  'BigUint64Array',
  'Boolean',
  'DataView',
  'Date',
  'Error',
  'EvalError',
  'FinalizationRegistry',
  'Float32Array',
  'Float64Array',
  'Function',
  'Int8Array',
  'Int16Array',
  'Int32Array',
  'Map',
  'Number',
  'Object',
  'Promise',
  'Proxy',
  'RangeError',
  'ReferenceError',
  'RegExp',
  'Set',
  'String',
  'Symbol',
  'SyntaxError',
  'TypeError',
  'Uint8Array',
  'Uint8ClampedArray',
  'Uint16Array',
  'Uint32Array',
  'URIError',
  'WeakMap',
  'WeakRef',
  'WeakSet',

  // https://262.ecma-international.org/#sec-other-properties-of-the-global-object
  'Atomics',
  'JSON',
  'Math',
  'Reflect',
] as const;

const getParser = (useGlobals: boolean) => {
  const ctx = TestContext.create();
  const container = ctx.container;
  if (useGlobals) {
    registerGlobalContext(container);
  }
  const parser = container.get(IExpressionParser);
  return parser;
};

const createFixture = (useGlobals: boolean) => {
  const ctx = TestContext.create();
  const au = new Aurelia(ctx.container);
  if (useGlobals) {
    au.useGlobals();
  }
  const host = ctx.createElement("div");
  return { au, host, ctx };
};

const ensureGlobalsAreUntouched = ($globalThis: typeof globalThis) => {
  for (const globalName of globalNames) {
    const pd = Object.getOwnPropertyDescriptor($globalThis, globalName);
    switch (globalName) {
      // https://262.ecma-international.org/#sec-value-properties-of-the-global-object
      case 'Infinity':
      case 'NaN':
        assert.strictEqual(pd.value, $globalThis[globalName]);
        assert.strictEqual(pd.enumerable, false, `enumerable should be false for ${globalName}`);
        assert.strictEqual(pd.writable, false, `writable should be false for ${globalName}`);
        assert.strictEqual(pd.configurable, false, `configurable should be false for ${globalName}`);
        assert.strictEqual(pd.get, void 0, `get should be undefined for ${globalName}`);
        assert.strictEqual(pd.set, void 0, `set should be undefined for ${globalName}`);
        break;
      case 'globalThis':
      case 'isFinite':
      case 'isNaN':
      case 'parseFloat':
      case 'parseInt':
      case 'decodeURI':
      case 'decodeURIComponent':
      case 'encodeURI':
      case 'encodeURIComponent':
      case 'AggregateError':
      case 'Array':
      case 'ArrayBuffer':
      case 'BigInt':
      case 'BigInt64Array':
      case 'BigUint64Array':
      case 'Boolean':
      case 'DataView':
      case 'Date':
      case 'Error':
      case 'EvalError':
      case 'FinalizationRegistry':
      case 'Float32Array':
      case 'Float64Array':
      case 'Function':
      case 'Int8Array':
      case 'Int16Array':
      case 'Int32Array':
      case 'Map':
      case 'Number':
      case 'Object':
      case 'Promise':
      case 'Proxy':
      case 'RangeError':
      case 'ReferenceError':
      case 'RegExp':
      case 'Set':
      case 'String':
      case 'Symbol':
      case 'SyntaxError':
      case 'TypeError':
      case 'Uint8Array':
      case 'Uint8ClampedArray':
      case 'Uint16Array':
      case 'Uint32Array':
      case 'URIError':
      case 'WeakMap':
      case 'WeakRef':
      case 'WeakSet':
      case 'Atomics':
      case 'JSON':
      case 'Math':
      case 'Reflect':
        assert.strictEqual(pd.value, $globalThis[globalName]);
        assert.strictEqual(pd.enumerable, false, `enumerable should be false for ${globalName}`);
        assert.strictEqual(pd.writable, true, `writable should be true for ${globalName}`);
        assert.strictEqual(pd.configurable, true, `configurable should be true for ${globalName}`);
        assert.strictEqual(pd.get, void 0, `get should be undefined for ${globalName}`);
        assert.strictEqual(pd.set, void 0, `set should be undefined for ${globalName}`);
    }
  }

  for (const globalName of [
    'Atomics',
    'JSON',
    'Math',
    // exclude Reflect because Aurelia does some stuff to it
  ]) {
    const pds = Object.getOwnPropertyDescriptors($globalThis[globalName]);
    for (const key in pds) {
      const pd = pds[key];
      assert.strictEqual(pd.value, $globalThis[globalName][key], `value should match global ${globalName}.${key}`);
      assert.strictEqual(pd.enumerable, false, `enumerable should be false for ${globalName}.${key}`);
      assert.strictEqual(pd.writable, typeof pd.value === 'function', `writable should be true for ${globalName}.${key}`);
      assert.strictEqual(pd.configurable, typeof pd.value === 'function', `configurable should be true for ${globalName}.${key}`);
      assert.strictEqual(pd.get, void 0, `get should be undefined for ${globalName}.${key}`);
      assert.strictEqual(pd.set, void 0, `set should be undefined for ${globalName}.${key}`);
    }
  }
};

describe('2-runtime/global-context.spec.ts', function () {
  it('getGlobalContext returns undefined if registerGlobalContext was not called', function () {
    const ctx = TestContext.create();
    const globalContext = getGlobalContext(ctx.container);
    assert.strictEqual(globalContext, void 0, `globalContext`);
  });

  it('getGlobalContext returns a frozen object with only specific properties if registerGlobalContext was called', function () {
    const ctx = TestContext.create();
    registerGlobalContext(ctx.container);
    const globalContext = getGlobalContext(ctx.container);
    assert.strictEqual(Object.isFrozen(globalContext), true, `globalContext should be frozen`);
    assert.deepStrictEqual(Object.keys(globalContext), globalNames, `globalContext should contain only specific properties`);
    for (const key of globalNames) {
      assert.strictEqual(globalContext[key], ctx.wnd.globalThis[key], `globalContext.${key} should be the same value as the globalThis value`);
    }
  });

  describe('yields AccessScopeExpression for global intrinsic names when IGlobalContext is not registered', function () {
    for (const name of globalNames) {
      it(`verify ${name}`, function () {
        const parser = getParser(false);
        assert.deepStrictEqual(parser.parse(name, ExpressionType.None), new AccessScopeExpression(name), name);
      });
    }
  });
  describe('yields AccessGlobalExpression for global intrinsic names when IGlobalContext is registered', function () {
    for (const name of globalNames) {
      it(`verify ${name}`, function () {
        const parser = getParser(true);
        assert.deepStrictEqual(parser.parse(name, ExpressionType.None), new AccessGlobalExpression(name), name);
      });
    }
  });

  describe('evaluation of global expressions - ensure parameters are reactive but the globals+properties are not observed', function () {
    it('Math.max', async function () {
      const { au, host, ctx } = createFixture(true);
      const App = CustomElement.define({ name: 'app', template: '${num1},${num2},${Math.max(num1, num2)}' }, class {
        num1 = 1;
        num2 = 2;
      });
      const component = new App();
      au.app({ host, component });
      await au.start();

      assert.visibleTextEqual(host, '1,2,2', 'initial evaluation');
      component.num1 = 3;
      ctx.platform.domWriteQueue.flush();
      assert.visibleTextEqual(host, '3,2,3', 'evaluation after update');

      await au.stop();
      ensureGlobalsAreUntouched(ctx.wnd.globalThis);
    });

    it('Object.prototype.toString.call', async function () {
      const { au, host, ctx } = createFixture(true);
      const App = CustomElement.define({ name: 'app', template: '${Object.prototype.toString.call(value)}' }, class {
        value: any = 0;
      });
      const component = new App();
      au.app({ host, component });
      await au.start();

      assert.visibleTextEqual(host, '[object Number]', 'initial evaluation');
      component.value = '0';
      ctx.platform.domWriteQueue.flush();
      assert.visibleTextEqual(host, '[object String]', 'evaluation after update');

      await au.stop();
      ensureGlobalsAreUntouched(ctx.wnd.globalThis);
    });
  });
});
