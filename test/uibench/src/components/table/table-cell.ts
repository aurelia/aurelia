import { bindable, customElement } from "@aurelia/runtime";

@customElement({
    containerless: true,
    name: 'table-cell',
    template: `
<template>
    <td class="TableCell" click.delegate="onClick($event)">\${text & oneTime}</td>
</template>
`})
export class TableCell {
    @bindable public text: string = '';

    public onClick = (e: MouseEvent) => {
        // tslint:disable-next-line: no-console
        console.log('Clicked' + this.text);
        e.stopPropagation();
    }
}
