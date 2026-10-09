import { Registration } from '@aurelia/kernel';
import { tasksSettled } from '@aurelia/runtime';
import {
  Aurelia,
  CustomAttribute,
  CustomElement,
  DeferConfiguration,
  ISSRContext,
  ShortHandBindingSyntax,
  type ISSRScope,
  type PartialCustomElementDefinition,
} from '@aurelia/runtime-html';
import {
  itHydrateTemplateController,
  type HydrateTemplateController,
  type IElementComponentDefinition,
} from '@aurelia/template-compiler';
import { assert, createFixture, PLATFORM, TestContext } from '@aurelia/testing';

describe('3-runtime-html/defer.spec.ts', function () {
  type Loader = () => Promise<unknown>;

  const wait = (ms: number) => new Promise<void>(resolve => setTimeout(resolve, ms));

  const HeavyChart = CustomElement.define(
    { name: 'heavy-chart', template: 'chart:${series}', bindables: ['series'] },
    class HeavyChart { },
  );
  const HeavyMap = CustomElement.define({ name: 'heavy-map', template: 'map' }, class HeavyMap { });

  /** A loader whose promise the test settles. */
  function createLoader<T = unknown>(module: T) {
    let settle: { resolve(): void; reject(err: unknown): void } | null = null;
    let calls = 0;
    const load: Loader = () => {
      ++calls;
      return new Promise((resolve, reject) => {
        settle = { resolve: () => resolve(module), reject };
      });
    };
    return {
      load,
      get calls() { return calls; },
      resolve() { settle!.resolve(); },
      reject(err: unknown) { settle!.reject(err); },
    };
  }

  /** Unobserved task queue errors are logged, which is how errors outside of a lifecycle surface. */
  async function captureReportedErrors(action: () => Promise<void>): Promise<unknown[]> {
    // The task queue logs to the global console, which is not the console of the JSDOM window in Node
    const $console = globalThis.console;
    const original = $console.error;
    const errors: unknown[] = [];
    $console.error = (error: unknown) => {
      errors.push(error);
    };
    try {
      await action();
      await wait(0);
    } finally {
      $console.error = original;
    }
    return errors;
  }

  function text(host: Element): string {
    return host.textContent!.replace(/\s+/g, ' ').trim();
  }

  function mockIdle() {
    const win = PLATFORM.window as unknown as { requestIdleCallback?: unknown; cancelIdleCallback?: unknown };
    const hadIdle = 'requestIdleCallback' in win;
    const originalRequest = win.requestIdleCallback;
    const originalCancel = win.cancelIdleCallback;
    const callbacks = new Map<number, IdleRequestCallback>();
    let id = 0;
    win.requestIdleCallback = (cb: IdleRequestCallback) => {
      callbacks.set(++id, cb);
      return id;
    };
    win.cancelIdleCallback = (handle: number) => {
      callbacks.delete(handle);
    };
    return {
      get pending() { return callbacks.size; },
      run(timeRemaining = 50) {
        const pending = Array.from(callbacks.values());
        callbacks.clear();
        let remaining = timeRemaining;
        for (const cb of pending) {
          cb({ didTimeout: false, timeRemaining: () => remaining-- > 0 ? remaining : 0 });
        }
      },
      restore() {
        if (hadIdle) {
          win.requestIdleCallback = originalRequest;
          win.cancelIdleCallback = originalCancel;
        } else {
          delete win.requestIdleCallback;
          delete win.cancelIdleCallback;
        }
      },
    };
  }

  class MockIntersectionObserver {
    public static instances: MockIntersectionObserver[] = [];
    public readonly targets = new Set<Element>();
    public disconnected = false;
    public constructor(
      public readonly callback: (entries: { isIntersecting: boolean; target: Element }[]) => void,
      public readonly options: { rootMargin?: string },
    ) {
      MockIntersectionObserver.instances.push(this);
    }
    public observe(el: Element) { this.targets.add(el); }
    public unobserve(el: Element) { this.targets.delete(el); }
    public disconnect() { this.targets.clear(); this.disconnected = true; }
    public intersect(el: Element, isIntersecting = true) {
      this.callback([{ isIntersecting, target: el }]);
    }
  }

  function mockIntersectionObserver() {
    const win = PLATFORM.window as Window & { IntersectionObserver?: unknown };
    const hadObserver = 'IntersectionObserver' in win;
    const original = win.IntersectionObserver;
    MockIntersectionObserver.instances = [];
    win.IntersectionObserver = MockIntersectionObserver;
    return {
      get instances() { return MockIntersectionObserver.instances; },
      restore() {
        if (hadObserver) {
          win.IntersectionObserver = original;
        } else {
          delete win.IntersectionObserver;
        }
      },
    };
  }

  function createDeferFixture<T extends object>(
    template: string,
    component?: T | (new () => T),
    registrations?: unknown[],
    rootElementDef?: Partial<PartialCustomElementDefinition>,
  ) {
    return createFixture(
      template,
      component,
      [DeferConfiguration, ...registrations ?? []],
      true,
      TestContext.create(),
      {},
      rootElementDef,
    );
  }

  describe('compilation', function () {
    function compile(template: string, rootDef: Partial<IElementComponentDefinition> = {}) {
      const ctx = TestContext.create();
      ctx.container.register(DeferConfiguration);
      return ctx.templateCompiler.compile({ name: 'app', type: 'custom-element', template, ...rootDef }, ctx.container);
    }

    function getDefer(def: IElementComponentDefinition, index = 0): HydrateTemplateController {
      const instruction = def.instructions![index][0] as HydrateTemplateController;
      assert.strictEqual(instruction.type, itHydrateTemplateController);
      return instruction;
    }

    function rawHtml(instruction: HydrateTemplateController): string {
      return (instruction.def.template as HTMLTemplateElement).innerHTML;
    }

    it('keeps the content raw and marks it for compilation', function () {
      const def = compile('<section defer="on: viewport" class="a" title.bind="title" @click="go()"><heavy-chart series.bind="s"></heavy-chart>${x}</section>');
      const defer = getDefer(def);

      assert.strictEqual(defer.def.needsCompile, true);
      assert.deepStrictEqual(defer.def.instructions, []);
      assert.strictEqual(
        rawHtml(defer),
        '<section class="a" title.bind="title" @click="go()"><heavy-chart series.bind="s"></heavy-chart>${x}</section>',
      );
      // the defer attribute itself is compiled into the shell
      assert.strictEqual(defer.props.length, 1);
    });

    it('keeps the order of the bindings of the host element', function () {
      const def = compile('<div a.bind="x" class="c" defer b.bind="y" e.trigger="z"></div>');

      assert.strictEqual(rawHtml(getDefer(def)), '<div class="c" a.bind="x" b.bind="y" e.trigger="z"></div>');
    });

    it('keeps as-element, containerless and captured attributes of the host element', function () {
      const ctx = TestContext.create();
      ctx.container.register(
        DeferConfiguration,
        CustomElement.define({ name: 'cap-el', capture: true }, class CapEl { }),
      );
      const def = ctx.templateCompiler.compile(
        { name: 'app', type: 'custom-element', template: '<cap-el defer foo.bind="x" containerless></cap-el><div as-element="cap-el" defer></div>' },
        ctx.container,
      );

      assert.strictEqual(rawHtml(getDefer(def, 0)), '<cap-el foo.bind="x" containerless=""></cap-el>');
      assert.strictEqual(rawHtml(getDefer(def, 1)), '<div as-element="cap-el"></div>');
    });

    it('does not run processContent of an element hosting a deferred block until the block compiles', async function () {
      let calls = 0;
      const Processed = CustomElement.define({
        name: 'processed-el',
        template: '<au-slot></au-slot>',
        processContent(node: HTMLElement) {
          ++calls;
          node.appendChild(node.ownerDocument.createTextNode('+'));
        },
      }, class Processed { });
      const idle = mockIdle();
      try {
        const { appHost } = createDeferFixture('<processed-el defer>a</processed-el>', {}, [Processed]);
        assert.strictEqual(calls, 0);

        idle.run();
        assert.strictEqual(calls, 1);
        assert.strictEqual(text(appHost), 'a+');
      } finally {
        idle.restore();
      }
    });

    it('lets a bindable named like a deferred template controller take the attribute', async function () {
      let calls = 0;
      const LazyImg = CustomElement.define({
        name: 'lazy-img',
        template: '${defer}<au-slot></au-slot>',
        bindables: ['defer'],
        processContent() {
          ++calls;
        },
      }, class LazyImg { });
      const { appHost } = createDeferFixture('<lazy-img defer="yes">a</lazy-img>', {}, [LazyImg]);

      assert.strictEqual(calls, 1);
      assert.strictEqual(text(appHost), 'yesa');
    });

    it('collects the loaders inside an element whose bindable is named like a deferred template controller', function () {
      const ctx = TestContext.create();
      ctx.container.register(
        DeferConfiguration,
        CustomElement.define({ name: 'lazy-img', template: '<au-slot></au-slot>', bindables: ['defer'] }, class { }),
      );
      const def = ctx.templateCompiler.compile({
        name: 'app',
        type: 'custom-element',
        template: '<div defer><lazy-img defer="yes"><heavy-chart></heavy-chart></lazy-img></div>',
        deferredDependencies: { 'heavy-chart': () => Promise.resolve() },
      }, ctx.container);

      assert.strictEqual(getDefer(def).deferredLoaders!.length, 1);
    });

    it('keeps the inner template controllers raw and compiles the outer ones', function () {
      const def = compile('<div if.bind="a" defer repeat.for="i of items">${i}</div>');
      const $if = getDefer(def);
      const defer = $if.def.instructions![0][0] as HydrateTemplateController;

      assert.strictEqual(($if.res as { name: string }).name, 'if');
      assert.strictEqual((defer.res as { name: string }).name, 'defer');
      assert.strictEqual(rawHtml(defer), '<div repeat.for="i of items">${i}</div>');
    });

    it('uses a <template> without other attributes as the raw template', function () {
      const def = compile('<br><template defer>a<b>${x}</b></template>');
      const defer = getDefer(def);

      assert.strictEqual(rawHtml(defer), 'a<b>${x}</b>');
    });

    it('wraps a <template> that has other attributes, so they are not compiled as surrogates', function () {
      const def = compile('<br><template defer if.bind="x">a</template>');
      const defer = getDefer(def);

      assert.strictEqual(rawHtml(defer), '<template if.bind="x">a</template>');
    });

    it('keeps attributes in debug mode out of the raw template only for template controllers', function () {
      const ctx = TestContext.create();
      ctx.container.register(DeferConfiguration);
      ctx.templateCompiler.debug = true;
      const def = ctx.templateCompiler.compile(
        { name: 'app', type: 'custom-element', template: '<div a.bind="b" if.bind="c" defer="idle" d.bind="e"></div>' },
        ctx.container,
      );
      const defer = getDefer(def).def.instructions![0][0] as HydrateTemplateController;

      assert.strictEqual(rawHtml(defer), '<div a.bind="b" d.bind="e"></div>');
    });

    it('hands each block only the loaders of the deferred dependencies it uses', function () {
      const chart = () => Promise.resolve({});
      const map = () => Promise.resolve({});
      const def = compile(
        '<div defer><heavy-chart></heavy-chart><heavy-chart></heavy-chart></div>'
        + '<div defer><template><heavy-map></heavy-map></template><div as-element="heavy-chart"></div></div>'
        + '<div defer>none</div>',
        { deferredDependencies: { 'heavy-chart': chart, 'heavy-map': map } },
      );

      assert.deepStrictEqual(getDefer(def, 0).deferredLoaders, [chart]);
      assert.deepStrictEqual(getDefer(def, 1).deferredLoaders, [map, chart]);
      assert.strictEqual(getDefer(def, 2).deferredLoaders, void 0);
    });

    it('leaves the dependencies of a nested block to that block', function () {
      const chart = () => Promise.resolve({});
      const map = () => Promise.resolve({});
      const def = compile(
        '<div defer><heavy-chart></heavy-chart><div defer="interaction"><heavy-map></heavy-map></div><heavy-map defer></heavy-map></div>',
        { deferredDependencies: { 'heavy-chart': chart, 'heavy-map': map } },
      );
      const defer = getDefer(def);

      assert.deepStrictEqual(defer.deferredLoaders, [chart]);
      assert.strictEqual(defer.def.deferredDependencies?.['heavy-map'], map);
    });

    it('leaves the native defer attribute of <script> alone', function () {
      const def = compile('<script defer src="a.js"></script><script defer.bind="isDeferred"></script>');

      assert.strictEqual(def.instructions!.length, 1);
      assert.notStrictEqual(def.instructions![0][0].type, itHydrateTemplateController);
      assert.strictEqual((def.template as HTMLTemplateElement).content.querySelector('script')!.hasAttribute('defer'), true);
    });

    it('does not treat a <script defer> inside a block as a nested block', function () {
      const def = compile('<div defer><script defer src="a.js"></script><heavy-chart></heavy-chart></div>', {
        deferredDependencies: { 'heavy-chart': () => Promise.resolve() },
      });

      assert.strictEqual(getDefer(def).deferredLoaders!.length, 1);
    });

    it('throws when a deferred dependency is used outside of a deferred block', function () {
      let error: Error | null = null;
      try {
        compile('<heavy-chart></heavy-chart>', { deferredDependencies: { 'heavy-chart': () => Promise.resolve({}) } });
      } catch (e) {
        error = e as Error;
      }
      assert.match(error?.message, /AUR0724/);
    });

    it('does not throw for a deferred dependency hosting the block itself', function () {
      const chart = () => Promise.resolve({});
      const def = compile('<heavy-chart defer series.bind="s"></heavy-chart>', { deferredDependencies: { 'heavy-chart': chart } });

      assert.deepStrictEqual(getDefer(def).deferredLoaders, [chart]);
    });
  });

  describe('rendering', function () {
    let idle: ReturnType<typeof mockIdle>;

    beforeEach(function () {
      idle = mockIdle();
    });

    afterEach(function () {
      idle.restore();
    });

    it('renders the placeholder, then the content once the browser is idle', function () {
      const { appHost } = createDeferFixture(
        '<div defer>content ${message}</div><div defer-placeholder>placeholder</div>',
        { message: 'hi' },
      );

      assert.strictEqual(text(appHost), 'placeholder');
      assert.strictEqual(idle.pending, 1);

      idle.run();
      assert.strictEqual(text(appHost), 'content hi');
    });

    it('shares one idle callback between blocks', function () {
      const { appHost } = createDeferFixture('<div repeat.for="i of 3"><div defer>${i}</div></div>');

      assert.strictEqual(text(appHost), '');
      assert.strictEqual(idle.pending, 1);

      idle.run();
      assert.strictEqual(text(appHost), '012');
    });

    it('leaves the rest of the idle queue for the next idle period when the deadline is reached', function () {
      const { appHost } = createDeferFixture('<div repeat.for="i of 3"><div defer>${i}</div></div>');

      idle.run(1);
      assert.strictEqual(text(appHost), '0');
      assert.strictEqual(idle.pending, 1);

      idle.run();
      assert.strictEqual(text(appHost), '012');
    });

    it('falls back to a timer when requestIdleCallback is not available', async function () {
      idle.restore();
      const win = PLATFORM.window as Window & { requestIdleCallback?: unknown };
      const original = win.requestIdleCallback;
      win.requestIdleCallback = void 0;
      try {
        const { appHost } = createDeferFixture('<div defer>content</div>');
        assert.strictEqual(text(appHost), '');

        await wait(20);
        assert.strictEqual(text(appHost), 'content');
      } finally {
        win.requestIdleCallback = original;
        idle = mockIdle();
      }
    });

    it('evaluates the content in the surrounding scope, including changes made before it rendered', async function () {
      const { appHost, component } = createDeferFixture(
        '<div defer>${message} <input value.bind="message"></div>',
        { message: 'a' },
      );
      component.message = 'b';
      await tasksSettled();

      idle.run();
      const input = appHost.querySelector('input')!;
      assert.strictEqual(text(appHost), 'b');
      assert.strictEqual(input.value, 'b');

      input.value = 'c';
      input.dispatchEvent(new PLATFORM.window.Event('change'));
      assert.strictEqual(component.message, 'c');
    });

    it('works inside repeat, with the repeat locals', function () {
      const { appHost } = createDeferFixture(
        '<br><template repeat.for="item of items"><div defer="immediate">${$index}:${item}</div><span defer-placeholder>p</span> </template>',
        { items: ['a', 'b'] },
      );

      assert.strictEqual(text(appHost), '0:a 1:b');
    });

    it('supports a <template> host', function () {
      const { appHost } = createDeferFixture('<br><template defer="immediate">a<b>${x}</b></template>', { x: 1 });

      assert.strictEqual(text(appHost), 'a1');
    });

    it('keeps an inner template controller working after it renders', async function () {
      const { appHost, component } = createDeferFixture('<div defer="immediate" if.bind="show">shown</div>', { show: false });

      assert.strictEqual(text(appHost), '');
      component.show = true;
      await tasksSettled();
      assert.strictEqual(text(appHost), 'shown');
    });

    it('keeps the listeners and bindings of the host element', function () {
      const { appHost, component } = createDeferFixture(
        '<button defer="immediate" class="a" title.bind="title" @click="clicked = true">b</button>',
        { title: 't', clicked: false },
        [ShortHandBindingSyntax],
      );
      const button = appHost.querySelector('button')!;

      assert.strictEqual(button.className, 'a');
      assert.strictEqual(button.title, 't');
      button.click();
      assert.strictEqual(component.clicked, true);
    });

    it('stays rendered, even if the triggers would fire again', async function () {
      const { appHost, component } = createDeferFixture('<div defer="when.bind: ready">content</div>', { ready: false });
      component.ready = true;
      await tasksSettled();
      assert.strictEqual(text(appHost), 'content');

      component.ready = false;
      await tasksSettled();
      assert.strictEqual(text(appHost), 'content');
    });

    it('does not arm the triggers when rendering on the server', function () {
      const { appHost } = createDeferFixture(
        '<div defer="immediate">content</div><div defer-placeholder>placeholder</div>',
        {},
        [Registration.instance(ISSRContext, { preserveMarkers: false })],
      );

      assert.strictEqual(text(appHost), 'placeholder');
      assert.strictEqual(idle.pending, 0);
    });

    it('releases the triggers of a block removed before it rendered', async function () {
      const io = mockIntersectionObserver();
      try {
        const loader = createLoader({ HeavyChart });
        const { appHost, component } = createDeferFixture(
          `<br><template if.bind="show">
            <div defer="on: viewport, interaction, hover, timer; delay: 10; load.bind: load"><heavy-chart></heavy-chart></div>
            <div defer-placeholder>placeholder</div>
            <div defer>idle</div>
          </template>`,
          { show: true, load: loader.load },
        );
        const placeholder = appHost.querySelector('div')!;
        assert.strictEqual(io.instances[0].targets.size, 1);
        assert.strictEqual(idle.pending, 1);

        component.show = false;
        await tasksSettled();

        assert.strictEqual(io.instances[0].targets.size, 0);
        assert.strictEqual(io.instances[0].disconnected, true);
        assert.strictEqual(idle.pending, 0);
        placeholder.dispatchEvent(new PLATFORM.window.Event('click'));
        placeholder.dispatchEvent(new PLATFORM.window.Event('mouseenter'));
        await wait(20);
        assert.strictEqual(loader.calls, 0);
        assert.strictEqual(text(appHost), '');
      } finally {
        io.restore();
      }
    });
  });

  describe('hydration', function () {
    it('adopts the placeholder rendered on the server', async function () {
      const idle = mockIdle();
      const AppElement = CustomElement.define({
        name: 'app',
        template: '<div defer>content ${message}</div><p defer-placeholder data-ssr>placeholder</p>',
      }, class App { public message = 'hi'; });

      const serverCtx = TestContext.create();
      serverCtx.container.register(DeferConfiguration, Registration.instance(ISSRContext, { preserveMarkers: true }));
      const serverHost = serverCtx.doc.body.appendChild(serverCtx.createElement('app'));
      const serverAu = new Aurelia(serverCtx.container).app({ host: serverHost, component: AppElement });
      let ssrMarkup: string;
      try {
        await serverAu.start();
        ssrMarkup = serverHost.innerHTML;
        assert.strictEqual(idle.pending, 0, 'the server does not arm triggers');
      } finally {
        await serverAu.stop(true);
        serverAu.dispose();
        serverHost.remove();
      }

      const clientCtx = TestContext.create();
      clientCtx.container.register(DeferConfiguration);
      const clientHost = clientCtx.doc.body.appendChild(clientCtx.createElement('app'));
      clientHost.innerHTML = ssrMarkup;
      const ssrPlaceholder = clientHost.querySelector('[data-ssr]');
      const ssrScope: ISSRScope = {
        name: 'app',
        children: [
          { type: 'defer', views: [{ nodeCount: 1, children: [] }] },
          { type: 'defer-placeholder', views: [] },
        ],
      };

      const clientAu = new Aurelia(clientCtx.container);
      try {
        await clientAu.hydrate({ host: clientHost, component: AppElement, ssrScope });
        assert.strictEqual(clientHost.querySelectorAll('[data-ssr]').length, 1);
        assert.strictEqual(clientHost.querySelector('[data-ssr]'), ssrPlaceholder, 'the server placeholder is adopted, not cloned');
        assert.strictEqual(text(clientHost), 'placeholder');

        idle.run();
        assert.strictEqual(text(clientHost), 'content hi');
      } finally {
        await clientAu.stop(true);
        clientAu.dispose();
        clientHost.remove();
        idle.restore();
      }
    });
  });

  describe('triggers', function () {
    let idle: ReturnType<typeof mockIdle>;
    let io: ReturnType<typeof mockIntersectionObserver>;

    beforeEach(function () {
      idle = mockIdle();
      io = mockIntersectionObserver();
    });

    afterEach(function () {
      idle.restore();
      io.restore();
    });

    it('viewport watches the first element of the placeholder', function () {
      const { appHost } = createDeferFixture(
        '<div defer="viewport">content</div><template defer-placeholder> <span>placeholder</span></template>',
      );
      const [observer] = io.instances;
      const span = appHost.querySelector('span')!;

      assert.strictEqual(observer.options.rootMargin, '0px');
      assert.deepStrictEqual(Array.from(observer.targets), [span]);

      observer.intersect(span, false);
      assert.strictEqual(text(appHost), 'placeholder');

      observer.intersect(span);
      assert.strictEqual(text(appHost), 'content');
      assert.strictEqual(observer.disconnected, true);
    });

    it('viewport shares one observer per root margin', function () {
      const { appHost } = createDeferFixture(
        `<template repeat.for="i of 3">
          <div defer="viewport">c\${i}</div><p defer-placeholder>p\${i}</p>
        </template>
        <div defer="on: viewport; margin: 200px">far</div><p defer-placeholder>p</p>`,
      );

      assert.strictEqual(io.instances.length, 2);
      const [shared, far] = io.instances;
      assert.strictEqual(shared.targets.size, 3);
      assert.strictEqual(far.options.rootMargin, '200px');

      const paragraphs = appHost.querySelectorAll('p');
      shared.intersect(paragraphs[1]);
      assert.strictEqual(text(appHost), 'p0 c1 p2 p');
      assert.strictEqual(shared.targets.size, 2);
      assert.strictEqual(shared.disconnected, false);
    });

    it('viewport watches the bound target', function () {
      const { appHost } = createDeferFixture(
        '<h2 ref="heading">title</h2><div defer="on: viewport; target.bind: heading">content</div>',
      );
      const [observer] = io.instances;
      const heading = appHost.querySelector('h2')!;

      assert.deepStrictEqual(Array.from(observer.targets), [heading]);
      observer.intersect(heading);
      assert.strictEqual(text(appHost), 'titlecontent');
    });

    it('viewport renders when idle when IntersectionObserver is not available', function () {
      io.restore();
      const win = PLATFORM.window as Window & { IntersectionObserver?: unknown };
      const original = win.IntersectionObserver;
      win.IntersectionObserver = void 0;
      try {
        const { appHost } = createDeferFixture('<div defer="viewport">content</div><p defer-placeholder>p</p>');
        assert.strictEqual(text(appHost), 'p');
        idle.run();
        assert.strictEqual(text(appHost), 'content');
      } finally {
        win.IntersectionObserver = original;
        io = mockIntersectionObserver();
      }
    });

    for (const [event, trigger] of [['click', 'interaction'], ['keydown', 'interaction'], ['mouseenter', 'hover'], ['focusin', 'hover']]) {
      it(`${trigger} renders on ${event}`, function () {
        const { appHost } = createDeferFixture(`<div defer="${trigger}">content</div><button defer-placeholder>load</button>`);
        const button = appHost.querySelector('button')!;

        button.dispatchEvent(new PLATFORM.window.Event(event === 'mouseenter' ? 'mouseover' : 'input'));
        assert.strictEqual(text(appHost), 'load');

        button.dispatchEvent(new PLATFORM.window.Event(event));
        assert.strictEqual(text(appHost), 'content');
      });
    }

    it('timer renders after the delay', async function () {
      const { appHost } = createDeferFixture('<div defer="on: timer; delay: 30">content</div>');

      await wait(5);
      assert.strictEqual(text(appHost), '');
      await wait(50);
      assert.strictEqual(text(appHost), 'content');
    });

    it('immediate renders after attaching', function () {
      const { appHost } = createDeferFixture('<div defer="immediate">content</div><p defer-placeholder>p</p>');

      assert.strictEqual(text(appHost), 'content');
    });

    it('when renders the first time the value is truthy, without a default trigger', async function () {
      const { appHost, component } = createDeferFixture('<div defer="when.bind: ready">content</div><p defer-placeholder>p</p>', { ready: false });

      assert.strictEqual(idle.pending, 0);
      assert.strictEqual(text(appHost), 'p');

      component.ready = true;
      await tasksSettled();
      assert.strictEqual(text(appHost), 'content');
    });

    it('when renders right away when it is truthy on attach', function () {
      const { appHost } = createDeferFixture('<div defer="when.bind: ready">content</div>', { ready: true });

      assert.strictEqual(text(appHost), 'content');
    });

    it('whichever of when and on fires first wins', async function () {
      const { appHost, component } = createDeferFixture(
        '<div defer="on: interaction; when.bind: ready">content</div><button defer-placeholder>load</button>',
        { ready: false },
      );
      appHost.querySelector('button')!.click();
      assert.strictEqual(text(appHost), 'content');

      component.ready = true;
      await tasksSettled();
      assert.strictEqual(text(appHost), 'content');
    });

    it('the first of several triggers wins and releases the others', function () {
      const { appHost } = createDeferFixture('<div defer="on: viewport, idle">content</div><p defer-placeholder>p</p>');
      const [observer] = io.instances;

      idle.run();
      assert.strictEqual(text(appHost), 'content');
      assert.strictEqual(observer.targets.size, 0);
      assert.strictEqual(observer.disconnected, true);
    });

    it('accepts an array of triggers', function () {
      const { appHost } = createDeferFixture('<div defer.bind="[\'idle\']">content</div>');

      idle.run();
      assert.strictEqual(text(appHost), 'content');
    });

    it('throws for an unknown trigger', function () {
      let error: Error | null = null;
      try {
        createDeferFixture('<div defer="scroll">content</div>');
      } catch (e) {
        error = e as Error;
      }
      assert.match(error?.message, /AUR0827: Unknown \[defer\] trigger "scroll" in <app>/);
    });

    it('throws when an element trigger has no element to watch', function () {
      let error: Error | null = null;
      try {
        createDeferFixture('<div defer="viewport">content</div>');
      } catch (e) {
        error = e as Error;
      }
      assert.match(error?.message, /AUR0826: The "viewport" trigger of \[defer\] in <app>/);
    });
  });

  describe('loading', function () {
    let idle: ReturnType<typeof mockIdle>;

    beforeEach(function () {
      idle = mockIdle();
    });

    afterEach(function () {
      idle.restore();
    });

    it('loads an element used in the block, then renders it', async function () {
      const loader = createLoader({ HeavyChart });
      const { appHost } = createDeferFixture(
        '<div defer="on: immediate; load.bind: load"><heavy-chart series.bind="series"></heavy-chart></div>',
        { load: loader.load, series: 's1' },
      );
      assert.strictEqual(loader.calls, 1);
      assert.strictEqual(text(appHost), '');

      loader.resolve();
      await tasksSettled();
      await wait(0);
      assert.strictEqual(text(appHost), 'chart:s1');
    });

    it('accepts several loaders, classes, registries and HTML modules', async function () {
      const StaticElement = class {
        public static $au = { type: 'custom-element', name: 'static-el', template: 'static' };
      };
      const htmlModule = {
        register(container: { register(...args: unknown[]): void }) {
          container.register(CustomElement.define({ name: 'html-el', template: 'html' }));
        },
      };
      const { appHost } = createDeferFixture(
        '<div defer="on: immediate; load.bind: loaders"><heavy-map></heavy-map> <static-el></static-el> <html-el></html-el></div>',
        {
          loaders: [
            () => Promise.resolve(HeavyMap),
            () => Promise.resolve({ StaticElement, notAResource: () => 1, config: { a: 1 } }),
            () => Promise.resolve(htmlModule),
          ],
        },
      );

      await wait(0);
      assert.strictEqual(text(appHost), 'map static html');
    });

    it('loads the deferred dependencies of the owning element', async function () {
      const chart = createLoader({ default: HeavyChart, HeavyChart });
      const map = createLoader({ HeavyMap });
      const { appHost } = createDeferFixture(
        '<div defer="immediate"><heavy-chart series.bind="1"></heavy-chart></div><div defer="when.bind: showMap"><heavy-map></heavy-map></div>',
        { showMap: false },
        [],
        { deferredDependencies: { 'heavy-chart': chart.load, 'heavy-map': map.load } },
      );
      assert.strictEqual(chart.calls, 1);
      assert.strictEqual(map.calls, 0);

      chart.resolve();
      await wait(0);
      assert.strictEqual(text(appHost), 'chart:1');
    });

    it('loads the dependencies of a nested block when that block renders', async function () {
      const chart = createLoader({ HeavyChart });
      const map = createLoader({ HeavyMap });
      const { appHost, component } = createDeferFixture(
        '<div defer="immediate"><heavy-chart></heavy-chart> <div defer="when.bind: showMap"><heavy-map></heavy-map></div></div>',
        { showMap: false },
        [],
        { deferredDependencies: { 'heavy-chart': chart.load, 'heavy-map': map.load } },
      );
      chart.resolve();
      await wait(0);
      assert.strictEqual(text(appHost), 'chart:');
      assert.strictEqual(map.calls, 0);

      component.showMap = true;
      await tasksSettled();
      assert.strictEqual(map.calls, 1);
      map.resolve();
      await wait(0);
      assert.strictEqual(text(appHost), 'chart: map');
    });

    it('shows the error branch when the loaded content fails to compile, and still reports it', async function () {
      let appHost: HTMLElement;
      const errors = await captureReportedErrors(async () => {
        ({ appHost } = createDeferFixture(
          '<div defer="immediate"><heavy-chart></heavy-chart></div><p defer-placeholder>p</p><p defer-error>${$defer.error.message}</p>',
          {},
          [],
          { deferredDependencies: { 'heavy-chart': () => Promise.resolve({ HeavyMap }) } },
        ));
        await wait(0);
      });

      assert.match(text(appHost!), /^AUR0724/);
      // invalid content is a mistake of the author, which the error branch alone would hide from them
      assert.strictEqual(errors.length, 1);
    });

    it('reports a failed load once when the block is attached again while it loads', async function () {
      const loader = createLoader({});
      let component: { show: boolean };
      let appHost: HTMLElement;
      const errors = await captureReportedErrors(async () => {
        ({ appHost, component } = createDeferFixture(
          '<div if.bind="show"><div defer="on: immediate; load.bind: load">content</div></div>',
          { show: true, load: loader.load },
        ));
        component.show = false;
        await tasksSettled();
        component.show = true;
        await tasksSettled();
        loader.reject(new Error('offline'));
        await wait(0);
      });

      assert.strictEqual(loader.calls, 1);
      assert.strictEqual(errors.length, 1);
      assert.strictEqual(text(appHost!), '');
    });

    it('reports a loaded module that does not define the deferred element', async function () {
      let appHost: HTMLElement;
      const errors = await captureReportedErrors(async () => {
        ({ appHost } = createDeferFixture(
          '<div defer="immediate"><heavy-chart></heavy-chart></div>',
          {},
          [],
          { deferredDependencies: { 'heavy-chart': () => Promise.resolve({ HeavyMap }) } },
        ));
        await wait(0);
      });

      assert.strictEqual(errors.length, 1);
      // the error names the element whose template has the block, not a generated name
      assert.match((errors[0] as Error).message, /AUR0724: Template compilation error in element "app": <heavy-chart>/);
      assert.strictEqual(text(appHost!), '');
    });

    it('keeps the order of custom attributes on the host element', function () {
      const order: string[] = [];
      const A = CustomAttribute.define('ca-a', class { public binding() { order.push('a'); } });
      const B = CustomAttribute.define('ca-b', class { public binding() { order.push('b'); } });
      createDeferFixture('<div ca-a defer="immediate" ca-b></div>', {}, [A, B]);

      assert.deepStrictEqual(order, ['a', 'b']);
    });

    it('prefetch loads without rendering, and the trigger reuses the load', async function () {
      const loader = createLoader({ HeavyChart });
      const { appHost } = createDeferFixture(
        '<div defer="on: interaction; prefetch: idle; load.bind: load"><heavy-chart></heavy-chart></div><button defer-placeholder>load</button>',
        { load: loader.load },
      );
      assert.strictEqual(loader.calls, 0);

      idle.run();
      assert.strictEqual(loader.calls, 1);
      loader.resolve();
      await wait(0);
      assert.strictEqual(text(appHost), 'load');

      appHost.querySelector('button')!.click();
      assert.strictEqual(loader.calls, 1);
      assert.strictEqual(text(appHost), 'chart:');
    });

    it('does not arm prefetch triggers when the block renders while arming', function () {
      createDeferFixture('<div defer="on: immediate; prefetch: idle">content</div>');

      assert.strictEqual(idle.pending, 0);
    });

    it('does not load anything for a block removed before its trigger fired', async function () {
      const loader = createLoader({ HeavyChart });
      const { component } = createDeferFixture(
        '<div if.bind="show"><div defer="load.bind: load"><heavy-chart></heavy-chart></div></div>',
        { show: true, load: loader.load },
      );
      component.show = false;
      await tasksSettled();

      idle.run();
      assert.strictEqual(loader.calls, 0);
    });

    it('renders once attached again when it was detached while loading', async function () {
      const loader = createLoader({ HeavyChart });
      const { appHost, component } = createDeferFixture(
        '<div if.bind="show"><div defer="on: immediate; load.bind: load"><heavy-chart></heavy-chart></div><p defer-placeholder>p</p></div>',
        { show: true, load: loader.load },
      );
      component.show = false;
      await tasksSettled();
      loader.resolve();
      await wait(0);
      assert.strictEqual(text(appHost), '');

      component.show = true;
      await tasksSettled();
      assert.strictEqual(text(appHost), 'chart:');
      assert.strictEqual(loader.calls, 1);
    });

    it('supports local elements and au-slot projections inside the block', async function () {
      const Card = CustomElement.define({ name: 'my-card', template: '[<au-slot name="title"></au-slot>]' }, class Card { });
      const { appHost } = createDeferFixture(
        `<template as-custom-element="local-el">local:\${value}<bindable name="value"></bindable></template>
        <div defer="immediate"><local-el value.bind="v"></local-el> <my-card><b au-slot="title">\${v}</b></my-card></div>`,
        { v: 'x' },
        [Card],
      );

      assert.strictEqual(text(appHost), 'local:x [x]');
    });
  });

  describe('branches', function () {
    let idle: ReturnType<typeof mockIdle>;

    beforeEach(function () {
      idle = mockIdle();
    });

    afterEach(function () {
      idle.restore();
    });

    it('shows the loading branch while loading, then the content', async function () {
      const loader = createLoader({ HeavyChart });
      const { appHost } = createDeferFixture(
        `<div defer="on: immediate; load.bind: load"><heavy-chart></heavy-chart></div>
        <p defer-placeholder>placeholder</p>
        <p defer-loading>loading</p>`,
        { load: loader.load },
      );
      assert.strictEqual(text(appHost), 'loading');

      loader.resolve();
      await wait(0);
      assert.strictEqual(text(appHost), 'chart:');
    });

    it('skips the loading branch when loading takes less than "after"', async function () {
      const loader = createLoader({ HeavyChart });
      const { appHost } = createDeferFixture(
        `<div defer="on: immediate; load.bind: load"><heavy-chart></heavy-chart></div>
        <p defer-placeholder>placeholder</p>
        <p defer-loading="after: 50">loading</p>`,
        { load: loader.load },
      );
      assert.strictEqual(text(appHost), 'placeholder');

      await wait(5);
      loader.resolve();
      await wait(0);
      assert.strictEqual(text(appHost), 'chart:');

      await wait(70);
      assert.strictEqual(text(appHost), 'chart:');
    });

    it('keeps the loading branch up for at least "minimum"', async function () {
      const loader = createLoader({ HeavyChart });
      const { appHost } = createDeferFixture(
        `<div defer="on: immediate; load.bind: load"><heavy-chart></heavy-chart></div>
        <p defer-loading="after: 10; minimum: 80">loading</p>`,
        { load: loader.load },
      );
      assert.strictEqual(text(appHost), '');

      await wait(30);
      assert.strictEqual(text(appHost), 'loading');
      loader.resolve();
      await wait(10);
      assert.strictEqual(text(appHost), 'loading');

      await wait(80);
      assert.strictEqual(text(appHost), 'chart:');
    });

    it('does not show the loading branch when there is nothing to load', function () {
      const { appHost } = createDeferFixture('<div defer="immediate">content</div><p defer-loading>loading</p>');

      assert.strictEqual(text(appHost), 'content');
    });

    it('shows the error branch when loading fails, and retries', async function () {
      const loader = createLoader({ HeavyChart });
      const { appHost } = createDeferFixture(
        `<div defer="on: immediate; load.bind: load"><heavy-chart></heavy-chart></div>
        <p defer-loading>loading</p>
        <div defer-error>failed: \${$defer.error.message} <button click.trigger="$defer.retry()">retry</button></div>`,
        { load: loader.load },
      );
      loader.reject(new Error('offline'));
      await wait(0);
      assert.strictEqual(text(appHost), 'failed: offline retry');

      appHost.querySelector('button')!.click();
      assert.strictEqual(loader.calls, 2);
      assert.strictEqual(text(appHost), 'loading');

      loader.resolve();
      await wait(0);
      assert.strictEqual(text(appHost), 'chart:');
    });

    it('reports a failed load when there is no error branch', async function () {
      let appHost: HTMLElement;
      const errors = await captureReportedErrors(async () => {
        ({ appHost } = createDeferFixture(
          '<div defer="on: immediate; load.bind: load">content</div><p defer-placeholder>p</p>',
          { load: () => Promise.reject(new Error('offline')) },
        ));
        await wait(0);
      });

      assert.strictEqual(errors.length, 1);
      // the report says which block failed, and keeps the original error as its cause
      const error = errors[0] as Error;
      assert.match(error.message, /AUR0829: \[defer\] in <app> failed to load its dependencies: offline/);
      assert.strictEqual((error.cause as Error).message, 'offline');
      // a placeholder or loading branch left up would suggest the content is still coming
      assert.strictEqual(text(appHost!), '');
    });

    it('reports a loader that throws synchronously through the error branch', async function () {
      const { appHost } = createDeferFixture(
        '<div defer="on: immediate; load.bind: load">content</div><p defer-error>${$defer.error.message}</p>',
        { load: () => { throw new Error('sync'); } },
      );
      await wait(0);

      assert.strictEqual(text(appHost), 'sync');
    });

    it('exposes the state of the block to its branches', async function () {
      const loader = createLoader({ HeavyChart });
      const { appHost, component } = createDeferFixture(
        `<div defer="when.bind: go; load.bind: load"><heavy-chart></heavy-chart></div>
        <p defer-placeholder>\${$defer.state}</p>
        <p defer-loading>\${$defer.state}</p>
        <p defer-error>\${$defer.state}</p>`,
        { load: loader.load, go: false },
      );
      assert.strictEqual(text(appHost), 'placeholder');

      component.go = true;
      await tasksSettled();
      assert.strictEqual(text(appHost), 'loading');

      loader.reject(new Error('offline'));
      await wait(0);
      assert.strictEqual(text(appHost), 'error');
    });

    it('rejects a load that is not a function, such as a promise', async function () {
      const { appHost } = createDeferFixture(
        '<div defer="on: immediate; load.bind: load">content</div><p defer-error>${$defer.error.message}</p>',
        { load: Promise.resolve({ HeavyChart }) },
      );
      await wait(0);

      assert.match(text(appHost), /AUR0828: The "load" of \[defer\] in <app> must be a function.*Received: a promise/);
    });

    it('warns in development when a loader registers nothing', async function () {
      const warnings: unknown[] = [];
      const original = globalThis.console.warn;
      globalThis.console.warn = (message: unknown) => { warnings.push(message); };
      try {
        const { appHost } = createDeferFixture(
          '<div defer="on: immediate; load.bind: load">content</div>',
          { load: [() => Promise.resolve({ helper: () => 1 }), () => Promise.resolve()] },
        );
        await wait(0);
        assert.strictEqual(text(appHost), 'content');
      } finally {
        globalThis.console.warn = original;
      }

      assert.strictEqual(warnings.length, 2);
      assert.match(warnings[0] as string, /A module loaded by \[defer\] in <app> exports no resources/);
      assert.match(warnings[1] as string, /A loader of \[defer\] in <app> resolved to undefined/);
    });

    it('does not leak $defer into the surrounding scope', function () {
      const { appHost } = createDeferFixture(
        '<div defer="when.bind: false">content</div><p defer-placeholder>${$defer === undefined} ${message}</p><p>${$defer === undefined}</p>',
        { message: 'm' },
      );

      assert.strictEqual(text(appHost), 'false mtrue');
    });

    it('throws when a branch does not follow a defer', function () {
      let error: Error | null = null;
      try {
        createDeferFixture('<div defer-placeholder>p</div>');
      } catch (e) {
        error = e as Error;
      }
      assert.match(error?.message, /AUR0825/);
    });

    it('explains that a template controller before defer hides it from the branches', function () {
      let error: Error | null = null;
      try {
        createDeferFixture('<div if.bind="true" defer="when.bind: false">content</div><p defer-placeholder>p</p>');
      } catch (e) {
        error = e as Error;
      }
      assert.match(error?.message, /AUR0825: .*such as \[if\], wraps it/);
    });

    it('keeps the error until a retry settles', async function () {
      const loader = createLoader({ HeavyChart });
      const { appHost } = createDeferFixture(
        `<div defer="on: immediate; load.bind: load"><heavy-chart></heavy-chart></div>
        <div defer-error>\${$defer.state}: \${$defer.error.message} <button click.trigger="$defer.retry()">retry</button></div>`,
        { load: loader.load },
      );
      loader.reject(new Error('offline'));
      await wait(0);
      assert.strictEqual(text(appHost), 'error: offline retry');

      // without a loading branch the error branch stays up, and should not go blank
      appHost.querySelector('button')!.click();
      await tasksSettled();
      assert.strictEqual(text(appHost), 'loading: offline retry');

      loader.resolve();
      await wait(0);
      assert.strictEqual(text(appHost), 'chart:');
    });

    it('links a branch that follows another branch', function () {
      const { appHost } = createDeferFixture(
        '<div defer="when.bind: false">content</div><p defer-loading>loading</p><p defer-placeholder>placeholder</p>',
      );

      assert.strictEqual(text(appHost), 'placeholder');
    });
  });
});
