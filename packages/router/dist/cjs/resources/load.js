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
exports.LoadCustomAttribute = void 0;
const runtime_html_1 = require("@aurelia/runtime-html");
const router_js_1 = require("../router.js");
const route_context_js_1 = require("../route-context.js");
const router_events_js_1 = require("../router-events.js");
const location_manager_js_1 = require("../location-manager.js");
let LoadCustomAttribute = class LoadCustomAttribute {
    constructor(target, el, router, events, delegator, ctx, locationMgr) {
        this.target = target;
        this.el = el;
        this.router = router;
        this.events = events;
        this.delegator = delegator;
        this.ctx = ctx;
        this.locationMgr = locationMgr;
        this.attribute = 'href';
        this.active = false;
        this.href = null;
        this.instructions = null;
        this.eventListener = null;
        this.navigationEndListener = null;
        this.onClick = (e) => {
            if (this.instructions === null) {
                return;
            }
            // Ensure this is an ordinary left-button click.
            if (e.altKey || e.ctrlKey || e.shiftKey || e.metaKey || e.button !== 0) {
                return;
            }
            e.preventDefault();
            // Floating promises from `Router#load` are ok because the router keeps track of state and handles the errors, etc.
            void this.router.load(this.instructions, { context: this.ctx });
        };
        // Ensure the element is not explicitly marked as external.
        this.isEnabled = !el.hasAttribute('external') && !el.hasAttribute('data-external');
    }
    binding() {
        if (this.isEnabled) {
            this.eventListener = this.delegator.addEventListener(this.target, this.el, 'click', this.onClick);
        }
        this.valueChanged();
        this.navigationEndListener = this.events.subscribe('au:router:navigation-end', _e => {
            this.valueChanged();
            this.active = this.instructions !== null && this.router.isActive(this.instructions, this.ctx);
        });
    }
    attaching() {
        if (this.ctx.allResolved !== null) {
            return this.ctx.allResolved.then(() => {
                this.valueChanged();
            });
        }
    }
    unbinding() {
        if (this.isEnabled) {
            this.eventListener.dispose();
        }
        this.navigationEndListener.dispose();
    }
    valueChanged() {
        const useHash = this.router.options.useUrlFragmentHash;
        if (this.route !== null && this.route !== void 0 && this.ctx.allResolved === null) {
            const def = this.ctx.childRoutes.find(x => x.id === this.route);
            if (def !== void 0) {
                // TODO(fkleuver): massive temporary hack. Will not work for siblings etc. Need to fix.
                const parentPath = this.ctx.node.computeAbsolutePath();
                // Note: This is very much preliminary just to fill the feature gap of v1's `generate`. It probably misses a few edge cases.
                // TODO(fkleuver): move this logic to RouteExpression and expose via public api, add tests etc
                let path = def.path[0];
                if (typeof this.params === 'object' && this.params !== null) {
                    const keys = Object.keys(this.params);
                    for (const key of keys) {
                        const value = this.params[key];
                        if (value != null && String(value).length > 0) {
                            path = path.replace(new RegExp(`[*:]${key}[?]?`), value);
                        }
                    }
                }
                // Remove leading and trailing optional param parts
                path = path.replace(/\/[*:][^/]+[?]/g, '').replace(/[*:][^/]+[?]\//g, '');
                if (parentPath) {
                    if (path) {
                        this.href = `${useHash ? '#' : ''}${[parentPath, path].join('/')}`;
                    }
                    else {
                        this.href = `${useHash ? '#' : ''}${parentPath}`;
                    }
                }
                else {
                    this.href = `${useHash ? '#' : ''}${path}`;
                }
                this.instructions = this.router.createViewportInstructions(`${useHash ? '#' : ''}${path}`, { context: this.ctx });
            }
            else {
                if (typeof this.params === 'object' && this.params !== null) {
                    this.instructions = this.router.createViewportInstructions({ component: this.route, params: this.params }, { context: this.ctx });
                }
                else {
                    this.instructions = this.router.createViewportInstructions(this.route, { context: this.ctx });
                }
                this.href = this.instructions.toUrl(this.router.options.useUrlFragmentHash);
            }
        }
        else {
            this.instructions = null;
            this.href = null;
        }
        const controller = runtime_html_1.CustomElement.for(this.el, { optional: true });
        if (controller !== null) {
            controller.viewModel[this.attribute] = this.instructions;
        }
        else {
            if (this.href === null) {
                this.el.removeAttribute(this.attribute);
            }
            else {
                const value = useHash ? this.href : this.locationMgr.addBaseHref(this.href);
                this.el.setAttribute(this.attribute, value);
            }
        }
    }
};
__decorate([
    runtime_html_1.bindable({ mode: runtime_html_1.BindingMode.toView, primary: true, callback: 'valueChanged' })
], LoadCustomAttribute.prototype, "route", void 0);
__decorate([
    runtime_html_1.bindable({ mode: runtime_html_1.BindingMode.toView, callback: 'valueChanged' })
], LoadCustomAttribute.prototype, "params", void 0);
__decorate([
    runtime_html_1.bindable({ mode: runtime_html_1.BindingMode.toView })
], LoadCustomAttribute.prototype, "attribute", void 0);
__decorate([
    runtime_html_1.bindable({ mode: runtime_html_1.BindingMode.fromView })
], LoadCustomAttribute.prototype, "active", void 0);
LoadCustomAttribute = __decorate([
    runtime_html_1.customAttribute('load'),
    __param(0, runtime_html_1.IEventTarget),
    __param(1, runtime_html_1.INode),
    __param(2, router_js_1.IRouter),
    __param(3, router_events_js_1.IRouterEvents),
    __param(4, runtime_html_1.IEventDelegator),
    __param(5, route_context_js_1.IRouteContext),
    __param(6, location_manager_js_1.ILocationManager)
], LoadCustomAttribute);
exports.LoadCustomAttribute = LoadCustomAttribute;
//# sourceMappingURL=load.js.map