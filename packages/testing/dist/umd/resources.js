var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "@aurelia/runtime"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
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
    SortValueConverter = __decorate([
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
    JsonValueConverter = __decorate([
        runtime_1.valueConverter('json')
    ], JsonValueConverter);
    exports.JsonValueConverter = JsonValueConverter;
    let NameTag = class NameTag {
    };
    __decorate([
        runtime_1.bindable(),
        __metadata("design:type", String)
    ], NameTag.prototype, "name", void 0);
    NameTag = __decorate([
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