---
description: Navigate relative to the current application URL, in either history or hash mode.
---

# Application URL navigation

Use `router.navigate()` when a destination is relative to the current application URL. For example, a pagination control can change the query with `?page=2`, and a sibling-page link can replace the last path segment with `admins`.

Use [`load` or `IContextRouter.load()`](./navigating.md) when the destination belongs to a particular routing context. A persistent layout linking to its own children usually benefits from that context staying the same as users navigate deeper into the application.

## Navigate or create a link

```typescript
import { resolve } from '@aurelia/kernel';
import { IRouter } from '@aurelia/router';

export class Results {
  private readonly router = resolve(IRouter);

  nextPage() {
    return this.router.navigate('?page=2');
  }

  replaceFilter(filter: string) {
    const query = new URLSearchParams({ filter });
    return this.router.navigate(`?${query}`, { historyStrategy: 'replace' });
  }
}
```

`navigate()` returns a `Promise<boolean>`. It uses the normal router lifecycle and returns `false` when a navigation guard cancels the transition.

`resolveUrl()` applies the same reference rules and returns a browser-ready `href` synchronously:

```typescript
const href = router.resolveUrl('/reports?period=month');
```

This creates a snapshot of the destination. It does not navigate or check whether a configured route will match. Use the [`url` attribute](#declarative-links) for links that should stay relative to the current application URL as navigation occurs.

## How references resolve

The base is the URL of the last successfully completed navigation. A pending or canceled transition does not change it. Successful navigation with `historyStrategy: 'none'` changes this base even though the address bar stays the same.

From `/users/members?page=1`:

| Reference | Application destination |
| --- | --- |
| `admins` | `/users/admins` |
| `../about` | `/about` |
| `/home` | `/home` |
| `?page=2` | `/users/members?page=2` |
| `#details` | `/users/members?page=1#details` |

A leading `/` starts at the application root. Each `..` removes one URL path segment. With contextual `load`, each `../` instead moves to a parent routing context, which may span several path segments.

Trailing slashes follow ordinary URL-reference rules: `../c` resolves to `/c` from `/a/b`, and to `/a/c` from `/a/b/`. To navigate from `/a/b` to its sibling `/a/c`, use `c`.

The reference is independent of the deployment prefix and routing mode. For an application mounted at `/app/`, `/users/members` is represented as `/app/users/members` in history mode and `/app/#/users/members` in hash mode. In both cases, `navigate('admins')` targets the application route `/users/admins`. Supply `/users/admins`, rather than `/app/users/admins`, when using an application-root reference.

References also preserve Aurelia's existing incoming URL interpretation, including route IDs and named-viewport syntax. Choose distinct route IDs and public paths when they identify different routes; [AUR3179](../developer-guides/error-messages/router/aur3179.md) explains how a collision can affect links and reloads.

## Declarative links

Register `UrlCustomAttribute` explicitly alongside your router configuration:

```typescript
import Aurelia from 'aurelia';
import { RouterConfiguration, UrlCustomAttribute } from '@aurelia/router';
import { MyApp } from './my-app';

Aurelia
  .register(RouterConfiguration, UrlCustomAttribute)
  .app(MyApp)
  .start();
```

```html
<a url="admins">Admins</a>
<a url="?page=2">Next page</a>
<a url.bind="destination">Open</a>
```

The attribute writes a real `href` and refreshes relative links after successful navigation. An ordinary click uses the destination already represented by that link. Modified clicks and links targeting another window keep native browser behavior.

Use one navigation attribute on each element. The `url` attribute supplies its own `href`; an authored `href` or `load` on the same element raises [AUR3274](../developer-guides/error-messages/router/aur3274.md). For route-based active-link styling, use the [`load` attribute](./navigating.md#active-status).

## Navigation options and document links

`navigate()` accepts `INavigationBehaviorOptions`: `historyStrategy`, `state`, `title`, `titleSeparator`, and `transitionPlan`. The reference itself supplies the path, query and fragment. Its base is the current application URL, so it has no routing-context option.

Query changes update `ICurrentRoute`. If a reused page reads its query only in `loading()`, pass `transitionPlan: 'invoke-lifecycles'` to run that hook again. The normal component-reuse policy remains in effect otherwise.

Use native links for other documents and external sites:

```html
<a href="/downloads/guide.pdf" external>Download the guide</a>
<a href="https://example.com/help">Help center</a>
```

For programmatic document navigation, use the browser's `location.assign()` or `location.replace()`. Absolute URLs such as `https://example.com/help` and protocol-relative URLs such as `//example.com/help` raise [AUR3273](../developer-guides/error-messages/router/aur3273.md) when passed to `navigate()`, `resolveUrl()`, or `url`.
