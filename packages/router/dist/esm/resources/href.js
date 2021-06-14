var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
import { customAttribute, bindable, BindingMode, IEventDelegator, IEventTarget, INode, IWindow, getRef, CustomAttribute } from '@aurelia/runtime-html';
import { IRouter } from '../router.js';
import { LoadCustomAttribute } from '../configuration.js';
import { IRouteContext } from '../route-context.js';
let HrefCustomAttribute = class HrefCustomAttribute {
    constructor(target, el, router, delegator, ctx, w) {
        this.target = target;
        this.el = el;
        this.router = router;
        this.delegator = delegator;
        this.ctx = ctx;
        this.isInitialized = false;
        this.onClick = (e) => {
            // Ensure this is an ordinary left-button click
            if (e.altKey || e.ctrlKey || e.shiftKey || e.metaKey || e.button !== 0
                // on an internally managed link
                || this.isExternal
                || !this.isEnabled) {
                return;
            }
            // Use the normalized attribute instead of this.value to ensure consistency.
            const href = this.el.getAttribute('href');
            if (href !== null) {
                e.preventDefault();
                // Floating promises from `Router#load` are ok because the router keeps track of state and handles the errors, etc.
                void this.router.load(href, { context: this.ctx });
            }
        };
        if (router.options.useHref &&
            // Ensure the element is an anchor
            el.nodeName === 'A') {
            // Ensure the anchor targets the current window.
            switch (el.getAttribute('target')) {
                case null:
                case w.name:
                case '_self':
                    this.isEnabled = true;
                    break;
                default:
                    this.isEnabled = false;
                    break;
            }
        }
        else {
            this.isEnabled = false;
        }
    }
    get isExternal() {
        return this.el.hasAttribute('external') || this.el.hasAttribute('data-external');
    }
    binding() {
        if (!this.isInitialized) {
            this.isInitialized = true;
            this.isEnabled = this.isEnabled && getRef(this.el, CustomAttribute.getDefinition(LoadCustomAttribute).key) === null;
        }
        if (this.isEnabled) {
            this.el.setAttribute('href', this.value);
        }
        this.eventListener = this.delegator.addEventListener(this.target, this.el, 'click', this.onClick);
    }
    unbinding() {
        this.eventListener.dispose();
    }
    valueChanged(newValue) {
        this.el.setAttribute('href', newValue);
    }
};
__decorate([
    bindable({ mode: BindingMode.toView })
], HrefCustomAttribute.prototype, "value", void 0);
HrefCustomAttribute = __decorate([
    customAttribute({ name: 'href', noMultiBindings: true }),
    __param(0, IEventTarget),
    __param(1, INode),
    __param(2, IRouter),
    __param(3, IEventDelegator),
    __param(4, IRouteContext),
    __param(5, IWindow)
], HrefCustomAttribute);
export { HrefCustomAttribute };
//# sourceMappingURL=href.js.map