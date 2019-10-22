(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "@aurelia/kernel"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    /* eslint-disable @typescript-eslint/no-use-before-define */
    const kernel_1 = require("@aurelia/kernel");
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
});
//# sourceMappingURL=children.js.map