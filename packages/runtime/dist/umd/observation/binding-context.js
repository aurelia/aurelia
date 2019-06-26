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
    const kernel_1 = require("@aurelia/kernel");
    const proxy_observer_1 = require("./proxy-observer");
    const setter_observer_1 = require("./setter-observer");
    const slice = Array.prototype.slice;
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
            if (kernel_1.Tracer.enabled) {
                kernel_1.Tracer.enter('InternalObserversLookup', 'getOrCreate', slice.call(arguments));
            }
            if (this[key] === void 0) {
                this[key] = new setter_observer_1.SetterObserver(lifecycle, flags, obj, key);
            }
            if (kernel_1.Tracer.enabled) {
                kernel_1.Tracer.leave();
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
                        if (keyOrObj.hasOwnProperty(prop)) {
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
        static get(scope, name, ancestor, flags, part) {
            if (kernel_1.Tracer.enabled) {
                kernel_1.Tracer.enter('BindingContext', 'get', slice.call(arguments));
            }
            if (scope == null) {
                throw kernel_1.Reporter.error(250 /* NilScope */);
            }
            let overrideContext = scope.overrideContext;
            if (ancestor > 0) {
                // jump up the required number of ancestor contexts (eg $parent.$parent requires two jumps)
                while (ancestor > 0) {
                    if (overrideContext.parentOverrideContext == null) {
                        if (kernel_1.Tracer.enabled) {
                            kernel_1.Tracer.leave();
                        }
                        return void 0;
                    }
                    ancestor--;
                    overrideContext = overrideContext.parentOverrideContext;
                }
                if (kernel_1.Tracer.enabled) {
                    kernel_1.Tracer.leave();
                }
                return name in overrideContext ? overrideContext : overrideContext.bindingContext;
            }
            // traverse the context and it's ancestors, searching for a context that has the name.
            while (overrideContext && !(name in overrideContext) && !(overrideContext.bindingContext && name in overrideContext.bindingContext)) {
                overrideContext = overrideContext.parentOverrideContext;
            }
            if (overrideContext) {
                if (kernel_1.Tracer.enabled) {
                    kernel_1.Tracer.leave();
                }
                // we located a context with the property.  return it.
                return name in overrideContext ? overrideContext : overrideContext.bindingContext;
            }
            // the name wasn't found. see if parent scope traversal is allowed and if so, try that
            if ((flags & 536870912 /* allowParentScopeTraversal */) > 0) {
                let parent = scope.parentScope;
                while (parent !== null) {
                    if (parent.scopeParts.includes(part)) {
                        const result = this.get(parent, name, ancestor, flags
                            // unset the flag; only allow one level of scope boundary traversal
                            & ~536870912 /* allowParentScopeTraversal */
                            // tell the scope to return null if the name could not be found
                            | 16777216 /* isTraversingParentScope */);
                        if (kernel_1.Tracer.enabled) {
                            kernel_1.Tracer.leave();
                        }
                        if (result === marker) {
                            return scope.bindingContext || scope.overrideContext;
                        }
                        else {
                            return result;
                        }
                    }
                    else {
                        parent = parent.parentScope;
                    }
                }
                if (parent === null) {
                    throw new Error(`No target scope could be found for part "${part}"`);
                }
            }
            // still nothing found. return the root binding context (or null
            // if this is a parent scope traversal, to ensure we fall back to the
            // correct level)
            if (flags & 16777216 /* isTraversingParentScope */) {
                if (kernel_1.Tracer.enabled) {
                    kernel_1.Tracer.leave();
                }
                return marker;
            }
            if (kernel_1.Tracer.enabled) {
                kernel_1.Tracer.leave();
            }
            return scope.bindingContext || scope.overrideContext;
        }
        getObservers(flags) {
            if (kernel_1.Tracer.enabled) {
                kernel_1.Tracer.enter('BindingContext', 'getObservers', slice.call(arguments));
            }
            if (this.$observers == null) {
                this.$observers = new InternalObserversLookup();
            }
            if (kernel_1.Tracer.enabled) {
                kernel_1.Tracer.leave();
            }
            return this.$observers;
        }
    }
    exports.BindingContext = BindingContext;
    class Scope {
        constructor(parentScope, bindingContext, overrideContext) {
            this.parentScope = parentScope;
            this.scopeParts = kernel_1.PLATFORM.emptyArray;
            this.bindingContext = bindingContext;
            this.overrideContext = overrideContext;
        }
        static create(flags, bc, oc) {
            if (kernel_1.Tracer.enabled) {
                kernel_1.Tracer.enter('Scope', 'create', slice.call(arguments));
            }
            if (kernel_1.Tracer.enabled) {
                kernel_1.Tracer.leave();
            }
            return new Scope(null, bc, oc == null ? OverrideContext.create(flags, bc, oc) : oc);
        }
        static fromOverride(flags, oc) {
            if (kernel_1.Tracer.enabled) {
                kernel_1.Tracer.enter('Scope', 'fromOverride', slice.call(arguments));
            }
            if (oc == null) {
                throw kernel_1.Reporter.error(252 /* NilOverrideContext */);
            }
            if (kernel_1.Tracer.enabled) {
                kernel_1.Tracer.leave();
            }
            return new Scope(null, oc.bindingContext, oc);
        }
        static fromParent(flags, ps, bc) {
            if (kernel_1.Tracer.enabled) {
                kernel_1.Tracer.enter('Scope', 'fromParent', slice.call(arguments));
            }
            if (ps == null) {
                throw kernel_1.Reporter.error(253 /* NilParentScope */);
            }
            if (kernel_1.Tracer.enabled) {
                kernel_1.Tracer.leave();
            }
            return new Scope(ps, bc, OverrideContext.create(flags, bc, ps.overrideContext));
        }
    }
    exports.Scope = Scope;
    class OverrideContext {
        constructor(bindingContext, parentOverrideContext) {
            this.$synthetic = true;
            this.bindingContext = bindingContext;
            this.parentOverrideContext = parentOverrideContext;
        }
        static create(flags, bc, poc) {
            if (kernel_1.Tracer.enabled) {
                kernel_1.Tracer.enter('OverrideContext', 'create', slice.call(arguments));
            }
            if (kernel_1.Tracer.enabled) {
                kernel_1.Tracer.leave();
            }
            return new OverrideContext(bc, poc === void 0 ? null : poc);
        }
        getObservers() {
            if (kernel_1.Tracer.enabled) {
                kernel_1.Tracer.enter('OverrideContext', 'getObservers', slice.call(arguments));
            }
            if (this.$observers === void 0) {
                this.$observers = new InternalObserversLookup();
            }
            if (kernel_1.Tracer.enabled) {
                kernel_1.Tracer.leave();
            }
            return this.$observers;
        }
    }
    exports.OverrideContext = OverrideContext;
});
//# sourceMappingURL=binding-context.js.map