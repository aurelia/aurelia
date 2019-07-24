import { DebugConfiguration } from '@aurelia/debug';
import { Aurelia, CustomElement, LifecycleFlags, ILifecycle } from '@aurelia/runtime';
import { Router, ViewportCustomElement } from '@aurelia/router';
import { MockBrowserHistoryLocation, TestContext, assert } from '@aurelia/testing';
import { PLATFORM } from '@aurelia/kernel';

describe('Router', function () {
  async function setup() {
    const ctx = TestContext.createHTMLTestContext();
    const { container, lifecycle } = ctx;

    const App = CustomElement.define({ name: 'app', template: '<template><au-viewport name="left"></au-viewport><au-viewport name="right"></au-viewport></template>' });
    const Foo = CustomElement.define({ name: 'foo', template: '<template>Viewport: foo <a href="#/baz@foo"><span>baz</span></a><au-viewport name="foo"></au-viewport></template>' });
    const Bar = CustomElement.define({ name: 'bar', template: '<template>Viewport: bar Parameter id: [${id}] Parameter name: [${name}] <au-viewport name="bar"></au-viewport></template>' }, class {
      public static parameters = ['id', 'name'];
      public id = 'no id';
      public name = 'no name';
      public enter(params) {
        if (params.id) { this.id = params.id; }
        if (params.name) { this.name = params.name; }
      }
    });
    const Baz = CustomElement.define({ name: 'baz', template: '<template>Viewport: baz Parameter id: [${id}] <au-viewport name="baz"></au-viewport></template>' }, class {
      public static parameters = ['id'];
      public id = 'no id';
      public enter(params) { if (params.id) { this.id = params.id; } }
    });
    const Qux = CustomElement.define({ name: 'qux', template: '<template>Viewport: qux<au-viewport name="qux"></au-viewport></template>' }, class {
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
    const Quux = CustomElement.define({ name: 'quux', template: '<template>Viewport: quux<au-viewport name="quux" scope></au-viewport></template>' });
    const Corge = CustomElement.define({ name: 'corge', template: '<template>Viewport: corge<au-viewport name="corge" used-by="baz"></au-viewport></template>' });

    const Uier = CustomElement.define({ name: 'uier', template: '<template>Viewport: uier</template>' }, class {
      public async canEnter() {
        await wait(500);
        return true;
      }
    });

    const Grault = CustomElement.define(
      {
        name: 'grault', template: '<template><input type="checkbox" checked.two-way="toggle">toggle<div if.bind="toggle">Viewport: grault<au-viewport name="grault" stateful used-by="garply,corge" default="garply"></au-viewport></div></template>'
      },
      class {
        public toggle = false;
      });
    const Garply = CustomElement.define(
      {
        name: 'garply', template: '<template>garply<input checked.two-way="text">text</template>'
      },
      class {
        public text;
      });
    const Waldo = CustomElement.define(
      {
        name: 'waldo', template: '<template>Viewport: waldo<au-viewport name="waldo" stateful used-by="grault,foo" default="grault"></au-viewport></div></template>'
      },
      class { });
    const Plugh = CustomElement.define(
      {
        name: 'plugh', template: '<template>Parameter: ${param} Entry: ${entry}</template>'
      },
      class {
        public param: number;
        public entry: number = 0;
        public reentryBehavior: string = 'default';
        public enter(params) {
          this.param = +params[0];
          this.entry++;
          this.reentryBehavior = plughReentryBehavior;
        }
      });


    container.register(Router as any);
    container.register(ViewportCustomElement as any);
    container.register(Foo, Bar, Baz, Qux, Quux, Corge, Uier, Grault, Garply, Waldo, Plugh);

    const router = container.get(Router);
    const mockBrowserHistoryLocation = new MockBrowserHistoryLocation();
    mockBrowserHistoryLocation.changeCallback = router.navigation.handlePopstate;
    router.navigation.history = mockBrowserHistoryLocation as any;
    router.navigation.location = mockBrowserHistoryLocation as any;

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

    return { au, container, lifecycle, host, router, ctx, tearDown };
  };

  it('can be created', async function () {
    this.timeout(5000);

    const { router, tearDown } = await setup();

    await tearDown();
  });

  it('loads viewports left and right', async function () {
    this.timeout(5000);

    const { lifecycle, host, router, tearDown } = await setup();

    assert.includes(host.textContent, 'left', 'host.textContent');
    assert.includes(host.textContent, 'right', 'host.textContent');

    await tearDown();
  });

  it('navigates to foo in left', async function () {
    this.timeout(5000);

    const { lifecycle, host, router, tearDown } = await setup();

    await $goto('foo@left', router, lifecycle);
    assert.includes(host.textContent, 'foo', 'host.textContent');

    await tearDown();
  });

  it('queues navigations', async function () {
    this.timeout(40000);

    const { lifecycle, host, router, tearDown } = await setup();

    router.goto('uier@left');
    const last = router.goto('bar@left');
    // Depending on browser/node, there can be 1 or 2 in the queue here
    assert.notStrictEqual(router.navigator.queued, 0, 'router.navigator.queued');
    await last;
    assert.includes(host.textContent, 'Viewport: bar', 'host.textContent');

    await tearDown();
  });

  it('clears viewport', async function () {
    this.timeout(5000);

    const { lifecycle, host, router, tearDown } = await setup();

    await $goto('foo@left', router, lifecycle);
    assert.includes(host.textContent, 'foo', 'host.textContent');
    await $goto('-@left', router, lifecycle);
    assert.notIncludes(host.textContent, 'foo', 'host.textContent');

    await tearDown();
  });

  it('clears all viewports', async function () {
    this.timeout(5000);

    const { lifecycle, host, router, tearDown } = await setup();

    await $goto('foo@left', router, lifecycle);
    assert.includes(host.textContent, 'Viewport: foo', 'host.textContent');
    await $goto('bar@right', router, lifecycle);
    assert.includes(host.textContent, 'Viewport: bar', 'host.textContent');
    await $goto('-', router, lifecycle);
    assert.notIncludes(host.textContent, 'Viewport: foo', 'host.textContent');
    assert.notIncludes(host.textContent, 'Viewport: bar', 'host.textContent');

    await tearDown();
  });

  it('replaces foo in left', async function () {
    this.timeout(5000);

    const { lifecycle, host, router, tearDown } = await setup();

    const historyLength = router.navigation.history.length;
    await $goto('foo@left', router, lifecycle);
    assert.includes(host.textContent, 'foo', 'host.textContent');
    assert.strictEqual(router.navigation.history.length, historyLength + 1, 'router.navigation.history.length');

    await router.replace('bar@left');

    assert.includes(host.textContent, 'bar', 'host.textContent');
    assert.strictEqual(router.navigation.history.length, historyLength + 1, 'router.navigation.history.length');

    await tearDown();
  });

  it('navigates to bar in right', async function () {
    this.timeout(5000);

    const { lifecycle, host, router, tearDown } = await setup();

    await $goto('bar@right', router, lifecycle);
    assert.includes(host.textContent, 'bar', 'host.textContent');

    await tearDown();
  });

  it('navigates to foo in left then bar in right', async function () {
    this.timeout(5000);

    const { lifecycle, host, router, tearDown } = await setup();

    await $goto('foo@left', router, lifecycle);
    assert.includes(host.textContent, 'Viewport: foo', 'host.textContent');
    assert.notIncludes(host.textContent, 'Viewport: bar', 'host.textContent');

    await $goto('bar@right', router, lifecycle);
    assert.includes(host.textContent, 'Viewport: foo', 'host.textContent');
    assert.includes(host.textContent, 'Viewport: bar', 'host.textContent');

    await tearDown();
  });

  it('reloads state when refresh method is called', async function () {
    this.timeout(5000);

    const { lifecycle, host, router, tearDown } = await setup();

    await $goto('foo@left', router, lifecycle);
    assert.includes(host.textContent, 'Viewport: foo', 'host.textContent');
    assert.notIncludes(host.textContent, 'Viewport: bar', 'host.textContent');

    await $goto('bar@right', router, lifecycle);
    assert.includes(host.textContent, 'Viewport: foo', 'host.textContent');
    assert.includes(host.textContent, 'Viewport: bar', 'host.textContent');

    await router.refresh();
    assert.includes(host.textContent, 'Viewport: foo', 'host.textContent');
    assert.includes(host.textContent, 'Viewport: bar', 'host.textContent');

    await tearDown();
  });

  it('navigates back and forward with one viewport', async function () {
    this.timeout(40000);

    const { lifecycle, host, router, tearDown } = await setup();

    await $goto('foo@left', router, lifecycle);
    assert.includes(host.textContent, 'Viewport: foo', 'host.textContent');
    assert.notIncludes(host.textContent, 'Viewport: bar', 'host.textContent');

    await $goto('bar@left', router, lifecycle);
    assert.notIncludes(host.textContent, 'Viewport: foo', 'host.textContent');
    assert.includes(host.textContent, 'Viewport: bar', 'host.textContent');

    await router.back();

    assert.includes(host.textContent, 'Viewport: foo', 'host.textContent');
    assert.notIncludes(host.textContent, 'Viewport: bar', 'host.textContent');

    await router.forward();

    assert.notIncludes(host.textContent, 'Viewport: foo', 'host.textContent');
    assert.includes(host.textContent, 'Viewport: bar', 'host.textContent');

    await tearDown();
  });

  it('navigates back and forward with two viewports', async function () {
    this.timeout(5000);

    const { lifecycle, host, router, tearDown } = await setup();

    await $goto('foo@left', router, lifecycle);
    assert.includes(host.textContent, 'Viewport: foo', 'host.textContent');
    assert.notIncludes(host.textContent, 'Viewport: bar', 'host.textContent');

    await $goto('bar@right', router, lifecycle);
    assert.includes(host.textContent, 'Viewport: foo', 'host.textContent');
    assert.includes(host.textContent, 'Viewport: bar', 'host.textContent');

    await router.back();

    assert.includes(host.textContent, 'Viewport: foo', 'host.textContent');
    assert.notIncludes(host.textContent, 'Viewport: bar', 'host.textContent');

    await router.forward();

    assert.includes(host.textContent, 'Viewport: foo', 'host.textContent');
    assert.includes(host.textContent, 'Viewport: bar', 'host.textContent');

    await tearDown();
  });

  it('navigates to foo/bar in left/right', async function () {
    this.timeout(5000);

    const { lifecycle, host, router, tearDown } = await setup();

    await $goto('foo@left+bar@right', router, lifecycle);
    assert.includes(host.textContent, 'foo', 'host.textContent');
    assert.includes(host.textContent, 'bar', 'host.textContent');

    await tearDown();
  });

  it('cancels if not canLeave', async function () {
    this.timeout(5000);

    const { lifecycle, host, router, tearDown } = await setup();

    await $goto('baz@left+qux@right', router, lifecycle);
    assert.includes(host.textContent, 'Viewport: baz', 'host.textContent');
    assert.includes(host.textContent, 'Viewport: qux', 'host.textContent');

    await $goto('foo@left+bar@right', router, lifecycle);
    assert.includes(host.textContent, 'Viewport: baz', 'host.textContent');
    assert.includes(host.textContent, 'Viewport: qux', 'host.textContent');
    assert.notIncludes(host.textContent, 'Viewport: foo', 'host.textContent');
    assert.notIncludes(host.textContent, 'Viewport: bar', 'host.textContent');

    await tearDown();
  });

  it('navigates to foo/bar in left/right containing baz/qux respectively', async function () {
    this.timeout(5000);

    const { lifecycle, host, router, tearDown } = await setup();

    await $goto('foo@left+bar@right+baz@foo+qux@bar', router, lifecycle);
    assert.includes(host.textContent, 'Viewport: foo', 'host.textContent');
    assert.includes(host.textContent, 'Viewport: bar', 'host.textContent');
    assert.includes(host.textContent, 'Viewport: baz', 'host.textContent');
    assert.includes(host.textContent, 'Viewport: qux', 'host.textContent');

    await tearDown();
  });

  if (PLATFORM.isBrowserLike) {
    // TODO: figure out why it doesn't work in nodejs and fix it
    it('handles anchor click', async function () {
      this.timeout(5000);

      const { lifecycle, host, router, tearDown } = await setup();

      await $goto('foo@left', router, lifecycle);
      assert.includes(host.textContent, 'foo', 'host.textContent');

      (host.getElementsByTagName('SPAN')[0] as HTMLElement).parentElement.click();
      await wait(100);
      await waitForNavigation(router);
      assert.includes(host.textContent, 'Viewport: baz', 'host.textContent');

      await tearDown();
    });
  }

  it('understands used-by', async function () {
    this.timeout(5000);

    const { lifecycle, host, router, tearDown } = await setup();

    await $goto('corge@left', router, lifecycle);
    assert.includes(host.textContent, 'Viewport: corge', 'host.textContent');

    await $goto('baz', router, lifecycle);
    assert.includes(host.textContent, 'Viewport: baz', 'host.textContent');

    await tearDown();
  });

  it('does not update fullStatePath on wrong history entry', async function () {
    this.timeout(40000);

    const { lifecycle, host, router, tearDown } = await setup();

    await $goto('foo@left', router, lifecycle);
    await $goto('bar@left', router, lifecycle);
    await $goto('baz@left', router, lifecycle);

    await tearDown();
  });

  it('parses parameters after component', async function () {
    this.timeout(5000);

    const { lifecycle, host, router, tearDown } = await setup();

    await $goto('bar(123)@left', router, lifecycle);
    assert.includes(host.textContent, 'Viewport: bar', 'host.textContent');
    assert.includes(host.textContent, 'Parameter id: [123]', 'host.textContent');

    await $goto('bar(456)@left', router, lifecycle);
    assert.includes(host.textContent, 'Viewport: bar', 'host.textContent');
    assert.includes(host.textContent, 'Parameter id: [456]', 'host.textContent');

    await tearDown();
  });

  it('parses named parameters after component', async function () {
    this.timeout(5000);

    const { lifecycle, host, router, tearDown } = await setup();

    await $goto('bar(id=123)@left', router, lifecycle);
    assert.includes(host.textContent, 'Viewport: bar', 'host.textContent');
    assert.includes(host.textContent, 'Parameter id: [123]', 'host.textContent');

    await $goto('bar(id=456)@left', router, lifecycle);
    assert.includes(host.textContent, 'Viewport: bar', 'host.textContent');
    assert.includes(host.textContent, 'Parameter id: [456]', 'host.textContent');

    await tearDown();
  });

  it('parses parameters after component individually', async function () {
    this.timeout(5000);

    const { lifecycle, host, router, tearDown } = await setup();

    await $goto('bar(123)@left', router, lifecycle);
    assert.includes(host.textContent, 'Viewport: bar', 'host.textContent');
    assert.includes(host.textContent, 'Parameter id: [123]', 'host.textContent');

    await $goto('bar(456)@right', router, lifecycle);
    assert.includes(host.textContent, 'Viewport: bar', 'host.textContent');
    assert.includes(host.textContent, 'Parameter id: [123]', 'host.textContent');
    assert.includes(host.textContent, 'Parameter id: [456]', 'host.textContent');

    await tearDown();
  });

  it('parses parameters without viewport', async function () {
    this.timeout(5000);

    const { lifecycle, host, router, tearDown } = await setup();

    await $goto('corge@left', router, lifecycle);
    assert.includes(host.textContent, 'Viewport: corge', 'host.textContent');

    await $goto('baz(123)', router, lifecycle);
    assert.includes(host.textContent, 'Viewport: baz', 'host.textContent');
    assert.includes(host.textContent, 'Parameter id: [123]', 'host.textContent');

    await tearDown();
  });

  it('parses named parameters without viewport', async function () {
    this.timeout(5000);

    const { lifecycle, host, router, tearDown } = await setup();

    await $goto('corge@left', router, lifecycle);
    assert.includes(host.textContent, 'Viewport: corge', 'host.textContent');

    await $goto('baz(id=123)', router, lifecycle);
    assert.includes(host.textContent, 'Viewport: baz', 'host.textContent');
    assert.includes(host.textContent, 'Parameter id: [123]', 'host.textContent');

    await tearDown();
  });

  it('parses multiple parameters after component', async function () {
    this.timeout(5000);

    const { lifecycle, host, router, tearDown } = await setup();

    await $goto('bar(123&OneTwoThree)@left', router, lifecycle);
    assert.includes(host.textContent, 'Viewport: bar', 'host.textContent');
    assert.includes(host.textContent, 'Parameter id: [123]', 'host.textContent');
    assert.includes(host.textContent, 'Parameter name: [OneTwoThree]', 'host.textContent');

    await $goto('bar(456&FourFiveSix)@left', router, lifecycle);
    assert.includes(host.textContent, 'Viewport: bar', 'host.textContent');
    assert.includes(host.textContent, 'Parameter id: [456]', 'host.textContent');
    assert.includes(host.textContent, 'Parameter name: [FourFiveSix]', 'host.textContent');

    await tearDown();
  });

  it('parses multiple name parameters after component', async function () {
    this.timeout(5000);

    const { lifecycle, host, router, tearDown } = await setup();

    await $goto('bar(id=123&name=OneTwoThree)@left', router, lifecycle);
    assert.includes(host.textContent, 'Viewport: bar', 'host.textContent');
    assert.includes(host.textContent, 'Parameter id: [123]', 'host.textContent');
    assert.includes(host.textContent, 'Parameter name: [OneTwoThree]', 'host.textContent');

    await $goto('bar(name=FourFiveSix&id=456)@left', router, lifecycle);
    assert.includes(host.textContent, 'Viewport: bar', 'host.textContent');
    assert.includes(host.textContent, 'Parameter id: [456]', 'host.textContent');
    assert.includes(host.textContent, 'Parameter name: [FourFiveSix]', 'host.textContent');

    await tearDown();
  });

  it('parses querystring', async function () {
    this.timeout(5000);

    const { lifecycle, host, router, tearDown } = await setup();

    await $goto('bar@left?id=123', router, lifecycle);
    assert.includes(host.textContent, 'Viewport: bar', 'host.textContent');
    assert.includes(host.textContent, 'Parameter id: [123]', 'host.textContent');

    await $goto('bar@left?id=456&name=FourFiveSix', router, lifecycle);
    assert.includes(host.textContent, 'Viewport: bar', 'host.textContent');
    assert.includes(host.textContent, 'Parameter id: [456]', 'host.textContent');
    assert.includes(host.textContent, 'Parameter name: [FourFiveSix]', 'host.textContent');

    await tearDown();
  });

  it('overrides querystring with parameter', async function () {
    this.timeout(5000);

    const { lifecycle, host, router, tearDown } = await setup();

    await $goto('bar(456)@left?id=123', router, lifecycle);
    assert.includes(host.textContent, 'Viewport: bar', 'host.textContent');
    assert.includes(host.textContent, 'Parameter id: [456]', 'host.textContent');

    await $goto('bar(456&FourFiveSix)@left?id=123&name=OneTwoThree', router, lifecycle);
    assert.includes(host.textContent, 'Viewport: bar', 'host.textContent');
    assert.includes(host.textContent, 'Parameter id: [456]', 'host.textContent');
    assert.includes(host.textContent, 'Parameter name: [FourFiveSix]', 'host.textContent');

    await $goto('bar(name=SevenEightNine&id=789)@left?id=123&name=OneTwoThree', router, lifecycle);
    assert.includes(host.textContent, 'Viewport: bar', 'host.textContent');
    assert.includes(host.textContent, 'Parameter id: [789]', 'host.textContent');
    assert.includes(host.textContent, 'Parameter name: [SevenEightNine]', 'host.textContent');

    await tearDown();
  });

  it('uses default reentry behavior', async function () {
    this.timeout(5000);

    const { lifecycle, host, router, tearDown } = await setup();

    await $goto('plugh(123)@left', router, lifecycle);
    assert.includes(host.textContent, 'Parameter: 123', 'host.textContent');
    assert.includes(host.textContent, 'Entry: 1', 'host.textContent');

    await $goto('plugh(123)@left', router, lifecycle);
    assert.includes(host.textContent, 'Parameter: 123', 'host.textContent');
    assert.includes(host.textContent, 'Entry: 1', 'host.textContent');

    await $goto('plugh(456)@left', router, lifecycle);
    assert.includes(host.textContent, 'Parameter: 456', 'host.textContent');
    assert.includes(host.textContent, 'Entry: 2', 'host.textContent');

    await $goto('plugh(456)@left', router, lifecycle);
    assert.includes(host.textContent, 'Parameter: 456', 'host.textContent');
    assert.includes(host.textContent, 'Entry: 2', 'host.textContent');

    await tearDown();
  });

  it('uses overriding reentry behavior', async function () {
    this.timeout(5000);

    const { lifecycle, host, router, tearDown } = await setup();

    plughReentryBehavior = 'enter'; // Affects navigation AFTER this one
    await $goto('plugh(123)@left', router, lifecycle);
    assert.includes(host.textContent, 'Parameter: 123', 'host.textContent');
    assert.includes(host.textContent, 'Entry: 1', 'host.textContent');

    plughReentryBehavior = 'refresh'; // Affects navigation AFTER this one
    await $goto('plugh(123)@left', router, lifecycle);
    assert.includes(host.textContent, 'Parameter: 123', 'host.textContent');
    assert.includes(host.textContent, 'Entry: 2', 'host.textContent');

    plughReentryBehavior = 'default'; // Affects navigation AFTER this one
    await $goto('plugh(456)@left', router, lifecycle);
    assert.includes(host.textContent, 'Parameter: 456', 'host.textContent');
    assert.includes(host.textContent, 'Entry: 1', 'host.textContent');

    plughReentryBehavior = 'enter'; // Affects navigation AFTER this one
    await $goto('plugh(456)@left', router, lifecycle);
    assert.includes(host.textContent, 'Parameter: 456', 'host.textContent');
    assert.includes(host.textContent, 'Entry: 1', 'host.textContent');

    plughReentryBehavior = 'disallow'; // Affects navigation AFTER this one
    await $goto('plugh(123)@left', router, lifecycle);
    assert.includes(host.textContent, 'Parameter: 123', 'host.textContent');
    assert.includes(host.textContent, 'Entry: 2', 'host.textContent');

    plughReentryBehavior = 'default'; // Affects navigation AFTER this one
    await $goto('plugh(456)@left', router, lifecycle);
    assert.includes(host.textContent, 'Parameter: 123', 'host.textContent');
    assert.includes(host.textContent, 'Entry: 2', 'host.textContent');

    await tearDown();
  });

  it('loads default when added by if condition becoming true', async function () {
    this.timeout(5000);

    const { lifecycle, host, router, tearDown } = await setup();

    await $goto('grault@left', router, lifecycle);
    assert.includes(host.textContent, 'toggle', 'host.textContent');
    assert.notIncludes(host.textContent, 'Viewport: grault', 'host.textContent');
    assert.notIncludes(host.textContent, 'garply', 'host.textContent');

    (host as any).getElementsByTagName('INPUT')[0].click();
    await Promise.resolve();
    await waitForNavigation(router);
    assert.includes(host.textContent, 'Viewport: grault', 'host.textContent');
    assert.includes(host.textContent, 'garply', 'host.textContent');

    (host as any).getElementsByTagName('INPUT')[0].click();
    await Promise.resolve();
    await waitForNavigation(router);
    assert.notIncludes(host.textContent, 'Viewport: grault', 'host.textContent');
    assert.notIncludes(host.textContent, 'garply', 'host.textContent');

    (host as any).getElementsByTagName('INPUT')[0].click();
    await Promise.resolve();
    await waitForNavigation(router);
    assert.includes(host.textContent, 'Viewport: grault', 'host.textContent');
    assert.includes(host.textContent, 'garply', 'host.textContent');

    await tearDown();
  });

  if (PLATFORM.isBrowserLike) {
    // TODO: figure out why this works in nodejs locally but not in CI and fix it
    it('keeps input when stateful', async function () {
      this.timeout(5000);

      const { lifecycle, host, router, tearDown } = await setup();

      await $goto('grault@left', router, lifecycle);
      assert.includes(host.textContent, 'toggle', 'host.textContent');
      assert.notIncludes(host.textContent, 'Viewport: grault', 'host.textContent');
      assert.notIncludes(host.textContent, 'garply', 'host.textContent');

      (host as any).getElementsByTagName('INPUT')[0].click();
      await Promise.resolve();
      await waitForNavigation(router);
      assert.includes(host.textContent, 'Viewport: grault', 'host.textContent');
      assert.includes(host.textContent, 'garply', 'host.textContent');

      (host as any).getElementsByTagName('INPUT')[1].value = 'asdf';

      await $goto('corge@grault', router, lifecycle);

      assert.notIncludes(host.textContent, 'garply', 'host.textContent');
      assert.includes(host.textContent, 'Viewport: corge', 'host.textContent');

      await $goto('garply@grault', router, lifecycle);

      assert.notIncludes(host.textContent, 'Viewport: corge', 'host.textContent');
      assert.includes(host.textContent, 'garply', 'host.textContent');

      assert.strictEqual((host as any).getElementsByTagName('INPUT')[1].value, 'asdf', '(host as any).getElementsByTagName(\'INPUT\')[1].value');

      await tearDown();
    });
  }
  it('keeps input when grandparent stateful', async function () {
    this.timeout(5000);

    const { lifecycle, host, router, tearDown } = await setup();

    await $goto('waldo@left', router, lifecycle);
    assert.includes(host.textContent, 'Viewport: waldo', 'host.textContent');
    assert.includes(host.textContent, 'toggle', 'host.textContent');
    assert.notIncludes(host.textContent, 'Viewport: grault', 'host.textContent');
    assert.notIncludes(host.textContent, 'garply', 'host.textContent');

    (host as any).getElementsByTagName('INPUT')[0].click();
    await Promise.resolve();
    await wait();
    await waitForNavigation(router);
    assert.includes(host.textContent, 'Viewport: grault', 'host.textContent');
    assert.includes(host.textContent, 'garply', 'host.textContent');

    (host as any).getElementsByTagName('INPUT')[1].value = 'asdf';

    await $goto('foo@waldo', router, lifecycle);

    assert.notIncludes(host.textContent, 'Viewport: grault', 'host.textContent');
    assert.includes(host.textContent, 'Viewport: foo', 'host.textContent');

    await $goto('grault@waldo', router, lifecycle);

    assert.notIncludes(host.textContent, 'Viewport: corge', 'host.textContent');
    assert.includes(host.textContent, 'Viewport: grault', 'host.textContent');
    assert.includes(host.textContent, 'garply', 'host.textContent');

    assert.strictEqual((host as any).getElementsByTagName('INPUT')[1].value, 'asdf', '(host as any).getElementsByTagName(\'INPUT\')[1].value');

    await tearDown();
  });

  // TODO: Fix scoped viewports!
  it.skip('loads scoped viewport', async function () {
    this.timeout(5000);

    const { lifecycle, host, router, tearDown } = await setup();

    await $goto('quux@left', router, lifecycle);
    assert.includes(host.textContent, 'Viewport: quux', 'host.textContent');

    await $goto('quux@quux!', router, lifecycle);
    assert.includes(host.textContent, 'Viewport: quux', 'host.textContent');

    await $goto('quux@left/foo@quux!', router, lifecycle);
    assert.includes(host.textContent, 'Viewport: foo', 'host.textContent');

    (host.getElementsByTagName('SPAN')[0] as HTMLElement).click();
    await waitForNavigation(router);
    assert.includes(host.textContent, 'Viewport: baz', 'host.textContent');

    await $goto('bar@left', router, lifecycle);
    assert.includes(host.textContent, 'Viewport: bar', 'host.textContent');
    assert.notIncludes(host.textContent, 'Viewport: quux', 'host.textContent');

    await tearDown();
  });

  // Fred's tests

  describe('local deps', function () {
    this.timeout(5000);

    async function $setup(dependencies: any[] = []) {
      const ctx = TestContext.createHTMLTestContext();

      const { container, lifecycle } = ctx;

      container.register(ViewportCustomElement);
      const App = CustomElement.define({ name: 'app', template: '<au-viewport></au-viewport>', dependencies }, null);

      const host = ctx.doc.createElement('div');
      ctx.doc.body.appendChild(host as any);
      const component = new App();

      const au = ctx.wnd['au'] = new Aurelia(container);

      au.app({ host, component });
      await au.start().wait();

      const router = container.get(Router);
      const mockBrowserHistoryLocation = new MockBrowserHistoryLocation();
      mockBrowserHistoryLocation.changeCallback = router.navigation.handlePopstate;
      router.navigation.history = mockBrowserHistoryLocation as any;
      router.navigation.location = mockBrowserHistoryLocation as any;

      await router.activate();
      await Promise.resolve();

      async function $teardown() {
        await au.stop().wait();
        ctx.doc.body.removeChild(host);
        router.deactivate();
      }

      return { ctx, container, lifecycle, host, component, au, router, $teardown };
    }

    it('verify that the test isn\'t broken', async function () {
      const Local = CustomElement.define({ name: 'local', template: 'local' }, null);
      const Global = CustomElement.define({ name: 'global', template: 'global' }, null);
      const { lifecycle, container, host, router, $teardown } = await $setup([Local]);

      container.register(Global);

      await $goto('global', router, lifecycle);

      assert.match(host.textContent, /.*global.*/, 'host.textContent');

      await $teardown();
    });

    it('navigates to locally registered dep', async function () {
      const Local = CustomElement.define({ name: 'local', template: 'local' }, null);
      const { lifecycle, host, router, $teardown } = await $setup([Local]);

      await $goto('local', router, lifecycle);

      assert.match(host.textContent, /.*local.*/, 'host.textContent');

      await $teardown();
    });

    it('navigates to locally registered dep - nested', async function () {
      const Local2 = CustomElement.define({ name: 'local2', template: 'local2' }, class { });
      const Local1 = CustomElement.define({ name: 'local1', template: 'local1<au-viewport name="one"></au-viewport>', dependencies: [Local2] }, null);
      const { lifecycle, host, router, $teardown } = await $setup([Local1]);

      await $goto('local1+local2', router, lifecycle);

      assert.match(host.textContent, /.*local1.*local2.*/, 'host.textContent');

      await $teardown();
    });

    it('navigates to locally registered dep - double nested - case #1', async function () {
      const Global3 = CustomElement.define({ name: 'global3', template: 'global3' }, null);
      const Local2 = CustomElement.define({ name: 'local2', template: 'local2<au-viewport name="two" used-by="global3"></au-viewport>' }, null);
      const Local1 = CustomElement.define({ name: 'local1', template: 'local1<au-viewport name="one" used-by="local2"></au-viewport>', dependencies: [Local2] }, null);
      const { lifecycle, host, router, container, $teardown } = await $setup([Local1]);
      container.register(Global3);

      await $goto('local1+local2+global3', router, lifecycle);

      assert.match(host.textContent, /.*local1.*local2.*global3.*/, 'host.textContent');

      await $teardown();
    });

    it('navigates to locally registered dep - double nested - case #2', async function () {
      const Local3 = CustomElement.define({ name: 'local3', template: 'local3' }, null);
      const Global2 = CustomElement.define({ name: 'global2', template: 'global2<au-viewport name="two" used-by="local3"></au-viewport>', dependencies: [Local3] }, null);
      const Local1 = CustomElement.define({ name: 'local1', template: 'local1<au-viewport name="one" used-by="global2"></au-viewport>' }, null);
      const { lifecycle, host, router, container, $teardown } = await $setup([Local1]);
      container.register(Global2);

      await $goto('local1+global2+local3', router, lifecycle);

      assert.match(host.textContent, /.*local1.*global2.*local3.*/, 'host.textContent');

      await $teardown();
    });

    it('navigates to locally registered dep - double nested - case #3', async function () {
      const Local3 = CustomElement.define({ name: 'local3', template: 'local3' }, null);
      const Local2 = CustomElement.define({ name: 'local2', template: 'local2<au-viewport name="two" used-by="local3"></au-viewport>', dependencies: [Local3] }, null);
      const Global1 = CustomElement.define({ name: 'global1', template: 'global1<au-viewport name="one" used-by="local2"></au-viewport>', dependencies: [Local2] }, null);
      const { lifecycle, host, router, container, $teardown } = await $setup();
      container.register(Global1);

      await $goto('global1+local2+local3', router, lifecycle);

      assert.match(host.textContent, /.*global1.*local2.*local3.*/, 'host.textContent');

      await $teardown();
    });

    it('navigates to locally registered dep - double nested - case #4', async function () {
      const Local3 = CustomElement.define({ name: 'local3', template: 'local3' }, null);
      const Local2 = CustomElement.define({ name: 'local2', template: 'local2<au-viewport name="two" used-by="local3"></au-viewport>', dependencies: [Local3] }, null);
      const Local1 = CustomElement.define({ name: 'local1', template: 'local1<au-viewport name="one" used-by="local2"></au-viewport>', dependencies: [Local2] }, null);
      const { lifecycle, host, router, $teardown } = await $setup([Local1]);

      await $goto('local1+local2+local3', router, lifecycle);

      assert.match(host.textContent, /.*local1.*local2.*local3.*/, 'host.textContent');

      await $teardown();
    });

    it('navigates to locally registered dep - conflicting scoped siblings - case #1', async function () {
      const Conflict1 = CustomElement.define({ name: 'conflict', template: 'conflict1' }, null);
      const Local1 = CustomElement.define({ name: 'local1', template: 'local1<au-viewport name="one"></au-viewport>', dependencies: [Conflict1] }, null);
      const Conflict2 = CustomElement.define({ name: 'conflict', template: 'conflict2' }, null);
      const Local2 = CustomElement.define({ name: 'local2', template: 'local2<au-viewport name="two"></au-viewport>', dependencies: [Conflict2] }, null);
      const { lifecycle, host, router, $teardown } = await $setup([Local1, Local2]);

      await $goto('local1@default+conflict@one', router, lifecycle);

      assert.match(host.textContent, /.*local1.*conflict1.*/, 'host.textContent');

      await $goto('local2@default+conflict@two', router, lifecycle);

      assert.match(host.textContent, /.*local2.*conflict2.*/, 'host.textContent');

      await $teardown();
    });

    it('navigates to locally registered dep - conflicting scoped siblings - case #2', async function () {
      const Conflict1 = CustomElement.define({ name: 'conflict', template: 'conflict1' }, null);
      const Global1 = CustomElement.define({ name: 'global1', template: 'global1<au-viewport name="one"></au-viewport>', dependencies: [Conflict1] }, null);
      const Conflict2 = CustomElement.define({ name: 'conflict', template: 'conflict2' }, null);
      const Global2 = CustomElement.define({ name: 'global2', template: 'global2<au-viewport name="two"></au-viewport>', dependencies: [Conflict2] }, null);
      const { lifecycle, host, router, container, $teardown } = await $setup();
      container.register(Global1, Global2);

      await $goto('global1@default+conflict@one', router, lifecycle);

      assert.match(host.textContent, /.*global1.*conflict1.*/, 'host.textContent');

      await $goto('global2@default+conflict@two', router, lifecycle);

      assert.match(host.textContent, /.*global2.*conflict2.*/, 'host.textContent');

      await $teardown();
    });

    it('navigates to locally registered dep - conflicting scoped siblings - case #3', async function () {
      const Conflict1 = CustomElement.define({ name: 'conflict', template: 'conflict1' }, null);
      const Local1 = CustomElement.define({ name: 'local1', template: 'local1<au-viewport name="one"></au-viewport>', dependencies: [Conflict1] }, null);
      const Conflict2 = CustomElement.define({ name: 'conflict', template: 'conflict2' }, null);
      const Global2 = CustomElement.define({ name: 'global2', template: 'global2<au-viewport name="two"></au-viewport>', dependencies: [Conflict2] }, null);
      const { lifecycle, host, router, container, $teardown } = await $setup([Local1]);
      container.register(Global2);

      await $goto('local1@default+conflict@one', router, lifecycle);

      assert.match(host.textContent, /.*local1.*conflict1.*/, 'host.textContent');

      await $goto('global2@default+conflict@two', router, lifecycle);

      assert.match(host.textContent, /.*global2.*conflict2.*/, 'host.textContent');

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
          const Conflict1 = CustomElement.define({ name: 'conflict', template: 'conflict1<au-viewport></au-viewport>' }, null);
          const Global1 = CustomElement.define({ name: 'global1', template: 'global1<au-viewport name="one"></au-viewport>', dependencies: [Conflict1] }, null);
          const Conflict2 = CustomElement.define({ name: 'conflict', template: 'conflict2<au-viewport></au-viewport>' }, null);
          const Local2 = CustomElement.define({ name: 'local2', template: 'local2<au-viewport name="two"></au-viewport>', dependencies: [Conflict2] }, null);
          const { lifecycle, host, router, container, $teardown } = await $setup([Local2]);
          container.register(Global1);

          await $goto(path, router, lifecycle);

          assert.match(host.textContent, expectedText, 'host.textContent');

          await $teardown();
        });
      }
    });
  });
  /////////
});

let quxCantLeave = 2;
let plughReentryBehavior = 'default';

const $goto = async (path: string, router: Router, lifecycle: ILifecycle) => {
  await router.goto(path);
  lifecycle.processRAFQueue(LifecycleFlags.none);
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

