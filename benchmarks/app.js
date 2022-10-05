import { Aurelia, CustomElement, StandardConfiguration } from '@aurelia/runtime-html';

const App = CustomElement.define({
    name: 'app',
    template: '<div repeat.for="i of items">${i}</div>'
}, class {
    items = [1, 2, 3];
});

export const start = (host) => {
    const au = new Aurelia().register(StandardConfiguration).app({
        component: App,
        host
    });
    au.start();

    return au;
};
