var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
import { ILogger } from '../../../../kernel/dist/native-modules/index.js';
import { bindable, customElement } from '../../../../runtime-html/dist/native-modules/index.js';
import { IRouteContext } from '../route-context.js';
let ViewportCustomElement = class ViewportCustomElement {
    constructor(logger, ctx) {
        this.logger = logger;
        this.ctx = ctx;
        this.name = 'default';
        this.usedBy = '';
        this.default = '';
        this.fallback = '';
        this.noScope = false;
        this.noLink = false;
        this.noHistory = false;
        this.stateful = false;
        this.agent = (void 0);
        this.controller = (void 0);
        this.logger = logger.scopeTo(`au-viewport<${ctx.friendlyPath}>`);
        this.logger.trace('constructor()');
    }
    hydrated(controller) {
        this.logger.trace('hydrated()');
        this.controller = controller;
        this.agent = this.ctx.registerViewport(this);
    }
    attaching(initiator, parent, flags) {
        this.logger.trace('attaching()');
        return this.agent.activateFromViewport(initiator, this.controller, flags);
    }
    detaching(initiator, parent, flags) {
        this.logger.trace('detaching()');
        return this.agent.deactivateFromViewport(initiator, this.controller, flags);
    }
    dispose() {
        this.logger.trace('dispose()');
        this.ctx.unregisterViewport(this);
        this.agent.dispose();
        this.agent = (void 0);
    }
    toString() {
        const propStrings = [];
        for (const prop of props) {
            const value = this[prop];
            // Only report props that don't have default values (but always report name)
            // This is a bit naive and dirty right now, but it's mostly for debugging purposes anyway. Can clean up later. Maybe put it in a serializer
            switch (typeof value) {
                case 'string':
                    if (value !== '') {
                        propStrings.push(`${prop}:'${value}'`);
                    }
                    break;
                case 'boolean':
                    if (value) {
                        propStrings.push(`${prop}:${value}`);
                    }
                    break;
                default: {
                    propStrings.push(`${prop}:${String(value)}`);
                }
            }
        }
        return `VP(ctx:'${this.ctx.friendlyPath}',${propStrings.join(',')})`;
    }
};
__decorate([
    bindable
], ViewportCustomElement.prototype, "name", void 0);
__decorate([
    bindable
], ViewportCustomElement.prototype, "usedBy", void 0);
__decorate([
    bindable
], ViewportCustomElement.prototype, "default", void 0);
__decorate([
    bindable
], ViewportCustomElement.prototype, "fallback", void 0);
__decorate([
    bindable
], ViewportCustomElement.prototype, "noScope", void 0);
__decorate([
    bindable
], ViewportCustomElement.prototype, "noLink", void 0);
__decorate([
    bindable
], ViewportCustomElement.prototype, "noHistory", void 0);
__decorate([
    bindable
], ViewportCustomElement.prototype, "stateful", void 0);
ViewportCustomElement = __decorate([
    customElement({ name: 'au-viewport' }),
    __param(0, ILogger),
    __param(1, IRouteContext)
], ViewportCustomElement);
export { ViewportCustomElement };
const props = [
    'name',
    'usedBy',
    'default',
    'fallback',
    'noScope',
    'noLink',
    'noHistory',
    'stateful',
];
//# sourceMappingURL=viewport.js.map