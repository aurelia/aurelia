import { Constructable } from '@aurelia/kernel';
import { Aurelia, CustomElementResource, ICustomElement, INode } from '@aurelia/runtime';
import { BlurCustomAttribute, FocusCustomAttribute } from '@aurelia/runtime-html';
import { expect } from 'chai';
import { spy } from 'sinon';
import { HTMLDOM } from '../../../runtime-html/src/dom';
import { setup } from '../integration/util';
import { HTMLTestContext, TestContext } from '../util';
import { eachCartesianJoin } from './util';

describe('built-in-resources.focus', () => {

  interface IApp {
    isBlur: boolean;
    isFocused2: boolean;
    selectedOption: string;
  }

  let $aurelia: Aurelia;

  beforeEach(() => {
    $aurelia = undefined;
  });

  afterEach(() => {
    if ($aurelia) {
      $aurelia.stop();
    }
  });

  describe('basic scenarios', () => {

    describe('with non-focusable element', () => {
      it('focuses when there is tabindex attribute', () => {
        const { au, component, dom } = setupAndStartNormal<IApp>(
          `<template>
            <div focus.bind="isBlur" id="blurred" tabindex="-1"></div>
          </template>`,
          class App {
            public isBlur = true;
          }
        );

        const activeElement = dom.document.activeElement;
        const div = dom.document.querySelector('app div');
        expect(div).not.to.be.null;
        expect(activeElement.tagName).to.equal('DIV');
        expect(activeElement).to.equal(div);
        expect(component.isBlur).to.equal(true, 'It should not have affected component.isBlur');
      });
    });

    it('invokes focus when there is **NO** tabindex attribute', () => {
      let callCount = 0;
      HTMLDivElement.prototype.focus = function() {
        callCount++;
        return HTMLElement.prototype.focus.call(this);
      };

      const { au, component, dom } = setupAndStartNormal<IApp>(
        `<template>
          <div focus.bind="isBlur" id="blurred"></div>
        </template>`,
        class App {
          public isBlur = true;
        }
      );

      const activeElement = dom.document.activeElement;
      const div = dom.document.querySelector('app div');
      expect(callCount).to.equal(1, 'It should have invoked focus on DIV element prototype');
      expect(div).not.to.be.null;
      expect(activeElement.tagName).not.to.equal('DIV');
      expect(activeElement).not.to.equal(div);
      expect(component.isBlur).to.equal(true, 'It should not have affected component.isBlur');

      // focus belongs to HTMLElement class
      delete HTMLDivElement.prototype.focus;
    });

    for (const [desc, template] of [
      ['<div/>', '<div contenteditable focus.bind=isBlur id=blurred></div>'],
      ['<input/>', `<input focus.bind=isBlur id=blurred>`],
      ['<select/>', `<select focus.bind=isBlur id=blurred></select>`],
      ['<button/>', '<button focus.bind=isBlur id=blurred></button>'],
      ['<video/>', '<video tabindex=1 focus.bind=isBlur id=blurred></video>'],
      ['<select/> + <option/>', `<select focus.bind=isBlur id=blurred><option tabindex=1>Hello</option></select>`],
      ['<textarea/>', `<textarea focus.bind=isBlur id=blurred></textarea>`]
    ]) {
      describe(`with ${desc}`, () => {
        it('Works in basic scenario', () => {
          const { au, component, dom } = setupAndStartNormal<IApp>(
            `<template>
              ${template}
            </template>`,
            class App {
              public isBlur = true;
            }
          );

          const elName = desc.replace(/^<|\/>.*$/g, '');
          const activeElement = dom.document.activeElement;
          const focusable = dom.document.querySelector(`app ${elName}`);
          expect(focusable).not.to.be.null;
          expect(activeElement.tagName).to.equal(elName.toUpperCase());
          expect(activeElement).to.equal(focusable);
          expect(component.isBlur).to.equal(true, 'It should not have affected component.isBlur');
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
    describe('CustomElements -- Initialization only', () => {

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
          const CustomEl = defineCustomElement(ceName, ceTemplate, { tabIndex: 1 }, shadowMode);

          it(`works with ${isFocusable ? 'focusable' : ''} custom element ${ceName}, #shadowRoot: ${shadowMode}`, () => {
            let callCount = 0;
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

            const { au, component, dom } = setupAndStartNormal<IApp>(
              `<template><${ceName} focus.bind=isBlur></${ceName}></template>`,
              class App {
                public isBlur = true;
              }
            );

            const activeElement = dom.document.activeElement;
            const ceEl = dom.document.querySelector(`app ${ceName}`);
            expect(callCount).to.equal(1, 'It should have called focus()');
            expect(ceEl).not.to.be.null;
            if (isFocusable) {
              if (hasShadowRoot) {
                expect(activeElement.tagName).to.equal(ceName.toUpperCase());
                expect(activeElement).to.equal(ceEl);
              } else {
                expect(activeElement).not.to.equal(
                  ceEl,
                  'Custom element should NOT have focus when it has focusable light dom child'
                );
              }
            }
            expect(component.isBlur).to.equal(true, 'It should not have affected component.isBlur');
          });
        }
      );
    });
  });

  describe('Interactive scenarios', () => {
    const focusAttrs = [
      'focus.two-way=isBlur',
      'focus.bind=isBlur',
      'focus="value.two-way: isBlur"',
      'focus="value.bind: isBlur"'
    ];
    const templates: ITestCase[] = [
      {
        title: 'Works when shifting focus away from <input/>',
        template: (focusAttr) => `<template>
          <input ${focusAttr} />
          <div></div>
          <button>Click me</button>
        </template>`,
        getFocusable: 'input',
        app: class App {
          public isBlur = true;
        },
        async assert({ window, document }: HTMLDOM, component, focusable) {
          const button = document.querySelector('button');
          button.focus();
          expect(document.activeElement).to.equal(button);
          expect(component.isBlur).to.equal(false, 'component.isBlur should have been false');

          focusable.focus();
          expect(document.activeElement).to.equal(focusable);
          expect(component.isBlur).to.equal(true, 'component.isBlur should have been true after input has gotten back the focus');

          window.dispatchEvent(new CustomEvent('blur'));
          expect(document.activeElement).to.equal(focusable);
          expect(component.isBlur).to.equal(true, 'component.isBlur should have been true when window got blur, as no other elements stole the focus');
        }
      },
      {
        title: 'Works when shifting focus away from <select/>',
        template: (focusAttr) => `<template>
          <select ${focusAttr} value.bind=selectedOption>
            <option>1</option>
            <option>2</option>
          </select>
          <button>Click me</button>
        </template>`,
        getFocusable: 'select',
        app: class App {
          public isBlur = true;
          public selectedOption: '1' | '2' = '1';
        },
        async assert({ window, document }: HTMLDOM, component, focusable) {

          const button = document.querySelector('button');
          button.focus();
          expect(document.activeElement).to.equal(button);
          expect(component.isBlur).to.equal(false, 'component.isBlur should have been false');

          focusable.focus();
          expect(document.activeElement).to.equal(focusable);
          expect(component.isBlur).to.equal(true, 'component.isBlur should have been true after input has gotten back the focus');

          window.dispatchEvent(new CustomEvent('blur'));
          expect(document.activeElement).to.equal(focusable);
          expect(component.isBlur).to.equal(true, 'component.isBlur should have been true when window got blur, as no other elements stole the focus');

          component.selectedOption = '2';
          await waitForDelay();
          expect(document.activeElement).to.equal(focusable);
          expect(component.isBlur).to.equal(true, 'component.isBlur should have been true when select value change');
        }
      },
      {
        title: 'Multiple focus bindings and focus stealing between <input/>',
        template: (focusAttr) => `<template>
          <input ${focusAttr} id=input1>
          <input focus.bind="isFocused2" id=input2>
          <button>Click me</button>
        </template>`,
        getFocusable: 'input',
        app: class App {
          public isFocus = true;
          public isFocused2 = false;
        },
        async assert(dom, component, focusable) {
          const input2 = dom.document.querySelector('#input2') as HTMLInputElement;
          expect(focusable).not.to.eq(input2);
          input2.focus();
          expect(document.activeElement).to.equal(input2);
          expect(component.isFocused2).to.equal(true);
          expect(component.isBlur).to.equal(false);
        }
      }
    ];

    eachCartesianJoin(
      [focusAttrs, templates],
      (command, { title, template, getFocusable, app, assert }: ITestCase) => {
        it(title, () => {
          const { au, component, dom } = setupAndStartNormal<IApp>(
            template(command),
            app
          );
          const activeElement = document.activeElement;
          const focusable = typeof getFocusable === 'string'
            ? document.querySelector(getFocusable) as HTMLElement
            : getFocusable(document);
          expect(focusable).not.to.be.null;
          if (typeof getFocusable === 'string') {
            const parts = getFocusable.split(' ');
            expect(activeElement.tagName).to.equal(parts[parts.length - 1].toUpperCase());
          }
          expect(activeElement).to.equal(focusable);
          expect(component.isBlur).to.equal(true, 'It should not have affected component.isBlur');
          return assert(dom, component, focusable);
        });
      }
    );

    interface ITestCase<T extends IApp = IApp> {
      title: string;
      template: TemplateFn;
      app: Constructable<T>;
      assert: AssertionFn;
      getFocusable: string | ((doc: Document) => HTMLElement);
    }
  });

  function setupAndStartNormal<T>(template: string | Node, $class: Constructable | null, ...registrations: any[]) {
    const ctx = TestContext.createHTMLTestContext();
    registrations = Array.from(new Set([...registrations, FocusCustomAttribute]));
    const { container, lifecycle, host, au, component, observerLocator } = setup(ctx, template, $class, ...registrations);

    ctx.doc.body.innerHTML = '';
    ctx.doc.body.appendChild(host);

    au.app({ host, component });
    au.start();
    au['stopTasks'].push(() => ctx.doc.body.removeChild(host));

    $aurelia = au;

    return { dom: ctx.dom, container, lifecycle, host, au, component: component as T, observerLocator };
  }

  function $setup() {
    const ctx = TestContext.createHTMLTestContext();
    const { container, lifecycle, dom } = ctx;
    const au = new Aurelia(container);
    const host = dom.createElement('app');

    return { dom, au, host, lifecycle };
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

  function waitForDelay(time = 0): Promise<void> {
    return new Promise(r => setTimeout(r, time));
  }

  type TemplateFn = (focusAttrBindingCommand: string) => string;

  interface AssertionFn<T extends IApp = IApp> {
    // tslint:disable-next-line:callable-types
    (dom: HTMLDOM, component: T, focusable: HTMLElement): void | Promise<void>;
  }
});
