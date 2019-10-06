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
    function customAttribute(nameOrDefinition) {
        return target => exports.CustomAttribute.define(nameOrDefinition, target); // TODO: fix this at some point
    }
    exports.customAttribute = customAttribute;
    function templateController(nameOrDefinition) {
        return target => exports.CustomAttribute.define(typeof nameOrDefinition === 'string'
            ? { isTemplateController: true, name: nameOrDefinition }
            : { isTemplateController: true, ...nameOrDefinition }, target); // TODO: fix this at some point
    }
    exports.templateController = templateController;
    exports.CustomAttribute = Object.freeze({
        name: 'custom-attribute',
        keyFrom(name) {
            return `${exports.CustomAttribute.name}:${name}`;
        },
        isType(Type) {
            return Type.kind === exports.CustomAttribute;
        },
        define(nameOrDefinition, ctor) {
            const Type = ctor;
            const WritableType = Type;
            const description = createCustomAttributeDescription(typeof nameOrDefinition === 'string' ? { name: nameOrDefinition } : nameOrDefinition, Type);
            WritableType.kind = exports.CustomAttribute;
            WritableType.description = description;
            WritableType.aliases = Type.aliases == null ? kernel_1.PLATFORM.emptyArray : Type.aliases;
            Type.register = function register(container) {
                const aliases = description.aliases;
                const key = exports.CustomAttribute.keyFrom(description.name);
                kernel_1.Registration.transient(key, this).register(container);
                kernel_1.Registration.alias(key, this).register(container);
                definitions_1.registerAliases([...aliases, ...this.aliases], exports.CustomAttribute, key, container);
            };
            return Type;
        },
    });
    /** @internal */
    function createCustomAttributeDescription(def, Type) {
        const aliases = def.aliases;
        const defaultBindingMode = def.defaultBindingMode;
        return {
            name: def.name,
            aliases: aliases == null ? kernel_1.PLATFORM.emptyArray : aliases,
            defaultBindingMode: defaultBindingMode == null ? flags_1.BindingMode.toView : defaultBindingMode,
            isTemplateController: def.isTemplateController === undefined ? false : def.isTemplateController,
            bindables: { ...bindable_1.Bindable.for(Type).get(), ...bindable_1.Bindable.for(def).get() },
            strategy: flags_1.ensureValidStrategy(def.strategy),
            hooks: new definitions_1.HooksDefinition(Type.prototype)
        };
    }
    exports.createCustomAttributeDescription = createCustomAttributeDescription;
});
//# sourceMappingURL=custom-attribute.js.map