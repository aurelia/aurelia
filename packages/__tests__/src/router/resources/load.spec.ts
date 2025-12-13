import { IRouteContext, IRouteViewModel, IRouter, Params, route, RouteNode } from '@aurelia/router';
import { CustomElement, customElement, ILocation, IPlatform } from '@aurelia/runtime-html';
import { assert, MockBrowserHistoryLocation } from '@aurelia/testing';
import { start } from '../_shared/create-fixture.js';
import { resolve } from '@aurelia/kernel';

describe('router/resources/load.spec.ts', function () {

  function assertAnchors(anchors: HTMLAnchorElement[] | NodeListOf<HTMLAnchorElement>, expected: { href: string; active?: boolean }[], message: string = '', assertActive: boolean = true): void {
    const len = anchors.length;
    assert.strictEqual(len, expected.length, `${message} length`);
    for (let i = 0; i < len; i++) {
      const anchor = anchors[i];
      const item = expected[i];
      assert.strictEqual(anchor.href.endsWith(item.href), true, `${message} - #${i} href - actual: ${anchor.href} - expected: ${item.href}`);
      if (!assertActive) continue;
      assert.strictEqual(anchor.classList.contains('active'), !!item.active, `${message} - #${i} active`);
    }
  }

  it('active status works correctly', async function () {
    @customElement({ name: 'fo-o', template: '' })
    class Foo { }

    @route({
      routes: [
        { id: 'foo', path: 'foo/:id', component: Foo }
      ]
    })
    @customElement({
      name: 'ro-ot',
      template: `
    <a load="route:foo; params.bind:{id: 1}; active.bind:active1" active.class="active1"></a>
    <a load="route:foo/2; active.bind:active2" active.class="active2"></a>
    <au-viewport></au-viewport>`
    })
    class Root { }

    const { au, host, container } = await start({ appRoot: Root, registrations: [Foo] });
    const queue = container.get(IPlatform).domQueue;
    await queue.yield();

    const anchors = host.querySelectorAll('a');
    const a1 = { href: 'foo/1', active: false };
    const a2 = { href: 'foo/2', active: false };
    assertAnchors(anchors, [a1, a2], 'round#1');

    anchors[1].click();
    await queue.yield();
    a2.active = true;
    assertAnchors(anchors, [a1, a2], 'round#2');

    anchors[0].click();
    await queue.yield();
    a1.active = true;
    a2.active = false;
    assertAnchors(anchors, [a1, a2], 'round#3');

    await au.stop(true);
  });

  it('resolves sibling and root routes without explicit dot segments', async function () {
    @customElement({ name: 'home-view', template: 'home' })
    class HomeView { }

    @customElement({
      name: 'about-view',
      template: `
    about
    <a data-testid="about-home" load="home">Go Home</a>`
    })
    class AboutView {
      public static lastInstance: AboutView | null = null;
      public readonly ctx: IRouteContext;
      public constructor() {
        AboutView.lastInstance = this;
        this.ctx = resolve(IRouteContext);
      }
    }

    @customElement({ name: 'admins-view', template: 'admins' })
    class AdminsView { }

    @customElement({
      name: 'member-details-view',
      template: `
    member details
    <nav>
      <a data-testid="details-parent-admins" load="../admins">Parent Admins</a>
      <a data-testid="details-root-about" load="../../about">Root About</a>
    </nav>`
    })
    class MemberDetailsView {
      public static lastInstance: MemberDetailsView | null = null;
      public readonly ctx: IRouteContext;
      public constructor() {
        MemberDetailsView.lastInstance = this;
        this.ctx = resolve(IRouteContext);
      }
    }

    @customElement({ name: 'user-view', template: 'user view' })
    class UserView { }

    @route({
      routes: [
        { path: '', redirectTo: 'details' },
        { path: 'details', component: MemberDetailsView },
      ]
    })
    @customElement({
      name: 'members-view',
      template: `
    members
    <nav>
      <a data-testid="members-admins" load="admins">Admins</a>
      <a data-testid="members-about" load="about">About</a>
      <a data-testid="members-parent-about" load="../about">Parent About</a>
      <a data-testid="members-root-home" load="/home">Root Home</a>
    </nav>
    <au-viewport></au-viewport>`
    })
    class MembersView {
      public static lastInstance: MembersView | null = null;
      public readonly ctx: IRouteContext;
      public constructor() {
        MembersView.lastInstance = this;
        this.ctx = resolve(IRouteContext);
      }
    }

    @route({
      routes: [
        {
          path: '',
          redirectTo: 'members'
        },
        {
          path: 'members',
          component: MembersView,
        },
        { path: 'admins', component: AdminsView },
      ],
    })
    @customElement({
      name: 'users-view',
      template: `
    users
    <nav>
      <a data-testid="users-members" load="members">Members</a>
      <a data-testid="users-admins" load="admins">Admins</a>
    </nav>
    <au-viewport></au-viewport>`
    })
    class UsersView { }

    @route({
      routes: [
        { path: '', redirectTo: 'home' },
        { path: 'home', component: HomeView },
        { id: 'about-route', path: 'about', component: AboutView },
        { path: 'users', component: UsersView },
        { path: 'user/:id', component: UserView },
      ],
    })
    @customElement({
      name: 'app-root',
      template: `
    <nav>
      <a data-testid="root-home" load="home">Home</a>
      <a data-testid="root-about" load="about">About</a>
      <a data-testid="root-users" load="users/members">Users</a>
    </nav>
    <au-viewport></au-viewport>`
    })
    class AppRoot { }

    const { au, host, container, getByTestId } = await start({
      appRoot: AppRoot,
      registrations: [HomeView, AboutView, UsersView, MembersView, AdminsView, MemberDetailsView, UserView],
    });
    const router = container.get(IRouter);
    const location = container.get<MockBrowserHistoryLocation>(ILocation);
    const queue = container.get(IPlatform).domQueue;
    await queue.yield();

    assert.strictEqual(await router.load('about'), true, 'navigate to about');
    await queue.yield();

    let anchor = getByTestId<HTMLAnchorElement>('about-home');
    anchor.click();
    await queue.yield();
    assert.match(location.path, /home$/);

    assert.strictEqual(await router.load('users/members'), true, 'navigate to users/members');
    await queue.yield();

    anchor = getByTestId<HTMLAnchorElement>('members-admins');
    anchor.click();
    await queue.yield();
    assert.match(location.path, /users\/admins$/);

    assert.strictEqual(await router.load('users/members'), true, 'reset to members after admins');
    await queue.yield();

    const membersCtx = MembersView.lastInstance!.ctx;
    anchor = getByTestId<HTMLAnchorElement>('members-about');
    assert.match(anchor.href, /about$/);
    assert.strictEqual(await router.load('about', { context: membersCtx }), true, 'load about from members');
    await queue.yield();
    assert.match(location.path, /about$/);

    assert.strictEqual(await router.load('users/members'), true, 'reset to members before parent about');
    await queue.yield();

    assert.strictEqual(await router.load('./admins', { context: membersCtx }), true, 'load ./admins from members');
    await queue.yield();
    assert.match(location.path, /users\/admins$/);

    assert.strictEqual(await router.load('users/members'), true, 'return to members after ./admins');
    await queue.yield();

    assert.strictEqual(await router.load('about-route', { context: membersCtx }), true, 'load via route id from members');
    await queue.yield();
    assert.match(location.path, /about$/);

    assert.strictEqual(await router.load('users/members'), true, 'reset to members after route id');
    await queue.yield();

    assert.strictEqual(await router.load('user/42', { context: membersCtx }), true, 'load parameterized root route from members');
    await queue.yield();
    assert.match(location.path, /user\/42$/);

    assert.strictEqual(await router.load('users/members'), true, 'reset to members after parameterized route');
    await queue.yield();

    assert.strictEqual(await router.load('users/members/details'), true, 'navigate to member details');
    await queue.yield();

    const membersCtxAgain = MembersView.lastInstance!.ctx;
    anchor = getByTestId<HTMLAnchorElement>('members-parent-about');
    assert.strictEqual(await router.load('../about', { context: membersCtxAgain }), true, 'load ../about from members');
    await queue.yield();
    assert.match(location.path, /about$/);

    assert.strictEqual(await router.load('users/members'), true, 'reset to members before root home');
    await queue.yield();

    const membersCtxFinal = MembersView.lastInstance!.ctx;
    anchor = getByTestId<HTMLAnchorElement>('members-root-home');
    assert.match(anchor.href ?? '', /\/home$/);
    assert.strictEqual(await router.load('/home', { context: membersCtxFinal }), true, 'load /home from members');
    await queue.yield();
    assert.match(location.path, /home$/);

    assert.strictEqual(await router.load('users/members/details'), true, 'return to member details');
    await queue.yield();

    // Issue #2256: after applying dot segments, the router still searches ancestor route contexts
    // for the first matching route, so `../admins` from `.../members/details` resolves to `/users/admins`.
    anchor = getByTestId<HTMLAnchorElement>('details-parent-admins');
    anchor.click();
    await queue.yield();
    assert.match(location.path, /users\/admins$/, 'details parent admins click');

    assert.strictEqual(await router.load('users/members/details'), true, 'restore member details for root about');
    await queue.yield();

    const detailsCtxFinal = MemberDetailsView.lastInstance!.ctx;
    assert.strictEqual(await router.load('../../about', { context: detailsCtxFinal }), true, 'load ../../about from details');
    await queue.yield();
    assert.match(location.path, /about$/, 'details root about');

    assert.strictEqual(await router.load('users/members/details'), true, 'restore member details for anchor click');
    await queue.yield();

    anchor = getByTestId<HTMLAnchorElement>('details-root-about');
    anchor.click();
    await queue.yield();
    assert.match(location.path, /about$/, 'details root about via anchor');

    await au.stop(true);
  });

  it('preserves multi-viewport instructions without altering navigation context', async function () {
    @customElement({ name: 'summary-view', template: 'summary' })
    class SummaryView { }

    @customElement({ name: 'details-view', template: 'details' })
    class DetailsView { }

    @route({
      routes: [
        { path: 'summary', component: SummaryView, viewport: 'main' },
        { path: 'details', component: DetailsView, viewport: 'aside' },
      ]
    })
    @customElement({
      name: 'dashboard-view',
      template: `
    <a data-testid="multi" load="summary@main+details@aside">Load Both</a>
    <au-viewport name="main"></au-viewport>
    <au-viewport name="aside"></au-viewport>`
    })
    class DashboardView { }

    @route({
      routes: [
        { path: '', redirectTo: 'dashboard' },
        { path: 'dashboard', component: DashboardView },
      ]
    })
    @customElement({ name: 'multi-root', template: `<au-viewport></au-viewport>` })
    class MultiRoot { }

    const { au, host, container, getByTestId } = await start({
      appRoot: MultiRoot,
      registrations: [DashboardView, SummaryView, DetailsView],
    });
    const queue = container.get(IPlatform).domQueue;
    await queue.yield();

    const anchor = getByTestId<HTMLAnchorElement>('multi');
    anchor.click();
    await queue.yield();
    const text = host.textContent ?? '';
    assert.match(text, /summary/);
    assert.match(text, /details/);

    await au.stop(true);
  });

  it('adds activeClass when configured', async function () {
    @customElement({ name: 'fo-o', template: '${instanceId} ${id}' })
    class Foo {
      private static instanceId: number = 0;
      private readonly instanceId = ++Foo.instanceId;
      private id: string;
      public loading(params: Params) {
        this.id = params.id;
      }
    }

    @route({
      transitionPlan: 'replace',
      routes: [
        { id: 'foo', path: 'foo/:id', component: Foo }
      ]
    })
    @customElement({
      name: 'ro-ot',
      template: `
    <a load="route:foo; params.bind:{id: 1}"></a>
    <a load="route:foo/2"></a>
    <au-viewport></au-viewport>`
    })
    class Root { }

    const activeClass = 'au-rl-active';
    const { au, host, container } = await start({ appRoot: Root, registrations: [Foo], activeClass });
    const queue = container.get(IPlatform).domQueue;
    await queue.yield();

    const anchors = host.querySelectorAll('a');
    const a1 = { href: 'foo/1', active: false };
    const a2 = { href: 'foo/2', active: false };
    assertAnchorsWithClass(anchors, [a1, a2], activeClass, 'round#1');

    anchors[1].click();
    await queue.yield();
    a2.active = true;
    assertAnchorsWithClass(anchors, [a1, a2], activeClass, 'round#2');
    assert.html.textContent(host, '1 2', 'round#2 - text');

    anchors[1].click();
    await queue.yield();
    assertAnchorsWithClass(anchors, [a1, a2], activeClass, 'round#3');
    assert.html.textContent(host, '1 2', 'round#3 - text');

    anchors[0].click();
    await queue.yield();
    a1.active = true;
    a2.active = false;
    assertAnchorsWithClass(anchors, [a1, a2], activeClass, 'round#4');
    assert.html.textContent(host, '2 1', 'round#4 - text');

    anchors[0].click();
    await queue.yield();
    assertAnchorsWithClass(anchors, [a1, a2], activeClass, 'round#5');
    assert.html.textContent(host, '2 1', 'round#5 - text');

    await au.stop(true);

    function assertAnchorsWithClass(anchors: HTMLAnchorElement[] | NodeListOf<HTMLAnchorElement>, expected: { href: string; active?: boolean }[], activeClass: string | null = null, message: string = ''): void {
      const len = anchors.length;
      assert.strictEqual(len, expected.length, `${message} length`);
      for (let i = 0; i < len; i++) {
        const anchor = anchors[i];
        const item = expected[i];
        assert.strictEqual(anchor.href.endsWith(item.href), true, `${message} - #${i} href - actual: ${anchor.href} - expected: ${item.href}`);
        assert.strictEqual(anchor.classList.contains(activeClass), !!item.active, `${message} - #${i} active`);
      }
    }
  });

  it('does not add activeClass when not configured', async function () {
    @customElement({ name: 'fo-o', template: '' })
    class Foo { }

    @route({
      routes: [
        { id: 'foo', path: 'foo/:id', component: Foo }
      ]
    })
    @customElement({
      name: 'ro-ot',
      template: `
    <a load="route:foo; params.bind:{id: 1}"></a>
    <a load="route:foo/2"></a>
    <au-viewport></au-viewport>`
    })
    class Root { }

    const { au, host, container } = await start({ appRoot: Root, registrations: [Foo] });
    const queue = container.get(IPlatform).domQueue;
    await queue.yield();

    const anchors = host.querySelectorAll('a');
    const a1 = { href: 'foo/1', active: false };
    const a2 = { href: 'foo/2', active: false };
    assertAnchorsWithoutClass(anchors, [a1, a2], 'round#1');

    anchors[1].click();
    await queue.yield();
    a2.active = true;
    assertAnchorsWithoutClass(anchors, [a1, a2], 'round#2');

    anchors[0].click();
    await queue.yield();
    a1.active = true;
    a2.active = false;
    assertAnchorsWithoutClass(anchors, [a1, a2], 'round#3');

    await au.stop(true);

    function assertAnchorsWithoutClass(anchors: HTMLAnchorElement[] | NodeListOf<HTMLAnchorElement>, expected: { href: string; active?: boolean }[], message: string = ''): void {
      const len = anchors.length;
      assert.strictEqual(len, expected.length, `${message} length`);
      for (let i = 0; i < len; i++) {
        const anchor = anchors[i];
        const item = expected[i];
        assert.strictEqual(anchor.href.endsWith(item.href), true, `${message} - #${i} href - actual: ${anchor.href} - expected: ${item.href}`);
      }
    }
  });

  it('un-configured parameters are added to the querystring', async function () {
    @customElement({ name: 'fo-o', template: '' })
    class Foo { }

    @route({
      routes: [
        { id: 'foo', path: 'foo/:id', component: Foo }
      ]
    })
    @customElement({
      name: 'ro-ot',
      template: `<a load="route:foo; params.bind:{id: 3, a: 2};"></a><au-viewport></au-viewport>`
    })
    class Root { }

    const { au, host, container } = await start({ appRoot: Root, registrations: [Foo] });
    const queue = container.get(IPlatform).domQueue;
    await queue.yield();

    const anchor = host.querySelector('a');
    assert.match(anchor.href, /foo\/3\?a=2/);
    await au.stop(true);
  });

  it('the most matched path is generated', async function () {
    @customElement({ name: 'fo-o', template: 'foo' })
    class Foo { }

    @route({
      routes: [
        { id: 'foo', path: ['foo/:id', 'foo/:id/bar/:a', 'bar/fizz'], component: Foo }
      ]
    })
    @customElement({
      name: 'ro-ot',
      template: `<a load="route:foo; params.bind:{id: 3, a: 2};"></a><a load="route:foo; params.bind:{id: 3, b: 2};"></a><a load="bar/fizz"></a><au-viewport></au-viewport>`
    })
    class Root { }

    const { au, host, container } = await start({ appRoot: Root, registrations: [Foo] });
    const queue = container.get(IPlatform).domQueue;
    await queue.yield();

    const anchors = Array.from(host.querySelectorAll('a'));
    const hrefs = anchors.map(a => a.href);
    assert.match(hrefs[0], /foo\/3\/bar\/2/);
    assert.match(hrefs[1], /foo\/3\?b=2/); // this one ensures the rejection of non-monotonically increment in the parameter consumption
    assert.match(hrefs[2], /bar\/fizz/);

    anchors[2].click();
    await queue.yield();
    assert.html.textContent(host, 'foo');

    await au.stop(true);
  });

  it('allow navigating to route defined in parent context using ../ prefix', async function () {
    @customElement({ name: 'pro-duct', template: `product \${id} <a load="../products"></a>` })
    class Product {
      id: unknown;
      public canLoad(params: Params, _next: RouteNode, _current: RouteNode): boolean {
        this.id = params.id;
        return true;
      }
    }

    @customElement({ name: 'pro-ducts', template: `<a load="../product/1"></a><a load="../product/2"></a> products` })
    class Products { }

    @route({
      routes: [
        { id: 'products', path: ['', 'products'], component: Products },
        { id: 'product', path: 'product/:id', component: Product },
      ]
    })
    @customElement({ name: 'ro-ot', template: '<au-viewport></au-viewport>' })
    class Root { }

    const { au, host, container } = await start({ appRoot: Root, registrations: [Products, Product] });
    const queue = container.get(IPlatform).domQueue;
    await queue.yield();

    assert.html.textContent(host, 'products');
    const anchors = Array.from(host.querySelectorAll('a'));
    const hrefs = anchors.map(a => a.href);
    assert.match(hrefs[0], /product\/1$/);
    assert.match(hrefs[1], /product\/2$/);

    anchors[0].click();
    await queue.yield();
    assert.html.textContent(host, 'product 1');
    // go back
    const back = host.querySelector<HTMLAnchorElement>('a');
    assert.match(back.href, /products$/);
    back.click();
    await queue.yield();
    assert.html.textContent(host, 'products');

    // 2nd round
    host.querySelector<HTMLAnchorElement>('a:nth-of-type(2)').click();
    await queue.yield();
    assert.html.textContent(host, 'product 2');
    // go back
    host.querySelector<HTMLAnchorElement>('a').click();
    await queue.yield();
    assert.html.textContent(host, 'products');

    await au.stop(true);
  });

  it('allow navigating to route defined in parent context using ../ prefix - with parameters', async function () {
    @customElement({ name: 'pro-duct', template: `product \${id} <a load="../products"></a>` })
    class Product {
      id: unknown;
      public canLoad(params: Params, _next: RouteNode, _current: RouteNode): boolean {
        this.id = params.id;
        return true;
      }
    }

    @customElement({ name: 'pro-ducts', template: `<a load="route:../product; params.bind:{id:'1'}"></a><a load="route:../product; params.bind:{id:'2'}"></a> products` })
    class Products { }

    @route({
      routes: [
        { id: 'products', path: ['', 'products'], component: Products },
        { id: 'product', path: 'product/:id', component: Product },
      ]
    })
    @customElement({ name: 'ro-ot', template: '<au-viewport></au-viewport>' })
    class Root { }

    const { au, host, container } = await start({ appRoot: Root, registrations: [Products, Product] });
    const queue = container.get(IPlatform).domQueue;
    await queue.yield();

    assert.html.textContent(host, 'products');
    const anchors = Array.from(host.querySelectorAll('a'));
    const hrefs = anchors.map(a => a.href);
    assert.match(hrefs[0], /product\/1$/);
    assert.match(hrefs[1], /product\/2$/);

    anchors[0].click();
    await queue.yield();
    assert.html.textContent(host, 'product 1');
    // go back
    const back = host.querySelector<HTMLAnchorElement>('a');
    assert.match(back.href, /products$/);
    back.click();
    await queue.yield();
    assert.html.textContent(host, 'products');

    // 2nd round
    host.querySelector<HTMLAnchorElement>('a:nth-of-type(2)').click();
    await queue.yield();
    assert.html.textContent(host, 'product 2');
    // go back
    host.querySelector<HTMLAnchorElement>('a').click();
    await queue.yield();
    assert.html.textContent(host, 'products');

    await au.stop(true);
  });

  it('allow navigating to route defined in parent context using explicit routing context', async function () {
    @customElement({ name: 'pro-duct', template: `product \${id} <a load="route:products; context.bind:rtCtx.parent"></a>` })
    class Product {
      id: unknown;
      private rtCtx: IRouteContext;
      public canLoad(params: Params, next: RouteNode, _current: RouteNode): boolean {
        this.id = params.id;
        this.rtCtx = next.context;
        return true;
      }
    }

    @customElement({ name: 'pro-ducts', template: `<a load="route:product/1; context.bind:rtCtx.parent"></a><a load="route:product; params.bind:{id: 2}; context.bind:rtCtx.parent"></a> products` })
    class Products {
      private rtCtx: IRouteContext;
      public canLoad(params: Params, next: RouteNode, _current: RouteNode): boolean {
        this.rtCtx = next.context;
        return true;
      }
    }

    @route({
      routes: [
        { id: 'products', path: ['', 'products'], component: Products },
        { id: 'product', path: 'product/:id', component: Product },
      ]
    })
    @customElement({ name: 'ro-ot', template: '<au-viewport></au-viewport>' })
    class Root { }

    const { au, host, container } = await start({ appRoot: Root, registrations: [Products, Product] });
    const queue = container.get(IPlatform).domQueue;
    await queue.yield();

    assert.html.textContent(host, 'products');
    const anchors = Array.from(host.querySelectorAll('a'));
    const hrefs = anchors.map(a => a.href);
    assert.match(hrefs[0], /product\/1$/);
    assert.match(hrefs[1], /product\/2$/);

    anchors[0].click();
    await queue.yield();
    assert.html.textContent(host, 'product 1');
    // go back
    const back = host.querySelector<HTMLAnchorElement>('a');
    assert.match(back.href, /products$/);
    back.click();
    await queue.yield();
    assert.html.textContent(host, 'products');

    // 2nd round
    host.querySelector<HTMLAnchorElement>('a:nth-of-type(2)').click();
    await queue.yield();
    assert.html.textContent(host, 'product 2');
    // go back
    host.querySelector<HTMLAnchorElement>('a').click();
    await queue.yield();
    assert.html.textContent(host, 'products');

    await au.stop(true);
  });

  it('allow navigating to route defined in grand-parent context using ../../ prefix', async function () {
    @customElement({ name: 'l-21', template: `l21 <a load="../../l12"></a>` })
    class L21 { }
    @customElement({ name: 'l-22', template: `l22 <a load="../../l11"></a>` })
    class L22 { }

    @route({
      routes: [
        { id: 'l21', path: ['', 'l21'], component: L21 },
      ]
    })
    @customElement({ name: 'l-11', template: `l11 <au-viewport></au-viewport>` })
    class L11 { }

    @route({
      routes: [
        { id: 'l22', path: ['', 'l22'], component: L22 },
      ]
    })
    @customElement({ name: 'l-12', template: `l12 <au-viewport></au-viewport>` })
    class L12 { }

    @route({
      routes: [
        { id: 'l11', path: ['', 'l11'], component: L11 },
        { id: 'l12', path: 'l12', component: L12 },
      ]
    })
    @customElement({ name: 'ro-ot', template: '<au-viewport></au-viewport>' })
    class Root { }

    const { au, host, container } = await start({ appRoot: Root, registrations: [L11, L12, L21, L22] });
    const queue = container.get(IPlatform).domQueue;
    await queue.yield();
    assert.html.textContent(host, 'l11 l21');

    host.querySelector('a').click();
    await queue.yield();
    assert.html.textContent(host, 'l12 l22');

    host.querySelector('a').click();
    await queue.yield();
    assert.html.textContent(host, 'l11 l21');

    await au.stop(true);
  });

  it('allow navigating to route defined in grand-parent context using ../../ prefix - with parameters', async function () {
    @customElement({ name: 'l-21', template: `l21 <a load="route:../../l12; params.bind:{id: '42'}"></a>` })
    class L21 { }
    @customElement({ name: 'l-22', template: `l22 <a load="route:../../l11; params.bind:{id: '42'}"></a>` })
    class L22 { }

    @route({
      routes: [
        { id: 'l21', path: ['', 'l21'], component: L21 },
      ]
    })
    @customElement({ name: 'l-11', template: `l11 <au-viewport></au-viewport>` })
    class L11 { }

    @route({
      routes: [
        { id: 'l22', path: ['', 'l22'], component: L22 },
      ]
    })
    @customElement({ name: 'l-12', template: `l12 <au-viewport></au-viewport>` })
    class L12 { }

    @route({
      routes: [
        { path: '', redirectTo: 'l11/42' },
        { id: 'l11', path: 'l11/:id', component: L11 },
        { id: 'l12', path: 'l12/:id', component: L12 },
      ]
    })
    @customElement({ name: 'ro-ot', template: '<au-viewport></au-viewport>' })
    class Root { }

    const { au, host, container } = await start({ appRoot: Root, registrations: [L11, L12, L21, L22] });
    const queue = container.get(IPlatform).domQueue;
    await queue.yield();
    assert.html.textContent(host, 'l11 l21');

    host.querySelector('a').click();
    await queue.yield();
    assert.html.textContent(host, 'l12 l22');

    host.querySelector('a').click();
    await queue.yield();
    assert.html.textContent(host, 'l11 l21');

    await au.stop(true);
  });

  it('allow navigating to route defined in grand-parent context using explicit routing context', async function () {
    @customElement({ name: 'l-21', template: `l21 <a load="route:l12; context.bind:rtCtx.parent.parent"></a>` })
    class L21 {
      private rtCtx: IRouteContext;
      public canLoad(params: Params, next: RouteNode, _current: RouteNode): boolean {
        this.rtCtx = next.context;
        return true;
      }
    }
    @customElement({ name: 'l-22', template: `l22 <a load="route:l11; context.bind:rtCtx.parent.parent"></a>` })
    class L22 {
      private rtCtx: IRouteContext;
      public canLoad(params: Params, next: RouteNode, _current: RouteNode): boolean {
        this.rtCtx = next.context;
        return true;
      }
    }

    @route({
      routes: [
        { id: 'l21', path: ['', 'l21'], component: L21 },
      ]
    })
    @customElement({ name: 'l-11', template: `l11 <au-viewport></au-viewport>` })
    class L11 { }

    @route({
      routes: [
        { id: 'l22', path: ['', 'l22'], component: L22 },
      ]
    })
    @customElement({ name: 'l-12', template: `l12 <au-viewport></au-viewport>` })
    class L12 { }

    @route({
      routes: [
        { id: 'l11', path: ['', 'l11'], component: L11 },
        { id: 'l12', path: 'l12', component: L12 },
      ]
    })
    @customElement({ name: 'ro-ot', template: '<au-viewport></au-viewport>' })
    class Root { }

    const { au, host, container } = await start({ appRoot: Root, registrations: [L11, L12, L21, L22] });
    const queue = container.get(IPlatform).domQueue;
    await queue.yield();
    assert.html.textContent(host, 'l11 l21');

    host.querySelector('a').click();
    await queue.yield();
    assert.html.textContent(host, 'l12 l22');

    host.querySelector('a').click();
    await queue.yield();
    assert.html.textContent(host, 'l11 l21');

    await au.stop(true);
  });

  it('allow explicitly binding the routing context to null to perform navigation from root', async function () {
    @customElement({ name: 'l-21', template: `l21 <a load="route:l22; context.bind:rtCtx.parent"></a>` })
    class L21 {
      private rtCtx: IRouteContext;
      public canLoad(params: Params, next: RouteNode, _current: RouteNode): boolean {
        this.rtCtx = next.context;
        return true;
      }
    }
    @customElement({ name: 'l-22', template: `l22 <a load="route:l12; context.bind:null"></a>` })
    class L22 {
      private rtCtx: IRouteContext;
      public canLoad(params: Params, next: RouteNode, _current: RouteNode): boolean {
        this.rtCtx = next.context;
        return true;
      }
    }
    @customElement({ name: 'l-23', template: `l23 <a load="route:l24; context.bind:rtCtx.parent"></a>` })
    class L23 {
      private rtCtx: IRouteContext;
      public canLoad(params: Params, next: RouteNode, _current: RouteNode): boolean {
        this.rtCtx = next.context;
        return true;
      }
    }
    @customElement({ name: 'l-24', template: `l24 <a load="route:l11; context.bind:null"></a>` })
    class L24 {
      private rtCtx: IRouteContext;
      public canLoad(params: Params, next: RouteNode, _current: RouteNode): boolean {
        this.rtCtx = next.context;
        return true;
      }
    }

    @route({
      routes: [
        { id: 'l21', path: ['', 'l21'], component: L21 },
        { id: 'l22', path: 'l22', component: L22 },
      ]
    })
    @customElement({ name: 'l-11', template: `l11 <au-viewport></au-viewport>` })
    class L11 { }

    @route({
      routes: [
        { id: 'l23', path: ['', 'l23'], component: L23 },
        { id: 'l24', path: 'l24', component: L24 },
      ]
    })
    @customElement({ name: 'l-12', template: `l12 <au-viewport></au-viewport>` })
    class L12 { }

    @route({
      routes: [
        { id: 'l11', path: ['', 'l11'], component: L11 },
        { id: 'l12', path: 'l12', component: L12 },
      ]
    })
    @customElement({ name: 'ro-ot', template: '<au-viewport></au-viewport>' })
    class Root { }

    const { au, host, container } = await start({ appRoot: Root, registrations: [L11, L12, L21, L22, L23, L24] });
    const queue = container.get(IPlatform).domQueue;
    await queue.yield();
    assert.html.textContent(host, 'l11 l21', 'init');

    // l21 -> l22
    host.querySelector('a').click();
    await queue.yield();
    assert.html.textContent(host, 'l11 l22', '#2 l21 -> l22');

    // l22 -> l12
    host.querySelector('a').click();
    await queue.yield();
    assert.html.textContent(host, 'l12 l23', '#3 l22 -> l12');

    // l23 -> l24
    host.querySelector('a').click();
    await queue.yield();
    assert.html.textContent(host, 'l12 l24', '#4 l23 -> l24');

    // l24 -> l11
    host.querySelector('a').click();
    await queue.yield();
    assert.html.textContent(host, 'l11 l21', '#5 l24 -> l11');

    await au.stop(true);
  });

  it('adds hash correctly to the href when useUrlFragmentHash is set', async function () {
    @customElement({ name: 'ce-one', template: `ce1` })
    class CeOne { }

    @customElement({ name: 'ce-two', template: `ce2` })
    class CeTwo { }

    @customElement({
      name: 'ro-ot',
      template: `
      <a load="#ce-one"></a>
      <a load="#ce-two"></a>
      <a load="ce-two"></a>
      <au-viewport></au-viewport>
      `
    })
    @route({
      routes: [
        {
          path: 'ce-one',
          component: CeOne,
        },
        {
          path: 'ce-two',
          component: CeTwo,
        },
      ]
    })
    class Root { }

    const { au, host, container } = await start({ appRoot: Root, useHash: true, registrations: [CeOne, CeTwo] });
    const queue = container.get(IPlatform).domQueue;
    await queue.yield();

    const anchors = Array.from(host.querySelectorAll('a'));
    assert.deepStrictEqual(anchors.map(a => a.getAttribute('href')), ['/#/ce-one', '/#/ce-two', '/#/ce-two']);

    anchors[1].click();
    await queue.yield();
    assert.html.textContent(host, 'ce2');

    anchors[0].click();
    await queue.yield();
    assert.html.textContent(host, 'ce1');

    anchors[2].click();
    await queue.yield();
    assert.html.textContent(host, 'ce2');

    await au.stop(true);
  });

  class HrefGenerationForChildComponentTestData {
    public constructor(
      public readonly name: string,
      public readonly templates: [root: string, c1: string, c2: string],
      public readonly expectedHrefs: [expectations1: { href: string }[], expectations2: { href: string }[]],
    ) { }
  }
  function* getHrefGenerationForChildComponentTestData() {
    yield new HrefGenerationForChildComponentTestData(
      'using path',
      [
        `
    <a load="c1">C1</a>
    <a load="c2">C2</a>
    <au-viewport></au-viewport>`,
        `c1
    <a load="gc11">gc11</a>
    <a load="gc12">gc12</a>
    <a load="route: c2; context.bind: parentCtx">c2</a>
    <au-viewport></au-viewport>`,
        `c2
    <a load="gc21">gc21</a>
    <a load="gc22">gc22</a>
    <a load="route: c1; context.bind: parentCtx">c1</a>
    <au-viewport></au-viewport>`
      ],
      [
        [
          { href: 'c1' },
          { href: 'c2' },
          { href: 'c1/gc11' },
          { href: 'c1/gc12' },
          { href: 'c2' },
        ],
        [
          { href: 'c1' },
          { href: 'c2' },
          { href: 'c2/gc21' },
          { href: 'c2/gc22' },
          { href: 'c1' },
        ]
      ]
    );
    yield new HrefGenerationForChildComponentTestData(
      'using route-id',
      [
        `
    <a load="r1">C1</a>
    <a load="r2">C2</a>
    <au-viewport></au-viewport>`,
        `c1
    <a load="r1">gc11</a>
    <a load="r2">gc12</a>
    <a load="route: r2; context.bind: parentCtx">c2</a>
    <au-viewport></au-viewport>`,
        `c2
    <a load="r1">gc21</a>
    <a load="r2">gc22</a>
    <a load="route: r1; context.bind: parentCtx">c1</a>
    <au-viewport></au-viewport>`
      ],
      [
        [
          { href: 'r1' },
          { href: 'r2' },
          { href: 'c1/r1' },
          { href: 'c1/r2' },
          { href: 'r2' },
        ],
        [
          { href: 'r1' },
          { href: 'r2' },
          { href: 'c2/r1' },
          { href: 'c2/r2' },
          { href: 'r1' },
        ]
      ]
    );
  }
  for (const {
    name,
    templates: [rt, t1, t2],
    expectedHrefs: [expectations1, expectations2]
  } of getHrefGenerationForChildComponentTestData()) {
    it(`href attribute value is correctly generated for child components - ${name}`, async function () {

      @customElement({ name: 'gc-11', template: 'gc11' })
      class GrandChildOneOne { }

      @customElement({ name: 'gc-12', template: 'gc12' })
      class GrandChildOneTwo { }

      @route({
        routes: [
          { path: '', redirectTo: 'gc11' },
          { id: 'r1', path: 'gc11', component: GrandChildOneOne },
          { id: 'r2', path: 'gc12', component: GrandChildOneTwo },
        ],
      })
      @customElement({ name: 'c-one', template: t1 })
      class ChildOne {
        private readonly parentCtx: IRouteContext;
        public constructor() {
          this.parentCtx = resolve(IRouteContext).parent;
        }
      }

      @customElement({ name: 'gc-21', template: 'gc21' })
      class GrandChildTwoOne { }

      @customElement({ name: 'gc-22', template: 'gc22' })
      class GrandChildTwoTwo { }

      @route({
        routes: [
          { path: '', redirectTo: 'gc21' },
          { id: 'r1', path: 'gc21', component: GrandChildTwoOne },
          { id: 'r2', path: 'gc22', component: GrandChildTwoTwo },
        ],
      })
      @customElement({ name: 'c-two', template: t2 })
      class ChildTwo {
        private readonly parentCtx: IRouteContext;
        public constructor() {
          this.parentCtx = resolve(IRouteContext).parent;
        }
      }

      @route({
        routes: [
          {
            path: '',
            redirectTo: 'c1',
          },
          {
            id: 'r1',
            path: 'c1',
            component: ChildOne,
          },
          {
            id: 'r2',
            path: 'c2',
            component: ChildTwo,
          },
        ],
      })
      @customElement({ name: 'my-app', template: rt })
      class Root { }

      const { au, host, container } = await start({ appRoot: Root });
      const location = container.get<MockBrowserHistoryLocation>(ILocation);
      const queue = container.get(IPlatform).domQueue;
      await queue.yield();

      let anchors = host.querySelectorAll('a');
      assertAnchors(anchors, expectations1, 'round#1 - anchors', false);
      assert.match(location.path, /c1\/gc11$/, 'round#1 - location.path');

      anchors[3].click();
      await queue.yield();
      assertAnchors(anchors, expectations1, 'round#2 - anchors', false);
      assert.match(location.path, /c1\/gc12$/, 'round#2 - location.path');

      anchors[2].click();
      await queue.yield();
      assertAnchors(anchors, expectations1, 'round#3 - anchors', false);
      assert.match(location.path, /c1\/gc11$/, 'round#3 - location.path');

      anchors[1].click();
      await queue.yield();
      anchors = host.querySelectorAll('a');
      assertAnchors(anchors, expectations2, 'round#4', false);
      assert.match(location.path, /c2\/gc21$/, 'round#4 - location.path');

      anchors[3].click();
      await queue.yield();
      assertAnchors(anchors, expectations2, 'round#5 - anchors', false);
      assert.match(location.path, /c2\/gc22$/, 'round#5 - location.path');

      anchors[2].click();
      await queue.yield();
      assertAnchors(anchors, expectations2, 'round#6 - anchors', false);
      assert.match(location.path, /c2\/gc21$/, 'round#6 - location.path');

      anchors[4].click();
      await queue.yield();
      anchors = host.querySelectorAll('a');
      assertAnchors(anchors, expectations1, 'round#7', false);
      assert.match(location.path, /c1\/gc11$/, 'round#7 - location.path');

      await au.stop(true);
    });
  }

  class HrefGenerationForChildComponentSiblingTestData {
    public constructor(
      public readonly name: string,
      public readonly templates: [root: string, c1: string, c2: string],
      public readonly expectedHrefs: [expectations1: { href: string }[], expectations2: { href: string }[]],
    ) { }
  }
  function* getHrefGenerationForChildComponentSiblingTestData() {
    yield new HrefGenerationForChildComponentSiblingTestData(
      'using path',
      [
        `
    <a load="c1">C1</a>
    <a load="c2">C2</a>
    <au-viewport></au-viewport>`,
        `c1
    <a load="gc11+gc12">gc11+gc12</a>
    <a load="gc12+gc13">gc12+gc13</a>
    <a load="gc13+gc11">gc13+gc11</a>
    <au-viewport default.bind="null"></au-viewport><au-viewport default.bind="null"></au-viewport>`,
        `c2
    <a load="gc21+gc22">gc21+gc22</a>
    <a load="gc22+gc23">gc22+gc23</a>
    <a load="gc23+gc21">gc23+gc21</a>
    <au-viewport default.bind="null"></au-viewport><au-viewport default.bind="null"></au-viewport>`
      ],
      [
        [
          { href: 'c1' },
          { href: 'c2' },
          { href: 'c1/gc11+gc12' },
          { href: 'c1/gc12+gc13' },
          { href: 'c1/gc13+gc11' },
        ],
        [
          { href: 'c1' },
          { href: 'c2' },
          { href: 'c2/gc21+gc22' },
          { href: 'c2/gc22+gc23' },
          { href: 'c2/gc23+gc21' },
        ]
      ]
    );
    yield new HrefGenerationForChildComponentSiblingTestData(
      'using route-id',
      [
        `
    <a load="r1">C1</a>
    <a load="r2">C2</a>
    <au-viewport></au-viewport>`,
        `c1
    <a load="r1+r2">gc11+gc12</a>
    <a load="r2+r3">gc12+gc13</a>
    <a load="r3+r1">gc13+gc11</a>
    <au-viewport default.bind="null"></au-viewport><au-viewport default.bind="null"></au-viewport>`,
        `c2
    <a load="r1+r2">gc21+gc22</a>
    <a load="r2+r3">gc22+gc23</a>
    <a load="r3+r1">gc23+gc21</a>
    <au-viewport default.bind="null"></au-viewport><au-viewport default.bind="null"></au-viewport>`
      ],
      [
        [
          { href: 'r1' },
          { href: 'r2' },
          { href: 'c1/r1+r2' },
          { href: 'c1/r2+r3' },
          { href: 'c1/r3+r1' },
        ],
        [
          { href: 'r1' },
          { href: 'r2' },
          { href: 'c2/r1+r2' },
          { href: 'c2/r2+r3' },
          { href: 'c2/r3+r1' },
        ]
      ]
    );
  }
  for (const {
    name,
    templates: [rt, t1, t2],
    expectedHrefs: [expectations1, expectations2]
  } of getHrefGenerationForChildComponentSiblingTestData()) {
    it(`href attribute value is correctly generated for child components - sibling instructions - ${name}`, async function () {

      @customElement({ name: 'gc-11', template: 'gc11' })
      class GrandChildOneOne { }

      @customElement({ name: 'gc-12', template: 'gc12' })
      class GrandChildOneTwo { }

      @customElement({ name: 'gc-13', template: 'gc13' })
      class GrandChildOneThree { }

      @route({
        routes: [
          { id: 'r1', path: 'gc11', component: GrandChildOneOne },
          { id: 'r2', path: 'gc12', component: GrandChildOneTwo },
          { id: 'r3', path: 'gc13', component: GrandChildOneThree },
        ],
      })
      @customElement({ name: 'c-one', template: t1 })
      class ChildOne {
        private readonly parentCtx: IRouteContext;
        public constructor() {
          this.parentCtx = resolve(IRouteContext).parent;
        }
      }

      @customElement({ name: 'gc-21', template: 'gc21' })
      class GrandChildTwoOne { }

      @customElement({ name: 'gc-22', template: 'gc22' })
      class GrandChildTwoTwo { }

      @customElement({ name: 'gc-23', template: 'gc23' })
      class GrandChildTwoThree { }

      @route({
        routes: [
          { id: 'r1', path: 'gc21', component: GrandChildTwoOne },
          { id: 'r2', path: 'gc22', component: GrandChildTwoTwo },
          { id: 'r3', path: 'gc23', component: GrandChildTwoThree },
        ],
      })
      @customElement({ name: 'c-two', template: t2 })
      class ChildTwo {
        private readonly parentCtx: IRouteContext;
        public constructor() {
          this.parentCtx = resolve(IRouteContext).parent;
        }
      }

      @route({
        routes: [
          {
            path: '',
            redirectTo: 'c1',
          },
          {
            id: 'r1',
            path: 'c1',
            component: ChildOne,
          },
          {
            id: 'r2',
            path: 'c2',
            component: ChildTwo,
          },
        ],
      })
      @customElement({ name: 'my-app', template: rt })
      class Root { }

      const { au, host, container } = await start({ appRoot: Root });
      const location = container.get<MockBrowserHistoryLocation>(ILocation);
      const queue = container.get(IPlatform).domQueue;
      await queue.yield();

      let anchors = host.querySelectorAll('a');
      assertAnchors(anchors, expectations1, 'round#1 - anchors', false);
      assert.match(location.path, /c1$/, 'round#1 - location.path');

      anchors[2].click();
      await queue.yield();
      assert.match(location.path, /c1\/gc11\+gc12$/, 'round#2 - location.path');

      anchors[3].click();
      await queue.yield();
      assert.match(location.path, /c1\/gc12\+gc13$/, 'round#3 - location.path');

      anchors[4].click();
      await queue.yield();
      assert.match(location.path, /c1\/gc13\+gc11$/, 'round#4 - location.path');

      anchors[1].click();
      await queue.yield();
      anchors = host.querySelectorAll('a');
      assertAnchors(anchors, expectations2, 'round#5 - anchors', false);
      assert.match(location.path, /c2$/, 'round#5 - location.path');

      anchors[2].click();
      await queue.yield();
      assert.match(location.path, /c2\/gc21\+gc22$/, 'round#6 - location.path');

      anchors[3].click();
      await queue.yield();
      assert.match(location.path, /c2\/gc22\+gc23$/, 'round#7 - location.path');

      anchors[4].click();
      await queue.yield();
      assert.match(location.path, /c2\/gc23\+gc21$/, 'round#8 - location.path');

      anchors[0].click();
      await queue.yield();
      anchors = host.querySelectorAll('a');
      assertAnchors(anchors, expectations1, 'round#9 - anchors', false);
      assert.match(location.path, /c1$/, 'round#9 - location.path');

      await au.stop(true);
    });
  }

  it('supports routing instruction with parenthesized parameters', async function () {
    @route('c1/:id1/:id2?')
    @customElement({ name: 'c-1', template: 'c1 ${id1} ${id2}' })
    class C1 implements IRouteViewModel {
      private id1: string;
      private id2: string;
      public loading(params: Params, _next: RouteNode, _current: RouteNode): void | Promise<void> {
        this.id1 = params.id1;
        this.id2 = params.id2;
      }
    }

    @route({ routes: [{ id: 'c1', component: C1 }] })
    @customElement({ name: 'ro-ot', template: '<a load="c1(id1=1)"></a> <a load="c1(id1=2,id2=3)"></a> <au-viewport></au-viewport>' })
    class Root { }

    const { au, container, host } = await start({ appRoot: Root });
    const queue = container.get(IPlatform).domQueue;

    assert.html.textContent(host, '', 'init');

    host.querySelector('a').click();
    await queue.yield();
    assert.html.textContent(host, 'c1 1', 'round#1');

    host.querySelector<HTMLAnchorElement>('a:nth-of-type(2)').click();
    await queue.yield();
    assert.html.textContent(host, 'c1 2 3', 'round#2');

    await au.stop(true);
  });

  it('allow navigating to route defined in parent context using ../ prefix with replace transitionPlan and child viewport', async function () {
    @customElement({ name: 'product-details', template: `product \${id} <a load="../../products"></a>` })
    class Product {
      id: unknown;
      public canLoad(params: Params, _next: RouteNode, _current: RouteNode): boolean {
        this.id = params.id;
        return true;
      }
    }
    @customElement({ name: 'product-init', template: `product init <a load="../product/1"></a><a load="../product/2"></a>` })
    class ProductInit { }

    @route({
      routes: [
        { path: '', component: ProductInit },
        { path: 'product/:id', component: Product },
      ]
    })
    @customElement({ name: 'pro-ducts', template: `<au-viewport name="products"></au-viewport>` })
    class Products { }

    @route({
      routes: [
        { id: 'products', path: ['', 'products'], component: Products },
      ],
      transitionPlan: 'replace',
    })
    @customElement({ name: 'ro-ot', template: '<au-viewport name="root"></au-viewport>' })
    class Root { }

    const { au, host, container } = await start({ appRoot: Root, registrations: [Products, Product] });
    const queue = container.get(IPlatform).domQueue;
    await queue.yield();

    assert.html.textContent(host, 'product init');
    const anchors = Array.from(host.querySelectorAll('a'));
    const hrefs = anchors.map(a => a.href);
    assert.match(hrefs[0], /product\/1$/);
    assert.match(hrefs[1], /product\/2$/);

    anchors[0].click();
    await queue.yield();
    assert.html.textContent(host, 'product 1', 'round#1');
    // go back
    const back = host.querySelector<HTMLAnchorElement>('a');
    assert.match(back.href, /products$/, 'round#1 - back - href');
    back.click();
    await queue.yield();
    assert.html.textContent(host, 'product init', 'round#1 - back - text');

    // 2nd round
    host.querySelector<HTMLAnchorElement>('a:nth-of-type(2)').click();
    await queue.yield();
    assert.html.textContent(host, 'product 2', 'round#2');
    // go back
    host.querySelector<HTMLAnchorElement>('a').click();
    await queue.yield();
    assert.html.textContent(host, 'product init', 'round#2 - back - text');

    await au.stop(true);
  });

  for (const value of [null, undefined]) {
    it(`${value} value for a query-string param is ignored`, async function () {
      @route('product')
      @customElement({ name: 'pro-duct', template: `product` })
      class Product {
        public query: Readonly<URLSearchParams>;
        public canLoad(_params: Params, _next: RouteNode, _current: RouteNode): boolean {
          this.query = _next.queryParams;
          return true;
        }
      }

      @route({
        routes: [
          Product,
        ]
      })
      @customElement({ name: 'ro-ot', template: '<a load="route:product; params.bind: {id: value}"></a><au-viewport></au-viewport>' })
      class Root {
        private readonly value = value;
      }

      const { au, host, container } = await start({ appRoot: Root, registrations: [Product] });
      const queue = container.get(IPlatform).domQueue;
      await queue.yield();

      host.querySelector('a').click();
      await queue.yield();

      const product = CustomElement.for<Product>(host.querySelector('pro-duct')).viewModel;
      const query = product.query;
      assert.strictEqual(query.get('id'), null);
      assert.deepStrictEqual(Array.from(query.keys()), []);

      await au.stop(true);
    });
  }

  it('respects constrained routes', async function () {
    @route('nf')
    @customElement({ name: 'not-found', template: `nf` })
    class NotFound { }

    @route({ id: 'product', path: 'product/:id{{^\\d+$}}' })
    @customElement({ name: 'pro-duct', template: `product \${id}` })
    class Product {
      public id: unknown;
      public canLoad(params: Params, _next: RouteNode, _current: RouteNode): boolean {
        this.id = params.id;
        return true;
      }
    }

    @route({ routes: [Product, NotFound], fallback: 'nf' })
    @customElement({
      name: 'ro-ot',
      template: `
        <a load="route:product; params.bind:{id: 42}"></a>
        <a load="route:product; params.bind:{id: foo}"></a>
        <a load="product/bar"></a>
        <au-viewport></au-viewport>
      `
    })
    class Root { }

    const { au, host, container } = await start({ appRoot: Root });

    const queue = container.get(IPlatform).domQueue;
    await queue.yield();

    const anchors = Array.from(host.querySelectorAll('a'));

    anchors[0].click();
    await queue.yield();
    assert.html.textContent(host, 'product 42');

    anchors[1].click();
    await queue.yield();
    assert.html.textContent(host, 'nf');

    anchors[0].click();
    await queue.yield();
    assert.html.textContent(host, 'product 42');

    anchors[2].click();
    await queue.yield();
    assert.html.textContent(host, 'nf');

    await au.stop(true);
  });

  {
    class TestData {
      public readonly encodedRouteParam: string;
      public constructor(
        public readonly name: string,
        public readonly routeParam: string,
      ) {
        this.encodedRouteParam = encodeURIComponent(routeParam);
      }
    }
    const testData = [
      new TestData('with /', 'foo/bar'),
      new TestData('with %', 'foo%bar'),
      new TestData('with ?', 'foo?bar'),
      new TestData('with #', 'foo#bar'),
      new TestData('with &', 'foo&bar'),
      new TestData('with emoji', 'foo😀bar'),
    ] as const;
    const numTestData = testData.length;
    for (const useHash of [true, false]) {
      for (let i = 0; i < numTestData; ++i) {
        const { name, routeParam, encodedRouteParam } = testData[i];
        it(`decodes route parameters correctly - ${name} - with hash: ${useHash}`, async function () {
          @route('p1/*rest')
          @customElement({ name: 'p-1', template: `p1 \${rest}` })
          class P1 {
            public rest: string;
            public loading(params: Params, _next: RouteNode, _current: RouteNode): void {
              this.rest = params.rest;
            }
          }

          @route({ routes: [P1] })
          @customElement({ name: 'ro-ot', template: '<a load.bind="route"></a><au-viewport></au-viewport>' })
          class Root {
            public route: string = `p1/${encodedRouteParam}`;
          }

          const { au, host, container, rootVm } = await start({ appRoot: Root, registrations: [P1], useHash });
          const queue = container.get(IPlatform).domQueue;

          const anchor = host.querySelector('a');

          anchor.click();
          await queue.yield();
          assert.html.textContent(host, `p1 ${routeParam}`, 'round#1');

          // change route
          const { routeParam: nextRouteParam, encodedRouteParam: nextEncodedRouteParam } = testData[(i + 1) % numTestData];
          const nextRoute = rootVm.route = `p1/${nextEncodedRouteParam}`;
          await queue.yield();
          assert.strictEqual(anchor.getAttribute('href').endsWith(nextRoute), true, 'round#2 - href');
          anchor.click();
          await queue.yield();
          assert.html.textContent(host, `p1 ${nextRouteParam}`, 'round#2');

          await au.stop(true);
        });
      }
    }
  }
});
