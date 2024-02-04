import { TestContext, assert } from '@aurelia/testing';
import { CustomElement, Aurelia, CustomAttribute, ICustomAttributeViewModel } from '@aurelia/runtime-html';

describe('3-runtime-html/template-compiler.ce_and_surrogate.spec.ts', function () {
  interface ISurrogateIntegrationTestCase {
    title: string;
    template: string;
    root?: any;
    resources?: any[];
    assertFn: <T = any>(ctx: TestContext, host: HTMLElement, comp: T) => void | Promise<void>;
  }

  const testCases: ISurrogateIntegrationTestCase[] = [
    {
      title: 'Basic surrogate [class] merge scenario',
      template: '<foo class="h-100">',
      resources: [
        CustomElement.define(
          {
            name: 'foo',
            template: '<template class="h-200"></template>'
          }
        )
      ],
      assertFn: (ctx, host, _comp) => {
        const foo = host.querySelector('foo');
        ['h-100', 'h-200'].forEach(klass => {
          assert.contains(foo.classList, klass, `<foo/> should have had ${klass}`);
        });
      }
    },
    {
      title: 'Basic surrogate [class] merge scenario with interpolation + value comes from internal',
      template: '<foo class="h-100">',
      resources: [
        CustomElement.define(
          {
            name: 'foo',
            template: `<template class="\${klass} h-200"></template>`
          },
          class Foo {
            public klass: string = 'hello';
          }
        )
      ],
      assertFn: (ctx, host, _comp) => {
        const foo = host.querySelector('foo');
        ['h-100', 'h-200', 'hello'].forEach(klass => {
          assert.contains(foo.classList, klass, `<foo/> should have had ${klass}`);
        });
      }
    },
    {
      title: 'Basic surrogate [class] merge scenario with interpolation + value comes from external (1)',
      template: '<foo class="h-100" klass="h-300">',
      resources: [
        CustomElement.define(
          {
            name: 'foo',
            template: `<template class="\${klass} h-200"></template>`,
            bindables: ['klass']
          }
        )
      ],
      assertFn: (ctx, host, _comp) => {
        const foo = host.querySelector('foo');
        ['h-100', 'h-200', 'h-300'].forEach(klass => {
          assert.contains(foo.classList, klass, `<foo/> should have had ${klass}`);
        });
      }
    },
    {
      title: 'Basic surrogate [class] merge scenario with interpolation + value comes from external (2)',
      template: `<foo class="h-100" klass="\${klass}">`,
      root: class App {
        public klass: string = 'hello-from-app';
      },
      resources: [
        CustomElement.define(
          {
            name: 'foo',
            template: `<template class="\${klass} h-200"></template>`,
            bindables: ['klass']
          }
        )
      ],
      assertFn: (ctx, host, _comp) => {
        const foo = host.querySelector('foo');
        ['h-100', 'h-200', 'hello-from-app'].forEach(klass => {
          assert.contains(foo.classList, klass, `<foo/> should have had ${klass}`);
        });
      }
    },
    {
      title: 'Basic surrogate [class] merge scenario with interpolation + value comes from external (3)',
      template: `<foo class="h-100" klass.bind="klass">`,
      root: class App {
        public klass: string = 'hello-from-app';
      },
      resources: [
        CustomElement.define(
          {
            name: 'foo',
            template: `<template class="\${klass} h-200"></template>`,
            bindables: ['klass']
          }
        )
      ],
      assertFn: (ctx, host, _comp) => {
        const foo = host.querySelector('foo');
        ['h-100', 'h-200', 'hello-from-app'].forEach(klass => {
          assert.contains(foo.classList, klass, `<foo/> should have had ${klass}`);
        });
      }
    },
    {
      title: 'Basic surrogate [style] merge scenario',
      template: '<foo style="height: 100px;">',
      resources: [
        CustomElement.define(
          {
            name: 'foo',
            template: '<template style="width: 100px;"></template>'
          }
        )
      ],
      assertFn: (ctx, host, _comp) => {
        const foo: HTMLElement = host.querySelector('foo');
        [['width', '100px'], ['height', '100px']].forEach(expectedValuePair => {
          const [rule, value] = expectedValuePair;
          assert.strictEqual(foo.style[rule], value, `<foo/> should have had style [${rule}] with value [${value}]`);
        });
      }
    },
    {
      title: 'Basic surrogate with text nodes and template',
      template: '<foo>',
      resources: [
        CustomElement.define(
          {
            name: 'foo',
            template: 'before <template>ignored</template> after'
          }
        )
      ],
      assertFn: (ctx, host, _comp) => {
        assert.html.textContent(host, 'before after');
      }
    },
    {
      title: 'Basic surrogate with before text nodes and template',
      template: '<foo>',
      resources: [
        CustomElement.define(
          {
            name: 'foo',
            template: 'before <template>ignored</template>'
          }
        )
      ],
      assertFn: (ctx, host, _comp) => {
        assert.html.textContent(host, 'before');
      }
    },
    {
      title: 'Basic surrogate with after text nodes and template',
      template: '<foo>',
      resources: [
        CustomElement.define(
          {
            name: 'foo',
            template: '<template>ignored</template> after'
          }
        )
      ],
      assertFn: (ctx, host, _comp) => {
        assert.html.textContent(host, 'after');
      }
    },
    {
      title: 'Basic surrogate with text nodes and template',
      template: '<foo>',
      resources: [
        CustomElement.define(
          {
            name: 'foo',
            template: 'before <div>foo</div> after'
          }
        )
      ],
      assertFn: (ctx, host, _comp) => {
        assert.html.textContent(host, 'before foo after');
      }
    },
    {
      title: 'Basic surrogate with before text nodes and template',
      template: '<foo>',
      resources: [
        CustomElement.define(
          {
            name: 'foo',
            template: 'before <div>foo</div>'
          }
        )
      ],
      assertFn: (ctx, host, _comp) => {
        assert.html.textContent(host, 'before foo');
      }
    },
    {
      title: 'Basic surrogate with after text nodes and element',
      template: '<foo>',
      resources: [
        CustomElement.define(
          {
            name: 'foo',
            template: '<div>foo</div> after'
          }
        )
      ],
      assertFn: (ctx, host, _comp) => {
        assert.html.textContent(host, 'foo after');
      }
    },
    {
      title: 'Basic surrogate [style] merge scenario',
      template: '<foo style="height: 100px;">',
      resources: [
        CustomElement.define(
          {
            name: 'foo',
            template: '<template style="height: 200px"></template>'
          }
        )
      ],
      assertFn: (ctx, host, _comp) => {
        const foo: HTMLElement = host.querySelector('foo');
        [['height', '200px']].forEach(expectedValuePair => {
          const [rule, value] = expectedValuePair;
          assert.strictEqual(foo.style[rule], value, `<foo/> should have had style [${rule}] with value [${value}]`);
        });
      }
    },
    {
      title: 'Custom attribute + Multi bindings + binding commands',
      template: '<template foo="value1.bind: v1; value2.bind: v2">',
      root: class App {
        public v1 = 'abc1';
        public v2 = 'abc2';
      },
      resources: [
        CustomAttribute.define({
          name: 'foo',
          bindables: { value1: {}, value2: {} }
        }, class Foo {
          public value1: unknown;
          public value2: unknown;
          public attached() {
            const host = (this as ICustomAttributeViewModel).$controller!.host;
            host.setAttribute('v1', String(this.value1));
            host.setAttribute('v2', String(this.value2));
          }
        })
      ],
      assertFn: (ctx, host, _comp) => {
        assert.strictEqual(host.getAttribute('v1'), 'abc1');
        assert.strictEqual(host.getAttribute('v2'), 'abc2');
      }
    },
    {
      title: 'Custom attribute + Multi bindings + interpolation',
      template: `<template foo="value1: abc1-\${v1}; value2: abc2-\${v2}">`,
      root: class App {
        public v1 = 'abc1';
        public v2 = 'abc2';
      },
      resources: [
        CustomAttribute.define({
          name: 'foo',
          bindables: { value1: {}, value2: {} }
        }, class Foo {
          public value1: unknown;
          public value2: unknown;
          public attached() {
            const host = (this as ICustomAttributeViewModel).$controller!.host;
            host.setAttribute('v1', String(this.value1));
            host.setAttribute('v2', String(this.value2));
          }
        })
      ],
      assertFn: (ctx, host, _comp) => {
        assert.strictEqual(host.getAttribute('v1'), 'abc1-abc1');
        assert.strictEqual(host.getAttribute('v2'), 'abc2-abc2');
      }
    },
  ];

  for (const testCase of testCases) {
    const {
      title,
      template,
      root,
      resources = [],
      assertFn
    } = testCase;

    it(title, async function () {
      let host: HTMLElement;
      try {
        const ctx = TestContext.create();
        const aurelia = new Aurelia(ctx.container);
        host = ctx.createElement('div');

        ctx.container.register(...resources);

        const Root = CustomElement.define(
          { name: 'app', template },
          root === undefined ? class App {} : root
        );

        aurelia.app({ host: host, component: Root });

        await aurelia.start();

        await assertFn(ctx, host, aurelia.container.get(Root));

        await aurelia.stop();

        aurelia.dispose();
        host.remove();
      } finally {
        host?.remove();
      }
    });
  }
});
