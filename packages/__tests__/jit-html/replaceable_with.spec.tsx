import { Aurelia, CustomElementResource, IViewModel } from '@aurelia/runtime';
import { expect } from 'chai';
import { TestContext, HTMLTestContext, hJsx } from '@aurelia/testing';

// IMPORTANT:
//      JSX is used to eliminate space between tags so test result can be easier to manually constructed
//      if template string can be used to achieve the same effect, it could be converted back

describe.skip('replaceable', function () {

  describe('Difficult cases', function() {
    describe('+ scope altering template controllers', function() {
      describe('+ [with]', function() {
        const testCases: [string, HTMLElement, HTMLElement, ITestItem[], string, ICustomAssertion?][] = [
          [
            [
              '[with]',
              '  [replaceable #0] << replace #0'
            ].join('\n'),
            <div with$="{ item: items[0] }">
              <div replaceable part="p0">{'${item.name}'}</div>
            </div>,
            <foo>
              <template replace-part="p0">replacement of {'${item.idx}-${item.name}.'}</template>
            </foo>,
            createItems(2),
            `replacement of 0-item-0.`
          ],
          // Same with previous, though [with] + [replaceable] are on same element
          [
            [
              '[with] [replaceable #0] << replace #0'
            ].join('\n'),
            <div with$="{ item: items[0] }" replaceable part="p0">{'${item.name}'}</div>,
            <foo>
              <template replace-part="p0">replacement of {'${item.idx}-${item.name}.'}</template>
            </foo>,
            createItems(2),
            `replacement of 0-item-0.`
          ],
          [
            [
              '[with]',
              '  [replaceable #0] << replace #0',
              '    [replaceable #1]'
            ].join('\n'),
            <div with$="{ item: items[0] }">
              <div replaceable part="p0">
                {'${item.name}'}
                <div replaceable part="p1">{'${item.name}'}</div>
              </div>
            </div>,
            <foo>
              <template replace-part="p0">replacement of {'${item.idx}-${item.name}.'}</template>
            </foo>,
            createItems(2),
            `replacement of 0-item-0.`
          ],
          // Same with previous, though [with] + [replaceable] are on same element
          [
            [
              '[with] [replaceable #0] << replace #0',
              '  [replaceable #1]'
            ].join('\n'),
            <div with$="{ item: items[0] }" replaceable part="p0">
              {'${item.name}'}
              <div replaceable part="p1">{'${item.name}'}</div>
            </div>,
            <foo>
              <template replace-part="p0">replacement of {'${item.idx}-${item.name}.'}</template>
            </foo>,
            createItems(2),
            `replacement of 0-item-0.`
          ],
          [
            [
              '[with]',
              '  [replaceable #0]',
              '    [replaceable #1] << replace #1'
            ].join('\n'),
            <div with$="{ item: items[0] }">
              <div replaceable part="p0">
                {'${item.name}.'}
                <div replaceable part="p1">{'${item.name}'}</div>
              </div>
            </div>,
            <foo>
              <template replace-part="p1">replacement of {'${item.idx}-${item.name}.'}</template>
            </foo>,
            createItems(2),
            'item-0.replacement of 0-item-0.'
          ],
          [
            [
              '[replaceable #0]',
              '  [with]',
              '    [replaceable #1] << replace #1'
            ].join('\n'),
            <div replaceable part="p0">
              item-0.
              <div with$="{ item: items[0] }">
                <div replaceable part="p1">{'${item.name}'}</div>
              </div>
            </div>,
            <foo>
              <template replace-part="p1">replacement of {'${item.idx}-${item.name}.'}</template>
            </foo>,
            createItems(2),
            'item-0.replacement of 0-item-0.'
          ],
          [
            [
              '[replaceable #0]',
              '  [with]',
              '    [replaceable #1] << replace #1'
            ].join('\n'),
            <div replaceable part="p0">
              item-0.
              <div with$="{ item: items[0] }" replaceable part="p1">{'${item.name}'}</div>
            </div>,
            <foo>
              <template replace-part="p1">replacement of {'${item.idx}-${item.name}.'}</template>
            </foo>,
            createItems(2),
            'item-0.replacement of 0-item-0.'
          ],
          [
            [
              '[with]',
              '  [replaceable #0] << replace #0',
              '[with]',
              '  [replaceable #0] << replace #0'
            ].join('\n'),
            <div>
              <div with$="{ item: items[0] }">
                <div replaceable part="p0">{'${item.name}'}</div>
              </div>
              <div with$="{ item: items[0] }">
                <div replaceable part="p0">{'${item.name}'}</div>
              </div>
            </div>,
            <foo>
              <template replace-part="p0">replacement of {'${item.idx}-${item.name}.'}</template>
            </foo>,
            createItems(2),
            'replacement of 0-item-0.replacement of 0-item-0.'
          ],
          // Same with previous. Though [with] + [replaceable] are on same element
          [
            [
              '[with] [replaceable #0] << replace #0',
              '[with] [replaceable #0] << replace #0'
            ].join('\n'),
            <div>
              <div with$="{ item: items[0] }" replaceable part="p0">{'${item.name}'}</div>
              <div with$="{ item: items[0] }" replaceable part="p0">{'${item.name}'}</div>
            </div>,
            <foo>
              <template replace-part="p0">replacement of {'${item.idx}-${item.name}.'}</template>
            </foo>,
            createItems(2),
            'replacement of 0-item-0.replacement of 0-item-0.'
          ],
          [
            [
              '[with]',
              '  [replaceable #0]',
              '    [replaceable #1] << replace #1',
              '  [replaceable #0]',
              '    [replaceable #1] << replace #1'
            ].join('\n'),
            <div with$="{ item: items[0] }">
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
            'item-0.replacement of 0-item-0.item-0.replacement of 0-item-0.'
          ],
          [
            [
              '[with]',
              '  [replaceable #0] << replace #0',
              '🔻',
              '[foo]',
              '  [${}] <-- by interpolation binding from consumer'
            ].join('\n'),
            <div with$="{ item: items[0] }">
              <div replaceable part="p0">{'${item.name}'}</div>
            </div>,
            <foo>
              <template replace-part="p0">{'${item.idx}-${item.name}. Message: ${message}.'}</template>
            </foo>,
            createItems(2),
            `0-item-0. Message: Aurelia.`,
            async (host, app, foo) => {
              app.message = 'Hello world from Aurelia';
              await Promise.resolve();
              expect(host.textContent, 'host.textContent@changed')
                .to
                .equal('0-item-0. Message: Hello world from Aurelia.');
            }
          ],
          // Same with previous. Though [with] + [replaceable] are on same element
          [
            [
              '[with] [replaceable #0] << replace #0',
              '🔻',
              '[foo]',
              '  [${}] <-- by interpolation binding from consumer'
            ].join('\n'),
            <div with$="{ item: items[0] }" replaceable part="p0">{'${item.name}'}</div>,
            <foo>
              <template replace-part="p0">{'${item.idx}-${item.name}. Message: ${message}.'}</template>
            </foo>,
            createItems(2),
            `0-item-0. Message: Aurelia.`,
            async (host, app, foo) => {
              app.message = 'Hello world from Aurelia';
              await Promise.resolve();
              expect(host.textContent, 'host.textContent@changed')
                .to
                .equal('0-item-0. Message: Hello world from Aurelia.');
            }
          ],
          [
            [
              '[with]',
              '  [replaceable #0] << replace #0',
              '🔻',
              '[foo]',
              '  [template r#0]',
              '    [with] <-- by a with'
            ].join('\n'),
            <div with$="{ item: items[0] }">
              <div replaceable part="p0">{'${item.name}'}</div>
            </div>,
            <foo>
              <template replace-part="p0">
                <template with$="{ item: items[0] }">{'${item.idx}-${item.name}.'}</template>
              </template>
            </foo>,
            createItems(2),
            `0-item-0.`,
            async (host, app, foo) => {
              foo.items = createItems(3, 'ITEM');
              await Promise.resolve();
              expect(host.textContent, 'host.textContent@changed')
                .to
                .equal(`0-ITEM-0`);

              foo.items = [];
              await Promise.resolve();
              expect(host.textContent, 'host.textContent@[]').to.equal('');
            }
          ],
          // Same with previous. Though [with] + [replaceable] are on same element
          [
            [
              '[with] [replaceable #0] << replace #0',
              '🔻',
              '[foo]',
              '  [template r#0]',
              '    [with] <-- by a with'
            ].join('\n'),
            <div with$="{ item: items[0] }" replaceable part="p0">{'${item.name}'}</div>,
            <foo>
              <template replace-part="p0">
                <template with$="{ item: items[0] }">{'${item.idx}-${item.name}.'}</template>
              </template>
            </foo>,
            createItems(2),
            `0-item-0.`,
            async (host, app, foo) => {
              foo.items = createItems(3, 'ITEM');
              await Promise.resolve();
              expect(host.textContent, 'host.textContent@changed')
                .to
                .equal(`0-ITEM-0.`);

              foo.items = [];
              await Promise.resolve();
              expect(host.textContent, 'host.textContent@[]').to.equal('');
            }
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
