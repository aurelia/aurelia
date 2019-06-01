import { RouterConfiguration } from './../../src/configuration';
import { expect } from 'chai';
import { DebugConfiguration } from '../../../debug/src/index';
import { BasicConfiguration } from '../../../jit-html-browser/src/index';
import { Aurelia, CustomElementResource } from '../../../runtime/src/index';
import { Router, ViewportCustomElement } from '../../src/index';
import { MockBrowserHistoryLocation } from '../mock/browser-history-location.mock';
import { registerComponent } from './utils';

const define = (CustomElementResource as any).define;

describe('Router', function () {
  it('can be created', async function () {
    this.timeout(30000);
    const { host, router } = await setup();
    await waitForNavigation(router);

    await teardown(host, router, 1);
  });

  it('loads viewports left and right', async function () {
    this.timeout(30000);
    const { host, router } = await setup();
    await waitForNavigation(router);
    expect(host.textContent).to.contain('left');
    expect(host.textContent).to.contain('right');
    await teardown(host, router, -1);
  });

  it('navigates to foo in left', async function () {
    this.timeout(30000);
    const { host, router } = await setup();

    await goto('foo@left', router);
    expect(host.textContent).to.contain('foo');

    await teardown(host, router, 1);
  });

  it('clears viewport', async function () {
    this.timeout(30000);
    const { host, router } = await setup();

    await goto('foo@left', router);
    expect(host.textContent).to.contain('foo');
    await goto('-@left', router);
    expect(host.textContent).to.not.contain('foo');

    await teardown(host, router, 1);
  });

  it('clears all viewports', async function () {
    this.timeout(30000);
    const { host, router } = await setup();

    await goto('foo@left', router);
    expect(host.textContent).to.contain('Viewport: foo');
    await goto('bar@right', router);
    expect(host.textContent).to.contain('Viewport: bar');
    await goto('-', router);
    expect(host.textContent).to.not.contain('Viewport foo');
    expect(host.textContent).to.not.contain('Viewport bar');

    await teardown(host, router, 1);
  });

  it('queues navigations', async function () {
    this.timeout(40000);
    const { host, router } = await setup();

    router.goto('uier@left');
    // await wait(100);
    router.goto('bar@left');
    expect(router.navigator.pendingNavigations.length).to.equal(1);
    await waitForNavigation(router);
    expect(host.textContent).to.contain('Viewport: bar');

    await teardown(host, router, 4);
  });

  it('replaces foo in left', async function () {
    this.timeout(30000);
    const { host, router } = await setup();

    const historyLength = router.navigation.history.length;
    await goto('foo@left', router);
    expect(host.textContent).to.contain('foo');
    expect(router.navigation.history.length).to.equal(historyLength + 1);

    await router.replace('bar@left');
    await waitForNavigation(router);
    expect(host.textContent).to.contain('bar');
    expect(router.navigation.history.length).to.equal(historyLength + 1);

    await teardown(host, router, 1);
  });

  it('navigates to bar in right', async function () {
    this.timeout(30000);
    const { host, router } = await setup();

    await goto('bar@right', router);
    expect(host.textContent).to.contain('bar');

    await teardown(host, router, 1);
  });

  it('navigates to foo in left then bar in right', async function () {
    this.timeout(30000);
    const { host, router } = await setup();

    await goto('foo@left', router);
    expect(host.textContent).to.contain('Viewport: foo');
    expect(host.textContent).to.not.contain('Viewport: bar');

    await goto('bar@right', router);
    expect(host.textContent).to.contain('Viewport: foo');
    expect(host.textContent).to.contain('Viewport: bar');

    await teardown(host, router, 2);
  });

  it('navigates back and forward with one viewport', async function () {
    this.timeout(40000);
    const { host, router } = await setup();

    await goto('foo@left', router);
    expect(host.textContent).to.contain('Viewport: foo');
    expect(host.textContent).to.not.contain('Viewport: bar');

    await goto('bar@left', router);
    expect(host.textContent).to.not.contain('Viewport: foo');
    expect(host.textContent).to.contain('Viewport: bar');

    await router.back();
    await waitForNavigation(router);
    expect(host.textContent).to.contain('Viewport: foo');
    expect(host.textContent).to.not.contain('Viewport: bar');

    await router.forward();
    await waitForNavigation(router);
    expect(host.textContent).to.not.contain('Viewport: foo');
    expect(host.textContent).to.contain('Viewport: bar');

    await teardown(host, router, 4);
  });

  it('navigates back and forward with two viewports', async function () {
    this.timeout(30000);
    const { host, router } = await setup();

    await goto('foo@left', router);
    expect(host.textContent).to.contain('Viewport: foo');
    expect(host.textContent).to.not.contain('Viewport: bar');

    await goto('bar@right', router);
    expect(host.textContent).to.contain('Viewport: foo');
    expect(host.textContent).to.contain('Viewport: bar');

    await router.back();
    await waitForNavigation(router);
    expect(host.textContent).to.contain('Viewport: foo');
    expect(host.textContent).to.not.contain('Viewport: bar');

    await router.forward();
    await waitForNavigation(router);
    expect(host.textContent).to.contain('Viewport: foo');
    expect(host.textContent).to.contain('Viewport: bar');

    await teardown(host, router, 4);
  });

  it('navigates to foo/bar in left/right', async function () {
    this.timeout(30000);
    const { host, router } = await setup();

    await goto('foo@left+bar@right', router);
    expect(host.textContent).to.contain('foo');
    expect(host.textContent).to.contain('bar');

    await teardown(host, router, 1);
  });

  it('cancels if not canLeave', async function () {
    this.timeout(30000);
    const { host, router } = await setup();

    await goto('baz@left+qux@right', router);
    expect(host.textContent).to.contain('Viewport: baz');
    expect(host.textContent).to.contain('Viewport: qux');

    await goto('foo@left+bar@right', router);
    expect(host.textContent).to.contain('Viewport: baz');
    expect(host.textContent).to.contain('Viewport: qux');
    expect(host.textContent).to.not.contain('Viewport: foo');
    expect(host.textContent).to.not.contain('Viewport: bar');

    await teardown(host, router, 2);
  });

  it('navigates to foo/bar in left/right containing baz/qux respectively', async function () {
    this.timeout(30000);
    const { host, router } = await setup();

    await goto('foo@left+bar@right+baz@foo+qux@bar', router);
    expect(host.textContent).to.contain('Viewport: foo');
    expect(host.textContent).to.contain('Viewport: bar');
    expect(host.textContent).to.contain('Viewport: baz');
    expect(host.textContent).to.contain('Viewport: qux');

    await teardown(host, router, 1);
  });

  it('handles anchor click', async function () {
    this.timeout(30000);
    const { host, router } = await setup();

    await goto('foo@left', router);
    expect(host.textContent).to.contain('foo');

    host.getElementsByTagName('SPAN')[0].click();
    await wait(100);
    await waitForNavigation(router);
    expect(host.textContent).to.contain('Viewport: baz');

    await teardown(host, router, 1);
  });

  it('understands used-by', async function () {
    this.timeout(30000);
    const { host, router } = await setup();

    await goto('corge@left', router);
    expect(host.textContent).to.contain('Viewport: corge');

    await goto('baz', router);
    expect(host.textContent).to.contain('Viewport: baz');

    await teardown(host, router, 1);
  });

  it('does not update fullStatePath on wrong history entry', async function () {
    this.timeout(40000);
    const { host, router } = await setup();

    await goto('foo@left', router);
    await goto('bar@left', router);
    await goto('baz@left', router);

    await teardown(host, router, 4);
  });

  it('parses parameters after viewport', async function () {
    this.timeout(30000);
    const { host, router } = await setup();

    await goto('bar@left(123)', router);
    expect(host.textContent).to.contain('Viewport: bar');
    expect(host.textContent).to.contain('Parameter id: [123]');

    await goto('bar@left(456)', router);
    expect(host.textContent).to.contain('Viewport: bar');
    expect(host.textContent).to.contain('Parameter id: [456]');

    await teardown(host, router, 1);
  });

  it('parses named parameters after viewport', async function () {
    this.timeout(30000);
    const { host, router } = await setup();

    await goto('bar@left(id=123)', router);
    expect(host.textContent).to.contain('Viewport: bar');
    expect(host.textContent).to.contain('Parameter id: [123]');

    await goto('bar@left(id=456)', router);
    expect(host.textContent).to.contain('Viewport: bar');
    expect(host.textContent).to.contain('Parameter id: [456]');

    await teardown(host, router, 1);
  });

  it('parses parameters after viewport individually', async function () {
    this.timeout(30000);
    const { host, router } = await setup();

    await goto('bar@left(123)', router);
    expect(host.textContent).to.contain('Viewport: bar');
    expect(host.textContent).to.contain('Parameter id: [123]');

    await goto('bar@right(456)', router);
    expect(host.textContent).to.contain('Viewport: bar');
    expect(host.textContent).to.contain('Parameter id: [123]');
    expect(host.textContent).to.contain('Parameter id: [456]');

    await teardown(host, router, 1);
  });

  it('parses parameters without viewport', async function () {
    this.timeout(30000);
    const { host, router } = await setup();

    await goto('corge@left', router);
    expect(host.textContent).to.contain('Viewport: corge');

    await goto('baz(123)', router);
    expect(host.textContent).to.contain('Viewport: baz');
    expect(host.textContent).to.contain('Parameter id: [123]');

    await teardown(host, router, 1);
  });

  it('parses named parameters without viewport', async function () {
    this.timeout(30000);
    const { host, router } = await setup();

    await goto('corge@left', router);
    expect(host.textContent).to.contain('Viewport: corge');

    await goto('baz(id=123)', router);
    expect(host.textContent).to.contain('Viewport: baz');
    expect(host.textContent).to.contain('Parameter id: [123]');

    await teardown(host, router, 1);
  });

  it('parses multiple parameters after viewport', async function () {
    this.timeout(30000);
    const { host, router } = await setup();

    await goto('bar@left(123&OneTwoThree)', router);
    expect(host.textContent).to.contain('Viewport: bar');
    expect(host.textContent).to.contain('Parameter id: [123]');
    expect(host.textContent).to.contain('Parameter name: [OneTwoThree]');

    await goto('bar@left(456&FourFiveSix)', router);
    expect(host.textContent).to.contain('Viewport: bar');
    expect(host.textContent).to.contain('Parameter id: [456]');
    expect(host.textContent).to.contain('Parameter name: [FourFiveSix]');

    await teardown(host, router, 1);
  });

  it('parses multiple name parameters after viewport', async function () {
    this.timeout(30000);
    const { host, router } = await setup();

    await goto('bar@left(id=123&name=OneTwoThree)', router);
    expect(host.textContent).to.contain('Viewport: bar');
    expect(host.textContent).to.contain('Parameter id: [123]');
    expect(host.textContent).to.contain('Parameter name: [OneTwoThree]');

    await goto('bar@left(name=FourFiveSix&id=456)', router);
    expect(host.textContent).to.contain('Viewport: bar');
    expect(host.textContent).to.contain('Parameter id: [456]');
    expect(host.textContent).to.contain('Parameter name: [FourFiveSix]');

    await teardown(host, router, 1);
  });

  it('parses querystring', async function () {
    this.timeout(30000);
    const { host, router } = await setup();

    await goto('bar@left?id=123', router);
    expect(host.textContent).to.contain('Viewport: bar');
    expect(host.textContent).to.contain('Parameter id: [123]');

    await goto('bar@left?id=456&name=FourFiveSix', router);
    expect(host.textContent).to.contain('Viewport: bar');
    expect(host.textContent).to.contain('Parameter id: [456]');
    expect(host.textContent).to.contain('Parameter name: [FourFiveSix]');

    await teardown(host, router, 1);
  });

  it('overrides querystring with parameter', async function () {
    this.timeout(30000);
    const { host, router } = await setup();

    await goto('bar@left(456)?id=123', router);
    expect(host.textContent).to.contain('Viewport: bar');
    expect(host.textContent).to.contain('Parameter id: [456]');

    await goto('bar@left(456&FourFiveSix)?id=123&name=OneTwoThree', router);
    expect(host.textContent).to.contain('Viewport: bar');
    expect(host.textContent).to.contain('Parameter id: [456]');
    expect(host.textContent).to.contain('Parameter name: [FourFiveSix]');

    await goto('bar@left(name=SevenEightNine&id=789)?id=123&name=OneTwoThree', router);
    expect(host.textContent).to.contain('Viewport: bar');
    expect(host.textContent).to.contain('Parameter id: [789]');
    expect(host.textContent).to.contain('Parameter name: [SevenEightNine]');

    await teardown(host, router, 1);
  });

  it('uses default reentry behavior', async function () {
    this.timeout(30000);
    const { host, router } = await setup();

    await goto('plugh@left(123)', router);
    expect(host.textContent).to.contain('Parameter: 123');
    expect(host.textContent).to.contain('Entry: 1');

    await goto('plugh@left(123)', router);
    expect(host.textContent).to.contain('Parameter: 123');
    expect(host.textContent).to.contain('Entry: 1');

    await goto('plugh@left(456)', router);
    expect(host.textContent).to.contain('Parameter: 456');
    expect(host.textContent).to.contain('Entry: 2');

    await goto('plugh@left(456)', router);
    expect(host.textContent).to.contain('Parameter: 456');
    expect(host.textContent).to.contain('Entry: 2');

    await teardown(host, router, 1);
  });

  it('uses overriding reentry behavior', async function () {
    this.timeout(30000);
    const { host, router } = await setup();

    plughReentryBehavior = 'enter'; // Affects navigation AFTER this one
    await goto('plugh@left(123)', router);
    expect(host.textContent).to.contain('Parameter: 123');
    expect(host.textContent).to.contain('Entry: 1');

    plughReentryBehavior = 'refresh'; // Affects navigation AFTER this one
    await goto('plugh@left(123)', router);
    expect(host.textContent).to.contain('Parameter: 123');
    expect(host.textContent).to.contain('Entry: 2');

    plughReentryBehavior = 'default'; // Affects navigation AFTER this one
    await goto('plugh@left(456)', router);
    expect(host.textContent).to.contain('Parameter: 456');
    expect(host.textContent).to.contain('Entry: 1');

    plughReentryBehavior = 'enter'; // Affects navigation AFTER this one
    await goto('plugh@left(456)', router);
    expect(host.textContent).to.contain('Parameter: 456');
    expect(host.textContent).to.contain('Entry: 1');

    plughReentryBehavior = 'disallow'; // Affects navigation AFTER this one
    await goto('plugh@left(123)', router);
    expect(host.textContent).to.contain('Parameter: 123');
    expect(host.textContent).to.contain('Entry: 2');

    plughReentryBehavior = 'default'; // Affects navigation AFTER this one
    await goto('plugh@left(456)', router);
    expect(host.textContent).to.contain('Parameter: 123');
    expect(host.textContent).to.contain('Entry: 2');

    await teardown(host, router, 1);
  });

  it('loads default when added by if condition becoming true', async function () {
    this.timeout(30000);
    const { host, router } = await setup();

    await goto('grault@left', router);
    expect(host.textContent).to.contain('toggle');
    expect(host.textContent).to.not.contain('Viewport: grault');
    expect(host.textContent).to.not.contain('garply');

    (host as any).getElementsByTagName('INPUT')[0].click();
    await Promise.resolve();
    await waitForNavigation(router);
    expect(host.textContent).to.contain('Viewport: grault');
    expect(host.textContent).to.contain('garply');

    (host as any).getElementsByTagName('INPUT')[0].click();
    await Promise.resolve();
    await waitForNavigation(router);
    expect(host.textContent).to.not.contain('Viewport: grault');
    expect(host.textContent).to.not.contain('garply');

    (host as any).getElementsByTagName('INPUT')[0].click();
    await Promise.resolve();
    await waitForNavigation(router);
    expect(host.textContent).to.contain('Viewport: grault');
    expect(host.textContent).to.contain('garply');

    await teardown(host, router, 1);
  });

  it('keeps input when stateful', async function () {
    this.timeout(30000);
    const { host, router } = await setup();

    await goto('grault@left', router);
    expect(host.textContent).to.contain('toggle');
    expect(host.textContent).to.not.contain('Viewport: grault');
    expect(host.textContent).to.not.contain('garply');

    (host as any).getElementsByTagName('INPUT')[0].click();
    await Promise.resolve();
    await waitForNavigation(router);
    expect(host.textContent).to.contain('Viewport: grault');
    expect(host.textContent).to.contain('garply');

    (host as any).getElementsByTagName('INPUT')[1].value = 'asdf';

    await goto('corge@grault', router);

    expect(host.textContent).to.not.contain('garply');
    expect(host.textContent).to.contain('Viewport: corge');

    await goto('garply@grault', router);

    expect(host.textContent).to.not.contain('Viewport: corge');
    expect(host.textContent).to.contain('garply');

    expect((host as any).getElementsByTagName('INPUT')[1].value).to.equal('asdf');

    await teardown(host, router, 1);
  });

  it('keeps input when grandparent stateful', async function () {
    this.timeout(30000);
    const { host, router } = await setup();

    await goto('waldo@left', router);
    expect(host.textContent).to.contain('Viewport: waldo');
    expect(host.textContent).to.contain('toggle');
    expect(host.textContent).to.not.contain('Viewport: grault');
    expect(host.textContent).to.not.contain('garply');

    (host as any).getElementsByTagName('INPUT')[0].click();
    await Promise.resolve();
    await waitForNavigation(router);
    expect(host.textContent).to.contain('Viewport: grault');
    expect(host.textContent).to.contain('garply');

    (host as any).getElementsByTagName('INPUT')[1].value = 'asdf';

    await goto('foo@waldo', router);

    expect(host.textContent).to.not.contain('Viewport: grault');
    expect(host.textContent).to.contain('Viewport: foo');

    await goto('grault@waldo', router);

    expect(host.textContent).to.not.contain('Viewport: corge');
    expect(host.textContent).to.contain('Viewport: grault');
    expect(host.textContent).to.contain('garply');

    expect((host as any).getElementsByTagName('INPUT')[1].value).to.equal('asdf');

    await teardown(host, router, 1);
  });

  // TODO: Fix scoped viewports!
  xit('loads scoped viewport', async function () {
    this.timeout(30000);
    const { host, router } = await setup();

    await goto('/quux@left', router);
    expect(host.textContent).to.contain('Viewport: quux');

    await goto('/quux@quux!', router);
    expect(host.textContent).to.contain('Viewport: quux');

    await goto('/quux@left/foo@quux!', router);
    expect(host.textContent).to.contain('Viewport: foo');

    host.getElementsByTagName('SPAN')[0].click();
    await waitForNavigation(router);
    expect(host.textContent).to.contain('Viewport: baz');

    await goto('/bar@left', router);
    expect(host.textContent).to.contain('Viewport: bar');
    expect(host.textContent).to.not.contain('Viewport: quux');

    await teardown(host, router, 1);
  });

  // Fred's tests

  describe('local deps', function () {
    this.timeout(30000);

    async function $setup(dependencies: any[] = []) {
      const container = BasicConfiguration.createContainer();
      registerComponent(container, ViewportCustomElement as any);
      const App = define({ name: 'app', template: '<au-viewport></au-viewport>', dependencies }, null);

      const host = document.createElement('div');
      document.body.appendChild(host as any);
      const component = new App();

      const au = new Aurelia(container);
      au.register(DebugConfiguration, RouterConfiguration);
      au.app({ host, component });
      au.start();

      const router = container.get(Router);
      const mockBrowserHistoryLocation = new MockBrowserHistoryLocation();
      mockBrowserHistoryLocation.changeCallback = router.navigation.handlePopstate as any;
      router.navigation.history = mockBrowserHistoryLocation as any;
      router.navigation.location = mockBrowserHistoryLocation as any;

      router.activate().catch(error => { throw error; });
      await Promise.resolve();

      return { container, host, component, au, router };
    }
    async function $teardown(host, router) {
      document.body.removeChild(host);
      router.deactivate();
    }

    async function $goto(router: Router, path: string) {
      await goto(`/${path}`, router);

      await waitForNavigation(router);
    }

    it('verify that the test isn\'t broken', async function () {
      const Local = define({ name: 'local', template: 'local' }, null);
      const Global = define({ name: 'global', template: 'global' }, null);
      const { container, host, router } = await $setup([Local]);

      registerComponent(container, Global);

      await $goto(router, 'global');

      expect(host.textContent).to.match(/.*global.*/);

      await $teardown(host, router);
    });

    it('navigates to locally registered dep', async function () {
      const Local = define({ name: 'local', template: 'local' }, null);
      const { host, router } = await $setup([Local]);

      await $goto(router, 'local');

      expect(host.textContent).to.match(/.*local.*/);

      await $teardown(host, router);
    });

    it('navigates to locally registered dep - nested', async function () {
      const Local2 = define({ name: 'local2', template: 'local2' }, class { });
      const Local1 = define({ name: 'local1', template: 'local1<au-viewport name="one"></au-viewport>', dependencies: [Local2] }, null);
      const { host, router } = await $setup([Local1]);

      await $goto(router, 'local1+local2');

      expect(host.textContent).to.match(/.*local1.*local2.*/);

      await $teardown(host, router);
    });

    it('navigates to locally registered dep - double nested - case #1', async function () {
      const Global3 = define({ name: 'global3', template: 'global3' }, null);
      const Local2 = define({ name: 'local2', template: 'local2<au-viewport name="two" used-by="global3"></au-viewport>' }, null);
      const Local1 = define({ name: 'local1', template: 'local1<au-viewport name="one" used-by="local2"></au-viewport>', dependencies: [Local2] }, null);
      const { host, router, container } = await $setup([Local1]);
      registerComponent(container, Global3);

      await $goto(router, 'local1+local2+global3');

      expect(host.textContent).to.match(/.*local1.*local2.*global3.*/);

      await $teardown(host, router);
    });

    it('navigates to locally registered dep - double nested - case #2', async function () {
      const Local3 = define({ name: 'local3', template: 'local3' }, null);
      const Global2 = define({ name: 'global2', template: 'global2<au-viewport name="two" used-by="local3"></au-viewport>', dependencies: [Local3] }, null);
      const Local1 = define({ name: 'local1', template: 'local1<au-viewport name="one" used-by="global2"></au-viewport>' }, null);
      const { host, router, container } = await $setup([Local1]);
      registerComponent(container, Global2);

      await $goto(router, 'local1+global2+local3');

      expect(host.textContent).to.match(/.*local1.*global2.*local3.*/);

      await $teardown(host, router);
    });

    it('navigates to locally registered dep - double nested - case #3', async function () {
      const Local3 = define({ name: 'local3', template: 'local3' }, null);
      const Local2 = define({ name: 'local2', template: 'local2<au-viewport name="two" used-by="local3"></au-viewport>', dependencies: [Local3] }, null);
      const Global1 = define({ name: 'global1', template: 'global1<au-viewport name="one" used-by="local2"></au-viewport>', dependencies: [Local2] }, null);
      const { host, router, container } = await $setup();
      registerComponent(container, Global1);

      await $goto(router, 'global1+local2+local3');

      expect(host.textContent).to.match(/.*global1.*local2.*local3.*/);

      await $teardown(host, router);
    });

    it('navigates to locally registered dep - double nested - case #4', async function () {
      const Local3 = define({ name: 'local3', template: 'local3' }, null);
      const Local2 = define({ name: 'local2', template: 'local2<au-viewport name="two" used-by="local3"></au-viewport>', dependencies: [Local3] }, null);
      const Local1 = define({ name: 'local1', template: 'local1<au-viewport name="one" used-by="local2"></au-viewport>', dependencies: [Local2] }, null);
      const { host, router } = await $setup([Local1]);

      await $goto(router, 'local1+local2+local3');

      expect(host.textContent).to.match(/.*local1.*local2.*local3.*/);

      await $teardown(host, router);
    });

    it('navigates to locally registered dep - conflicting scoped siblings - case #1', async function () {
      const Conflict1 = define({ name: 'conflict', template: 'conflict1' }, null);
      const Local1 = define({ name: 'local1', template: 'local1<au-viewport name="one"></au-viewport>', dependencies: [Conflict1] }, null);
      const Conflict2 = define({ name: 'conflict', template: 'conflict2' }, null);
      const Local2 = define({ name: 'local2', template: 'local2<au-viewport name="two"></au-viewport>', dependencies: [Conflict2] }, null);
      const { host, router } = await $setup([Local1, Local2]);

      await $goto(router, 'local1@default+conflict@one');

      expect(host.textContent).to.match(/.*local1.*conflict1.*/);

      await $goto(router, 'local2@default+conflict@two');

      expect(host.textContent).to.match(/.*local2.*conflict2.*/);

      await $teardown(host, router);
    });

    it('navigates to locally registered dep - conflicting scoped siblings - case #2', async function () {
      const Conflict1 = define({ name: 'conflict', template: 'conflict1' }, null);
      const Global1 = define({ name: 'global1', template: 'global1<au-viewport name="one"></au-viewport>', dependencies: [Conflict1] }, null);
      const Conflict2 = define({ name: 'conflict', template: 'conflict2' }, null);
      const Global2 = define({ name: 'global2', template: 'global2<au-viewport name="two"></au-viewport>', dependencies: [Conflict2] }, null);
      const { host, router, container } = await $setup();
      registerComponent(container, Global1, Global2);

      await $goto(router, 'global1@default+conflict@one');

      expect(host.textContent).to.match(/.*global1.*conflict1.*/);

      await $goto(router, 'global2@default+conflict@two');

      expect(host.textContent).to.match(/.*global2.*conflict2.*/);

      await $teardown(host, router);
    });

    it('navigates to locally registered dep - conflicting scoped siblings - case #3', async function () {
      const Conflict1 = define({ name: 'conflict', template: 'conflict1' }, null);
      const Local1 = define({ name: 'local1', template: 'local1<au-viewport name="one"></au-viewport>', dependencies: [Conflict1] }, null);
      const Conflict2 = define({ name: 'conflict', template: 'conflict2' }, null);
      const Global2 = define({ name: 'global2', template: 'global2<au-viewport name="two"></au-viewport>', dependencies: [Conflict2] }, null);
      const { host, router, container } = await $setup([Local1]);
      registerComponent(container, Global2);

      await $goto(router, 'local1@default+conflict@one');

      expect(host.textContent).to.match(/.*local1.*conflict1.*/);

      await $goto(router, 'global2@default+conflict@two');

      expect(host.textContent).to.match(/.*global2.*conflict2.*/);

      await $teardown(host, router);
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

        xit(`path: ${path}, expectedText: ${expectedText}`, async function () {
          const Conflict1 = define({ name: 'conflict', template: 'conflict1<au-viewport></au-viewport>' }, null);
          const Global1 = define({ name: 'global1', template: 'global1<au-viewport name="one"></au-viewport>', dependencies: [Conflict1] }, null);
          const Conflict2 = define({ name: 'conflict', template: 'conflict2<au-viewport></au-viewport>' }, null);
          const Local2 = define({ name: 'local2', template: 'local2<au-viewport name="two"></au-viewport>', dependencies: [Conflict2] }, null);
          const { host, router, container } = await $setup([Local2]);
          registerComponent(container, Global1);

          await $goto(router, path);

          expect(host.textContent).to.match(expectedText);

          await $teardown(host, router);
        });
      }
    });
  });
  /////////
});

let quxCantLeave = 2;
let plughReentryBehavior = 'default';
const setup = async (): Promise<{ au; container; host; router }> => {
  const container = BasicConfiguration.createContainer();

  const App = (CustomElementResource as any).define({ name: 'app', template: '<template><au-viewport name="left"></au-viewport><au-viewport name="right"></au-viewport></template>' });
  const Foo = (CustomElementResource as any).define({ name: 'foo', template: '<template>Viewport: foo <a href="#/baz@foo"><span>baz</span></a><au-viewport name="foo"></au-viewport></template>' });
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
  const Quux = (CustomElementResource as any).define({ name: 'quux', template: '<template>Viewport: quux<au-viewport name="quux" scope></au-viewport></template>' });
  const Corge = (CustomElementResource as any).define({ name: 'corge', template: '<template>Viewport: corge<au-viewport name="corge" used-by="baz"></au-viewport></template>' });

  const Uier = CustomElementResource.define({ name: 'uier', template: '<template>Viewport: uier</template>' }, class {
    public async canEnter() {
      await wait(500);
      return true;
    }
  });

  const Grault = (CustomElementResource as any).define(
    {
      name: 'grault', template: '<template><input type="checkbox" checked.two-way="toggle">toggle<div if.bind="toggle">Viewport: grault<au-viewport name="grault" stateful used-by="garply,corge" default="garply"></au-viewport></div></template>'
    },
    class {
      public toggle = false;
    });
  const Garply = (CustomElementResource as any).define(
    {
      name: 'garply', template: '<template>garply<input checked.two-way="text">text</template>'
    },
    class {
      public text;
    });
  const Waldo = (CustomElementResource as any).define({ name: 'waldo', template: '<template>Viewport: waldo<au-viewport name="waldo" stateful used-by="grault,foo" default="grault"></au-viewport></div></template>' }, class { });

  const Plugh = (CustomElementResource as any).define({ name: 'plugh', template: 'Parameter: ${param} Entry: ${entry}' }, class {
    public param: number;
    public entry: number = 0;
    public reentryBehavior: string = 'default';
    public enter(params) {
      this.param = +params[0];
      this.entry++;
      this.reentryBehavior = plughReentryBehavior;
    }
  });

  container.register(ViewportCustomElement as any);
  registerComponent(container, Foo, Bar, Baz, Qux, Quux, Corge, Uier, Grault, Garply, Waldo, Plugh);

  const host = document.createElement('div');
  document.body.appendChild(host as any);

  const au = window['au'] = new Aurelia(container)
    .register(DebugConfiguration, RouterConfiguration)
    .app({ host: host, component: App })
    .start();

  const router = container.get(Router);
  const mockBrowserHistoryLocation = new MockBrowserHistoryLocation();
  mockBrowserHistoryLocation.changeCallback = router.navigation.handlePopstate as any;
  router.navigation.history = mockBrowserHistoryLocation as any;
  router.navigation.location = mockBrowserHistoryLocation as any;

  await router.activate();
  return { au, container, host, router };
};

const teardown = async (host, router, count) => {
  document.body.removeChild(host);
  router.deactivate();
};

const goto = async (path: string, router: Router) => {
  router.goto(path).catch(error => { throw error; });
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

