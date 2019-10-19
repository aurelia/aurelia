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
    let Replaceable = class Replaceable {
        constructor(factory, location) {
            this.factory = factory;
            this.location = location;
            this.id = kernel_1.nextId('au$component');
            this.view = this.factory.create();
            this.view.hold(location, 1 /* insertBefore */);
        }
        binding(flags) {
            this.view.parent = this.$controller;
            return this.view.bind(flags | 67108864 /* allowParentScopeTraversal */, this.$controller.scope, this.factory.name);
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
    };
    Replaceable = tslib_1.__decorate([
        custom_attribute_1.templateController('replaceable'),
        tslib_1.__param(0, lifecycle_1.IViewFactory),
        tslib_1.__param(1, dom_1.IRenderLocation)
    ], Replaceable);
    exports.Replaceable = Replaceable;
});
//# sourceMappingURL=replaceable.js.map