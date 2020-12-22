import { DI } from '@aurelia/kernel';
import { IRenderLocation } from '../../dom.js';
import { customElement } from '../custom-element.js';
import { IViewFactory } from '../../templating/view.js';
export const IProjections = DI.createInterface("IProjections");
export var AuSlotContentType;
(function (AuSlotContentType) {
    AuSlotContentType[AuSlotContentType["Projection"] = 0] = "Projection";
    AuSlotContentType[AuSlotContentType["Fallback"] = 1] = "Fallback";
})(AuSlotContentType || (AuSlotContentType = {}));
export class SlotInfo {
    constructor(name, type, projectionContext) {
        this.name = name;
        this.type = type;
        this.projectionContext = projectionContext;
    }
}
export class ProjectionContext {
    constructor(content, scope = null) {
        this.content = content;
        this.scope = scope;
    }
}
export class RegisteredProjections {
    constructor(scope, projections) {
        this.scope = scope;
        this.projections = projections;
    }
}
export const IProjectionProvider = DI.createInterface('IProjectionProvider', x => x.singleton(ProjectionProvider));
const projectionMap = new WeakMap();
export class ProjectionProvider {
    registerProjections(projections, scope) {
        for (const [instruction, $projections] of projections) {
            projectionMap.set(instruction, new RegisteredProjections(scope, $projections));
        }
    }
    getProjectionFor(instruction) {
        return projectionMap.get(instruction) ?? null;
    }
}
export class AuSlot {
    constructor(factory, location) {
        this.factory = factory;
        this.hostScope = null;
        this.view = factory.create().setLocation(location);
        this.isProjection = factory.contentType === AuSlotContentType.Projection;
        this.outerScope = factory.projectionScope;
    }
    /**
     * @internal
     */
    static get inject() { return [IViewFactory, IRenderLocation]; }
    binding(initiator, parent, flags) {
        this.hostScope = this.$controller.scope.parentScope;
    }
    attaching(initiator, parent, flags) {
        const { $controller } = this;
        return this.view.activate(initiator, $controller, flags, this.outerScope ?? this.hostScope, this.hostScope);
    }
    detaching(initiator, parent, flags) {
        return this.view.deactivate(initiator, this.$controller, flags);
    }
    dispose() {
        this.view.dispose();
        this.view = (void 0);
    }
    accept(visitor) {
        if (this.view?.accept(visitor) === true) {
            return true;
        }
    }
}
customElement({ name: 'au-slot', template: null, containerless: true })(AuSlot);
//# sourceMappingURL=au-slot.js.map