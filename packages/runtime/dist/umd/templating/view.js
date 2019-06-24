(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "@aurelia/kernel", "./controller"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const kernel_1 = require("@aurelia/kernel");
    const controller_1 = require("./controller");
    class ViewFactory {
        constructor(name, template, lifecycle) {
            this.isCaching = false;
            this.cacheSize = -1;
            this.cache = null;
            this.lifecycle = lifecycle;
            this.name = name;
            this.template = template;
            this.parts = kernel_1.PLATFORM.emptyObject;
        }
        setCacheSize(size, doNotOverrideIfAlreadySet) {
            if (size) {
                if (size === '*') {
                    size = ViewFactory.maxCacheSize;
                }
                else if (typeof size === 'string') {
                    size = parseInt(size, 10);
                }
                if (this.cacheSize === -1 || !doNotOverrideIfAlreadySet) {
                    this.cacheSize = size;
                }
            }
            if (this.cacheSize > 0) {
                this.cache = [];
            }
            else {
                this.cache = null;
            }
            this.isCaching = this.cacheSize > 0;
        }
        canReturnToCache(controller) {
            return this.cache != null && this.cache.length < this.cacheSize;
        }
        tryReturnToCache(controller) {
            if (this.canReturnToCache(controller)) {
                controller.cache(0 /* none */);
                this.cache.push(controller);
                return true;
            }
            return false;
        }
        create(flags) {
            const cache = this.cache;
            let controller;
            if (cache != null && cache.length > 0) {
                controller = cache.pop();
                controller.state = (controller.state | 128 /* isCached */) ^ 128 /* isCached */;
                return controller;
            }
            controller = controller_1.Controller.forSyntheticView(this, this.lifecycle, flags);
            this.template.render(controller, null, this.parts, flags);
            if (!controller.nodes) {
                throw kernel_1.Reporter.error(90);
            }
            return controller;
        }
        addParts(parts) {
            if (this.parts === kernel_1.PLATFORM.emptyObject) {
                this.parts = { ...parts };
            }
            else {
                Object.assign(this.parts, parts);
            }
        }
    }
    ViewFactory.maxCacheSize = 0xFFFF;
    exports.ViewFactory = ViewFactory;
});
//# sourceMappingURL=view.js.map