import { customElement } from "aurelia";

@customElement({
    name: 'lazy',
    template: `
    <div>This is lazy loaded</div>
    `,
})
export class Lazy { }
