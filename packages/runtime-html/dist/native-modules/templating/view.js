import { DI, Metadata, Protocol } from '../../../../kernel/dist/native-modules/index.js';
import { Scope } from '../../../../runtime/dist/native-modules/index.js';
import { CustomElement, CustomElementDefinition } from '../resources/custom-element.js';
import { Controller } from './controller.js';
export const IViewFactory = DI.createInterface('IViewFactory');
export class ViewFactory {
    constructor(name, context) {
        this.name = name;
        this.context = context;
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
        controller = Controller.forSyntheticView(null, this.context, this, flags, parentController);
        return controller;
    }
}
ViewFactory.maxCacheSize = 0xFFFF;
const seenViews = new WeakSet();
function notYetSeen($view) {
    return !seenViews.has($view);
}
function toCustomElementDefinition($view) {
    seenViews.add($view);
    return CustomElementDefinition.create($view);
}
export const Views = {
    name: Protocol.resource.keyFor('views'),
    has(value) {
        return typeof value === 'function' && (Metadata.hasOwn(Views.name, value) || '$views' in value);
    },
    get(value) {
        if (typeof value === 'function' && '$views' in value) {
            // TODO: a `get` operation with side effects is not a good thing. Should refactor this to a proper resource kind.
            const $views = value.$views;
            const definitions = $views.filter(notYetSeen).map(toCustomElementDefinition);
            for (const def of definitions) {
                Views.add(value, def);
            }
        }
        let views = Metadata.getOwn(Views.name, value);
        if (views === void 0) {
            Metadata.define(Views.name, views = [], value);
        }
        return views;
    },
    add(Type, partialDefinition) {
        const definition = CustomElementDefinition.create(partialDefinition);
        let views = Metadata.getOwn(Views.name, Type);
        if (views === void 0) {
            Metadata.define(Views.name, views = [definition], Type);
        }
        else {
            views.push(definition);
        }
        return views;
    },
};
export function view(v) {
    return function (target) {
        Views.add(target, v);
    };
}
export const IViewLocator = DI.createInterface('IViewLocator', x => x.singleton(ViewLocator));
export class ViewLocator {
    constructor() {
        this.modelInstanceToBoundComponent = new WeakMap();
        this.modelTypeToUnboundComponent = new Map();
    }
    getViewComponentForObject(object, viewNameOrSelector) {
        if (object) {
            const availableViews = Views.has(object.constructor) ? Views.get(object.constructor) : [];
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
            BoundComponent = CustomElement.define(CustomElement.getDefinition(UnboundComponent), class extends UnboundComponent {
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
            UnboundComponent = CustomElement.define(this.getView(availableViews, resolvedViewName), class {
                constructor(viewModel) {
                    this.viewModel = viewModel;
                }
                define(controller, parentContainer, definition) {
                    const vm = this.viewModel;
                    controller.scope = Scope.fromParent(controller.scope, vm);
                    if (vm.define !== void 0) {
                        return vm.define(controller, parentContainer, definition);
                    }
                }
            });
            const proto = UnboundComponent.prototype;
            if ('hydrating' in object) {
                proto.hydrating = function hydrating(controller) {
                    this.viewModel.hydrating(controller);
                };
            }
            if ('hydrated' in object) {
                proto.hydrated = function hydrated(controller) {
                    this.viewModel.hydrated(controller);
                };
            }
            if ('created' in object) {
                proto.created = function created(controller) {
                    this.viewModel.created(controller);
                };
            }
            if ('binding' in object) {
                proto.binding = function binding(initiator, parent, flags) {
                    return this.viewModel.binding(initiator, parent, flags);
                };
            }
            if ('bound' in object) {
                proto.bound = function bound(initiator, parent, flags) {
                    return this.viewModel.bound(initiator, parent, flags);
                };
            }
            if ('attaching' in object) {
                proto.attaching = function attaching(initiator, parent, flags) {
                    return this.viewModel.attaching(initiator, parent, flags);
                };
            }
            if ('attached' in object) {
                proto.attached = function attached(initiator, flags) {
                    return this.viewModel.attached(initiator, flags);
                };
            }
            if ('detaching' in object) {
                proto.detaching = function detaching(initiator, parent, flags) {
                    return this.viewModel.detaching(initiator, parent, flags);
                };
            }
            if ('unbinding' in object) {
                proto.unbinding = function unbinding(initiator, parent, flags) {
                    return this.viewModel.unbinding(initiator, parent, flags);
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
//# sourceMappingURL=view.js.map