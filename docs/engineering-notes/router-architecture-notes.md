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

## Generating viewport instruction

This is an internal API used to generate an instance of [`ViewportInstruction`](#viewportinstruction), given a partial `ViewportInstruction` or a route-id or route-definition coupled with parameters.

The idea is to attempt eagerly resolving a path/partial viewport instruction/route definition to a concrete instance of `ViewportInstruction` by finding building a `RecognizedRoute`.
This process roughly looks as follows:

- A `RouteDefinition` is resolved for the given instruction.
- Once a route definition is found, it is attempted to generate a "most-matched" path from the configured routes and the given parameters.
- Once such a path is formed, it is used to create the viewport instruction.

# Router

## Resolving `RouteContext`

TODO

## Loading a route

The `Router#load` function supports many overloads in terms of the range of different types of supported loading instructions.

The instructions are then converted to a [viewport-instruction-tree](#viewportinstructiontree) and then the tree is [enqueued](#enqueuing-viewport-instruction-tree).

## Enqueuing viewport-instruction-tree

This process involves creating a [transition](#transition) and executing/[running the transition](#running-a-transition).
If there is any ongoing transition, then this transition will be executed after the currently ongoing transition.
This also involves error handling, when the transition is failed.

## Running a transition

This process looks as follows.

- First it is determined if the new instruction is different than the previous one.
- If it is the same whether or not the same-url-strategy is reload or not. This determines whether the new instruction will be processed or not.
- If the transition is determined not be processed, then the transition is resolved to `false` (indicating non successful transition), and the next transition (if any) is attempted.
- Otherwise:
  - The `NavigationStartEvent` is raised
  - The route tree is updated. This process involves converting the viewport instruction tree to one or more (depending on sibling, parent-child etc.) RouteNodes, and appending those to the route tree. Note that the child instructions are marked as residual instructions, and are loaded/processed lazily (TODO(sayan): add more info). The viewport agent for the routing context is also set at this time. The details are outlined [here](#updating-route-tree).
  - After that the following batch of actions are performed:
    - The `canUnload` [hook](#hooks) in the components in the **previous** route tree are invoked.
    - If the result of the previous action indicates that the previous components cannot be unloaded, then the navigation is cancelled.
    - The `canLoad` [hook](#hooks) in the components in the **current** route tree are invoked.
    - If the result of the previous action indicates that the previous components cannot be unloaded, then the navigation is cancelled.
    - The `unload` [hook](#hooks) in the components in the **previous** route tree are invoked.
    - The `load` [hook](#hooks) in the components in the **current** route tree are invoked.
    - The components are then [swapped](#swapping-the-components). That is the old components are deactivated, and the new components are activated.
    - Once the transitions for all nodes end, the `NavigationEndEvent` is raised, the history state as well as the title are updated. And the next transition (if any) is attempted.

# Updating route tree

This process always starts from the router when [running a transition](#running-a-transition).
This process starts with 3 things:
- The routeTree of the current transition that the router is currently processing/running.
- The current `ViewportInstructionTree` from the current transition.
- The resolved routing context.

In the beginning, the query parameters, and fragments of the given routeTree as well as the routeTree of the root `RouteContext` are overwritten with the ones from the given viewport instruction tree.
After that the effective routing context is determined and all the route definitions are awaited, as a promise can be used to grab a route definition (read lazy-loading modules).
Once that is done, the route-context's node is updated.
This process roughly looks as follows:


# ViewportAgent

TODO

## Hooks

TODO

## Swapping the components
# Transition

This encapsulates essentially the previous viewport instruction tree and route tree as well as the current ones.

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
The [`RouteContext#generateViewportInstruction`](#generating-viewport-instruction) employs this tactics.

# `ViewportInstructionTree`

This encapsulates the child instructions (instances of [`ViewportInstruction`](#viewportinstruction)), query parameters, and path fragments.
The `ViewportInstruction.create` is the primary API to instantiate a `ViewportInstructionTree` and supports many overloads.
Every child instructions are created using the [`ViewportInstruction.create`](#viewportinstruction) method.

# `NavigationModel`

TODO

# Resolving route definition

TODO

