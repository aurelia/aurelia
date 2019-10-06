import { PLATFORM, Registration, } from '@aurelia/kernel';
import { HooksDefinition, registerAliases } from '../definitions';
import { BindingMode, ensureValidStrategy, } from '../flags';
import { Bindable } from '../templating/bindable';
export function customAttribute(nameOrDefinition) {
    return target => CustomAttribute.define(nameOrDefinition, target); // TODO: fix this at some point
}
export function templateController(nameOrDefinition) {
    return target => CustomAttribute.define(typeof nameOrDefinition === 'string'
        ? { isTemplateController: true, name: nameOrDefinition }
        : { isTemplateController: true, ...nameOrDefinition }, target); // TODO: fix this at some point
}
export const CustomAttribute = Object.freeze({
    name: 'custom-attribute',
    keyFrom(name) {
        return `${CustomAttribute.name}:${name}`;
    },
    isType(Type) {
        return Type.kind === CustomAttribute;
    },
    define(nameOrDefinition, ctor) {
        const Type = ctor;
        const WritableType = Type;
        const description = createCustomAttributeDescription(typeof nameOrDefinition === 'string' ? { name: nameOrDefinition } : nameOrDefinition, Type);
        WritableType.kind = CustomAttribute;
        WritableType.description = description;
        WritableType.aliases = Type.aliases == null ? PLATFORM.emptyArray : Type.aliases;
        Type.register = function register(container) {
            const aliases = description.aliases;
            const key = CustomAttribute.keyFrom(description.name);
            Registration.transient(key, this).register(container);
            Registration.alias(key, this).register(container);
            registerAliases([...aliases, ...this.aliases], CustomAttribute, key, container);
        };
        return Type;
    },
});
/** @internal */
export function createCustomAttributeDescription(def, Type) {
    const aliases = def.aliases;
    const defaultBindingMode = def.defaultBindingMode;
    return {
        name: def.name,
        aliases: aliases == null ? PLATFORM.emptyArray : aliases,
        defaultBindingMode: defaultBindingMode == null ? BindingMode.toView : defaultBindingMode,
        isTemplateController: def.isTemplateController === undefined ? false : def.isTemplateController,
        bindables: { ...Bindable.for(Type).get(), ...Bindable.for(def).get() },
        strategy: ensureValidStrategy(def.strategy),
        hooks: new HooksDefinition(Type.prototype)
    };
}
//# sourceMappingURL=custom-attribute.js.map