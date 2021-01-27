import { Constructable } from '@aurelia/kernel';
import { CustomElement, Aurelia, Blur, Focus } from '@aurelia/runtime-html';
import { assert, eachCartesianJoin, TestContext } from '@aurelia/testing';

describe('blur.integration.spec.ts', function () {

  // if (!PLATFORM.isBrowserLike) {
  //   return;
  // }

  interface IApp {
    hasFocus: boolean;
  }

  describe('>> with mouse', function () {
    describe('>> Basic scenarios', function () {
      // Note that from-view binding are not working at the moment
      // as blur has a guard to prevent unnecessary work,
      // it checks if value is already false and short circuit all checks
      const blurAttrs = [
        // 'blur.bind=hasFocus',
        'blur.two-way="hasFocus"',
        // 'blur.from-view=hasFocus',
        'blur="value.two-way: hasFocus"',
        // 'blur="value.bind: hasFocus"',
        // 'blur="value.from-view: hasFocus"'
      ];
      const normalUsageTestCases: IBlurTestCase[] = [
        {
          title: (blurAttr: string) => `\n>> Case 1 \n  >> Works in basic scenario with <div ${blurAttr}/>`,
          template: (blurrAttr) => `<template>
            <div ${blurrAttr}></div>
            <button>Click me to focus</button>
          </template>`,
          getFocusable: 'div',
          app: class App {
            public hasFocus = true;
          },
          async assertFn(ctx, testHost, component) {
            assert.equal(component.hasFocus, true, 'initial component.hasFocus');

            dispatchEventWith(ctx, ctx.doc, EVENTS.MouseDown);
            ctx.platform.domWriteQueue.flush();

            assert.equal(component.hasFocus, false, 'component.hasFocus');

            component.hasFocus = true;
            dispatchEventWith(ctx, ctx.wnd, EVENTS.MouseDown);
            ctx.platform.domWriteQueue.flush();

            assert.equal(component.hasFocus, true, 'window@mousedown -> Shoulda leave "hasFocus" alone as window is not listened to.');

            component.hasFocus = true;
            dispatchEventWith(ctx, ctx.doc.body, EVENTS.MouseDown);
            ctx.platform.domWriteQueue.flush();

            assert.equal(component.hasFocus, false, 'document.body@mousedown -> Shoulda set "hasFocus" to false when mousedown on doc body.');

            const button = testHost.querySelector('button');
            component.hasFocus = true;
            dispatchEventWith(ctx, button, EVENTS.MouseDown);
            ctx.platform.domWriteQueue.flush();

            assert.equal(component.hasFocus, false, '+ button@mousedown -> Shoulda set "hasFocus" to false when clicking element outside.');
          }
        },
        {
          title: (blurAttr) => `\n>> Case 2 \n  >> Works in basic scenario with <input ${blurAttr}/>`,
          template: (blurrAttr) => `<template>
            <input ${blurrAttr}>
            <button>Click me to focus</button>
          </template>`,
          getFocusable: 'input',
          app: class App {
            public hasFocus = true;
          },
          async assertFn(ctx, testHost, component) {
            assert.equal(component.hasFocus, true, 'initial component.hasFocus');

            dispatchEventWith(ctx, ctx.doc, EVENTS.MouseDown);
            ctx.platform.domWriteQueue.flush();

            assert.equal(component.hasFocus, false, 'document@mousedown -> Shoulda set "hasFocus" to false when mousedown on document.');

            component.hasFocus = true;
            dispatchEventWith(ctx, ctx.wnd, EVENTS.MouseDown);
            ctx.platform.domWriteQueue.flush();

            assert.equal(component.hasFocus, true, 'window@mousedown -> It should have been true. Ignore interaction out of document.');

            component.hasFocus = true;
            dispatchEventWith(ctx, ctx.doc.body, EVENTS.MouseDown);
            ctx.platform.domWriteQueue.flush();

            assert.equal(component.hasFocus, false, 'document.body@mousedown -> Shoulda been false. Interacted inside doc, outside element.');

            const button = testHost.querySelector('button');
            component.hasFocus = true;
            dispatchEventWith(ctx, button, EVENTS.MouseDown);
            ctx.platform.domWriteQueue.flush();

            assert.equal(component.hasFocus, false, '+ button@mousedown -> Shoulda been false. Interacted outside element.');
          }
        }
      ];

      eachCartesianJoin(
        [blurAttrs, normalUsageTestCases],
        (command, { title, template, getFocusable, app, assertFn }: IBlurTestCase) => {
          it(title(command), async function () {
            const { ctx, component, testHost, dispose } = await createFixture<IApp>(
              template(command),
              app
            );
            await assertFn(ctx, testHost, component, null);
            // test cases could be sharing the same context document
            // so wait a bit before running the next test
            await dispose();
          });
        }
      );
    });

    describe.skip('Abnormal scenarios', function () {
      const blurAttrs = [
        // 'blur.bind=hasFocus',
        'blur.two-way=hasFocus',
        // 'blur.from-view=hasFocus',
        'blur="value.two-way: hasFocus"',
        // 'blur="value.bind: hasFocus"',
        // 'blur="value.from-view: hasFocus"'
      ];
      const abnormalCases: IBlurTestCase[] = [
        {
          title: (callIndex: number, blurAttr: string) => `${callIndex}. Works in abnormal scenario with <div ${blurAttr}/> binding to "child > input" focus.two-way`,
          template: (blurrAttr) => `<template>
            <div ${blurrAttr}></div>
            <button>Click me to focus</button>
            <child value.two-way="hasFocus"></child>
          </template>`,
          getFocusable: 'div',
          app: class App {
            public hasFocus = true;
          },
          async assertFn(ctx, testHost, component) {
            const input = testHost.querySelector('input');
            assert.equal(input.isConnected, true);
            assert.equal(input, ctx.doc.activeElement, 'child > input === doc.activeElement (1)');
            assert.equal(component.hasFocus, true, 'initial component.hasFocus');

            input.blur();
            dispatchEventWith(ctx, input, EVENTS.Blur, false);
            ctx.platform.domWriteQueue.flush();

            assert.notEqual(input, ctx.doc.activeElement, 'child > input !== doc.activeElement');
            assert.equal(component.hasFocus, false, 'child > input@blur');

            dispatchEventWith(ctx, ctx.doc, EVENTS.MouseDown);
            ctx.platform.domWriteQueue.flush();

            assert.equal(component.hasFocus, false, 'document@mousedown');

            component.hasFocus = true;
            dispatchEventWith(ctx, ctx.wnd, EVENTS.MouseDown);
            ctx.platform.domWriteQueue.flush();

            assert.equal(component.hasFocus, false, 'window@mousedown');
            ctx.platform.domWriteQueue.flush();

            component.hasFocus = true;
            dispatchEventWith(ctx, ctx.doc.body, EVENTS.MouseDown);
            ctx.platform.domWriteQueue.flush();

            assert.equal(component.hasFocus, false, 'document.body@mousedown');

            const button = testHost.querySelector('button');
            component.hasFocus = true;
            dispatchEventWith(ctx, button, EVENTS.MouseDown);
            ctx.platform.domWriteQueue.flush();

            assert.equal(component.hasFocus, false, '+ button@mousedown');

            // this is quite convoluted
            // and failing unexpectedly, commented out for good
            component.hasFocus = true;
            input.focus();
            dispatchEventWith(ctx, input, EVENTS.Focus, false);
            ctx.platform.domWriteQueue.flush();
            // assert.equal(input, ctx.doc.activeElement, 'child > input === doc.activeElement (2)');
            // child input got focus
            // 1. blur got triggered -> hasFocus to false
            // 2. focus got triggered -> hasFocus to true
            assert.equal(component.hasFocus, true, 'child > input@focus');
          }
        },
      ];

      eachCartesianJoin(
        [blurAttrs, abnormalCases],
        (command, abnormalCase, callIndex) => {
          const { title, template, app, assertFn } = abnormalCase;
          it(title(callIndex, command), async function () {
            const { component, testHost, ctx, dispose } = await createFixture<IApp>(
              template(command),
              app,
              CustomElement.define(
                {
                  name: 'child',
                  template: '<input focus.two-way=value />',
                  bindables: ['value']
                },
                class Child {}
              )
            );
            await assertFn(ctx, testHost, component, null);
            await dispose();
          });
        }
      );
    });
  });

  describe('with shadowDOM', function () {
    const testCases: IBlurTestCase[] = [
      {
        title: (...args) => `works with event originating inside shadow dom`,
        template: () =>
          `
            <ce-a blur.two-way=aHasFocus><button class=slotted-btn>Slotted button</button></ce-a>
            <ce-b blur.two-way=bHasFocus><button class=slotted-btn>Slotted button</button></ce-b>
          `,
        dependencies: [
          CustomElement.define(
            {
              name: 'ce-a',
              template:
                `
                  <div blur.two-way=hasFocus><button>ce-b button</button><slot></slot></div>
                  <p>This is a p</p>
                `,
              shadowOptions: { mode: 'open' }
            },
            class CustomElementA {
              public hasFocus = true;
            }
          ),
          CustomElement.define(
            {
              name: 'ce-b',
              template:
                `
                  <div blur.two-way=hasFocus><button>ce-b button</button><slot></slot></div>
                  <p>this is a p</p>
                `,
              shadowOptions: { mode: 'open' }
            },
            class CustomElementB {
              public hasFocus = true;
            }
          )
        ],
        app: class App {
          public hasFocus: boolean = true;
          public aHasFocus: boolean = true;
          public bHasFocus: boolean = true;
        },
        assertFn: async (ctx, testHost, component: IApp & { aHasFocus: boolean; bHasFocus: boolean }, host) => {

          const $ceA: HTMLElement = host.querySelector('ce-a');
          const $ceB: HTMLElement = host.querySelector('ce-b');
          const ceA = CustomElement.for($ceA).viewModel as IApp;
          const ceB = CustomElement.for($ceB).viewModel as IApp;

          dispatchEventWith(ctx, host.querySelector('ce-a'), EVENTS.MouseDown);
          assert.equal(component.aHasFocus, true, '.aHasFocus === true');
          assert.equal(component.bHasFocus, false, '.bHasFocus === false');
          assert.equal(ceA.hasFocus, false, '<ce-a/>.hasFocus should have been false?');
          assert.equal(ceB.hasFocus, false, '<ce-b/>.hasFocus should have been false?');

          ceA.hasFocus = true;
          dispatchEventWith(ctx, $ceA.shadowRoot.querySelector('button'), EVENTS.MouseDown);
          ctx.platform.domWriteQueue.flush();

          assert.equal(ceA.hasFocus, true, '<ce-a/>.hasFocus should have been true?');

          $ceA.dispatchEvent(mockComposedEvent({
            ctx,
            eventName: EVENTS.MouseDown,
            target: $ceA,
            composedPath: [$ceA.shadowRoot.querySelector('p')]
          }));
          ctx.platform.domWriteQueue.flush();

          assert.equal(ceA.hasFocus, false, '<ce-a/>.hasFocus should have been false?');
          assert.equal(ceB.hasFocus, false, '<ce-b/>.hasFocus should have been false?');
        }
      }
    ];

    eachCartesianJoin(
      [testCases],
      ({ title, template, dependencies = [], app, assertFn }: IBlurTestCase) => {
        it(title(), async function () {
          const { ctx, component, testHost, dispose } = await createFixture<IApp>(
            template(''),
            app,
            ...dependencies
          );
          await assertFn(ctx, testHost, component, testHost);
          // test cases could be sharing the same context document
          // so wait a bit before running the next test
          await dispose();
        });
      }
    );
  });

  const enum EVENTS {
    MouseDown = 'mousedown',
    TouchStart = 'touchstart',
    PointerDown = 'pointerdown',
    Focus = 'focus',
    Blur = 'blur'
  }

  interface IBlurTestCase<T extends IApp = IApp> {
    template: TemplateFn;
    app: Constructable<T>;
    assertFn: AssertionFn;
    getFocusable?: string | ((doc: Document) => HTMLElement);
    dependencies?: Constructable[];
    title(...args: unknown[]): string;
  }

  async function createFixture<T>(template: string | Node, $class: Constructable | null, ...registrations: any[]) {
    const ctx = TestContext.create();
    const { container, observerLocator } = ctx;
    registrations = Array.from(new Set([...registrations, Blur, Focus]));
    container.register(...registrations);
    const testHost = ctx.doc.body.appendChild(ctx.createElement('div'));
    const appHost = testHost.appendChild(ctx.createElement('app'));
    const au = new Aurelia(container);
    const App = CustomElement.define({ name: 'app', template }, $class);
    const component = new App();

    au.app({ host: appHost, component });
    await au.start();

    return {
      ctx: ctx,
      au,
      container,
      testHost: testHost,
      appHost,
      component: component as T,
      observerLocator,
      dispose: async () => {
        await au.stop();
        testHost.remove();

        au.dispose();
      }
    };
  }

  function mockComposedEvent<T = any>(
    options: { ctx: TestContext; eventName: string; bubbles?: boolean; target: HTMLElement; composedPath: Node[] }
  ): CustomEvent<T> {
    const { ctx, eventName, target, composedPath, bubbles = true } = options;
    const e = new ctx.CustomEvent<T>(eventName, { bubbles });
    Object.defineProperties(e, {
      target: { value: target },
      composed: { value: true },
      composedPath: { value: () => composedPath }
    });
    return e;
  }

  function dispatchEventWith(ctx: TestContext, target: EventTarget, name: string, bubbles = true) {
    target.dispatchEvent(new ctx.Event(name, { bubbles }));
  }

  type TemplateFn = (focusAttrBindingCommand: string) => string;

  interface AssertionFn<T extends IApp = IApp> {
    // eslint-disable-next-line @typescript-eslint/prefer-function-type
    (ctx: TestContext, testHost: HTMLElement, component: T, focusable: HTMLElement): void | Promise<void>;
  }
});
