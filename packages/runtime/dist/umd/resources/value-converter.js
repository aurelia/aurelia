(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "@aurelia/kernel"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const kernel_1 = require("@aurelia/kernel");
    function valueConverter(nameOrDefinition) {
        return target => exports.ValueConverter.define(nameOrDefinition, target); // TODO: fix this at some point
    }
    exports.valueConverter = valueConverter;
    exports.ValueConverter = Object.freeze({
        name: 'value-converter',
        keyFrom(name) {
            return `${exports.ValueConverter.name}:${name}`;
        },
        isType(Type) {
            return Type.kind === exports.ValueConverter;
        },
        define(nameOrDefinition, ctor) {
            const Type = ctor;
            const description = typeof nameOrDefinition === 'string'
                ? { name: nameOrDefinition }
                : nameOrDefinition;
            Type.kind = exports.ValueConverter;
            Type.description = description;
            Type.register = function register(container) {
                const key = exports.ValueConverter.keyFrom(description.name);
                kernel_1.Registration.singleton(key, Type).register(container);
                kernel_1.Registration.alias(key, Type).register(container);
            };
            return Type;
        },
    });
});
//# sourceMappingURL=value-converter.js.map