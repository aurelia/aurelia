---
description: Learn how to test routed components, navigation flows, and router events in Aurelia applications.
---

# Testing router components and navigation

Most router behavior is best verified with integration-style tests, because routing touches view lifecycles, `<au-viewport>`, and (optionally) browser history.

This page focuses on router-specific patterns. For the general testing harness, see the docs under `docs/user-docs/developer-guides/testing/`.

## 1. Minimal setup: `createFixture` + `RouterConfiguration`

In tests you often want to avoid mutating `history`. Configure the router with `historyStrategy: 'none'` so navigations still run but do not push/replace history entries.

```typescript
import { customElement } from '@aurelia/runtime-html';
import { createFixture, assert } from '@aurelia/testing';
import { RouterConfiguration, ICurrentRoute, IRouter, IRouteViewModel, Params, route } from '@aurelia/router';

@customElement({ name: 'home-page', template: 'Home' })
class HomePage {}

@customElement({ name: 'user-page', template: 'User ${id}' })
class UserPage implements IRouteViewModel {
  id = '';

  canLoad(params: Params) {
    this.id = params.id ?? '';
    return true;
  }
}

@route({
  routes: [
    { path: ['', 'home'], component: HomePage },
    { path: 'users/:id', component: UserPage },
  ],
})
class App {}

describe('router', function () {
  it('navigates and updates ICurrentRoute', async function () {
    const { appHost, container, startPromise, stop } = createFixture(
      '<au-viewport></au-viewport>',
      App,
      [RouterConfiguration.customize({ historyStrategy: 'none' })],
    );
    await startPromise;

    const router = container.get(IRouter);
    const currentRoute = container.get(ICurrentRoute);

    // Initial navigation loads the default route (empty path).
    assert.html.textContent(appHost, 'Home');

    await router.load('users/42');
    assert.html.textContent(appHost, 'User 42');

    // `currentRoute.path` is an instruction path (no leading '/').
    assert.strictEqual(currentRoute.path, 'users/42');

    await stop(true);
  });
});
```

## 2. Testing guard outcomes (`canLoad` / `canUnload`)

Use the same fixture pattern, then navigate and assert the rendered result.

`canLoad` can:
- return `false` to cancel navigation
- return a navigation instruction (for example `'login'` or `{ component: 'login' }`) to redirect

```typescript
import { customElement } from '@aurelia/runtime-html';
import { createFixture, assert } from '@aurelia/testing';
import { RouterConfiguration, IRouter, IRouteViewModel, route } from '@aurelia/router';

@customElement({ name: 'login-page', template: 'Login' })
class LoginPage {}

@customElement({ name: 'admin-page', template: 'Admin' })
class AdminPage implements IRouteViewModel {
  canLoad() {
    return 'login';
  }
}

@route({
  routes: [
    { path: 'login', component: LoginPage },
    { path: 'admin', component: AdminPage },
  ],
})
class App {}

describe('guards', function () {
  it('redirects from canLoad', async function () {
    const { appHost, container, startPromise, stop } = createFixture(
      '<au-viewport></au-viewport>',
      App,
      [RouterConfiguration.customize({ historyStrategy: 'none' })],
    );
    await startPromise;

    const router = container.get(IRouter);
    await router.load('admin');
    assert.html.textContent(appHost, 'Login');

    await stop(true);
  });
});
```

## 3. Testing router events (`IRouterEvents`)

Subscribe to `IRouterEvents` and record what happens. When asserting URLs from instructions, call `toUrl(isFinal, parser, isRooted)`.

```typescript
import { createFixture, assert } from '@aurelia/testing';
import { RouterConfiguration, IRouter, IRouterEvents, pathUrlParser, route } from '@aurelia/router';
import { customElement } from '@aurelia/runtime-html';

@customElement({ name: 'home-page', template: 'Home' })
class HomePage {}

@customElement({ name: 'about-page', template: 'About' })
class AboutPage {}

@route({
  routes: [
    { path: ['', 'home'], component: HomePage },
    { path: 'about', component: AboutPage },
  ],
})
class App {}

describe('router events', function () {
  it('emits navigation-start and navigation-end', async function () {
    const { container, startPromise, stop } = createFixture(
      '<au-viewport></au-viewport>',
      App,
      [RouterConfiguration.customize({ historyStrategy: 'none' })],
    );
    await startPromise;

    const router = container.get(IRouter);
    const events = container.get(IRouterEvents);
    const log: string[] = [];

    const startSub = events.subscribe('au:router:navigation-start', e => {
      log.push(`${e.name}:${e.instructions.toUrl(false, pathUrlParser, true)}`);
    });
    const endSub = events.subscribe('au:router:navigation-end', e => {
      log.push(`${e.name}:${e.instructions.toUrl(false, pathUrlParser, true)}`);
    });

    await router.load('about');
    assert.deepStrictEqual(log, [
      'au:router:navigation-start:about',
      'au:router:navigation-end:about',
    ]);

    startSub.dispose();
    endSub.dispose();
    await stop(true);
  });
});
```

## 4. When to mock (and what to mock)

- **Unit-test a view-model hook** by calling `canLoad`, `loading`, `canUnload`, etc. directly with a `Params` object.
- **Integration-test routing** with a fixture when you need `<au-viewport>`, route configuration, events, or URL generation.
- If you only need the current route shape, mock `ICurrentRoute` and provide `path`, `query`, and `parameterInformation` in your test container.

