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
    assert.strictEqual(actual.viewport, expected.viewport, `${messagePrefix}.viewport`);

    const expectedParams = Object.create(null);
    Object.assign(expectedParams, expected.params);
    assert.deepStrictEqual(actual.params, expectedParams, `${messagePrefix}.params`);

    assert.strictEqual(actual.children.length, expected.children.length, `${messagePrefix}.children.length`);
    for (let i = 0; i < actual.children.length; i++) {
      assertParameterInformation(actual.children[i], expected.children[i], `${messagePrefix}.children[${i}]`);
    }
  }

  it('single-level', async function () {
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
          viewport: 'default',
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
          viewport: 'default',
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
          viewport: 'default',
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
          viewport: 'default',
          params: { id2: '2' },
          children: [],
        }
      ]
    }, 'round#4');

    await router.load('c-1/3?foo=bar');
    assertCurrentRoute(rootVm.currentRoute, {
      path: 'c-1/3',
      url: 'c-1/3?foo=bar',
      title: 'C1',
      query: new URLSearchParams('foo=bar'),
      parameterInformation: [
        {
          config: { id: 'r1' } as RouteConfig,
          viewport: 'default',
          params: { id1: '3' },
          children: [],
        }
      ]
    }, 'round#5');

    await router.load('c-2/4?fizz=bizz');
    assertCurrentRoute(rootVm.currentRoute, {
      path: 'c-2/4',
      url: 'c-2/4?fizz=bizz',
      title: 'C2',
      query: new URLSearchParams('fizz=bizz'),
      parameterInformation: [
        {
          config: { id: 'r2' } as RouteConfig,
          viewport: 'default',
          params: { id2: '4' },
          children: [],
        }
      ]
    }, 'round#6');

    await au.stop();
  });

  it('parent/child', async function () {
    @customElement({ name: 'c-11', template: 'c-11' })
    class C11 implements IRouteViewModel { }
    @customElement({ name: 'c-12', template: 'c-12' })
    class C12 implements IRouteViewModel { }
    @customElement({ name: 'c-21', template: 'c-21' })
    class C21 implements IRouteViewModel { }
    @customElement({ name: 'c-22', template: 'c-22' })
    class C22 implements IRouteViewModel { }

    @route({
      routes: [
        { id: 'r11', path: ['c-11', 'c-11/:id1'], component: C11, title: 'C11' },
        { id: 'r12', path: ['c-12', 'c-12/:id2'], component: C12, title: 'C12' },
      ]
    })
    @customElement({ name: 'c-1', template: 'c-1 <au-viewport></au-viewport>' })
    class C1 implements IRouteViewModel { }

    @route({
      routes: [
        { id: 'r21', path: ['c-21', 'c-21/:id1'], component: C21, title: 'C21' },
        { id: 'r22', path: ['c-22', 'c-22/:id2'], component: C22, title: 'C22' },
      ]
    })
    @customElement({ name: 'c-2', template: 'c-2 <au-viewport></au-viewport>' })
    class C2 { }

    @route({
      routes: [
        { id: 'r1', path: ['c-1'], component: C1, title: 'C1' },
        { id: 'r2', path: ['c-2'], component: C2, title: 'C2' },
      ]
    })
    @customElement({ name: 'app', template: '<au-viewport></au-viewport>' })
    class App {
      public readonly currentRoute: ICurrentRoute = resolve(ICurrentRoute);
    }

    const { au, container, rootVm } = await start({ appRoot: App, registrations: [C11, C12, C21, C22] });
    const router = container.get(IRouter);

    await router.load('c-1/c-11');
    assertCurrentRoute(rootVm.currentRoute, {
      path: 'c-1/c-11',
      url: 'c-1/c-11',
      title: 'C11 | C1',
      query: new URLSearchParams(),
      parameterInformation: [
        {
          config: { id: 'r1' } as RouteConfig,
          viewport: 'default',
          params: emptyParams,
          children: [
            {
              config: { id: 'r11' } as RouteConfig,
          viewport: 'default',
          params: emptyParams,
              children: [],
            }
          ],
        }
      ]
    }, 'round#1');

    await router.load('c-2/c-21');
    assertCurrentRoute(rootVm.currentRoute, {
      path: 'c-2/c-21',
      url: 'c-2/c-21',
      title: 'C21 | C2',
      query: new URLSearchParams(),
      parameterInformation: [
        {
          config: { id: 'r2' } as RouteConfig,
          viewport: 'default',
          params: emptyParams,
          children: [
            {
              config: { id: 'r21' } as RouteConfig,
          viewport: 'default',
          params: emptyParams,
              children: [],
            }
          ],
        }
      ]
    }, 'round#2');

    await router.load('c-1/c-12/1');
    assertCurrentRoute(rootVm.currentRoute, {
      path: 'c-1/c-12/1',
      url: 'c-1/c-12/1',
      title: 'C12 | C1',
      query: new URLSearchParams(),
      parameterInformation: [
        {
          config: { id: 'r1' } as RouteConfig,
          viewport: 'default',
          params: emptyParams,
          children: [
            {
              config: { id: 'r12' } as RouteConfig,
          viewport: 'default',
          params: { id2: '1' },
              children: [],
            }
          ],
        }
      ]
    }, 'round#3');

    await router.load('c-1/c-12/2');
    assertCurrentRoute(rootVm.currentRoute, {
      path: 'c-1/c-12/2',
      url: 'c-1/c-12/2',
      title: 'C12 | C1',
      query: new URLSearchParams(),
      parameterInformation: [
        {
          config: { id: 'r1' } as RouteConfig,
          viewport: 'default',
          params: emptyParams,
          children: [
            {
              config: { id: 'r12' } as RouteConfig,
          viewport: 'default',
          params: { id2: '2' },
              children: [],
            }
          ],
        }
      ]
    }, 'round#4');

    await router.load('c-1/c-11/3');
    assertCurrentRoute(rootVm.currentRoute, {
      path: 'c-1/c-11/3',
      url: 'c-1/c-11/3',
      title: 'C11 | C1',
      query: new URLSearchParams(),
      parameterInformation: [
        {
          config: { id: 'r1' } as RouteConfig,
          viewport: 'default',
          params: emptyParams,
          children: [
            {
              config: { id: 'r11' } as RouteConfig,
          viewport: 'default',
          params: { id1: '3' },
              children: [],
            }
          ],
        }
      ]
    }, 'round#5');

    await router.load('c-2/c-21/4');
    assertCurrentRoute(rootVm.currentRoute, {
      path: 'c-2/c-21/4',
      url: 'c-2/c-21/4',
      title: 'C21 | C2',
      query: new URLSearchParams(),
      parameterInformation: [
        {
          config: { id: 'r2' } as RouteConfig,
          viewport: 'default',
          params: emptyParams,
          children: [
            {
              config: { id: 'r21' } as RouteConfig,
          viewport: 'default',
          params: { id1: '4' },
              children: [],
            }
          ],
        }
      ]
    }, 'round#6');

    await router.load('c-2/c-22/5');
    assertCurrentRoute(rootVm.currentRoute, {
      path: 'c-2/c-22/5',
      url: 'c-2/c-22/5',
      title: 'C22 | C2',
      query: new URLSearchParams(),
      parameterInformation: [
        {
          config: { id: 'r2' } as RouteConfig,
          viewport: 'default',
          params: emptyParams,
          children: [
            {
              config: { id: 'r22' } as RouteConfig,
          viewport: 'default',
          params: { id2: '5' },
              children: [],
            }
          ],
        }
      ]
    }, 'round#7');

    await router.load('c-1/c-12/6?foo=bar');
    assertCurrentRoute(rootVm.currentRoute, {
      path: 'c-1/c-12/6',
      url: 'c-1/c-12/6?foo=bar',
      title: 'C12 | C1',
      query: new URLSearchParams('foo=bar'),
      parameterInformation: [
        {
          config: { id: 'r1' } as RouteConfig,
          viewport: 'default',
          params: emptyParams,
          children: [
            {
              config: { id: 'r12' } as RouteConfig,
          viewport: 'default',
          params: { id2: '6' },
              children: [],
            }
          ],
        }
      ]
    }, 'round#8');

    await router.load('c-2/c-21/7?fizz=bizz');
    assertCurrentRoute(rootVm.currentRoute, {
      path: 'c-2/c-21/7',
      url: 'c-2/c-21/7?fizz=bizz',
      title: 'C21 | C2',
      query: new URLSearchParams('fizz=bizz'),
      parameterInformation: [
        {
          config: { id: 'r2' } as RouteConfig,
          viewport: 'default',
          params: emptyParams,
          children: [
            {
              config: { id: 'r21' } as RouteConfig,
          viewport: 'default',
          params: { id1: '7' },
              children: [],
            }
          ],
        }
      ]
    }, 'round#9');

    await au.stop();
  });

  it('sibling', async function () {
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
    @customElement({ name: 'app', template: '<au-viewport name="vp1"></au-viewport><au-viewport name="vp2"></au-viewport>' })
    class App {
      public readonly currentRoute: ICurrentRoute = resolve(ICurrentRoute);
    }

    const { au, container, rootVm } = await start({ appRoot: App });
    const router = container.get(IRouter);

    await router.load('c-1+c-2');
    assertCurrentRoute(rootVm.currentRoute, {
      path: 'c-1@vp1+c-2@vp2',
      url: 'c-1@vp1+c-2@vp2',
      title: 'C1 | C2',
      query: new URLSearchParams(),
      parameterInformation: [
        {
          config: { id: 'r1' } as RouteConfig,
          viewport: 'vp1',
          params: emptyParams,
          children: [],
        },
        {
          config: { id: 'r2' } as RouteConfig,
          viewport: 'vp2',
          params: emptyParams,
          children: [],
        },
      ]
    }, 'round#1');

    await router.load('c-1@vp2+c-2@vp1');
    assertCurrentRoute(rootVm.currentRoute, {
      path: 'c-1@vp2+c-2@vp1',
      url: 'c-1@vp2+c-2@vp1',
      title: 'C1 | C2',
      query: new URLSearchParams(),
      parameterInformation: [
        {
          config: { id: 'r1' } as RouteConfig,
          viewport: 'vp2',
          params: emptyParams,
          children: [],
        },
        {
          config: { id: 'r2' } as RouteConfig,
          viewport: 'vp1',
          params: emptyParams,
          children: [],
        },
      ]
    }, 'round#2');

    await router.load('c-2/1@vp1+c-1@vp2');
    assertCurrentRoute(rootVm.currentRoute, {
      path: 'c-2/1@vp1+c-1@vp2',
      url: 'c-2/1@vp1+c-1@vp2',
      title: 'C2 | C1',
      query: new URLSearchParams(),
      parameterInformation: [
        {
          config: { id: 'r2' } as RouteConfig,
          viewport: 'vp1',
          params: { id2: '1' },
          children: [],
        },
        {
          config: { id: 'r1' } as RouteConfig,
          viewport: 'vp2',
          params: emptyParams,
          children: [],
        },
      ]
    }, 'round#3');

    await router.load('c-2/1@vp1+c-1/3@vp2');
    assertCurrentRoute(rootVm.currentRoute, {
      path: 'c-2/1@vp1+c-1/3@vp2',
      url: 'c-2/1@vp1+c-1/3@vp2',
      title: 'C2 | C1',
      query: new URLSearchParams(),
      parameterInformation: [
        {
          config: { id: 'r2' } as RouteConfig,
          viewport: 'vp1',
          params: { id2: '1' },
          children: [],
        },
        {
          config: { id: 'r1' } as RouteConfig,
          viewport: 'vp2',
          params: { id1: '3' },
          children: [],
        },
      ]
    }, 'round#4');

    await router.load('c-1/2@vp1+c-1/4@vp2');
    assertCurrentRoute(rootVm.currentRoute, {
      path: 'c-1/2@vp1+c-1/4@vp2',
      url: 'c-1/2@vp1+c-1/4@vp2',
      title: 'C1 | C1',
      query: new URLSearchParams(),
      parameterInformation: [
        {
          config: { id: 'r1' } as RouteConfig,
          viewport: 'vp1',
          params: { id1: '2' },
          children: [],
        },
        {
          config: { id: 'r1' } as RouteConfig,
          viewport: 'vp2',
          params: { id1: '4' },
          children: [],
        },
      ]
    }, 'round#5');

    await router.load('c-1/2@vp1+c-1/4@vp2?foo=bar');
    assertCurrentRoute(rootVm.currentRoute, {
      path: 'c-1/2@vp1+c-1/4@vp2',
      url: 'c-1/2@vp1+c-1/4@vp2?foo=bar',
      title: 'C1 | C1',
      query: new URLSearchParams('foo=bar'),
      parameterInformation: [
        {
          config: { id: 'r1' } as RouteConfig,
          viewport: 'vp1',
          params: { id1: '2' },
          children: [],
        },
        {
          config: { id: 'r1' } as RouteConfig,
          viewport: 'vp2',
          params: { id1: '4' },
          children: [],
        },
      ]
    }, 'round#6');

    await au.stop();
  });

  it('parent/child + sibling', async function () {
    @customElement({ name: 'c-11', template: 'c-11' })
    class C11 implements IRouteViewModel { }
    @customElement({ name: 'c-12', template: 'c-12' })
    class C12 implements IRouteViewModel { }
    @customElement({ name: 'c-21', template: 'c-21' })
    class C21 implements IRouteViewModel { }
    @customElement({ name: 'c-22', template: 'c-22' })
    class C22 implements IRouteViewModel { }

    @route({
      routes: [
        { id: 'r11', path: ['c-11', 'c-11/:id1'], component: C11, title: 'C11' },
        { id: 'r12', path: ['c-12', 'c-12/:id2'], component: C12, title: 'C12' },
      ]
    })
    @customElement({ name: 'c-1', template: 'c-1 <au-viewport></au-viewport>' })
    class C1 implements IRouteViewModel { }

    @route({
      routes: [
        { id: 'r21', path: ['c-21', 'c-21/:id1'], component: C21, title: 'C21' },
        { id: 'r22', path: ['c-22', 'c-22/:id2'], component: C22, title: 'C22' },
      ]
    })
    @customElement({ name: 'c-2', template: 'c-2 <au-viewport></au-viewport>' })
    class C2 { }

    @route({
      routes: [
        { id: 'r1', path: ['c-1'], component: C1, title: 'C1' },
        { id: 'r2', path: ['c-2'], component: C2, title: 'C2' },
      ]
    })
    @customElement({ name: 'app', template: '<au-viewport name="vp1"></au-viewport><au-viewport name="vp2"></au-viewport>' })
    class App {
      public readonly currentRoute: ICurrentRoute = resolve(ICurrentRoute);
    }

    const { au, container, rootVm } = await start({ appRoot: App });
    const router = container.get(IRouter);

    await router.load('c-1/c-11+c-2/c-21');
    assertCurrentRoute(rootVm.currentRoute, {
      path: 'c-1@vp1/c-11+c-2@vp2/c-21',
      url: 'c-1@vp1/c-11+c-2@vp2/c-21',
      title: 'C11 | C1 | C21 | C2',
      query: new URLSearchParams(),
      parameterInformation: [
        {
          config: { id: 'r1' } as RouteConfig,
          viewport: 'vp1',
          params: emptyParams,
          children: [
            {
              config: { id: 'r11' } as RouteConfig,
              viewport: 'default',
              params: emptyParams,
              children: [],
            }
          ],
        },
        {
          config: { id: 'r2' } as RouteConfig,
          viewport: 'vp2',
          params: emptyParams,
          children: [
            {
              config: { id: 'r21' } as RouteConfig,
              viewport: 'default',
              params: emptyParams,
              children: [],
            }
          ],
        },
      ]
    }, 'round#1');

    await router.load('c-1@vp2/c-12+c-2@vp1/c-22');
    assertCurrentRoute(rootVm.currentRoute, {
      path: 'c-1@vp2/c-12+c-2@vp1/c-22',
      url: 'c-1@vp2/c-12+c-2@vp1/c-22',
      title: 'C12 | C1 | C22 | C2',
      query: new URLSearchParams(),
      parameterInformation: [
        {
          config: { id: 'r1' } as RouteConfig,
          viewport: 'vp2',
          params: emptyParams,
          children: [
            {
              config: { id: 'r12' } as RouteConfig,
              viewport: 'default',
              params: emptyParams,
              children: [],
            }
          ],
        },
        {
          config: { id: 'r2' } as RouteConfig,
          viewport: 'vp1',
          params: emptyParams,
          children: [
            {
              config: { id: 'r22' } as RouteConfig,
              viewport: 'default',
              params: emptyParams,
              children: [],
            }
          ],
        },
      ]
    }, 'round#2');

    await router.load('c-2@vp1/c-21/1+c-1@vp2/c-12/2');
    assertCurrentRoute(rootVm.currentRoute, {
      path: 'c-2@vp1/c-21/1+c-1@vp2/c-12/2',
      url: 'c-2@vp1/c-21/1+c-1@vp2/c-12/2',
      title: 'C21 | C2 | C12 | C1',
      query: new URLSearchParams(),
      parameterInformation: [
        {
          config: { id: 'r2' } as RouteConfig,
          viewport: 'vp1',
          params: emptyParams,
          children: [
            {
              config: { id: 'r21' } as RouteConfig,
              viewport: 'default',
              params: { id1: '1' },
              children: [],
            }
          ],
        },
        {
          config: { id: 'r1' } as RouteConfig,
          viewport: 'vp2',
          params: emptyParams,
          children: [
            {
              config: { id: 'r12' } as RouteConfig,
              viewport: 'default',
              params: { id2: '2' },
              children: [],
            }
          ],
        },
      ]
    }, 'round#3');

    await router.load('c-2@vp1/c-21/1+c-1@vp2/c-12/2?foo=bar');
    assertCurrentRoute(rootVm.currentRoute, {
      path: 'c-2@vp1/c-21/1+c-1@vp2/c-12/2',
      url: 'c-2@vp1/c-21/1+c-1@vp2/c-12/2?foo=bar',
      title: 'C21 | C2 | C12 | C1',
      query: new URLSearchParams("foo=bar"),
      parameterInformation: [
        {
          config: { id: 'r2' } as RouteConfig,
          viewport: 'vp1',
          params: emptyParams,
          children: [
            {
              config: { id: 'r21' } as RouteConfig,
              viewport: 'default',
              params: { id1: '1' },
              children: [],
            }
          ],
        },
        {
          config: { id: 'r1' } as RouteConfig,
          viewport: 'vp2',
          params: emptyParams,
          children: [
            {
              config: { id: 'r12' } as RouteConfig,
              viewport: 'default',
              params: { id2: '2' },
              children: [],
            }
          ],
        },
      ]
    }, 'round#4');

    await au.stop();
  });
});
