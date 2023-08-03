### `@aurelia/runtime`

#### Bindings
- [x]`call-binding`: `<el action.call="doSoemthing()"></el>`
- [x] `interpolation-binding`: Evaluates interpolation expression.
- [x] `let-binding`: Local variable evaluated on runtime (new property added to VM).
- [x] `property-binding`: Binds evaluated source expression to the VM properties or DOM attributes.
      Modes:
      - one time
      - to view
      - from view
      - two way
- [ ] `ref-binding`

  Captures the reference to DOM elements, CE, and CE VMs.

#### Observers
- [x] `array-observer`: Observer for mutation in array
- [ ] `collection-length-observer`: Observer for array length
- [ ] `collection-size-observer`: Observer for set or map size
- [x] `computed-observer`: Observer for computed properties
- [x] `map-observer`: Observer for mutation in Map
- [ ] `proxy-observer`: Observer for the mutation of object property value when proxy strategy is used (TODO: have a CE for testing that utilizes proxy strategy)
- [ ] `self-observer`: utilized for `@bindable`s with change handler
- [ ] `set-observer`: Observer for mutation in Set
- [x] `setter-observer`: Observer for the mutation of object property value when getter-setter strategy is used (default strategy, therefore no special CE will be required)

#### Binding behaviors
- `debounce`: delays change
- `throttle`: limits change
- `priority`: prioritize the change (Not sure how to test that though in real life)
- `signals` : triggers update via custom signal

### `@aurelia/runtime-html`

#### Bindings
- [ ] `attribute`: binds values to view and view-model attribute. Postponed, as JIT integration needed (see `element-attribute-observer`).
- [x] `listener`: handle event binding between view and view model

#### Observation
- [ ] `attribute-ns-accessor`: Attribute accessor in a XML document/element that can be accessed via a namespace; wraps [`getAttributeNS`](https://developer.mozilla.org/en-US/docs/Web/API/Element/getAttributeNS). Skipped for now, considering niche usages.
- [x] `checked-observer`: observes checked property of `input[type=checkbox]` and `input[type=radio]`. Supports binding collection to checked value, and with custom matcher (compare function).
- [x] `class-attribute-accessor`: manipulates class attributes for an element.
- [x] `data-attribute-observer`: observes non-class, and non-style HTML attributes.
  ```html
  <div aria-disabled.attr="disabled">
  ```
- [ ] `element-attribute-observer`: handles mutation of `style` and `class` attributes via VM properties. Postponed as JIT integration is needed (following patterns are coming from JIT).
  ```html
  <div selected.class="selected">
  <div background.style="bg">
  ```
- [x] `element-property-accessor`: handles mutation of other attributes via VM properties.
- [x] `select-value-observer`: handles selection of options in `<select>` element.
- [x] `style-attribute-accessor`: inline style accessor
- [x] `value-attribute-observer`: observer for `[value]` (input)

#### Binding behaviors
- [x] `attr`: wrapper for data attribute observer. Postponed, seems like an old artifact.
- [x] `self`: triggers function iff the event originated from this element and not bubbled up from any child element.
- [ ] `update-trigger`: registers event as update trigger

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
- ~~call-binding (with the help of a higher-level CE that binds the value using a method call)~~
- i18n (maybe later)
- `setter-observer`
- ~~`attribute` binding~~
- `ElementPropertyAccessor` (for `textContent`)

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
- `value-attribute-observer`

##### Text input with predefined events as update trigger

Targets `updateTrigger` binding behavior.

~~##### Text input with blur effect~~

~~Targets `blur` custom attribute.~~
Ignored as it already has pretty good coverage

#### Molecules

##### User preference control

Displays the currently logged in user information.
User object can be bound to the CE using `one-time` binding mode.

Displays a list of supported locales, and enable selection.

**Potential coverage targets**

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
- `debounce` binding behavior via a search textbox for filtering the items in grid

##### Pagination

Simplest pagination control; mockup: "Page n of N   Previous page  Next page"
Populates the current page (for data-grid).

**Potential coverage targets**

- `from-view` binding mode (in the client code) for the current page.
- `listener` binding (from previous/next page)

##### Set display control

Simple CE that has `@bindable` set of objects, which are displayed by simply calling the `toString` method on the objects.
The client code using this CE can add/remove items to/from the set.

**Potential coverage targets**
- `set-observer`

##### Interest index

CE that can be used to display number of user currently looking at the current topic.
Actually, this is a CE that displays a count (of whatever). The underlying property gets updated in every 100ms, but the display is updated in every 300ms via `throttle` binding behavior.

**Potential coverage targets**
- `throttle` binding behavior

##### Session duration

Shows the remaining time the current session will stay active.
The update of the display is triggered every 2 seconds via a signal.

**Potential coverage targets**
- `signal` binding behavior

##### Edit form elements

- [x] checkbox:
  - [x] single boolean checkbox: `checked-observer` simple case
  - [x] collection of checkboxes:
    - [x] bound to array of models: `checked-observer` with collection as value
    - [x] with custom matcher
- [x] collection of radios:
  - [x] simple id-value pair case
  - [x] bind model
  - [x] bind matcher
  - [x] bind boolean
- [x] card selector: displays a list of cards and applies a special css class and inline style (I know this is hypothetical, just grouping this here) on the selected card. Should cover `class-attribute-accessor`, `style-attribute-accessor`. Additionally, it applies a `src` attribute on the card images which should cover `data-attribute-accessor`.
- [x] `<select>`
  - [x] single select
    - [x] simple id-value pair case
    - [x] bind model
    - [x] bind matcher
    ~~- bind boolean~~
  - [x] multi-select
    - [x] simple id-value pair case
    - [x] bind model
    - [x] bind matcher

##### Specs viewer
**Postponed**
List of dynamic appels and oranges.
Targets: `<compose>`, and repeater.

##### Random number generator
A `div` with a random number (as easier to generate :)) + plus a button that does something (for example console.logs the text).
When the `div` is clicked, a new number is generated.
Targets `self` binding behavior, as the button click does not trigger the change of number.


#### NOTE
custom attributes with multiple bindables in different variants (one named value, none named value, with/without the default specified, with/without mode, with/without multi expressions, etc)

From rluba:
But that’s not the only problem! I’ve removed the toggle and changed the dropdown to:
```typescript
@customAttribute('au-dropdown')
export class AuDropdown {
    @bindable appendToBody: boolean;
    @bindable({mode: BindingMode.twoWay}) open = false;
    openChanged() {
        console.log('Open changed', this.open);
    }
    appendToBodyChanged() {
        console.log('Append', this.appendToBody);
    }
}
```

The usage code looks like this:
```html
<li au-dropdown="append-to-body.bind: true; open.bind: ddopen" class="nav-item">
```

The result?
`appendToBodyChanged` gets called and `appendToBody` is set to the string `append-to-body.bind: true; open.bind: ddopen` (so the whole attribute value of au-dropdown). How on earth can that happen?
