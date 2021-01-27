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
exports.Else = exports.If = void 0;
const kernel_1 = require("@aurelia/kernel");
const dom_js_1 = require("../../dom.js");
const view_js_1 = require("../../templating/view.js");
const custom_attribute_js_1 = require("../custom-attribute.js");
const bindable_js_1 = require("../../bindable.js");
const app_root_js_1 = require("../../app-root.js");
let If = class If {
    constructor(ifFactory, location, work) {
        this.ifFactory = ifFactory;
        this.location = location;
        this.work = work;
        this.id = kernel_1.nextId('au$component');
        this.elseFactory = void 0;
        this.elseView = void 0;
        this.ifView = void 0;
        this.view = void 0;
        this.value = false;
        this.pending = void 0;
        this.wantsDeactivate = false;
    }
    attaching(initiator, parent, flags) {
        return kernel_1.onResolve(this.pending, () => {
            this.pending = void 0;
            // Promise return values from user VM hooks are awaited by the initiator
            void (this.view = this.updateView(this.value, flags))?.activate(initiator, this.$controller, flags, this.$controller.scope, this.$controller.hostScope);
        });
    }
    detaching(initiator, parent, flags) {
        this.wantsDeactivate = true;
        return kernel_1.onResolve(this.pending, () => {
            this.wantsDeactivate = false;
            this.pending = void 0;
            // Promise return values from user VM hooks are awaited by the initiator
            void this.view?.deactivate(initiator, this.$controller, flags);
        });
    }
    valueChanged(newValue, oldValue, flags) {
        if (!this.$controller.isActive) {
            return;
        }
        this.pending = kernel_1.onResolve(this.pending, () => {
            return this.swap(flags);
        });
    }
    swap(flags) {
        if (this.view === this.updateView(this.value, flags)) {
            return;
        }
        this.work.start();
        const ctrl = this.$controller;
        return kernel_1.onResolve(this.view?.deactivate(this.view, ctrl, flags), () => {
            // return early if detaching was called during the swap
            if (this.wantsDeactivate) {
                return;
            }
            // value may have changed during deactivate
            const nextView = this.view = this.updateView(this.value, flags);
            return kernel_1.onResolve(nextView?.activate(nextView, ctrl, flags, ctrl.scope, ctrl.hostScope), () => {
                this.work.finish();
                // only null the pending promise if nothing changed since the activation start
                if (this.view === this.updateView(this.value, flags)) {
                    this.pending = void 0;
                }
            });
        });
    }
    /** @internal */
    updateView(value, flags) {
        if (value) {
            return this.ifView = this.ensureView(this.ifView, this.ifFactory, flags);
        }
        if (this.elseFactory !== void 0) {
            return this.elseView = this.ensureView(this.elseView, this.elseFactory, flags);
        }
        return void 0;
    }
    /** @internal */
    ensureView(view, factory, flags) {
        if (view === void 0) {
            view = factory.create(flags);
            view.setLocation(this.location);
        }
        return view;
    }
    dispose() {
        this.ifView?.dispose();
        this.ifView = void 0;
        this.elseView?.dispose();
        this.elseView = void 0;
        this.view = void 0;
    }
    accept(visitor) {
        if (this.view?.accept(visitor) === true) {
            return true;
        }
    }
};
__decorate([
    bindable_js_1.bindable
], If.prototype, "value", void 0);
If = __decorate([
    custom_attribute_js_1.templateController('if'),
    __param(0, view_js_1.IViewFactory),
    __param(1, dom_js_1.IRenderLocation),
    __param(2, app_root_js_1.IWorkTracker)
], If);
exports.If = If;
let Else = class Else {
    constructor(factory) {
        this.factory = factory;
        this.id = kernel_1.nextId('au$component');
    }
    link(flags, parentContext, controller, _childController, _target, _instruction) {
        const children = controller.children;
        const ifBehavior = children[children.length - 1];
        if (ifBehavior instanceof If) {
            ifBehavior.elseFactory = this.factory;
        }
        else if (ifBehavior.viewModel instanceof If) {
            ifBehavior.viewModel.elseFactory = this.factory;
        }
        else {
            throw new Error(`Unsupported IfBehavior`); // TODO: create error code
        }
    }
};
Else = __decorate([
    custom_attribute_js_1.templateController({ name: 'else' }),
    __param(0, view_js_1.IViewFactory)
], Else);
exports.Else = Else;
//# sourceMappingURL=if.js.map