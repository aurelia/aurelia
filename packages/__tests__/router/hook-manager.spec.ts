import { HookManager, HookTypes, INavigatorInstruction, ViewportInstruction, RouterConfiguration, IRouter } from '@aurelia/router';
import { assert, TestContext } from '@aurelia/testing';
import { CustomElement, Aurelia, IScheduler } from '@aurelia/runtime';
import { DebugConfiguration } from '@aurelia/debug';

describe('HookManager', function () {
  this.timeout(5000);

  async function setup(config?, App?, dependencies: any[] = []) {
    const ctx = TestContext.createHTMLTestContext();
    const { container, scheduler, doc } = ctx;

    const host = doc.createElement('div');
    if (App === void 0) {
      App = CustomElement.define({ name: 'app', template: '<au-viewport></au-viewport>', dependencies });
    }
    const au = new Aurelia(container)
      .register(
        DebugConfiguration,
        !config ? RouterConfiguration : RouterConfiguration.customize(config),
        App)
      .app({ host: host, component: App });
    await au.start().wait();

    const router = container.get(IRouter);

    async function tearDown() {
      router.deactivate();
      RouterConfiguration.customize();
      await au.stop().wait();
    }

    const navigationInstruction: INavigatorInstruction = { instruction: 'test', fullStateInstruction: 'full-test' };
    const viewportInstructions: ViewportInstruction[] = router.instructionResolver.parseViewportInstructions('parent/child');
    return { au, container, scheduler, host, router, tearDown, navigationInstruction, viewportInstructions };
  }

  const $goto = async (path: string, router: IRouter, scheduler: IScheduler) => {
    await router.goto(path);
    scheduler.getRenderTaskQueue().flush();
  };

  it('can be created', function () {
    const sut = new HookManager();
  });

  it('uses a hook', async function () {
    const { router, tearDown, navigationInstruction } = await setup();

    const sut = new HookManager();
    sut.addHook((url: string, navigationInstruction: INavigatorInstruction) => `hooked:${url}`,
      { type: HookTypes.TransformFromUrl });
    const hooked = sut.invokeTransformFromUrl('testing', navigationInstruction);
    assert.strictEqual(hooked, 'hooked:testing', `hooked`);

    await tearDown();
  });

  it('uses consequtive hooks', async function () {
    const { router, tearDown, navigationInstruction } = await setup();

    const sut = new HookManager();
    sut.addHook((url: string, navigationInstruction: INavigatorInstruction) => `hooked:${url}`,
      { type: HookTypes.TransformFromUrl });
    sut.addHook((url: string, navigationInstruction: INavigatorInstruction) => `hooked2:${url}`,
      { type: HookTypes.TransformFromUrl });

    const hooked = sut.invokeTransformFromUrl('testing', navigationInstruction);
    assert.strictEqual(hooked, 'hooked2:hooked:testing', `hooked`);

    await tearDown();
  });

  it('works with no hooks', async function () {
    const { router, tearDown, navigationInstruction } = await setup();

    const sut = new HookManager();
    const hooked = sut.invokeTransformFromUrl('testing', navigationInstruction);
    assert.strictEqual(hooked, 'testing', `hooked`);

    await tearDown();
  });

  it('uses a TransformFromUrl hook returning string', async function () {
    const { router, tearDown, navigationInstruction } = await setup();

    const sut = new HookManager();
    sut.addHook((url: string, navigationInstruction: INavigatorInstruction) => `hooked:${url}`,
      { type: HookTypes.TransformFromUrl });
    const hooked = sut.invokeTransformFromUrl('testing', navigationInstruction);
    assert.strictEqual(hooked, 'hooked:testing', `hooked`);

    await tearDown();
  });

  it('uses a TransformFromUrl hook returning viewport instructions', async function () {
    const { router, tearDown, navigationInstruction } = await setup();

    const sut = new HookManager();
    sut.addHook((url: string, navigationInstruction: INavigatorInstruction) =>
      [router.createViewportInstruction(`hooked-${url}`)],
      { type: HookTypes.TransformFromUrl });
    const hooked = sut.invokeTransformFromUrl('testing', navigationInstruction) as ViewportInstruction[];
    assert.strictEqual(hooked[0].componentName, 'hooked-testing', `hooked[0].componentName`);

    await tearDown();
  });

  it('uses a TransformToUrl hook getting viewport instructions returning viewport instructions', async function () {
    const { router, tearDown, navigationInstruction } = await setup();

    const sut = new HookManager();
    sut.addHook((viewportInstructions: ViewportInstruction[], navigationInstruction: INavigatorInstruction) =>
      [router.createViewportInstruction(`hooked-${viewportInstructions[0].componentName}`)],
      { type: HookTypes.TransformToUrl });

    const hooked = sut.invokeTransformToUrl(
      [router.createViewportInstruction('testing')], navigationInstruction) as ViewportInstruction[];
    assert.strictEqual(hooked[0].componentName, 'hooked-testing', `hooked`);

    await tearDown();
  });

  it('uses a TransformToUrl hook getting viewport instructions returning string', async function () {
    const { router, tearDown, navigationInstruction } = await setup();

    const sut = new HookManager();
    sut.addHook((viewportInstructions: ViewportInstruction[], navigationInstruction: INavigatorInstruction) =>
      `hooked-${viewportInstructions[0].componentName}`,
      { type: HookTypes.TransformToUrl });

    const hooked = sut.invokeTransformToUrl(
      [router.createViewportInstruction('testing')], navigationInstruction) as string;
    assert.strictEqual(hooked, 'hooked-testing', `hooked`);

    await tearDown();
  });

  it('uses a TransformToUrl hook getting string returning viewport instructions', async function () {
    const { router, tearDown, navigationInstruction } = await setup();

    const sut = new HookManager();
    sut.addHook((url: string, navigationInstruction: INavigatorInstruction) =>
      [router.createViewportInstruction(`hooked-${url}`)],
      { type: HookTypes.TransformToUrl });

    const hooked = sut.invokeTransformToUrl('testing', navigationInstruction) as ViewportInstruction[];
    assert.strictEqual(hooked[0].componentName, 'hooked-testing', `hooked`);

    await tearDown();
  });

  it('uses a TransformToUrl hook getting string returning string', async function () {
    const { router, tearDown, navigationInstruction } = await setup();

    const sut = new HookManager();
    sut.addHook((url: string, navigationInstruction: INavigatorInstruction) => `hooked-${url}`,
      { type: HookTypes.TransformToUrl });

    const hooked = sut.invokeTransformToUrl('testing', navigationInstruction) as string;
    assert.strictEqual(hooked, 'hooked-testing', `hooked`);

    await tearDown();
  });

  it('uses a TransformToUrl hook with alternating types', async function () {
    const { router, tearDown, navigationInstruction } = await setup();

    const sut = new HookManager();
    const hook = (input: string | ViewportInstruction[], navigationInstruction: INavigatorInstruction): string | ViewportInstruction[] =>
      typeof input === 'string' ? [router.createViewportInstruction(`hooked-${input}`)] : `hooked-${input[0].componentName}`;
    const str = 'testing';

    sut.addHook(hook, { type: HookTypes.TransformToUrl });

    let hooked: string | ViewportInstruction[] = sut.invokeTransformToUrl(str, navigationInstruction) as ViewportInstruction[];
    assert.strictEqual(hooked[0].componentName, `hooked-${str}`, `hooked`);

    sut.addHook(hook, { type: HookTypes.TransformToUrl });

    hooked = sut.invokeTransformToUrl(str, navigationInstruction) as string;
    assert.strictEqual(hooked, `hooked-hooked-${str}`, `hooked-hooked`);

    sut.addHook(hook, { type: HookTypes.TransformToUrl });

    hooked = sut.invokeTransformToUrl(str, navigationInstruction) as ViewportInstruction[];
    assert.strictEqual(hooked[0].componentName, `hooked-hooked-hooked-${str}`, `hooked-hooked-hooked`);

    sut.addHook(hook, { type: HookTypes.TransformToUrl });

    hooked = sut.invokeTransformToUrl(str, navigationInstruction) as string;
    assert.strictEqual(hooked, `hooked-hooked-hooked-hooked-${str}`, `hooked-hooked-hooked-hooked`);

    await tearDown();
  });

  it('uses a BeforeNavigation hook returning viewport instructions', async function () {
    const { router, tearDown, navigationInstruction } = await setup();

    const sut = new HookManager();
    sut.addHook((viewportInstructions: ViewportInstruction[], navigationInstruction: INavigatorInstruction) =>
      [router.createViewportInstruction(`hooked-${viewportInstructions[0].componentName}`)],
      { type: HookTypes.BeforeNavigation });

    const hooked = sut.invokeBeforeNavigation(
      [router.createViewportInstruction('testing')], navigationInstruction) as ViewportInstruction[];
    assert.strictEqual(hooked[0].componentName, 'hooked-testing', `hooked`);

    await tearDown();
  });

  it('uses a BeforeNavigation hook returning true', async function () {
    const { router, tearDown, navigationInstruction } = await setup();

    const sut = new HookManager();
    sut.addHook((viewportInstructions: ViewportInstruction[], navigationInstruction: INavigatorInstruction) => true,
      { type: HookTypes.BeforeNavigation });

    const hooked = sut.invokeBeforeNavigation(
      [router.createViewportInstruction('testing')], navigationInstruction) as ViewportInstruction[];
    assert.strictEqual(hooked[0].componentName, 'testing', `hooked`);

    await tearDown();
  });

  it('uses a BeforeNavigation hook returning false', async function () {
    const { router, tearDown, navigationInstruction } = await setup();

    const sut = new HookManager();
    sut.addHook((viewportInstructions: ViewportInstruction[], navigationInstruction: INavigatorInstruction) => false,
      { type: HookTypes.BeforeNavigation });

    const hooked = sut.invokeBeforeNavigation([router.createViewportInstruction('testing')], navigationInstruction) as boolean;
    assert.strictEqual(hooked, false, `hooked`);

    await tearDown();
  });

  it('sets a TransformToUrl hook with alternating types during initialization', async function () {
    const hookFunction = (input: string | ViewportInstruction[], navigationInstruction: INavigatorInstruction): string | ViewportInstruction[] =>
      typeof input === 'string' ? [router.createViewportInstruction(`hooked-${input}`)] : `hooked-${input[0].componentName}`;
    const hook = { hook: hookFunction, options: { type: HookTypes.TransformToUrl } };
    const { router, tearDown, navigationInstruction } = await setup({
      hooks: [hook, hook, hook],
    });

    const sut = router.hookManager;
    const str = 'testing';

    const hooked: string | ViewportInstruction[] = sut.invokeTransformToUrl(str, navigationInstruction) as ViewportInstruction[];
    assert.strictEqual(hooked[0].componentName, `hooked-hooked-hooked-${str}`, `hooked-hooked-hooked`);

    await tearDown();
  });

  it('sets a TransformToUrl hook with alternating types through api', async function () {
    const { router, tearDown, navigationInstruction } = await setup();

    const str = 'testing';

    let hooked: string | ViewportInstruction[] = router.hookManager.invokeTransformToUrl(str, navigationInstruction) as string;
    assert.strictEqual(hooked, `${str}`, `not hooked`);

    const hookFunction = (input: string | ViewportInstruction[], navigationInstruction: INavigatorInstruction): string | ViewportInstruction[] =>
      typeof input === 'string' ? [router.createViewportInstruction(`hooked-${input}`)] : `hooked-${input[0].componentName}`;

    router.addHook(hookFunction, { type: HookTypes.TransformToUrl });
    router.addHook(hookFunction, { type: HookTypes.TransformToUrl });
    router.addHook(hookFunction, { type: HookTypes.TransformToUrl });

    hooked = router.hookManager.invokeTransformToUrl(str, navigationInstruction) as ViewportInstruction[];
    assert.strictEqual(hooked[0].componentName, `hooked-hooked-hooked-${str}`, `hooked-hooked-hooked`);

    await tearDown();
  });

  it('can prevent navigation', async function () {
    const One = CustomElement.define({ name: 'one', template: '!one!', });
    const Two = CustomElement.define({ name: 'two', template: '!two!', });

    const { router, tearDown, scheduler, host } = await setup(undefined, undefined, [One, Two]);

    await $goto('one', router, scheduler);
    assert.strictEqual(host.textContent, `!one!`, `one`);

    await $goto('two', router, scheduler);
    assert.strictEqual(host.textContent, `!two!`, `two`);

    router.addHook((instructions: ViewportInstruction[], navigation: INavigatorInstruction) => {
      return false;
    }, { type: HookTypes.BeforeNavigation, include: ['two'] });

    await $goto('one', router, scheduler);
    assert.strictEqual(host.textContent, `!one!`, `one`);

    await $goto('two', router, scheduler);
    assert.strictEqual(host.textContent, `!one!`, `one`);

    await tearDown();
  });

  it('can redirect navigation', async function () {
    const One = CustomElement.define({ name: 'one', template: '!one!', });
    const Two = CustomElement.define({ name: 'two', template: '!two!', });
    const Three = CustomElement.define({ name: 'three', template: '!three!', });

    const { router, tearDown, scheduler, host } = await setup(undefined, undefined, [One, Two, Three]);

    await $goto('one', router, scheduler);
    assert.strictEqual(host.textContent, `!one!`, `one`);

    await $goto('two', router, scheduler);
    assert.strictEqual(host.textContent, `!two!`, `two`);

    router.addHook((instructions: ViewportInstruction[], navigation: INavigatorInstruction) => {
      return [router.createViewportInstruction('three', instructions[0].viewport)];
    }, { type: HookTypes.BeforeNavigation, include: ['two'] });

    await $goto('one', router, scheduler);
    assert.strictEqual(host.textContent, `!one!`, `one`);

    await $goto('two', router, scheduler);
    assert.strictEqual(host.textContent, `!three!`, `three`);

    await tearDown();
  });

});
