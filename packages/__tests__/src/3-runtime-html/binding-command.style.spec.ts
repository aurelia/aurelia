import { Constructable } from '@aurelia/kernel';
import { CustomElement, IPlatform, Aurelia } from '@aurelia/runtime-html';
import { runTasks } from '@aurelia/runtime';
import { assert, createFixture, eachCartesianJoin, TestContext } from '@aurelia/testing';
import { isNode } from '../util.js';
import { StyleAttributePattern } from './attribute-pattern.js';

// Remove certain defaults/fallbacks which are added by certain browsers to allow the assertion to pass
function getNormalizedStyle(el: HTMLElement, ruleName: string): string {
  const styleString = el.style.getPropertyValue(ruleName);
  switch (ruleName) {
    case 'background':
      // FireFox adds this
      return styleString.replace(' none repeat scroll 0% 0%', '');
    default:
      return styleString;
  }
}

// TemplateCompiler - Binding Commands integration
describe('3-runtime-html/binding-command.style.spec.ts', function () {
  it('updates style on collection change', async function () {
    const { component, assertAttr } = createFixture
      .component({ paddings: ['20px', '15px', '10px', '5px'] })
      .html`<div padding.style="paddings.join(' ')">`
      .build();

    assertAttr('div', 'style', 'padding: 20px 15px 10px 5px;');

    component.paddings.splice(2);
    runTasks();
    assertAttr('div', 'style', 'padding: 20px 15px;');
  });

  /** [ruleName, ruleValue, defaultValue, isInvalid, valueOnInvalid] */
  const rulesTests: [string, string, string, boolean?, string?][] = [
    ['background', 'red', ''],
    ['color', 'red', ''],
    ['background-color', 'red', ''],
    ['font-size', '10px', ''],
    ['font-family', 'Arial', ''],
    ...(
      // For tests that only work in the browser, only run them in the browser
      !isNode()
        ? [
          ['-webkit-user-select', 'none', ''],
        ] as [string, string, string][]
        : [

        ]
    ),
    ['--customprop', 'red', ''],
    ['--custumprop', 'nah!important', ''],
    ['background', 'red!important', ''],
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
      assert: (au, platform, host, component, [ruleName, ruleValue, ruleDefaultValue, isInvalid, valueOnInvalid], _testCase) => {
        const childEls = host.querySelectorAll('child') as ArrayLike<HTMLElement>;
        const hasImportant = ruleValue.includes('!important');
        const ruleValueNoPriority = hasImportant ? ruleValue.replace('!important', '') : ruleValue;

        assert.strictEqual(childEls.length, 6, `childEls.length`);

        component.value = ruleValue;

        runTasks();

        for (let i = 0, ii = childEls.length; ii > i; ++i) {
          const child = childEls[i];
          assert.strictEqual(
            getNormalizedStyle(child, ruleName),
            isInvalid ? valueOnInvalid : ruleValueNoPriority,
            `[${ruleName}]component.value="${ruleValue}" 1`
          );
          if (hasImportant) {
            assert.strictEqual(child.style.getPropertyPriority(ruleName), 'important', `child.style.getPropertyPriority(ruleName)`);
          }
        }

        component.value = '';

        runTasks();

        for (let i = 0, ii = childEls.length; ii > i; ++i) {
          const child = childEls[i];
          assert.strictEqual(getNormalizedStyle(child, ruleName), ruleDefaultValue, `[${ruleName}]component.value="" 1`);
          if (hasImportant) {
            assert.strictEqual(
              child.style.getPropertyPriority(ruleName),
              '',
              `!important[${ruleName}]vm.value="" 1`
            );
          }
        }

        component.value = ruleValue;

        runTasks();

        for (let i = 0, ii = childEls.length; ii > i; ++i) {
          const child = childEls[i];
          assert.strictEqual(
            getNormalizedStyle(child, ruleName),
            isInvalid ? valueOnInvalid : ruleValueNoPriority,
            `[${ruleName}]component.value="${ruleValue}" 2`
          );
          if (hasImportant) {
            assert.strictEqual(
              child.style.getPropertyPriority(ruleName),
              'important',
              `!important[${ruleName}]component.value=${ruleValue} 2`
            );
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
   * - verify it has inline style matching `ruleValue` (2nd var in destructed 1st tuple param)
   * - if `ruleValue` has `"!important"`, verify priority of inline style is `"important"`
   *
   * 2. set `value` of bound view model to empty string. For each of all elements queried by `testCase.selector`
   * - verify each element has inline style value equal empty string, or default value (3rd var in destructed 1st tuple param)
   *
   * 3. set `value` of bound view model to `ruleValue` (2nd var in destructed 1st tuple param)
   * - verify each element has inline style value equal `ruleValue`
   * - if `ruleValue` has `"!important"`, verify priority of inline style is `"important"`
   *
   * 4. repeat step 2
   * 5. Call custom `assert` of each test case with necessary parameters
   */
  eachCartesianJoin(
    [rulesTests, testCases],
    ([ruleName, ruleValue, ruleDefaultValue, isInvalid, valueOnInvalid], testCase, callIndex) => {
      it(testCase.title(ruleName, ruleValue, callIndex), async function () {
        const { ctx, au, platform, host, component, tearDown } = $createFixture(
          testCase.template(ruleName),
          class App {
            public value: string = ruleValue;
          },
          StyleAttributePattern,
          CustomElement.define(
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
        await au.start();
        try {
          const els: ArrayLike<HTMLElement> = typeof testCase.selector === 'string'
            ? host.querySelectorAll(testCase.selector)
            : testCase.selector(ctx.doc);
          const ii = els.length;
          const hasImportant = ruleValue.includes('!important');
          const ruleValueNoPriority = hasImportant ? ruleValue.replace('!important', '') : ruleValue;

          for (let i = 0; ii > i; ++i) {
            const el = els[i];
            assert.strictEqual(
              getNormalizedStyle(el, ruleName),
              isInvalid ? valueOnInvalid : ruleValueNoPriority,
              `[${ruleName}]vm.value="${ruleValue}" 1`
            );
            if (hasImportant) {
              assert.strictEqual(
                el.style.getPropertyPriority(ruleName),
                'important',
                `!important[${ruleName}]vm.value=${ruleValue} 1`
              );
            }
          }

          component.value = '';

          runTasks();

          for (let i = 0; ii > i; ++i) {
            const el = els[i];
            assert.strictEqual(getNormalizedStyle(el, ruleName), ruleDefaultValue, `[${ruleName}]vm.value="" 2`);
            if (hasImportant) {
              assert.strictEqual(
                el.style.getPropertyPriority(ruleName),
                '',
                `!important[${ruleName}]vm.value=${ruleValue} 2`
              );
            }
          }

          component.value = ruleValue;

          runTasks();

          for (let i = 0; ii > i; ++i) {
            const el = els[i];
            assert.strictEqual(
              getNormalizedStyle(el, ruleName),
              isInvalid ? valueOnInvalid : ruleValueNoPriority,
              `[${ruleName}]vm.value="${ruleValue}" 3`
            );
            if (hasImportant) {
              assert.strictEqual(
                el.style.getPropertyPriority(ruleName),
                'important',
                `!important[${ruleName}]vm.value=${ruleValue} 3`
              );
            }
          }

          component.value = '';

          runTasks();

          for (let i = 0; ii > i; ++i) {
            const el = els[i];
            assert.strictEqual(getNormalizedStyle(el, ruleName), ruleDefaultValue, `[${ruleName}]vm.value="" 4`);
            if (hasImportant) {
              assert.strictEqual(
                el.style.getPropertyPriority(ruleName),
                '',
                `!important[${ruleName}]vm.value=${ruleValue} 4`
              );
            }
          }

          // TODO: for inlined css, there are rules that employs fallback value when incoming value is inappropriate
          //        better test those scenarios

          await testCase.assert(au, platform, host, component, [ruleName, ruleValue, ruleDefaultValue, isInvalid, valueOnInvalid], testCase);
        } finally {
          tearDown();
          await au.stop();

          au.dispose();
        }
      });
    }
  );

  interface IApp {
    value: any;
  }

  interface ITestCase {
    selector: string | ((document: Document) => ArrayLike<HTMLElement>);
    title(...args: unknown[]): string;
    template(...args: string[]): string;
    assert(au: Aurelia, platform: IPlatform, host: HTMLElement, component: IApp, ruleCase: [string, string, string, boolean?, string?], testCase): void | Promise<void>;
  }

  function $createFixture<T extends object>(template: string | Node, $class: Constructable<T> | null, ...registrations: any[]) {
    const ctx = TestContext.create();
    const { container, observerLocator, platform } = ctx;
    container.register(...registrations);
    const host = ctx.doc.body.appendChild(ctx.createElement('app'));
    const au = new Aurelia(container);
    const App = CustomElement.define({ name: 'app', template }, $class);
    const component: T = new App();

    function tearDown() {
      ctx.doc.body.removeChild(host);
    }

    return { container, platform, ctx, host, au, component, observerLocator, tearDown };
  }
});
