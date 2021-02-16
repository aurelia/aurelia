import { IRouter, Nav, RouterConfiguration, RoutingInstruction } from '@aurelia/router';
import { CustomElement, Aurelia } from '@aurelia/runtime-html';
import { assert, MockBrowserHistoryLocation, TestContext } from '@aurelia/testing';

describe('Nav', function () {
  async function createFixture(component) {
    const ctx = TestContext.create();
    const container = ctx.container;

    const App = CustomElement.define({ name: 'app', template: `<template><au-viewport name="app" used-by="${component}" default="${component}"></au-viewport></template>` });
    const Foo = CustomElement.define({ name: 'foo', template: '<template>Nav: foo <au-nav name="main-nav"></au-nav></template>' }, class {
      public static inject = [IRouter];
      public constructor(private readonly r: IRouter) { }
      public load() { Nav.setNav(this.r, 'main-nav', [{ title: 'Bar', route: 'bar' }]); }
    });
    const Bar = CustomElement.define({ name: 'bar', template: '<template>Nav: bar <au-nav name="main-nav"></au-nav><au-viewport name="main-viewport" default="baz"></au-viewport></template>' }, class {
      public static inject = [IRouter];
      public constructor(private readonly r: IRouter) { }
      public load() { Nav.setNav(this.r, 'main-nav', [{ title: 'Baz', route: 'baz' }]); }
    });
    const Baz = CustomElement.define({ name: 'baz', template: '<template>Baz</template>' }, class { });
    const Qux = CustomElement.define({ name: 'qux', template: '<template>Nav: qux <au-nav name="main-nav"></au-nav><au-viewport name="main-viewport" default="baz"></au-viewport></template>' }, class {
      public static inject = [IRouter];
      public constructor(private readonly r: IRouter) { }
      public load() {
        Nav.addNav(this.r, 'main-nav', [{ title: 'Baz', route: Baz, children: [{ title: 'Bar', route: ['bar', Baz] }] }, { title: 'Foo', route: { component: Foo, viewport: 'main-viewport' } }]);
      }
    });

    const host = ctx.doc.createElement('div');
    ctx.doc.body.appendChild(host);

    const au = ctx.wnd['au'] = new Aurelia(container)
      .register(RouterConfiguration)
      .app({ host: host, component: App });

    const router = container.get(IRouter);
    const mockBrowserHistoryLocation = new MockBrowserHistoryLocation();
    mockBrowserHistoryLocation.changeCallback = router.viewer.handlePopstate;
    router.viewer.history = mockBrowserHistoryLocation as any;
    router.viewer.location = mockBrowserHistoryLocation as any;

    container.register(Foo, Bar, Baz, Qux);

    await au.start();

    async function tearDown() {
      await au.stop(true);
      ctx.doc.body.removeChild(host);

      au.dispose();
    }

    const platform = ctx.platform;

    return { au, container, host, router, ctx, tearDown, platform };
  }

  it('generates nav with a link', async function () {
    this.timeout(5000);
    const { host, router, tearDown, platform } = await createFixture('foo');

    await platform.domWriteQueue.yield();

    assert.includes(host.innerHTML, 'foo', `host.innerHTML`);
    assert.includes(host.innerHTML, 'Bar', `host.innerHTML`);
    assert.includes(host.innerHTML, 'href="bar"', `host.innerHTML`);
    assert.notIncludes(host.innerHTML, 'nav-active', `host.innerHTML`);
    await tearDown();
  });

  it('generates nav with an active link', async function () {
    this.timeout(5000);
    const { host, router, tearDown, platform } = await createFixture('bar');
    router.activeComponents = [RoutingInstruction.create('baz', 'main-viewport') as RoutingInstruction];

    await platform.domWriteQueue.yield();

    assert.includes(host.innerHTML, 'href="baz"', `host.innerHTML`);
    // assert.includes(host.innerHTML, 'nav-active', `host.innerHTML`); // TODO: fix this
    await tearDown();
  });

  it('generates nav with child links', async function () {
    this.timeout(5000);
    const { host, router, tearDown, platform } = await createFixture('qux');
    router.activeComponents =[RoutingInstruction.create('baz', 'main-viewport') as RoutingInstruction];

    await platform.domWriteQueue.yield();

    assert.includes(host.innerHTML, 'href="baz"', `host.innerHTML`);
    assert.includes(host.innerHTML, 'nav-has-children', `host.innerHTML`);
    assert.includes(host.innerHTML, 'nav-level-1', `host.innerHTML`);
    await tearDown();
  });
});
