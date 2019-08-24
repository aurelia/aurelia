import {
  RuntimeCompilationResources
} from '@aurelia/kernel';
import {
  Aurelia,
  BindingMode,
  CustomElement,
  IController,
  ITemplateCompiler
} from '@aurelia/runtime';
import {
  assert,
  hJsx,
  HTMLTestContext,
  TestContext
} from '@aurelia/testing';

describe('bindings reordering', function () {

  interface ITemplateCompilerBindingReorderingTestCase {
    title: string;
    template: string | HTMLElement;
    assertFn(ctx: HTMLTestContext, host: HTMLElement, comp: any): void | Promise<void>;
  }

  const testCases: ITemplateCompilerBindingReorderingTestCase[] = [
    {
      title: 'Reorder ref binding (1)',
      // tslint:disable:react-a11y-input-elements
      template: `<template>
        \${div}
        <div ref='div' ></div>
        <input value.to-view="div || 'no value'" />
        <input value.to-view="div || 'no value'" />
      </template>`,
      async assertFn(ctx, host, comp): Promise<void> {
        const [beforeRefInput, afterRefInput] = Array.from(host.querySelectorAll('input'));
        assert.strictEqual(host.querySelector('div'), comp.div);
        assert.equal(host.textContent.trim(), ctx.createElement('div').toString());
        assert.notEqual(beforeRefInput.value, 'no value', 'input before ref should have had DIV');
        assert.notEqual(afterRefInput.value, 'no value', 'input after ref should have had DIV');
      }
    },
    {
      title: 'Reorder ref binding (2)',
      // tslint:disable:react-a11y-input-elements
      template: `<template>
        \${div}
        <input value.to-view="div || 'no value'" />
        <input value.to-view="div || 'no value'" />
        <div ref='div' ></div>
      </template>`,
      async assertFn(ctx, host, comp): Promise<void> {
        const [beforeRefInput, afterRefInput] = Array.from(host.querySelectorAll('input'));
        assert.strictEqual(host.querySelector('div'), comp.div);
        assert.equal(host.textContent.trim(), ctx.createElement('div').toString());
        assert.notEqual(beforeRefInput.value, 'no value', 'input before ref should have had DIV');
        assert.notEqual(afterRefInput.value, 'no value', 'input after ref should have had DIV');
      }
    },
    {
      title: 'Reorder ref binding (3)',
      // tslint:disable:react-a11y-input-elements
      template: `<template>
        \${div}
        <input value.to-view="div || 'no value'" />
        <div ref='div' ></div>
        <input value.to-view="div || 'no value'" />
      </template>`,
      async assertFn(ctx, host, comp: { $controller: IController; div: HTMLElement }): Promise<void> {
        const [beforeRefInput, afterRefInput] = Array.from(host.querySelectorAll('input'));
        assert.strictEqual(host.querySelector('div'), comp.div);
        assert.equal(host.textContent.trim(), ctx.createElement('div').toString());
        assert.notEqual(beforeRefInput.value, 'no value', 'input before ref should have had DIV');
        assert.notEqual(afterRefInput.value, 'no value', 'input after ref should have had DIV');
      }
    }
  ];

  for (const testCase of testCases) {
    const { title, template, assertFn } = testCase;
    it(title, async function() {
      const ctx = TestContext.createHTMLTestContext();

      const au = new Aurelia(ctx.container);
      const host = ctx.doc.body.appendChild(ctx.createElement('app'));
      const component = new (CustomElement.define(
        { name: 'app', template },
        class App { public div: HTMLElement; }
      ))();

      au.app({ host, component });
      au.start();

      await assertFn(ctx, host, component);

      await au.stop().wait();
      host.remove();
    });
  }

});
