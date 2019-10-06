(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "@aurelia/kernel", "../../definitions", "../../dom", "../../flags", "../../lifecycle", "../../observation/binding-context", "../../templating/bindable", "../custom-attribute"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const kernel_1 = require("@aurelia/kernel");
    const definitions_1 = require("../../definitions");
    const dom_1 = require("../../dom");
    const flags_1 = require("../../flags");
    const lifecycle_1 = require("../../lifecycle");
    const binding_context_1 = require("../../observation/binding-context");
    const bindable_1 = require("../../templating/bindable");
    const custom_attribute_1 = require("../custom-attribute");
    class With {
        constructor(factory, location) {
            this.$observers = Object.freeze({
                value: this,
            });
            this.id = kernel_1.nextId('au$component');
            this.factory = factory;
            this.view = this.factory.create();
            this.view.hold(location);
            this._value = void 0;
        }
        get value() {
            return this._value;
        }
        set value(newValue) {
            const oldValue = this._value;
            if (oldValue !== newValue) {
                this._value = newValue;
                this.valueChanged(newValue, oldValue, 0 /* none */);
            }
        }
        static register(container) {
            container.register(kernel_1.Registration.transient('custom-attribute:with', this));
            container.register(kernel_1.Registration.transient(this, this));
        }
        valueChanged(newValue, oldValue, flags) {
            if ((this.$controller.state & 5 /* isBoundOrBinding */) > 0) {
                this.bindChild(4096 /* fromBind */);
            }
        }
        binding(flags) {
            this.view.parent = this.$controller;
            this.bindChild(flags);
        }
        attaching(flags) {
            this.view.attach(flags);
        }
        detaching(flags) {
            this.view.detach(flags);
        }
        unbinding(flags) {
            this.view.unbind(flags);
            this.view.parent = void 0;
        }
        bindChild(flags) {
            const scope = binding_context_1.Scope.fromParent(flags, this.$controller.scope, this.value === void 0 ? {} : this.value);
            this.view.bind(flags, scope, this.$controller.part);
        }
    }
    exports.With = With;
    With.inject = [lifecycle_1.IViewFactory, dom_1.IRenderLocation];
    With.kind = custom_attribute_1.CustomAttribute;
    With.description = Object.freeze({
        name: 'with',
        aliases: kernel_1.PLATFORM.emptyArray,
        defaultBindingMode: flags_1.BindingMode.toView,
        isTemplateController: true,
        bindables: Object.freeze(bindable_1.Bindable.for({ bindables: ['value'] }).get()),
        strategy: 1 /* getterSetter */,
        hooks: Object.freeze(new definitions_1.HooksDefinition(With.prototype)),
    });
});
//# sourceMappingURL=with.js.map