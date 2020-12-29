## Entities
- `Navigation` (`.navigation`) - the navigation as done by api, link or browser action. Contains state change, provided parameters, navigation direction, historical information.
- `RoutingInstruction` (`.routingInstruction`, `.instruction`) - a routing instruction to specific endpoint(s). Mainly contains a component part, an endpoint part, a parameters part and a routing scope part.

## Navigation flow
All navigations roughly follows the same flow:
1) A user action (link click, browser navigation, api call) results in a set of ``LoadInstruction``s to the ``Router``, prepared by the corresponding handler (``LinkHandler``, ``BrowserViewerStore`` and ``Router`` respectively).
2) The ``Router`` enriches the ``LoadInstruction``(s) into a ``Navigation`` that's sent to the ``Navigator``.
3) The ``Navigator`` enriches the ``Navigation`` further, queues it and sends it to the ``Router`` for processing.
4) The ``Router`` turns, with help from the ``RoutingScope``s, the ``Navigation`` into a set of ``RoutingInstruction``s.
5) The ``RoutingInstruction``s are then, again with the help of the ``RoutingScope``s, matched to the appropriate ``Endpoint``s.
6) The ``Endpoint``s are informed of their ``RoutingInstruction``s.
7) If one of the ``Endpoint``s disapprove of their ``RoutingInstruction``s (based on the state of their current content, authorization and so on) the ``Navigation`` is cancelled.
8) If the ``Navigation`` is approved, the ``Endpoint``s are instructed to perform their transitions.
9) Once all transitions are completed, the ``Router`` informs the ``Navigator`` about the success and the new, complete state.
10) The ``Navigator`` saves the new state in the right place (if any) in history and informs the ``BrowserViewerStore`` about the new current state. The ``BrowserViewerStore`` sends the new state to the browser's _viewer_ (browser Location url) and _store_ (browser History).
