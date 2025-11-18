---
description: Outcome-oriented scenarios for @aurelia/i18n covering locale switching, formatting, and validation integration.
---

# Internationalization Outcome Recipes

## 1. Locale switcher that persists the user’s preference

**Goal:** Let the user pick a language, apply it immediately, and remember the choice across sessions.

### Steps

1. Register the i18n plugin with multiple locales (as shown in the main guide).
2. Create a locale service that wraps `I18N.setLocale` and writes to `localStorage`:
   ```typescript
   import { I18N } from '@aurelia/i18n';
   import { resolve } from '@aurelia/kernel';

   export class LocaleService {
     private readonly i18n = resolve(I18N);
     private readonly storageKey = 'preferred-locale';

     constructor() {
       const saved = localStorage.getItem(this.storageKey);
       if (saved) {
         void this.i18n.setLocale(saved);
       }
     }

     async changeLocale(locale: string) {
       await this.i18n.setLocale(locale);
       localStorage.setItem(this.storageKey, locale);
     }
   }
   ```
3. Bind a `<select>` to `localeService.changeLocale(locale)` so choosing a language updates translations immediately.

### Checklist

- Reloading the page restores the last selected locale.
- Changing the locale triggers translations everywhere without manual refresh (thanks to the `i18n:locale:changed` event).
- The UI defaults to the browser locale when no preference is stored.

## 2. Number and date formatting per locale

**Goal:** Display currency and dates using the active locale without writing custom formatting logic in components.

### Steps

1. Inject `I18N` or use the `df`/`nf` value converters provided by the plugin:
   ```html
   <p>Balance: ${user.balance | nf:{ style: 'currency', currency: 'EUR' }}</p>
   <p>Joined: ${user.joined | df:{ dateStyle: 'long' }}</p>
   ```
2. When the locale changes, converters re-run automatically.

### Checklist

- Switching between `en` and `de` changes decimal separators and currency symbols as expected.
- Dates use the correct ordering (month/day vs day/month).
- No manual `Intl.NumberFormat` calls are needed in view-models.

## 3. Validation messages that respect the current locale

**Goal:** Integrate `@aurelia/i18n` with the validation plugin so error messages translate automatically.

### Steps

1. Configure the validation message provider to delegate to i18n:
   ```typescript
   import { I18nTranslationValidationMessageProvider } from '@aurelia/validation-i18n';

   Aurelia.register(ValidationHtmlConfiguration.customize(options => {
     options.MessageProviderType = I18nTranslationValidationMessageProvider;
   }));
   ```
2. Provide translations for the built-in validation keys (for example, `validation.required`).
3. When the locale service changes languages, validation errors re-render with the translated message.

### Checklist

- Required-field errors display in English by default and in German after switching locales.
- Custom rule messages use translated strings from your resource files.
- No manual string concatenation is needed in validators or components.

## 4. Lazy-load namespaces per route

**Goal:** Keep initial bundles small by loading translation namespaces on demand when a route activates.

### Steps

1. Configure `@aurelia/i18n` with a backend (for example `i18next-fetch-backend`) so it can fetch JSON files as needed.
2. In the route view-model, call `i18n.loadNamespaces` before rendering:
   ```typescript
   import { I18N } from '@aurelia/i18n';
   import { resolve } from '@aurelia/kernel';

   export class ReportsRoute {
     private readonly i18n = resolve(I18N);

     async canLoad() {
       await this.i18n.loadNamespaces('reports');
       return true;
     }
   }
   ```
3. Use keys like `reports:title` inside the route template. Once the namespace is loaded, translations render immediately.

### Checklist

- The network tab shows `/locales/{locale}/reports.json` only when the route loads.
- Subsequent navigations reuse the cached namespace (unless you opt in to reloading).
- Users do not see missing key warnings because namespaces load before the view activates.

## 5. Relative time formatting

**Goal:** Show human-friendly “time ago” strings that follow the active locale’s grammar.

### Steps

1. Enable the relative-time formatter in the i18n options (it is on by default when using `@aurelia/i18n`).
2. In templates, use the `rt` value converter:
   ```html
   <p>Updated ${lastUpdated | rt}</p>
   <p>Expires ${expiresAt | rt:{ future: true }}</p>
   ```
3. Customize thresholds and language by providing translations for `relativeTime` in each locale file if the defaults are insufficient.

### Checklist

- Switching locale changes phrases like “just now” or “5 minutes ago” automatically.
- Supplying the `{ future: true }` option flips the wording to “in 2 hours,” etc.
- Dates in the past or future render correctly without manual math.

## Reference material

- [Internationalization guide](./internationalization.md)
- [Validation i18n integration](./validation/i18n-internationalization.md)
