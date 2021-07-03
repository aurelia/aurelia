# Class binding

## Binding to the class attribute

The class binding allows you to bind one or more classes to an element and its native `class` attribute.

### Binding to a single class

Adding or removing a single class value from an element can be done using the `.class` binding. By prefixing the `.class` binding with the name of the class you want to conditionally display, for example, `selected.class="myBool"` you can add a selected class to an element. The value you pass into this binding is a boolean value \(either true or false\), if it is `true` the class will be added, otherwise, it will be removed.

```text
<p selected.class="isSelected">I am selected (I think)</p>
```

Inside of your view model, you would specify `isSelected` as a property and depending on the value, the class would be added or removed. 

Here is a working example of a boolean value being toggled using `.class` bindings.

{% embed url="https://stackblitz.com/edit/aurelia-conditional-class?embed=1&file=my-app.html&hideExplorer=1&hideNavigation=1&view=preview" %}

### Binding to multiple classes

Unlike singular class binding, you cannot use the `.class` binding syntax to conditionally bind multiple CSS classes. However, there is a multitude of different ways in which this can be achieved.

| Syntax | Input Type | Example |
| :--- | :--- | :--- |
| `class.bind="someString"` | `string` | `'col-md-4 bg-${bgColor}'` |
| `class="${someString}"` | `string` | `col-md-4 ${someString}` |

