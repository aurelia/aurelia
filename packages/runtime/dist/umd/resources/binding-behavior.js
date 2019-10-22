(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "@aurelia/kernel", "../definitions"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const kernel_1 = require("@aurelia/kernel");
    const definitions_1 = require("../definitions");
    function bindingBehavior(nameOrDef) {
        return function (target) {
            return exports.BindingBehavior.define(nameOrDef, target);
        };
    }
    exports.bindingBehavior = bindingBehavior;
    class BindingBehaviorDefinition {
        constructor(Type, name, aliases, key) {
            this.Type = Type;
            this.name = name;
            this.aliases = aliases;
            this.key = key;
        }
        static create(nameOrDef, Type) {
            let name;
            let def;
            if (typeof nameOrDef === 'string') {
                name = nameOrDef;
                def = { name };
            }
            else {
                name = nameOrDef.name;
                def = nameOrDef;
            }
            return new BindingBehaviorDefinition(Type, kernel_1.firstDefined(exports.BindingBehavior.getAnnotation(Type, 'name'), name), kernel_1.mergeArrays(exports.BindingBehavior.getAnnotation(Type, 'aliases'), def.aliases, Type.aliases), exports.BindingBehavior.keyFrom(name));
        }
        register(container) {
            const { Type, key, aliases } = this;
            kernel_1.Registration.singleton(key, Type).register(container);
            kernel_1.Registration.alias(key, Type).register(container);
            definitions_1.registerAliases(aliases, exports.BindingBehavior, key, container);
        }
    }
    exports.BindingBehaviorDefinition = BindingBehaviorDefinition;
    exports.BindingBehavior = {
        name: kernel_1.Protocol.resource.keyFor('binding-behavior'),
        keyFrom(name) {
            return `${exports.BindingBehavior.name}:${name}`;
        },
        isType(value) {
            return typeof value === 'function' && kernel_1.Metadata.hasOwn(exports.BindingBehavior.name, value);
        },
        define(nameOrDef, Type) {
            const definition = BindingBehaviorDefinition.create(nameOrDef, Type);
            kernel_1.Metadata.define(exports.BindingBehavior.name, definition, definition.Type);
            kernel_1.Metadata.define(exports.BindingBehavior.name, definition, definition);
            kernel_1.Protocol.resource.appendTo(Type, exports.BindingBehavior.name);
            return definition.Type;
        },
        getDefinition(Type) {
            const def = kernel_1.Metadata.getOwn(exports.BindingBehavior.name, Type);
            if (def === void 0) {
                throw new Error(`No definition found for type ${Type.name}`);
            }
            return def;
        },
        annotate(Type, prop, value) {
            kernel_1.Metadata.define(kernel_1.Protocol.annotation.keyFor(prop), value, Type);
        },
        getAnnotation(Type, prop) {
            return kernel_1.Metadata.getOwn(kernel_1.Protocol.annotation.keyFor(prop), Type);
        },
    };
});
//# sourceMappingURL=binding-behavior.js.map