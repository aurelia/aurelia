import { RoutingHook, RoutingInstruction, RouterConfiguration, IRouter, Navigation } from '@aurelia/router';
import { assert, TestContext } from '@aurelia/testing';
import { CustomElement, IPlatform, Aurelia } from '@aurelia/runtime-html';

describe('RoutingHook', function () {
  this.timeout(5000);

  async function createFixture(config?, App?, dependencies: any[] = [], stateSpy?) {
    const ctx = TestContext.create();
    const { container, platform, doc, wnd } = ctx;

    const host = doc.createElement('div');
    if (App === void 0) {
      dependencies = dependencies.map(dep => typeof dep === 'string'
        ? CustomElement.define({ name: dep, template: `!${dep}!` })
        : dep);
      App = CustomElement.define({ name: 'app', template: '<au-viewport></au-viewport>', dependencies });
    }
    const au = new Aurelia(container)
      .register(
        RouterConfiguration.customize(config ?? {}),
        App)
      .app({ host: host, component: App });

    const router = container.get(IRouter);
    const { _pushState, _replaceState } = spyNavigationStates(router, stateSpy);

    await au.start();

    async function tearDown() {
      unspyNavigationStates(router, _pushState, _replaceState);
      RouterConfiguration.customize();
      RouterConfiguration.for(router).removeAllHooks();
      await au.stop(true);
      const { href } = platform.location;
      const index = href.indexOf('#');
      if (index >= 0) {
        platform.history.replaceState({}, '', href.slice(0, index));
      }
    }

    const navigationInstruction = Navigation.create({ instruction: 'test', fullStateInstruction: 'full-test' });
    const routingInstructions: RoutingInstruction[] = RoutingInstruction.parse(router, 'parent/child');
    return { au, container, platform, host, router, tearDown, navigationInstruction, routingInstructions };
  }

  function spyNavigationStates(router, spy) {
    let _pushState;
    let _replaceState;
    if (spy) {
      _pushState = router.viewer.history.pushState;
      router.viewer.history.pushState = function (data, title, path) {
        spy('push', data, title, path);
        _pushState.call(router.viewer.history, data, title, path);
      };
      _replaceState = router.viewer.history.replaceState;
      router.viewer.history.replaceState = function (data, title, path) {
        spy('replace', data, title, path);
        _replaceState.call(router.viewer.history, data, title, path);
      };
    }
    return { _pushState, _replaceState };
  }
  function unspyNavigationStates(router, _push, _replace) {
    if (_push) {
      router.viewer.history.pushState = _push;
      router.viewer.history.replaceState = _replace;
    }
  }
  const $load = async (path: string, router: IRouter, platform: IPlatform) => {
    await router.load(path);
    platform.domWriteQueue.flush();
  };

  it('uses a hook', async function () {
    const { router, tearDown, navigationInstruction } = await createFixture();

    RouterConfiguration.for(router).addHook((url: string, navigationInstruction: Navigation): Promise<string | RoutingInstruction[]> => Promise.resolve(`hooked:${url}`),
      { type: 'transformFromUrl' });
    const hooked = await RoutingHook.invokeTransformFromUrl('testing', navigationInstruction);
    assert.strictEqual(hooked, 'hooked:testing', `hooked`);

    await tearDown();
  });

  it('uses consequtive hooks', async function () {
    const { router, tearDown, navigationInstruction } = await createFixture();

    RouterConfiguration.for(router).addHook((url: string, navigationInstruction: Navigation) => Promise.resolve(`hooked:${url}`),
      { type: 'transformFromUrl' });
    RouterConfiguration.for(router).addHook((url: string, navigationInstruction: Navigation) => Promise.resolve(`hooked2:${url}`),
      { type: 'transformFromUrl' });

    const hooked = await RoutingHook.invokeTransformFromUrl('testing', navigationInstruction);
    assert.strictEqual(hooked, 'hooked2:hooked:testing', `hooked`);

    await tearDown();
  });

  it('works with no hooks', async function () {
    const { router, tearDown, navigationInstruction } = await createFixture();

    const hooked = await RoutingHook.invokeTransformFromUrl('testing', navigationInstruction);
    assert.strictEqual(hooked, 'testing', `hooked`);

    await tearDown();
  });

  it('uses a TransformFromUrl hook returning string', async function () {
    const { router, tearDown, navigationInstruction } = await createFixture();

    RouterConfiguration.for(router).addHook((url: string, navigationInstruction: Navigation) => Promise.resolve(`hooked:${url}`),
      { type: 'transformFromUrl' });
    const hooked = await RoutingHook.invokeTransformFromUrl('testing', navigationInstruction);
    assert.strictEqual(hooked, 'hooked:testing', `hooked`);

    await tearDown();
  });

  it('uses a TransformFromUrl hook returning viewport instructions', async function () {
    const { router, tearDown, navigationInstruction } = await createFixture();

    RouterConfiguration.for(router).addHook(
      (url: string, navigationInstruction: Navigation) =>
        Promise.resolve([RoutingInstruction.create(`hooked-${url}`) as RoutingInstruction]),
      { type: 'transformFromUrl' });
    const hooked = await RoutingHook.invokeTransformFromUrl('testing', navigationInstruction) as RoutingInstruction[];
    assert.strictEqual(hooked[0].component.name, 'hooked-testing', `hooked[0].component.name`);

    await tearDown();
  });

  it('uses a TransformToUrl hook getting viewport instructions returning viewport instructions', async function () {
    const { router, tearDown, navigationInstruction } = await createFixture();

    RouterConfiguration.for(router).addHook(
      (routingInstructions: RoutingInstruction[], navigationInstruction: Navigation) =>
        Promise.resolve([RoutingInstruction.create(`hooked-${routingInstructions[0].component.name}`) as RoutingInstruction]),
      { type: 'transformToUrl' });

    const hooked = await RoutingHook.invokeTransformToUrl(
      [RoutingInstruction.create('testing') as RoutingInstruction], navigationInstruction) as RoutingInstruction[];
    assert.strictEqual(hooked[0].component.name, 'hooked-testing', `hooked`);

    await tearDown();
  });

  it('uses a TransformToUrl hook getting viewport instructions returning string', async function () {
    const { router, tearDown, navigationInstruction } = await createFixture();

    RouterConfiguration.for(router).addHook(
      (routingInstructions: RoutingInstruction[], navigationInstruction: Navigation) =>
        Promise.resolve(`hooked-${routingInstructions[0].component.name}`),
      { type: 'transformToUrl' });

    const hooked = await RoutingHook.invokeTransformToUrl(
      [RoutingInstruction.create('testing')], navigationInstruction) as string;
    assert.strictEqual(hooked, 'hooked-testing', `hooked`);

    await tearDown();
  });

  it('uses a TransformToUrl hook getting string returning viewport instructions', async function () {
    const { router, tearDown, navigationInstruction } = await createFixture();

    RouterConfiguration.for(router).addHook(
      (url: string, navigationInstruction: Navigation) =>
        Promise.resolve([RoutingInstruction.create(`hooked-${url}`)]),
      { type: 'transformToUrl' });

    const hooked = await RoutingHook.invokeTransformToUrl('testing', navigationInstruction) as RoutingInstruction[];
    assert.strictEqual(hooked[0].component.name, 'hooked-testing', `hooked`);

    await tearDown();
  });

  it('uses a TransformToUrl hook getting string returning string', async function () {
    const { router, tearDown, navigationInstruction } = await createFixture();

    RouterConfiguration.for(router).addHook((url: string, navigationInstruction: Navigation) => Promise.resolve(`hooked-${url}`),
      { type: 'transformToUrl' });

    const hooked = await RoutingHook.invokeTransformToUrl('testing', navigationInstruction) as string;
    assert.strictEqual(hooked, 'hooked-testing', `hooked`);

    await tearDown();
  });

  it('uses a TransformToUrl hook with alternating types', async function () {
    const { router, tearDown, navigationInstruction } = await createFixture();

    const hook = (input: string | RoutingInstruction[], navigationInstruction: Navigation): Promise<string | RoutingInstruction[]> =>
      Promise.resolve(typeof input === 'string' ? [RoutingInstruction.create(`hooked-${input}`) as RoutingInstruction] : `hooked-${input[0].component.name}`);
    const str = 'testing';

    RouterConfiguration.for(router).addHook(hook, { type: 'transformToUrl' });

    let hooked: string | RoutingInstruction[] = await RoutingHook.invokeTransformToUrl(str, navigationInstruction) as RoutingInstruction[];
    assert.strictEqual(hooked[0].component.name, `hooked-${str}`, `hooked`);

    RouterConfiguration.for(router).addHook(hook, { type: 'transformToUrl' });

    hooked = await RoutingHook.invokeTransformToUrl(str, navigationInstruction) as string;
    assert.strictEqual(hooked, `hooked-hooked-${str}`, `hooked-hooked`);

    RouterConfiguration.for(router).addHook(hook, { type: 'transformToUrl' });

    hooked = await RoutingHook.invokeTransformToUrl(str, navigationInstruction) as RoutingInstruction[];
    assert.strictEqual(hooked[0].component.name, `hooked-hooked-hooked-${str}`, `hooked-hooked-hooked`);

    RouterConfiguration.for(router).addHook(hook, { type: 'transformToUrl' });

    hooked = await RoutingHook.invokeTransformToUrl(str, navigationInstruction) as string;
    assert.strictEqual(hooked, `hooked-hooked-hooked-hooked-${str}`, `hooked-hooked-hooked-hooked`);

    await tearDown();
  });

  it('uses a BeforeNavigation hook returning viewport instructions', async function () {
    const { router, tearDown, navigationInstruction } = await createFixture();

    RouterConfiguration.for(router).addHook(
      (routingInstructions: RoutingInstruction[], navigationInstruction: Navigation) =>
        Promise.resolve([RoutingInstruction.create(`hooked-${routingInstructions[0].component.name}`)]),
      { type: 'beforeNavigation' });

    const hooked = await RoutingHook.invokeBeforeNavigation(
      [RoutingInstruction.create('testing')], navigationInstruction) as RoutingInstruction[];
    assert.strictEqual(hooked[0].component.name, 'hooked-testing', `hooked`);

    await tearDown();
  });

  it('uses a BeforeNavigation hook returning true', async function () {
    const { router, tearDown, navigationInstruction } = await createFixture();

    RouterConfiguration.for(router).addHook((routingInstructions: RoutingInstruction[], navigationInstruction: Navigation) => Promise.resolve(true),
      { type: 'beforeNavigation' });

    const hooked = await RoutingHook.invokeBeforeNavigation(
      [RoutingInstruction.create('testing') as RoutingInstruction], navigationInstruction) as RoutingInstruction[];
    // assert.strictEqual(hooked[0].component.name, 'testing', `hooked`);
    assert.strictEqual(hooked, true, `hooked`);

    await tearDown();
  });

  it('uses a BeforeNavigation hook returning false', async function () {
    const { router, tearDown, navigationInstruction } = await createFixture();

    RouterConfiguration.for(router).addHook((routingInstructions: RoutingInstruction[], navigationInstruction: Navigation) => Promise.resolve(false),
      { type: 'beforeNavigation' });

    const hooked = await RoutingHook.invokeBeforeNavigation([RoutingInstruction.create('testing')], navigationInstruction) as boolean;
    assert.strictEqual(hooked, false, `hooked`);

    await tearDown();
  });

  it('sets a TransformToUrl hook with alternating types during initialization', async function () {
    const hookFunction = (input: string | RoutingInstruction[], navigationInstruction: Navigation): string | RoutingInstruction[] =>
      input.length > 0
        ? typeof input === 'string' ? [RoutingInstruction.create(`hooked-${input}`) as RoutingInstruction] : `hooked-${input[0].component.name}`
        : input;
    const hook = { hook: hookFunction, options: { type: 'transformToUrl' } };
    const { router, tearDown, navigationInstruction } = await createFixture({
      hooks: [hook, hook, hook],
    });

    const str = 'testing';

    const hooked: string | RoutingInstruction[] = await RoutingHook.invokeTransformToUrl(str, navigationInstruction) as RoutingInstruction[];
    assert.strictEqual(hooked[0].component.name, `hooked-hooked-hooked-${str}`, `hooked-hooked-hooked`);

    await tearDown();
  });

  it('sets a TransformToUrl hook with alternating types through api', async function () {
    const { router, tearDown, navigationInstruction } = await createFixture();

    const str = 'testing';

    let hooked: string | RoutingInstruction[] = await RoutingHook.invokeTransformToUrl(str, navigationInstruction) as string;
    assert.strictEqual(hooked, `${str}`, `not hooked`);

    const hookFunction = (input: string | RoutingInstruction[], navigationInstruction: Navigation): Promise<string | RoutingInstruction[]> =>
      Promise.resolve(input.length > 0
        ? typeof input === 'string' ? [RoutingInstruction.create(`hooked-${input}`) as RoutingInstruction] : `hooked-${input[0].component.name}`
        : input);

    RouterConfiguration.for(router).addHook(hookFunction, { type: 'transformToUrl' });
    RouterConfiguration.for(router).addHook(hookFunction, { type: 'transformToUrl' });
    RouterConfiguration.for(router).addHook(hookFunction, { type: 'transformToUrl' });

    hooked = await RoutingHook.invokeTransformToUrl(str, navigationInstruction) as RoutingInstruction[];
    assert.strictEqual(hooked[0].component.name, `hooked-hooked-hooked-${str}`, `hooked-hooked-hooked`);

    await tearDown();
  });

  it('can prevent navigation', async function () {
    const { router, tearDown, platform, host } = await createFixture(undefined, undefined, ['one', 'two']);

    await $load('one', router, platform);
    assert.strictEqual(host.textContent, `!one!`, `one`);

    await $load('two', router, platform);
    assert.strictEqual(host.textContent, `!two!`, `two`);

    RouterConfiguration.for(router).addHook((instructions: RoutingInstruction[], navigation: Navigation) => Promise.resolve(false),
      { type: 'beforeNavigation', include: ['two'] });

    await $load('one', router, platform);
    assert.strictEqual(host.textContent, `!one!`, `one`);

    await $load('two', router, platform);
    assert.strictEqual(host.textContent, `!one!`, `one`);

    await tearDown();
  });

  it('can redirect navigation', async function () {
    const { router, tearDown, platform, host } = await createFixture(undefined, undefined, ['one', 'two', 'three']);

    await $load('one', router, platform);
    assert.strictEqual(host.textContent, `!one!`, `one`);

    await $load('two', router, platform);
    assert.strictEqual(host.textContent, `!two!`, `two`);

    RouterConfiguration.for(router).addHook(
      (instructions: RoutingInstruction[], navigation: Navigation) =>
        Promise.resolve([RoutingInstruction.create('three', instructions[0].viewport.instance)]),
      { type: 'beforeNavigation', include: ['two'] });

    await $load('one', router, platform);
    assert.strictEqual(host.textContent, `!one!`, `one`);

    await $load('two', router, platform);
    assert.strictEqual(host.textContent, `!three!`, `three`);

    await tearDown();
  });

  it('can transform from url to string', async function () {
    const { router, tearDown, platform, host } = await createFixture(undefined, undefined, ['one', 'two', 'three']);

    await $load('one', router, platform);
    assert.strictEqual(host.textContent, `!one!`, `one`);

    await $load('two', router, platform);
    assert.strictEqual(host.textContent, `!two!`, `two`);

    RouterConfiguration.for(router).addHook(
      (url: string, navigation: Navigation) => Promise.resolve(url === 'two' ? 'three' : url),
      { type: 'transformFromUrl' });

    await $load('one', router, platform);
    assert.strictEqual(host.textContent, `!one!`, `one`);

    await $load('two', router, platform);
    assert.strictEqual(host.textContent, `!three!`, `three`);

    await tearDown();
  });

  it('can transform from url to viewport instructions', async function () {
    const { router, tearDown, platform, host } = await createFixture(undefined, undefined, ['one', 'two', 'three']);

    await $load('one', router, platform);
    assert.strictEqual(host.textContent, `!one!`, `one`);

    await $load('two', router, platform);
    assert.strictEqual(host.textContent, `!two!`, `two`);

    RouterConfiguration.for(router).addHook(
      (url: string, navigation: Navigation) =>
        Promise.resolve(url === 'two' ? [RoutingInstruction.create('three')] : url),
      { type: 'transformFromUrl' });

    await $load('one', router, platform);
    assert.strictEqual(host.textContent, `!one!`, `one`);

    await $load('two', router, platform);
    assert.strictEqual(host.textContent, `!three!`, `three`);

    await tearDown();
  });

  it('can transform from viewport instructions to url', async function () {
    let locationPath: string;
    const locationCallback = (type, data, title, path) => {
      // console.log(type, data, title, path);
      locationPath = path;
    };
    const { router, tearDown, platform, host } = await createFixture(undefined, undefined, ['one', 'two', 'three'], locationCallback);

    await $load('one', router, platform);
    assert.strictEqual(host.textContent, `!one!`, `one`);
    assert.strictEqual(locationPath, `#/one`, `locationPath one`);

    await $load('two', router, platform);
    assert.strictEqual(host.textContent, `!two!`, `two`);
    assert.strictEqual(locationPath, `#/two`, `locationPath two`);

    RouterConfiguration.for(router).addHook(
      (state: string | RoutingInstruction[], navigation: Navigation) =>
        Promise.resolve(
          typeof state === 'string'
            ? state === 'two' ? 'hooked-two' : state
            : state[0].component.name === 'two' ? 'hooked-two' : state),
      { type: 'transformToUrl' });

    await $load('one', router, platform);
    assert.strictEqual(host.textContent, `!one!`, `one`);
    assert.strictEqual(locationPath, `#/one`, `locationPath one`);

    await $load('two', router, platform);
    assert.strictEqual(host.textContent, `!two!`, `two`);
    assert.strictEqual(locationPath, `#/hooked-two`, `locationPath hooked-two`);

    await tearDown();
  });

  it('can transform from string to url', async function () {
    let locationPath: string;
    const locationCallback = (type, data, title, path) => {
      // console.log(type, data, title, path);
      locationPath = path;
    };
    const { router, tearDown, platform, host } = await createFixture(undefined, undefined, ['one', 'two', 'three'], locationCallback);

    await $load('one', router, platform);
    assert.strictEqual(host.textContent, `!one!`, `one`);
    assert.strictEqual(locationPath, `#/one`, `locationPath one`);

    await $load('two', router, platform);
    assert.strictEqual(host.textContent, `!two!`, `two`);
    assert.strictEqual(locationPath, `#/two`, `locationPath two`);

    RouterConfiguration.for(router).addHook(
      (state: string | RoutingInstruction[], navigation: Navigation) =>
        Promise.resolve(typeof state === 'string'
          ? state === 'two' ? 'hooked-two' : state
          : state[0].component.name === 'two' ? 'hooked-two' : state),
      { type: 'transformToUrl' });

    await $load('one', router, platform);
    assert.strictEqual(host.textContent, `!one!`, `one`);
    assert.strictEqual(locationPath, `#/one`, `locationPath one`);

    await $load('two', router, platform);
    assert.strictEqual(host.textContent, `!two!`, `two`);
    assert.strictEqual(locationPath, `#/hooked-two`, `locationPath hooked-two`);

    await tearDown();
  });

  it('can transform from viewport instructions to string to url', async function () {
    let locationPath: string;
    const locationCallback = (type, data, title, path) => {
      // console.log(type, data, title, path);
      locationPath = path;
    };
    const { router, tearDown, platform, host } = await createFixture(undefined, undefined, ['one', 'two', 'three'], locationCallback);

    await $load('one', router, platform);
    assert.strictEqual(host.textContent, `!one!`, `one`);
    assert.strictEqual(locationPath, `#/one`, `locationPath one`);

    await $load('two', router, platform);
    assert.strictEqual(host.textContent, `!two!`, `two`);
    assert.strictEqual(locationPath, `#/two`, `locationPath two`);

    RouterConfiguration.for(router).addHook(
      (state: string | RoutingInstruction[], navigation: Navigation) =>
        Promise.resolve(typeof state === 'string'
          ? state === 'hooked-two' ? 'hooked-hooked-two' : state
          : state[0].component.name === 'two' ? 'hooked-two' : state),
      { type: 'transformToUrl' });

    await $load('one', router, platform);
    assert.strictEqual(host.textContent, `!one!`, `one`);
    assert.strictEqual(locationPath, `#/one`, `locationPath one`);

    await $load('two', router, platform);
    assert.strictEqual(host.textContent, `!two!`, `two`);
    assert.strictEqual(locationPath, `#/hooked-hooked-two`, `locationPath hooked-hooked-two`);

    await tearDown();
  });
});
