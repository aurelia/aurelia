# Internationalization

* [Internationalization](internationalization.md#internationalization)
  * [Introduction](internationalization.md#introduction)
  * [Getting Started](internationalization.md#getting-started)
  * [Registering the plugin](internationalization.md#registering-the-plugin)
    * [Configuring translation attribute aliases](internationalization.md#configuring-translation-attribute-aliases)
    * [Managing translation resources](internationalization.md#managing-translation-resources)
      * [Bundling the resource files](internationalization.md#bundling-the-resource-files)
      * [i18next Backend plugin](internationalization.md#i18next-backend-plugin)
  * [Using the plugin](internationalization.md#using-the-plugin)
    * [Active locale](internationalization.md#active-locale)
    * [Translation](internationalization.md#translation)
      * [Translation in view](internationalization.md#translation-in-view)
        * [Syntax](internationalization.md#syntax)
        * [Replace `textContent`](internationalization.md#replace-textcontent)
        * [Replace `[src]` of `<img>`](internationalization.md#replace-src-of-img)
        * [Replace `innerHTML`](internationalization.md#replace-innerhtml)
        * [`[append]` or `[prepend]` translations](internationalization.md#append-or-prepend-translations)
        * [Attribute translation](internationalization.md#attribute-translation)
        * [Manipulate translations with `t-params` attribute](internationalization.md#manipulate-translations-with-t-params-attribute)
          * [Interpolation](internationalization.md#interpolation)
          * [Contextual translation](internationalization.md#contextual-translation)
          * [Pluralization](internationalization.md#pluralization)
          * [Interval specific translation](internationalization.md#interval-specific-translation)
        * [ValueConverter and BindingBehavior](internationalization.md#valueconverter-and-bindingbehavior)
      * [Translation via code](internationalization.md#translation-via-code)
      * [Handling missing keys](internationalization.md#handling-missing-keys)
    * [Formatting numbers](internationalization.md#formatting-numbers)
      * [Format number in view using ValueConverter and/or BindingBehavior](internationalization.md#format-number-in-view-using-valueconverter-andor-bindingbehavior)
      * [Format number via code](internationalization.md#format-number-via-code)
    * [Unformat number via code](internationalization.md#unformat-number-via-code)
    * [Formatting dates](internationalization.md#formatting-dates)
      * [Format date in view using ValueConverter and/or BindingBehavior](internationalization.md#format-date-in-view-using-valueconverter-andor-bindingbehavior)
      * [Format date via code](internationalization.md#format-date-via-code)
    * [Relative time formatting](internationalization.md#relative-time-formatting)
      * [Relative time format in view using ValueConverter and/or BindingBehavior](internationalization.md#relative-time-format-in-view-using-valueconverter-andor-bindingbehavior)
      * [Relative time format via code](internationalization.md#relative-time-format-via-code)
  * [Migration Guide & Breaking Changes](internationalization.md#migration-guide--breaking-changes)

## Introduction

This documentation explains how to get up and running with Aurelia-I18N in order to provide localization \(l10n\) and internationalization \(i18n\) features for your app.

Under the hood it uses [i18next](http://i18next.com/), which is a generalized open source library with an extensive set of features. By building on top of it not only can you reuse your work across various other platforms and frameworks but you are able to use an extensive eco-system full of various packages and plugins.

If you are already familiar with `i18next` you would know that a key along with optional options, to manipulate the translation, are used to produce the final translated output. `@aurelia/i18n` also uses this concept of a key and an options object. The evaluated keys and the options are passed on to `i18next` as-is. This means that any resource syntax \(interpolation, context, nesting etc.\), and options object schema, supported by `i18next`, are also supported by `@aurelia/i18n` by default.

## Getting Started

> Note If you have already used the `aurelia-i18n` plugin previously and are migrating your existing Aurelia app to Aurelia vNext then [jump straight to the migration guide](internationalization.md#migration-guide--breaking-changes).

* Install the plugin using:

```bash
npm i @aurelia/i18n
```

* Register the plugin in your app with:

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

The above example shows how to initialize the i18n plugin and thereby i18next with translation resources. There are alternatives of doing that, which is discussed [later](internationalization.md#managing-translation-resources). Once registered, the plugin can be used in your view using the translation attribute \(the default attribute name is `t`, though an [alias can be configured](internationalization.md#configuring-translation-attribute-aliases)\), and the translation keys configured.

```markup
<span t="key"></span>
```

In this form, during runtime, Aurelia will replace the `textContent` of the `span` with the string "Hello I18N", considering the currently active locale is `en`. If you [change the locale](internationalization.md#active-locale) to `de` for example, then on runtime, the text will be changed to "Hallo I18N".

That was just the "hello world" example of `@aurelia/i18n`. The plugin can do more than just that; for details read on.

## Registering the plugin

As told earlier, the plugin uses `i18next` under the hood. During registration, the [options to initialize `i18next`](https://www.i18next.com/overview/api#init) can be passed on. There are two ways the plugin can be registered.

* Using default options

  ```typescript
  new Aurelia().register(I18nConfiguration)
  ```

  This initializes the plugin, as well as `i18next` with default options.

  However, often the default settings will not suffice.

* Using customized options

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

  The `customize` function with a callback can be used to customize the initialization of `i18next` \(other use-cases follow\). The `options.initOptions` can be mutated to affect the initialization of `i18next`. Every options that can be used in [`i18next.init`](https://www.i18next.com/overview/api#init) can be used here as well.

  Additionally, any [`i18next` plugins](https://www.i18next.com/overview/plugins-and-utils) can be utilized using the `options.initOptions.plugins` array, as shown below.

  ```typescript
  import * as intervalPlural from 'i18next-intervalplural-postprocessor';

  new Aurelia()
   .register(I18nConfiguration.customize((options)=>{
     options.initOptions = {
       plugins: [intervalPlural] // depending on your tsconfig this might also be intervalPlural.default
     };
   }));
  ```

  A common use-case of a `i18next` plugin in described [here](internationalization.md#i18next-backend-plugin).

### Configuring translation attribute aliases

As you may have already noticed that in view translated resources can be accessed using the following syntax.

```markup
<element t="key"></element>
```

The `t` attribute name \(see the details [here](internationalization.md#translation)\) is used by the plugin by default. In case that creates a conflict \(maybe there is an existing custom attribute named `t` in your app\), or you migrate from another framework which uses an alternate default translation attribute name, an alias of this attribute can be registered as follows.

```typescript
new Aurelia()
  .register(
    I18nConfiguration.customize((options) => {
      options.translationAttributeAliases = ['i18n', 'tr'];
    })
  )
```

The registered aliases can then be used in your view in place of `t`, as shown below.

```markup
<element i18n="key1"></element>
<element tr="key2"></element>
```

> Note that you can mix and match any alias at the same time together

### Managing translation resources

Typically, the translation resources used in `i18next` are plain JSON. To give you an idea what they look like lets take a look at the following sample.

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

In the previous examples, the resources are defined inline. As the application starts to grow, it is likely that the translation resource will too. With that, the inline resources definition becomes tiresome. A typical practice is to externalize the JSON resources to separate files. There are two approaches how those files can be used in the application which are elaborated in the following sections.

#### Bundling the resource files

A straightforward approach would be to import the JSON resources to app \(depending on your build system\), and use those in the `customize` function. The example below shows how to do that.

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

This is a quite handy strategy for small app, with a trivial amount of translated text. However, if there are multiple languages supported in your app and the amount of translations for each locale is non-trivial, then this might not be the optimal choice. The reason is that all the translation resources get bundled with the app, even if not all locales are actually used by the user. Thus, this approach will increase the bundle size needlessly, which in turn can affect the startup time of your app.

#### i18next Backend plugin

Another approach is to asynchronously load the resource file when needed. To this end, [`i18next` Backend plugins](https://www.i18next.com/overview/plugins-and-utils#backends) can be used. Whenever, the language is changed in `i18next`, it will use the registered Backend to fetch the resource files, so that keys can be translated for the new locale.

For this example, we'll use the [`i18next-fetch-backend`](https://github.com/perrin4869/i18next-fetch-backend) that makes use of `fetch` to load arbitrary resource files.

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

This way, no translation resources get bundled with the app. Instead `i18next` instructs the registered Backend to load the translation resource using the `loadPath` pattern `'/locales/{{lng}}/{{ns}}.json'` during initialization and whenever the active locale is changed. Note that `{{lng}}`, and `{{ns}}` are placeholders for locale name, and namespace respectively. The default namespace used by `i18next` is `translation` \(which can of course be changed using init options\). For example, for locale `en`, it is expected that the a `translation.json` is available under `/locales/en`. Thus, you have to ensure that those translation resources are accessible under correct path.

**Recipes**

This section shows couple of recipes to make those resources available for Backend.

* `webpack-dev-server`: Use `copy-webpack-plugin` to copy the `locales` src directory to distribution directory. Then set the `devServer.contentBase` to the distribution directory.

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

If you are familiar with the `aurelia-i18n` plugin, then you know that apart from translation service, this plugin also provides formatting service for number, date, and relative time. All these features are also available in `@aurelia/i18n` which are elaborated in the following section.

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

Note that when the active locale is changed, the `I18N` publishes the `i18n:locale:changed` event, and dispatches the `aurelia-translation-signal` signal. The i18n value-converters and binding-behaviors subscribe to these events, and update translations automatically. This event and signal are very useful tools if you want to perform your own custom locale-sensitive logic when the locale is changed.

> Note Unlike the previous version of Aurelia, in vNext all translatable resources \(marked by the out of the box attributes, value converters, and binding behaviors\) are updated automatically on change of locale, without the need of any additional component or service.

### Translation

The translation service provided by this plugin can be used both in view \(HTML\), and view-model.

#### Translation in view

Aurelia uses an attribute pattern in view to replace the content or attribute values. The default pattern is `t`, which can be customized by [registering aliases](internationalization.md#customize-translation-attribute-alias). For the purpose this discussion though the default attribute name is assumed.

**Syntax**

```markup
<element t="[optional-attribute-list1]translation-key;[optional-attribute-list2]optional-translation-key"></element>
<element t="[title,alt]translation-key;[placeholder]another-translation-key"></element>
```

At minimum, a `translation-key` needs to be used as the value for `t` attribute. The key can be preceded by a bracket-enclosed and comma-separated list of attributes. When specified, the value of those attributes are replaced with the value of the translation key. Moreover, a subsequent attribute list and key pairs can also be used in the same `t` attribute. The following examples explain this in more details.

**Replace textContent**

This is the most common use-case, as well as the default behavior.

```javascript
{
  "key": "Hello World"
}
```

```markup
<span t="key"></span>
```

Given the above translation, and the view, Aurelia replaces the `textContent` of the `span` with "Hello World". The same result can also be achieved by explicitly using the `[text]` attribute like `<span t="[text]key"></span>`.

Note that the key expression can also be constructed in view-model and be bound to `t` using `t.bind` syntax.

```typescript
class MyView {
  i18nKey = "key";
}
```

```markup
<span t.bind="i18nKey"></span>
```

**Replace \[src\] of &lt;img&gt;**

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

As told before, by default the plugin will set the `textContent` property of an element.

```javascript
{
  "title": "Title <b>bold</b>"
}
```

```markup
<span t="title">Title</span>
```

Therefore, in above example the html tags will be escaped and the output will be `&lt;b&gt;bold&lt;/b&gt;`. To allow html-markup to be used, the `[html]` attribute needs to be added before the translation key.

```markup
<span t="[html]title">Title</span>
```

This will set the `innerHTML` of the element instead of the `textContent` property, so html-markup won't be escaped.

**\[append\] or \[prepend\] translations**

So far we have seen that contents are replaced. There are two special attributes `[append]`, and `[prepend]` which can be used to append or prepend content to the existing content of the element. These also support HTML content.

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

The plugin can be used to translate attributes of HTML elements.

```javascript
{
  "title": "some text"
}
```

```markup
<span t="[title]title"></span>
```

The example sets the `[title]` attribute of the `span`. A useful example would be to use the attribute translation to set the `[alt]` or `[title]` attributes of image. Note that same key can also be used to target multiple attributes, for example: `<img t="[title,alt]key">`.

The same syntax of attribute translation also works for translating `@bindable`s of custom elements.

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

So far we have seen a simple key to value mapping. However, `i18next` supports more complex use-cases such as [interpolation](https://www.i18next.com/translation-function/interpolation), [context-specific translation](https://www.i18next.com/translation-function/context) etc. This is done by passing a complex options object along with the key to `i18next`.

With `@aurelia/i18n`, the `t-params` attribute pattern along with `t` can be used to this end. The object bound to `t-params` are passed on to `i18next` as-is. This means that any options object schema supported by `i18next` for any particular operation will work in the same fashion. However, following are some basic examples of this; for further details check out the `i18next` docs.

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

Sometimes, simple plural contexts are not enough, and another translation is required based on different interval. Note that this use case is not supported out of the box by `i18next`. For this, we need to use [i18next-intervalplural-postprocessor](https://github.com/i18next/i18next-intervalPlural-postProcessor) plugin and register it with the `@aurelia/i18n` as shown [here](internationalization.md#registering-the-plugin).

Then define the interval translation resource as follows. Note that the example uses [nesting](https://www.i18next.com/translation-function/nesting).

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

**ValueConverter and BindingBehavior**

In order to do translations in a more declarative way from within your HTML markup you can use the `t` ValueConverter and BindingBehavior.

```markup
<span> ${'itemWithCount' | t : {count: 10}} </span>
<span> ${'itemWithCount' & t : {count: 10}} </span>
```

Combined with appropriate translation resource, the correct value will be rendered. Note that the options object that follows `t` is the same options object as discussed [earlier](internationalization.md#manipulate-translations-with-t-params-attribute). Naturally, this value is optional. Both the ValueConverter and BindingBehavior also update translations out of the box when the active locale is changed.

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

If a key is missing in the translation resources, by default the key's name will be rendered instead of the value. This is a sensible default as it immediately shows that a translation is missing for certain keys when inspecting the app. However, this can be overridden by the configuration option as shown below.

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

The `@aurelia/i18n` plugin provides number formatting using [`Intl` API](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/NumberFormat).

#### Format number in view using ValueConverter and/or BindingBehavior

```markup
<span> ${ 123456789.12 | nf } </span>
<span> ${ 123456789.12 & nf : undefined : 'de'} </span>
<span> ${ 123456789.12 | nf: {style:'currency', currency: 'EUR' } : 'de' } </span>
<span> ${ 123456789.12 & nf: {style:'currency', currency: 'USD' }} </span>
```

The `nf` ValueConverter and BindingBehavior can be used to format numbers in a declarative way from the view. Both take two optional arguments, apart from the number being formatted which are options, and locale respectively. If these are omitted, the number is formatted using the default number formatting options and the currently active locale. A specific locale can be passed on to format the number as per that locale. If the input is not a number, then the original value is returned from these as-is.

The formatting options are used to affect how the number is formatted. A prominent use-case for that is to format the number as currency. For a full list of options look [here](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/NumberFormat#Parameters).

> Note that both ValueConverter and BindingBehavior update the formatted value when the active locale is changed.

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

### Unformat number via code

Numeric strings can be converted back to a number using the `I18N#uf` method. The method takes the numeric string as first argument, followed by an optional second argument for locale, as shown in the following example.

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

The `@aurelia/i18n` plugin provides date formatting using [`Intl` API](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/DateTimeFormat).

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

The `df` ValueConverter and BindingBehavior can be used to format dates in a declarative way from the view. Both take two optional arguments, apart from the date being formatted which are options, and locale respectively. If these are omitted, the date is formatted using the default date formatting options and the currently active locale. A specific locale can be passed on to format the date as per that locale.

The formatting options are used to affect how the date is formatted. For a full list of options look [here](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/DateTimeFormat#Parameters).

The value being formatted does not strictly need to be a date object. Apart from `Date` instance, both the ValueConverter and the BindingBehavior support integer, integer strings, and ISO 8601 date string as input. In case, the input cannot be converted reliably to an instance of `Date`, the original input is returned as-is. Integer strings or an integer input are considered as the number of milliseconds since the Unix epoch \(for more details look [here](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date#Syntax)\).

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

> Note The `I18N#df` in the previous version of Aurelia matches the `I18N#createDateTimeFormat`, whereas `I18N#df` provides the formatted date instead.

### Relative time formatting

The `@aurelia/i18n` plugin provides relative time formatting using [`Intl` API](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/RelativeTimeFormat).

> Note The `Intl.RelativeTimeFormat` API is [relatively new at the time of writing](https://github.com/tc39/proposal-intl-relative-time), and [not yet widely supported](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/RelativeTimeFormat#Browser_compatibility). In case your target browser does not support it yet, there are polyfills available which can be used for the time being instead. Below is an example of how a polyfill can be setup

```typescript
import RelativeTimeFormat from 'relative-time-format'; // https://www.npmjs.com/package/relative-time-format

import * as deRt from 'relative-time-format/locale/de.json';
import * as enRt from 'relative-time-format/locale/en.json';
RelativeTimeFormat.addLocale(enRt['default']);
RelativeTimeFormat.addLocale(deRt['default']);

Intl['RelativeTimeFormat'] = Intl['RelativeTimeFormat'] || RelativeTimeFormat;
```

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

The `rt` ValueConverter and BindingBehavior can be used to relatively format dates in a declarative way from the view. Both take two optional arguments, apart from the date being formatted which are options, and locale respectively. If these are omitted, the date is formatted using the default formatting options and the currently active locale. A specific locale can be passed on to format the date as per that locale.

The formatting options are used to affect how the date is formatted. For a full list of options look [here](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/RelativeTimeFormat#Syntax). The value being formatted need to be an instance of `Date`, otherwise the original value is returned as-is.

> Note that both ValueConverter and BindingBehavior updates the formatted value when the active locale is changed.

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

Both ValueConverter and BindingBehavior react to this signal and update the view with the formatted value.

#### Relative time format via code

Formatting relative dates via code works by using the method `I18N#rt`. You can pass in the date as its first parameter, followed by the optional parameters `options`, and `locales`.

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

Additionally, if needed an instance of `Intl.RelativeTimeFormat` can be created using the `I18N#createRelativeTimeFormat` method.

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

> Note If you have used relative time formatting with `aurelia-i18n` plugin, then you have noticed that instead of full-fledged class dedicated for relative time formatting, in `@aurelia/i18n` plugin it is just a couple of methods in `I18N`.

**A caveat**

If the date being formatted is a future date, then there lies an edge case, which might cause minor annoyance. If the time difference between the target date and now can be expressed as unit time difference such as "1 minute", or "1 week", there is a chance that these cases are demoted to a lower time unit such as "60 seconds", or "7 days". The reason behind this is the delay between the target date creation time instance \('t'\) and the time instance when the time difference is being calculated \('now'\). If the difference computation is delayed the time difference between 't' and 'now' decreases, which causes the time unit demotion. To counter this problem we use a small value named `epsilon` \(default to 0.01\) to compensate the delay. We found that usage of this leeway produces nicer result. Although you might not need it, you can change the default value using the `options.initOptions.rtEpsilon` parameter in the `customize` function \(see [this](internationalization.md#registering-the-plugin)\). Note that a smaller value \(close to 0\) denotes low tolerance to delay and stricter comparison.

## Migration Guide & Breaking Changes

This section outline the breaking changes introduced by `@aurelia/i18n` as compared to the predecessor `aurelia-i18n`. We can happily say that there is next to no breaking changes on how the plugin is used in view, for translation or date and number formatting. However, there are couple of breaking changes in the API which are elaborated later. We hope that this documentation also serves as a migration guide for the well-known use cases.

* `aurelia-i18n` used `i18next@14.x.x`, whereas `@aurelia/i18n` uses `i18next@17.x.x`. Therefore all/any of the breaking changes from `i18next` also applies here \(however we have not experienced any friction from `i18next` when we ported the plugin\).
* The formatting methods such as `nf`, and `df` returns formatted number and date string in the new version of plugin. Earlier, it returned instance of `Intl.NumberFormat`, and `Intl.DateFormat` respectively, which then can be used to format the number or date. However in the new plugin that has became an one step process. We hope that this is a happy change. In case you miss the old methods, those are still available under the names `createNumberFormat`, and `createDateTimeFormat` respectively. For least friction in migration process, these new methods can be used. For more details see the section on [number](internationalization.md#formatting-numbers), and [date](internationalization.md#formatting-dates) formatting.
* Another major breaking change is with relative time formatting. Following are some of breaking changes; for full details check the respective [section](internationalization.md#relative-time-formatting).
  * The relative time formatting can now be done using the `rt` method in `I18N` as compared to the full-fledged `RelativeTime` class in `aurelia-i18n`. Therefore, instead of `RelativeTime#getRelativeTime`, you can use `I18N#rt`. The class `RelativeTime` does not exist anymore in the new version.
  * Registering translation resources for relative time formatting is no longer required, as the new API relies on `Intl.RelativeTimeFormat`, which use the locale data provided by the environment such as Browsers, or Node.js.
  * There is a minor downside of not maintaining the custom translation resources for relative time. The smallest time unit supported by `Intl.RelativeTimeFormat` is `second`. Therefore, any time difference that is lesser than a second is approximated to one second and formatted. Such cases are formatted in `aurelia-i18n` as a variant of "now", which is not possible any more in the new plugin.
  * There is a new time unit "week" in `Intl.RelativeTimeFormat` API as compared to `RelativeTime` class in `aurelia-i18n`.
  * As `Intl.RelativeTimeFormat` is relatively new at the time of writing, polyfill might be needed for the browsers, do not yet support the API. For more details check out the respective section.
* All ValueConverters in `@aurelia/i18n` are now signalable as compared to `aurelia-i18n`, where no i18n value converters were signalable. This means that the associated translation or the formatting will be automatically updated when the active locale is changed.

