import { bindable, customElement } from "@aurelia/runtime";

@customElement({
    containerless: true,
    name: 'table-row',
    template:
        `
<template>
<tr class="\${classes}" data-id="\${data.id & oneTime}">
    <td as-element="table-cell" text="#\${data.id & oneTime}" />
    <td as-element="table-cell" repeat.for="cell of data.props" text.one-time="cell" />
</tr>
</template>
`})
export class TableRow {
    @bindable public data: any;

    get classes() {
        return (this.data.active) ? 'TableRow active' : 'TableRow';
    }
}
