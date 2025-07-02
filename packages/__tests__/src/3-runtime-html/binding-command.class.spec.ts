import { Aurelia, BindingMode, CustomElement, IPlatform } from '@aurelia/runtime-html';
import { runTasks } from '@aurelia/runtime';
import { assert, createFixture, eachCartesianJoin } from '@aurelia/testing';
import { ClassAttributePattern } from './attribute-pattern.js';

// TemplateCompiler - Binding Commands integration
describe('3-runtime-html/binding-command.class.spec.ts', function () {

  const falsyValues = [0, false, null, undefined, ''];
  const truthyValues = [1, '1', true, {}, [], Symbol(), function () {/**/ }, Number, new Proxy({}, {})];

  const classNameTests: string[] = [
    'background',
    'color',
    'background-color',
    'font-size',
    'font-family',
    '-webkit-user-select',
    'SOME_RIDI-COU@#$%-class',
    '1',
    '__1',
    '✔',
    '⛓',
    '🤷‍♂️', // double characters
    '🤯',
    ...[
      '@',
      '#',
      '$',
      '!',
      '^',
      '~',
      '&',
      '*',
      '(',
      ')',
      '+',
      // '=', // todo: better test for this scenario
      '*',
      // '/', // todo: better test for this scenario
      '\\',
      ':',
      '[',
      ']',
      '{',
      '}',
      '|',
      '<',
      // '>', // todo: better test for this scenario
      // multi class syntax with , delimiter is supported, having it will result in a different scenario
      // ',',
      '%'
    ].map(s => `${s}1`)
  ];

  const testCases: ITestCase[] = [
    {
      selector: 'button',
      title: (className: string, callIndex: number) => `${callIndex}. <button ${encodeURI(className)}.class=value>`,
      template: (className) => {
        return `
        <button ${className}.class="value"></button>
        <child value.bind="value"></child>
        <child repeat.for="i of 5" value.bind="value"></child>
      `;
      },
      assert: (au, platform, host, component, testCase, className) => {
        const childEls = host.querySelectorAll('child');

        assert.strictEqual(childEls.length, 6, `childEls.length`);

        eachCartesianJoin(
          [falsyValues, truthyValues],
          (falsyValue, truthyValue) => {
            for (let i = 0, ii = childEls.length; ii > i; ++i) {
              const el = childEls[i];
              assert.contains(
                el.classList,
                className.toLowerCase(),
                `[[truthy]]${el.className}.contains(${className}) 1`
              );
            }

            component.value = falsyValue;

            runTasks();

            for (let i = 0, ii = childEls.length; ii > i; ++i) {
              const el = childEls[i];
              assert.notContains(
                el.classList,
                className.toLowerCase(),
                `[${String(falsyValue)}]${el.className}.contains(${className}) 2`
              );
            }

            component.value = truthyValue;

            runTasks();

            for (let i = 0, ii = childEls.length; ii > i; ++i) {
              const el = childEls[i];
              assert.contains(
                el.classList,
                className.toLowerCase(),
                `[${String(truthyValue)}]${el.className}.contains(${className}) 3`
              );
            }
          }
        );
      }
    }
  ];

  const multiClassTestCase_NoBaseClass: ITestCase = {
    selector: 'div',
    title: (classNames: string, callIndex: number) =>
      `${callIndex}. Multi-class binding (no base class) <div ${classNames}.class=value>`,
    template: (classNames) => `<div ${classNames}.class="value"></div>`,
    assert: (au, platform, host, component, testCase, classNames) => {
      const el = host.querySelector('div');
      assert.instanceOf(el, platform.HTMLElement, 'el should be HTMLElement');
      const classes = classNames.split(',').map(c => c.trim()).filter(c => c.length > 0);
      assert.strictEqual(classes.length > 0, true, 'At least one class in multi-class test');

      eachCartesianJoin(
        [falsyValues, truthyValues],
        (falsyValue, truthyValue) => {
          component.value = truthyValue;
          runTasks();
          for (const cls of classes) {
            assert.contains(el.classList, cls.toLowerCase(), `[${String(truthyValue)}]${el.className}.contains(${cls}) - truthy`);
          }

          component.value = falsyValue;
          runTasks();
          for (const cls of classes) {
            assert.notContains(el.classList, cls.toLowerCase(), `[${String(falsyValue)}]${el.className}.contains(${cls}) - falsy`);
          }
        }
      );
    }
  };

  const multiClassTestCase_WithBaseClass: ITestCase = {
    selector: 'div.base-class',
    title: (classNames: string, callIndex: number) =>
      `${callIndex}. Multi-class binding (with base class) <div class="base-class" ${classNames}.class=value>`,
    template: (classNames) => `<div class="base-class" ${classNames}.class="value"></div>`,
    assert: (au, platform, host, component, testCase, classNames) => {
      const el = host.querySelector('div.base-class');
      assert.instanceOf(el, platform.HTMLElement, 'el should be HTMLElement');
      const classes = classNames.split(',').map(c => c.trim()).filter(c => c.length > 0);
      assert.strictEqual(classes.length > 0, true, 'At least one class in multi-class test');

      eachCartesianJoin(
        [falsyValues, truthyValues],
        (falsyValue, truthyValue) => {
          component.value = truthyValue;
          runTasks();
          assert.contains(el.classList, 'base-class', 'Base class should always be present');
          for (const cls of classes) {
            assert.contains(el.classList, cls.toLowerCase(), `[${String(truthyValue)}]${el.className}.contains(${cls}) - truthy`);
          }

          component.value = falsyValue;
          runTasks();
          assert.contains(el.classList, 'base-class', 'Base class should always be present');
          for (const cls of classes) {
            assert.notContains(el.classList, cls.toLowerCase(), `[${String(falsyValue)}]${el.className}.contains(${cls}) - falsy`);
          }
        }
      );
    }
  };

  const multiClassTestCase_CustomElement: ITestCase = {
    selector: 'multi-child',
    title: (classNames: string, callIndex: number) =>
      `${callIndex}. Multi-class binding (custom element) <multi-child value.bind=value>`,
    template: (_) => `<multi-child value.bind="value"></multi-child>`,
    assert: (au, platform, host, component, testCase, classNames) => {
      const el = host.querySelector('multi-child');
      assert.instanceOf(el, platform.HTMLElement, 'el should be HTMLElement');
      const classes = classNames.split(',').map(c => c.trim()).filter(c => c.length > 0);
      assert.strictEqual(classes.length > 0, true, 'At least one class in multi-class test');

      eachCartesianJoin(
        [falsyValues, truthyValues],
        (falsyValue, truthyValue) => {
          component.value = truthyValue;
          runTasks();
          for (const cls of classes) {
            assert.contains(el.classList, cls.toLowerCase(), `[${String(truthyValue)}]${el.className}.contains(${cls}) - truthy`);
          }

          component.value = falsyValue;
          runTasks();
          for (const cls of classes) {
            assert.notContains(el.classList, cls.toLowerCase(), `[${String(falsyValue)}]${el.className}.contains(${cls}) - falsy`);
          }
        }
      );
    }
  };

  /**
   * For each combination of class name and test case
   * Check the following:
   * 1. The element contains the class
   * 2. Each `value` of falsy values, set bound view model value to `value` and:
   * - wait for 1 promise tick
   * - the element does not contain the class
   *
   * 3. Each `value` of truthy values, set bound view model value to `value` and:
   * - wait for 1 promise tick
   * - the element does contain the class
   */
  eachCartesianJoin(
    [classNameTests, testCases],
    (className, testCase, callIndex) => {
      it(`[UNIT] ${testCase.title(className, callIndex)}`, async function () {
        const { ctx, au, platform, appHost, component } = createFixture(
          testCase.template(className),
          class App {
            public value: unknown = true;
          },
          [
            ClassAttributePattern,
            CustomElement.define(
              {
                name: 'child',
                template: `<template ${className}.class="value"></template>`
              },
              class Child {
                public static bindables = {
                  value: { property: 'value', attribute: 'value', mode: BindingMode.twoWay }
                };
                public value = true;
              }
            )
          ]
        );
        const els = typeof testCase.selector === 'string'
          ? appHost.querySelectorAll(testCase.selector)
          : testCase.selector(ctx.doc) as ArrayLike<HTMLElement>;
        for (let i = 0, ii = els.length; ii > i; ++i) {
          const el = els[i];
          assert.contains(
            el.classList,
            className.toLowerCase(),
            `[true]${el.className}.contains(${className}) 1`
          );
        }

        eachCartesianJoin(
          [falsyValues, truthyValues],
          (falsyValue, truthyValue) => {
            component.value = falsyValue;

            runTasks();

            for (let i = 0, ii = els.length; ii > i; ++i) {
              const el = els[i];
              assert.notContains(
                el.classList,
                className.toLowerCase(),
                `[${String(falsyValue)}]${el.className}.contains(${className}) 2`
              );
            }

            component.value = truthyValue;

            runTasks();

            for (let i = 0, ii = els.length; ii > i; ++i) {
              const el = els[i];
              assert.contains(
                el.classList,
                className.toLowerCase(),
                `[${String(truthyValue)}]${el.className}.contains(${className}) 3`
              );
            }
          }
        );
        testCase.assert(au, platform, appHost, component, testCase, className);
      });
    }
  );

  describe('Multiple comma-separated classes binding', function () {
    // Test class pairs for multi-class binding tests
    const multiClassTests = [
      'header-class,footer-class',
      'grid-container,gridRow',
      'primary_btn,active,large',
      'fade-in,visible,animated',
      '🤯,🤷‍♂️',
      '1,2,3,4',
      'SOME_RIDI-COU@#$%-class,3'
    ];

    eachCartesianJoin(
      [multiClassTests, [multiClassTestCase_NoBaseClass, multiClassTestCase_WithBaseClass, multiClassTestCase_CustomElement]],
      (classNames, testCase, callIndex) => {
        it(`[UNIT] ${testCase.title(classNames, callIndex)}`, async function () {
          const { ctx, au, platform, appHost, component } = createFixture(
            testCase.template(classNames),
            class App {
              public value: unknown = true;
            },
            [
              ClassAttributePattern,
              CustomElement.define(
                {
                  name: 'multi-child',
                  template: `<template ${classNames}.class="value"></template>`
                },
                class MultiChild {
                  public static bindables = {
                    value: { property: 'value', attribute: 'value', mode: BindingMode.twoWay }
                  };
                  public value = true;
                }
              )
            ]
          );

          // Split the classNames string to get individual classes for initial verification
          const classes = classNames.split(',')
            .map(c => c.trim())
            .filter(c => c.length > 0);

          // Verify classes are initially present on all elements
          const els = typeof testCase.selector === 'string'
            ? appHost.querySelectorAll(testCase.selector)
            : testCase.selector(ctx.doc) as ArrayLike<HTMLElement>;

          assert.strictEqual(els.length, 1, `Expected exactly one element matching selector: ${testCase.selector}`);
          const el = els[0];

          if (testCase !== multiClassTestCase_WithBaseClass) {
            for (const cls of classes) {
              assert.contains(
                el.classList,
                cls.toLowerCase(),
                `[initial]${el.className}.contains(${cls})`
              );
            }
          } else {
            assert.contains(el.classList, 'base-class', '[initial] Base class should be present');
            for (const cls of classes) {
              assert.contains(
                el.classList,
                cls.toLowerCase(),
                `[initial]${el.className}.contains(${cls})`
              );
            }
          }

          testCase.assert(au, platform, appHost, component, testCase, classNames);
        });
      }
    );
  });

  it('[UNIT] Throws error for invalid multi-class binding syntax (empty after split)', async function () {
    const invalidClassNames = ',,,';
    const template = `<div ${invalidClassNames}.class="value"></div>`;

    await assert.rejects(
      async () => {
        createFixture(
          template,
          class App { public value: unknown = true; },
          [ClassAttributePattern]
        );
      },
      /AUR0723/
      , 'Should throw invalid class binding syntax error'
    );
  });

  interface IApp {
    value: any;
  }

  interface ITestCase {
    selector: string | ((document: Document) => ArrayLike<Element>);
    title(...args: unknown[]): string;
    template(...args: string[]): string;
    assert(au: Aurelia, platform: IPlatform, host: HTMLElement, component: IApp, testCase: ITestCase, className: string): void;
  }
});
