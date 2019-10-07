import { DI, PLATFORM, toArray, Registration } from '@aurelia/kernel';
import { ensureValidStrategy } from './flags';
import { Bindable } from './templating/bindable';
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
/** @internal */
export const buildRequired = Object.freeze({
    required: true,
    compiler: 'default'
});
const buildNotRequired = Object.freeze({
    required: false,
    compiler: 'default'
});
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
// Note: this is a little perf thing; having one predefined class with the properties always
// assigned in the same order ensures the browser can keep reusing the same generated hidden
// class
class DefaultTemplateDefinition {
    constructor() {
        this.name = 'unnamed';
        this.template = null;
        this.cache = 0;
        this.build = buildNotRequired;
        this.bindables = PLATFORM.emptyObject;
        this.childrenObservers = PLATFORM.emptyObject;
        this.instructions = PLATFORM.emptyArray;
        this.dependencies = PLATFORM.emptyArray;
        this.surrogates = PLATFORM.emptyArray;
        this.aliases = PLATFORM.emptyArray;
        this.containerless = false;
        this.shadowOptions = null;
        this.hasSlots = false;
        this.strategy = 1 /* getterSetter */;
        this.hooks = HooksDefinition.none;
        this.scopeParts = PLATFORM.emptyArray;
    }
}
const templateDefinitionAssignables = [
    'name',
    'template',
    'cache',
    'build',
    'containerless',
    'shadowOptions',
    'hasSlots'
];
const templateDefinitionArrays = [
    'instructions',
    'dependencies',
    'surrogates',
    'aliases'
];
export function buildTemplateDefinition(ctor, nameOrDef, template, cache, build, bindables, instructions, dependencies, surrogates, containerless, shadowOptions, hasSlots, strategy, childrenObservers, aliases) {
    const def = new DefaultTemplateDefinition();
    // all cases fall through intentionally
    /* deepscan-disable */
    const argLen = arguments.length;
    switch (argLen) {
        case 15: if (aliases != null)
            def.aliases = toArray(aliases);
        case 14: if (childrenObservers !== null)
            def.childrenObservers = { ...childrenObservers };
        case 13: if (strategy != null)
            def.strategy = ensureValidStrategy(strategy);
        case 12: if (hasSlots != null)
            def.hasSlots = hasSlots;
        case 11: if (shadowOptions != null)
            def.shadowOptions = shadowOptions;
        case 10: if (containerless != null)
            def.containerless = containerless;
        case 9: if (surrogates != null)
            def.surrogates = toArray(surrogates);
        case 8: if (dependencies != null)
            def.dependencies = toArray(dependencies);
        case 7: if (instructions != null)
            def.instructions = toArray(instructions);
        case 6: if (bindables != null)
            def.bindables = { ...bindables };
        case 5: if (build != null)
            def.build = build === true ? buildRequired : build === false ? buildNotRequired : { ...build };
        case 4: if (cache != null)
            def.cache = cache;
        case 3: if (template != null)
            def.template = template;
        case 2:
            if (ctor != null) {
                if (ctor.bindables) {
                    def.bindables = Bindable.for(ctor).get();
                }
                if (ctor.containerless) {
                    def.containerless = ctor.containerless;
                }
                if (ctor.shadowOptions) {
                    def.shadowOptions = ctor.shadowOptions;
                }
                if (ctor.childrenObservers) {
                    def.childrenObservers = ctor.childrenObservers;
                }
                if (ctor.prototype) {
                    def.hooks = new HooksDefinition(ctor.prototype);
                }
            }
            if (typeof nameOrDef === 'string') {
                if (nameOrDef.length > 0) {
                    def.name = nameOrDef;
                }
            }
            else if (nameOrDef != null) {
                def.strategy = ensureValidStrategy(nameOrDef.strategy);
                templateDefinitionAssignables.forEach(prop => {
                    if (nameOrDef[prop]) {
                        // @ts-ignore // TODO: https://github.com/microsoft/TypeScript/issues/31904
                        def[prop] = nameOrDef[prop];
                    }
                });
                templateDefinitionArrays.forEach(prop => {
                    if (nameOrDef[prop]) {
                        // @ts-ignore // TODO: https://github.com/microsoft/TypeScript/issues/31904
                        def[prop] = toArray(nameOrDef[prop]);
                    }
                });
                if (nameOrDef['bindables']) {
                    if (def.bindables === PLATFORM.emptyObject) {
                        def.bindables = Bindable.for(nameOrDef).get();
                    }
                    else {
                        Object.assign(def.bindables, nameOrDef.bindables);
                    }
                }
                if (nameOrDef['childrenObservers']) {
                    if (def.childrenObservers === PLATFORM.emptyObject) {
                        def.childrenObservers = { ...nameOrDef.childrenObservers };
                    }
                    else {
                        Object.assign(def.childrenObservers, nameOrDef.childrenObservers);
                    }
                }
            }
    }
    /* deepscan-enable */
    // special handling for invocations that quack like a @customElement decorator
    if (argLen === 2 && ctor !== null && (typeof nameOrDef === 'string' || !('build' in nameOrDef))) {
        def.build = buildRequired;
    }
    return def;
}
function aliasDecorator(target, ...aliases) {
    if (target.aliases == null) {
        target.aliases = aliases;
        return target;
    }
    target.aliases.push(...aliases);
    return target;
}
export function alias(...aliases) {
    return (instance) => aliasDecorator(instance, ...aliases);
}
export function registerAliases(aliases, resource, key, container) {
    for (let i = 0, ii = aliases.length; i < ii; ++i) {
        Registration.alias(key, resource.keyFrom(aliases[i])).register(container);
    }
}
//# sourceMappingURL=definitions.js.map