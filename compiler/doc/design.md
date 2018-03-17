## Compilation Process

### Custom Element / Custom Attribute

* Condition:
  * Exported class
  * `/\w+CustomElement$/.test(ClassName) === true` or `@customElement`
* Action
  * Unexport the class
  * Rename to `$[OriginalName]` (`$` for private convention)
  * Remove `customElement` decorator (if any)
  * Build metadata of `bindable` properties and remove `@bindable` decorators (if any)

### Template for [CustomElement]

* Extract binding to derived class of `AbstractBinding`
* Mark each element with at least 1 binding by class `au`
* Generate view class with name of view model class

### Template Syntax

#### Life Cycle Hooks transformation

| Feature                   | Runtime | Spec     | Compiler |
| ------------------------- | ------- | -------- | -------- |
| `bind()`                  |    ❌   |  ❌     |  ❌      |
| `created()`               |    ❌   |  ❌     |  ❌      |
| `bind()`                  |    ❌   |  ❌     |  ❌      |
| `attached()`              |    ❌   |  ❌     |  ❌      |
| `detached()`              |    ❌   |  ❌     |  ❌      |
| `unbind()`                |    ❌   |  ❌     |  ❌      |
| `processContent()`        |    ❌   |  ❌     |  ❌      |
| `processAttribute()`      |    ❌   |  ❌     |  ❌      |


#### Template Syntax
| Feature                           | Runtime | Spec     | Compiler |
| --------------------------------- | ------- | -------- | -------- |
| `<div>`                           |  ✅     |  ✅      |  ✅      |
| `<div>${exp1} ${exp2}</div>`      |  ✅     |  ✅      |  ✅      |
| `<div attr='value'>`              |  ✅     |  ✅      |  ✅      |
| `<div click.trigger="stmt">`      |  ✅     |  ✅      |  ✅      |
| `<div click.delegate="stmt">`     |  ✅     |  ✅      |  ✅      |
| `<div click.capture="stmt">`      |  ✅     |  ✅      |  ✅      |
| `<div ref='bar'>`                 |  ✅     |  ✅      |  ❌      |
| `<div view-model.ref="bar">`      |  ✅     |  ✅      |  ❌      |
| `<div element.ref="bar">`         |  ✅     |  ✅      |  ❌      |
| `<div baz.ref="bar">`             |  ✅     |  ✅      |  ❌      |
| `<div class="au fa-${name}!">`    |  ✅     |  ✅      |  ✅      |
| `<div attr.bind="exp">`           |  ✅     |  ✅      |  ✅      |
| `<div class.bind="exp">`          |  ✅     |  ✅      |  ✅      |
| `<div class-name.bind="exp">`     |  ✅     |  ✅      |  ✅      |
| `<div style.bind="exp">`          |  ✅     |  ✅      |  ❌      |
| `<div style="width: ${exp}; ..">` |  ✅     |  ✅      |  ❌      |


#### Content Projection
| Feature                         | Runtime | Spec     | Compiler |
| ------------------------------- | ------- | -------- | -------- |
| `<slot>`                        |  ✅     |  ✅     |  ❌      |
| `<slot name="...">`             |  ✅     |  ✅     |  ❌      |


#### Bootstrapping
| Feature                             | Runtime|   Spec  | Runtime |
| ----------------------------------- | -------| ------- | ------- |
| `start()`                           |  ❌    |   ❌    |  ❌     |

