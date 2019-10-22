import { __decorate } from "tslib";
import { bindable, customElement, valueConverter } from '@aurelia/runtime';
let SortValueConverter = class SortValueConverter {
    toView(arr, prop, dir = 'asc') {
        if (Array.isArray(arr)) {
            const factor = dir === 'asc' ? 1 : -1;
            if (prop && prop.length) {
                arr.sort((a, b) => a[prop] - b[prop] * factor);
            }
            else {
                arr.sort((a, b) => a - b * factor);
            }
        }
        return arr;
    }
};
SortValueConverter = __decorate([
    valueConverter('sort')
], SortValueConverter);
export { SortValueConverter };
let JsonValueConverter = class JsonValueConverter {
    toView(input) {
        return JSON.stringify(input);
    }
    fromView(input) {
        return JSON.parse(input);
    }
};
JsonValueConverter = __decorate([
    valueConverter('json')
], JsonValueConverter);
export { JsonValueConverter };
let NameTag = class NameTag {
};
__decorate([
    bindable()
], NameTag.prototype, "name", void 0);
NameTag = __decorate([
    customElement({
        name: 'name-tag',
        template: `<template>\${name}</template>`,
        needsCompile: true,
        dependencies: [],
        instructions: [],
        surrogates: []
    })
], NameTag);
const globalResources = [
    SortValueConverter,
    JsonValueConverter,
    NameTag
];
export const TestConfiguration = {
    register(container) {
        container.register(...globalResources);
    }
};
//# sourceMappingURL=resources.js.map