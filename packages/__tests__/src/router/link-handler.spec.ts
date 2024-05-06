import { RouterConfiguration, IRouter, IRouterOptions } from '@aurelia/router';
import { assert, TestContext } from '@aurelia/testing';
import { CustomElement, Aurelia } from '@aurelia/runtime-html';
import { isNode } from '../util.js';

describe('router/link-handler.spec.ts', function () {
  // something wrong with jsdom and our wrapper code
  // in node it hangs
  if (isNode()) {
    return;
  }
  async function createFixture(routerOptions: IRouterOptions, App) {
    const ctx = TestContext.create();
    const { container, platform, doc } = ctx;

    const { href } = platform.window.location;
    const index = href.indexOf('#');
    if (index >= 0) {
      platform.window.history.replaceState({}, '', href.slice(0, index));
    }

    container.register(RouterConfiguration.customize(routerOptions));
    const router = container.get(IRouter);

    const host = ctx.createElement('div');
    doc.body.appendChild(host as any);

    const au = new Aurelia(container);
    au.app({ component: App, host });

    await au.start();

    return {
      ctx,
      container,
      au,
      host,
      router,
      async tearDown() {
        await au.stop(true);
        doc.body.removeChild(host);
      },
    };
  }

  const tests = [
    { useHref: true, href: true, load: true, result: 'load' },
    { useHref: true, href: false, load: true, result: 'load' },
    { useHref: true, href: true, load: false, result: 'href' },
    { useHref: true, href: false, load: false, result: null },

    { useHref: false, href: true, load: true, result: 'load' },
    { useHref: false, href: false, load: true, result: 'load' },
    { useHref: false, href: true, load: false, result: null },
    { useHref: false, href: false, load: false, result: null },
  ];

  for (const test of tests) {
    it(`returns the right instruction${test.useHref ? ' using href' : ''}:${test.href ? ' href' : ''}${test.load ? ' load' : ''}`, async function () {
      const App = CustomElement.define({
        name: 'app',
        template: `<a ${test.href ? 'href="href"' : ''} ${test.load ? 'load="load"' : ''}>Link</a>`
      });

      const { tearDown, ctx, router } = await createFixture({ useHref: test.useHref }, App);
      const { doc } = ctx;

      let result = { instructions: null, origin: null };
      router.load = function (instructions, options?): Promise<boolean | void> {
        result = { instructions, origin: options.origin };
        return Promise.resolve();
      };

      const anchor = doc.getElementsByTagName('A')[0];

      const evt = new ctx.wnd.MouseEvent('click', { cancelable: true });

      // Add this to prevent test to navigate away from test page
      const prevent = (ev => ev.preventDefault());
      doc.addEventListener('click', prevent, true);

      anchor.dispatchEvent(evt);

      assert.strictEqual(result.instructions, test.result, `LinkHandler.instruction`);
      assert.strictEqual(result.origin, test.result !== null ? anchor : null, `LinkHandler.anchor`);

      doc.removeEventListener('click', prevent, true);

      await tearDown();
    });
  }

  for (const test of tests) {
    it(`respects 'external' attribute${test.useHref ? ' using href' : ''}:${test.href ? ' href' : ''}${test.load ? ' load' : ''}`, async function () {
      const App = CustomElement.define({
        name: 'app',
        template: `<a ${test.href ? 'href="href"' : ''} ${test.load ? 'load="load"' : ''} external>Link</a>`
      });

      const { tearDown, ctx, router } = await createFixture({ useHref: test.useHref }, App);
      const { doc } = ctx;

      let result = { instructions: null, origin: null };
      router.load = function (instructions, options?): Promise<boolean | void> {
        result = { instructions, origin: options.origin };
        return Promise.resolve();
      };

      const anchor = doc.getElementsByTagName('A')[0];

      const evt = new ctx.wnd.MouseEvent('click', { cancelable: true });

      // Add this to prevent test to navigate away from test page
      const prevent = (ev => ev.preventDefault());
      doc.addEventListener('click', prevent, true);

      anchor.dispatchEvent(evt);

      assert.strictEqual(result.instructions, null, `LinkHandler.instruction`);
      assert.strictEqual(result.origin, null, `LinkHandler.anchor`);

      doc.removeEventListener('click', prevent, true);

      await tearDown();
    });
  }
});
