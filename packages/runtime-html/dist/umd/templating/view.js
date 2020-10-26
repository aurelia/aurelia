(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "@aurelia/kernel", "@aurelia/runtime", "../resources/custom-element", "./controller"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ViewLocator = exports.IViewLocator = exports.view = exports.Views = exports.ViewFactory = exports.IViewFactory = void 0;
    const kernel_1 = require("@aurelia/kernel");
    const runtime_1 = require("@aurelia/runtime");
    const custom_element_1 = require("../resources/custom-element");
    const controller_1 = require("./controller");
    exports.IViewFactory = kernel_1.DI.createInterface('IViewFactory').noDefault();
    class ViewFactory {
        constructor(name, context, contentType, projectionScope = null) {
            this.name = name;
            this.context = context;
            this.contentType = contentType;
            this.projectionScope = projectionScope;
            this.isCaching = false;
            this.cache = null;
            this.cacheSize = -1;
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
                this.cache.push(controller);
                return true;
            }
            return false;
        }
        create(flags, parentController) {
            const cache = this.cache;
            let controller;
            if (cache != null && cache.length > 0) {
                controller = cache.pop();
                return controller;
            }
            controller = controller_1.Controller.forSyntheticView(null, this.context, this, flags, parentController);
            return controller;
        }
    }
    exports.ViewFactory = ViewFactory;
    ViewFactory.maxCacheSize = 0xFFFF;
    const seenViews = new WeakSet();
    function notYetSeen($view) {
        return !seenViews.has($view);
    }
    function toCustomElementDefinition($view) {
        seenViews.add($view);
        return custom_element_1.CustomElementDefinition.create($view);
    }
    exports.Views = {
        name: kernel_1.Protocol.resource.keyFor('views'),
        has(value) {
            return typeof value === 'function' && (kernel_1.Metadata.hasOwn(exports.Views.name, value) || '$views' in value);
        },
        get(value) {
            if (typeof value === 'function' && '$views' in value) {
                // TODO: a `get` operation with side effects is not a good thing. Should refactor this to a proper resource kind.
                const $views = value.$views;
                const definitions = $views.filter(notYetSeen).map(toCustomElementDefinition);
                for (const def of definitions) {
                    exports.Views.add(value, def);
                }
            }
            let views = kernel_1.Metadata.getOwn(exports.Views.name, value);
            if (views === void 0) {
                kernel_1.Metadata.define(exports.Views.name, views = [], value);
            }
            return views;
        },
        add(Type, partialDefinition) {
            const definition = custom_element_1.CustomElementDefinition.create(partialDefinition);
            let views = kernel_1.Metadata.getOwn(exports.Views.name, Type);
            if (views === void 0) {
                kernel_1.Metadata.define(exports.Views.name, views = [definition], Type);
            }
            else {
                views.push(definition);
            }
            return views;
        },
    };
    function view(v) {
        return function (target) {
            exports.Views.add(target, v);
        };
    }
    exports.view = view;
    exports.IViewLocator = kernel_1.DI.createInterface('IViewLocator').withDefault(x => x.singleton(ViewLocator));
    class ViewLocator {
        constructor() {
            this.modelInstanceToBoundComponent = new WeakMap();
            this.modelTypeToUnboundComponent = new Map();
        }
        getViewComponentForObject(object, viewNameOrSelector) {
            if (object) {
                const availableViews = exports.Views.has(object.constructor) ? exports.Views.get(object.constructor) : [];
                const resolvedViewName = typeof viewNameOrSelector === 'function'
                    ? viewNameOrSelector(object, availableViews)
                    : this.getViewName(availableViews, viewNameOrSelector);
                return this.getOrCreateBoundComponent(object, availableViews, resolvedViewName);
            }
            return null;
        }
        getOrCreateBoundComponent(object, availableViews, resolvedViewName) {
            let lookup = this.modelInstanceToBoundComponent.get(object);
            let BoundComponent;
            if (lookup === void 0) {
                lookup = {};
                this.modelInstanceToBoundComponent.set(object, lookup);
            }
            else {
                BoundComponent = lookup[resolvedViewName];
            }
            if (BoundComponent === void 0) {
                const UnboundComponent = this.getOrCreateUnboundComponent(object, availableViews, resolvedViewName);
                BoundComponent = custom_element_1.CustomElement.define(custom_element_1.CustomElement.getDefinition(UnboundComponent), class extends UnboundComponent {
                    constructor() {
                        super(object);
                    }
                });
                lookup[resolvedViewName] = BoundComponent;
            }
            return BoundComponent;
        }
        getOrCreateUnboundComponent(object, availableViews, resolvedViewName) {
            let lookup = this.modelTypeToUnboundComponent.get(object.constructor);
            let UnboundComponent;
            if (lookup === void 0) {
                lookup = {};
                this.modelTypeToUnboundComponent.set(object.constructor, lookup);
            }
            else {
                UnboundComponent = lookup[resolvedViewName];
            }
            if (UnboundComponent === void 0) {
                UnboundComponent = custom_element_1.CustomElement.define(this.getView(availableViews, resolvedViewName), class {
                    constructor(viewModel) {
                        this.viewModel = viewModel;
                    }
                    define(controller, parentContainer, definition) {
                        const vm = this.viewModel;
                        controller.scope = runtime_1.Scope.fromParent(controller.flags, controller.scope, vm);
                        if (vm.define !== void 0) {
                            return vm.define(controller, parentContainer, definition);
                        }
                    }
                });
                const proto = UnboundComponent.prototype;
                if ('beforeCompose' in object) {
                    proto.beforeCompose = function beforeCompose(controller) {
                        this.viewModel.beforeCompose(controller);
                    };
                }
                if ('beforeComposeChildren' in object) {
                    proto.beforeComposeChildren = function beforeComposeChildren(controller) {
                        this.viewModel.beforeComposeChildren(controller);
                    };
                }
                if ('afterCompose' in object) {
                    proto.afterCompose = function afterCompose(controller) {
                        this.viewModel.afterCompose(controller);
                    };
                }
                if ('beforeBind' in object) {
                    proto.beforeBind = function beforeBind(initiator, parent, flags) {
                        return this.viewModel.beforeBind(initiator, parent, flags);
                    };
                }
                if ('afterBind' in object) {
                    proto.afterBind = function afterBind(initiator, parent, flags) {
                        return this.viewModel.afterBind(initiator, parent, flags);
                    };
                }
                if ('afterAttach' in object) {
                    proto.afterAttach = function afterAttach(initiator, parent, flags) {
                        return this.viewModel.afterAttach(initiator, parent, flags);
                    };
                }
                if ('afterAttachChildren' in object) {
                    proto.afterAttachChildren = function afterAttachChildren(initiator, flags) {
                        return this.viewModel.afterAttachChildren(initiator, flags);
                    };
                }
                if ('beforeDetach' in object) {
                    proto.beforeDetach = function beforeDetach(initiator, parent, flags) {
                        return this.viewModel.beforeDetach(initiator, parent, flags);
                    };
                }
                if ('beforeUnbind' in object) {
                    proto.beforeUnbind = function beforeUnbind(initiator, parent, flags) {
                        return this.viewModel.beforeUnbind(initiator, parent, flags);
                    };
                }
                if ('afterUnbind' in object) {
                    proto.afterUnbind = function afterUnbind(initiator, parent, flags) {
                        return this.viewModel.afterUnbind(initiator, parent, flags);
                    };
                }
                if ('afterUnbindChildren' in object) {
                    proto.afterUnbindChildren = function afterUnbindChildren(initiator, flags) {
                        return this.viewModel.afterUnbindChildren(initiator, flags);
                    };
                }
                if ('dispose' in object) {
                    proto.dispose = function dispose() {
                        this.viewModel.dispose();
                    };
                }
                lookup[resolvedViewName] = UnboundComponent;
            }
            return UnboundComponent;
        }
        getViewName(views, requestedName) {
            if (requestedName) {
                return requestedName;
            }
            if (views.length === 1) {
                return views[0].name;
            }
            return 'default-view';
        }
        getView(views, name) {
            const v = views.find(x => x.name === name);
            if (v === void 0) {
                throw new Error(`Could not find view: ${name}`);
            }
            return v;
        }
    }
    exports.ViewLocator = ViewLocator;
});
//# sourceMappingURL=view.js.map