import { Constructable } from '@aurelia/kernel';
import { Aurelia, CustomElementResource, ICustomElement, INode, INodeSequence } from '@aurelia/runtime';
import { BlurCustomAttribute, FocusCustomAttribute } from '@aurelia/runtime-html';
import { expect } from 'chai';
import { spy } from 'sinon';
import { HTMLDOM } from '../../../runtime-html/src/dom';
import { setup } from '../integration/util';
import { HTMLTestContext, TestContext } from '../util';
import { eachCartesianJoin } from './util';

describe('built-in-resources.visible', () => {

  interface IApp {
    isBlur: boolean;
    isFocused2: boolean;
    isVisible: boolean;
    isVisibleAssignmentCount: number;
    selectedOption: string;
    lifecycleCount: {
      binding: number;
      bound: number;
      attaching: number;
      attached: number;
    }
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

    const visibleAttrs = [
      'visible.bind="isVisible"',
      'visible.two-way="isVisible"',
      'visible.from-view="isVisible"',
      'visible="value.two-way: isVisible"',
      'visible="value.from-view: isVisible"',
      'visible="value.bind: isVisible"'
    ];
    const testCases: ITestCase[] = [
      {
        title: 'Visible when it stays at the edge of the visible viewpot',
        template: (visibleAttr) => `<template>
          <div stlye="height: 500px; overflow-y: auto">
            <div style="height: 500px;"></div>
           <input ${visibleAttr} class="\${isVisible ? 'visible' : 'not-visible' }" id="input1" />
          </div>
          <button>Click me</button>
        </template>`,
        app: class App {
          public isBlur = true;
          public lifecycleCount = defaultLifecycleCount();

          public bound() {
            this.lifecycleCount.bound++;
            const $el = this as unknown as ICustomElement;
            const input = findInNodeSequence($el.$nodes, 'input');
            expect(input.classList.contains('visible')).to.equal(false, 'It should have been visible when not connected.');
          }

          public attaching() {
            this.lifecycleCount.attaching++;
            const $el = this as unknown as ICustomElement;
            const input = findInNodeSequence($el.$nodes, 'input');
            expect(input.classList.contains('visible')).to.equal(false, 'It should have been visible when not connected.');
          }
        },
        async assert({ window, document }: HTMLDOM, component, focusable) {
          expect(component.lifecycleCount.bound).to.equal(1, 'It should have invoked bound');
          expect(component.lifecycleCount.attaching).to.equal(1, 'It should have invoked attaching');
          const input = document.querySelector('input');
          expect(input.classList.contains('visible')).to.equal(true, 'It should have been visible when attached.');
          expect(component.isVisible).to.equal(true, 'component.isVisible should have been true as element is visible.');
        }
      },
      {
        title: 'Visible when it stays inside visible viewport',
        template: (visibleAttr) => `<template>
          <div stlye="height: 500px; overflow-y: auto">
            <div style="height: 400px;"></div>
           <input ${visibleAttr} class="\${isVisible ? 'visible' : 'not-visible' }" id="input1" />
          </div>
          <button>Click me</button>
        </template>`,
        app: class App {
          public get isVisible() {
            return this._isVisible;
          }
          public set isVisible(val: boolean) {
            this.isVisibleAssignmentCount++;
            this._isVisible = val;
          }
          public isVisibleAssignmentCount = 0;
          public lifecycleCount = defaultLifecycleCount();

          private _isVisible: boolean = false;

          public bound() {
            this.lifecycleCount.bound++;
            const $el = this as unknown as ICustomElement;
            const input = findInNodeSequence($el.$nodes, 'input');
            expect(input.classList.contains('visible')).to.equal(false, 'It should have been visible when not connected.');
            expect(this.isVisible).to.equal(false, 'component.isVisible state should not have been altered.');
            expect(this.isVisibleAssignmentCount).to.equal(0, 'It should not have tried to assign to "component.isVisible".');
          }

          public attaching() {
            this.lifecycleCount.attaching++;
            const $el = this as unknown as ICustomElement;
            const input = findInNodeSequence($el.$nodes, 'input');
            expect(input.classList.contains('visible')).to.equal(false, 'It should have been visible when not connected.');
            expect(this.isVisible).to.equal(false, 'component.isVisible state should not have been altered.');
            expect(this.isVisibleAssignmentCount).to.equal(0, 'It should not have tried to assign to "component.isVisible".');
          }
        },
        async assert({ window, document }: HTMLDOM, component, focusable) {
          expect(component.lifecycleCount.bound).to.equal(1, 'It should have invoked bound');
          expect(component.lifecycleCount.attaching).to.equal(1, 'It should have invoked attaching');
          const input = document.querySelector('input');
          expect(input.classList.contains('visible')).to.equal(true, 'It should have been visible when attached.');
          expect(component.isVisible).to.equal(true, 'component.isVisible should have been true as element is visible.');
          expect(this.isVisibleAssignmentCount).to.equal(1, 'It should have assigned to "component.isVisible" only once.');
        }
      },
      {
        title: 'Visible when it stays at edge of visible document viewport',
        template: (visibleAttr) => `<template>
          <div stlye="height: 100vh"></div>
          <input ${visibleAttr} class="\${isVisible ? 'visible' : 'not-visible' }" id="input1" />
          <button>Click me</button>
        </template>`,
        app: class App {
          public get isVisible() {
            return this._isVisible;
          }
          public set isVisible(val: boolean) {
            this.isVisibleAssignmentCount++;
            this._isVisible = val;
          }
          public isVisibleAssignmentCount = 0;
          public lifecycleCount = defaultLifecycleCount();

          private _isVisible: boolean = false;

          public bound() {
            this.lifecycleCount.bound++;
            const $el = this as unknown as ICustomElement;
            const input = findInNodeSequence($el.$nodes, 'input');
            expect(input.classList.contains('visible')).to.equal(false, 'It should have been visible when not connected.');
            expect(this.isVisible).to.equal(false, 'component.isVisible state should not have been altered.');
            expect(this.isVisibleAssignmentCount).to.equal(0, 'It should not have tried to assign to "component.isVisible".');
          }

          public attaching() {
            this.lifecycleCount.attaching++;
            const $el = this as unknown as ICustomElement;
            const input = findInNodeSequence($el.$nodes, 'input');
            expect(input.classList.contains('visible')).to.equal(false, 'It should have been visible when not connected.');
            expect(this.isVisible).to.equal(false, 'component.isVisible state should not have been altered.');
            expect(this.isVisibleAssignmentCount).to.equal(0, 'It should not have tried to assign to "component.isVisible".');
          }
        },
        async assert({ window, document }: HTMLDOM, component) {
          expect(component.lifecycleCount.bound).to.equal(1, 'It should have invoked bound');
          expect(component.lifecycleCount.attaching).to.equal(1, 'It should have invoked attaching');
          const input = document.querySelector('input');
          expect(input.classList.contains('visible')).to.equal(true, 'It should have been visible when attached.');
          expect(component.isVisible).to.equal(true, 'component.isVisible should have been true as element is visible.');
          expect(this.isVisibleAssignmentCount).to.equal(1, 'It should have assigned to "component.isVisible" only once.');
        }
      }
    ];

    eachCartesianJoin(
      [visibleAttrs, testCases],
      (command, { title, template, app, assert }: ITestCase) => {
        it(title, () => {
          const { au, component, dom } = setupAndStartNormal<IApp>(
            template(command),
            app
          );
          return assert(dom, component, null);
        });
      }
    );
  });

  describe('styling changes scenarios', () => {

    const visibleAttrs = [
      'visible.bind="isVisible"',
      'visible.two-way="isVisible"',
      'visible.from-view="isVisible"',
      'visible="value.two-way: isVisible"',
      'visible="value.from-view: isVisible"',
      'visible="value.bind: isVisible"'
    ];
    const testCases: ITestCase[] = [
      {
        title: 'Visible when it becomes visible because of styling changes',
        template: (visibleAttr) => `<template>
          <input ${visibleAttr} class="\${isVisible ? 'visible' : 'not-visible' }" style="display: none" />
        </template>`,
        app: class App {
          public isBlur = true;
          public lifecycleCount = defaultLifecycleCount();

          public bound() {
            this.lifecycleCount.bound++;
            const $el = this as unknown as ICustomElement;
            const input = findInNodeSequence($el.$nodes, 'input');
            expect(input.classList.contains('visible')).to.equal(false, 'It should have been visible when not connected.');
          }

          public attaching() {
            this.lifecycleCount.attaching++;
            const $el = this as unknown as ICustomElement;
            const input = findInNodeSequence($el.$nodes, 'input');
            expect(input.classList.contains('visible')).to.equal(false, 'It should have been visible when not connected.');
          }
        },
        async assert({ window, document }: HTMLDOM, component, focusable) {
          expect(component.lifecycleCount.bound).to.equal(1, 'It should have invoked bound');
          expect(component.lifecycleCount.attaching).to.equal(1, 'It should have invoked attaching');
          const input = document.querySelector('input');
          expect(component.isVisible).to.equal(false, 'component.isVisible should have been false as element is invisible.');
          input.style.display = '';
          await waitForDelay(1);
          expect(component.isVisible).to.equal(true, 'component.isVisible should have been true as element is visible.');
          expect(component.isVisibleAssignmentCount).to.equal(1, 'There should have been only one assignment to isivible.');
          expect(input.classList.contains('visible')).to.equal(true, 'It should have had "visible" css class.');
        }
      },
      {
        title: 'Visible when it becomes visible because of styling changes',
        template: (visibleAttr) => `<template>
          <input ${visibleAttr} class="\${isVisible ? 'visible' : 'not-visible' } hidden" />
        </template>`,
        app: class App {
          public isBlur = true;
          public lifecycleCount = defaultLifecycleCount();

          public bound() {
            this.lifecycleCount.bound++;
            const $el = this as unknown as ICustomElement;
            const input = findInNodeSequence($el.$nodes, 'input');
            expect(input.classList.contains('visible')).to.equal(false, 'It should have been visible when not connected.');
          }

          public attaching() {
            this.lifecycleCount.attaching++;
            const $el = this as unknown as ICustomElement;
            const input = findInNodeSequence($el.$nodes, 'input');
            expect(input.classList.contains('visible')).to.equal(false, 'It should have been visible when not connected.');
          }
        },
        async assert({ window, document }: HTMLDOM, component, focusable) {
          expect(component.lifecycleCount.bound).to.equal(1, 'It should have invoked bound');
          expect(component.lifecycleCount.attaching).to.equal(1, 'It should have invoked attaching');
          const input = document.querySelector('input');
          expect(component.isVisible).to.equal(false, 'component.isVisible should have been false as element is invisible.');
          input.classList.remove('hidden');
          await waitForDelay(1);
          expect(component.isVisible).to.equal(true, 'component.isVisible should have been true as element is visible.');
          expect(component.isVisibleAssignmentCount).to.equal(1, 'There should have been only one assignment to isivible.');
          expect(input.classList.contains('visible')).to.equal(true, 'It should have had "visible" css class.');
        }
      },
    ];

    eachCartesianJoin(
      [visibleAttrs, testCases],
      (command, { title, template, app, assert }: ITestCase) => {
        it(title, () => {
          const { au, component, dom } = setupAndStartNormal<IApp>(
            template(command),
            app
          );
          return assert(dom, component, null);
        });
      }
    );
  });

  describe('scrolling involved scenarios', () => {

    const visibleAttrs = [
      'visible.bind="isVisible"',
      'visible.two-way="isVisible"',
      'visible.from-view="isVisible"',
      'visible="value.two-way: isVisible"',
      'visible="value.from-view: isVisible"',
      'visible="value.bind: isVisible"'
    ];
    const testCases: ITestCase[] = [
      {
        title: 'Visible when it gets scrolled into visible viewport',
        template: (visibleAttr) => `<template>
          <div stlye="height: 500px; overflow-y: auto">
            <div style="height: 600px;"></div>
            <input ${visibleAttr} class="\${isVisible ? 'visible' : 'not-visible' }" id="input1" />
          </div>
          <button>Click me</button>
        </template>`,
        app: class App {
          public get isVisible() {
            return this._isVisible;
          }
          public set isVisible(val: boolean) {
            this.isVisibleAssignmentCount++;
            this._isVisible = val;
          }
          public isVisibleAssignmentCount = 0;
          public lifecycleCount = defaultLifecycleCount();

          private _isVisible: boolean = false;

          public bound() {
            this.lifecycleCount.bound++;
            const $el = this as unknown as ICustomElement;
            const input = findInNodeSequence($el.$nodes, 'input');
            expect(input.classList.contains('visible')).to.equal(false, 'It should have been visible when not connected.');
            expect(this.isVisible).to.equal(false, 'component.isVisible state should not have been altered.');
            expect(this.isVisibleAssignmentCount).to.equal(0, 'It should not have tried to assign to "component.isVisible".');
          }

          public attaching() {
            this.lifecycleCount.attaching++;
            const $el = this as unknown as ICustomElement;
            const input = findInNodeSequence($el.$nodes, 'input');
            expect(input.classList.contains('visible')).to.equal(false, 'It should have been visible when not connected.');
            expect(this.isVisible).to.equal(false, 'component.isVisible state should not have been altered.');
            expect(this.isVisibleAssignmentCount).to.equal(0, 'It should not have tried to assign to "component.isVisible".');
          }
        },
        async assert({ window, document }: HTMLDOM, component, focusable) {
          expect(component.lifecycleCount.bound).to.equal(1, 'It should have invoked bound');
          expect(component.lifecycleCount.attaching).to.equal(1, 'It should have invoked attaching');
          const input = document.querySelector('input');
          expect(input.classList.contains('visible')).to.equal(false, 'It should not have been visible when attached.');
          expect(component.isVisible).to.equal(false, 'component.isVisible should not have been true as element is visible.');
          expect(this.isVisibleAssignmentCount).to.equal(0, 'It should not have assigned to "component.isVisible".');
          // Scroll input to edge of the visible viewport
          (input.previousElementSibling as HTMLElement).style.height = '500px';
          await waitForDelay(1);
          expect(input.classList.contains('visible')).to.equal(true, 'It should have been visible when <input/> is scrolled into the scene.');
          expect(component.isVisible).to.equal(true, 'component.isVisible should have been true as element is visible.');
          expect(this.isVisibleAssignmentCount).to.equal(1, 'It should have assigned to "component.isVisible" once.');
          // Scroll input out/away from visible viewport
          (input.previousElementSibling as HTMLElement).style.height = '600px';
          await waitForDelay(1);
          expect(input.classList.contains('visible')).to.equal(false, 'It should not have been visible when <input/> is scrolled away the scene.');
          expect(component.isVisible).to.equal(false, 'component.isVisible should have been false as <input/> is not visible.');
          expect(this.isVisibleAssignmentCount).to.equal(2, 'It should have assigned to "component.isVisible" twice.');
        }
      },
      {
        title: 'Visible when it gets scrolled into visible viewport',
        template: (visibleAttr) => `<template>
          <div stlye="height: calc(100vh + 100px);"></div>
          <input ${visibleAttr} class="\${isVisible ? 'visible' : 'not-visible' }" />
          <button>Click me</button>
        </template>`,
        app: class App {
          public get isVisible() {
            return this._isVisible;
          }
          public set isVisible(val: boolean) {
            this.isVisibleAssignmentCount++;
            this._isVisible = val;
          }
          public isVisibleAssignmentCount = 0;
          public lifecycleCount = defaultLifecycleCount();

          private _isVisible: boolean = false;

          public bound() {
            this.lifecycleCount.bound++;
            const $el = this as unknown as ICustomElement;
            const input = findInNodeSequence($el.$nodes, 'input');
            expect(input.classList.contains('visible')).to.equal(false, 'It should have been visible when not connected.');
            expect(this.isVisible).to.equal(false, 'component.isVisible state should not have been altered.');
            expect(this.isVisibleAssignmentCount).to.equal(0, 'It should not have tried to assign to "component.isVisible".');
          }

          public attaching() {
            this.lifecycleCount.attaching++;
            const $el = this as unknown as ICustomElement;
            const input = findInNodeSequence($el.$nodes, 'input');
            expect(input.classList.contains('visible')).to.equal(false, 'It should have been visible when not connected.');
            expect(this.isVisible).to.equal(false, 'component.isVisible state should not have been altered.');
            expect(this.isVisibleAssignmentCount).to.equal(0, 'It should not have tried to assign to "component.isVisible".');
          }
        },
        async assert({ window, document }: HTMLDOM, component) {
          expect(component.lifecycleCount.bound).to.equal(1, 'It should have invoked bound');
          expect(component.lifecycleCount.attaching).to.equal(1, 'It should have invoked attaching');
          const input = document.querySelector('input');
          expect(input.classList.contains('visible')).to.equal(false, 'It should not have been visible when attached.');
          expect(component.isVisible).to.equal(false, 'component.isVisible should not have been true as element is visible.');
          expect(this.isVisibleAssignmentCount).to.equal(0, 'It should not have assigned to "component.isVisible".');
          // Scroll input to edge of the visible viewport
          (input.previousElementSibling as HTMLElement).style.height = '100vh';
          await waitForDelay(1);
          expect(input.classList.contains('visible')).to.equal(true, 'It should have been visible when <input/> is scrolled into the scene.');
          expect(component.isVisible).to.equal(true, 'component.isVisible should have been true as element is visible.');
          expect(this.isVisibleAssignmentCount).to.equal(1, 'It should have assigned to "component.isVisible" once.');
          // Scroll input out/away from visible viewport
          (input.previousElementSibling as HTMLElement).style.height = 'calc(100vh + 100px)';
          await waitForDelay(1);
          expect(input.classList.contains('visible')).to.equal(false, 'It should not have been visible when <input/> is scrolled away the scene.');
          expect(component.isVisible).to.equal(false, 'component.isVisible should have been false as <input/> is not visible.');
          expect(this.isVisibleAssignmentCount).to.equal(2, 'It should have assigned to "component.isVisible" twice.');
        }
      }
    ];

    eachCartesianJoin(
      [visibleAttrs, testCases],
      (command, { title, template, app, assert }: ITestCase) => {
        it(title, () => {
          const { au, component, dom } = setupAndStartNormal<IApp>(
            template(command),
            app
          );
          return assert(dom, component, null);
        });
      }
    );
  });

  interface ITestCase<T extends IApp = IApp> {
    title: string;
    template: TemplateFn;
    app: Constructable<T>;
    assert: AssertionFn;
    // getFocusable: string | ((doc: Document) => HTMLElement);
  }

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

  function findInNodeSequence($nodes: INodeSequence, elementSelector: string): Element | null {
    let current = $nodes.firstChild as Node;
    while (current !== null) {
      if (current.nodeType === Node.ELEMENT_NODE) {
        const el = current as Element;
        const found = el.matches(elementSelector) ? el : el.querySelector(elementSelector);
        if (found !== null) {
          return found;
        }
      }
      current = current.nextSibling;
    }
    return null;
  }

  function defaultLifecycleCount() {
    return { bound: 0, binding: 0, attached: 0, attaching: 0 };
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
