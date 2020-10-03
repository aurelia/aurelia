import { DI, Registration, Metadata, Protocol, } from '@aurelia/kernel';
/**
 * TargetedInstructionType enum values become the property names for the associated renderers when they are injected
 * into the `Renderer`.
 *
 * Additional instruction types can be added as long as they are 2 characters long and do not clash with existing ones.
 *
 * By convention, the instruction types for a particular runtime start with the same first letter, and the second letter
 * starts counting from letter `a`. The standard runtime instruction types all start with the letter `r`.
 */
export var TargetedInstructionType;
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
})(TargetedInstructionType || (TargetedInstructionType = {}));
export const ITargetedInstruction = DI.createInterface('ITargetedInstruction').noDefault();
export function isTargetedInstruction(value) {
    const type = value.type;
    return typeof type === 'string' && type.length === 2;
}
let HooksDefinition = /** @class */ (() => {
    class HooksDefinition {
        constructor(target) {
            this.hasCreate = 'create' in target;
            this.hasBeforeCompile = 'beforeCompile' in target;
            this.hasAfterCompile = 'afterCompile' in target;
            this.hasAfterCompileChildren = 'afterCompileChildren' in target;
            this.hasBeforeBind = 'beforeBind' in target;
            this.hasAfterBind = 'afterBind' in target;
            this.hasAfterAttach = 'afterAttach' in target;
            this.hasAfterAttachChildren = 'afterAttachChildren' in target;
            this.hasBeforeDetach = 'beforeDetach' in target;
            this.hasBeforeUnbind = 'beforeUnbind' in target;
            this.hasAfterUnbind = 'afterUnbind' in target;
            this.hasAfterUnbindChildren = 'afterUnbindChildren' in target;
            this.hasDispose = 'dispose' in target;
            this.hasAccept = 'accept' in target;
        }
    }
    HooksDefinition.none = new HooksDefinition({});
    return HooksDefinition;
})();
export { HooksDefinition };
export function alias(...aliases) {
    return function (target) {
        const key = Protocol.annotation.keyFor('aliases');
        const existing = Metadata.getOwn(key, target);
        if (existing === void 0) {
            Metadata.define(key, aliases, target);
        }
        else {
            existing.push(...aliases);
        }
    };
}
export function registerAliases(aliases, resource, key, container) {
    for (let i = 0, ii = aliases.length; i < ii; ++i) {
        Registration.aliasTo(key, resource.keyFrom(aliases[i])).register(container);
    }
}
//# sourceMappingURL=definitions.js.map