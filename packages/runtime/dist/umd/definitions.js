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
    const parentPartsOwnPartsLookup = new WeakMap();
    /**
     * Efficiently merge parts, performing the minimal amount of work / using the minimal amount of memory.
     *
     * If either of the two part records is undefined, the other will simply be returned.
     *
     * If both are undefined, undefined will be returned.
     *
     * If neither are undefined, a new object will be returned where parts of the second value will be written last (and thus may overwrite duplicate named parts).
     *
     * This function is idempotent via a WeakMap cache: results are cached and if the same two variables are provided again, the same object will be returned.
     */
    function mergeParts(parentParts, ownParts) {
        if (parentParts === ownParts) {
            return parentParts;
        }
        if (parentParts === void 0) {
            return ownParts;
        }
        if (ownParts === void 0) {
            return parentParts;
        }
        let ownPartsLookup = parentPartsOwnPartsLookup.get(parentParts);
        if (ownPartsLookup === void 0) {
            parentPartsOwnPartsLookup.set(parentParts, ownPartsLookup = new WeakMap());
        }
        let mergedParts = ownPartsLookup.get(ownParts);
        if (mergedParts === void 0) {
            ownPartsLookup.set(ownParts, mergedParts = {
                ...parentParts,
                ...ownParts,
            });
        }
        return mergedParts;
    }
    exports.mergeParts = mergeParts;
    exports.ITargetedInstruction = kernel_1.DI.createInterface('ITargetedInstruction').noDefault();
    function isTargetedInstruction(value) {
        const type = value.type;
        return typeof type === 'string' && type.length === 2;
    }
    exports.isTargetedInstruction = isTargetedInstruction;
    class HooksDefinition {
        constructor(target) {
            this.hasCreate = 'create' in target;
            this.hasBeforeCompile = 'beforeCompile' in target;
            this.hasAfterCompile = 'afterCompile' in target;
            this.hasAfterCompileChildren = 'afterCompileChildren' in target;
            this.hasBeforeBind = 'beforeBind' in target;
            this.hasAfterBind = 'afterBind' in target;
            this.hasBeforeUnbind = 'beforeUnbind' in target;
            this.hasAfterUnbind = 'afterUnbind' in target;
            this.hasBeforeAttach = 'beforeAttach' in target;
            this.hasAfterAttach = 'afterAttach' in target;
            this.hasBeforeDetach = 'beforeDetach' in target;
            this.hasAfterDetach = 'afterDetach' in target;
            this.hasCaching = 'caching' in target;
        }
    }
    exports.HooksDefinition = HooksDefinition;
    HooksDefinition.none = new HooksDefinition({});
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
            kernel_1.Registration.aliasTo(key, resource.keyFrom(aliases[i])).register(container);
        }
    }
    exports.registerAliases = registerAliases;
});
//# sourceMappingURL=definitions.js.map