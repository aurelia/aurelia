import { AttributePattern, AttrSyntax, ColonPrefixedBindAttributePattern } from '@aurelia/jit';
import { Constructable } from '@aurelia/kernel';
import { Aurelia, CustomElement } from '@aurelia/runtime';
import { assert, TestContext } from '@aurelia/testing';

describe('local-attr-patterns.spec.ts', function () {
  it('works in basic scenario [Global with : --> root with override :]', async function () {
    const { appHost } = await createFixture(
      `<div :for="msg of messages">\${msg}`,
      class {
        public messages = ['hello', 'ciao'];
      },
      [
        AttributePattern.define(
          [{ pattern: ':PART', symbols: ':' }],
          class ColonPrefixedBindAttributePattern {
            public [':PART'](rawName: string, rawValue: string, parts: string[]): AttrSyntax {
              const shorthand = parts[0];
              let syntaxParts: [string, string];
              switch (shorthand) {
                case 'for':
                  syntaxParts = ['repeat', 'for'];
                  break;
                default:
                  syntaxParts = [shorthand, 'bind'];
                  break;
              }
              return new AttrSyntax(rawName, rawValue === '' ? syntaxParts[0] : rawValue, syntaxParts[0], syntaxParts[1]);
            }
          }
        )
      ]);
      assert.strictEqual(appHost.textContent, 'hellociao');
  });

  async function createFixture<T>(template: string | Node, $class: Constructable | null, deps: any[] = []) {
    const ctx = TestContext.createHTMLTestContext();
    const { container, lifecycle, observerLocator } = ctx;
    container.register(ColonPrefixedBindAttributePattern);
    const App = CustomElement
      .define({
        name: 'app',
        template: template,
        dependencies: deps
      },
      $class);
      const def = CustomElement.getDefinition(App);
      debugger;
    const testHost = ctx.createElement('div');

    const appHost = testHost.appendChild(ctx.createElement('app'));
    const au = new Aurelia(container);
    const component = new App();

    au.app({ host: appHost, component });
    await au.start().wait();

    return {
      ctx: ctx,
      au,
      container,
      lifecycle,
      testHost: testHost,
      appHost,
      component: component as T,
      observerLocator,
      tearDown: async () => {
        await au.stop().wait();
        testHost.remove();
      }
    };
  }
});
