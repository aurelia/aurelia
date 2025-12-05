# Template Concepts: Visual Guide

Visual diagrams to help understand Aurelia's templating system. Every diagram below is rendered with GitBook-friendly Mermaid so it stays legible in dark and light modes.

## Data Binding Flow

### One-Way Binding (View Model → View)

```mermaid
flowchart LR
    VM["View Model<br/>message = 'Hi'"]
    binding[".one-way / .to-view binding"]
    view["View<br/><p>${message}</p> → <p>Hi</p>"]
    VM --> binding --> view
```

Use one-way bindings for read-only flows or whenever the DOM only needs to reflect state.

### Two-Way Binding (View Model ↔ View)

```mermaid
flowchart LR
    VM["View Model<br/>name = 'Bob'"]
    binding[".bind (.two-way)"]
    view["<input value.bind='name'>"]
    VM <-->|"property updates"| binding
    binding <-->|"user typing"| view
```

Two-way bindings keep inputs and view-model properties in sync. Typing "Alice" updates `name`, which in turn refreshes every binding that depends on it.

### From-View Binding (View → View Model)

```mermaid
flowchart LR
    view["<input value.from-view='query'>"]
    binding[".from-view binding"]
    VM["View Model<br/>query = ''"]
    view --> binding --> VM
```

`.from-view` captures user input without pushing view-model changes back into the DOM—handy for debounced searches or analytics where the DOM already mirrors the value elsewhere.

## Binding Mode Decision Tree

```mermaid
flowchart TD
    start([Need to bind a value?])
    start --> input{Is it a form control?}
    input -->|Yes| readInput{Need to read user input?}
    readInput -->|Yes| useTwoWay["Use .bind<br/>(default .two-way)"]
    readInput -->|No| useOneWayInput["Use .one-way"]
    input -->|No| attr{Is it a regular attribute?}
    attr -->|Value changes often| dynamicAttr["Use .bind or .one-way"]
    attr -->|Value never changes| staticAttr["Use .one-time"]
```

## Conditional Rendering: if vs show

### if.bind – Adds/Removes from the DOM

```mermaid
stateDiagram-v2
    [*] --> Hidden
    Hidden --> Visible: isVisible becomes true
    Visible --> Hidden: isVisible becomes false
    Visible: Element exists in DOM<br/>Events attached<br/>Memory reclaimed when removed
```

`if.bind` creates and disposes the DOM subtree. It frees memory and automatically detaches listeners any time the condition flips back to `false`.

### show.bind – CSS Display Toggle

```mermaid
stateDiagram-v2
    [*] --> Hidden
    Hidden --> Visible: isVisible becomes true
    Visible --> Hidden: isVisible becomes false
    Hidden: Element stays in DOM<br/>style.display = 'none'<br/>Events stay attached
```

`show.bind` toggles `display: none` without touching the DOM tree. It is ideal for frequently toggled sections that should keep their internal state alive.

### Decision Matrix

| Capability        | `if.bind`            | `show.bind`                    |
|-------------------|----------------------|--------------------------------|
| DOM manipulation  | Create/destroy nodes | Toggle CSS display             |
| Memory            | Released when hidden | Always allocated               |
| Toggle speed      | Slightly slower      | Instant                        |
| Event cleanup     | Automatic            | Handled manually if needed     |
| Component init    | Runs every attach    | Runs once                      |
| Best for          | Rare toggles         | Frequent toggles               |

## List Rendering with repeat.for

### Basic Flow

```mermaid
flowchart LR
    items["View Model<br/>items = [{ id: 1, name: 'A' }, ...]"]
    directive["repeat.for='item of items'"]
    template["<li>${item.name}</li>"]
    items --> directive --> template
```

### With Keys for Efficient Updates

By default, the repeat controller tracks scopes by the actual item reference. When you insert `X` in between existing objects (`[A, B, C] → [A, X, B, C]`), Aurelia reuses the same scopes for `A`, `B`, and `C` because their references are unchanged; only `X` produces a new view. The `_scopeMap` maintained inside `packages/runtime-html/src/resources/template-controllers/repeat.ts` (see `_createScopes` and `_applyIndexMap`) stores either the raw item reference or your explicit key, which is why Aurelia can diff without re-rendering.

Provide a `key` only when you recreate objects between refreshes (for example, mapping API data into new literals) or when the list contains primitives. In those cases a property such as `id` gives Aurelia a stable identity to match.

```mermaid
flowchart TB
    subgraph "Reference identity (default)"
        oldA[A reference]
        oldB[B reference]
        oldC[C reference]
        oldA --> reuseA[same object reused]
        oldB --> reuseB[same object reused]
        oldC --> reuseC[same object reused]
    end
    subgraph "Keyed identity"
        keyId["key.bind: id"] --> match[Compare ids when objects are recreated]
    end
```

### Contextual Properties

| Property | Description                           | Example Values (list of 3) |
|----------|---------------------------------------|-----------------------------|
| `$index` | Zero-based index                      | `0`, `1`, `2`               |
| `$first` | True only for the first item          | `true`, `false`, `false`    |
| `$last`  | True only for the last item           | `false`, `false`, `true`    |
| `$even`  | True when `$index % 2 === 0`          | `true`, `false`, `true`     |
| `$odd`   | True when `$index % 2 === 1`          | `false`, `true`, `false`    |
| `$length`| Total length of the iterable          | `3`                         |
| `item`   | Current iteration value               | `'Apple'`, `'Banana'`, `'Cherry'` |

## Event Binding: Trigger vs Capture

### Bubbling Phase (.trigger)

```mermaid
flowchart TD
    btn["<button> (event origin)"]
    div["<div .trigger>"]
    body["<body>"]
    doc[document]
    win[window]
    btn --> div --> body --> doc --> win
    classDef bubble fill:#f0f4ff,stroke:#4466dd,stroke-width:2px;
    class btn,div,body,doc,win bubble;
```

`.trigger` listens during the bubble phase as the event travels from the target back toward the window.

### Capturing Phase (.capture)

```mermaid
flowchart TD
    win[window]
    doc[document]
    body["<body>"]
    div["<div .capture>"]
    btn["<button> (event destination)"]
    win --> doc --> body --> div --> btn
    classDef capture fill:#fff7e6,stroke:#f0a500,stroke-width:2px;
    class win,doc,body,div,btn capture;
```

`.capture` intercepts the event on its way down the DOM tree before child handlers run.

### Event Flow Complete Picture

```mermaid
sequenceDiagram
    participant Window
    participant Document
    participant Body
    participant Div
    participant Button
    Window->>Document: Capture
    Document->>Body: Capture
    Body->>Div: Capture (.capture)
    Div->>Button: Target
    Button-->>Div: Bubble (.trigger)
    Div-->>Body: Bubble
    Body-->>Document: Bubble
    Document-->>Window: Bubble
```

## Value Converters Pipeline

```mermaid
graph LR
    vm["View Model value: 299.99"] --> currency
    currency["currency:'USD'"] --> truncate
    truncate["truncate:10"] --> output[Rendered text]
    output --> final["$299.99..."]
```

### Converter Flow Detail

```mermaid
flowchart LR
    vm["price = 299.99"] --> currency
    currency["CurrencyConverter.toView(299.99, 'USD')<br/>→ '$299.99 USD'"] --> truncate
    truncate["TruncateConverter.toView('$299.99 USD', 10)<br/>→ '$299.99...' "] --> view["DOM"]
```

## Component Communication

### Parent → Child (Bindable Properties)

```mermaid
flowchart LR
    parent["Parent component<br/>user = { name: 'Alice', email: 'alice@ex.com' }"] --> bind["user.bind='user'"] --> child["<user-card> view<br/>@bindable user"]
```

```html
<user-card user.bind="user"></user-card>
```

### Child → Parent (Callback Binding)

Use `.bind` to pass a callback reference to the child now that the deprecated `.call` binding command is gone.

```mermaid
flowchart LR
    parent["Parent<br/>handleDelete(user)"] --> callback["on-delete.bind='handleDelete'"] --> child["Child<br/>@bindable onDelete"] --> action["deleteUser() → this.onDelete?.(this.user)"]
```

```html
<!-- Parent template -->
<user-card user.bind="user" on-delete.bind="handleDelete"></user-card>

// Child view-model
import { bindable } from '@aurelia/runtime-html';

export class UserCard {
  @bindable() public onDelete: (user: User) => void;

  deleteUser(): void {
    this.onDelete?.(this.user);
  }
}
```

## Form Checkbox Collections

```mermaid
flowchart TD
    products["products = [{ id:1, name:'Mouse' }, { id:2, name:'Keyboard' }]"] --> repeat["<label repeat.for='p of products'>"]
    repeat --> checkbox["<input type=checkbox<br/>model.bind='p.id'<br/>checked.bind='selectedIds'>"]
    checkbox --> logic{Checked?}
    logic -->|Yes| add[Add model value to selectedIds]
    logic -->|No| remove[Remove model value from selectedIds]
```

When the user checks "Keyboard", Aurelia pushes `2` into `selectedIds`. Unchecking "Mouse" removes `1`, keeping the array aligned with the checked boxes.

## Template Lifecycle

```mermaid
flowchart TD
    created[Component created] --> compiled[Template compiled]
    compiled --> binding[Binding lifecycle]
    binding --> bindingsConnected[Bindings connected]
    bindingsConnected --> bound[Bound lifecycle]
    bound --> attached[Attached lifecycle]
    attached --> active[Component active]
    active --> detaching[Detaching lifecycle]
    detaching --> unbinding[Unbinding lifecycle]
    unbinding --> removed[Component removed]
```

## Performance: Binding Modes Comparison

| Binding Mode | Setup Cost | Updates | Memory Footprint | Typical Use |
|--------------|------------|---------|------------------|-------------|
| `.one-time`  | Set value once | Never updates | No observers hooked up | Static text that never changes |
| `.one-way` / `.to-view` | Set value + observer | Whenever property changes | One source observer | Displaying reactive state |
| `.bind` (.two-way) | Bidirectional observers | View ↔ ViewModel | Source observer + DOM listener | Form controls that read/write |

Internals note: the `PropertyBinding.bind` implementation wires observers based on the binding mode flags. `.one-time` evaluates the expression once without connecting, `.one-way` connects the source side so it can re-run when dependencies change, and `.bind`/`.two-way` also subscribes to the target observer (for example, an input element) so user input flows back to the view model. This mirrors the logic in `packages/runtime-html/src/binding/property-binding.ts` where `toView`, `fromView`, and `oneTime` determine which observers are created.

## Computed Properties Reactivity

```ts
items = [
  { price: 10, qty: 2 },
  { price: 20, qty: 1 }
];

get total() {
  return this.items.reduce((sum, item) => sum + item.price * item.qty, 0);
}
```

```mermaid
flowchart LR
    items[items array] --> getter[Get total]
    getter --> view["<p>Total: ${total}</p>"]
    priceChange["items[0].price = 15"] --> dirtyCheck["Aurelia detects dependency change"] --> getter
```

Aurelia re-runs getters whenever any accessed dependency (the array itself or a member property) mutates, then propagates the new value into the DOM.

## Related Documentation

- [Template Syntax Overview](template-syntax/overview.md)
- [Cheat Sheet](CHEAT_SHEET.md)
- [Conditional Rendering](conditional-rendering.md)
- [List Rendering](repeats-and-list-rendering.md)
- [Event Binding](template-syntax/event-binding.md)
- [Value Converters](value-converters.md)
