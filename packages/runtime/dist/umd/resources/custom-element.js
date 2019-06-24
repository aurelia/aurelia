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
    /** @internal */
    function registerElement(container) {
        const resourceKey = this.kind.keyFrom(this.description.name);
        container.register(kernel_1.Registration.transient(resourceKey, this));
        container.register(kernel_1.Registration.transient(this, this));
    }
    exports.registerElement = registerElement;
    function customElement(nameOrDefinition) {
        return (target => exports.CustomElementResource.define(nameOrDefinition, target));
    }
    exports.customElement = customElement;
    function isType(Type) {
        return Type.kind === this;
    }
    function define(nameOrDefinition, ctor = null) {
        if (!nameOrDefinition) {
            throw kernel_1.Reporter.error(70);
        }
        const Type = (ctor == null ? class HTMLOnlyElement {
        } : ctor);
        const WritableType = Type;
        const description = definitions_1.buildTemplateDefinition(Type, nameOrDefinition);
        WritableType.kind = exports.CustomElementResource;
        Type.description = description;
        Type.register = registerElement;
        return Type;
    }
    exports.CustomElementResource = {
        name: definitions_1.customElementName,
        keyFrom: definitions_1.customElementKey,
        isType,
        behaviorFor: definitions_1.customElementBehavior,
        define
    };
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
});
//# sourceMappingURL=custom-element.js.map