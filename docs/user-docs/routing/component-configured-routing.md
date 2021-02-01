---
description: >-
  Working with the hybrid approach to routing, configure routing from within
  components.
---

# Component Configured Routing

If direct routing isn't verbose enough for you and configured routing is too verbose, component configured routing is a mix between the two and falls somewhere in the middle. Using decorators to configure your components and router options, it still requires very little code.

This approach works wonders for situations where you want a section inside your application with its own viewport and subset of routes. For example, a profile page with child routes for pages within that section, a section for the user's profile information, and view their items.

**Your view-model might look like the following:**

```text
import { customElement, IRouteViewModel, Params, IPlatform, route } from 'aurelia';

  
import template from './user-profile.html';

@route({
  routes: [
    { id: 'info', path: '', component: UserInfoCustomElement, title: 'Profile' },
    { path: 'items', component: UserItemsCustomElement, title: 'Profile' },
  ],
})
@customElement({ name: 'user-profile', template })
export class UserProfileCustomElement implements IRouteViewModel {

}
```

**Your view might be something basic like this:**

```text
<div class="user-profile-container">
    <ul>
      <li class="nav-item">
        <a class="nav-link" load="info;>
          My Info
        </a>
      </li>
      <li class="nav-item">
        <a class="nav-link" load="route:items;>
          My Items
        </a>
      </li>
    </ul>

    <au-viewport></au-viewport>
</div>
```

Notice how we import the `route` decorator and supply an object containing a `routes` property? You can define your routes and pass in the component for the router to instantiate.

One line of code of notable interest is our first route has an empty path, denoted by the empty single quotes, `path: ''` this tells the router that this is our default route for this view. We are loading the user info component if no other route is specified.

