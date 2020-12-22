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
var ViewportScopeCustomElement_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ViewportScopeCustomElement = exports.ParentViewportScope = void 0;
const runtime_html_1 = require("@aurelia/runtime-html");
const kernel_1 = require("@aurelia/kernel");
const router_js_1 = require("../router.js");
const viewport_js_1 = require("./viewport.js");
exports.ParentViewportScope = runtime_html_1.CustomElement.createInjectable();
let ViewportScopeCustomElement = ViewportScopeCustomElement_1 = class ViewportScopeCustomElement {
    constructor(router, element, container, parent, parentController) {
        this.router = router;
        this.element = element;
        this.container = container;
        this.parent = parent;
        this.parentController = parentController;
        this.name = 'default';
        this.catches = '';
        this.collection = false;
        this.source = null;
        this.viewportScope = null;
        this.isBound = false;
    }
    // Maybe this really should be here. Check with Fred
    // public create(
    //   controller: IDryCustomElementController<this>,
    //   parentContainer: IContainer,
    //   definition: CustomElementDefinition,
    //   parts: PartialCustomElementDefinitionParts | undefined,
    // ): PartialCustomElementDefinition {
    //   // TODO(fkleuver): describe this somewhere in the docs instead
    //   // Under the condition that there is no `replace` attribute on this custom element's declaration,
    //   // and this custom element is containerless, its content will be placed in a part named 'default'
    //   // See packages/jit-html/src/template-binder.ts line 411 (`replace = 'default';`) for the logic that governs this.
    //   // We could tidy this up into a formal api in the future. For now, there are two ways to do this:
    //   // 1. inject the `@IInstruction` (IHydrateElementInstruction) and grab .parts['default'] from there, manually creating a view factory from that, etc.
    //   // 2. what we're doing right here: grab the 'default' part from the create hook and return it as the definition, telling the render context to use that part to compile this element instead
    //   // This effectively causes this element to render its declared content as if it was its own template.
    //   // We do need to set `containerless` to true on the part definition so that the correct projector is used since parts default to non-containerless.
    //   // Otherwise, the controller will try to do `appendChild` on a comment node when it has to do `insertBefore`.
    //   // Also, in this particular scenario (specific to viewport-scope) we need to clone the part so as to prevent the resulting compiled definition
    //   // from ever being cached. That's the only reason why we're spreading the part into a new object for `getOrCreate`. If we didn't clone the object, this specific element wouldn't work correctly.
    //   const part = parts!['default'];
    //   return CustomElementDefinition.getOrCreate({ ...part, containerless: true });
    // }
    hydrated(controller) {
        this.controller = controller;
        // Don't update the container here (probably because it wants to be a part of the structure)
        // this.container = controller.context.get(IContainer);
        // console.log('ViewportScope creating', this.getAttribute('name', this.name), this.container, this.parent, controller, this);
        // this.connect();
    }
    bound(initiator, parent, flags) {
        this.isBound = true;
        this.$controller.scope = this.parentController.scope;
        this.connect();
        if (this.viewportScope !== null) {
            this.viewportScope.binding();
        }
    }
    unbinding(initiator, parent, flags) {
        if (this.viewportScope !== null) {
            this.viewportScope.unbinding();
        }
        return Promise.resolve();
    }
    afterUnbind(initiator, parent, flags) {
        this.disconnect();
        return Promise.resolve();
    }
    afterUnbound() {
        this.isBound = false;
    }
    connect() {
        if (this.router.rootScope === null) {
            return;
        }
        const name = this.getAttribute('name', this.name);
        const options = {};
        let value = this.getAttribute('catches', this.catches);
        if (value !== void 0) {
            options.catches = value;
        }
        value = this.getAttribute('collection', this.collection, true);
        if (value !== void 0) {
            options.collection = value;
        }
        // TODO: Needs to be bound? How to solve?
        options.source = this.source || null;
        this.controller.routingContainer = this.container;
        this.viewportScope = this.router.connectViewportScope(this.viewportScope, this, name, options);
    }
    disconnect() {
        if (this.viewportScope) {
            this.router.disconnectViewportScope(this.viewportScope, this);
        }
        this.viewportScope = null;
    }
    getAttribute(key, value, checkExists = false) {
        const result = {};
        if (this.isBound) {
            return value;
        }
        else {
            if (this.element.hasAttribute(key)) {
                if (checkExists) {
                    return true;
                }
                else {
                    value = this.element.getAttribute(key);
                    if (value.length > 0) {
                        return value;
                    }
                }
            }
        }
        return void 0;
    }
    isCustomElementController(value) {
        return runtime_html_1.isCustomElementController(value);
    }
    isCustomElementViewModel(value) {
        return runtime_html_1.isCustomElementViewModel(value);
    }
    getClosestCustomElement() {
        let parent = this.controller.parent;
        let customElement = null;
        while (parent !== null && customElement === null) {
            if (parent.viewModel instanceof viewport_js_1.ViewportCustomElement || parent.viewModel instanceof ViewportScopeCustomElement_1) {
                customElement = parent.viewModel;
            }
            parent = parent.parent;
        }
        return customElement;
    }
};
__decorate([
    runtime_html_1.bindable
], ViewportScopeCustomElement.prototype, "name", void 0);
__decorate([
    runtime_html_1.bindable
], ViewportScopeCustomElement.prototype, "catches", void 0);
__decorate([
    runtime_html_1.bindable
], ViewportScopeCustomElement.prototype, "collection", void 0);
__decorate([
    runtime_html_1.bindable
], ViewportScopeCustomElement.prototype, "source", void 0);
ViewportScopeCustomElement = ViewportScopeCustomElement_1 = __decorate([
    runtime_html_1.customElement({
        name: 'au-viewport-scope',
        template: '<template></template>',
        containerless: false,
        injectable: exports.ParentViewportScope
    }),
    __param(0, router_js_1.IRouter),
    __param(1, runtime_html_1.INode),
    __param(2, kernel_1.IContainer),
    __param(3, exports.ParentViewportScope),
    __param(4, runtime_html_1.IController)
], ViewportScopeCustomElement);
exports.ViewportScopeCustomElement = ViewportScopeCustomElement;
//# sourceMappingURL=viewport-scope.js.map