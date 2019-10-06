# Aurelia Specs

Note: The contents in this document may no longer apply or be out of date.

- [Application Startup](#application-startup)
- Pages and Components
- Routing
  - [Router Configuration](#router-configuration)
  - [Activation-Lifecycle](#activation-lifecycle)
  - Caching

# Application Startup

## New Quick Startup (recommended)
*Spec: https://github.com/aurelia/aurelia/issues/630* <br />
*Status: 0/Discussion*

```ts
import Aurelia, { StyleConfiguration, RouterConfiguration } from 'aurelia';
import { MyRootComponent } from './my-root-component';
// By default host to element name (<my-root-component> for MyRootComponent),
// or <body> if <my-root-component> is absent.
Aurelia.app(MyRootComponent).start();

// Or load additional aurelia features
Aurelia
  .register(
    StyleConfiguration.shadowDOM(),
    RouterConfiguration.customize({ useUrlFragmentHash: false })
  )
  .app(MyRootComponent)
  .start();

// Or host to <my-start-tag>
Aurelia
  .register(
    StyleConfiguration.shadowDOM(),
    RouterConfiguration.customize({ useUrlFragmentHash: false })
  )
  .app({
    component: MyRootComponent,
    host: document.querySelector('my-start-tag')
  })
  .start();
```

## Verbose Startup

*Spec: https://github.com/aurelia/aurelia/issues/397* <br />
*Status: 0/Discussion*

To start an Aurelia application, create a `new Aurelia()` object with a target `host`, a root `component`, and an optional list of `plugins`, and call `start()`.

```ts
import Aurelia, { JitHtmlBrowserConfiguration } from 'aurelia';
import { ThirdPartyPlugin } from 'third-party-plugin';

// Object API.
const app = new Aurelia({
  host: 'my-host-element',
  component: MyRootComponent
  plugins: [
    JitHtmlBrowserConfiguration,
    ThirdPartyPlugin
  ]
}).start();

// Fluent API.
const app = new Aurelia()
  .host('my-host-element')
  .component(MyRootComponent)
  .plugins([
    JitHtmlBrowserConfiguration,
    ThirdPartyPlugin
  ])
  .start();
```

# Pages and Components
# Routing

## Router Configuration

*Spec: https://github.com/aurelia/aurelia/issues/164* <br />
*Status: 0/Discussion*

Route configuration can be done one of three ways: Up-front (no definition yet), using the `@route` decorator, or by defining a `static routes` property. For clarity, I've included the most terse definition with the decorator approach and the most verbose definition with the static routes approach for each example. This will demonstrate what they will look like in a typical development case as well as an explicit definition what they imply. I've also commented out implicit or conventional values that will be set by Aurelia under the hood.

## `IRouteConfig`

The names of properties are up for grabs. I have chosen names that I believe are most illuminating and most standard.

```javascript
interface IRouteConfig {

  // A string or array of strings of matching route paths.
  // (Renamed from route in vCurrent)
  path: string | string[],

  // A constructor function for the view-model to attach for this route.
  // For route decorator and static routes approaches, Aurelia will set this
  // value under the hood.
  // (Repurposed from moduleId in vCurrent)
  component?: IComponent,

  // A uniquely identifiable name for the route, for canonical navigation.
  // For route decorator and static routes approaches, Aurelia will try to
  // set this value by convention if not specified explicitly.
  name?: string,

  // Optional, the name of the viewport to attach the controller to. If not
  // specified, the default viewport will be used.
  viewport?: string,

  // Optional, the name of the parent route or routes, matched by the `name` property.
  parent?: string | string[],

  // Optional, flag to opt the route out of the navigation model. Defaults
  // to true.
  nav?: boolean,

  // Optional, an object with additional information available to the
  // view-model throughout the activation lifecycle.
  // (Renamed from settings in vCurrent)
  meta?: any
}
```

## A basic route

Defining a basic route is dead simple.

```javascript
@route('home')
export class MyViewModel {
  static routes = [
    {
      path: 'home',
      //, name: 'my'
      //, component: this
    }
  ];
}
```

## Canonical urls

Multiple routes can redirect to the same route, creating a canonical url for that page.

```javascript
@route('home')
@route({ path: '', redirect: 'home' })
export class MyViewModel {
  static routes = [
    {
      path: 'home'.
      //, name: 'my'
      //, component: this
    },
    {
      path: '',
      redirect: 'home'
    }
  ]
}
```

## Aliased routes

Alternatively, multiple routes can load the same page without redirecting the route.

```javascript
@route(['', 'home'])
export class MyViewModel {
  static routes = [
    {
      path: ['', 'home'],
      //, name: 'my'
      //, component: this
    }
  ]
}
```

## Custom viewports

If a page has multiple viewports defined, each route should specify which viewport the route targets. Multiple route configurations can target the same paths.

```html
<template>
  <viewport name="left"></viewport>
  <viewport name="right"></viewport>
</template>
```

```javascript
@route({ path: 'forwards', viewport: 'left' })
@route({ path: 'backwards', viewport: 'right' })
export class FirstViewModel {
  static routes = [
    {
      path: 'forwards',
      viewport: 'left',
      //, name: 'first'
      //, component: this
    },
    {
      path: 'backwards',
      viewport: 'right'
      //, name: 'first'
      //, component: this
    }
  ]
}

@route({ path: 'forwards', viewport: 'right' })
@route({ path: 'backwards', viewport: 'left' })
export class LastViewModel {
  static routes = [
    {
      path: 'forwards',
      viewport: 'right',
      //, name: 'last'
      //, component: this
    },
    {
      path: 'backwards',
      viewport: 'left'
      //, name: 'last'
      //, component: this
    }
  ]
}
```

If two configurations target the same paths and viewports, a warning should be raised.

```javascript
@route('home')
export class HomeViewModel { }

@route('home') // Warning! Duplicate route definition for path "home" in viewport "default".
@route({ path: 'home', viewport: 'side' }) // OK.
export class NotHomeViewModel { }
```

## Child routes

**NOTE** I've done my best to get various points of views concerning the importance of child routes. I'm still looking for use cases that may not be covered here.

A route can be defined as a child route by specifying its parent by name. This allows (a) creating a child viewport that is refreshed without touching any other viewports and (b) defining a more flexible navigation model (below) without having to maintain a separate route configuration table.

```javascript
// 'parent' loads parent only into the default viewport
@route({ path: 'parent' })
export class ParentViewModel { }
```

```html
<template id="parent">
  <viewport></viewport>
</template>
```

```javascript
// 'child' loads child only into the default viewport
@route({ path: 'child' })

// 'parent/child' loads child into the default viewport of parent
@route({ path: 'child', parent: 'parent' })
export class ChildViewModel {
  static routes = [
    {
      path: 'child',
      //, name: 'child'
      //, component: this
    },
    {
      path: 'child',
      parent: 'parent',
      //, component: this
    }
  ]
}
```

## Absolute paths (aka alias via Vue)

Paths defined with a leading forward slash match the app's base url. This is particularly useful when you want a child route to match a path independent of its parent's path.

```javascript
// 'special-child' loads child into the default viewport of parent
@route({ path: '/special-child', parent: 'parent' })
export class ChildViewModel {
  static routes = [
    {
      path: '/special-child',
      parent: 'parent',
      //, component: this
    }
  ]
}
```

## Parameterized routes

Parameterized routes define dynamic sections of the path (parameters) that are made available throughout the activation lifecycle. If a type is specified, the route will only match values that can be coerced to the specified type, and the value will be available as the specified type throughout the activation lifecycle.

```javascript
// matches 'foo/bar1!@#$%'
@route('foo/{name}')

// matches 'foo/123' and 'foo' but not 'foo/bar'
@route('foo/{id?:number}')
export class MyViewModel {
  static routes = [
    {
      path: 'foo/{name: string}',
      //, component: this
    },
    {
      path: 'foo/{id?: number}',
      //, component: this
    }
  ];
}
```

## Custom parameterizers

In addition to native JavaScript types, custom types can be registered with the router.

```javascript
router.registerParameterizer('Guid', (param: string) => {
  if (/^[0-9a-f]{8}-?(?:[0-9a-f]{4}-?){3}[0-9a-f]{12}$/i.test(param)) {
    return param;
  }
  // If no value is returned, the route does not match.
});

// matches 'foo/6e380650-8b50-4cb4-8a09-a5449abf597b' but not 'foo/123'
@route('foo/{id: Guid}')
export class FooViewModel { }
```

## Navigation model

## Route metadata

Special metadata can be specified on each route that is made available throughout the activation lifecycle. This is particularly useful for defining implicit or hidden parameters when a user navigates through a particular route.

```javascript
@route('')
@route({ path: 'other', meta: { referral: true })
export class MyViewModel {
  static routes = [
    {
      path: '',
      //, component: this
    },
    {
      path: 'other',
      meta: { referral: true },
      //, component: this
    }
  ]

  activate(params, config) {
    config.meta.referral === true;
  }
}
```

## Activation Lifecycle
## Caching

