(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "@aurelia/kernel", "./resources/custom-elements/pixi-app", "./resources/custom-elements/pixi-sprite"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.PixiConfiguration = exports.DefaultResources = exports.PixiSpriteRegistration = exports.PixiAppRegistration = exports.PixiSprite = exports.PixiApp = void 0;
    const kernel_1 = require("@aurelia/kernel");
    const pixi_app_1 = require("./resources/custom-elements/pixi-app");
    Object.defineProperty(exports, "PixiApp", { enumerable: true, get: function () { return pixi_app_1.PixiApp; } });
    const pixi_sprite_1 = require("./resources/custom-elements/pixi-sprite");
    Object.defineProperty(exports, "PixiSprite", { enumerable: true, get: function () { return pixi_sprite_1.PixiSprite; } });
    exports.PixiAppRegistration = pixi_app_1.PixiApp;
    exports.PixiSpriteRegistration = pixi_sprite_1.PixiSprite;
    /**
     * Default pixi-specific resources:
     * - Custom Elements: `pixi-app`, `pixi-sprite`
     */
    exports.DefaultResources = [
        pixi_app_1.PixiApp,
        pixi_sprite_1.PixiSprite,
    ];
    /**
     * A DI configuration object containing pixi resource registrations.
     */
    exports.PixiConfiguration = {
        /**
         * Apply this configuration to the provided container.
         */
        register(container) {
            return container.register(...exports.DefaultResources);
        },
        /**
         * Create a new container with this configuration applied to it.
         */
        createContainer() {
            return this.register(kernel_1.DI.createContainer());
        }
    };
});
//# sourceMappingURL=index.js.map