import { Aurelia, CustomElementResource, IViewModel } from '@aurelia/runtime';
import { TestContext, HTMLTestContext, hJsx, assert } from '@aurelia/testing';

// IMPORTANT:
//      JSX is used to eliminate space between tags so test result can be easier to manually constructed
//      if template string can be used to achieve the same effect, it could be converted back

describe.skip('replaceable', function () {

  describe('Difficult cases', function() {
    describe('+ replacement yielded replaceable', function() {
      const testCases: [string, HTMLElement | HTMLElement[], HTMLElement | HTMLElement[], ITestItem[], string, ICustomAssertion?][] = [
        [
          [
            'Does not recursively replace the replacement',
            '[replaceable #0] <<<',
            '---',
            '[foo]',
            '  [replace #0]',
            '    [replaceable #0]',
          ].join('\n'),
          <div replaceable part="p0">{'${item.name}'}</div>,
          <foo>
            <template replace-part="p0">
              replacement of {'${item.idx}-${item.name}.'}
              <div replaceable part="p0">replaceable {'${item.idx}'} from replacement {'${item.name}'}.</div>
            </template>
          </foo>,
          createItems(2),
          `replacement of 0-item-0.replaceable 0 from replacement item-0.`
        ],
        [
          [
            'Does not recursively replace the replacement (2)',
            '[replaceable #0] <<<',
            '---',
            '[foo]',
            '  [replace #0]',
            '    [replace #0]',
            '      [replaceable #0]'
          ].join('\n'),
          <div replaceable part="p0">{'${item.name}'}</div>,
          <foo>
            <template replace-part="p0">
              replacement of {'${item.idx}-${item.name}.'}
              <template replace-part="p0">
                replacement of {'${item.idx}-${item.name}.'}
                <div replaceable part="p0"></div>
              </template>
            </template>
          </foo>,
          createItems(2),
          `replacement of 0-item-0.`
        ],
        [
          [
            'Multiple replacement, same id, yields same id replaceables. Last in wins',
            '[replaceable #0] <<<',
            '---',
            '[foo]',
            '  [replace #0]',
            '    [replaceable #0]',
            '  [replace #0]',
            '    [replaceable #0]'
          ].join('\n'),
          <div replaceable part="p0">{'${item.name}'}</div>,
          <foo>
            <template replace-part="p0">
              replacement p01.
              <div replaceable part="p0">
                replacement {'${item.idx}-${item.name}'}.
              </div>
            </template>
            <template replace-part="p0">
              replacement p02.
              <div replaceable part="p0">
                replacement {'${item.idx}-${item.name}'}.
              </div>
            </template>
          </foo>,
          createItems(2),
          `replacement p02.replacement 0-item-0.`
        ],
        [
          [
            'With same custom element in replacement template.',
            '[replaceable #0] <<<',
            '---',
            '[foo]',
            '  [replace #0]',
            '    [replaceable #0]',
            '      [foo]',
            '        [replace #0]',
            '          [replaceable #0]',
          ].join('\n'),
          <div replaceable part="p0">{'${item.name}'}</div>,
          <foo>
            <template replace-part="p0">
              replacement {'[${item.idx}-${item.name}].'}
              <div replaceable part="p0">
                replaceable {'${item.idx}'} from replacement {'${item.name}'}.
                <foo>
                  <template replace-part="p0">
                    replacement {'[${item.idx}-${item.name}].'}
                    <div replaceable part="p0">
                      replaceable {'${item.idx}'} from replacement {'${item.name}'}.
                    </div>
                  </template>
                </foo>
              </div>
            </template>
          </foo>,
          createItems(2),
          `replacement [0-item-0].replaceable 0 from replacement item-0.replacement [0-item-0].replaceable 0 from replacement item-0.`
        ],
        [
          [
            '[replaceable #0] <<<',
            '---',
            '[foo]',
            '  [replace #0]',
            '    [replaceable #1]',
            '  [replace #1]',
            '    [replaceable #1]'
          ].join('\n'),
          <div replaceable part="p0">{'$item.name'}</div>,
          <foo>
            <template replace-part="p0">
              replacement p0.
              <div replaceable part="p1">Replacement yielded replaceable p1</div>
            </template>
            <template replace-part="p1">
              replacement p1.
              <div replaceable part="p1">Replacement yielded replaceable p1</div>
            </template>
          </foo>,
          createItems(2),
          'replacement p0.replacement p1.Replacement yielded replaceable p1'
        ],
        [
          [
            '[repeat]',
            '  [replaceable #0] <<<',
            '---',
            '[foo]',
            '  [replace #0]',
            '    [replaceable #1]',
            '  [replace #1]',
            '    [replace #1]'
          ].join('\n'),
          <div repeat$for="item of items">
            <div replaceable part="p0">{'$item.name'}</div>
          </div>,
          <foo>
            <template replace-part="p0">
              replacement p0.
              <div replaceable part="p1">Replacement yielded replaceable p1</div>
            </template>
            <template replace-part="p1">
              replacement p1.
              <template replace-part="p1">replacement p11.</template>
            </template>
          </foo>,
          createItems(2),
          'replacement p0.replacement p1.replacement p0.replacement p1.'
        ],
        [
          [
            '[repeat]',
            '  [repeat]',
            '    [replaceable #0] <<<',
            '---',
            '[foo]',
            '  [replace #0]',
            '    [replaceable #1]',
            '  [replace #1]',
            '    [replace #1]'
          ].join('\n'),
          <div repeat$for="item of items">
            <div repeat$for="item of items">
              <div replaceable part="p0">{'${item.name}'}</div>
            </div>
          </div>,
          <foo>
            <template replace-part="p0">
              replacement p0.
              <div replaceable part="p1">Replacement yielded replaceable p1</div>
            </template>
            <template replace-part="p1">
              replacement p1.
              <template replace-part="p1">replacement p11.</template>
            </template>
          </foo>,
          createItems(2),
          'replacement p0.replacement p1.'.repeat(4)
        ],
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
            class Foo { items = fooItems; item = fooItems[0] }
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

          assert.doesNotThrow(() => {
            au.app({ host, component });
            au.start();
          }, 'aurelia.start()');

          assert.strictEqual(host.textContent, expectedTextContent, `host.textContent`);
          if (customAssertion) {
            await customAssertion(host, component, component.$controller.controllers[0] as any as IFoo);
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
  });

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
