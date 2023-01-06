# i18n Internationalization

## Introduction

This section explains how to get up and running with Aurelia-I18N to provide localization (l10n), and internationalization (i18n) features for your app.

Under the hood, it uses [i18next](http://i18next.com/), a generalized open-source library with an extensive set of features. By building on top of it, not only can you reuse your work across various other platforms and frameworks, but you are able to use an extensive ecosystem full of various packages and plugins.

If you are already familiar with `i18next` you would know that a key and options used to manipulate the translation are used to produce the final translated output. `@aurelia/i18n` also uses this concept of a key and an options object. The evaluated keys and the options are passed on to `i18next` as-is. This means that any resource syntax (interpolation, context, nesting etc.), and options object schema, supported by `i18next`, are also supported by `@aurelia/i18n` by default.

## Getting Started

> Note If you have already used the `aurelia-i18n` plugin previously and are migrating your existing Aurelia app to Aurelia vNext then [jump straight to the migration guide](internationalization.md#migration-guide--breaking-changes).

Install the plugin.

```bash
npm i @aurelia/i18n
```

Register the plugin in your app.

```typescript
import { I18nConfiguration } from '@aurelia/i18n';
import Aurelia from 'aurelia';

Aurelia
  .register(
    I18nConfiguration.customize((options) => {
      options.initOptions = {
        resources: {
          en: { translation: { key: "Hello I18N"} },
          de: { translation: { key: "Hallo I18N"} },
        }
      };
    })
  )
  .app(component)
  .start();
```

The above example shows how to initialize the i18n plugin and, thereby, i18next with translation resources. There are alternatives ways of doing this, which are discussed [later](internationalization.md#managing-translation-resources). Once registered, the plugin can be used in your view using the translation attribute `t` (this is the default translation attribute name, but an [alias can be configured](internationalization.md#configuring-translation-attribute-aliases)), and the translation keys that have been registered.

```markup
<span t="key"></span>
```

In this example, Aurelia will replace the `textContent` of the `span` with the string "Hello I18N" at runtime, if the currently active locale is `en`. If you [change the locale](internationalization.md#active-locale) to `de` , for example, the text would have been changed to "Hallo I18N".

## Registering the plugin

As explained earlier, the plugin uses `i18next` under the hood. During registration, the [options to initialize `i18next`](https://www.i18next.com/overview/api#init) can be passed in. There are two ways the plugin can be registered.

Using default options.

```typescript
  new Aurelia().register(I18nConfiguration)
```

This initializes the plugin, as well as `i18next` with default options.

However, often the default settings will not suffice.

Using custom options.

```typescript
  new Aurelia()
    .register(I18nConfiguration.customize((options)=>{
      options.initOptions = {
        resources: {
          en: { translation: { key: "Hello I18N"} },
          de: { translation: { key: "Hallo I18N"} },
        }
      };
    }));
```

The `customize` function with a callback can be used to customize the initialization of `i18next`. The `options.initOptions` can be mutated to modify the initialization of `i18next`. Every option that can be used in [`i18next.init`](https://www.i18next.com/overview/api#init) can be used here, as well.

Additionally, all [`i18next` plugins](https://www.i18next.com/overview/plugins-and-utils) can be installed using the `options.initOptions.plugins` array, as shown below.

```typescript
  import * as intervalPlural from 'i18next-intervalplural-postprocessor';

  new Aurelia()
   .register(I18nConfiguration.customize((options)=>{
     options.initOptions = {
       plugins: [intervalPlural] // depending on your tsconfig this might also be intervalPlural.default
     };
   }));
```

### Configuring translation attribute aliases

As mentioned above, Aurelia views access translation resources using the `t` attribute by default (see the details [here](internationalization.md#translation)).

```markup
<element t="key"></element>
```

Where this creates a conflict (say, for example, if there is an existing custom attribute named `t` in your app), or if you migrate from another framework which uses an alternate default translation attribute name, an alias of this attribute can be registered as follows.

```typescript
new Aurelia()
  .register(
    I18nConfiguration.customize((options) => {
      options.translationAttributeAliases = ['i18n', 'tr'];
    })
  )
```

The registered aliases can then be used in your view in place of `t`.

```markup
<element i18n="key1"></element>
<element tr="key2"></element>
```

{% hint style="info" %}
You can mix and match any alias at the same time.
{% endhint %}

### Managing translation resources

Typically, the translation resources used in `i18next` are plain JSON. To give you an idea of what they look like, let's take a look at the following sample.

```javascript
{
  "key": "value of key",
  "complex": {
    "nested": {
      "resource": {
        "key": "value of nested resource key"
      }
    }
  }
}
```

For this example, the key expression `key` will be evaluated to `'value of key'`, whereas `complex.nested.resource.key` will be evaluated to `'value of nested resource key'`. Nesting resources in this way can help to group translations for individual sections or components.

In the previous examples, the resources are defined in line. As the application starts to grow, it is likely that the translation resource will too. With that, the inline resources definition becomes tiresome.&#x20;

A typical practice is to externalize the JSON resources to separate files. Two approaches to how those files can be used in the application are elaborated on in the following sections.

#### Bundling the resource files

The straightforward approach is to import the JSON resources to the app (depending on your build system) and use those in the `customize` function. The example below shows how to do that.

```typescript
import * as de from 'path_to_locales/de/translation.json';
import * as en from 'path_to_locales/en/translation.json';

new Aurelia()
  .register(
    I18nConfiguration.customize((options) => {
      options.initOptions = {
        resources: {
          en: { translation: en },
          de: { translation: de },
        }
      };
    })
  );
```

This is a handy strategy for a small app with a trivial amount of translated text. However, if there are multiple languages supported in your app and the amount of translations for each locale is non-trivial, then this might not be optimal. All the translation resources get bundled with the app, even if the user doesn't use all locales. Thus, this approach will unnecessarily increase the bundle size, which may affect your app's startup time.

#### i18next Backend plugin

Another approach is to asynchronously load the resource file when needed. To this end, [`i18next` Backend plugins](https://www.i18next.com/overview/plugins-and-utils#backends) can be used. In general, these plugins listen to language changes in `i18next`, use the registered Backend to fetch the resource files so that keys can be translated for the new locale.

Let's demonstrate this with an example. We'll use the [`i18next-fetch-backend` plugin](https://github.com/perrin4869/i18next-fetch-backend) that makes use of `fetch` to load resource files.

```typescript
import Fetch from 'i18next-fetch-backend';

new Aurelia()
  .register(
    I18nConfiguration.customize((options) => {
      options.initOptions = {
        plugins: [Fetch],
        backend: {
          loadPath: '/locales/{{lng}}/{{ns}}.json',
        }
      };
    })
  );
```

With this strategy, no translation resources get bundled with the app. Instead `i18next` instructs the registered Backend to load the translation resource using the `loadPath` pattern `'/locales/{{lng}}/{{ns}}.json'` during initialization and whenever the active locale is changed. Note that `{{lng}}`, and `{{ns}}` are placeholders for locale names and namespaces, respectively. The default namespace used by `i18next` is `translation` (which can, of course, be changed using init options). For example, for locale `en`, it is expected that the a `translation.json` is available under `/locales/en`. Thus, you have to ensure that those translation resources are accessible under the correct path.

**Recipes**

This section shows some recipes to make resources available for Backend plugins.

*   `webpack-dev-server`: Use `copy-webpack-plugin` to copy the `locales` src directory to the distribution directory. Then set the `devServer.contentBase` to the distribution directory.

    ```javascript
    const path = require('path');
    const CopyPlugin = require('copy-webpack-plugin');

    module.exports = function() {
      return {
        devServer: {
          contentBase: path.join(__dirname, "dist"),
        },
        plugins: [
          new CopyPlugin({
            patterns: [
              { from: 'src/locales', to: 'locales' } // assumption: src/locales exists
            ]
          })
        ]
      }
    }
    ```

If you are using an earlier version than v6.0.0 of `copy-webpack-plugin`, use this config.

```javascript
  const path = require('path');
  const CopyPlugin = require('copy-webpack-plugin');

  module.exports = function() {
    return {
      devServer: {
        contentBase: path.join(__dirname, "dist"),
      },
      plugins: [
        new CopyPlugin([
          { from: 'src/locales', to: 'locales' } // assumption: src/locales exists
        ])
      ]
    }
  }
```

* cli: TODO

## Using the plugin

If you are familiar with`aurelia-i18n` Then you know that besides the translation service, this plugin also provides a formatting service for numbers, dates, and relative time. All these features are also available in `@aurelia/i18n` which are elaborated on in the following section.

### Active locale

The active locale can be `get` or `set` by injecting an instance of the `I18N`, and using `getLocale()`, and `setLocale()` methods. The following example shows how to manipulate the active locale.

```typescript
import { I18N } from '@aurelia/i18n';

export class MyDemoVm {
  constructor(@I18N private readonly i18n: I18N) {
    const currentLocale = this.i18n.getLocale();
  }

  public async changeLocale(locale: string) {
    await this.i18n.setLocale(locale);
  }
}
```

{% hint style="info" %}
When the active locale is changed, the `I18N`class publishes the `i18n:locale:changed` event and dispatches the `aurelia-translation-signal` signal. The i18n value converters and binding behaviors automatically subscribe to these events and update translations. This event and signal are useful tools if you want to perform your own custom locale-sensitive logic when the locale is changed.
{% endhint %}

{% hint style="info" %}
Note, Unlike the previous version of Aurelia, in Aurelia 2, all translatable resources (marked by the out-of-the-box attributes, value converters, and binding behaviors) are updated automatically on a change of locale, without the need for any additional component or service.
{% endhint %}

### Translation

The translation service provided by this plugin can be used both in view and view-model.

#### Translation in view

Aurelia uses an attribute pattern to replace the content or attribute values. (The default pattern is `t`, which can be customized by [registering aliases](internationalization.md#customize-translation-attribute-alias)). For the purpose of this discussion, the default attribute name is assumed.

**Syntax**

```markup
<element
  t="
    [optional-attribute-list1]translation-key;
    [optional-attribute-list2]optional-translation-key
  "></element>

<element
  t="
    [title,alt]translation-key;
    [placeholder]another-translation-key
  "></element>
```

At a minimum, a `translation-key` needs to be used as the value for `t` attribute. A bracket-enclosed and comma-separated list of attributes can precede the key. When specified, the value of those attributes is replaced with the value of the translation key. Moreover, a subsequent attribute list and key pairs can also be used in the same `t` attribute. The following examples explain this in more detail.

**Replace textContent**

This is the most common use case, as well as the default behavior.

```javascript
{
  "key": "Hello World"
}
```

```markup
<span t="key"></span>
```

Given the above translation and the view, Aurelia replaces the `textContent` of the `span` with "Hello World". The same result can also be achieved by explicitly using the `[text]` attribute like `<span t="[text]key"></span>`.

Note that the key expression can also be constructed in view-model and be bound to `t` using `t.bind` syntax.

```typescript
class MyView {
  i18nKey = "key";
}
```

```markup
<span t.bind="i18nKey"></span>
```

**Replace \[src] of \<img>**

The aforementioned `t="key"` syntax behaves a bit differently for `img` elements. In this case, the `src` attribute of the `img` is replaced instead.

```javascript
{
  "key": "/path/to/image.jpg"
}
```

```markup
<img t="key">
```

The `i18n` plugin transforms the `img` element to `<img src="/path/to/image.jpg">`.

**Replace innerHTML**

As mentioned above, by default, the plugin will set the `textContent` property of an element.

```javascript
{
  "title": "Title <b>bold</b>"
}
```

```markup
<span t="title">Title</span>
```

Therefore, in the above example, the HTML tags will be escaped, and the output will be `&lt;b&gt;bold&lt;/b&gt;`. To allow HTML-markup to be used, the `[html]` attribute must be added before the translation key.

```markup
<span t="[html]title">Title</span>
```

This will set the `innerHTML` of the element instead of the `textContent` property, so HTML-markup won't be escaped.

**\[append] or \[prepend] translations**

So far, we have seen that the contents are replaced. There are two special attributes `[append]`, and `[prepend]` which can be used to append or prepend content to the existing content of the element. These also support HTML content.

```javascript
{
  "pre": "tic ",
  "post": " toe",
}
```

```markup
<span t="[prepend]pre;[append]post">tac</span>
```

The example above produces `<span>tic tac toe</span>`.

**Attribute translation**

The plugin can be used to translate HTML-element attributes.

```javascript
{
  "title": "some text"
}
```

```markup
<span t="[title]title"></span>
```

The example sets the `[title]` attribute of the `span`. A useful example would be to use the attribute translation to set the `[alt]` or `[title]` attributes of an image. Note that the same key can also be used to target multiple attributes, for example: `<img t="[title,alt]key">`.

The same syntax of attribute translation also works for translating `@bindable` properties of custom elements.

```typescript
import { bindable, customElement } from '@aurelia/runtime';
import template from './custom-message.html';

@customElement({ name: 'custom-message', template })
export class CustomMessage {
  @bindable public message: string;
}
```

```markup
<template>
  <span>${message}</span>
</template>
```

Use the custom element as follows.

```markup
<custom-message t="[message]bar"></custom-message>
```

Which produces the following result.

```markup
<custom-message>
  <span>[TRANSLATED VALUE OF BAR KEY]</span>
</custom-message>
```

**Manipulate translations with the t-params attribute**

So far we have seen a simple key to value mapping. However, `i18next` supports more complex use-cases such as [interpolation](https://www.i18next.com/translation-function/interpolation), [context-specific translation](https://www.i18next.com/translation-function/context), and more. With `i18next` this is done by initializing the library with the options object. Using `@aurelia/i18n`, we use the `t-params` attribute pattern along with `t` to the same result. The object bound to `t-params` is passed on to `i18next` as-is. This means that the options-object schema supported by `i18next` for any particular operation will work as expected. Let's see how this works in Aurelia with some basic examples of this. For further details check out the `i18next` docs.

**Interpolation**

```javascript
{ "key": "{{what}} is {{how}}" }
```

```markup
<span t="key" t-params.bind="{ what: 'i18next', how: 'great' }"></span>
```

The above results in `<span>i18next is great</span>`.

**Contextual translation**

```javascript
{
  "status": "unknown'",
  "status_dispatched": "Your order has been dispatched",
  "status_delivered": "Your order has been delivered",
}
```

```markup
<span t="status" t-params.bind="{ context: 'dispatched' }"></span>
```

The above results in `<span>Your order has been dispatched</span>`.

**Pluralization**

```javascript
{
  "itemWithCount": "{{count}} item",
  "itemWithCount_plural": "{{count}} items"
}
```

```markup
<span t="itemWithCount" t-params.bind="{ count: 0 }"></span>
<span t="itemWithCount" t-params.bind="{ count: 1 }"></span>
<span t="itemWithCount" t-params.bind="{ count: 10 }"></span>
```

The above results in the following.

```markup
<span>0 items</span>
<span>1 item</span>
<span>10 items</span>
```

**Interval specific translation**

Sometimes, simple plural contexts are not enough, and another translation is required based on different interval. Note that this use case is not supported out of the box by `i18next`. For this, we need to use [i18next-intervalplural-postprocessor](https://github.com/i18next/i18next-intervalPlural-postProcessor) plugin and register it with the `@aurelia/i18n` as shown [here](internationalization.md#registering-the-plugin). Then define the interval translation resource as follows. (Note that the example uses [nesting](https://www.i18next.com/translation-function/nesting).)

```javascript
{
  "itemWithCount": "{{count}} item",
  "itemWithCount_plural": "{{count}} items",
  "itemWithCount_interval": "(0)$t(itemWithCount_plural);(1)$t(itemWithCount);(2-7)$t(itemWithCount_plural);(7-inf){a lot of items};",
}
```

```markup
<span t="itemWithCount_interval"  t-params.bind="{postProcess: 'interval', count: 0}"></span>
<span t="itemWithCount_interval"  t-params.bind="{postProcess: 'interval', count: 1}"></span>
<span t="itemWithCount_interval"  t-params.bind="{postProcess: 'interval', count: 2}"></span>
<span t="itemWithCount_interval"  t-params.bind="{postProcess: 'interval', count: 3}"></span>
<span t="itemWithCount_interval"  t-params.bind="{postProcess: 'interval', count: 6}"></span>
<span t="itemWithCount_interval"  t-params.bind="{postProcess: 'interval', count: 7}"></span>
<span t="itemWithCount_interval" t-params.bind="{postProcess: 'interval', count: 10}"></span>
```

This results in the following.

```markup
<span>0 items</span>
<span>1 item</span>
<span>2 items</span>
<span>3 items</span>
<span>6 items</span>
<span>a lot of items</span>
<span>a lot of items</span>
```

**Default value**

If the key expression is evaluated to `null`, or `undefined`, a default value can be provided as follows.

```markup
<span
  t.bind="exprEvaluatedToNullOrUnd"
  t-params.bind="{defaultValue: 'foo-bar'}"
>ignored</span>
```

The example above produces `<span>foo-bar</span>`, given that `exprEvaluatedToNullOrUnd` evaluates to `null`, or `undefined`. In the absence of `defaultValue`, the result would be `<span></span>`. You'll notice that the old content of the target element has been cleaned up (no additional empty text node is created).

**ValueConverter and BindingBehavior**

In order to do translations in a more declarative way from within your HTML markup, you can use the `t` ValueConverter and BindingBehavior.

```markup
<span> ${'itemWithCount' | t : {count: 10}} </span>
<span> ${'itemWithCount' & t : {count: 10}} </span>
```

Combined with appropriate translation resources, the correct value will be rendered. Note that the options object that follows `t` is the same one we discussed [earlier](internationalization.md#manipulate-translations-with-t-params-attribute). Naturally, this value is optional. As you would expect, both the ValueConverter and BindingBehavior will update translations when the active locale changes.

#### Translation via code

Translations via code are done by using the method `I18N#tr`. You can pass in the `key` as the first parameter, followed by the optional second parameter `options`.

```typescript
import { I18N } from '@aurelia/i18n';

export class MyDemoVm {
  private status: string = 'dispatched';

  constructor(@I18N private readonly i18n: I18N) {
    const statusText = this.i18n.tr('status', { context: this.status });
  }
}
```

#### Handling missing keys

If a key is missing in the translation resources, by default, the key's name will be rendered instead of the value. This is a sensible default as it immediately shows that a translation is missing for certain keys when inspecting the app. However, this can be overridden by the configuration option as shown below.

```typescript
new Aurelia()
  .register(I18nConfiguration.customize((options)=>{
    options.initOptions = {
      skipTranslationOnMissingKey: true
    };
  }));
```

Setting `skipTranslationOnMissingKey` to `true` instructs the plugin to return empty strings for missing keys.

### Formatting numbers

The `@aurelia/i18n` plugin provides number formatting using [`Intl` API](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global\_Objects/NumberFormat).

#### Format number in view using ValueConverter and/or BindingBehavior

```markup
<span> ${ 123456789.12 | nf } </span>
<span> ${ 123456789.12 & nf : undefined : 'de'} </span>
<span> ${ 123456789.12 | nf: {style:'currency', currency: 'EUR' } : 'de' } </span>
<span> ${ 123456789.12 & nf: {style:'currency', currency: 'USD' }} </span>
```

The `nf` ValueConverter and BindingBehavior can be used to format numbers in a declarative way from the view. Both take two optional arguments, apart from the number being formatted, which are options, and locale, respectively. If these are omitted, the number is formatted using the default number formatting options and the currently active locale. A specific locale can be passed on to format the number as per that locale. If the input is not a number, then the original value is returned from these as-is.

The formatting options are used to affect how the number is formatted. A prominent use case for that is to format the number as currency. For a full list of options, look [here](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global\_Objects/NumberFormat#Parameters).

{% hint style="info" %}
Both ValueConverter and BindingBehavior update the formatted value when the active locale is changed.
{% endhint %}

#### Format number via code

Formatting numbers via code works by using the method `I18N#nf`. You can pass in the number as its first parameter, followed by the optional parameters `options`, and `locales`.

```typescript
import { I18N } from '@aurelia/i18n';

export class MyDemoVm {

  constructor(@I18N private readonly i18n: I18N) {
    const formatted = this.i18n.nf(123456789.12); // 123,456,789.12 - considering the current locale to be en
    const formattedCurrency = this.i18n.nf(123456789.12, { style: 'currency', currency: 'EUR' }, 'de'); // 123.456.789,12 €
  }
}
```

Additionally, if needed, an instance of `Intl.NumberFormat` can be created using the `I18N#createNumberFormat` method.

```typescript
import { I18N } from '@aurelia/i18n';

export class MyDemoVm {

  constructor(@I18N private readonly i18n: I18N) {
    const nf = this.i18n.createNumberFormat({ style: 'currency', currency: 'EUR' }, 'de');
    const formatted = nf.format(123456789.12); // 123.456.789,12 €
  }
}
```

This can be useful if you want to cache the `Intl.NumberFormat` instance and reuse that later.

> Note The `I18N#nf` in the previous version of Aurelia matches the `I18N#createNumberFormat`, whereas `I18N#nf` provides the formatted number instead.

### Un-format number via code

Numeric strings can be converted back to a number using the `I18N#uf` method. The method takes the numeric string as the first argument, followed by an optional second argument for the locale, as shown in the following example.

```typescript
import { I18N } from '@aurelia/i18n';

export class MyDemoVm {

  constructor(@I18N private readonly i18n: I18N) {
    // all of the strings are converted back to `123456789.12`
    const ufSimple = this.i18n.uf('123,456,789.12');
    const ufLocale = this.i18n.uf('123.456.789,12', 'de');
    const ufCurrency = this.i18n.uf('$ 123,456,789.12');
    const ufText = this.i18n.uf('123,456,789.12 foo bar');

    // sign is respected; thus in this case the converted number is `- 123456789.12`
    const ufMinus = this.i18n.uf('- 123,456,789.12');
  }
}
```

### Formatting dates

The `@aurelia/i18n` plugin provides date formatting using [`Intl` API](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global\_Objects/DateTimeFormat).

#### Format date in view using ValueConverter and/or BindingBehavior

```typescript
export class MyDemoVm {
  public date = new Date(2019, 7, 20);
}
```

```markup
<span> ${ date | df } </span> <!-- 8/20/2019 -->
<span> ${ '2019-08-10T13:42:35.209Z' | df } </span> <!-- 8/20/2019 -->
<span> ${ 0 | df } </span> <!-- 1/1/1970 -->
<span> ${ '0' | df } </span> <!-- 1/1/1970 -->

<span> ${ date & df : {year:'2-digit', month:'2-digit', day:'2-digit'} : 'de' } </span> <!-- 20.08.19 -->
```

The `df` ValueConverter and BindingBehavior can format dates in a declarative way from the view. Both take two optional arguments, apart from the date being formatted, which are options, and locale, respectively. If these are omitted, the date is formatted using the default date formatting options and the currently active locale. A specific locale can be passed on to format the date as per that locale.

The formatting options are used to affect how the date is formatted. For a full list of options, look [here](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global\_Objects/DateTimeFormat#Parameters).

The value being formatted does not strictly need to be a date object. Apart from `Date` instance, both the ValueConverter and the BindingBehavior support integer, integer strings, and ISO 8601 date string as input. In case the input cannot be converted reliably to an instance of `Date`, the original input is returned as-is. Integer strings or an integer input are considered as the number of milliseconds since the Unix epoch (for more details, look [here](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global\_Objects/Date#Syntax)).

> Note that both ValueConverter and BindingBehavior update the formatted value when the active locale is changed.

#### Format date via code

Formatting date via code works by using the method `I18N#df`. You can pass in the date as its first parameter, followed by the optional parameters `options`, and `locales`.

```typescript
import { I18N } from '@aurelia/i18n';

export class MyDemoVm {

  constructor(@I18N private readonly i18n: I18N) {
    const df1 = this.i18n.df(new Date(2020, 1, 10)); // '2/10/2020'
    const df2 = this.i18n.df(new Date(2020, 1, 10), { month: '2-digit', day: 'numeric', year: 'numeric' }, 'de'); // '10.02.2020'
    const df3 = this.i18n.df(0); // '1/1/1970'
  }
}
```

Additionally, if needed an instance of `Intl.DateTimeFormat` can be created using the `I18N#createDateTimeFormat` method.

```typescript
import { I18N } from '@aurelia/i18n';

export class MyDemoVm {

  constructor(@I18N private readonly i18n: I18N) {
    const df = this.i18n.createDateTimeFormat({ month: '2-digit', day: 'numeric', year: 'numeric' }, 'de');
    const formatted = df.format(new Date(2020, 1, 10)); // '10.02.2020'
  }
}
```

This can be useful if you want to cache the `Intl.DateTimeFormat` instance and reuse it later.

{% hint style="info" %}
The `I18N#df` in the previous version of Aurelia matches the `I18N#createDateTimeFormat`, whereas `I18N#df` provides the formatted date instead.
{% endhint %}

### Relative time formatting

The `@aurelia/i18n` plugin provides relative time formatting using [`Intl` API](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global\_Objects/RelativeTimeFormat).

#### Relative time format in view using ValueConverter and/or BindingBehavior

```typescript
export class MyDemoVm {
  private readonly date: Date;
  constructor() {
    this.date = new Date();
    this.date.setSeconds(input.getSeconds() - 5);
  }
}
```

```markup
<span> ${ date | rt } </span>                             <!-- 5 seconds ago -->
<span> ${ date & rt : { style: 'short' } : 'de' } </span> <!-- vor 5 Sek. -->
```

The `rt` ValueConverter and BindingBehavior can format dates in a declarative way from the view. Both take two optional arguments, `options` and `locale`, respectively. If these are omitted, the date is formatted using the default formatting options and the currently active locale. A specific locale can be passed on to format the date as per that locale.

The formatting options are used to affect how the date is formatted. For a full list of options, look [here](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global\_Objects/RelativeTimeFormat#Syntax). The value being formatted must be an instance of `Date`, otherwise, the original value is returned as-is.

{% hint style="info" %}
Both ValueConverter and BindingBehavior update the formatted value when the active locale is changed.
{% endhint %}

**Relative time format signal**

The formatted value can be updated on demand by dispatching the signal `'aurelia-relativetime-signal'`. See the example below.

```typescript
import { Signals } from '@aurelia/i18n';
import { ISignaler } from 'aurelia';

export class MyDemoVm {

  constructor(@ISignaler private readonly signaler: ISignaler) {}

  public changeRelativeTimeFormat() {
    this.signaler.dispatchSignal(Signals.RT_SIGNAL); // the signal 'aurelia-relativetime-signal' is exposed by Signals.RT_SIGNAL
  }
}
```

ValueConverter and BindingBehavior react to this signal and update the view with the formatted value.

#### Relative time format via code

Formatting relative dates via code work by using the method `I18N#rt`. You can pass in the date as its first parameter, followed by the optional parameters `options`, and `locales`.

```typescript
import { I18N } from '@aurelia/i18n';

export class MyDemoVm {
  constructor(@I18N private readonly i18n: I18N) {
    const date = new Date();
    date.setSeconds(input.getSeconds() + 5);

    const rt1 = this.i18n.rt(date); // 'in 5 seconds'
  }
}
```

Additionally, if needed, an instance of `Intl.RelativeTimeFormat` can be created using the `I18N#createRelativeTimeFormat` method.

```typescript
import { I18N } from '@aurelia/i18n';

export class MyDemoVm {

  constructor(@I18N private readonly i18n: I18N) {
    const date = new Date();
    date.setSeconds(input.getSeconds() - 5);

    const df = this.i18n.createDateTimeFormat({ style: 'short' }, 'de');
    const formatted = df.format(-5, "second"); // vor 5 Sek.
  }
}
```

This can be useful if you want to cache the `Intl.RelativeTimeFormat` instance and reuse it later.

{% hint style="info" %}
If you have used relative time formatting with `aurelia-i18n` plugin, then you have noticed that instead of full-fledged class dedicated for relative time formatting, in `@aurelia/i18n` plugin it is just a couple of methods in `I18N`.
{% endhint %}

**A caveat**

If the time difference between the target date and now can be expressed as a unit time difference, such as "1 minute" or "1 week", there is a chance that these cases are demoted to a lower time unit, such as "60 seconds", or "7 days".

The reason behind this is the delay between the target date creation time instance ('t') and the time instance when the time difference is being calculated ('now'). If the difference computation is delayed time difference between 't' and 'now' decreases, which causes the time unit demotion. To counter this problem, we use a small value named `epsilon` (default to 0.01) to compensate for the delay. We found that usage of this correction produces more consistent and predictable results.

You can change the default `epsilon` value using the `options.initOptions.rtEpsilon` parameter in the `customize` function (see [this](internationalization.md#registering-the-plugin)). Note that a smaller value (close to 0) denotes low tolerance to delay and stricter comparison.

## Migration Guide & Breaking Changes

This section outlines the breaking changes introduced by `@aurelia/i18n` as compared to the predecessor `aurelia-i18n`. Fortunately, there are next to zero breaking changes on how the plugin is used in a view for translation or date and number formatting. However, there is a small number of breaking changes in the API which will be explained below. We hope this documentation also serves as a migration guide for the well-known use cases.

* `aurelia-i18n` used `i18next@14.x.x`, whereas `@aurelia/i18n` uses `i18next@17.x.x`. Therefore all/any of the breaking changes from `i18next` also apply here.
* The formatting methods such as `nf`, and `df` return formatted numbers and date strings in the new version of the plugin. In the previous version of Aurelia, these methods returned an instance of `Intl.NumberFormat`, and `Intl.DateFormat` respectively, which would then be used to format the number or date. However, in the new plugin the methods return the formated number or date. In case you required the old methods, those are still available under the names `createNumberFormat`, and `createDateTimeFormat` respectively. For more details, see the section on [number](internationalization.md#formatting-numbers), and [date](internationalization.md#formatting-dates) formatting.
* All ValueConverters in `@aurelia/i18n` are now signalable as compared to `aurelia-i18n`, where no i18n value converters were signalable. This means that the associated translation or the formatting will be automatically updated when the active locale is changed.
* Several breaking changes affect relative time formatting. Following is a short list of breaking changes; for full details see the [section on relative time formatting](internationalization.md#relative-time-formatting).
  * The relative time formatting can now be done using the `rt` method in the `I18N` class, as compared to the full-fledged `RelativeTime` class in `aurelia-i18n`. Therefore, instead of `RelativeTime#getRelativeTime`, you can use `I18N#rt`. The class `RelativeTime` no longer exists in the new version.
  * Registering translation resources for relative time formatting is no longer required, as the new API relies on `Intl.RelativeTimeFormat`, which use the locale data provided by the environment.
  * There is a minor downside that arises when we dropped support for custom translation resources for relative time. The smallest time unit supported by `Intl.RelativeTimeFormat` is `second`. Therefore, any time difference that is shorter than a second is approximated to one second and formatted. Such cases where formatted in `aurelia-i18n` as a variant of "now", which is no longer possible in the new plugin.
  * There is a new time unit "week" in `Intl.RelativeTimeFormat` API which was not present in the `RelativeTime` class under `aurelia-i18n`.
