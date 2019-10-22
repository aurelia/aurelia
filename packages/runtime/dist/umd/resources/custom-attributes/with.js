(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "tslib", "@aurelia/kernel", "../../dom", "../../lifecycle", "../custom-attribute", "../../templating/bindable", "../../observation/binding-context"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const tslib_1 = require("tslib");
    const kernel_1 = require("@aurelia/kernel");
    const dom_1 = require("../../dom");
    const lifecycle_1 = require("../../lifecycle");
    const custom_attribute_1 = require("../custom-attribute");
    const bindable_1 = require("../../templating/bindable");
    const binding_context_1 = require("../../observation/binding-context");
    let With = class With {
        constructor(factory, location) {
            this.factory = factory;
            this.location = location;
            this.id = kernel_1.nextId('au$component');
            this.id = kernel_1.nextId('au$component');
            this.factory = factory;
            this.view = this.factory.create();
            this.view.hold(location, 1 /* insertBefore */);
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
    };
    tslib_1.__decorate([
        bindable_1.bindable
    ], With.prototype, "value", void 0);
    With = tslib_1.__decorate([
        custom_attribute_1.templateController('with'),
        tslib_1.__param(0, lifecycle_1.IViewFactory),
        tslib_1.__param(1, dom_1.IRenderLocation)
    ], With);
    exports.With = With;
});
//# sourceMappingURL=with.js.map