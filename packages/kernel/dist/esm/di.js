import { Metadata, isObject, applyMetadataPolyfill } from '@aurelia/metadata';
applyMetadataPolyfill(Reflect);
import { isArrayIndex, isNativeFunction } from './functions.js';
import { emptyArray } from './platform.js';
import { Protocol } from './resource.js';
export class ResolverBuilder {
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
function cloneArrayWithPossibleProps(source) {
    const clone = source.slice();
    const keys = Object.keys(source);
    const len = keys.length;
    let key;
    for (let i = 0; i < len; ++i) {
        key = keys[i];
        if (!isArrayIndex(key)) {
            clone[key] = source[key];
        }
    }
    return clone;
}
export const DefaultResolver = {
    none(key) { throw Error(`${key.toString()} not registered, did you forget to add @singleton()?`); },
    singleton(key) { return new Resolver(key, 1 /* singleton */, key); },
    transient(key) { return new Resolver(key, 2 /* transient */, key); },
};
export class ContainerConfiguration {
    constructor(inheritParentResources, defaultResolver) {
        this.inheritParentResources = inheritParentResources;
        this.defaultResolver = defaultResolver;
    }
    static from(config) {
        var _a, _b;
        if (config === void 0 ||
            config === ContainerConfiguration.DEFAULT) {
            return ContainerConfiguration.DEFAULT;
        }
        return new ContainerConfiguration((_a = config.inheritParentResources) !== null && _a !== void 0 ? _a : false, (_b = config.defaultResolver) !== null && _b !== void 0 ? _b : DefaultResolver.singleton);
    }
}
ContainerConfiguration.DEFAULT = ContainerConfiguration.from({});
export const DI = {
    createContainer(config) {
        return new Container(null, ContainerConfiguration.from(config));
    },
    getDesignParamtypes(Type) {
        return Metadata.getOwn('design:paramtypes', Type);
    },
    getAnnotationParamtypes(Type) {
        const key = Protocol.annotation.keyFor('di:paramtypes');
        return Metadata.getOwn(key, Type);
    },
    getOrCreateAnnotationParamTypes(Type) {
        const key = Protocol.annotation.keyFor('di:paramtypes');
        let annotationParamtypes = Metadata.getOwn(key, Type);
        if (annotationParamtypes === void 0) {
            Metadata.define(key, annotationParamtypes = [], Type);
            Protocol.annotation.appendTo(Type, key);
        }
        return annotationParamtypes;
    },
    getDependencies(Type) {
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
                        if (!isArrayIndex(key)) {
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
    },
    /**
     * creates a decorator that also matches an interface and can be used as a {@linkcode Key}.
     * ```ts
     * const ILogger = DI.createInterface<Logger>('Logger');
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
     * export const ILogger = DI.createInterface<Logger>('Logger', builder => builder.cachedCallback(LoggerDefault));
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
     * export const MyStr = DI.createInterface<string>('MyStr', builder => builder.instance('somestring'));
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
    createInterface(configureOrName, configuror) {
        const configure = typeof configureOrName === 'function' ? configureOrName : configuror;
        const friendlyName = typeof configureOrName === 'string' ? configureOrName : undefined;
        const Interface = function (target, property, index) {
            if (target == null || new.target !== undefined) {
                throw new Error(`No registration for interface: '${Interface.friendlyName}'`); // TODO: add error (trying to resolve an InterfaceSymbol that has no registrations)
            }
            const annotationParamtypes = DI.getOrCreateAnnotationParamTypes(target);
            annotationParamtypes[index] = Interface;
        };
        Interface.$isInterface = true;
        Interface.friendlyName = friendlyName == null ? '(anonymous)' : friendlyName;
        if (configure != null) {
            Interface.register = function (container, key) {
                return configure(new ResolverBuilder(container, key !== null && key !== void 0 ? key : Interface));
            };
        }
        Interface.toString = function toString() {
            return `InterfaceSymbol<${Interface.friendlyName}>`;
        };
        return Interface;
    },
    inject(...dependencies) {
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
            const registration = Registration.transient(target, target);
            return registration.register(container, target);
        };
        target.registerInRequestor = false;
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
    singleton(target, options = defaultSingletonOptions) {
        target.register = function register(container) {
            const registration = Registration.singleton(target, target);
            return registration.register(container, target);
        };
        target.registerInRequestor = options.scoped;
        return target;
    },
};
export const IContainer = DI.createInterface('IContainer');
export const IServiceLocator = IContainer;
function createResolver(getter) {
    return function (key) {
        const resolver = function (target, property, descriptor) {
            DI.inject(resolver)(target, property, descriptor);
        };
        resolver.$isResolver = true;
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
const defaultSingletonOptions = { scoped: false };
function singletonDecorator(target) {
    return DI.singleton(target);
}
export function singleton(targetOrOptions) {
    if (typeof targetOrOptions === 'function') {
        return DI.singleton(targetOrOptions);
    }
    return function ($target) {
        return DI.singleton($target, targetOrOptions);
    };
}
function createAllResolver(getter) {
    return function (key, searchAncestors) {
        searchAncestors = !!searchAncestors;
        const resolver = function (target, property, descriptor) {
            DI.inject(resolver)(target, property, descriptor);
        };
        resolver.$isResolver = true;
        resolver.resolve = function (handler, requestor) {
            return getter(key, handler, requestor, searchAncestors);
        };
        return resolver;
    };
}
export const all = createAllResolver((key, handler, requestor, searchAncestors) => requestor.getAll(key, searchAncestors));
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
export const lazy = createResolver((key, handler, requestor) => {
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
export const optional = createResolver((key, handler, requestor) => {
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
export function ignore(target, property, descriptor) {
    DI.inject(ignore)(target, property, descriptor);
}
ignore.$isResolver = true;
ignore.resolve = () => undefined;
export const newInstanceForScope = createResolver((key, handler, requestor) => {
    const instance = createNewInstance(key, handler);
    const instanceProvider = new InstanceProvider(String(key));
    instanceProvider.prepare(instance);
    requestor.registerResolver(key, instanceProvider, true);
    return instance;
});
export const newInstanceOf = createResolver((key, handler, _requestor) => createNewInstance(key, handler));
function createNewInstance(key, handler) {
    return handler.getFactory(key).construct(handler);
}
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
                this.state = handler.getFactory(this.state).construct(requestor);
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
                return requestor.get(this.state);
            default:
                throw new Error(`Invalid resolver strategy specified: ${this.strategy}.`);
        }
    }
    getFactory(container) {
        var _a, _b, _c;
        switch (this.strategy) {
            case 1 /* singleton */:
            case 2 /* transient */:
                return container.getFactory(this.state);
            case 5 /* alias */:
                return (_c = (_b = (_a = container.getResolver(this.state)) === null || _a === void 0 ? void 0 : _a.getFactory) === null || _b === void 0 ? void 0 : _b.call(_a, container)) !== null && _c !== void 0 ? _c : null;
            default:
                return null;
        }
    }
}
function containerGetKey(d) {
    return this.get(d);
}
function transformInstance(inst, transform) {
    return transform(inst);
}
/** @internal */
export class Factory {
    constructor(Type, dependencies) {
        this.Type = Type;
        this.dependencies = dependencies;
        this.transformers = null;
    }
    construct(container, dynamicDependencies) {
        let instance;
        if (dynamicDependencies === void 0) {
            instance = new this.Type(...this.dependencies.map(containerGetKey, container));
        }
        else {
            instance = new this.Type(...this.dependencies.map(containerGetKey, container), ...dynamicDependencies);
        }
        if (this.transformers == null) {
            return instance;
        }
        return this.transformers.reduce(transformInstance, instance);
    }
    registerTransformer(transformer) {
        var _a;
        ((_a = this.transformers) !== null && _a !== void 0 ? _a : (this.transformers = [])).push(transformer);
    }
}
const containerResolver = {
    $isResolver: true,
    resolve(handler, requestor) {
        return requestor;
    }
};
function isRegistry(obj) {
    return typeof obj.register === 'function';
}
function isSelfRegistry(obj) {
    return isRegistry(obj) && typeof obj.registerInRequestor === 'boolean';
}
function isRegisterInRequester(obj) {
    return isSelfRegistry(obj) && obj.registerInRequestor;
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
const factoryKey = 'di:factory';
const factoryAnnotationKey = Protocol.annotation.keyFor(factoryKey);
let containerId = 0;
/** @internal */
export class Container {
    constructor(parent, config) {
        this.parent = parent;
        this.config = config;
        this.id = ++containerId;
        this.registerDepth = 0;
        this.disposableResolvers = new Set();
        if (parent === null) {
            this.root = this;
            this.resolvers = new Map();
            this.factories = new Map();
            this.resourceResolvers = Object.create(null);
        }
        else {
            this.root = parent.root;
            this.resolvers = new Map();
            this.factories = parent.factories;
            if (config.inheritParentResources) {
                this.resourceResolvers = Object.assign(Object.create(null), parent.resourceResolvers, this.root.resourceResolvers);
            }
            else {
                this.resourceResolvers = Object.assign(Object.create(null), this.root.resourceResolvers);
            }
        }
        this.resolvers.set(IContainer, containerResolver);
    }
    get depth() {
        return this.parent === null ? 0 : this.parent.depth + 1;
    }
    register(...params) {
        if (++this.registerDepth === 100) {
            throw new Error(`Unable to autoregister dependency: [${params.map(String)}]`);
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
            if (!isObject(current)) {
                continue;
            }
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
                    if (!isObject(value)) {
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
    // public deregisterResolverFor<K extends Key, T = K>(key: K): void {
    //   // const console =  (globalThis as any).console;
    //   // console.group("deregisterResolverFor");
    //   validateKey(key);
    //   let current: Container = this;
    //   let resolver: IResolver | undefined;
    //   while (current != null) {
    //     resolver = current.resolvers.get(key);
    //     if (resolver != null) { break; }
    //     if (current.parent == null) { return; }
    //     current = current.parent;
    //   }
    //   if (resolver === void 0) { return; }
    //   if (resolver instanceof Resolver && resolver.strategy === ResolverStrategy.array) {
    //     throw new Error('Cannot deregister a resolver with array strategy');
    //   }
    //   if (this.disposableResolvers.has(resolver as IDisposableResolver<T>)) {
    //     (resolver as IDisposableResolver<T>).dispose();
    //   }
    //   if (isResourceKey(key)) {
    //     // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
    //     delete this.resourceResolvers[key];
    //   }
    //   // console.log(`BEFORE delete ${Array.from(current.resolvers.keys()).map((k) => k.toString())}`);
    //   current.resolvers.delete(key);
    //   // console.log(`AFTER delete ${Array.from(current.resolvers.keys()).map((k) => k.toString())}`);
    //   // console.groupEnd();
    // }
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
            factory.registerTransformer(transformer);
            return true;
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
                    const handler = (isRegisterInRequester(key)) ? this : current;
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
                    const handler = (isRegisterInRequester(key)) ? this : current;
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
    getAll(key, searchAncestors = false) {
        validateKey(key);
        const requestor = this;
        let current = requestor;
        let resolver;
        if (searchAncestors) {
            let resolutions = emptyArray;
            while (current != null) {
                resolver = current.resolvers.get(key);
                if (resolver != null) {
                    resolutions = resolutions.concat(buildAllResponse(resolver, current, requestor));
                }
                current = current.parent;
            }
            return resolutions;
        }
        else {
            while (current != null) {
                resolver = current.resolvers.get(key);
                if (resolver == null) {
                    current = current.parent;
                    if (current == null) {
                        return emptyArray;
                    }
                }
                else {
                    return buildAllResponse(resolver, current, requestor);
                }
            }
        }
        return emptyArray;
    }
    invoke(Type, dynamicDependencies) {
        if (isNativeFunction(Type)) {
            throw createNativeInvocationError(Type);
        }
        return new Factory(Type, DI.getDependencies(Type)).construct(this, dynamicDependencies);
    }
    getFactory(Type) {
        let factory = this.factories.get(Type);
        if (factory === void 0) {
            if (isNativeFunction(Type)) {
                throw createNativeInvocationError(Type);
            }
            this.factories.set(Type, factory = new Factory(Type, DI.getDependencies(Type)));
        }
        return factory;
    }
    registerFactory(key, factory) {
        this.factories.set(key, factory);
    }
    createChild(config) {
        if (config === void 0 && this.config.inheritParentResources) {
            if (this.config === ContainerConfiguration.DEFAULT) {
                return new Container(this, this.config);
            }
            return new Container(this, ContainerConfiguration.from({
                ...this.config,
                inheritParentResources: false,
            }));
        }
        return new Container(this, ContainerConfiguration.from(config !== null && config !== void 0 ? config : this.config));
    }
    disposeResolvers() {
        var _a;
        const disposables = Array.from(this.disposableResolvers);
        while (disposables.length > 0) {
            (_a = disposables.pop()) === null || _a === void 0 ? void 0 : _a.dispose();
        }
    }
    find(kind, name) {
        const key = kind.keyFrom(name);
        let resolver = this.resourceResolvers[key];
        if (resolver === void 0) {
            resolver = this.root.resourceResolvers[key];
            if (resolver === void 0) {
                return null;
            }
        }
        if (resolver === null) {
            return null;
        }
        if (typeof resolver.getFactory === 'function') {
            const factory = resolver.getFactory(this);
            if (factory === null || factory === void 0) {
                return null;
            }
            const definition = Metadata.getOwn(kind.name, factory.Type);
            if (definition === void 0) {
                // TODO: we may want to log a warning here, or even throw. This would happen if a dependency is registered with a resource-like key
                // but does not actually have a definition associated via the type's metadata. That *should* generally not happen.
                return null;
            }
            return definition;
        }
        return null;
    }
    create(kind, name) {
        var _a, _b;
        const key = kind.keyFrom(name);
        let resolver = this.resourceResolvers[key];
        if (resolver === void 0) {
            resolver = this.root.resourceResolvers[key];
            if (resolver === void 0) {
                return null;
            }
            return (_a = resolver.resolve(this.root, this)) !== null && _a !== void 0 ? _a : null;
        }
        return (_b = resolver.resolve(this, this)) !== null && _b !== void 0 ? _b : null;
    }
    dispose() {
        this.disposeResolvers();
        this.resolvers.clear();
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
                throw new Error(`Invalid resolver returned from the static register method`);
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
            throw new Error(`Invalid resolver returned from the static register method`);
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
const containerLookup = new WeakMap();
function cacheCallbackResult(fun) {
    return function (handler, requestor, resolver) {
        let resolverLookup = containerLookup.get(handler);
        if (resolverLookup === void 0) {
            containerLookup.set(handler, resolverLookup = new WeakMap());
        }
        if (resolverLookup.has(resolver)) {
            return resolverLookup.get(resolver);
        }
        const t = fun(handler, requestor, resolver);
        resolverLookup.set(resolver, t);
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
export const Registration = {
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
export class InstanceProvider {
    constructor(friendlyName) {
        this.friendlyName = friendlyName;
        this.instance = null;
    }
    prepare(instance) {
        this.instance = instance;
    }
    get $isResolver() { return true; }
    resolve() {
        if (this.instance == null) {
            throw new Error(`Cannot call resolve ${this.friendlyName} before calling prepare or after calling dispose.`);
        }
        return this.instance;
    }
    dispose() {
        this.instance = null;
    }
}
/** @internal */
export function validateKey(key) {
    if (key === null || key === void 0) {
        throw new Error('key/value cannot be null or undefined. Are you trying to inject/register something that doesn\'t exist with DI?');
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
function createNativeInvocationError(Type) {
    return new Error(`${Type.name} is a native function and therefore cannot be safely constructed by DI. If this is intentional, please use a callback or cachedCallback resolver.`);
}
//# sourceMappingURL=di.js.map