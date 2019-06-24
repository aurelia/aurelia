import { Registration } from '@aurelia/kernel';
function register(container) {
    const resourceKey = BindingBehaviorResource.keyFrom(this.description.name);
    container.register(Registration.singleton(resourceKey, this));
    container.register(Registration.singleton(this, this));
}
export function bindingBehavior(nameOrDefinition) {
    return target => BindingBehaviorResource.define(nameOrDefinition, target); // TODO: fix this at some point
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
    WritableType.kind = BindingBehaviorResource;
    WritableType.description = description;
    Type.register = register;
    return Type;
}
export const BindingBehaviorResource = {
    name: 'binding-behavior',
    keyFrom,
    isType,
    define
};
//# sourceMappingURL=binding-behavior.js.map