import { LogLevel, LoggerConfiguration, Registration, resolve } from '@aurelia/kernel';
import {
  AuNavId,
  IContextRouter,
  ICurrentRoute,
  ILocationManager,
  IRouter,
  IRouterEvents,
  Params,
  Routeable,
  RouteNode,
  RouterConfiguration,
  ServerLocationManager,
  route,
} from '@aurelia/router';
import { Aurelia, customElement, IHistory, ILocation, IWindow } from '@aurelia/runtime-html';
import { assert, TestContext } from '@aurelia/testing';

// Use the browser's URL parser so a document query and a route query inside its
// hash remain separate. The older history mock splits both at '?' and '#'.
class UrlHistory {
  private readonly entries: { url: URL; state: {} | null }[];
  private index = 0;
  public writes = 0;

  public constructor(url: string) {
    this.entries = [{ url: new URL(url), state: null }];
  }

  public get url(): URL { return this.entries[this.index].url; }
  public get href(): string { return this.url.href; }
  public get pathname(): string { return this.url.pathname; }
  public get search(): string { return this.url.search; }
  public get hash(): string { return this.url.hash; }
  public get state(): {} | null { return this.entries[this.index].state; }
  public get length(): number { return this.entries.length; }

  public pushState(state: {} | null, _title: string, path: string): void {
    const url = new URL(path, this.url);
    this.entries.splice(++this.index, Infinity, { state, url });
    this.writes++;
  }

  public replaceState(state: {} | null, _title: string, path: string): void {
    this.entries[this.index] = { state, url: new URL(path, this.url) };
    this.writes++;
  }
}

describe('router/url-navigation.spec.ts', function () {
  const applications: Aurelia[] = [];

  afterEach(async function () {
    for (const au of applications.splice(0)) {
      await au.stop(true);
    }
  });

  @customElement({ name: 'url-page', template: '${path}|${query}|${fragment}' })
  class Page {
    public path = '';
    public query = '';
    public fragment = '';
    public loading(_params: Params, next: RouteNode): void {
      this.path = next.path;
      this.query = next.queryParams.toString();
      this.fragment = next.fragment ?? '';
    }
  }

  @customElement({ name: 'url-home', template: 'home' })
  class Home { }

  async function start({
    useHash = false,
    initial = '/users/members?page=1',
    base = '/app/',
    document = base,
    template = '<au-viewport></au-viewport>',
    routes = [
      { path: 'users/members', component: Page },
      { path: 'users/admins', component: Page },
      { path: 'about', component: Page },
      { path: 'home', component: Page },
    ] as Routeable[],
    server = false,
    preserveHashDocument = false,
  } = {}) {
    const ctx = TestContext.create();
    const { container } = ctx;
    const history = new UrlHistory(`https://example.test${useHash ? `${document}#${initial}` : `${base.slice(0, -1)}${initial}`}`);
    container.register(
      LoggerConfiguration.create({ level: LogLevel.fatal }),
      RouterConfiguration.customize({ useUrlFragmentHash: useHash, useNavigationModel: false, basePath: base, preserveHashDocument }),
      Registration.instance(IWindow, {
        document: { baseURI: new URL(base, history.url).href },
        addEventListener() { /* This fixture drives navigation through the router. */ },
        removeEventListener() { /* No global listeners are installed. */ },
      }),
      Registration.instance(ILocation, history),
      Registration.instance(IHistory, history),
    );
    if (server) {
      container.register(Registration.instance(ILocationManager, new ServerLocationManager(`${base.slice(0, -1)}${initial}`, base)));
    }

    @route({ routes })
    @customElement({ name: 'url-app', template })
    class App { }

    const current = container.get(ICurrentRoute);
    const router = container.get(IRouter);
    const events = container.get(IRouterEvents);
    const host = ctx.createElement('div');
    const au = new Aurelia(container);
    applications.push(au);
    await au.app({ host, component: App }).start();
    return { router, current, history, host, events };
  }

  for (const useHash of [false, true]) {
    describe(useHash ? 'hash URLs' : 'history URLs', function () {
      const href = (path: string) => `https://example.test/app${useHash ? '/#' : ''}${path}`;

      for (const [reference, destination, text] of [
        ['admins', '/users/admins', 'users/admins||'],
        ['../about', '/about', 'about||'],
        ['/home', '/home', 'home||'],
        ['?page=2', '/users/members?page=2', 'users/members|page=2|'],
        ['#details', '/users/members?page=1#details', 'users/members|page=1|details'],
      ]) {
        it(`resolves and follows ${reference} from the application URL`, async function () {
          const { router, host, history } = await start({ useHash });
          assert.strictEqual(router.createHref(reference), href(destination));
          // This page reads filters in loading. Request hooks for query-only
          // navigation, just as callers of the existing load API would do.
          assert.strictEqual(await router.navigate(reference, { transitionPlan: 'invoke-lifecycles' }), true);
          assert.html.textContent(host, text);
          assert.strictEqual(history.href, href(destination));
        });
      }

      for (const { reference, resolved, canonical, text } of [
        { reference: '/', resolved: '/', canonical: '/', text: 'home' },
        { reference: '../', resolved: '/', canonical: '/', text: 'home' },
        { reference: './', resolved: '/users/', canonical: '/users', text: 'users||' },
        { reference: '/users/', resolved: '/users/', canonical: '/users', text: 'users||' },
        { reference: '/users/?q=2#details', resolved: '/users/?q=2#details', canonical: '/users?q=2#details', text: 'users|q=2|details' },
        { reference: '/users/#details?tab=summary', resolved: '/users/#details%3Ftab%3Dsummary', canonical: '/users#details%3Ftab%3Dsummary', text: 'users||details?tab=summary' },
      ]) {
        it(`follows the root or directory reference ${reference}`, async function () {
          const { router, current, host, history } = await start({
            useHash,
            routes: [
              { path: '', component: Home },
              { path: 'users', component: Page },
              { path: 'users/members', component: Page },
            ],
          });

          // A browser href retains the reference's slash. Route recognition
          // canonicalizes it before publishing the successful destination.
          assert.strictEqual(router.createHref(reference), href(resolved));
          assert.strictEqual(await router.navigate(reference), true);
          assert.html.textContent(host, text);
          assert.strictEqual(history.href, href(canonical));
          assert.strictEqual(current.path, canonical.startsWith('/users') ? 'users' : '');
        });
      }

      for (const [reference, destination, text] of [
        ['', '/?page=1', '|page=1|'],
        ['?q=2', '/?q=2', '|q=2|'],
        ['#details', '/?page=1#details', '|page=1|details'],
      ]) {
        it(`follows ${JSON.stringify(reference)} from the default page`, async function () {
          const { router, current, host, history } = await start({
            useHash,
            initial: '/?page=1#overview',
            routes: [{ path: '', component: Page }],
          });

          assert.html.textContent(host, '|page=1|overview');
          assert.strictEqual(router.createHref(reference), href(destination));
          assert.strictEqual(await router.navigate(reference, { transitionPlan: 'invoke-lifecycles' }), true);
          assert.html.textContent(host, text);
          assert.strictEqual(current.path, '');
          assert.strictEqual(history.href, href(destination));
        });
      }

      it('follows the home redirect when navigating to the application root', async function () {
        const { router, current, history, host } = await start({
          useHash,
          routes: [
            { path: '', redirectTo: 'home' },
            { path: 'home', component: Page },
            { path: 'users/members', component: Page },
          ],
        });

        assert.strictEqual(router.createHref('/'), href('/'));
        assert.strictEqual(await router.navigate('/'), true);
        assert.html.textContent(host, 'home||');
        assert.strictEqual(current.path, 'home');
        assert.strictEqual(history.href, href('/home'));
        assert.strictEqual(router.createHref('reports'), href('/reports'));
      });

      for (const reference of ['/users/', '/users/index.html']) {
        it(`uses the canonical route as the next base after navigating to ${reference}`, async function () {
          const { router, current, host, history } = await start({
            useHash,
            routes: [
              { path: 'users/members', component: Page },
              { path: 'users', component: Page },
              { path: 'users/admins', component: Page },
              { path: 'admins', component: Page },
            ],
          });

          assert.strictEqual(await router.navigate(reference), true);
          assert.html.textContent(host, 'users||');
          assert.strictEqual(current.path, 'users');
          assert.strictEqual(history.href, href('/users'));

          // The existing router publishes /users, so the next sibling is
          // /admins. Retaining the requested directory would select /users/admins.
          assert.strictEqual(router.createHref('admins'), href('/admins'));
          assert.strictEqual(await router.navigate('admins'), true);
          assert.html.textContent(host, 'admins||');
          assert.strictEqual(history.href, href('/admins'));
        });
      }

      it('does not navigate, run guards or write history when resolving a URL', async function () {
        const { router, host, history, events } = await start({ useHash });
        let navigations = 0;
        const subscription = events.subscribe('au:router:navigation-start', () => navigations++);
        const before = { content: host.textContent, href: history.href, writes: history.writes };

        assert.strictEqual(router.createHref('../about'), href('/about'));
        assert.strictEqual(router.createHref('/not-a-configured-route'), href('/not-a-configured-route'));
        assert.strictEqual(navigations, 0);
        assert.deepStrictEqual({ content: host.textContent, href: history.href, writes: history.writes }, before);
        subscription.dispose();
      });

      for (const reference of ['https://external.test/page', '//external.test/page', 'mailto:help@example.test']) {
        it(`rejects the document URL ${reference} before starting navigation`, async function () {
          const { router, history, events } = await start({ useHash });
          let navigations = 0;
          const subscription = events.subscribe('au:router:navigation-start', () => navigations++);
          const before = { href: history.href, writes: history.writes };

          assert.throws(() => router.createHref(reference), /AUR3273/);
          assert.throws(() => router.navigate(reference), /AUR3273/);
          assert.strictEqual(navigations, 0);
          assert.deepStrictEqual({ href: history.href, writes: history.writes }, before);
          subscription.dispose();
        });
      }

      it('does not strip a route segment that happens to equal the deployment base', async function () {
        const { router, host, history } = await start({
          useHash,
          initial: '/app/items',
          routes: [
            { path: 'app/items', component: Page },
            { path: 'app/details', component: Page },
          ],
        });

        assert.html.textContent(host, 'app/items||');
        assert.strictEqual(router.createHref('details'), href('/app/details'));
        await router.navigate('details');
        assert.html.textContent(host, 'app/details||');
        assert.strictEqual(history.href, href('/app/details'));
      });

      it('keeps encoded query delimiters as data and decodes the fragment once', async function () {
        const { router, host, current } = await start({ useHash });
        await router.navigate('?return=%2Fitems%3Ffilter%3Da%26sort%3Db&literal=%2525#section%2523', { transitionPlan: 'invoke-lifecycles' });

        assert.strictEqual(current.query.get('return'), '/items?filter=a&sort=b');
        assert.strictEqual(current.query.get('literal'), '%25');
        assert.html.textContent(host, 'users/members|return=%2Fitems%3Ffilter%3Da%26sort%3Db&literal=%2525|section%23');
      });

      it('keeps an encoded delimiter inside its route parameter', async function () {
        const { router, current, history } = await start({
          useHash,
          routes: [
            { path: 'users/members', component: Page },
            { path: 'files/:key', component: Page },
          ],
        });

        await router.navigate('/files/section%23one?label=a%2Bb');
        assert.strictEqual(current.parameterInformation[0].params.key, 'section#one');
        assert.strictEqual(current.query.get('label'), 'a+b');
        assert.strictEqual(history.href, href('/files/section%23one?label=a%2Bb'));
      });

      it('retains the last successful base while a guard is pending', async function () {
        let entered!: () => void;
        let permit!: (value: boolean) => void;
        const guardEntered = new Promise<void>(resolve => entered = resolve);
        const permission = new Promise<boolean>(resolve => permit = resolve);

        @customElement({ name: 'approval-page', template: 'approval' })
        class Approval {
          public canLoad(): Promise<boolean> {
            entered();
            return permission;
          }
        }

        const { router } = await start({
          useHash,
          routes: [
            { path: 'users/members', component: Page },
            { path: 'workspace/approval', component: Approval },
          ],
        });

        const navigation = router.navigate('/workspace/approval');
        await guardEntered;
        try {
          assert.strictEqual(router.createHref('admins'), href('/users/admins'));
        } finally {
          // A failed assertion must still release the guard so teardown can finish.
          permit(true);
          await navigation;
        }
        assert.strictEqual(await navigation, true);
        assert.strictEqual(router.createHref('admins'), href('/workspace/admins'));
      });

      it('retains the successful base after a guard cancels navigation', async function () {
        @customElement({ name: 'restricted-page', template: 'restricted' })
        class Restricted {
          public canLoad(): boolean { return false; }
        }

        const { router, host, history } = await start({
          useHash,
          routes: [
            { path: 'users/members', component: Page },
            { path: 'users/admins', component: Page },
            { path: 'workspace/restricted', component: Restricted },
          ],
        });
        const before = history.href;

        assert.strictEqual(await router.navigate('/workspace/restricted'), false);
        assert.strictEqual(history.href, before);
        assert.strictEqual(router.createHref('admins'), href('/users/admins'));
        await router.navigate('admins');
        assert.html.textContent(host, 'users/admins||');
      });

      it('uses the successful redirect destination as the next relative base', async function () {
        const { router, host } = await start({
          useHash,
          routes: [
            { path: 'users/members', component: Page },
            { path: 'shortcut', redirectTo: 'workspace/home' },
            { path: 'workspace/home', component: Page },
            { path: 'workspace/reports', component: Page },
          ],
        });

        await router.navigate('/shortcut');
        assert.html.textContent(host, 'workspace/home||');
        assert.strictEqual(router.createHref('reports'), href('/workspace/reports'));
        await router.navigate('reports');
        assert.html.textContent(host, 'workspace/reports||');
      });

      it('updates the relative base after successful navigation without a history write', async function () {
        const { router, host, history } = await start({
          useHash,
          routes: [
            { path: 'users/members', component: Page },
            { path: 'workspace/home', component: Page },
          ],
        });
        const before = { href: history.href, writes: history.writes };

        await router.navigate('/workspace/home', { historyStrategy: 'none' });
        assert.html.textContent(host, 'workspace/home||');
        assert.deepStrictEqual({ href: history.href, writes: history.writes }, before);
        assert.strictEqual(router.createHref('reports'), href('/workspace/reports'));
      });

      for (const method of ['navigate', 'load'] as const) {
        it(`publishes caller state together with the router navigation ID using ${method}`, async function () {
          const { router, history } = await start({ useHash });
          const state = { source: 'menu' };

          await router[method]('/home', { state, historyStrategy: 'push' });
          const published = history.state as Record<string, unknown>;
          assert.strictEqual(published.source, 'menu');
          assert.strictEqual(typeof published[AuNavId], 'number');
          assert.deepStrictEqual(state, { source: 'menu' }, 'router bookkeeping does not mutate caller state');
        });
      }

      it('retains caller state when a guard redirects the accepted navigation', async function () {
        @customElement({ name: 'redirect-page', template: '' })
        class Redirect {
          public canLoad(): string { return '/home'; }
        }

        const { router, history, host } = await start({
          useHash,
          routes: [
            { path: 'users/members', component: Page },
            { path: 'shortcut', component: Redirect },
            { path: 'home', component: Page },
          ],
        });

        assert.strictEqual(await router.navigate('/shortcut', { state: { source: 'menu' }, historyStrategy: 'push' }), true);
        assert.html.textContent(host, 'home||');
        const published = history.state as Record<string, unknown>;
        assert.strictEqual(published.source, 'menu');
        assert.strictEqual(typeof published[AuNavId], 'number');
      });

      it('retains the successful base after a guard rejects with an error', async function () {
        const error = new Error('permission service unavailable');
        @customElement({ name: 'unavailable-page', template: 'unavailable' })
        class Unavailable {
          public canLoad(): Promise<boolean> { return Promise.reject(error); }
        }

        const { router, host } = await start({
          useHash,
          routes: [
            { path: 'users/members', component: Page },
            { path: 'users/admins', component: Page },
            { path: 'workspace/unavailable', component: Unavailable },
          ],
        });

        await assert.rejects(() => router.navigate('/workspace/unavailable'), value => value === error);
        assert.strictEqual(router.createHref('admins'), href('/users/admins'));
        await router.navigate('admins');
        assert.html.textContent(host, 'users/admins||');
      });

      it('keeps contextual load relative to its owning layout rather than the current URL', async function () {
        let layout!: Workspace;
        @route({ routes: [
          { path: 'items/:id', component: Page },
          { path: 'reports', component: Page },
        ] })
        @customElement({ name: 'workspace-layout', template: '<au-viewport></au-viewport>' })
        class Workspace {
          public readonly router = resolve(IContextRouter);
          public constructor() { layout = this; }
        }

        const { router, current } = await start({
          useHash,
          initial: '/workspace/items/42',
          routes: [{ path: 'workspace', component: Workspace }],
        });

        assert.strictEqual(router.createHref('reports'), href('/workspace/items/reports'));
        await layout.router.load('reports');
        assert.strictEqual(current.path, 'workspace/reports');
        assert.strictEqual(router.createHref('items/42'), href('/workspace/items/42'));
      });

      it('keeps the established route-ID interpretation of incoming addresses', async function () {
        @customElement({ name: 'archive-page', template: 'archive' })
        class Archive { }
        @customElement({ name: 'reports-page', template: 'reports' })
        class Reports { }

        const { router, host } = await start({
          useHash,
          routes: [
            { path: 'users/members', component: Page },
            { id: 'reports', path: 'archive', component: Archive },
            { id: 'reports-page', path: 'reports', component: Reports },
          ],
        });

        // Adding URL-relative resolution must not silently change existing bookmarks.
        await router.navigate('/reports');
        assert.html.textContent(host, 'archive');
        await router.load('reports-page');
        assert.html.textContent(host, 'reports');
      });

      it('preserves the serialized multi-viewport address when following and reopening a URL', async function () {
        const template = '<au-viewport name="main"></au-viewport><au-viewport name="side"></au-viewport>';
        const { router, history, host } = await start({ useHash, template, initial: '/home@main+about@side' });
        const destination = '/about@main+home@side';

        // URL resolution selects an address; it does not replace Aurelia's
        // persisted viewport grammar with a different recognition language.
        assert.strictEqual(router.createHref(destination), href(destination));
        await router.navigate(destination);
        assert.html.textContent(host, 'about||home||');
        assert.strictEqual(history.href, href(destination));

        const reloaded = await start({ useHash, template, initial: destination });
        assert.html.textContent(reloaded.host, 'about||home||');
        assert.strictEqual(reloaded.history.href, history.href);
      });
    });
  }

  it('keeps the hosting document and its query when changing a hash route', async function () {
    const { router, history, host } = await start({ useHash: true, preserveHashDocument: true, document: '/app/shell.html?tenant=workspace' });
    const expected = 'https://example.test/app/shell.html?tenant=workspace#/users/admins';

    assert.strictEqual(router.createHref('admins'), expected);
    await router.navigate('admins');
    assert.html.textContent(host, 'users/admins||');
    assert.strictEqual(history.href, expected);
  });

  it('resolves server-rendered links from the request route without exposing the deployment prefix as a route segment', async function () {
    const { router, host } = await start({ server: true });

    assert.html.textContent(host, 'users/members|page=1|');
    assert.strictEqual(router.createHref('admins'), '/app/users/admins');
    assert.strictEqual(router.createHref('../about'), '/app/about');
    await router.navigate('admins');
    assert.html.textContent(host, 'users/admins||');
  });
});
