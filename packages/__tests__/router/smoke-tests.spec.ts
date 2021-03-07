import { LogLevel, Constructable, kebabCase, ILogConfig, ILogger } from '@aurelia/kernel';
import { assert, TestContext } from '@aurelia/testing';
import { RouterConfiguration, IRouter, NavigationInstruction, IRouteContext, RouteNode } from '@aurelia/router';
import { Aurelia, customElement, CustomElement } from '@aurelia/runtime-html';

import { TestRouterConfiguration } from './_shared/configuration.js';

function vp(count: number): string {
  return '<au-viewport></au-viewport>'.repeat(count);
}

type C = Constructable;
type CSpec = (C | CSpec)[];
function getText(spec: CSpec): string {
  return spec.map(function (x) {
    if (x instanceof Array) {
      return getText(x);
    }
    return kebabCase(x.name);
  }).join('');
}
function assertComponentsVisible(host: HTMLElement, spec: CSpec, msg: string = ''): void {
  assert.strictEqual(host.textContent, getText(spec), msg);
}
function assertIsActive(
  router: IRouter,
  instruction: NavigationInstruction,
  context: IRouteContext,
  expected: boolean,
  assertId: number,
): void {
  const isActive = router.isActive(instruction, context);
  assert.strictEqual(isActive, expected, `expected isActive to return ${expected} (assertId ${assertId})`);
}

async function createFixture<T extends Constructable>(
  Component: T,
  deps: Constructable[],
  level: LogLevel = LogLevel.warn,
) {
  const ctx = TestContext.create();
  const { container, platform } = ctx;

  container.register(TestRouterConfiguration.for(ctx, level));
  container.register(RouterConfiguration.customize({ resolutionMode: 'dynamic' }));
  container.register(...deps);

  const component = container.get(Component);
  const router = container.get(IRouter);

  const au = new Aurelia(container);
  const host = ctx.createElement('div');

  au.app({ component, host });

  await au.start();

  assertComponentsVisible(host, [Component]);

  const logConfig = container.get(ILogConfig);

  return {
    ctx,
    au,
    host,
    component,
    platform,
    container,
    router,
    startTracing() {
      logConfig.level = LogLevel.trace;
    },
    stopTracing() {
      logConfig.level = level;
    },
    async tearDown() {
      assert.areTaskQueuesEmpty();

      await au.stop(true);
    }
  };
}

describe('router (smoke tests)', function () {
  describe('without any configuration, deps registered globally', function () {
    @customElement({ name: 'a01', template: `a01${vp(0)}` })
    class A01 {}
    @customElement({ name: 'a02', template: `a02${vp(0)}` })
    class A02 {}
    const A0 = [A01, A02];

    @customElement({ name: 'root1', template: `root1${vp(1)}` })
    class Root1 {}
    @customElement({ name: 'a11', template: `a11${vp(1)}` })
    class A11 {}
    @customElement({ name: 'a12', template: `a12${vp(1)}` })
    class A12 {}
    const A1 = [A11, A12];

    @customElement({ name: 'root2', template: `root2${vp(2)}` })
    class Root2 {}
    @customElement({ name: 'a21', template: `a21${vp(2)}` })
    class A21 {}
    @customElement({ name: 'a22', template: `a22${vp(2)}` })
    class A22 {}
    const A2 = [A21, A22];

    const A = [...A0, ...A1, ...A2];

    @customElement({ name: 'b01', template: `b01${vp(0)}` })
    class B01 {
      public async canUnload(
        next: RouteNode | null,
        current: RouteNode,
      ): Promise<true> {
        await new Promise(function (resolve) { setTimeout(resolve, 0); });
        return true;
      }
    }
    @customElement({ name: 'b02', template: `b02${vp(0)}` })
    class B02 {
      public async canUnload(
        next: RouteNode | null,
        current: RouteNode,
      ): Promise<false> {
        await new Promise(function (resolve) { setTimeout(resolve, 0); });
        return false;
      }
    }
    const B0 = [B01, B02];

    @customElement({ name: 'b11', template: `b11${vp(1)}` })
    class B11 {
      public async canUnload(
        next: RouteNode | null,
        current: RouteNode,
      ): Promise<true> {
        await new Promise(function (resolve) { setTimeout(resolve, 0); });
        return true;
      }
    }
    @customElement({ name: 'b12', template: `b12${vp(1)}` })
    class B12 {
      public async canUnload(
        next: RouteNode | null,
        current: RouteNode,
      ): Promise<false> {
        await new Promise(function (resolve) { setTimeout(resolve, 0); });
        return false;
      }
    }
    const B1 = [B11, B12];

    const B = [...B0, ...B1];

    const Z = [...A, ...B];

    // Start with a broad sample of non-generated tests that are easy to debug and mess around with.
    it(`root1 can load a01 as a string and can determine if it's active`, async function () {
      const { router, host, tearDown } = await createFixture(Root1, Z);

      await router.load('a01');
      assertComponentsVisible(host, [Root1, A01]);
      assertIsActive(router, 'a01', router.routeTree.root.context, true, 1);

      await tearDown();
    });

    it(`root1 can load a01 as a type and can determine if it's active`, async function () {
      const { router, host, tearDown } = await createFixture(Root1, Z);

      await router.load(A01);
      assertComponentsVisible(host, [Root1, A01]);
      assertIsActive(router, A01, router.routeTree.root.context, true, 1);

      await tearDown();
    });

    it(`root1 can load a01 as a ViewportInstruction and can determine if it's active`, async function () {
      const { router, host, tearDown } = await createFixture(Root1, Z);

      await router.load({ component: A01 });
      assertComponentsVisible(host, [Root1, A01]);
      assertIsActive(router, { component: A01 }, router.routeTree.root.context, true, 1);

      await tearDown();
    });

    it(`root1 can load a01 as a CustomElementDefinition and can determine if it's active`, async function () {
      const { router, host, tearDown } = await createFixture(Root1, Z);

      await router.load(CustomElement.getDefinition(A01));
      assertComponentsVisible(host, [Root1, A01]);
      assertIsActive(router, CustomElement.getDefinition(A01), router.routeTree.root.context, true, 1);

      await tearDown();
    });

    it(`root1 can load a01,a02 in order and can determine if it's active`, async function () {
      const { router, host, tearDown } = await createFixture(Root1, Z);

      await router.load('a01');
      assertComponentsVisible(host, [Root1, A01]);
      assertIsActive(router, 'a01', router.routeTree.root.context, true, 1);

      await router.load('a02');
      assertComponentsVisible(host, [Root1, A02]);
      assertIsActive(router, 'a02', router.routeTree.root.context, true, 2);

      await tearDown();
    });

    it(`root1 can load a11,a11/a02 in order with context and can determine if it's active`, async function () {
      const { router, host, tearDown } = await createFixture(Root1, Z);

      await router.load(A11);
      assertComponentsVisible(host, [Root1, A11]);
      assertIsActive(router, A11, router.routeTree.root.context, true, 1);

      const context = router.routeTree.root.children[0].context;

      await router.load(A02, { context });
      assertComponentsVisible(host, [Root1, A11, A02]);
      assertIsActive(router, A02, context, true, 2);
      assertIsActive(router, A02, router.routeTree.root.context, false, 3);
      assertIsActive(router, A11, router.routeTree.root.context, true, 3);

      await tearDown();
    });

    it(`root1 can load a11/a01,a11/a02 in order with context`, async function () {
      const { router, host, tearDown } = await createFixture(Root1, Z);

      await router.load({ component: A11, children: [A01] });
      assertComponentsVisible(host, [Root1, A11, A01]);

      const context = router.routeTree.root.children[0].context;

      await router.load(A02, { context });
      assertComponentsVisible(host, [Root1, A11, A02]);

      await tearDown();
    });

    it(`root1 correctly handles canUnload with load b01,a01 in order`, async function () {
      const { router, host, tearDown } = await createFixture(Root1, Z);

      let result = await router.load(B01);
      assertComponentsVisible(host, [Root1, B01]);
      assert.strictEqual(result, true, '#1 result===true');

      result = await router.load(A01);
      assertComponentsVisible(host, [Root1, A01]);
      assert.strictEqual(result, true, '#2 result===true');

      await tearDown();
    });

    it(`root1 correctly handles canUnload with load b02,a01 in order`, async function () {
      const { router, host, tearDown } = await createFixture(Root1, Z);

      let result = await router.load(B02);
      assertComponentsVisible(host, [Root1, B02]);
      assert.strictEqual(result, true, '#1 result===true');

      result = await router.load(A01);
      assertComponentsVisible(host, [Root1, B02]);
      assert.strictEqual(result, false, '#2 result===false');

      await tearDown();
    });

    it(`root1 correctly handles canUnload with load b02,a01,a02 in order`, async function () {
      const { router, host, tearDown } = await createFixture(Root1, Z);

      let result = await router.load(B02);
      assertComponentsVisible(host, [Root1, B02], '#1');
      assert.strictEqual(result, true, '#1 result===true');

      result = await router.load(A01);
      assertComponentsVisible(host, [Root1, B02], '#2');
      assert.strictEqual(result, false, '#2 result===false');

      result = await router.load(A02);
      assertComponentsVisible(host, [Root1, B02], '#3');
      assert.strictEqual(result, false, '#3 result===false');

      await tearDown();
    });

    it(`root1 correctly handles canUnload with load b11/b02,b11/a02 in order`, async function () {
      const { router, host, tearDown } = await createFixture(Root1, Z);

      let result = await router.load(`b11/b02`);
      assertComponentsVisible(host, [Root1, B11, [B02]]);
      assert.strictEqual(result, true, '#1 result===true');

      result = await router.load(`b11/a02`);
      assertComponentsVisible(host, [Root1, B11, [B02]]);
      assert.strictEqual(result, false, '#2 result===false');

      await tearDown();
    });

    it(`root1 correctly handles canUnload with load b12/b01,b11/b01 in order`, async function () {
      const { router, host, tearDown } = await createFixture(Root1, Z);

      let result = await router.load(`b12/b01`);
      assertComponentsVisible(host, [Root1, B12, [B01]]);
      assert.strictEqual(result, true, '#1 result===true');

      result = await router.load(`b11/b01`);
      assertComponentsVisible(host, [Root1, B12, [B01]]);
      assert.strictEqual(result, false, '#2 result===false');

      await tearDown();
    });

    it(`root1 correctly handles canUnload with load b12/b01,b12/a01 in order`, async function () {
      const { router, host, tearDown } = await createFixture(Root1, Z);

      let result = await router.load(`b12/b01`);
      assertComponentsVisible(host, [Root1, B12, [B01]]);
      assert.strictEqual(result, true, '#1 result===true');

      result = await router.load(`b12/a01`);
      assertComponentsVisible(host, [Root1, B12, [A01]]);
      assert.strictEqual(result, true, '#2 result===true');

      await tearDown();
    });

    it(`root1 can load a11/a01 as a string`, async function () {
      const { router, host, tearDown } = await createFixture(Root1, Z);

      await router.load(`a11/a01`);
      assertComponentsVisible(host, [Root1, A11, A01]);

      await tearDown();
    });

    it(`root1 can load a11/a01 as a ViewportInstruction`, async function () {
      const { router, host, tearDown } = await createFixture(Root1, Z);

      await router.load({ component: A11, children: [A01] });
      assertComponentsVisible(host, [Root1, A11, A01]);

      await tearDown();
    });

    it(`root1 can load a11/a01,a11/a02 in order`, async function () {
      const { router, host, tearDown } = await createFixture(Root1, Z);

      await router.load(`a11/a01`);
      assertComponentsVisible(host, [Root1, A11, A01]);

      await router.load(`a11/a02`);
      assertComponentsVisible(host, [Root1, A11, A02]);

      await tearDown();
    });

    it(`root2 can load a01+a02 as a string`, async function () {
      const { router, host, tearDown } = await createFixture(Root2, Z);

      await router.load(`a01+a02`);
      assertComponentsVisible(host, [Root2, A01, A02]);

      await tearDown();
    });

    it(`root2 can load a01+a02 as an array of strings`, async function () {
      const { router, host, tearDown } = await createFixture(Root2, Z);

      await router.load(['a01', 'a02']);
      assertComponentsVisible(host, [Root2, A01, A02]);

      await tearDown();
    });

    it(`root2 can load a01+a02 as an array of types`, async function () {
      const { router, host, tearDown } = await createFixture(Root2, Z);

      await router.load([A01, A02]);
      assertComponentsVisible(host, [Root2, A01, A02]);

      await tearDown();
    });

    it(`root2 can load a01+a02 as a mixed array type and string`, async function () {
      const { router, host, tearDown } = await createFixture(Root2, Z);

      await router.load([A01, 'a02']);
      assertComponentsVisible(host, [Root2, A01, A02]);

      await tearDown();
    });

    it(`root2 can load a01+a02,a02+a01 in order`, async function () {
      const { router, host, tearDown } = await createFixture(Root2, Z);

      await router.load(`a01+a02`);
      assertComponentsVisible(host, [Root2, A01, A02]);

      await router.load(`a02+a01`);
      assertComponentsVisible(host, [Root2, A02, A01]);

      await tearDown();
    });

    it(`root2 can load a11/a12/a01+a12/a01,a11/a12/a01+a12/a11/a01,a11/a12/a02+a12/a11/a01 in order with context`, async function () {
      const { router, host, tearDown } = await createFixture(Root2, Z);

      await router.load(`a11/a12/a01+a12/a01`);
      assertComponentsVisible(host, [Root2, [A11, [A12, [A01]]], [A12, [A01]]], '#1');

      let context = router.routeTree.root.children[1].context;

      await router.load(`a11/a01`, { context });
      assertComponentsVisible(host, [Root2, [A11, [A12, [A01]]], [A12, [A11, [A01]]]], '#2');

      context = router.routeTree.root.children[0].children[0].context;

      await router.load(`a02`, { context });
      assertComponentsVisible(host, [Root2, [A11, [A12, [A02]]], [A12, [A11, [A01]]]], '#3');

      await tearDown();
    });

    // Now generate stuff
    const $1vp: Record<string, CSpec> = {
      // [x]
      [`a01`]: [A01],
      [`a02`]: [A02],
      // [x/x]
      [`a11/a01`]: [A11, [A01]],
      [`a11/a02`]: [A11, [A02]],
      [`a12/a01`]: [A12, [A01]],
      [`a12/a02`]: [A12, [A02]],
      // [x/x/x]
      [`a11/a12/a01`]: [A11, [A12, [A01]]],
      [`a11/a12/a02`]: [A11, [A12, [A02]]],
      [`a12/a11/a01`]: [A12, [A11, [A01]]],
      [`a12/a11/a02`]: [A12, [A11, [A02]]],
    };

    const $2vps: Record<string, CSpec> = {
      // [x+x]
      [`a01+a02`]: [[A01], [A02]],
      [`a02+a01`]: [[A02], [A01]],
      // [x/x+x]
      [`a11/a01+a02`]: [[A11, [A01]], [A02]],
      [`a11/a02+a01`]: [[A11, [A02]], [A01]],
      [`a12/a01+a02`]: [[A12, [A01]], [A02]],
      [`a12/a02+a01`]: [[A12, [A02]], [A01]],
      // [x+x/x]
      [`a01+a11/a02`]: [[A01], [A11, [A02]]],
      [`a02+a11/a01`]: [[A02], [A11, [A01]]],
      [`a01+a12/a02`]: [[A01], [A12, [A02]]],
      [`a02+a12/a01`]: [[A02], [A12, [A01]]],
      // [x/x+x/x]
      [`a11/a01+a12/a02`]: [[A11, [A01]], [A12, [A02]]],
      [`a11/a02+a12/a01`]: [[A11, [A02]], [A12, [A01]]],
      [`a12/a01+a11/a02`]: [[A12, [A01]], [A11, [A02]]],
      [`a12/a02+a11/a01`]: [[A12, [A02]], [A11, [A01]]],
    };

    const $1vpKeys = Object.keys($1vp);
    for (let i = 0, ii = $1vpKeys.length; i < ii; ++i) {
      const key11 = $1vpKeys[i];
      const value11 = $1vp[key11];

      it(`root1 can load ${key11}`, async function () {
        const { router, host, tearDown } = await createFixture(Root1, Z);

        await router.load(key11);
        assertComponentsVisible(host, [Root1, value11]);

        await tearDown();
      });

      if (i >= 1) {
        const key11prev = $1vpKeys[i - 1];
        const value11prev = $1vp[key11prev];

        it(`root1 can load ${key11prev},${key11} in order`, async function () {
          const { router, host, tearDown } = await createFixture(Root1, Z);

          await router.load(key11prev);
          assertComponentsVisible(host, [Root1, value11prev]);

          await router.load(key11);
          assertComponentsVisible(host, [Root1, value11]);

          await tearDown();
        });

        it(`root1 can load ${key11},${key11prev} in order`, async function () {
          const { router, host, tearDown } = await createFixture(Root1, Z);

          await router.load(key11);
          assertComponentsVisible(host, [Root1, value11]);

          await router.load(key11prev);
          assertComponentsVisible(host, [Root1, value11prev]);

          await tearDown();
        });
      }
    }

    const $2vpsKeys = Object.keys($2vps);
    for (let i = 0, ii = $2vpsKeys.length; i < ii; ++i) {
      const key21 = $2vpsKeys[i];
      const value21 = $2vps[key21];

      it(`root2 can load ${key21}`, async function () {
        const { router, host, tearDown } = await createFixture(Root2, Z);

        await router.load(key21);
        assertComponentsVisible(host, [Root2, value21]);

        await tearDown();
      });

      if (i >= 1) {
        const key21prev = $2vpsKeys[i - 1];
        const value21prev = $2vps[key21prev];

        it(`root2 can load ${key21prev},${key21} in order`, async function () {
          const { router, host, tearDown } = await createFixture(Root2, Z);

          await router.load(key21prev);
          assertComponentsVisible(host, [Root2, value21prev]);

          await router.load(key21);
          assertComponentsVisible(host, [Root2, value21]);

          await tearDown();
        });

        it(`root2 can load ${key21},${key21prev} in order`, async function () {
          const { router, host, tearDown } = await createFixture(Root2, Z);

          await router.load(key21);
          assertComponentsVisible(host, [Root2, value21]);

          await router.load(key21prev);
          assertComponentsVisible(host, [Root2, value21prev]);

          await tearDown();
        });
      }
    }
  });

  for (const mode of ['static', 'dynamic'] as const) {
    it(`can load single anonymous default at the root with mode: ${mode}`, async function () {
      @customElement({ name: 'a', template: 'a' })
      class A {}
      @customElement({ name: 'b', template: 'b' })
      class B {}
      @customElement({
        name: 'root',
        template: `root<au-viewport default="a"></au-viewport>`,
        dependencies: [A, B],
      })
      class Root {}

      const ctx = TestContext.create();
      const { container } = ctx;

      container.register(TestRouterConfiguration.for(ctx));
      container.register(RouterConfiguration.customize({ resolutionMode: mode }));

      const component = container.get(Root);
      const router = container.get(IRouter);

      const au = new Aurelia(container);
      const host = ctx.createElement('div');

      au.app({ component, host });

      await au.start();

      assertComponentsVisible(host, [Root, [A]]);

      await router.load('b');

      assertComponentsVisible(host, [Root, [B]]);

      await router.load('');

      assertComponentsVisible(host, [Root, [A]]);

      await au.stop(true);
      assert.areTaskQueuesEmpty();
    });

    it(`can load a named default with one sibling at the root with mode: ${mode}`, async function () {
      @customElement({ name: 'a', template: 'a' })
      class A {}
      @customElement({ name: 'b', template: 'b' })
      class B {}
      @customElement({
        name: 'root',
        template: `root<au-viewport name="a" default="a"></au-viewport><au-viewport name="b"></au-viewport>`,
        dependencies: [A, B],
      })
      class Root {}

      const ctx = TestContext.create();
      const { container } = ctx;

      container.register(TestRouterConfiguration.for(ctx));
      container.register(RouterConfiguration.customize({ resolutionMode: mode }));

      const component = container.get(Root);
      const router = container.get(IRouter);

      const au = new Aurelia(container);
      const host = ctx.createElement('div');

      au.app({ component, host });

      await au.start();

      assertComponentsVisible(host, [Root, [A]]);

      await router.load('b@b');

      assertComponentsVisible(host, [Root, [A, B]]);

      await router.load('');

      assertComponentsVisible(host, [Root, [A]]);

      await router.load('a@a+b@b');

      assertComponentsVisible(host, [Root, [A, B]]);

      await router.load('b@a');

      assertComponentsVisible(host, [Root, [B]]);

      await router.load('');

      assertComponentsVisible(host, [Root, [A]]);

      await router.load('b@a+a@b');

      assertComponentsVisible(host, [Root, [B, A]]);

      await au.stop(true);
      assert.areTaskQueuesEmpty();
    });

    it(`can load a named default with one sibling at a child with mode: ${mode}`, async function () {
      @customElement({ name: 'b', template: 'b' })
      class B {}
      @customElement({ name: 'c', template: 'c' })
      class C {}
      @customElement({
        name: 'a',
        template: 'a<au-viewport name="b" default="b"></au-viewport><au-viewport name="c"></au-viewport>',
        dependencies: [B, C],
      })
      class A {}
      @customElement({
        name: 'root',
        template: `root<au-viewport default="a">`,
        dependencies: [A],
      })
      class Root {}

      const ctx = TestContext.create();
      const { container } = ctx;

      container.register(TestRouterConfiguration.for(ctx, LogLevel.debug));
      container.register(RouterConfiguration.customize({ resolutionMode: mode }));

      const component = container.get(Root);
      const router = container.get(IRouter);

      const au = new Aurelia(container);
      const host = ctx.createElement('div');

      au.app({ component, host });

      await au.start();

      assertComponentsVisible(host, [Root, [A, [B]]]);

      await router.load('a/c@c');

      assertComponentsVisible(host, [Root, [A, [B, C]]]);

      await router.load('');

      assertComponentsVisible(host, [Root, [A, [B]]]);

      await router.load('a/(b@b+c@c)');

      assertComponentsVisible(host, [Root, [A, [B, C]]]);

      await router.load('a/c@b');

      assertComponentsVisible(host, [Root, [A, [C]]]);

      await router.load('');

      assertComponentsVisible(host, [Root, [A, [B]]]);

      await router.load('a/(c@b+b@c)');

      assertComponentsVisible(host, [Root, [A, [C, B]]]);

      await au.stop(true);
      assert.areTaskQueuesEmpty();
    });

    it(`will load the fallback when navigating to a non-existing route with mode: ${mode}`, async function () {
      @customElement({ name: 'a', template: 'a' })
      class A {}
      @customElement({
        name: 'root',
        template: `root<au-viewport fallback="a">`,
        dependencies: [A],
      })
      class Root {}

      const ctx = TestContext.create();
      const { container } = ctx;

      container.register(TestRouterConfiguration.for(ctx, LogLevel.debug));
      container.register(RouterConfiguration.customize({ resolutionMode: mode }));

      const component = container.get(Root);
      const router = container.get(IRouter);

      const au = new Aurelia(container);
      const host = ctx.createElement('div');

      au.app({ component, host });

      await au.start();

      assertComponentsVisible(host, [Root]);

      await router.load('b');

      assertComponentsVisible(host, [Root, [A]]);

      await au.stop(true);
      assert.areTaskQueuesEmpty();
    });
  }
});
