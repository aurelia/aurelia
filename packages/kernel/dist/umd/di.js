(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "@aurelia/metadata", "./functions", "./platform", "./reporter", "./resource"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const metadata_1 = require("@aurelia/metadata");
    metadata_1.applyMetadataPolyfill(Reflect);
    const functions_1 = require("./functions");
    const platform_1 = require("./platform");
    const reporter_1 = require("./reporter");
    const resource_1 = require("./resource");
    class ResolverBuilder {
        constructor(container, key) {
            this.container = container;
            this.key = key;
        }
        instance(value) {
            return this.registerResolver(0 /* instance */, value);
        }
        singleton(value) {
            return this.registerResolver(1 /* singleton */, value);
        }
        transient(value) {
            return this.registerResolver(2 /* transient */, value);
        }
        callback(value) {
            return this.registerResolver(3 /* callback */, value);
        }
        cachedCallback(value) {
            return this.registerResolver(3 /* callback */, cacheCallbackResult(value));
        }
        aliasTo(destinationKey) {
            return this.registerResolver(5 /* alias */, destinationKey);
        }
        registerResolver(strategy, state) {
            const { container, key } = this;
            this.container = this.key = (void 0);
            return container.registerResolver(key, new Resolver(key, strategy, state));
        }
    }
    exports.ResolverBuilder = ResolverBuilder;
    function cloneArrayWithPossibleProps(source) {
        const clone = source.slice();
        const keys = Object.keys(source);
        const len = keys.length;
        let key;
        for (let i = 0; i < len; ++i) {
            key = keys[i];
            if (!functions_1.isArrayIndex(key)) {
                clone[key] = source[key];
            }
        }
        return clone;
    }
    exports.DefaultResolver = {
        none(key) { throw Error(`${key.toString()} not registered, did you forget to add @singleton()?`); },
        singleton(key) { return new Resolver(key, 1 /* singleton */, key); },
        transient(key) { return new Resolver(key, 2 /* transient */, key); },
    };
    exports.DefaultContainerConfiguration = {
        jitRegisterInRoot: true,
        defaultResolver: exports.DefaultResolver.singleton,
    };
    exports.DI = {
        createContainer(config = exports.DefaultContainerConfiguration) {
            return new Container(null, config);
        },
        getDesignParamtypes(Type) {
            return metadata_1.Metadata.getOwn('design:paramtypes', Type);
        },
        getAnnotationParamtypes(Type) {
            const key = resource_1.Protocol.annotation.keyFor('di:paramtypes');
            return metadata_1.Metadata.getOwn(key, Type);
        },
        getOrCreateAnnotationParamTypes(Type) {
            const key = resource_1.Protocol.annotation.keyFor('di:paramtypes');
            let annotationParamtypes = metadata_1.Metadata.getOwn(key, Type);
            if (annotationParamtypes === void 0) {
                metadata_1.Metadata.define(key, annotationParamtypes = [], Type);
                resource_1.Protocol.annotation.appendTo(Type, key);
            }
            return annotationParamtypes;
        },
        getDependencies(Type) {
            // Note: Every detail of this getDependencies method is pretty deliberate at the moment, and probably not yet 100% tested from every possible angle,
            // so be careful with making changes here as it can have a huge impact on complex end user apps.
            // Preferably, only make changes to the dependency resolution process via a RFC.
            const key = resource_1.Protocol.annotation.keyFor('di:dependencies');
            let dependencies = metadata_1.Metadata.getOwn(key, Type);
            if (dependencies === void 0) {
                // Type.length is the number of constructor parameters. If this is 0, it could mean the class has an empty constructor
                // but it could also mean the class has no constructor at all (in which case it inherits the constructor from the prototype).
                // Non-zero constructor length + no paramtypes means emitDecoratorMetadata is off, or the class has no decorator.
                // We're not doing anything with the above right now, but it's good to keep in mind for any future issues.
                const inject = Type.inject;
                if (inject === void 0) {
                    // design:paramtypes is set by tsc when emitDecoratorMetadata is enabled.
                    const designParamtypes = exports.DI.getDesignParamtypes(Type);
                    // au:annotation:di:paramtypes is set by the parameter decorator from DI.createInterface or by @inject
                    const annotationParamtypes = exports.DI.getAnnotationParamtypes(Type);
                    if (designParamtypes === void 0) {
                        if (annotationParamtypes === void 0) {
                            // Only go up the prototype if neither static inject nor any of the paramtypes is defined, as
                            // there is no sound way to merge a type's deps with its prototype's deps
                            const Proto = Object.getPrototypeOf(Type);
                            if (typeof Proto === 'function' && Proto !== Function.prototype) {
                                dependencies = cloneArrayWithPossibleProps(exports.DI.getDependencies(Proto));
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
                            if (!functions_1.isArrayIndex(key)) {
                                dependencies[key] = annotationParamtypes[key];
                            }
                        }
                    }
                }
                else {
                    // Ignore paramtypes if we have static inject
                    dependencies = cloneArrayWithPossibleProps(inject);
                }
                metadata_1.Metadata.define(key, dependencies, Type);
                resource_1.Protocol.annotation.appendTo(Type, key);
            }
            return dependencies;
        },
        /**
         * creates a decorator that also matches an interface and can be used as a {@linkcode Key}.
         * ```ts
         * const ILogger = DI.createInterface<Logger>('Logger').noDefault();
         * container.register(Registration.singleton(ILogger, getSomeLogger()));
         * const log = container.get(ILogger);
         * log.info('hello world');
         * class Foo {
         *   constructor( @ILogger log: ILogger ) {
         *     log.info('hello world');
         *   }
         * }
         * ```
         * you can also build default registrations into your interface.
         * ```ts
         * export const ILogger = DI.createInterface<Logger>('Logger')
         *        .withDefault( builder => builder.cachedCallback(LoggerDefault));
         * const log = container.get(ILogger);
         * log.info('hello world');
         * class Foo {
         *   constructor( @ILogger log: ILogger ) {
         *     log.info('hello world');
         *   }
         * }
         * ```
         * but these default registrations won't work the same with other decorators that take keys, for example
         * ```ts
         * export const MyStr = DI.createInterface<string>('MyStr')
         *        .withDefault( builder => builder.instance('somestring'));
         * class Foo {
         *   constructor( @optional(MyStr) public readonly str: string ) {
         *   }
         * }
         * container.get(Foo).str; // returns undefined
         * ```
         * to fix this add this line somewhere before you do a `get`
         * ```ts
         * container.register(MyStr);
         * container.get(Foo).str; // returns 'somestring'
         * ```
         *
         * - @param friendlyName used to improve error messaging
         */
        createInterface(friendlyName) {
            const Interface = function (target, property, index) {
                if (target == null || new.target !== undefined) {
                    throw new Error(`No registration for interface: '${Interface.friendlyName}'`); // TODO: add error (trying to resolve an InterfaceSymbol that has no registrations)
                }
                const annotationParamtypes = exports.DI.getOrCreateAnnotationParamTypes(target);
                annotationParamtypes[index] = Interface;
                return target;
            };
            Interface.$isInterface = true;
            Interface.friendlyName = friendlyName == null ? 'Interface' : friendlyName;
            Interface.noDefault = function () {
                return Interface;
            };
            Interface.withDefault = function (configure) {
                Interface.withDefault = function () {
                    throw reporter_1.Reporter.error(17, Interface);
                };
                Interface.register = function (container, key) {
                    return configure(new ResolverBuilder(container, key !== null && key !== void 0 ? key : Interface));
                };
                return Interface;
            };
            return Interface;
        },
        inject(...dependencies) {
            return function (target, key, descriptor) {
                if (typeof descriptor === 'number') { // It's a parameter decorator.
                    const annotationParamtypes = exports.DI.getOrCreateAnnotationParamTypes(target);
                    const dep = dependencies[0];
                    if (dep !== void 0) {
                        annotationParamtypes[descriptor] = dep;
                    }
                }
                else if (key) { // It's a property decorator. Not supported by the container without plugins.
                    const annotationParamtypes = exports.DI.getOrCreateAnnotationParamTypes(target.constructor);
                    const dep = dependencies[0];
                    if (dep !== void 0) {
                        annotationParamtypes[key] = dep;
                    }
                }
                else if (descriptor) { // It's a function decorator (not a Class constructor)
                    const fn = descriptor.value;
                    const annotationParamtypes = exports.DI.getOrCreateAnnotationParamTypes(fn);
                    let dep;
                    for (let i = 0; i < dependencies.length; ++i) {
                        dep = dependencies[i];
                        if (dep !== void 0) {
                            annotationParamtypes[i] = dep;
                        }
                    }
                }
                else { // It's a class decorator.
                    const annotationParamtypes = exports.DI.getOrCreateAnnotationParamTypes(target);
                    let dep;
                    for (let i = 0; i < dependencies.length; ++i) {
                        dep = dependencies[i];
                        if (dep !== void 0) {
                            annotationParamtypes[i] = dep;
                        }
                    }
                }
            };
        },
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
        transient(target) {
            target.register = function register(container) {
                const registration = exports.Registration.transient(target, target);
                return registration.register(container, target);
            };
            return target;
        },
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
        singleton(target) {
            target.register = function register(container) {
                const registration = exports.Registration.singleton(target, target);
                return registration.register(container, target);
            };
            return target;
        },
    };
    exports.IContainer = exports.DI.createInterface('IContainer').noDefault();
    exports.IServiceLocator = exports.IContainer;
    function createResolver(getter) {
        return function (key) {
            const resolver = function (target, property, descriptor) {
                exports.DI.inject(resolver)(target, property, descriptor);
            };
            resolver.$isResolver = true;
            resolver.resolve = function (handler, requestor) {
                return getter(key, handler, requestor);
            };
            return resolver;
        };
    }
    exports.inject = exports.DI.inject;
    function transientDecorator(target) {
        return exports.DI.transient(target);
    }
    function transient(target) {
        return target == null ? transientDecorator : transientDecorator(target);
    }
    exports.transient = transient;
    function singletonDecorator(target) {
        return exports.DI.singleton(target);
    }
    function singleton(target) {
        return target == null ? singletonDecorator : singletonDecorator(target);
    }
    exports.singleton = singleton;
    exports.all = createResolver((key, handler, requestor) => requestor.getAll(key));
    /**
     * Lazily inject a dependency depending on whether the [[`Key`]] is present at the time of function call.
     *
     * You need to make your argument a function that returns the type, for example
     * ```ts
     * class Foo {
     *   constructor( @lazy('random') public random: () => number )
     * }
     * const foo = container.get(Foo); // instanceof Foo
     * foo.random(); // throws
     * ```
     * would throw an exception because you haven't registered `'random'` before calling the method. This, would give you a
     * new [['Math.random()']] number each time.
     * ```ts
     * class Foo {
     *   constructor( @lazy('random') public random: () => random )
     * }
     * container.register(Registration.callback('random', Math.random ));
     * container.get(Foo).random(); // some random number
     * container.get(Foo).random(); // another random number
     * ```
     * `@lazy` does not manage the lifecycle of the underlying key. If you want a singleton, you have to register as a
     * `singleton`, `transient` would also behave as you would expect, providing you a new instance each time.
     *
     * - @param key [[`Key`]]
     * see { @link DI.createInterface } on interactions with interfaces
     */
    exports.lazy = createResolver((key, handler, requestor) => {
        return () => requestor.get(key);
    });
    /**
     * Allows you to optionally inject a dependency depending on whether the [[`Key`]] is present, for example
     * ```ts
     * class Foo {
     *   constructor( @inject('mystring') public str: string = 'somestring' )
     * }
     * container.get(Foo); // throws
     * ```
     * would fail
     * ```ts
     * class Foo {
     *   constructor( @optional('mystring') public str: string = 'somestring' )
     * }
     * container.get(Foo).str // somestring
     * ```
     * if you use it without a default it will inject `undefined`, so rember to mark your input type as
     * possibly `undefined`!
     *
     * - @param key: [[`Key`]]
     *
     * see { @link DI.createInterface } on interactions with interfaces
     */
    exports.optional = createResolver((key, handler, requestor) => {
        if (requestor.has(key, true)) {
            return requestor.get(key);
        }
        else {
            return undefined;
        }
    });
    /**
     * ignore tells the container not to try to inject a dependency
     */
    function ignore(target, property, descriptor) {
        exports.DI.inject(ignore)(target, property, descriptor);
    }
    exports.ignore = ignore;
    ignore.$isResolver = true;
    ignore.resolve = () => undefined;
    exports.newInstanceForScope = createResolver((key, handler, requestor) => {
        const instance = createNewInstance(key, handler);
        const instanceProvider = new InstanceProvider();
        instanceProvider.prepare(instance);
        requestor.registerResolver(key, instanceProvider, true);
        return instance;
    });
    exports.newInstanceOf = createResolver((key, handler, _requestor) => createNewInstance(key, handler));
    function createNewInstance(key, handler) {
        const factory = handler.getFactory(key);
        if (factory === null) {
            throw new Error(`No factory registered for ${key}`);
        }
        return factory.construct(handler);
    }
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
            this.resolving = false;
        }
        get $isResolver() { return true; }
        register(container, key) {
            return container.registerResolver(key || this.key, this);
        }
        resolve(handler, requestor) {
            switch (this.strategy) {
                case 0 /* instance */:
                    return this.state;
                case 1 /* singleton */: {
                    if (this.resolving) {
                        throw new Error(`Cyclic dependency found: ${this.state.name}`);
                    }
                    this.resolving = true;
                    const factory = handler.getFactory(this.state);
                    if (factory === null) {
                        throw new Error(`Resolver for ${String(this.key)} returned a null factory`);
                    }
                    this.state = factory.construct(requestor);
                    this.strategy = 0 /* instance */;
                    this.resolving = false;
                    return this.state;
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
    const createFactory = (function () {
        function invokeWithDynamicDependencies(container, Type, staticDependencies, dynamicDependencies) {
            let i = staticDependencies.length;
            let args = new Array(i);
            let lookup;
            while (i-- > 0) {
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
            if (functions_1.isNativeFunction(Type)) {
                reporter_1.Reporter.write(5, Type.name);
            }
            const dependencies = exports.DI.getDependencies(Type);
            const invoker = classInvokers.length > dependencies.length ? classInvokers[dependencies.length] : fallbackInvoker;
            return new Factory(Type, invoker, dependencies);
        };
    })();
    const containerResolver = {
        $isResolver: true,
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
    function isResourceKey(key) {
        return typeof key === 'string' && key.indexOf(':') > 0;
    }
    const InstrinsicTypeNames = new Set([
        'Array',
        'ArrayBuffer',
        'Boolean',
        'DataView',
        'Date',
        'Error',
        'EvalError',
        'Float32Array',
        'Float64Array',
        'Function',
        'Int8Array',
        'Int16Array',
        'Int32Array',
        'Map',
        'Number',
        'Object',
        'Promise',
        'RangeError',
        'ReferenceError',
        'RegExp',
        'Set',
        'SharedArrayBuffer',
        'String',
        'SyntaxError',
        'TypeError',
        'Uint8Array',
        'Uint8ClampedArray',
        'Uint16Array',
        'Uint32Array',
        'URIError',
        'WeakMap',
        'WeakSet',
    ]);
    /** @internal */
    class Container {
        constructor(parent, config = exports.DefaultContainerConfiguration) {
            this.parent = parent;
            this.config = config;
            this.registerDepth = 0;
            this.disposableResolvers = new Set();
            if (parent === null) {
                this.root = this;
                this.resolvers = new Map();
                this.resourceResolvers = Object.create(null);
            }
            else {
                this.root = parent.root;
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
                if (!metadata_1.isObject(current)) {
                    continue;
                }
                if (isRegistry(current)) {
                    current.register(this);
                }
                else if (resource_1.Protocol.resource.has(current)) {
                    const defs = resource_1.Protocol.resource.getAll(current);
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
                    exports.Registration.singleton(current, current).register(this);
                }
                else {
                    keys = Object.keys(current);
                    j = 0;
                    jj = keys.length;
                    for (; j < jj; ++j) {
                        value = current[keys[j]];
                        if (!metadata_1.isObject(value)) {
                            continue;
                        }
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
        registerResolver(key, resolver, isDisposable = false) {
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
            if (isDisposable) {
                this.disposableResolvers.add(resolver);
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
                        const handler = this.config.jitRegisterInRoot ? current : this;
                        return autoRegister ? this.jitRegister(key, handler) : null;
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
            if (key.$isResolver) {
                return key.resolve(this, this);
            }
            let current = this;
            let resolver;
            while (current != null) {
                resolver = current.resolvers.get(key);
                if (resolver == null) {
                    if (current.parent == null) {
                        const handler = this.config.jitRegisterInRoot ? current : this;
                        resolver = this.jitRegister(key, handler);
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
        getFactory(Type) {
            const key = resource_1.Protocol.annotation.keyFor('di:factory');
            let factory = metadata_1.Metadata.getOwn(key, Type);
            if (factory === void 0) {
                metadata_1.Metadata.define(key, factory = createFactory(Type), Type);
                resource_1.Protocol.annotation.appendTo(Type, key);
            }
            return factory;
        }
        createChild(config) {
            return new Container(this, config !== null && config !== void 0 ? config : this.config);
        }
        disposeResolvers() {
            var _a;
            const disposables = Array.from(this.disposableResolvers);
            while (disposables.length > 0) {
                (_a = disposables.pop()) === null || _a === void 0 ? void 0 : _a.dispose();
            }
        }
        jitRegister(keyAsValue, handler) {
            if (typeof keyAsValue !== 'function') {
                throw new Error(`Attempted to jitRegister something that is not a constructor: '${keyAsValue}'. Did you forget to register this resource?`);
            }
            if (InstrinsicTypeNames.has(keyAsValue.name)) {
                throw new Error(`Attempted to jitRegister an intrinsic type: ${keyAsValue.name}. Did you forget to add @inject(Key)`);
            }
            if (isRegistry(keyAsValue)) {
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
            else if (resource_1.Protocol.resource.has(keyAsValue)) {
                const defs = resource_1.Protocol.resource.getAll(keyAsValue);
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
                throw reporter_1.Reporter.error(40); // did not return a valid resolver from the static register method
            }
            else if (keyAsValue.$isInterface) {
                throw new Error(`Attempted to jitRegister an interface: ${keyAsValue.friendlyName}`);
            }
            else {
                const resolver = this.config.defaultResolver(keyAsValue, handler);
                handler.resolvers.set(keyAsValue, resolver);
                return resolver;
            }
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
    const cache = new WeakMap();
    function cacheCallbackResult(fun) {
        return function (handler, requestor, resolver) {
            if (cache.has(resolver)) {
                return cache.get(resolver);
            }
            const t = fun(handler, requestor, resolver);
            cache.set(resolver, t);
            return t;
        };
    }
    /**
     * you can use the resulting {@linkcode IRegistration} of any of the factory methods
     * to register with the container, e.g.
     * ```
     * class Foo {}
     * const container = DI.createContainer();
     * container.register(Registration.instance(Foo, new Foo()));
     * container.get(Foo);
     * ```
     */
    exports.Registration = {
        /**
         * allows you to pass an instance.
         * Every time you request this {@linkcode Key} you will get this instance back.
         * ```
         * Registration.instance(Foo, new Foo()));
         * ```
         *
         * @param key
         * @param value
         */
        instance(key, value) {
            return new Resolver(key, 0 /* instance */, value);
        },
        /**
         * Creates an instance from the class.
         * Every time you request this {@linkcode Key} you will get the same one back.
         * ```
         * Registration.singleton(Foo, Foo);
         * ```
         *
         * @param key
         * @param value
         */
        singleton(key, value) {
            return new Resolver(key, 1 /* singleton */, value);
        },
        /**
         * Creates an instance from a class.
         * Every time you request this {@linkcode Key} you will get a new instance.
         * ```
         * Registration.instance(Foo, Foo);
         * ```
         *
         * @param key
         * @param value
         */
        transient(key, value) {
            return new Resolver(key, 2 /* transient */, value);
        },
        /**
         * Creates an instance from the method passed.
         * Every time you request this {@linkcode Key} you will get a new instance.
         * ```
         * Registration.callback(Foo, () => new Foo());
         * Registration.callback(Bar, (c: IContainer) => new Bar(c.get(Foo)));
         * ```
         *
         * @param key
         * @param callback
         */
        callback(key, callback) {
            return new Resolver(key, 3 /* callback */, callback);
        },
        /**
         * Creates an instance from the method passed.
         * On the first request for the {@linkcode Key} your callback is called and returns an instance.
         * subsequent requests for the {@linkcode Key}, the initial instance returned will be returned.
         * If you pass the same {@linkcode Registration} to another container the same cached value will be used.
         * Should all references to the resolver returned be removed, the cache will expire.
         * ```
         * Registration.cachedCallback(Foo, () => new Foo());
         * Registration.cachedCallback(Bar, (c: IContainer) => new Bar(c.get(Foo)));
         * ```
         *
         * @param key
         * @param callback
         */
        cachedCallback(key, callback) {
            return new Resolver(key, 3 /* callback */, cacheCallbackResult(callback));
        },
        /**
         * creates an alternate {@linkcode Key} to retrieve an instance by.
         * Returns the same scope as the original {@linkcode Key}.
         * ```
         * Register.singleton(Foo, Foo)
         * Register.aliasTo(Foo, MyFoos);
         *
         * container.getAll(MyFoos) // contains an instance of Foo
         * ```
         *
         * @param originalKey
         * @param aliasKey
         */
        aliasTo(originalKey, aliasKey) {
            return new Resolver(aliasKey, 5 /* alias */, originalKey);
        },
        /**
         * @internal
         * @param key
         * @param params
         */
        defer(key, ...params) {
            return new ParameterizedRegistry(key, params);
        }
    };
    class InstanceProvider {
        constructor() {
            this.instance = null;
        }
        prepare(instance) {
            this.instance = instance;
        }
        get $isResolver() { return true; }
        resolve() {
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
        if (key === null || key === void 0) {
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
});
//# sourceMappingURL=di.js.map