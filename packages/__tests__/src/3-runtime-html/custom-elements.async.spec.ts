import {
  Aurelia,
  CustomElement,
  CustomElementDefinition,
  IRendering,
  ISSRContext,
  type ISSRScope,
  type ITemplateSourceResolver,
  TemplateSourceResolvers,
} from '@aurelia/runtime-html';
import { tasksSettled } from '@aurelia/runtime';
import { assert, createFixture, TestContext } from '@aurelia/testing';
import { Registration } from '@aurelia/kernel';

describe('3-runtime-html/custom-elements.async.spec.ts', function () {
  // Test matrix:
  // - sync resolver keeps startup sync
  // - async resolver upgrades startup to promise only when needed
  // - async resolver works through synthetic views / repeated hydration
  // - returning undefined preserves the original template
  // - root resolvers chain in registration order
  // - local resolver runs before root resolver for descendant element compilation
  // - needsCompile:false bypasses template-source resolution
  // - resolver rejection propagates through startup
  // - compiled async template is cached across later activations

  it('keeps startup synchronous when template source resolution stays synchronous', async function () {
    let calls = 0;
    const { appHost, startPromise } = createFixture(
      `<my-el></my-el>`,
      class App {},
      [
        TemplateSourceResolvers.define(class TemplateSourceResolver implements ITemplateSourceResolver {
          public resolveTemplateSource(definition, template) {
            if (definition.name === 'my-el') {
              calls++;
              return `<input value.bind="value">`;
            }
            return template;
          }
        }),
        CustomElement.define({
          name: 'my-el',
          template: '<input>',
        }, class MyEl {
          public value = 'hello';
        }),
      ],
    );

    assert.strictEqual(startPromise, void 0);
    await tasksSettled();

    assert.strictEqual(calls, 1);
    assert.deepStrictEqual(Array.from(appHost.querySelectorAll('input')).map(x => x.value), ['hello']);
  });

  it('returns a startup promise only when async template source resolution does real async work', async function () {
    let calls = 0;
    const { appHost, startPromise } = createFixture(
      `<my-el></my-el><my-el></my-el>`,
      class App {},
      [
        TemplateSourceResolvers.define(class TemplateSourceResolver implements ITemplateSourceResolver {
          public resolveTemplateSource(definition, template) {
            if (definition.name === 'my-el') {
              calls++;
              return Promise.resolve('<input value.bind="value">');
            }
            return template;
          }
        }),
        CustomElement.define({
          name: 'my-el',
          template: '<input>',
        }, class MyEl {
          public value = 'hello';
        }),
      ],
    );

    assert.instanceOf(startPromise, Promise);
    await startPromise;
    await tasksSettled();

    assert.strictEqual(calls, 1);
    assert.deepStrictEqual(Array.from(appHost.querySelectorAll('input')).map(x => x.value), ['hello', 'hello']);
  });

  it('resolves async template sources for custom elements created from synthetic views', async function () {
    const { appHost, startPromise } = createFixture(
      `<div if.bind="show"><my-el></my-el></div>`,
      class App {
        public show = true;
      },
      [
        TemplateSourceResolvers.define(class TemplateSourceResolver implements ITemplateSourceResolver {
          public resolveTemplateSource(definition, template) {
            if (definition.name === 'my-el') {
              return Promise.resolve('<div class="resolved">${value}</div>');
            }
            return template;
          }
        }),
        CustomElement.define({
          name: 'my-el',
          template: '<div></div>',
        }, class MyEl {
          public value = 'resolved from async';
        }),
      ],
    );

    await startPromise;
    await tasksSettled();

    assert.visibleTextEqual(appHost, 'resolved from async');
  });

  it('keeps the original template when a resolver returns undefined', async function () {
    let calls = 0;
    const { appHost, startPromise } = createFixture(
      `<my-el></my-el>`,
      class App {},
      [
        TemplateSourceResolvers.define(class TemplateSourceResolver implements ITemplateSourceResolver {
          public resolveTemplateSource(definition) {
            if (definition.name === 'my-el') {
              calls++;
              return void 0;
            }
          }
        }),
        CustomElement.define({
          name: 'my-el',
          template: '<div class="original">${value}</div>',
        }, class MyEl {
          public value = 'original';
        }),
      ],
    );

    assert.strictEqual(startPromise, void 0);
    await tasksSettled();

    assert.strictEqual(calls, 1);
    assert.visibleTextEqual(appHost, 'original');
    assert.strictEqual(appHost.querySelector('.original')?.textContent, 'original');
  });

  it('chains root resolvers in registration order', async function () {
    const seen: string[] = [];
    const { appHost, startPromise } = createFixture(
      `<my-el></my-el>`,
      class App {},
      [
        TemplateSourceResolvers.define(class FirstResolver implements ITemplateSourceResolver {
          public resolveTemplateSource(definition, template) {
            if (definition.name !== 'my-el') {
              return template;
            }
            seen.push(`first:${template}`);
            return '<div class="first">${value}</div>';
          }
        }),
        TemplateSourceResolvers.define(class SecondResolver implements ITemplateSourceResolver {
          public resolveTemplateSource(definition, template) {
            if (definition.name !== 'my-el') {
              return template;
            }
            seen.push(`second:${template}`);
            return '<div class="second">${value} second</div>';
          }
        }),
        CustomElement.define({
          name: 'my-el',
          template: '<div class="base">${value} base</div>',
        }, class MyEl {
          public value = 'hello';
        }),
      ],
    );

    assert.strictEqual(startPromise, void 0);
    await tasksSettled();

    assert.deepStrictEqual(seen, [
      'first:<div class="base">${value} base</div>',
      'second:<div class="first">${value}</div>',
    ]);
    assert.strictEqual(appHost.querySelector('.second')?.textContent, 'hello second');
  });

  it('runs local resolvers before root resolvers for descendant element compilation', async function () {
    const seen: string[] = [];

    const Child = CustomElement.define({
      name: 'child-el',
      template: '<div class="child">${value}</div>',
      dependencies: [
        TemplateSourceResolvers.define(class LocalResolver implements ITemplateSourceResolver {
          public resolveTemplateSource(definition, template) {
            if (definition.name !== 'child-el') {
              return template;
            }
            seen.push(`local:${template}`);
            return '<div class="local">${value} local</div>';
          }
        }),
      ],
    }, class Child {
      public value = 'value';
    });

    const Parent = CustomElement.define({
      name: 'parent-el',
      template: '<child-el></child-el>',
      dependencies: [Child],
    }, class Parent {});

    const { appHost, startPromise } = createFixture(
      `<parent-el></parent-el>`,
      class App {},
      [
        TemplateSourceResolvers.define(class RootResolver implements ITemplateSourceResolver {
          public resolveTemplateSource(definition, template) {
            if (definition.name !== 'child-el') {
              return template;
            }
            seen.push(`root:${template}`);
            return '<div class="root">${value} local root</div>';
          }
        }),
        Parent,
      ],
    );

    assert.strictEqual(startPromise, void 0);
    await tasksSettled();

    assert.deepStrictEqual(seen, [
      'local:<div class="child">${value}</div>',
      'root:<div class="local">${value} local</div>',
    ]);
    assert.strictEqual(appHost.querySelector('.root')?.textContent, 'value local root');
  });

  it('skips template source resolution when needsCompile is false', async function () {
    let calls = 0;
    const { au } = createFixture(
      '',
      class App {},
      [
        TemplateSourceResolvers.define(class TemplateSourceResolver implements ITemplateSourceResolver {
          public resolveTemplateSource(definition, template) {
            if (definition.name === 'compiled-el') {
              calls++;
              return '<div>changed</div>';
            }
            return template;
          }
        }),
      ],
    );

    const rendering = au.container.get(IRendering);
    const definition = CustomElementDefinition.create({
      name: 'compiled-el',
      template: '<div>compiled</div>',
      needsCompile: false,
      instructions: [],
      surrogates: [],
      dependencies: [],
    });

    const compiled = rendering.compile(definition, au.container);

    assert.strictEqual(compiled, definition);
    assert.strictEqual(calls, 0);
  });

  it('propagates template source resolution failures through startup', async function () {
    const error = new Error('resolver failed');
    const { startPromise } = createFixture(
      `<my-el></my-el>`,
      class App {},
      [
        TemplateSourceResolvers.define(class TemplateSourceResolver implements ITemplateSourceResolver {
          public resolveTemplateSource(definition, template) {
            if (definition.name === 'my-el') {
              return Promise.reject(error);
            }
            return template;
          }
        }),
        CustomElement.define({
          name: 'my-el',
          template: '<div></div>',
        }, class MyEl {}),
      ],
    );

    assert.instanceOf(startPromise, Promise);
    await assert.rejects(() => startPromise as Promise<void>, error);
  });

  it('caches compiled async templates across later activations of the same custom element', async function () {
    let calls = 0;
    const { component, appHost, startPromise } = createFixture(
      `<my-el if.bind="show"></my-el>`,
      class App {
        public show = true;
      },
      [
        TemplateSourceResolvers.define(class TemplateSourceResolver implements ITemplateSourceResolver {
          public resolveTemplateSource(definition, template) {
            if (definition.name === 'my-el') {
              calls++;
              return Promise.resolve('<div class="resolved">${value}</div>');
            }
            return template;
          }
        }),
        CustomElement.define({
          name: 'my-el',
          template: '<div></div>',
        }, class MyEl {
          public value = 'cached';
        }),
      ],
    );

    await startPromise;
    await tasksSettled();
    assert.visibleTextEqual(appHost, 'cached');

    component.show = false;
    await tasksSettled();
    assert.strictEqual(appHost.querySelector('.resolved'), null);

    component.show = true;
    await tasksSettled();
    assert.visibleTextEqual(appHost, 'cached');
    assert.strictEqual(calls, 1);
  });

  describe('SSR hydration', function () {
    it('adopts SSR-rendered async custom elements and updates them during hydrate', async function () {
      let currentValue = 'server';
      const registrations = [
        TemplateSourceResolvers.define(class TemplateSourceResolver implements ITemplateSourceResolver {
          public resolveTemplateSource(definition, template) {
            if (definition.name === 'my-el') {
              return Promise.resolve('<div class="resolved">${value}</div>');
            }
            return template;
          }
        }),
      ];

      class App {
        public value = currentValue;
      }

      const MyEl = CustomElement.define({
        name: 'my-el',
        template: '<div></div>',
        bindables: ['value'],
      }, class MyEl {
        public value = '';
      });

      const AppElement = CustomElement.define({
        name: 'app',
        template: '<my-el value.bind="value"></my-el>',
        dependencies: [MyEl],
      }, App);

      const serverCtx = TestContext.create();
      serverCtx.container.register(
        Registration.instance(ISSRContext, { preserveMarkers: true }),
        ...registrations,
      );
      const serverHost = serverCtx.doc.body.appendChild(serverCtx.createElement('app'));
      const serverAu = new Aurelia(serverCtx.container).app({ host: serverHost, component: AppElement });
      let ssrMarkup = '';
      try {
        await serverAu.start();
        ssrMarkup = serverHost.innerHTML;
      } finally {
        await serverAu.stop(true);
        serverAu.dispose();
        serverHost.remove();
      }

      currentValue = 'client';
      const clientCtx = TestContext.create();
      clientCtx.container.register(...registrations);
      const clientHost = clientCtx.doc.body.appendChild(clientCtx.createElement('app'));
      clientHost.innerHTML = ssrMarkup;
      const ssrNode = clientHost.querySelector('.resolved');

      const ssrScope: ISSRScope = {
        name: 'app',
        children: [{ name: 'my-el', children: [] }],
      };
      const clientAu = new Aurelia(clientCtx.container);
      try {
        const root = await clientAu.hydrate({ host: clientHost, component: AppElement, ssrScope });
        try {
          const hydratedNode = clientHost.querySelector('.resolved');
          assert.strictEqual(hydratedNode, ssrNode, 'the SSR DOM should be adopted');
          assert.strictEqual(clientHost.textContent, 'client');

          (root.controller.viewModel as App).value = 'updated';
          await tasksSettled();
          assert.strictEqual(clientHost.textContent, 'updated');
        } finally {
          await root.deactivate();
          root.dispose();
        }
      } finally {
        clientAu.dispose();
        clientHost.remove();
      }
    });
  });
});
