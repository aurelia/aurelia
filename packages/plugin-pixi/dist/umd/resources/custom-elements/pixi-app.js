(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "tslib", "@aurelia/runtime", "pixi.js"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const tslib_1 = require("tslib");
    const runtime_1 = require("@aurelia/runtime");
    const pixi_js_1 = require("pixi.js");
    let PixiApp = class PixiApp {
        constructor(...args) {
            this.element = args[0];
            this._app = null;
            this.stage = null;
            this.callTick = (delta) => {
                if (typeof this.tick === 'function') {
                    this.tick({ delta });
                }
            };
        }
        get app() {
            return this._app;
        }
        bound() {
            const boundOptions = {
                width: typeof this.width === 'string' ? parseInt(this.width, 10) : this.width,
                height: typeof this.height === 'string' ? parseInt(this.height, 10) : this.height,
                view: this.view,
                transparent: this.transparent,
                antialias: this.antialias,
                preserveDrawingBuffer: this.preserveDrawingBuffer,
                resolution: this.resolution,
                forceCanvas: this.forceCanvas,
                backgroundColor: typeof this.backgroundColor === 'string' ? parseInt(this.backgroundColor, 16) : this.backgroundColor,
                clearBeforeRender: this.clearBeforeRender,
                roundPixels: this.roundPixels,
                forceFXAA: this.forceFXAA,
                legacy: this.legacy,
                context: this.context,
                autoResize: this.autoResize,
                powerPreference: this.powerPreference
            };
            if (this.options instanceof Object) {
                this._app = new pixi_js_1.Application({ ...this.options, ...boundOptions });
            }
            else {
                this._app = new pixi_js_1.Application(boundOptions);
            }
            this.stage = this._app.stage;
        }
        attached() {
            if (this._app !== null) {
                this.element.appendChild(this._app.view);
                this._app.ticker.add(this.callTick);
            }
        }
        detached() {
            if (this._app !== null) {
                this.element.removeChild(this._app.view);
                this._app.ticker.remove(this.callTick);
            }
        }
        unbound() {
            if (this.app !== null) {
                this.app.destroy();
            }
            this._app = null;
            this.stage = null;
        }
    };
    PixiApp.inject = [Element];
    tslib_1.__decorate([
        runtime_1.bindable
    ], PixiApp.prototype, "options", void 0);
    tslib_1.__decorate([
        runtime_1.bindable
    ], PixiApp.prototype, "width", void 0);
    tslib_1.__decorate([
        runtime_1.bindable
    ], PixiApp.prototype, "height", void 0);
    tslib_1.__decorate([
        runtime_1.bindable
    ], PixiApp.prototype, "view", void 0);
    tslib_1.__decorate([
        runtime_1.bindable
    ], PixiApp.prototype, "transparent", void 0);
    tslib_1.__decorate([
        runtime_1.bindable
    ], PixiApp.prototype, "antialias", void 0);
    tslib_1.__decorate([
        runtime_1.bindable
    ], PixiApp.prototype, "preserveDrawingBuffer", void 0);
    tslib_1.__decorate([
        runtime_1.bindable
    ], PixiApp.prototype, "resolution", void 0);
    tslib_1.__decorate([
        runtime_1.bindable
    ], PixiApp.prototype, "forceCanvas", void 0);
    tslib_1.__decorate([
        runtime_1.bindable
    ], PixiApp.prototype, "backgroundColor", void 0);
    tslib_1.__decorate([
        runtime_1.bindable
    ], PixiApp.prototype, "clearBeforeRender", void 0);
    tslib_1.__decorate([
        runtime_1.bindable
    ], PixiApp.prototype, "roundPixels", void 0);
    tslib_1.__decorate([
        runtime_1.bindable
    ], PixiApp.prototype, "forceFXAA", void 0);
    tslib_1.__decorate([
        runtime_1.bindable
    ], PixiApp.prototype, "legacy", void 0);
    tslib_1.__decorate([
        runtime_1.bindable
    ], PixiApp.prototype, "context", void 0);
    tslib_1.__decorate([
        runtime_1.bindable
    ], PixiApp.prototype, "autoResize", void 0);
    tslib_1.__decorate([
        runtime_1.bindable
    ], PixiApp.prototype, "powerPreference", void 0);
    tslib_1.__decorate([
        runtime_1.bindable
    ], PixiApp.prototype, "tick", void 0);
    PixiApp = tslib_1.__decorate([
        runtime_1.customElement({ name: 'pixi-app', template: '<template><div replaceable="children"></div></template>' })
    ], PixiApp);
    exports.PixiApp = PixiApp;
});
//# sourceMappingURL=pixi-app.js.map