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
(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "@aurelia/kernel", "../../dom", "../custom-element", "../../templating/view"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.AuSlot = exports.ProjectionProvider = exports.IProjectionProvider = exports.RegisteredProjections = exports.ProjectionContext = exports.SlotInfo = exports.AuSlotContentType = exports.IProjections = void 0;
    const kernel_1 = require("@aurelia/kernel");
    const dom_1 = require("../../dom");
    const custom_element_1 = require("../custom-element");
    const view_1 = require("../../templating/view");
    exports.IProjections = kernel_1.DI.createInterface("IProjections").noDefault();
    var AuSlotContentType;
    (function (AuSlotContentType) {
        AuSlotContentType[AuSlotContentType["Projection"] = 0] = "Projection";
        AuSlotContentType[AuSlotContentType["Fallback"] = 1] = "Fallback";
    })(AuSlotContentType = exports.AuSlotContentType || (exports.AuSlotContentType = {}));
    class SlotInfo {
        constructor(name, type, projectionContext) {
            this.name = name;
            this.type = type;
            this.projectionContext = projectionContext;
        }
    }
    exports.SlotInfo = SlotInfo;
    class ProjectionContext {
        constructor(content, scope = null) {
            this.content = content;
            this.scope = scope;
        }
    }
    exports.ProjectionContext = ProjectionContext;
    class RegisteredProjections {
        constructor(scope, projections) {
            this.scope = scope;
            this.projections = projections;
        }
    }
    exports.RegisteredProjections = RegisteredProjections;
    exports.IProjectionProvider = kernel_1.DI.createInterface('IProjectionProvider').withDefault(x => x.singleton(ProjectionProvider));
    const projectionMap = new WeakMap();
    class ProjectionProvider {
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
    exports.ProjectionProvider = ProjectionProvider;
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
        custom_element_1.customElement({ name: 'au-slot', template: null, containerless: true }),
        __param(0, view_1.IViewFactory),
        __param(1, dom_1.IRenderLocation),
        __metadata("design:paramtypes", [Object, Object])
    ], AuSlot);
    exports.AuSlot = AuSlot;
});
//# sourceMappingURL=au-slot.js.map