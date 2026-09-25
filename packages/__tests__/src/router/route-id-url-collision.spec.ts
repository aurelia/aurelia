import { DefaultLogEvent, ISink, LogLevel } from '@aurelia/kernel';
import { IRouter, Routeable, RouterConfiguration, route } from '@aurelia/router';
import { Aurelia, IHistory, customElement } from '@aurelia/runtime-html';
import { MockBrowserHistoryLocation, TestContext, assert } from '@aurelia/testing';
import { TestRouterConfiguration } from './_shared/configuration.js';

class CollisionLog implements ISink {
  public readonly warnings: string[] = [];

  public handleEvent(event: DefaultLogEvent): void {
    const [message] = event.getFormattedLogInfo();
    if (/AUR3179|AUR3180/.test(message)) this.warnings.push(message);
  }
}

describe('router/route-id-url-collision.spec.ts', function () {
  const applications: Aurelia[] = [];

  afterEach(async function () {
    for (const au of applications.splice(0)) await au.stop(true);
  });

  @customElement({ name: 'home-page', template: 'Home' })
  class Home { }

  @customElement({ name: 'archive-page', template: 'Archive' })
  class Archive { }

  @customElement({ name: 'reports-page', template: 'Reports' })
  class Reports { }

  async function start(routes: Routeable[], initial = '', useEagerLoading = false) {
    const ctx = TestContext.create();
    const { container } = ctx;
    container.register(
      TestRouterConfiguration.for(LogLevel.warn, [CollisionLog]),
      RouterConfiguration.customize({ basePath: '/', useEagerLoading }),
    );
    container.get<MockBrowserHistoryLocation>(IHistory).replaceState({}, '', initial);

    @route({ routes: [{ path: '', component: Home }, ...routes] })
    @customElement({ name: 'collision-app', template: '<au-viewport></au-viewport>' })
    class App { }

    const host = ctx.createElement('div');
    const au = new Aurelia(container);
    applications.push(au);
    await au.app({ host, component: App }).start();

    const log = container.getAll(ISink).find(sink => sink instanceof CollisionLog) as CollisionLog;
    return { host, router: container.get(IRouter), warnings: log.warnings };
  }

  for (const useEagerLoading of [false, true]) {
    for (const reverse of [false, true]) {
      for (const loading of ['synchronous', 'lazy component', 'lazy module']) {
        it(`warns once for a shadowed path (${loading}, reverse=${reverse}, eager=${useEagerLoading})`, async function () {
          @route({ id: 'reports', path: 'archive' })
          @customElement({ name: 'lazy-archive', template: 'Archive' })
          class LazyArchive { }

          const routes: Routeable[] = [
            loading === 'lazy module'
              ? Promise.resolve({ default: LazyArchive })
              : {
                id: 'reports',
                path: 'archive',
                component: loading === 'lazy component' ? Promise.resolve({ default: Archive }) : Archive,
              },
            { id: 'reports-page', path: 'reports', component: Reports },
          ];
          if (reverse) routes.reverse();

          // The standard runners use the development distribution. Assert an
          // actual captured warning so disabled logging cannot make this pass.
          const { host, router, warnings } = await start(routes, '/reports', useEagerLoading);
          assert.strictEqual(warnings.length, 1);
          assert.match(warnings[0], /reports/);
          assert.match(warnings[0], /archive/);
          assert.match(warnings[0], /reports-page/);

          // A warning must preserve old bookmarks and ID-based navigation.
          assert.html.textContent(host, 'Archive');
          await router.load({ component: 'reports-page' });
          assert.html.textContent(host, 'Reports');
          await router.load('reports');
          assert.html.textContent(host, 'Archive');
          assert.strictEqual(warnings.length, 1, 'navigation does not repeat configuration warnings');
        });
      }
    }
  }

  it('does not warn for an ID naming one of its own path aliases', async function () {
    const { host, warnings } = await start([
      { id: 'reports', path: ['reports', 'reports-summary'], component: Reports },
    ], '/reports');
    assert.deepStrictEqual(warnings, []);
    assert.html.textContent(host, 'Reports');
  });

  it('does not warn when the ID needs a parameter and the literal path remains reachable', async function () {
    const { host, warnings } = await start([
      { id: 'reports', path: 'archive/:period', component: Archive },
      { id: 'reports-page', path: 'reports', component: Reports },
    ], '/reports');
    assert.deepStrictEqual(warnings, []);
    assert.html.textContent(host, 'Reports');
  });

  it('warns when optional parameters still allow the ID to shadow the literal path', async function () {
    const { host, warnings } = await start([
      { id: 'reports', path: 'archive/:period?', component: Archive },
      { id: 'reports-page', path: 'reports', component: Reports },
    ], '/reports');
    assert.strictEqual(warnings.length, 1);
    assert.html.textContent(host, 'Archive');
  });

  it('does not infer a collision from a parameterized path or unrelated ID', async function () {
    const { host, warnings } = await start([
      { id: 'reports', path: 'archive', component: Archive },
      { id: 'reports-page', path: 'reports/:period', component: Reports },
    ], '/reports/current');
    assert.deepStrictEqual(warnings, []);
    assert.html.textContent(host, 'Reports');
  });

  it('keeps IDs in other route contexts independent', async function () {
    @route({ routes: [{ id: 'reports-page', path: 'reports', component: Reports }] })
    @customElement({ name: 'report-layout', template: '<au-viewport></au-viewport>' })
    class Layout { }

    const { host, warnings } = await start([
      { id: 'reports', path: 'archive', component: Archive },
      { path: 'workspace', component: Layout },
    ], '/workspace/reports');
    assert.deepStrictEqual(warnings, []);
    assert.html.textContent(host, 'Reports');
  });

  for (const lazy of [false, true]) {
    it(`warns for raw static routing syntax without changing route ownership (lazy=${lazy})`, async function () {
      const { host, router, warnings } = await start([
        { id: 'raw', path: 'a+b', component: lazy ? Promise.resolve({ default: Archive }) : Archive },
        { id: 'encoded', path: 'a%2Bb', component: Reports },
      ], '/a%2Bb');
      assert.html.textContent(host, 'Reports', 'the existing encoded bookmark retains its route');
      assert.strictEqual(warnings.length, 1);
      assert.match(warnings[0], /AUR3180/);
      assert.match(warnings[0], /a\+b/);
      assert.match(warnings[0], /encoded/);

      await router.load({ component: 'raw' });
      assert.html.textContent(host, 'Archive', 'existing structured selection remains available');
      await router.load('a%2Bb');
      assert.html.textContent(host, 'Reports');
      assert.strictEqual(warnings.length, 1, 'configuration guidance is not repeated per navigation');
    });
  }

  it('warns for static segments inside compound paths, including aliases', async function () {
    const { warnings } = await start([
      { id: 'report', path: ['safe', 'docs/team@work', 'docs/report(draft)'], component: Reports },
    ]);
    assert.strictEqual(warnings.length, 2);
    assert.match(warnings[0], /team@work/);
    assert.match(warnings[1], /report\(draft\)/);
  });

  it('accepts encoded static paths and keeps route parameter syntax out of static diagnostics', async function () {
    const { warnings } = await start([
      { id: 'encoded', path: 'docs/a%2Bb', component: Reports },
      { id: 'optional', path: 'items/:id?', component: Reports },
      { id: 'constrained', path: 'codes/:id{{(a|b)+}}', component: Reports },
      { id: 'catchall', path: 'files/*path', component: Reports },
    ]);
    assert.deepStrictEqual(warnings, []);
  });
});
