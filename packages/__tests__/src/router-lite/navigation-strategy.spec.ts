import { IRouter, ITypedNavigationInstruction_string, NavigationStrategy, route } from '@aurelia/router-lite';
import { CustomElement, customElement } from '@aurelia/runtime-html';
import { assert } from '@aurelia/testing';
import { start } from './_shared/create-fixture.js';

describe('router-lite/navigation-strategy.spec.ts', function () {
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
});
