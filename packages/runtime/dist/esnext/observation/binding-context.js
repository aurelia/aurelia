import { PLATFORM, Reporter } from '@aurelia/kernel';
import { ProxyObserver } from './proxy-observer';
import { SetterObserver } from './setter-observer';
const slice = Array.prototype.slice;
var RuntimeError;
(function (RuntimeError) {
    RuntimeError[RuntimeError["NilScope"] = 250] = "NilScope";
    RuntimeError[RuntimeError["NilOverrideContext"] = 252] = "NilOverrideContext";
    RuntimeError[RuntimeError["NilParentScope"] = 253] = "NilParentScope";
})(RuntimeError || (RuntimeError = {}));
const marker = Object.freeze({});
/** @internal */
export class InternalObserversLookup {
    getOrCreate(lifecycle, flags, obj, key) {
        if (this[key] === void 0) {
            this[key] = new SetterObserver(lifecycle, flags, obj, key);
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
            return ProxyObserver.getOrCreate(bc).proxy;
        }
        return bc;
    }
    static get(scope, name, ancestor, flags, part) {
        if (scope == null) {
            throw Reporter.error(250 /* NilScope */);
        }
        let overrideContext = scope.overrideContext;
        if (ancestor > 0) {
            // jump up the required number of ancestor contexts (eg $parent.$parent requires two jumps)
            while (ancestor > 0) {
                if (overrideContext.parentOverrideContext == null) {
                    return void 0;
                }
                ancestor--;
                overrideContext = overrideContext.parentOverrideContext;
            }
            return name in overrideContext ? overrideContext : overrideContext.bindingContext;
        }
        // traverse the context and it's ancestors, searching for a context that has the name.
        while (overrideContext && !(name in overrideContext) && !(overrideContext.bindingContext && name in overrideContext.bindingContext)) {
            overrideContext = overrideContext.parentOverrideContext;
        }
        if (overrideContext) {
            // we located a context with the property.  return it.
            return name in overrideContext ? overrideContext : overrideContext.bindingContext;
        }
        // the name wasn't found. see if parent scope traversal is allowed and if so, try that
        if ((flags & 67108864 /* allowParentScopeTraversal */) > 0) {
            let parent = scope.parentScope;
            while (parent !== null) {
                if (parent.scopeParts.includes(part)) {
                    const result = this.get(parent, name, ancestor, flags
                        // unset the flag; only allow one level of scope boundary traversal
                        & ~67108864 /* allowParentScopeTraversal */
                        // tell the scope to return null if the name could not be found
                        | 4194304 /* isTraversingParentScope */);
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
        if (flags & 4194304 /* isTraversingParentScope */) {
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
export class Scope {
    constructor(parentScope, bindingContext, overrideContext) {
        this.parentScope = parentScope;
        this.scopeParts = PLATFORM.emptyArray;
        this.bindingContext = bindingContext;
        this.overrideContext = overrideContext;
    }
    static create(flags, bc, oc) {
        return new Scope(null, bc, oc == null ? OverrideContext.create(flags, bc, oc) : oc);
    }
    static fromOverride(flags, oc) {
        if (oc == null) {
            throw Reporter.error(252 /* NilOverrideContext */);
        }
        return new Scope(null, oc.bindingContext, oc);
    }
    static fromParent(flags, ps, bc) {
        if (ps == null) {
            throw Reporter.error(253 /* NilParentScope */);
        }
        return new Scope(ps, bc, OverrideContext.create(flags, bc, ps.overrideContext));
    }
}
export class OverrideContext {
    constructor(bindingContext, parentOverrideContext) {
        this.$synthetic = true;
        this.bindingContext = bindingContext;
        this.parentOverrideContext = parentOverrideContext;
    }
    static create(flags, bc, poc) {
        return new OverrideContext(bc, poc === void 0 ? null : poc);
    }
    getObservers() {
        if (this.$observers === void 0) {
            this.$observers = new InternalObserversLookup();
        }
        return this.$observers;
    }
}
//# sourceMappingURL=binding-context.js.map