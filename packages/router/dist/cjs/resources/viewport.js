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
var ViewportCustomElement_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ViewportCustomElement = exports.ParentViewport = void 0;
const kernel_1 = require("@aurelia/kernel");
const runtime_html_1 = require("@aurelia/runtime-html");
const router_js_1 = require("../router.js");
const viewport_scope_js_1 = require("./viewport-scope.js");
const runner_js_1 = require("../runner.js");
exports.ParentViewport = runtime_html_1.CustomElement.createInjectable();
let ViewportCustomElement = ViewportCustomElement_1 = class ViewportCustomElement {
    constructor(router, element, container, parentViewport) {
        this.router = router;
        this.element = element;
        this.container = container;
        this.parentViewport = parentViewport;
        this.name = 'default';
        this.usedBy = '';
        this.default = '';
        this.fallback = '';
        this.noScope = false;
        this.noLink = false;
        this.noTitle = false;
        this.noHistory = false;
        this.stateful = false;
        this.viewport = null;
        this.isBound = false;
    }
    hydrated(controller) {
        // console.log('hydrated', this.name, this.router.isActive);
        this.controller = controller;
        this.container = controller.context.get(kernel_1.IContainer);
        // The first viewport(s) might be compiled before the router is active
        return runner_js_1.Runner.run(() => this.waitForRouterStart(), () => {
            if (this.router.isRestrictedNavigation) {
                this.connect();
            }
        });
    }
    binding(initiator, parent, flags) {
        this.isBound = true;
        return runner_js_1.Runner.run(() => this.waitForRouterStart(), () => {
            if (!this.router.isRestrictedNavigation) {
                this.connect();
            }
        });
    }
    attaching(initiator, parent, flags) {
        if (this.viewport !== null && (this.viewport.nextContent ?? null) === null) {
            // console.log('attaching', this.viewport?.toString());
            this.viewport.enabled = true;
            return this.viewport.activate(initiator, this.$controller, flags, true);
            // TODO: Restore scroll state
        }
    }
    unbinding(initiator, parent, flags) {
        if (this.viewport !== null && (this.viewport.nextContent ?? null) === null) {
            // console.log('unbinding', this.viewport?.toString());
            // TODO: Save to cache, something like
            // this.viewport.cacheContent();
            // From viewport-content:
            // public unloadComponent(cache: ViewportContent[], stateful: boolean = false): void {
            //   // TODO: We might want to do something here eventually, who knows?
            //   if (this.contentStatus !== ContentStatus.loaded) {
            //     return;
            //   }
            //   // Don't unload components when stateful
            //   if (!stateful) {
            //     this.contentStatus = ContentStatus.created;
            //   } else {
            //     cache.push(this);
            //   }
            // }
            // TODO: Save scroll state before detach
            return runner_js_1.Runner.run(() => this.viewport.deactivate(initiator, parent, flags), () => {
                this.isBound = false;
                this.viewport.enabled = false;
            });
            // this.isBound = false;
            // this.viewport.enabled = false;
            // return this.viewport.deactivate(initiator, parent, flags);
            // // this.viewport.enabled = false;
        }
    }
    // public detaching(initiator: IHydratedController, parent: ISyntheticView | ICustomElementController<ICustomElementViewModel> | null, flags: LifecycleFlags): void | Promise<void> {
    //   if (this.viewport !== null && (this.viewport.nextContent ?? null) === null) {
    //     console.log('detaching', this.viewport?.toString());
    //   }
    // }
    dispose() {
        if (this.viewport !== null) {
            return runner_js_1.Runner.run(() => (this.viewport?.nextContent ?? null) === null ? this.viewport?.dispose() : void 0, () => this.disconnect());
        }
    }
    connect() {
        if (this.router.rootScope === null || (this.viewport !== null && this.router.isRestrictedNavigation)) {
            return;
        }
        // let controllerContainer = (this.controller.context as any).container;
        // let output = '';
        // do {
        //   console.log(output, ':', controllerContainer === this.container, this.controller, controllerContainer, this.container);
        //   if (controllerContainer === this.container) {
        //     break;
        //   }
        //   controllerContainer = controllerContainer.parent;
        //   output += '.parent';
        // } while (controllerContainer);
        const name = this.getAttribute('name', this.name);
        let value = this.getAttribute('no-scope', this.noScope);
        const options = { scope: value === void 0 || !value ? true : false };
        value = this.getAttribute('used-by', this.usedBy);
        if (value !== void 0) {
            options.usedBy = value;
        }
        value = this.getAttribute('default', this.default);
        if (value !== void 0) {
            options.default = value;
        }
        value = this.getAttribute('fallback', this.fallback);
        if (value !== void 0) {
            options.fallback = value;
        }
        value = this.getAttribute('no-link', this.noLink, true);
        if (value !== void 0) {
            options.noLink = value;
        }
        value = this.getAttribute('no-title', this.noTitle, true);
        if (value !== void 0) {
            options.noTitle = value;
        }
        value = this.getAttribute('no-history', this.noHistory, true);
        if (value !== void 0) {
            options.noHistory = value;
        }
        value = this.getAttribute('stateful', this.stateful, true);
        if (value !== void 0) {
            options.stateful = value;
        }
        this.controller.routingContainer = this.container;
        this.viewport = this.router.connectViewport(this.viewport, this, name, options);
    }
    disconnect() {
        if (this.viewport) {
            this.router.disconnectViewport(this.viewport, this);
        }
        this.viewport = null;
    }
    getAttribute(key, value, checkExists = false) {
        const result = {};
        if (this.isBound && !checkExists) {
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
        return value;
    }
    getClosestCustomElement() {
        let parent = this.controller.parent;
        let customElement = null;
        while (parent !== null && customElement === null) {
            if (parent.viewModel instanceof ViewportCustomElement_1 || parent.viewModel instanceof viewport_scope_js_1.ViewportScopeCustomElement) {
                customElement = parent.viewModel;
            }
            parent = parent.parent;
        }
        return customElement;
    }
    // TODO: Switch this to use (probably) an event instead
    waitForRouterStart() {
        if (this.router.isActive) {
            return;
        }
        return new Promise((resolve) => {
            this.router.starters.push(resolve);
        });
    }
};
__decorate([
    runtime_html_1.bindable
], ViewportCustomElement.prototype, "name", void 0);
__decorate([
    runtime_html_1.bindable
], ViewportCustomElement.prototype, "usedBy", void 0);
__decorate([
    runtime_html_1.bindable
], ViewportCustomElement.prototype, "default", void 0);
__decorate([
    runtime_html_1.bindable
], ViewportCustomElement.prototype, "fallback", void 0);
__decorate([
    runtime_html_1.bindable
], ViewportCustomElement.prototype, "noScope", void 0);
__decorate([
    runtime_html_1.bindable
], ViewportCustomElement.prototype, "noLink", void 0);
__decorate([
    runtime_html_1.bindable
], ViewportCustomElement.prototype, "noTitle", void 0);
__decorate([
    runtime_html_1.bindable
], ViewportCustomElement.prototype, "noHistory", void 0);
__decorate([
    runtime_html_1.bindable
], ViewportCustomElement.prototype, "stateful", void 0);
ViewportCustomElement = ViewportCustomElement_1 = __decorate([
    runtime_html_1.customElement({
        name: 'au-viewport',
        injectable: exports.ParentViewport
    }),
    __param(0, router_js_1.IRouter),
    __param(1, runtime_html_1.INode),
    __param(2, kernel_1.IContainer),
    __param(3, exports.ParentViewport)
], ViewportCustomElement);
exports.ViewportCustomElement = ViewportCustomElement;
//# sourceMappingURL=viewport.js.map