import { LogLevel, Constructable, kebabCase, ILogConfig, Registration, noop, IModule } from '@aurelia/kernel';
import { assert, MockBrowserHistoryLocation, TestContext } from '@aurelia/testing';
import { RouterConfiguration, IRouter, NavigationInstruction, IRouteContext, RouteNode, Params, route, INavigationModel, IRouterOptions, IRouteViewModel, IRouteConfig, RouteDefinition, Router, HistoryStrategy, IRouterEvents } from '@aurelia/router-lite';
import { LifecycleFlags, Aurelia, valueConverter, customElement, CustomElement, ICustomElementViewModel, IHistory, IHydratedController, ILocation, INode, IPlatform, IWindow, StandardConfiguration, watch } from '@aurelia/runtime-html';

import { TestRouterConfiguration } from './_shared/configuration.js';
import { start } from './_shared/create-fixture.js';

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
  container.register(RouterConfiguration);
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

  it(`root1 correctly handles canUnload with load b11/b01,a01 in order`, async function () {
    const { router, host, tearDown } = await createFixture(Root1, Z);

    let result = await router.load({ component: B11, children: [B01] });
    assertComponentsVisible(host, [Root1, B11, B01]);
    assert.strictEqual(result, true, '#1 result===true');

    result = await router.load({ component: B11, children: [A01] });
    assertComponentsVisible(host, [Root1, B11, A01]);
    assert.strictEqual(result, true, '#2 result===true');

    await tearDown();
  });

  it(`root1 correctly handles canUnload with load b11/b02,a01 in order`, async function () {
    const { router, host, tearDown } = await createFixture(Root1, Z);

    let result = await router.load({ component: B11, children: [B02] });
    assertComponentsVisible(host, [Root1, B11, B02]);
    assert.strictEqual(result, true, '#1 result===true');

    result = await router.load(A01);
    assertComponentsVisible(host, [Root1, B11, B02]);
    assert.strictEqual(result, false, '#2 result===false');

    await tearDown();
  });

  it(`root1 correctly handles canUnload with load b11/b02,a01,a02 in order`, async function () {
    const { router, host, tearDown } = await createFixture(Root1, Z);

    let result = await router.load({ component: B11, children: [B02] });
    assertComponentsVisible(host, [Root1, B11, B02], '#1');
    assert.strictEqual(result, true, '#1 result===true');

    result = await router.load(A01);
    assertComponentsVisible(host, [Root1, B11, B02], '#2');
    assert.strictEqual(result, false, '#2 result===false');

    result = await router.load(A02);
    assertComponentsVisible(host, [Root1, B11, B02], '#3');
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

  it('can load single anonymous default at the root', async function () {
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

    container.register(TestRouterConfiguration.for(LogLevel.warn));
    container.register(RouterConfiguration);

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

  it('can load a named default with one sibling at the root', async function () {
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

    container.register(TestRouterConfiguration.for(LogLevel.warn));
    container.register(RouterConfiguration);

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

  it('can load a named default with one sibling at a child', async function () {
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
    container.register(RouterConfiguration);

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
    it(`will load the fallback when navigating to a non-existing route - with ${name} - viewport`, async function () {
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
      })
      class Root { }

      const ctx = TestContext.create();
      const { container } = ctx;

      container.register(
        TestRouterConfiguration.for(LogLevel.warn),
        RouterConfiguration,
        A,
      );

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

    it(`will load the global-fallback when navigating to a non-existing route - with ${name}`, async function () {
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
      })
      class Root { }

      const ctx = TestContext.create();
      const { container } = ctx;

      container.register(
        TestRouterConfiguration.for(LogLevel.warn),
        RouterConfiguration,
        A,
      );

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

    it(`will load the global-fallback when navigating to a non-existing route - sibling - with ${name}`, async function () {
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
      })
      class Root { }

      const ctx = TestContext.create();
      const { container } = ctx;

      container.register(
        TestRouterConfiguration.for(LogLevel.warn),
        RouterConfiguration,
        A,
      );

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

  it('will load the global-fallback when navigating to a non-existing route - with ce-name - with empty route', async function () {
    @customElement({ name: 'ce-a', template: 'a' })
    class A { }
    @customElement({ name: 'n-f', template: 'nf' })
    class NF { }
    @route({
      routes: [
        { id: 'r1', path: ['', 'a'], component: A, transitionPlan: 'invoke-lifecycles' },
        { id: 'r2', path: ['nf'], component: NF, transitionPlan: 'invoke-lifecycles' },
      ],
      fallback: 'n-f',
    })
    @customElement({
      name: 'root',
      template: `root<au-viewport>`,
    })
    class Root { }

    const ctx = TestContext.create();
    const { container } = ctx;

    container.register(
      TestRouterConfiguration.for(LogLevel.warn),
      RouterConfiguration,
      NF,
    );

    const component = container.get(Root);
    const router = container.get(IRouter);

    const au = new Aurelia(container);
    const host = ctx.createElement('div');

    au.app({ component, host });

    await au.start();

    assertComponentsVisible(host, [Root, [A]]);

    await router.load('b');

    assertComponentsVisible(host, [Root, [NF]]);

    await au.stop(true);
    assert.areTaskQueuesEmpty();
  });

  it('will load the global-fallback when navigating to a non-existing route - parent-child', async function () {
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
    container.register(RouterConfiguration);

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

  it('will load the global-fallback when navigating to a non-existing route - sibling + parent-child', async function () {
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
    container.register(RouterConfiguration);

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

  it('au-viewport#fallback precedes global fallback', async function () {
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
    container.register(RouterConfiguration);

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

  for (const attr of ['href', 'load']) {
    it(`will load the root-level fallback when navigating to a non-existing route - parent-child - children without fallback - attr: ${attr}`, async function () {
      @customElement({ name: 'gc-11', template: 'gc11' })
      class GrandChildOneOne { }

      @customElement({ name: 'gc-12', template: 'gc12' })
      class GrandChildOneTwo { }

      @route({
        routes: [
          { id: 'gc11', path: ['', 'gc11'], component: GrandChildOneOne },
          { id: 'gc12', path: 'gc12', component: GrandChildOneTwo },
        ],
      })
      @customElement({
        name: 'c-one',
        template: `c1 <br>
  <nav>
    <a ${attr}="gc11">gc11</a>
    <a ${attr}="gc12">gc12</a>
    <a ${attr}="c2">c2 (doesn't work)</a>
    <a ${attr}="../c2">../c2 (works)</a>
  </nav>
  <br>
  <au-viewport></au-viewport>`,
      })
      class ChildOne { }

      @customElement({ name: 'gc-21', template: 'gc21' })
      class GrandChildTwoOne { }

      @customElement({ name: 'gc-22', template: 'gc22' })
      class GrandChildTwoTwo { }

      @route({
        routes: [
          { id: 'gc21', path: ['', 'gc21'], component: GrandChildTwoOne },
          { id: 'gc22', path: 'gc22', component: GrandChildTwoTwo },
        ],
      })
      @customElement({
        name: 'c-two',
        template: `c2 <br>
  <nav>
    <a ${attr}="gc21">gc21</a>
    <a ${attr}="gc22">gc22</a>
    <a ${attr}="c1">c1 (doesn't work)</a>
    <a ${attr}="../c1">../c1 (works)</a>
  </nav>
  <br>
  <au-viewport></au-viewport>`,
      })
      class ChildTwo { }

      @customElement({
        name: 'not-found',
        template: 'nf',
      })
      class NotFound { }

      @route({
        routes: [
          {
            path: ['', 'c1'],
            component: ChildOne,
          },
          {
            path: 'c2',
            component: ChildTwo,
          },
          {
            path: 'not-found',
            component: NotFound,
          },
        ],
        fallback: 'not-found',
      })
      @customElement({
        name: 'my-app',
        template: `<nav>
  <a ${attr}="c1">C1</a>
  <a ${attr}="c2">C2</a>
</nav>

<au-viewport></au-viewport>` })
      class Root { }

      const { au, container, host } = await start({
        appRoot: Root,
        registrations: [
          NotFound,
        ]
      });

      const queue = container.get(IPlatform).domWriteQueue;

      const rootVp = host.querySelector('au-viewport');
      let childVp = rootVp.querySelector('au-viewport');
      assert.html.textContent(childVp, 'gc11');

      let [, a2, nf, f] = Array.from(rootVp.querySelectorAll('a'));
      a2.click();
      queue.flush();
      await queue.yield();

      assert.html.textContent(childVp, 'gc12');

      nf.click();
      queue.flush();
      await queue.yield();

      assert.html.textContent(childVp, 'nf');

      f.click();
      queue.flush();
      await queue.yield();

      childVp = rootVp.querySelector('au-viewport');
      assert.html.textContent(childVp, 'gc21', host.textContent);

      [, a2, nf, f] = Array.from(rootVp.querySelectorAll('a'));
      a2.click();
      queue.flush();
      await queue.yield();

      assert.html.textContent(childVp, 'gc22');

      nf.click();
      queue.flush();
      await queue.yield();

      assert.html.textContent(childVp, 'nf');

      f.click();
      queue.flush();
      await queue.yield();

      childVp = rootVp.querySelector('au-viewport');
      assert.html.textContent(childVp, 'gc11');

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
      public loading(params: Params) {
        b1Params.push(params);
      }
    }
    @customElement({ name: 'b2', template: null })
    class B2 {
      public loading(params: Params) {
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
      public loading(params: Params) {
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
      public loading(params: Params) {
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
      public loading(params: Params, next: RouteNode) {
        a1Params.push(params);
        a1Query.push(Array.from(next.queryParams.entries()));
      }
    }

    @customElement({
      name: 'a2',
      template: '',
    })
    class A2 implements IRouteViewModel {
      public loading(params: Params, next: RouteNode) {
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

    await router.load({ component: 'a1', params: { a: '12' } });
    let url = pushedUrls.pop();
    assert.match(url, /a1\/12$/, 'url1');

    await router.load({ component: 'a2', params: { c: '45' } });
    url = pushedUrls.pop();
    assert.match(url, /a2\/45$/, 'url1');

    await router.load({ component: 'a1', params: { a: '21', b: '34' } });
    url = pushedUrls.pop();
    assert.match(url, /a1\/21\?b=34$/, 'url1');

    await router.load({ component: 'a2', params: { a: '67', c: '54' } });
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

  it('Router#load accepts viewport instructions with specific viewport name - component: class', async function () {
    @customElement({ name: 'gc-11', template: 'gc11' })
    class GrandChildOneOne { }

    @customElement({ name: 'gc-12', template: 'gc12' })
    class GrandChildOneTwo { }

    @route({
      routes: [
        { id: 'gc11', path: ['', 'gc11'], component: GrandChildOneOne },
        { id: 'gc12', path: 'gc12', component: GrandChildOneTwo },
      ],
    })
    @customElement({ name: 'c-one', template: `c1 <au-viewport></au-viewport>`, })
    class ChildOne { }

    @customElement({ name: 'gc-21', template: 'gc21' })
    class GrandChildTwoOne { }

    @customElement({ name: 'gc-22', template: 'gc22' })
    class GrandChildTwoTwo { }

    @route({
      routes: [
        { id: 'gc21', path: ['', 'gc21'], component: GrandChildTwoOne },
        { id: 'gc22', path: 'gc22', component: GrandChildTwoTwo },
      ],
    })
    @customElement({
      name: 'c-two',
      template: `c2 \${id} <au-viewport></au-viewport>`,
    })
    class ChildTwo {
      private id: string;
      public loading(params: Params) {
        this.id = params.id ?? 'NA';
      }
    }

    @route({
      routes: [
        {
          path: ['', 'c1'],
          component: ChildOne,
        },
        {
          path: 'c2/:id?',
          component: ChildTwo,
        },
      ],
    })
    @customElement({ name: 'my-app', template: '<au-viewport name="vp1"></au-viewport><au-viewport name="vp2" default.bind="null"></au-viewport>' })
    class MyApp { }

    const { au, container, host } = await start({ appRoot: MyApp });
    const router = container.get(IRouter);
    const queue = container.get(IPlatform).domWriteQueue;
    await queue.yield();
    const vps = Array.from(host.querySelectorAll(':scope>au-viewport'));

    assert.html.textContent(vps[0], 'c1 gc11', 'round#1 vp1');
    assert.html.textContent(vps[1], '', 'round#1 vp2');

    await router.load([
      {
        component: ChildOne,
        children: [{ component: GrandChildOneTwo }],
        viewport: 'vp2',
      },
      {
        component: ChildTwo,
        params: { id: 21 },
        children: [{ component: GrandChildTwoTwo }],
        viewport: 'vp1',
      },
    ]);
    await queue.yield();

    assert.html.textContent(vps[0], 'c2 21 gc22', 'round#2 vp1');
    assert.html.textContent(vps[1], 'c1 gc12', 'round#2 vp2');

    await router.load([
      {
        component: ChildTwo,
        viewport: 'vp2',
      },
    ]);
    await queue.yield();

    assert.html.textContent(vps[0], 'c1 gc11', 'round#3 vp1');
    assert.html.textContent(vps[1], 'c2 NA gc21', 'round#3 vp2');

    await au.stop();
  });

  it('Router#load accepts hierarchical viewport instructions with route-id', async function () {
    @customElement({ name: 'gc-11', template: 'gc11' })
    class GrandChildOneOne { }

    @customElement({ name: 'gc-12', template: 'gc12' })
    class GrandChildOneTwo { }

    @route({
      routes: [
        { id: 'gc11', path: ['', 'gc-11'], component: GrandChildOneOne },
        { id: 'gc12', path: 'gc-12', component: GrandChildOneTwo },
      ],
    })
    @customElement({ name: 'c-one', template: `c1 <au-viewport></au-viewport>`, })
    class ChildOne { }

    @customElement({ name: 'gc-21', template: 'gc21' })
    class GrandChildTwoOne { }

    @customElement({ name: 'gc-22', template: 'gc22 ${id}' })
    class GrandChildTwoTwo {
      private id: string;
      public loading(params: Params) {
        this.id = params.id ?? 'NA';
      }
    }

    @route({
      routes: [
        { id: 'gc21', path: ['', 'gc-21'], component: GrandChildTwoOne },
        { id: 'gc22', path: 'gc-22/:id?', component: GrandChildTwoTwo },
      ],
    })
    @customElement({
      name: 'c-two',
      template: `c2 \${id} <au-viewport></au-viewport>`,
    })
    class ChildTwo {
      private id: string;
      public loading(params: Params) {
        this.id = params.id ?? 'NA';
      }
    }

    @route({
      routes: [
        {
          id: 'c1',
          path: ['', 'c-1'],
          component: ChildOne,
        },
        {
          id: 'c2',
          path: 'c-2/:id?',
          component: ChildTwo,
        },
      ],
    })
    @customElement({ name: 'my-app', template: '<au-viewport name="vp1"></au-viewport><au-viewport name="vp2" default.bind="null"></au-viewport>' })
    class MyApp { }

    const { au, container, host } = await start({ appRoot: MyApp });
    const router = container.get(IRouter);
    const queue = container.get(IPlatform).domWriteQueue;
    await queue.yield();
    const vps = Array.from(host.querySelectorAll(':scope>au-viewport'));

    assert.html.textContent(vps[0], 'c1 gc11', 'round#1 vp1');
    assert.html.textContent(vps[1], '', 'round#1 vp2');

    await router.load([
      {
        component: 'c1',
        children: [{ component: 'gc12' }],
        viewport: 'vp2',
      },
      {
        component: 'c2',
        params: { id: 21 },
        children: [{ component: 'gc22' }],
        viewport: 'vp1',
      },
    ]);
    await queue.yield();

    assert.html.textContent(vps[0], 'c2 21 gc22 NA', 'round#2 vp1');
    assert.html.textContent(vps[1], 'c1 gc12', 'round#2 vp2');

    await router.load([
      {
        component: 'c2',
        viewport: 'vp2',
      },
    ]);
    await queue.yield();

    assert.html.textContent(vps[0], 'c1 gc11', 'round#3 vp1');
    assert.html.textContent(vps[1], 'c2 NA gc21', 'round#3 vp2');

    await router.load([
      {
        component: 'c1',
        children: [{ component: 'gc12' }],
        viewport: 'vp2',
      },
      {
        component: 'c2',
        params: { id: 21 },
        children: [{ component: 'gc22', params: { id: 42 } }],
        viewport: 'vp1',
      },
    ]);
    await queue.yield();

    assert.html.textContent(vps[0], 'c2 21 gc22 42', 'round#4 vp1');
    assert.html.textContent(vps[1], 'c1 gc12', 'round#4 vp2');

    await router.load([
      {
        component: 'c1',
        children: [{ component: 'gc12' }],
        viewport: 'vp1',
      },
    ]);
    await queue.yield();

    assert.html.textContent(vps[0], 'c1 gc12', 'round#5 vp1');
    assert.html.textContent(vps[1], '', 'round#5 vp2');

    await au.stop();
  });

  it('Router#load supports class-returning-function as component', async function () {
    @customElement({ name: 'gc-11', template: 'gc11' })
    class GrandChildOneOne { }

    @customElement({ name: 'gc-12', template: 'gc12' })
    class GrandChildOneTwo { }

    @route({
      routes: [
        { id: 'gc11', path: ['', 'gc-11'], component: GrandChildOneOne },
        { id: 'gc12', path: 'gc-12', component: GrandChildOneTwo },
      ],
    })
    @customElement({ name: 'c-one', template: `c1 <au-viewport></au-viewport>`, })
    class ChildOne { }

    @customElement({ name: 'gc-21', template: 'gc21' })
    class GrandChildTwoOne { }

    @customElement({ name: 'gc-22', template: 'gc22 ${id}' })
    class GrandChildTwoTwo {
      private id: string;
      public loading(params: Params) {
        this.id = params.id ?? 'NA';
      }
    }

    @route({
      routes: [
        { id: 'gc21', path: ['', 'gc-21'], component: GrandChildTwoOne },
        { id: 'gc22', path: 'gc-22/:id?', component: GrandChildTwoTwo },
      ],
    })
    @customElement({
      name: 'c-two',
      template: `c2 \${id} <au-viewport></au-viewport>`,
    })
    class ChildTwo {
      private id: string;
      public loading(params: Params) {
        this.id = params.id ?? 'NA';
      }
    }

    @route({
      routes: [
        {
          id: 'c1',
          path: ['', 'c-1'],
          component: ChildOne,
        },
        {
          id: 'c2',
          path: 'c-2/:id?',
          component: ChildTwo,
        },
      ],
    })
    @customElement({ name: 'my-app', template: '<au-viewport name="vp1"></au-viewport><au-viewport name="vp2" default.bind="null"></au-viewport>' })
    class MyApp { }

    const { au, container, host } = await start({ appRoot: MyApp });
    const router = container.get(IRouter);
    const queue = container.get(IPlatform).domWriteQueue;
    await queue.yield();
    const vps = Array.from(host.querySelectorAll(':scope>au-viewport'));

    assert.html.textContent(vps[0], 'c1 gc11', 'round#1 vp1');
    assert.html.textContent(vps[1], '', 'round#1 vp2');

    // single
    await router.load(() => ChildTwo);
    await queue.yield();

    assert.html.textContent(vps[0], 'c2 NA gc21', 'round#2 vp1');
    assert.html.textContent(vps[1], '', 'round#2 vp2');

    // sibling
    await router.load([() => ChildTwo, () => ChildOne]);
    await queue.yield();

    assert.html.textContent(vps[0], 'c2 NA gc21', 'round#3 vp1');
    assert.html.textContent(vps[1], 'c1 gc11', 'round#3 vp2');

    // viewport instruction
    await router.load([
      { component: () => ChildTwo, viewport: 'vp2' },
      { component: () => ChildOne, viewport: 'vp1' },
    ]);
    await queue.yield();

    assert.html.textContent(vps[0], 'c1 gc11', 'round#4 vp1');
    assert.html.textContent(vps[1], 'c2 NA gc21', 'round#4 vp2');

    // viewport instruction - params
    await router.load([
      { component: () => ChildTwo, viewport: 'vp1', params: { id: 42 } },
      { component: () => ChildOne, viewport: 'vp2' },
    ]);
    await queue.yield();

    assert.html.textContent(vps[0], 'c2 42 gc21', 'round#5 vp1');
    assert.html.textContent(vps[1], 'c1 gc11', 'round#5 vp2');

    // viewport instruction - children
    await router.load([
      { component: () => ChildTwo, viewport: 'vp2', children: [() => GrandChildTwoTwo] },
      { component: () => ChildOne, viewport: 'vp1', children: [() => GrandChildOneTwo] },
    ]);
    await queue.yield();

    assert.html.textContent(vps[0], 'c1 gc12', 'round#6 vp1');
    assert.html.textContent(vps[1], 'c2 NA gc22 NA', 'round#6 vp2');

    // viewport instruction - parent-params - children
    await router.load([
      { component: () => ChildTwo, viewport: 'vp1', params: { id: 42 }, children: [() => GrandChildTwoTwo] },
      { component: () => ChildOne, viewport: 'vp2' },
    ]);
    await queue.yield();

    assert.html.textContent(vps[0], 'c2 42 gc22 NA', 'round#7 vp1');
    assert.html.textContent(vps[1], 'c1 gc11', 'round#7 vp2');

    // viewport instruction - parent-params - children-params
    await router.load([
      { component: () => ChildTwo, viewport: 'vp2', params: { id: 42 }, children: [{ component: () => GrandChildTwoTwo, params: { id: 21 } }] },
      { component: () => ChildOne, viewport: 'vp1', children: [() => GrandChildOneTwo] },
    ]);
    await queue.yield();

    assert.html.textContent(vps[0], 'c1 gc12', 'round#8 vp1');
    assert.html.textContent(vps[1], 'c2 42 gc22 21', 'round#8 vp2');

    await au.stop();
  });

  // Use-case: router.load(import('./class'))
  it('Router#load supports promise as component', async function () {
    @customElement({ name: 'gc-11', template: 'gc11' })
    class GrandChildOneOne { }

    @customElement({ name: 'gc-12', template: 'gc12' })
    class GrandChildOneTwo { }

    @route({
      routes: [
        { id: 'gc11', path: ['', 'gc-11'], component: GrandChildOneOne },
        { id: 'gc12', path: 'gc-12', component: GrandChildOneTwo },
      ],
    })
    @customElement({ name: 'c-one', template: `c1 <au-viewport></au-viewport>`, })
    class ChildOne { }

    @customElement({ name: 'gc-21', template: 'gc21' })
    class GrandChildTwoOne { }

    @customElement({ name: 'gc-22', template: 'gc22 ${id}' })
    class GrandChildTwoTwo {
      private id: string;
      public loading(params: Params) {
        this.id = params.id ?? 'NA';
      }
    }

    @route({
      routes: [
        { id: 'gc21', path: ['', 'gc-21'], component: GrandChildTwoOne },
        { id: 'gc22', path: 'gc-22/:id?', component: GrandChildTwoTwo },
      ],
    })
    @customElement({
      name: 'c-two',
      template: `c2 \${id} <au-viewport></au-viewport>`,
    })
    class ChildTwo {
      private id: string;
      public loading(params: Params) {
        this.id = params.id ?? 'NA';
      }
    }

    @route({
      routes: [
        {
          id: 'c1',
          path: ['', 'c-1'],
          component: ChildOne,
        },
        {
          id: 'c2',
          path: 'c-2/:id?',
          component: ChildTwo,
        },
      ],
    })
    @customElement({ name: 'my-app', template: '<au-viewport name="vp1"></au-viewport><au-viewport name="vp2" default.bind="null"></au-viewport>' })
    class MyApp { }

    const { au, container, host } = await start({ appRoot: MyApp });
    const router = container.get(IRouter);
    const queue = container.get(IPlatform).domWriteQueue;
    await queue.yield();
    const vps = Array.from(host.querySelectorAll(':scope>au-viewport'));

    assert.html.textContent(vps[0], 'c1 gc11', 'round#1 vp1');
    assert.html.textContent(vps[1], '', 'round#1 vp2');

    // single - default
    await router.load(Promise.resolve({ default: ChildTwo }));
    await queue.yield();

    assert.html.textContent(vps[0], 'c2 NA gc21', 'round#2 vp1');
    assert.html.textContent(vps[1], '', 'round#2 vp2');

    // single - non-default
    await router.load(Promise.resolve({ ChildOne }));
    await queue.yield();

    assert.html.textContent(vps[0], 'c1 gc11', 'round#3 vp1');
    assert.html.textContent(vps[1], '', 'round#3 vp2');

    // single - chained
    await router.load(Promise.resolve({ ChildOne, ChildTwo }).then(x => x.ChildTwo));
    await queue.yield();

    assert.html.textContent(vps[0], 'c2 NA gc21', 'round#4 vp1');
    assert.html.textContent(vps[1], '', 'round#4 vp2');

    // sibling
    await router.load([Promise.resolve({ ChildTwo }), Promise.resolve({ ChildOne })]);
    await queue.yield();

    assert.html.textContent(vps[0], 'c2 NA gc21', 'round#5 vp1');
    assert.html.textContent(vps[1], 'c1 gc11', 'round#5 vp2');

    // viewport instruction
    await router.load([
      { component: Promise.resolve({ ChildTwo }), viewport: 'vp2' },
      { component: Promise.resolve({ ChildOne }), viewport: 'vp1' },
    ]);
    await queue.yield();

    assert.html.textContent(vps[0], 'c1 gc11', 'round#6 vp1');
    assert.html.textContent(vps[1], 'c2 NA gc21', 'round#6 vp2');

    // viewport instruction - params
    await router.load([
      { component: Promise.resolve({ ChildTwo }), viewport: 'vp1', params: { id: 42 } },
      { component: Promise.resolve({ ChildOne }), viewport: 'vp2' },
    ]);
    await queue.yield();

    assert.html.textContent(vps[0], 'c2 42 gc21', 'round#7 vp1');
    assert.html.textContent(vps[1], 'c1 gc11', 'round#7 vp2');

    // viewport instruction - children
    await router.load([
      { component: Promise.resolve({ ChildTwo }), viewport: 'vp2', children: [() => GrandChildTwoTwo] },
      { component: Promise.resolve({ ChildOne }), viewport: 'vp1', children: [() => GrandChildOneTwo] },
    ]);
    await queue.yield();

    assert.html.textContent(vps[0], 'c1 gc12', 'round#8 vp1');
    assert.html.textContent(vps[1], 'c2 NA gc22 NA', 'round#8 vp2');

    // viewport instruction - parent-params - children
    await router.load([
      { component: Promise.resolve({ ChildTwo }), viewport: 'vp1', params: { id: 42 }, children: [() => GrandChildTwoTwo] },
      { component: Promise.resolve({ ChildOne }), viewport: 'vp2' },
    ]);
    await queue.yield();

    assert.html.textContent(vps[0], 'c2 42 gc22 NA', 'round#9 vp1');
    assert.html.textContent(vps[1], 'c1 gc11', 'round#9 vp2');

    // viewport instruction - parent-params - children-params
    await router.load([
      { component: Promise.resolve({ ChildTwo }), viewport: 'vp2', params: { id: 42 }, children: [{ component: () => GrandChildTwoTwo, params: { id: 21 } }] },
      { component: Promise.resolve({ ChildOne }), viewport: 'vp1', children: [() => GrandChildOneTwo] },
    ]);
    await queue.yield();

    assert.html.textContent(vps[0], 'c1 gc12', 'round#10 vp1');
    assert.html.textContent(vps[1], 'c2 42 gc22 21', 'round#10 vp2');

    await au.stop();
  });

  it('Router#load accepts viewport instructions with specific viewport name - component: mixed', async function () {
    @customElement({ name: 'gc-11', template: 'gc11' })
    class GrandChildOneOne { }

    @customElement({ name: 'gc-12', template: 'gc12' })
    class GrandChildOneTwo { }

    @route({
      routes: [
        { id: 'gc11', path: ['', 'gc-11'], component: GrandChildOneOne },
        { id: 'gc12', path: 'gc-12', component: GrandChildOneTwo },
      ],
    })
    @customElement({ name: 'c-one', template: `c1 <au-viewport></au-viewport>`, })
    class ChildOne { }

    @customElement({ name: 'gc-21', template: 'gc21' })
    class GrandChildTwoOne { }

    @customElement({ name: 'gc-22', template: 'gc22 ${id}' })
    class GrandChildTwoTwo {
      private id: string;
      public loading(params: Params) {
        this.id = params.id ?? 'NA';
      }
    }

    @route({
      routes: [
        { id: 'gc21', path: ['', 'gc-21'], component: GrandChildTwoOne },
        { id: 'gc22', path: 'gc-22/:id?', component: GrandChildTwoTwo },
      ],
    })
    @customElement({
      name: 'c-two',
      template: `c2 \${id} <au-viewport></au-viewport>`,
    })
    class ChildTwo {
      private id: string;
      public loading(params: Params) {
        this.id = params.id ?? 'NA';
      }
    }

    @route({
      routes: [
        {
          id: 'c1',
          path: ['', 'c-1'],
          component: ChildOne,
        },
        {
          id: 'c2',
          path: 'c-2/:id?',
          component: ChildTwo,
        },
      ],
    })
    @customElement({ name: 'my-app', template: '<au-viewport name="vp1"></au-viewport><au-viewport name="vp2" default.bind="null"></au-viewport>' })
    class MyApp { }

    const { au, container, host } = await start({ appRoot: MyApp });
    const router = container.get(IRouter);
    const queue = container.get(IPlatform).domWriteQueue;
    await queue.yield();
    const vps = Array.from(host.querySelectorAll(':scope>au-viewport'));

    assert.html.textContent(vps[0], 'c1 gc11', 'round#1 vp1');
    assert.html.textContent(vps[1], '', 'round#1 vp2');

    await router.load([
      {
        component: 'c1', /* route-id */
        children: [{ component: 'gc-12' /* path */ }],
        viewport: 'vp2',
      },
      {
        component: ChildTwo, /* class */
        params: { id: 21 },
        children: [{ component: 'gc22' /* route-id */ }],
        viewport: 'vp1',
      },
    ]);
    await queue.yield();

    assert.html.textContent(vps[0], 'c2 21 gc22 NA', 'round#2 vp1');
    assert.html.textContent(vps[1], 'c1 gc12', 'round#2 vp2');

    await router.load([
      {
        component: CustomElement.getDefinition(ChildTwo), /* definition */
        viewport: 'vp2',
      },
    ]);
    await queue.yield();

    assert.html.textContent(vps[0], 'c1 gc11', 'round#3 vp1');
    assert.html.textContent(vps[1], 'c2 NA gc21', 'round#3 vp2');

    await router.load([
      {
        component: CustomElement.getDefinition(ChildTwo), /* definition */
        params: { id: 42 },
        children: [{ component: GrandChildTwoTwo /* class */, params: { id: 21 } }],
        viewport: 'vp1',
      },
    ]);
    await queue.yield();

    assert.html.textContent(vps[0], 'c2 42 gc22 21', 'round#4 vp1');
    assert.html.textContent(vps[1], '', 'round#4 vp2');

    await router.load([
      {
        component: CustomElement.getDefinition(ChildTwo), /* definition */
        children: [{ component: GrandChildTwoTwo /* class */ }],
        viewport: 'vp1',
      },
    ]);
    await queue.yield();

    assert.html.textContent(vps[0], 'c2 NA gc22 NA', 'round#5 vp1');
    assert.html.textContent(vps[1], '', 'round#5 vp2');

    await router.load([
      {
        component: () => ChildTwo,
        params: { id: 42 },
        children: [{ component: Promise.resolve({ GrandChildTwoTwo }), params: { id: 21 } }],
        viewport: 'vp2',
      },
    ]);
    await queue.yield();

    assert.html.textContent(vps[0], 'c1 gc11', 'round#6 vp1');
    assert.html.textContent(vps[1], 'c2 42 gc22 21', 'round#6 vp2');

    await router.load([
      {
        component: Promise.resolve({ ChildTwo }),
        params: { id: 21 },
        children: [{ component: CustomElement.getDefinition(GrandChildTwoTwo), params: { id: 42 } }],
        viewport: 'vp1',
      },
    ]);
    await queue.yield();

    assert.html.textContent(vps[0], 'c2 21 gc22 42', 'round#7 vp1');
    assert.html.textContent(vps[1], '', 'round#7 vp2');

    await au.stop();
  });
  // TODO(sayan): add more tests for parameter parsing with multiple route parameters including optional parameter.

  it('does not interfere with standard "href" attribute', async function () {
    const ctx = TestContext.create();
    const { container } = ctx;

    container.register(TestRouterConfiguration.for(LogLevel.warn));
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

  // #region location URL generation
  {
    @customElement({ name: 'vm-a', template: `view-a foo: \${params.foo} | query: \${query.toString()} | fragment: \${fragment}` })
    class VmA {
      public params!: Params;
      public query!: Readonly<URLSearchParams>;
      public fragment: string;

      public loading(params: Params, next: RouteNode) {
        this.params = params;
        this.query = next.queryParams;
        this.fragment = next.fragment;
      }
    }
    @customElement({ name: 'vm-b', template: 'view-b' })
    class VmB {
      public constructor(
        @IRouter public readonly router: IRouter,
      ) { }
      public async redirectToPath() {
        await this.router.load('a?foo=bar');
      }
      public async redirectWithQueryObj() {
        await this.router.load('a', { queryParams: { foo: 'bar' } });
      }
      public async redirectWithMultivaluedQuery() {
        await this.router.load('a?foo=fizz', { queryParams: { foo: 'bar' } });
      }
      public async redirectWithRouteParamAndQueryObj() {
        await this.router.load('a/fizz', { queryParams: { foo: 'bar' } });
      }
      public async redirectWithClassAndQueryObj() {
        await this.router.load(VmA, { queryParams: { foo: 'bar' } });
      }
      public async redirectVpInstrcAndQueryObj() {
        await this.router.load({ component: VmA, params: { foo: '42' } }, { queryParams: { foo: 'bar' } });
      }
      public async redirectVpInstrcRouteIdAndQueryObj() {
        await this.router.load({ component: 'a' /** route-id */, params: { foo: '42', bar: 'foo' } }, { queryParams: { bar: 'fizz' } });
      }
      public async redirectFragment() {
        await this.router.load('a#foobar');
      }
      public async redirectFragmentInNavOpt() {
        await this.router.load('a', { fragment: 'foobar' });
      }
      public async redirectFragmentInPathAndNavOpt() {
        await this.router.load('a#foobar', { fragment: 'fizzbuzz' });
      }
      public async redirectFragmentWithVpInstrc() {
        await this.router.load({ component: 'a', params: { foo: '42' } }, { fragment: 'foobar' });
      }
      public async redirectFragmentWithVpInstrcRawUrl() {
        await this.router.load({ component: 'a/42' }, { fragment: 'foobar' });
      }
      public async redirectFragmentSiblingViewport() {
        await this.router.load([{ component: 'a/42' }, { component: 'a' }], { fragment: 'foobar' });
      }
      public async redirectSiblingViewport() {
        await this.router.load([{ component: 'a/42' }, { component: 'a' }], { queryParams: { foo: 'bar' } });
      }
      public async redirectWithQueryAndFragment() {
        await this.router.load({ component: 'a', params: { foo: '42' } }, { queryParams: { foo: 'bar' }, fragment: 'foobar' });
      }
      public async redirectWithQueryAndFragmentSiblingViewport() {
        await this.router.load([{ component: 'a', params: { foo: '42' } }, { component: 'a', params: { foo: '84' } }], { queryParams: { foo: 'bar' }, fragment: 'foobar' });
      }
    }

    @route({
      title: 'base',
      routes: [
        { path: ['a', 'a/:foo'], component: VmA, title: 'A', transitionPlan: 'invoke-lifecycles', },
        { path: ['', 'b'], component: VmB, title: 'B', transitionPlan: 'invoke-lifecycles' },
      ],
    })
    @customElement({ name: 'app-root', template: '<au-viewport></au-viewport> <au-viewport default.bind="null"></au-viewport>' })
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

    it('queryString - #1 - query string in string routing instruction', async function () {
      const { host, au, container } = await start();
      const vmb = CustomElement.for<VmB>(host.querySelector('vm-b')).viewModel;

      await vmb.redirectToPath();

      assert.html.textContent(host, 'view-a foo: undefined | query: foo=bar | fragment:');
      assert.match((container.get(ILocation) as unknown as MockBrowserHistoryLocation).path, /a\?foo=bar$/);

      await au.stop();
    });

    it('queryString - #2 - structured query string object', async function () {
      const { host, au, container } = await start();
      const vmb = CustomElement.for<VmB>(host.querySelector('vm-b')).viewModel;

      await vmb.redirectWithQueryObj();

      assert.html.textContent(host, 'view-a foo: undefined | query: foo=bar | fragment:');
      assert.match((container.get(ILocation) as unknown as MockBrowserHistoryLocation).path, /a\?foo=bar$/);

      await au.stop();
    });

    it('queryString - #3 - multi-valued query string - value from both string path and structured query params', async function () {
      const { host, au, container } = await start();
      const vmb = CustomElement.for<VmB>(host.querySelector('vm-b')).viewModel;

      await vmb.redirectWithMultivaluedQuery();

      assert.html.textContent(host, 'view-a foo: undefined | query: foo=fizz&foo=bar | fragment:');
      assert.match((container.get(ILocation) as unknown as MockBrowserHistoryLocation).path, /a\?foo=fizz&foo=bar$/);

      await au.stop();
    });

    it('queryString - #4 - structured query string along with path parameter', async function () {
      const { host, au, container } = await start();
      const vmb = CustomElement.for<VmB>(host.querySelector('vm-b')).viewModel;

      await vmb.redirectWithRouteParamAndQueryObj();

      assert.html.textContent(host, 'view-a foo: fizz | query: foo=bar | fragment:');
      assert.match((container.get(ILocation) as unknown as MockBrowserHistoryLocation).path, /a\/fizz\?foo=bar$/);

      await au.stop();
    });

    it('queryString - #5 - structured query string with class as routing instruction', async function () {
      const { host, au, container } = await start();
      const vmb = CustomElement.for<VmB>(host.querySelector('vm-b')).viewModel;

      await vmb.redirectWithClassAndQueryObj();

      assert.html.textContent(host, 'view-a foo: undefined | query: foo=bar | fragment:');
      assert.match((container.get(ILocation) as unknown as MockBrowserHistoryLocation).path, /a\?foo=bar$/);

      await au.stop();
    });

    it('queryString - #6 - structured query string with viewport instruction', async function () {
      const { host, au, container } = await start();
      const vmb = CustomElement.for<VmB>(host.querySelector('vm-b')).viewModel;

      await vmb.redirectVpInstrcAndQueryObj();

      assert.html.textContent(host, 'view-a foo: 42 | query: foo=bar | fragment:');
      assert.match((container.get(ILocation) as unknown as MockBrowserHistoryLocation).path, /a\/42\?foo=bar$/);

      await au.stop();
    });

    it('queryString - #7 - structured query string with viewport instruction - route-id and multi-valued key', async function () {
      const { host, au, container } = await start();
      const vmb = CustomElement.for<VmB>(host.querySelector('vm-b')).viewModel;

      await vmb.redirectVpInstrcRouteIdAndQueryObj();

      assert.html.textContent(host, 'view-a foo: 42 | query: bar=fizz&bar=foo | fragment:');
      assert.match((container.get(ILocation) as unknown as MockBrowserHistoryLocation).path, /a\/42\?bar=fizz&bar=foo$/);

      await au.stop();
    });

    it('queryString - #8 - sibling viewports', async function () {
      const { host, au, container } = await start();
      const vmb = CustomElement.for<VmB>(host.querySelector('vm-b')).viewModel;

      await vmb.redirectSiblingViewport();

      assert.html.textContent(host, 'view-a foo: 42 | query: foo=bar | fragment: view-a foo: undefined | query: foo=bar | fragment:');
      assert.match((container.get(ILocation) as unknown as MockBrowserHistoryLocation).path, /a\/42\+a\?foo=bar$/);

      await au.stop();
    });

    it('fragment - #1 - raw fragment in path', async function () {
      const { host, au, container } = await start();
      const vmb = CustomElement.for<VmB>(host.querySelector('vm-b')).viewModel;

      await vmb.redirectFragment();

      assert.html.textContent(host, 'view-a foo: undefined | query: | fragment: foobar');
      assert.match((container.get(ILocation) as unknown as MockBrowserHistoryLocation).path, /a#foobar$/);

      await au.stop();
    });

    it('fragment - #2 - fragment in navigation options', async function () {
      const { host, au, container } = await start();
      const vmb = CustomElement.for<VmB>(host.querySelector('vm-b')).viewModel;

      await vmb.redirectFragmentInNavOpt();

      assert.html.textContent(host, 'view-a foo: undefined | query: | fragment: foobar');
      assert.match((container.get(ILocation) as unknown as MockBrowserHistoryLocation).path, /a#foobar$/);

      await au.stop();
    });

    it('fragment - #3 - fragment in path always wins over the fragment in navigation options', async function () {
      const { host, au, container } = await start();
      const vmb = CustomElement.for<VmB>(host.querySelector('vm-b')).viewModel;

      await vmb.redirectFragmentInPathAndNavOpt();

      assert.html.textContent(host, 'view-a foo: undefined | query: | fragment: foobar');
      assert.match((container.get(ILocation) as unknown as MockBrowserHistoryLocation).path, /a#foobar$/);

      await au.stop();
    });

    it('fragment - #4 - with viewport instruction', async function () {
      const { host, au, container } = await start();
      const vmb = CustomElement.for<VmB>(host.querySelector('vm-b')).viewModel;

      await vmb.redirectFragmentWithVpInstrc();

      assert.html.textContent(host, 'view-a foo: 42 | query: | fragment: foobar');
      assert.match((container.get(ILocation) as unknown as MockBrowserHistoryLocation).path, /a\/42#foobar$/);

      await au.stop();
    });

    it('fragment - #5 - with viewport instruction - raw url', async function () {
      const { host, au, container } = await start();
      const vmb = CustomElement.for<VmB>(host.querySelector('vm-b')).viewModel;

      await vmb.redirectFragmentWithVpInstrcRawUrl();

      assert.html.textContent(host, 'view-a foo: 42 | query: | fragment: foobar');
      assert.match((container.get(ILocation) as unknown as MockBrowserHistoryLocation).path, /a\/42#foobar$/);

      await au.stop();
    });

    it('fragment - #6 - sibling viewport', async function () {
      const { host, au, container } = await start();
      const vmb = CustomElement.for<VmB>(host.querySelector('vm-b')).viewModel;

      await vmb.redirectFragmentSiblingViewport();

      assert.html.textContent(host, 'view-a foo: 42 | query: | fragment: foobar view-a foo: undefined | query: | fragment: foobar');
      assert.match((container.get(ILocation) as unknown as MockBrowserHistoryLocation).path, /a\/42\+a#foobar$/);

      await au.stop();
    });

    it('query and fragment', async function () {
      const { host, au, container } = await start();
      const vmb = CustomElement.for<VmB>(host.querySelector('vm-b')).viewModel;

      await vmb.redirectWithQueryAndFragment();

      assert.html.textContent(host, 'view-a foo: 42 | query: foo=bar | fragment: foobar');
      assert.match((container.get(ILocation) as unknown as MockBrowserHistoryLocation).path, /a\/42\?foo=bar#foobar$/);

      await au.stop();
    });

    it('query and fragment - sibling viewport', async function () {
      const { host, au, container } = await start();
      const vmb = CustomElement.for<VmB>(host.querySelector('vm-b')).viewModel;

      await vmb.redirectWithQueryAndFragmentSiblingViewport();

      assert.html.textContent(host, 'view-a foo: 42 | query: foo=bar | fragment: foobar view-a foo: 84 | query: foo=bar | fragment: foobar');
      assert.match((container.get(ILocation) as unknown as MockBrowserHistoryLocation).path, /a\/42\+a\/84\?foo=bar#foobar$/);

      await au.stop();
    });

    it('shows title correctly', async function () {
      const { host, au, container } = await start();
      assert.strictEqual(container.get(IPlatform).document.title, 'B | base');
      const vmb = CustomElement.for<VmB>(host.querySelector('vm-b')).viewModel;

      await vmb.redirectToPath();

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

      await vmb.redirectToPath();

      assert.strictEqual(container.get(IPlatform).document.title, 'base - A');

      await au.stop();
    });
  }
  // TODO(sayan): add more tests for title involving children and sibling routes

  it('root/child/grandchild/great-grandchild', async function () {
    @customElement({ name: 'gcc-1', template: `gcc1` })
    class GGC1 { }

    @route({
      routes: [
        { path: '', component: GGC1 },
      ],
    })
    @customElement({ name: 'gc-1', template: `<au-viewport></au-viewport>`, })
    class GC1 { }

    @route({
      routes: [
        { path: '', redirectTo: 'gc1' },
        { id: 'gc1', path: 'gc1', component: GC1 },
      ],
    })
    @customElement({ name: 'c-1', template: `<au-viewport></au-viewport>`, })
    class C1 { }

    @route({
      routes: [
        { path: '', redirectTo: 'c1' },
        { path: 'c1', component: C1, },
      ],
    })
    @customElement({ name: 'ro-ot', template: `<au-viewport></au-viewport>`, })
    class Root { }

    const { au, container, host } = await start({ appRoot: Root });

    assert.html.textContent(host, 'gcc1');
    assert.match((container.get(ILocation) as unknown as MockBrowserHistoryLocation).path, /c1\/gc1$/);

    await au.stop();
  });
  // #endregion

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
        public async getRouteConfig(_parentDefinition: RouteDefinition, _routeNode: RouteNode): Promise<IRouteConfig> {
          await new Promise((resolve) => setTimeout(resolve, 10));
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
              { path: 'c21', component: Promise.resolve({ 'default': C21 }), title: 'C21' },
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
              { path: ['', 'p1'], component: Promise.resolve({ P1, 'default': { foo: 'bar' }, 'fizz': 'buzz' }).then(x => x.P1), title: 'P1' },
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

    class InvalidAsyncComponentTestData {
      public constructor(
        public readonly name: string,
        public readonly component: Promise<IModule>
      ) { }
    }

    function* getInvalidAsyncComponentTestData() {
      yield new InvalidAsyncComponentTestData('empty', Promise.resolve({}));
      yield new InvalidAsyncComponentTestData('no-CE in module', Promise.resolve({ foo() { /** noop */ } }));
    }

    for (const { name, component } of getInvalidAsyncComponentTestData()) {
      it(`async configuration - invalid module - ${name}`, async function () {
        @customElement({ name: 'ro-ot', template: '<au-viewport></au-viewport>' })
        class Root implements IRouteViewModel {
          public getRouteConfig(_parentDefinition: RouteDefinition, _routeNode: RouteNode): IRouteConfig {
            return {
              routes: [
                { path: '', component, title: 'P1' },
              ]
            };
          }
        }

        const ctx = TestContext.create();
        const { container } = ctx;

        container.register(
          StandardConfiguration,
          TestRouterConfiguration.for(LogLevel.warn),
          RouterConfiguration,
        );

        const au = new Aurelia(container);
        const host = ctx.createElement('div');

        try {
          await au.app({ component: Root, host }).start();
          assert.fail('expected error');
        } catch (er) {
          assert.match((er as Error).message, /does not appear to be a component or CustomElement recognizable by Aurelia/);
        }

        await au.stop();
      });
    }
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
        { path: ['', 'foo'], redirectTo: 'p2' },
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
    const location = container.get(ILocation) as unknown as MockBrowserHistoryLocation;
    assert.match(location.path, /p2$/);

    await router.load('p1');
    assert.html.textContent(host, 'p1');
    assert.match(location.path, /p1$/);

    await router.load('foo');
    assert.html.textContent(host, 'p2');
    assert.match(location.path, /p2$/);

    await au.stop();
  });

  it('parameterized redirect', async function () {
    @customElement({ name: 'ce-p1', template: 'p1' })
    class P1 { }

    @customElement({ name: 'ce-p2', template: `p2 \${id}` })
    class P2 implements IRouteViewModel {
      private id: string;
      public loading(params: Params, _next: RouteNode, _current: RouteNode): void | Promise<void> {
        this.id = params.id;
      }
    }
    @route({
      routes: [
        { path: '', redirectTo: 'p2' },
        { path: 'foo', redirectTo: 'p2/42' },
        { path: 'fizz/:bar', redirectTo: 'p2/:bar' },
        { path: 'bar', redirectTo: 'p2/43+p2/44' },
        { path: 'p1', component: P1, title: 'P1' },
        { path: 'p2/:id?', component: P2, title: 'P2' },
      ]
    })
    @customElement({ name: 'ro-ot', template: '<au-viewport></au-viewport><au-viewport default.bind="null"></au-viewport>' })
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
    const location = container.get(ILocation) as unknown as MockBrowserHistoryLocation;
    assert.match(location.path, /p2$/);

    await router.load('p1');
    assert.html.textContent(host, 'p1');
    assert.match(location.path, /p1$/);

    await router.load('foo');
    assert.html.textContent(host, 'p2 42');
    assert.match(location.path, /p2\/42$/);

    await router.load('fizz/21');
    assert.html.textContent(host, 'p2 21');
    assert.match(location.path, /p2\/21$/);

    try {
      await router.load('bar');
      assert.fail('Expected error for non-simple redirect.');
    } catch(e) {
      assert.match((e as Error).message, /^Unexpected expression kind/, 'Expected error due to unexpected path segment.');
    }

    await au.stop();
  });

  it('parameterized redirect - parameter rearrange', async function () {
    @customElement({ name: 'ce-p1', template: 'p1' })
    class P1 { }

    @customElement({ name: 'ce-p2', template: `p2 \${p1} \${p2}` })
    class P2 implements IRouteViewModel {
      private p1: string;
      private p2: string;
      public loading(params: Params, _next: RouteNode, _current: RouteNode): void | Promise<void> {
        this.p1 = params.p1;
        this.p2 = params.p2;
      }
    }
    @route({
      routes: [
        { path: 'fizz/:foo/:bar', redirectTo: 'p2/:bar/:foo' },
        { path: 'p2/:p1?/:p2?', component: P2, title: 'P2' },
      ]
    })
    @customElement({ name: 'ro-ot', template: '<au-viewport></au-viewport><au-viewport default.bind="null"></au-viewport>' })
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
    const location = container.get(ILocation) as unknown as MockBrowserHistoryLocation;

    await router.load('fizz/1/2');
    assert.html.textContent(host, 'p2 2 1');
    assert.match(location.path, /p2\/2\/1$/);

    await au.stop();
  });

  describe('path generation', function () {
    it('at root', async function () {
      abstract class BaseRouteViewModel implements IRouteViewModel {
        public static paramsLog: Map<string, [Params, URLSearchParams]> = new Map<string, [Params, URLSearchParams]>();
        public static assertAndClear(key: string, expected: [Params, URLSearchParams], message: string) {
          assert.deepStrictEqual(this.paramsLog.get(key), expected, message);
          this.paramsLog.clear();
        }
        public loading(params: Params, next: RouteNode, _: RouteNode): void | Promise<void> {
          BaseRouteViewModel.paramsLog.set(this.constructor.name.toLowerCase(), [params, next.queryParams]);
        }
      }
      @customElement({ name: 'fo-o', template: '' })
      class Foo extends BaseRouteViewModel { }
      @customElement({ name: 'ba-r', template: '' })
      class Bar extends BaseRouteViewModel { }
      @customElement({ name: 'fi-zz', template: '' })
      class Fizz extends BaseRouteViewModel { }

      @route({
        routes: [
          { id: 'foo', path: ['foo/:id', 'foo/:id/bar/:a', 'foo/:id/:bar?/*b'], component: Foo },
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

      // using route-id
      assert.strictEqual(await router.load({ component: 'foo', params: { id: '1', a: '3' } }), true);
      assert.match(location.path, /foo\/1\/bar\/3$/);
      BaseRouteViewModel.assertAndClear('foo', [{ id: '1', a: '3' }, new URLSearchParams()], 'params1');

      assert.strictEqual(await router.load({ component: 'foo', params: { id: '1', c: '3' } }), true);
      assert.match(location.path, /foo\/1\?c=3$/);
      BaseRouteViewModel.assertAndClear('foo', [{ id: '1' }, new URLSearchParams({ c: '3' })], 'params2');

      assert.strictEqual(await router.load({ component: 'bar', params: { id: '1', c: '4' } }), true);
      assert.match(location.path, /bar\/1\?c=4$/);
      BaseRouteViewModel.assertAndClear('bar', [{ id: '1' }, new URLSearchParams({ c: '4' })], 'params3');

      assert.strictEqual(await router.load({ component: 'foo', params: { id: '1', b: 'awesome/possum' } }), true);
      assert.match(location.path, /foo\/1\/awesome\/possum$/);
      BaseRouteViewModel.assertAndClear('foo', [{ id: '1', b: 'awesome/possum' }, new URLSearchParams()], 'params4');

      try {
        await router.load({ component: 'bar', params: { x: '1' } });
        assert.fail('expected error1');
      } catch (er) {
        assert.match((er as Error).message, /Neither.+bar.+configured route.+nor a fallback/);
      }

      try {
        await router.load({ component: 'fizz', params: { id: '1' } });
        assert.fail('expected error2');
      } catch (er) {
        assert.match((er as Error).message, /Neither.+fizz.+configured route.+nor a fallback/);
      }

      // using component
      assert.strictEqual(await router.load({ component: Foo, params: { id: '1', a: '3' } }), true);
      assert.match(location.path, /foo\/1\/bar\/3$/);
      BaseRouteViewModel.assertAndClear('foo', [{ id: '1', a: '3' }, new URLSearchParams()], 'params5');

      assert.strictEqual(await router.load({ component: Foo, params: { id: '1', c: '3' } }), true);
      assert.match(location.path, /foo\/1\?c=3$/);
      BaseRouteViewModel.assertAndClear('foo', [{ id: '1' }, new URLSearchParams({ c: '3' })], 'params6');

      try {
        await router.load({ component: Bar, params: { x: '1' } });
        assert.fail('expected error1');
      } catch (er) {
        assert.match((er as Error).message, /No value for the required parameter 'id'/);
      }

      try {
        await router.load({ component: Fizz, params: { id: '1' } });
        assert.fail('expected error2');
      } catch (er) {
        assert.match(
          (er as Error).message,
          /required parameter 'x'.+path: 'fizz\/:x'.+required parameter 'y'.+path: 'fizz\/:y\/:x'/
        );
      }

      // use path (non-eager resolution)
      assert.strictEqual(await router.load('bar/1?b=3'), true);
      BaseRouteViewModel.assertAndClear('bar', [{ id: '1' }, new URLSearchParams({ b: '3' })], 'params7');

      await au.stop();
    });

    it('at root - with siblings', async function () {
      abstract class BaseRouteViewModel implements IRouteViewModel {
        public static paramsLog: Map<string, [Params, URLSearchParams]> = new Map<string, [Params, URLSearchParams]>();
        public static assertAndClear(message: string, ...expected: [key: string, value: [Params, URLSearchParams]][]) {
          const paramsLog = this.paramsLog;
          assert.deepStrictEqual(paramsLog, new Map(expected), message);
          paramsLog.clear();
        }
        public loading(params: Params, next: RouteNode, _: RouteNode): void | Promise<void> {
          BaseRouteViewModel.paramsLog.set(this.constructor.name.toLowerCase(), [params, next.queryParams]);
        }
      }
      @customElement({ name: 'fo-o', template: '' })
      class Foo extends BaseRouteViewModel { }
      @customElement({ name: 'ba-r', template: '' })
      class Bar extends BaseRouteViewModel { }
      @customElement({ name: 'fi-zz', template: '' })
      class Fizz extends BaseRouteViewModel { }
      @route({
        routes: [
          { id: 'foo', path: ['foo/:id', 'foo/:id/faa/:a'], component: Foo },
          { id: 'bar', path: ['bar/:id'], component: Bar },
          { id: 'fizz', path: ['fizz/:x', 'fizz/:y/:x'], component: Fizz },
        ]
      })
      @customElement({
        name: 'ro-ot',
        template: `<au-viewport></au-viewport><au-viewport></au-viewport>`
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

      // using route-id
      assert.strictEqual(await router.load([{ component: 'foo', params: { id: '1', a: '3' } }, { component: 'bar', params: { id: '1', b: '3' } }]), true);
      assert.match(location.path, /foo\/1\/faa\/3\+bar\/1\?b=3$/);
      BaseRouteViewModel.assertAndClear('params1', ['foo', [{ id: '1', a: '3' }, new URLSearchParams({ b: '3' })]], ['bar', [{ id: '1' }, new URLSearchParams({ b: '3' })]]);

      assert.strictEqual(await router.load([{ component: 'bar', params: { id: '2' } }, { component: 'foo', params: { id: '3' } }]), true);
      assert.match(location.path, /bar\/2\+foo\/3$/);
      BaseRouteViewModel.assertAndClear('params1', ['bar', [{ id: '2' }, new URLSearchParams()]], ['foo', [{ id: '3' }, new URLSearchParams()]]);

      try {
        await router.load([{ component: 'foo', params: { id: '3' } }, { component: 'bar', params: { x: '1' } }]);
        assert.fail('expected error1');
      } catch (er) {
        assert.match((er as Error).message, /Neither.+bar.+configured route.+nor a fallback/);
      }

      try {
        await router.load([{ component: 'foo', params: { id: '3' } }, { component: 'fizz', params: { id: '1' } }]);
        assert.fail('expected error2');
      } catch (er) {
        assert.match((er as Error).message, /Neither.+fizz.+configured route.+nor a fallback/);
      }

      // using component
      assert.strictEqual(await router.load([{ component: Foo, params: { id: '1', a: '3' } }, { component: Bar, params: { id: '1', b: '3' } }]), true);
      assert.match(location.path, /foo\/1\/faa\/3\+bar\/1\?b=3$/);
      BaseRouteViewModel.assertAndClear('params3', ['foo', [{ id: '1', a: '3' }, new URLSearchParams({ b: '3' })]], ['bar', [{ id: '1' }, new URLSearchParams({ b: '3' })]]);

      assert.strictEqual(await router.load([{ component: Bar, params: { id: '2' } }, { component: Foo, params: { id: '3' } }]), true);
      assert.match(location.path, /bar\/2\+foo\/3$/);
      BaseRouteViewModel.assertAndClear('params4', ['bar', [{ id: '2' }, new URLSearchParams()]], ['foo', [{ id: '3' }, new URLSearchParams()]]);

      try {
        await router.load([{ component: Foo, params: { id: '3' } }, { component: Bar, params: { x: '1' } }]);
        assert.fail('expected error1');
      } catch (er) {
        assert.match((er as Error).message, /No value for the required parameter 'id'/);
      }

      try {
        await router.load([{ component: Foo, params: { id: '3' } }, { component: Fizz, params: { id: '1' } }]);
        assert.fail('expected error2');
      } catch (er) {
        assert.match(
          (er as Error).message,
          /required parameter 'x'.+path: 'fizz\/:x'.+required parameter 'y'.+path: 'fizz\/:y\/:x'/
        );
      }

      // path that cannot be eagerly resolved
      assert.strictEqual(await router.load('foo/11+bar/21?b=3'), true);
      BaseRouteViewModel.assertAndClear('params5', ['foo', [{ id: '11' }, new URLSearchParams({ b: '3' })]], ['bar', [{ id: '21' }, new URLSearchParams({ b: '3' })]]);

      await au.stop();
    });

    it('with parent-child hierarchy', async function () {
      abstract class BaseRouteViewModel implements IRouteViewModel {
        public static paramsLog: Map<string, [Params, URLSearchParams]> = new Map<string, [Params, URLSearchParams]>();
        public static assertAndClear(message: string, ...expected: [key: string, value: [Params, URLSearchParams]][]) {
          const paramsLog = this.paramsLog;
          assert.deepStrictEqual(paramsLog, new Map(expected), message);
          paramsLog.clear();
        }
        public loading(params: Params, next: RouteNode, _: RouteNode): void | Promise<void> {
          BaseRouteViewModel.paramsLog.set(this.constructor.name.toLowerCase(), [params, next.queryParams]);
        }
      }

      @customElement({ name: 'ce-l21', template: '' })
      class CeL21 extends BaseRouteViewModel { }

      @customElement({ name: 'ce-l22', template: '' })
      class CeL22 extends BaseRouteViewModel { }

      @customElement({ name: 'ce-l23', template: '' })
      class CeL23 extends BaseRouteViewModel { }

      @customElement({ name: 'ce-l24', template: '' })
      class CeL24 extends BaseRouteViewModel { }

      @route({
        routes: [
          { id: '21', path: ['21/:id', '21/:id/to/:a'], component: CeL21 },
          { id: '22', path: ['22/:id'], component: CeL22 },
        ]
      })
      @customElement({ name: 'ce-l11', template: '<au-viewport></au-viewport>' })
      class CeL11 extends BaseRouteViewModel { }

      @route({
        routes: [
          { id: '23', path: ['23/:id', '23/:id/tt/:a'], component: CeL23 },
          { id: '24', path: ['24/:id'], component: CeL24 },
        ]
      })
      @customElement({ name: 'ce-l12', template: '<au-viewport></au-viewport>' })
      class CeL12 extends BaseRouteViewModel { }

      @route({
        routes: [
          { id: '11', path: ['11/:id', '11/:id/oo/:a'], component: CeL11 },
          { id: '12', path: ['12/:id'], component: CeL12 },
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
        CeL11,
        CeL21,
        CeL22,
        CeL12,
        CeL23,
        CeL24,
      );

      const au = new Aurelia(container);
      const host = ctx.createElement('div');

      await au.app({ component: Root, host }).start();

      const location = container.get(ILocation) as unknown as MockBrowserHistoryLocation;
      const router = container.get(IRouter);

      // using route-id
      assert.strictEqual(
        await router.load({
          component: '11',
          params: { id: '1', a: '3' },
          children: [{ component: '21', params: { id: '2', a: '4' } }]
        }),
        true);
      assert.match(location.path, /11\/1\/oo\/3\/21\/2\/to\/4$/);
      BaseRouteViewModel.assertAndClear('params1', ['cel11', [{ id: '1', a: '3' }, new URLSearchParams()]], ['cel21', [{ id: '2', a: '4' }, new URLSearchParams()]]);

      assert.strictEqual(
        await router.load({
          component: '12',
          params: { id: '1', a: '3' },
          children: [{ component: '24', params: { id: '2', a: '4' } }]
        }),
        true);
      assert.match(location.path, /12\/1\/24\/2\?a=3&a=4$/);
      BaseRouteViewModel.assertAndClear('params2', ['cel12', [{ id: '1' }, new URLSearchParams([['a', '3']])]], ['cel24', [{ id: '2' }, new URLSearchParams([['a', '3'], ['a', '4']])]]);

      // using CE class
      assert.strictEqual(
        await router.load({
          component: CeL11,
          params: { id: '1', a: '3' },
          children: [{ component: CeL21, params: { id: '2', a: '4' } }]
        }),
        true);
      assert.match(location.path, /11\/1\/oo\/3\/21\/2\/to\/4$/);
      BaseRouteViewModel.assertAndClear('params3', ['cel11', [{ id: '1', a: '3' }, new URLSearchParams()]], ['cel21', [{ id: '2', a: '4' }, new URLSearchParams()]]);

      assert.strictEqual(
        await router.load({
          component: CeL12,
          params: { id: '1', a: '3' },
          children: [{ component: CeL24, params: { id: '2', a: '4' } }]
        }),
        true);
      assert.match(location.path, /12\/1\/24\/2\?a=3&a=4$/);
      BaseRouteViewModel.assertAndClear('params4', ['cel12', [{ id: '1' }, new URLSearchParams([['a', '3']])]], ['cel24', [{ id: '2' }, new URLSearchParams([['a', '3'], ['a', '4']])]]);

      const el12 = host.querySelector('ce-l12');
      const ce12 = CustomElement.for<CeL12>(el12).viewModel;
      assert.strictEqual(await router.load({ component: CeL23, params: { id: '5', a: '6' } }, { context: ce12 }), true);
      assert.match(location.path, /12\/1\/23\/5\/tt\/6$/);
      BaseRouteViewModel.assertAndClear('params5', ['cel23', [{ id: '5', a: '6' }, new URLSearchParams()]]);

      await au.stop();
    });
  });

  describe('transition plan', function () {
    it('replace - inherited', async function () {
      @customElement({ name: 'ce-one', template: 'ce1 ${id1} ${id2}' })
      class CeOne implements IRouteViewModel {
        private static id1: number = 0;
        private static id2: number = 0;
        private readonly id1: number = ++CeOne.id1;
        private id2: number;
        public canLoad(): boolean {
          this.id2 = ++CeOne.id2;
          return true;
        }
      }

      @route({
        transitionPlan: 'replace',
        routes: [
          {
            id: 'ce1',
            path: 'ce1',
            component: CeOne,
          },
        ]
      })
      @customElement({ name: 'ro-ot', template: '<a load="ce1"></a><au-viewport></au-viewport>' })
      class Root { }

      const { au, container, host } = await start({ appRoot: Root, registrations: [CeOne] });
      const queue = container.get(IPlatform).domWriteQueue;

      host.querySelector('a').click();
      await queue.yield();
      assert.html.textContent(host, 'ce1 1 1', 'round#1');

      host.querySelector('a').click();
      await queue.yield();
      assert.html.textContent(host, 'ce1 2 2', 'round#2');

      await au.stop();
    });

    it('replace - inherited - sibling', async function () {
      @customElement({ name: 'ce-one', template: 'ce1 ${id1} ${id2}' })
      class CeOne implements IRouteViewModel {
        private static id1: number = 0;
        private static id2: number = 0;
        private readonly id1: number = ++CeOne.id1;
        private id2: number;
        public canLoad(): boolean {
          this.id2 = ++CeOne.id2;
          return true;
        }
      }

      @customElement({ name: 'ce-two', template: 'ce2 ${id1} ${id2}' })
      class CeTwo implements IRouteViewModel {
        private static id1: number = 0;
        private static id2: number = 0;
        private readonly id1: number = ++CeTwo.id1;
        private id2: number;
        public canLoad(): boolean {
          this.id2 = ++CeTwo.id2;
          return true;
        }
      }

      @route({
        transitionPlan: 'replace',
        routes: [
          {
            id: 'ce1',
            path: ['ce1'],
            component: CeOne,
          },
          {
            id: 'ce2',
            path: ['ce2'],
            component: CeTwo,
          },
        ]
      })
      @customElement({ name: 'ro-ot', template: '<a load="ce1@$1+ce2@$2"></a><au-viewport name="$1"></au-viewport> <au-viewport name="$2"></au-viewport>' })
      class Root { }

      const { au, container, host } = await start({ appRoot: Root, registrations: [CeOne] });
      const queue = container.get(IPlatform).domWriteQueue;

      host.querySelector('a').click();
      await queue.yield();
      assert.html.textContent(host, 'ce1 1 1 ce2 1 1', 'round#1');

      host.querySelector('a').click();
      await queue.yield();
      assert.html.textContent(host, 'ce1 2 2 ce2 2 2', 'round#2');

      await au.stop();
    });

    it('transitionPlan function #1', async function () {
      @customElement({ name: 'ce-one', template: 'ce1 ${id1} ${id2}' })
      class CeOne implements IRouteViewModel {
        private static id1: number = 0;
        private static id2: number = 0;
        private readonly id1: number = ++CeOne.id1;
        private id2: number;
        public canLoad(): boolean {
          this.id2 = ++CeOne.id2;
          return true;
        }
      }

      @route({
        transitionPlan(current: RouteNode, next: RouteNode) {
          return next.component.Type === Root ? 'replace' : 'invoke-lifecycles';
        },
        routes: [
          {
            id: 'ce1',
            path: ['ce1'],
            component: CeOne,
          },
        ]
      })
      @customElement({ name: 'ro-ot', template: '<a load="ce1"></a><au-viewport></au-viewport>' })
      class Root { }

      const { au, container, host } = await start({ appRoot: Root, registrations: [CeOne] });
      const queue = container.get(IPlatform).domWriteQueue;
      const router = container.get<Router>(IRouter);

      host.querySelector('a').click();
      await router.currentTr.promise;
      await queue.yield();
      assert.html.textContent(host, 'ce1 1 1', 'round#1');

      host.querySelector('a').click();
      await router.currentTr.promise;
      await queue.yield();
      assert.html.textContent(host, 'ce1 1 2', 'round#2');

      await au.stop();
    });

    it('transitionPlan function #2 - sibling', async function () {

      @customElement({ name: 'ce-two', template: 'ce2 ${id1} ${id2}' })
      class CeTwo implements IRouteViewModel {
        private static id1: number = 0;
        private static id2: number = 0;
        private readonly id1: number = ++CeTwo.id1;
        private id2: number;
        public canLoad(): boolean {
          this.id2 = ++CeTwo.id2;
          return true;
        }
      }

      @customElement({ name: 'ce-one', template: 'ce1 ${id1} ${id2}' })
      class CeOne implements IRouteViewModel {
        private static id1: number = 0;
        private static id2: number = 0;
        private readonly id1: number = ++CeOne.id1;
        private id2: number;
        public canLoad(): boolean {
          this.id2 = ++CeOne.id2;
          return true;
        }
      }

      @route({
        transitionPlan(current: RouteNode, next: RouteNode) {
          return next.component.Type === CeTwo ? 'invoke-lifecycles' : 'replace';
        },
        routes: [
          {
            id: 'ce1',
            path: ['ce1'],
            component: CeOne,
          },
          {
            id: 'ce2',
            path: ['ce2'],
            component: CeTwo,
          },
        ]
      })
      @customElement({ name: 'ro-ot', template: '<a load="ce1@$1+ce2@$2"></a><au-viewport name="$1"></au-viewport> <au-viewport name="$2"></au-viewport>' })
      class Root { }

      const { au, container, host } = await start({ appRoot: Root, registrations: [CeOne] });
      const queue = container.get(IPlatform).domWriteQueue;
      const router = container.get<Router>(IRouter);

      host.querySelector('a').click();
      await router.currentTr.promise;
      await queue.yield();
      assert.html.textContent(host, 'ce1 1 1 ce2 1 1', 'round#1');

      host.querySelector('a').click();
      await router.currentTr.promise;
      await queue.yield();
      assert.html.textContent(host, 'ce1 2 2 ce2 1 2', 'round#2');

      await au.stop();
    });

    it('transitionPlan function #3 - parent-child - parent:replace,child:invoke-lifecycles', async function () {

      @customElement({ name: 'ce-two', template: 'ce2 ${id1} ${id2}' })
      class CeTwo implements IRouteViewModel {
        private static id1: number = 0;
        private static id2: number = 0;
        private readonly id1: number = ++CeTwo.id1;
        private id2: number;
        public canLoad(): boolean {
          this.id2 = ++CeTwo.id2;
          return true;
        }
      }

      @route({
        routes: [
          {
            id: 'ce2',
            path: ['', 'ce2'],
            component: CeTwo,
          },
        ]
      })
      @customElement({ name: 'ce-one', template: 'ce1 ${id1} ${id2} <au-viewport></au-viewport>' })
      class CeOne implements IRouteViewModel {
        private static id1: number = 0;
        private static id2: number = 0;
        private readonly id1: number = ++CeOne.id1;
        private id2: number;
        public canLoad(): boolean {
          this.id2 = ++CeOne.id2;
          return true;
        }
      }

      @route({
        transitionPlan(current: RouteNode, next: RouteNode) {
          return next.component.Type === CeTwo ? 'invoke-lifecycles' : 'replace';
        },
        routes: [
          {
            id: 'ce1',
            path: ['ce1'],
            component: CeOne,
          }
        ]
      })
      @customElement({ name: 'ro-ot', template: '<a load="ce1"></a><au-viewport></au-viewport>' })
      class Root { }

      const { au, container, host } = await start({ appRoot: Root, registrations: [CeOne] });
      const queue = container.get(IPlatform).domWriteQueue;
      const router = container.get<Router>(IRouter);

      host.querySelector('a').click();
      await router.currentTr.promise;
      await queue.yield();
      assert.html.textContent(host, 'ce1 1 1 ce2 1 1', 'round#1');

      host.querySelector('a').click();
      await router.currentTr.promise;
      await queue.yield();
      assert.html.textContent(host, 'ce1 2 2 ce2 2 2', 'round#2'); // this happens as the ce-one (parent) is replaced causing replacement of child

      await au.stop();
    });

    it('transitionPlan function #3 - parent-child - parent:invoke-lifecycles,child:replace', async function () {

      @customElement({ name: 'ce-two', template: 'ce2 ${id1} ${id2}' })
      class CeTwo implements IRouteViewModel {
        private static id1: number = 0;
        private static id2: number = 0;
        private readonly id1: number = ++CeTwo.id1;
        private id2: number;
        public canLoad(): boolean {
          this.id2 = ++CeTwo.id2;
          return true;
        }
      }

      @route({
        routes: [
          {
            id: 'ce2',
            path: ['', 'ce2'],
            component: CeTwo,
          },
        ]
      })
      @customElement({ name: 'ce-one', template: 'ce1 ${id1} ${id2} <au-viewport></au-viewport>' })
      class CeOne implements IRouteViewModel {
        private static id1: number = 0;
        private static id2: number = 0;
        private readonly id1: number = ++CeOne.id1;
        private id2: number;
        public canLoad(): boolean {
          this.id2 = ++CeOne.id2;
          return true;
        }
      }

      @route({
        transitionPlan(current: RouteNode, next: RouteNode) {
          return next.component.Type === CeOne ? 'invoke-lifecycles' : 'replace';
        },
        routes: [
          {
            id: 'ce1',
            path: ['ce1'],
            component: CeOne,
          }
        ]
      })
      @customElement({ name: 'ro-ot', template: '<a load="ce1"></a><au-viewport></au-viewport>' })
      class Root { }

      const { au, container, host } = await start({ appRoot: Root, registrations: [CeOne] });
      const queue = container.get(IPlatform).domWriteQueue;
      const router = container.get<Router>(IRouter);

      host.querySelector('a').click();
      await router.currentTr.promise;
      await queue.yield();
      assert.html.textContent(host, 'ce1 1 1 ce2 1 1', 'round#1');

      host.querySelector('a').click();
      await router.currentTr.promise;
      await queue.yield();
      assert.html.textContent(host, 'ce1 1 2 ce2 2 2', 'round#2');

      await au.stop();
    });
  });

  describe('history strategy', function () {
    class TestData {
      public constructor(
        public readonly strategy: HistoryStrategy,
        public readonly expectations: string[]
      ) { }
    }

    function* getTestData(): Generator<TestData> {
      yield new TestData('push', [
        '#1 - len: 1 - state: {"au-nav-id":1}',
        '#2 - len: 2 - state: {"au-nav-id":2}',
        '#3 - len: 3 - state: {"au-nav-id":3}',
        '#4 - len: 4 - state: {"au-nav-id":4}',
      ]);
      yield new TestData('replace', [
        '#1 - len: 1 - state: {"au-nav-id":1}',
        '#2 - len: 1 - state: {"au-nav-id":2}',
        '#3 - len: 1 - state: {"au-nav-id":3}',
        '#4 - len: 1 - state: {"au-nav-id":4}',
      ]);
      yield new TestData('none', [
        '#1 - len: 1 - state: {"au-nav-id":1}', // initial state replace
        '#2 - len: 1 - state: {"au-nav-id":1}',
        '#3 - len: 1 - state: {"au-nav-id":1}',
        '#4 - len: 1 - state: {"au-nav-id":1}',
      ]);
    }

    for (const data of getTestData()) {
      it(data.strategy, async function () {

        @customElement({ name: 'ce-two', template: 'ce2' })
        class CeTwo implements IRouteViewModel { }

        @customElement({ name: 'ce-one', template: 'ce1' })
        class CeOne implements IRouteViewModel { }

        @route({
          routes: [
            {
              id: 'ce1',
              path: ['', 'ce1'],
              component: CeOne,
            },
            {
              id: 'ce2',
              path: ['ce2'],
              component: CeTwo,
            },
          ]
        })
        @customElement({ name: 'ro-ot', template: '<a load="ce1"></a><a load="ce2"></a><span id="history">${history}</span><au-viewport></au-viewport>' })
        class Root {
          private history: string;
          public constructor(
            @IHistory history: IHistory,
            @IRouterEvents events: IRouterEvents
          ) {
            let i = 0;
            events.subscribe('au:router:navigation-end', () => {
              this.history = `#${++i} - len: ${history.length} - state: ${JSON.stringify(history.state)}`;
            });
          }
        }

        const { au, container, host } = await start({ appRoot: Root, registrations: [CeOne, CeTwo], historyStrategy: data.strategy });
        const queue = container.get(IPlatform).domWriteQueue;
        const router = container.get<Router>(IRouter);

        const expectations = data.expectations;
        const len = expectations.length;
        await queue.yield();
        const history = host.querySelector<HTMLSpanElement>('#history');
        assert.html.textContent(history, expectations[0], 'start');
        const anchors = Array.from(host.querySelectorAll('a'));
        for (let i = 1; i < len; i++) {
          anchors[i % 2].click();
          await router.currentTr.promise;
          await queue.yield();
          assert.html.textContent(history, expectations[i], `round#${i}`);
        }

        await au.stop();
      });
    }
  });
});
