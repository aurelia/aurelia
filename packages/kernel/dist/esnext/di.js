import { PLATFORM } from './platform';
import { Reporter } from './reporter';
import { Protocol } from './resource';
import { Metadata } from './metadata';
import { isNumeric } from './functions';
function cloneArrayWithPossibleProps(source) {
    const clone = source.slice();
    const keys = Object.keys(source);
    const len = keys.length;
    let key;
    for (let i = 0; i < len; ++i) {
        key = keys[i];
        if (!isNumeric(key)) {
            clone[key] = source[key];
        }
    }
    return clone;
}
export class DI {
    constructor() { return; }
    static createContainer(...params) {
        if (params.length === 0) {
            return new Container(null);
        }
        else {
            return new Container(null).register(...params);
        }
    }
    static getDesignParamtypes(Type) {
        return Metadata.getOwn('design:paramtypes', Type);
    }
    static getAnnotationParamtypes(Type) {
        const key = Protocol.annotation.keyFor('di:paramtypes');
        return Metadata.getOwn(key, Type);
    }
    static getOrCreateAnnotationParamTypes(Type) {
        const key = Protocol.annotation.keyFor('di:paramtypes');
        let annotationParamtypes = Metadata.getOwn(key, Type);
        if (annotationParamtypes === void 0) {
            Metadata.define(key, annotationParamtypes = [], Type);
            Protocol.annotation.appendTo(Type, key);
        }
        return annotationParamtypes;
    }
    static getDependencies(Type) {
        // Note: Every detail of this getDependencies method is pretty deliberate at the moment, and probably not yet 100% tested from every possible angle,
        // so be careful with making changes here as it can have a huge impact on complex end user apps.
        // Preferably, only make changes to the dependency resolution process via a RFC.
        const key = Protocol.annotation.keyFor('di:dependencies');
        let dependencies = Metadata.getOwn(key, Type);
        if (dependencies === void 0) {
            // Type.length is the number of constructor parameters. If this is 0, it could mean the class has an empty constructor
            // but it could also mean the class has no constructor at all (in which case it inherits the constructor from the prototype).
            // Non-zero constructor length + no paramtypes means emitDecoratorMetadata is off, or the class has no decorator.
            // We're not doing anything with the above right now, but it's good to keep in mind for any future issues.
            const inject = Type.inject;
            if (inject === void 0) {
                // design:paramtypes is set by tsc when emitDecoratorMetadata is enabled.
                const designParamtypes = DI.getDesignParamtypes(Type);
                // au:annotation:di:paramtypes is set by the parameter decorator from DI.createInterface or by @inject
                const annotationParamtypes = DI.getAnnotationParamtypes(Type);
                if (designParamtypes === void 0) {
                    if (annotationParamtypes === void 0) {
                        // Only go up the prototype if neither static inject nor any of the paramtypes is defined, as
                        // there is no sound way to merge a type's deps with its prototype's deps
                        const Proto = Object.getPrototypeOf(Type);
                        if (typeof Proto === 'function' && Proto !== Function.prototype) {
                            dependencies = cloneArrayWithPossibleProps(DI.getDependencies(Proto));
                        }
                        else {
                            dependencies = [];
                        }
                    }
                    else {
                        // No design:paramtypes so just use the au:annotation:di:paramtypes
                        dependencies = cloneArrayWithPossibleProps(annotationParamtypes);
                    }
                }
                else if (annotationParamtypes === void 0) {
                    // No au:annotation:di:paramtypes so just use the design:paramtypes
                    dependencies = cloneArrayWithPossibleProps(designParamtypes);
                }
                else {
                    // We've got both, so merge them (in case of conflict on same index, au:annotation:di:paramtypes take precedence)
                    dependencies = cloneArrayWithPossibleProps(designParamtypes);
                    let len = annotationParamtypes.length;
                    let auAnnotationParamtype;
                    for (let i = 0; i < len; ++i) {
                        auAnnotationParamtype = annotationParamtypes[i];
                        if (auAnnotationParamtype !== void 0) {
                            dependencies[i] = auAnnotationParamtype;
                        }
                    }
                    const keys = Object.keys(annotationParamtypes);
                    len = keys.length;
                    let key;
                    for (let i = 0; i < len; ++i) {
                        key = keys[i];
                        if (!isNumeric(key)) {
                            dependencies[key] = annotationParamtypes[key];
                        }
                    }
                }
            }
            else {
                // Ignore paramtypes if we have static inject
                dependencies = cloneArrayWithPossibleProps(inject);
            }
            Metadata.define(key, dependencies, Type);
            Protocol.annotation.appendTo(Type, key);
        }
        return dependencies;
    }
    static createInterface(friendlyName) {
        const Interface = function (target, property, index) {
            if (target == null) {
                throw Reporter.error(16, Interface.friendlyName, Interface); // TODO: add error (trying to resolve an InterfaceSymbol that has no registrations)
            }
            const annotationParamtypes = DI.getOrCreateAnnotationParamTypes(target);
            annotationParamtypes[index] = Interface;
            return target;
        };
        Interface.friendlyName = friendlyName == null ? 'Interface' : friendlyName;
        Interface.noDefault = function () {
            return Interface;
        };
        Interface.withDefault = function (configure) {
            Interface.withDefault = function () {
                throw Reporter.error(17, Interface);
            };
            Interface.register = function (container, key) {
                const trueKey = key == null ? Interface : key;
                return configure({
                    instance(value) {
                        return container.registerResolver(trueKey, new Resolver(trueKey, 0 /* instance */, value));
                    },
                    singleton(value) {
                        return container.registerResolver(trueKey, new Resolver(trueKey, 1 /* singleton */, value));
                    },
                    transient(value) {
                        return container.registerResolver(trueKey, new Resolver(trueKey, 2 /* transient */, value));
                    },
                    callback(value) {
                        return container.registerResolver(trueKey, new Resolver(trueKey, 3 /* callback */, value));
                    },
                    aliasTo(destinationKey) {
                        return container.registerResolver(trueKey, new Resolver(trueKey, 5 /* alias */, destinationKey));
                    },
                });
            };
            return Interface;
        };
        return Interface;
    }
    static inject(...dependencies) {
        return function (target, key, descriptor) {
            if (typeof descriptor === 'number') { // It's a parameter decorator.
                const annotationParamtypes = DI.getOrCreateAnnotationParamTypes(target);
                const dep = dependencies[0];
                if (dep !== void 0) {
                    annotationParamtypes[descriptor] = dep;
                }
            }
            else if (key) { // It's a property decorator. Not supported by the container without plugins.
                const annotationParamtypes = DI.getOrCreateAnnotationParamTypes(target.constructor);
                const dep = dependencies[0];
                if (dep !== void 0) {
                    annotationParamtypes[key] = dep;
                }
            }
            else if (descriptor) { // It's a function decorator (not a Class constructor)
                const fn = descriptor.value;
                const annotationParamtypes = DI.getOrCreateAnnotationParamTypes(fn);
                let dep;
                for (let i = 0; i < dependencies.length; ++i) {
                    dep = dependencies[i];
                    if (dep !== void 0) {
                        annotationParamtypes[i] = dep;
                    }
                }
            }
            else { // It's a class decorator.
                const annotationParamtypes = DI.getOrCreateAnnotationParamTypes(target);
                let dep;
                for (let i = 0; i < dependencies.length; ++i) {
                    dep = dependencies[i];
                    if (dep !== void 0) {
                        annotationParamtypes[i] = dep;
                    }
                }
            }
        };
    }
    /**
     * Registers the `target` class as a transient dependency; each time the dependency is resolved
     * a new instance will be created.
     *
     * @param target - The class / constructor function to register as transient.
     * @returns The same class, with a static `register` method that takes a container and returns the appropriate resolver.
     *
     * @example ```ts
     * // On an existing class
     * class Foo { }
     * DI.transient(Foo);
     *
     * // Inline declaration
     * const Foo = DI.transient(class { });
     * // Foo is now strongly typed with register
     * Foo.register(container);
     * ```
     */
    static transient(target) {
        target.register = function register(container) {
            const registration = Registration.transient(target, target);
            return registration.register(container, target);
        };
        return target;
    }
    /**
     * Registers the `target` class as a singleton dependency; the class will only be created once. Each
     * consecutive time the dependency is resolved, the same instance will be returned.
     *
     * @param target - The class / constructor function to register as a singleton.
     * @returns The same class, with a static `register` method that takes a container and returns the appropriate resolver.
     * @example ```ts
     * // On an existing class
     * class Foo { }
     * DI.singleton(Foo);
     *
     * // Inline declaration
     * const Foo = DI.singleton(class { });
     * // Foo is now strongly typed with register
     * Foo.register(container);
     * ```
     */
    static singleton(target) {
        target.register = function register(container) {
            const registration = Registration.singleton(target, target);
            return registration.register(container, target);
        };
        return target;
    }
}
export const IContainer = DI.createInterface('IContainer').noDefault();
export const IServiceLocator = IContainer;
function createResolver(getter) {
    return function (key) {
        const resolver = function (target, property, descriptor) {
            DI.inject(resolver)(target, property, descriptor);
        };
        resolver.resolve = function (handler, requestor) {
            return getter(key, handler, requestor);
        };
        return resolver;
    };
}
export const inject = DI.inject;
function transientDecorator(target) {
    return DI.transient(target);
}
export function transient(target) {
    return target == null ? transientDecorator : transientDecorator(target);
}
function singletonDecorator(target) {
    return DI.singleton(target);
}
export function singleton(target) {
    return target == null ? singletonDecorator : singletonDecorator(target);
}
export const all = createResolver((key, handler, requestor) => requestor.getAll(key));
export const lazy = createResolver((key, handler, requestor) => {
    let instance = null; // cache locally so that lazy always returns the same instance once resolved
    return () => {
        if (instance == null) {
            instance = requestor.get(key);
        }
        return instance;
    };
});
export const optional = createResolver((key, handler, requestor) => {
    if (requestor.has(key, true)) {
        return requestor.get(key);
    }
    else {
        return null;
    }
});
/** @internal */
export var ResolverStrategy;
(function (ResolverStrategy) {
    ResolverStrategy[ResolverStrategy["instance"] = 0] = "instance";
    ResolverStrategy[ResolverStrategy["singleton"] = 1] = "singleton";
    ResolverStrategy[ResolverStrategy["transient"] = 2] = "transient";
    ResolverStrategy[ResolverStrategy["callback"] = 3] = "callback";
    ResolverStrategy[ResolverStrategy["array"] = 4] = "array";
    ResolverStrategy[ResolverStrategy["alias"] = 5] = "alias";
})(ResolverStrategy || (ResolverStrategy = {}));
/** @internal */
export class Resolver {
    constructor(key, strategy, state) {
        this.key = key;
        this.strategy = strategy;
        this.state = state;
    }
    register(container, key) {
        return container.registerResolver(key || this.key, this);
    }
    resolve(handler, requestor) {
        switch (this.strategy) {
            case 0 /* instance */:
                return this.state;
            case 1 /* singleton */: {
                this.strategy = 0 /* instance */;
                const factory = handler.getFactory(this.state);
                if (factory === null) {
                    throw new Error(`Resolver for ${String(this.key)} returned a null factory`);
                }
                return this.state = factory.construct(requestor);
            }
            case 2 /* transient */: {
                // Always create transients from the requesting container
                const factory = handler.getFactory(this.state);
                if (factory === null) {
                    throw new Error(`Resolver for ${String(this.key)} returned a null factory`);
                }
                return factory.construct(requestor);
            }
            case 3 /* callback */:
                return this.state(handler, requestor, this);
            case 4 /* array */:
                return this.state[0].resolve(handler, requestor);
            case 5 /* alias */:
                return handler.get(this.state);
            default:
                throw Reporter.error(6, this.strategy);
        }
    }
    getFactory(container) {
        let resolver;
        switch (this.strategy) {
            case 1 /* singleton */:
            case 2 /* transient */:
                return container.getFactory(this.state);
            case 5 /* alias */:
                resolver = container.getResolver(this.state);
                if (resolver == null || resolver.getFactory === void 0) {
                    return null;
                }
                return resolver.getFactory(container);
            default:
                return null;
        }
    }
}
/** @internal */
export class Factory {
    constructor(Type, invoker, dependencies) {
        this.Type = Type;
        this.invoker = invoker;
        this.dependencies = dependencies;
        this.transformers = null;
    }
    construct(container, dynamicDependencies) {
        const transformers = this.transformers;
        let instance = dynamicDependencies !== void 0
            ? this.invoker.invokeWithDynamicDependencies(container, this.Type, this.dependencies, dynamicDependencies)
            : this.invoker.invoke(container, this.Type, this.dependencies);
        if (transformers == null) {
            return instance;
        }
        for (let i = 0, ii = transformers.length; i < ii; ++i) {
            instance = transformers[i](instance);
        }
        return instance;
    }
    registerTransformer(transformer) {
        if (this.transformers == null) {
            this.transformers = [];
        }
        this.transformers.push(transformer);
        return true;
    }
}
const createFactory = (function () {
    function invokeWithDynamicDependencies(container, Type, staticDependencies, dynamicDependencies) {
        let i = staticDependencies.length;
        let args = new Array(i);
        let lookup;
        while (i-- > 0) {
            lookup = staticDependencies[i];
            if (lookup == null) {
                throw Reporter.error(7, `Index ${i}.`);
            }
            else {
                args[i] = container.get(lookup);
            }
        }
        if (dynamicDependencies !== void 0) {
            args = args.concat(dynamicDependencies);
        }
        return Reflect.construct(Type, args);
    }
    const classInvokers = [
        {
            invoke(container, Type) {
                return new Type();
            },
            invokeWithDynamicDependencies
        },
        {
            invoke(container, Type, deps) {
                return new Type(container.get(deps[0]));
            },
            invokeWithDynamicDependencies
        },
        {
            invoke(container, Type, deps) {
                return new Type(container.get(deps[0]), container.get(deps[1]));
            },
            invokeWithDynamicDependencies
        },
        {
            invoke(container, Type, deps) {
                return new Type(container.get(deps[0]), container.get(deps[1]), container.get(deps[2]));
            },
            invokeWithDynamicDependencies
        },
        {
            invoke(container, Type, deps) {
                return new Type(container.get(deps[0]), container.get(deps[1]), container.get(deps[2]), container.get(deps[3]));
            },
            invokeWithDynamicDependencies
        },
        {
            invoke(container, Type, deps) {
                return new Type(container.get(deps[0]), container.get(deps[1]), container.get(deps[2]), container.get(deps[3]), container.get(deps[4]));
            },
            invokeWithDynamicDependencies
        }
    ];
    const fallbackInvoker = {
        invoke: invokeWithDynamicDependencies,
        invokeWithDynamicDependencies
    };
    return function (Type) {
        const dependencies = DI.getDependencies(Type);
        const invoker = classInvokers.length > dependencies.length ? classInvokers[dependencies.length] : fallbackInvoker;
        return new Factory(Type, invoker, dependencies);
    };
})();
const containerResolver = {
    resolve(handler, requestor) {
        return requestor;
    }
};
function isRegistry(obj) {
    return typeof obj.register === 'function';
}
function isClass(obj) {
    return obj.prototype !== void 0;
}
const nextContainerId = (function () {
    let id = 0;
    return function () {
        return ++id;
    };
})();
function isResourceKey(key) {
    return typeof key === 'string' && key.indexOf(':') > 0;
}
/** @internal */
export class Container {
    constructor(parent) {
        this.parent = parent;
        this.id = nextContainerId();
        this.registerDepth = 0;
        if (parent === null) {
            this.path = this.id.toString();
            this.root = this;
            this.resolvers = new Map();
            this.resourceResolvers = Object.create(null);
        }
        else {
            this.path = `${parent.path}.${this.id}`;
            this.root = parent.root;
            this.resolvers = new Map();
            this.resourceResolvers = Object.assign(Object.create(null), this.root.resourceResolvers);
        }
        this.resolvers.set(IContainer, containerResolver);
    }
    register(...params) {
        if (++this.registerDepth === 100) {
            throw new Error('Unable to autoregister dependency');
            // TODO: change to reporter.error and add various possible causes in description.
            // Most likely cause is trying to register a plain object that does not have a
            // register method and is not a class constructor
        }
        let current;
        let keys;
        let value;
        let j;
        let jj;
        for (let i = 0, ii = params.length; i < ii; ++i) {
            current = params[i];
            if (isRegistry(current)) {
                current.register(this);
            }
            else if (Protocol.resource.has(current)) {
                const defs = Protocol.resource.getAll(current);
                if (defs.length === 1) {
                    // Fast path for the very common case
                    defs[0].register(this);
                }
                else {
                    const len = defs.length;
                    for (let d = 0; d < len; ++d) {
                        defs[d].register(this);
                    }
                }
            }
            else if (isClass(current)) {
                Registration.singleton(current, current).register(this);
            }
            else {
                keys = Object.keys(current);
                j = 0;
                jj = keys.length;
                for (; j < jj; ++j) {
                    value = current[keys[j]];
                    // note: we could remove this if-branch and call this.register directly
                    // - the extra check is just a perf tweak to create fewer unnecessary arrays by the spread operator
                    if (isRegistry(value)) {
                        value.register(this);
                    }
                    else {
                        this.register(value);
                    }
                }
            }
        }
        --this.registerDepth;
        return this;
    }
    registerResolver(key, resolver) {
        validateKey(key);
        const resolvers = this.resolvers;
        const result = resolvers.get(key);
        if (result == null) {
            resolvers.set(key, resolver);
            if (isResourceKey(key)) {
                this.resourceResolvers[key] = resolver;
            }
        }
        else if (result instanceof Resolver && result.strategy === 4 /* array */) {
            result.state.push(resolver);
        }
        else {
            resolvers.set(key, new Resolver(key, 4 /* array */, [result, resolver]));
        }
        return resolver;
    }
    registerTransformer(key, transformer) {
        const resolver = this.getResolver(key);
        if (resolver == null) {
            return false;
        }
        if (resolver.getFactory) {
            const factory = resolver.getFactory(this);
            if (factory == null) {
                return false;
            }
            // This type cast is a bit of a hacky one, necessary due to the duplicity of IResolverLike.
            // Problem is that that interface's type arg can be of type Key, but the getFactory method only works on
            // type Constructable. So the return type of that optional method has this additional constraint, which
            // seems to confuse the type checker.
            return factory.registerTransformer(transformer);
        }
        return false;
    }
    getResolver(key, autoRegister = true) {
        validateKey(key);
        if (key.resolve !== void 0) {
            return key;
        }
        let current = this;
        let resolver;
        while (current != null) {
            resolver = current.resolvers.get(key);
            if (resolver == null) {
                if (current.parent == null) {
                    return autoRegister ? this.jitRegister(key, current) : null;
                }
                current = current.parent;
            }
            else {
                return resolver;
            }
        }
        return null;
    }
    has(key, searchAncestors = false) {
        return this.resolvers.has(key)
            ? true
            : searchAncestors && this.parent != null
                ? this.parent.has(key, true)
                : false;
    }
    get(key) {
        validateKey(key);
        if (key.resolve !== void 0) {
            return key.resolve(this, this);
        }
        let current = this;
        let resolver;
        while (current != null) {
            resolver = current.resolvers.get(key);
            if (resolver == null) {
                if (current.parent == null) {
                    resolver = this.jitRegister(key, current);
                    return resolver.resolve(current, this);
                }
                current = current.parent;
            }
            else {
                return resolver.resolve(current, this);
            }
        }
        throw new Error(`Unable to resolve key: ${key}`);
    }
    getAll(key) {
        validateKey(key);
        let current = this;
        let resolver;
        while (current != null) {
            resolver = current.resolvers.get(key);
            if (resolver == null) {
                if (this.parent == null) {
                    return PLATFORM.emptyArray;
                }
                current = current.parent;
            }
            else {
                return buildAllResponse(resolver, current, this);
            }
        }
        return PLATFORM.emptyArray;
    }
    getFactory(Type) {
        const key = Protocol.annotation.keyFor('di:factory');
        let factory = Metadata.getOwn(key, Type);
        if (factory === void 0) {
            Metadata.define(key, factory = createFactory(Type), Type);
            Protocol.annotation.appendTo(Type, key);
        }
        return factory;
    }
    createChild() {
        return new Container(this);
    }
    jitRegister(keyAsValue, handler) {
        if (typeof keyAsValue !== 'function') {
            throw new Error(`Attempted to jitRegister something that is not a constructor: '${keyAsValue}'. Did you forget to register this resource?`);
        }
        if (isRegistry(keyAsValue)) {
            const registrationResolver = keyAsValue.register(handler, keyAsValue);
            if (!(registrationResolver instanceof Object) || registrationResolver.resolve == null) {
                const newResolver = handler.resolvers.get(keyAsValue);
                if (newResolver != void 0) {
                    return newResolver;
                }
                throw Reporter.error(40); // did not return a valid resolver from the static register method
            }
            return registrationResolver;
        }
        else if (Protocol.resource.has(keyAsValue)) {
            const defs = Protocol.resource.getAll(keyAsValue);
            if (defs.length === 1) {
                // Fast path for the very common case
                defs[0].register(handler);
            }
            else {
                const len = defs.length;
                for (let d = 0; d < len; ++d) {
                    defs[d].register(handler);
                }
            }
            const newResolver = handler.resolvers.get(keyAsValue);
            if (newResolver != void 0) {
                return newResolver;
            }
            throw Reporter.error(40); // did not return a valid resolver from the static register method
        }
        else {
            const resolver = new Resolver(keyAsValue, 1 /* singleton */, keyAsValue);
            handler.resolvers.set(keyAsValue, resolver);
            return resolver;
        }
    }
}
/**
 * An implementation of IRegistry that delegates registration to a
 * separately registered class. The ParameterizedRegistry facilitates the
 * passing of parameters to the final registry.
 */
export class ParameterizedRegistry {
    constructor(key, params) {
        this.key = key;
        this.params = params;
    }
    register(container) {
        if (container.has(this.key, true)) {
            const registry = container.get(this.key);
            registry.register(container, ...this.params);
        }
        else {
            container.register(...this.params.filter(x => typeof x === 'object'));
        }
    }
}
export const Registration = Object.freeze({
    instance(key, value) {
        return new Resolver(key, 0 /* instance */, value);
    },
    singleton(key, value) {
        return new Resolver(key, 1 /* singleton */, value);
    },
    transient(key, value) {
        return new Resolver(key, 2 /* transient */, value);
    },
    callback(key, callback) {
        return new Resolver(key, 3 /* callback */, callback);
    },
    alias(originalKey, aliasKey) {
        return new Resolver(aliasKey, 5 /* alias */, originalKey);
    },
    defer(key, ...params) {
        return new ParameterizedRegistry(key, params);
    }
});
export class InstanceProvider {
    constructor() {
        this.instance = null;
    }
    prepare(instance) {
        this.instance = instance;
    }
    resolve(handler, requestor) {
        if (this.instance === undefined) { // unmet precondition: call prepare
            throw Reporter.error(50); // TODO: organize error codes
        }
        return this.instance;
    }
    dispose() {
        this.instance = null;
    }
}
/** @internal */
export function validateKey(key) {
    // note: design:paramTypes which will default to Object if the param types cannot be statically analyzed by tsc
    // this check is intended to properly report on that problem - under no circumstance should Object be a valid key anyway
    if (key == null || key === Object) {
        throw Reporter.error(5);
    }
}
function buildAllResponse(resolver, handler, requestor) {
    if (resolver instanceof Resolver && resolver.strategy === 4 /* array */) {
        const state = resolver.state;
        let i = state.length;
        const results = new Array(i);
        while (i--) {
            results[i] = state[i].resolve(handler, requestor);
        }
        return results;
    }
    return [resolver.resolve(handler, requestor)];
}
//# sourceMappingURL=di.js.map