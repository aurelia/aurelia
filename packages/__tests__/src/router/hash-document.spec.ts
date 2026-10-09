import { LogLevel, LoggerConfiguration, Registration } from '@aurelia/kernel';
import { ICurrentRoute, IRouter, IRouterEvents, Params, RouteNode, RouterConfiguration, RouterOptions, UrlCustomAttribute, route } from '@aurelia/router';
import { tasksSettled } from '@aurelia/runtime';
import { Aurelia, IHistory, ILocation, IWindow, customElement } from '@aurelia/runtime-html';
import { assert, TestContext } from '@aurelia/testing';

// URL owns the document/query/hash boundaries, just as it does in a browser.
// Splitting history strings at every '?' would hide the regression under test.
class DocumentHistory {
  private readonly entries: { url: URL; state: {} | null }[];
  private index = 0;
  public readonly listeners = new Set<EventListenerObject>();

  public constructor(url: URL) { this.entries = [{ url, state: null }]; }
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
  }

  public replaceState(state: {} | null, _title: string, path: string): void {
    this.entries[this.index] = { state, url: new URL(path, this.url) };
  }

  public go(delta: number): void {
    this.index += delta;
    const event = new Event('hashchange');
    for (const listener of this.listeners) listener.handleEvent(event);
  }
}

describe('router/hash-document.spec.ts', function () {
  it('keeps subclasses using the previous RouterOptions constructor compatible', function () {
    class ApplicationOptions extends RouterOptions {
      public constructor() {
        // Existing subclasses do not supply the newly added final argument.
        super(true, true, 'push', null, true, null, true, false, false);
      }
    }
    assert.strictEqual(new ApplicationOptions().preserveHashDocument, false);
  });

  const applications: Aurelia[] = [];

  afterEach(async function () {
    for (const au of applications.splice(0)) await au.stop(true);
  });

  async function start({
    document = 'https://example.test/app/shell.html?tenant=workspace',
    initial = '/items/a?page=1#details' as string | null,
    preserve = true as boolean | null,
    useHash = true,
    base = 'https://example.test/app/' as string | null,
    basePath = undefined as string | undefined,
  } = {}) {
    @customElement({ name: 'document-page', template: '${id}|${query}|${fragment}' })
    class Page {
      public id = '';
      public query = '';
      public fragment = '';
      public loading(params: Params, next: RouteNode): void {
        this.id = params.id ?? '';
        this.query = next.queryParams.toString();
        this.fragment = next.fragment ?? '';
      }
    }

    @customElement({ name: 'restricted-page', template: 'restricted' })
    class Restricted {
      public canLoad(): boolean { return false; }
    }

    @route({ routes: [
      { path: ['', 'home'], component: Page },
      { path: 'items/:id', component: Page },
      { path: 'restricted', component: Restricted },
      { path: 'shortcut', redirectTo: 'items/b' },
    ] })
    @customElement({
      name: 'document-app',
      template: '<a id="load" load="items/b">Load</a>'
        + '<a id="href" href="items/b">Href</a>'
        + '<a id="url" url="/items/b">Url</a>'
        + '<a id="native" href="https://example.test/help.html">Help</a>'
        + '<au-viewport></au-viewport>',
    })
    class App { }

    const ctx = TestContext.create();
    const { container } = ctx;
    const initialUrl = new URL(document);
    if (initial !== null) {
      if (useHash) initialUrl.hash = initial;
      else initialUrl.pathname = `/app${initial}`;
    }
    const history = new DocumentHistory(initialUrl);
    container.register(
      LoggerConfiguration.create({ level: LogLevel.fatal }),
      RouterConfiguration.customize({
        useUrlFragmentHash: useHash,
        useNavigationModel: false,
        basePath,
        preserveHashDocument: preserve ?? undefined,
      }),
      UrlCustomAttribute,
      Registration.instance(ILocation, history),
      Registration.instance(IHistory, history),
      Registration.instance(IWindow, {
        name: '',
        document: { baseURI: base ?? initialUrl.href },
        addEventListener(_type: string, listener: EventListenerObject) { history.listeners.add(listener); },
        removeEventListener(_type: string, listener: EventListenerObject) { history.listeners.delete(listener); },
      }),
    );
    const router = container.get(IRouter);
    const current = container.get(ICurrentRoute);
    const events = container.get(IRouterEvents);
    const host = ctx.createElement('div');
    const au = new Aurelia(container);
    applications.push(au);
    await au.app({ host, component: App }).start();
    return { ctx, router, current, events, history, host };
  }

  const document = 'https://example.test/app/shell.html?tenant=workspace';

  it('preserves the physical document during startup and publishes the same destination for every link resource', async function () {
    const { router, history, host } = await start();

    assert.strictEqual(history.href, `${document}#/items/a?page=1#details`);
    assert.html.textContent(host.querySelector('document-page'), 'a|page=1|details');
    for (const id of ['load', 'href', 'url']) {
      assert.strictEqual(host.querySelector(`#${id}`)!.getAttribute('href'), `${document}#/items/b`);
    }
    assert.strictEqual(router.createHref('/items/b'), `${document}#/items/b`);
    assert.strictEqual(host.querySelector('#native')!.getAttribute('href'), 'https://example.test/help.html');
  });

  for (const id of ['load', 'href', 'url']) {
    it(`keeps document ownership when following a ${id} link and reopening its destination`, async function () {
      const { router, history, host } = await start();
      const anchor = host.querySelector<HTMLAnchorElement>(`#${id}`)!;
      const destination = anchor.getAttribute('href');
      anchor.click();
      await tasksSettled();

      assert.strictEqual(history.href, destination);
      assert.strictEqual(router.createHref(''), `${document}#/items/b`);
      assert.html.textContent(host.querySelector('document-page'), 'b||');

      const reopened = await start({ document: history.href, initial: null });
      assert.strictEqual(reopened.history.href, history.href);
      assert.html.textContent(reopened.host.querySelector('document-page'), 'b||');
    });
  }

  it('starts the default route when the document has no route hash', async function () {
    const { history, current, host } = await start({ initial: null });

    assert.strictEqual(history.href, `${document}#/`);
    assert.strictEqual(current.query.toString(), '', 'the document query is not a route query');
    assert.html.textContent(host.querySelector('document-page'), '||');
  });

  it('works without a base element and does not accumulate earlier hashes', async function () {
    const { router, history } = await start({ base: null });

    assert.strictEqual(history.href, `${document}#/items/a?page=1#details`);
    await router.load('items/b');
    assert.strictEqual(history.href, `${document}#/items/b`);
    await router.navigate('/items/c');
    assert.strictEqual(history.href, `${document}#/items/c`);
    assert.strictEqual(router.createHref('/items/a'), `${document}#/items/a`);
  });

  it('keeps escaped document fields independent from route fields', async function () {
    const document = 'https://example.test/app/shell%20one.html?return=%2Fapp%3Ftenant%3Da%26mode%3Db&literal=%2525';
    const { router, history, current, host } = await start({ document });
    await router.navigate('/items/section%23one?value=%2525#part%2523');

    assert.strictEqual(history.href, `${document}#/items/section%23one?value=%2525#part%2523`);
    assert.strictEqual(current.parameterInformation[0].params.id, 'section#one');
    assert.strictEqual(current.query.get('value'), '%25');
    assert.html.textContent(host.querySelector('document-page'), 'section#one|value=%2525|part%23');
  });

  it('uses the configured document policy after guard cancellation and redirect', async function () {
    const { router, history, host } = await start();
    const before = history.href;
    assert.strictEqual(await router.navigate('/restricted'), false);
    assert.strictEqual(history.href, before);
    assert.strictEqual(router.createHref('/items/b'), `${document}#/items/b`);

    assert.strictEqual(await router.navigate('/shortcut'), true);
    assert.strictEqual(history.href, `${document}#/items/b`);
    assert.html.textContent(host.querySelector('document-page'), 'b||');
  });

  it('restores route query and caller state through Back and Forward without consuming the document query', async function () {
    const { router, history, current } = await start();
    await router.navigate('?page=2', { state: { source: 'pager' } });
    const later = history.href;

    history.go(-1);
    await tasksSettled();
    assert.strictEqual(history.href, `${document}#/items/a?page=1#details`);
    assert.strictEqual(current.query.get('page'), '1');
    assert.strictEqual(current.query.has('tenant'), false);

    history.go(1);
    await tasksSettled();
    assert.strictEqual(history.href, later);
    assert.strictEqual(current.query.get('page'), '2');
    assert.strictEqual((history.state as { source: string }).source, 'pager');
  });

  it('captures the visited hash entry state before processing navigation', async function () {
    const { router, history, events } = await start({ preserve: false });
    await router.navigate('/items/b', { state: { source: 'first' } });
    const previousState = history.state;
    await router.navigate('/items/c', { state: { source: 'second' } });
    let eventState: unknown;
    const subscription = events.subscribe('au:router:location-change', event => { eventState = event.state; });

    history.go(-1);
    await tasksSettled();
    subscription.dispose();
    assert.deepStrictEqual(eventState, previousState);
    assert.strictEqual((history.state as { source: string }).source, 'first');
  });

  for (const preserve of [null, false, true]) {
    it(`retains the legacy basePath relocation unless preservation is enabled (${preserve ?? 'default'})`, async function () {
      const { router, history } = await start({ preserve, basePath: '/published/' });
      const targetDocument = preserve ? document : 'https://example.test/published/';

      assert.strictEqual(history.href, `${targetDocument}#/items/a?page=1#details`);
      await router.load('items/b');
      assert.strictEqual(history.href, `${targetDocument}#/items/b`);
    });
  }

  it('does not change history-mode publication when preservation is enabled', async function () {
    const { router, history } = await start({ useHash: false, initial: '/items/a', document: 'https://example.test/app/' });

    assert.strictEqual(history.href, 'https://example.test/app/items/a');
    await router.navigate('/items/b');
    assert.strictEqual(history.href, 'https://example.test/app/items/b');
  });
});
