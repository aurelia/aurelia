import { Registration } from '@aurelia/kernel';
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
        const description = typeof nameOrDefinition === 'string'
            ? { name: nameOrDefinition }
            : nameOrDefinition;
        WritableType.kind = BindingBehavior;
        WritableType.description = description;
        Type.register = function register(container) {
            const key = BindingBehavior.keyFrom(description.name);
            Registration.singleton(key, Type).register(container);
            Registration.alias(key, Type).register(container);
        };
        return Type;
    },
});
//# sourceMappingURL=binding-behavior.js.map