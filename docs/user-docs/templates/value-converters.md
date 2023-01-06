# Value converters (pipes)

Use value converters to transform how values are displayed in your applications. You can use value converters to transform strings, format dates, currency display and other forms of manipulation. They can be used within interpolation and bindings, working with data to and from the view.

If you have worked with other libraries and frameworks, you might know value converters by another name; pipes.

## Understanding value converter data flow

Most commonly, you'll be creating value converters that translate model data to a format suitable for the view; however, there are situations where you'll need to convert data from the view to a format expected by the view model, typically when using two-way binding with input elements.

### toView

The `toView` method always receives the supplied value as the first argument, and subsequent parameters are configuration values (if applicable). This specifies what happens to values going to the view and allows you to modify them before display.

### fromView

The `fromView` method always receives the supplied value as the first argument, and subsequent parameters are configuration values (if applicable). This specifies what happens to values going out of the view to the view model and allows you to modify them before the view model receives the changed value.

## Using value converters

To apply a value converter, you use the pipe `|` character followed by the name of the value converter you want to use. If you have worked with Angular before, you would know value converters as pipes.

While Aurelia itself comes with no prebuilt value converters, this is what using them looks like for an imaginary value converter that converts a string to lowercase.

```markup
<h1>${someValue | toLowercase}</h1>
```

The code for this value converter might look something like this:

```typescript
export class ToLowercaseValueConverter {
    toView(value) {
        return value.toLowerCase();
    }
}
```

## Transforming data using multiple value converters and parameters

### Multiple value converters

Value converters can be chained, meaning you can transform a value and then transform it through another value converter. To chain value converters, you separate your value converters using the pipe `|`. In this fictitious example, we are making our value lowercase and then running it through another value converter called bold which will wrap it in `strong` tags to make it bold.

```markup
<h1>${someValue | toLowercase | bold }</h1>
```

### Parameter based value converters

You can also create value converters that accept one or more parameters. For value converters that format data, you might want to allow the developer to specify what that format is for say a currency or date formatting value converter.

Parameters are supplied using the colon `:` character, and like the pipe, for multiple parameters, you can chain them. Parameters can be supplied as one or more strings (passed through to the value converter method as one or more arguments) or a singular object.

#### Static parameters

```markup
<h1>${someValue | date:'en-UK'}
```

Furthermore, value converter parameters also support bound values. Unlike other types of binding, you only have to supply the variable, which will bind it for you.

#### Bound parameters

```markup
<h1>${someValue | date:format}
```

```typescript
export class MyApp {
    format = 'en-US';
}
```

#### Object parameters

If your value converter is going to have a lot of parameters, the existing approaches will fall apart quite quickly. You can specify your value converters take a single object of one or more parameters. Object parameters will also let you name them, unlike other parameters.

```html
<ul>
    <li repeat.for="user of users | sort: { propertyName: 'age', direction: 'descending' }">${user.name}</li>
</ul>
```

On our `fromView` and `toView` methods, the second argument will be the supplied object we can reference.

## Creating value converters

Create custom value converters that allow you to format how your data is displayed and retrieved in your views.

Like everything else in Aurelia, a value converter is a class. A value converter that doesn't actually do anything might look like this. Nothing about this example is Aurelia-specific and is valid in Javascript.

```typescript
export class ThingValueConverter {
  toView(value) {
    return value;
  }
}
```

{% hint style="warning" %}
Value converters are always referenced as camelCase when used in your templates.
{% endhint %}

To teach you how value converters can be created, we will create a simplistic value converter called date, allowing us to format dates.

In this example, we will use a decorator `valueConverter` to decorate our class. While you can use the `ValueConverter` naming convention as we did above, it's important to learn the different ways you can create value converters.

{% code title="date-value-converter.ts" %}
```typescript
import { valueConverter } from 'aurelia';

@valueConverter('date')
export class FormatDate {
  toView(value: string, locale = 'en-US') {
    const date = new Date(value);

    // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/DateTimeFormat/DateTimeFormat
    const format = Intl.DateTimeFormat(locale, {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
      timeZone: 'UTC'
    });

    if (Number.isNaN(date.valueOf())) {
      return 'Invalid Date';
    }

    return format.format(date);
  }
}
```
{% endcode %}

Import your value converter in your view

```html
<import from="./date-value-converter" />
```

This example value below will display `June 22, 2021` in your view. Because our default date format is US, it will display as month-date-year.

```html
<p>${'2021-06-22T09:21:26.699Z' | date}</p>
```

The locale parameter that we specified in our value converter supports a locale parameter, which allows us to change how our dates are displayed. Say you're in the UK or Australia. The default format is then date-month-year.

```html
<p>${'2021-06-22T09:21:26.699Z' | date:'en-GB'}</p>
```

To see our value converter in action, here is what it looks like:

{% embed url="https://stackblitz.com/edit/aurelia-date-value-converter?embed=1&file=my-app.html&hideExplorer=1&view=preview" %}
