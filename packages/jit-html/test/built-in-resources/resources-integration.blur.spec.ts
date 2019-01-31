import { Constructable } from '@aurelia/kernel';
import { Aurelia, CustomElementResource, ICustomElement, INode } from '@aurelia/runtime';
import { BlurCustomAttribute } from '@aurelia/runtime-html';
import { expect } from 'chai';
import { spy } from 'sinon';
import { HTMLDOM } from '../../../runtime-html/src/dom';
import { setup } from '../integration/util';
import { HTMLTestContext, TestContext } from '../util';

describe('built-in-resources.blur', () => {

  interface IApp {
    isBlur: boolean;
  }

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

    it('Works in basic scenario', () => {
      const useSpy = spy(BlurCustomAttribute, 'use');
      const { component, dom } = setupAndStartNormal<IApp>(
        `<template>
          <div blur.bind="isBlur"></div>
        </template>`,
        class {
          public isBlur = true;
        }
      );

      dom.dispatchEvent(dom.createCustomEvent('mousedown', { bubbles: true }));

      expect(useSpy).to.have.callCount(1);
      expect(component.isBlur).to.equal(false, 'component.isBlur');

      useSpy.restore();
    });

    for (const cmd of ['from-view', 'two-way']) {
      it(`Works with ".${cmd}" command`, () => {
        const { component, dom } = setupAndStartNormal<IApp>(
          `<template>
            <div blur.${cmd}="isBlur"></div>
          </template>`,
          class {
            public isBlur = true;
          }
        );

        dom.dispatchEvent(dom.createCustomEvent('mousedown', { bubbles: true }));

        expect(component.isBlur).to.equal(false, 'component.isBlur');
      });
    }

    for (const cmd of ['one-time', 'one-way', 'to-view']) {
      it(`Does nothing in "${cmd}" command scenario`, () => {
        const { component, dom } = setupAndStartNormal<IApp>(
          `<template>
            <div blur.${cmd}="isBlur"></div>
          </template>`,
          class {
            public isBlur = true;
          }
        );

        const originalTriggerBlur = BlurCustomAttribute.prototype.triggerBlur;

        let count = 0;
        BlurCustomAttribute.prototype.triggerBlur = () => {
          count++;
          return originalTriggerBlur.call(this);
        };
        dom.dispatchEvent(dom.createCustomEvent('mousedown', { bubbles: true }));

        expect(count).to.equal(1, 'It should have called "triggerBlur"');
        expect(component.isBlur).to.equal(true, 'component.isBlur');
        BlurCustomAttribute.prototype.triggerBlur = originalTriggerBlur;
      });
    }

    it('does not respond on touchstart and pointerdown', () => {

    });
  });

  // function setup() {
  //   const ctx = TestContext.createHTMLTestContext();
  //   const { container, lifecycle, dom } = ctx;
  //   const au = new Aurelia(container);
  //   const host = dom.createElement('div');

  //   return { dom, au, host, lifecycle };
  // }

  function setupAndStartNormal<T>(template: string | Node, $class: Constructable | null, ...registrations: any[]) {
    const ctx = TestContext.createHTMLTestContext();
    registrations = Array.from(new Set([...registrations, BlurCustomAttribute]));
    const { container, lifecycle, host, au, component, observerLocator } = setup(ctx, template, $class, ...registrations);

    au.app({ host, component });
    au.start();

    return { dom: ctx.dom, container, lifecycle, host, au, component: component as T, observerLocator };
  }
});
