import { CustomElement, Aurelia } from '@aurelia/runtime-html';
import { TestContext, hJsx, assert } from '@aurelia/testing';

// IMPORTANT:
//      JSX is used to eliminate space between tags so test result can be easier to manually constructed
//      if template string can be used to achieve the same effect, it could be converted back

describe('[repeat] -- funny cases', function () {
  const testCases: [string, HTMLElement, HTMLElement, ITestItem[], string, ICustomAssertion?][] = [
    [
      [
        '[repeat {item}]',
        '  [repeat {item}]',
        '---',
        '[foo]'
      ].join('\n'),
      <div repeat$for="item of items">
        <div repeat$for="item of items">{'${item.idx}'}.</div>
      </div>,
      <foo></foo>,
      createItems(2),
      `0.1.`.repeat(2)
    ],
    // Same with previous, though [repeat] + [replaceable] are on same element
    [
      [
        '[repeat {item}] [repeat {item}]'
      ].join('\n'),
      <div repeat$0$for="item of items" repeat$1$for="item of items">{'${item.idx}'}.</div>,
      <foo></foo>,
      createItems(2),
      `0.1.`.repeat(2)
    ],
    [
      [
        '[repeat {item}]',
        '  [repeat {item}]',
        '    [repeat {item}]',
        '---',
        '[foo]'
      ].join('\n'),
      <div repeat$for="item of items">
        <div repeat$for="item of items">
          <div repeat$for="item of items">{'${item.idx}'}.</div>
        </div>
      </div>,
      <foo></foo>,
      createItems(2),
      `0.1.`.repeat(4)
    ],
    [
      [
        '[repeat {item}] [repeat {item}] [repeat {item}]'
      ].join('\n'),
      <div repeat$0$for="item of items" repeat$1$for="item of items" repeat$2$for="item of items">{'${item.idx}'}.</div>,
      <foo></foo>,
      createItems(2),
      `0.1.`.repeat(4)
    ]
  ];
  for (
    const [
      testTitle,
      fooContentTemplate,
      appContentTemplate,
      fooItems,
      expectedTextContent,
      customAssertion
    ] of testCases
  ) {
    it.skip(`\n----\n${testTitle}`, async function() {
      const Foo = CustomElement.define(
        { name: 'foo', template: <template>{fooContentTemplate}</template> },
        class Foo { items = fooItems }
      );
      const App = CustomElement.define(
        { name: 'app', template: <template>{appContentTemplate}</template> },
        class App { message = 'Aurelia' }
      );

      const ctx = TestContext.create();
      ctx.container.register(Foo);
      const au = new Aurelia(ctx.container);

      const host = ctx.createElement('div');
      const component = new App();

      au.app({ host, component });
      await au.start();

      assert.strictEqual(host.textContent, expectedTextContent, `host.textContent`);
      if (customAssertion) {
        await customAssertion(host, component, component.$controller.children[0] as any as IFoo);
      }
      await tearDown(au);
    });
  }

  interface IFoo {
    items: ITestItem[];
  }
  interface IApp {
    message: string;
  }
  type ICustomAssertion = (host: HTMLElement, app: IApp, foo: IFoo) => void;

  function createExpectedReplacementText(count: number, itemBaseName: string = 'item') {
    let text = '';
    for (let i = 0; count > i; ++i) {
      text += `replacement of ${i}-${itemBaseName}-${i}.`
    }
    return text;
  }

  interface ITestItem {
    idx: number;
    name: string;
  }

  async function tearDown(au: Aurelia) {
    await au.stop();
    (au.root.host as Element).remove();

    au.dispose();
  }

  function createItems(count: number, baseName: string = 'item') {
    return Array.from({ length: count }, (_, idx) => {
      return { idx, name: `${baseName}-${idx}` }
    });
  }
});
