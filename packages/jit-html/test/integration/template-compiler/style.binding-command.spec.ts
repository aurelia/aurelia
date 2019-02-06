import { LifecycleFlags, ILifecycle, Aurelia } from '@aurelia/runtime';
import { IEventManager } from '@aurelia/runtime-html';
import { expect } from 'chai';
import { spy } from 'sinon';
import { BasicConfiguration } from '../../../src/index';
import { HTMLTestContext, TestContext } from '../../util';
import { TestConfiguration } from '../resources';
import { setupAndStart, setupWithDocumentAndStart, tearDown, eachCartesianJoin, padLeft } from '../util';

// TemplateCompiler - Binding Commands integration
describe('template-compiler.binding-commands.style', () => {
  let ctx: HTMLTestContext;

  beforeEach(() => {
    ctx = TestContext.createHTMLTestContext();
  });
  const rulesTests: [string, string][] = [
    ['background', 'red'],
    ['color', 'red'],
    ['background-color', 'red'],
    ['font-size', '10px'],
    ['font-family', 'Arial'],
    ['-webkit-user-select', 'none']
  ];

  const testCases: ITestCase[] = [
    {
      selector: 'button',
      title: (ruleName: string, ruleValue: string, callIndex: number) => `${callIndex}. ${ruleName}=${ruleValue}`,
      template: (ruleTest) => {
        return `
        <button ${ruleTest}.style="value"></button>
        <button style.${ruleTest}="value"></button>`;
      },
      assert: noop
    }
  ];

  eachCartesianJoin(
    [rulesTests, testCases],
    ([ruleName, ruleValue], testCase, callIndex) => {
      it(testCase.title(ruleName, ruleValue, callIndex), async () => {
        const { au, lifecycle, host, component } = setupWithDocumentAndStart(
          ctx,
          testCase.template(ruleName),
          class {
            public value = ruleValue;
          },
          BasicConfiguration
        );
        try {
          const buttons = host.querySelectorAll(testCase.selector) as NodeListOf<HTMLElement>;
          for (let i = 0, ii = buttons.length; ii > i; ++i) {
            const btn = buttons[i];
            expect(btn.style[ruleName]).to.equal(ruleValue);
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

  function noop() {}

  interface ITestCase {
    selector: string;
    title(...args: unknown[]): string;
    template(...args: string[]): string;
    assert(au: Aurelia, lifecycle: ILifecycle, host: HTMLElement): void | Promise<void>;
  }
});
