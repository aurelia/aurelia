import { Constructable } from '@aurelia/kernel';
import { Aurelia, CustomElementResource, ILifecycle } from '@aurelia/runtime';
import { IEventManager } from '@aurelia/runtime-html';
import { expect } from 'chai';
import { BasicConfiguration } from '../../../src/index';
import { TestContext } from '../../util';
import { eachCartesianJoin, tearDown } from '../util';

// TemplateCompiler - Binding Commands integration
describe('template-compiler.binding-commands.style', () => {
  const falsyValues = [0, false, null, undefined, ''];
  const truthyValues = [1, '1', true, {}, [], Symbol(), function() {/**/}, Number, new Proxy({}, {})];

  /** [ruleName, ruleValue, defaultValue] */
  const rulesTests: [string, string, string][] = [
    ['background', 'red', ''],
    ['color', 'red', ''],
    ['background-color', 'red', ''],
    ['font-size', '10px', ''],
    ['font-family', 'Arial', ''],
    ['-webkit-user-select', 'none', 'none']
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
      assert: async (au, lifecycle, host, component, [ruleName, ruleValue, ruleDefaultValue], testCase) => {
        const childEls = host.querySelectorAll('child') as ArrayLike<HTMLElement>;
        expect(childEls.length).to.equal(6);

        component.value = ruleValue;
        await Promise.resolve();
        for (let i = 0, ii = childEls.length; ii > i; ++i) {
          const child = childEls[i];
          expect(child.style[ruleName], `[${ruleName}]component.value="${ruleValue}"`).to.equal(ruleValue);
        }

        component.value = '';
        await Promise.resolve();
        for (let i = 0, ii = childEls.length; ii > i; ++i) {
          const child = childEls[i];
          expect(child.style[ruleName], `[${ruleName}]component.value=""`).to.equal(ruleDefaultValue);
        }

        component.value = ruleValue;
        await Promise.resolve();
        for (let i = 0, ii = childEls.length; ii > i; ++i) {
          const child = childEls[i];
          expect(child.style[ruleName], `[${ruleName}]component.value="${ruleValue}"`).to.equal(ruleValue);
        }

        // TODO: for inlined css, there are rules that employs fallback value when incoming value is inappropriate
        //        better test those scenarios
      }
    }
  ];

  eachCartesianJoin(
    [rulesTests, testCases],
    ([ruleName, ruleValue, ruleDefaultValue], testCase, callIndex) => {
      it(testCase.title(ruleName, ruleValue, callIndex), async () => {
        const { ctx, au, lifecycle, host, component } = setup(
          testCase.template(ruleName),
          class {
            public value = ruleValue;
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
              // public value = ruleValue;
            }
          )
        );
        au.app({ host, component });
        au.start();
        try {
          const els = typeof testCase.selector === 'string'
            ? host.querySelectorAll(testCase.selector) as NodeListOf<HTMLElement>
            : testCase.selector(ctx.doc);
          for (let i = 0, ii = els.length; ii > i; ++i) {
            const btn = els[i];
            expect(btn.style[ruleName]).to.equal(ruleValue);
          }

          component.value = '';
          await Promise.resolve();
          for (let i = 0, ii = els.length; ii > i; ++i) {
            const el = els[i];
            expect(el.style[ruleName], `[${ruleName}]component.value="${ruleValue}"`).to.equal(ruleDefaultValue);
          }

          component.value = ruleValue;
          await Promise.resolve();
          for (let i = 0, ii = els.length; ii > i; ++i) {
            const btn = els[i];
            expect(btn.style[ruleName], `[${ruleName}]component.value="${ruleValue}"`).to.equal(ruleValue);
          }

          component.value = '';
          await Promise.resolve();
          for (let i = 0, ii = els.length; ii > i; ++i) {
            const btn = els[i];
            expect(btn.style[ruleName], `[${ruleName}]component.value="${ruleValue}"`).to.equal(ruleDefaultValue);
          }

          // TODO: for inlined css, there are rules that employs fallback value when incoming value is inappropriate
          //        better test those scenarios

          await testCase.assert(au, lifecycle, host, component, [ruleName, ruleValue, ruleDefaultValue], testCase);
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
    assert(au: Aurelia, lifecycle: ILifecycle, host: HTMLElement, component: IApp, ruleCase: [string, string, string], testCase): void | Promise<void>;
  }

  function setup(template: string | Node, $class: Constructable | null, ...registrations: any[]) {
    const ctx = TestContext.createHTMLTestContext();
    const { container, lifecycle, observerLocator } = ctx;
    container.register(...registrations);
    const host = ctx.doc.body.appendChild(ctx.createElement('app'));
    const au = new Aurelia(container);
    const App = CustomElementResource.define({ name: 'app', template }, $class);
    const component = new App();

    return { container, lifecycle, ctx, host, au, component, observerLocator };
  }
});
