import { Registration, PLATFORM } from '@aurelia/kernel';
import { registerAliases } from '../definitions';
export function bindingBehavior(nameOrDefinition) {
    return target => BindingBehavior.define(nameOrDefinition, target); // TODO: fix this at some point
}
export const BindingBehavior = Object.freeze({
    name: 'binding-behavior',
    keyFrom(name) {
        return `${BindingBehavior.name}:${name}`;
    },
    isType(Type) {
        return Type.kind === BindingBehavior;
    },
    define(nameOrDefinition, ctor) {
        const Type = ctor;
        const WritableType = Type;
        const description = createBindingBehaviorDescription(typeof nameOrDefinition === 'string' ? { name: nameOrDefinition } : nameOrDefinition, Type);
        WritableType.kind = BindingBehavior;
        WritableType.description = description;
        WritableType.aliases = Type.aliases == null ? PLATFORM.emptyArray : Type.aliases;
        Type.register = function register(container) {
            const aliases = description.aliases;
            const key = BindingBehavior.keyFrom(description.name);
            Registration.singleton(key, this).register(container);
            Registration.alias(key, this).register(container);
            registerAliases([...aliases, ...this.aliases], BindingBehavior, key, container);
        };
        return Type;
    },
});
/** @internal */
export function createBindingBehaviorDescription(def, Type) {
    const aliases = def.aliases;
    return {
        name: def.name,
        aliases: aliases == null ? PLATFORM.emptyArray : aliases,
    };
}
//# sourceMappingURL=binding-behavior.js.map