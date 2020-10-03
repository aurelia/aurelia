(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "@aurelia/kernel", "./proxy-observer", "./setter-observer"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.OverrideContext = exports.Scope = exports.BindingContext = exports.InternalObserversLookup = void 0;
    const kernel_1 = require("@aurelia/kernel");
    const proxy_observer_1 = require("./proxy-observer");
    const setter_observer_1 = require("./setter-observer");
    var RuntimeError;
    (function (RuntimeError) {
        RuntimeError[RuntimeError["NilScope"] = 250] = "NilScope";
        RuntimeError[RuntimeError["NilOverrideContext"] = 252] = "NilOverrideContext";
        RuntimeError[RuntimeError["NilParentScope"] = 253] = "NilParentScope";
    })(RuntimeError || (RuntimeError = {}));
    const marker = Object.freeze({});
    /** @internal */
    class InternalObserversLookup {
        getOrCreate(lifecycle, flags, obj, key) {
            if (this[key] === void 0) {
                this[key] = new setter_observer_1.SetterObserver(lifecycle, flags, obj, key);
            }
            return this[key];
        }
    }
    exports.InternalObserversLookup = InternalObserversLookup;
    class BindingContext {
        constructor(keyOrObj, value) {
            this.$synthetic = true;
            if (keyOrObj !== void 0) {
                if (value !== void 0) {
                    // if value is defined then it's just a property and a value to initialize with
                    this[keyOrObj] = value;
                }
                else {
                    // can either be some random object or another bindingContext to clone from
                    for (const prop in keyOrObj) {
                        if (Object.prototype.hasOwnProperty.call(keyOrObj, prop)) {
                            this[prop] = keyOrObj[prop];
                        }
                    }
                }
            }
        }
        static create(flags, keyOrObj, value) {
            const bc = new BindingContext(keyOrObj, value);
            if (flags & 2 /* proxyStrategy */) {
                return proxy_observer_1.ProxyObserver.getOrCreate(bc).proxy;
            }
            return bc;
        }
        static get(scope, name, ancestor, flags, hostScope) {
            if (scope == null && hostScope == null) {
                throw kernel_1.Reporter.error(250 /* NilScope */);
            }
            /* eslint-disable jsdoc/check-indentation */
            /**
             * This fallback is needed to support the following case:
             * <div au-slot="s1">
             *  <let outer-host.bind="$host"></let>
             *  ${outerHost.prop}
             * </div>
             * To enable the `let` binding for 'hostScope', the property is added to `hostScope.overrideContext`. That enables us to use such let binding also inside a repeater.
             * However, as the expression `${outerHost.prop}` does not start with `$host`, it is considered that to evaluate this expression, we don't need the access to hostScope.
             * This artifact raises the need for this fallback.
             */
            /* eslint-enable jsdoc/check-indentation */
            let context = chooseContext(scope, name, ancestor);
            if (context !== null) {
                return context;
            }
            if (hostScope !== scope && hostScope != null) {
                context = chooseContext(hostScope, name, ancestor);
                if (context !== null) {
                    return context;
                }
            }
            // still nothing found. return the root binding context (or null
            // if this is a parent scope traversal, to ensure we fall back to the
            // correct level)
            if (flags & 256 /* isTraversingParentScope */) {
                return marker;
            }
            return scope.bindingContext || scope.overrideContext;
        }
        getObservers(flags) {
            if (this.$observers == null) {
                this.$observers = new InternalObserversLookup();
            }
            return this.$observers;
        }
    }
    exports.BindingContext = BindingContext;
    function chooseContext(scope, name, ancestor) {
        var _a, _b;
        let overrideContext = scope.overrideContext;
        let currentScope = scope;
        if (ancestor > 0) {
            // jump up the required number of ancestor contexts (eg $parent.$parent requires two jumps)
            while (ancestor > 0) {
                ancestor--;
                currentScope = currentScope.parentScope;
                if ((currentScope === null || currentScope === void 0 ? void 0 : currentScope.overrideContext) == null) {
                    return void 0;
                }
            }
            overrideContext = currentScope.overrideContext;
            return name in overrideContext ? overrideContext : overrideContext.bindingContext;
        }
        // traverse the context and it's ancestors, searching for a context that has the name.
        while (overrideContext && !(name in overrideContext) && !(overrideContext.bindingContext && name in overrideContext.bindingContext)) {
            currentScope = (_a = currentScope.parentScope) !== null && _a !== void 0 ? _a : null;
            overrideContext = (_b = currentScope === null || currentScope === void 0 ? void 0 : currentScope.overrideContext) !== null && _b !== void 0 ? _b : null;
        }
        if (overrideContext) {
            // we located a context with the property.  return it.
            return name in overrideContext ? overrideContext : overrideContext.bindingContext;
        }
        return null;
    }
    class Scope {
        constructor(parentScope, bindingContext, overrideContext) {
            this.parentScope = parentScope;
            this.bindingContext = bindingContext;
            this.overrideContext = overrideContext;
        }
        static create(flags, bc, oc) {
            return new Scope(null, bc, oc == null ? OverrideContext.create(flags, bc) : oc);
        }
        static fromOverride(flags, oc) {
            if (oc == null) {
                throw kernel_1.Reporter.error(252 /* NilOverrideContext */);
            }
            return new Scope(null, oc.bindingContext, oc);
        }
        static fromParent(flags, ps, bc) {
            if (ps == null) {
                throw kernel_1.Reporter.error(253 /* NilParentScope */);
            }
            return new Scope(ps, bc, OverrideContext.create(flags, bc));
        }
    }
    exports.Scope = Scope;
    class OverrideContext {
        constructor(bindingContext) {
            this.$synthetic = true;
            this.bindingContext = bindingContext;
        }
        static create(flags, bc) {
            return new OverrideContext(bc);
        }
        getObservers() {
            if (this.$observers === void 0) {
                this.$observers = new InternalObserversLookup();
            }
            return this.$observers;
        }
    }
    exports.OverrideContext = OverrideContext;
});
//# sourceMappingURL=binding-context.js.map