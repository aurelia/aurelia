define('environment',["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = {
        debug: true,
        testing: true
    };
});



define('main',["require", "exports", "./test-dbmonster/startup"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
});



define('debug/configuration',["require", "exports", "./reporter", "./task-queue", "./binding/unparser"], function (require, exports, reporter_1, task_queue_1, unparser_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.DebugConfiguration = {
        register: function (container) {
            reporter_1.Reporter.write(2);
            task_queue_1.enableImprovedTaskQueueDebugging(container);
            unparser_1.enableImprovedExpressionDebugging();
        }
    };
});



define('debug/reporter',["require", "exports", "../kernel/reporter"], function (require, exports, reporter_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.Reporter = Object.assign(reporter_1.Reporter, {
        write: function (code) {
            var params = [];
            for (var _i = 1; _i < arguments.length; _i++) {
                params[_i - 1] = arguments[_i];
            }
            var info = getMessageInfoForCode(code);
            switch (info.type) {
                case 3:
                    console.debug.apply(console, [info.message].concat(params));
                    break;
                case 2:
                    console.info.apply(console, [info.message].concat(params));
                    break;
                case 1:
                    console.warn.apply(console, [info.message].concat(params));
                    break;
                case 0:
                    throw this.error.apply(this, [code].concat(params));
            }
        },
        error: function (code) {
            var params = [];
            for (var _i = 1; _i < arguments.length; _i++) {
                params[_i - 1] = arguments[_i];
            }
            var info = getMessageInfoForCode(code);
            var error = new Error(info.message);
            error.data = params;
            return error;
        }
    });
    function getMessageInfoForCode(code) {
        return codeLookup[code] || createInvalidCodeMessageInfo(code);
    }
    function createInvalidCodeMessageInfo(code) {
        return {
            type: 0,
            message: "Attempted to report with unknown code " + code + "."
        };
    }
    ;
    var codeLookup = {
        0: {
            type: 1,
            message: 'Cannot add observers to object.'
        },
        1: {
            type: 1,
            message: 'Cannot observe property of object.'
        },
        2: {
            type: 2,
            message: 'Starting application in debug mode.'
        },
        3: {
            type: 0,
            message: 'Runtime expression compilation is only available when including JIT support.'
        },
        4: {
            type: 0,
            message: 'Invalid animation direction.'
        },
        5: {
            type: 0,
            message: 'key/value cannot be null or undefined. Are you trying to inject/register something that doesn\'t exist with DI?'
        },
        6: {
            type: 0,
            message: 'Invalid resolver strategy specified.'
        },
        7: {
            type: 0,
            message: 'Constructor Parameter with index cannot be null or undefined. Are you trying to inject/register something that doesn\'t exist with DI?'
        },
        8: {
            type: 0,
            message: 'Self binding behavior only supports events.'
        },
        9: {
            type: 0,
            message: 'The updateTrigger binding behavior requires at least one event name argument: eg <input value.bind="firstName & updateTrigger:\'blur\'">'
        },
        10: {
            type: 0,
            message: 'The updateTrigger binding behavior can only be applied to two-way/ from-view bindings on input/select elements.'
        },
        11: {
            type: 0,
            message: 'Only property bindings and string interpolation bindings can be signaled. Trigger, delegate and call bindings cannot be signaled.'
        },
        12: {
            type: 0,
            message: 'Signal name is required.'
        },
        13: {
            type: 0,
            message: 'TaskQueue long stack traces are only available in debug mode.'
        },
        14: {
            type: 0,
            message: 'Property cannot be assigned.'
        },
        15: {
            type: 0,
            message: 'Unexpected call context.'
        },
        16: {
            type: 0,
            message: 'Only one child observer per content view is supported for the life of the content view.'
        },
        17: {
            type: 0,
            message: 'You can only define one default implementation for an interface.'
        },
        18: {
            type: 0,
            message: 'You cannot observe a setter only property.'
        },
        19: {
            type: 0,
            message: 'Value for expression is non-repeatable.'
        },
        20: {
            type: 0,
            message: 'No template compiler found with the specified name. JIT support or a custom compiler is required.'
        }
    };
});



define('debug/task-queue',["require", "exports", "../runtime/task-queue"], function (require, exports, task_queue_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    function enableImprovedTaskQueueDebugging(container) {
        container.registerTransformer(task_queue_1.ITaskQueue, function (taskQueue) {
            var stackSeparator = '\nEnqueued in TaskQueue by:\n';
            var microStackSeparator = '\nEnqueued in MicroTaskQueue by:\n';
            var originalOnError = taskQueue.onError.bind(taskQueue);
            return Object.assign(taskQueue, {
                longStacks: true,
                prepareTaskStack: function () {
                    return this.prepareStack(stackSeparator);
                },
                prepareMicroTaskStack: function () {
                    return this.prepareStack(microStackSeparator);
                },
                prepareStack: function (separator) {
                    var stack = separator + filterQueueStack(captureStack());
                    if (typeof this.stack === 'string') {
                        stack = filterFlushStack(stack) + this.stack;
                    }
                    return stack;
                },
                onError: function (error, task) {
                    if (this.longStacks && task.stack && typeof error === 'object' && error !== null) {
                        error.stack = filterFlushStack(error.stack) + task.stack;
                    }
                    originalOnError(error, task);
                }
            });
        });
    }
    exports.enableImprovedTaskQueueDebugging = enableImprovedTaskQueueDebugging;
    function captureStack() {
        var error = new Error();
        if (error.stack) {
            return error.stack;
        }
        try {
            throw error;
        }
        catch (e) {
            return e.stack;
        }
    }
    function filterQueueStack(stack) {
        return stack.replace(/^[\s\S]*?\bqueue(Micro)?Task\b[^\n]*\n/, '');
    }
    function filterFlushStack(stack) {
        var index = stack.lastIndexOf('flushMicroTaskQueue');
        if (index < 0) {
            index = stack.lastIndexOf('flushTaskQueue');
            if (index < 0) {
                return stack;
            }
        }
        index = stack.lastIndexOf('\n', index);
        return index < 0 ? stack : stack.substr(0, index);
    }
});



define('jit/configuration',["require", "exports", "../kernel/di", "./binding/expression-parser", "../runtime/templating/resources/if", "../runtime/templating/resources/else", "../runtime/templating/resources/repeat/repeat", "../runtime/templating/resources/compose", "../runtime/binding/resources/attr-binding-behavior", "../runtime/binding/resources/binding-mode-behaviors", "../runtime/binding/resources/debounce-binding-behavior", "../runtime/templating/resources/replaceable", "../runtime/templating/resources/with", "../runtime/binding/resources/sanitize", "../runtime/binding/resources/self-binding-behavior", "../runtime/binding/resources/signals", "../runtime/binding/resources/throttle-binding-behavior", "../runtime/binding/resources/update-trigger-binding-behavior", "../runtime/templating/template-compiler", "./templating/template-compiler"], function (require, exports, di_1, ExpressionParser, if_1, else_1, repeat_1, compose_1, attr_binding_behavior_1, binding_mode_behaviors_1, debounce_binding_behavior_1, replaceable_1, with_1, sanitize_1, self_binding_behavior_1, signals_1, throttle_binding_behavior_1, update_trigger_binding_behavior_1, template_compiler_1, template_compiler_2) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var globalResources = [
        compose_1.Compose,
        if_1.If,
        else_1.Else,
        repeat_1.Repeat,
        replaceable_1.Replaceable,
        with_1.With,
        sanitize_1.SanitizeValueConverter,
        attr_binding_behavior_1.AttrBindingBehavior,
        debounce_binding_behavior_1.DebounceBindingBehavior,
        binding_mode_behaviors_1.OneTimeBindingBehavior,
        binding_mode_behaviors_1.OneWayBindingBehavior,
        self_binding_behavior_1.SelfBindingBehavior,
        signals_1.SignalBindingBehavior,
        throttle_binding_behavior_1.ThrottleBindingBehavior,
        binding_mode_behaviors_1.TwoWayBindingBehavior,
        update_trigger_binding_behavior_1.UpdateTriggerBindingBehavior
    ];
    exports.BasicConfiguration = {
        register: function (container) {
            container.register.apply(container, [ExpressionParser,
                di_1.Registration.singleton(template_compiler_1.ITemplateCompiler, template_compiler_2.TemplateCompiler)].concat(globalResources));
        }
    };
});



define('kernel/di',["require", "exports", "./platform", "./reporter"], function (require, exports, platform_1, reporter_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var _a;
    if (!('getOwnMetadata' in Reflect)) {
        Reflect.getOwnMetadata = function (key, target) {
            return target[key];
        };
        Reflect.metadata = function (key, value) {
            return function (target) {
                target[key] = value;
            };
        };
    }
    exports.DI = {
        createContainer: function () {
            return new Container();
        },
        getDesignParamTypes: function (target) {
            return Reflect.getOwnMetadata('design:paramtypes', target) || platform_1.PLATFORM.emptyArray;
        },
        getDependencies: function (type) {
            var dependencies;
            if (type.inject === undefined) {
                dependencies = exports.DI.getDesignParamTypes(type);
            }
            else {
                dependencies = [];
                var ctor = type;
                while (typeof ctor === 'function') {
                    if (ctor.hasOwnProperty('inject')) {
                        dependencies.push.apply(dependencies, ctor.inject);
                    }
                    ctor = Object.getPrototypeOf(ctor);
                }
            }
            return dependencies;
        },
        createInterface: function (friendlyName) {
            var Key = function (target, property, index) {
                var inject = target.inject || (target.inject = []);
                Key.friendlyName = friendlyName || 'Interface';
                inject[index] = Key;
                return target;
            };
            Key.noDefault = function () {
                return Key;
            };
            Key.withDefault = function (configure) {
                Key.withDefault = function () {
                    throw reporter_1.Reporter.error(17, Key);
                };
                Key.register = function (container, key) {
                    return configure({
                        instance: function (value) {
                            return container.registerResolver(Key, new Resolver(key || Key, 0, value));
                        },
                        singleton: function (value) {
                            return container.registerResolver(Key, new Resolver(key || Key, 1, value));
                        },
                        transient: function (value) {
                            return container.registerResolver(Key, new Resolver(key || Key, 2, value));
                        },
                        callback: function (value) {
                            return container.registerResolver(Key, new Resolver(key || Key, 3, value));
                        },
                        aliasTo: function (destinationKey) {
                            return container.registerResolver(destinationKey, new Resolver(key || Key, 5, Key));
                        },
                    });
                };
                return Key;
            };
            return Key;
        },
        inject: function () {
            var dependencies = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                dependencies[_i] = arguments[_i];
            }
            return function (target, key, descriptor) {
                if (typeof descriptor === 'number') {
                    if (!target.hasOwnProperty('inject')) {
                        target.inject = exports.DI.getDesignParamTypes(target).slice();
                    }
                    if (dependencies.length === 1) {
                        target.inject[descriptor] = dependencies[0];
                    }
                }
                else if (key) {
                    var actualTarget = target.constructor;
                    var inject_1 = actualTarget.inject || (actualTarget.inject = {});
                    inject_1[key] = dependencies[0];
                }
                else if (descriptor) {
                    var fn = descriptor.value;
                    fn.inject = dependencies;
                }
                else {
                    if (!dependencies || dependencies.length === 0) {
                        target.inject = exports.DI.getDesignParamTypes(target).slice();
                    }
                    else {
                        target.inject = dependencies;
                    }
                }
            };
        }
    };
    exports.IContainer = exports.DI.createInterface().noDefault();
    exports.IServiceLocator = exports.IContainer;
    function createResolver(getter) {
        return function (key) {
            var Key = function Key(target, property, descriptor) {
                return exports.DI.inject(Key)(target, property, descriptor);
            };
            Key.resolve = function (handler, requestor) {
                return getter(key, handler, requestor);
            };
            return Key;
        };
    }
    exports.inject = exports.DI.inject;
    exports.all = createResolver(function (key, handler, requestor) { return requestor.getAll(key); });
    exports.lazy = createResolver(function (key, handler, requestor) {
        var instance = null;
        return function () {
            if (instance === null) {
                instance = requestor.get(key);
            }
            return instance;
        };
    });
    exports.optional = createResolver(function (key, handler, requestor) {
        if (requestor.has(key, true)) {
            return requestor.get(key);
        }
        else {
            return null;
        }
    });
    var Resolver = (function () {
        function Resolver(key, strategy, state) {
            this.key = key;
            this.strategy = strategy;
            this.state = state;
        }
        Resolver.prototype.register = function (container, key) {
            return container.registerResolver(key || this.key, this);
        };
        Resolver.prototype.resolve = function (handler, requestor) {
            switch (this.strategy) {
                case 0:
                    return this.state;
                case 1:
                    this.strategy = 0;
                    return this.state = handler.getFactory(this.state).construct(handler);
                case 2:
                    return handler.getFactory(this.state).construct(requestor);
                case 3:
                    return this.state(handler, requestor, this);
                case 4:
                    return this.state[0].get(handler, requestor);
                case 5:
                    return handler.get(this.state);
                default:
                    throw reporter_1.Reporter.error(6, this.strategy);
            }
        };
        Resolver.prototype.getFactory = function (container) {
            switch (this.strategy) {
                case 1:
                case 2:
                    return container.getFactory(this.state);
                default:
                    return null;
            }
        };
        return Resolver;
    }());
    var Factory = (function () {
        function Factory(type, invoker, dependencies) {
            this.type = type;
            this.invoker = invoker;
            this.dependencies = dependencies;
            this.transformers = null;
        }
        Factory.prototype.construct = function (container, dynamicDependencies) {
            var transformers = this.transformers;
            var instance = dynamicDependencies !== undefined
                ? this.invoker.invokeWithDynamicDependencies(container, this.type, this.dependencies, dynamicDependencies)
                : this.invoker.invoke(container, this.type, this.dependencies);
            if (transformers === null) {
                return instance;
            }
            for (var i = 0, ii = transformers.length; i < ii; ++i) {
                instance = transformers[i](instance);
            }
            return instance;
        };
        Factory.prototype.registerTransformer = function (transformer) {
            if (this.transformers === null) {
                this.transformers = [];
            }
            this.transformers.push(transformer);
            return true;
        };
        Factory.create = function (type) {
            var dependencies = exports.DI.getDependencies(type);
            var invoker = classInvokers[dependencies.length] || classInvokers.fallback;
            return new Factory(type, invoker, dependencies);
        };
        return Factory;
    }());
    var containerResolver = {
        resolve: function (handler, requestor) {
            return requestor;
        }
    };
    function isRegistry(obj) {
        return typeof obj.register === 'function';
    }
    var Container = (function () {
        function Container(configuration) {
            if (configuration === void 0) { configuration = {}; }
            this.parent = null;
            this.resolvers = new Map();
            this.configuration = configuration;
            this.factories = configuration.factories || (configuration.factories = new Map());
            this.resolvers.set(exports.IContainer, containerResolver);
        }
        Container.prototype.register = function () {
            var _this = this;
            var params = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                params[_i] = arguments[_i];
            }
            var resolvers = this.resolvers;
            var _loop_1 = function (i, ii) {
                var current = params[i];
                if (isRegistry(current)) {
                    current.register(this_1);
                }
                else {
                    Object.keys(current).forEach(function (key) {
                        var value = current[key];
                        if (value.register) {
                            value.register(_this);
                        }
                    });
                }
            };
            var this_1 = this;
            for (var i = 0, ii = params.length; i < ii; ++i) {
                _loop_1(i, ii);
            }
        };
        Container.prototype.registerResolver = function (key, resolver) {
            validateKey(key);
            var resolvers = this.resolvers;
            var result = resolvers.get(key);
            if (result === undefined) {
                resolvers.set(key, resolver);
            }
            else if (resolver instanceof Resolver && resolver.strategy === 4) {
                result.state.push(resolver);
            }
            else {
                resolvers.set(key, new Resolver(key, 4, [result, resolver]));
            }
            return resolver;
        };
        Container.prototype.registerTransformer = function (key, transformer) {
            var resolver = this.getResolver(key);
            if (resolver === null) {
                return false;
            }
            if (resolver.getFactory) {
                var handler = resolver.getFactory(this);
                if (handler === null) {
                    return false;
                }
                return handler.registerTransformer(transformer);
            }
            return false;
        };
        Container.prototype.getResolver = function (key, autoRegister) {
            if (autoRegister === void 0) { autoRegister = true; }
            validateKey(key);
            if (key.resolve) {
                return key;
            }
            var current = this;
            while (current !== null) {
                var resolver = current.resolvers.get(key);
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
        };
        Container.prototype.has = function (key, searchAncestors) {
            if (searchAncestors === void 0) { searchAncestors = false; }
            return this.resolvers.has(key)
                ? true
                : searchAncestors && this.parent !== null
                    ? this.parent.has(key, true)
                    : false;
        };
        Container.prototype.get = function (key) {
            validateKey(key);
            if (key.resolve) {
                return key.resolve(this, this);
            }
            var current = this;
            while (current !== null) {
                var resolver = current.resolvers.get(key);
                if (resolver === undefined) {
                    if (current.parent === null) {
                        return this.jitRegister(key, current).resolve(current, this);
                    }
                    current = current.parent;
                }
                else {
                    return resolver.resolve(current, this);
                }
            }
        };
        Container.prototype.getAll = function (key) {
            validateKey(key);
            var current = this;
            while (current !== null) {
                var resolver = current.resolvers.get(key);
                if (resolver === undefined) {
                    if (this.parent === null) {
                        return platform_1.PLATFORM.emptyArray;
                    }
                    current = current.parent;
                }
                else {
                    return buildAllResponse(resolver, current, this);
                }
            }
        };
        Container.prototype.jitRegister = function (keyAsValue, handler) {
            if (keyAsValue.register) {
                return keyAsValue.register(handler, keyAsValue);
            }
            var resolver = new Resolver(keyAsValue, 1, keyAsValue);
            handler.resolvers.set(keyAsValue, resolver);
            return resolver;
        };
        Container.prototype.getFactory = function (type) {
            var factory = this.factories.get(type);
            if (factory === undefined) {
                factory = Factory.create(type);
                this.factories.set(type, factory);
            }
            return factory;
        };
        Container.prototype.createChild = function () {
            var child = new Container(this.configuration);
            child.parent = this;
            return child;
        };
        return Container;
    }());
    exports.Registration = {
        instance: function (key, value) {
            return new Resolver(key, 0, value);
        },
        singleton: function (key, value) {
            return new Resolver(key, 1, value);
        },
        transient: function (key, value) {
            return new Resolver(key, 2, value);
        },
        callback: function (key, callback) {
            return new Resolver(key, 3, callback);
        },
        alias: function (originalKey, aliasKey) {
            return new Resolver(aliasKey, 5, originalKey);
        },
        interpret: function (interpreterKey) {
            var rest = [];
            for (var _i = 1; _i < arguments.length; _i++) {
                rest[_i - 1] = arguments[_i];
            }
            return {
                register: function (container) {
                    var registry;
                    var resolver = container.getResolver(interpreterKey);
                    if (resolver.getFactory) {
                        registry = resolver.getFactory(container).construct(container, rest);
                    }
                    else {
                        registry = resolver.resolve(container, container);
                    }
                    registry.register(container);
                }
            };
        }
    };
    function validateKey(key) {
        if (key === null || key === undefined) {
            throw reporter_1.Reporter.error(5);
        }
    }
    function buildAllResponse(resolver, handler, requestor) {
        if (resolver instanceof Resolver && resolver.strategy === 4) {
            var state = resolver.state;
            var i = state.length;
            var results = new Array(i);
            while (i--) {
                results[i] = state[i].get(handler, requestor);
            }
            return results;
        }
        return [resolver.resolve(handler, requestor)];
    }
    var classInvokers = (_a = {},
        _a[0] = {
            invoke: function (container, Type) {
                return new Type();
            },
            invokeWithDynamicDependencies: invokeWithDynamicDependencies
        },
        _a[1] = {
            invoke: function (container, Type, deps) {
                return new Type(container.get(deps[0]));
            },
            invokeWithDynamicDependencies: invokeWithDynamicDependencies
        },
        _a[2] = {
            invoke: function (container, Type, deps) {
                return new Type(container.get(deps[0]), container.get(deps[1]));
            },
            invokeWithDynamicDependencies: invokeWithDynamicDependencies
        },
        _a[3] = {
            invoke: function (container, Type, deps) {
                return new Type(container.get(deps[0]), container.get(deps[1]), container.get(deps[2]));
            },
            invokeWithDynamicDependencies: invokeWithDynamicDependencies
        },
        _a[4] = {
            invoke: function (container, Type, deps) {
                return new Type(container.get(deps[0]), container.get(deps[1]), container.get(deps[2]), container.get(deps[3]));
            },
            invokeWithDynamicDependencies: invokeWithDynamicDependencies
        },
        _a[5] = {
            invoke: function (container, Type, deps) {
                return new Type(container.get(deps[0]), container.get(deps[1]), container.get(deps[2]), container.get(deps[3]), container.get(deps[4]));
            },
            invokeWithDynamicDependencies: invokeWithDynamicDependencies
        },
        _a.fallback = {
            invoke: invokeWithDynamicDependencies,
            invokeWithDynamicDependencies: invokeWithDynamicDependencies
        },
        _a);
    function invokeWithDynamicDependencies(container, fn, staticDependencies, dynamicDependencies) {
        var i = staticDependencies.length;
        var args = new Array(i);
        var lookup;
        while (i--) {
            lookup = staticDependencies[i];
            if (lookup === null || lookup === undefined) {
                throw reporter_1.Reporter.error(7, "Index " + i + ".");
            }
            else {
                args[i] = container.get(lookup);
            }
        }
        if (dynamicDependencies !== undefined) {
            args = args.concat(dynamicDependencies);
        }
        return Reflect.construct(fn, args);
    }
});



define('kernel/interfaces',["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
});



define('kernel/platform',["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.PLATFORM = {
        global: (function () {
            if (typeof self !== 'undefined') {
                return self;
            }
            if (typeof global !== 'undefined') {
                return global;
            }
            return new Function('return this')();
        })(),
        emptyArray: Object.freeze([]),
        emptyObject: Object.freeze({}),
        noop: function () { },
        now: function () {
            return performance.now();
        },
        requestAnimationFrame: function (callback) {
            return requestAnimationFrame(callback);
        },
        createTaskFlushRequester: function (onFlush) {
            return function requestFlush() {
                var timeoutHandle = setTimeout(handleFlushTimer, 0);
                var intervalHandle = setInterval(handleFlushTimer, 50);
                function handleFlushTimer() {
                    clearTimeout(timeoutHandle);
                    clearInterval(intervalHandle);
                    onFlush();
                }
            };
        },
        createMicroTaskFlushRequestor: function (onFlush) {
            var observer = new MutationObserver(onFlush);
            var node = document.createTextNode('');
            var values = Object.create(null);
            var val = 'a';
            values.a = 'b';
            values.b = 'a';
            observer.observe(node, { characterData: true });
            return function requestFlush() {
                node.data = val = values[val];
            };
        }
    };
});



define('kernel/reporter',["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.Reporter = {
        write: function (code) {
            var params = [];
            for (var _i = 1; _i < arguments.length; _i++) {
                params[_i - 1] = arguments[_i];
            }
        },
        error: function (code) {
            var params = [];
            for (var _i = 1; _i < arguments.length; _i++) {
                params[_i - 1] = arguments[_i];
            }
            return new Error("Code " + code);
        }
    };
});



define('runtime/aurelia',["require", "exports", "../kernel/platform", "../kernel/di", "./templating/rendering-engine"], function (require, exports, platform_1, di_1, rendering_engine_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var Aurelia = (function () {
        function Aurelia(container) {
            if (container === void 0) { container = di_1.DI.createContainer(); }
            this.container = container;
            this.components = [];
            this.startTasks = [];
            this.stopTasks = [];
            this.isStarted = false;
        }
        Aurelia.prototype.register = function () {
            var _a;
            var params = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                params[_i] = arguments[_i];
            }
            (_a = this.container).register.apply(_a, params);
            return this;
        };
        Aurelia.prototype.app = function (config) {
            var _this = this;
            var component = config.component;
            var startTask = function () {
                if (!_this.components.includes(component)) {
                    _this.components.push(component);
                    component.$hydrate(_this.container.get(rendering_engine_1.IRenderingEngine), config.host);
                }
                component.$bind();
                component.$attach(config.host);
            };
            this.startTasks.push(startTask);
            this.stopTasks.push(function () {
                component.$detach();
                component.$unbind();
            });
            if (this.isStarted) {
                startTask();
            }
            return this;
        };
        Aurelia.prototype.start = function () {
            this.isStarted = true;
            this.startTasks.forEach(function (x) { return x(); });
            return this;
        };
        Aurelia.prototype.stop = function () {
            this.isStarted = false;
            this.stopTasks.forEach(function (x) { return x(); });
            return this;
        };
        return Aurelia;
    }());
    exports.Aurelia = Aurelia;
    platform_1.PLATFORM.global.Aurelia = Aurelia;
});



define('runtime/dom',["require", "exports", "../kernel/di"], function (require, exports, di_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.INode = di_1.DI.createInterface();
    var platformSupportsShadowDOM = function () {
        var available = !!HTMLElement.prototype.attachShadow;
        platformSupportsShadowDOM = function () { return available; };
        return available;
    };
    exports.DOM = {
        createFactoryFromMarkup: function (markup) {
            var template = document.createElement('template');
            template.innerHTML = markup;
            return function () { return new TemplateView(template); };
        },
        createElement: function (name) {
            return document.createElement(name);
        },
        createAnchor: function () {
            return document.createComment('anchor');
        },
        createChildObserver: function (parent, onChildrenChanged, options) {
            if (exports.DOM.isUsingSlotEmulation(parent)) {
                return exports.DOM.getCustomElementForNode(parent).$contentView.attachChildObserver(onChildrenChanged);
            }
            else {
                var observer = new MutationObserver(onChildrenChanged);
                observer.childNodes = parent.childNodes;
                observer.observe(parent, options || { childList: true });
                return observer;
            }
        },
        createElementViewHost: function (node, options) {
            if (options && platformSupportsShadowDOM()) {
                return node.attachShadow(options);
            }
            node.$usingSlotEmulation = true;
            return node;
        },
        cloneNode: function (node, deep) {
            if (deep === void 0) { deep = true; }
            return node.cloneNode(deep);
        },
        getCustomElementForNode: function (node) {
            return node.$component || null;
        },
        isUsingSlotEmulation: function (node) {
            return !!node.$usingSlotEmulation;
        },
        isNodeInstance: function (potentialNode) {
            return potentialNode instanceof Node;
        },
        isElementNodeType: function (node) {
            return node.nodeType === 1;
        },
        isTextNodeType: function (node) {
            return node.nodeType === 3;
        },
        normalizedTagName: function (node) {
            var name = node.tagName;
            return name ? name.toLowerCase() : null;
        },
        remove: function (node) {
            if (node.remove) {
                node.remove();
            }
            else if (node.parentNode) {
                node.parentNode.removeChild(node);
            }
        },
        replaceNode: function (newChild, oldChild) {
            if (oldChild.parentNode) {
                oldChild.parentNode.replaceChild(newChild, oldChild);
            }
        },
        appendChild: function (parent, child) {
            parent.appendChild(child);
        },
        insertBefore: function (nodeToInsert, referenceNode) {
            referenceNode.parentNode.insertBefore(nodeToInsert, referenceNode);
        },
        getAttribute: function (node, name) {
            return node.getAttribute(name);
        },
        setAttribute: function (node, name, value) {
            node.setAttribute(name, value);
        },
        removeAttribute: function (node, name) {
            node.removeAttribute(name);
        },
        hasClass: function (node, className) {
            return node.classList.contains(className);
        },
        addClass: function (node, className) {
            node.classList.add(className);
        },
        removeClass: function (node, className) {
            node.classList.remove(className);
        },
        addEventListener: function (eventName, subscriber, publisher, options) {
            publisher = publisher || document;
            publisher.addEventListener(eventName, subscriber, options);
        },
        removeEventListener: function (eventName, subscriber, publisher, options) {
            publisher = publisher || document;
            publisher.removeEventListener(eventName, subscriber, options);
        },
        isAllWhitespace: function (node) {
            return !(node.auInterpolationTarget || (/[^\t\n\r ]/.test(node.textContent)));
        },
        treatAsNonWhitespace: function (node) {
            node.auInterpolationTarget = true;
        },
        convertToAnchor: function (node, proxy) {
            if (proxy === void 0) { proxy = false; }
            var anchor = exports.DOM.createAnchor();
            if (proxy) {
                anchor.$proxyTarget = node;
                anchor.hasAttribute = hasAttribute;
                anchor.getAttribute = getAttribute;
                anchor.setAttribute = setAttribute;
            }
            exports.DOM.replaceNode(anchor, node);
            return anchor;
        },
        registerElementResolver: function (container, resolver) {
            container.registerResolver(exports.INode, resolver);
            container.registerResolver(Element, resolver);
            container.registerResolver(HTMLElement, resolver);
            container.registerResolver(SVGElement, resolver);
        }
    };
    function hasAttribute(name) {
        return this.$proxyTarget.hasAttribute(name);
    }
    function getAttribute(name) {
        return this.$proxyTarget.getAttribute(name);
    }
    function setAttribute(name, value) {
        this.$proxyTarget.setAttribute(name, value);
    }
    var TemplateView = (function () {
        function TemplateView(template) {
            var container = this.fragment = template.content.cloneNode(true);
            this.firstChild = container.firstChild;
            this.lastChild = container.lastChild;
            this.childNodes = Array.from(container.childNodes);
        }
        TemplateView.prototype.appendChild = function (node) {
            exports.DOM.appendChild(this.fragment, node);
        };
        TemplateView.prototype.findTargets = function () {
            return this.fragment.querySelectorAll('.au');
        };
        TemplateView.prototype.insertBefore = function (refNode) {
            exports.DOM.insertBefore(this.fragment, refNode);
        };
        TemplateView.prototype.appendTo = function (parent) {
            exports.DOM.appendChild(parent, this.fragment);
        };
        TemplateView.prototype.remove = function () {
            var fragment = this.fragment;
            var current = this.firstChild;
            var end = this.lastChild;
            var append = exports.DOM.appendChild;
            var next;
            while (current) {
                next = current.nextSibling;
                append(fragment, current);
                if (current === end) {
                    break;
                }
                current = next;
            }
        };
        return TemplateView;
    }());
});



define('runtime/resource',["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
});



define('runtime/task-queue',["require", "exports", "../kernel/di", "../kernel/reporter", "../kernel/platform"], function (require, exports, di_1, reporter_1, platform_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ITaskQueue = di_1.DI.createInterface()
        .withDefault(function (x) { return x.singleton(TaskQueue); });
    var TaskQueue = (function () {
        function TaskQueue() {
            var _this = this;
            this.microTaskQueue = [];
            this.taskQueue = [];
            this.microTaskQueueCapacity = 1024;
            this.requestFlushMicroTaskQueue = platform_1.PLATFORM.createMicroTaskFlushRequestor(function () { return _this.flushMicroTaskQueue(); });
            this.requestFlushTaskQueue = platform_1.PLATFORM.createTaskFlushRequester(function () { return _this.flushTaskQueue(); });
            this.flushing = false;
            this.longStacks = false;
        }
        TaskQueue.prototype.flushQueue = function (queue, capacity) {
            var index = 0;
            var task;
            try {
                this.flushing = true;
                while (index < queue.length) {
                    task = queue[index];
                    if (this.longStacks) {
                        this.stack = typeof task.stack === 'string' ? task.stack : undefined;
                    }
                    task.call();
                    index++;
                    if (index > capacity) {
                        for (var scan = 0, newLength = queue.length - index; scan < newLength; scan++) {
                            queue[scan] = queue[scan + index];
                        }
                        queue.length -= index;
                        index = 0;
                    }
                }
            }
            catch (error) {
                this.onError(error, task);
            }
            finally {
                this.flushing = false;
            }
        };
        TaskQueue.prototype.queueMicroTask = function (task) {
            if (this.microTaskQueue.length < 1) {
                this.requestFlushMicroTaskQueue();
            }
            if (this.longStacks) {
                task.stack = this.prepareMicroTaskStack();
            }
            this.microTaskQueue.push(task);
        };
        TaskQueue.prototype.flushMicroTaskQueue = function () {
            var queue = this.microTaskQueue;
            this.flushQueue(queue, this.microTaskQueueCapacity);
            queue.length = 0;
        };
        TaskQueue.prototype.queueTask = function (task) {
            if (this.taskQueue.length < 1) {
                this.requestFlushTaskQueue();
            }
            if (this.longStacks) {
                task.stack = this.prepareTaskStack();
            }
            this.taskQueue.push(task);
        };
        TaskQueue.prototype.flushTaskQueue = function () {
            var queue = this.taskQueue;
            this.taskQueue = [];
            this.flushQueue(queue, Number.MAX_VALUE);
        };
        TaskQueue.prototype.prepareTaskStack = function () {
            throw reporter_1.Reporter.error(13);
        };
        TaskQueue.prototype.prepareMicroTaskStack = function () {
            throw reporter_1.Reporter.error(13);
        };
        TaskQueue.prototype.onError = function (error, task) {
            if ('onError' in task) {
                task.onError(error);
            }
            else {
                setTimeout(function () { throw error; }, 0);
            }
        };
        return TaskQueue;
    }());
});



define('test-aot/app-config',["require", "exports", "../runtime/templating/instructions", "./name-tag", "../runtime/binding/event-manager"], function (require, exports, instructions_1, import1, event_manager_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.appConfig = {
        name: 'app',
        dependencies: [
            import1
        ],
        template: "\n    <au-marker class=\"au\"></au-marker> <br/>\n    <au-marker class=\"au\"></au-marker> <br/>\n    <input type=\"text\" class=\"au\">\n    <name-tag class=\"au\">\n      <h2>Message: <au-marker class=\"au\"></au-marker> </h2>\n    </name-tag>\n    <input type=\"checkbox\" class=\"au\" />\n    <au-marker class=\"au\"></au-marker>\n    <au-marker class=\"au\"></au-marker>\n    <au-marker class=\"au\"></au-marker>\n    <button class=\"au\">Add Todo</button>\n  ",
        instructions: [
            [
                {
                    type: instructions_1.TargetedInstructionType.textBinding,
                    src: 'message'
                }
            ],
            [
                {
                    type: instructions_1.TargetedInstructionType.textBinding,
                    src: 'computedMessage'
                }
            ],
            [
                {
                    type: instructions_1.TargetedInstructionType.twoWayBinding,
                    src: 'message',
                    dest: 'value'
                }
            ],
            [
                {
                    type: instructions_1.TargetedInstructionType.hydrateElement,
                    res: 'name-tag',
                    instructions: [
                        {
                            type: instructions_1.TargetedInstructionType.twoWayBinding,
                            src: 'message',
                            dest: 'name'
                        },
                        {
                            type: instructions_1.TargetedInstructionType.refBinding,
                            src: 'nameTag'
                        }
                    ]
                }
            ],
            [
                {
                    type: instructions_1.TargetedInstructionType.textBinding,
                    src: 'message'
                }
            ],
            [
                {
                    type: instructions_1.TargetedInstructionType.twoWayBinding,
                    src: 'duplicateMessage',
                    dest: 'checked'
                }
            ],
            [
                {
                    type: instructions_1.TargetedInstructionType.hydrateTemplateController,
                    res: 'if',
                    src: {
                        template: "<div><au-marker class=\"au\"></au-marker> </div>",
                        instructions: [
                            [
                                {
                                    type: instructions_1.TargetedInstructionType.textBinding,
                                    src: 'message'
                                }
                            ]
                        ]
                    },
                    instructions: [
                        {
                            type: instructions_1.TargetedInstructionType.oneWayBinding,
                            src: 'duplicateMessage',
                            dest: 'condition'
                        }
                    ]
                }
            ],
            [
                {
                    type: instructions_1.TargetedInstructionType.hydrateTemplateController,
                    res: 'else',
                    src: {
                        template: "<div>No Message Duplicated</div>",
                        instructions: []
                    },
                    link: true,
                    instructions: []
                }
            ],
            [
                {
                    type: instructions_1.TargetedInstructionType.hydrateTemplateController,
                    res: 'repeat',
                    src: {
                        template: "<div><au-marker class=\"au\"></au-marker> </div>",
                        instructions: [
                            [
                                {
                                    type: instructions_1.TargetedInstructionType.textBinding,
                                    src: 'description'
                                }
                            ]
                        ]
                    },
                    instructions: [
                        {
                            type: instructions_1.TargetedInstructionType.oneWayBinding,
                            src: 'todos',
                            dest: 'items'
                        },
                        {
                            type: instructions_1.TargetedInstructionType.setProperty,
                            value: 'todo',
                            dest: 'local'
                        }
                    ]
                }
            ],
            [
                {
                    type: instructions_1.TargetedInstructionType.listenerBinding,
                    src: 'click',
                    dest: 'addTodo',
                    preventDefault: true,
                    strategy: event_manager_1.DelegationStrategy.none
                }
            ]
        ],
        surrogates: []
    };
});



var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
define('test-aot/app',["require", "exports", "./app-config", "../runtime/templating/custom-element"], function (require, exports, app_config_1, custom_element_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var Todo = (function () {
        function Todo(description) {
            this.description = description;
            this.done = false;
        }
        return Todo;
    }());
    var App = (function () {
        function App() {
            this.message = 'Hello World';
            this.duplicateMessage = true;
            this.todos = [];
        }
        Object.defineProperty(App.prototype, "computedMessage", {
            get: function () {
                var value = "\n      " + this.message + " Computed:\n      Todo Count " + this.todos.length + "\n      Descriptions:\n      " + this.todos.map(function (x) { return x.description; }).join('\n') + "\n    ";
                return value;
            },
            enumerable: true,
            configurable: true
        });
        App.prototype.addTodo = function () {
            this.todos.push(new Todo(this.message));
        };
        App.prototype.bound = function () {
            console.log('app bound');
        };
        App.prototype.attaching = function () {
            console.log('app attaching');
        };
        App.prototype.attached = function () {
            console.log('app attached');
        };
        App.prototype.detaching = function () {
            console.log('app detaching');
        };
        App.prototype.detached = function () {
            console.log('app detached');
        };
        App.prototype.unbound = function () {
            console.log('app unbound');
        };
        App = __decorate([
            custom_element_1.customElement(app_config_1.appConfig)
        ], App);
        return App;
    }());
    exports.App = App;
});



define('test-aot/generated-configuration',["require", "exports", "../runtime/binding/ast", "../runtime/binding/expression-parser", "../runtime/templating/resources/repeat/repeat", "../runtime/templating/resources/if", "../runtime/templating/resources/else"], function (require, exports, ast_1, expression_parser_1, repeat_1, if_1, else_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var emptyArray = [];
    var expressionCache = {
        message: new ast_1.AccessScope('message'),
        textContent: new ast_1.AccessScope('textContent'),
        value: new ast_1.AccessScope('value'),
        nameTagBorderWidth: new ast_1.AccessScope('borderWidth'),
        nameTagBorderColor: new ast_1.AccessScope('borderColor'),
        nameTagBorder: new ast_1.HtmlLiteral([
            new ast_1.AccessScope('borderWidth'),
            new ast_1.PrimitiveLiteral('px solid '),
            new ast_1.AccessScope('borderColor')
        ]),
        nameTagHeaderVisible: new ast_1.AccessScope('showHeader'),
        nameTagClasses: new ast_1.HtmlLiteral([
            new ast_1.PrimitiveLiteral('au name-tag '),
            new ast_1.Conditional(new ast_1.AccessScope('showHeader'), new ast_1.PrimitiveLiteral('header-visible'), new ast_1.PrimitiveLiteral(''))
        ]),
        name: new ast_1.AccessScope('name'),
        submit: new ast_1.CallScope('submit', emptyArray, 0),
        nameTagColor: new ast_1.AccessScope('color'),
        duplicateMessage: new ast_1.AccessScope('duplicateMessage'),
        checked: new ast_1.AccessScope('checked'),
        nameTag: new ast_1.AccessScope('nameTag'),
        todos: new ast_1.AccessScope('todos'),
        addTodo: new ast_1.CallScope('addTodo', emptyArray, 0),
        description: new ast_1.AccessMember(new ast_1.AccessScope('todo'), 'description')
    };
    var globalResources = [repeat_1.Repeat, if_1.If, else_1.Else];
    exports.GeneratedConfiguration = {
        register: function (container) {
            container.get(expression_parser_1.IExpressionParser).cache(expressionCache);
            container.register.apply(container, globalResources);
        }
    };
});



define('test-aot/name-tag-config',["require", "exports", "../runtime/templating/instructions", "../runtime/binding/event-manager"], function (require, exports, instructions_1, event_manager_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.nameTagConfig = {
        name: 'name-tag',
        hasSlots: true,
        template: "\n    <header>Super Duper name tag</header>\n    <div>\n      <input type=\"text\" class=\"au\"><br/>\n      <span class=\"au\" style=\"font-weight: bold; padding: 10px 0;\"></span>\n    </div>\n    <hr/>\n    <div>\n      <label>\n        Name tag color:\n        <select class=\"au\">\n          <option>red</option>\n          <option>green</option>\n          <option>blue</option>\n        </select>\n      </label>\n    </div>\n    <hr/>\n    <div>\n      <label>\n        Name tag border color:\n        <select class=\"au\">\n          <option>orange</option>\n          <option>black</option>\n          <option>rgba(0,0,0,0.5)</option>\n        </select>\n      </label>\n      <slot class=\"au\"></slot>\n    </div>\n    <hr/>\n    <div>\n      <label>\n        Name tag border width:\n        <input type=\"number\" class=\"au\" min=\"1\" step=\"1\" max=\"10\" />\n      </label>\n    </div>\n    <div>\n      <label>\n        Show header:\n        <input type=\"checkbox\" class=\"au\" />\n      </label>\n    </div>\n    <button class=\"au\">Reset</button>\n  ",
        instructions: [
            [
                {
                    type: instructions_1.TargetedInstructionType.twoWayBinding,
                    src: 'name',
                    dest: 'value'
                }
            ],
            [
                {
                    type: instructions_1.TargetedInstructionType.oneWayBinding,
                    src: 'name',
                    dest: 'textContent'
                },
                {
                    type: instructions_1.TargetedInstructionType.stylePropertyBinding,
                    src: 'nameTagColor',
                    dest: 'color'
                }
            ],
            [
                {
                    type: instructions_1.TargetedInstructionType.twoWayBinding,
                    src: 'nameTagColor',
                    dest: 'value'
                }
            ],
            [
                {
                    type: instructions_1.TargetedInstructionType.twoWayBinding,
                    src: 'nameTagBorderColor',
                    dest: 'value'
                }
            ],
            [
                {
                    type: instructions_1.TargetedInstructionType.hydrateSlot
                }
            ],
            [
                {
                    type: instructions_1.TargetedInstructionType.twoWayBinding,
                    src: 'nameTagBorderWidth',
                    dest: 'value'
                }
            ],
            [
                {
                    type: instructions_1.TargetedInstructionType.twoWayBinding,
                    src: 'nameTagHeaderVisible',
                    dest: 'checked'
                }
            ],
            [
                {
                    type: instructions_1.TargetedInstructionType.listenerBinding,
                    src: 'click',
                    dest: 'submit',
                    preventDefault: true,
                    strategy: event_manager_1.DelegationStrategy.none
                }
            ]
        ],
        surrogates: [
            {
                type: instructions_1.TargetedInstructionType.stylePropertyBinding,
                src: 'nameTagBorder',
                dest: 'border'
            },
            {
                type: instructions_1.TargetedInstructionType.oneWayBinding,
                src: 'nameTagClasses',
                dest: 'className'
            }
        ]
    };
});



var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
define('test-aot/name-tag',["require", "exports", "../runtime/templating/custom-element", "./name-tag-config"], function (require, exports, custom_element_1, name_tag_config_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var NameTag = (function () {
        function NameTag() {
            this.name = 'Aurelia';
            this.color = 'red';
            this.borderColor = 'orange';
            this.borderWidth = 3;
            this.showHeader = true;
        }
        NameTag.prototype.nameChanged = function (newValue) {
            console.log("Name changed to " + newValue);
        };
        NameTag.prototype.submit = function () {
            this.name = '' + Math.random();
        };
        NameTag.prototype.bound = function () {
            console.log('name-tag bound');
        };
        NameTag.prototype.attaching = function () {
            console.log('name-tag attaching');
        };
        NameTag.prototype.attached = function () {
            console.log('name-tag attached');
        };
        NameTag.prototype.detaching = function () {
            console.log('name-tag detaching');
        };
        NameTag.prototype.detached = function () {
            console.log('name-tag detached');
        };
        NameTag.prototype.unbound = function () {
            console.log('name-tag unbound');
        };
        NameTag = __decorate([
            custom_element_1.customElement(name_tag_config_1.nameTagConfig)
        ], NameTag);
        return NameTag;
    }());
    exports.NameTag = NameTag;
});



define('test-aot/startup',["require", "exports", "../runtime/aurelia", "./app", "./generated-configuration", "../debug/configuration"], function (require, exports, aurelia_1, app_1, generated_configuration_1, configuration_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    window['au'] = new aurelia_1.Aurelia()
        .register(generated_configuration_1.GeneratedConfiguration, configuration_1.DebugConfiguration)
        .app({ host: document.querySelector('app'), component: new app_1.App() })
        .start();
});



define('test-dbmonster/app-config',["require", "exports", "../runtime/templating/instructions"], function (require, exports, instructions_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.appConfig = {
        name: 'app',
        dependencies: [],
        template: "\n    <div>\n      <table class=\"table table-striped latest-data\">\n        <tbody>\n          <tr class=\"au\"></tr>\n        </tbody>\n      </table>\n    </div>\n  ",
        instructions: [
            [
                {
                    type: instructions_1.TargetedInstructionType.hydrateTemplateController,
                    res: 'repeat',
                    src: {
                        cache: "*",
                        template: "\n            <tr>\n              <td class=\"dbname\">\n                <au-marker class=\"au\"></au-marker> \n              </td>\n              <td class=\"query-count\">\n                <au-marker class=\"au\"></au-marker> \n              </td>\n              <td class=\"au\">\n              </td>\n            </tr>\n          ",
                        instructions: [
                            [{ type: instructions_1.TargetedInstructionType.textBinding, src: 'dbname' }],
                            [{ type: instructions_1.TargetedInstructionType.textBinding, src: 'nbQueries' }],
                            [
                                {
                                    type: instructions_1.TargetedInstructionType.hydrateTemplateController,
                                    res: 'repeat',
                                    src: {
                                        cache: "*",
                                        template: "\n                  <td>\n                    <au-marker class=\"au\"></au-marker>\n                    <div class=\"popover left\">\n                      <div class=\"popover-content\">\n                        <au-marker class=\"au\"></au-marker> \n                      </div>\n                      <div class=\"arrow\"></div>\n                    </div>\n                  </td>\n                  ",
                                        instructions: [
                                            [{ type: instructions_1.TargetedInstructionType.textBinding, src: 'formatElapsed' }],
                                            [{ type: instructions_1.TargetedInstructionType.textBinding, src: 'query' }]
                                        ]
                                    },
                                    instructions: [
                                        { type: instructions_1.TargetedInstructionType.oneWayBinding, src: 'topFiveQueries', dest: 'items' },
                                        { type: instructions_1.TargetedInstructionType.setProperty, value: 'q', dest: 'local' },
                                        { type: instructions_1.TargetedInstructionType.setProperty, value: false, dest: 'visualsRequireLifecycle' }
                                    ]
                                }
                            ]
                        ]
                    },
                    instructions: [
                        { type: instructions_1.TargetedInstructionType.oneWayBinding, src: 'databases', dest: 'items' },
                        { type: instructions_1.TargetedInstructionType.setProperty, value: 'db', dest: 'local' },
                        { type: instructions_1.TargetedInstructionType.setProperty, value: false, dest: 'visualsRequireLifecycle' }
                    ]
                }
            ]
        ],
        surrogates: []
    };
});



var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
define('test-dbmonster/app',["require", "exports", "./app-config", "../runtime/templating/custom-element"], function (require, exports, app_config_1, custom_element_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var App = (function () {
        function App() {
            this.databases = [];
        }
        App.prototype.attached = function () {
            var _this = this;
            var load = function () {
                _this.databases = ENV.generateData().toArray();
                Monitoring.renderRate.ping();
                setTimeout(load, ENV.timeout);
            };
            load();
        };
        App = __decorate([
            custom_element_1.customElement(app_config_1.appConfig)
        ], App);
        return App;
    }());
    exports.App = App;
});



define('test-dbmonster/generated-configuration',["require", "exports", "../runtime/binding/ast", "../runtime/binding/expression-parser", "../runtime/templating/resources/repeat/repeat"], function (require, exports, ast_1, expression_parser_1, repeat_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var expressionCache = {
        databases: new ast_1.AccessScope('databases'),
        dbname: new ast_1.AccessMember(new ast_1.AccessScope('db'), 'dbname'),
        countClassName: new ast_1.AccessMember(new ast_1.AccessMember(new ast_1.AccessScope('db'), 'lastSample'), 'countClassName'),
        nbQueries: new ast_1.AccessMember(new ast_1.AccessMember(new ast_1.AccessScope('db'), 'lastSample'), 'nbQueries'),
        topFiveQueries: new ast_1.AccessMember(new ast_1.AccessMember(new ast_1.AccessScope('db'), 'lastSample'), 'topFiveQueries'),
        elapsedClassName: new ast_1.AccessMember(new ast_1.AccessScope('q'), 'elapsedClassName'),
        formatElapsed: new ast_1.AccessMember(new ast_1.AccessScope('q'), 'formatElapsed'),
        query: new ast_1.AccessMember(new ast_1.AccessScope('q'), 'query')
    };
    var globalResources = [repeat_1.Repeat];
    exports.GeneratedConfiguration = {
        register: function (container) {
            container.get(expression_parser_1.IExpressionParser).cache(expressionCache);
            container.register.apply(container, globalResources);
        }
    };
});



define('test-dbmonster/startup',["require", "exports", "../runtime/aurelia", "./app", "./generated-configuration", "../debug/configuration"], function (require, exports, aurelia_1, app_1, generated_configuration_1, configuration_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    window['au'] = new aurelia_1.Aurelia()
        .register(generated_configuration_1.GeneratedConfiguration, configuration_1.DebugConfiguration)
        .app({ host: document.querySelector('app'), component: new app_1.App() })
        .start();
});



var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
define('test-jit/app',["require", "exports", "../runtime/templating/custom-element", "view!./app.html"], function (require, exports, custom_element_1, app_html_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var Todo = (function () {
        function Todo(description) {
            this.description = description;
            this.done = false;
        }
        return Todo;
    }());
    var App = (function () {
        function App() {
            this.message = 'Hello World';
            this.duplicateMessage = true;
            this.todos = [];
        }
        Object.defineProperty(App.prototype, "computedMessage", {
            get: function () {
                var value = "\n      " + this.message + " Computed:\n      Todo Count " + this.todos.length + "\n      Descriptions:\n      " + this.todos.map(function (x) { return x.description; }).join('\n') + "\n    ";
                return value;
            },
            enumerable: true,
            configurable: true
        });
        App.prototype.addTodo = function () {
            this.todos.push(new Todo(this.message));
        };
        App.prototype.bound = function () {
            console.log('app bound');
        };
        App.prototype.attaching = function () {
            console.log('app attaching');
        };
        App.prototype.attached = function () {
            console.log('app attached');
        };
        App.prototype.detaching = function () {
            console.log('app detaching');
        };
        App.prototype.detached = function () {
            console.log('app detached');
        };
        App.prototype.unbound = function () {
            console.log('app unbound');
        };
        App = __decorate([
            custom_element_1.customElement(app_html_1.default)
        ], App);
        return App;
    }());
    exports.App = App;
});



var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
define('test-jit/name-tag',["require", "exports", "../runtime/templating/custom-element", "view!./name-tag.html"], function (require, exports, custom_element_1, name_tag_html_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var NameTag = (function () {
        function NameTag() {
            this.name = 'Aurelia';
            this.color = 'red';
            this.borderColor = 'orange';
            this.borderWidth = 3;
            this.showHeader = true;
        }
        NameTag.prototype.nameChanged = function (newValue) {
            console.log("Name changed to " + newValue);
        };
        NameTag.prototype.submit = function () {
            this.name = '' + Math.random();
        };
        NameTag.prototype.bound = function () {
            console.log('name-tag bound');
        };
        NameTag.prototype.attaching = function () {
            console.log('name-tag attaching');
        };
        NameTag.prototype.attached = function () {
            console.log('name-tag attached');
        };
        NameTag.prototype.detaching = function () {
            console.log('name-tag detaching');
        };
        NameTag.prototype.detached = function () {
            console.log('name-tag detached');
        };
        NameTag.prototype.unbound = function () {
            console.log('name-tag unbound');
        };
        NameTag = __decorate([
            custom_element_1.customElement(name_tag_html_1.default)
        ], NameTag);
        return NameTag;
    }());
    exports.NameTag = NameTag;
});



define('test-jit/startup',["require", "exports", "../runtime/aurelia", "./app", "../debug/configuration", "../jit/configuration"], function (require, exports, aurelia_1, app_1, configuration_1, configuration_2) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    window['au'] = new aurelia_1.Aurelia()
        .register(configuration_2.BasicConfiguration, configuration_1.DebugConfiguration)
        .app({ host: document.querySelector('app'), component: new app_1.App() })
        .start();
});



define('debug/binding/binding-context',["require", "exports", "../../runtime/binding/binding-context"], function (require, exports, binding_context_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.BindingContext = Object.assign(binding_context_1.BindingContext, {
        createScopeForTest: function (bindingContext, parentBindingContext) {
            if (parentBindingContext) {
                return {
                    bindingContext: bindingContext,
                    overrideContext: this.createOverride(bindingContext, this.createOverride(parentBindingContext))
                };
            }
            return {
                bindingContext: bindingContext,
                overrideContext: this.createOverride(bindingContext)
            };
        }
    });
});



define('debug/binding/unparser',["require", "exports", "../../runtime/binding/ast"], function (require, exports, AST) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    function enableImprovedExpressionDebugging() {
        [
            { type: AST.AccessKeyed, name: 'AccessKeyed' },
            { type: AST.AccessMember, name: 'AccessMember' },
            { type: AST.AccessScope, name: 'AccessScope' },
            { type: AST.AccessThis, name: 'AccessThis' },
            { type: AST.Assign, name: 'Assign' },
            { type: AST.Binary, name: 'Binary' },
            { type: AST.BindingBehavior, name: 'BindingBehavior' },
            { type: AST.CallFunction, name: 'CallFunction' },
            { type: AST.CallMember, name: 'CallMember' },
            { type: AST.CallScope, name: 'CallScope' },
            { type: AST.Conditional, name: 'Conditional' },
            { type: AST.ArrayLiteral, name: 'LiteralArray' },
            { type: AST.ObjectLiteral, name: 'LiteralObject' },
            { type: AST.PrimitiveLiteral, name: 'LiteralPrimitive' },
            { type: AST.PrimitiveLiteral, name: 'LiteralString' },
            { type: AST.Unary, name: 'Unary' },
            { type: AST.HtmlLiteral, name: 'TemplateLiteral' },
            { type: AST.ValueConverter, name: 'ValueConverter' }
        ].forEach(function (x) { return adoptDebugMethods(x.type, x.name); });
    }
    exports.enableImprovedExpressionDebugging = enableImprovedExpressionDebugging;
    function adoptDebugMethods(type, name) {
        type.prototype.toString = function () { return Unparser.unparse(this); };
        type.prototype.accept = function (visitor) { return visitor['visit' + name](this); };
    }
    var Unparser = (function () {
        function Unparser(buffer) {
            this.buffer = buffer;
            this.buffer = buffer;
        }
        Unparser.unparse = function (expression) {
            var buffer = [];
            var visitor = new Unparser(buffer);
            expression.accept(visitor);
            return buffer.join('');
        };
        Unparser.prototype.write = function (text) {
            this.buffer.push(text);
        };
        Unparser.prototype.writeArgs = function (args) {
            this.write('(');
            for (var i = 0, length_1 = args.length; i < length_1; ++i) {
                if (i !== 0) {
                    this.write(',');
                }
                args[i].accept(this);
            }
            this.write(')');
        };
        Unparser.prototype.visitBindingBehavior = function (behavior) {
            var args = behavior.args;
            behavior.expression.accept(this);
            this.write("&" + behavior.name);
            for (var i = 0, length_2 = args.length; i < length_2; ++i) {
                this.write(':');
                args[i].accept(this);
            }
        };
        Unparser.prototype.visitValueConverter = function (converter) {
            var args = converter.args;
            converter.expression.accept(this);
            this.write("|" + converter.name);
            for (var i = 0, length_3 = args.length; i < length_3; ++i) {
                this.write(':');
                args[i].accept(this);
            }
        };
        Unparser.prototype.visitAssign = function (assign) {
            assign.target.accept(this);
            this.write('=');
            assign.value.accept(this);
        };
        Unparser.prototype.visitConditional = function (conditional) {
            conditional.condition.accept(this);
            this.write('?');
            conditional.yes.accept(this);
            this.write(':');
            conditional.no.accept(this);
        };
        Unparser.prototype.visitAccessThis = function (access) {
            if (access.ancestor === 0) {
                this.write('$this');
                return;
            }
            this.write('$parent');
            var i = access.ancestor - 1;
            while (i--) {
                this.write('.$parent');
            }
        };
        Unparser.prototype.visitAccessScope = function (access) {
            var i = access.ancestor;
            while (i--) {
                this.write('$parent.');
            }
            this.write(access.name);
        };
        Unparser.prototype.visitAccessMember = function (access) {
            access.object.accept(this);
            this.write("." + access.name);
        };
        Unparser.prototype.visitAccessKeyed = function (access) {
            access.object.accept(this);
            this.write('[');
            access.key.accept(this);
            this.write(']');
        };
        Unparser.prototype.visitCallScope = function (call) {
            var i = call.ancestor;
            while (i--) {
                this.write('$parent.');
            }
            this.write(call.name);
            this.writeArgs(call.args);
        };
        Unparser.prototype.visitCallFunction = function (call) {
            call.func.accept(this);
            this.writeArgs(call.args);
        };
        Unparser.prototype.visitCallMember = function (call) {
            call.object.accept(this);
            this.write("." + call.name);
            this.writeArgs(call.args);
        };
        Unparser.prototype.visitUnary = function (unary) {
            this.write("(" + unary.operation);
            unary.expression.accept(this);
            this.write(')');
        };
        Unparser.prototype.visitBinary = function (binary) {
            binary.left.accept(this);
            this.write(binary.operation);
            binary.right.accept(this);
        };
        Unparser.prototype.visitLiteralPrimitive = function (literal) {
            this.write("" + literal.value);
        };
        Unparser.prototype.visitLiteralArray = function (literal) {
            var elements = literal.elements;
            this.write('[');
            for (var i = 0, length_4 = elements.length; i < length_4; ++i) {
                if (i !== 0) {
                    this.write(',');
                }
                elements[i].accept(this);
            }
            this.write(']');
        };
        Unparser.prototype.visitLiteralObject = function (literal) {
            var keys = literal.keys;
            var values = literal.values;
            this.write('{');
            for (var i = 0, length_5 = keys.length; i < length_5; ++i) {
                if (i !== 0) {
                    this.write(',');
                }
                this.write("'" + keys[i] + "':");
                values[i].accept(this);
            }
            this.write('}');
        };
        Unparser.prototype.visitLiteralString = function (literal) {
            var escaped = literal.value.replace(/'/g, "\'");
            this.write("'" + escaped + "'");
        };
        Unparser.prototype.visitTemplateLiteral = function (node) {
            var parts = node.parts;
            for (var i = 0, length_6 = parts.length; i < length_6; ++i) {
                parts[i].accept(this);
            }
        };
        return Unparser;
    }());
});



define('jit/binding/expression-parser',["require", "exports", "../../runtime/binding/ast", "../../runtime/binding/expression-parser"], function (require, exports, ast_1, expression_parser_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    function register(container) {
        container.registerTransformer(expression_parser_1.IExpressionParser, function (parser) {
            return Object.assign(parser, {
                parseCore: function (expression) {
                    return parse(new ParserState(expression), 0, 61);
                }
            });
        });
    }
    exports.register = register;
    var ParserState = (function () {
        function ParserState(input) {
            this.index = 0;
            this.startIndex = 0;
            this.lastIndex = 0;
            this.input = input;
            this.length = input.length;
            this.currentToken = 786432;
            this.tokenValue = '';
            this.currentChar = input.charCodeAt(0);
            this.assignable = true;
            nextToken(this);
            if (this.currentToken & 524288) {
                error(this, 'Invalid start of expression');
            }
        }
        Object.defineProperty(ParserState.prototype, "tokenRaw", {
            get: function () {
                return this.input.slice(this.startIndex, this.index);
            },
            enumerable: true,
            configurable: true
        });
        return ParserState;
    }());
    function parse(state, access, minPrecedence) {
        var exprStart = state.index;
        state.assignable = 448 > minPrecedence;
        var result = undefined;
        if (state.currentToken & 16384) {
            var op = TokenValues[state.currentToken & 63];
            nextToken(state);
            result = new ast_1.Unary(op, parse(state, access, 449));
        }
        else {
            primary: switch (state.currentToken) {
                case 1541:
                    state.assignable = false;
                    do {
                        nextToken(state);
                        access++;
                        if (optional(state, 8200)) {
                            if (state.currentToken === 8200) {
                                error(state);
                            }
                            continue;
                        }
                        else if (state.currentToken & 262144) {
                            result = new ast_1.AccessThis(access & 511);
                            access = 512;
                            break primary;
                        }
                        else {
                            error(state);
                        }
                    } while (state.currentToken === 1541);
                case 512:
                    result = new ast_1.AccessScope(state.tokenValue, access & 511);
                    nextToken(state);
                    access = 1024;
                    break;
                case 1540:
                    state.assignable = false;
                    nextToken(state);
                    result = new ast_1.AccessThis(0);
                    access = 512;
                    break;
                case 335878:
                    nextToken(state);
                    result = parse(state, 0, 63);
                    expect(state, 917514);
                    break;
                case 335884:
                    nextToken(state);
                    var elements = new Array();
                    while (state.currentToken !== 655373) {
                        if (optional(state, 262155)) {
                            elements.push($undefined);
                            if (state.currentToken === 655373) {
                                elements.push($undefined);
                                break;
                            }
                        }
                        else {
                            elements.push(parse(state, access, 62));
                            if (!optional(state, 262155)) {
                                break;
                            }
                        }
                    }
                    expect(state, 655373);
                    result = new ast_1.ArrayLiteral(elements);
                    state.assignable = false;
                    break;
                case 65543:
                    var keys = new Array();
                    var values = new Array();
                    nextToken(state);
                    while (state.currentToken !== 917513) {
                        keys.push(state.tokenValue);
                        if (state.currentToken & 6144) {
                            nextToken(state);
                            expect(state, 262158);
                            values.push(parse(state, 0, 62));
                        }
                        else if (state.currentToken & 1536) {
                            var _a = state, currentChar = _a.currentChar, currentToken = _a.currentToken, index = _a.index;
                            nextToken(state);
                            if (optional(state, 262158)) {
                                values.push(parse(state, 0, 62));
                            }
                            else {
                                state.currentChar = currentChar;
                                state.currentToken = currentToken;
                                state.index = index;
                                values.push(parse(state, 0, 449));
                            }
                        }
                        else {
                            error(state);
                        }
                        if (state.currentToken !== 917513) {
                            expect(state, 262155);
                        }
                    }
                    expect(state, 917513);
                    result = new ast_1.ObjectLiteral(keys, values);
                    state.assignable = false;
                    break;
                case 8233:
                    result = new ast_1.Template([state.tokenValue]);
                    state.assignable = false;
                    nextToken(state);
                    break;
                case 8234:
                    var cooked = [state.tokenValue];
                    expect(state, 8234);
                    var expressions = [parse(state, access, 62)];
                    while ((state.currentToken = scanTemplateTail(state)) !== 8233) {
                        cooked.push(state.tokenValue);
                        expect(state, 8234);
                        expressions.push(parse(state, access, 62));
                    }
                    cooked.push(state.tokenValue);
                    nextToken(state);
                    result = new ast_1.Template(cooked, expressions);
                    state.assignable = false;
                    break;
                case 2048:
                case 4096:
                    result = new ast_1.PrimitiveLiteral(state.tokenValue);
                    state.assignable = false;
                    nextToken(state);
                    break;
                case 1026:
                case 1027:
                case 1025:
                case 1024:
                    result = TokenValues[state.currentToken & 63];
                    state.assignable = false;
                    nextToken(state);
                    break;
                default:
                    if (state.index >= state.length) {
                        error(state, 'Unexpected end of expression');
                    }
                    else {
                        error(state);
                    }
            }
            if (448 < minPrecedence)
                return result;
            var name_1 = state.tokenValue;
            while (state.currentToken & 8192) {
                switch (state.currentToken) {
                    case 8200:
                        state.assignable = true;
                        nextToken(state);
                        if (!(state.currentToken & 1536)) {
                            error(state);
                        }
                        name_1 = state.tokenValue;
                        nextToken(state);
                        access = ((access & (512 | 1024)) << 1) | (access & 2048) | ((access & 4096) >> 1);
                        if (state.currentToken === 335878) {
                            continue;
                        }
                        if (access & 1024) {
                            result = new ast_1.AccessScope(name_1, result.ancestor);
                        }
                        else {
                            result = new ast_1.AccessMember(result, name_1);
                        }
                        continue;
                    case 335884:
                        state.assignable = true;
                        nextToken(state);
                        access = 4096;
                        result = new ast_1.AccessKeyed(result, parse(state, 0, 63));
                        expect(state, 655373);
                        break;
                    case 335878:
                        state.assignable = false;
                        nextToken(state);
                        var args = new Array();
                        while (state.currentToken !== 917514) {
                            args.push(parse(state, 0, 63));
                            if (!optional(state, 262155)) {
                                break;
                            }
                        }
                        expect(state, 917514);
                        if (access & 1024) {
                            result = new ast_1.CallScope(name_1, args, result.ancestor);
                        }
                        else if (access & 2048) {
                            result = new ast_1.CallMember(result, name_1, args);
                        }
                        else {
                            result = new ast_1.CallFunction(result, args);
                        }
                        access = 0;
                        break;
                    case 8233:
                        state.assignable = false;
                        result = new ast_1.TaggedTemplate([state.tokenValue], [state.tokenRaw], result);
                        nextToken(state);
                        break;
                    case 8234:
                        state.assignable = false;
                        var cooked = [state.tokenValue];
                        var raw = [state.tokenRaw];
                        expect(state, 8234);
                        var expressions = [parse(state, access, 62)];
                        while ((state.currentToken = scanTemplateTail(state)) !== 8233) {
                            cooked.push(state.tokenValue);
                            raw.push(state.tokenRaw);
                            expect(state, 8234);
                            expressions.push(parse(state, access, 62));
                        }
                        cooked.push(state.tokenValue);
                        raw.push(state.tokenRaw);
                        nextToken(state);
                        result = new ast_1.TaggedTemplate(cooked, raw, result, expressions);
                    default:
                }
            }
        }
        if (448 < minPrecedence)
            return result;
        while (state.currentToken & 32768) {
            var opToken = state.currentToken;
            if ((opToken & 448) < minPrecedence) {
                break;
            }
            nextToken(state);
            result = new ast_1.Binary(TokenValues[opToken & 63], result, parse(state, access, opToken & 448));
            state.assignable = false;
        }
        if (63 < minPrecedence)
            return result;
        if (optional(state, 15)) {
            var yes = parse(state, access, 62);
            expect(state, 262158);
            result = new ast_1.Conditional(result, yes, parse(state, access, 62));
            state.assignable = false;
        }
        if (optional(state, 39)) {
            if (!state.assignable) {
                error(state, "Expression " + state.input.slice(exprStart, state.startIndex) + " is not assignable");
            }
            exprStart = state.index;
            result = new ast_1.Assign(result, parse(state, access, 62));
        }
        if (61 < minPrecedence)
            return result;
        while (optional(state, 262163)) {
            var name_2 = state.tokenValue;
            nextToken(state);
            var args = new Array();
            while (optional(state, 262158)) {
                args.push(parse(state, access, 62));
            }
            result = new ast_1.ValueConverter(result, name_2, args);
        }
        while (optional(state, 262160)) {
            var name_3 = state.tokenValue;
            nextToken(state);
            var args = new Array();
            while (optional(state, 262158)) {
                args.push(parse(state, access, 62));
            }
            result = new ast_1.BindingBehavior(result, name_3, args);
        }
        if (state.currentToken !== 786432) {
            error(state, "Unconsumed token " + state.tokenRaw);
        }
        return result;
    }
    function nextToken(state) {
        while (state.index < state.length) {
            state.startIndex = state.index;
            if ((state.currentToken = CharScanners[state.currentChar](state)) !== null) {
                return;
            }
        }
        state.currentToken = 786432;
    }
    function nextChar(state) {
        return state.currentChar = state.input.charCodeAt(++state.index);
    }
    function scanIdentifier(state) {
        while (IdParts[nextChar(state)]) { }
        return KeywordLookup[state.tokenValue = state.tokenRaw] || 512;
    }
    function scanNumber(state, isFloat) {
        if (isFloat) {
            state.tokenValue = 0;
        }
        else {
            state.tokenValue = state.currentChar - 48;
            while (nextChar(state) <= 57 && state.currentChar >= 48) {
                state.tokenValue = state.tokenValue * 10 + state.currentChar - 48;
            }
        }
        if (isFloat || state.currentChar === 46) {
            if (!isFloat) {
                nextChar(state);
            }
            var start = state.index;
            var value = state.currentChar - 48;
            while (nextChar(state) <= 57 && state.currentChar >= 48) {
                value = value * 10 + state.currentChar - 48;
            }
            state.tokenValue = state.tokenValue + value / Math.pow(10, (state.index - start));
        }
        return 4096;
    }
    function scanString(state) {
        var quote = state.currentChar;
        nextChar(state);
        var unescaped = 0;
        var buffer = new Array();
        var marker = state.index;
        while (state.currentChar !== quote) {
            if (state.currentChar === 92) {
                buffer.push(state.input.slice(marker, state.index));
                nextChar(state);
                unescaped = unescape(state.currentChar);
                nextChar(state);
                buffer.push(String.fromCharCode(unescaped));
                marker = state.index;
            }
            else if (state.currentChar === 0) {
                error(state, 'Unterminated quote');
            }
            else {
                nextChar(state);
            }
        }
        var last = state.input.slice(marker, state.index);
        nextChar(state);
        var unescapedStr = last;
        if (buffer !== null && buffer !== undefined) {
            buffer.push(last);
            unescapedStr = buffer.join('');
        }
        state.tokenValue = unescapedStr;
        return 2048;
    }
    function scanTemplate(state) {
        var tail = true;
        var result = '';
        while (nextChar(state) !== 96) {
            if (state.currentChar === 36) {
                if ((state.index + 1) < state.length && state.input.charCodeAt(state.index + 1) === 123) {
                    state.index++;
                    tail = false;
                    break;
                }
                else {
                    result += '$';
                }
            }
            else if (state.currentChar === 92) {
                result += String.fromCharCode(unescape(nextChar(state)));
            }
            else {
                result += String.fromCharCode(state.currentChar);
            }
        }
        nextChar(state);
        state.tokenValue = result;
        if (tail) {
            return 8233;
        }
        return 8234;
    }
    function scanTemplateTail(state) {
        if (state.index >= state.length) {
            error(state, 'Unterminated template');
        }
        state.index--;
        return scanTemplate(state);
    }
    function error(state, message, column) {
        if (message === void 0) { message = "Unexpected token " + state.tokenRaw; }
        if (column === void 0) { column = state.startIndex; }
        throw new Error("Parser Error: " + message + " at column " + column + " in expression [" + state.input + "]");
    }
    function optional(state, token) {
        if (state.currentToken === token) {
            nextToken(state);
            return true;
        }
        return false;
    }
    function expect(state, token) {
        if (state.currentToken === token) {
            nextToken(state);
        }
        else {
            error(state, "Missing expected token " + TokenValues[token & 63], state.index);
        }
    }
    function unescape(code) {
        switch (code) {
            case 98: return 8;
            case 116: return 9;
            case 110: return 10;
            case 118: return 11;
            case 102: return 12;
            case 114: return 13;
            case 34: return 34;
            case 39: return 39;
            case 92: return 92;
            default: return code;
        }
    }
    var $false = new ast_1.PrimitiveLiteral(false);
    var $true = new ast_1.PrimitiveLiteral(true);
    var $null = new ast_1.PrimitiveLiteral(null);
    var $undefined = new ast_1.PrimitiveLiteral(undefined);
    var TokenValues = [
        $false, $true, $null, $undefined, '$this', '$parent',
        '(', '{', '.', '}', ')', ',', '[', ']', ':', '?', '\'', '"',
        '&', '|', '||', '&&', '==', '!=', '===', '!==', '<', '>',
        '<=', '>=', 'in', 'instanceof', '+', '-', 'typeof', 'void', '*', '%', '/', '=', '!',
        8233, 8234
    ];
    var KeywordLookup = Object.create(null);
    KeywordLookup.true = 1025;
    KeywordLookup.null = 1026;
    KeywordLookup.false = 1024;
    KeywordLookup.undefined = 1027;
    KeywordLookup.$this = 1540;
    KeywordLookup.$parent = 1541;
    KeywordLookup.in = 34142;
    KeywordLookup.instanceof = 34143;
    KeywordLookup.typeof = 17442;
    KeywordLookup.void = 17443;
    var codes = {
        AsciiIdPart: [0x24, 0, 0x30, 0x3A, 0x41, 0x5B, 0x5F, 0, 0x61, 0x7B],
        IdStart: [0x24, 0, 0x41, 0x5B, 0x5F, 0, 0x61, 0x7B, 0xAA, 0, 0xBA, 0, 0xC0, 0xD7, 0xD8, 0xF7, 0xF8, 0x2B9, 0x2E0, 0x2E5, 0x1D00, 0x1D26, 0x1D2C, 0x1D5D, 0x1D62, 0x1D66, 0x1D6B, 0x1D78, 0x1D79, 0x1DBF, 0x1E00, 0x1F00, 0x2071, 0, 0x207F, 0, 0x2090, 0x209D, 0x212A, 0x212C, 0x2132, 0, 0x214E, 0, 0x2160, 0x2189, 0x2C60, 0x2C80, 0xA722, 0xA788, 0xA78B, 0xA7AF, 0xA7B0, 0xA7B8, 0xA7F7, 0xA800, 0xAB30, 0xAB5B, 0xAB5C, 0xAB65, 0xFB00, 0xFB07, 0xFF21, 0xFF3B, 0xFF41, 0xFF5B],
        Digit: [0x30, 0x3A],
        Skip: [0, 0x21, 0x7F, 0xA1]
    };
    function decompress(lookup, set, compressed, value) {
        var rangeCount = compressed.length;
        for (var i = 0; i < rangeCount; i += 2) {
            var start = compressed[i];
            var end = compressed[i + 1];
            end = end > 0 ? end : start + 1;
            if (lookup) {
                lookup.fill(value, start, end);
            }
            if (set) {
                for (var ch = start; ch < end; ch++) {
                    set.add(ch);
                }
            }
        }
    }
    function returnToken(token) {
        return function (s) {
            nextChar(s);
            return token;
        };
    }
    var unexpectedCharacter = function (s) {
        error(s, "Unexpected character [" + String.fromCharCode(s.currentChar) + "]");
        return null;
    };
    unexpectedCharacter.notMapped = true;
    var AsciiIdParts = new Set();
    decompress(null, AsciiIdParts, codes.AsciiIdPart, true);
    var IdParts = new Uint8Array(0xFFFF);
    decompress(IdParts, null, codes.IdStart, 1);
    decompress(IdParts, null, codes.Digit, 1);
    var CharScanners = new Array(0xFFFF);
    CharScanners.fill(unexpectedCharacter, 0, 0xFFFF);
    decompress(CharScanners, null, codes.Skip, function (s) {
        nextChar(s);
        return null;
    });
    decompress(CharScanners, null, codes.IdStart, scanIdentifier);
    decompress(CharScanners, null, codes.Digit, function (s) { return scanNumber(s, false); });
    CharScanners[34] =
        CharScanners[39] = function (s) {
            return scanString(s);
        };
    CharScanners[96] = function (s) {
        return scanTemplate(s);
    };
    CharScanners[33] = function (s) {
        if (nextChar(s) !== 61) {
            return 16424;
        }
        if (nextChar(s) !== 61) {
            return 33047;
        }
        nextChar(s);
        return 33049;
    };
    CharScanners[61] = function (s) {
        if (nextChar(s) !== 61) {
            return 39;
        }
        if (nextChar(s) !== 61) {
            return 33046;
        }
        nextChar(s);
        return 33048;
    };
    CharScanners[38] = function (s) {
        if (nextChar(s) !== 38) {
            return 262160;
        }
        nextChar(s);
        return 32981;
    };
    CharScanners[124] = function (s) {
        if (nextChar(s) !== 124) {
            return 262163;
        }
        nextChar(s);
        return 32916;
    };
    CharScanners[46] = function (s) {
        if (nextChar(s) <= 57 && s.currentChar >= 48) {
            return scanNumber(s, true);
        }
        return 8200;
    };
    CharScanners[60] = function (s) {
        if (nextChar(s) !== 61) {
            return 33114;
        }
        nextChar(s);
        return 33116;
    };
    CharScanners[62] = function (s) {
        if (nextChar(s) !== 61) {
            return 33115;
        }
        nextChar(s);
        return 33117;
    };
    CharScanners[37] = returnToken(33253);
    CharScanners[40] = returnToken(335878);
    CharScanners[41] = returnToken(917514);
    CharScanners[42] = returnToken(33252);
    CharScanners[43] = returnToken(49568);
    CharScanners[44] = returnToken(262155);
    CharScanners[45] = returnToken(49569);
    CharScanners[47] = returnToken(33254);
    CharScanners[58] = returnToken(262158);
    CharScanners[63] = returnToken(15);
    CharScanners[91] = returnToken(335884);
    CharScanners[93] = returnToken(655373);
    CharScanners[123] = returnToken(65543);
    CharScanners[125] = returnToken(917513);
});



define('jit/templating/template-compiler',["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var TemplateCompiler = (function () {
        function TemplateCompiler() {
        }
        Object.defineProperty(TemplateCompiler.prototype, "name", {
            get: function () {
                return 'default';
            },
            enumerable: true,
            configurable: true
        });
        TemplateCompiler.prototype.compile = function (definition, resources) {
            throw new Error('Template Compiler Not Yet Implemented');
        };
        return TemplateCompiler;
    }());
    exports.TemplateCompiler = TemplateCompiler;
});



define('plugins/requirejs/component',["require", "exports", "../../runtime/templating/custom-element", "./processing"], function (require, exports, custom_element_1, processing_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var buildMap = {};
    function finishLoad(name, content, onLoad) {
        buildMap[name] = content;
        onLoad(content);
    }
    function load(name, req, onLoad, config) {
        if (config.isBuild) {
            processing_1.loadFromFile(req.toUrl(name), function (content) { finishLoad(name, content, onLoad); }, function (err) { if (onLoad.error) {
                onLoad.error(err);
            } });
        }
        else {
            req(['text!' + name], function (text) {
                var description = processing_1.createTemplateDescription(text);
                var depsToLoad = processing_1.processImports(description.imports, name);
                req(depsToLoad, function () {
                    var templateImport = processing_1.parseImport(name);
                    var templateSource = {
                        name: processing_1.kebabCase(templateImport.basename),
                        template: description.template,
                        build: {
                            required: true,
                            compiler: 'default'
                        },
                        dependencies: Array.prototype.slice.call(arguments, 1)
                    };
                    onLoad({ default: custom_element_1.CustomElementResource.define(templateSource, null) });
                });
            });
        }
    }
    exports.load = load;
    function write(pluginName, moduleName, write, config) {
        if (buildMap.hasOwnProperty(moduleName)) {
            var templateImport = processing_1.parseImport(moduleName);
            var text = buildMap[moduleName];
            var description = processing_1.createTemplateDescription(text);
            var depsToLoad = processing_1.processImports(description.imports, moduleName);
            depsToLoad.unshift('@aurelia/runtime');
            write("define(\"" + pluginName + "!" + moduleName + "\", [" + depsToLoad.map(function (x) { return "\"" + x + "\""; }).join(',') + "], function() { \n      var Component = arguments[0].Component;\n      var templateSource = {\n        name: '" + processing_1.kebabCase(templateImport.basename) + "',\n        template: '" + processing_1.escape(description.template) + "',\n        build: {\n          required: true,\n          compiler: 'default'\n        },\n        dependencies: Array.prototype.slice.call(arguments, 1)\n      };\n\n      return { default: Component.element(templateSource) };\n    });\n");
        }
    }
    exports.write = write;
});



define('plugins/requirejs/configuration',["require", "exports", "./component", "./view"], function (require, exports, componentPlugin, viewPlugin) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var nonAnonDefine = define;
    function installRequireJSPlugins() {
        nonAnonDefine('view', [], viewPlugin);
        nonAnonDefine('component', [], componentPlugin);
    }
    exports.installRequireJSPlugins = installRequireJSPlugins;
});



define('plugins/requirejs/processing',["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    function processImports(toProcess, relativeTo) {
        return toProcess.map(function (x) {
            if (x.extension === '.html' && !x.plugin) {
                return 'component!' + relativeToFile(x.path, relativeTo) + x.extension;
            }
            var relativePath = relativeToFile(x.path, relativeTo);
            return x.plugin ? x.plugin + "!" + relativePath : relativePath;
        });
    }
    exports.processImports = processImports;
    var capitalMatcher = /([A-Z])/g;
    function addHyphenAndLower(char) {
        return '-' + char.toLowerCase();
    }
    function kebabCase(name) {
        return (name.charAt(0).toLowerCase() + name.slice(1)).replace(capitalMatcher, addHyphenAndLower);
    }
    exports.kebabCase = kebabCase;
    function escape(content) {
        return content.replace(/(['\\])/g, '\\$1')
            .replace(/[\f]/g, "\\f")
            .replace(/[\b]/g, "\\b")
            .replace(/[\n]/g, "\\n")
            .replace(/[\t]/g, "\\t")
            .replace(/[\r]/g, "\\r")
            .replace(/[\u2028]/g, "\\u2028")
            .replace(/[\u2029]/g, "\\u2029");
    }
    exports.escape = escape;
    function createTemplateDescription(template) {
        var imports = [];
        var cleanedTemplate = template.replace(/^@import\s+\'([a-zA-z\/.\-_!%&\?=0-9]*)\'\s*;/gm, function (match, url) {
            imports.push(parseImport(url));
            return '';
        });
        return {
            template: cleanedTemplate.trim(),
            imports: imports
        };
    }
    exports.createTemplateDescription = createTemplateDescription;
    function parseImport(value) {
        var result = {
            path: value
        };
        var pluginIndex = result.path.lastIndexOf('!');
        if (pluginIndex !== -1) {
            result.plugin = result.path.slice(pluginIndex + 1);
            result.path = result.path.slice(0, pluginIndex);
        }
        else {
            result.plugin = null;
        }
        var extensionIndex = result.path.lastIndexOf('.');
        if (extensionIndex !== -1) {
            result.extension = result.path.slice(extensionIndex).toLowerCase();
            result.path = result.path.slice(0, extensionIndex);
        }
        else {
            result.extension = null;
        }
        var slashIndex = result.path.lastIndexOf('/');
        if (slashIndex !== -1) {
            result.basename = result.path.slice(slashIndex + 1);
        }
        else {
            result.basename = result.path;
        }
        return result;
    }
    exports.parseImport = parseImport;
    function relativeToFile(name, file) {
        var fileParts = file && file.split('/');
        var nameParts = name.trim().split('/');
        if (nameParts[0].charAt(0) === '.' && fileParts) {
            var normalizedBaseParts = fileParts.slice(0, fileParts.length - 1);
            nameParts.unshift.apply(nameParts, normalizedBaseParts);
        }
        trimDots(nameParts);
        return nameParts.join('/');
    }
    exports.relativeToFile = relativeToFile;
    function loadFromFile(url, callback, errback) {
        var fs = require.nodeRequire('fs');
        try {
            var file = fs.readFileSync(url, 'utf8');
            if (file[0] === '\uFEFF') {
                file = file.substring(1);
            }
            callback(file);
        }
        catch (e) {
            if (errback) {
                errback(e);
            }
        }
    }
    exports.loadFromFile = loadFromFile;
    function trimDots(ary) {
        for (var i = 0; i < ary.length; ++i) {
            var part = ary[i];
            if (part === '.') {
                ary.splice(i, 1);
                i -= 1;
            }
            else if (part === '..') {
                if (i === 0 || (i === 1 && ary[2] === '..') || ary[i - 1] === '..') {
                    continue;
                }
                else if (i > 0) {
                    ary.splice(i - 1, 2);
                    i -= 2;
                }
            }
        }
    }
});



define('plugins/requirejs/view',["require", "exports", "./processing"], function (require, exports, processing_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var buildMap = {};
    function finishLoad(name, content, onLoad) {
        buildMap[name] = content;
        onLoad(content);
    }
    function load(name, req, onLoad, config) {
        if (config.isBuild) {
            processing_1.loadFromFile(req.toUrl(name), function (content) { finishLoad(name, content, onLoad); }, function (err) { if (onLoad.error) {
                onLoad.error(err);
            } });
        }
        else {
            req(['text!' + name], function (text) {
                var description = processing_1.createTemplateDescription(text);
                var depsToLoad = processing_1.processImports(description.imports, name);
                var templateImport = processing_1.parseImport(name);
                req(depsToLoad, function () {
                    var templateSource = {
                        name: processing_1.kebabCase(templateImport.basename),
                        template: description.template,
                        build: {
                            required: true,
                            compiler: 'default'
                        },
                        dependencies: Array.prototype.slice.call(arguments)
                    };
                    onLoad({ default: templateSource });
                });
            });
        }
    }
    exports.load = load;
    function write(pluginName, moduleName, write, config) {
        if (buildMap.hasOwnProperty(moduleName)) {
            var text = buildMap[moduleName];
            var description = processing_1.createTemplateDescription(text);
            var depsToLoad = processing_1.processImports(description.imports, moduleName);
            var templateImport = processing_1.parseImport(moduleName);
            write("define(\"" + pluginName + "!" + moduleName + "\", [" + depsToLoad.map(function (x) { return "\"" + x + "\""; }).join(',') + "], function() { \n      var templateSource = {\n        name: '" + processing_1.kebabCase(templateImport.basename) + "',\n        template: '" + processing_1.escape(description.template) + "',\n        build: {\n          required: true,\n          compiler: 'default'\n        },\n        dependencies: Array.prototype.slice.call(arguments)\n      };\n\n      return { default: templateSource };\n    });\n");
        }
    }
    exports.write = write;
});



define('plugins/svg/svg-analyzer',["require", "exports", "../../runtime/binding/svg-analyzer", "../../runtime/dom"], function (require, exports, svg_analyzer_1, dom_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var svgElements = {
        a: ['class', 'externalResourcesRequired', 'id', 'onactivate', 'onclick', 'onfocusin', 'onfocusout', 'onload', 'onmousedown', 'onmousemove', 'onmouseout', 'onmouseover', 'onmouseup', 'requiredExtensions', 'requiredFeatures', 'style', 'systemLanguage', 'target', 'transform', 'xlink:actuate', 'xlink:arcrole', 'xlink:href', 'xlink:role', 'xlink:show', 'xlink:title', 'xlink:type', 'xml:base', 'xml:lang', 'xml:space'],
        altGlyph: ['class', 'dx', 'dy', 'externalResourcesRequired', 'format', 'glyphRef', 'id', 'onactivate', 'onclick', 'onfocusin', 'onfocusout', 'onload', 'onmousedown', 'onmousemove', 'onmouseout', 'onmouseover', 'onmouseup', 'requiredExtensions', 'requiredFeatures', 'rotate', 'style', 'systemLanguage', 'x', 'xlink:actuate', 'xlink:arcrole', 'xlink:href', 'xlink:role', 'xlink:show', 'xlink:title', 'xlink:type', 'xml:base', 'xml:lang', 'xml:space', 'y'],
        altGlyphDef: ['id', 'xml:base', 'xml:lang', 'xml:space'],
        altGlyphItem: ['id', 'xml:base', 'xml:lang', 'xml:space'],
        animate: ['accumulate', 'additive', 'attributeName', 'attributeType', 'begin', 'by', 'calcMode', 'dur', 'end', 'externalResourcesRequired', 'fill', 'from', 'id', 'keySplines', 'keyTimes', 'max', 'min', 'onbegin', 'onend', 'onload', 'onrepeat', 'repeatCount', 'repeatDur', 'requiredExtensions', 'requiredFeatures', 'restart', 'systemLanguage', 'to', 'values', 'xlink:actuate', 'xlink:arcrole', 'xlink:href', 'xlink:role', 'xlink:show', 'xlink:title', 'xlink:type', 'xml:base', 'xml:lang', 'xml:space'],
        animateColor: ['accumulate', 'additive', 'attributeName', 'attributeType', 'begin', 'by', 'calcMode', 'dur', 'end', 'externalResourcesRequired', 'fill', 'from', 'id', 'keySplines', 'keyTimes', 'max', 'min', 'onbegin', 'onend', 'onload', 'onrepeat', 'repeatCount', 'repeatDur', 'requiredExtensions', 'requiredFeatures', 'restart', 'systemLanguage', 'to', 'values', 'xlink:actuate', 'xlink:arcrole', 'xlink:href', 'xlink:role', 'xlink:show', 'xlink:title', 'xlink:type', 'xml:base', 'xml:lang', 'xml:space'],
        animateMotion: ['accumulate', 'additive', 'begin', 'by', 'calcMode', 'dur', 'end', 'externalResourcesRequired', 'fill', 'from', 'id', 'keyPoints', 'keySplines', 'keyTimes', 'max', 'min', 'onbegin', 'onend', 'onload', 'onrepeat', 'origin', 'path', 'repeatCount', 'repeatDur', 'requiredExtensions', 'requiredFeatures', 'restart', 'rotate', 'systemLanguage', 'to', 'values', 'xlink:actuate', 'xlink:arcrole', 'xlink:href', 'xlink:role', 'xlink:show', 'xlink:title', 'xlink:type', 'xml:base', 'xml:lang', 'xml:space'],
        animateTransform: ['accumulate', 'additive', 'attributeName', 'attributeType', 'begin', 'by', 'calcMode', 'dur', 'end', 'externalResourcesRequired', 'fill', 'from', 'id', 'keySplines', 'keyTimes', 'max', 'min', 'onbegin', 'onend', 'onload', 'onrepeat', 'repeatCount', 'repeatDur', 'requiredExtensions', 'requiredFeatures', 'restart', 'systemLanguage', 'to', 'type', 'values', 'xlink:actuate', 'xlink:arcrole', 'xlink:href', 'xlink:role', 'xlink:show', 'xlink:title', 'xlink:type', 'xml:base', 'xml:lang', 'xml:space'],
        circle: ['class', 'cx', 'cy', 'externalResourcesRequired', 'id', 'onactivate', 'onclick', 'onfocusin', 'onfocusout', 'onload', 'onmousedown', 'onmousemove', 'onmouseout', 'onmouseover', 'onmouseup', 'r', 'requiredExtensions', 'requiredFeatures', 'style', 'systemLanguage', 'transform', 'xml:base', 'xml:lang', 'xml:space'],
        clipPath: ['class', 'clipPathUnits', 'externalResourcesRequired', 'id', 'requiredExtensions', 'requiredFeatures', 'style', 'systemLanguage', 'transform', 'xml:base', 'xml:lang', 'xml:space'],
        'color-profile': ['id', 'local', 'name', 'rendering-intent', 'xlink:actuate', 'xlink:arcrole', 'xlink:href', 'xlink:role', 'xlink:show', 'xlink:title', 'xlink:type', 'xml:base', 'xml:lang', 'xml:space'],
        cursor: ['externalResourcesRequired', 'id', 'requiredExtensions', 'requiredFeatures', 'systemLanguage', 'x', 'xlink:actuate', 'xlink:arcrole', 'xlink:href', 'xlink:role', 'xlink:show', 'xlink:title', 'xlink:type', 'xml:base', 'xml:lang', 'xml:space', 'y'],
        defs: ['class', 'externalResourcesRequired', 'id', 'onactivate', 'onclick', 'onfocusin', 'onfocusout', 'onload', 'onmousedown', 'onmousemove', 'onmouseout', 'onmouseover', 'onmouseup', 'requiredExtensions', 'requiredFeatures', 'style', 'systemLanguage', 'transform', 'xml:base', 'xml:lang', 'xml:space'],
        desc: ['class', 'id', 'style', 'xml:base', 'xml:lang', 'xml:space'],
        ellipse: ['class', 'cx', 'cy', 'externalResourcesRequired', 'id', 'onactivate', 'onclick', 'onfocusin', 'onfocusout', 'onload', 'onmousedown', 'onmousemove', 'onmouseout', 'onmouseover', 'onmouseup', 'requiredExtensions', 'requiredFeatures', 'rx', 'ry', 'style', 'systemLanguage', 'transform', 'xml:base', 'xml:lang', 'xml:space'],
        feBlend: ['class', 'height', 'id', 'in', 'in2', 'mode', 'result', 'style', 'width', 'x', 'xml:base', 'xml:lang', 'xml:space', 'y'],
        feColorMatrix: ['class', 'height', 'id', 'in', 'result', 'style', 'type', 'values', 'width', 'x', 'xml:base', 'xml:lang', 'xml:space', 'y'],
        feComponentTransfer: ['class', 'height', 'id', 'in', 'result', 'style', 'width', 'x', 'xml:base', 'xml:lang', 'xml:space', 'y'],
        feComposite: ['class', 'height', 'id', 'in', 'in2', 'k1', 'k2', 'k3', 'k4', 'operator', 'result', 'style', 'width', 'x', 'xml:base', 'xml:lang', 'xml:space', 'y'],
        feConvolveMatrix: ['bias', 'class', 'divisor', 'edgeMode', 'height', 'id', 'in', 'kernelMatrix', 'kernelUnitLength', 'order', 'preserveAlpha', 'result', 'style', 'targetX', 'targetY', 'width', 'x', 'xml:base', 'xml:lang', 'xml:space', 'y'],
        feDiffuseLighting: ['class', 'diffuseConstant', 'height', 'id', 'in', 'kernelUnitLength', 'result', 'style', 'surfaceScale', 'width', 'x', 'xml:base', 'xml:lang', 'xml:space', 'y'],
        feDisplacementMap: ['class', 'height', 'id', 'in', 'in2', 'result', 'scale', 'style', 'width', 'x', 'xChannelSelector', 'xml:base', 'xml:lang', 'xml:space', 'y', 'yChannelSelector'],
        feDistantLight: ['azimuth', 'elevation', 'id', 'xml:base', 'xml:lang', 'xml:space'],
        feFlood: ['class', 'height', 'id', 'result', 'style', 'width', 'x', 'xml:base', 'xml:lang', 'xml:space', 'y'],
        feFuncA: ['amplitude', 'exponent', 'id', 'intercept', 'offset', 'slope', 'tableValues', 'type', 'xml:base', 'xml:lang', 'xml:space'],
        feFuncB: ['amplitude', 'exponent', 'id', 'intercept', 'offset', 'slope', 'tableValues', 'type', 'xml:base', 'xml:lang', 'xml:space'],
        feFuncG: ['amplitude', 'exponent', 'id', 'intercept', 'offset', 'slope', 'tableValues', 'type', 'xml:base', 'xml:lang', 'xml:space'],
        feFuncR: ['amplitude', 'exponent', 'id', 'intercept', 'offset', 'slope', 'tableValues', 'type', 'xml:base', 'xml:lang', 'xml:space'],
        feGaussianBlur: ['class', 'height', 'id', 'in', 'result', 'stdDeviation', 'style', 'width', 'x', 'xml:base', 'xml:lang', 'xml:space', 'y'],
        feImage: ['class', 'externalResourcesRequired', 'height', 'id', 'preserveAspectRatio', 'result', 'style', 'width', 'x', 'xlink:actuate', 'xlink:arcrole', 'xlink:href', 'xlink:role', 'xlink:show', 'xlink:title', 'xlink:type', 'xml:base', 'xml:lang', 'xml:space', 'y'],
        feMerge: ['class', 'height', 'id', 'result', 'style', 'width', 'x', 'xml:base', 'xml:lang', 'xml:space', 'y'],
        feMergeNode: ['id', 'xml:base', 'xml:lang', 'xml:space'],
        feMorphology: ['class', 'height', 'id', 'in', 'operator', 'radius', 'result', 'style', 'width', 'x', 'xml:base', 'xml:lang', 'xml:space', 'y'],
        feOffset: ['class', 'dx', 'dy', 'height', 'id', 'in', 'result', 'style', 'width', 'x', 'xml:base', 'xml:lang', 'xml:space', 'y'],
        fePointLight: ['id', 'x', 'xml:base', 'xml:lang', 'xml:space', 'y', 'z'],
        feSpecularLighting: ['class', 'height', 'id', 'in', 'kernelUnitLength', 'result', 'specularConstant', 'specularExponent', 'style', 'surfaceScale', 'width', 'x', 'xml:base', 'xml:lang', 'xml:space', 'y'],
        feSpotLight: ['id', 'limitingConeAngle', 'pointsAtX', 'pointsAtY', 'pointsAtZ', 'specularExponent', 'x', 'xml:base', 'xml:lang', 'xml:space', 'y', 'z'],
        feTile: ['class', 'height', 'id', 'in', 'result', 'style', 'width', 'x', 'xml:base', 'xml:lang', 'xml:space', 'y'],
        feTurbulence: ['baseFrequency', 'class', 'height', 'id', 'numOctaves', 'result', 'seed', 'stitchTiles', 'style', 'type', 'width', 'x', 'xml:base', 'xml:lang', 'xml:space', 'y'],
        filter: ['class', 'externalResourcesRequired', 'filterRes', 'filterUnits', 'height', 'id', 'primitiveUnits', 'style', 'width', 'x', 'xlink:actuate', 'xlink:arcrole', 'xlink:href', 'xlink:role', 'xlink:show', 'xlink:title', 'xlink:type', 'xml:base', 'xml:lang', 'xml:space', 'y'],
        font: ['class', 'externalResourcesRequired', 'horiz-adv-x', 'horiz-origin-x', 'horiz-origin-y', 'id', 'style', 'vert-adv-y', 'vert-origin-x', 'vert-origin-y', 'xml:base', 'xml:lang', 'xml:space'],
        'font-face': ['accent-height', 'alphabetic', 'ascent', 'bbox', 'cap-height', 'descent', 'font-family', 'font-size', 'font-stretch', 'font-style', 'font-variant', 'font-weight', 'hanging', 'id', 'ideographic', 'mathematical', 'overline-position', 'overline-thickness', 'panose-1', 'slope', 'stemh', 'stemv', 'strikethrough-position', 'strikethrough-thickness', 'underline-position', 'underline-thickness', 'unicode-range', 'units-per-em', 'v-alphabetic', 'v-hanging', 'v-ideographic', 'v-mathematical', 'widths', 'x-height', 'xml:base', 'xml:lang', 'xml:space'],
        'font-face-format': ['id', 'string', 'xml:base', 'xml:lang', 'xml:space'],
        'font-face-name': ['id', 'name', 'xml:base', 'xml:lang', 'xml:space'],
        'font-face-src': ['id', 'xml:base', 'xml:lang', 'xml:space'],
        'font-face-uri': ['id', 'xlink:actuate', 'xlink:arcrole', 'xlink:href', 'xlink:role', 'xlink:show', 'xlink:title', 'xlink:type', 'xml:base', 'xml:lang', 'xml:space'],
        foreignObject: ['class', 'externalResourcesRequired', 'height', 'id', 'onactivate', 'onclick', 'onfocusin', 'onfocusout', 'onload', 'onmousedown', 'onmousemove', 'onmouseout', 'onmouseover', 'onmouseup', 'requiredExtensions', 'requiredFeatures', 'style', 'systemLanguage', 'transform', 'width', 'x', 'xml:base', 'xml:lang', 'xml:space', 'y'],
        g: ['class', 'externalResourcesRequired', 'id', 'onactivate', 'onclick', 'onfocusin', 'onfocusout', 'onload', 'onmousedown', 'onmousemove', 'onmouseout', 'onmouseover', 'onmouseup', 'requiredExtensions', 'requiredFeatures', 'style', 'systemLanguage', 'transform', 'xml:base', 'xml:lang', 'xml:space'],
        glyph: ['arabic-form', 'class', 'd', 'glyph-name', 'horiz-adv-x', 'id', 'lang', 'orientation', 'style', 'unicode', 'vert-adv-y', 'vert-origin-x', 'vert-origin-y', 'xml:base', 'xml:lang', 'xml:space'],
        glyphRef: ['class', 'dx', 'dy', 'format', 'glyphRef', 'id', 'style', 'x', 'xlink:actuate', 'xlink:arcrole', 'xlink:href', 'xlink:role', 'xlink:show', 'xlink:title', 'xlink:type', 'xml:base', 'xml:lang', 'xml:space', 'y'],
        hkern: ['g1', 'g2', 'id', 'k', 'u1', 'u2', 'xml:base', 'xml:lang', 'xml:space'],
        image: ['class', 'externalResourcesRequired', 'height', 'id', 'onactivate', 'onclick', 'onfocusin', 'onfocusout', 'onload', 'onmousedown', 'onmousemove', 'onmouseout', 'onmouseover', 'onmouseup', 'preserveAspectRatio', 'requiredExtensions', 'requiredFeatures', 'style', 'systemLanguage', 'transform', 'width', 'x', 'xlink:actuate', 'xlink:arcrole', 'xlink:href', 'xlink:role', 'xlink:show', 'xlink:title', 'xlink:type', 'xml:base', 'xml:lang', 'xml:space', 'y'],
        line: ['class', 'externalResourcesRequired', 'id', 'onactivate', 'onclick', 'onfocusin', 'onfocusout', 'onload', 'onmousedown', 'onmousemove', 'onmouseout', 'onmouseover', 'onmouseup', 'requiredExtensions', 'requiredFeatures', 'style', 'systemLanguage', 'transform', 'x1', 'x2', 'xml:base', 'xml:lang', 'xml:space', 'y1', 'y2'],
        linearGradient: ['class', 'externalResourcesRequired', 'gradientTransform', 'gradientUnits', 'id', 'spreadMethod', 'style', 'x1', 'x2', 'xlink:arcrole', 'xlink:href', 'xlink:role', 'xlink:title', 'xlink:type', 'xml:base', 'xml:lang', 'xml:space', 'y1', 'y2'],
        marker: ['class', 'externalResourcesRequired', 'id', 'markerHeight', 'markerUnits', 'markerWidth', 'orient', 'preserveAspectRatio', 'refX', 'refY', 'style', 'viewBox', 'xml:base', 'xml:lang', 'xml:space'],
        mask: ['class', 'externalResourcesRequired', 'height', 'id', 'maskContentUnits', 'maskUnits', 'requiredExtensions', 'requiredFeatures', 'style', 'systemLanguage', 'width', 'x', 'xml:base', 'xml:lang', 'xml:space', 'y'],
        metadata: ['id', 'xml:base', 'xml:lang', 'xml:space'],
        'missing-glyph': ['class', 'd', 'horiz-adv-x', 'id', 'style', 'vert-adv-y', 'vert-origin-x', 'vert-origin-y', 'xml:base', 'xml:lang', 'xml:space'],
        mpath: ['externalResourcesRequired', 'id', 'xlink:actuate', 'xlink:arcrole', 'xlink:href', 'xlink:role', 'xlink:show', 'xlink:title', 'xlink:type', 'xml:base', 'xml:lang', 'xml:space'],
        path: ['class', 'd', 'externalResourcesRequired', 'id', 'onactivate', 'onclick', 'onfocusin', 'onfocusout', 'onload', 'onmousedown', 'onmousemove', 'onmouseout', 'onmouseover', 'onmouseup', 'pathLength', 'requiredExtensions', 'requiredFeatures', 'style', 'systemLanguage', 'transform', 'xml:base', 'xml:lang', 'xml:space'],
        pattern: ['class', 'externalResourcesRequired', 'height', 'id', 'patternContentUnits', 'patternTransform', 'patternUnits', 'preserveAspectRatio', 'requiredExtensions', 'requiredFeatures', 'style', 'systemLanguage', 'viewBox', 'width', 'x', 'xlink:actuate', 'xlink:arcrole', 'xlink:href', 'xlink:role', 'xlink:show', 'xlink:title', 'xlink:type', 'xml:base', 'xml:lang', 'xml:space', 'y'],
        polygon: ['class', 'externalResourcesRequired', 'id', 'onactivate', 'onclick', 'onfocusin', 'onfocusout', 'onload', 'onmousedown', 'onmousemove', 'onmouseout', 'onmouseover', 'onmouseup', 'points', 'requiredExtensions', 'requiredFeatures', 'style', 'systemLanguage', 'transform', 'xml:base', 'xml:lang', 'xml:space'],
        polyline: ['class', 'externalResourcesRequired', 'id', 'onactivate', 'onclick', 'onfocusin', 'onfocusout', 'onload', 'onmousedown', 'onmousemove', 'onmouseout', 'onmouseover', 'onmouseup', 'points', 'requiredExtensions', 'requiredFeatures', 'style', 'systemLanguage', 'transform', 'xml:base', 'xml:lang', 'xml:space'],
        radialGradient: ['class', 'cx', 'cy', 'externalResourcesRequired', 'fx', 'fy', 'gradientTransform', 'gradientUnits', 'id', 'r', 'spreadMethod', 'style', 'xlink:arcrole', 'xlink:href', 'xlink:role', 'xlink:title', 'xlink:type', 'xml:base', 'xml:lang', 'xml:space'],
        rect: ['class', 'externalResourcesRequired', 'height', 'id', 'onactivate', 'onclick', 'onfocusin', 'onfocusout', 'onload', 'onmousedown', 'onmousemove', 'onmouseout', 'onmouseover', 'onmouseup', 'requiredExtensions', 'requiredFeatures', 'rx', 'ry', 'style', 'systemLanguage', 'transform', 'width', 'x', 'xml:base', 'xml:lang', 'xml:space', 'y'],
        script: ['externalResourcesRequired', 'id', 'type', 'xlink:actuate', 'xlink:arcrole', 'xlink:href', 'xlink:role', 'xlink:show', 'xlink:title', 'xlink:type', 'xml:base', 'xml:lang', 'xml:space'],
        set: ['attributeName', 'attributeType', 'begin', 'dur', 'end', 'externalResourcesRequired', 'fill', 'id', 'max', 'min', 'onbegin', 'onend', 'onload', 'onrepeat', 'repeatCount', 'repeatDur', 'requiredExtensions', 'requiredFeatures', 'restart', 'systemLanguage', 'to', 'xlink:actuate', 'xlink:arcrole', 'xlink:href', 'xlink:role', 'xlink:show', 'xlink:title', 'xlink:type', 'xml:base', 'xml:lang', 'xml:space'],
        stop: ['class', 'id', 'offset', 'style', 'xml:base', 'xml:lang', 'xml:space'],
        style: ['id', 'media', 'title', 'type', 'xml:base', 'xml:lang', 'xml:space'],
        svg: ['baseProfile', 'class', 'contentScriptType', 'contentStyleType', 'externalResourcesRequired', 'height', 'id', 'onabort', 'onactivate', 'onclick', 'onerror', 'onfocusin', 'onfocusout', 'onload', 'onmousedown', 'onmousemove', 'onmouseout', 'onmouseover', 'onmouseup', 'onresize', 'onscroll', 'onunload', 'onzoom', 'preserveAspectRatio', 'requiredExtensions', 'requiredFeatures', 'style', 'systemLanguage', 'version', 'viewBox', 'width', 'x', 'xml:base', 'xml:lang', 'xml:space', 'y', 'zoomAndPan'],
        switch: ['class', 'externalResourcesRequired', 'id', 'onactivate', 'onclick', 'onfocusin', 'onfocusout', 'onload', 'onmousedown', 'onmousemove', 'onmouseout', 'onmouseover', 'onmouseup', 'requiredExtensions', 'requiredFeatures', 'style', 'systemLanguage', 'transform', 'xml:base', 'xml:lang', 'xml:space'],
        symbol: ['class', 'externalResourcesRequired', 'id', 'onactivate', 'onclick', 'onfocusin', 'onfocusout', 'onload', 'onmousedown', 'onmousemove', 'onmouseout', 'onmouseover', 'onmouseup', 'preserveAspectRatio', 'style', 'viewBox', 'xml:base', 'xml:lang', 'xml:space'],
        text: ['class', 'dx', 'dy', 'externalResourcesRequired', 'id', 'lengthAdjust', 'onactivate', 'onclick', 'onfocusin', 'onfocusout', 'onload', 'onmousedown', 'onmousemove', 'onmouseout', 'onmouseover', 'onmouseup', 'requiredExtensions', 'requiredFeatures', 'rotate', 'style', 'systemLanguage', 'textLength', 'transform', 'x', 'xml:base', 'xml:lang', 'xml:space', 'y'],
        textPath: ['class', 'externalResourcesRequired', 'id', 'lengthAdjust', 'method', 'onactivate', 'onclick', 'onfocusin', 'onfocusout', 'onload', 'onmousedown', 'onmousemove', 'onmouseout', 'onmouseover', 'onmouseup', 'requiredExtensions', 'requiredFeatures', 'spacing', 'startOffset', 'style', 'systemLanguage', 'textLength', 'xlink:arcrole', 'xlink:href', 'xlink:role', 'xlink:title', 'xlink:type', 'xml:base', 'xml:lang', 'xml:space'],
        title: ['class', 'id', 'style', 'xml:base', 'xml:lang', 'xml:space'],
        tref: ['class', 'dx', 'dy', 'externalResourcesRequired', 'id', 'lengthAdjust', 'onactivate', 'onclick', 'onfocusin', 'onfocusout', 'onload', 'onmousedown', 'onmousemove', 'onmouseout', 'onmouseover', 'onmouseup', 'requiredExtensions', 'requiredFeatures', 'rotate', 'style', 'systemLanguage', 'textLength', 'x', 'xlink:arcrole', 'xlink:href', 'xlink:role', 'xlink:title', 'xlink:type', 'xml:base', 'xml:lang', 'xml:space', 'y'],
        tspan: ['class', 'dx', 'dy', 'externalResourcesRequired', 'id', 'lengthAdjust', 'onactivate', 'onclick', 'onfocusin', 'onfocusout', 'onload', 'onmousedown', 'onmousemove', 'onmouseout', 'onmouseover', 'onmouseup', 'requiredExtensions', 'requiredFeatures', 'rotate', 'style', 'systemLanguage', 'textLength', 'x', 'xml:base', 'xml:lang', 'xml:space', 'y'],
        use: ['class', 'externalResourcesRequired', 'height', 'id', 'onactivate', 'onclick', 'onfocusin', 'onfocusout', 'onload', 'onmousedown', 'onmousemove', 'onmouseout', 'onmouseover', 'onmouseup', 'requiredExtensions', 'requiredFeatures', 'style', 'systemLanguage', 'transform', 'width', 'x', 'xlink:actuate', 'xlink:arcrole', 'xlink:href', 'xlink:role', 'xlink:show', 'xlink:title', 'xlink:type', 'xml:base', 'xml:lang', 'xml:space', 'y'],
        view: ['externalResourcesRequired', 'id', 'preserveAspectRatio', 'viewBox', 'viewTarget', 'xml:base', 'xml:lang', 'xml:space', 'zoomAndPan'],
        vkern: ['g1', 'g2', 'id', 'k', 'u1', 'u2', 'xml:base', 'xml:lang', 'xml:space'],
    };
    var svgPresentationElements = {
        'a': true,
        'altGlyph': true,
        'animate': true,
        'animateColor': true,
        'circle': true,
        'clipPath': true,
        'defs': true,
        'ellipse': true,
        'feBlend': true,
        'feColorMatrix': true,
        'feComponentTransfer': true,
        'feComposite': true,
        'feConvolveMatrix': true,
        'feDiffuseLighting': true,
        'feDisplacementMap': true,
        'feFlood': true,
        'feGaussianBlur': true,
        'feImage': true,
        'feMerge': true,
        'feMorphology': true,
        'feOffset': true,
        'feSpecularLighting': true,
        'feTile': true,
        'feTurbulence': true,
        'filter': true,
        'font': true,
        'foreignObject': true,
        'g': true,
        'glyph': true,
        'glyphRef': true,
        'image': true,
        'line': true,
        'linearGradient': true,
        'marker': true,
        'mask': true,
        'missing-glyph': true,
        'path': true,
        'pattern': true,
        'polygon': true,
        'polyline': true,
        'radialGradient': true,
        'rect': true,
        'stop': true,
        'svg': true,
        'switch': true,
        'symbol': true,
        'text': true,
        'textPath': true,
        'tref': true,
        'tspan': true,
        'use': true
    };
    var svgPresentationAttributes = {
        'alignment-baseline': true,
        'baseline-shift': true,
        'clip-path': true,
        'clip-rule': true,
        'clip': true,
        'color-interpolation-filters': true,
        'color-interpolation': true,
        'color-profile': true,
        'color-rendering': true,
        'color': true,
        'cursor': true,
        'direction': true,
        'display': true,
        'dominant-baseline': true,
        'enable-background': true,
        'fill-opacity': true,
        'fill-rule': true,
        'fill': true,
        'filter': true,
        'flood-color': true,
        'flood-opacity': true,
        'font-family': true,
        'font-size-adjust': true,
        'font-size': true,
        'font-stretch': true,
        'font-style': true,
        'font-variant': true,
        'font-weight': true,
        'glyph-orientation-horizontal': true,
        'glyph-orientation-vertical': true,
        'image-rendering': true,
        'kerning': true,
        'letter-spacing': true,
        'lighting-color': true,
        'marker-end': true,
        'marker-mid': true,
        'marker-start': true,
        'mask': true,
        'opacity': true,
        'overflow': true,
        'pointer-events': true,
        'shape-rendering': true,
        'stop-color': true,
        'stop-opacity': true,
        'stroke-dasharray': true,
        'stroke-dashoffset': true,
        'stroke-linecap': true,
        'stroke-linejoin': true,
        'stroke-miterlimit': true,
        'stroke-opacity': true,
        'stroke-width': true,
        'stroke': true,
        'text-anchor': true,
        'text-decoration': true,
        'text-rendering': true,
        'unicode-bidi': true,
        'visibility': true,
        'word-spacing': true,
        'writing-mode': true
    };
    function createElement(html) {
        var div = dom_1.DOM.createElement('div');
        div.innerHTML = html;
        return div.firstElementChild;
    }
    ;
    if (createElement('<svg><altGlyph /></svg>').firstElementChild.nodeName === 'altglyph' && svgElements.altGlyph) {
        svgElements.altglyph = svgElements.altGlyph;
        delete svgElements.altGlyph;
        svgElements.altglyphdef = svgElements.altGlyphDef;
        delete svgElements.altGlyphDef;
        svgElements.altglyphitem = svgElements.altGlyphItem;
        delete svgElements.altGlyphItem;
        svgElements.glyphref = svgElements.glyphRef;
        delete svgElements.glyphRef;
    }
    function register(container) {
        container.registerTransformer(svg_analyzer_1.ISVGAnalyzer, function (analyzer) {
            return Object.assign(analyzer, {
                isStandardSvgAttribute: function (node, attributeName) {
                    if (!(node instanceof SVGElement)) {
                        return false;
                    }
                    var nodeName = node.nodeName;
                    return svgPresentationElements[nodeName] && svgPresentationAttributes[attributeName]
                        || svgElements[nodeName] && svgElements[nodeName].indexOf(attributeName) !== -1;
                }
            });
        });
    }
    exports.register = register;
});



define('runtime/binding/array-change-records',["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    function isIndex(s) {
        return +s === s >>> 0;
    }
    function toNumber(s) {
        return +s;
    }
    function newSplice(index, removed, addedCount) {
        return {
            index: index,
            removed: removed,
            addedCount: addedCount
        };
    }
    var EDIT_LEAVE = 0;
    var EDIT_UPDATE = 1;
    var EDIT_ADD = 2;
    var EDIT_DELETE = 3;
    function ArraySplice() { }
    ArraySplice.prototype = {
        calcEditDistances: function (current, currentStart, currentEnd, old, oldStart, oldEnd) {
            var rowCount = oldEnd - oldStart + 1;
            var columnCount = currentEnd - currentStart + 1;
            var distances = new Array(rowCount);
            var north;
            var west;
            for (var i = 0; i < rowCount; ++i) {
                distances[i] = new Array(columnCount);
                distances[i][0] = i;
            }
            for (var j = 0; j < columnCount; ++j) {
                distances[0][j] = j;
            }
            for (var i = 1; i < rowCount; ++i) {
                for (var j = 1; j < columnCount; ++j) {
                    if (this.equals(current[currentStart + j - 1], old[oldStart + i - 1])) {
                        distances[i][j] = distances[i - 1][j - 1];
                    }
                    else {
                        north = distances[i - 1][j] + 1;
                        west = distances[i][j - 1] + 1;
                        distances[i][j] = north < west ? north : west;
                    }
                }
            }
            return distances;
        },
        spliceOperationsFromEditDistances: function (distances) {
            var i = distances.length - 1;
            var j = distances[0].length - 1;
            var current = distances[i][j];
            var edits = [];
            while (i > 0 || j > 0) {
                if (i === 0) {
                    edits.push(EDIT_ADD);
                    j--;
                    continue;
                }
                if (j === 0) {
                    edits.push(EDIT_DELETE);
                    i--;
                    continue;
                }
                var northWest = distances[i - 1][j - 1];
                var west = distances[i - 1][j];
                var north = distances[i][j - 1];
                var min = void 0;
                if (west < north) {
                    min = west < northWest ? west : northWest;
                }
                else {
                    min = north < northWest ? north : northWest;
                }
                if (min === northWest) {
                    if (northWest === current) {
                        edits.push(EDIT_LEAVE);
                    }
                    else {
                        edits.push(EDIT_UPDATE);
                        current = northWest;
                    }
                    i--;
                    j--;
                }
                else if (min === west) {
                    edits.push(EDIT_DELETE);
                    i--;
                    current = west;
                }
                else {
                    edits.push(EDIT_ADD);
                    j--;
                    current = north;
                }
            }
            edits.reverse();
            return edits;
        },
        calcSplices: function (current, currentStart, currentEnd, old, oldStart, oldEnd) {
            var prefixCount = 0;
            var suffixCount = 0;
            var minLength = Math.min(currentEnd - currentStart, oldEnd - oldStart);
            if (currentStart === 0 && oldStart === 0) {
                prefixCount = this.sharedPrefix(current, old, minLength);
            }
            if (currentEnd === current.length && oldEnd === old.length) {
                suffixCount = this.sharedSuffix(current, old, minLength - prefixCount);
            }
            currentStart += prefixCount;
            oldStart += prefixCount;
            currentEnd -= suffixCount;
            oldEnd -= suffixCount;
            if ((currentEnd - currentStart) === 0 && (oldEnd - oldStart) === 0) {
                return [];
            }
            if (currentStart === currentEnd) {
                var splice_1 = newSplice(currentStart, [], 0);
                while (oldStart < oldEnd) {
                    splice_1.removed.push(old[oldStart++]);
                }
                return [splice_1];
            }
            else if (oldStart === oldEnd) {
                return [newSplice(currentStart, [], currentEnd - currentStart)];
            }
            var ops = this.spliceOperationsFromEditDistances(this.calcEditDistances(current, currentStart, currentEnd, old, oldStart, oldEnd));
            var splice = undefined;
            var splices = [];
            var index = currentStart;
            var oldIndex = oldStart;
            for (var i = 0; i < ops.length; ++i) {
                switch (ops[i]) {
                    case EDIT_LEAVE:
                        if (splice) {
                            splices.push(splice);
                            splice = undefined;
                        }
                        index++;
                        oldIndex++;
                        break;
                    case EDIT_UPDATE:
                        if (!splice) {
                            splice = newSplice(index, [], 0);
                        }
                        splice.addedCount++;
                        index++;
                        splice.removed.push(old[oldIndex]);
                        oldIndex++;
                        break;
                    case EDIT_ADD:
                        if (!splice) {
                            splice = newSplice(index, [], 0);
                        }
                        splice.addedCount++;
                        index++;
                        break;
                    case EDIT_DELETE:
                        if (!splice) {
                            splice = newSplice(index, [], 0);
                        }
                        splice.removed.push(old[oldIndex]);
                        oldIndex++;
                        break;
                }
            }
            if (splice) {
                splices.push(splice);
            }
            return splices;
        },
        sharedPrefix: function (current, old, searchLength) {
            for (var i = 0; i < searchLength; ++i) {
                if (!this.equals(current[i], old[i])) {
                    return i;
                }
            }
            return searchLength;
        },
        sharedSuffix: function (current, old, searchLength) {
            var index1 = current.length;
            var index2 = old.length;
            var count = 0;
            while (count < searchLength && this.equals(current[--index1], old[--index2])) {
                count++;
            }
            return count;
        },
        calculateSplices: function (current, previous) {
            return this.calcSplices(current, 0, current.length, previous, 0, previous.length);
        },
        equals: function (currentValue, previousValue) {
            return currentValue === previousValue;
        }
    };
    var arraySplice = new ArraySplice();
    function calcSplices(current, currentStart, currentEnd, old, oldStart, oldEnd) {
        return arraySplice.calcSplices(current, currentStart, currentEnd, old, oldStart, oldEnd);
    }
    exports.calcSplices = calcSplices;
    function intersect(start1, end1, start2, end2) {
        if (end1 < start2 || end2 < start1) {
            return -1;
        }
        if (end1 === start2 || end2 === start1) {
            return 0;
        }
        if (start1 < start2) {
            if (end1 < end2) {
                return end1 - start2;
            }
            return end2 - start2;
        }
        if (end2 < end1) {
            return end2 - start1;
        }
        return end1 - start1;
    }
    function mergeSplice(splices, index, removed, addedCount) {
        var splice = newSplice(index, removed, addedCount);
        var inserted = false;
        var insertionOffset = 0;
        for (var i = 0; i < splices.length; i++) {
            var current = splices[i];
            current.index += insertionOffset;
            if (inserted) {
                continue;
            }
            var intersectCount = intersect(splice.index, splice.index + splice.removed.length, current.index, current.index + current.addedCount);
            if (intersectCount >= 0) {
                splices.splice(i, 1);
                i--;
                insertionOffset -= current.addedCount - current.removed.length;
                splice.addedCount += current.addedCount - intersectCount;
                var deleteCount = splice.removed.length +
                    current.removed.length - intersectCount;
                if (!splice.addedCount && !deleteCount) {
                    inserted = true;
                }
                else {
                    var currentRemoved = current.removed;
                    if (splice.index < current.index) {
                        var prepend = splice.removed.slice(0, current.index - splice.index);
                        Array.prototype.push.apply(prepend, currentRemoved);
                        currentRemoved = prepend;
                    }
                    if (splice.index + splice.removed.length > current.index + current.addedCount) {
                        var append = splice.removed.slice(current.index + current.addedCount - splice.index);
                        Array.prototype.push.apply(currentRemoved, append);
                    }
                    splice.removed = currentRemoved;
                    if (current.index < splice.index) {
                        splice.index = current.index;
                    }
                }
            }
            else if (splice.index < current.index) {
                inserted = true;
                splices.splice(i, 0, splice);
                i++;
                var offset = splice.addedCount - splice.removed.length;
                current.index += offset;
                insertionOffset += offset;
            }
        }
        if (!inserted) {
            splices.push(splice);
        }
    }
    exports.mergeSplice = mergeSplice;
    function createInitialSplices(array, changeRecords) {
        var splices = [];
        for (var i = 0; i < changeRecords.length; i++) {
            var record = changeRecords[i];
            switch (record.type) {
                case 'splice':
                    mergeSplice(splices, record.index, record.removed.slice(), record.addedCount);
                    break;
                case 'add':
                case 'update':
                case 'delete':
                    if (!isIndex(record.name)) {
                        continue;
                    }
                    var index = toNumber(record.name);
                    if (index < 0) {
                        continue;
                    }
                    mergeSplice(splices, index, [record.oldValue], record.type === 'delete' ? 0 : 1);
                    break;
                default:
                    console.error('Unexpected record type: ' + JSON.stringify(record));
                    break;
            }
        }
        return splices;
    }
    function projectArraySplices(array, changeRecords) {
        var splices = [];
        createInitialSplices(array, changeRecords).forEach(function (splice) {
            if (splice.addedCount === 1 && splice.removed.length === 1) {
                if (splice.removed[0] !== array[splice.index]) {
                    splices.push(splice);
                }
                return;
            }
            splices = splices.concat(calcSplices(array, splice.index, splice.index + splice.addedCount, splice.removed, 0, splice.removed.length));
        });
        return splices;
    }
    exports.projectArraySplices = projectArraySplices;
});



var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
define('runtime/binding/array-observation',["require", "exports", "./collection-observation"], function (require, exports, collection_observation_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var pop = Array.prototype.pop;
    var push = Array.prototype.push;
    var reverse = Array.prototype.reverse;
    var shift = Array.prototype.shift;
    var sort = Array.prototype.sort;
    var splice = Array.prototype.splice;
    var unshift = Array.prototype.unshift;
    Array.prototype.pop = function () {
        var notEmpty = this.length > 0;
        var methodCallResult = pop.apply(this, arguments);
        if (notEmpty && this.__array_observer__ !== undefined) {
            this.__array_observer__.addChangeRecord({
                type: 'delete',
                object: this,
                name: this.length,
                oldValue: methodCallResult
            });
        }
        return methodCallResult;
    };
    Array.prototype.push = function () {
        var methodCallResult = push.apply(this, arguments);
        if (this.__array_observer__ !== undefined) {
            this.__array_observer__.addChangeRecord({
                type: 'splice',
                object: this,
                index: this.length - arguments.length,
                removed: [],
                addedCount: arguments.length
            });
        }
        return methodCallResult;
    };
    Array.prototype.reverse = function () {
        var oldArray;
        if (this.__array_observer__ !== undefined) {
            this.__array_observer__.flushChangeRecords();
            oldArray = this.slice();
        }
        var methodCallResult = reverse.apply(this, arguments);
        if (this.__array_observer__ !== undefined) {
            this.__array_observer__.reset(oldArray);
        }
        return methodCallResult;
    };
    Array.prototype.shift = function () {
        var notEmpty = this.length > 0;
        var methodCallResult = shift.apply(this, arguments);
        if (notEmpty && this.__array_observer__ !== undefined) {
            this.__array_observer__.addChangeRecord({
                type: 'delete',
                object: this,
                name: 0,
                oldValue: methodCallResult
            });
        }
        return methodCallResult;
    };
    Array.prototype.sort = function () {
        var oldArray;
        if (this.__array_observer__ !== undefined) {
            this.__array_observer__.flushChangeRecords();
            oldArray = this.slice();
        }
        var methodCallResult = sort.apply(this, arguments);
        if (this.__array_observer__ !== undefined) {
            this.__array_observer__.reset(oldArray);
        }
        return methodCallResult;
    };
    Array.prototype.splice = function () {
        var methodCallResult = splice.apply(this, arguments);
        if (this.__array_observer__ !== undefined) {
            this.__array_observer__.addChangeRecord({
                type: 'splice',
                object: this,
                index: +arguments[0],
                removed: methodCallResult,
                addedCount: arguments.length > 2 ? arguments.length - 2 : 0
            });
        }
        return methodCallResult;
    };
    Array.prototype.unshift = function () {
        var methodCallResult = unshift.apply(this, arguments);
        if (this.__array_observer__ !== undefined) {
            this.__array_observer__.addChangeRecord({
                type: 'splice',
                object: this,
                index: 0,
                removed: [],
                addedCount: arguments.length
            });
        }
        return methodCallResult;
    };
    function getArrayObserver(taskQueue, array) {
        var observer = array.__array_observer__;
        if (!observer) {
            Reflect.defineProperty(array, '__array_observer__', {
                value: observer = new ModifyArrayObserver(taskQueue, array),
                enumerable: false, configurable: false
            });
        }
        return observer;
    }
    exports.getArrayObserver = getArrayObserver;
    var ModifyArrayObserver = (function (_super) {
        __extends(ModifyArrayObserver, _super);
        function ModifyArrayObserver(taskQueue, array) {
            return _super.call(this, taskQueue, array) || this;
        }
        return ModifyArrayObserver;
    }(collection_observation_1.ModifyCollectionObserver));
});



define('runtime/binding/ast',["require", "exports", "./binding-context", "./signaler", "./binding-flags", "./binding-behavior", "./value-converter"], function (require, exports, binding_context_1, signaler_1, binding_flags_1, binding_behavior_1, value_converter_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var BindingBehavior = (function () {
        function BindingBehavior(expression, name, args) {
            this.expression = expression;
            this.name = name;
            this.args = args;
        }
        BindingBehavior.prototype.evaluate = function (scope, locator, flags) {
            return this.expression.evaluate(scope, locator, flags);
        };
        BindingBehavior.prototype.assign = function (scope, value, locator, flags) {
            return this.expression.assign(scope, value, locator, flags);
        };
        BindingBehavior.prototype.connect = function (binding, scope, flags) {
            this.expression.connect(binding, scope, flags);
        };
        BindingBehavior.prototype.bind = function (binding, scope, flags) {
            if (this.expression.expression && this.expression.bind) {
                this.expression.bind(binding, scope, flags);
            }
            var behaviorKey = binding_behavior_1.BindingBehaviorResource.key(this.name);
            var behavior = binding.locator.get(behaviorKey);
            if (!behavior) {
                throw new Error("No BindingBehavior named \"" + this.name + "\" was found!");
            }
            if (binding[behaviorKey]) {
                throw new Error("A binding behavior named \"" + this.name + "\" has already been applied to \"" + this.expression + "\"");
            }
            binding[behaviorKey] = behavior;
            behavior.bind.apply(behavior, [binding, scope].concat(evalList(scope, this.args, binding.locator, flags)));
        };
        BindingBehavior.prototype.unbind = function (binding, scope, flags) {
            var behaviorKey = binding_behavior_1.BindingBehaviorResource.key(this.name);
            binding[behaviorKey].unbind(binding, scope, flags);
            binding[behaviorKey] = null;
            if (this.expression.expression && this.expression.unbind) {
                this.expression.unbind(binding, scope, flags);
            }
        };
        return BindingBehavior;
    }());
    exports.BindingBehavior = BindingBehavior;
    var ValueConverter = (function () {
        function ValueConverter(expression, name, args) {
            this.expression = expression;
            this.name = name;
            this.args = args;
            this.allArgs = [expression].concat(args);
        }
        ValueConverter.prototype.evaluate = function (scope, locator, flags) {
            var converterKey = value_converter_1.ValueConverterResource.key(this.name);
            var converter = locator.get(converterKey);
            if (!converter) {
                throw new Error("No ValueConverter named \"" + this.name + "\" was found!");
            }
            if ('toView' in converter) {
                return converter.toView.apply(converter, evalList(scope, this.allArgs, locator, flags));
            }
            return this.allArgs[0].evaluate(scope, locator, flags);
        };
        ValueConverter.prototype.assign = function (scope, value, locator, flags) {
            var converterKey = value_converter_1.ValueConverterResource.key(this.name);
            var converter = locator.get(converterKey);
            if (!converter) {
                throw new Error("No ValueConverter named \"" + this.name + "\" was found!");
            }
            if ('fromView' in converter) {
                value = converter.fromView.apply(converter, [value].concat(evalList(scope, this.args, locator, flags)));
            }
            return this.allArgs[0].assign(scope, value, locator, flags);
        };
        ValueConverter.prototype.connect = function (binding, scope, flags) {
            var expressions = this.allArgs;
            var i = expressions.length;
            while (i--) {
                expressions[i].connect(binding, scope, flags);
            }
            var converterKey = value_converter_1.ValueConverterResource.key(this.name);
            var converter = binding.locator.get(converterKey);
            if (!converter) {
                throw new Error("No ValueConverter named \"" + this.name + "\" was found!");
            }
            var signals = converter.signals;
            if (signals === undefined) {
                return;
            }
            var signaler = binding.locator.get(signaler_1.ISignaler);
            i = signals.length;
            while (i--) {
                signaler.addSignalListener(signals[i], binding);
            }
        };
        ValueConverter.prototype.unbind = function (binding, scope, flags) {
            var converterKey = value_converter_1.ValueConverterResource.key(this.name);
            var converter = binding.locator.get(converterKey);
            var signals = converter.signals;
            if (signals === undefined) {
                return;
            }
            var signaler = binding.locator.get(signaler_1.ISignaler);
            var i = signals.length;
            while (i--) {
                signaler.removeSignalListener(signals[i], binding);
            }
        };
        return ValueConverter;
    }());
    exports.ValueConverter = ValueConverter;
    var Assign = (function () {
        function Assign(target, value) {
            this.target = target;
            this.value = value;
        }
        Assign.prototype.evaluate = function (scope, locator, flags) {
            return this.target.assign(scope, this.value.evaluate(scope, locator, flags), locator, flags);
        };
        Assign.prototype.connect = function (binding, scope, flags) { };
        Assign.prototype.assign = function (scope, value, locator, flags) {
            this.value.assign(scope, value, locator, flags);
            this.target.assign(scope, value, locator, flags);
        };
        return Assign;
    }());
    exports.Assign = Assign;
    var Conditional = (function () {
        function Conditional(condition, yes, no) {
            this.condition = condition;
            this.yes = yes;
            this.no = no;
        }
        Conditional.prototype.evaluate = function (scope, locator, flags) {
            return (!!this.condition.evaluate(scope, locator, flags))
                ? this.yes.evaluate(scope, locator, flags)
                : this.no.evaluate(scope, locator, flags);
        };
        Conditional.prototype.connect = function (binding, scope, flags) {
            this.condition.connect(binding, scope, flags);
            if (this.condition.evaluate(scope, null, flags)) {
                this.yes.connect(binding, scope, flags);
            }
            else {
                this.no.connect(binding, scope, flags);
            }
        };
        return Conditional;
    }());
    exports.Conditional = Conditional;
    var AccessThis = (function () {
        function AccessThis(ancestor) {
            if (ancestor === void 0) { ancestor = 0; }
            this.ancestor = ancestor;
        }
        AccessThis.prototype.evaluate = function (scope, locator, flags) {
            var oc = scope.overrideContext;
            var i = this.ancestor;
            while (i-- && oc) {
                oc = oc.parentOverrideContext;
            }
            return i < 1 && oc ? oc.bindingContext : undefined;
        };
        AccessThis.prototype.connect = function (binding, scope, flags) { };
        return AccessThis;
    }());
    exports.AccessThis = AccessThis;
    var AccessScope = (function () {
        function AccessScope(name, ancestor) {
            if (ancestor === void 0) { ancestor = 0; }
            this.name = name;
            this.ancestor = ancestor;
        }
        AccessScope.prototype.evaluate = function (scope, locator, flags) {
            var context = binding_context_1.BindingContext.get(scope, this.name, this.ancestor);
            return context[this.name];
        };
        AccessScope.prototype.assign = function (scope, value) {
            var context = binding_context_1.BindingContext.get(scope, this.name, this.ancestor);
            return context ? (context[this.name] = value) : undefined;
        };
        AccessScope.prototype.connect = function (binding, scope, flags) {
            var context = binding_context_1.BindingContext.get(scope, this.name, this.ancestor);
            binding.observeProperty(context, this.name);
        };
        return AccessScope;
    }());
    exports.AccessScope = AccessScope;
    var AccessMember = (function () {
        function AccessMember(object, name) {
            this.object = object;
            this.name = name;
        }
        AccessMember.prototype.evaluate = function (scope, locator, flags) {
            var instance = this.object.evaluate(scope, locator, flags);
            return instance === null || instance === undefined ? instance : instance[this.name];
        };
        AccessMember.prototype.assign = function (scope, value, locator, flags) {
            var instance = this.object.evaluate(scope, locator, flags);
            if (instance === null || instance === undefined) {
                instance = {};
                this.object.assign(scope, instance, locator, flags);
            }
            instance[this.name] = value;
            return value;
        };
        AccessMember.prototype.connect = function (binding, scope, flags) {
            this.object.connect(binding, scope, flags);
            var obj = this.object.evaluate(scope, null, flags);
            if (obj) {
                binding.observeProperty(obj, this.name);
            }
        };
        return AccessMember;
    }());
    exports.AccessMember = AccessMember;
    var AccessKeyed = (function () {
        function AccessKeyed(object, key) {
            this.object = object;
            this.key = key;
        }
        AccessKeyed.prototype.evaluate = function (scope, locator, flags) {
            var instance = this.object.evaluate(scope, locator, flags);
            var lookup = this.key.evaluate(scope, locator, flags);
            return getKeyed(instance, lookup);
        };
        AccessKeyed.prototype.assign = function (scope, value, locator, flags) {
            var instance = this.object.evaluate(scope, locator, flags);
            var lookup = this.key.evaluate(scope, locator, flags);
            return setKeyed(instance, lookup, value);
        };
        AccessKeyed.prototype.connect = function (binding, scope, flags) {
            this.object.connect(binding, scope, flags);
            var obj = this.object.evaluate(scope, null, flags);
            if (obj instanceof Object) {
                this.key.connect(binding, scope, flags);
                var key = this.key.evaluate(scope, null, flags);
                if (key !== null && key !== undefined
                    && !(Array.isArray(obj) && typeof (key) === 'number')) {
                    binding.observeProperty(obj, key);
                }
            }
        };
        return AccessKeyed;
    }());
    exports.AccessKeyed = AccessKeyed;
    var CallScope = (function () {
        function CallScope(name, args, ancestor) {
            if (ancestor === void 0) { ancestor = 0; }
            this.name = name;
            this.args = args;
            this.ancestor = ancestor;
        }
        CallScope.prototype.evaluate = function (scope, locator, flags) {
            var args = evalList(scope, this.args, locator, flags);
            var context = binding_context_1.BindingContext.get(scope, this.name, this.ancestor);
            var func = getFunction(context, this.name, flags);
            if (func) {
                return func.apply(context, args);
            }
            return undefined;
        };
        CallScope.prototype.connect = function (binding, scope, flags) {
            var args = this.args;
            var i = args.length;
            while (i--) {
                args[i].connect(binding, scope, flags);
            }
        };
        return CallScope;
    }());
    exports.CallScope = CallScope;
    var CallMember = (function () {
        function CallMember(object, name, args) {
            this.object = object;
            this.name = name;
            this.args = args;
        }
        CallMember.prototype.evaluate = function (scope, locator, flags) {
            var instance = this.object.evaluate(scope, locator, flags);
            var args = evalList(scope, this.args, locator, flags);
            var func = getFunction(instance, this.name, flags);
            if (func) {
                return func.apply(instance, args);
            }
            return undefined;
        };
        CallMember.prototype.connect = function (binding, scope, flags) {
            this.object.connect(binding, scope, flags);
            var obj = this.object.evaluate(scope, null, flags);
            if (getFunction(obj, this.name, flags & ~binding_flags_1.BindingFlags.mustEvaluate)) {
                var args = this.args;
                var i = args.length;
                while (i--) {
                    args[i].connect(binding, scope, flags);
                }
            }
        };
        return CallMember;
    }());
    exports.CallMember = CallMember;
    var CallFunction = (function () {
        function CallFunction(func, args) {
            this.func = func;
            this.args = args;
        }
        CallFunction.prototype.evaluate = function (scope, locator, flags) {
            var func = this.func.evaluate(scope, locator, flags);
            if (typeof func === 'function') {
                return func.apply(null, evalList(scope, this.args, locator, flags));
            }
            if (!(flags & binding_flags_1.BindingFlags.mustEvaluate) && (func === null || func === undefined)) {
                return undefined;
            }
            throw new Error(this.func + " is not a function");
        };
        CallFunction.prototype.connect = function (binding, scope, flags) {
            this.func.connect(binding, scope, flags);
            var func = this.func.evaluate(scope, null, flags);
            if (typeof func === 'function') {
                var args = this.args;
                var i = args.length;
                while (i--) {
                    args[i].connect(binding, scope, flags);
                }
            }
        };
        return CallFunction;
    }());
    exports.CallFunction = CallFunction;
    var Binary = (function () {
        function Binary(operation, left, right) {
            this.operation = operation;
            this.left = left;
            this.right = right;
        }
        Binary.prototype.evaluate = function (scope, locator, flags) {
            var left = this.left.evaluate(scope, locator, flags);
            switch (this.operation) {
                case '&&': return left && this.right.evaluate(scope, locator, flags);
                case '||': return left || this.right.evaluate(scope, locator, flags);
            }
            var right = this.right.evaluate(scope, locator, flags);
            switch (this.operation) {
                case '==': return left == right;
                case '===': return left === right;
                case '!=': return left != right;
                case '!==': return left !== right;
                case 'instanceof': return typeof right === 'function' && left instanceof right;
                case 'in': return typeof right === 'object' && right !== null && left in right;
            }
            if (left === null || right === null || left === undefined || right === undefined) {
                switch (this.operation) {
                    case '+':
                        if (left !== null && left !== undefined)
                            return left;
                        if (right !== null && right !== undefined)
                            return right;
                        return 0;
                    case '-':
                        if (left !== null && left !== undefined)
                            return left;
                        if (right !== null && right !== undefined)
                            return 0 - right;
                        return 0;
                }
                return null;
            }
            switch (this.operation) {
                case '+': return autoConvertAdd(left, right);
                case '-': return left - right;
                case '*': return left * right;
                case '/': return left / right;
                case '%': return left % right;
                case '<': return left < right;
                case '>': return left > right;
                case '<=': return left <= right;
                case '>=': return left >= right;
            }
            throw new Error("Internal error [" + this.operation + "] not handled");
        };
        Binary.prototype.connect = function (binding, scope, flags) {
            this.left.connect(binding, scope, flags);
            var left = this.left.evaluate(scope, null, flags);
            if (this.operation === '&&' && !left || this.operation === '||' && left) {
                return;
            }
            this.right.connect(binding, scope, flags);
        };
        return Binary;
    }());
    exports.Binary = Binary;
    var Unary = (function () {
        function Unary(operation, expression) {
            this.operation = operation;
            this.expression = expression;
        }
        Unary.prototype.evaluate = function (scope, locator, flags) {
            switch (this.operation) {
                case 'void':
                    return void this.expression.evaluate(scope, locator, flags);
                case 'typeof':
                    return typeof this.expression.evaluate(scope, locator, flags);
                case '!':
                    return !this.expression.evaluate(scope, locator, flags);
                case '-':
                    return -this.expression.evaluate(scope, locator, flags);
                case '+':
                    return +this.expression.evaluate(scope, locator, flags);
                default:
            }
            throw new Error("Internal error [" + this.operation + "] not handled");
        };
        Unary.prototype.connect = function (binding, scope, flags) {
            this.expression.connect(binding, scope, flags);
        };
        Unary.prototype.assign = function (scope, value, locator, flags) {
            throw new Error("Binding expression \"" + this + "\" cannot be assigned to.");
        };
        return Unary;
    }());
    exports.Unary = Unary;
    var PrimitiveLiteral = (function () {
        function PrimitiveLiteral(value) {
            this.value = value;
        }
        PrimitiveLiteral.prototype.evaluate = function (scope, locator, flags) {
            return this.value;
        };
        PrimitiveLiteral.prototype.connect = function (binding, scope, flags) {
        };
        return PrimitiveLiteral;
    }());
    exports.PrimitiveLiteral = PrimitiveLiteral;
    var HtmlLiteral = (function () {
        function HtmlLiteral(parts) {
            this.parts = parts;
        }
        HtmlLiteral.prototype.evaluate = function (scope, locator, flags) {
            var elements = this.parts;
            var result = '';
            for (var i = 0, length_1 = elements.length; i < length_1; ++i) {
                var value = elements[i].evaluate(scope, locator, flags);
                if (value === undefined || value === null) {
                    continue;
                }
                result += value;
            }
            return result;
        };
        HtmlLiteral.prototype.connect = function (binding, scope, flags) {
            var length = this.parts.length;
            for (var i = 0; i < length; i++) {
                this.parts[i].connect(binding, scope, flags);
            }
        };
        return HtmlLiteral;
    }());
    exports.HtmlLiteral = HtmlLiteral;
    var ArrayLiteral = (function () {
        function ArrayLiteral(elements) {
            this.elements = elements;
        }
        ArrayLiteral.prototype.evaluate = function (scope, locator, flags) {
            var elements = this.elements;
            var result = [];
            for (var i = 0, length_2 = elements.length; i < length_2; ++i) {
                result[i] = elements[i].evaluate(scope, locator, flags);
            }
            return result;
        };
        ArrayLiteral.prototype.connect = function (binding, scope, flags) {
            var length = this.elements.length;
            for (var i = 0; i < length; i++) {
                this.elements[i].connect(binding, scope, flags);
            }
        };
        return ArrayLiteral;
    }());
    exports.ArrayLiteral = ArrayLiteral;
    var ObjectLiteral = (function () {
        function ObjectLiteral(keys, values) {
            this.keys = keys;
            this.values = values;
        }
        ObjectLiteral.prototype.evaluate = function (scope, locator, flags) {
            var instance = {};
            var keys = this.keys;
            var values = this.values;
            for (var i = 0, length_3 = keys.length; i < length_3; ++i) {
                instance[keys[i]] = values[i].evaluate(scope, locator, flags);
            }
            return instance;
        };
        ObjectLiteral.prototype.connect = function (binding, scope, flags) {
            var length = this.keys.length;
            for (var i = 0; i < length; i++) {
                this.values[i].connect(binding, scope, flags);
            }
        };
        return ObjectLiteral;
    }());
    exports.ObjectLiteral = ObjectLiteral;
    var Template = (function () {
        function Template(cooked, expressions) {
            this.cooked = cooked;
            this.expressions = expressions;
            this.cooked = cooked;
            this.expressions = expressions || [];
            this.length = this.expressions.length;
        }
        Template.prototype.evaluate = function (scope, locator, flags) {
            var results = new Array(this.length);
            for (var i = 0; i < this.length; i++) {
                results[i] = this.expressions[i].evaluate(scope, locator, flags);
            }
            var result = this.cooked[0];
            for (var i = 0; i < this.length; i++) {
                result = String.prototype.concat(result, results[i], this.cooked[i + 1]);
            }
            return result;
        };
        Template.prototype.connect = function (binding, scope, flags) {
            for (var i = 0; i < this.length; i++) {
                this.expressions[i].connect(binding, scope, flags);
            }
        };
        return Template;
    }());
    exports.Template = Template;
    var TaggedTemplate = (function () {
        function TaggedTemplate(cooked, raw, func, expressions) {
            cooked.raw = raw;
            this.cooked = cooked;
            this.func = func;
            this.expressions = expressions || [];
            this.length = this.expressions.length;
        }
        TaggedTemplate.prototype.evaluate = function (scope, locator, flags) {
            var results = new Array(this.length);
            for (var i = 0; i < this.length; i++) {
                results[i] = this.expressions[i].evaluate(scope, locator, flags);
            }
            var func = this.func.evaluate(scope, locator, flags);
            if (typeof func !== 'function') {
                throw new Error(this.func + " is not a function");
            }
            return func.call.apply(func, [null, this.cooked].concat(results));
        };
        TaggedTemplate.prototype.connect = function (binding, scope, flags) {
            for (var i = 0; i < this.length; i++) {
                this.expressions[i].connect(binding, scope, flags);
            }
            this.func.connect(binding, scope, flags);
        };
        return TaggedTemplate;
    }());
    exports.TaggedTemplate = TaggedTemplate;
    function evalList(scope, list, locator, flags) {
        var length = list.length;
        var result = [];
        for (var i = 0; i < length; i++) {
            result[i] = list[i].evaluate(scope, locator, flags);
        }
        return result;
    }
    function autoConvertAdd(a, b) {
        if (a !== null && b !== null) {
            if (typeof a === 'string' && typeof b !== 'string') {
                return a + b.toString();
            }
            if (typeof a !== 'string' && typeof b === 'string') {
                return a.toString() + b;
            }
            return a + b;
        }
        if (a !== null) {
            return a;
        }
        if (b !== null) {
            return b;
        }
        return 0;
    }
    function getFunction(obj, name, flags) {
        var func = obj === null || obj === undefined ? null : obj[name];
        if (typeof func === 'function') {
            return func;
        }
        if (!(flags & binding_flags_1.BindingFlags.mustEvaluate) && (func === null || func === undefined)) {
            return null;
        }
        throw new Error(name + " is not a function");
    }
    function getKeyed(obj, key) {
        if (Array.isArray(obj)) {
            return obj[parseInt(key, 10)];
        }
        else if (obj) {
            return obj[key];
        }
        else if (obj === null || obj === undefined) {
            return undefined;
        }
        return obj[key];
    }
    function setKeyed(obj, key, value) {
        if (Array.isArray(obj)) {
            var index = parseInt(key, 10);
            if (obj.length <= index) {
                obj.length = index + 1;
            }
            obj[index] = value;
        }
        else {
            obj[key] = value;
        }
        return value;
    }
});



define('runtime/binding/binding-behavior',["require", "exports", "../../kernel/di"], function (require, exports, di_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    function bindingBehavior(nameOrSource) {
        return function (target) {
            return exports.BindingBehaviorResource.define(nameOrSource, target);
        };
    }
    exports.bindingBehavior = bindingBehavior;
    exports.BindingBehaviorResource = {
        name: 'binding-behavior',
        key: function (name) {
            return this.name + ":" + name;
        },
        isType: function (type) {
            return type.kind === this;
        },
        define: function (nameOrSource, ctor) {
            var description = typeof nameOrSource === 'string' ? { name: nameOrSource } : nameOrSource;
            var Type = ctor;
            Type.kind = exports.BindingBehaviorResource;
            Type.description = description;
            Type.register = function (container) {
                container.register(di_1.Registration.singleton(Type.kind.key(description.name), Type));
            };
            return Type;
        }
    };
});



define('runtime/binding/binding-context',["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.targetContext = 'Binding:target';
    exports.sourceContext = 'Binding:source';
    exports.BindingContext = {
        createScopeFromOverride: function (overrideContext) {
            return { bindingContext: overrideContext.bindingContext, overrideContext: overrideContext };
        },
        createOverride: function (bindingContext, parentOverrideContext) {
            return {
                bindingContext: bindingContext,
                parentOverrideContext: parentOverrideContext || null
            };
        },
        get: function (scope, name, ancestor) {
            var overrideContext = scope.overrideContext;
            if (ancestor) {
                while (ancestor && overrideContext) {
                    ancestor--;
                    overrideContext = overrideContext.parentOverrideContext;
                }
                if (ancestor || !overrideContext) {
                    return undefined;
                }
                return name in overrideContext ? overrideContext : overrideContext.bindingContext;
            }
            while (overrideContext && !(name in overrideContext) && !(overrideContext.bindingContext && name in overrideContext.bindingContext)) {
                overrideContext = overrideContext.parentOverrideContext;
            }
            if (overrideContext) {
                return name in overrideContext ? overrideContext : overrideContext.bindingContext;
            }
            return scope.bindingContext || scope.overrideContext;
        }
    };
});



define('runtime/binding/binding-flags',["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var BindingFlags;
    (function (BindingFlags) {
        BindingFlags[BindingFlags["none"] = 0] = "none";
        BindingFlags[BindingFlags["mustEvaluate"] = 1] = "mustEvaluate";
    })(BindingFlags = exports.BindingFlags || (exports.BindingFlags = {}));
});



define('runtime/binding/binding-mode',["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var BindingMode;
    (function (BindingMode) {
        BindingMode[BindingMode["oneTime"] = 0] = "oneTime";
        BindingMode[BindingMode["toView"] = 1] = "toView";
        BindingMode[BindingMode["oneWay"] = 1] = "oneWay";
        BindingMode[BindingMode["twoWay"] = 2] = "twoWay";
        BindingMode[BindingMode["fromView"] = 3] = "fromView";
    })(BindingMode = exports.BindingMode || (exports.BindingMode = {}));
    ;
});



var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
define('runtime/binding/binding',["require", "exports", "./binding-mode", "./connectable-binding", "./connect-queue", "./binding-context", "../../kernel/reporter", "./binding-flags"], function (require, exports, binding_mode_1, connectable_binding_1, connect_queue_1, binding_context_1, reporter_1, binding_flags_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var Binding = (function (_super) {
        __extends(Binding, _super);
        function Binding(sourceExpression, target, targetProperty, mode, observerLocator, locator) {
            var _this = _super.call(this, observerLocator) || this;
            _this.sourceExpression = sourceExpression;
            _this.target = target;
            _this.targetProperty = targetProperty;
            _this.mode = mode;
            _this.locator = locator;
            _this.$isBound = false;
            return _this;
        }
        Binding.prototype.updateTarget = function (value) {
            this.targetObserver.setValue(value, this.target, this.targetProperty);
        };
        Binding.prototype.updateSource = function (value) {
            this.sourceExpression.assign(this.$scope, value, this.locator, binding_flags_1.BindingFlags.none);
        };
        Binding.prototype.call = function (context, newValue, oldValue) {
            if (!this.$isBound) {
                return;
            }
            if (context === binding_context_1.sourceContext) {
                oldValue = this.targetObserver.getValue(this.target, this.targetProperty);
                newValue = this.sourceExpression.evaluate(this.$scope, this.locator, binding_flags_1.BindingFlags.none);
                if (newValue !== oldValue) {
                    this.updateTarget(newValue);
                }
                if (this.mode !== binding_mode_1.BindingMode.oneTime) {
                    this.version++;
                    this.sourceExpression.connect(this, this.$scope, binding_flags_1.BindingFlags.none);
                    this.unobserve(false);
                }
                return;
            }
            if (context === binding_context_1.targetContext) {
                if (newValue !== this.sourceExpression.evaluate(this.$scope, this.locator, binding_flags_1.BindingFlags.none)) {
                    this.updateSource(newValue);
                }
                return;
            }
            throw reporter_1.Reporter.error(15, context);
        };
        Binding.prototype.$bind = function (scope) {
            if (this.$isBound) {
                if (this.$scope === scope) {
                    return;
                }
                this.$unbind();
            }
            this.$isBound = true;
            this.$scope = scope;
            if (this.sourceExpression.bind) {
                this.sourceExpression.bind(this, scope, binding_flags_1.BindingFlags.none);
            }
            var mode = this.mode;
            if (!this.targetObserver) {
                var method = mode === binding_mode_1.BindingMode.twoWay || mode === binding_mode_1.BindingMode.fromView ? 'getObserver' : 'getAccessor';
                this.targetObserver = this.observerLocator[method](this.target, this.targetProperty);
            }
            if ('bind' in this.targetObserver) {
                this.targetObserver.bind();
            }
            if (this.mode !== binding_mode_1.BindingMode.fromView) {
                var value = this.sourceExpression.evaluate(scope, this.locator, binding_flags_1.BindingFlags.none);
                this.updateTarget(value);
            }
            if (mode === binding_mode_1.BindingMode.oneTime) {
                return;
            }
            else if (mode === binding_mode_1.BindingMode.toView) {
                connect_queue_1.enqueueBindingConnect(this);
            }
            else if (mode === binding_mode_1.BindingMode.twoWay) {
                this.sourceExpression.connect(this, scope, binding_flags_1.BindingFlags.none);
                this.targetObserver.subscribe(binding_context_1.targetContext, this);
            }
            else if (mode === binding_mode_1.BindingMode.fromView) {
                this.targetObserver.subscribe(binding_context_1.targetContext, this);
            }
        };
        Binding.prototype.$unbind = function () {
            if (!this.$isBound) {
                return;
            }
            this.$isBound = false;
            if (this.sourceExpression.unbind) {
                this.sourceExpression.unbind(this, this.$scope, binding_flags_1.BindingFlags.none);
            }
            this.$scope = null;
            if ('unbind' in this.targetObserver) {
                this.targetObserver.unbind();
            }
            if ('unsubscribe' in this.targetObserver) {
                this.targetObserver.unsubscribe(binding_context_1.targetContext, this);
            }
            this.unobserve(true);
        };
        Binding.prototype.connect = function (evaluate) {
            if (!this.$isBound) {
                return;
            }
            if (evaluate) {
                var value = this.sourceExpression.evaluate(this.$scope, this.locator, binding_flags_1.BindingFlags.none);
                this.updateTarget(value);
            }
            this.sourceExpression.connect(this, this.$scope, binding_flags_1.BindingFlags.none);
        };
        return Binding;
    }(connectable_binding_1.ConnectableBinding));
    exports.Binding = Binding;
});



define('runtime/binding/call',["require", "exports", "./binding-flags"], function (require, exports, binding_flags_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var Call = (function () {
        function Call(sourceExpression, target, targetProperty, observerLocator, locator) {
            this.sourceExpression = sourceExpression;
            this.target = target;
            this.targetProperty = targetProperty;
            this.observerLocator = observerLocator;
            this.locator = locator;
            this.$isBound = false;
            this.targetObserver = observerLocator.getObserver(target, targetProperty);
        }
        Call.prototype.callSource = function ($event) {
            var overrideContext = this.$scope.overrideContext;
            Object.assign(overrideContext, $event);
            overrideContext.$event = $event;
            var mustEvaluate = true;
            var result = this.sourceExpression.evaluate(this.$scope, this.locator, binding_flags_1.BindingFlags.mustEvaluate);
            delete overrideContext.$event;
            for (var prop in $event) {
                delete overrideContext[prop];
            }
            return result;
        };
        Call.prototype.$bind = function (scope) {
            var _this = this;
            if (this.$isBound) {
                if (this.$scope === scope) {
                    return;
                }
                this.$unbind();
            }
            this.$isBound = true;
            this.$scope = scope;
            if (this.sourceExpression.bind) {
                this.sourceExpression.bind(this, scope, binding_flags_1.BindingFlags.none);
            }
            this.targetObserver.setValue(function ($event) { return _this.callSource($event); }, this.target, this.targetProperty);
        };
        Call.prototype.$unbind = function () {
            if (!this.$isBound) {
                return;
            }
            this.$isBound = false;
            if (this.sourceExpression.unbind) {
                this.sourceExpression.unbind(this, this.$scope, binding_flags_1.BindingFlags.none);
            }
            this.$scope = null;
            this.targetObserver.setValue(null, this.target, this.targetProperty);
        };
        Call.prototype.observeProperty = function () { };
        return Call;
    }());
    exports.Call = Call;
});



var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
define('runtime/binding/checked-observer',["require", "exports", "./subscriber-collection"], function (require, exports, subscriber_collection_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var checkedArrayContext = 'CheckedObserver:array';
    var checkedValueContext = 'CheckedObserver:value';
    var CheckedObserver = (function (_super) {
        __extends(CheckedObserver, _super);
        function CheckedObserver(node, handler, taskQueue, observerLocator) {
            var _this = _super.call(this) || this;
            _this.node = node;
            _this.handler = handler;
            _this.taskQueue = taskQueue;
            _this.observerLocator = observerLocator;
            return _this;
        }
        CheckedObserver.prototype.getValue = function () {
            return this.value;
        };
        CheckedObserver.prototype.setValue = function (newValue) {
            if (this.initialSync && this.value === newValue) {
                return;
            }
            if (this.arrayObserver) {
                this.arrayObserver.unsubscribe(checkedArrayContext, this);
                this.arrayObserver = null;
            }
            if (this.node.type === 'checkbox' && Array.isArray(newValue)) {
                this.arrayObserver = this.observerLocator.getArrayObserver(newValue);
                this.arrayObserver.subscribe(checkedArrayContext, this);
            }
            this.oldValue = this.value;
            this.value = newValue;
            this.synchronizeElement();
            this.notify();
            if (!this.initialSync) {
                this.initialSync = true;
                this.taskQueue.queueMicroTask(this);
            }
        };
        CheckedObserver.prototype.call = function (context, splices) {
            this.synchronizeElement();
            if (!this.valueObserver) {
                this.valueObserver = this.node['$observers'].model || this.node['$observers'].value;
                if (this.valueObserver) {
                    this.valueObserver.subscribe(checkedValueContext, this);
                }
            }
        };
        CheckedObserver.prototype.synchronizeElement = function () {
            var value = this.value;
            var element = this.node;
            var elementValue = element.hasOwnProperty('model') ? element['model'] : element.value;
            var isRadio = element.type === 'radio';
            var matcher = element['matcher'] || (function (a, b) { return a === b; });
            element.checked =
                isRadio && !!matcher(value, elementValue)
                    || !isRadio && value === true
                    || !isRadio && Array.isArray(value) && value.findIndex(function (item) { return !!matcher(item, elementValue); }) !== -1;
        };
        CheckedObserver.prototype.synchronizeValue = function () {
            var value = this.value;
            var element = this.node;
            var elementValue = element.hasOwnProperty('model') ? element['model'] : element.value;
            var index;
            var matcher = element['matcher'] || (function (a, b) { return a === b; });
            if (element.type === 'checkbox') {
                if (Array.isArray(value)) {
                    index = value.findIndex(function (item) { return !!matcher(item, elementValue); });
                    if (element.checked && index === -1) {
                        value.push(elementValue);
                    }
                    else if (!element.checked && index !== -1) {
                        value.splice(index, 1);
                    }
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
            this.oldValue = this.value;
            this.value = value;
            this.notify();
        };
        CheckedObserver.prototype.notify = function () {
            var oldValue = this.oldValue;
            var newValue = this.value;
            if (newValue === oldValue) {
                return;
            }
            this.callSubscribers(newValue, oldValue);
        };
        CheckedObserver.prototype.handleEvent = function () {
            this.synchronizeValue();
        };
        CheckedObserver.prototype.subscribe = function (context, callable) {
            if (!this.hasSubscribers()) {
                this.handler.subscribe(this.node, this);
            }
            this.addSubscriber(context, callable);
        };
        CheckedObserver.prototype.unsubscribe = function (context, callable) {
            if (this.removeSubscriber(context, callable) && !this.hasSubscribers()) {
                this.handler.dispose();
            }
        };
        CheckedObserver.prototype.unbind = function () {
            if (this.arrayObserver) {
                this.arrayObserver.unsubscribe(checkedArrayContext, this);
                this.arrayObserver = null;
            }
            if (this.valueObserver) {
                this.valueObserver.unsubscribe(checkedValueContext, this);
            }
        };
        return CheckedObserver;
    }(subscriber_collection_1.SubscriberCollection));
    exports.CheckedObserver = CheckedObserver;
});



define('runtime/binding/class-observer',["require", "exports", "../dom"], function (require, exports, dom_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var ClassObserver = (function () {
        function ClassObserver(node) {
            this.node = node;
            this.doNotCache = true;
            this.value = '';
            this.version = 0;
        }
        ClassObserver.prototype.getValue = function () {
            return this.value;
        };
        ClassObserver.prototype.setValue = function (newValue) {
            var addClass = dom_1.DOM.addClass;
            var removeClass = dom_1.DOM.removeClass;
            var nameIndex = this.nameIndex || {};
            var version = this.version;
            var names;
            var name;
            if (newValue !== null && newValue !== undefined && newValue.length) {
                names = newValue.split(/\s+/);
                for (var i = 0, length_1 = names.length; i < length_1; i++) {
                    name = names[i];
                    if (name === '') {
                        continue;
                    }
                    nameIndex[name] = version;
                    addClass(this.node, name);
                }
            }
            this.value = newValue;
            this.nameIndex = nameIndex;
            this.version += 1;
            if (version === 0) {
                return;
            }
            version -= 1;
            for (name in nameIndex) {
                if (!nameIndex.hasOwnProperty(name) || nameIndex[name] !== version) {
                    continue;
                }
                removeClass(this.node, name);
            }
        };
        ClassObserver.prototype.subscribe = function () {
            throw new Error("Observation of a \"" + dom_1.DOM.normalizedTagName(this.node) + "\" element's \"class\" property is not supported.");
        };
        return ClassObserver;
    }());
    exports.ClassObserver = ClassObserver;
});



var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
define('runtime/binding/collection-observation',["require", "exports", "./array-change-records", "./map-change-records", "./subscriber-collection"], function (require, exports, array_change_records_1, map_change_records_1, subscriber_collection_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var ModifyCollectionObserver = (function (_super) {
        __extends(ModifyCollectionObserver, _super);
        function ModifyCollectionObserver(taskQueue, collection) {
            var _this = _super.call(this) || this;
            _this.taskQueue = taskQueue;
            _this.collection = collection;
            _this.queued = false;
            _this.changeRecords = null;
            _this.oldCollection = null;
            _this.lengthObserver = null;
            _this.lengthPropertyName = (collection instanceof Map) || (collection instanceof Set) ? 'size' : 'length';
            return _this;
        }
        ModifyCollectionObserver.prototype.subscribe = function (context, callable) {
            this.addSubscriber(context, callable);
        };
        ModifyCollectionObserver.prototype.unsubscribe = function (context, callable) {
            this.removeSubscriber(context, callable);
        };
        ModifyCollectionObserver.prototype.addChangeRecord = function (changeRecord) {
            if (!this.hasSubscribers() && !this.lengthObserver) {
                return;
            }
            if (changeRecord.type === 'splice') {
                var index = changeRecord.index;
                var arrayLength = changeRecord.object.length;
                if (index > arrayLength) {
                    index = arrayLength - changeRecord.addedCount;
                }
                else if (index < 0) {
                    index = arrayLength + changeRecord.removed.length + index - changeRecord.addedCount;
                }
                if (index < 0) {
                    index = 0;
                }
                changeRecord.index = index;
            }
            if (this.changeRecords === null) {
                this.changeRecords = [changeRecord];
            }
            else {
                this.changeRecords.push(changeRecord);
            }
            if (!this.queued) {
                this.queued = true;
                this.taskQueue.queueMicroTask(this);
            }
        };
        ModifyCollectionObserver.prototype.flushChangeRecords = function () {
            if ((this.changeRecords && this.changeRecords.length) || this.oldCollection) {
                this.call();
            }
        };
        ModifyCollectionObserver.prototype.reset = function (oldCollection) {
            this.oldCollection = oldCollection;
            if (this.hasSubscribers() && !this.queued) {
                this.queued = true;
                this.taskQueue.queueMicroTask(this);
            }
        };
        ModifyCollectionObserver.prototype.getLengthObserver = function () {
            return this.lengthObserver || (this.lengthObserver = new CollectionLengthObserver(this.collection));
        };
        ModifyCollectionObserver.prototype.call = function () {
            var changeRecords = this.changeRecords;
            var oldCollection = this.oldCollection;
            var records;
            this.queued = false;
            this.changeRecords = [];
            this.oldCollection = null;
            if (this.hasSubscribers()) {
                if (oldCollection) {
                    if ((this.collection instanceof Map) || (this.collection instanceof Set)) {
                        records = map_change_records_1.getChangeRecords(oldCollection);
                    }
                    else {
                        records = array_change_records_1.calcSplices(this.collection, 0, this.collection.length, oldCollection, 0, oldCollection.length);
                    }
                }
                else {
                    if ((this.collection instanceof Map) || (this.collection instanceof Set)) {
                        records = changeRecords;
                    }
                    else {
                        records = array_change_records_1.projectArraySplices(this.collection, changeRecords);
                    }
                }
                this.callSubscribers(records);
            }
            if (this.lengthObserver) {
                this.lengthObserver.call(this.collection[this.lengthPropertyName]);
            }
        };
        return ModifyCollectionObserver;
    }(subscriber_collection_1.SubscriberCollection));
    exports.ModifyCollectionObserver = ModifyCollectionObserver;
    var CollectionLengthObserver = (function (_super) {
        __extends(CollectionLengthObserver, _super);
        function CollectionLengthObserver(collection) {
            var _this = _super.call(this) || this;
            _this.collection = collection;
            _this.lengthPropertyName = collection instanceof Map || collection instanceof Set ? 'size' : 'length';
            _this.currentValue = collection[_this.lengthPropertyName];
            return _this;
        }
        CollectionLengthObserver.prototype.getValue = function () {
            return this.collection[this.lengthPropertyName];
        };
        CollectionLengthObserver.prototype.setValue = function (newValue) {
            this.collection[this.lengthPropertyName] = newValue;
        };
        CollectionLengthObserver.prototype.subscribe = function (context, callable) {
            this.addSubscriber(context, callable);
        };
        CollectionLengthObserver.prototype.unsubscribe = function (context, callable) {
            this.removeSubscriber(context, callable);
        };
        CollectionLengthObserver.prototype.call = function (newValue) {
            var oldValue = this.currentValue;
            this.callSubscribers(newValue, oldValue);
            this.currentValue = newValue;
        };
        return CollectionLengthObserver;
    }(subscriber_collection_1.SubscriberCollection));
    exports.CollectionLengthObserver = CollectionLengthObserver;
});



var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
define('runtime/binding/computed-observer',["require", "exports", "./subscriber-collection", "../../kernel/reporter"], function (require, exports, subscriber_collection_1, reporter_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    function computed(config) {
        return function (target, key, descriptor) {
            var computed = target.computed || (target.computed = {});
            computed[key] = config;
        };
    }
    exports.computed = computed;
    var noProxy = !(typeof Proxy !== undefined);
    var computedContext = 'computed-observer';
    var computedOverrideDefaults = { static: false, volatile: false };
    function createComputedObserver(observerLocator, dirtyChecker, taskQueue, instance, propertyName, descriptor) {
        if (descriptor.configurable === false) {
            return dirtyChecker.createProperty(instance, propertyName);
        }
        if (descriptor.get) {
            var overrides = instance.constructor.computed
                ? instance.constructor.computed[propertyName] || computedOverrideDefaults
                : computedOverrideDefaults;
            if (descriptor.set) {
                if (overrides.volatile) {
                    return noProxy
                        ? dirtyChecker.createProperty(instance, propertyName)
                        : new GetterObserver(overrides, instance, propertyName, descriptor, observerLocator, taskQueue);
                }
                return new CustomSetterObserver(instance, propertyName, descriptor, taskQueue);
            }
            return noProxy
                ? dirtyChecker.createProperty(instance, propertyName)
                : new GetterObserver(overrides, instance, propertyName, descriptor, observerLocator, taskQueue);
        }
        throw reporter_1.Reporter.error(18, propertyName);
    }
    exports.createComputedObserver = createComputedObserver;
    var CustomSetterObserver = (function (_super) {
        __extends(CustomSetterObserver, _super);
        function CustomSetterObserver(instance, propertyName, descriptor, taskQueue) {
            var _this = _super.call(this) || this;
            _this.instance = instance;
            _this.propertyName = propertyName;
            _this.descriptor = descriptor;
            _this.taskQueue = taskQueue;
            _this.queued = false;
            _this.observing = false;
            return _this;
        }
        CustomSetterObserver.prototype.getValue = function () {
            return this.instance[this.propertyName];
        };
        CustomSetterObserver.prototype.setValue = function (newValue) {
            this.instance[this.propertyName] = newValue;
        };
        CustomSetterObserver.prototype.call = function () {
            var oldValue = this.oldValue;
            var newValue = this.currentValue;
            this.queued = false;
            this.callSubscribers(newValue, oldValue);
        };
        CustomSetterObserver.prototype.subscribe = function (context, callable) {
            if (!this.observing) {
                this.convertProperty();
            }
            this.addSubscriber(context, callable);
        };
        CustomSetterObserver.prototype.unsubscribe = function (context, callable) {
            this.removeSubscriber(context, callable);
        };
        CustomSetterObserver.prototype.convertProperty = function () {
            var setter = this.descriptor.set;
            var that = this;
            this.observing = true;
            this.currentValue = this.instance[this.propertyName];
            Reflect.defineProperty(this.instance, this.propertyName, {
                set: function (newValue) {
                    setter(newValue);
                    var oldValue = this.currentValue;
                    if (oldValue !== newValue) {
                        if (!that.queued) {
                            that.oldValue = oldValue;
                            that.queued = true;
                            that.taskQueue.queueMicroTask(that);
                        }
                        that.currentValue = newValue;
                    }
                }
            });
        };
        return CustomSetterObserver;
    }(subscriber_collection_1.SubscriberCollection));
    exports.CustomSetterObserver = CustomSetterObserver;
    var GetterObserver = (function (_super) {
        __extends(GetterObserver, _super);
        function GetterObserver(overrides, instance, propertyName, descriptor, observerLocator, taskQueue) {
            var _this = _super.call(this) || this;
            _this.overrides = overrides;
            _this.instance = instance;
            _this.propertyName = propertyName;
            _this.descriptor = descriptor;
            _this.observerLocator = observerLocator;
            _this.taskQueue = taskQueue;
            _this.controller = new GetterController(overrides, instance, propertyName, descriptor, _this, observerLocator, taskQueue);
            return _this;
        }
        GetterObserver.prototype.getValue = function () {
            return this.controller.value;
        };
        GetterObserver.prototype.setValue = function (newValue) { };
        GetterObserver.prototype.call = function () {
            var oldValue = this.controller.value;
            var newValue = this.controller.getValueAndCollectDependencies();
            if (oldValue !== newValue) {
                this.callSubscribers(newValue, oldValue);
            }
        };
        GetterObserver.prototype.subscribe = function (context, callable) {
            this.addSubscriber(context, callable);
            this.controller.onSubscriberAdded();
        };
        GetterObserver.prototype.unsubscribe = function (context, callable) {
            this.removeSubscriber(context, callable);
            this.controller.onSubscriberRemoved();
        };
        return GetterObserver;
    }(subscriber_collection_1.SubscriberCollection));
    var GetterController = (function () {
        function GetterController(overrides, instance, propertyName, descriptor, owner, observerLocator, taskQueue) {
            this.overrides = overrides;
            this.instance = instance;
            this.propertyName = propertyName;
            this.owner = owner;
            this.taskQueue = taskQueue;
            this.queued = false;
            this.dependencies = [];
            this.subscriberCount = 0;
            this.isCollecting = false;
            var proxy = new Proxy(instance, createGetterTraps(observerLocator, this));
            var getter = descriptor.get;
            var ctrl = this;
            Reflect.defineProperty(instance, propertyName, {
                get: function () {
                    if (ctrl.subscriberCount < 1 || ctrl.isCollecting) {
                        ctrl.value = getter.apply(proxy);
                    }
                    return ctrl.value;
                }
            });
        }
        GetterController.prototype.addDependency = function (subscribable) {
            if (this.dependencies.includes(subscribable)) {
                return;
            }
            this.dependencies.push(subscribable);
        };
        GetterController.prototype.onSubscriberAdded = function () {
            this.subscriberCount++;
            if (this.subscriberCount > 1) {
                return;
            }
            this.getValueAndCollectDependencies(true);
        };
        GetterController.prototype.getValueAndCollectDependencies = function (requireCollect) {
            var _this = this;
            if (requireCollect === void 0) { requireCollect = false; }
            this.queued = false;
            var dynamicDependencies = !this.overrides.static || requireCollect;
            if (dynamicDependencies) {
                this.unsubscribeAllDependencies();
                this.isCollecting = true;
            }
            this.value = this.instance[this.propertyName];
            if (dynamicDependencies) {
                this.isCollecting = false;
                this.dependencies.forEach(function (x) { return x.subscribe(computedContext, _this); });
            }
            return this.value;
        };
        GetterController.prototype.onSubscriberRemoved = function () {
            this.subscriberCount--;
            if (this.subscriberCount === 0) {
                this.unsubscribeAllDependencies();
            }
        };
        GetterController.prototype.unsubscribeAllDependencies = function () {
            var _this = this;
            this.dependencies.forEach(function (x) { return x.unsubscribe(computedContext, _this); });
            this.dependencies.length = 0;
        };
        GetterController.prototype.call = function () {
            if (!this.queued) {
                this.queued = true;
                this.taskQueue.queueMicroTask(this.owner);
            }
        };
        return GetterController;
    }());
    function createGetterTraps(observerLocator, controller) {
        return {
            get: function (instance, key) {
                var value = instance[key];
                if (key === '$observers' || typeof value === 'function' || !controller.isCollecting) {
                    return value;
                }
                if (instance instanceof Array) {
                    controller.addDependency(observerLocator.getArrayObserver(instance));
                    if (key === 'length') {
                        controller.addDependency(observerLocator.getArrayObserver(instance).getLengthObserver());
                    }
                }
                else if (instance instanceof Map) {
                    controller.addDependency(observerLocator.getMapObserver(instance));
                    if (key === 'size') {
                        controller.addDependency(this.getMapObserver(instance).getLengthObserver());
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
});



define('runtime/binding/connect-queue',["require", "exports", "../../kernel/platform"], function (require, exports, platform_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var queue = [];
    var queued = {};
    var nextId = 0;
    var minimumImmediate = 100;
    var frameBudget = 15;
    var isFlushRequested = false;
    var immediate = 0;
    function flush(animationFrameStart) {
        var length = queue.length;
        var i = 0;
        while (i < length) {
            var binding = queue[i];
            queued[binding.__connectQueueId] = false;
            binding.connect(true);
            i++;
            if (i % 100 === 0 && platform_1.PLATFORM.now() - animationFrameStart > frameBudget) {
                break;
            }
        }
        queue.splice(0, i);
        if (queue.length) {
            platform_1.PLATFORM.requestAnimationFrame(flush);
        }
        else {
            isFlushRequested = false;
            immediate = 0;
        }
    }
    function enqueueBindingConnect(binding) {
        if (immediate < minimumImmediate) {
            immediate++;
            binding.connect(false);
        }
        else {
            var id = binding.__connectQueueId;
            if (id === undefined) {
                id = nextId;
                nextId++;
                binding.__connectQueueId = id;
            }
            if (!queued[id]) {
                queue.push(binding);
                queued[id] = true;
            }
        }
        if (!isFlushRequested) {
            isFlushRequested = true;
            platform_1.PLATFORM.requestAnimationFrame(flush);
        }
    }
    exports.enqueueBindingConnect = enqueueBindingConnect;
});



define('runtime/binding/connectable-binding',["require", "exports", "./binding-context"], function (require, exports, binding_context_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var slotNames = [];
    var versionSlotNames = [];
    for (var i = 0; i < 100; i++) {
        slotNames.push("_observer" + i);
        versionSlotNames.push("_observerVersion" + i);
    }
    var ConnectableBinding = (function () {
        function ConnectableBinding(observerLocator) {
            this.observerLocator = observerLocator;
        }
        ConnectableBinding.prototype.addObserver = function (observer) {
            var observerSlots = this.observerSlots === undefined ? 0 : this.observerSlots;
            var i = observerSlots;
            while (i-- && this[slotNames[i]] !== observer) {
            }
            if (i === -1) {
                i = 0;
                while (this[slotNames[i]]) {
                    i++;
                }
                this[slotNames[i]] = observer;
                observer.subscribe(binding_context_1.sourceContext, this);
                if (i === observerSlots) {
                    this.observerSlots = i + 1;
                }
            }
            if (this.version === undefined) {
                this.version = 0;
            }
            this[versionSlotNames[i]] = this.version;
        };
        ConnectableBinding.prototype.observeProperty = function (obj, propertyName) {
            var observer = this.observerLocator.getObserver(obj, propertyName);
            this.addObserver(observer);
        };
        ConnectableBinding.prototype.observeArray = function (array) {
            var observer = this.observerLocator.getArrayObserver(array);
            this.addObserver(observer);
        };
        ConnectableBinding.prototype.unobserve = function (all) {
            var i = this.observerSlots;
            while (i--) {
                if (all || this[versionSlotNames[i]] !== this.version) {
                    var observer = this[slotNames[i]];
                    this[slotNames[i]] = null;
                    if (observer) {
                        observer.unsubscribe(binding_context_1.sourceContext, this);
                    }
                }
            }
        };
        return ConnectableBinding;
    }());
    exports.ConnectableBinding = ConnectableBinding;
});



var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
define('runtime/binding/dirty-checker',["require", "exports", "./subscriber-collection", "../../kernel/di"], function (require, exports, subscriber_collection_1, di_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.IDirtyChecker = di_1.DI.createInterface()
        .withDefault(function (x) { return x.singleton(DirtyChecker); });
    var DirtyChecker = (function () {
        function DirtyChecker() {
            this.tracked = [];
            this.checkDelay = 120;
        }
        DirtyChecker.prototype.createProperty = function (obj, propertyName) {
            return new DirtyCheckProperty(this, obj, propertyName);
        };
        DirtyChecker.prototype.addProperty = function (property) {
            var tracked = this.tracked;
            tracked.push(property);
            if (tracked.length === 1) {
                this.scheduleDirtyCheck();
            }
        };
        DirtyChecker.prototype.removeProperty = function (property) {
            var tracked = this.tracked;
            tracked.splice(tracked.indexOf(property), 1);
        };
        DirtyChecker.prototype.scheduleDirtyCheck = function () {
            var _this = this;
            setTimeout(function () { return _this.check(); }, this.checkDelay);
        };
        DirtyChecker.prototype.check = function () {
            var tracked = this.tracked;
            var i = tracked.length;
            while (i--) {
                var current = tracked[i];
                if (current.isDirty()) {
                    current.call();
                }
            }
            if (tracked.length) {
                this.scheduleDirtyCheck();
            }
        };
        return DirtyChecker;
    }());
    var DirtyCheckProperty = (function (_super) {
        __extends(DirtyCheckProperty, _super);
        function DirtyCheckProperty(dirtyChecker, obj, propertyName) {
            var _this = _super.call(this) || this;
            _this.dirtyChecker = dirtyChecker;
            _this.obj = obj;
            _this.propertyName = propertyName;
            return _this;
        }
        DirtyCheckProperty.prototype.isDirty = function () {
            return this.oldValue !== this.obj[this.propertyName];
        };
        DirtyCheckProperty.prototype.getValue = function () {
            return this.obj[this.propertyName];
        };
        DirtyCheckProperty.prototype.setValue = function (newValue) {
            this.obj[this.propertyName] = newValue;
        };
        DirtyCheckProperty.prototype.call = function () {
            var oldValue = this.oldValue;
            var newValue = this.getValue();
            this.callSubscribers(newValue, oldValue);
            this.oldValue = newValue;
        };
        DirtyCheckProperty.prototype.subscribe = function (context, callable) {
            if (!this.hasSubscribers()) {
                this.oldValue = this.getValue();
                this.dirtyChecker.addProperty(this);
            }
            this.addSubscriber(context, callable);
        };
        DirtyCheckProperty.prototype.unsubscribe = function (context, callable) {
            if (this.removeSubscriber(context, callable) && !this.hasSubscribers()) {
                this.dirtyChecker.removeProperty(this);
            }
        };
        return DirtyCheckProperty;
    }(subscriber_collection_1.SubscriberCollection));
});



var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
define('runtime/binding/element-observation',["require", "exports", "./subscriber-collection", "../dom"], function (require, exports, subscriber_collection_1, dom_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var XLinkAttributeObserver = (function () {
        function XLinkAttributeObserver(node, propertyName, attributeName) {
            this.node = node;
            this.propertyName = propertyName;
            this.attributeName = attributeName;
        }
        XLinkAttributeObserver.prototype.getValue = function () {
            return this.node.getAttributeNS('http://www.w3.org/1999/xlink', this.attributeName);
        };
        XLinkAttributeObserver.prototype.setValue = function (newValue) {
            return this.node.setAttributeNS('http://www.w3.org/1999/xlink', this.attributeName, newValue);
        };
        XLinkAttributeObserver.prototype.subscribe = function () {
            throw new Error("Observation of a \"" + dom_1.DOM.normalizedTagName(this.node) + "\" element's \"" + this.propertyName + "\" property is not supported.");
        };
        return XLinkAttributeObserver;
    }());
    exports.XLinkAttributeObserver = XLinkAttributeObserver;
    exports.dataAttributeAccessor = {
        getValue: function (obj, propertyName) { return dom_1.DOM.getAttribute(obj, propertyName); },
        setValue: function (value, obj, propertyName) {
            if (value === null || value === undefined) {
                dom_1.DOM.removeAttribute(obj, propertyName);
            }
            else {
                dom_1.DOM.setAttribute(obj, propertyName, value);
            }
        }
    };
    var DataAttributeObserver = (function () {
        function DataAttributeObserver(node, propertyName) {
            this.node = node;
            this.propertyName = propertyName;
        }
        DataAttributeObserver.prototype.getValue = function () {
            return dom_1.DOM.getAttribute(this.node, this.propertyName);
        };
        DataAttributeObserver.prototype.setValue = function (newValue) {
            if (newValue === null || newValue === undefined) {
                return dom_1.DOM.removeAttribute(this.node, this.propertyName);
            }
            return dom_1.DOM.setAttribute(this.node, this.propertyName, newValue);
        };
        DataAttributeObserver.prototype.subscribe = function () {
            throw new Error("Observation of a \"" + dom_1.DOM.normalizedTagName(this.node) + "\" element's \"" + this.propertyName + "\" property is not supported.");
        };
        return DataAttributeObserver;
    }());
    exports.DataAttributeObserver = DataAttributeObserver;
    var StyleObserver = (function () {
        function StyleObserver(element, propertyName) {
            this.element = element;
            this.propertyName = propertyName;
            this.styles = null;
            this.version = 0;
        }
        StyleObserver.prototype.getValue = function () {
            return this.element.style.cssText;
        };
        StyleObserver.prototype._setProperty = function (style, value) {
            var priority = '';
            if (value !== null && value !== undefined && typeof value.indexOf === 'function' && value.indexOf('!important') !== -1) {
                priority = 'important';
                value = value.replace('!important', '');
            }
            this.element.style.setProperty(style, value, priority);
        };
        StyleObserver.prototype.setValue = function (newValue) {
            var styles = this.styles || {};
            var style;
            var version = this.version;
            if (newValue !== null && newValue !== undefined) {
                if (newValue instanceof Object) {
                    var value = void 0;
                    for (style in newValue) {
                        if (newValue.hasOwnProperty(style)) {
                            value = newValue[style];
                            style = style.replace(/([A-Z])/g, function (m) { return '-' + m.toLowerCase(); });
                            styles[style] = version;
                            this._setProperty(style, value);
                        }
                    }
                }
                else if (newValue.length) {
                    var rx = /\s*([\w\-]+)\s*:\s*((?:(?:[\w\-]+\(\s*(?:"(?:\\"|[^"])*"|'(?:\\'|[^'])*'|[\w\-]+\(\s*(?:^"(?:\\"|[^"])*"|'(?:\\'|[^'])*'|[^\)]*)\),?|[^\)]*)\),?|"(?:\\"|[^"])*"|'(?:\\'|[^'])*'|[^;]*),?\s*)+);?/g;
                    var pair = void 0;
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
                this.element.style.removeProperty(style);
            }
        };
        StyleObserver.prototype.subscribe = function () {
            throw new Error("Observation of a \"" + this.element.nodeName + "\" element's \"" + this.propertyName + "\" property is not supported.");
        };
        return StyleObserver;
    }());
    exports.StyleObserver = StyleObserver;
    var ValueAttributeObserver = (function (_super) {
        __extends(ValueAttributeObserver, _super);
        function ValueAttributeObserver(node, propertyName, handler) {
            var _this = _super.call(this) || this;
            _this.node = node;
            _this.propertyName = propertyName;
            _this.handler = handler;
            if (propertyName === 'files') {
                _this.setValue = function () { };
            }
            return _this;
        }
        ValueAttributeObserver.prototype.getValue = function () {
            return this.node[this.propertyName];
        };
        ValueAttributeObserver.prototype.setValue = function (newValue) {
            newValue = newValue === undefined || newValue === null ? '' : newValue;
            if (this.node[this.propertyName] !== newValue) {
                this.node[this.propertyName] = newValue;
                this.notify();
            }
        };
        ValueAttributeObserver.prototype.notify = function () {
            var oldValue = this.oldValue;
            var newValue = this.getValue();
            this.callSubscribers(newValue, oldValue);
            this.oldValue = newValue;
        };
        ValueAttributeObserver.prototype.handleEvent = function () {
            this.notify();
        };
        ValueAttributeObserver.prototype.subscribe = function (context, callable) {
            if (!this.hasSubscribers()) {
                this.oldValue = this.getValue();
                this.handler.subscribe(this.node, this);
            }
            this.addSubscriber(context, callable);
        };
        ValueAttributeObserver.prototype.unsubscribe = function (context, callable) {
            if (this.removeSubscriber(context, callable) && !this.hasSubscribers()) {
                this.handler.dispose();
            }
        };
        return ValueAttributeObserver;
    }(subscriber_collection_1.SubscriberCollection));
    exports.ValueAttributeObserver = ValueAttributeObserver;
});



define('runtime/binding/event-manager',["require", "exports", "../../kernel/di", "../dom"], function (require, exports, di_1, dom_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    function findOriginalEventTarget(event) {
        return (event.path && event.path[0]) || (event.deepPath && event.deepPath[0]) || event.target;
    }
    function stopPropagation() {
        this.standardStopPropagation();
        this.propagationStopped = true;
    }
    function handleCapturedEvent(event) {
        event.propagationStopped = false;
        var target = findOriginalEventTarget(event);
        var orderedCallbacks = [];
        while (target) {
            if (target.capturedCallbacks) {
                var callback = target.capturedCallbacks[event.type];
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
        for (var i = orderedCallbacks.length - 1; i >= 0 && !event.propagationStopped; i--) {
            var orderedCallback = orderedCallbacks[i];
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
        var target = findOriginalEventTarget(event);
        while (target && !event.propagationStopped) {
            if (target.delegatedCallbacks) {
                var callback = target.delegatedCallbacks[event.type];
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
    var ListenerTracker = (function () {
        function ListenerTracker(eventName, listener, capture) {
            this.eventName = eventName;
            this.listener = listener;
            this.capture = capture;
            this.count = 0;
        }
        ListenerTracker.prototype.increment = function () {
            this.count++;
            if (this.count === 1) {
                dom_1.DOM.addEventListener(this.eventName, this.listener, null, this.capture);
            }
        };
        ListenerTracker.prototype.decrement = function () {
            this.count--;
            if (this.count === 0) {
                dom_1.DOM.removeEventListener(this.eventName, this.listener, null, this.capture);
            }
        };
        return ListenerTracker;
    }());
    var DelegateOrCaptureSubscription = (function () {
        function DelegateOrCaptureSubscription(entry, lookup, targetEvent, callback) {
            this.entry = entry;
            this.lookup = lookup;
            this.targetEvent = targetEvent;
            lookup[targetEvent] = callback;
        }
        DelegateOrCaptureSubscription.prototype.dispose = function () {
            this.entry.decrement();
            this.lookup[this.targetEvent] = null;
        };
        return DelegateOrCaptureSubscription;
    }());
    var TriggerSubscription = (function () {
        function TriggerSubscription(target, targetEvent, callback) {
            this.target = target;
            this.targetEvent = targetEvent;
            this.callback = callback;
            dom_1.DOM.addEventListener(targetEvent, callback, target);
        }
        TriggerSubscription.prototype.dispose = function () {
            dom_1.DOM.removeEventListener(this.targetEvent, this.callback, this.target);
        };
        return TriggerSubscription;
    }());
    var DelegationStrategy;
    (function (DelegationStrategy) {
        DelegationStrategy[DelegationStrategy["none"] = 0] = "none";
        DelegationStrategy[DelegationStrategy["capturing"] = 1] = "capturing";
        DelegationStrategy[DelegationStrategy["bubbling"] = 2] = "bubbling";
    })(DelegationStrategy = exports.DelegationStrategy || (exports.DelegationStrategy = {}));
    var EventSubscriber = (function () {
        function EventSubscriber(events) {
            this.events = events;
            this.events = events;
            this.target = null;
            this.handler = null;
        }
        EventSubscriber.prototype.subscribe = function (node, callbackOrListener) {
            this.target = node;
            this.handler = callbackOrListener;
            var add = dom_1.DOM.addEventListener;
            var events = this.events;
            for (var i = 0, ii = events.length; ii > i; ++i) {
                add(events[i], callbackOrListener, node);
            }
        };
        EventSubscriber.prototype.dispose = function () {
            var node = this.target;
            var callbackOrListener = this.handler;
            var events = this.events;
            var remove = dom_1.DOM.removeEventListener;
            for (var i = 0, ii = events.length; ii > i; ++i) {
                remove(events[i], callbackOrListener, node);
            }
            this.target = this.handler = null;
        };
        return EventSubscriber;
    }());
    exports.EventSubscriber = EventSubscriber;
    exports.IEventManager = di_1.DI.createInterface()
        .withDefault(function (x) { return x.singleton(EventManager); });
    var EventManager = (function () {
        function EventManager() {
            this.elementHandlerLookup = {};
            this.delegatedHandlers = {};
            this.capturedHandlers = {};
            this.registerElementConfiguration({
                tagName: 'input',
                properties: {
                    value: ['change', 'input'],
                    checked: ['change', 'input'],
                    files: ['change', 'input']
                }
            });
            this.registerElementConfiguration({
                tagName: 'textarea',
                properties: {
                    value: ['change', 'input']
                }
            });
            this.registerElementConfiguration({
                tagName: 'select',
                properties: {
                    value: ['change']
                }
            });
            this.registerElementConfiguration({
                tagName: 'content editable',
                properties: {
                    value: ['change', 'input', 'blur', 'keyup', 'paste']
                }
            });
            this.registerElementConfiguration({
                tagName: 'scrollable element',
                properties: {
                    scrollTop: ['scroll'],
                    scrollLeft: ['scroll']
                }
            });
        }
        EventManager.prototype.registerElementConfiguration = function (config) {
            var tagName = config.tagName.toLowerCase();
            var properties = config.properties;
            var lookup = this.elementHandlerLookup[tagName] = {};
            for (var propertyName in properties) {
                if (properties.hasOwnProperty(propertyName)) {
                    lookup[propertyName] = properties[propertyName];
                }
            }
        };
        EventManager.prototype.getElementHandler = function (target, propertyName) {
            var name = dom_1.DOM.normalizedTagName(target);
            var lookup = this.elementHandlerLookup;
            if (name) {
                if (lookup[name] && lookup[name][propertyName]) {
                    return new EventSubscriber(lookup[name][propertyName]);
                }
                if (propertyName === 'textContent' || propertyName === 'innerHTML') {
                    return new EventSubscriber(lookup['content editable'].value);
                }
                if (propertyName === 'scrollTop' || propertyName === 'scrollLeft') {
                    return new EventSubscriber(lookup['scrollable element'][propertyName]);
                }
            }
            return null;
        };
        EventManager.prototype.addEventListener = function (target, targetEvent, callbackOrListener, strategy) {
            var delegatedHandlers;
            var capturedHandlers;
            var handlerEntry;
            if (strategy === DelegationStrategy.bubbling) {
                delegatedHandlers = this.delegatedHandlers;
                handlerEntry = delegatedHandlers[targetEvent]
                    || (delegatedHandlers[targetEvent] = new ListenerTracker(targetEvent, handleDelegatedEvent, false));
                var delegatedCallbacks = target.delegatedCallbacks
                    || (target.delegatedCallbacks = {});
                return new DelegateOrCaptureSubscription(handlerEntry, delegatedCallbacks, targetEvent, callbackOrListener);
            }
            if (strategy === DelegationStrategy.capturing) {
                capturedHandlers = this.capturedHandlers;
                handlerEntry = capturedHandlers[targetEvent]
                    || (capturedHandlers[targetEvent] = new ListenerTracker(targetEvent, handleCapturedEvent, true));
                var capturedCallbacks = target.capturedCallbacks
                    || (target.capturedCallbacks = {});
                return new DelegateOrCaptureSubscription(handlerEntry, capturedCallbacks, targetEvent, callbackOrListener);
            }
            return new TriggerSubscription(target, targetEvent, callbackOrListener);
        };
        return EventManager;
    }());
});



define('runtime/binding/expression-parser',["require", "exports", "./ast", "../../kernel/reporter", "../../kernel/di", "../../kernel/platform"], function (require, exports, ast_1, reporter_1, di_1, platform_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.IExpressionParser = di_1.DI.createInterface()
        .withDefault(function (x) { return x.singleton(ExpressionParser); });
    var ExpressionParser = (function () {
        function ExpressionParser() {
            this.lookup = Object.create(null);
        }
        ExpressionParser.prototype.parse = function (expression) {
            var found = this.lookup[expression];
            if (found === undefined) {
                found = this.parseCore(expression);
                this.lookup[expression] = found;
            }
            return found;
        };
        ExpressionParser.prototype.cache = function (expressions) {
            Object.assign(this.lookup, expressions);
        };
        ExpressionParser.prototype.parseCore = function (expression) {
            try {
                var parts = expression.split('.');
                var firstPart = parts[0];
                var current = void 0;
                if (firstPart.endsWith('()')) {
                    current = new ast_1.CallScope(firstPart.replace('()', ''), platform_1.PLATFORM.emptyArray);
                }
                else {
                    current = new ast_1.AccessScope(parts[0]);
                }
                var index = 1;
                while (index < parts.length) {
                    var currentPart = parts[index];
                    if (currentPart.endsWith('()')) {
                        current = new ast_1.CallMember(current, currentPart.replace('()', ''), platform_1.PLATFORM.emptyArray);
                    }
                    else {
                        current = new ast_1.AccessMember(current, parts[index]);
                    }
                    index++;
                }
                return current;
            }
            catch (e) {
                throw reporter_1.Reporter.error(3, e);
            }
        };
        return ExpressionParser;
    }());
});



define('runtime/binding/listener',["require", "exports", "./binding-flags"], function (require, exports, binding_flags_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var Listener = (function () {
        function Listener(targetEvent, delegationStrategy, sourceExpression, target, preventDefault, eventManager, locator) {
            this.targetEvent = targetEvent;
            this.delegationStrategy = delegationStrategy;
            this.sourceExpression = sourceExpression;
            this.target = target;
            this.preventDefault = preventDefault;
            this.eventManager = eventManager;
            this.locator = locator;
            this.$isBound = false;
        }
        Listener.prototype.callSource = function (event) {
            var overrideContext = this.source.overrideContext;
            overrideContext['$event'] = event;
            var result = this.sourceExpression.evaluate(this.source, this.locator, binding_flags_1.BindingFlags.mustEvaluate);
            delete overrideContext['$event'];
            if (result !== true && this.preventDefault) {
                event.preventDefault();
            }
            return result;
        };
        Listener.prototype.handleEvent = function (event) {
            this.callSource(event);
        };
        Listener.prototype.$bind = function (source) {
            if (this.$isBound) {
                if (this.source === source) {
                    return;
                }
                this.$unbind();
            }
            this.$isBound = true;
            this.source = source;
            if (this.sourceExpression.bind) {
                this.sourceExpression.bind(this, source, binding_flags_1.BindingFlags.none);
            }
            this.handler = this.eventManager.addEventListener(this.target, this.targetEvent, this, this.delegationStrategy);
        };
        Listener.prototype.$unbind = function () {
            if (!this.$isBound) {
                return;
            }
            this.$isBound = false;
            if (this.sourceExpression.unbind) {
                this.sourceExpression.unbind(this, this.source, binding_flags_1.BindingFlags.none);
            }
            this.source = null;
            this.handler.dispose();
            this.handler = null;
        };
        Listener.prototype.observeProperty = function () { };
        return Listener;
    }());
    exports.Listener = Listener;
});



define('runtime/binding/map-change-records',["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    function newRecord(type, object, key, oldValue) {
        return {
            type: type,
            object: object,
            key: key,
            oldValue: oldValue
        };
    }
    function getChangeRecords(map) {
        var entries = new Array(map.size);
        var keys = map.keys();
        var i = 0;
        var item;
        while (item = keys.next()) {
            if (item.done) {
                break;
            }
            entries[i] = newRecord('added', map, item.value);
            i++;
        }
        return entries;
    }
    exports.getChangeRecords = getChangeRecords;
});



var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
define('runtime/binding/map-observation',["require", "exports", "./collection-observation"], function (require, exports, collection_observation_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var mapProto = Map.prototype;
    function getMapObserver(taskQueue, map) {
        var observer = map.__map_observer__;
        if (!observer) {
            Reflect.defineProperty(map, '__map_observer__', {
                value: observer = new ModifyMapObserver(taskQueue, map),
                enumerable: false, configurable: false
            });
        }
        return observer;
    }
    exports.getMapObserver = getMapObserver;
    var ModifyMapObserver = (function (_super) {
        __extends(ModifyMapObserver, _super);
        function ModifyMapObserver(taskQueue, map) {
            var _this = _super.call(this, taskQueue, map) || this;
            var observer = _this;
            var proto = mapProto;
            if (proto.set !== map.set || proto.delete !== map.delete || proto.clear !== map.clear) {
                proto = {
                    set: map.set,
                    delete: map.delete,
                    clear: map.clear
                };
            }
            map.set = function () {
                var hasValue = map.has(arguments[0]);
                var type = hasValue ? 'update' : 'add';
                var oldValue = map.get(arguments[0]);
                var methodCallResult = proto.set.apply(map, arguments);
                if (!hasValue || oldValue !== map.get(arguments[0])) {
                    observer.addChangeRecord({
                        type: type,
                        object: map,
                        key: arguments[0],
                        oldValue: oldValue
                    });
                }
                return methodCallResult;
            };
            map.delete = function () {
                var hasValue = map.has(arguments[0]);
                var oldValue = map.get(arguments[0]);
                var methodCallResult = proto.delete.apply(map, arguments);
                if (hasValue) {
                    observer.addChangeRecord({
                        type: 'delete',
                        object: map,
                        key: arguments[0],
                        oldValue: oldValue
                    });
                }
                return methodCallResult;
            };
            map.clear = function () {
                var methodCallResult = proto.clear.apply(map, arguments);
                observer.addChangeRecord({
                    type: 'clear',
                    object: map
                });
                return methodCallResult;
            };
            return _this;
        }
        return ModifyMapObserver;
    }(collection_observation_1.ModifyCollectionObserver));
});



define('runtime/binding/observation',["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
});



var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
define('runtime/binding/observer-locator',["require", "exports", "../dom", "./array-observation", "./map-observation", "./set-observation", "./event-manager", "./dirty-checker", "./property-observation", "./select-value-observer", "./checked-observer", "./element-observation", "./class-observer", "./svg-analyzer", "../../kernel/reporter", "../../kernel/di", "../task-queue", "./computed-observer"], function (require, exports, dom_1, array_observation_1, map_observation_1, set_observation_1, event_manager_1, dirty_checker_1, property_observation_1, select_value_observer_1, checked_observer_1, element_observation_1, class_observer_1, svg_analyzer_1, reporter_1, di_1, task_queue_1, computed_observer_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.IObserverLocator = di_1.DI.createInterface()
        .withDefault(function (x) { return x.singleton(ObserverLocator); });
    function getPropertyDescriptor(subject, name) {
        var pd = Object.getOwnPropertyDescriptor(subject, name);
        var proto = Object.getPrototypeOf(subject);
        while (typeof pd === 'undefined' && proto !== null) {
            pd = Object.getOwnPropertyDescriptor(proto, name);
            proto = Object.getPrototypeOf(proto);
        }
        return pd;
    }
    var ObserverLocator = (function () {
        function ObserverLocator(taskQueue, eventManager, dirtyChecker, svgAnalyzer) {
            this.taskQueue = taskQueue;
            this.eventManager = eventManager;
            this.dirtyChecker = dirtyChecker;
            this.svgAnalyzer = svgAnalyzer;
            this.adapters = [];
        }
        ObserverLocator.prototype.getObserver = function (obj, propertyName) {
            var observersLookup = obj.$observers;
            var observer;
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
        };
        ObserverLocator.prototype.getOrCreateObserversLookup = function (obj) {
            return obj.$observers || this.createObserversLookup(obj);
        };
        ObserverLocator.prototype.createObserversLookup = function (obj) {
            var value = {};
            if (!Reflect.defineProperty(obj, '$observers', {
                enumerable: false,
                configurable: false,
                writable: false,
                value: value
            })) {
                reporter_1.Reporter.write(0, obj);
            }
            return value;
        };
        ObserverLocator.prototype.addAdapter = function (adapter) {
            this.adapters.push(adapter);
        };
        ObserverLocator.prototype.getAdapterObserver = function (obj, propertyName, descriptor) {
            for (var i = 0, ii = this.adapters.length; i < ii; i++) {
                var adapter = this.adapters[i];
                var observer = adapter.getObserver(obj, propertyName, descriptor);
                if (observer) {
                    return observer;
                }
            }
            return null;
        };
        ObserverLocator.prototype.createPropertyObserver = function (obj, propertyName) {
            if (!(obj instanceof Object)) {
                return new property_observation_1.PrimitiveObserver(obj, propertyName);
            }
            if (dom_1.DOM.isNodeInstance(obj)) {
                if (propertyName === 'class') {
                    return new class_observer_1.ClassObserver(obj);
                }
                if (propertyName === 'style' || propertyName === 'css') {
                    return new element_observation_1.StyleObserver(obj, propertyName);
                }
                var handler = this.eventManager.getElementHandler(obj, propertyName);
                if (propertyName === 'value' && dom_1.DOM.normalizedTagName(obj) === 'select') {
                    return new select_value_observer_1.SelectValueObserver(obj, handler, this.taskQueue, this);
                }
                if (propertyName === 'checked' && dom_1.DOM.normalizedTagName(obj) === 'input') {
                    return new checked_observer_1.CheckedObserver(obj, handler, this.taskQueue, this);
                }
                if (handler) {
                    return new element_observation_1.ValueAttributeObserver(obj, propertyName, handler);
                }
                var xlinkResult = /^xlink:(.+)$/.exec(propertyName);
                if (xlinkResult) {
                    return new element_observation_1.XLinkAttributeObserver(obj, propertyName, xlinkResult[1]);
                }
                if (propertyName === 'role'
                    || /^\w+:|^data-|^aria-/.test(propertyName)
                    || this.svgAnalyzer.isStandardSvgAttribute(obj, propertyName)) {
                    return new element_observation_1.DataAttributeObserver(obj, propertyName);
                }
            }
            var descriptor = getPropertyDescriptor(obj, propertyName);
            if (descriptor) {
                if (descriptor.get || descriptor.set) {
                    if (descriptor.get && descriptor.get.getObserver) {
                        return descriptor.get.getObserver(obj);
                    }
                    var adapterObserver = this.getAdapterObserver(obj, propertyName, descriptor);
                    if (adapterObserver) {
                        return adapterObserver;
                    }
                    return computed_observer_1.createComputedObserver(this, this.dirtyChecker, this.taskQueue, obj, propertyName, descriptor);
                }
            }
            if (obj instanceof Array) {
                if (propertyName === 'length') {
                    return this.getArrayObserver(obj).getLengthObserver();
                }
                return this.dirtyChecker.createProperty(obj, propertyName);
            }
            else if (obj instanceof Map) {
                if (propertyName === 'size') {
                    return this.getMapObserver(obj).getLengthObserver();
                }
                return this.dirtyChecker.createProperty(obj, propertyName);
            }
            else if (obj instanceof Set) {
                if (propertyName === 'size') {
                    return this.getSetObserver(obj).getLengthObserver();
                }
                return this.dirtyChecker.createProperty(obj, propertyName);
            }
            return new property_observation_1.SetterObserver(this.taskQueue, obj, propertyName);
        };
        ObserverLocator.prototype.getAccessor = function (obj, propertyName) {
            if (dom_1.DOM.isNodeInstance(obj)) {
                var normalizedTagName = dom_1.DOM.normalizedTagName;
                if (propertyName === 'class'
                    || propertyName === 'style' || propertyName === 'css'
                    || propertyName === 'value' && (normalizedTagName(obj) === 'input' || normalizedTagName(obj) === 'select')
                    || propertyName === 'checked' && normalizedTagName(obj) === 'input'
                    || propertyName === 'model' && normalizedTagName(obj) === 'input'
                    || /^xlink:.+$/.exec(propertyName)) {
                    return this.getObserver(obj, propertyName);
                }
                if (/^\w+:|^data-|^aria-/.test(propertyName)
                    || this.svgAnalyzer.isStandardSvgAttribute(obj, propertyName)
                    || normalizedTagName(obj) === 'img' && propertyName === 'src'
                    || normalizedTagName(obj) === 'a' && propertyName === 'href') {
                    return element_observation_1.dataAttributeAccessor;
                }
            }
            return property_observation_1.propertyAccessor;
        };
        ObserverLocator.prototype.getArrayObserver = function (array) {
            return array_observation_1.getArrayObserver(this.taskQueue, array);
        };
        ObserverLocator.prototype.getMapObserver = function (map) {
            return map_observation_1.getMapObserver(this.taskQueue, map);
        };
        ObserverLocator.prototype.getSetObserver = function (set) {
            return set_observation_1.getSetObserver(this.taskQueue, set);
        };
        ObserverLocator = __decorate([
            di_1.inject(task_queue_1.ITaskQueue, event_manager_1.IEventManager, dirty_checker_1.IDirtyChecker, svg_analyzer_1.ISVGAnalyzer),
            __metadata("design:paramtypes", [Object, Object, Object, Object])
        ], ObserverLocator);
        return ObserverLocator;
    }());
});



var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
define('runtime/binding/property-observation',["require", "exports", "./subscriber-collection", "../../kernel/reporter"], function (require, exports, subscriber_collection_1, reporter_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.propertyAccessor = {
        getValue: function (obj, propertyName) { return obj[propertyName]; },
        setValue: function (value, obj, propertyName) { obj[propertyName] = value; }
    };
    var PrimitiveObserver = (function () {
        function PrimitiveObserver(primitive, propertyName) {
            this.primitive = primitive;
            this.propertyName = propertyName;
            this.doNotCache = true;
            this.primitive = primitive;
            this.propertyName = propertyName;
        }
        PrimitiveObserver.prototype.getValue = function () {
            return this.primitive[this.propertyName];
        };
        PrimitiveObserver.prototype.setValue = function () {
            throw reporter_1.Reporter.error(14, typeof this.primitive + "#" + this.propertyName);
        };
        PrimitiveObserver.prototype.subscribe = function () { };
        PrimitiveObserver.prototype.unsubscribe = function () { };
        return PrimitiveObserver;
    }());
    exports.PrimitiveObserver = PrimitiveObserver;
    var SetterObserver = (function (_super) {
        __extends(SetterObserver, _super);
        function SetterObserver(taskQueue, obj, propertyName) {
            var _this = _super.call(this) || this;
            _this.taskQueue = taskQueue;
            _this.obj = obj;
            _this.propertyName = propertyName;
            _this.queued = false;
            _this.observing = false;
            return _this;
        }
        SetterObserver.prototype.getValue = function () {
            return this.obj[this.propertyName];
        };
        SetterObserver.prototype.setValue = function (newValue) {
            this.obj[this.propertyName] = newValue;
        };
        SetterObserver.prototype.getterValue = function () {
            return this.currentValue;
        };
        SetterObserver.prototype.setterValue = function (newValue) {
            var oldValue = this.currentValue;
            if (oldValue !== newValue) {
                if (!this.queued) {
                    this.oldValue = oldValue;
                    this.queued = true;
                    this.taskQueue.queueMicroTask(this);
                }
                this.currentValue = newValue;
            }
        };
        SetterObserver.prototype.call = function () {
            var oldValue = this.oldValue;
            var newValue = this.currentValue;
            this.queued = false;
            this.callSubscribers(newValue, oldValue);
        };
        SetterObserver.prototype.subscribe = function (context, callable) {
            if (!this.observing) {
                this.convertProperty();
            }
            this.addSubscriber(context, callable);
        };
        SetterObserver.prototype.unsubscribe = function (context, callable) {
            this.removeSubscriber(context, callable);
        };
        SetterObserver.prototype.convertProperty = function () {
            this.observing = true;
            this.currentValue = this.obj[this.propertyName];
            this.setValue = this.setterValue;
            this.getValue = this.getterValue;
            if (!Reflect.defineProperty(this.obj, this.propertyName, {
                configurable: true,
                enumerable: this.propertyName in this.obj ? this.obj.propertyIsEnumerable(this.propertyName) : true,
                get: this.getValue.bind(this),
                set: this.setValue.bind(this)
            })) {
                reporter_1.Reporter.write(1, this.propertyName, this.obj);
            }
        };
        return SetterObserver;
    }(subscriber_collection_1.SubscriberCollection));
    exports.SetterObserver = SetterObserver;
    var Observer = (function (_super) {
        __extends(Observer, _super);
        function Observer(taskQueue, currentValue, selfCallback) {
            var _this = _super.call(this) || this;
            _this.taskQueue = taskQueue;
            _this.currentValue = currentValue;
            _this.selfCallback = selfCallback;
            _this.queued = false;
            return _this;
        }
        Observer.prototype.getValue = function () {
            return this.currentValue;
        };
        Observer.prototype.setValue = function (newValue) {
            var oldValue = this.currentValue;
            if (oldValue !== newValue) {
                if (!this.queued) {
                    this.oldValue = oldValue;
                    this.queued = true;
                    this.taskQueue.queueMicroTask(this);
                }
                if (this.selfCallback !== undefined) {
                    var coercedValue = this.selfCallback(newValue, oldValue);
                    if (coercedValue !== undefined) {
                        newValue = coercedValue;
                    }
                }
                this.currentValue = newValue;
            }
        };
        Observer.prototype.call = function () {
            var oldValue = this.oldValue;
            var newValue = this.currentValue;
            this.queued = false;
            this.callSubscribers(newValue, oldValue);
        };
        Observer.prototype.subscribe = function (context, callable) {
            this.addSubscriber(context, callable);
        };
        Observer.prototype.unsubscribe = function (context, callable) {
            this.removeSubscriber(context, callable);
        };
        return Observer;
    }(subscriber_collection_1.SubscriberCollection));
    exports.Observer = Observer;
});



define('runtime/binding/ref',["require", "exports", "./binding-flags"], function (require, exports, binding_flags_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var Ref = (function () {
        function Ref(sourceExpression, target, locator) {
            this.sourceExpression = sourceExpression;
            this.target = target;
            this.locator = locator;
            this.$isBound = false;
        }
        Ref.prototype.$bind = function (scope) {
            if (this.$isBound) {
                if (this.$scope === scope) {
                    return;
                }
                this.$unbind();
            }
            this.$isBound = true;
            this.$scope = scope;
            if (this.sourceExpression.bind) {
                this.sourceExpression.bind(this, scope, binding_flags_1.BindingFlags.none);
            }
            this.sourceExpression.assign(this.$scope, this.target, this.locator, binding_flags_1.BindingFlags.none);
        };
        Ref.prototype.$unbind = function () {
            if (!this.$isBound) {
                return;
            }
            this.$isBound = false;
            if (this.sourceExpression.evaluate(this.$scope, this.locator, binding_flags_1.BindingFlags.none) === this.target) {
                this.sourceExpression.assign(this.$scope, null, this.locator, binding_flags_1.BindingFlags.none);
            }
            if (this.sourceExpression.unbind) {
                this.sourceExpression.unbind(this, this.$scope, binding_flags_1.BindingFlags.none);
            }
            this.$scope = null;
        };
        Ref.prototype.observeProperty = function (context, name) { };
        return Ref;
    }());
    exports.Ref = Ref;
});



var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
define('runtime/binding/select-value-observer',["require", "exports", "./subscriber-collection", "../dom"], function (require, exports, subscriber_collection_1, dom_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var selectArrayContext = 'SelectValueObserver:array';
    var SelectValueObserver = (function (_super) {
        __extends(SelectValueObserver, _super);
        function SelectValueObserver(node, handler, taskQueue, observerLocator) {
            var _this = _super.call(this) || this;
            _this.node = node;
            _this.handler = handler;
            _this.taskQueue = taskQueue;
            _this.observerLocator = observerLocator;
            _this.initialSync = false;
            _this.node = node;
            _this.handler = handler;
            _this.observerLocator = observerLocator;
            return _this;
        }
        SelectValueObserver.prototype.getValue = function () {
            return this.value;
        };
        SelectValueObserver.prototype.setValue = function (newValue) {
            if (newValue !== null && newValue !== undefined && this.node.multiple && !Array.isArray(newValue)) {
                throw new Error('Only null or Array instances can be bound to a multi-select.');
            }
            if (this.value === newValue) {
                return;
            }
            if (this.arrayObserver) {
                this.arrayObserver.unsubscribe(selectArrayContext, this);
                this.arrayObserver = null;
            }
            if (Array.isArray(newValue)) {
                this.arrayObserver = this.observerLocator.getArrayObserver(newValue);
                this.arrayObserver.subscribe(selectArrayContext, this);
            }
            this.oldValue = this.value;
            this.value = newValue;
            this.synchronizeOptions();
            this.notify();
            if (!this.initialSync) {
                this.initialSync = true;
                this.taskQueue.queueMicroTask(this);
            }
        };
        SelectValueObserver.prototype.call = function (context, splices) {
            this.synchronizeOptions();
        };
        SelectValueObserver.prototype.synchronizeOptions = function () {
            var value = this.value;
            var isArray;
            if (Array.isArray(value)) {
                isArray = true;
            }
            var options = this.node.options;
            var i = options.length;
            var matcher = this.node.matcher || (function (a, b) { return a === b; });
            var _loop_1 = function () {
                var option = options.item(i);
                var optionValue = option.hasOwnProperty('model') ? option.model : option.value;
                if (isArray) {
                    option.selected = value.findIndex(function (item) { return !!matcher(optionValue, item); }) !== -1;
                    return "continue";
                }
                option.selected = !!matcher(optionValue, value);
            };
            while (i--) {
                _loop_1();
            }
        };
        SelectValueObserver.prototype.synchronizeValue = function () {
            var options = this.node.options;
            var count = 0;
            var value = [];
            for (var i = 0, ii = options.length; i < ii; i++) {
                var option = options.item(i);
                if (!option.selected) {
                    continue;
                }
                value.push(option.hasOwnProperty('model') ? option.model : option.value);
                count++;
            }
            if (this.node.multiple) {
                if (Array.isArray(this.value)) {
                    var matcher_1 = this.node.matcher || (function (a, b) { return a === b; });
                    var i = 0;
                    var _loop_2 = function () {
                        var a = this_1.value[i];
                        if (value.findIndex(function (b) { return matcher_1(a, b); }) === -1) {
                            this_1.value.splice(i, 1);
                        }
                        else {
                            i++;
                        }
                    };
                    var this_1 = this;
                    while (i < this.value.length) {
                        _loop_2();
                    }
                    i = 0;
                    var _loop_3 = function () {
                        var a = value[i];
                        if (this_2.value.findIndex(function (b) { return matcher_1(a, b); }) === -1) {
                            this_2.value.push(a);
                        }
                        i++;
                    };
                    var this_2 = this;
                    while (i < value.length) {
                        _loop_3();
                    }
                    return;
                }
            }
            else {
                if (count === 0) {
                    value = null;
                }
                else {
                    value = value[0];
                }
            }
            if (value !== this.value) {
                this.oldValue = this.value;
                this.value = value;
                this.notify();
            }
        };
        SelectValueObserver.prototype.notify = function () {
            var oldValue = this.oldValue;
            var newValue = this.value;
            this.callSubscribers(newValue, oldValue);
        };
        SelectValueObserver.prototype.handleEvent = function () {
            this.synchronizeValue();
        };
        SelectValueObserver.prototype.subscribe = function (context, callable) {
            if (!this.hasSubscribers()) {
                this.handler.subscribe(this.node, this);
            }
            this.addSubscriber(context, callable);
        };
        SelectValueObserver.prototype.unsubscribe = function (context, callable) {
            if (this.removeSubscriber(context, callable) && !this.hasSubscribers()) {
                this.handler.dispose();
            }
        };
        SelectValueObserver.prototype.bind = function () {
            var _this = this;
            this.childObserver = dom_1.DOM.createChildObserver(this.node, function () {
                _this.synchronizeOptions();
                _this.synchronizeValue();
            }, { childList: true, subtree: true, characterData: true });
        };
        SelectValueObserver.prototype.unbind = function () {
            this.childObserver.disconnect();
            this.childObserver = null;
            if (this.arrayObserver) {
                this.arrayObserver.unsubscribe(selectArrayContext, this);
                this.arrayObserver = null;
            }
        };
        return SelectValueObserver;
    }(subscriber_collection_1.SubscriberCollection));
    exports.SelectValueObserver = SelectValueObserver;
});



var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
define('runtime/binding/set-observation',["require", "exports", "./collection-observation"], function (require, exports, collection_observation_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var setProto = Set.prototype;
    function getSetObserver(taskQueue, set) {
        var observer = set.__set_observer__;
        if (!observer) {
            Reflect.defineProperty(set, '__set_observer__', {
                value: observer = new ModifySetObserver(taskQueue, set),
                enumerable: false, configurable: false
            });
        }
        return observer;
    }
    exports.getSetObserver = getSetObserver;
    var ModifySetObserver = (function (_super) {
        __extends(ModifySetObserver, _super);
        function ModifySetObserver(taskQueue, set) {
            var _this = _super.call(this, taskQueue, set) || this;
            var observer = _this;
            var proto = setProto;
            if (proto.add !== set.add || proto.delete !== set.delete || proto.clear !== set.clear) {
                proto = {
                    add: set.add,
                    delete: set.delete,
                    clear: set.clear
                };
            }
            set.add = function () {
                var type = 'add';
                var oldSize = set.size;
                var methodCallResult = proto.add.apply(set, arguments);
                var hasValue = set.size === oldSize;
                if (!hasValue) {
                    observer.addChangeRecord({
                        type: type,
                        object: set,
                        value: Array.from(set).pop()
                    });
                }
                return methodCallResult;
            };
            set.delete = function () {
                var hasValue = set.has(arguments[0]);
                var methodCallResult = proto.delete.apply(set, arguments);
                if (hasValue) {
                    observer.addChangeRecord({
                        type: 'delete',
                        object: set,
                        value: arguments[0]
                    });
                }
                return methodCallResult;
            };
            set.clear = function () {
                var methodCallResult = proto.clear.apply(set, arguments);
                observer.addChangeRecord({
                    type: 'clear',
                    object: set
                });
                return methodCallResult;
            };
            return observer;
        }
        return ModifySetObserver;
    }(collection_observation_1.ModifyCollectionObserver));
});



define('runtime/binding/signaler',["require", "exports", "../../kernel/di", "./binding-context"], function (require, exports, di_1, binding_context_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ISignaler = di_1.DI.createInterface()
        .withDefault(function (x) { return x.singleton((function () {
        function class_1() {
        }
        class_1.prototype.dispatchSignal = function (name) {
            var bindings = this.signals[name];
            if (!bindings) {
                return;
            }
            var i = bindings.length;
            while (i--) {
                bindings[i].call(binding_context_1.sourceContext);
            }
        };
        class_1.prototype.addSignalListener = function (name, listener) {
            (this.signals[name] || (this.signals[name] = [])).push(listener);
        };
        class_1.prototype.removeSignalListener = function (name, listener) {
            var listeners = this.signals[name];
            if (listeners) {
                listeners.splice(listeners.indexOf(listener), 1);
            }
        };
        return class_1;
    }())); });
});



define('runtime/binding/subscriber-collection',["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var arrayPool1 = [];
    var arrayPool2 = [];
    var poolUtilization = [];
    var SubscriberCollection = (function () {
        function SubscriberCollection() {
            this._context0 = null;
            this._callable0 = null;
            this._context1 = null;
            this._callable1 = null;
            this._context2 = null;
            this._callable2 = null;
            this._contextsRest = null;
            this._callablesRest = null;
        }
        SubscriberCollection.prototype.addSubscriber = function (context, callable) {
            if (this.hasSubscriber(context, callable)) {
                return false;
            }
            if (!this._context0) {
                this._context0 = context;
                this._callable0 = callable;
                return true;
            }
            if (!this._context1) {
                this._context1 = context;
                this._callable1 = callable;
                return true;
            }
            if (!this._context2) {
                this._context2 = context;
                this._callable2 = callable;
                return true;
            }
            if (!this._contextsRest) {
                this._contextsRest = [context];
                this._callablesRest = [callable];
                return true;
            }
            this._contextsRest.push(context);
            this._callablesRest.push(callable);
            return true;
        };
        SubscriberCollection.prototype.removeSubscriber = function (context, callable) {
            if (this._context0 === context && this._callable0 === callable) {
                this._context0 = null;
                this._callable0 = null;
                return true;
            }
            if (this._context1 === context && this._callable1 === callable) {
                this._context1 = null;
                this._callable1 = null;
                return true;
            }
            if (this._context2 === context && this._callable2 === callable) {
                this._context2 = null;
                this._callable2 = null;
                return true;
            }
            var callables = this._callablesRest;
            if (callables === null || callables.length === 0) {
                return false;
            }
            var contexts = this._contextsRest;
            var i = 0;
            while (!(callables[i] === callable && contexts[i] === context) && callables.length > i) {
                i++;
            }
            if (i >= callables.length) {
                return false;
            }
            contexts.splice(i, 1);
            callables.splice(i, 1);
            return true;
        };
        SubscriberCollection.prototype.callSubscribers = function (newValue, oldValue) {
            var context0 = this._context0;
            var callable0 = this._callable0;
            var context1 = this._context1;
            var callable1 = this._callable1;
            var context2 = this._context2;
            var callable2 = this._callable2;
            var length = this._contextsRest ? this._contextsRest.length : 0;
            var contextsRest;
            var callablesRest;
            var poolIndex;
            var i;
            if (length) {
                poolIndex = poolUtilization.length;
                while (poolIndex-- && poolUtilization[poolIndex]) {
                }
                if (poolIndex < 0) {
                    poolIndex = poolUtilization.length;
                    contextsRest = [];
                    callablesRest = [];
                    poolUtilization.push(true);
                    arrayPool1.push(contextsRest);
                    arrayPool2.push(callablesRest);
                }
                else {
                    poolUtilization[poolIndex] = true;
                    contextsRest = arrayPool1[poolIndex];
                    callablesRest = arrayPool2[poolIndex];
                }
                i = length;
                while (i--) {
                    contextsRest[i] = this._contextsRest[i];
                    callablesRest[i] = this._callablesRest[i];
                }
            }
            if (context0) {
                if (callable0) {
                    callable0.call(context0, newValue, oldValue);
                }
                else {
                    context0(newValue, oldValue);
                }
            }
            if (context1) {
                if (callable1) {
                    callable1.call(context1, newValue, oldValue);
                }
                else {
                    context1(newValue, oldValue);
                }
            }
            if (context2) {
                if (callable2) {
                    callable2.call(context2, newValue, oldValue);
                }
                else {
                    context2(newValue, oldValue);
                }
            }
            if (length) {
                for (i = 0; i < length; i++) {
                    var callable = callablesRest[i];
                    var context_1 = contextsRest[i];
                    if (callable) {
                        callable.call(context_1, newValue, oldValue);
                    }
                    else {
                        context_1(newValue, oldValue);
                    }
                    contextsRest[i] = null;
                    callablesRest[i] = null;
                }
                poolUtilization[poolIndex] = false;
            }
        };
        SubscriberCollection.prototype.hasSubscribers = function () {
            return !!(this._context0
                || this._context1
                || this._context2
                || this._contextsRest && this._contextsRest.length);
        };
        SubscriberCollection.prototype.hasSubscriber = function (context, callable) {
            var has = this._context0 === context && this._callable0 === callable
                || this._context1 === context && this._callable1 === callable
                || this._context2 === context && this._callable2 === callable;
            if (has) {
                return true;
            }
            var index;
            var contexts = this._contextsRest;
            if (!contexts || (index = contexts.length) === 0) {
                return false;
            }
            var callables = this._callablesRest;
            while (index--) {
                if (contexts[index] === context && callables[index] === callable) {
                    return true;
                }
            }
            return false;
        };
        return SubscriberCollection;
    }());
    exports.SubscriberCollection = SubscriberCollection;
});



define('runtime/binding/svg-analyzer',["require", "exports", "../../kernel/di"], function (require, exports, di_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ISVGAnalyzer = di_1.DI.createInterface()
        .withDefault(function (x) { return x.singleton((function () {
        function class_1() {
        }
        class_1.prototype.isStandardSvgAttribute = function (node, attributeName) {
            return false;
        };
        return class_1;
    }())); });
});



define('runtime/binding/value-converter',["require", "exports", "../../kernel/di"], function (require, exports, di_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    function valueConverter(nameOrSource) {
        return function (target) {
            return exports.ValueConverterResource.define(nameOrSource, target);
        };
    }
    exports.valueConverter = valueConverter;
    exports.ValueConverterResource = {
        name: 'value-converter',
        key: function (name) {
            return this.name + ":" + name;
        },
        isType: function (type) {
            return type.kind === this;
        },
        define: function (nameOrSource, ctor) {
            var description = typeof nameOrSource === 'string' ? { name: nameOrSource } : nameOrSource;
            var Type = ctor;
            Type.kind = exports.ValueConverterResource;
            Type.description = description;
            Type.register = function (container) {
                container.register(di_1.Registration.singleton(Type.kind.key(description.name), Type));
            };
            return Type;
        }
    };
});



define('runtime/templating/animator',["require", "exports", "../../kernel/di"], function (require, exports, di_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.IAnimator = di_1.DI.createInterface()
        .withDefault(function (x) { return x.singleton((function () {
        function class_1() {
        }
        class_1.prototype.enter = function (node) {
            return Promise.resolve(false);
        };
        class_1.prototype.leave = function (node) {
            return Promise.resolve(false);
        };
        class_1.prototype.removeClass = function (node, className) {
            node.classList.remove(className);
            return Promise.resolve(false);
        };
        class_1.prototype.addClass = function (node, className) {
            node.classList.add(className);
            return Promise.resolve(false);
        };
        return class_1;
    }())); });
});



define('runtime/templating/bindable',["require", "exports", "../binding/binding-mode"], function (require, exports, binding_mode_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var capitalMatcher = /([A-Z])/g;
    function addHyphenAndLower(char) {
        return '-' + char.toLowerCase();
    }
    function hyphenate(name) {
        return (name.charAt(0).toLowerCase() + name.slice(1)).replace(capitalMatcher, addHyphenAndLower);
    }
    function bindable(configOrTarget, key, descriptor) {
        var deco = function (target, key2, descriptor2) {
            target = target.constructor;
            var bindables = target.bindables || (target.bindables = {});
            var config = configOrTarget || {};
            if (!config.attribute) {
                config.attribute = hyphenate(key2);
            }
            if (!config.callback) {
                config.callback = key2 + "Changed";
            }
            if (!config.mode) {
                config.mode = binding_mode_1.BindingMode.oneWay;
            }
            config.property = key2;
            bindables[key2] = config;
        };
        if (key) {
            var target = configOrTarget;
            configOrTarget = null;
            return deco(target, key, descriptor);
        }
        return deco;
    }
    exports.bindable = bindable;
});



define('runtime/templating/custom-attribute',["require", "exports", "../../kernel/di", "../../kernel/platform", "../binding/binding-mode"], function (require, exports, di_1, platform_1, binding_mode_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    function customAttribute(nameOrSource) {
        return function (target) {
            return exports.CustomAttributeResource.define(nameOrSource, target);
        };
    }
    exports.customAttribute = customAttribute;
    function templateController(nameOrSource) {
        return function (target) {
            var source;
            if (typeof nameOrSource === 'string') {
                source = {
                    name: nameOrSource,
                    isTemplateController: true
                };
            }
            else {
                source = Object.assign({ isTemplateController: true }, nameOrSource);
            }
            return exports.CustomAttributeResource.define(source, target);
        };
    }
    exports.templateController = templateController;
    exports.CustomAttributeResource = {
        name: 'custom-attribute',
        key: function (name) {
            return this.name + ":" + name;
        },
        isType: function (type) {
            return type.kind === this;
        },
        define: function (nameOrSource, ctor) {
            var Type = ctor;
            var description = createDescription(typeof nameOrSource === 'string' ? { name: nameOrSource } : nameOrSource, Type);
            var proto = Type.prototype;
            Type.kind = exports.CustomAttributeResource;
            Type.description = description;
            Type.register = function register(container) {
                var resourceKey = Type.kind.key(description.name);
                container.register(di_1.Registration.transient(resourceKey, Type));
                var aliases = description.aliases;
                for (var i = 0, ii = aliases.length; i < ii; ++i) {
                    container.register(di_1.Registration.alias(resourceKey, aliases[i]));
                }
            };
            proto.$hydrate = function (renderingEngine) {
                this.$changeCallbacks = [];
                this.$isAttached = false;
                this.$isBound = false;
                this.$scope = null;
                this.$slot = null;
                this.$behavior = renderingEngine.applyRuntimeBehavior(Type, this, description.bindables);
                if (this.$behavior.hasCreated) {
                    this.created();
                }
            };
            proto.$bind = function (scope) {
                if (this.$isBound) {
                    if (this.$scope === scope) {
                        return;
                    }
                    this.$unbind();
                }
                this.$scope = scope;
                this.$isBound = true;
                var changeCallbacks = this.$changeCallbacks;
                for (var i = 0, ii = changeCallbacks.length; i < ii; ++i) {
                    changeCallbacks[i]();
                }
                if (this.$behavior.hasBound) {
                    this.bound(scope);
                }
            };
            proto.$attach = function (encapsulationSource, lifecycle) {
                if (this.$isAttached) {
                    return;
                }
                if (this.$behavior.hasAttaching) {
                    this.attaching(encapsulationSource);
                }
                if (this.$slot !== null) {
                    this.$slot.$attach(encapsulationSource, lifecycle);
                }
                if (this.$behavior.hasAttached) {
                    lifecycle.queueAttachedCallback(this);
                }
                this.$isAttached = true;
            };
            proto.$detach = function (lifecycle) {
                if (this.$isAttached) {
                    if (this.$behavior.hasDetaching) {
                        this.detaching();
                    }
                    if (this.$slot !== null) {
                        this.$slot.$detach(lifecycle);
                    }
                    if (this.$behavior.hasDetached) {
                        lifecycle.queueDetachedCallback(this);
                    }
                    this.$isAttached = false;
                }
            };
            proto.$unbind = function () {
                if (this.$isBound) {
                    if (this.$behavior.hasUnbound) {
                        this.unbound();
                    }
                    this.$isBound = false;
                }
            };
            return Type;
        }
    };
    function createDescription(attributeSource, Type) {
        return {
            name: attributeSource.name,
            aliases: attributeSource.aliases || platform_1.PLATFORM.emptyArray,
            defaultBindingMode: attributeSource.defaultBindingMode || binding_mode_1.BindingMode.oneWay,
            isTemplateController: attributeSource.isTemplateController || false,
            bindables: Object.assign({}, Type.bindables, attributeSource.bindables)
        };
    }
});



define('runtime/templating/custom-element',["require", "exports", "./lifecycle", "./view", "../dom", "../../kernel/di", "../binding/binding-context", "./shadow-dom", "../../kernel/platform"], function (require, exports, lifecycle_1, view_1, dom_1, di_1, binding_context_1, shadow_dom_1, platform_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    function customElement(nameOrSource) {
        return function (target) {
            return exports.CustomElementResource.define(nameOrSource, target);
        };
    }
    exports.customElement = customElement;
    var defaultShadowOptions = { mode: 'open' };
    function useShadowDOM(targetOrOptions) {
        var options = typeof targetOrOptions === 'function' || !targetOrOptions
            ? defaultShadowOptions
            : targetOrOptions;
        var deco = function (target) {
            target.shadowOptions = options;
            return target;
        };
        return typeof targetOrOptions === 'function' ? deco(targetOrOptions) : deco;
    }
    exports.useShadowDOM = useShadowDOM;
    function containerless(target) {
        var deco = function (target) {
            target.containerless = true;
            return target;
        };
        return target ? deco(target) : deco;
    }
    exports.containerless = containerless;
    exports.CustomElementResource = {
        name: 'custom-element',
        key: function (name) {
            return this.name + ":" + name;
        },
        isType: function (type) {
            return type.kind === this;
        },
        define: function (nameOrSource, ctor) {
            if (ctor === void 0) { ctor = null; }
            var Type = ctor === null ? (function () {
                function HTMLOnlyElement() {
                }
                return HTMLOnlyElement;
            }()) : ctor;
            var description = createDescription(typeof nameOrSource === 'string' ? { name: nameOrSource } : nameOrSource, Type);
            var proto = Type.prototype;
            Type.kind = exports.CustomElementResource;
            Type.description = description;
            Type.register = function (container) {
                container.register(di_1.Registration.transient(Type.kind.key(description.name), Type));
            };
            proto.$hydrate = function (renderingEngine, host, options) {
                if (options === void 0) { options = platform_1.PLATFORM.emptyObject; }
                var template = renderingEngine.getElementTemplate(description, Type);
                this.$bindable = [];
                this.$attachable = [];
                this.$changeCallbacks = [];
                this.$slots = description.hasSlots ? {} : null;
                this.$usingSlotEmulation = description.hasSlots || false;
                this.$slot = null;
                this.$isAttached = false;
                this.$isBound = false;
                this.$scope = {
                    bindingContext: this,
                    overrideContext: binding_context_1.BindingContext.createOverride()
                };
                this.$context = template.renderContext;
                this.$behavior = renderingEngine.applyRuntimeBehavior(Type, this, description.bindables);
                this.$host = description.containerless ? dom_1.DOM.convertToAnchor(host, true) : host;
                this.$shadowRoot = dom_1.DOM.createElementViewHost(this.$host, description.shadowOptions);
                this.$usingSlotEmulation = dom_1.DOM.isUsingSlotEmulation(this.$host);
                this.$contentView = view_1.View.fromCompiledContent(this.$host, options);
                this.$view = this.$behavior.hasCreateView
                    ? this.createView(host, options.parts, template)
                    : template.createFor(this, host, options.parts);
                this.$host.$component = this;
                if (this.$behavior.hasCreated) {
                    this.created();
                }
            };
            proto.$bind = function () {
                if (this.$isBound) {
                    return;
                }
                var scope = this.$scope;
                var bindable = this.$bindable;
                for (var i = 0, ii = bindable.length; i < ii; ++i) {
                    bindable[i].$bind(scope);
                }
                this.$isBound = true;
                var changeCallbacks = this.$changeCallbacks;
                for (var i = 0, ii = changeCallbacks.length; i < ii; ++i) {
                    changeCallbacks[i]();
                }
                if (this.$behavior.hasBound) {
                    this.bound();
                }
            };
            proto.$attach = function (encapsulationSource, lifecycle) {
                if (this.$isAttached) {
                    return;
                }
                lifecycle = lifecycle_1.AttachLifecycle.start(this, lifecycle);
                encapsulationSource = this.$usingSlotEmulation
                    ? encapsulationSource || this.$host
                    : this.$shadowRoot;
                if (this.$behavior.hasAttaching) {
                    this.attaching(encapsulationSource);
                }
                var attachable = this.$attachable;
                for (var i = 0, ii = attachable.length; i < ii; ++i) {
                    attachable[i].$attach(encapsulationSource, lifecycle);
                }
                if (this.$slot !== null) {
                    this.$slot.$attach(encapsulationSource, lifecycle);
                }
                if (this.$contentView !== null && this.$slots) {
                    shadow_dom_1.ShadowDOMEmulation.distributeContent(this.$contentView, this.$slots);
                }
                if (description.containerless) {
                    this.$view.insertBefore(this.$host);
                }
                else {
                    this.$view.appendTo(this.$shadowRoot);
                }
                if (this.$behavior.hasAttached) {
                    lifecycle.queueAttachedCallback(this);
                }
                this.$isAttached = true;
                lifecycle.end(this);
            };
            proto.$detach = function (lifecycle) {
                if (this.$isAttached) {
                    lifecycle = lifecycle_1.DetachLifecycle.start(this, lifecycle);
                    if (this.$behavior.hasDetaching) {
                        this.detaching();
                    }
                    lifecycle.queueViewRemoval(this);
                    var attachable = this.$attachable;
                    var i = attachable.length;
                    while (i--) {
                        attachable[i].$detach();
                    }
                    if (this.$slot !== null) {
                        this.$slot.$detach(lifecycle);
                    }
                    if (this.$behavior.hasDetached) {
                        lifecycle.queueDetachedCallback(this);
                    }
                    this.$isAttached = false;
                    lifecycle.end(this);
                }
            };
            proto.$unbind = function () {
                if (this.$isBound) {
                    var bindable = this.$bindable;
                    var i = bindable.length;
                    while (i--) {
                        bindable[i].$unbind();
                    }
                    if (this.$behavior.hasUnbound) {
                        this.unbound();
                    }
                    this.$isBound = false;
                }
            };
            return Type;
        }
    };
    function createDescription(templateSource, Type) {
        return {
            name: templateSource.name || 'unnamed',
            template: templateSource.template || null,
            cache: 0,
            build: templateSource.build || {
                required: false,
                compiler: 'default'
            },
            bindables: Object.assign({}, Type.bindables, templateSource.bindables),
            instructions: templateSource.instructions ? Array.from(templateSource.instructions) : platform_1.PLATFORM.emptyArray,
            dependencies: templateSource.dependencies ? Array.from(templateSource.dependencies) : platform_1.PLATFORM.emptyArray,
            surrogates: templateSource.surrogates ? Array.from(templateSource.surrogates) : platform_1.PLATFORM.emptyArray,
            containerless: templateSource.containerless || Type.containerless || false,
            shadowOptions: templateSource.shadowOptions || Type.shadowOptions || null,
            hasSlots: templateSource.hasSlots || false
        };
    }
});



define('runtime/templating/instructions',["require", "exports", "../../kernel/di"], function (require, exports, di_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var TargetedInstructionType;
    (function (TargetedInstructionType) {
        TargetedInstructionType[TargetedInstructionType["textBinding"] = 0] = "textBinding";
        TargetedInstructionType[TargetedInstructionType["oneWayBinding"] = 1] = "oneWayBinding";
        TargetedInstructionType[TargetedInstructionType["fromViewBinding"] = 2] = "fromViewBinding";
        TargetedInstructionType[TargetedInstructionType["twoWayBinding"] = 3] = "twoWayBinding";
        TargetedInstructionType[TargetedInstructionType["listenerBinding"] = 4] = "listenerBinding";
        TargetedInstructionType[TargetedInstructionType["callBinding"] = 5] = "callBinding";
        TargetedInstructionType[TargetedInstructionType["refBinding"] = 6] = "refBinding";
        TargetedInstructionType[TargetedInstructionType["stylePropertyBinding"] = 7] = "stylePropertyBinding";
        TargetedInstructionType[TargetedInstructionType["setProperty"] = 8] = "setProperty";
        TargetedInstructionType[TargetedInstructionType["setAttribute"] = 9] = "setAttribute";
        TargetedInstructionType[TargetedInstructionType["hydrateSlot"] = 10] = "hydrateSlot";
        TargetedInstructionType[TargetedInstructionType["hydrateElement"] = 11] = "hydrateElement";
        TargetedInstructionType[TargetedInstructionType["hydrateAttribute"] = 12] = "hydrateAttribute";
        TargetedInstructionType[TargetedInstructionType["hydrateTemplateController"] = 13] = "hydrateTemplateController";
    })(TargetedInstructionType = exports.TargetedInstructionType || (exports.TargetedInstructionType = {}));
    exports.ITargetedInstruction = di_1.DI.createInterface();
});



define('runtime/templating/lifecycle',["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var AttachLifecycle = (function () {
        function AttachLifecycle(owner) {
            this.owner = owner;
            this.tail = null;
            this.head = null;
            this.$nextAttached = null;
            this.tail = this.head = this;
        }
        AttachLifecycle.prototype.attached = function () { };
        AttachLifecycle.prototype.queueAttachedCallback = function (requestor) {
            this.tail.$nextAttached = requestor;
            this.tail = requestor;
        };
        AttachLifecycle.prototype.end = function (owner) {
            if (owner === this.owner) {
                var current = this.head;
                var next = void 0;
                while (current) {
                    current.attached();
                    next = current.$nextAttached;
                    current.$nextAttached = null;
                    current = next;
                }
            }
        };
        AttachLifecycle.start = function (owner, existingLifecycle) {
            return existingLifecycle || new AttachLifecycle(owner);
        };
        return AttachLifecycle;
    }());
    exports.AttachLifecycle = AttachLifecycle;
    var dummyView = { remove: function () { } };
    var DetachLifecycle = (function () {
        function DetachLifecycle(owner) {
            this.owner = owner;
            this.detachedHead = null;
            this.detachedTail = null;
            this.viewRemoveHead = null;
            this.viewRemoveTail = null;
            this.$nextDetached = null;
            this.$nextRemoveView = null;
            this.$view = dummyView;
            this.detachedTail = this.detachedHead = this;
            this.viewRemoveTail = this.viewRemoveHead = this;
        }
        DetachLifecycle.prototype.detached = function () { };
        DetachLifecycle.prototype.queueViewRemoval = function (requestor) {
            this.viewRemoveTail.$nextRemoveView = requestor;
            this.viewRemoveTail = requestor;
        };
        DetachLifecycle.prototype.queueDetachedCallback = function (requestor) {
            this.detachedTail.$nextDetached = requestor;
            this.detachedTail = requestor;
        };
        DetachLifecycle.prototype.end = function (owner) {
            if (owner == this.owner) {
                var current = this.detachedHead;
                var next = void 0;
                while (current) {
                    current.detached();
                    next = current.$nextDetached;
                    current.$nextDetached = null;
                    current = next;
                }
                var current2 = this.viewRemoveHead;
                var next2 = void 0;
                while (current2) {
                    current2.$view.remove();
                    next2 = current2.$nextRemoveView;
                    current2.$nextRemoveView = null;
                    current2 = next2;
                }
            }
        };
        DetachLifecycle.start = function (owner, existingLifecycle) {
            return existingLifecycle || new DetachLifecycle(owner);
        };
        return DetachLifecycle;
    }());
    exports.DetachLifecycle = DetachLifecycle;
});



define('runtime/templating/render-context',["require", "exports", "./render-slot", "../dom", "../../kernel/platform", "./instructions", "./view", "./visual"], function (require, exports, render_slot_1, dom_1, platform_1, instructions_1, view_1, visual_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    ;
    function createRenderContext(renderingEngine, parentRenderContext, dependencies) {
        var context = parentRenderContext.createChild();
        var ownerProvider = new InstanceProvider();
        var elementProvider = new InstanceProvider();
        var instructionProvider = new InstanceProvider();
        var factoryProvider = new ViewFactoryProvider(renderingEngine);
        var slotProvider = new RenderSlotProvider();
        var renderer = renderingEngine.createRenderer(context);
        dom_1.DOM.registerElementResolver(context, elementProvider);
        context.registerResolver(visual_1.IVisualFactory, factoryProvider);
        context.registerResolver(render_slot_1.IRenderSlot, slotProvider);
        context.registerResolver(view_1.IViewOwner, ownerProvider);
        context.registerResolver(instructions_1.ITargetedInstruction, instructionProvider);
        if (dependencies) {
            context.register.apply(context, dependencies);
        }
        context.render = function (owner, targets, templateDefinition, host, parts) {
            renderer.render(owner, targets, templateDefinition, host, parts);
        };
        context.beginComponentOperation = function (owner, target, instruction, factory, parts, anchor, anchorIsContainer) {
            ownerProvider.prepare(owner);
            elementProvider.prepare(target);
            instructionProvider.prepare(instruction);
            if (factory) {
                factoryProvider.prepare(factory, parts);
            }
            if (anchor) {
                slotProvider.prepare(anchor, anchorIsContainer);
            }
            return context;
        };
        context.hydrateElement = function (owner, target, instruction) {
            renderer[instructions_1.TargetedInstructionType.hydrateElement](owner, target, instruction);
        };
        context.hydrateElementInstance = function (owner, target, instruction, component) {
            renderer.hydrateElementInstance(owner, target, instruction, component);
        };
        context.tryConnectTemplateControllerToSlot = function (owner) {
            slotProvider.tryConnectTemplateControllerToSlot(owner);
        };
        context.tryConnectElementToSlot = function (owner) {
            slotProvider.tryConnectElementToSlot(owner);
        };
        context.dispose = function () {
            factoryProvider.dispose();
            slotProvider.dispose();
            ownerProvider.dispose();
            instructionProvider.dispose();
            elementProvider.dispose();
        };
        return context;
    }
    exports.createRenderContext = createRenderContext;
    var InstanceProvider = (function () {
        function InstanceProvider() {
            this.instance = null;
        }
        InstanceProvider.prototype.prepare = function (instance) {
            this.instance = instance;
        };
        InstanceProvider.prototype.resolve = function (handler, requestor) {
            return this.instance;
        };
        InstanceProvider.prototype.dispose = function () {
            this.instance = null;
        };
        return InstanceProvider;
    }());
    var ViewFactoryProvider = (function () {
        function ViewFactoryProvider(renderingEngine) {
            this.renderingEngine = renderingEngine;
        }
        ViewFactoryProvider.prototype.prepare = function (factory, parts) {
            this.factory = factory;
            this.replacements = parts || platform_1.PLATFORM.emptyObject;
        };
        ViewFactoryProvider.prototype.resolve = function (handler, requestor) {
            var found = this.replacements[this.factory.name];
            if (found) {
                return this.renderingEngine.getVisualFactory(requestor, found);
            }
            return this.factory;
        };
        ViewFactoryProvider.prototype.dispose = function () {
            this.factory = null;
            this.replacements = null;
        };
        return ViewFactoryProvider;
    }());
    var RenderSlotProvider = (function () {
        function RenderSlotProvider() {
            this.node = null;
            this.anchorIsContainer = false;
            this.slot = null;
        }
        RenderSlotProvider.prototype.prepare = function (element, anchorIsContainer) {
            if (anchorIsContainer === void 0) { anchorIsContainer = false; }
            this.node = element;
            this.anchorIsContainer = anchorIsContainer;
        };
        RenderSlotProvider.prototype.resolve = function (handler, requestor) {
            return this.slot || (this.slot = render_slot_1.RenderSlot.create(this.node, this.anchorIsContainer));
        };
        RenderSlotProvider.prototype.tryConnectTemplateControllerToSlot = function (owner) {
            var slot = this.slot;
            if (slot !== null) {
                slot.$isContentProjectionSource = true;
                owner.$slot = slot;
            }
        };
        RenderSlotProvider.prototype.tryConnectElementToSlot = function (owner) {
            var slot = this.slot;
            if (slot !== null) {
                owner.$slot = slot;
            }
        };
        RenderSlotProvider.prototype.dispose = function () {
            this.node = null;
            this.slot = null;
        };
        return RenderSlotProvider;
    }());
});



define('runtime/templating/render-slot',["require", "exports", "./shadow-dom", "./lifecycle", "../../kernel/di", "./visual"], function (require, exports, shadow_dom_1, lifecycle_1, di_1, visual_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    function appendVisualToContainer(visual) {
        var parent = visual.parent;
        visual.$view.appendTo(parent.anchor);
    }
    function addVisual(visual) {
        var parent = visual.parent;
        visual.$view.insertBefore(parent.anchor);
    }
    function project_addVisual(visual) {
        var parent = visual.parent;
        shadow_dom_1.ShadowDOMEmulation.distributeView(visual.$view, parent.slots, parent);
        parent.logicalView.insertVisualChildBefore(visual, parent.anchor);
        visual.$view.remove = function () {
            shadow_dom_1.ShadowDOMEmulation.undistributeView(visual.$view, parent.slots, parent);
            parent.logicalView.removeVisualChild(visual);
        };
    }
    function insertVisual(visual) {
        visual.$view.insertBefore(visual.parent.children[visual.renderState].$view.firstChild);
        visual.onRender = visual.parent.addVisualCore;
    }
    function project_insertVisual(visual) {
        var parent = visual.parent;
        var index = visual.renderState;
        shadow_dom_1.ShadowDOMEmulation.distributeView(visual.$view, parent.slots, parent, index);
        parent.logicalView.insertVisualChildBefore(visual, parent.children[index].$view.firstChild);
        visual.onRender = visual.parent.addVisualCore;
        visual.$view.remove = function () {
            shadow_dom_1.ShadowDOMEmulation.undistributeView(visual.$view, parent.slots, parent);
            parent.logicalView.removeVisualChild(visual);
        };
    }
    var SwapOrder;
    (function (SwapOrder) {
        SwapOrder["before"] = "before";
        SwapOrder["with"] = "with";
        SwapOrder["after"] = "after";
    })(SwapOrder = exports.SwapOrder || (exports.SwapOrder = {}));
    exports.IRenderSlot = di_1.DI.createInterface().noDefault();
    exports.RenderSlot = {
        create: function (anchor, anchorIsContainer) {
            return new RenderSlotImplementation(anchor, anchorIsContainer);
        }
    };
    var RenderSlotImplementation = (function () {
        function RenderSlotImplementation(anchor, anchorIsContainer) {
            this.anchor = anchor;
            this.$isAttached = false;
            this.encapsulationSource = null;
            this.children = [];
            this.slots = null;
            this.logicalView = null;
            anchor.$slot = this;
            anchor.$isContentProjectionSource = false;
            this.addVisualCore = anchorIsContainer ? appendVisualToContainer : addVisual;
            this.insertVisualCore = insertVisual;
        }
        RenderSlotImplementation.prototype.add = function (visual) {
            visual.parent = this;
            visual.onRender = this.addVisualCore;
            this.children.push(visual);
            if (this.$isAttached) {
                visual.$attach(this.encapsulationSource);
                return visual.animate(visual_1.MotionDirection.enter);
            }
        };
        RenderSlotImplementation.prototype.insert = function (index, visual) {
            var children = this.children;
            var length = children.length;
            if ((index === 0 && length === 0) || index >= length) {
                return this.add(visual);
            }
            visual.parent = this;
            children.splice(index, 0, visual);
            if (this.$isAttached) {
                visual.onRender = this.insertVisualCore;
                visual.renderState = index + 1;
                visual.$attach(this.encapsulationSource);
                return visual.animate(visual_1.MotionDirection.enter);
            }
            else {
                visual.onRender = this.addVisualCore;
            }
        };
        RenderSlotImplementation.prototype.move = function (sourceIndex, targetIndex) {
            if (sourceIndex === targetIndex) {
                return;
            }
            var children = this.children;
            var visual = children[sourceIndex];
            children.splice(sourceIndex, 1);
            children.splice(targetIndex, 0, visual);
            if (this.$isAttached) {
                visual.$view.remove();
                visual.renderState = targetIndex;
                this.insertVisualCore(visual);
            }
        };
        RenderSlotImplementation.prototype.swap = function (newVisual, strategy, returnToCache, skipAnimation) {
            var _this = this;
            if (strategy === void 0) { strategy = SwapOrder.after; }
            var remove = function () { return _this.removeAll(returnToCache, skipAnimation); };
            var add = function () { return _this.add(newVisual); };
            switch (strategy) {
                case SwapOrder.before:
                    var beforeAddResult = add();
                    return (beforeAddResult instanceof Promise ? beforeAddResult.then(function () { return remove(); }) : remove());
                case SwapOrder.with:
                    var withAddResult = add();
                    var withRemoveResult = remove();
                    return (withAddResult instanceof Promise || withRemoveResult instanceof Promise)
                        ? Promise.all([withAddResult, withRemoveResult]).then(function (x) { return x[1]; })
                        : withRemoveResult;
                case SwapOrder.after:
                    var afterRemoveResult = remove();
                    return (afterRemoveResult instanceof Promise ? afterRemoveResult.then(function () { return add(); }) : add());
            }
        };
        RenderSlotImplementation.prototype.remove = function (visual, returnToCache, skipAnimation) {
            return this.removeAt(this.children.indexOf(visual), returnToCache, skipAnimation);
        };
        RenderSlotImplementation.prototype.removeAt = function (index, returnToCache, skipAnimation) {
            var _this = this;
            var visual = this.children[index];
            this.children.splice(index, 1);
            var detachAndReturn = function () {
                if (_this.$isAttached) {
                    visual.$detach();
                }
                if (returnToCache) {
                    visual.tryReturnToCache();
                }
                return visual;
            };
            if (!skipAnimation && this.$isAttached) {
                var animation = visual.animate(visual_1.MotionDirection.enter);
                if (animation) {
                    return animation.then(function () { return detachAndReturn(); });
                }
            }
            return detachAndReturn();
        };
        RenderSlotImplementation.prototype.removeAll = function (returnToCache, skipAnimation) {
            return this.removeMany(this.children, returnToCache, skipAnimation);
        };
        RenderSlotImplementation.prototype.removeMany = function (visualsToRemove, returnToCache, skipAnimation) {
            var _this = this;
            var children = this.children;
            var ii = visualsToRemove.length;
            var rmPromises = [];
            var lifecycle = lifecycle_1.DetachLifecycle.start(this);
            if (visualsToRemove === children) {
                this.children = [];
            }
            else {
                for (var i = 0; i < ii; ++i) {
                    var index = children.indexOf(visualsToRemove[i]);
                    if (index >= 0) {
                        children.splice(index, 1);
                    }
                }
            }
            if (this.$isAttached) {
                visualsToRemove.forEach(function (child) {
                    if (skipAnimation) {
                        child.$detach(lifecycle);
                        return;
                    }
                    var animation = child.animate(visual_1.MotionDirection.enter);
                    if (animation) {
                        rmPromises.push(animation.then(function () { return child.$detach(lifecycle); }));
                    }
                    else {
                        child.$detach(lifecycle);
                    }
                });
            }
            var finalizeRemoval = function () {
                lifecycle.end(_this);
                if (returnToCache) {
                    for (var i = 0; i < ii; ++i) {
                        visualsToRemove[i].tryReturnToCache();
                    }
                }
                return visualsToRemove;
            };
            if (rmPromises.length > 0) {
                return Promise.all(rmPromises).then(function () { return finalizeRemoval(); });
            }
            return finalizeRemoval();
        };
        RenderSlotImplementation.prototype.$attach = function (encapsulationSource, lifecycle) {
            if (this.$isAttached) {
                return;
            }
            var children = this.children;
            for (var i = 0, ii = children.length; i < ii; ++i) {
                var child = children[i];
                child.$attach(encapsulationSource, lifecycle);
                child.animate(visual_1.MotionDirection.enter);
            }
            this.$isAttached = true;
            this.encapsulationSource = encapsulationSource;
        };
        RenderSlotImplementation.prototype.$detach = function (lifecycle) {
            if (this.$isAttached) {
                var children = this.children;
                for (var i = 0, ii = children.length; i < ii; ++i) {
                    children[i].$detach(lifecycle);
                }
                this.$isAttached = false;
                this.encapsulationSource = null;
            }
        };
        RenderSlotImplementation.prototype.projectTo = function (slots) {
            this.slots = slots;
            this.addVisualCore = project_addVisual;
            this.insertVisualCore = project_insertVisual;
            if (this.$isAttached) {
                var children = this.children;
                for (var i = 0, ii = children.length; i < ii; ++i) {
                    var child = children[i];
                    child.onRender = project_addVisual;
                    project_addVisual(child);
                }
            }
        };
        return RenderSlotImplementation;
    }());
});



define('runtime/templating/renderer',["require", "exports", "../dom", "./instructions", "./custom-attribute", "../binding/binding-mode", "../binding/binding", "../binding/listener", "../binding/call", "../binding/ref", "./shadow-dom", "./custom-element"], function (require, exports, dom_1, instructions_1, custom_attribute_1, binding_mode_1, binding_1, listener_1, call_1, ref_1, shadow_dom_1, custom_element_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var Renderer = (function () {
        function Renderer(context, observerLocator, eventManager, parser, renderingEngine) {
            this.context = context;
            this.observerLocator = observerLocator;
            this.eventManager = eventManager;
            this.parser = parser;
            this.renderingEngine = renderingEngine;
        }
        Renderer.prototype.render = function (owner, targets, definition, host, parts) {
            var targetInstructions = definition.instructions;
            for (var i = 0, ii = targets.length; i < ii; ++i) {
                var instructions = targetInstructions[i];
                var target = targets[i];
                for (var j = 0, jj = instructions.length; j < jj; ++j) {
                    var current = instructions[j];
                    this[current.type](owner, target, current, parts);
                }
            }
            if (host) {
                var surrogateInstructions = definition.surrogates;
                for (var i = 0, ii = surrogateInstructions.length; i < ii; ++i) {
                    var current = surrogateInstructions[i];
                    this[current.type](owner, host, current, parts);
                }
            }
        };
        Renderer.prototype.hydrateElementInstance = function (owner, target, instruction, component) {
            var childInstructions = instruction.instructions;
            component.$hydrate(this.renderingEngine, target, instruction);
            for (var i = 0, ii = childInstructions.length; i < ii; ++i) {
                var current = childInstructions[i];
                var currentType = current.type;
                var realTarget = void 0;
                if (currentType === instructions_1.TargetedInstructionType.stylePropertyBinding || currentType === instructions_1.TargetedInstructionType.listenerBinding) {
                    realTarget = target;
                }
                else {
                    realTarget = component;
                }
                this[current.type](owner, realTarget, current);
            }
            owner.$bindable.push(component);
            owner.$attachable.push(component);
        };
        Renderer.prototype[instructions_1.TargetedInstructionType.textBinding] = function (owner, target, instruction) {
            var next = target.nextSibling;
            dom_1.DOM.treatAsNonWhitespace(next);
            dom_1.DOM.remove(target);
            owner.$bindable.push(new binding_1.Binding(this.parser.parse(instruction.src), next, 'textContent', binding_mode_1.BindingMode.oneWay, this.observerLocator, this.context));
        };
        Renderer.prototype[instructions_1.TargetedInstructionType.oneWayBinding] = function (owner, target, instruction) {
            owner.$bindable.push(new binding_1.Binding(this.parser.parse(instruction.src), target, instruction.dest, binding_mode_1.BindingMode.oneWay, this.observerLocator, this.context));
        };
        Renderer.prototype[instructions_1.TargetedInstructionType.fromViewBinding] = function (owner, target, instruction) {
            owner.$bindable.push(new binding_1.Binding(this.parser.parse(instruction.src), target, instruction.dest, binding_mode_1.BindingMode.fromView, this.observerLocator, this.context));
        };
        Renderer.prototype[instructions_1.TargetedInstructionType.twoWayBinding] = function (owner, target, instruction) {
            owner.$bindable.push(new binding_1.Binding(this.parser.parse(instruction.src), target, instruction.dest, binding_mode_1.BindingMode.twoWay, this.observerLocator, this.context));
        };
        Renderer.prototype[instructions_1.TargetedInstructionType.listenerBinding] = function (owner, target, instruction) {
            owner.$bindable.push(new listener_1.Listener(instruction.src, instruction.strategy, this.parser.parse(instruction.dest), target, instruction.preventDefault, this.eventManager, this.context));
        };
        Renderer.prototype[instructions_1.TargetedInstructionType.callBinding] = function (owner, target, instruction) {
            owner.$bindable.push(new call_1.Call(this.parser.parse(instruction.src), target, instruction.dest, this.observerLocator, this.context));
        };
        Renderer.prototype[instructions_1.TargetedInstructionType.refBinding] = function (owner, target, instruction) {
            owner.$bindable.push(new ref_1.Ref(this.parser.parse(instruction.src), target, this.context));
        };
        Renderer.prototype[instructions_1.TargetedInstructionType.stylePropertyBinding] = function (owner, target, instruction) {
            owner.$bindable.push(new binding_1.Binding(this.parser.parse(instruction.src), target.style, instruction.dest, binding_mode_1.BindingMode.oneWay, this.observerLocator, this.context));
        };
        Renderer.prototype[instructions_1.TargetedInstructionType.setProperty] = function (owner, target, instruction) {
            target[instruction.dest] = instruction.value;
        };
        Renderer.prototype[instructions_1.TargetedInstructionType.setAttribute] = function (owner, target, instruction) {
            dom_1.DOM.setAttribute(target, instruction.dest, instruction.value);
        };
        Renderer.prototype[instructions_1.TargetedInstructionType.hydrateSlot] = function (owner, target, instruction) {
            if (!owner.$usingSlotEmulation) {
                return;
            }
            var fallbackFactory = this.renderingEngine.getVisualFactory(this.context, instruction.fallback);
            var slot = shadow_dom_1.ShadowDOMEmulation.createSlot(target, owner, instruction.name, instruction.dest, fallbackFactory);
            owner.$slots[slot.name] = slot;
            owner.$bindable.push(slot);
            owner.$attachable.push(slot);
        };
        Renderer.prototype[instructions_1.TargetedInstructionType.hydrateElement] = function (owner, target, instruction) {
            var context = this.context;
            var operation = context.beginComponentOperation(owner, target, instruction, null, null, target, true);
            var component = context.get(custom_element_1.CustomElementResource.key(instruction.res));
            this.hydrateElementInstance(owner, target, instruction, component);
            operation.tryConnectElementToSlot(component);
            operation.dispose();
        };
        Renderer.prototype[instructions_1.TargetedInstructionType.hydrateAttribute] = function (owner, target, instruction) {
            var childInstructions = instruction.instructions;
            var context = this.context;
            var operation = context.beginComponentOperation(owner, target, instruction);
            var component = context.get(custom_attribute_1.CustomAttributeResource.key(instruction.res));
            component.$hydrate(this.renderingEngine);
            for (var i = 0, ii = childInstructions.length; i < ii; ++i) {
                var current = childInstructions[i];
                this[current.type](owner, component, current);
            }
            owner.$bindable.push(component);
            owner.$attachable.push(component);
            operation.dispose();
        };
        Renderer.prototype[instructions_1.TargetedInstructionType.hydrateTemplateController] = function (owner, target, instruction, parts) {
            var childInstructions = instruction.instructions;
            var factory = this.renderingEngine.getVisualFactory(this.context, instruction.src);
            var context = this.context;
            var operation = context.beginComponentOperation(owner, target, instruction, factory, parts, dom_1.DOM.convertToAnchor(target), false);
            var component = context.get(custom_attribute_1.CustomAttributeResource.key(instruction.res));
            component.$hydrate(this.renderingEngine);
            operation.tryConnectTemplateControllerToSlot(component);
            if (instruction.link) {
                component.link(owner.$attachable[owner.$attachable.length - 1]);
            }
            for (var i = 0, ii = childInstructions.length; i < ii; ++i) {
                var current = childInstructions[i];
                this[current.type](owner, component, current);
            }
            owner.$bindable.push(component);
            owner.$attachable.push(component);
            operation.dispose();
        };
        return Renderer;
    }());
    exports.Renderer = Renderer;
});



var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
define('runtime/templating/rendering-engine',["require", "exports", "./runtime-behavior", "../../kernel/di", "../task-queue", "./view", "../dom", "./renderer", "./lifecycle", "../../kernel/reporter", "./animator", "../../kernel/platform", "./render-context", "./visual", "../binding/observer-locator", "../binding/event-manager", "../binding/expression-parser", "./template-compiler"], function (require, exports, runtime_behavior_1, di_1, task_queue_1, view_1, dom_1, renderer_1, lifecycle_1, reporter_1, animator_1, platform_1, render_context_1, visual_1, observer_locator_1, event_manager_1, expression_parser_1, template_compiler_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.IRenderingEngine = di_1.DI.createInterface()
        .withDefault(function (x) { return x.singleton(RenderingEngine); });
    var noViewTemplate = {
        renderContext: null,
        createFor: function (owner) {
            return view_1.View.none;
        }
    };
    var RenderingEngine = (function () {
        function RenderingEngine(container, taskQueue, observerLocator, eventManager, parser, animator, templateCompilers) {
            this.container = container;
            this.taskQueue = taskQueue;
            this.observerLocator = observerLocator;
            this.eventManager = eventManager;
            this.parser = parser;
            this.animator = animator;
            this.templateLookup = new Map();
            this.factoryLookup = new Map();
            this.behaviorLookup = new Map();
            this.compilers = templateCompilers.reduce(function (acc, item) {
                acc[item.name] = item;
                return acc;
            }, Object.create(null));
        }
        RenderingEngine.prototype.getElementTemplate = function (definition, componentType) {
            if (!definition) {
                return null;
            }
            var found = this.templateLookup.get(definition);
            if (!found) {
                found = this.templateFromSource(this.container, definition);
                if (found.renderContext !== null) {
                    componentType.register(found.renderContext);
                }
                this.templateLookup.set(definition, found);
            }
            return found;
        };
        RenderingEngine.prototype.templateFromSource = function (context, definition) {
            if (definition && definition.template) {
                if (definition.build.required) {
                    var compiler = this.compilers[definition.build.compiler];
                    if (!compiler) {
                        throw reporter_1.Reporter.error(20, "Requested Compiler: " + compiler.name);
                    }
                    definition = compiler.compile(definition, new RuntimeCompilationResources(context));
                }
                return new CompiledTemplate(this, context, definition);
            }
            return noViewTemplate;
        };
        RenderingEngine.prototype.getVisualFactory = function (context, definition) {
            if (!definition) {
                return null;
            }
            var found = this.factoryLookup.get(definition);
            if (!found) {
                var validSource = createDefinition(definition);
                found = this.factoryFromSource(context, validSource);
                this.factoryLookup.set(definition, found);
            }
            return found;
        };
        RenderingEngine.prototype.factoryFromSource = function (context, definition) {
            var template = this.templateFromSource(context, definition);
            var CompiledVisual = (function (_super) {
                __extends(class_1, _super);
                function class_1() {
                    var _this = _super !== null && _super.apply(this, arguments) || this;
                    _this.$slots = definition.hasSlots ? {} : null;
                    _this.$context = context;
                    return _this;
                }
                class_1.prototype.createView = function () {
                    return template.createFor(this);
                };
                return class_1;
            }(Visual));
            var factory = new VisualFactory(definition.name, CompiledVisual);
            factory.setCacheSize(definition.cache, true);
            return factory;
        };
        RenderingEngine.prototype.applyRuntimeBehavior = function (type, instance, bindables) {
            var found = this.behaviorLookup.get(type);
            if (!found) {
                found = runtime_behavior_1.RuntimeBehavior.create(instance, bindables, type);
                this.behaviorLookup.set(type, found);
            }
            if ('$host' in instance) {
                found.applyToElement(this.taskQueue, instance);
            }
            else {
                found.applyToAttribute(this.taskQueue, instance);
            }
            return found;
        };
        RenderingEngine.prototype.createVisualFromComponent = function (context, componentOrType, instruction) {
            var animator = this.animator;
            var ComponentVisual = (function (_super) {
                __extends(ComponentVisual, _super);
                function ComponentVisual() {
                    var _this = _super.call(this, null, animator) || this;
                    _this.$context = context;
                    return _this;
                }
                ComponentVisual.prototype.createView = function () {
                    var target;
                    if (typeof componentOrType === 'function') {
                        target = dom_1.DOM.createElement(componentOrType.source.name);
                        context.hydrateElement(this, target, instruction);
                        this.component = this.$attachable[this.$attachable.length - 1];
                    }
                    else {
                        var componentType = componentOrType.constructor;
                        target = componentOrType.element || dom_1.DOM.createElement(componentType.description.name);
                        context.hydrateElementInstance(this, target, instruction, componentOrType);
                        this.component = componentOrType;
                    }
                    return view_1.View.fromNode(target);
                };
                ComponentVisual.prototype.tryReturnToCache = function () {
                    return false;
                };
                return ComponentVisual;
            }(Visual));
            return new ComponentVisual();
        };
        RenderingEngine.prototype.createRenderer = function (context) {
            return new renderer_1.Renderer(context, this.observerLocator, this.eventManager, this.parser, this);
        };
        RenderingEngine = __decorate([
            di_1.inject(di_1.IContainer, task_queue_1.ITaskQueue, observer_locator_1.IObserverLocator, event_manager_1.IEventManager, expression_parser_1.IExpressionParser, animator_1.IAnimator, di_1.all(template_compiler_1.ITemplateCompiler)),
            __metadata("design:paramtypes", [Object, Object, Object, Object, Object, Object, Array])
        ], RenderingEngine);
        return RenderingEngine;
    }());
    function createDefinition(definition) {
        return {
            name: definition.name || 'Unnamed Template',
            template: definition.template,
            cache: definition.cache || 0,
            build: definition.build || {
                required: false,
                compiler: 'default'
            },
            bindables: definition.bindables || platform_1.PLATFORM.emptyObject,
            instructions: definition.instructions ? Array.from(definition.instructions) : platform_1.PLATFORM.emptyArray,
            dependencies: definition.dependencies ? Array.from(definition.dependencies) : platform_1.PLATFORM.emptyArray,
            surrogates: definition.surrogates ? Array.from(definition.surrogates) : platform_1.PLATFORM.emptyArray,
            containerless: definition.containerless || false,
            shadowOptions: definition.shadowOptions || null,
            hasSlots: definition.hasSlots || false
        };
    }
    var CompiledTemplate = (function () {
        function CompiledTemplate(renderingEngine, parentRenderContext, templateDefinition) {
            this.templateDefinition = templateDefinition;
            this.renderContext = render_context_1.createRenderContext(renderingEngine, parentRenderContext, templateDefinition.dependencies);
            this.createView = dom_1.DOM.createFactoryFromMarkup(templateDefinition.template);
        }
        CompiledTemplate.prototype.createFor = function (owner, host, replacements) {
            var view = this.createView();
            this.renderContext.render(owner, view.findTargets(), this.templateDefinition, host, replacements);
            return view;
        };
        return CompiledTemplate;
    }());
    var RuntimeCompilationResources = (function () {
        function RuntimeCompilationResources(context) {
            this.context = context;
        }
        RuntimeCompilationResources.prototype.get = function (kind, name) {
            var key = kind.key(name);
            var resolver = this.context.getResolver(key);
            if (resolver !== null && resolver.getFactory) {
                var factory = resolver.getFactory(this.context);
                if (factory !== null) {
                    return factory.type.description;
                }
            }
            return null;
        };
        return RuntimeCompilationResources;
    }());
    var Visual = (function () {
        function Visual(factory, animator) {
            this.factory = factory;
            this.animator = animator;
            this.$bindable = [];
            this.$attachable = [];
            this.$scope = null;
            this.$view = null;
            this.$isBound = false;
            this.$isAttached = false;
            this.inCache = false;
            this.animationRoot = undefined;
            this.$view = this.createView();
        }
        Visual.prototype.getAnimationRoot = function () {
            if (this.animationRoot !== undefined) {
                return this.animationRoot;
            }
            var currentChild = this.$view.firstChild;
            var lastChild = this.$view.lastChild;
            var isElementNodeType = dom_1.DOM.isElementNodeType;
            while (currentChild !== lastChild && !isElementNodeType(currentChild)) {
                currentChild = currentChild.nextSibling;
            }
            if (currentChild && isElementNodeType(currentChild)) {
                return this.animationRoot = dom_1.DOM.hasClass(currentChild, 'au-animate')
                    ? currentChild
                    : null;
            }
            return this.animationRoot = null;
        };
        Visual.prototype.animate = function (direction) {
            if (direction === void 0) { direction = visual_1.MotionDirection.enter; }
            var element = this.getAnimationRoot();
            if (element === null) {
                return;
            }
            switch (direction) {
                case visual_1.MotionDirection.enter:
                    return this.animator.enter(element);
                case visual_1.MotionDirection.leave:
                    return this.animator.leave(element);
                default:
                    throw reporter_1.Reporter.error(4, direction);
            }
        };
        Visual.prototype.$bind = function (scope) {
            if (this.$isBound) {
                if (this.$scope === scope) {
                    return;
                }
                this.$unbind();
            }
            this.$scope = scope;
            var bindable = this.$bindable;
            for (var i = 0, ii = bindable.length; i < ii; ++i) {
                bindable[i].$bind(scope);
            }
            this.$isBound = true;
        };
        Visual.prototype.$attach = function (encapsulationSource, lifecycle) {
            if (this.$isAttached) {
                return;
            }
            lifecycle = lifecycle_1.AttachLifecycle.start(this, lifecycle);
            var attachable = this.$attachable;
            for (var i = 0, ii = attachable.length; i < ii; ++i) {
                attachable[i].$attach(encapsulationSource, lifecycle);
            }
            this.onRender(this);
            this.$isAttached = true;
            lifecycle.end(this);
        };
        Visual.prototype.$detach = function (lifecycle) {
            if (this.$isAttached) {
                lifecycle = lifecycle_1.DetachLifecycle.start(this, lifecycle);
                lifecycle.queueViewRemoval(this);
                var attachable = this.$attachable;
                var i = attachable.length;
                while (i--) {
                    attachable[i].$detach(lifecycle);
                }
                this.$isAttached = false;
                lifecycle.end(this);
            }
        };
        Visual.prototype.$unbind = function () {
            if (this.$isBound) {
                var bindable = this.$bindable;
                var i = bindable.length;
                while (i--) {
                    bindable[i].$unbind();
                }
                this.$isBound = false;
                this.$scope = null;
            }
        };
        Visual.prototype.tryReturnToCache = function () {
            return this.factory.tryReturnToCache(this);
        };
        return Visual;
    }());
    var VisualFactory = (function () {
        function VisualFactory(name, type) {
            this.name = name;
            this.type = type;
            this.cacheSize = -1;
            this.cache = null;
            this.isCaching = false;
        }
        VisualFactory.prototype.setCacheSize = function (size, doNotOverrideIfAlreadySet) {
            if (size) {
                if (size === '*') {
                    size = Number.MAX_VALUE;
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
        };
        VisualFactory.prototype.tryReturnToCache = function (visual) {
            if (this.cache !== null && this.cache.length < this.cacheSize) {
                visual.inCache = true;
                this.cache.push(visual);
                return true;
            }
            return false;
        };
        VisualFactory.prototype.create = function () {
            var cache = this.cache;
            if (cache !== null && cache.length > 0) {
                var visual = cache.pop();
                visual.inCache = false;
                return visual;
            }
            return new this.type(this);
        };
        return VisualFactory;
    }());
});



var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
define('runtime/templating/runtime-behavior',["require", "exports", "../dom", "../binding/subscriber-collection", "../binding/property-observation"], function (require, exports, dom_1, subscriber_collection_1, property_observation_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var RuntimeBehavior = (function () {
        function RuntimeBehavior() {
            this.hasCreated = false;
            this.hasBound = false;
            this.hasAttaching = false;
            this.hasAttached = false;
            this.hasDetaching = false;
            this.hasDetached = false;
            this.hasUnbound = false;
            this.hasCreateView = false;
        }
        RuntimeBehavior.create = function (instance, bindables, Component) {
            var behavior = new RuntimeBehavior();
            for (var name_1 in instance) {
                if (name_1 in bindables) {
                    continue;
                }
                var callback = name_1 + "Changed";
                if (callback in instance) {
                    bindables[name_1] = { callback: callback, property: name_1 };
                }
            }
            behavior.bindables = bindables;
            behavior.hasCreated = 'created' in instance;
            behavior.hasBound = 'bound' in instance;
            behavior.hasAttaching = 'attaching' in instance;
            behavior.hasAttached = 'attached' in instance;
            behavior.hasDetaching = 'detaching' in instance;
            behavior.hasDetached = 'detached' in instance;
            behavior.hasUnbound = 'unbound' in instance;
            behavior.hasCreateView = 'createView' in instance;
            return behavior;
        };
        RuntimeBehavior.prototype.applyToAttribute = function (taskQueue, instance) {
            this.applyTo(taskQueue, instance);
            return this;
        };
        RuntimeBehavior.prototype.applyToElement = function (taskQueue, instance) {
            var observers = this.applyTo(taskQueue, instance);
            observers.$children = new ChildrenObserver(taskQueue, instance);
            Reflect.defineProperty(instance, '$children', {
                enumerable: false,
                get: function () {
                    return this.$observers.$children.getValue();
                }
            });
            return this;
        };
        RuntimeBehavior.prototype.applyTo = function (taskQueue, instance) {
            var observers = {};
            var finalBindables = this.bindables;
            var observableNames = Object.getOwnPropertyNames(finalBindables);
            var _loop_1 = function (i, ii) {
                var name_2 = observableNames[i];
                var observable = finalBindables[name_2];
                var changeHandler = observable.callback;
                if (changeHandler in instance) {
                    observers[name_2] = new property_observation_1.Observer(taskQueue, instance[name_2], function (v) { return instance.$isBound ? instance[changeHandler](v) : void 0; });
                    instance.$changeCallbacks.push(function () { return instance[changeHandler](instance[name_2]); });
                }
                else {
                    observers[name_2] = new property_observation_1.Observer(taskQueue, instance[name_2]);
                }
                createGetterSetter(instance, name_2);
            };
            for (var i = 0, ii = observableNames.length; i < ii; ++i) {
                _loop_1(i, ii);
            }
            Reflect.defineProperty(instance, '$observers', {
                enumerable: false,
                value: observers
            });
            instance.$behavior = this;
            return observers;
        };
        return RuntimeBehavior;
    }());
    exports.RuntimeBehavior = RuntimeBehavior;
    function createGetterSetter(instance, name) {
        Reflect.defineProperty(instance, name, {
            enumerable: true,
            get: function () { return this.$observers[name].getValue(); },
            set: function (value) { this.$observers[name].setValue(value); }
        });
    }
    var ChildrenObserver = (function (_super) {
        __extends(ChildrenObserver, _super);
        function ChildrenObserver(taskQueue, component) {
            var _this = _super.call(this) || this;
            _this.taskQueue = taskQueue;
            _this.component = component;
            _this.observer = null;
            _this.children = null;
            _this.queued = false;
            return _this;
        }
        ChildrenObserver.prototype.getValue = function () {
            var _this = this;
            if (this.observer === null) {
                this.observer = dom_1.DOM.createChildObserver(this.component.$host, function () { return _this.onChildrenChanged(); });
                this.children = findElements(this.observer.childNodes);
            }
            return this.children;
        };
        ChildrenObserver.prototype.setValue = function (newValue) { };
        ChildrenObserver.prototype.onChildrenChanged = function () {
            this.children = findElements(this.observer.childNodes);
            if ('$childrenChanged' in this.component) {
                this.component.$childrenChanged();
            }
            if (!this.queued) {
                this.queued = true;
                this.taskQueue.queueMicroTask(this);
            }
        };
        ChildrenObserver.prototype.call = function () {
            this.queued = false;
            this.callSubscribers(this.children);
        };
        ChildrenObserver.prototype.subscribe = function (context, callable) {
            this.addSubscriber(context, callable);
        };
        ChildrenObserver.prototype.unsubscribe = function (context, callable) {
            this.removeSubscriber(context, callable);
        };
        return ChildrenObserver;
    }(subscriber_collection_1.SubscriberCollection));
    function findElements(nodes) {
        var components = [];
        for (var i = 0, ii = nodes.length; i < ii; ++i) {
            var current = nodes[i];
            var component = dom_1.DOM.getCustomElementForNode(current);
            if (component !== null) {
                components.push(component);
            }
        }
        return components;
    }
});



var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
define('runtime/templating/shadow-dom',["require", "exports", "../../kernel/platform", "../dom"], function (require, exports, platform_1, dom_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    ;
    var noNodes = platform_1.PLATFORM.emptyArray;
    function shadowSlotAddFallbackVisual(visual) {
        var parent = visual.parent;
        parent.fallbackVisual.$view.insertBefore(parent.anchor);
    }
    function passThroughSlotAddFallbackVisual(visual) {
        var parent = visual.parent;
        var projectionSource = parent.currentProjectionSource;
        var slots = Object.create(null);
        parent.currentProjectionSource = null;
        slots[parent.destinationSlot.name] = parent.destinationSlot;
        exports.ShadowDOMEmulation.distributeView(parent.fallbackVisual.$view, slots, projectionSource, visual.renderState, parent.destinationSlot.name);
    }
    var ShadowSlotBase = (function () {
        function ShadowSlotBase(owner, anchor, name, fallbackFactory) {
            this.owner = owner;
            this.anchor = anchor;
            this.name = name;
            this.fallbackFactory = fallbackFactory;
            this.fallbackVisual = null;
            this.$isAttached = false;
            this.$isBound = false;
            this.projections = 0;
            this.encapsulationSource = null;
            this.anchor.$slot = this;
        }
        Object.defineProperty(ShadowSlotBase.prototype, "needsFallback", {
            get: function () {
                return this.fallbackFactory !== null && this.projections === 0;
            },
            enumerable: true,
            configurable: true
        });
        ShadowSlotBase.prototype.removeFallbackVisual = function (lifecycle) {
            if (this.fallbackVisual !== null) {
                this.fallbackVisual.$detach(lifecycle);
                this.fallbackVisual.$unbind();
                this.fallbackVisual = null;
            }
        };
        ShadowSlotBase.prototype.$bind = function (scope) {
            this.$isBound = true;
        };
        ShadowSlotBase.prototype.$attach = function (encapsulationSource, lifecycle) {
            this.$isAttached = true;
            this.encapsulationSource = encapsulationSource;
        };
        ShadowSlotBase.prototype.$detach = function (lifecycle) {
            if (this.$isAttached) {
                this.removeFallbackVisual(lifecycle);
                this.$isAttached = false;
                this.encapsulationSource = null;
            }
        };
        ShadowSlotBase.prototype.$unbind = function () {
            this.$isBound = false;
        };
        return ShadowSlotBase;
    }());
    var PassThroughSlot = (function (_super) {
        __extends(PassThroughSlot, _super);
        function PassThroughSlot(owner, anchor, name, destinationName, fallbackFactory) {
            var _this = _super.call(this, owner, anchor, name, fallbackFactory) || this;
            _this.destinationName = destinationName;
            _this.destinationSlot = null;
            _this.currentProjectionSource = null;
            _this.anchor.$slotName = _this.destinationName;
            return _this;
        }
        PassThroughSlot.prototype.passThroughTo = function (destinationSlot) {
            this.destinationSlot = destinationSlot;
        };
        PassThroughSlot.prototype.renderFallback = function (view, nodes, projectionSource, index) {
            if (index === void 0) { index = 0; }
            if (this.fallbackVisual === null) {
                this.fallbackVisual = this.fallbackFactory.create();
                this.fallbackVisual.$bind(this.owner.$scope);
                this.currentProjectionSource = projectionSource;
                this.fallbackVisual.parent = this;
                this.fallbackVisual.onRender = passThroughSlotAddFallbackVisual;
                this.fallbackVisual.renderState = index;
                this.fallbackVisual.$attach(this.encapsulationSource);
            }
        };
        PassThroughSlot.prototype.addNode = function (view, node, projectionSource, index) {
            this.removeFallbackVisual();
            if (node.$slot instanceof PassThroughSlot) {
                node.$slot.passThroughTo(this);
                return;
            }
            this.projections++;
            this.destinationSlot.addNode(view, node, projectionSource, index);
        };
        PassThroughSlot.prototype.removeView = function (view, projectionSource) {
            this.projections--;
            this.destinationSlot.removeView(view, projectionSource);
            if (this.needsFallback) {
                this.renderFallback(null, noNodes, projectionSource);
            }
        };
        PassThroughSlot.prototype.removeAll = function (projectionSource) {
            this.projections = 0;
            this.destinationSlot.removeAll(projectionSource);
            if (this.needsFallback) {
                this.renderFallback(null, noNodes, projectionSource);
            }
        };
        PassThroughSlot.prototype.projectFrom = function (view, projectionSource) {
            this.destinationSlot.projectFrom(view, projectionSource);
        };
        return PassThroughSlot;
    }(ShadowSlotBase));
    var ShadowSlot = (function (_super) {
        __extends(ShadowSlot, _super);
        function ShadowSlot(owner, anchor, name, fallbackFactory) {
            var _this = _super.call(this, owner, anchor, name, fallbackFactory) || this;
            _this.children = [];
            _this.projectFromAnchors = null;
            _this.destinationSlots = null;
            _this.anchor.$isContentProjectionSource = true;
            return _this;
        }
        ShadowSlot.prototype.renderFallback = function (view, nodes, projectionSource, index) {
            if (index === void 0) { index = 0; }
            if (this.fallbackVisual === null) {
                this.fallbackVisual = this.fallbackFactory.create();
                this.fallbackVisual.$bind(this.owner.$scope);
                this.fallbackVisual.parent = this;
                this.fallbackVisual.onRender = shadowSlotAddFallbackVisual;
                this.fallbackVisual.$attach(this.encapsulationSource);
            }
            if (this.fallbackVisual.$slots) {
                var slots = this.fallbackVisual.$slots;
                var projectFromAnchors = this.projectFromAnchors;
                if (projectFromAnchors !== null) {
                    for (var slotName in slots) {
                        var slot = slots[slotName];
                        for (var i = 0, ii = projectFromAnchors.length; i < ii; ++i) {
                            var anchor = projectFromAnchors[i];
                            slot.projectFrom(anchor.$ownerView, anchor.$slotProjectFrom);
                        }
                    }
                }
                this.fallbackSlots = slots;
                distributeNodes(view, nodes, slots, projectionSource, index);
            }
        };
        ShadowSlot.prototype.addNode = function (view, node, projectionSource, index, destination) {
            this.removeFallbackVisual();
            if (node.$slot instanceof PassThroughSlot) {
                node.$slot.passThroughTo(this);
                return;
            }
            if (this.destinationSlots !== null) {
                distributeNodes(view, [node], this.destinationSlots, this, index);
            }
            else {
                node.$ownerView = view;
                node.$projectionSource = projectionSource;
                node.$assignedSlot = this;
                var anchor = this.findAnchor(view, node, projectionSource, index);
                var parent_1 = anchor.parentNode;
                dom_1.DOM.insertBefore(node, anchor);
                this.children.push(node);
                this.projections++;
            }
        };
        ShadowSlot.prototype.removeView = function (view, projectionSource) {
            if (this.destinationSlots !== null) {
                exports.ShadowDOMEmulation.undistributeView(view, this.destinationSlots, this);
            }
            else if (this.fallbackVisual && this.fallbackVisual.$slots) {
                exports.ShadowDOMEmulation.undistributeView(view, this.fallbackVisual.$slots, projectionSource);
            }
            else {
                var found = this.children.find(function (x) { return x.$slotProjectFrom === projectionSource; });
                if (found) {
                    var children = found.$projectionChildren;
                    for (var i = 0, ii = children.length; i < ii; ++i) {
                        var child = children[i];
                        if (child.$ownerView === view) {
                            children.splice(i, 1);
                            view.appendChild(child);
                            i--;
                            ii--;
                            this.projections--;
                        }
                    }
                    if (this.needsFallback) {
                        this.renderFallback(view, noNodes, projectionSource);
                    }
                }
            }
        };
        ShadowSlot.prototype.removeAll = function (projectionSource) {
            if (this.destinationSlots !== null) {
                undistributeAll(this.destinationSlots, this);
            }
            else if (this.fallbackVisual && this.fallbackVisual.$slots) {
                undistributeAll(this.fallbackVisual.$slots, projectionSource);
            }
            else {
                var found = this.children.find(function (x) { return x.$slotProjectFrom === projectionSource; });
                if (found) {
                    var children = found.$projectionChildren;
                    for (var i = 0, ii = children.length; i < ii; ++i) {
                        var child = children[i];
                        child.$ownerView.appendChild(child);
                        this.projections--;
                    }
                    found.$projectionChildren = [];
                    if (this.needsFallback) {
                        this.renderFallback(null, noNodes, projectionSource);
                    }
                }
            }
        };
        ShadowSlot.prototype.findAnchor = function (view, node, projectionSource, index) {
            if (projectionSource) {
                var found = this.children.find(function (x) { return x.$slotProjectFrom === projectionSource; });
                if (found) {
                    if (index !== undefined) {
                        var children = found.$projectionChildren;
                        var viewIndex = -1;
                        var lastView = void 0;
                        for (var i = 0, ii = children.length; i < ii; ++i) {
                            var current = children[i];
                            if (current.$ownerView !== lastView) {
                                viewIndex++;
                                lastView = current.$ownerView;
                                if (viewIndex >= index && lastView !== view) {
                                    children.splice(i, 0, node);
                                    return current;
                                }
                            }
                        }
                    }
                    found.$projectionChildren.push(node);
                    return found;
                }
            }
            return this.anchor;
        };
        ShadowSlot.prototype.projectTo = function (slots) {
            this.destinationSlots = slots;
        };
        ShadowSlot.prototype.projectFrom = function (view, projectionSource) {
            var anchor = dom_1.DOM.createAnchor();
            var parent = this.anchor.parentNode;
            anchor.$slotProjectFrom = projectionSource;
            anchor.$ownerView = view;
            anchor.$projectionChildren = [];
            dom_1.DOM.insertBefore(anchor, this.anchor);
            this.children.push(anchor);
            if (this.projectFromAnchors === null) {
                this.projectFromAnchors = [];
            }
            this.projectFromAnchors.push(anchor);
        };
        return ShadowSlot;
    }(ShadowSlotBase));
    function distributeNodes(view, nodes, slots, projectionSource, index, destinationOverride) {
        if (destinationOverride === void 0) { destinationOverride = null; }
        for (var i = 0, ii = nodes.length; i < ii; ++i) {
            var currentNode = nodes[i];
            if (currentNode.$isContentProjectionSource) {
                currentNode.$slot.projectTo(slots);
                for (var slotName in slots) {
                    slots[slotName].projectFrom(view, currentNode.$slot);
                }
                nodes.splice(i, 1);
                ii--;
                i--;
            }
            else if (dom_1.DOM.isElementNodeType(currentNode) || dom_1.DOM.isTextNodeType(currentNode) || currentNode.$slot instanceof PassThroughSlot) {
                if (dom_1.DOM.isTextNodeType(currentNode) && dom_1.DOM.isAllWhitespace(currentNode)) {
                    nodes.splice(i, 1);
                    ii--;
                    i--;
                }
                else {
                    var found = slots[destinationOverride || getSlotName(currentNode)];
                    if (found) {
                        found.addNode(view, currentNode, projectionSource, index);
                        nodes.splice(i, 1);
                        ii--;
                        i--;
                    }
                }
            }
            else {
                nodes.splice(i, 1);
                ii--;
                i--;
            }
        }
        for (var slotName in slots) {
            var slot = slots[slotName];
            if (slot.needsFallback) {
                slot.renderFallback(view, nodes, projectionSource, index);
            }
        }
    }
    function undistributeAll(slots, projectionSource) {
        for (var slotName in slots) {
            slots[slotName].removeAll(projectionSource);
        }
    }
    var defaultSlotName = 'auDefaultSlot';
    function getSlotName(node) {
        var name = node.$slotName;
        if (name === undefined) {
            return defaultSlotName;
        }
        return name;
    }
    function viewToNodes(view) {
        var nodes;
        if (view === null) {
            nodes = noNodes;
        }
        else {
            var childNodes = view.childNodes;
            var ii = childNodes.length;
            nodes = new Array(ii);
            for (var i = 0; i < ii; ++i) {
                nodes[i] = childNodes[i];
            }
        }
        return nodes;
    }
    exports.ShadowDOMEmulation = {
        createSlot: function (target, owner, name, destination, fallbackFactory) {
            var anchor = dom_1.DOM.createAnchor();
            dom_1.DOM.replaceNode(anchor, target);
            if (destination) {
                return new PassThroughSlot(owner, anchor, name || defaultSlotName, destination, fallbackFactory);
            }
            else {
                return new ShadowSlot(owner, anchor, name || defaultSlotName, fallbackFactory);
            }
        },
        distributeContent: function (content, slots) {
            var nodes = viewToNodes(content);
            nodes.forEach(function (node) {
                if (node.$isContentProjectionSource) {
                    node.$slot.logicalView = content;
                }
            });
            distributeNodes(content, nodes, slots, null, 0, null);
        },
        distributeView: function (view, slots, projectionSource, index, destinationOverride) {
            if (projectionSource === void 0) { projectionSource = null; }
            if (index === void 0) { index = 0; }
            if (destinationOverride === void 0) { destinationOverride = null; }
            distributeNodes(view, viewToNodes(view), slots, projectionSource, index, destinationOverride);
        },
        undistributeView: function (view, slots, projectionSource) {
            for (var slotName in slots) {
                slots[slotName].removeView(view, projectionSource);
            }
        }
    };
});



define('runtime/templating/template-compiler',["require", "exports", "../../kernel/di"], function (require, exports, di_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ITemplateCompiler = di_1.DI.createInterface().noDefault();
});



define('runtime/templating/template',["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
});



define('runtime/templating/view',["require", "exports", "../../kernel/platform", "../../kernel/di", "../dom", "../../kernel/reporter"], function (require, exports, platform_1, di_1, dom_1, reporter_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.IViewOwner = di_1.DI.createInterface();
    var noopView = {
        firstChild: null,
        lastChild: null,
        childNodes: platform_1.PLATFORM.emptyArray,
        findTargets: function () { return platform_1.PLATFORM.emptyArray; },
        insertBefore: function (refNode) { },
        appendTo: function (parent) { },
        remove: function () { },
        appendChild: function (child) { }
    };
    exports.View = {
        none: noopView,
        fromCompiledContent: function (host, options) {
            if (options === void 0) { options = platform_1.PLATFORM.emptyObject; }
            if (dom_1.DOM.isUsingSlotEmulation(host)) {
                return new ContentView(options.contentOverride || host);
            }
            else {
                return null;
            }
        },
        fromNode: function (node) {
            return {
                firstChild: node,
                lastChild: node,
                childNodes: [node],
                findTargets: function () {
                    return platform_1.PLATFORM.emptyArray;
                },
                appendChild: function (node) {
                    dom_1.DOM.appendChild(node, node);
                },
                insertBefore: function (refNode) {
                    dom_1.DOM.insertBefore(node, refNode);
                },
                appendTo: function (parent) {
                    dom_1.DOM.appendChild(parent, node);
                },
                remove: function () {
                    dom_1.DOM.remove(node);
                }
            };
        }
    };
    var ContentView = (function () {
        function ContentView(contentHost) {
            this.contentHost = contentHost;
            this.childObserver = null;
            var childNodes = this.childNodes = Array.from(contentHost.childNodes);
            this.firstChild = childNodes[0];
            this.lastChild = childNodes[childNodes.length - 1];
        }
        ContentView.prototype.attachChildObserver = function (onChildrenChanged) {
            var contentViewNodes = this.childNodes;
            var observer = this.childObserver;
            if (!observer) {
                this.childObserver = observer = {
                    get childNodes() {
                        return contentViewNodes;
                    },
                    disconnect: function () {
                        onChildrenChanged = null;
                    },
                    notifyChildrenChanged: function () {
                        if (onChildrenChanged !== null) {
                            onChildrenChanged();
                        }
                    }
                };
                var workQueue_1 = Array.from(contentViewNodes);
                var _loop_1 = function () {
                    var current = workQueue_1.shift();
                    if (current.$isContentProjectionSource) {
                        var contentIndex_1 = contentViewNodes.indexOf(current);
                        current.$slot.children.forEach(function (x) {
                            var childNodes = x.$view.childNodes;
                            childNodes.forEach(function (x) { return workQueue_1.push(x); });
                            contentViewNodes.splice.apply(contentViewNodes, [contentIndex_1, 0].concat(childNodes));
                        });
                        current.$slot.logicalView = this_1;
                    }
                };
                var this_1 = this;
                while (workQueue_1.length) {
                    _loop_1();
                }
            }
            else {
                reporter_1.Reporter.error(16);
            }
            return observer;
        };
        ContentView.prototype.insertVisualChildBefore = function (visual, refNode) {
            var _this = this;
            var childObserver = this.childObserver;
            if (childObserver) {
                var contentNodes = this.childNodes;
                var contentIndex = contentNodes.indexOf(refNode);
                var projectedNodes = Array.from(visual.$view.childNodes);
                projectedNodes.forEach(function (node) {
                    if (node.$isContentProjectionSource) {
                        node.$slot.logicalView = _this;
                    }
                });
                contentNodes.splice.apply(contentNodes, [contentIndex, 0].concat(projectedNodes));
                childObserver.notifyChildrenChanged();
            }
        };
        ContentView.prototype.removeVisualChild = function (visual) {
            var childObserver = this.childObserver;
            if (childObserver) {
                var contentNodes = this.childNodes;
                var startIndex = contentNodes.indexOf(visual.$view.firstChild);
                var endIndex = contentNodes.indexOf(visual.$view.lastChild);
                contentNodes.splice(startIndex, (endIndex - startIndex) + 1);
                childObserver.notifyChildrenChanged();
            }
        };
        ContentView.prototype.findTargets = function () { return platform_1.PLATFORM.emptyArray; };
        ContentView.prototype.appendChild = function (child) { };
        ContentView.prototype.insertBefore = function (refNode) { };
        ContentView.prototype.appendTo = function (parent) { };
        ContentView.prototype.remove = function () { };
        return ContentView;
    }());
});



define('runtime/templating/visual',["require", "exports", "../../kernel/di"], function (require, exports, di_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var MotionDirection;
    (function (MotionDirection) {
        MotionDirection["enter"] = "enter";
        MotionDirection["leave"] = "leave";
    })(MotionDirection = exports.MotionDirection || (exports.MotionDirection = {}));
    exports.IVisualFactory = di_1.DI.createInterface();
});



var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
define('runtime/binding/resources/attr-binding-behavior',["require", "exports", "../element-observation", "../binding-behavior"], function (require, exports, element_observation_1, binding_behavior_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var AttrBindingBehavior = (function () {
        function AttrBindingBehavior() {
        }
        AttrBindingBehavior.prototype.bind = function (binding, scope) {
            binding.targetObserver = new element_observation_1.DataAttributeObserver(binding.target, binding.targetProperty);
        };
        AttrBindingBehavior.prototype.unbind = function (binding, scope) { };
        AttrBindingBehavior = __decorate([
            binding_behavior_1.bindingBehavior('attr')
        ], AttrBindingBehavior);
        return AttrBindingBehavior;
    }());
    exports.AttrBindingBehavior = AttrBindingBehavior;
});



var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
define('runtime/binding/resources/binding-mode-behaviors',["require", "exports", "../binding-mode", "../binding-behavior"], function (require, exports, binding_mode_1, binding_behavior_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var BindingModeBehavior = (function () {
        function BindingModeBehavior(mode) {
            this.mode = mode;
        }
        BindingModeBehavior.prototype.bind = function (binding, scope) {
            binding.originalMode = binding.mode;
            binding.mode = this.mode;
        };
        BindingModeBehavior.prototype.unbind = function (binding, scope) {
            binding.mode = binding.originalMode;
            binding.originalMode = null;
        };
        return BindingModeBehavior;
    }());
    var OneTimeBindingBehavior = (function (_super) {
        __extends(OneTimeBindingBehavior, _super);
        function OneTimeBindingBehavior() {
            return _super.call(this, binding_mode_1.BindingMode.oneTime) || this;
        }
        OneTimeBindingBehavior = __decorate([
            binding_behavior_1.bindingBehavior('oneTime'),
            __metadata("design:paramtypes", [])
        ], OneTimeBindingBehavior);
        return OneTimeBindingBehavior;
    }(BindingModeBehavior));
    exports.OneTimeBindingBehavior = OneTimeBindingBehavior;
    var OneWayBindingBehavior = (function (_super) {
        __extends(OneWayBindingBehavior, _super);
        function OneWayBindingBehavior() {
            return _super.call(this, binding_mode_1.BindingMode.oneWay) || this;
        }
        OneWayBindingBehavior = __decorate([
            binding_behavior_1.bindingBehavior('oneWay'),
            __metadata("design:paramtypes", [])
        ], OneWayBindingBehavior);
        return OneWayBindingBehavior;
    }(BindingModeBehavior));
    exports.OneWayBindingBehavior = OneWayBindingBehavior;
    var TwoWayBindingBehavior = (function (_super) {
        __extends(TwoWayBindingBehavior, _super);
        function TwoWayBindingBehavior() {
            return _super.call(this, binding_mode_1.BindingMode.twoWay) || this;
        }
        TwoWayBindingBehavior = __decorate([
            binding_behavior_1.bindingBehavior('twoWay'),
            __metadata("design:paramtypes", [])
        ], TwoWayBindingBehavior);
        return TwoWayBindingBehavior;
    }(BindingModeBehavior));
    exports.TwoWayBindingBehavior = TwoWayBindingBehavior;
});



var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
define('runtime/binding/resources/debounce-binding-behavior',["require", "exports", "../binding-context", "../binding-mode", "../binding", "../binding-behavior"], function (require, exports, binding_context_1, binding_mode_1, binding_1, binding_behavior_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var unset = {};
    function debounceCallSource(event) {
        var _this = this;
        var state = this.debounceState;
        clearTimeout(state.timeoutId);
        state.timeoutId = setTimeout(function () { return _this.debouncedMethod(event); }, state.delay);
    }
    function debounceCall(context, newValue, oldValue) {
        var _this = this;
        var state = this.debounceState;
        clearTimeout(state.timeoutId);
        if (context !== state.callContextToDebounce) {
            state.oldValue = unset;
            this.debouncedMethod(context, newValue, oldValue);
            return;
        }
        if (state.oldValue === unset) {
            state.oldValue = oldValue;
        }
        state.timeoutId = setTimeout(function () {
            var ov = state.oldValue;
            state.oldValue = unset;
            _this.debouncedMethod(context, newValue, ov);
        }, state.delay);
    }
    var DebounceBindingBehavior = (function () {
        function DebounceBindingBehavior() {
        }
        DebounceBindingBehavior.prototype.bind = function (binding, scope, delay) {
            if (delay === void 0) { delay = 200; }
            var methodToDebounce;
            var callContextToDebounce;
            var debouncer;
            if (binding instanceof binding_1.Binding) {
                var mode = binding.mode;
                methodToDebounce = 'call';
                debouncer = debounceCall;
                callContextToDebounce = mode === binding_mode_1.BindingMode.twoWay || mode === binding_mode_1.BindingMode.fromView
                    ? binding_context_1.targetContext
                    : binding_context_1.sourceContext;
            }
            else {
                methodToDebounce = 'callSource';
                debouncer = debounceCallSource;
                callContextToDebounce = binding_context_1.sourceContext;
            }
            binding.debouncedMethod = binding[methodToDebounce];
            binding.debouncedMethod.originalName = methodToDebounce;
            binding[methodToDebounce] = debouncer;
            binding.debounceState = {
                callContextToDebounce: callContextToDebounce,
                delay: delay,
                timeoutId: 0,
                oldValue: unset
            };
        };
        DebounceBindingBehavior.prototype.unbind = function (binding, scope) {
            var methodToRestore = binding.debouncedMethod.originalName;
            binding[methodToRestore] = binding.debouncedMethod;
            binding.debouncedMethod = null;
            clearTimeout(binding.debounceState.timeoutId);
            binding.debounceState = null;
        };
        DebounceBindingBehavior = __decorate([
            binding_behavior_1.bindingBehavior('debounce')
        ], DebounceBindingBehavior);
        return DebounceBindingBehavior;
    }());
    exports.DebounceBindingBehavior = DebounceBindingBehavior;
});



var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
define('runtime/binding/resources/sanitize',["require", "exports", "../../../kernel/di", "../value-converter"], function (require, exports, di_1, value_converter_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var SCRIPT_REGEX = /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi;
    exports.ISanitizer = di_1.DI.createInterface()
        .withDefault(function (x) { return x.singleton((function () {
        function class_1() {
        }
        class_1.prototype.sanitize = function (input) {
            return input.replace(SCRIPT_REGEX, '');
        };
        return class_1;
    }())); });
    var SanitizeValueConverter = (function () {
        function SanitizeValueConverter(sanitizer) {
            this.sanitizer = sanitizer;
            this.sanitizer = sanitizer;
        }
        SanitizeValueConverter.prototype.toView = function (untrustedMarkup) {
            if (untrustedMarkup === null || untrustedMarkup === undefined) {
                return null;
            }
            return this.sanitizer.sanitize(untrustedMarkup);
        };
        SanitizeValueConverter = __decorate([
            value_converter_1.valueConverter('sanitize'),
            di_1.inject(exports.ISanitizer),
            __metadata("design:paramtypes", [Object])
        ], SanitizeValueConverter);
        return SanitizeValueConverter;
    }());
    exports.SanitizeValueConverter = SanitizeValueConverter;
});



var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
define('runtime/binding/resources/self-binding-behavior',["require", "exports", "../../../kernel/reporter", "../binding-behavior"], function (require, exports, reporter_1, binding_behavior_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    function findOriginalEventTarget(event) {
        return (event.path && event.path[0]) || (event.deepPath && event.deepPath[0]) || event.target;
    }
    function handleSelfEvent(event) {
        var target = findOriginalEventTarget(event);
        if (this.target !== target) {
            return;
        }
        this.selfEventCallSource(event);
    }
    var SelfBindingBehavior = (function () {
        function SelfBindingBehavior() {
        }
        SelfBindingBehavior.prototype.bind = function (binding, scope) {
            if (!binding.callSource || !binding.targetEvent) {
                throw reporter_1.Reporter.error(8);
            }
            binding.selfEventCallSource = binding.callSource;
            binding.callSource = handleSelfEvent;
        };
        SelfBindingBehavior.prototype.unbind = function (binding, scope) {
            binding.callSource = binding.selfEventCallSource;
            binding.selfEventCallSource = null;
        };
        SelfBindingBehavior = __decorate([
            binding_behavior_1.bindingBehavior('self')
        ], SelfBindingBehavior);
        return SelfBindingBehavior;
    }());
    exports.SelfBindingBehavior = SelfBindingBehavior;
});



var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
define('runtime/binding/resources/signals',["require", "exports", "../../../kernel/di", "../binding-behavior", "../../../kernel/reporter", "../signaler"], function (require, exports, di_1, binding_behavior_1, reporter_1, signaler_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var SignalBindingBehavior = (function () {
        function SignalBindingBehavior(signaler) {
            this.signaler = signaler;
        }
        SignalBindingBehavior.prototype.bind = function (binding, scope) {
            if (!binding.updateTarget) {
                throw reporter_1.Reporter.error(11);
            }
            if (arguments.length === 3) {
                var name_1 = arguments[2];
                this.signaler.addSignalListener(name_1, binding);
                binding.signal = name_1;
            }
            else if (arguments.length > 3) {
                var names = Array.prototype.slice.call(arguments, 2);
                var i = names.length;
                while (i--) {
                    var name_2 = names[i];
                    this.signaler.addSignalListener(name_2, binding);
                }
                binding.signal = names;
            }
            else {
                throw reporter_1.Reporter.error(12);
            }
        };
        SignalBindingBehavior.prototype.unbind = function (binding, scope) {
            var name = binding.signal;
            binding.signal = null;
            if (Array.isArray(name)) {
                var names = name;
                var i = names.length;
                while (i--) {
                    this.signaler.removeSignalListener(names[i], binding);
                }
            }
            else {
                this.signaler.removeSignalListener(name, binding);
            }
        };
        SignalBindingBehavior = __decorate([
            binding_behavior_1.bindingBehavior('signal'),
            di_1.inject(signaler_1.ISignaler),
            __metadata("design:paramtypes", [Object])
        ], SignalBindingBehavior);
        return SignalBindingBehavior;
    }());
    exports.SignalBindingBehavior = SignalBindingBehavior;
});



var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
define('runtime/binding/resources/throttle-binding-behavior',["require", "exports", "../binding-mode", "../binding", "../binding-behavior"], function (require, exports, binding_mode_1, binding_1, binding_behavior_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    function throttle(newValue) {
        var _this = this;
        var state = this.throttleState;
        var elapsed = +new Date() - state.last;
        if (elapsed >= state.delay) {
            clearTimeout(state.timeoutId);
            state.timeoutId = null;
            state.last = +new Date();
            this.throttledMethod(newValue);
            return;
        }
        state.newValue = newValue;
        if (state.timeoutId === null) {
            state.timeoutId = setTimeout(function () {
                state.timeoutId = null;
                state.last = +new Date();
                _this.throttledMethod(state.newValue);
            }, state.delay - elapsed);
        }
    }
    var ThrottleBindingBehavior = (function () {
        function ThrottleBindingBehavior() {
        }
        ThrottleBindingBehavior.prototype.bind = function (binding, scope, delay) {
            if (delay === void 0) { delay = 200; }
            var methodToThrottle;
            if (binding instanceof binding_1.Binding) {
                if (binding.mode === binding_mode_1.BindingMode.twoWay) {
                    methodToThrottle = 'updateSource';
                }
                else {
                    methodToThrottle = 'updateTarget';
                }
            }
            else {
                methodToThrottle = 'callSource';
            }
            binding.throttledMethod = binding[methodToThrottle];
            binding.throttledMethod.originalName = methodToThrottle;
            binding[methodToThrottle] = throttle;
            binding.throttleState = {
                delay: delay,
                last: 0,
                timeoutId: null
            };
        };
        ThrottleBindingBehavior.prototype.unbind = function (binding, scope) {
            var methodToRestore = binding.throttledMethod.originalName;
            binding[methodToRestore] = binding.throttledMethod;
            binding.throttledMethod = null;
            clearTimeout(binding.throttleState.timeoutId);
            binding.throttleState = null;
        };
        ThrottleBindingBehavior = __decorate([
            binding_behavior_1.bindingBehavior('throttle')
        ], ThrottleBindingBehavior);
        return ThrottleBindingBehavior;
    }());
    exports.ThrottleBindingBehavior = ThrottleBindingBehavior;
});



var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
define('runtime/binding/resources/update-trigger-binding-behavior',["require", "exports", "../binding-mode", "../event-manager", "../observer-locator", "../../../kernel/reporter", "../binding-behavior", "../../../kernel/di"], function (require, exports, binding_mode_1, event_manager_1, observer_locator_1, reporter_1, binding_behavior_1, di_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var UpdateTriggerBindingBehavior = (function () {
        function UpdateTriggerBindingBehavior(observerLocator) {
            this.observerLocator = observerLocator;
        }
        UpdateTriggerBindingBehavior.prototype.bind = function (binding, scope) {
            var events = [];
            for (var _i = 2; _i < arguments.length; _i++) {
                events[_i - 2] = arguments[_i];
            }
            if (events.length === 0) {
                throw reporter_1.Reporter.error(9);
            }
            if (binding.mode !== binding_mode_1.BindingMode.twoWay && binding.mode !== binding_mode_1.BindingMode.fromView) {
                throw reporter_1.Reporter.error(10);
            }
            var targetObserver = this.observerLocator.getObserver(binding.target, binding.targetProperty);
            if (!targetObserver.handler) {
                throw reporter_1.Reporter.error(10);
            }
            binding.targetObserver = targetObserver;
            targetObserver.originalHandler = binding.targetObserver.handler;
            targetObserver.handler = new event_manager_1.EventSubscriber(events);
        };
        UpdateTriggerBindingBehavior.prototype.unbind = function (binding, scope) {
            binding.targetObserver.handler.dispose();
            binding.targetObserver.handler = binding.targetObserver.originalHandler;
            binding.targetObserver.originalHandler = null;
        };
        UpdateTriggerBindingBehavior = __decorate([
            binding_behavior_1.bindingBehavior('updateTrigger'),
            di_1.inject(observer_locator_1.IObserverLocator),
            __metadata("design:paramtypes", [Object])
        ], UpdateTriggerBindingBehavior);
        return UpdateTriggerBindingBehavior;
    }());
    exports.UpdateTriggerBindingBehavior = UpdateTriggerBindingBehavior;
});



var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
define('runtime/templating/resources/compose',["require", "exports", "../custom-element", "../render-slot", "../instructions", "../view", "../../dom", "../rendering-engine", "../../../kernel/di"], function (require, exports, custom_element_1, render_slot_1, instructions_1, view_1, dom_1, rendering_engine_1, di_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var composeSource = {
        name: 'au-compose',
        template: null,
        instructions: null
    };
    var composeProps = ['component', 'swapOrder', 'isComposing'];
    var Compose = (function () {
        function Compose(viewOwner, host, slot, instruction, renderingEngine) {
            this.viewOwner = viewOwner;
            this.host = host;
            this.slot = slot;
            this.renderingEngine = renderingEngine;
            this.task = null;
            this.visual = null;
            this.auContent = null;
            this.compositionContext = viewOwner.$context;
            this.baseInstruction = {
                type: instructions_1.TargetedInstructionType.hydrateElement,
                instructions: instruction.instructions.filter(function (x) { return !composeProps.includes(x.dest); }),
                res: null,
                parts: instruction.parts
            };
        }
        Compose.prototype.componentChanged = function (toBeComposed) {
            if (this.visual !== null && this.visual.component === toBeComposed) {
                return;
            }
            if (!toBeComposed) {
                this.clear();
            }
            else {
                var previousTask = this.task;
                var newTask_1 = this.task = new CompositionTask(this);
                if (previousTask !== null) {
                    var cancelResult = previousTask.cancel();
                    if (cancelResult instanceof Promise) {
                        cancelResult.then(function () { return newTask_1.start(toBeComposed); });
                        return;
                    }
                }
                newTask_1.start(toBeComposed);
            }
        };
        Compose.prototype.compose = function (toBeComposed) {
            var instruction = Object.assign({}, this.baseInstruction, {
                resource: toBeComposed,
                contentOverride: this.createContentElement()
            });
            return this.swap(this.renderingEngine.createVisualFromComponent(this.compositionContext, toBeComposed, instruction));
        };
        Compose.prototype.createContentElement = function () {
            var auContent = this.auContent;
            var append = dom_1.DOM.appendChild;
            if (auContent == null) {
                this.auContent = auContent = dom_1.DOM.createElement('au-content');
                if (dom_1.DOM.isUsingSlotEmulation(this.host)) {
                    var nodes = this.$contentView.childNodes;
                    for (var i = 0, ii = nodes.length; i < ii; ++i) {
                        append(auContent, nodes[i]);
                    }
                }
                else {
                    var element = this.host;
                    while (element.firstChild) {
                        append(auContent, element.firstChild);
                    }
                }
            }
            return dom_1.DOM.cloneNode(auContent);
        };
        Compose.prototype.swap = function (newVisual) {
            var index = this.$bindable.indexOf(this.visual);
            if (index !== -1) {
                this.$bindable.splice(index, 1);
            }
            this.visual = newVisual;
            this.$bindable.push(newVisual);
            if (this.$isBound) {
                newVisual.$bind(this.viewOwner.$scope);
            }
            return this.slot.swap(newVisual, this.swapOrder || render_slot_1.SwapOrder.after);
        };
        Compose.prototype.clear = function () {
            this.slot.removeAll();
        };
        Compose = __decorate([
            custom_element_1.customElement(composeSource),
            di_1.inject(view_1.IViewOwner, dom_1.INode, render_slot_1.IRenderSlot, instructions_1.ITargetedInstruction, rendering_engine_1.IRenderingEngine),
            __metadata("design:paramtypes", [Object, Object, Object, Object, Object])
        ], Compose);
        return Compose;
    }());
    exports.Compose = Compose;
    var CompositionTask = (function () {
        function CompositionTask(compose) {
            this.compose = compose;
            this.isCancelled = false;
            this.composeResult = null;
        }
        CompositionTask.prototype.start = function (toBeComposed) {
            var _this = this;
            if (this.isCancelled) {
                return;
            }
            this.compose.isComposing = true;
            if (toBeComposed instanceof Promise) {
                toBeComposed.then(function (x) { return _this.render(x); });
            }
            else {
                this.render(toBeComposed);
            }
        };
        CompositionTask.prototype.cancel = function () {
            this.compose.isComposing = false;
            this.isCancelled = true;
            return this.composeResult;
        };
        CompositionTask.prototype.render = function (toBeComposed) {
            var _this = this;
            if (this.isCancelled) {
                return;
            }
            this.composeResult = this.compose.compose(toBeComposed);
            if (this.composeResult instanceof Promise) {
                this.composeResult = this.composeResult.then(function () { return _this.compose.isComposing = false; });
            }
            else {
                this.compose.isComposing = false;
                this.composeResult = null;
            }
        };
        return CompositionTask;
    }());
});



var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
define('runtime/templating/resources/else',["require", "exports", "./if-core", "../visual", "../render-slot", "../custom-attribute", "../../../kernel/di"], function (require, exports, if_core_1, visual_1, render_slot_1, custom_attribute_1, di_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var Else = (function (_super) {
        __extends(Else, _super);
        function Else() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        Else.prototype.bound = function (scope) {
            if (this.ifBehavior.condition) {
                this.hide();
            }
            else {
                this.show();
            }
        };
        Else.prototype.link = function (ifBehavior) {
            if (this.ifBehavior === ifBehavior) {
                return this;
            }
            this.ifBehavior = ifBehavior;
            ifBehavior.link(this);
            return this;
        };
        Else = __decorate([
            custom_attribute_1.templateController('else'),
            di_1.inject(visual_1.IVisualFactory, render_slot_1.IRenderSlot)
        ], Else);
        return Else;
    }(if_core_1.IfCore));
    exports.Else = Else;
});



define('runtime/templating/resources/if-core',["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var IfCore = (function () {
        function IfCore(factory, slot) {
            this.factory = factory;
            this.slot = slot;
            this.child = null;
            this.showing = false;
        }
        IfCore.prototype.unbound = function () {
            var visual = this.child;
            if (visual === null) {
                return;
            }
            this.child.$unbind();
            if (!this.factory.isCaching) {
                return;
            }
            if (this.showing) {
                this.showing = false;
                this.slot.remove(visual, true, true);
            }
            else {
                visual.tryReturnToCache();
            }
            this.child = null;
        };
        IfCore.prototype.show = function () {
            if (this.child === null) {
                this.child = this.factory.create();
            }
            this.child.$bind(this.$scope);
            if (!this.showing) {
                this.showing = true;
                return this.slot.add(this.child);
            }
        };
        IfCore.prototype.hide = function () {
            if (!this.showing) {
                return;
            }
            var visual = this.child;
            var removed = this.slot.remove(visual);
            this.showing = false;
            if (removed instanceof Promise) {
                return removed.then(function () { return visual.$unbind(); });
            }
            visual.$unbind();
        };
        return IfCore;
    }());
    exports.IfCore = IfCore;
});



var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
define('runtime/templating/resources/if',["require", "exports", "./if-core", "../render-slot", "../custom-attribute", "../../../kernel/di", "../visual", "../bindable"], function (require, exports, if_core_1, render_slot_1, custom_attribute_1, di_1, visual_1, bindable_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var If = (function (_super) {
        __extends(If, _super);
        function If() {
            var _this = _super !== null && _super.apply(this, arguments) || this;
            _this.animating = false;
            _this.swapOrder = render_slot_1.SwapOrder.after;
            _this.condition = false;
            return _this;
        }
        If.prototype.conditionChanged = function (newValue) {
            this.update(newValue);
        };
        If.prototype.link = function (elseBehavior) {
            if (this.elseBehavior === elseBehavior) {
                return this;
            }
            this.elseBehavior = elseBehavior;
            elseBehavior.link(this);
            return this;
        };
        If.prototype.update = function (show) {
            var _this = this;
            if (this.animating) {
                return;
            }
            var promise;
            if (this.elseBehavior) {
                promise = show ? this.swap(this.elseBehavior, this) : this.swap(this, this.elseBehavior);
            }
            else {
                promise = show ? this.show() : this.hide();
            }
            if (promise) {
                this.animating = true;
                promise.then(function () {
                    _this.animating = false;
                    if (_this.condition !== _this.showing) {
                        _this.update(_this.condition);
                    }
                });
            }
        };
        If.prototype.swap = function (remove, add) {
            switch (this.swapOrder) {
                case render_slot_1.SwapOrder.before:
                    return Promise.resolve(add.show()).then(function () { return remove.hide(); });
                case render_slot_1.SwapOrder.with:
                    return Promise.all([remove.hide(), add.show()]);
                default:
                    var promise = remove.hide();
                    return promise ? promise.then(function () { return add.show(); }) : add.show();
            }
        };
        __decorate([
            bindable_1.bindable,
            __metadata("design:type", String)
        ], If.prototype, "swapOrder", void 0);
        __decorate([
            bindable_1.bindable,
            __metadata("design:type", Boolean)
        ], If.prototype, "condition", void 0);
        If = __decorate([
            custom_attribute_1.templateController('if'),
            di_1.inject(visual_1.IVisualFactory, render_slot_1.IRenderSlot)
        ], If);
        return If;
    }(if_core_1.IfCore));
    exports.If = If;
});



var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
define('runtime/templating/resources/replaceable',["require", "exports", "../custom-attribute", "../render-slot", "../../../kernel/di", "../visual"], function (require, exports, custom_attribute_1, render_slot_1, di_1, visual_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var Replaceable = (function () {
        function Replaceable(factory, slot) {
            this.factory = factory;
            this.slot = slot;
            this.child = this.factory.create();
            this.slot.add(this.child);
        }
        Replaceable.prototype.bound = function (scope) {
            this.child.$bind(scope);
        };
        Replaceable.prototype.unbound = function () {
            this.child.$unbind();
        };
        Replaceable = __decorate([
            custom_attribute_1.templateController('replaceable'),
            di_1.inject(visual_1.IVisualFactory, render_slot_1.IRenderSlot),
            __metadata("design:paramtypes", [Object, Object])
        ], Replaceable);
        return Replaceable;
    }());
    exports.Replaceable = Replaceable;
});



var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
define('runtime/templating/resources/with',["require", "exports", "../custom-attribute", "../render-slot", "../../binding/binding-context", "../../../kernel/di", "../visual"], function (require, exports, custom_attribute_1, render_slot_1, binding_context_1, di_1, visual_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var With = (function () {
        function With(factory, slot) {
            this.factory = factory;
            this.slot = slot;
            this.child = null;
            this.value = null;
            this.child = factory.create();
            this.slot.add(this.child);
        }
        With.prototype.valueChanged = function (newValue) {
            var childScope = {
                bindingContext: newValue,
                overrideContext: binding_context_1.BindingContext.createOverride(newValue, this.$scope.overrideContext)
            };
            this.child.$bind(childScope);
        };
        With.prototype.unbound = function () {
            this.child.$unbind();
        };
        With = __decorate([
            custom_attribute_1.templateController('with'),
            di_1.inject(visual_1.IVisualFactory, render_slot_1.IRenderSlot),
            __metadata("design:paramtypes", [Object, Object])
        ], With);
        return With;
    }());
    exports.With = With;
});



define('runtime/templating/resources/repeat/override-contexts',["require", "exports", "../../../binding/binding-context"], function (require, exports, binding_context_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    function updateOverrideContexts(visuals, startIndex) {
        var length = visuals.length;
        if (startIndex > 0) {
            startIndex = startIndex - 1;
        }
        for (; startIndex < length; ++startIndex) {
            updateOverrideContext(visuals[startIndex].$scope.overrideContext, startIndex, length);
        }
    }
    exports.updateOverrideContexts = updateOverrideContexts;
    function createFullOverrideContext(repeat, data, index, length, key) {
        var bindingContext = {};
        var overrideContext = binding_context_1.BindingContext.createOverride(bindingContext, repeat.scope.overrideContext);
        if (typeof key !== 'undefined') {
            bindingContext[repeat.key] = key;
            bindingContext[repeat.value] = data;
        }
        else {
            bindingContext[repeat.local] = data;
        }
        updateOverrideContext(overrideContext, index, length);
        return overrideContext;
    }
    exports.createFullOverrideContext = createFullOverrideContext;
    function updateOverrideContext(overrideContext, index, length) {
        var first = (index === 0);
        var last = (index === length - 1);
        var even = index % 2 === 0;
        overrideContext.$index = index;
        overrideContext.$first = first;
        overrideContext.$last = last;
        overrideContext.$middle = !(first || last);
        overrideContext.$odd = !even;
        overrideContext.$even = even;
    }
    exports.updateOverrideContext = updateOverrideContext;
});



define('runtime/templating/resources/repeat/repeat-strategy-array',["require", "exports", "./override-contexts", "../../../binding/array-change-records", "../../../binding/binding-context"], function (require, exports, override_contexts_1, array_change_records_1, binding_context_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    function indexOf(array, item, matcher, startIndex) {
        if (startIndex === void 0) { startIndex = 0; }
        if (matcher) {
            var length_1 = array.length;
            for (var index = startIndex; index < length_1; index++) {
                if (matcher(array[index], item)) {
                    return index;
                }
            }
            return -1;
        }
        return array.indexOf(item);
    }
    var ArrayRepeatStrategy = (function () {
        function ArrayRepeatStrategy(observerLocator) {
            this.observerLocator = observerLocator;
        }
        ArrayRepeatStrategy.prototype.handles = function (items) {
            return items instanceof Array;
        };
        ArrayRepeatStrategy.prototype.getCollectionObserver = function (items) {
            return this.observerLocator.getArrayObserver(items);
        };
        ArrayRepeatStrategy.prototype.instanceChanged = function (repeat, items) {
            var _this = this;
            var itemsLength = items.length;
            if (!items || itemsLength === 0) {
                repeat.removeAllVisuals(true, !repeat.visualsRequireLifecycle);
                return;
            }
            var children = repeat.visuals();
            var viewsLength = children.length;
            if (viewsLength === 0) {
                this.standardProcessInstanceChanged(repeat, items);
                return;
            }
            if (repeat.visualsRequireLifecycle) {
                var childrenSnapshot = children.slice(0);
                var itemNameInBindingContext = repeat.local;
                var matcher_1 = repeat.matcher;
                var itemsPreviouslyInViews_1 = [];
                var viewsToRemove = [];
                for (var index = 0; index < viewsLength; index++) {
                    var view = childrenSnapshot[index];
                    var oldItem = view.$scope.bindingContext[itemNameInBindingContext];
                    if (indexOf(items, oldItem, matcher_1) === -1) {
                        viewsToRemove.push(view);
                    }
                    else {
                        itemsPreviouslyInViews_1.push(oldItem);
                    }
                }
                var updateViews = void 0;
                var removePromise = void 0;
                if (itemsPreviouslyInViews_1.length > 0) {
                    removePromise = repeat.removeVisuals(viewsToRemove, true, !repeat.visualsRequireLifecycle);
                    updateViews = function () {
                        for (var index = 0; index < itemsLength; index++) {
                            var item = items[index];
                            var indexOfView = indexOf(itemsPreviouslyInViews_1, item, matcher_1, index);
                            var view = void 0;
                            if (indexOfView === -1) {
                                var overrideContext = override_contexts_1.createFullOverrideContext(repeat, items[index], index, itemsLength);
                                repeat.insertVisualWithScope(index, binding_context_1.BindingContext.createScopeFromOverride(overrideContext));
                                itemsPreviouslyInViews_1.splice(index, 0, undefined);
                            }
                            else if (indexOfView === index) {
                                view = children[indexOfView];
                                itemsPreviouslyInViews_1[indexOfView] = undefined;
                            }
                            else {
                                view = children[indexOfView];
                                repeat.moveVisual(indexOfView, index);
                                itemsPreviouslyInViews_1.splice(indexOfView, 1);
                                itemsPreviouslyInViews_1.splice(index, 0, undefined);
                            }
                            if (view) {
                                override_contexts_1.updateOverrideContext(view.$scope.overrideContext, index, itemsLength);
                            }
                        }
                        _this.inPlaceProcessItems(repeat, items);
                    };
                }
                else {
                    removePromise = repeat.removeAllVisuals(true, !repeat.visualsRequireLifecycle);
                    updateViews = function () { return _this.standardProcessInstanceChanged(repeat, items); };
                }
                if (removePromise instanceof Promise) {
                    removePromise.then(updateViews);
                }
                else {
                    updateViews();
                }
            }
            else {
                this.inPlaceProcessItems(repeat, items);
            }
        };
        ArrayRepeatStrategy.prototype.standardProcessInstanceChanged = function (repeat, items) {
            for (var i = 0, ii = items.length; i < ii; i++) {
                var overrideContext = override_contexts_1.createFullOverrideContext(repeat, items[i], i, ii);
                repeat.addVisualWithScope(binding_context_1.BindingContext.createScopeFromOverride(overrideContext));
            }
        };
        ArrayRepeatStrategy.prototype.inPlaceProcessItems = function (repeat, items) {
            var itemsLength = items.length;
            var viewsLength = repeat.visualCount();
            while (viewsLength > itemsLength) {
                viewsLength--;
                repeat.removeVisual(viewsLength, true, !repeat.visualsRequireLifecycle);
            }
            var local = repeat.local;
            for (var i = 0; i < viewsLength; i++) {
                var view = repeat.visualAt(i);
                var last = i === itemsLength - 1;
                var middle = i !== 0 && !last;
                var scope = view.$scope;
                var bindingContext = scope.bindingContext;
                var overrideContext = scope.overrideContext;
                if (bindingContext[local] === items[i]
                    && overrideContext.$middle === middle
                    && overrideContext.$last === last) {
                    continue;
                }
                bindingContext[local] = items[i];
                overrideContext.$middle = middle;
                overrideContext.$last = last;
                repeat.updateBindings(view);
            }
            for (var i = viewsLength; i < itemsLength; i++) {
                var overrideContext = override_contexts_1.createFullOverrideContext(repeat, items[i], i, itemsLength);
                repeat.addVisualWithScope(binding_context_1.BindingContext.createScopeFromOverride(overrideContext));
            }
        };
        ArrayRepeatStrategy.prototype.instanceMutated = function (repeat, array, splices) {
            var _this = this;
            if (repeat.__queuedSplices) {
                for (var i = 0, ii = splices.length; i < ii; ++i) {
                    var _a = splices[i], index = _a.index, removed = _a.removed, addedCount = _a.addedCount;
                    array_change_records_1.mergeSplice(repeat.__queuedSplices, index, removed, addedCount);
                }
                repeat.__array = array.slice(0);
                return;
            }
            var maybePromise = this.runSplices(repeat, array.slice(0), splices);
            if (maybePromise instanceof Promise) {
                var queuedSplices_1 = repeat.__queuedSplices = [];
                var runQueuedSplices_1 = function () {
                    if (!queuedSplices_1.length) {
                        repeat.__queuedSplices = undefined;
                        repeat.__array = undefined;
                        return;
                    }
                    var nextPromise = _this.runSplices(repeat, repeat.__array, queuedSplices_1) || Promise.resolve();
                    queuedSplices_1 = repeat.__queuedSplices = [];
                    nextPromise.then(runQueuedSplices_1);
                };
                maybePromise.then(runQueuedSplices_1);
            }
        };
        ArrayRepeatStrategy.prototype.runSplices = function (repeat, array, splices) {
            var _this = this;
            var rmPromises = [];
            var removeDelta = 0;
            for (var i = 0, ii = splices.length; i < ii; ++i) {
                var splice = splices[i];
                var removed = splice.removed;
                for (var j = 0, jj = removed.length; j < jj; ++j) {
                    var viewOrPromise = repeat.removeVisual(splice.index + removeDelta + rmPromises.length, true);
                    if (viewOrPromise instanceof Promise) {
                        rmPromises.push(viewOrPromise);
                    }
                }
                removeDelta -= splice.addedCount;
            }
            if (rmPromises.length > 0) {
                return Promise.all(rmPromises).then(function () {
                    var spliceIndexLow = _this.handleAddedSplices(repeat, array, splices);
                    override_contexts_1.updateOverrideContexts(repeat.visuals(), spliceIndexLow);
                });
            }
            var spliceIndexLow = this.handleAddedSplices(repeat, array, splices);
            override_contexts_1.updateOverrideContexts(repeat.visuals(), spliceIndexLow);
            return undefined;
        };
        ArrayRepeatStrategy.prototype.handleAddedSplices = function (repeat, array, splices) {
            var arrayLength = array.length;
            var spliceIndex;
            var spliceIndexLow;
            for (var i = 0, ii = splices.length; i < ii; ++i) {
                var splice = splices[i];
                var end = splice.index + splice.addedCount;
                var addIndex = spliceIndex = splice.index;
                if (typeof spliceIndexLow === 'undefined' || spliceIndexLow === null || spliceIndexLow > splice.index) {
                    spliceIndexLow = spliceIndex;
                }
                for (; addIndex < end; ++addIndex) {
                    var overrideContext = override_contexts_1.createFullOverrideContext(repeat, array[addIndex], addIndex, arrayLength);
                    repeat.insertVisualWithScope(addIndex, binding_context_1.BindingContext.createScopeFromOverride(overrideContext));
                }
            }
            return spliceIndexLow;
        };
        return ArrayRepeatStrategy;
    }());
    exports.ArrayRepeatStrategy = ArrayRepeatStrategy;
});



define('runtime/templating/resources/repeat/repeat-strategy-map',["require", "exports", "./override-contexts", "../../../binding/binding-context"], function (require, exports, override_contexts_1, binding_context_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var MapRepeatStrategy = (function () {
        function MapRepeatStrategy(observerLocator) {
            this.observerLocator = observerLocator;
        }
        MapRepeatStrategy.prototype.handles = function (items) {
            return items instanceof Map;
        };
        MapRepeatStrategy.prototype.getCollectionObserver = function (items) {
            return this.observerLocator.getMapObserver(items);
        };
        MapRepeatStrategy.prototype.instanceChanged = function (repeat, items) {
            var _this = this;
            var removePromise = repeat.removeAllVisuals(true, !repeat.visualsRequireLifecycle);
            if (removePromise instanceof Promise) {
                removePromise.then(function () { return _this.standardProcessItems(repeat, items); });
                return;
            }
            this.standardProcessItems(repeat, items);
        };
        MapRepeatStrategy.prototype.standardProcessItems = function (repeat, items) {
            var index = 0;
            items.forEach(function (value, key) {
                var overrideContext = override_contexts_1.createFullOverrideContext(repeat, value, index, items.size, key);
                repeat.addVisualWithScope(binding_context_1.BindingContext.createScopeFromOverride(overrideContext));
                ++index;
            });
        };
        MapRepeatStrategy.prototype.instanceMutated = function (repeat, map, records) {
            var rmPromises = [];
            var overrideContext;
            var removeIndex;
            var viewOrPromise;
            for (var i = 0, ii = records.length; i < ii; ++i) {
                var record = records[i];
                var key = record.key;
                switch (record.type) {
                    case 'update':
                        removeIndex = this.getViewIndexByKey(repeat, key);
                        viewOrPromise = repeat.removeVisual(removeIndex, true, !repeat.visualsRequireLifecycle);
                        if (viewOrPromise instanceof Promise) {
                            rmPromises.push(viewOrPromise);
                        }
                        overrideContext = override_contexts_1.createFullOverrideContext(repeat, map.get(key), removeIndex, map.size, key);
                        repeat.insertVisualWithScope(removeIndex, binding_context_1.BindingContext.createScopeFromOverride(overrideContext));
                        break;
                    case 'add':
                        var addIndex = repeat.visualCount() <= map.size - 1 ? repeat.visualCount() : map.size - 1;
                        overrideContext = override_contexts_1.createFullOverrideContext(repeat, map.get(key), addIndex, map.size, key);
                        repeat.insertVisualWithScope(map.size - 1, binding_context_1.BindingContext.createScopeFromOverride(overrideContext));
                        break;
                    case 'delete':
                        if (record.oldValue === undefined) {
                            return;
                        }
                        removeIndex = this.getViewIndexByKey(repeat, key);
                        viewOrPromise = repeat.removeVisual(removeIndex, true, !repeat.visualsRequireLifecycle);
                        if (viewOrPromise instanceof Promise) {
                            rmPromises.push(viewOrPromise);
                        }
                        break;
                    case 'clear':
                        repeat.removeAllVisuals(true, !repeat.visualsRequireLifecycle);
                        break;
                    default:
                        continue;
                }
            }
            if (rmPromises.length > 0) {
                Promise.all(rmPromises).then(function () { return override_contexts_1.updateOverrideContexts(repeat.visuals(), 0); });
            }
            else {
                override_contexts_1.updateOverrideContexts(repeat.visuals(), 0);
            }
        };
        MapRepeatStrategy.prototype.getViewIndexByKey = function (repeat, key) {
            for (var i = 0, ii = repeat.visualCount(); i < ii; ++i) {
                var child = repeat.visualAt(i);
                if (child.$scope.bindingContext[repeat.key] === key) {
                    return i;
                }
            }
            return undefined;
        };
        return MapRepeatStrategy;
    }());
    exports.MapRepeatStrategy = MapRepeatStrategy;
});



define('runtime/templating/resources/repeat/repeat-strategy-null',["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var NullRepeatStrategy = (function () {
        function NullRepeatStrategy() {
        }
        NullRepeatStrategy.prototype.handles = function (items) {
            return items === null || items === undefined;
        };
        NullRepeatStrategy.prototype.instanceMutated = function (repeat, items, changes) { };
        NullRepeatStrategy.prototype.instanceChanged = function (repeat, items) {
            repeat.removeAllVisuals(true);
        };
        NullRepeatStrategy.prototype.getCollectionObserver = function (items) { return null; };
        return NullRepeatStrategy;
    }());
    exports.NullRepeatStrategy = NullRepeatStrategy;
});



define('runtime/templating/resources/repeat/repeat-strategy-number',["require", "exports", "./override-contexts", "../../../binding/binding-context"], function (require, exports, override_contexts_1, binding_context_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var NumberRepeatStrategy = (function () {
        function NumberRepeatStrategy() {
        }
        NumberRepeatStrategy.prototype.handles = function (items) {
            return typeof items === 'number';
        };
        NumberRepeatStrategy.prototype.instanceChanged = function (repeat, value) {
            var _this = this;
            var removePromise = repeat.removeAllVisuals(true, !repeat.visualsRequireLifecycle);
            if (removePromise instanceof Promise) {
                removePromise.then(function () { return _this.standardProcessItems(repeat, value); });
                return;
            }
            this.standardProcessItems(repeat, value);
        };
        NumberRepeatStrategy.prototype.instanceMutated = function (repeat, items, changes) { };
        NumberRepeatStrategy.prototype.getCollectionObserver = function () { return null; };
        NumberRepeatStrategy.prototype.standardProcessItems = function (repeat, value) {
            value = Math.floor(value);
            var childrenLength = repeat.visualCount();
            var viewsToRemove = childrenLength - value;
            if (viewsToRemove > 0) {
                if (viewsToRemove > childrenLength) {
                    viewsToRemove = childrenLength;
                }
                for (var i = 0, ii = viewsToRemove; i < ii; ++i) {
                    repeat.removeVisual(childrenLength - (i + 1), true, !repeat.visualsRequireLifecycle);
                }
                return;
            }
            for (var i = childrenLength, ii = value; i < ii; ++i) {
                var overrideContext = override_contexts_1.createFullOverrideContext(repeat, i, i, ii);
                repeat.addVisualWithScope(binding_context_1.BindingContext.createScopeFromOverride(overrideContext));
            }
            override_contexts_1.updateOverrideContexts(repeat.visuals(), 0);
        };
        return NumberRepeatStrategy;
    }());
    exports.NumberRepeatStrategy = NumberRepeatStrategy;
});



var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
define('runtime/templating/resources/repeat/repeat-strategy-registry',["require", "exports", "../../../../kernel/di", "./repeat-strategy-null", "./repeat-strategy-array", "./repeat-strategy-map", "./repeat-strategy-set", "./repeat-strategy-number", "../../../binding/observer-locator"], function (require, exports, di_1, repeat_strategy_null_1, repeat_strategy_array_1, repeat_strategy_map_1, repeat_strategy_set_1, repeat_strategy_number_1, observer_locator_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.IRepeatStrategyRegistry = di_1.DI.createInterface()
        .withDefault(function (x) { return x.singleton(RepeatStrategyRegistry); });
    var RepeatStrategyRegistry = (function () {
        function RepeatStrategyRegistry(observerLocator) {
            this.strategies = [];
            this.register(new repeat_strategy_null_1.NullRepeatStrategy());
            this.register(new repeat_strategy_array_1.ArrayRepeatStrategy(observerLocator));
            this.register(new repeat_strategy_map_1.MapRepeatStrategy(observerLocator));
            this.register(new repeat_strategy_set_1.SetRepeatStrategy(observerLocator));
            this.register(new repeat_strategy_number_1.NumberRepeatStrategy());
        }
        RepeatStrategyRegistry.prototype.register = function (strategy) {
            this.strategies.push(strategy);
        };
        RepeatStrategyRegistry.prototype.getStrategyForItems = function (items) {
            var strategies = this.strategies;
            for (var i = 0, ii = strategies.length; i < ii; ++i) {
                var current = strategies[i];
                if (current.handles(items)) {
                    return current;
                }
            }
            return null;
        };
        RepeatStrategyRegistry = __decorate([
            di_1.inject(observer_locator_1.IObserverLocator),
            __metadata("design:paramtypes", [Object])
        ], RepeatStrategyRegistry);
        return RepeatStrategyRegistry;
    }());
});



define('runtime/templating/resources/repeat/repeat-strategy-set',["require", "exports", "./override-contexts", "../../../binding/binding-context"], function (require, exports, override_contexts_1, binding_context_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var SetRepeatStrategy = (function () {
        function SetRepeatStrategy(observerLocator) {
            this.observerLocator = observerLocator;
        }
        SetRepeatStrategy.prototype.handles = function (items) {
            return items instanceof Set;
        };
        SetRepeatStrategy.prototype.getCollectionObserver = function (items) {
            return this.observerLocator.getSetObserver(items);
        };
        SetRepeatStrategy.prototype.instanceChanged = function (repeat, items) {
            var _this = this;
            var removePromise = repeat.removeAllVisuals(true, !repeat.visualsRequireLifecycle);
            if (removePromise instanceof Promise) {
                removePromise.then(function () { return _this.standardProcessItems(repeat, items); });
                return;
            }
            this.standardProcessItems(repeat, items);
        };
        SetRepeatStrategy.prototype.standardProcessItems = function (repeat, items) {
            var index = 0;
            items.forEach(function (value) {
                var overrideContext = override_contexts_1.createFullOverrideContext(repeat, value, index, items.size);
                repeat.addVisualWithScope(binding_context_1.BindingContext.createScopeFromOverride(overrideContext));
                ++index;
            });
        };
        SetRepeatStrategy.prototype.instanceMutated = function (repeat, set, records) {
            var rmPromises = [];
            for (var i = 0, ii = records.length; i < ii; ++i) {
                var record = records[i];
                var value = record.value;
                switch (record.type) {
                    case 'add':
                        var size = Math.max(set.size - 1, 0);
                        var overrideContext = override_contexts_1.createFullOverrideContext(repeat, value, size, set.size);
                        repeat.insertVisualWithScope(size, binding_context_1.BindingContext.createScopeFromOverride(overrideContext));
                        break;
                    case 'delete':
                        var removeIndex = this.getViewIndexByValue(repeat, value);
                        var viewOrPromise = repeat.removeVisual(removeIndex, true, !repeat.visualsRequireLifecycle);
                        if (viewOrPromise instanceof Promise) {
                            rmPromises.push(viewOrPromise);
                        }
                        break;
                    case 'clear':
                        repeat.removeAllVisuals(true, !repeat.visualsRequireLifecycle);
                        break;
                    default:
                        continue;
                }
            }
            if (rmPromises.length > 0) {
                Promise.all(rmPromises).then(function () { return override_contexts_1.updateOverrideContexts(repeat.visuals(), 0); });
            }
            else {
                override_contexts_1.updateOverrideContexts(repeat.visuals(), 0);
            }
        };
        SetRepeatStrategy.prototype.getViewIndexByValue = function (repeat, value) {
            for (var i = 0, ii = repeat.visualCount(); i < ii; ++i) {
                var child = repeat.visualAt(i);
                if (child.$scope.bindingContext[repeat.local] === value) {
                    return i;
                }
            }
            return undefined;
        };
        return SetRepeatStrategy;
    }());
    exports.SetRepeatStrategy = SetRepeatStrategy;
});



define('runtime/templating/resources/repeat/repeat-strategy',["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
});



var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
define('runtime/templating/resources/repeat/repeat',["require", "exports", "../../custom-attribute", "../../visual", "../../render-slot", "../../../../kernel/di", "./repeat-strategy-registry", "../../../binding/ast", "../../../binding/binding-context", "../../../binding/binding-mode", "../../view", "../../../task-queue", "../../../binding/binding-flags", "../../../../kernel/reporter", "../../bindable"], function (require, exports, custom_attribute_1, visual_1, render_slot_1, di_1, repeat_strategy_registry_1, ast_1, binding_context_1, binding_mode_1, view_1, task_queue_1, binding_flags_1, reporter_1, bindable_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var oneTime = binding_mode_1.BindingMode.oneTime;
    function updateOneTimeBinding(binding) {
        if (isCallableOneTimeBinding(binding)) {
            binding.call(binding_context_1.sourceContext);
        }
        else if (binding.updateOneTimeBindings) {
            binding.updateOneTimeBindings();
        }
    }
    function isOneTime(expression) {
        while (expression instanceof ast_1.BindingBehavior) {
            if (expression.name === 'oneTime') {
                return true;
            }
            expression = expression.expression;
        }
        return false;
    }
    function isCallableOneTimeBinding(binding) {
        return binding.call && binding.mode === oneTime;
    }
    function unwrapExpression(expression) {
        var unwrapped = false;
        while (expression instanceof ast_1.BindingBehavior) {
            expression = expression.expression;
        }
        while (expression instanceof ast_1.ValueConverter) {
            expression = expression.expression;
            unwrapped = true;
        }
        return unwrapped ? expression : null;
    }
    function getBinding(owner, behavior, propertyName) {
        return owner.$bindable
            .find(function (x) { return x.target === behavior && x.targetProperty === propertyName; });
    }
    var Repeat = (function () {
        function Repeat(owner, viewFactory, viewSlot, container, taskQueue, strategyRegistry) {
            this.owner = owner;
            this.viewFactory = viewFactory;
            this.viewSlot = viewSlot;
            this.container = container;
            this.taskQueue = taskQueue;
            this.strategyRegistry = strategyRegistry;
            this.ignoreMutation = false;
            this.local = 'item';
            this.key = 'key';
            this.value = 'value';
            this.visualsRequireLifecycle = true;
        }
        Repeat.prototype.call = function (context, changes) {
            this[context](this.items, changes);
        };
        Repeat.prototype.bound = function (scope) {
            this.sourceExpression = getBinding(this.owner, this, 'items').sourceExpression;
            this.isOneTime = isOneTime(this.sourceExpression);
            this.scope = scope;
            this.itemsChanged();
        };
        Repeat.prototype.unbound = function () {
            this.scope = null;
            this.items = null;
            this.viewSlot.removeAll(true, true);
            this.unsubscribeCollection();
        };
        Repeat.prototype.unsubscribeCollection = function () {
            if (this.collectionObserver) {
                this.collectionObserver.unsubscribe(this.callContext, this);
                this.collectionObserver = null;
                this.callContext = null;
            }
        };
        Repeat.prototype.itemsChanged = function () {
            var _this = this;
            this.unsubscribeCollection();
            if (!this.scope) {
                return;
            }
            var items = this.items;
            this.strategy = this.strategyRegistry.getStrategyForItems(items);
            if (!this.strategy) {
                throw reporter_1.Reporter.error(19, this.sourceExpression);
            }
            if (!this.isOneTime && !this.observeInnerCollection()) {
                this.observeCollection();
            }
            this.ignoreMutation = true;
            this.strategy.instanceChanged(this, items);
            this.taskQueue.queueMicroTask(function () { return _this.ignoreMutation = false; });
        };
        Repeat.prototype.getInnerCollection = function () {
            var expression = unwrapExpression(this.sourceExpression);
            if (!expression) {
                return null;
            }
            return expression.evaluate(this.scope, this.container, binding_flags_1.BindingFlags.none);
        };
        Repeat.prototype.handleCollectionMutated = function (collection, changes) {
            if (!this.collectionObserver || this.ignoreMutation) {
                return;
            }
            this.strategy.instanceMutated(this, collection, changes);
        };
        Repeat.prototype.handleInnerCollectionMutated = function (collection, changes) {
            var _this = this;
            if (!this.collectionObserver) {
                return;
            }
            if (this.ignoreMutation) {
                return;
            }
            this.ignoreMutation = true;
            var newItems = this.sourceExpression.evaluate(this.scope, this.container, binding_flags_1.BindingFlags.none);
            this.taskQueue.queueMicroTask(function () { return _this.ignoreMutation = false; });
            if (newItems === this.items) {
                this.itemsChanged();
            }
            else {
                this.items = newItems;
            }
        };
        Repeat.prototype.observeInnerCollection = function () {
            var items = this.getInnerCollection();
            var strategy = this.strategyRegistry.getStrategyForItems(items);
            if (!strategy) {
                return false;
            }
            this.collectionObserver = strategy.getCollectionObserver(items);
            if (!this.collectionObserver) {
                return false;
            }
            this.callContext = 'handleInnerCollectionMutated';
            this.collectionObserver.subscribe(this.callContext, this);
            return true;
        };
        Repeat.prototype.observeCollection = function () {
            var items = this.items;
            this.collectionObserver = this.strategy.getCollectionObserver(items);
            if (this.collectionObserver) {
                this.callContext = 'handleCollectionMutated';
                this.collectionObserver.subscribe(this.callContext, this);
            }
        };
        Repeat.prototype.visualCount = function () {
            return this.viewSlot.children.length;
        };
        Repeat.prototype.visuals = function () {
            return this.viewSlot.children;
        };
        Repeat.prototype.visualAt = function (index) {
            return this.viewSlot.children[index];
        };
        Repeat.prototype.addVisualWithScope = function (scope) {
            var visual = this.viewFactory.create();
            visual.$bind(scope);
            this.viewSlot.add(visual);
        };
        Repeat.prototype.insertVisualWithScope = function (index, scope) {
            var visual = this.viewFactory.create();
            visual.$bind(scope);
            this.viewSlot.insert(index, visual);
        };
        Repeat.prototype.moveVisual = function (sourceIndex, targetIndex) {
            this.viewSlot.move(sourceIndex, targetIndex);
        };
        Repeat.prototype.removeAllVisuals = function (returnToCache, skipAnimation) {
            return this.viewSlot.removeAll(returnToCache, skipAnimation);
        };
        Repeat.prototype.removeVisuals = function (viewsToRemove, returnToCache, skipAnimation) {
            return this.viewSlot.removeMany(viewsToRemove, returnToCache, skipAnimation);
        };
        Repeat.prototype.removeVisual = function (index, returnToCache, skipAnimation) {
            return this.viewSlot.removeAt(index, returnToCache, skipAnimation);
        };
        Repeat.prototype.updateBindings = function (visual) {
            var bindables = visual.$bindable;
            var j = visual.$bindable.length;
            while (j--) {
                updateOneTimeBinding(bindables[j]);
            }
        };
        __decorate([
            bindable_1.bindable,
            __metadata("design:type", Object)
        ], Repeat.prototype, "items", void 0);
        __decorate([
            bindable_1.bindable,
            __metadata("design:type", String)
        ], Repeat.prototype, "local", void 0);
        __decorate([
            bindable_1.bindable,
            __metadata("design:type", Object)
        ], Repeat.prototype, "key", void 0);
        __decorate([
            bindable_1.bindable,
            __metadata("design:type", Object)
        ], Repeat.prototype, "value", void 0);
        __decorate([
            bindable_1.bindable,
            __metadata("design:type", Function)
        ], Repeat.prototype, "matcher", void 0);
        Repeat = __decorate([
            custom_attribute_1.templateController('repeat'),
            di_1.inject(view_1.IViewOwner, visual_1.IVisualFactory, render_slot_1.IRenderSlot, di_1.IContainer, task_queue_1.ITaskQueue, repeat_strategy_registry_1.IRepeatStrategyRegistry),
            __metadata("design:paramtypes", [Object, Object, Object, Object, Object, Object])
        ], Repeat);
        return Repeat;
    }());
    exports.Repeat = Repeat;
});



define('runtime/templating/resources/repeat/repeater',["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
});



// Note: This is a temporary hand-authored JS build of the view plugin, used for this repo's demo.
// This will go away and be part of the requirejs plugin module, once we've moved to a monorepo.
// This temp version is required for our CLI until the plugin moves into a package.
define("view", [], function() {
  var buildMap = {};
  var view = {
    escape: function escape(content) {
      return content
        .replace(/(['\\])/g, "\\$1")
        .replace(/[\f]/g, "\\f")
        .replace(/[\b]/g, "\\b")
        .replace(/[\n]/g, "\\n")
        .replace(/[\t]/g, "\\t")
        .replace(/[\r]/g, "\\r")
        .replace(/[\u2028]/g, "\\u2028")
        .replace(/[\u2029]/g, "\\u2029");
    },

    get: function get(url, callback, errback) {
      var fs = require.nodeRequire("fs");

      try {
        var file = fs.readFileSync(url, "utf8");

        //Remove BOM (Byte Mark Order) from utf8 files if it is there.
        if (file[0] === "\uFEFF") {
          file = file.substring(1);
        }

        callback(file);
      } catch (e) {
        if (errback) {
          errback(e);
        }
      }
    },

    finishLoad: function finishLoad(name, content, onLoad) {
      buildMap[name] = content;
      onLoad(content);
    },

    load: function load(name, req, onLoad, config) {
      if (config.isBuild) {
        var url = req.toUrl(name);
        view.get(
          url,
          function(content) {
            view.finishLoad(name, content, onLoad);
          },
          function(err) {
            if (onLoad.error) {
              onLoad.error(err);
            }
          }
        );
      } else {
        req(["text!" + name], function(text) {
          var description = createTemplateDescription(text);
          var depsToLoad = description.imports.map(function(x) {
            if (x.extension === ".html" && !x.plugin) {
              return "component!" + relativeToFile(x.path, name) + x.extension;
            }

            return relativeToFile(x.path, name);
          });

          req(depsToLoad, function() {
            var templateSource = {
              template: description.template,
              build: {
                required: true,
                compiler: "default"
              },
              dependencies: Array.prototype.slice.call(arguments)
            };

            onload({ default: templateSource });
          });
        });
      }
    },

    write: function write(pluginName, moduleName, _write, config) {
      if (buildMap.hasOwnProperty(moduleName)) {
        var text = buildMap[moduleName];
        var description = createTemplateDescription(text);
        var depsToLoad = processImports(description.imports, moduleName);
        var templateImport = parseImport(moduleName);

        _write(
          'define("' +
            pluginName +
            "!" +
            moduleName +
            '", [' +
            depsToLoad
              .map(function(x) {
                return '"' + x + '"';
              })
              .join(",") +
            "], function() { \n          var templateSource = {\n            name: '" +
            kebabCase(templateImport.basename) +
            "',\n            template: '" +
            view.escape(description.template) +
            "',\n            build: {\n              required: true,\n              compiler: 'default'\n            },\n            dependencies: Array.prototype.slice.call(arguments)\n          };\n\n          return { default: templateSource };\n        });\n"
        );
      }
    }
  };

  function createTemplateDescription(template) {
    var imports = [];
    var cleanedTemplate = template.replace(
      /^@import\s+\'([a-zA-z\/.\-_!%&\?=0-9]*)\'\s*;/gm,
      function(match, url) {
        imports.push(parseImport(url));
        return "";
      }
    );

    return {
      template: cleanedTemplate.trim(),
      imports: imports
    };
  }

  function parseImport(value) {
    var result = {
      path: value
    };

    var pluginIndex = result.path.lastIndexOf("!");
    if (pluginIndex !== -1) {
      result.plugin = result.path.slice(pluginIndex + 1);
      result.path = result.path.slice(0, pluginIndex);
    } else {
      result.plugin = null;
    }

    var extensionIndex = result.path.lastIndexOf(".");
    if (extensionIndex !== -1) {
      result.extension = result.path.slice(extensionIndex).toLowerCase();
      result.path = result.path.slice(0, extensionIndex);
    } else {
      result.extension = null;
    }

    var slashIndex = result.path.lastIndexOf("/");
    if (slashIndex !== -1) {
      result.basename = result.path.slice(slashIndex + 1);
    } else {
      result.basename = result.path;
    }

    return result;
  }

  function processImports(toProcess, relativeTo) {
    return toProcess.map(function(x) {
      if (x.extension === ".html" && !x.plugin) {
        return "component!" + relativeToFile(x.path, relativeTo) + x.extension;
      }

      var relativePath = relativeToFile(x.path, relativeTo);
      return x.plugin ? x.plugin + "!" + relativePath : relativePath;
    });
  }

  var capitalMatcher = /([A-Z])/g;

  function addHyphenAndLower(char) {
    return "-" + char.toLowerCase();
  }

  function kebabCase(name) {
    return (name.charAt(0).toLowerCase() + name.slice(1)).replace(
      capitalMatcher,
      addHyphenAndLower
    );
  }

  function relativeToFile(name, file) {
    var fileParts = file && file.split("/");
    var nameParts = name.trim().split("/");

    if (nameParts[0].charAt(0) === "." && fileParts) {
      //Convert file to array, and lop off the last part,
      //so that . matches that 'directory' and not name of the file's
      //module. For instance, file of 'one/two/three', maps to
      //'one/two/three.js', but we want the directory, 'one/two' for
      //this normalization.
      var normalizedBaseParts = fileParts.slice(0, fileParts.length - 1);
      nameParts.unshift.apply(
        nameParts,
        _toConsumableArray(normalizedBaseParts)
      );
    }

    trimDots(nameParts);

    return nameParts.join("/");
  }

  function trimDots(ary) {
    for (var i = 0; i < ary.length; ++i) {
      var part = ary[i];
      if (part === ".") {
        ary.splice(i, 1);
        i -= 1;
      } else if (part === "..") {
        // If at the start, or previous value is still ..,
        // keep them so that when converted to a path it may
        // still work when converted to a path, even though
        // as an ID it is less than ideal. In larger point
        // releases, may be better to just kick out an error.
        if (i === 0 || (i === 1 && ary[2] === "..") || ary[i - 1] === "..") {
          continue;
        } else if (i > 0) {
          ary.splice(i - 1, 2);
          i -= 2;
        }
      }
    }
  }

  function _toConsumableArray(arr) {
    if (Array.isArray(arr)) {
      for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) {
        arr2[i] = arr[i];
      }
      return arr2;
    } else {
      return Array.from(arr);
    }
  }

  return view;
});

define("view!test-jit/app.html", ["test-jit/name-tag"], function() { 
          var templateSource = {
            name: 'app',
            template: '<template>\n  ${message}<br/>\n  ${computedMessage}<br/>\n  <input type="text" value.bind="message">\n  <name-tag name.bind="message" ref="nameTag">\n    <h2>${message}</h2>\n  </name-tag>\n  <input type="checkbox" checked.bind="duplicateMessage" />\n  <div if.bind="duplicateMessage">\n    ${message}\n  </div>\n  <div else>No Message Duplicated</div>\n  <div repeat.for="todo of todos">\n    ${description}\n  </div>\n  <button click.trigger="addTodo()">Add Todo</button>\n</template>',
            build: {
              required: true,
              compiler: 'default'
            },
            dependencies: Array.prototype.slice.call(arguments)
          };

          return { default: templateSource };
        });

define('text!test-jit/hello.html', ['module'], function(module) { module.exports = "<template>\n  Hello from HTML-only component!\n</template>\n"; });
define("view!test-jit/name-tag.html", ["component!test-jit/hello.html"], function() { 
          var templateSource = {
            name: 'name-tag',
            template: '<template css="border: ${nameTagBorder}" class.bind="nameTagClasses">\n  <hello></hello>\n  <header>Super Duper name tag</header>\n  <div>\n    <input type="text" value.bind="name"><br/>\n    <span css="font-weight: bold; padding: 10px 0; color: ${nameTagColor}" textcontent.bind="name"></span>\n  </div>\n  <hr/>\n  <div>\n    <label>\n      Name tag color:\n      <select value.bind="nameTagColor">\n        <option>red</option>\n        <option>green</option>\n        <option>blue</option>\n      </select>\n    </label>\n  </div>\n  <hr/>\n  <div>\n    <label>\n      Name tag border color:\n      <select value.bind="nameTagBorderColor">\n        <option>orange</option>\n        <option>black</option>\n        <option>rgba(0,0,0,0.5)</option>\n      </select>\n    </label>\n    <slot></slot>\n  </div>\n  <hr/>\n  <div>\n    <label>\n      Name tag border width:\n      <input type="number" min="1" step="1" max="10" value.bind="nameTagBorderWidth" />\n    </label>\n  </div>\n  <div>\n    <label>\n      Show header:\n      <input type="checkbox" checked.bind="nameTagHeaderVisible" />\n    </label>\n  </div>\n  <button click.trigger="submit()">Reset</button>\n</template>',
            build: {
              required: true,
              compiler: 'default'
            },
            dependencies: Array.prototype.slice.call(arguments)
          };

          return { default: templateSource };
        });

define('text',{});
//# sourceMappingURL=app-bundle.js.map