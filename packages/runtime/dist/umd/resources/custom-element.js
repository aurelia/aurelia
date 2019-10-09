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
    exports.IProjectorLocator = kernel_1.DI.createInterface('IProjectorLocator').noDefault();
    function customElement(nameOrDefinition) {
        return (target => exports.CustomElement.define(nameOrDefinition, target));
    }
    exports.customElement = customElement;
    exports.CustomElement = Object.freeze({
        name: 'custom-element',
        keyFrom(name) {
            return `${exports.CustomElement.name}:${name}`;
        },
        isType(Type) {
            return Type.kind === exports.CustomElement;
        },
        behaviorFor(node) {
            return node.$controller;
        },
        define(nameOrDefinition, ctor = null) {
            if (!nameOrDefinition) {
                throw kernel_1.Reporter.error(70);
            }
            const Type = (ctor == null ? class HTMLOnlyElement {
            } : ctor);
            const WritableType = Type;
            const description = definitions_1.buildTemplateDefinition(Type, nameOrDefinition);
            WritableType.kind = exports.CustomElement;
            WritableType.description = description;
            WritableType.aliases = Type.aliases == null ? kernel_1.PLATFORM.emptyArray : Type.aliases;
            Type.register = function register(container) {
                const aliases = description.aliases;
                const key = exports.CustomElement.keyFrom(description.name);
                kernel_1.Registration.transient(key, this).register(container);
                kernel_1.Registration.alias(key, this).register(container);
                definitions_1.registerAliases([...aliases, ...this.aliases], exports.CustomElement, key, container);
            };
            return Type;
        },
    });
    const defaultShadowOptions = {
        mode: 'open'
    };
    function useShadowDOM(targetOrOptions) {
        const options = typeof targetOrOptions === 'function' || !targetOrOptions
            ? defaultShadowOptions
            : targetOrOptions;
        function useShadowDOMDecorator(target) {
            target.shadowOptions = options;
            return target;
        }
        return typeof targetOrOptions === 'function' ? useShadowDOMDecorator(targetOrOptions) : useShadowDOMDecorator;
    }
    exports.useShadowDOM = useShadowDOM;
    function containerlessDecorator(target) {
        target.containerless = true;
        return target;
    }
    function containerless(target) {
        return target === undefined ? containerlessDecorator : containerlessDecorator(target);
    }
    exports.containerless = containerless;
    function strictBindingDecorator(target) {
        target.isStrictBinding = true;
        return target;
    }
    function strict(target) {
        return target === undefined ? strictBindingDecorator : strictBindingDecorator(target);
    }
    exports.strict = strict;
});
//# sourceMappingURL=custom-element.js.map