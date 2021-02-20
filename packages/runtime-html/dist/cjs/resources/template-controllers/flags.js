"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ObserveShallow = exports.FrequentMutations = void 0;
const kernel_1 = require("@aurelia/kernel");
const dom_js_1 = require("../../dom.js");
const view_js_1 = require("../../templating/view.js");
const custom_attribute_js_1 = require("../custom-attribute.js");
class FlagsTemplateController {
    constructor(factory, location, flags) {
        this.factory = factory;
        this.flags = flags;
        this.id = kernel_1.nextId('au$component');
        this.view = this.factory.create().setLocation(location);
    }
    attaching(initiator, parent, flags) {
        const { $controller } = this;
        return this.view.activate(initiator, $controller, flags | this.flags, $controller.scope, $controller.hostScope);
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
class FrequentMutations extends FlagsTemplateController {
    constructor(factory, location) {
        super(factory, location, 512 /* persistentTargetObserverQueue */);
    }
}
exports.FrequentMutations = FrequentMutations;
/**
 * @internal
 */
FrequentMutations.inject = [view_js_1.IViewFactory, dom_js_1.IRenderLocation];
class ObserveShallow extends FlagsTemplateController {
    constructor(factory, location) {
        super(factory, location, 128 /* observeLeafPropertiesOnly */);
    }
}
exports.ObserveShallow = ObserveShallow;
/**
 * @internal
 */
ObserveShallow.inject = [view_js_1.IViewFactory, dom_js_1.IRenderLocation];
custom_attribute_js_1.templateController('frequent-mutations')(FrequentMutations);
custom_attribute_js_1.templateController('observe-shallow')(ObserveShallow);
//# sourceMappingURL=flags.js.map