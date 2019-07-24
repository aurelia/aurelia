(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "@aurelia/kernel"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const kernel_1 = require("@aurelia/kernel");
    function register(container) {
        const resourceKey = this.kind.keyFrom(this.description.name);
        container.register(kernel_1.Registration.singleton(resourceKey, this));
        container.register(kernel_1.Registration.singleton(this, this));
    }
    function valueConverter(nameOrDefinition) {
        return target => exports.ValueConverter.define(nameOrDefinition, target); // TODO: fix this at some point
    }
    exports.valueConverter = valueConverter;
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
        Type.kind = exports.ValueConverter;
        Type.description = description;
        Type.register = register;
        return Type;
    }
    exports.ValueConverter = {
        name: 'value-converter',
        keyFrom,
        isType,
        define
    };
});
//# sourceMappingURL=value-converter.js.map