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
    /**
     * TargetedInstructionType enum values become the property names for the associated renderers when they are injected
     * into the `Renderer`.
     *
     * Additional instruction types can be added as long as they are 2 characters long and do not clash with existing ones.
     *
     * By convention, the instruction types for a particular runtime start with the same first letter, and the second letter
     * starts counting from letter `a`. The standard runtime instruction types all start with the letter `r`.
     */
    var TargetedInstructionType;
    (function (TargetedInstructionType) {
        TargetedInstructionType["hydrateElement"] = "ra";
        TargetedInstructionType["hydrateAttribute"] = "rb";
        TargetedInstructionType["hydrateTemplateController"] = "rc";
        TargetedInstructionType["hydrateLetElement"] = "rd";
        TargetedInstructionType["setProperty"] = "re";
        TargetedInstructionType["interpolation"] = "rf";
        TargetedInstructionType["propertyBinding"] = "rg";
        TargetedInstructionType["callBinding"] = "rh";
        TargetedInstructionType["letBinding"] = "ri";
        TargetedInstructionType["refBinding"] = "rj";
        TargetedInstructionType["iteratorBinding"] = "rk";
    })(TargetedInstructionType = exports.TargetedInstructionType || (exports.TargetedInstructionType = {}));
    exports.ITargetedInstruction = kernel_1.DI.createInterface('ITargetedInstruction').noDefault();
    function isTargetedInstruction(value) {
        const type = value.type;
        return typeof type === 'string' && type.length === 2;
    }
    exports.isTargetedInstruction = isTargetedInstruction;
    class HooksDefinition {
        constructor(target) {
            this.hasRender = 'render' in target;
            this.hasCreated = 'created' in target;
            this.hasBinding = 'binding' in target;
            this.hasBound = 'bound' in target;
            this.hasUnbinding = 'unbinding' in target;
            this.hasUnbound = 'unbound' in target;
            this.hasAttaching = 'attaching' in target;
            this.hasAttached = 'attached' in target;
            this.hasDetaching = 'detaching' in target;
            this.hasDetached = 'detached' in target;
            this.hasCaching = 'caching' in target;
        }
    }
    exports.HooksDefinition = HooksDefinition;
    HooksDefinition.none = Object.freeze(new HooksDefinition({}));
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
            kernel_1.Registration.alias(key, resource.keyFrom(aliases[i])).register(container);
        }
    }
    exports.registerAliases = registerAliases;
});
//# sourceMappingURL=definitions.js.map