import { Aurelia, CustomElementResource, ICustomElement } from '@aurelia/runtime';
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
        const testCases: [string, HTMLElement, HTMLElement, ITestItem[], string, ICustomAssertion?][] = [
          [
            [
              '[repeat]',
              '  [replaceable #0] << replace this'
            ].join('\n'),
            <div repeat$for="item of items">
              <div replaceable part="p0">{'${item.name}'}</div>
            </div>,
            <foo>
              <template replace-part="p0">replacement of {'${item.idx}-${item.name}.'}</template>
            </foo>,
            createItems(2),
            `replacement of 0-item-0.replacement of 1-item-1`
          ],
          [
            [
              '[repeat]',
              '  [replaceable #0] << replace this',
              '    [replaceable #1]'
            ].join('\n'),
            <div repeat$for="item of items">
              <div replaceable part="p0">
                {'${item.name}'}
                <div replaceable part="p1">{'${item.name}'}</div>
              </div>
            </div>,
            <foo>
              <template replace-part="p0">replacement of {'${item.idx}-${item.name}.'}</template>
            </foo>,
            createItems(2),
            createExpectedReplacementText(2)
          ],
          [
            [
              '[repeat]',
              '  [replaceable #0]',
              '    [replaceable #1] << replace this'
            ].join('\n'),
            <div repeat$for="item of items">
              <div replaceable part="p0">
                {'${item.name}'}
                <div replaceable part="p1">{'${item.name}'}</div>
              </div>
            </div>,
            <foo>
              <template replace-part="p1">replacement of {'${item.idx}-${item.name}.'}</template>
            </foo>,
            createItems(2),
            'item-0replacement of 0-item-0.item-1replacement of 1-item-1.'
          ],
          [
            [
              '[replaceable #0]',
              '  [repeat]',
              '    [replaceable #1] << replace this'
            ].join('\n'),
            <div replaceable part="p0">
              item-0
              <div repeat$for="item of items">
                <div replaceable part="p1">{'${item.name}'}</div>
              </div>
            </div>,
            <foo>
              <template replace-part="p1">{'${item.idx}-${item.name}.'}</template>
            </foo>,
            createItems(2),
            'item-0replacement of 0-item-0.replacement of 1-item-1.'
          ],
          [
            [
              '[repeat]',
              '  [replaceable #0] << replace this',
              '[repeat]',
              '  [replaceable #0] << replace this'
            ].join('\n'),
            <div>
              <div repeat$for="item of items">
                <div replaceable part="p0">{'${item.name}'}</div>
              </div>
              <div repeat$for="item of items">
                <div replaceable part="p0">{'${item.name}'}</div>
              </div>
            </div>,
            <foo>
              <template replace-part="p0">replacement of {'${item.idx}-${item.name}.'}</template>
            </foo>,
            createItems(2),
            'replacement of 0-item0.replacement of 1-item-1.replacement of 0-item-0.replacement of 1-item-1'
          ],
          [
            [
              '[repeat]',
              '  [replaceable #0]',
              '    [replaceable #1] << replace this',
              '  [replaceable #0]',
              '    [replaceable #1] << replace this'
            ].join('\n'),
            <div repeat$for="item of items">
              <div replaceable part="p0">
                {'${item.name}.'}
                <div replaceable part="p1">{'${item.name}.'}</div>
              </div>
              <div replaceable part="p0">
                {'${item.name}.'}
                <div replaceable part="p1">{'${item.name}.'}</div>
              </div>
            </div>,
            <foo>
              <template replace-part="p1">replacement of {'${item.idx}-${item.name}.'}</template>
            </foo>,
            createItems(2),
            'item-0.replacement of 0-item-0.item-0.replacement of 0-item-0.item-1.replacement of 1-item-1.item-1.replacement of 1-item-1.'
          ],
          [
            [
              '[repeat]',
              '  [replaceable #0] << replace this',
              '🔻',
              '[foo]',
              '  [${}] <-- by interpolation binding from consumer'
            ].join('\n'),
            <div repeat$for="item of items">
              <div replaceable part="p0">{'${item.name}'}</div>
            </div>,
            <foo>
              <template replace-part="p0">{'${item.idx}-${item.name}. Message: ${message}.'}</template>
            </foo>,
            createItems(2),
            `0-item-0. Message: Aurelia.1-item-1 Message: Aurelia`,
            async (host, app, foo) => {
              app.message = 'Hello world from Aurelia';
              await Promise.resolve();
              expect(host.textContent, 'host.textContent@changed')
                .to
                .equal('0-item-0. Message: Hello world from Aurelia.1-item-1. Message: Hello world from Aurelia');
            }
          ],
          [
            [
              '[repeat]',
              '  [replaceable #0] << replace this',
              '🔻',
              '[foo]',
              '  [template r#0]',
              '    [repeat] <-- by a repeat'
            ].join('\n'),
            <div repeat$for="item of items">
              <div replaceable part="p0">{'${item.name}'}</div>
            </div>,
            <foo>
              <template replace-part="p0">
                <template repeat$for="item of items">{'${item.idx}-${item.name}.'}</template>
              </template>
            </foo>,
            createItems(2),
            `0-item-0.1-item-1.0-item-0.1-item-1.`
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
          it(`\n----\n${testTitle}`, async function() {
            const Foo = CustomElementResource.define(
              { name: 'foo', template: <template>{fooContentTemplate}</template> },
              class Foo { items = fooItems }
            );
            const App = CustomElementResource.define(
              { name: 'app', template: <template>{appContentTemplate}</template> },
              class App { message = 'Aurelia' }
            );

            const ctx = TestContext.createHTMLTestContext();
            ctx.container.register(Foo);
            const au = new Aurelia(ctx.container);

            const host = ctx.createElement('div');
            const component = new App();

            au.app({ host, component });
            au.start();
            
            expect(host.textContent, `host.textContent`).to.equal(expectedTextContent);
            if (customAssertion) {
              await customAssertion(host, component, component.$componentHead as any as IFoo);
            }
            tearDown(au);
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
