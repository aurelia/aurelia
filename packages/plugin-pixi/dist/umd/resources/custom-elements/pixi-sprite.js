var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "@aurelia/runtime", "pixi.js"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.PixiSprite = void 0;
    const runtime_1 = require("@aurelia/runtime");
    const pixi_js_1 = require("pixi.js");
    const directProps = [
        'alpha',
        'buttomMode',
        'cacheAsBitmap',
        'cursor',
        'filterArea',
        'filters',
        'hitArea',
        'interactive',
        'mask',
        'name',
        'renderable',
        'rotation',
        'transform',
        'visible',
        'x',
        'y',
        'zIndex',
        'height',
        'interactiveChildren',
        'sortableChildren',
        'sortDirty',
        'anchor',
        'blendMode',
        'pluginName',
        'roundPixels',
        'shader',
        'texture',
        'tint'
    ];
    const pointProps = [
        'pivot',
        'position',
        'scale',
        'skew'
    ];
    let PixiSprite = /** @class */ (() => {
        let PixiSprite = class PixiSprite {
            constructor() {
                this._sprite = null;
            }
            get sprite() {
                return this._sprite;
            }
            get localTransform() {
                return this.sprite.localTransform;
            }
            get parent() {
                return this.sprite.parent;
            }
            get worldAlpha() {
                return this.sprite.worldAlpha;
            }
            get worldTransform() {
                return this.sprite.worldTransform;
            }
            get worldVisible() {
                return this.sprite.worldVisible;
            }
            // Container properties
            // http://pixijs.download/dev/docs/PIXI.Container.html
            get children() {
                return this.sprite.children;
            }
            get isSprite() {
                return this.sprite['isSprite'];
            }
            afterAttach() {
                if (this.container) {
                    const $this = this;
                    this._sprite = new pixi_js_1.Sprite(pixi_js_1.loader.resources[this.src].texture);
                    for (const prop of directProps) {
                        if ($this[prop] !== undefined) {
                            this._sprite[prop] = $this[prop];
                        }
                    }
                    for (const prop of pointProps) {
                        if ($this[`${prop}X`] !== undefined) {
                            this._sprite[prop].x = $this[`${prop}X`];
                        }
                        if ($this[`${prop}Y`] !== undefined) {
                            this._sprite[prop].y = $this[`${prop}Y`];
                        }
                    }
                    this.width = this._sprite.width;
                    this.container.addChild(this._sprite);
                }
            }
            beforeUnbind() {
                if (this.container && this._sprite) {
                    this.container.removeChild(this._sprite);
                    this._sprite.destroy();
                    this._sprite = null;
                }
            }
        };
        __decorate([
            runtime_1.bindable,
            __metadata("design:type", pixi_js_1.Container)
        ], PixiSprite.prototype, "container", void 0);
        __decorate([
            runtime_1.bindable,
            __metadata("design:type", String)
        ], PixiSprite.prototype, "src", void 0);
        __decorate([
            runtime_1.bindable,
            __metadata("design:type", Number)
        ], PixiSprite.prototype, "alpha", void 0);
        __decorate([
            runtime_1.bindable,
            __metadata("design:type", Boolean)
        ], PixiSprite.prototype, "buttomMode", void 0);
        __decorate([
            runtime_1.bindable,
            __metadata("design:type", Boolean)
        ], PixiSprite.prototype, "cacheAsBitmap", void 0);
        __decorate([
            runtime_1.bindable,
            __metadata("design:type", String)
        ], PixiSprite.prototype, "cursor", void 0);
        __decorate([
            runtime_1.bindable,
            __metadata("design:type", pixi_js_1.Rectangle)
        ], PixiSprite.prototype, "filterArea", void 0);
        __decorate([
            runtime_1.bindable,
            __metadata("design:type", Array)
        ], PixiSprite.prototype, "filters", void 0);
        __decorate([
            runtime_1.bindable,
            __metadata("design:type", Object)
        ], PixiSprite.prototype, "hitArea", void 0);
        __decorate([
            runtime_1.bindable,
            __metadata("design:type", Boolean)
        ], PixiSprite.prototype, "interactive", void 0);
        __decorate([
            runtime_1.bindable,
            __metadata("design:type", pixi_js_1.Graphics)
        ], PixiSprite.prototype, "mask", void 0);
        __decorate([
            runtime_1.bindable,
            __metadata("design:type", String)
        ], PixiSprite.prototype, "name", void 0);
        __decorate([
            runtime_1.bindable,
            __metadata("design:type", Number)
        ], PixiSprite.prototype, "pivotX", void 0);
        __decorate([
            runtime_1.bindable,
            __metadata("design:type", Number)
        ], PixiSprite.prototype, "pivotY", void 0);
        __decorate([
            runtime_1.bindable,
            __metadata("design:type", Number)
        ], PixiSprite.prototype, "positionX", void 0);
        __decorate([
            runtime_1.bindable,
            __metadata("design:type", Number)
        ], PixiSprite.prototype, "positionY", void 0);
        __decorate([
            runtime_1.bindable,
            __metadata("design:type", Boolean)
        ], PixiSprite.prototype, "renderable", void 0);
        __decorate([
            runtime_1.bindable,
            __metadata("design:type", Number)
        ], PixiSprite.prototype, "rotation", void 0);
        __decorate([
            runtime_1.bindable,
            __metadata("design:type", Number)
        ], PixiSprite.prototype, "scaleX", void 0);
        __decorate([
            runtime_1.bindable,
            __metadata("design:type", Number)
        ], PixiSprite.prototype, "scaleY", void 0);
        __decorate([
            runtime_1.bindable,
            __metadata("design:type", Number)
        ], PixiSprite.prototype, "skewX", void 0);
        __decorate([
            runtime_1.bindable,
            __metadata("design:type", Number)
        ], PixiSprite.prototype, "skewY", void 0);
        __decorate([
            runtime_1.bindable,
            __metadata("design:type", pixi_js_1.TransformBase)
        ], PixiSprite.prototype, "transform", void 0);
        __decorate([
            runtime_1.bindable,
            __metadata("design:type", Boolean)
        ], PixiSprite.prototype, "visible", void 0);
        __decorate([
            runtime_1.bindable,
            __metadata("design:type", Number)
        ], PixiSprite.prototype, "x", void 0);
        __decorate([
            runtime_1.bindable,
            __metadata("design:type", Number)
        ], PixiSprite.prototype, "y", void 0);
        __decorate([
            runtime_1.bindable,
            __metadata("design:type", Number)
        ], PixiSprite.prototype, "zIndex", void 0);
        __decorate([
            runtime_1.bindable,
            __metadata("design:type", Number)
        ], PixiSprite.prototype, "height", void 0);
        __decorate([
            runtime_1.bindable,
            __metadata("design:type", Boolean)
        ], PixiSprite.prototype, "interactiveChildren", void 0);
        __decorate([
            runtime_1.bindable,
            __metadata("design:type", Boolean)
        ], PixiSprite.prototype, "sortableChildren", void 0);
        __decorate([
            runtime_1.bindable,
            __metadata("design:type", Boolean)
        ], PixiSprite.prototype, "sortDirty", void 0);
        __decorate([
            runtime_1.bindable,
            __metadata("design:type", Number)
        ], PixiSprite.prototype, "width", void 0);
        __decorate([
            runtime_1.bindable,
            __metadata("design:type", pixi_js_1.ObservablePoint)
        ], PixiSprite.prototype, "anchor", void 0);
        __decorate([
            runtime_1.bindable,
            __metadata("design:type", Number)
        ], PixiSprite.prototype, "blendMode", void 0);
        __decorate([
            runtime_1.bindable,
            __metadata("design:type", String)
        ], PixiSprite.prototype, "pluginName", void 0);
        __decorate([
            runtime_1.bindable,
            __metadata("design:type", Boolean)
        ], PixiSprite.prototype, "roundPixels", void 0);
        __decorate([
            runtime_1.bindable,
            __metadata("design:type", Object)
        ], PixiSprite.prototype, "shader", void 0);
        __decorate([
            runtime_1.bindable,
            __metadata("design:type", pixi_js_1.Texture)
        ], PixiSprite.prototype, "texture", void 0);
        __decorate([
            runtime_1.bindable,
            __metadata("design:type", Number)
        ], PixiSprite.prototype, "tint", void 0);
        PixiSprite = __decorate([
            runtime_1.customElement({ name: 'pixi-sprite', template: '<template></template>' }),
            __metadata("design:paramtypes", [])
        ], PixiSprite);
        return PixiSprite;
    })();
    exports.PixiSprite = PixiSprite;
    for (const prop of directProps) {
        PixiSprite.prototype[`${prop}Changed`] = function (newValue) {
            if (this.$controller.isActive && this.sprite != null) {
                this.sprite[prop] = newValue;
            }
        };
    }
    for (const prop of pointProps) {
        PixiSprite.prototype[`${prop}XChanged`] = function (newValue) {
            if (this.$controller.isActive && this.sprite != null) {
                this.sprite[prop].x = newValue;
            }
        };
        PixiSprite.prototype[`${prop}YChanged`] = function (newValue) {
            if (this.$controller.isActive && this.sprite != null) {
                this.sprite[prop].y = newValue;
            }
        };
    }
});
//# sourceMappingURL=pixi-sprite.js.map