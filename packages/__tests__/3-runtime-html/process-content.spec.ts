import { IContainer, toArray } from '@aurelia/kernel';
import { Aurelia, bindable, BindingMode, CustomElement, customElement, INode, IPlatform, processContent } from '@aurelia/runtime-html';
import { assert, TestContext } from '@aurelia/testing';
import { createSpecFunction, TestExecutionContext as $TestExecutionContext, TestFunction } from '../util.js';

describe.only('processContent', function () {
  interface TestSetupContext {
    template: string;
    registrations: any[];
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
    { template, registrations }: Partial<TestSetupContext> = {}
  ) {
    const ctx = TestContext.create();

    const host = ctx.doc.createElement('div');
    ctx.doc.body.appendChild(host);

    const container = ctx.container;
    const au = new Aurelia(container);
    let error: Error | null = null;
    let app: App | null = null;
    try {
      await au
        .register(...registrations)
        .app({
          host,
          component: CustomElement.define({ name: 'app', isStrictBinding: true, template }, App)
        })
        .start();
      app = au.root.controller.viewModel as App;
    } catch (e) {
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
    ) { }
  }
  function* getTestData() {
    {
      class MyElement {
        public static hookInvoked: boolean = false;
        static processContent(_node: INode, _p: IPlatform): boolean {
          this.hookInvoked = true;
          return true;
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
              processContent: MyElement.processContent.bind(MyElement)
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
        static processContent(_node: INode, _p: IPlatform): boolean {
          this.hookInvoked = true;
          return true;
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
        static processContent(_node: INode, _p: IPlatform): boolean {
          this.hookInvoked = true;
          return true;
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
      @processContent<typeof MyElement>('processContent')
      @customElement({
        name: 'my-element',
        isStrictBinding: true,
        template: `<div><au-slot></au-slot></div>`,
      })
      class MyElement {
        public static hookInvoked: boolean = false;
        static processContent(_node: INode, _p: IPlatform): boolean {
          this.hookInvoked = true;
          return true;
        }
      }
      yield new TestData(
        'processContent hook can be configured using class-level decorator - string - order 1',
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
      @processContent<typeof MyElement>('processContent')
      class MyElement {
        public static hookInvoked: boolean = false;
        static processContent(_node: INode, _p: IPlatform): boolean {
          this.hookInvoked = true;
          return true;
        }
      }
      yield new TestData(
        'processContent hook can be configured using class-level decorator - string - order 2',
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
        static processContent(_node: INode, _p: IPlatform): boolean {
          this.hookInvoked = true;
          return true;
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
            processContent(node: INode, p: IPlatform): boolean {
              const el = (node as Element);
              const text = el.getAttribute('normal');
              const bold = el.getAttribute('bold');
              if (text !== null && bold !== null) {
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
              return true;
            }
          },
          class MyElement { }
        )
      ],
      { 'my-element': '<div><span>foo</span><strong>bar</strong></div>' },
    );

    yield new TestData(
      'default au-slot use-case',
      `<my-element><span>foo</span><strong>bar</strong></my-element>`,
      [
        CustomElement.define(
          {
            name: 'my-element',
            isStrictBinding: true,
            template: `<div><au-slot></au-slot></div>`,
            processContent(node: INode, p: IPlatform): boolean {
              const projection = p.document.createElement('template');
              projection.setAttribute('au-slot', '');
              const content = projection.content;
              for (const child of toArray(node.childNodes)) {
                content.append(child);
              }
              node.appendChild(projection);
              return true;
            }
          },
          class MyElement { }
        )
      ],
      { 'my-element': '<div><span>foo</span><strong>bar</strong></div>' },
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
        if (text !== null && bold !== null) {
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
      }
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
      { 'my-element': '<div><span-ce value="foo" class="au"><span>foo</span></span-ce><strong-ce value="bar" class="au"><strong>bar</strong></strong-ce></div>' },
    );

    function processContentWithNewBinding(compile: boolean) {
      return function (node: INode, p: IPlatform): boolean {
        const el = (node as Element);
        const l1 = el.getAttribute('normal')?.length ?? 0;
        const l2 = el.getAttribute('bold')?.length ?? 0;
        el.removeAttribute('normal');
        el.removeAttribute('bold');
        el.setAttribute('text-length.bind', `${l1} + ${l2}`);
        return compile;
      }
    }

    yield new TestData(
      'mutated node content can have new bindings for the host element',
      `<my-element normal="foo" bold="bar"></my-element>`,
      [
        CustomElement.define(
          {
            name: 'my-element',
            isStrictBinding: true,
            template: '\${textLength}',
            bindables: { textLength: { mode: BindingMode.default } },
            processContent: processContentWithNewBinding(true),
          },
          class MyElement { }
        )
      ],
      { 'my-element': '6' },
    );

    yield new TestData(
      'compilation can be instructed to be skipped - host',
      `<my-element normal="foo" bold="bar"></my-element>`,
      [
        CustomElement.define(
          {
            name: 'my-element',
            isStrictBinding: true,
            template: '\${textLength}',
            bindables: { textLength: { mode: BindingMode.default } },
            processContent: processContentWithNewBinding(false),
          },
          class MyElement { }
        )
      ],
      { 'my-element': '' },
    );

    yield new TestData(
      'compilation can be instructed to be skipped - children',
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
      { 'my-element': '<template au-slot=""><span-ce value="foo"></span-ce><strong-ce value="bar"></strong-ce></template>' },
    );

  }
  for (const { spec, template, expectedInnerHtmlMap, registrations, additionalAssertion } of getTestData()) {
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
      { template, registrations });
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
      @bindable activeTabId: string;
      public showTab(tabId: string) {
        this.activeTabId = tabId;
      }

      public static processTabs(node: INode, p: IPlatform): boolean {
        const el = node as Element;
        const headerTemplate = p.document.createElement("template");
        headerTemplate.setAttribute("au-slot", "header");

        const contentTemplate = p.document.createElement("template");
        contentTemplate.setAttribute("au-slot", "content");

        const tabs = toArray(el.querySelectorAll("tab"));
        for (let i = 0; i < tabs.length; i++) {
          const tab = tabs[i];

          // add header
          const header = document.createElement("button");
          header.setAttribute("class.bind", `activeTabId=='${i}'?'active':''`);
          header.setAttribute("click.delegate", `showTab('${i}')`);
          header.innerText = tab.getAttribute("header");
          headerTemplate.content.appendChild(header);

          // add content
          const content = document.createElement("div");
          content.setAttribute("if.bind", `activeTabId=='${i}'`); // TODO: this actually should be show.bind
          content.append(...toArray(tab.childNodes));
          contentTemplate.content.appendChild(content);

          el.removeChild(tab);
        }

        el.setAttribute('active-tab-id', '0');

        el.append(headerTemplate, contentTemplate);
        return true;
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
          await platform.domWriteQueue.yield();
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
