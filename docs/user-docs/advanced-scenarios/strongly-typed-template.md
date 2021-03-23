# Strongly-typed Template

Many users may be familiar with libraries such as [FAST Element](https://www.fast.design/docs/fast-element/declaring-templates) or [lit-html ](https://lit-html.polymer-project.org/). They want to know how to write strongly-typed templates with Aurelia.

In the following, we will see how to write a template as follows and introduce it to Aurelia.

```typescript
export const buttonTemplate = html<BootstrapButton>`
    <button class="btn btn-primary btn-${x => x.size} ${x => x.block ? 'btn-block' : ''}" ref="bsButtonTemplate">
        ${(x) => x.getName()}
    </button>
`;
```

To do this, we need two simple functionality so, create a `strongly-typed-template` file.

```typescript
// strongly-typed-template.ts

type TemplateValue<T> = { [P in keyof T]: T[P] extends Function ? never : P }[keyof T] | ((val: T) => unknown);;

function parse(val: any) {
    const variable = val?.toString();
    const isFunc = variable.indexOf("f") > -1;
    if (!variable) return "";
    const firstParanthesis = variable.indexOf("(") + 1;
    const secondParanthesis = variable.indexOf(")");
    const variableName = variable.substring(firstParanthesis, secondParanthesis) || variable[0];
    const regex = new RegExp(`${variableName}\\.`, "g");
    return variable
        .substring(
            isFunc ? variable.indexOf("return") + 7 : variable.indexOf("=>") + 3
        )
        .replace(regex, "");
}

export const html = <TSource = any>(
    strings: TemplateStringsArray, // html text
    ...values: TemplateValue<TSource>[] // variables which they are functions.
) => {
    let html = "";
    for (let i = 0, ii = strings.length - 1; i < ii; ++i) {
        const currentString = strings[i];
        const value = values[i];
        html += currentString;
        if (typeof value === "function") {
            const parsed = parse(value);
            html += `\${${parsed}}`;
            continue;
        }
        html += `\${${value}}`;
    }

    html += strings[strings.length - 1];
    return html;
}
```

The idea behind the code is really simple. First we separate strings and variables parts inside `html` function.

string\(s\):

```markup
<button class="btn btn-primary btn-

" ref="atButtonTemplate">

</button>
```

variable\(s\):

```typescript
x => x.size

x => x.block ? 'btn-block' : ''

(x) => x.getName()
```

Then, for variable parts we remove lambda part \(`VARIABLE => VARIABLE.`\) by regex via `parse` function. Finally, an HTML is created according to the acceptable standards for Aurelia template engine.

The generic parameter in this function is actually your **view-model**.

```typescript
// bs-button-temlate.ts

import { html } from './strongly-typed-template';

// BootstrapButton is my view-model
export const buttonTemplate = html<BootstrapButton>`
    <button class="btn btn-primary btn-${x => x.size} ${x => x.block ? 'btn-block' : ''}" ref="bsButtonTemplate">
        ${(x) => x.getName()}
    </button>
`;
```

Now, we have to introduce this strongly-typed template to Aurelia via `template` option.

```typescript
// bs-button.ts

import { buttonTemplate } from "./bs-button-temlate";

@customElement({ name: "bs-button", template: buttonTemplate /* HERE */ })
export class BootstrapButton /* view-model */ {
    @bindable({ mode: BindingMode.toView }) public size: string;
    @bindable({ mode: BindingMode.toView }) public block: boolean;
    getName() {
        return "Primary Button";
    }
}
```

