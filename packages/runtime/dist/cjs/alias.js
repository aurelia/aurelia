"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerAliases = exports.alias = void 0;
const kernel_1 = require("@aurelia/kernel");
function alias(...aliases) {
    return function (target) {
        const key = kernel_1.Protocol.annotation.keyFor('aliases');
        const existing = kernel_1.Metadata.getOwn(key, target);
        if (existing === void 0) {
            kernel_1.Metadata.define(key, aliases, target);
        }
        else {
            existing.push(...aliases);
        }
    };
}
exports.alias = alias;
function registerAliases(aliases, resource, key, container) {
    for (let i = 0, ii = aliases.length; i < ii; ++i) {
        kernel_1.Registration.aliasTo(key, resource.keyFrom(aliases[i])).register(container);
    }
}
exports.registerAliases = registerAliases;
//# sourceMappingURL=alias.js.map