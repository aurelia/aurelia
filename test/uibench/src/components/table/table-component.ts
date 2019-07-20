import { bindable, customElement } from "@aurelia/runtime";

@customElement({
    containerless: true,
    name: 'table-component', template: `
<template>
    <table class="Table">
        <tbody>
            <tr as-element="table-row" repeat.for="item of data.table.items" data.one-time="item" />
        </tbody>
    </table>
</template>
`})
export class TableComponent {
    @bindable public data: any;
}
