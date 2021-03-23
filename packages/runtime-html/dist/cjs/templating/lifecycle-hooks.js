"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.lifecycleHooks = exports.LifecycleHooks = exports.LifecycleHooksDefinition = exports.LifecycleHooksEntry = exports.ILifecycleHooks = void 0;
const kernel_1 = require("@aurelia/kernel");
exports.ILifecycleHooks = kernel_1.DI.createInterface('ILifecycleHooks');
class LifecycleHooksEntry {
    constructor(definition, instance) {
        this.definition = definition;
        this.instance = instance;
    }
}
exports.LifecycleHooksEntry = LifecycleHooksEntry;
/**
 * This definition has no specific properties yet other than the type, but is in place for future extensions.
 *
 * See: https://github.com/aurelia/aurelia/issues/1044
 */
class LifecycleHooksDefinition {
    constructor(Type, propertyNames) {
        this.Type = Type;
        this.propertyNames = propertyNames;
    }
    /**
     * @param def - Placeholder for future extensions. Currently always an empty object.
     */
    static create(def, Type) {
        const propertyNames = new Set();
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        let proto = Type.prototype;
        while (proto !== Object.prototype) {
            for (const name of Object.getOwnPropertyNames(proto)) {
                // This is the only check we will do for now. Filtering on e.g. function types might not always work properly when decorators come into play. This would need more testing first.
                if (name !== 'constructor') {
                    propertyNames.add(name);
                }
            }
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
            proto = Object.getPrototypeOf(proto);
        }
        return new LifecycleHooksDefinition(Type, propertyNames);
    }
    register(container) {
        kernel_1.Registration.singleton(exports.ILifecycleHooks, this.Type).register(container);
    }
}
exports.LifecycleHooksDefinition = LifecycleHooksDefinition;
const containerLookup = new WeakMap();
exports.LifecycleHooks = {
    name: kernel_1.Protocol.annotation.keyFor('lifecycle-hooks'),
    /**
     * @param def - Placeholder for future extensions. Currently always an empty object.
     */
    define(def, Type) {
        const definition = LifecycleHooksDefinition.create(def, Type);
        kernel_1.Metadata.define(exports.LifecycleHooks.name, definition, Type);
        kernel_1.Protocol.resource.appendTo(Type, exports.LifecycleHooks.name);
        return definition.Type;
    },
    resolve(ctx) {
        let lookup = containerLookup.get(ctx);
        if (lookup === void 0) {
            lookup = new LifecycleHooksLookupImpl();
            const root = ctx.root;
            const instances = root.id === ctx.id
                ? ctx.getAll(exports.ILifecycleHooks)
                // if it's not root, only resolve it from the current context when it has the resolver
                // to maintain resources semantic: current -> root
                : ctx.has(exports.ILifecycleHooks, false)
                    ? [...root.getAll(exports.ILifecycleHooks), ...ctx.getAll(exports.ILifecycleHooks)]
                    : root.getAll(exports.ILifecycleHooks);
            let instance;
            let definition;
            let entry;
            let name;
            let entries;
            for (instance of instances) {
                definition = kernel_1.Metadata.getOwn(exports.LifecycleHooks.name, instance.constructor);
                entry = new LifecycleHooksEntry(definition, instance);
                for (name of definition.propertyNames) {
                    entries = lookup[name];
                    if (entries === void 0) {
                        lookup[name] = [entry];
                    }
                    else {
                        entries.push(entry);
                    }
                }
            }
        }
        return lookup;
    },
};
class LifecycleHooksLookupImpl {
}
/**
 * Decorator: Indicates that the decorated class is a custom element.
 */
function lifecycleHooks() {
    return function decorator(target) {
        return exports.LifecycleHooks.define({}, target);
    };
}
exports.lifecycleHooks = lifecycleHooks;
//# sourceMappingURL=lifecycle-hooks.js.map