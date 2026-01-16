import { resolve } from '@aurelia/kernel';
import { IRouter, IRouteViewModel, ITypedNavigationInstruction_string, NavigationStrategy, Params, route, RouteNode } from '@aurelia/router';
import { CustomElement, customElement } from '@aurelia/runtime-html';
import { assert } from '@aurelia/testing';
import { start } from './_shared/create-fixture.js';
import { tasksSettled } from '@aurelia/runtime';

describe('router/navigation-strategy.spec.ts', function () {
  @customElement({ name: 'c-1', template: 'c1' })
  class C1 { }

  @customElement({ name: 'c-2', template: 'c2' })
  class C2 { }

  @customElement({ name: 'c-3', template: 'c3' })
  class C3 { }

  it('works for empty path', async function () {
    let dataLoaded = false;
    let factoryInvoked = 0;

    @route({
      routes: [
        C1,
        C2,
        C3,
        {
          path: '',
          component: new NavigationStrategy(() => {
            factoryInvoked++;
            if (dataLoaded) return C2;

            dataLoaded = true;
            return C1;
          })
        }
      ]
    })
    @customElement({ name: 'ro-ot', template: '<au-viewport></au-viewport>' })
    class Root { }

    const { au, container, host } = await start({ appRoot: Root });
    const router = container.get(IRouter);

    assert.html.textContent(host, 'c1', 'initial');
    assert.strictEqual(factoryInvoked, 1, 'initial - factoryInvoked');

    await navigateAndAssert('c-3', 'c3', 1, 'round#1');
    await navigateAndAssert('', 'c2', 2, 'round#2');
    await navigateAndAssert('c-3', 'c3', 2, 'round#3');
    await navigateAndAssert('', 'c2', 3, 'round#4');
    await navigateAndAssert('c-1', 'c1', 3, 'round#5');

    await au.stop(true);

    async function navigateAndAssert(route: string, expectedText: string, expectedFactoryInvocation: number, message: string) {
      await router.load(route);
      assert.html.textContent(host, expectedText, message);
      assert.strictEqual(factoryInvoked, expectedFactoryInvocation, `${message} - factoryInvoked`);
    }
  });

  it('works for non-empty path', async function () {
    let dataLoaded = false;
    let factoryInvoked = 0;

    @route({
      routes: [
        C1,
        C2,
        C3,
        {
          path: 'foo',
          component: new NavigationStrategy(() => {
            factoryInvoked++;
            if (dataLoaded) return C2;

            dataLoaded = true;
            return C1;
          })
        }
      ]
    })
    @customElement({ name: 'ro-ot', template: '<au-viewport></au-viewport>' })
    class Root { }

    const { au, container, host } = await start({ appRoot: Root });
    const router = container.get(IRouter);

    assert.html.textContent(host, '', 'initial');
    assert.strictEqual(factoryInvoked, 0, 'initial - factoryInvoked');

    await navigateAndAssert('foo', 'c1', 1, 'round#1');
    await navigateAndAssert('c-3', 'c3', 1, 'round#2');
    await navigateAndAssert('foo', 'c2', 2, 'round#3');
    await navigateAndAssert('c-3', 'c3', 2, 'round#4');
    await navigateAndAssert('foo', 'c2', 3, 'round#5');
    await navigateAndAssert('c-1', 'c1', 3, 'round#6');

    await au.stop(true);

    async function navigateAndAssert(route: string, expectedText: string, expectedFactoryInvocation: number, message: string) {
      await router.load(route);
      assert.html.textContent(host, expectedText, message);
      assert.strictEqual(factoryInvoked, expectedFactoryInvocation, `${message} - factoryInvoked`);
    }
  });

  it('works for hierarchical routing configuration - empty path', async function () {
    let dataLoaded1 = false;
    let factoryInvoked1 = 0;
    let dataLoaded2 = false;
    let factoryInvoked2 = 0;

    @route({
      routes: [
        C1,
        C2,
        C3,
        {
          path: '',
          component: new NavigationStrategy(() => {
            factoryInvoked1++;
            if (dataLoaded1) return C2;

            dataLoaded1 = true;
            return C1;
          })
        }
      ]
    })
    @customElement({ name: 'p-1', template: 'p1 <au-viewport></au-viewport>' })
    class P1 { }

    @route({
      routes: [
        C1,
        C2,
        C3,
        {
          path: '',
          component: new NavigationStrategy(() => {
            factoryInvoked2++;
            if (dataLoaded2) return C1;

            dataLoaded2 = true;
            return C2;
          })
        }
      ]
    })
    @customElement({ name: 'p-2', template: 'p2 <au-viewport></au-viewport>' })
    class P2 { }

    @route({ routes: [P1, P2, { path: '', redirectTo: 'p-1' }] })
    @customElement({ name: 'ro-ot', template: '<au-viewport></au-viewport>' })
    class Root { }

    const { au, container, host } = await start({ appRoot: Root });
    const router = container.get(IRouter);

    assert.html.textContent(host, 'p1 c1', 'initial');
    assert.strictEqual(factoryInvoked1, 1, 'initial - factory1Invoked');
    assert.strictEqual(factoryInvoked2, 0, 'initial - factory2Invoked');

    await navigateAndAssert('p-1/c-3', 'p1 c3', 1, 0, 'round#1');
    await navigateAndAssert('p-2', 'p2 c2', 1, 1, 'round#2');
    await navigateAndAssert('p-2/c-3', 'p2 c3', 1, 1, 'round#3');
    await navigateAndAssert('p-1', 'p1 c2', 2, 1, 'round#4');
    await navigateAndAssert('p-2', 'p2 c1', 2, 2, 'round#5');
    await navigateAndAssert('p-1/c-1', 'p1 c1', 2, 2, 'round#6');
    await navigateAndAssert('p-2/c-2', 'p2 c2', 2, 2, 'round#7');

    await au.stop(true);

    async function navigateAndAssert(route: string, expectedText: string, expectedFactory1Invocation: number, expectedFactory2Invocation: number, message: string) {
      await router.load(route);
      assert.html.textContent(host, expectedText, message);
      assert.strictEqual(factoryInvoked1, expectedFactory1Invocation, `${message} - factory1Invoked`);
      assert.strictEqual(factoryInvoked2, expectedFactory2Invocation, `${message} - factory2Invoked`);
    }
  });

  it('works for hierarchical routing configuration - non-empty path', async function () {
    let dataLoaded1 = false;
    let factoryInvoked1 = 0;
    let dataLoaded2 = false;
    let factoryInvoked2 = 0;

    @route({
      routes: [
        C1,
        C2,
        C3,
        {
          path: 'foo',
          component: new NavigationStrategy(() => {
            factoryInvoked1++;
            if (dataLoaded1) return C2;

            dataLoaded1 = true;
            return C1;
          })
        }
      ]
    })
    @customElement({ name: 'p-1', template: 'p1 <au-viewport></au-viewport>' })
    class P1 { }

    @route({
      routes: [
        C1,
        C2,
        C3,
        {
          path: 'bar',
          component: new NavigationStrategy(() => {
            factoryInvoked2++;
            if (dataLoaded2) return C1;

            dataLoaded2 = true;
            return C2;
          })
        }
      ]
    })
    @customElement({ name: 'p-2', template: 'p2 <au-viewport></au-viewport>' })
    class P2 { }

    @route({ routes: [P1, P2] })
    @customElement({ name: 'ro-ot', template: '<au-viewport></au-viewport>' })
    class Root { }

    const { au, container, host } = await start({ appRoot: Root });
    const router = container.get(IRouter);

    assert.html.textContent(host, '', 'initial');
    assert.strictEqual(factoryInvoked1, 0, 'initial - factory1Invoked');
    assert.strictEqual(factoryInvoked2, 0, 'initial - factory2Invoked');

    await navigateAndAssert('p-1/foo', 'p1 c1', 1, 0, 'round#0');
    await navigateAndAssert('p-1/c-3', 'p1 c3', 1, 0, 'round#1');
    await navigateAndAssert('p-2/bar', 'p2 c2', 1, 1, 'round#2');
    await navigateAndAssert('p-2/c-3', 'p2 c3', 1, 1, 'round#3');
    await navigateAndAssert('p-1/foo', 'p1 c2', 2, 1, 'round#4');
    await navigateAndAssert('p-2/bar', 'p2 c1', 2, 2, 'round#5');
    await navigateAndAssert('p-1/c-1', 'p1 c1', 2, 2, 'round#6');
    await navigateAndAssert('p-2/c-2', 'p2 c2', 2, 2, 'round#7');

    await au.stop(true);

    async function navigateAndAssert(route: string, expectedText: string, expectedFactory1Invocation: number, expectedFactory2Invocation: number, message: string) {
      await router.load(route);
      assert.html.textContent(host, expectedText, message);
      assert.strictEqual(factoryInvoked1, expectedFactory1Invocation, `${message} - factory1Invoked`);
      assert.strictEqual(factoryInvoked2, expectedFactory2Invocation, `${message} - factory2Invoked`);
    }
  });

  it('dynamic navigation strategy - required parameter', async function () {
    @route({
      routes: [
        C1,
        C2,
        C3,
        {
          path: 'foo/:id',
          component: new NavigationStrategy((_vi, _ctx, _node, route) => {
            const idRaw = route.params.id;
            const idNum = Number(idRaw);
            if (Number.isNaN(idNum)) return C3;
            return idNum % 2 === 0 ? C2 : C1;
          })
        }
      ]
    })
    @customElement({ name: 'ro-ot', template: '<au-viewport></au-viewport>' })
    class Root { }

    const { au, container, host } = await start({ appRoot: Root });
    const router = container.get(IRouter);

    assert.html.textContent(host, '', 'initial');

    await navigateAndAssert('foo/1', 'c1', 'round#1');
    await navigateAndAssert('foo/2', 'c2', 'round#2');
    await navigateAndAssert('foo/a', 'c3', 'round#3');
    await navigateAndAssert('foo/3', 'c1', 'round#4');
    await navigateAndAssert('foo/b', 'c3', 'round#5');
    await navigateAndAssert('foo/4', 'c2', 'round#6');

    await au.stop(true);

    async function navigateAndAssert(route: string, expectedText: string, message: string) {
      await router.load(route);
      assert.html.textContent(host, expectedText, message);
    }
  });

  it('dynamic navigation strategy - wildcard parameter', async function () {
    @route({
      routes: [
        C1,
        C2,
        C3,
        {
          path: 'foo/*rest',
          component: new NavigationStrategy((vi, _ctx, _node) => {
            const numParts = (vi.component as ITypedNavigationInstruction_string).value.split('/').length - 1;
            switch (numParts) {
              case 1:
                return C1;
              case 2:
                return C2;
              default:
                return C3;
            }
          })
        }
      ]
    })
    @customElement({ name: 'ro-ot', template: '<au-viewport></au-viewport>' })
    class Root { }

    const { au, container, host } = await start({ appRoot: Root });
    const router = container.get(IRouter);

    assert.html.textContent(host, '', 'initial');

    await navigateAndAssert('foo/a', 'c1', 'round#1');
    await navigateAndAssert('foo/a/b', 'c2', 'round#2');
    await navigateAndAssert('foo/a/b/c', 'c3', 'round#3');
    await navigateAndAssert('foo/e', 'c1', 'round#4');
    await navigateAndAssert('foo/e/f/g/h', 'c3', 'round#5');
    await navigateAndAssert('foo/a/f', 'c2', 'round#6');

    await au.stop(true);

    async function navigateAndAssert(route: string, expectedText: string, message: string) {
      await router.load(route);
      assert.html.textContent(host, expectedText, message);
    }
  });

  for (const type of ['ce-name', 'ce-defn'] as const) {
    it(`works if the navigation strategy factory returns ${type}`, async function () {
      let dataLoaded = false;
      let factoryInvoked = 0;

      @route({
        routes: [
          { path: 'c1', component: C1 },
          { path: 'c2', component: C2 },
          { path: 'c3', component: C3 },
          {
            path: 'foo',
            component: new NavigationStrategy(() => {
              factoryInvoked++;
              if (dataLoaded) {
                switch (type) {
                  case 'ce-name': return 'c-2';
                  case 'ce-defn': return CustomElement.getDefinition(C2);
                }
              }

              dataLoaded = true;
              switch (type) {
                case 'ce-name': return 'c-1';
                case 'ce-defn': return CustomElement.getDefinition(C1);
              }
            })
          }
        ]
      })
      @customElement({ name: 'ro-ot', template: '<au-viewport></au-viewport>' })
      class Root { }

      const { au, container, host } = await start({ appRoot: Root, registrations: [C1, C2, C3] });
      const router = container.get(IRouter);

      assert.html.textContent(host, '', 'initial');
      assert.strictEqual(factoryInvoked, 0, 'initial - factoryInvoked');

      await navigateAndAssert('foo', 'c1', 1, 'round#1');
      await navigateAndAssert('c3', 'c3', 1, 'round#2');
      await navigateAndAssert('foo', 'c2', 2, 'round#3');
      await navigateAndAssert('c3', 'c3', 2, 'round#4');
      await navigateAndAssert('foo', 'c2', 3, 'round#5');
      await navigateAndAssert('c1', 'c1', 3, 'round#6');

      await au.stop(true);

      async function navigateAndAssert(route: string, expectedText: string, expectedFactoryInvocation: number, message: string) {
        await router.load(route);
        assert.html.textContent(host, expectedText, message);
        assert.strictEqual(factoryInvoked, expectedFactoryInvocation, `${message} - factoryInvoked`);
      }
    });
  }

  /**
   * This test asserts an userland scenario, where a component is used temporarily by the navigation strategy,
   * and after the waiting is done, another component is loaded by this temporary component.
   * Refer: https://github.com/aurelia/aurelia/pull/2137#issuecomment-2767516591
   *
   * Note that the 'loading' promise is resolved after the temporary component is attached.
   */
  it('load new route', async function () {

    let resolver: () => void;
    const promise = new Promise<void>(r => resolver = r);
    let dataLoaded = false;

    @customElement({ name: 'c-1', template: 'c1' })
    class C11 implements IRouteViewModel {
      private readonly router: IRouter = resolve(IRouter);
      public canLoad(params: Params, _next: RouteNode, _current: RouteNode | null): boolean {
        void promise.then(() => this.router.load(`p-1/c-12/${params.id}`, { transitionPlan: 'replace' }));
        return true;
      }
    }

    @customElement({ name: 'c-2', template: 'c2' })
    class C12 { }

    @route({
      routes: [
        C11,
        { path: 'c-12/:id', component: C12 },
        {
          path: ':id',
          component: new NavigationStrategy(() => {
            if (dataLoaded) return C12;

            dataLoaded = true;
            return C11;
          })
        }
      ]
    })
    @customElement({ name: 'p-1', template: 'p1 <au-viewport></au-viewport>' })
    class P1 { }

    @customElement({ name: 'p-2', template: 'p2' })
    class P2 { }

    @route({ routes: [P1, P2] })
    @customElement({ name: 'ro-ot', template: '<au-viewport></au-viewport>' })
    class Root { }

    const { au, container, host } = await start({ appRoot: Root });
    const router = container.get(IRouter);

    assert.html.textContent(host, '', 'initial');

    await router.load('p-1/1');
    assert.html.textContent(host, 'p1 c1', 'round#1');

    // resolve the promise to trigger the navigation
    resolver!();
    await tasksSettled();
    assert.html.textContent(host, 'p1 c2', 'initial');

    await au.stop(true);
  });

  it('load new route and activates child viewport - explicit navigation instruction', async function () {

    let resolver: () => void;
    const promise = new Promise<void>(r => resolver = r);
    let dataLoaded = false;

    @customElement({ name: 'gc-12', template: 'gc12' })
    class GC12 { }

    @customElement({ name: 'c-11', template: 'c11' })
    class C11 implements IRouteViewModel {
      private readonly router: IRouter = resolve(IRouter);
      public canLoad(params: Params, _next: RouteNode, _current: RouteNode | null): boolean {
        void promise.then(() => this.router.load(`p-1/c-12/${params.id}`, { transitionPlan: 'replace' }));
        return true;
      }
    }

    @customElement({ name: 'c-12', template: 'c12 <au-viewport></au-viewport>' })
    @route({
      routes: [
        C11,
        { path: ['', 'gc-12'], component: GC12 }
      ]
    })
    class C12 { }

    @route({
      routes: [
        C11,
        { path: 'c-12/:id', component: C12 },
        {
          path: ':id',
          component: new NavigationStrategy(() => {
            if (dataLoaded) return C12;

            dataLoaded = true;
            return C11;
          })
        }
      ]
    })
    @customElement({ name: 'p-1', template: 'p1 <au-viewport></au-viewport>' })
    class P1 { }

    @customElement({ name: 'p-2', template: 'p2' })
    class P2 { }

    @route({ routes: [P1, P2] })
    @customElement({ name: 'ro-ot', template: '<au-viewport></au-viewport>' })
    class Root { }

    const { au, container, host } = await start({ appRoot: Root });
    const router = container.get(IRouter);

    assert.html.textContent(host, '', 'initial');

    await router.load('p-1/1');
    assert.html.textContent(host, 'p1 c11', 'round#1');

    // resolve the promise to trigger the navigation
    resolver!();
    await tasksSettled();
    assert.html.textContent(host, 'p1 c12 gc12', 'post-data-load');

    await au.stop(true);
  });

  it('load new route and activates child viewport - reuses the navigation strategy', async function () {

    const resolvers = {};
    const promises = {
      1: new Promise<void>(r => resolvers[1] = r),
      2: new Promise<void>(r => resolvers[2] = r),
      3: new Promise<void>(r => resolvers[3] = r),
    };

    const dataLoaded = {
      1: false,
      2: false,
      3: false,
    };

    @customElement({ name: 'gc-12', template: 'gc12' })
    class GC12 { }

    @customElement({ name: 'c-11', template: 'c11' })
    class C11 implements IRouteViewModel {
      private readonly router: IRouter = resolve(IRouter);
      public canLoad(params: Params, _next: RouteNode, _current: RouteNode | null): boolean {
        void promises[params.id].then(() => this.router.load(`p-1/${params.id}`, { transitionPlan: 'replace' }));
        return true;
      }
    }

    @customElement({ name: 'c-12', template: 'c12 ${id} <au-viewport></au-viewport>' })
    @route({
      routes: [
        C11,
        { path: ['', 'gc-12'], component: GC12 }
      ]
    })
    class C12 {
      id: string;
      loading(params) { this.id = params.id; }
    }

    @customElement({ name: 'c-13', template: 'c13' })
    class C13 implements IRouteViewModel { }

    @route({
      routes: [
        C11,
        C12,
        C13,
        {
          path: ':id',
          component: new NavigationStrategy((_vi, _ctx, _node, route) => {
            if (dataLoaded[route.params.id]) return C12;

            dataLoaded[route.params.id] = true;
            return C11;
          })
        }
      ]
    })
    @customElement({ name: 'p-1', template: 'p1 <au-viewport></au-viewport>' })
    class P1 { }

    @customElement({ name: 'p-2', template: 'p2' })
    class P2 { }

    @route({ routes: [P1, P2] })
    @customElement({ name: 'ro-ot', template: '<au-viewport></au-viewport>' })
    class Root { }

    const { au, container, host } = await start({ appRoot: Root });
    const router = container.get(IRouter);

    assert.html.textContent(host, '', 'initial');

    await router.load('p-1/1');
    assert.html.textContent(host, 'p1 c11', 'round#1');

    // resolve the promise to trigger the navigation
    resolvers[1]();
    await tasksSettled();
    assert.html.textContent(host, 'p1 c12 1 gc12', 'post-data-load');

    // reset to some other route in the p-1 hierarchy
    await router.load('p-1/c-13');
    assert.html.textContent(host, 'p1 c13', 'reset');

    await router.load('p-1/2');
    assert.html.textContent(host, 'p1 c11', 'round#2');

    // resolve the promise to trigger the navigation
    resolvers[2]();
    await tasksSettled();
    assert.html.textContent(host, 'p1 c12 2 gc12', 'post-data-load 2');

    // go to p-2
    await router.load('p-2');
    assert.html.textContent(host, 'p2', 'reset to p-2');

    // go back to p-1
    await router.load('p-1/1');
    assert.html.textContent(host, 'p1 c12 1 gc12', 'round#3');

    // load p-1/3
    await router.load('p-1/3');
    assert.html.textContent(host, 'p1 c11', 'round#4');

    // resolve the promise to trigger the navigation
    resolvers[3]();
    await tasksSettled();
    assert.html.textContent(host, 'p1 c12 3 gc12', 'post-data-load 3');

    await au.stop(true);
  });

  it('does not work with eager loading', async function () {
    @route({
      routes: [
        C1,
        C2,
        C3,
        {
          path: '',
          component: new NavigationStrategy(() => { throw new Error('Unexpected invocation'); })
        }
      ]
    })
    @customElement({ name: 'ro-ot', template: '<au-viewport></au-viewport>' })
    class Root { }

    try {
      await start({ appRoot: Root, useEagerLoading: true });
      assert.fail('expected error');
    } catch (er) {
      assert.match(er.message, /AUR3558/);
    }
  });
});
