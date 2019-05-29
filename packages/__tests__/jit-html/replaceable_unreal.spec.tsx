import { Aurelia, CustomElementResource } from '@aurelia/runtime';
import { TestContext, assert, hJsx } from '@aurelia/testing';

describe('replaceable', function () {
  type INestinngReplaceableTestCase = [
    /*title*/string,
    /*foo template*/HTMLElement,
    /*app template*/HTMLElement,
    /*expected text content*/string
  ];

  const testCases: INestinngReplaceableTestCase[] = [
    [
      '1 root replaceable, 1 level',
      <template>
        <div replaceable part="p-0-0">default-0-0.</div>
      </template>,
      <template>
        <foo>
          <template replace-part="p-0-0">replacement-0-0.</template>
        </foo>
      </template>,
      'replacement-0-0.'
    ],
    [
      '2 root replaceables, 1 level',
      <template>
        <div replaceable part="p-0-0">default-0-0.</div>
        <div replaceable part="p-1-0">default-1-0.</div>
      </template>,
      <template>
        <foo>
          <template replace-part="p-1-0">replacement-1-0.</template>
        </foo>
      </template>,
      'default-0-0.replacement-1-0'
    ],
    [
      '2 root replaceables, 2 levels',
      <template>
        <div replaceable part="p-0-0">
          default-0-0.
          <div replaceable part="p-0-1">default-0-1.</div>
        </div>
        <div replaceable part="p-1-0">
          default-1-0.
          <div replaceable part="p-1-1">default-1-1.</div>
        </div>
      </template>,
      <template>
        <foo>
          <template replace-part="p-0-1">replacement-0-1.</template>
        </foo>
      </template>,
      'default-0-0.replacement-0-1.default-1-0.default-1-1.'
    ],
  ];

  for (const [title, fooTemplate, appTemplate, expectedTextContent] of testCases) {
    it(title, async function() {
      
      const App = CustomElementResource.define(
        { name: 'app', template: appTemplate },
        class App {}
      );
      const Foo = CustomElementResource.define(
        { name: 'foo', template: fooTemplate },
        class Foo {}
      );

      const ctx = TestContext.createHTMLTestContext();
      ctx.container.register(Foo);
      const au = new Aurelia(ctx.container);

      const host = ctx.createElement('div');
      const component = new App();

      au.app({ host, component });
      au.start();

      assert.strictEqual(
        host.textContent,
        expectedTextContent
      );
      tearDown(au);
    });
  }

  interface ITestItem {
    idx: number;
    name: string;
  }

  function tearDown(au: Aurelia) {
    au.stop();
    (au.root.host as Element).remove();
  }

  function createItems(count: number, baseName: string = 'item') {
    return Array.from({ length: count }, (_, idx) => {
      return { idx, name: `${baseName}-${idx}` }
    });
  }
});
