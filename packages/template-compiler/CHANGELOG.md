# Change Log

## 2.0.0-rc.0

### Minor Changes

- [#2344](https://github.com/aurelia/aurelia/pull/2344) [`c803ffe`](https://github.com/aurelia/aurelia/commit/c803ffe7fd03835cbb79925ecb6237b8fdd3156b) Thanks [@fkleuver](https://github.com/fkleuver)! - **BREAKING CHANGE:** Replace `primary` on bindable definitions with `defaultProperty` on custom attribute definitions.

  **Before (no longer supported):**

  ```typescript
  @customAttribute("tooltip")
  export class TooltipAttribute {
    @bindable({ primary: true }) message: string;
    @bindable position: string;
  }
  ```

  **After:**

  ```typescript
  @customAttribute({ name: "tooltip", defaultProperty: "message" })
  export class TooltipAttribute {
    @bindable message: string;
    @bindable position: string;
  }
  ```

  If `defaultProperty` is not specified, it defaults to `'value'`.

  ### Migration

  For custom attributes that used `@bindable({ primary: true })`:

  1. Remove `primary: true` from the `@bindable` decorator
  2. Add `defaultProperty: 'propertyName'` to the `@customAttribute` decorator

  For attributes using `CustomAttribute.define()`:

  ```typescript
  // Before
  CustomAttribute.define(
    {
      name: "my-attr",
      bindables: { prop: { primary: true } },
    },
    MyAttr
  );

  // After
  CustomAttribute.define(
    {
      name: "my-attr",
      defaultProperty: "prop",
      bindables: { prop: {} },
    },
    MyAttr
  );
  ```

- [#2341](https://github.com/aurelia/aurelia/pull/2341) [`bf5fb63`](https://github.com/aurelia/aurelia/commit/bf5fb6320c0f0dcdca3da6ab217d922ce538460b) Thanks [@fkleuver](https://github.com/fkleuver)! - **BREAKING CHANGE:** Remove `defaultBindingMode` from custom attribute definitions.

  This property was originally designed in Aurelia 1 to set the binding mode for the implicit `value` property of single-bindable custom attributes. In Aurelia 2, its behavior was unintentionally expanded to apply to all bindables on a custom attribute, which was never the intended design.

  To configure binding modes, use the `mode` option on individual `@bindable` decorators instead:

  ```typescript
  // Before (no longer supported)
  @customAttribute({
    name: "my-attr",
    defaultBindingMode: BindingMode.twoWay,
    bindables: ["value1", "value2"],
  })
  export class MyAttr {}

  // After
  @customAttribute({ name: "my-attr" })
  export class MyAttr {
    @bindable({ mode: BindingMode.twoWay }) value1: string;
    @bindable({ mode: BindingMode.twoWay }) value2: string;
  }
  ```

  For custom attributes without explicit bindables (using the implicit `value` property), declare the `value` bindable explicitly if you need a non-default binding mode:

  ```typescript
  // Before
  @customAttribute({
    name: "my-attr",
    defaultBindingMode: BindingMode.twoWay,
  })
  export class MyAttr {
    value: string; // implicit bindable with twoWay mode
  }

  // After
  @customAttribute({ name: "my-attr" })
  export class MyAttr {
    @bindable({ mode: BindingMode.twoWay }) value: string;
  }
  ```

- [#2311](https://github.com/aurelia/aurelia/pull/2311) [`ce985c1`](https://github.com/aurelia/aurelia/commit/ce985c1afeb3e04ef091c3d5feacc737124b86c4) Thanks [@fkleuver](https://github.com/fkleuver)! - Add SSR hydration support with manifest-based marker insertion for template controllers and hydration target elements.

## 2.0.0-beta.27

### Patch Changes

- Updated dependencies []:
  - @aurelia/expression-parser@2.0.0-beta.27
  - @aurelia/kernel@2.0.0-beta.27
  - @aurelia/metadata@2.0.0-beta.27

## 2.0.0-beta.26

### Patch Changes

- Updated dependencies []:
  - @aurelia/expression-parser@2.0.0-beta.26
  - @aurelia/kernel@2.0.0-beta.26
  - @aurelia/metadata@2.0.0-beta.26

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

<a name="2.0.0-beta.25"></a>

# 2.0.0-beta.25 (2025-07-10)

**Note:** Version bump only for package @aurelia/template-compiler

<a name="2.0.0-beta.24"></a>

# 2.0.0-beta.24 (2025-04-27)

### Features:

- **template-compiler:** add support for multiple .class values (#2146) ([3b7513a](https://github.com/aurelia/aurelia/commit/3b7513a))

### Bug Fixes:

- **test:** dialog service test updated to reflect new error message ([b7c0eaa](https://github.com/aurelia/aurelia/commit/b7c0eaa))

### Refactorings:

- **packages:** only link to docs for errors in dev mode ([b7c0eaa](https://github.com/aurelia/aurelia/commit/b7c0eaa))
- **template-compiler:** only link to errors in dev mode ([b7c0eaa](https://github.com/aurelia/aurelia/commit/b7c0eaa))

<a name="2.0.0-beta.23"></a>

# 2.0.0-beta.23 (2025-01-26)

### Features:

- **tooling:** type-checking for templates - Phase1 (#2066) ([ebc1d0c](https://github.com/aurelia/aurelia/commit/ebc1d0c))

<a name="2.0.0-beta.22"></a>

# 2.0.0-beta.22 (2024-09-30)

**Note:** Version bump only for package @aurelia/template-compiler

<a name="2.0.0-beta.21"></a>

# 2.0.0-beta.21 (2024-08-08)

**Note:** Version bump only for package @aurelia/template-compiler

<a name="2.0.0-beta.20"></a>

# 2.0.0-beta.20 (2024-07-07)

**Note:** Version bump only for package @aurelia/template-compiler

<a name="2.0.0-beta.19"></a>

# 2.0.0-beta.19 (2024-06-12)

### Bug Fixes:

- **plugin-conventions:** relax typescript dependency version ([02921ca](https://github.com/aurelia/aurelia/commit/02921ca))

<a name="2.0.0-beta.18"></a>

# 2.0.0-beta.18 (2024-05-23)

### Bug Fixes:

- **di:** use official metadata instead of weakmap (#1977) ([9aeeffa](https://github.com/aurelia/aurelia/commit/9aeeffa))
- **convention:** use array for bindables isntead of object (#1967) ([f1a73d6](https://github.com/aurelia/aurelia/commit/f1a73d6))

### Refactorings:

- **\*:** resolve previous PR comments (#1968) ([f8ed38d](https://github.com/aurelia/aurelia/commit/f8ed38d))

<a name="2.0.0-beta.17"></a>

# 2.0.0-beta.17 (2024-05-11)

### Features:

- **template:** support spread syntax with spread command and ... (#1965) ([ccae63b](https://github.com/aurelia/aurelia/commit/ccae63b))
- **template:** auto infer binding expression when empty (#1963) ([3359939](https://github.com/aurelia/aurelia/commit/3359939))

### Bug Fixes:

- **compiler:** fix order when spreading custom attribute into element bindable, improve doc, add tests ([ccae63b](https://github.com/aurelia/aurelia/commit/ccae63b))
- **(state:** auto infer binding expression when empty ([ccae63b](https://github.com/aurelia/aurelia/commit/ccae63b))
- **au-slot:** separate parent scope selection from host scope selection (#1961) ([ff605fb](https://github.com/aurelia/aurelia/commit/ff605fb))

### Refactorings:

- **kernel:** mark side effect free (#1964) ([22c8f71](https://github.com/aurelia/aurelia/commit/22c8f71))

<a name="2.0.0-beta.16"></a>

# 2.0.0-beta.16 (2024-05-03)

### Refactorings:

- **\*:** extract template compiler into own package (#1954) ([ad7ae1e](https://github.com/aurelia/aurelia/commit/ad7ae1e))
