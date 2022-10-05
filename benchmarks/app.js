import { Aurelia, CustomElement, StandardConfiguration } from '@aurelia/runtime-html';
import { createItems } from './utils/data.js';

let $count = 0;

const App = CustomElement.define({
    name: 'app',
    template: '<div repeat.for="i of items">${i.message}</div>'
}, class {
    constructor() {
        this.newItems($count);
    }

    newItems(count, seed = 0) {
        this.items = createItems(count, seed);
    }

    updateItems() {
        const len = this.items.length;
        this.items.forEach((i, idx) => i.update(len - idx + 1))
    }
});

export const start = (host, count = 0) => {
    $count = count;
    const au = new Aurelia().register(StandardConfiguration).app({
        component: App,
        host
    });
    au.start();

    return au;
};
