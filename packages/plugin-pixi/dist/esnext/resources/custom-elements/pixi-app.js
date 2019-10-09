import { __decorate } from "tslib";
import { bindable, customElement } from '@aurelia/runtime';
import { Application } from 'pixi.js';
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
            this._app = new Application({ ...this.options, ...boundOptions });
        }
        else {
            this._app = new Application(boundOptions);
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
__decorate([
    bindable
], PixiApp.prototype, "options", void 0);
__decorate([
    bindable
], PixiApp.prototype, "width", void 0);
__decorate([
    bindable
], PixiApp.prototype, "height", void 0);
__decorate([
    bindable
], PixiApp.prototype, "view", void 0);
__decorate([
    bindable
], PixiApp.prototype, "transparent", void 0);
__decorate([
    bindable
], PixiApp.prototype, "antialias", void 0);
__decorate([
    bindable
], PixiApp.prototype, "preserveDrawingBuffer", void 0);
__decorate([
    bindable
], PixiApp.prototype, "resolution", void 0);
__decorate([
    bindable
], PixiApp.prototype, "forceCanvas", void 0);
__decorate([
    bindable
], PixiApp.prototype, "backgroundColor", void 0);
__decorate([
    bindable
], PixiApp.prototype, "clearBeforeRender", void 0);
__decorate([
    bindable
], PixiApp.prototype, "roundPixels", void 0);
__decorate([
    bindable
], PixiApp.prototype, "forceFXAA", void 0);
__decorate([
    bindable
], PixiApp.prototype, "legacy", void 0);
__decorate([
    bindable
], PixiApp.prototype, "context", void 0);
__decorate([
    bindable
], PixiApp.prototype, "autoResize", void 0);
__decorate([
    bindable
], PixiApp.prototype, "powerPreference", void 0);
__decorate([
    bindable
], PixiApp.prototype, "tick", void 0);
PixiApp = __decorate([
    customElement({ name: 'pixi-app', template: '<template><div replaceable="children"></div></template>' })
], PixiApp);
export { PixiApp };
//# sourceMappingURL=pixi-app.js.map