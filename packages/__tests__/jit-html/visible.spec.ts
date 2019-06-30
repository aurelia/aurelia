import { Constructable, Tracer } from '@aurelia/kernel';
import { Aurelia, INodeSequence, Controller, CustomElementResource, ValueConverterResource, bindable } from '@aurelia/runtime';
import { FocusCustomAttribute } from '@aurelia/runtime-html';
import { assert, HTMLTestContext, enableTracing } from '@aurelia/testing';
import { HTMLDOM } from '@aurelia/runtime-html';
// import { setup } from '../integration/util';
import { TestContext } from '@aurelia/testing';
import { eachCartesianJoin } from '@aurelia/testing';
import { DebugConfiguration, TraceConfiguration } from '@aurelia/debug';

describe.only('built-in-resources.visible', function() {

  interface IApp {
    isBlur?: boolean;
    isFocused2?: boolean;
    isVisible?: boolean;
    isVisibleAssignmentCount?: number;
    selectedOption?: string;
    lifecycleCount?: {
      binding: number;
      bound: number;
      attaching: number;
      attached: number;
    };
  }

  let $aurelia: Aurelia;

  beforeEach(function() {
    $aurelia = undefined;
  });

  afterEach(function() {
    if ($aurelia) {
      $aurelia.stop();
    }
  });

  describe.only('basic scenarios', function() {

    const visibleAttrs = [
      // 'visible.bind="isVisible"',
      'visible.from-view="isVisible | logMe"',
      // 'visible.from-view="isVisible"',
      // 'visible="value.two-way: isVisible"',
      // 'visible="value.from-view: isVisible"',
      // 'visible="value.bind: isVisible"'
    ];
    const testCases: IVisibleAttributeTestCase[] = [
      {
        title: 'Visible when it stays at the edge of the visible viewpot',
        template: (visibleAttr) => `<template>
          <div style="height: 500px; overflow-y: auto">
            <div style="height: 500px;"></div>
           <input ${visibleAttr} class="\${isVisible ? 'visible' : 'not-visible' }" id="input1" />
          </div>
          <button>Click me</button>
        </template>`,
        app: (() => {
          class App {
            
            public isBlur = true;
            public lifecycleCount = defaultLifecycleCount();
            public $controller: Controller;
            
            @bindable isVisible = 0 as any;

            // public bound() {
            //   this.lifecycleCount.bound++;
            //   const $nodes = this.$controller.nodes;
            //   const input = findInNodeSequence($nodes, 'input');
            //   assert.notEqual(input, null, 'it should have had input element');
            //   assert.equal(input.classList.contains('visible'), false, 'LifeCycles > Bound. It should have been visible when not connected.');
            // }

            public attaching() {
              this.lifecycleCount.attaching++;
              const $nodes = this.$controller.nodes;
              const input = findInNodeSequence($nodes, 'input');
              assert.notEqual(input, null, 'it should have had input element');
              assert.equal(input.classList.contains('visible'), false, 'LifeCycles > Attaching. It should have been visible when not connected.');
            }
          }
          return App;
        })(),
        async assert({ window, document }: HTMLDOM, component, focusable) {
          // assert.equal(component.lifecycleCount.bound, 1, 'It should have invoked bound');
          debugger;
          assert.equal(component.lifecycleCount.attaching, 1, 'It should have invoked attaching');
          const input = document.querySelector('input');
          assert.equal(component.isVisible, true, 'component.isVisible should have been true as element is visible.');
          assert.equal(input.classList.contains('visible'), true, 'It should have been visible when attached.');
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
          $controller: Controller;
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
            const $nodes = this.$controller.nodes;
            const input = findInNodeSequence($nodes, 'input');
            assert.notEqual(input, null, 'it should have had input element');
            assert.equal(input.classList.contains('visible'), false, 'It should have been visible when not connected.');
            assert.equal(this.isVisible, false, 'component.isVisible state should not have been altered.');
            assert.equal(this.isVisibleAssignmentCount, 0, 'It should not have tried to assign to "component.isVisible".');
          }

          public attaching() {
            this.lifecycleCount.attaching++;
            const $nodes = this.$controller.nodes;
            const input = findInNodeSequence($nodes, 'input');
            assert.notEqual(input, null, 'it should have had input element');
            assert.equal(input.classList.contains('visible'), false, 'It should have been visible when not connected.');
            assert.equal(this.isVisible, false, 'component.isVisible state should not have been altered.');
            assert.equal(this.isVisibleAssignmentCount, 0, 'It should not have tried to assign to "component.isVisible".');
          }
        },
        async assert({ window, document }: HTMLDOM, component, focusable) {
          assert.equal(component.lifecycleCount.bound, 1, 'It should have invoked bound');
          assert.equal(component.lifecycleCount.attaching, 1, 'It should have invoked attaching');
          const input = document.querySelector('input');
          assert.equal(input.classList.contains('visible'), true, 'It should have been visible when attached.');
          assert.equal(component.isVisible, true, 'component.isVisible should have been true as element is visible.');
          assert.equal(this.isVisibleAssignmentCount, 1, 'It should have assigned to "component.isVisible" only once.');
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
          $controller: Controller;
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
            const $nodes = this.$controller.nodes;
            const input = findInNodeSequence($nodes, 'input');
            assert.notEqual(input, null, 'it should have had input element');
            assert.equal(input.classList.contains('visible'), false, 'It should have been visible when not connected.');
            assert.equal(this.isVisible, false, 'component.isVisible state should not have been altered.');
            assert.equal(this.isVisibleAssignmentCount, 0, 'It should not have tried to assign to "component.isVisible".');
          }

          public attaching() {
            this.lifecycleCount.attaching++;
            const $nodes = this.$controller.nodes;
            const input = findInNodeSequence($nodes, 'input');
            assert.equal(input.classList.contains('visible'), false, 'It should have been visible when not connected.');
            assert.equal(this.isVisible, false, 'component.isVisible state should not have been altered.');
            assert.equal(this.isVisibleAssignmentCount, 0, 'It should not have tried to assign to "component.isVisible".');
          }
        },
        async assert({ window, document }: HTMLDOM, component) {
          assert.equal(component.lifecycleCount.bound, 1, 'It should have invoked bound');
          assert.equal(component.lifecycleCount.attaching, 1, 'It should have invoked attaching');
          const input = document.querySelector('input');
          assert.equal(input.classList.contains('visible'), true, 'It should have been visible when attached.');
          assert.equal(component.isVisible, true, 'component.isVisible should have been true as element is visible.');
          assert.equal(this.isVisibleAssignmentCount, 1, 'It should have assigned to "component.isVisible" only once.');
        }
      }
    ];

    eachCartesianJoin(
      [visibleAttrs, testCases.slice(0, 1)],
      (command, { title, template, app, assert }: IVisibleAttributeTestCase) => {
        it(title, function() {
          const { au, component, dom } = setupAndStartNormal<IApp>(
            template(command),
            app
          );
          return assert(dom, component, null);
        });
      }
    );
  });

  describe('styling changes scenarios', function() {

    const visibleAttrs = [
      'visible.bind="isVisible"',
      'visible.two-way="isVisible"',
      'visible.from-view="isVisible"',
      'visible="value.two-way: isVisible"',
      'visible="value.from-view: isVisible"',
      'visible="value.bind: isVisible"'
    ];
    const testCases: IVisibleAttributeTestCase[] = [
      {
        title: 'Visible when it becomes visible because of styling changes',
        template: (visibleAttr) => `<template>
          <input ${visibleAttr} class="\${isVisible ? 'visible' : 'not-visible' }" style="display: none" />
        </template>`,
        app: class App {
          $controller: Controller;
          public isBlur = true;
          public lifecycleCount = defaultLifecycleCount();

          public bound() {
            this.lifecycleCount.bound++;
            const $nodes = this.$controller.nodes;
            const input = findInNodeSequence($nodes, 'input');
            assert.notEqual(input, null, 'it should have had input element');
            assert.equal(input.classList.contains('visible'), false, 'It should have been visible when not connected.');
          }

          public attaching() {
            this.lifecycleCount.attaching++;
            const $nodes = this.$controller.nodes;
            const input = findInNodeSequence($nodes, 'input');
            assert.notEqual(input, null, 'it should have had input element');
            assert.equal(input.classList.contains('visible'), false, 'It should have been visible when not connected.');
          }
        },
        async assert({ window, document }: HTMLDOM, component, focusable) {
          assert.equal(component.lifecycleCount.bound, 1, 'It should have invoked bound');
          assert.equal(component.lifecycleCount.attaching, 1, 'It should have invoked attaching');
          const input = document.querySelector('input');
          assert.equal(component.isVisible, false, 'component.isVisible should have been false as element is invisible.');
          input.style.display = '';
          await waitForDelay(1);
          assert.equal(component.isVisible, true, 'component.isVisible should have been true as element is visible.');
          assert.equal(component.isVisibleAssignmentCount, 1, 'There should have been only one assignment to isivible.');
          assert.equal(input.classList.contains('visible'), true, 'It should have had "visible" css class.');
        }
      },
      {
        title: 'Visible when it becomes visible because of styling changes',
        template: (visibleAttr) => `<template>
          <input ${visibleAttr} class="\${isVisible ? 'visible' : 'not-visible' } hidden" />
        </template>`,
        app: class App {
          $controller: Controller;
          public isBlur = true;
          public lifecycleCount = defaultLifecycleCount();

          public bound() {
            this.lifecycleCount.bound++;
            const $nodes = this.$controller.nodes;
            const input = findInNodeSequence($nodes, 'input');
            assert.notEqual(input, null, 'it should have had input element');
            assert.equal(input.classList.contains('visible'), false, 'It should have been visible when not connected.');
          }

          public attaching() {
            this.lifecycleCount.attaching++;
            const $nodes = this.$controller.nodes;
            const input = findInNodeSequence($nodes, 'input');
            assert.notEqual(input, null, 'it should have had input element');
            assert.equal(input.classList.contains('visible'), false, 'It should have been visible when not connected.');
          }
        },
        async assert({ window, document }: HTMLDOM, component, focusable) {
          assert.equal(component.lifecycleCount.bound, 1, 'It should have invoked bound');
          assert.equal(component.lifecycleCount.attaching, 1, 'It should have invoked attaching');
          const input = document.querySelector('input');
          assert.equal(component.isVisible, false, 'component.isVisible should have been false as element is invisible.');
          input.classList.remove('hidden');
          await waitForDelay(1);
          assert.equal(component.isVisible, true, 'component.isVisible should have been true as element is visible.');
          assert.equal(component.isVisibleAssignmentCount, 1, 'There should have been only one assignment to isivible.');
          assert.equal(input.classList.contains('visible'), true, 'It should have had "visible" css class.');
        }
      },
    ];

    eachCartesianJoin(
      [visibleAttrs, testCases],
      (command, { title, template, app, assert }: IVisibleAttributeTestCase) => {
        it(title, function() {
          const { au, component, dom } = setupAndStartNormal<IApp>(
            template(command),
            app
          );
          return assert(dom, component, null);
        });
      }
    );
  });

  xdescribe('scrolling involved scenarios', function() {

    const visibleAttrs = [
      'visible.bind="isVisible"',
      'visible.two-way="isVisible"',
      'visible.from-view="isVisible"',
      'visible="value.two-way: isVisible"',
      'visible="value.from-view: isVisible"',
      'visible="value.bind: isVisible"'
    ];
    const testCases: IVisibleAttributeTestCase[] = [
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
          $controller: Controller;
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
            const $nodes = this.$controller.nodes;
            const input = findInNodeSequence($nodes, 'input');
            assert.notEqual(input, null, 'it should have had input element');
            assert.equal(input.classList.contains('visible'), false, 'It should have been visible when not connected.');
            assert.equal(this.isVisible, false, 'component.isVisible state should not have been altered.');
            assert.equal(this.isVisibleAssignmentCount, 0, 'It should not have tried to assign to "component.isVisible".');
          }

          public attaching() {
            this.lifecycleCount.attaching++;
            const $nodes = this.$controller.nodes;
            const input = findInNodeSequence($nodes, 'input');
            assert.notEqual(input, null, 'it should have had input element');
            assert.equal(input.classList.contains('visible'), false, 'It should have been visible when not connected.');
            assert.equal(this.isVisible, false, 'component.isVisible state should not have been altered.');
            assert.equal(this.isVisibleAssignmentCount, 0, 'It should not have tried to assign to "component.isVisible".');
          }
        },
        async assert({ window, document }: HTMLDOM, component, focusable) {
          assert.equal(component.lifecycleCount.bound, 1, 'It should have invoked bound');
          assert.equal(component.lifecycleCount.attaching, 1, 'It should have invoked attaching');
          const input = document.querySelector('input');
          assert.equal(input.classList.contains('visible'), false, 'It should not have been visible when attached.');
          assert.equal(component.isVisible, false, 'component.isVisible should not have been true as element is visible.');
          assert.equal(this.isVisibleAssignmentCount, 0, 'It should not have assigned to "component.isVisible".');
          // Scroll input to edge of the visible viewport
          (input.previousElementSibling as HTMLElement).style.height = '500px';
          await waitForDelay(1);
          assert.equal(input.classList.contains('visible'), true, 'It should have been visible when <input/> is scrolled into the scene.');
          assert.equal(component.isVisible, true, 'component.isVisible should have been true as element is visible.');
          assert.equal(this.isVisibleAssignmentCount, 1, 'It should have assigned to "component.isVisible" once.');
          // Scroll input out/away from visible viewport
          (input.previousElementSibling as HTMLElement).style.height = '600px';
          await waitForDelay(1);
          assert.equal(input.classList.contains('visible'), false, 'It should not have been visible when <input/> is scrolled away the scene.');
          assert.equal(component.isVisible, false, 'component.isVisible should have been false as <input/> is not visible.');
          assert.equal(this.isVisibleAssignmentCount, 2, 'It should have assigned to "component.isVisible" twice.');
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
          $controller: Controller;
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
            const $nodes = this.$controller.nodes;
            const input = findInNodeSequence($nodes, 'input');
            assert.notEqual(input, null, 'it should have had input element');
            assert.equal(input.classList.contains('visible'), false, 'It should have been visible when not connected.');
            assert.equal(this.isVisible, false, 'component.isVisible state should not have been altered.');
            assert.equal(this.isVisibleAssignmentCount, 0, 'It should not have tried to assign to "component.isVisible".');
          }

          public attaching() {
            this.lifecycleCount.attaching++;
            const $nodes = this.$controller.nodes;
            const input = findInNodeSequence($nodes, 'input');
            assert.notEqual(input, null, 'it should have had input element');
            assert.equal(input.classList.contains('visible'), false, 'It should have been visible when not connected.');
            assert.equal(this.isVisible, false, 'component.isVisible state should not have been altered.');
            assert.equal(this.isVisibleAssignmentCount, 0, 'It should not have tried to assign to "component.isVisible".');
          }
        },
        async assert({ window, document }: HTMLDOM, component) {
          assert.equal(component.lifecycleCount.bound, 1, 'It should have invoked bound');
          assert.equal(component.lifecycleCount.attaching, 1, 'It should have invoked attaching');
          const input = document.querySelector('input');
          assert.equal(input.classList.contains('visible'), false, 'It should not have been visible when attached.');
          assert.equal(component.isVisible, false, 'component.isVisible should not have been true as element is visible.');
          assert.equal(this.isVisibleAssignmentCount, 0, 'It should not have assigned to "component.isVisible".');
          // Scroll input to edge of the visible viewport
          (input.previousElementSibling as HTMLElement).style.height = '100vh';
          await waitForDelay(1);
          assert.equal(input.classList.contains('visible'), true, 'It should have been visible when <input/> is scrolled into the scene.');
          assert.equal(component.isVisible, true, 'component.isVisible should have been true as element is visible.');
          assert.equal(this.isVisibleAssignmentCount, 1, 'It should have assigned to "component.isVisible" once.');
          // Scroll input out/away from visible viewport
          (input.previousElementSibling as HTMLElement).style.height = 'calc(100vh + 100px)';
          await waitForDelay(1);
          assert.equal(input.classList.contains('visible'), false, 'It should not have been visible when <input/> is scrolled away the scene.');
          assert.equal(component.isVisible, false, 'component.isVisible should have been false as <input/> is not visible.');
          assert.equal(this.isVisibleAssignmentCount, 2, 'It should have assigned to "component.isVisible" twice.');
        }
      }
    ];

    eachCartesianJoin(
      [visibleAttrs, testCases],
      (command, { title, template, app, assert }: IVisibleAttributeTestCase) => {
        it(title, function() {
          const { au, component, dom } = setupAndStartNormal<IApp>(
            template(command),
            app
          );
          return assert(dom, component, null);
        });
      }
    );
  });

  interface IVisibleAttributeTestCase<T extends IApp = IApp> {
    title: string;
    template: TemplateFn;
    app: Constructable<T>;
    assert: AssertionFn;
    // getFocusable: string | ((doc: Document) => HTMLElement);
  }

  function setupAndStartNormal<T>(template: string | Node, $class: Constructable | null, ...registrations: any[]) {
    // enableTracing();
    // Tracer.enableLiveLogging({
    //   di: true,
    //   jit: true,
    //   rendering: true,
    //   lifecycle: true,
    //   binding: true,
    //   attaching: true,
    //   mounting: true,
    //   observation: true
    // });
    const ctx = TestContext.createHTMLTestContext();

    registrations = Array.from(new Set([
      ...registrations,
      ValueConverterResource.define('logMe', class {
        fromView() {
          console.log(arguments);
          return arguments[0];
        }
      })
    ]));
    const { container, lifecycle, host, au, component, observerLocator } = setup(ctx, template, $class, ...registrations);


    ctx.doc.body.innerHTML = '';
    ctx.doc.body.appendChild(host);

    au.app({ host, component });
    au.start();

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

  function setup(ctx: HTMLTestContext, template: string | Node, $class: Constructable | null, ...registrations: any[]) {
    const { container, lifecycle, observerLocator } = ctx;
    container.register(...registrations);
    const host = ctx.createElement('app');
    const au = new Aurelia(container);
    const App = CustomElementResource.define({ name: 'app', template }, $class);
    const component = new App();
  
    return { container, lifecycle, host, au, component, observerLocator };
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