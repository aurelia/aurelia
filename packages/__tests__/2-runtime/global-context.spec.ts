import { AccessGlobalExpression, ExpressionType, IExpressionParser } from '@aurelia/runtime';
import { BindingBehavior, ValueConverter } from '@aurelia/runtime-html';
import { assert, createFixture, TestContext } from '@aurelia/testing';

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
    it('Math.max', function () {
      const { ctx, component, assertText, flush, stop } = createFixture(
        '${num1},${num2},${Math.max(num1, num2)}',
        class { num1 = 1; num2 = 2; }
      );

      assertText('1,2,2');
      component.num1 = 3;
      flush();
      assertText('3,2,3');

      void stop(true);
      ensureGlobalsAreUntouched(ctx.wnd.globalThis);
    });

    it('throws on trying to call a global that is not a function', function () {
      assert.throws(() => {
        createFixture('${JSON()}');
      });
    });

    it('Object.prototype.toString.call', function () {
      const { ctx, component, assertText, flush, stop } = createFixture(
        '${Object.prototype.toString.call(value)}',
        class { value: any = 0; }
      );

      assertText('[object Number]');
      component.value = '0';
      flush();
      assertText('[object String]');

      void stop(true);
      ensureGlobalsAreUntouched(ctx.wnd.globalThis);
    });

    it('instanceof Object', function () {
      const { ctx, component, assertText, flush, stop } = createFixture(
        '${value instanceof Object ? "object" : "something else"}',
        class { value: any = {}; }
      );

      assertText('object');
      component.value = null;
      flush();
      assertText('something else');

      void stop(true);
      ensureGlobalsAreUntouched(ctx.wnd.globalThis);
    });

    it('isNaN', function () {
      const { ctx, component, assertText, flush, stop } = createFixture(
        '${isNaN(value === 0 ? NaN : value) ? "its NaN" : value',
        class { value: any = 0; }
      );

      assertText('its NaN');
      component.value = 1;
      flush();
      assertText('1');

      void stop(true);
      ensureGlobalsAreUntouched(ctx.wnd.globalThis);
    });

    it('isFinite', async function () {
      const { ctx, component, assertText, flush, stop } = createFixture(
        '${isFinite(value === 0 ? Infinity : value) ? "finite" : "infinite"',
        class { value: any = 0; }
      );

      assertText('infinite');
      component.value = 1;
      flush();
      assertText('finite');

      void stop(true);
      ensureGlobalsAreUntouched(ctx.wnd.globalThis);
    });

    it('allows import value converter', function () {
      const { assertText } = createFixture('${a | import}', class { a = 1; }, [
        ValueConverter.define('import', class { toView = (a: any) => a; })
      ]);

      assertText('1');
    });

    it('allows import binding behavior', function () {
      const { assertText } = createFixture('${a & import}', class { a = 1; }, [
        BindingBehavior.define('import', class {  })
      ]);

      assertText('1');
    });
  });
});
