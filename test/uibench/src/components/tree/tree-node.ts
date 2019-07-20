import { bindable, customElement } from "@aurelia/runtime";

@customElement({
    containerless: true,
    name: 'tree-node', template:
        `
<template>
    <ul class="TreeNode">
    <li as-element="tree-node" repeat.for="item of treeNodes" key="\${item.id & oneTime}" data.one-time="item"/>
    <li as-element="tree-leaf" repeat.for="item of treeLeafs" key="\${item.id & oneTime}" data.one-time="item"/>

    </ul>
</template>
`})
export class TreeNode {
    @bindable public data?: { children?: any[] };
    public treeNodes: any;
    public treeLeafs: any;
    public binding() {
        this.treeNodes = this.data!.children!.filter((y) => y.container);
        this.treeLeafs = this.data!.children!.filter((y) => !y.container);
    }
}
