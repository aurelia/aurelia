import { DI, Metadata, Protocol, Registration } from '../../../../kernel/dist/native-modules/index.js';
export const ILifecycleHooks = DI.createInterface('ILifecycleHooks');
export class LifecycleHooksEntry {
    constructor(definition, instance) {
        this.definition = definition;
        this.instance = instance;
    }
}
/**
 * This definition has no specific properties yet other than the type, but is in place for future extensions.
 *
 * See: https://github.com/aurelia/aurelia/issues/1044
 */
export class LifecycleHooksDefinition {
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
        Registration.singleton(ILifecycleHooks, this.Type).register(container);
    }
}
const containerLookup = new WeakMap();
export const LifecycleHooks = {
    name: Protocol.annotation.keyFor('lifecycle-hooks'),
    /**
     * @param def - Placeholder for future extensions. Currently always an empty object.
     */
    define(def, Type) {
        const definition = LifecycleHooksDefinition.create(def, Type);
        Metadata.define(LifecycleHooks.name, definition, Type);
        Protocol.resource.appendTo(Type, LifecycleHooks.name);
        return definition.Type;
    },
    resolve(ctx) {
        let lookup = containerLookup.get(ctx);
        if (lookup === void 0) {
            lookup = {};
            const instances = ctx.root.id === ctx.id
                ? ctx.getAll(ILifecycleHooks, false)
                : [
                    ...ctx.root.getAll(ILifecycleHooks, false),
                    ...ctx.getAll(ILifecycleHooks, false),
                ];
            for (const instance of instances) {
                const definition = Metadata.getOwn(LifecycleHooks.name, instance.constructor);
                const entry = new LifecycleHooksEntry(definition, instance);
                for (const name of definition.propertyNames) {
                    const entries = lookup[name];
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
/**
 * Decorator: Indicates that the decorated class is a custom element.
 */
export function lifecycleHooks() {
    return function decorator(target) {
        return LifecycleHooks.define({}, target);
    };
}
//# sourceMappingURL=lifecycle-hooks.js.map