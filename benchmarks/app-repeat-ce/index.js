import { Aurelia, CustomElement, StandardConfiguration } from '@aurelia/runtime-html';
import { createItems } from '../utils/data.js';
import { startApplication } from '../utils/start-application.mjs';
export { tasksSettled } from '../utils/start-application.mjs';

let $count = 0;

const App = CustomElement.define({
    name: 'app',
    template: '<hello repeat.for="i of items" message.bind="i.message">',
    dependencies: [CustomElement.define({
        name: 'hello',
        template: 'hello ${message} item',
        bindables: ['message']
    }, class Hello {})]
}, class App {
    constructor() {
        this.newItems($count);
    }

    newItems(count, seed = 0) {
        this.items = createItems(count, seed);
    }

    updateItems() {
        const count = this.items.length;
        this.items.forEach((i, idx) => i.update(count - idx + 1))
    }
});

export const start = (host, count = 0) => {
    $count = count;
    const au = new Aurelia().register(StandardConfiguration).app({
        component: App,
        host
    });
    return startApplication(au);
};
