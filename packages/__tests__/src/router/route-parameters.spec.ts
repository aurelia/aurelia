import { resolve } from '@aurelia/kernel';
import { customElement } from '@aurelia/runtime-html';
import { assert } from '@aurelia/testing';
import { IRouteContext, IRouter, route } from '@aurelia/router';

import { start } from './_shared/create-fixture.js';

describe('router/route-parameters.spec.ts', function () {
  describe('RouteContext.routeParameters', function () {
    it('aggregates parameters from ancestor contexts', async function () {
      @customElement({ name: 'details-view', template: `<div>company:\${params.companyId};project:\${params.projectId};user:\${params.userId};detail:\${params.detailId}</div>` })
      class DetailsView {
        public readonly params = resolve(IRouteContext)
          .routeParameters<{ companyId: string; projectId: string; userId: string; detailId: string }>();
      }

      @route({ routes: [{ path: 'details/:detailId', component: DetailsView }] })
      @customElement({ name: 'user-view', template: `<au-viewport></au-viewport>` })
      class UserView { }

      @route({ routes: [{ path: 'user/:userId', component: UserView }] })
      @customElement({ name: 'project-view', template: `<au-viewport></au-viewport>` })
      class ProjectView { }

      @route({ routes: [{ path: 'project/:projectId', component: ProjectView }] })
      @customElement({ name: 'company-view', template: `<au-viewport></au-viewport>` })
      class CompanyView { }

      @route({
        routes: [
          { path: '', redirectTo: 'company/placeholder/project/placeholder/user/placeholder/details/placeholder' },
          { path: 'company/:companyId', component: CompanyView },
        ],
      })
      @customElement({ name: 'app-root', template: `<au-viewport></au-viewport>` })
      class AppRoot { }

      const { host, au, container } = await start({ appRoot: AppRoot });
      const router = container.get(IRouter);

      await router.load('company/10/project/20/user/30/details/40');

      assert.html.textContent(host, 'company:10;project:20;user:30;detail:40');

      await au.stop(true);
    });

    it('prefers the closest route parameters by default when the parameter names collide', async function () {
      @customElement({ name: 'leaf-view', template: `<div>id:\${params.id}</div>` })
      class LeafView {
        public readonly params = resolve(IRouteContext)
          .routeParameters<{ id: string }>();
      }

      @route({ routes: [{ path: 'leaf/:id', component: LeafView }] })
      @customElement({ name: 'user-node', template: `<au-viewport></au-viewport>` })
      class UserNode { }

      @route({ routes: [{ path: 'user/:id', component: UserNode }] })
      @customElement({ name: 'project-node', template: `<au-viewport></au-viewport>` })
      class ProjectNode { }

      @route({ routes: [{ path: 'project/:id', component: ProjectNode }] })
      @customElement({ name: 'company-node', template: `<au-viewport></au-viewport>` })
      class CompanyNode { }

      @route({
        routes: [
          { path: '', redirectTo: 'company/root/project/middle/user/account/leaf/final' },
          { path: 'company/:id', component: CompanyNode },
        ],
      })
      @customElement({ name: 'app-root-overlap', template: `<au-viewport></au-viewport>` })
      class AppRootOverlap { }

      const { host, au, container } = await start({ appRoot: AppRootOverlap });
      const router = container.get(IRouter);

      await router.load('company/root/project/middle/user/account/leaf/final');

      assert.html.textContent(host, 'id:final');

      await au.stop(true);
    });

    it('allows resolving parameter name collisions', async function () {
      @customElement({ name: 'strategy-leaf', template: `<div></div>` })
      class StrategyLeaf {
        public static instance: StrategyLeaf | null = null;
        public readonly nearest = resolve(IRouteContext)
          .routeParameters<{ id: string }>();
        public readonly furthest = resolve(IRouteContext)
          .routeParameters<{ id: string }>({ collisionStrategy: 'furthest' });

        public constructor() {
          StrategyLeaf.instance = this;
        }
      }

      @route({ routes: [{ path: 'leaf/:id', component: StrategyLeaf }] })
      @customElement({ name: 'strategy-user', template: `<au-viewport></au-viewport>` })
      class StrategyUser { }

      @route({ routes: [{ path: 'user/:id', component: StrategyUser }] })
      @customElement({ name: 'strategy-project', template: `<au-viewport></au-viewport>` })
      class StrategyProject { }

      @route({ routes: [{ path: 'project/:id', component: StrategyProject }] })
      @customElement({ name: 'strategy-company', template: `<au-viewport></au-viewport>` })
      class StrategyCompany { }

      @route({
        routes: [
          { path: '', redirectTo: 'company/root/project/middle/user/account/leaf/final' },
          { path: 'company/:id', component: StrategyCompany },
        ],
      })
      @customElement({ name: 'strategy-root', template: `<au-viewport></au-viewport>` })
      class StrategyRoot { }

      const { au, container } = await start({ appRoot: StrategyRoot });
      const router = container.get(IRouter);

      await router.load('company/root/project/middle/user/account/leaf/final');

      assert.notStrictEqual(StrategyLeaf.instance, null);
      assert.strictEqual(StrategyLeaf.instance!.nearest.id, 'final');
      assert.strictEqual(StrategyLeaf.instance!.furthest.id, 'root');

      await au.stop(true);
      StrategyLeaf.instance = null;
    });

    it('appends duplicate values as arrays when requested', async function () {
      @customElement({ name: 'append-leaf', template: `<div></div>` })
      class AppendLeaf {
        public static instance: AppendLeaf | null = null;
        public readonly appended = resolve(IRouteContext)
          .routeParameters({ mergeStrategy: 'append' });

        public constructor() {
          AppendLeaf.instance = this;
        }
      }

      @route({ routes: [{ path: 'leaf/:id', id: 'leaf-route', component: AppendLeaf }] })
      @customElement({ name: 'append-user', template: `<au-viewport></au-viewport>` })
      class AppendUser { }

      @route({ routes: [{ path: 'user/:id', id: 'user-route', component: AppendUser }] })
      @customElement({ name: 'append-project', template: `<au-viewport></au-viewport>` })
      class AppendProject { }

      @route({ routes: [{ path: 'project/:id', id: 'project-route', component: AppendProject }] })
      @customElement({ name: 'append-company', template: `<au-viewport></au-viewport>` })
      class AppendCompany { }

      @route({
        routes: [
          { path: '', redirectTo: 'company/root/project/middle/user/account/leaf/final' },
          { path: 'company/:id', id: 'company-route', component: AppendCompany },
        ],
      })
      @customElement({ name: 'append-root', template: `<au-viewport></au-viewport>` })
      class AppendRoot { }

      const { au, container } = await start({ appRoot: AppendRoot });
      const router = container.get(IRouter);

      await router.load('company/root/project/middle/user/account/leaf/final');

      assert.notStrictEqual(AppendLeaf.instance, null);
      const appended = AppendLeaf.instance!.appended;

      assert.deepStrictEqual(appended.id, ['root', 'middle', 'account', 'final']);

      await au.stop(true);
      AppendLeaf.instance = null;
    });

    it('can return duplicate values keyed by route id', async function () {
      @customElement({ name: 'append-map-leaf', template: `<div></div>` })
      class AppendMapLeaf {
        public static instance: AppendMapLeaf | null = null;
        public readonly mapped = resolve(IRouteContext)
          .routeParameters({ mergeStrategy: 'append-by-route' });

        public constructor() {
          AppendMapLeaf.instance = this;
        }
      }

      @route({ routes: [{ path: 'leaf/:id', id: 'leaf-route', component: AppendMapLeaf }] })
      @customElement({ name: 'append-map-user', template: `<au-viewport></au-viewport>` })
      class AppendMapUser { }

      @route({ routes: [{ path: 'user/:id', id: 'user-route', component: AppendMapUser }] })
      @customElement({ name: 'append-map-project', template: `<au-viewport></au-viewport>` })
      class AppendMapProject { }

      @route({ routes: [{ path: 'project/:id', id: 'project-route', component: AppendMapProject }] })
      @customElement({ name: 'append-map-company', template: `<au-viewport></au-viewport>` })
      class AppendMapCompany { }

      @route({
        routes: [
          { path: '', redirectTo: 'company/root/project/middle/user/account/leaf/final' },
          { path: 'company/:id', id: 'company-route', component: AppendMapCompany },
        ],
      })
      @customElement({ name: 'append-map-root', template: `<au-viewport></au-viewport>` })
      class AppendMapRoot { }

      const { au, container } = await start({ appRoot: AppendMapRoot });
      const router = container.get(IRouter);

      await router.load('company/root/project/middle/user/account/leaf/final');

      assert.notStrictEqual(AppendMapLeaf.instance, null);
      const mapped = AppendMapLeaf.instance!.mapped;

      assert.deepStrictEqual({ ...mapped.id }, {
        'company-route': 'root',
        'project-route': 'middle',
        'user-route': 'account',
        'leaf-route': 'final',
      });

      await au.stop(true);
      AppendMapLeaf.instance = null;
    });

    it('optionally includes query parameters', async function () {
      @customElement({ name: 'query-leaf', template: `<div>ready</div>` })
      class QueryLeaf {
        public static instance: QueryLeaf | null = null;
        public readonly params = resolve(IRouteContext)
          .routeParameters<{
            companyId: string;
            projectId: string;
            userId: string;
            detailId: string;
            filter: readonly string[];
            mode: string;
          }>({ includeQueryParams: true });

        public constructor() {
          QueryLeaf.instance = this;
        }
      }

      @route({ routes: [{ path: 'details/:detailId', component: QueryLeaf }] })
      @customElement({ name: 'query-user', template: `<au-viewport></au-viewport>` })
      class QueryUser { }

      @route({ routes: [{ path: 'user/:userId', component: QueryUser }] })
      @customElement({ name: 'query-project', template: `<au-viewport></au-viewport>` })
      class QueryProject { }

      @route({ routes: [{ path: 'project/:projectId', component: QueryProject }] })
      @customElement({ name: 'query-company', template: `<au-viewport></au-viewport>` })
      class QueryCompany { }

      @route({
        routes: [
          { path: '', redirectTo: 'company/placeholder/project/placeholder/user/placeholder/details/placeholder' },
          { path: 'company/:companyId', component: QueryCompany },
        ],
      })
      @customElement({ name: 'query-root', template: `<au-viewport></au-viewport>` })
      class QueryRoot { }

      const { au, container } = await start({ appRoot: QueryRoot });
      const router = container.get(IRouter);

      await router.load('company/10/project/20/user/30/details/40?filter=on&filter=off&mode=full');

      assert.notStrictEqual(QueryLeaf.instance, null);
      const params = QueryLeaf.instance!.params;

      assert.deepStrictEqual({ ...params }, {
        companyId: '10',
        projectId: '20',
        userId: '30',
        detailId: '40',
        filter: ['on', 'off'],
        mode: 'full',
      });

      await au.stop(true);
      QueryLeaf.instance = null;
    });

    it('honors router option treatQueryAsParameters by default', async function () {
      @customElement({ name: 'query-default-child', template: '' })
      class QueryDefaultChild {
        public static instance: QueryDefaultChild | null = null;
        public readonly params = resolve(IRouteContext)
          .routeParameters<{ companyId: string; filter: string }>();

        public constructor() {
          QueryDefaultChild.instance = this;
        }
      }

      @route({ routes: [{ path: ':companyId', component: QueryDefaultChild }] })
      @customElement({ name: 'query-default-parent', template: `<au-viewport></au-viewport>` })
      class QueryDefaultParent { }

      const { au, container } = await start({ appRoot: QueryDefaultParent, treatQueryAsParameters: true });
      const router = container.get(IRouter);

      await router.load('acme?filter=active');

      assert.deepStrictEqual({ ...QueryDefaultChild.instance!.params }, {
        companyId: 'acme',
        filter: 'active',
      });

      await au.stop(true);
      QueryDefaultChild.instance = null;
    });

    it('returns an immutable snapshot', async function () {
      @customElement({ name: 'frozen-child', template: '' })
      class FrozenChild {
        public static snapshot: Readonly<{ id: string }>;
        public constructor() {
          FrozenChild.snapshot = resolve(IRouteContext).routeParameters<{ id: string }>();
        }
      }

      @route({ routes: [{ path: ':id', component: FrozenChild }] })
      @customElement({ name: 'frozen-parent', template: `<au-viewport></au-viewport>` })
      class FrozenParent { }

      const { au, container } = await start({ appRoot: FrozenParent });
      const router = container.get(IRouter);

      await router.load('99');

      const snapshot = FrozenChild.snapshot;
      assert.ok(Object.isFrozen(snapshot), 'routeParameters should freeze the returned object');
      assert.strictEqual(Reflect.set(snapshot as unknown as Record<string, unknown>, 'extra', 'value'), false);

      await au.stop(true);
      FrozenChild.snapshot = undefined!;
    });

    it('returns the shared empty object when no params exist', async function () {
      @customElement({ name: 'no-param-child', template: '' })
      class NoParamChild {
        public static instance: NoParamChild | null = null;
        public readonly params = resolve(IRouteContext).routeParameters();
        public readonly repeat = resolve(IRouteContext).routeParameters();

        public constructor() {
          NoParamChild.instance = this;
        }
      }

      @route({ routes: [{ path: '', component: NoParamChild }] })
      @customElement({ name: 'no-param-parent', template: `<au-viewport></au-viewport>` })
      class NoParamParent { }

      const { au } = await start({ appRoot: NoParamParent });
      assert.strictEqual(NoParamChild.instance?.params, NoParamChild.instance?.repeat);
      await au.stop(true);
      NoParamChild.instance = null;
    });
  });
});
