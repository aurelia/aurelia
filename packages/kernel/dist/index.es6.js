const camelCaseLookup = {};
const kebabCaseLookup = {};
const PLATFORM = {
    global: (function () {
        // Workers don’t have `window`, only `self`
        // https://github.com/Microsoft/tslint-microsoft-contrib/issues/415
        // tslint:disable-next-line:no-typeof-undefined
        if (typeof self !== 'undefined') {
            return self;
        }
        // https://github.com/Microsoft/tslint-microsoft-contrib/issues/415
        // tslint:disable-next-line:no-typeof-undefined
        if (typeof global !== 'undefined') {
            return global;
        }
        // Not all environments allow eval and Function
        // Use only as a last resort:
        // tslint:disable-next-line:no-function-constructor-with-string-args
        return new Function('return this')();
    })(),
    emptyArray: Object.freeze([]),
    emptyObject: Object.freeze({}),
    noop() { return; },
    now() {
        return performance.now();
    },
    camelCase(input) {
        // benchmark: http://jsben.ch/qIz4Z
        let value = camelCaseLookup[input];
        if (value !== undefined)
            return value;
        value = '';
        let first = true;
        let sep = false;
        let char;
        for (let i = 0, ii = input.length; i < ii; ++i) {
            char = input.charAt(i);
            if (char === '-' || char === '.' || char === '_') {
                sep = true; // skip separators
            }
            else {
                value = value + (first ? char.toLowerCase() : (sep ? char.toUpperCase() : char));
                sep = false;
            }
            first = false;
        }
        return camelCaseLookup[input] = value;
    },
    kebabCase(input) {
        // benchmark: http://jsben.ch/v7K9T
        let value = kebabCaseLookup[input];
        if (value !== undefined)
            return value;
        value = '';
        let first = true;
        let char, lower;
        for (let i = 0, ii = input.length; i < ii; ++i) {
            char = input.charAt(i);
            lower = char.toLowerCase();
            value = value + (first ? lower : (char !== lower ? `-${lower}` : lower));
            first = false;
        }
        return kebabCaseLookup[input] = value;
    },
    toArray(input) {
        // benchmark: http://jsben.ch/xjsyF
        const len = input.length;
        const arr = Array(len);
        for (let i = 0; i < len; ++i) {
            arr[i] = input[i];
        }
        return arr;
    },
    requestAnimationFrame(callback) {
        return requestAnimationFrame(callback);
    }
};

const Reporter = {
    write(code, ...params) { return; },
    error(code, ...params) { return new Error(`Code ${code}`); }
};

// Shims to augment the Reflect object with methods used from the Reflect Metadata API proposal:
// https://www.typescriptlang.org/docs/handbook/decorators.html#metadata
// https://rbuckton.github.io/reflect-metadata/
// As the official spec proposal uses "any", we use it here as well and suppress related typedef linting warnings.
if (!('getOwnMetadata' in Reflect)) {
    // tslint:disable-next-line:no-any
    Reflect.getOwnMetadata = function (metadataKey, target) {
        return target[metadataKey];
    };
    // tslint:disable-next-line:no-any
    Reflect.metadata = function (metadataKey, metadataValue) {
        return function (target) {
            target[metadataKey] = metadataValue;
        };
    };
}
const DI = {
    createContainer() {
        return new Container();
    },
    getDesignParamTypes(target) {
        return Reflect.getOwnMetadata('design:paramtypes', target) || PLATFORM.emptyArray;
    },
    getDependencies(Type) {
        let dependencies;
        if (Type.inject === undefined) {
            dependencies = DI.getDesignParamTypes(Type);
        }
        else {
            dependencies = [];
            let ctor = Type;
            while (typeof ctor === 'function') {
                if (ctor.hasOwnProperty('inject')) {
                    dependencies.push(...ctor.inject);
                }
                ctor = Object.getPrototypeOf(ctor);
            }
        }
        return dependencies;
    },
    createInterface(friendlyName) {
        const Key = function (target, property, index) {
            if (target === undefined) {
                throw Reporter.error(16, Key); // TODO: add error (trying to resolve an InterfaceSymbol that has no registrations)
            }
            Key.friendlyName = friendlyName || 'Interface';
            (target.inject || (target.inject = []))[index] = Key;
            return target;
        };
        Key.noDefault = function () {
            return Key;
        };
        Key.withDefault = function (configure) {
            Key.withDefault = function () {
                throw Reporter.error(17, Key);
            };
            Key.register = function (container, key) {
                const trueKey = key || Key;
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
            return Key;
        };
        return Key;
    },
    inject(...dependencies) {
        return function (target, key, descriptor) {
            if (typeof descriptor === 'number') { // It's a parameter decorator.
                if (!target.hasOwnProperty('inject')) {
                    const types = DI.getDesignParamTypes(target);
                    target.inject = types.slice();
                }
                if (dependencies.length === 1) {
                    target.inject[descriptor] = dependencies[0];
                }
            }
            else if (key) { // It's a property decorator. Not supported by the container without plugins.
                const actualTarget = target.constructor;
                (actualTarget.inject || (actualTarget.inject = {}))[key] = dependencies[0];
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
    },
    // tslint:disable:jsdoc-format
    /**
     * Registers the `target` class as a transient dependency; each time the dependency is resolved
     * a new instance will be created.
     *
     * @param target The class / constructor function to register as transient.
     * @returns The same class, with a static `register` method that takes a container and returns the appropriate resolver.
     *
     * Example usage:
  ```ts
  // On an existing class
  class Foo { }
  DI.transient(Foo);
  
  // Inline declaration
  const Foo = DI.transient(class { });
  // Foo is now strongly typed with register
  Foo.register(container);
  ```
     */
    // tslint:enable:jsdoc-format
    transient(target) {
        target.register = function register(container) {
            const registration = Registration.transient(target, target);
            return registration.register(container, target);
        };
        return target;
    },
    // tslint:disable:jsdoc-format
    /**
     * Registers the `target` class as a singleton dependency; the class will only be created once. Each
     * consecutive time the dependency is resolved, the same instance will be returned.
     *
     * @param target The class / constructor function to register as a singleton.
     * @returns The same class, with a static `register` method that takes a container and returns the appropriate resolver.
     * Example usage:
  ```ts
  // On an existing class
  class Foo { }
  DI.singleton(Foo);
  
  // Inline declaration
  const Foo = DI.singleton(class { });
  // Foo is now strongly typed with register
  Foo.register(container);
  ```
     */
    // tslint:enable:jsdoc-format
    singleton(target) {
        target.register = function register(container) {
            const registration = Registration.singleton(target, target);
            return registration.register(container, target);
        };
        return target;
    }
};
const IContainer = DI.createInterface().noDefault();
const IServiceLocator = IContainer;
function createResolver(getter) {
    return function (key) {
        const Key = function Key(target, property, descriptor) {
            return DI.inject(Key)(target, property, descriptor);
        };
        Key.resolve = function (handler, requestor) {
            return getter(key, handler, requestor);
        };
        return Key;
    };
}
const inject = DI.inject;
function transientDecorator(target) {
    return DI.transient(target);
}
function transient(target) {
    return target === undefined ? transientDecorator : transientDecorator(target);
}
function singletonDecorator(target) {
    return DI.singleton(target);
}
function singleton(target) {
    return target === undefined ? singletonDecorator : singletonDecorator(target);
}
const all = createResolver((key, handler, requestor) => requestor.getAll(key));
const lazy = createResolver((key, handler, requestor) => {
    let instance = null; // cache locally so that lazy always returns the same instance once resolved
    return () => {
        if (instance === null) {
            instance = requestor.get(key);
        }
        return instance;
    };
});
const optional = createResolver((key, handler, requestor) => {
    if (requestor.has(key, true)) {
        return requestor.get(key);
    }
    else {
        return null;
    }
});
/*@internal*/
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
            case 1 /* singleton */:
                {
                    this.strategy = 0 /* instance */;
                    const factory = handler.getFactory(this.state);
                    return this.state = factory.construct(handler);
                }
            case 2 /* transient */:
                {
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
                throw Reporter.error(6, this.strategy);
        }
    }
    getFactory(container) {
        switch (this.strategy) {
            case 1 /* singleton */:
            case 2 /* transient */:
                return container.getFactory(this.state);
            default:
                return null;
        }
    }
}
/*@internal*/
class Factory {
    constructor(Type, invoker, dependencies) {
        this.Type = Type;
        this.invoker = invoker;
        this.dependencies = dependencies;
        this.transformers = null;
    }
    static create(Type) {
        const dependencies = DI.getDependencies(Type);
        const invoker = classInvokers[dependencies.length] || fallbackInvoker;
        return new Factory(Type, invoker, dependencies);
    }
    construct(container, dynamicDependencies) {
        const transformers = this.transformers;
        let instance = dynamicDependencies !== undefined
            ? this.invoker.invokeWithDynamicDependencies(container, this.Type, this.dependencies, dynamicDependencies)
            : this.invoker.invoke(container, this.Type, this.dependencies);
        if (transformers === null) {
            return instance;
        }
        for (let i = 0, ii = transformers.length; i < ii; ++i) {
            instance = transformers[i](instance);
        }
        return instance;
    }
    registerTransformer(transformer) {
        if (this.transformers === null) {
            this.transformers = [];
        }
        this.transformers.push(transformer);
        return true;
    }
}
const containerResolver = {
    resolve(handler, requestor) {
        return requestor;
    }
};
function isRegistry(obj) {
    return typeof obj.register === 'function';
}
/*@internal*/
class Container {
    constructor(configuration = {}) {
        this.parent = null;
        this.resolvers = new Map();
        this.configuration = configuration;
        this.factories = configuration.factories || (configuration.factories = new Map());
        this.resolvers.set(IContainer, containerResolver);
    }
    register(...params) {
        for (let i = 0, ii = params.length; i < ii; ++i) {
            const current = params[i];
            if (isRegistry(current)) {
                current.register(this);
            }
            else {
                const keys = Object.keys(current);
                for (let j = 0, jj = keys.length; j < jj; ++j) {
                    const value = current[keys[j]];
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
    }
    registerResolver(key, resolver) {
        validateKey(key);
        const resolvers = this.resolvers;
        const result = resolvers.get(key);
        if (result === undefined) {
            resolvers.set(key, resolver);
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
        if (resolver === null) {
            return false;
        }
        if (resolver.getFactory) {
            const handler = resolver.getFactory(this);
            if (handler === null) {
                return false;
            }
            return handler.registerTransformer(transformer);
        }
        return false;
    }
    getResolver(key, autoRegister = true) {
        validateKey(key);
        if (key.resolve) {
            return key;
        }
        let current = this;
        while (current !== null) {
            const resolver = current.resolvers.get(key);
            if (resolver === undefined) {
                if (current.parent === null) {
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
            : searchAncestors && this.parent !== null
                ? this.parent.has(key, true)
                : false;
    }
    get(key) {
        validateKey(key);
        if (key.resolve) {
            return key.resolve(this, this);
        }
        let current = this;
        while (current !== null) {
            let resolver = current.resolvers.get(key);
            if (resolver === undefined) {
                if (current.parent === null) {
                    resolver = this.jitRegister(key, current);
                    return resolver.resolve(current, this);
                }
                current = current.parent;
            }
            else {
                return resolver.resolve(current, this);
            }
        }
    }
    getAll(key) {
        validateKey(key);
        let current = this;
        while (current !== null) {
            const resolver = current.resolvers.get(key);
            if (resolver === undefined) {
                if (this.parent === null) {
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
        let factory = this.factories.get(Type);
        if (factory === undefined) {
            factory = Factory.create(Type);
            this.factories.set(Type, factory);
        }
        return factory;
    }
    createChild() {
        const child = new Container(this.configuration);
        child.parent = this;
        return child;
    }
    jitRegister(keyAsValue, handler) {
        if (keyAsValue.register) {
            const registrationResolver = keyAsValue.register(handler, keyAsValue);
            if (!(registrationResolver && registrationResolver.resolve)) {
                throw Reporter.error(40); // did not return a valid resolver from the static register method
            }
            return registrationResolver;
        }
        const resolver = new Resolver(keyAsValue, 1 /* singleton */, keyAsValue);
        handler.resolvers.set(keyAsValue, resolver);
        return resolver;
    }
}
const Registration = {
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
    interpret(interpreterKey, ...rest) {
        return {
            register(container) {
                const resolver = container.getResolver(interpreterKey);
                if (resolver !== null) {
                    let registry = null;
                    if (resolver.getFactory) {
                        const factory = resolver.getFactory(container);
                        if (factory !== null) {
                            registry = factory.construct(container, rest);
                        }
                    }
                    else {
                        registry = resolver.resolve(container, container);
                    }
                    if (registry !== null) {
                        registry.register(container);
                    }
                }
            }
        };
    }
};
/*@internal*/
function validateKey(key) {
    // note: design:paramTypes which will default to Object if the param types cannot be statically analyzed by tsc
    // this check is intended to properly report on that problem - under no circumstance should Object be a valid key anyway
    if (key === null || key === undefined || key === Object) {
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
/*@internal*/
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
/*@internal*/
const fallbackInvoker = {
    invoke: invokeWithDynamicDependencies,
    invokeWithDynamicDependencies
};
/*@internal*/
function invokeWithDynamicDependencies(container, Type, staticDependencies, dynamicDependencies) {
    let i = staticDependencies.length;
    let args = new Array(i);
    let lookup;
    while (i--) {
        lookup = staticDependencies[i];
        if (lookup === null || lookup === undefined) {
            throw Reporter.error(7, `Index ${i}.`);
        }
        else {
            args[i] = container.get(lookup);
        }
    }
    if (dynamicDependencies !== undefined) {
        args = args.concat(dynamicDependencies);
    }
    return Reflect.construct(Type, args);
}

export { DI, IContainer, IServiceLocator, inject, transient, singleton, all, lazy, optional, Resolver, Factory, Container, Registration, validateKey, classInvokers, fallbackInvoker, invokeWithDynamicDependencies, PLATFORM, Reporter };
//# sourceMappingURL=index.es6.js.map
