import { IContainer, toArray } from '@aurelia/kernel';
import { Aurelia, CustomElement, IPlatform, INode, BindingMode, bindable } from '@aurelia/runtime-html';
import { assert, TestContext } from '@aurelia/testing';
import { createSpecFunction, TestExecutionContext as $TestExecutionContext, TestFunction } from '../util.js';

describe.only('processContent', function () {
  interface TestSetupContext {
    template: string;
    registrations: any[];
  }
  class TestExecutionContext implements $TestExecutionContext<any> {
    private _scheduler: IPlatform;
    public constructor(
      public ctx: TestContext,
      public container: IContainer,
      public host: HTMLElement,
      public app: App | null,
      public error: Error | null,
    ) { }
    public get platform(): IPlatform { return this._scheduler ?? (this._scheduler = this.container.get(IPlatform)); }
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
    yield new TestData(
      'mutated node content can contain custom-element',
      `<my-element normal="foo" bold="bar"></my-element>`,
      [
        CustomElement.define(
          {
            name: 'span-ce',
            isStrictBinding: true,
            template: '<span>${value}</span>',
            bindables: { value: { mode: BindingMode.default } },
          },
          class SpanCe { }
        ),
        CustomElement.define(
          {
            name: 'strong-ce',
            isStrictBinding: true,
            template: '<strong>${value}</strong>',
            bindables: { value: { mode: BindingMode.default } },
          },
          class StrongCe { }
        ),
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
              return true;
            }
          },
          class MyElement { }
        )
      ],
      { 'my-element': '<div><span-ce value="foo" class="au"><span>foo</span></span-ce><strong-ce value="bar" class="au"><strong>bar</strong></strong-ce></div>' },
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
});
