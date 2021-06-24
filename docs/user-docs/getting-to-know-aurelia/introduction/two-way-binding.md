# Two-way binding

Two-way binding allows values to be bound in both directions, which can be a fantastic way to share data between components and within your views. A two-way binding will observe your binding values for changes and update both parent and child.

## Using two-way binding

Much like most facets of binding in Aurelia, two-way binding is intuitive. Instead of `.bind` you use `.two-way` if you need to be explicit, but in most instances, you will specify the type of binding relationship a bindable property is using `@bindable` instead.

**Explicit two-way binding looks like this:**

```text
<input type="text" value.two-way="myVal">
```

Whenever the text input is updated, the `myVal` variable will get the new value. Similarly, if `myVal` were updated from within the view model, the input would get the updated value.

{% hint style="info" %}
When using `.bind` for input/form control values such as text inputs, select dropdowns and other form elements, Aurelia will automatically create a two-way binding relationship. So, the above example using a text input can be rewritten to just be `value.bind="myVal"` and it would still be a two-way binding.
{% endhint %}

## Setting the binding mode on bindable

When creating bindable properties in your custom attributes and elements, you can specify the default binding mode.

```text
import { bindable, BindingMode } from 'aurelia'; 

@bindable({ mode: BindingMode.twoWay }) someProp = '';
```

This allows you to create bindable properties that can be two-way without requiring developers to manually opt in and make it so.

