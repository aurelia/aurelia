import { Aurelia, CustomElement, LifecycleFlags as LF } from '@aurelia/runtime';
import { TestContext, HTMLTestContext, hJsx, assert } from '@aurelia/testing';

// IMPORTANT:
//      JSX is used to eliminate space between tags so test result can be easier to manually constructed
//      if template string can be used to achieve the same effect, it could be converted back

describe('replaceable', function () {

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
              <div replaceable="p0">{'${item.name}'}</div>
            </div>,
            <foo>
              <template replace="p0">replacement of {'${item.idx}-${item.name}.'}</template>
            </foo>,
            createItems(2),
            `replacement of 0-item-0.`
          ],
          // Same with previous, though [with] + [replaceable] are on same element
          [
            [
              '[with] [replaceable #0] << replace #0'
            ].join('\n'),
            <div with$="{ item: items[0] }" replaceable="p0">{'${item.name}'}</div>,
            <foo>
              <template replace="p0">replacement of {'${item.idx}-${item.name}.'}</template>
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
              <div replaceable="p0">
                {'${item.name}'}
                <div replaceable="p1">{'${item.name}'}</div>
              </div>
            </div>,
            <foo>
              <template replace="p0">replacement of {'${item.idx}-${item.name}.'}</template>
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
            <div with$="{ item: items[0] }" replaceable="p0">
              {'${item.name}'}
              <div replaceable="p1">{'${item.name}'}</div>
            </div>,
            <foo>
              <template replace="p0">replacement of {'${item.idx}-${item.name}.'}</template>
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
              <div replaceable="p0">
                {'${item.name}.'}
                <div replaceable="p1">{'${item.name}'}</div>
              </div>
            </div>,
            <foo>
              <template replace="p1">replacement of {'${item.idx}-${item.name}.'}</template>
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
            <div replaceable="p0">
              item-0.
              <div with$="{ item: items[0] }">
                <div replaceable="p1">{'${item.name}'}</div>
              </div>
            </div>,
            <foo>
              <template replace="p1">replacement of {'${item.idx}-${item.name}.'}</template>
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
            <div replaceable="p0">
              item-0.
              <div with$="{ item: items[0] }" replaceable="p1">{'${item.name}'}</div>
            </div>,
            <foo>
              <template replace="p1">replacement of {'${item.idx}-${item.name}.'}</template>
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
                <div replaceable="p0">{'${item.name}'}</div>
              </div>
              <div with$="{ item: items[0] }">
                <div replaceable="p0">{'${item.name}'}</div>
              </div>
            </div>,
            <foo>
              <template replace="p0">replacement of {'${item.idx}-${item.name}.'}</template>
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
              <div with$="{ item: items[0] }" replaceable="p0">{'${item.name}'}</div>
              <div with$="{ item: items[0] }" replaceable="p0">{'${item.name}'}</div>
            </div>,
            <foo>
              <template replace="p0">replacement of {'${item.idx}-${item.name}.'}</template>
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
              <div replaceable="p0">
                {'${item.name}.'}
                <div replaceable="p1">{'${item.name}.'}</div>
              </div>
              <div replaceable="p0">
                {'${item.name}.'}
                <div replaceable="p1">{'${item.name}.'}</div>
              </div>
            </div>,
            <foo>
              <template replace="p1">replacement of {'${item.idx}-${item.name}.'}</template>
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
              <div replaceable="p0">{'${item.name}'}</div>
            </div>,
            <foo>
              <template replace="p0">{'${item.idx}-${item.name}. Message: ${message}.'}</template>
            </foo>,
            createItems(2),
            `0-item-0. Message: Aurelia.`,
            async (ctx, host, app, foo) => {
              app.message = 'Hello world from Aurelia';
              ctx.scheduler.getRenderTaskQueue().flush();
              assert.strictEqual(
                host.textContent,
                '0-item-0. Message: Hello world from Aurelia.',
                'host.textContent@changed',
              );
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
            <div with$="{ item: items[0] }" replaceable="p0">{'${item.name}'}</div>,
            <foo>
              <template replace="p0">{'${item.idx}-${item.name}. Message: ${message}.'}</template>
            </foo>,
            createItems(2),
            `0-item-0. Message: Aurelia.`,
            async (ctx, host, app, foo) => {
              app.message = 'Hello world from Aurelia';
              ctx.scheduler.getRenderTaskQueue().flush();
              assert.strictEqual(
                host.textContent,
                '0-item-0. Message: Hello world from Aurelia.',
                'host.textContent@changed',
              );
            }
          ],
          // [
          //   [
          //     '[with]',
          //     '  [replaceable #0] << replace #0',
          //     '🔻',
          //     '[foo]',
          //     '  [template r#0]',
          //     '    [with] <-- by a with'
          //   ].join('\n'),
          //   <div with$="{ item: items[0] }">
          //     <div replaceable="p0">{'${item.name}'}</div>
          //   </div>,
          //   <foo>
          //     <template replace="p0">
          //       <template with$="{ item: items[0] }">{'${item.idx}-${item.name}.'}</template>
          //     </template>
          //   </foo>,
          //   createItems(2),
          //   `0-item-0.`,
          //   async (ctx, host, app, foo) => {
          //     foo.items = createItems(3, 'ITEM');
          //     ctx.scheduler.getRenderTaskQueue().flush();
          //     assert.strictEqual(
          //       host.textContent,
          //       `0-ITEM-0`,
          //       'host.textContent@changed',
          //     );

          //     foo.items = [];
          //     ctx.scheduler.getRenderTaskQueue().flush();
          //     assert.strictEqual(
          //       host.textContent,
          //       '',
          //       'host.textContent@[]',
          //     );
          //   }
          // ],
          // // Same with previous. Though [with] + [replaceable] are on same element
          // [
          //   [
          //     '[with] [replaceable #0] << replace #0',
          //     '🔻',
          //     '[foo]',
          //     '  [template r#0]',
          //     '    [with] <-- by a with'
          //   ].join('\n'),
          //   <div with$="{ item: items[0] }" replaceable="p0">{'${item.name}'}</div>,
          //   <foo>
          //     <template replace="p0">
          //       <template with$="{ item: items[0] }">{'${item.idx}-${item.name}.'}</template>
          //     </template>
          //   </foo>,
          //   createItems(2),
          //   `0-item-0.`,
          //   async (ctx, host, app, foo) => {
          //     foo.items = createItems(3, 'ITEM');
          //     ctx.scheduler.getRenderTaskQueue().flush();
          //     assert.strictEqual(
          //       host.textContent,
          //       `0-ITEM-0.`,
          //       'host.textContent@changed',
          //     );

          //     foo.items = [];
          //     ctx.scheduler.getRenderTaskQueue().flush();
          //     assert.strictEqual(host.textContent, '', 'host.textContent@[]');
          //   }
          // ]
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
            const Foo = CustomElement.define(
              { name: 'foo', template: <template>{fooContentTemplate}</template> },
              class Foo { items = fooItems }
            );
            const App = CustomElement.define(
              { name: 'app', template: <template>{appContentTemplate}</template> },
              class App { message = 'Aurelia' }
            );

            const ctx = TestContext.createHTMLTestContext();
            ctx.container.register(Foo);
            const au = new Aurelia(ctx.container);

            const host = ctx.createElement('div');
            const component = new App();

            au.app({ host, component });
            await au.start().wait();

            assert.strictEqual(host.textContent, expectedTextContent, `host.textContent`);
            if (customAssertion) {
              await customAssertion(ctx, host, component, component.$controller.controllers[0] as any as IFoo);
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
        type ICustomAssertion = (ctx: HTMLTestContext, host: HTMLElement, app: IApp, foo: IFoo) => void;
      });
    });
  });

  interface ITestItem {
    idx: number;
    name: string;
  }

  async function tearDown(au: Aurelia) {
    await au.stop().wait();
    (au.root.host as Element).remove();
  }

  function createItems(count: number, baseName: string = 'item') {
    return Array.from({ length: count }, (_, idx) => {
      return { idx, name: `${baseName}-${idx}` }
    });
  }
});
