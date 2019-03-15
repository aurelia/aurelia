import { Constructable } from '@aurelia/kernel';
import { Aurelia, CustomElementResource, ILifecycle } from '@aurelia/runtime';
import { IEventManager } from '@aurelia/runtime-html';
import { expect } from 'chai';
import { BasicConfiguration } from '@aurelia/jit-html';
import { TestContext } from '../util';
import { eachCartesianJoin, eachCartesianJoinAsync, tearDown } from './util';

// TemplateCompiler - Binding Commands integration
describe('template-compiler.binding-commands.style', () => {

  /** [ruleName, ruleValue, defaultValue, isInvalid, valueOnInvalid] */
  const rulesTests: [string, string, string, boolean?, string?][] = [
    ['background', 'red', ''],
    ['color', 'red', ''],
    ['background-color', 'red', ''],
    ['font-size', '10px', ''],
    ['font-family', 'Arial', ''],
    ['-webkit-user-select', 'none', ''],
    ['--customprop', 'red', ''],
    ['background', 'red!important', ''],
    ['--custumprop', 'nah!important', ''],
    // non happy path
    ['-webkit-user-select', 'of course', '', true, ''],
  ];

  const testCases: ITestCase[] = [
    {
      selector: 'button',
      title: (ruleName: string, ruleValue: string, callIndex: number) => `${callIndex}. ${ruleName}=${ruleValue}`,
      template: (ruleTest) => {
        return `
        <button ${ruleTest}.style="value"></button>
        <button style.${ruleTest}="value"></button>
        <child value.bind="value"></child>
        <child repeat.for="i of 5" value.bind="value"></child>`;
      },
      assert: async (au, lifecycle, host, component, [ruleName, ruleValue, ruleDefaultValue, isInvalid, valueOnInvalid], testCase) => {
        const childEls = host.querySelectorAll('child') as ArrayLike<HTMLElement>;
        const hasImportant = ruleValue.indexOf('!important') > -1;
        const ruleValueNoPriority = hasImportant ? ruleValue.replace('!important', '') : ruleValue;

        expect(childEls.length).to.equal(6);

        component.value = ruleValue;
        await Promise.resolve();
        for (let i = 0, ii = childEls.length; ii > i; ++i) {
          const child = childEls[i];
          expect(
            child.style.getPropertyValue(ruleName),
            `[${ruleName}]component.value="${ruleValue}" 1`
          ).to.equal(isInvalid ? valueOnInvalid : ruleValueNoPriority);
          if (hasImportant) {
            expect(child.style.getPropertyPriority(ruleName)).to.equal('important');
          }
        }

        component.value = '';
        await Promise.resolve();
        for (let i = 0, ii = childEls.length; ii > i; ++i) {
          const child = childEls[i];
          expect(child.style.getPropertyValue(ruleName), `[${ruleName}]component.value="" 1`).to.equal(ruleDefaultValue);
          if (hasImportant) {
            expect(
              child.style.getPropertyPriority(ruleName),
              `!important[${ruleName}]vm.value="" 1`
            ).to.equal('');
          }
        }

        component.value = ruleValue;
        await Promise.resolve();
        for (let i = 0, ii = childEls.length; ii > i; ++i) {
          const child = childEls[i];
          expect(
            child.style.getPropertyValue(ruleName),
            `[${ruleName}]component.value="${ruleValue}" 2`
          ).to.equal(isInvalid ? valueOnInvalid : ruleValueNoPriority);
          if (hasImportant) {
            expect(
              child.style.getPropertyPriority(ruleName),
              `!important[${ruleName}]component.value=${ruleValue} 2`
            ).to.equal('important');
          }
        }

        // TODO: for inlined css, there are rules that employs fallback value when incoming value is inappropriate
        //        better test those scenarios
      }
    }
  ];

  /**
   * For each combination of style rule and test case:
   * Test the following:
   * ----
   * 1. on init, select all elements specified by `testCase.selector`
   *  - verify it has inline style matching `ruleValue` (2nd var in destructed 1st tuple param)
   *  - if `ruleValue` has `"!important"`, verify priority of inline style is `"important"`
   *
   * 2. set `value` of bound view model to empty string. For each of all elements queried by `testCase.selector`
   *  - verify each element has inline style value equal empty string,
   *    or default value (3rd var in destructed 1st tuple param)
   *
   * 3. set `value` of bound view model to `ruleValue` (2nd var in destructed 1st tuple param)
   *  - verify each element has inline style value equal `ruleValue`
   *  - if `ruleValue` has `"!important"`, verify priority of inline style is `"important"`
   *
   * 4. repeat step 2
   * 5. Call custom `assert` of each test case with necessary parameters
   */
  eachCartesianJoin(
    [rulesTests, testCases],
    ([ruleName, ruleValue, ruleDefaultValue, isInvalid, valueOnInvalid], testCase, callIndex) => {
      it(testCase.title(ruleName, ruleValue, callIndex), async () => {
        const { ctx, au, lifecycle, host, component } = setup(
          testCase.template(ruleName),
          class App {
            public value: string = ruleValue;
          },
          BasicConfiguration,
          CustomElementResource.define(
            {
              name: 'child',
              template: `<template ${ruleName}.style="value"></template>`
            },
            class Child {
              public static bindables = {
                value: { property: 'value', attribute: 'value' }
              };
            }
          )
        );
        au.app({ host, component });
        au.start();
        try {
          const els: ArrayLike<HTMLElement> = typeof testCase.selector === 'string'
            ? host.querySelectorAll(testCase.selector)
            : testCase.selector(ctx.doc);
          const ii = els.length;
          const hasImportant = ruleValue.indexOf('!important') > -1;
          const ruleValueNoPriority = hasImportant ? ruleValue.replace('!important', '') : ruleValue;

          for (let i = 0; ii > i; ++i) {
            const el = els[i];
            expect(
              el.style.getPropertyValue(ruleName),
              `[${ruleName}]vm.value="${ruleValue}" 1`
            ).to.equal(isInvalid ? valueOnInvalid : ruleValueNoPriority);
            if (hasImportant) {
              expect(
                el.style.getPropertyPriority(ruleName),
                `!important[${ruleName}]vm.value=${ruleValue} 1`
              ).to.equal('important');
            }
          }

          component.value = '';
          await Promise.resolve();
          for (let i = 0; ii > i; ++i) {
            const el = els[i];
            expect(el.style.getPropertyValue(ruleName), `[${ruleName}]vm.value="" 2`).to.equal(ruleDefaultValue);
            if (hasImportant) {
              expect(
                el.style.getPropertyPriority(ruleName),
                `!important[${ruleName}]vm.value=${ruleValue} 2`
              ).to.equal('');
            }
          }

          component.value = ruleValue;
          await Promise.resolve();
          for (let i = 0; ii > i; ++i) {
            const el = els[i];
            expect(
              el.style.getPropertyValue(ruleName),
              `[${ruleName}]vm.value="${ruleValue}" 3`
            ).to.equal(isInvalid ? valueOnInvalid : ruleValueNoPriority);
            if (hasImportant) {
              expect(
                el.style.getPropertyPriority(ruleName),
                `!important[${ruleName}]vm.value=${ruleValue} 3`
              ).to.equal('important');
            }
          }

          component.value = '';
          await Promise.resolve();
          for (let i = 0; ii > i; ++i) {
            const el = els[i];
            expect(el.style.getPropertyValue(ruleName), `[${ruleName}]vm.value="" 4`).to.equal(ruleDefaultValue);
            if (hasImportant) {
              expect(
                el.style.getPropertyPriority(ruleName),
                `!important[${ruleName}]vm.value=${ruleValue} 4`
              ).to.equal('');
            }
          }

          // TODO: for inlined css, there are rules that employs fallback value when incoming value is inappropriate
          //        better test those scenarios

          await testCase.assert(au, lifecycle, host, component, [ruleName, ruleValue, ruleDefaultValue, isInvalid, valueOnInvalid], testCase);
        } finally {
          const em = ctx.container.get(IEventManager);
          em.dispose();
          tearDown(au, lifecycle, host);
        }
      });
    }
  );

  function noop() {/**/}

  interface IApp {
    value: any;
  }

  interface ITestCase {
    selector: string | ((document: Document) => ArrayLike<HTMLElement>);
    title(...args: unknown[]): string;
    template(...args: string[]): string;
    assert(au: Aurelia, lifecycle: ILifecycle, host: HTMLElement, component: IApp, ruleCase: [string, string, string, boolean?, string?], testCase): void | Promise<void>;
  }

  function setup<T>(template: string | Node, $class: Constructable<T> | null, ...registrations: any[]) {
    const ctx = TestContext.createHTMLTestContext();
    const { container, lifecycle, observerLocator } = ctx;
    container.register(...registrations);
    const host = ctx.doc.body.appendChild(ctx.createElement('app'));
    const au = new Aurelia(container);
    const App = CustomElementResource.define({ name: 'app', template }, $class);
    const component: T = new App();

    return { container, lifecycle, ctx, host, au, component, observerLocator };
  }
});
