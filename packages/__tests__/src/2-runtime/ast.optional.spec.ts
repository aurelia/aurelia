import { Constructable } from '@aurelia/kernel';
import { ExpressionParser, Unparser, createAccessScopeExpression, createCallScopeExpression } from '@aurelia/expression-parser';
import { Scope, astEvaluate, computed, tasksSettled } from '@aurelia/runtime';
import { customElement, IPlatform } from '@aurelia/runtime-html';
import { assert, createFixture } from '@aurelia/testing';

describe('2-runtime/ast.optional.spec.ts', function () {

  for (const mode of ['auto', 'scoped']) {
    it(`uses the local fallback when a composed view has no parent scope (${mode})`, async function () {
      class Details {
        public title = 'local';
        @computed('title')
        public format() { return `[${this.title}]`; }
      }
      const { assertText, component, tearDown } = await createFixture(
        '<au-compose template.bind="view" component.bind="details" scope-behavior.bind="mode"></au-compose>',
        class {
          public mode = mode;
          public title = 'outer';
          public details = new Details();
          public view = '<span>${$parent?.title ?? title}</span><strong>${$parent?.format() ?? format()}</strong>';
          @computed('title')
          public format() { return `[${this.title}]`; }
        },
      ).started;
      try {
        assertText(mode === 'auto' ? 'outer[outer]' : 'local[local]');
        component.title = 'updated outer';
        component.details.title = 'updated local';
        await tasksSettled();
        assertText(mode === 'auto' ? 'updated outer[updated outer]' : 'updated local[updated local]');
      } finally {
        await tearDown();
      }
    });
  }

  describe('optional named scope lookup', function () {
    const parser = new ExpressionParser();
    const parse = (text: string) => parser.parse(text, 'IsProperty');

    it('uses the local fallback in a strict root template', async function () {
      const { assertText, component, tearDown } = createFixture
        .html('${$parent?.label ?? label}')
        .component({ label: 'local' }, { strict: true })
        .build();
      try {
        assertText('local');
        component.label = 'updated';
        await tasksSettled();
        assertText('updated');
      } finally {
        await tearDown();
      }
    });

    // Named `$parent` access selects an exact scope and includes its override context.
    // A normal AccessMember(AccessThis) replacement would silently lose repeat and let locals.
    it('retains parent repeat metadata as rows are reordered', async function () {
      const { assertText, component, tearDown } = createFixture(
        '<div repeat.for="group of groups"><span repeat.for="value of group">${$parent?.$index}:${$index}:${value};</span></div>',
        { groups: [['a', 'b'], ['c']] },
      );
      try {
        assertText('0:0:a;0:1:b;1:0:c;');
        component.groups.reverse();
        await tasksSettled();
        assertText('0:0:c;1:0:a;1:1:b;');
      } finally {
        await tearDown();
      }
    });

    const ancestorCases = [
      { text: '$parent.$parent.label', guard: void 0 },
      { text: '$parent?.$parent.label', guard: 1 },
      { text: '$parent.$parent?.label', guard: 2 },
      { text: '$parent?.$parent?.label', guard: 2 },
      { text: '($parent?.$parent).label', guard: void 0 },
    ];
    for (const { text, guard } of ancestorCases) {
      it(`retains the effective guard and round-trips ${text}`, function () {
        const expression = parse(text);
        assert.deepStrictEqual(expression, createAccessScopeExpression('label', 2, guard));
        assert.deepStrictEqual(parse(Unparser.unparse(expression)), expression);
      });
      for (const strict of [false, true]) {
        for (const depth of [0, 1, 2]) {
          it(`evaluates ${text} with ${depth} ancestors (strict=${strict})`, function () {
            let scope = Scope.create({ label: 'target' });
            for (let i = 0; i < depth; ++i) {
              scope = Scope.fromParent(scope, {});
            }
            const evaluate = () => astEvaluate(parse(text), scope, { strict }, null);
            if (strict && depth < 2 && (guard === void 0 || guard <= depth)) {
              assert.throws(evaluate, /AUR0114/);
            } else {
              assert.strictEqual(evaluate(), depth === 2 ? 'target' : void 0);
            }
          });
        }
      }
    }

    it('preserves ordinary AST shapes and optional current-scope access', function () {
      assert.deepStrictEqual(parse('label'), { $kind: 'AccessScope', name: 'label', ancestor: 0 });
      assert.deepStrictEqual(parse('run()'), { $kind: 'CallScope', name: 'run', ancestor: 0, args: [], optional: false });
      for (const [text, implicit] of [
        ['$this?.label', 'label'],
        ['$this?.run()', 'run()'],
        ['$this?.run?.()', 'run?.()'],
      ]) {
        const expression = parse(text);
        assert.deepStrictEqual(expression, parse(implicit));
        assert.deepStrictEqual(parse(Unparser.unparse(expression)), expression);
      }
    });

    it('uses forgiving scope access when no evaluator is supplied', function () {
      const scope = Scope.create({});
      for (const text of ['$parent.label', '$parent?.label', '$parent?.run()']) {
        assert.strictEqual(astEvaluate(parse(text), scope, null, null), void 0);
      }
    });

    it('selects the exact ancestor and preserves override-context precedence across boundaries', function () {
      const outer = Scope.create({ label: 'outer' });
      const boundary = Scope.create({ label: 'component' }, { label: 'local' }, true);
      boundary.parent = outer;
      const scope = Scope.fromParent(boundary, {});
      assert.strictEqual(astEvaluate(parse('$parent?.label'), scope, { strict: true }, null), 'local');
      delete boundary.overrideContext.label;
      assert.strictEqual(astEvaluate(parse('$parent?.label'), scope, { strict: true }, null), 'component');
      delete boundary.bindingContext.label;
      assert.strictEqual(astEvaluate(parse('$parent?.label'), scope, { strict: true }, null), void 0);
      assert.strictEqual(astEvaluate(parse('$this?.label'), scope, { strict: true }, null), void 0);
      assert.strictEqual(astEvaluate(parse('$parent.$parent?.label'), scope, { strict: true }, null), 'outer');
    });

    it('accounts for the function scope introduced by a lambda', function () {
      const expression = parse('(value => $parent?.label ?? value)("fallback")');
      assert.strictEqual(astEvaluate(expression, Scope.create({}), { strict: true }, null), 'fallback');
      const scope = Scope.fromParent(Scope.create({ label: 'outer' }), {});
      assert.strictEqual(astEvaluate(expression, scope, { strict: true }, null), 'outer');
    });

    const callCases = [
      { text: '$parent?.run()', guard: 1, optional: false },
      { text: '$parent.run?.()', guard: void 0, optional: true },
      { text: '$parent?.run?.()', guard: 1, optional: true },
      { text: '($parent?.run)()', guard: void 0, optional: false },
      { text: '($parent?.run)?.()', guard: 1, optional: true },
    ];
    for (const { text, guard, optional } of callCases) {
      it(`keeps receiver and callee guards independent for ${text}`, function () {
        const expression = parse(text);
        assert.deepStrictEqual(expression, createCallScopeExpression('run', [], 1, optional, guard));
        assert.deepStrictEqual(parse(Unparser.unparse(expression)), expression);
        const withoutParent = Scope.create({});
        const evaluate = (scope: Scope) => astEvaluate(expression, scope, { strict: true }, null);
        if (guard === void 0) {
          assert.throws(() => evaluate(withoutParent), /AUR0114/);
        } else {
          assert.strictEqual(evaluate(withoutParent), void 0);
        }
        const parent = Scope.create({ run: null });
        const scope = Scope.fromParent(parent, {});
        if (optional) {
          assert.strictEqual(evaluate(scope), void 0);
        } else {
          assert.throws(() => evaluate(scope), /AUR0111/);
        }
        parent.bindingContext.run = 1;
        assert.throws(() => evaluate(scope), /AUR0111/);
      });
    }

    it('skips arguments for an absent receiver and binds calls to the chosen override context', function () {
      let argumentsEvaluated = 0;
      const child = { argument() { ++argumentsEvaluated; return 'argument'; } };
      const expression = parse('$parent?.run(argument())');
      assert.strictEqual(astEvaluate(expression, Scope.create(child), { strict: true }, null), void 0);
      assert.strictEqual(argumentsEvaluated, 0);
      const override = { label: 'local', run(value: string) { return `${this.label}:${value}`; } };
      const scope = Scope.fromParent(Scope.create({ label: 'component' }, override), child);
      assert.strictEqual(astEvaluate(expression, scope, { strict: true }, null), 'local:argument');
      assert.strictEqual(argumentsEvaluated, 1);
      const bound = astEvaluate(parse('$parent?.run'), scope, { strict: true, boundFn: true }, null) as (value: string) => string;
      assert.strictEqual(bound('bound'), 'local:bound');
    });

    it('does not let an optional function hide a missing unguarded ancestor', function () {
      const expression = parse('$parent?.$parent.run?.()');
      assert.strictEqual(astEvaluate(expression, Scope.create({}), { strict: true }, null), void 0);
      const scope = Scope.fromParent(Scope.create({}), {});
      assert.throws(() => astEvaluate(expression, scope, { strict: true }, null), /AUR0114/);
      assert.strictEqual(astEvaluate(expression, scope, { strict: false }, null), void 0);
    });

    it('stops checking an earlier guard when its scope path runs out', function () {
      const expression = parse('$parent.$parent?.$parent.label');
      assert.strictEqual(astEvaluate(expression, Scope.create({}), { strict: true }, null), void 0);
    });

    for (const text of ['$parent?.label = 1', '($parent?.label) = 1', '$this?.label = 1', '$parent?.$parent.label = 1']) {
      it(`rejects assignment through ${text}`, function () {
        assert.throws(() => parse(text));
      });
    }
  });

  describe('non-strict mode', function () {
    it('[text] does not throw on access member', function () {
      assert.doesNotThrow(() => createFixture('${a.b}'));
    });

    it('[text] does not throw on access member - missing object + optional access', function () {
      assert.doesNotThrow(() => createFixture('${a?.b}'));
    });

    it('[text] does not throw on access keyed - misssing object', function () {
      assert.doesNotThrow(() => createFixture('${a[b]}'));
    });

    it('[text] does not throw on access keyed - missing object + optional access', function () {
      assert.doesNotThrow(() => createFixture('${a?.[b]}'));
    });

    it('[text] does not throw on access keyed - literal key', function () {
      assert.doesNotThrow(() => createFixture('${a[5]}'));
    });

    it('[text] does not throw on call scope - prop missing', function () {
      assert.doesNotThrow(() => createFixture('${a()}'));
    });

    it('[text] throws on call scope - prop not a fn', function () {
      assert.throws(() => createFixture('${a()}', { a: 5 }));
    });

    it('[text] does not throw on call member - object missing', function () {
      assert.doesNotThrow(() => createFixture('${a.b()}'));
    });

    it('[text] does not throw on call scope - optional call + missing function', function () {
      assert.doesNotThrow(() => createFixture('${a?.()}'));
    });

    it('[text] does not throw on call member - optional call + missing prop', function () {
      assert.doesNotThrow(() => createFixture('${a.b?.()}', { a: {} }));
    });

    it('[text] throws on optional call member - optional call + member is not a fn', function () {
      assert.throws(() => createFixture('${a.b?.()}', { a: { b: 5 } }));
    });

    it('[text] does not throw on call function - object missing', function () {
      assert.doesNotThrow(() => createFixture('${a[5]?.()}'));
    });

    it('[text] does not throw on call function - value is nullish', function () {
      assert.doesNotThrow(() => createFixture('${a[5]?.()}', { a: {} }));
    });

    it('[text] throws on call function - value is not a function', function () {
      assert.throws(() => createFixture('${a[5]?.()}', { a: { 5: 5 } }));
    });

    it('[event] does not throw on handler missing - call scope', function () {
      const { trigger } = createFixture('<div click.trigger="a()"></div>');

      trigger.click('div');
    });

    it('[event] does not throw on event handler missing - call member', function () {
      const { trigger } = createFixture('<div click.trigger="a.b()"></div>');

      trigger.click('div');
    });

    it('[event] throws on event handler not a fn - call member', function () {
      const { platform, trigger } = createFixture('<div click.trigger="a.b()"></div>', { a: { b: 5 } });

      let error: unknown;
      platform.window.addEventListener('au-event-error', function handler(e: CustomEvent<{ error: Error }>) {
        e.preventDefault();
        error = e.detail.error;
        platform.window.removeEventListener('au-event-error', handler);
      });

      trigger.click('div');
      assert.includes(String(error), 'AUR0111:');
    });

    it('[event] does not throw on handler missing - call keyed', function () {
      const { trigger } = createFixture('<div click.trigger="a[`b`]()"></div>');

      trigger.click('div');
    });

    it('[event] does not throw on handler missing - complex expression', function () {
      const { trigger } = createFixture('<div click.trigger="(a ? b : c)()"></div>');

      trigger.click('div');
    });

    it('[text] renders empty string on undefined', function () {
      const { assertText } = createFixture('${a}', { a: undefined });

      assertText('');
    });

    it('[text] renders empty string on null', function () {
      const { assertText } = createFixture('${a}', { a: null });

      assertText('');
    });

    it('[text] works with ?? on undefined prop - access scope', function () {
      const { assertText } = createFixture('${a ?? "b"}', { a: undefined });

      assertText('b');
    });

    it('[text] works with ?? on missing instance - access member', function () {
      const { assertText } = createFixture('${a.c ?? "b"}');

      assertText('b');
    });

    it('[text] works with ?? on missing instance - access keyed', function () {
      const { assertText } = createFixture('${a[c] ?? "b"}');

      assertText('b');
    });

    it('[text] works with ?? on null prop', function () {
      const { assertText } = createFixture('${a ?? "b"}', { a: null });

      assertText('b');
    });

    it('[interpolation] does not throw on access member - missing object', function () {
      assert.doesNotThrow(() => createFixture('<div id="${a.b}">'));
    });

    it('[ref] does not throw on access member - missing object', function () {
      assert.doesNotThrow(() => createFixture('<div ref="a.b">'));
    });

    it('[let] does not throw on access member - missing object', function () {
      assert.doesNotThrow(() => createFixture('<let id.bind="a.b">'));
    });

    it('[attribute] does not throw on access member - missing object', function () {
      assert.doesNotThrow(() => createFixture('<div selected.class="a.b">'));
    });

    describe('assignment', function () {
      @customElement({ name: 'my-el', template: '', bindables: [{ name: 'value', mode: 'fromView' }] })
      class MyEl {
        public value: unknown;
      }

      it('assigns on access member assignment - missing scope', function () {
        const { component } = createFixture(
          '<my-el value.from-view="a.b" component.ref="el">',
          class App {
            // starts with an empty object to avoid error
            a = {};
            el: MyEl;
          },
          [MyEl]
        );

        component.a = null;
        component.el.value = 5;
        assert.deepStrictEqual(component.a, { b: 5 });
      });

      it('assigns on access member assignment - missing scope + optional', function () {
        const { component } = createFixture(
          '<my-el value.from-view="a?.b" component.ref="el">',
          class App {
            // starts with an empty object to avoid error
            a = {};
            el: MyEl;
          },
          [MyEl]
        );

        component.a = null;
        component.el.value = 5;
        assert.deepStrictEqual(component.a, { b: 5 });
      });

      it('throws on access keyed assignment - missing scope', function () {
        const { trigger, component } = createFixture('<button click.trigger="a[5] = 1">', class { a: unknown; });

        trigger.click('button');
        assert.deepStrictEqual(component.a, { 5: 1 });
      });
    });
  });

  describe('strict mode', function () {
    const createStrictFixture = <T>(template: string, component?: T | Constructable<T>, registrations: unknown[] = []) =>
      createFixture
        .html(template)
        .deps(...registrations)
        .component(component, { strict: true })
        .build();

    it('[text] throws on access member - object missing', function () {
      assert.throws(() => createStrictFixture('${a.b}'));
    });

    // only 1 to test demonstrate strict mode is applied for interpolation
    // the rest of the tests are assumed to be similar to text binding
    it('[interpolation] throws on access member - missing object', function () {
      assert.throws(() => createStrictFixture('<div id="${a.b}">'));
    });

    // only 1 to test demonstrate strict mode is applied for ref
    // the rest of the tests are assumed to be similar to text binding
    it('[ref] throws on access member - missing object', function () {
      assert.throws(() => createStrictFixture('<div ref="a.b">'));
    });

    it('[let] throws on access member - missing object', function () {
      assert.throws(() => createStrictFixture('<let id.bind="a.b">'));
    });

    it('[attribute] throws on access member - missing object', function () {
      assert.throws(() => createStrictFixture('<div selected.class="a.b">'));
    });

    it('[text] does not throw on access member - object missing + optional', function () {
      assert.doesNotThrow(() => createStrictFixture('${a?.b}'));
    });

    it('[text] throws on access keyed - object missing', function () {
      assert.throws(() => createStrictFixture('${a[b]}'));
    });

    it('[text] does not throw on access keyed - object missing + optional', function () {
      assert.doesNotThrow(() => createStrictFixture('${a?.[b]}'));
    });

    it('[text] throws on access keyed - literal key - object missing', function () {
      assert.throws(() => createStrictFixture('${a[5]}'));
    });

    it('[text] throws on call scope - prop missing', function () {
      assert.throws(() => createStrictFixture('${a()}'));
    });

    it('[text] throws on call scope - prop nullish', function () {
      assert.throws(() => createStrictFixture('${a()}', { a: null }));
    });

    it('[text] throws on call scope - prop not a fn', function () {
      assert.throws(() => createStrictFixture('${a()}', { a: 5 }));
    });

    it('[text] does not throw on call scope - optional call + prop missing', function () {
      assert.doesNotThrow(() => createStrictFixture('${a?.()}'));
    });

    it('[text] throws on call scope - optional call + prop is not a fn', function () {
      assert.throws(() => createStrictFixture('${a?.()}', { a: 5 }));
    });

    it('[text] throws on call member - obj missing', function () {
      assert.throws(() => createStrictFixture('${a.b()}'));
    });

    it('[text] throws on call member - missing member', function () {
      assert.throws(() => createStrictFixture('${a.b()}', { a: {} }));
    });

    it('[text] throws on call member - member not a function', function () {
      assert.throws(() => createStrictFixture('${a.b()}', { a: { b: 5 } }));
    });

    it('[text] does not throw on call member - optional call + object missing', function () {
      assert.doesNotThrow(() => createStrictFixture('${a.b?.()}', { a: {} }));
    });

    it('[text] throws on optional call member - member not a fn', function () {
      assert.throws(() => createStrictFixture('${a.b?.()}', { a: { b: 5 } }));
    });

    it('[text] throws on call function - nullish fn', function () {
      assert.throws(() => createStrictFixture('${a[5]()}', { a: {  } }));
    });

    it('[text] does not throw on call function - optional call + nullish fn', function () {
      assert.doesNotThrow(() => createStrictFixture('${a[5]?.()}', { a: { 5: null } }));
    });

    it('[text] throws on call function - optional call + fn not a function', function () {
      assert.throws(() => createStrictFixture('${a[5]?.()}', { a: { 5: 5 } }));
    });

    it('[trigger] throws on missing call scope fn', function () {
      const { platform, trigger } = createStrictFixture('<div click.trigger="a()"></div>');

      let handled = false;
      platform.window.addEventListener('au-event-error', function handler(e) {
        e.preventDefault();
        handled = true;
        platform.window.removeEventListener('au-event-error', handler);
      });
      trigger.click('div');
      assert.strictEqual(handled, true);
    });

    it('[trigger] throws on missing call member fn', function () {
      const { platform, trigger } = createStrictFixture('<div click.trigger="a.b()"></div>', { a: {} });

      let handled = false;
      platform.window.addEventListener('au-event-error', function handler(e) {
        e.preventDefault();
        handled = true;
        platform.window.removeEventListener('au-event-error', handler);
      });

      trigger.click('div');
      assert.strictEqual(handled, true);
    });

    it('[trigger] throws on call member fn not a fn', function () {
      const { platform, trigger } = createStrictFixture('<div click.trigger="a.b()"></div>', { a: { b: 5 } });

      let error: unknown;
      platform.window.addEventListener('au-event-error', function handler(e: CustomEvent<{ error: Error }>) {
        e.preventDefault();
        error = e.detail.error;
        platform.window.removeEventListener('au-event-error', handler);
      });

      trigger.click('div');
      assert.includes(String(error), 'AUR0111:');
    });

    it('[trigger] throws on call member optional call - not a fn', function () {
      const { platform, trigger } = createStrictFixture('<div click.trigger="a.b?.()"></div>', { a: { b: 5 } });

      let error: unknown;
      handleAuEventError(platform, function (e) {
        error = e.detail.error;
      });

      trigger.click('div');
      assert.includes(String(error), 'AUR0111:');
    });

    describe('assignment', function () {
      @customElement({ name: 'my-el', template: '', bindables: [{ name: 'value', mode: 'fromView' }] })
      class MyEl {
        public value: unknown;
      }

      it('throws on access member assignment - missing scope', function () {
        const { component } = createStrictFixture(
          '<my-el value.from-view="a.b" component.ref="el">',
          class App {
            // starts with an empty object to avoid error
            a = {};
            el: MyEl;
          },
          [MyEl]
        );

        let i = 0;
        component.a = null;
        try {
          component.el.value = 5;
        } catch (error) {
          i = 1;
          assert.includes(String(error), 'AUR0114');
        }
        assert.strictEqual(i, 1);
      });

      it('throws on access member assignment - missing scope + optional', function () {
        // in the future when official JS supports optional chaining arrives, this won't throw
        const { component } = createStrictFixture(
          '<my-el value.from-view="a?.b" component.ref="el">',
          class App {
            // starts with an empty object to avoid error
            a = {};
            el: MyEl;
          },
          [MyEl]
        );

        let i = 0;
        component.a = null;
        try {
          component.el.value = 5;
        } catch (error) {
          i = 1;
          assert.includes(String(error), 'AUR0116');
        }
        assert.strictEqual(i, 1);
      });

      it('throws on access keyed assignment - missing scope', function () {
        const { platform, trigger } = createStrictFixture('<button click.trigger="a[5] = 1">');

        let error: unknown;
        handleAuEventError(platform, e => error = e.detail.error);

        trigger.click('button');
        assert.includes(String(error), 'AUR0116');
      });
    });
  });

  function handleAuEventError(platform: IPlatform, handler: (e: CustomEvent<{ error: Error }>) => void) {
    platform.window.addEventListener('au-event-error', function auEventErrorHandler(e: CustomEvent<{ error: Error }>) {
      e.preventDefault();
      handler(e);
      platform.window.removeEventListener('au-event-error', auEventErrorHandler);
    });
  }
});
