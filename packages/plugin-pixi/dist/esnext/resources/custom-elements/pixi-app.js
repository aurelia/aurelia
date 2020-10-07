var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
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
    afterBind() {
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
    afterAttach() {
        if (this._app !== null) {
            this.element.appendChild(this._app.view);
            this._app.ticker.add(this.callTick);
        }
    }
    beforeUnbind() {
        if (this._app !== null) {
            this.element.removeChild(this._app.view);
            this._app.ticker.remove(this.callTick);
        }
    }
    afterUnbindChildren() {
        if (this.app !== null) {
            this.app.destroy();
        }
        this._app = null;
        this.stage = null;
    }
};
PixiApp.inject = [Element];
__decorate([
    bindable,
    __metadata("design:type", Object)
], PixiApp.prototype, "options", void 0);
__decorate([
    bindable,
    __metadata("design:type", Number)
], PixiApp.prototype, "width", void 0);
__decorate([
    bindable,
    __metadata("design:type", Number)
], PixiApp.prototype, "height", void 0);
__decorate([
    bindable,
    __metadata("design:type", HTMLCanvasElement)
], PixiApp.prototype, "view", void 0);
__decorate([
    bindable,
    __metadata("design:type", Boolean)
], PixiApp.prototype, "transparent", void 0);
__decorate([
    bindable,
    __metadata("design:type", Boolean)
], PixiApp.prototype, "antialias", void 0);
__decorate([
    bindable,
    __metadata("design:type", Boolean)
], PixiApp.prototype, "preserveDrawingBuffer", void 0);
__decorate([
    bindable,
    __metadata("design:type", Number)
], PixiApp.prototype, "resolution", void 0);
__decorate([
    bindable,
    __metadata("design:type", Boolean)
], PixiApp.prototype, "forceCanvas", void 0);
__decorate([
    bindable,
    __metadata("design:type", Number)
], PixiApp.prototype, "backgroundColor", void 0);
__decorate([
    bindable,
    __metadata("design:type", Boolean)
], PixiApp.prototype, "clearBeforeRender", void 0);
__decorate([
    bindable,
    __metadata("design:type", Boolean)
], PixiApp.prototype, "roundPixels", void 0);
__decorate([
    bindable,
    __metadata("design:type", Boolean)
], PixiApp.prototype, "forceFXAA", void 0);
__decorate([
    bindable,
    __metadata("design:type", Boolean)
], PixiApp.prototype, "legacy", void 0);
__decorate([
    bindable,
    __metadata("design:type", WebGLRenderingContext)
], PixiApp.prototype, "context", void 0);
__decorate([
    bindable,
    __metadata("design:type", Boolean)
], PixiApp.prototype, "autoResize", void 0);
__decorate([
    bindable,
    __metadata("design:type", String)
], PixiApp.prototype, "powerPreference", void 0);
__decorate([
    bindable,
    __metadata("design:type", Function)
], PixiApp.prototype, "tick", void 0);
PixiApp = __decorate([
    customElement({ name: 'pixi-app', template: '<template><au-slot name="children"></au-slot></template>' }),
    __metadata("design:paramtypes", [Object])
], PixiApp);
export { PixiApp };
//# sourceMappingURL=pixi-app.js.map