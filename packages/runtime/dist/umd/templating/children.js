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
        define(["require", "exports", "@aurelia/kernel", "../resources/custom-element", "../observation/subscriber-collection"], factory);
    }
})(function (require, exports) {
    "use strict";
    var ChildrenObserver_1;
    Object.defineProperty(exports, "__esModule", { value: true });
    /* eslint-disable @typescript-eslint/no-use-before-define */
    const kernel_1 = require("@aurelia/kernel");
    const custom_element_1 = require("../resources/custom-element");
    const subscriber_collection_1 = require("../observation/subscriber-collection");
    function children(configOrTarget, prop) {
        let config;
        function decorator($target, $prop) {
            if (arguments.length > 1) {
                // Non invocation:
                // - @children
                // Invocation with or w/o opts:
                // - @children()
                // - @children({...opts})
                config.property = $prop;
            }
            kernel_1.Metadata.define(exports.Children.name, ChildrenDefinition.create($prop, config), $target.constructor, $prop);
            kernel_1.Protocol.annotation.appendTo($target.constructor, exports.Children.keyFrom($prop));
        }
        if (arguments.length > 1) {
            // Non invocation:
            // - @children
            config = {};
            decorator(configOrTarget, prop);
            return;
        }
        else if (typeof configOrTarget === 'string') {
            // ClassDecorator
            // - @children('bar')
            // Direct call:
            // - @children('bar')(Foo)
            config = {};
            return decorator;
        }
        // Invocation with or w/o opts:
        // - @children()
        // - @children({...opts})
        config = configOrTarget === void 0 ? {} : configOrTarget;
        return decorator;
    }
    exports.children = children;
    function isChildrenObserverAnnotation(key) {
        return key.startsWith(exports.Children.name);
    }
    exports.Children = {
        name: kernel_1.Protocol.annotation.keyFor('children-observer'),
        keyFrom(name) {
            return `${exports.Children.name}:${name}`;
        },
        from(...childrenObserverLists) {
            const childrenObservers = {};
            // eslint-disable-next-line @typescript-eslint/unbound-method
            const isArray = Array.isArray;
            function addName(name) {
                childrenObservers[name] = ChildrenDefinition.create(name);
            }
            function addDescription(name, def) {
                childrenObservers[name] = ChildrenDefinition.create(name, def);
            }
            function addList(maybeList) {
                if (isArray(maybeList)) {
                    maybeList.forEach(addName);
                }
                else if (maybeList instanceof ChildrenDefinition) {
                    childrenObservers[maybeList.property] = maybeList;
                }
                else if (maybeList !== void 0) {
                    Object.keys(maybeList).forEach(name => addDescription(name, maybeList));
                }
            }
            childrenObserverLists.forEach(addList);
            return childrenObservers;
        },
        getAll(Type) {
            const propStart = exports.Children.name.length + 1;
            const defs = [];
            const prototypeChain = kernel_1.getPrototypeChain(Type);
            let iProto = prototypeChain.length;
            let iDefs = 0;
            let keys;
            let keysLen;
            let Class;
            while (--iProto >= 0) {
                Class = prototypeChain[iProto];
                keys = kernel_1.Protocol.annotation.getKeys(Class).filter(isChildrenObserverAnnotation);
                keysLen = keys.length;
                for (let i = 0; i < keysLen; ++i) {
                    defs[iDefs++] = kernel_1.Metadata.getOwn(exports.Children.name, Class, keys[i].slice(propStart));
                }
            }
            return defs;
        },
    };
    class ChildrenDefinition {
        constructor(callback, property, options, query, filter, map) {
            this.callback = callback;
            this.property = property;
            this.options = options;
            this.query = query;
            this.filter = filter;
            this.map = map;
        }
        static create(prop, def = {}) {
            return new ChildrenDefinition(kernel_1.firstDefined(def.callback, `${prop}Changed`), kernel_1.firstDefined(def.property, prop), def.options, def.query, def.filter, def.map);
        }
    }
    exports.ChildrenDefinition = ChildrenDefinition;
    /** @internal */
    let ChildrenObserver = ChildrenObserver_1 = class ChildrenObserver {
        constructor(controller, obj, flags, propertyKey, cbName, query = defaultChildQuery, filter = defaultChildFilter, map = defaultChildMap, options) {
            this.controller = controller;
            this.obj = obj;
            this.propertyKey = propertyKey;
            this.query = query;
            this.filter = filter;
            this.map = map;
            this.options = options;
            this.observing = false;
            this.children = (void 0);
            this.callback = obj[cbName];
            this.persistentFlags = flags & 2080374799 /* persistentBindingFlags */;
            this.createGetterSetter();
        }
        getValue() {
            this.tryStartObserving();
            return this.children;
        }
        setValue(newValue) { }
        subscribe(subscriber) {
            this.tryStartObserving();
            this.addSubscriber(subscriber);
        }
        tryStartObserving() {
            if (!this.observing) {
                this.observing = true;
                const projector = this.controller.projector;
                this.children = filterChildren(projector, this.query, this.filter, this.map);
                projector.subscribeToChildrenChange(() => { this.onChildrenChanged(); }, this.options);
            }
        }
        onChildrenChanged() {
            this.children = filterChildren(this.controller.projector, this.query, this.filter, this.map);
            if (this.callback !== void 0) {
                this.callback.call(this.obj);
            }
            this.callSubscribers(this.children, undefined, this.persistentFlags | 16 /* updateTargetInstance */);
        }
        createGetterSetter() {
            if (!Reflect.defineProperty(this.obj, this.propertyKey, {
                enumerable: true,
                configurable: true,
                get: () => this.getValue(),
                set: () => { return; },
            })) {
                kernel_1.Reporter.write(1, this.propertyKey, this.obj);
            }
        }
    };
    ChildrenObserver = ChildrenObserver_1 = __decorate([
        subscriber_collection_1.subscriberCollection(),
        __metadata("design:paramtypes", [Object, Object, Number, String, String, Object, Object, Object, Object])
    ], ChildrenObserver);
    exports.ChildrenObserver = ChildrenObserver;
    function defaultChildQuery(projector) {
        return projector.children;
    }
    function defaultChildFilter(node, controller, viewModel) {
        return !!viewModel;
    }
    function defaultChildMap(node, controller, viewModel) {
        return viewModel;
    }
    /** @internal */
    function filterChildren(projector, query, filter, map) {
        const nodes = query(projector);
        const children = [];
        for (let i = 0, ii = nodes.length; i < ii; ++i) {
            const node = nodes[i];
            const controller = custom_element_1.CustomElement.for(node);
            const viewModel = controller ? controller.viewModel : null;
            if (filter(node, controller, viewModel)) {
                children.push(map(node, controller, viewModel));
            }
        }
        return children;
    }
    exports.filterChildren = filterChildren;
});
//# sourceMappingURL=children.js.map