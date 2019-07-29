import { Constructable } from '@aurelia/kernel';
import { Aurelia, CustomElement } from '@aurelia/runtime';
import { Focus } from '@aurelia/runtime-html';
import { assert, eachCartesianJoin, HTMLTestContext, TestContext } from '@aurelia/testing';

describe('focus.spec.ts', function() {

  interface IApp {
    hasFocus?: boolean;
    isFocused?: boolean;
    isFocused2?: boolean;
    selectedOption?: string;
  }

  let $aurelia: Aurelia;
  let $host: HTMLElement;

  beforeEach(function() {
    $aurelia = undefined;
    $host = undefined;
  });

  afterEach(function() {
    if ($aurelia) {
      $aurelia.stop();
      ($aurelia.root.host as Element).remove();
    }
    if ($host) {
      $host.remove();
    }
  });

  describe('basic scenarios', function() {

    describe('with non-focusable element', function() {
      it('focuses when there is tabindex attribute', function() {
        const { au, component, ctx } = setup<IApp>(
          `<template>
            <div focus.bind="hasFocus" id="blurred" tabindex="-1"></div>
          </template>`,
          class App {
            public hasFocus = true;
          }
        );

        const activeElement = ctx.doc.activeElement;
        const div = ctx.doc.querySelector('app div');
        assert.notEqual(div, null, '<app/> <div/> not null');
        assert.equal(activeElement.tagName, 'DIV', 'activeElement === <div/>');
        assert.equal(activeElement, div, 'activeElement === <div/>');
        assert.equal(component.hasFocus, true, 'It should not have affected component.hasFocus');
      });
    });

    it('invokes focus when there is **NO** tabindex attribute', function() {
      let callCount = 0;
      HTMLDivElement.prototype.focus = function() {
        callCount++;
        return HTMLElement.prototype.focus.call(this);
      };

      const { au, component, ctx } = setup<IApp>(
        `<template>
          <div focus.bind="hasFocus" id="blurred"></div>
        </template>`,
        class App {
          public hasFocus = true;
        }
      );

      const activeElement = ctx.doc.activeElement;
      const div = ctx.doc.querySelector('app div');
      assert.equal(callCount, 1, 'It should have invoked focus on DIV element prototype');
      assert.notEqual(div, null, '<app/> <div/> should not be null');
      assert.notEqual(activeElement.tagName, 'DIV');
      assert.notEqual(activeElement, div);
      assert.equal(component.hasFocus, true, 'It should not have affected component.hasFocus');

      // focus belongs to HTMLElement class
      delete HTMLDivElement.prototype.focus;
    });

    for (const [desc, template] of [
      ['<div/>', '<div contenteditable focus.bind=hasFocus id=blurred></div>'],
      ['<input/>', `<input focus.bind=hasFocus id=blurred>`],
      ['<select/>', `<select focus.bind=hasFocus id=blurred></select>`],
      ['<button/>', '<button focus.bind=hasFocus id=blurred></button>'],
      ['<video/>', '<video tabindex=1 focus.bind=hasFocus id=blurred></video>'],
      ['<select/> + <option/>', `<select focus.bind=hasFocus id=blurred><option tabindex=1>Hello</option></select>`],
      ['<textarea/>', `<textarea focus.bind=hasFocus id=blurred></textarea>`]
    ]) {
      describe(`with ${desc}`, function() {
        it('Works in basic scenario', function() {
          const { au, component, ctx } = setup<IApp>(
            `<template>
              ${template}
            </template>`,
            class App {
              public hasFocus = true;
            }
          );

          const elName = desc.replace(/^<|\/>.*$/g, '');
          const activeElement = ctx.doc.activeElement;
          const focusable = ctx.doc.querySelector(`app ${elName}`);
          assert.notEqual(focusable, null, `focusable el (<${elName}/>) is not null`);
          assert.equal(activeElement.tagName, elName.toUpperCase());
          assert.equal(activeElement, focusable);
          assert.equal(component.hasFocus, true, 'It should not have affected component.hasFocus');
        });
      });
    }

    // For combination with native custom element, there needs to be tests based on several combinations
    // Factors that need to be considered are: shadow root, shadow root with a focusable element,
    //                  no shadow root, no shadow root with a focusable element
    //                  tab-index/ content-editable attribute on custom element itself
    //
    // Assertion should at least focus on which active element is
    //                  How the component will be affected by the start up
    //                  Focus method on custom element has been invoked
    describe('CustomElements -- Initialization only', function() {

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
          const isFocusable = ceProp && (typeof ceProp.tabIndex !== undefined || ceProp.contentEditable);
          // tslint:disable-next-line:insecure-random
          const ceName = `ce-${Math.random().toString().slice(-6)}`;

          it(`works with ${isFocusable ? 'focusable' : ''} custom element ${ceName}, #shadowRoot: ${shadowMode}`, function() {
            let callCount = 0;

            const { au, component, ctx } = setup<IApp>(
              `<template><${ceName} focus.bind=hasFocus></${ceName}></template>`,
              class App {
                public hasFocus = true;
              }
            );
            const CustomEl = defineCustomElement(ctx, ceName, ceTemplate, { tabIndex: 1 }, shadowMode);
            // only track call, virtually no different without this layer
            CustomEl.prototype['focus'] = function focus(options?: FocusOptions): void {
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
            };

            const activeElement = ctx.doc.activeElement;
            const ceEl = ctx.doc.querySelector(`app ${ceName}`);
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
          });
        }
      );
    });
  });

  describe('Interactive scenarios', function() {
    const focusAttrs = [
      'focus.two-way=hasFocus',
      // 'focus.bind=hasFocus',
      // 'focus="value.two-way: hasFocus"',
      // 'focus="value.bind: hasFocus"'
    ];
    const templates: IFocusTestCase[] = [
      {
        title: focusAttr => `Works when shifting focus away from <input/> [${focusAttr}]`,
        template: (focusAttr) => `<template>
          <input ${focusAttr} />
          <div></div>
          <button>Click me</button>
        </template>`,
        getFocusable: 'input',
        app: class App {
          public hasFocus = true;
        },
        assertionFn: async (ctx, component, focusable) => {
          const doc = ctx.doc;
          const win = ctx.wnd;
          const button = doc.querySelector('button');
          button.focus();
          assert.equal(doc.activeElement, button);
          assert.equal(component.hasFocus, false, '+ button@focus');

          focusable.focus();
          assert.equal(doc.activeElement, focusable);
          assert.equal(component.hasFocus, true, 'input@focus');

          win.dispatchEvent(new CustomEvent('blur'));
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
        assertionFn: async (ctx, component, focusable) => {
          const doc = ctx.doc;
          const win = ctx.wnd;
          const button = doc.querySelector('button');
          button.focus();
          await waitForDelay(50);
          assert.equal(doc.activeElement, button);
          assert.equal(component.hasFocus, false, '> button@focus');

          focusable.focus();
          assert.equal(doc.activeElement, focusable);
          assert.equal(component.hasFocus, true, 'select@focus');

          win.dispatchEvent(new CustomEvent('blur'));
          assert.equal(doc.activeElement, focusable);
          assert.equal(component.hasFocus, true, 'window@blur');

          component.selectedOption = '2';
          await waitForDelay();
          assert.equal(doc.activeElement, focusable);
          assert.equal(component.hasFocus, true, 'select@change');
        }
      },
      {
        title: focusAttr => `Multiple focus bindings and focus stealing between <input/> [${focusAttr}]`,
        template: (focusAttr) => `<template>
          <input ${focusAttr} id=input1>
          <input focus.bind="isFocused2" id=input2>
          <button>Click me</button>
        </template>`,
        getFocusable: 'input',
        app: class App {
          public hasFocus = true;
          public isFocused2 = false;
        },
        async assertionFn(ctx, component, focusable) {
          const input2 = ctx.doc.querySelector('#input2') as HTMLInputElement;
          assert.notEqual(focusable, input2, '@setup: focusable === #input2');
          input2.focus();
          await waitForDelay(50);
          assert.equal(document.activeElement, input2, '#input2@focus -> document.activeElement === #input2');
          assert.equal(component.isFocused2, true, '#input2@focus -> component.isFocused2 === true');
          assert.equal(component.hasFocus, false, '#input2@focus -> component.hasFocus === false');
        }
      }
    ];

    eachCartesianJoin(
      [focusAttrs, templates],
      (command, { title, template, getFocusable, app, assertionFn }: IFocusTestCase) => {
        it(title(command), function() {
          const { au, component, ctx } = setup<IApp>(
            template(command),
            app
          );
          const doc = ctx.doc;
          const activeElement = doc.activeElement;
          const focusable = typeof getFocusable === 'string'
            ? doc.querySelector(getFocusable) as HTMLElement
            : getFocusable(doc);
          assert.notEqual(focusable, null);
          if (typeof getFocusable === 'string') {
            const parts = getFocusable.split(' ');
            assert.equal(activeElement.tagName, parts[parts.length - 1].toUpperCase());
          }
          assert.equal(activeElement, focusable, '@setup -> document.activeElement === focusable');
          assert.equal(component.hasFocus, true, 'It should not have affected component.hasFocus');
          return assertionFn(ctx, component, focusable);
        });
      }
    );

    interface IFocusTestCase<T extends IApp = IApp> {
      template: TemplateFn;
      app: Constructable<T>;
      assertionFn: AssertionFn;
      getFocusable: string | ((doc: Document) => HTMLElement);
      title(focusAttr: string): string;
    }
  });

  function setup<T>(template: string | Node, $class: Constructable<T>, ...registrations: any[]) {
    const ctx = TestContext.createHTMLTestContext();
    const { container, lifecycle, observerLocator } = ctx;
    container.register(...registrations, Focus);
    const host = $host = ctx.doc.body.appendChild(ctx.createElement('app'));
    const au = new Aurelia(container);
    const App = CustomElement.define({ name: 'app', template }, $class);
    const component = new App();

    au.app({ host, component });
    au.start();

    return { ctx, container, lifecycle, host, au, component, observerLocator };
  }

  function defineCustomElement(ctx: HTMLTestContext, name: string, template: string, props: Record<string, any> = null, mode: 'open' | 'closed' | null = 'open') {
    class CustomEl extends ctx.dom.HTMLElement {
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

  function waitForDelay(time = 0): Promise<void> {
    return new Promise(r => setTimeout(r, time));
  }

  type TemplateFn = (focusAttrBindingCommand: string) => string;

  interface AssertionFn<T extends IApp = IApp> {
    // tslint:disable-next-line:callable-types
    (ctx: HTMLTestContext, component: T, focusable: HTMLElement): void | Promise<void>;
  }
});
