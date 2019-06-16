import { DebugConfiguration } from '@aurelia/debug';
import { Aurelia, CustomElementResource } from '@aurelia/runtime';
import { Router, ViewportCustomElement } from '@aurelia/router';
import { MockBrowserHistoryLocation, TestContext, assert } from '@aurelia/testing';

describe('Router', function () {
  async function setup() {
    const ctx = TestContext.createHTMLTestContext();
    const container = ctx.container

    const App = CustomElementResource.define({ name: 'app', template: '<template><au-viewport name="left"></au-viewport><au-viewport name="right"></au-viewport></template>' });
    const Foo = CustomElementResource.define({ name: 'foo', template: '<template>Viewport: foo <a href="#/baz@foo"><span>baz</span></a><au-viewport name="foo"></au-viewport></template>' });
    const Bar = CustomElementResource.define({ name: 'bar', template: '<template>Viewport: bar Parameter id: [${id}] Parameter name: [${name}] <au-viewport name="bar"></au-viewport></template>' }, class {
      public static parameters = ['id', 'name'];
      public id = 'no id';
      public name = 'no name';
      public enter(params) {
        if (params.id) { this.id = params.id; }
        if (params.name) { this.name = params.name; }
      }
    });
    const Baz = CustomElementResource.define({ name: 'baz', template: '<template>Viewport: baz Parameter id: [${id}] <au-viewport name="baz"></au-viewport></template>' }, class {
      public static parameters = ['id'];
      public id = 'no id';
      public enter(params) { if (params.id) { this.id = params.id; } }
    });
    const Qux = CustomElementResource.define({ name: 'qux', template: '<template>Viewport: qux<au-viewport name="qux"></au-viewport></template>' }, class {
      public canEnter() { return true; }
      public canLeave() {
        if (quxCantLeave > 0) {
          quxCantLeave--;
          return false;
        } else {
          return true;
        }
      }
      public enter() { return true; }
      public leave() { return true; }
    });
    const Quux = CustomElementResource.define({ name: 'quux', template: '<template>Viewport: quux<au-viewport name="quux" scope></au-viewport></template>' });
    const Corge = CustomElementResource.define({ name: 'corge', template: '<template>Viewport: corge<au-viewport name="corge" used-by="baz"></au-viewport></template>' });

    const Uier = CustomElementResource.define({ name: 'uier', template: '<template>Viewport: uier</template>' }, class {
      public async canEnter() {
        await wait(500);
        return true;
      }
    });

    const Grault = CustomElementResource.define(
      {
        name: 'grault', template: '<template><input type="checkbox" checked.two-way="toggle">toggle<div if.bind="toggle">Viewport: grault<au-viewport name="grault" stateful used-by="garply,corge" default="garply"></au-viewport></div></template>'
      },
      class {
        public toggle = false;
      });
    const Garply = CustomElementResource.define(
      {
        name: 'garply', template: '<template>garply<input checked.two-way="text">text</template>'
      },
      class {
        public text;
      });
    const Waldo = CustomElementResource.define(
      {
        name: 'waldo', template: '<template>Viewport: waldo<au-viewport name="waldo" stateful used-by="grault,foo" default="grault"></au-viewport></div></template>'
      },
      class { });

    container.register(Router as any);
    container.register(ViewportCustomElement as any);
    container.register(Foo, Bar, Baz, Qux, Quux, Corge, Uier, Grault, Garply, Waldo);

    const router = container.get(Router);
    const mockBrowserHistoryLocation = new MockBrowserHistoryLocation();
    mockBrowserHistoryLocation.changeCallback = router.historyBrowser.pathChanged;
    router.historyBrowser.history = mockBrowserHistoryLocation as any;
    router.historyBrowser.location = mockBrowserHistoryLocation as any;

    const host = ctx.doc.createElement('div');
    ctx.doc.body.appendChild(host as any);

    const au = ctx.wnd['au'] = new Aurelia(container)
      .register(DebugConfiguration)
      .app({ host: host, component: App });

    await au.start().wait();

    await router.activate();

    async function tearDown() {
      await au.stop().wait();
      ctx.doc.body.removeChild(host);
      router.deactivate();
    };

    return { au, container, host, router, ctx, tearDown };
  };

  it('can be created', async function () {
    this.timeout(5000);

    const { router, tearDown } = await setup();

    await waitForNavigation(router);

    await tearDown();
  });

  it('loads viewports left and right', async function () {
    this.timeout(5000);

    const { host, router, tearDown } = await setup();
    await waitForNavigation(router);
    assert.includes(host.textContent, 'left', `host.textContent`);
    assert.includes(host.textContent, 'right', `host.textContent`);
    await tearDown();
  });

  it('navigates to foo in left', async function () {
    this.timeout(5000);

    const { host, router, tearDown } = await setup();

    await $goto('foo@left', router);
    assert.includes(host.textContent, 'foo', `host.textContent`);

    await tearDown();
  });

  it('clears viewport', async function () {
    this.timeout(5000);

    const { host, router, tearDown } = await setup();

    await $goto('foo@left', router);
    assert.includes(host.textContent, 'foo', `host.textContent`);
    await $goto('-@left', router);
    assert.notIncludes(host.textContent, 'foo', `host.textContent`);

    await tearDown();
  });

  it('clears all viewports', async function () {
    this.timeout(5000);

    const { host, router, tearDown } = await setup();

    await $goto('foo@left', router);
    assert.includes(host.textContent, 'Viewport: foo', `host.textContent`);
    await $goto('bar@right', router);
    assert.includes(host.textContent, 'Viewport: bar', `host.textContent`);
    await $goto('-', router);
    assert.notIncludes(host.textContent, 'Viewport foo', `host.textContent`);
    assert.notIncludes(host.textContent, 'Viewport bar', `host.textContent`);

    await tearDown();
  });

  it('queues navigations', async function () {
    this.timeout(40000);

    const { host, router, tearDown } = await setup();

    await router.goto('/uier@left');
    await wait(100);
    await router.goto('/bar@left');
    assert.strictEqual(router['pendingNavigations'].length, 1, `router.pendingNavigations.length`);
    await waitForNavigation(router);
    assert.includes(host.textContent, 'Viewport: bar', `host.textContent`);

    await tearDown();
  });

  it('replaces foo in left', async function () {
    this.timeout(5000);

    const { host, router, tearDown } = await setup();

    const historyLength = router.historyBrowser.history.length;
    await $goto('foo@left', router);
    assert.includes(host.textContent, 'foo', `host.textContent`);
    assert.strictEqual(router.historyBrowser.history.length, historyLength + 1, `router.historyBrowser.history.length`);

    await router.replace('bar@left');
    await waitForNavigation(router);
    assert.includes(host.textContent, 'bar', `host.textContent`);
    assert.strictEqual(router.historyBrowser.history.length, historyLength + 1, `router.historyBrowser.history.length`);

    await tearDown();
  });

  it('navigates to bar in right', async function () {
    this.timeout(5000);

    const { host, router, tearDown } = await setup();

    await $goto('/bar@right', router);
    assert.includes(host.textContent, 'bar', `host.textContent`);

    await tearDown();
  });

  it('navigates to foo in left then bar in right', async function () {
    this.timeout(5000);

    const { host, router, tearDown } = await setup();

    await $goto('/foo@left', router);
    assert.includes(host.textContent, 'Viewport: foo', `host.textContent`);
    assert.notIncludes(host.textContent, 'Viewport: bar', `host.textContent`);

    await $goto('/bar@right', router);
    assert.includes(host.textContent, 'Viewport: foo', `host.textContent`);
    assert.includes(host.textContent, 'Viewport: bar', `host.textContent`);

    await tearDown();
  });

  it('navigates back and forward with one viewport', async function () {
    this.timeout(40000);

    const { host, router, tearDown } = await setup();

    await $goto('/foo@left', router);
    assert.includes(host.textContent, 'Viewport: foo', `host.textContent`);
    assert.notIncludes(host.textContent, 'Viewport: bar', `host.textContent`);

    await $goto('/bar@left', router);
    assert.notIncludes(host.textContent, 'Viewport: foo', `host.textContent`);
    assert.includes(host.textContent, 'Viewport: bar', `host.textContent`);

    await router.back();
    await waitForNavigation(router);
    assert.includes(host.textContent, 'Viewport: foo', `host.textContent`);
    assert.notIncludes(host.textContent, 'Viewport: bar', `host.textContent`);

    await router.forward();
    await waitForNavigation(router);
    assert.notIncludes(host.textContent, 'Viewport: foo', `host.textContent`);
    assert.includes(host.textContent, 'Viewport: bar', `host.textContent`);

    await tearDown();
  });

  it('navigates back and forward with two viewports', async function () {
    this.timeout(5000);

    const { host, router, tearDown } = await setup();

    await $goto('/foo@left', router);
    assert.includes(host.textContent, 'Viewport: foo', `host.textContent`);
    assert.notIncludes(host.textContent, 'Viewport: bar', `host.textContent`);

    await $goto('/bar@right', router);
    assert.includes(host.textContent, 'Viewport: foo', `host.textContent`);
    assert.includes(host.textContent, 'Viewport: bar', `host.textContent`);

    await router.back();
    await waitForNavigation(router);
    assert.includes(host.textContent, 'Viewport: foo', `host.textContent`);
    assert.notIncludes(host.textContent, 'Viewport: bar', `host.textContent`);

    await router.forward();
    await waitForNavigation(router);
    assert.includes(host.textContent, 'Viewport: foo', `host.textContent`);
    assert.includes(host.textContent, 'Viewport: bar', `host.textContent`);

    await tearDown();
  });

  it('navigates to foo/bar in left/right', async function () {
    this.timeout(5000);

    const { host, router, tearDown } = await setup();

    await $goto('/foo@left+bar@right', router);
    assert.includes(host.textContent, 'foo', `host.textContent`);
    assert.includes(host.textContent, 'bar', `host.textContent`);

    await tearDown();
  });

  it('cancels if not canLeave', async function () {
    this.timeout(5000);

    const { host, router, tearDown } = await setup();

    await $goto('/baz@left+qux@right', router);
    assert.includes(host.textContent, 'Viewport: baz', `host.textContent`);
    assert.includes(host.textContent, 'Viewport: qux', `host.textContent`);

    await $goto('/foo@left+bar@right', router);
    assert.includes(host.textContent, 'Viewport: baz', `host.textContent`);
    assert.includes(host.textContent, 'Viewport: qux', `host.textContent`);
    assert.notIncludes(host.textContent, 'Viewport: foo', `host.textContent`);
    assert.notIncludes(host.textContent, 'Viewport: bar', `host.textContent`);

    await tearDown();
  });

  it('navigates to foo/bar in left/right containing baz/qux respectively', async function () {
    this.timeout(5000);

    const { host, router, tearDown } = await setup();

    await $goto('/foo@left+bar@right+baz@foo+qux@bar', router);
    assert.includes(host.textContent, 'Viewport: foo', `host.textContent`);
    assert.includes(host.textContent, 'Viewport: bar', `host.textContent`);
    assert.includes(host.textContent, 'Viewport: baz', `host.textContent`);
    assert.includes(host.textContent, 'Viewport: qux', `host.textContent`);

    await tearDown();
  });

  it('handles anchor click', async function () {
    this.timeout(5000);

    const { host, router, tearDown } = await setup();

    await $goto('/foo@left', router);
    assert.includes(host.textContent, 'foo', `host.textContent`);

    (host.getElementsByTagName('SPAN')[0] as HTMLElement).parentElement.click();
    await wait(100);
    await waitForNavigation(router);
    assert.includes(host.textContent, 'Viewport: baz', `host.textContent`);

    await tearDown();
  });

  it('understands used-by', async function () {
    this.timeout(5000);

    const { host, router, tearDown } = await setup();

    await $goto('/corge@left', router);
    assert.includes(host.textContent, 'Viewport: corge', `host.textContent`);

    await $goto('/baz', router);
    assert.includes(host.textContent, 'Viewport: baz', `host.textContent`);

    await tearDown();
  });

  it('does not update fullStatePath on wrong history entry', async function () {
    this.timeout(40000);

    const { host, router, tearDown } = await setup();

    await $goto('/foo@left', router);
    await $goto('/bar@left', router);
    await $goto('/baz@left', router);

    await tearDown();
  });

  it('parses parameters after viewport', async function () {
    this.timeout(5000);

    const { host, router, tearDown } = await setup();

    await $goto('/bar@left(123)', router);
    assert.includes(host.textContent, 'Viewport: bar', `host.textContent`);
    assert.includes(host.textContent, 'Parameter id: [123]', `host.textContent`);

    await $goto('/bar@left(456)', router);
    assert.includes(host.textContent, 'Viewport: bar', `host.textContent`);
    assert.includes(host.textContent, 'Parameter id: [456]', `host.textContent`);

    await tearDown();
  });

  it('parses named parameters after viewport', async function () {
    this.timeout(5000);

    const { host, router, tearDown } = await setup();

    await $goto('/bar@left(id=123)', router);
    assert.includes(host.textContent, 'Viewport: bar', `host.textContent`);
    assert.includes(host.textContent, 'Parameter id: [123]', `host.textContent`);

    await $goto('/bar@left(id=456)', router);
    assert.includes(host.textContent, 'Viewport: bar', `host.textContent`);
    assert.includes(host.textContent, 'Parameter id: [456]', `host.textContent`);

    await tearDown();
  });

  it('parses parameters after viewport individually', async function () {
    this.timeout(5000);

    const { host, router, tearDown } = await setup();

    await $goto('/bar@left(123)', router);
    assert.includes(host.textContent, 'Viewport: bar', `host.textContent`);
    assert.includes(host.textContent, 'Parameter id: [123]', `host.textContent`);

    await $goto('/bar@right(456)', router);
    assert.includes(host.textContent, 'Viewport: bar', `host.textContent`);
    assert.includes(host.textContent, 'Parameter id: [123]', `host.textContent`);
    assert.includes(host.textContent, 'Parameter id: [456]', `host.textContent`);

    await tearDown();
  });

  it('parses parameters without viewport', async function () {
    this.timeout(5000);

    const { host, router, tearDown } = await setup();

    await $goto('/corge@left', router);
    assert.includes(host.textContent, 'Viewport: corge', `host.textContent`);

    await $goto('/baz(123)', router);
    assert.includes(host.textContent, 'Viewport: baz', `host.textContent`);
    assert.includes(host.textContent, 'Parameter id: [123]', `host.textContent`);

    await tearDown();
  });

  it('parses named parameters without viewport', async function () {
    this.timeout(5000);

    const { host, router, tearDown } = await setup();

    await $goto('/corge@left', router);
    assert.includes(host.textContent, 'Viewport: corge', `host.textContent`);

    await $goto('/baz(id=123)', router);
    assert.includes(host.textContent, 'Viewport: baz', `host.textContent`);
    assert.includes(host.textContent, 'Parameter id: [123]', `host.textContent`);

    await tearDown();
  });

  it('parses multiple parameters after viewport', async function () {
    this.timeout(5000);

    const { host, router, tearDown } = await setup();

    await $goto('/bar@left(123&OneTwoThree)', router);
    assert.includes(host.textContent, 'Viewport: bar', `host.textContent`);
    assert.includes(host.textContent, 'Parameter id: [123]', `host.textContent`);
    assert.includes(host.textContent, 'Parameter name: [OneTwoThree]', `host.textContent`);

    await $goto('/bar@left(456&FourFiveSix)', router);
    assert.includes(host.textContent, 'Viewport: bar', `host.textContent`);
    assert.includes(host.textContent, 'Parameter id: [456]', `host.textContent`);
    assert.includes(host.textContent, 'Parameter name: [FourFiveSix]', `host.textContent`);

    await tearDown();
  });

  it('parses multiple name parameters after viewport', async function () {
    this.timeout(5000);

    const { host, router, tearDown } = await setup();

    await $goto('/bar@left(id=123&name=OneTwoThree)', router);
    assert.includes(host.textContent, 'Viewport: bar', `host.textContent`);
    assert.includes(host.textContent, 'Parameter id: [123]', `host.textContent`);
    assert.includes(host.textContent, 'Parameter name: [OneTwoThree]', `host.textContent`);

    await $goto('/bar@left(name=FourFiveSix&id=456)', router);
    assert.includes(host.textContent, 'Viewport: bar', `host.textContent`);
    assert.includes(host.textContent, 'Parameter id: [456]', `host.textContent`);
    assert.includes(host.textContent, 'Parameter name: [FourFiveSix]', `host.textContent`);

    await tearDown();
  });

  it('parses querystring', async function () {
    this.timeout(5000);

    const { host, router, tearDown } = await setup();

    await $goto('/bar@left?id=123', router);
    assert.includes(host.textContent, 'Viewport: bar', `host.textContent`);
    assert.includes(host.textContent, 'Parameter id: [123]', `host.textContent`);

    await $goto('/bar@left?id=456&name=FourFiveSix', router);
    assert.includes(host.textContent, 'Viewport: bar', `host.textContent`);
    assert.includes(host.textContent, 'Parameter id: [456]', `host.textContent`);
    assert.includes(host.textContent, 'Parameter name: [FourFiveSix]', `host.textContent`);

    await tearDown();
  });

  it('overrides querystring with parameter', async function () {
    this.timeout(5000);

    const { host, router, tearDown } = await setup();

    await $goto('/bar@left(456)?id=123', router);
    assert.includes(host.textContent, 'Viewport: bar', `host.textContent`);
    assert.includes(host.textContent, 'Parameter id: [456]', `host.textContent`);

    await $goto('/bar@left(456&FourFiveSix)?id=123&name=OneTwoThree', router);
    assert.includes(host.textContent, 'Viewport: bar', `host.textContent`);
    assert.includes(host.textContent, 'Parameter id: [456]', `host.textContent`);
    assert.includes(host.textContent, 'Parameter name: [FourFiveSix]', `host.textContent`);

    await $goto('/bar@left(name=SevenEightNine&id=789)?id=123&name=OneTwoThree', router);
    assert.includes(host.textContent, 'Viewport: bar', `host.textContent`);
    assert.includes(host.textContent, 'Parameter id: [789]', `host.textContent`);
    assert.includes(host.textContent, 'Parameter name: [SevenEightNine]', `host.textContent`);

    await tearDown();
  });

  it('loads default when added by if condition becoming true', async function () {
    this.timeout(5000);

    const { host, router, tearDown } = await setup();

    await $goto('/grault@left', router);
    assert.includes(host.textContent, 'toggle', `host.textContent`);
    assert.notIncludes(host.textContent, 'Viewport: grault', `host.textContent`);
    assert.notIncludes(host.textContent, 'garply', `host.textContent`);

    (host as any).getElementsByTagName('INPUT')[0].click();
    await Promise.resolve();
    await waitForNavigation(router);
    assert.includes(host.textContent, 'Viewport: grault', `host.textContent`);
    assert.includes(host.textContent, 'garply', `host.textContent`);

    (host as any).getElementsByTagName('INPUT')[0].click();
    await Promise.resolve();
    await waitForNavigation(router);
    assert.notIncludes(host.textContent, 'Viewport: grault', `host.textContent`);
    assert.notIncludes(host.textContent, 'garply', `host.textContent`);

    (host as any).getElementsByTagName('INPUT')[0].click();
    await Promise.resolve();
    await waitForNavigation(router);
    assert.includes(host.textContent, 'Viewport: grault', `host.textContent`);
    assert.includes(host.textContent, 'garply', `host.textContent`);

    await tearDown();
  });

  it('keeps input when stateful', async function () {
    this.timeout(5000);

    const { host, router, tearDown } = await setup();

    await $goto('/grault@left', router);
    assert.includes(host.textContent, 'toggle', `host.textContent`);
    assert.notIncludes(host.textContent, 'Viewport: grault', `host.textContent`);
    assert.notIncludes(host.textContent, 'garply', `host.textContent`);

    (host as any).getElementsByTagName('INPUT')[0].click();
    await Promise.resolve();
    await waitForNavigation(router);
    assert.includes(host.textContent, 'Viewport: grault', `host.textContent`);
    assert.includes(host.textContent, 'garply', `host.textContent`);

    (host as any).getElementsByTagName('INPUT')[1].value = 'asdf';

    await $goto('/corge@grault', router);

    assert.notIncludes(host.textContent, 'garply', `host.textContent`);
    assert.includes(host.textContent, 'Viewport: corge', `host.textContent`);

    await $goto('/garply@grault', router);

    assert.notIncludes(host.textContent, 'Viewport: corge', `host.textContent`);
    assert.includes(host.textContent, 'garply', `host.textContent`);

    assert.strictEqual((host as any).getElementsByTagName('INPUT')[1].value, 'asdf', `(host as any).getElementsByTagName('INPUT')[1].value`);

    await tearDown();
  });

  it('keeps input when grandparent stateful', async function () {
    this.timeout(5000);

    const { host, router, tearDown } = await setup();

    await $goto('/waldo@left', router);
    assert.includes(host.textContent, 'Viewport: waldo', `host.textContent`);
    assert.includes(host.textContent, 'toggle', `host.textContent`);
    assert.notIncludes(host.textContent, 'Viewport: grault', `host.textContent`);
    assert.notIncludes(host.textContent, 'garply', `host.textContent`);

    (host as any).getElementsByTagName('INPUT')[0].click();
    await Promise.resolve();
    await waitForNavigation(router);
    assert.includes(host.textContent, 'Viewport: grault', `host.textContent`);
    assert.includes(host.textContent, 'garply', `host.textContent`);

    (host as any).getElementsByTagName('INPUT')[1].value = 'asdf';

    await $goto('/foo@waldo', router);

    assert.notIncludes(host.textContent, 'Viewport: grault', `host.textContent`);
    assert.includes(host.textContent, 'Viewport: foo', `host.textContent`);

    await $goto('/grault@waldo', router);

    assert.notIncludes(host.textContent, 'Viewport: corge', `host.textContent`);
    assert.includes(host.textContent, 'Viewport: grault', `host.textContent`);
    assert.includes(host.textContent, 'garply', `host.textContent`);

    assert.strictEqual((host as any).getElementsByTagName('INPUT')[1].value, 'asdf', `(host as any).getElementsByTagName('INPUT')[1].value`);

    await tearDown();
  });

  // TODO: Fix scoped viewports!
  it.skip('loads scoped viewport', async function () {
    this.timeout(5000);

    const { host, router, tearDown } = await setup();

    await $goto('/quux@left', router);
    assert.includes(host.textContent, 'Viewport: quux', `host.textContent`);

    await $goto('/quux@quux!', router);
    assert.includes(host.textContent, 'Viewport: quux', `host.textContent`);

    await $goto('/quux@left/foo@quux!', router);
    assert.includes(host.textContent, 'Viewport: foo', `host.textContent`);

    (host.getElementsByTagName('SPAN')[0] as HTMLElement).click();
    await waitForNavigation(router);
    assert.includes(host.textContent, 'Viewport: baz', `host.textContent`);

    await $goto('/bar@left', router);
    assert.includes(host.textContent, 'Viewport: bar', `host.textContent`);
    assert.notIncludes(host.textContent, 'Viewport: quux', `host.textContent`);

    await tearDown();
  });

  // Fred's tests

  describe('local deps', function () {
    this.timeout(5000);

    async function $setup(dependencies: any[] = []) {
      const ctx = TestContext.createHTMLTestContext();

      const container = ctx.container;

      container.register(ViewportCustomElement);
      const App = CustomElementResource.define({ name: 'app', template: '<au-viewport></au-viewport>', dependencies }, null);

      const host = ctx.doc.createElement('div');
      ctx.doc.body.appendChild(host as any);
      const component = new App();

      const au = new Aurelia(container);

      au.app({ host, component });
      await au.start().wait();

      const router = container.get(Router);
      const mockBrowserHistoryLocation = new MockBrowserHistoryLocation();
      mockBrowserHistoryLocation.changeCallback = router.historyBrowser.pathChanged;
      router.historyBrowser.history = mockBrowserHistoryLocation as any;
      router.historyBrowser.location = mockBrowserHistoryLocation as any;

      router.activate().catch(error => { throw error; });
      await Promise.resolve();

      async function $teardown() {
        await au.stop().wait();
        ctx.doc.body.removeChild(host);
        router.deactivate();
      }

      return { ctx, container, host, component, au, router, $teardown };
    }

    async function $$goto(router: Router, path: string) {
      await $goto(`/${path}`, router);

      await waitForNavigation(router);
    }

    it('verify that the test isn\'t broken', async function () {
      const Local = CustomElementResource.define({ name: 'local', template: 'local' }, null);
      const Global = CustomElementResource.define({ name: 'global', template: 'global' }, null);
      const { container, host, router, $teardown } = await $setup([Local]);

      container.register(Global);

      await $$goto(router, 'global');

      assert.match(host.textContent, /.*global.*/, `host.textContent`);

      await $teardown();
    });

    it('navigates to locally registered dep', async function () {
      const Local = CustomElementResource.define({ name: 'local', template: 'local' }, null);
      const { host, router, $teardown } = await $setup([Local]);

      await $$goto(router, 'local');

      assert.match(host.textContent, /.*local.*/, `host.textContent`);

      await $teardown();
    });

    it('navigates to locally registered dep - nested', async function () {
      const Local2 = CustomElementResource.define({ name: 'local2', template: 'local2' }, class { });
      const Local1 = CustomElementResource.define({ name: 'local1', template: 'local1<au-viewport name="one"></au-viewport>', dependencies: [Local2] }, null);
      const { host, router, $teardown } = await $setup([Local1]);

      await $$goto(router, 'local1+local2');

      assert.match(host.textContent, /.*local1.*local2.*/, `host.textContent`);

      await $teardown();
    });

    it('navigates to locally registered dep - double nested - case #1', async function () {
      const Global3 = CustomElementResource.define({ name: 'global3', template: 'global3' }, null);
      const Local2 = CustomElementResource.define({ name: 'local2', template: 'local2<au-viewport name="two" used-by="global3"></au-viewport>' }, null);
      const Local1 = CustomElementResource.define({ name: 'local1', template: 'local1<au-viewport name="one" used-by="local2"></au-viewport>', dependencies: [Local2] }, null);
      const { host, router, container, $teardown } = await $setup([Local1]);
      container.register(Global3);

      await $$goto(router, 'local1+local2+global3');

      assert.match(host.textContent, /.*local1.*local2.*global3.*/, `host.textContent`);

      await $teardown();
    });

    it('navigates to locally registered dep - double nested - case #2', async function () {
      const Local3 = CustomElementResource.define({ name: 'local3', template: 'local3' }, null);
      const Global2 = CustomElementResource.define({ name: 'global2', template: 'global2<au-viewport name="two" used-by="local3"></au-viewport>', dependencies: [Local3] }, null);
      const Local1 = CustomElementResource.define({ name: 'local1', template: 'local1<au-viewport name="one" used-by="global2"></au-viewport>' }, null);
      const { host, router, container, $teardown } = await $setup([Local1]);
      container.register(Global2);

      await $$goto(router, 'local1+global2+local3');

      assert.match(host.textContent, /.*local1.*global2.*local3.*/, `host.textContent`);

      await $teardown();
    });

    it('navigates to locally registered dep - double nested - case #3', async function () {
      const Local3 = CustomElementResource.define({ name: 'local3', template: 'local3' }, null);
      const Local2 = CustomElementResource.define({ name: 'local2', template: 'local2<au-viewport name="two" used-by="local3"></au-viewport>', dependencies: [Local3] }, null);
      const Global1 = CustomElementResource.define({ name: 'global1', template: 'global1<au-viewport name="one" used-by="local2"></au-viewport>', dependencies: [Local2] }, null);
      const { host, router, container, $teardown } = await $setup();
      container.register(Global1);

      await $$goto(router, 'global1+local2+local3');

      assert.match(host.textContent, /.*global1.*local2.*local3.*/, `host.textContent`);

      await $teardown();
    });

    it('navigates to locally registered dep - double nested - case #4', async function () {
      const Local3 = CustomElementResource.define({ name: 'local3', template: 'local3' }, null);
      const Local2 = CustomElementResource.define({ name: 'local2', template: 'local2<au-viewport name="two" used-by="local3"></au-viewport>', dependencies: [Local3] }, null);
      const Local1 = CustomElementResource.define({ name: 'local1', template: 'local1<au-viewport name="one" used-by="local2"></au-viewport>', dependencies: [Local2] }, null);
      const { host, router, $teardown } = await $setup([Local1]);

      await $$goto(router, 'local1+local2+local3');

      assert.match(host.textContent, /.*local1.*local2.*local3.*/, `host.textContent`);

      await $teardown();
    });

    it('navigates to locally registered dep - conflicting scoped siblings - case #1', async function () {
      const Conflict1 = CustomElementResource.define({ name: 'conflict', template: 'conflict1' }, null);
      const Local1 = CustomElementResource.define({ name: 'local1', template: 'local1<au-viewport name="one"></au-viewport>', dependencies: [Conflict1] }, null);
      const Conflict2 = CustomElementResource.define({ name: 'conflict', template: 'conflict2' }, null);
      const Local2 = CustomElementResource.define({ name: 'local2', template: 'local2<au-viewport name="two"></au-viewport>', dependencies: [Conflict2] }, null);
      const { host, router, $teardown } = await $setup([Local1, Local2]);

      await $$goto(router, 'local1@default+conflict@one');

      assert.match(host.textContent, /.*local1.*conflict1.*/, `host.textContent`);

      await $$goto(router, 'local2@default+conflict@two');

      assert.match(host.textContent, /.*local2.*conflict2.*/, `host.textContent`);

      await $teardown();
    });

    it('navigates to locally registered dep - conflicting scoped siblings - case #2', async function () {
      const Conflict1 = CustomElementResource.define({ name: 'conflict', template: 'conflict1' }, null);
      const Global1 = CustomElementResource.define({ name: 'global1', template: 'global1<au-viewport name="one"></au-viewport>', dependencies: [Conflict1] }, null);
      const Conflict2 = CustomElementResource.define({ name: 'conflict', template: 'conflict2' }, null);
      const Global2 = CustomElementResource.define({ name: 'global2', template: 'global2<au-viewport name="two"></au-viewport>', dependencies: [Conflict2] }, null);
      const { host, router, container, $teardown } = await $setup();
      container.register(Global1, Global2);

      await $$goto(router, 'global1@default+conflict@one');

      assert.match(host.textContent, /.*global1.*conflict1.*/, `host.textContent`);

      await $$goto(router, 'global2@default+conflict@two');

      assert.match(host.textContent, /.*global2.*conflict2.*/, `host.textContent`);

      await $teardown();
    });

    it('navigates to locally registered dep - conflicting scoped siblings - case #3', async function () {
      const Conflict1 = CustomElementResource.define({ name: 'conflict', template: 'conflict1' }, null);
      const Local1 = CustomElementResource.define({ name: 'local1', template: 'local1<au-viewport name="one"></au-viewport>', dependencies: [Conflict1] }, null);
      const Conflict2 = CustomElementResource.define({ name: 'conflict', template: 'conflict2' }, null);
      const Global2 = CustomElementResource.define({ name: 'global2', template: 'global2<au-viewport name="two"></au-viewport>', dependencies: [Conflict2] }, null);
      const { host, router, container, $teardown } = await $setup([Local1]);
      container.register(Global2);

      await $$goto(router, 'local1@default+conflict@one');

      assert.match(host.textContent, /.*local1.*conflict1.*/, `host.textContent`);

      await $$goto(router, 'global2@default+conflict@two');

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

        it.skip(`path: ${path}, expectedText: ${expectedText}`, async function () {
          const Conflict1 = CustomElementResource.define({ name: 'conflict', template: 'conflict1<au-viewport></au-viewport>' }, null);
          const Global1 = CustomElementResource.define({ name: 'global1', template: 'global1<au-viewport name="one"></au-viewport>', dependencies: [Conflict1] }, null);
          const Conflict2 = CustomElementResource.define({ name: 'conflict', template: 'conflict2<au-viewport></au-viewport>' }, null);
          const Local2 = CustomElementResource.define({ name: 'local2', template: 'local2<au-viewport name="two"></au-viewport>', dependencies: [Conflict2] }, null);
          const { host, router, container, $teardown } = await $setup([Local2]);
          container.register(Global1);

          await $$goto(router, path);

          assert.match(host.textContent, expectedText, `host.textContent`);

          await $teardown();
        });
      }
    });
  });
  /////////
});

let quxCantLeave = 2;

const $goto = async (path: string, router: Router) => {
  await router.goto(path);
  await waitForNavigation(router);
}

const wait = async (time = 500) => {
  await new Promise((resolve) => {
    setTimeout(resolve, time);
  });
};

const waitForNavigation = async (router) => {
  let guard = 100;
  while (router.processingNavigation && guard--) {
    await wait(100);
  }
};

