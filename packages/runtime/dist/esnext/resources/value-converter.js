import { Registration } from '@aurelia/kernel';
function register(container) {
    const resourceKey = this.kind.keyFrom(this.description.name);
    container.register(Registration.singleton(resourceKey, this));
    container.register(Registration.singleton(this, this));
}
export function valueConverter(nameOrDefinition) {
    return target => ValueConverter.define(nameOrDefinition, target); // TODO: fix this at some point
}
function keyFrom(name) {
    return `${this.name}:${name}`;
}
function isType(Type) {
    return Type.kind === this;
}
function define(nameOrDefinition, ctor) {
    const Type = ctor;
    const description = typeof nameOrDefinition === 'string'
        ? { name: nameOrDefinition }
        : nameOrDefinition;
    Type.kind = ValueConverter;
    Type.description = description;
    Type.register = register;
    return Type;
}
export const ValueConverter = {
    name: 'value-converter',
    keyFrom,
    isType,
    define
};
//# sourceMappingURL=value-converter.js.map