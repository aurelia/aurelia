import { Constructable } from '@aurelia/kernel';
import { Aurelia, CustomElementResource, ICustomElement, INode } from '@aurelia/runtime';
import { BlurCustomAttribute, BlurListenerConfig } from '@aurelia/runtime-html';
import { expect } from 'chai';
import { spy } from 'sinon';
import { HTMLDOM } from '../../../runtime-html/src/dom';
import { setup } from '../integration/util';
import { HTMLTestContext, TestContext } from '../util';
import { eachCartesianJoin } from './util';

describe('built-in-resources.blur', () => {

  interface IApp {
    hasFocus: boolean;
  }

  let $aurelia: Aurelia;

  beforeEach(() => {
    $aurelia = undefined;
  });

  afterEach(() => {
    if ($aurelia) {
      try {
        $aurelia.stop();
      } catch {/**/}
    }
  });

  describe('with mouse', () => {

    // it('Works in basic scenario', function () {
    //   const { dom, au, host, lifecycle } = setup();

    //   const useSpy = spy(BlurCustomAttribute, 'use');

    //   const App = CustomElementResource.define(
    //     {
    //       name: 'app',
    //       template: `
    //         <template>
    //           <div blur.from-view="isBlur"></div>
    //         </template>`,
    //       dependencies: [BlurCustomAttribute]
    //     },
    //     class {
    //       public isBlur = true;
    //       public selectedValue = '2';
    //     }
    //   );
    //   const component = new App();

    //   au.app({ host, component });
    //   au.start();

    //   dom.dispatchEvent(dom.createCustomEvent('mousedown', { bubbles: true }));

    //   expect(useSpy).to.have.callCount(1);
    //   expect(component['isBlur']).to.equal(false, 'component.isBlur');

    //   useSpy.restore();
    // });

    // for (const cmd of ['from-view', 'two-way']) {
    //   it(`Works with ".${cmd}" command`, function () {
    //     const { dom, au, host, lifecycle } = setup();

    //     const App = CustomElementResource.define(
    //       {
    //         name: 'app',
    //         template: `
    //           <template>
    //             <div blur.${cmd}="isBlur"></div>
    //           </template>`,
    //         dependencies: [BlurCustomAttribute]
    //       },
    //       class {
    //         public isBlur = true;
    //         public selectedValue = '2';
    //       }
    //     );
    //     const component = new App();

    //     au.app({ host, component });
    //     au.start();

    //     dom.dispatchEvent(dom.createCustomEvent('mousedown', { bubbles: true }));
    //     expect(component['isBlur']).to.equal(false, 'component.isBlur');
    //   });
    // }

    describe('Basic scenarios', () => {
      const blurAttrs = [
        'blur.bind=hasFocus',
        'blur.two-way=hasFocus',
        'blur.from-view=hasFocus',
        'blur="value.two-way: hasFocus"',
        'blur="value.bind: hasFocus"',
        'blur="value.from-view: hasFocus"'
      ];
      const normalUsageTestCases: ITestCase[] = [
        {
          title: 'Works in basic scenario',
          template: (blurrAttr) => `<template>
            <div ${blurrAttr}></div>
            <button>Click me to focus</button>
          </template>`,
          getFocusable: 'div',
          app: class App {
            public hasFocus = true;
          },
          async assert(dom, component) {
            createEventOn(dom.document, 'mousedown');
            expect(component.hasFocus).to.equal(false);
            component.hasFocus = true;
            createEventOn(dom.window, 'mousedown');
            expect(component.hasFocus).to.equal(false);
            component.hasFocus = true;
            createEventOn(dom.document.body, 'mousedown');
            expect(component.hasFocus).to.equal(false);

            const button = dom.document.querySelector('button');
            component.hasFocus = true;
            createEventOn(button, 'mousedown');
            expect(component.hasFocus).to.equal(false);
          }
        },
        {
          title: 'Works in basic scenario',
          template: (blurrAttr) => `<template>
            <input ${blurrAttr}>
            <button>Click me to focus</button>
          </template>`,
          getFocusable: 'input',
          app: class App {
            public hasFocus = true;
          },
          async assert(dom, component) {
            createEventOn(dom.document, 'mousedown');
            expect(component.hasFocus).to.equal(false);
            component.hasFocus = true;
            createEventOn(dom.window, 'mousedown');
            expect(component.hasFocus).to.equal(false);
            component.hasFocus = true;
            createEventOn(dom.document.body, 'mousedown');
            expect(component.hasFocus).to.equal(false);

            const button = dom.document.querySelector('button');
            component.hasFocus = true;
            createEventOn(button, 'mousedown');
            expect(component.hasFocus).to.equal(false);
          }
        }
      ];

      const defaultBlurConfig: BlurListenerConfig = {
        focus: true,
        mouse: true,
        touch: true,
        pointer: true,
        wheel: true,
        windowBlur: true
      };

      eachCartesianJoin(
        [blurAttrs, normalUsageTestCases],
        (command, { title, template, getFocusable, app, assert, cfg = defaultBlurConfig}: ITestCase) => {
          it(title, async () => {
            const originalUse = BlurCustomAttribute.use;
            let callCount = 0;
            BlurCustomAttribute.use = function() {
              callCount++;
              return originalUse.call(BlurCustomAttribute, cfg);
            };
            const { au, component, dom } = setupAndStartNormal<IApp>(
              template(command),
              app
            );
            BlurCustomAttribute.use = originalUse;
            expect(callCount).to.equal(1, 'It should have registered listeners.');
            return assert(dom, component, null);
          });
        }
      );
    });


    // it('Works in basic scenario', () => {
    //   const useSpy = spy(BlurCustomAttribute, 'use');
    //   const { component, dom } = setupAndStartNormal<IApp>(
    //     `<template>
    //       <div blur.bind="isBlur"></div>
    //     </template>`,
    //     class {
    //       public isBlur = true;
    //     }
    //   );

    //   dom.dispatchEvent(dom.createCustomEvent('mousedown', { bubbles: true }));

    //   expect(useSpy).to.have.callCount(1);
    //   expect(component.hasFocus).to.equal(false, 'component.isBlur');

    //   useSpy.restore();
    // });

    // for (const cmd of ['from-view', 'two-way']) {
    //   it(`Works with ".${cmd}" command`, () => {
    //     const { component, dom } = setupAndStartNormal<IApp>(
    //       `<template>
    //         <div blur.${cmd}="isBlur"></div>
    //       </template>`,
    //       class {
    //         public isBlur = true;
    //       }
    //     );

    //     dom.dispatchEvent(dom.createCustomEvent('mousedown', { bubbles: true }));

    //     expect(component.hasFocus).to.equal(false, 'component.isBlur');
    //   });
    // }

    // for (const cmd of ['one-time', 'one-way', 'to-view']) {
    //   it(`Does nothing in "${cmd}" command scenario`, () => {
    //     const { component, dom } = setupAndStartNormal<IApp>(
    //       `<template>
    //         <div blur.${cmd}="isBlur"></div>
    //       </template>`,
    //       class {
    //         public isBlur = true;
    //       }
    //     );

    //     const originalTriggerBlur = BlurCustomAttribute.prototype.triggerBlur;

    //     let count = 0;
    //     BlurCustomAttribute.prototype.triggerBlur = () => {
    //       count++;
    //       return originalTriggerBlur.call(this);
    //     };
    //     dom.dispatchEvent(dom.createCustomEvent('mousedown', { bubbles: true }));

    //     expect(count).to.equal(1, 'It should have called "triggerBlur"');
    //     expect(component.hasFocus).to.equal(true, 'component.isBlur');
    //     BlurCustomAttribute.prototype.triggerBlur = originalTriggerBlur;
    //   });
    // }
  });

  interface ITestCase<T extends IApp = IApp> {
    title: string;
    template: TemplateFn;
    app: Constructable<T>;
    assert: AssertionFn;
    cfg?: BlurListenerConfig,
    getFocusable: string | ((doc: Document) => HTMLElement);
  }

  function setupAndStartNormal<T>(template: string | Node, $class: Constructable | null, ...registrations: any[]) {
    const ctx = TestContext.createHTMLTestContext();
    registrations = Array.from(new Set([...registrations, BlurCustomAttribute]));
    const { container, lifecycle, host, au, component, observerLocator } = setup(ctx, template, $class, ...registrations);

    const bodyEl = ctx.doc.body;
    bodyEl.innerHTML = '';
    bodyEl.appendChild(host);

    au.app({ host, component });
    au.start();
    au['stopTasks'].push(() => {
      BlurCustomAttribute.use({
        focus: false,
        mouse: false,
        pointer: false,
        touch: false,
        wheel: false,
        windowBlur: false
      });
    });

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

  function createEventOn(target: EventTarget, name: string) {
    target.dispatchEvent(new CustomEvent(name, { bubbles: true }));
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
