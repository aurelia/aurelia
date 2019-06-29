import { Registration } from '@aurelia/kernel';
function register(container) {
    const resourceKey = BindingBehavior.keyFrom(this.description.name);
    container.register(Registration.singleton(resourceKey, this));
    container.register(Registration.singleton(this, this));
}
export function bindingBehavior(nameOrDefinition) {
    return target => BindingBehavior.define(nameOrDefinition, target); // TODO: fix this at some point
}
function keyFrom(name) {
    return `${this.name}:${name}`;
}
function isType(Type) {
    return Type.kind === this;
}
function define(nameOrDefinition, ctor) {
    const Type = ctor;
    const WritableType = Type;
    const description = typeof nameOrDefinition === 'string'
        ? { name: nameOrDefinition }
        : nameOrDefinition;
    WritableType.kind = BindingBehavior;
    WritableType.description = description;
    Type.register = register;
    return Type;
}
export const BindingBehavior = {
    name: 'binding-behavior',
    keyFrom,
    isType,
    define
};
//# sourceMappingURL=binding-behavior.js.map