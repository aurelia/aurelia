/* eslint-disable no-template-curly-in-string */
import { IContainer, noop, toArray } from '@aurelia/kernel';
import { Aurelia, bindable, BindingMode, CustomElement, customElement, INode, IPlatform, processContent } from '@aurelia/runtime-html';
import { assert, TestContext } from '@aurelia/testing';
import { createSpecFunction, TestExecutionContext as $TestExecutionContext, TestFunction } from '../util.js';

describe('processContent', function () {
  interface TestSetupContext {
    template: string;
    registrations: any[];
    enhance: boolean;
  }
  class TestExecutionContext implements $TestExecutionContext<any> {
    private _platform: IPlatform;
    public constructor(
      public ctx: TestContext,
      public container: IContainer,
      public host: HTMLElement,
      public app: App | null,
      public error: Error | null,
    ) { }
    public get platform(): IPlatform { return this._platform ?? (this._platform = this.container.get(IPlatform)); }
  }

  async function testAuSlot(
    testFunction: TestFunction<TestExecutionContext>,
    { template, registrations, enhance = false }: Partial<TestSetupContext> = {}
  ) {
    const ctx = TestContext.create();

    const host: HTMLElement = ctx.doc.createElement('div');
    ctx.doc.body.appendChild(host);

    const container = ctx.container;
    const au = new Aurelia(container);
    let error: Error | null = null;
    let app: App | null = null;
    try {
      au.register(...registrations);
      if (enhance) {
        host.innerHTML = template;
        au.enhance({ host, component: CustomElement.define({ name: 'app', isStrictBinding: true }, App) });
      } else {
        au.app({ host, component: CustomElement.define({ name: 'app', isStrictBinding: true, template }, App) });
      }
      await au.start();
      app = au.root.controller.viewModel as App;
    } catch (e) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      error = e;
    }

    await testFunction(new TestExecutionContext(ctx, container, host, app, error));

    if (error === null) {
      await au.stop();
    }
    ctx.doc.body.removeChild(host);
  }
  const $it = createSpecFunction(testAuSlot);

  class App {
  }

  class TestData {
    public constructor(
      public readonly spec: string,
      public readonly template: string,
      public readonly registrations: any[],
      public readonly expectedInnerHtmlMap: Record<string, string>,
      public readonly additionalAssertion?: (ctx: TestExecutionContext) => void | Promise<void>,
      public readonly enhance: boolean = false,
    ) { }
  }
  function* getTestData() {
    {
      class MyElement {
        public static hookInvoked: boolean = false;
        public static processContent(_node: INode, _p: IPlatform) {
          this.hookInvoked = true;
        }
      }
      yield new TestData(
        'a static processContent method is auto-discovered',
        `<my-element normal="foo" bold="bar"></my-element>`,
        [
          CustomElement.define(
            {
              name: 'my-element',
              isStrictBinding: true,
              template: `<div><au-slot></au-slot></div>`,
            },
            MyElement
          )
        ],
        {},
        () => {
          assert.strictEqual(MyElement.hookInvoked, true);
        }
      );
    }
    {
      class MyElement {
        public static hookInvoked: boolean = false;
        public static processContent(_node: INode, _p: IPlatform) {
          this.hookInvoked = true;
        }
      }
      yield new TestData(
        'a static function can be used as the processContent hook',
        `<my-element normal="foo" bold="bar"></my-element>`,
        [
          CustomElement.define(
            {
              name: 'my-element',
              isStrictBinding: true,
              template: `<div><au-slot></au-slot></div>`,
              processContent: MyElement.processContent
            },
            MyElement
          )
        ],
        {},
        () => {
          assert.strictEqual(MyElement.hookInvoked, true);
        }
      );
    }
    {
      @processContent(MyElement.processContent)
      @customElement({
        name: 'my-element',
        isStrictBinding: true,
        template: `<div><au-slot></au-slot></div>`,
      })
      class MyElement {
        public static hookInvoked: boolean = false;
        public static processContent(_node: INode, _p: IPlatform) {
          this.hookInvoked = true;
        }
      }
      yield new TestData(
        'processContent hook can be configured using class-level decorator - function - order 1',
        `<my-element normal="foo" bold="bar"></my-element>`,
        [MyElement],
        {},
        () => {
          assert.strictEqual(MyElement.hookInvoked, true);
        }
      );
    }
    {
      @customElement({
        name: 'my-element',
        isStrictBinding: true,
        template: `<div><au-slot></au-slot></div>`,
      })
      @processContent(MyElement.processContent)
      class MyElement {
        public static hookInvoked: boolean = false;
        public static processContent(_node: INode, _p: IPlatform) {
          this.hookInvoked = true;
        }
      }
      yield new TestData(
        'processContent hook can be configured using class-level decorator - function - order 2',
        `<my-element normal="foo" bold="bar"></my-element>`,
        [MyElement],
        {},
        () => {
          assert.strictEqual(MyElement.hookInvoked, true);
        }
      );
    }
    {
      // eslint-disable-next-line no-inner-declarations
      function processContent1(this: typeof MyElement, _node: INode, _p: IPlatform) {
        this.hookInvoked = true;
      }

      @processContent(processContent1)
      @customElement({
        name: 'my-element',
        isStrictBinding: true,
        template: `<div><au-slot></au-slot></div>`,
      })
      class MyElement {
        public static hookInvoked: boolean = false;
      }
      yield new TestData(
        'processContent hook can be configured using class-level decorator - standalone function',
        `<my-element normal="foo" bold="bar"></my-element>`,
        [MyElement],
        {},
        () => {
          assert.strictEqual(MyElement.hookInvoked, true);
        }
      );
    }

    {
      @customElement({
        name: 'my-element',
        isStrictBinding: true,
        template: `<div><au-slot></au-slot></div>`,
      })
      class MyElement {
        public static hookInvoked: boolean = false;

        @processContent()
        public static processContent(_node: INode, _p: IPlatform) {
          this.hookInvoked = true;
        }
      }
      yield new TestData(
        'processContent hook can be configured using method-level decorator',
        `<my-element normal="foo" bold="bar"></my-element>`,
        [MyElement],
        {},
        () => {
          assert.strictEqual(MyElement.hookInvoked, true);
        }
      );
    }

    yield new TestData(
      'can mutate node content',
      `<my-element normal="foo" bold="bar"></my-element>`,
      [
        CustomElement.define(
          {
            name: 'my-element',
            isStrictBinding: true,
            template: `<div><au-slot></au-slot></div>`,
            processContent(node: INode, p: IPlatform) {
              const el = (node as Element);
              const text = el.getAttribute('normal');
              const bold = el.getAttribute('bold');
              if (text !== null || bold !== null) {
                const projection = p.document.createElement('template');
                projection.setAttribute('au-slot', '');
                const content = projection.content;
                if (text !== null) {
                  const span = p.document.createElement('span');
                  span.textContent = text;
                  el.removeAttribute('normal');
                  content.append(span);
                }
                if (bold !== null) {
                  const strong = p.document.createElement('strong');
                  strong.textContent = bold;
                  el.removeAttribute('bold');
                  content.append(strong);
                }
                node.appendChild(projection);
              }
            }
          },
          class MyElement { }
        )
      ],
      { 'my-element': '<div><span>foo</span><strong>bar</strong></div>' },
    );

    yield new TestData(
      'default au-slot use-case',
      `<my-element><span>foo</span><span au-slot="s1">s1 projection</span><strong>bar</strong></my-element>`,
      [
        CustomElement.define(
          {
            name: 'my-element',
            isStrictBinding: true,
            template: `<div><au-slot></au-slot><au-slot name="s1"></au-slot></div>`,
            processContent(node: INode, p: IPlatform) {
              const projection = p.document.createElement('template');
              projection.setAttribute('au-slot', '');
              const content = projection.content;
              for (const child of toArray(node.childNodes)) {
                if (!(child as Element).hasAttribute('au-slot')) {
                  content.append(child);
                }
              }
              if (content.childElementCount > 0) {
                node.appendChild(projection);
              }
            }
          },
          class MyElement { }
        )
      ],
      { 'my-element': '<div><span>foo</span><strong>bar</strong><span>s1 projection</span></div>' },
    );

    const SpanCe = CustomElement.define(
      {
        name: 'span-ce',
        isStrictBinding: true,
        template: '<span>${value}</span>',
        bindables: { value: { mode: BindingMode.default } },
      },
      class SpanCe { }
    );
    const StrongCe = CustomElement.define(
      {
        name: 'strong-ce',
        isStrictBinding: true,
        template: '<strong>${value}</strong>',
        bindables: { value: { mode: BindingMode.default } },
      },
      class StrongCe { }
    );
    function processContentWithCe(compile: boolean) {
      return function (node: INode, p: IPlatform): boolean {
        const el = (node as Element);
        const text = el.getAttribute('normal');
        const bold = el.getAttribute('bold');
        if (text !== null || bold !== null) {
          const projection = p.document.createElement('template');
          projection.setAttribute('au-slot', '');
          const content = projection.content;
          if (text !== null) {
            const span = p.document.createElement('span-ce');
            span.setAttribute('value', text);
            el.removeAttribute('normal');
            content.append(span);
          }
          if (bold !== null) {
            const strong = p.document.createElement('strong-ce');
            strong.setAttribute('value', bold);
            el.removeAttribute('bold');
            content.append(strong);
          }
          node.appendChild(projection);
        }
        return compile;
      };
    }
    yield new TestData(
      'mutated node content can contain custom-element',
      `<my-element normal="foo" bold="bar"></my-element>`,
      [
        SpanCe,
        StrongCe,
        CustomElement.define(
          {
            name: 'my-element',
            isStrictBinding: true,
            template: `<div><au-slot></au-slot></div>`,
            processContent: processContentWithCe(true),
          },
          class MyElement { }
        )
      ],
      { 'my-element': '<div><span-ce class="au"><span>foo</span></span-ce><strong-ce class="au"><strong>bar</strong></strong-ce></div>' },
    );

    function processContentWithNewBinding(compile: boolean) {
      return function (node: INode, _p: IPlatform): boolean {
        const el = (node as Element);
        const l1 = el.getAttribute('normal')?.length ?? 0;
        const l2 = el.getAttribute('bold')?.length ?? 0;
        el.removeAttribute('normal');
        el.removeAttribute('bold');
        el.setAttribute('text-length.bind', `${l1} + ${l2}`);
        return compile;
      };
    }

    yield new TestData(
      'mutated node content can have new bindings for the host element',
      `<my-element normal="foo" bold="bar"></my-element>`,
      [
        CustomElement.define(
          {
            name: 'my-element',
            isStrictBinding: true,
            template: '${textLength}',
            bindables: { textLength: { mode: BindingMode.default } },
            processContent: processContentWithNewBinding(true),
          },
          class MyElement { }
        )
      ],
      { 'my-element': '6' },
    );

    yield new TestData(
      'host compilation cannot be skipped', // as that does not make any sense
      `<my-element normal="foo" bold="bar"></my-element>`,
      [
        CustomElement.define(
          {
            name: 'my-element',
            isStrictBinding: true,
            template: '${textLength}',
            bindables: { textLength: { mode: BindingMode.default } },
            processContent: processContentWithNewBinding(false),
          },
          class MyElement { }
        )
      ],
      { 'my-element': '6' },
    );

    yield new TestData(
      'compilation can be instructed to be skipped - children - w/o additional host binding',
      `<my-element normal="foo" bold="bar"></my-element>`,
      [
        SpanCe,
        StrongCe,
        CustomElement.define(
          {
            name: 'my-element',
            isStrictBinding: true,
            template: `<div><au-slot></au-slot></div>`,
            processContent: processContentWithCe(false),
          },
          class MyElement { }
        )
      ],
      { 'my-element': '<template au-slot=""><span-ce value="foo"></span-ce><strong-ce value="bar"></strong-ce></template><div></div>' },
    );

    const rand = Math.random();
    yield new TestData(
      'compilation can be instructed to be skipped - children - with additional host binding',
      `<my-element normal="foo" bold="bar"></my-element>`,
      [
        SpanCe,
        StrongCe,
        CustomElement.define(
          {
            name: 'my-element',
            isStrictBinding: true,
            template: '${rand}<div><au-slot></au-slot></div>',
            bindables: { rand: { mode: BindingMode.default } },
            processContent(node: INode, p: IPlatform) {
              const retVal = processContentWithCe(false)(node, p);
              (node as Element).setAttribute('rand.bind', rand.toString());
              return retVal;
            }
          },
          class MyElement { }
        )
      ],
      { 'my-element': `<template au-slot=""><span-ce value="foo"></span-ce><strong-ce value="bar"></strong-ce></template>${rand}<div></div>` },
    );

    yield new TestData(
      'works with enhance',
      `<my-element normal="foo" bold="bar"></my-element>`,
      [
        SpanCe,
        StrongCe,
        CustomElement.define(
          {
            name: 'my-element',
            isStrictBinding: true,
            template: '<div><au-slot></au-slot></div>',
            processContent: processContentWithCe(true),
          },
          class MyElement { }
        )
      ],
      { 'my-element': `<div><span-ce class="au"><span>foo</span></span-ce><strong-ce class="au"><strong>bar</strong></strong-ce></div>` },
      noop,
      true,
    );

    /**
     * MDN template example: https://developer.mozilla.org/en-US/docs/Web/HTML/Element/template#Examples
     * Note that this is also possible without `processContent` hook, by adding the named template directly to the CE's own defined template.
     * This example only shows that the new nodes added via the `processContent` hook are accessible from the lifecycle hooks as well.
     */
    yield new TestData(
      'compilation can be instructed to be skipped - children - example of grabbing the inner template',
      `<my-element products.bind="[[1,'a'],[2,'b']]"></my-element>`,
      [
        CustomElement.define(
          {
            name: 'my-element',
            isStrictBinding: true,
            template: `<table><thead><tr><td>UPC_Code</td><td>Product_Name</td></tr></thead><tbody></tbody></table>`,
            bindables: { products: { mode: BindingMode.default } },
            processContent(node: INode, p: IPlatform) {
              /*
              <template id="productrow">
                <tr>
                  <td></td>
                  <td></td>
                </tr>
              </template>
              */
              const template = p.document.createElement('template');
              template.setAttribute('id', 'productrow');
              const tr = p.document.createElement('tr');
              tr.append(p.document.createElement('td'), p.document.createElement('td'));
              template.content.append(tr);
              node.appendChild(template);
              return false;
            }
          },
          class MyElement {
            public static inject = [IPlatform];
            public products: [number, string][];
            public constructor(private readonly platform: IPlatform) { }

            public attaching() {
              const p = this.platform;
              const tbody = p.document.querySelector('tbody');
              const template = p.document.querySelector<HTMLTemplateElement>('#productrow');

              for (const [code, name] of this.products) {
                // Clone the new row and insert it into the table
                const clone = template.content.cloneNode(true) as Element;
                const td = clone.querySelectorAll('td');
                td[0].textContent = code.toString();
                td[1].textContent = name;

                tbody.appendChild(clone);
              }
            }
          }
        )
      ],
      { 'my-element': '<template id="productrow"><tr><td></td><td></td></tr></template><table><thead><tr><td>UPC_Code</td><td>Product_Name</td></tr></thead><tbody><tr><td>1</td><td>a</td></tr><tr><td>2</td><td>b</td></tr></tbody></table>' },
      function (ctx) {
        assert.visibleTextEqual(ctx.host, 'UPC_CodeProduct_Name1a2b');
      }
    );

  }
  for (const { spec, template, expectedInnerHtmlMap, registrations, additionalAssertion, enhance } of getTestData()) {
    $it(spec,
      async function (ctx) {
        const { host, error } = ctx;
        assert.deepEqual(error, null);
        for (const [selector, expectedInnerHtml] of Object.entries(expectedInnerHtmlMap)) {
          if (selector) {
            assert.html.innerEqual(selector, expectedInnerHtml, `${selector}.innerHTML`, host);
          } else {
            assert.html.innerEqual(host, expectedInnerHtml, `root.innerHTML`);
          }
        }
        if (additionalAssertion != null) {
          await additionalAssertion(ctx);
        }
      },
      { template, registrations, enhance });
  }

  // A semi-real-life example
  {
    @customElement({
      name: 'tabs',
      isStrictBinding: true,
      template: '<div class="header"><au-slot name="header"></au-slot></div><div class="content"><au-slot name="content"></au-slot></div>',
      processContent: Tabs.processTabs
    })
    class Tabs {
      @bindable public activeTabId: string;
      public showTab(tabId: string) {
        this.activeTabId = tabId;
      }

      public static processTabs(node: INode, p: IPlatform) {
        const el = node as Element;
        const headerTemplate = p.document.createElement('template');
        headerTemplate.setAttribute('au-slot', 'header');

        const contentTemplate = p.document.createElement('template');
        contentTemplate.setAttribute('au-slot', 'content');

        const tabs = toArray(el.querySelectorAll('tab'));
        for (let i = 0; i < tabs.length; i++) {
          const tab = tabs[i];

          // add header
          const header = p.document.createElement('button');
          header.setAttribute('class.bind', `activeTabId=='${i}'?'active':''`);
          header.setAttribute('click.delegate', `showTab('${i}')`);
          header.appendChild(p.document.createTextNode(tab.getAttribute('header')));
          headerTemplate.content.appendChild(header);

          // add content
          const content = p.document.createElement('div');
          content.setAttribute('if.bind', `activeTabId=='${i}'`);
          content.append(...toArray(tab.childNodes));
          contentTemplate.content.appendChild(content);

          el.removeChild(tab);
        }

        el.setAttribute('active-tab-id', '0');

        el.append(headerTemplate, contentTemplate);
      }
    }

    $it('semi-real-life example with tabs',
      async function (ctx) {
        const platform = ctx.platform;
        const host = ctx.host;
        const tabs = host.querySelector('tabs');
        const headers = tabs.querySelectorAll<HTMLButtonElement>('div.header button');
        const numTabs = headers.length;
        const expectedHeaders = ['Tab1', 'Tab2', 'Tab3'];
        const expectedContents = ['<span>content 1</span>', '<span>content 2</span>', 'Nothing to see here.'];
        for (let i = numTabs - 1; i > -1; i--) {
          // assert content
          const header = headers[i];
          assert.html.textContent(header, expectedHeaders[i], `header#${i} content`);

          // assert the bound delegate
          header.click();
          platform.domWriteQueue.flush();
          for (let j = numTabs - 1; j > -1; j--) {
            assert.strictEqual(headers[j].classList.contains('active'), i === j, `header#${j} class`);
            assert.html.innerEqual(tabs.querySelector<HTMLButtonElement>('div.content div'), expectedContents[i], `content#${i} content`);
          }
        }
      },
      {
        registrations: [Tabs],
        template: `
        <tabs>
          <tab header="Tab1">
            <span>content 1</span>
          </tab>
          <tab header="Tab2">
            <span>content 2</span>
          </tab>
          <tab header="Tab3"> Nothing to see here. </tab>
        </tabs>
        `,
      });
  }
});
