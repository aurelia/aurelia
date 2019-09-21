### `@aurelia/runtime`

#### call-binding

Assigns the result of the method call to the attribute.

```html
<el attr="func()"></el>
```

#### interpolation-binding

Evaluates interpolation expression.

### Test plan

#### Atoms

##### Read-only textual CE

**Usage:**

```html
<my-text value.bind="val-expr"></my-text>
```
TODO: need better name than `my-text`.

**Definition:**

```html
${value}
```

**Potential coverage targets**

- interpolation binding
- call-binding (with the help of a higher-level CE that binds the value using a method call)
- i18n (maybe later)

#### Molecules

##### Greetings

**Usage:**

```html
<greeting name.bind="expr" is-birthday.bind="expr"></greeting>
```

**Definition:**

```html
<my-text value.bind="getGreeting()"></my-text>
```

**Potential coverage targets**

- call-binding
