"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TestConfiguration = exports.JsonValueConverter = exports.SortValueConverter = void 0;
const runtime_html_1 = require("@aurelia/runtime-html");
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
    runtime_html_1.valueConverter('sort')
], SortValueConverter);
exports.SortValueConverter = SortValueConverter;
let JsonValueConverter = class JsonValueConverter {
    toView(input) {
        return JSON.stringify(input);
    }
    fromView(input) {
        return JSON.parse(input);
    }
};
JsonValueConverter = __decorate([
    runtime_html_1.valueConverter('json')
], JsonValueConverter);
exports.JsonValueConverter = JsonValueConverter;
let NameTag = class NameTag {
};
__decorate([
    runtime_html_1.bindable()
], NameTag.prototype, "name", void 0);
NameTag = __decorate([
    runtime_html_1.customElement({
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
exports.TestConfiguration = {
    register(container) {
        container.register(...globalResources);
    }
};
//# sourceMappingURL=resources.js.map