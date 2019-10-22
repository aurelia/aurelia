(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "@aurelia/kernel", "../definitions", "../flags", "../templating/bindable"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const kernel_1 = require("@aurelia/kernel");
    const definitions_1 = require("../definitions");
    const flags_1 = require("../flags");
    const bindable_1 = require("../templating/bindable");
    function customAttribute(nameOrDef) {
        return function (target) {
            return exports.CustomAttribute.define(nameOrDef, target);
        };
    }
    exports.customAttribute = customAttribute;
    function templateController(nameOrDef) {
        return function (target) {
            return exports.CustomAttribute.define(typeof nameOrDef === 'string'
                ? { isTemplateController: true, name: nameOrDef }
                : { isTemplateController: true, ...nameOrDef }, target);
        };
    }
    exports.templateController = templateController;
    class CustomAttributeDefinition {
        constructor(Type, name, aliases, key, defaultBindingMode, isTemplateController, bindables, strategy, hooks) {
            this.Type = Type;
            this.name = name;
            this.aliases = aliases;
            this.key = key;
            this.defaultBindingMode = defaultBindingMode;
            this.isTemplateController = isTemplateController;
            this.bindables = bindables;
            this.strategy = strategy;
            this.hooks = hooks;
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
            return new CustomAttributeDefinition(Type, kernel_1.firstDefined(exports.CustomAttribute.getAnnotation(Type, 'name'), name), kernel_1.mergeArrays(exports.CustomAttribute.getAnnotation(Type, 'aliases'), def.aliases, Type.aliases), exports.CustomAttribute.keyFrom(name), kernel_1.firstDefined(exports.CustomAttribute.getAnnotation(Type, 'defaultBindingMode'), def.defaultBindingMode, Type.defaultBindingMode, flags_1.BindingMode.toView), kernel_1.firstDefined(exports.CustomAttribute.getAnnotation(Type, 'isTemplateController'), def.isTemplateController, Type.isTemplateController, false), bindable_1.Bindable.from(...bindable_1.Bindable.getAll(Type), exports.CustomAttribute.getAnnotation(Type, 'bindables'), Type.bindables, def.bindables), kernel_1.firstDefined(exports.CustomAttribute.getAnnotation(Type, 'strategy'), def.strategy, Type.strategy, 1 /* getterSetter */), kernel_1.firstDefined(exports.CustomAttribute.getAnnotation(Type, 'hooks'), def.hooks, Type.hooks, new definitions_1.HooksDefinition(Type.prototype)));
        }
        register(container) {
            const { Type, key, aliases } = this;
            kernel_1.Registration.transient(key, Type).register(container);
            kernel_1.Registration.alias(key, Type).register(container);
            definitions_1.registerAliases(aliases, exports.CustomAttribute, key, container);
        }
    }
    exports.CustomAttributeDefinition = CustomAttributeDefinition;
    exports.CustomAttribute = {
        name: kernel_1.Protocol.resource.keyFor('custom-attribute'),
        keyFrom(name) {
            return `${exports.CustomAttribute.name}:${name}`;
        },
        isType(value) {
            return typeof value === 'function' && kernel_1.Metadata.hasOwn(exports.CustomAttribute.name, value);
        },
        define(nameOrDef, Type) {
            const definition = CustomAttributeDefinition.create(nameOrDef, Type);
            kernel_1.Metadata.define(exports.CustomAttribute.name, definition, definition.Type);
            kernel_1.Metadata.define(exports.CustomAttribute.name, definition, definition);
            kernel_1.Protocol.resource.appendTo(Type, exports.CustomAttribute.name);
            return definition.Type;
        },
        getDefinition(Type) {
            const def = kernel_1.Metadata.getOwn(exports.CustomAttribute.name, Type);
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
//# sourceMappingURL=custom-attribute.js.map