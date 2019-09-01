# Leveraging Dynamic Composition

## Composition

In order to live by the DRY \(Don't Repeat Yourself\) Principle, we don't necessarily want to rely on tight coupling between our view and view-model pairs. Wouldn't it be great if there was a custom element that would arbitrarily combine an HTML template, a view-model, and maybe even some initialization data for us? As it turns out, we're in luck:

// TODO: fix this sample as there are breaking changes in compose

\`\`\`HTML compose-template.html

```text
```HTML hello.html
<template>
  Hello, ${friend}!
</template>
```

\`\`\`JavaScript hello.js export class Hello { activate\(model\) { this.friend = model.target; } }

\`\`\`

Note that the view-model we're composing into has an `activate` method. When we use `model.bind`, the contents are passed to `activate`. We then pull the exact value that we need out of the passed model and assign it.

