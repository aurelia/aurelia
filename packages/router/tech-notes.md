## Navigation flow
All navigations roughly follows the same flow:
1) A user action (link click, browser navigation, api call) results in a set of `LoadInstruction`s to the `Router`, prepared by the corresponding handler (`LinkHandler`, `BrowserViewerStore` and `Router` respectively).
2) The `Router` enriches the `LoadInstruction`(s) into a `Navigation` that's sent to the `Navigator`.
3) The `Navigator` enriches the `Navigation` further, queues it and sends it to the `Router` for processing.
4) The `Router` turns, with help from the `RoutingScope`s, the `Navigation` into a set of `RoutingInstruction`s.
5) The `RoutingInstruction`s are then, again with the help of the `RoutingScope`s, matched to the appropriate `Endpoint`s.
6) The `Endpoint`s are informed of their `RoutingInstruction`s.
7) If one of the `Endpoint`s disapprove of their `RoutingInstruction`s (based on the state of their current content, authorization and so on) the `Navigation` is cancelled.
8) If the `Navigation` is approved, the `Endpoint`s are instructed to perform their transitions.
9) Once all transitions are completed, the `Router` informs the `Navigator` about the success and the new, complete state.
10) The `Navigator` saves the new state in the right place (if any) in history and informs the `BrowserViewerStore` about the new current state.
11) The `BrowserViewerStore` sends the new state to the browser's _viewer_ (browser Location url and title) and _store_ (browser History).

## Entities

### `Router` (`.router`)

The router is the "main entry point" into routing. Its primary responsibilities are
- provide configuration api
- provide api for adding and finding endpoints (viewport and viewport scope)
- provide api for connecting endpoint custom elements to endpoints
- provide navigation/load api and inform the navigator about navigation/load instructions
- provide informational api regarding ongoing navigation
- receive a navigation (instruction) from the navigator and process it
- invoke routing hooks when appropriate

### `NavigationCoordinator/StateCoordinator`

Helps the router coordinate navigations. More to come.

### `RoutingScope` (`.scope`)

The router uses routing scopes to organize all endpoints (viewports and viewport scopes) into a hierarchical structure. Each routing scope belongs to a parent/owner routing scope (except the root, that has no parent) and can in turn have several
routing scopes that it owns. A routing scope always has a connected endpoint. (And an endpoint always has a connected routing scope.)

Every navigtion/load instruction that the router processes is first tied to a routing scope, either a specified scope or the root scope. That routing scope is then asked to
1. find

   - routes (and their routing instructions) in the load instruction based on the endpoint and its content (configured routes), and/or
   - (direct) routing instructions in the load instruction.

After that, the routing scope is used to

2) match each of its routing instructions to an endpoint (viewport or viewport scope), and
3) set the scope of the instruction to the next routing scopes ("children") and pass the instructions on for matching in their new routing scopes.

Once (component) transitions start in endpoints, the routing scopes assist by

4) propagating routing hooks vertically through the hierarchy and disabling and enabling endpoints and their routing data (routes) during transitions.

Finally, when a navigation is complete, the routing scopes helps

5) structure all existing routing instructions into a description of the complete state of all the current endpoints and their contents.

The hierarchy of the routing scopes often follows the DOM hierarchy, but it's not a necessity; it's possible to have routing scopes that doesn't create their own "owning capable scope", and thus placing all their "children" under the same "parent"
as themselves or for a routing scope to hoist itself up or down in the hierarchy and, for example, place itself as a "child" to a DOM sibling endpoint. (Scope self-hoisting will not be available for early-on alpha.)

### `Navigator`

The navigator is responsible for managing (queueing) navigations and feeding them to the router, keeping track of historical navigations/states and providing an api to historical and current/last state.

The navigator uses a first-in-first-out queue with a callback that gets called with a queued item only when the previously processed item has been resolved or rejected. All navigations are enqueued in this queue and once dequeued into the callback the navigator enrich them with historical navigation data and pass it on to the router for processing.

An event is fired when a navigation is ready for processing by the router.

Whenever the router has finalized or canceled a navigation it informs the navigator which then updates current/last and historical states accordingly and instructs the viewer and store (BrowserViewerStore) to do appropriate updates.

TODO: Make the queue not wait until currently processing item is done, so that it won't be necessary to wait for long running navigations to finish before doing a new navigation.

### `BrowserViewerStore` (`.navigation`)

Viewer and store layers on top of the browser. The viewer part is for getting and setting a state (location) indicator and the store part is for storing and retrieving historical states (locations). In the browser, the Location is the viewer and the History API provides the store.

All mutating actions towards the viewer and store are added as awaitable tasks in a queue.

Events are fired when the current state (location) changes, either through direct change (manually altering the Location) or movement to a historical state.

All interaction with the browser's Location and History is performed through these layers.

### `Navigation` (`.navigation`)

The navigation as done by api, link or browser action. Contains state change, provided parameters, navigation direction, historical information.

### `RoutingInstruction` (`.routingInstruction`, `.instruction`)

A routing instruction to specific endpoint(s). Mainly contains a component part, an endpoint part, a parameters part and a routing scope part.

### `Endpoint` (`.endpoint`)

An endpoint is anything that can receive and process a routing instruction.

### `Viewport` (`.viewport`)

The viewport is an endpoint that encapsulates an `au-viewport` custom element instance. It always has at least one viewport content -- the current and also the next when the viewport is in a transition -- even though the viewport content can be empty.

If a routing instruction is matched to a viewport during a navigation, the router will ask the viewport if the navigation is approved (based on the state of the current content, next content authorization and so on) and if it is, instruct the navigation coordinator to start the viewport's transition when appropriate. The viewport will then orchestrate, with coordination help from the navigation coordinator, the transition between the current content and the next, including calling relevant routing and lifecycle hooks.

In addition to the above, the viewport also serves as the router's interface to the loaded content/component and its configuration such as title and configured routes.

### `ViewportContent` (`.content`, `.nextContent`)

The viewport content encapsulates the component loaded into a viewport and keeps track of the component's lifecycle and routing states.

During a transition, a viewport has two viewport contents, the current and the next, which is turned back into one when the transition is either finalized or aborted.

Viewport contents are used to represent the full component state and can be used for caching.

### `ViewportScope` (`.viewportScope`)

The viewport scope is an endpoint that encapsulates an au-viewport-scope custom element instance. Its content isn't managed by, or even relevant for, the viewport scope since it's only a container custom element. Instead of managing content, the viewport scope provides a way to

- add a routing scope without having to add an actual viewport,
- have segments in routes/paths/instructions without requiring a viewport, and
- make viewports repeatable (something they can't be by themselves) by enclosing them.

Since it is an endpoint, the viewport scope is participating in navigations and instructed by the router and navigation coordinator (but with a very simple transition and other navigation actions).

### `LinkHandler`
### `RouterOptions`

### `Route`
### `RouteRecognizer`

### `RoutingHook`
