import { Aurelia, ILifecycle, CustomElementResource } from '@aurelia/runtime';
import { IEventManager } from '@aurelia/runtime-html';
import { expect } from 'chai';
import { BasicConfiguration } from '../../../src/index';
import { HTMLTestContext, TestContext } from '../../util';
import { setupAndStart, setupWithDocumentAndStart, tearDown, eachCartesianJoin, padLeft } from '../util';
import { Constructable } from '@aurelia/kernel';

// TemplateCompiler - Binding Commands integration
describe.only('template-compiler.binding-commands.class', () => {

  const rulesTests: string[] = [
    'background',
    'color',
    'background-color',
    'font-size',
    'font-family',
    '-webkit-user-select',
    'SOME_RIDI-COU@#$%-class',
    // '1',
    // '__1',
    // ...[
    // '@',
    // '#',
    // '$',
    // '!',
    // '^',
    // '~',
    // '&',
    // '*',
    // '(',
    // ')',
    // '+',
    // '=',
    // '*',
    // '/',
    // '\\',
    // ':',
    // '[',
    // ']',
    // '{',
    // '}',
    // '|',
    // '<',
    // '>',
    // ',',
    // '%'].map(s => `${s}1`)
  ];

  const testCases: ITestCase[] = [
    {
      selector: 'button',
      title: (className: string, callIndex: number) => `${callIndex}. <button class.${className}=value>`,
      template: (className) => {
        return `
        <button ${className}.class="value"></button>
        <button class.${className}="value"></button>`;
      },
      assert: noop
    },
    {
      selector: doc => doc.querySelectorAll('app'),
      title: (className: string, callIndex: number) => `${callIndex}. <template class.${className}=value>`,
      template: className => `<template ${className}.class="value"></template>`,
      assert: noop
    }
  ];

  eachCartesianJoin(
    [rulesTests, testCases],
    (className, testCase, callIndex) => {
      it(testCase.title(className, callIndex), async () => {
        const { ctx, au, lifecycle, host, component } = setup(
          testCase.template(className),
          class {
            public value = true;
          },
          BasicConfiguration
        );
        try {
          const buttons = typeof testCase.selector === 'string'
            ? host.querySelectorAll(testCase.selector) as NodeListOf<HTMLElement>
            : testCase.selector(ctx.doc);
          for (let i = 0, ii = buttons.length; ii > i; ++i) {
            const btn = buttons[i];
            expect(btn.classList.contains(className.toLowerCase()), `classList.contains(${className})`).to.equal(true);
            await testCase.assert(au, lifecycle, host);
          }
        } finally {
          const em = ctx.container.get(IEventManager);
          em.dispose();
          tearDown(au, lifecycle, host);
        }
      });
    }
  );

  function noop() {/**/}

  interface ITestCase {
    selector: string | ((document: Document) => ArrayLike<Element>);
    title(...args: unknown[]): string;
    template(...args: string[]): string;
    assert(au: Aurelia, lifecycle: ILifecycle, host: HTMLElement): void | Promise<void>;
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
