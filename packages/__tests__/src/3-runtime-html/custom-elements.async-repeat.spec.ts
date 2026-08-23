import {
  CustomElement,
  type ITemplateSourceResolver,
  TemplateSourceResolvers,
} from '@aurelia/runtime-html';
import { tasksSettled } from '@aurelia/runtime';
import { assert, createFixture } from '@aurelia/testing';

describe('3-runtime-html/custom-elements.async-repeat.spec.ts', function () {
  type ResolverScope = 'global' | 'local';

  function createRegistrations(calls: { count: number }) {
    const registrations = [
      TemplateSourceResolvers.define(class TemplateSourceResolver implements ITemplateSourceResolver {
        public resolveTemplateSource(definition, template) {
          if (definition.name === 'async-tc-el') {
            calls.count++;
            return Promise.resolve('<span class="resolved">${value}</span>');
          }
          return template;
        }
      }),
      CustomElement.define({
        name: 'async-tc-el',
        template: '<span></span>',
        bindables: ['value'],
      }, class AsyncTcEl {
        public value = '';
      }),
    ];
    return registrations;
  }

  function createFixtureForScope(
    scope: ResolverScope,
    template: string,
    App: new () => object,
    calls: { count: number },
  ) {
    const registrations = createRegistrations(calls);
    if (scope === 'global') {
      return createFixture(template, App, registrations);
    }

    const LocalHost = CustomElement.define({
      name: 'local-host',
      template,
      dependencies: registrations,
    }, App);

    return createFixture('<local-host></local-host>', class Root {}, [LocalHost]);
  }

  for (const scope of ['global', 'local'] as const) {
    describe(`${scope} resolver registration`, function () {
      describe('if / else', function () {
        it('renders the async custom element inside an if branch', async function () {
          const calls = { count: 0 };
          const { appHost, startPromise } = createFixtureForScope(
            scope,
            '<async-tc-el if.bind="show" value.bind="value"></async-tc-el><div else>fallback</div>',
            class App {
              public show = true;
              public value = 'if branch';
            },
            calls,
          );

          await startPromise;
          await tasksSettled();

          assert.strictEqual(appHost.querySelector('.resolved')?.textContent, 'if branch');
          assert.strictEqual(appHost.textContent, 'if branch');
          assert.strictEqual(calls.count, 1);
        });
      });

      describe('with', function () {
        it('renders the async custom element inside a with scope', async function () {
          const calls = { count: 0 };
          const { appHost, startPromise } = createFixtureForScope(
            scope,
            '<async-tc-el with.bind="item" value.bind="value"></async-tc-el>',
            class App {
              public item = { value: 'with scope' };
            },
            calls,
          );

          await startPromise;
          await tasksSettled();

          assert.strictEqual(appHost.querySelector('.resolved')?.textContent, 'with scope');
          assert.strictEqual(calls.count, 1);
        });
      });

      describe('repeat', function () {
        it('renders repeated async custom elements without re-resolving the same template', async function () {
          const calls = { count: 0 };
          const { appHost, startPromise } = createFixtureForScope(
            scope,
            '<async-tc-el repeat.for="item of items" value.bind="item"></async-tc-el>',
            class App {
              public items = ['one', 'two', 'three'];
            },
            calls,
          );

          await startPromise;
          await tasksSettled();

          assert.deepStrictEqual(
            Array.from(appHost.querySelectorAll('.resolved')).map(x => x.textContent),
            ['one', 'two', 'three'],
          );
          assert.strictEqual(calls.count, 1);
        });
      });

      describe('switch', function () {
        it('renders the async custom element inside a switch case', async function () {
          const calls = { count: 0 };
          const { appHost, startPromise } = createFixtureForScope(
            scope,
            '<div><div switch.bind="kind"><async-tc-el case="match" value.bind="value"></async-tc-el></div></div>',
            class App {
              public kind = 'match';
              public value = 'switch case';
            },
            calls,
          );

          await startPromise;
          await tasksSettled();

          assert.strictEqual(appHost.querySelector('.resolved')?.textContent, 'switch case');
          assert.strictEqual(appHost.textContent?.trim(), 'switch case');
          assert.strictEqual(calls.count, 1);
        });
      });

      describe('promise', function () {
        it('renders the async custom element in the fulfilled promise branch', async function () {
          const calls = { count: 0 };
          const { appHost, startPromise } = createFixtureForScope(
            scope,
            `
            <div promise.bind="promise">
              <div pending>pending</div>
              <async-tc-el then.from-view="data" value.bind="data"></async-tc-el>
              <div catch.from-view="err">\${err}</div>
            </div>
            `,
            class App {
              public promise = Promise.resolve('promise value');
            },
            calls,
          );

          await startPromise;
          await tasksSettled();

          assert.strictEqual(appHost.querySelector('.resolved')?.textContent, 'promise value');
          assert.strictEqual(appHost.textContent?.includes('pending'), false);
          assert.strictEqual(calls.count, 1);
        });
      });
    });
  }
});
