import { LogLevel, LoggerConfiguration, Registration, type Writable } from '@aurelia/kernel';
import { tasksSettled } from '@aurelia/runtime';
import { AppTask, Aurelia, customElement, IHistory, ILocation, IWindow } from '@aurelia/runtime-html';
import { ICurrentRoute, ILocationManager, IRouter, IRouterOptions, type IUrlParser, RouterConfiguration, route } from '@aurelia/router';
import { assert, MockBrowserHistoryLocation, TestContext } from '@aurelia/testing';

describe('router/url-parser-compatibility.spec.ts', function () {
  // This mutation is an older documented escape hatch, not a new extension API.
  // Its browser codec must continue to round-trip previously published links.
  for (const useHash of [false, true]) {
    async function fixture(initial = '/items/start', relativeHash = false) {
      @customElement({ name: 'codec-page', template: '${id}' })
      class Page {
        public id = '';
        public loading(params: { id: string }) { this.id = params.id; }
      }
      @route({ routes: [{ path: 'items/:id', component: Page }] })
      @customElement({ name: 'codec-root', template: '<au-viewport></au-viewport>' })
      class Root { }

      const ctx = TestContext.create();
      const { container } = ctx;
      const history = new MockBrowserHistoryLocation();
      const href = (path: string) => `https://example.test/app${useHash ? '/#' : ''}${path};codec=1`;
      history.replaceState({}, '', href(initial));
      container.register(
        LoggerConfiguration.create({ level: LogLevel.fatal }),
        Registration.instance(IHistory, history),
        Registration.instance(ILocation, {
          get href() { return history.path; },
          get pathname() { return new URL(history.path).pathname; },
          get search() { return new URL(history.path).search; },
          get hash() { return new URL(history.path).hash; },
        }),
        Registration.instance(IWindow, {
          document: { baseURI: 'https://example.test/app/' },
          addEventListener: ctx.wnd.addEventListener.bind(ctx.wnd),
          removeEventListener: ctx.wnd.removeEventListener.bind(ctx.wnd),
        }),
        RouterConfiguration.customize({ useUrlFragmentHash: useHash, preserveHashDocument: relativeHash }),
        AppTask.creating(IRouterOptions, options => {
          // The public declarations intentionally omit this internal field.
          const mutable = options as unknown as Writable<{ _urlParser: IUrlParser }>;
          const parser = mutable._urlParser;
          mutable._urlParser = {
            parse(value) { return parser.parse(value.replace(/;codec=1$/, '')); },
            stringify(path, query, fragment, rooted) {
              const address = parser.stringify(path, query, fragment, rooted);
              return `${relativeHash ? address.replace(/^\/#/, '#') : address};codec=1`;
            },
          };
        }),
      );
      const host = ctx.createElement('div');
      const au = new Aurelia(container).app({ component: Root, host });
      const router = container.get(IRouter);
      const current = container.get(ICurrentRoute);
      return {
        ctx, au, host, container, router, current, history, href,
        async close() {
          router.stop();
          if (au.isRunning) await au.stop(true);
          host.remove();
        },
      };
    }

    it(`reads a previously encoded browser address on startup (${useHash ? 'hash' : 'path'})`, async function () {
      const app = await fixture('/items/start?q=one#details');
      try {
        await app.au.start();
        assert.html.textContent(app.host, 'start');
        assert.strictEqual(app.current.query.get('q'), 'one');
        assert.strictEqual(app.router.routeTree.fragment, 'details');
        assert.strictEqual(app.history.path, app.href('/items/start?q=one#details'));
      } finally {
        await app.close();
      }
    });

    if (useHash) {
      it('preserves a custom fragment-relative serializer in document mode', async function () {
        const app = await fixture('/items/start', true);
        try {
          await app.au.start();
          const href = app.router.createHref('/items/next');
          assert.strictEqual(href, app.href('/items/next'));
          await app.router.navigate('/items/next');
          assert.strictEqual(app.history.path, href);
          assert.html.textContent(app.host, 'next');
          app.history.replaceState({}, '', app.href('/items/restored'));
          app.container.get(ILocationManager).handleEvent(new app.ctx.wnd.HashChangeEvent('hashchange'));
          await tasksSettled();
          assert.html.textContent(app.host, 'restored');
        } finally {
          await app.close();
        }
      });
    }

    it(`uses the same browser codec for new hrefs, navigation and history (${useHash ? 'hash' : 'path'})`, async function () {
      const app = await fixture();
      try {
        await app.au.start();
        assert.strictEqual(app.router.createHref('/items/next?q=two#details'), app.href('/items/next?q=two#details'));
        await app.router.navigate('/items/next?q=two#details');
        assert.strictEqual(app.history.path, app.href('/items/next?q=two#details'));
        assert.html.textContent(app.host, 'next');

        // The location adapter supplies its snapshot; the custom codec still
        // owns the encoded browser address at this legacy extension boundary.
        app.history.replaceState({}, '', app.href('/items/restored?q=three#section'));
        app.container.get(ILocationManager).handleEvent(useHash
          ? new app.ctx.wnd.HashChangeEvent('hashchange')
          : new app.ctx.wnd.PopStateEvent('popstate'));
        await tasksSettled();
        assert.html.textContent(app.host, 'restored');
        assert.strictEqual(app.current.query.get('q'), 'three');
        assert.strictEqual(app.router.routeTree.fragment, 'section');
      } finally {
        await app.close();
      }
    });
  }
});
