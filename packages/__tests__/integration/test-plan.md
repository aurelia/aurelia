### `@aurelia/runtime`

#### Bindings
- `call-binding`

  Assigns the result of the method call to the attribute.

  ```html
  <el attr="func()"></el>
  ```
- `interpolation-binding`

  Evaluates interpolation expression.
- `let-binding`

  Local variable evaluated on runtime (new property added to VM).
- `property-binding`

  Binds evaluated source expression to the VM properties or DOM attributes.

  Modes:
  - one time
  - to view
  - from view
  - two way
- `ref-binding`

  Captures the reference to DOM elements, CE, and CE VMs.

#### Observers
- `array-observer`: Observer for mutation in array?
- `collection-length-observer`: Observer for array length
- `collection-size-observer`: Observer for set or map size
- `computed-observer`: Observer for computed properties
- `map-observer`: Observer for mutation in Map?
- `proxy-observer`: Observer for the mutation of object property value when proxy strategy is used (TODO: have a CE for testing that utilizes proxy strategy)

### Test plan

#### Atoms

##### Read-only textual CE

**Usage:**

```html
<my-text value.bind="val-expr"></my-text>
```
TODO: need better name than `my-text`.

**Definition:**

```html
${value}
```

**Potential coverage targets**

- interpolation binding
- call-binding (with the help of a higher-level CE that binds the value using a method call)
- i18n (maybe later)

##### Text input

**Usage:**

```html
<text-input value.bind="val-expr"></text-input>
```

**Definition:**

```html
<input value.bind="value" >
```

**Potential coverage targets**

- `two-way` binding mode

#### Molecules

##### Greeting

**Usage:**

```html
<greeting name.bind="expr" is-birthday.bind="expr"></greeting>
```

**Definition:**

```html
<my-text value.bind="getGreeting()"></my-text>
```

**Potential coverage targets**

- call-binding
- property-binding

##### User preference control

Displays the currently logged in user information.
User object can be bound to the CE using `one-time` binding mode.
Uses `greeting` CE to display greeting to the user using `to-view` binding mode.

Displays a list of supported locales, and enable selection.

**Potential coverage targets**

- `one-time` binding mode
- `to-view` binding mode
- `computed-observer` (`dirty-checker` transitive dep) via a `User` class which has a computed `fullName` property. An instance of `User` is bound to this control
- `map-observer` via locales dialog + non real life actions of adding and removing locales

##### Boolean AND, OR demonstrator

Though this is not a real-life CE, this is ideal for demonstrating `let-binding`.
There can be 2 boolean properties say, `A`, and `B`, and there can be 2 `let` bindings `A AND B`, and `A OR B`.
Then on change, the change can be asserted.

**Potential coverage targets**

- let-binding

##### Data-grid

Shows a collection of objects in a table (read-only).
Q: what is the `@processContent` equivalent in vNext?

An add and a delete button can add or remove line item from the grid.

**Potential coverage targets**

- iterator
- `to-view` binding
- `ref` binding
  - DOM element: to HTML table to mark selection of rows (CSS class is added to row)
  - View-model: to Grid view model to programmatically select rows (this needs to be done in client code)
- `array-observer`, `collection-length-observer` due to change in collection due to add and remove actions

##### Pagination

Simplest pagination control; mockup: "Page n of N   Previous page  Next page"
Populates the current page (for data-grid).

**Potential coverage targets**

- `from-view` binding mode (in the client code) for the current page.
