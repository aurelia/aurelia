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
- `array-observer`: Observer for mutation in array
- `collection-length-observer`: Observer for array length
- `collection-size-observer`: Observer for set or map size
- `computed-observer`: Observer for computed properties
- `map-observer`: Observer for mutation in Map
- `proxy-observer`: Observer for the mutation of object property value when proxy strategy is used (TODO: have a CE for testing that utilizes proxy strategy)
- `self-observer`: utilized for `@bindable`s with change handler
- `set-observer`: Observer for mutation in Set
- `setter-observer`: Observer for the mutation of object property value when getter-setter strategy is used (default strategy, therefore no special CE will be required)

#### Binding behaviors
- `debounce`: delays change
- `throttle`: limits change
- `priority`: prioritize the change (Not sure how to test that though in real life)
- `signals` : triggers update via custom signal

### `@aurelia/runtime-html`

#### Bindings
- `attribute`: binds values to view and view-model attribute
- `listener`: handle event binding between view and view model

#### Observation
- `attribute-ns-accessor`: Attribute accessor in a XML document/element that can be accessed via a namespace; wraps [`getAttributeNS`](https://developer.mozilla.org/en-US/docs/Web/API/Element/getAttributeNS). Skipped for now, considering niche usages.
- `checked-observer`: observes checked property of `input[type=checkbox]` and `input[type=radio]`. Supports binding collection to checked value, and with custom matcher (compare function).
- `class-attribute-accessor`: manipulates class attributes for an element.
- `data-attribute-observer`: observes non-class, and non-style HTML attributes.
  ```html
  <div aria-disabled.attr="disabled">
  ```
- `element-attribute-observer`: handles mutation of `style` and `class` attributes via VM properties.
  ```html
  <div selected.class="selected">
  <div background.style="bg">
  ```
- `element-property-accessor`: handles mutation of other attributes via VM properties.
- `select-value-observer`: handles selection of options in `<select>` element.
- `style-attribute-accessor`: inline style accessor

#### Binding behaviors
- `attr`: wrapper for data attribute observer.
- `self`: triggers function iff the event originated from this element and not bubbled up from any child element.
- `update-trigger`: registers event as update trigger

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
- `setter-observer`
- `attribute` binding
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

##### Edit form

- checkbox:
  - single boolean checkbox: `checked-observer` simple case
  - collection of checkboxes:
    - bound to array of models: `checked-observer` with collection as value
    - with custom matcher
- collection of radios:
  - simple id-value pair case
  - bind model
  - bind matcher
  - bind boolean
- card selector: displays a list of cards and applies a special css class and inline style (I know this is hypothetical, just grouping this here) on the selected card. Should cover `class-attribute-accessor`, `style-attribute-accessor`, and `element-attribute-observer`. Additionally, it applies a `src` attribute on the card images which should cover `data-attribute-accessor`.
- `<select>`
  - single select
    - simple id-value pair case
    - bind model
    - bind matcher
    - bind boolean
  - multi-select
    - simple id-value pair case
    - bind model
    - bind matcher
    - bind boolean

##### Specs viewer
**Postponed**
List of dynamic appels and oranges.
Targets: `<compose>`, and repeater.

##### Random number generator
A `div` with a random number (as easier to generate :)) + plus a button that does something (for example console.logs the text).
When the `div` is clicked, a new number is generated.
Targets `self` binding behavior, as the button click does not trigger the change of number.

**NOTE:**
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

#### Hypothetical examples

The following does not work:

```typescript
  public get organizationNonVolatile() {
    return `${this.organization}, ${this.location}`;
  }
  public set organizationNonVolatile(value: string) {
    this.organization = value;
  }

  @computed({ volatile: true })
  public get organizationVolatile() {
    return `${this.organization}, ${this.location}`;
  }
  public set organizationVolatile(value: string) {
    this.organization = value;
  }
```
