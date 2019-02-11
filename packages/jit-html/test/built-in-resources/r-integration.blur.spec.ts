import { Constructable } from '@aurelia/kernel';
import { Aurelia, CustomElementResource, BindingMode } from '@aurelia/runtime';
import { BlurCustomAttribute, FocusCustomAttribute, IEventManager } from '@aurelia/runtime-html';
import { expect } from 'chai';
import { HTMLTestContext, TestContext } from '../util';
import { eachCartesianJoin } from './util';

describe.only('built-in-resources.blur', () => {

  interface IApp {
    hasFocus: boolean;
  }

  let $aurelia: Aurelia;

  beforeEach(function() {
    $aurelia = undefined;
  });

  afterEach(function() {
    if ($aurelia) {
      try {
        $aurelia.stop();
      } catch {/**/}
    }
  });

  describe('with mouse', function() {
    describe('Basic scenarios', function() {
      // Note that from-view binding are not working at the moment
      // as blur has a guard to prevent unnecessary work,
      // it checks if value is already false and short circuit all checks
      const blurAttrs = [
        // 'blur.bind=hasFocus',
        'blur.two-way="hasFocus"',
        'blur.two-way=hasFocus',
        // 'blur.from-view=hasFocus',
        'blur="value.two-way: hasFocus"',
        // 'blur="value.bind: hasFocus"',
        // 'blur="value.from-view: hasFocus"'
      ];
      const normalUsageTestCases: ITestCase[] = [
        {
          title: (blurAttr: string) => `Works in basic scenario with <div ${blurAttr}/>`,
          template: (blurrAttr) => `<template>
            <div ${blurrAttr}></div>
            <button>Click me to focus</button>
          </template>`,
          getFocusable: 'div',
          app: class App {
            public hasFocus = true;
          },
          async assert(ctx, component) {
            expect(component.hasFocus, 'initial component.hasFocus').to.equal(true);

            createEventOn(ctx, ctx.doc, EVENTS.MouseDown);
            expect(component.hasFocus, 'component.hasFocus').to.equal(false);

            component.hasFocus = true;
            createEventOn(ctx, ctx.wnd, EVENTS.MouseDown);
            expect(component.hasFocus, 'window@mousedown').to.equal(true, 'Shoulda leave "hasFocus" alone as window is not listened to.');

            component.hasFocus = true;
            createEventOn(ctx, ctx.doc.body, EVENTS.MouseDown);
            expect(component.hasFocus, 'document.body@mousedown').to.equal(false, 'Shoulda set "hasFocus" to false when mousedown on doc body.');

            const button = ctx.doc.querySelector('button');
            component.hasFocus = true;
            createEventOn(ctx, button, EVENTS.MouseDown);
            expect(component.hasFocus, '+ button@mousedown').to.equal(false, 'Shoulda set "hasFocus" to false when clicking element outside.');
          }
        },
        {
          title: (blurAttr) => `Works in basic scenario with <input ${blurAttr}/>`,
          template: (blurrAttr) => `<template>
            <input ${blurrAttr}>
            <button>Click me to focus</button>
          </template>`,
          getFocusable: 'input',
          app: class App {
            public hasFocus = true;
          },
          async assert(ctx, component) {
            expect(component.hasFocus, 'initial component.hasFocus').to.equal(true);

            createEventOn(ctx, ctx.doc, EVENTS.MouseDown);
            expect(component.hasFocus, 'document@mousedown').to.equal(false, 'Shoulda set "hasFocus" to false when mousedown on document.');

            component.hasFocus = true;
            createEventOn(ctx, ctx.wnd, EVENTS.MouseDown);
            expect(component.hasFocus, 'window@mousedown').to.equal(true, 'It should have been true. Ignore interaction out of document.');

            component.hasFocus = true;
            createEventOn(ctx, ctx.doc.body, EVENTS.MouseDown);
            expect(component.hasFocus, 'document.body@mousedown').to.equal(false, 'Shoulda been false. Interacted inside doc, outside element.');

            const button = ctx.doc.querySelector('button');
            component.hasFocus = true;
            createEventOn(ctx, button, EVENTS.MouseDown);
            expect(component.hasFocus, '+ button@mousedown').to.equal(false, 'Shoulda been false. Interacted outside element.');
          }
        }
      ];

      eachCartesianJoin(
        [blurAttrs, normalUsageTestCases],
        (command, { title, template, getFocusable, app, assert }: ITestCase) => {
          it(title(command), async function() {
            const { ctx, au, component } = setup<IApp>(
              template(command),
              app
            );
            return assert(ctx, component, null);
          });
        }
      );
    });

    describe('Abnormal scenarios', function() {
      const blurAttrs = [
        // 'blur.bind=hasFocus',
        'blur.two-way=hasFocus',
        // 'blur.from-view=hasFocus',
        'blur="value.two-way: hasFocus"',
        // 'blur="value.bind: hasFocus"',
        // 'blur="value.from-view: hasFocus"'
      ];
      const abnormalCases: ITestCase[] = [
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
          async assert(ctx, component) {
            const input = ctx.doc.querySelector('input');
            expect(input.isConnected).to.equal(true);
            expect(input, 'child > input === doc.activeElement').to.equal(ctx.doc.activeElement);
            expect(component.hasFocus, 'initial component.hasFocus').to.equal(true);

            input.blur();
            createEventOn(ctx, input, 'blur', false);
            expect(input, 'child > input !== doc.activeElement').not.to.equal(ctx.doc.activeElement);
            expect(component.hasFocus, 'child > input@blur').to.equal(false);

            createEventOn(ctx, ctx.doc, EVENTS.MouseDown);
            expect(component.hasFocus, 'document@mousedown').to.equal(false);

            component.hasFocus = true;
            createEventOn(ctx, ctx.wnd, EVENTS.MouseDown);
            expect(component.hasFocus, 'window@mousedown').to.equal(true);

            component.hasFocus = true;
            createEventOn(ctx, ctx.doc.body, EVENTS.MouseDown);
            expect(component.hasFocus, 'document.body@mousedown').to.equal(false);

            const button = ctx.doc.querySelector('button');
            component.hasFocus = true;
            createEventOn(ctx, button, EVENTS.MouseDown);
            expect(component.hasFocus, '+ button@mousedown').to.equal(false);

            // this is quite convoluted
            component.hasFocus = true;
            input.focus();
            createEventOn(ctx, input, 'focus');
            expect(input, 'child > input === doc.activeElement').to.equal(ctx.doc.activeElement);
            expect(component.hasFocus, 'child > input@focus').to.equal(false);
          }
        },
      ];

      eachCartesianJoin(
        [blurAttrs, abnormalCases],
        (command, abnormalCase, callIndex) => {
          const { title, template, app, assert } = abnormalCase;
          it(title(callIndex, command), async function() {
            const { au, component, ctx } = setup<IApp>(
              template(command),
              app,
              CustomElementResource.define(
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
            return assert(ctx, component, null);
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

  interface ITestCase<T extends IApp = IApp> {
    template: TemplateFn;
    app: Constructable<T>;
    assert: AssertionFn;
    getFocusable: string | ((doc: Document) => HTMLElement);
    title(...args: unknown[]): string;
  }

  function setup<T>(template: string | Node, $class: Constructable | null, ...registrations: any[]) {
    const ctx = TestContext.createHTMLTestContext();
    const { container, lifecycle, observerLocator } = ctx;
    registrations = Array.from(new Set([...registrations, BlurCustomAttribute, FocusCustomAttribute]));
    container.register(...registrations);
    const bodyEl = ctx.doc.body;
    const host = ctx.doc.body.appendChild(ctx.createElement('app'));
    const au = new Aurelia(container);
    const App = CustomElementResource.define({ name: 'app', template }, $class);
    const component = new App();

    au.app({ host, component });
    au.start();
    au['stopTasks'].push(() => {
      au.stop();
      expect(lifecycle['flushCount']).to.equal(0);
      ctx.container.get(IEventManager).dispose();
      host.remove();
    });

    $aurelia = au;

    return { ctx: ctx, container, lifecycle, host, au, component: component as T, observerLocator };
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

  function createEventOn(ctx: HTMLTestContext, target: EventTarget, name: string, bubbles = true) {
    target.dispatchEvent(new ctx.CustomEvent(name, { bubbles }));
  }

  function waitForDelay(time = 0): Promise<void> {
    return new Promise(r => setTimeout(r, time));
  }

  type TemplateFn = (focusAttrBindingCommand: string) => string;

  interface AssertionFn<T extends IApp = IApp> {
    // tslint:disable-next-line:callable-types
    (ctx: HTMLTestContext, component: T, focusable: HTMLElement): void | Promise<void>;
  }
});
