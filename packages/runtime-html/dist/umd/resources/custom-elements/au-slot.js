(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "@aurelia/kernel", "../../dom.js", "../custom-element.js", "../../templating/view.js"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.AuSlot = exports.ProjectionProvider = exports.IProjectionProvider = exports.RegisteredProjections = exports.ProjectionContext = exports.SlotInfo = exports.AuSlotContentType = exports.IProjections = void 0;
    const kernel_1 = require("@aurelia/kernel");
    const dom_js_1 = require("../../dom.js");
    const custom_element_js_1 = require("../custom-element.js");
    const view_js_1 = require("../../templating/view.js");
    exports.IProjections = kernel_1.DI.createInterface("IProjections");
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
    exports.IProjectionProvider = kernel_1.DI.createInterface('IProjectionProvider', x => x.singleton(ProjectionProvider));
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
    class AuSlot {
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
        static get inject() { return [view_js_1.IViewFactory, dom_js_1.IRenderLocation]; }
        binding(initiator, parent, flags) {
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
    exports.AuSlot = AuSlot;
    custom_element_js_1.customElement({ name: 'au-slot', template: null, containerless: true })(AuSlot);
});
//# sourceMappingURL=au-slot.js.map