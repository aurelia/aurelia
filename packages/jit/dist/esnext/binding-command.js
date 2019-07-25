import { camelCase, Registration } from '@aurelia/kernel';
export function bindingCommand(nameOrDefinition) {
    return target => BindingCommandResource.define(nameOrDefinition, target);
}
export const BindingCommandResource = Object.freeze({
    name: 'binding-command',
    keyFrom(name) {
        return `${BindingCommandResource.name}:${name}`;
    },
    isType(Type) {
        return Type.kind === BindingCommandResource;
    },
    define(nameOrDefinition, ctor) {
        const Type = ctor;
        const WritableType = Type;
        const description = typeof nameOrDefinition === 'string' ? { name: nameOrDefinition, target: null } : nameOrDefinition;
        WritableType.kind = BindingCommandResource;
        WritableType.description = description;
        Type.register = function register(container) {
            const key = BindingCommandResource.keyFrom(description.name);
            Registration.singleton(key, Type).register(container);
            Registration.alias(key, Type).register(container);
        };
        return Type;
    },
});
export function getTarget(binding, makeCamelCase) {
    if (binding.flags & 256 /* isBinding */) {
        return binding.bindable.propName;
    }
    else if (makeCamelCase) {
        return camelCase(binding.syntax.target);
    }
    else {
        return binding.syntax.target;
    }
}
//# sourceMappingURL=binding-command.js.map