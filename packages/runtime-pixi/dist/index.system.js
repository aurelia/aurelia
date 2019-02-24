System.register('runtimePixi', ['@aurelia/kernel', '@aurelia/runtime-html-browser', '@aurelia/runtime', 'pixi.js'], function (exports, module) {
    'use strict';
    var DI, BasicConfiguration$1, bindable, customElement, Application, Sprite, loader;
    return {
        setters: [function (module) {
            DI = module.DI;
        }, function (module) {
            BasicConfiguration$1 = module.BasicConfiguration;
        }, function (module) {
            bindable = module.bindable;
            customElement = module.customElement;
        }, function (module) {
            Application = module.Application;
            Sprite = module.Sprite;
            loader = module.loader;
        }],
        execute: function () {

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

            let PixiApp = exports('PixiApp', class PixiApp {
                constructor(element) {
                    this.element = element;
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
                        this._app = new Application(Object.assign({}, this.options, boundOptions));
                    }
                    else {
                        this._app = new Application(boundOptions);
                    }
                    this.stage = this._app.stage;
                }
                attached() {
                    this.element.appendChild(this.app.view);
                    this._app.ticker.add(this.callTick);
                }
                detached() {
                    this.element.removeChild(this.app.view);
                    this._app.ticker.remove(this.callTick);
                }
                unbound() {
                    this.app.destroy();
                    this._app = null;
                    this.stage = null;
                }
            });
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
            PixiApp = exports('PixiApp', __decorate([
                customElement({ name: 'pixi-app', template: '<template><div replaceable part="children"></div></template>' })
            ], PixiApp));

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
            let PixiSprite = exports('PixiSprite', class PixiSprite {
                constructor() {
                    this._sprite = null;
                }
                get sprite() {
                    return this._sprite;
                }
                get localTransform() {
                    return this._sprite.localTransform;
                }
                get parent() {
                    return this._sprite.parent;
                }
                get worldAlpha() {
                    return this._sprite.worldAlpha;
                }
                get worldTransform() {
                    return this._sprite.worldTransform;
                }
                get worldVisible() {
                    return this._sprite.worldVisible;
                }
                // Container properties
                // http://pixijs.download/dev/docs/PIXI.Container.html
                get children() {
                    return this._sprite.children;
                }
                get isSprite() {
                    return this._sprite['isSprite'];
                }
                attached() {
                    if (this.container) {
                        this._sprite = new Sprite(loader.resources[this.src].texture);
                        for (const prop of directProps) {
                            if (this[prop] !== undefined) {
                                this._sprite[prop] = this[prop];
                            }
                        }
                        for (const prop of pointProps) {
                            if (this[`${prop}X`] !== undefined) {
                                this._sprite[prop].x = this[`${prop}X`];
                            }
                            if (this[`${prop}Y`] !== undefined) {
                                this._sprite[prop].y = this[`${prop}Y`];
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
            });
            __decorate([
                bindable
            ], PixiSprite.prototype, "container", void 0);
            __decorate([
                bindable
            ], PixiSprite.prototype, "src", void 0);
            __decorate([
                bindable
            ], PixiSprite.prototype, "alpha", void 0);
            __decorate([
                bindable
            ], PixiSprite.prototype, "buttomMode", void 0);
            __decorate([
                bindable
            ], PixiSprite.prototype, "cacheAsBitmap", void 0);
            __decorate([
                bindable
            ], PixiSprite.prototype, "cursor", void 0);
            __decorate([
                bindable
            ], PixiSprite.prototype, "filterArea", void 0);
            __decorate([
                bindable
            ], PixiSprite.prototype, "filters", void 0);
            __decorate([
                bindable
            ], PixiSprite.prototype, "hitArea", void 0);
            __decorate([
                bindable
            ], PixiSprite.prototype, "interactive", void 0);
            __decorate([
                bindable
            ], PixiSprite.prototype, "mask", void 0);
            __decorate([
                bindable
            ], PixiSprite.prototype, "name", void 0);
            __decorate([
                bindable
            ], PixiSprite.prototype, "pivotX", void 0);
            __decorate([
                bindable
            ], PixiSprite.prototype, "pivotY", void 0);
            __decorate([
                bindable
            ], PixiSprite.prototype, "positionX", void 0);
            __decorate([
                bindable
            ], PixiSprite.prototype, "positionY", void 0);
            __decorate([
                bindable
            ], PixiSprite.prototype, "renderable", void 0);
            __decorate([
                bindable
            ], PixiSprite.prototype, "rotation", void 0);
            __decorate([
                bindable
            ], PixiSprite.prototype, "scaleX", void 0);
            __decorate([
                bindable
            ], PixiSprite.prototype, "scaleY", void 0);
            __decorate([
                bindable
            ], PixiSprite.prototype, "skewX", void 0);
            __decorate([
                bindable
            ], PixiSprite.prototype, "skewY", void 0);
            __decorate([
                bindable
            ], PixiSprite.prototype, "transform", void 0);
            __decorate([
                bindable
            ], PixiSprite.prototype, "visible", void 0);
            __decorate([
                bindable
            ], PixiSprite.prototype, "x", void 0);
            __decorate([
                bindable
            ], PixiSprite.prototype, "y", void 0);
            __decorate([
                bindable
            ], PixiSprite.prototype, "zIndex", void 0);
            __decorate([
                bindable
            ], PixiSprite.prototype, "height", void 0);
            __decorate([
                bindable
            ], PixiSprite.prototype, "interactiveChildren", void 0);
            __decorate([
                bindable
            ], PixiSprite.prototype, "sortableChildren", void 0);
            __decorate([
                bindable
            ], PixiSprite.prototype, "sortDirty", void 0);
            __decorate([
                bindable
            ], PixiSprite.prototype, "width", void 0);
            __decorate([
                bindable
            ], PixiSprite.prototype, "anchor", void 0);
            __decorate([
                bindable
            ], PixiSprite.prototype, "blendMode", void 0);
            __decorate([
                bindable
            ], PixiSprite.prototype, "pluginName", void 0);
            __decorate([
                bindable
            ], PixiSprite.prototype, "roundPixels", void 0);
            __decorate([
                bindable
            ], PixiSprite.prototype, "shader", void 0);
            __decorate([
                bindable
            ], PixiSprite.prototype, "texture", void 0);
            __decorate([
                bindable
            ], PixiSprite.prototype, "tint", void 0);
            PixiSprite = exports('PixiSprite', __decorate([
                customElement({ name: 'pixi-sprite', template: '<template></template>' })
            ], PixiSprite));
            for (const prop of directProps) {
                PixiSprite.prototype[`${prop}Changed`] = function (newValue) {
                    if (this.$state & 2 /* isBound */ && this.sprite !== null && newValue) {
                        this.sprite[prop] = newValue;
                    }
                };
            }
            for (const prop of pointProps) {
                PixiSprite.prototype[`${prop}XChanged`] = function (newValue) {
                    if (this.$state & 2 /* isBound */ && this.sprite !== null && newValue) {
                        this.sprite[prop].x = newValue;
                    }
                };
                PixiSprite.prototype[`${prop}YChanged`] = function (newValue) {
                    if (this.$state & 2 /* isBound */ && this.sprite !== null && newValue) {
                        this.sprite[prop].y = newValue;
                    }
                };
            }

            const PixiAppRegistration = exports('PixiAppRegistration', PixiApp);
            const PixiSpriteRegistration = exports('PixiSpriteRegistration', PixiSprite);
            /**
             * Default pixi-specific resources:
             * - Custom Elements: `pixi-app`, `pixi-sprite`
             */
            const DefaultResources = exports('DefaultResources', [
                PixiApp,
                PixiSprite
            ]);
            /**
             * A DI configuration object containing html-, pixi- and browser-specific registrations:
             * - `BasicConfiguration` from `@aurelia/runtime-html-browser`
             * - `DefaultResources`
             */
            const BasicConfiguration = exports('BasicConfiguration', {
                /**
                 * Apply this configuration to the provided container.
                 */
                register(container) {
                    return BasicConfiguration$1
                        .register(container)
                        .register(...DefaultResources);
                },
                /**
                 * Create a new container with this configuration applied to it.
                 */
                createContainer() {
                    return this.register(DI.createContainer());
                }
            });

        }
    };
});
//# sourceMappingURL=index.system.js.map
