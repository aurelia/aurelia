import { resolve } from '@aurelia/kernel';
import { IContextRouter, IRouteContext, IRouter, Params, route } from '@aurelia/router';
import { CustomElement, customElement } from '@aurelia/runtime-html';
import { assert } from '@aurelia/testing';
import { start } from './_shared/create-fixture.js';

describe('router/navigation-inputs.spec.ts', function () {
  @customElement({ name: 'input-report', template: 'report ${id}' })
  class Report {
    public id: string;
    public loading(params: Params): void { this.id = params.id ?? 'summary'; }
  }

  @route({ routes: [{ path: ['reports', 'reports/:id'], component: Report }] })
  @customElement({ name: 'input-shell', template: 'shell <au-viewport></au-viewport>' })
  class Shell {
    public readonly router = resolve(IContextRouter);
    public readonly context = resolve(IRouteContext);
  }

  @route({ routes: [{ path: 'shell', component: Shell }] })
  @customElement({ name: 'input-root', template: '<au-viewport></au-viewport>' })
  class Root { }

  for (const useHash of [false, true]) {
    for (const frozen of [false, true]) {
      it(`reuses navigation arrays after path generation (hash=${useHash}, frozen=${frozen})`, async function () {
        const { au, container, host } = await start({ appRoot: Root, useHash });
        try {
          const router = container.get(IRouter);
          await router.load('shell');
          const shell = CustomElement.for<Shell>(host.querySelector('input-shell')).viewModel;
          const destinations = ['reports'];
          if (frozen) Object.freeze(destinations);

          // A menu can generate its links and later reuse the same instructions
          // for navigation. Generation must not replace its strings with objects.
          assert.strictEqual(await router.generatePath(destinations, shell), 'reports');
          assert.deepStrictEqual(destinations, ['reports']);
          assert.strictEqual(await shell.router.generatePath(destinations), 'reports');
          assert.strictEqual(await shell.context.generateRootedPath(destinations), useHash ? '/#/shell/reports' : 'shell/reports');
          await shell.router.load(destinations);
          assert.html.textContent(host, 'shell report summary');
          assert.deepStrictEqual(destinations, ['reports']);
        } finally {
          await au.stop(true);
        }
      });

      it(`preserves caller navigation options (hash=${useHash}, frozen=${frozen})`, async function () {
        const { au, container, host } = await start({ appRoot: Root, useHash });
        try {
          const router = container.get(IRouter);
          await router.load('shell');
          const shell = CustomElement.for<Shell>(host.querySelector('input-shell')).viewModel;
          const options = { context: shell, historyStrategy: 'replace' as const };
          if (frozen) Object.freeze(options);

          await router.load('reports/1', options);
          assert.html.textContent(host, 'shell report 1');
          assert.strictEqual(options.context === shell, true, 'the application retains its original context reference');
          await router.load('reports/2', options);
          assert.html.textContent(host, 'shell report 2');

          // A pre-resolved context needs no replacement, including on frozen options.
          await router.load('reports/3', Object.freeze({ context: shell.context }));
          assert.html.textContent(host, 'shell report 3');
        } finally {
          await au.stop(true);
        }
      });
    }

    it(`snapshots params for a lazy component without freezing application state (hash=${useHash})`, async function () {
      const { au, container, host } = await start({ appRoot: Root, useHash });
      try {
        const router = container.get(IRouter);
        await router.load('shell');
        const shell = CustomElement.for<Shell>(host.querySelector('input-shell')).viewModel;
        const params = { id: '1' };
        const component = Promise.resolve({ default: Report });
        const destination = { component, params };

        // The component is resolved during navigation. Its instruction must
        // already own a snapshot so a reusable form model stays application-owned.
        const instructions = shell.router.createViewportInstructions(destination, null, null);
        assert.strictEqual(Object.isFrozen(params), false);
        params.id = '2';
        await shell.router.load(instructions);
        assert.html.textContent(host, 'shell report 1');

        await shell.router.load(destination);
        assert.html.textContent(host, 'shell report 2');
        assert.strictEqual(Object.isFrozen(params), false);
      } finally {
        await au.stop(true);
      }
    });
  }
});
