"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.With = void 0;
const kernel_1 = require("@aurelia/kernel");
const runtime_1 = require("@aurelia/runtime");
const dom_js_1 = require("../../dom.js");
const view_js_1 = require("../../templating/view.js");
const custom_attribute_js_1 = require("../custom-attribute.js");
const bindable_js_1 = require("../../bindable.js");
let With = class With {
    constructor(factory, location) {
        this.factory = factory;
        this.location = location;
        this.id = kernel_1.nextId('au$component');
        this.id = kernel_1.nextId('au$component');
        this.view = this.factory.create().setLocation(location);
    }
    valueChanged(newValue, oldValue, flags) {
        if (this.$controller.isActive) {
            // TODO(fkleuver): add logic to the controller that ensures correct handling of race conditions and add integration tests
            // eslint-disable-next-line @typescript-eslint/no-floating-promises
            this.activateView(this.view, 32 /* fromBind */);
        }
    }
    attaching(initiator, parent, flags) {
        return this.activateView(initiator, flags);
    }
    detaching(initiator, parent, flags) {
        return this.view.deactivate(initiator, this.$controller, flags);
    }
    activateView(initiator, flags) {
        const { $controller, value } = this;
        const scope = runtime_1.Scope.fromParent($controller.scope, value === void 0 ? {} : value);
        return this.view.activate(initiator, $controller, flags, scope, $controller.hostScope);
    }
    dispose() {
        this.view.dispose();
        this.view = (void 0);
    }
    accept(visitor) {
        if (this.view?.accept(visitor) === true) {
            return true;
        }
    }
};
__decorate([
    bindable_js_1.bindable
], With.prototype, "value", void 0);
With = __decorate([
    custom_attribute_js_1.templateController('with'),
    __param(0, view_js_1.IViewFactory),
    __param(1, dom_js_1.IRenderLocation)
], With);
exports.With = With;
//# sourceMappingURL=with.js.map