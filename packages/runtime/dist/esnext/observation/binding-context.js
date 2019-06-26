import { Reporter, Tracer } from '@aurelia/kernel';
import { ProxyObserver } from './proxy-observer';
import { SetterObserver } from './setter-observer';
const slice = Array.prototype.slice;
var RuntimeError;
(function (RuntimeError) {
    RuntimeError[RuntimeError["NilScope"] = 250] = "NilScope";
    RuntimeError[RuntimeError["NilOverrideContext"] = 252] = "NilOverrideContext";
    RuntimeError[RuntimeError["NilParentScope"] = 253] = "NilParentScope";
})(RuntimeError || (RuntimeError = {}));
/** @internal */
export class InternalObserversLookup {
    getOrCreate(lifecycle, flags, obj, key) {
        if (Tracer.enabled) {
            Tracer.enter('InternalObserversLookup', 'getOrCreate', slice.call(arguments));
        }
        if (this[key] === void 0) {
            this[key] = new SetterObserver(lifecycle, flags, obj, key);
        }
        if (Tracer.enabled) {
            Tracer.leave();
        }
        return this[key];
    }
}
export class BindingContext {
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
            return ProxyObserver.getOrCreate(bc).proxy;
        }
        return bc;
    }
    static get(scope, name, ancestor, flags, part) {
        if (Tracer.enabled) {
            Tracer.enter('BindingContext', 'get', slice.call(arguments));
        }
        if (scope == null) {
            throw Reporter.error(250 /* NilScope */);
        }
        let overrideContext = scope.overrideContext;
        if (ancestor > 0) {
            // jump up the required number of ancestor contexts (eg $parent.$parent requires two jumps)
            while (ancestor > 0) {
                if (overrideContext.parentOverrideContext == null) {
                    if (Tracer.enabled) {
                        Tracer.leave();
                    }
                    return void 0;
                }
                ancestor--;
                overrideContext = overrideContext.parentOverrideContext;
            }
            if (Tracer.enabled) {
                Tracer.leave();
            }
            return name in overrideContext ? overrideContext : overrideContext.bindingContext;
        }
        // traverse the context and it's ancestors, searching for a context that has the name.
        while (overrideContext && !(name in overrideContext) && !(overrideContext.bindingContext && name in overrideContext.bindingContext)) {
            overrideContext = overrideContext.parentOverrideContext;
        }
        if (overrideContext) {
            if (Tracer.enabled) {
                Tracer.leave();
            }
            // we located a context with the property.  return it.
            return name in overrideContext ? overrideContext : overrideContext.bindingContext;
        }
        // the name wasn't found. see if parent scope traversal is allowed and if so, try that
        if ((flags & 536870912 /* allowParentScopeTraversal */) > 0) {
            const partScope = scope.partScopes[part];
            const result = this.get(partScope, name, ancestor, flags
                // unset the flag; only allow one level of scope boundary traversal
                & ~536870912 /* allowParentScopeTraversal */
                // tell the scope to return null if the name could not be found
                | 16777216 /* isTraversingParentScope */);
            if (result !== null) {
                if (Tracer.enabled) {
                    Tracer.leave();
                }
                return result;
            }
        }
        // still nothing found. return the root binding context (or null
        // if this is a parent scope traversal, to ensure we fall back to the
        // correct level)
        if (flags & 16777216 /* isTraversingParentScope */) {
            if (Tracer.enabled) {
                Tracer.leave();
            }
            return null;
        }
        if (Tracer.enabled) {
            Tracer.leave();
        }
        return scope.bindingContext || scope.overrideContext;
    }
    getObservers(flags) {
        if (Tracer.enabled) {
            Tracer.enter('BindingContext', 'getObservers', slice.call(arguments));
        }
        if (this.$observers == null) {
            this.$observers = new InternalObserversLookup();
        }
        if (Tracer.enabled) {
            Tracer.leave();
        }
        return this.$observers;
    }
}
export class Scope {
    constructor(bindingContext, overrideContext, partScopes) {
        this.bindingContext = bindingContext;
        this.overrideContext = overrideContext;
        this.partScopes = partScopes;
    }
    static create(flags, bc, oc) {
        if (Tracer.enabled) {
            Tracer.enter('Scope', 'create', slice.call(arguments));
        }
        if (Tracer.enabled) {
            Tracer.leave();
        }
        return new Scope(bc, oc == null ? OverrideContext.create(flags, bc, oc) : oc);
    }
    static fromOverride(flags, oc) {
        if (Tracer.enabled) {
            Tracer.enter('Scope', 'fromOverride', slice.call(arguments));
        }
        if (oc == null) {
            throw Reporter.error(252 /* NilOverrideContext */);
        }
        if (Tracer.enabled) {
            Tracer.leave();
        }
        return new Scope(oc.bindingContext, oc);
    }
    static fromParent(flags, ps, bc) {
        if (Tracer.enabled) {
            Tracer.enter('Scope', 'fromParent', slice.call(arguments));
        }
        if (ps == null) {
            throw Reporter.error(253 /* NilParentScope */);
        }
        if (Tracer.enabled) {
            Tracer.leave();
        }
        return new Scope(bc, OverrideContext.create(flags, bc, ps.overrideContext), ps.partScopes);
    }
}
export class OverrideContext {
    constructor(bindingContext, parentOverrideContext) {
        this.$synthetic = true;
        this.bindingContext = bindingContext;
        this.parentOverrideContext = parentOverrideContext;
    }
    static create(flags, bc, poc) {
        if (Tracer.enabled) {
            Tracer.enter('OverrideContext', 'create', slice.call(arguments));
        }
        if (Tracer.enabled) {
            Tracer.leave();
        }
        return new OverrideContext(bc, poc === void 0 ? null : poc);
    }
    getObservers() {
        if (Tracer.enabled) {
            Tracer.enter('OverrideContext', 'getObservers', slice.call(arguments));
        }
        if (this.$observers === void 0) {
            this.$observers = new InternalObserversLookup();
        }
        if (Tracer.enabled) {
            Tracer.leave();
        }
        return this.$observers;
    }
}
//# sourceMappingURL=binding-context.js.map