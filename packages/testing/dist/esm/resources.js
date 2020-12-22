var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { bindable, customElement, valueConverter } from '@aurelia/runtime-html';
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