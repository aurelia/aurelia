var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "@aurelia/kernel", "../../dom", "../../lifecycle", "../custom-attribute", "../../templating/bindable", "../../observation/binding-context"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
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
            this.view = this.factory.create();
            this.view.hold(location, 1 /* insertBefore */);
        }
        valueChanged(newValue, oldValue, flags) {
            if ((this.$controller.state & 5 /* isBoundOrBinding */) > 0) {
                this.bindChild(4096 /* fromBind */);
            }
        }
        beforeBind(flags) {
            this.view.parent = this.$controller;
            this.bindChild(flags);
        }
        beforeAttach(flags) {
            this.view.attach(flags);
        }
        beforeDetach(flags) {
            this.view.detach(flags);
        }
        beforeUnbind(flags) {
            this.view.unbind(flags);
            this.view.parent = void 0;
        }
        bindChild(flags) {
            const scope = binding_context_1.Scope.fromParent(flags, this.$controller.scope, this.value === void 0 ? {} : this.value);
            this.view.bind(flags, scope, this.$controller.part);
        }
    };
    __decorate([
        bindable_1.bindable,
        __metadata("design:type", Object)
    ], With.prototype, "value", void 0);
    With = __decorate([
        custom_attribute_1.templateController('with'),
        __param(0, lifecycle_1.IViewFactory),
        __param(1, dom_1.IRenderLocation),
        __metadata("design:paramtypes", [Object, Object])
    ], With);
    exports.With = With;
});
//# sourceMappingURL=with.js.map