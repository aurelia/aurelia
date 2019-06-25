(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "@aurelia/kernel", "../../definitions", "../../dom", "../../flags", "../../lifecycle", "../custom-attribute"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const kernel_1 = require("@aurelia/kernel");
    const definitions_1 = require("../../definitions");
    const dom_1 = require("../../dom");
    const flags_1 = require("../../flags");
    const lifecycle_1 = require("../../lifecycle");
    const custom_attribute_1 = require("../custom-attribute");
    class Replaceable {
        constructor(factory, location) {
            this.id = kernel_1.nextId('au$component');
            this.factory = factory;
            this.view = this.factory.create();
            this.view.hold(location);
        }
        static register(container) {
            container.register(kernel_1.Registration.transient('custom-attribute:replaceable', this));
            container.register(kernel_1.Registration.transient(this, this));
        }
        binding(flags) {
            return this.view.bind(flags | 536870912 /* allowParentScopeTraversal */, this.$controller.scope, this.factory.name);
        }
        attaching(flags) {
            this.view.attach(flags);
        }
        detaching(flags) {
            this.view.detach(flags);
        }
        unbinding(flags) {
            return this.view.unbind(flags);
        }
    }
    Replaceable.inject = [lifecycle_1.IViewFactory, dom_1.IRenderLocation];
    Replaceable.kind = custom_attribute_1.CustomAttributeResource;
    Replaceable.description = Object.freeze({
        name: 'replaceable',
        aliases: kernel_1.PLATFORM.emptyArray,
        defaultBindingMode: flags_1.BindingMode.toView,
        hasDynamicOptions: false,
        isTemplateController: true,
        bindables: kernel_1.PLATFORM.emptyObject,
        strategy: 1 /* getterSetter */,
        hooks: Object.freeze(new definitions_1.HooksDefinition(Replaceable.prototype)),
    });
    exports.Replaceable = Replaceable;
});
//# sourceMappingURL=replaceable.js.map