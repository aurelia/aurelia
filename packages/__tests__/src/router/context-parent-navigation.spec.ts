import { Registration, resolve } from '@aurelia/kernel';
import { IContextRouter, ICurrentRoute, IRouter, route } from '@aurelia/router';
import { CustomElement, IHistory, IWindow, customElement } from '@aurelia/runtime-html';
import { assert, MockBrowserHistoryLocation } from '@aurelia/testing';
import { start } from './_shared/create-fixture.js';

describe('router/context-parent-navigation.spec.ts', function () {
  for (const useHash of [false, true]) {
    describe(useHash ? 'hash URLs' : 'history URLs', function () {
      const url = (path: string) => `https://example.test/${useHash ? '#/' : ''}${path}`;
      const windowRegistration = Registration.instance(IWindow, {
        document: { baseURI: 'https://example.test/' },
        addEventListener() { /* Navigation is driven through IContextRouter. */ },
        removeEventListener() { /* No window listeners are installed. */ },
      });

      async function createFixture({
        compoundPath = false,
        defaultChild = 'none',
      }: {
        compoundPath?: boolean;
        defaultChild?: 'none' | 'route' | 'viewport';
      } = {}) {
        const calls: string[] = [];
        let allowUnload = true;

        @customElement({ name: 'parent-child', template: 'child' })
        class Child {
          public readonly router = resolve(IContextRouter);
          public canUnload(): boolean {
            calls.push('child.canUnload');
            return allowUnload;
          }
          public unloading(): void { calls.push('child.unloading'); }
          public detaching(): void { calls.push('child.detaching'); }
        }

        @customElement({ name: 'parent-default', template: 'default' })
        class Default { }

        const childRoutes = [
          { path: 'c1', component: Child },
          { path: defaultChild === 'route' ? '' : 'home', component: Default },
        ];
        const viewport = defaultChild === 'viewport'
          ? '<au-viewport default="home"></au-viewport>'
          : '<au-viewport></au-viewport>';

        @route({ routes: childRoutes })
        @customElement({ name: 'parent-page', template: `parent ${viewport}` })
        class Parent {
          public canUnload(): boolean { calls.push('parent.canUnload'); return true; }
          public unloading(): void { calls.push('parent.unloading'); }
          public detaching(): void { calls.push('parent.detaching'); }
        }

        @route({ routes: compoundPath ? [
          { path: 'a/b', component: Child },
          { path: defaultChild === 'route' ? '' : 'home', component: Default },
        ] : [{ path: 'p', component: Parent }] })
        @customElement({ name: 'parent-app', template: `root ${compoundPath ? viewport : '<au-viewport></au-viewport>'}` })
        class App { }

        const { au, host, container } = await start({ appRoot: App, useHash, registrations: [windowRegistration] });
        const router = container.get(IRouter);
        const current = container.get(ICurrentRoute);
        const history = container.get<MockBrowserHistoryLocation>(IHistory);
        await router.load(compoundPath ? 'a/b' : 'p/c1');
        assert.html.textContent(host, compoundPath ? 'root child' : 'root parent child');
        calls.length = 0;
        const child = CustomElement.for<Child>(host.querySelector('parent-child')!).viewModel;
        const parent = host.querySelector('parent-page');
        return {
          au, host, router, current, history, child, parent, calls,
          denyUnload() { allowUnload = false; },
          allowUnload() { allowUnload = true; },
        };
      }

      for (const instruction of ['..', '../', './..']) {
        for (const compoundPath of [false, true]) {
          it(`unloads the current route for ${instruction} from ${compoundPath ? 'one compound-path context' : 'nested contexts'}`, async function () {
            const { au, host, router, current, history, child, parent, calls } = await createFixture({ compoundPath });
            try {
              assert.strictEqual(await child.router.load(instruction), true);
              assert.html.textContent(host, compoundPath ? 'root' : 'root parent');
              assert.deepStrictEqual(calls, ['child.canUnload', 'child.unloading', 'child.detaching']);
              assert.strictEqual(current.path, compoundPath ? '' : 'p');
              assert.strictEqual(history.path, url(compoundPath ? '' : 'p'));
              const children = compoundPath ? router.routeTree.root.children : router.routeTree.root.children[0].children;
              assert.strictEqual(children.length, 0, 'rendered content agrees with the finalized route tree');
              assert.strictEqual(host.querySelector('parent-page'), parent, 'the parent component is retained');
            } finally {
              await au.stop(true);
            }
          });
        }

        for (const defaultChild of ['route', 'viewport'] as const) {
          it(`loads the parent ${defaultChild} default after ${instruction}`, async function () {
            const { au, host, current, history, child, parent, calls } = await createFixture({ defaultChild });
            try {
              assert.strictEqual(await child.router.load(instruction), true);
              assert.html.textContent(host, 'root parent default');
              assert.deepStrictEqual(calls, ['child.canUnload', 'child.unloading', 'child.detaching']);
              const path = defaultChild === 'route' ? 'p' : 'p/home';
              assert.strictEqual(current.path, path);
              assert.strictEqual(history.path, url(path));
              assert.strictEqual(host.querySelector('parent-page'), parent);
            } finally {
              await au.stop(true);
            }
          });
        }

        it(`honors canUnload when navigating ${instruction}`, async function () {
          const { au, host, current, history, child, calls, denyUnload, allowUnload } = await createFixture();
          try {
            denyUnload();
            assert.strictEqual(await child.router.load(instruction), false);
            assert.html.textContent(host, 'root parent child');
            assert.deepStrictEqual(calls, ['child.canUnload']);
            assert.strictEqual(current.path, 'p/c1');
            assert.strictEqual(history.path, url('p/c1'));
            assert.strictEqual(CustomElement.for(host.querySelector('parent-child')!).viewModel, child);

            allowUnload();
            calls.length = 0;
            assert.strictEqual(await child.router.load(instruction), true);
            assert.html.textContent(host, 'root parent');
            assert.deepStrictEqual(calls, ['child.canUnload', 'child.unloading', 'child.detaching']);
            assert.strictEqual(history.path, url('p'));
          } finally {
            await au.stop(true);
          }
        });
      }

      for (const instruction of ['../..', '../../..', '../../../']) {
        it(`clamps ${instruction} at the root and unloads the complete active branch`, async function () {
          const { au, host, current, history, child, calls } = await createFixture();
          try {
            assert.strictEqual(await child.router.load(instruction), true);
            assert.html.textContent(host, 'root');
            assert.strictEqual(current.path, '');
            assert.strictEqual(history.path, url(''));
            assert.deepStrictEqual(calls.slice(0, 4), ['child.canUnload', 'parent.canUnload', 'child.unloading', 'parent.unloading']);
            assert.strictEqual(calls.filter(x => x === 'child.detaching').length, 1);
            assert.strictEqual(calls.filter(x => x === 'parent.detaching').length, 1);
          } finally {
            await au.stop(true);
          }
        });
      }

      for (const prefix of ['..', '../', './..']) {
        const instruction = `${prefix}?q=2${useHash ? '' : '#section'}`;
        it(`retains the query and fragment while unloading for ${instruction}`, async function () {
          const { au, host, current, history, child, calls } = await createFixture();
          try {
            // In legacy hash instructions, the first '#' starts the route;
            // use the existing option to supply its route fragment instead.
            assert.strictEqual(await child.router.load(instruction, useHash ? { fragment: 'section' } : void 0), true);
            assert.html.textContent(host, 'root parent');
            assert.deepStrictEqual(calls, ['child.canUnload', 'child.unloading', 'child.detaching']);
            assert.strictEqual(current.path, 'p');
            assert.strictEqual(current.query.toString(), 'q=2');
            assert.strictEqual(current.url, `${useHash ? '/#/' : ''}p?q=2#section`);
            assert.strictEqual(history.path, `${url('p')}?q=2#section`);
          } finally {
            await au.stop(true);
          }
        });
      }

      for (const component of ['..', '../']) {
        it(`accepts a frozen parent-only viewport instruction for ${component}`, async function () {
          const { au, host, current, history, child, calls } = await createFixture();
          const instruction = Object.freeze({ component });
          try {
            assert.strictEqual(await child.router.load(instruction), true);
            assert.html.textContent(host, 'root parent');
            assert.deepStrictEqual(calls, ['child.canUnload', 'child.unloading', 'child.detaching']);
            assert.strictEqual(instruction.component, component);
            assert.strictEqual(current.path, 'p');
            assert.strictEqual(history.path, url('p'));
          } finally {
            await au.stop(true);
          }
        });
      }

      if (useHash) {
        for (const instruction of ['..#details', '..?q=2#details', '../ignored#details']) {
          it(`preserves the legacy hash document boundary for ${instruction}`, async function () {
            @customElement({ name: 'local-details', template: 'local details' })
            class LocalDetails { }

            @customElement({ name: 'parent-details', template: 'parent details' })
            class ParentDetails { }

            @route({ routes: [{ path: 'details', component: LocalDetails }] })
            @customElement({ name: 'hash-child', template: 'child <au-viewport></au-viewport>' })
            class Child {
              public readonly router = resolve(IContextRouter);
            }

            @route({ routes: [
              { path: 'c1', component: Child },
              { path: 'details', component: ParentDetails },
            ] })
            @customElement({ name: 'hash-parent', template: 'parent <au-viewport></au-viewport>' })
            class Parent { }

            @route({ routes: [{ path: 'p', component: Parent }] })
            @customElement({ name: 'hash-app', template: 'root <au-viewport></au-viewport>' })
            class App { }

            const { au, host, container } = await start({ appRoot: App, useHash, registrations: [windowRegistration] });
            const router = container.get(IRouter);
            const current = container.get(ICurrentRoute);
            try {
              await router.load('p/c1');
              const child = CustomElement.for<Child>(host.querySelector('hash-child')!).viewModel;
              assert.strictEqual(await child.router.load(instruction), true);
              const selectsParent = instruction.startsWith('../');
              assert.html.textContent(host, selectsParent ? 'root parent parent details' : 'root parent child local details');
              const path = selectsParent ? 'p/details' : 'p/c1/details';
              assert.strictEqual(current.path, path);
              assert.strictEqual(current.query.toString(), '', 'the document query is not a route query');
              assert.strictEqual(container.get<MockBrowserHistoryLocation>(IHistory).path, url(path));
            } finally {
              await au.stop(true);
            }
          });
        }
      }

      for (const instruction of ['..', '../']) {
        it(`clears the parent context's named viewports without clearing its sibling context for ${instruction}`, async function () {
          const unloaded: string[] = [];

          @customElement({ name: 'named-child', template: 'child' })
          class Child {
            public readonly router = resolve(IContextRouter);
            public unloading(): void { unloaded.push('child'); }
          }

          @customElement({ name: 'named-side', template: 'side' })
          class Side {
            public unloading(): void { unloaded.push('side'); }
          }

          @customElement({ name: 'named-other', template: 'other' })
          class Other {
            public unloading(): void { unloaded.push('other'); }
          }

          @route({ routes: [
            { path: 'c1', component: Child },
            { path: 'side', component: Side, viewport: 'side' },
          ] })
          @customElement({ name: 'named-parent', template: 'parent <au-viewport></au-viewport><au-viewport name="side"></au-viewport>' })
          class Parent { }

          @route({ routes: [
            { path: 'p', component: Parent },
            { path: 'other', component: Other, viewport: 'other' },
          ] })
          @customElement({ name: 'named-app', template: 'root <au-viewport></au-viewport><au-viewport name="other"></au-viewport>' })
          class App { }

          const { au, host, container } = await start({ appRoot: App, useHash, registrations: [windowRegistration] });
          const router = container.get(IRouter);
          const current = container.get(ICurrentRoute);
          try {
            await router.load('p/(c1+side@side)+other@other');
            assert.html.textContent(host, 'root parent childsideother');
            const other = host.querySelector('named-other');
            const parent = host.querySelector('named-parent');
            const child = CustomElement.for<Child>(host.querySelector('named-child')!).viewModel;

            assert.strictEqual(await child.router.load(instruction), true);
            assert.html.textContent(host, 'root parent other');
            assert.deepStrictEqual(unloaded.sort(), ['child', 'side']);
            assert.strictEqual(host.querySelector('named-parent'), parent);
            assert.strictEqual(host.querySelector('named-other'), other);
            assert.strictEqual(current.path, 'p+other@other');
            assert.strictEqual(container.get<MockBrowserHistoryLocation>(IHistory).path, url('p+other@other'));
            assert.strictEqual(router.routeTree.root.children[0].children.length, 0);
            assert.strictEqual(router.routeTree.root.children.length, 2);
          } finally {
            await au.stop(true);
          }
        });
      }
    });
  }
});
