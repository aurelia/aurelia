# Component lifecycle timing

These diagrams show the public timing guarantees for a component tree. See [Component lifecycles](component-lifecycles.md) for hook signatures and common uses.

## Activation

Activation proceeds from parent to child until the `attached` phase returns from the leaves.

```mermaid
sequenceDiagram
    participant Parent
    participant DOM
    participant Child

    Parent->>Parent: binding()
    Note over Parent: Await returned work
    Parent->>Parent: connect bindings
    Parent->>Parent: bound()
    Note over Parent: Await returned work
    Parent->>DOM: insert parent nodes

    par Parent attaching work
        Parent->>Parent: attaching()
    and Child activation
        Parent->>Child: activate
        Child->>Child: binding(), connect, bound()
        Child->>DOM: insert child nodes
        Child->>Child: attaching()
        Child->>Child: attached()
        Child-->>Parent: child subtree attached
    end

    Note over Parent,Child: Parent attaching and the child subtree have settled
    Parent->>Parent: attached()
```

For each controller:

1. `binding()` settles.
2. Aurelia connects that controller's bindings.
3. `bound()` settles.
4. Aurelia inserts the controller's nodes.
5. `attaching()` begins.
6. Child activation can proceed while the parent's `attaching()` Promise remains pending.
7. `attached()` runs after that controller's attaching work and descendant activation have settled. A descendant can reach `attached()` while an ancestor's `attaching()` Promise is still pending.

This produces the following tree order:

| Hook | Invocation order across the tree | When Aurelia continues |
| --- | --- | --- |
| `binding` | parent to child | each parent settles before its children begin |
| `bound` | parent to child | each controller settles before its attaching phase |
| `attaching` | parent to child | parent work can overlap descendant activation |
| `attached` | child to parent | each subtree settles before its own parent runs; ancestor `attaching` work can overlap |

Registered lifecycle-hook providers run in registration order for a controller. The component's matching hook follows them. Aurelia waits for every Promise returned during that phase.

## Deactivation

Deactivation gives every component a cleanup opportunity before disconnecting its bindings.

```mermaid
sequenceDiagram
    participant Parent
    participant Child
    participant DOM

    Parent->>Child: begin deactivation
    Child->>Child: detaching()
    Parent->>Parent: detaching()
    Note over Parent,Child: All returned detaching work settles

    Parent->>DOM: remove component nodes

    Child->>Child: unbinding()
    Parent->>Parent: unbinding()
    Note over Parent,Child: All returned unbinding work settles

    Child->>Child: disconnect bindings
    Parent->>Parent: disconnect bindings
    Note over Parent,Child: Subtree is inactive
```

The phase order is stable:

1. Aurelia invokes `detaching()` from child to parent. The returned Promises can remain pending at the same time.
2. DOM removal begins after all returned detaching work settles.
3. Aurelia invokes `unbinding()` from child to parent while bindings remain connected.
4. Binding disconnection begins after all returned unbinding work settles.
5. The controller subtree reaches its inactive state.
6. Permanent cleanup invokes synchronous `dispose()` from parent to child.

An outgoing animation can retain the DOM by returning its Promise from `detaching()`:

```typescript
export class ToastMessage {
  public detaching(): Promise<void> {
    return this.animation.leave();
  }
}
```

## Error reporting

Lifecycle failures are terminal for the affected transition. Aurelia preserves the original application error and reports it to the caller.

```mermaid
flowchart LR
    A[Hook throws synchronously] --> B[Later providers do not start]
    B --> C[Report the original application error]
```

A failed hook leaves the affected component or application in a terminal state. Fix the hook before creating and activating a replacement. Router navigation is different: the router can discard a failed route candidate and keep the current route active.

## Low-level transition requests

A controller runs one lifecycle transition at a time. Framework features such as Repeat, `if`, Switch, and dynamic composition serialize their own structural updates. Low-level integrations should await the current Controller result before requesting another transition.

| Request | Result |
| --- | --- |
| Deactivate during activation | Aurelia stops entering later activation phases and proceeds toward the inactive state. |
| Repeat an active deactivation request | The caller receives the current deactivation result. |
| Activate after deactivation settles | Aurelia starts a new activation transition. |

For low-level integrations, return the Promise for work started by the hook. Returning a controller transition that depends on the same hook creates a lifecycle dependency cycle that cannot settle.

## Practical lifecycle patterns

- **Prepare from bindables in `binding()`.** The constructor is suitable for dependency injection and field defaults. Bindable values are available when `binding()` runs.
- **Use mounted DOM at the appropriate phase.** Start an enter animation in `attaching()` when Aurelia should wait for it. Use `attached()` for measurements that need the component subtree in the document.
- **Return asynchronous hook work.** Aurelia keeps the DOM in place until a Promise returned by `detaching()` settles:

```typescript
public detaching(): Promise<void> {
  const animation = this.element.animate(
    [{ opacity: 1 }, { opacity: 0 }],
    { duration: 200 },
  );
  return animation.finished.then(() => void 0);
}
```

- **Pair resources with the active lifecycle.** Install DOM listeners in `attached()` and remove them in `detaching()` so cached components can reactivate cleanly:

```typescript
private readonly onResize = (): void => this.updateLayout();

public attached(): void {
  window.addEventListener('resize', this.onResize);
}

public detaching(): void {
  window.removeEventListener('resize', this.onResize);
}
```

Use synchronous `dispose()` for permanent cleanup of resources designed to survive ordinary deactivation.

## Waiting for startup and shutdown

Await application lifecycle calls in tests and in code that depends on the completed transition:

```typescript
await aurelia.start();

// Exercise the running application.

await aurelia.stop(true);
aurelia.dispose();
```

`start()` retains a synchronous fast path and therefore returns `void | Promise<void>`. The `await` expression handles both forms.
