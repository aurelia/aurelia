import {
  CustomElement,
  type ITemplateSourceResolver,
  TemplateSourceResolvers,
} from '@aurelia/runtime-html';
import { tasksSettled } from '@aurelia/runtime';
import { assert, createFixture } from '@aurelia/testing';

describe('3-runtime-html/custom-elements.async-compose.spec.ts', function () {
  type ResolverScope = 'global' | 'local';

  function createAsyncComponentRegistrations(calls: { count: number }) {
    const registrations = [
      TemplateSourceResolvers.define(class TemplateSourceResolver implements ITemplateSourceResolver {
        public resolveTemplateSource(definition, template) {
          if (definition.name === 'async-compose-el') {
            calls.count++;
            return Promise.resolve('<div class="resolved">${value}</div>');
          }
          return template;
        }
      }),
      CustomElement.define({
        name: 'async-compose-el',
        template: '<div></div>',
        bindables: ['value'],
      }, class AsyncComposeEl {
        public value = 'composed';
      }),
    ];
    return registrations;
  }

  for (const scope of ['global', 'local'] as const) {
    it(`composes a custom element whose template is resolved asynchronously with ${scope} resolver registration`, async function () {
      const calls = { count: 0 };
      const registrations = createAsyncComponentRegistrations(calls);
      const { appHost } = await createFixture(
        '<au-compose component.bind="component">',
        class App {
          public component = CustomElement.define({
            name: 'async-compose-host',
            template: '<async-compose-el value.bind="value"></async-compose-el><async-compose-el value.bind="value"></async-compose-el>',
            dependencies: scope === 'local' ? registrations : [],
          }, class AsyncComposeHost {
            public value = 'from compose';
          });
        },
        scope === 'global' ? registrations : [],
      ).started;
      await tasksSettled();

      assert.deepStrictEqual(
        Array.from(appHost.querySelectorAll('.resolved')).map(x => x.textContent),
        ['from compose', 'from compose'],
      );
      assert.strictEqual(calls.count, 1);
    });

    it(`composes a promised custom element whose template is resolved asynchronously with ${scope} resolver registration`, async function () {
      const calls = { count: 0 };
      const registrations = createAsyncComponentRegistrations(calls);
      const { appHost } = await createFixture(
        '<au-compose component.bind="getComponent()">',
        class App {
          public getComponent() {
            return Promise.resolve(CustomElement.define({
              name: 'async-compose-promise-host',
              template: '<async-compose-el value.bind="value"></async-compose-el>',
              dependencies: scope === 'local' ? registrations : [],
            }, class AsyncComposePromiseHost {
              public value = 'from promised compose';
            }));
          }
        },
        scope === 'global' ? registrations : [],
      ).started;
      await tasksSettled();

      assert.strictEqual(appHost.querySelector('.resolved')?.textContent, 'from promised compose');
      assert.strictEqual(calls.count, 1);
    });
  }
});
