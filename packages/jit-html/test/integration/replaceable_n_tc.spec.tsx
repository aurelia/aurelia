import { Aurelia, CustomElementResource } from '@aurelia/runtime';
import { expect } from 'chai';
import { TestContext } from '../util';
import { h } from './util';

// IMPORTANT:
//      JSX is used to eliminate space between tags so test result can be easier to manually constructed
//      if template string can be used to achieve the same effect, it could be converted back

describe('replaceable', function () {

  describe.only('Difficult cases', function() {
    describe.only('+ scope altering template controllers', function() {
      describe('+ [repeat]', function() {
        const testCases: [string, HTMLElement, HTMLElement, ITestItem[], string][] = [
          [
            [
              '\n----',
              '[repeat]',
              '  [replaceable] <-- replace this'
            ].join('\n'),
            <div repeat$for="item of items">
              <div replaceable part="p0">{'${item.name}'}</div>
            </div>,
            <foo>
              <template replace-part="p0">replacement of {'${item.idx}-${item.name}'}</template>
            </foo>,
            createItems(2),
            `replacement of 0-item-0replacement of 1-item-1`
          ],
          [
            [
              '\n----',
              '[repeat]',
              '  [replaceable] <-- replace this',
              '    [replaceable]'
            ].join('\n'),
            <div repeat$for="item of items">
              <div replaceable part="p0">
                {'${item.name}'}
                <div replaceable part="p1">{'${item.name}'}</div>
              </div>
            </div>,
            <foo>
              <template replace-part="p0">replacement of {'${item.idx}-${item.name}'}</template>
            </foo>,
            createItems(2),
            createExpectedReplacementText(2)
          ],
          [
            [
              '\n----',
              '[repeat]',
              '  [replaceable]',
              '    [replaceable] <-- replace this'
            ].join('\n'),
            <div repeat$for="item of items">
              <div replaceable part="p0">
                {'${item.name}'}
                <div replaceable part="p1">{'${item.name}'}</div>
              </div>
            </div>,
            <foo>
              <template replace-part="p1">replacement of {'${item.idx}-${item.name}</>'}</template>
            </foo>,
            createItems(2),
            'item-0replacement of 0-item-0</>item-1replacement of 1-item-1</>'
          ],
          [
            [
              '\n----',
              '[replaceable]',
              '  [repeat]',
              '    [replaceable] <-- replace this'
            ].join('\n'),
            <div replaceable part="p0">
              item-0
              <div repeat$for="item of items">
                <div replaceable part="p1">{'${item.name}'}</div>
              </div>
            </div>,
            <foo>
              <template replace-part="p1">{'${item.idx}-${item.name}'}</template>
            </foo>,
            createItems(2),
            'item-0replacement of 0-item-0replacement of 1-item-1'
          ]
        ];
        for (
          const [
            testTitle,
            fooContentTemplate,
            appContentTemplate,
            fooItems,
            expectedTextContent
          ] of testCases
        ) {
          it(testTitle, function() {
            const Foo = CustomElementResource.define(
              { name: 'foo', template: <template>{fooContentTemplate}</template> },
              class Foo { items = fooItems }
            );
            const App = CustomElementResource.define(
              { name: 'app', template: <template>{appContentTemplate}</template> },
              class App { }
            );

            const ctx = TestContext.createHTMLTestContext();
            ctx.container.register(Foo);
            const au = new Aurelia(ctx.container);

            const host = ctx.createElement('div');
            const component = new App();

            au.app({ host, component });
            au.start();

            expect(host.textContent, `host.textContent`).to.equal(expectedTextContent);
            tearDown(au);
          });
        }

        function createExpectedReplacementText(count: number, itemBaseName: string = 'item') {
          let text = '';
          for (let i = 0; count > i; ++i) {
            text += `replacement of ${i}-${itemBaseName}-${i}`
          }
          return text;
        }
      });

      describe('+ [with]', function() {

      });
    });
  });

  interface ITestItem {
    idx: number;
    name: string;
  }

  function tearDown(au: Aurelia) {
    au.stop();
    (au.root().$host as Element).remove();
  }

  function createItems(count: number, baseName: string = 'item') {
    return Array.from({ length: count }, (_, idx) => {
      return { idx, name: `${baseName}-${idx}` }
    });
  }
});
