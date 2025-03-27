import { IRouter, NavigationStrategy, route } from '@aurelia/router-lite';
import { customElement } from '@aurelia/runtime-html';
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
});
