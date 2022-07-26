import { LogLevel, Constructable, kebabCase, ILogConfig, Registration, noop } from '@aurelia/kernel';
import { assert, MockBrowserHistoryLocation, TestContext } from '@aurelia/testing';
import { RouterConfiguration, IRouter, NavigationInstruction, IRouteContext, RouteNode, Params, route, INavigationModel, IRouterOptions, IRouteViewModel, IRouteConfig, RouteDefinition } from '@aurelia/router-lite';
import { Aurelia, customElement, CustomElement, ICustomElementViewModel, IHistory, IHydratedController, ILocation, INode, IPlatform, IWindow, StandardConfiguration, watch } from '@aurelia/runtime-html';

import { TestRouterConfiguration } from './_shared/configuration.js';
import { LifecycleFlags, valueConverter } from '@aurelia/runtime';

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
  level: LogLevel = LogLevel.fatal,
) {
  const ctx = TestContext.create();
  const { container, platform } = ctx;

  container.register(TestRouterConfiguration.for(level));
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
  @customElement({ name: 'a01', template: `a01${vp(0)}` })
  class A01 { }
  @customElement({ name: 'a02', template: `a02${vp(0)}` })
  class A02 { }
  const A0 = [A01, A02];

  @route({
    routes: [
      { path: 'a01', component: A01, transitionPlan: 'invoke-lifecycles' },
      { path: 'a02', component: A02, transitionPlan: 'invoke-lifecycles' },
    ]
  })
  @customElement({ name: 'a11', template: `a11${vp(1)}` })
  class A11 { }

  @route({
    routes: [
      { path: 'a01', component: A01, transitionPlan: 'invoke-lifecycles' },
      { path: 'a02', component: A02, transitionPlan: 'invoke-lifecycles' },
      { path: 'a11', component: A11, transitionPlan: 'invoke-lifecycles' },
    ]
  })
  @customElement({ name: 'a12', template: `a12${vp(1)}` })
  class A12 { }
  const A1 = [A11, A12];
  @customElement({ name: 'a21', template: `a21${vp(2)}` })
  class A21 { }
  @customElement({ name: 'a22', template: `a22${vp(2)}` })
  class A22 { }
  const A2 = [A21, A22];

  const A = [...A0, ...A1, ...A2];

  @customElement({ name: 'b01', template: `b01${vp(0)}` })
  class B01 {
    public async canUnload(
      _next: RouteNode | null,
      _current: RouteNode,
    ): Promise<true> {
      await new Promise(function (resolve) { setTimeout(resolve, 0); });
      return true;
    }
  }
  @customElement({ name: 'b02', template: `b02${vp(0)}` })
  class B02 {
    public async canUnload(
      _next: RouteNode | null,
      _current: RouteNode,
    ): Promise<false> {
      await new Promise(function (resolve) { setTimeout(resolve, 0); });
      return false;
    }
  }
  const B0 = [B01, B02];

  @route({
    routes: [
      { path: 'a01', component: A01, transitionPlan: 'invoke-lifecycles' },
      { path: 'a02', component: A02, transitionPlan: 'invoke-lifecycles' },
      { path: 'b01', component: B01, transitionPlan: 'invoke-lifecycles' },
      { path: 'b02', component: B02, transitionPlan: 'invoke-lifecycles' },
    ]
  })
  @customElement({ name: 'b11', template: `b11${vp(1)}` })
  class B11 {
    public async canUnload(
      _next: RouteNode | null,
      _current: RouteNode,
    ): Promise<true> {
      await new Promise(function (resolve) { setTimeout(resolve, 0); });
      return true;
    }
  }

  @route({
    routes: [
      { path: 'a01', component: A01, transitionPlan: 'invoke-lifecycles' },
      { path: 'a02', component: A02, transitionPlan: 'invoke-lifecycles' },
      { path: 'b01', component: B01, transitionPlan: 'invoke-lifecycles' },
      { path: 'b02', component: B02, transitionPlan: 'invoke-lifecycles' },
    ]
  })
  @customElement({ name: 'b12', template: `b12${vp(1)}` })
  class B12 {
    public async canUnload(
      _next: RouteNode | null,
      _current: RouteNode,
    ): Promise<false> {
      await new Promise(function (resolve) { setTimeout(resolve, 0); });
      return false;
    }
  }
  const B1 = [B11, B12];

  const B = [...B0, ...B1];

  const Z = [...A, ...B];

  @route({
    routes: [
      { path: 'a01', component: A01, transitionPlan: 'invoke-lifecycles' },
      { path: 'a02', component: A02, transitionPlan: 'invoke-lifecycles' },
      { path: 'a11', component: A11, transitionPlan: 'invoke-lifecycles' },
      { path: 'a12', component: A12, transitionPlan: 'invoke-lifecycles' },
      { path: 'b11', component: B11, transitionPlan: 'invoke-lifecycles' },
      { path: 'b12', component: B12, },
    ]
  })
  @customElement({ name: 'root1', template: `root1${vp(1)}` })
  class Root1 { }

  @route({
    routes: [
      { path: 'a01', component: A01, transitionPlan: 'invoke-lifecycles' },
      { path: 'a02', component: A02, transitionPlan: 'invoke-lifecycles' },
      { path: 'a11', component: A11, transitionPlan: 'invoke-lifecycles' },
      { path: 'a12', component: A12, transitionPlan: 'invoke-lifecycles' },
    ]
  })
  @customElement({ name: 'root2', template: `root2${vp(2)}` })
  class Root2 { }

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
    assertComponentsVisible(host, [Root1, B12, [B01]], '#1 text');
    assert.strictEqual(result, true, '#1 result===true');

    result = await router.load(`b12/a01`);
    assertComponentsVisible(host, [Root1, B12, [A01]], '#2 text');
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

  it(`root2 can load a12/a11/a01+a12/a01,a11/a12/a01+a12/a11/a01,a11/a12/a02+a12/a11/a01 in order with context`, async function () {
    const { router, host, tearDown } = await createFixture(Root2, Z);

    await router.load(`a12/a11/a01+a12/a01`);
    assertComponentsVisible(host, [Root2, [A12, [A11, [A01]]], [A12, [A01]]], '#1');

    let context = router.routeTree.root.children[1].context;

    await router.load(`a11/a01`, { context });
    assertComponentsVisible(host, [Root2, [A12, [A11, [A01]]], [A12, [A11, [A01]]]], '#2');

    context = router.routeTree.root.children[0].children[0].context;

    await router.load(`a02`, { context });
    assertComponentsVisible(host, [Root2, [A12, [A11, [A02]]], [A12, [A11, [A01]]]], '#3');

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
    [`a12/a11/a01`]: [A12, [A11, [A01]]],
    [`a12/a11/a02`]: [A12, [A11, [A02]]],
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

  for (const mode of ['static', 'dynamic'] as const) {
    it(`can load single anonymous default at the root with mode: ${mode}`, async function () {
      @customElement({ name: 'a', template: 'a' })
      class A { }
      @customElement({ name: 'b', template: 'b' })
      class B { }
      @route({
        routes: [
          { path: 'a', component: A, transitionPlan: 'invoke-lifecycles' },
          { path: 'b', component: B, transitionPlan: 'invoke-lifecycles' },
        ]
      })
      @customElement({
        name: 'root',
        template: `root<au-viewport default="a"></au-viewport>`,
        dependencies: [A, B],
      })
      class Root { }

      const ctx = TestContext.create();
      const { container } = ctx;

      container.register(TestRouterConfiguration.for());
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
      class A { }
      @customElement({ name: 'b', template: 'b' })
      class B { }
      @route({
        routes: [
          { path: 'a', component: A, transitionPlan: 'invoke-lifecycles' },
          { path: 'b', component: B, transitionPlan: 'invoke-lifecycles' },
        ]
      })
      @customElement({
        name: 'root',
        template: `root<au-viewport name="a" default="a"></au-viewport><au-viewport name="b"></au-viewport>`,
        dependencies: [A, B],
      })
      class Root { }

      const ctx = TestContext.create();
      const { container } = ctx;

      container.register(TestRouterConfiguration.for());
      container.register(RouterConfiguration.customize({ resolutionMode: mode }));

      const component = container.get(Root);
      const router = container.get(IRouter);

      const au = new Aurelia(container);
      const host = ctx.createElement('div');

      au.app({ component, host });

      await au.start();

      assertComponentsVisible(host, [Root, [A]], '1');

      await router.load('b@b');

      assertComponentsVisible(host, [Root, [A, B]], '2');

      await router.load('');

      assertComponentsVisible(host, [Root, [A]], '3');

      await router.load('a@a+b@b');

      assertComponentsVisible(host, [Root, [A, B]], '4');

      await router.load('b@a');

      assertComponentsVisible(host, [Root, [B]], '5');

      await router.load('');

      assertComponentsVisible(host, [Root, [A]], '6');

      await router.load('b@a+a@b');

      assertComponentsVisible(host, [Root, [B, A]], '7');

      await au.stop(true);
      assert.areTaskQueuesEmpty();
    });

    it(`can load a named default with one sibling at a child with mode: ${mode}`, async function () {
      @customElement({ name: 'b', template: 'b' })
      class B { }
      @customElement({ name: 'c', template: 'c' })
      class C { }
      @route({
        routes: [
          { path: 'b', component: B, transitionPlan: 'invoke-lifecycles' },
          { path: 'c', component: C, transitionPlan: 'invoke-lifecycles' },
        ]
      })
      @customElement({
        name: 'a',
        template: 'a<au-viewport name="b" default="b"></au-viewport><au-viewport name="c"></au-viewport>',
        dependencies: [B, C],
      })
      class A { }
      @route({
        routes: [
          { path: 'a', component: A, transitionPlan: 'invoke-lifecycles' },
        ]
      })
      @customElement({
        name: 'root',
        template: `root<au-viewport default="a">`,
        dependencies: [A],
      })
      class Root { }

      const ctx = TestContext.create();
      const { container } = ctx;

      container.register(TestRouterConfiguration.for(LogLevel.warn));
      container.register(RouterConfiguration.customize({ resolutionMode: mode }));

      const component = container.get(Root);
      const router = container.get(IRouter);

      const au = new Aurelia(container);
      const host = ctx.createElement('div');

      au.app({ component, host });

      await au.start();

      assertComponentsVisible(host, [Root, [A, [B]]], '1');

      await router.load('a/c@c');

      assertComponentsVisible(host, [Root, [A, [B, C]]], '2');

      await router.load('');

      assertComponentsVisible(host, [Root, [A, [B]]], '3');

      await router.load('a/(b@b+c@c)');

      assertComponentsVisible(host, [Root, [A, [B, C]]], '4');

      await router.load('a/c@b');

      assertComponentsVisible(host, [Root, [A, [C]]], '5');

      await router.load('');

      assertComponentsVisible(host, [Root, [A, [B]]], '6');

      await router.load('a/(c@b+b@c)');

      assertComponentsVisible(host, [Root, [A, [C, B]]], '7');

      await au.stop(true);
      assert.areTaskQueuesEmpty();
    });

    for (const [name, fallback] of [['ce name', 'ce-a'], ['route', 'a'], ['route-id', 'r1']]) {
      it(`will load the fallback when navigating to a non-existing route - with ${name} - with mode: ${mode}`, async function () {
        @customElement({ name: 'ce-a', template: 'a' })
        class A { }
        @route({
          routes: [
            { id: 'r1', path: 'a', component: A, transitionPlan: 'invoke-lifecycles' },
          ]
        })
        @customElement({
          name: 'root',
          template: `root<au-viewport fallback="${fallback}">`,
          dependencies: [A],
        })
        class Root { }

        const ctx = TestContext.create();
        const { container } = ctx;

        container.register(TestRouterConfiguration.for(LogLevel.warn));
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

      it(`will load the global-fallback when navigating to a non-existing route - with mode: ${mode}`, async function () {
        @customElement({ name: 'ce-a', template: 'a' })
        class A { }
        @route({
          routes: [
            { id: 'r1', path: 'a', component: A, transitionPlan: 'invoke-lifecycles' },
          ],
          fallback,
        })
        @customElement({
          name: 'root',
          template: `root<au-viewport>`,
          dependencies: [A],
        })
        class Root { }

        const ctx = TestContext.create();
        const { container } = ctx;

        container.register(TestRouterConfiguration.for(LogLevel.warn));
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

      it(`will load the global-fallback when navigating to a non-existing route - sibling - with ${name} - with mode: ${mode}`, async function () {
        @customElement({ name: 'ce-a', template: 'a' })
        class A { }
        @route({
          routes: [
            { id: 'r1', path: 'a', component: A, transitionPlan: 'invoke-lifecycles' },
          ],
          fallback,
        })
        @customElement({
          name: 'root',
          template: `root<au-viewport></au-viewport><au-viewport></au-viewport>`,
          dependencies: [A],
        })
        class Root { }

        const ctx = TestContext.create();
        const { container } = ctx;

        container.register(TestRouterConfiguration.for(LogLevel.warn));
        container.register(RouterConfiguration.customize({ resolutionMode: mode }));

        const component = container.get(Root);
        const router = container.get(IRouter);

        const au = new Aurelia(container);
        const host = ctx.createElement('div');

        au.app({ component, host });

        await au.start();

        assertComponentsVisible(host, [Root]);

        await router.load('b+c');

        assertComponentsVisible(host, [Root, [A, A]]);

        await au.stop(true);
        assert.areTaskQueuesEmpty();
      });
    }

    it(`will load the global-fallback when navigating to a non-existing route - parent-child - with mode: ${mode}`, async function () {
      @customElement({ name: 'ce-a01', template: 'ac01' })
      class Ac01 { }
      @customElement({ name: 'ce-a02', template: 'ac02' })
      class Ac02 { }

      @route({
        routes: [
          { id: 'rc1', path: 'ac01', component: Ac01, transitionPlan: 'invoke-lifecycles' },
          { id: 'rc2', path: 'ac02', component: Ac02, transitionPlan: 'invoke-lifecycles' },
        ],
        fallback: 'rc1',
      })
      @customElement({ name: 'ce-a', template: 'a<au-viewport>', dependencies: [Ac01, Ac02] })
      class A { }

      @route({
        routes: [
          { id: 'r1', path: 'a', component: A, transitionPlan: 'invoke-lifecycles' },
        ],
        fallback: 'r1',
      })
      @customElement({
        name: 'root',
        template: `root<au-viewport>`,
        dependencies: [A],
      })
      class Root { }

      const ctx = TestContext.create();
      const { container } = ctx;

      container.register(TestRouterConfiguration.for(LogLevel.warn));
      container.register(RouterConfiguration.customize({ resolutionMode: mode }));

      const component = container.get(Root);
      const router = container.get(IRouter);

      const au = new Aurelia(container);
      const host = ctx.createElement('div');

      au.app({ component, host });

      await au.start();

      assertComponentsVisible(host, [Root]);

      await router.load('a/b');

      assertComponentsVisible(host, [Root, [A, [Ac01]]]);

      await au.stop(true);
      assert.areTaskQueuesEmpty();
    });

    it(`will load the global-fallback when navigating to a non-existing route - sibling + parent-child - with mode: ${mode}`, async function () {
      @customElement({ name: 'ce-a01', template: 'ac01' })
      class Ac01 { }
      @customElement({ name: 'ce-a02', template: 'ac02' })
      class Ac02 { }

      @route({
        routes: [
          { id: 'rc1', path: 'ac01', component: Ac01, transitionPlan: 'invoke-lifecycles' },
          { id: 'rc2', path: 'ac02', component: Ac02, transitionPlan: 'invoke-lifecycles' },
        ],
        fallback: 'rc1',
      })
      @customElement({ name: 'ce-a', template: 'a<au-viewport>', dependencies: [Ac01, Ac02] })
      class A { }
      @customElement({ name: 'ce-b01', template: 'bc01' })
      class Bc01 { }
      @customElement({ name: 'ce-b02', template: 'bc02' })
      class Bc02 { }

      @route({
        routes: [
          { id: 'rc1', path: 'bc01', component: Bc01, transitionPlan: 'invoke-lifecycles' },
          { id: 'rc2', path: 'bc02', component: Bc02, transitionPlan: 'invoke-lifecycles' },
        ],
        fallback: 'rc2',
      })
      @customElement({ name: 'ce-b', template: 'b<au-viewport>', dependencies: [Bc01, Bc02] })
      class B { }

      @route({
        routes: [
          { id: 'r1', path: 'a', component: A, transitionPlan: 'invoke-lifecycles' },
          { id: 'r2', path: 'b', component: B, transitionPlan: 'invoke-lifecycles' },
        ],
        fallback: 'r1',
      })
      @customElement({
        name: 'root',
        template: `root<au-viewport></au-viewport><au-viewport></au-viewport>`,
        dependencies: [A, B],
      })
      class Root { }

      const ctx = TestContext.create();
      const { container } = ctx;

      container.register(TestRouterConfiguration.for(LogLevel.warn));
      container.register(RouterConfiguration.customize({ resolutionMode: mode }));

      const component = container.get(Root);
      const router = container.get(IRouter);

      const au = new Aurelia(container);
      const host = ctx.createElement('div');

      au.app({ component, host });

      await au.start();

      assertComponentsVisible(host, [Root]);

      await router.load('a/ac02+b/u');

      assertComponentsVisible(host, [Root, [A, [Ac02]], [B, [Bc02]]]);

      await router.load('a/u+b/bc01');

      assertComponentsVisible(host, [Root, [A, [Ac01]], [B, [Bc01]]]);

      await router.load('a/u+b/u');

      assertComponentsVisible(host, [Root, [A, [Ac01]], [B, [Bc02]]]);

      await au.stop(true);
      assert.areTaskQueuesEmpty();
    });

    it(`au-viewport#fallback precedes global fallback - with mode: ${mode}`, async function () {
      @customElement({ name: 'ce-a', template: 'a' })
      class A { }
      @customElement({ name: 'ce-b', template: 'b' })
      class B { }
      @route({
        routes: [
          { id: 'r1', path: 'a', component: A, transitionPlan: 'invoke-lifecycles' },
          { id: 'r2', path: 'b', component: B, transitionPlan: 'invoke-lifecycles' },
        ],
        fallback: 'r1',
      })
      @customElement({
        name: 'root',
        template: `root<au-viewport name="1"></au-viewport><au-viewport name="2" fallback="r2"></au-viewport>`,
        dependencies: [A, B],
      })
      class Root { }

      const ctx = TestContext.create();
      const { container } = ctx;

      container.register(TestRouterConfiguration.for(LogLevel.warn));
      container.register(RouterConfiguration.customize({ resolutionMode: mode }));

      const component = container.get(Root);
      const router = container.get(IRouter);

      const au = new Aurelia(container);
      const host = ctx.createElement('div');

      au.app({ component, host });

      await au.start();

      assertComponentsVisible(host, [Root]);

      await router.load('u1@1+u2@2');

      assertComponentsVisible(host, [Root, [A, B]]);

      await au.stop(true);
      assert.areTaskQueuesEmpty();
    });
  }

  it(`correctly parses parameters`, async function () {
    const a1Params: Params[] = [];
    const a2Params: Params[] = [];
    const b1Params: Params[] = [];
    const b2Params: Params[] = [];
    @customElement({ name: 'b1', template: null })
    class B1 {
      public load(params: Params) {
        b1Params.push(params);
      }
    }
    @customElement({ name: 'b2', template: null })
    class B2 {
      public load(params: Params) {
        b2Params.push(params);
      }
    }
    @route({
      routes: [
        { path: 'b1/:b', component: B1, transitionPlan: 'invoke-lifecycles' },
      ]
    })
    @customElement({
      name: 'a1',
      template: `<au-viewport></au-viewport>`,
      dependencies: [B1],
    })
    class A1 {
      public load(params: Params) {
        a1Params.push(params);
      }
    }
    @route({
      routes: [
        { path: 'b2/:d', component: B2, transitionPlan: 'invoke-lifecycles' },
      ]
    })
    @customElement({
      name: 'a2',
      template: `<au-viewport></au-viewport>`,
      dependencies: [B2],
    })
    class A2 {
      public load(params: Params) {
        a2Params.push(params);
      }
    }
    @route({
      routes: [
        { path: 'a1/:a', component: A1, transitionPlan: 'invoke-lifecycles' },
        { path: 'a2/:c', component: A2, transitionPlan: 'invoke-lifecycles' },
      ]
    })
    @customElement({
      name: 'root',
      template: `<au-viewport name="a1"></au-viewport><au-viewport name="a2"></au-viewport>`,
      dependencies: [A1, A2],
    })
    class Root { }

    const ctx = TestContext.create();
    const { container } = ctx;

    container.register(TestRouterConfiguration.for(LogLevel.warn));
    container.register(RouterConfiguration);

    const component = container.get(Root);
    const router = container.get(IRouter);

    const au = new Aurelia(container);
    const host = ctx.createElement('div');

    au.app({ component, host });

    await au.start();
    await router.load('a1/a/b1/b+a2/c/b2/d');
    await router.load('a1/1/b1/2+a2/3/b2/4');

    assert.deepStrictEqual(
      [
        a1Params,
        b1Params,
        a2Params,
        b2Params,
      ],
      [
        [
          { a: 'a' },
          { a: '1' },
        ],
        [
          { b: 'b' },
          { b: '2' },
        ],
        [
          { c: 'c' },
          { c: '3' },
        ],
        [
          { d: 'd' },
          { d: '4' },
        ],
      ],
    );

    await au.stop(true);
    assert.areTaskQueuesEmpty();
  });

  it('Router#load accepts route-id and params', async function () {
    const a1Params: Params[] = [];
    const a2Params: Params[] = [];
    const a1Query: [string, string][][] = [];
    const a2Query: [string, string][][] = [];

    @customElement({
      name: 'a1',
      template: '',
    })
    class A1 implements IRouteViewModel {
      public load(params: Params, next: RouteNode) {
        a1Params.push(params);
        a1Query.push(Array.from(next.queryParams.entries()));
      }
    }

    @customElement({
      name: 'a2',
      template: '',
    })
    class A2 implements IRouteViewModel {
      public load(params: Params, next: RouteNode) {
        a2Params.push(params);
        a2Query.push(Array.from(next.queryParams.entries()));
      }
    }
    @route({
      routes: [
        { id: 'a1', path: 'a1/:a', component: A1 },
        { id: 'a2', path: 'a2/:c', component: A2 },
      ]
    })
    @customElement({
      name: 'root',
      template: `<au-viewport></au-viewport>`,
      dependencies: [A1, A2],
    })
    class Root { }

    const ctx = TestContext.create();
    const { container } = ctx;

    const pushedUrls: string[] = [];
    container.register(Registration.instance(
      IHistory,
      {
        pushState(_: {} | null, __: string, url: string) {
          pushedUrls.push(url);
        },
        replaceState: noop,
      }
    ));
    container.register(TestRouterConfiguration.for(LogLevel.warn));
    container.register(RouterConfiguration);

    const component = container.get(Root);
    const router = container.get(IRouter);

    const au = new Aurelia(container);
    const host = ctx.createElement('div');

    au.app({ component, host });

    await au.start();

    await router.load('a1', { params: { a: '12' } });
    let url = pushedUrls.pop();
    assert.match(url, /a1\/12$/, 'url1');

    await router.load('a2', { params: { c: '45' } });
    url = pushedUrls.pop();
    assert.match(url, /a2\/45$/, 'url1');

    await router.load('a1', { params: { a: '21', b: '34' } });
    url = pushedUrls.pop();
    assert.match(url, /a1\/21\?b=34$/, 'url1');

    await router.load('a2', { params: { a: '67', c: '54' } });
    url = pushedUrls.pop();
    assert.match(url, /a2\/54\?a=67$/, 'url1');

    assert.deepStrictEqual(
      [
        a1Params,
        a2Params,
      ],
      [
        [
          { a: '12' },
          { a: '21' },
        ],
        [
          { c: '45' },
          { c: '54' },
        ],
      ],
    );
    assert.deepStrictEqual(
      [
        a1Query,
        a2Query
      ],
      [
        [
          [],
          [['b', '34']],
        ],
        [
          [],
          [['a', '67']],
        ],
      ]
    );

    await au.stop(true);
    assert.areTaskQueuesEmpty();
  });

  // TODO(sayan): add more tests for parameter parsing with multiple route parameters including optional parameter.

  it('does not interfere with standard "href" attribute', async function () {
    const ctx = TestContext.create();
    const { container } = ctx;

    container.register(TestRouterConfiguration.for(LogLevel.debug));
    container.register(RouterConfiguration);

    const component = container.get(CustomElement.define(
      { name: 'app', template: '<a href.bind="href">' },
      class App { public href = 'abc'; }
    ));

    const au = new Aurelia(container);
    const host = ctx.createElement('div');

    await au.app({ component, host }).start();

    assert.strictEqual(host.querySelector('a').getAttribute('href'), 'abc');

    component.href = null;
    ctx.platform.domWriteQueue.flush();

    assert.strictEqual(host.querySelector('a').getAttribute('href'), null);

    await au.stop();
  });

  {
    @customElement({ name: 'vm-a', template: `view-a foo: \${params.foo} | query: \${query.toString()}` })
    class VmA {
      public params!: Params;
      public query!: Readonly<URLSearchParams>;

      public load(params: Params, next: RouteNode) {
        this.params = params;
        this.query = next.queryParams;
      }
    }
    @customElement({ name: 'vm-b', template: 'view-b' })
    class VmB {
      public constructor(
        @IRouter public readonly router: IRouter,
      ) { }
      public async redirect1() {
        await this.router.load('a?foo=bar');
      }
      public async redirect2() {
        await this.router.load('a', { queryParams: { foo: 'bar' } });
      }
      public async redirect3() {
        await this.router.load('a?foo=fizz', { queryParams: { foo: 'bar' } });
      }
      public async redirect4() {
        await this.router.load('a/fizz', { queryParams: { foo: 'bar' } });
      }
    }

    @route({
      title: 'base',
      routes: [
        { path: ['a', 'a/:foo'], component: VmA, title: 'A', transitionPlan: 'invoke-lifecycles', },
        { path: ['', 'b'], component: VmB, title: 'B', transitionPlan: 'invoke-lifecycles' },
      ],
    })
    @customElement({ name: 'app-root', template: '<au-viewport></au-viewport>' })
    class AppRoot { }

    async function start(buildTitle: IRouterOptions['buildTitle'] | null = null) {
      const ctx = TestContext.create();
      const { container } = ctx;

      container.register(
        TestRouterConfiguration.for(LogLevel.warn),
        RouterConfiguration.customize({ buildTitle }),
      );

      const au = new Aurelia(container);
      const host = ctx.createElement('div');

      await au.app({ component: AppRoot, host }).start();
      return { host, au, container };
    }

    it('queryString - #1', async function () {
      const { host, au } = await start();
      const vmb = CustomElement.for<VmB>(host.querySelector('vm-b')).viewModel;

      await vmb.redirect1();

      assert.html.textContent(host, 'view-a foo: undefined | query: foo=bar');

      await au.stop();
    });

    it('queryString - #2', async function () {
      const { host, au } = await start();
      const vmb = CustomElement.for<VmB>(host.querySelector('vm-b')).viewModel;

      await vmb.redirect2();

      assert.html.textContent(host, 'view-a foo: undefined | query: foo=bar');

      await au.stop();
    });

    it('queryString - #3', async function () {
      const { host, au } = await start();
      const vmb = CustomElement.for<VmB>(host.querySelector('vm-b')).viewModel;

      await vmb.redirect3();

      assert.html.textContent(host, 'view-a foo: undefined | query: foo=bar');

      await au.stop();
    });

    it('queryString - #4', async function () {
      const { host, au } = await start();
      const vmb = CustomElement.for<VmB>(host.querySelector('vm-b')).viewModel;

      await vmb.redirect4();

      assert.html.textContent(host, 'view-a foo: fizz | query: foo=bar');

      await au.stop();
    });

    it('shows title correctly', async function () {
      const { host, au, container } = await start();
      assert.strictEqual(container.get(IPlatform).document.title, 'B | base');
      const vmb = CustomElement.for<VmB>(host.querySelector('vm-b')).viewModel;

      await vmb.redirect1();

      assert.strictEqual(container.get(IPlatform).document.title, 'A | base');

      await au.stop();
    });

    it('respects custom buildTitle', async function () {
      const { host, au, container } = await start((tr) => {
        const root = tr.routeTree.root;
        return `${root.context.definition.config.title} - ${root.children.map(c => c.title).join(' - ')}`;
      });
      assert.strictEqual(container.get(IPlatform).document.title, 'base - B');
      const vmb = CustomElement.for<VmB>(host.querySelector('vm-b')).viewModel;

      await vmb.redirect1();

      assert.strictEqual(container.get(IPlatform).document.title, 'base - A');

      await au.stop();
    });

    // TODO(sayan): add more tests for title involving children and sibling routes
  }

  // TODO(sayan): add tests here for the location URL building in relation for sibling, parent/children relationship and viewport name

  describe('navigation plan', function () {

    function getNavBarCe(hasAsyncRouteConfig: boolean = false) {
      @valueConverter('firstNonEmpty')
      class FirstNonEmpty {
        public toView(paths: string[]): string {
          for (const path of paths) {
            if (path) return path;
          }
        }
      }

      @customElement({
        name: 'nav-bar',
        template: `<nav>
        <ul>
          <li repeat.for="route of navModel.routes"><a href.bind="route.path | firstNonEmpty" active.class="route.isActive">\${route.title}</a></li>
        </ul>
      </nav>`,
        dependencies: [FirstNonEmpty]
      })
      class NavBar implements ICustomElementViewModel {
        private readonly navModel: INavigationModel;
        public constructor(
          @IRouteContext routeCtx: IRouteContext,
          @INode private readonly node: INode,
        ) {
          this.navModel = routeCtx.navigationModel;
        }

        public binding(_initiator: IHydratedController, _parent: IHydratedController, _flags: LifecycleFlags): void | Promise<void> {
          if (hasAsyncRouteConfig) return this.navModel.resolve();
        }

        public assert(expected: { href: string; text: string; active?: boolean }[], message: string = ''): void {
          const anchors = Array.from((this.node as HTMLElement).querySelector('nav').querySelectorAll<HTMLAnchorElement>('a'));
          const len = anchors.length;
          assert.strictEqual(len, expected.length, `${message} length`);
          for (let i = 0; i < len; i++) {
            const anchor = anchors[i];
            const item = expected[i];
            assert.strictEqual(anchor.href.endsWith(item.href), true, `${message} - #${i} href - actual: ${anchor.href} - expected: ${item.href}`);
            assert.html.textContent(anchor, item.text, `${message} - #${i} text`);
            assert.strictEqual(anchor.classList.contains('active'), !!item.active, `${message} - #${i} active`);
          }
        }
      }
      return NavBar;
    }

    it('route deco', async function () {
      @customElement({ name: 'ce-c11', template: 'c11' })
      class C11 { }
      @customElement({ name: 'ce-c12', template: 'c12' })
      class C12 { }
      @customElement({ name: 'ce-c21', template: 'c21' })
      class C21 { }
      @customElement({ name: 'ce-c22', template: 'c22' })
      class C22 { }

      @route({
        routes: [
          { path: ['', 'c11'], component: C11, title: 'C11' },
          { path: 'c12', component: C12, title: 'C12' },
        ]
      })
      @customElement({ name: 'ce-p1', template: '<nav-bar></nav-bar> p1 <au-viewport></au-viewport>' })
      class P1 { }

      @route({
        routes: [
          { path: 'c21', component: C21, title: 'C21' },
          { path: ['', 'c22'], component: C22, title: 'C22' },
        ]
      })
      @customElement({ name: 'ce-p2', template: '<nav-bar></nav-bar> p2 <au-viewport></au-viewport>' })
      class P2 { }
      @customElement({ name: 'ce-p3', template: 'p3' })
      class P3 { }

      @route({
        routes: [
          { path: ['', 'p1'], component: P1, title: 'P1' },
          { path: 'p2', component: P2, title: 'P2' },
          { path: 'p3', component: P3, title: 'P3', nav: false },
        ]
      })
      @customElement({ name: 'ro-ot', template: '<nav-bar></nav-bar> root <au-viewport></au-viewport>' })
      class Root { }

      const ctx = TestContext.create();
      const { container } = ctx;

      const navBarCe = getNavBarCe();
      container.register(
        StandardConfiguration,
        TestRouterConfiguration.for(LogLevel.warn),
        RouterConfiguration,
        C11,
        C12,
        C21,
        C22,
        P1,
        P2,
        P3,
        navBarCe
      );

      const au = new Aurelia(container);
      const host = ctx.createElement('div');

      await au.app({ component: Root, host }).start();

      const queue = container.get(IPlatform).domWriteQueue;
      const router = container.get(IRouter);

      // Start
      await queue.yield();
      type NavBar = InstanceType<typeof navBarCe>;
      const rootNavbar = CustomElement.for<NavBar>(host.querySelector('nav-bar')).viewModel;
      rootNavbar.assert([{ href: 'p1', text: 'P1', active: true }, { href: 'p2', text: 'P2', active: false }], 'start root');
      let childNavBar = CustomElement.for<NavBar>(host.querySelector('ce-p1>nav-bar')).viewModel;
      childNavBar.assert([{ href: 'c11', text: 'C11', active: true }, { href: 'c12', text: 'C12', active: false }], 'start child navbar');

      // Round#1
      await router.load('p2');
      await queue.yield();
      rootNavbar.assert([{ href: 'p1', text: 'P1', active: false }, { href: 'p2', text: 'P2', active: true }], 'round#1 root');
      childNavBar = CustomElement.for<NavBar>(host.querySelector('ce-p2>nav-bar')).viewModel;
      childNavBar.assert([{ href: 'c21', text: 'C21', active: false }, { href: 'c22', text: 'C22', active: true }], 'round#1 child navbar');

      // Round#2
      await router.load('p1/c12');
      await queue.yield();
      rootNavbar.assert([{ href: 'p1', text: 'P1', active: true }, { href: 'p2', text: 'P2', active: false }], 'round#2 root');
      childNavBar = CustomElement.for<NavBar>(host.querySelector('ce-p1>nav-bar')).viewModel;
      childNavBar.assert([{ href: 'c11', text: 'C11', active: false }, { href: 'c12', text: 'C12', active: true }], 'round#2 navbar');

      // Round#3
      await router.load('p2/c21');
      await queue.yield();
      rootNavbar.assert([{ href: 'p1', text: 'P1', active: false }, { href: 'p2', text: 'P2', active: true }], 'round#3 root');
      childNavBar = CustomElement.for<NavBar>(host.querySelector('ce-p2>nav-bar')).viewModel;
      childNavBar.assert([{ href: 'c21', text: 'C21', active: true }, { href: 'c22', text: 'C22', active: false }], 'round#3 navbar');

      // Round#4 - nav:false, but routeable
      await router.load('p3');
      await queue.yield();
      rootNavbar.assert([{ href: 'p1', text: 'P1', active: false }, { href: 'p2', text: 'P2', active: false }], 'round#4 root');
      assert.notEqual(host.querySelector('ce-p3'), null);

      await au.stop();
    });

    it('getRouteConfig hook', async function () {
      @customElement({ name: 'ce-c11', template: 'c11' })
      class C11 { }
      @customElement({ name: 'ce-c12', template: 'c12' })
      class C12 { }
      @customElement({ name: 'ce-c21', template: 'c21' })
      class C21 { }
      @customElement({ name: 'ce-c22', template: 'c22' })
      class C22 { }

      @customElement({ name: 'ce-p1', template: '<nav-bar></nav-bar> p1 <au-viewport></au-viewport>' })
      class P1 implements IRouteViewModel {
        public getRouteConfig(_parentDefinition: RouteDefinition, _routeNode: RouteNode): IRouteConfig {
          return {
            routes: [
              { path: ['', 'c11'], component: C11, title: 'C11' },
              { path: 'c12', component: C12, title: 'C12' },
            ]
          };
        }
      }

      @customElement({ name: 'ce-p2', template: '<nav-bar></nav-bar> p2 <au-viewport></au-viewport>' })
      class P2 implements IRouteViewModel {
        public getRouteConfig(_parentDefinition: RouteDefinition, _routeNode: RouteNode): IRouteConfig {
          return {
            routes: [
              { path: 'c21', component: C21, title: 'C21' },
              { path: ['', 'c22'], component: C22, title: 'C22' },
            ]
          };
        }
      }
      @customElement({ name: 'ce-p3', template: 'p3' })
      class P3 { }

      @customElement({ name: 'ro-ot', template: '<nav-bar></nav-bar> root <au-viewport></au-viewport>' })
      class Root implements IRouteViewModel {
        public getRouteConfig(_parentDefinition: RouteDefinition, _routeNode: RouteNode): IRouteConfig {
          return {
            routes: [
              { path: ['', 'p1'], component: P1, title: 'P1' },
              { path: 'p2', component: P2, title: 'P2' },
              { path: 'p3', component: P3, title: 'P3', nav: false },
            ]
          };
        }
      }

      const ctx = TestContext.create();
      const { container } = ctx;

      const navBarCe = getNavBarCe();
      container.register(
        StandardConfiguration,
        TestRouterConfiguration.for(LogLevel.warn),
        RouterConfiguration,
        C11,
        C12,
        C21,
        C22,
        P1,
        P2,
        P3,
        navBarCe
      );

      const au = new Aurelia(container);
      const host = ctx.createElement('div');

      await au.app({ component: Root, host }).start();

      const queue = container.get(IPlatform).domWriteQueue;
      const router = container.get(IRouter);

      // Start
      await queue.yield();
      type NavBar = InstanceType<typeof navBarCe>;
      const rootNavbar = CustomElement.for<NavBar>(host.querySelector('nav-bar')).viewModel;
      rootNavbar.assert([{ href: 'p1', text: 'P1', active: true }, { href: 'p2', text: 'P2', active: false }], 'start root');
      let childNavBar = CustomElement.for<NavBar>(host.querySelector('ce-p1>nav-bar')).viewModel;
      childNavBar.assert([{ href: 'c11', text: 'C11', active: true }, { href: 'c12', text: 'C12', active: false }], 'start child navbar');

      // Round#1
      await router.load('p2');
      await queue.yield();
      rootNavbar.assert([{ href: 'p1', text: 'P1', active: false }, { href: 'p2', text: 'P2', active: true }], 'round#1 root');
      childNavBar = CustomElement.for<NavBar>(host.querySelector('ce-p2>nav-bar')).viewModel;
      childNavBar.assert([{ href: 'c21', text: 'C21', active: false }, { href: 'c22', text: 'C22', active: true }], 'round#1 child navbar');

      // Round#2
      await router.load('p1/c12');
      await queue.yield();
      rootNavbar.assert([{ href: 'p1', text: 'P1', active: true }, { href: 'p2', text: 'P2', active: false }], 'round#2 root');
      childNavBar = CustomElement.for<NavBar>(host.querySelector('ce-p1>nav-bar')).viewModel;
      childNavBar.assert([{ href: 'c11', text: 'C11', active: false }, { href: 'c12', text: 'C12', active: true }], 'round#2 navbar');

      // Round#3
      await router.load('p2/c21');
      await queue.yield();
      rootNavbar.assert([{ href: 'p1', text: 'P1', active: false }, { href: 'p2', text: 'P2', active: true }], 'round#3 root');
      childNavBar = CustomElement.for<NavBar>(host.querySelector('ce-p2>nav-bar')).viewModel;
      childNavBar.assert([{ href: 'c21', text: 'C21', active: true }, { href: 'c22', text: 'C22', active: false }], 'round#3 navbar');

      // Round#4 - nav:false, but routeable
      await router.load('p3');
      await queue.yield();
      rootNavbar.assert([{ href: 'p1', text: 'P1', active: false }, { href: 'p2', text: 'P2', active: false }], 'round#4 root');
      assert.notEqual(host.querySelector('ce-p3'), null);

      await au.stop();
    });

    it('async configuration', async function () {
      @customElement({ name: 'ce-c11', template: 'c11' })
      class C11 { }
      @customElement({ name: 'ce-c12', template: 'c12' })
      class C12 { }
      @customElement({ name: 'ce-c21', template: 'c21' })
      class C21 { }
      @customElement({ name: 'ce-c22', template: 'c22' })
      class C22 { }

      @customElement({ name: 'ce-p1', template: '<nav-bar></nav-bar> p1 <au-viewport></au-viewport>' })
      class P1 implements IRouteViewModel {
        public getRouteConfig(_parentDefinition: RouteDefinition, _routeNode: RouteNode): IRouteConfig {
          return {
            routes: [
              { path: ['', 'c11'], component: Promise.resolve({ C11 }), title: 'C11' },
              { path: 'c12', component: C12, title: 'C12' },
            ]
          };
        }
      }

      @customElement({ name: 'ce-p2', template: '<nav-bar></nav-bar> p2 <au-viewport></au-viewport>' })
      class P2 implements IRouteViewModel {
        public getRouteConfig(_parentDefinition: RouteDefinition, _routeNode: RouteNode): IRouteConfig {
          return {
            routes: [
              { path: 'c21', component: Promise.resolve({ C21 }), title: 'C21' },
              { path: ['', 'c22'], component: C22, title: 'C22' },
            ]
          };
        }
      }
      @route({ path: 'p3', title: 'P3', nav: false })
      @customElement({ name: 'ce-p3', template: 'p3' })
      class P3 { }

      @customElement({ name: 'ro-ot', template: '<nav-bar></nav-bar> root <au-viewport></au-viewport>' })
      class Root implements IRouteViewModel {
        public getRouteConfig(_parentDefinition: RouteDefinition, _routeNode: RouteNode): IRouteConfig {
          return {
            routes: [
              { path: ['', 'p1'], component: Promise.resolve({ P1 }), title: 'P1' },
              { path: 'p2', component: P2, title: 'P2' },
              Promise.resolve({ P3 }),
            ]
          };
        }
      }

      const ctx = TestContext.create();
      const { container } = ctx;

      const navBarCe = getNavBarCe(true);
      container.register(
        StandardConfiguration,
        TestRouterConfiguration.for(LogLevel.warn),
        RouterConfiguration,
        C11,
        C12,
        C21,
        C22,
        P1,
        P2,
        P3,
        navBarCe
      );

      const au = new Aurelia(container);
      const host = ctx.createElement('div');

      await au.app({ component: Root, host }).start();

      const queue = container.get(IPlatform).domWriteQueue;
      const router = container.get(IRouter);

      // Start
      await queue.yield();
      type NavBar = InstanceType<typeof navBarCe>;
      const rootNavbar = CustomElement.for<NavBar>(host.querySelector('nav-bar')).viewModel;
      rootNavbar.assert([{ href: 'p1', text: 'P1', active: true }, { href: 'p2', text: 'P2', active: false }], 'start root');
      let childNavBar = CustomElement.for<NavBar>(host.querySelector('ce-p1>nav-bar')).viewModel;
      childNavBar.assert([{ href: 'c11', text: 'C11', active: true }, { href: 'c12', text: 'C12', active: false }], 'start child navbar');

      // Round#1
      await router.load('p2');
      await queue.yield();
      rootNavbar.assert([{ href: 'p1', text: 'P1', active: false }, { href: 'p2', text: 'P2', active: true }], 'round#1 root');
      childNavBar = CustomElement.for<NavBar>(host.querySelector('ce-p2>nav-bar')).viewModel;
      childNavBar.assert([{ href: 'c21', text: 'C21', active: false }, { href: 'c22', text: 'C22', active: true }], 'round#1 child navbar');

      // Round#2
      await router.load('p1/c12');
      await queue.yield();
      rootNavbar.assert([{ href: 'p1', text: 'P1', active: true }, { href: 'p2', text: 'P2', active: false }], 'round#2 root');
      childNavBar = CustomElement.for<NavBar>(host.querySelector('ce-p1>nav-bar')).viewModel;
      childNavBar.assert([{ href: 'c11', text: 'C11', active: false }, { href: 'c12', text: 'C12', active: true }], 'round#2 navbar');

      // Round#3
      await router.load('p2/c21');
      await queue.yield();
      rootNavbar.assert([{ href: 'p1', text: 'P1', active: false }, { href: 'p2', text: 'P2', active: true }], 'round#3 root');
      childNavBar = CustomElement.for<NavBar>(host.querySelector('ce-p2>nav-bar')).viewModel;
      childNavBar.assert([{ href: 'c21', text: 'C21', active: true }, { href: 'c22', text: 'C22', active: false }], 'round#3 navbar');

      // Round#4 - nav:false, but routeable
      await router.load('p3');
      await queue.yield();
      rootNavbar.assert([{ href: 'p1', text: 'P1', active: false }, { href: 'p2', text: 'P2', active: false }], 'round#4 root');
      assert.notEqual(host.querySelector('ce-p3'), null);

      await au.stop();
    });
  });

  it('isNavigating indicates router\'s navigation status', async function () {

    @customElement({ name: 'ce-p1', template: 'p1' })
    class P1 { }

    @customElement({ name: 'ce-p2', template: 'p2' })
    class P2 { }
    @route({
      routes: [
        { path: ['', 'p1'], component: P1, title: 'P1' },
        { path: 'p2', component: P2, title: 'P2' },
      ]
    })
    @customElement({ name: 'ro-ot', template: '<nav-bar></nav-bar> root <au-viewport></au-viewport>' })
    class Root {
      public isNavigatingLog: boolean[] = [];
      public constructor(
        @IRouter private readonly router: IRouter,
      ) { }

      @watch<Root>(root => root['router'].isNavigating)
      public logIsNavigating(isNavigating: boolean) {
        this.isNavigatingLog.push(isNavigating);
      }
    }

    const ctx = TestContext.create();
    const { container } = ctx;

    container.register(
      StandardConfiguration,
      TestRouterConfiguration.for(LogLevel.warn),
      RouterConfiguration,
      P1,
      P2,
    );

    const au = new Aurelia(container);
    const host = ctx.createElement('div');

    await au.app({ component: Root, host }).start();

    const log = (au.root.controller.viewModel as Root).isNavigatingLog;
    assert.deepStrictEqual(log, [true, false]);

    log.length = 0;
    await container.get(IRouter).load('p2');
    assert.deepStrictEqual(log, [true, false]);

    await au.stop();
  });

  it('custom base path can be configured', async function () {
    @customElement({ name: 'ce-p1', template: 'p1' })
    class P1 { }

    @customElement({ name: 'ce-p2', template: 'p2' })
    class P2 { }
    @route({
      routes: [
        { path: 'p1', component: P1, title: 'P1' },
        { path: 'p2', component: P2, title: 'P2' },
      ]
    })
    @customElement({ name: 'ro-ot', template: '<a load="p1"></a><a load="p2"></a><au-viewport></au-viewport>' })
    class Root { }

    const ctx = TestContext.create();
    const { container } = ctx;
    // mocked window
    container.register(Registration.instance(IWindow, {
      document: {
        baseURI: 'https://portal.example.com/',
      },
      removeEventListener() { /** noop */ },
      addEventListener() { /** noop */ },
    }));

    container.register(
      StandardConfiguration,
      TestRouterConfiguration.for(LogLevel.warn),
      RouterConfiguration.customize({ basePath: '/mega-dodo/guide1/' }),
      P1,
      P2,
    );

    const au = new Aurelia(container);
    const host = ctx.createElement('div');

    await au.app({ component: Root, host }).start();

    const anchors = Array.from(host.querySelectorAll('a'));
    assert.deepStrictEqual(anchors.map(a => a.href), ['https://portal.example.com/mega-dodo/guide1/p1', 'https://portal.example.com/mega-dodo/guide1/p2']);

    assert.strictEqual(host.querySelector('ce-p1'), null);
    assert.strictEqual(host.querySelector('ce-p2'), null);

    anchors[0].click();
    const queue = container.get(IPlatform).domWriteQueue;
    await queue.yield();

    assert.notEqual(host.querySelector('ce-p1'), null);
    assert.strictEqual(host.querySelector('ce-p2'), null);

    anchors[1].click();
    await queue.yield();

    assert.strictEqual(host.querySelector('ce-p1'), null);
    assert.notEqual(host.querySelector('ce-p2'), null);

    const router = container.get(IRouter);
    await router.load('/mega-dodo/guide1/p1');

    assert.notEqual(host.querySelector('ce-p1'), null);
    assert.strictEqual(host.querySelector('ce-p2'), null);

    await router.load('/mega-dodo/guide1/p2');

    assert.strictEqual(host.querySelector('ce-p1'), null);
    assert.notEqual(host.querySelector('ce-p2'), null);

    await au.stop();
  });

  it('multiple paths can redirect to same path', async function () {
    @customElement({ name: 'ce-p1', template: 'p1' })
    class P1 { }

    @customElement({ name: 'ce-p2', template: 'p2' })
    class P2 { }
    @route({
      routes: [
        { path: ['', 'foo'], redirectTo: 'p2'    },
        { path: 'p1', component: P1, title: 'P1' },
        { path: 'p2', component: P2, title: 'P2' },
      ]
    })
    @customElement({ name: 'ro-ot', template: '<au-viewport></au-viewport>' })
    class Root { }

    const ctx = TestContext.create();
    const { container } = ctx;
    container.register(
      StandardConfiguration,
      TestRouterConfiguration.for(LogLevel.warn),
      RouterConfiguration,
      P1,
      P2,
    );

    const au = new Aurelia(container);
    const host = ctx.createElement('div');
    const router = container.get(IRouter);

    await au.app({ component: Root, host }).start();

    assert.html.textContent(host, 'p2');

    await router.load('p1');
    assert.html.textContent(host, 'p1');

    await router.load('foo');
    assert.html.textContent(host, 'p2');

    await au.stop();
  });

  it('route generation', async function () {
    @customElement({ name: 'fo-o', template: '' })
    class Foo { }
    @customElement({ name: 'ba-r', template: '' })
    class Bar { }
    @customElement({ name: 'fi-zz', template: '' })
    class Fizz { }

    @route({
      routes: [
        { id: 'foo', path: ['foo/:id', 'foo/:id/bar/:a'], component: Foo },
        { id: 'bar', path: ['bar/:id'], component: Bar },
        { id: 'fizz', path: ['fizz/:x', 'fizz/:y/:x'], component: Fizz },
      ]
    })
    @customElement({
      name: 'ro-ot',
      template: `<au-viewport></au-viewport>`
    })
    class Root { }

    const ctx = TestContext.create();
    const { container } = ctx;

    container.register(
      StandardConfiguration,
      TestRouterConfiguration.for(LogLevel.warn),
      RouterConfiguration,
      Foo,
      Bar,
    );

    const au = new Aurelia(container);
    const host = ctx.createElement('div');

    await au.app({ component: Root, host }).start();

    const location = container.get(ILocation) as unknown as MockBrowserHistoryLocation;
    const router = container.get(IRouter);

    await router.load('foo', { params: { id: '1', a: '3' } });
    assert.match(location.path, /foo\/1\/bar\/3$/);

    await router.load('foo', { params: { id: '1', b: '3' } });
    assert.match(location.path, /foo\/1\?b=3$/);

    try {
      await router.load('bar', { params: { x: '1' } });
      assert.fail('expected error1');
    } catch (er) {
      assert.match((er as Error).message, /No value for the required parameter 'id'/);
    }

    try {
      await router.load('fizz', { params: { id: '1' } });
      assert.fail('expected error2');
    } catch (er) {
      assert.match(
        (er as Error).message,
        /required parameter 'x'.+path: 'fizz\/:x'.+required parameter 'y'.+path: 'fizz\/:y\/:x'/
      );
    }

    await au.stop();
  });
});
