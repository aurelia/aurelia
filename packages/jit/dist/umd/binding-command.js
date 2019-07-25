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
    function bindingCommand(nameOrDefinition) {
        return target => exports.BindingCommandResource.define(nameOrDefinition, target);
    }
    exports.bindingCommand = bindingCommand;
    exports.BindingCommandResource = Object.freeze({
        name: 'binding-command',
        keyFrom(name) {
            return `${exports.BindingCommandResource.name}:${name}`;
        },
        isType(Type) {
            return Type.kind === exports.BindingCommandResource;
        },
        define(nameOrDefinition, ctor) {
            const Type = ctor;
            const WritableType = Type;
            const description = typeof nameOrDefinition === 'string' ? { name: nameOrDefinition, target: null } : nameOrDefinition;
            WritableType.kind = exports.BindingCommandResource;
            WritableType.description = description;
            Type.register = function register(container) {
                const key = exports.BindingCommandResource.keyFrom(description.name);
                kernel_1.Registration.singleton(key, Type).register(container);
                kernel_1.Registration.alias(key, Type).register(container);
            };
            return Type;
        },
    });
    function getTarget(binding, makeCamelCase) {
        if (binding.flags & 256 /* isBinding */) {
            return binding.bindable.propName;
        }
        else if (makeCamelCase) {
            return kernel_1.camelCase(binding.syntax.target);
        }
        else {
            return binding.syntax.target;
        }
    }
    exports.getTarget = getTarget;
});
//# sourceMappingURL=binding-command.js.map