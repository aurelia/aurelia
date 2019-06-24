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
        const resourceKey = exports.BindingBehaviorResource.keyFrom(this.description.name);
        container.register(kernel_1.Registration.singleton(resourceKey, this));
        container.register(kernel_1.Registration.singleton(this, this));
    }
    function bindingBehavior(nameOrDefinition) {
        return target => exports.BindingBehaviorResource.define(nameOrDefinition, target); // TODO: fix this at some point
    }
    exports.bindingBehavior = bindingBehavior;
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
        WritableType.kind = exports.BindingBehaviorResource;
        WritableType.description = description;
        Type.register = register;
        return Type;
    }
    exports.BindingBehaviorResource = {
        name: 'binding-behavior',
        keyFrom,
        isType,
        define
    };
});
//# sourceMappingURL=binding-behavior.js.map