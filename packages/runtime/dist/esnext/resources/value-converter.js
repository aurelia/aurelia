import { Registration } from '@aurelia/kernel';
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
        const description = typeof nameOrDefinition === 'string'
            ? { name: nameOrDefinition }
            : nameOrDefinition;
        Type.kind = ValueConverter;
        Type.description = description;
        Type.register = function register(container) {
            const key = ValueConverter.keyFrom(description.name);
            Registration.singleton(key, Type).register(container);
            Registration.alias(key, Type).register(container);
        };
        return Type;
    },
});
//# sourceMappingURL=value-converter.js.map