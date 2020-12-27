import { Viewport, RouterConfiguration, IRouter } from '@aurelia/router';
import { CustomElement, Aurelia } from '@aurelia/runtime-html';
import { TestContext, assert } from '@aurelia/testing';

import { createFixture } from './_shared/create-fixture';

describe('Viewport', function () {
//   async function createFixture(config?, App?) {
//     const ctx = TestContext.create();
//     const { container, platform, doc, wnd } = ctx;

//     let path = wnd.location.href;
//     const hash = path.indexOf('#');
//     if (hash >= 0) {
//       path = path.slice(0, hash);
//     }
//     wnd.history.replaceState({}, '', path);

//     const host = doc.createElement('div');
//     if (App === void 0) {
//       App = CustomElement.define({ name: 'app', template: '<au-viewport></au-viewport>' });
//     }
//     const au = new Aurelia(container)
//       .register(
//         config !== void 0 ? RouterConfiguration : RouterConfiguration.customize(config),
//         App)
//       .app({ host: host, component: App });

//     const router = container.get(IRouter);

//     await au.start();

//     async function tearDown() {
//       RouterConfiguration.customize();
//       await au.stop();

//       au.dispose();
//     }

//     return { au, container, platform, host, router, tearDown };
//   }

  it('can be created', async function () {
    const App = CustomElement.define({ name: 'app', template: '<au-viewport></au-viewport>' });

    const { router, tearDown } = await createFixture(App);

    const viewport: any = router.allEndpoints('Viewport').filter(vp => vp.name === 'default')[0];
    assert.strictEqual(viewport.name, 'default', `name === 'default'`);

    await tearDown();
  });

  it('can understand exist attributes', async function () {
    const App = CustomElement.define({ name: 'app', template: '<au-viewport no-link></au-viewport>' });

    const { router, tearDown } = await createFixture(App);

    const viewport: any = router.allEndpoints('Viewport').filter(vp => vp.name === 'default')[0];
    assert.strictEqual(viewport.options.noLink, true, `noLink === true`);

    await tearDown();
  });
});
