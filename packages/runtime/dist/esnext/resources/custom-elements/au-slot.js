var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
import { DI, Registration } from '@aurelia/kernel';
import { IRenderLocation, } from '../../dom';
import { IViewFactory } from '../../lifecycle';
import { customElement } from '../custom-element';
export const IProjections = DI.createInterface("IProjections").noDefault();
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
export const IProjectionProvider = DI.createInterface('IProjectionProvider').noDefault();
const projectionMap = new WeakMap();
export class ProjectionProvider {
    static register(container) {
        return container.register(Registration.singleton(IProjectionProvider, ProjectionProvider));
    }
    registerProjections(projections, scope) {
        for (const [instruction, $projections] of projections) {
            projectionMap.set(instruction, new RegisteredProjections(scope, $projections));
        }
    }
    getProjectionFor(instruction) {
        var _a;
        return (_a = projectionMap.get(instruction)) !== null && _a !== void 0 ? _a : null;
    }
}
let AuSlot = /** @class */ (() => {
    let AuSlot = class AuSlot {
        constructor(factory, location) {
            this.factory = factory;
            this.hostScope = null;
            this.view = factory.create();
            this.view.setLocation(location, 1 /* insertBefore */);
            this.isProjection = factory.contentType === AuSlotContentType.Projection;
            this.outerScope = factory.projectionScope;
        }
        beforeBind(initiator, parent, flags) {
            this.hostScope = this.$controller.scope.parentScope;
        }
        afterAttach(initiator, parent, flags) {
            var _a;
            const { $controller } = this;
            return this.view.activate(initiator, $controller, flags, (_a = this.outerScope) !== null && _a !== void 0 ? _a : this.hostScope, this.hostScope);
        }
        afterUnbind(initiator, parent, flags) {
            return this.view.deactivate(initiator, this.$controller, flags);
        }
        onCancel(initiator, parent, flags) {
            this.view.cancel(initiator, this.$controller, flags);
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
    };
    AuSlot = __decorate([
        customElement({ name: 'au-slot', template: null, containerless: true }),
        __param(0, IViewFactory),
        __param(1, IRenderLocation),
        __metadata("design:paramtypes", [Object, Object])
    ], AuSlot);
    return AuSlot;
})();
export { AuSlot };
//# sourceMappingURL=au-slot.js.map