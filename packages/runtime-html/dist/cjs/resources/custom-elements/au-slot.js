"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuSlotsInfo = exports.IAuSlotsInfo = exports.AuSlot = exports.SlotInfo = exports.AuSlotContentType = exports.IProjections = void 0;
const kernel_1 = require("@aurelia/kernel");
const dom_js_1 = require("../../dom.js");
const renderer_js_1 = require("../../renderer.js");
const view_js_1 = require("../../templating/view.js");
const custom_element_js_1 = require("../custom-element.js");
exports.IProjections = kernel_1.DI.createInterface("IProjections");
var AuSlotContentType;
(function (AuSlotContentType) {
    AuSlotContentType[AuSlotContentType["Projection"] = 0] = "Projection";
    AuSlotContentType[AuSlotContentType["Fallback"] = 1] = "Fallback";
})(AuSlotContentType = exports.AuSlotContentType || (exports.AuSlotContentType = {}));
class SlotInfo {
    constructor(name, type, content) {
        this.name = name;
        this.type = type;
        this.content = content;
    }
}
exports.SlotInfo = SlotInfo;
class AuSlot {
    constructor(instruction, factory, location) {
        this.instruction = instruction;
        this.hostScope = null;
        this.outerScope = null;
        this.view = factory.create().setLocation(location);
    }
    /** @internal */
    static get inject() { return [renderer_js_1.IInstruction, view_js_1.IViewFactory, dom_js_1.IRenderLocation]; }
    binding(_initiator, _parent, _flags) {
        var _a, _b;
        this.hostScope = this.$controller.scope.parentScope;
        if (this.instruction.slotInfo.type === AuSlotContentType.Projection) {
            // todo: replace the following block with an IContextController injection
            let contextController = this.$controller.parent;
            while (contextController != null) {
                if (contextController.vmKind === 0 /* customElement */
                    && !(contextController.viewModel instanceof AuSlot)) {
                    break;
                }
                contextController = contextController.parent;
            }
            this.outerScope = (_b = (_a = contextController === null || contextController === void 0 ? void 0 : contextController.parent) === null || _a === void 0 ? void 0 : _a.scope) !== null && _b !== void 0 ? _b : null;
        }
    }
    attaching(initiator, parent, flags) {
        var _a;
        const { $controller } = this;
        return this.view.activate(initiator, $controller, flags, (_a = this.outerScope) !== null && _a !== void 0 ? _a : this.hostScope, this.hostScope);
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
exports.IAuSlotsInfo = kernel_1.DI.createInterface('AuSlotsInfo');
class AuSlotsInfo {
    /**
     * @param {string[]} projectedSlots - Name of the slots to which content are projected.
     */
    constructor(projectedSlots) {
        this.projectedSlots = projectedSlots;
    }
}
exports.AuSlotsInfo = AuSlotsInfo;
//# sourceMappingURL=au-slot.js.map