import { IRouter, RouterConfiguration } from '@aurelia/router';
import { CustomElement, Aurelia } from '@aurelia/runtime-html';
import { assert, MockBrowserHistoryLocation, TestContext } from '@aurelia/testing';

describe('Configuration', function () {
  function getModifiedRouter(container) {
    const router = container.get(IRouter);
    const mockBrowserHistoryLocation = new MockBrowserHistoryLocation();
    mockBrowserHistoryLocation.changeCallback = router.viewer.handlePopstate;
    router.viewer.history = mockBrowserHistoryLocation as any;
    router.viewer.location = mockBrowserHistoryLocation as any;
    return router;
  }

  async function createFixture(config?) {
    const ctx = TestContext.create();
    const { container } = ctx;

    const App = CustomElement.define({ name: 'app', template: '<template><au-viewport name="left"></au-viewport><au-viewport name="right"></au-viewport></template>' });
    const host = ctx.doc.createElement('div');
    ctx.doc.body.appendChild(host as any);

    const au = new Aurelia(container)
      .register(
        RouterConfiguration.customize(config ?? {}),
        App)
      .app({ host: host, component: App });

    const router = getModifiedRouter(container);

    await au.start();

    async function tearDown() {
      await au.stop(true);
      ctx.doc.body.removeChild(host);

      au.dispose();
    }

    return { au, container, host, router, ctx, tearDown };
  }

  it('can be started with defaults', async function () {
    this.timeout(5000);

    const { router, tearDown } = await createFixture();
    assert.strictEqual(router['isActive'], true, `router.isActive`);
    assert.strictEqual(RouterConfiguration.options.separators.viewport, '@', `RouterConfiguration.options.separators.viewport`);

    await tearDown();
  });

  it('can be started with config object', async function () {
    this.timeout(5000);

    const { router, tearDown } = await createFixture({ separators: { viewport: '#' } });
    assert.strictEqual(router['isActive'], true, `router.isActive`);
    assert.strictEqual(RouterConfiguration.options.separators.viewport, '#', `RouterConfiguration.options.separators.viewport`);

    RouterConfiguration.customize();
    await tearDown();
  });

  it('can be started with config function', async function () {
    this.timeout(5000);

    const { router, tearDown } = await createFixture((router) => {
      RouterConfiguration.apply({ separators: { viewport: '%' } });
      router.start();
    });
    assert.strictEqual(router['isActive'], true, `router.isActive`);
    assert.strictEqual(RouterConfiguration.options.separators.viewport, '%', `RouterConfiguration.options.separators.viewport`);

    RouterConfiguration.customize();
    await tearDown();
  });

  it('is awaitable at start up', async function () {
    this.timeout(5000);

    const ctx = TestContext.create();
    const { container } = ctx;

    const App = CustomElement.define({ name: 'app', template: '<au-viewport default="foo"></au-viewport>' });
    const Foo = CustomElement.define({ name: 'foo', template: `<div>foo: \${message}</div>` }, class {
      public message: string = '';
      public async load() {
        await new Promise(resolve => setTimeout(resolve, 250));
        this.message = 'Hello, World!';
      }
    });

    const host = ctx.doc.createElement('div');
    ctx.doc.body.appendChild(host as any);

    const au = new Aurelia(container)
      .register(
        RouterConfiguration,
        App,
        Foo)
      .app({ host: host, component: App });

    const router = getModifiedRouter(container);

    await au.start();

    assert.includes(host.textContent, 'Hello, World!', `host.textContent`);

    await au.stop(true);
    ctx.doc.body.removeChild(host);

    au.dispose();
  });
});
