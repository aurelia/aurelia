---
description: Get to know Aurelia's value converters (pipes) and how to use them to transform data in your templates.
---

# Value Converters (Pipes)

Value converters transform data as it flows between your view and view model. They're ideal for formatting text, dates, currencies, and more. In other frameworks, you might know them as pipes.

Aurelia 2 provides a comprehensive value converter system with support for bidirectional conversion, signals-based reactivity, context awareness, and flexible registration patterns.

## Data Flow

Converters work in two directions:

- **toView**: Prepares model data for display.
- **fromView**: Adjusts view data before updating the model (useful with two-way binding).

Both methods receive the primary value as the first argument, with any extra arguments used as configuration.

### Example Methods

```typescript
// toView: from model to view
toView(value, ...args) { /* transform value for display */ }

// fromView: from view to model
fromView(value, ...args) { /* transform value for the model */ }
```

## Applying Converters in Templates

Use the pipe symbol (`|`) to attach a converter:

```html
<h1>${someValue | toLowercase}</h1>
```

A matching converter might be:

```typescript
export class ToLowercaseValueConverter {
  toView(value) {
    return value.toLowerCase();
  }
}
```

### Chaining Converters

You can chain multiple converters by separating them with additional pipes:

```html
<h1>${someValue | toLowercase | bold}</h1>
```

### Passing Parameters

Pass parameters using a colon (`:`). Parameters can be:

- **Static**:
  ```html
  <h1>${someValue | date:'en-UK'}</h1>
  ```
- **Bound**:
  ```html
  <h1>${someValue | date:format}</h1>
  ```
  ```typescript
  export class MyApp {
    format = 'en-US';
  }
  ```
- **Object-based**:
  ```html
  <ul>
    <li repeat.for="user of users | sort: { propertyName: 'age', direction: 'descending' }">
      ${user.name}
    </li>
  </ul>
  ```

In both `toView` and `fromView`, the second parameter will be the passed configuration.

## Receiving the Caller Context

By default, value converters receive only the value to transform and any configuration parameters. In some advanced scenarios, you may need to know more about the *binding* or *calling context* that invoked the converter—for example, to adjust the transformation based on the host element, attributes, or other binding-specific state.

Aurelia 2 provides an **opt-in** mechanism to receive the binding instance itself as an additional parameter. To enable this feature:

1.  Add `withContext: true` to your value converter class:
    ```typescript
    import { valueConverter } from 'aurelia';

    @valueConverter({ name: 'myConverter' })
    export class MyConverter {
      public readonly withContext = true;

      public toView(value, caller, ...args) {
        // `caller` is an object with:
        // - `source`: The closest custom element view-model, if any.
        // - `binding`: The binding instance (e.g., PropertyBinding, InterpolationPartBinding).
        console.log('Converter called by binding:', caller.binding);
        console.log('Source/Component VM:', caller.source);

        // Use binding-specific state if needed, then return transformed value
        return /* your transformation logic */;
      }

      public fromView?(value, caller, ...args) {
        // For two-way binding scenarios, you can similarly access the caller properties
        return /* reverse transformation logic */;
      }
    }
    ```

Then use your converter in templates as usual:

```html
<import from="./my-converter"></import>
<p>${ someValue | myConverter }</p>
```

At runtime, Aurelia will detect `withContext: true` in the value converter and pass the binding instance as the second parameter. Depending on how the converter is used:

- **Property Binding** (`foo.bind` or `attr.bind`): the caller is a `PropertyBinding` instance
- **Interpolation** (`${ }` with converters): the caller is an `InterpolationPartBinding` instance
- **Other Bindings**: the caller corresponds to the specific binding type in use

### Common Use Cases

- Logging or debugging which binding invoked the converter
- Applying different formatting based on binding context
- Accessing binding metadata or context not available through standard converter parameters

Use this feature sparingly, only when you truly need insights into the calling context. For most formatting scenarios, simple converter parameters and camelCase converter names are sufficient.

### Inspecting the Caller

Once `withContext: true` is enabled and a converter receives the `caller` parameter (an object with `source` and `binding` properties), you have several ways to learn more about the binding and component that invoked it:

- **Binding Instance (`caller.binding`)**: Access the binding instance directly. You can check its class to know which binding type triggered it.
  ```typescript
  console.log(caller.binding.constructor.name); // e.g. 'PropertyBinding' or 'InterpolationPartBinding'
  ```
- **Component/View Model (`caller.source`)**: If the converter is used inside a component's binding, `caller.source` provides the component instance (view-model).
  ```typescript
  // caller.source is the closest custom element view-model (if any)
  const vm = caller.source as MyComponent;
  if (vm) {
    // Use the component instance
  }
  ```

- **Relationship between `source` and `binding`**:
  - **Property & Attribute Binding** (e.g., `value.bind="expr | myConverter"` on `<input>`, or `custom-attr.bind="expr | myConverter"`):
    - `caller.binding`: The `PropertyBinding` instance.
    - `caller.source`: The view-model of the closest custom element containing this binding, if applicable.
  - **Custom Element Interpolation** (e.g., `<my-element> ${ value | myConverter } </my-element>`):
    - `caller.binding`: The `InterpolationPartBinding` instance.
    - `caller.source`: The view-model of `my-element` (or the closest custom element containing the interpolation).

By combining these properties, your converter can adapt its logic based on exactly which binding and component invoked it.

## Registration Patterns

Aurelia 2 offers multiple ways to register value converters depending on your needs.

### Decorator-Based Registration (Recommended)

The simplest approach uses the `@valueConverter` decorator:

```typescript
import { valueConverter } from 'aurelia';

@valueConverter('myConverter')
export class MyConverter {
  toView(value) {
    return value;
  }
}
```

### Registration with Options

For more control, provide a configuration object:

```typescript
@valueConverter({ 
  name: 'currency', 
  aliases: ['money', 'cash'] 
})
export class CurrencyConverter {
  toView(value, locale = 'en-US', currency = 'USD') {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currency
    }).format(value);
  }
}
```

Now you can use any of these names in templates:

```html
<p>${amount | currency}</p>
<p>${amount | money:'en-GB':'GBP'}</p>
<p>${amount | cash}</p>
```

### Manual Registration

For dynamic scenarios, use `ValueConverter.define()`:

```typescript
import { ValueConverter } from 'aurelia';

// Inline class definition
const DynamicConverter = ValueConverter.define('dynamic', class {
  toView(value) {
    return `Dynamic: ${value}`;
  }
});

// Existing class
class ExistingConverter {
  toView(value) {
    return value;
  }
}
ValueConverter.define('existing', ExistingConverter);
```

### Local vs Global Registration

**Global Registration**: Converters registered with decorators or in the root configuration are available throughout the application.

**Local Registration**: Register converters for specific components:

```typescript
@customElement({
  name: 'my-element',
  template: '${value | localConverter}',
  dependencies: [LocalConverter] // Only available within this component
})
class MyElement { }
```

## Creating Custom Value Converters

A converter is a simple class. Always reference it in camelCase within templates.

A no-op converter example:

```typescript
export class ThingValueConverter {
  toView(value) {
    return value;
  }
}
```

## Signals-Based Reactivity

Value converters can automatically re-evaluate when specific signals are dispatched, perfect for locale changes, theme updates, or global state changes.

```typescript
import { valueConverter, ISignaler } from 'aurelia';

@valueConverter('localeDate')
export class LocaleDateConverter {
  public readonly signals = ['locale-changed', 'timezone-changed'];
  
  constructor(@ISignaler private signaler: ISignaler) {}
  
  toView(value: string, locale?: string) {
    const currentLocale = locale || this.getCurrentLocale();
    return new Intl.DateTimeFormat(currentLocale, {
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    }).format(new Date(value));
  }
  
  private getCurrentLocale() {
    // Get current locale from your app state
    return 'en-US';
  }
}
```

To trigger re-evaluation from anywhere in your app:

```typescript
export class LocaleService {
  constructor(@ISignaler private signaler: ISignaler) {}
  
  changeLocale(newLocale: string) {
    // Update your locale
    this.signaler.dispatchSignal('locale-changed');
  }
}
```

Now all `localeDate` converters automatically update when the locale changes, without needing to manually refresh bindings.

### Built-in Signal-Aware Converters

Aurelia 2 includes several built-in converters that leverage signals:

```html
<!-- Automatically updates when locale changes -->
<p>${message | t}</p> <!-- Translation -->
<p>${date | df}</p> <!-- Date format -->
<p>${number | nf}</p> <!-- Number format -->
<p>${date | rt}</p> <!-- Relative time -->
```

## Built-in Value Converters

Aurelia 2 includes several built-in converters ready for use:

### Sanitize Converter

Aurelia 2 includes a `sanitize` converter, but it requires you to provide your own sanitizer implementation:

```typescript
import { ISanitizer } from 'aurelia';

// You must register your own sanitizer implementation
export class MyHtmlSanitizer implements ISanitizer {
  sanitize(input: string): string {
    // Implement your sanitization logic
    // You might use a library like DOMPurify here
    return input; // This is just an example - implement proper sanitization!
  }
}

// Register it in your main configuration
container.register(singletonRegistration(ISanitizer, MyHtmlSanitizer));
```

Then you can use the sanitize converter:

```html
<div innerHTML.bind="userContent | sanitize"></div>
```

**Note**: The built-in sanitize converter throws an error by default. You must provide your own `ISanitizer` implementation for it to work.

### I18n Converters (when @aurelia/i18n is installed)

```html
<!-- Translation -->
<p>${'welcome.message' | t}</p>
<p>${'welcome.user' | t:{ name: userName }}</p>

<!-- Date formatting -->
<p>${date | df}</p>
<p>${date | df:{ year: 'numeric', month: 'long' }}</p>

<!-- Number formatting -->
<p>${price | nf:{ style: 'currency', currency: 'USD' }}</p>

<!-- Relative time -->
<p>${timestamp | rt}</p>
```

## Advanced Configuration Options

### Date Formatter Example

This converter formats dates based on locale:

```typescript
import { valueConverter } from 'aurelia';

@valueConverter('date')
export class FormatDate {
  toView(value: string, locale = 'en-US') {
    const date = new Date(value);
    if (Number.isNaN(date.valueOf())) {
      return 'Invalid Date';
    }
    return new Intl.DateTimeFormat(locale, {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
      timeZone: 'UTC'
    }).format(date);
  }
}
```

Import it in your view:

```html
<import from="./date-value-converter" />
```

Usage examples:

```html
<p>${'2021-06-22T09:21:26.699Z' | date}</p>
<p>${'2021-06-22T09:21:26.699Z' | date:'en-GB'}</p>
```

View this in action on [StackBlitz](https://stackblitz.com/edit/aurelia-date-value-converter?embed=1&file=my-app.html&hideExplorer=1&view=preview).

## More Converter Examples

### Currency Formatter

Formats numbers as currency strings.

```typescript
import { valueConverter } from 'aurelia';

@valueConverter('currencyFormat')
export class CurrencyFormatValueConverter {
  toView(value, locale = 'en-US', currency = 'USD') {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currency
    }).format(value);
  }
}
```

```html
<p>Total: ${amount | currencyFormat:'en-US':'USD'}</p>
```

### Emoji Converter

Replaces keywords with emojis.

```typescript
import { valueConverter } from 'aurelia';

@valueConverter('emoji')
export class EmojiConverter {
  private emojiMap = {
    love: "❤️", happy: "😊", sad: "😢",
    angry: "😠", coffee: "☕", star: "⭐",
    cat: "🐱", dog: "🐶", pizza: "🍕"
  };

  toView(value: string) {
    return value.split(/\s+/)
      .map(word => this.emojiMap[word.toLowerCase()] || word)
      .join(' ');
  }
}
```

```html
<p>${'I love coffee and pizza' | emoji}</p>
```

### Leet Speak Converter

Transforms text into “1337” speak.

```typescript
import { valueConverter } from 'aurelia';

@valueConverter('leetSpeak')
export class LeetSpeakConverter {
  toView(value: string) {
    return value
      .replace(/a/gi, '4')
      .replace(/e/gi, '3')
      .replace(/l/gi, '1')
      .replace(/t/gi, '7');
  }
}
```

```html
<p>${'Aurelia is elite!' | leetSpeak}</p>
```

### Upside Down Text Converter

Flips text upside down.

```typescript
import { valueConverter } from 'aurelia';

@valueConverter('upsideDown')
export class UpsideDownConverter {
  private flipMap = {
    a: 'ɐ', b: 'q', c: 'ɔ', d: 'p', e: 'ǝ',
    f: 'ɟ', g: 'ƃ', h: 'ɥ', i: 'ᴉ', j: 'ɾ',
    k: 'ʞ', l: 'l', m: 'ɯ', n: 'u', o: 'o',
    p: 'd', q: 'b', r: 'ɹ', s: 's', t: 'ʇ',
    u: 'n', v: 'ʌ', w: 'ʍ', x: 'x', y: 'ʎ',
    z: 'z', A: '∀', B: '𐐒', C: 'Ɔ', D: 'ᗡ',
    E: 'Ǝ', F: 'Ⅎ', G: '⅁', H: 'H', I: 'I',
    J: 'ſ', K: 'Ʞ', L: '˥', M: 'W', N: 'N',
    O: 'O', P: 'Ԁ', Q: 'Q', R: 'ᴚ', S: 'S',
    T: '⊥', U: '∩', V: 'Λ', W: 'M', X: 'X',
    Y: '⅄', Z: 'Z', '1': 'Ɩ', '2': 'ᄅ', '3': 'Ɛ',
    '4': 'ㄣ', '5': 'ϛ', '6': '9', '7': 'ㄥ', '8': '8',
    '9': '6', '0': '0', '.': '˙', ',': "'", '?': '¿',
    '!': '¡', '"': '„', "'": ',', '`': ',', '(': ')',
    ')': '(', '[': ']', ']': '[', '{': '}', '}': '{',
    '<': '>', '>': '<', '&': '⅋', '_': '‾'
  };

  toView(value: string) {
    return value.split('')
      .map(char => this.flipMap[char] || char)
      .reverse()
      .join('');
  }
}
```

```html
<p>${'Hello Aurelia!' | upsideDown}</p>
```

### Ordinal Suffix Converter

Adds ordinal suffixes to numbers (1st, 2nd, 3rd, etc.).

```typescript
import { valueConverter } from 'aurelia';

@valueConverter('ordinal')
export class OrdinalValueConverter {
  toView(value: number) {
    const suffixes = ['th', 'st', 'nd', 'rd'];
    const v = value % 100;
    return value + (suffixes[(v - 20) % 10] || suffixes[v] || suffixes[0]);
  }
}
```

```html
<p>${position | ordinal}</p>
```

### Morse Code Converter

Transforms text into Morse code.

```typescript
import { valueConverter } from 'aurelia';

@valueConverter('morse')
export class MorseCodeValueConverter {
  private morseAlphabet = {
    A: ".-",    B: "-...",  C: "-.-.",  D: "-..",
    E: ".",     F: "..-.",  G: "--.",   H: "....",
    I: "..",    J: ".---",  K: "-.-",   L: ".-..",
    M: "--",    N: "-.",    O: "---",   P: ".--.",
    Q: "--.-",  R: ".-.",   S: "...",   T: "-",
    U: "..-",   V: "...-",  W: ".--",   X: "-..-",
    Y: "-.--",  Z: "--..",
    '1': ".----", '2': "..---", '3': "...--", '4': "....-",
    '5': ".....", '6': "-....", '7': "--...", '8': "---..",
    '9': "----.", '0': "-----"
  };

  toView(value: string) {
    return value.toUpperCase()
      .split('')
      .map(char => this.morseAlphabet[char] || char)
      .join(' ');
  }
}
```

```html
<p>${message | morse}</p>
```

## Performance Considerations & Best Practices

### Optimization Tips

1. **Avoid expensive operations in toView**: Value converters are called frequently during binding updates.

```typescript
// ❌ Bad - expensive operation on every call
@valueConverter('slowFormat')
export class SlowFormatConverter {
  toView(value: string) {
    // Don't do heavy computations here
    return this.performExpensiveTransformation(value);
  }
}

// ✅ Good - cache results when possible
@valueConverter('fastFormat')
export class FastFormatConverter {
  private cache = new Map();
  
  toView(value: string) {
    if (this.cache.has(value)) {
      return this.cache.get(value);
    }
    const result = this.transformValue(value);
    this.cache.set(value, result);
    return result;
  }
}
```

2. **Use signals instead of polling**: For global state changes, signals are more efficient than frequent re-evaluation.

3. **Consider memoization**: For converters with complex calculations, implement caching strategies.

4. **Minimize fromView complexity**: Two-way binding calls fromView on every keystroke.

### Best Practices

- **Single responsibility**: Each converter should handle one specific transformation
- **Pure functions**: Avoid side effects in converter methods when possible
- **Descriptive names**: Use clear, descriptive names that indicate the transformation
- **Type safety**: Use TypeScript interfaces for better developer experience

```typescript
interface CurrencyOptions {
  locale?: string;
  currency?: string;
  minimumFractionDigits?: number;
}

@valueConverter('currency')
export class CurrencyConverter {
  toView(value: number, options: CurrencyOptions = {}): string {
    const { locale = 'en-US', currency = 'USD', minimumFractionDigits = 2 } = options;
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency,
      minimumFractionDigits
    }).format(value);
  }
  
  fromView(value: string): number {
    const numericValue = parseFloat(value.replace(/[^\d.-]/g, ''));
    return isNaN(numericValue) ? 0 : numericValue;
  }
}
```

## Troubleshooting Common Issues

### Converter Not Found

If your converter isn't recognized:

1. Ensure it's imported where used
2. Check the decorator name matches template usage
3. Verify registration in component dependencies if using local registration

### Performance Issues

- Profile converter execution frequency
- Consider signal-based updates for global state
- Implement caching for expensive operations
- Use bidirectional converters judiciously

### Context Access Issues

When using `withContext`, ensure:

1. The `withContext` property is set to `true`
2. The caller parameter is the second parameter in method signatures
3. Additional arguments come after the caller parameter

These examples highlight the flexibility of Aurelia 2's value converters. Experiment with your own transformations to tailor data exactly as you need it.
