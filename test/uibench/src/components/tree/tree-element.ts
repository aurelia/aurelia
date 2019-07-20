import { bindable, customElement } from "@aurelia/runtime";

@customElement({
    containerless: true,
    name: 'tree-element', template:
        `
<template>
    <div class="Tree">
        <tree-node data.one-time="data.tree.root"></tree-node>
    </div>
</template>
`})
export class TreeElement {
    @bindable public data: any;
}
