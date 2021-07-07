import { Constructable } from '@aurelia/kernel';
import { CustomElement, Aurelia, Focus } from '@aurelia/runtime-html';
import { PLATFORM, assert, eachCartesianJoin, TestContext } from '@aurelia/testing';

describe('focus.spec.ts', function () {
  // there are focus/blur API that won't work with JSDOM
  // example of error thrown:
  // Error: Not implemented: window.blur
  // at module.exports (/home/circleci/repo/node_modules/jsdom/lib/jsdom/browser/not-implemented.js:9:17)
  // at Window.blur (/home/circleci/repo/node_modules/jsdom/lib/jsdom/browser/Window.js:563:7)
  // at assertionFn (file:///home/circleci/repo/packages/__tests__/dist/esm/__tests__/3-runtime-html/focus.spec.js:231:25)
  // at Context.<anonymous> (file:///home/circleci/repo/packages/__tests__/dist/esm/__tests__/3-runtime-html/focus.spec.js:282:23) undefined
  if (typeof process !== 'undefined') {
    return;
  }

  interface IApp {
    hasFocus?: boolean;
    isFocused?: boolean;
    isFocused2?: boolean;
    selectedOption?: string;
  }

  describe('basic scenarios', function () {

    describe('with non-focusable element', function () {
      it('focuses when there is tabindex attribute', async function () {
        const { startPromise, testHost, dispose, component, ctx } = createFixture<IApp>(
          `<template>
            <div focus.two-way="hasFocus" id="blurred" tabindex="-1"></div>
          </template>`,
          class App {
            public hasFocus = true;
          }
        );
        await startPromise;

        const activeElement = ctx.doc.activeElement;
        const div = testHost.querySelector('app div');
        assert.notEqual(div, null, '<app/> <div/> not null');
        assert.equal(activeElement.tagName, 'DIV', 'activeElement === <div/>');
        assert.equal(activeElement, div, 'activeElement === <div/>');
        assert.equal(component.hasFocus, true, 'It should not have affected component.hasFocus');

        await dispose();
      });
    });

    it('invokes focus when there is **NO** tabindex attribute', async function () {
      let callCount = 0;
      PLATFORM.window.HTMLDivElement.prototype.focus = function () {
        callCount++;
        return PLATFORM.HTMLElement.prototype.focus.call(this);
      };

      const { startPromise, testHost, dispose, component, ctx } = createFixture<IApp>(
        `<template>
          <div focus.two-way="hasFocus" id="blurred"></div>
        </template>`,
        class App {
          public hasFocus = true;
        }
      );
      await startPromise;

      const activeElement = ctx.doc.activeElement;
      const div = testHost.querySelector('app div');
      assert.equal(callCount, 1, 'It should have invoked focus on DIV element prototype');
      assert.notEqual(div, null, '<app/> <div/> should not be null');
      assert.notEqual(activeElement.tagName, 'DIV');
      assert.notEqual(activeElement, div);
      assert.equal(component.hasFocus, true, 'It should not have affected component.hasFocus');

      // focus belongs to HTMLElement class
      delete PLATFORM.window.HTMLDivElement.prototype.focus;

      await dispose();
    });

    const specs = [
      ['<input/>', `<input focus.two-way=hasFocus id=blurred>`],
      ['<select/>', `<select focus.two-way=hasFocus id=blurred></select>`],
      ['<button/>', '<button focus.two-way=hasFocus id=blurred></button>'],
      ['<video/>', '<video tabindex=1 focus.two-way=hasFocus id=blurred></video>'],
      ['<select/> + <option/>', `<select focus.two-way=hasFocus id=blurred><option tabindex=1>Hello</option></select>`],
      ['<textarea/>', `<textarea focus.two-way=hasFocus id=blurred></textarea>`]
    ];
    if (!PLATFORM.navigator.userAgent.includes('jsdom')) {
      specs.push(['<div/>', '<div contenteditable focus.two-way=hasFocus id=blurred></div>']);
    }
    for (const [desc, template] of specs) {
      describe(`with ${desc}`, function () {
        it('Works in basic scenario', async function () {
          const { startPromise, testHost, dispose, component, ctx } = createFixture<IApp>(
            `<template>
              ${template}
            </template>`,
            class App {
              public hasFocus = true;
            }
          );
          await startPromise;

          const elName = desc.replace(/^<|\/>.*$/g, '');
          const activeElement = ctx.doc.activeElement;
          const focusable = testHost.querySelector(`app ${elName}`);
          assert.notEqual(focusable, null, `focusable el (<${elName}/>) is not null`);
          assert.equal(activeElement.tagName, elName.toUpperCase());
          assert.equal(activeElement, focusable);
          assert.equal(component.hasFocus, true, 'It should not have affected component.hasFocus');

          await dispose();
        });
      });
    }

    // Doesn't seem to be implemented yet in JSDOM
    if (PLATFORM.window.customElements === void 0) {
      return;
    }
    // For combination with native custom element, there needs to be tests based on several combinations
    // Factors that need to be considered are: shadow root, shadow root with a focusable element,
    //                  no shadow root, no shadow root with a focusable element
    //                  tab-index/ content-editable attribute on custom element itself
    //
    // Assertion should at least focus on which active element is
    //                  How the component will be affected by the start up
    //                  Focus method on custom element has been invoked
    describe('CustomElements -- Initialization only', function () {

      // when shadowModes is null, custom element sets its innerHTML directly on it own
      // instead of its shadow root
      const shadowModes: ShadowRootMode[] = ['open', 'closed', null];
      const ceTemplates = [
        '<input />',
        '<textarea></textarea>',
        '<select><option></option><option></option></select>',
        '<div contenteditable="true"></div>',
        '<div tabindex="1"></div>'
      ];
      // controls tests of focusability of the native custom element
      const ceProps: Record<string, any>[] = [
        { tabIndex: 1 },
        { contentEditable: true },
        // Test case: CE itself is not focusable
        {}
      ];

      eachCartesianJoin(
        [shadowModes, ceTemplates, ceProps],
        (shadowMode, ceTemplate, ceProp) => {
          const hasShadowRoot = shadowMode !== null;
          const isFocusable = ceProp && (typeof ceProp.tabIndex !== 'undefined' || ceProp.contentEditable);
          const ceName = `ce-${Math.random().toString().slice(-6)}`;

          it(`works with ${isFocusable ? 'focusable' : ''} custom element ${ceName}, #shadowRoot: ${shadowMode}`, async function () {
            const { testHost, start, dispose, component, ctx } = createFixture<IApp>(
              `<template><${ceName} focus.two-way=hasFocus></${ceName}></template>`,
              class App {
                public hasFocus = true;
              },
              false/* autoStart? */
            );
            const CustomEl = defineCustomElement(ctx, ceName, ceTemplate, { tabIndex: 1 }, shadowMode);
            let callCount = 0;
            // only track call, virtually no different without this layer
            Object.defineProperty(CustomEl.prototype, 'focus', {
              configurable: true,
              value: function focus(options?: FocusOptions): void {
                callCount++;
                if (hasShadowRoot) {
                  return HTMLElement.prototype.focus.call(this, options);
                } else {
                  const focusableEl = this.querySelector('input')
                    || this.querySelector('textarea')
                    || this.querySelector('select')
                    || this.querySelector('[contenteditable]')
                    || this.querySelector('[tabindex]');
                  if (focusableEl) {
                    return (focusableEl as HTMLElement).focus();
                  }
                  return HTMLElement.prototype.focus.call(this, options);
                }
              }
            });
            await start();

            const activeElement = ctx.doc.activeElement;
            const ceEl = testHost.querySelector(`app ${ceName}`);
            assert.equal(callCount, 1, 'It should have called focus()');
            assert.notEqual(ceEl, null);
            if (isFocusable) {
              if (hasShadowRoot) {
                assert.equal(activeElement.tagName, ceName.toUpperCase());
                assert.equal(activeElement, ceEl);
              } else {
                assert.notEqual(
                  activeElement,
                  ceEl,
                  'Custom element should NOT have focus when it has focusable light dom child'
                );
              }
            }
            assert.equal(component.hasFocus, true, 'It should not have affected component.hasFocus');

            await dispose();
          });
        }
      );
    });
  });

  describe('Interactive scenarios', function () {
    const focusAttrs = [
      'focus.two-way=hasFocus',
      // 'focus.two-way=hasFocus',
      // 'focus="value.two-way: hasFocus"',
      // 'focus="value.bind: hasFocus"'
    ];
    const templates: IFocusTestCase[] = [
      {
        title: focusAttr => `Works when shifting focus away from <input/> [${focusAttr}]`,
        template: (focusAttr) => `
          <input ${focusAttr} />
          <div></div>
          <button>Click me</button>
        `,
        getFocusable: 'input',
        app: class App {
          public hasFocus = true;
        },
        assertionFn: (ctx, testHost, component, focusable) => {
          const doc = ctx.doc;
          const win = ctx.wnd;
          const button = testHost.querySelector('button');
          button.focus();
          dispatchEventWith(ctx, focusable, 'blur', false);
          assert.equal(doc.activeElement, button);
          assert.equal(component.hasFocus, false, '+ button@focus');

          focusable.focus();
          dispatchEventWith(ctx, focusable, 'focus', false);
          assert.equal(doc.activeElement, focusable);
          assert.equal(component.hasFocus, true, 'input@focus');

          dispatchEventWith(ctx, win, 'blur', false);
          assert.equal(doc.activeElement, focusable);
          assert.equal(component.hasFocus, true, 'window@blur');
        }
      },
      {
        title: focusAttr => `Works when shifting focus away from <select/> [${focusAttr}]`,
        template: (focusAttr) => `<template>
          <select ${focusAttr} value.bind="anyThing">
            <option>1</option>
            <option>2</option>
          </select>
          <button>Click me</button>
        </template>`,
        getFocusable: 'select',
        app: class App {
          public hasFocus = true;
          public selectedOption: '1' | '2' = '1';
        },
        assertionFn: async (ctx, testHost, component, focusable) => {
          const doc = ctx.doc;
          const win = ctx.wnd;
          const button = testHost.querySelector('button');
          button.focus();
          dispatchEventWith(ctx, focusable, 'blur', false);
          assert.equal(doc.activeElement, button);
          assert.equal(component.hasFocus, false, '> button@focus');

          focusable.focus();
          dispatchEventWith(ctx, focusable, 'focus', false);
          assert.equal(doc.activeElement, focusable);
          assert.equal(component.hasFocus, true, 'select@focus');

          win.blur();
          assert.equal(doc.activeElement, focusable);
          assert.equal(component.hasFocus, true, 'window@blur');

          component.selectedOption = '2';
          ctx.platform.domWriteQueue.flush();
          assert.equal(doc.activeElement, focusable);
          assert.equal(component.hasFocus, true, 'select@change');
        }
      },
      {
        title: focusAttr => `Multiple focus bindings and focus stealing between <input/> [${focusAttr}]`,
        template: (focusAttr) => `<template>
          <input ${focusAttr} id=input1>
          <input focus.two-way="isFocused2" id=input2>
          <button>Click me</button>
        </template>`,
        getFocusable: 'input',
        app: class App {
          public hasFocus = true;
          public isFocused2 = false;
        },
        assertionFn(ctx, testHost, component, focusable) {
          const input2: HTMLInputElement = testHost.querySelector('#input2');
          assert.notEqual(focusable, input2, '@setup: focusable === #input2');
          input2.focus();
          dispatchEventWith(ctx, input2, 'focus', false);
          dispatchEventWith(ctx, focusable, 'blur', false);
          assert.equal(ctx.doc.activeElement, input2, '#input2@focus -> document.activeElement === #input2');
          assert.equal(component.isFocused2, true, '#input2@focus -> component.isFocused2 === true');
          assert.equal(component.hasFocus, false, '#input2@focus -> component.hasFocus === false');
        }
      }
    ];

    eachCartesianJoin(
      [focusAttrs, templates],
      (command, { title, template, getFocusable, app, assertionFn }: IFocusTestCase) => {
        it(title(command), async function () {
          const { testHost, start, dispose, component, ctx } = createFixture<IApp>(
            template(command),
            app,
            false
          );

          await start();
          const doc = ctx.doc;
          const activeElement = doc.activeElement;
          const focusable: HTMLElement = typeof getFocusable === 'string'
            ? testHost.querySelector(getFocusable)
            : getFocusable(testHost);
          assert.notEqual(focusable, null);
          if (typeof getFocusable === 'string') {
            const parts = getFocusable.split(' ');
            assert.equal(activeElement.tagName, parts[parts.length - 1].toUpperCase());
          }
          assert.equal(activeElement, focusable, '@setup -> document.activeElement === focusable');
          assert.equal(component.hasFocus, true, 'It should not have affected component.hasFocus');
          await assertionFn(ctx, testHost, component, focusable);
          await dispose();
        });
      }
    );

    interface IFocusTestCase<T extends IApp = IApp> {
      template: TemplateFn;
      app: Constructable<T>;
      assertionFn: AssertionFn;
      getFocusable: string | ((testHost: HTMLElement) => HTMLElement);
      title(focusAttr: string): string;
    }
  });

  function createFixture<T>(template: string | Node, $class: Constructable<T>, autoStart: boolean = true, ...registrations: any[]) {
    const ctx = TestContext.create();
    const { container, observerLocator } = ctx;
    container.register(...registrations, Focus);
    const testHost = ctx.doc.body.appendChild(ctx.doc.createElement('div'));
    const appHost = testHost.appendChild(ctx.createElement('app'));
    const au = new Aurelia(container);
    const App = CustomElement.define({ name: 'app', template }, $class);
    const component = new App();

    let startPromise: Promise<void> | void;
    if (autoStart) {
      au.app({ host: appHost, component });
      startPromise = au.start();
    }

    return {
      startPromise,
      ctx,
      container,
      testHost,
      appHost,
      au,
      component,
      observerLocator,
      start: async () => {
        au.app({ host: appHost, component });
        await au.start();
      },
      dispose: async () => {
        await au.stop();
        testHost.remove();

        au.dispose();
      }
    };
  }

  function defineCustomElement(ctx: TestContext, name: string, template: string, props: Record<string, any> = null, mode: 'open' | 'closed' | null = 'open') {
    class CustomEl extends ctx.HTMLElement {
      public constructor() {
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
    ctx.platform.customElements.define(name, CustomEl);
    return CustomEl;
  }

  function dispatchEventWith(ctx: TestContext, target: EventTarget, name: string, bubbles = true) {
    target.dispatchEvent(new ctx.CustomEvent(name, { bubbles }));
  }

  type TemplateFn = (focusAttrBindingCommand: string) => string;

  interface AssertionFn<T extends IApp = IApp> {
    // eslint-disable-next-line @typescript-eslint/prefer-function-type
    (ctx: TestContext, testHost: HTMLElement, component: T, focusable: HTMLElement): void | Promise<void>;
  }
});
