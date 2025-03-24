import { IRouter, NavigationStrategy, route } from '@aurelia/router-lite';
import { customElement } from '@aurelia/runtime-html';
import { assert } from '@aurelia/testing';
import { start } from './_shared/create-fixture.js';

describe.only('router-lite/navigation-strategy.spec.ts', function () {
  it('works', async function () {
    let dataLoaded = false;
    @customElement({ name: 'c-1', template: 'c1' })
    class C1 { }

    @customElement({ name: 'c-2', template: 'c2' })
    class C2 { }

    @customElement({ name: 'c-3', template: 'c3' })
    class C3 { }

    @route({
      routes: [
        C1,
        C2,
        C3,
        {
          path: '',
          component: new NavigationStrategy(() => {
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

    await router.load('c-3');
    assert.html.textContent(host, 'c3', 'round#1');

    await router.load('');
    assert.html.textContent(host, 'c2', 'round#2');

    await au.stop(true);
  });
});
