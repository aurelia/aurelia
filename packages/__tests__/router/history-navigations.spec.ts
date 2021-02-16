import { RouterConfiguration, IRouter, IRouterOptions, IEventManager, INavigationFlags, RouterNavigationEndEvent } from '@aurelia/router';
import { assert, TestContext } from '@aurelia/testing';
import { CustomElement, Aurelia } from '@aurelia/runtime-html';

describe('History navigations', function () {
  async function createFixture(routerOptions: IRouterOptions, App, components) {
    const ctx = TestContext.create();
    const { container, platform, doc } = ctx;

    const { href } = platform.location;
    const index = href.indexOf('#');
    if (index >= 0) {
      platform.history.replaceState({}, '', href.slice(0, index));
    }

    container.register(
      RouterConfiguration.customize(routerOptions),
      ...components
    );
    const router = container.get(IRouter);
    const eventManager = container.get(IEventManager);

    const host = ctx.createElement('div');
    doc.body.appendChild(host as any);

    const au = new Aurelia(container);
    au.app({ component: App, host });

    await au.start();

    return {
      ctx,
      container,
      au,
      host,
      router,
      eventManager,
      async tearDown() {
        await au.stop(true);
        doc.body.removeChild(host);
      },
    };
  }

  const tests = [
    { load: 'foo(1)?q=one', url: 'foo(1)?q=one', navigation: { new: true }, parameters: { id: '1', q: 'one' } },
    { load: 'foo(2)?q=two', url: 'foo(2)?q=two', navigation: { new: true }, parameters: { id: '2', q: 'two' } },
    { load: 'foo(3)?q=three', url: 'foo(3)?q=three', navigation: { new: true }, parameters: { id: '3', q: 'three' } },
    { load: ':back', url: 'foo(2)?q=two', navigation: { back: true }, parameters: { id: '2', q: 'two' } },
    { load: ':back', url: 'foo(1)?q=one', navigation: { back: true }, parameters: { id: '1', q: 'one' } },
    { load: ':forward', url: 'foo(2)?q=two', navigation: { forward: true }, parameters: { id: '2', q: 'two' } },
    { load: ':back', url: 'foo(1)?q=one', navigation: { back: true }, parameters: { id: '1', q: 'one' } },
    { load: 'foo(4)?q=four', url: 'foo(4)?q=four', navigation: { new: true }, parameters: { id: '4', q: 'four' } },
    // TODO: Make a decision regarding this:
    // { load: ':forward', url: 'foo(4)?q=four', navigation: {}, parameters: { id: '4', q: 'four' } },
  ];

  const result: { url: string; navigation: INavigationFlags; parameters: Record<string, unknown> } = {
    url: '',
    navigation: { first: false, new: false, refresh: false, back: false, forward: false, replace: false },
    parameters: {},
  };

  const App = CustomElement.define({
    name: 'app',
    template: `<au-viewport></au-viewport>`
  });
  const Foo = CustomElement.define({ name: 'foo', template: `foo`, }, class {
    public static parameters: string[] = ['id'];
    public load(parameters) {
      result.parameters = Object.assign({}, parameters);
    }
  });

  it(`show the right url and navigation flags`, async function () {
    const { tearDown, router, eventManager } = await createFixture({}, App, [Foo]);

    eventManager.subscribe(this, RouterNavigationEndEvent.eventName, (event: RouterNavigationEndEvent) => {
      result.url = event.navigation.path;
      result.navigation = Object.assign({}, result.navigation, event.navigation.navigation);
    });

    for (const test of tests) {

      Object.assign(result, {
        url: '',
        navigation: { first: false, new: false, refresh: false, back: false, forward: false, replace: false },
        parameters: {},
      });
      test.navigation = Object.assign({}, result.navigation, test.navigation);

      switch (test.load) {
        case ':back':
          await router.back();
          break;
        case ':forward':
          await router.forward();
          break;
        default:
          await router.load(test.load);
          break;
      }

      assert.equal(result.url, test.url, `url: ${test.load}:${test.url}`);
      assert.deepEqual(result.navigation, test.navigation, `navigation: ${test.load}:${test.url}`);
      assert.deepEqual(result.parameters, test.parameters, `parameters: ${test.load}:${test.url}`);
    }

    eventManager.unsubscribe(this);
    await tearDown();
  });
});
