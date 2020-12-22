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
exports.Compose = void 0;
const kernel_1 = require("@aurelia/kernel");
const runtime_1 = require("@aurelia/runtime");
const create_element_js_1 = require("../../create-element.js");
const renderer_js_1 = require("../../renderer.js");
const platform_js_1 = require("../../platform.js");
const render_context_js_1 = require("../../templating/render-context.js");
const custom_element_js_1 = require("../custom-element.js");
const bindable_js_1 = require("../../bindable.js");
function toLookup(acc, item) {
    const to = item.to;
    if (to !== void 0 && to !== 'subject' && to !== 'composing') {
        acc[to] = item;
    }
    return acc;
}
let Compose = class Compose {
    constructor(p, instruction) {
        this.p = p;
        this.id = kernel_1.nextId('au$component');
        this.subject = void 0;
        this.composing = false;
        this.view = void 0;
        this.lastSubject = void 0;
        this.properties = instruction.instructions.reduce(toLookup, {});
    }
    attaching(initiator, parent, flags) {
        const { subject, view } = this;
        if (view === void 0 || this.lastSubject !== subject) {
            this.lastSubject = subject;
            this.composing = true;
            return this.compose(void 0, subject, initiator, flags);
        }
        return this.compose(view, subject, initiator, flags);
    }
    detaching(initiator, parent, flags) {
        return this.deactivate(this.view, initiator, flags);
    }
    subjectChanged(newValue, previousValue, flags) {
        const { $controller } = this;
        if (!$controller.isActive) {
            return;
        }
        if (this.lastSubject === newValue) {
            return;
        }
        this.lastSubject = newValue;
        this.composing = true;
        flags |= $controller.flags;
        const ret = kernel_1.onResolve(this.deactivate(this.view, null, flags), () => {
            // TODO(fkleuver): handle & test race condition
            return this.compose(void 0, newValue, null, flags);
        });
        if (ret instanceof Promise) {
            ret.catch(err => { throw err; });
        }
    }
    compose(view, subject, initiator, flags) {
        return kernel_1.onResolve(view === void 0
            ? kernel_1.onResolve(subject, resolvedSubject => {
                return this.resolveView(resolvedSubject, flags);
            })
            : view, resolvedView => {
            return this.activate(resolvedView, initiator, flags);
        });
    }
    deactivate(view, initiator, flags) {
        return view?.deactivate(initiator ?? view, this.$controller, flags);
    }
    activate(view, initiator, flags) {
        const { $controller } = this;
        return kernel_1.onResolve(view?.activate(initiator ?? view, $controller, flags, $controller.scope, $controller.hostScope), () => {
            this.composing = false;
        });
    }
    resolveView(subject, flags) {
        const view = this.provideViewFor(subject, flags);
        if (view) {
            view.setLocation(this.$controller.location);
            view.lockScope(this.$controller.scope);
            return view;
        }
        return void 0;
    }
    provideViewFor(subject, flags) {
        if (!subject) {
            return void 0;
        }
        if (isController(subject)) { // IController
            return subject;
        }
        if ('createView' in subject) { // RenderPlan
            return subject.createView(this.$controller.context);
        }
        if ('create' in subject) { // IViewFactory
            return subject.create(flags);
        }
        if ('template' in subject) { // Raw Template Definition
            const definition = custom_element_js_1.CustomElementDefinition.getOrCreate(subject);
            return render_context_js_1.getRenderContext(definition, this.$controller.context).getViewFactory().create(flags);
        }
        // Constructable (Custom Element Constructor)
        return create_element_js_1.createElement(this.p, subject, this.properties, this.$controller.host.childNodes).createView(this.$controller.context);
    }
    dispose() {
        this.view?.dispose();
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
], Compose.prototype, "subject", void 0);
__decorate([
    bindable_js_1.bindable({ mode: runtime_1.BindingMode.fromView })
], Compose.prototype, "composing", void 0);
Compose = __decorate([
    custom_element_js_1.customElement({ name: 'au-compose', template: null, containerless: true }),
    __param(0, platform_js_1.IPlatform),
    __param(1, renderer_js_1.IInstruction)
], Compose);
exports.Compose = Compose;
function isController(subject) {
    return 'lockScope' in subject;
}
//# sourceMappingURL=compose.js.map