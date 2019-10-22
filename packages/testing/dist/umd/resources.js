(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "tslib", "@aurelia/runtime"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const tslib_1 = require("tslib");
    const runtime_1 = require("@aurelia/runtime");
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
    SortValueConverter = tslib_1.__decorate([
        runtime_1.valueConverter('sort')
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
    JsonValueConverter = tslib_1.__decorate([
        runtime_1.valueConverter('json')
    ], JsonValueConverter);
    exports.JsonValueConverter = JsonValueConverter;
    let NameTag = class NameTag {
    };
    tslib_1.__decorate([
        runtime_1.bindable()
    ], NameTag.prototype, "name", void 0);
    NameTag = tslib_1.__decorate([
        runtime_1.customElement({
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
});
//# sourceMappingURL=resources.js.map