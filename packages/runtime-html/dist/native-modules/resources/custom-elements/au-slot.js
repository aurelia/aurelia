import { DI } from '../../../../../kernel/dist/native-modules/index.js';
import { IRenderLocation } from '../../dom.js';
import { IInstruction } from '../../renderer.js';
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
export class RegisteredProjections {
    constructor(scope, projections) {
        this.scope = scope;
        this.projections = projections;
    }
}
export const IProjectionProvider = DI.createInterface('IProjectionProvider', x => x.singleton(ProjectionProvider));
const auSlotScopeMap = new WeakMap();
const projectionMap = new WeakMap();
export class ProjectionProvider {
    registerProjections(projections, scope) {
        for (const [instruction, $projections] of projections) {
            projectionMap.set(instruction, new RegisteredProjections(scope, $projections));
        }
    }
    getProjectionFor(instruction) {
        var _a;
        return (_a = projectionMap.get(instruction)) !== null && _a !== void 0 ? _a : null;
    }
    registerScopeFor(auSlotInstruction, scope) {
        auSlotScopeMap.set(auSlotInstruction, scope);
    }
    getScopeFor(auSlotInstruction) {
        var _a;
        return (_a = auSlotScopeMap.get(auSlotInstruction)) !== null && _a !== void 0 ? _a : null;
    }
}
export class AuSlot {
    constructor(projectionProvider, instruction, factory, location) {
        this.hostScope = null;
        this.view = factory.create().setLocation(location);
        this.outerScope = projectionProvider.getScopeFor(instruction);
    }
    /**
     * @internal
     */
    static get inject() { return [ProjectionProvider, IInstruction, IViewFactory, IRenderLocation]; }
    binding(_initiator, _parent, _flags) {
        this.hostScope = this.$controller.scope.parentScope;
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