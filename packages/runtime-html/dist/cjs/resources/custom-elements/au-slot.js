"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuSlot = void 0;
const dom_js_1 = require("../../dom.js");
const custom_element_js_1 = require("../custom-element.js");
const renderer_js_1 = require("../../renderer.js");
const controller_js_1 = require("../../templating/controller.js");
const render_context_js_1 = require("../../templating/render-context.js");
class AuSlot {
    constructor(location, instruction, hdrContext) {
        var _a, _b;
        this.hdrContext = hdrContext;
        this.hostScope = null;
        this.outerScope = null;
        this.hasProjection = false;
        let factory;
        const slotInfo = instruction.auSlot;
        const projection = (_b = (_a = hdrContext.instruction) === null || _a === void 0 ? void 0 : _a.projections) === null || _b === void 0 ? void 0 : _b[slotInfo.name];
        if (projection == null) {
            factory = render_context_js_1.getRenderContext(slotInfo.fallback, hdrContext.controller.container).getViewFactory();
        }
        else {
            factory = render_context_js_1.getRenderContext(projection, hdrContext.parent.controller.container).getViewFactory();
            this.hasProjection = true;
        }
        this.view = factory.create().setLocation(location);
    }
    /** @internal */
    static get inject() { return [dom_js_1.IRenderLocation, renderer_js_1.IInstruction, controller_js_1.IHydrationContext]; }
    binding(_initiator, _parent, _flags) {
        this.hostScope = this.$controller.scope.parentScope;
        this.outerScope = this.hasProjection
            ? this.hdrContext.controller.scope.parentScope
            : this.hostScope;
    }
    attaching(initiator, parent, flags) {
        var _a;
        return this.view.activate(initiator, this.$controller, flags, (_a = this.outerScope) !== null && _a !== void 0 ? _a : this.hostScope, this.hostScope);
    }
    detaching(initiator, parent, flags) {
        return this.view.deactivate(initiator, this.$controller, flags);
    }
    dispose() {
        this.view.dispose();
        this.view = (void 0);
    }
    accept(visitor) {
        var _a;
        if (((_a = this.view) === null || _a === void 0 ? void 0 : _a.accept(visitor)) === true) {
            return true;
        }
    }
}
exports.AuSlot = AuSlot;
custom_element_js_1.customElement({ name: 'au-slot', template: null, containerless: true })(AuSlot);
//# sourceMappingURL=au-slot.js.map