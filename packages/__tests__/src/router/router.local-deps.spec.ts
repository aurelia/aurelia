import { IRouter, RouterConfiguration } from '@aurelia/router';
import { Aurelia, CustomElement, IPlatform } from '@aurelia/runtime-html';
import { MockBrowserHistoryLocation, TestContext, assert } from '@aurelia/testing';

describe('router/router.local-deps.spec.ts', function () {
  this.timeout(5000);

  async function $setup(dependencies: any[] = []) {
    const ctx = TestContext.create();

    const { container, platform } = ctx;

    const App = CustomElement.define({ name: 'app', template: '<au-viewport></au-viewport>', dependencies }, null);

    const host = ctx.doc.createElement('div');
    ctx.doc.body.appendChild(host as any);
    const component = new App();

    const au = ctx.wnd['au'] = new Aurelia(container)
      .register(RouterConfiguration)
      .app({ host: host, component: App });

    const router = container.get(IRouter);
    const mockBrowserHistoryLocation = new MockBrowserHistoryLocation();
    mockBrowserHistoryLocation.changeCallback = async (ev) => { router.viewer.handlePopStateEvent(ev); };
    router.viewer.history = mockBrowserHistoryLocation as any;
    router.viewer.location = mockBrowserHistoryLocation as any;

    await au.start();

    async function $teardown() {
      await au.stop(true);
      ctx.doc.body.removeChild(host);

      au.dispose();
    }

    return { ctx, container, platform, host, component, au, router, $teardown };
  }

  it('verify that the test isn\'t broken', async function () {
    const Local = CustomElement.define({ name: 'local', template: 'local' }, null);
    const Global = CustomElement.define({ name: 'global', template: 'global' }, null);
    const { platform, container, host, router, $teardown } = await $setup([Local]);

    container.register(Global);

    await $load('global', router, platform);

    assert.match(host.textContent, /.*global.*/, `host.textContent`);

    await $teardown();
  });

  it('navigates to locally registered dep', async function () {
    const Local = CustomElement.define({ name: 'local', template: 'local' }, null);
    const { platform, host, router, $teardown } = await $setup([Local]);

    await $load('local', router, platform);

    assert.match(host.textContent, /.*local.*/, `host.textContent`);

    await $teardown();
  });

  it('navigates to locally registered dep - nested', async function () {
    const Local2 = CustomElement.define({ name: 'local2', template: 'local2' }, class { });
    const Local1 = CustomElement.define({ name: 'local1', template: 'local1<au-viewport name="one"></au-viewport>', dependencies: [Local2] }, null);
    const { platform, host, router, $teardown } = await $setup([Local1]);

    await $load('local1/local2', router, platform);

    assert.match(host.textContent, /.*local1.*local2.*/, `host.textContent`);

    await $teardown();
  });

  it('navigates to locally registered dep - double nested - case #1', async function () {
    const Global3 = CustomElement.define({ name: 'global3', template: 'global3' }, null);
    const Local2 = CustomElement.define({ name: 'local2', template: 'local2<au-viewport name="two" used-by="global3"></au-viewport>' }, null);
    const Local1 = CustomElement.define({ name: 'local1', template: 'local1<au-viewport name="one" used-by="local2"></au-viewport>', dependencies: [Local2] }, null);
    const { platform, host, router, container, $teardown } = await $setup([Local1]);
    container.register(Global3);

    await $load('local1/local2/global3', router, platform);

    assert.match(host.textContent, /.*local1.*local2.*global3.*/, `host.textContent`);

    await $teardown();
  });

  it('navigates to locally registered dep - double nested - case #2', async function () {
    const Local3 = CustomElement.define({ name: 'local3', template: 'local3' }, null);
    const Global2 = CustomElement.define({ name: 'global2', template: 'global2<au-viewport name="two" used-by="local3"></au-viewport>', dependencies: [Local3] }, null);
    const Local1 = CustomElement.define({ name: 'local1', template: 'local1<au-viewport name="one" used-by="global2"></au-viewport>' }, null);
    const { platform, host, router, container, $teardown } = await $setup([Local1]);
    container.register(Global2);

    await $load('local1/global2/local3', router, platform);

    assert.match(host.textContent, /.*local1.*global2.*local3.*/, `host.textContent`);

    await $teardown();
  });

  it('navigates to locally registered dep - double nested - case #3', async function () {
    const Local3 = CustomElement.define({ name: 'local3', template: 'local3' }, null);
    const Local2 = CustomElement.define({ name: 'local2', template: 'local2<au-viewport name="two" used-by="local3"></au-viewport>', dependencies: [Local3] }, null);
    const Global1 = CustomElement.define({ name: 'global1', template: 'global1<au-viewport name="one" used-by="local2"></au-viewport>', dependencies: [Local2] }, null);
    const { platform, host, router, container, $teardown } = await $setup();
    container.register(Global1);

    await $load('global1/local2/local3', router, platform);

    assert.match(host.textContent, /.*global1.*local2.*local3.*/, `host.textContent`);

    await $teardown();
  });

  it('navigates to locally registered dep - double nested - case #4', async function () {
    const Local3 = CustomElement.define({ name: 'local3', template: 'local3' }, null);
    const Local2 = CustomElement.define({ name: 'local2', template: 'local2<au-viewport name="two" used-by="local3"></au-viewport>', dependencies: [Local3] }, null);
    const Local1 = CustomElement.define({ name: 'local1', template: 'local1<au-viewport name="one" used-by="local2"></au-viewport>', dependencies: [Local2] }, null);
    const { platform, host, router, $teardown } = await $setup([Local1]);

    await $load('local1/local2/local3', router, platform);

    assert.match(host.textContent, /.*local1.*local2.*local3.*/, `host.textContent`);

    await $teardown();
  });

  it('navigates to locally registered dep - conflicting scoped siblings - case #1', async function () {
    const Conflict1 = CustomElement.define({ name: 'conflict', template: 'conflict1' }, null);
    const Local1 = CustomElement.define({ name: 'local1', template: 'local1<au-viewport name="one"></au-viewport>', dependencies: [Conflict1] }, null);
    const Conflict2 = CustomElement.define({ name: 'conflict', template: 'conflict2' }, null);
    const Local2 = CustomElement.define({ name: 'local2', template: 'local2<au-viewport name="two"></au-viewport>', dependencies: [Conflict2] }, null);
    const { platform, host, router, $teardown } = await $setup([Local1, Local2]);

    await $load('local1@default/conflict@one', router, platform);

    assert.match(host.textContent, /.*local1.*conflict1.*/, `host.textContent`);

    await $load('local2@default/conflict@two', router, platform);

    assert.match(host.textContent, /.*local2.*conflict2.*/, `host.textContent`);

    await $teardown();
  });

  it('navigates to locally registered dep - conflicting scoped siblings - case #2', async function () {
    const Conflict1 = CustomElement.define({ name: 'conflict', template: 'conflict1' }, null);
    const Global1 = CustomElement.define({ name: 'global1', template: 'global1<au-viewport name="one"></au-viewport>', dependencies: [Conflict1] }, null);
    const Conflict2 = CustomElement.define({ name: 'conflict', template: 'conflict2' }, null);
    const Global2 = CustomElement.define({ name: 'global2', template: 'global2<au-viewport name="two"></au-viewport>', dependencies: [Conflict2] }, null);
    const { platform, host, router, container, $teardown } = await $setup();
    container.register(Global1, Global2);

    await $load('global1@default/conflict@one', router, platform);

    assert.match(host.textContent, /.*global1.*conflict1.*/, `host.textContent`);

    await $load('global2@default/conflict@two', router, platform);

    assert.match(host.textContent, /.*global2.*conflict2.*/, `host.textContent`);

    await $teardown();
  });

  it('navigates to locally registered dep - conflicting scoped siblings - case #3', async function () {
    const Conflict1 = CustomElement.define({ name: 'conflict', template: 'conflict1' }, null);
    const Local1 = CustomElement.define({ name: 'local1', template: 'local1<au-viewport name="one"></au-viewport>', dependencies: [Conflict1] }, null);
    const Conflict2 = CustomElement.define({ name: 'conflict', template: 'conflict2' }, null);
    const Global2 = CustomElement.define({ name: 'global2', template: 'global2<au-viewport name="two"></au-viewport>', dependencies: [Conflict2] }, null);
    const { platform, host, router, container, $teardown } = await $setup([Local1]);
    container.register(Global2);

    await $load('local1@default/conflict@one', router, platform);

    assert.match(host.textContent, /.*local1.*conflict1.*/, `host.textContent`);

    await $load('global2@default/conflict@two', router, platform);

    assert.match(host.textContent, /.*global2.*conflict2.*/, `host.textContent`);

    await $teardown();
  });

  describe('navigates to locally registered dep recursively', function () {
    interface RouteSpec {
      segments: string[];
      texts: string[];
    }
    const routeSpecs: RouteSpec[] = [
      {
        segments: ['global1', 'conflict'],
        texts: ['global1', 'conflict1']
      },
      {
        // note: custom elements always have themselves registered in their own $context, so should be able to navigate to self without registering anywhere
        segments: ['global1', 'conflict', 'conflict'],
        texts: ['global1', 'conflict1', 'conflict1']
      },
      {
        segments: ['local2', 'conflict'],
        texts: ['local2', 'conflict2']
      },
      {
        segments: ['local2', 'conflict', 'conflict'],
        texts: ['local2', 'conflict2', 'conflict2']
      },
      {
        segments: ['local2', 'global1', 'conflict'],
        texts: ['local2', 'global1', 'conflict1']
      },
      {
        segments: ['local2', 'global1', 'conflict', 'conflict'],
        texts: ['local2', 'global1', 'conflict1', 'conflict1']
      },
      {
        segments: ['local2', 'local2', 'conflict', 'conflict'],
        texts: ['local2', 'local2', 'conflict2', 'conflict2']
      },
      {
        segments: ['local2', 'conflict', 'global1', 'conflict'],
        texts: ['local2', 'conflict2', 'global1', 'conflict1']
      },
      {
        segments: ['local2', 'conflict', 'local2', 'conflict'],
        texts: ['local2', 'conflict2', 'local2', 'conflict2']
      }
    ];

    for (const routeSpec of routeSpecs) {
      const { segments, texts } = routeSpec;
      const path = segments.join('/');
      const expectedText = new RegExp(`.*${texts.join('.*')}.*`);

      it(`path: ${path}, expectedText: ${expectedText}`, async function () {
        const Conflict1 = CustomElement.define({ name: 'conflict', template: 'conflict1<au-viewport></au-viewport>' }, null);
        const Global1 = CustomElement.define({ name: 'global1', template: 'global1<au-viewport name="one"></au-viewport>', dependencies: [Conflict1] }, null);
        const Conflict2 = CustomElement.define({ name: 'conflict', template: 'conflict2<au-viewport></au-viewport>' }, null);
        const Local2 = CustomElement.define({ name: 'local2', template: 'local2<au-viewport name="two"></au-viewport>', dependencies: [Conflict2] }, null);
        const { platform, host, router, container, $teardown } = await $setup([Local2]);
        container.register(Global1);

        await $load(path, router, platform);

        assert.match(host.textContent, expectedText, `host.textContent`);

        await $teardown();
      });
    }
  });
});

const $load = async (path: string, router: IRouter, platform: IPlatform) => {
  await router.load(path);
  platform.domWriteQueue.flush();
};
