import { IRouter, route } from '@aurelia/router';
import {
  customElement,
  type ITemplateSourceResolver,
  TemplateSourceResolvers,
} from '@aurelia/runtime-html';
import { assert } from '@aurelia/testing';
import { tasksSettled } from '@aurelia/runtime';
import { start } from '../router/_shared/create-fixture.js';

describe('3-runtime-html/custom-elements.async-router.spec.ts', function () {
  type ResolverScope = 'global' | 'local';

  function createRegistrations(calls: { count: number }) {
    const registrations = [
      TemplateSourceResolvers.define(class TemplateSourceResolver implements ITemplateSourceResolver {
        public resolveTemplateSource(definition, template) {
          if (definition.name === 'async-route-el') {
            calls.count++;
            return Promise.resolve('<div class="resolved-route">${value}</div>');
          }
          return template;
        }
      }),
    ];
    return registrations;
  }

  for (const scope of ['global', 'local'] as const) {
    it(`loads an async-resolved route during startup with ${scope} resolver registration`, async function () {
      const calls = { count: 0 };
      const registrations = createRegistrations(calls);

      @customElement({
        name: 'async-route-el',
        template: '<div></div>',
        bindables: ['value'],
        dependencies: scope === 'local' ? registrations : [],
      })
      class AsyncRouteEl {
        public value = 'from startup route';
      }

      @route('')
      @customElement({ name: 'startup-route-el', template: '<async-route-el value.bind="value"></async-route-el>', dependencies: [AsyncRouteEl] })
      class StartupRouteEl {
        public value = 'from startup route';
      }

      @route({
        routes: [
          StartupRouteEl,
        ],
      })
      @customElement({ name: 'app', template: '<au-viewport></au-viewport>' })
      class App {}

      const { au, host } = await start({
        appRoot: App,
        registrations: [...(scope === 'global' ? registrations : []), AsyncRouteEl, StartupRouteEl],
      });
      await tasksSettled();

      assert.strictEqual(host.querySelector('.resolved-route')?.textContent, 'from startup route');
      assert.strictEqual(calls.count, 1);

      await au.stop(true);
    });

    it(`loads an async-resolved component during router navigation with ${scope} resolver registration`, async function () {
      const calls = { count: 0 };
      const registrations = createRegistrations(calls);

      @customElement({
        name: 'async-route-el',
        template: '<div></div>',
        bindables: ['value'],
        dependencies: scope === 'local' ? registrations : [],
      })
      class AsyncRouteEl {
        public value = 'from navigation';
      }

      @customElement({ name: 'sync-route-el', template: '<div class="sync-route">sync</div>' })
      class SyncRouteEl {}

      @route({
        routes: [
          { path: 'sync', component: SyncRouteEl },
          { path: 'async', component: AsyncRouteEl },
        ],
      })
      @customElement({ name: 'app', template: '<au-viewport></au-viewport>' })
      class App {}

      const { au, host, container } = await start({
        appRoot: App,
        registrations: [...(scope === 'global' ? registrations : []), AsyncRouteEl, SyncRouteEl],
      });
      const router = container.get(IRouter);

      await router.load('sync');
      await tasksSettled();
      assert.strictEqual(host.querySelector('.sync-route')?.textContent, 'sync');

      await router.load('async');
      await tasksSettled();
      assert.strictEqual(host.querySelector('.resolved-route')?.textContent, 'from navigation');
      assert.strictEqual(calls.count, 1);

      await au.stop(true);
    });
  }
});
