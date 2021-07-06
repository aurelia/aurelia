import { DI } from '../../../../../kernel/dist/native-modules/index.js';
import { IRenderLocation } from '../../dom.js';
import { customElement } from '../custom-element.js';
import { IInstruction } from '../../renderer.js';
import { IHydrationContext } from '../../templating/controller.js';
import { getRenderContext } from '../../templating/render-context.js';
export const IProjections = DI.createInterface("IProjections");
export class AuSlot {
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
            factory = getRenderContext(slotInfo.fallback, hdrContext.controller.container).getViewFactory();
        }
        else {
            factory = getRenderContext(projection, hdrContext.parent.controller.container).getViewFactory();
            this.hasProjection = true;
        }
        this.view = factory.create().setLocation(location);
    }
    /** @internal */
    static get inject() { return [IRenderLocation, IInstruction, IHydrationContext]; }
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