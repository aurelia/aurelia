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

    // tslint:disable-next-line:no-redundant-jump
    function $noop() { return; }
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
    })();
    // performance.now polyfill for non-browser envs based on https://github.com/myrne/performance-now
    const $now = (function () {
        let getNanoSeconds;
        let hrtime;
        let moduleLoadTime;
        let nodeLoadTime;
        let upTime;
        if ($global.performance != null && $global.performance.now != null) {
            const $performance = $global.performance;
            return function () {
                return $performance.now();
            };
        }
        else if ($global.process != null && $global.process.hrtime != null) {
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
        else {
            throw new Error('Unsupported runtime'); // Can't really happen, can it?
        }
    })();
    // performance.mark / measure polyfill based on https://github.com/blackswanny/performance-polyfill
    // note: this is NOT intended to be a polyfill for browsers that don't support it; it's just for NodeJS
    // TODO: probably want to move environment-specific logic to the appropriate runtime (e.g. the NodeJS polyfill
    // to runtime-html-jsdom)
    const { $mark, $measure, $getEntriesByName, $getEntriesByType, $clearMarks, $clearMeasures } = (function () {
        if ($global.performance != null &&
            $global.performance.mark != null &&
            $global.performance.measure != null &&
            $global.performance.getEntriesByName != null &&
            $global.performance.getEntriesByType != null &&
            $global.performance.clearMarks != null &&
            $global.performance.clearMeasures != null) {
            const $performance = $global.performance;
            return {
                $mark: function (name) {
                    $performance.mark(name);
                },
                $measure: function (name, start, end) {
                    $performance.measure(name, start, end);
                },
                $getEntriesByName: function (name) {
                    return $performance.getEntriesByName(name);
                },
                $getEntriesByType: function (type) {
                    return $performance.getEntriesByType(type);
                },
                $clearMarks: function (name) {
                    $performance.clearMarks(name);
                },
                $clearMeasures: function (name) {
                    $performance.clearMeasures(name);
                }
            };
        }
        else if ($global.process != null && $global.process.hrtime != null) {
            const entries = [];
            const marksIndex = {};
            const filterEntries = function (key, value) {
                let i = 0;
                const n = entries.length;
                const result = [];
                for (; i < n; i++) {
                    if (entries[i][key] === value) {
                        result.push(entries[i]);
                    }
                }
                return result;
            };
            const clearEntries = function (type, name) {
                let i = entries.length;
                let entry;
                while (i--) {
                    entry = entries[i];
                    if (entry.entryType === type && (name === void 0 || entry.name === name)) {
                        entries.splice(i, 1);
                    }
                }
            };
            return {
                $mark: function (name) {
                    const mark = {
                        name,
                        entryType: 'mark',
                        startTime: $now(),
                        duration: 0
                    };
                    entries.push(mark);
                    marksIndex[name] = mark;
                },
                $measure: function (name, startMark, endMark) {
                    let startTime;
                    let endTime;
                    if (endMark != null) {
                        if (marksIndex[endMark] == null) {
                            throw new SyntaxError(`Failed to execute 'measure' on 'Performance': The mark '${endMark}' does not exist.`);
                        }
                        if (marksIndex[endMark] !== void 0) {
                            endTime = marksIndex[endMark].startTime;
                        }
                        else {
                            endTime = $now();
                        }
                    }
                    else {
                        endTime = $now();
                    }
                    if (startMark != null) {
                        if (marksIndex[startMark] == null) {
                            throw new SyntaxError(`Failed to execute 'measure' on 'Performance': The mark '${startMark}' does not exist.`);
                        }
                        if (marksIndex[startMark] !== void 0) {
                            startTime = marksIndex[startMark].startTime;
                        }
                        else {
                            startTime = 0;
                        }
                    }
                    else {
                        startTime = 0;
                    }
                    entries.push({
                        name,
                        entryType: 'measure',
                        startTime,
                        duration: endTime - startTime
                    });
                },
                $getEntriesByName: function (name) {
                    return filterEntries('name', name);
                },
                $getEntriesByType: function (type) {
                    return filterEntries('entryType', type);
                },
                $clearMarks: function (name) {
                    clearEntries('mark', name);
                },
                $clearMeasures: function (name) {
                    clearEntries('measure', name);
                }
            };
        }
        else {
            throw new Error('Unsupported runtime'); // Can't really happen, can it?
        }
    })();
    // RAF polyfill for non-browser envs from https://github.com/chrisdickinson/raf/blob/master/index.js
    const { $raf, $caf } = (function () {
        let raf = $global.requestAnimationFrame;
        let caf = $global.cancelAnimationFrame;
        if (raf === void 0 || caf === void 0) {
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
        $$raf.cancel = function (time) {
            caf.call($global, time);
        };
        $global.requestAnimationFrame = raf;
        $global.cancelAnimationFrame = caf;
        return { $raf: $$raf, $caf: caf };
    })();
    const hasOwnProperty = Object.prototype.hasOwnProperty;
    const emptyArray = Object.freeze([]);
    const emptyObject = Object.freeze({});
    const PLATFORM = {
        global: $global,
        emptyArray,
        emptyObject,
        noop: $noop,
        now: $now,
        mark: $mark,
        measure: $measure,
        getEntriesByName: $getEntriesByName,
        getEntriesByType: $getEntriesByType,
        clearMarks: $clearMarks,
        clearMeasures: $clearMeasures,
        hasOwnProperty,
        requestAnimationFrame(callback) {
            return $raf(callback);
        },
        cancelAnimationFrame(handle) {
            return $caf(handle);
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

    var LogLevel;
    (function (LogLevel) {
        LogLevel[LogLevel["error"] = 0] = "error";
        LogLevel[LogLevel["warn"] = 1] = "warn";
        LogLevel[LogLevel["info"] = 2] = "info";
        LogLevel[LogLevel["debug"] = 3] = "debug";
    })(LogLevel || (LogLevel = {}));
    const Reporter = {
        level: 1 /* warn */,
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
         * @param objName Any human-friendly name to identify the traced object with.
         * @param methodName Any human-friendly name to identify the traced method with.
         * @param args Pass in `Array.prototype.slice.call(arguments)` to also trace the parameters, or `null` if this is not needed (to save memory/cpu)
         */
        enter(objName, methodName, args) { return; },
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
        enableLiveLogging,
        /**
         * Stops writing out each trace info item as they are traced.
         */
        disableLiveLogging() { return; }
    };
    // tslint:disable-next-line:no-redundant-jump
    function enableLiveLogging(optionsOrWriter) { return; }

    // tslint:disable: no-any
    const slice = Array.prototype.slice;
    // Shims to augment the Reflect object with methods used from the Reflect Metadata API proposal:
    // https://www.typescriptlang.org/docs/handbook/decorators.html#metadata
    // https://rbuckton.github.io/reflect-metadata/
    // As the official spec proposal uses "any", we use it here as well and suppress related typedef linting warnings.
    // tslint:disable:no-any ban-types
    if (!('getOwnMetadata' in Reflect)) {
        Reflect.getOwnMetadata = function (metadataKey, target) {
            return target[metadataKey];
        };
        Reflect.metadata = function (metadataKey, metadataValue) {
            return function (target) {
                target[metadataKey] = metadataValue;
            };
        };
    }
    function createContainer(...params) {
        if (arguments.length === 0) {
            return new Container();
        }
        else {
            return new Container().register(...params);
        }
    }
    const hasOwnProperty$1 = PLATFORM.hasOwnProperty;
    const DI = {
        createContainer,
        getDesignParamTypes(target) {
            const paramTypes = Reflect.getOwnMetadata('design:paramtypes', target);
            if (paramTypes == null) {
                return PLATFORM.emptyArray;
            }
            return paramTypes;
        },
        getDependencies(Type) {
            let dependencies;
            if (Type.inject == null) {
                dependencies = DI.getDesignParamTypes(Type);
            }
            else {
                dependencies = [];
                let ctor = Type;
                while (typeof ctor === 'function') {
                    if (hasOwnProperty$1.call(ctor, 'inject')) {
                        dependencies.push(...ctor.inject);
                    }
                    ctor = Object.getPrototypeOf(ctor);
                }
            }
            return dependencies;
        },
        createInterface(friendlyName) {
            const Interface = function (target, property, index) {
                if (target == null) {
                    throw Reporter.error(16, Interface.friendlyName, Interface); // TODO: add error (trying to resolve an InterfaceSymbol that has no registrations)
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
        },
        inject(...dependencies) {
            return function (target, key, descriptor) {
                if (typeof descriptor === 'number') { // It's a parameter decorator.
                    if (!hasOwnProperty$1.call(target, 'inject')) {
                        const types = DI.getDesignParamTypes(target);
                        target.inject = types.slice();
                    }
                    if (dependencies.length === 1) {
                        // We know for sure that it's not void 0 due to the above check.
                        // tslint:disable-next-line: no-non-null-assertion
                        target.inject[descriptor] = dependencies[0];
                    }
                }
                else if (key) { // It's a property decorator. Not supported by the container without plugins.
                    const actualTarget = target.constructor;
                    if (actualTarget.inject == null) {
                        actualTarget.inject = {};
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
            const resolver = function (target, property, descriptor) {
                DI.inject(resolver)(target, property, descriptor);
            };
            resolver.resolve = function (handler, requestor) {
                return getter(key, handler, requestor);
            };
            return resolver;
        };
    }
    const inject = DI.inject;
    function transientDecorator(target) {
        return DI.transient(target);
    }
    function transient(target) {
        return target == null ? transientDecorator : transientDecorator(target);
    }
    function singletonDecorator(target) {
        return DI.singleton(target);
    }
    function singleton(target) {
        return target == null ? singletonDecorator : singletonDecorator(target);
    }
    const all = createResolver((key, handler, requestor) => requestor.getAll(key));
    const lazy = createResolver((key, handler, requestor) => {
        let instance = null; // cache locally so that lazy always returns the same instance once resolved
        return () => {
            if (instance == null) {
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
    var ResolverStrategy;
    (function (ResolverStrategy) {
        ResolverStrategy[ResolverStrategy["instance"] = 0] = "instance";
        ResolverStrategy[ResolverStrategy["singleton"] = 1] = "singleton";
        ResolverStrategy[ResolverStrategy["transient"] = 2] = "transient";
        ResolverStrategy[ResolverStrategy["callback"] = 3] = "callback";
        ResolverStrategy[ResolverStrategy["array"] = 4] = "array";
        ResolverStrategy[ResolverStrategy["alias"] = 5] = "alias";
    })(ResolverStrategy || (ResolverStrategy = {}));
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
            const invoker = classInvokers.length > dependencies.length ? classInvokers[dependencies.length] : fallbackInvoker;
            return new Factory(Type, invoker, dependencies);
        }
        construct(container, dynamicDependencies) {
            if (Tracer.enabled) {
                Tracer.enter('Factory', 'construct', [this.Type, ...slice.call(arguments)]);
            }
            const transformers = this.transformers;
            let instance = dynamicDependencies !== void 0
                ? this.invoker.invokeWithDynamicDependencies(container, this.Type, this.dependencies, dynamicDependencies)
                : this.invoker.invoke(container, this.Type, this.dependencies);
            if (transformers == null) {
                if (Tracer.enabled) {
                    Tracer.leave();
                }
                return instance;
            }
            for (let i = 0, ii = transformers.length; i < ii; ++i) {
                instance = transformers[i](instance);
            }
            if (Tracer.enabled) {
                Tracer.leave();
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
    /** @internal */
    class Container {
        constructor(configuration = {}) {
            this.parent = null;
            this.registerDepth = 0;
            this.resolvers = new Map();
            this.configuration = configuration;
            if (configuration.factories == null) {
                configuration.factories = new Map();
            }
            this.factories = configuration.factories;
            this.resourceLookup = configuration.resourceLookup || (configuration.resourceLookup = Object.create(null));
            this.resolvers.set(IContainer, containerResolver);
        }
        register(...params) {
            if (Tracer.enabled) {
                Tracer.enter('Container', 'register', slice.call(arguments));
            }
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
            if (Tracer.enabled) {
                Tracer.leave();
            }
            return this;
        }
        registerResolver(key, resolver) {
            validateKey(key);
            const resolvers = this.resolvers;
            const result = resolvers.get(key);
            if (result == null) {
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
            if (resolver == null) {
                return false;
            }
            if (resolver.getFactory) {
                const handler = resolver.getFactory(this);
                if (handler == null) {
                    return false;
                }
                return handler.registerTransformer(transformer);
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
            if (Tracer.enabled) {
                Tracer.enter('Container', 'get', slice.call(arguments));
            }
            validateKey(key);
            if (key.resolve !== void 0) {
                if (Tracer.enabled) {
                    Tracer.leave();
                }
                return key.resolve(this, this);
            }
            let current = this;
            let resolver;
            while (current != null) {
                resolver = current.resolvers.get(key);
                if (resolver == null) {
                    if (current.parent == null) {
                        resolver = this.jitRegister(key, current);
                        if (Tracer.enabled) {
                            Tracer.leave();
                        }
                        return resolver.resolve(current, this);
                    }
                    current = current.parent;
                }
                else {
                    if (Tracer.enabled) {
                        Tracer.leave();
                    }
                    return resolver.resolve(current, this);
                }
            }
        }
        getAll(key) {
            if (Tracer.enabled) {
                Tracer.enter('Container', 'getAll', slice.call(arguments));
            }
            validateKey(key);
            let current = this;
            let resolver;
            while (current != null) {
                resolver = current.resolvers.get(key);
                if (resolver == null) {
                    if (this.parent == null) {
                        if (Tracer.enabled) {
                            Tracer.leave();
                        }
                        return PLATFORM.emptyArray;
                    }
                    current = current.parent;
                }
                else {
                    if (Tracer.enabled) {
                        Tracer.leave();
                    }
                    return buildAllResponse(resolver, current, this);
                }
            }
            if (Tracer.enabled) {
                Tracer.leave();
            }
            return PLATFORM.emptyArray;
        }
        getFactory(Type) {
            let factory = this.factories.get(Type);
            if (factory == null) {
                factory = Factory.create(Type);
                this.factories.set(Type, factory);
            }
            return factory;
        }
        createChild() {
            if (Tracer.enabled) {
                Tracer.enter('Container', 'createChild', slice.call(arguments));
            }
            const config = this.configuration;
            const childConfig = { factories: config.factories, resourceLookup: Object.assign(Object.create(null), config.resourceLookup) };
            const child = new Container(childConfig);
            child.parent = this;
            if (Tracer.enabled) {
                Tracer.leave();
            }
            return child;
        }
        jitRegister(keyAsValue, handler) {
            if (keyAsValue.register !== void 0) {
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
                    if (resolver != null) {
                        let registry = null;
                        if (resolver.getFactory) {
                            const factory = resolver.getFactory(container);
                            if (factory != null) {
                                registry = factory.construct(container, rest);
                            }
                        }
                        else {
                            registry = resolver.resolve(container, container);
                        }
                        if (registry != null) {
                            registry.register(container);
                        }
                    }
                }
            };
        }
    };
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
    function validateKey(key) {
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

    function trimDots(ary) {
        const len = ary.length;
        let i = 0;
        let part;
        for (; i < len; ++i) {
            part = ary[i];
            if (part === '.') {
                ary.splice(i, 1);
                i -= 1;
            }
            else if (part === '..') {
                // If at the start, or previous value is still ..,
                // keep them so that when converted to a path it may
                // still work when converted to a path, even though
                // as an ID it is less than ideal. In larger point
                // releases, may be better to just kick out an error.
                if (i === 0 || (i === 1 && ary[2] === '..') || ary[i - 1] === '..') {
                    continue;
                }
                if (i > 0) {
                    ary.splice(i - 1, 2);
                    i -= 2;
                }
            }
        }
    }
    /**
     * Calculates a path relative to a file.
     *
     * @param name The relative path.
     * @param file The file path.
     * @return The calculated path.
     */
    function relativeToFile(name, file) {
        const fileParts = !file ? file : file.split('/');
        const nameParts = name.trim().split('/');
        if (nameParts[0].charAt(0) === '.' && fileParts) {
            //Convert file to array, and lop off the last part,
            //so that . matches that 'directory' and not name of the file's
            //module. For instance, file of 'one/two/three', maps to
            //'one/two/three.js', but we want the directory, 'one/two' for
            //this normalization.
            const normalizedBaseParts = fileParts.slice(0, fileParts.length - 1);
            nameParts.unshift(...normalizedBaseParts);
        }
        trimDots(nameParts);
        return nameParts.join('/');
    }
    /**
     * Joins two paths.
     *
     * @param path1 The first path.
     * @param path2 The second path.
     * @return The joined path.
     */
    function join(path1, path2) {
        if (!path1) {
            return path2;
        }
        if (!path2) {
            return path1;
        }
        const schemeMatch = path1.match(/^([^/]*?:)\//);
        const scheme = (schemeMatch && schemeMatch.length > 0) ? schemeMatch[1] : '';
        path1 = path1.slice(scheme.length);
        let urlPrefix;
        if (path1.indexOf('///') === 0 && scheme === 'file:') {
            urlPrefix = '///';
        }
        else if (path1.indexOf('//') === 0) {
            urlPrefix = '//';
        }
        else if (path1.indexOf('/') === 0) {
            urlPrefix = '/';
        }
        else {
            urlPrefix = '';
        }
        const trailingSlash = path2.slice(-1) === '/' ? '/' : '';
        const url1 = path1.split('/');
        const url2 = path2.split('/');
        const url3 = [];
        for (let i = 0, ii = url1.length; i < ii; ++i) {
            if (url1[i] === '..') {
                url3.pop();
            }
            else if (url1[i] !== '.' && url1[i] !== '') {
                url3.push(url1[i]);
            }
        }
        for (let i = 0, ii = url2.length; i < ii; ++i) {
            if (url2[i] === '..') {
                url3.pop();
            }
            else if (url2[i] !== '.' && url2[i] !== '') {
                url3.push(url2[i]);
            }
        }
        return scheme + urlPrefix + url3.join('/') + trailingSlash;
    }
    const encode = encodeURIComponent;
    const encodeKey = (k) => encode(k).replace('%24', '$');
    /**
     * Recursively builds part of query string for parameter.
     *
     * @param key Parameter name for query string.
     * @param value Parameter value to deserialize.
     * @param traditional Boolean Use the old URI template standard (RFC6570)
     * @return Array with serialized parameter(s)
     */
    function buildParam(key, value, traditional) {
        let result = [];
        if (value == null) {
            return result;
        }
        if (Array.isArray(value)) {
            for (let i = 0, l = value.length; i < l; i++) {
                if (traditional) {
                    result.push(`${encodeKey(key)}=${encode(value[i])}`);
                }
                else {
                    const arrayKey = `${key}[${(typeof value[i] === 'object' && value[i] != null ? i : '')}]`;
                    result = result.concat(buildParam(arrayKey, value[i]));
                }
            }
        }
        else if (typeof value === 'object' && !traditional) {
            for (const propertyName in value) {
                result = result.concat(buildParam(`${key}[${propertyName}]`, value[propertyName]));
            }
        }
        else {
            result.push(`${encodeKey(key)}=${encode(value)}`);
        }
        return result;
    }
    /**
     * Generate a query string from an object.
     *
     * @param params Object containing the keys and values to be used.
     * @param traditional Boolean Use the old URI template standard (RFC6570)
     * @returns The generated query string, excluding leading '?'.
     */
    function buildQueryString(params, traditional) {
        if (params == null) {
            return '';
        }
        const pairs = [];
        const keys = Object.keys(params).sort();
        let key;
        for (let i = 0, len = keys.length; i < len; ++i) {
            key = keys[i];
            pairs.push(...buildParam(key, params[key], traditional));
        }
        if (pairs.length === 0) {
            return '';
        }
        return pairs.join('&');
    }
    /**
     * Process parameter that was recognized as scalar param (primitive value or shallow array).
     *
     * @param existedParam Object with previously parsed values for specified key.
     * @param value Parameter value to append.
     * @returns Initial primitive value or transformed existedParam if parameter was recognized as an array.
     */
    function processScalarParam(existedParam, value) {
        if (Array.isArray(existedParam)) {
            // value is already an array, so push on the next value.
            existedParam.push(value);
            return existedParam;
        }
        if (existedParam !== undefined) {
            // value isn't an array, but since a second value has been specified,
            // convert value into an array.
            return [existedParam, value];
        }
        // value is a scalar.
        return value;
    }
    /**
     * Sequentially process parameter that was recognized as complex value (object or array).
     * For each keys part, if the current level is undefined create an
     *   object or array based on the type of the next keys part.
     *
     * @param queryParams root-level result object.
     * @param keys Collection of keys related to this parameter.
     * @param value Parameter value to append.
     */
    function parseComplexParam(queryParams, keys, value) {
        let currentParams = queryParams;
        const keysLastIndex = keys.length - 1;
        let key;
        let prevValue;
        for (let j = 0; j <= keysLastIndex; ++j) {
            key = (keys[j] === '' ? currentParams.length : keys[j]);
            if (j < keysLastIndex) {
                // The value has to be an array or a false value
                // It can happen that the value is no array if the key was repeated with traditional style like `list=1&list[]=2`
                if (!currentParams[key] || typeof currentParams[key] === 'object') {
                    prevValue = currentParams[key];
                }
                else {
                    prevValue = [currentParams[key]];
                }
                if (prevValue) {
                    currentParams = currentParams[key] = prevValue;
                }
                else if (isNaN(keys[j + 1])) {
                    // Kinda have no choice here
                    // tslint:disable-next-line: no-object-literal-type-assertion
                    currentParams = currentParams[key] = {};
                }
                else {
                    currentParams = currentParams[key] = [];
                }
            }
            else {
                currentParams = currentParams[key] = value;
            }
        }
    }
    /**
     * Parse a query string into a queryParams object.
     *
     * @param queryString The query string to parse.
     * @returns Object with keys and values mapped from the query string.
     */
    function parseQueryString(queryString) {
        const queryParams = {};
        if (!queryString || typeof queryString !== 'string') {
            return queryParams;
        }
        let query = queryString;
        if (query.charAt(0) === '?') {
            query = query.slice(1);
        }
        const pairs = query.replace(/\+/g, ' ').split('&');
        for (let i = 0; i < pairs.length; i++) {
            const pair = pairs[i].split('=');
            const key = decodeURIComponent(pair[0]);
            if (!key) {
                continue;
            }
            //split object key into its parts
            let keys = key.split('][');
            let keysLastIndex = keys.length - 1;
            // If the first keys part contains [ and the last ends with ], then []
            // are correctly balanced, split key to parts
            //Else it's basic key
            if (/\[/.test(keys[0]) && /\]$/.test(keys[keysLastIndex])) {
                keys[keysLastIndex] = keys[keysLastIndex].replace(/\]$/, '');
                // tslint:disable-next-line: no-non-null-assertion // outer condition already ensures not-null
                keys = keys.shift().split('[').concat(keys);
                keysLastIndex = keys.length - 1;
            }
            else {
                keysLastIndex = 0;
            }
            if (pair.length >= 2) {
                const value = pair[1] ? decodeURIComponent(pair[1]) : '';
                if (keysLastIndex) {
                    parseComplexParam(queryParams, keys, value);
                }
                else {
                    queryParams[key] = processScalarParam(queryParams[key], value);
                }
            }
            else {
                queryParams[key] = true;
            }
        }
        return queryParams;
    }

    const Profiler = (function () {
        const now = PLATFORM.now;
        const timers = [];
        let profileMap;
        const profiler = {
            createTimer,
            enable,
            disable,
            report,
            enabled: false
        };
        return profiler;
        function createTimer(name) {
            timers.push(name);
            let depth = 0;
            let mark = 0;
            return {
                enter,
                leave
            };
            function enter() {
                if (++depth === 1) {
                    mark = now();
                    ++profileMap[name].topLevelCount;
                }
                ++profileMap[name].totalCount;
            }
            function leave() {
                if (--depth === 0) {
                    profileMap[name].duration += (now() - mark);
                }
            }
        }
        function enable() {
            profileMap = {};
            for (const timer of timers) {
                profileMap[timer] = {
                    name: timer,
                    duration: 0,
                    topLevelCount: 0,
                    totalCount: 0
                };
            }
            profiler.enabled = true;
        }
        function disable() {
            profiler.enabled = false;
        }
        function report(cb) {
            Object.keys(profileMap).map(key => profileMap[key]).sort((a, b) => b.duration - a.duration).forEach(p => {
                cb(p.name, p.duration, p.topLevelCount, p.totalCount);
            });
        }
    })();

    class RuntimeCompilationResources {
        constructor(context) {
            this.context = context;
        }
        find(kind, name) {
            const key = kind.keyFrom(name);
            const resourceLookup = this.context.resourceLookup;
            let resolver = resourceLookup[key];
            if (resolver === void 0) {
                resolver = resourceLookup[key] = this.context.getResolver(key, false);
            }
            if (resolver != null && resolver.getFactory) {
                const factory = resolver.getFactory(this.context);
                if (factory != null) {
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
            if (resolver != null) {
                const instance = resolver.resolve(this.context, this.context);
                return instance === undefined ? null : instance;
            }
            return null;
        }
    }

    /**
     * Represents a handler for an EventAggregator event.
     */
    class Handler {
        constructor(messageType, callback) {
            this.messageType = messageType;
            this.callback = callback;
        }
        handle(message) {
            if (message instanceof this.messageType) {
                this.callback.call(null, message);
            }
        }
    }
    function invokeCallback(callback, data, event) {
        try {
            callback(data, event);
        }
        catch (e) {
            Reporter.error(0, e); // TODO: create error code
        }
    }
    function invokeHandler(handler, data) {
        try {
            handler.handle(data);
        }
        catch (e) {
            Reporter.error(0, e); // TODO: create error code
        }
    }
    /**
     * Enables loosely coupled publish/subscribe messaging.
     */
    class EventAggregator {
        /**
         * Creates an instance of the EventAggregator class.
         */
        constructor() {
            this.eventLookup = {};
            this.messageHandlers = [];
        }
        publish(channelOrInstance, data) {
            let subscribers;
            let i;
            if (!channelOrInstance) {
                throw Reporter.error(0); // TODO: create error code for 'Event was invalid.'
            }
            if (typeof channelOrInstance === 'string') {
                const channel = channelOrInstance;
                subscribers = this.eventLookup[channel];
                if (subscribers != null) {
                    subscribers = subscribers.slice();
                    i = subscribers.length;
                    while (i--) {
                        invokeCallback(subscribers[i], data, channel);
                    }
                }
            }
            else {
                const instance = channelOrInstance;
                subscribers = this.messageHandlers.slice();
                i = subscribers.length;
                while (i--) {
                    invokeHandler(subscribers[i], instance);
                }
            }
        }
        subscribe(channelOrType, callback) {
            let handler;
            let subscribers;
            if (!channelOrType) {
                throw Reporter.error(0); // TODO: create error code for 'Event channel/type was invalid.'
            }
            if (typeof channelOrType === 'string') {
                const channel = channelOrType;
                handler = callback;
                if (this.eventLookup[channel] === void 0) {
                    this.eventLookup[channel] = [];
                }
                subscribers = this.eventLookup[channel];
            }
            else {
                handler = new Handler(channelOrType, callback);
                subscribers = this.messageHandlers;
            }
            subscribers.push(handler);
            return {
                dispose() {
                    const idx = subscribers.indexOf(handler);
                    if (idx !== -1) {
                        subscribers.splice(idx, 1);
                    }
                }
            };
        }
        subscribeOnce(channelOrType, callback) {
            const sub = this.subscribe(channelOrType, (data, event) => {
                sub.dispose();
                return callback(data, event);
            });
            return sub;
        }
    }

    const camelCaseLookup = {};
    const kebabCaseLookup = {};
    const isNumericLookup = {};
    /**
     * Efficiently determine whether the provided property key is numeric
     * (and thus could be an array indexer) or not.
     *
     * Always returns true for values of type `'number'`.
     *
     * Otherwise, only returns true for strings that consist only of positive integers.
     *
     * Results are cached.
     */
    function isNumeric(value) {
        switch (typeof value) {
            case 'number':
                return true;
            case 'string': {
                const result = isNumericLookup[value];
                if (result !== void 0) {
                    return result;
                }
                const { length } = value;
                if (length === 0) {
                    return isNumericLookup[value] = false;
                }
                let ch = 0;
                for (let i = 0; i < length; ++i) {
                    ch = value.charCodeAt(i);
                    if (ch < 0x30 /*0*/ || ch > 0x39 /*9*/) {
                        return isNumericLookup[value] = false;
                    }
                }
                return isNumericLookup[value] = true;
            }
            default:
                return false;
        }
    }
    /**
     * Efficiently convert a kebab-cased string to camelCase.
     *
     * Separators that signal the next character to be capitalized, are: `-`, `.`, `_`.
     *
     * Primarily used by Aurelia to convert DOM attribute names to ViewModel property names.
     *
     * Results are cached.
     */
    function camelCase(input) {
        // benchmark: http://jsben.ch/qIz4Z
        let value = camelCaseLookup[input];
        if (value !== void 0)
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
    }
    /**
     * Efficiently convert a camelCased string to kebab-case.
     *
     * Primarily used by Aurelia to convert ViewModel property names to DOM attribute names.
     *
     * Results are cached.
     */
    function kebabCase(input) {
        // benchmark: http://jsben.ch/v7K9T
        let value = kebabCaseLookup[input];
        if (value !== void 0)
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
    }
    /**
     * Efficiently (up to 10x faster than `Array.from`) convert an `ArrayLike` to a real array.
     *
     * Primarily used by Aurelia to convert DOM node lists to arrays.
     */
    function toArray(input) {
        // benchmark: http://jsben.ch/xjsyF
        const { length } = input;
        const arr = Array(length);
        for (let i = 0; i < length; ++i) {
            arr[i] = input[i];
        }
        return arr;
    }
    const ids = {};
    /**
     * Retrieve the next ID in a sequence for a given string, starting with `1`.
     *
     * Used by Aurelia to assign unique ID's to controllers and resources.
     *
     * Aurelia will always prepend the context name with `au$`, so as long as you avoid
     * using that convention you should be safe from collisions.
     */
    function nextId(context) {
        if (ids[context] === void 0) {
            ids[context] = 0;
        }
        return ++ids[context];
    }
    /**
     * Reset the ID for the given string, so that `nextId` will return `1` again for the next call.
     *
     * Used by Aurelia to reset ID's in between unit tests.
     */
    function resetId(context) {
        ids[context] = 0;
    }
    /**
     * A compare function to pass to `Array.prototype.sort` for sorting numbers.
     * This is needed for numeric sort, since the default sorts them as strings.
     */
    function compareNumber(a, b) {
        return a - b;
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
        InstanceProvider: InstanceProvider,
        relativeToFile: relativeToFile,
        join: join,
        buildQueryString: buildQueryString,
        parseQueryString: parseQueryString,
        PLATFORM: PLATFORM,
        Reporter: Reporter,
        Tracer: Tracer,
        get LogLevel () { return LogLevel; },
        Profiler: Profiler,
        RuntimeCompilationResources: RuntimeCompilationResources,
        EventAggregator: EventAggregator,
        isNumeric: isNumeric,
        camelCase: camelCase,
        kebabCase: kebabCase,
        toArray: toArray,
        nextId: nextId,
        resetId: resetId,
        compareNumber: compareNumber
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
            if (value == null) {
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
            if (state == null) {
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
                    j = 0;
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
                Reporter.write(401, def.pattern); // TODO: organize error codes
            }
            else if (typeof handler[def.pattern] !== 'function') {
                Reporter.write(402, def.pattern); // TODO: organize error codes
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
    const { enter, leave } = Profiler.createTimer('AttributeParser');
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
            if (Profiler.enabled) {
                enter();
            }
            let interpretation = this.cache[name];
            if (interpretation == null) {
                interpretation = this.cache[name] = this.interpreter.interpret(name);
            }
            const pattern = interpretation.pattern;
            if (pattern == null) {
                if (Profiler.enabled) {
                    leave();
                }
                return new AttrSyntax(name, value, name, null);
            }
            else {
                if (Profiler.enabled) {
                    leave();
                }
                return this.patterns[pattern][pattern](name, value, interpretation.parts);
            }
        }
    }
    // @ts-ignore
    AttributeParser.inject = [ISyntaxInterpreter, all(IAttributePattern)];

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

    // TODO: see if we can de-duplicate these 3 decorators and their functions without killing performance or readability
    function subscriberCollection() {
        // tslint:disable-next-line:ban-types // ClassDecorator expects it to be derived from Function
        return function (target) {
            const proto = target.prototype;
            proto._subscriberFlags = 0 /* None */;
            proto.addSubscriber = addSubscriber;
            proto.removeSubscriber = removeSubscriber;
            proto.hasSubscriber = hasSubscriber;
            proto.hasSubscribers = hasSubscribers;
            proto.callSubscribers = callSubscribers;
            if (proto.subscribe === void 0)
                proto.subscribe = addSubscriber;
            if (proto.unsubscribe === void 0)
                proto.unsubscribe = removeSubscriber;
        };
    }
    function proxySubscriberCollection() {
        // tslint:disable-next-line:ban-types // ClassDecorator expects it to be derived from Function
        return function (target) {
            const proto = target.prototype;
            proto._proxySubscriberFlags = 0 /* None */;
            proto.addProxySubscriber = addProxySubscriber;
            proto.removeProxySubscriber = removeProxySubscriber;
            proto.hasProxySubscriber = hasProxySubscriber;
            proto.hasProxySubscribers = hasProxySubscribers;
            proto.callProxySubscribers = callProxySubscribers;
            if (proto.subscribeToProxy === void 0)
                proto.subscribeToProxy = addProxySubscriber;
            if (proto.unsubscribeFromProxy === void 0)
                proto.unsubscribeFromProxy = removeProxySubscriber;
        };
    }
    function collectionSubscriberCollection() {
        // tslint:disable-next-line:ban-types // ClassDecorator expects it to be derived from Function
        return function (target) {
            const proto = target.prototype;
            proto._collectionSubscriberFlags = 0 /* None */;
            proto.addCollectionSubscriber = addCollectionSubscriber;
            proto.removeCollectionSubscriber = removeCollectionSubscriber;
            proto.hasCollectionSubscriber = hasCollectionSubscriber;
            proto.hasCollectionSubscribers = hasCollectionSubscribers;
            proto.callCollectionSubscribers = callCollectionSubscribers;
            if (proto.subscribeToCollection === void 0)
                proto.subscribeToCollection = addCollectionSubscriber;
            if (proto.unsubscribeFromCollection === void 0)
                proto.unsubscribeFromCollection = removeCollectionSubscriber;
        };
    }
    function addSubscriber(subscriber) {
        if (this.hasSubscriber(subscriber)) {
            return false;
        }
        const subscriberFlags = this._subscriberFlags;
        if ((subscriberFlags & 1 /* Subscriber0 */) === 0) {
            this._subscriber0 = subscriber;
            this._subscriberFlags |= 1 /* Subscriber0 */;
        }
        else if ((subscriberFlags & 2 /* Subscriber1 */) === 0) {
            this._subscriber1 = subscriber;
            this._subscriberFlags |= 2 /* Subscriber1 */;
        }
        else if ((subscriberFlags & 4 /* Subscriber2 */) === 0) {
            this._subscriber2 = subscriber;
            this._subscriberFlags |= 4 /* Subscriber2 */;
        }
        else if ((subscriberFlags & 8 /* SubscribersRest */) === 0) {
            this._subscribersRest = [subscriber];
            this._subscriberFlags |= 8 /* SubscribersRest */;
        }
        else {
            // tslint:disable-next-line: no-non-null-assertion // Non-null is implied by else branch of (subscriberFlags & SF.SubscribersRest) === 0
            this._subscribersRest.push(subscriber);
        }
        return true;
    }
    function addProxySubscriber(subscriber) {
        if (this.hasProxySubscriber(subscriber)) {
            return false;
        }
        const subscriberFlags = this._proxySubscriberFlags;
        if ((subscriberFlags & 1 /* Subscriber0 */) === 0) {
            this._proxySubscriber0 = subscriber;
            this._proxySubscriberFlags |= 1 /* Subscriber0 */;
        }
        else if ((subscriberFlags & 2 /* Subscriber1 */) === 0) {
            this._proxySubscriber1 = subscriber;
            this._proxySubscriberFlags |= 2 /* Subscriber1 */;
        }
        else if ((subscriberFlags & 4 /* Subscriber2 */) === 0) {
            this._proxySubscriber2 = subscriber;
            this._proxySubscriberFlags |= 4 /* Subscriber2 */;
        }
        else if ((subscriberFlags & 8 /* SubscribersRest */) === 0) {
            this._proxySubscribersRest = [subscriber];
            this._proxySubscriberFlags |= 8 /* SubscribersRest */;
        }
        else {
            // tslint:disable-next-line: no-non-null-assertion // Non-null is implied by else branch of (subscriberFlags & SF.SubscribersRest) === 0
            this._proxySubscribersRest.push(subscriber);
        }
        return true;
    }
    function addCollectionSubscriber(subscriber) {
        if (this.hasCollectionSubscriber(subscriber)) {
            return false;
        }
        const subscriberFlags = this._collectionSubscriberFlags;
        if ((subscriberFlags & 1 /* Subscriber0 */) === 0) {
            this._collectionSubscriber0 = subscriber;
            this._collectionSubscriberFlags |= 1 /* Subscriber0 */;
        }
        else if ((subscriberFlags & 2 /* Subscriber1 */) === 0) {
            this._collectionSubscriber1 = subscriber;
            this._collectionSubscriberFlags |= 2 /* Subscriber1 */;
        }
        else if ((subscriberFlags & 4 /* Subscriber2 */) === 0) {
            this._collectionSubscriber2 = subscriber;
            this._collectionSubscriberFlags |= 4 /* Subscriber2 */;
        }
        else if ((subscriberFlags & 8 /* SubscribersRest */) === 0) {
            this._collectionSubscribersRest = [subscriber];
            this._collectionSubscriberFlags |= 8 /* SubscribersRest */;
        }
        else {
            // tslint:disable-next-line: no-non-null-assertion // Non-null is implied by else branch of (subscriberFlags & SF.SubscribersRest) === 0
            this._collectionSubscribersRest.push(subscriber);
        }
        return true;
    }
    function removeSubscriber(subscriber) {
        const subscriberFlags = this._subscriberFlags;
        if ((subscriberFlags & 1 /* Subscriber0 */) > 0 && this._subscriber0 === subscriber) {
            this._subscriber0 = void 0;
            this._subscriberFlags = (this._subscriberFlags | 1 /* Subscriber0 */) ^ 1 /* Subscriber0 */;
            return true;
        }
        else if ((subscriberFlags & 2 /* Subscriber1 */) > 0 && this._subscriber1 === subscriber) {
            this._subscriber1 = void 0;
            this._subscriberFlags = (this._subscriberFlags | 2 /* Subscriber1 */) ^ 2 /* Subscriber1 */;
            return true;
        }
        else if ((subscriberFlags & 4 /* Subscriber2 */) > 0 && this._subscriber2 === subscriber) {
            this._subscriber2 = void 0;
            this._subscriberFlags = (this._subscriberFlags | 4 /* Subscriber2 */) ^ 4 /* Subscriber2 */;
            return true;
        }
        else if ((subscriberFlags & 8 /* SubscribersRest */) > 0) {
            // tslint:disable-next-line: no-non-null-assertion // Non-null is implied by (subscriberFlags & SF.SubscribersRest) > 0
            const subscribers = this._subscribersRest;
            for (let i = 0, ii = subscribers.length; i < ii; ++i) {
                if (subscribers[i] === subscriber) {
                    subscribers.splice(i, 1);
                    if (ii === 1) {
                        this._subscriberFlags = (this._subscriberFlags | 8 /* SubscribersRest */) ^ 8 /* SubscribersRest */;
                    }
                    return true;
                }
            }
        }
        return false;
    }
    function removeProxySubscriber(subscriber) {
        const subscriberFlags = this._proxySubscriberFlags;
        if ((subscriberFlags & 1 /* Subscriber0 */) > 0 && this._proxySubscriber0 === subscriber) {
            this._proxySubscriber0 = void 0;
            this._proxySubscriberFlags = (this._proxySubscriberFlags | 1 /* Subscriber0 */) ^ 1 /* Subscriber0 */;
            return true;
        }
        else if ((subscriberFlags & 2 /* Subscriber1 */) > 0 && this._proxySubscriber1 === subscriber) {
            this._proxySubscriber1 = void 0;
            this._proxySubscriberFlags = (this._proxySubscriberFlags | 2 /* Subscriber1 */) ^ 2 /* Subscriber1 */;
            return true;
        }
        else if ((subscriberFlags & 4 /* Subscriber2 */) > 0 && this._proxySubscriber2 === subscriber) {
            this._proxySubscriber2 = void 0;
            this._proxySubscriberFlags = (this._proxySubscriberFlags | 4 /* Subscriber2 */) ^ 4 /* Subscriber2 */;
            return true;
        }
        else if ((subscriberFlags & 8 /* SubscribersRest */) > 0) {
            // tslint:disable-next-line: no-non-null-assertion // Non-null is implied by (subscriberFlags & SF.SubscribersRest) > 0
            const subscribers = this._proxySubscribersRest;
            for (let i = 0, ii = subscribers.length; i < ii; ++i) {
                if (subscribers[i] === subscriber) {
                    subscribers.splice(i, 1);
                    if (ii === 1) {
                        this._proxySubscriberFlags = (this._proxySubscriberFlags | 8 /* SubscribersRest */) ^ 8 /* SubscribersRest */;
                    }
                    return true;
                }
            }
        }
        return false;
    }
    function removeCollectionSubscriber(subscriber) {
        const subscriberFlags = this._collectionSubscriberFlags;
        if ((subscriberFlags & 1 /* Subscriber0 */) > 0 && this._collectionSubscriber0 === subscriber) {
            this._collectionSubscriber0 = void 0;
            this._collectionSubscriberFlags = (this._collectionSubscriberFlags | 1 /* Subscriber0 */) ^ 1 /* Subscriber0 */;
            return true;
        }
        else if ((subscriberFlags & 2 /* Subscriber1 */) > 0 && this._collectionSubscriber1 === subscriber) {
            this._collectionSubscriber1 = void 0;
            this._collectionSubscriberFlags = (this._collectionSubscriberFlags | 2 /* Subscriber1 */) ^ 2 /* Subscriber1 */;
            return true;
        }
        else if ((subscriberFlags & 4 /* Subscriber2 */) > 0 && this._collectionSubscriber2 === subscriber) {
            this._collectionSubscriber2 = void 0;
            this._collectionSubscriberFlags = (this._collectionSubscriberFlags | 4 /* Subscriber2 */) ^ 4 /* Subscriber2 */;
            return true;
        }
        else if ((subscriberFlags & 8 /* SubscribersRest */) > 0) {
            // tslint:disable-next-line: no-non-null-assertion // Non-null is implied by (subscriberFlags & SF.SubscribersRest) > 0
            const subscribers = this._collectionSubscribersRest;
            for (let i = 0, ii = subscribers.length; i < ii; ++i) {
                if (subscribers[i] === subscriber) {
                    subscribers.splice(i, 1);
                    if (ii === 1) {
                        this._collectionSubscriberFlags = (this._collectionSubscriberFlags | 8 /* SubscribersRest */) ^ 8 /* SubscribersRest */;
                    }
                    return true;
                }
            }
        }
        return false;
    }
    function hasSubscribers() {
        return this._subscriberFlags !== 0 /* None */;
    }
    function hasProxySubscribers() {
        return this._proxySubscriberFlags !== 0 /* None */;
    }
    function hasCollectionSubscribers() {
        return this._collectionSubscriberFlags !== 0 /* None */;
    }
    function hasSubscriber(subscriber) {
        // Flags here is just a perf tweak
        // Compared to not using flags, it's a moderate speed-up when this collection does not have the subscriber;
        // and minor slow-down when it does, and the former is more common than the latter.
        const subscriberFlags = this._subscriberFlags;
        if ((subscriberFlags & 1 /* Subscriber0 */) > 0 && this._subscriber0 === subscriber) {
            return true;
        }
        if ((subscriberFlags & 2 /* Subscriber1 */) > 0 && this._subscriber1 === subscriber) {
            return true;
        }
        if ((subscriberFlags & 4 /* Subscriber2 */) > 0 && this._subscriber2 === subscriber) {
            return true;
        }
        if ((subscriberFlags & 8 /* SubscribersRest */) > 0) {
            // tslint:disable-next-line: no-non-null-assertion // Non-null is implied by (subscriberFlags & SF.SubscribersRest) > 0
            const subscribers = this._subscribersRest;
            for (let i = 0, ii = subscribers.length; i < ii; ++i) {
                if (subscribers[i] === subscriber) {
                    return true;
                }
            }
        }
        return false;
    }
    function hasProxySubscriber(subscriber) {
        const subscriberFlags = this._proxySubscriberFlags;
        if ((subscriberFlags & 1 /* Subscriber0 */) > 0 && this._proxySubscriber0 === subscriber) {
            return true;
        }
        if ((subscriberFlags & 2 /* Subscriber1 */) > 0 && this._proxySubscriber1 === subscriber) {
            return true;
        }
        if ((subscriberFlags & 4 /* Subscriber2 */) > 0 && this._proxySubscriber2 === subscriber) {
            return true;
        }
        if ((subscriberFlags & 8 /* SubscribersRest */) > 0) {
            // tslint:disable-next-line: no-non-null-assertion // Non-null is implied by (subscriberFlags & SF.SubscribersRest) > 0
            const subscribers = this._proxySubscribersRest;
            for (let i = 0, ii = subscribers.length; i < ii; ++i) {
                if (subscribers[i] === subscriber) {
                    return true;
                }
            }
        }
        return false;
    }
    function hasCollectionSubscriber(subscriber) {
        const subscriberFlags = this._collectionSubscriberFlags;
        if ((subscriberFlags & 1 /* Subscriber0 */) > 0 && this._collectionSubscriber0 === subscriber) {
            return true;
        }
        if ((subscriberFlags & 2 /* Subscriber1 */) > 0 && this._collectionSubscriber1 === subscriber) {
            return true;
        }
        if ((subscriberFlags & 4 /* Subscriber2 */) > 0 && this._collectionSubscriber2 === subscriber) {
            return true;
        }
        if ((subscriberFlags & 8 /* SubscribersRest */) > 0) {
            // tslint:disable-next-line: no-non-null-assertion // Non-null is implied by (subscriberFlags & SF.SubscribersRest) > 0
            const subscribers = this._collectionSubscribersRest;
            for (let i = 0, ii = subscribers.length; i < ii; ++i) {
                if (subscribers[i] === subscriber) {
                    return true;
                }
            }
        }
        return false;
    }
    function callSubscribers(newValue, previousValue, flags) {
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
        if (subscribers !== void 0) {
            subscribers = subscribers.slice();
        }
        if (subscriber0 !== void 0) {
            callSubscriber(subscriber0, newValue, previousValue, flags, subscriber0.id === void 0 ? 0 : this[subscriber0.id]);
        }
        if (subscriber1 !== void 0) {
            callSubscriber(subscriber1, newValue, previousValue, flags, subscriber1.id === void 0 ? 0 : this[subscriber1.id]);
        }
        if (subscriber2 !== void 0) {
            callSubscriber(subscriber2, newValue, previousValue, flags, subscriber2.id === void 0 ? 0 : this[subscriber2.id]);
        }
        if (subscribers !== void 0) {
            const { length } = subscribers;
            let subscriber;
            for (let i = 0; i < length; ++i) {
                subscriber = subscribers[i];
                if (subscriber !== void 0) {
                    callSubscriber(subscriber, newValue, previousValue, flags, subscriber.id === void 0 ? 0 : this[subscriber.id]);
                }
            }
        }
    }
    function callSubscriber(subscriber, newValue, previousValue, flags, ownFlags) {
        subscriber.handleChange(newValue, previousValue, ((flags | 48 /* update */) ^ 48 /* update */) | ownFlags);
    }
    function callProxySubscribers(key, newValue, previousValue, flags) {
        const subscriber0 = this._proxySubscriber0;
        const subscriber1 = this._proxySubscriber1;
        const subscriber2 = this._proxySubscriber2;
        let subscribers = this._proxySubscribersRest;
        if (subscribers !== void 0) {
            subscribers = subscribers.slice();
        }
        if (subscriber0 !== void 0) {
            subscriber0.handleProxyChange(key, newValue, previousValue, flags);
        }
        if (subscriber1 !== void 0) {
            subscriber1.handleProxyChange(key, newValue, previousValue, flags);
        }
        if (subscriber2 !== void 0) {
            subscriber2.handleProxyChange(key, newValue, previousValue, flags);
        }
        if (subscribers !== void 0) {
            const { length } = subscribers;
            let subscriber;
            for (let i = 0; i < length; ++i) {
                subscriber = subscribers[i];
                if (subscriber !== void 0) {
                    subscriber.handleProxyChange(key, newValue, previousValue, flags);
                }
            }
        }
    }
    function callCollectionSubscribers(indexMap, flags) {
        const subscriber0 = this._collectionSubscriber0;
        const subscriber1 = this._collectionSubscriber1;
        const subscriber2 = this._collectionSubscriber2;
        let subscribers = this._collectionSubscribersRest;
        if (subscribers !== void 0) {
            subscribers = subscribers.slice();
        }
        if (subscriber0 !== void 0) {
            subscriber0.handleCollectionChange(indexMap, flags);
        }
        if (subscriber1 !== void 0) {
            subscriber1.handleCollectionChange(indexMap, flags);
        }
        if (subscriber2 !== void 0) {
            subscriber2.handleCollectionChange(indexMap, flags);
        }
        if (subscribers !== void 0) {
            const { length } = subscribers;
            let subscriber;
            for (let i = 0; i < length; ++i) {
                subscriber = subscribers[i];
                if (subscriber !== void 0) {
                    subscriber.handleCollectionChange(indexMap, flags);
                }
            }
        }
    }

    var ProxyObserver_1;
    const slice$1 = Array.prototype.slice;
    const lookup = new WeakMap();
    let ProxySubscriberCollection = class ProxySubscriberCollection {
        constructor(proxy, raw, key) {
            if (Tracer.enabled) {
                Tracer.enter('ProxySubscriberCollection', 'constructor', slice$1.call(arguments));
            }
            this.inBatch = false;
            this.raw = raw;
            this.key = key;
            this.proxy = proxy;
            this.subscribe = this.addSubscriber;
            this.unsubscribe = this.removeSubscriber;
            if (raw[key] instanceof Object) { // Ensure we observe array indices and newly created object properties
                raw[key] = ProxyObserver.getOrCreate(raw[key]).proxy;
            }
            if (Tracer.enabled) {
                Tracer.leave();
            }
        }
        setValue(value, flags) {
            const oldValue = this.raw[this.key];
            if (oldValue !== value) {
                this.raw[this.key] = value;
                this.callSubscribers(value, oldValue, flags | 2 /* proxyStrategy */ | 16 /* updateTargetInstance */);
            }
        }
        getValue() {
            return this.raw[this.key];
        }
        flushBatch(flags) {
        }
    };
    ProxySubscriberCollection = __decorate([
        subscriberCollection()
    ], ProxySubscriberCollection);
    let ProxyObserver = ProxyObserver_1 = class ProxyObserver {
        constructor(obj) {
            if (Tracer.enabled) {
                Tracer.enter('ProxyObserver', 'constructor', slice$1.call(arguments));
            }
            this.raw = obj;
            this.proxy = new Proxy(obj, this);
            lookup.set(obj, this.proxy);
            this.subscribers = {};
            if (Tracer.enabled) {
                Tracer.leave();
            }
        }
        static getProxyOrSelf(obj) {
            if (obj.$raw === void 0) {
                const proxy = lookup.get(obj);
                if (proxy === void 0) {
                    return obj;
                }
                return proxy;
            }
            return obj;
        }
        static getRawIfProxy(obj) {
            const raw = obj.$raw;
            if (raw === void 0) {
                return obj;
            }
            return raw;
        }
        static getOrCreate(obj, key) {
            let proxyObserver;
            if (obj.$raw === void 0) {
                const proxy = lookup.get(obj);
                if (proxy === void 0) {
                    proxyObserver = new ProxyObserver_1(obj);
                }
                else {
                    proxyObserver = proxy.$observer;
                }
            }
            else {
                proxyObserver = obj.$observer;
            }
            if (key === void 0) {
                return proxyObserver;
            }
            let subscribers = proxyObserver.subscribers[key];
            if (subscribers === void 0) {
                const raw = this.getRawIfProxy(obj);
                const proxy = proxyObserver.proxy;
                subscribers = proxyObserver.subscribers[key] = new ProxySubscriberCollection(proxy, raw, key);
            }
            return subscribers;
        }
        static isProxy(obj) {
            return obj.$raw !== void 0;
        }
        get(target, p, receiver) {
            if (p === '$observer') {
                return this;
            }
            if (p === '$raw') {
                return target;
            }
            return target[p];
        }
        set(target, p, value, receiver) {
            const oldValue = target[p];
            if (oldValue !== value) {
                target[p] = value;
                this.callPropertySubscribers(value, oldValue, p);
                this.callProxySubscribers(p, value, oldValue, 2 /* proxyStrategy */ | 16 /* updateTargetInstance */);
            }
            return true;
        }
        deleteProperty(target, p) {
            const oldValue = target[p];
            if (Reflect.deleteProperty(target, p)) {
                if (oldValue !== void 0) {
                    this.callPropertySubscribers(undefined, oldValue, p);
                    this.callProxySubscribers(p, undefined, oldValue, 2 /* proxyStrategy */ | 16 /* updateTargetInstance */);
                }
                return true;
            }
            return false;
        }
        defineProperty(target, p, attributes) {
            const oldValue = target[p];
            if (Reflect.defineProperty(target, p, attributes)) {
                if (attributes.value !== oldValue) {
                    this.callPropertySubscribers(attributes.value, oldValue, p);
                    this.callProxySubscribers(p, attributes.value, oldValue, 2 /* proxyStrategy */ | 16 /* updateTargetInstance */);
                }
                return true;
            }
            return false;
        }
        apply(target, thisArg, argArray = PLATFORM.emptyArray) {
            // tslint:disable-next-line:ban-types // Reflect API dictates this
            return Reflect.apply(target, target, argArray);
        }
        subscribe(subscriber, key) {
            if (key === void 0) {
                this.addProxySubscriber(subscriber);
            }
            else {
                let subscribers = this.subscribers[key];
                if (subscribers === void 0) {
                    subscribers = this.subscribers[key] = new ProxySubscriberCollection(this.proxy, this.raw, key);
                }
                subscribers.addSubscriber(subscriber);
            }
        }
        unsubscribe(subscriber, key) {
            if (key === void 0) {
                this.removeProxySubscriber(subscriber);
            }
            else {
                const subscribers = this.subscribers[key];
                if (subscribers !== undefined) {
                    subscribers.removeSubscriber(subscriber);
                }
            }
        }
        callPropertySubscribers(newValue, oldValue, key) {
            const subscribers = this.subscribers[key];
            if (subscribers !== void 0) {
                subscribers.callSubscribers(newValue, oldValue, 2 /* proxyStrategy */ | 16 /* updateTargetInstance */);
            }
        }
    };
    ProxyObserver = ProxyObserver_1 = __decorate([
        proxySubscriberCollection()
    ], ProxyObserver);

    let SetterObserver = class SetterObserver {
        constructor(lifecycle, flags, obj, propertyKey) {
            this.lifecycle = lifecycle;
            this.obj = obj;
            this.propertyKey = propertyKey;
            this.currentValue = void 0;
            this.oldValue = void 0;
            this.inBatch = false;
            this.observing = false;
            this.persistentFlags = flags & 536870927 /* persistentBindingFlags */;
            if (Tracer.enabled) {
                Tracer.leave();
            }
        }
        getValue() {
            return this.currentValue;
        }
        setValue(newValue, flags) {
            if (this.observing) {
                const currentValue = this.currentValue;
                this.currentValue = newValue;
                if (this.lifecycle.batch.depth === 0) {
                    if ((flags & 4096 /* fromBind */) === 0) {
                        this.callSubscribers(newValue, currentValue, this.persistentFlags | flags);
                    }
                }
                else if (!this.inBatch) {
                    this.inBatch = true;
                    this.oldValue = currentValue;
                    this.lifecycle.batch.add(this);
                }
            }
            else {
                // If subscribe() has been called, the target property descriptor is replaced by these getter/setter methods,
                // so calling obj[propertyKey] will actually return this.currentValue.
                // However, if subscribe() was not yet called (indicated by !this.observing), the target descriptor
                // is unmodified and we need to explicitly set the property value.
                // This will happen in one-time, to-view and two-way bindings during $bind, meaning that the $bind will not actually update the target value.
                // This wasn't visible in vCurrent due to connect-queue always doing a delayed update, so in many cases it didn't matter whether $bind updated the target or not.
                this.obj[this.propertyKey] = newValue;
            }
        }
        flushBatch(flags) {
            this.inBatch = false;
            const currentValue = this.currentValue;
            const oldValue = this.oldValue;
            this.oldValue = currentValue;
            this.callSubscribers(currentValue, oldValue, this.persistentFlags | flags);
        }
        subscribe(subscriber) {
            if (this.observing === false) {
                this.observing = true;
                this.currentValue = this.obj[this.propertyKey];
                if (!Reflect.defineProperty(this.obj, this.propertyKey, {
                    enumerable: true,
                    configurable: true,
                    get: () => {
                        return this.getValue();
                    },
                    set: value => {
                        this.setValue(value, 0 /* none */);
                    },
                })) {
                    Reporter.write(1, this.propertyKey, this.obj);
                }
            }
            this.addSubscriber(subscriber);
        }
    };
    SetterObserver = __decorate([
        subscriberCollection()
    ], SetterObserver);

    const slice$2 = Array.prototype.slice;
    var RuntimeError;
    (function (RuntimeError) {
        RuntimeError[RuntimeError["NilScope"] = 250] = "NilScope";
        RuntimeError[RuntimeError["NilOverrideContext"] = 252] = "NilOverrideContext";
        RuntimeError[RuntimeError["NilParentScope"] = 253] = "NilParentScope";
    })(RuntimeError || (RuntimeError = {}));
    /** @internal */
    class InternalObserversLookup {
        getOrCreate(lifecycle, flags, obj, key) {
            if (Tracer.enabled) {
                Tracer.enter('InternalObserversLookup', 'getOrCreate', slice$2.call(arguments));
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
    class BindingContext {
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
        static get(scope, name, ancestor, flags) {
            if (Tracer.enabled) {
                Tracer.enter('BindingContext', 'get', slice$2.call(arguments));
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
                const partScope = scope.partScopes[BindingContext.partName];
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
                Tracer.enter('BindingContext', 'getObservers', slice$2.call(arguments));
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
    BindingContext.partName = null;
    class Scope {
        constructor(bindingContext, overrideContext) {
            this.bindingContext = bindingContext;
            this.overrideContext = overrideContext;
            this.partScopes = void 0;
        }
        static create(flags, bc, oc) {
            if (Tracer.enabled) {
                Tracer.enter('Scope', 'create', slice$2.call(arguments));
            }
            if (Tracer.enabled) {
                Tracer.leave();
            }
            return new Scope(bc, oc == null ? OverrideContext.create(flags, bc, oc) : oc);
        }
        static fromOverride(flags, oc) {
            if (Tracer.enabled) {
                Tracer.enter('Scope', 'fromOverride', slice$2.call(arguments));
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
                Tracer.enter('Scope', 'fromParent', slice$2.call(arguments));
            }
            if (ps == null) {
                throw Reporter.error(253 /* NilParentScope */);
            }
            if (Tracer.enabled) {
                Tracer.leave();
            }
            return new Scope(bc, OverrideContext.create(flags, bc, ps.overrideContext));
        }
    }
    class OverrideContext {
        constructor(bindingContext, parentOverrideContext) {
            this.$synthetic = true;
            this.bindingContext = bindingContext;
            this.parentOverrideContext = parentOverrideContext;
        }
        static create(flags, bc, poc) {
            if (Tracer.enabled) {
                Tracer.enter('OverrideContext', 'create', slice$2.call(arguments));
            }
            if (Tracer.enabled) {
                Tracer.leave();
            }
            return new OverrideContext(bc, poc === void 0 ? null : poc);
        }
        getObservers() {
            if (Tracer.enabled) {
                Tracer.enter('OverrideContext', 'getObservers', slice$2.call(arguments));
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
                listener.handleChange(undefined, undefined, flags | 16 /* updateTargetInstance */);
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
        container.register(Registration.singleton(this, this));
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
        const WritableType = Type;
        const description = typeof nameOrDefinition === 'string'
            ? { name: nameOrDefinition }
            : nameOrDefinition;
        WritableType.kind = BindingBehaviorResource;
        WritableType.description = description;
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
        container.register(Registration.singleton(this, this));
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
        if (expressions === void 0 || expressions.length === 0) {
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
        RuntimeError[RuntimeError["NilScope"] = 250] = "NilScope";
    })(RuntimeError$1 || (RuntimeError$1 = {}));
    class BindingBehavior {
        constructor(expression, name, args) {
            this.$kind = 38962 /* BindingBehavior */;
            this.expression = expression;
            this.name = name;
            this.args = args;
            this.behaviorKey = BindingBehaviorResource.keyFrom(this.name);
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
            if (scope == null) {
                throw Reporter.error(250 /* NilScope */, this);
            }
            if (!binding) {
                throw Reporter.error(206 /* NoBinding */, this);
            }
            const locator = binding.locator;
            if (!locator) {
                throw Reporter.error(202 /* NoLocator */, this);
            }
            if (hasBind(this.expression)) {
                this.expression.bind(flags, scope, binding);
            }
            const behaviorKey = this.behaviorKey;
            const behavior = locator.get(behaviorKey);
            if (!behavior) {
                throw Reporter.error(203 /* NoBehaviorFound */, this);
            }
            if (binding[behaviorKey] === void 0) {
                binding[behaviorKey] = behavior;
                behavior.bind.call(behavior, flags, scope, binding, ...evalList(flags, scope, locator, this.args));
            }
            else {
                Reporter.write(204 /* BehaviorAlreadyApplied */, this);
            }
        }
        unbind(flags, scope, binding) {
            const behaviorKey = this.behaviorKey;
            if (binding[behaviorKey] !== void 0) {
                binding[behaviorKey].unbind(flags, scope, binding);
                binding[behaviorKey] = void 0;
            }
            else {
                // TODO: this is a temporary hack to make testing repeater keyed mode easier,
                // we should remove this idempotency again when track-by attribute is implemented
                Reporter.write(204 /* BehaviorAlreadyApplied */, this);
            }
            if (hasUnbind(this.expression)) {
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
                return converter.toView.call(converter, ...result);
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
                value = converter.fromView.call(converter, value, ...(evalList(flags, scope, locator, this.args)));
            }
            return this.expression.assign(flags, scope, locator, value);
        }
        connect(flags, scope, binding) {
            if (scope == null) {
                throw Reporter.error(250 /* NilScope */, this);
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
            if (signals === void 0) {
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
            if (signals === void 0) {
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
            if (scope == null) {
                throw Reporter.error(250 /* NilScope */, this);
            }
            let oc = scope.overrideContext;
            let i = this.ancestor;
            while (i-- && oc) {
                oc = oc.parentOverrideContext;
            }
            return i < 1 && oc ? oc.bindingContext : void 0;
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
            return BindingContext.get(scope, this.name, this.ancestor, flags)[this.name];
        }
        assign(flags, scope, locator, value) {
            const obj = BindingContext.get(scope, this.name, this.ancestor, flags);
            if (obj instanceof Object) {
                if (obj.$observers !== void 0 && obj.$observers[this.name] !== void 0) {
                    obj.$observers[this.name].setValue(value, flags);
                    return value;
                }
                else {
                    return obj[this.name] = value;
                }
            }
            return void 0;
        }
        connect(flags, scope, binding) {
            const context = BindingContext.get(scope, this.name, this.ancestor, flags);
            binding.observeProperty(flags, context, this.name);
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
            return instance == null ? instance : instance[this.name];
        }
        assign(flags, scope, locator, value) {
            const obj = this.object.evaluate(flags, scope, locator);
            if (obj instanceof Object) {
                if (obj.$observers !== void 0 && obj.$observers[this.name] !== void 0) {
                    obj.$observers[this.name].setValue(value, flags);
                }
                else {
                    obj[this.name] = value;
                }
            }
            else {
                this.object.assign(flags, scope, locator, { [this.name]: value });
            }
            return value;
        }
        connect(flags, scope, binding) {
            const obj = this.object.evaluate(flags, scope, null);
            this.object.connect(flags, scope, binding);
            if (obj instanceof Object) {
                binding.observeProperty(flags, obj, this.name);
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
            if (instance instanceof Object) {
                const key = this.key.evaluate(flags, scope, locator);
                return instance[key];
            }
            return void 0;
        }
        assign(flags, scope, locator, value) {
            const instance = this.object.evaluate(flags, scope, locator);
            const key = this.key.evaluate(flags, scope, locator);
            return instance[key] = value;
        }
        connect(flags, scope, binding) {
            const obj = this.object.evaluate(flags, scope, null);
            this.object.connect(flags, scope, binding);
            if (obj instanceof Object) {
                this.key.connect(flags, scope, binding);
                const key = this.key.evaluate(flags, scope, null);
                if (Array.isArray(obj) && isNumeric(key)) {
                    // Only observe array indexers in proxy mode
                    if (flags & 2 /* proxyStrategy */) {
                        binding.observeProperty(flags, obj, key);
                    }
                }
                else {
                    // observe the property represented by the key as long as it's not an array indexer
                    // (note: string indexers behave the same way as numeric indexers as long as they represent numbers)
                    binding.observeProperty(flags, obj, key);
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
            return void 0;
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
            return void 0;
        }
        connect(flags, scope, binding) {
            const obj = this.object.evaluate(flags, scope, null);
            this.object.connect(flags, scope, binding);
            if (getFunction(flags & ~2097152 /* mustEvaluate */, obj, this.name)) {
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
            if (!(flags & 2097152 /* mustEvaluate */) && (func == null)) {
                return void 0;
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
            if (right instanceof Object) {
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
    PrimitiveLiteral.$undefined = new PrimitiveLiteral(void 0);
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
            let value;
            for (let i = 0, ii = elements.length; i < ii; ++i) {
                value = elements[i].evaluate(flags, scope, locator);
                if (value == null) {
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
            this.expressions = expressions === void 0 ? PLATFORM.emptyArray : expressions;
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
            this.expressions = expressions === void 0 ? PLATFORM.emptyArray : expressions;
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
            return void 0;
        }
        assign(flags, scope, locator, obj) {
            // TODO
            return void 0;
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
            return void 0;
        }
        assign(flags, scope, locator, obj) {
            // TODO
            return void 0;
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
            this.$kind = 6199 /* ForOfStatement */;
            this.assign = PLATFORM.noop;
            this.declaration = declaration;
            this.iterable = iterable;
        }
        evaluate(flags, scope, locator) {
            return this.iterable.evaluate(flags, scope, locator);
        }
        count(flags, result) {
            return CountForOfStatement[toStringTag.call(result)](result);
        }
        iterate(flags, result, func) {
            IterateForOfStatement[toStringTag.call(result)](flags | 33554432 /* isOriginalArray */, result, func);
        }
        connect(flags, scope, binding) {
            this.declaration.connect(flags, scope, binding);
            this.iterable.connect(flags, scope, binding);
        }
        bind(flags, scope, binding) {
            if (hasBind(this.iterable)) {
                this.iterable.bind(flags, scope, binding);
            }
        }
        unbind(flags, scope, binding) {
            if (hasUnbind(this.iterable)) {
                this.iterable.unbind(flags, scope, binding);
            }
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
            this.expressions = expressions === void 0 ? PLATFORM.emptyArray : expressions;
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
        const func = obj == null ? null : obj[name];
        if (typeof func === 'function') {
            return func;
        }
        if (!(flags & 2097152 /* mustEvaluate */) && func == null) {
            return null;
        }
        throw Reporter.error(207 /* NotAFunction */, obj, name, func);
    }
    const proxyAndOriginalArray = 2 /* proxyStrategy */ | 33554432 /* isOriginalArray */;
    /** @internal */
    const IterateForOfStatement = {
        ['[object Array]'](flags, result, func) {
            if ((flags & proxyAndOriginalArray) === proxyAndOriginalArray) {
                // If we're in proxy mode, and the array is the original "items" (and not an array we created here to iterate over e.g. a set)
                // then replace all items (which are Objects) with proxies so their properties are observed in the source view model even if no
                // observers are explicitly created
                const rawArray = ProxyObserver.getRawIfProxy(result);
                const len = rawArray.length;
                let item;
                let i = 0;
                for (; i < len; ++i) {
                    item = rawArray[i];
                    if (item instanceof Object) {
                        item = rawArray[i] = ProxyObserver.getOrCreate(item).proxy;
                    }
                    func(rawArray, i, item);
                }
            }
            else {
                for (let i = 0, ii = result.length; i < ii; ++i) {
                    func(result, i, result[i]);
                }
            }
        },
        ['[object Map]'](flags, result, func) {
            const arr = Array(result.size);
            let i = -1;
            for (const entry of result.entries()) {
                arr[++i] = entry;
            }
            IterateForOfStatement['[object Array]'](flags & ~33554432 /* isOriginalArray */, arr, func);
        },
        ['[object Set]'](flags, result, func) {
            const arr = Array(result.size);
            let i = -1;
            for (const key of result.keys()) {
                arr[++i] = key;
            }
            IterateForOfStatement['[object Array]'](flags & ~33554432 /* isOriginalArray */, arr, func);
        },
        ['[object Number]'](flags, result, func) {
            const arr = Array(result);
            for (let i = 0; i < result; ++i) {
                arr[i] = i;
            }
            IterateForOfStatement['[object Array]'](flags & ~33554432 /* isOriginalArray */, arr, func);
        },
        ['[object Null]'](flags, result, func) {
            return;
        },
        ['[object Undefined]'](flags, result, func) {
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
    var BindingStrategy;
    (function (BindingStrategy) {
        /**
         * Configures all components "below" this one to operate in getterSetter binding mode.
         * This is the default; if no strategy is specified, this one is implied.
         *
         * This strategy is the most compatible, convenient and has the best performance on frequently updated bindings on components that are infrequently replaced.
         * However, it also consumes the most resources on initialization.
         */
        BindingStrategy[BindingStrategy["getterSetter"] = 1] = "getterSetter";
        /**
         * Configures all components "below" this one to operate in proxy binding mode.
         * No getters/setters are created.
         *
         * This strategy consumes significantly fewer resources than `getterSetter` on initialization and has the best performance on infrequently updated bindings on
         * components that are frequently replaced.
         * However, it consumes more resources on updates.
         */
        BindingStrategy[BindingStrategy["proxies"] = 2] = "proxies";
    })(BindingStrategy || (BindingStrategy = {}));
    const mandatoryStrategy = 1 /* getterSetter */ | 2 /* proxies */;
    function ensureValidStrategy(strategy) {
        if ((strategy & mandatoryStrategy) === 0) {
            // TODO: probably want to validate that user isn't trying to mix getterSetter/proxy
            // TODO: also need to make sure that strategy can be changed away from proxies inside the component tree (not here though, but just making a note)
            return strategy | 1 /* getterSetter */;
        }
        return strategy;
    }
    var State$1;
    (function (State) {
        State[State["none"] = 0] = "none";
        State[State["isBinding"] = 1] = "isBinding";
        State[State["isUnbinding"] = 2] = "isUnbinding";
        State[State["isBound"] = 4] = "isBound";
        State[State["isBoundOrBinding"] = 5] = "isBoundOrBinding";
        State[State["isBoundOrUnbinding"] = 6] = "isBoundOrUnbinding";
        State[State["isAttaching"] = 8] = "isAttaching";
        State[State["isDetaching"] = 16] = "isDetaching";
        State[State["isAttached"] = 32] = "isAttached";
        State[State["isAttachedOrAttaching"] = 40] = "isAttachedOrAttaching";
        State[State["isAttachedOrDetaching"] = 48] = "isAttachedOrDetaching";
        State[State["isMounted"] = 64] = "isMounted";
        State[State["isCached"] = 128] = "isCached";
        State[State["needsBind"] = 256] = "needsBind";
        State[State["needsUnbind"] = 512] = "needsUnbind";
        State[State["needsAttach"] = 1024] = "needsAttach";
        State[State["needsDetach"] = 2048] = "needsDetach";
        State[State["needsMount"] = 4096] = "needsMount";
        State[State["needsUnmount"] = 8192] = "needsUnmount";
        State[State["hasLockedScope"] = 16384] = "hasLockedScope";
        State[State["canBeCached"] = 32768] = "canBeCached";
        State[State["inBoundQueue"] = 65536] = "inBoundQueue";
        State[State["inUnboundQueue"] = 131072] = "inUnboundQueue";
        State[State["inAttachedQueue"] = 262144] = "inAttachedQueue";
        State[State["inDetachedQueue"] = 524288] = "inDetachedQueue";
        State[State["inMountQueue"] = 1048576] = "inMountQueue";
        State[State["inUnmountQueue"] = 2097152] = "inUnmountQueue";
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
    var LifecycleFlags;
    (function (LifecycleFlags) {
        LifecycleFlags[LifecycleFlags["none"] = 0] = "none";
        // Bitmask for flags that need to be stored on a binding during $bind for mutation
        // callbacks outside of $bind
        LifecycleFlags[LifecycleFlags["persistentBindingFlags"] = 536870927] = "persistentBindingFlags";
        LifecycleFlags[LifecycleFlags["allowParentScopeTraversal"] = 536870912] = "allowParentScopeTraversal";
        LifecycleFlags[LifecycleFlags["bindingStrategy"] = 15] = "bindingStrategy";
        LifecycleFlags[LifecycleFlags["getterSetterStrategy"] = 1] = "getterSetterStrategy";
        LifecycleFlags[LifecycleFlags["proxyStrategy"] = 2] = "proxyStrategy";
        LifecycleFlags[LifecycleFlags["update"] = 48] = "update";
        LifecycleFlags[LifecycleFlags["updateTargetInstance"] = 16] = "updateTargetInstance";
        LifecycleFlags[LifecycleFlags["updateSourceExpression"] = 32] = "updateSourceExpression";
        LifecycleFlags[LifecycleFlags["from"] = 524224] = "from";
        LifecycleFlags[LifecycleFlags["fromFlush"] = 960] = "fromFlush";
        LifecycleFlags[LifecycleFlags["fromAsyncFlush"] = 64] = "fromAsyncFlush";
        LifecycleFlags[LifecycleFlags["fromSyncFlush"] = 128] = "fromSyncFlush";
        LifecycleFlags[LifecycleFlags["fromTick"] = 256] = "fromTick";
        LifecycleFlags[LifecycleFlags["fromBatch"] = 512] = "fromBatch";
        LifecycleFlags[LifecycleFlags["fromStartTask"] = 1024] = "fromStartTask";
        LifecycleFlags[LifecycleFlags["fromStopTask"] = 2048] = "fromStopTask";
        LifecycleFlags[LifecycleFlags["fromBind"] = 4096] = "fromBind";
        LifecycleFlags[LifecycleFlags["fromUnbind"] = 8192] = "fromUnbind";
        LifecycleFlags[LifecycleFlags["fromAttach"] = 16384] = "fromAttach";
        LifecycleFlags[LifecycleFlags["fromDetach"] = 32768] = "fromDetach";
        LifecycleFlags[LifecycleFlags["fromCache"] = 65536] = "fromCache";
        LifecycleFlags[LifecycleFlags["fromDOMEvent"] = 131072] = "fromDOMEvent";
        LifecycleFlags[LifecycleFlags["fromLifecycleTask"] = 262144] = "fromLifecycleTask";
        LifecycleFlags[LifecycleFlags["allowPublishRoundtrip"] = 524288] = "allowPublishRoundtrip";
        LifecycleFlags[LifecycleFlags["isPublishing"] = 1048576] = "isPublishing";
        LifecycleFlags[LifecycleFlags["mustEvaluate"] = 2097152] = "mustEvaluate";
        LifecycleFlags[LifecycleFlags["parentUnmountQueued"] = 4194304] = "parentUnmountQueued";
        // this flag is for the synchronous flush before detach (no point in updating the
        // DOM if it's about to be detached)
        LifecycleFlags[LifecycleFlags["doNotUpdateDOM"] = 8388608] = "doNotUpdateDOM";
        LifecycleFlags[LifecycleFlags["isTraversingParentScope"] = 16777216] = "isTraversingParentScope";
        LifecycleFlags[LifecycleFlags["isOriginalArray"] = 33554432] = "isOriginalArray";
        LifecycleFlags[LifecycleFlags["isCollectionMutation"] = 67108864] = "isCollectionMutation";
        LifecycleFlags[LifecycleFlags["updateOneTimeBindings"] = 134217728] = "updateOneTimeBindings";
        LifecycleFlags[LifecycleFlags["reorderNodes"] = 268435456] = "reorderNodes";
    })(LifecycleFlags || (LifecycleFlags = {}));
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
        ExpressionKind[ExpressionKind["ForOfStatement"] = 6199] = "ForOfStatement";
        ExpressionKind[ExpressionKind["Interpolation"] = 24] = "Interpolation"; //
    })(ExpressionKind || (ExpressionKind = {}));

    var ViewModelKind;
    (function (ViewModelKind) {
        ViewModelKind[ViewModelKind["customElement"] = 0] = "customElement";
        ViewModelKind[ViewModelKind["customAttribute"] = 1] = "customAttribute";
        ViewModelKind[ViewModelKind["synthetic"] = 2] = "synthetic";
    })(ViewModelKind || (ViewModelKind = {}));
    const IController = DI.createInterface('IController').noDefault();
    const IViewFactory = DI.createInterface('IViewFactory').noDefault();
    class LinkedCallback {
        get first() {
            let cur = this;
            while (cur.prev !== void 0 && cur.prev.priority === this.priority) {
                cur = cur.prev;
            }
            return cur;
        }
        get last() {
            let cur = this;
            while (cur.next !== void 0 && cur.next.priority === this.priority) {
                cur = cur.next;
            }
            return cur;
        }
        constructor(cb, context = void 0, priority = 16384 /* normal */, once = false) {
            this.cb = cb;
            this.context = context;
            this.priority = priority;
            this.once = once;
            this.next = void 0;
            this.prev = void 0;
            this.unlinked = false;
        }
        equals(fn, context) {
            return this.cb === fn && this.context === context;
        }
        call(flags) {
            if (this.cb !== void 0) {
                if (this.context !== void 0) {
                    this.cb.call(this.context, flags);
                }
                else {
                    this.cb(flags);
                }
            }
            if (this.once) {
                return this.unlink(true);
            }
            else if (this.unlinked) {
                const next = this.next;
                this.next = void 0;
                return next;
            }
            else {
                return this.next;
            }
        }
        rotate() {
            if (this.prev === void 0 || this.prev.priority > this.priority) {
                return;
            }
            const { first, last } = this;
            const firstPrev = first.prev;
            const lastNext = last.next;
            const thisPrev = this.prev;
            this.prev = firstPrev;
            if (firstPrev !== void 0) {
                firstPrev.next = this;
            }
            last.next = first;
            first.prev = last;
            thisPrev.next = lastNext;
            if (lastNext !== void 0) {
                lastNext.prev = thisPrev;
            }
        }
        link(prev) {
            this.prev = prev;
            if (prev.next !== void 0) {
                prev.next.prev = this;
            }
            this.next = prev.next;
            prev.next = this;
        }
        unlink(removeNext = false) {
            this.unlinked = true;
            this.cb = void 0;
            this.context = void 0;
            if (this.prev !== void 0) {
                this.prev.next = this.next;
            }
            if (this.next !== void 0) {
                this.next.prev = this.prev;
            }
            this.prev = void 0;
            if (removeNext) {
                const { next } = this;
                this.next = void 0;
                return next;
            }
            return this.next;
        }
    }
    var Priority;
    (function (Priority) {
        Priority[Priority["preempt"] = 32768] = "preempt";
        Priority[Priority["high"] = 28672] = "high";
        Priority[Priority["bind"] = 24576] = "bind";
        Priority[Priority["attach"] = 20480] = "attach";
        Priority[Priority["normal"] = 16384] = "normal";
        Priority[Priority["propagate"] = 12288] = "propagate";
        Priority[Priority["connect"] = 8192] = "connect";
        Priority[Priority["low"] = 4096] = "low";
    })(Priority || (Priority = {}));
    const ILifecycle = DI.createInterface('ILifecycle').withDefault(x => x.singleton(Lifecycle));
    const { min, max } = Math;
    class BoundQueue {
        constructor(lifecycle) {
            this.lifecycle = lifecycle;
            this.depth = 0;
            this.head = void 0;
            this.tail = void 0;
        }
        begin() {
            ++this.depth;
        }
        end(flags) {
            if (flags === void 0) {
                flags = 0 /* none */;
            }
            if (--this.depth === 0) {
                this.process(flags);
            }
        }
        inline(fn, flags) {
            this.begin();
            fn();
            this.end(flags);
        }
        add(controller) {
            if (this.head === void 0) {
                this.head = controller;
            }
            else {
                controller.prevBound = this.tail;
                // tslint:disable-next-line: no-non-null-assertion // implied by boundHead not being undefined
                this.tail.nextBound = controller;
            }
            this.tail = controller;
            controller.state |= 65536 /* inBoundQueue */;
        }
        remove(controller) {
            if (controller.prevBound !== void 0) {
                controller.prevBound.nextBound = controller.nextBound;
            }
            if (controller.nextBound !== void 0) {
                controller.nextBound.prevBound = controller.prevBound;
            }
            controller.prevBound = void 0;
            controller.nextBound = void 0;
            if (this.tail === controller) {
                this.tail = controller.prevBound;
            }
            if (this.head === controller) {
                this.head = controller.nextBound;
            }
            controller.state = (controller.state | 65536 /* inBoundQueue */) ^ 65536 /* inBoundQueue */;
        }
        process(flags) {
            while (this.head !== void 0) {
                let cur = this.head;
                this.head = this.tail = void 0;
                let next;
                do {
                    cur.state = (cur.state | 65536 /* inBoundQueue */) ^ 65536 /* inBoundQueue */;
                    cur.bound(flags);
                    next = cur.nextBound;
                    cur.nextBound = void 0;
                    cur.prevBound = void 0;
                    // tslint:disable-next-line: no-non-null-assertion // we're checking it for undefined the next line
                    cur = next;
                } while (cur !== void 0);
            }
        }
    }
    class UnboundQueue {
        constructor(lifecycle) {
            this.lifecycle = lifecycle;
            this.depth = 0;
            this.head = void 0;
            this.tail = void 0;
        }
        begin() {
            ++this.depth;
        }
        end(flags) {
            if (flags === void 0) {
                flags = 0 /* none */;
            }
            if (--this.depth === 0) {
                this.process(flags);
            }
        }
        inline(fn, flags) {
            this.begin();
            fn();
            this.end(flags);
        }
        add(controller) {
            if (this.head === void 0) {
                this.head = controller;
            }
            else {
                controller.prevUnbound = this.tail;
                // tslint:disable-next-line: no-non-null-assertion // implied by unboundHead not being undefined
                this.tail.nextUnbound = controller;
            }
            this.tail = controller;
            controller.state |= 131072 /* inUnboundQueue */;
        }
        remove(controller) {
            if (controller.prevUnbound !== void 0) {
                controller.prevUnbound.nextUnbound = controller.nextUnbound;
            }
            if (controller.nextUnbound !== void 0) {
                controller.nextUnbound.prevUnbound = controller.prevUnbound;
            }
            controller.prevUnbound = void 0;
            controller.nextUnbound = void 0;
            if (this.tail === controller) {
                this.tail = controller.prevUnbound;
            }
            if (this.head === controller) {
                this.head = controller.nextUnbound;
            }
            controller.state = (controller.state | 131072 /* inUnboundQueue */) ^ 131072 /* inUnboundQueue */;
        }
        process(flags) {
            while (this.head !== void 0) {
                let cur = this.head;
                this.head = this.tail = void 0;
                let next;
                do {
                    cur.state = (cur.state | 131072 /* inUnboundQueue */) ^ 131072 /* inUnboundQueue */;
                    cur.unbound(flags);
                    next = cur.nextUnbound;
                    cur.nextUnbound = void 0;
                    cur.prevUnbound = void 0;
                    // tslint:disable-next-line: no-non-null-assertion // we're checking it for undefined the next line
                    cur = next;
                } while (cur !== void 0);
            }
        }
    }
    class AttachedQueue {
        constructor(lifecycle) {
            this.lifecycle = lifecycle;
            this.depth = 0;
            this.head = void 0;
            this.tail = void 0;
        }
        begin() {
            ++this.depth;
        }
        end(flags) {
            if (flags === void 0) {
                flags = 0 /* none */;
            }
            if (--this.depth === 0) {
                // temporary, until everything else works and we're ready for integrating mount/unmount in the RAF queue
                this.lifecycle.mount.process(flags);
                this.process(flags);
            }
        }
        inline(fn, flags) {
            this.begin();
            fn();
            this.end(flags);
        }
        add(controller) {
            if (this.head === void 0) {
                this.head = controller;
            }
            else {
                controller.prevAttached = this.tail;
                // tslint:disable-next-line: no-non-null-assertion // implied by attachedHead not being undefined
                this.tail.nextAttached = controller;
            }
            this.tail = controller;
            controller.state |= 262144 /* inAttachedQueue */;
        }
        remove(controller) {
            if (controller.prevAttached !== void 0) {
                controller.prevAttached.nextAttached = controller.nextAttached;
            }
            if (controller.nextAttached !== void 0) {
                controller.nextAttached.prevAttached = controller.prevAttached;
            }
            controller.prevAttached = void 0;
            controller.nextAttached = void 0;
            if (this.tail === controller) {
                this.tail = controller.prevAttached;
            }
            if (this.head === controller) {
                this.head = controller.nextAttached;
            }
            controller.state = (controller.state | 262144 /* inAttachedQueue */) ^ 262144 /* inAttachedQueue */;
        }
        process(flags) {
            while (this.head !== void 0) {
                let cur = this.head;
                this.head = this.tail = void 0;
                let next;
                do {
                    cur.state = (cur.state | 262144 /* inAttachedQueue */) ^ 262144 /* inAttachedQueue */;
                    cur.attached(flags);
                    next = cur.nextAttached;
                    cur.nextAttached = void 0;
                    cur.prevAttached = void 0;
                    // tslint:disable-next-line: no-non-null-assertion // we're checking it for undefined the next line
                    cur = next;
                } while (cur !== void 0);
            }
        }
    }
    class DetachedQueue {
        constructor(lifecycle) {
            this.lifecycle = lifecycle;
            this.depth = 0;
            this.head = void 0;
            this.tail = void 0;
        }
        begin() {
            ++this.depth;
        }
        end(flags) {
            if (flags === void 0) {
                flags = 0 /* none */;
            }
            if (--this.depth === 0) {
                // temporary, until everything else works and we're ready for integrating mount/unmount in the RAF queue
                this.lifecycle.unmount.process(flags);
                this.process(flags);
            }
        }
        inline(fn, flags) {
            this.begin();
            fn();
            this.end(flags);
        }
        add(controller) {
            if (this.head === void 0) {
                this.head = controller;
            }
            else {
                controller.prevDetached = this.tail;
                // tslint:disable-next-line: no-non-null-assertion // implied by detachedHead not being undefined
                this.tail.nextDetached = controller;
            }
            this.tail = controller;
            controller.state |= 524288 /* inDetachedQueue */;
        }
        remove(controller) {
            if (controller.prevDetached !== void 0) {
                controller.prevDetached.nextDetached = controller.nextDetached;
            }
            if (controller.nextDetached !== void 0) {
                controller.nextDetached.prevDetached = controller.prevDetached;
            }
            controller.prevDetached = void 0;
            controller.nextDetached = void 0;
            if (this.tail === controller) {
                this.tail = controller.prevDetached;
            }
            if (this.head === controller) {
                this.head = controller.nextDetached;
            }
            controller.state = (controller.state | 524288 /* inDetachedQueue */) ^ 524288 /* inDetachedQueue */;
        }
        process(flags) {
            while (this.head !== void 0) {
                let cur = this.head;
                this.head = this.tail = void 0;
                let next;
                do {
                    cur.state = (cur.state | 524288 /* inDetachedQueue */) ^ 524288 /* inDetachedQueue */;
                    cur.detached(flags);
                    next = cur.nextDetached;
                    cur.nextDetached = void 0;
                    cur.prevDetached = void 0;
                    // tslint:disable-next-line: no-non-null-assertion // we're checking it for undefined the next line
                    cur = next;
                } while (cur !== void 0);
            }
        }
    }
    class MountQueue {
        constructor(lifecycle) {
            this.lifecycle = lifecycle;
            this.head = void 0;
            this.tail = void 0;
        }
        add(controller) {
            if ((controller.state & 2097152 /* inUnmountQueue */) > 0) {
                this.lifecycle.unmount.remove(controller);
                console.log(`in unmount queue during mountQueue.add, so removing`, this);
                return;
            }
            if (this.head === void 0) {
                this.head = controller;
            }
            else {
                controller.prevMount = this.tail;
                // tslint:disable-next-line: no-non-null-assertion // implied by mountHead not being undefined
                this.tail.nextMount = controller;
            }
            this.tail = controller;
            controller.state |= 1048576 /* inMountQueue */;
        }
        remove(controller) {
            if (controller.prevMount !== void 0) {
                controller.prevMount.nextMount = controller.nextMount;
            }
            if (controller.nextMount !== void 0) {
                controller.nextMount.prevMount = controller.prevMount;
            }
            controller.prevMount = void 0;
            controller.nextMount = void 0;
            if (this.tail === controller) {
                this.tail = controller.prevMount;
            }
            if (this.head === controller) {
                this.head = controller.nextMount;
            }
            controller.state = (controller.state | 1048576 /* inMountQueue */) ^ 1048576 /* inMountQueue */;
        }
        process(flags) {
            while (this.head !== void 0) {
                let cur = this.head;
                this.head = this.tail = void 0;
                let next;
                do {
                    cur.state = (cur.state | 1048576 /* inMountQueue */) ^ 1048576 /* inMountQueue */;
                    cur.mount(flags);
                    next = cur.nextMount;
                    cur.nextMount = void 0;
                    cur.prevMount = void 0;
                    // tslint:disable-next-line: no-non-null-assertion // we're checking it for undefined the next line
                    cur = next;
                } while (cur !== void 0);
            }
        }
    }
    class UnmountQueue {
        constructor(lifecycle) {
            this.lifecycle = lifecycle;
            this.head = void 0;
            this.tail = void 0;
        }
        add(controller) {
            if ((controller.state & 1048576 /* inMountQueue */) > 0) {
                this.lifecycle.mount.remove(controller);
                return;
            }
            if (this.head === void 0) {
                this.head = controller;
            }
            else {
                controller.prevUnmount = this.tail;
                // tslint:disable-next-line: no-non-null-assertion // implied by unmountHead not being undefined
                this.tail.nextUnmount = controller;
            }
            this.tail = controller;
            controller.state |= 2097152 /* inUnmountQueue */;
        }
        remove(controller) {
            if (controller.prevUnmount !== void 0) {
                controller.prevUnmount.nextUnmount = controller.nextUnmount;
            }
            if (controller.nextUnmount !== void 0) {
                controller.nextUnmount.prevUnmount = controller.prevUnmount;
            }
            controller.prevUnmount = void 0;
            controller.nextUnmount = void 0;
            if (this.tail === controller) {
                this.tail = controller.prevUnmount;
            }
            if (this.head === controller) {
                this.head = controller.nextUnmount;
            }
            controller.state = (controller.state | 2097152 /* inUnmountQueue */) ^ 2097152 /* inUnmountQueue */;
        }
        process(flags) {
            while (this.head !== void 0) {
                let cur = this.head;
                this.head = this.tail = void 0;
                let next;
                do {
                    cur.state = (cur.state | 2097152 /* inUnmountQueue */) ^ 2097152 /* inUnmountQueue */;
                    cur.unmount(flags);
                    next = cur.nextUnmount;
                    cur.nextUnmount = void 0;
                    cur.prevUnmount = void 0;
                    // tslint:disable-next-line: no-non-null-assertion // we're checking it for undefined the next line
                    cur = next;
                } while (cur !== void 0);
            }
        }
    }
    class BatchQueue {
        constructor(lifecycle) {
            this.lifecycle = lifecycle;
            this.queue = [];
            this.depth = 0;
        }
        begin() {
            ++this.depth;
        }
        end(flags) {
            if (flags === void 0) {
                flags = 0 /* none */;
            }
            if (--this.depth === 0) {
                this.process(flags);
            }
        }
        inline(fn, flags) {
            this.begin();
            fn();
            this.end(flags);
        }
        add(requestor) {
            this.queue.push(requestor);
        }
        remove(requestor) {
            const index = this.queue.indexOf(requestor);
            if (index > -1) {
                this.queue.splice(index, 1);
            }
        }
        process(flags) {
            flags |= 512 /* fromBatch */;
            while (this.queue.length > 0) {
                const batch = this.queue.slice();
                this.queue = [];
                const { length } = batch;
                for (let i = 0; i < length; ++i) {
                    batch[i].flushBatch(flags);
                }
            }
        }
    }
    class Lifecycle {
        get FPS() {
            return 1000 / this.prevFrameDuration;
        }
        get minFPS() {
            return 1000 / this.maxFrameDuration;
        }
        set minFPS(fps) {
            this.maxFrameDuration = 1000 / min(max(0, min(this.maxFPS, fps)), 60);
        }
        get maxFPS() {
            if (this.minFrameDuration > 0) {
                return 1000 / this.minFrameDuration;
            }
            return 60;
        }
        set maxFPS(fps) {
            if (fps >= 60) {
                this.minFrameDuration = 0;
            }
            else {
                this.minFrameDuration = 1000 / min(max(1, max(this.minFPS, fps)), 60);
            }
        }
        constructor() {
            this.rafHead = new LinkedCallback(void 0, void 0, Infinity);
            this.rafTail = (void 0);
            this.currentTick = 0;
            this.isFlushingRAF = false;
            this.rafRequestId = -1;
            this.rafStartTime = -1;
            this.isTicking = false;
            this.batch = new BatchQueue(this);
            this.mount = new MountQueue(this);
            this.unmount = new UnmountQueue(this);
            this.bound = new BoundQueue(this);
            this.unbound = new UnboundQueue(this);
            this.attached = new AttachedQueue(this);
            this.detached = new DetachedQueue(this);
            this.minFrameDuration = 0;
            this.maxFrameDuration = 1000 / 30;
            this.prevFrameDuration = 0;
            // tslint:disable-next-line: promise-must-complete
            this.nextFrame = new Promise(resolve => {
                this.resolveNextFrame = resolve;
            });
            this.tick = (timestamp) => {
                this.rafRequestId = -1;
                if (this.isTicking) {
                    this.processRAFQueue(960 /* fromFlush */, timestamp);
                    if (this.isTicking && this.rafRequestId === -1 && this.rafHead.next !== void 0) {
                        this.rafRequestId = PLATFORM.requestAnimationFrame(this.tick);
                    }
                    if (++this.currentTick > 1) {
                        this.resolveNextFrame(timestamp);
                        // tslint:disable-next-line: promise-must-complete
                        this.nextFrame = new Promise(resolve => {
                            this.resolveNextFrame = resolve;
                        });
                    }
                }
            };
            this.pendingChanges = 0;
            this.timeslicingEnabled = false;
            this.adaptiveTimeslicing = false;
            this.frameDurationFactor = 1;
        }
        static register(container) {
            return Registration.singleton(ILifecycle, this).register(container);
        }
        startTicking() {
            if (!this.isTicking) {
                this.isTicking = true;
                if (this.rafRequestId === -1 && this.rafHead.next !== void 0) {
                    this.rafStartTime = PLATFORM.now();
                    this.rafRequestId = PLATFORM.requestAnimationFrame(this.tick);
                }
            }
            else if (this.rafRequestId === -1 && this.rafHead.next !== void 0) {
                this.rafStartTime = PLATFORM.now();
                this.rafRequestId = PLATFORM.requestAnimationFrame(this.tick);
            }
        }
        stopTicking() {
            if (this.isTicking) {
                this.isTicking = false;
                if (this.rafRequestId !== -1) {
                    PLATFORM.cancelAnimationFrame(this.rafRequestId);
                    this.rafRequestId = -1;
                }
            }
            else if (this.rafRequestId !== -1) {
                PLATFORM.cancelAnimationFrame(this.rafRequestId);
                this.rafRequestId = -1;
            }
        }
        enqueueRAF(cb, context = void 0, priority = 16384 /* normal */, once = false) {
            const node = new LinkedCallback(cb, context, priority, once);
            let prev = this.rafHead;
            let current = prev.next;
            if (current === void 0) {
                node.link(prev);
            }
            else {
                do {
                    if (priority > current.priority || (priority === current.priority && once && !current.once)) {
                        node.link(prev);
                        break;
                    }
                    prev = current;
                    current = current.next;
                } while (current !== void 0);
                if (node.prev === void 0) {
                    node.link(prev);
                }
            }
            if (node.next === void 0) {
                this.rafTail = node;
            }
            this.startTicking();
        }
        dequeueRAF(cb, context = void 0) {
            let current = this.rafHead.next;
            while (current !== void 0) {
                if (current.equals(cb, context)) {
                    current = current.unlink();
                }
                else {
                    current = current.next;
                }
            }
        }
        processRAFQueue(flags, timestamp = PLATFORM.now()) {
            if (this.isFlushingRAF) {
                return;
            }
            this.isFlushingRAF = true;
            if (timestamp > this.rafStartTime) {
                const prevFrameDuration = this.prevFrameDuration = timestamp - this.rafStartTime;
                if (prevFrameDuration + 1 < this.minFrameDuration) {
                    return;
                }
                let i = 0;
                if (this.adaptiveTimeslicing && this.maxFrameDuration > 0) {
                    // Clamp the factor between 10 and 0.1 to prevent hanging or unjustified skipping during sudden shifts in workload
                    this.frameDurationFactor = min(max(this.frameDurationFactor * (this.maxFrameDuration / prevFrameDuration), 0.1), 10);
                }
                else {
                    this.frameDurationFactor = 1;
                }
                const deadlineLow = timestamp + max(this.maxFrameDuration * this.frameDurationFactor, 1);
                const deadlineNormal = timestamp + max(this.maxFrameDuration * this.frameDurationFactor * 5, 5);
                const deadlineHigh = timestamp + max(this.maxFrameDuration * this.frameDurationFactor * 15, 15);
                flags |= 256 /* fromTick */;
                do {
                    this.pendingChanges = 0;
                    let current = this.rafHead.next;
                    while (current !== void 0) {
                        // only call performance.now() every 10 calls to reduce the overhead (is this low enough though?)
                        if (++i === 10) {
                            i = 0;
                            if (this.timeslicingEnabled) {
                                const { priority } = current;
                                const now = PLATFORM.now();
                                if (priority <= 4096 /* low */) {
                                    if (now >= deadlineLow) {
                                        current.rotate();
                                        if (current.last != void 0 && current.last.next != void 0) {
                                            current = current.last.next;
                                        }
                                        else {
                                            break;
                                        }
                                    }
                                }
                                else if (priority < 28672 /* high */) {
                                    if (now >= deadlineNormal) {
                                        current.rotate();
                                        if (current.last != void 0 && current.last.next != void 0) {
                                            current = current.last.next;
                                        }
                                        else {
                                            break;
                                        }
                                    }
                                }
                                else {
                                    if (now >= deadlineHigh) {
                                        current.rotate();
                                        if (current.last != void 0 && current.last.next != void 0) {
                                            current = current.last.next;
                                        }
                                        else {
                                            break;
                                        }
                                    }
                                }
                            }
                        }
                        current = current.call(flags);
                    }
                } while (this.pendingChanges > 0);
                if (this.rafHead.next === void 0) {
                    this.stopTicking();
                }
            }
            this.rafStartTime = timestamp;
            this.isFlushingRAF = false;
        }
        enableTimeslicing(adaptive = true) {
            this.timeslicingEnabled = true;
            this.adaptiveTimeslicing = adaptive === true;
        }
        disableTimeslicing() {
            this.timeslicingEnabled = false;
        }
    }

    // TODO: add connect-queue (or something similar) back in when everything else is working, to improve startup time
    const slice$3 = Array.prototype.slice;
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
        const observerSlots = this.observerSlots == null ? 0 : this.observerSlots;
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
            observer[this.id] |= 16 /* updateTargetInstance */;
            // increment the slot count.
            if (i === observerSlots) {
                this.observerSlots = i + 1;
            }
        }
        // set the "version" when the observer was used.
        if (this.version == null) {
            this.version = 0;
        }
        this[versionSlotNames[i]] = this.version;
        ensureEnoughSlotNames(i);
    }
    /** @internal */
    function observeProperty(flags, obj, propertyName) {
        if (Tracer.enabled) {
            Tracer.enter(this['constructor'].name, 'observeProperty', slice$3.call(arguments));
        }
        const observer = this.observerLocator.getObserver(flags, obj, propertyName);
        /* Note: we need to cast here because we can indeed get an accessor instead of an observer,
         *  in which case the call to observer.subscribe will throw. It's not very clean and we can solve this in 2 ways:
         *  1. Fail earlier: only let the locator resolve observers from .getObserver, and throw if no branches are left (e.g. it would otherwise return an accessor)
         *  2. Fail silently (without throwing): give all accessors a no-op subscribe method
         *
         * We'll probably want to implement some global configuration (like a "strict" toggle) so users can pick between enforced correctness vs. ease-of-use
         */
        this.addObserver(observer);
        if (Tracer.enabled) {
            Tracer.leave();
        }
    }
    /** @internal */
    function unobserve(all) {
        const slots = this.observerSlots;
        let slotName;
        let observer;
        if (all === true) {
            for (let i = 0; i < slots; ++i) {
                slotName = slotNames[i];
                observer = this[slotName];
                if (observer != null) {
                    this[slotName] = void 0;
                    observer.unsubscribe(this);
                    observer[this.id] &= ~16 /* updateTargetInstance */;
                }
            }
        }
        else {
            const version = this.version;
            for (let i = 0; i < slots; ++i) {
                if (this[versionSlotNames[i]] !== version) {
                    slotName = slotNames[i];
                    observer = this[slotName];
                    if (observer != null) {
                        this[slotName] = void 0;
                        observer.unsubscribe(this);
                        observer[this.id] &= ~16 /* updateTargetInstance */;
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
        return target == null ? connectableDecorator : connectableDecorator(target);
    }
    let value = 0;
    connectable.assignIdTo = (instance) => {
        instance.id = ++value;
    };

    const slice$4 = Array.prototype.slice;
    // BindingMode is not a const enum (and therefore not inlined), so assigning them to a variable to save a member accessor is a minor perf tweak
    const { oneTime, toView, fromView } = BindingMode;
    // pre-combining flags for bitwise checks is a minor perf tweak
    const toViewOrOneTime = toView | oneTime;
    let Binding = class Binding {
        constructor(sourceExpression, target, targetProperty, mode, observerLocator, locator) {
            connectable.assignIdTo(this);
            this.$state = 0 /* none */;
            this.$lifecycle = locator.get(ILifecycle);
            this.$scope = void 0;
            this.locator = locator;
            this.mode = mode;
            this.observerLocator = observerLocator;
            this.sourceExpression = sourceExpression;
            this.target = target;
            this.targetProperty = targetProperty;
            this.targetObserver = void 0;
            this.persistentFlags = 0 /* none */;
        }
        updateTarget(value, flags) {
            flags |= this.persistentFlags;
            this.targetObserver.setValue(value, flags);
        }
        updateSource(value, flags) {
            flags |= this.persistentFlags;
            this.sourceExpression.assign(flags, this.$scope, this.locator, value);
        }
        handleChange(newValue, _previousValue, flags) {
            if (Tracer.enabled) {
                Tracer.enter('Binding', 'handleChange', slice$4.call(arguments));
            }
            if ((this.$state & 4 /* isBound */) === 0) {
                if (Tracer.enabled) {
                    Tracer.leave();
                }
                return;
            }
            flags |= this.persistentFlags;
            if ((flags & 16 /* updateTargetInstance */) > 0) {
                const previousValue = this.targetObserver.getValue();
                // if the only observable is an AccessScope then we can assume the passed-in newValue is the correct and latest value
                if (this.sourceExpression.$kind !== 10082 /* AccessScope */ || this.observerSlots > 1) {
                    newValue = this.sourceExpression.evaluate(flags, this.$scope, this.locator);
                }
                if (newValue !== previousValue) {
                    this.updateTarget(newValue, flags);
                }
                if ((this.mode & oneTime) === 0) {
                    this.version++;
                    this.sourceExpression.connect(flags, this.$scope, this);
                    this.unobserve(false);
                }
                if (Tracer.enabled) {
                    Tracer.leave();
                }
                return;
            }
            if ((flags & 32 /* updateSourceExpression */) > 0) {
                if (newValue !== this.sourceExpression.evaluate(flags, this.$scope, this.locator)) {
                    this.updateSource(newValue, flags);
                }
                if (Tracer.enabled) {
                    Tracer.leave();
                }
                return;
            }
            if (Tracer.enabled) {
                Tracer.leave();
            }
            throw Reporter.error(15, flags);
        }
        $bind(flags, scope) {
            if (Tracer.enabled) {
                Tracer.enter('Binding', '$bind', slice$4.call(arguments));
            }
            if (this.$state & 4 /* isBound */) {
                if (this.$scope === scope) {
                    if (Tracer.enabled) {
                        Tracer.leave();
                    }
                    return;
                }
                this.$unbind(flags | 4096 /* fromBind */);
            }
            // add isBinding flag
            this.$state |= 1 /* isBinding */;
            // Store flags which we can only receive during $bind and need to pass on
            // to the AST during evaluate/connect/assign
            this.persistentFlags = flags & 536870927 /* persistentBindingFlags */;
            this.$scope = scope;
            let sourceExpression = this.sourceExpression;
            if (hasBind(sourceExpression)) {
                sourceExpression.bind(flags, scope, this);
            }
            let targetObserver = this.targetObserver;
            if (!targetObserver) {
                if (this.mode & fromView) {
                    targetObserver = this.targetObserver = this.observerLocator.getObserver(flags, this.target, this.targetProperty);
                }
                else {
                    targetObserver = this.targetObserver = this.observerLocator.getAccessor(flags, this.target, this.targetProperty);
                }
            }
            if (this.mode !== BindingMode.oneTime && targetObserver.bind) {
                targetObserver.bind(flags);
            }
            // during bind, binding behavior might have changed sourceExpression
            sourceExpression = this.sourceExpression;
            if (this.mode & toViewOrOneTime) {
                this.updateTarget(sourceExpression.evaluate(flags, scope, this.locator), flags);
            }
            if (this.mode & toView) {
                sourceExpression.connect(flags, scope, this);
            }
            if (this.mode & fromView) {
                targetObserver.subscribe(this);
                targetObserver[this.id] |= 32 /* updateSourceExpression */;
            }
            // add isBound flag and remove isBinding flag
            this.$state |= 4 /* isBound */;
            this.$state &= ~1 /* isBinding */;
            if (Tracer.enabled) {
                Tracer.leave();
            }
        }
        $unbind(flags) {
            if (Tracer.enabled) {
                Tracer.enter('Binding', '$unbind', slice$4.call(arguments));
            }
            if (!(this.$state & 4 /* isBound */)) {
                if (Tracer.enabled) {
                    Tracer.leave();
                }
                return;
            }
            // add isUnbinding flag
            this.$state |= 2 /* isUnbinding */;
            // clear persistent flags
            this.persistentFlags = 0 /* none */;
            if (hasUnbind(this.sourceExpression)) {
                this.sourceExpression.unbind(flags, this.$scope, this);
            }
            this.$scope = void 0;
            if (this.targetObserver.unbind) {
                this.targetObserver.unbind(flags);
            }
            if (this.targetObserver.unsubscribe) {
                this.targetObserver.unsubscribe(this);
                this.targetObserver[this.id] &= ~32 /* updateSourceExpression */;
            }
            this.unobserve(true);
            // remove isBound and isUnbinding flags
            this.$state &= ~(4 /* isBound */ | 2 /* isUnbinding */);
            if (Tracer.enabled) {
                Tracer.leave();
            }
        }
    };
    Binding = __decorate([
        connectable()
    ], Binding);

    const slice$5 = Array.prototype.slice;
    class Call {
        constructor(sourceExpression, target, targetProperty, observerLocator, locator) {
            this.$state = 0 /* none */;
            this.locator = locator;
            this.sourceExpression = sourceExpression;
            this.targetObserver = observerLocator.getObserver(0 /* none */, target, targetProperty);
        }
        callSource(args) {
            if (Tracer.enabled) {
                Tracer.enter('Call', 'callSource', slice$5.call(arguments));
            }
            const overrideContext = this.$scope.overrideContext;
            Object.assign(overrideContext, args);
            const result = this.sourceExpression.evaluate(2097152 /* mustEvaluate */, this.$scope, this.locator);
            for (const prop in args) {
                Reflect.deleteProperty(overrideContext, prop);
            }
            if (Tracer.enabled) {
                Tracer.leave();
            }
            return result;
        }
        $bind(flags, scope) {
            if (Tracer.enabled) {
                Tracer.enter('Call', '$bind', slice$5.call(arguments));
            }
            if (this.$state & 4 /* isBound */) {
                if (this.$scope === scope) {
                    if (Tracer.enabled) {
                        Tracer.leave();
                    }
                    return;
                }
                this.$unbind(flags | 4096 /* fromBind */);
            }
            // add isBinding flag
            this.$state |= 1 /* isBinding */;
            this.$scope = scope;
            if (hasBind(this.sourceExpression)) {
                this.sourceExpression.bind(flags, scope, this);
            }
            this.targetObserver.setValue(($args) => this.callSource($args), flags);
            // add isBound flag and remove isBinding flag
            this.$state |= 4 /* isBound */;
            this.$state &= ~1 /* isBinding */;
            if (Tracer.enabled) {
                Tracer.leave();
            }
        }
        $unbind(flags) {
            if (Tracer.enabled) {
                Tracer.enter('Call', '$unbind', slice$5.call(arguments));
            }
            if (!(this.$state & 4 /* isBound */)) {
                if (Tracer.enabled) {
                    Tracer.leave();
                }
                return;
            }
            // add isUnbinding flag
            this.$state |= 2 /* isUnbinding */;
            if (hasUnbind(this.sourceExpression)) {
                this.sourceExpression.unbind(flags, this.$scope, this);
            }
            this.$scope = void 0;
            this.targetObserver.setValue(null, flags);
            // remove isBound and isUnbinding flags
            this.$state &= ~(4 /* isBound */ | 2 /* isUnbinding */);
            if (Tracer.enabled) {
                Tracer.leave();
            }
        }
        observeProperty(flags, obj, propertyName) {
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
                    if (found === void 0) {
                        found = this.interpolationLookup[expression] = this.parseCore(expression, bindingType);
                    }
                    return found;
                }
                case 539 /* ForCommand */: {
                    let found = this.forOfLookup[expression];
                    if (found === void 0) {
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
                    if (found === void 0) {
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
                    case 6199 /* ForOfStatement */:
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
            this.$state = 0 /* none */;
            this.$scope = void 0;
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
            if (this.$state & 4 /* isBound */) {
                if (this.$scope === scope) {
                    return;
                }
                this.$unbind(flags);
            }
            this.$state |= 4 /* isBound */;
            this.$scope = scope;
            const parts = this.parts;
            for (let i = 0, ii = parts.length; i < ii; ++i) {
                parts[i].$bind(flags, scope);
            }
        }
        $unbind(flags) {
            if (!(this.$state & 4 /* isBound */)) {
                return;
            }
            this.$state &= ~4 /* isBound */;
            this.$scope = void 0;
            const parts = this.parts;
            for (let i = 0, ii = parts.length; i < ii; ++i) {
                parts[i].$unbind(flags);
            }
        }
    }
    let InterpolationBinding = class InterpolationBinding {
        // tslint:disable-next-line:parameters-max-number
        constructor(sourceExpression, interpolation, target, targetProperty, mode, observerLocator, locator, isFirst) {
            connectable.assignIdTo(this);
            this.$state = 0 /* none */;
            this.interpolation = interpolation;
            this.isFirst = isFirst;
            this.mode = mode;
            this.locator = locator;
            this.observerLocator = observerLocator;
            this.sourceExpression = sourceExpression;
            this.target = target;
            this.targetProperty = targetProperty;
            this.targetObserver = observerLocator.getAccessor(0 /* none */, target, targetProperty);
        }
        updateTarget(value, flags) {
            this.targetObserver.setValue(value, flags | 16 /* updateTargetInstance */);
        }
        handleChange(_newValue, _previousValue, flags) {
            if (!(this.$state & 4 /* isBound */)) {
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
            if (this.$state & 4 /* isBound */) {
                if (this.$scope === scope) {
                    return;
                }
                this.$unbind(flags);
            }
            this.$state |= 4 /* isBound */;
            this.$scope = scope;
            const sourceExpression = this.sourceExpression;
            if (sourceExpression.bind) {
                sourceExpression.bind(flags, scope, this);
            }
            if (this.mode !== BindingMode.oneTime && this.targetObserver.bind) {
                this.targetObserver.bind(flags);
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
            if (!(this.$state & 4 /* isBound */)) {
                return;
            }
            this.$state &= ~4 /* isBound */;
            const sourceExpression = this.sourceExpression;
            if (sourceExpression.unbind) {
                sourceExpression.unbind(flags, this.$scope, this);
            }
            if (this.targetObserver.unbind) {
                this.targetObserver.unbind(flags);
            }
            this.$scope = void 0;
            this.unobserve(true);
        }
    };
    InterpolationBinding = __decorate([
        connectable()
    ], InterpolationBinding);

    const slice$6 = Array.prototype.slice;
    let LetBinding = class LetBinding {
        constructor(sourceExpression, targetProperty, observerLocator, locator, toViewModel = false) {
            connectable.assignIdTo(this);
            this.$state = 0 /* none */;
            this.$lifecycle = locator.get(ILifecycle);
            this.$scope = void 0;
            this.locator = locator;
            this.observerLocator = observerLocator;
            this.sourceExpression = sourceExpression;
            this.target = null;
            this.targetProperty = targetProperty;
            this.toViewModel = toViewModel;
        }
        handleChange(_newValue, _previousValue, flags) {
            if (Tracer.enabled) {
                Tracer.enter('LetBinding', 'handleChange', slice$6.call(arguments));
            }
            if (!(this.$state & 4 /* isBound */)) {
                if (Tracer.enabled) {
                    Tracer.leave();
                }
                return;
            }
            if (flags & 16 /* updateTargetInstance */) {
                const { target, targetProperty } = this;
                const previousValue = target[targetProperty];
                const newValue = this.sourceExpression.evaluate(flags, this.$scope, this.locator);
                if (newValue !== previousValue) {
                    target[targetProperty] = newValue;
                }
                if (Tracer.enabled) {
                    Tracer.leave();
                }
                return;
            }
            throw Reporter.error(15, flags);
        }
        $bind(flags, scope) {
            if (Tracer.enabled) {
                Tracer.enter('LetBinding', '$bind', slice$6.call(arguments));
            }
            if (this.$state & 4 /* isBound */) {
                if (this.$scope === scope) {
                    if (Tracer.enabled) {
                        Tracer.leave();
                    }
                    return;
                }
                this.$unbind(flags | 4096 /* fromBind */);
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
            this.target[this.targetProperty] = this.sourceExpression.evaluate(4096 /* fromBind */, scope, this.locator);
            this.sourceExpression.connect(flags, scope, this);
            // add isBound flag and remove isBinding flag
            this.$state |= 4 /* isBound */;
            this.$state &= ~1 /* isBinding */;
            if (Tracer.enabled) {
                Tracer.leave();
            }
        }
        $unbind(flags) {
            if (Tracer.enabled) {
                Tracer.enter('LetBinding', '$unbind', slice$6.call(arguments));
            }
            if (!(this.$state & 4 /* isBound */)) {
                if (Tracer.enabled) {
                    Tracer.leave();
                }
                return;
            }
            // add isUnbinding flag
            this.$state |= 2 /* isUnbinding */;
            const sourceExpression = this.sourceExpression;
            if (sourceExpression.unbind) {
                sourceExpression.unbind(flags, this.$scope, this);
            }
            this.$scope = void 0;
            this.unobserve(true);
            // remove isBound and isUnbinding flags
            this.$state &= ~(4 /* isBound */ | 2 /* isUnbinding */);
            if (Tracer.enabled) {
                Tracer.leave();
            }
        }
    };
    LetBinding = __decorate([
        connectable()
    ], LetBinding);

    const slice$7 = Array.prototype.slice;
    class Ref {
        constructor(sourceExpression, target, locator) {
            this.$state = 0 /* none */;
            this.$scope = void 0;
            this.locator = locator;
            this.sourceExpression = sourceExpression;
            this.target = target;
        }
        $bind(flags, scope) {
            if (Tracer.enabled) {
                Tracer.enter('Ref', '$bind', slice$7.call(arguments));
            }
            if (this.$state & 4 /* isBound */) {
                if (this.$scope === scope) {
                    if (Tracer.enabled) {
                        Tracer.leave();
                    }
                    return;
                }
                this.$unbind(flags | 4096 /* fromBind */);
            }
            // add isBinding flag
            this.$state |= 1 /* isBinding */;
            this.$scope = scope;
            if (hasBind(this.sourceExpression)) {
                this.sourceExpression.bind(flags, scope, this);
            }
            this.sourceExpression.assign(flags, this.$scope, this.locator, this.target);
            // add isBound flag and remove isBinding flag
            this.$state |= 4 /* isBound */;
            this.$state &= ~1 /* isBinding */;
            if (Tracer.enabled) {
                Tracer.leave();
            }
        }
        $unbind(flags) {
            if (Tracer.enabled) {
                Tracer.enter('Ref', '$unbind', slice$7.call(arguments));
            }
            if (!(this.$state & 4 /* isBound */)) {
                if (Tracer.enabled) {
                    Tracer.leave();
                }
                return;
            }
            // add isUnbinding flag
            this.$state |= 2 /* isUnbinding */;
            if (this.sourceExpression.evaluate(flags, this.$scope, this.locator) === this.target) {
                this.sourceExpression.assign(flags, this.$scope, this.locator, null);
            }
            const sourceExpression = this.sourceExpression;
            if (hasUnbind(sourceExpression)) {
                sourceExpression.unbind(flags, this.$scope, this);
            }
            this.$scope = void 0;
            // remove isBound and isUnbinding flags
            this.$state &= ~(4 /* isBound */ | 2 /* isUnbinding */);
            if (Tracer.enabled) {
                Tracer.leave();
            }
        }
        observeProperty(flags, obj, propertyName) {
            return;
        }
        handleChange(newValue, previousValue, flags) {
            return;
        }
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
    var CollectionKind;
    (function (CollectionKind) {
        CollectionKind[CollectionKind["indexed"] = 8] = "indexed";
        CollectionKind[CollectionKind["keyed"] = 4] = "keyed";
        CollectionKind[CollectionKind["array"] = 9] = "array";
        CollectionKind[CollectionKind["map"] = 6] = "map";
        CollectionKind[CollectionKind["set"] = 7] = "set";
    })(CollectionKind || (CollectionKind = {}));
    function copyIndexMap(existing, deletedItems) {
        const { length } = existing;
        const arr = Array(length);
        let i = 0;
        while (i < length) {
            arr[i] = existing[i];
            ++i;
        }
        if (deletedItems !== void 0) {
            arr.deletedItems = deletedItems.slice(0);
        }
        else if (existing.deletedItems !== void 0) {
            arr.deletedItems = existing.deletedItems.slice(0);
        }
        else {
            arr.deletedItems = [];
        }
        arr.isIndexMap = true;
        return arr;
    }
    function createIndexMap(length = 0) {
        const arr = Array(length);
        let i = 0;
        while (i < length) {
            arr[i] = i++;
        }
        arr.deletedItems = [];
        arr.isIndexMap = true;
        return arr;
    }
    function cloneIndexMap(indexMap) {
        const clone = indexMap.slice();
        clone.deletedItems = indexMap.deletedItems.slice();
        clone.isIndexMap = true;
        return clone;
    }
    function isIndexMap(value) {
        return value instanceof Array && value.isIndexMap === true;
    }

    let CollectionLengthObserver = class CollectionLengthObserver {
        constructor(obj) {
            this.obj = obj;
            this.currentValue = obj.length;
        }
        getValue() {
            return this.obj.length;
        }
        setValue(newValue, flags) {
            const { currentValue } = this;
            if (newValue !== currentValue) {
                this.currentValue = newValue;
                this.callSubscribers(newValue, currentValue, flags | 16 /* updateTargetInstance */);
            }
        }
    };
    CollectionLengthObserver = __decorate([
        subscriberCollection()
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
        if (x === void 0) {
            if (y === void 0) {
                return 0;
            }
            else {
                return 1;
            }
        }
        if (y === void 0) {
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
            let $this = this;
            if ($this.$raw !== void 0) {
                $this = $this.$raw;
            }
            const o = $this.$observer;
            if (o === void 0) {
                return $push.apply($this, arguments);
            }
            const len = $this.length;
            const argCount = arguments.length;
            if (argCount === 0) {
                return len;
            }
            $this.length = o.indexMap.length = len + argCount;
            let i = len;
            while (i < $this.length) {
                $this[i] = arguments[i - len];
                o.indexMap[i] = -2;
                i++;
            }
            o.notify();
            return $this.length;
        },
        // https://tc39.github.io/ecma262/#sec-array.prototype.unshift
        unshift: function () {
            let $this = this;
            if ($this.$raw !== void 0) {
                $this = $this.$raw;
            }
            const o = $this.$observer;
            if (o === void 0) {
                return $unshift.apply($this, arguments);
            }
            const argCount = arguments.length;
            const inserts = new Array(argCount);
            let i = 0;
            while (i < argCount) {
                inserts[i++] = -2;
            }
            $unshift.apply(o.indexMap, inserts);
            const len = $unshift.apply($this, arguments);
            o.notify();
            return len;
        },
        // https://tc39.github.io/ecma262/#sec-array.prototype.pop
        pop: function () {
            let $this = this;
            if ($this.$raw !== void 0) {
                $this = $this.$raw;
            }
            const o = $this.$observer;
            if (o === void 0) {
                return $pop.call($this);
            }
            const indexMap = o.indexMap;
            const element = $pop.call($this);
            // only mark indices as deleted if they actually existed in the original array
            const index = indexMap.length - 1;
            if (indexMap[index] > -1) {
                indexMap.deletedItems.push(indexMap[index]);
            }
            $pop.call(indexMap);
            o.notify();
            return element;
        },
        // https://tc39.github.io/ecma262/#sec-array.prototype.shift
        shift: function () {
            let $this = this;
            if ($this.$raw !== void 0) {
                $this = $this.$raw;
            }
            const o = $this.$observer;
            if (o === void 0) {
                return $shift.call($this);
            }
            const indexMap = o.indexMap;
            const element = $shift.call($this);
            // only mark indices as deleted if they actually existed in the original array
            if (indexMap[0] > -1) {
                indexMap.deletedItems.push(indexMap[0]);
            }
            $shift.call(indexMap);
            o.notify();
            return element;
        },
        // https://tc39.github.io/ecma262/#sec-array.prototype.splice
        splice: function (start, deleteCount) {
            let $this = this;
            if ($this.$raw !== void 0) {
                $this = $this.$raw;
            }
            const o = $this.$observer;
            if (o === void 0) {
                return $splice.apply($this, arguments);
            }
            const indexMap = o.indexMap;
            if (deleteCount > 0) {
                let i = isNaN(start) ? 0 : start;
                const to = i + deleteCount;
                while (i < to) {
                    if (indexMap[i] > -1) {
                        indexMap.deletedItems.push(indexMap[i]);
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
            const deleted = $splice.apply($this, arguments);
            o.notify();
            return deleted;
        },
        // https://tc39.github.io/ecma262/#sec-array.prototype.reverse
        reverse: function () {
            let $this = this;
            if ($this.$raw !== void 0) {
                $this = $this.$raw;
            }
            const o = $this.$observer;
            if (o === void 0) {
                $reverse.call($this);
                return this;
            }
            const len = $this.length;
            const middle = (len / 2) | 0;
            let lower = 0;
            // tslint:disable:no-statements-same-line
            while (lower !== middle) {
                const upper = len - lower - 1;
                const lowerValue = $this[lower];
                const lowerIndex = o.indexMap[lower];
                const upperValue = $this[upper];
                const upperIndex = o.indexMap[upper];
                $this[lower] = upperValue;
                o.indexMap[lower] = upperIndex;
                $this[upper] = lowerValue;
                o.indexMap[upper] = lowerIndex;
                lower++;
            }
            // tslint:enable:no-statements-same-line
            o.notify();
            return this;
        },
        // https://tc39.github.io/ecma262/#sec-array.prototype.sort
        // https://github.com/v8/v8/blob/master/src/js/array.js
        sort: function (compareFn) {
            let $this = this;
            if ($this.$raw !== void 0) {
                $this = $this.$raw;
            }
            const o = $this.$observer;
            if (o === void 0) {
                $sort.call($this, compareFn);
                return this;
            }
            const len = $this.length;
            if (len < 2) {
                return this;
            }
            quickSort($this, o.indexMap, 0, len, preSortCompare);
            let i = 0;
            while (i < len) {
                if ($this[i] === void 0) {
                    break;
                }
                i++;
            }
            if (compareFn === void 0 || typeof compareFn !== 'function' /*spec says throw a TypeError, should we do that too?*/) {
                compareFn = sortCompare;
            }
            quickSort($this, o.indexMap, 0, i, compareFn);
            o.notify();
            return this;
        }
    };
    const descriptorProps = {
        writable: true,
        enumerable: false,
        configurable: true
    };
    const def = Reflect.defineProperty;
    for (const method of methods) {
        def(observe[method], 'observing', { value: true, writable: false, configurable: false, enumerable: false });
    }
    let enableArrayObservationCalled = false;
    function enableArrayObservation() {
        for (const method of methods) {
            if (proto[method].observing !== true) {
                def(proto, method, { ...descriptorProps, value: observe[method] });
            }
        }
    }
    function disableArrayObservation() {
        for (const method of methods) {
            if (proto[method].observing === true) {
                def(proto, method, { ...descriptorProps, value: native[method] });
            }
        }
    }
    const slice$8 = Array.prototype.slice;
    let ArrayObserver = class ArrayObserver {
        constructor(flags, lifecycle, array) {
            if (Tracer.enabled) {
                Tracer.enter('ArrayObserver', 'constructor', slice$8.call(arguments));
            }
            if (!enableArrayObservationCalled) {
                enableArrayObservationCalled = true;
                enableArrayObservation();
            }
            this.inBatch = false;
            this.collection = array;
            this.persistentFlags = flags & 536870927 /* persistentBindingFlags */;
            this.indexMap = createIndexMap(array.length);
            this.lifecycle = lifecycle;
            this.lengthObserver = (void 0);
            Reflect.defineProperty(array, '$observer', {
                value: this,
                enumerable: false,
                writable: true,
                configurable: true,
            });
            if (Tracer.enabled) {
                Tracer.leave();
            }
        }
        notify() {
            if (this.lifecycle.batch.depth > 0) {
                if (!this.inBatch) {
                    this.inBatch = true;
                    this.lifecycle.batch.add(this);
                }
            }
            else {
                this.flushBatch(0 /* none */);
            }
        }
        getLengthObserver() {
            if (this.lengthObserver === void 0) {
                this.lengthObserver = new CollectionLengthObserver(this.collection);
            }
            return this.lengthObserver;
        }
        flushBatch(flags) {
            this.inBatch = false;
            const { indexMap, collection } = this;
            const { length } = collection;
            this.indexMap = createIndexMap(length);
            this.callCollectionSubscribers(indexMap, 16 /* updateTargetInstance */ | this.persistentFlags);
            if (this.lengthObserver !== void 0) {
                this.lengthObserver.setValue(length, 16 /* updateTargetInstance */);
            }
        }
    };
    ArrayObserver = __decorate([
        collectionSubscriberCollection()
    ], ArrayObserver);
    function getArrayObserver(flags, lifecycle, array) {
        if (array.$observer === void 0) {
            array.$observer = new ArrayObserver(flags, lifecycle, array);
        }
        return array.$observer;
    }

    let CollectionSizeObserver = class CollectionSizeObserver {
        constructor(obj) {
            this.obj = obj;
            this.currentValue = obj.size;
        }
        getValue() {
            return this.obj.size;
        }
        setValue(newValue, flags) {
            const { currentValue } = this;
            if (newValue !== currentValue) {
                this.currentValue = newValue;
                this.callSubscribers(newValue, currentValue, flags | 16 /* updateTargetInstance */);
            }
        }
    };
    CollectionSizeObserver = __decorate([
        subscriberCollection()
    ], CollectionSizeObserver);

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
            let $this = this;
            if ($this.$raw !== undefined) {
                $this = $this.$raw;
            }
            const o = $this.$observer;
            if (o === undefined) {
                $set.call($this, key, value);
                return this;
            }
            const oldSize = $this.size;
            $set.call($this, key, value);
            const newSize = $this.size;
            if (newSize === oldSize) {
                let i = 0;
                for (const entry of $this.entries()) {
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
            o.notify();
            return this;
        },
        // https://tc39.github.io/ecma262/#sec-map.prototype.clear
        clear: function () {
            let $this = this;
            if ($this.$raw !== undefined) {
                $this = $this.$raw;
            }
            const o = $this.$observer;
            if (o === undefined) {
                return $clear.call($this);
            }
            const size = $this.size;
            if (size > 0) {
                const indexMap = o.indexMap;
                let i = 0;
                for (const entry of $this.keys()) {
                    if (indexMap[i] > -1) {
                        indexMap.deletedItems.push(indexMap[i]);
                    }
                    i++;
                }
                $clear.call($this);
                indexMap.length = 0;
                o.notify();
            }
            return undefined;
        },
        // https://tc39.github.io/ecma262/#sec-map.prototype.delete
        delete: function (value) {
            let $this = this;
            if ($this.$raw !== undefined) {
                $this = $this.$raw;
            }
            const o = $this.$observer;
            if (o === undefined) {
                return $delete.call($this, value);
            }
            const size = $this.size;
            if (size === 0) {
                return false;
            }
            let i = 0;
            const indexMap = o.indexMap;
            for (const entry of $this.keys()) {
                if (entry === value) {
                    if (indexMap[i] > -1) {
                        indexMap.deletedItems.push(indexMap[i]);
                    }
                    indexMap.splice(i, 1);
                    return $delete.call($this, value);
                }
                i++;
            }
            o.notify();
            return false;
        }
    };
    const descriptorProps$1 = {
        writable: true,
        enumerable: false,
        configurable: true
    };
    const def$1 = Reflect.defineProperty;
    for (const method of methods$1) {
        def$1(observe$1[method], 'observing', { value: true, writable: false, configurable: false, enumerable: false });
    }
    let enableMapObservationCalled = false;
    function enableMapObservation() {
        for (const method of methods$1) {
            if (proto$1[method].observing !== true) {
                def$1(proto$1, method, { ...descriptorProps$1, value: observe$1[method] });
            }
        }
    }
    function disableMapObservation() {
        for (const method of methods$1) {
            if (proto$1[method].observing === true) {
                def$1(proto$1, method, { ...descriptorProps$1, value: native$1[method] });
            }
        }
    }
    const slice$9 = Array.prototype.slice;
    let MapObserver = class MapObserver {
        constructor(flags, lifecycle, map) {
            if (Tracer.enabled) {
                Tracer.enter('MapObserver', 'constructor', slice$9.call(arguments));
            }
            if (!enableMapObservationCalled) {
                enableMapObservationCalled = true;
                enableMapObservation();
            }
            this.inBatch = false;
            this.collection = map;
            this.persistentFlags = flags & 536870927 /* persistentBindingFlags */;
            this.indexMap = createIndexMap(map.size);
            this.lifecycle = lifecycle;
            this.lengthObserver = (void 0);
            map.$observer = this;
            if (Tracer.enabled) {
                Tracer.leave();
            }
        }
        notify() {
            if (this.lifecycle.batch.depth > 0) {
                if (!this.inBatch) {
                    this.inBatch = true;
                    this.lifecycle.batch.add(this);
                }
            }
            else {
                this.flushBatch(0 /* none */);
            }
        }
        getLengthObserver() {
            if (this.lengthObserver === void 0) {
                this.lengthObserver = new CollectionSizeObserver(this.collection);
            }
            return this.lengthObserver;
        }
        flushBatch(flags) {
            this.inBatch = false;
            const { indexMap, collection } = this;
            const { size } = collection;
            this.indexMap = createIndexMap(size);
            this.callCollectionSubscribers(indexMap, 16 /* updateTargetInstance */ | this.persistentFlags);
            if (this.lengthObserver !== void 0) {
                this.lengthObserver.setValue(size, 16 /* updateTargetInstance */);
            }
        }
    };
    MapObserver = __decorate([
        collectionSubscriberCollection()
    ], MapObserver);
    function getMapObserver(flags, lifecycle, map) {
        if (map.$observer === void 0) {
            map.$observer = new MapObserver(flags, lifecycle, map);
        }
        return map.$observer;
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
            let $this = this;
            if ($this.$raw !== undefined) {
                $this = $this.$raw;
            }
            const o = $this.$observer;
            if (o === undefined) {
                $add.call($this, value);
                return this;
            }
            const oldSize = $this.size;
            $add.call($this, value);
            const newSize = $this.size;
            if (newSize === oldSize) {
                return this;
            }
            o.indexMap[oldSize] = -2;
            o.notify();
            return this;
        },
        // https://tc39.github.io/ecma262/#sec-set.prototype.clear
        clear: function () {
            let $this = this;
            if ($this.$raw !== undefined) {
                $this = $this.$raw;
            }
            const o = $this.$observer;
            if (o === undefined) {
                return $clear$1.call($this);
            }
            const size = $this.size;
            if (size > 0) {
                const indexMap = o.indexMap;
                let i = 0;
                for (const entry of $this.keys()) {
                    if (indexMap[i] > -1) {
                        indexMap.deletedItems.push(indexMap[i]);
                    }
                    i++;
                }
                $clear$1.call($this);
                indexMap.length = 0;
                o.notify();
            }
            return undefined;
        },
        // https://tc39.github.io/ecma262/#sec-set.prototype.delete
        delete: function (value) {
            let $this = this;
            if ($this.$raw !== undefined) {
                $this = $this.$raw;
            }
            const o = $this.$observer;
            if (o === undefined) {
                return $delete$1.call($this, value);
            }
            const size = $this.size;
            if (size === 0) {
                return false;
            }
            let i = 0;
            const indexMap = o.indexMap;
            for (const entry of $this.keys()) {
                if (entry === value) {
                    if (indexMap[i] > -1) {
                        indexMap.deletedItems.push(indexMap[i]);
                    }
                    indexMap.splice(i, 1);
                    return $delete$1.call($this, value);
                }
                i++;
            }
            o.notify();
            return false;
        }
    };
    const descriptorProps$2 = {
        writable: true,
        enumerable: false,
        configurable: true
    };
    const def$2 = Reflect.defineProperty;
    for (const method of methods$2) {
        def$2(observe$2[method], 'observing', { value: true, writable: false, configurable: false, enumerable: false });
    }
    let enableSetObservationCalled = false;
    function enableSetObservation() {
        for (const method of methods$2) {
            if (proto$2[method].observing !== true) {
                def$2(proto$2, method, { ...descriptorProps$2, value: observe$2[method] });
            }
        }
    }
    function disableSetObservation() {
        for (const method of methods$2) {
            if (proto$2[method].observing === true) {
                def$2(proto$2, method, { ...descriptorProps$2, value: native$2[method] });
            }
        }
    }
    const slice$a = Array.prototype.slice;
    let SetObserver = class SetObserver {
        constructor(flags, lifecycle, observedSet) {
            if (Tracer.enabled) {
                Tracer.enter('SetObserver', 'constructor', slice$a.call(arguments));
            }
            if (!enableSetObservationCalled) {
                enableSetObservationCalled = true;
                enableSetObservation();
            }
            this.inBatch = false;
            this.collection = observedSet;
            this.persistentFlags = flags & 536870927 /* persistentBindingFlags */;
            this.indexMap = createIndexMap(observedSet.size);
            this.lifecycle = lifecycle;
            this.lengthObserver = (void 0);
            observedSet.$observer = this;
            if (Tracer.enabled) {
                Tracer.leave();
            }
        }
        notify() {
            if (this.lifecycle.batch.depth > 0) {
                if (!this.inBatch) {
                    this.inBatch = true;
                    this.lifecycle.batch.add(this);
                }
            }
            else {
                this.flushBatch(0 /* none */);
            }
        }
        getLengthObserver() {
            if (this.lengthObserver === void 0) {
                this.lengthObserver = new CollectionSizeObserver(this.collection);
            }
            return this.lengthObserver;
        }
        flushBatch(flags) {
            this.inBatch = false;
            const { indexMap, collection } = this;
            const { size } = collection;
            this.indexMap = createIndexMap(size);
            this.callCollectionSubscribers(indexMap, 16 /* updateTargetInstance */ | this.persistentFlags);
            if (this.lengthObserver !== void 0) {
                this.lengthObserver.setValue(size, 16 /* updateTargetInstance */);
            }
        }
    };
    SetObserver = __decorate([
        collectionSubscriberCollection()
    ], SetObserver);
    function getSetObserver(flags, lifecycle, observedSet) {
        if (observedSet.$observer === void 0) {
            observedSet.$observer = new SetObserver(flags, lifecycle, observedSet);
        }
        return observedSet.$observer;
    }

    const slice$b = Array.prototype.slice;
    function computed(config) {
        return function (target, key) {
            (target.computed || (target.computed = {}))[key] = config;
        };
    }
    const computedOverrideDefaults = { static: false, volatile: false };
    /* @internal */
    function createComputedObserver(flags, observerLocator, dirtyChecker, lifecycle, instance, propertyName, descriptor) {
        if (descriptor.configurable === false) {
            return dirtyChecker.createProperty(instance, propertyName);
        }
        if (descriptor.get) {
            const overrides = instance.constructor.computed && instance.constructor.computed[propertyName] || computedOverrideDefaults;
            if (descriptor.set) {
                if (overrides.volatile) {
                    return new GetterObserver(flags, overrides, instance, propertyName, descriptor, observerLocator, lifecycle);
                }
                return new CustomSetterObserver(instance, propertyName, descriptor);
            }
            return new GetterObserver(flags, overrides, instance, propertyName, descriptor, observerLocator, lifecycle);
        }
        throw Reporter.error(18, propertyName);
    }
    // Used when the getter is dependent solely on changes that happen within the setter.
    let CustomSetterObserver = class CustomSetterObserver {
        constructor(obj, propertyKey, descriptor) {
            this.obj = obj;
            this.propertyKey = propertyKey;
            this.currentValue = this.oldValue = undefined;
            this.descriptor = descriptor;
            this.observing = false;
        }
        setValue(newValue) {
            if (Tracer.enabled) {
                Tracer.enter('CustomSetterObserver', 'setValue', slice$b.call(arguments));
            }
            // tslint:disable-next-line: no-non-null-assertion // Non-null is implied because descriptors without setters won't end up here
            this.descriptor.set.call(this.obj, newValue);
            if (this.currentValue !== newValue) {
                this.oldValue = this.currentValue;
                this.currentValue = newValue;
                this.callSubscribers(newValue, this.oldValue, 16 /* updateTargetInstance */);
            }
            if (Tracer.enabled) {
                Tracer.leave();
            }
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
            if (Tracer.enabled) {
                Tracer.enter('CustomSetterObserver', 'convertProperty', slice$b.call(arguments));
            }
            this.observing = true;
            this.currentValue = this.obj[this.propertyKey];
            const set = (newValue) => { this.setValue(newValue); };
            Reflect.defineProperty(this.obj, this.propertyKey, { set });
            if (Tracer.enabled) {
                Tracer.leave();
            }
        }
    };
    CustomSetterObserver = __decorate([
        subscriberCollection()
    ], CustomSetterObserver);
    // Used when there is no setter, and the getter is dependent on other properties of the object;
    // Used when there is a setter but the value of the getter can change based on properties set outside of the setter.
    /** @internal */
    let GetterObserver = class GetterObserver {
        constructor(flags, overrides, obj, propertyKey, descriptor, observerLocator, lifecycle) {
            this.obj = obj;
            this.propertyKey = propertyKey;
            this.isCollecting = false;
            this.currentValue = this.oldValue = undefined;
            this.propertyDeps = [];
            this.collectionDeps = [];
            this.overrides = overrides;
            this.subscriberCount = 0;
            this.descriptor = descriptor;
            this.proxy = new Proxy(obj, createGetterTraps(flags, observerLocator, this));
            const get = () => this.getValue();
            Reflect.defineProperty(obj, propertyKey, { get });
        }
        addPropertyDep(subscribable) {
            if (this.propertyDeps.indexOf(subscribable) === -1) {
                this.propertyDeps.push(subscribable);
            }
        }
        addCollectionDep(subscribable) {
            if (this.collectionDeps.indexOf(subscribable) === -1) {
                this.collectionDeps.push(subscribable);
            }
        }
        getValue() {
            if (Tracer.enabled) {
                Tracer.enter('GetterObserver', 'getValue', slice$b.call(arguments));
            }
            if (this.subscriberCount === 0 || this.isCollecting) {
                // tslint:disable-next-line: no-non-null-assertion // Non-null is implied because descriptors without getters won't end up here
                this.currentValue = Reflect.apply(this.descriptor.get, this.proxy, PLATFORM.emptyArray);
            }
            else {
                // tslint:disable-next-line: no-non-null-assertion // Non-null is implied because descriptors without getters won't end up here
                this.currentValue = Reflect.apply(this.descriptor.get, this.obj, PLATFORM.emptyArray);
            }
            if (Tracer.enabled) {
                Tracer.leave();
            }
            return this.currentValue;
        }
        subscribe(subscriber) {
            this.addSubscriber(subscriber);
            if (++this.subscriberCount === 1) {
                this.getValueAndCollectDependencies(true);
            }
        }
        unsubscribe(subscriber) {
            this.removeSubscriber(subscriber);
            if (--this.subscriberCount === 0) {
                this.unsubscribeAllDependencies();
            }
        }
        handleChange() {
            const oldValue = this.currentValue;
            const newValue = this.getValueAndCollectDependencies(false);
            if (oldValue !== newValue) {
                this.callSubscribers(newValue, oldValue, 16 /* updateTargetInstance */);
            }
        }
        handleCollectionChange() {
            const oldValue = this.currentValue;
            const newValue = this.getValueAndCollectDependencies(false);
            if (oldValue !== newValue) {
                this.callSubscribers(newValue, oldValue, 16 /* updateTargetInstance */);
            }
        }
        getValueAndCollectDependencies(requireCollect) {
            if (Tracer.enabled) {
                Tracer.enter('GetterObserver', 'getValueAndCollectDependencies', slice$b.call(arguments));
            }
            const dynamicDependencies = !this.overrides.static || requireCollect;
            if (dynamicDependencies) {
                this.unsubscribeAllDependencies();
                this.isCollecting = true;
            }
            this.currentValue = this.getValue();
            if (dynamicDependencies) {
                this.propertyDeps.forEach(x => { x.subscribe(this); });
                this.collectionDeps.forEach(x => { x.subscribeToCollection(this); });
                this.isCollecting = false;
            }
            if (Tracer.enabled) {
                Tracer.leave();
            }
            return this.currentValue;
        }
        doNotCollect(key) {
            return !this.isCollecting || key === '$observers';
        }
        unsubscribeAllDependencies() {
            this.propertyDeps.forEach(x => { x.unsubscribe(this); });
            this.propertyDeps.length = 0;
            this.collectionDeps.forEach(x => { x.unsubscribeFromCollection(this); });
            this.collectionDeps.length = 0;
        }
    };
    GetterObserver = __decorate([
        subscriberCollection()
    ], GetterObserver);
    const toStringTag$1 = Object.prototype.toString;
    function createGetterTraps(flags, observerLocator, observer) {
        if (Tracer.enabled) {
            Tracer.enter('computed', 'createGetterTraps', slice$b.call(arguments));
        }
        const traps = {
            get: function (target, key, receiver) {
                if (Tracer.enabled) {
                    Tracer.enter('computed', 'get', slice$b.call(arguments));
                }
                if (observer.doNotCollect(key)) {
                    if (Tracer.enabled) {
                        Tracer.leave();
                    }
                    return Reflect.get(target, key, receiver);
                }
                // The length and iterator properties need to be invoked on the original object (for Map and Set
                // at least) or they will throw.
                switch (toStringTag$1.call(target)) {
                    case '[object Array]':
                        observer.addCollectionDep(observerLocator.getArrayObserver(flags, target));
                        if (key === 'length') {
                            if (Tracer.enabled) {
                                Tracer.leave();
                            }
                            return Reflect.get(target, key, target);
                        }
                    case '[object Map]':
                        observer.addCollectionDep(observerLocator.getMapObserver(flags, target));
                        if (key === 'size') {
                            if (Tracer.enabled) {
                                Tracer.leave();
                            }
                            return Reflect.get(target, key, target);
                        }
                    case '[object Set]':
                        observer.addCollectionDep(observerLocator.getSetObserver(flags, target));
                        if (key === 'size') {
                            if (Tracer.enabled) {
                                Tracer.leave();
                            }
                            return Reflect.get(target, key, target);
                        }
                    default:
                        observer.addPropertyDep(observerLocator.getObserver(flags, target, key));
                }
                if (Tracer.enabled) {
                    Tracer.leave();
                }
                return proxyOrValue(flags, target, key, observerLocator, observer);
            }
        };
        if (Tracer.enabled) {
            Tracer.leave();
        }
        return traps;
    }
    function proxyOrValue(flags, target, key, observerLocator, observer) {
        const value = Reflect.get(target, key, target);
        if (typeof value === 'function') {
            // tslint:disable-next-line: ban-types // We need Function's bind() method here
            return target[key].bind(target);
        }
        if (typeof value !== 'object' || value === null) {
            return value;
        }
        return new Proxy(value, createGetterTraps(flags, observerLocator, observer));
    }

    const IDirtyChecker = DI.createInterface('IDirtyChecker').withDefault(x => x.singleton(DirtyChecker));
    const DirtyCheckSettings = {
        /**
         * Default: `6`
         *
         * Adjust the global dirty check frequency.
         * Measures in "frames per check", such that (given an FPS of 60):
         * - A value of 1 will result in 60 dirty checks per second
         * - A value of 6 will result in 10 dirty checks per second
         */
        framesPerCheck: 6,
        /**
         * Default: `false`
         *
         * Disable dirty-checking entirely. Properties that cannot be observed without dirty checking
         * or an adapter, will simply not be observed.
         */
        disabled: false,
        /**
         * Default: `true`
         *
         * Log a warning message to the console if a property is being dirty-checked.
         */
        warn: true,
        /**
         * Default: `false`
         *
         * Throw an error if a property is being dirty-checked.
         */
        throw: false,
        /**
         * Resets all dirty checking settings to the framework's defaults.
         */
        resetToDefault() {
            this.framesPerCheck = 6;
            this.disabled = false;
            this.warn = true;
            this.throw = false;
        }
    };
    /** @internal */
    class DirtyChecker {
        constructor(lifecycle) {
            this.elapsedFrames = 0;
            this.tracked = [];
            this.lifecycle = lifecycle;
        }
        createProperty(obj, propertyName) {
            if (DirtyCheckSettings.throw) {
                throw Reporter.error(800, propertyName); // TODO: create/organize error code
            }
            if (DirtyCheckSettings.warn) {
                Reporter.write(801, propertyName);
            }
            return new DirtyCheckProperty(this, obj, propertyName);
        }
        addProperty(property) {
            this.tracked.push(property);
            if (this.tracked.length === 1) {
                this.lifecycle.enqueueRAF(this.check, this, 4096 /* low */);
            }
        }
        removeProperty(property) {
            this.tracked.splice(this.tracked.indexOf(property), 1);
            if (this.tracked.length === 0) {
                this.lifecycle.dequeueRAF(this.check, this);
            }
        }
        check(delta) {
            if (DirtyCheckSettings.disabled) {
                return;
            }
            if (++this.elapsedFrames < DirtyCheckSettings.framesPerCheck) {
                return;
            }
            this.elapsedFrames = 0;
            const tracked = this.tracked;
            const len = tracked.length;
            let current;
            let i = 0;
            for (; i < len; ++i) {
                current = tracked[i];
                if (current.isDirty()) {
                    current.flush(256 /* fromTick */);
                }
            }
        }
    }
    DirtyChecker.inject = [ILifecycle];
    const slice$c = Array.prototype.slice;
    let DirtyCheckProperty = class DirtyCheckProperty {
        constructor(dirtyChecker, obj, propertyKey) {
            if (Tracer.enabled) {
                Tracer.enter('DirtyCheckProperty', 'constructor', slice$c.call(arguments));
            }
            this.obj = obj;
            this.propertyKey = propertyKey;
            this.dirtyChecker = dirtyChecker;
            if (Tracer.enabled) {
                Tracer.leave();
            }
        }
        isDirty() {
            return this.oldValue !== this.obj[this.propertyKey];
        }
        flush(flags) {
            const oldValue = this.oldValue;
            const newValue = this.obj[this.propertyKey];
            this.callSubscribers(newValue, oldValue, flags | 16 /* updateTargetInstance */);
            this.oldValue = newValue;
        }
        subscribe(subscriber) {
            if (!this.hasSubscribers()) {
                this.oldValue = this.obj[this.propertyKey];
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
        subscriberCollection()
    ], DirtyCheckProperty);

    const slice$d = Array.prototype.slice;
    const noop = PLATFORM.noop;
    // note: string.length is the only property of any primitive that is not a function,
    // so we can hardwire it to that and simply return undefined for anything else
    // note#2: a modified primitive constructor prototype would not work (and really, it shouldn't..)
    class PrimitiveObserver {
        constructor(obj, propertyKey) {
            this.doNotCache = true;
            if (Tracer.enabled) {
                Tracer.enter('PrimitiveObserver', 'constructor', slice$d.call(arguments));
            }
            // we don't need to store propertyName because only 'length' can return a useful value
            if (propertyKey === 'length') {
                // deliberately not checking for typeof string as users probably still want to know via an error that their string is undefined
                this.obj = obj;
                this.getValue = this.getStringLength;
            }
            else {
                this.getValue = this.returnUndefined;
            }
            if (Tracer.enabled) {
                Tracer.leave();
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

    const slice$e = Array.prototype.slice;
    class PropertyAccessor {
        constructor(obj, propertyKey) {
            if (Tracer.enabled) {
                Tracer.enter('PropertyAccessor', 'constructor', slice$e.call(arguments));
            }
            this.obj = obj;
            this.propertyKey = propertyKey;
            if (Tracer.enabled) {
                Tracer.leave();
            }
        }
        getValue() {
            return this.obj[this.propertyKey];
        }
        setValue(value) {
            this.obj[this.propertyKey] = value;
        }
    }

    const toStringTag$2 = Object.prototype.toString;
    const IObserverLocator = DI.createInterface('IObserverLocator').noDefault();
    const ITargetObserverLocator = DI.createInterface('ITargetObserverLocator').noDefault();
    const ITargetAccessorLocator = DI.createInterface('ITargetAccessorLocator').noDefault();
    function getPropertyDescriptor(subject, name) {
        let pd = Object.getOwnPropertyDescriptor(subject, name);
        let proto = Object.getPrototypeOf(subject);
        while (pd == null && proto != null) {
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
        static register(container) {
            return Registration.singleton(IObserverLocator, this).register(container);
        }
        getObserver(flags, obj, propertyName) {
            if (flags & 2 /* proxyStrategy */ && typeof obj === 'object') {
                return ProxyObserver.getOrCreate(obj, propertyName); // TODO: fix typings (and ensure proper contracts ofc)
            }
            if (isBindingContext(obj)) {
                return obj.getObservers(flags).getOrCreate(this.lifecycle, flags, obj, propertyName);
            }
            let observersLookup = obj.$observers;
            let observer;
            if (observersLookup && propertyName in observersLookup) {
                return observersLookup[propertyName];
            }
            observer = this.createPropertyObserver(flags, obj, propertyName);
            if (!observer.doNotCache) {
                if (observersLookup === void 0) {
                    observersLookup = this.getOrCreateObserversLookup(obj);
                }
                observersLookup[propertyName] = observer;
            }
            return observer;
        }
        addAdapter(adapter) {
            this.adapters.push(adapter);
        }
        getAccessor(flags, obj, propertyName) {
            if (this.targetAccessorLocator.handles(flags, obj)) {
                if (this.targetObserverLocator.overridesAccessor(flags, obj, propertyName)) {
                    return this.getObserver(flags, obj, propertyName);
                }
                return this.targetAccessorLocator.getAccessor(flags, this.lifecycle, obj, propertyName);
            }
            if (flags & 2 /* proxyStrategy */) {
                return ProxyObserver.getOrCreate(obj, propertyName);
            }
            return new PropertyAccessor(obj, propertyName);
        }
        getArrayObserver(flags, observedArray) {
            return getArrayObserver(flags, this.lifecycle, observedArray);
        }
        getMapObserver(flags, observedMap) {
            return getMapObserver(flags, this.lifecycle, observedMap);
        }
        getSetObserver(flags, observedSet) {
            return getSetObserver(flags, this.lifecycle, observedSet);
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
        getAdapterObserver(flags, obj, propertyName, descriptor) {
            for (let i = 0, ii = this.adapters.length; i < ii; i++) {
                const adapter = this.adapters[i];
                const observer = adapter.getObserver(flags, obj, propertyName, descriptor);
                if (observer != null) {
                    return observer;
                }
            }
            return null;
        }
        createPropertyObserver(flags, obj, propertyName) {
            if (!(obj instanceof Object)) {
                return new PrimitiveObserver(obj, propertyName);
            }
            let isNode = false;
            if (this.targetObserverLocator.handles(flags, obj)) {
                const observer = this.targetObserverLocator.getObserver(flags, this.lifecycle, this, obj, propertyName);
                if (observer != null) {
                    return observer;
                }
                isNode = true;
            }
            const tag = toStringTag$2.call(obj);
            switch (tag) {
                case '[object Array]':
                    if (propertyName === 'length') {
                        return this.getArrayObserver(flags, obj).getLengthObserver();
                    }
                    return this.dirtyChecker.createProperty(obj, propertyName);
                case '[object Map]':
                    if (propertyName === 'size') {
                        return this.getMapObserver(flags, obj).getLengthObserver();
                    }
                    return this.dirtyChecker.createProperty(obj, propertyName);
                case '[object Set]':
                    if (propertyName === 'size') {
                        return this.getSetObserver(flags, obj).getLengthObserver();
                    }
                    return this.dirtyChecker.createProperty(obj, propertyName);
            }
            const descriptor = getPropertyDescriptor(obj, propertyName);
            if (descriptor && (descriptor.get || descriptor.set)) {
                if (descriptor.get && descriptor.get.getObserver) {
                    return descriptor.get.getObserver(obj);
                }
                // attempt to use an adapter before resorting to dirty checking.
                const adapterObserver = this.getAdapterObserver(flags, obj, propertyName, descriptor);
                if (adapterObserver) {
                    return adapterObserver;
                }
                if (isNode) {
                    // TODO: use MutationObserver
                    return this.dirtyChecker.createProperty(obj, propertyName);
                }
                return createComputedObserver(flags, this, this.dirtyChecker, this.lifecycle, obj, propertyName, descriptor);
            }
            return new SetterObserver(this.lifecycle, flags, obj, propertyName);
        }
    }
    ObserverLocator.inject = [ILifecycle, IDirtyChecker, ITargetObserverLocator, ITargetAccessorLocator];
    function getCollectionObserver(flags, lifecycle, collection) {
        // If the collection is wrapped by a proxy then `$observer` will return the proxy observer instead of the collection observer, which is not what we want
        // when we ask for getCollectionObserver
        const rawCollection = collection instanceof Object ? ProxyObserver.getRawIfProxy(collection) : collection;
        switch (toStringTag$2.call(collection)) {
            case '[object Array]':
                return getArrayObserver(flags, lifecycle, rawCollection);
            case '[object Map]':
                return getMapObserver(flags, lifecycle, rawCollection);
            case '[object Set]':
                return getSetObserver(flags, lifecycle, rawCollection);
        }
        return void 0;
    }
    function isBindingContext(obj) {
        return obj.$synthetic === true;
    }

    var SelfObserver_1;
    let SelfObserver = SelfObserver_1 = class SelfObserver {
        constructor(lifecycle, flags, obj, propertyName, cbName) {
            this.lifecycle = lifecycle;
            let isProxy = false;
            if (ProxyObserver.isProxy(obj)) {
                isProxy = true;
                obj.$observer.subscribe(this, propertyName);
                this.obj = obj.$raw;
            }
            else {
                this.obj = obj;
            }
            this.propertyKey = propertyName;
            this.currentValue = void 0;
            this.oldValue = void 0;
            this.inBatch = false;
            this.callback = this.obj[cbName];
            if (this.callback === void 0) {
                this.observing = false;
            }
            else {
                this.observing = true;
                this.currentValue = this.obj[this.propertyKey];
                if (!isProxy) {
                    this.createGetterSetter();
                }
            }
            this.persistentFlags = flags & 536870927 /* persistentBindingFlags */;
        }
        handleChange(newValue, oldValue, flags) {
            this.setValue(newValue, flags);
        }
        getValue() {
            return this.currentValue;
        }
        setValue(newValue, flags) {
            if (this.observing) {
                const currentValue = this.currentValue;
                this.currentValue = newValue;
                if (this.lifecycle.batch.depth === 0) {
                    if ((flags & 4096 /* fromBind */) === 0) {
                        this.callSubscribers(newValue, currentValue, this.persistentFlags | flags);
                        if (this.callback !== void 0) {
                            this.callback.call(this.obj, newValue, currentValue, this.persistentFlags | flags);
                        }
                    }
                }
                else if (!this.inBatch) {
                    this.inBatch = true;
                    this.oldValue = currentValue;
                    this.lifecycle.batch.add(this);
                }
            }
            else {
                // See SetterObserver.setValue for explanation
                this.obj[this.propertyKey] = newValue;
            }
        }
        subscribe(subscriber) {
            if (this.observing === false) {
                this.observing = true;
                this.currentValue = this.obj[this.propertyKey];
                this.createGetterSetter();
            }
            this.addSubscriber(subscriber);
        }
        createGetterSetter() {
            if (!Reflect.defineProperty(this.obj, this.propertyKey, {
                enumerable: true,
                configurable: true,
                get: () => {
                    return this.currentValue;
                },
                set: value => {
                    this.setValue(value, 0 /* none */);
                },
            })) {
                Reporter.write(1, this.propertyKey, this.obj);
            }
        }
    };
    SelfObserver = SelfObserver_1 = __decorate([
        subscriberCollection()
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
                callContextToDebounce = binding.mode & fromView$2 ? 32 /* updateSourceExpression */ : 16 /* updateTargetInstance */;
            }
            else {
                methodToDebounce = 'callSource';
                debouncer = debounceCallSource;
                callContextToDebounce = 16 /* updateTargetInstance */;
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

    class PriorityBindingBehavior {
        static register(container) {
            container.register(Registration.singleton(`binding-behavior:priority`, this));
            container.register(Registration.singleton(this, this));
        }
        bind(binding, priority = 4096 /* low */) {
            const { targetObserver } = binding;
            if (targetObserver != void 0) {
                this[binding.id] = targetObserver.priority;
                if (typeof priority === 'number') {
                    targetObserver.priority = priority;
                }
                else {
                    switch (priority) {
                        case 'preempt':
                            targetObserver.priority = 32768 /* 'preempt' */;
                            break;
                        case 'high':
                            targetObserver.priority = 28672 /* 'high' */;
                            break;
                        case 'bind':
                            targetObserver.priority = 24576 /* 'bind' */;
                            break;
                        case 'attach':
                            targetObserver.priority = 20480 /* 'attach' */;
                            break;
                        case 'normal':
                            targetObserver.priority = 16384 /* 'normal' */;
                            break;
                        case 'propagate':
                            targetObserver.priority = 12288 /* 'propagate' */;
                            break;
                        case 'connect':
                            targetObserver.priority = 8192 /* 'connect' */;
                            break;
                        case 'low':
                            targetObserver.priority = 4096 /* 'low' */;
                    }
                }
            }
        }
        unbind(binding) {
            if (binding.targetObserver != void 0) {
                binding.targetObserver.priority = this[binding.id];
            }
        }
    }
    PriorityBindingBehavior.kind = BindingBehaviorResource;
    PriorityBindingBehavior.description = Object.freeze({
        name: 'priority',
    });

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

    function bindable(configOrTarget, prop) {
        let config;
        const decorator = function decorate($target, $prop) {
            if (arguments.length > 1) {
                // Non invocation:
                // - @bindable
                // Invocation with or w/o opts:
                // - @bindable()
                // - @bindable({...opts})
                config.property = $prop;
            }
            Bindable.for($target.constructor).add(config);
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
    const Bindable = {
        for(obj) {
            const builder = {
                add(nameOrConfig) {
                    let description = (void 0);
                    if (nameOrConfig instanceof Object) {
                        description = nameOrConfig;
                    }
                    else if (typeof nameOrConfig === 'string') {
                        description = {
                            property: nameOrConfig
                        };
                    }
                    const prop = description.property;
                    if (!prop) {
                        throw Reporter.error(0); // TODO: create error code (must provide a property name)
                    }
                    if (!description.attribute) {
                        description.attribute = kebabCase(prop);
                    }
                    if (!description.callback) {
                        description.callback = `${prop}Changed`;
                    }
                    if (description.mode === undefined) {
                        description.mode = BindingMode.toView;
                    }
                    obj.bindables[prop] = description;
                    return this;
                },
                get() {
                    return obj.bindables;
                }
            };
            if (obj.bindables === undefined) {
                obj.bindables = {};
            }
            else if (Array.isArray(obj.bindables)) {
                const props = obj.bindables;
                obj.bindables = {};
                props.forEach(builder.add);
            }
            return builder;
        }
    };

    /** @internal */
    const customElementName = 'custom-element';
    /** @internal */
    function customElementKey(name) {
        return `${customElementName}:${name}`;
    }
    /** @internal */
    function customElementBehavior(node) {
        return node.$controller;
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
    class HooksDefinition {
        constructor(target) {
            this.hasRender = 'render' in target;
            this.hasCreated = 'created' in target;
            this.hasBinding = 'binding' in target;
            this.hasBound = 'bound' in target;
            this.hasUnbinding = 'unbinding' in target;
            this.hasUnbound = 'unbound' in target;
            this.hasAttaching = 'attaching' in target;
            this.hasAttached = 'attached' in target;
            this.hasDetaching = 'detaching' in target;
            this.hasDetached = 'detached' in target;
            this.hasCaching = 'caching' in target;
        }
    }
    HooksDefinition.none = Object.freeze(new HooksDefinition({}));
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
            this.strategy = 1 /* getterSetter */;
            this.hooks = HooksDefinition.none;
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
    function buildTemplateDefinition(ctor, nameOrDef, template, cache, build, bindables, instructions, dependencies, surrogates, containerless, shadowOptions, hasSlots, strategy) {
        const def = new DefaultTemplateDefinition();
        // all cases fall through intentionally
        const argLen = arguments.length;
        switch (argLen) {
            case 13: if (strategy != null)
                def.strategy = ensureValidStrategy(strategy);
            case 12: if (hasSlots != null)
                def.hasSlots = hasSlots;
            case 11: if (shadowOptions != null)
                def.shadowOptions = shadowOptions;
            case 10: if (containerless != null)
                def.containerless = containerless;
            case 9: if (surrogates != null)
                def.surrogates = toArray(surrogates);
            case 8: if (dependencies != null)
                def.dependencies = toArray(dependencies);
            case 7: if (instructions != null)
                def.instructions = toArray(instructions);
            case 6: if (bindables != null)
                def.bindables = { ...bindables };
            case 5: if (build != null)
                def.build = build === true ? buildRequired : build === false ? buildNotRequired : { ...build };
            case 4: if (cache != null)
                def.cache = cache;
            case 3: if (template != null)
                def.template = template;
            case 2:
                if (ctor != null) {
                    if (ctor.bindables) {
                        def.bindables = Bindable.for(ctor).get();
                    }
                    if (ctor.containerless) {
                        def.containerless = ctor.containerless;
                    }
                    if (ctor.shadowOptions) {
                        def.shadowOptions = ctor.shadowOptions;
                    }
                    if (ctor.prototype) {
                        def.hooks = new HooksDefinition(ctor.prototype);
                    }
                }
                if (typeof nameOrDef === 'string') {
                    if (nameOrDef.length > 0) {
                        def.name = nameOrDef;
                    }
                }
                else if (nameOrDef != null) {
                    def.strategy = ensureValidStrategy(nameOrDef.strategy);
                    templateDefinitionAssignables.forEach(prop => {
                        if (nameOrDef[prop]) {
                            def[prop] = nameOrDef[prop];
                        }
                    });
                    templateDefinitionArrays.forEach(prop => {
                        if (nameOrDef[prop]) {
                            def[prop] = toArray(nameOrDef[prop]);
                        }
                    });
                    if (nameOrDef['bindables']) {
                        if (def.bindables === PLATFORM.emptyObject) {
                            def.bindables = Bindable.for(nameOrDef).get();
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
    function registerAttribute(container) {
        const description = this.description;
        const resourceKey = this.kind.keyFrom(description.name);
        const aliases = description.aliases;
        container.register(Registration.transient(resourceKey, this));
        container.register(Registration.transient(this, this));
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
            : { isTemplateController: true, ...nameOrDefinition }, target);
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
        const WritableType = Type;
        const description = createCustomAttributeDescription(typeof nameOrDefinition === 'string' ? { name: nameOrDefinition } : nameOrDefinition, Type);
        WritableType.kind = CustomAttributeResource;
        WritableType.description = description;
        Type.register = registerAttribute;
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
            aliases: aliases == null ? PLATFORM.emptyArray : aliases,
            defaultBindingMode: defaultBindingMode == null ? BindingMode.toView : defaultBindingMode,
            hasDynamicOptions: def.hasDynamicOptions === undefined ? false : def.hasDynamicOptions,
            isTemplateController: def.isTemplateController === undefined ? false : def.isTemplateController,
            bindables: { ...Bindable.for(Type).get(), ...Bindable.for(def).get() },
            strategy: ensureValidStrategy(def.strategy),
            hooks: new HooksDefinition(Type.prototype)
        };
    }

    const INode = DI.createInterface('INode').noDefault();
    const IRenderLocation = DI.createInterface('IRenderLocation').noDefault();
    const IDOM = DI.createInterface('IDOM').noDefault();
    const ni = function (...args) {
        throw Reporter.error(1000); // TODO: create error code (not implemented exception)
        // tslint:disable-next-line:no-any // this function doesn't need typing because it is never directly called
    };
    const niDOM = {
        addEventListener: ni,
        appendChild: ni,
        cloneNode: ni,
        convertToRenderLocation: ni,
        createDocumentFragment: ni,
        createElement: ni,
        createCustomEvent: ni,
        dispatchEvent: ni,
        createNodeObserver: ni,
        createTemplate: ni,
        createTextNode: ni,
        insertBefore: ni,
        isMarker: ni,
        isNodeInstance: ni,
        isRenderLocation: ni,
        makeTarget: ni,
        registerElementResolver: ni,
        remove: ni,
        removeEventListener: ni,
        setAttribute: ni
    };
    const DOM = {
        ...niDOM,
        get isInitialized() {
            return Reflect.get(this, '$initialized') === true;
        },
        initialize(dom) {
            if (this.isInitialized) {
                throw Reporter.error(1001); // TODO: create error code (already initialized, check isInitialized property and call destroy() if you want to assign a different dom)
            }
            const descriptors = {};
            const protos = [dom];
            let proto = Object.getPrototypeOf(dom);
            while (proto && proto !== Object.prototype) {
                protos.unshift(proto);
                proto = Object.getPrototypeOf(proto);
            }
            for (proto of protos) {
                Object.assign(descriptors, Object.getOwnPropertyDescriptors(proto));
            }
            const keys = [];
            let key;
            let descriptor;
            for (key in descriptors) {
                descriptor = descriptors[key];
                if (descriptor.configurable && descriptor.writable) {
                    Reflect.defineProperty(this, key, descriptor);
                    keys.push(key);
                }
            }
            Reflect.set(this, '$domKeys', keys);
            Reflect.set(this, '$initialized', true);
        },
        destroy() {
            if (!this.isInitialized) {
                throw Reporter.error(1002); // TODO: create error code (already destroyed)
            }
            const keys = Reflect.get(this, '$domKeys');
            keys.forEach(key => {
                Reflect.deleteProperty(this, key);
            });
            Object.assign(this, niDOM);
            Reflect.set(this, '$domKeys', PLATFORM.emptyArray);
            Reflect.set(this, '$initialized', false);
        }
    };
    // This is an implementation of INodeSequence that represents "no DOM" to render.
    // It's used in various places to avoid null and to encode
    // the explicit idea of "no view".
    const emptySequence = {
        isMounted: false,
        isLinked: false,
        next: void 0,
        childNodes: PLATFORM.emptyArray,
        firstChild: null,
        lastChild: null,
        findTargets() { return PLATFORM.emptyArray; },
        insertBefore(refNode) { },
        appendTo(parent) { },
        remove() { },
        addToLinked() { },
        unlink() { },
        link(next) { },
    };
    const NodeSequence = {
        empty: emptySequence
    };

    const LifecycleTask = {
        done: {
            done: true,
            canCancel() { return false; },
            cancel() { return; },
            wait() { return Promise.resolve(); }
        }
    };
    class PromiseTask {
        constructor(promise, next, context, ...args) {
            this.done = false;
            this.isCancelled = false;
            this.hasStarted = false;
            this.promise = promise.then(value => {
                if (this.isCancelled === true) {
                    return;
                }
                this.hasStarted = true;
                if (next !== null) {
                    // @ts-ignore
                    const nextResult = next.call(context, value, ...args);
                    if (nextResult === void 0) {
                        this.done = true;
                    }
                    else {
                        const nextPromise = nextResult.then instanceof Function
                            ? nextResult
                            : nextResult.wait();
                        return nextPromise.then(() => {
                            this.done = true;
                        });
                    }
                }
            });
        }
        canCancel() {
            return !this.hasStarted;
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
    class ContinuationTask {
        constructor(antecedent, next, context, ...args) {
            this.done = false;
            this.hasStarted = false;
            this.isCancelled = false;
            const promise = antecedent.then instanceof Function
                ? antecedent
                : antecedent.wait();
            this.promise = promise.then(() => {
                if (this.isCancelled === true) {
                    return;
                }
                this.hasStarted = true;
                const nextResult = next.call(context, ...args);
                if (nextResult === void 0) {
                    this.done = true;
                }
                else {
                    const nextPromise = nextResult.then instanceof Function
                        ? nextResult
                        : nextResult.wait();
                    return nextPromise.then(() => {
                        this.done = true;
                    });
                }
            });
        }
        canCancel() {
            return !this.hasStarted;
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
    class TerminalTask {
        constructor(antecedent) {
            this.done = false;
            this.promise = antecedent.then instanceof Function
                ? antecedent
                : antecedent.wait();
            this.promise.then(() => {
                this.done = true;
            }).catch(e => { throw e; });
        }
        canCancel() {
            return false;
        }
        cancel() {
            return;
        }
        wait() {
            return this.promise;
        }
    }
    class AggregateContinuationTask {
        constructor(antecedents, next, context, ...args) {
            this.done = false;
            this.hasStarted = false;
            this.isCancelled = false;
            this.promise = Promise.all(antecedents.map(t => t.wait())).then(() => {
                if (this.isCancelled === true) {
                    return;
                }
                this.hasStarted = true;
                const nextResult = next.call(context, ...args);
                if (nextResult === void 0) {
                    this.done = true;
                }
                else {
                    return nextResult.wait().then(() => {
                        this.done = true;
                    });
                }
            });
        }
        canCancel() {
            return !this.hasStarted;
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
    class AggregateTerminalTask {
        constructor(antecedents) {
            this.done = false;
            this.promise = Promise.all(antecedents.map(t => t.wait())).then(() => {
                this.done = true;
            });
        }
        canCancel() {
            return false;
        }
        cancel() {
            return;
        }
        wait() {
            return this.promise;
        }
    }
    function hasAsyncWork(value) {
        return !(value === void 0 || value.done === true);
    }

    class If {
        constructor(ifFactory, location) {
            this.$observers = {
                value: this,
            };
            this.id = nextId('au$component');
            this.elseFactory = void 0;
            this.elseView = void 0;
            this.ifFactory = ifFactory;
            this.ifView = void 0;
            this.location = location;
            this.noProxy = true;
            this.task = LifecycleTask.done;
            this.view = void 0;
            this._value = false;
        }
        get value() {
            return this._value;
        }
        set value(newValue) {
            const oldValue = this._value;
            if (oldValue !== newValue) {
                this._value = newValue;
                this.valueChanged(newValue, oldValue, this.$controller.flags);
            }
        }
        static register(container) {
            container.register(Registration.transient('custom-attribute:if', this));
            container.register(Registration.transient(this, this));
        }
        getValue() {
            return this._value;
        }
        setValue(newValue, flags) {
            const oldValue = this._value;
            if (oldValue !== newValue) {
                this._value = newValue;
                this.valueChanged(newValue, oldValue, flags | this.$controller.flags);
            }
        }
        binding(flags) {
            if (this.task.done) {
                this.task = this.swap(this.value, flags);
            }
            else {
                this.task = new ContinuationTask(this.task, this.swap, this, this.value, flags);
            }
            return this.task;
        }
        attaching(flags) {
            if (this.task.done) {
                this.attachView(flags);
            }
            else {
                this.task = new ContinuationTask(this.task, this.attachView, this, flags);
            }
        }
        detaching(flags) {
            if (this.view !== void 0) {
                if (this.task.done) {
                    this.view.detach(flags);
                }
                else {
                    this.task = new ContinuationTask(this.task, this.view.detach, this.view, flags);
                }
            }
            return this.task;
        }
        unbinding(flags) {
            if (this.view !== void 0) {
                if (this.task.done) {
                    this.task = this.view.unbind(flags);
                }
                else {
                    this.task = new ContinuationTask(this.task, this.view.unbind, this.view, flags);
                }
            }
            return this.task;
        }
        caching(flags) {
            if (this.ifView !== void 0 && this.ifView.release(flags)) {
                this.ifView = void 0;
            }
            if (this.elseView !== void 0 && this.elseView.release(flags)) {
                this.elseView = void 0;
            }
            this.view = void 0;
        }
        valueChanged(newValue, oldValue, flags) {
            if ((this.$controller.state & 4 /* isBound */) === 0) {
                return;
            }
            if (this.task.done) {
                this.task = this.swap(this.value, flags);
            }
            else {
                this.task = new ContinuationTask(this.task, this.swap, this, this.value, flags);
            }
        }
        /** @internal */
        updateView(value, flags) {
            let view;
            if (value) {
                view = this.ifView = this.ensureView(this.ifView, this.ifFactory, flags);
            }
            else if (this.elseFactory != void 0) {
                view = this.elseView = this.ensureView(this.elseView, this.elseFactory, flags);
            }
            else {
                view = void 0;
            }
            return view;
        }
        /** @internal */
        ensureView(view, factory, flags) {
            if (view === void 0) {
                view = factory.create(flags);
            }
            view.hold(this.location);
            return view;
        }
        swap(value, flags) {
            let task = LifecycleTask.done;
            if ((value === true && this.elseView !== void 0)
                || (value !== true && this.ifView !== void 0)) {
                task = this.deactivate(flags);
            }
            if (task.done) {
                const view = this.updateView(value, flags);
                task = this.activate(view, flags);
            }
            else {
                task = new PromiseTask(task.wait().then(() => this.updateView(value, flags)), this.activate, this, flags);
            }
            return task;
        }
        deactivate(flags) {
            const view = this.view;
            if (view === void 0) {
                return LifecycleTask.done;
            }
            view.detach(flags); // TODO: link this up with unbind
            return view.unbind(flags);
        }
        activate(view, flags) {
            this.view = view;
            if (view === void 0) {
                return LifecycleTask.done;
            }
            let task = this.bindView(flags);
            if ((this.$controller.state & 32 /* isAttached */) === 0) {
                return task;
            }
            if (task.done) {
                this.attachView(flags);
            }
            else {
                task = new ContinuationTask(task, this.attachView, this, flags);
            }
            return task;
        }
        bindView(flags) {
            if (this.view !== void 0 && (this.$controller.state & 5 /* isBoundOrBinding */) > 0) {
                return this.view.bind(flags, this.$controller.scope);
            }
            return LifecycleTask.done;
        }
        attachView(flags) {
            if (this.view !== void 0 && (this.$controller.state & 40 /* isAttachedOrAttaching */) > 0) {
                this.view.attach(flags);
            }
        }
    }
    If.inject = [IViewFactory, IRenderLocation];
    If.kind = CustomAttributeResource;
    If.description = Object.freeze({
        name: 'if',
        aliases: PLATFORM.emptyArray,
        defaultBindingMode: BindingMode.toView,
        hasDynamicOptions: false,
        isTemplateController: true,
        bindables: Object.freeze(Bindable.for({ bindables: ['value'] }).get()),
        strategy: 1 /* getterSetter */,
        hooks: Object.freeze(new HooksDefinition(If.prototype)),
    });
    class Else {
        constructor(factory) {
            this.factory = factory;
        }
        static register(container) {
            container.register(Registration.transient('custom-attribute:else', this));
        }
        link(ifBehavior) {
            if (ifBehavior instanceof If) {
                ifBehavior.elseFactory = this.factory;
            }
            else if (ifBehavior.viewModel instanceof If) {
                ifBehavior.viewModel.elseFactory = this.factory;
            }
            else {
                throw new Error(`Unsupported IfBehavior`); // TODO: create error code
            }
        }
    }
    Else.inject = [IViewFactory];
    Else.kind = CustomAttributeResource;
    Else.description = {
        name: 'else',
        aliases: PLATFORM.emptyArray,
        defaultBindingMode: BindingMode.toView,
        hasDynamicOptions: false,
        isTemplateController: true,
        bindables: PLATFORM.emptyObject,
        strategy: 1 /* getterSetter */,
        hooks: HooksDefinition.none,
    };

    class Repeat {
        constructor(location, renderable, factory) {
            this.$observers = {
                items: this,
            };
            this.id = nextId('au$component');
            this.factory = factory;
            this.hasPendingInstanceMutation = false;
            this.location = location;
            this.observer = void 0;
            this.renderable = renderable;
            this.views = [];
            this.key = void 0;
            this.noProxy = true;
            this.task = LifecycleTask.done;
        }
        get items() {
            return this._items;
        }
        set items(newValue) {
            const oldValue = this._items;
            if (oldValue !== newValue) {
                this._items = newValue;
                this.itemsChanged(this.$controller.flags);
            }
        }
        static register(container) {
            container.register(Registration.transient('custom-attribute:repeat', this));
            container.register(Registration.transient(this, this));
        }
        binding(flags) {
            this.checkCollectionObserver(flags);
            const bindings = this.renderable.bindings;
            const { length } = bindings;
            let binding;
            for (let i = 0; i < length; ++i) {
                binding = bindings[i];
                if (binding.target === this && binding.targetProperty === 'items') {
                    this.forOf = binding.sourceExpression;
                    break;
                }
            }
            this.local = this.forOf.declaration.evaluate(flags, this.$controller.scope, null);
            this.processViewsKeyed(void 0, flags);
            return this.task;
        }
        attaching(flags) {
            if (this.task.done) {
                this.attachViews(void 0, flags);
            }
            else {
                this.task = new ContinuationTask(this.task, this.attachViews, this, void 0, flags);
            }
        }
        detaching(flags) {
            if (this.task.done) {
                this.detachViewsByRange(0, this.views.length, flags);
            }
            else {
                this.task = new ContinuationTask(this.task, this.detachViewsByRange, this, 0, this.views.length, flags);
            }
        }
        unbinding(flags) {
            this.checkCollectionObserver(flags);
            if (this.task.done) {
                this.task = this.unbindAndRemoveViewsByRange(0, this.views.length, flags, false);
            }
            else {
                this.task = new ContinuationTask(this.task, this.unbindAndRemoveViewsByRange, this, 0, this.views.length, flags, false);
            }
            return this.task;
        }
        // called by SetterObserver
        itemsChanged(flags) {
            flags |= this.$controller.flags;
            this.checkCollectionObserver(flags);
            flags |= 16 /* updateTargetInstance */;
            this.processViewsKeyed(void 0, flags);
        }
        // called by a CollectionObserver
        handleCollectionChange(indexMap, flags) {
            flags |= this.$controller.flags;
            flags |= (960 /* fromFlush */ | 16 /* updateTargetInstance */);
            this.processViewsKeyed(indexMap, flags);
        }
        processViewsKeyed(indexMap, flags) {
            if (indexMap === void 0) {
                if ((this.$controller.state & 5 /* isBoundOrBinding */) > 0) {
                    const oldLength = this.views.length;
                    this.detachViewsByRange(0, oldLength, flags);
                    if (this.task.done) {
                        this.task = this.unbindAndRemoveViewsByRange(0, oldLength, flags, false);
                    }
                    else {
                        this.task = new ContinuationTask(this.task, this.unbindAndRemoveViewsByRange, this, 0, oldLength, flags, false);
                    }
                    if (this.task.done) {
                        this.task = this.createAndBindAllViews(flags);
                    }
                    else {
                        this.task = new ContinuationTask(this.task, this.createAndBindAllViews, this, flags);
                    }
                }
                if ((this.$controller.state & 40 /* isAttachedOrAttaching */) > 0) {
                    if (this.task.done) {
                        this.attachViewsKeyed(flags);
                    }
                    else {
                        this.task = new ContinuationTask(this.task, this.attachViewsKeyed, this, flags);
                    }
                }
            }
            else {
                applyMutationsToIndices(indexMap);
                if ((this.$controller.state & 5 /* isBoundOrBinding */) > 0) {
                    // first detach+unbind+(remove from array) the deleted view indices
                    if (indexMap.deletedItems.length > 0) {
                        indexMap.deletedItems.sort(compareNumber);
                        if (this.task.done) {
                            this.detachViewsByKey(indexMap, flags);
                        }
                        else {
                            this.task = new ContinuationTask(this.task, this.detachViewsByKey, this, indexMap, flags);
                        }
                        if (this.task.done) {
                            this.task = this.unbindAndRemoveViewsByKey(indexMap, flags);
                        }
                        else {
                            this.task = new ContinuationTask(this.task, this.unbindAndRemoveViewsByKey, this, indexMap, flags);
                        }
                    }
                    // then insert new views at the "added" indices to bring the views array in aligment with indexMap size
                    if (this.task.done) {
                        this.task = this.createAndBindNewViewsByKey(indexMap, flags);
                    }
                    else {
                        this.task = new ContinuationTask(this.task, this.createAndBindNewViewsByKey, this, indexMap, flags);
                    }
                }
                if ((this.$controller.state & 40 /* isAttachedOrAttaching */) > 0) {
                    if (this.task.done) {
                        this.sortViewsByKey(indexMap, flags);
                    }
                    else {
                        this.task = new ContinuationTask(this.task, this.sortViewsByKey, this, indexMap, flags);
                    }
                }
            }
        }
        checkCollectionObserver(flags) {
            const oldObserver = this.observer;
            if ((this.$controller.state & 5 /* isBoundOrBinding */) > 0) {
                const newObserver = this.observer = getCollectionObserver(flags, this.$controller.lifecycle, this.items);
                if (oldObserver !== newObserver && oldObserver) {
                    oldObserver.unsubscribeFromCollection(this);
                }
                if (newObserver) {
                    newObserver.subscribeToCollection(this);
                }
            }
            else if (oldObserver) {
                oldObserver.unsubscribeFromCollection(this);
            }
        }
        detachViewsByRange(iStart, iEnd, flags) {
            const views = this.views;
            this.$controller.lifecycle.detached.begin();
            let view;
            for (let i = iStart; i < iEnd; ++i) {
                view = views[i];
                view.release(flags);
                view.detach(flags);
            }
            this.$controller.lifecycle.detached.end(flags);
        }
        unbindAndRemoveViewsByRange(iStart, iEnd, flags, adjustLength) {
            const views = this.views;
            let tasks = void 0;
            let task;
            this.$controller.lifecycle.unbound.begin();
            let view;
            for (let i = iStart; i < iEnd; ++i) {
                view = views[i];
                task = view.unbind(flags);
                if (!task.done) {
                    if (tasks === undefined) {
                        tasks = [];
                    }
                    tasks.push(task);
                }
            }
            if (adjustLength) {
                this.views.length = iStart;
            }
            if (tasks === undefined) {
                this.$controller.lifecycle.unbound.end(flags);
                return LifecycleTask.done;
            }
            return new AggregateContinuationTask(tasks, this.$controller.lifecycle.unbound.end, this.$controller.lifecycle.unbound, flags);
        }
        detachViewsByKey(indexMap, flags) {
            const views = this.views;
            this.$controller.lifecycle.detached.begin();
            const deleted = indexMap.deletedItems;
            const deletedLen = deleted.length;
            let view;
            for (let i = 0; i < deletedLen; ++i) {
                view = views[deleted[i]];
                view.release(flags);
                view.detach(flags);
            }
            this.$controller.lifecycle.detached.end(flags);
        }
        unbindAndRemoveViewsByKey(indexMap, flags) {
            const views = this.views;
            let tasks = void 0;
            let task;
            this.$controller.lifecycle.unbound.begin();
            const deleted = indexMap.deletedItems;
            const deletedLen = deleted.length;
            let view;
            let i = 0;
            for (; i < deletedLen; ++i) {
                view = views[deleted[i]];
                task = view.unbind(flags);
                if (!task.done) {
                    if (tasks === undefined) {
                        tasks = [];
                    }
                    tasks.push(task);
                }
            }
            i = 0;
            let j = 0;
            for (; i < deletedLen; ++i) {
                j = deleted[i] - i;
                this.views.splice(j, 1);
            }
            if (tasks === undefined) {
                this.$controller.lifecycle.unbound.end(flags);
                return LifecycleTask.done;
            }
            return new AggregateContinuationTask(tasks, this.$controller.lifecycle.unbound.end, this.$controller.lifecycle.unbound, flags);
        }
        createAndBindAllViews(flags) {
            let tasks = void 0;
            let task;
            let view;
            this.$controller.lifecycle.bound.begin();
            const factory = this.factory;
            const local = this.local;
            const items = this.items;
            const newLen = this.forOf.count(flags, items);
            const views = this.views = Array(newLen);
            this.forOf.iterate(flags, items, (arr, i, item) => {
                view = views[i] = factory.create(flags);
                task = view.bind(flags, this.createScope(flags, local, item, view));
                if (!task.done) {
                    if (tasks === undefined) {
                        tasks = [];
                    }
                    tasks.push(task);
                }
            });
            if (tasks === undefined) {
                this.$controller.lifecycle.bound.end(flags);
                return LifecycleTask.done;
            }
            return new AggregateContinuationTask(tasks, this.$controller.lifecycle.bound.end, this.$controller.lifecycle.bound, flags);
        }
        createAndBindNewViewsByKey(indexMap, flags) {
            let tasks = void 0;
            let task;
            let view;
            const factory = this.factory;
            const views = this.views;
            const local = this.local;
            const items = this.items;
            this.$controller.lifecycle.bound.begin();
            const mapLen = indexMap.length;
            for (let i = 0; i < mapLen; ++i) {
                if (indexMap[i] === -2) {
                    view = factory.create(flags);
                    // TODO: test with map/set/undefined/null, make sure we can use strong typing here as well, etc
                    task = view.bind(flags, this.createScope(flags, local, items[i], view));
                    views.splice(i, 0, view);
                    if (!task.done) {
                        if (tasks === undefined) {
                            tasks = [];
                        }
                        tasks.push(task);
                    }
                }
            }
            if (views.length !== mapLen) {
                // TODO: create error code and use reporter with more informative message
                throw new Error(`viewsLen=${views.length}, mapLen=${mapLen}`);
            }
            if (tasks === undefined) {
                this.$controller.lifecycle.bound.end(flags);
                return LifecycleTask.done;
            }
            return new AggregateContinuationTask(tasks, this.$controller.lifecycle.bound.end, this.$controller.lifecycle.bound, flags);
        }
        createScope(flags, local, item, view) {
            const controller = this.$controller;
            const parentScope = controller.scope;
            const ctx = BindingContext.create(flags, local, item);
            ctx.$view = view;
            const scope = Scope.fromParent(flags, parentScope, ctx);
            if (controller.scopeParts !== PLATFORM.emptyArray) {
                if (parentScope.partScopes !== void 0 &&
                    parentScope.partScopes !== PLATFORM.emptyObject) {
                    scope.partScopes = { ...parentScope.partScopes };
                }
                else {
                    scope.partScopes = {};
                }
                for (const partName of controller.scopeParts) {
                    scope.partScopes[partName] = scope;
                }
            }
            return scope;
        }
        attachViews(indexMap, flags) {
            let view;
            const { views, location } = this;
            this.$controller.lifecycle.attached.begin();
            if (indexMap === void 0) {
                for (let i = 0, ii = views.length; i < ii; ++i) {
                    view = views[i];
                    view.hold(location);
                    view.nodes.unlink();
                    view.attach(flags);
                }
            }
            else {
                for (let i = 0, ii = views.length; i < ii; ++i) {
                    if (indexMap[i] !== i) {
                        view = views[i];
                        view.hold(location);
                        view.nodes.unlink();
                        view.attach(flags);
                    }
                }
            }
            this.$controller.lifecycle.attached.end(flags);
        }
        attachViewsKeyed(flags) {
            let view;
            const { views, location } = this;
            this.$controller.lifecycle.attached.begin();
            for (let i = 0, ii = views.length; i < ii; ++i) {
                view = views[i];
                view.hold(location);
                view.nodes.unlink();
                view.attach(flags);
            }
            this.$controller.lifecycle.attached.end(flags);
        }
        sortViewsByKey(indexMap, flags) {
            // TODO: integrate with tasks
            const location = this.location;
            const views = this.views;
            synchronizeIndices(views, indexMap);
            // this algorithm retrieves the indices of the longest increasing subsequence of items in the repeater
            // the items on those indices are not moved; this minimizes the number of DOM operations that need to be performed
            const seq = longestIncreasingSubsequence(indexMap);
            const seqLen = seq.length;
            this.$controller.lifecycle.attached.begin();
            flags |= 268435456 /* reorderNodes */;
            let next;
            let j = seqLen - 1;
            let i = indexMap.length - 1;
            for (; i >= 0; --i) {
                if (indexMap[i] === -2) {
                    views[i].hold(location);
                    views[i].attach(flags);
                }
                else if (j < 0 || seqLen === 1 || i !== seq[j]) {
                    views[i].attach(flags);
                }
                else {
                    --j;
                }
                next = views[i + 1];
                if (next !== void 0) {
                    views[i].nodes.link(next.nodes);
                }
                else {
                    views[i].nodes.link(location);
                }
            }
            this.$controller.lifecycle.attached.end(flags);
        }
    }
    Repeat.inject = [IRenderLocation, IController, IViewFactory];
    Repeat.kind = CustomAttributeResource;
    Repeat.description = Object.freeze({
        name: 'repeat',
        aliases: PLATFORM.emptyArray,
        defaultBindingMode: BindingMode.toView,
        hasDynamicOptions: false,
        isTemplateController: true,
        bindables: Object.freeze(Bindable.for({ bindables: ['items'] }).get()),
        strategy: 1 /* getterSetter */,
        hooks: Object.freeze(new HooksDefinition(Repeat.prototype)),
    });
    let prevIndices;
    let tailIndices;
    let maxLen = 0;
    // Based on inferno's lis_algorithm @ https://github.com/infernojs/inferno/blob/master/packages/inferno/src/DOM/patching.ts#L732
    // with some tweaks to make it just a bit faster + account for IndexMap (and some names changes for readability)
    /** @internal */
    function longestIncreasingSubsequence(indexMap) {
        const len = indexMap.length;
        if (len > maxLen) {
            maxLen = len;
            prevIndices = new Int32Array(len);
            tailIndices = new Int32Array(len);
        }
        let cursor = 0;
        let cur = 0;
        let prev = 0;
        let i = 0;
        let j = 0;
        let low = 0;
        let high = 0;
        let mid = 0;
        for (; i < len; i++) {
            cur = indexMap[i];
            if (cur !== -2) {
                j = prevIndices[cursor];
                prev = indexMap[j];
                if (prev !== -2 && prev < cur) {
                    tailIndices[i] = j;
                    prevIndices[++cursor] = i;
                    continue;
                }
                low = 0;
                high = cursor;
                while (low < high) {
                    mid = (low + high) >> 1;
                    prev = indexMap[prevIndices[mid]];
                    if (prev !== -2 && prev < cur) {
                        low = mid + 1;
                    }
                    else {
                        high = mid;
                    }
                }
                prev = indexMap[prevIndices[low]];
                if (cur < prev || prev === -2) {
                    if (low > 0) {
                        tailIndices[i] = prevIndices[low - 1];
                    }
                    prevIndices[low] = i;
                }
            }
        }
        i = ++cursor;
        const result = new Int32Array(i);
        cur = prevIndices[cursor - 1];
        while (cursor-- > 0) {
            result[cursor] = cur;
            cur = tailIndices[cur];
        }
        while (i-- > 0)
            prevIndices[i] = 0;
        return result;
    }
    /**
     * Applies offsets to the non-negative indices in the IndexMap
     * based on added and deleted items relative to those indices.
     *
     * e.g. turn `[-2, 0, 1]` into `[-2, 1, 2]`, allowing the values at the indices to be
     * used for sorting/reordering items if needed
     */
    function applyMutationsToIndices(indexMap) {
        let offset = 0;
        let j = 0;
        const len = indexMap.length;
        for (let i = 0; i < len; ++i) {
            while (indexMap.deletedItems[j] <= i - offset) {
                ++j;
                --offset;
            }
            if (indexMap[i] === -2) {
                ++offset;
            }
            else {
                indexMap[i] += offset;
            }
        }
    }
    /**
     * After `applyMutationsToIndices`, this function can be used to reorder items in a derived
     * array (e.g.  the items in the `views` in the repeater are derived from the `items` property)
     */
    function synchronizeIndices(items, indexMap) {
        const copy = items.slice();
        const len = indexMap.length;
        let to = 0;
        let from = 0;
        while (to < len) {
            from = indexMap[to];
            if (from !== -2) {
                items[to] = copy[from];
            }
            ++to;
        }
    }

    class Replaceable {
        constructor(factory, location) {
            this.id = nextId('au$component');
            this.factory = factory;
            this.view = this.factory.create();
            this.view.hold(location);
        }
        static register(container) {
            container.register(Registration.transient('custom-attribute:replaceable', this));
            container.register(Registration.transient(this, this));
        }
        binding(flags) {
            const prevName = BindingContext.partName;
            BindingContext.partName = this.factory.name;
            const task = this.view.bind(flags | 536870912 /* allowParentScopeTraversal */, this.$controller.scope);
            if (task.done) {
                BindingContext.partName = prevName;
            }
            else {
                task.wait().then(() => {
                    BindingContext.partName = prevName;
                });
            }
            return task;
        }
        attaching(flags) {
            this.view.attach(flags);
        }
        detaching(flags) {
            this.view.detach(flags);
        }
        unbinding(flags) {
            return this.view.unbind(flags);
        }
    }
    Replaceable.inject = [IViewFactory, IRenderLocation];
    Replaceable.kind = CustomAttributeResource;
    Replaceable.description = Object.freeze({
        name: 'replaceable',
        aliases: PLATFORM.emptyArray,
        defaultBindingMode: BindingMode.toView,
        hasDynamicOptions: false,
        isTemplateController: true,
        bindables: PLATFORM.emptyObject,
        strategy: 1 /* getterSetter */,
        hooks: Object.freeze(new HooksDefinition(Replaceable.prototype)),
    });

    class With {
        constructor(factory, location) {
            this.$observers = {
                value: this,
            };
            this.id = nextId('au$component');
            this.factory = factory;
            this.view = this.factory.create();
            this.view.hold(location);
            this._value = void 0;
        }
        get value() {
            return this._value;
        }
        set value(newValue) {
            const oldValue = this._value;
            if (oldValue !== newValue) {
                this._value = newValue;
                this.valueChanged(newValue, oldValue, 0 /* none */);
            }
        }
        static register(container) {
            container.register(Registration.transient('custom-attribute:with', this));
            container.register(Registration.transient(this, this));
        }
        valueChanged(newValue, oldValue, flags) {
            if ((this.$controller.state & 5 /* isBoundOrBinding */) > 0) {
                this.bindChild(4096 /* fromBind */);
            }
        }
        binding(flags) {
            this.bindChild(flags);
        }
        attaching(flags) {
            this.view.attach(flags);
        }
        detaching(flags) {
            this.view.detach(flags);
        }
        unbinding(flags) {
            this.view.unbind(flags);
        }
        bindChild(flags) {
            const scope = Scope.fromParent(flags, this.$controller.scope, this.value === void 0 ? {} : this.value);
            this.view.bind(flags, scope);
        }
    }
    With.inject = [IViewFactory, IRenderLocation];
    With.kind = CustomAttributeResource;
    With.description = Object.freeze({
        name: 'with',
        aliases: PLATFORM.emptyArray,
        defaultBindingMode: BindingMode.toView,
        hasDynamicOptions: false,
        isTemplateController: true,
        bindables: Object.freeze(Bindable.for({ bindables: ['value'] }).get()),
        strategy: 1 /* getterSetter */,
        hooks: Object.freeze(new HooksDefinition(With.prototype)),
    });

    const IProjectorLocator = DI.createInterface('IProjectorLocator').noDefault();
    /** @internal */
    function registerElement(container) {
        const resourceKey = this.kind.keyFrom(this.description.name);
        container.register(Registration.transient(resourceKey, this));
        container.register(Registration.transient(this, this));
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
        const Type = (ctor == null ? class HTMLOnlyElement {
        } : ctor);
        const WritableType = Type;
        const description = buildTemplateDefinition(Type, nameOrDefinition);
        WritableType.kind = CustomElementResource;
        Type.description = description;
        Type.register = registerElement;
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
            if (untrustedMarkup == null) {
                return null;
            }
            return this.sanitizer.sanitize(untrustedMarkup);
        }
    }
    SanitizeValueConverter.inject = [ISanitizer];
    ValueConverterResource.define('sanitize', SanitizeValueConverter);

    class ViewFactory {
        constructor(name, template, lifecycle) {
            this.isCaching = false;
            this.cacheSize = -1;
            this.cache = null;
            this.lifecycle = lifecycle;
            this.name = name;
            this.template = template;
            this.parts = PLATFORM.emptyObject;
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
        canReturnToCache(controller) {
            return this.cache != null && this.cache.length < this.cacheSize;
        }
        tryReturnToCache(controller) {
            if (this.canReturnToCache(controller)) {
                controller.cache(0 /* none */);
                this.cache.push(controller);
                return true;
            }
            return false;
        }
        create(flags) {
            const cache = this.cache;
            let controller;
            if (cache != null && cache.length > 0) {
                controller = cache.pop();
                controller.state = (controller.state | 128 /* isCached */) ^ 128 /* isCached */;
                return controller;
            }
            controller = Controller.forSyntheticView(this, this.lifecycle, flags);
            this.template.render(controller, null, this.parts, flags);
            if (!controller.nodes) {
                throw Reporter.error(90);
            }
            return controller;
        }
        addParts(parts) {
            if (this.parts === PLATFORM.emptyObject) {
                this.parts = { ...parts };
            }
            else {
                Object.assign(this.parts, parts);
            }
        }
    }
    ViewFactory.maxCacheSize = 0xFFFF;

    const ITemplateCompiler = DI.createInterface('ITemplateCompiler').noDefault();
    var ViewCompileFlags;
    (function (ViewCompileFlags) {
        ViewCompileFlags[ViewCompileFlags["none"] = 1] = "none";
        ViewCompileFlags[ViewCompileFlags["surrogate"] = 2] = "surrogate";
        ViewCompileFlags[ViewCompileFlags["shadowDOM"] = 4] = "shadowDOM";
    })(ViewCompileFlags || (ViewCompileFlags = {}));
    const ITemplateFactory = DI.createInterface('ITemplateFactory').noDefault();
    // This is the main implementation of ITemplate.
    // It is used to create instances of IController based on a compiled TemplateDefinition.
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
        render(viewModelOrController, host, parts, flags = 0 /* none */) {
            const controller = viewModelOrController instanceof Controller
                ? viewModelOrController
                : viewModelOrController.$controller;
            if (controller == void 0) {
                throw new Error(`Controller is missing from the view model`); // TODO: create error code
            }
            const nodes = controller.nodes = this.factory.createNodeSequence();
            controller.context = this.renderContext;
            flags |= this.definition.strategy;
            this.renderContext.render(flags, controller, nodes.findTargets(), this.definition, host, parts);
        }
    }
    // This is an implementation of ITemplate that always returns a node sequence representing "no DOM" to render.
    /** @internal */
    const noViewTemplate = {
        renderContext: (void 0),
        dom: (void 0),
        definition: (void 0),
        render(viewModelOrController) {
            const controller = viewModelOrController instanceof Controller ? viewModelOrController : viewModelOrController.$controller;
            controller.nodes = NodeSequence.empty;
            controller.context = void 0;
        }
    };
    const defaultCompilerName = 'default';
    const IInstructionRenderer = DI.createInterface('IInstructionRenderer').noDefault();
    const IRenderer = DI.createInterface('IRenderer').noDefault();
    const IRenderingEngine = DI.createInterface('IRenderingEngine').withDefault(x => x.singleton(RenderingEngine));
    /** @internal */
    class RenderingEngine {
        constructor(container, templateFactory, lifecycle, templateCompilers) {
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
        // @ts-ignore
        getElementTemplate(dom, definition, parentContext, componentType) {
            if (definition == void 0) {
                return void 0;
            }
            let found = this.templateLookup.get(definition);
            if (!found) {
                found = this.templateFromSource(dom, definition, parentContext, componentType);
                this.templateLookup.set(definition, found);
            }
            return found;
        }
        getViewFactory(dom, definition, parentContext) {
            if (definition == void 0) {
                throw new Error(`No definition provided`); // TODO: create error code
            }
            let factory = this.viewFactoryLookup.get(definition);
            if (!factory) {
                const validSource = buildTemplateDefinition(null, definition);
                const template = this.templateFromSource(dom, validSource, parentContext, void 0);
                factory = new ViewFactory(validSource.name, template, this.lifecycle);
                factory.setCacheSize(validSource.cache, true);
                this.viewFactoryLookup.set(definition, factory);
            }
            return factory;
        }
        templateFromSource(dom, definition, parentContext, componentType) {
            if (parentContext == void 0) {
                parentContext = this.container;
            }
            if (definition.template != void 0) {
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
    function createRenderContext(dom, parent, dependencies, componentType) {
        const context = parent.createChild();
        const renderableProvider = new InstanceProvider();
        const elementProvider = new InstanceProvider();
        const instructionProvider = new InstanceProvider();
        const factoryProvider = new ViewFactoryProvider();
        const renderLocationProvider = new InstanceProvider();
        const renderer = context.get(IRenderer);
        dom.registerElementResolver(context, elementProvider);
        context.registerResolver(IViewFactory, factoryProvider);
        context.registerResolver(IController, renderableProvider);
        context.registerResolver(ITargetedInstruction, instructionProvider);
        context.registerResolver(IRenderLocation, renderLocationProvider);
        if (dependencies != void 0) {
            context.register(...dependencies);
        }
        //If the element has a view, support Recursive Components by adding self to own view template container.
        if (componentType) {
            componentType.register(context);
        }
        context.render = function (flags, renderable, targets, templateDefinition, host, parts) {
            renderer.render(flags, dom, this, renderable, targets, templateDefinition, host, parts);
        };
        // @ts-ignore
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
    class ViewFactoryProvider {
        prepare(factory, parts) {
            this.factory = factory;
            factory.addParts(parts);
        }
        resolve(handler, requestor) {
            const factory = this.factory;
            if (factory == null) { // unmet precondition: call prepare
                throw Reporter.error(50); // TODO: organize error codes
            }
            if (!factory.name || !factory.name.length) { // unmet invariant: factory must have a name
                throw Reporter.error(51); // TODO: organize error codes
            }
            const found = factory.parts[factory.name];
            if (found) {
                const renderingEngine = handler.get(IRenderingEngine);
                const dom = handler.get(IDOM);
                return renderingEngine.getViewFactory(dom, found, requestor);
            }
            return factory;
        }
        dispose() {
            this.factory = null;
        }
    }
    function hasChildrenChanged(viewModel) {
        return viewModel != void 0 && '$childrenChanged' in viewModel;
    }
    /** @internal */
    let ChildrenObserver = class ChildrenObserver {
        constructor(lifecycle, controller) {
            this.hasChanges = false;
            this.children = (void 0);
            this.controller = controller;
            this.lifecycle = lifecycle;
            this.controller = Controller.forCustomElement(controller, (void 0), (void 0));
            this.projector = this.controller.projector;
            this.observing = false;
            this.ticking = false;
        }
        getValue() {
            if (!this.observing) {
                this.observing = true;
                this.projector.subscribeToChildrenChange(() => { this.onChildrenChanged(); });
                this.children = findElements(this.projector.children);
            }
            return this.children;
        }
        setValue(newValue) { }
        flushRAF(flags) {
            if (this.hasChanges) {
                this.callSubscribers(this.children, undefined, flags | 16 /* updateTargetInstance */);
                this.hasChanges = false;
            }
        }
        subscribe(subscriber) {
            if (!this.ticking) {
                this.ticking = true;
                this.lifecycle.enqueueRAF(this.flushRAF, this, 24576 /* bind */);
            }
            this.addSubscriber(subscriber);
        }
        unsubscribe(subscriber) {
            this.removeSubscriber(subscriber);
            if (this.ticking && !this.hasSubscribers()) {
                this.ticking = false;
                this.lifecycle.dequeueRAF(this.flushRAF, this);
            }
        }
        onChildrenChanged() {
            this.children = findElements(this.projector.children);
            if (hasChildrenChanged(this.controller.viewModel)) {
                this.controller.viewModel.$childrenChanged();
            }
            this.hasChanges = true;
        }
    };
    ChildrenObserver = __decorate([
        subscriberCollection()
    ], ChildrenObserver);
    /** @internal */
    function findElements(nodes) {
        const components = [];
        for (let i = 0, ii = nodes.length; i < ii; ++i) {
            const current = nodes[i];
            const component = customElementBehavior(current);
            if (component != void 0) {
                components.push(component);
            }
        }
        return components;
    }

    function hasDescription(type) {
        return type.description != void 0;
    }
    class Controller {
        constructor(flags, viewCache, lifecycle, viewModel, parentContext, host, options, scopeParts) {
            this.id = nextId('au$component');
            this.nextBound = void 0;
            this.nextUnbound = void 0;
            this.prevBound = void 0;
            this.prevUnbound = void 0;
            this.nextAttached = void 0;
            this.nextDetached = void 0;
            this.prevAttached = void 0;
            this.prevDetached = void 0;
            this.nextMount = void 0;
            this.nextUnmount = void 0;
            this.prevMount = void 0;
            this.prevUnmount = void 0;
            this.flags = flags;
            this.viewCache = viewCache;
            this.bindings = void 0;
            this.controllers = void 0;
            this.state = 0 /* none */;
            this.scopeParts = scopeParts;
            if (viewModel == void 0) {
                if (viewCache == void 0) {
                    // TODO: create error code
                    throw new Error(`No IViewCache was provided when rendering a synthetic view.`);
                }
                if (lifecycle == void 0) {
                    // TODO: create error code
                    throw new Error(`No ILifecycle was provided when rendering a synthetic view.`);
                }
                this.lifecycle = lifecycle;
                this.hooks = HooksDefinition.none;
                this.viewModel = void 0;
                this.bindingContext = void 0; // stays undefined
                this.host = void 0; // stays undefined
                this.vmKind = 2 /* synthetic */;
                this.scope = void 0; // will be populated during bindSynthetic()
                this.projector = void 0; // stays undefined
                this.nodes = void 0; // will be populated during ITemplate.render() immediately after the constructor is done
                this.context = void 0; // will be populated during ITemplate.render() immediately after the constructor is done
                this.location = void 0; // should be set with `hold(location)` by the consumer
            }
            else {
                if (parentContext == void 0) {
                    // TODO: create error code
                    throw new Error(`No parentContext was provided when rendering a custom element or attribute.`);
                }
                this.lifecycle = parentContext.get(ILifecycle);
                viewModel.$controller = this;
                const Type = viewModel.constructor;
                if (!hasDescription(Type)) {
                    // TODO: create error code
                    throw new Error(`The provided viewModel does not have a (valid) description.`);
                }
                const { description } = Type;
                flags |= description.strategy;
                createObservers(this.lifecycle, description, flags, viewModel);
                this.hooks = description.hooks;
                this.viewModel = viewModel;
                this.bindingContext = getBindingContext(flags, viewModel);
                this.host = host;
                switch (Type.kind.name) {
                    case 'custom-element':
                        if (host == void 0) {
                            // TODO: create error code
                            throw new Error(`No host element was provided when rendering a custom element.`);
                        }
                        this.vmKind = 0 /* customElement */;
                        const renderingEngine = parentContext.get(IRenderingEngine);
                        let template = void 0;
                        if (this.hooks.hasRender) {
                            const result = this.bindingContext.render(flags, host, options.parts == void 0
                                ? PLATFORM.emptyObject
                                : options.parts, parentContext);
                            if (result != void 0 && 'getElementTemplate' in result) {
                                template = result.getElementTemplate(renderingEngine, Type, parentContext);
                            }
                        }
                        else {
                            const dom = parentContext.get(IDOM);
                            template = renderingEngine.getElementTemplate(dom, description, parentContext, Type);
                        }
                        if (template !== void 0) {
                            let parts;
                            if (template.definition == null ||
                                template.definition.instructions.length === 0 ||
                                template.definition.instructions[0].length === 0 ||
                                (template.definition.instructions[0][0].parts == void 0)) {
                                if (options.parts == void 0) {
                                    parts = PLATFORM.emptyObject;
                                }
                                else {
                                    parts = options.parts;
                                }
                            }
                            else {
                                const instruction = template.definition.instructions[0][0];
                                if (options.parts == void 0) {
                                    parts = instruction.parts;
                                }
                                else {
                                    parts = { ...options.parts, ...instruction.parts };
                                }
                                if (scopeParts === PLATFORM.emptyArray) {
                                    this.scopeParts = Object.keys(instruction.parts);
                                }
                            }
                            template.render(this, host, parts);
                        }
                        this.scope = Scope.create(flags, this.bindingContext, null);
                        this.projector = parentContext.get(IProjectorLocator).getElementProjector(parentContext.get(IDOM), this, host, description);
                        this.location = void 0;
                        break;
                    case 'custom-attribute':
                        this.vmKind = 1 /* customAttribute */;
                        this.scope = void 0;
                        this.projector = void 0;
                        this.nodes = void 0;
                        this.context = void 0;
                        this.location = void 0;
                        break;
                    default:
                        throw new Error(`Invalid resource kind: '${Type.kind.name}'`);
                }
                if (this.hooks.hasCreated) {
                    this.bindingContext.created(flags);
                }
            }
        }
        static forCustomElement(viewModel, parentContext, host, flags = 0 /* none */, options = PLATFORM.emptyObject) {
            let controller = Controller.lookup.get(viewModel);
            if (controller === void 0) {
                controller = new Controller(flags, void 0, void 0, viewModel, parentContext, host, options, PLATFORM.emptyArray);
                this.lookup.set(viewModel, controller);
            }
            return controller;
        }
        static forCustomAttribute(viewModel, parentContext, flags = 0 /* none */, scopeParts = PLATFORM.emptyArray) {
            let controller = Controller.lookup.get(viewModel);
            if (controller === void 0) {
                controller = new Controller(flags, void 0, void 0, viewModel, parentContext, void 0, PLATFORM.emptyObject, scopeParts);
                this.lookup.set(viewModel, controller);
            }
            return controller;
        }
        static forSyntheticView(viewCache, lifecycle, flags = 0 /* none */) {
            return new Controller(flags, viewCache, lifecycle, void 0, void 0, void 0, PLATFORM.emptyObject, PLATFORM.emptyArray);
        }
        lockScope(scope) {
            this.scope = scope;
            this.state |= 16384 /* hasLockedScope */;
        }
        hold(location) {
            this.state = (this.state | 32768 /* canBeCached */) ^ 32768 /* canBeCached */;
            this.location = location;
        }
        release(flags) {
            this.state |= 32768 /* canBeCached */;
            if ((this.state & 32 /* isAttached */) > 0) {
                // tslint:disable-next-line: no-non-null-assertion // non-null is implied by the hook
                return this.viewCache.canReturnToCache(this);
            }
            return this.unmountSynthetic(flags);
        }
        bind(flags, scope) {
            // TODO: benchmark which of these techniques is fastest:
            // - the current one (enum with switch)
            // - set the name of the method in the constructor, e.g. this.bindMethod = 'bindCustomElement'
            //    and then doing this[this.bindMethod](flags, scope) instead of switch (eliminates branching
            //    but computed property access might be harmful to browser optimizations)
            // - make bind() a property and set it to one of the 3 methods in the constructor,
            //    e.g. this.bind = this.bindCustomElement (eliminates branching + reduces call stack depth by 1,
            //    but might make the call site megamorphic)
            flags |= 4096 /* fromBind */;
            switch (this.vmKind) {
                case 0 /* customElement */:
                    return this.bindCustomElement(flags, scope);
                case 1 /* customAttribute */:
                    return this.bindCustomAttribute(flags, scope);
                case 2 /* synthetic */:
                    return this.bindSynthetic(flags, scope);
            }
        }
        unbind(flags) {
            flags |= 8192 /* fromUnbind */;
            switch (this.vmKind) {
                case 0 /* customElement */:
                    return this.unbindCustomElement(flags);
                case 1 /* customAttribute */:
                    return this.unbindCustomAttribute(flags);
                case 2 /* synthetic */:
                    return this.unbindSynthetic(flags);
            }
        }
        bound(flags) {
            // tslint:disable-next-line: no-non-null-assertion // non-null is implied by the hook
            this.bindingContext.bound(flags);
        }
        unbound(flags) {
            // tslint:disable-next-line: no-non-null-assertion // non-null is implied by the hook
            this.bindingContext.unbound(flags);
        }
        attach(flags) {
            if ((this.state & 40 /* isAttachedOrAttaching */) > 0 && (flags & 268435456 /* reorderNodes */) === 0) {
                return;
            }
            flags |= 16384 /* fromAttach */;
            switch (this.vmKind) {
                case 0 /* customElement */:
                    this.attachCustomElement(flags);
                    break;
                case 1 /* customAttribute */:
                    this.attachCustomAttribute(flags);
                    break;
                case 2 /* synthetic */:
                    this.attachSynthetic(flags);
            }
        }
        detach(flags) {
            if ((this.state & 40 /* isAttachedOrAttaching */) === 0) {
                return;
            }
            flags |= 32768 /* fromDetach */;
            switch (this.vmKind) {
                case 0 /* customElement */:
                    this.detachCustomElement(flags);
                    break;
                case 1 /* customAttribute */:
                    this.detachCustomAttribute(flags);
                    break;
                case 2 /* synthetic */:
                    this.detachSynthetic(flags);
            }
        }
        attached(flags) {
            // tslint:disable-next-line: no-non-null-assertion // non-null is implied by the hook
            this.bindingContext.attached(flags);
        }
        detached(flags) {
            // tslint:disable-next-line: no-non-null-assertion // non-null is implied by the hook
            this.bindingContext.detached(flags);
        }
        mount(flags) {
            switch (this.vmKind) {
                case 0 /* customElement */:
                    this.mountCustomElement(flags);
                    break;
                case 2 /* synthetic */:
                    this.mountSynthetic(flags);
            }
        }
        unmount(flags) {
            switch (this.vmKind) {
                case 0 /* customElement */:
                    this.unmountCustomElement(flags);
                    break;
                case 2 /* synthetic */:
                    this.unmountSynthetic(flags);
            }
        }
        cache(flags) {
            switch (this.vmKind) {
                case 0 /* customElement */:
                    this.cacheCustomElement(flags);
                    break;
                case 1 /* customAttribute */:
                    this.cacheCustomAttribute(flags);
                    break;
                case 2 /* synthetic */:
                    this.cacheSynthetic(flags);
            }
        }
        getTargetAccessor(propertyName) {
            const { bindings } = this;
            if (bindings !== void 0) {
                const binding = bindings.find(b => b.targetProperty === propertyName);
                if (binding !== void 0) {
                    return binding.targetObserver;
                }
            }
            return void 0;
        }
        // #region bind/unbind
        bindCustomElement(flags, scope) {
            const $scope = this.scope;
            if ($scope.partScopes == void 0) {
                if (scope != null &&
                    scope.partScopes != void 0 &&
                    scope.partScopes !== PLATFORM.emptyObject) {
                    $scope.partScopes = { ...scope.partScopes };
                }
                else if (this.scopeParts !== PLATFORM.emptyArray) {
                    $scope.partScopes = {};
                }
                if ($scope.partScopes == void 0) {
                    $scope.partScopes = PLATFORM.emptyObject;
                }
                else {
                    for (const partName of this.scopeParts) {
                        $scope.partScopes[partName] = $scope;
                    }
                }
            }
            if ((flags & 134217728 /* updateOneTimeBindings */) > 0) {
                this.bindBindings(flags, $scope);
                return LifecycleTask.done;
            }
            if ((this.state & 4 /* isBound */) > 0) {
                return LifecycleTask.done;
            }
            flags |= 4096 /* fromBind */;
            this.state |= 1 /* isBinding */;
            this.lifecycle.bound.begin();
            this.bindBindings(flags, $scope);
            if (this.hooks.hasBinding) {
                const ret = this.bindingContext.binding(flags);
                if (hasAsyncWork(ret)) {
                    return new ContinuationTask(ret, this.bindControllers, this, flags, $scope);
                }
            }
            return this.bindControllers(flags, $scope);
        }
        bindCustomAttribute(flags, scope) {
            if ((this.state & 4 /* isBound */) > 0) {
                if (this.scope === scope) {
                    return LifecycleTask.done;
                }
                flags |= 4096 /* fromBind */;
                const task = this.unbind(flags);
                if (!task.done) {
                    return new ContinuationTask(task, this.bind, this, flags, scope);
                }
            }
            else {
                flags |= 4096 /* fromBind */;
            }
            this.state |= 1 /* isBinding */;
            this.scope = scope;
            this.lifecycle.bound.begin();
            if (this.hooks.hasBinding) {
                const ret = this.bindingContext.binding(flags);
                if (hasAsyncWork(ret)) {
                    return new ContinuationTask(ret, this.endBind, this, flags);
                }
            }
            this.endBind(flags);
            return LifecycleTask.done;
        }
        bindSynthetic(flags, scope) {
            if (scope == void 0) {
                throw new Error(`Scope is null or undefined`); // TODO: create error code
            }
            if ((flags & 134217728 /* updateOneTimeBindings */) > 0) {
                this.bindBindings(flags, scope);
                return LifecycleTask.done;
            }
            if ((this.state & 4 /* isBound */) > 0) {
                if (this.scope === scope || (this.state & 16384 /* hasLockedScope */) > 0) {
                    return LifecycleTask.done;
                }
                flags |= 4096 /* fromBind */;
                const task = this.unbind(flags);
                if (!task.done) {
                    return new ContinuationTask(task, this.bind, this, flags, scope);
                }
            }
            else {
                flags |= 4096 /* fromBind */;
            }
            if ((this.state & 16384 /* hasLockedScope */) === 0) {
                this.scope = scope;
            }
            this.state |= 1 /* isBinding */;
            this.lifecycle.bound.begin();
            this.bindBindings(flags, scope);
            return this.bindControllers(flags, scope);
        }
        bindBindings(flags, scope) {
            const { bindings } = this;
            if (bindings !== void 0) {
                const { length } = bindings;
                for (let i = 0; i < length; ++i) {
                    bindings[i].$bind(flags, scope);
                }
            }
        }
        bindControllers(flags, scope) {
            let tasks = void 0;
            let task;
            const { controllers } = this;
            if (controllers !== void 0) {
                const { length } = controllers;
                for (let i = 0; i < length; ++i) {
                    task = controllers[i].bind(flags, scope);
                    if (!task.done) {
                        if (tasks === void 0) {
                            tasks = [];
                        }
                        tasks.push(task);
                    }
                }
            }
            if (tasks === void 0) {
                this.endBind(flags);
                return LifecycleTask.done;
            }
            return new AggregateContinuationTask(tasks, this.endBind, this, flags);
        }
        endBind(flags) {
            if (this.hooks.hasBound) {
                this.lifecycle.bound.add(this);
            }
            this.state = this.state ^ 1 /* isBinding */ | 4 /* isBound */;
            this.lifecycle.bound.end(flags);
        }
        unbindCustomElement(flags) {
            if ((this.state & 4 /* isBound */) === 0) {
                return LifecycleTask.done;
            }
            this.state |= 2 /* isUnbinding */;
            flags |= 8192 /* fromUnbind */;
            this.lifecycle.unbound.begin();
            if (this.hooks.hasUnbinding) {
                const ret = this.bindingContext.unbinding(flags);
                if (hasAsyncWork(ret)) {
                    return new ContinuationTask(ret, this.unbindControllers, this, flags);
                }
            }
            return this.unbindControllers(flags);
        }
        unbindCustomAttribute(flags) {
            if ((this.state & 4 /* isBound */) === 0) {
                return LifecycleTask.done;
            }
            this.state |= 2 /* isUnbinding */;
            flags |= 8192 /* fromUnbind */;
            this.lifecycle.unbound.begin();
            if (this.hooks.hasUnbinding) {
                const ret = this.bindingContext.unbinding(flags);
                if (hasAsyncWork(ret)) {
                    return new ContinuationTask(ret, this.endUnbind, this, flags);
                }
            }
            this.endUnbind(flags);
            return LifecycleTask.done;
        }
        unbindSynthetic(flags) {
            if ((this.state & 4 /* isBound */) === 0) {
                return LifecycleTask.done;
            }
            this.state |= 2 /* isUnbinding */;
            flags |= 8192 /* fromUnbind */;
            this.lifecycle.unbound.begin();
            return this.unbindControllers(flags);
        }
        unbindBindings(flags) {
            const { bindings } = this;
            if (bindings !== void 0) {
                for (let i = bindings.length - 1; i >= 0; --i) {
                    bindings[i].$unbind(flags);
                }
            }
            this.endUnbind(flags);
        }
        unbindControllers(flags) {
            let tasks = void 0;
            let task;
            const { controllers } = this;
            if (controllers !== void 0) {
                for (let i = controllers.length - 1; i >= 0; --i) {
                    task = controllers[i].unbind(flags);
                    if (!task.done) {
                        if (tasks === void 0) {
                            tasks = [];
                        }
                        tasks.push(task);
                    }
                }
            }
            if (tasks === void 0) {
                this.unbindBindings(flags);
                return LifecycleTask.done;
            }
            return new AggregateContinuationTask(tasks, this.unbindBindings, this, flags);
        }
        endUnbind(flags) {
            switch (this.vmKind) {
                case 1 /* customAttribute */:
                    this.scope = void 0;
                    break;
                case 2 /* synthetic */:
                    if ((this.state & 16384 /* hasLockedScope */) === 0) {
                        this.scope = void 0;
                    }
            }
            if (this.hooks.hasUnbound) {
                this.lifecycle.unbound.add(this);
            }
            this.state = (this.state | 6 /* isBoundOrUnbinding */) ^ 6 /* isBoundOrUnbinding */;
            this.lifecycle.unbound.end(flags);
        }
        // #endregion
        // #region attach/detach
        attachCustomElement(flags) {
            flags |= 16384 /* fromAttach */;
            this.state |= 8 /* isAttaching */;
            this.lifecycle.mount.add(this);
            this.lifecycle.attached.begin();
            if (this.hooks.hasAttaching) {
                this.bindingContext.attaching(flags);
            }
            this.attachControllers(flags);
            if (this.hooks.hasAttached) {
                this.lifecycle.attached.add(this);
            }
            this.state = this.state ^ 8 /* isAttaching */ | 32 /* isAttached */;
            this.lifecycle.attached.end(flags);
        }
        attachCustomAttribute(flags) {
            flags |= 16384 /* fromAttach */;
            this.state |= 8 /* isAttaching */;
            this.lifecycle.attached.begin();
            if (this.hooks.hasAttaching) {
                this.bindingContext.attaching(flags);
            }
            if (this.hooks.hasAttached) {
                this.lifecycle.attached.add(this);
            }
            this.state = this.state ^ 8 /* isAttaching */ | 32 /* isAttached */;
            this.lifecycle.attached.end(flags);
        }
        attachSynthetic(flags) {
            if (((this.state & 32 /* isAttached */) > 0 && flags & 268435456 /* reorderNodes */) > 0) {
                this.lifecycle.mount.add(this);
            }
            else {
                flags |= 16384 /* fromAttach */;
                this.state |= 8 /* isAttaching */;
                this.lifecycle.mount.add(this);
                this.lifecycle.attached.begin();
                this.attachControllers(flags);
                this.state = this.state ^ 8 /* isAttaching */ | 32 /* isAttached */;
                this.lifecycle.attached.end(flags);
            }
        }
        detachCustomElement(flags) {
            flags |= 32768 /* fromDetach */;
            this.state |= 16 /* isDetaching */;
            this.lifecycle.detached.begin();
            this.lifecycle.unmount.add(this);
            if (this.hooks.hasDetaching) {
                this.bindingContext.detaching(flags);
            }
            this.detachControllers(flags);
            if (this.hooks.hasDetached) {
                this.lifecycle.detached.add(this);
            }
            this.state = (this.state | 48 /* isAttachedOrDetaching */) ^ 48 /* isAttachedOrDetaching */;
            this.lifecycle.detached.end(flags);
        }
        detachCustomAttribute(flags) {
            flags |= 32768 /* fromDetach */;
            this.state |= 16 /* isDetaching */;
            this.lifecycle.detached.begin();
            if (this.hooks.hasDetaching) {
                this.bindingContext.detaching(flags);
            }
            if (this.hooks.hasDetached) {
                this.lifecycle.detached.add(this);
            }
            this.state = (this.state | 48 /* isAttachedOrDetaching */) ^ 48 /* isAttachedOrDetaching */;
            this.lifecycle.detached.end(flags);
        }
        detachSynthetic(flags) {
            flags |= 32768 /* fromDetach */;
            this.state |= 16 /* isDetaching */;
            this.lifecycle.detached.begin();
            this.lifecycle.unmount.add(this);
            this.detachControllers(flags);
            this.state = (this.state | 48 /* isAttachedOrDetaching */) ^ 48 /* isAttachedOrDetaching */;
            this.lifecycle.detached.end(flags);
        }
        attachControllers(flags) {
            const { controllers } = this;
            if (controllers !== void 0) {
                const { length } = controllers;
                for (let i = 0; i < length; ++i) {
                    controllers[i].attach(flags);
                }
            }
        }
        detachControllers(flags) {
            const { controllers } = this;
            if (controllers !== void 0) {
                for (let i = controllers.length - 1; i >= 0; --i) {
                    controllers[i].detach(flags);
                }
            }
        }
        // #endregion
        // #region mount/unmount/cache
        mountCustomElement(flags) {
            if ((this.state & 64 /* isMounted */) > 0) {
                return;
            }
            this.state |= 64 /* isMounted */;
            // tslint:disable-next-line: no-non-null-assertion // non-null is implied by the hook
            this.projector.project(this.nodes);
        }
        mountSynthetic(flags) {
            this.state |= 64 /* isMounted */;
            // tslint:disable-next-line: no-non-null-assertion // non-null is implied by the hook
            this.nodes.insertBefore(this.location);
        }
        unmountCustomElement(flags) {
            if ((this.state & 64 /* isMounted */) === 0) {
                return;
            }
            this.state = (this.state | 64 /* isMounted */) ^ 64 /* isMounted */;
            // tslint:disable-next-line: no-non-null-assertion // non-null is implied by the hook
            this.projector.take(this.nodes);
        }
        unmountSynthetic(flags) {
            if ((this.state & 64 /* isMounted */) === 0) {
                return false;
            }
            this.state = (this.state | 64 /* isMounted */) ^ 64 /* isMounted */;
            // tslint:disable-next-line: no-non-null-assertion // non-null is implied by the hook
            this.nodes.remove();
            this.nodes.unlink();
            if ((this.state & 32768 /* canBeCached */) > 0) {
                this.state = (this.state | 32768 /* canBeCached */) ^ 32768 /* canBeCached */;
                // tslint:disable-next-line: no-non-null-assertion // non-null is implied by the hook
                if (this.viewCache.tryReturnToCache(this)) {
                    this.state |= 128 /* isCached */;
                    return true;
                }
            }
            return false;
        }
        cacheCustomElement(flags) {
            flags |= 65536 /* fromCache */;
            if (this.hooks.hasCaching) {
                // tslint:disable-next-line: no-non-null-assertion // non-null is implied by the hook
                this.bindingContext.caching(flags);
            }
        }
        cacheCustomAttribute(flags) {
            flags |= 65536 /* fromCache */;
            if (this.hooks.hasCaching) {
                // tslint:disable-next-line: no-non-null-assertion // non-null is implied by the hook
                this.bindingContext.caching(flags);
            }
            const { controllers } = this;
            if (controllers !== void 0) {
                const { length } = controllers;
                for (let i = length - 1; i >= 0; --i) {
                    controllers[i].cache(flags);
                }
            }
        }
        cacheSynthetic(flags) {
            const { controllers } = this;
            if (controllers !== void 0) {
                const { length } = controllers;
                for (let i = length - 1; i >= 0; --i) {
                    controllers[i].cache(flags);
                }
            }
        }
    }
    Controller.lookup = new WeakMap();
    function createObservers(lifecycle, description, flags, instance) {
        const hasLookup = instance.$observers != void 0;
        const observers = hasLookup ? instance.$observers : {};
        const bindables = description.bindables;
        const observableNames = Object.getOwnPropertyNames(bindables);
        const useProxy = (flags & 2 /* proxyStrategy */) > 0;
        const { length } = observableNames;
        let name;
        for (let i = 0; i < length; ++i) {
            name = observableNames[i];
            if (observers[name] == void 0) {
                observers[name] = new SelfObserver(lifecycle, flags, useProxy ? ProxyObserver.getOrCreate(instance).proxy : instance, name, bindables[name].callback);
            }
        }
        if (!useProxy) {
            Reflect.defineProperty(instance, '$observers', {
                enumerable: false,
                value: observers
            });
        }
    }
    function getBindingContext(flags, instance) {
        if (instance.noProxy === true || (flags & 2 /* proxyStrategy */) === 0) {
            return instance;
        }
        return ProxyObserver.getOrCreate(instance).proxy;
    }

    const IActivator = DI.createInterface('IActivator').withDefault(x => x.singleton(Activator));
    /** @internal */
    class Activator {
        static register(container) {
            return Registration.singleton(IActivator, this).register(container);
        }
        activate(host, component, locator, flags = 1024 /* fromStartTask */, parentScope) {
            flags = flags === void 0 ? 0 /* none */ : flags;
            const controller = Controller.forCustomElement(component, locator, host, flags);
            let task = controller.bind(flags | 4096 /* fromBind */, parentScope);
            if (task.done) {
                controller.attach(flags | 16384 /* fromAttach */);
            }
            else {
                task = new ContinuationTask(task, controller.attach, controller, flags | 16384 /* fromAttach */);
            }
            return task;
        }
        deactivate(component, flags = 2048 /* fromStopTask */) {
            const controller = Controller.forCustomElement(component, (void 0), (void 0));
            controller.detach(flags | 32768 /* fromDetach */);
            return controller.unbind(flags | 8192 /* fromUnbind */);
        }
    }

    const { enter: enterStart, leave: leaveStart } = Profiler.createTimer('Aurelia.start');
    const { enter: enterStop, leave: leaveStop } = Profiler.createTimer('Aurelia.stop');
    class CompositionRoot {
        constructor(config, container) {
            this.config = config;
            if (config.host != void 0) {
                if (container.has(INode, false)) {
                    this.container = container.createChild();
                }
                else {
                    this.container = container;
                }
                Registration.instance(INode, config.host).register(this.container);
                this.host = config.host;
            }
            else if (container.has(INode, true)) {
                this.container = container;
                this.host = container.get(INode);
            }
            else {
                throw new Error(`No host element found.`);
            }
            this.strategy = config.strategy != void 0 ? config.strategy : 1 /* getterSetter */;
            const initializer = this.container.get(IDOMInitializer);
            this.dom = initializer.initialize(config);
            this.viewModel = CustomElementResource.isType(config.component)
                ? this.container.get(config.component)
                : config.component;
            this.controller = Controller.forCustomElement(this.viewModel, this.container, this.host, this.strategy);
            this.lifecycle = this.container.get(ILifecycle);
            this.activator = this.container.get(IActivator);
            if (config.enableTimeSlicing === true) {
                this.lifecycle.enableTimeslicing(config.adaptiveTimeSlicing);
            }
            else {
                this.lifecycle.disableTimeslicing();
            }
            this.task = LifecycleTask.done;
            this.hasPendingStartFrame = true;
            this.hasPendingStopFrame = true;
        }
        activate(antecedent) {
            const { task, host, viewModel, container, activator, strategy } = this;
            const flags = strategy | 1024 /* fromStartTask */;
            if (task.done) {
                if (antecedent == void 0 || antecedent.done) {
                    this.task = activator.activate(host, viewModel, container, flags, void 0);
                }
                else {
                    this.task = new ContinuationTask(antecedent, activator.activate, activator, host, viewModel, container, flags, void 0);
                }
            }
            else {
                if (antecedent == void 0 || antecedent.done) {
                    this.task = new ContinuationTask(task, activator.activate, activator, host, viewModel, container, flags, void 0);
                }
                else {
                    const combinedAntecedent = new ContinuationTask(task, antecedent.wait, antecedent);
                    this.task = new ContinuationTask(combinedAntecedent, activator.activate, activator, host, viewModel, container, flags, void 0);
                }
            }
            return this.task;
        }
        deactivate(antecedent) {
            const { task, viewModel, activator, strategy } = this;
            const flags = strategy | 2048 /* fromStopTask */;
            if (task.done) {
                if (antecedent == void 0 || antecedent.done) {
                    this.task = activator.deactivate(viewModel, flags);
                }
                else {
                    this.task = new ContinuationTask(antecedent, activator.deactivate, activator, viewModel, flags);
                }
            }
            else {
                if (antecedent == void 0 || antecedent.done) {
                    this.task = new ContinuationTask(task, activator.deactivate, activator, viewModel, flags);
                }
                else {
                    const combinedAntecedent = new ContinuationTask(task, antecedent.wait, antecedent);
                    this.task = new ContinuationTask(combinedAntecedent, activator.deactivate, activator, viewModel, flags);
                }
            }
            return this.task;
        }
    }
    class Aurelia {
        constructor(container = DI.createContainer()) {
            this.container = container;
            this.task = LifecycleTask.done;
            this._isRunning = false;
            this._isStarting = false;
            this._isStopping = false;
            this._root = void 0;
            this.next = (void 0);
            Registration.instance(Aurelia, this).register(container);
        }
        get isRunning() {
            return this._isRunning;
        }
        get isStarting() {
            return this._isStarting;
        }
        get isStopping() {
            return this._isStopping;
        }
        get root() {
            if (this._root == void 0) {
                if (this.next == void 0) {
                    throw new Error(`root is not defined`); // TODO: create error code
                }
                return this.next;
            }
            return this._root;
        }
        register(...params) {
            this.container.register(...params);
            return this;
        }
        app(config) {
            this.next = new CompositionRoot(config, this.container);
            if (this.isRunning) {
                this.start();
            }
            return this;
        }
        start(root = this.next) {
            if (root == void 0) {
                throw new Error(`There is no composition root`); // TODO: create error code
            }
            this.stop(root);
            if (this.task.done) {
                this.onBeforeStart(root);
            }
            else {
                this.task = new ContinuationTask(this.task, this.onBeforeStart, this, root);
            }
            this.task = this.root.activate(this.task);
            if (this.task.done) {
                this.task = this.onAfterStart(root);
            }
            else {
                this.task = new ContinuationTask(this.task, this.onAfterStart, this, root);
            }
            return this.task;
        }
        stop(root = this._root) {
            if (this._isRunning && root != void 0) {
                if (this.task.done) {
                    this.onBeforeStop(root);
                }
                else {
                    this.task = new ContinuationTask(this.task, this.onBeforeStop, this, root);
                }
                this.task = root.deactivate(this.task);
                if (this.task.done) {
                    this.task = this.onAfterStop(root);
                }
                else {
                    this.task = new ContinuationTask(this.task, this.onAfterStop, this, root);
                }
            }
            return this.task;
        }
        wait() {
            return this.task.wait();
        }
        onBeforeStart(root) {
            Reflect.set(root.host, '$au', this);
            this._root = root;
            this._isStarting = true;
            if (Profiler.enabled) {
                enterStart();
            }
        }
        onAfterStart(root) {
            this._isRunning = true;
            this._isStarting = false;
            this.dispatchEvent(root, 'aurelia-composed', root.dom);
            this.dispatchEvent(root, 'au-started', root.host);
            if (Profiler.enabled) {
                leaveStart();
            }
            return LifecycleTask.done;
        }
        onBeforeStop(root) {
            this._isRunning = false;
            this._isStopping = true;
            if (Profiler.enabled) {
                enterStop();
            }
        }
        onAfterStop(root) {
            Reflect.deleteProperty(root.host, '$au');
            this._root = void 0;
            this._isStopping = false;
            this.dispatchEvent(root, 'au-stopped', root.host);
            if (Profiler.enabled) {
                leaveStop();
            }
            return LifecycleTask.done;
        }
        dispatchEvent(root, name, target) {
            target = 'dispatchEvent' in target ? target : root.dom;
            target.dispatchEvent(root.dom.createCustomEvent(name, { detail: this, bubbles: true, cancelable: true }));
        }
    }
    PLATFORM.global.Aurelia = Aurelia;
    const IDOMInitializer = DI.createInterface('IDOMInitializer').noDefault();

    const slice$f = Array.prototype.slice;
    function instructionRenderer(instructionType) {
        return function decorator(target) {
            // wrap the constructor to set the instructionType to the instance (for better performance than when set on the prototype)
            const decoratedTarget = function (...args) {
                // TODO: fix this
                // @ts-ignore
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
        static register(container) {
            return Registration.singleton(IRenderer, this).register(container);
        }
        // tslint:disable-next-line:parameters-max-number
        render(flags, dom, context, renderable, targets, definition, host, parts) {
            if (Tracer.enabled) {
                Tracer.enter('Renderer', 'render', slice$f.call(arguments));
            }
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
            let instructions;
            let target;
            let current;
            for (let i = 0, ii = targets.length; i < ii; ++i) {
                instructions = targetInstructions[i];
                target = targets[i];
                for (let j = 0, jj = instructions.length; j < jj; ++j) {
                    current = instructions[j];
                    instructionRenderers[current.type].render(flags, dom, context, renderable, target, current, parts);
                }
            }
            if (host) {
                const surrogateInstructions = definition.surrogates;
                for (let i = 0, ii = surrogateInstructions.length; i < ii; ++i) {
                    current = surrogateInstructions[i];
                    instructionRenderers[current.type].render(flags, dom, context, renderable, host, current, parts);
                }
            }
            if (Tracer.enabled) {
                Tracer.leave();
            }
        }
    }
    // TODO: fix this
    // @ts-ignore
    Renderer.inject = [all(IInstructionRenderer)];
    function ensureExpression(parser, srcOrExpr, bindingType) {
        if (typeof srcOrExpr === 'string') {
            return parser.parse(srcOrExpr, bindingType);
        }
        return srcOrExpr;
    }
    function addBinding(renderable, binding) {
        if (Tracer.enabled) {
            Tracer.enter('Renderer', 'addBinding', slice$f.call(arguments));
        }
        if (renderable.bindings == void 0) {
            renderable.bindings = [binding];
        }
        else {
            renderable.bindings.push(binding);
        }
        if (Tracer.enabled) {
            Tracer.leave();
        }
    }
    function addComponent(renderable, component) {
        if (Tracer.enabled) {
            Tracer.enter('Renderer', 'addComponent', slice$f.call(arguments));
        }
        if (renderable.controllers == void 0) {
            renderable.controllers = [component];
        }
        else {
            renderable.controllers.push(component);
        }
        if (Tracer.enabled) {
            Tracer.leave();
        }
    }
    function getTarget(potentialTarget) {
        if (potentialTarget.bindingContext !== void 0) {
            return potentialTarget.bindingContext;
        }
        return potentialTarget;
    }
    let SetPropertyRenderer = 
    /** @internal */
    class SetPropertyRenderer {
        render(flags, dom, context, renderable, target, instruction) {
            if (Tracer.enabled) {
                Tracer.enter('SetPropertyRenderer', 'render', slice$f.call(arguments));
            }
            getTarget(target)[instruction.to] = instruction.value; // Yeah, yeah..
            if (Tracer.enabled) {
                Tracer.leave();
            }
        }
    };
    SetPropertyRenderer = __decorate([
        instructionRenderer("re" /* setProperty */)
        /** @internal */
    ], SetPropertyRenderer);
    let CustomElementRenderer = 
    /** @internal */
    class CustomElementRenderer {
        render(flags, dom, context, renderable, target, instruction) {
            if (Tracer.enabled) {
                Tracer.enter('CustomElementRenderer', 'render', slice$f.call(arguments));
            }
            const operation = context.beginComponentOperation(renderable, target, instruction, null, null, target, true);
            const component = context.get(customElementKey(instruction.res));
            const instructionRenderers = context.get(IRenderer).instructionRenderers;
            const childInstructions = instruction.instructions;
            const controller = Controller.forCustomElement(component, context, target, flags, instruction);
            let current;
            for (let i = 0, ii = childInstructions.length; i < ii; ++i) {
                current = childInstructions[i];
                instructionRenderers[current.type].render(flags, dom, context, renderable, controller, current);
            }
            addComponent(renderable, controller);
            operation.dispose();
            if (Tracer.enabled) {
                Tracer.leave();
            }
        }
    };
    CustomElementRenderer = __decorate([
        instructionRenderer("ra" /* hydrateElement */)
        /** @internal */
    ], CustomElementRenderer);
    let CustomAttributeRenderer = 
    /** @internal */
    class CustomAttributeRenderer {
        render(flags, dom, context, renderable, target, instruction) {
            if (Tracer.enabled) {
                Tracer.enter('CustomAttributeRenderer', 'render', slice$f.call(arguments));
            }
            const operation = context.beginComponentOperation(renderable, target, instruction);
            const component = context.get(customAttributeKey(instruction.res));
            const instructionRenderers = context.get(IRenderer).instructionRenderers;
            const childInstructions = instruction.instructions;
            const controller = Controller.forCustomAttribute(component, context, flags);
            let current;
            for (let i = 0, ii = childInstructions.length; i < ii; ++i) {
                current = childInstructions[i];
                instructionRenderers[current.type].render(flags, dom, context, renderable, controller, current);
            }
            addComponent(renderable, controller);
            operation.dispose();
            if (Tracer.enabled) {
                Tracer.leave();
            }
        }
    };
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
        render(flags, dom, context, renderable, target, instruction, parts) {
            if (Tracer.enabled) {
                Tracer.enter('TemplateControllerRenderer', 'render', slice$f.call(arguments));
            }
            const factory = this.renderingEngine.getViewFactory(dom, instruction.def, context);
            const operation = context.beginComponentOperation(renderable, target, instruction, factory, parts, dom.convertToRenderLocation(target), false);
            const component = context.get(customAttributeKey(instruction.res));
            const instructionRenderers = context.get(IRenderer).instructionRenderers;
            const childInstructions = instruction.instructions;
            const controller = Controller.forCustomAttribute(component, context, flags, instruction.parts == void 0
                ? PLATFORM.emptyArray
                : Object.keys(instruction.parts));
            if (instruction.link) {
                const controllers = renderable.controllers;
                component.link(controllers[controllers.length - 1]);
            }
            let current;
            for (let i = 0, ii = childInstructions.length; i < ii; ++i) {
                current = childInstructions[i];
                instructionRenderers[current.type].render(flags, dom, context, renderable, controller, current);
            }
            addComponent(renderable, controller);
            operation.dispose();
            if (Tracer.enabled) {
                Tracer.leave();
            }
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
        render(flags, dom, context, renderable, target, instruction) {
            if (Tracer.enabled) {
                Tracer.enter('LetElementRenderer', 'render', slice$f.call(arguments));
            }
            dom.remove(target);
            const childInstructions = instruction.instructions;
            const toViewModel = instruction.toViewModel;
            let childInstruction;
            let expr;
            let binding;
            for (let i = 0, ii = childInstructions.length; i < ii; ++i) {
                childInstruction = childInstructions[i];
                expr = ensureExpression(this.parser, childInstruction.from, 48 /* IsPropertyCommand */);
                binding = new LetBinding(expr, childInstruction.to, this.observerLocator, context, toViewModel);
                addBinding(renderable, binding);
            }
            if (Tracer.enabled) {
                Tracer.leave();
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
        render(flags, dom, context, renderable, target, instruction) {
            if (Tracer.enabled) {
                Tracer.enter('CallBindingRenderer', 'render', slice$f.call(arguments));
            }
            const expr = ensureExpression(this.parser, instruction.from, 153 /* CallCommand */);
            const binding = new Call(expr, getTarget(target), instruction.to, this.observerLocator, context);
            addBinding(renderable, binding);
            if (Tracer.enabled) {
                Tracer.leave();
            }
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
        render(flags, dom, context, renderable, target, instruction) {
            if (Tracer.enabled) {
                Tracer.enter('RefBindingRenderer', 'render', slice$f.call(arguments));
            }
            const expr = ensureExpression(this.parser, instruction.from, 1280 /* IsRef */);
            const binding = new Ref(expr, getTarget(target), context);
            addBinding(renderable, binding);
            if (Tracer.enabled) {
                Tracer.leave();
            }
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
        render(flags, dom, context, renderable, target, instruction) {
            if (Tracer.enabled) {
                Tracer.enter('InterpolationBindingRenderer', 'render', slice$f.call(arguments));
            }
            let binding;
            const expr = ensureExpression(this.parser, instruction.from, 2048 /* Interpolation */);
            if (expr.isMulti) {
                binding = new MultiInterpolationBinding(this.observerLocator, expr, getTarget(target), instruction.to, BindingMode.toView, context);
            }
            else {
                binding = new InterpolationBinding(expr.firstExpression, expr, getTarget(target), instruction.to, BindingMode.toView, this.observerLocator, context, true);
            }
            addBinding(renderable, binding);
            if (Tracer.enabled) {
                Tracer.leave();
            }
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
        render(flags, dom, context, renderable, target, instruction) {
            if (Tracer.enabled) {
                Tracer.enter('PropertyBindingRenderer', 'render', slice$f.call(arguments));
            }
            const expr = ensureExpression(this.parser, instruction.from, 48 /* IsPropertyCommand */ | instruction.mode);
            const binding = new Binding(expr, getTarget(target), instruction.to, instruction.mode, this.observerLocator, context);
            addBinding(renderable, binding);
            if (Tracer.enabled) {
                Tracer.leave();
            }
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
        render(flags, dom, context, renderable, target, instruction) {
            if (Tracer.enabled) {
                Tracer.enter('IteratorBindingRenderer', 'render', slice$f.call(arguments));
            }
            const expr = ensureExpression(this.parser, instruction.from, 539 /* ForCommand */);
            const binding = new Binding(expr, getTarget(target), instruction.to, BindingMode.toView, this.observerLocator, context);
            addBinding(renderable, binding);
            if (Tracer.enabled) {
                Tracer.leave();
            }
        }
    };
    IteratorBindingRenderer.inject = [IExpressionParser, IObserverLocator];
    IteratorBindingRenderer = __decorate([
        instructionRenderer("rk" /* iteratorBinding */)
        /** @internal */
    ], IteratorBindingRenderer);

    const IObserverLocatorRegistration = ObserverLocator;
    const ILifecycleRegistration = Lifecycle;
    const IRendererRegistration = Renderer;
    /**
     * Default implementations for the following interfaces:
     * - `IObserverLocator`
     * - `ILifecycle`
     * - `IRenderer`
     */
    const DefaultComponents = [
        IObserverLocatorRegistration,
        ILifecycleRegistration,
        IRendererRegistration
    ];
    const IfRegistration = If;
    const ElseRegistration = Else;
    const RepeatRegistration = Repeat;
    const ReplaceableRegistration = Replaceable;
    const WithRegistration = With;
    const SanitizeValueConverterRegistration = SanitizeValueConverter;
    const DebounceBindingBehaviorRegistration = DebounceBindingBehavior;
    const OneTimeBindingBehaviorRegistration = OneTimeBindingBehavior;
    const ToViewBindingBehaviorRegistration = ToViewBindingBehavior;
    const FromViewBindingBehaviorRegistration = FromViewBindingBehavior;
    const SignalBindingBehaviorRegistration = SignalBindingBehavior;
    const ThrottleBindingBehaviorRegistration = ThrottleBindingBehavior;
    const TwoWayBindingBehaviorRegistration = TwoWayBindingBehavior;
    const PriorityBindingBehaviorRegistration = PriorityBindingBehavior;
    /**
     * Default resources:
     * - Template controllers (`if`/`else`, `repeat`, `replaceable`, `with`)
     * - Value Converters (`sanitize`)
     * - Binding Behaviors (`oneTime`, `toView`, `fromView`, `twoWay`, `signal`, `debounce`, `throttle`)
     */
    const DefaultResources = [
        IfRegistration,
        ElseRegistration,
        RepeatRegistration,
        ReplaceableRegistration,
        WithRegistration,
        SanitizeValueConverterRegistration,
        DebounceBindingBehaviorRegistration,
        OneTimeBindingBehaviorRegistration,
        ToViewBindingBehaviorRegistration,
        FromViewBindingBehaviorRegistration,
        SignalBindingBehaviorRegistration,
        PriorityBindingBehaviorRegistration,
        ThrottleBindingBehaviorRegistration,
        TwoWayBindingBehaviorRegistration
    ];
    const CallBindingRendererRegistration = CallBindingRenderer;
    const CustomAttributeRendererRegistration = CustomAttributeRenderer;
    const CustomElementRendererRegistration = CustomElementRenderer;
    const InterpolationBindingRendererRegistration = InterpolationBindingRenderer;
    const IteratorBindingRendererRegistration = IteratorBindingRenderer;
    const LetElementRendererRegistration = LetElementRenderer;
    const PropertyBindingRendererRegistration = PropertyBindingRenderer;
    const RefBindingRendererRegistration = RefBindingRenderer;
    const SetPropertyRendererRegistration = SetPropertyRenderer;
    const TemplateControllerRendererRegistration = TemplateControllerRenderer;
    /**
     * Default renderers for:
     * - PropertyBinding: `bind`, `one-time`, `to-view`, `from-view`, `two-way`
     * - IteratorBinding: `for`
     * - CallBinding: `call`
     * - RefBinding: `ref`
     * - InterpolationBinding: `${}`
     * - SetProperty
     * - `customElement` hydration
     * - `customAttribute` hydration
     * - `templateController` hydration
     * - `let` element hydration
     */
    const DefaultRenderers = [
        PropertyBindingRendererRegistration,
        IteratorBindingRendererRegistration,
        CallBindingRendererRegistration,
        RefBindingRendererRegistration,
        InterpolationBindingRendererRegistration,
        SetPropertyRendererRegistration,
        CustomElementRendererRegistration,
        CustomAttributeRendererRegistration,
        TemplateControllerRendererRegistration,
        LetElementRendererRegistration
    ];
    /**
     * A DI configuration object containing environment/runtime-agnostic registrations:
     * - `DefaultComponents`
     * - `DefaultResources`
     * - `DefaultRenderers`
     */
    const RuntimeBasicConfiguration = {
        /**
         * Apply this configuration to the provided container.
         */
        register(container) {
            return container.register(...DefaultComponents, ...DefaultResources, ...DefaultRenderers);
        },
        /**
         * Create a new container with this configuration applied to it.
         */
        createContainer() {
            return this.register(DI.createContainer());
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
        constructor(def, res, instructions, link, parts) {
            this.type = "rc" /* hydrateTemplateController */;
            this.def = def;
            this.instructions = instructions;
            this.link = link;
            this.parts = parts;
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
        get CollectionLengthObserver () { return CollectionLengthObserver; },
        get CollectionSizeObserver () { return CollectionSizeObserver; },
        computed: computed,
        createComputedObserver: createComputedObserver,
        get CustomSetterObserver () { return CustomSetterObserver; },
        get GetterObserver () { return GetterObserver; },
        IDirtyChecker: IDirtyChecker,
        get DirtyCheckProperty () { return DirtyCheckProperty; },
        DirtyCheckSettings: DirtyCheckSettings,
        IObserverLocator: IObserverLocator,
        ITargetObserverLocator: ITargetObserverLocator,
        ITargetAccessorLocator: ITargetAccessorLocator,
        getCollectionObserver: getCollectionObserver,
        ObserverLocator: ObserverLocator,
        PrimitiveObserver: PrimitiveObserver,
        PropertyAccessor: PropertyAccessor,
        get ProxyObserver () { return ProxyObserver; },
        get SelfObserver () { return SelfObserver; },
        get SetterObserver () { return SetterObserver; },
        ISignaler: ISignaler,
        subscriberCollection: subscriberCollection,
        collectionSubscriberCollection: collectionSubscriberCollection,
        proxySubscriberCollection: proxySubscriberCollection,
        bindingBehavior: bindingBehavior,
        BindingBehaviorResource: BindingBehaviorResource,
        BindingModeBehavior: BindingModeBehavior,
        OneTimeBindingBehavior: OneTimeBindingBehavior,
        ToViewBindingBehavior: ToViewBindingBehavior,
        FromViewBindingBehavior: FromViewBindingBehavior,
        TwoWayBindingBehavior: TwoWayBindingBehavior,
        DebounceBindingBehavior: DebounceBindingBehavior,
        PriorityBindingBehavior: PriorityBindingBehavior,
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
        Bindable: Bindable,
        Controller: Controller,
        ViewFactory: ViewFactory,
        Aurelia: Aurelia,
        IDOMInitializer: IDOMInitializer,
        CompositionRoot: CompositionRoot,
        IfRegistration: IfRegistration,
        ElseRegistration: ElseRegistration,
        RepeatRegistration: RepeatRegistration,
        ReplaceableRegistration: ReplaceableRegistration,
        WithRegistration: WithRegistration,
        SanitizeValueConverterRegistration: SanitizeValueConverterRegistration,
        DebounceBindingBehaviorRegistration: DebounceBindingBehaviorRegistration,
        OneTimeBindingBehaviorRegistration: OneTimeBindingBehaviorRegistration,
        ToViewBindingBehaviorRegistration: ToViewBindingBehaviorRegistration,
        FromViewBindingBehaviorRegistration: FromViewBindingBehaviorRegistration,
        PriorityBindingBehaviorRegistration: PriorityBindingBehaviorRegistration,
        SignalBindingBehaviorRegistration: SignalBindingBehaviorRegistration,
        ThrottleBindingBehaviorRegistration: ThrottleBindingBehaviorRegistration,
        TwoWayBindingBehaviorRegistration: TwoWayBindingBehaviorRegistration,
        RefBindingRendererRegistration: RefBindingRendererRegistration,
        CallBindingRendererRegistration: CallBindingRendererRegistration,
        CustomAttributeRendererRegistration: CustomAttributeRendererRegistration,
        CustomElementRendererRegistration: CustomElementRendererRegistration,
        InterpolationBindingRendererRegistration: InterpolationBindingRendererRegistration,
        IteratorBindingRendererRegistration: IteratorBindingRendererRegistration,
        LetElementRendererRegistration: LetElementRendererRegistration,
        PropertyBindingRendererRegistration: PropertyBindingRendererRegistration,
        SetPropertyRendererRegistration: SetPropertyRendererRegistration,
        TemplateControllerRendererRegistration: TemplateControllerRendererRegistration,
        DefaultResources: DefaultResources,
        IObserverLocatorRegistration: IObserverLocatorRegistration,
        ILifecycleRegistration: ILifecycleRegistration,
        IRendererRegistration: IRendererRegistration,
        RuntimeBasicConfiguration: RuntimeBasicConfiguration,
        buildTemplateDefinition: buildTemplateDefinition,
        HooksDefinition: HooksDefinition,
        isTargetedInstruction: isTargetedInstruction,
        ITargetedInstruction: ITargetedInstruction,
        get TargetedInstructionType () { return TargetedInstructionType; },
        DOM: DOM,
        INode: INode,
        IRenderLocation: IRenderLocation,
        IDOM: IDOM,
        NodeSequence: NodeSequence,
        get BindingMode () { return BindingMode; },
        get BindingStrategy () { return BindingStrategy; },
        get ExpressionKind () { return ExpressionKind; },
        get Hooks () { return Hooks; },
        get LifecycleFlags () { return LifecycleFlags; },
        get State () { return State$1; },
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
        get ViewModelKind () { return ViewModelKind; },
        ILifecycle: ILifecycle,
        IController: IController,
        IViewFactory: IViewFactory,
        get Priority () { return Priority; },
        AggregateContinuationTask: AggregateContinuationTask,
        TerminalTask: TerminalTask,
        AggregateTerminalTask: AggregateTerminalTask,
        ContinuationTask: ContinuationTask,
        LifecycleTask: LifecycleTask,
        PromiseTask: PromiseTask,
        get CollectionKind () { return CollectionKind; },
        get DelegationStrategy () { return DelegationStrategy; },
        isIndexMap: isIndexMap,
        copyIndexMap: copyIndexMap,
        cloneIndexMap: cloneIndexMap,
        createIndexMap: createIndexMap,
        instructionRenderer: instructionRenderer,
        ensureExpression: ensureExpression,
        addComponent: addComponent,
        addBinding: addBinding,
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
        const WritableType = Type;
        const description = typeof nameOrDefinition === 'string' ? { name: nameOrDefinition, target: null } : nameOrDefinition;
        WritableType.kind = BindingCommandResource;
        WritableType.description = description;
        Type.register = register$2;
        return Type;
    }
    const BindingCommandResource = {
        name: 'binding-command',
        keyFrom: keyFrom$2,
        isType: isType$4,
        define: define$4
    };
    function getTarget$1(binding, makeCamelCase) {
        if (binding.flags & 256 /* isBinding */) {
            return binding.bindable.propName;
        }
        else if (makeCamelCase) {
            return camelCase(binding.syntax.target);
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
            return new OneTimeBindingInstruction(binding.expression, getTarget$1(binding, false));
        }
    }
    BindingCommandResource.define('one-time', OneTimeBindingCommand);
    class ToViewBindingCommand {
        constructor() {
            this.bindingType = 50 /* ToViewCommand */;
        }
        compile(binding) {
            return new ToViewBindingInstruction(binding.expression, getTarget$1(binding, false));
        }
    }
    BindingCommandResource.define('to-view', ToViewBindingCommand);
    class FromViewBindingCommand {
        constructor() {
            this.bindingType = 51 /* FromViewCommand */;
        }
        compile(binding) {
            return new FromViewBindingInstruction(binding.expression, getTarget$1(binding, false));
        }
    }
    BindingCommandResource.define('from-view', FromViewBindingCommand);
    class TwoWayBindingCommand {
        constructor() {
            this.bindingType = 52 /* TwoWayCommand */;
        }
        compile(binding) {
            return new TwoWayBindingInstruction(binding.expression, getTarget$1(binding, false));
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
            // @ts-ignore
            return this[modeToProperty[getMode(binding)]](binding);
        }
    }
    BindingCommandResource.define('bind', DefaultBindingCommand);
    class CallBindingCommand {
        constructor() {
            this.bindingType = 153 /* CallCommand */;
        }
        compile(binding) {
            return new CallBindingInstruction(binding.expression, getTarget$1(binding, true));
        }
    }
    BindingCommandResource.define('call', CallBindingCommand);
    class ForBindingCommand {
        constructor() {
            this.bindingType = 539 /* ForCommand */;
        }
        compile(binding) {
            return new IteratorBindingInstruction(binding.expression, getTarget$1(binding, false));
        }
    }
    BindingCommandResource.define('for', ForBindingCommand);

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
    var Access;
    (function (Access) {
        Access[Access["Reset"] = 0] = "Reset";
        Access[Access["Ancestor"] = 511] = "Ancestor";
        Access[Access["This"] = 512] = "This";
        Access[Access["Scope"] = 1024] = "Scope";
        Access[Access["Member"] = 2048] = "Member";
        Access[Access["Keyed"] = 4096] = "Keyed";
    })(Access || (Access = {}));
    var Precedence;
    (function (Precedence) {
        Precedence[Precedence["Variadic"] = 61] = "Variadic";
        Precedence[Precedence["Assign"] = 62] = "Assign";
        Precedence[Precedence["Conditional"] = 63] = "Conditional";
        Precedence[Precedence["LogicalOR"] = 64] = "LogicalOR";
        Precedence[Precedence["LogicalAND"] = 128] = "LogicalAND";
        Precedence[Precedence["Equality"] = 192] = "Equality";
        Precedence[Precedence["Relational"] = 256] = "Relational";
        Precedence[Precedence["Additive"] = 320] = "Additive";
        Precedence[Precedence["Multiplicative"] = 384] = "Multiplicative";
        Precedence[Precedence["Binary"] = 448] = "Binary";
        Precedence[Precedence["LeftHandSide"] = 449] = "LeftHandSide";
        Precedence[Precedence["Primary"] = 450] = "Primary";
        Precedence[Precedence["Unary"] = 451] = "Unary";
    })(Precedence || (Precedence = {}));
    /** @internal */
    var Token;
    (function (Token) {
        Token[Token["EOF"] = 1572864] = "EOF";
        Token[Token["ExpressionTerminal"] = 1048576] = "ExpressionTerminal";
        Token[Token["AccessScopeTerminal"] = 524288] = "AccessScopeTerminal";
        Token[Token["ClosingToken"] = 262144] = "ClosingToken";
        Token[Token["OpeningToken"] = 131072] = "OpeningToken";
        Token[Token["BinaryOp"] = 65536] = "BinaryOp";
        Token[Token["UnaryOp"] = 32768] = "UnaryOp";
        Token[Token["LeftHandSide"] = 16384] = "LeftHandSide";
        Token[Token["StringOrNumericLiteral"] = 12288] = "StringOrNumericLiteral";
        Token[Token["NumericLiteral"] = 8192] = "NumericLiteral";
        Token[Token["StringLiteral"] = 4096] = "StringLiteral";
        Token[Token["IdentifierName"] = 3072] = "IdentifierName";
        Token[Token["Keyword"] = 2048] = "Keyword";
        Token[Token["Identifier"] = 1024] = "Identifier";
        Token[Token["Contextual"] = 512] = "Contextual";
        Token[Token["Precedence"] = 448] = "Precedence";
        Token[Token["Type"] = 63] = "Type";
        Token[Token["FalseKeyword"] = 2048] = "FalseKeyword";
        Token[Token["TrueKeyword"] = 2049] = "TrueKeyword";
        Token[Token["NullKeyword"] = 2050] = "NullKeyword";
        Token[Token["UndefinedKeyword"] = 2051] = "UndefinedKeyword";
        Token[Token["ThisScope"] = 3076] = "ThisScope";
        Token[Token["ParentScope"] = 3077] = "ParentScope";
        Token[Token["OpenParen"] = 671750] = "OpenParen";
        Token[Token["OpenBrace"] = 131079] = "OpenBrace";
        Token[Token["Dot"] = 16392] = "Dot";
        Token[Token["CloseBrace"] = 1835017] = "CloseBrace";
        Token[Token["CloseParen"] = 1835018] = "CloseParen";
        Token[Token["Comma"] = 1572875] = "Comma";
        Token[Token["OpenBracket"] = 671756] = "OpenBracket";
        Token[Token["CloseBracket"] = 1835021] = "CloseBracket";
        Token[Token["Colon"] = 1572878] = "Colon";
        Token[Token["Question"] = 1572879] = "Question";
        Token[Token["Ampersand"] = 1572880] = "Ampersand";
        Token[Token["Bar"] = 1572883] = "Bar";
        Token[Token["BarBar"] = 1638548] = "BarBar";
        Token[Token["AmpersandAmpersand"] = 1638613] = "AmpersandAmpersand";
        Token[Token["EqualsEquals"] = 1638678] = "EqualsEquals";
        Token[Token["ExclamationEquals"] = 1638679] = "ExclamationEquals";
        Token[Token["EqualsEqualsEquals"] = 1638680] = "EqualsEqualsEquals";
        Token[Token["ExclamationEqualsEquals"] = 1638681] = "ExclamationEqualsEquals";
        Token[Token["LessThan"] = 1638746] = "LessThan";
        Token[Token["GreaterThan"] = 1638747] = "GreaterThan";
        Token[Token["LessThanEquals"] = 1638748] = "LessThanEquals";
        Token[Token["GreaterThanEquals"] = 1638749] = "GreaterThanEquals";
        Token[Token["InKeyword"] = 1640798] = "InKeyword";
        Token[Token["InstanceOfKeyword"] = 1640799] = "InstanceOfKeyword";
        Token[Token["Plus"] = 623008] = "Plus";
        Token[Token["Minus"] = 623009] = "Minus";
        Token[Token["TypeofKeyword"] = 34850] = "TypeofKeyword";
        Token[Token["VoidKeyword"] = 34851] = "VoidKeyword";
        Token[Token["Asterisk"] = 1638884] = "Asterisk";
        Token[Token["Percent"] = 1638885] = "Percent";
        Token[Token["Slash"] = 1638886] = "Slash";
        Token[Token["Equals"] = 1048615] = "Equals";
        Token[Token["Exclamation"] = 32808] = "Exclamation";
        Token[Token["TemplateTail"] = 540713] = "TemplateTail";
        Token[Token["TemplateContinuation"] = 540714] = "TemplateContinuation";
        Token[Token["OfKeyword"] = 1051179] = "OfKeyword";
    })(Token || (Token = {}));
    var Char;
    (function (Char) {
        Char[Char["Null"] = 0] = "Null";
        Char[Char["Backspace"] = 8] = "Backspace";
        Char[Char["Tab"] = 9] = "Tab";
        Char[Char["LineFeed"] = 10] = "LineFeed";
        Char[Char["VerticalTab"] = 11] = "VerticalTab";
        Char[Char["FormFeed"] = 12] = "FormFeed";
        Char[Char["CarriageReturn"] = 13] = "CarriageReturn";
        Char[Char["Space"] = 32] = "Space";
        Char[Char["Exclamation"] = 33] = "Exclamation";
        Char[Char["DoubleQuote"] = 34] = "DoubleQuote";
        Char[Char["Dollar"] = 36] = "Dollar";
        Char[Char["Percent"] = 37] = "Percent";
        Char[Char["Ampersand"] = 38] = "Ampersand";
        Char[Char["SingleQuote"] = 39] = "SingleQuote";
        Char[Char["OpenParen"] = 40] = "OpenParen";
        Char[Char["CloseParen"] = 41] = "CloseParen";
        Char[Char["Asterisk"] = 42] = "Asterisk";
        Char[Char["Plus"] = 43] = "Plus";
        Char[Char["Comma"] = 44] = "Comma";
        Char[Char["Minus"] = 45] = "Minus";
        Char[Char["Dot"] = 46] = "Dot";
        Char[Char["Slash"] = 47] = "Slash";
        Char[Char["Semicolon"] = 59] = "Semicolon";
        Char[Char["Backtick"] = 96] = "Backtick";
        Char[Char["OpenBracket"] = 91] = "OpenBracket";
        Char[Char["Backslash"] = 92] = "Backslash";
        Char[Char["CloseBracket"] = 93] = "CloseBracket";
        Char[Char["Caret"] = 94] = "Caret";
        Char[Char["Underscore"] = 95] = "Underscore";
        Char[Char["OpenBrace"] = 123] = "OpenBrace";
        Char[Char["Bar"] = 124] = "Bar";
        Char[Char["CloseBrace"] = 125] = "CloseBrace";
        Char[Char["Colon"] = 58] = "Colon";
        Char[Char["LessThan"] = 60] = "LessThan";
        Char[Char["Equals"] = 61] = "Equals";
        Char[Char["GreaterThan"] = 62] = "GreaterThan";
        Char[Char["Question"] = 63] = "Question";
        Char[Char["Zero"] = 48] = "Zero";
        Char[Char["One"] = 49] = "One";
        Char[Char["Two"] = 50] = "Two";
        Char[Char["Three"] = 51] = "Three";
        Char[Char["Four"] = 52] = "Four";
        Char[Char["Five"] = 53] = "Five";
        Char[Char["Six"] = 54] = "Six";
        Char[Char["Seven"] = 55] = "Seven";
        Char[Char["Eight"] = 56] = "Eight";
        Char[Char["Nine"] = 57] = "Nine";
        Char[Char["UpperA"] = 65] = "UpperA";
        Char[Char["UpperB"] = 66] = "UpperB";
        Char[Char["UpperC"] = 67] = "UpperC";
        Char[Char["UpperD"] = 68] = "UpperD";
        Char[Char["UpperE"] = 69] = "UpperE";
        Char[Char["UpperF"] = 70] = "UpperF";
        Char[Char["UpperG"] = 71] = "UpperG";
        Char[Char["UpperH"] = 72] = "UpperH";
        Char[Char["UpperI"] = 73] = "UpperI";
        Char[Char["UpperJ"] = 74] = "UpperJ";
        Char[Char["UpperK"] = 75] = "UpperK";
        Char[Char["UpperL"] = 76] = "UpperL";
        Char[Char["UpperM"] = 77] = "UpperM";
        Char[Char["UpperN"] = 78] = "UpperN";
        Char[Char["UpperO"] = 79] = "UpperO";
        Char[Char["UpperP"] = 80] = "UpperP";
        Char[Char["UpperQ"] = 81] = "UpperQ";
        Char[Char["UpperR"] = 82] = "UpperR";
        Char[Char["UpperS"] = 83] = "UpperS";
        Char[Char["UpperT"] = 84] = "UpperT";
        Char[Char["UpperU"] = 85] = "UpperU";
        Char[Char["UpperV"] = 86] = "UpperV";
        Char[Char["UpperW"] = 87] = "UpperW";
        Char[Char["UpperX"] = 88] = "UpperX";
        Char[Char["UpperY"] = 89] = "UpperY";
        Char[Char["UpperZ"] = 90] = "UpperZ";
        Char[Char["LowerA"] = 97] = "LowerA";
        Char[Char["LowerB"] = 98] = "LowerB";
        Char[Char["LowerC"] = 99] = "LowerC";
        Char[Char["LowerD"] = 100] = "LowerD";
        Char[Char["LowerE"] = 101] = "LowerE";
        Char[Char["LowerF"] = 102] = "LowerF";
        Char[Char["LowerG"] = 103] = "LowerG";
        Char[Char["LowerH"] = 104] = "LowerH";
        Char[Char["LowerI"] = 105] = "LowerI";
        Char[Char["LowerJ"] = 106] = "LowerJ";
        Char[Char["LowerK"] = 107] = "LowerK";
        Char[Char["LowerL"] = 108] = "LowerL";
        Char[Char["LowerM"] = 109] = "LowerM";
        Char[Char["LowerN"] = 110] = "LowerN";
        Char[Char["LowerO"] = 111] = "LowerO";
        Char[Char["LowerP"] = 112] = "LowerP";
        Char[Char["LowerQ"] = 113] = "LowerQ";
        Char[Char["LowerR"] = 114] = "LowerR";
        Char[Char["LowerS"] = 115] = "LowerS";
        Char[Char["LowerT"] = 116] = "LowerT";
        Char[Char["LowerU"] = 117] = "LowerU";
        Char[Char["LowerV"] = 118] = "LowerV";
        Char[Char["LowerW"] = 119] = "LowerW";
        Char[Char["LowerX"] = 120] = "LowerX";
        Char[Char["LowerY"] = 121] = "LowerY";
        Char[Char["LowerZ"] = 122] = "LowerZ";
    })(Char || (Char = {}));

    const { enter: enter$1, leave: leave$1 } = Profiler.createTimer('ExpressionParser');
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
    var SyntaxError$1;
    (function (SyntaxError) {
        SyntaxError[SyntaxError["InvalidExpressionStart"] = 100] = "InvalidExpressionStart";
        SyntaxError[SyntaxError["UnconsumedToken"] = 101] = "UnconsumedToken";
        SyntaxError[SyntaxError["DoubleDot"] = 102] = "DoubleDot";
        SyntaxError[SyntaxError["InvalidMemberExpression"] = 103] = "InvalidMemberExpression";
        SyntaxError[SyntaxError["UnexpectedEndOfExpression"] = 104] = "UnexpectedEndOfExpression";
        SyntaxError[SyntaxError["ExpectedIdentifier"] = 105] = "ExpectedIdentifier";
        SyntaxError[SyntaxError["InvalidForDeclaration"] = 106] = "InvalidForDeclaration";
        SyntaxError[SyntaxError["InvalidObjectLiteralPropertyDefinition"] = 107] = "InvalidObjectLiteralPropertyDefinition";
        SyntaxError[SyntaxError["UnterminatedQuote"] = 108] = "UnterminatedQuote";
        SyntaxError[SyntaxError["UnterminatedTemplate"] = 109] = "UnterminatedTemplate";
        SyntaxError[SyntaxError["MissingExpectedToken"] = 110] = "MissingExpectedToken";
        SyntaxError[SyntaxError["UnexpectedCharacter"] = 111] = "UnexpectedCharacter";
        SyntaxError[SyntaxError["MissingValueConverter"] = 112] = "MissingValueConverter";
        SyntaxError[SyntaxError["MissingBindingBehavior"] = 113] = "MissingBindingBehavior";
    })(SyntaxError$1 || (SyntaxError$1 = {}));
    var SemanticError;
    (function (SemanticError) {
        SemanticError[SemanticError["NotAssignable"] = 150] = "NotAssignable";
        SemanticError[SemanticError["UnexpectedForOf"] = 151] = "UnexpectedForOf";
    })(SemanticError || (SemanticError = {}));
    function parseExpression(input, bindingType) {
        $state.input = input;
        $state.length = input.length;
        $state.index = 0;
        $state.currentChar = input.charCodeAt(0);
        return parse($state, 0 /* Reset */, 61 /* Variadic */, bindingType === void 0 ? 53 /* BindCommand */ : bindingType);
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
        if (Profiler.enabled) {
            enter$1();
        }
        if (state.index === 0) {
            if (bindingType & 2048 /* Interpolation */) {
                if (Profiler.enabled) {
                    leave$1();
                }
                // tslint:disable-next-line:no-any
                return parseInterpolation(state);
            }
            nextToken(state);
            if (state.currentToken & 1048576 /* ExpressionTerminal */) {
                if (Profiler.enabled) {
                    leave$1();
                }
                throw Reporter.error(100 /* InvalidExpressionStart */, { state });
            }
        }
        state.assignable = 448 /* Binary */ > minPrecedence;
        let result = void 0;
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
                                if (Profiler.enabled) {
                                    leave$1();
                                }
                                throw Reporter.error(102 /* DoubleDot */, { state });
                            }
                            else if (state.currentToken === 1572864 /* EOF */) {
                                if (Profiler.enabled) {
                                    leave$1();
                                }
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
                            if (Profiler.enabled) {
                                leave$1();
                            }
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
                        if (Profiler.enabled) {
                            leave$1();
                        }
                        throw Reporter.error(104 /* UnexpectedEndOfExpression */, { state });
                    }
                    else {
                        if (Profiler.enabled) {
                            leave$1();
                        }
                        throw Reporter.error(101 /* UnconsumedToken */, { state });
                    }
            }
            if (bindingType & 512 /* IsIterator */) {
                if (Profiler.enabled) {
                    leave$1();
                }
                // tslint:disable-next-line:no-any
                return parseForOfStatement(state, result);
            }
            if (449 /* LeftHandSide */ < minPrecedence) {
                if (Profiler.enabled) {
                    leave$1();
                }
                // tslint:disable-next-line:no-any
                return result;
            }
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
                            if (Profiler.enabled) {
                                leave$1();
                            }
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
        if (448 /* Binary */ < minPrecedence) {
            if (Profiler.enabled) {
                leave$1();
            }
            // tslint:disable-next-line:no-any
            return result;
        }
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
        if (63 /* Conditional */ < minPrecedence) {
            if (Profiler.enabled) {
                leave$1();
            }
            // tslint:disable-next-line:no-any
            return result;
        }
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
        if (62 /* Assign */ < minPrecedence) {
            if (Profiler.enabled) {
                leave$1();
            }
            // tslint:disable-next-line:no-any
            return result;
        }
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
                if (Profiler.enabled) {
                    leave$1();
                }
                throw Reporter.error(150 /* NotAssignable */, { state });
            }
            result = new Assign(result, parse(state, access, 62 /* Assign */, bindingType));
        }
        if (61 /* Variadic */ < minPrecedence) {
            if (Profiler.enabled) {
                leave$1();
            }
            // tslint:disable-next-line:no-any
            return result;
        }
        /** parseValueConverter
         */
        while (consumeOpt(state, 1572883 /* Bar */)) {
            if (state.currentToken === 1572864 /* EOF */) {
                if (Profiler.enabled) {
                    leave$1();
                }
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
                if (Profiler.enabled) {
                    leave$1();
                }
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
                if (Profiler.enabled) {
                    leave$1();
                }
                // tslint:disable-next-line:no-any
                return result;
            }
            if (state.tokenRaw === 'of') {
                if (Profiler.enabled) {
                    leave$1();
                }
                throw Reporter.error(151 /* UnexpectedForOf */, { state });
            }
            if (Profiler.enabled) {
                leave$1();
            }
            throw Reporter.error(101 /* UnconsumedToken */, { state });
        }
        if (Profiler.enabled) {
            leave$1();
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
                    break;
                }
            }
            else {
                elements.push(parse(state, access, 62 /* Assign */, bindingType & ~512 /* IsIterator */));
                if (consumeOpt(state, 1572875 /* Comma */)) {
                    if (state.currentToken === 1835021 /* CloseBracket */) {
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
            if (((state.currentToken = (CharScanners[state.currentChar](state)))) != null) { // a null token means the character must be skipped
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

    const IExpressionParserRegistration = {
        register(container) {
            container.registerTransformer(IExpressionParser, parser => {
                Reflect.set(parser, 'parseCore', parseExpression);
                return parser;
            });
        }
    };
    /**
     * Default runtime/environment-agnostic implementations for the following interfaces:
     * - `IExpressionParser`
     */
    const DefaultComponents$1 = [
        IExpressionParserRegistration
    ];
    const AtPrefixedTriggerAttributePatternRegistration = AtPrefixedTriggerAttributePattern;
    const ColonPrefixedBindAttributePatternRegistration = ColonPrefixedBindAttributePattern;
    const RefAttributePatternRegistration = RefAttributePattern;
    const DotSeparatedAttributePatternRegistration = DotSeparatedAttributePattern;
    /**
     * Default binding syntax for the following attribute name patterns:
     * - `ref`
     * - `target.command` (dot-separated)
     */
    const DefaultBindingSyntax = [
        RefAttributePatternRegistration,
        DotSeparatedAttributePatternRegistration
    ];
    /**
     * Binding syntax for short-hand attribute name patterns:
     * - `@target` (short-hand for `target.trigger`)
     * - `:target` (short-hand for `target.bind`)
     */
    const ShortHandBindingSyntax = [
        AtPrefixedTriggerAttributePatternRegistration,
        ColonPrefixedBindAttributePatternRegistration
    ];
    const CallBindingCommandRegistration = CallBindingCommand;
    const DefaultBindingCommandRegistration = DefaultBindingCommand;
    const ForBindingCommandRegistration = ForBindingCommand;
    const FromViewBindingCommandRegistration = FromViewBindingCommand;
    const OneTimeBindingCommandRegistration = OneTimeBindingCommand;
    const ToViewBindingCommandRegistration = ToViewBindingCommand;
    const TwoWayBindingCommandRegistration = TwoWayBindingCommand;
    /**
     * Default runtime/environment-agnostic binding commands:
     * - Property observation: `.bind`, `.one-time`, `.from-view`, `.to-view`, `.two-way`
     * - Function call: `.call`
     * - Collection observation: `.for`
     */
    const DefaultBindingLanguage = [
        DefaultBindingCommandRegistration,
        OneTimeBindingCommandRegistration,
        FromViewBindingCommandRegistration,
        ToViewBindingCommandRegistration,
        TwoWayBindingCommandRegistration,
        CallBindingCommandRegistration,
        ForBindingCommandRegistration
    ];
    /**
     * A DI configuration object containing runtime/environment-agnostic registrations:
     * - `BasicConfiguration` from `@aurelia/runtime`
     * - `DefaultComponents`
     * - `DefaultBindingSyntax`
     * - `DefaultBindingLanguage`
     */
    const BasicConfiguration = {
        /**
         * Apply this configuration to the provided container.
         */
        register(container) {
            return RuntimeBasicConfiguration
                .register(container)
                .register(...DefaultComponents$1, ...DefaultBindingSyntax, ...DefaultBindingLanguage);
        },
        /**
         * Create a new container with this configuration applied to it.
         */
        createContainer() {
            return this.register(DI.createContainer());
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
            if (result === void 0) {
                const def = this.resources.find(CustomElementResource, name);
                if (def == null) {
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
            const name = camelCase(syntax.target);
            let result = this.attributeLookup[name];
            if (result === void 0) {
                const def = this.resources.find(CustomAttributeResource, name);
                if (def == null) {
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
            if (result === void 0) {
                result = this.resources.create(BindingCommandResource, name);
                if (result == null) {
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
        let bindable;
        let prop;
        let attr;
        let mode;
        for (prop in bindables) {
            bindable = bindables[prop];
            // explicitly provided property name has priority over the implicit property name
            if (bindable.property !== void 0) {
                prop = bindable.property;
            }
            // explicitly provided attribute name has priority over the derived implicit attribute name
            if (bindable.attribute !== void 0) {
                attr = bindable.attribute;
            }
            else {
                // derive the attribute name from the resolved property name
                attr = kebabCase(prop);
            }
            if (bindable.mode !== void 0 && bindable.mode !== BindingMode.default) {
                mode = bindable.mode;
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
        const defaultBindingMode = def.defaultBindingMode !== void 0 && def.defaultBindingMode !== BindingMode.default
            ? def.defaultBindingMode
            : BindingMode.toView;
        let bindable;
        let prop;
        let mode;
        let bindableCount = 0;
        for (prop in bindables) {
            ++bindableCount;
            bindable = bindables[prop];
            // explicitly provided property name has priority over the implicit property name
            if (bindable.property !== void 0) {
                prop = bindable.property;
            }
            if (bindable.mode !== void 0 && bindable.mode !== BindingMode.default) {
                mode = bindable.mode;
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
        constructor(name, containerless) {
            this.name = name;
            this.containerless = containerless;
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

    var SymbolFlags;
    (function (SymbolFlags) {
        SymbolFlags[SymbolFlags["type"] = 511] = "type";
        SymbolFlags[SymbolFlags["isTemplateController"] = 1] = "isTemplateController";
        SymbolFlags[SymbolFlags["isReplacePart"] = 2] = "isReplacePart";
        SymbolFlags[SymbolFlags["isCustomAttribute"] = 4] = "isCustomAttribute";
        SymbolFlags[SymbolFlags["isPlainAttribute"] = 8] = "isPlainAttribute";
        SymbolFlags[SymbolFlags["isCustomElement"] = 16] = "isCustomElement";
        SymbolFlags[SymbolFlags["isLetElement"] = 32] = "isLetElement";
        SymbolFlags[SymbolFlags["isPlainElement"] = 64] = "isPlainElement";
        SymbolFlags[SymbolFlags["isText"] = 128] = "isText";
        SymbolFlags[SymbolFlags["isBinding"] = 256] = "isBinding";
        SymbolFlags[SymbolFlags["hasMarker"] = 512] = "hasMarker";
        SymbolFlags[SymbolFlags["hasTemplate"] = 1024] = "hasTemplate";
        SymbolFlags[SymbolFlags["hasAttributes"] = 2048] = "hasAttributes";
        SymbolFlags[SymbolFlags["hasBindings"] = 4096] = "hasBindings";
        SymbolFlags[SymbolFlags["hasChildNodes"] = 8192] = "hasChildNodes";
        SymbolFlags[SymbolFlags["hasParts"] = 16384] = "hasParts";
    })(SymbolFlags || (SymbolFlags = {}));
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
            if (this._bindings == null) {
                this._bindings = [];
                this.flags |= 4096 /* hasBindings */;
            }
            return this._bindings;
        }
        get parts() {
            if (this._parts == null) {
                this._parts = [];
                this.flags |= 16384 /* hasParts */;
            }
            return this._parts;
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
            this._parts = null;
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
            if (this._bindings == null) {
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
            if (this._attributes == null) {
                this._attributes = [];
                this.flags |= 2048 /* hasAttributes */;
            }
            return this._attributes;
        }
        get bindings() {
            if (this._bindings == null) {
                this._bindings = [];
                this.flags |= 4096 /* hasBindings */;
            }
            return this._bindings;
        }
        get childNodes() {
            if (this._childNodes == null) {
                this._childNodes = [];
                this.flags |= 8192 /* hasChildNodes */;
            }
            return this._childNodes;
        }
        get parts() {
            if (this._parts == null) {
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
            if (this._bindings == null) {
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
            if (this._attributes == null) {
                this._attributes = [];
                this.flags |= 2048 /* hasAttributes */;
            }
            return this._attributes;
        }
        get childNodes() {
            if (this._childNodes == null) {
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
        getTarget: getTarget$1,
        OneTimeBindingCommand: OneTimeBindingCommand,
        ToViewBindingCommand: ToViewBindingCommand,
        TwoWayBindingCommand: TwoWayBindingCommand,
        IExpressionParserRegistration: IExpressionParserRegistration,
        DefaultComponents: DefaultComponents$1,
        RefAttributePatternRegistration: RefAttributePatternRegistration,
        DotSeparatedAttributePatternRegistration: DotSeparatedAttributePatternRegistration,
        DefaultBindingSyntax: DefaultBindingSyntax,
        AtPrefixedTriggerAttributePatternRegistration: AtPrefixedTriggerAttributePatternRegistration,
        ColonPrefixedBindAttributePatternRegistration: ColonPrefixedBindAttributePatternRegistration,
        ShortHandBindingSyntax: ShortHandBindingSyntax,
        CallBindingCommandRegistration: CallBindingCommandRegistration,
        DefaultBindingCommandRegistration: DefaultBindingCommandRegistration,
        ForBindingCommandRegistration: ForBindingCommandRegistration,
        FromViewBindingCommandRegistration: FromViewBindingCommandRegistration,
        OneTimeBindingCommandRegistration: OneTimeBindingCommandRegistration,
        ToViewBindingCommandRegistration: ToViewBindingCommandRegistration,
        TwoWayBindingCommandRegistration: TwoWayBindingCommandRegistration,
        DefaultBindingLanguage: DefaultBindingLanguage,
        BasicConfiguration: BasicConfiguration,
        get Access () { return Access; },
        get Precedence () { return Precedence; },
        get Char () { return Char; },
        parseExpression: parseExpression,
        parse: parse,
        ParserState: ParserState,
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
        get SymbolFlags () { return SymbolFlags; },
        TemplateControllerSymbol: TemplateControllerSymbol,
        TextSymbol: TextSymbol
    });

    const slice$g = Array.prototype.slice;
    /**
     * Listener binding. Handle event binding between view and view model
     */
    class Listener {
        // tslint:disable-next-line:parameters-max-number
        constructor(dom, targetEvent, delegationStrategy, sourceExpression, target, preventDefault, eventManager, locator) {
            this.dom = dom;
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
            if (Tracer.enabled) {
                Tracer.enter('Listener', 'callSource', slice$g.call(arguments));
            }
            const overrideContext = this.$scope.overrideContext;
            overrideContext.$event = event;
            const result = this.sourceExpression.evaluate(2097152 /* mustEvaluate */, this.$scope, this.locator);
            Reflect.deleteProperty(overrideContext, '$event');
            if (result !== true && this.preventDefault) {
                event.preventDefault();
            }
            if (Tracer.enabled) {
                Tracer.leave();
            }
            return result;
        }
        handleEvent(event) {
            this.callSource(event);
        }
        $bind(flags, scope) {
            if (Tracer.enabled) {
                Tracer.enter('Listener', '$bind', slice$g.call(arguments));
            }
            if (this.$state & 4 /* isBound */) {
                if (this.$scope === scope) {
                    if (Tracer.enabled) {
                        Tracer.leave();
                    }
                    return;
                }
                this.$unbind(flags | 4096 /* fromBind */);
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
            this.$state |= 4 /* isBound */;
            this.$state &= ~1 /* isBinding */;
            if (Tracer.enabled) {
                Tracer.leave();
            }
        }
        $unbind(flags) {
            if (Tracer.enabled) {
                Tracer.enter('Listener', '$unbind', slice$g.call(arguments));
            }
            if (!(this.$state & 4 /* isBound */)) {
                if (Tracer.enabled) {
                    Tracer.leave();
                }
                return;
            }
            // add isUnbinding flag
            this.$state |= 2 /* isUnbinding */;
            const sourceExpression = this.sourceExpression;
            if (hasUnbind(sourceExpression)) {
                sourceExpression.unbind(flags, this.$scope, this);
            }
            this.$scope = null;
            this.handler.dispose();
            this.handler = null;
            // remove isBound and isUnbinding flags
            this.$state &= ~(4 /* isBound */ | 2 /* isUnbinding */);
            if (Tracer.enabled) {
                Tracer.leave();
            }
        }
        observeProperty(flags, obj, propertyName) {
            return;
        }
        handleChange(newValue, previousValue, flags) {
            return;
        }
    }

    /**
     * Observer for handling two-way binding with attributes
     * Has different strategy for class/style and normal attributes
     * TODO: handle SVG/attributes with namespace
     */
    let AttributeObserver = class AttributeObserver {
        constructor(lifecycle, observerLocator, element, propertyKey, targetAttribute) {
            this.observerLocator = observerLocator;
            this.lifecycle = lifecycle;
            this.obj = element;
            this.propertyKey = propertyKey;
            this.targetAttribute = targetAttribute;
            this.currentValue = null;
            this.oldValue = null;
            this.hasChanges = false;
            this.priority = 12288 /* propagate */;
        }
        getValue() {
            return this.currentValue;
        }
        setValue(newValue, flags) {
            this.currentValue = newValue;
            this.hasChanges = newValue !== this.oldValue;
            if ((flags & 4096 /* fromBind */) > 0) {
                this.flushRAF(flags);
            }
        }
        flushRAF(flags) {
            if (this.hasChanges) {
                this.hasChanges = false;
                const { currentValue } = this;
                this.oldValue = currentValue;
                switch (this.targetAttribute) {
                    case 'class': {
                        // Why is class attribute observer setValue look different with class attribute accessor?
                        // ==============
                        // For class list
                        // newValue is simply checked if truthy or falsy
                        // and toggle the class accordingly
                        // -- the rule of this is quite different to normal attribute
                        //
                        // for class attribute, observer is different in a way that it only observe a particular class at a time
                        // this also comes from syntax, where it would typically be my-class.class="someProperty"
                        //
                        // so there is no need for separating class by space and add all of them like class accessor
                        if (!!currentValue) {
                            this.obj.classList.add(this.propertyKey);
                        }
                        else {
                            this.obj.classList.remove(this.propertyKey);
                        }
                        break;
                    }
                    case 'style': {
                        let priority = '';
                        let newValue = currentValue;
                        if (typeof newValue === 'string' && newValue.includes('!important')) {
                            priority = 'important';
                            newValue = newValue.replace('!important', '');
                        }
                        this.obj.style.setProperty(this.propertyKey, newValue, priority);
                    }
                }
            }
        }
        handleMutation(mutationRecords) {
            let shouldProcess = false;
            for (let i = 0, ii = mutationRecords.length; ii > i; ++i) {
                const record = mutationRecords[i];
                if (record.type === 'attributes' && record.attributeName === this.propertyKey) {
                    shouldProcess = true;
                    break;
                }
            }
            if (shouldProcess) {
                let newValue;
                switch (this.targetAttribute) {
                    case 'class':
                        newValue = this.obj.classList.contains(this.propertyKey);
                        break;
                    case 'style':
                        newValue = this.obj.style.getPropertyValue(this.propertyKey);
                        break;
                    default:
                        throw new Error(`Unsupported targetAttribute: ${this.targetAttribute}`);
                }
                if (newValue !== this.currentValue) {
                    const { currentValue } = this;
                    this.currentValue = this.oldValue = newValue;
                    this.hasChanges = false;
                    this.callSubscribers(newValue, currentValue, 131072 /* fromDOMEvent */);
                }
            }
        }
        subscribe(subscriber) {
            if (!this.hasSubscribers()) {
                this.currentValue = this.oldValue = this.obj.getAttribute(this.propertyKey);
                startObservation(this.obj, this);
            }
            this.addSubscriber(subscriber);
        }
        unsubscribe(subscriber) {
            this.removeSubscriber(subscriber);
            if (!this.hasSubscribers()) {
                stopObservation(this.obj, this);
            }
        }
        bind(flags) {
            this.lifecycle.enqueueRAF(this.flushRAF, this, this.priority);
        }
        unbind(flags) {
            this.lifecycle.dequeueRAF(this.flushRAF, this);
        }
    };
    AttributeObserver = __decorate([
        subscriberCollection()
    ], AttributeObserver);
    const startObservation = (element, subscription) => {
        if (element.$eMObservers === undefined) {
            element.$eMObservers = new Set();
        }
        if (element.$mObserver === undefined) {
            element.$mObserver = DOM.createNodeObserver(element, 
            // @ts-ignore
            handleMutation, { attributes: true });
        }
        element.$eMObservers.add(subscription);
    };
    const stopObservation = (element, subscription) => {
        const $eMObservers = element.$eMObservers;
        if ($eMObservers.delete(subscription)) {
            if ($eMObservers.size === 0) {
                element.$mObserver.disconnect();
                element.$mObserver = undefined;
            }
            return true;
        }
        return false;
    };
    const handleMutation = (mutationRecords) => {
        mutationRecords[0].target.$eMObservers.forEach(invokeHandleMutation, mutationRecords);
    };
    function invokeHandleMutation(s) {
        s.handleMutation(this);
    }

    const slice$h = Array.prototype.slice;
    // BindingMode is not a const enum (and therefore not inlined), so assigning them to a variable to save a member accessor is a minor perf tweak
    const { oneTime: oneTime$3, toView: toView$3, fromView: fromView$3 } = BindingMode;
    // pre-combining flags for bitwise checks is a minor perf tweak
    const toViewOrOneTime$1 = toView$3 | oneTime$3;
    /**
     * Attribute binding. Handle attribute binding betwen view/view model. Understand Html special attributes
     */
    let AttributeBinding = class AttributeBinding {
        constructor(sourceExpression, target, 
        // some attributes may have inner structure
        // such as class -> collection of class names
        // such as style -> collection of style rules
        //
        // for normal attributes, targetAttribute and targetProperty are the same and can be ignore
        targetAttribute, targetKey, mode, observerLocator, locator) {
            connectable.assignIdTo(this);
            this.$state = 0 /* none */;
            this.$lifecycle = locator.get(ILifecycle);
            this.$scope = null;
            this.locator = locator;
            this.mode = mode;
            this.observerLocator = observerLocator;
            this.sourceExpression = sourceExpression;
            this.target = target;
            this.targetAttribute = targetAttribute;
            this.targetProperty = targetKey;
            this.persistentFlags = 0 /* none */;
        }
        updateTarget(value, flags) {
            flags |= this.persistentFlags;
            this.targetObserver.setValue(value, flags | 16 /* updateTargetInstance */);
        }
        updateSource(value, flags) {
            flags |= this.persistentFlags;
            this.sourceExpression.assign(flags | 32 /* updateSourceExpression */, this.$scope, this.locator, value);
        }
        handleChange(newValue, _previousValue, flags) {
            if (Tracer.enabled) {
                Tracer.enter('Binding', 'handleChange', slice$h.call(arguments));
            }
            if (!(this.$state & 4 /* isBound */)) {
                if (Tracer.enabled) {
                    Tracer.leave();
                }
                return;
            }
            flags |= this.persistentFlags;
            if (this.mode === BindingMode.fromView) {
                flags &= ~16 /* updateTargetInstance */;
                flags |= 32 /* updateSourceExpression */;
            }
            if (flags & 16 /* updateTargetInstance */) {
                const previousValue = this.targetObserver.getValue();
                // if the only observable is an AccessScope then we can assume the passed-in newValue is the correct and latest value
                if (this.sourceExpression.$kind !== 10082 /* AccessScope */ || this.observerSlots > 1) {
                    newValue = this.sourceExpression.evaluate(flags, this.$scope, this.locator);
                }
                if (newValue !== previousValue) {
                    this.updateTarget(newValue, flags);
                }
                if ((this.mode & oneTime$3) === 0) {
                    this.version++;
                    this.sourceExpression.connect(flags, this.$scope, this);
                    this.unobserve(false);
                }
                if (Tracer.enabled) {
                    Tracer.leave();
                }
                return;
            }
            if (flags & 32 /* updateSourceExpression */) {
                if (newValue !== this.sourceExpression.evaluate(flags, this.$scope, this.locator)) {
                    this.updateSource(newValue, flags);
                }
                if (Tracer.enabled) {
                    Tracer.leave();
                }
                return;
            }
            throw Reporter.error(15, flags);
        }
        $bind(flags, scope) {
            if (Tracer.enabled) {
                Tracer.enter('Binding', '$bind', slice$h.call(arguments));
            }
            if (this.$state & 4 /* isBound */) {
                if (this.$scope === scope) {
                    if (Tracer.enabled) {
                        Tracer.leave();
                    }
                    return;
                }
                this.$unbind(flags | 4096 /* fromBind */);
            }
            // add isBinding flag
            this.$state |= 1 /* isBinding */;
            // Store flags which we can only receive during $bind and need to pass on
            // to the AST during evaluate/connect/assign
            this.persistentFlags = flags & 536870927 /* persistentBindingFlags */;
            this.$scope = scope;
            let sourceExpression = this.sourceExpression;
            if (hasBind(sourceExpression)) {
                sourceExpression.bind(flags, scope, this);
            }
            let targetObserver = this.targetObserver;
            if (!targetObserver) {
                targetObserver = this.targetObserver = new AttributeObserver(this.$lifecycle, this.observerLocator, this.target, this.targetProperty, this.targetAttribute);
            }
            if (targetObserver.bind) {
                targetObserver.bind(flags);
            }
            // during bind, binding behavior might have changed sourceExpression
            sourceExpression = this.sourceExpression;
            if (this.mode & toViewOrOneTime$1) {
                this.updateTarget(sourceExpression.evaluate(flags, scope, this.locator), flags);
            }
            if (this.mode & toView$3) {
                sourceExpression.connect(flags, scope, this);
            }
            if (this.mode & fromView$3) {
                targetObserver[this.id] |= 32 /* updateSourceExpression */;
                targetObserver.subscribe(this);
            }
            // add isBound flag and remove isBinding flag
            this.$state |= 4 /* isBound */;
            this.$state &= ~1 /* isBinding */;
            if (Tracer.enabled) {
                Tracer.leave();
            }
        }
        $unbind(flags) {
            if (Tracer.enabled) {
                Tracer.enter('Binding', '$unbind', slice$h.call(arguments));
            }
            if (!(this.$state & 4 /* isBound */)) {
                if (Tracer.enabled) {
                    Tracer.leave();
                }
                return;
            }
            // add isUnbinding flag
            this.$state |= 2 /* isUnbinding */;
            // clear persistent flags
            this.persistentFlags = 0 /* none */;
            if (hasUnbind(this.sourceExpression)) {
                this.sourceExpression.unbind(flags, this.$scope, this);
            }
            this.$scope = null;
            if (this.targetObserver.unbind) {
                this.targetObserver.unbind(flags);
            }
            if (this.targetObserver.unsubscribe) {
                this.targetObserver.unsubscribe(this);
                this.targetObserver[this.id] &= ~32 /* updateSourceExpression */;
            }
            this.unobserve(true);
            // remove isBound and isUnbinding flags
            this.$state &= ~(4 /* isBound */ | 2 /* isUnbinding */);
            if (Tracer.enabled) {
                Tracer.leave();
            }
        }
        connect(flags) {
            if (Tracer.enabled) {
                Tracer.enter('Binding', 'connect', slice$h.call(arguments));
            }
            if (this.$state & 4 /* isBound */) {
                flags |= this.persistentFlags;
                this.sourceExpression.connect(flags | 2097152 /* mustEvaluate */, this.$scope, this);
            }
            if (Tracer.enabled) {
                Tracer.leave();
            }
        }
    };
    AttributeBinding = __decorate([
        connectable()
    ], AttributeBinding);

    class AttributeNSAccessor {
        constructor(lifecycle, obj, propertyKey, namespace) {
            this.lifecycle = lifecycle;
            this.obj = obj;
            this.propertyKey = propertyKey;
            this.currentValue = null;
            this.oldValue = null;
            this.namespace = namespace;
            this.hasChanges = false;
            this.priority = 12288 /* propagate */;
        }
        getValue() {
            return this.currentValue;
        }
        setValue(newValue, flags) {
            this.currentValue = newValue;
            this.hasChanges = newValue !== this.oldValue;
            if ((flags & 4096 /* fromBind */) > 0) {
                this.flushRAF(flags);
            }
        }
        flushRAF(flags) {
            if (this.hasChanges) {
                this.hasChanges = false;
                const { currentValue } = this;
                this.oldValue = currentValue;
                if (currentValue == void 0) {
                    this.obj.removeAttributeNS(this.namespace, this.propertyKey);
                }
                else {
                    this.obj.setAttributeNS(this.namespace, this.propertyKey, currentValue);
                }
            }
        }
        bind(flags) {
            this.lifecycle.enqueueRAF(this.flushRAF, this, this.priority);
            this.currentValue = this.oldValue = this.obj.getAttributeNS(this.namespace, this.propertyKey);
        }
        unbind(flags) {
            this.lifecycle.dequeueRAF(this.flushRAF, this);
        }
    }

    function defaultMatcher(a, b) {
        return a === b;
    }
    let CheckedObserver = class CheckedObserver {
        constructor(lifecycle, observerLocator, handler, obj) {
            this.lifecycle = lifecycle;
            this.observerLocator = observerLocator;
            this.handler = handler;
            this.obj = obj;
            this.currentValue = void 0;
            this.oldValue = void 0;
            this.hasChanges = false;
            this.priority = 12288 /* propagate */;
            this.arrayObserver = void 0;
            this.valueObserver = void 0;
        }
        getValue() {
            return this.currentValue;
        }
        setValue(newValue, flags) {
            this.currentValue = newValue;
            this.hasChanges = newValue !== this.oldValue;
            if ((flags & 4096 /* fromBind */) > 0) {
                this.flushRAF(flags);
            }
        }
        flushRAF(flags) {
            if (this.hasChanges) {
                this.hasChanges = false;
                const { currentValue } = this;
                this.oldValue = currentValue;
                if (this.valueObserver === void 0) {
                    if (this.obj.$observers !== void 0) {
                        if (this.obj.$observers.model !== void 0) {
                            this.valueObserver = this.obj.$observers.model;
                        }
                        else if (this.obj.$observers.value !== void 0) {
                            this.valueObserver = this.obj.$observers.value;
                        }
                    }
                    if (this.valueObserver !== void 0) {
                        this.valueObserver.subscribe(this);
                    }
                }
                if (this.arrayObserver !== void 0) {
                    this.arrayObserver.unsubscribeFromCollection(this);
                    this.arrayObserver = void 0;
                }
                if (this.obj.type === 'checkbox' && Array.isArray(currentValue)) {
                    this.arrayObserver = this.observerLocator.getArrayObserver(flags, currentValue);
                    this.arrayObserver.subscribeToCollection(this);
                }
                this.synchronizeElement();
            }
        }
        handleCollectionChange(indexMap, flags) {
            const { currentValue, oldValue } = this;
            if ((flags & 4096 /* fromBind */) > 0) {
                this.oldValue = currentValue;
                this.synchronizeElement();
            }
            else {
                this.hasChanges = true;
            }
            this.callSubscribers(currentValue, oldValue, flags);
        }
        handleChange(newValue, previousValue, flags) {
            if ((flags & 4096 /* fromBind */) > 0) {
                this.synchronizeElement();
            }
            else {
                this.hasChanges = true;
            }
            this.callSubscribers(newValue, previousValue, flags);
        }
        synchronizeElement() {
            const { currentValue, obj } = this;
            const elementValue = obj.hasOwnProperty('model') ? obj.model : obj.value;
            const isRadio = obj.type === 'radio';
            const matcher = obj.matcher !== void 0 ? obj.matcher : defaultMatcher;
            if (isRadio) {
                obj.checked = !!matcher(currentValue, elementValue);
            }
            else if (currentValue === true) {
                obj.checked = true;
            }
            else if (Array.isArray(currentValue)) {
                obj.checked = currentValue.findIndex(item => !!matcher(item, elementValue)) !== -1;
            }
            else {
                obj.checked = false;
            }
        }
        handleEvent() {
            this.oldValue = this.currentValue;
            let { currentValue } = this;
            const { obj } = this;
            const elementValue = obj.hasOwnProperty('model') ? obj.model : obj.value;
            let index;
            const matcher = obj.matcher !== void 0 ? obj.matcher : defaultMatcher;
            if (obj.type === 'checkbox') {
                if (Array.isArray(currentValue)) {
                    index = currentValue.findIndex(item => !!matcher(item, elementValue));
                    if (obj.checked && index === -1) {
                        currentValue.push(elementValue);
                    }
                    else if (!obj.checked && index !== -1) {
                        currentValue.splice(index, 1);
                    }
                    // when existing currentValue is array, do not invoke callback as only the array obj has changed
                    return;
                }
                currentValue = obj.checked;
            }
            else if (obj.checked) {
                currentValue = elementValue;
            }
            else {
                return;
            }
            this.currentValue = currentValue;
            this.callSubscribers(this.currentValue, this.oldValue, 131072 /* fromDOMEvent */ | 524288 /* allowPublishRoundtrip */);
        }
        bind(flags) {
            this.lifecycle.enqueueRAF(this.flushRAF, this, this.priority);
            this.currentValue = this.obj.checked;
        }
        unbind(flags) {
            if (this.arrayObserver !== void 0) {
                this.arrayObserver.unsubscribeFromCollection(this);
                this.arrayObserver = void 0;
            }
            if (this.valueObserver !== void 0) {
                this.valueObserver.unsubscribe(this);
            }
            this.lifecycle.dequeueRAF(this.flushRAF, this);
        }
        subscribe(subscriber) {
            if (!this.hasSubscribers()) {
                this.handler.subscribe(this.obj, this);
            }
            this.addSubscriber(subscriber);
        }
        unsubscribe(subscriber) {
            this.removeSubscriber(subscriber);
            if (!this.hasSubscribers()) {
                this.handler.dispose();
            }
        }
    };
    CheckedObserver = __decorate([
        subscriberCollection()
    ], CheckedObserver);

    class ClassAttributeAccessor {
        constructor(lifecycle, obj) {
            this.lifecycle = lifecycle;
            this.obj = obj;
            this.currentValue = '';
            this.oldValue = '';
            this.doNotCache = true;
            this.nameIndex = {};
            this.version = 0;
            this.isActive = false;
            this.hasChanges = false;
            this.priority = 12288 /* propagate */;
        }
        getValue() {
            return this.currentValue;
        }
        setValue(newValue, flags) {
            this.currentValue = newValue;
            this.hasChanges = newValue !== this.oldValue;
            if ((flags & 4096 /* fromBind */) > 0) {
                this.flushRAF(flags);
            }
        }
        flushRAF(flags) {
            if (this.hasChanges) {
                this.hasChanges = false;
                const { currentValue, nameIndex } = this;
                let { version } = this;
                this.oldValue = currentValue;
                let names;
                let name;
                // Add the classes, tracking the version at which they were added.
                if (currentValue.length) {
                    const node = this.obj;
                    names = currentValue.split(/\s+/);
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
        }
        bind(flags) {
            this.lifecycle.enqueueRAF(this.flushRAF, this, this.priority);
        }
        unbind(flags) {
            this.lifecycle.dequeueRAF(this.flushRAF, this);
        }
    }

    class DataAttributeAccessor {
        constructor(lifecycle, obj, propertyKey) {
            this.lifecycle = lifecycle;
            this.obj = obj;
            this.propertyKey = propertyKey;
            this.currentValue = null;
            this.oldValue = null;
            this.hasChanges = false;
            this.priority = 12288 /* propagate */;
        }
        getValue() {
            return this.currentValue;
        }
        setValue(newValue, flags) {
            this.currentValue = newValue;
            this.hasChanges = newValue !== this.oldValue;
            if ((flags & 4096 /* fromBind */) > 0) {
                this.flushRAF(flags);
            }
        }
        flushRAF(flags) {
            if (this.hasChanges) {
                this.hasChanges = false;
                const { currentValue } = this;
                this.oldValue = currentValue;
                if (currentValue == void 0) {
                    this.obj.removeAttribute(this.propertyKey);
                }
                else {
                    this.obj.setAttribute(this.propertyKey, currentValue);
                }
            }
        }
        bind(flags) {
            this.lifecycle.enqueueRAF(this.flushRAF, this, this.priority);
            this.currentValue = this.oldValue = this.obj.getAttribute(this.propertyKey);
        }
        unbind(flags) {
            this.lifecycle.dequeueRAF(this.flushRAF, this);
        }
    }

    class ElementPropertyAccessor {
        constructor(lifecycle, obj, propertyKey) {
            this.lifecycle = lifecycle;
            this.obj = obj;
            this.propertyKey = propertyKey;
            this.currentValue = void 0;
            this.oldValue = void 0;
            this.hasChanges = false;
            this.priority = 12288 /* propagate */;
        }
        getValue() {
            return this.currentValue;
        }
        setValue(newValue, flags) {
            this.currentValue = newValue;
            this.hasChanges = newValue !== this.oldValue;
            if ((flags & 4096 /* fromBind */) > 0) {
                this.flushRAF(flags);
            }
        }
        flushRAF(flags) {
            if (this.hasChanges) {
                this.hasChanges = false;
                const { currentValue } = this;
                this.oldValue = currentValue;
                this.obj[this.propertyKey] = currentValue;
            }
        }
        bind(flags) {
            this.lifecycle.enqueueRAF(this.flushRAF, this, this.priority);
            this.currentValue = this.oldValue = this.obj[this.propertyKey];
        }
        unbind(flags) {
            this.lifecycle.dequeueRAF(this.flushRAF, this);
        }
    }

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
        /*@internal*/
        dispose() {
            if (this.count > 0) {
                this.count = 0;
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
            this.delegatedHandlers = {};
            this.capturedHandlers = {};
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
        dispose() {
            let key;
            const { delegatedHandlers, capturedHandlers } = this;
            for (key in delegatedHandlers) {
                delegatedHandlers[key].dispose();
            }
            for (key in capturedHandlers) {
                capturedHandlers[key].dispose();
            }
        }
    }

    const childObserverOptions = {
        childList: true,
        subtree: true,
        characterData: true
    };
    function defaultMatcher$1(a, b) {
        return a === b;
    }
    let SelectValueObserver = class SelectValueObserver {
        constructor(lifecycle, observerLocator, dom, handler, obj) {
            this.lifecycle = lifecycle;
            this.observerLocator = observerLocator;
            this.dom = dom;
            this.obj = obj;
            this.handler = handler;
            this.currentValue = void 0;
            this.oldValue = void 0;
            this.hasChanges = false;
            this.priority = 12288 /* propagate */;
            this.arrayObserver = void 0;
            this.nodeObserver = void 0;
            this.handleNodeChange = this.handleNodeChange.bind(this);
        }
        getValue() {
            return this.currentValue;
        }
        setValue(newValue, flags) {
            this.currentValue = newValue;
            this.hasChanges = newValue !== this.oldValue;
            if ((flags & 4096 /* fromBind */) > 0) {
                this.flushRAF(flags);
            }
        }
        flushRAF(flags) {
            if (this.hasChanges) {
                this.hasChanges = false;
                const { currentValue } = this;
                this.oldValue = currentValue;
                const isArray = Array.isArray(currentValue);
                if (!isArray && currentValue != void 0 && this.obj.multiple) {
                    throw new Error('Only null or Array instances can be bound to a multi-select.');
                }
                if (this.arrayObserver) {
                    this.arrayObserver.unsubscribeFromCollection(this);
                    this.arrayObserver = void 0;
                }
                if (isArray) {
                    this.arrayObserver = this.observerLocator.getArrayObserver(flags, currentValue);
                    this.arrayObserver.subscribeToCollection(this);
                }
                this.synchronizeOptions();
                this.notify(flags);
            }
        }
        handleCollectionChange(indexMap, flags) {
            if ((flags & 4096 /* fromBind */) > 0) {
                this.synchronizeOptions();
            }
            else {
                this.hasChanges = true;
            }
            this.callSubscribers(this.currentValue, this.oldValue, flags);
        }
        handleChange(newValue, previousValue, flags) {
            if ((flags & 4096 /* fromBind */) > 0) {
                this.synchronizeOptions();
            }
            else {
                this.hasChanges = true;
            }
            this.callSubscribers(newValue, previousValue, flags);
        }
        notify(flags) {
            if ((flags & 4096 /* fromBind */) > 0) {
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
                this.callSubscribers(this.currentValue, this.oldValue, 131072 /* fromDOMEvent */ | 524288 /* allowPublishRoundtrip */);
            }
        }
        synchronizeOptions(indexMap) {
            const { currentValue, obj } = this;
            const isArray = Array.isArray(currentValue);
            const matcher = obj.matcher !== void 0 ? obj.matcher : defaultMatcher$1;
            const options = obj.options;
            let i = options.length;
            while (i-- > 0) {
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
        bind() {
            this.nodeObserver = this.dom.createNodeObserver(this.obj, this.handleNodeChange, childObserverOptions);
            this.lifecycle.enqueueRAF(this.flushRAF, this, this.priority);
        }
        unbind() {
            this.nodeObserver.disconnect();
            this.nodeObserver = null;
            this.lifecycle.dequeueRAF(this.flushRAF, this);
            if (this.arrayObserver) {
                this.arrayObserver.unsubscribeFromCollection(this);
                this.arrayObserver = null;
            }
        }
        handleNodeChange() {
            this.synchronizeOptions();
            const shouldNotify = this.synchronizeValue();
            if (shouldNotify) {
                this.notify(131072 /* fromDOMEvent */);
            }
        }
        subscribe(subscriber) {
            if (!this.hasSubscribers()) {
                this.handler.subscribe(this.obj, this);
            }
            this.addSubscriber(subscriber);
        }
        unsubscribe(subscriber) {
            this.removeSubscriber(subscriber);
            if (!this.hasSubscribers()) {
                this.handler.dispose();
            }
        }
    };
    SelectValueObserver = __decorate([
        subscriberCollection()
    ], SelectValueObserver);

    class StyleAttributeAccessor {
        constructor(lifecycle, obj) {
            this.lifecycle = lifecycle;
            this.obj = obj;
            this.currentValue = '';
            this.oldValue = '';
            this.styles = {};
            this.version = 0;
            this.hasChanges = false;
            this.priority = 12288 /* propagate */;
        }
        getValue() {
            return this.obj.style.cssText;
        }
        setValue(newValue, flags) {
            this.currentValue = newValue;
            this.hasChanges = newValue !== this.oldValue;
            if ((flags & 4096 /* fromBind */) > 0) {
                this.flushRAF(flags);
            }
        }
        flushRAF(flags) {
            if (this.hasChanges) {
                this.hasChanges = false;
                const { currentValue } = this;
                this.oldValue = currentValue;
                const styles = this.styles;
                let style;
                let version = this.version;
                if (currentValue instanceof Object) {
                    let value;
                    for (style in currentValue) {
                        if (currentValue.hasOwnProperty(style)) {
                            value = currentValue[style];
                            style = style.replace(/([A-Z])/g, m => `-${m.toLowerCase()}`);
                            styles[style] = version;
                            this.setProperty(style, value);
                        }
                    }
                }
                else if (typeof currentValue === 'string') {
                    const rx = /\s*([\w\-]+)\s*:\s*((?:(?:[\w\-]+\(\s*(?:"(?:\\"|[^"])*"|'(?:\\'|[^'])*'|[\w\-]+\(\s*(?:[^"](?:\\"|[^"])*"|'(?:\\'|[^'])*'|[^\)]*)\),?|[^\)]*)\),?|"(?:\\"|[^"])*"|'(?:\\'|[^'])*'|[^;]*),?\s*)+);?/g;
                    let pair;
                    while ((pair = rx.exec(currentValue)) != null) {
                        style = pair[1];
                        if (!style) {
                            continue;
                        }
                        styles[style] = version;
                        this.setProperty(style, pair[2]);
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
        }
        setProperty(style, value) {
            let priority = '';
            if (value != null && typeof value.indexOf === 'function' && value.indexOf('!important') !== -1) {
                priority = 'important';
                value = value.replace('!important', '');
            }
            this.obj.style.setProperty(style, value, priority);
        }
        bind(flags) {
            this.lifecycle.enqueueRAF(this.flushRAF, this, this.priority);
            this.oldValue = this.currentValue = this.obj.style.cssText;
        }
        unbind(flags) {
            this.lifecycle.dequeueRAF(this.flushRAF, this);
        }
    }

    const ISVGAnalyzer = DI.createInterface('ISVGAnalyzer').withDefault(x => x.singleton(class {
        isStandardSvgAttribute(node, attributeName) {
            return false;
        }
    }));

    // TODO: handle file attribute properly again, etc
    let ValueAttributeObserver = class ValueAttributeObserver {
        constructor(lifecycle, handler, obj, propertyKey) {
            this.lifecycle = lifecycle;
            this.handler = handler;
            this.obj = obj;
            this.propertyKey = propertyKey;
            this.currentValue = '';
            this.oldValue = '';
            this.hasChanges = false;
            this.priority = 12288 /* propagate */;
        }
        getValue() {
            return this.currentValue;
        }
        setValue(newValue, flags) {
            this.currentValue = newValue;
            this.hasChanges = newValue !== this.oldValue;
            if ((flags & 4096 /* fromBind */) > 0) {
                this.flushRAF(flags);
            }
        }
        flushRAF(flags) {
            if (this.hasChanges) {
                this.hasChanges = false;
                const { currentValue, oldValue } = this;
                this.oldValue = currentValue;
                if (currentValue == void 0) {
                    this.obj[this.propertyKey] = '';
                }
                else {
                    this.obj[this.propertyKey] = currentValue;
                }
                if ((flags & 4096 /* fromBind */) === 0) {
                    this.callSubscribers(currentValue, oldValue, flags);
                }
            }
        }
        handleEvent() {
            const oldValue = this.oldValue = this.currentValue;
            const currentValue = this.currentValue = this.obj[this.propertyKey];
            if (oldValue !== currentValue) {
                this.oldValue = currentValue;
                this.callSubscribers(currentValue, oldValue, 131072 /* fromDOMEvent */ | 524288 /* allowPublishRoundtrip */);
            }
        }
        subscribe(subscriber) {
            if (!this.hasSubscribers()) {
                this.handler.subscribe(this.obj, this);
                this.currentValue = this.oldValue = this.obj[this.propertyKey];
            }
            this.addSubscriber(subscriber);
        }
        unsubscribe(subscriber) {
            this.removeSubscriber(subscriber);
            if (!this.hasSubscribers()) {
                this.handler.dispose();
            }
        }
        bind(flags) {
            this.lifecycle.enqueueRAF(this.flushRAF, this, this.priority);
        }
        unbind(flags) {
            this.lifecycle.dequeueRAF(this.flushRAF, this);
        }
    };
    ValueAttributeObserver = __decorate([
        subscriberCollection()
    ], ValueAttributeObserver);

    const xlinkNS = 'http://www.w3.org/1999/xlink';
    const xmlNS = 'http://www.w3.org/XML/1998/namespace';
    const xmlnsNS = 'http://www.w3.org/2000/xmlns/';
    // https://html.spec.whatwg.org/multipage/syntax.html#attributes-2
    const nsAttributes = Object.assign(Object.create(null), {
        'xlink:actuate': ['actuate', xlinkNS],
        'xlink:arcrole': ['arcrole', xlinkNS],
        'xlink:href': ['href', xlinkNS],
        'xlink:role': ['role', xlinkNS],
        'xlink:show': ['show', xlinkNS],
        'xlink:title': ['title', xlinkNS],
        'xlink:type': ['type', xlinkNS],
        'xml:lang': ['lang', xmlNS],
        'xml:space': ['space', xmlNS],
        'xmlns': ['xmlns', xmlnsNS],
        'xmlns:xlink': ['xlink', xmlnsNS],
    });
    const inputEvents = ['change', 'input'];
    const selectEvents = ['change'];
    const contentEvents = ['change', 'input', 'blur', 'keyup', 'paste'];
    const scrollEvents = ['scroll'];
    const overrideProps = Object.assign(Object.create(null), {
        'class': true,
        'style': true,
        'css': true,
        'checked': true,
        'value': true,
        'model': true,
        'xlink:actuate': true,
        'xlink:arcrole': true,
        'xlink:href': true,
        'xlink:role': true,
        'xlink:show': true,
        'xlink:title': true,
        'xlink:type': true,
        'xml:lang': true,
        'xml:space': true,
        'xmlns': true,
        'xmlns:xlink': true,
    });
    class TargetObserverLocator {
        constructor(dom, svgAnalyzer) {
            this.dom = dom;
            this.svgAnalyzer = svgAnalyzer;
        }
        static register(container) {
            return Registration.singleton(ITargetObserverLocator, this).register(container);
        }
        getObserver(flags, lifecycle, observerLocator, obj, propertyName) {
            switch (propertyName) {
                case 'checked':
                    return new CheckedObserver(lifecycle, observerLocator, new EventSubscriber(this.dom, inputEvents), obj);
                case 'value':
                    if (obj.tagName === 'SELECT') {
                        return new SelectValueObserver(lifecycle, observerLocator, this.dom, new EventSubscriber(this.dom, selectEvents), obj);
                    }
                    return new ValueAttributeObserver(lifecycle, new EventSubscriber(this.dom, inputEvents), obj, propertyName);
                case 'files':
                    return new ValueAttributeObserver(lifecycle, new EventSubscriber(this.dom, inputEvents), obj, propertyName);
                case 'textContent':
                case 'innerHTML':
                    return new ValueAttributeObserver(lifecycle, new EventSubscriber(this.dom, contentEvents), obj, propertyName);
                case 'scrollTop':
                case 'scrollLeft':
                    return new ValueAttributeObserver(lifecycle, new EventSubscriber(this.dom, scrollEvents), obj, propertyName);
                case 'class':
                    return new ClassAttributeAccessor(lifecycle, obj);
                case 'style':
                case 'css':
                    return new StyleAttributeAccessor(lifecycle, obj);
                case 'model':
                    return new SetterObserver(lifecycle, flags, obj, propertyName);
                case 'role':
                    return new DataAttributeAccessor(lifecycle, obj, propertyName);
                default:
                    if (nsAttributes[propertyName] !== undefined) {
                        const nsProps = nsAttributes[propertyName];
                        return new AttributeNSAccessor(lifecycle, obj, nsProps[0], nsProps[1]);
                    }
                    if (isDataAttribute(obj, propertyName, this.svgAnalyzer)) {
                        return new DataAttributeAccessor(lifecycle, obj, propertyName);
                    }
            }
            return null;
        }
        overridesAccessor(flags, obj, propertyName) {
            return overrideProps[propertyName] === true;
        }
        handles(flags, obj) {
            return this.dom.isNodeInstance(obj);
        }
    }
    TargetObserverLocator.inject = [IDOM, ISVGAnalyzer];
    class TargetAccessorLocator {
        constructor(dom, svgAnalyzer) {
            this.dom = dom;
            this.svgAnalyzer = svgAnalyzer;
        }
        static register(container) {
            return Registration.singleton(ITargetAccessorLocator, this).register(container);
        }
        getAccessor(flags, lifecycle, obj, propertyName) {
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
                        return new AttributeNSAccessor(lifecycle, obj, nsProps[0], nsProps[1]);
                    }
                    if (isDataAttribute(obj, propertyName, this.svgAnalyzer)) {
                        return new DataAttributeAccessor(lifecycle, obj, propertyName);
                    }
                    return new ElementPropertyAccessor(lifecycle, obj, propertyName);
            }
        }
        handles(flags, obj) {
            return this.dom.isNodeInstance(obj);
        }
    }
    TargetAccessorLocator.inject = [IDOM, ISVGAnalyzer];
    const IsDataAttribute = {};
    function isDataAttribute(obj, propertyName, svgAnalyzer) {
        if (IsDataAttribute[propertyName] === true) {
            return true;
        }
        const prefix = propertyName.slice(0, 5);
        // https://html.spec.whatwg.org/multipage/dom.html#wai-aria
        // https://html.spec.whatwg.org/multipage/dom.html#custom-data-attribute
        return IsDataAttribute[propertyName] =
            prefix === 'aria-' ||
                prefix === 'data-' ||
                svgAnalyzer.isStandardSvgAttribute(obj, propertyName);
    }

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
            this.persistentFlags = flags & 536870927 /* persistentBindingFlags */;
            // ensure the binding's target observer has been set.
            const targetObserver = this.observerLocator.getObserver(this.persistentFlags | flags, binding.target, binding.targetProperty);
            if (!targetObserver.handler) {
                throw Reporter.error(10);
            }
            binding.targetObserver = targetObserver;
            // stash the original element subscribe function.
            targetObserver.originalHandler = binding.targetObserver.handler;
            // replace the element subscribe function with one that uses the correct events.
            targetObserver.handler = new EventSubscriber(binding.locator.get(IDOM), events);
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

    var HTMLTargetedInstructionType;
    (function (HTMLTargetedInstructionType) {
        HTMLTargetedInstructionType["textBinding"] = "ha";
        HTMLTargetedInstructionType["listenerBinding"] = "hb";
        HTMLTargetedInstructionType["attributeBinding"] = "hc";
        HTMLTargetedInstructionType["stylePropertyBinding"] = "hd";
        HTMLTargetedInstructionType["setAttribute"] = "he";
    })(HTMLTargetedInstructionType || (HTMLTargetedInstructionType = {}));
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
            this.type = "hd" /* stylePropertyBinding */;
            this.from = from;
            this.to = to;
        }
    }
    class SetAttributeInstruction {
        constructor(value, to) {
            this.type = "he" /* setAttribute */;
            this.to = to;
            this.value = value;
        }
    }
    class AttributeBindingInstruction {
        constructor(attr, from, to) {
            this.type = "hc" /* attributeBinding */;
            this.from = from;
            this.attr = attr;
            this.to = to;
        }
    }

    const slice$i = Array.prototype.slice;
    function createElement(dom, tagOrType, props, children) {
        if (typeof tagOrType === 'string') {
            return createElementForTag(dom, tagOrType, props, children);
        }
        else if (CustomElementResource.isType(tagOrType)) {
            return createElementForType(dom, tagOrType, props, children);
        }
        else {
            throw new Error(`Invalid tagOrType.`);
        }
    }
    /**
     * RenderPlan. Todo: describe goal of this class
     */
    class RenderPlan {
        constructor(dom, node, instructions, dependencies) {
            this.dom = dom;
            this.dependencies = dependencies;
            this.instructions = instructions;
            this.node = node;
            this.lazyDefinition = void 0;
        }
        get definition() {
            if (this.lazyDefinition === void 0) {
                this.lazyDefinition = buildTemplateDefinition(null, null, this.node, null, typeof this.node === 'string', null, this.instructions, this.dependencies);
            }
            return this.lazyDefinition;
        }
        getElementTemplate(engine, Type) {
            return engine.getElementTemplate(this.dom, this.definition, void 0, Type);
        }
        createView(flags, engine, parentContext) {
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
        if (Tracer.enabled) {
            Tracer.enter('createElement', 'createElementForTag', slice$i.call(arguments));
        }
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
        if (Tracer.enabled) {
            Tracer.leave();
        }
        return new RenderPlan(dom, element, allInstructions, dependencies);
    }
    function createElementForType(dom, Type, props, children) {
        if (Tracer.enabled) {
            Tracer.enter('createElement', 'createElementForType', slice$i.call(arguments));
        }
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
                    const bindable = bindables[to];
                    if (bindable !== void 0) {
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
        if (Tracer.enabled) {
            Tracer.leave();
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

    const bindables = ['subject', 'composing'];
    class Compose {
        constructor(dom, renderable, instruction, renderingEngine) {
            this.id = nextId('au$component');
            this.subject = void 0;
            this.composing = false;
            this.dom = dom;
            this.renderable = renderable;
            this.renderingEngine = renderingEngine;
            this.properties = instruction.instructions
                .filter((x) => !bindables.includes(x.to))
                .reduce((acc, item) => {
                if (item.to) {
                    acc[item.to] = item;
                }
                return acc;
            }, {});
            this.task = LifecycleTask.done;
            this.lastSubject = void 0;
            this.view = void 0;
        }
        static register(container) {
            container.register(Registration.transient('custom-element:au-compose', this));
            container.register(Registration.transient(this, this));
        }
        binding(flags) {
            if (this.task.done) {
                this.task = this.compose(this.subject, flags);
            }
            else {
                this.task = new ContinuationTask(this.task, this.compose, this, this.subject, flags);
            }
            if (this.task.done) {
                this.task = this.bindView(flags);
            }
            else {
                this.task = new ContinuationTask(this.task, this.bindView, this, flags);
            }
            return this.task;
        }
        attaching(flags) {
            if (this.task.done) {
                this.attachView(flags);
            }
            else {
                this.task = new ContinuationTask(this.task, this.attachView, this, flags);
            }
        }
        detaching(flags) {
            if (this.view != void 0) {
                if (this.task.done) {
                    this.view.detach(flags);
                }
                else {
                    this.task = new ContinuationTask(this.task, this.view.detach, this.view, flags);
                }
            }
        }
        unbinding(flags) {
            this.lastSubject = void 0;
            if (this.view != void 0) {
                if (this.task.done) {
                    this.task = this.view.unbind(flags);
                }
                else {
                    this.task = new ContinuationTask(this.task, this.view.unbind, this.view, flags);
                }
            }
            return this.task;
        }
        caching(flags) {
            this.view = void 0;
        }
        subjectChanged(newValue, previousValue, flags) {
            flags |= this.$controller.flags;
            if (this.task.done) {
                this.task = this.compose(newValue, flags);
            }
            else {
                this.task = new ContinuationTask(this.task, this.compose, this, newValue, flags);
            }
        }
        compose(subject, flags) {
            if (this.lastSubject === subject) {
                return LifecycleTask.done;
            }
            this.lastSubject = subject;
            this.composing = true;
            let task = this.deactivate(flags);
            if (subject instanceof Promise) {
                let viewPromise;
                if (task.done) {
                    viewPromise = subject.then(s => this.resolveView(s, flags));
                }
                else {
                    viewPromise = task.wait().then(() => subject.then(s => this.resolveView(s, flags)));
                }
                task = new PromiseTask(viewPromise, this.activate, this, flags);
            }
            else {
                const view = this.resolveView(subject, flags);
                if (task.done) {
                    task = this.activate(view, flags);
                }
                else {
                    task = new ContinuationTask(task, this.activate, this, view, flags);
                }
            }
            if (task.done) {
                this.onComposed();
            }
            else {
                task = new ContinuationTask(task, this.onComposed, this);
            }
            return task;
        }
        deactivate(flags) {
            const view = this.view;
            if (view == void 0) {
                return LifecycleTask.done;
            }
            view.detach(flags);
            return view.unbind(flags);
        }
        activate(view, flags) {
            this.view = view;
            if (view == void 0) {
                return LifecycleTask.done;
            }
            let task = this.bindView(flags);
            if (task.done) {
                this.attachView(flags);
            }
            else {
                task = new ContinuationTask(task, this.attachView, this, flags);
            }
            return task;
        }
        bindView(flags) {
            if (this.view != void 0 && (this.$controller.state & (5 /* isBoundOrBinding */)) > 0) {
                return this.view.bind(flags, this.renderable.scope);
            }
            return LifecycleTask.done;
        }
        attachView(flags) {
            if (this.view != void 0 && (this.$controller.state & (40 /* isAttachedOrAttaching */)) > 0) {
                this.view.attach(flags);
            }
        }
        onComposed() {
            this.composing = false;
        }
        resolveView(subject, flags) {
            const view = this.provideViewFor(subject, flags);
            if (view) {
                view.hold(this.$controller.projector.host);
                view.lockScope(this.renderable.scope);
                return view;
            }
            return void 0;
        }
        provideViewFor(subject, flags) {
            if (!subject) {
                return void 0;
            }
            if ('lockScope' in subject) { // IController
                return subject;
            }
            if ('createView' in subject) { // RenderPlan
                return subject.createView(flags, this.renderingEngine, this.renderable.context);
            }
            if ('create' in subject) { // IViewFactory
                return subject.create();
            }
            if ('template' in subject) { // Raw Template Definition
                return this.renderingEngine.getViewFactory(this.dom, subject, this.renderable.context).create();
            }
            // Constructable (Custom Element Constructor)
            return createElement(this.dom, subject, this.properties, this.$controller.projector === void 0
                ? PLATFORM.emptyArray
                : this.$controller.projector.children).createView(flags, this.renderingEngine, this.renderable.context);
        }
    }
    Compose.inject = [IDOM, IController, ITargetedInstruction, IRenderingEngine];
    Compose.kind = CustomElementResource;
    Compose.description = Object.freeze({
        name: 'au-compose',
        template: null,
        cache: 0,
        build: Object.freeze({ compiler: 'default', required: false }),
        bindables: Object.freeze({
            subject: Bindable.for({ bindables: ['subject'] }).get().subject,
            composing: {
                ...Bindable.for({ bindables: ['composing'] }).get().composing,
                mode: BindingMode.fromView,
            },
        }),
        instructions: PLATFORM.emptyArray,
        dependencies: PLATFORM.emptyArray,
        surrogates: PLATFORM.emptyArray,
        containerless: true,
        // tslint:disable-next-line: no-non-null-assertion
        shadowOptions: null,
        hasSlots: false,
        strategy: 1 /* getterSetter */,
        hooks: Object.freeze(new HooksDefinition(Compose.prototype)),
    });

    var NodeType;
    (function (NodeType) {
        NodeType[NodeType["Element"] = 1] = "Element";
        NodeType[NodeType["Attr"] = 2] = "Attr";
        NodeType[NodeType["Text"] = 3] = "Text";
        NodeType[NodeType["CDATASection"] = 4] = "CDATASection";
        NodeType[NodeType["EntityReference"] = 5] = "EntityReference";
        NodeType[NodeType["Entity"] = 6] = "Entity";
        NodeType[NodeType["ProcessingInstruction"] = 7] = "ProcessingInstruction";
        NodeType[NodeType["Comment"] = 8] = "Comment";
        NodeType[NodeType["Document"] = 9] = "Document";
        NodeType[NodeType["DocumentType"] = 10] = "DocumentType";
        NodeType[NodeType["DocumentFragment"] = 11] = "DocumentFragment";
        NodeType[NodeType["Notation"] = 12] = "Notation";
    })(NodeType || (NodeType = {}));
    /**
     * IDOM implementation for Html.
     */
    class HTMLDOM {
        constructor(window, document, TNode, TElement, THTMLElement, TCustomEvent) {
            this.window = window;
            this.document = document;
            this.Node = TNode;
            this.Element = TElement;
            this.HTMLElement = THTMLElement;
            this.CustomEvent = TCustomEvent;
            if (DOM.isInitialized) {
                Reporter.write(1001); // TODO: create reporters code // DOM already initialized (just info)
                DOM.destroy();
            }
            DOM.initialize(this);
        }
        static register(container) {
            return Registration.alias(IDOM, this).register(container);
        }
        addEventListener(eventName, subscriber, publisher, options) {
            (publisher || this.document).addEventListener(eventName, subscriber, options);
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
            if (node.parentNode == null) {
                throw Reporter.error(52);
            }
            const locationEnd = this.document.createComment('au-end');
            const locationStart = this.document.createComment('au-start');
            node.parentNode.replaceChild(locationEnd, node);
            locationEnd.parentNode.insertBefore(locationStart, locationEnd);
            locationEnd.$start = locationStart;
            locationStart.$nodes = null;
            return locationEnd;
        }
        createDocumentFragment(markupOrNode) {
            if (markupOrNode == null) {
                return this.document.createDocumentFragment();
            }
            if (this.isNodeInstance(markupOrNode)) {
                if (markupOrNode.content !== undefined) {
                    return markupOrNode.content;
                }
                const fragment = this.document.createDocumentFragment();
                fragment.appendChild(markupOrNode);
                return fragment;
            }
            return this.createTemplate(markupOrNode).content;
        }
        createElement(name) {
            return this.document.createElement(name);
        }
        fetch(input, init) {
            return this.window.fetch(input, init);
        }
        // tslint:disable-next-line:no-any // this is how the DOM is typed
        createCustomEvent(eventType, options) {
            return new this.CustomEvent(eventType, options);
        }
        dispatchEvent(evt) {
            this.document.dispatchEvent(evt);
        }
        createNodeObserver(node, cb, init) {
            if (typeof MutationObserver === 'undefined') {
                // TODO: find a proper response for this scenario
                return {
                    disconnect() { },
                    observe() { },
                    takeRecords() { return PLATFORM.emptyArray; }
                };
            }
            const observer = new MutationObserver(cb);
            observer.observe(node, init);
            return observer;
        }
        createTemplate(markup) {
            if (markup == null) {
                return this.document.createElement('template');
            }
            const template = this.document.createElement('template');
            template.innerHTML = markup.toString();
            return template;
        }
        createTextNode(text) {
            return this.document.createTextNode(text);
        }
        insertBefore(nodeToInsert, referenceNode) {
            referenceNode.parentNode.insertBefore(nodeToInsert, referenceNode);
        }
        isMarker(node) {
            return node.nodeName === 'AU-M';
        }
        isNodeInstance(potentialNode) {
            return potentialNode != null && potentialNode.nodeType > 0;
        }
        isRenderLocation(node) {
            return node.textContent === 'au-end';
        }
        makeTarget(node) {
            node.className = 'au';
        }
        registerElementResolver(container, resolver) {
            container.registerResolver(INode, resolver);
            container.registerResolver(this.Node, resolver);
            container.registerResolver(this.Element, resolver);
            container.registerResolver(this.HTMLElement, resolver);
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
            (publisher || this.document).removeEventListener(eventName, subscriber, options);
        }
        setAttribute(node, name, value) {
            node.setAttribute(name, value);
        }
    }
    const $DOM = DOM;
    /**
     * A specialized INodeSequence with optimizations for text (interpolation) bindings
     * The contract of this INodeSequence is:
     * - the previous element is an `au-m` node
     * - text is the actual text node
     */
    /** @internal */
    class TextNodeSequence {
        constructor(dom, text) {
            this.isMounted = false;
            this.isLinked = false;
            this.dom = dom;
            this.firstChild = text;
            this.lastChild = text;
            this.childNodes = [text];
            this.targets = [new AuMarker(text)];
            this.next = void 0;
            this.refNode = void 0;
        }
        findTargets() {
            return this.targets;
        }
        insertBefore(refNode) {
            if (this.isLinked && !!this.refNode) {
                this.addToLinked();
            }
            else {
                this.isMounted = true;
                refNode.parentNode.insertBefore(this.firstChild, refNode);
            }
        }
        appendTo(parent) {
            if (this.isLinked && !!this.refNode) {
                this.addToLinked();
            }
            else {
                this.isMounted = true;
                parent.appendChild(this.firstChild);
            }
        }
        remove() {
            this.isMounted = false;
            this.firstChild.remove();
        }
        addToLinked() {
            const refNode = this.refNode;
            this.isMounted = true;
            refNode.parentNode.insertBefore(this.firstChild, refNode);
        }
        unlink() {
            this.isLinked = false;
            this.next = void 0;
            this.refNode = void 0;
        }
        link(next) {
            this.isLinked = true;
            if (this.dom.isRenderLocation(next)) {
                this.refNode = next;
            }
            else {
                this.next = next;
                this.obtainRefNode();
            }
        }
        obtainRefNode() {
            if (this.next !== void 0) {
                this.refNode = this.next.firstChild;
            }
            else {
                this.refNode = void 0;
            }
        }
    }
    // tslint:enable:no-any
    // This is the most common form of INodeSequence.
    // Every custom element or template controller whose node sequence is based on an HTML template
    // has an instance of this under the hood. Anyone who wants to create a node sequence from
    // a string of markup would also receive an instance of this.
    // CompiledTemplates create instances of FragmentNodeSequence.
    /**
     * This is the most common form of INodeSequence.
     * @internal
     */
    class FragmentNodeSequence {
        constructor(dom, fragment) {
            this.isMounted = false;
            this.isLinked = false;
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
            this.next = void 0;
            this.refNode = void 0;
        }
        findTargets() {
            return this.targets;
        }
        insertBefore(refNode) {
            if (this.isLinked && !!this.refNode) {
                this.addToLinked();
            }
            else {
                const parent = refNode.parentNode;
                if (this.isMounted) {
                    let current = this.firstChild;
                    const end = this.lastChild;
                    let next;
                    while (current != null) {
                        next = current.nextSibling;
                        parent.insertBefore(current, refNode);
                        if (current === end) {
                            break;
                        }
                        current = next;
                    }
                }
                else {
                    this.isMounted = true;
                    refNode.parentNode.insertBefore(this.fragment, refNode);
                }
            }
        }
        appendTo(parent) {
            if (this.isMounted) {
                let current = this.firstChild;
                const end = this.lastChild;
                let next;
                while (current != null) {
                    next = current.nextSibling;
                    parent.appendChild(current);
                    if (current === end) {
                        break;
                    }
                    current = next;
                }
            }
            else {
                this.isMounted = true;
                parent.appendChild(this.fragment);
            }
        }
        remove() {
            if (this.isMounted) {
                this.isMounted = false;
                const fragment = this.fragment;
                const end = this.lastChild;
                let next;
                let current = this.firstChild;
                while (current !== null) {
                    next = current.nextSibling;
                    fragment.appendChild(current);
                    if (current === end) {
                        break;
                    }
                    current = next;
                }
            }
        }
        addToLinked() {
            const refNode = this.refNode;
            const parent = refNode.parentNode;
            if (this.isMounted) {
                let current = this.firstChild;
                const end = this.lastChild;
                let next;
                while (current != null) {
                    next = current.nextSibling;
                    parent.insertBefore(current, refNode);
                    if (current === end) {
                        break;
                    }
                    current = next;
                }
            }
            else {
                this.isMounted = true;
                parent.insertBefore(this.fragment, refNode);
            }
        }
        unlink() {
            this.isLinked = false;
            this.next = void 0;
            this.refNode = void 0;
        }
        link(next) {
            this.isLinked = true;
            if (this.dom.isRenderLocation(next)) {
                this.refNode = next;
            }
            else {
                this.next = next;
                this.obtainRefNode();
            }
        }
        obtainRefNode() {
            if (this.next !== void 0) {
                this.refNode = this.next.firstChild;
            }
            else {
                this.refNode = void 0;
            }
        }
    }
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
    class HTMLTemplateFactory {
        constructor(dom) {
            this.dom = dom;
        }
        static register(container) {
            return Registration.singleton(ITemplateFactory, this).register(container);
        }
        create(parentRenderContext, definition) {
            return new CompiledTemplate(this.dom, definition, new NodeSequenceFactory(this.dom, definition.template), parentRenderContext);
        }
    }
    HTMLTemplateFactory.inject = [IDOM];

    const slice$j = Array.prototype.slice;
    let TextBindingRenderer = 
    /** @internal */
    class TextBindingRenderer {
        constructor(parser, observerLocator) {
            this.parser = parser;
            this.observerLocator = observerLocator;
        }
        render(flags, dom, context, renderable, target, instruction) {
            if (Tracer.enabled) {
                Tracer.enter('TextBindingRenderer', 'render', slice$j.call(arguments));
            }
            const next = target.nextSibling;
            if (dom.isMarker(target)) {
                dom.remove(target);
            }
            let binding;
            const expr = ensureExpression(this.parser, instruction.from, 2048 /* Interpolation */);
            if (expr.isMulti) {
                binding = new MultiInterpolationBinding(this.observerLocator, expr, next, 'textContent', BindingMode.toView, context);
            }
            else {
                binding = new InterpolationBinding(expr.firstExpression, expr, next, 'textContent', BindingMode.toView, this.observerLocator, context, true);
            }
            addBinding(renderable, binding);
            if (Tracer.enabled) {
                Tracer.leave();
            }
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
        render(flags, dom, context, renderable, target, instruction) {
            if (Tracer.enabled) {
                Tracer.enter('ListenerBindingRenderer', 'render', slice$j.call(arguments));
            }
            const expr = ensureExpression(this.parser, instruction.from, 80 /* IsEventCommand */ | (instruction.strategy + 6 /* DelegationStrategyDelta */));
            const binding = new Listener(dom, instruction.to, instruction.strategy, expr, target, instruction.preventDefault, this.eventManager, context);
            addBinding(renderable, binding);
            if (Tracer.enabled) {
                Tracer.leave();
            }
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
        render(flags, dom, context, renderable, target, instruction) {
            if (Tracer.enabled) {
                Tracer.enter('SetAttributeRenderer', 'render', slice$j.call(arguments));
            }
            target.setAttribute(instruction.to, instruction.value);
            if (Tracer.enabled) {
                Tracer.leave();
            }
        }
    };
    SetAttributeRenderer = __decorate([
        instructionRenderer("he" /* setAttribute */)
        /** @internal */
    ], SetAttributeRenderer);
    let StylePropertyBindingRenderer = 
    /** @internal */
    class StylePropertyBindingRenderer {
        constructor(parser, observerLocator) {
            this.parser = parser;
            this.observerLocator = observerLocator;
        }
        render(flags, dom, context, renderable, target, instruction) {
            if (Tracer.enabled) {
                Tracer.enter('StylePropertyBindingRenderer', 'render', slice$j.call(arguments));
            }
            const expr = ensureExpression(this.parser, instruction.from, 48 /* IsPropertyCommand */ | BindingMode.toView);
            const binding = new Binding(expr, target.style, instruction.to, BindingMode.toView, this.observerLocator, context);
            addBinding(renderable, binding);
            if (Tracer.enabled) {
                Tracer.leave();
            }
        }
    };
    StylePropertyBindingRenderer.inject = [IExpressionParser, IObserverLocator];
    StylePropertyBindingRenderer = __decorate([
        instructionRenderer("hd" /* stylePropertyBinding */)
        /** @internal */
    ], StylePropertyBindingRenderer);
    let AttributeBindingRenderer = 
    /** @internal */
    class AttributeBindingRenderer {
        constructor(parser, observerLocator) {
            this.parser = parser;
            this.observerLocator = observerLocator;
        }
        render(flags, dom, context, renderable, target, instruction) {
            if (Tracer.enabled) {
                Tracer.enter('StylePropertyBindingRenderer', 'render', slice$j.call(arguments));
            }
            const expr = ensureExpression(this.parser, instruction.from, 48 /* IsPropertyCommand */ | BindingMode.toView);
            const binding = new AttributeBinding(expr, target, instruction.attr /*targetAttribute*/, instruction.to /*targetKey*/, BindingMode.toView, this.observerLocator, context);
            addBinding(renderable, binding);
            if (Tracer.enabled) {
                Tracer.leave();
            }
        }
    };
    // @ts-ignore
    AttributeBindingRenderer.inject = [IExpressionParser, IObserverLocator];
    AttributeBindingRenderer = __decorate([
        instructionRenderer("hc" /* attributeBinding */)
        /** @internal */
    ], AttributeBindingRenderer);

    const slice$k = Array.prototype.slice;
    const defaultShadowOptions$1 = {
        mode: 'open'
    };
    class HTMLProjectorLocator {
        static register(container) {
            return Registration.singleton(IProjectorLocator, this).register(container);
        }
        getElementProjector(dom, $component, host, def) {
            if (def.shadowOptions || def.hasSlots) {
                if (def.containerless) {
                    throw Reporter.error(21);
                }
                return new ShadowDOMProjector(dom, $component, host, def);
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
        constructor(dom, $controller, host, definition) {
            this.dom = dom;
            this.host = host;
            let shadowOptions;
            if (definition.shadowOptions instanceof Object &&
                'mode' in definition.shadowOptions) {
                shadowOptions = definition.shadowOptions;
            }
            else {
                shadowOptions = defaultShadowOptions$1;
            }
            this.shadowRoot = host.attachShadow(shadowOptions);
            this.host.$controller = $controller;
            this.shadowRoot.$controller = $controller;
        }
        get children() {
            return this.shadowRoot.childNodes;
        }
        subscribeToChildrenChange(callback) {
            // TODO: add a way to dispose/disconnect
            this.dom.createNodeObserver(this.shadowRoot, callback, childObserverOptions$1);
        }
        provideEncapsulationSource() {
            return this.shadowRoot;
        }
        project(nodes) {
            if (Tracer.enabled) {
                Tracer.enter('ShadowDOMProjector', 'project', slice$k.call(arguments));
            }
            nodes.appendTo(this.shadowRoot);
            if (Tracer.enabled) {
                Tracer.leave();
            }
        }
        take(nodes) {
            if (Tracer.enabled) {
                Tracer.enter('ShadowDOMProjector', 'take', slice$k.call(arguments));
            }
            nodes.remove();
            nodes.unlink();
            if (Tracer.enabled) {
                Tracer.leave();
            }
        }
    }
    /** @internal */
    class ContainerlessProjector {
        constructor(dom, $controller, host) {
            if (host.childNodes.length) {
                this.childNodes = toArray(host.childNodes);
            }
            else {
                this.childNodes = PLATFORM.emptyArray;
            }
            this.host = dom.convertToRenderLocation(host);
            this.host.$controller = $controller;
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
            if (Tracer.enabled) {
                Tracer.enter('ContainerlessProjector', 'project', slice$k.call(arguments));
            }
            nodes.insertBefore(this.host);
            if (Tracer.enabled) {
                Tracer.leave();
            }
        }
        take(nodes) {
            if (Tracer.enabled) {
                Tracer.enter('ContainerlessProjector', 'take', slice$k.call(arguments));
            }
            nodes.remove();
            nodes.unlink();
            if (Tracer.enabled) {
                Tracer.leave();
            }
        }
    }
    /** @internal */
    class HostProjector {
        constructor($controller, host) {
            this.host = host;
            this.host.$controller = $controller;
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
            if (Tracer.enabled) {
                Tracer.enter('HostProjector', 'project', slice$k.call(arguments));
            }
            nodes.appendTo(this.host);
            if (Tracer.enabled) {
                Tracer.leave();
            }
        }
        take(nodes) {
            if (Tracer.enabled) {
                Tracer.enter('HostProjector', 'take', slice$k.call(arguments));
            }
            nodes.remove();
            nodes.unlink();
            if (Tracer.enabled) {
                Tracer.leave();
            }
        }
    }

    const IProjectorLocatorRegistration = HTMLProjectorLocator;
    const ITargetAccessorLocatorRegistration = TargetAccessorLocator;
    const ITargetObserverLocatorRegistration = TargetObserverLocator;
    const ITemplateFactoryRegistration = HTMLTemplateFactory;
    /**
     * Default HTML-specific (but environment-agnostic) implementations for the following interfaces:
     * - `IProjectorLocator`
     * - `ITargetAccessorLocator`
     * - `ITargetObserverLocator`
     * - `ITemplateFactory`
     */
    const DefaultComponents$2 = [
        IProjectorLocatorRegistration,
        ITargetAccessorLocatorRegistration,
        ITargetObserverLocatorRegistration,
        ITemplateFactoryRegistration
    ];
    const AttrBindingBehaviorRegistration = AttrBindingBehavior;
    const SelfBindingBehaviorRegistration = SelfBindingBehavior;
    const UpdateTriggerBindingBehaviorRegistration = UpdateTriggerBindingBehavior;
    const ComposeRegistration = Compose;
    /**
     * Default HTML-specific (but environment-agnostic) resources:
     * - Binding Behaviors: `attr`, `self`, `updateTrigger`
     * - Custom Elements: `au-compose`
     */
    const DefaultResources$1 = [
        AttrBindingBehaviorRegistration,
        SelfBindingBehaviorRegistration,
        UpdateTriggerBindingBehaviorRegistration,
        ComposeRegistration,
    ];
    const ListenerBindingRendererRegistration = ListenerBindingRenderer;
    const AttributeBindingRendererRegistration = AttributeBindingRenderer;
    const SetAttributeRendererRegistration = SetAttributeRenderer;
    const StylePropertyBindingRendererRegistration = StylePropertyBindingRenderer;
    const TextBindingRendererRegistration = TextBindingRenderer;
    /**
     * Default HTML-specfic (but environment-agnostic) renderers for:
     * - Listener Bindings: `trigger`, `capture`, `delegate`
     * - SetAttribute
     * - StyleProperty: `style`, `css`
     * - TextBinding: `${}`
     */
    const DefaultRenderers$1 = [
        ListenerBindingRendererRegistration,
        AttributeBindingRendererRegistration,
        SetAttributeRendererRegistration,
        StylePropertyBindingRendererRegistration,
        TextBindingRendererRegistration
    ];
    /**
     * A DI configuration object containing html-specific (but environment-agnostic) registrations:
     * - `BasicConfiguration` from `@aurelia/runtime`
     * - `DefaultComponents`
     * - `DefaultResources`
     * - `DefaultRenderers`
     */
    const BasicConfiguration$1 = {
        /**
         * Apply this configuration to the provided container.
         */
        register(container) {
            return RuntimeBasicConfiguration
                .register(container)
                .register(...DefaultComponents$2, ...DefaultResources$1, ...DefaultRenderers$1);
        },
        /**
         * Create a new container with this configuration applied to it.
         */
        createContainer() {
            return this.register(DI.createContainer());
        }
    };



    var index$3 = /*#__PURE__*/Object.freeze({
        Listener: Listener,
        get AttributeBinding () { return AttributeBinding; },
        AttributeNSAccessor: AttributeNSAccessor,
        get CheckedObserver () { return CheckedObserver; },
        ClassAttributeAccessor: ClassAttributeAccessor,
        DataAttributeAccessor: DataAttributeAccessor,
        ElementPropertyAccessor: ElementPropertyAccessor,
        ListenerTracker: ListenerTracker,
        DelegateOrCaptureSubscription: DelegateOrCaptureSubscription,
        TriggerSubscription: TriggerSubscription,
        IEventManager: IEventManager,
        EventSubscriber: EventSubscriber,
        EventManager: EventManager,
        TargetAccessorLocator: TargetAccessorLocator,
        TargetObserverLocator: TargetObserverLocator,
        get SelectValueObserver () { return SelectValueObserver; },
        StyleAttributeAccessor: StyleAttributeAccessor,
        ISVGAnalyzer: ISVGAnalyzer,
        get ValueAttributeObserver () { return ValueAttributeObserver; },
        AttrBindingBehavior: AttrBindingBehavior,
        SelfBindingBehavior: SelfBindingBehavior,
        UpdateTriggerBindingBehavior: UpdateTriggerBindingBehavior,
        Compose: Compose,
        IProjectorLocatorRegistration: IProjectorLocatorRegistration,
        ITargetAccessorLocatorRegistration: ITargetAccessorLocatorRegistration,
        ITargetObserverLocatorRegistration: ITargetObserverLocatorRegistration,
        ITemplateFactoryRegistration: ITemplateFactoryRegistration,
        DefaultComponents: DefaultComponents$2,
        AttrBindingBehaviorRegistration: AttrBindingBehaviorRegistration,
        SelfBindingBehaviorRegistration: SelfBindingBehaviorRegistration,
        UpdateTriggerBindingBehaviorRegistration: UpdateTriggerBindingBehaviorRegistration,
        ComposeRegistration: ComposeRegistration,
        DefaultResources: DefaultResources$1,
        AttributeBindingRendererRegistration: AttributeBindingRendererRegistration,
        ListenerBindingRendererRegistration: ListenerBindingRendererRegistration,
        SetAttributeRendererRegistration: SetAttributeRendererRegistration,
        StylePropertyBindingRendererRegistration: StylePropertyBindingRendererRegistration,
        TextBindingRendererRegistration: TextBindingRendererRegistration,
        DefaultRenderers: DefaultRenderers$1,
        BasicConfiguration: BasicConfiguration$1,
        createElement: createElement,
        RenderPlan: RenderPlan,
        get HTMLTargetedInstructionType () { return HTMLTargetedInstructionType; },
        isHTMLTargetedInstruction: isHTMLTargetedInstruction,
        get NodeType () { return NodeType; },
        HTMLDOM: HTMLDOM,
        DOM: $DOM,
        NodeSequenceFactory: NodeSequenceFactory,
        FragmentNodeSequence: FragmentNodeSequence,
        AttributeBindingInstruction: AttributeBindingInstruction,
        CaptureBindingInstruction: CaptureBindingInstruction,
        DelegateBindingInstruction: DelegateBindingInstruction,
        SetAttributeInstruction: SetAttributeInstruction,
        StylePropertyBindingInstruction: StylePropertyBindingInstruction,
        TextBindingInstruction: TextBindingInstruction,
        TriggerBindingInstruction: TriggerBindingInstruction,
        ContainerlessProjector: ContainerlessProjector,
        HostProjector: HostProjector,
        HTMLProjectorLocator: HTMLProjectorLocator,
        ShadowDOMProjector: ShadowDOMProjector
    });

    /**
     * Trigger binding command. Compile attr with binding symbol with command `trigger` to `TriggerBindingInstruction`
     */
    class TriggerBindingCommand {
        constructor() {
            this.bindingType = 86 /* TriggerCommand */;
        }
        compile(binding) {
            return new TriggerBindingInstruction(binding.expression, getTarget$1(binding, false));
        }
    }
    BindingCommandResource.define('trigger', TriggerBindingCommand);
    /**
     * Delegate binding command. Compile attr with binding symbol with command `delegate` to `DelegateBindingInstruction`
     */
    class DelegateBindingCommand {
        constructor() {
            this.bindingType = 88 /* DelegateCommand */;
        }
        compile(binding) {
            return new DelegateBindingInstruction(binding.expression, getTarget$1(binding, false));
        }
    }
    BindingCommandResource.define('delegate', DelegateBindingCommand);
    /**
     * Capture binding command. Compile attr with binding symbol with command `capture` to `CaptureBindingInstruction`
     */
    class CaptureBindingCommand {
        constructor() {
            this.bindingType = 87 /* CaptureCommand */;
        }
        compile(binding) {
            return new CaptureBindingInstruction(binding.expression, getTarget$1(binding, false));
        }
    }
    BindingCommandResource.define('capture', CaptureBindingCommand);
    /**
     * Attr binding command. Compile attr with binding symbol with command `attr` to `AttributeBindingInstruction`
     */
    class AttrBindingCommand {
        constructor() {
            this.bindingType = 32 /* IsProperty */;
        }
        compile(binding) {
            const target = getTarget$1(binding, false);
            return new AttributeBindingInstruction(target, binding.expression, target);
        }
    }
    BindingCommandResource.define('attr', AttrBindingCommand);
    /**
     * Style binding command. Compile attr with binding symbol with command `style` to `AttributeBindingInstruction`
     */
    class StyleBindingCommand {
        constructor() {
            this.bindingType = 32 /* IsProperty */;
        }
        compile(binding) {
            return new AttributeBindingInstruction('style', binding.expression, getTarget$1(binding, false));
        }
    }
    BindingCommandResource.define('style', StyleBindingCommand);
    /**
     * Class binding command. Compile attr with binding symbol with command `class` to `AttributeBindingInstruction`
     */
    class ClassBindingCommand {
        constructor() {
            this.bindingType = 32 /* IsProperty */;
        }
        compile(binding) {
            return new AttributeBindingInstruction('class', binding.expression, getTarget$1(binding, false));
        }
    }
    BindingCommandResource.define('class', ClassBindingCommand);

    /**
     * Attribute syntax pattern recognizer, helping Aurelia understand template:
     * ```html
     * <div attr.some-attr="someAttrValue"></div>
     * <div some-attr.attr="someAttrValue"></div>
     * ````
     */
    class AttrAttributePattern {
        ['attr.PART'](rawName, rawValue, parts) {
            return new AttrSyntax(rawName, rawValue, parts[1], 'attr');
        }
        ['PART.attr'](rawName, rawValue, parts) {
            return new AttrSyntax(rawName, rawValue, parts[0], 'attr');
        }
    }
    attributePattern({ pattern: 'attr.PART', symbols: '.' }, { pattern: 'PART.attr', symbols: '.' })(AttrAttributePattern);
    /**
     * Style syntax pattern recognizer, helps Aurelia understand template:
     * ```html
     * <div background.style="bg"></div>
     * <div style.background="bg"></div>
     * <div background-color.style="bg"></div>
     * <div style.background-color="bg"></div>
     * <div -webkit-user-select.style="select"></div>
     * <div style.-webkit-user-select="select"></div>
     * <div --custom-prop-css.style="cssProp"></div>
     * <div style.--custom-prop-css="cssProp"></div>
     * ```
     */
    class StyleAttributePattern {
        ['style.PART'](rawName, rawValue, parts) {
            return new AttrSyntax(rawName, rawValue, parts[1], 'style');
        }
        ['PART.style'](rawName, rawValue, parts) {
            return new AttrSyntax(rawName, rawValue, parts[0], 'style');
        }
    }
    attributePattern({ pattern: 'style.PART', symbols: '.' }, { pattern: 'PART.style', symbols: '.' })(StyleAttributePattern);
    /**
     * Class syntax pattern recognizer, helps Aurelia understand template:
     * ```html
     * <div my-class.class="class"></div>
     * <div class.my-class="class"></div>
     * <div ✔.class="checked"></div>
     * <div class.✔="checked"></div>
     * ```
     */
    class ClassAttributePattern {
        ['class.PART'](rawName, rawValue, parts) {
            return new AttrSyntax(rawName, rawValue, parts[1], 'class');
        }
        ['PART.class'](rawName, rawValue, parts) {
            return new AttrSyntax(rawName, rawValue, parts[0], 'class');
        }
    }
    attributePattern({ pattern: 'class.PART', symbols: '.' }, { pattern: 'PART.class', symbols: '.' })(ClassAttributePattern);

    const slice$l = Array.prototype.slice;
    const { enter: enter$2, leave: leave$2 } = Profiler.createTimer('TemplateBinder');
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
    /**
     * TemplateBinder. Todo: describe goal of this class
     */
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
            if (Tracer.enabled) {
                Tracer.enter('TemplateBinder', 'bind', slice$l.call(arguments));
            }
            if (Profiler.enabled) {
                enter$2();
            }
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
                    if (Profiler.enabled) {
                        leave$2();
                    }
                    throw new Error(`Invalid surrogate attribute: ${attrSyntax.target}`);
                    // TODO: use reporter
                }
                const attrInfo = this.resources.getAttributeInfo(attrSyntax);
                if (attrInfo == null) {
                    this.bindPlainAttribute(attrSyntax, attr);
                }
                else if (attrInfo.isTemplateController) {
                    if (Profiler.enabled) {
                        leave$2();
                    }
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
            if (Profiler.enabled) {
                leave$2();
            }
            if (Tracer.enabled) {
                Tracer.leave();
            }
            return manifest;
        }
        bindManifest(parentManifest, node) {
            if (Tracer.enabled) {
                Tracer.enter('TemplateBinder', 'bindManifest', slice$l.call(arguments));
            }
            switch (node.nodeName) {
                case 'LET':
                    // let cannot have children and has some different processing rules, so return early
                    this.bindLetElement(parentManifest, node);
                    if (Tracer.enabled) {
                        Tracer.leave();
                    }
                    return;
                case 'SLOT':
                    this.surrogate.hasSlots = true;
            }
            // nodes are processed bottom-up so we need to store the manifests before traversing down and
            // restore them again afterwards
            const parentManifestRootSave = this.parentManifestRoot;
            const manifestRootSave = this.manifestRoot;
            const manifestSave = this.manifest;
            // get the part name to override the name of the compiled definition
            this.partName = node.getAttribute('part');
            let manifestRoot = (void 0);
            let name = node.getAttribute('as-element');
            if (name == null) {
                name = node.nodeName.toLowerCase();
            }
            const elementInfo = this.resources.getElementInfo(name);
            if (elementInfo == null) {
                // there is no registered custom element with this name
                // @ts-ignore
                this.manifest = new PlainElementSymbol(node);
            }
            else {
                // it's a custom element so we set the manifestRoot as well (for storing replace-parts)
                this.parentManifestRoot = this.manifestRoot;
                // @ts-ignore
                manifestRoot = this.manifestRoot = this.manifest = new CustomElementSymbol(this.dom, node, elementInfo);
            }
            // lifting operations done by template controllers and replace-parts effectively unlink the nodes, so start at the bottom
            this.bindChildNodes(node);
            // the parentManifest will receive either the direct child nodes, or the template controllers / replace-parts
            // wrapping them
            this.bindAttributes(node, parentManifest);
            if (manifestRoot != null && manifestRoot.isContainerless) {
                node.parentNode.replaceChild(manifestRoot.marker, node);
            }
            else if (this.manifest.isTarget) {
                node.classList.add('au');
            }
            // restore the stored manifests so the attributes are processed on the correct lavel
            this.parentManifestRoot = parentManifestRootSave;
            this.manifestRoot = manifestRootSave;
            this.manifest = manifestSave;
            if (Tracer.enabled) {
                Tracer.leave();
            }
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
                const bindingType = command == null ? 2048 /* Interpolation */ : command.bindingType;
                const expr = this.exprParser.parse(attrSyntax.rawValue, bindingType);
                const to = camelCase(attrSyntax.target);
                const info = new BindableInfo(to, BindingMode.toView);
                symbol.bindings.push(new BindingSymbol(command, info, expr, attrSyntax.rawValue, to));
                ++i;
            }
            node.parentNode.replaceChild(symbol.marker, node);
        }
        bindAttributes(node, parentManifest) {
            if (Tracer.enabled) {
                Tracer.enter('TemplateBinder', 'bindAttributes', slice$l.call(arguments));
            }
            const { parentManifestRoot, manifestRoot, manifest } = this;
            // This is the top-level symbol for the current depth.
            // If there are no template controllers or replace-parts, it is always the manifest itself.
            // If there are template controllers, then this will be the outer-most TemplateControllerSymbol.
            let manifestProxy = manifest;
            const replacePart = this.declareReplacePart(node);
            let previousController = (void 0);
            let currentController = (void 0);
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
                if (attrInfo == null) {
                    // it's not a custom attribute but might be a regular bound attribute or interpolation (it might also be nothing)
                    this.bindPlainAttribute(attrSyntax, attr);
                }
                else if (attrInfo.isTemplateController) {
                    // the manifest is wrapped by the inner-most template controller (if there are multiple on the same element)
                    // so keep setting manifest.templateController to the latest template controller we find
                    currentController = manifest.templateController = this.declareTemplateController(attrSyntax, attrInfo);
                    // the proxy and the manifest are only identical when we're at the first template controller (since the controller
                    // is assigned to the proxy), so this evaluates to true at most once per node
                    if (manifestProxy === manifest) {
                        currentController.template = manifest;
                        // @ts-ignore
                        manifestProxy = currentController;
                    }
                    else {
                        currentController.templateController = previousController;
                        currentController.template = previousController.template;
                        // @ts-ignore
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
            if (replacePart == null) {
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
                if (parentManifest.templateController != null) {
                    parentManifest.templateController.parts.push(replacePart);
                }
                processReplacePart(this.dom, replacePart, manifestProxy);
            }
            if (Tracer.enabled) {
                Tracer.leave();
            }
        }
        bindChildNodes(node) {
            if (Tracer.enabled) {
                Tracer.enter('TemplateBinder', 'bindChildNodes', slice$l.call(arguments));
            }
            let childNode;
            if (node.nodeName === 'TEMPLATE') {
                childNode = node.content.firstChild;
            }
            else {
                childNode = node.firstChild;
            }
            let nextChild;
            while (childNode != null) {
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
            if (Tracer.enabled) {
                Tracer.leave();
            }
        }
        bindText(node) {
            if (Tracer.enabled) {
                Tracer.enter('TemplateBinder', 'bindText', slice$l.call(arguments));
            }
            const interpolation = this.exprParser.parse(node.wholeText, 2048 /* Interpolation */);
            if (interpolation != null) {
                const symbol = new TextSymbol(this.dom, node, interpolation);
                this.manifest.childNodes.push(symbol);
                processInterpolationText(symbol);
            }
            while (node.nextSibling != null && node.nextSibling.nodeType === 3 /* Text */) {
                node = node.nextSibling;
            }
            if (Tracer.enabled) {
                Tracer.leave();
            }
            return node;
        }
        declareTemplateController(attrSyntax, attrInfo) {
            if (Tracer.enabled) {
                Tracer.enter('TemplateBinder', 'declareTemplateController', slice$l.call(arguments));
            }
            let symbol;
            // dynamicOptions logic here is similar to (and explained in) bindCustomAttribute
            const command = this.resources.getBindingCommand(attrSyntax);
            if (command == null && attrInfo.hasDynamicOptions) {
                symbol = new TemplateControllerSymbol(this.dom, attrSyntax, attrInfo, this.partName);
                this.partName = null;
                this.bindMultiAttribute(symbol, attrInfo, attrSyntax.rawValue);
            }
            else {
                symbol = new TemplateControllerSymbol(this.dom, attrSyntax, attrInfo, this.partName);
                const bindingType = command == null ? 2048 /* Interpolation */ : command.bindingType;
                const expr = this.exprParser.parse(attrSyntax.rawValue, bindingType);
                symbol.bindings.push(new BindingSymbol(command, attrInfo.bindable, expr, attrSyntax.rawValue, attrSyntax.target));
                this.partName = null;
            }
            if (Tracer.enabled) {
                Tracer.leave();
            }
            return symbol;
        }
        bindCustomAttribute(attrSyntax, attrInfo) {
            if (Tracer.enabled) {
                Tracer.enter('TemplateBinder', 'bindCustomAttribute', slice$l.call(arguments));
            }
            const command = this.resources.getBindingCommand(attrSyntax);
            let symbol;
            if (command == null && attrInfo.hasDynamicOptions) {
                // a dynamicOptions (semicolon separated binding) is only valid without a binding command;
                // the binding commands must be declared in the dynamicOptions expression itself
                symbol = new CustomAttributeSymbol(attrSyntax, attrInfo);
                this.bindMultiAttribute(symbol, attrInfo, attrSyntax.rawValue);
            }
            else {
                // we've either got a command (with or without dynamicOptions, the latter maps to the first bindable),
                // or a null command but without dynamicOptions (which may be an interpolation or a normal string)
                symbol = new CustomAttributeSymbol(attrSyntax, attrInfo);
                const bindingType = command == null ? 2048 /* Interpolation */ : command.bindingType;
                const expr = this.exprParser.parse(attrSyntax.rawValue, bindingType);
                symbol.bindings.push(new BindingSymbol(command, attrInfo.bindable, expr, attrSyntax.rawValue, attrSyntax.target));
            }
            this.manifest.attributes.push(symbol);
            this.manifest.isTarget = true;
            if (Tracer.enabled) {
                Tracer.leave();
            }
        }
        bindMultiAttribute(symbol, attrInfo, value) {
            if (Tracer.enabled) {
                Tracer.enter('TemplateBinder', 'bindMultiAttribute', slice$l.call(arguments));
            }
            const attributes = parseMultiAttributeBinding(value);
            let attr;
            for (let i = 0, ii = attributes.length; i < ii; ++i) {
                attr = attributes[i];
                const attrSyntax = this.attrParser.parse(attr.name, attr.value);
                const command = this.resources.getBindingCommand(attrSyntax);
                const bindingType = command == null ? 2048 /* Interpolation */ : command.bindingType;
                const expr = this.exprParser.parse(attrSyntax.rawValue, bindingType);
                let bindable = attrInfo.bindables[attrSyntax.target];
                if (bindable === undefined) {
                    // everything in a dynamicOptions expression must be used, so if it's not a bindable then we create one on the spot
                    bindable = attrInfo.bindables[attrSyntax.target] = new BindableInfo(attrSyntax.target, BindingMode.toView);
                }
                symbol.bindings.push(new BindingSymbol(command, bindable, expr, attrSyntax.rawValue, attrSyntax.target));
            }
            if (Tracer.enabled) {
                Tracer.leave();
            }
        }
        bindPlainAttribute(attrSyntax, attr) {
            if (Tracer.enabled) {
                Tracer.enter('TemplateBinder', 'bindPlainAttribute', slice$l.call(arguments));
            }
            if (attrSyntax.rawValue.length === 0) {
                if (Tracer.enabled) {
                    Tracer.leave();
                }
                return;
            }
            const command = this.resources.getBindingCommand(attrSyntax);
            const bindingType = command == null ? 2048 /* Interpolation */ : command.bindingType;
            const manifest = this.manifest;
            const expr = this.exprParser.parse(attrSyntax.rawValue, bindingType);
            if (manifest.flags & 16 /* isCustomElement */) {
                const bindable = manifest.bindables[attrSyntax.target];
                if (bindable != null) {
                    // if the attribute name matches a bindable property name, add it regardless of whether it's a command, interpolation, or just a plain string;
                    // the template compiler will translate it to the correct instruction
                    manifest.bindings.push(new BindingSymbol(command, bindable, expr, attrSyntax.rawValue, attrSyntax.target));
                    manifest.isTarget = true;
                }
                else if (expr != null || attrSyntax.target === 'ref') {
                    // if it does not map to a bindable, only add it if we were able to parse an expression (either a command or interpolation)
                    manifest.attributes.push(new PlainAttributeSymbol(attrSyntax, command, expr));
                    manifest.isTarget = true;
                }
            }
            else if (expr != null || attrSyntax.target === 'ref') {
                // either a binding command, an interpolation, or a ref
                manifest.attributes.push(new PlainAttributeSymbol(attrSyntax, command, expr));
                manifest.isTarget = true;
            }
            else if (manifest === this.surrogate) {
                // any attributes, even if they are plain (no command/interpolation etc), should be added if they
                // are on the surrogate element
                manifest.attributes.push(new PlainAttributeSymbol(attrSyntax, command, expr));
            }
            if (command == null && expr != null) {
                // if it's an interpolation, clear the attribute value
                attr.value = '';
            }
            if (Tracer.enabled) {
                Tracer.leave();
            }
        }
        declareReplacePart(node) {
            if (Tracer.enabled) {
                Tracer.enter('TemplateBinder', 'declareReplacePart', slice$l.call(arguments));
            }
            const name = node.getAttribute('replace-part');
            if (name == null) {
                if (Tracer.enabled) {
                    Tracer.leave();
                }
                return null;
            }
            node.removeAttribute('replace-part');
            const symbol = new ReplacePartSymbol(name);
            this.bindChildNodes(node);
            if (Tracer.enabled) {
                Tracer.leave();
            }
            return symbol;
        }
    }
    function processInterpolationText(symbol) {
        const node = symbol.physicalNode;
        const parentNode = node.parentNode;
        while (node.nextSibling != null && node.nextSibling.nodeType === 3 /* Text */) {
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
    /**
     * ParserState. Todo: describe goal of this class
     */
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
    var Char$1;
    (function (Char) {
        Char[Char["DoubleQuote"] = 34] = "DoubleQuote";
        Char[Char["SingleQuote"] = 39] = "SingleQuote";
        Char[Char["Slash"] = 47] = "Slash";
        Char[Char["Semicolon"] = 59] = "Semicolon";
        Char[Char["Colon"] = 58] = "Colon";
    })(Char$1 || (Char$1 = {}));
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
    const { enter: enter$3, leave: leave$3 } = Profiler.createTimer('TemplateElementFactory');
    const markupCache = {};
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
        static register(container) {
            return Registration.singleton(ITemplateElementFactory, this).register(container);
        }
        createTemplate(input) {
            if (Profiler.enabled) {
                enter$3();
            }
            if (typeof input === 'string') {
                let result = markupCache[input];
                if (result === void 0) {
                    const template = this.template;
                    template.innerHTML = input;
                    const node = template.content.firstElementChild;
                    // if the input is either not wrapped in a template or there is more than one node,
                    // return the whole template that wraps it/them (and create a new one for the next input)
                    if (node == null || node.nodeName !== 'TEMPLATE' || node.nextElementSibling != null) {
                        this.template = this.dom.createTemplate();
                        result = template;
                    }
                    else {
                        // the node to return is both a template and the only node, so return just the node
                        // and clean up the template for the next input
                        template.content.removeChild(node);
                        result = node;
                    }
                    markupCache[input] = result;
                }
                if (Profiler.enabled) {
                    leave$3();
                }
                return result.cloneNode(true);
            }
            if (input.nodeName !== 'TEMPLATE') {
                // if we get one node that is not a template, wrap it in one
                const template = this.dom.createTemplate();
                template.content.appendChild(input);
                if (Profiler.enabled) {
                    leave$3();
                }
                return template;
            }
            // we got a template element, remove it from the DOM if it's present there and don't
            // do any other processing
            if (input.parentNode != null) {
                input.parentNode.removeChild(input);
            }
            if (Profiler.enabled) {
                leave$3();
            }
            return input;
        }
    }
    HTMLTemplateElementFactory.inject = [IDOM];

    const buildNotRequired$1 = Object.freeze({
        required: false,
        compiler: 'default'
    });
    const { enter: enter$4, leave: leave$4 } = Profiler.createTimer('TemplateCompiler');
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
            this.parts = null;
        }
        get name() {
            return 'default';
        }
        static register(container) {
            return Registration.singleton(ITemplateCompiler, this).register(container);
        }
        compile(dom, definition, descriptions) {
            if (Profiler.enabled) {
                enter$4();
            }
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
            this.parts = {};
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
            this.parts = null;
            if (Profiler.enabled) {
                leave$4();
            }
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
            this.compileChildNodes(symbol);
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
                name: symbol.partName == null ? symbol.res : symbol.partName,
                template: symbol.physicalNode,
                instructions: controllerInstructions,
                build: buildNotRequired$1
            };
            let parts = void 0;
            if ((symbol.flags & 16384 /* hasParts */) > 0) {
                parts = {};
                for (const part of symbol.parts) {
                    parts[part.name] = this.parts[part.name];
                }
            }
            this.instructionRows.push([new HydrateTemplateController(def, symbol.res, bindings, symbol.res === 'else', parts)]);
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
            if (symbol.command == null) {
                // either an interpolation or a normal string value assigned to an element or attribute binding
                if (symbol.expression == null) {
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
            if (symbol.command == null) {
                if (symbol.expression == null) {
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
                    this.parts[replacePart.name] = parts[replacePart.name] = {
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

    const ITemplateCompilerRegistration = TemplateCompiler;
    const ITemplateElementFactoryRegistration = HTMLTemplateElementFactory;
    /**
     * Default HTML-specific (but environment-agnostic) implementations for the following interfaces:
     * - `ITemplateCompiler`
     * - `ITemplateElementFactory`
     */
    const DefaultComponents$3 = [
        ITemplateCompilerRegistration,
        ITemplateElementFactoryRegistration
    ];
    /**
     * Default HTML-specific (but environment-agnostic) implementations for style binding
     */
    const JitAttrBindingSyntax = [
        StyleAttributePattern,
        ClassAttributePattern,
        AttrAttributePattern
    ];
    const TriggerBindingCommandRegistration = TriggerBindingCommand;
    const DelegateBindingCommandRegistration = DelegateBindingCommand;
    const CaptureBindingCommandRegistration = CaptureBindingCommand;
    const AttrBindingCommandRegistration = AttrBindingCommand;
    const ClassBindingCommandRegistration = ClassBindingCommand;
    const StyleBindingCommandRegistration = StyleBindingCommand;
    /**
     * Default HTML-specific (but environment-agnostic) binding commands:
     * - Event listeners: `.trigger`, `.delegate`, `.capture`
     */
    const DefaultBindingLanguage$1 = [
        TriggerBindingCommandRegistration,
        DelegateBindingCommandRegistration,
        CaptureBindingCommandRegistration,
        ClassBindingCommandRegistration,
        StyleBindingCommandRegistration,
        AttrBindingCommandRegistration
    ];
    /**
     * A DI configuration object containing html-specific (but environment-agnostic) registrations:
     * - `BasicConfiguration` from `@aurelia/runtime-html`
     * - `DefaultComponents` from `@aurelia/jit`
     * - `DefaultBindingSyntax` from `@aurelia/jit`
     * - `DefaultBindingLanguage` from `@aurelia/jit`
     * - `DefaultComponents`
     * - `DefaultBindingLanguage`
     */
    const BasicConfiguration$2 = {
        /**
         * Apply this configuration to the provided container.
         */
        register(container) {
            return BasicConfiguration$1
                .register(container)
                .register(...DefaultComponents$1, ...DefaultBindingSyntax, ...JitAttrBindingSyntax, ...DefaultBindingLanguage, ...DefaultComponents$3, ...DefaultBindingLanguage$1);
        },
        /**
         * Create a new container with this configuration applied to it.
         */
        createContainer() {
            return this.register(DI.createContainer());
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
            case "hd" /* stylePropertyBinding */:
                output += 'stylePropertyBinding\n';
                break;
            case "re" /* setProperty */:
                output += 'setProperty\n';
                break;
            case "he" /* setAttribute */:
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
        AttrBindingCommand: AttrBindingCommand,
        ClassBindingCommand: ClassBindingCommand,
        StyleBindingCommand: StyleBindingCommand,
        ITemplateCompilerRegistration: ITemplateCompilerRegistration,
        ITemplateElementFactoryRegistration: ITemplateElementFactoryRegistration,
        DefaultComponents: DefaultComponents$3,
        TriggerBindingCommandRegistration: TriggerBindingCommandRegistration,
        DelegateBindingCommandRegistration: DelegateBindingCommandRegistration,
        CaptureBindingCommandRegistration: CaptureBindingCommandRegistration,
        AttrBindingCommandRegistration: AttrBindingCommandRegistration,
        ClassBindingCommandRegistration: ClassBindingCommandRegistration,
        StyleBindingCommandRegistration: StyleBindingCommandRegistration,
        DefaultBindingLanguage: DefaultBindingLanguage$1,
        BasicConfiguration: BasicConfiguration$2,
        stringifyDOM: stringifyDOM,
        stringifyInstructions: stringifyInstructions,
        stringifyTemplateDefinition: stringifyTemplateDefinition,
        TemplateBinder: TemplateBinder,
        ITemplateElementFactory: ITemplateElementFactory
    });

    class BrowserDOMInitializer {
        constructor(container) {
            this.container = container;
        }
        static register(container) {
            return Registration.singleton(IDOMInitializer, this).register(container);
        }
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
                    dom = new HTMLDOM(window, config.host.ownerDocument, Node, Element, HTMLElement, CustomEvent);
                }
                else {
                    dom = new HTMLDOM(window, document, Node, Element, HTMLElement, CustomEvent);
                }
            }
            else {
                dom = new HTMLDOM(window, document, Node, Element, HTMLElement, CustomEvent);
            }
            Registration.instance(IDOM, dom).register(this.container);
            return dom;
        }
    }
    BrowserDOMInitializer.inject = [IContainer];
    const IDOMInitializerRegistration = BrowserDOMInitializer;
    /**
     * Default HTML-specific, browser-specific implementations for the following interfaces:
     * - `IDOMInitializer`
     */
    const DefaultComponents$4 = [
        IDOMInitializerRegistration
    ];
    /**
     * A DI configuration object containing html-specific, browser-specific registrations:
     * - `BasicConfiguration` from `@aurelia/runtime-html`
     * - `DefaultComponents`
     */
    const BasicConfiguration$3 = {
        /**
         * Apply this configuration to the provided container.
         */
        register(container) {
            return BasicConfiguration$1
                .register(container)
                .register(...DefaultComponents$4);
        },
        /**
         * Create a new container with this configuration applied to it.
         */
        createContainer() {
            return this.register(DI.createContainer());
        }
    };

    var index$5 = /*#__PURE__*/Object.freeze({
        IDOMInitializerRegistration: IDOMInitializerRegistration,
        DefaultComponents: DefaultComponents$4,
        BasicConfiguration: BasicConfiguration$3
    });

    const { enter: enter$5, leave: leave$5 } = Profiler.createTimer('BasicConfiguration');
    /**
     * A DI configuration object containing html-specific, browser-specific registrations:
     * - `BasicConfiguration` from `@aurelia/runtime-html-browser`
     * - `DefaultComponents` from `@aurelia/jit`
     * - `DefaultBindingSyntax` from `@aurelia/jit`
     * - `DefaultBindingLanguage` from `@aurelia/jit`
     * - `DefaultComponents` from `@aurelia/jit-html`
     * - `DefaultBindingLanguage` from `@aurelia/jit-html`
     */
    const BasicConfiguration$4 = {
        /**
         * Apply this configuration to the provided container.
         */
        register(container) {
            if (Profiler.enabled) {
                enter$5();
            }
            BasicConfiguration$3
                .register(container)
                .register(...DefaultBindingLanguage, ...DefaultBindingSyntax, ...DefaultComponents$1, ...DefaultBindingLanguage$1, ...DefaultComponents$3);
            if (Profiler.enabled) {
                leave$5();
            }
            return container;
        },
        /**
         * Create a new container with this configuration applied to it.
         */
        createContainer() {
            if (Profiler.enabled) {
                enter$5();
            }
            const container = this.register(DI.createContainer());
            if (Profiler.enabled) {
                leave$5();
            }
            return container;
        }
    };

    var index$6 = /*#__PURE__*/Object.freeze({
        BasicConfiguration: BasicConfiguration$4
    });

    exports.jit = index$2;
    exports.jitHtml = index$4;
    exports.jitHtmlBrowser = index$6;
    exports.kernel = index;
    exports.runtime = index$1;
    exports.runtimeHtml = index$3;
    exports.runtimeHtmlBrowser = index$5;

    return exports;

}({}));
//# sourceMappingURL=index.iife.full.js.map
