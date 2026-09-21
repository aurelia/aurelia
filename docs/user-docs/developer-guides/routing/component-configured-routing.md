---
description: Keep a feature's child routes and navigation beside the layout that owns them.
---

# Component configured routing

A feature layout can own its routes just as the application root does. Use this when several pages share a shell, navigation, or state that should remain in place while the child page changes.

For example, a user profile can host an information page and an items page:

```typescript
// user-profile.ts
import { route } from '@aurelia/router';
import { UserInfo } from './user-info';
import { UserItems } from './user-items';

@route({
  routes: [
    { id: 'info', path: '', component: UserInfo, title: 'Profile' },
    { path: 'items', component: UserItems, title: 'Items' },
  ],
})
export class UserProfile {}
```

```html
<!-- user-profile.html -->
<nav>
  <a load="info">My info</a>
  <a load="items">My items</a>
</nav>
<au-viewport></au-viewport>
```

These examples use Aurelia's file conventions to pair each class with its template. In the parent layout's route table, mount `UserProfile` at the desired path:

```typescript
{ path: 'profile', component: UserProfile }
```

At `/profile`, the empty child path selects `UserInfo`. At `/profile/items`, the nested viewport shows `UserItems` while `UserProfile` remains mounted. Both links resolve in the profile layout's routing context. The `info` link selects the route ID for the empty path, returning to `/profile`.

This is ordinary child routing in `@aurelia/router`; the parent and child route tables use the same configuration model. Read [Child routing](../../router/child-routing.md) for parameters, parent navigation, and programmatic navigation through `IContextRouter`.
