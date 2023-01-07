# Errors

## Error messages

Encountered an error and looking for answers? You've come to the right place.

{% hint style="danger" %}
This section is a work in progress and not yet complete. If you would like to help us document errors in Aurelia, we welcome all contributions.
{% endhint %}

Coded error in Aurelia comes with format: `AURxxxx:yyyy` where:

* `AUR` is the prefix to indicate it's an error from Aurelia
* `xxxx` is the code
* `:` is the delimiter between the prefix, code and the dynamic information associated with the error
* `yyyy` is the extra information, or parameters related to the error

The section below will list errors by their prefix, and code and give a corresponding explanation, and a way to fix them.

### Dependency Injection Errors (from 0001 to 0015)

Dependency Injection errors can be found [here](0001-to-0015/).

### Template Compiler Errors (From 701-749)

| Error Code | Description                                                                                                                                         |
| ---------- | --------------------------------------------------------------------------------------------------------------------------------------------------- |
| AUR0701    | This happens when a template has a single template element in your template, and it has `as-local-element` attribute on it                          |
| AUR0702    | This happens when a template has one or more attributes that are supposed to be unique on its surrogate elements                                    |
| AUR0703    | This happens when a template controller attribute is used on a surrogate element of a template                                                      |
| AUR0704    | This happens when an attribute on a `<let/>` element is used without `.bind` or `.to-view` command                                                  |
| AUR0705    | This happens when enhancing a template with one or more element in it already have a class `au` on it                                               |
| AUR0706    | This happens when `[au-slot]` attribute is used on an element that is not an immediate child of a custom element                                    |
| AUR0707    | This happens when the template compiler encounters binding to a non-bindable property of a custom attribute                                         |
| AUR0708    | This happens when the template of a custom element has nothing beside template elements with `as-local-element`                                     |
| AUR0709    | This happens when an `as-local-element` template is not defined as an immediate child of the root of a custom element template                      |
| AUR0710    | This happens when an `as-local-element` template has a `<bindable>` element inside its template, that is not not an immediate child of its fragment |
| AUR0711    | This happens when a `<bindable>` inside an `as-local-element` template does not have a valid `property` attribute on it                             |
| AUR0712    | This happens when an `as-local-element` template has 2 or more `<bindable>` elements with non-unique `attribute` or `property` attributes           |
| AUR0713    | This happens when an unknown binding command is encountered in a custom element template                                                            |
| AUR0714    | This happens when a custom element or attribute definition has more than 1 primary bindable property                                                |
| AUR0715    | This happens when an `as-local-template` template has the value of `as-local-template` as an empty string                                           |
| AUR0716    | This happens when a custom element has 2 or more local elements with the same name                                                                  |

### Templating Errors (From 750-800)

| Error Code | Description                                                                                                                                                                  |
| ---------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| AUR0750    | This happens when there is a binding that looks like this `view.ref="..."`. This likely comes from a v1 template migration.                                                  |
| AUR0751    | This happens when there is a `ref` binding in the template that does not have matching target. Most likely a custom attribute reference                                      |
| AUR0752    | This happens when a controller renders a custom element instruction that it doesn't have a registration. Normally happens in hand-crafted definition                         |
| AUR0753    | This happens when a controller renders a custom attribute instruction that it doesn't have a registration. Normally happens in hand-crafted definition                       |
| AUR0754    | This happens when a controller renders a template controller instruction that it doesn't have a registration. Normally happens in hand-crafted definition                    |
| AUR0755    | This happens when a view factory provider tries to resolve but does not have a view factory associated                                                                       |
| AUR0756    | This happens when a view factory provider tries to resolve but the view factory associated does not have a valid name                                                        |
| AUR0757    | This happens when `IRendering.render` is called with different number of targets and instructions                                                                            |
| AUR0758    | This happens when `BindingCommand.getDefinition` is called on a class/object without any binding command metadata associated                                                 |
| AUR0759    | This happens when `CustomAttribute.getDefinition` is called on a class/object without any custom attribute metadata associated                                               |
| AUR0760    | This happens when `CustomElement.getDefinition` is called on a class/object without any custom element metadata associated                                                   |
| AUR0761    | This happens when `CustomElementDefinition.create` is called with a string as first parameter                                                                                |
| AUR0762    | This happens when `CustomElement.for` is called on an element that does not have any custom element with a given name, without searching in ancestor elements                |
| AUR0763    | This happens when `CustomElement.for` is called and Aurelia isn't able to find any custom element with the given name in the given element, or its ancestors                 |
| AUR0764    | This happens when `CustomElement.for` is called on an element with a given name, and Aurelia is unable to find any custom element in the given the element, or its ancestors |
| AUR0765    | This happens when `CustomElement.for` is called on an element without a given name, and Aurelia is unable to find any custom element in the given element, or its ancestors  |
| AUR0766    | This happens when `@processContent` is called with a string as its first parameter, and Aurelia couldn't find the method on the decorated class                              |
| AUR0767    | This happens when `root` property on an `Aurelia` instance is access before at least one application has been started with this `Aurelia` instance                           |
| AUR0768    | This happens when a new `Aurelia` is created with a predefined container that already has `IAurelia` registration in it, or its ancestors                                    |
| AUR0769    | This happens when an `Aurelia` application is started with a document fragment before it's adopted by a document                                                             |
| AUR0770    | This happens when `Aurelia.prototype.start` is called with a `null`/`undefined` value as the first parameter                                                                 |
| AUR0771    | This happens when `Aurelia.prototype.dispose` is called before the instance is stopped                                                                                       |
| AUR0772    | This happens when the `@watch` decorator is used without a valid first parameter                                                                                             |
| AUR0773    | This happens when the `@watch` decorator is used and Aurelia is not able to resolve the first parameter to a function                                                        |
| AUR0774    | This happens when the `@watch` decorator is used on a class property instead of a method                                                                                     |

### HTML observation errors

| Error Code | Description                                                                                                                                                                     |
| ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| AUR0651    | This happens when the binding created `.attr` binding command is forced into two way mode against any attribute other than `class`/`style`                                      |
| AUR0652    | This happens when the default `NodeObserverLocator.getObserver` is called with an object and property combo that it doesn't know how to observe, and dirty checking is disabled |
| AUR0653    | This happens when `NodeObserverLocator` property->observation events mapping is getting overridden                                                                              |
| AUR0654    | This happens when a `<select>` element is specified `multiple`, but the binding value is not an array                                                                           |

### Controller errors

| Error Code | Description                                                                                              |
| ---------- | -------------------------------------------------------------------------------------------------------- |
| AUR0500    | This happens when `Controller.getCachedOrThrow` throws                                                   |
| AUR0501    | This happens when a custom element is specified `containerless` and has `<slot>` element in its template |
| AUR0502    | This happens when a disposed controller is being activated                                               |
| AUR0503    | This happens when the internal state of a controller is corrputed during activation                      |
| AUR0504    | This happens when a synthetic view is activated without a proper scope                                   |
| AUR0505    | This happens when the internal state of a controller is coruppted during deactivation                    |
| AUR0506    | This happens when Aurelia fails to resolve a function from the first parameter of a `@watch` decorator   |

### Default resources errors

| Error Code | Description                                                                                                                   |
| ---------- | ----------------------------------------------------------------------------------------------------------------------------- |
| AUR0801    | This happens when `& self` binding behavior is used on non-event binding                                                      |
| AUR0802    | This happens when `& updateTrigger` binding behavior is used without any arguments                                            |
| AUR0803    | This happens when `& updateTrigger` binding behavior is used on binding without view -> view model observation                |
| AUR0804    | This happens when `& updateTrigger` binding behavior is used on binding that does not target a DOM element                    |
| AUR0805    | This happens when `<au-compose>` `scopeBehavior` property is assigned a value that is not either `auto` or `scoped`           |
| AUR0806    | This happens when `<au-compose>` `view-model` binding is used with a custom element with `containerless = true`               |
| AUR0807    | This happens when there's a corrupted internal state of `<au-compose>` and activation is called twice                         |
| AUR0808    | This happens when there's a corrupted internal state of `<au-compose>` and deactivation is called twice                       |
| AUR0809    | This happens when `<au-render>` `component` binding is given a string value, and there's no custom element with matching name |
| AUR0810    | This happens when `else` attribute does not follow an `if` attribute                                                          |
| AUR0811    | This happens when `portal` attribute is a given an empty string as CSS selector for`target`, and `strict` mode is on          |
| AUR0812    | This happens when `portal` attribute couldn't find the target element to portal to, and `strict` mode is on                   |
| AUR0813    | This happens when `then`/`catch`/`pending` attributes is used outside of a `promise` attribute                                |
| AUR0814    | This happens when the internal of the `repeat` attribute get into a race condition and is corrupted                           |
| AUR0815    | This happens when `case`/`default-case` attributes is used outside of a `switch` attribute                                    |
| AUR0816    | This happens when there are multiple `default-case` attributes inside a `switch` attribute                                    |
| AUR0817    | This happens when `& signal` binding behavior is used on binding that does not have `handleChange` method                     |
| AUR0818    | This happens when `& signal` binding behavior is used without a valid name (non empty)                                        |

### Plugin errors

| Error Code | Plugin name | Description                                                                                                                        |
| ---------- | ----------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| AUR0901    | Dialog      | This happens when an application is closed with some dialogs still open                                                            |
| AUR0902    | Dialog      | This happens when `DialogController` injection is requested. It's a error prevention for v1->v2 migration of the dialog plugin     |
| AUR0903    | Dialog      | This happens when `IDialogService.open` is called without both `component` and `template` property                                 |
| AUR0904    | Dialog      | This happens when the default configuration of the dialog plugin is used, as there's no registration associated for key interfaces |

## Runtime module

### AST errors (from 101 to 150)

| Error Code | Description                                                                                                             |
| ---------- | ----------------------------------------------------------------------------------------------------------------------- |
| AUR0101    | This happens when Aurelia couldn't find a binding behavior specified in an expression                                   |
| AUR0102    | This happens when there are two binding behaviors with the same name in an expression                                   |
| AUR0103    | This happens when a value converter for a given name couldn't be found during the evaluation of an expression           |
| AUR0104    | This happens when a value converter for a given name couldn't be found during the assignment of an expression           |
| AUR0105    | This happens when the special `$host` contextual property is accessed but no thing is found in the scope tree           |
| AUR0106    | This happens when an expression looks like this `$host = ...`, as `$host` is a readonly property                        |
| AUR0107    | This happens when a call expression is evaluated but the object evaluated by the expression isn't a function            |
| AUR0108    | This happens when a binary expression is evaluated with an unknown operator                                             |
| AUR0109    | This happens when an unary expression is evaluated with an unknown operator                                             |
| AUR0110    | This happens when a tagged template (function call) is but the function specified isn't a function                      |
| AUR0111    | This happens when a function call AST is evaluated but no function is found                                             |
| AUR0112    | This happens when a non-object or non-array value is assigned for destructured declaration for a `repeat.for` statement |

### Parser errors (from 151-200)

| Error Code | Description                                                                                     |
| ---------- | ----------------------------------------------------------------------------------------------- |
| AUR0151    | An expression has an invalid character at the start                                             |
| AUR0152    | An expression has `..` or `...`                                                                 |
| AUR0153    | The parser encounters an unexpected identifier in an expression                                 |
| AUR0154    | The parser encounters an invalid `AccessMember` expression                                      |
| AUR0155    | The parers encounters an unexpected end in an expression                                        |
| AUR0156    | The parser encounters an unconsumable token in an expression                                    |
| AUR0158    | The expression has an invalid assignment                                                        |
| AUR0159    | An expression has no valid identifier after the value converter \` \| \` symbol                 |
| AUR0160    | An expression has no valid identifier after the binding behavior `&` symbol                     |
| AUR0161    | The parser encounters an invalid `of` keyword                                                   |
| AUR0162    | The parser encounters an unconsumed token                                                       |
| AUR0163    | The parser encounters an invalid binding identifier at left hand side of an `of` keyword        |
| AUR0164    | The parser encounters a literal object with a property declaration that it doesn't understand   |
| AUR0165    | An expression has an opening string quote `'` or `"`, but no matching ending quote              |
| AUR0166    | An expression has an opening template string quote \`\`\`, but has no matching end              |
| AUR0167    | The parser encounters an unexpected token                                                       |
| AUR0168    | The parser encounters an unexpected character                                                   |
| AUR0169    | The parser encounters an unexpected character while parsing destructuring assignment expression |

### Others (from 200-300)

| Error Code | Description                                                                                                  |
| ---------- | ------------------------------------------------------------------------------------------------------------ |
| AUR0201    | `BindingBehavior.getDefinition` is called on a class/object without any binding behavior metadata associated |
| AUR0202    | `ValueConverter.getDefinition` is called on a class/object without any value converter metadata associated   |
| AUR0203    | `BindingContext.get` is called with `null`/`undefined` as the first parameter                                |
| AUR0204    | `Scope.fromOverride` is called with `null`/`undefined` as the first parameter                                |
| AUR0205    | `Scope.fromParent` is called with `null`/`undefined` as the first parameter                                  |
| AUR0206    | `ConnectableSwitcher.enter` is called with `null`/`undefined` as the first parameter                         |
| AUR0207    | `ConnectableSwitcher.enter` is called with the currently active connectable                                  |
| AUR0208    | `ConnectableSwitcher.exit` is called with `null`/`undefined` as the first parameter                          |
| AUR0209    | `ConnectableSwitcher.exit` is called with an inactive connectable                                            |
| AUR0210    | `getCollectionObserver` is called with an not-supported collection type                                      |
| AUR0211    | a binding subscried to an observer, but does not implement method `handleChange`                             |
| AUR0212    | a binding subscribed to a collection observer, but does not implement method `handleCollectionChange`        |
| AUR0220    | a `Set`/`Map` size observer `.setValue` method is called                                                     |
| AUR0221    | the `setValue` method on a computed property without a setter                                                |
| AUR0222    | Aurelia doesn't know how to observe a property on an object, and dirty checking is disabled                  |
| AUR0224    | Encounters an invalid usage of `@observable`                                                                 |
| AUR0225    | An effect is attempted to run again, after it has stopped                                                    |
| AUR0226    | An effect has reach its limit of recursive update                                                            |
