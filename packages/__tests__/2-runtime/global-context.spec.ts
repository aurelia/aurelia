import { AccessGlobalExpression, ExpressionType, IExpressionParser } from '@aurelia/runtime';
import { Aurelia, CustomElement } from '@aurelia/runtime-html';
import {
  assert, TestContext,
} from '@aurelia/testing';

const globalNames = [
  'Infinity',
  'NaN',

  'isFinite',
  'isNaN',
  'parseFloat',
  'parseInt',
  'decodeURI',
  'decodeURIComponent',
  'encodeURI',
  'encodeURIComponent',

  'Array',
  'BigInt',
  'Boolean',
  'Date',
  'Map',
  'Number',
  'Object',
  'RegExp',
  'Set',
  'String',

  'JSON',
  'Math',
  'Intl',
] as const;

const getParser = () => {
  const ctx = TestContext.create();
  const container = ctx.container;
  const parser = container.get(IExpressionParser);
  return parser;
};

const createFixture = () => {
  const ctx = TestContext.create();
  const au = new Aurelia(ctx.container);
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
      case 'isFinite':
      case 'isNaN':
      case 'parseFloat':
      case 'parseInt':
      case 'decodeURI':
      case 'decodeURIComponent':
      case 'encodeURI':
      case 'encodeURIComponent':
      case 'Array':
      case 'BigInt':
      case 'Boolean':
      case 'Date':
      case 'Map':
      case 'Number':
      case 'Object':
      case 'RegExp':
      case 'Set':
      case 'String':
      case 'JSON':
      case 'Math':
      case 'Intl':
        assert.strictEqual(pd.value, $globalThis[globalName]);
        assert.strictEqual(pd.enumerable, false, `enumerable should be false for ${globalName}`);
        assert.strictEqual(pd.writable, true, `writable should be true for ${globalName}`);
        assert.strictEqual(pd.configurable, true, `configurable should be true for ${globalName}`);
        assert.strictEqual(pd.get, void 0, `get should be undefined for ${globalName}`);
        assert.strictEqual(pd.set, void 0, `set should be undefined for ${globalName}`);
    }
  }

  for (const globalName of [
    'JSON',
    'Math',
    'Intl',
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
  describe('yields AccessGlobalExpression for global intrinsic names', function () {
    for (const name of globalNames) {
      it(`verify ${name}`, function () {
        const parser = getParser();
        assert.deepStrictEqual(parser.parse(name, ExpressionType.None), new AccessGlobalExpression(name), name);
      });
    }
  });

  describe('evaluation of global expressions - ensure parameters are reactive but the globals+properties are not observed', function () {
    it('Math.max', async function () {
      const { au, host, ctx } = createFixture();
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
      const { au, host, ctx } = createFixture();
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

    it('instanceof Object', async function () {
      const { au, host, ctx } = createFixture();
      const App = CustomElement.define({ name: 'app', template: '${value instanceof Object ? "object" : "something else"}' }, class {
        value: any = {};
      });
      const component = new App();
      au.app({ host, component });
      await au.start();

      assert.visibleTextEqual(host, 'object', 'initial evaluation');
      component.value = null;
      ctx.platform.domWriteQueue.flush();
      assert.visibleTextEqual(host, 'something else', 'evaluation after update');

      await au.stop();
      ensureGlobalsAreUntouched(ctx.wnd.globalThis);
    });

    it('isNaN', async function () {
      const { au, host, ctx } = createFixture();
      const App = CustomElement.define({ name: 'app', template: '${isNaN(value === 0 ? NaN : value) ? "its NaN" : value' }, class {
        value: any = 0;
      });
      const component = new App();
      au.app({ host, component });
      await au.start();

      assert.visibleTextEqual(host, 'its NaN', 'initial evaluation');
      component.value = 1;
      ctx.platform.domWriteQueue.flush();
      assert.visibleTextEqual(host, '1', 'evaluation after update');

      await au.stop();
      ensureGlobalsAreUntouched(ctx.wnd.globalThis);
    });

    it('isFinite', async function () {
      const { au, host, ctx } = createFixture();
      const App = CustomElement.define({ name: 'app', template: '${isFinite(value === 0 ? Infinity : value) ? "finite" : "infinite"' }, class {
        value: any = 0;
      });
      const component = new App();
      au.app({ host, component });
      await au.start();

      assert.visibleTextEqual(host, 'infinite', 'initial evaluation');
      component.value = 1;
      ctx.platform.domWriteQueue.flush();
      assert.visibleTextEqual(host, 'finite', 'evaluation after update');

      await au.stop();
      ensureGlobalsAreUntouched(ctx.wnd.globalThis);
    });
  });
});
