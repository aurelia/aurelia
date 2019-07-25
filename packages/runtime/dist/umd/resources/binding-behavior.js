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
    function bindingBehavior(nameOrDefinition) {
        return target => exports.BindingBehavior.define(nameOrDefinition, target); // TODO: fix this at some point
    }
    exports.bindingBehavior = bindingBehavior;
    exports.BindingBehavior = Object.freeze({
        name: 'binding-behavior',
        keyFrom(name) {
            return `${exports.BindingBehavior.name}:${name}`;
        },
        isType(Type) {
            return Type.kind === exports.BindingBehavior;
        },
        define(nameOrDefinition, ctor) {
            const Type = ctor;
            const WritableType = Type;
            const description = typeof nameOrDefinition === 'string'
                ? { name: nameOrDefinition }
                : nameOrDefinition;
            WritableType.kind = exports.BindingBehavior;
            WritableType.description = description;
            Type.register = function register(container) {
                const key = exports.BindingBehavior.keyFrom(description.name);
                kernel_1.Registration.singleton(key, Type).register(container);
                kernel_1.Registration.alias(key, Type).register(container);
            };
            return Type;
        },
    });
});
//# sourceMappingURL=binding-behavior.js.map