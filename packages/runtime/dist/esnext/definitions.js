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
export function mergeParts(parentParts, ownParts) {
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
export const ITargetedInstruction = DI.createInterface('ITargetedInstruction').noDefault();
export function isTargetedInstruction(value) {
    const type = value.type;
    return typeof type === 'string' && type.length === 2;
}
export class HooksDefinition {
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
HooksDefinition.none = new HooksDefinition({});
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