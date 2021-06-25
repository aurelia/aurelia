import { DI } from '@aurelia/kernel';
import { IRenderLocation } from '../../dom.js';
import { IInstruction } from '../../renderer.js';
import { IHydrationContext } from '../../templating/controller.js';
import { IViewFactory } from '../../templating/view.js';
import { customElement } from '../custom-element.js';
export const IProjections = DI.createInterface("IProjections");
export var AuSlotContentType;
(function (AuSlotContentType) {
    AuSlotContentType[AuSlotContentType["Projection"] = 0] = "Projection";
    AuSlotContentType[AuSlotContentType["Fallback"] = 1] = "Fallback";
})(AuSlotContentType || (AuSlotContentType = {}));
export class SlotInfo {
    constructor(name, type, content) {
        this.name = name;
        this.type = type;
        this.content = content;
    }
}
export class AuSlot {
    constructor(factory, location, instruction, hdrContext) {
        this.instruction = instruction;
        this.hdrContext = hdrContext;
        this.hostScope = null;
        this.outerScope = null;
        this.view = factory.create().setLocation(location);
    }
    /** @internal */
    static get inject() { return [IViewFactory, IRenderLocation, IInstruction, IHydrationContext]; }
    binding(_initiator, _parent, _flags) {
        var _a;
        this.hostScope = this.$controller.scope.parentScope;
        this.outerScope = this.instruction.slotInfo.type === AuSlotContentType.Projection
            ? (_a = this.hdrContext.controller.scope.parentScope) !== null && _a !== void 0 ? _a : null : this.hostScope;
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
customElement({ name: 'au-slot', template: null, containerless: true })(AuSlot);
export const IAuSlotsInfo = DI.createInterface('AuSlotsInfo');
export class AuSlotsInfo {
    /**
     * @param {string[]} projectedSlots - Name of the slots to which content are projected.
     */
    constructor(projectedSlots) {
        this.projectedSlots = projectedSlots;
    }
}
//# sourceMappingURL=au-slot.js.map