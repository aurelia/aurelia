import { LogLevel, Constructable, kebabCase, ILogConfig } from '@aurelia/kernel';
import { assert, TestContext } from '@aurelia/testing';
import { RouterConfiguration, IRouter, NavigationInstruction, IRouteContext, RouteNode, Params, route, IRouterOptions } from '@aurelia/router-lite';
import { Aurelia, customElement, CustomElement, IPlatform } from '@aurelia/runtime-html';

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
      { path: 'a01', component: A01 },
      { path: 'a02', component: A02 },
    ]
  })
  @customElement({ name: 'a11', template: `a11${vp(1)}` })
  class A11 { }

  @route({
    routes: [
      { path: 'a01', component: A01 },
      { path: 'a02', component: A02 },
      { path: 'a11', component: A11 },
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
      { path: 'a01', component: A01 },
      { path: 'a02', component: A02 },
      { path: 'b01', component: B01 },
      { path: 'b02', component: B02 },
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
      { path: 'a01', component: A01 },
      { path: 'a02', component: A02 },
      { path: 'b01', component: B01 },
      { path: 'b02', component: B02 },
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
      { path: 'a01', component: A01 },
      { path: 'a02', component: A02 },
      { path: 'a11', component: A11 },
      { path: 'a12', component: A12 },
      { path: 'b11', component: B11 },
      { path: 'b12', component: B12 },
    ]
  })
  @customElement({ name: 'root1', template: `root1${vp(1)}` })
  class Root1 { }

  @route({
    routes: [
      { path: 'a01', component: A01 },
      { path: 'a02', component: A02 },
      { path: 'a11', component: A11 },
      { path: 'a12', component: A12 },
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
          { path: 'a', component: A },
          { path: 'b', component: B },
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
          { path: 'a', component: A },
          { path: 'b', component: B },
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
          { path: 'b', component: B },
          { path: 'c', component: C },
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
          { path: 'a', component: A },
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

    // TODO(sayan): change this test for redirect to missing-configuration route (404)
    it.skip(`will load the fallback when navigating to a non-existing route with mode: ${mode}`, async function () {
      @customElement({ name: 'a', template: 'a' })
      class A { }
      @route({
        routes: [
          { path: 'a', component: A },
        ]
      })
      @customElement({
        name: 'root',
        template: `root<au-viewport fallback="a">`,
        dependencies: [A],
      })
      class Root { }

      const ctx = TestContext.create();
      const { container } = ctx;

      container.register(TestRouterConfiguration.for(LogLevel.debug));
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

  it(`correctly parses parameters`, async function () {
    const a1Params: Params[] = [];
    const a2Params: Params[] = [];
    const b1Params: Params[] = [];
    const b2arams: Params[] = [];
    @customElement({ name: 'b1', template: null })
    class B1 {
      public load(params: Params) {
        b1Params.push(params);
      }
    }
    @customElement({ name: 'b2', template: null })
    class B2 {
      public load(params: Params) {
        b2arams.push(params);
      }
    }
    @route({
      routes: [
        { path: 'b1/:b', component: B1 },
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
        { path: 'b2/:d', component: B2 },
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
        { path: 'a1/:a', component: A1 },
        { path: 'a2/:c', component: A2 },
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

    // TODO(sayan): avoid adding parent parameters; or add those to a separate property.
    assert.deepStrictEqual(
      [
        a1Params,
        b1Params,
        a2Params,
        b2arams,
      ],
      [
        [
          { a: 'a' },
          { a: '1' },
        ],
        [
          { a: 'a', b: 'b' },
          { a: '1', b: '2' },
        ],
        [
          { c: 'c' },
          { c: '3' },
        ],
        [
          { c: 'c', d: 'd' },
          { c: '3', d: '4' },
        ],
      ],
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
        { path: ['a', 'a/:foo'], component: VmA, title: 'A', },
        { path: ['', 'b'], component: VmB, title: 'B' },
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
});
