import { Constructable, PLATFORM } from '@aurelia/kernel';
import { Aurelia, CustomElement } from '@aurelia/runtime';
import { Blur, BlurManager, Focus, IEventManager, DOM } from '@aurelia/runtime-html';
import { assert, createSpy, eachCartesianJoin, HTMLTestContext, TestContext } from '@aurelia/testing';

describe('blur.integration.spec.ts', () => {

  interface IApp {
    hasFocus: boolean;
  }

  describe('>> with mouse', function() {
    describe('>> Basic scenarios', function() {
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
          async assertFn(ctx, component) {
            assert.equal(component.hasFocus, true, 'initial component.hasFocus');

            dispatchEventWith(ctx, ctx.doc, EVENTS.MouseDown);
            assert.equal(component.hasFocus, false, 'component.hasFocus');
            await waitForFrames(ctx, 1);

            component.hasFocus = true;
            dispatchEventWith(ctx, ctx.wnd, EVENTS.MouseDown);
            assert.equal(component.hasFocus, true, 'window@mousedown -> Shoulda leave "hasFocus" alone as window is not listened to.');
            await waitForFrames(ctx, 1);

            component.hasFocus = true;
            dispatchEventWith(ctx, ctx.doc.body, EVENTS.MouseDown);
            assert.equal(component.hasFocus, false, 'document.body@mousedown -> Shoulda set "hasFocus" to false when mousedown on doc body.');
            await waitForFrames(ctx, 1);

            const button = ctx.doc.querySelector('button');
            component.hasFocus = true;
            dispatchEventWith(ctx, button, EVENTS.MouseDown);
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
          async assertFn(ctx, component) {
            assert.equal(component.hasFocus, true, 'initial component.hasFocus');

            dispatchEventWith(ctx, ctx.doc, EVENTS.MouseDown);
            assert.equal(component.hasFocus, false, 'document@mousedown -> Shoulda set "hasFocus" to false when mousedown on document.');
            await waitForFrames(ctx, 1);

            component.hasFocus = true;
            dispatchEventWith(ctx, ctx.wnd, EVENTS.MouseDown);
            assert.equal(component.hasFocus, true, 'window@mousedown -> It should have been true. Ignore interaction out of document.');
            await waitForFrames(ctx, 1);

            component.hasFocus = true;
            dispatchEventWith(ctx, ctx.doc.body, EVENTS.MouseDown);
            assert.equal(component.hasFocus, false, 'document.body@mousedown -> Shoulda been false. Interacted inside doc, outside element.');
            await waitForFrames(ctx, 1);

            const button = ctx.doc.querySelector('button');
            component.hasFocus = true;
            dispatchEventWith(ctx, button, EVENTS.MouseDown);
            assert.equal(component.hasFocus, false, '+ button@mousedown -> Shoulda been false. Interacted outside element.');
          }
        }
      ];

      eachCartesianJoin(
        [blurAttrs, normalUsageTestCases],
        (command, { title, template, getFocusable, app, assertFn }: IBlurTestCase) => {
          it(title(command), async function() {
            const { ctx, au, component, dispose } = setup<IApp>(
              template(command),
              app
            );
            await assertFn(ctx, component, null);
            // test cases could be sharing the same context document
            // so wait a bit before running the next test
            await waitForFrames(ctx, 2);
            await dispose();
          });
        }
      );
    });

    describe.skip('Abnormal scenarios', function() {
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
          async assertFn(ctx, component) {
            const input = ctx.doc.querySelector('input');
            assert.equal(input.isConnected, true);
            assert.equal(input, ctx.doc.activeElement, 'child > input === doc.activeElement');
            assert.equal(component.hasFocus, true, 'initial component.hasFocus');

            input.blur();
            dispatchEventWith(ctx, input, 'blur', false);
            assert.notEqual(input, ctx.doc.activeElement, 'child > input !== doc.activeElement');
            assert.equal(component.hasFocus, false, 'child > input@blur');

            dispatchEventWith(ctx, ctx.doc, EVENTS.MouseDown);
            assert.equal(component.hasFocus, false, 'document@mousedown');

            component.hasFocus = true;
            dispatchEventWith(ctx, ctx.wnd, EVENTS.MouseDown);
            assert.equal(component.hasFocus, true, 'window@mousedown');

            component.hasFocus = true;
            dispatchEventWith(ctx, ctx.doc.body, EVENTS.MouseDown);
            assert.equal(component.hasFocus, false, 'document.body@mousedown');

            const button = ctx.doc.querySelector('button');
            component.hasFocus = true;
            dispatchEventWith(ctx, button, EVENTS.MouseDown);
            assert.equal(component.hasFocus, false, '+ button@mousedown');

            // this is quite convoluted
            component.hasFocus = true;
            input.focus();
            dispatchEventWith(ctx, input, 'focus');
            assert.equal(input, ctx.doc.activeElement, 'child > input === doc.activeElement');
            assert.equal(component.hasFocus, false, 'child > input@focus');
          }
        },
      ];

      eachCartesianJoin(
        [blurAttrs, abnormalCases],
        (command, abnormalCase, callIndex) => {
          const { title, template, app, assertFn } = abnormalCase;
          it(title(callIndex, command), async function() {
            const { au, component, ctx, dispose } = setup<IApp>(
              template(command),
              app,
              CustomElement.define(
                {
                  name: 'child',
                  template: '<template><input focus.two-way="value" /></template>'
                },
                class Child {
                  public static bindables = {
                    value: { property: 'value', attribute: 'value' }
                  };
                }
              )
            );
            await assertFn(ctx, component, null);
            await dispose();
          });
        }
      );
    });
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
    getFocusable: string | ((doc: Document) => HTMLElement);
    title(...args: unknown[]): string;
  }

  function setup<T>(template: string | Node, $class: Constructable | null, ...registrations: any[]) {
    const ctx = TestContext.createHTMLTestContext();
    const { container, lifecycle, observerLocator } = ctx;
    registrations = Array.from(new Set([...registrations, Blur, Focus]));
    container.register(...registrations);
    const bodyEl = ctx.doc.body;
    const host = bodyEl.appendChild(ctx.createElement('app'));
    const au = new Aurelia(container);
    const App = CustomElement.define({ name: 'app', template }, $class);
    const component = new App();

    au.app({ host, component });
    au.start();

    return {
      ctx: ctx,
      au,
      container,
      lifecycle,
      host,
      component: component as T,
      observerLocator,
      dispose: async () => {
        await au.stop().wait();
        host.remove();
      }
    };
  }

  function defineCustomElement(name: string, template: string, props: Record<string, any> = null, mode: 'open' | 'closed' | null = 'open') {
    class CustomEl extends HTMLElement {
      constructor() {
        super();
        if (mode !== null) {
          this.attachShadow({ mode }).innerHTML = template;
        } else {
          this.innerHTML = template;
        }
        for (const p in props) {
          this[p] = props[p];
        }
      }
    }
    customElements.define(name, CustomEl);
    return CustomEl;
  }

  function dispatchEventWith(ctx: HTMLTestContext, target: EventTarget, name: string, bubbles = true) {
    target.dispatchEvent(new ctx.Event(name, { bubbles }));
  }

  function waitForDelay(time = 0): Promise<void> {
    return new Promise(r => setTimeout(r, time));
  }

  async function waitForFrames(ctx: HTMLTestContext, frameCount: number): Promise<void> {
    while (frameCount-- > 0) {
      await new Promise(r => ctx.wnd.requestAnimationFrame(r));
    }
  }

  type TemplateFn = (focusAttrBindingCommand: string) => string;

  interface AssertionFn<T extends IApp = IApp> {
    // tslint:disable-next-line:callable-types
    (ctx: HTMLTestContext, component: T, focusable: HTMLElement): void | Promise<void>;
  }
});
