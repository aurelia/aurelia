import { bindable, customElement } from "@aurelia/runtime";

@customElement({
    containerless: true,
    name: "anim-box", template: `
<template>
<div class="AnimBox" data-id="\${data.id & oneTime}"
    css="border-radius:\${(data.time % 10).toString() & oneTime}px;background:rgba(0,0,0,\${(0.5 + ((data.time % 10) / 10)).toString() & oneTime})" />
</template>
`})
export class AnimBox {
    @bindable public data: any;
}