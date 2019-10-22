(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "@aurelia/kernel", "@aurelia/runtime"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const kernel_1 = require("@aurelia/kernel");
    const runtime_1 = require("@aurelia/runtime");
    function bindingCommand(nameOrDefinition) {
        return function (target) {
            return exports.BindingCommand.define(nameOrDefinition, target);
        };
    }
    exports.bindingCommand = bindingCommand;
    class BindingCommandDefinition {
        constructor(Type, name, aliases, key, type) {
            this.Type = Type;
            this.name = name;
            this.aliases = aliases;
            this.key = key;
            this.type = type;
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
            return new BindingCommandDefinition(Type, kernel_1.firstDefined(exports.BindingCommand.getAnnotation(Type, 'name'), name), kernel_1.mergeArrays(exports.BindingCommand.getAnnotation(Type, 'aliases'), def.aliases, Type.aliases), exports.BindingCommand.keyFrom(name), kernel_1.firstDefined(exports.BindingCommand.getAnnotation(Type, 'type'), def.type, Type.type, null));
        }
        register(container) {
            const { Type, key, aliases } = this;
            kernel_1.Registration.singleton(key, Type).register(container);
            kernel_1.Registration.alias(key, Type).register(container);
            runtime_1.registerAliases(aliases, exports.BindingCommand, key, container);
        }
    }
    exports.BindingCommandDefinition = BindingCommandDefinition;
    exports.BindingCommand = {
        name: kernel_1.Protocol.resource.keyFor('binding-command'),
        keyFrom(name) {
            return `${exports.BindingCommand.name}:${name}`;
        },
        isType(value) {
            return typeof value === 'function' && kernel_1.Metadata.hasOwn(exports.BindingCommand.name, value);
        },
        define(nameOrDef, Type) {
            const definition = BindingCommandDefinition.create(nameOrDef, Type);
            kernel_1.Metadata.define(exports.BindingCommand.name, definition, definition.Type);
            kernel_1.Metadata.define(exports.BindingCommand.name, definition, definition);
            kernel_1.Protocol.resource.appendTo(Type, exports.BindingCommand.name);
            return definition.Type;
        },
        getDefinition(Type) {
            const def = kernel_1.Metadata.getOwn(exports.BindingCommand.name, Type);
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