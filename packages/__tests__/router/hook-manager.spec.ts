import { HookManager, HookTypes, INavigatorInstruction, ViewportInstruction, RouterConfiguration, IRouter } from '@aurelia/router';
import { assert, TestContext } from '@aurelia/testing';
import { CustomElement, Aurelia, IScheduler } from '@aurelia/runtime';
import { DebugConfiguration } from '@aurelia/debug';

describe('HookManager', function () {
  this.timeout(5000);

  async function createFixture(config?, App?, dependencies: any[] = [], stateSpy?) {
    const ctx = TestContext.createHTMLTestContext();
    const { container, scheduler, doc, wnd } = ctx;

    let path = wnd.location.href;
    const hash = path.indexOf('#');
    if (hash >= 0) {
      path = path.slice(0, hash);
    }
    wnd.history.replaceState({}, '', path);

    const host = doc.createElement('div');
    if (App === void 0) {
      dependencies = dependencies.map(dep => typeof dep === 'string'
        ? CustomElement.define({ name: dep, template: `!${dep}!` })
        : dep);
      App = CustomElement.define({ name: 'app', template: '<au-viewport></au-viewport>', dependencies });
    }
    const au = new Aurelia(container)
      .register(
        DebugConfiguration,
        !config ? RouterConfiguration : RouterConfiguration.customize(config),
        App)
      .app({ host: host, component: App });

    const router = container.get(IRouter);
    const { _pushState, _replaceState } = spyNavigationStates(router, stateSpy);

    await au.start().wait();

    async function tearDown() {
      unspyNavigationStates(router, _pushState, _replaceState);
      router.deactivate();
      RouterConfiguration.customize();
      await au.stop().wait();
    }

    const navigationInstruction: INavigatorInstruction = { instruction: 'test', fullStateInstruction: 'full-test' };
    const viewportInstructions: ViewportInstruction[] = router.instructionResolver.parseViewportInstructions('parent/child');
    return { au, container, scheduler, host, router, tearDown, navigationInstruction, viewportInstructions };
  }

  function spyNavigationStates(router, spy) {
    let _pushState;
    let _replaceState;
    if (spy) {
      _pushState = router.navigation.history.pushState;
      router.navigation.history.pushState = function (data, title, path) {
        spy('push', data, title, path);
        _pushState.call(router.navigation.history, data, title, path);
      };
      _replaceState = router.navigation.history.replaceState;
      router.navigation.history.replaceState = function (data, title, path) {
        spy('replace', data, title, path);
        _replaceState.call(router.navigation.history, data, title, path);
      };
    }
    return { _pushState, _replaceState };
  }
  function unspyNavigationStates(router, _push, _replace) {
    if (_push) {
      router.navigation.history.pushState = _push;
      router.navigation.history.replaceState = _replace;
    }
  }
  const $goto = async (path: string, router: IRouter, scheduler: IScheduler) => {
    await router.goto(path);
    scheduler.getRenderTaskQueue().flush();
  };

  it('can be created', function () {
    const sut = new HookManager();
  });

  it('uses a hook', async function () {
    const { router, tearDown, navigationInstruction } = await createFixture();

    const sut = new HookManager();
    sut.addHook((url: string, navigationInstruction: INavigatorInstruction): Promise<string | ViewportInstruction[]> => Promise.resolve(`hooked:${url}`),
      { type: HookTypes.TransformFromUrl });
    const hooked = await sut.invokeTransformFromUrl('testing', navigationInstruction);
    assert.strictEqual(hooked, 'hooked:testing', `hooked`);

    await tearDown();
  });

  it('uses consequtive hooks', async function () {
    const { router, tearDown, navigationInstruction } = await createFixture();

    const sut = new HookManager();
    sut.addHook((url: string, navigationInstruction: INavigatorInstruction) => Promise.resolve(`hooked:${url}`),
      { type: HookTypes.TransformFromUrl });
    sut.addHook((url: string, navigationInstruction: INavigatorInstruction) => Promise.resolve(`hooked2:${url}`),
      { type: HookTypes.TransformFromUrl });

    const hooked = await sut.invokeTransformFromUrl('testing', navigationInstruction);
    assert.strictEqual(hooked, 'hooked2:hooked:testing', `hooked`);

    await tearDown();
  });

  it('works with no hooks', async function () {
    const { router, tearDown, navigationInstruction } = await createFixture();

    const sut = new HookManager();
    const hooked = await sut.invokeTransformFromUrl('testing', navigationInstruction);
    assert.strictEqual(hooked, 'testing', `hooked`);

    await tearDown();
  });

  it('uses a TransformFromUrl hook returning string', async function () {
    const { router, tearDown, navigationInstruction } = await createFixture();

    const sut = new HookManager();
    sut.addHook((url: string, navigationInstruction: INavigatorInstruction) => Promise.resolve(`hooked:${url}`),
      { type: HookTypes.TransformFromUrl });
    const hooked = await sut.invokeTransformFromUrl('testing', navigationInstruction);
    assert.strictEqual(hooked, 'hooked:testing', `hooked`);

    await tearDown();
  });

  it('uses a TransformFromUrl hook returning viewport instructions', async function () {
    const { router, tearDown, navigationInstruction } = await createFixture();

    const sut = new HookManager();
    sut.addHook(
      (url: string, navigationInstruction: INavigatorInstruction) =>
        Promise.resolve([router.createViewportInstruction(`hooked-${url}`)]),
      { type: HookTypes.TransformFromUrl });
    const hooked = await sut.invokeTransformFromUrl('testing', navigationInstruction) as ViewportInstruction[];
    assert.strictEqual(hooked[0].componentName, 'hooked-testing', `hooked[0].componentName`);

    await tearDown();
  });

  it('uses a TransformToUrl hook getting viewport instructions returning viewport instructions', async function () {
    const { router, tearDown, navigationInstruction } = await createFixture();

    const sut = new HookManager();
    sut.addHook(
      (viewportInstructions: ViewportInstruction[], navigationInstruction: INavigatorInstruction) =>
        Promise.resolve([router.createViewportInstruction(`hooked-${viewportInstructions[0].componentName}`)]),
      { type: HookTypes.TransformToUrl });

    const hooked = await sut.invokeTransformToUrl(
      [router.createViewportInstruction('testing')], navigationInstruction) as ViewportInstruction[];
    assert.strictEqual(hooked[0].componentName, 'hooked-testing', `hooked`);

    await tearDown();
  });

  it('uses a TransformToUrl hook getting viewport instructions returning string', async function () {
    const { router, tearDown, navigationInstruction } = await createFixture();

    const sut = new HookManager();
    sut.addHook(
      (viewportInstructions: ViewportInstruction[], navigationInstruction: INavigatorInstruction) =>
        Promise.resolve(`hooked-${viewportInstructions[0].componentName}`),
      { type: HookTypes.TransformToUrl });

    const hooked = await sut.invokeTransformToUrl(
      [router.createViewportInstruction('testing')], navigationInstruction) as string;
    assert.strictEqual(hooked, 'hooked-testing', `hooked`);

    await tearDown();
  });

  it('uses a TransformToUrl hook getting string returning viewport instructions', async function () {
    const { router, tearDown, navigationInstruction } = await createFixture();

    const sut = new HookManager();
    sut.addHook(
      (url: string, navigationInstruction: INavigatorInstruction) =>
        Promise.resolve([router.createViewportInstruction(`hooked-${url}`)]),
      { type: HookTypes.TransformToUrl });

    const hooked = await sut.invokeTransformToUrl('testing', navigationInstruction) as ViewportInstruction[];
    assert.strictEqual(hooked[0].componentName, 'hooked-testing', `hooked`);

    await tearDown();
  });

  it('uses a TransformToUrl hook getting string returning string', async function () {
    const { router, tearDown, navigationInstruction } = await createFixture();

    const sut = new HookManager();
    sut.addHook((url: string, navigationInstruction: INavigatorInstruction) => Promise.resolve(`hooked-${url}`),
      { type: HookTypes.TransformToUrl });

    const hooked = await sut.invokeTransformToUrl('testing', navigationInstruction) as string;
    assert.strictEqual(hooked, 'hooked-testing', `hooked`);

    await tearDown();
  });

  it('uses a TransformToUrl hook with alternating types', async function () {
    const { router, tearDown, navigationInstruction } = await createFixture();

    const sut = new HookManager();
    const hook = (input: string | ViewportInstruction[], navigationInstruction: INavigatorInstruction): Promise<string | ViewportInstruction[]> =>
      Promise.resolve(typeof input === 'string' ? [router.createViewportInstruction(`hooked-${input}`)] : `hooked-${input[0].componentName}`);
    const str = 'testing';

    sut.addHook(hook, { type: HookTypes.TransformToUrl });

    let hooked: string | ViewportInstruction[] = await sut.invokeTransformToUrl(str, navigationInstruction) as ViewportInstruction[];
    assert.strictEqual(hooked[0].componentName, `hooked-${str}`, `hooked`);

    sut.addHook(hook, { type: HookTypes.TransformToUrl });

    hooked = await sut.invokeTransformToUrl(str, navigationInstruction) as string;
    assert.strictEqual(hooked, `hooked-hooked-${str}`, `hooked-hooked`);

    sut.addHook(hook, { type: HookTypes.TransformToUrl });

    hooked = await sut.invokeTransformToUrl(str, navigationInstruction) as ViewportInstruction[];
    assert.strictEqual(hooked[0].componentName, `hooked-hooked-hooked-${str}`, `hooked-hooked-hooked`);

    sut.addHook(hook, { type: HookTypes.TransformToUrl });

    hooked = await sut.invokeTransformToUrl(str, navigationInstruction) as string;
    assert.strictEqual(hooked, `hooked-hooked-hooked-hooked-${str}`, `hooked-hooked-hooked-hooked`);

    await tearDown();
  });

  it('uses a BeforeNavigation hook returning viewport instructions', async function () {
    const { router, tearDown, navigationInstruction } = await createFixture();

    const sut = new HookManager();
    sut.addHook(
      (viewportInstructions: ViewportInstruction[], navigationInstruction: INavigatorInstruction) =>
        Promise.resolve([router.createViewportInstruction(`hooked-${viewportInstructions[0].componentName}`)]),
      { type: HookTypes.BeforeNavigation });

    const hooked = await sut.invokeBeforeNavigation(
      [router.createViewportInstruction('testing')], navigationInstruction) as ViewportInstruction[];
    assert.strictEqual(hooked[0].componentName, 'hooked-testing', `hooked`);

    await tearDown();
  });

  it('uses a BeforeNavigation hook returning true', async function () {
    const { router, tearDown, navigationInstruction } = await createFixture();

    const sut = new HookManager();
    sut.addHook((viewportInstructions: ViewportInstruction[], navigationInstruction: INavigatorInstruction) => Promise.resolve(true),
      { type: HookTypes.BeforeNavigation });

    const hooked = await sut.invokeBeforeNavigation(
      [router.createViewportInstruction('testing')], navigationInstruction) as ViewportInstruction[];
    assert.strictEqual(hooked[0].componentName, 'testing', `hooked`);

    await tearDown();
  });

  it('uses a BeforeNavigation hook returning false', async function () {
    const { router, tearDown, navigationInstruction } = await createFixture();

    const sut = new HookManager();
    sut.addHook((viewportInstructions: ViewportInstruction[], navigationInstruction: INavigatorInstruction) => Promise.resolve(false),
      { type: HookTypes.BeforeNavigation });

    const hooked = await sut.invokeBeforeNavigation([router.createViewportInstruction('testing')], navigationInstruction) as boolean;
    assert.strictEqual(hooked, false, `hooked`);

    await tearDown();
  });

  it('sets a TransformToUrl hook with alternating types during initialization', async function () {
    const hookFunction = (input: string | ViewportInstruction[], navigationInstruction: INavigatorInstruction): string | ViewportInstruction[] =>
      input.length > 0
        ? typeof input === 'string' ? [router.createViewportInstruction(`hooked-${input}`)] : `hooked-${input[0].componentName}`
        : input;
    const hook = { hook: hookFunction, options: { type: HookTypes.TransformToUrl } };
    const { router, tearDown, navigationInstruction } = await createFixture({
      hooks: [hook, hook, hook],
    });

    const sut = router.hookManager;
    const str = 'testing';

    const hooked: string | ViewportInstruction[] = await sut.invokeTransformToUrl(str, navigationInstruction) as ViewportInstruction[];
    assert.strictEqual(hooked[0].componentName, `hooked-hooked-hooked-${str}`, `hooked-hooked-hooked`);

    await tearDown();
  });

  it('sets a TransformToUrl hook with alternating types through api', async function () {
    const { router, tearDown, navigationInstruction } = await createFixture();

    const str = 'testing';

    let hooked: string | ViewportInstruction[] = await router.hookManager.invokeTransformToUrl(str, navigationInstruction) as string;
    assert.strictEqual(hooked, `${str}`, `not hooked`);

    const hookFunction = (input: string | ViewportInstruction[], navigationInstruction: INavigatorInstruction): Promise<string | ViewportInstruction[]> =>
      Promise.resolve(input.length > 0
        ? typeof input === 'string' ? [router.createViewportInstruction(`hooked-${input}`)] : `hooked-${input[0].componentName}`
        : input);

    router.addHook(hookFunction, { type: HookTypes.TransformToUrl });
    router.addHook(hookFunction, { type: HookTypes.TransformToUrl });
    router.addHook(hookFunction, { type: HookTypes.TransformToUrl });

    hooked = await router.hookManager.invokeTransformToUrl(str, navigationInstruction) as ViewportInstruction[];
    assert.strictEqual(hooked[0].componentName, `hooked-hooked-hooked-${str}`, `hooked-hooked-hooked`);

    await tearDown();
  });

  it('can prevent navigation', async function () {
    const { router, tearDown, scheduler, host } = await createFixture(undefined, undefined, ['one', 'two']);

    await $goto('one', router, scheduler);
    assert.strictEqual(host.textContent, `!one!`, `one`);

    await $goto('two', router, scheduler);
    assert.strictEqual(host.textContent, `!two!`, `two`);

    router.addHook((instructions: ViewportInstruction[], navigation: INavigatorInstruction) => Promise.resolve(false),
      { type: HookTypes.BeforeNavigation, include: ['two'] });

    await $goto('one', router, scheduler);
    assert.strictEqual(host.textContent, `!one!`, `one`);

    await $goto('two', router, scheduler);
    assert.strictEqual(host.textContent, `!one!`, `one`);

    await tearDown();
  });

  it('can redirect navigation', async function () {
    const { router, tearDown, scheduler, host } = await createFixture(undefined, undefined, ['one', 'two', 'three']);

    await $goto('one', router, scheduler);
    assert.strictEqual(host.textContent, `!one!`, `one`);

    await $goto('two', router, scheduler);
    assert.strictEqual(host.textContent, `!two!`, `two`);

    router.addHook(
      (instructions: ViewportInstruction[], navigation: INavigatorInstruction) =>
        Promise.resolve([router.createViewportInstruction('three', instructions[0].viewport)]),
      { type: HookTypes.BeforeNavigation, include: ['two'] });

    await $goto('one', router, scheduler);
    assert.strictEqual(host.textContent, `!one!`, `one`);

    await $goto('two', router, scheduler);
    assert.strictEqual(host.textContent, `!three!`, `three`);

    await tearDown();
  });

  it('can transform from url to string', async function () {
    const { router, tearDown, scheduler, host } = await createFixture(undefined, undefined, ['one', 'two', 'three']);

    await $goto('one', router, scheduler);
    assert.strictEqual(host.textContent, `!one!`, `one`);

    await $goto('two', router, scheduler);
    assert.strictEqual(host.textContent, `!two!`, `two`);

    router.addHook(
      (url: string, navigation: INavigatorInstruction) => Promise.resolve(url === 'two' ? 'three' : url),
      { type: HookTypes.TransformFromUrl });

    await $goto('one', router, scheduler);
    assert.strictEqual(host.textContent, `!one!`, `one`);

    await $goto('two', router, scheduler);
    assert.strictEqual(host.textContent, `!three!`, `three`);

    await tearDown();
  });

  it('can transform from url to viewport instructions', async function () {
    const { router, tearDown, scheduler, host } = await createFixture(undefined, undefined, ['one', 'two', 'three']);

    await $goto('one', router, scheduler);
    assert.strictEqual(host.textContent, `!one!`, `one`);

    await $goto('two', router, scheduler);
    assert.strictEqual(host.textContent, `!two!`, `two`);

    router.addHook(
      (url: string, navigation: INavigatorInstruction) =>
        Promise.resolve(url === 'two' ? [router.createViewportInstruction('three')] : url),
      { type: HookTypes.TransformFromUrl });

    await $goto('one', router, scheduler);
    assert.strictEqual(host.textContent, `!one!`, `one`);

    await $goto('two', router, scheduler);
    assert.strictEqual(host.textContent, `!three!`, `three`);

    await tearDown();
  });

  it('can transform from viewport instructions to url', async function () {
    let locationPath: string;
    const locationCallback = (type, data, title, path) => {
      // console.log(type, data, title, path);
      locationPath = path;
    };
    const { router, tearDown, scheduler, host } = await createFixture(undefined, undefined, ['one', 'two', 'three'], locationCallback);

    await $goto('one', router, scheduler);
    assert.strictEqual(host.textContent, `!one!`, `one`);
    assert.strictEqual(locationPath, `#/one`, `locationPath one`);

    await $goto('two', router, scheduler);
    assert.strictEqual(host.textContent, `!two!`, `two`);
    assert.strictEqual(locationPath, `#/two`, `locationPath two`);

    router.addHook(
      (state: string | ViewportInstruction[], navigation: INavigatorInstruction) =>
        Promise.resolve(
          typeof state === 'string'
            ? state === 'two' ? 'hooked-two' : state
            : state[0].componentName === 'two' ? 'hooked-two' : state),
      { type: HookTypes.TransformToUrl });

    await $goto('one', router, scheduler);
    assert.strictEqual(host.textContent, `!one!`, `one`);
    assert.strictEqual(locationPath, `#/one`, `locationPath one`);

    await $goto('two', router, scheduler);
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
    const { router, tearDown, scheduler, host } = await createFixture(undefined, undefined, ['one', 'two', 'three'], locationCallback);

    await $goto('one', router, scheduler);
    assert.strictEqual(host.textContent, `!one!`, `one`);
    assert.strictEqual(locationPath, `#/one`, `locationPath one`);

    await $goto('two', router, scheduler);
    assert.strictEqual(host.textContent, `!two!`, `two`);
    assert.strictEqual(locationPath, `#/two`, `locationPath two`);

    router.addHook(
      (state: string | ViewportInstruction[], navigation: INavigatorInstruction) =>
        Promise.resolve(typeof state === 'string'
          ? state === 'two' ? 'hooked-two' : state
          : state[0].componentName === 'two' ? 'hooked-two' : state),
      { type: HookTypes.TransformToUrl });

    await $goto('one', router, scheduler);
    assert.strictEqual(host.textContent, `!one!`, `one`);
    assert.strictEqual(locationPath, `#/one`, `locationPath one`);

    await $goto('two', router, scheduler);
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
    const { router, tearDown, scheduler, host } = await createFixture(undefined, undefined, ['one', 'two', 'three'], locationCallback);

    await $goto('one', router, scheduler);
    assert.strictEqual(host.textContent, `!one!`, `one`);
    assert.strictEqual(locationPath, `#/one`, `locationPath one`);

    await $goto('two', router, scheduler);
    assert.strictEqual(host.textContent, `!two!`, `two`);
    assert.strictEqual(locationPath, `#/two`, `locationPath two`);

    router.addHook(
      (state: string | ViewportInstruction[], navigation: INavigatorInstruction) =>
        Promise.resolve(typeof state === 'string'
          ? state === 'hooked-two' ? 'hooked-hooked-two' : state
          : state[0].componentName === 'two' ? 'hooked-two' : state),
      { type: HookTypes.TransformToUrl });

    await $goto('one', router, scheduler);
    assert.strictEqual(host.textContent, `!one!`, `one`);
    assert.strictEqual(locationPath, `#/one`, `locationPath one`);

    await $goto('two', router, scheduler);
    assert.strictEqual(host.textContent, `!two!`, `two`);
    assert.strictEqual(locationPath, `#/hooked-hooked-two`, `locationPath hooked-hooked-two`);

    await tearDown();
  });
});
