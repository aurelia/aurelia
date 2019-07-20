import { bindable, customElement } from "@aurelia/runtime";

@customElement({
    containerless: true,
    name: 'tree-leaf', template:
        `
<template>
    <li class="TreeLeaf">\${data.id & oneTime}</li>
</template>
`})
export class TreeLeaf {
    @bindable public data: any;
}
