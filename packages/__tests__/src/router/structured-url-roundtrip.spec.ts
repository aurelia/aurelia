import { LogLevel, LoggerConfiguration, Registration } from '@aurelia/kernel';
import { ICurrentRoute, IRouter, NavigationInstruction, Params, Routeable, RouterConfiguration, route } from '@aurelia/router';
import { Aurelia, customElement, IHistory, ILocation, IWindow } from '@aurelia/runtime-html';
import { assert, TestContext } from '@aurelia/testing';

// Native URL parsing is important here: a fresh fixture must consume the exact
// browser address published by the first app, not its structured instructions.
class RoundtripHistory {
  private url: URL;
  public state: {} | null = null;

  public constructor(href: string) { this.url = new URL(href); }
  public get href(): string { return this.url.href; }
  public get pathname(): string { return this.url.pathname; }
  public get search(): string { return this.url.search; }
  public get hash(): string { return this.url.hash; }
  public get length(): number { return 1; }
  public pushState(state: {} | null, _title: string, path: string): void {
    this.state = state;
    this.url = new URL(path, this.url);
  }
  public replaceState(state: {} | null, title: string, path: string): void {
    this.pushState(state, title, path);
  }
}

describe('router/structured-url-roundtrip.spec.ts', function () {
  const applications: { au: Aurelia; router: IRouter }[] = [];

  afterEach(async function () {
    for (const { au, router } of applications.splice(0)) {
      router.stop();
      if (au.isRunning) await au.stop(true);
    }
  });

  @customElement({ name: 'roundtrip-start', template: 'Start' })
  class Start { }

  @customElement({ name: 'roundtrip-page', template: 'Page:${key}' })
  class Page {
    public key = '';
    public loading(params: Params): void { this.key = params.key ?? ''; }
  }

  async function start({
    routes,
    useHash,
    initial,
    useEagerLoading = false,
    template = '<au-viewport></au-viewport>',
  }: {
    routes: Routeable[];
    useHash: boolean;
    initial?: string;
    useEagerLoading?: boolean;
    template?: string;
  }) {
    const ctx = TestContext.create();
    const { container } = ctx;
    const href = (path: string) => `https://example.test/app/${useHash ? '#/' : ''}${path}`;
    const history = new RoundtripHistory(initial ?? href('start'));
    container.register(
      LoggerConfiguration.create({ level: LogLevel.fatal }),
      RouterConfiguration.customize({ useUrlFragmentHash: useHash, basePath: '/app/', useNavigationModel: false, useEagerLoading }),
      Registration.instance(IHistory, history),
      Registration.instance(ILocation, history),
      Registration.instance(IWindow, {
        document: { baseURI: 'https://example.test/app/' },
        addEventListener() { /* Fresh startup supplies the native-entry address. */ },
        removeEventListener() { /* No global listeners are installed. */ },
      }),
    );

    @route({ routes: [{ path: 'start', component: Start }, ...routes] })
    @customElement({ name: 'roundtrip-app', template })
    class App { }

    const host = ctx.createElement('div');
    const router = container.get(IRouter);
    const current = container.get(ICurrentRoute);
    const au = new Aurelia(container);
    au.app({ component: App, host });
    applications.push({ au, router });
    await au.start();
    return { router, current, history, host, href };
  }

  for (const useHash of [false, true]) {
    describe(useHash ? 'hash addresses' : 'history addresses', function () {
      for (const path of ['a%2Bb', 'team%40work', 'report%28draft%29']) {
        it(`reopens the author-encoded static path ${path} after structured navigation`, async function () {
          const address = path;
          const routes = [{ id: path, path, component: Page }];
          const app = await start({ routes, useHash });
          const inputs: NavigationInstruction[][] = [
            [path],
            [{ component: path }],
            [Page],
          ];

          for (const input of inputs) {
            assert.strictEqual(await app.router.load(input), true);
            assert.html.textContent(app.host, 'Page:');
            assert.strictEqual(app.history.href, app.href(address));
            await app.router.load('start');
          }

          const generated = await app.router.generatePath({ component: Page });
          assert.strictEqual(generated, `${useHash ? '/#/' : ''}${address}`);
          assert.strictEqual(await app.router.load(generated), true);
          assert.html.textContent(app.host, 'Page:');
          assert.strictEqual(app.history.href, app.href(address));

          const reloaded = await start({ routes, useHash, initial: app.history.href });
          assert.html.textContent(reloaded.host, 'Page:');
          assert.strictEqual(reloaded.history.href, app.history.href);
        });
      }

      for (const path of ['already%2Bencoded', 'discount%']) {
        it(`preserves the existing percent spelling of static path ${path}`, async function () {
          const routes = [{ id: 'literal', path, component: Page }];
          const app = await start({ routes, useHash });

          assert.strictEqual(await app.router.load({ component: 'literal' }), true);
          assert.html.textContent(app.host, 'Page:');
          assert.strictEqual(app.history.href, app.href(path));
          const generated = await app.router.generatePath({ component: Page });
          assert.strictEqual(generated, `${useHash ? '/#/' : ''}${path}`);

          const reloaded = await start({ routes, useHash, initial: app.history.href });
          assert.html.textContent(reloaded.host, 'Page:');
          assert.strictEqual(reloaded.history.href, app.history.href);
        });
      }

      for (const [key, address] of [
        ['section+one@home', 'section%2Bone%40home'],
        ['draft(one)', 'draft%28one%29'],
        ["writer's draft!~", 'writer%27s%20draft%21%7E'],
        ['section/one%2B', 'section%2Fone%252B'],
        ['100%', '100%25'],
      ]) {
        it(`preserves dynamic parameter ${key} through structured load and native entry`, async function () {
          const routes = [{ id: 'item', path: 'items/:key', component: Page }];
          const app = await start({ routes, useHash });
          const instruction = { component: 'item', params: { key } };

          assert.strictEqual(await app.router.load(instruction), true);
          assert.html.textContent(app.host, `Page:${key}`);
          assert.strictEqual(app.current.parameterInformation[0].params.key, key);
          assert.strictEqual(app.history.href, app.href(`items/${address}`));
          const generated = await app.router.generatePath(instruction);
          assert.strictEqual(generated, `${useHash ? '/#/' : ''}items/${address}`);

          const reloaded = await start({ routes, useHash, initial: app.history.href });
          assert.html.textContent(reloaded.host, `Page:${key}`);
          assert.strictEqual(reloaded.current.parameterInformation[0].params.key, key);
          assert.strictEqual(reloaded.history.href, app.history.href);
        });
      }

      for (const useEagerLoading of [false, true]) {
        it(`retains nested multi-segment routes (eager=${useEagerLoading})`, async function () {
          @route({ routes: [{ id: 'detail', path: 'details/report%28draft%29', component: Page }] })
          @customElement({ name: 'roundtrip-layout', template: 'Layout:<au-viewport></au-viewport>' })
          class Layout { }

          const routes = [{ id: 'docs', path: 'docs/a%2Bb', component: Layout }];
          const app = await start({ routes, useHash, useEagerLoading });
          const instruction = { component: Layout, children: [{ component: Page }] };
          const address = 'docs/a%2Bb/details/report%28draft%29';

          assert.strictEqual(await app.router.load(instruction), true);
          assert.html.textContent(app.host, 'Layout:Page:');
          assert.strictEqual(app.history.href, app.href(address));
          const generated = await app.router.generatePath(instruction);
          assert.strictEqual(generated, `${useHash ? '/#/' : ''}${address}`);

          const reloaded = await start({ routes, useHash, useEagerLoading, initial: app.history.href });
          assert.html.textContent(reloaded.host, 'Layout:Page:');
          assert.strictEqual(reloaded.history.href, app.history.href);
        });
      }

      it('separates literal path data from the viewport and sibling address syntax', async function () {
        @customElement({ name: 'roundtrip-side', template: 'Side' })
        class Side { }
        const routes = [
          { id: 'main', path: 'a%2Bb', component: Page },
          { id: 'side', path: 'team%40work', component: Side },
        ];
        const template = '<au-viewport name="main"></au-viewport><au-viewport name="side"></au-viewport>';
        const app = await start({ routes, useHash, template, initial: `https://example.test/app/${useHash ? '#/' : ''}start@main` });
        const instruction = [
          { component: 'main', viewport: 'main' },
          { component: 'side', viewport: 'side' },
        ];
        const address = 'a%2Bb@main+team%40work@side';

        assert.strictEqual(await app.router.load(instruction), true);
        assert.html.textContent(app.host, 'Page:Side');
        assert.strictEqual(app.history.href, app.href(address));
        assert.strictEqual(await app.router.generatePath(instruction), `${useHash ? '/#/' : ''}${address}`);

        const reloaded = await start({ routes, useHash, template, initial: app.history.href });
        assert.html.textContent(reloaded.host, 'Page:Side');
        assert.strictEqual(reloaded.history.href, app.history.href);
      });

      it('preserves distinct raw static, encoded static and dynamic route identities', async function () {
        @customElement({ name: 'roundtrip-raw-static', template: 'Raw static' })
        class RawStatic { }
        @customElement({ name: 'roundtrip-encoded-static', template: 'Encoded static' })
        class EncodedStatic { }
        const routes = [
          { id: 'raw', path: 'a+b', component: RawStatic },
          { id: 'encoded', path: 'a%2Bb', component: EncodedStatic },
          { id: 'generic', path: ':key', component: Page },
        ];
        const app = await start({ routes, useHash });

        // Raw structured paths retain their legacy meaning. Automatically
        // adding encoded aliases would steal existing static/dynamic bookmarks.
        assert.strictEqual(await app.router.load({ component: 'raw' }), true);
        assert.html.textContent(app.host, 'Raw static');
        assert.strictEqual(app.history.href, app.href('a+b'));

        const exact = await start({ routes, useHash, initial: app.href('a%2Bb') });
        assert.html.textContent(exact.host, 'Encoded static');
        assert.strictEqual(exact.history.href, app.href('a%2Bb'));

        const generic = await start({ routes: [routes[0], routes[2]], useHash, initial: app.href('a%2Bb') });
        assert.html.textContent(generic.host, 'Page:a+b');
        assert.strictEqual(generic.current.parameterInformation[0].params.key, 'a+b');
        assert.strictEqual(generic.history.href, app.href('a%2Bb'));
      });

      it('retains valid DSL addresses and route-ID precedence', async function () {
        @customElement({ name: 'roundtrip-archive', template: 'Archive' })
        class Archive { }
        const routes = [
          { id: 'reports', path: 'archive', component: Archive },
          { id: 'reports-page', path: 'reports', component: Page },
          { id: 'item', path: 'items/:key', component: Page },
        ];
        const template = '<au-viewport name="main"></au-viewport><au-viewport name="side"></au-viewport>';
        const address = 'reports@main+item(key=two)@side';
        const app = await start({ routes, useHash, template, initial: `https://example.test/app/${useHash ? '#/' : ''}${address}` });

        assert.html.textContent(app.host, 'ArchivePage:two');
        assert.strictEqual(app.history.href, app.href('archive@main+items/two@side'));
        const reloaded = await start({ routes, useHash, template, initial: app.history.href });
        assert.html.textContent(reloaded.host, 'ArchivePage:two');
        assert.strictEqual(reloaded.history.href, app.history.href);

        assert.strictEqual(await app.router.load('reports-page@main+item(key=three)@side'), true);
        assert.html.textContent(app.host, 'Page:Page:three');
      });
    });
  }
});
