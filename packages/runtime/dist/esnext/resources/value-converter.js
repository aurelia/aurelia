import { Registration, PLATFORM } from '@aurelia/kernel';
import { registerAliases } from '../definitions';
export function valueConverter(nameOrDefinition) {
    return target => ValueConverter.define(nameOrDefinition, target); // TODO: fix this at some point
}
export const ValueConverter = Object.freeze({
    name: 'value-converter',
    keyFrom(name) {
        return `${ValueConverter.name}:${name}`;
    },
    isType(Type) {
        return Type.kind === ValueConverter;
    },
    define(nameOrDefinition, ctor) {
        const Type = ctor;
        const WritableType = Type;
        const description = createCustomValueDescription(typeof nameOrDefinition === 'string' ? { name: nameOrDefinition } : nameOrDefinition, Type);
        WritableType.kind = ValueConverter;
        WritableType.description = description;
        WritableType.aliases = Type.aliases == null ? PLATFORM.emptyArray : Type.aliases;
        Type.register = function register(container) {
            const aliases = description.aliases;
            const key = ValueConverter.keyFrom(description.name);
            Registration.singleton(key, this).register(container);
            Registration.alias(key, this).register(container);
            registerAliases([...aliases, ...this.aliases], ValueConverter, key, container);
        };
        return Type;
    },
});
/** @internal */
export function createCustomValueDescription(def, Type) {
    const aliases = def.aliases;
    return {
        name: def.name,
        aliases: aliases == null ? PLATFORM.emptyArray : aliases,
    };
}
//# sourceMappingURL=value-converter.js.map