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
    resources?: any[];
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
    },
    {
      title: 'Reorder ref binding with custom element',
      // tslint:disable:react-a11y-input-elements
      template: `<template>
        \${div}
        <input value.to-view="div || 'no value'" />
        <div ref='div' ></div>
        <input value.to-view="div || 'no value'" />
        <c-e></c-e>
        <c-e2></c-e2>
        <c-e3></c-e3>
      </template>`,
      resources: [
        CustomElement.define(
          {
            name: 'c-e',
            template: `<template>
              <input value.to-view="span || 'no value'">
              <input value.to-view="span || 'no value'">
              <span ref="span"></span>
            </template>`
          },
          class Ce {}
        ),
        CustomElement.define(
          {
            name: 'c-e2',
            template: `<template>
              <p ref="p"></p>
              <input value.to-view="p || 'no value'">
              <input value.to-view="p || 'no value'">
            </template>`
          },
          class Ce2 {}
        ),
        CustomElement.define(
          {
            name: 'c-e3',
            template: `<template>
              <input value.to-view="f || 'no value'">
              <form ref="f"></form>
              <input value.to-view="f || 'no value'">
            </template>`
          },
          class Ce3 {}
        ),
      ],
      async assertFn(ctx, host, comp: { $controller: IController; div: HTMLElement }): Promise<void> {
        const inputs = Array.from(host.querySelectorAll('input'));
        assert.strictEqual(inputs.length, 8);
        inputs.forEach((input, idx) => {
          if (input.closest('c-e')) {
            assert.equal(input.value, '[object HTMLSpanElement]', `<input /> at index: ${idx} should have had value`);
          } else if (input.closest('c-e2')) {
            assert.equal(input.value, '[object HTMLParagraphElement]', `<input /> at index: ${idx} should have had value`);
          } else if (input.closest('c-e3')) {
            assert.equal(input.value, '[object HTMLFormElement]', `<input /> at index: ${idx} should have had value`);
          } else {
            assert.equal(input.value, '[object HTMLDivElement]', `<input /> at index: ${idx} should have had value`);
          }
        });
      }
    },
    // {
    //   title: 'NOT Reorder let binding (1)',
    //   // tslint:disable:react-a11y-input-elements
    //   template: `<template>
    //     <let div.bind="5"></let>
    //     \${div}
    //     <input value.to-view="div || 'no value'" />
    //     <input value.to-view="div || 'no value'" />
    //   </template>`,
    //   async assertFn(ctx, host, comp: { $controller: IController; div: HTMLElement }): Promise<void> {
    //     host.querySelectorAll('input').forEach((input, idx) => {
    //       assert.equal(input.value, '5', `<input/> @ idx:${idx} should have had value "5"`);
    //     });
    //     assert.equal(host.textContent.trim(), '5', 'host.textContent === "5"');
    //   }
    // },
    // {
    //   title: 'NOT Reorder let binding (2)',
    //   // tslint:disable:react-a11y-input-elements
    //   template: `<template>
    //     \${div}
    //     <input value.to-view="div || 'no value'" />
    //     <let div.bind="5"></let>
    //     <input value.to-view="div || 'no value'" />
    //   </template>`,
    //   async assertFn(ctx, host, comp: { $controller: IController; div: HTMLElement }): Promise<void> {
    //     host.querySelectorAll('input').forEach((input, idx) => {
    //       assert.equal(input.value, '5', `<input/> @ idx:${idx} should have had value "5"`);
    //     });
    //     assert.equal(host.textContent.trim(), '5', 'host.textContent === "5"');
    //   }
    // },
    {
      title: 'NOT Reorder let binding (3)',
      // tslint:disable:react-a11y-input-elements
      template: `<template>
        \${div}
        <input value.to-view="div || 'no value'" />
        <input value.to-view="div || 'no value'" />
        <let div.bind="5"></let>
      </template>`,
      async assertFn(ctx, host, comp: { $controller: IController; div: HTMLElement }): Promise<void> {
        host.querySelectorAll('input').forEach((input, idx) => {
          assert.equal(input.value, '5', `<input/> @ idx:${idx} should have had value "5"`);
        });
        assert.equal(host.textContent.trim(), '5', 'host.textContent === "5"');
      }
    },
  ];

  for (const testCase of testCases) {
    const { title, template, assertFn, resources = [] } = testCase;
    it(title, async function() {
      const ctx = TestContext.createHTMLTestContext();
      ctx.container.register(...resources);

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
