import { bindable, customElement } from "@aurelia/runtime";

@customElement({
    containerless: true,
    name: 'anim', template:
        `
<template>
    <div class="Anim">
        <div as-element="anim-box"
        repeat.for="item of data.anim.items" key="\${item.id & oneTime}" data.one-time="item"/>
</template>
`})
export class Anim {
    @bindable public data: any;
}
