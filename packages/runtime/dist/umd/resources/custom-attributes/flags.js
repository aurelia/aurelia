(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "tslib", "@aurelia/kernel", "../../dom", "../../lifecycle", "../custom-attribute"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const tslib_1 = require("tslib");
    const kernel_1 = require("@aurelia/kernel");
    const dom_1 = require("../../dom");
    const lifecycle_1 = require("../../lifecycle");
    const custom_attribute_1 = require("../custom-attribute");
    class FlagsTemplateController {
        constructor(factory, location, flags) {
            this.factory = factory;
            this.flags = flags;
            this.id = kernel_1.nextId('au$component');
            this.view = this.factory.create();
            this.view.hold(location, 1 /* insertBefore */);
        }
        binding(flags) {
            this.view.parent = this.$controller;
            return this.view.bind(flags | this.flags, this.$controller.scope);
        }
        attaching(flags) {
            this.view.attach(flags);
        }
        detaching(flags) {
            this.view.detach(flags);
        }
        unbinding(flags) {
            const task = this.view.unbind(flags);
            this.view.parent = void 0;
            return task;
        }
    }
    let InfrequentMutations = class InfrequentMutations extends FlagsTemplateController {
        constructor(factory, location) {
            super(factory, location, 268435456 /* noTargetObserverQueue */);
        }
    };
    InfrequentMutations = tslib_1.__decorate([
        custom_attribute_1.templateController('infrequent-mutations'),
        tslib_1.__param(0, lifecycle_1.IViewFactory),
        tslib_1.__param(1, dom_1.IRenderLocation)
    ], InfrequentMutations);
    exports.InfrequentMutations = InfrequentMutations;
    let FrequentMutations = class FrequentMutations extends FlagsTemplateController {
        constructor(factory, location) {
            super(factory, location, 536870912 /* persistentTargetObserverQueue */);
        }
    };
    FrequentMutations = tslib_1.__decorate([
        custom_attribute_1.templateController('frequent-mutations'),
        tslib_1.__param(0, lifecycle_1.IViewFactory),
        tslib_1.__param(1, dom_1.IRenderLocation)
    ], FrequentMutations);
    exports.FrequentMutations = FrequentMutations;
    let ObserveShallow = class ObserveShallow extends FlagsTemplateController {
        constructor(factory, location) {
            super(factory, location, 134217728 /* observeLeafPropertiesOnly */);
        }
    };
    ObserveShallow = tslib_1.__decorate([
        custom_attribute_1.templateController('observe-shallow'),
        tslib_1.__param(0, lifecycle_1.IViewFactory),
        tslib_1.__param(1, dom_1.IRenderLocation)
    ], ObserveShallow);
    exports.ObserveShallow = ObserveShallow;
});
//# sourceMappingURL=flags.js.map