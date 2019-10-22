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
export class HooksDefinition {
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
HooksDefinition.none = Object.freeze(new HooksDefinition({}));
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
        Registration.alias(key, resource.keyFrom(aliases[i])).register(container);
    }
}
//# sourceMappingURL=definitions.js.map