(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "./platform", "./reporter"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const platform_1 = require("./platform");
    const reporter_1 = require("./reporter");
    /* eslint-disable @typescript-eslint/no-explicit-any */
    const slice = Array.prototype.slice;
    // Shims to augment the Reflect object with methods used from the Reflect Metadata API proposal:
    // https://www.typescriptlang.org/docs/handbook/decorators.html#metadata
    // https://rbuckton.github.io/reflect-metadata/
    // As the official spec proposal uses "any", we use it here as well and suppress related typedef linting warnings.
    if (!('getOwnMetadata' in Reflect)) {
        /* eslint-disable @typescript-eslint/ban-types */
        Reflect.getOwnMetadata = function (metadataKey, target) {
            return target[metadataKey];
        };
        Reflect.metadata = function (metadataKey, metadataValue) {
            return function (target) {
                target[metadataKey] = metadataValue;
            };
        };
    }
    const hasOwnProperty = platform_1.PLATFORM.hasOwnProperty;
    class DI {
        constructor() { return; }
        static createContainer(...params) {
            if (params.length === 0) {
                return new Container(null);
            }
            else {
                return new Container(null).register(...params);
            }
        }
        static getDesignParamTypes(target) {
            const paramTypes = Reflect.getOwnMetadata('design:paramtypes', target);
            if (paramTypes == null) {
                return platform_1.PLATFORM.emptyArray;
            }
            return paramTypes;
        }
        static getDependencies(Type) {
            let dependencies;
            if (Type.inject == null) {
                dependencies = DI.getDesignParamTypes(Type);
            }
            else {
                dependencies = [];
                let ctor = Type;
                while (typeof ctor === 'function') {
                    if (hasOwnProperty.call(ctor, 'inject')) {
                        dependencies.push(...ctor.inject);
                    }
                    ctor = Object.getPrototypeOf(ctor);
                }
            }
            return dependencies;
        }
        static createInterface(friendlyName) {
            const Interface = function (target, property, index) {
                if (target == null) {
                    throw reporter_1.Reporter.error(16, Interface.friendlyName, Interface); // TODO: add error (trying to resolve an InterfaceSymbol that has no registrations)
                }
                if (target.inject == null) {
                    target.inject = [];
                }
                target.inject[index] = Interface;
                return target;
            };
            Interface.friendlyName = friendlyName == null ? 'Interface' : friendlyName;
            Interface.noDefault = function () {
                return Interface;
            };
            Interface.withDefault = function (configure) {
                Interface.withDefault = function () {
                    throw reporter_1.Reporter.error(17, Interface);
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
                    if (!hasOwnProperty.call(target, 'inject')) {
                        const types = DI.getDesignParamTypes(target);
                        target.inject = types.slice();
                    }
                    if (dependencies.length === 1) {
                        // We know for sure that it's not void 0 due to the above check.
                        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                        target.inject[descriptor] = dependencies[0];
                    }
                }
                else if (key) { // It's a property decorator. Not supported by the container without plugins.
                    const actualTarget = target.constructor;
                    if (actualTarget.inject == null) {
                        actualTarget.inject = [];
                    }
                    actualTarget.inject[key] = dependencies[0];
                }
                else if (descriptor) { // It's a function decorator (not a Class constructor)
                    const fn = descriptor.value;
                    fn.inject = dependencies;
                }
                else { // It's a class decorator.
                    if (dependencies.length === 0) {
                        const types = DI.getDesignParamTypes(target);
                        target.inject = types.slice();
                    }
                    else {
                        target.inject = dependencies;
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
                const registration = exports.Registration.transient(target, target);
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
                const registration = exports.Registration.singleton(target, target);
                return registration.register(container, target);
            };
            return target;
        }
    }
    exports.DI = DI;
    exports.IContainer = DI.createInterface('IContainer').noDefault();
    exports.IServiceLocator = exports.IContainer;
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
    exports.inject = DI.inject;
    function transientDecorator(target) {
        return DI.transient(target);
    }
    function transient(target) {
        return target == null ? transientDecorator : transientDecorator(target);
    }
    exports.transient = transient;
    function singletonDecorator(target) {
        return DI.singleton(target);
    }
    function singleton(target) {
        return target == null ? singletonDecorator : singletonDecorator(target);
    }
    exports.singleton = singleton;
    exports.all = createResolver((key, handler, requestor) => requestor.getAll(key));
    exports.lazy = createResolver((key, handler, requestor) => {
        let instance = null; // cache locally so that lazy always returns the same instance once resolved
        return () => {
            if (instance == null) {
                instance = requestor.get(key);
            }
            return instance;
        };
    });
    exports.optional = createResolver((key, handler, requestor) => {
        if (requestor.has(key, true)) {
            return requestor.get(key);
        }
        else {
            return null;
        }
    });
    /** @internal */
    var ResolverStrategy;
    (function (ResolverStrategy) {
        ResolverStrategy[ResolverStrategy["instance"] = 0] = "instance";
        ResolverStrategy[ResolverStrategy["singleton"] = 1] = "singleton";
        ResolverStrategy[ResolverStrategy["transient"] = 2] = "transient";
        ResolverStrategy[ResolverStrategy["callback"] = 3] = "callback";
        ResolverStrategy[ResolverStrategy["array"] = 4] = "array";
        ResolverStrategy[ResolverStrategy["alias"] = 5] = "alias";
    })(ResolverStrategy = exports.ResolverStrategy || (exports.ResolverStrategy = {}));
    /** @internal */
    class Resolver {
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
                    return this.state = factory.construct(handler);
                }
                case 2 /* transient */: {
                    // Always create transients from the requesting container
                    const factory = handler.getFactory(this.state);
                    return factory.construct(requestor);
                }
                case 3 /* callback */:
                    return this.state(handler, requestor, this);
                case 4 /* array */:
                    return this.state[0].resolve(handler, requestor);
                case 5 /* alias */:
                    return handler.get(this.state);
                default:
                    throw reporter_1.Reporter.error(6, this.strategy);
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
    exports.Resolver = Resolver;
    /** @internal */
    class Factory {
        constructor(Type, invoker, dependencies) {
            this.Type = Type;
            this.invoker = invoker;
            this.dependencies = dependencies;
            this.transformers = null;
        }
        static create(Type) {
            const dependencies = DI.getDependencies(Type);
            const invoker = exports.classInvokers.length > dependencies.length ? exports.classInvokers[dependencies.length] : exports.fallbackInvoker;
            return new Factory(Type, invoker, dependencies);
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
    exports.Factory = Factory;
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
    class Container {
        constructor(parent) {
            this.parent = parent;
            this.id = nextContainerId();
            this.registerDepth = 0;
            if (parent === null) {
                this.root = this;
                this.factories = new Map();
                this.resolvers = new Map();
                this.resourceResolvers = Object.create(null);
            }
            else {
                this.root = parent.root;
                this.factories = new Map(parent.factories);
                this.resolvers = new Map();
                this.resourceResolvers = Object.assign(Object.create(null), this.root.resourceResolvers);
            }
            this.resolvers.set(exports.IContainer, containerResolver);
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
                else if (isClass(current)) {
                    exports.Registration.singleton(current, current).register(this);
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
                        return platform_1.PLATFORM.emptyArray;
                    }
                    current = current.parent;
                }
                else {
                    return buildAllResponse(resolver, current, this);
                }
            }
            return platform_1.PLATFORM.emptyArray;
        }
        getFactory(key) {
            let factory = this.factories.get(key);
            if (factory == null) {
                this.factories.set(key, factory = Factory.create(key));
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
            if (keyAsValue.register !== void 0) {
                const registrationResolver = keyAsValue.register(handler, keyAsValue);
                if (!(registrationResolver instanceof Object) || registrationResolver.resolve == null) {
                    const newResolver = handler.resolvers.get(keyAsValue);
                    if (newResolver != void 0) {
                        return newResolver;
                    }
                    throw reporter_1.Reporter.error(40); // did not return a valid resolver from the static register method
                }
                return registrationResolver;
            }
            const resolver = new Resolver(keyAsValue, 1 /* singleton */, keyAsValue);
            handler.resolvers.set(keyAsValue, resolver);
            return resolver;
        }
    }
    exports.Container = Container;
    /**
     * An implementation of IRegistry that delegates registration to a
     * separately registered class. The ParameterizedRegistry facilitates the
     * passing of parameters to the final registry.
     */
    class ParameterizedRegistry {
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
    exports.ParameterizedRegistry = ParameterizedRegistry;
    exports.Registration = Object.freeze({
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
    class InstanceProvider {
        constructor() {
            this.instance = null;
        }
        prepare(instance) {
            this.instance = instance;
        }
        resolve(handler, requestor) {
            if (this.instance === undefined) { // unmet precondition: call prepare
                throw reporter_1.Reporter.error(50); // TODO: organize error codes
            }
            return this.instance;
        }
        dispose() {
            this.instance = null;
        }
    }
    exports.InstanceProvider = InstanceProvider;
    /** @internal */
    function validateKey(key) {
        // note: design:paramTypes which will default to Object if the param types cannot be statically analyzed by tsc
        // this check is intended to properly report on that problem - under no circumstance should Object be a valid key anyway
        if (key == null || key === Object) {
            throw reporter_1.Reporter.error(5);
        }
    }
    exports.validateKey = validateKey;
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
    /** @internal */
    exports.classInvokers = [
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
    /** @internal */
    exports.fallbackInvoker = {
        invoke: invokeWithDynamicDependencies,
        invokeWithDynamicDependencies
    };
    /** @internal */
    function invokeWithDynamicDependencies(container, Type, staticDependencies, dynamicDependencies) {
        let i = staticDependencies.length;
        let args = new Array(i);
        let lookup;
        while (i--) {
            lookup = staticDependencies[i];
            if (lookup == null) {
                throw reporter_1.Reporter.error(7, `Index ${i}.`);
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
    exports.invokeWithDynamicDependencies = invokeWithDynamicDependencies;
});
//# sourceMappingURL=di.js.map