import { Viewport, RouterConfiguration, IRouter } from '@aurelia/router';
import { CustomElement, Aurelia } from '@aurelia/runtime';
import { TestContext, assert } from '@aurelia/testing';
import { DebugConfiguration } from '@aurelia/debug';

describe('Viewport', function () {
  async function createFixture(config?, App?) {
    const ctx = TestContext.createHTMLTestContext();
    const { container, scheduler, doc, wnd } = ctx;

    let path = wnd.location.href;
    const hash = path.indexOf('#');
    if (hash >= 0) {
      path = path.slice(0, hash);
    }
    wnd.history.replaceState({}, '', path);

    const host = doc.createElement('div');
    if (App === void 0) {
      App = CustomElement.define({ name: 'app', template: '<au-viewport></au-viewport>' });
    }
    const au = new Aurelia(container)
      .register(
        DebugConfiguration,
        config !== void 0 ? RouterConfiguration : RouterConfiguration.customize(config),
        App)
      .app({ host: host, component: App });

    const router = container.get(IRouter);

    await au.start().wait();

    async function tearDown() {
      router.deactivate();
      RouterConfiguration.customize();
      await au.stop().wait();
    }

    return { au, container, scheduler, host, router, tearDown };
  }

  it('can be created', function () {
    const sut = new Viewport(null, null, null, null, null, null);
  });

  it('can understand exist attributes', async function () {
    const App = CustomElement.define({ name: 'app', template: '<au-viewport no-link></au-viewport>' });

    const { router, tearDown } = await createFixture(undefined, App);

    const viewport: any = router.allViewports().filter(vp => vp.name === 'default')[0];
    assert.strictEqual(viewport.options.noLink, true, `noLink === true`);

    await tearDown();
  });
});
