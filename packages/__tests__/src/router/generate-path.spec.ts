import { resolve } from '@aurelia/kernel';
import { IRouteContext, IRouter, IRouteViewModel, NavigationInstruction, NavigationStrategy, Params, route, RouteContext, RouteNode } from '@aurelia/router';
import { CustomElement, customElement, IPlatform } from '@aurelia/runtime-html';
import { assert } from '@aurelia/testing';
import { start } from './_shared/create-fixture.js';

describe('router/generate-path.spec.ts', function () {
  for (const useHash of [false, true]) {
    describe(`router - useHash: ${useHash}`, function () {
      abstract class AbstractVm implements IRouteViewModel {
        public readonly routeContext: IRouteContext = resolve(IRouteContext);
        private readonly _router: IRouter = resolve(IRouter);
        public generateRelativePath(instructionOrInstructions: NavigationInstruction | readonly NavigationInstruction[], context?: RouteContext): string | Promise<string> {
          return this._router.generatePath(instructionOrInstructions, context ?? this);
        }

        protected params: Params;
        protected query: string;
        public loading(params: Params, next: RouteNode, _current: RouteNode | null): void | Promise<void> {
          this.params = structuredClone(params);
          this.query = next.queryParams.toString();
        }
      }

      it('flat hierarchy', async function () {
        @customElement({ name: 'c-1', template: 'c1' })
        class C1 extends AbstractVm { }

        @customElement({ name: 'c-2', template: 'c2' })
        class C2 extends AbstractVm { }

        @customElement({ name: 'c-3', template: 'c3 ${params.id} ${query}' })
        class C3 extends AbstractVm { }

        @route({
          routes: [
            { path: ['', 'c1'], component: C1 },
            C2,
            { id: 'bar', path: 'foo/:id', component: C3 },
          ]
        })
        @customElement({ name: 'ro-ot', template: '<au-viewport></au-viewport>' })
        class Root { }

        const { host, au, container, rootVm } = await start({ appRoot: Root, registrations: [C1, C2, C3], useHash });

        assert.html.textContent(host, 'c1', 'init');

        const router = container.get(IRouter);

        // #region round#1
        let expected = useHash ? '/#/c-2' : 'c-2';
        let path = await router.generatePath(C2);
        assert.strictEqual(path, expected, 'round#1 - generatePath(C2)');

        path = await router.generatePath(C2, rootVm);
        assert.strictEqual(path, expected, 'round#1 - generatePath(C2, rootVm)');

        path = await router.generatePath('c-2');
        assert.strictEqual(path, expected, 'round#1 - generatePath(\'c-2\')');

        path = await router.generatePath('c-2', rootVm);
        assert.strictEqual(path, expected, 'round#1 - generatePath(\'c-2\', rootVm)');

        const c1 = CustomElement.for<C1>(host.querySelector('c-1')!).viewModel;
        path = await c1.generateRelativePath('../c-2');
        assert.strictEqual(path, expected, 'round#1 - generatePath(\'../c-2\', C1)');

        path = await c1.generateRelativePath('c-2', c1.routeContext.parent);
        assert.strictEqual(path, expected, 'round#1 - generatePath(\'c-2\', C1)');

        await router.load(path);
        assert.html.textContent(host, 'c2', 'round#1 - load(path)');
        // #endregion

        // #region round#2
        expected = useHash ? '/#/foo/1' : 'foo/1';
        path = await router.generatePath({ component: C3, params: { id: 1 } });
        assert.strictEqual(path, expected, 'round#2 - generatePath({ component: C3, params: { id: 1 } })');

        path = await router.generatePath({ component: C3, params: { id: 1 } }, rootVm);
        assert.strictEqual(path, expected, 'round#2 - generatePath({ component: C3, params: { id: 1 } }, rootVm)');

        path = await router.generatePath({ component: 'bar', params: { id: 1 } });
        assert.strictEqual(path, expected, 'round#2 - generatePath({ component: \'bar\', params: { id: 1 } })');

        path = await router.generatePath({ component: 'bar', params: { id: 1 } }, rootVm);
        assert.strictEqual(path, expected, 'round#2 - generatePath({ component: \'bar\', params: { id: 1 } }, rootVm)');

        const c2 = CustomElement.for<C1>(host.querySelector('c-2')!).viewModel;
        path = await c2.generateRelativePath({ component: '../bar', params: { id: 1 } });
        assert.strictEqual(path, expected, 'round#2 - generatePath({ component: \'../bar\', params: { id: 1 } }, C2)');

        path = await c2.generateRelativePath({ component: 'bar', params: { id: 1 } }, c2.routeContext.parent);
        assert.strictEqual(path, expected, 'round#2 - generatePath({ component: \'bar\', params: { id: 1 } }, C2)');

        await router.load(path);
        assert.html.textContent(host, 'c3 1', 'round#2 - load(path)');
        // #endregion

        // #region round#3
        expected = useHash ? '/#/' : '';
        path = await router.generatePath(C1);
        assert.strictEqual(path, expected, 'round#3 - generatePath(C1)');

        path = await router.generatePath(C1, rootVm);
        assert.strictEqual(path, expected, 'round#3 - generatePath(C1, rootVm)');

        path = await router.generatePath(useHash ? '' : '');
        assert.strictEqual(path, expected, 'round#3 - generatePath(\'\')');

        path = await router.generatePath(useHash ? '' : '', rootVm);
        assert.strictEqual(path, expected, 'round#3 - generatePath(\'\', rootVm)');

        path = await router.generatePath({ component: C1 });
        assert.strictEqual(path, expected, 'round#3 - generatePath({ component: C1 })');

        path = await router.generatePath({ component: C1 }, rootVm);
        assert.strictEqual(path, expected, 'round#3 - generatePath({ component: C1 }, rootVm)');

        path = await router.generatePath({ component: '' });
        assert.strictEqual(path, expected, 'round#3 - generatePath({ component: \'c-1\' })');

        path = await router.generatePath({ component: '' }, rootVm);
        assert.strictEqual(path, expected, 'round#3 - generatePath({ component: \'c-1\' }, rootVm)');

        await router.load('');
        assert.html.textContent(host, 'c1', 'round#3 - load(path)');
        // #endregion

        // #region round#4 - querystring
        expected = useHash ? '/#/foo/1?bar=baz' : 'foo/1?bar=baz';
        path = await router.generatePath({ component: C3, params: { id: 1, bar: 'baz' } });
        assert.strictEqual(path, expected, 'round#4 - generatePath({ component: C3, params: { id: 1, bar: \'baz\' } })');

        await router.load(path);
        assert.html.textContent(host, 'c3 1 bar=baz', 'round#4 - load(path)');
        // #endregion

        await au.stop(true);
      });

      it('multi-level hierarchy', async function () {
        @route('gc1')
        @customElement({ name: 'gc-1', template: 'gc1' })
        class GC1 extends AbstractVm { }

        @route({ id: 'gc2', path: 'gc2/:id' })
        @customElement({ name: 'gc-2', template: 'gc2 ${params.id} ${query}' })
        class GC2 extends AbstractVm { }

        @customElement({ name: 'c-1', template: 'c1 <a load="route.bind: route; context.bind: context"></a>' })
        class C1 extends AbstractVm {
          public route: string;
          public context: IRouteContext;
        }

        @customElement({ name: 'c-2', template: 'c2 <a load="route.bind: route; context.bind: context"></a>' })
        class C2 extends AbstractVm {
          public route: string;
          public context: IRouteContext;
        }

        @route({ id: 'c3', path: 'foo/:id' })
        @customElement({ name: 'c-3', template: 'c3 ${params.id}' })
        class C3 extends AbstractVm { }

        @route({ id: 'c4', path: ['bar/:id1/:id2', 'fizz/:id3/:id4?', 'buzz/:id5/*rest'], routes: [GC1, GC2] })
        @customElement({
          name: 'c-4', template: `c4
      <template switch.bind="view">
        <template case="v1">\${params.id1} \${params.id2}</template>
        <template case="v2">\${params.id3} \${params.id4}</template>
        <template case="v3">\${params.id5} \${params.rest}</template>
      </template>
      <au-viewport></au-viewport>` })
        class C4 extends AbstractVm {
          private view: 'v1' | 'v2' | 'v3';
          public async loading(params: Params, _next: RouteNode, _current: RouteNode | null): Promise<void> {
            await super.loading(params, _next, _current);
            this.view = params.id1 != null
              ? 'v1'
              : params.id3 != null
                ? 'v2'
                : 'v3';
          }
        }

        @route({
          routes: [
            { path: ['c1', ''], component: C1 },
            C3,
          ]
        })
        @customElement({ name: 'p-1', template: 'p1 <a href.bind="route"></a> <au-viewport></au-viewport>' })
        class P1 extends AbstractVm {
          public route: string;
        }

        @route({
          routes: [
            { path: ['c2', ''], component: C2 },
            C4,
          ]
        })
        @customElement({ name: 'p-2', template: 'p2 <a href.bind="route"></a> <au-viewport></au-viewport>' })
        class P2 extends AbstractVm {
          public route: string;
        }

        @route({
          routes: [
            { id: 'p1', path: ['p1', ''], component: P1 },
            { id: 'p2', path: 'p2', component: P2 },
          ]
        })
        @customElement({ name: 'ro-ot', template: '<au-viewport></au-viewport>' })
        class Root { }

        const { host, au, container, rootVm } = await start({ appRoot: Root, registrations: [C1, C2, C3, C4, P1, P2], useHash });
        const router = container.get(IRouter);
        const platform = container.get(IPlatform);
        const domQueue = platform.domQueue;
        const taskQueue = platform.taskQueue;
        const $yield = () => Promise.all([
          domQueue.yield(),
          taskQueue.yield(),
        ]);

        assert.html.textContent(host, 'p1 c1', 'init');

        // #region round#1
        let expected = useHash ? '/#/p2' : 'p2';
        let path = await router.generatePath(P2);
        assert.strictEqual(path, expected, 'round#1 - generatePath(P2)');

        path = await router.generatePath(P2, rootVm);
        assert.strictEqual(path, expected, 'round#1 - generatePath(P2, rootVm)');

        path = await router.generatePath('p2');
        assert.strictEqual(path, expected, 'round#1 - generatePath(\'p2\')');

        path = await router.generatePath('p2', rootVm);
        assert.strictEqual(path, expected, 'round#1 - generatePath(\'p2\', rootVm)');

        const p1 = CustomElement.for<P1>(host.querySelector('p-1')!).viewModel;
        path = await p1.generateRelativePath('../p2');
        assert.strictEqual(path, expected, 'round#1 - generatePath(\'../p2\', P1)');

        path = await p1.generateRelativePath('p2', p1.routeContext.parent);
        assert.strictEqual(path, expected, 'round#1 - generatePath(\'p2\', P1)');

        let c1 = CustomElement.for<C1>(host.querySelector('c-1')!).viewModel;
        path = await c1.generateRelativePath('../../p2');
        assert.strictEqual(path, expected, 'round#1 - generatePath(\'../../p2\', C1)');

        path = await c1.generateRelativePath('p2', c1.routeContext.parent.parent);
        assert.strictEqual(path, expected, 'round#1 - generatePath(\'p2\', C1)');

        await router.load(path);
        assert.html.textContent(host, 'p2 c2', 'round#1 - load(path)');
        // #endregion

        // #region round#2
        expected = useHash ? '/#/p1/foo/1' : 'p1/foo/1';
        // route id
        path = await router.generatePath({ component: 'p1', children: [{ component: 'c3', params: { id: 1 } }] });
        assert.strictEqual(path, expected, 'round#2 - generatePath({ component: \'p1\', children: [{ component: \'c3\', params: { id: 1 } }] })');

        // custom element
        path = await router.generatePath({ component: P1, children: [{ component: C3, params: { id: 1 } }] });
        assert.strictEqual(path, expected, 'round#2 - generatePath({ component: P1, children: [{ component: C3, params: { id: 1 } }] })');

        // custom element definition
        path = await router.generatePath({ component: CustomElement.getDefinition(P1), children: [{ component: CustomElement.getDefinition(C3), params: { id: 1 } }] });
        assert.strictEqual(path, expected, 'round#2 - generatePath({ component: CustomElement.getDefinition(P1), children: [{ component: CustomElement.getDefinition(C3), params: { id: 1 } }] })');

        // function
        path = await router.generatePath({ component: () => P1, children: [{ component: () => C3, params: { id: 1 } }] });
        assert.strictEqual(path, expected, 'round#2 - generatePath({ component: () => P1, children: [{ component: () => C3, params: { id: 1 } }] })');

        await router.load(path);
        assert.html.textContent(host, 'p1 c3 1', 'round#2 - load(path)');
        // #endregion

        // reset to p2/c2
        await router.load('p2/c2');
        assert.html.textContent(host, 'p2 c2', 'round#2 - reset - load(\'p2/c2\')');

        // #region round#3 - resolve relative path at child using ancestor context
        let c2El = host.querySelector('c-2')!;
        let c2 = CustomElement.for<C2>(c2El).viewModel;
        let context = c2.context = c2.routeContext.parent.parent;
        // route id
        path = await c2.generateRelativePath({ component: 'p1', children: [{ component: 'c3', params: { id: 1 } }] }, context);
        assert.strictEqual(path, expected, 'round#3 - c2.generateRelativePath({ component: \'p1\', children: [{ component: \'c3\', params: { id: 1 } }] }, context)');

        // custom element
        path = await c2.generateRelativePath({ component: P1, children: [{ component: C3, params: { id: 1 } }] }, context);
        assert.strictEqual(path, expected, 'round#3 - c2.generateRelativePath({ component: P1, children: [{ component: C3, params: { id: 1 } }] }, context)');

        // custom element definition
        path = await c2.generateRelativePath({ component: CustomElement.getDefinition(P1), children: [{ component: CustomElement.getDefinition(C3), params: { id: 1 } }] }, context);
        assert.strictEqual(path, expected, 'round#3 - c2.generateRelativePath({ component: CustomElement.getDefinition(P1), children: [{ component: CustomElement.getDefinition(C3), params: { id: 1 } }] }, context)');

        // function
        path = await c2.generateRelativePath({ component: () => P1, children: [{ component: () => C3, params: { id: 1 } }] }, context);
        assert.strictEqual(path, expected, 'round#3 - c2.generateRelativePath({ component: () => P1, children: [{ component: () => C3, params: { id: 1 } }] }, context)');

        // click on link
        c2.route = expected;
        await $yield();
        c2El.querySelector('a').click();
        await $yield();
        assert.html.textContent(host, 'p1 c3 1', 'round#3 - click on link');
        // #endregion

        // reset to p1/c1
        await router.load('p1/c1');
        assert.html.textContent(host, 'p1 c1', 'round#3 - reset - load(\'p1/c1\')');

        // #region round#4 - resolve relative path at child using parent context
        expected = 'foo/1';
        let c1El = host.querySelector('c-1')!;
        c1 = CustomElement.for<C1>(c1El).viewModel;
        context = c1.context = c1.routeContext.parent;

        // route id
        path = await c1.generateRelativePath({ component: 'c3', params: { id: 1 } }, context);
        assert.strictEqual(path, expected, 'round#4 - c1.generateRelativePath({ component: \'c3\', params: { id: 1 } }, context)');

        // custom element
        path = await c1.generateRelativePath({ component: C3, params: { id: 1 } }, context);
        assert.strictEqual(path, expected, 'round#4 - c1.generateRelativePath({ component: C3, params: { id: 1 } }, context)');

        // custom element definition
        path = await c1.generateRelativePath({ component: CustomElement.getDefinition(C3), params: { id: 1 } }, context);
        assert.strictEqual(path, expected, 'round#4 - c1.generateRelativePath({ component: CustomElement.getDefinition(C3), params: { id: 1 } }, context)');

        // function
        path = await c1.generateRelativePath({ component: () => C3, params: { id: 1 } }, context);
        assert.strictEqual(path, expected, 'round#4 - c1.generateRelativePath({ component: () => C3, params: { id: 1 } }, context)');

        // click on link
        c1.route = expected;
        await $yield();
        c1El.querySelector('a').click();
        await $yield();
        assert.html.textContent(host, 'p1 c3 1', 'round#4 - click on link');
        // #endregion

        // reset to p1/c1
        await router.load('p1/c1');
        assert.html.textContent(host, 'p1 c1', 'round#4 - reset - load(\'p1/c1\')');

        // #region round#5 - resolve relative path to child
        const p1El = host.querySelector('p-1')!;
        const p1Vm = CustomElement.for<P1>(p1El).viewModel;

        // route id
        path = await p1Vm.generateRelativePath({ component: 'c3', params: { id: 1 } });
        assert.strictEqual(path, expected, 'round#5 - p1.generateRelativePath({ component: \'c3\', params: { id: 1 } })');

        // custom element
        path = await p1Vm.generateRelativePath({ component: C3, params: { id: 1 } });
        assert.strictEqual(path, expected, 'round#5 - p1.generateRelativePath({ component: C3, params: { id: 1 } })');

        // custom element definition
        path = await p1Vm.generateRelativePath({ component: CustomElement.getDefinition(C3), params: { id: 1 } });
        assert.strictEqual(path, expected, 'round#5 - p1.generateRelativePath({ component: CustomElement.getDefinition(C3), params: { id: 1 } })');

        // function
        path = await p1Vm.generateRelativePath({ component: () => C3, params: { id: 1 } });
        assert.strictEqual(path, expected, 'round#5 - p1.generateRelativePath({ component: () => C3, params: { id: 1 } })');

        // click on link
        p1Vm.route = expected;
        await $yield();
        p1El.querySelector('a').click();
        await $yield();
        assert.html.textContent(host, 'p1 c3 1', 'round#5 - click on link');
        // #endregion

        // reset to p1/c1
        await router.load('p1/c1');
        assert.html.textContent(host, 'p1 c1', 'round#5 - reset - load(\'p1/c1\')');

        // #region round#6 - resolve relative path to a child (required parameters) under the parent's sibling
        expected = useHash ? '/#/p2/bar/1/2' : 'p2/bar/1/2';
        c1El = host.querySelector('c-1')!;
        c1 = CustomElement.for<C1>(c1El).viewModel;
        context = c1.context = c1.routeContext.parent.parent;

        // route id
        path = await c1.generateRelativePath({ component: 'p2', children: [{ component: 'c4', params: { id1: 1, id2: 2 } }] }, context);
        assert.strictEqual(path, expected, 'round#6 - c1.generateRelativePath({ component: \'p2\', children: [{ component: \'c4\', params: { id1: 1, id2: 2 } }] }, context)');

        // custom element
        path = await c1.generateRelativePath({ component: P2, children: [{ component: C4, params: { id1: 1, id2: 2 } }] }, context);
        assert.strictEqual(path, expected, 'round#6 - c1.generateRelativePath({ component: P2, children: [{ component: C4, params: { id1: 1, id2: 2 } }] }, context)');

        // custom element definition
        path = await c1.generateRelativePath({ component: CustomElement.getDefinition(P2), children: [{ component: CustomElement.getDefinition(C4), params: { id1: 1, id2: 2 } }] }, context);
        assert.strictEqual(path, expected, 'round#6 - c1.generateRelativePath({ component: CustomElement.getDefinition(P2), children: [{ component: CustomElement.getDefinition(C4), params: { id1: 1, id2: 2 } }] }, context)');

        // function
        path = await c1.generateRelativePath({ component: () => P2, children: [{ component: () => C4, params: { id1: 1, id2: 2 } }] }, context);
        assert.strictEqual(path, expected, 'round#6 - c1.generateRelativePath({ component: () => P2, children: [{ component: () => C4, params: { id1: 1, id2: 2 } }] }, context)');

        // click on link
        c1.route = useHash ? expected.substring(3) : expected;
        await $yield();
        c1El.querySelector('a').click();
        await $yield();
        assert.html.textContent(host, 'p2 c4 1 2', 'round#6 - click on link');
        // #endregion

        // reset to p2/c2
        await router.load('p2/c2');
        assert.html.textContent(host, 'p2 c2', 'round#6 - reset - load(\'p2/c2\')');

        // #region round#7 - resolve relative path to a different child (optional parameters - value for all) under parent
        expected = 'fizz/1/2';
        c2El = host.querySelector('c-2')!;
        c2 = CustomElement.for<C2>(c2El).viewModel;
        context = c2.context = c2.routeContext.parent;

        // route id
        path = await c2.generateRelativePath({ component: 'c4', params: { id3: 1, id4: 2 } }, context);
        assert.strictEqual(path, expected, 'round#7 - c2.generateRelativePath({ component: \'c4\', params: { id3: 1, id4: 2 } }, context)');

        // custom element
        path = await c2.generateRelativePath({ component: C4, params: { id3: 1, id4: 2 } }, context);
        assert.strictEqual(path, expected, 'round#7 - c2.generateRelativePath({ component: C4, params: { id3: 1, id4: 2 } }, context)');

        // custom element definition
        path = await c2.generateRelativePath({ component: CustomElement.getDefinition(C4), params: { id3: 1, id4: 2 } }, context);
        assert.strictEqual(path, expected, 'round#7 - c2.generateRelativePath({ component: CustomElement.getDefinition(C4), params: { id3: 1, id4: 2 } }, context)');

        // function
        path = await c2.generateRelativePath({ component: () => C4, params: { id3: 1, id4: 2 } }, context);
        assert.strictEqual(path, expected, 'round#7 - c2.generateRelativePath({ component: () => C4, params: { id3: 1, id4: 2 } }, context)');

        // click on link
        c2.route = expected;
        await $yield();
        c2El.querySelector('a').click();
        await $yield();
        assert.html.textContent(host, 'p2 c4 1 2', 'round#7 - click on link');
        // #endregion

        // reset to p2/c2
        await router.load('p2/c2');
        assert.html.textContent(host, 'p2 c2', 'round#7 - reset - load(\'p2/c2\')');

        // #region round#8 - resolve relative path to a different child (optional parameters - no value) under parent
        expected = 'fizz/1/';
        c2El = host.querySelector('c-2')!;
        c2 = CustomElement.for<C2>(c2El).viewModel;
        context = c2.context = c2.routeContext.parent;

        // route id
        path = await c2.generateRelativePath({ component: 'c4', params: { id3: 1 } }, context);
        assert.strictEqual(path, expected, 'round#8 - c2.generateRelativePath({ component: \'c4\', params: { id3: 1 } }, context)');

        // custom element
        path = await c2.generateRelativePath({ component: C4, params: { id3: 1 } }, context);
        assert.strictEqual(path, expected, 'round#8 - c2.generateRelativePath({ component: C4, params: { id3: 1 } }, context)');

        // custom element definition
        path = await c2.generateRelativePath({ component: CustomElement.getDefinition(C4), params: { id3: 1 } }, context);
        assert.strictEqual(path, expected, 'round#8 - c2.generateRelativePath({ component: CustomElement.getDefinition(C4), params: { id3: 1 } }, context)');

        // function
        path = await c2.generateRelativePath({ component: () => C4, params: { id3: 1 } }, context);
        assert.strictEqual(path, expected, 'round#8 - c2.generateRelativePath({ component: () => C4, params: { id3: 1 } }, context)');

        // click on link
        c2.route = expected;
        await $yield();
        c2El.querySelector('a').click();
        await $yield();
        assert.html.textContent(host, 'p2 c4 1', 'round#8 - click on link');
        // #endregion

        // reset to p2/c2
        await router.load('p2/c2');
        assert.html.textContent(host, 'p2 c2', 'round#8 - reset - load(\'p2/c2\')');

        // #region round#9 - resolve relative path to a child (wildcard parameter)
        expected = 'buzz/1/2%2F3%2F4';
        const p2El = host.querySelector('p-2')!;
        const p2 = CustomElement.for<P2>(p2El).viewModel;

        // route id
        path = await p2.generateRelativePath({ component: 'c4', params: { id5: 1, rest: '2/3/4' } });
        assert.strictEqual(path, expected, 'round#9 - p2.generateRelativePath({ component: \'c4\', params: { id5: 1, rest: \'2/3/4\' } })');

        // custom element
        path = await p2.generateRelativePath({ component: C4, params: { id5: 1, rest: '2/3/4' } });
        assert.strictEqual(path, expected, 'round#9 - p2.generateRelativePath({ component: C4, params: { id5: 1, rest: \'2/3/4\' } })');

        // custom element definition
        path = await p2.generateRelativePath({ component: CustomElement.getDefinition(C4), params: { id5: 1, rest: '2/3/4' } });
        assert.strictEqual(path, expected, 'round#9 - p2.generateRelativePath({ component: CustomElement.getDefinition(C4), params: { id5: 1, rest: \'2/3/4\' } })');

        // function
        path = await p2.generateRelativePath({ component: () => C4, params: { id5: 1, rest: '2/3/4' } });
        assert.strictEqual(path, expected, 'round#9 - p2.generateRelativePath({ component: () => C4, params: { id5: 1, rest: \'2/3/4\' } })');

        // click on link
        p2.route = expected;
        await $yield();
        p2El.querySelector('a').click();
        await $yield();
        assert.html.textContent(host, 'p2 c4 1 2/3/4', 'round#9 - click on link');
        // #endregion

        // reset to p2/c2
        await router.load('p2/c2');
        assert.html.textContent(host, 'p2 c2', 'round#9 - reset - load(\'p2/c2\')');

        // #region round #10 - resolve to a grandchild without parameter
        expected = useHash ? '/#/p2/fizz/2/3/gc1' : 'p2/fizz/2/3/gc1';
        // custom element
        path = await router.generatePath({ component: P2, children: [{ component: C4, params: { id3: 2, id4: 3 }, children: [GC1] }] });
        assert.strictEqual(path, expected, 'round#10 - generatePath({ component: P2, children: [{ component: C4, params: { id3: 2, id4: 3 }, children: [GC1] }] })');

        // route id
        path = await router.generatePath({ component: 'p2', children: [{ component: 'c4', params: { id3: 2, id4: 3 }, children: ['gc1'] }] });
        assert.strictEqual(path, expected, 'round#10 - generatePath({ component: \'p2\', children: [{ component: \'c4\', params: { id3: 2, id4: 3 }, children: [\'gc-1\'] }] })');

        // custom element definition
        path = await router.generatePath({ component: CustomElement.getDefinition(P2), children: [{ component: CustomElement.getDefinition(C4), params: { id3: 2, id4: 3 }, children: [CustomElement.getDefinition(GC1)] }] });
        assert.strictEqual(path, expected, 'round#10 - generatePath({ component: CustomElement.getDefinition(P2), children: [{ component: CustomElement.getDefinition(C4), params: { id3: 2, id4: 3 }, children: [CustomElement.getDefinition(GC1)] }] })');

        // function
        path = await router.generatePath({ component: () => P2, children: [{ component: () => C4, params: { id3: 2, id4: 3 }, children: [() => GC1] }] });
        assert.strictEqual(path, expected, 'round#10 - generatePath({ component: () => P2, children: [{ component: () => C4, params: { id3: 2, id4: 3 }, children: [() => GC1] }] })');

        await router.load(path);
        assert.html.textContent(host, 'p2 c4 2 3 gc1', 'round#10 - load(path)');
        // #endregion

        // #region round #11 - resolve to a grandchild with parameter
        expected = useHash ? '/#/p2/fizz/2/3/gc2/4' : 'p2/fizz/2/3/gc2/4';

        // custom element
        path = await router.generatePath({ component: P2, children: [{ component: C4, params: { id3: 2, id4: 3 }, children: [{ component: GC2, params: { id: 4 } }] }] });
        assert.strictEqual(path, expected, 'round#11 - generatePath({ component: P2, children: [{ component: C4, params: { id3: 2, id4: 3 }, children: [{ component: GC2, params: { id: 4 } }] }] })');

        // route id
        path = await router.generatePath({ component: 'p2', children: [{ component: 'c4', params: { id3: 2, id4: 3 }, children: [{ component: 'gc2', params: { id: 4 } }] }] });
        assert.strictEqual(path, expected, 'round#11 - generatePath({ component: \'p2\', children: [{ component: \'c4\', params: { id3: 2, id4: 3 }, children: [{ component: \'gc-2\', params: { id: 4 } }] }] })');

        // custom element definition
        path = await router.generatePath({ component: CustomElement.getDefinition(P2), children: [{ component: CustomElement.getDefinition(C4), params: { id3: 2, id4: 3 }, children: [{ component: CustomElement.getDefinition(GC2), params: { id: 4 } }] }] });
        assert.strictEqual(path, expected, 'round#11 - generatePath({ component: CustomElement.getDefinition(P2), children: [{ component: CustomElement.getDefinition(C4), params: { id3: 2, id4: 3 }, children: [CustomElement.getDefinition(GC2, { params: { id: 4 } })] }] })');

        // function
        path = await router.generatePath({ component: () => P2, children: [{ component: () => C4, params: { id3: 2, id4: 3 }, children: [{ component: () => GC2, params: { id: 4 } }] }] });
        assert.strictEqual(path, expected, 'round#11 - generatePath({ component: () => P2, children: [{ component: () => C4, params: { id3: 2, id4: 3 }, children: [() => GC2] }] })');

        await router.load(path);
        assert.html.textContent(host, 'p2 c4 2 3 gc2 4', 'round#11 - load(path)');
        // #endregion

        // #region round 12 - query string - single valued
        expected = useHash ? '/#/p2/bar/2/3/gc2/4?id4=4&bar=baz' : 'p2/bar/2/3/gc2/4?id4=4&bar=baz';
        path = await router.generatePath({ component: P2, children: [{ component: C4, params: { id1: 2, id2: 3, id4: 4 }, children: [{ component: GC2, params: { id: 4, bar: 'baz' } }] }] });
        assert.strictEqual(path, expected, 'round#12 - generatePath({ component: P2, children: [{ component: C4, params: { id1: 2, id2: 3, id4: 4 }, children: [{ component: GC2, params: { id: 4, bar: \'baz\' } }] }] })');

        await router.load(path);
        assert.html.textContent(host, 'p2 c4 2 3 gc2 4 id4=4&bar=baz', 'round#12 - load(path)');
        // #endregion

        // reset to p2/c2
        await router.load('p2/c2');
        assert.html.textContent(host, 'p2 c2', 'round#12 - reset - load(\'p2/c2\')');

        // #region round 13 - query string - multi valued
        expected = useHash ? '/#/p2/bar/2/3/gc2/4?id4=4&bar=baz&bar=qux' : 'p2/bar/2/3/gc2/4?id4=4&bar=baz&bar=qux';
        path = await router.generatePath({ component: P2, children: [{ component: C4, params: { id1: 2, id2: 3, id4: 4, bar: 'baz' }, children: [{ component: GC2, params: { id: 4, bar: 'qux' } }] }] });
        assert.strictEqual(path, expected, 'round#13 - generatePath({ component: P2, children: [{ component: C4, params: { id1: 2, id2: 3, id4: 4, bar: \'baz\' }, children: [{ component: GC2, params: { id: 4, bar: \'qux\' } }] }] })');

        await router.load(path);
        assert.html.textContent(host, 'p2 c4 2 3 gc2 4 id4=4&bar=baz&bar=qux', 'round#13 - load(path)');
        // #endregion

        await au.stop(true);
      });

      it('flat hierarchy with sibling viewports', async function () {
        @customElement({ name: 'c-1', template: 'c1' })
        class C1 extends AbstractVm { }

        @customElement({ name: 'c-2', template: 'c2' })
        class C2 extends AbstractVm { }

        @customElement({ name: 'c-3', template: 'c3 ${params.id} ${query}' })
        class C3 extends AbstractVm { }

        @route({
          routes: [
            C1,
            C2,
            { id: 'bar', path: 'foo/:id', component: C3 },
          ]
        })
        @customElement({ name: 'ro-ot', template: '<au-viewport name="vp1"></au-viewport> <au-viewport name="vp2"></au-viewport>' })
        class Root { }

        const { host, au, container } = await start({ appRoot: Root, registrations: [C1, C2, C3], useHash });

        const router = container.get(IRouter);

        // round#1
        let expected = useHash ? '/#/c-2+foo/1' : 'c-2+foo/1';
        let path = await router.generatePath([C2, { component: C3, params: { id: 1 } }]);
        assert.strictEqual(path, expected, 'round#1 - generatePath([C2, { component: C3, params: { id: 1 } }])');

        await router.load(path);
        assert.html.textContent(host, 'c2 c3 1', 'round#1 - load(path)');

        // round#2
        expected = useHash ? '/#/foo/2+c-1' : 'foo/2+c-1';
        path = await router.generatePath([{ component: 'bar', params: { id: 2 } }, C1]);
        assert.strictEqual(path, expected, 'round#2 - generatePath([{ component: \'bar\', params: { id: 2 } }, C1])');

        await router.load(path);
        assert.html.textContent(host, 'c3 2 c1', 'round#2 - load(path)');

        // round#3 - named viewports
        expected = useHash ? '/#/c-2@vp2+foo/3@vp1' : 'c-2@vp2+foo/3@vp1';
        path = await router.generatePath([{ component: 'c-2', viewport: 'vp2' }, { component: C3, params: { id: 3 }, viewport: 'vp1' }]);
        assert.strictEqual(path, expected, 'round#3 - generatePath([{ component: C2, viewport: \'vp2\' }, { component: C3, params: { id: 3 }, viewport: \'vp1\' }])');

        await router.load(path);
        assert.html.textContent(host, 'c3 3 c2', 'round#3 - load(path)');

        // round#4 - named viewports
        expected = useHash ? '/#/foo/4@vp1+c-1@vp2' : 'foo/4@vp1+c-1@vp2';
        path = await router.generatePath([{ component: 'bar', params: { id: 4 }, viewport: 'vp1' }, { component: C1, viewport: 'vp2' }]);
        assert.strictEqual(path, expected, 'round#4 - generatePath([{ component: \'bar\', params: { id: 4 }, viewport: \'vp1\' }, { component: C1, viewport: \'vp2\' }])');

        await router.load(path);
        assert.html.textContent(host, 'c3 4 c1', 'round#4 - load(path)');

        // round#5 - query string
        expected = useHash ? '/#/foo/5@vp2+c-2@vp1?bar=baz&fizz=qux' : 'foo/5@vp2+c-2@vp1?bar=baz&fizz=qux';
        path = await router.generatePath([{ component: 'bar', params: { id: 5, bar: 'baz' }, viewport: 'vp2' }, { component: C2, viewport: 'vp1', params: { fizz: 'qux' } }]);
        assert.strictEqual(path, expected, 'round#5 - generatePath([{ component: \'bar\', params: { id: 5, bar: \'baz\' }, viewport: \'vp2\' }, { component: C2, viewport: \'vp1\', params: { fizz: \'qux\' } }])');

        await router.load(path);
        assert.html.textContent(host, 'c2 c3 5 bar=baz&fizz=qux', 'round#5 - load(path)');

        await au.stop(true);
      });

      it('multi-level hierarchy with sibling viewports', async function () {
        @route('c1')
        @customElement({ name: 'c-1', template: 'c1' })
        class C1 extends AbstractVm { }

        @route('c2')
        @customElement({ name: 'c-2', template: 'c2' })
        class C2 extends AbstractVm { }

        @route({ id: 'c3', path: 'foo/:id' })
        @customElement({ name: 'c-3', template: 'c3 ${params.id}' })
        class C3 extends AbstractVm { }

        @route({ id: 'c4', path: 'bar/:id1/:id2' })
        @customElement({ name: 'c-4', template: 'c4 ${params.id1} ${params.id2}' })
        class C4 extends AbstractVm { }

        @route({ path: 'p1', routes: [C1, C3,] })
        @customElement({ name: 'p-1', template: 'p1 <au-viewport></au-viewport>' })
        class P1 extends AbstractVm { }

        @route({ path: 'p2', routes: [C2, C4,] })
        @customElement({ name: 'p-2', template: 'p2 <au-viewport></au-viewport>' })
        class P2 extends AbstractVm { }

        @route({ routes: [P1, P2] })
        @customElement({ name: 'ro-ot', template: '<au-viewport name="vp1"></au-viewport> <au-viewport name="vp2"></au-viewport>' })
        class Root { }

        const { host, au, container } = await start({ appRoot: Root, registrations: [C1, C2, C3, C4, P1, P2], useHash });
        const router = container.get(IRouter);

        // round #1
        let expected = useHash ? '/#/p2@vp2+p1@vp1' : 'p2@vp2+p1@vp1';
        let path = await router.generatePath([{ component: P2, viewport: 'vp2' }, { component: P1, viewport: 'vp1' }]);
        assert.strictEqual(path, expected, 'round#1 - generatePath([{ component: P2, viewport: \'vp2\' }, { component: P1, viewport: \'vp1\' }])');

        await router.load(path);
        assert.html.textContent(host, 'p1 p2', 'round#1 - load(path)');

        // round #2
        expected = useHash ? '/#/p1@vp1/foo/1+p2@vp2/c2' : 'p1@vp1/foo/1+p2@vp2/c2';
        path = await router.generatePath([{ component: P1, children: [{ component: 'c3', params: { id: 1 } }], viewport: 'vp1' }, { component: P2, children: ['c2'], viewport: 'vp2' }]);
        assert.strictEqual(path, expected, 'round#2 - generatePath([{ component: P1, children: [{ component: C3, params: { id: 1 } }], viewport: \'vp1\' }, { component: P2, children: [C2], viewport: \'vp2\' }])');

        await router.load(path);
        assert.html.textContent(host, 'p1 c3 1 p2 c2', 'round#2 - load(path)');

        // round #3
        expected = useHash ? '/#/p2@vp1/bar/2/3+p1@vp2/c1' : 'p2@vp1/bar/2/3+p1@vp2/c1';
        path = await router.generatePath([{ component: 'p2', children: [{ component: C4, params: { id1: 2, id2: 3 } }], viewport: 'vp1' }, { component: 'p1', children: [C1], viewport: 'vp2' }]);
        assert.strictEqual(path, expected, 'round#3 - generatePath([{ component: \'p-2\', children: [{ component: C4, params: { id1: 2, id2: 3 } }], viewport: \'vp1\' }, { component: \'p-1\', children: [C1], viewport: \'vp2\' }])');

        await router.load(path);
        assert.html.textContent(host, 'p2 c4 2 3 p1 c1', 'round#3 - load(path)');

        await au.stop(true);
      });

      describe('does not work', function () {
        @customElement({ name: 'c-1', template: 'c1' })
        class C1 { }

        @customElement({ name: 'c-2', template: 'c2' })
        class C2 { }

        @route({ routes: [C2] })
        @customElement({ name: 'p-1', template: 'p1 <au-viewport></au-viewport>' })
        class P1 { }

        @route({ routes: [C1, P1] })
        @customElement({ name: 'ro-ot', template: '<au-viewport></au-viewport>' })
        class Root { }

        it('if the component is a promise', async function () {

          const { au, container } = await start({ appRoot: Root, registrations: [C1, C2, P1], useHash });
          const router = container.get(IRouter);

          try {
            await router.generatePath({ component: Promise.resolve(C1) });
            assert.fail('should not have generated a path');
          } catch (error) {
            assert.instanceOf(error, Error, 'Expected an error to be thrown');
            assert.includes(error.message, 'AUR3404', 'Unexpected event ID.');
          }

          await au.stop(true);
        });

        it('if the component is a function returning promise', async function () {

          const { au, container } = await start({ appRoot: Root, registrations: [C1], useHash });
          const router = container.get(IRouter);

          try {
            await router.generatePath({ component: () => Promise.resolve(C1) });
            assert.fail('should not have generated a path');
          } catch (error) {
            assert.instanceOf(error, Error, 'Expected an error to be thrown');
            assert.includes(error.message, 'AUR3166', 'Unexpected event ID.');
          }

          await au.stop(true);
        });

        it('if the component is an instance of navigation strategy', async function () {

          const { au, container } = await start({ appRoot: Root, registrations: [C1], useHash });
          const router = container.get(IRouter);

          try {
            await router.generatePath({ component: new NavigationStrategy(() => { throw new Error('does not matter'); }) });
            assert.fail('should not have generated a path');
          } catch (error) {
            assert.instanceOf(error, Error, 'Expected an error to be thrown');
            assert.includes(error.message, 'AUR3404', 'Unexpected event ID.');
          }

          await au.stop(true);
        });

        it('if the child component is a promise', async function () {

          const { au, container } = await start({ appRoot: Root, registrations: [C1, C2, P1], useHash });
          const router = container.get(IRouter);

          try {
            await router.generatePath({ component: P1, children: [Promise.resolve(C2)] });
            assert.fail('should not have generated a path');
          } catch (error) {
            assert.instanceOf(error, Error, 'Expected an error to be thrown');
            assert.includes(error.message, 'AUR3166', 'Unexpected event ID.');
          }

          await au.stop(true);
        });

        it('if the child component is a function returning a promise', async function () {

          const { au, container } = await start({ appRoot: Root, registrations: [C1, C2, P1], useHash });
          const router = container.get(IRouter);

          try {
            await router.generatePath({ component: P1, children: [() => Promise.resolve(C2)] });
            assert.fail('should not have generated a path');
          } catch (error) {
            assert.instanceOf(error, Error, 'Expected an error to be thrown');
            assert.includes(error.message, 'AUR3166', 'Unexpected event ID.');
          }

          await au.stop(true);
        });

        it('if the child component is an instance of navigation strategy', async function () {

          const { au, container } = await start({ appRoot: Root, registrations: [C1, C2, P1], useHash });
          const router = container.get(IRouter);

          try {
            await router.generatePath({ component: P1, children: [new NavigationStrategy(() => { throw new Error('does not matter'); })] });
            assert.fail('should not have generated a path');
          } catch (error) {
            assert.instanceOf(error, Error, 'Expected an error to be thrown');
            assert.includes(error.message, 'AUR3166', 'Unexpected event ID.');
          }

          await au.stop(true);
        });
      });
    });

    describe(`route-context - useHash: ${useHash}`, function () {
      abstract class AbstractVm implements IRouteViewModel {
        public readonly routeContext: IRouteContext = resolve(IRouteContext);
        public generateRelativePath(instructionOrInstructions: NavigationInstruction | readonly NavigationInstruction[]): string | Promise<string> {
          return this.routeContext.generateRelativePath(instructionOrInstructions);
        }
        public generateRootedPath(instructionOrInstructions: NavigationInstruction | readonly NavigationInstruction[]): string | Promise<string> {
          return (this.routeContext as any).generateRootedPath(instructionOrInstructions);
        }

        protected params: Params;
        protected query: string;
        public loading(params: Params, next: RouteNode, _current: RouteNode | null): void | Promise<void> {
          this.params = structuredClone(params);
          this.query = next.queryParams.toString();
        }
      }

      it('relative path generation with multi-level hierarchy', async function () {
        @route('gc1')
        @customElement({ name: 'gc-1', template: 'gc1' })
        class GC1 extends AbstractVm { }

        @route({ id: 'gc2', path: 'gc2/:id' })
        @customElement({ name: 'gc-2', template: 'gc2 ${params.id} ${query}' })
        class GC2 extends AbstractVm { }

        @customElement({ name: 'c-1', template: 'c1 <a load="route.bind: route; context.bind: context"></a>' })
        class C1 extends AbstractVm {
          public route: string;
          public context: IRouteContext;
        }

        @customElement({ name: 'c-2', template: 'c2 <a load="route.bind: route; context.bind: context"></a>' })
        class C2 extends AbstractVm {
          public route: string;
          public context: IRouteContext;
        }

        @route({ id: 'c3', path: 'foo/:id' })
        @customElement({ name: 'c-3', template: 'c3 ${params.id}' })
        class C3 extends AbstractVm { }

        @route({ id: 'c4', path: ['bar/:id1/:id2', 'fizz/:id3/:id4?', 'buzz/:id5/*rest'], routes: [GC1, GC2] })
        @customElement({
          name: 'c-4', template: `c4
      <template switch.bind="view">
        <template case="v1">\${params.id1} \${params.id2}</template>
        <template case="v2">\${params.id3} \${params.id4}</template>
        <template case="v3">\${params.id5} \${params.rest}</template>
      </template>
      <au-viewport></au-viewport>` })
        class C4 extends AbstractVm {
          private view: 'v1' | 'v2' | 'v3';
          public async loading(params: Params, _next: RouteNode, _current: RouteNode | null): Promise<void> {
            await super.loading(params, _next, _current);
            this.view = params.id1 != null
              ? 'v1'
              : params.id3 != null
                ? 'v2'
                : 'v3';
          }
        }

        @route({
          routes: [
            { path: ['c1', ''], component: C1 },
            C3,
          ]
        })
        @customElement({ name: 'p-1', template: 'p1 <a href.bind="route"></a> <au-viewport></au-viewport>' })
        class P1 extends AbstractVm {
          public route: string;
        }

        @route({
          routes: [
            { path: ['c2', ''], component: C2 },
            C4,
          ]
        })
        @customElement({ name: 'p-2', template: 'p2 <a href.bind="route"></a> <au-viewport></au-viewport>' })
        class P2 extends AbstractVm {
          public route: string;
        }

        @route({
          routes: [
            { id: 'p1', path: ['p1', ''], component: P1 },
            { id: 'p2', path: 'p2', component: P2 },
          ]
        })
        @customElement({ name: 'ro-ot', template: '<au-viewport></au-viewport>' })
        class Root { }

        const { host, au, container } = await start({ appRoot: Root, registrations: [C1, C2, C3, C4, P1, P2], useHash });
        const router = container.get(IRouter);
        const platform = container.get(IPlatform);
        const domQueue = platform.domQueue;
        const taskQueue = platform.taskQueue;
        const $yield = () => Promise.all([
          domQueue.yield(),
          taskQueue.yield(),
        ]);

        assert.html.textContent(host, 'p1 c1', 'init');

        // #region round#1 - create rooted path via relative path
        let expected = useHash ? '/#/p2/c2' : 'p2/c2';
        const p1El = host.querySelector('p-1')!;
        const p1 = CustomElement.for<P1>(p1El).viewModel;
        const c1El = host.querySelector('c-1')!;
        const c1 = CustomElement.for<C1>(c1El).viewModel;

        let path = await p1.generateRelativePath({ component: '../p2', children: [{ component: C2 }] });
        assert.strictEqual(path, expected, 'round#1 - p1.generateRelativePath({ component: \'../p2\', children: [{ component: C2 }] })');

        path = await c1.generateRelativePath({ component: '../../p2', children: [{ component: C2 }] });
        assert.strictEqual(path, expected, 'round#1 - c1.generateRelativePath({ component: \'../../p2\', children: [{ component: C2 }] })');
        // #endregion

        // #region round#2 - create a relative path
        expected = 'foo/1';
        path = await p1.generateRelativePath({ component: C3, params: { id: 1 } });
        assert.strictEqual(path, expected, 'round#2 - p1.generateRelativePath({ component: C3, params: { id: 1 } })');

        path = await c1.generateRelativePath({ component: '../c3', params: { id: 1 } });
        assert.strictEqual(path, expected, 'round#2 - c1.generateRelativePath({ component: \'../c3\', params: { id: 1 } })');

        let anchor = p1El.querySelector('a')!;
        p1.route = expected;
        await $yield();
        anchor.click();
        await $yield();
        assert.html.textContent(host, 'p1 c3 1', 'round#2 - click on link');
        // #endregion

        // #region round#3 - relative path to grandchild without parameter
        // arrange - go to p2/c2
        await router.load('p2/c2');
        assert.html.textContent(host, 'p2 c2', 'round#3 - load(\'p2/c2\')');

        expected = 'fizz/2/3/gc1';
        let p2El = host.querySelector('p-2')!;
        let p2 = CustomElement.for<P2>(p2El).viewModel;

        path = await p2.generateRelativePath({ component: C4, params: { id3: 2, id4: 3 }, children: [GC1] });
        assert.strictEqual(path, expected, 'round#3 - p2.generateRelativePath({ component: C4, params: { id3: 2, id4: 3 }, children: [GC1] })');

        // path = await p2.generateRelativePath({ component: 'c4', params: { id3: 2, id4: 3 }, children: ['gc1'] });
        // assert.strictEqual(path, expected, 'round#3 - p2.generateRelativePath({ component: \'c4\', params: { id3: 2, id4: 3 }, children: [GC1] })');

        anchor = p2El.querySelector('a')!;
        p2.route = expected;
        await $yield();
        anchor.click();
        await $yield();
        assert.html.textContent(host, 'p2 c4 2 3 gc1', 'round#3 - click on link');
        // #endregion

        // reset to p2/c2
        await router.load('p2/c2');
        assert.html.textContent(host, 'p2 c2', 'round#3 - reset - load(\'p2/c2\')');

        // #region round#4 - relative path to grandchild with parameter - anchor at child with root context
        expected = useHash ? '/#/p2/fizz/2/3/gc2/4' : 'p2/fizz/2/3/gc2/4';
        p2El = host.querySelector('p-2')!;
        p2 = CustomElement.for<P2>(p2El).viewModel;
        let c2El = host.querySelector('c-2')!;
        let c2 = CustomElement.for<C2>(c2El).viewModel;

        path = await c2.generateRelativePath({ component: '../../p2', children: [{ component: C4, params: { id3: 2, id4: 3 }, children: [{ component: GC2, params: { id: 4 } }] }] });
        assert.strictEqual(path, expected, 'round#4 - c2.generateRelativePath({ component: \'../p2\', children: [{ component: C4, params: { id3: 2, id4: 3 }, children: [{ component: GC2, params: { id: 4 } }] }] })');

        path = await c2.generateRelativePath({ component: '../../p2', children: [{ component: 'c4', params: { id3: 2, id4: 3 }, children: [{ component: 'gc2', params: { id: 4 } }] }] });
        assert.strictEqual(path, expected, 'round#4 - c2.generateRelativePath({ component: \'../p2\', children: [{ component: \'c4\', params: { id3: 2, id4: 3 }, children: [{ component: \'gc2\', params: { id: 4 } }] }] })');

        anchor = c2El.querySelector('a')!;
        c2.route = useHash ? expected.substring(3) : expected;
        c2.context = null; // root context
        await $yield();
        anchor.click();
        await $yield();
        assert.html.textContent(host, 'p2 c4 2 3 gc2 4', 'round#4 - click on link');
        // #endregion

        // reset to p2/c2
        await router.load('p2/c2');
        assert.html.textContent(host, 'p2 c2', 'round#4 - reset - load(\'p2/c2\')');

        // #region round#5 - relative path to grandchild with parameter - anchor at child with parent context
        expected = 'fizz/2/3/gc2/4';
        p2El = host.querySelector('p-2')!;
        p2 = CustomElement.for<P2>(p2El).viewModel;
        c2El = host.querySelector('c-2')!;
        c2 = CustomElement.for<C2>(c2El).viewModel;

        path = await c2.generateRelativePath({ component: '../c4', params: { id3: 2, id4: 3 }, children: [{ component: GC2, params: { id: 4 } }] });
        assert.strictEqual(path, expected, 'round#5 - c2.generateRelativePath({ component: \'../c4\', params: { id3: 2, id4: 3 }, children: [{ component: GC2, params: { id: 4 } }] })');

        path = await p2.generateRelativePath({ component: C4, params: { id3: 2, id4: 3 }, children: [{ component: 'gc2', params: { id: 4 } }] });
        assert.strictEqual(path, expected, 'round#5 - p2.generateRelativePath({ component: C4, params: { id3: 2, id4: 3 }, children: [{ component: \'gc2\', params: { id: 4 } }] })');

        anchor = c2El.querySelector('a')!;
        c2.route = expected;
        c2.context = p2.routeContext;
        await $yield();
        anchor.click();
        await $yield();
        assert.html.textContent(host, 'p2 c4 2 3 gc2 4', 'round#5 - click on link');
        // #endregion

        await au.stop(true);
      });

      it('rooted path generation with multi-level hierarchy', async function () {
        @route('gc1')
        @customElement({ name: 'gc-1', template: 'gc1 <a load="route.bind: route; context.bind: context"></a>' })
        class GC1 extends AbstractVm {
          public route: string;
          public context: IRouteContext = null;
        }

        @route({ id: 'gc2', path: 'gc2/:id' })
        @customElement({ name: 'gc-2', template: 'gc2 ${params.id} ${query}' })
        class GC2 extends AbstractVm { }

        @route({ id: 'c1', path: 'c1' })
        @customElement({ name: 'c-1', template: 'c1 <a load="route.bind: route; context.bind: context"></a>' })
        class C1 extends AbstractVm {
          public route: string;
          public context: IRouteContext = null;
        }

        @route({ id: 'c2', path: 'c2' })
        @customElement({ name: 'c-2', template: 'c2 <a load="route.bind: route; context.bind: context"></a>' })
        class C2 extends AbstractVm {
          public route: string;
          public context: IRouteContext = null;
        }

        @route({ id: 'c3', path: 'foo/:id' })
        @customElement({ name: 'c-3', template: 'c3 ${params.id}' })
        class C3 extends AbstractVm { }

        @route({ id: 'c4', path: ['bar/:id1/:id2', 'fizz/:id3/:id4?', 'buzz/:id5/*rest'], routes: [GC1, GC2] })
        @customElement({
          name: 'c-4', template: `c4
      <template switch.bind="view">
        <template case="v1">${'${params.id1}'} ${'${params.id2}'}</template>
        <template case="v2">${'${params.id3}'} ${'${params.id4}'}</template>
        <template case="v3">${'${params.id5}'} ${'${params.rest}'}</template>
      </template>
      <au-viewport></au-viewport>` })
        class C4 extends AbstractVm {
          private view: 'v1' | 'v2' | 'v3';
          public async loading(params: Params, _next: RouteNode, _current: RouteNode | null): Promise<void> {
            await super.loading(params, _next, _current);
            this.view = params.id1 != null
              ? 'v1'
              : params.id3 != null
                ? 'v2'
                : 'v3';
          }
        }

        @route({ routes: [C1, C3] })
        @customElement({ name: 'p-1', template: 'p1 <au-viewport></au-viewport>' })
        class P1 extends AbstractVm {
          public route: string;
        }

        @route({ routes: [C2, C4] })
        @customElement({ name: 'p-2', template: 'p2 <au-viewport></au-viewport>' })
        class P2 extends AbstractVm {
          public route: string;
        }

        @route({
          routes: [
            { id: 'p1', path: 'p1', component: P1 },
            { id: 'p2', path: 'p2', component: P2 },
          ]
        })
        @customElement({ name: 'ro-ot', template: '<au-viewport></au-viewport>' })
        class Root { }

        const { host, au, container } = await start({ appRoot: Root, registrations: [C1, C2, C3, C4, P1, P2], useHash });
        const router = container.get(IRouter);
        const platform = container.get(IPlatform);
        const domQueue = platform.domQueue;
        const taskQueue = platform.taskQueue;
        const $yield = () => Promise.all([
          domQueue.yield(),
          taskQueue.yield(),
        ]);

        // we intentionally avoid empty paths for this test, otherwise the path generation will result in empty parent paths.
        await router.load('p1/c1');
        assert.html.textContent(host, 'p1 c1', 'init');

        // #region round#1 - the rooted path to sibling route at child level
        let expected = useHash ? '/#/p1/foo/1' : 'p1/foo/1';
        const p1El = host.querySelector('p-1')!;
        const p1 = CustomElement.for<P1>(p1El).viewModel;
        const c1El = host.querySelector('c-1')!;
        const c1 = CustomElement.for<C1>(c1El).viewModel;

        let path = await p1.generateRootedPath({ component: C3, params: { id: 1 } });
        assert.strictEqual(path, expected, 'round#1 - p1.generateRootedPath({ component: C3 })');

        path = await c1.generateRootedPath({ component: '../c3', params: { id: 1 } });
        assert.strictEqual(path, expected, 'round#1 - c1.generateRootedPath({ component: \'../c3\', params: { id: 1 } })');

        let anchor = c1El.querySelector('a')!;
        c1.route = expected;
        await $yield();
        anchor.click();
        await $yield();
        assert.html.textContent(host, 'p1 c3 1', 'round#1 - click on link');
        // #endregion

        // #region round#2 - the rooted path to sibling route at grandchild level

        // go to grandchild
        await router.load('p2/bar/2/3/gc1');
        assert.html.textContent(host, 'p2 c4 2 3 gc1', 'round#2 - load(\'p2/bar/2/3/gc1\')');

        expected = useHash ? '/#/p2/bar/2/3/gc2/4' : 'p2/bar/2/3/gc2/4';
        // const p2El = host.querySelector('p-2')!;
        // const p2 = CustomElement.for<P2>(p2El).viewModel;
        const c4El = host.querySelector('c-4')!;
        const c4 = CustomElement.for<C4>(c4El).viewModel;
        const gc1El = host.querySelector('gc-1')!;
        const gc1 = CustomElement.for<GC1>(gc1El).viewModel;

        path = await c4.generateRootedPath({ component: GC2, params: { id: 4 } });
        assert.strictEqual(path, expected, 'round#2 - c4.generateRootedPath({ component: GC2, params: { id: 4 } })');

        path = await gc1.generateRootedPath({ component: '../gc2', params: { id: 4 } });
        assert.strictEqual(path, expected, 'round#2 - gc1.generateRootedPath({ component: \'../gc2\', params: { id: 4 } })');

        anchor = gc1El.querySelector('a')!;
        gc1.route = expected;
        await $yield();
        anchor.click();
        await $yield();
        assert.html.textContent(host, 'p2 c4 2 3 gc2 4', 'round#2 - click on link');
        // #endregion

        await au.stop(true);
      });

    });
  }
});
