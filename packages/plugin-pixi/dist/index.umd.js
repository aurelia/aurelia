(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('@aurelia/kernel'), require('@aurelia/runtime'), require('pixi.js')) :
    typeof define === 'function' && define.amd ? define(['exports', '@aurelia/kernel', '@aurelia/runtime', 'pixi.js'], factory) :
    (global = global || self, factory(global.pluginPixi = {}, global.kernel, global.runtime, global.pixi_js));
}(this, function (exports, kernel, runtime, pixi_js) { 'use strict';

    /*! *****************************************************************************
    Copyright (c) Microsoft Corporation. All rights reserved.
    Licensed under the Apache License, Version 2.0 (the "License"); you may not use
    this file except in compliance with the License. You may obtain a copy of the
    License at http://www.apache.org/licenses/LICENSE-2.0

    THIS CODE IS PROVIDED ON AN *AS IS* BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
    KIND, EITHER EXPRESS OR IMPLIED, INCLUDING WITHOUT LIMITATION ANY IMPLIED
    WARRANTIES OR CONDITIONS OF TITLE, FITNESS FOR A PARTICULAR PURPOSE,
    MERCHANTABLITY OR NON-INFRINGEMENT.

    See the Apache Version 2.0 License for specific language governing permissions
    and limitations under the License.
    ***************************************************************************** */

    function __decorate(decorators, target, key, desc) {
        var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
        if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
        else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
        return c > 3 && r && Object.defineProperty(target, key, r), r;
    }

    exports.PixiApp = class PixiApp {
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
                this._app = new pixi_js.Application({ ...this.options, ...boundOptions });
            }
            else {
                this._app = new pixi_js.Application(boundOptions);
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
    exports.PixiApp.inject = [Element];
    __decorate([
        runtime.bindable
    ], exports.PixiApp.prototype, "options", void 0);
    __decorate([
        runtime.bindable
    ], exports.PixiApp.prototype, "width", void 0);
    __decorate([
        runtime.bindable
    ], exports.PixiApp.prototype, "height", void 0);
    __decorate([
        runtime.bindable
    ], exports.PixiApp.prototype, "view", void 0);
    __decorate([
        runtime.bindable
    ], exports.PixiApp.prototype, "transparent", void 0);
    __decorate([
        runtime.bindable
    ], exports.PixiApp.prototype, "antialias", void 0);
    __decorate([
        runtime.bindable
    ], exports.PixiApp.prototype, "preserveDrawingBuffer", void 0);
    __decorate([
        runtime.bindable
    ], exports.PixiApp.prototype, "resolution", void 0);
    __decorate([
        runtime.bindable
    ], exports.PixiApp.prototype, "forceCanvas", void 0);
    __decorate([
        runtime.bindable
    ], exports.PixiApp.prototype, "backgroundColor", void 0);
    __decorate([
        runtime.bindable
    ], exports.PixiApp.prototype, "clearBeforeRender", void 0);
    __decorate([
        runtime.bindable
    ], exports.PixiApp.prototype, "roundPixels", void 0);
    __decorate([
        runtime.bindable
    ], exports.PixiApp.prototype, "forceFXAA", void 0);
    __decorate([
        runtime.bindable
    ], exports.PixiApp.prototype, "legacy", void 0);
    __decorate([
        runtime.bindable
    ], exports.PixiApp.prototype, "context", void 0);
    __decorate([
        runtime.bindable
    ], exports.PixiApp.prototype, "autoResize", void 0);
    __decorate([
        runtime.bindable
    ], exports.PixiApp.prototype, "powerPreference", void 0);
    __decorate([
        runtime.bindable
    ], exports.PixiApp.prototype, "tick", void 0);
    exports.PixiApp = __decorate([
        runtime.customElement({ name: 'pixi-app', template: '<template><div replaceable part="children"></div></template>' })
    ], exports.PixiApp);

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
    exports.PixiSprite = class PixiSprite {
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
        attached() {
            if (this.container) {
                const $this = this;
                this._sprite = new pixi_js.Sprite(pixi_js.loader.resources[this.src].texture);
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
        detached() {
            if (this.container && this._sprite) {
                this.container.removeChild(this._sprite);
                this._sprite.destroy();
                this._sprite = null;
            }
        }
    };
    __decorate([
        runtime.bindable
    ], exports.PixiSprite.prototype, "container", void 0);
    __decorate([
        runtime.bindable
    ], exports.PixiSprite.prototype, "src", void 0);
    __decorate([
        runtime.bindable
    ], exports.PixiSprite.prototype, "alpha", void 0);
    __decorate([
        runtime.bindable
    ], exports.PixiSprite.prototype, "buttomMode", void 0);
    __decorate([
        runtime.bindable
    ], exports.PixiSprite.prototype, "cacheAsBitmap", void 0);
    __decorate([
        runtime.bindable
    ], exports.PixiSprite.prototype, "cursor", void 0);
    __decorate([
        runtime.bindable
    ], exports.PixiSprite.prototype, "filterArea", void 0);
    __decorate([
        runtime.bindable
    ], exports.PixiSprite.prototype, "filters", void 0);
    __decorate([
        runtime.bindable
    ], exports.PixiSprite.prototype, "hitArea", void 0);
    __decorate([
        runtime.bindable
    ], exports.PixiSprite.prototype, "interactive", void 0);
    __decorate([
        runtime.bindable
    ], exports.PixiSprite.prototype, "mask", void 0);
    __decorate([
        runtime.bindable
    ], exports.PixiSprite.prototype, "name", void 0);
    __decorate([
        runtime.bindable
    ], exports.PixiSprite.prototype, "pivotX", void 0);
    __decorate([
        runtime.bindable
    ], exports.PixiSprite.prototype, "pivotY", void 0);
    __decorate([
        runtime.bindable
    ], exports.PixiSprite.prototype, "positionX", void 0);
    __decorate([
        runtime.bindable
    ], exports.PixiSprite.prototype, "positionY", void 0);
    __decorate([
        runtime.bindable
    ], exports.PixiSprite.prototype, "renderable", void 0);
    __decorate([
        runtime.bindable
    ], exports.PixiSprite.prototype, "rotation", void 0);
    __decorate([
        runtime.bindable
    ], exports.PixiSprite.prototype, "scaleX", void 0);
    __decorate([
        runtime.bindable
    ], exports.PixiSprite.prototype, "scaleY", void 0);
    __decorate([
        runtime.bindable
    ], exports.PixiSprite.prototype, "skewX", void 0);
    __decorate([
        runtime.bindable
    ], exports.PixiSprite.prototype, "skewY", void 0);
    __decorate([
        runtime.bindable
    ], exports.PixiSprite.prototype, "transform", void 0);
    __decorate([
        runtime.bindable
    ], exports.PixiSprite.prototype, "visible", void 0);
    __decorate([
        runtime.bindable
    ], exports.PixiSprite.prototype, "x", void 0);
    __decorate([
        runtime.bindable
    ], exports.PixiSprite.prototype, "y", void 0);
    __decorate([
        runtime.bindable
    ], exports.PixiSprite.prototype, "zIndex", void 0);
    __decorate([
        runtime.bindable
    ], exports.PixiSprite.prototype, "height", void 0);
    __decorate([
        runtime.bindable
    ], exports.PixiSprite.prototype, "interactiveChildren", void 0);
    __decorate([
        runtime.bindable
    ], exports.PixiSprite.prototype, "sortableChildren", void 0);
    __decorate([
        runtime.bindable
    ], exports.PixiSprite.prototype, "sortDirty", void 0);
    __decorate([
        runtime.bindable
    ], exports.PixiSprite.prototype, "width", void 0);
    __decorate([
        runtime.bindable
    ], exports.PixiSprite.prototype, "anchor", void 0);
    __decorate([
        runtime.bindable
    ], exports.PixiSprite.prototype, "blendMode", void 0);
    __decorate([
        runtime.bindable
    ], exports.PixiSprite.prototype, "pluginName", void 0);
    __decorate([
        runtime.bindable
    ], exports.PixiSprite.prototype, "roundPixels", void 0);
    __decorate([
        runtime.bindable
    ], exports.PixiSprite.prototype, "shader", void 0);
    __decorate([
        runtime.bindable
    ], exports.PixiSprite.prototype, "texture", void 0);
    __decorate([
        runtime.bindable
    ], exports.PixiSprite.prototype, "tint", void 0);
    exports.PixiSprite = __decorate([
        runtime.customElement({ name: 'pixi-sprite', template: '<template></template>' })
    ], exports.PixiSprite);
    for (const prop of directProps) {
        exports.PixiSprite.prototype[`${prop}Changed`] = function (newValue) {
            if ((this.$controller.state & 4 /* isBound */) > 0 && this.sprite != null) {
                this.sprite[prop] = newValue;
            }
        };
    }
    for (const prop of pointProps) {
        exports.PixiSprite.prototype[`${prop}XChanged`] = function (newValue) {
            if ((this.$controller.state & 4 /* isBound */) > 0 && this.sprite != null) {
                this.sprite[prop].x = newValue;
            }
        };
        exports.PixiSprite.prototype[`${prop}YChanged`] = function (newValue) {
            if ((this.$controller.state & 4 /* isBound */) > 0 && this.sprite != null) {
                this.sprite[prop].y = newValue;
            }
        };
    }

    const PixiAppRegistration = exports.PixiApp;
    const PixiSpriteRegistration = exports.PixiSprite;
    /**
     * Default pixi-specific resources:
     * - Custom Elements: `pixi-app`, `pixi-sprite`
     */
    const DefaultResources = [
        exports.PixiApp,
        exports.PixiSprite,
    ];
    /**
     * A DI configuration object containing pixi resource registrations.
     */
    const PixiConfiguration = {
        /**
         * Apply this configuration to the provided container.
         */
        register(container) {
            return container.register(...DefaultResources);
        },
        /**
         * Create a new container with this configuration applied to it.
         */
        createContainer() {
            return this.register(kernel.DI.createContainer());
        }
    };

    exports.DefaultResources = DefaultResources;
    exports.PixiAppRegistration = PixiAppRegistration;
    exports.PixiConfiguration = PixiConfiguration;
    exports.PixiSpriteRegistration = PixiSpriteRegistration;

    Object.defineProperty(exports, '__esModule', { value: true });

}));
//# sourceMappingURL=index.umd.js.map
