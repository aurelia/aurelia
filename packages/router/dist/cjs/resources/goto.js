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
exports.GotoCustomAttribute = void 0;
const runtime_html_1 = require("@aurelia/runtime-html");
const router_js_1 = require("../router.js");
const type_resolvers_js_1 = require("../type-resolvers.js");
const utils_js_1 = require("../utils.js");
let GotoCustomAttribute = class GotoCustomAttribute {
    constructor(element, router) {
        this.element = element;
        this.router = router;
        this.hasHref = null;
        this.activeClass = 'goto-active';
        utils_js_1.deprecationWarning('"goto" custom attribute', '"load" custom attribute');
    }
    binding() {
        this.element.addEventListener('click', this.router.linkHandler.handler);
        this.updateValue();
        const observerLocator = this.router.container.get(runtime_html_1.IObserverLocator);
        this.observer = observerLocator.getObserver(this.router, 'activeComponents');
        this.observer.subscribe(this);
    }
    unbinding() {
        this.element.removeEventListener('click', this.router.linkHandler.handler);
        this.observer.unsubscribe(this);
    }
    valueChanged(newValue) {
        this.updateValue();
    }
    updateValue() {
        if (this.hasHref === null) {
            this.hasHref = this.element.hasAttribute('href');
        }
        if (!this.hasHref) {
            // TODO: Figure out a better value here for non-strings (using InstructionResolver?)
            const value = typeof this.value === 'string' ? this.value : JSON.stringify(this.value);
            this.element.setAttribute('href', value);
        }
    }
    handleChange() {
        const controller = runtime_html_1.CustomAttribute.for(this.element, 'goto').parent;
        const created = type_resolvers_js_1.NavigationInstructionResolver.createViewportInstructions(this.router, this.value, { context: controller });
        const instructions = type_resolvers_js_1.NavigationInstructionResolver.toViewportInstructions(this.router, created.instructions);
        for (const instruction of instructions) {
            if (instruction.scope === null) {
                instruction.scope = created.scope;
            }
        }
        // TODO: Use router configuration for class name and update target
        if (this.router.checkActive(instructions)) {
            this.element.classList.add(this.activeClass);
        }
        else {
            this.element.classList.remove(this.activeClass);
        }
    }
};
__decorate([
    runtime_html_1.bindable({ mode: runtime_html_1.BindingMode.toView })
], GotoCustomAttribute.prototype, "value", void 0);
GotoCustomAttribute = __decorate([
    runtime_html_1.customAttribute('goto'),
    __param(0, runtime_html_1.INode),
    __param(1, router_js_1.IRouter)
], GotoCustomAttribute);
exports.GotoCustomAttribute = GotoCustomAttribute;
//# sourceMappingURL=goto.js.map