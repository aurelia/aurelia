/* eslint-disable @typescript-eslint/consistent-type-assertions */
import { resolve } from '@aurelia/kernel';
import { ICurrentRoute, IRouteViewModel, IRouter, ParameterInformation, Params, RouteConfig, route } from '@aurelia/router-lite';
import { customElement } from '@aurelia/runtime-html';
import { assert } from '@aurelia/testing';
import { start } from './_shared/create-fixture.js';

describe('router-lite/current-route.spec.ts', function () {

  const emptyParams = Object.create(null) as Params;
  function assertCurrentRoute(actual: ICurrentRoute, expected: Partial<ICurrentRoute>, messagePrefix: string = '') {
    assert.strictEqual(actual.path, expected.path, `${messagePrefix} - path`);
    assert.strictEqual(actual.url.endsWith(expected.url), true, `${messagePrefix} - url: ${actual.url} vs ${expected.url}`);
    assert.strictEqual(actual.title, expected.title, `${messagePrefix} - title`);
    assert.strictEqual(actual.query.toString(), expected.query.toString(), `${messagePrefix} - query`);

    assert.strictEqual(actual.parameterInformation.length, expected.parameterInformation.length, `${messagePrefix} - parameterInformation.length`);
    for (let i = 0; i < actual.parameterInformation.length; i++) {
      assertParameterInformation(actual.parameterInformation[i], expected.parameterInformation[i], `${messagePrefix} - parameterInformation[${i}]`);
    }
  }

  function assertParameterInformation(actual: ParameterInformation, expected: Partial<ParameterInformation>, messagePrefix: string) {
    assert.strictEqual(actual.config?.id, expected.config.id, `${messagePrefix}.config.id`);

    const expectedParams = Object.create(null);
    Object.assign(expectedParams, expected.params);
    assert.deepStrictEqual(actual.params, expectedParams, `${messagePrefix}.params`);

    assert.strictEqual(actual.children.length, expected.children.length, `${messagePrefix}.children.length`);
    for (let i = 0; i < actual.children.length; i++) {
      assertParameterInformation(actual.children[i], expected.children[i], `${messagePrefix}.children[${i}]`);
    }
  }

  it('single-level routing', async function () {
    @customElement({ name: 'c-1', template: '' })
    class C1 implements IRouteViewModel { }

    @customElement({ name: 'c-2', template: '' })
    class C2 { }

    @route({
      routes: [
        { id: 'r1', path: ['c-1', 'c-1/:id1'], component: C1, title: 'C1' },
        { id: 'r2', path: ['c-2', 'c-2/:id2'], component: C2, title: 'C2' },
      ]
    })
    @customElement({ name: 'app', template: '<au-viewport></au-viewport>' })
    class App {
      public readonly currentRoute: ICurrentRoute = resolve(ICurrentRoute);
    }

    const { au, container, rootVm } = await start({ appRoot: App });
    const router = container.get(IRouter);

    await router.load('c-1');
    assertCurrentRoute(rootVm.currentRoute, {
      path: 'c-1',
      url: 'c-1',
      title: 'C1',
      query: new URLSearchParams(),
      parameterInformation: [
        {
          config: { id: 'r1' } as RouteConfig,
          params: emptyParams,
          children: [],
        }
      ]
    }, 'round#1');

    await router.load('c-2');
    assertCurrentRoute(rootVm.currentRoute, {
      path: 'c-2',
      url: 'c-2',
      title: 'C2',
      query: new URLSearchParams(),
      parameterInformation: [
        {
          config: { id: 'r2' } as RouteConfig,
          params: emptyParams,
          children: [],
        }
      ]
    }, 'round#2');

    await router.load('c-1/1');
    assertCurrentRoute(rootVm.currentRoute, {
      path: 'c-1/1',
      url: 'c-1/1',
      title: 'C1',
      query: new URLSearchParams(),
      parameterInformation: [
        {
          config: { id: 'r1' } as RouteConfig,
          params: { id1: '1' },
          children: [],
        }
      ]
    }, 'round#3');

    await router.load('c-2/2');
    assertCurrentRoute(rootVm.currentRoute, {
      path: 'c-2/2',
      url: 'c-2/2',
      title: 'C2',
      query: new URLSearchParams(),
      parameterInformation: [
        {
          config: { id: 'r2' } as RouteConfig,
          params: { id2: '2' },
          children: [],
        }
      ]
    }, 'round#4');

    await au.stop();
  });
});
