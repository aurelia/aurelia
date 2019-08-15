import { DebugConfiguration } from '@aurelia/debug';
import { PLATFORM } from '@aurelia/kernel';
import { IRouter, RouterConfiguration } from '@aurelia/router';
import { Aurelia, CustomElement, ILifecycle, LifecycleFlags } from '@aurelia/runtime';
import { assert, MockBrowserHistoryLocation, TestContext } from '@aurelia/testing';

describe('Configuration', function () {
  async function setup(config?) {
    const ctx = TestContext.createHTMLTestContext();
    const { container, lifecycle } = ctx;

    const App = CustomElement.define({ name: 'app', template: '<template><au-viewport name="left"></au-viewport><au-viewport name="right"></au-viewport></template>' });
    const host = ctx.doc.createElement('div');
    ctx.doc.body.appendChild(host as any);

    const au = new Aurelia(container)
      .register(
        DebugConfiguration,
        !config ? RouterConfiguration : RouterConfiguration.customize(config),
        App)
      .app({ host: host, component: App });

    const router = container.get(IRouter);
    const mockBrowserHistoryLocation = new MockBrowserHistoryLocation();
    mockBrowserHistoryLocation.changeCallback = router.navigation.handlePopstate;
    router.navigation.history = mockBrowserHistoryLocation as any;
    router.navigation.location = mockBrowserHistoryLocation as any;

    await au.start().wait();

    async function tearDown() {
      await au.stop().wait();
      ctx.doc.body.removeChild(host);
      router.deactivate();
    }

    return { au, container, lifecycle, host, router, ctx, tearDown };
  }

  it('can be activated with defaults', async function () {
    this.timeout(5000);

    const { router, tearDown } = await setup();
    assert.strictEqual(router['isActive'], true, `router.isActive`);

    await tearDown();
  });

  it('can be activated with defaults', async function () {
    this.timeout(5000);

    const { router, tearDown } = await setup();
    assert.strictEqual(router['isActive'], true, `router.isActive`);
    assert.strictEqual(router.instructionResolver.separators.viewport, '@', `router.instructionResolver.separators.viewport`);

    await tearDown();
  });

  it('can be activated with config object', async function () {
    this.timeout(5000);

    const { router, tearDown } = await setup({ separators: { viewport: '#' } });
    assert.strictEqual(router['isActive'], true, `router.isActive`);
    assert.strictEqual(router.instructionResolver.separators.viewport, '#', `router.instructionResolver.separators.viewport`);

    RouterConfiguration.customize();
    await tearDown();
  });

  it('can be activated with config function', async function () {
    this.timeout(5000);

    const { router, tearDown } = await setup((router) => {
      router.activate({ separators: { viewport: '%' } });
    });
    assert.strictEqual(router['isActive'], true, `router.isActive`);
    assert.strictEqual(router.instructionResolver.separators.viewport, '%', `router.instructionResolver.separators.viewport`);

    RouterConfiguration.customize();
    await tearDown();
  });
});
