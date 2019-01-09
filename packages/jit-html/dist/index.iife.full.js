var au = (function (exports) {
    'use strict';

    class AttrSyntax {
        constructor(rawName, rawValue, target, command) {
            this.rawName = rawName;
            this.rawValue = rawValue;
            this.target = target;
            this.command = command;
        }
    }

    const $global = (function () {
        // https://github.com/Microsoft/tslint-microsoft-contrib/issues/415
        // tslint:disable:no-typeof-undefined
        if (typeof global !== 'undefined') {
            return global;
        }
        if (typeof self !== 'undefined') {
            return self;
        }
        if (typeof window !== 'undefined') {
            return window;
        }
        // tslint:enable:no-typeof-undefined
        try {
            // Not all environments allow eval and Function. Use only as a last resort:
            // tslint:disable-next-line:no-function-constructor-with-string-args function-constructor
            return new Function('return this')();
        }
        catch (_a) {
            // If all fails, give up and create an object.
            // tslint:disable-next-line:no-object-literal-type-assertion
            return {};
        }
        // @ts-ignore 2683
    })();
    // performance.now polyfill for non-browser envs based on https://github.com/myrne/performance-now
    const $now = (function () {
        let getNanoSeconds;
        let hrtime;
        let loadTime;
        let moduleLoadTime;
        let nodeLoadTime;
        let upTime;
        if (($global.performance !== undefined && $global.performance !== null) && $global.performance.now) {
            const $performance = $global.performance;
            return function () {
                return $performance.now();
            };
        }
        else if (($global.process !== undefined && $global.process !== null) && $global.process.hrtime) {
            const now = function () {
                return (getNanoSeconds() - nodeLoadTime) / 1e6;
            };
            hrtime = $global.process.hrtime;
            getNanoSeconds = function () {
                let hr;
                hr = hrtime();
                return hr[0] * 1e9 + hr[1];
            };
            moduleLoadTime = getNanoSeconds();
            upTime = $global.process.uptime() * 1e9;
            nodeLoadTime = moduleLoadTime - upTime;
            return now;
        }
        else if (Date.now) {
            const now = function () {
                return Date.now() - loadTime;
            };
            loadTime = Date.now();
            return now;
        }
        else {
            const now = function () {
                return new Date().getTime() - loadTime;
            };
            loadTime = new Date().getTime();
            return now;
        }
    })();
    // RAF polyfill for non-browser envs from https://github.com/chrisdickinson/raf/blob/master/index.js
    const $raf = (function () {
        const vendors = ['moz', 'webkit'];
        const suffix = 'AnimationFrame';
        let raf = $global[`request${suffix}`];
        let caf = $global[`cancel${suffix}`] || $global[`cancelRequest${suffix}`];
        for (let i = 0; !raf && i < vendors.length; ++i) {
            raf = $global[`${vendors[i]}Request${suffix}`];
            caf = $global[`${vendors[i]}Cancel${suffix}`] || $global[`${vendors[i]}CancelRequest${suffix}`];
        }
        // Some versions of FF have rAF but not cAF
        if (!raf || !caf) {
            let last = 0;
            let id = 0;
            const queue = [];
            const frameDuration = 1000 / 60;
            raf = function (callback) {
                let _now;
                let next;
                if (queue.length === 0) {
                    _now = $now();
                    next = Math.max(0, frameDuration - (_now - last));
                    last = next + _now;
                    setTimeout(function () {
                        const cp = queue.slice(0);
                        // Clear queue here to prevent callbacks from appending listeners to the current frame's queue
                        queue.length = 0;
                        for (let i = 0; i < cp.length; ++i) {
                            if (!cp[i].cancelled) {
                                try {
                                    cp[i].callback(last);
                                }
                                catch (e) {
                                    setTimeout(function () { throw e; }, 0);
                                }
                            }
                        }
                    }, Math.round(next));
                }
                queue.push({
                    handle: ++id,
                    callback: callback,
                    cancelled: false
                });
                return id;
            };
            caf = function (handle) {
                for (let i = 0; i < queue.length; ++i) {
                    if (queue[i].handle === handle) {
                        queue[i].cancelled = true;
                    }
                }
            };
        }
        const $$raf = function (callback) {
            return raf.call($global, callback);
        };
        $$raf.cancel = function () {
            caf.apply($global, arguments);
        };
        $global.requestAnimationFrame = raf;
        $global.cancelAnimationFrame = caf;
        return $$raf;
    })();
    const camelCaseLookup = {};
    const kebabCaseLookup = {};
    const PLATFORM = {
        global: $global,
        emptyArray: Object.freeze([]),
        emptyObject: Object.freeze({}),
        noop() { return; },
        now: $now,
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
            return $raf(callback);
        },
        clearInterval(handle) {
            $global.clearInterval(handle);
        },
        clearTimeout(handle) {
            $global.clearTimeout(handle);
        },
        // tslint:disable-next-line:no-any
        setInterval(handler, timeout, ...args) {
            return $global.setInterval(handler, timeout, ...args);
        },
        // tslint:disable-next-line:no-any
        setTimeout(handler, timeout, ...args) {
            return $global.setTimeout(handler, timeout, ...args);
        }
    };

    const Reporter = {
        write(code, ...params) { return; },
        error(code, ...params) { return new Error(`Code ${code}`); }
    };
    const Tracer = {
        /**
         * A convenience property for the user to conditionally call the tracer.
         * This saves unnecessary `noop` and `slice` calls in non-AOT scenarios even if debugging is disabled.
         * In AOT these calls will simply be removed entirely.
         *
         * This property **only** turns on tracing if `@aurelia/debug` is included and configured as well.
         */
        enabled: false,
        liveLoggingEnabled: false,
        liveWriter: null,
        /**
         * Call this at the start of a method/function.
         * Each call to `enter` **must** have an accompanying call to `leave` for the tracer to work properly.
         * @param name Any human-friendly name to identify the traced method with.
         * @param args Pass in `Array.prototype.slice.call(arguments)` to also trace the parameters, or `null` if this is not needed (to save memory/cpu)
         */
        enter(name, args) { return; },
        /**
         * Call this at the end of a method/function. Pops one trace item off the stack.
         */
        leave() { return; },
        /**
         * Writes only the trace info leading up to the current method call.
         * @param writer An object to write the output to.
         */
        writeStack(writer) { return; },
        /**
         * Writes all trace info captured since the previous flushAll operation.
         * @param writer An object to write the output to. Can be null to simply reset the tracer state.
         */
        flushAll(writer) { return; },
        /**
         * Writes out each trace info item as they are traced.
         * @param writer An object to write the output to.
         */
        enableLiveLogging(writer) { return; },
        /**
         * Stops writing out each trace info item as they are traced.
         */
        disableLiveLogging() { return; }
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
    const IContainer = DI.createInterface('IContainer').noDefault();
    const IServiceLocator = IContainer;
    function createResolver(getter) {
        return function (key) {
            const Key = function Key(target, property, descriptor) {
                DI.inject(Key)(target, property, descriptor);
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
    /** @internal */
    class Container {
        constructor(configuration = {}) {
            this.parent = null;
            this.resolvers = new Map();
            this.configuration = configuration;
            this.factories = configuration.factories || (configuration.factories = new Map());
            this.resourceLookup = configuration.resourceLookup || (configuration.resourceLookup = Object.create(null));
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
                if (typeof key === 'string') {
                    this.resourceLookup[key] = resolver;
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
            const config = this.configuration;
            const childConfig = { factories: config.factories, resourceLookup: Object.assign({}, config.resourceLookup) };
            const child = new Container(childConfig);
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
    /** @internal */
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
    /** @internal */
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
    /** @internal */
    const fallbackInvoker = {
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

    class RuntimeCompilationResources {
        constructor(context) {
            this.context = context;
        }
        find(kind, name) {
            const key = kind.keyFrom(name);
            const resourceLookup = this.context.resourceLookup;
            let resolver = resourceLookup[key];
            if (resolver === undefined) {
                resolver = resourceLookup[key] = this.context.getResolver(key, false);
            }
            if (resolver !== null && resolver.getFactory) {
                const factory = resolver.getFactory(this.context);
                if (factory !== null) {
                    const description = factory.Type.description;
                    return description === undefined ? null : description;
                }
            }
            return null;
        }
        create(kind, name) {
            const key = kind.keyFrom(name);
            const resourceLookup = this.context.resourceLookup;
            let resolver = resourceLookup[key];
            if (resolver === undefined) {
                resolver = resourceLookup[key] = this.context.getResolver(key, false);
            }
            if (resolver !== null) {
                const instance = resolver.resolve(this.context, this.context);
                return instance === undefined ? null : instance;
            }
            return null;
        }
    }



    var index = /*#__PURE__*/Object.freeze({
        all: all,
        DI: DI,
        IContainer: IContainer,
        inject: inject,
        IServiceLocator: IServiceLocator,
        lazy: lazy,
        optional: optional,
        Registration: Registration,
        singleton: singleton,
        transient: transient,
        PLATFORM: PLATFORM,
        Reporter: Reporter,
        Tracer: Tracer,
        RuntimeCompilationResources: RuntimeCompilationResources
    });

    /** @internal */
    class CharSpec {
        constructor(chars, repeat, isSymbol, isInverted) {
            this.chars = chars;
            this.repeat = repeat;
            this.isSymbol = isSymbol;
            this.isInverted = isInverted;
            if (isInverted) {
                switch (chars.length) {
                    case 0:
                        this.has = this.hasOfNoneInverse;
                        break;
                    case 1:
                        this.has = this.hasOfSingleInverse;
                        break;
                    default:
                        this.has = this.hasOfMultipleInverse;
                }
            }
            else {
                switch (chars.length) {
                    case 0:
                        this.has = this.hasOfNone;
                        break;
                    case 1:
                        this.has = this.hasOfSingle;
                        break;
                    default:
                        this.has = this.hasOfMultiple;
                }
            }
        }
        equals(other) {
            return this.chars === other.chars
                && this.repeat === other.repeat
                && this.isSymbol === other.isSymbol
                && this.isInverted === other.isInverted;
        }
        hasOfMultiple(char) {
            return this.chars.indexOf(char) !== -1;
        }
        hasOfSingle(char) {
            return this.chars === char;
        }
        hasOfNone(char) {
            return false;
        }
        hasOfMultipleInverse(char) {
            return this.chars.indexOf(char) === -1;
        }
        hasOfSingleInverse(char) {
            return this.chars !== char;
        }
        hasOfNoneInverse(char) {
            return true;
        }
    }
    class Interpretation {
        get pattern() {
            const value = this._pattern;
            if (value === '') {
                return null;
            }
            else {
                return value;
            }
        }
        set pattern(value) {
            if (value === null) {
                this._pattern = '';
                this.parts = PLATFORM.emptyArray;
            }
            else {
                this._pattern = value;
                this.parts = this.partsRecord[value];
            }
        }
        constructor() {
            this._pattern = '';
            this.parts = PLATFORM.emptyArray;
            this.currentRecord = {};
            this.partsRecord = {};
        }
        append(pattern, ch) {
            const { currentRecord } = this;
            if (currentRecord[pattern] === undefined) {
                currentRecord[pattern] = ch;
            }
            else {
                currentRecord[pattern] += ch;
            }
        }
        next(pattern) {
            const { currentRecord } = this;
            if (currentRecord[pattern] !== undefined) {
                const { partsRecord } = this;
                if (partsRecord[pattern] === undefined) {
                    partsRecord[pattern] = [currentRecord[pattern]];
                }
                else {
                    partsRecord[pattern].push(currentRecord[pattern]);
                }
                currentRecord[pattern] = undefined;
            }
        }
    }
    /** @internal */
    class State {
        get pattern() {
            return this.isEndpoint ? this.patterns[0] : null;
        }
        constructor(charSpec, ...patterns) {
            this.charSpec = charSpec;
            this.nextStates = [];
            this.types = null;
            this.patterns = patterns;
            this.isEndpoint = false;
        }
        findChild(charSpec) {
            const nextStates = this.nextStates;
            const len = nextStates.length;
            let child = null;
            for (let i = 0; i < len; ++i) {
                child = nextStates[i];
                if (charSpec.equals(child.charSpec)) {
                    return child;
                }
            }
            return null;
        }
        append(charSpec, pattern) {
            const { patterns } = this;
            if (patterns.indexOf(pattern) === -1) {
                patterns.push(pattern);
            }
            let state = this.findChild(charSpec);
            if (state === null) {
                state = new State(charSpec, pattern);
                this.nextStates.push(state);
                if (charSpec.repeat) {
                    state.nextStates.push(state);
                }
            }
            return state;
        }
        findMatches(ch, interpretation) {
            // TODO: reuse preallocated arrays
            const results = [];
            const nextStates = this.nextStates;
            const len = nextStates.length;
            let childLen = 0;
            let child = null;
            let i = 0;
            let j = 0;
            for (; i < len; ++i) {
                child = nextStates[i];
                if (child.charSpec.has(ch)) {
                    results.push(child);
                    childLen = child.patterns.length;
                    if (child.charSpec.isSymbol) {
                        for (; j < childLen; ++j) {
                            interpretation.next(child.patterns[j]);
                        }
                    }
                    else {
                        for (; j < childLen; ++j) {
                            interpretation.append(child.patterns[j], ch);
                        }
                    }
                }
            }
            return results;
        }
    }
    /** @internal */
    class StaticSegment {
        constructor(text) {
            this.text = text;
            const len = this.len = text.length;
            const specs = this.specs = [];
            for (let i = 0; i < len; ++i) {
                specs.push(new CharSpec(text[i], false, false, false));
            }
        }
        eachChar(callback) {
            const { len, specs } = this;
            for (let i = 0; i < len; ++i) {
                callback(specs[i]);
            }
        }
    }
    /** @internal */
    class DynamicSegment {
        constructor(symbols) {
            this.text = 'PART';
            this.spec = new CharSpec(symbols, true, false, true);
        }
        eachChar(callback) {
            callback(this.spec);
        }
    }
    /** @internal */
    class SymbolSegment {
        constructor(text) {
            this.text = text;
            this.spec = new CharSpec(text, false, true, false);
        }
        eachChar(callback) {
            callback(this.spec);
        }
    }
    /** @internal */
    class SegmentTypes {
        constructor() {
            this.statics = 0;
            this.dynamics = 0;
            this.symbols = 0;
        }
    }
    const ISyntaxInterpreter = DI.createInterface('ISyntaxInterpreter').withDefault(x => x.singleton(SyntaxInterpreter));
    /** @internal */
    class SyntaxInterpreter {
        constructor() {
            this.rootState = new State(null);
            this.initialStates = [this.rootState];
        }
        add(defOrDefs) {
            let i = 0;
            if (Array.isArray(defOrDefs)) {
                const ii = defOrDefs.length;
                for (; i < ii; ++i) {
                    this.add(defOrDefs[i]);
                }
                return;
            }
            let currentState = this.rootState;
            const def = defOrDefs;
            const pattern = def.pattern;
            const types = new SegmentTypes();
            const segments = this.parse(def, types);
            const len = segments.length;
            const callback = (ch) => {
                currentState = currentState.append(ch, pattern);
            };
            for (i = 0; i < len; ++i) {
                segments[i].eachChar(callback);
            }
            currentState.types = types;
            currentState.isEndpoint = true;
        }
        interpret(name) {
            const interpretation = new Interpretation();
            let states = this.initialStates;
            const len = name.length;
            for (let i = 0; i < len; ++i) {
                states = this.getNextStates(states, name.charAt(i), interpretation);
                if (states.length === 0) {
                    break;
                }
            }
            states.sort((a, b) => {
                if (a.isEndpoint) {
                    if (!b.isEndpoint) {
                        return -1;
                    }
                }
                else if (b.isEndpoint) {
                    return 1;
                }
                else {
                    return 0;
                }
                const aTypes = a.types;
                const bTypes = b.types;
                if (aTypes.statics !== bTypes.statics) {
                    return bTypes.statics - aTypes.statics;
                }
                if (aTypes.dynamics !== bTypes.dynamics) {
                    return bTypes.dynamics - aTypes.dynamics;
                }
                if (aTypes.symbols !== bTypes.symbols) {
                    return bTypes.symbols - aTypes.symbols;
                }
                return 0;
            });
            if (states.length > 0) {
                const state = states[0];
                if (!state.charSpec.isSymbol) {
                    interpretation.next(state.pattern);
                }
                interpretation.pattern = state.pattern;
            }
            return interpretation;
        }
        getNextStates(states, ch, interpretation) {
            // TODO: reuse preallocated arrays
            const nextStates = [];
            let state = null;
            const len = states.length;
            for (let i = 0; i < len; ++i) {
                state = states[i];
                nextStates.push(...state.findMatches(ch, interpretation));
            }
            return nextStates;
        }
        parse(def, types) {
            const result = [];
            const pattern = def.pattern;
            const len = pattern.length;
            let i = 0;
            let start = 0;
            let c = '';
            while (i < len) {
                c = pattern.charAt(i);
                if (def.symbols.indexOf(c) === -1) {
                    if (i === start) {
                        if (c === 'P' && pattern.slice(i, i + 4) === 'PART') {
                            start = i = (i + 4);
                            result.push(new DynamicSegment(def.symbols));
                            ++types.dynamics;
                        }
                        else {
                            ++i;
                        }
                    }
                    else {
                        ++i;
                    }
                }
                else if (i !== start) {
                    result.push(new StaticSegment(pattern.slice(start, i)));
                    ++types.statics;
                    start = i;
                }
                else {
                    result.push(new SymbolSegment(pattern.slice(start, i + 1)));
                    ++types.symbols;
                    start = ++i;
                }
            }
            if (start !== i) {
                result.push(new StaticSegment(pattern.slice(start, i)));
                ++types.statics;
            }
            return result;
        }
    }
    function validatePrototype(handler, patternDefs) {
        for (const def of patternDefs) {
            // note: we're intentionally not throwing here
            if (!(def.pattern in handler)) {
                Reporter.write(401, def); // TODO: organize error codes
            }
            else if (typeof handler[def.pattern] !== 'function') {
                Reporter.write(402, def); // TODO: organize error codes
            }
        }
    }
    const IAttributePattern = DI.createInterface('IAttributePattern').noDefault();
    function attributePattern(...patternDefs) {
        return function decorator(target) {
            const proto = target.prototype;
            // Note: the prototype is really meant to be an intersection type between IAttrubutePattern and IAttributePatternHandler, but
            // a type with an index signature cannot be intersected with anything else that has normal property names.
            // So we're forced to use a union type and cast it here.
            validatePrototype(proto, patternDefs);
            proto.$patternDefs = patternDefs;
            target.register = function register(container) {
                return Registration.singleton(IAttributePattern, target).register(container, IAttributePattern);
            };
            return target;
        };
    }
    class DotSeparatedAttributePattern {
        ['PART.PART'](rawName, rawValue, parts) {
            return new AttrSyntax(rawName, rawValue, parts[0], parts[1]);
        }
        ['PART.PART.PART'](rawName, rawValue, parts) {
            return new AttrSyntax(rawName, rawValue, parts[0], parts[2]);
        }
    }
    attributePattern({ pattern: 'PART.PART', symbols: '.' }, { pattern: 'PART.PART.PART', symbols: '.' })(DotSeparatedAttributePattern);
    class RefAttributePattern {
        ['ref'](rawName, rawValue, parts) {
            return new AttrSyntax(rawName, rawValue, 'ref', null);
        }
        ['ref.PART'](rawName, rawValue, parts) {
            return new AttrSyntax(rawName, rawValue, 'ref', parts[1]);
        }
    }
    attributePattern({ pattern: 'ref', symbols: '' }, { pattern: 'ref.PART', symbols: '.' })(RefAttributePattern);
    class ColonPrefixedBindAttributePattern {
        [':PART'](rawName, rawValue, parts) {
            return new AttrSyntax(rawName, rawValue, parts[0], 'bind');
        }
    }
    attributePattern({ pattern: ':PART', symbols: ':' })(ColonPrefixedBindAttributePattern);
    class AtPrefixedTriggerAttributePattern {
        ['@PART'](rawName, rawValue, parts) {
            return new AttrSyntax(rawName, rawValue, parts[0], 'trigger');
        }
    }
    attributePattern({ pattern: '@PART', symbols: '@' })(AtPrefixedTriggerAttributePattern);

    const IAttributeParser = DI.createInterface('IAttributeParser').withDefault(x => x.singleton(AttributeParser));
    /** @internal */
    class AttributeParser {
        constructor(interpreter, attrPatterns) {
            this.interpreter = interpreter;
            this.cache = {};
            const patterns = this.patterns = {};
            attrPatterns.forEach(attrPattern => {
                const defs = attrPattern.$patternDefs;
                interpreter.add(defs);
                defs.forEach(def => {
                    patterns[def.pattern] = attrPattern;
                });
            });
        }
        parse(name, value) {
            let interpretation = this.cache[name];
            if (interpretation === undefined) {
                interpretation = this.cache[name] = this.interpreter.interpret(name);
            }
            const pattern = interpretation.pattern;
            if (pattern === null) {
                return new AttrSyntax(name, value, name, null);
            }
            else {
                return this.patterns[pattern][pattern](name, value, interpretation.parts);
            }
        }
    }
    AttributeParser.inject = [ISyntaxInterpreter, all(IAttributePattern)];

    var LifecycleFlags;
    (function (LifecycleFlags) {
        LifecycleFlags[LifecycleFlags["none"] = 0] = "none";
        LifecycleFlags[LifecycleFlags["mustEvaluate"] = 262144] = "mustEvaluate";
        LifecycleFlags[LifecycleFlags["mutation"] = 3] = "mutation";
        LifecycleFlags[LifecycleFlags["isCollectionMutation"] = 1] = "isCollectionMutation";
        LifecycleFlags[LifecycleFlags["isInstanceMutation"] = 2] = "isInstanceMutation";
        LifecycleFlags[LifecycleFlags["update"] = 28] = "update";
        LifecycleFlags[LifecycleFlags["updateTargetObserver"] = 4] = "updateTargetObserver";
        LifecycleFlags[LifecycleFlags["updateTargetInstance"] = 8] = "updateTargetInstance";
        LifecycleFlags[LifecycleFlags["updateSourceExpression"] = 16] = "updateSourceExpression";
        LifecycleFlags[LifecycleFlags["from"] = 262112] = "from";
        LifecycleFlags[LifecycleFlags["fromFlush"] = 96] = "fromFlush";
        LifecycleFlags[LifecycleFlags["fromAsyncFlush"] = 32] = "fromAsyncFlush";
        LifecycleFlags[LifecycleFlags["fromSyncFlush"] = 64] = "fromSyncFlush";
        LifecycleFlags[LifecycleFlags["fromStartTask"] = 128] = "fromStartTask";
        LifecycleFlags[LifecycleFlags["fromStopTask"] = 256] = "fromStopTask";
        LifecycleFlags[LifecycleFlags["fromBind"] = 512] = "fromBind";
        LifecycleFlags[LifecycleFlags["fromUnbind"] = 1024] = "fromUnbind";
        LifecycleFlags[LifecycleFlags["fromAttach"] = 2048] = "fromAttach";
        LifecycleFlags[LifecycleFlags["fromDetach"] = 4096] = "fromDetach";
        LifecycleFlags[LifecycleFlags["fromCache"] = 8192] = "fromCache";
        LifecycleFlags[LifecycleFlags["fromDOMEvent"] = 16384] = "fromDOMEvent";
        LifecycleFlags[LifecycleFlags["fromObserverSetter"] = 32768] = "fromObserverSetter";
        LifecycleFlags[LifecycleFlags["fromBindableHandler"] = 65536] = "fromBindableHandler";
        LifecycleFlags[LifecycleFlags["fromLifecycleTask"] = 131072] = "fromLifecycleTask";
        LifecycleFlags[LifecycleFlags["parentUnmountQueued"] = 524288] = "parentUnmountQueued";
        // this flag is for the synchronous flush before detach (no point in updating the
        // DOM if it's about to be detached)
        LifecycleFlags[LifecycleFlags["doNotUpdateDOM"] = 1048576] = "doNotUpdateDOM";
        LifecycleFlags[LifecycleFlags["isTraversingParentScope"] = 2097152] = "isTraversingParentScope";
        // Bitmask for flags that need to be stored on a binding during $bind for mutation
        // callbacks outside of $bind
        LifecycleFlags[LifecycleFlags["persistentBindingFlags"] = 4194304] = "persistentBindingFlags";
        LifecycleFlags[LifecycleFlags["allowParentScopeTraversal"] = 4194304] = "allowParentScopeTraversal";
    })(LifecycleFlags || (LifecycleFlags = {}));
    function stringifyLifecycleFlags(flags) {
        const flagNames = [];
        if (flags & LifecycleFlags.mustEvaluate) {
            flagNames.push('mustEvaluate');
        }
        if (flags & LifecycleFlags.isCollectionMutation) {
            flagNames.push('isCollectionMutation');
        }
        if (flags & LifecycleFlags.isInstanceMutation) {
            flagNames.push('isInstanceMutation');
        }
        if (flags & LifecycleFlags.updateTargetObserver) {
            flagNames.push('updateTargetObserver');
        }
        if (flags & LifecycleFlags.updateTargetInstance) {
            flagNames.push('updateTargetInstance');
        }
        if (flags & LifecycleFlags.updateSourceExpression) {
            flagNames.push('updateSourceExpression');
        }
        if (flags & LifecycleFlags.fromAsyncFlush) {
            flagNames.push('fromAsyncFlush');
        }
        if (flags & LifecycleFlags.fromSyncFlush) {
            flagNames.push('fromSyncFlush');
        }
        if (flags & LifecycleFlags.fromStartTask) {
            flagNames.push('fromStartTask');
        }
        if (flags & LifecycleFlags.fromStopTask) {
            flagNames.push('fromStopTask');
        }
        if (flags & LifecycleFlags.fromBind) {
            flagNames.push('fromBind');
        }
        if (flags & LifecycleFlags.fromUnbind) {
            flagNames.push('fromUnbind');
        }
        if (flags & LifecycleFlags.fromAttach) {
            flagNames.push('fromAttach');
        }
        if (flags & LifecycleFlags.fromDetach) {
            flagNames.push('fromDetach');
        }
        if (flags & LifecycleFlags.fromCache) {
            flagNames.push('fromCache');
        }
        if (flags & LifecycleFlags.fromDOMEvent) {
            flagNames.push('fromDOMEvent');
        }
        if (flags & LifecycleFlags.fromObserverSetter) {
            flagNames.push('fromObserverSetter');
        }
        if (flags & LifecycleFlags.fromBindableHandler) {
            flagNames.push('fromBindableHandler');
        }
        if (flags & LifecycleFlags.fromLifecycleTask) {
            flagNames.push('fromLifecycleTask');
        }
        if (flags & LifecycleFlags.parentUnmountQueued) {
            flagNames.push('parentUnmountQueued');
        }
        if (flags & LifecycleFlags.doNotUpdateDOM) {
            flagNames.push('doNotUpdateDOM');
        }
        if (flags & LifecycleFlags.isTraversingParentScope) {
            flagNames.push('isTraversingParentScope');
        }
        if (flags & LifecycleFlags.allowParentScopeTraversal) {
            flagNames.push('allowParentScopeTraversal');
        }
        return flagNames.join('|');
    }
    /** @internal */
    var SubscriberFlags;
    (function (SubscriberFlags) {
        SubscriberFlags[SubscriberFlags["None"] = 0] = "None";
        SubscriberFlags[SubscriberFlags["Subscriber0"] = 1] = "Subscriber0";
        SubscriberFlags[SubscriberFlags["Subscriber1"] = 2] = "Subscriber1";
        SubscriberFlags[SubscriberFlags["Subscriber2"] = 4] = "Subscriber2";
        SubscriberFlags[SubscriberFlags["SubscribersRest"] = 8] = "SubscribersRest";
        SubscriberFlags[SubscriberFlags["Any"] = 15] = "Any";
    })(SubscriberFlags || (SubscriberFlags = {}));
    var DelegationStrategy;
    (function (DelegationStrategy) {
        DelegationStrategy[DelegationStrategy["none"] = 0] = "none";
        DelegationStrategy[DelegationStrategy["capturing"] = 1] = "capturing";
        DelegationStrategy[DelegationStrategy["bubbling"] = 2] = "bubbling";
    })(DelegationStrategy || (DelegationStrategy = {}));
    /**
     * Mostly just a marker enum to help with typings (specifically to reduce duplication)
     */
    var MutationKind;
    (function (MutationKind) {
        MutationKind[MutationKind["instance"] = 1] = "instance";
        MutationKind[MutationKind["collection"] = 2] = "collection";
    })(MutationKind || (MutationKind = {}));
    var CollectionKind;
    (function (CollectionKind) {
        CollectionKind[CollectionKind["indexed"] = 8] = "indexed";
        CollectionKind[CollectionKind["keyed"] = 4] = "keyed";
        CollectionKind[CollectionKind["array"] = 9] = "array";
        CollectionKind[CollectionKind["map"] = 6] = "map";
        CollectionKind[CollectionKind["set"] = 7] = "set";
    })(CollectionKind || (CollectionKind = {}));

    /*! *****************************************************************************
    Copyright (c) Microsoft Corporation. All rights reserved.
    Licensed under the Apache License, Version 2.0 (the "License"); you may not use
    this file except in compliance with the License. You may obtain a copy of the
    License at http://www.apache.org/licenses/LICENSE-2.0

    THIS CODE IS PROVIDED ON AN *AS IS* BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
    KIND, EITHER EXPRESS OR IMPLIED, INCLUDING WITHOUT LIMITATION ANY IMPLIED
    WARRANTIES OR CONDITIONS OF TITLE, FITNESS FOR A PARTICULAR PURPOSE,
    MERCHANTABLITY OR NON-INFRINGEMENT.

    See the Apache Version 2.0 License for specific language governing permissions
    and limitations under the License.
    ***************************************************************************** */

    function __decorate(decorators, target, key, desc) {
        var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
        if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
        else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
        return c > 3 && r && Object.defineProperty(target, key, r), r;
    }

    function subscriberCollection(mutationKind) {
        return function (target) {
            const proto = target.prototype;
            proto._subscriberFlags = 0 /* None */;
            proto._subscriber0 = null;
            proto._subscriber1 = null;
            proto._subscriber2 = null;
            proto._subscribersRest = null;
            proto.addSubscriber = addSubscriber;
            proto.removeSubscriber = removeSubscriber;
            proto.hasSubscriber = hasSubscriber;
            proto.hasSubscribers = hasSubscribers;
            proto.callSubscribers = (mutationKind === MutationKind.instance ? callPropertySubscribers : callCollectionSubscribers);
        };
    }
    function addSubscriber(subscriber) {
        if (this.hasSubscriber(subscriber)) {
            return false;
        }
        const subscriberFlags = this._subscriberFlags;
        if (!(subscriberFlags & 1 /* Subscriber0 */)) {
            this._subscriber0 = subscriber;
            this._subscriberFlags |= 1 /* Subscriber0 */;
            return true;
        }
        if (!(subscriberFlags & 2 /* Subscriber1 */)) {
            this._subscriber1 = subscriber;
            this._subscriberFlags |= 2 /* Subscriber1 */;
            return true;
        }
        if (!(subscriberFlags & 4 /* Subscriber2 */)) {
            this._subscriber2 = subscriber;
            this._subscriberFlags |= 4 /* Subscriber2 */;
            return true;
        }
        if (!(subscriberFlags & 8 /* SubscribersRest */)) {
            this._subscribersRest = [subscriber];
            this._subscriberFlags |= 8 /* SubscribersRest */;
            return true;
        }
        this._subscribersRest.push(subscriber);
        return true;
    }
    function removeSubscriber(subscriber) {
        const subscriberFlags = this._subscriberFlags;
        if ((subscriberFlags & 1 /* Subscriber0 */) && this._subscriber0 === subscriber) {
            this._subscriber0 = null;
            this._subscriberFlags &= ~1 /* Subscriber0 */;
            return true;
        }
        if ((subscriberFlags & 2 /* Subscriber1 */) && this._subscriber1 === subscriber) {
            this._subscriber1 = null;
            this._subscriberFlags &= ~2 /* Subscriber1 */;
            return true;
        }
        if ((subscriberFlags & 4 /* Subscriber2 */) && this._subscriber2 === subscriber) {
            this._subscriber2 = null;
            this._subscriberFlags &= ~4 /* Subscriber2 */;
            return true;
        }
        if (subscriberFlags & 8 /* SubscribersRest */) {
            const subscribers = this._subscribersRest;
            for (let i = 0, ii = subscribers.length; i < ii; ++i) {
                if (subscribers[i] === subscriber) {
                    subscribers.splice(i, 1);
                    if (ii === 1) {
                        this._subscriberFlags &= ~8 /* SubscribersRest */;
                    }
                    return true;
                }
            }
        }
        return false;
    }
    function callPropertySubscribers(newValue, previousValue, flags) {
        /**
         * Note: change handlers may have the side-effect of adding/removing subscribers to this collection during this
         * callSubscribers invocation, so we're caching them all before invoking any.
         * Subscribers added during this invocation are not invoked (and they shouldn't be).
         * Subscribers removed during this invocation will still be invoked (and they also shouldn't be,
         * however this is accounted for via $isBound and similar flags on the subscriber objects)
         */
        const subscriber0 = this._subscriber0;
        const subscriber1 = this._subscriber1;
        const subscriber2 = this._subscriber2;
        let subscribers = this._subscribersRest;
        if (subscribers !== null) {
            subscribers = subscribers.slice();
        }
        if (subscriber0 !== null) {
            subscriber0.handleChange(newValue, previousValue, flags);
        }
        if (subscriber1 !== null) {
            subscriber1.handleChange(newValue, previousValue, flags);
        }
        if (subscriber2 !== null) {
            subscriber2.handleChange(newValue, previousValue, flags);
        }
        const length = subscribers && subscribers.length;
        if (length !== undefined && length > 0) {
            for (let i = 0; i < length; ++i) {
                const subscriber = subscribers[i];
                if (subscriber !== null) {
                    subscriber.handleChange(newValue, previousValue, flags);
                }
            }
        }
    }
    function callCollectionSubscribers(origin, args, flags) {
        const subscriber0 = this._subscriber0;
        const subscriber1 = this._subscriber1;
        const subscriber2 = this._subscriber2;
        let subscribers = this._subscribersRest;
        if (subscribers !== null) {
            subscribers = subscribers.slice();
        }
        if (subscriber0 !== null) {
            subscriber0.handleChange(origin, args, flags);
        }
        if (subscriber1 !== null) {
            subscriber1.handleChange(origin, args, flags);
        }
        if (subscriber2 !== null) {
            subscriber2.handleChange(origin, args, flags);
        }
        const length = subscribers && subscribers.length;
        if (length !== undefined && length > 0) {
            for (let i = 0; i < length; ++i) {
                const subscriber = subscribers[i];
                if (subscriber !== null) {
                    subscriber.handleChange(origin, args, flags);
                }
            }
        }
        this.lifecycle.enqueueFlush(this).catch(error => { throw error; });
    }
    function hasSubscribers() {
        return this._subscriberFlags !== 0 /* None */;
    }
    function hasSubscriber(subscriber) {
        // Flags here is just a perf tweak
        // Compared to not using flags, it's a moderate speed-up when this collection does not have the subscriber;
        // and minor slow-down when it does, and the former is more common than the latter.
        const subscriberFlags = this._subscriberFlags;
        if ((subscriberFlags & 1 /* Subscriber0 */) && this._subscriber0 === subscriber) {
            return true;
        }
        if ((subscriberFlags & 2 /* Subscriber1 */) && this._subscriber1 === subscriber) {
            return true;
        }
        if ((subscriberFlags & 4 /* Subscriber2 */) && this._subscriber2 === subscriber) {
            return true;
        }
        if (subscriberFlags & 8 /* SubscribersRest */) {
            // no need to check length; if the flag is set, there's always at least one
            const subscribers = this._subscribersRest;
            for (let i = 0, ii = subscribers.length; i < ii; ++i) {
                if (subscribers[i] === subscriber) {
                    return true;
                }
            }
        }
        return false;
    }
    function batchedSubscriberCollection() {
        return function (target) {
            const proto = target.prototype;
            proto._batchedSubscriberFlags = 0 /* None */;
            proto._batchedSubscriber0 = null;
            proto._batchedSubscriber1 = null;
            proto._batchedSubscriber2 = null;
            proto._batchedSubscribersRest = null;
            proto.addBatchedSubscriber = addBatchedSubscriber;
            proto.removeBatchedSubscriber = removeBatchedSubscriber;
            proto.hasBatchedSubscriber = hasBatchedSubscriber;
            proto.hasBatchedSubscribers = hasBatchedSubscribers;
            proto.callBatchedSubscribers = callBatchedCollectionSubscribers;
        };
    }
    function addBatchedSubscriber(subscriber) {
        if (this.hasBatchedSubscriber(subscriber)) {
            return false;
        }
        const subscriberFlags = this._batchedSubscriberFlags;
        if (!(subscriberFlags & 1 /* Subscriber0 */)) {
            this._batchedSubscriber0 = subscriber;
            this._batchedSubscriberFlags |= 1 /* Subscriber0 */;
            return true;
        }
        if (!(subscriberFlags & 2 /* Subscriber1 */)) {
            this._batchedSubscriber1 = subscriber;
            this._batchedSubscriberFlags |= 2 /* Subscriber1 */;
            return true;
        }
        if (!(subscriberFlags & 4 /* Subscriber2 */)) {
            this._batchedSubscriber2 = subscriber;
            this._batchedSubscriberFlags |= 4 /* Subscriber2 */;
            return true;
        }
        if (!(subscriberFlags & 8 /* SubscribersRest */)) {
            this._batchedSubscribersRest = [subscriber];
            this._batchedSubscriberFlags |= 8 /* SubscribersRest */;
            return true;
        }
        this._batchedSubscribersRest.push(subscriber);
        return true;
    }
    function removeBatchedSubscriber(subscriber) {
        const subscriberFlags = this._batchedSubscriberFlags;
        if ((subscriberFlags & 1 /* Subscriber0 */) && this._batchedSubscriber0 === subscriber) {
            this._batchedSubscriber0 = null;
            this._batchedSubscriberFlags &= ~1 /* Subscriber0 */;
            return true;
        }
        if ((subscriberFlags & 2 /* Subscriber1 */) && this._batchedSubscriber1 === subscriber) {
            this._batchedSubscriber1 = null;
            this._batchedSubscriberFlags &= ~2 /* Subscriber1 */;
            return true;
        }
        if ((subscriberFlags & 4 /* Subscriber2 */) && this._batchedSubscriber2 === subscriber) {
            this._batchedSubscriber2 = null;
            this._batchedSubscriberFlags &= ~4 /* Subscriber2 */;
            return true;
        }
        if (subscriberFlags & 8 /* SubscribersRest */) {
            const subscribers = this._batchedSubscribersRest;
            for (let i = 0, ii = subscribers.length; i < ii; ++i) {
                if (subscribers[i] === subscriber) {
                    subscribers.splice(i, 1);
                    if (ii === 1) {
                        this._batchedSubscriberFlags &= ~8 /* SubscribersRest */;
                    }
                    return true;
                }
            }
        }
        return false;
    }
    function callBatchedCollectionSubscribers(indexMap) {
        const subscriber0 = this._batchedSubscriber0;
        const subscriber1 = this._batchedSubscriber1;
        const subscriber2 = this._batchedSubscriber2;
        let subscribers = this._batchedSubscribersRest;
        if (subscribers !== null) {
            subscribers = subscribers.slice();
        }
        if (subscriber0 !== null) {
            subscriber0.handleBatchedChange(indexMap);
        }
        if (subscriber1 !== null) {
            subscriber1.handleBatchedChange(indexMap);
        }
        if (subscriber2 !== null) {
            subscriber2.handleBatchedChange(indexMap);
        }
        const length = subscribers && subscribers.length;
        if (length !== undefined && length > 0) {
            for (let i = 0; i < length; ++i) {
                const subscriber = subscribers[i];
                if (subscriber !== null) {
                    subscriber.handleBatchedChange(indexMap);
                }
            }
        }
    }
    function hasBatchedSubscribers() {
        return this._batchedSubscriberFlags !== 0 /* None */;
    }
    function hasBatchedSubscriber(subscriber) {
        // Flags here is just a perf tweak
        // Compared to not using flags, it's a moderate speed-up when this collection does not have the subscriber;
        // and minor slow-down when it does, and the former is more common than the latter.
        const subscriberFlags = this._batchedSubscriberFlags;
        if ((subscriberFlags & 1 /* Subscriber0 */) && this._batchedSubscriber0 === subscriber) {
            return true;
        }
        if ((subscriberFlags & 2 /* Subscriber1 */) && this._batchedSubscriber1 === subscriber) {
            return true;
        }
        if ((subscriberFlags & 4 /* Subscriber2 */) && this._batchedSubscriber2 === subscriber) {
            return true;
        }
        if (subscriberFlags & 8 /* SubscribersRest */) {
            // no need to check length; if the flag is set, there's always at least one
            const subscribers = this._batchedSubscribersRest;
            for (let i = 0, ii = subscribers.length; i < ii; ++i) {
                if (subscribers[i] === subscriber) {
                    return true;
                }
            }
        }
        return false;
    }

    const defineProperty = Reflect.defineProperty;
    // note: we're reusing the same object for setting all descriptors, just changing some properties as needed
    //   this works, because the properties are copied by defineProperty (so changing them afterwards doesn't affect existing descriptors)
    // see also: https://tc39.github.io/ecma262/#sec-topropertydescriptor
    const observedPropertyDescriptor = {
        get: undefined,
        set: undefined,
        enumerable: true,
        configurable: true
    };
    function subscribe(subscriber) {
        if (this.observing === false) {
            this.observing = true;
            const { obj, propertyKey } = this;
            this.currentValue = obj[propertyKey];
            observedPropertyDescriptor.get = () => this.getValue();
            observedPropertyDescriptor.set = value => { this.setValue(value, LifecycleFlags.updateTargetInstance); };
            if (!defineProperty(obj, propertyKey, observedPropertyDescriptor)) {
                Reporter.write(1, propertyKey, obj);
            }
        }
        this.addSubscriber(subscriber);
    }
    function dispose() {
        // tslint:disable-next-line:no-dynamic-delete
        delete this.obj[this.propertyKey];
        this.obj = null;
        this.propertyKey = null;
        this.currentValue = null;
    }
    function propertyObserver() {
        return function (target) {
            subscriberCollection(MutationKind.instance)(target);
            const proto = target.prototype;
            proto.observing = false;
            proto.obj = null;
            proto.propertyKey = null;
            // Note: this will generate some "false positive" changes when setting a target undefined from a source undefined,
            // but those aren't harmful because the changes won't be propagated through to subscribers during $bind anyway.
            // It will, however, solve some "false negative" changes when the source value is undefined but the target value is not;
            // in such cases, this.currentValue in the observer being undefined will block the change from propagating to the target.
            // This is likely not working correctly in vCurrent either.
            proto.currentValue = Symbol();
            proto.subscribe = proto.subscribe || subscribe;
            proto.unsubscribe = proto.unsubscribe || proto.removeSubscriber;
            proto.dispose = proto.dispose || dispose;
        };
    }

    let SetterObserver = class SetterObserver {
        constructor(obj, propertyKey) {
            this.obj = obj;
            this.propertyKey = propertyKey;
        }
        getValue() {
            return this.currentValue;
        }
        setValue(newValue, flags) {
            const currentValue = this.currentValue;
            if (currentValue !== newValue) {
                this.currentValue = newValue;
                if (!(flags & LifecycleFlags.fromBind)) {
                    this.callSubscribers(newValue, currentValue, flags);
                }
                // If subscribe() has been called, the target property descriptor is replaced by these getter/setter methods,
                // so calling obj[propertyKey] will actually return this.currentValue.
                // However, if subscribe() was not yet called (indicated by !this.observing), the target descriptor
                // is unmodified and we need to explicitly set the property value.
                // This will happen in one-time, to-view and two-way bindings during $bind, meaning that the $bind will not actually update the target value.
                // This wasn't visible in vCurrent due to connect-queue always doing a delayed update, so in many cases it didn't matter whether $bind updated the target or not.
                if (!this.observing) {
                    this.obj[this.propertyKey] = newValue;
                }
            }
        }
    };
    SetterObserver = __decorate([
        propertyObserver()
    ], SetterObserver);

    var RuntimeError;
    (function (RuntimeError) {
        RuntimeError[RuntimeError["UndefinedScope"] = 250] = "UndefinedScope";
        RuntimeError[RuntimeError["NullScope"] = 251] = "NullScope";
        RuntimeError[RuntimeError["NilOverrideContext"] = 252] = "NilOverrideContext";
        RuntimeError[RuntimeError["NilParentScope"] = 253] = "NilParentScope";
    })(RuntimeError || (RuntimeError = {}));
    /** @internal */
    class InternalObserversLookup {
        getOrCreate(obj, key) {
            let observer = this[key];
            if (observer === undefined) {
                observer = this[key] = new SetterObserver(obj, key);
            }
            return observer;
        }
    }
    class BindingContext {
        constructor(keyOrObj, value) {
            this.$synthetic = true;
            if (keyOrObj !== undefined) {
                if (value !== undefined) {
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
        static create(keyOrObj, value) {
            return new BindingContext(keyOrObj, value);
        }
        static get(scope, name, ancestor, flags) {
            if (scope === undefined) {
                throw Reporter.error(250 /* UndefinedScope */);
            }
            if (scope === null) {
                throw Reporter.error(251 /* NullScope */);
            }
            let overrideContext = scope.overrideContext;
            if (ancestor > 0) {
                // jump up the required number of ancestor contexts (eg $parent.$parent requires two jumps)
                while (ancestor > 0) {
                    if (overrideContext.parentOverrideContext === null) {
                        return undefined;
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
            if ((flags & LifecycleFlags.allowParentScopeTraversal) && scope.parentScope !== null) {
                const result = this.get(scope.parentScope, name, ancestor, flags
                    // unset the flag; only allow one level of scope boundary traversal
                    & ~LifecycleFlags.allowParentScopeTraversal
                    // tell the scope to return null if the name could not be found
                    | LifecycleFlags.isTraversingParentScope);
                if (result !== null) {
                    return result;
                }
            }
            // still nothing found. return the root binding context (or null
            // if this is a parent scope traversal, to ensure we fall back to the
            // correct level)
            if (flags & LifecycleFlags.isTraversingParentScope) {
                return null;
            }
            return scope.bindingContext || scope.overrideContext;
        }
        getObservers() {
            let observers = this.$observers;
            if (observers === undefined) {
                this.$observers = observers = new InternalObserversLookup();
            }
            return observers;
        }
    }
    class Scope {
        constructor(bindingContext, overrideContext) {
            this.bindingContext = bindingContext;
            this.overrideContext = overrideContext;
            this.parentScope = null;
        }
        static create(bc, oc) {
            return new Scope(bc, oc === null || oc === undefined ? OverrideContext.create(bc, oc) : oc);
        }
        static fromOverride(oc) {
            if (oc === null || oc === undefined) {
                throw Reporter.error(252 /* NilOverrideContext */);
            }
            return new Scope(oc.bindingContext, oc);
        }
        static fromParent(ps, bc) {
            if (ps === null || ps === undefined) {
                throw Reporter.error(253 /* NilParentScope */);
            }
            return new Scope(bc, OverrideContext.create(bc, ps.overrideContext));
        }
    }
    class OverrideContext {
        constructor(bindingContext, parentOverrideContext) {
            this.$synthetic = true;
            this.bindingContext = bindingContext;
            this.parentOverrideContext = parentOverrideContext;
        }
        static create(bc, poc) {
            return new OverrideContext(bc, poc === undefined ? null : poc);
        }
        getObservers() {
            let observers = this.$observers;
            if (observers === undefined) {
                this.$observers = observers = new InternalObserversLookup();
            }
            return observers;
        }
    }

    const ISignaler = DI.createInterface('ISignaler').withDefault(x => x.singleton(Signaler));
    /** @internal */
    class Signaler {
        constructor() {
            this.signals = Object.create(null);
        }
        dispatchSignal(name, flags) {
            const listeners = this.signals[name];
            if (listeners === undefined) {
                return;
            }
            for (const listener of listeners.keys()) {
                listener.handleChange(undefined, undefined, flags | LifecycleFlags.updateTargetInstance);
            }
        }
        addSignalListener(name, listener) {
            const signals = this.signals;
            const listeners = signals[name];
            if (listeners === undefined) {
                signals[name] = new Set([listener]);
            }
            else {
                listeners.add(listener);
            }
        }
        removeSignalListener(name, listener) {
            const listeners = this.signals[name];
            if (listeners) {
                listeners.delete(listener);
            }
        }
    }

    function register(container) {
        const resourceKey = BindingBehaviorResource.keyFrom(this.description.name);
        container.register(Registration.singleton(resourceKey, this));
    }
    function bindingBehavior(nameOrDefinition) {
        return target => BindingBehaviorResource.define(nameOrDefinition, target);
    }
    function keyFrom(name) {
        return `${this.name}:${name}`;
    }
    function isType(Type) {
        return Type.kind === this;
    }
    function define(nameOrDefinition, ctor) {
        const Type = ctor;
        const description = typeof nameOrDefinition === 'string'
            ? { name: nameOrDefinition }
            : nameOrDefinition;
        Type.kind = BindingBehaviorResource;
        Type.description = description;
        Type.register = register;
        return Type;
    }
    const BindingBehaviorResource = {
        name: 'binding-behavior',
        keyFrom,
        isType,
        define
    };

    function register$1(container) {
        const resourceKey = this.kind.keyFrom(this.description.name);
        container.register(Registration.singleton(resourceKey, this));
    }
    function valueConverter(nameOrDefinition) {
        return target => ValueConverterResource.define(nameOrDefinition, target);
    }
    function keyFrom$1(name) {
        return `${this.name}:${name}`;
    }
    function isType$1(Type) {
        return Type.kind === this;
    }
    function define$1(nameOrDefinition, ctor) {
        const Type = ctor;
        const description = typeof nameOrDefinition === 'string'
            ? { name: nameOrDefinition }
            : nameOrDefinition;
        Type.kind = ValueConverterResource;
        Type.description = description;
        Type.register = register$1;
        return Type;
    }
    const ValueConverterResource = {
        name: 'value-converter',
        keyFrom: keyFrom$1,
        isType: isType$1,
        define: define$1
    };

    var ExpressionKind;
    (function (ExpressionKind) {
        ExpressionKind[ExpressionKind["Connects"] = 32] = "Connects";
        ExpressionKind[ExpressionKind["Observes"] = 64] = "Observes";
        ExpressionKind[ExpressionKind["CallsFunction"] = 128] = "CallsFunction";
        ExpressionKind[ExpressionKind["HasAncestor"] = 256] = "HasAncestor";
        ExpressionKind[ExpressionKind["IsPrimary"] = 512] = "IsPrimary";
        ExpressionKind[ExpressionKind["IsLeftHandSide"] = 1024] = "IsLeftHandSide";
        ExpressionKind[ExpressionKind["HasBind"] = 2048] = "HasBind";
        ExpressionKind[ExpressionKind["HasUnbind"] = 4096] = "HasUnbind";
        ExpressionKind[ExpressionKind["IsAssignable"] = 8192] = "IsAssignable";
        ExpressionKind[ExpressionKind["IsLiteral"] = 16384] = "IsLiteral";
        ExpressionKind[ExpressionKind["IsResource"] = 32768] = "IsResource";
        ExpressionKind[ExpressionKind["IsForDeclaration"] = 65536] = "IsForDeclaration";
        ExpressionKind[ExpressionKind["Type"] = 31] = "Type";
        // ---------------------------------------------------------------------------------------------------------------------------
        ExpressionKind[ExpressionKind["AccessThis"] = 1793] = "AccessThis";
        ExpressionKind[ExpressionKind["AccessScope"] = 10082] = "AccessScope";
        ExpressionKind[ExpressionKind["ArrayLiteral"] = 17955] = "ArrayLiteral";
        ExpressionKind[ExpressionKind["ObjectLiteral"] = 17956] = "ObjectLiteral";
        ExpressionKind[ExpressionKind["PrimitiveLiteral"] = 17925] = "PrimitiveLiteral";
        ExpressionKind[ExpressionKind["Template"] = 17958] = "Template";
        ExpressionKind[ExpressionKind["Unary"] = 39] = "Unary";
        ExpressionKind[ExpressionKind["CallScope"] = 1448] = "CallScope";
        ExpressionKind[ExpressionKind["CallMember"] = 1161] = "CallMember";
        ExpressionKind[ExpressionKind["CallFunction"] = 1162] = "CallFunction";
        ExpressionKind[ExpressionKind["AccessMember"] = 9323] = "AccessMember";
        ExpressionKind[ExpressionKind["AccessKeyed"] = 9324] = "AccessKeyed";
        ExpressionKind[ExpressionKind["TaggedTemplate"] = 1197] = "TaggedTemplate";
        ExpressionKind[ExpressionKind["Binary"] = 46] = "Binary";
        ExpressionKind[ExpressionKind["Conditional"] = 63] = "Conditional";
        ExpressionKind[ExpressionKind["Assign"] = 8208] = "Assign";
        ExpressionKind[ExpressionKind["ValueConverter"] = 36913] = "ValueConverter";
        ExpressionKind[ExpressionKind["BindingBehavior"] = 38962] = "BindingBehavior";
        ExpressionKind[ExpressionKind["HtmlLiteral"] = 51] = "HtmlLiteral";
        ExpressionKind[ExpressionKind["ArrayBindingPattern"] = 65556] = "ArrayBindingPattern";
        ExpressionKind[ExpressionKind["ObjectBindingPattern"] = 65557] = "ObjectBindingPattern";
        ExpressionKind[ExpressionKind["BindingIdentifier"] = 65558] = "BindingIdentifier";
        ExpressionKind[ExpressionKind["ForOfStatement"] = 55] = "ForOfStatement";
        ExpressionKind[ExpressionKind["Interpolation"] = 24] = "Interpolation"; //
    })(ExpressionKind || (ExpressionKind = {}));
    function connects(expr) {
        return (expr.$kind & 32 /* Connects */) === 32 /* Connects */;
    }
    function observes(expr) {
        return (expr.$kind & 64 /* Observes */) === 64 /* Observes */;
    }
    function callsFunction(expr) {
        return (expr.$kind & 128 /* CallsFunction */) === 128 /* CallsFunction */;
    }
    function hasAncestor(expr) {
        return (expr.$kind & 256 /* HasAncestor */) === 256 /* HasAncestor */;
    }
    function isAssignable(expr) {
        return (expr.$kind & 8192 /* IsAssignable */) === 8192 /* IsAssignable */;
    }
    function isLeftHandSide(expr) {
        return (expr.$kind & 1024 /* IsLeftHandSide */) === 1024 /* IsLeftHandSide */;
    }
    function isPrimary(expr) {
        return (expr.$kind & 512 /* IsPrimary */) === 512 /* IsPrimary */;
    }
    function isResource(expr) {
        return (expr.$kind & 32768 /* IsResource */) === 32768 /* IsResource */;
    }
    function hasBind(expr) {
        return (expr.$kind & 2048 /* HasBind */) === 2048 /* HasBind */;
    }
    function hasUnbind(expr) {
        return (expr.$kind & 4096 /* HasUnbind */) === 4096 /* HasUnbind */;
    }
    function isLiteral(expr) {
        return (expr.$kind & 16384 /* IsLiteral */) === 16384 /* IsLiteral */;
    }
    function arePureLiterals(expressions) {
        if (expressions === undefined || expressions.length === 0) {
            return true;
        }
        for (let i = 0; i < expressions.length; ++i) {
            if (!isPureLiteral(expressions[i])) {
                return false;
            }
        }
        return true;
    }
    function isPureLiteral(expr) {
        if (isLiteral(expr)) {
            switch (expr.$kind) {
                case 17955 /* ArrayLiteral */:
                    return arePureLiterals(expr.elements);
                case 17956 /* ObjectLiteral */:
                    return arePureLiterals(expr.values);
                case 17958 /* Template */:
                    return arePureLiterals(expr.expressions);
                case 17925 /* PrimitiveLiteral */:
                    return true;
            }
        }
        return false;
    }
    var RuntimeError$1;
    (function (RuntimeError) {
        RuntimeError[RuntimeError["NoLocator"] = 202] = "NoLocator";
        RuntimeError[RuntimeError["NoBehaviorFound"] = 203] = "NoBehaviorFound";
        RuntimeError[RuntimeError["BehaviorAlreadyApplied"] = 204] = "BehaviorAlreadyApplied";
        RuntimeError[RuntimeError["NoConverterFound"] = 205] = "NoConverterFound";
        RuntimeError[RuntimeError["NoBinding"] = 206] = "NoBinding";
        RuntimeError[RuntimeError["NotAFunction"] = 207] = "NotAFunction";
        RuntimeError[RuntimeError["UnknownOperator"] = 208] = "UnknownOperator";
        RuntimeError[RuntimeError["UndefinedScope"] = 250] = "UndefinedScope";
        RuntimeError[RuntimeError["NullScope"] = 251] = "NullScope";
    })(RuntimeError$1 || (RuntimeError$1 = {}));
    class BindingBehavior {
        constructor(expression, name, args) {
            this.$kind = 38962 /* BindingBehavior */;
            this.expression = expression;
            this.name = name;
            this.args = args;
            this.behaviorKey = BindingBehaviorResource.keyFrom(this.name);
            this.expressionHasBind = hasBind(expression);
            this.expressionHasUnbind = hasUnbind(expression);
        }
        evaluate(flags, scope, locator) {
            return this.expression.evaluate(flags, scope, locator);
        }
        assign(flags, scope, locator, value) {
            return this.expression.assign(flags, scope, locator, value);
        }
        connect(flags, scope, binding) {
            this.expression.connect(flags, scope, binding);
        }
        bind(flags, scope, binding) {
            if (scope === undefined) {
                throw Reporter.error(250 /* UndefinedScope */, this);
            }
            if (scope === null) {
                throw Reporter.error(251 /* NullScope */, this);
            }
            if (!binding) {
                throw Reporter.error(206 /* NoBinding */, this);
            }
            const locator = binding.locator;
            if (!locator) {
                throw Reporter.error(202 /* NoLocator */, this);
            }
            if (this.expressionHasBind) {
                this.expression.bind(flags, scope, binding);
            }
            const behaviorKey = this.behaviorKey;
            const behavior = locator.get(behaviorKey);
            if (!behavior) {
                throw Reporter.error(203 /* NoBehaviorFound */, this);
            }
            if (binding[behaviorKey] !== undefined && binding[behaviorKey] !== null) {
                throw Reporter.error(204 /* BehaviorAlreadyApplied */, this);
            }
            binding[behaviorKey] = behavior;
            behavior.bind.apply(behavior, [flags, scope, binding].concat(evalList(flags, scope, locator, this.args)));
        }
        unbind(flags, scope, binding) {
            const behaviorKey = this.behaviorKey;
            binding[behaviorKey].unbind(flags, scope, binding);
            binding[behaviorKey] = null;
            if (this.expressionHasUnbind) {
                this.expression.unbind(flags, scope, binding);
            }
        }
        accept(visitor) {
            return visitor.visitBindingBehavior(this);
        }
    }
    class ValueConverter {
        constructor(expression, name, args) {
            this.$kind = 36913 /* ValueConverter */;
            this.expression = expression;
            this.name = name;
            this.args = args;
            this.converterKey = ValueConverterResource.keyFrom(this.name);
        }
        evaluate(flags, scope, locator) {
            if (!locator) {
                throw Reporter.error(202 /* NoLocator */, this);
            }
            const converter = locator.get(this.converterKey);
            if (!converter) {
                throw Reporter.error(205 /* NoConverterFound */, this);
            }
            if ('toView' in converter) {
                const args = this.args;
                const len = args.length;
                const result = Array(len + 1);
                result[0] = this.expression.evaluate(flags, scope, locator);
                for (let i = 0; i < len; ++i) {
                    result[i + 1] = args[i].evaluate(flags, scope, locator);
                }
                return converter.toView.apply(converter, result);
            }
            return this.expression.evaluate(flags, scope, locator);
        }
        assign(flags, scope, locator, value) {
            if (!locator) {
                throw Reporter.error(202 /* NoLocator */, this);
            }
            const converter = locator.get(this.converterKey);
            if (!converter) {
                throw Reporter.error(205 /* NoConverterFound */, this);
            }
            if ('fromView' in converter) {
                value = converter.fromView.apply(converter, [value].concat(evalList(flags, scope, locator, this.args)));
            }
            return this.expression.assign(flags, scope, locator, value);
        }
        connect(flags, scope, binding) {
            if (scope === undefined) {
                throw Reporter.error(250 /* UndefinedScope */, this);
            }
            if (scope === null) {
                throw Reporter.error(251 /* NullScope */, this);
            }
            if (!binding) {
                throw Reporter.error(206 /* NoBinding */, this);
            }
            const locator = binding.locator;
            if (!locator) {
                throw Reporter.error(202 /* NoLocator */, this);
            }
            this.expression.connect(flags, scope, binding);
            const args = this.args;
            for (let i = 0, ii = args.length; i < ii; ++i) {
                args[i].connect(flags, scope, binding);
            }
            const converter = locator.get(this.converterKey);
            if (!converter) {
                throw Reporter.error(205 /* NoConverterFound */, this);
            }
            const signals = converter.signals;
            if (signals === undefined) {
                return;
            }
            const signaler = locator.get(ISignaler);
            for (let i = 0, ii = signals.length; i < ii; ++i) {
                signaler.addSignalListener(signals[i], binding);
            }
        }
        unbind(flags, scope, binding) {
            const locator = binding.locator;
            const converter = locator.get(this.converterKey);
            const signals = converter.signals;
            if (signals === undefined) {
                return;
            }
            const signaler = locator.get(ISignaler);
            for (let i = 0, ii = signals.length; i < ii; ++i) {
                signaler.removeSignalListener(signals[i], binding);
            }
        }
        accept(visitor) {
            return visitor.visitValueConverter(this);
        }
    }
    class Assign {
        constructor(target, value) {
            this.$kind = 8208 /* Assign */;
            this.target = target;
            this.value = value;
        }
        evaluate(flags, scope, locator) {
            return this.target.assign(flags, scope, locator, this.value.evaluate(flags, scope, locator));
        }
        connect(flags, scope, binding) {
            return;
        }
        assign(flags, scope, locator, value) {
            this.value.assign(flags, scope, locator, value);
            return this.target.assign(flags, scope, locator, value);
        }
        accept(visitor) {
            return visitor.visitAssign(this);
        }
    }
    class Conditional {
        constructor(condition, yes, no) {
            this.$kind = 63 /* Conditional */;
            this.assign = PLATFORM.noop;
            this.condition = condition;
            this.yes = yes;
            this.no = no;
        }
        evaluate(flags, scope, locator) {
            return (!!this.condition.evaluate(flags, scope, locator))
                ? this.yes.evaluate(flags, scope, locator)
                : this.no.evaluate(flags, scope, locator);
        }
        connect(flags, scope, binding) {
            const condition = this.condition;
            if (condition.evaluate(flags, scope, null)) {
                this.condition.connect(flags, scope, binding);
                this.yes.connect(flags, scope, binding);
            }
            else {
                this.condition.connect(flags, scope, binding);
                this.no.connect(flags, scope, binding);
            }
        }
        accept(visitor) {
            return visitor.visitConditional(this);
        }
    }
    class AccessThis {
        constructor(ancestor = 0) {
            this.$kind = 1793 /* AccessThis */;
            this.assign = PLATFORM.noop;
            this.connect = PLATFORM.noop;
            this.ancestor = ancestor;
        }
        evaluate(flags, scope, locator) {
            if (scope === undefined) {
                throw Reporter.error(250 /* UndefinedScope */, this);
            }
            if (scope === null) {
                throw Reporter.error(251 /* NullScope */, this);
            }
            let oc = scope.overrideContext;
            let i = this.ancestor;
            while (i-- && oc) {
                oc = oc.parentOverrideContext;
            }
            return i < 1 && oc ? oc.bindingContext : undefined;
        }
        accept(visitor) {
            return visitor.visitAccessThis(this);
        }
    }
    AccessThis.$this = new AccessThis(0);
    AccessThis.$parent = new AccessThis(1);
    class AccessScope {
        constructor(name, ancestor = 0) {
            this.$kind = 10082 /* AccessScope */;
            this.name = name;
            this.ancestor = ancestor;
        }
        evaluate(flags, scope, locator) {
            const name = this.name;
            return BindingContext.get(scope, name, this.ancestor, flags)[name];
        }
        assign(flags, scope, locator, value) {
            const name = this.name;
            const context = BindingContext.get(scope, name, this.ancestor, flags);
            return context ? (context[name] = value) : undefined;
        }
        connect(flags, scope, binding) {
            const name = this.name;
            const context = BindingContext.get(scope, name, this.ancestor, flags);
            binding.observeProperty(context, name);
        }
        accept(visitor) {
            return visitor.visitAccessScope(this);
        }
    }
    class AccessMember {
        constructor(object, name) {
            this.$kind = 9323 /* AccessMember */;
            this.object = object;
            this.name = name;
        }
        evaluate(flags, scope, locator) {
            const instance = this.object.evaluate(flags, scope, locator);
            return instance === null || instance === undefined ? instance : instance[this.name];
        }
        assign(flags, scope, locator, value) {
            let instance = this.object.evaluate(flags, scope, locator);
            if (instance === null || typeof instance !== 'object') {
                instance = {};
                this.object.assign(flags, scope, locator, instance);
            }
            instance[this.name] = value;
            return value;
        }
        connect(flags, scope, binding) {
            const obj = this.object.evaluate(flags, scope, null);
            this.object.connect(flags, scope, binding);
            if (obj) {
                binding.observeProperty(obj, this.name);
            }
        }
        accept(visitor) {
            return visitor.visitAccessMember(this);
        }
    }
    class AccessKeyed {
        constructor(object, key) {
            this.$kind = 9324 /* AccessKeyed */;
            this.object = object;
            this.key = key;
        }
        evaluate(flags, scope, locator) {
            const instance = this.object.evaluate(flags, scope, locator);
            if (instance === null || instance === undefined) {
                return undefined;
            }
            const key = this.key.evaluate(flags, scope, locator);
            // note: getKeyed and setKeyed are removed because they are identical to the default spec behavior
            // and the runtime does this this faster
            return instance[key];
        }
        assign(flags, scope, locator, value) {
            const instance = this.object.evaluate(flags, scope, locator);
            const key = this.key.evaluate(flags, scope, locator);
            return instance[key] = value;
        }
        connect(flags, scope, binding) {
            const obj = this.object.evaluate(flags, scope, null);
            this.object.connect(flags, scope, binding);
            if (typeof obj === 'object' && obj !== null) {
                this.key.connect(flags, scope, binding);
                const key = this.key.evaluate(flags, scope, null);
                // observe the property represented by the key as long as it's not an array indexer
                // (note: string indexers behave the same way as numeric indexers as long as they represent numbers)
                if (!(Array.isArray(obj) && isNumeric(key))) {
                    binding.observeProperty(obj, key);
                }
            }
        }
        accept(visitor) {
            return visitor.visitAccessKeyed(this);
        }
    }
    class CallScope {
        constructor(name, args, ancestor = 0) {
            this.$kind = 1448 /* CallScope */;
            this.assign = PLATFORM.noop;
            this.name = name;
            this.args = args;
            this.ancestor = ancestor;
        }
        evaluate(flags, scope, locator) {
            const args = evalList(flags, scope, locator, this.args);
            const context = BindingContext.get(scope, this.name, this.ancestor, flags);
            const func = getFunction(flags, context, this.name);
            if (func) {
                return func.apply(context, args);
            }
            return undefined;
        }
        connect(flags, scope, binding) {
            const args = this.args;
            for (let i = 0, ii = args.length; i < ii; ++i) {
                args[i].connect(flags, scope, binding);
            }
        }
        accept(visitor) {
            return visitor.visitCallScope(this);
        }
    }
    class CallMember {
        constructor(object, name, args) {
            this.$kind = 1161 /* CallMember */;
            this.assign = PLATFORM.noop;
            this.object = object;
            this.name = name;
            this.args = args;
        }
        evaluate(flags, scope, locator) {
            const instance = this.object.evaluate(flags, scope, locator);
            const args = evalList(flags, scope, locator, this.args);
            const func = getFunction(flags, instance, this.name);
            if (func) {
                return func.apply(instance, args);
            }
            return undefined;
        }
        connect(flags, scope, binding) {
            const obj = this.object.evaluate(flags, scope, null);
            this.object.connect(flags, scope, binding);
            if (getFunction(flags & ~LifecycleFlags.mustEvaluate, obj, this.name)) {
                const args = this.args;
                for (let i = 0, ii = args.length; i < ii; ++i) {
                    args[i].connect(flags, scope, binding);
                }
            }
        }
        accept(visitor) {
            return visitor.visitCallMember(this);
        }
    }
    class CallFunction {
        constructor(func, args) {
            this.$kind = 1162 /* CallFunction */;
            this.assign = PLATFORM.noop;
            this.func = func;
            this.args = args;
        }
        evaluate(flags, scope, locator) {
            const func = this.func.evaluate(flags, scope, locator);
            if (typeof func === 'function') {
                return func.apply(null, evalList(flags, scope, locator, this.args));
            }
            if (!(flags & LifecycleFlags.mustEvaluate) && (func === null || func === undefined)) {
                return undefined;
            }
            throw Reporter.error(207 /* NotAFunction */, this);
        }
        connect(flags, scope, binding) {
            const func = this.func.evaluate(flags, scope, null);
            this.func.connect(flags, scope, binding);
            if (typeof func === 'function') {
                const args = this.args;
                for (let i = 0, ii = args.length; i < ii; ++i) {
                    args[i].connect(flags, scope, binding);
                }
            }
        }
        accept(visitor) {
            return visitor.visitCallFunction(this);
        }
    }
    class Binary {
        constructor(operation, left, right) {
            this.$kind = 46 /* Binary */;
            this.assign = PLATFORM.noop;
            this.operation = operation;
            this.left = left;
            this.right = right;
            // what we're doing here is effectively moving the large switch statement from evaluate to the constructor
            // so that the check only needs to be done once, and evaluate (which is called many times) will have a lot less
            // work to do; we can do this because the operation can't change after it's parsed
            this.evaluate = this[operation];
        }
        evaluate(flags, scope, locator) {
            throw Reporter.error(208 /* UnknownOperator */, this);
        }
        connect(flags, scope, binding) {
            const left = this.left.evaluate(flags, scope, null);
            this.left.connect(flags, scope, binding);
            if (this.operation === '&&' && !left || this.operation === '||' && left) {
                return;
            }
            this.right.connect(flags, scope, binding);
        }
        ['&&'](f, s, l) {
            return this.left.evaluate(f, s, l) && this.right.evaluate(f, s, l);
        }
        ['||'](f, s, l) {
            return this.left.evaluate(f, s, l) || this.right.evaluate(f, s, l);
        }
        ['=='](f, s, l) {
            // tslint:disable-next-line:triple-equals
            return this.left.evaluate(f, s, l) == this.right.evaluate(f, s, l);
        }
        ['==='](f, s, l) {
            return this.left.evaluate(f, s, l) === this.right.evaluate(f, s, l);
        }
        ['!='](f, s, l) {
            // tslint:disable-next-line:triple-equals
            return this.left.evaluate(f, s, l) != this.right.evaluate(f, s, l);
        }
        ['!=='](f, s, l) {
            return this.left.evaluate(f, s, l) !== this.right.evaluate(f, s, l);
        }
        ['instanceof'](f, s, l) {
            const right = this.right.evaluate(f, s, l);
            if (typeof right === 'function') {
                return this.left.evaluate(f, s, l) instanceof right;
            }
            return false;
        }
        ['in'](f, s, l) {
            const right = this.right.evaluate(f, s, l);
            if (right !== null && typeof right === 'object') {
                return this.left.evaluate(f, s, l) in right;
            }
            return false;
        }
        // note: autoConvertAdd (and the null check) is removed because the default spec behavior is already largely similar
        // and where it isn't, you kind of want it to behave like the spec anyway (e.g. return NaN when adding a number to undefined)
        // this makes bugs in user code easier to track down for end users
        // also, skipping these checks and leaving it to the runtime is a nice little perf boost and simplifies our code
        ['+'](f, s, l) {
            return this.left.evaluate(f, s, l) + this.right.evaluate(f, s, l);
        }
        ['-'](f, s, l) {
            return this.left.evaluate(f, s, l) - this.right.evaluate(f, s, l);
        }
        ['*'](f, s, l) {
            return this.left.evaluate(f, s, l) * this.right.evaluate(f, s, l);
        }
        ['/'](f, s, l) {
            return this.left.evaluate(f, s, l) / this.right.evaluate(f, s, l);
        }
        ['%'](f, s, l) {
            return this.left.evaluate(f, s, l) % this.right.evaluate(f, s, l);
        }
        ['<'](f, s, l) {
            return this.left.evaluate(f, s, l) < this.right.evaluate(f, s, l);
        }
        ['>'](f, s, l) {
            return this.left.evaluate(f, s, l) > this.right.evaluate(f, s, l);
        }
        ['<='](f, s, l) {
            return this.left.evaluate(f, s, l) <= this.right.evaluate(f, s, l);
        }
        ['>='](f, s, l) {
            return this.left.evaluate(f, s, l) >= this.right.evaluate(f, s, l);
        }
        // tslint:disable-next-line:member-ordering
        accept(visitor) {
            return visitor.visitBinary(this);
        }
    }
    class Unary {
        constructor(operation, expression) {
            this.$kind = 39 /* Unary */;
            this.assign = PLATFORM.noop;
            this.operation = operation;
            this.expression = expression;
            // see Binary (we're doing the same thing here)
            this.evaluate = this[operation];
        }
        evaluate(flags, scope, locator) {
            throw Reporter.error(208 /* UnknownOperator */, this);
        }
        connect(flags, scope, binding) {
            this.expression.connect(flags, scope, binding);
        }
        ['void'](f, s, l) {
            return void this.expression.evaluate(f, s, l);
        }
        ['typeof'](f, s, l) {
            return typeof this.expression.evaluate(f, s, l);
        }
        ['!'](f, s, l) {
            return !this.expression.evaluate(f, s, l);
        }
        ['-'](f, s, l) {
            return -this.expression.evaluate(f, s, l);
        }
        ['+'](f, s, l) {
            return +this.expression.evaluate(f, s, l);
        }
        accept(visitor) {
            return visitor.visitUnary(this);
        }
    }
    class PrimitiveLiteral {
        constructor(value) {
            this.$kind = 17925 /* PrimitiveLiteral */;
            this.assign = PLATFORM.noop;
            this.connect = PLATFORM.noop;
            this.value = value;
        }
        evaluate(flags, scope, locator) {
            return this.value;
        }
        accept(visitor) {
            return visitor.visitPrimitiveLiteral(this);
        }
    }
    PrimitiveLiteral.$undefined = new PrimitiveLiteral(undefined);
    PrimitiveLiteral.$null = new PrimitiveLiteral(null);
    PrimitiveLiteral.$true = new PrimitiveLiteral(true);
    PrimitiveLiteral.$false = new PrimitiveLiteral(false);
    PrimitiveLiteral.$empty = new PrimitiveLiteral('');
    class HtmlLiteral {
        constructor(parts) {
            this.$kind = 51 /* HtmlLiteral */;
            this.assign = PLATFORM.noop;
            this.parts = parts;
        }
        evaluate(flags, scope, locator) {
            const elements = this.parts;
            let result = '';
            for (let i = 0, ii = elements.length; i < ii; ++i) {
                const value = elements[i].evaluate(flags, scope, locator);
                if (value === undefined || value === null) {
                    continue;
                }
                result += value;
            }
            return result;
        }
        connect(flags, scope, binding) {
            for (let i = 0, ii = this.parts.length; i < ii; ++i) {
                this.parts[i].connect(flags, scope, binding);
            }
        }
        accept(visitor) {
            return visitor.visitHtmlLiteral(this);
        }
    }
    class ArrayLiteral {
        constructor(elements) {
            this.$kind = 17955 /* ArrayLiteral */;
            this.assign = PLATFORM.noop;
            this.elements = elements;
        }
        evaluate(flags, scope, locator) {
            const elements = this.elements;
            const length = elements.length;
            const result = Array(length);
            for (let i = 0; i < length; ++i) {
                result[i] = elements[i].evaluate(flags, scope, locator);
            }
            return result;
        }
        connect(flags, scope, binding) {
            const elements = this.elements;
            for (let i = 0, ii = elements.length; i < ii; ++i) {
                elements[i].connect(flags, scope, binding);
            }
        }
        accept(visitor) {
            return visitor.visitArrayLiteral(this);
        }
    }
    ArrayLiteral.$empty = new ArrayLiteral(PLATFORM.emptyArray);
    class ObjectLiteral {
        constructor(keys, values) {
            this.$kind = 17956 /* ObjectLiteral */;
            this.assign = PLATFORM.noop;
            this.keys = keys;
            this.values = values;
        }
        evaluate(flags, scope, locator) {
            const instance = {};
            const keys = this.keys;
            const values = this.values;
            for (let i = 0, ii = keys.length; i < ii; ++i) {
                instance[keys[i]] = values[i].evaluate(flags, scope, locator);
            }
            return instance;
        }
        connect(flags, scope, binding) {
            const keys = this.keys;
            const values = this.values;
            for (let i = 0, ii = keys.length; i < ii; ++i) {
                values[i].connect(flags, scope, binding);
            }
        }
        accept(visitor) {
            return visitor.visitObjectLiteral(this);
        }
    }
    ObjectLiteral.$empty = new ObjectLiteral(PLATFORM.emptyArray, PLATFORM.emptyArray);
    class Template {
        constructor(cooked, expressions) {
            this.$kind = 17958 /* Template */;
            this.assign = PLATFORM.noop;
            this.cooked = cooked;
            this.expressions = expressions === undefined ? PLATFORM.emptyArray : expressions;
        }
        evaluate(flags, scope, locator) {
            const expressions = this.expressions;
            const cooked = this.cooked;
            let result = cooked[0];
            for (let i = 0, ii = expressions.length; i < ii; ++i) {
                result += expressions[i].evaluate(flags, scope, locator);
                result += cooked[i + 1];
            }
            return result;
        }
        connect(flags, scope, binding) {
            const expressions = this.expressions;
            for (let i = 0, ii = expressions.length; i < ii; ++i) {
                expressions[i].connect(flags, scope, binding);
                i++;
            }
        }
        accept(visitor) {
            return visitor.visitTemplate(this);
        }
    }
    Template.$empty = new Template(['']);
    class TaggedTemplate {
        constructor(cooked, raw, func, expressions) {
            this.$kind = 1197 /* TaggedTemplate */;
            this.assign = PLATFORM.noop;
            this.cooked = cooked;
            this.cooked.raw = raw;
            this.func = func;
            this.expressions = expressions === undefined ? PLATFORM.emptyArray : expressions;
        }
        evaluate(flags, scope, locator) {
            const expressions = this.expressions;
            const len = expressions.length;
            const results = Array(len);
            for (let i = 0, ii = len; i < ii; ++i) {
                results[i] = expressions[i].evaluate(flags, scope, locator);
            }
            const func = this.func.evaluate(flags, scope, locator);
            if (typeof func !== 'function') {
                throw Reporter.error(207 /* NotAFunction */, this);
            }
            return func.apply(null, [this.cooked].concat(results));
        }
        connect(flags, scope, binding) {
            const expressions = this.expressions;
            for (let i = 0, ii = expressions.length; i < ii; ++i) {
                expressions[i].connect(flags, scope, binding);
            }
            this.func.connect(flags, scope, binding);
        }
        accept(visitor) {
            return visitor.visitTaggedTemplate(this);
        }
    }
    class ArrayBindingPattern {
        // We'll either have elements, or keys+values, but never all 3
        constructor(elements) {
            this.$kind = 65556 /* ArrayBindingPattern */;
            this.elements = elements;
        }
        evaluate(flags, scope, locator) {
            // TODO
            return undefined;
        }
        assign(flags, scope, locator, obj) {
            // TODO
            return undefined;
        }
        connect(flags, scope, binding) {
            return;
        }
        accept(visitor) {
            return visitor.visitArrayBindingPattern(this);
        }
    }
    class ObjectBindingPattern {
        // We'll either have elements, or keys+values, but never all 3
        constructor(keys, values) {
            this.$kind = 65557 /* ObjectBindingPattern */;
            this.keys = keys;
            this.values = values;
        }
        evaluate(flags, scope, locator) {
            // TODO
            return undefined;
        }
        assign(flags, scope, locator, obj) {
            // TODO
            return undefined;
        }
        connect(flags, scope, binding) {
            return;
        }
        accept(visitor) {
            return visitor.visitObjectBindingPattern(this);
        }
    }
    class BindingIdentifier {
        constructor(name) {
            this.$kind = 65558 /* BindingIdentifier */;
            this.name = name;
        }
        evaluate(flags, scope, locator) {
            return this.name;
        }
        connect(flags, scope, binding) {
            return;
        }
        accept(visitor) {
            return visitor.visitBindingIdentifier(this);
        }
    }
    const toStringTag = Object.prototype.toString;
    // https://tc39.github.io/ecma262/#sec-iteration-statements
    // https://tc39.github.io/ecma262/#sec-for-in-and-for-of-statements
    class ForOfStatement {
        constructor(declaration, iterable) {
            this.$kind = 55 /* ForOfStatement */;
            this.assign = PLATFORM.noop;
            this.declaration = declaration;
            this.iterable = iterable;
        }
        evaluate(flags, scope, locator) {
            return this.iterable.evaluate(flags, scope, locator);
        }
        count(result) {
            return CountForOfStatement[toStringTag.call(result)](result);
        }
        iterate(result, func) {
            IterateForOfStatement[toStringTag.call(result)](result, func);
        }
        connect(flags, scope, binding) {
            this.declaration.connect(flags, scope, binding);
            this.iterable.connect(flags, scope, binding);
        }
        accept(visitor) {
            return visitor.visitForOfStatement(this);
        }
    }
    /*
    * Note: this implementation is far simpler than the one in vCurrent and might be missing important stuff (not sure yet)
    * so while this implementation is identical to Template and we could reuse that one, we don't want to lock outselves in to potentially the wrong abstraction
    * but this class might be a candidate for removal if it turns out it does provide all we need
    */
    class Interpolation {
        constructor(parts, expressions) {
            this.$kind = 24 /* Interpolation */;
            this.assign = PLATFORM.noop;
            this.parts = parts;
            this.expressions = expressions === undefined ? PLATFORM.emptyArray : expressions;
            this.isMulti = this.expressions.length > 1;
            this.firstExpression = this.expressions[0];
        }
        evaluate(flags, scope, locator) {
            if (this.isMulti) {
                const expressions = this.expressions;
                const parts = this.parts;
                let result = parts[0];
                for (let i = 0, ii = expressions.length; i < ii; ++i) {
                    result += expressions[i].evaluate(flags, scope, locator);
                    result += parts[i + 1];
                }
                return result;
            }
            else {
                const parts = this.parts;
                return parts[0] + this.firstExpression.evaluate(flags, scope, locator) + parts[1];
            }
        }
        connect(flags, scope, binding) {
            return;
        }
        accept(visitor) {
            return visitor.visitInterpolation(this);
        }
    }
    /*
    * Note: for a property that is always the same, directly assigning it to the prototype is more efficient CPU wise
    * (gets assigned once, instead of per constructor call) as well as memory wise (stored once, instead of per instance)
    *
    * This gives us a cheap way to add some extra information to the AST for the runtime to do things more efficiently.
    */
    BindingBehavior.prototype.$kind = 38962 /* BindingBehavior */;
    ValueConverter.prototype.$kind = 36913 /* ValueConverter */;
    Assign.prototype.$kind = 8208 /* Assign */;
    Conditional.prototype.$kind = 63 /* Conditional */;
    AccessThis.prototype.$kind = 1793 /* AccessThis */;
    AccessScope.prototype.$kind = 10082 /* AccessScope */;
    AccessMember.prototype.$kind = 9323 /* AccessMember */;
    AccessKeyed.prototype.$kind = 9324 /* AccessKeyed */;
    CallScope.prototype.$kind = 1448 /* CallScope */;
    CallMember.prototype.$kind = 1161 /* CallMember */;
    CallFunction.prototype.$kind = 1162 /* CallFunction */;
    Binary.prototype.$kind = 46 /* Binary */;
    Unary.prototype.$kind = 39 /* Unary */;
    PrimitiveLiteral.prototype.$kind = 17925 /* PrimitiveLiteral */;
    HtmlLiteral.prototype.$kind = 51 /* HtmlLiteral */;
    ArrayLiteral.prototype.$kind = 17955 /* ArrayLiteral */;
    ObjectLiteral.prototype.$kind = 17956 /* ObjectLiteral */;
    Template.prototype.$kind = 17958 /* Template */;
    TaggedTemplate.prototype.$kind = 1197 /* TaggedTemplate */;
    ArrayBindingPattern.prototype.$kind = 65556 /* ArrayBindingPattern */;
    ObjectBindingPattern.prototype.$kind = 65557 /* ObjectBindingPattern */;
    BindingIdentifier.prototype.$kind = 65558 /* BindingIdentifier */;
    ForOfStatement.prototype.$kind = 55 /* ForOfStatement */;
    Interpolation.prototype.$kind = 24 /* Interpolation */;
    /// Evaluate the [list] in context of the [scope].
    function evalList(flags, scope, locator, list) {
        const len = list.length;
        const result = Array(len);
        for (let i = 0; i < len; ++i) {
            result[i] = list[i].evaluate(flags, scope, locator);
        }
        return result;
    }
    function getFunction(flags, obj, name) {
        const func = obj === null || obj === undefined ? null : obj[name];
        if (typeof func === 'function') {
            return func;
        }
        if (!(flags & LifecycleFlags.mustEvaluate) && (func === null || func === undefined)) {
            return null;
        }
        throw Reporter.error(207 /* NotAFunction */, obj, name, func);
    }
    function isNumeric(value) {
        const valueType = typeof value;
        if (valueType === 'number')
            return true;
        if (valueType !== 'string')
            return false;
        const len = value.length;
        if (len === 0)
            return false;
        for (let i = 0; i < len; ++i) {
            const char = value.charCodeAt(i);
            if (char < 0x30 /*0*/ || char > 0x39 /*9*/) {
                return false;
            }
        }
        return true;
    }
    /** @internal */
    const IterateForOfStatement = {
        ['[object Array]'](result, func) {
            for (let i = 0, ii = result.length; i < ii; ++i) {
                func(result, i, result[i]);
            }
        },
        ['[object Map]'](result, func) {
            const arr = Array(result.size);
            let i = -1;
            for (const entry of result.entries()) {
                arr[++i] = entry;
            }
            IterateForOfStatement['[object Array]'](arr, func);
        },
        ['[object Set]'](result, func) {
            const arr = Array(result.size);
            let i = -1;
            for (const key of result.keys()) {
                arr[++i] = key;
            }
            IterateForOfStatement['[object Array]'](arr, func);
        },
        ['[object Number]'](result, func) {
            const arr = Array(result);
            for (let i = 0; i < result; ++i) {
                arr[i] = i;
            }
            IterateForOfStatement['[object Array]'](arr, func);
        },
        ['[object Null]'](result, func) {
            return;
        },
        ['[object Undefined]'](result, func) {
            return;
        }
    };
    /** @internal */
    const CountForOfStatement = {
        ['[object Array]'](result) { return result.length; },
        ['[object Map]'](result) { return result.size; },
        ['[object Set]'](result) { return result.size; },
        ['[object Number]'](result) { return result; },
        ['[object Null]'](result) { return 0; },
        ['[object Undefined]'](result) { return 0; }
    };

    /*
    * Note: the oneTime binding now has a non-zero value for 2 reasons:
    *  - plays nicer with bitwise operations (more consistent code, more explicit settings)
    *  - allows for potentially having something like BindingMode.oneTime | BindingMode.fromView, where an initial value is set once to the view but updates from the view also propagate back to the view model
    *
    * Furthermore, the "default" mode would be for simple ".bind" expressions to make it explicit for our logic that the default is being used.
    * This essentially adds extra information which binding could use to do smarter things and allows bindingBehaviors that add a mode instead of simply overwriting it
    */
    var BindingMode;
    (function (BindingMode) {
        BindingMode[BindingMode["oneTime"] = 1] = "oneTime";
        BindingMode[BindingMode["toView"] = 2] = "toView";
        BindingMode[BindingMode["fromView"] = 4] = "fromView";
        BindingMode[BindingMode["twoWay"] = 6] = "twoWay";
        BindingMode[BindingMode["default"] = 8] = "default";
    })(BindingMode || (BindingMode = {}));

    var State$1;
    (function (State) {
        State[State["none"] = 0] = "none";
        State[State["isBinding"] = 1] = "isBinding";
        State[State["isBound"] = 2] = "isBound";
        State[State["isAttaching"] = 4] = "isAttaching";
        State[State["isAttached"] = 8] = "isAttached";
        State[State["isMounted"] = 16] = "isMounted";
        State[State["isDetaching"] = 32] = "isDetaching";
        State[State["isUnbinding"] = 64] = "isUnbinding";
        State[State["isCached"] = 128] = "isCached";
        State[State["isContainerless"] = 256] = "isContainerless";
    })(State$1 || (State$1 = {}));
    var Hooks;
    (function (Hooks) {
        Hooks[Hooks["none"] = 1] = "none";
        Hooks[Hooks["hasCreated"] = 2] = "hasCreated";
        Hooks[Hooks["hasBinding"] = 4] = "hasBinding";
        Hooks[Hooks["hasBound"] = 8] = "hasBound";
        Hooks[Hooks["hasAttaching"] = 16] = "hasAttaching";
        Hooks[Hooks["hasAttached"] = 32] = "hasAttached";
        Hooks[Hooks["hasDetaching"] = 64] = "hasDetaching";
        Hooks[Hooks["hasDetached"] = 128] = "hasDetached";
        Hooks[Hooks["hasUnbinding"] = 256] = "hasUnbinding";
        Hooks[Hooks["hasUnbound"] = 512] = "hasUnbound";
        Hooks[Hooks["hasRender"] = 1024] = "hasRender";
        Hooks[Hooks["hasCaching"] = 2048] = "hasCaching";
    })(Hooks || (Hooks = {}));
    const IRenderable = DI.createInterface('IRenderable').noDefault();
    const IViewFactory = DI.createInterface('IViewFactory').noDefault();
    const marker = Object.freeze(Object.create(null));
    const ILifecycle = DI.createInterface('ILifecycle').withDefault(x => x.singleton(Lifecycle));
    /** @internal */
    class Lifecycle {
        constructor() {
            this.bindDepth = 0;
            this.attachDepth = 0;
            this.detachDepth = 0;
            this.unbindDepth = 0;
            this.flushHead = this;
            this.flushTail = this;
            this.connectHead = this; // this cast is safe because we know exactly which properties we'll use
            this.connectTail = this;
            this.patchHead = this;
            this.patchTail = this;
            this.boundHead = this;
            this.boundTail = this;
            this.mountHead = this;
            this.mountTail = this;
            this.attachedHead = this;
            this.attachedTail = this;
            this.unmountHead = this;
            this.unmountTail = this;
            this.detachedHead = this; //LOL
            this.detachedTail = this;
            this.unbindAfterDetachHead = this;
            this.unbindAfterDetachTail = this;
            this.unboundHead = this;
            this.unboundTail = this;
            this.flushed = null;
            this.promise = Promise.resolve();
            this.flushCount = 0;
            this.connectCount = 0;
            this.patchCount = 0;
            this.boundCount = 0;
            this.mountCount = 0;
            this.attachedCount = 0;
            this.unmountCount = 0;
            this.detachedCount = 0;
            this.unbindAfterDetachCount = 0;
            this.unboundCount = 0;
            this.$nextFlush = marker;
            this.flush = PLATFORM.noop;
            this.$nextConnect = marker;
            this.connect = PLATFORM.noop;
            this.$nextPatch = marker;
            this.patch = PLATFORM.noop;
            this.$nextBound = marker;
            this.bound = PLATFORM.noop;
            this.$nextMount = marker;
            this.$mount = PLATFORM.noop;
            this.$nextAttached = marker;
            this.attached = PLATFORM.noop;
            this.$nextUnmount = marker;
            this.$unmount = PLATFORM.noop;
            this.$nextDetached = marker;
            this.detached = PLATFORM.noop;
            this.$nextUnbindAfterDetach = marker;
            this.$unbind = PLATFORM.noop;
            this.$nextUnbound = marker;
            this.unbound = PLATFORM.noop;
            this.task = null;
        }
        registerTask(task) {
            if (this.task === null) {
                this.task = new AggregateLifecycleTask();
            }
            this.task.addTask(task);
        }
        finishTask(task) {
            if (this.task !== null) {
                if (this.task === task) {
                    this.task = null;
                }
                else {
                    this.task.removeTask(task);
                }
            }
        }
        enqueueFlush(requestor) {
            // Queue a flush() callback; the depth is just for debugging / testing purposes and has
            // no effect on execution. flush() will automatically be invoked when the promise resolves,
            // or it can be manually invoked synchronously.
            if (this.flushHead === this) {
                this.flushed = this.promise.then(() => { this.processFlushQueue(LifecycleFlags.fromAsyncFlush); });
            }
            if (requestor.$nextFlush === null) {
                requestor.$nextFlush = marker;
                this.flushTail.$nextFlush = requestor;
                this.flushTail = requestor;
                ++this.flushCount;
            }
            return this.flushed;
        }
        processFlushQueue(flags) {
            flags |= LifecycleFlags.fromSyncFlush;
            // flush callbacks may lead to additional flush operations, so keep looping until
            // the flush head is back to `this` (though this will typically happen in the first iteration)
            while (this.flushCount > 0) {
                let current = this.flushHead.$nextFlush;
                this.flushHead = this.flushTail = this;
                this.flushCount = 0;
                let next;
                do {
                    next = current.$nextFlush;
                    current.$nextFlush = null;
                    current.flush(flags);
                    current = next;
                } while (current !== marker);
                // doNotUpdateDOM will cause DOM updates to be re-queued which results in an infinite loop
                // unless we break here
                // Note that breaking on this flag is still not the ideal solution; future improvement would
                // be something like a separate DOM queue and a non-DOM queue, but for now this fixes the infinite
                // loop without breaking anything (apart from the edgiest of edge cases which are not yet tested)
                if (flags & LifecycleFlags.doNotUpdateDOM) {
                    break;
                }
            }
        }
        beginBind() {
            ++this.bindDepth;
        }
        enqueueBound(requestor) {
            // build a standard singly linked list for bound callbacks
            if (requestor.$nextBound === null) {
                requestor.$nextBound = marker;
                this.boundTail.$nextBound = requestor;
                this.boundTail = requestor;
                ++this.boundCount;
            }
        }
        enqueueConnect(requestor) {
            // enqueue connect and patch calls in separate lists so that they can be invoked
            // independently from eachother
            // TODO: see if we can eliminate/optimize some of this, because this is a relatively hot path
            // (first get all the necessary integration tests working, then look for optimizations)
            // build a standard singly linked list for connect callbacks
            if (requestor.$nextConnect === null) {
                requestor.$nextConnect = marker;
                this.connectTail.$nextConnect = requestor;
                this.connectTail = requestor;
                ++this.connectCount;
            }
            // build a standard singly linked list for patch callbacks
            if (requestor.$nextPatch === null) {
                requestor.$nextPatch = marker;
                this.patchTail.$nextPatch = requestor;
                this.patchTail = requestor;
                ++this.patchCount;
            }
        }
        processConnectQueue(flags) {
            // connects cannot lead to additional connects, so we don't need to loop here
            if (this.connectCount > 0) {
                this.connectCount = 0;
                let current = this.connectHead.$nextConnect;
                this.connectHead = this.connectTail = this;
                let next;
                do {
                    current.connect(flags);
                    next = current.$nextConnect;
                    current.$nextConnect = null;
                    current = next;
                } while (current !== marker);
            }
        }
        processPatchQueue(flags) {
            // flush before patching, but only if this is the initial bind;
            // no DOM is attached yet so we can safely let everything propagate
            if (flags & LifecycleFlags.fromStartTask) {
                this.processFlushQueue(flags | LifecycleFlags.fromSyncFlush);
            }
            // patch callbacks may lead to additional bind operations, so keep looping until
            // the patch head is back to `this` (though this will typically happen in the first iteration)
            while (this.patchCount > 0) {
                this.patchCount = 0;
                let current = this.patchHead.$nextPatch;
                this.patchHead = this.patchTail = this;
                let next;
                do {
                    current.patch(flags);
                    next = current.$nextPatch;
                    current.$nextPatch = null;
                    current = next;
                } while (current !== marker);
            }
        }
        endBind(flags) {
            // close / shrink a bind batch
            if (--this.bindDepth === 0) {
                if (this.task !== null && !this.task.done) {
                    this.task.owner = this;
                    return this.task;
                }
                this.processBindQueue(flags);
                return LifecycleTask.done;
            }
        }
        processBindQueue(flags) {
            // flush before processing bound callbacks, but only if this is the initial bind;
            // no DOM is attached yet so we can safely let everything propagate
            if (flags & LifecycleFlags.fromStartTask) {
                this.processFlushQueue(flags | LifecycleFlags.fromSyncFlush);
            }
            // bound callbacks may lead to additional bind operations, so keep looping until
            // the bound head is back to `this` (though this will typically happen in the first iteration)
            while (this.boundCount > 0) {
                this.boundCount = 0;
                let current = this.boundHead.$nextBound;
                let next;
                this.boundHead = this.boundTail = this;
                do {
                    current.bound(flags);
                    next = current.$nextBound;
                    current.$nextBound = null;
                    current = next;
                } while (current !== marker);
            }
        }
        beginUnbind() {
            // open up / expand an unbind batch; the very first caller will close it again with endUnbind
            ++this.unbindDepth;
        }
        enqueueUnbound(requestor) {
            // This method is idempotent; adding the same item more than once has the same effect as
            // adding it once.
            // build a standard singly linked list for unbound callbacks
            if (requestor.$nextUnbound === null) {
                requestor.$nextUnbound = marker;
                this.unboundTail.$nextUnbound = requestor;
                this.unboundTail = requestor;
                ++this.unboundCount;
            }
        }
        endUnbind(flags) {
            // close / shrink an unbind batch
            if (--this.unbindDepth === 0) {
                if (this.task !== null && !this.task.done) {
                    this.task.owner = this;
                    return this.task;
                }
                this.processUnbindQueue(flags);
                return LifecycleTask.done;
            }
        }
        processUnbindQueue(flags) {
            // unbound callbacks may lead to additional unbind operations, so keep looping until
            // the unbound head is back to `this` (though this will typically happen in the first iteration)
            while (this.unboundCount > 0) {
                this.unboundCount = 0;
                let current = this.unboundHead.$nextUnbound;
                let next;
                this.unboundHead = this.unboundTail = this;
                do {
                    current.unbound(flags);
                    next = current.$nextUnbound;
                    current.$nextUnbound = null;
                    current = next;
                } while (current !== marker);
            }
        }
        beginAttach() {
            // open up / expand an attach batch; the very first caller will close it again with endAttach
            ++this.attachDepth;
        }
        enqueueMount(requestor) {
            // This method is idempotent; adding the same item more than once has the same effect as
            // adding it once.
            // build a standard singly linked list for mount callbacks
            if (requestor.$nextMount === null) {
                requestor.$nextMount = marker;
                this.mountTail.$nextMount = requestor;
                this.mountTail = requestor;
                ++this.mountCount;
            }
        }
        enqueueAttached(requestor) {
            // This method is idempotent; adding the same item more than once has the same effect as
            // adding it once.
            // build a standard singly linked list for attached callbacks
            if (requestor.$nextAttached === null) {
                requestor.$nextAttached = marker;
                this.attachedTail.$nextAttached = requestor;
                this.attachedTail = requestor;
                ++this.attachedCount;
            }
        }
        endAttach(flags) {
            // close / shrink an attach batch
            if (--this.attachDepth === 0) {
                if (this.task !== null && !this.task.done) {
                    this.task.owner = this;
                    return this.task;
                }
                this.processAttachQueue(flags);
                return LifecycleTask.done;
            }
        }
        processAttachQueue(flags) {
            // flush and patch before starting the attach lifecycle to ensure batched collection changes are propagated to repeaters
            // and the DOM is updated
            this.processFlushQueue(flags | LifecycleFlags.fromSyncFlush);
            // TODO: prevent duplicate updates coming from the patch queue (or perhaps it's just not needed in its entirety?)
            //this.processPatchQueue(flags | LifecycleFlags.fromSyncFlush);
            if (this.mountCount > 0) {
                this.mountCount = 0;
                let currentMount = this.mountHead.$nextMount;
                this.mountHead = this.mountTail = this;
                let nextMount;
                do {
                    currentMount.$mount(flags);
                    nextMount = currentMount.$nextMount;
                    currentMount.$nextMount = null;
                    currentMount = nextMount;
                } while (currentMount !== marker);
            }
            // Connect all connect-queued bindings AFTER mounting is done, so that the DOM is visible asap,
            // but connect BEFORE running the attached callbacks to ensure any changes made during those callbacks
            // are still accounted for.
            // TODO: add a flag/option to further delay connect with a RAF callback (the tradeoff would be that we'd need
            // to run an additional patch cycle before that connect, which can be expensive and unnecessary in most real
            // world scenarios, but can significantly speed things up with nested, highly volatile data like in dbmonster)
            this.processConnectQueue(LifecycleFlags.mustEvaluate);
            if (this.attachedCount > 0) {
                this.attachedCount = 0;
                let currentAttached = this.attachedHead.$nextAttached;
                this.attachedHead = this.attachedTail = this;
                let nextAttached;
                do {
                    currentAttached.attached(flags);
                    nextAttached = currentAttached.$nextAttached;
                    currentAttached.$nextAttached = null;
                    currentAttached = nextAttached;
                } while (currentAttached !== marker);
            }
        }
        beginDetach() {
            // open up / expand a detach batch; the very first caller will close it again with endDetach
            ++this.detachDepth;
        }
        enqueueUnmount(requestor) {
            // This method is idempotent; adding the same item more than once has the same effect as
            // adding it once.
            // build a standard singly linked list for unmount callbacks
            if (requestor.$nextUnmount === null) {
                requestor.$nextUnmount = marker;
                this.unmountTail.$nextUnmount = requestor;
                this.unmountTail = requestor;
                ++this.unmountCount;
            }
            // this is a temporary solution until a cleaner method surfaces.
            // if an item being queued for unmounting is already in the mount queue,
            // remove it from the mount queue (this can occur in some very exotic situations
            // and should be dealt with in a less hacky way)
            if (requestor.$nextMount !== null) {
                let current = this.mountHead;
                let next = current.$nextMount;
                while (next !== requestor) {
                    current = next;
                    next = current.$nextMount;
                }
                current.$nextMount = next.$nextMount;
                next.$nextMount = null;
                if (this.mountTail === next) {
                    this.mountTail = this;
                }
                --this.mountCount;
            }
        }
        enqueueDetached(requestor) {
            // This method is idempotent; adding the same item more than once has the same effect as
            // adding it once.
            // build a standard singly linked list for detached callbacks
            if (requestor.$nextDetached === null) {
                requestor.$nextDetached = marker;
                this.detachedTail.$nextDetached = requestor;
                this.detachedTail = requestor;
                ++this.detachedCount;
            }
        }
        enqueueUnbindAfterDetach(requestor) {
            // This method is idempotent; adding the same item more than once has the same effect as
            // adding it once.
            // build a standard singly linked list for unbindAfterDetach callbacks
            if (requestor.$nextUnbindAfterDetach === null) {
                requestor.$nextUnbindAfterDetach = marker;
                this.unbindAfterDetachTail.$nextUnbindAfterDetach = requestor;
                this.unbindAfterDetachTail = requestor;
                ++this.unbindAfterDetachCount;
            }
        }
        endDetach(flags) {
            // close / shrink a detach batch
            if (--this.detachDepth === 0) {
                if (this.task !== null && !this.task.done) {
                    this.task.owner = this;
                    return this.task;
                }
                this.processDetachQueue(flags);
                return LifecycleTask.done;
            }
        }
        processDetachQueue(flags) {
            // flush before unmounting to ensure batched collection changes propagate to the repeaters,
            // which may lead to additional unmount operations
            this.processFlushQueue(flags | LifecycleFlags.fromFlush | LifecycleFlags.doNotUpdateDOM);
            if (this.unmountCount > 0) {
                this.unmountCount = 0;
                let currentUnmount = this.unmountHead.$nextUnmount;
                this.unmountHead = this.unmountTail = this;
                let nextUnmount;
                do {
                    currentUnmount.$unmount(flags);
                    nextUnmount = currentUnmount.$nextUnmount;
                    currentUnmount.$nextUnmount = null;
                    currentUnmount = nextUnmount;
                } while (currentUnmount !== marker);
            }
            if (this.detachedCount > 0) {
                this.detachedCount = 0;
                let currentDetached = this.detachedHead.$nextDetached;
                this.detachedHead = this.detachedTail = this;
                let nextDetached;
                do {
                    currentDetached.detached(flags);
                    nextDetached = currentDetached.$nextDetached;
                    currentDetached.$nextDetached = null;
                    currentDetached = nextDetached;
                } while (currentDetached !== marker);
            }
            if (this.unbindAfterDetachCount > 0) {
                this.beginUnbind();
                this.unbindAfterDetachCount = 0;
                let currentUnbind = this.unbindAfterDetachHead.$nextUnbindAfterDetach;
                this.unbindAfterDetachHead = this.unbindAfterDetachTail = this;
                let nextUnbind;
                do {
                    currentUnbind.$unbind(flags);
                    nextUnbind = currentUnbind.$nextUnbindAfterDetach;
                    currentUnbind.$nextUnbindAfterDetach = null;
                    currentUnbind = nextUnbind;
                } while (currentUnbind !== marker);
                this.endUnbind(flags);
            }
        }
    }
    class CompositionCoordinator {
        constructor($lifecycle) {
            this.$lifecycle = $lifecycle;
            this.onSwapComplete = PLATFORM.noop;
            this.currentView = null;
            this.isAttached = false;
            this.isBound = false;
            this.queue = null;
            this.swapTask = LifecycleTask.done;
        }
        static register(container) {
            return Registration.transient(this, this).register(container, this);
        }
        compose(value, flags) {
            if (this.swapTask.done) {
                if (value instanceof Promise) {
                    this.enqueue(new PromiseSwap(this, value));
                    this.processNext();
                }
                else {
                    this.swap(value, flags);
                }
            }
            else {
                if (value instanceof Promise) {
                    this.enqueue(new PromiseSwap(this, value));
                }
                else {
                    this.enqueue(value);
                }
                if (this.swapTask.canCancel()) {
                    this.swapTask.cancel();
                }
            }
        }
        binding(flags, scope) {
            this.scope = scope;
            this.isBound = true;
            if (this.currentView !== null) {
                this.currentView.$bind(flags, scope);
            }
        }
        attaching(flags) {
            this.isAttached = true;
            if (this.currentView !== null) {
                this.currentView.$attach(flags);
            }
        }
        detaching(flags) {
            this.isAttached = false;
            if (this.currentView !== null) {
                this.currentView.$detach(flags);
            }
        }
        unbinding(flags) {
            this.isBound = false;
            if (this.currentView !== null) {
                this.currentView.$unbind(flags);
            }
        }
        caching(flags) {
            this.currentView = null;
        }
        enqueue(view) {
            if (this.queue === null) {
                this.queue = [];
            }
            this.queue.push(view);
        }
        swap(view, flags) {
            if (this.currentView === view) {
                return;
            }
            const $lifecycle = this.$lifecycle;
            const swapTask = new AggregateLifecycleTask();
            let lifecycleTask;
            let currentView = this.currentView;
            if (currentView === null) {
                lifecycleTask = LifecycleTask.done;
            }
            else {
                $lifecycle.enqueueUnbindAfterDetach(currentView);
                $lifecycle.beginDetach();
                currentView.$detach(flags);
                lifecycleTask = $lifecycle.endDetach(flags);
            }
            swapTask.addTask(lifecycleTask);
            currentView = this.currentView = view;
            if (currentView === null) {
                lifecycleTask = LifecycleTask.done;
            }
            else {
                if (this.isBound) {
                    $lifecycle.beginBind();
                    currentView.$bind(flags, this.scope);
                    $lifecycle.endBind(flags);
                }
                if (this.isAttached) {
                    $lifecycle.beginAttach();
                    currentView.$attach(flags);
                    lifecycleTask = $lifecycle.endAttach(flags);
                }
                else {
                    lifecycleTask = LifecycleTask.done;
                }
            }
            swapTask.addTask(lifecycleTask);
            if (swapTask.done) {
                this.swapTask = LifecycleTask.done;
                this.onSwapComplete();
            }
            else {
                this.swapTask = swapTask;
                this.swapTask.wait().then(() => {
                    this.onSwapComplete();
                    this.processNext();
                }).catch(error => { throw error; });
            }
        }
        processNext() {
            if (this.queue !== null && this.queue.length > 0) {
                const next = this.queue.pop();
                this.queue.length = 0;
                if (PromiseSwap.is(next)) {
                    this.swapTask = next.start();
                }
                else {
                    this.swap(next, LifecycleFlags.fromLifecycleTask);
                }
            }
            else {
                this.swapTask = LifecycleTask.done;
            }
        }
    }
    CompositionCoordinator.inject = [ILifecycle];
    const LifecycleTask = {
        done: {
            done: true,
            canCancel() { return false; },
            cancel() { return; },
            wait() { return Promise.resolve(); }
        }
    };
    class AggregateLifecycleTask {
        constructor() {
            this.done = true;
            this.owner = null;
            this.resolve = null;
            this.tasks = [];
            this.waiter = null;
        }
        addTask(task) {
            if (!task.done) {
                this.done = false;
                this.tasks.push(task);
                task.wait().then(() => { this.tryComplete(); }).catch(error => { throw error; });
            }
        }
        removeTask(task) {
            if (task.done) {
                const idx = this.tasks.indexOf(task);
                if (idx !== -1) {
                    this.tasks.splice(idx, 1);
                }
            }
            if (this.tasks.length === 0 && this.owner !== null) {
                this.owner.finishTask(this);
                this.owner = null;
            }
        }
        canCancel() {
            if (this.done) {
                return false;
            }
            return this.tasks.every(x => x.canCancel());
        }
        cancel() {
            if (this.canCancel()) {
                this.tasks.forEach(x => { x.cancel(); });
                this.done = false;
            }
        }
        wait() {
            if (this.waiter === null) {
                if (this.done) {
                    this.waiter = Promise.resolve();
                }
                else {
                    // tslint:disable-next-line:promise-must-complete
                    this.waiter = new Promise((resolve) => this.resolve = resolve);
                }
            }
            return this.waiter;
        }
        tryComplete() {
            if (this.done) {
                return;
            }
            if (this.tasks.every(x => x.done)) {
                this.complete(true);
            }
        }
        complete(notCancelled) {
            this.done = true;
            if (notCancelled && this.owner !== null) {
                this.owner.processDetachQueue(LifecycleFlags.fromLifecycleTask);
                this.owner.processUnbindQueue(LifecycleFlags.fromLifecycleTask);
                this.owner.processBindQueue(LifecycleFlags.fromLifecycleTask);
                this.owner.processAttachQueue(LifecycleFlags.fromLifecycleTask);
            }
            this.owner.finishTask(this);
            if (this.resolve !== null) {
                this.resolve();
            }
        }
    }
    /** @internal */
    class PromiseSwap {
        constructor(coordinator, promise) {
            this.coordinator = coordinator;
            this.done = false;
            this.isCancelled = false;
            this.promise = promise;
        }
        static is(object) {
            return 'start' in object;
        }
        start() {
            if (this.isCancelled) {
                return LifecycleTask.done;
            }
            this.promise = this.promise.then(x => {
                this.onResolve(x);
                return x;
            });
            return this;
        }
        canCancel() {
            return !this.done;
        }
        cancel() {
            if (this.canCancel()) {
                this.isCancelled = true;
            }
        }
        wait() {
            return this.promise;
        }
        onResolve(value) {
            if (this.isCancelled) {
                return;
            }
            this.done = true;
            this.coordinator.compose(value, LifecycleFlags.fromLifecycleTask);
        }
    }
    // tslint:disable:jsdoc-format
    /**
     * A general-purpose ILifecycleTask implementation that can be placed
     * before an attached, detached, bound or unbound hook during attaching,
     * detaching, binding or unbinding, respectively.
     *
     * The provided promise will be awaited before the corresponding lifecycle
     * hook (and any hooks following it) is invoked.
     *
     * The provided callback will be invoked after the promise is resolved
     * and before the next lifecycle hook.
     *
     * Example:
    ```ts
    export class MyViewModel {
      private $lifecycle: ILifecycle; // set before created() hook
      private answer: number;

      public binding(flags: LifecycleFlags): void {
        // this.answer === undefined
        this.$lifecycle.registerTask(new PromiseTask(
          this.getAnswerAsync,
          answer => {
            this.answer = answer;
          }
        ));
      }

      public bound(flags: LifecycleFlags): void {
        // this.answer === 42
      }

      private getAnswerAsync(): Promise<number> {
        return Promise.resolve().then(() => 42);
      }
    }
    ```
     */
    // tslint:enable:jsdoc-format
    class PromiseTask {
        constructor(promise, callback) {
            this.done = false;
            this.isCancelled = false;
            this.callback = callback;
            this.promise = promise.then(value => {
                if (this.isCancelled === true) {
                    return;
                }
                this.done = true;
                this.callback(value);
                return value;
            });
        }
        canCancel() {
            return !this.done;
        }
        cancel() {
            if (this.canCancel()) {
                this.isCancelled = true;
            }
        }
        wait() {
            return this.promise;
        }
    }

    const slotNames = [];
    const versionSlotNames = [];
    let lastSlot = -1;
    function ensureEnoughSlotNames(currentSlot) {
        if (currentSlot === lastSlot) {
            lastSlot += 5;
            const ii = slotNames.length = versionSlotNames.length = lastSlot + 1;
            for (let i = currentSlot + 1; i < ii; ++i) {
                slotNames[i] = `_observer${i}`;
                versionSlotNames[i] = `_observerVersion${i}`;
            }
        }
    }
    ensureEnoughSlotNames(-1);
    /** @internal */
    function addObserver(observer) {
        // find the observer.
        const observerSlots = this.observerSlots === undefined ? 0 : this.observerSlots;
        let i = observerSlots;
        while (i-- && this[slotNames[i]] !== observer)
            ;
        // if we are not already observing, put the observer in an open slot and subscribe.
        if (i === -1) {
            i = 0;
            while (this[slotNames[i]]) {
                i++;
            }
            this[slotNames[i]] = observer;
            observer.subscribe(this);
            // increment the slot count.
            if (i === observerSlots) {
                this.observerSlots = i + 1;
            }
        }
        // set the "version" when the observer was used.
        if (this.version === undefined) {
            this.version = 0;
        }
        this[versionSlotNames[i]] = this.version;
        ensureEnoughSlotNames(i);
    }
    /** @internal */
    function observeProperty(obj, propertyName) {
        const observer = this.observerLocator.getObserver(obj, propertyName);
        /* Note: we need to cast here because we can indeed get an accessor instead of an observer,
         *  in which case the call to observer.subscribe will throw. It's not very clean and we can solve this in 2 ways:
         *  1. Fail earlier: only let the locator resolve observers from .getObserver, and throw if no branches are left (e.g. it would otherwise return an accessor)
         *  2. Fail silently (without throwing): give all accessors a no-op subscribe method
         *
         * We'll probably want to implement some global configuration (like a "strict" toggle) so users can pick between enforced correctness vs. ease-of-use
         */
        this.addObserver(observer);
    }
    /** @internal */
    function unobserve(all$$1) {
        const slots = this.observerSlots;
        let slotName;
        let observer;
        if (all$$1 === true) {
            for (let i = 0; i < slots; ++i) {
                slotName = slotNames[i];
                observer = this[slotName];
                if (observer !== null && observer !== undefined) {
                    this[slotName] = null;
                    observer.unsubscribe(this);
                }
            }
        }
        else {
            const version = this.version;
            for (let i = 0; i < slots; ++i) {
                if (this[versionSlotNames[i]] !== version) {
                    slotName = slotNames[i];
                    observer = this[slotName];
                    if (observer !== null && observer !== undefined) {
                        this[slotName] = null;
                        observer.unsubscribe(this);
                    }
                }
            }
        }
    }
    function connectableDecorator(target) {
        const proto = target.prototype;
        if (!proto.hasOwnProperty('observeProperty'))
            proto.observeProperty = observeProperty;
        if (!proto.hasOwnProperty('unobserve'))
            proto.unobserve = unobserve;
        if (!proto.hasOwnProperty('addObserver'))
            proto.addObserver = addObserver;
        return target;
    }
    function connectable(target) {
        return target === undefined ? connectableDecorator : connectableDecorator(target);
    }

    // BindingMode is not a const enum (and therefore not inlined), so assigning them to a variable to save a member accessor is a minor perf tweak
    const { oneTime, toView, fromView } = BindingMode;
    // pre-combining flags for bitwise checks is a minor perf tweak
    const toViewOrOneTime = toView | oneTime;
    let Binding = class Binding {
        constructor(sourceExpression, target, targetProperty, mode, observerLocator, locator) {
            this.$nextBind = null;
            this.$prevBind = null;
            this.$state = 0 /* none */;
            this.$lifecycle = locator.get(ILifecycle);
            this.$nextConnect = null;
            this.$nextPatch = null;
            this.$scope = null;
            this.locator = locator;
            this.mode = mode;
            this.observerLocator = observerLocator;
            this.sourceExpression = sourceExpression;
            this.target = target;
            this.targetProperty = targetProperty;
        }
        updateTarget(value, flags) {
            flags |= this.persistentFlags;
            this.targetObserver.setValue(value, flags | LifecycleFlags.updateTargetInstance);
        }
        updateSource(value, flags) {
            flags |= this.persistentFlags;
            this.sourceExpression.assign(flags | LifecycleFlags.updateSourceExpression, this.$scope, this.locator, value);
        }
        handleChange(newValue, _previousValue, flags) {
            if (!(this.$state & 2 /* isBound */)) {
                return;
            }
            const sourceExpression = this.sourceExpression;
            const $scope = this.$scope;
            const locator = this.locator;
            flags |= this.persistentFlags;
            if (this.mode === BindingMode.fromView) {
                flags &= ~LifecycleFlags.updateTargetInstance;
                flags |= LifecycleFlags.updateSourceExpression;
            }
            if (flags & LifecycleFlags.updateTargetInstance) {
                const targetObserver = this.targetObserver;
                const mode = this.mode;
                const previousValue = targetObserver.getValue();
                // if the only observable is an AccessScope then we can assume the passed-in newValue is the correct and latest value
                if (sourceExpression.$kind !== 10082 /* AccessScope */ || this.observerSlots > 1) {
                    newValue = sourceExpression.evaluate(flags, $scope, locator);
                }
                if (newValue !== previousValue) {
                    this.updateTarget(newValue, flags);
                }
                if ((mode & oneTime) === 0) {
                    this.version++;
                    sourceExpression.connect(flags, $scope, this);
                    this.unobserve(false);
                }
                return;
            }
            if (flags & LifecycleFlags.updateSourceExpression) {
                if (newValue !== sourceExpression.evaluate(flags, $scope, locator)) {
                    this.updateSource(newValue, flags);
                }
                return;
            }
            throw Reporter.error(15, LifecycleFlags[flags]);
        }
        $bind(flags, scope) {
            if (this.$state & 2 /* isBound */) {
                if (this.$scope === scope) {
                    return;
                }
                this.$unbind(flags | LifecycleFlags.fromBind);
            }
            // add isBinding flag
            this.$state |= 1 /* isBinding */;
            // Store flags which we can only receive during $bind and need to pass on
            // to the AST during evaluate/connect/assign
            this.persistentFlags = flags & LifecycleFlags.persistentBindingFlags;
            this.$scope = scope;
            let sourceExpression = this.sourceExpression;
            if (hasBind(sourceExpression)) {
                sourceExpression.bind(flags, scope, this);
            }
            const mode = this.mode;
            let targetObserver = this.targetObserver;
            if (!targetObserver) {
                if (mode & fromView) {
                    targetObserver = this.targetObserver = this.observerLocator.getObserver(this.target, this.targetProperty);
                }
                else {
                    targetObserver = this.targetObserver = this.observerLocator.getAccessor(this.target, this.targetProperty);
                }
            }
            if (targetObserver.bind) {
                targetObserver.bind(flags);
            }
            // during bind, binding behavior might have changed sourceExpression
            sourceExpression = this.sourceExpression;
            if (mode & toViewOrOneTime) {
                this.updateTarget(sourceExpression.evaluate(flags, scope, this.locator), flags);
            }
            if (mode & toView) {
                this.$lifecycle.enqueueConnect(this);
            }
            if (mode & fromView) {
                targetObserver.subscribe(this);
            }
            // add isBound flag and remove isBinding flag
            this.$state |= 2 /* isBound */;
            this.$state &= ~1 /* isBinding */;
        }
        $unbind(flags) {
            if (!(this.$state & 2 /* isBound */)) {
                return;
            }
            // add isUnbinding flag
            this.$state |= 64 /* isUnbinding */;
            // clear persistent flags
            this.persistentFlags = LifecycleFlags.none;
            const sourceExpression = this.sourceExpression;
            if (hasUnbind(sourceExpression)) {
                sourceExpression.unbind(flags, this.$scope, this);
            }
            this.$scope = null;
            const targetObserver = this.targetObserver;
            if (targetObserver.unbind) {
                targetObserver.unbind(flags);
            }
            if (targetObserver.unsubscribe) {
                targetObserver.unsubscribe(this);
            }
            this.unobserve(true);
            // remove isBound and isUnbinding flags
            this.$state &= ~(2 /* isBound */ | 64 /* isUnbinding */);
        }
        connect(flags) {
            if (this.$state & 2 /* isBound */) {
                flags |= this.persistentFlags;
                this.sourceExpression.connect(flags | LifecycleFlags.mustEvaluate, this.$scope, this);
            }
        }
        patch(flags) {
            if (this.$state & 2 /* isBound */) {
                flags |= this.persistentFlags;
                this.updateTarget(this.sourceExpression.evaluate(flags | LifecycleFlags.mustEvaluate, this.$scope, this.locator), flags);
            }
        }
    };
    Binding = __decorate([
        connectable()
    ], Binding);

    class Call {
        constructor(sourceExpression, target, targetProperty, observerLocator, locator) {
            this.$nextBind = null;
            this.$prevBind = null;
            this.$state = 0 /* none */;
            this.locator = locator;
            this.sourceExpression = sourceExpression;
            this.targetObserver = observerLocator.getObserver(target, targetProperty);
        }
        callSource(args) {
            const overrideContext = this.$scope.overrideContext;
            Object.assign(overrideContext, args);
            const result = this.sourceExpression.evaluate(LifecycleFlags.mustEvaluate, this.$scope, this.locator);
            for (const prop in args) {
                // tslint:disable-next-line:no-dynamic-delete
                delete overrideContext[prop];
            }
            return result;
        }
        $bind(flags, scope) {
            if (this.$state & 2 /* isBound */) {
                if (this.$scope === scope) {
                    return;
                }
                this.$unbind(flags | LifecycleFlags.fromBind);
            }
            // add isBinding flag
            this.$state |= 1 /* isBinding */;
            this.$scope = scope;
            const sourceExpression = this.sourceExpression;
            if (hasBind(sourceExpression)) {
                sourceExpression.bind(flags, scope, this);
            }
            this.targetObserver.setValue($args => this.callSource($args), flags);
            // add isBound flag and remove isBinding flag
            this.$state |= 2 /* isBound */;
            this.$state &= ~1 /* isBinding */;
        }
        $unbind(flags) {
            if (!(this.$state & 2 /* isBound */)) {
                return;
            }
            // add isUnbinding flag
            this.$state |= 64 /* isUnbinding */;
            const sourceExpression = this.sourceExpression;
            if (hasUnbind(sourceExpression)) {
                sourceExpression.unbind(flags, this.$scope, this);
            }
            this.$scope = null;
            this.targetObserver.setValue(null, flags);
            // remove isBound and isUnbinding flags
            this.$state &= ~(2 /* isBound */ | 64 /* isUnbinding */);
        }
        observeProperty(obj, propertyName) {
            return;
        }
        handleChange(newValue, previousValue, flags) {
            return;
        }
    }

    const IExpressionParser = DI.createInterface('IExpressionParser').withDefault(x => x.singleton(ExpressionParser));
    /** @internal */
    class ExpressionParser {
        constructor() {
            this.expressionLookup = Object.create(null);
            this.forOfLookup = Object.create(null);
            this.interpolationLookup = Object.create(null);
        }
        parse(expression, bindingType) {
            switch (bindingType) {
                case 2048 /* Interpolation */: {
                    let found = this.interpolationLookup[expression];
                    if (found === undefined) {
                        found = this.interpolationLookup[expression] = this.parseCore(expression, bindingType);
                    }
                    return found;
                }
                case 539 /* ForCommand */: {
                    let found = this.forOfLookup[expression];
                    if (found === undefined) {
                        found = this.forOfLookup[expression] = this.parseCore(expression, bindingType);
                    }
                    return found;
                }
                default: {
                    // Allow empty strings for normal bindings and those that are empty by default (such as a custom attribute without an equals sign)
                    // But don't cache it, because empty strings are always invalid for any other type of binding
                    if (expression.length === 0 && (bindingType & (53 /* BindCommand */ | 49 /* OneTimeCommand */ | 50 /* ToViewCommand */))) {
                        return PrimitiveLiteral.$empty;
                    }
                    let found = this.expressionLookup[expression];
                    if (found === undefined) {
                        found = this.expressionLookup[expression] = this.parseCore(expression, bindingType);
                    }
                    return found;
                }
            }
        }
        cache(expressions) {
            const { forOfLookup, expressionLookup, interpolationLookup } = this;
            for (const expression in expressions) {
                const expr = expressions[expression];
                switch (expr.$kind) {
                    case 24 /* Interpolation */:
                        interpolationLookup[expression] = expr;
                        break;
                    case 55 /* ForOfStatement */:
                        forOfLookup[expression] = expr;
                        break;
                    default:
                        expressionLookup[expression] = expr;
                }
            }
        }
        parseCore(expression, bindingType) {
            try {
                const parts = expression.split('.');
                const firstPart = parts[0];
                let current;
                if (firstPart.endsWith('()')) {
                    current = new CallScope(firstPart.replace('()', ''), PLATFORM.emptyArray);
                }
                else {
                    current = new AccessScope(parts[0]);
                }
                let index = 1;
                while (index < parts.length) {
                    const currentPart = parts[index];
                    if (currentPart.endsWith('()')) {
                        current = new CallMember(current, currentPart.replace('()', ''), PLATFORM.emptyArray);
                    }
                    else {
                        current = new AccessMember(current, parts[index]);
                    }
                    index++;
                }
                return current;
            }
            catch (e) {
                throw Reporter.error(3, e);
            }
        }
    }
    var BindingType;
    (function (BindingType) {
        BindingType[BindingType["None"] = 0] = "None";
        BindingType[BindingType["Interpolation"] = 2048] = "Interpolation";
        BindingType[BindingType["IsRef"] = 1280] = "IsRef";
        BindingType[BindingType["IsIterator"] = 512] = "IsIterator";
        BindingType[BindingType["IsCustom"] = 256] = "IsCustom";
        BindingType[BindingType["IsFunction"] = 128] = "IsFunction";
        BindingType[BindingType["IsEvent"] = 64] = "IsEvent";
        BindingType[BindingType["IsProperty"] = 32] = "IsProperty";
        BindingType[BindingType["IsCommand"] = 16] = "IsCommand";
        BindingType[BindingType["IsPropertyCommand"] = 48] = "IsPropertyCommand";
        BindingType[BindingType["IsEventCommand"] = 80] = "IsEventCommand";
        BindingType[BindingType["DelegationStrategyDelta"] = 6] = "DelegationStrategyDelta";
        BindingType[BindingType["Command"] = 15] = "Command";
        BindingType[BindingType["OneTimeCommand"] = 49] = "OneTimeCommand";
        BindingType[BindingType["ToViewCommand"] = 50] = "ToViewCommand";
        BindingType[BindingType["FromViewCommand"] = 51] = "FromViewCommand";
        BindingType[BindingType["TwoWayCommand"] = 52] = "TwoWayCommand";
        BindingType[BindingType["BindCommand"] = 53] = "BindCommand";
        BindingType[BindingType["TriggerCommand"] = 86] = "TriggerCommand";
        BindingType[BindingType["CaptureCommand"] = 87] = "CaptureCommand";
        BindingType[BindingType["DelegateCommand"] = 88] = "DelegateCommand";
        BindingType[BindingType["CallCommand"] = 153] = "CallCommand";
        BindingType[BindingType["OptionsCommand"] = 26] = "OptionsCommand";
        BindingType[BindingType["ForCommand"] = 539] = "ForCommand";
        BindingType[BindingType["CustomCommand"] = 284] = "CustomCommand";
    })(BindingType || (BindingType = {}));

    const { toView: toView$1, oneTime: oneTime$1 } = BindingMode;
    class MultiInterpolationBinding {
        constructor(observerLocator, interpolation, target, targetProperty, mode, locator) {
            this.$nextBind = null;
            this.$prevBind = null;
            this.$state = 0 /* none */;
            this.$scope = null;
            this.interpolation = interpolation;
            this.locator = locator;
            this.mode = mode;
            this.observerLocator = observerLocator;
            this.target = target;
            this.targetProperty = targetProperty;
            // Note: the child expressions of an Interpolation expression are full Aurelia expressions, meaning they may include
            // value converters and binding behaviors.
            // Each expression represents one ${interpolation}, and for each we create a child TextBinding unless there is only one,
            // in which case the renderer will create the TextBinding directly
            const expressions = interpolation.expressions;
            const parts = this.parts = Array(expressions.length);
            for (let i = 0, ii = expressions.length; i < ii; ++i) {
                parts[i] = new InterpolationBinding(expressions[i], interpolation, target, targetProperty, mode, observerLocator, locator, i === 0);
            }
        }
        $bind(flags, scope) {
            if (this.$state & 2 /* isBound */) {
                if (this.$scope === scope) {
                    return;
                }
                this.$unbind(flags);
            }
            this.$state |= 2 /* isBound */;
            this.$scope = scope;
            const parts = this.parts;
            for (let i = 0, ii = parts.length; i < ii; ++i) {
                parts[i].$bind(flags, scope);
            }
        }
        $unbind(flags) {
            if (!(this.$state & 2 /* isBound */)) {
                return;
            }
            this.$state &= ~2 /* isBound */;
            this.$scope = null;
            const parts = this.parts;
            for (let i = 0, ii = parts.length; i < ii; ++i) {
                parts[i].$unbind(flags);
            }
        }
    }
    let InterpolationBinding = class InterpolationBinding {
        // tslint:disable-next-line:parameters-max-number
        constructor(sourceExpression, interpolation, target, targetProperty, mode, observerLocator, locator, isFirst) {
            this.$state = 0 /* none */;
            this.interpolation = interpolation;
            this.isFirst = isFirst;
            this.mode = mode;
            this.locator = locator;
            this.observerLocator = observerLocator;
            this.sourceExpression = sourceExpression;
            this.target = target;
            this.targetProperty = targetProperty;
            this.targetObserver = observerLocator.getAccessor(target, targetProperty);
        }
        updateTarget(value, flags) {
            this.targetObserver.setValue(value, flags | LifecycleFlags.updateTargetInstance);
        }
        handleChange(_newValue, _previousValue, flags) {
            if (!(this.$state & 2 /* isBound */)) {
                return;
            }
            const previousValue = this.targetObserver.getValue();
            const newValue = this.interpolation.evaluate(flags, this.$scope, this.locator);
            if (newValue !== previousValue) {
                this.updateTarget(newValue, flags);
            }
            if ((this.mode & oneTime$1) === 0) {
                this.version++;
                this.sourceExpression.connect(flags, this.$scope, this);
                this.unobserve(false);
            }
        }
        $bind(flags, scope) {
            if (this.$state & 2 /* isBound */) {
                if (this.$scope === scope) {
                    return;
                }
                this.$unbind(flags);
            }
            this.$state |= 2 /* isBound */;
            this.$scope = scope;
            const sourceExpression = this.sourceExpression;
            if (sourceExpression.bind) {
                sourceExpression.bind(flags, scope, this);
            }
            // since the interpolation already gets the whole value, we only need to let the first
            // text binding do the update if there are multiple
            if (this.isFirst) {
                this.updateTarget(this.interpolation.evaluate(flags, scope, this.locator), flags);
            }
            if (this.mode & toView$1) {
                sourceExpression.connect(flags, scope, this);
            }
        }
        $unbind(flags) {
            if (!(this.$state & 2 /* isBound */)) {
                return;
            }
            this.$state &= ~2 /* isBound */;
            const sourceExpression = this.sourceExpression;
            if (sourceExpression.unbind) {
                sourceExpression.unbind(flags, this.$scope, this);
            }
            this.$scope = null;
            this.unobserve(true);
        }
    };
    InterpolationBinding = __decorate([
        connectable()
    ], InterpolationBinding);

    let LetBinding = class LetBinding {
        constructor(sourceExpression, targetProperty, observerLocator, locator, toViewModel = false) {
            this.$nextBind = null;
            this.$prevBind = null;
            this.$state = 0 /* none */;
            this.$lifecycle = locator.get(ILifecycle);
            this.$scope = null;
            this.locator = locator;
            this.observerLocator = observerLocator;
            this.sourceExpression = sourceExpression;
            this.target = null;
            this.targetProperty = targetProperty;
            this.toViewModel = toViewModel;
        }
        handleChange(_newValue, _previousValue, flags) {
            if (!(this.$state & 2 /* isBound */)) {
                return;
            }
            if (flags & LifecycleFlags.updateTargetInstance) {
                const { target, targetProperty } = this;
                const previousValue = target[targetProperty];
                const newValue = this.sourceExpression.evaluate(flags, this.$scope, this.locator);
                if (newValue !== previousValue) {
                    target[targetProperty] = newValue;
                }
                return;
            }
            throw Reporter.error(15, flags);
        }
        $bind(flags, scope) {
            if (this.$state & 2 /* isBound */) {
                if (this.$scope === scope) {
                    return;
                }
                this.$unbind(flags | LifecycleFlags.fromBind);
            }
            // add isBinding flag
            this.$state |= 1 /* isBinding */;
            this.$scope = scope;
            this.target = (this.toViewModel ? scope.bindingContext : scope.overrideContext);
            const sourceExpression = this.sourceExpression;
            if (sourceExpression.bind) {
                sourceExpression.bind(flags, scope, this);
            }
            // sourceExpression might have been changed during bind
            this.target[this.targetProperty] = this.sourceExpression.evaluate(LifecycleFlags.fromBind, scope, this.locator);
            this.sourceExpression.connect(flags, scope, this);
            // add isBound flag and remove isBinding flag
            this.$state |= 2 /* isBound */;
            this.$state &= ~1 /* isBinding */;
        }
        $unbind(flags) {
            if (!(this.$state & 2 /* isBound */)) {
                return;
            }
            // add isUnbinding flag
            this.$state |= 64 /* isUnbinding */;
            const sourceExpression = this.sourceExpression;
            if (sourceExpression.unbind) {
                sourceExpression.unbind(flags, this.$scope, this);
            }
            this.$scope = null;
            this.unobserve(true);
            // remove isBound and isUnbinding flags
            this.$state &= ~(2 /* isBound */ | 64 /* isUnbinding */);
        }
    };
    LetBinding = __decorate([
        connectable()
    ], LetBinding);

    class Ref {
        constructor(sourceExpression, target, locator) {
            this.$nextBind = null;
            this.$prevBind = null;
            this.$state = 0 /* none */;
            this.locator = locator;
            this.sourceExpression = sourceExpression;
            this.target = target;
        }
        $bind(flags, scope) {
            if (this.$state & 2 /* isBound */) {
                if (this.$scope === scope) {
                    return;
                }
                this.$unbind(flags | LifecycleFlags.fromBind);
            }
            // add isBinding flag
            this.$state |= 1 /* isBinding */;
            this.$scope = scope;
            const sourceExpression = this.sourceExpression;
            if (hasBind(sourceExpression)) {
                sourceExpression.bind(flags, scope, this);
            }
            this.sourceExpression.assign(flags, this.$scope, this.locator, this.target);
            // add isBound flag and remove isBinding flag
            this.$state |= 2 /* isBound */;
            this.$state &= ~1 /* isBinding */;
        }
        $unbind(flags) {
            if (!(this.$state & 2 /* isBound */)) {
                return;
            }
            // add isUnbinding flag
            this.$state |= 64 /* isUnbinding */;
            if (this.sourceExpression.evaluate(flags, this.$scope, this.locator) === this.target) {
                this.sourceExpression.assign(flags, this.$scope, this.locator, null);
            }
            const sourceExpression = this.sourceExpression;
            if (hasUnbind(sourceExpression)) {
                sourceExpression.unbind(flags, this.$scope, this);
            }
            this.$scope = null;
            // remove isBound and isUnbinding flags
            this.$state &= ~(2 /* isBound */ | 64 /* isUnbinding */);
        }
        observeProperty(obj, propertyName) {
            return;
        }
        handleChange(newValue, previousValue, flags) {
            return;
        }
    }

    function setValue(newValue, flags) {
        const currentValue = this.currentValue;
        newValue = newValue === null || newValue === undefined ? this.defaultValue : newValue;
        if (currentValue !== newValue) {
            this.currentValue = newValue;
            if ((flags & (LifecycleFlags.fromFlush | LifecycleFlags.fromBind)) &&
                !(this.isDOMObserver && (flags & LifecycleFlags.doNotUpdateDOM))) {
                this.setValueCore(newValue, flags);
            }
            else {
                this.currentFlags = flags;
                return this.lifecycle.enqueueFlush(this);
            }
        }
        return Promise.resolve();
    }
    function flush(flags) {
        if (this.isDOMObserver && (flags & LifecycleFlags.doNotUpdateDOM)) {
            // re-queue the change so it will still propagate on flush when it's attached again
            this.lifecycle.enqueueFlush(this).catch(error => { throw error; });
            return;
        }
        const currentValue = this.currentValue;
        // we're doing this check because a value could be set multiple times before a flush, and the final value could be the same as the original value
        // in which case the target doesn't need to be updated
        if (this.oldValue !== currentValue) {
            this.setValueCore(currentValue, this.currentFlags | flags | LifecycleFlags.updateTargetInstance);
            this.oldValue = this.currentValue;
        }
    }
    function dispose$1() {
        this.currentValue = null;
        this.oldValue = null;
        this.defaultValue = null;
        this.obj = null;
        this.propertyKey = '';
    }
    function targetObserver(defaultValue = null) {
        return function (target) {
            subscriberCollection(MutationKind.instance)(target);
            const proto = target.prototype;
            proto.$nextFlush = null;
            proto.currentValue = defaultValue;
            proto.oldValue = defaultValue;
            proto.defaultValue = defaultValue;
            proto.obj = null;
            proto.propertyKey = '';
            proto.setValue = proto.setValue || setValue;
            proto.flush = proto.flush || flush;
            proto.dispose = proto.dispose || dispose$1;
        };
    }

    function flush$1() {
        this.callBatchedSubscribers(this.indexMap);
        if (!!this.lengthObserver) {
            this.lengthObserver.patch(LifecycleFlags.fromFlush | LifecycleFlags.updateTargetInstance);
        }
        this.resetIndexMap();
    }
    function dispose$2() {
        this.collection.$observer = undefined;
        this.collection = null;
        this.indexMap = null;
    }
    function resetIndexMapIndexed() {
        const len = this.collection.length;
        const indexMap = (this.indexMap = Array(len));
        let i = 0;
        while (i < len) {
            indexMap[i] = i++;
        }
        indexMap.deletedItems = [];
    }
    function resetIndexMapKeyed() {
        const len = this.collection.size;
        const indexMap = (this.indexMap = Array(len));
        let i = 0;
        while (i < len) {
            indexMap[i] = i++;
        }
        indexMap.deletedItems = [];
    }
    function getLengthObserver() {
        return this.lengthObserver === undefined ? (this.lengthObserver = new CollectionLengthObserver(this, this.lengthPropertyName)) : this.lengthObserver;
    }
    function collectionObserver(kind) {
        return function (target) {
            subscriberCollection(MutationKind.collection)(target);
            batchedSubscriberCollection()(target);
            const proto = target.prototype;
            proto.$nextFlush = null;
            proto.collection = null;
            proto.indexMap = null;
            proto.hasChanges = false;
            proto.lengthPropertyName = kind & 8 /* indexed */ ? 'length' : 'size';
            proto.collectionKind = kind;
            proto.resetIndexMap = kind & 8 /* indexed */ ? resetIndexMapIndexed : resetIndexMapKeyed;
            proto.flush = flush$1;
            proto.dispose = dispose$2;
            proto.getLengthObserver = getLengthObserver;
            proto.subscribe = proto.subscribe || proto.addSubscriber;
            proto.unsubscribe = proto.unsubscribe || proto.removeSubscriber;
            proto.subscribeBatched = proto.subscribeBatched || proto.addBatchedSubscriber;
            proto.unsubscribeBatched = proto.unsubscribeBatched || proto.removeBatchedSubscriber;
        };
    }
    let CollectionLengthObserver = class CollectionLengthObserver {
        constructor(obj, propertyKey) {
            this.obj = obj;
            this.propertyKey = propertyKey;
            this.currentValue = obj[propertyKey];
        }
        getValue() {
            return this.obj[this.propertyKey];
        }
        setValueCore(newValue) {
            this.obj[this.propertyKey] = newValue;
        }
        patch(flags) {
            this.callSubscribers(this.obj[this.propertyKey], this.currentValue, flags);
            this.currentValue = this.obj[this.propertyKey];
        }
        subscribe(subscriber) {
            this.addSubscriber(subscriber);
        }
        unsubscribe(subscriber) {
            this.removeSubscriber(subscriber);
        }
    };
    CollectionLengthObserver = __decorate([
        targetObserver()
    ], CollectionLengthObserver);

    // https://tc39.github.io/ecma262/#sec-sortcompare
    function sortCompare(x, y) {
        if (x === y) {
            return 0;
        }
        x = x === null ? 'null' : x.toString();
        y = y === null ? 'null' : y.toString();
        return x < y ? -1 : 1;
    }
    function preSortCompare(x, y) {
        if (x === undefined) {
            if (y === undefined) {
                return 0;
            }
            else {
                return 1;
            }
        }
        if (y === undefined) {
            return -1;
        }
        return 0;
    }
    function insertionSort(arr, indexMap, from, to, compareFn) {
        let velement, ielement, vtmp, itmp, order;
        let i, j;
        for (i = from + 1; i < to; i++) {
            velement = arr[i];
            ielement = indexMap[i];
            for (j = i - 1; j >= from; j--) {
                vtmp = arr[j];
                itmp = indexMap[j];
                order = compareFn(vtmp, velement);
                if (order > 0) {
                    arr[j + 1] = vtmp;
                    indexMap[j + 1] = itmp;
                }
                else {
                    break;
                }
            }
            arr[j + 1] = velement;
            indexMap[j + 1] = ielement;
        }
    }
    // tslint:disable-next-line:cognitive-complexity
    function quickSort(arr, indexMap, from, to, compareFn) {
        let thirdIndex = 0, i = 0;
        let v0, v1, v2;
        let i0, i1, i2;
        let c01, c02, c12;
        let vtmp, itmp;
        let vpivot, ipivot, lowEnd, highStart;
        let velement, ielement, order, vtopElement;
        // tslint:disable-next-line:no-constant-condition
        while (true) {
            if (to - from <= 10) {
                insertionSort(arr, indexMap, from, to, compareFn);
                return;
            }
            // tslint:disable:no-statements-same-line
            thirdIndex = from + ((to - from) >> 1);
            v0 = arr[from];
            i0 = indexMap[from];
            v1 = arr[to - 1];
            i1 = indexMap[to - 1];
            v2 = arr[thirdIndex];
            i2 = indexMap[thirdIndex];
            c01 = compareFn(v0, v1);
            if (c01 > 0) {
                vtmp = v0;
                itmp = i0;
                v0 = v1;
                i0 = i1;
                v1 = vtmp;
                i1 = itmp;
            }
            c02 = compareFn(v0, v2);
            if (c02 >= 0) {
                vtmp = v0;
                itmp = i0;
                v0 = v2;
                i0 = i2;
                v2 = v1;
                i2 = i1;
                v1 = vtmp;
                i1 = itmp;
            }
            else {
                c12 = compareFn(v1, v2);
                if (c12 > 0) {
                    vtmp = v1;
                    itmp = i1;
                    v1 = v2;
                    i1 = i2;
                    v2 = vtmp;
                    i2 = itmp;
                }
            }
            arr[from] = v0;
            indexMap[from] = i0;
            arr[to - 1] = v2;
            indexMap[to - 1] = i2;
            vpivot = v1;
            ipivot = i1;
            lowEnd = from + 1;
            highStart = to - 1;
            arr[thirdIndex] = arr[lowEnd];
            indexMap[thirdIndex] = indexMap[lowEnd];
            arr[lowEnd] = vpivot;
            indexMap[lowEnd] = ipivot;
            partition: for (i = lowEnd + 1; i < highStart; i++) {
                velement = arr[i];
                ielement = indexMap[i];
                order = compareFn(velement, vpivot);
                if (order < 0) {
                    arr[i] = arr[lowEnd];
                    indexMap[i] = indexMap[lowEnd];
                    arr[lowEnd] = velement;
                    indexMap[lowEnd] = ielement;
                    lowEnd++;
                }
                else if (order > 0) {
                    do {
                        highStart--;
                        // tslint:disable-next-line:triple-equals
                        if (highStart == i) {
                            break partition;
                        }
                        vtopElement = arr[highStart];
                        order = compareFn(vtopElement, vpivot);
                    } while (order > 0);
                    arr[i] = arr[highStart];
                    indexMap[i] = indexMap[highStart];
                    arr[highStart] = velement;
                    indexMap[highStart] = ielement;
                    if (order < 0) {
                        velement = arr[i];
                        ielement = indexMap[i];
                        arr[i] = arr[lowEnd];
                        indexMap[i] = indexMap[lowEnd];
                        arr[lowEnd] = velement;
                        indexMap[lowEnd] = ielement;
                        lowEnd++;
                    }
                }
            }
            // tslint:enable:no-statements-same-line
            if (to - highStart < lowEnd - from) {
                quickSort(arr, indexMap, highStart, to, compareFn);
                to = lowEnd;
            }
            else {
                quickSort(arr, indexMap, from, lowEnd, compareFn);
                from = highStart;
            }
        }
    }
    const proto = Array.prototype;
    const $push = proto.push;
    const $unshift = proto.unshift;
    const $pop = proto.pop;
    const $shift = proto.shift;
    const $splice = proto.splice;
    const $reverse = proto.reverse;
    const $sort = proto.sort;
    const native = { push: $push, unshift: $unshift, pop: $pop, shift: $shift, splice: $splice, reverse: $reverse, sort: $sort };
    const methods = ['push', 'unshift', 'pop', 'shift', 'splice', 'reverse', 'sort'];
    const observe = {
        // https://tc39.github.io/ecma262/#sec-array.prototype.push
        push: function () {
            const o = this.$observer;
            if (o === undefined) {
                return $push.apply(this, arguments);
            }
            const len = this.length;
            const argCount = arguments.length;
            if (argCount === 0) {
                return len;
            }
            this.length = o.indexMap.length = len + argCount;
            let i = len;
            while (i < this.length) {
                this[i] = arguments[i - len];
                o.indexMap[i] = -2;
                i++;
            }
            o.callSubscribers('push', arguments, LifecycleFlags.isCollectionMutation);
            return this.length;
        },
        // https://tc39.github.io/ecma262/#sec-array.prototype.unshift
        unshift: function () {
            const o = this.$observer;
            if (o === undefined) {
                return $unshift.apply(this, arguments);
            }
            const argCount = arguments.length;
            const inserts = new Array(argCount);
            let i = 0;
            while (i < argCount) {
                inserts[i++] = -2;
            }
            $unshift.apply(o.indexMap, inserts);
            const len = $unshift.apply(this, arguments);
            o.callSubscribers('unshift', arguments, LifecycleFlags.isCollectionMutation);
            return len;
        },
        // https://tc39.github.io/ecma262/#sec-array.prototype.pop
        pop: function () {
            const o = this.$observer;
            if (o === undefined) {
                return $pop.call(this);
            }
            const indexMap = o.indexMap;
            const element = $pop.call(this);
            // only mark indices as deleted if they actually existed in the original array
            const index = indexMap.length - 1;
            if (indexMap[index] > -1) {
                $pop.call(indexMap.deletedItems, element);
            }
            $pop.call(indexMap);
            o.callSubscribers('pop', arguments, LifecycleFlags.isCollectionMutation);
            return element;
        },
        // https://tc39.github.io/ecma262/#sec-array.prototype.shift
        shift: function () {
            const o = this.$observer;
            if (o === undefined) {
                return $shift.call(this);
            }
            const indexMap = o.indexMap;
            const element = $shift.call(this);
            // only mark indices as deleted if they actually existed in the original array
            if (indexMap[0] > -1) {
                $shift.call(indexMap.deletedItems, element);
            }
            $shift.call(indexMap);
            o.callSubscribers('shift', arguments, LifecycleFlags.isCollectionMutation);
            return element;
        },
        // https://tc39.github.io/ecma262/#sec-array.prototype.splice
        splice: function (start, deleteCount) {
            const o = this.$observer;
            if (o === undefined) {
                return $splice.apply(this, arguments);
            }
            const indexMap = o.indexMap;
            if (deleteCount > 0) {
                let i = isNaN(start) ? 0 : start;
                const to = i + deleteCount;
                while (i < to) {
                    if (indexMap[i] > -1) {
                        $splice.call(indexMap.deletedItems, this[i]);
                    }
                    i++;
                }
            }
            const argCount = arguments.length;
            if (argCount > 2) {
                const itemCount = argCount - 2;
                const inserts = new Array(itemCount);
                let i = 0;
                while (i < itemCount) {
                    inserts[i++] = -2;
                }
                $splice.call(indexMap, start, deleteCount, ...inserts);
            }
            else if (argCount === 2) {
                $splice.call(indexMap, start, deleteCount);
            }
            const deleted = $splice.apply(this, arguments);
            o.callSubscribers('splice', arguments, LifecycleFlags.isCollectionMutation);
            return deleted;
        },
        // https://tc39.github.io/ecma262/#sec-array.prototype.reverse
        reverse: function () {
            const o = this.$observer;
            if (o === undefined) {
                return $reverse.call(this);
            }
            const len = this.length;
            const middle = (len / 2) | 0;
            let lower = 0;
            // tslint:disable:no-statements-same-line
            while (lower !== middle) {
                const upper = len - lower - 1;
                const lowerValue = this[lower];
                const lowerIndex = o.indexMap[lower];
                const upperValue = this[upper];
                const upperIndex = o.indexMap[upper];
                this[lower] = upperValue;
                o.indexMap[lower] = upperIndex;
                this[upper] = lowerValue;
                o.indexMap[upper] = lowerIndex;
                lower++;
            }
            // tslint:enable:no-statements-same-line
            o.callSubscribers('reverse', arguments, LifecycleFlags.isCollectionMutation);
            return this;
        },
        // https://tc39.github.io/ecma262/#sec-array.prototype.sort
        // https://github.com/v8/v8/blob/master/src/js/array.js
        sort: function (compareFn) {
            const o = this.$observer;
            if (o === undefined) {
                return $sort.call(this, compareFn);
            }
            const len = this.length;
            if (len < 2) {
                return this;
            }
            quickSort(this, o.indexMap, 0, len, preSortCompare);
            let i = 0;
            while (i < len) {
                if (this[i] === undefined) {
                    break;
                }
                i++;
            }
            if (compareFn === undefined || typeof compareFn !== 'function' /*spec says throw a TypeError, should we do that too?*/) {
                compareFn = sortCompare;
            }
            quickSort(this, o.indexMap, 0, i, compareFn);
            o.callSubscribers('sort', arguments, LifecycleFlags.isCollectionMutation);
            return this;
        }
    };
    const descriptorProps = {
        writable: true,
        enumerable: false,
        configurable: true
    };
    const def = Object.defineProperty;
    for (const method of methods) {
        def(observe[method], 'observing', { value: true, writable: false, configurable: false, enumerable: false });
    }
    function enableArrayObservation() {
        for (const method of methods) {
            if (proto[method].observing !== true) {
                def(proto, method, Object.assign({}, descriptorProps, { value: observe[method] }));
            }
        }
    }
    enableArrayObservation();
    function disableArrayObservation() {
        for (const method of methods) {
            if (proto[method].observing === true) {
                def(proto, method, Object.assign({}, descriptorProps, { value: native[method] }));
            }
        }
    }
    let ArrayObserver = class ArrayObserver {
        constructor(lifecycle, array) {
            this.lifecycle = lifecycle;
            array.$observer = this;
            this.collection = array;
            this.resetIndexMap();
        }
    };
    ArrayObserver = __decorate([
        collectionObserver(9 /* array */)
    ], ArrayObserver);
    function getArrayObserver(lifecycle, array) {
        return array.$observer || new ArrayObserver(lifecycle, array);
    }

    const proto$1 = Map.prototype;
    const $set = proto$1.set;
    const $clear = proto$1.clear;
    const $delete = proto$1.delete;
    const native$1 = { set: $set, clear: $clear, delete: $delete };
    const methods$1 = ['set', 'clear', 'delete'];
    // note: we can't really do much with Map due to the internal data structure not being accessible so we're just using the native calls
    // fortunately, map/delete/clear are easy to reconstruct for the indexMap
    const observe$1 = {
        // https://tc39.github.io/ecma262/#sec-map.prototype.map
        set: function (key, value) {
            const o = this.$observer;
            if (o === undefined) {
                return $set.call(this, key, value);
            }
            const oldSize = this.size;
            $set.call(this, key, value);
            const newSize = this.size;
            if (newSize === oldSize) {
                let i = 0;
                for (const entry of this.entries()) {
                    if (entry[0] === key) {
                        if (entry[1] !== value) {
                            o.indexMap[i] = -2;
                        }
                        return this;
                    }
                    i++;
                }
                return this;
            }
            o.indexMap[oldSize] = -2;
            o.callSubscribers('set', arguments, LifecycleFlags.isCollectionMutation);
            return this;
        },
        // https://tc39.github.io/ecma262/#sec-map.prototype.clear
        clear: function () {
            const o = this.$observer;
            if (o === undefined) {
                return $clear.call(this);
            }
            const size = this.size;
            if (size > 0) {
                const indexMap = o.indexMap;
                let i = 0;
                for (const entry of this.keys()) {
                    if (indexMap[i] > -1) {
                        indexMap.deletedItems.push(entry);
                    }
                    i++;
                }
                $clear.call(this);
                indexMap.length = 0;
                o.callSubscribers('clear', arguments, LifecycleFlags.isCollectionMutation);
            }
            return undefined;
        },
        // https://tc39.github.io/ecma262/#sec-map.prototype.delete
        delete: function (value) {
            const o = this.$observer;
            if (o === undefined) {
                return $delete.call(this, value);
            }
            const size = this.size;
            if (size === 0) {
                return false;
            }
            let i = 0;
            const indexMap = o.indexMap;
            for (const entry of this.keys()) {
                if (entry === value) {
                    if (indexMap[i] > -1) {
                        indexMap.deletedItems.push(entry);
                    }
                    indexMap.splice(i, 1);
                    return $delete.call(this, value);
                }
                i++;
            }
            o.callSubscribers('delete', arguments, LifecycleFlags.isCollectionMutation);
            return false;
        }
    };
    const descriptorProps$1 = {
        writable: true,
        enumerable: false,
        configurable: true
    };
    const def$1 = Object.defineProperty;
    for (const method of methods$1) {
        def$1(observe$1[method], 'observing', { value: true, writable: false, configurable: false, enumerable: false });
    }
    function enableMapObservation() {
        for (const method of methods$1) {
            if (proto$1[method].observing !== true) {
                def$1(proto$1, method, Object.assign({}, descriptorProps$1, { value: observe$1[method] }));
            }
        }
    }
    enableMapObservation();
    function disableMapObservation() {
        for (const method of methods$1) {
            if (proto$1[method].observing === true) {
                def$1(proto$1, method, Object.assign({}, descriptorProps$1, { value: native$1[method] }));
            }
        }
    }
    let MapObserver = class MapObserver {
        constructor(lifecycle, map) {
            this.lifecycle = lifecycle;
            map.$observer = this;
            this.collection = map;
            this.resetIndexMap();
        }
    };
    MapObserver = __decorate([
        collectionObserver(6 /* map */)
    ], MapObserver);
    function getMapObserver(lifecycle, map) {
        return map.$observer || new MapObserver(lifecycle, map);
    }

    const proto$2 = Set.prototype;
    const $add = proto$2.add;
    const $clear$1 = proto$2.clear;
    const $delete$1 = proto$2.delete;
    const native$2 = { add: $add, clear: $clear$1, delete: $delete$1 };
    const methods$2 = ['add', 'clear', 'delete'];
    // note: we can't really do much with Set due to the internal data structure not being accessible so we're just using the native calls
    // fortunately, add/delete/clear are easy to reconstruct for the indexMap
    const observe$2 = {
        // https://tc39.github.io/ecma262/#sec-set.prototype.add
        add: function (value) {
            const o = this.$observer;
            if (o === undefined) {
                return $add.call(this, value);
            }
            const oldSize = this.size;
            $add.call(this, value);
            const newSize = this.size;
            if (newSize === oldSize) {
                return this;
            }
            o.indexMap[oldSize] = -2;
            o.callSubscribers('add', arguments, LifecycleFlags.isCollectionMutation);
            return this;
        },
        // https://tc39.github.io/ecma262/#sec-set.prototype.clear
        clear: function () {
            const o = this.$observer;
            if (o === undefined) {
                return $clear$1.call(this);
            }
            const size = this.size;
            if (size > 0) {
                const indexMap = o.indexMap;
                let i = 0;
                for (const entry of this.keys()) {
                    if (indexMap[i] > -1) {
                        indexMap.deletedItems.push(entry);
                    }
                    i++;
                }
                $clear$1.call(this);
                indexMap.length = 0;
                o.callSubscribers('clear', arguments, LifecycleFlags.isCollectionMutation);
            }
            return undefined;
        },
        // https://tc39.github.io/ecma262/#sec-set.prototype.delete
        delete: function (value) {
            const o = this.$observer;
            if (o === undefined) {
                return $delete$1.call(this, value);
            }
            const size = this.size;
            if (size === 0) {
                return false;
            }
            let i = 0;
            const indexMap = o.indexMap;
            for (const entry of this.keys()) {
                if (entry === value) {
                    if (indexMap[i] > -1) {
                        indexMap.deletedItems.push(entry);
                    }
                    indexMap.splice(i, 1);
                    return $delete$1.call(this, value);
                }
                i++;
            }
            o.callSubscribers('delete', arguments, LifecycleFlags.isCollectionMutation);
            return false;
        }
    };
    const descriptorProps$2 = {
        writable: true,
        enumerable: false,
        configurable: true
    };
    const def$2 = Object.defineProperty;
    for (const method of methods$2) {
        def$2(observe$2[method], 'observing', { value: true, writable: false, configurable: false, enumerable: false });
    }
    function enableSetObservation() {
        for (const method of methods$2) {
            if (proto$2[method].observing !== true) {
                def$2(proto$2, method, Object.assign({}, descriptorProps$2, { value: observe$2[method] }));
            }
        }
    }
    enableSetObservation();
    function disableSetObservation() {
        for (const method of methods$2) {
            if (proto$2[method].observing === true) {
                def$2(proto$2, method, Object.assign({}, descriptorProps$2, { value: native$2[method] }));
            }
        }
    }
    let SetObserver = class SetObserver {
        constructor(lifecycle, observedSet) {
            this.lifecycle = lifecycle;
            observedSet.$observer = this;
            this.collection = observedSet;
            this.resetIndexMap();
        }
    };
    SetObserver = __decorate([
        collectionObserver(7 /* set */)
    ], SetObserver);
    function getSetObserver(lifecycle, observedSet) {
        return observedSet.$observer || new SetObserver(lifecycle, observedSet);
    }

    function computed(config) {
        return function (target, key) {
            (target.computed || (target.computed = {}))[key] = config;
        };
    }
    // tslint:disable-next-line:no-typeof-undefined
    const noProxy = typeof Proxy === 'undefined';
    const computedOverrideDefaults = { static: false, volatile: false };
    /* @internal */
    function createComputedObserver(observerLocator, dirtyChecker, lifecycle, instance, propertyName, descriptor) {
        if (descriptor.configurable === false) {
            return dirtyChecker.createProperty(instance, propertyName);
        }
        if (descriptor.get) {
            const overrides = instance.constructor.computed
                ? instance.constructor.computed[propertyName] || computedOverrideDefaults
                : computedOverrideDefaults;
            if (descriptor.set) {
                if (overrides.volatile) {
                    return noProxy
                        ? dirtyChecker.createProperty(instance, propertyName)
                        : new GetterObserver(overrides, instance, propertyName, descriptor, observerLocator, lifecycle);
                }
                return new CustomSetterObserver(instance, propertyName, descriptor, lifecycle);
            }
            return noProxy
                ? dirtyChecker.createProperty(instance, propertyName)
                : new GetterObserver(overrides, instance, propertyName, descriptor, observerLocator, lifecycle);
        }
        throw Reporter.error(18, propertyName);
    }
    // Used when the getter is dependent solely on changes that happen within the setter.
    let CustomSetterObserver = class CustomSetterObserver {
        constructor(obj, propertyKey, descriptor, lifecycle) {
            this.$nextFlush = null;
            this.obj = obj;
            this.observing = false;
            this.propertyKey = propertyKey;
            this.descriptor = descriptor;
            this.lifecycle = lifecycle;
        }
        getValue() {
            return this.obj[this.propertyKey];
        }
        setValue(newValue) {
            this.obj[this.propertyKey] = newValue;
        }
        flush(flags) {
            const oldValue = this.oldValue;
            const newValue = this.currentValue;
            this.callSubscribers(newValue, oldValue, flags | LifecycleFlags.updateTargetInstance);
        }
        subscribe(subscriber) {
            if (!this.observing) {
                this.convertProperty();
            }
            this.addSubscriber(subscriber);
        }
        unsubscribe(subscriber) {
            this.removeSubscriber(subscriber);
        }
        convertProperty() {
            const setter = this.descriptor.set;
            const that = this;
            this.observing = true;
            this.currentValue = this.obj[this.propertyKey];
            Reflect.defineProperty(this.obj, this.propertyKey, {
                set: function (newValue) {
                    setter.call(that.obj, newValue);
                    const oldValue = that.currentValue;
                    if (oldValue !== newValue) {
                        that.oldValue = oldValue;
                        that.lifecycle.enqueueFlush(that).catch(error => { throw error; });
                        that.currentValue = newValue;
                    }
                }
            });
        }
    };
    CustomSetterObserver = __decorate([
        subscriberCollection(MutationKind.instance)
    ], CustomSetterObserver);
    CustomSetterObserver.prototype.dispose = PLATFORM.noop;
    // Used when there is no setter, and the getter is dependent on other properties of the object;
    // Used when there is a setter but the value of the getter can change based on properties set outside of the setter.
    /** @internal */
    let GetterObserver = class GetterObserver {
        constructor(overrides, obj, propertyKey, descriptor, observerLocator, lifecycle) {
            this.obj = obj;
            this.propertyKey = propertyKey;
            this.controller = new GetterController(overrides, obj, propertyKey, descriptor, this, observerLocator, lifecycle);
        }
        getValue() {
            return this.controller.value;
        }
        setValue(newValue) {
            return;
        }
        flush(flags) {
            const oldValue = this.controller.value;
            const newValue = this.controller.getValueAndCollectDependencies();
            if (oldValue !== newValue) {
                this.callSubscribers(newValue, oldValue, flags | LifecycleFlags.updateTargetInstance);
            }
        }
        subscribe(subscriber) {
            this.addSubscriber(subscriber);
            this.controller.onSubscriberAdded();
        }
        unsubscribe(subscriber) {
            this.removeSubscriber(subscriber);
            this.controller.onSubscriberRemoved();
        }
    };
    GetterObserver = __decorate([
        subscriberCollection(MutationKind.instance)
    ], GetterObserver);
    GetterObserver.prototype.dispose = PLATFORM.noop;
    /** @internal */
    class GetterController {
        constructor(overrides, instance, propertyName, descriptor, owner, observerLocator, lifecycle) {
            this.isCollecting = false;
            this.dependencies = [];
            this.instance = instance;
            this.lifecycle = lifecycle;
            this.overrides = overrides;
            this.owner = owner;
            this.propertyName = propertyName;
            this.subscriberCount = 0;
            const proxy = new Proxy(instance, createGetterTraps(observerLocator, this));
            const getter = descriptor.get;
            const ctrl = this;
            Reflect.defineProperty(instance, propertyName, {
                get: function () {
                    if (ctrl.subscriberCount < 1 || ctrl.isCollecting) {
                        ctrl.value = getter.apply(proxy);
                    }
                    return ctrl.value;
                }
            });
        }
        addDependency(subscribable) {
            if (this.dependencies.includes(subscribable)) {
                return;
            }
            this.dependencies.push(subscribable);
        }
        onSubscriberAdded() {
            this.subscriberCount++;
            if (this.subscriberCount > 1) {
                return;
            }
            this.getValueAndCollectDependencies(true);
        }
        getValueAndCollectDependencies(requireCollect = false) {
            const dynamicDependencies = !this.overrides.static || requireCollect;
            if (dynamicDependencies) {
                this.unsubscribeAllDependencies();
                this.isCollecting = true;
            }
            this.value = this.instance[this.propertyName]; // triggers observer collection
            if (dynamicDependencies) {
                this.isCollecting = false;
                this.dependencies.forEach(x => { x.subscribe(this); });
            }
            return this.value;
        }
        onSubscriberRemoved() {
            this.subscriberCount--;
            if (this.subscriberCount === 0) {
                this.unsubscribeAllDependencies();
            }
        }
        handleChange() {
            this.lifecycle.enqueueFlush(this.owner).catch(error => { throw error; });
        }
        unsubscribeAllDependencies() {
            this.dependencies.forEach(x => { x.unsubscribe(this); });
            this.dependencies.length = 0;
        }
    }
    function createGetterTraps(observerLocator, controller) {
        return {
            get: function (instance, key) {
                const value = instance[key];
                if (key === '$observers' || typeof value === 'function' || !controller.isCollecting) {
                    return value;
                }
                // TODO: fix this
                if (instance instanceof Array) {
                    controller.addDependency(observerLocator.getArrayObserver(instance));
                    if (key === 'length') {
                        controller.addDependency(observerLocator.getArrayObserver(instance).getLengthObserver());
                    }
                }
                else if (instance instanceof Map) {
                    controller.addDependency(observerLocator.getMapObserver(instance));
                    if (key === 'size') {
                        controller.addDependency(observerLocator.getMapObserver(instance).getLengthObserver());
                    }
                }
                else if (instance instanceof Set) {
                    controller.addDependency(observerLocator.getSetObserver(instance));
                    if (key === 'size') {
                        return observerLocator.getSetObserver(instance).getLengthObserver();
                    }
                }
                else {
                    controller.addDependency(observerLocator.getObserver(instance, key));
                }
                return proxyOrValue(observerLocator, controller, value);
            }
        };
    }
    function proxyOrValue(observerLocator, controller, value) {
        if (!(value instanceof Object)) {
            return value;
        }
        return new Proxy(value, createGetterTraps(observerLocator, controller));
    }

    const IDirtyChecker = DI.createInterface('IDirtyChecker').withDefault(x => x.singleton(DirtyChecker));
    /** @internal */
    class DirtyChecker {
        constructor() {
            this.checkDelay = 120;
            this.tracked = [];
        }
        createProperty(obj, propertyName) {
            return new DirtyCheckProperty(this, obj, propertyName);
        }
        addProperty(property) {
            const tracked = this.tracked;
            tracked.push(property);
            if (tracked.length === 1) {
                this.scheduleDirtyCheck();
            }
        }
        removeProperty(property) {
            const tracked = this.tracked;
            tracked.splice(tracked.indexOf(property), 1);
        }
        scheduleDirtyCheck() {
            PLATFORM.global.setTimeout(() => { this.check(); }, this.checkDelay);
        }
        check() {
            const tracked = this.tracked;
            let i = tracked.length;
            while (i--) {
                const current = tracked[i];
                if (current.isDirty()) {
                    current.flush(LifecycleFlags.fromFlush);
                }
            }
            if (tracked.length) {
                this.scheduleDirtyCheck();
            }
        }
    }
    /** @internal */
    let DirtyCheckProperty = class DirtyCheckProperty {
        constructor(dirtyChecker, obj, propertyKey) {
            this.obj = obj;
            this.propertyKey = propertyKey;
            this.dirtyChecker = dirtyChecker;
        }
        isDirty() {
            return this.oldValue !== this.obj[this.propertyKey];
        }
        getValue() {
            return this.obj[this.propertyKey];
        }
        setValue(newValue) {
            this.obj[this.propertyKey] = newValue;
        }
        flush(flags) {
            const oldValue = this.oldValue;
            const newValue = this.getValue();
            this.callSubscribers(newValue, oldValue, flags | LifecycleFlags.updateTargetInstance);
            this.oldValue = newValue;
        }
        subscribe(subscriber) {
            if (!this.hasSubscribers()) {
                this.oldValue = this.getValue();
                this.dirtyChecker.addProperty(this);
            }
            this.addSubscriber(subscriber);
        }
        unsubscribe(subscriber) {
            if (this.removeSubscriber(subscriber) && !this.hasSubscribers()) {
                this.dirtyChecker.removeProperty(this);
            }
        }
    };
    DirtyCheckProperty = __decorate([
        propertyObserver()
    ], DirtyCheckProperty);

    const noop = PLATFORM.noop;
    // note: string.length is the only property of any primitive that is not a function,
    // so we can hardwire it to that and simply return undefined for anything else
    // note#2: a modified primitive constructor prototype would not work (and really, it shouldn't..)
    class PrimitiveObserver {
        constructor(obj, propertyKey) {
            this.doNotCache = true;
            // we don't need to store propertyName because only 'length' can return a useful value
            if (propertyKey === 'length') {
                // deliberately not checking for typeof string as users probably still want to know via an error that their string is undefined
                this.obj = obj;
                this.getValue = this.getStringLength;
            }
            else {
                this.getValue = this.returnUndefined;
            }
        }
        getStringLength() {
            return this.obj.length;
        }
        returnUndefined() {
            return undefined;
        }
    }
    PrimitiveObserver.prototype.setValue = noop;
    PrimitiveObserver.prototype.subscribe = noop;
    PrimitiveObserver.prototype.unsubscribe = noop;
    PrimitiveObserver.prototype.dispose = noop;

    class PropertyAccessor {
        constructor(obj, propertyKey) {
            this.obj = obj;
            this.propertyKey = propertyKey;
        }
        getValue() {
            return this.obj[this.propertyKey];
        }
        setValue(value) {
            this.obj[this.propertyKey] = value;
        }
    }

    const toStringTag$1 = Object.prototype.toString;
    const IObserverLocator = DI.createInterface('IObserverLocator').noDefault();
    const ITargetObserverLocator = DI.createInterface('ITargetObserverLocator').noDefault();
    const ITargetAccessorLocator = DI.createInterface('ITargetAccessorLocator').noDefault();
    function getPropertyDescriptor(subject, name) {
        let pd = Object.getOwnPropertyDescriptor(subject, name);
        let proto = Object.getPrototypeOf(subject);
        while (pd === undefined && proto !== null) {
            pd = Object.getOwnPropertyDescriptor(proto, name);
            proto = Object.getPrototypeOf(proto);
        }
        return pd;
    }
    /** @internal */
    class ObserverLocator {
        constructor(lifecycle, dirtyChecker, targetObserverLocator, targetAccessorLocator) {
            this.adapters = [];
            this.dirtyChecker = dirtyChecker;
            this.lifecycle = lifecycle;
            this.targetObserverLocator = targetObserverLocator;
            this.targetAccessorLocator = targetAccessorLocator;
        }
        getObserver(obj, propertyName) {
            if (isBindingContext(obj)) {
                return obj.getObservers().getOrCreate(obj, propertyName);
            }
            let observersLookup = obj.$observers;
            let observer;
            if (observersLookup && propertyName in observersLookup) {
                return observersLookup[propertyName];
            }
            observer = this.createPropertyObserver(obj, propertyName);
            if (!observer.doNotCache) {
                if (observersLookup === undefined) {
                    observersLookup = this.getOrCreateObserversLookup(obj);
                }
                observersLookup[propertyName] = observer;
            }
            return observer;
        }
        addAdapter(adapter) {
            this.adapters.push(adapter);
        }
        getAccessor(obj, propertyName) {
            if (this.targetAccessorLocator.handles(obj)) {
                if (this.targetObserverLocator.overridesAccessor(obj, propertyName)) {
                    return this.getObserver(obj, propertyName);
                }
                return this.targetAccessorLocator.getAccessor(this.lifecycle, obj, propertyName);
            }
            return new PropertyAccessor(obj, propertyName);
        }
        getArrayObserver(observedArray) {
            return getArrayObserver(this.lifecycle, observedArray);
        }
        getMapObserver(observedMap) {
            return getMapObserver(this.lifecycle, observedMap);
        }
        getSetObserver(observedSet) {
            return getSetObserver(this.lifecycle, observedSet);
        }
        getOrCreateObserversLookup(obj) {
            return obj.$observers || this.createObserversLookup(obj);
        }
        createObserversLookup(obj) {
            const value = {};
            if (!Reflect.defineProperty(obj, '$observers', {
                enumerable: false,
                configurable: false,
                writable: false,
                value: value
            })) {
                Reporter.write(0, obj);
            }
            return value;
        }
        getAdapterObserver(obj, propertyName, descriptor) {
            for (let i = 0, ii = this.adapters.length; i < ii; i++) {
                const adapter = this.adapters[i];
                const observer = adapter.getObserver(obj, propertyName, descriptor);
                if (observer) {
                    return observer;
                }
            }
            return null;
        }
        createPropertyObserver(obj, propertyName) {
            if (!(obj instanceof Object)) {
                return new PrimitiveObserver(obj, propertyName);
            }
            let isNode = false;
            if (this.targetObserverLocator.handles(obj)) {
                const observer = this.targetObserverLocator.getObserver(this.lifecycle, this, obj, propertyName);
                if (observer !== null) {
                    return observer;
                }
                if (observer !== null) {
                    return observer;
                }
                isNode = true;
            }
            const tag = toStringTag$1.call(obj);
            switch (tag) {
                case '[object Array]':
                    if (propertyName === 'length') {
                        return this.getArrayObserver(obj).getLengthObserver();
                    }
                    return this.dirtyChecker.createProperty(obj, propertyName);
                case '[object Map]':
                    if (propertyName === 'size') {
                        return this.getMapObserver(obj).getLengthObserver();
                    }
                    return this.dirtyChecker.createProperty(obj, propertyName);
                case '[object Set]':
                    if (propertyName === 'size') {
                        return this.getSetObserver(obj).getLengthObserver();
                    }
                    return this.dirtyChecker.createProperty(obj, propertyName);
            }
            const descriptor = getPropertyDescriptor(obj, propertyName);
            if (descriptor && (descriptor.get || descriptor.set)) {
                if (descriptor.get && descriptor.get.getObserver) {
                    return descriptor.get.getObserver(obj);
                }
                // attempt to use an adapter before resorting to dirty checking.
                const adapterObserver = this.getAdapterObserver(obj, propertyName, descriptor);
                if (adapterObserver) {
                    return adapterObserver;
                }
                if (isNode) {
                    // TODO: use MutationObserver
                    return this.dirtyChecker.createProperty(obj, propertyName);
                }
                return createComputedObserver(this, this.dirtyChecker, this.lifecycle, obj, propertyName, descriptor);
            }
            return new SetterObserver(obj, propertyName);
        }
    }
    ObserverLocator.inject = [ILifecycle, IDirtyChecker, ITargetObserverLocator, ITargetAccessorLocator];
    function getCollectionObserver(lifecycle, collection) {
        switch (toStringTag$1.call(collection)) {
            case '[object Array]':
                return getArrayObserver(lifecycle, collection);
            case '[object Map]':
                return getMapObserver(lifecycle, collection);
            case '[object Set]':
                return getSetObserver(lifecycle, collection);
        }
        return null;
    }
    function isBindingContext(obj) {
        return obj.$synthetic === true;
    }

    const noop$1 = PLATFORM.noop;
    let SelfObserver = class SelfObserver {
        constructor(instance, propertyName, callbackName) {
            this.obj = instance;
            this.propertyKey = propertyName;
            this.currentValue = instance[propertyName];
            this.callback = callbackName in instance
                ? instance[callbackName].bind(instance)
                : noop$1;
        }
        getValue() {
            return this.currentValue;
        }
        setValue(newValue, flags) {
            const currentValue = this.currentValue;
            if (currentValue !== newValue) {
                this.currentValue = newValue;
                if (!(flags & LifecycleFlags.fromBind)) {
                    const coercedValue = this.callback(newValue, currentValue);
                    if (coercedValue !== undefined) {
                        this.currentValue = newValue = coercedValue;
                    }
                    this.callSubscribers(newValue, currentValue, flags);
                }
            }
        }
    };
    SelfObserver = __decorate([
        propertyObserver()
    ], SelfObserver);

    const { oneTime: oneTime$2, toView: toView$2, fromView: fromView$1, twoWay } = BindingMode;
    class BindingModeBehavior {
        constructor(mode) {
            this.mode = mode;
        }
        bind(flags, scope, binding) {
            binding.originalMode = binding.mode;
            binding.mode = this.mode;
        }
        unbind(flags, scope, binding) {
            binding.mode = binding.originalMode;
            binding.originalMode = null;
        }
    }
    class OneTimeBindingBehavior extends BindingModeBehavior {
        constructor() {
            super(oneTime$2);
        }
    }
    BindingBehaviorResource.define('oneTime', OneTimeBindingBehavior);
    class ToViewBindingBehavior extends BindingModeBehavior {
        constructor() {
            super(toView$2);
        }
    }
    BindingBehaviorResource.define('toView', ToViewBindingBehavior);
    class FromViewBindingBehavior extends BindingModeBehavior {
        constructor() {
            super(fromView$1);
        }
    }
    BindingBehaviorResource.define('fromView', FromViewBindingBehavior);
    class TwoWayBindingBehavior extends BindingModeBehavior {
        constructor() {
            super(twoWay);
        }
    }
    BindingBehaviorResource.define('twoWay', TwoWayBindingBehavior);

    const unset = {};
    /** @internal */
    function debounceCallSource(newValue, oldValue, flags) {
        const state = this.debounceState;
        PLATFORM.global.clearTimeout(state.timeoutId);
        state.timeoutId = PLATFORM.global.setTimeout(() => { this.debouncedMethod(newValue, oldValue, flags); }, state.delay);
    }
    /** @internal */
    function debounceCall(newValue, oldValue, flags) {
        const state = this.debounceState;
        PLATFORM.global.clearTimeout(state.timeoutId);
        if (!(flags & state.callContextToDebounce)) {
            state.oldValue = unset;
            this.debouncedMethod(newValue, oldValue, flags);
            return;
        }
        if (state.oldValue === unset) {
            state.oldValue = oldValue;
        }
        const timeoutId = PLATFORM.global.setTimeout(() => {
            const ov = state.oldValue;
            state.oldValue = unset;
            this.debouncedMethod(newValue, ov, flags);
        }, state.delay);
        state.timeoutId = timeoutId;
    }
    const fromView$2 = BindingMode.fromView;
    class DebounceBindingBehavior {
        bind(flags, scope, binding, delay = 200) {
            let methodToDebounce;
            let callContextToDebounce;
            let debouncer;
            if (binding instanceof Binding) {
                methodToDebounce = 'handleChange';
                debouncer = debounceCall;
                callContextToDebounce = binding.mode & fromView$2 ? LifecycleFlags.updateSourceExpression : LifecycleFlags.updateTargetInstance;
            }
            else {
                methodToDebounce = 'callSource';
                debouncer = debounceCallSource;
                callContextToDebounce = LifecycleFlags.updateTargetInstance;
            }
            // stash the original method and it's name.
            // note: a generic name like "originalMethod" is not used to avoid collisions
            // with other binding behavior types.
            binding.debouncedMethod = binding[methodToDebounce];
            binding.debouncedMethod.originalName = methodToDebounce;
            // replace the original method with the debouncing version.
            binding[methodToDebounce] = debouncer;
            // create the debounce state.
            binding.debounceState = {
                callContextToDebounce,
                delay,
                timeoutId: 0,
                oldValue: unset
            };
        }
        unbind(flags, scope, binding) {
            // restore the state of the binding.
            const methodToRestore = binding.debouncedMethod.originalName;
            binding[methodToRestore] = binding.debouncedMethod;
            binding.debouncedMethod = null;
            PLATFORM.global.clearTimeout(binding.debounceState.timeoutId);
            binding.debounceState = null;
        }
    }
    BindingBehaviorResource.define('debounce', DebounceBindingBehavior);

    class SignalBindingBehavior {
        constructor(signaler) {
            this.signaler = signaler;
        }
        bind(flags, scope, binding, ...args) {
            if (!binding.updateTarget) {
                throw Reporter.error(11);
            }
            if (arguments.length === 4) {
                const name = args[0];
                this.signaler.addSignalListener(name, binding);
                binding.signal = name;
            }
            else if (arguments.length > 4) {
                const names = Array.prototype.slice.call(arguments, 3);
                let i = names.length;
                while (i--) {
                    const name = names[i];
                    this.signaler.addSignalListener(name, binding);
                }
                binding.signal = names;
            }
            else {
                throw Reporter.error(12);
            }
        }
        unbind(flags, scope, binding) {
            const name = binding.signal;
            binding.signal = null;
            if (Array.isArray(name)) {
                const names = name;
                let i = names.length;
                while (i--) {
                    this.signaler.removeSignalListener(names[i], binding);
                }
            }
            else {
                this.signaler.removeSignalListener(name, binding);
            }
        }
    }
    SignalBindingBehavior.inject = [ISignaler];
    BindingBehaviorResource.define('signal', SignalBindingBehavior);

    /** @internal */
    function throttle(newValue) {
        const state = this.throttleState;
        const elapsed = +new Date() - state.last;
        if (elapsed >= state.delay) {
            PLATFORM.global.clearTimeout(state.timeoutId);
            state.timeoutId = -1;
            state.last = +new Date();
            this.throttledMethod(newValue);
            return;
        }
        state.newValue = newValue;
        if (state.timeoutId === -1) {
            const timeoutId = PLATFORM.global.setTimeout(() => {
                state.timeoutId = -1;
                state.last = +new Date();
                this.throttledMethod(state.newValue);
            }, state.delay - elapsed);
            state.timeoutId = timeoutId;
        }
    }
    class ThrottleBindingBehavior {
        bind(flags, scope, binding, delay = 200) {
            let methodToThrottle;
            if (binding instanceof Binding) {
                if (binding.mode === BindingMode.twoWay) {
                    methodToThrottle = 'updateSource';
                }
                else {
                    methodToThrottle = 'updateTarget';
                }
            }
            else {
                methodToThrottle = 'callSource';
            }
            // stash the original method and it's name.
            // note: a generic name like "originalMethod" is not used to avoid collisions
            // with other binding behavior types.
            binding.throttledMethod = binding[methodToThrottle];
            binding.throttledMethod.originalName = methodToThrottle;
            // replace the original method with the throttling version.
            binding[methodToThrottle] = throttle;
            // create the throttle state.
            binding.throttleState = {
                delay: delay,
                last: 0,
                timeoutId: -1
            };
        }
        unbind(flags, scope, binding) {
            // restore the state of the binding.
            const methodToRestore = binding.throttledMethod.originalName;
            binding[methodToRestore] = binding.throttledMethod;
            binding.throttledMethod = null;
            PLATFORM.global.clearTimeout(binding.throttleState.timeoutId);
            binding.throttleState = null;
        }
    }
    BindingBehaviorResource.define('throttle', ThrottleBindingBehavior);

    /** @internal */
    const customElementName = 'custom-element';
    /** @internal */
    function customElementKey(name) {
        return `${customElementName}:${name}`;
    }
    /** @internal */
    function customElementBehavior(node) {
        return node.$customElement === undefined ? null : node.$customElement;
    }
    /** @internal */
    const customAttributeName = 'custom-attribute';
    /** @internal */
    function customAttributeKey(name) {
        return `${customAttributeName}:${name}`;
    }
    /**
     * TargetedInstructionType enum values become the property names for the associated renderers when they are injected
     * into the `Renderer`.
     *
     * Additional instruction types can be added as long as they are 2 characters long and do not clash with existing ones.
     *
     * By convention, the instruction types for a particular runtime start with the same first letter, and the second letter
     * starts counting from letter `a`. The standard runtime instruction types all start with the letter `r`.
     */
    var TargetedInstructionType;
    (function (TargetedInstructionType) {
        TargetedInstructionType["hydrateElement"] = "ra";
        TargetedInstructionType["hydrateAttribute"] = "rb";
        TargetedInstructionType["hydrateTemplateController"] = "rc";
        TargetedInstructionType["hydrateLetElement"] = "rd";
        TargetedInstructionType["setProperty"] = "re";
        TargetedInstructionType["interpolation"] = "rf";
        TargetedInstructionType["propertyBinding"] = "rg";
        TargetedInstructionType["callBinding"] = "rh";
        TargetedInstructionType["letBinding"] = "ri";
        TargetedInstructionType["refBinding"] = "rj";
        TargetedInstructionType["iteratorBinding"] = "rk";
    })(TargetedInstructionType || (TargetedInstructionType = {}));
    const ITargetedInstruction = DI.createInterface('createInterface').noDefault();
    function isTargetedInstruction(value) {
        const type = value.type;
        return typeof type === 'string' && type.length === 2;
    }
    /** @internal */
    const buildRequired = Object.freeze({
        required: true,
        compiler: 'default'
    });
    const buildNotRequired = Object.freeze({
        required: false,
        compiler: 'default'
    });
    // Note: this is a little perf thing; having one predefined class with the properties always
    // assigned in the same order ensures the browser can keep reusing the same generated hidden
    // class
    class DefaultTemplateDefinition {
        constructor() {
            this.name = 'unnamed';
            this.template = null;
            this.cache = 0;
            this.build = buildNotRequired;
            this.bindables = PLATFORM.emptyObject;
            this.instructions = PLATFORM.emptyArray;
            this.dependencies = PLATFORM.emptyArray;
            this.surrogates = PLATFORM.emptyArray;
            this.containerless = false;
            this.shadowOptions = null;
            this.hasSlots = false;
        }
    }
    const templateDefinitionAssignables = [
        'name',
        'template',
        'cache',
        'build',
        'containerless',
        'shadowOptions',
        'hasSlots'
    ];
    const templateDefinitionArrays = [
        'instructions',
        'dependencies',
        'surrogates'
    ];
    // tslint:disable-next-line:parameters-max-number // TODO: Reduce complexity (currently at 64)
    function buildTemplateDefinition(ctor, nameOrDef, template, cache, build, bindables, instructions, dependencies, surrogates, containerless, shadowOptions, hasSlots) {
        const def = new DefaultTemplateDefinition();
        // all cases fall through intentionally
        const argLen = arguments.length;
        switch (argLen) {
            case 12: if (hasSlots !== null)
                def.hasSlots = hasSlots;
            case 11: if (shadowOptions !== null)
                def.shadowOptions = shadowOptions;
            case 10: if (containerless !== null)
                def.containerless = containerless;
            case 9: if (surrogates !== null)
                def.surrogates = PLATFORM.toArray(surrogates);
            case 8: if (dependencies !== null)
                def.dependencies = PLATFORM.toArray(dependencies);
            case 7: if (instructions !== null)
                def.instructions = PLATFORM.toArray(instructions);
            case 6: if (bindables !== null)
                def.bindables = Object.assign({}, bindables);
            case 5: if (build !== null)
                def.build = build === true ? buildRequired : build === false ? buildNotRequired : Object.assign({}, build);
            case 4: if (cache !== null)
                def.cache = cache;
            case 3: if (template !== null)
                def.template = template;
            case 2:
                if (ctor !== null) {
                    if (ctor['bindables']) {
                        def.bindables = Object.assign({}, ctor.bindables);
                    }
                    if (ctor['containerless']) {
                        def.containerless = ctor.containerless;
                    }
                    if (ctor['shadowOptions']) {
                        def.shadowOptions = ctor.shadowOptions;
                    }
                }
                if (typeof nameOrDef === 'string') {
                    if (nameOrDef.length > 0) {
                        def.name = nameOrDef;
                    }
                }
                else if (nameOrDef !== null) {
                    templateDefinitionAssignables.forEach(prop => {
                        if (nameOrDef[prop]) {
                            def[prop] = nameOrDef[prop];
                        }
                    });
                    templateDefinitionArrays.forEach(prop => {
                        if (nameOrDef[prop]) {
                            def[prop] = PLATFORM.toArray(nameOrDef[prop]);
                        }
                    });
                    if (nameOrDef['bindables']) {
                        if (def.bindables === PLATFORM.emptyObject) {
                            def.bindables = Object.assign({}, nameOrDef.bindables);
                        }
                        else {
                            Object.assign(def.bindables, nameOrDef.bindables);
                        }
                    }
                }
        }
        // special handling for invocations that quack like a @customElement decorator
        if (argLen === 2 && ctor !== null && (typeof nameOrDef === 'string' || !('build' in nameOrDef))) {
            def.build = buildRequired;
        }
        return def;
    }

    /** @internal */
    // tslint:disable-next-line:no-ignored-initial-value
    function $attachAttribute(flags) {
        if (this.$state & 8 /* isAttached */) {
            return;
        }
        const lifecycle = this.$lifecycle;
        lifecycle.beginAttach();
        // add isAttaching flag
        this.$state |= 4 /* isAttaching */;
        flags |= LifecycleFlags.fromAttach;
        const hooks = this.$hooks;
        if (hooks & 16 /* hasAttaching */) {
            this.attaching(flags);
        }
        // add isAttached flag, remove isAttaching flag
        this.$state |= 8 /* isAttached */;
        this.$state &= ~4 /* isAttaching */;
        if (hooks & 32 /* hasAttached */) {
            lifecycle.enqueueAttached(this);
        }
        lifecycle.endAttach(flags);
    }
    /** @internal */
    // tslint:disable-next-line:no-ignored-initial-value
    function $attachElement(flags) {
        if (this.$state & 8 /* isAttached */) {
            return;
        }
        const lifecycle = this.$lifecycle;
        lifecycle.beginAttach();
        // add isAttaching flag
        this.$state |= 4 /* isAttaching */;
        flags |= LifecycleFlags.fromAttach;
        const hooks = this.$hooks;
        if (hooks & 16 /* hasAttaching */) {
            this.attaching(flags);
        }
        let current = this.$attachableHead;
        while (current !== null) {
            current.$attach(flags);
            current = current.$nextAttach;
        }
        lifecycle.enqueueMount(this);
        // add isAttached flag, remove isAttaching flag
        this.$state |= 8 /* isAttached */;
        this.$state &= ~4 /* isAttaching */;
        if (hooks & 32 /* hasAttached */) {
            lifecycle.enqueueAttached(this);
        }
        lifecycle.endAttach(flags);
    }
    /** @internal */
    function $attachView(flags) {
        if (this.$state & 8 /* isAttached */) {
            return;
        }
        // add isAttaching flag
        this.$state |= 4 /* isAttaching */;
        flags |= LifecycleFlags.fromAttach;
        let current = this.$attachableHead;
        while (current !== null) {
            current.$attach(flags);
            current = current.$nextAttach;
        }
        this.$lifecycle.enqueueMount(this);
        // add isAttached flag, remove isAttaching flag
        this.$state |= 8 /* isAttached */;
        this.$state &= ~4 /* isAttaching */;
    }
    /** @internal */
    // tslint:disable-next-line:no-ignored-initial-value
    function $detachAttribute(flags) {
        if (this.$state & 8 /* isAttached */) {
            const lifecycle = this.$lifecycle;
            lifecycle.beginDetach();
            // add isDetaching flag
            this.$state |= 32 /* isDetaching */;
            flags |= LifecycleFlags.fromDetach;
            const hooks = this.$hooks;
            if (hooks & 64 /* hasDetaching */) {
                this.detaching(flags);
            }
            // remove isAttached and isDetaching flags
            this.$state &= ~(8 /* isAttached */ | 32 /* isDetaching */);
            if (hooks & 128 /* hasDetached */) {
                lifecycle.enqueueDetached(this);
            }
            lifecycle.endDetach(flags);
        }
    }
    /** @internal */
    // tslint:disable-next-line:no-ignored-initial-value
    function $detachElement(flags) {
        if (this.$state & 8 /* isAttached */) {
            const lifecycle = this.$lifecycle;
            lifecycle.beginDetach();
            // add isDetaching flag
            this.$state |= 32 /* isDetaching */;
            flags |= LifecycleFlags.fromDetach;
            // Only unmount if either:
            // - No parent view/element is queued for unmount yet, or
            // - Aurelia is stopping (in which case all nodes need to return to their fragments for a clean mount on next start)
            if (((flags & LifecycleFlags.parentUnmountQueued) ^ LifecycleFlags.parentUnmountQueued) | (flags & LifecycleFlags.fromStopTask)) {
                lifecycle.enqueueUnmount(this);
                flags |= LifecycleFlags.parentUnmountQueued;
            }
            const hooks = this.$hooks;
            if (hooks & 64 /* hasDetaching */) {
                this.detaching(flags);
            }
            let current = this.$attachableTail;
            while (current !== null) {
                current.$detach(flags);
                current = current.$prevAttach;
            }
            // remove isAttached and isDetaching flags
            this.$state &= ~(8 /* isAttached */ | 32 /* isDetaching */);
            if (hooks & 128 /* hasDetached */) {
                lifecycle.enqueueDetached(this);
            }
            lifecycle.endDetach(flags);
        }
    }
    /** @internal */
    function $detachView(flags) {
        if (this.$state & 8 /* isAttached */) {
            // add isDetaching flag
            this.$state |= 32 /* isDetaching */;
            flags |= LifecycleFlags.fromDetach;
            // Only unmount if either:
            // - No parent view/element is queued for unmount yet, or
            // - Aurelia is stopping (in which case all nodes need to return to their fragments for a clean mount on next start)
            if (((flags & LifecycleFlags.parentUnmountQueued) ^ LifecycleFlags.parentUnmountQueued) | (flags & LifecycleFlags.fromStopTask)) {
                this.$lifecycle.enqueueUnmount(this);
                flags |= LifecycleFlags.parentUnmountQueued;
            }
            let current = this.$attachableTail;
            while (current !== null) {
                current.$detach(flags);
                current = current.$prevAttach;
            }
            // remove isAttached and isDetaching flags
            this.$state &= ~(8 /* isAttached */ | 32 /* isDetaching */);
        }
    }
    /** @internal */
    function $cacheAttribute(flags) {
        flags |= LifecycleFlags.fromCache;
        if (this.$hooks & 2048 /* hasCaching */) {
            this.caching(flags);
        }
    }
    /** @internal */
    function $cacheElement(flags) {
        flags |= LifecycleFlags.fromCache;
        if (this.$hooks & 2048 /* hasCaching */) {
            this.caching(flags);
        }
        let current = this.$attachableTail;
        while (current !== null) {
            current.$cache(flags);
            current = current.$prevAttach;
        }
    }
    /** @internal */
    function $cacheView(flags) {
        flags |= LifecycleFlags.fromCache;
        let current = this.$attachableTail;
        while (current !== null) {
            current.$cache(flags);
            current = current.$prevAttach;
        }
    }
    /** @internal */
    function $mountElement(flags) {
        if (!(this.$state & 16 /* isMounted */)) {
            this.$state |= 16 /* isMounted */;
            this.$projector.project(this.$nodes);
        }
    }
    /** @internal */
    function $unmountElement(flags) {
        if (this.$state & 16 /* isMounted */) {
            this.$state &= ~16 /* isMounted */;
            this.$projector.take(this.$nodes);
        }
    }
    /** @internal */
    function $mountView(flags) {
        if (!(this.$state & 16 /* isMounted */)) {
            this.$state |= 16 /* isMounted */;
            this.$nodes.insertBefore(this.location);
        }
    }
    /** @internal */
    function $unmountView(flags) {
        if (this.$state & 16 /* isMounted */) {
            this.$state &= ~16 /* isMounted */;
            this.$nodes.remove();
            if (this.isFree) {
                this.isFree = false;
                if (this.cache.tryReturnToCache(this)) {
                    this.$state |= 128 /* isCached */;
                    return true;
                }
            }
            return false;
        }
        return false;
    }

    /** @internal */
    function $bindAttribute(flags, scope) {
        flags |= LifecycleFlags.fromBind;
        if (this.$state & 2 /* isBound */) {
            if (this.$scope === scope) {
                return;
            }
            this.$unbind(flags);
        }
        const lifecycle = this.$lifecycle;
        lifecycle.beginBind();
        // add isBinding flag
        this.$state |= 1 /* isBinding */;
        const hooks = this.$hooks;
        if (hooks & 8 /* hasBound */) {
            lifecycle.enqueueBound(this);
        }
        this.$scope = scope;
        if (hooks & 4 /* hasBinding */) {
            this.binding(flags);
        }
        // add isBound flag and remove isBinding flag
        this.$state |= 2 /* isBound */;
        this.$state &= ~1 /* isBinding */;
        lifecycle.endBind(flags);
    }
    /** @internal */
    function $bindElement(flags, parentScope) {
        if (this.$state & 2 /* isBound */) {
            return;
        }
        const scope = this.$scope;
        scope.parentScope = parentScope;
        const lifecycle = this.$lifecycle;
        lifecycle.beginBind();
        // add isBinding flag
        this.$state |= 1 /* isBinding */;
        const hooks = this.$hooks;
        flags |= LifecycleFlags.fromBind;
        if (hooks & 8 /* hasBound */) {
            lifecycle.enqueueBound(this);
        }
        if (hooks & 4 /* hasBinding */) {
            this.binding(flags);
        }
        let current = this.$bindableHead;
        while (current !== null) {
            current.$bind(flags, scope);
            current = current.$nextBind;
        }
        // add isBound flag and remove isBinding flag
        this.$state |= 2 /* isBound */;
        this.$state &= ~1 /* isBinding */;
        lifecycle.endBind(flags);
    }
    /** @internal */
    function $bindView(flags, scope) {
        flags |= LifecycleFlags.fromBind;
        if (this.$state & 2 /* isBound */) {
            if (this.$scope === scope) {
                return;
            }
            this.$unbind(flags);
        }
        // add isBinding flag
        this.$state |= 1 /* isBinding */;
        this.$scope = scope;
        let current = this.$bindableHead;
        while (current !== null) {
            current.$bind(flags, scope);
            current = current.$nextBind;
        }
        // add isBound flag and remove isBinding flag
        this.$state |= 2 /* isBound */;
        this.$state &= ~1 /* isBinding */;
    }
    /** @internal */
    function $unbindAttribute(flags) {
        if (this.$state & 2 /* isBound */) {
            const lifecycle = this.$lifecycle;
            lifecycle.beginUnbind();
            // add isUnbinding flag
            this.$state |= 64 /* isUnbinding */;
            const hooks = this.$hooks;
            flags |= LifecycleFlags.fromUnbind;
            if (hooks & 512 /* hasUnbound */) {
                lifecycle.enqueueUnbound(this);
            }
            if (hooks & 256 /* hasUnbinding */) {
                this.unbinding(flags);
            }
            // remove isBound and isUnbinding flags
            this.$state &= ~(2 /* isBound */ | 64 /* isUnbinding */);
            lifecycle.endUnbind(flags);
        }
    }
    /** @internal */
    function $unbindElement(flags) {
        if (this.$state & 2 /* isBound */) {
            const lifecycle = this.$lifecycle;
            lifecycle.beginUnbind();
            // add isUnbinding flag
            this.$state |= 64 /* isUnbinding */;
            const hooks = this.$hooks;
            flags |= LifecycleFlags.fromUnbind;
            if (hooks & 512 /* hasUnbound */) {
                lifecycle.enqueueUnbound(this);
            }
            if (hooks & 256 /* hasUnbinding */) {
                this.unbinding(flags);
            }
            let current = this.$bindableTail;
            while (current !== null) {
                current.$unbind(flags);
                current = current.$prevBind;
            }
            this.$scope.parentScope = null;
            // remove isBound and isUnbinding flags
            this.$state &= ~(2 /* isBound */ | 64 /* isUnbinding */);
            lifecycle.endUnbind(flags);
        }
    }
    /** @internal */
    function $unbindView(flags) {
        if (this.$state & 2 /* isBound */) {
            // add isUnbinding flag
            this.$state |= 64 /* isUnbinding */;
            flags |= LifecycleFlags.fromUnbind;
            let current = this.$bindableTail;
            while (current !== null) {
                current.$unbind(flags);
                current = current.$prevBind;
            }
            // remove isBound and isUnbinding flags
            this.$state &= ~(2 /* isBound */ | 64 /* isUnbinding */);
            this.$scope = null;
        }
    }

    /** @internal */
    function $hydrateAttribute(renderingEngine) {
        const Type = this.constructor;
        renderingEngine.applyRuntimeBehavior(Type, this);
        if (this.$hooks & 2 /* hasCreated */) {
            this.created();
        }
    }
    /** @internal */
    function $hydrateElement(dom, projectorLocator, renderingEngine, host, parentContext, options = PLATFORM.emptyObject) {
        const Type = this.constructor;
        const description = Type.description;
        this.$scope = Scope.create(this, null);
        this.$host = host;
        this.$projector = projectorLocator.getElementProjector(dom, this, host, description);
        renderingEngine.applyRuntimeBehavior(Type, this);
        if (this.$hooks & 1024 /* hasRender */) {
            const result = this.render(host, options.parts, parentContext);
            if (result && 'getElementTemplate' in result) {
                const template = result.getElementTemplate(renderingEngine, Type, parentContext);
                template.render(this, host, options.parts);
            }
        }
        else {
            const template = renderingEngine.getElementTemplate(dom, description, parentContext, Type);
            template.render(this, host, options.parts);
        }
        if (this.$hooks & 2 /* hasCreated */) {
            this.created();
        }
    }

    /** @internal */
    function registerAttribute(container) {
        const description = this.description;
        const resourceKey = this.kind.keyFrom(description.name);
        const aliases = description.aliases;
        container.register(Registration.transient(resourceKey, this));
        for (let i = 0, ii = aliases.length; i < ii; ++i) {
            const aliasKey = this.kind.keyFrom(aliases[i]);
            container.register(Registration.alias(resourceKey, aliasKey));
        }
    }
    function customAttribute(nameOrDefinition) {
        return target => CustomAttributeResource.define(nameOrDefinition, target);
    }
    function templateController(nameOrDefinition) {
        return target => CustomAttributeResource.define(typeof nameOrDefinition === 'string'
            ? { isTemplateController: true, name: nameOrDefinition }
            : Object.assign({ isTemplateController: true }, nameOrDefinition), target);
    }
    function dynamicOptionsDecorator(target) {
        target.hasDynamicOptions = true;
        return target;
    }
    function dynamicOptions(target) {
        return target === undefined ? dynamicOptionsDecorator : dynamicOptionsDecorator(target);
    }
    function isType$2(Type) {
        return Type.kind === this;
    }
    function define$2(nameOrDefinition, ctor) {
        const Type = ctor;
        const description = createCustomAttributeDescription(typeof nameOrDefinition === 'string' ? { name: nameOrDefinition } : nameOrDefinition, Type);
        const proto = Type.prototype;
        Type.kind = CustomAttributeResource;
        Type.description = description;
        Type.register = registerAttribute;
        proto.$hydrate = $hydrateAttribute;
        proto.$bind = $bindAttribute;
        proto.$attach = $attachAttribute;
        proto.$detach = $detachAttribute;
        proto.$unbind = $unbindAttribute;
        proto.$cache = $cacheAttribute;
        proto.$prevBind = null;
        proto.$nextBind = null;
        proto.$prevAttach = null;
        proto.$nextAttach = null;
        proto.$nextUnbindAfterDetach = null;
        proto.$scope = null;
        proto.$hooks = 0;
        proto.$state = 0;
        if ('flush' in proto) {
            proto.$nextFlush = null;
        }
        if ('binding' in proto)
            proto.$hooks |= 4 /* hasBinding */;
        if ('bound' in proto) {
            proto.$hooks |= 8 /* hasBound */;
            proto.$nextBound = null;
        }
        if ('unbinding' in proto)
            proto.$hooks |= 256 /* hasUnbinding */;
        if ('unbound' in proto) {
            proto.$hooks |= 512 /* hasUnbound */;
            proto.$nextUnbound = null;
        }
        if ('created' in proto)
            proto.$hooks |= 2 /* hasCreated */;
        if ('attaching' in proto)
            proto.$hooks |= 16 /* hasAttaching */;
        if ('attached' in proto) {
            proto.$hooks |= 32 /* hasAttached */;
            proto.$nextAttached = null;
        }
        if ('detaching' in proto)
            proto.$hooks |= 64 /* hasDetaching */;
        if ('caching' in proto)
            proto.$hooks |= 2048 /* hasCaching */;
        if ('detached' in proto) {
            proto.$hooks |= 128 /* hasDetached */;
            proto.$nextDetached = null;
        }
        return Type;
    }
    const CustomAttributeResource = {
        name: customAttributeName,
        keyFrom: customAttributeKey,
        isType: isType$2,
        define: define$2
    };
    /** @internal */
    function createCustomAttributeDescription(def, Type) {
        const aliases = def.aliases;
        const defaultBindingMode = def.defaultBindingMode;
        return {
            name: def.name,
            aliases: aliases === undefined || aliases === null ? PLATFORM.emptyArray : aliases,
            defaultBindingMode: defaultBindingMode === undefined || defaultBindingMode === null ? BindingMode.toView : defaultBindingMode,
            hasDynamicOptions: def.hasDynamicOptions === undefined ? false : def.hasDynamicOptions,
            isTemplateController: def.isTemplateController === undefined ? false : def.isTemplateController,
            bindables: Object.assign({}, Type.bindables, def.bindables)
        };
    }

    const INode = DI.createInterface('INode').noDefault();
    const IRenderLocation = DI.createInterface('IRenderLocation').noDefault();
    const IDOM = DI.createInterface('IDOM').noDefault();
    // This is an implementation of INodeSequence that represents "no DOM" to render.
    // It's used in various places to avoid null and to encode
    // the explicit idea of "no view".
    const emptySequence = {
        childNodes: PLATFORM.emptyArray,
        firstChild: null,
        lastChild: null,
        findTargets() { return PLATFORM.emptyArray; },
        insertBefore(refNode) { },
        appendTo(parent) { },
        remove() { }
    };
    const NodeSequence = {
        empty: emptySequence
    };

    function bindable(configOrTarget, prop) {
        let config;
        const decorator = function decorate($target, $prop) {
            const Type = $target.constructor;
            let bindables = Type.bindables;
            if (bindables === undefined) {
                bindables = Type.bindables = {};
            }
            if (!config.attribute) {
                config.attribute = PLATFORM.kebabCase($prop);
            }
            if (!config.callback) {
                config.callback = `${$prop}Changed`;
            }
            if (config.mode === undefined) {
                config.mode = BindingMode.toView;
            }
            if (arguments.length > 1) {
                // Non invocation:
                // - @bindable
                // Invocation with or w/o opts:
                // - @bindable()
                // - @bindable({...opts})
                config.property = $prop;
            }
            bindables[config.property] = config;
        };
        if (arguments.length > 1) {
            // Non invocation:
            // - @bindable
            config = {};
            decorator(configOrTarget, prop);
            return;
        }
        else if (typeof configOrTarget === 'string') {
            // ClassDecorator
            // - @bindable('bar')
            // Direct call:
            // - @bindable('bar')(Foo)
            config = {};
            return decorator;
        }
        // Invocation with or w/o opts:
        // - @bindable()
        // - @bindable({...opts})
        config = (configOrTarget || {});
        return decorator;
    }

    class If {
        constructor(ifFactory, location, coordinator) {
            this.value = false;
            this.coordinator = coordinator;
            this.elseFactory = null;
            this.elseView = null;
            this.ifFactory = ifFactory;
            this.ifView = null;
            this.location = location;
        }
        binding(flags) {
            const view = this.updateView(flags);
            this.coordinator.compose(view, flags);
            this.coordinator.binding(flags, this.$scope);
        }
        attaching(flags) {
            this.coordinator.attaching(flags);
        }
        detaching(flags) {
            this.coordinator.detaching(flags);
        }
        unbinding(flags) {
            this.coordinator.unbinding(flags);
        }
        caching(flags) {
            if (this.ifView !== null && this.ifView.release(flags)) {
                this.ifView = null;
            }
            if (this.elseView !== null && this.elseView.release(flags)) {
                this.elseView = null;
            }
            this.coordinator.caching(flags);
        }
        valueChanged(newValue, oldValue, flags) {
            if (flags & LifecycleFlags.fromFlush) {
                const view = this.updateView(flags);
                this.coordinator.compose(view, flags);
            }
            else {
                this.$lifecycle.enqueueFlush(this).catch(error => { throw error; });
            }
        }
        flush(flags) {
            const view = this.updateView(flags);
            this.coordinator.compose(view, flags);
        }
        /** @internal */
        updateView(flags) {
            let view;
            if (this.value) {
                view = this.ifView = this.ensureView(this.ifView, this.ifFactory, flags);
            }
            else if (this.elseFactory !== null) {
                view = this.elseView = this.ensureView(this.elseView, this.elseFactory, flags);
            }
            else {
                view = null;
            }
            return view;
        }
        /** @internal */
        ensureView(view, factory, flags) {
            if (view === null) {
                view = factory.create();
            }
            view.hold(this.location);
            return view;
        }
    }
    If.inject = [IViewFactory, IRenderLocation, CompositionCoordinator];
    __decorate([
        bindable
    ], If.prototype, "value", void 0);
    CustomAttributeResource.define({ name: 'if', isTemplateController: true }, If);
    class Else {
        constructor(factory) {
            this.factory = factory;
        }
        link(ifBehavior) {
            ifBehavior.elseFactory = this.factory;
        }
    }
    Else.inject = [IViewFactory];
    CustomAttributeResource.define({ name: 'else', isTemplateController: true }, Else);

    class Repeat {
        constructor(location, renderable, factory) {
            this.factory = factory;
            this.hasPendingInstanceMutation = false;
            this.location = location;
            this.observer = null;
            this.renderable = renderable;
            this.views = [];
        }
        binding(flags) {
            this.checkCollectionObserver();
        }
        bound(flags) {
            let current = this.renderable.$bindableHead;
            while (current !== null) {
                if (current.target === this && current.targetProperty === 'items') {
                    this.forOf = current.sourceExpression;
                    break;
                }
                current = current.$nextBind;
            }
            this.local = this.forOf.declaration.evaluate(flags, this.$scope, null);
            this.processViews(null, flags);
        }
        attaching(flags) {
            const { views, location } = this;
            for (let i = 0, ii = views.length; i < ii; ++i) {
                const view = views[i];
                view.hold(location);
                view.$attach(flags);
            }
        }
        detaching(flags) {
            const { views } = this;
            for (let i = 0, ii = views.length; i < ii; ++i) {
                const view = views[i];
                view.$detach(flags);
                view.release(flags);
            }
        }
        unbound(flags) {
            this.checkCollectionObserver();
            const { views } = this;
            for (let i = 0, ii = views.length; i < ii; ++i) {
                const view = views[i];
                view.$unbind(flags);
            }
        }
        // called by SetterObserver (sync)
        itemsChanged(newValue, oldValue, flags) {
            this.checkCollectionObserver();
            this.processViews(null, flags | LifecycleFlags.updateTargetInstance);
        }
        // called by a CollectionObserver (async)
        handleBatchedChange(indexMap) {
            this.processViews(indexMap, LifecycleFlags.fromFlush | LifecycleFlags.updateTargetInstance);
        }
        // if the indexMap === null, it is an instance mutation, otherwise it's an items mutation
        // TODO: Reduce complexity (currently at 46)
        processViews(indexMap, flags) {
            const { views, $lifecycle } = this;
            if (this.$state & 2 /* isBound */) {
                const { local, $scope, factory, forOf, items } = this;
                const oldLength = views.length;
                const newLength = forOf.count(items);
                if (oldLength < newLength) {
                    views.length = newLength;
                    for (let i = oldLength; i < newLength; ++i) {
                        views[i] = factory.create();
                    }
                }
                else if (newLength < oldLength) {
                    $lifecycle.beginDetach();
                    for (let i = newLength, view = views[i]; i < oldLength; view = views[++i]) {
                        view.release(flags);
                        view.$detach(flags);
                    }
                    $lifecycle.endDetach(flags);
                    $lifecycle.beginUnbind();
                    for (let i = newLength, view = views[i]; i < oldLength; view = views[++i]) {
                        view.$unbind(flags);
                    }
                    $lifecycle.endUnbind(flags);
                    views.length = newLength;
                    if (newLength === 0) {
                        return;
                    }
                }
                else if (newLength === 0) {
                    return;
                }
                $lifecycle.beginBind();
                if (indexMap === null) {
                    forOf.iterate(items, (arr, i, item) => {
                        const view = views[i];
                        if (!!view.$scope && view.$scope.bindingContext[local] === item) {
                            view.$bind(flags, Scope.fromParent($scope, view.$scope.bindingContext));
                        }
                        else {
                            view.$bind(flags, Scope.fromParent($scope, BindingContext.create(local, item)));
                        }
                    });
                }
                else {
                    forOf.iterate(items, (arr, i, item) => {
                        const view = views[i];
                        if (!!view.$scope && (indexMap[i] === i || view.$scope.bindingContext[local] === item)) {
                            view.$bind(flags, Scope.fromParent($scope, view.$scope.bindingContext));
                        }
                        else {
                            view.$bind(flags, Scope.fromParent($scope, BindingContext.create(local, item)));
                        }
                    });
                }
                $lifecycle.endBind(flags);
            }
            if (this.$state & 8 /* isAttached */) {
                const { location } = this;
                $lifecycle.beginAttach();
                if (indexMap === null) {
                    for (let i = 0, ii = views.length; i < ii; ++i) {
                        const view = views[i];
                        view.hold(location);
                        view.$attach(flags);
                    }
                }
                else {
                    for (let i = 0, ii = views.length; i < ii; ++i) {
                        if (indexMap[i] !== i) {
                            const view = views[i];
                            view.hold(location);
                            view.$attach(flags);
                        }
                    }
                }
                $lifecycle.endAttach(flags);
            }
        }
        checkCollectionObserver() {
            const oldObserver = this.observer;
            if (this.$state & (2 /* isBound */ | 1 /* isBinding */)) {
                const newObserver = this.observer = getCollectionObserver(this.$lifecycle, this.items);
                if (oldObserver !== newObserver && oldObserver) {
                    oldObserver.unsubscribeBatched(this);
                }
                if (newObserver) {
                    newObserver.subscribeBatched(this);
                }
            }
            else if (oldObserver) {
                oldObserver.unsubscribeBatched(this);
            }
        }
    }
    Repeat.inject = [IRenderLocation, IRenderable, IViewFactory];
    __decorate([
        bindable
    ], Repeat.prototype, "items", void 0);
    CustomAttributeResource.define({ name: 'repeat', isTemplateController: true }, Repeat);

    class Replaceable {
        constructor(factory, location) {
            this.factory = factory;
            this.currentView = this.factory.create();
            this.currentView.hold(location);
        }
        binding(flags) {
            this.currentView.$bind(flags | LifecycleFlags.allowParentScopeTraversal, this.$scope);
        }
        attaching(flags) {
            this.currentView.$attach(flags);
        }
        detaching(flags) {
            this.currentView.$detach(flags);
        }
        unbinding(flags) {
            this.currentView.$unbind(flags);
        }
    }
    Replaceable.inject = [IViewFactory, IRenderLocation];
    CustomAttributeResource.define({ name: 'replaceable', isTemplateController: true }, Replaceable);

    class With {
        constructor(factory, location) {
            this.value = null;
            this.factory = factory;
            this.currentView = this.factory.create();
            this.currentView.hold(location);
        }
        valueChanged() {
            if (this.$state & 2 /* isBound */) {
                this.bindChild(LifecycleFlags.fromBindableHandler);
            }
        }
        binding(flags) {
            this.bindChild(flags);
        }
        attaching(flags) {
            this.currentView.$attach(flags);
        }
        detaching(flags) {
            this.currentView.$detach(flags);
        }
        unbinding(flags) {
            this.currentView.$unbind(flags);
        }
        bindChild(flags) {
            const scope = Scope.fromParent(this.$scope, this.value);
            this.currentView.$bind(flags, scope);
        }
    }
    With.inject = [IViewFactory, IRenderLocation];
    __decorate([
        bindable
    ], With.prototype, "value", void 0);
    CustomAttributeResource.define({ name: 'with', isTemplateController: true }, With);

    const IProjectorLocator = DI.createInterface('IProjectorLocator').noDefault();
    /** @internal */
    function registerElement(container) {
        const resourceKey = this.kind.keyFrom(this.description.name);
        container.register(Registration.transient(resourceKey, this));
    }
    function customElement(nameOrDefinition) {
        return (target => CustomElementResource.define(nameOrDefinition, target));
    }
    function isType$3(Type) {
        return Type.kind === this;
    }
    function define$3(nameOrDefinition, ctor = null) {
        if (!nameOrDefinition) {
            throw Reporter.error(70);
        }
        const Type = (ctor === null ? class HTMLOnlyElement {
        } : ctor);
        const description = buildTemplateDefinition(Type, nameOrDefinition);
        const proto = Type.prototype;
        Type.kind = CustomElementResource;
        Type.description = description;
        Type.register = registerElement;
        proto.$hydrate = $hydrateElement;
        proto.$bind = $bindElement;
        proto.$attach = $attachElement;
        proto.$detach = $detachElement;
        proto.$unbind = $unbindElement;
        proto.$cache = $cacheElement;
        proto.$prevBind = null;
        proto.$nextBind = null;
        proto.$prevAttach = null;
        proto.$nextAttach = null;
        proto.$nextUnbindAfterDetach = null;
        proto.$scope = null;
        proto.$hooks = 0;
        proto.$bindableHead = null;
        proto.$bindableTail = null;
        proto.$attachableHead = null;
        proto.$attachableTail = null;
        proto.$mount = $mountElement;
        proto.$unmount = $unmountElement;
        proto.$nextMount = null;
        proto.$nextUnmount = null;
        proto.$projector = null;
        if ('flush' in proto) {
            proto.$nextFlush = null;
        }
        if ('binding' in proto)
            proto.$hooks |= 4 /* hasBinding */;
        if ('bound' in proto) {
            proto.$hooks |= 8 /* hasBound */;
            proto.$nextBound = null;
        }
        if ('unbinding' in proto)
            proto.$hooks |= 256 /* hasUnbinding */;
        if ('unbound' in proto) {
            proto.$hooks |= 512 /* hasUnbound */;
            proto.$nextUnbound = null;
        }
        if ('render' in proto)
            proto.$hooks |= 1024 /* hasRender */;
        if ('created' in proto)
            proto.$hooks |= 2 /* hasCreated */;
        if ('attaching' in proto)
            proto.$hooks |= 16 /* hasAttaching */;
        if ('attached' in proto) {
            proto.$hooks |= 32 /* hasAttached */;
            proto.$nextAttached = null;
        }
        if ('detaching' in proto)
            proto.$hooks |= 64 /* hasDetaching */;
        if ('caching' in proto)
            proto.$hooks |= 2048 /* hasCaching */;
        if ('detached' in proto) {
            proto.$hooks |= 128 /* hasDetached */;
            proto.$nextDetached = null;
        }
        return Type;
    }
    const CustomElementResource = {
        name: customElementName,
        keyFrom: customElementKey,
        isType: isType$3,
        behaviorFor: customElementBehavior,
        define: define$3
    };
    const defaultShadowOptions = {
        mode: 'open'
    };
    function useShadowDOM(targetOrOptions) {
        const options = typeof targetOrOptions === 'function' || !targetOrOptions
            ? defaultShadowOptions
            : targetOrOptions;
        function useShadowDOMDecorator(target) {
            target.shadowOptions = options;
            return target;
        }
        return typeof targetOrOptions === 'function' ? useShadowDOMDecorator(targetOrOptions) : useShadowDOMDecorator;
    }
    function containerlessDecorator(target) {
        target.containerless = true;
        return target;
    }
    function containerless(target) {
        return target === undefined ? containerlessDecorator : containerlessDecorator(target);
    }

    const SCRIPT_REGEX = /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi;
    const ISanitizer = DI.createInterface('ISanitizer').withDefault(x => x.singleton(class {
        sanitize(input) {
            return input.replace(SCRIPT_REGEX, '');
        }
    }));
    /**
     * Simple html sanitization converter to preserve whitelisted elements and attributes on a bound property containing html.
     */
    class SanitizeValueConverter {
        constructor(sanitizer) {
            this.sanitizer = sanitizer;
        }
        /**
         * Process the provided markup that flows to the view.
         * @param untrustedMarkup The untrusted markup to be sanitized.
         */
        toView(untrustedMarkup) {
            if (untrustedMarkup === null || untrustedMarkup === undefined) {
                return null;
            }
            return this.sanitizer.sanitize(untrustedMarkup);
        }
    }
    SanitizeValueConverter.inject = [ISanitizer];
    ValueConverterResource.define('sanitize', SanitizeValueConverter);

    /** @internal */
    class View {
        constructor($lifecycle, cache) {
            this.$bindableHead = null;
            this.$bindableTail = null;
            this.$nextBind = null;
            this.$prevBind = null;
            this.$attachableHead = null;
            this.$attachableTail = null;
            this.$nextAttach = null;
            this.$prevAttach = null;
            this.$nextMount = null;
            this.$nextUnmount = null;
            this.$nextUnbindAfterDetach = null;
            this.$state = 0 /* none */;
            this.$scope = null;
            this.isFree = false;
            this.$lifecycle = $lifecycle;
            this.cache = cache;
        }
        /**
         * Reserves this `View` for mounting at a particular `IRenderLocation`.
         * Also marks this `View` such that it cannot be returned to the cache until
         * it is released again.
         *
         * @param location The RenderLocation before which the view will be appended to the DOM.
         */
        hold(location) {
            this.isFree = false;
            this.location = location;
        }
        /**
         * Marks this `View` such that it can be returned to the cache when it is unmounted.
         *
         * If this `View` is not currently attached, it will be unmounted immediately.
         *
         * @param flags The `LifecycleFlags` to pass to the unmount operation (only effective
         * if the view is already in detached state).
         *
         * @returns Whether this `View` can/will be returned to cache
         */
        release(flags) {
            this.isFree = true;
            if (this.$state & 8 /* isAttached */) {
                return this.cache.canReturnToCache(this);
            }
            return !!this.$unmount(flags);
        }
        lockScope(scope) {
            this.$scope = scope;
            this.$bind = lockedBind;
            this.$unbind = lockedUnbind;
        }
    }
    /** @internal */
    class ViewFactory {
        constructor(name, template, lifecycle) {
            this.isCaching = false;
            this.cacheSize = -1;
            this.cache = null;
            this.lifecycle = lifecycle;
            this.name = name;
            this.template = template;
        }
        setCacheSize(size, doNotOverrideIfAlreadySet) {
            if (size) {
                if (size === '*') {
                    size = ViewFactory.maxCacheSize;
                }
                else if (typeof size === 'string') {
                    size = parseInt(size, 10);
                }
                if (this.cacheSize === -1 || !doNotOverrideIfAlreadySet) {
                    this.cacheSize = size;
                }
            }
            if (this.cacheSize > 0) {
                this.cache = [];
            }
            else {
                this.cache = null;
            }
            this.isCaching = this.cacheSize > 0;
        }
        canReturnToCache(view) {
            return this.cache !== null && this.cache.length < this.cacheSize;
        }
        tryReturnToCache(view) {
            if (this.canReturnToCache(view)) {
                view.$cache(LifecycleFlags.none);
                this.cache.push(view);
                return true;
            }
            return false;
        }
        create() {
            const cache = this.cache;
            let view;
            if (cache !== null && cache.length > 0) {
                view = cache.pop();
                view.$state &= ~128 /* isCached */;
                return view;
            }
            view = new View(this.lifecycle, this);
            this.template.render(view);
            if (!view.$nodes) {
                throw Reporter.error(90);
            }
            return view;
        }
    }
    ViewFactory.maxCacheSize = 0xFFFF;
    function lockedBind(flags) {
        if (this.$state & 2 /* isBound */) {
            return;
        }
        flags |= LifecycleFlags.fromBind;
        const lockedScope = this.$scope;
        let current = this.$bindableHead;
        while (current !== null) {
            current.$bind(flags, lockedScope);
            current = current.$nextBind;
        }
        this.$state |= 2 /* isBound */;
    }
    function lockedUnbind(flags) {
        if (this.$state & 2 /* isBound */) {
            // add isUnbinding flag
            this.$state |= 64 /* isUnbinding */;
            flags |= LifecycleFlags.fromUnbind;
            let current = this.$bindableTail;
            while (current !== null) {
                current.$unbind(flags);
                current = current.$prevBind;
            }
            // remove isBound and isUnbinding flags
            this.$state &= ~(2 /* isBound */ | 64 /* isUnbinding */);
        }
    }
    ((proto) => {
        proto.$bind = $bindView;
        proto.$unbind = $unbindView;
        proto.$attach = $attachView;
        proto.$detach = $detachView;
        proto.$cache = $cacheView;
        proto.$mount = $mountView;
        proto.$unmount = $unmountView;
    })(View.prototype);

    const ITemplateCompiler = DI.createInterface('ITemplateCompiler').noDefault();
    var ViewCompileFlags;
    (function (ViewCompileFlags) {
        ViewCompileFlags[ViewCompileFlags["none"] = 1] = "none";
        ViewCompileFlags[ViewCompileFlags["surrogate"] = 2] = "surrogate";
        ViewCompileFlags[ViewCompileFlags["shadowDOM"] = 4] = "shadowDOM";
    })(ViewCompileFlags || (ViewCompileFlags = {}));
    const ITemplateFactory = DI.createInterface('ITemplateFactory').noDefault();
    // This is the main implementation of ITemplate.
    // It is used to create instances of IView based on a compiled TemplateDefinition.
    // TemplateDefinitions are hand-coded today, but will ultimately be the output of the
    // TemplateCompiler either through a JIT or AOT process.
    // Essentially, CompiledTemplate wraps up the small bit of code that is needed to take a TemplateDefinition
    // and create instances of it on demand.
    class CompiledTemplate {
        constructor(dom, definition, factory, renderContext) {
            this.dom = dom;
            this.definition = definition;
            this.factory = factory;
            this.renderContext = renderContext;
        }
        render(renderable, host, parts) {
            const nodes = renderable.$nodes = this.factory.createNodeSequence();
            renderable.$context = this.renderContext;
            this.renderContext.render(renderable, nodes.findTargets(), this.definition, host, parts);
        }
    }
    // This is an implementation of ITemplate that always returns a node sequence representing "no DOM" to render.
    /** @internal */
    const noViewTemplate = {
        renderContext: null,
        dom: null,
        render(renderable) {
            renderable.$nodes = NodeSequence.empty;
            renderable.$context = null;
        }
    };
    const defaultCompilerName = 'default';
    const IInstructionRenderer = DI.createInterface('IInstructionRenderer').noDefault();
    const IRenderer = DI.createInterface('IRenderer').noDefault();
    const IRenderingEngine = DI.createInterface('IRenderingEngine').withDefault(x => x.singleton(RenderingEngine));
    /** @internal */
    class RenderingEngine {
        constructor(container, templateFactory, lifecycle, templateCompilers) {
            this.behaviorLookup = new Map();
            this.container = container;
            this.templateFactory = templateFactory;
            this.viewFactoryLookup = new Map();
            this.lifecycle = lifecycle;
            this.templateLookup = new Map();
            this.compilers = templateCompilers.reduce((acc, item) => {
                acc[item.name] = item;
                return acc;
            }, Object.create(null));
        }
        getElementTemplate(dom, definition, parentContext, componentType) {
            if (!definition) {
                return null;
            }
            let found = this.templateLookup.get(definition);
            if (!found) {
                found = this.templateFromSource(dom, definition, parentContext, componentType);
                this.templateLookup.set(definition, found);
            }
            return found;
        }
        getViewFactory(dom, definition, parentContext) {
            if (!definition) {
                return null;
            }
            let factory = this.viewFactoryLookup.get(definition);
            if (!factory) {
                const validSource = buildTemplateDefinition(null, definition);
                const template = this.templateFromSource(dom, validSource, parentContext, null);
                factory = new ViewFactory(validSource.name, template, this.lifecycle);
                factory.setCacheSize(validSource.cache, true);
                this.viewFactoryLookup.set(definition, factory);
            }
            return factory;
        }
        applyRuntimeBehavior(Type, instance) {
            let found = this.behaviorLookup.get(Type);
            if (!found) {
                found = RuntimeBehavior.create(Type);
                this.behaviorLookup.set(Type, found);
            }
            found.applyTo(instance, this.lifecycle);
        }
        templateFromSource(dom, definition, parentContext, componentType) {
            if (parentContext === null) {
                parentContext = this.container;
            }
            if (definition.template !== null) {
                const renderContext = createRenderContext(dom, parentContext, definition.dependencies, componentType);
                if (definition.build.required) {
                    const compilerName = definition.build.compiler || defaultCompilerName;
                    const compiler = this.compilers[compilerName];
                    if (compiler === undefined) {
                        throw Reporter.error(20, compilerName);
                    }
                    definition = compiler.compile(dom, definition, new RuntimeCompilationResources(renderContext), ViewCompileFlags.surrogate);
                }
                return this.templateFactory.create(renderContext, definition);
            }
            return noViewTemplate;
        }
    }
    RenderingEngine.inject = [IContainer, ITemplateFactory, ILifecycle, all(ITemplateCompiler)];
    function createRenderContext(dom, parentRenderContext, dependencies, componentType) {
        const context = parentRenderContext.createChild();
        const renderableProvider = new InstanceProvider();
        const elementProvider = new InstanceProvider();
        const instructionProvider = new InstanceProvider();
        const factoryProvider = new ViewFactoryProvider();
        const renderLocationProvider = new InstanceProvider();
        const renderer = context.get(IRenderer);
        dom.registerElementResolver(context, elementProvider);
        context.registerResolver(IViewFactory, factoryProvider);
        context.registerResolver(IRenderable, renderableProvider);
        context.registerResolver(ITargetedInstruction, instructionProvider);
        context.registerResolver(IRenderLocation, renderLocationProvider);
        if (dependencies) {
            context.register(...dependencies);
        }
        //If the element has a view, support Recursive Components by adding self to own view template container.
        if (componentType) {
            componentType.register(context);
        }
        context.render = function (renderable, targets, templateDefinition, host, parts) {
            renderer.render(dom, this, renderable, targets, templateDefinition, host, parts);
        };
        context.beginComponentOperation = function (renderable, target, instruction, factory, parts, location) {
            renderableProvider.prepare(renderable);
            elementProvider.prepare(target);
            instructionProvider.prepare(instruction);
            if (factory) {
                factoryProvider.prepare(factory, parts);
            }
            if (location) {
                renderLocationProvider.prepare(location);
            }
            return context;
        };
        context.dispose = function () {
            factoryProvider.dispose();
            renderableProvider.dispose();
            instructionProvider.dispose();
            elementProvider.dispose();
            renderLocationProvider.dispose();
        };
        return context;
    }
    /** @internal */
    class InstanceProvider {
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
    class ViewFactoryProvider {
        prepare(factory, parts) {
            this.factory = factory;
            this.replacements = parts || PLATFORM.emptyObject;
        }
        resolve(handler, requestor) {
            const factory = this.factory;
            if (factory === undefined || factory === null) { // unmet precondition: call prepare
                throw Reporter.error(50); // TODO: organize error codes
            }
            if (!factory.name || !factory.name.length) { // unmet invariant: factory must have a name
                throw Reporter.error(51); // TODO: organize error codes
            }
            const found = this.replacements[factory.name];
            if (found) {
                const renderingEngine = handler.get(IRenderingEngine);
                const dom = handler.get(IDOM);
                return renderingEngine.getViewFactory(dom, found, requestor);
            }
            return factory;
        }
        dispose() {
            this.factory = null;
            this.replacements = PLATFORM.emptyObject;
        }
    }
    /** @internal */
    let ChildrenObserver = class ChildrenObserver {
        constructor(lifecycle, customElement) {
            this.hasChanges = false;
            this.children = null;
            this.customElement = customElement;
            this.lifecycle = lifecycle;
            this.observing = false;
        }
        getValue() {
            if (!this.observing) {
                this.observing = true;
                this.customElement.$projector.subscribeToChildrenChange(() => { this.onChildrenChanged(); });
                this.children = findElements(this.customElement.$projector.children);
            }
            return this.children;
        }
        setValue(newValue) { }
        flush(flags) {
            this.callSubscribers(this.children, undefined, flags | LifecycleFlags.updateTargetInstance);
            this.hasChanges = false;
        }
        subscribe(subscriber) {
            this.addSubscriber(subscriber);
        }
        unsubscribe(subscriber) {
            this.removeSubscriber(subscriber);
        }
        onChildrenChanged() {
            this.children = findElements(this.customElement.$projector.children);
            if ('$childrenChanged' in this.customElement) {
                this.customElement.$childrenChanged();
            }
            this.lifecycle.enqueueFlush(this).catch(error => { throw error; });
            this.hasChanges = true;
        }
    };
    ChildrenObserver = __decorate([
        subscriberCollection(MutationKind.instance)
    ], ChildrenObserver);
    /** @internal */
    function findElements(nodes) {
        const components = [];
        for (let i = 0, ii = nodes.length; i < ii; ++i) {
            const current = nodes[i];
            const component = customElementBehavior(current);
            if (component !== null) {
                components.push(component);
            }
        }
        return components;
    }
    /** @internal */
    class RuntimeBehavior {
        constructor() { }
        static create(Component) {
            const behavior = new RuntimeBehavior();
            behavior.bindables = Component.description.bindables;
            return behavior;
        }
        applyTo(instance, lifecycle) {
            instance.$lifecycle = lifecycle;
            if ('$projector' in instance) {
                this.applyToElement(lifecycle, instance);
            }
            else {
                this.applyToCore(instance);
            }
        }
        applyToElement(lifecycle, instance) {
            const observers = this.applyToCore(instance);
            observers.$children = new ChildrenObserver(lifecycle, instance);
            Reflect.defineProperty(instance, '$children', {
                enumerable: false,
                get: function () {
                    return this['$observers'].$children.getValue();
                }
            });
        }
        applyToCore(instance) {
            const observers = {};
            const bindables = this.bindables;
            const observableNames = Object.getOwnPropertyNames(bindables);
            for (let i = 0, ii = observableNames.length; i < ii; ++i) {
                const name = observableNames[i];
                observers[name] = new SelfObserver(instance, name, bindables[name].callback);
                createGetterSetter(instance, name);
            }
            Reflect.defineProperty(instance, '$observers', {
                enumerable: false,
                value: observers
            });
            return observers;
        }
    }
    function createGetterSetter(instance, name) {
        Reflect.defineProperty(instance, name, {
            enumerable: true,
            get: function () { return this['$observers'][name].getValue(); },
            set: function (value) { this['$observers'][name].setValue(value, LifecycleFlags.updateTargetInstance); }
        });
    }

    class Aurelia {
        constructor(container = DI.createContainer()) {
            this.container = container;
            this.components = [];
            this.startTasks = [];
            this.stopTasks = [];
            this.isStarted = false;
            this._root = null;
            Registration
                .instance(Aurelia, this)
                .register(container, Aurelia);
        }
        register(...params) {
            this.container.register(...params);
            return this;
        }
        app(config) {
            const host = config.host;
            let component;
            const componentOrType = config.component;
            if (CustomElementResource.isType(componentOrType)) {
                this.container.register(componentOrType);
                component = this.container.get(CustomElementResource.keyFrom(componentOrType.description.name));
            }
            else {
                component = componentOrType;
            }
            const domInitializer = this.container.get(IDOMInitializer);
            const dom = domInitializer.initialize(config);
            const startTask = () => {
                host.$au = this;
                if (!this.components.includes(component)) {
                    this._root = component;
                    this.components.push(component);
                    const re = this.container.get(IRenderingEngine);
                    const pl = this.container.get(IProjectorLocator);
                    component.$hydrate(dom, pl, re, host, this.container);
                }
                component.$bind(LifecycleFlags.fromStartTask | LifecycleFlags.fromBind, null);
                component.$attach(LifecycleFlags.fromStartTask | LifecycleFlags.fromAttach);
            };
            this.startTasks.push(startTask);
            this.stopTasks.push(() => {
                component.$detach(LifecycleFlags.fromStopTask | LifecycleFlags.fromDetach);
                component.$unbind(LifecycleFlags.fromStopTask | LifecycleFlags.fromUnbind);
                host.$au = null;
            });
            if (this.isStarted) {
                startTask();
            }
            return this;
        }
        root() {
            return this._root;
        }
        start() {
            for (const runStartTask of this.startTasks) {
                runStartTask();
            }
            this.isStarted = true;
            return this;
        }
        stop() {
            this.isStarted = false;
            for (const runStopTask of this.stopTasks) {
                runStopTask();
            }
            return this;
        }
    }
    PLATFORM.global.Aurelia = Aurelia;
    const IDOMInitializer = DI.createInterface('IDOMInitializer').noDefault();

    function instructionRenderer(instructionType) {
        return function decorator(target) {
            // wrap the constructor to set the instructionType to the instance (for better performance than when set on the prototype)
            const decoratedTarget = function (...args) {
                const instance = new target(...args);
                instance.instructionType = instructionType;
                return instance;
            };
            // make sure we register the decorated constructor with DI
            decoratedTarget.register = function register(container) {
                return Registration.singleton(IInstructionRenderer, decoratedTarget).register(container, IInstructionRenderer);
            };
            // copy over any static properties such as inject (set by preceding decorators)
            // also copy the name, to be less confusing to users (so they can still use constructor.name for whatever reason)
            // the length (number of ctor arguments) is copied for the same reason
            const ownProperties = Object.getOwnPropertyDescriptors(target);
            Object.keys(ownProperties).filter(prop => prop !== 'prototype').forEach(prop => {
                Reflect.defineProperty(decoratedTarget, prop, ownProperties[prop]);
            });
            return decoratedTarget;
        };
    }
    /* @internal */
    class Renderer {
        constructor(instructionRenderers) {
            const record = this.instructionRenderers = {};
            instructionRenderers.forEach(item => {
                record[item.instructionType] = item;
            });
        }
        render(dom, context, renderable, targets, definition, host, parts) {
            const targetInstructions = definition.instructions;
            const instructionRenderers = this.instructionRenderers;
            if (targets.length !== targetInstructions.length) {
                if (targets.length > targetInstructions.length) {
                    throw Reporter.error(30);
                }
                else {
                    throw Reporter.error(31);
                }
            }
            for (let i = 0, ii = targets.length; i < ii; ++i) {
                const instructions = targetInstructions[i];
                const target = targets[i];
                for (let j = 0, jj = instructions.length; j < jj; ++j) {
                    const current = instructions[j];
                    instructionRenderers[current.type].render(dom, context, renderable, target, current, parts);
                }
            }
            if (host) {
                const surrogateInstructions = definition.surrogates;
                for (let i = 0, ii = surrogateInstructions.length; i < ii; ++i) {
                    const current = surrogateInstructions[i];
                    instructionRenderers[current.type].render(dom, context, renderable, host, current, parts);
                }
            }
        }
    }
    Renderer.inject = [all(IInstructionRenderer)];
    function ensureExpression(parser, srcOrExpr, bindingType) {
        if (typeof srcOrExpr === 'string') {
            return parser.parse(srcOrExpr, bindingType);
        }
        return srcOrExpr;
    }
    function addBindable(renderable, bindable) {
        bindable.$prevBind = renderable.$bindableTail;
        bindable.$nextBind = null;
        if (renderable.$bindableTail === null) {
            renderable.$bindableHead = bindable;
        }
        else {
            renderable.$bindableTail.$nextBind = bindable;
        }
        renderable.$bindableTail = bindable;
    }
    function addAttachable(renderable, attachable) {
        attachable.$prevAttach = renderable.$attachableTail;
        attachable.$nextAttach = null;
        if (renderable.$attachableTail === null) {
            renderable.$attachableHead = attachable;
        }
        else {
            renderable.$attachableTail.$nextAttach = attachable;
        }
        renderable.$attachableTail = attachable;
    }
    let SetPropertyRenderer = 
    /** @internal */
    class SetPropertyRenderer {
        render(dom, context, renderable, target, instruction) {
            target[instruction.to] = instruction.value;
        }
    };
    SetPropertyRenderer = __decorate([
        instructionRenderer("re" /* setProperty */)
        /** @internal */
    ], SetPropertyRenderer);
    let CustomElementRenderer = 
    /** @internal */
    class CustomElementRenderer {
        constructor(renderingEngine) {
            this.renderingEngine = renderingEngine;
        }
        render(dom, context, renderable, target, instruction) {
            const operation = context.beginComponentOperation(renderable, target, instruction, null, null, target, true);
            const component = context.get(customElementKey(instruction.res));
            const instructionRenderers = context.get(IRenderer).instructionRenderers;
            const projectorLocator = context.get(IProjectorLocator);
            const childInstructions = instruction.instructions;
            component.$hydrate(dom, projectorLocator, this.renderingEngine, target, context, instruction);
            for (let i = 0, ii = childInstructions.length; i < ii; ++i) {
                const current = childInstructions[i];
                instructionRenderers[current.type].render(dom, context, renderable, component, current);
            }
            addBindable(renderable, component);
            addAttachable(renderable, component);
            operation.dispose();
        }
    };
    CustomElementRenderer.inject = [IRenderingEngine];
    CustomElementRenderer = __decorate([
        instructionRenderer("ra" /* hydrateElement */)
        /** @internal */
    ], CustomElementRenderer);
    let CustomAttributeRenderer = 
    /** @internal */
    class CustomAttributeRenderer {
        constructor(renderingEngine) {
            this.renderingEngine = renderingEngine;
        }
        render(dom, context, renderable, target, instruction) {
            const operation = context.beginComponentOperation(renderable, target, instruction);
            const component = context.get(customAttributeKey(instruction.res));
            const instructionRenderers = context.get(IRenderer).instructionRenderers;
            const childInstructions = instruction.instructions;
            component.$hydrate(this.renderingEngine);
            for (let i = 0, ii = childInstructions.length; i < ii; ++i) {
                const current = childInstructions[i];
                instructionRenderers[current.type].render(dom, context, renderable, component, current);
            }
            addBindable(renderable, component);
            addAttachable(renderable, component);
            operation.dispose();
        }
    };
    CustomAttributeRenderer.inject = [IRenderingEngine];
    CustomAttributeRenderer = __decorate([
        instructionRenderer("rb" /* hydrateAttribute */)
        /** @internal */
    ], CustomAttributeRenderer);
    let TemplateControllerRenderer = 
    /** @internal */
    class TemplateControllerRenderer {
        constructor(renderingEngine) {
            this.renderingEngine = renderingEngine;
        }
        render(dom, context, renderable, target, instruction, parts) {
            const factory = this.renderingEngine.getViewFactory(dom, instruction.def, context);
            const operation = context.beginComponentOperation(renderable, target, instruction, factory, parts, dom.convertToRenderLocation(target), false);
            const component = context.get(customAttributeKey(instruction.res));
            const instructionRenderers = context.get(IRenderer).instructionRenderers;
            const childInstructions = instruction.instructions;
            component.$hydrate(this.renderingEngine);
            if (instruction.link) {
                component.link(renderable.$attachableTail);
            }
            for (let i = 0, ii = childInstructions.length; i < ii; ++i) {
                const current = childInstructions[i];
                instructionRenderers[current.type].render(dom, context, renderable, component, current);
            }
            addBindable(renderable, component);
            addAttachable(renderable, component);
            operation.dispose();
        }
    };
    TemplateControllerRenderer.inject = [IRenderingEngine];
    TemplateControllerRenderer = __decorate([
        instructionRenderer("rc" /* hydrateTemplateController */)
        /** @internal */
    ], TemplateControllerRenderer);
    let LetElementRenderer = 
    /** @internal */
    class LetElementRenderer {
        constructor(parser, observerLocator) {
            this.parser = parser;
            this.observerLocator = observerLocator;
        }
        render(dom, context, renderable, target, instruction) {
            dom.remove(target);
            const childInstructions = instruction.instructions;
            const toViewModel = instruction.toViewModel;
            for (let i = 0, ii = childInstructions.length; i < ii; ++i) {
                const childInstruction = childInstructions[i];
                const expr = ensureExpression(this.parser, childInstruction.from, 48 /* IsPropertyCommand */);
                const bindable = new LetBinding(expr, childInstruction.to, this.observerLocator, context, toViewModel);
                addBindable(renderable, bindable);
            }
        }
    };
    LetElementRenderer.inject = [IExpressionParser, IObserverLocator];
    LetElementRenderer = __decorate([
        instructionRenderer("rd" /* hydrateLetElement */)
        /** @internal */
    ], LetElementRenderer);
    let CallBindingRenderer = 
    /** @internal */
    class CallBindingRenderer {
        constructor(parser, observerLocator) {
            this.parser = parser;
            this.observerLocator = observerLocator;
        }
        render(dom, context, renderable, target, instruction) {
            const expr = ensureExpression(this.parser, instruction.from, 153 /* CallCommand */);
            const bindable = new Call(expr, target, instruction.to, this.observerLocator, context);
            addBindable(renderable, bindable);
        }
    };
    CallBindingRenderer.inject = [IExpressionParser, IObserverLocator];
    CallBindingRenderer = __decorate([
        instructionRenderer("rh" /* callBinding */)
        /** @internal */
    ], CallBindingRenderer);
    let RefBindingRenderer = 
    /** @internal */
    class RefBindingRenderer {
        constructor(parser) {
            this.parser = parser;
        }
        render(dom, context, renderable, target, instruction) {
            const expr = ensureExpression(this.parser, instruction.from, 1280 /* IsRef */);
            const bindable = new Ref(expr, target, context);
            addBindable(renderable, bindable);
        }
    };
    RefBindingRenderer.inject = [IExpressionParser];
    RefBindingRenderer = __decorate([
        instructionRenderer("rj" /* refBinding */)
        /** @internal */
    ], RefBindingRenderer);
    let InterpolationBindingRenderer = 
    /** @internal */
    class InterpolationBindingRenderer {
        constructor(parser, observerLocator) {
            this.parser = parser;
            this.observerLocator = observerLocator;
        }
        render(dom, context, renderable, target, instruction) {
            let bindable;
            const expr = ensureExpression(this.parser, instruction.from, 2048 /* Interpolation */);
            if (expr.isMulti) {
                bindable = new MultiInterpolationBinding(this.observerLocator, expr, target, instruction.to, BindingMode.toView, context);
            }
            else {
                bindable = new InterpolationBinding(expr.firstExpression, expr, target, instruction.to, BindingMode.toView, this.observerLocator, context, true);
            }
            addBindable(renderable, bindable);
        }
    };
    InterpolationBindingRenderer.inject = [IExpressionParser, IObserverLocator];
    InterpolationBindingRenderer = __decorate([
        instructionRenderer("rf" /* interpolation */)
        /** @internal */
    ], InterpolationBindingRenderer);
    let PropertyBindingRenderer = 
    /** @internal */
    class PropertyBindingRenderer {
        constructor(parser, observerLocator) {
            this.parser = parser;
            this.observerLocator = observerLocator;
        }
        render(dom, context, renderable, target, instruction) {
            const expr = ensureExpression(this.parser, instruction.from, 48 /* IsPropertyCommand */ | instruction.mode);
            const bindable = new Binding(expr, target, instruction.to, instruction.mode, this.observerLocator, context);
            addBindable(renderable, bindable);
        }
    };
    PropertyBindingRenderer.inject = [IExpressionParser, IObserverLocator];
    PropertyBindingRenderer = __decorate([
        instructionRenderer("rg" /* propertyBinding */)
        /** @internal */
    ], PropertyBindingRenderer);
    let IteratorBindingRenderer = 
    /** @internal */
    class IteratorBindingRenderer {
        constructor(parser, observerLocator) {
            this.parser = parser;
            this.observerLocator = observerLocator;
        }
        render(dom, context, renderable, target, instruction) {
            const expr = ensureExpression(this.parser, instruction.from, 539 /* ForCommand */);
            const bindable = new Binding(expr, target, instruction.to, BindingMode.toView, this.observerLocator, context);
            addBindable(renderable, bindable);
        }
    };
    IteratorBindingRenderer.inject = [IExpressionParser, IObserverLocator];
    IteratorBindingRenderer = __decorate([
        instructionRenderer("rk" /* iteratorBinding */)
        /** @internal */
    ], IteratorBindingRenderer);
    const BasicRenderer = {
        register(container) {
            container.register(SetPropertyRenderer, CustomElementRenderer, CustomAttributeRenderer, TemplateControllerRenderer, LetElementRenderer, CallBindingRenderer, RefBindingRenderer, InterpolationBindingRenderer, PropertyBindingRenderer, IteratorBindingRenderer);
        }
    };

    const GlobalResources = [
        If,
        Else,
        Repeat,
        Replaceable,
        With,
        SanitizeValueConverter,
        DebounceBindingBehavior,
        OneTimeBindingBehavior,
        ToViewBindingBehavior,
        FromViewBindingBehavior,
        SignalBindingBehavior,
        ThrottleBindingBehavior,
        TwoWayBindingBehavior
    ];
    const RuntimeConfiguration = {
        register(container) {
            container.register(BasicRenderer, Registration.singleton(IObserverLocator, ObserverLocator), Registration.singleton(ILifecycle, Lifecycle), Registration.singleton(IRenderer, Renderer), ...GlobalResources);
        },
        createContainer() {
            const container = DI.createContainer();
            container.register(RuntimeConfiguration);
            return container;
        }
    };

    class InterpolationInstruction {
        constructor(from, to) {
            this.type = "rf" /* interpolation */;
            this.from = from;
            this.to = to;
        }
    }
    class OneTimeBindingInstruction {
        constructor(from, to) {
            this.type = "rg" /* propertyBinding */;
            this.from = from;
            this.mode = BindingMode.oneTime;
            this.oneTime = true;
            this.to = to;
        }
    }
    class ToViewBindingInstruction {
        constructor(from, to) {
            this.type = "rg" /* propertyBinding */;
            this.from = from;
            this.mode = BindingMode.toView;
            this.oneTime = false;
            this.to = to;
        }
    }
    class FromViewBindingInstruction {
        constructor(from, to) {
            this.type = "rg" /* propertyBinding */;
            this.from = from;
            this.mode = BindingMode.fromView;
            this.oneTime = false;
            this.to = to;
        }
    }
    class TwoWayBindingInstruction {
        constructor(from, to) {
            this.type = "rg" /* propertyBinding */;
            this.type = "rg" /* propertyBinding */;
            this.from = from;
            this.mode = BindingMode.twoWay;
            this.oneTime = false;
            this.to = to;
        }
    }
    class IteratorBindingInstruction {
        constructor(from, to) {
            this.type = "rk" /* iteratorBinding */;
            this.from = from;
            this.to = to;
        }
    }
    class CallBindingInstruction {
        constructor(from, to) {
            this.type = "rh" /* callBinding */;
            this.from = from;
            this.to = to;
        }
    }
    class RefBindingInstruction {
        constructor(from) {
            this.type = "rj" /* refBinding */;
            this.from = from;
        }
    }
    class SetPropertyInstruction {
        constructor(value, to) {
            this.type = "re" /* setProperty */;
            this.to = to;
            this.value = value;
        }
    }
    class HydrateElementInstruction {
        constructor(res, instructions, parts) {
            this.type = "ra" /* hydrateElement */;
            this.instructions = instructions;
            this.parts = parts;
            this.res = res;
        }
    }
    class HydrateAttributeInstruction {
        constructor(res, instructions) {
            this.type = "rb" /* hydrateAttribute */;
            this.instructions = instructions;
            this.res = res;
        }
    }
    class HydrateTemplateController {
        constructor(def, res, instructions, link) {
            this.type = "rc" /* hydrateTemplateController */;
            this.def = def;
            this.instructions = instructions;
            this.link = link;
            this.res = res;
        }
    }
    class LetElementInstruction {
        constructor(instructions, toViewModel) {
            this.type = "rd" /* hydrateLetElement */;
            this.instructions = instructions;
            this.toViewModel = toViewModel;
        }
    }
    class LetBindingInstruction {
        constructor(from, to) {
            this.type = "ri" /* letBinding */;
            this.from = from;
            this.to = to;
        }
    }



    var index$1 = /*#__PURE__*/Object.freeze({
        CallFunction: CallFunction,
        get ExpressionKind () { return ExpressionKind; },
        connects: connects,
        observes: observes,
        callsFunction: callsFunction,
        hasAncestor: hasAncestor,
        isAssignable: isAssignable,
        isLeftHandSide: isLeftHandSide,
        isPrimary: isPrimary,
        isResource: isResource,
        hasBind: hasBind,
        hasUnbind: hasUnbind,
        isLiteral: isLiteral,
        arePureLiterals: arePureLiterals,
        isPureLiteral: isPureLiteral,
        BindingBehavior: BindingBehavior,
        ValueConverter: ValueConverter,
        Assign: Assign,
        Conditional: Conditional,
        AccessThis: AccessThis,
        AccessScope: AccessScope,
        AccessMember: AccessMember,
        AccessKeyed: AccessKeyed,
        CallScope: CallScope,
        CallMember: CallMember,
        Binary: Binary,
        Unary: Unary,
        PrimitiveLiteral: PrimitiveLiteral,
        HtmlLiteral: HtmlLiteral,
        ArrayLiteral: ArrayLiteral,
        ObjectLiteral: ObjectLiteral,
        Template: Template,
        TaggedTemplate: TaggedTemplate,
        ArrayBindingPattern: ArrayBindingPattern,
        ObjectBindingPattern: ObjectBindingPattern,
        BindingIdentifier: BindingIdentifier,
        ForOfStatement: ForOfStatement,
        Interpolation: Interpolation,
        get BindingMode () { return BindingMode; },
        get Binding () { return Binding; },
        Call: Call,
        connectable: connectable,
        IExpressionParser: IExpressionParser,
        get BindingType () { return BindingType; },
        MultiInterpolationBinding: MultiInterpolationBinding,
        get InterpolationBinding () { return InterpolationBinding; },
        get LetBinding () { return LetBinding; },
        Ref: Ref,
        get ArrayObserver () { return ArrayObserver; },
        enableArrayObservation: enableArrayObservation,
        disableArrayObservation: disableArrayObservation,
        get MapObserver () { return MapObserver; },
        enableMapObservation: enableMapObservation,
        disableMapObservation: disableMapObservation,
        get SetObserver () { return SetObserver; },
        enableSetObservation: enableSetObservation,
        disableSetObservation: disableSetObservation,
        BindingContext: BindingContext,
        Scope: Scope,
        OverrideContext: OverrideContext,
        collectionObserver: collectionObserver,
        get CollectionLengthObserver () { return CollectionLengthObserver; },
        computed: computed,
        get CustomSetterObserver () { return CustomSetterObserver; },
        get GetterObserver () { return GetterObserver; },
        IDirtyChecker: IDirtyChecker,
        IObserverLocator: IObserverLocator,
        ITargetObserverLocator: ITargetObserverLocator,
        ITargetAccessorLocator: ITargetAccessorLocator,
        getCollectionObserver: getCollectionObserver,
        PrimitiveObserver: PrimitiveObserver,
        PropertyAccessor: PropertyAccessor,
        propertyObserver: propertyObserver,
        get SelfObserver () { return SelfObserver; },
        get SetterObserver () { return SetterObserver; },
        ISignaler: ISignaler,
        subscriberCollection: subscriberCollection,
        batchedSubscriberCollection: batchedSubscriberCollection,
        targetObserver: targetObserver,
        bindingBehavior: bindingBehavior,
        BindingBehaviorResource: BindingBehaviorResource,
        BindingModeBehavior: BindingModeBehavior,
        OneTimeBindingBehavior: OneTimeBindingBehavior,
        ToViewBindingBehavior: ToViewBindingBehavior,
        FromViewBindingBehavior: FromViewBindingBehavior,
        TwoWayBindingBehavior: TwoWayBindingBehavior,
        DebounceBindingBehavior: DebounceBindingBehavior,
        SignalBindingBehavior: SignalBindingBehavior,
        ThrottleBindingBehavior: ThrottleBindingBehavior,
        customAttribute: customAttribute,
        CustomAttributeResource: CustomAttributeResource,
        dynamicOptions: dynamicOptions,
        templateController: templateController,
        If: If,
        Else: Else,
        Repeat: Repeat,
        Replaceable: Replaceable,
        With: With,
        containerless: containerless,
        customElement: customElement,
        CustomElementResource: CustomElementResource,
        IProjectorLocator: IProjectorLocator,
        useShadowDOM: useShadowDOM,
        valueConverter: valueConverter,
        ValueConverterResource: ValueConverterResource,
        ISanitizer: ISanitizer,
        SanitizeValueConverter: SanitizeValueConverter,
        bindable: bindable,
        Aurelia: Aurelia,
        IDOMInitializer: IDOMInitializer,
        RuntimeConfiguration: RuntimeConfiguration,
        buildTemplateDefinition: buildTemplateDefinition,
        isTargetedInstruction: isTargetedInstruction,
        ITargetedInstruction: ITargetedInstruction,
        get TargetedInstructionType () { return TargetedInstructionType; },
        INode: INode,
        IRenderLocation: IRenderLocation,
        IDOM: IDOM,
        NodeSequence: NodeSequence,
        CallBindingInstruction: CallBindingInstruction,
        FromViewBindingInstruction: FromViewBindingInstruction,
        HydrateAttributeInstruction: HydrateAttributeInstruction,
        HydrateElementInstruction: HydrateElementInstruction,
        HydrateTemplateController: HydrateTemplateController,
        InterpolationInstruction: InterpolationInstruction,
        IteratorBindingInstruction: IteratorBindingInstruction,
        LetBindingInstruction: LetBindingInstruction,
        LetElementInstruction: LetElementInstruction,
        OneTimeBindingInstruction: OneTimeBindingInstruction,
        RefBindingInstruction: RefBindingInstruction,
        SetPropertyInstruction: SetPropertyInstruction,
        ToViewBindingInstruction: ToViewBindingInstruction,
        TwoWayBindingInstruction: TwoWayBindingInstruction,
        AggregateLifecycleTask: AggregateLifecycleTask,
        CompositionCoordinator: CompositionCoordinator,
        get Hooks () { return Hooks; },
        ILifecycle: ILifecycle,
        IRenderable: IRenderable,
        IViewFactory: IViewFactory,
        LifecycleTask: LifecycleTask,
        PromiseTask: PromiseTask,
        get State () { return State$1; },
        get CollectionKind () { return CollectionKind; },
        get DelegationStrategy () { return DelegationStrategy; },
        get LifecycleFlags () { return LifecycleFlags; },
        get MutationKind () { return MutationKind; },
        stringifyLifecycleFlags: stringifyLifecycleFlags,
        instructionRenderer: instructionRenderer,
        ensureExpression: ensureExpression,
        addAttachable: addAttachable,
        addBindable: addBindable,
        BasicRenderer: BasicRenderer,
        CompiledTemplate: CompiledTemplate,
        createRenderContext: createRenderContext,
        IInstructionRenderer: IInstructionRenderer,
        IRenderer: IRenderer,
        IRenderingEngine: IRenderingEngine,
        ITemplateCompiler: ITemplateCompiler,
        ITemplateFactory: ITemplateFactory,
        get ViewCompileFlags () { return ViewCompileFlags; }
    });

    function register$2(container) {
        const resourceKey = BindingCommandResource.keyFrom(this.description.name);
        container.register(Registration.singleton(resourceKey, this));
    }
    function bindingCommand(nameOrDefinition) {
        return target => BindingCommandResource.define(nameOrDefinition, target);
    }
    function keyFrom$2(name) {
        return `${this.name}:${name}`;
    }
    function isType$4(Type) {
        return Type.kind === this;
    }
    function define$4(nameOrDefinition, ctor) {
        const Type = ctor;
        const description = typeof nameOrDefinition === 'string' ? { name: nameOrDefinition, target: null } : nameOrDefinition;
        Type.kind = BindingCommandResource;
        Type.description = description;
        Type.register = register$2;
        return Type;
    }
    const BindingCommandResource = {
        name: 'binding-command',
        keyFrom: keyFrom$2,
        isType: isType$4,
        define: define$4
    };
    function getTarget(binding, camelCase) {
        if (binding.flags & 256 /* isBinding */) {
            return binding.bindable.propName;
        }
        else if (camelCase) {
            return PLATFORM.camelCase(binding.syntax.target);
        }
        else {
            return binding.syntax.target;
        }
    }
    function getMode(binding) {
        if (binding.flags & 256 /* isBinding */) {
            return binding.bindable.mode;
        }
        else {
            return commandToMode[binding.syntax.command];
        }
    }
    class OneTimeBindingCommand {
        constructor() {
            this.bindingType = 49 /* OneTimeCommand */;
        }
        compile(binding) {
            return new OneTimeBindingInstruction(binding.expression, getTarget(binding, false));
        }
    }
    BindingCommandResource.define('one-time', OneTimeBindingCommand);
    class ToViewBindingCommand {
        constructor() {
            this.bindingType = 50 /* ToViewCommand */;
        }
        compile(binding) {
            return new ToViewBindingInstruction(binding.expression, getTarget(binding, false));
        }
    }
    BindingCommandResource.define('to-view', ToViewBindingCommand);
    class FromViewBindingCommand {
        constructor() {
            this.bindingType = 51 /* FromViewCommand */;
        }
        compile(binding) {
            return new FromViewBindingInstruction(binding.expression, getTarget(binding, false));
        }
    }
    BindingCommandResource.define('from-view', FromViewBindingCommand);
    class TwoWayBindingCommand {
        constructor() {
            this.bindingType = 52 /* TwoWayCommand */;
        }
        compile(binding) {
            return new TwoWayBindingInstruction(binding.expression, getTarget(binding, false));
        }
    }
    BindingCommandResource.define('two-way', TwoWayBindingCommand);
    // Not bothering to throw on non-existing modes, should never happen anyway.
    // Keeping all array elements of the same type for better optimizeability.
    const modeToProperty = ['', '$1', '$2', '', '$4', '', '$6'];
    const commandToMode = {
        'bind': BindingMode.toView,
        'one-time': BindingMode.oneTime,
        'to-view': BindingMode.toView,
        'from-view': BindingMode.fromView,
        'two-way': BindingMode.twoWay,
    };
    class DefaultBindingCommand {
        constructor() {
            this.bindingType = 53 /* BindCommand */;
            this.$1 = OneTimeBindingCommand.prototype.compile;
            this.$2 = ToViewBindingCommand.prototype.compile;
            this.$4 = FromViewBindingCommand.prototype.compile;
            this.$6 = TwoWayBindingCommand.prototype.compile;
        }
        compile(binding) {
            return this[modeToProperty[getMode(binding)]](binding);
        }
    }
    BindingCommandResource.define('bind', DefaultBindingCommand);
    class CallBindingCommand {
        constructor() {
            this.bindingType = 153 /* CallCommand */;
        }
        compile(binding) {
            return new CallBindingInstruction(binding.expression, getTarget(binding, true));
        }
    }
    BindingCommandResource.define('call', CallBindingCommand);
    class ForBindingCommand {
        constructor() {
            this.bindingType = 539 /* ForCommand */;
        }
        compile(binding) {
            return new IteratorBindingInstruction(binding.expression, getTarget(binding, false));
        }
    }
    BindingCommandResource.define('for', ForBindingCommand);

    /** @internal */
    function unescapeCode(code) {
        switch (code) {
            case 98 /* LowerB */: return 8 /* Backspace */;
            case 116 /* LowerT */: return 9 /* Tab */;
            case 110 /* LowerN */: return 10 /* LineFeed */;
            case 118 /* LowerV */: return 11 /* VerticalTab */;
            case 102 /* LowerF */: return 12 /* FormFeed */;
            case 114 /* LowerR */: return 13 /* CarriageReturn */;
            case 34 /* DoubleQuote */: return 34 /* DoubleQuote */;
            case 39 /* SingleQuote */: return 39 /* SingleQuote */;
            case 92 /* Backslash */: return 92 /* Backslash */;
            default: return code;
        }
    }

    const ParserRegistration = {
        register(container) {
            container.registerTransformer(IExpressionParser, parser => {
                parser['parseCore'] = parseExpression;
                return parser;
            });
        }
    };
    const $false = PrimitiveLiteral.$false;
    const $true = PrimitiveLiteral.$true;
    const $null = PrimitiveLiteral.$null;
    const $undefined = PrimitiveLiteral.$undefined;
    const $this = AccessThis.$this;
    const $parent = AccessThis.$parent;
    /** @internal */
    class ParserState {
        get tokenRaw() {
            return this.input.slice(this.startIndex, this.index);
        }
        constructor(input) {
            this.index = 0;
            this.startIndex = 0;
            this.lastIndex = 0;
            this.input = input;
            this.length = input.length;
            this.currentToken = 1572864 /* EOF */;
            this.tokenValue = '';
            this.currentChar = input.charCodeAt(0);
            this.assignable = true;
        }
    }
    const $state = new ParserState('');
    function parseExpression(input, bindingType) {
        $state.input = input;
        $state.length = input.length;
        $state.index = 0;
        $state.currentChar = input.charCodeAt(0);
        return parse($state, 0 /* Reset */, 61 /* Variadic */, bindingType === undefined ? 53 /* BindCommand */ : bindingType);
    }
    /** @internal */
    // JUSTIFICATION: This is performance-critical code which follows a subset of the well-known ES spec.
    // Knowing the spec, or parsers in general, will help with understanding this code and it is therefore not the
    // single source of information for being able to figure it out.
    // It generally does not need to change unless the spec changes or spec violations are found, or optimization
    // opportunities are found (which would likely not fix these warnings in any case).
    // It's therefore not considered to have any tangible impact on the maintainability of the code base.
    // For reference, most of the parsing logic is based on: https://tc39.github.io/ecma262/#sec-ecmascript-language-expressions
    // tslint:disable-next-line:no-big-function cognitive-complexity
    function parse(state, access, minPrecedence, bindingType) {
        if (state.index === 0) {
            if (bindingType & 2048 /* Interpolation */) {
                // tslint:disable-next-line:no-any
                return parseInterpolation(state);
            }
            nextToken(state);
            if (state.currentToken & 1048576 /* ExpressionTerminal */) {
                throw Reporter.error(100 /* InvalidExpressionStart */, { state });
            }
        }
        state.assignable = 448 /* Binary */ > minPrecedence;
        let result = undefined;
        if (state.currentToken & 32768 /* UnaryOp */) {
            /** parseUnaryExpression
             * https://tc39.github.io/ecma262/#sec-unary-operators
             *
             * UnaryExpression :
             *   1. LeftHandSideExpression
             *   2. void UnaryExpression
             *   3. typeof UnaryExpression
             *   4. + UnaryExpression
             *   5. - UnaryExpression
             *   6. ! UnaryExpression
             *
             * IsValidAssignmentTarget
             *   2,3,4,5,6 = false
             *   1 = see parseLeftHandSideExpression
             *
             * Note: technically we should throw on ++ / -- / +++ / ---, but there's nothing to gain from that
             */
            const op = TokenValues[state.currentToken & 63 /* Type */];
            nextToken(state);
            result = new Unary(op, parse(state, access, 449 /* LeftHandSide */, bindingType));
            state.assignable = false;
        }
        else {
            /** parsePrimaryExpression
             * https://tc39.github.io/ecma262/#sec-primary-expression
             *
             * PrimaryExpression :
             *   1. this
             *   2. IdentifierName
             *   3. Literal
             *   4. ArrayLiteral
             *   5. ObjectLiteral
             *   6. TemplateLiteral
             *   7. ParenthesizedExpression
             *
             * Literal :
             *    NullLiteral
             *    BooleanLiteral
             *    NumericLiteral
             *    StringLiteral
             *
             * ParenthesizedExpression :
             *   ( AssignmentExpression )
             *
             * IsValidAssignmentTarget
             *   1,3,4,5,6,7 = false
             *   2 = true
             */
            primary: switch (state.currentToken) {
                case 3077 /* ParentScope */: // $parent
                    state.assignable = false;
                    do {
                        nextToken(state);
                        access++; // ancestor
                        if (consumeOpt(state, 16392 /* Dot */)) {
                            if (state.currentToken === 16392 /* Dot */) {
                                throw Reporter.error(102 /* DoubleDot */, { state });
                            }
                            else if (state.currentToken === 1572864 /* EOF */) {
                                throw Reporter.error(105 /* ExpectedIdentifier */, { state });
                            }
                        }
                        else if (state.currentToken & 524288 /* AccessScopeTerminal */) {
                            const ancestor = access & 511 /* Ancestor */;
                            result = ancestor === 0 ? $this : ancestor === 1 ? $parent : new AccessThis(ancestor);
                            access = 512 /* This */;
                            break primary;
                        }
                        else {
                            throw Reporter.error(103 /* InvalidMemberExpression */, { state });
                        }
                    } while (state.currentToken === 3077 /* ParentScope */);
                // falls through
                case 1024 /* Identifier */: // identifier
                    if (bindingType & 512 /* IsIterator */) {
                        result = new BindingIdentifier(state.tokenValue);
                    }
                    else {
                        result = new AccessScope(state.tokenValue, access & 511 /* Ancestor */);
                        access = 1024 /* Scope */;
                    }
                    state.assignable = true;
                    nextToken(state);
                    break;
                case 3076 /* ThisScope */: // $this
                    state.assignable = false;
                    nextToken(state);
                    result = $this;
                    access = 512 /* This */;
                    break;
                case 671750 /* OpenParen */: // parenthesized expression
                    nextToken(state);
                    result = parse(state, 0 /* Reset */, 62 /* Assign */, bindingType);
                    consume(state, 1835018 /* CloseParen */);
                    access = 0 /* Reset */;
                    break;
                case 671756 /* OpenBracket */:
                    result = parseArrayLiteralExpression(state, access, bindingType);
                    access = 0 /* Reset */;
                    break;
                case 131079 /* OpenBrace */:
                    result = parseObjectLiteralExpression(state, bindingType);
                    access = 0 /* Reset */;
                    break;
                case 540713 /* TemplateTail */:
                    result = new Template([state.tokenValue]);
                    state.assignable = false;
                    nextToken(state);
                    access = 0 /* Reset */;
                    break;
                case 540714 /* TemplateContinuation */:
                    result = parseTemplate(state, access, bindingType, result, false);
                    access = 0 /* Reset */;
                    break;
                case 4096 /* StringLiteral */:
                case 8192 /* NumericLiteral */:
                    result = new PrimitiveLiteral(state.tokenValue);
                    state.assignable = false;
                    nextToken(state);
                    access = 0 /* Reset */;
                    break;
                case 2050 /* NullKeyword */:
                case 2051 /* UndefinedKeyword */:
                case 2049 /* TrueKeyword */:
                case 2048 /* FalseKeyword */:
                    result = TokenValues[state.currentToken & 63 /* Type */];
                    state.assignable = false;
                    nextToken(state);
                    access = 0 /* Reset */;
                    break;
                default:
                    if (state.index >= state.length) {
                        throw Reporter.error(104 /* UnexpectedEndOfExpression */, { state });
                    }
                    else {
                        throw Reporter.error(101 /* UnconsumedToken */, { state });
                    }
            }
            if (bindingType & 512 /* IsIterator */) {
                // tslint:disable-next-line:no-any
                return parseForOfStatement(state, result);
            }
            // tslint:disable-next-line:no-any
            if (449 /* LeftHandSide */ < minPrecedence)
                return result;
            /** parseMemberExpression (Token.Dot, Token.OpenBracket, Token.TemplateContinuation)
             * MemberExpression :
             *   1. PrimaryExpression
             *   2. MemberExpression [ AssignmentExpression ]
             *   3. MemberExpression . IdentifierName
             *   4. MemberExpression TemplateLiteral
             *
             * IsValidAssignmentTarget
             *   1,4 = false
             *   2,3 = true
             *
             *
             * parseCallExpression (Token.OpenParen)
             * CallExpression :
             *   1. MemberExpression Arguments
             *   2. CallExpression Arguments
             *   3. CallExpression [ AssignmentExpression ]
             *   4. CallExpression . IdentifierName
             *   5. CallExpression TemplateLiteral
             *
             * IsValidAssignmentTarget
             *   1,2,5 = false
             *   3,4 = true
             */
            let name = state.tokenValue;
            while ((state.currentToken & 16384 /* LeftHandSide */) > 0) {
                switch (state.currentToken) {
                    case 16392 /* Dot */:
                        state.assignable = true;
                        nextToken(state);
                        if ((state.currentToken & 3072 /* IdentifierName */) === 0) {
                            throw Reporter.error(105 /* ExpectedIdentifier */, { state });
                        }
                        name = state.tokenValue;
                        nextToken(state);
                        // Change $This to $Scope, change $Scope to $Member, keep $Member as-is, change $Keyed to $Member, disregard other flags
                        access = ((access & (512 /* This */ | 1024 /* Scope */)) << 1) | (access & 2048 /* Member */) | ((access & 4096 /* Keyed */) >> 1);
                        if (state.currentToken === 671750 /* OpenParen */) {
                            if (access === 0 /* Reset */) { // if the left hand side is a literal, make sure we parse a CallMember
                                access = 2048 /* Member */;
                            }
                            continue;
                        }
                        if (access & 1024 /* Scope */) {
                            result = new AccessScope(name, result.ancestor);
                        }
                        else { // if it's not $Scope, it's $Member
                            result = new AccessMember(result, name);
                        }
                        continue;
                    case 671756 /* OpenBracket */:
                        state.assignable = true;
                        nextToken(state);
                        access = 4096 /* Keyed */;
                        result = new AccessKeyed(result, parse(state, 0 /* Reset */, 62 /* Assign */, bindingType));
                        consume(state, 1835021 /* CloseBracket */);
                        break;
                    case 671750 /* OpenParen */:
                        state.assignable = false;
                        nextToken(state);
                        const args = new Array();
                        while (state.currentToken !== 1835018 /* CloseParen */) {
                            args.push(parse(state, 0 /* Reset */, 62 /* Assign */, bindingType));
                            if (!consumeOpt(state, 1572875 /* Comma */)) {
                                break;
                            }
                        }
                        consume(state, 1835018 /* CloseParen */);
                        if (access & 1024 /* Scope */) {
                            result = new CallScope(name, args, result.ancestor);
                        }
                        else if (access & 2048 /* Member */) {
                            result = new CallMember(result, name, args);
                        }
                        else {
                            result = new CallFunction(result, args);
                        }
                        access = 0;
                        break;
                    case 540713 /* TemplateTail */:
                        state.assignable = false;
                        const strings = [state.tokenValue];
                        result = new TaggedTemplate(strings, strings, result);
                        nextToken(state);
                        break;
                    case 540714 /* TemplateContinuation */:
                        result = parseTemplate(state, access, bindingType, result, true);
                    default:
                }
            }
        }
        // tslint:disable-next-line:no-any
        if (448 /* Binary */ < minPrecedence)
            return result;
        /** parseBinaryExpression
         * https://tc39.github.io/ecma262/#sec-multiplicative-operators
         *
         * MultiplicativeExpression : (local precedence 6)
         *   UnaryExpression
         *   MultiplicativeExpression * / % UnaryExpression
         *
         * AdditiveExpression : (local precedence 5)
         *   MultiplicativeExpression
         *   AdditiveExpression + - MultiplicativeExpression
         *
         * RelationalExpression : (local precedence 4)
         *   AdditiveExpression
         *   RelationalExpression < > <= >= instanceof in AdditiveExpression
         *
         * EqualityExpression : (local precedence 3)
         *   RelationalExpression
         *   EqualityExpression == != === !== RelationalExpression
         *
         * LogicalANDExpression : (local precedence 2)
         *   EqualityExpression
         *   LogicalANDExpression && EqualityExpression
         *
         * LogicalORExpression : (local precedence 1)
         *   LogicalANDExpression
         *   LogicalORExpression || LogicalANDExpression
         */
        while ((state.currentToken & 65536 /* BinaryOp */) > 0) {
            const opToken = state.currentToken;
            if ((opToken & 448 /* Precedence */) <= minPrecedence) {
                break;
            }
            nextToken(state);
            result = new Binary(TokenValues[opToken & 63 /* Type */], result, parse(state, access, opToken & 448 /* Precedence */, bindingType));
            state.assignable = false;
        }
        // tslint:disable-next-line:no-any
        if (63 /* Conditional */ < minPrecedence)
            return result;
        /**
         * parseConditionalExpression
         * https://tc39.github.io/ecma262/#prod-ConditionalExpression
         *
         * ConditionalExpression :
         *   1. BinaryExpression
         *   2. BinaryExpression ? AssignmentExpression : AssignmentExpression
         *
         * IsValidAssignmentTarget
         *   1,2 = false
         */
        if (consumeOpt(state, 1572879 /* Question */)) {
            const yes = parse(state, access, 62 /* Assign */, bindingType);
            consume(state, 1572878 /* Colon */);
            result = new Conditional(result, yes, parse(state, access, 62 /* Assign */, bindingType));
            state.assignable = false;
        }
        // tslint:disable-next-line:no-any
        if (62 /* Assign */ < minPrecedence)
            return result;
        /** parseAssignmentExpression
         * https://tc39.github.io/ecma262/#prod-AssignmentExpression
         * Note: AssignmentExpression here is equivalent to ES Expression because we don't parse the comma operator
         *
         * AssignmentExpression :
         *   1. ConditionalExpression
         *   2. LeftHandSideExpression = AssignmentExpression
         *
         * IsValidAssignmentTarget
         *   1,2 = false
         */
        if (consumeOpt(state, 1048615 /* Equals */)) {
            if (!state.assignable) {
                throw Reporter.error(150 /* NotAssignable */, { state });
            }
            result = new Assign(result, parse(state, access, 62 /* Assign */, bindingType));
        }
        // tslint:disable-next-line:no-any
        if (61 /* Variadic */ < minPrecedence)
            return result;
        /** parseValueConverter
         */
        while (consumeOpt(state, 1572883 /* Bar */)) {
            if (state.currentToken === 1572864 /* EOF */) {
                throw Reporter.error(112);
            }
            const name = state.tokenValue;
            nextToken(state);
            const args = new Array();
            while (consumeOpt(state, 1572878 /* Colon */)) {
                args.push(parse(state, access, 62 /* Assign */, bindingType));
            }
            result = new ValueConverter(result, name, args);
        }
        /** parseBindingBehavior
         */
        while (consumeOpt(state, 1572880 /* Ampersand */)) {
            if (state.currentToken === 1572864 /* EOF */) {
                throw Reporter.error(113);
            }
            const name = state.tokenValue;
            nextToken(state);
            const args = new Array();
            while (consumeOpt(state, 1572878 /* Colon */)) {
                args.push(parse(state, access, 62 /* Assign */, bindingType));
            }
            result = new BindingBehavior(result, name, args);
        }
        if (state.currentToken !== 1572864 /* EOF */) {
            if (bindingType & 2048 /* Interpolation */) {
                // tslint:disable-next-line:no-any
                return result;
            }
            if (state.tokenRaw === 'of') {
                throw Reporter.error(151 /* UnexpectedForOf */, { state });
            }
            throw Reporter.error(101 /* UnconsumedToken */, { state });
        }
        // tslint:disable-next-line:no-any
        return result;
    }
    /**
     * parseArrayLiteralExpression
     * https://tc39.github.io/ecma262/#prod-ArrayLiteral
     *
     * ArrayLiteral :
     *   [ Elision(opt) ]
     *   [ ElementList ]
     *   [ ElementList, Elision(opt) ]
     *
     * ElementList :
     *   Elision(opt) AssignmentExpression
     *   ElementList, Elision(opt) AssignmentExpression
     *
     * Elision :
     *  ,
     *  Elision ,
     */
    function parseArrayLiteralExpression(state, access, bindingType) {
        nextToken(state);
        const elements = new Array();
        while (state.currentToken !== 1835021 /* CloseBracket */) {
            if (consumeOpt(state, 1572875 /* Comma */)) {
                elements.push($undefined);
                if (state.currentToken === 1835021 /* CloseBracket */) {
                    elements.push($undefined);
                    break;
                }
            }
            else {
                elements.push(parse(state, access, 62 /* Assign */, bindingType & ~512 /* IsIterator */));
                if (consumeOpt(state, 1572875 /* Comma */)) {
                    if (state.currentToken === 1835021 /* CloseBracket */) {
                        elements.push($undefined);
                        break;
                    }
                }
                else {
                    break;
                }
            }
        }
        consume(state, 1835021 /* CloseBracket */);
        if (bindingType & 512 /* IsIterator */) {
            return new ArrayBindingPattern(elements);
        }
        else {
            state.assignable = false;
            return new ArrayLiteral(elements);
        }
    }
    function parseForOfStatement(state, result) {
        if ((result.$kind & 65536 /* IsForDeclaration */) === 0) {
            throw Reporter.error(106 /* InvalidForDeclaration */, { state });
        }
        if (state.currentToken !== 1051179 /* OfKeyword */) {
            throw Reporter.error(106 /* InvalidForDeclaration */, { state });
        }
        nextToken(state);
        const declaration = result;
        const statement = parse(state, 0 /* Reset */, 61 /* Variadic */, 0 /* None */);
        return new ForOfStatement(declaration, statement);
    }
    /**
     * parseObjectLiteralExpression
     * https://tc39.github.io/ecma262/#prod-Literal
     *
     * ObjectLiteral :
     *   { }
     *   { PropertyDefinitionList }
     *
     * PropertyDefinitionList :
     *   PropertyDefinition
     *   PropertyDefinitionList, PropertyDefinition
     *
     * PropertyDefinition :
     *   IdentifierName
     *   PropertyName : AssignmentExpression
     *
     * PropertyName :
     *   IdentifierName
     *   StringLiteral
     *   NumericLiteral
     */
    function parseObjectLiteralExpression(state, bindingType) {
        const keys = new Array();
        const values = new Array();
        nextToken(state);
        while (state.currentToken !== 1835017 /* CloseBrace */) {
            keys.push(state.tokenValue);
            // Literal = mandatory colon
            if (state.currentToken & 12288 /* StringOrNumericLiteral */) {
                nextToken(state);
                consume(state, 1572878 /* Colon */);
                values.push(parse(state, 0 /* Reset */, 62 /* Assign */, bindingType & ~512 /* IsIterator */));
            }
            else if (state.currentToken & 3072 /* IdentifierName */) {
                // IdentifierName = optional colon
                const { currentChar, currentToken, index } = state;
                nextToken(state);
                if (consumeOpt(state, 1572878 /* Colon */)) {
                    values.push(parse(state, 0 /* Reset */, 62 /* Assign */, bindingType & ~512 /* IsIterator */));
                }
                else {
                    // Shorthand
                    state.currentChar = currentChar;
                    state.currentToken = currentToken;
                    state.index = index;
                    values.push(parse(state, 0 /* Reset */, 450 /* Primary */, bindingType & ~512 /* IsIterator */));
                }
            }
            else {
                throw Reporter.error(107 /* InvalidObjectLiteralPropertyDefinition */, { state });
            }
            if (state.currentToken !== 1835017 /* CloseBrace */) {
                consume(state, 1572875 /* Comma */);
            }
        }
        consume(state, 1835017 /* CloseBrace */);
        if (bindingType & 512 /* IsIterator */) {
            return new ObjectBindingPattern(keys, values);
        }
        else {
            state.assignable = false;
            return new ObjectLiteral(keys, values);
        }
    }
    function parseInterpolation(state) {
        const parts = [];
        const expressions = [];
        const length = state.length;
        let result = '';
        while (state.index < length) {
            switch (state.currentChar) {
                case 36 /* Dollar */:
                    if (state.input.charCodeAt(state.index + 1) === 123 /* OpenBrace */) {
                        parts.push(result);
                        result = '';
                        state.index += 2;
                        state.currentChar = state.input.charCodeAt(state.index);
                        nextToken(state);
                        const expression = parse(state, 0 /* Reset */, 61 /* Variadic */, 2048 /* Interpolation */);
                        expressions.push(expression);
                        continue;
                    }
                    else {
                        result += '$';
                    }
                    break;
                case 92 /* Backslash */:
                    result += String.fromCharCode(unescapeCode(nextChar(state)));
                    break;
                default:
                    result += String.fromCharCode(state.currentChar);
            }
            nextChar(state);
        }
        if (expressions.length) {
            parts.push(result);
            return new Interpolation(parts, expressions);
        }
        return null;
    }
    /**
     * parseTemplateLiteralExpression
     * https://tc39.github.io/ecma262/#prod-Literal
     *
     * Template :
     *   NoSubstitutionTemplate
     *   TemplateHead
     *
     * NoSubstitutionTemplate :
     *   ` TemplateCharacters(opt) `
     *
     * TemplateHead :
     *   ` TemplateCharacters(opt) ${
     *
     * TemplateSubstitutionTail :
     *   TemplateMiddle
     *   TemplateTail
     *
     * TemplateMiddle :
     *   } TemplateCharacters(opt) ${
     *
     * TemplateTail :
     *   } TemplateCharacters(opt) `
     *
     * TemplateCharacters :
     *   TemplateCharacter TemplateCharacters(opt)
     *
     * TemplateCharacter :
     *   $ [lookahead ≠ {]
     *   \ EscapeSequence
     *   SourceCharacter (but not one of ` or \ or $)
     */
    function parseTemplate(state, access, bindingType, result, tagged) {
        const cooked = [state.tokenValue];
        // TODO: properly implement raw parts / decide whether we want this
        consume(state, 540714 /* TemplateContinuation */);
        const expressions = [parse(state, access, 62 /* Assign */, bindingType)];
        while ((state.currentToken = scanTemplateTail(state)) !== 540713 /* TemplateTail */) {
            cooked.push(state.tokenValue);
            consume(state, 540714 /* TemplateContinuation */);
            expressions.push(parse(state, access, 62 /* Assign */, bindingType));
        }
        cooked.push(state.tokenValue);
        state.assignable = false;
        if (tagged) {
            nextToken(state);
            return new TaggedTemplate(cooked, cooked, result, expressions);
        }
        else {
            nextToken(state);
            return new Template(cooked, expressions);
        }
    }
    function nextToken(state) {
        while (state.index < state.length) {
            state.startIndex = state.index;
            if ((state.currentToken = CharScanners[state.currentChar](state)) !== null) { // a null token means the character must be skipped
                return;
            }
        }
        state.currentToken = 1572864 /* EOF */;
    }
    function nextChar(state) {
        return state.currentChar = state.input.charCodeAt(++state.index);
    }
    function scanIdentifier(state) {
        // run to the next non-idPart
        while (IdParts[nextChar(state)])
            ;
        const token = KeywordLookup[state.tokenValue = state.tokenRaw];
        return token === undefined ? 1024 /* Identifier */ : token;
    }
    function scanNumber(state, isFloat) {
        let char = state.currentChar;
        if (isFloat === false) {
            do {
                char = nextChar(state);
            } while (char <= 57 /* Nine */ && char >= 48 /* Zero */);
            if (char !== 46 /* Dot */) {
                state.tokenValue = parseInt(state.tokenRaw, 10);
                return 8192 /* NumericLiteral */;
            }
            // past this point it's always a float
            char = nextChar(state);
            if (state.index >= state.length) {
                // unless the number ends with a dot - that behaves a little different in native ES expressions
                // but in our AST that behavior has no effect because numbers are always stored in variables
                state.tokenValue = parseInt(state.tokenRaw.slice(0, -1), 10);
                return 8192 /* NumericLiteral */;
            }
        }
        if (char <= 57 /* Nine */ && char >= 48 /* Zero */) {
            do {
                char = nextChar(state);
            } while (char <= 57 /* Nine */ && char >= 48 /* Zero */);
        }
        else {
            state.currentChar = state.input.charCodeAt(--state.index);
        }
        state.tokenValue = parseFloat(state.tokenRaw);
        return 8192 /* NumericLiteral */;
    }
    function scanString(state) {
        const quote = state.currentChar;
        nextChar(state); // Skip initial quote.
        let unescaped = 0;
        const buffer = new Array();
        let marker = state.index;
        while (state.currentChar !== quote) {
            if (state.currentChar === 92 /* Backslash */) {
                buffer.push(state.input.slice(marker, state.index));
                nextChar(state);
                unescaped = unescapeCode(state.currentChar);
                nextChar(state);
                buffer.push(String.fromCharCode(unescaped));
                marker = state.index;
            }
            else if (state.index >= state.length) {
                throw Reporter.error(108 /* UnterminatedQuote */, { state });
            }
            else {
                nextChar(state);
            }
        }
        const last = state.input.slice(marker, state.index);
        nextChar(state); // Skip terminating quote.
        // Compute the unescaped string value.
        buffer.push(last);
        const unescapedStr = buffer.join('');
        state.tokenValue = unescapedStr;
        return 4096 /* StringLiteral */;
    }
    function scanTemplate(state) {
        let tail = true;
        let result = '';
        while (nextChar(state) !== 96 /* Backtick */) {
            if (state.currentChar === 36 /* Dollar */) {
                if ((state.index + 1) < state.length && state.input.charCodeAt(state.index + 1) === 123 /* OpenBrace */) {
                    state.index++;
                    tail = false;
                    break;
                }
                else {
                    result += '$';
                }
            }
            else if (state.currentChar === 92 /* Backslash */) {
                result += String.fromCharCode(unescapeCode(nextChar(state)));
            }
            else {
                if (state.index >= state.length) {
                    throw Reporter.error(109 /* UnterminatedTemplate */, { state });
                }
                result += String.fromCharCode(state.currentChar);
            }
        }
        nextChar(state);
        state.tokenValue = result;
        if (tail) {
            return 540713 /* TemplateTail */;
        }
        return 540714 /* TemplateContinuation */;
    }
    function scanTemplateTail(state) {
        if (state.index >= state.length) {
            throw Reporter.error(109 /* UnterminatedTemplate */, { state });
        }
        state.index--;
        return scanTemplate(state);
    }
    function consumeOpt(state, token) {
        // tslint:disable-next-line:possible-timing-attack
        if (state.currentToken === token) {
            nextToken(state);
            return true;
        }
        return false;
    }
    function consume(state, token) {
        // tslint:disable-next-line:possible-timing-attack
        if (state.currentToken === token) {
            nextToken(state);
        }
        else {
            throw Reporter.error(110 /* MissingExpectedToken */, { state, expected: token });
        }
    }
    /**
     * Array for mapping tokens to token values. The indices of the values
     * correspond to the token bits 0-38.
     * For this to work properly, the values in the array must be kept in
     * the same order as the token bits.
     * Usage: TokenValues[token & Token.Type]
     */
    const TokenValues = [
        $false, $true, $null, $undefined, '$this', '$parent',
        '(', '{', '.', '}', ')', ',', '[', ']', ':', '?', '\'', '"',
        '&', '|', '||', '&&', '==', '!=', '===', '!==', '<', '>',
        '<=', '>=', 'in', 'instanceof', '+', '-', 'typeof', 'void', '*', '%', '/', '=', '!',
        540713 /* TemplateTail */, 540714 /* TemplateContinuation */,
        'of'
    ];
    const KeywordLookup = Object.create(null);
    KeywordLookup.true = 2049 /* TrueKeyword */;
    KeywordLookup.null = 2050 /* NullKeyword */;
    KeywordLookup.false = 2048 /* FalseKeyword */;
    KeywordLookup.undefined = 2051 /* UndefinedKeyword */;
    KeywordLookup.$this = 3076 /* ThisScope */;
    KeywordLookup.$parent = 3077 /* ParentScope */;
    KeywordLookup.in = 1640798 /* InKeyword */;
    KeywordLookup.instanceof = 1640799 /* InstanceOfKeyword */;
    KeywordLookup.typeof = 34850 /* TypeofKeyword */;
    KeywordLookup.void = 34851 /* VoidKeyword */;
    KeywordLookup.of = 1051179 /* OfKeyword */;
    /**
     * Ranges of code points in pairs of 2 (eg 0x41-0x5B, 0x61-0x7B, ...) where the second value is not inclusive (5-7 means 5 and 6)
     * Single values are denoted by the second value being a 0
     *
     * Copied from output generated with "node build/generate-unicode.js"
     *
     * See also: https://en.wikibooks.org/wiki/Unicode/Character_reference/0000-0FFF
     */
    const codes = {
        /* [$0-9A-Za_a-z] */
        AsciiIdPart: [0x24, 0, 0x30, 0x3A, 0x41, 0x5B, 0x5F, 0, 0x61, 0x7B],
        IdStart: /*IdentifierStart*/ [0x24, 0, 0x41, 0x5B, 0x5F, 0, 0x61, 0x7B, 0xAA, 0, 0xBA, 0, 0xC0, 0xD7, 0xD8, 0xF7, 0xF8, 0x2B9, 0x2E0, 0x2E5, 0x1D00, 0x1D26, 0x1D2C, 0x1D5D, 0x1D62, 0x1D66, 0x1D6B, 0x1D78, 0x1D79, 0x1DBF, 0x1E00, 0x1F00, 0x2071, 0, 0x207F, 0, 0x2090, 0x209D, 0x212A, 0x212C, 0x2132, 0, 0x214E, 0, 0x2160, 0x2189, 0x2C60, 0x2C80, 0xA722, 0xA788, 0xA78B, 0xA7AF, 0xA7B0, 0xA7B8, 0xA7F7, 0xA800, 0xAB30, 0xAB5B, 0xAB5C, 0xAB65, 0xFB00, 0xFB07, 0xFF21, 0xFF3B, 0xFF41, 0xFF5B],
        Digit: /*DecimalNumber*/ [0x30, 0x3A],
        Skip: /*Skippable*/ [0, 0x21, 0x7F, 0xA1]
    };
    /**
     * Decompress the ranges into an array of numbers so that the char code
     * can be used as an index to the lookup
     */
    function decompress(lookup, $set, compressed, value) {
        const rangeCount = compressed.length;
        for (let i = 0; i < rangeCount; i += 2) {
            const start = compressed[i];
            let end = compressed[i + 1];
            end = end > 0 ? end : start + 1;
            if (lookup) {
                lookup.fill(value, start, end);
            }
            if ($set) {
                for (let ch = start; ch < end; ch++) {
                    $set.add(ch);
                }
            }
        }
    }
    // CharFuncLookup functions
    function returnToken(token) {
        return s => {
            nextChar(s);
            return token;
        };
    }
    const unexpectedCharacter = s => {
        throw Reporter.error(111 /* UnexpectedCharacter */, { state: s });
    };
    unexpectedCharacter.notMapped = true;
    // ASCII IdentifierPart lookup
    const AsciiIdParts = new Set();
    decompress(null, AsciiIdParts, codes.AsciiIdPart, true);
    // IdentifierPart lookup
    const IdParts = new Uint8Array(0xFFFF);
    // tslint:disable-next-line:no-any
    decompress(IdParts, null, codes.IdStart, 1);
    // tslint:disable-next-line:no-any
    decompress(IdParts, null, codes.Digit, 1);
    // Character scanning function lookup
    const CharScanners = new Array(0xFFFF);
    CharScanners.fill(unexpectedCharacter, 0, 0xFFFF);
    decompress(CharScanners, null, codes.Skip, s => {
        nextChar(s);
        return null;
    });
    decompress(CharScanners, null, codes.IdStart, scanIdentifier);
    decompress(CharScanners, null, codes.Digit, s => scanNumber(s, false));
    CharScanners[34 /* DoubleQuote */] =
        CharScanners[39 /* SingleQuote */] = s => {
            return scanString(s);
        };
    CharScanners[96 /* Backtick */] = s => {
        return scanTemplate(s);
    };
    // !, !=, !==
    CharScanners[33 /* Exclamation */] = s => {
        if (nextChar(s) !== 61 /* Equals */) {
            return 32808 /* Exclamation */;
        }
        if (nextChar(s) !== 61 /* Equals */) {
            return 1638679 /* ExclamationEquals */;
        }
        nextChar(s);
        return 1638681 /* ExclamationEqualsEquals */;
    };
    // =, ==, ===
    CharScanners[61 /* Equals */] = s => {
        if (nextChar(s) !== 61 /* Equals */) {
            return 1048615 /* Equals */;
        }
        if (nextChar(s) !== 61 /* Equals */) {
            return 1638678 /* EqualsEquals */;
        }
        nextChar(s);
        return 1638680 /* EqualsEqualsEquals */;
    };
    // &, &&
    CharScanners[38 /* Ampersand */] = s => {
        if (nextChar(s) !== 38 /* Ampersand */) {
            return 1572880 /* Ampersand */;
        }
        nextChar(s);
        return 1638613 /* AmpersandAmpersand */;
    };
    // |, ||
    CharScanners[124 /* Bar */] = s => {
        if (nextChar(s) !== 124 /* Bar */) {
            return 1572883 /* Bar */;
        }
        nextChar(s);
        return 1638548 /* BarBar */;
    };
    // .
    CharScanners[46 /* Dot */] = s => {
        if (nextChar(s) <= 57 /* Nine */ && s.currentChar >= 48 /* Zero */) {
            return scanNumber(s, true);
        }
        return 16392 /* Dot */;
    };
    // <, <=
    CharScanners[60 /* LessThan */] = s => {
        if (nextChar(s) !== 61 /* Equals */) {
            return 1638746 /* LessThan */;
        }
        nextChar(s);
        return 1638748 /* LessThanEquals */;
    };
    // >, >=
    CharScanners[62 /* GreaterThan */] = s => {
        if (nextChar(s) !== 61 /* Equals */) {
            return 1638747 /* GreaterThan */;
        }
        nextChar(s);
        return 1638749 /* GreaterThanEquals */;
    };
    CharScanners[37 /* Percent */] = returnToken(1638885 /* Percent */);
    CharScanners[40 /* OpenParen */] = returnToken(671750 /* OpenParen */);
    CharScanners[41 /* CloseParen */] = returnToken(1835018 /* CloseParen */);
    CharScanners[42 /* Asterisk */] = returnToken(1638884 /* Asterisk */);
    CharScanners[43 /* Plus */] = returnToken(623008 /* Plus */);
    CharScanners[44 /* Comma */] = returnToken(1572875 /* Comma */);
    CharScanners[45 /* Minus */] = returnToken(623009 /* Minus */);
    CharScanners[47 /* Slash */] = returnToken(1638886 /* Slash */);
    CharScanners[58 /* Colon */] = returnToken(1572878 /* Colon */);
    CharScanners[63 /* Question */] = returnToken(1572879 /* Question */);
    CharScanners[91 /* OpenBracket */] = returnToken(671756 /* OpenBracket */);
    CharScanners[93 /* CloseBracket */] = returnToken(1835021 /* CloseBracket */);
    CharScanners[123 /* OpenBrace */] = returnToken(131079 /* OpenBrace */);
    CharScanners[125 /* CloseBrace */] = returnToken(1835017 /* CloseBrace */);

    const BasicBindingSyntax = [
        DotSeparatedAttributePattern,
        RefAttributePattern
    ];
    const BasicBindingLanguage = [
        CallBindingCommand,
        DefaultBindingCommand,
        ForBindingCommand,
        FromViewBindingCommand,
        OneTimeBindingCommand,
        ToViewBindingCommand,
        TwoWayBindingCommand
    ];
    const JitConfiguration = {
        register(container) {
            container.register(ParserRegistration, ...BasicBindingSyntax, ...BasicBindingLanguage);
        },
        createContainer() {
            const container = DI.createContainer();
            container.register(JitConfiguration);
            return container;
        }
    };

    /**
     * A pre-processed piece of information about declared custom elements, attributes and
     * binding commands, optimized for consumption by the template compiler.
     */
    class ResourceModel {
        constructor(resources) {
            this.resources = resources;
            this.elementLookup = {};
            this.attributeLookup = {};
            this.commandLookup = {};
        }
        /**
         * Retrieve information about a custom element resource.
         *
         * @param element The original DOM element.
         *
         * @returns The resource information if the element exists, or `null` if it does not exist.
         */
        getElementInfo(name) {
            let result = this.elementLookup[name];
            if (result === undefined) {
                const def = this.resources.find(CustomElementResource, name);
                if (def === null) {
                    result = null;
                }
                else {
                    result = createElementInfo(def);
                }
                this.elementLookup[name] = result;
            }
            return result;
        }
        /**
         * Retrieve information about a custom attribute resource.
         *
         * @param syntax The parsed `AttrSyntax`
         *
         * @returns The resource information if the attribute exists, or `null` if it does not exist.
         */
        getAttributeInfo(syntax) {
            const name = PLATFORM.camelCase(syntax.target);
            let result = this.attributeLookup[name];
            if (result === undefined) {
                const def = this.resources.find(CustomAttributeResource, name);
                if (def === null) {
                    result = null;
                }
                else {
                    result = createAttributeInfo(def);
                }
                this.attributeLookup[name] = result;
            }
            return result;
        }
        /**
         * Retrieve a binding command resource.
         *
         * @param name The parsed `AttrSyntax`
         *
         * @returns An instance of the command if it exists, or `null` if it does not exist.
         */
        getBindingCommand(syntax) {
            const name = syntax.command;
            if (name === null) {
                return null;
            }
            let result = this.commandLookup[name];
            if (result === undefined) {
                result = this.resources.create(BindingCommandResource, name);
                if (result === null) {
                    // unknown binding command
                    throw Reporter.error(0); // TODO: create error code
                }
                this.commandLookup[name] = result;
            }
            return result;
        }
    }
    function createElementInfo(def) {
        const info = new ElementInfo(def.name, def.containerless);
        const bindables = def.bindables;
        const defaultBindingMode = BindingMode.toView;
        let bindable$$1;
        let prop;
        let attr;
        let mode;
        for (prop in bindables) {
            bindable$$1 = bindables[prop];
            // explicitly provided property name has priority over the implicit property name
            if (bindable$$1.property !== undefined) {
                prop = bindable$$1.property;
            }
            // explicitly provided attribute name has priority over the derived implicit attribute name
            if (bindable$$1.attribute !== undefined) {
                attr = bindable$$1.attribute;
            }
            else {
                // derive the attribute name from the resolved property name
                attr = PLATFORM.kebabCase(prop);
            }
            if (bindable$$1.mode !== undefined && bindable$$1.mode !== BindingMode.default) {
                mode = bindable$$1.mode;
            }
            else {
                mode = defaultBindingMode;
            }
            info.bindables[attr] = new BindableInfo(prop, mode);
        }
        return info;
    }
    function createAttributeInfo(def) {
        const info = new AttrInfo(def.name, def.isTemplateController);
        const bindables = def.bindables;
        const defaultBindingMode = def.defaultBindingMode !== undefined && def.defaultBindingMode !== BindingMode.default
            ? def.defaultBindingMode
            : BindingMode.toView;
        let bindable$$1;
        let prop;
        let mode;
        let bindableCount = 0;
        for (prop in bindables) {
            ++bindableCount;
            bindable$$1 = bindables[prop];
            // explicitly provided property name has priority over the implicit property name
            if (bindable$$1.property !== undefined) {
                prop = bindable$$1.property;
            }
            if (bindable$$1.mode !== undefined && bindable$$1.mode !== BindingMode.default) {
                mode = bindable$$1.mode;
            }
            else {
                mode = defaultBindingMode;
            }
            info.bindables[prop] = new BindableInfo(prop, mode);
            // set to first bindable by convention
            if (info.bindable === null) {
                info.bindable = info.bindables[prop];
            }
        }
        // if no bindables are present, default to "value"
        if (info.bindable === null) {
            info.bindable = new BindableInfo('value', defaultBindingMode);
        }
        if (def.hasDynamicOptions || bindableCount > 1) {
            info.hasDynamicOptions = true;
        }
        return info;
    }
    /**
     * A pre-processed piece of information about a defined bindable property on a custom
     * element or attribute, optimized for consumption by the template compiler.
     */
    class BindableInfo {
        constructor(propName, mode) {
            this.propName = propName;
            this.mode = mode;
        }
    }
    /**
     * Pre-processed information about a custom element resource, optimized
     * for consumption by the template compiler.
     */
    class ElementInfo {
        constructor(name, containerless$$1) {
            this.name = name;
            this.containerless = containerless$$1;
            this.bindables = {};
        }
    }
    /**
     * Pre-processed information about a custom attribute resource, optimized
     * for consumption by the template compiler.
     */
    class AttrInfo {
        constructor(name, isTemplateController) {
            this.name = name;
            this.bindables = {};
            this.bindable = null;
            this.isTemplateController = isTemplateController;
            this.hasDynamicOptions = false;
        }
    }

    function createMarker(dom) {
        const marker = dom.createElement('au-m');
        dom.makeTarget(marker);
        return marker;
    }
    /**
     * A html attribute that is associated with a registered resource, specifically a template controller.
     */
    class TemplateControllerSymbol {
        get bindings() {
            if (this._bindings === null) {
                this._bindings = [];
                this.flags |= 4096 /* hasBindings */;
            }
            return this._bindings;
        }
        constructor(dom, syntax, info, partName) {
            this.flags = 1 /* isTemplateController */ | 512 /* hasMarker */;
            this.res = info.name;
            this.partName = partName;
            this.physicalNode = null;
            this.syntax = syntax;
            this.template = null;
            this.templateController = null;
            this.marker = createMarker(dom);
            this._bindings = null;
        }
    }
    /**
     * Wrapper for an element (with all of its attributes, regardless of the order in which they are declared)
     * that has a replace-part attribute on it.
     *
     * This element will be lifted from the DOM just like a template controller.
     */
    class ReplacePartSymbol {
        constructor(name) {
            this.flags = 2 /* isReplacePart */;
            this.name = name;
            this.physicalNode = null;
            this.parent = null;
            this.template = null;
        }
    }
    /**
     * A html attribute that is associated with a registered resource, but not a template controller.
     */
    class CustomAttributeSymbol {
        get bindings() {
            if (this._bindings === null) {
                this._bindings = [];
                this.flags |= 4096 /* hasBindings */;
            }
            return this._bindings;
        }
        constructor(syntax, info) {
            this.flags = 4 /* isCustomAttribute */;
            this.res = info.name;
            this.syntax = syntax;
            this._bindings = null;
        }
    }
    /**
     * An attribute, with either a binding command or an interpolation, whose target is the html
     * attribute of the element.
     *
     * This will never target a bindable property of a custom attribute or element;
     */
    class PlainAttributeSymbol {
        constructor(syntax, command, expression) {
            this.flags = 8 /* isPlainAttribute */;
            this.syntax = syntax;
            this.command = command;
            this.expression = expression;
        }
    }
    /**
     * Either an attribute on an custom element that maps to a declared bindable property of that element,
     * a single-value bound custom attribute, or one of several bindables that were extracted from the attribute
     * value of a dynamicOptions custom attribute.
     *
     * This will always target a bindable property of a custom attribute or element;
     */
    class BindingSymbol {
        constructor(command, bindable, expression, rawValue, target) {
            this.flags = 256 /* isBinding */;
            this.command = command;
            this.bindable = bindable;
            this.expression = expression;
            this.rawValue = rawValue;
            this.target = target;
        }
    }
    /**
     * A html element that is associated with a registered resource either via its (lowerCase) `nodeName`
     * or the value of its `as-element` attribute.
     */
    class CustomElementSymbol {
        get attributes() {
            if (this._attributes === null) {
                this._attributes = [];
                this.flags |= 2048 /* hasAttributes */;
            }
            return this._attributes;
        }
        get bindings() {
            if (this._bindings === null) {
                this._bindings = [];
                this.flags |= 4096 /* hasBindings */;
            }
            return this._bindings;
        }
        get childNodes() {
            if (this._childNodes === null) {
                this._childNodes = [];
                this.flags |= 8192 /* hasChildNodes */;
            }
            return this._childNodes;
        }
        get parts() {
            if (this._parts === null) {
                this._parts = [];
                this.flags |= 16384 /* hasParts */;
            }
            return this._parts;
        }
        constructor(dom, node, info) {
            this.flags = 16 /* isCustomElement */;
            this.res = info.name;
            this.physicalNode = node;
            this.bindables = info.bindables;
            this.isTarget = true;
            this.templateController = null;
            if (info.containerless) {
                this.isContainerless = true;
                this.marker = createMarker(dom);
                this.flags |= 512 /* hasMarker */;
            }
            else {
                this.isContainerless = false;
                this.marker = null;
            }
            this._attributes = null;
            this._bindings = null;
            this._childNodes = null;
            this._parts = null;
        }
    }
    class LetElementSymbol {
        get bindings() {
            if (this._bindings === null) {
                this._bindings = [];
                this.flags |= 4096 /* hasBindings */;
            }
            return this._bindings;
        }
        constructor(dom, node) {
            this.flags = 32 /* isLetElement */ | 512 /* hasMarker */;
            this.physicalNode = node;
            this.toViewModel = false;
            this.marker = createMarker(dom);
            this._bindings = null;
        }
    }
    /**
     * A normal html element that may or may not have attribute behaviors and/or child node behaviors.
     *
     * It is possible for a PlainElementSymbol to not yield any instructions during compilation.
     */
    class PlainElementSymbol {
        get attributes() {
            if (this._attributes === null) {
                this._attributes = [];
                this.flags |= 2048 /* hasAttributes */;
            }
            return this._attributes;
        }
        get childNodes() {
            if (this._childNodes === null) {
                this._childNodes = [];
                this.flags |= 8192 /* hasChildNodes */;
            }
            return this._childNodes;
        }
        constructor(node) {
            this.flags = 64 /* isPlainElement */;
            this.physicalNode = node;
            this.isTarget = false;
            this.templateController = null;
            this._attributes = null;
            this._childNodes = null;
        }
    }
    /**
     * A standalone text node that has an interpolation.
     */
    class TextSymbol {
        constructor(dom, node, interpolation) {
            this.flags = 128 /* isText */ | 512 /* hasMarker */;
            this.physicalNode = node;
            this.interpolation = interpolation;
            this.marker = createMarker(dom);
        }
    }



    var index$2 = /*#__PURE__*/Object.freeze({
        AttrSyntax: AttrSyntax,
        IAttributeParser: IAttributeParser,
        AtPrefixedTriggerAttributePattern: AtPrefixedTriggerAttributePattern,
        attributePattern: attributePattern,
        ColonPrefixedBindAttributePattern: ColonPrefixedBindAttributePattern,
        DotSeparatedAttributePattern: DotSeparatedAttributePattern,
        IAttributePattern: IAttributePattern,
        Interpretation: Interpretation,
        ISyntaxInterpreter: ISyntaxInterpreter,
        RefAttributePattern: RefAttributePattern,
        bindingCommand: bindingCommand,
        BindingCommandResource: BindingCommandResource,
        CallBindingCommand: CallBindingCommand,
        DefaultBindingCommand: DefaultBindingCommand,
        ForBindingCommand: ForBindingCommand,
        FromViewBindingCommand: FromViewBindingCommand,
        getMode: getMode,
        getTarget: getTarget,
        OneTimeBindingCommand: OneTimeBindingCommand,
        ToViewBindingCommand: ToViewBindingCommand,
        TwoWayBindingCommand: TwoWayBindingCommand,
        JitConfiguration: JitConfiguration,
        ParserRegistration: ParserRegistration,
        parseExpression: parseExpression,
        ResourceModel: ResourceModel,
        BindableInfo: BindableInfo,
        ElementInfo: ElementInfo,
        AttrInfo: AttrInfo,
        BindingSymbol: BindingSymbol,
        CustomAttributeSymbol: CustomAttributeSymbol,
        CustomElementSymbol: CustomElementSymbol,
        LetElementSymbol: LetElementSymbol,
        PlainAttributeSymbol: PlainAttributeSymbol,
        PlainElementSymbol: PlainElementSymbol,
        ReplacePartSymbol: ReplacePartSymbol,
        TemplateControllerSymbol: TemplateControllerSymbol,
        TextSymbol: TextSymbol
    });

    class Listener {
        // tslint:disable-next-line:parameters-max-number
        constructor(dom, targetEvent, delegationStrategy, sourceExpression, target, preventDefault, eventManager, locator) {
            this.dom = dom;
            this.$nextBind = null;
            this.$prevBind = null;
            this.$state = 0 /* none */;
            this.delegationStrategy = delegationStrategy;
            this.locator = locator;
            this.preventDefault = preventDefault;
            this.sourceExpression = sourceExpression;
            this.target = target;
            this.targetEvent = targetEvent;
            this.eventManager = eventManager;
        }
        callSource(event) {
            const overrideContext = this.$scope.overrideContext;
            overrideContext.$event = event;
            const result = this.sourceExpression.evaluate(LifecycleFlags.mustEvaluate, this.$scope, this.locator);
            delete overrideContext.$event;
            if (result !== true && this.preventDefault) {
                event.preventDefault();
            }
            return result;
        }
        handleEvent(event) {
            this.callSource(event);
        }
        $bind(flags, scope) {
            if (this.$state & 2 /* isBound */) {
                if (this.$scope === scope) {
                    return;
                }
                this.$unbind(flags | LifecycleFlags.fromBind);
            }
            // add isBinding flag
            this.$state |= 1 /* isBinding */;
            this.$scope = scope;
            const sourceExpression = this.sourceExpression;
            if (hasBind(sourceExpression)) {
                sourceExpression.bind(flags, scope, this);
            }
            this.handler = this.eventManager.addEventListener(this.dom, this.target, this.targetEvent, this, this.delegationStrategy);
            // add isBound flag and remove isBinding flag
            this.$state |= 2 /* isBound */;
            this.$state &= ~1 /* isBinding */;
        }
        $unbind(flags) {
            if (!(this.$state & 2 /* isBound */)) {
                return;
            }
            // add isUnbinding flag
            this.$state |= 64 /* isUnbinding */;
            const sourceExpression = this.sourceExpression;
            if (hasUnbind(sourceExpression)) {
                sourceExpression.unbind(flags, this.$scope, this);
            }
            this.$scope = null;
            this.handler.dispose();
            this.handler = null;
            // remove isBound and isUnbinding flags
            this.$state &= ~(2 /* isBound */ | 64 /* isUnbinding */);
        }
        observeProperty(obj, propertyName) {
            return;
        }
        handleChange(newValue, previousValue, flags) {
            return;
        }
    }

    let AttributeNSAccessor = class AttributeNSAccessor {
        constructor(lifecycle, obj, propertyKey, attributeName, namespace) {
            this.isDOMObserver = true;
            this.attributeName = attributeName;
            this.lifecycle = lifecycle;
            this.obj = obj;
            this.oldValue = this.currentValue = this.getValue();
            this.propertyKey = propertyKey;
            this.namespace = namespace;
        }
        getValue() {
            return this.obj.getAttributeNS(this.namespace, this.attributeName);
        }
        setValueCore(newValue) {
            this.obj.setAttributeNS(this.namespace, this.attributeName, newValue);
        }
    };
    AttributeNSAccessor = __decorate([
        targetObserver('')
    ], AttributeNSAccessor);

    const handleEventFlags = LifecycleFlags.fromDOMEvent | LifecycleFlags.updateSourceExpression;
    const defaultHandleBatchedChangeFlags = LifecycleFlags.fromFlush | LifecycleFlags.updateTargetInstance;
    const defaultMatcher = (a, b) => {
        return a === b;
    };
    let CheckedObserver = class CheckedObserver {
        constructor(lifecycle, obj, handler, observerLocator) {
            this.isDOMObserver = true;
            this.handler = handler;
            this.lifecycle = lifecycle;
            this.obj = obj;
            this.observerLocator = observerLocator;
        }
        getValue() {
            return this.currentValue;
        }
        setValueCore(newValue, flags) {
            if (!this.valueObserver) {
                this.valueObserver = this.obj['$observers'] && (this.obj['$observers'].model || this.obj['$observers'].value);
                if (this.valueObserver) {
                    this.valueObserver.subscribe(this);
                }
            }
            if (this.arrayObserver) {
                this.arrayObserver.unsubscribeBatched(this);
                this.arrayObserver = null;
            }
            if (this.obj.type === 'checkbox' && Array.isArray(newValue)) {
                this.arrayObserver = this.observerLocator.getArrayObserver(newValue);
                this.arrayObserver.subscribeBatched(this);
            }
            this.synchronizeElement();
        }
        // handleBatchedCollectionChange (todo: rename to make this explicit?)
        handleBatchedChange() {
            this.synchronizeElement();
            this.notify(defaultHandleBatchedChangeFlags);
        }
        // handlePropertyChange (todo: rename normal subscribe methods in target observers to batched, since that's what they really are)
        handleChange(newValue, previousValue, flags) {
            this.synchronizeElement();
            this.notify(flags);
        }
        synchronizeElement() {
            const value = this.currentValue;
            const element = this.obj;
            const elementValue = element.hasOwnProperty('model') ? element['model'] : element.value;
            const isRadio = element.type === 'radio';
            const matcher = element['matcher'] || defaultMatcher;
            if (isRadio) {
                element.checked = !!matcher(value, elementValue);
            }
            else if (value === true) {
                element.checked = true;
            }
            else if (Array.isArray(value)) {
                element.checked = value.findIndex(item => !!matcher(item, elementValue)) !== -1;
            }
            else {
                element.checked = false;
            }
        }
        notify(flags) {
            if (flags & LifecycleFlags.fromBind) {
                return;
            }
            const oldValue = this.oldValue;
            const newValue = this.currentValue;
            if (newValue === oldValue) {
                return;
            }
            this.callSubscribers(this.currentValue, this.oldValue, flags);
        }
        handleEvent() {
            let value = this.currentValue;
            const element = this.obj;
            const elementValue = element.hasOwnProperty('model') ? element['model'] : element.value;
            let index;
            const matcher = element['matcher'] || defaultMatcher;
            if (element.type === 'checkbox') {
                if (Array.isArray(value)) {
                    index = value.findIndex(item => !!matcher(item, elementValue));
                    if (element.checked && index === -1) {
                        value.push(elementValue);
                    }
                    else if (!element.checked && index !== -1) {
                        value.splice(index, 1);
                    }
                    // when existing value is array, do not invoke callback as only the array element has changed
                    return;
                }
                value = element.checked;
            }
            else if (element.checked) {
                value = elementValue;
            }
            else {
                return;
            }
            this.oldValue = this.currentValue;
            this.currentValue = value;
            this.notify(handleEventFlags);
        }
        subscribe(subscriber) {
            if (!this.hasSubscribers()) {
                this.handler.subscribe(this.obj, this);
            }
            this.addSubscriber(subscriber);
        }
        unsubscribe(subscriber) {
            if (this.removeSubscriber(subscriber) && !this.hasSubscribers()) {
                this.handler.dispose();
            }
        }
        unbind() {
            if (this.arrayObserver) {
                this.arrayObserver.unsubscribeBatched(this);
                this.arrayObserver = null;
            }
            if (this.valueObserver) {
                this.valueObserver.unsubscribe(this);
            }
        }
    };
    CheckedObserver = __decorate([
        targetObserver()
    ], CheckedObserver);

    let ClassAttributeAccessor = class ClassAttributeAccessor {
        constructor(lifecycle, obj) {
            this.isDOMObserver = true;
            this.doNotCache = true;
            this.lifecycle = lifecycle;
            this.nameIndex = null;
            this.obj = obj;
            this.version = 0;
        }
        getValue() {
            return this.currentValue;
        }
        setValueCore(newValue) {
            const nameIndex = this.nameIndex || {};
            let version = this.version;
            let names;
            let name;
            // Add the classes, tracking the version at which they were added.
            if (newValue.length) {
                const node = this.obj;
                names = newValue.split(/\s+/);
                for (let i = 0, length = names.length; i < length; i++) {
                    name = names[i];
                    if (!name.length) {
                        continue;
                    }
                    nameIndex[name] = version;
                    node.classList.add(name);
                }
            }
            // Update state variables.
            this.nameIndex = nameIndex;
            this.version += 1;
            // First call to setValue?  We're done.
            if (version === 0) {
                return;
            }
            // Remove classes from previous version.
            version -= 1;
            for (name in nameIndex) {
                if (!nameIndex.hasOwnProperty(name) || nameIndex[name] !== version) {
                    continue;
                }
                // TODO: this has the side-effect that classes already present which are added again,
                // will be removed if they're not present in the next update.
                // Better would be do have some configurability for this behavior, allowing the user to
                // decide whether initial classes always need to be kept, always removed, or something in between
                this.obj.classList.remove(name);
            }
        }
    };
    ClassAttributeAccessor = __decorate([
        targetObserver('')
    ], ClassAttributeAccessor);

    let DataAttributeAccessor = class DataAttributeAccessor {
        constructor(lifecycle, obj, propertyKey) {
            this.isDOMObserver = true;
            this.lifecycle = lifecycle;
            this.obj = obj;
            this.oldValue = this.currentValue = this.getValue();
            this.propertyKey = propertyKey;
        }
        getValue() {
            return this.obj.getAttribute(this.propertyKey);
        }
        setValueCore(newValue) {
            if (newValue === null) {
                this.obj.removeAttribute(this.propertyKey);
            }
            else {
                this.obj.setAttribute(this.propertyKey, newValue);
            }
        }
    };
    DataAttributeAccessor = __decorate([
        targetObserver()
    ], DataAttributeAccessor);

    let ElementPropertyAccessor = class ElementPropertyAccessor {
        constructor(lifecycle, obj, propertyKey) {
            this.isDOMObserver = true;
            this.lifecycle = lifecycle;
            this.obj = obj;
            this.propertyKey = propertyKey;
        }
        getValue() {
            return this.obj[this.propertyKey];
        }
        setValueCore(value) {
            this.obj[this.propertyKey] = value;
        }
    };
    ElementPropertyAccessor = __decorate([
        targetObserver('')
    ], ElementPropertyAccessor);

    //Note: path and deepPath are designed to handle v0 and v1 shadow dom specs respectively
    /** @internal */
    function findOriginalEventTarget(event) {
        return (event.composedPath && event.composedPath()[0]) || (event.deepPath && event.deepPath()[0]) || (event.path && event.path[0]) || event.target;
    }
    function stopPropagation() {
        this.standardStopPropagation();
        this.propagationStopped = true;
    }
    function handleCapturedEvent(event) {
        event.propagationStopped = false;
        let target = findOriginalEventTarget(event);
        const orderedCallbacks = [];
        /**
         * During capturing phase, event 'bubbles' down from parent. Needs to reorder callback from root down to target
         */
        while (target) {
            if (target.capturedCallbacks) {
                const callback = target.capturedCallbacks[event.type];
                if (callback) {
                    if (event.stopPropagation !== stopPropagation) {
                        event.standardStopPropagation = event.stopPropagation;
                        event.stopPropagation = stopPropagation;
                    }
                    orderedCallbacks.push(callback);
                }
            }
            target = target.parentNode;
        }
        for (let i = orderedCallbacks.length - 1; i >= 0 && !event.propagationStopped; i--) {
            const orderedCallback = orderedCallbacks[i];
            if ('handleEvent' in orderedCallback) {
                orderedCallback.handleEvent(event);
            }
            else {
                orderedCallback(event);
            }
        }
    }
    function handleDelegatedEvent(event) {
        event.propagationStopped = false;
        let target = findOriginalEventTarget(event);
        while (target && !event.propagationStopped) {
            if (target.delegatedCallbacks) {
                const callback = target.delegatedCallbacks[event.type];
                if (callback) {
                    if (event.stopPropagation !== stopPropagation) {
                        event.standardStopPropagation = event.stopPropagation;
                        event.stopPropagation = stopPropagation;
                    }
                    if ('handleEvent' in callback) {
                        callback.handleEvent(event);
                    }
                    else {
                        callback(event);
                    }
                }
            }
            target = target.parentNode;
        }
    }
    class ListenerTracker {
        constructor(dom, eventName, listener, capture) {
            this.dom = dom;
            this.capture = capture;
            this.count = 0;
            this.eventName = eventName;
            this.listener = listener;
        }
        increment() {
            this.count++;
            if (this.count === 1) {
                this.dom.addEventListener(this.eventName, this.listener, null, this.capture);
            }
        }
        decrement() {
            this.count--;
            if (this.count === 0) {
                this.dom.removeEventListener(this.eventName, this.listener, null, this.capture);
            }
        }
    }
    /**
     * Enable dispose() pattern for `delegate` & `capture` commands
     */
    class DelegateOrCaptureSubscription {
        constructor(entry, lookup, targetEvent, callback) {
            this.entry = entry;
            this.lookup = lookup;
            this.targetEvent = targetEvent;
            lookup[targetEvent] = callback;
        }
        dispose() {
            this.entry.decrement();
            this.lookup[this.targetEvent] = null;
        }
    }
    /**
     * Enable dispose() pattern for addEventListener for `trigger`
     */
    class TriggerSubscription {
        constructor(dom, target, targetEvent, callback) {
            this.dom = dom;
            this.target = target;
            this.targetEvent = targetEvent;
            this.callback = callback;
            dom.addEventListener(targetEvent, callback, target);
        }
        dispose() {
            this.dom.removeEventListener(this.targetEvent, this.callback, this.target);
        }
    }
    class EventSubscriber {
        constructor(dom, events) {
            this.dom = dom;
            this.events = events;
            this.target = null;
            this.handler = null;
        }
        subscribe(node, callbackOrListener) {
            this.target = node;
            this.handler = callbackOrListener;
            const add = this.dom.addEventListener;
            const events = this.events;
            for (let i = 0, ii = events.length; ii > i; ++i) {
                add(events[i], callbackOrListener, node);
            }
        }
        dispose() {
            const node = this.target;
            const callbackOrListener = this.handler;
            const events = this.events;
            const remove = this.dom.removeEventListener;
            for (let i = 0, ii = events.length; ii > i; ++i) {
                remove(events[i], callbackOrListener, node);
            }
            this.target = this.handler = null;
        }
    }
    const IEventManager = DI.createInterface('IEventManager').withDefault(x => x.singleton(EventManager));
    /** @internal */
    class EventManager {
        constructor() {
            this.elementHandlerLookup = {};
            this.delegatedHandlers = {};
            this.capturedHandlers = {};
        }
        addEventListener(dom, target, targetEvent, callbackOrListener, strategy) {
            let delegatedHandlers;
            let capturedHandlers;
            let handlerEntry;
            if (strategy === DelegationStrategy.bubbling) {
                delegatedHandlers = this.delegatedHandlers;
                handlerEntry = delegatedHandlers[targetEvent] || (delegatedHandlers[targetEvent] = new ListenerTracker(dom, targetEvent, handleDelegatedEvent, false));
                handlerEntry.increment();
                const delegatedCallbacks = target.delegatedCallbacks || (target.delegatedCallbacks = {});
                return new DelegateOrCaptureSubscription(handlerEntry, delegatedCallbacks, targetEvent, callbackOrListener);
            }
            if (strategy === DelegationStrategy.capturing) {
                capturedHandlers = this.capturedHandlers;
                handlerEntry = capturedHandlers[targetEvent] || (capturedHandlers[targetEvent] = new ListenerTracker(dom, targetEvent, handleCapturedEvent, true));
                handlerEntry.increment();
                const capturedCallbacks = target.capturedCallbacks || (target.capturedCallbacks = {});
                return new DelegateOrCaptureSubscription(handlerEntry, capturedCallbacks, targetEvent, callbackOrListener);
            }
            return new TriggerSubscription(dom, target, targetEvent, callbackOrListener);
        }
    }

    const handleEventFlags$1 = LifecycleFlags.fromDOMEvent | LifecycleFlags.updateSourceExpression;
    const childObserverOptions = {
        childList: true,
        subtree: true,
        characterData: true
    };
    function defaultMatcher$1(a, b) {
        return a === b;
    }
    let SelectValueObserver = class SelectValueObserver {
        constructor(lifecycle, obj, handler, observerLocator) {
            this.isDOMObserver = true;
            this.lifecycle = lifecycle;
            this.obj = obj;
            this.handler = handler;
            this.observerLocator = observerLocator;
        }
        getValue() {
            return this.currentValue;
        }
        setValueCore(newValue, flags) {
            const isArray = Array.isArray(newValue);
            if (!isArray && newValue !== null && newValue !== undefined && this.obj.multiple) {
                throw new Error('Only null or Array instances can be bound to a multi-select.');
            }
            if (this.arrayObserver) {
                this.arrayObserver.unsubscribeBatched(this);
                this.arrayObserver = null;
            }
            if (isArray) {
                this.arrayObserver = this.observerLocator.getArrayObserver(newValue);
                this.arrayObserver.subscribeBatched(this);
            }
            this.synchronizeOptions();
            this.notify(flags);
        }
        // called when the array mutated (items sorted/added/removed, etc)
        handleBatchedChange(indexMap) {
            // we don't need to go through the normal setValue logic and can directly call synchronizeOptions here,
            // because the change already waited one tick (batched) and there's no point in calling notify when the instance didn't change
            this.synchronizeOptions(indexMap);
        }
        // called when a different value was assigned
        handleChange(newValue, previousValue, flags) {
            this.setValue(newValue, flags);
        }
        notify(flags) {
            if (flags & LifecycleFlags.fromBind) {
                return;
            }
            const oldValue = this.oldValue;
            const newValue = this.currentValue;
            if (newValue === oldValue) {
                return;
            }
            this.callSubscribers(newValue, oldValue, flags);
        }
        handleEvent() {
            // "from-view" changes are always synchronous now, so immediately sync the value and notify subscribers
            const shouldNotify = this.synchronizeValue();
            if (shouldNotify) {
                this.notify(handleEventFlags$1);
            }
        }
        synchronizeOptions(indexMap) {
            const currentValue = this.currentValue;
            const isArray = Array.isArray(currentValue);
            const obj = this.obj;
            const matcher = obj.matcher || defaultMatcher$1;
            const options = obj.options;
            let i = options.length;
            while (i--) {
                const option = options[i];
                const optionValue = option.hasOwnProperty('model') ? option.model : option.value;
                if (isArray) {
                    option.selected = currentValue.findIndex(item => !!matcher(optionValue, item)) !== -1;
                    continue;
                }
                option.selected = !!matcher(optionValue, currentValue);
            }
        }
        synchronizeValue() {
            // Spec for synchronizing value from `SelectObserver` to `<select/>`
            // When synchronizing value to observed <select/> element, do the following steps:
            // A. If `<select/>` is multiple
            //    1. Check if current value, called `currentValue` is an array
            //      a. If not an array, return true to signal value has changed
            //      b. If is an array:
            //        i. gather all current selected <option/>, in to array called `values`
            //        ii. loop through the `currentValue` array and remove items that are nolonger selected based on matcher
            //        iii. loop through the `values` array and add items that are selected based on matcher
            //        iv. Return false to signal value hasn't changed
            // B. If the select is single
            //    1. Let `value` equal the first selected option, if no option selected, then `value` is `null`
            //    2. assign `this.currentValue` to `this.oldValue`
            //    3. assign `value` to `this.currentValue`
            //    4. return `true` to signal value has changed
            const obj = this.obj;
            const options = obj.options;
            const len = options.length;
            const currentValue = this.currentValue;
            let i = 0;
            if (obj.multiple) {
                // A.
                if (!Array.isArray(currentValue)) {
                    // A.1.a
                    return true;
                }
                // A.1.b
                // multi select
                let option;
                const matcher = obj.matcher || defaultMatcher$1;
                // A.1.b.i
                const values = [];
                while (i < len) {
                    option = options[i];
                    if (option.selected) {
                        values.push(option.hasOwnProperty('model')
                            ? option.model
                            : option.value);
                    }
                    ++i;
                }
                // A.1.b.ii
                i = 0;
                while (i < currentValue.length) {
                    const a = currentValue[i];
                    // Todo: remove arrow fn
                    if (values.findIndex(b => !!matcher(a, b)) === -1) {
                        currentValue.splice(i, 1);
                    }
                    else {
                        ++i;
                    }
                }
                // A.1.b.iii
                i = 0;
                while (i < values.length) {
                    const a = values[i];
                    // Todo: remove arrow fn
                    if (currentValue.findIndex(b => !!matcher(a, b)) === -1) {
                        currentValue.push(a);
                    }
                    ++i;
                }
                // A.1.b.iv
                return false;
            }
            // B. single select
            // B.1
            let value = null;
            while (i < len) {
                const option = options[i];
                if (option.selected) {
                    value = option.hasOwnProperty('model')
                        ? option.model
                        : option.value;
                    break;
                }
                ++i;
            }
            // B.2
            this.oldValue = this.currentValue;
            // B.3
            this.currentValue = value;
            // B.4
            return true;
        }
        subscribe(subscriber) {
            if (!this.hasSubscribers()) {
                this.handler.subscribe(this.obj, this);
            }
            this.addSubscriber(subscriber);
        }
        unsubscribe(subscriber) {
            if (this.removeSubscriber(subscriber) && !this.hasSubscribers()) {
                this.handler.dispose();
            }
        }
        bind() {
            this.nodeObserver = new MutationObserver(this.handleNodeChange.bind(this));
            this.nodeObserver.observe(this.obj, childObserverOptions);
        }
        unbind() {
            this.nodeObserver.disconnect();
            this.nodeObserver = null;
            if (this.arrayObserver) {
                this.arrayObserver.unsubscribeBatched(this);
                this.arrayObserver = null;
            }
        }
        handleNodeChange() {
            this.synchronizeOptions();
            const shouldNotify = this.synchronizeValue();
            if (shouldNotify) {
                this.notify(handleEventFlags$1);
            }
        }
    };
    SelectValueObserver = __decorate([
        targetObserver()
    ], SelectValueObserver);

    let StyleAttributeAccessor = class StyleAttributeAccessor {
        constructor(lifecycle, obj) {
            this.isDOMObserver = true;
            this.oldValue = this.currentValue = obj.style.cssText;
            this.lifecycle = lifecycle;
            this.obj = obj;
            this.styles = null;
            this.version = 0;
        }
        getValue() {
            return this.obj.style.cssText;
        }
        _setProperty(style, value) {
            let priority = '';
            if (value !== null && value !== undefined && typeof value.indexOf === 'function' && value.indexOf('!important') !== -1) {
                priority = 'important';
                value = value.replace('!important', '');
            }
            this.obj.style.setProperty(style, value, priority);
        }
        setValueCore(newValue) {
            const styles = this.styles || {};
            let style;
            let version = this.version;
            if (newValue !== null) {
                if (newValue instanceof Object) {
                    let value;
                    for (style in newValue) {
                        if (newValue.hasOwnProperty(style)) {
                            value = newValue[style];
                            style = style.replace(/([A-Z])/g, m => `-${m.toLowerCase()}`);
                            styles[style] = version;
                            this._setProperty(style, value);
                        }
                    }
                }
                else if (newValue.length) {
                    const rx = /\s*([\w\-]+)\s*:\s*((?:(?:[\w\-]+\(\s*(?:"(?:\\"|[^"])*"|'(?:\\'|[^'])*'|[\w\-]+\(\s*(?:[^"](?:\\"|[^"])*"|'(?:\\'|[^'])*'|[^\)]*)\),?|[^\)]*)\),?|"(?:\\"|[^"])*"|'(?:\\'|[^'])*'|[^;]*),?\s*)+);?/g;
                    let pair;
                    while ((pair = rx.exec(newValue)) !== null) {
                        style = pair[1];
                        if (!style) {
                            continue;
                        }
                        styles[style] = version;
                        this._setProperty(style, pair[2]);
                    }
                }
            }
            this.styles = styles;
            this.version += 1;
            if (version === 0) {
                return;
            }
            version -= 1;
            for (style in styles) {
                if (!styles.hasOwnProperty(style) || styles[style] !== version) {
                    continue;
                }
                this.obj.style.removeProperty(style);
            }
        }
    };
    StyleAttributeAccessor = __decorate([
        targetObserver()
    ], StyleAttributeAccessor);

    const inputValueDefaults = {
        ['button']: '',
        ['checkbox']: 'on',
        ['color']: '#000000',
        ['date']: '',
        ['datetime-local']: '',
        ['email']: '',
        ['file']: '',
        ['hidden']: '',
        ['image']: '',
        ['month']: '',
        ['number']: '',
        ['password']: '',
        ['radio']: 'on',
        ['range']: '50',
        ['reset']: '',
        ['search']: '',
        ['submit']: '',
        ['tel']: '',
        ['text']: '',
        ['time']: '',
        ['url']: '',
        ['week']: ''
    };
    const handleEventFlags$2 = LifecycleFlags.fromDOMEvent | LifecycleFlags.updateSourceExpression;
    let ValueAttributeObserver = class ValueAttributeObserver {
        constructor(lifecycle, obj, propertyKey, handler) {
            this.isDOMObserver = true;
            this.handler = handler;
            this.lifecycle = lifecycle;
            this.obj = obj;
            this.propertyKey = propertyKey;
            // note: input.files can be assigned and this was fixed in Firefox 57:
            // https://bugzilla.mozilla.org/show_bug.cgi?id=1384030
            // input.value (for type='file') however, can only be assigned an empty string
            if (propertyKey === 'value') {
                const nodeType = obj['type'];
                this.defaultValue = inputValueDefaults[nodeType || 'text'];
                if (nodeType === 'file') {
                    this.flush = this.flushFileChanges;
                }
            }
            else {
                this.defaultValue = '';
            }
            this.oldValue = this.currentValue = obj[propertyKey];
        }
        getValue() {
            return this.obj[this.propertyKey];
        }
        setValueCore(newValue, flags) {
            this.obj[this.propertyKey] = newValue;
            if (flags & LifecycleFlags.fromBind) {
                return;
            }
            this.callSubscribers(this.currentValue, this.oldValue, flags);
        }
        handleEvent() {
            const oldValue = this.oldValue = this.currentValue;
            const newValue = this.currentValue = this.getValue();
            if (oldValue !== newValue) {
                this.callSubscribers(newValue, oldValue, handleEventFlags$2);
                this.oldValue = newValue;
            }
        }
        subscribe(subscriber) {
            if (!this.hasSubscribers()) {
                this.oldValue = this.getValue();
                this.handler.subscribe(this.obj, this);
            }
            this.addSubscriber(subscriber);
        }
        unsubscribe(subscriber) {
            if (this.removeSubscriber(subscriber) && !this.hasSubscribers()) {
                this.handler.dispose();
            }
        }
        flushFileChanges() {
            const currentValue = this.currentValue;
            if (this.oldValue !== currentValue && currentValue === '') {
                this.setValueCore(currentValue, this.currentFlags);
                this.oldValue = this.currentValue;
            }
        }
    };
    ValueAttributeObserver = __decorate([
        targetObserver('')
    ], ValueAttributeObserver);

    const xlinkNS = 'http://www.w3.org/1999/xlink';
    const xmlNS = 'http://www.w3.org/XML/1998/namespace';
    const xmlnsNS = 'http://www.w3.org/2000/xmlns/';
    // https://html.spec.whatwg.org/multipage/syntax.html#attributes-2
    const nsAttributes = (function (o) {
        o['xlink:actuate'] = ['actuate', xlinkNS];
        o['xlink:arcrole'] = ['arcrole', xlinkNS];
        o['xlink:href'] = ['href', xlinkNS];
        o['xlink:role'] = ['role', xlinkNS];
        o['xlink:show'] = ['show', xlinkNS];
        o['xlink:title'] = ['title', xlinkNS];
        o['xlink:type'] = ['type', xlinkNS];
        o['xml:lang'] = ['lang', xmlNS];
        o['xml:space'] = ['space', xmlNS];
        o['xmlns'] = ['xmlns', xmlnsNS];
        o['xmlns:xlink'] = ['xlink', xmlnsNS];
        return o;
    })(Object.create(null));
    const inputEvents = ['change', 'input'];
    const selectEvents = ['change'];
    const contentEvents = ['change', 'input', 'blur', 'keyup', 'paste'];
    const scrollEvents = ['scroll'];
    const overrideProps = (function (o) {
        o['class'] = true;
        o['style'] = true;
        o['css'] = true;
        o['checked'] = true;
        o['value'] = true;
        o['model'] = true;
        o['xlink:actuate'] = true;
        o['xlink:arcrole'] = true;
        o['xlink:href'] = true;
        o['xlink:role'] = true;
        o['xlink:show'] = true;
        o['xlink:title'] = true;
        o['xlink:type'] = true;
        o['xml:lang'] = true;
        o['xml:space'] = true;
        o['xmlns'] = true;
        o['xmlns:xlink'] = true;
        return o;
    })(Object.create(null));
    class TargetObserverLocator {
        constructor(dom) {
            this.dom = dom;
        }
        getObserver(lifecycle, observerLocator, obj, propertyName) {
            switch (propertyName) {
                case 'checked':
                    return new CheckedObserver(lifecycle, obj, new EventSubscriber(this.dom, inputEvents), observerLocator);
                case 'value':
                    if (obj['tagName'] === 'SELECT') {
                        return new SelectValueObserver(lifecycle, obj, new EventSubscriber(this.dom, selectEvents), observerLocator);
                    }
                    return new ValueAttributeObserver(lifecycle, obj, propertyName, new EventSubscriber(this.dom, inputEvents));
                case 'files':
                    return new ValueAttributeObserver(lifecycle, obj, propertyName, new EventSubscriber(this.dom, inputEvents));
                case 'textContent':
                case 'innerHTML':
                    return new ValueAttributeObserver(lifecycle, obj, propertyName, new EventSubscriber(this.dom, contentEvents));
                case 'scrollTop':
                case 'scrollLeft':
                    return new ValueAttributeObserver(lifecycle, obj, propertyName, new EventSubscriber(this.dom, scrollEvents));
                case 'class':
                    return new ClassAttributeAccessor(lifecycle, obj);
                case 'style':
                case 'css':
                    return new StyleAttributeAccessor(lifecycle, obj);
                case 'model':
                    return new SetterObserver(obj, propertyName);
                case 'role':
                    return new DataAttributeAccessor(lifecycle, obj, propertyName);
                default:
                    if (nsAttributes[propertyName] !== undefined) {
                        const nsProps = nsAttributes[propertyName];
                        return new AttributeNSAccessor(lifecycle, obj, propertyName, nsProps[0], nsProps[1]);
                    }
                    const prefix = propertyName.slice(0, 5);
                    // https://html.spec.whatwg.org/multipage/dom.html#wai-aria
                    // https://html.spec.whatwg.org/multipage/dom.html#custom-data-attribute
                    if (prefix === 'aria-' || prefix === 'data-') {
                        return new DataAttributeAccessor(lifecycle, obj, propertyName);
                    }
            }
            return null;
        }
        overridesAccessor(obj, propertyName) {
            return overrideProps[propertyName] === true;
        }
        handles(obj) {
            return this.dom.isNodeInstance(obj);
        }
    }
    TargetObserverLocator.inject = [IDOM];
    class TargetAccessorLocator {
        constructor(dom) {
            this.dom = dom;
        }
        getAccessor(lifecycle, obj, propertyName) {
            switch (propertyName) {
                case 'textContent':
                    // note: this case is just an optimization (textContent is the most often used property)
                    return new ElementPropertyAccessor(lifecycle, obj, propertyName);
                case 'class':
                    return new ClassAttributeAccessor(lifecycle, obj);
                case 'style':
                case 'css':
                    return new StyleAttributeAccessor(lifecycle, obj);
                // TODO: there are (many) more situation where we want to default to DataAttributeAccessor,
                // but for now stick to what vCurrent does
                case 'src':
                case 'href':
                // https://html.spec.whatwg.org/multipage/dom.html#wai-aria
                case 'role':
                    return new DataAttributeAccessor(lifecycle, obj, propertyName);
                default:
                    if (nsAttributes[propertyName] !== undefined) {
                        const nsProps = nsAttributes[propertyName];
                        return new AttributeNSAccessor(lifecycle, obj, propertyName, nsProps[0], nsProps[1]);
                    }
                    const prefix = propertyName.slice(0, 5);
                    // https://html.spec.whatwg.org/multipage/dom.html#wai-aria
                    // https://html.spec.whatwg.org/multipage/dom.html#custom-data-attribute
                    if (prefix === 'aria-' || prefix === 'data-') {
                        return new DataAttributeAccessor(lifecycle, obj, propertyName);
                    }
                    return new ElementPropertyAccessor(lifecycle, obj, propertyName);
            }
        }
        handles(obj) {
            return this.dom.isNodeInstance(obj);
        }
    }
    TargetAccessorLocator.inject = [IDOM];

    const ISVGAnalyzer = DI.createInterface('ISVGAnalyzer').withDefault(x => x.singleton(class {
        isStandardSvgAttribute(node, attributeName) {
            return false;
        }
    }));

    class AttrBindingBehavior {
        bind(flags, scope, binding) {
            binding.targetObserver = new DataAttributeAccessor(binding.locator.get(ILifecycle), binding.target, binding.targetProperty);
        }
        unbind(flags, scope, binding) {
            return;
        }
    }
    BindingBehaviorResource.define('attr', AttrBindingBehavior);

    /** @internal */
    function handleSelfEvent(event) {
        const target = findOriginalEventTarget(event);
        if (this.target !== target) {
            return;
        }
        return this.selfEventCallSource(event);
    }
    class SelfBindingBehavior {
        bind(flags, scope, binding) {
            if (!binding.callSource || !binding.targetEvent) {
                throw Reporter.error(8);
            }
            binding.selfEventCallSource = binding.callSource;
            binding.callSource = handleSelfEvent;
        }
        unbind(flags, scope, binding) {
            binding.callSource = binding.selfEventCallSource;
            binding.selfEventCallSource = null;
        }
    }
    BindingBehaviorResource.define('self', SelfBindingBehavior);

    class UpdateTriggerBindingBehavior {
        constructor(observerLocator) {
            this.observerLocator = observerLocator;
        }
        bind(flags, scope, binding, ...events) {
            if (events.length === 0) {
                throw Reporter.error(9);
            }
            if (binding.mode !== BindingMode.twoWay && binding.mode !== BindingMode.fromView) {
                throw Reporter.error(10);
            }
            // ensure the binding's target observer has been set.
            const targetObserver$$1 = this.observerLocator.getObserver(binding.target, binding.targetProperty);
            if (!targetObserver$$1.handler) {
                throw Reporter.error(10);
            }
            binding.targetObserver = targetObserver$$1;
            // stash the original element subscribe function.
            targetObserver$$1.originalHandler = binding.targetObserver.handler;
            // replace the element subscribe function with one that uses the correct events.
            targetObserver$$1.handler = new EventSubscriber(binding.locator.get(IDOM), events);
        }
        unbind(flags, scope, binding) {
            // restore the state of the binding.
            binding.targetObserver.handler.dispose();
            binding.targetObserver.handler = binding.targetObserver.originalHandler;
            binding.targetObserver.originalHandler = null;
        }
    }
    UpdateTriggerBindingBehavior.inject = [IObserverLocator];
    BindingBehaviorResource.define('updateTrigger', UpdateTriggerBindingBehavior);

    function isHTMLTargetedInstruction(value) {
        const type = value.type;
        return typeof type === 'string' && type.length === 2;
    }

    class TextBindingInstruction {
        constructor(from) {
            this.type = "ha" /* textBinding */;
            this.from = from;
        }
    }
    class TriggerBindingInstruction {
        constructor(from, to) {
            this.type = "hb" /* listenerBinding */;
            this.from = from;
            this.preventDefault = true;
            this.strategy = DelegationStrategy.none;
            this.to = to;
        }
    }
    class DelegateBindingInstruction {
        constructor(from, to) {
            this.type = "hb" /* listenerBinding */;
            this.from = from;
            this.preventDefault = false;
            this.strategy = DelegationStrategy.bubbling;
            this.to = to;
        }
    }
    class CaptureBindingInstruction {
        constructor(from, to) {
            this.type = "hb" /* listenerBinding */;
            this.from = from;
            this.preventDefault = false;
            this.strategy = DelegationStrategy.capturing;
            this.to = to;
        }
    }
    class StylePropertyBindingInstruction {
        constructor(from, to) {
            this.type = "hc" /* stylePropertyBinding */;
            this.from = from;
            this.to = to;
        }
    }
    class SetAttributeInstruction {
        constructor(value, to) {
            this.type = "hd" /* setAttribute */;
            this.to = to;
            this.value = value;
        }
    }

    function createElement(dom, tagOrType, props, children) {
        if (typeof tagOrType === 'string') {
            return createElementForTag(dom, tagOrType, props, children);
        }
        else {
            return createElementForType(dom, tagOrType, props, children);
        }
    }
    class RenderPlan {
        constructor(dom, node, instructions, dependencies) {
            this.dom = dom;
            this.dependencies = dependencies;
            this.instructions = instructions;
            this.node = node;
        }
        get definition() {
            return this.lazyDefinition || (this.lazyDefinition =
                buildTemplateDefinition(null, null, this.node, null, typeof this.node === 'string', null, this.instructions, this.dependencies));
        }
        getElementTemplate(engine, Type) {
            return engine.getElementTemplate(this.dom, this.definition, null, Type);
        }
        createView(engine, parentContext) {
            return this.getViewFactory(engine, parentContext).create();
        }
        getViewFactory(engine, parentContext) {
            return engine.getViewFactory(this.dom, this.definition, parentContext);
        }
        /** @internal */
        mergeInto(parent, instructions, dependencies) {
            this.dom.appendChild(parent, this.node);
            instructions.push(...this.instructions);
            dependencies.push(...this.dependencies);
        }
    }
    function createElementForTag(dom, tagName, props, children) {
        const instructions = [];
        const allInstructions = [];
        const dependencies = [];
        const element = dom.createElement(tagName);
        let hasInstructions = false;
        if (props) {
            Object.keys(props)
                .forEach(to => {
                const value = props[to];
                if (isHTMLTargetedInstruction(value)) {
                    hasInstructions = true;
                    instructions.push(value);
                }
                else {
                    dom.setAttribute(element, to, value);
                }
            });
        }
        if (hasInstructions) {
            dom.makeTarget(element);
            allInstructions.push(instructions);
        }
        if (children) {
            addChildren(dom, element, children, allInstructions, dependencies);
        }
        return new RenderPlan(dom, element, allInstructions, dependencies);
    }
    function createElementForType(dom, Type, props, children) {
        const tagName = Type.description.name;
        const instructions = [];
        const allInstructions = [instructions];
        const dependencies = [];
        const childInstructions = [];
        const bindables = Type.description.bindables;
        const element = dom.createElement(tagName);
        dom.makeTarget(element);
        if (!dependencies.includes(Type)) {
            dependencies.push(Type);
        }
        instructions.push(new HydrateElementInstruction(tagName, childInstructions));
        if (props) {
            Object.keys(props)
                .forEach(to => {
                const value = props[to];
                if (isHTMLTargetedInstruction(value)) {
                    childInstructions.push(value);
                }
                else {
                    const bindable$$1 = bindables[to];
                    if (bindable$$1) {
                        childInstructions.push({
                            type: "re" /* setProperty */,
                            to,
                            value
                        });
                    }
                    else {
                        childInstructions.push(new SetAttributeInstruction(value, to));
                    }
                }
            });
        }
        if (children) {
            addChildren(dom, element, children, allInstructions, dependencies);
        }
        return new RenderPlan(dom, element, allInstructions, dependencies);
    }
    function addChildren(dom, parent, children, allInstructions, dependencies) {
        for (let i = 0, ii = children.length; i < ii; ++i) {
            const current = children[i];
            switch (typeof current) {
                case 'string':
                    dom.appendChild(parent, dom.createTextNode(current));
                    break;
                case 'object':
                    if (dom.isNodeInstance(current)) {
                        dom.appendChild(parent, current);
                    }
                    else if ('mergeInto' in current) {
                        current.mergeInto(parent, allInstructions, dependencies);
                    }
            }
        }
    }

    const composeSource = {
        name: 'au-compose',
        containerless: true
    };
    const composeProps = ['subject', 'composing'];
    class Compose {
        constructor(dom, renderable, instruction, renderingEngine, coordinator) {
            this.dom = dom;
            this.subject = null;
            this.composing = false;
            this.coordinator = coordinator;
            this.lastSubject = null;
            this.renderable = renderable;
            this.renderingEngine = renderingEngine;
            this.coordinator.onSwapComplete = () => {
                this.composing = false;
            };
            this.properties = instruction.instructions
                .filter((x) => !composeProps.includes(x.to))
                .reduce((acc, item) => {
                if (item.to) {
                    acc[item.to] = item;
                }
                return acc;
            }, {});
        }
        binding(flags) {
            this.startComposition(this.subject, null, flags);
            this.coordinator.binding(flags, this.$scope);
        }
        attaching(flags) {
            this.coordinator.attaching(flags);
        }
        detaching(flags) {
            this.coordinator.detaching(flags);
        }
        unbinding(flags) {
            this.lastSubject = null;
            this.coordinator.unbinding(flags);
        }
        caching(flags) {
            this.coordinator.caching(flags);
        }
        subjectChanged(newValue, previousValue, flags) {
            this.startComposition(newValue, previousValue, flags);
        }
        startComposition(subject, _previousSubject, flags) {
            if (this.lastSubject === subject) {
                return;
            }
            this.lastSubject = subject;
            if (subject instanceof Promise) {
                subject = subject.then(x => this.resolveView(x, flags));
            }
            else {
                subject = this.resolveView(subject, flags);
            }
            this.composing = true;
            this.coordinator.compose(subject, flags);
        }
        resolveView(subject, flags) {
            const view = this.provideViewFor(subject);
            if (view) {
                view.hold(this.$projector.host);
                view.lockScope(this.renderable.$scope);
                return view;
            }
            return null;
        }
        provideViewFor(subject) {
            if (!subject) {
                return null;
            }
            if ('lockScope' in subject) { // IView
                return subject;
            }
            if ('createView' in subject) { // RenderPlan
                return subject.createView(this.renderingEngine, this.renderable.$context);
            }
            if ('create' in subject) { // IViewFactory
                return subject.create();
            }
            if ('template' in subject) { // Raw Template Definition
                return this.renderingEngine.getViewFactory(this.dom, subject, this.renderable.$context).create();
            }
            // Constructable (Custom Element Constructor)
            return createElement(this.dom, subject, this.properties, this.$projector.children).createView(this.renderingEngine, this.renderable.$context);
        }
    }
    Compose.inject = [IDOM, IRenderable, ITargetedInstruction, IRenderingEngine, CompositionCoordinator];
    __decorate([
        bindable
    ], Compose.prototype, "subject", void 0);
    __decorate([
        bindable
    ], Compose.prototype, "composing", void 0);
    CustomElementResource.define(composeSource, Compose);

    function isRenderLocation(node) {
        return node.textContent === 'au-end';
    }
    class HTMLDOM {
        constructor(doc) {
            this.doc = doc;
        }
        addEventListener(eventName, subscriber, publisher, options) {
            (publisher || this.doc).addEventListener(eventName, subscriber, options);
        }
        appendChild(parent, child) {
            parent.appendChild(child);
        }
        cloneNode(node, deep) {
            return node.cloneNode(deep !== false);
        }
        convertToRenderLocation(node) {
            if (this.isRenderLocation(node)) {
                return node; // it's already a IRenderLocation (converted by FragmentNodeSequence)
            }
            if (node.parentNode === null) {
                throw Reporter.error(52);
            }
            const locationEnd = this.doc.createComment('au-end');
            const locationStart = this.doc.createComment('au-start');
            node.parentNode.replaceChild(locationEnd, node);
            locationEnd.parentNode.insertBefore(locationStart, locationEnd);
            locationEnd.$start = locationStart;
            locationStart.$nodes = null;
            return locationEnd;
        }
        createDocumentFragment(markupOrNode) {
            if (markupOrNode === undefined || markupOrNode === null) {
                return this.doc.createDocumentFragment();
            }
            if (this.isNodeInstance(markupOrNode)) {
                if (markupOrNode.content !== undefined) {
                    return markupOrNode.content;
                }
                const fragment = this.doc.createDocumentFragment();
                fragment.appendChild(markupOrNode);
                return fragment;
            }
            return this.createTemplate(markupOrNode).content;
        }
        createElement(name) {
            return this.doc.createElement(name);
        }
        createTemplate(markup) {
            if (markup === undefined || markup === null) {
                return this.doc.createElement('template');
            }
            const template = this.doc.createElement('template');
            template.innerHTML = markup.toString();
            return template;
        }
        createTextNode(text) {
            return this.doc.createTextNode(text);
        }
        insertBefore(nodeToInsert, referenceNode) {
            referenceNode.parentNode.insertBefore(nodeToInsert, referenceNode);
        }
        isMarker(node) {
            return node.nodeName === 'AU-M';
        }
        isNodeInstance(potentialNode) {
            return potentialNode.nodeType > 0;
        }
        isRenderLocation(node) {
            return node.textContent === 'au-end';
        }
        makeTarget(node) {
            node.className = 'au';
        }
        registerElementResolver(container, resolver) {
            container.registerResolver(INode, resolver);
            container.registerResolver(Node, resolver);
            container.registerResolver(Element, resolver);
            container.registerResolver(HTMLElement, resolver);
            container.registerResolver(SVGElement, resolver);
        }
        remove(node) {
            if (node.remove) {
                node.remove();
            }
            else {
                node.parentNode.removeChild(node);
            }
        }
        removeEventListener(eventName, subscriber, publisher, options) {
            (publisher || this.doc).removeEventListener(eventName, subscriber, options);
        }
        setAttribute(node, name, value) {
            node.setAttribute(name, value);
        }
    }
    /**
     * A specialized INodeSequence with optimizations for text (interpolation) bindings
     * The contract of this INodeSequence is:
     * - the previous element is an `au-m` node
     * - text is the actual text node
     */
    /** @internal */
    class TextNodeSequence {
        constructor(dom, text) {
            this.dom = dom;
            this.firstChild = text;
            this.lastChild = text;
            this.childNodes = [text];
            this.targets = [new AuMarker(text)];
        }
        findTargets() {
            return this.targets;
        }
        insertBefore(refNode) {
            refNode.parentNode.insertBefore(this.firstChild, refNode);
        }
        appendTo(parent) {
            parent.appendChild(this.firstChild);
        }
        remove() {
            this.firstChild.remove();
        }
    }
    // tslint:enable:no-any
    // This is the most common form of INodeSequence.
    // Every custom element or template controller whose node sequence is based on an HTML template
    // has an instance of this under the hood. Anyone who wants to create a node sequence from
    // a string of markup would also receive an instance of this.
    // CompiledTemplates create instances of FragmentNodeSequence.
    /** @internal */
    class FragmentNodeSequence {
        constructor(dom, fragment) {
            this.dom = dom;
            this.fragment = fragment;
            // tslint:disable-next-line:no-any
            const targetNodeList = fragment.querySelectorAll('.au');
            let i = 0;
            let ii = targetNodeList.length;
            const targets = this.targets = Array(ii);
            while (i < ii) {
                // eagerly convert all markers to RenderLocations (otherwise the renderer
                // will do it anyway) and store them in the target list (since the comments
                // can't be queried)
                const target = targetNodeList[i];
                if (target.nodeName === 'AU-M') {
                    // note the renderer will still call this method, but it will just return the
                    // location if it sees it's already a location
                    targets[i] = this.dom.convertToRenderLocation(target);
                }
                else {
                    // also store non-markers for consistent ordering
                    targets[i] = target;
                }
                ++i;
            }
            const childNodeList = fragment.childNodes;
            i = 0;
            ii = childNodeList.length;
            const childNodes = this.childNodes = Array(ii);
            while (i < ii) {
                childNodes[i] = childNodeList[i];
                ++i;
            }
            this.firstChild = fragment.firstChild;
            this.lastChild = fragment.lastChild;
            this.start = this.end = null;
        }
        findTargets() {
            return this.targets;
        }
        insertBefore(refNode) {
            // tslint:disable-next-line:no-any
            refNode.parentNode.insertBefore(this.fragment, refNode);
            // internally we could generally assume that this is an IRenderLocation,
            // but since this is also public API we still need to double check
            // (or horrible things might happen)
            if (isRenderLocation(refNode)) {
                this.end = refNode;
                const start = this.start = refNode.$start;
                if (start.$nodes === null) {
                    start.$nodes = this;
                }
                else {
                    // if more than one INodeSequence uses the same IRenderLocation, it's an child
                    // of a repeater (or something similar) and we shouldn't remove all nodes between
                    // start - end since that would always remove all items from a repeater, even
                    // when only one is removed
                    // so we set $nodes to PLATFORM.emptyObject to 1) tell other sequences that it's
                    // occupied and 2) prevent start.$nodes === this from ever evaluating to true
                    // during remove()
                    start.$nodes = PLATFORM.emptyObject;
                }
            }
        }
        appendTo(parent) {
            // tslint:disable-next-line:no-any
            parent.appendChild(this.fragment);
            // this can never be a IRenderLocation, and if for whatever reason we moved
            // from a IRenderLocation to a host, make sure "start" and "end" are null
            this.start = this.end = null;
        }
        remove() {
            const fragment = this.fragment;
            if (this.start !== null && this.start.$nodes === this) {
                // if we're between a valid "start" and "end" (e.g. if/else, containerless, or a
                // repeater with a single item) then simply remove everything in-between (but not
                // the comments themselves as they belong to the parent)
                const end = this.end;
                let next;
                let current = this.start.nextSibling;
                while (current !== end) {
                    next = current.nextSibling;
                    // tslint:disable-next-line:no-any
                    fragment.appendChild(current);
                    current = next;
                }
                this.start.$nodes = null;
                this.start = this.end = null;
            }
            else {
                // otherwise just remove from first to last child in the regular way
                let current = this.firstChild;
                if (current.parentNode !== fragment) {
                    const end = this.lastChild;
                    let next;
                    while (current !== null) {
                        next = current.nextSibling;
                        // tslint:disable-next-line:no-any
                        fragment.appendChild(current);
                        if (current === end) {
                            break;
                        }
                        current = next;
                    }
                }
            }
        }
    }
    /** @internal */
    class NodeSequenceFactory {
        constructor(dom, markupOrNode) {
            this.dom = dom;
            const fragment = dom.createDocumentFragment(markupOrNode);
            const childNodes = fragment.childNodes;
            switch (childNodes.length) {
                case 0:
                    this.createNodeSequence = () => NodeSequence.empty;
                    return;
                case 2:
                    const target = childNodes[0];
                    if (target.nodeName === 'AU-M' || target.nodeName === '#comment') {
                        const text = childNodes[1];
                        if (text.nodeType === 3 /* Text */ && text.textContent.length === 0) {
                            this.deepClone = false;
                            this.node = text;
                            this.Type = TextNodeSequence;
                            return;
                        }
                    }
                // falls through if not returned
                default:
                    this.deepClone = true;
                    this.node = fragment;
                    this.Type = FragmentNodeSequence;
            }
        }
        createNodeSequence() {
            return new this.Type(this.dom, this.node.cloneNode(this.deepClone));
        }
    }
    /** @internal */
    class AuMarker {
        get parentNode() {
            return this.nextSibling.parentNode;
        }
        constructor(next) {
            this.nextSibling = next;
            this.textContent = '';
        }
        remove() { }
    }
    (proto => {
        proto.previousSibling = null;
        proto.childNodes = PLATFORM.emptyArray;
        proto.nodeName = 'AU-M';
        proto.nodeType = 1 /* Element */;
    })(AuMarker.prototype);
    /** @internal */
    class HTMLDOMInitializer {
        constructor(container) {
            this.container = container;
        }
        /**
         * Either create a new HTML `DOM` backed by the supplied `document` or uses the supplied `DOM` directly.
         *
         * If no argument is provided, uses the default global `document` variable.
         * (this will throw an error in non-browser environments).
         */
        initialize(config) {
            if (this.container.has(IDOM, false)) {
                return this.container.get(IDOM);
            }
            let dom;
            if (config !== undefined) {
                if (config.dom !== undefined) {
                    dom = config.dom;
                }
                else if (config.host.ownerDocument !== null) {
                    dom = new HTMLDOM(config.host.ownerDocument);
                }
                else {
                    dom = new HTMLDOM(document);
                }
            }
            else {
                dom = new HTMLDOM(document);
            }
            Registration.instance(IDOM, dom).register(this.container, IDOM);
            return dom;
        }
    }
    HTMLDOMInitializer.inject = [IContainer];
    /** @internal */
    class HTMLTemplateFactory {
        constructor(dom) {
            this.dom = dom;
        }
        create(parentRenderContext, definition) {
            return new CompiledTemplate(this.dom, definition, new NodeSequenceFactory(this.dom, definition.template), parentRenderContext);
        }
    }
    HTMLTemplateFactory.inject = [IDOM];

    let TextBindingRenderer = 
    /** @internal */
    class TextBindingRenderer {
        constructor(parser, observerLocator) {
            this.parser = parser;
            this.observerLocator = observerLocator;
        }
        render(dom, context, renderable, target, instruction) {
            const next = target.nextSibling;
            if (dom.isMarker(target)) {
                dom.remove(target);
            }
            let bindable$$1;
            const expr = ensureExpression(this.parser, instruction.from, 2048 /* Interpolation */);
            if (expr.isMulti) {
                bindable$$1 = new MultiInterpolationBinding(this.observerLocator, expr, next, 'textContent', BindingMode.toView, context);
            }
            else {
                bindable$$1 = new InterpolationBinding(expr.firstExpression, expr, next, 'textContent', BindingMode.toView, this.observerLocator, context, true);
            }
            addBindable(renderable, bindable$$1);
        }
    };
    TextBindingRenderer.inject = [IExpressionParser, IObserverLocator];
    TextBindingRenderer = __decorate([
        instructionRenderer("ha" /* textBinding */)
        /** @internal */
    ], TextBindingRenderer);
    let ListenerBindingRenderer = 
    /** @internal */
    class ListenerBindingRenderer {
        constructor(parser, eventManager) {
            this.parser = parser;
            this.eventManager = eventManager;
        }
        render(dom, context, renderable, target, instruction) {
            const expr = ensureExpression(this.parser, instruction.from, 80 /* IsEventCommand */ | (instruction.strategy + 6 /* DelegationStrategyDelta */));
            const bindable$$1 = new Listener(dom, instruction.to, instruction.strategy, expr, target, instruction.preventDefault, this.eventManager, context);
            addBindable(renderable, bindable$$1);
        }
    };
    ListenerBindingRenderer.inject = [IExpressionParser, IEventManager];
    ListenerBindingRenderer = __decorate([
        instructionRenderer("hb" /* listenerBinding */)
        /** @internal */
    ], ListenerBindingRenderer);
    let SetAttributeRenderer = 
    /** @internal */
    class SetAttributeRenderer {
        render(dom, context, renderable, target, instruction) {
            target.setAttribute(instruction.to, instruction.value);
        }
    };
    SetAttributeRenderer = __decorate([
        instructionRenderer("hd" /* setAttribute */)
        /** @internal */
    ], SetAttributeRenderer);
    let StylePropertyBindingRenderer = 
    /** @internal */
    class StylePropertyBindingRenderer {
        constructor(parser, observerLocator) {
            this.parser = parser;
            this.observerLocator = observerLocator;
        }
        render(dom, context, renderable, target, instruction) {
            const expr = ensureExpression(this.parser, instruction.from, 48 /* IsPropertyCommand */ | BindingMode.toView);
            const bindable$$1 = new Binding(expr, target.style, instruction.to, BindingMode.toView, this.observerLocator, context);
            addBindable(renderable, bindable$$1);
        }
    };
    StylePropertyBindingRenderer.inject = [IExpressionParser, IObserverLocator];
    StylePropertyBindingRenderer = __decorate([
        instructionRenderer("hc" /* stylePropertyBinding */)
        /** @internal */
    ], StylePropertyBindingRenderer);
    const HTMLRenderer = {
        register(container) {
            container.register(TextBindingRenderer, ListenerBindingRenderer, SetAttributeRenderer, StylePropertyBindingRenderer);
        }
    };

    const defaultShadowOptions$1 = {
        mode: 'open'
    };
    class HTMLProjectorLocator {
        getElementProjector(dom, $component, host, def) {
            if (def.shadowOptions || def.hasSlots) {
                if (def.containerless) {
                    throw Reporter.error(21);
                }
                return new ShadowDOMProjector($component, host, def);
            }
            if (def.containerless) {
                return new ContainerlessProjector(dom, $component, host);
            }
            return new HostProjector($component, host);
        }
    }
    const childObserverOptions$1 = { childList: true };
    /** @internal */
    class ShadowDOMProjector {
        constructor($customElement, host, definition) {
            this.host = host;
            let shadowOptions;
            if (definition.shadowOptions !== undefined &&
                definition.shadowOptions !== null &&
                typeof definition.shadowOptions === 'object' &&
                'mode' in definition.shadowOptions) {
                shadowOptions = definition.shadowOptions;
            }
            else {
                shadowOptions = defaultShadowOptions$1;
            }
            this.shadowRoot = host.attachShadow(shadowOptions);
            this.host.$customElement = $customElement;
            this.shadowRoot.$customElement = $customElement;
        }
        get children() {
            return this.shadowRoot.childNodes;
        }
        subscribeToChildrenChange(callback) {
            // TODO: add a way to dispose/disconnect
            const observer = new MutationObserver(callback);
            observer.observe(this.shadowRoot, childObserverOptions$1);
        }
        provideEncapsulationSource() {
            return this.shadowRoot;
        }
        project(nodes) {
            nodes.appendTo(this.shadowRoot);
        }
        take(nodes) {
            nodes.remove();
        }
    }
    /** @internal */
    class ContainerlessProjector {
        constructor(dom, $customElement, host) {
            if (host.childNodes.length) {
                this.childNodes = PLATFORM.toArray(host.childNodes);
            }
            else {
                this.childNodes = PLATFORM.emptyArray;
            }
            this.host = dom.convertToRenderLocation(host);
            this.host.$customElement = $customElement;
        }
        get children() {
            return this.childNodes;
        }
        subscribeToChildrenChange(callback) {
            // TODO: add a way to dispose/disconnect
            const observer = new MutationObserver(callback);
            observer.observe(this.host, childObserverOptions$1);
        }
        provideEncapsulationSource() {
            return this.host.getRootNode();
        }
        project(nodes) {
            nodes.insertBefore(this.host);
        }
        take(nodes) {
            nodes.remove();
        }
    }
    /** @internal */
    class HostProjector {
        constructor($customElement, host) {
            this.host = host;
            this.host.$customElement = $customElement;
        }
        get children() {
            return this.host.childNodes;
        }
        subscribeToChildrenChange(callback) {
            // Do nothing since this scenario will never have children.
        }
        provideEncapsulationSource() {
            return this.host.getRootNode();
        }
        project(nodes) {
            nodes.appendTo(this.host);
        }
        take(nodes) {
            nodes.remove();
        }
    }

    const HTMLRuntimeResources = [
        AttrBindingBehavior,
        SelfBindingBehavior,
        UpdateTriggerBindingBehavior,
        Compose
    ];
    const HTMLRuntimeConfiguration = {
        register(container) {
            container.register(...HTMLRuntimeResources, RuntimeConfiguration, HTMLRenderer, Registration.singleton(IDOMInitializer, HTMLDOMInitializer), Registration.singleton(IProjectorLocator, HTMLProjectorLocator), Registration.singleton(ITargetAccessorLocator, TargetAccessorLocator), Registration.singleton(ITargetObserverLocator, TargetObserverLocator), Registration.singleton(ITemplateFactory, HTMLTemplateFactory));
        },
        createContainer() {
            const container = DI.createContainer();
            container.register(HTMLRuntimeConfiguration);
            return container;
        }
    };



    var index$3 = /*#__PURE__*/Object.freeze({
        Listener: Listener,
        get AttributeNSAccessor () { return AttributeNSAccessor; },
        get CheckedObserver () { return CheckedObserver; },
        get ClassAttributeAccessor () { return ClassAttributeAccessor; },
        get DataAttributeAccessor () { return DataAttributeAccessor; },
        get ElementPropertyAccessor () { return ElementPropertyAccessor; },
        ListenerTracker: ListenerTracker,
        DelegateOrCaptureSubscription: DelegateOrCaptureSubscription,
        TriggerSubscription: TriggerSubscription,
        IEventManager: IEventManager,
        EventSubscriber: EventSubscriber,
        TargetAccessorLocator: TargetAccessorLocator,
        TargetObserverLocator: TargetObserverLocator,
        get SelectValueObserver () { return SelectValueObserver; },
        get StyleAttributeAccessor () { return StyleAttributeAccessor; },
        ISVGAnalyzer: ISVGAnalyzer,
        get ValueAttributeObserver () { return ValueAttributeObserver; },
        AttrBindingBehavior: AttrBindingBehavior,
        SelfBindingBehavior: SelfBindingBehavior,
        UpdateTriggerBindingBehavior: UpdateTriggerBindingBehavior,
        Compose: Compose,
        HTMLRuntimeConfiguration: HTMLRuntimeConfiguration,
        createElement: createElement,
        RenderPlan: RenderPlan,
        isHTMLTargetedInstruction: isHTMLTargetedInstruction,
        HTMLDOM: HTMLDOM,
        HTMLRenderer: HTMLRenderer,
        CaptureBindingInstruction: CaptureBindingInstruction,
        DelegateBindingInstruction: DelegateBindingInstruction,
        SetAttributeInstruction: SetAttributeInstruction,
        StylePropertyBindingInstruction: StylePropertyBindingInstruction,
        TextBindingInstruction: TextBindingInstruction,
        TriggerBindingInstruction: TriggerBindingInstruction
    });

    class TriggerBindingCommand {
        constructor() {
            this.bindingType = 86 /* TriggerCommand */;
        }
        compile(binding) {
            return new TriggerBindingInstruction(binding.expression, getTarget(binding, false));
        }
    }
    BindingCommandResource.define('trigger', TriggerBindingCommand);
    class DelegateBindingCommand {
        constructor() {
            this.bindingType = 88 /* DelegateCommand */;
        }
        compile(binding) {
            return new DelegateBindingInstruction(binding.expression, getTarget(binding, false));
        }
    }
    BindingCommandResource.define('delegate', DelegateBindingCommand);
    class CaptureBindingCommand {
        constructor() {
            this.bindingType = 87 /* CaptureCommand */;
        }
        compile(binding) {
            return new CaptureBindingInstruction(binding.expression, getTarget(binding, false));
        }
    }
    BindingCommandResource.define('capture', CaptureBindingCommand);

    const invalidSurrogateAttribute = {
        'id': true,
        'part': true,
        'replace-part': true
    };
    const attributesToIgnore = {
        'as-element': true,
        'part': true,
        'replace-part': true
    };
    class TemplateBinder {
        constructor(dom, resources, attrParser, exprParser) {
            this.dom = dom;
            this.resources = resources;
            this.attrParser = attrParser;
            this.exprParser = exprParser;
            this.surrogate = null;
            this.manifest = null;
            this.manifestRoot = null;
            this.parentManifestRoot = null;
            this.partName = null;
        }
        bind(node) {
            const surrogateSave = this.surrogate;
            const parentManifestRootSave = this.parentManifestRoot;
            const manifestRootSave = this.manifestRoot;
            const manifestSave = this.manifest;
            const manifest = this.surrogate = this.manifest = new PlainElementSymbol(node);
            const attributes = node.attributes;
            let i = 0;
            while (i < attributes.length) {
                const attr = attributes[i];
                const attrSyntax = this.attrParser.parse(attr.name, attr.value);
                if (invalidSurrogateAttribute[attrSyntax.target] === true) {
                    throw new Error(`Invalid surrogate attribute: ${attrSyntax.target}`);
                    // TODO: use reporter
                }
                const attrInfo = this.resources.getAttributeInfo(attrSyntax);
                if (attrInfo === null) {
                    this.bindPlainAttribute(attrSyntax);
                }
                else if (attrInfo.isTemplateController) {
                    throw new Error('Cannot have template controller on surrogate element.');
                    // TODO: use reporter
                }
                else {
                    this.bindCustomAttribute(attrSyntax, attrInfo);
                }
                ++i;
            }
            this.bindChildNodes(node);
            this.surrogate = surrogateSave;
            this.parentManifestRoot = parentManifestRootSave;
            this.manifestRoot = manifestRootSave;
            this.manifest = manifestSave;
            return manifest;
        }
        bindManifest(parentManifest, node) {
            switch (node.nodeName) {
                case 'LET':
                    // let cannot have children and has some different processing rules, so return early
                    this.bindLetElement(parentManifest, node);
                    return;
                case 'SLOT':
                    // slot requires no compilation
                    this.surrogate.hasSlots = true;
                    return;
            }
            // nodes are processed bottom-up so we need to store the manifests before traversing down and
            // restore them again afterwards
            const parentManifestRootSave = this.parentManifestRoot;
            const manifestRootSave = this.manifestRoot;
            const manifestSave = this.manifest;
            // get the part name to override the name of the compiled definition
            this.partName = node.getAttribute('part');
            let manifestRoot;
            let name = node.getAttribute('as-element');
            if (name === null) {
                name = node.nodeName.toLowerCase();
            }
            const elementInfo = this.resources.getElementInfo(name);
            if (elementInfo === null) {
                // there is no registered custom element with this name
                this.manifest = new PlainElementSymbol(node);
            }
            else {
                // it's a custom element so we set the manifestRoot as well (for storing replace-parts)
                this.parentManifestRoot = this.manifestRoot;
                manifestRoot = this.manifestRoot = this.manifest = new CustomElementSymbol(this.dom, node, elementInfo);
            }
            // lifting operations done by template controllers and replace-parts effectively unlink the nodes, so start at the bottom
            this.bindChildNodes(node);
            // the parentManifest will receive either the direct child nodes, or the template controllers / replace-parts
            // wrapping them
            this.bindAttributes(node, parentManifest);
            if (manifestRoot !== undefined && manifestRoot.isContainerless) {
                node.parentNode.replaceChild(manifestRoot.marker, node);
            }
            else if (this.manifest.isTarget) {
                node.classList.add('au');
            }
            // restore the stored manifests so the attributes are processed on the correct lavel
            this.parentManifestRoot = parentManifestRootSave;
            this.manifestRoot = manifestRootSave;
            this.manifest = manifestSave;
        }
        bindLetElement(parentManifest, node) {
            const symbol = new LetElementSymbol(this.dom, node);
            parentManifest.childNodes.push(symbol);
            const attributes = node.attributes;
            let i = 0;
            while (i < attributes.length) {
                const attr = attributes[i];
                if (attr.name === 'to-view-model') {
                    node.removeAttribute('to-view-model');
                    symbol.toViewModel = true;
                    continue;
                }
                const attrSyntax = this.attrParser.parse(attr.name, attr.value);
                const command = this.resources.getBindingCommand(attrSyntax);
                const bindingType = command === null ? 2048 /* Interpolation */ : command.bindingType;
                const expr = this.exprParser.parse(attrSyntax.rawValue, bindingType);
                const to = PLATFORM.camelCase(attrSyntax.target);
                const info = new BindableInfo(to, BindingMode.toView);
                symbol.bindings.push(new BindingSymbol(command, info, expr, attrSyntax.rawValue, to));
                ++i;
            }
            node.parentNode.replaceChild(symbol.marker, node);
        }
        bindAttributes(node, parentManifest) {
            const { parentManifestRoot, manifestRoot, manifest } = this;
            // This is the top-level symbol for the current depth.
            // If there are no template controllers or replace-parts, it is always the manifest itself.
            // If there are template controllers, then this will be the outer-most TemplateControllerSymbol.
            let manifestProxy = manifest;
            const replacePart = this.declareReplacePart(node);
            let previousController;
            let currentController;
            const attributes = node.attributes;
            let i = 0;
            while (i < attributes.length) {
                const attr = attributes[i];
                ++i;
                if (attributesToIgnore[attr.name] === true) {
                    continue;
                }
                const attrSyntax = this.attrParser.parse(attr.name, attr.value);
                const attrInfo = this.resources.getAttributeInfo(attrSyntax);
                if (attrInfo === null) {
                    // it's not a custom attribute but might be a regular bound attribute or interpolation (it might also be nothing)
                    this.bindPlainAttribute(attrSyntax);
                }
                else if (attrInfo.isTemplateController) {
                    // the manifest is wrapped by the inner-most template controller (if there are multiple on the same element)
                    // so keep setting manifest.templateController to the latest template controller we find
                    currentController = manifest.templateController = this.declareTemplateController(attrSyntax, attrInfo);
                    // the proxy and the manifest are only identical when we're at the first template controller (since the controller
                    // is assigned to the proxy), so this evaluates to true at most once per node
                    if (manifestProxy === manifest) {
                        currentController.template = manifest;
                        manifestProxy = currentController;
                    }
                    else {
                        currentController.templateController = previousController;
                        currentController.template = previousController.template;
                        previousController.template = currentController;
                    }
                    previousController = currentController;
                }
                else {
                    // a regular custom attribute
                    this.bindCustomAttribute(attrSyntax, attrInfo);
                }
            }
            processTemplateControllers(this.dom, manifestProxy, manifest);
            if (replacePart === null) {
                // the proxy is either the manifest itself or the outer-most controller; add it directly to the parent
                parentManifest.childNodes.push(manifestProxy);
            }
            else {
                // there is a replace-part attribute on this node, so add it to the parts collection of the manifestRoot
                // instead of to the childNodes
                replacePart.parent = parentManifest;
                replacePart.template = manifestProxy;
                // if the current manifest is also the manifestRoot, it means the replace-part sits on a custom
                // element, so add the part to the parent wrapping custom element instead
                const partOwner = manifest === manifestRoot ? parentManifestRoot : manifestRoot;
                partOwner.parts.push(replacePart);
                processReplacePart(this.dom, replacePart, manifestProxy);
            }
        }
        bindChildNodes(node) {
            let childNode;
            if (node.nodeName === 'TEMPLATE') {
                childNode = node.content.firstChild;
            }
            else {
                childNode = node.firstChild;
            }
            let nextChild;
            while (childNode !== null) {
                switch (childNode.nodeType) {
                    case 1 /* Element */:
                        nextChild = childNode.nextSibling;
                        this.bindManifest(this.manifest, childNode);
                        childNode = nextChild;
                        break;
                    case 3 /* Text */:
                        childNode = this.bindText(childNode).nextSibling;
                        break;
                    case 4 /* CDATASection */:
                    case 7 /* ProcessingInstruction */:
                    case 8 /* Comment */:
                    case 10 /* DocumentType */:
                        childNode = childNode.nextSibling;
                        break;
                    case 9 /* Document */:
                    case 11 /* DocumentFragment */:
                        childNode = childNode.firstChild;
                }
            }
        }
        bindText(node) {
            const interpolation = this.exprParser.parse(node.wholeText, 2048 /* Interpolation */);
            if (interpolation !== null) {
                const symbol = new TextSymbol(this.dom, node, interpolation);
                this.manifest.childNodes.push(symbol);
                processInterpolationText(symbol);
            }
            while (node.nextSibling !== null && node.nextSibling.nodeType === 3 /* Text */) {
                node = node.nextSibling;
            }
            return node;
        }
        declareTemplateController(attrSyntax, attrInfo) {
            let symbol;
            // dynamicOptions logic here is similar to (and explained in) bindCustomAttribute
            const command = this.resources.getBindingCommand(attrSyntax);
            if (command === null && attrInfo.hasDynamicOptions) {
                symbol = new TemplateControllerSymbol(this.dom, attrSyntax, attrInfo, this.partName);
                this.partName = null;
                this.bindMultiAttribute(symbol, attrInfo, attrSyntax.rawValue);
            }
            else {
                symbol = new TemplateControllerSymbol(this.dom, attrSyntax, attrInfo, this.partName);
                const bindingType = command === null ? 2048 /* Interpolation */ : command.bindingType;
                const expr = this.exprParser.parse(attrSyntax.rawValue, bindingType);
                symbol.bindings.push(new BindingSymbol(command, attrInfo.bindable, expr, attrSyntax.rawValue, attrSyntax.target));
                this.partName = null;
            }
            return symbol;
        }
        bindCustomAttribute(attrSyntax, attrInfo) {
            const command = this.resources.getBindingCommand(attrSyntax);
            let symbol;
            if (command === null && attrInfo.hasDynamicOptions) {
                // a dynamicOptions (semicolon separated binding) is only valid without a binding command;
                // the binding commands must be declared in the dynamicOptions expression itself
                symbol = new CustomAttributeSymbol(attrSyntax, attrInfo);
                this.bindMultiAttribute(symbol, attrInfo, attrSyntax.rawValue);
            }
            else {
                // we've either got a command (with or without dynamicOptions, the latter maps to the first bindable),
                // or a null command but without dynamicOptions (which may be an interpolation or a normal string)
                symbol = new CustomAttributeSymbol(attrSyntax, attrInfo);
                const bindingType = command === null ? 2048 /* Interpolation */ : command.bindingType;
                const expr = this.exprParser.parse(attrSyntax.rawValue, bindingType);
                symbol.bindings.push(new BindingSymbol(command, attrInfo.bindable, expr, attrSyntax.rawValue, attrSyntax.target));
            }
            this.manifest.attributes.push(symbol);
            this.manifest.isTarget = true;
        }
        bindMultiAttribute(symbol, attrInfo, value) {
            const attributes = parseMultiAttributeBinding(value);
            let attr;
            for (let i = 0, ii = attributes.length; i < ii; ++i) {
                attr = attributes[i];
                const attrSyntax = this.attrParser.parse(attr.name, attr.value);
                const command = this.resources.getBindingCommand(attrSyntax);
                const bindingType = command === null ? 2048 /* Interpolation */ : command.bindingType;
                const expr = this.exprParser.parse(attrSyntax.rawValue, bindingType);
                let bindable$$1 = attrInfo.bindables[attrSyntax.target];
                if (bindable$$1 === undefined) {
                    // everything in a dynamicOptions expression must be used, so if it's not a bindable then we create one on the spot
                    bindable$$1 = attrInfo.bindables[attrSyntax.target] = new BindableInfo(attrSyntax.target, BindingMode.toView);
                }
                symbol.bindings.push(new BindingSymbol(command, bindable$$1, expr, attrSyntax.rawValue, attrSyntax.target));
            }
        }
        bindPlainAttribute(attrSyntax) {
            if (attrSyntax.rawValue.length === 0) {
                return;
            }
            const command = this.resources.getBindingCommand(attrSyntax);
            const bindingType = command === null ? 2048 /* Interpolation */ : command.bindingType;
            const manifest = this.manifest;
            const expr = this.exprParser.parse(attrSyntax.rawValue, bindingType);
            if (manifest.flags & 16 /* isCustomElement */) {
                const bindable$$1 = manifest.bindables[attrSyntax.target];
                if (bindable$$1 !== undefined) {
                    // if the attribute name matches a bindable property name, add it regardless of whether it's a command, interpolation, or just a plain string;
                    // the template compiler will translate it to the correct instruction
                    manifest.bindings.push(new BindingSymbol(command, bindable$$1, expr, attrSyntax.rawValue, attrSyntax.target));
                    manifest.isTarget = true;
                }
                else if (expr !== null || attrSyntax.target === 'ref') {
                    // if it does not map to a bindable, only add it if we were able to parse an expression (either a command or interpolation)
                    manifest.attributes.push(new PlainAttributeSymbol(attrSyntax, command, expr));
                    manifest.isTarget = true;
                }
            }
            else if (expr !== null || attrSyntax.target === 'ref') {
                // either a binding command, an interpolation, or a ref
                manifest.attributes.push(new PlainAttributeSymbol(attrSyntax, command, expr));
                manifest.isTarget = true;
            }
            else if (manifest === this.surrogate) {
                // any attributes, even if they are plain (no command/interpolation etc), should be added if they
                // are on the surrogate element
                manifest.attributes.push(new PlainAttributeSymbol(attrSyntax, command, expr));
            }
        }
        declareReplacePart(node) {
            const name = node.getAttribute('replace-part');
            if (name === null) {
                return null;
            }
            node.removeAttribute('replace-part');
            const symbol = new ReplacePartSymbol(name);
            return symbol;
        }
    }
    function processInterpolationText(symbol) {
        const node = symbol.physicalNode;
        const parentNode = node.parentNode;
        while (node.nextSibling !== null && node.nextSibling.nodeType === 3 /* Text */) {
            parentNode.removeChild(node.nextSibling);
        }
        node.textContent = '';
        parentNode.insertBefore(symbol.marker, node);
    }
    /**
     * A (temporary) standalone function that purely does the DOM processing (lifting) related to template controllers.
     * It's a first refactoring step towards separating DOM parsing/binding from mutations.
     */
    function processTemplateControllers(dom, manifestProxy, manifest) {
        const manifestNode = manifest.physicalNode;
        let current = manifestProxy;
        let currentTemplate;
        while (current !== manifest) {
            if (current.template === manifest) {
                // the DOM linkage is still in its original state here so we can safely assume the parentNode is non-null
                manifestNode.parentNode.replaceChild(current.marker, manifestNode);
                // if the manifest is a template element (e.g. <template repeat.for="...">) then we can skip one lift operation
                // and simply use the template directly, saving a bit of work
                if (manifestNode.nodeName === 'TEMPLATE') {
                    current.physicalNode = manifestNode;
                    // the template could safely stay without affecting anything visible, but let's keep the DOM tidy
                    manifestNode.remove();
                }
                else {
                    // the manifest is not a template element so we need to wrap it in one
                    currentTemplate = current.physicalNode = dom.createTemplate();
                    currentTemplate.content.appendChild(manifestNode);
                }
            }
            else {
                currentTemplate = current.physicalNode = dom.createTemplate();
                currentTemplate.content.appendChild(current.marker);
            }
            manifestNode.removeAttribute(current.syntax.rawName);
            current = current.template;
        }
    }
    function processReplacePart(dom, replacePart, manifestProxy) {
        let proxyNode;
        let currentTemplate;
        if (manifestProxy.flags & 512 /* hasMarker */) {
            proxyNode = manifestProxy.marker;
        }
        else {
            proxyNode = manifestProxy.physicalNode;
        }
        if (proxyNode.nodeName === 'TEMPLATE') {
            // if it's a template element, no need to do anything special, just assign it to the replacePart
            replacePart.physicalNode = proxyNode;
        }
        else {
            // otherwise wrap the replace-part in a template
            currentTemplate = replacePart.physicalNode = dom.createTemplate();
            currentTemplate.content.appendChild(proxyNode);
        }
    }
    class ParserState$1 {
        constructor(input) {
            this.input = input;
            this.index = 0;
            this.length = input.length;
        }
    }
    const fromCharCode = String.fromCharCode;
    // TODO: move to expression parser
    function parseMultiAttributeBinding(input) {
        const attributes = [];
        const state = new ParserState$1(input);
        const length = state.length;
        let name;
        let value;
        while (state.index < length) {
            name = scanAttributeName(state);
            if (name.length === 0) {
                return attributes;
            }
            value = scanAttributeValue(state);
            attributes.push({ name, value });
        }
        return attributes;
    }
    function scanAttributeName(state) {
        const start = state.index;
        const { length, input } = state;
        while (state.index < length && input.charCodeAt(++state.index) !== 58 /* Colon */)
            ;
        return input.slice(start, state.index).trim();
    }
    function scanAttributeValue(state) {
        ++state.index;
        const { length, input } = state;
        let token = '';
        let ch = 0;
        while (state.index < length) {
            ch = input.charCodeAt(state.index);
            switch (ch) {
                case 59 /* Semicolon */:
                    ++state.index;
                    return token.trim();
                case 47 /* Slash */:
                    ch = input.charCodeAt(++state.index);
                    token += `\\${fromCharCode(ch)}`;
                    break;
                case 39 /* SingleQuote */:
                    token += '\'';
                    break;
                default:
                    token += fromCharCode(ch);
            }
            ++state.index;
        }
        return token.trim();
    }

    // For some reason rollup complains about `DI.createInterface<ITemplateElementFactory>().noDefault()` with this message:
    // "semantic error TS2742 The inferred type of 'ITemplateElementFactory' cannot be named without a reference to '@aurelia/jit/node_modules/@aurelia/kernel'. This is likely not portable. A type annotation is necessary"
    // So.. investigate why that happens (or rather, why it *only* happens here and not for the other 50)
    const ITemplateElementFactory = DI.createInterface('ITemplateElementFactory').noDefault();
    /**
     * Default implementation for `ITemplateFactory` for use in an HTML based runtime.
     *
     * @internal
     */
    class HTMLTemplateElementFactory {
        constructor(dom) {
            this.dom = dom;
            this.template = dom.createTemplate();
        }
        createTemplate(input) {
            if (typeof input === 'string') {
                const template = this.template;
                template.innerHTML = input;
                const node = template.content.firstElementChild;
                // if the input is either not wrapped in a template or there is more than one node,
                // return the whole template that wraps it/them (and create a new one for the next input)
                if (node === null || node.nodeName !== 'TEMPLATE' || node.nextElementSibling !== null) {
                    this.template = this.dom.createTemplate();
                    return template;
                }
                // the node to return is both a template and the only node, so return just the node
                // and clean up the template for the next input
                template.content.removeChild(node);
                return node;
            }
            if (input.nodeName !== 'TEMPLATE') {
                // if we get one node that is not a template, wrap it in one
                const template = this.dom.createTemplate();
                template.content.appendChild(input);
                return template;
            }
            // we got a template element, remove it from the DOM if it's present there and don't
            // do any other processing
            if (input.parentNode !== null) {
                input.parentNode.removeChild(input);
            }
            return input;
        }
    }
    HTMLTemplateElementFactory.inject = [IDOM];

    const buildNotRequired$1 = Object.freeze({
        required: false,
        compiler: 'default'
    });
    /**
     * Default (runtime-agnostic) implementation for `ITemplateCompiler`.
     *
     * @internal
     */
    class TemplateCompiler {
        constructor(factory, attrParser, exprParser) {
            this.factory = factory;
            this.attrParser = attrParser;
            this.exprParser = exprParser;
            this.instructionRows = null;
        }
        get name() {
            return 'default';
        }
        compile(dom, definition, descriptions) {
            const binder = new TemplateBinder(dom, new ResourceModel(descriptions), this.attrParser, this.exprParser);
            const template = definition.template = this.factory.createTemplate(definition.template);
            const surrogate = binder.bind(template);
            if (definition.instructions === undefined || definition.instructions === PLATFORM.emptyArray) {
                definition.instructions = [];
            }
            if (surrogate.hasSlots === true) {
                definition.hasSlots = true;
            }
            this.instructionRows = definition.instructions;
            const attributes = surrogate.attributes;
            const len = attributes.length;
            if (len > 0) {
                let surrogates;
                if (definition.surrogates === undefined || definition.surrogates === PLATFORM.emptyArray) {
                    definition.surrogates = Array(len);
                }
                surrogates = definition.surrogates;
                for (let i = 0; i < len; ++i) {
                    surrogates[i] = this.compileAttribute(attributes[i]);
                }
            }
            this.compileChildNodes(surrogate);
            this.instructionRows = null;
            return definition;
        }
        compileChildNodes(parent) {
            if (parent.flags & 8192 /* hasChildNodes */) {
                const { childNodes } = parent;
                let childNode;
                const ii = childNodes.length;
                for (let i = 0; i < ii; ++i) {
                    childNode = childNodes[i];
                    if (childNode.flags & 128 /* isText */) {
                        this.instructionRows.push([new TextBindingInstruction(childNode.interpolation)]);
                    }
                    else if (childNode.flags & 32 /* isLetElement */) {
                        const bindings = childNode.bindings;
                        const instructions = [];
                        let binding;
                        const jj = bindings.length;
                        for (let j = 0; j < jj; ++j) {
                            binding = bindings[j];
                            instructions[j] = new LetBindingInstruction(binding.expression, binding.target);
                        }
                        this.instructionRows.push([new LetElementInstruction(instructions, childNode.toViewModel)]);
                    }
                    else {
                        this.compileParentNode(childNode);
                    }
                }
            }
        }
        compileCustomElement(symbol) {
            // offset 1 to leave a spot for the hydrate instruction so we don't need to create 2 arrays with a spread etc
            const instructionRow = this.compileAttributes(symbol, 1);
            instructionRow[0] = new HydrateElementInstruction(symbol.res, this.compileBindings(symbol), this.compileParts(symbol));
            this.instructionRows.push(instructionRow);
        }
        compilePlainElement(symbol) {
            const attributes = this.compileAttributes(symbol, 0);
            if (attributes.length > 0) {
                this.instructionRows.push(attributes);
            }
            this.compileChildNodes(symbol);
        }
        compileParentNode(symbol) {
            switch (symbol.flags & 511 /* type */) {
                case 16 /* isCustomElement */:
                    this.compileCustomElement(symbol);
                    break;
                case 64 /* isPlainElement */:
                    this.compilePlainElement(symbol);
                    break;
                case 1 /* isTemplateController */:
                    this.compileTemplateController(symbol);
            }
        }
        compileTemplateController(symbol) {
            const bindings = this.compileBindings(symbol);
            const instructionRowsSave = this.instructionRows;
            const controllerInstructions = this.instructionRows = [];
            this.compileParentNode(symbol.template);
            this.instructionRows = instructionRowsSave;
            const def = {
                name: symbol.partName === null ? symbol.res : symbol.partName,
                template: symbol.physicalNode,
                instructions: controllerInstructions,
                build: buildNotRequired$1
            };
            this.instructionRows.push([new HydrateTemplateController(def, symbol.res, bindings, symbol.res === 'else')]);
        }
        compileBindings(symbol) {
            let bindingInstructions;
            if (symbol.flags & 4096 /* hasBindings */) {
                // either a custom element with bindings, a custom attribute / template controller with dynamic options,
                // or a single value custom attribute binding
                const { bindings } = symbol;
                const len = bindings.length;
                bindingInstructions = Array(len);
                let i = 0;
                for (; i < len; ++i) {
                    bindingInstructions[i] = this.compileBinding(bindings[i]);
                }
            }
            else {
                bindingInstructions = PLATFORM.emptyArray;
            }
            return bindingInstructions;
        }
        compileBinding(symbol) {
            if (symbol.command === null) {
                // either an interpolation or a normal string value assigned to an element or attribute binding
                if (symbol.expression === null) {
                    // the template binder already filtered out non-bindables, so we know we need a setProperty here
                    return new SetPropertyInstruction(symbol.rawValue, symbol.bindable.propName);
                }
                else {
                    // either an element binding interpolation or a dynamic options attribute binding interpolation
                    return new InterpolationInstruction(symbol.expression, symbol.bindable.propName);
                }
            }
            else {
                // either an element binding command, dynamic options attribute binding command,
                // or custom attribute / template controller (single value) binding command
                return symbol.command.compile(symbol);
            }
        }
        compileAttributes(symbol, offset) {
            let attributeInstructions;
            if (symbol.flags & 2048 /* hasAttributes */) {
                // any attributes on a custom element (which are not bindables) or a plain element
                const { attributes } = symbol;
                const len = attributes.length;
                attributeInstructions = Array(offset + len);
                for (let i = 0; i < len; ++i) {
                    attributeInstructions[i + offset] = this.compileAttribute(attributes[i]);
                }
            }
            else if (offset > 0) {
                attributeInstructions = Array(offset);
            }
            else {
                attributeInstructions = PLATFORM.emptyArray;
            }
            return attributeInstructions;
        }
        compileCustomAttribute(symbol) {
            // a normal custom attribute (not template controller)
            const bindings = this.compileBindings(symbol);
            return new HydrateAttributeInstruction(symbol.res, bindings);
        }
        compilePlainAttribute(symbol) {
            if (symbol.command === null) {
                if (symbol.expression === null) {
                    // a plain attribute on a surrogate
                    return new SetAttributeInstruction(symbol.syntax.rawValue, symbol.syntax.target);
                }
                else {
                    // a plain attribute with an interpolation
                    return new InterpolationInstruction(symbol.expression, symbol.syntax.target);
                }
            }
            else {
                // a plain attribute with a binding command
                return symbol.command.compile(symbol);
            }
        }
        compileAttribute(symbol) {
            if (symbol.syntax.target === 'ref') {
                return new RefBindingInstruction(symbol.syntax.rawValue);
            }
            // any attribute on a custom element (which is not a bindable) or a plain element
            if (symbol.flags & 4 /* isCustomAttribute */) {
                return this.compileCustomAttribute(symbol);
            }
            else {
                return this.compilePlainAttribute(symbol);
            }
        }
        compileParts(symbol) {
            let parts;
            if (symbol.flags & 16384 /* hasParts */) {
                parts = {};
                const replaceParts = symbol.parts;
                const ii = replaceParts.length;
                let instructionRowsSave;
                let partInstructions;
                let replacePart;
                for (let i = 0; i < ii; ++i) {
                    replacePart = replaceParts[i];
                    instructionRowsSave = this.instructionRows;
                    partInstructions = this.instructionRows = [];
                    this.compileParentNode(replacePart.template);
                    parts[replacePart.name] = {
                        name: replacePart.name,
                        template: replacePart.physicalNode,
                        instructions: partInstructions,
                        build: buildNotRequired$1
                    };
                    this.instructionRows = instructionRowsSave;
                }
            }
            else {
                parts = PLATFORM.emptyObject;
            }
            return parts;
        }
    }
    TemplateCompiler.inject = [ITemplateElementFactory, IAttributeParser, IExpressionParser];

    const HTMLBindingLanguage = [
        TriggerBindingCommand,
        DelegateBindingCommand,
        CaptureBindingCommand
    ];
    const HTMLTemplateCompiler = [
        Registration.singleton(ITemplateCompiler, TemplateCompiler),
        Registration.singleton(ITemplateElementFactory, HTMLTemplateElementFactory)
    ];
    const HTMLJitConfiguration = {
        register(container) {
            container.register(HTMLRuntimeConfiguration, ...HTMLTemplateCompiler, JitConfiguration, ...HTMLBindingLanguage);
        },
        createContainer() {
            const container = DI.createContainer();
            container.register(HTMLJitConfiguration);
            return container;
        }
    };

    function stringifyDOM(node, depth) {
        const indent = ' '.repeat(depth);
        let output = indent;
        output += `Node: ${node.nodeName}`;
        if (node.nodeType === 3 /* Text */) {
            output += ` "${node.textContent}"`;
        }
        if (node.nodeType === 1 /* Element */) {
            let i = 0;
            let attr;
            const attributes = node.attributes;
            const len = attributes.length;
            for (; i < len; ++i) {
                attr = attributes[i];
                output += ` ${attr.name}=${attr.value}`;
            }
        }
        output += '\n';
        if (node.nodeType === 1 /* Element */) {
            let i = 0;
            let childNodes = node.childNodes;
            let len = childNodes.length;
            for (; i < len; ++i) {
                output += stringifyDOM(childNodes[i], depth + 1);
            }
            if (node.nodeName === 'TEMPLATE') {
                i = 0;
                childNodes = node.content.childNodes;
                len = childNodes.length;
                for (; i < len; ++i) {
                    output += stringifyDOM(childNodes[i], depth + 1);
                }
            }
        }
        return output;
    }
    function stringifyInstructions(instruction, depth) {
        const indent = ' '.repeat(depth);
        let output = indent;
        switch (instruction.type) {
            case "ha" /* textBinding */:
                output += 'textBinding\n';
                break;
            case "rh" /* callBinding */:
                output += 'callBinding\n';
                break;
            case "rk" /* iteratorBinding */:
                output += 'iteratorBinding\n';
                break;
            case "hb" /* listenerBinding */:
                output += 'listenerBinding\n';
                break;
            case "rg" /* propertyBinding */:
                output += 'propertyBinding\n';
                break;
            case "rj" /* refBinding */:
                output += 'refBinding\n';
                break;
            case "hc" /* stylePropertyBinding */:
                output += 'stylePropertyBinding\n';
                break;
            case "re" /* setProperty */:
                output += 'setProperty\n';
                break;
            case "hd" /* setAttribute */:
                output += 'setAttribute\n';
                break;
            case "rf" /* interpolation */:
                output += 'interpolation\n';
                break;
            case "rd" /* hydrateLetElement */:
                output += 'hydrateLetElement\n';
                instruction.instructions.forEach(i => {
                    output += stringifyInstructions(i, depth + 1);
                });
                break;
            case "rb" /* hydrateAttribute */:
                output += `hydrateAttribute: ${instruction.res}\n`;
                instruction.instructions.forEach(i => {
                    output += stringifyInstructions(i, depth + 1);
                });
                break;
            case "ra" /* hydrateElement */:
                output += `hydrateElement: ${instruction.res}\n`;
                instruction.instructions.forEach(i => {
                    output += stringifyInstructions(i, depth + 1);
                });
                break;
            case "rc" /* hydrateTemplateController */:
                output += `hydrateTemplateController: ${instruction.res}\n`;
                output += stringifyTemplateDefinition(instruction.def, depth + 1);
                instruction.instructions.forEach(i => {
                    output += stringifyInstructions(i, depth + 1);
                });
        }
        return output;
    }
    function stringifyTemplateDefinition(def, depth) {
        const indent = ' '.repeat(depth);
        let output = indent;
        output += `TemplateDefinition: ${def.name}\n`;
        output += stringifyDOM(def.template, depth + 1);
        output += `${indent} Instructions:\n`;
        def.instructions.forEach(row => {
            output += `${indent}  Row:\n`;
            row.forEach(i => {
                output += stringifyInstructions(i, depth + 3);
            });
        });
        return output;
    }



    var index$4 = /*#__PURE__*/Object.freeze({
        TriggerBindingCommand: TriggerBindingCommand,
        DelegateBindingCommand: DelegateBindingCommand,
        CaptureBindingCommand: CaptureBindingCommand,
        HTMLBindingLanguage: HTMLBindingLanguage,
        HTMLTemplateCompiler: HTMLTemplateCompiler,
        HTMLJitConfiguration: HTMLJitConfiguration,
        stringifyDOM: stringifyDOM,
        stringifyInstructions: stringifyInstructions,
        stringifyTemplateDefinition: stringifyTemplateDefinition,
        TemplateBinder: TemplateBinder,
        ITemplateElementFactory: ITemplateElementFactory
    });

    exports.kernel = index;
    exports.runtime = index$1;
    exports.runtimeHtml = index$3;
    exports.jit = index$2;
    exports.jitHtml = index$4;

    return exports;

}({}));
//# sourceMappingURL=index.iife.full.js.map
