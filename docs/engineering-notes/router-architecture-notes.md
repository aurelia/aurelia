# Bootstrapping phase

The bootstrapping phase consists of two steps.
These performed during the `hydrated` phase and the `afterActivate` phase of the app via the `AppTask`s.
In the first step the routing root is set and in the second step the router is started.

## Setting the root

In this step, some precautionary checks are performed, such as the `IAppRoot` (app root) is there and no pre-existing `RouteContent` is present, etc.
After that:

- A singleton instance of `Router` is instantiated.
- A `RouteContext` is instantiated via the `Router` instance ([`Router#getRouteContext`](#resolving-routecontext)) for the app root and registered to the DI container.
- The `root` node of the router's `routeTree` is set to the `node` of the `RouteContext`-instance.

Among these, the instantiation process of a `RouteContext` is interesting for us. Refer the [respective section](#instantiation) for this.

# `RouteContext`

## Instantiation

The instantiation process consists of following steps:

- Creates a module loader; this is needed later when resolving a lazily loaded module while [resolving a route definition](#resolving-route-definition).
- Creates an empty [navigation model](#navigationmodel) which can be used by the user app to access the list of defined routes for the current `RouteContext`. The navigation model also indicates the currently active route.
- Lastly, and most importantly it [processes the given `RouteDefinition`](#processing-route-definitions) to build up the routing table for this "level" (consider that there might be hierarchical parent-child related routers) for this route context. This also adds the routes to the `NavigationModel`.

## Processing route definitions

This process is responsible for registering the child routes, and thereby building up the routing table for the current `RouteContext`.
More elaborately speaking, for the root node it essentially creates the top level routing table, and for the any other node, having child routes, it builds the child routing table for that node.
The process is of-course identical for both the cases.



# Router

## Resolving `RouteContext`

TODO

# `NavigationModel`

TODO

# Resolving route definition

TODO

