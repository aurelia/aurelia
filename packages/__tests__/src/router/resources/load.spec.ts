import { IRouteContext, IRouterEvents, IRouteViewModel, LoadCustomAttribute, NavigationInstruction, Params, route, RouteNode, RouterConfiguration, RouteType } from '@aurelia/router';
import { Aurelia, CustomAttribute, CustomElement, customElement, ILocation, IWindow } from '@aurelia/runtime-html';
import { assert, MockBrowserHistoryLocation, TestContext } from '@aurelia/testing';
import { start } from '../_shared/create-fixture.js';
import { LogLevel, Registration, resolve } from '@aurelia/kernel';
import { tasksSettled } from '@aurelia/runtime';
import { TestRouterConfiguration } from '../_shared/configuration.js';

describe('router/resources/load.spec.ts', function () {

  describe('lazy component links', function () {
    function deferred<T>() {
      let resolve!: (value: T) => void;
      let reject!: (reason: unknown) => void;
      const promise = new Promise<T>((res, rej) => { resolve = res; reject = rej; });
      return { promise, resolve, reject };
    }

    function createApp({ synchronous = false, initialType = false } = {}) {
      @customElement({ name: 'link-home', template: 'home' })
      class Home { }
      @customElement({ name: 'report-page', template: 'reports' })
      class Reports { }

      const entered = deferred<void>();
      const chunk = deferred<{ default: typeof Reports }>();
      const calls = { reports: 0 };
      @route({ routes: [
        { path: '', redirectTo: 'home' },
        { id: 'home', path: 'home', component: Home },
        { id: 'reports-id', path: 'reports', component: (() => {
          ++calls.reports;
          entered.resolve();
          return synchronous ? Reports : chunk.promise;
        }) as unknown as RouteType },
      ] })
      @customElement({
        name: 'lazy-link-root',
        template: '<a if.bind="show" load.bind="target"></a><au-viewport></au-viewport>',
      })
      class Root {
        public show = true;
        public target: NavigationInstruction = initialType ? Reports : 'home';
      }

      const ctx = TestContext.create();
      ctx.container.register(TestRouterConfiguration.for(LogLevel.fatal), RouterConfiguration.customize({ activeClass: 'selected' }));
      const au = new Aurelia(ctx.container);
      const host = ctx.createElement('div');
      const root = new Root();
      au.app({ component: root, host });
      return { au, host, root, Reports, calls, chunk, entered };
    }

    it('keeps path, route-id and structured child links synchronous without importing their component', async function () {
      const app = createApp();
      await app.au.start();
      const anchor = app.host.querySelector('a')!;
      const load = CustomAttribute.for(anchor, 'load').viewModel as LoadCustomAttribute;
      try {
        for (const [target, suffix] of [
          ['reports', '/reports'],
          [{ component: 'reports-id' }, '/reports'],
          [{ component: 'reports-id', children: ['details'] }, '/reports/details'],
        ] as const) {
          app.root.target = target;
          await tasksSettled();
          assert.strictEqual(load.attaching(), void 0, 'known paths do not create a pending link operation');
          assert.strictEqual(anchor.getAttribute('href')!.endsWith(suffix), true, suffix);
          assert.strictEqual(app.calls.reports, 0, 'formatting the child instruction does not load its parent');
        }
      } finally {
        await app.au.stop(true);
      }
    });

    it('publishes a synchronous factory and its cached type without a pending operation', async function () {
      const app = createApp({ synchronous: true });
      await app.au.start();
      const anchor = app.host.querySelector('a')!;
      const load = CustomAttribute.for(anchor, 'load').viewModel as LoadCustomAttribute;
      try {
        for (const target of [app.Reports, 'home', app.Reports]) {
          app.root.target = target;
          await tasksSettled();
          assert.strictEqual(load.attaching(), void 0);
          assert.strictEqual(anchor.getAttribute('href')!.endsWith(target === 'home' ? '/home' : '/reports'), true);
        }
        assert.strictEqual(app.calls.reports, 1, 'later type links reuse the resolved configuration');
      } finally {
        await app.au.stop(true);
      }
    });

    it('resolves component arrays for multiple viewports and preserves string-array serialization', async function () {
      @customElement({ name: 'report-page', template: 'reports' })
      class Reports { }
      @customElement({ name: 'summary-page', template: 'summary' })
      class Summary { }
      let calls = 0;
      @route({ routes: [
        { path: 'reports', component: (() => { ++calls; return Promise.resolve({ default: Reports }); }) as unknown as RouteType },
        { path: 'summary', component: Summary },
      ] })
      @customElement({
        name: 'multi-link-root',
        template: '<a load.bind="target"></a><au-viewport default.bind="null"></au-viewport><au-viewport default.bind="null"></au-viewport>',
      })
      class Root { public target: readonly NavigationInstruction[] = [Reports, Summary]; }

      const { au, host, container, rootVm } = await start({ appRoot: Root });
      const anchor = host.querySelector('a')!;
      const load = CustomAttribute.for(anchor, 'load').viewModel as LoadCustomAttribute;
      try {
        assert.strictEqual(anchor.getAttribute('href')!.endsWith('/reports+summary'), true);
        assert.strictEqual(calls, 1);
        const navigated = new Promise<void>(resolve => {
          const sub = container.get(IRouterEvents).subscribe('au:router:navigation-end', () => { sub.dispose(); resolve(); });
        });
        anchor.click();
        await navigated;
        assert.deepStrictEqual(Array.from(host.querySelectorAll('au-viewport'), viewport => viewport.textContent), ['reports', 'summary']);

        // String members keep their existing instruction spelling; only
        // component mappings need the new asynchronous discovery path.
        for (const [target, suffix] of [
          [['reports', 'summary'], '/reports+summary'],
          [['reports@main', 'summary@side'], '/reports@main+summary@side'],
        ] as const) {
          rootVm.target = target;
          await tasksSettled();
          assert.strictEqual(load.attaching(), void 0);
          assert.strictEqual(anchor.getAttribute('href')!.endsWith(suffix), true, suffix);
          assert.strictEqual(calls, 1);
        }
      } finally {
        await au.stop(true);
      }
    });

    for (const completion of ['resolve', 'reject'] as const) {
      it(`keeps the newer route-id link when a pending type mapping later ${completion}s`, async function () {
        const app = createApp();
        await app.au.start();
        const anchor = app.host.querySelector('a')!;
        const load = CustomAttribute.for(anchor, 'load').viewModel as LoadCustomAttribute;
        try {
          app.root.target = app.Reports;
          await tasksSettled();
          // The module promise is outside the scheduler. Observe the resource's
          // lifecycle boundary explicitly rather than treating tasksSettled as an import barrier.
          const pending = load.attaching();
          assert.instanceOf(pending, Promise);
          const outcome = Promise.resolve(pending).then(() => void 0, error => error);
          assert.strictEqual(anchor.hasAttribute('href'), false, 'an unknown mapping must not publish the element name');

          app.root.target = { component: 'home' };
          await tasksSettled();
          const href = anchor.getAttribute('href');
          assert.strictEqual(href!.endsWith('/home'), true);
          if (completion === 'resolve') app.chunk.resolve({ default: app.Reports });
          else app.chunk.reject(new Error('superseded report chunk failed'));
          assert.strictEqual(await outcome, void 0, 'the superseded operation no longer owns a visible link');
          assert.strictEqual(anchor.getAttribute('href'), href);
        } finally {
          app.chunk.resolve({ default: app.Reports });
          await app.au.stop(true);
        }
      });
    }

    it('does not publish into a removed link when its component mapping resolves', async function () {
      const app = createApp();
      await app.au.start();
      const anchor = app.host.querySelector('a')!;
      const load = CustomAttribute.for(anchor, 'load').viewModel as LoadCustomAttribute;
      try {
        app.root.target = app.Reports;
        await tasksSettled();
        const pending = load.attaching();
        assert.instanceOf(pending, Promise);
        app.root.show = false;
        await tasksSettled();
        assert.strictEqual(app.host.querySelector('a'), null);

        app.chunk.resolve({ default: app.Reports });
        await pending;
        assert.strictEqual(anchor.hasAttribute('href'), false, 'unbinding retired publication to the old element');

        app.root.target = 'home';
        app.root.show = true;
        await tasksSettled();
        assert.strictEqual(app.host.querySelector('a')!.getAttribute('href')!.endsWith('/home'), true);
      } finally {
        app.chunk.resolve({ default: app.Reports });
        await app.au.stop(true);
      }
    });

    it('reports an initial component mapping failure through application startup', async function () {
      const app = createApp({ initialType: true });
      const failure = new Error('initial report chunk failed');
      const outcome = Promise.resolve(app.au.start()).then(() => void 0, error => error);
      await app.entered.promise;
      app.chunk.reject(failure);
      assert.strictEqual(await outcome, failure, 'the lifecycle owner receives the failed mapping');
      assert.strictEqual(app.host.querySelector('a')?.hasAttribute('href') ?? false, false);
      // A failed root activation is terminal. Teardown must retain that error,
      // rather than inventing recovery solely for this fixture.
      await assert.rejects(async () => { await app.au.stop(true); }, error => error === failure);
    });

    it('waits for type-link discovery after a direct route import finishes', async function () {
      @customElement({ name: 'link-home', template: 'home' })
      class Home { }
      @customElement({ name: 'settings-page', template: 'settings' })
      class Settings { }
      @customElement({ name: 'report-page', template: 'reports' })
      class Reports { }
      const settings = deferred<{ default: typeof Settings }>();
      const reports = deferred<{ default: typeof Reports }>();
      const reportRequested = deferred<void>();
      let reportCalls = 0;
      @route({ routes: [
        { path: '', component: Home },
        // Existing applications can mix direct imports with deferred factories.
        { path: 'settings', component: settings.promise },
        { path: 'reports', component: (() => {
          ++reportCalls;
          reportRequested.resolve();
          return reports.promise;
        }) as unknown as RouteType },
      ] })
      @customElement({ name: 'mixed-import-link-root', template: '<a ref="link" load.bind="target"></a><au-viewport></au-viewport>' })
      class Root {
        public readonly target = Reports;
        public link!: HTMLAnchorElement;
      }
      const ctx = TestContext.create();
      ctx.container.register(TestRouterConfiguration.for(LogLevel.fatal), RouterConfiguration);
      const au = new Aurelia(ctx.container);
      const root = new Root();
      const host = ctx.createElement('div');
      au.app({ component: root, host });
      let started = false;
      const startup = Promise.resolve(au.start()).then(() => { started = true; });
      try {
        assert.strictEqual(reportCalls, 0, 'binding waits for the existing direct import');
        assert.strictEqual(root.link.hasAttribute('href'), false);
        settings.resolve({ default: Settings });
        await reportRequested.promise;
        // Let unrelated startup work drain. The lazy factory is the only work
        // still held, and attaching must return that second asynchronous step.
        await new Promise(resolve => setTimeout(resolve, 0));
        assert.strictEqual(started, false);
        assert.strictEqual(root.link.hasAttribute('href'), false);

        reports.resolve({ default: Reports });
        await startup;
        assert.strictEqual(root.link.getAttribute('href')!.endsWith('/reports'), true);
        assert.html.textContent(host, 'home');
      } finally {
        settings.resolve({ default: Settings });
        reports.resolve({ default: Reports });
        await startup;
        await au.stop(true);
      }
    });
  });

  function assertAnchors(anchors: HTMLAnchorElement[] | NodeListOf<HTMLAnchorElement>, expected: { href: string; active?: boolean }[], message: string = '', assertActive: boolean = true): void {
    const len = anchors.length;
    assert.strictEqual(len, expected.length, `${message} length`);
    for (let i = 0; i < len; i++) {
      const anchor = anchors[i];
      const item = expected[i];
      assert.strictEqual(anchor.href.endsWith(item.href), true, `${message} - #${i} href - actual: ${anchor.href} - expected: ${item.href}`);
      if (!assertActive) continue;
      assert.strictEqual(anchor.classList.contains('active'), !!item.active, `${message} - #${i} active`);
    }
  }

  it('active status works correctly', async function () {
    @customElement({ name: 'fo-o', template: '' })
    class Foo { }

    @route({
      routes: [
        { id: 'foo', path: 'foo/:id', component: Foo }
      ]
    })
    @customElement({
      name: 'ro-ot',
      template: `
    <a load="route:foo; params.bind:{id: 1}; active.bind:active1" active.class="active1"></a>
    <a load="route:foo/2; active.bind:active2" active.class="active2"></a>
    <au-viewport></au-viewport>`
    })
    class Root { }

    const { au, host } = await start({ appRoot: Root, registrations: [Foo] });
    await tasksSettled();

    const anchors = host.querySelectorAll('a');
    const a1 = { href: 'foo/1', active: false };
    const a2 = { href: 'foo/2', active: false };
    assertAnchors(anchors, [a1, a2], 'round#1');

    anchors[1].click();
    await tasksSettled();
    a2.active = true;
    assertAnchors(anchors, [a1, a2], 'round#2');

    anchors[0].click();
    await tasksSettled();
    a1.active = true;
    a2.active = false;
    assertAnchors(anchors, [a1, a2], 'round#3');

    await au.stop(true);
  });

  it('adds activeClass when configured', async function () {
    @customElement({ name: 'fo-o', template: '${instanceId} ${id}' })
    class Foo {
      private static instanceId: number = 0;
      private readonly instanceId = ++Foo.instanceId;
      private id: string;
      public loading(params: Params) {
        this.id = params.id;
      }
    }

    @route({
      transitionPlan: 'replace',
      routes: [
        { id: 'foo', path: 'foo/:id', component: Foo }
      ]
    })
    @customElement({
      name: 'ro-ot',
      template: `
    <a load="route:foo; params.bind:{id: 1}"></a>
    <a load="route:foo/2"></a>
    <au-viewport></au-viewport>`
    })
    class Root { }

    const activeClass = 'au-rl-active';
    const { au, host } = await start({ appRoot: Root, registrations: [Foo], activeClass });
    await tasksSettled();

    const anchors = host.querySelectorAll('a');
    const a1 = { href: 'foo/1', active: false };
    const a2 = { href: 'foo/2', active: false };
    assertAnchorsWithClass(anchors, [a1, a2], activeClass, 'round#1');

    anchors[1].click();
    await tasksSettled();
    a2.active = true;
    assertAnchorsWithClass(anchors, [a1, a2], activeClass, 'round#2');
    assert.html.textContent(host, '1 2', 'round#2 - text');

    anchors[1].click();
    await tasksSettled();
    assertAnchorsWithClass(anchors, [a1, a2], activeClass, 'round#3');
    assert.html.textContent(host, '1 2', 'round#3 - text');

    anchors[0].click();
    await tasksSettled();
    a1.active = true;
    a2.active = false;
    assertAnchorsWithClass(anchors, [a1, a2], activeClass, 'round#4');
    assert.html.textContent(host, '2 1', 'round#4 - text');

    anchors[0].click();
    await tasksSettled();
    assertAnchorsWithClass(anchors, [a1, a2], activeClass, 'round#5');
    assert.html.textContent(host, '2 1', 'round#5 - text');

    await au.stop(true);

    function assertAnchorsWithClass(anchors: HTMLAnchorElement[] | NodeListOf<HTMLAnchorElement>, expected: { href: string; active?: boolean }[], activeClass: string | null = null, message: string = ''): void {
      const len = anchors.length;
      assert.strictEqual(len, expected.length, `${message} length`);
      for (let i = 0; i < len; i++) {
        const anchor = anchors[i];
        const item = expected[i];
        assert.strictEqual(anchor.href.endsWith(item.href), true, `${message} - #${i} href - actual: ${anchor.href} - expected: ${item.href}`);
        assert.strictEqual(anchor.classList.contains(activeClass), !!item.active, `${message} - #${i} active`);
      }
    }
  });

  it('does not add activeClass when not configured', async function () {
    @customElement({ name: 'fo-o', template: '' })
    class Foo { }

    @route({
      routes: [
        { id: 'foo', path: 'foo/:id', component: Foo }
      ]
    })
    @customElement({
      name: 'ro-ot',
      template: `
    <a load="route:foo; params.bind:{id: 1}"></a>
    <a load="route:foo/2"></a>
    <au-viewport></au-viewport>`
    })
    class Root { }

    const { au, host } = await start({ appRoot: Root, registrations: [Foo] });
    await tasksSettled();

    const anchors = host.querySelectorAll('a');
    const a1 = { href: 'foo/1', active: false };
    const a2 = { href: 'foo/2', active: false };
    assertAnchorsWithoutClass(anchors, [a1, a2], 'round#1');

    anchors[1].click();
    await tasksSettled();
    a2.active = true;
    assertAnchorsWithoutClass(anchors, [a1, a2], 'round#2');

    anchors[0].click();
    await tasksSettled();
    a1.active = true;
    a2.active = false;
    assertAnchorsWithoutClass(anchors, [a1, a2], 'round#3');

    await au.stop(true);

    function assertAnchorsWithoutClass(anchors: HTMLAnchorElement[] | NodeListOf<HTMLAnchorElement>, expected: { href: string; active?: boolean }[], message: string = ''): void {
      const len = anchors.length;
      assert.strictEqual(len, expected.length, `${message} length`);
      for (let i = 0; i < len; i++) {
        const anchor = anchors[i];
        const item = expected[i];
        assert.strictEqual(anchor.href.endsWith(item.href), true, `${message} - #${i} href - actual: ${anchor.href} - expected: ${item.href}`);
      }
    }
  });

  it('un-configured parameters are added to the querystring', async function () {
    @customElement({ name: 'fo-o', template: '' })
    class Foo { }

    @route({
      routes: [
        { id: 'foo', path: 'foo/:id', component: Foo }
      ]
    })
    @customElement({
      name: 'ro-ot',
      template: `<a load="route:foo; params.bind:{id: 3, a: 2};"></a><au-viewport></au-viewport>`
    })
    class Root { }

    const { au, host } = await start({ appRoot: Root, registrations: [Foo] });
    await tasksSettled();

    const anchor = host.querySelector('a');
    assert.match(anchor.href, /foo\/3\?a=2/);
    await au.stop(true);
  });

  it('the most matched path is generated', async function () {
    @customElement({ name: 'fo-o', template: 'foo' })
    class Foo { }

    @route({
      routes: [
        { id: 'foo', path: ['foo/:id', 'foo/:id/bar/:a', 'bar/fizz'], component: Foo }
      ]
    })
    @customElement({
      name: 'ro-ot',
      template: `<a load="route:foo; params.bind:{id: 3, a: 2};"></a><a load="route:foo; params.bind:{id: 3, b: 2};"></a><a load="bar/fizz"></a><au-viewport></au-viewport>`
    })
    class Root { }

    const { au, host } = await start({ appRoot: Root, registrations: [Foo] });
    await tasksSettled();

    const anchors = Array.from(host.querySelectorAll('a'));
    const hrefs = anchors.map(a => a.href);
    assert.match(hrefs[0], /foo\/3\/bar\/2/);
    assert.match(hrefs[1], /foo\/3\?b=2/); // this one ensures the rejection of non-monotonically increment in the parameter consumption
    assert.match(hrefs[2], /bar\/fizz/);

    anchors[2].click();
    await tasksSettled();
    assert.html.textContent(host, 'foo');

    await au.stop(true);
  });

  it('allow navigating to route defined in parent context using ../ prefix', async function () {
    @customElement({ name: 'pro-duct', template: `product \${id} <a load="../products"></a>` })
    class Product {
      id: unknown;
      public canLoad(params: Params, _next: RouteNode, _current: RouteNode): boolean {
        this.id = params.id;
        return true;
      }
    }

    @customElement({ name: 'pro-ducts', template: `<a load="../product/1"></a><a load="../product/2"></a> products` })
    class Products { }

    @route({
      routes: [
        { id: 'products', path: ['', 'products'], component: Products },
        { id: 'product', path: 'product/:id', component: Product },
      ]
    })
    @customElement({ name: 'ro-ot', template: '<au-viewport></au-viewport>' })
    class Root { }

    const { au, host } = await start({ appRoot: Root, registrations: [Products, Product] });
    await tasksSettled();

    assert.html.textContent(host, 'products');
    const anchors = Array.from(host.querySelectorAll('a'));
    const hrefs = anchors.map(a => a.href);
    assert.match(hrefs[0], /product\/1$/);
    assert.match(hrefs[1], /product\/2$/);

    anchors[0].click();
    await tasksSettled();
    assert.html.textContent(host, 'product 1');
    // go back
    const back = host.querySelector<HTMLAnchorElement>('a');
    assert.match(back.href, /products$/);
    back.click();
    await tasksSettled();
    assert.html.textContent(host, 'products');

    // 2nd round
    host.querySelector<HTMLAnchorElement>('a:nth-of-type(2)').click();
    await tasksSettled();
    assert.html.textContent(host, 'product 2');
    // go back
    host.querySelector<HTMLAnchorElement>('a').click();
    await tasksSettled();
    assert.html.textContent(host, 'products');

    await au.stop(true);
  });

  it('allow navigating to route defined in parent context using ../ prefix - with parameters', async function () {
    @customElement({ name: 'pro-duct', template: `product \${id} <a load="../products"></a>` })
    class Product {
      id: unknown;
      public canLoad(params: Params, _next: RouteNode, _current: RouteNode): boolean {
        this.id = params.id;
        return true;
      }
    }

    @customElement({ name: 'pro-ducts', template: `<a load="route:../product; params.bind:{id:'1'}"></a><a load="route:../product; params.bind:{id:'2'}"></a> products` })
    class Products { }

    @route({
      routes: [
        { id: 'products', path: ['', 'products'], component: Products },
        { id: 'product', path: 'product/:id', component: Product },
      ]
    })
    @customElement({ name: 'ro-ot', template: '<au-viewport></au-viewport>' })
    class Root { }

    const { au, host } = await start({ appRoot: Root, registrations: [Products, Product] });
    await tasksSettled();

    assert.html.textContent(host, 'products');
    const anchors = Array.from(host.querySelectorAll('a'));
    const hrefs = anchors.map(a => a.href);
    assert.match(hrefs[0], /product\/1$/);
    assert.match(hrefs[1], /product\/2$/);

    anchors[0].click();
    await tasksSettled();
    assert.html.textContent(host, 'product 1');
    // go back
    const back = host.querySelector<HTMLAnchorElement>('a');
    assert.match(back.href, /products$/);
    back.click();
    await tasksSettled();
    assert.html.textContent(host, 'products');

    // 2nd round
    host.querySelector<HTMLAnchorElement>('a:nth-of-type(2)').click();
    await tasksSettled();
    assert.html.textContent(host, 'product 2');
    // go back
    host.querySelector<HTMLAnchorElement>('a').click();
    await tasksSettled();
    assert.html.textContent(host, 'products');

    await au.stop(true);
  });

  it('allow navigating to route defined in parent context using explicit routing context', async function () {
    @customElement({ name: 'pro-duct', template: `product \${id} <a load="route:products; context.bind:rtCtx.parent"></a>` })
    class Product {
      id: unknown;
      private rtCtx: IRouteContext;
      public canLoad(params: Params, next: RouteNode, _current: RouteNode): boolean {
        this.id = params.id;
        this.rtCtx = next.context;
        return true;
      }
    }

    @customElement({ name: 'pro-ducts', template: `<a load="route:product/1; context.bind:rtCtx.parent"></a><a load="route:product; params.bind:{id: 2}; context.bind:rtCtx.parent"></a> products` })
    class Products {
      private rtCtx: IRouteContext;
      public canLoad(params: Params, next: RouteNode, _current: RouteNode): boolean {
        this.rtCtx = next.context;
        return true;
      }
    }

    @route({
      routes: [
        { id: 'products', path: ['', 'products'], component: Products },
        { id: 'product', path: 'product/:id', component: Product },
      ]
    })
    @customElement({ name: 'ro-ot', template: '<au-viewport></au-viewport>' })
    class Root { }

    const { au, host } = await start({ appRoot: Root, registrations: [Products, Product] });
    await tasksSettled();

    assert.html.textContent(host, 'products');
    const anchors = Array.from(host.querySelectorAll('a'));
    const hrefs = anchors.map(a => a.href);
    assert.match(hrefs[0], /product\/1$/);
    assert.match(hrefs[1], /product\/2$/);

    anchors[0].click();
    await tasksSettled();
    assert.html.textContent(host, 'product 1');
    // go back
    const back = host.querySelector<HTMLAnchorElement>('a');
    assert.match(back.href, /products$/);
    back.click();
    await tasksSettled();
    assert.html.textContent(host, 'products');

    // 2nd round
    host.querySelector<HTMLAnchorElement>('a:nth-of-type(2)').click();
    await tasksSettled();
    assert.html.textContent(host, 'product 2');
    // go back
    host.querySelector<HTMLAnchorElement>('a').click();
    await tasksSettled();
    assert.html.textContent(host, 'products');

    await au.stop(true);
  });

  it('allow navigating to route defined in grand-parent context using ../../ prefix', async function () {
    @customElement({ name: 'l-21', template: `l21 <a load="../../l12"></a>` })
    class L21 { }
    @customElement({ name: 'l-22', template: `l22 <a load="/l11"></a>` })
    class L22 { }

    @route({
      routes: [
        { id: 'l21', path: ['', 'l21'], component: L21 },
      ]
    })
    @customElement({ name: 'l-11', template: `l11 <au-viewport></au-viewport>` })
    class L11 { }

    @route({
      routes: [
        { id: 'l22', path: ['', 'l22'], component: L22 },
      ]
    })
    @customElement({ name: 'l-12', template: `l12 <au-viewport></au-viewport>` })
    class L12 { }

    @route({
      routes: [
        { id: 'l11', path: ['', 'l11'], component: L11 },
        { id: 'l12', path: 'l12', component: L12 },
      ]
    })
    @customElement({ name: 'ro-ot', template: '<au-viewport></au-viewport>' })
    class Root { }

    const { au, host } = await start({ appRoot: Root, registrations: [L11, L12, L21, L22] });
    await tasksSettled();
    assert.html.textContent(host, 'l11 l21');

    host.querySelector('a').click();
    await tasksSettled();
    assert.html.textContent(host, 'l12 l22');

    host.querySelector('a').click();
    await tasksSettled();
    assert.html.textContent(host, 'l11 l21');

    await au.stop(true);
  });

  it('allow navigating to route defined in grand-parent context using ../../ prefix - with parameters', async function () {
    @customElement({ name: 'l-21', template: `l21 <a load="route:../../l12; params.bind:{id: '42'}"></a>` })
    class L21 { }
    @customElement({ name: 'l-22', template: `l22 <a load="route:../../l11; params.bind:{id: '42'}"></a>` })
    class L22 { }

    @route({
      routes: [
        { id: 'l21', path: ['', 'l21'], component: L21 },
      ]
    })
    @customElement({ name: 'l-11', template: `l11 <au-viewport></au-viewport>` })
    class L11 { }

    @route({
      routes: [
        { id: 'l22', path: ['', 'l22'], component: L22 },
      ]
    })
    @customElement({ name: 'l-12', template: `l12 <au-viewport></au-viewport>` })
    class L12 { }

    @route({
      routes: [
        { path: '', redirectTo: 'l11/42' },
        { id: 'l11', path: 'l11/:id', component: L11 },
        { id: 'l12', path: 'l12/:id', component: L12 },
      ]
    })
    @customElement({ name: 'ro-ot', template: '<au-viewport></au-viewport>' })
    class Root { }

    const { au, host } = await start({ appRoot: Root, registrations: [L11, L12, L21, L22] });
    await tasksSettled();
    assert.html.textContent(host, 'l11 l21');

    host.querySelector('a').click();
    await tasksSettled();
    assert.html.textContent(host, 'l12 l22');

    host.querySelector('a').click();
    await tasksSettled();
    assert.html.textContent(host, 'l11 l21');

    await au.stop(true);
  });

  it('allow navigating to route defined in grand-parent context using explicit routing context', async function () {
    @customElement({ name: 'l-21', template: `l21 <a load="route:l12; context.bind:rtCtx.parent.parent"></a>` })
    class L21 {
      private rtCtx: IRouteContext;
      public canLoad(params: Params, next: RouteNode, _current: RouteNode): boolean {
        this.rtCtx = next.context;
        return true;
      }
    }
    @customElement({ name: 'l-22', template: `l22 <a load="route:l11; context.bind:rtCtx.parent.parent"></a>` })
    class L22 {
      private rtCtx: IRouteContext;
      public canLoad(params: Params, next: RouteNode, _current: RouteNode): boolean {
        this.rtCtx = next.context;
        return true;
      }
    }

    @route({
      routes: [
        { id: 'l21', path: ['', 'l21'], component: L21 },
      ]
    })
    @customElement({ name: 'l-11', template: `l11 <au-viewport></au-viewport>` })
    class L11 { }

    @route({
      routes: [
        { id: 'l22', path: ['', 'l22'], component: L22 },
      ]
    })
    @customElement({ name: 'l-12', template: `l12 <au-viewport></au-viewport>` })
    class L12 { }

    @route({
      routes: [
        { id: 'l11', path: ['', 'l11'], component: L11 },
        { id: 'l12', path: 'l12', component: L12 },
      ]
    })
    @customElement({ name: 'ro-ot', template: '<au-viewport></au-viewport>' })
    class Root { }

    const { au, host } = await start({ appRoot: Root, registrations: [L11, L12, L21, L22] });
    await tasksSettled();
    assert.html.textContent(host, 'l11 l21');

    host.querySelector('a').click();
    await tasksSettled();
    assert.html.textContent(host, 'l12 l22');

    host.querySelector('a').click();
    await tasksSettled();
    assert.html.textContent(host, 'l11 l21');

    await au.stop(true);
  });

  it('allow explicitly binding the routing context to null to perform navigation from root', async function () {
    @customElement({ name: 'l-21', template: `l21 <a load="route:l22; context.bind:rtCtx.parent"></a>` })
    class L21 {
      private rtCtx: IRouteContext;
      public canLoad(params: Params, next: RouteNode, _current: RouteNode): boolean {
        this.rtCtx = next.context;
        return true;
      }
    }
    @customElement({ name: 'l-22', template: `l22 <a load="route:l12; context.bind:null"></a>` })
    class L22 {
      private rtCtx: IRouteContext;
      public canLoad(params: Params, next: RouteNode, _current: RouteNode): boolean {
        this.rtCtx = next.context;
        return true;
      }
    }
    @customElement({ name: 'l-23', template: `l23 <a load="route:l24; context.bind:rtCtx.parent"></a>` })
    class L23 {
      private rtCtx: IRouteContext;
      public canLoad(params: Params, next: RouteNode, _current: RouteNode): boolean {
        this.rtCtx = next.context;
        return true;
      }
    }
    @customElement({ name: 'l-24', template: `l24 <a load="route:l11; context.bind:null"></a>` })
    class L24 {
      private rtCtx: IRouteContext;
      public canLoad(params: Params, next: RouteNode, _current: RouteNode): boolean {
        this.rtCtx = next.context;
        return true;
      }
    }

    @route({
      routes: [
        { id: 'l21', path: ['', 'l21'], component: L21 },
        { id: 'l22', path: 'l22', component: L22 },
      ]
    })
    @customElement({ name: 'l-11', template: `l11 <au-viewport></au-viewport>` })
    class L11 { }

    @route({
      routes: [
        { id: 'l23', path: ['', 'l23'], component: L23 },
        { id: 'l24', path: 'l24', component: L24 },
      ]
    })
    @customElement({ name: 'l-12', template: `l12 <au-viewport></au-viewport>` })
    class L12 { }

    @route({
      routes: [
        { id: 'l11', path: ['', 'l11'], component: L11 },
        { id: 'l12', path: 'l12', component: L12 },
      ]
    })
    @customElement({ name: 'ro-ot', template: '<au-viewport></au-viewport>' })
    class Root { }

    const { au, host } = await start({ appRoot: Root, registrations: [L11, L12, L21, L22, L23, L24] });
    await tasksSettled();
    assert.html.textContent(host, 'l11 l21', 'init');

    // l21 -> l22
    host.querySelector('a').click();
    await tasksSettled();
    assert.html.textContent(host, 'l11 l22', '#2 l21 -> l22');

    // l22 -> l12
    host.querySelector('a').click();
    await tasksSettled();
    assert.html.textContent(host, 'l12 l23', '#3 l22 -> l12');

    // l23 -> l24
    host.querySelector('a').click();
    await tasksSettled();
    assert.html.textContent(host, 'l12 l24', '#4 l23 -> l24');

    // l24 -> l11
    host.querySelector('a').click();
    await tasksSettled();
    assert.html.textContent(host, 'l11 l21', '#5 l24 -> l11');

    await au.stop(true);
  });

  it('adds hash correctly to the href when useUrlFragmentHash is set', async function () {
    @customElement({ name: 'ce-one', template: `ce1` })
    class CeOne { }

    @customElement({ name: 'ce-two', template: `ce2` })
    class CeTwo { }

    @customElement({
      name: 'ro-ot',
      template: `
      <a load="#ce-one"></a>
      <a load="#ce-two"></a>
      <a load="ce-two"></a>
      <au-viewport></au-viewport>
      `
    })
    @route({
      routes: [
        {
          path: 'ce-one',
          component: CeOne,
        },
        {
          path: 'ce-two',
          component: CeTwo,
        },
      ]
    })
    class Root { }

    const { au, host } = await start({
      appRoot: Root,
      useHash: true,
      registrations: [
        CeOne,
        CeTwo,
        Registration.instance(IWindow, {
          document: {
            baseURI: 'https://portal.example.com/app/',
          },
          removeEventListener() { /** noop */ },
          addEventListener() { /** noop */ },
        }),
      ],
    });
    await tasksSettled();

    const anchors = Array.from(host.querySelectorAll('a'));
    assert.deepStrictEqual(
      anchors.map(a => a.href),
      [
        'https://portal.example.com/app/#/ce-one',
        'https://portal.example.com/app/#/ce-two',
        'https://portal.example.com/app/#/ce-two',
      ],
    );

    anchors[1].click();
    await tasksSettled();
    assert.html.textContent(host, 'ce2');

    anchors[0].click();
    await tasksSettled();
    assert.html.textContent(host, 'ce1');

    anchors[2].click();
    await tasksSettled();
    assert.html.textContent(host, 'ce2');

    await au.stop(true);
  });

  class HrefGenerationForChildComponentTestData {
    public constructor(
      public readonly name: string,
      public readonly templates: [root: string, c1: string, c2: string],
      public readonly expectedHrefs: [expectations1: { href: string }[], expectations2: { href: string }[]],
    ) { }
  }
  function* getHrefGenerationForChildComponentTestData() {
    yield new HrefGenerationForChildComponentTestData(
      'using path',
      [
        `
    <a load="c1">C1</a>
    <a load="c2">C2</a>
    <au-viewport></au-viewport>`,
        `c1
    <a load="gc11">gc11</a>
    <a load="gc12">gc12</a>
    <a load="route: c2; context.bind: parentCtx">c2</a>
    <au-viewport></au-viewport>`,
        `c2
    <a load="gc21">gc21</a>
    <a load="gc22">gc22</a>
    <a load="route: c1; context.bind: parentCtx">c1</a>
    <au-viewport></au-viewport>`
      ],
      [
        [
          { href: 'c1' },
          { href: 'c2' },
          { href: 'c1/gc11' },
          { href: 'c1/gc12' },
          { href: 'c2' },
        ],
        [
          { href: 'c1' },
          { href: 'c2' },
          { href: 'c2/gc21' },
          { href: 'c2/gc22' },
          { href: 'c1' },
        ]
      ]
    );
    yield new HrefGenerationForChildComponentTestData(
      'using route-id',
      [
        `
    <a load="r1">C1</a>
    <a load="r2">C2</a>
    <au-viewport></au-viewport>`,
        `c1
    <a load="r1">gc11</a>
    <a load="r2">gc12</a>
    <a load="route: r2; context.bind: parentCtx">c2</a>
    <au-viewport></au-viewport>`,
        `c2
    <a load="r1">gc21</a>
    <a load="r2">gc22</a>
    <a load="route: r1; context.bind: parentCtx">c1</a>
    <au-viewport></au-viewport>`
      ],
      [
        [
          { href: 'r1' },
          { href: 'r2' },
          { href: 'c1/r1' },
          { href: 'c1/r2' },
          { href: 'r2' },
        ],
        [
          { href: 'r1' },
          { href: 'r2' },
          { href: 'c2/r1' },
          { href: 'c2/r2' },
          { href: 'r1' },
        ]
      ]
    );
  }
  for (const {
    name,
    templates: [rt, t1, t2],
    expectedHrefs: [expectations1, expectations2]
  } of getHrefGenerationForChildComponentTestData()) {
    it(`href attribute value is correctly generated for child components - ${name}`, async function () {

      @customElement({ name: 'gc-11', template: 'gc11' })
      class GrandChildOneOne { }

      @customElement({ name: 'gc-12', template: 'gc12' })
      class GrandChildOneTwo { }

      @route({
        routes: [
          { path: '', redirectTo: 'gc11' },
          { id: 'r1', path: 'gc11', component: GrandChildOneOne },
          { id: 'r2', path: 'gc12', component: GrandChildOneTwo },
        ],
      })
      @customElement({ name: 'c-one', template: t1 })
      class ChildOne {
        private readonly parentCtx: IRouteContext;
        public constructor() {
          this.parentCtx = resolve(IRouteContext).parent;
        }
      }

      @customElement({ name: 'gc-21', template: 'gc21' })
      class GrandChildTwoOne { }

      @customElement({ name: 'gc-22', template: 'gc22' })
      class GrandChildTwoTwo { }

      @route({
        routes: [
          { path: '', redirectTo: 'gc21' },
          { id: 'r1', path: 'gc21', component: GrandChildTwoOne },
          { id: 'r2', path: 'gc22', component: GrandChildTwoTwo },
        ],
      })
      @customElement({ name: 'c-two', template: t2 })
      class ChildTwo {
        private readonly parentCtx: IRouteContext;
        public constructor() {
          this.parentCtx = resolve(IRouteContext).parent;
        }
      }

      @route({
        routes: [
          {
            path: '',
            redirectTo: 'c1',
          },
          {
            id: 'r1',
            path: 'c1',
            component: ChildOne,
          },
          {
            id: 'r2',
            path: 'c2',
            component: ChildTwo,
          },
        ],
      })
      @customElement({ name: 'my-app', template: rt })
      class Root { }

      const { au, host, container } = await start({ appRoot: Root });
      const location = container.get<MockBrowserHistoryLocation>(ILocation);
      await tasksSettled();

      let anchors = host.querySelectorAll('a');
      assertAnchors(anchors, expectations1, 'round#1 - anchors', false);
      assert.match(location.path, /c1\/gc11$/, 'round#1 - location.path');

      anchors[3].click();
      await tasksSettled();
      assertAnchors(anchors, expectations1, 'round#2 - anchors', false);
      assert.match(location.path, /c1\/gc12$/, 'round#2 - location.path');

      anchors[2].click();
      await tasksSettled();
      assertAnchors(anchors, expectations1, 'round#3 - anchors', false);
      assert.match(location.path, /c1\/gc11$/, 'round#3 - location.path');

      anchors[1].click();
      await tasksSettled();
      anchors = host.querySelectorAll('a');
      assertAnchors(anchors, expectations2, 'round#4', false);
      assert.match(location.path, /c2\/gc21$/, 'round#4 - location.path');

      anchors[3].click();
      await tasksSettled();
      assertAnchors(anchors, expectations2, 'round#5 - anchors', false);
      assert.match(location.path, /c2\/gc22$/, 'round#5 - location.path');

      anchors[2].click();
      await tasksSettled();
      assertAnchors(anchors, expectations2, 'round#6 - anchors', false);
      assert.match(location.path, /c2\/gc21$/, 'round#6 - location.path');

      anchors[4].click();
      await tasksSettled();
      anchors = host.querySelectorAll('a');
      assertAnchors(anchors, expectations1, 'round#7', false);
      assert.match(location.path, /c1\/gc11$/, 'round#7 - location.path');

      await au.stop(true);
    });
  }

  class HrefGenerationForChildComponentSiblingTestData {
    public constructor(
      public readonly name: string,
      public readonly templates: [root: string, c1: string, c2: string],
      public readonly expectedHrefs: [expectations1: { href: string }[], expectations2: { href: string }[]],
    ) { }
  }
  function* getHrefGenerationForChildComponentSiblingTestData() {
    yield new HrefGenerationForChildComponentSiblingTestData(
      'using path',
      [
        `
    <a load="c1">C1</a>
    <a load="c2">C2</a>
    <au-viewport></au-viewport>`,
        `c1
    <a load="gc11+gc12">gc11+gc12</a>
    <a load="gc12+gc13">gc12+gc13</a>
    <a load="gc13+gc11">gc13+gc11</a>
    <au-viewport default.bind="null"></au-viewport><au-viewport default.bind="null"></au-viewport>`,
        `c2
    <a load="gc21+gc22">gc21+gc22</a>
    <a load="gc22+gc23">gc22+gc23</a>
    <a load="gc23+gc21">gc23+gc21</a>
    <au-viewport default.bind="null"></au-viewport><au-viewport default.bind="null"></au-viewport>`
      ],
      [
        [
          { href: 'c1' },
          { href: 'c2' },
          { href: 'c1/gc11+gc12' },
          { href: 'c1/gc12+gc13' },
          { href: 'c1/gc13+gc11' },
        ],
        [
          { href: 'c1' },
          { href: 'c2' },
          { href: 'c2/gc21+gc22' },
          { href: 'c2/gc22+gc23' },
          { href: 'c2/gc23+gc21' },
        ]
      ]
    );
    yield new HrefGenerationForChildComponentSiblingTestData(
      'using route-id',
      [
        `
    <a load="r1">C1</a>
    <a load="r2">C2</a>
    <au-viewport></au-viewport>`,
        `c1
    <a load="r1+r2">gc11+gc12</a>
    <a load="r2+r3">gc12+gc13</a>
    <a load="r3+r1">gc13+gc11</a>
    <au-viewport default.bind="null"></au-viewport><au-viewport default.bind="null"></au-viewport>`,
        `c2
    <a load="r1+r2">gc21+gc22</a>
    <a load="r2+r3">gc22+gc23</a>
    <a load="r3+r1">gc23+gc21</a>
    <au-viewport default.bind="null"></au-viewport><au-viewport default.bind="null"></au-viewport>`
      ],
      [
        [
          { href: 'r1' },
          { href: 'r2' },
          { href: 'c1/r1+r2' },
          { href: 'c1/r2+r3' },
          { href: 'c1/r3+r1' },
        ],
        [
          { href: 'r1' },
          { href: 'r2' },
          { href: 'c2/r1+r2' },
          { href: 'c2/r2+r3' },
          { href: 'c2/r3+r1' },
        ]
      ]
    );
  }
  for (const {
    name,
    templates: [rt, t1, t2],
    expectedHrefs: [expectations1, expectations2]
  } of getHrefGenerationForChildComponentSiblingTestData()) {
    it(`href attribute value is correctly generated for child components - sibling instructions - ${name}`, async function () {

      @customElement({ name: 'gc-11', template: 'gc11' })
      class GrandChildOneOne { }

      @customElement({ name: 'gc-12', template: 'gc12' })
      class GrandChildOneTwo { }

      @customElement({ name: 'gc-13', template: 'gc13' })
      class GrandChildOneThree { }

      @route({
        routes: [
          { id: 'r1', path: 'gc11', component: GrandChildOneOne },
          { id: 'r2', path: 'gc12', component: GrandChildOneTwo },
          { id: 'r3', path: 'gc13', component: GrandChildOneThree },
        ],
      })
      @customElement({ name: 'c-one', template: t1 })
      class ChildOne {
        private readonly parentCtx: IRouteContext;
        public constructor() {
          this.parentCtx = resolve(IRouteContext).parent;
        }
      }

      @customElement({ name: 'gc-21', template: 'gc21' })
      class GrandChildTwoOne { }

      @customElement({ name: 'gc-22', template: 'gc22' })
      class GrandChildTwoTwo { }

      @customElement({ name: 'gc-23', template: 'gc23' })
      class GrandChildTwoThree { }

      @route({
        routes: [
          { id: 'r1', path: 'gc21', component: GrandChildTwoOne },
          { id: 'r2', path: 'gc22', component: GrandChildTwoTwo },
          { id: 'r3', path: 'gc23', component: GrandChildTwoThree },
        ],
      })
      @customElement({ name: 'c-two', template: t2 })
      class ChildTwo {
        private readonly parentCtx: IRouteContext;
        public constructor() {
          this.parentCtx = resolve(IRouteContext).parent;
        }
      }

      @route({
        routes: [
          {
            path: '',
            redirectTo: 'c1',
          },
          {
            id: 'r1',
            path: 'c1',
            component: ChildOne,
          },
          {
            id: 'r2',
            path: 'c2',
            component: ChildTwo,
          },
        ],
      })
      @customElement({ name: 'my-app', template: rt })
      class Root { }

      const { au, host, container } = await start({ appRoot: Root });
      const location = container.get<MockBrowserHistoryLocation>(ILocation);
      await tasksSettled();

      let anchors = host.querySelectorAll('a');
      assertAnchors(anchors, expectations1, 'round#1 - anchors', false);
      assert.match(location.path, /c1$/, 'round#1 - location.path');

      anchors[2].click();
      await tasksSettled();
      assert.match(location.path, /c1\/gc11\+gc12$/, 'round#2 - location.path');

      anchors[3].click();
      await tasksSettled();
      assert.match(location.path, /c1\/gc12\+gc13$/, 'round#3 - location.path');

      anchors[4].click();
      await tasksSettled();
      assert.match(location.path, /c1\/gc13\+gc11$/, 'round#4 - location.path');

      anchors[1].click();
      await tasksSettled();
      anchors = host.querySelectorAll('a');
      assertAnchors(anchors, expectations2, 'round#5 - anchors', false);
      assert.match(location.path, /c2$/, 'round#5 - location.path');

      anchors[2].click();
      await tasksSettled();
      assert.match(location.path, /c2\/gc21\+gc22$/, 'round#6 - location.path');

      anchors[3].click();
      await tasksSettled();
      assert.match(location.path, /c2\/gc22\+gc23$/, 'round#7 - location.path');

      anchors[4].click();
      await tasksSettled();
      assert.match(location.path, /c2\/gc23\+gc21$/, 'round#8 - location.path');

      anchors[0].click();
      await tasksSettled();
      anchors = host.querySelectorAll('a');
      assertAnchors(anchors, expectations1, 'round#9 - anchors', false);
      assert.match(location.path, /c1$/, 'round#9 - location.path');

      await au.stop(true);
    });
  }

  it('supports routing instruction with parenthesized parameters', async function () {
    @route('c1/:id1/:id2?')
    @customElement({ name: 'c-1', template: 'c1 ${id1} ${id2}' })
    class C1 implements IRouteViewModel {
      private id1: string;
      private id2: string;
      public loading(params: Params, _next: RouteNode, _current: RouteNode): void | Promise<void> {
        this.id1 = params.id1;
        this.id2 = params.id2;
      }
    }

    @route({ routes: [{ id: 'c1', component: C1 }] })
    @customElement({ name: 'ro-ot', template: '<a load="c1(id1=1)"></a> <a load="c1(id1=2,id2=3)"></a> <au-viewport></au-viewport>' })
    class Root { }

    const { au, host } = await start({ appRoot: Root });

    assert.html.textContent(host, '', 'init');

    host.querySelector('a').click();
    await tasksSettled();
    assert.html.textContent(host, 'c1 1', 'round#1');

    host.querySelector<HTMLAnchorElement>('a:nth-of-type(2)').click();
    await tasksSettled();
    assert.html.textContent(host, 'c1 2 3', 'round#2');

    await au.stop(true);
  });

  it('allow navigating to route defined in parent context using ../ prefix with replace transitionPlan and child viewport', async function () {
    @customElement({ name: 'product-details', template: `product \${id} <a load="../../products"></a>` })
    class Product {
      id: unknown;
      public canLoad(params: Params, _next: RouteNode, _current: RouteNode): boolean {
        this.id = params.id;
        return true;
      }
    }
    @customElement({ name: 'product-init', template: `product init <a load="../product/1"></a><a load="../product/2"></a>` })
    class ProductInit { }

    @route({
      routes: [
        { path: '', component: ProductInit },
        { path: 'product/:id', component: Product },
      ]
    })
    @customElement({ name: 'pro-ducts', template: `<au-viewport name="products"></au-viewport>` })
    class Products { }

    @route({
      routes: [
        { id: 'products', path: ['', 'products'], component: Products },
      ],
      transitionPlan: 'replace',
    })
    @customElement({ name: 'ro-ot', template: '<au-viewport name="root"></au-viewport>' })
    class Root { }

    const { au, host } = await start({ appRoot: Root, registrations: [Products, Product] });
    await tasksSettled();

    assert.html.textContent(host, 'product init');
    const anchors = Array.from(host.querySelectorAll('a'));
    const hrefs = anchors.map(a => a.href);
    assert.match(hrefs[0], /product\/1$/);
    assert.match(hrefs[1], /product\/2$/);

    anchors[0].click();
    await tasksSettled();
    assert.html.textContent(host, 'product 1', 'round#1');
    // go back
    const back = host.querySelector<HTMLAnchorElement>('a');
    assert.match(back.href, /products$/, 'round#1 - back - href');
    back.click();
    await tasksSettled();
    assert.html.textContent(host, 'product init', 'round#1 - back - text');

    // 2nd round
    host.querySelector<HTMLAnchorElement>('a:nth-of-type(2)').click();
    await tasksSettled();
    assert.html.textContent(host, 'product 2', 'round#2');
    // go back
    host.querySelector<HTMLAnchorElement>('a').click();
    await tasksSettled();
    assert.html.textContent(host, 'product init', 'round#2 - back - text');

    await au.stop(true);
  });

  for (const value of [null, undefined]) {
    it(`${value} value for a query-string param is ignored`, async function () {
      @route('product')
      @customElement({ name: 'pro-duct', template: `product` })
      class Product {
        public query: Readonly<URLSearchParams>;
        public canLoad(_params: Params, _next: RouteNode, _current: RouteNode): boolean {
          this.query = _next.queryParams;
          return true;
        }
      }

      @route({
        routes: [
          Product,
        ]
      })
      @customElement({ name: 'ro-ot', template: '<a load="route:product; params.bind: {id: value}"></a><au-viewport></au-viewport>' })
      class Root {
        private readonly value = value;
      }

      const { au, host } = await start({ appRoot: Root, registrations: [Product] });
      await tasksSettled();

      host.querySelector('a').click();
      await tasksSettled();

      const product = CustomElement.for<Product>(host.querySelector('pro-duct')).viewModel;
      const query = product.query;
      assert.strictEqual(query.get('id'), null);
      assert.deepStrictEqual(Array.from(query.keys()), []);

      await au.stop(true);
    });
  }

  it('respects constrained routes', async function () {
    @route('nf')
    @customElement({ name: 'not-found', template: `nf` })
    class NotFound { }

    @route({ id: 'product', path: 'product/:id{{^\\d+$}}' })
    @customElement({ name: 'pro-duct', template: `product \${id}` })
    class Product {
      public id: unknown;
      public canLoad(params: Params, _next: RouteNode, _current: RouteNode): boolean {
        this.id = params.id;
        return true;
      }
    }

    @route({ routes: [Product, NotFound], fallback: 'nf' })
    @customElement({
      name: 'ro-ot',
      template: `
        <a load="route:product; params.bind:{id: 42}"></a>
        <a load="route:product; params.bind:{id: foo}"></a>
        <a load="product/bar"></a>
        <au-viewport></au-viewport>
      `
    })
    class Root { }

    const { au, host } = await start({ appRoot: Root });

    await tasksSettled();

    const anchors = Array.from(host.querySelectorAll('a'));

    anchors[0].click();
    await tasksSettled();
    assert.html.textContent(host, 'product 42');

    anchors[1].click();
    await tasksSettled();
    assert.html.textContent(host, 'nf');

    anchors[0].click();
    await tasksSettled();
    assert.html.textContent(host, 'product 42');

    anchors[2].click();
    await tasksSettled();
    assert.html.textContent(host, 'nf');

    await au.stop(true);
  });

  {
    class TestData {
      public readonly encodedRouteParam: string;
      public constructor(
        public readonly name: string,
        public readonly routeParam: string,
      ) {
        this.encodedRouteParam = encodeURIComponent(routeParam);
      }
    }
    const testData = [
      new TestData('with /', 'foo/bar'),
      new TestData('with %', 'foo%bar'),
      new TestData('with ?', 'foo?bar'),
      new TestData('with #', 'foo#bar'),
      new TestData('with &', 'foo&bar'),
      new TestData('with emoji', 'foo😀bar'),
    ] as const;
    const numTestData = testData.length;
    for (const useHash of [true, false]) {
      for (let i = 0; i < numTestData; ++i) {
        const { name, routeParam, encodedRouteParam } = testData[i];
        it(`decodes route parameters correctly - ${name} - with hash: ${useHash}`, async function () {
          @route('p1/*rest')
          @customElement({ name: 'p-1', template: `p1 \${rest}` })
          class P1 {
            public rest: string;
            public loading(params: Params, _next: RouteNode, _current: RouteNode): void {
              this.rest = params.rest;
            }
          }

          @route({ routes: [P1] })
          @customElement({ name: 'ro-ot', template: '<a load.bind="route"></a><au-viewport></au-viewport>' })
          class Root {
            public route: string = `p1/${encodedRouteParam}`;
          }

          const { au, host, rootVm } = await start({ appRoot: Root, registrations: [P1], useHash });

          const anchor = host.querySelector('a');

          anchor.click();
          await tasksSettled();
          assert.html.textContent(host, `p1 ${routeParam}`, 'round#1');

          // change route
          const { routeParam: nextRouteParam, encodedRouteParam: nextEncodedRouteParam } = testData[(i + 1) % numTestData];
          const nextRoute = rootVm.route = `p1/${nextEncodedRouteParam}`;
          await tasksSettled();
          assert.strictEqual(anchor.getAttribute('href').endsWith(nextRoute), true, 'round#2 - href');
          anchor.click();
          await tasksSettled();
          assert.html.textContent(host, `p1 ${nextRouteParam}`, 'round#2');

          await au.stop(true);
        });
      }
    }
  }
});
