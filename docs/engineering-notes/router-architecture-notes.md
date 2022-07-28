# Bootstrapping phase

The bootstrapping phase consists of two steps.
These performed during the `hydrated` phase and the `afterActivate` phase of the app via the `AppTask`s.
In the [first step](#setting-the-root) the routing root is set and in the [second step](#starting-the-router) the router is started.

## Setting the root

In this step, some precautionary checks are performed, such as the `IAppRoot` (app root) is there and no pre-existing `RouteContent` is present, etc.
After that:

- A singleton instance of `Router` is instantiated.
- A `RouteContext` is instantiated via the `Router` instance ([`Router#getRouteContext`](#resolving-routecontext)) for the app root and registered to the DI container.
- The `root` node of the router's `routeTree` is set to the `node` of the `RouteContext`-instance.

Among these, the instantiation process of a `RouteContext` is interesting for us. Refer the [respective section](#instantiating-routecontext) for this.

## Starting the router

Starting the router mainly involves [`load`](#loading-a-route)ing the initial route, as provided by the location manager.
This is typically the empty route (`''`), discarding the base URL.
The other significant things that are also done during start is to subscribe to the Browser-History events, and [load](#loading-a-route) the changed routes accordingly.

# `RouteContext`

## Instantiating `RouteContext`

The instantiation process consists of following steps:

- Creates a module loader; this is needed later when resolving a lazily loaded module while [resolving a route definition](#resolving-route-definition).
- Creates an empty [navigation model](#navigationmodel) which can be used by the user app to access the list of defined routes for the current `RouteContext`. The navigation model also indicates the currently active route.
- Lastly, and most importantly it [processes the given `RouteDefinition`](#processing-route-definitions) to build up the routing table for this "level" (consider that there might be hierarchical parent-child related routers) for this route context. This also adds the routes to the `NavigationModel`.

## Processing route definitions

This process is responsible for registering the child routes, and thereby building up the routing table for the current `RouteContext`.
More elaborately speaking, for the root node it essentially creates the top level routing table, and for the any other node, having child routes, it builds the child routing table for that node.
The process is of-course identical for both the cases.

The routes for a component can be defined:
- Statically using the `@route` decorator or the `static route` property, or
- Dynamically, by leveraging the `getRouteConfig` hook.

When defined statically, the child-routes should already be present in the given `RouteDefinition`.
Thus, if there are no child-routes present, it is inspected if the component defines the `getRouteConfig` hook.
If yes, then the processing of the `RouteDefinition` is delayed until this component is instantiated (`createComponentAgent`).

When the child routes are present in the given `RouteDefinition`, they are iterated,

- every route is resolved to a `RouteDefinition`, and
- the routes are added one after another to the route-recognizer as well as to the navigation-model.

If there is no lazily loaded components then this process is synchronous.

# Router

## Resolving `RouteContext`

TODO

## Loading a route

The `Router#load` function supports many overloads.
Let us continue this discussion considering the `load(/*arg1*/'stringPathOrRouteId', /*arg2*/optionalLoadOptions)` overload.

- If the string `arg1` is a configured route id then we can resolve the handler/view-model/component directly and create a [viewport-instruction-tree](#viewportinstructiontree) directly. This saves us later doing the gymnastic of resolving a string path using the route recognizer.
- If the `arg1` is not a configured route id then a [viewport-instruction-tree](#viewportinstructiontree) is created in standard fashion, without eagerly recognizing the route for the given input in `arg1`.

---------- TODO: Continue form here

# `ViewportInstruction`

It encapsulates a `component` (can be a path, CE-class, CE-Definition, or a (routable) ViewModel instance), an optional viewport name, optional parameters, and a collection of child `ViewportInstruction`s.

The downstream processing of `ViewportInstruction` involves recognizing the `component` and creating a `RecognizedRoute` from that.
Typically,
- for a string component it involves employing the route recognizer
- for a non-string component however, the associated RouteDefinition is resolved
and then a RecognizedRoute is created from that.

In some cases, the process of route recognition can be avoided.
For example, when you already know the route id, or you already have access to the route definition.
In such cases, a `RecognizedRoute` can be easily obtained and such instance can be used to instantiate `ViewportInstruction`, saving us the duplicate/double work of recognizing the component in downstream.
The `RouteContext#generateViewportInstruction` or `RouteContext#generateTree` employs this tactics.

# `ViewportInstructionTree`

This encapsulates the child instructions (instances of [`ViewportInstruction`](#viewportinstruction)), query parameters, and path fragments.
The `ViewportInstruction.create` is the primary API to instantiate a `ViewportInstructionTree` and supports many overloads.
Every child instructions are created using the [`ViewportInstruction.create`](#viewportinstruction) method.

# `NavigationModel`

TODO

# Resolving route definition

TODO

