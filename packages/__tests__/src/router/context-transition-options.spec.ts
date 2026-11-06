import { Registration, resolve } from '@aurelia/kernel';
import { IContextRouter, ICurrentRoute, IRouter, Params, RouteNode, route } from '@aurelia/router';
import { CustomElement, IHistory, IWindow, customElement } from '@aurelia/runtime-html';
import { assert, MockBrowserHistoryLocation } from '@aurelia/testing';
import { start } from './_shared/create-fixture.js';

describe('router/context-transition-options.spec.ts', function () {
  for (const useHash of [false, true]) {
    for (const { previousPlan, nextPlan, replaces, invokesLoading } of [
      { previousPlan: void 0, nextPlan: 'replace', replaces: true, invokesLoading: true },
      { previousPlan: 'replace', nextPlan: 'none', replaces: false, invokesLoading: false },
      { previousPlan: 'replace', nextPlan: 'invoke-lifecycles', replaces: false, invokesLoading: true },
      { previousPlan: 'none', nextPlan: void 0, replaces: false, invokesLoading: true },
    ] as const) {
      it(`uses the current contextual ${nextPlan ?? 'configured'} plan after ${previousPlan ?? 'configured'} - useHash: ${useHash}`, async function () {
        let instances = 0;
        let parentLoads = 0;
        let siblingLoads = 0;
        const calls: { instance: number; id: string; query: string; fragment: string | null }[] = [];

        @customElement({ name: 'context-options-child', template: '${id}' })
        class Child {
          public readonly instance = ++instances;
          public id = '';
          public loading(params: Params, next: RouteNode): void {
            this.id = params.id as string;
            calls.push({ instance: this.instance, id: this.id, query: next.queryParams.toString(), fragment: next.fragment });
          }
        }

        @route({ routes: [{ path: 'item/:id', component: Child, transitionPlan: 'invoke-lifecycles' }] })
        @customElement({ name: 'context-options-parent', template: '<au-viewport></au-viewport>' })
        class Parent {
          public readonly router = resolve(IContextRouter);
          public loading(): void { parentLoads++; }
        }

        @customElement({ name: 'context-options-sibling', template: 'sibling' })
        class Sibling {
          public loading(): void { siblingLoads++; }
        }

        @route({ routes: [
          { path: 'p', component: Parent },
          { path: 'sibling', component: Sibling, viewport: 'side' },
        ] })
        @customElement({ name: 'context-options-app', template: '<au-viewport></au-viewport><au-viewport name="side"></au-viewport>' })
        class App { }

        const { au, host, container } = await start({
          appRoot: App,
          useHash,
          registrations: [Registration.instance(IWindow, {
            document: { baseURI: 'https://example.test/' },
            addEventListener() { /* Navigation is driven through IContextRouter. */ },
            removeEventListener() { /* No window listeners are installed. */ },
          })],
        });
        const router = container.get(IRouter);
        const current = container.get(ICurrentRoute);
        const history = container.get<MockBrowserHistoryLocation>(IHistory);
        try {
          await router.load('p/item/1+sibling@side', { transitionPlan: previousPlan, queryParams: { q: '1' }, fragment: 'before' });
          const before = CustomElement.for<Child>(host.querySelector('context-options-child')!).viewModel;
          const parent = CustomElement.for<Parent>(host.querySelector('context-options-parent')!).viewModel;
          const sibling = CustomElement.for<Sibling>(host.querySelector('context-options-sibling')!).viewModel;
          assert.html.textContent(host, '1sibling');
          calls.length = 0;

          assert.strictEqual(await parent.router.load('item/2', {
            transitionPlan: nextPlan,
            queryParams: { q: '2' },
            fragment: 'after',
          }), true);

          const after = CustomElement.for<Child>(host.querySelector('context-options-child')!).viewModel;
          assert.strictEqual(after !== before, replaces, 'the current plan determines component identity');
          assert.strictEqual(CustomElement.for(host.querySelector('context-options-parent')!).viewModel, parent, 'the containing context is retained');
          assert.strictEqual(CustomElement.for(host.querySelector('context-options-sibling')!).viewModel, sibling, 'other root contexts are retained');
          assert.strictEqual(parentLoads, 1, 'the child override does not run parent hooks');
          assert.strictEqual(siblingLoads, 1, 'the child override does not run sibling hooks');
          assert.html.textContent(host, invokesLoading ? '2sibling' : '1sibling');
          assert.deepStrictEqual(calls, invokesLoading
            ? [{ instance: after.instance, id: '2', query: 'q=2', fragment: 'after' }]
            : [], 'loading receives current navigation data only when requested by the plan');
          assert.strictEqual(current.path, 'p/item/2+sibling@side');
          assert.strictEqual(current.query.toString(), 'q=2');
          assert.strictEqual(router.routeTree.queryParams.toString(), 'q=2');
          assert.strictEqual(router.routeTree.fragment, 'after');
          assert.strictEqual(history.path, `https://example.test/${useHash ? '#/' : ''}p/item/2+sibling@side?q=2#after`);
        } finally {
          await au.stop(true);
        }
      });
    }
  }
});
