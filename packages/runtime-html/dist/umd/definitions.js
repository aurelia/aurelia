(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "@aurelia/kernel"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.HooksDefinition = exports.IInstruction = void 0;
    const kernel_1 = require("@aurelia/kernel");
    exports.IInstruction = kernel_1.DI.createInterface('IInstruction').noDefault();
    class HooksDefinition {
        constructor(target) {
            this.hasDefine = 'define' in target;
            this.hasBeforeCompose = 'beforeCompose' in target;
            this.hasBeforeComposeChildren = 'beforeComposeChildren' in target;
            this.hasAfterCompose = 'afterCompose' in target;
            this.hasBeforeBind = 'beforeBind' in target;
            this.hasAfterBind = 'afterBind' in target;
            this.hasAfterAttach = 'afterAttach' in target;
            this.hasAfterAttachChildren = 'afterAttachChildren' in target;
            this.hasBeforeDetach = 'beforeDetach' in target;
            this.hasBeforeUnbind = 'beforeUnbind' in target;
            this.hasAfterUnbind = 'afterUnbind' in target;
            this.hasAfterUnbindChildren = 'afterUnbindChildren' in target;
            this.hasDispose = 'dispose' in target;
            this.hasAccept = 'accept' in target;
        }
    }
    exports.HooksDefinition = HooksDefinition;
    HooksDefinition.none = new HooksDefinition({});
});
//# sourceMappingURL=definitions.js.map