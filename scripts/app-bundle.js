define('app-config',["require", "exports", "./name-tag"], function (require, exports, import1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.appConfig = {
        name: 'app',
        dependencies: [
            import1
        ],
        template: "\n    <au-marker class=\"au\"></au-marker> <br>\n    <input type=\"text\" class=\"au\">\n    <name-tag class=\"au\">\n      <au-content>\n        <h2>Message: <au-marker class=\"au\"></au-marker> </h2>\n      </au-content>\n    </name-tag>\n    <input type=\"checkbox\" class=\"au\" />\n    <au-marker class=\"au\"></au-marker>\n    <au-marker class=\"au\"></au-marker>\n  ",
        targetInstructions: [
            [
                {
                    type: 'oneWayText',
                    source: 'message'
                }
            ],
            [
                {
                    type: 'twoWay',
                    source: 'message',
                    target: 'value'
                }
            ],
            [
                {
                    type: 'element',
                    resource: 'name-tag',
                    instructions: [
                        {
                            type: 'twoWay',
                            source: 'message',
                            target: 'name'
                        },
                        {
                            type: 'ref',
                            source: 'nameTag'
                        }
                    ]
                }
            ],
            [
                {
                    type: 'oneWayText',
                    source: 'message'
                }
            ],
            [
                {
                    type: 'twoWay',
                    source: 'duplicateMessage',
                    target: 'checked'
                }
            ],
            [
                {
                    type: 'templateController',
                    resource: 'if',
                    config: {
                        template: "<div><au-marker class=\"au\"></au-marker> </div>",
                        targetInstructions: [
                            [
                                {
                                    type: 'oneWayText',
                                    source: 'message'
                                }
                            ]
                        ]
                    },
                    instructions: [
                        {
                            type: 'oneWay',
                            source: 'duplicateMessage',
                            target: 'condition'
                        }
                    ]
                }
            ],
            [
                {
                    type: 'templateController',
                    resource: 'else',
                    link: true,
                    config: {
                        template: "<div>No Message Duplicated</div>",
                        targetInstructions: []
                    },
                    instructions: []
                }
            ]
        ],
        surrogateInstructions: []
    };
});



var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
define('app',["require", "exports", "./app-config", "./runtime/decorators"], function (require, exports, app_config_1, decorators_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var App = (function () {
        function App() {
            this.message = 'Hello World';
            this.duplicateMessage = true;
        }
        App = __decorate([
            decorators_1.compiledElement(app_config_1.appConfig)
        ], App);
        return App;
    }());
    exports.App = App;
});



define('environment',["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = {
        debug: true,
        testing: true
    };
});



define('generated-configuration',["require", "exports", "./runtime/binding/ast", "./runtime/configuration/standard", "./runtime/binding/expression"], function (require, exports, ast_1, standard_1, expression_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var emptyArray = [];
    var expressionCache = {
        message: new ast_1.AccessScope('message'),
        textContent: new ast_1.AccessScope('textContent'),
        value: new ast_1.AccessScope('value'),
        nameTagBorderWidth: new ast_1.AccessScope('borderWidth'),
        nameTagBorderColor: new ast_1.AccessScope('borderColor'),
        nameTagBorder: new ast_1.TemplateLiteral([
            new ast_1.AccessScope('borderWidth'),
            new ast_1.LiteralString('px solid '),
            new ast_1.AccessScope('borderColor')
        ]),
        nameTagHeaderVisible: new ast_1.AccessScope('showHeader'),
        nameTagClasses: new ast_1.TemplateLiteral([
            new ast_1.LiteralString('au name-tag '),
            new ast_1.Conditional(new ast_1.AccessScope('showHeader'), new ast_1.LiteralString('header-visible'), new ast_1.LiteralString(''))
        ]),
        name: new ast_1.AccessScope('name'),
        submit: new ast_1.CallScope('submit', emptyArray, 0),
        nameTagColor: new ast_1.AccessScope('color'),
        duplicateMessage: new ast_1.AccessScope('duplicateMessage'),
        checked: new ast_1.AccessScope('checked'),
        nameTag: new ast_1.AccessScope('nameTag')
    };
    exports.GeneratedConfiguration = {
        register: function (container) {
            expression_1.Expression.primeCache(expressionCache);
            container.register(standard_1.StandardConfiguration);
        }
    };
    ;
});



define('main',["require", "exports", "./runtime/aurelia", "./app", "./generated-configuration", "./debug/configuration"], function (require, exports, aurelia_1, app_1, generated_configuration_1, configuration_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    aurelia_1.Aurelia
        .register(generated_configuration_1.GeneratedConfiguration, configuration_1.DebugConfiguration)
        .app({ host: document.body, component: new app_1.App() })
        .start();
});



define('name-tag-config',["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.nameTagConfig = {
        name: 'name-tag',
        hasSlots: true,
        template: "\n    <header>Super Duper name tag</header>\n    <div>\n      <input type=\"text\" class=\"au\"><br/>\n      <span class=\"au\" style=\"font-weight: bold; padding: 10px 0;\"></span>\n    </div>\n    <hr/>\n    <div>\n      <label>\n        Name tag color:\n        <select class=\"au\">\n          <option>red</option>\n          <option>green</option>\n          <option>blue</option>\n        </select>\n      </label>\n    </div>\n    <hr/>\n    <div>\n      <label>\n        Name tag border color:\n        <select class=\"au\">\n          <option>orange</option>\n          <option>black</option>\n          <option>rgba(0,0,0,0.5)</option>\n        </select>\n      </label>\n      <slot class=\"au\"></slot>\n    </div>\n    <hr/>\n    <div>\n      <label>\n        Name tag border width:\n        <input type=\"number\" class=\"au\" min=\"1\" step=\"1\" max=\"10\" />\n      </label>\n    </div>\n    <div>\n      <label>\n        Show header:\n        <input type=\"checkbox\" class=\"au\" />\n      </label>\n    </div>\n    <button class=\"au\">Reset</button>\n  ",
        targetInstructions: [
            [
                {
                    type: 'twoWay',
                    source: 'name',
                    target: 'value'
                }
            ],
            [
                {
                    type: 'oneWay',
                    source: 'name',
                    target: 'textContent'
                },
                {
                    type: 'style',
                    source: 'nameTagColor',
                    target: 'color'
                }
            ],
            [
                {
                    type: 'twoWay',
                    source: 'nameTagColor',
                    target: 'value'
                }
            ],
            [
                {
                    type: 'twoWay',
                    source: 'nameTagBorderColor',
                    target: 'value'
                }
            ],
            [
                {
                    type: 'slot',
                    name: '__au-default-slot-key__'
                }
            ],
            [
                {
                    type: 'twoWay',
                    source: 'nameTagBorderWidth',
                    target: 'value'
                }
            ],
            [
                {
                    type: 'twoWay',
                    source: 'nameTagHeaderVisible',
                    target: 'checked'
                }
            ],
            [
                {
                    type: 'listener',
                    source: 'click',
                    target: 'submit',
                    preventDefault: true,
                    strategy: 0
                }
            ]
        ],
        surrogateInstructions: [
            {
                type: 'style',
                source: 'nameTagBorder',
                target: 'border'
            },
            {
                type: 'oneWay',
                source: 'nameTagClasses',
                target: 'className'
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
define('name-tag',["require", "exports", "./runtime/decorators", "./name-tag-config"], function (require, exports, decorators_1, name_tag_config_1) {
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
        NameTag = __decorate([
            decorators_1.compiledElement(name_tag_config_1.nameTagConfig)
        ], NameTag);
        return NameTag;
    }());
    exports.NameTag = NameTag;
});



define('debug/configuration',["require", "exports", "./reporter", "./task-queue", "./binding/unparser"], function (require, exports, reporter_1, task_queue_1, unparser_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.DebugConfiguration = {
        register: function (container) {
            reporter_1.Reporter.write(2);
            task_queue_1.TaskQueue.longStacks = true;
            unparser_1.enableImprovedExpressionDebugging();
        }
    };
});



define('debug/reporter',["require", "exports", "../runtime/reporter"], function (require, exports, reporter_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var MessageType;
    (function (MessageType) {
        MessageType[MessageType["error"] = 0] = "error";
        MessageType[MessageType["warn"] = 1] = "warn";
        MessageType[MessageType["info"] = 2] = "info";
        MessageType[MessageType["debug"] = 3] = "debug";
    })(MessageType || (MessageType = {}));
    exports.Reporter = Object.assign(reporter_1.Reporter, {
        write: function (code) {
            var params = [];
            for (var _i = 1; _i < arguments.length; _i++) {
                params[_i - 1] = arguments[_i];
            }
            var info = getMessageInfoForCode(code);
            switch (info.type) {
                case MessageType.debug:
                    console.debug.apply(console, [info.message].concat(params));
                    break;
                case MessageType.info:
                    console.info.apply(console, [info.message].concat(params));
                    break;
                case MessageType.warn:
                    console.warn.apply(console, [info.message].concat(params));
                    break;
                case MessageType.error:
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
            type: MessageType.error,
            message: "Attempted to report with unknown code " + code + "."
        };
    }
    ;
    var codeLookup = {
        0: {
            type: MessageType.warn,
            message: 'Cannot add observers to object.'
        },
        1: {
            type: MessageType.warn,
            message: 'Cannot observe property of object.'
        },
        2: {
            type: MessageType.info,
            message: 'Starting application in debug mode.'
        },
        3: {
            type: MessageType.error,
            message: 'Runtime expression compilation is only available when including JIT support.'
        }
    };
});



define('debug/task-queue',["require", "exports", "../runtime/task-queue"], function (require, exports, task_queue_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var stackSeparator = '\nEnqueued in TaskQueue by:\n';
    var microStackSeparator = '\nEnqueued in MicroTaskQueue by:\n';
    var originalOnError = task_queue_1.TaskQueue.onError.bind(task_queue_1.TaskQueue);
    exports.TaskQueue = Object.assign(task_queue_1.TaskQueue, {
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



define('runtime/aurelia',["require", "exports", "./pal", "./di"], function (require, exports, pal_1, di_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var AureliaFramework = (function () {
        function AureliaFramework() {
            this.components = [];
            this.startTasks = [];
            this.stopTasks = [];
            this.isStarted = false;
        }
        AureliaFramework.prototype.register = function () {
            var params = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                params[_i] = arguments[_i];
            }
            di_1.DI.register.apply(di_1.DI, params);
            return this;
        };
        AureliaFramework.prototype.enhance = function (config) {
            return this;
        };
        AureliaFramework.prototype.app = function (config) {
            var _this = this;
            var component = config.component;
            var startTask = function () {
                if (!_this.components.includes(component)) {
                    _this.components.push(component);
                    component.applyTo(config.host);
                }
                component.bind();
                component.attach();
            };
            this.startTasks.push(startTask);
            this.stopTasks.push(function () {
                component.detach();
                component.unbind();
            });
            if (this.isStarted) {
                startTask();
            }
            return this;
        };
        AureliaFramework.prototype.start = function () {
            this.isStarted = true;
            this.startTasks.forEach(function (x) { return x(); });
            return this;
        };
        AureliaFramework.prototype.stop = function () {
            this.isStarted = false;
            this.stopTasks.forEach(function (x) { return x(); });
            return this;
        };
        return AureliaFramework;
    }());
    exports.Aurelia = new AureliaFramework();
    pal_1.PLATFORM.global.Aurelia = exports.Aurelia;
});



define('runtime/decorators',["require", "exports", "./templating/component", "./di", "./binding/binding-mode"], function (require, exports, component_1, di_1, binding_mode_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    function compiledElement(source) {
        return function (target) {
            return component_1.Component.elementFromCompiledSource(source, target);
        };
    }
    exports.compiledElement = compiledElement;
    function customAttribute(name, defaultBindingMode, aliases) {
        if (defaultBindingMode === void 0) { defaultBindingMode = binding_mode_1.BindingMode.oneWay; }
        return function (target) {
            return component_1.Component.attribute({
                name: name,
                defaultBindingMode: defaultBindingMode || binding_mode_1.BindingMode.oneWay,
                aliases: aliases,
                isTemplateController: !!target.isTemplateController
            }, target);
        };
    }
    exports.customAttribute = customAttribute;
    function valueConverter(name) {
        return function (target) {
            return component_1.Component.valueConverter({ name: name }, target);
        };
    }
    exports.valueConverter = valueConverter;
    function bindingBehavior(name) {
        return function (target) {
            return component_1.Component.bindingBehavior({ name: name }, target);
        };
    }
    exports.bindingBehavior = bindingBehavior;
    function templateController(target) {
        var deco = function (target) {
            target.isTemplateController = true;
            return target;
        };
        return target ? deco(target) : deco;
    }
    exports.templateController = templateController;
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
            var observables = target.observables || (target.observables = {});
            var attributes = target.attributes || (target.attributes = {});
            var config = configOrTarget || {};
            if (!config.attribute) {
                config.attribute = hyphenate(key2);
            }
            if (!config.changeHandler) {
                config.changeHandler = key2 + "Changed";
            }
            if (!config.defaultBindingMode) {
                config.defaultBindingMode = binding_mode_1.BindingMode.oneWay;
            }
            config.name = key2;
            observables[key2] = config;
            attributes[config.attribute] = config;
        };
        if (key) {
            var target = configOrTarget;
            configOrTarget = null;
            return deco(target, key, descriptor);
        }
        return deco;
    }
    exports.bindable = bindable;
    function autoinject(potentialTarget) {
        var deco = function (target) {
            var previousInject = target.inject ? target.inject.slice() : null;
            var autoInject = di_1.DI.getDesignParamTypes(target);
            if (!previousInject) {
                target.inject = autoInject;
            }
            else {
                for (var i = 0; i < autoInject.length; i++) {
                    if (previousInject[i] && previousInject[i] !== autoInject[i]) {
                        var prevIndex = previousInject.indexOf(autoInject[i]);
                        if (prevIndex > -1) {
                            previousInject.splice(prevIndex, 1);
                        }
                        previousInject.splice((prevIndex > -1 && prevIndex < i) ? i - 1 : i, 0, autoInject[i]);
                    }
                    else if (!previousInject[i]) {
                        previousInject[i] = autoInject[i];
                    }
                }
                target.inject = previousInject;
            }
        };
        return potentialTarget ? deco(potentialTarget) : deco;
    }
    exports.autoinject = autoinject;
    function inject() {
        var rest = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            rest[_i] = arguments[_i];
        }
        return function (target, key, descriptor) {
            if (typeof descriptor === 'number' && rest.length === 1) {
                var params = target.inject;
                if (!params) {
                    params = di_1.DI.getDesignParamTypes(target).slice();
                    target.inject = params;
                }
                params[descriptor] = rest[0];
                return;
            }
            if (descriptor) {
                var fn = descriptor.value;
                fn.inject = rest;
            }
            else {
                target.inject = rest;
            }
        };
    }
    exports.inject = inject;
});



define('runtime/di',["require", "exports", "./pal"], function (require, exports, pal_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    function createInterface(key) {
        return function Key(target, property, index) {
            var inject = target.inject || (target.inject = []);
            Key.key = key;
            inject[index] = Key;
            return target;
        };
    }
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
    function getDesignParamTypes(target) {
        return Reflect.getOwnMetadata('design:paramtypes', target) || pal_1.PLATFORM.emptyArray;
    }
    ;
    exports.IContainer = createInterface('IContainer');
    var Resolver = (function () {
        function Resolver(key, strategy, state) {
            this.key = key;
            this.strategy = strategy;
            this.state = state;
        }
        Resolver.prototype.register = function (container, key) {
            return container.registerResolver(key || this.key, this);
        };
        Resolver.prototype.get = function (handler, requestor) {
            switch (this.strategy) {
                case 0:
                    return this.state;
                case 1:
                    var singleton = handler.construct(this.state);
                    this.state = singleton;
                    this.strategy = 0;
                    return singleton;
                case 2:
                    return requestor.construct(this.state);
                case 3:
                    return this.state(handler, requestor, this);
                case 4:
                    return this.state[0].get(handler, requestor);
                case 5:
                    return handler.get(this.state);
                default:
                    throw new Error('Invalid strategy: ' + this.strategy);
            }
        };
        return Resolver;
    }());
    var InvocationHandler = (function () {
        function InvocationHandler(fn, invoker, dependencies) {
            this.fn = fn;
            this.invoker = invoker;
            this.dependencies = dependencies;
        }
        InvocationHandler.prototype.invoke = function (container, dynamicDependencies) {
            return dynamicDependencies !== undefined
                ? this.invoker.invokeWithDynamicDependencies(container, this.fn, this.dependencies, dynamicDependencies)
                : this.invoker.invoke(container, this.fn, this.dependencies);
        };
        return InvocationHandler;
    }());
    var Container = (function () {
        function Container(configuration) {
            if (configuration === void 0) { configuration = {}; }
            this.parent = null;
            this.resolvers = new Map();
            this.configuration = configuration;
            this.handlers = configuration.handlers || (configuration.handlers = new Map());
        }
        Container.prototype.register = function () {
            var _this = this;
            var params = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                params[_i] = arguments[_i];
            }
            var resolvers = this.resolvers;
            for (var i = 0, ii = params.length; i < ii; ++i) {
                var current = params[i];
                if (current.register) {
                    current.register(this);
                }
                else {
                    Object.values(current).forEach(function (x) {
                        if (x.register) {
                            x.register(_this);
                        }
                    });
                }
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
        Container.prototype.get = function (key) {
            if (key === exports.IContainer) {
                return this;
            }
            if (key.get) {
                return key.get(this, this);
            }
            var resolver = this.resolvers.get(key);
            if (resolver === undefined) {
                if (this.parent === null) {
                    return this.jitRegister(key, this).get(this, this);
                }
                if (key.register) {
                    return key.register(this, key).get(this, this);
                }
                return this.parent.parentGet(key, this);
            }
            return resolver.get(this, this);
        };
        Container.prototype.parentGet = function (key, requestor) {
            var resolver = this.resolvers.get(key);
            if (resolver === undefined) {
                if (this.parent === null) {
                    return this.jitRegister(key, requestor).get(this, requestor);
                }
                return this.parent.parentGet(key, requestor);
            }
            return resolver.get(this, requestor);
        };
        Container.prototype.getAll = function (key) {
            validateKey(key);
            var resolver = this.resolvers.get(key);
            if (resolver === undefined) {
                if (this.parent === null) {
                    return pal_1.PLATFORM.emptyArray;
                }
                return this.parent.parentGetAll(key, this);
            }
            return buildAllResponse(resolver, this, this);
        };
        Container.prototype.parentGetAll = function (key, requestor) {
            var resolver = this.resolvers.get(key);
            if (resolver === undefined) {
                if (this.parent === null) {
                    return pal_1.PLATFORM.emptyArray;
                }
                return this.parent.parentGetAll(key, requestor);
            }
            return buildAllResponse(resolver, this, requestor);
        };
        Container.prototype.jitRegister = function (keyAsValue, requestor) {
            if (keyAsValue.register) {
                return keyAsValue.register(this, keyAsValue);
            }
            var strategy = new Resolver(keyAsValue, 1, keyAsValue);
            this.resolvers.set(keyAsValue, strategy);
            return strategy;
        };
        Container.prototype.construct = function (type, dynamicDependencies) {
            var handler = this.handlers.get(type);
            if (handler === undefined) {
                handler = this.createInvocationHandler(type);
                this.handlers.set(type, handler);
            }
            return handler.invoke(this, dynamicDependencies);
        };
        Container.prototype.createInvocationHandler = function (fn) {
            var dependencies;
            if (fn.inject === undefined) {
                dependencies = getDesignParamTypes(fn);
            }
            else {
                dependencies = [];
                var ctor = fn;
                while (typeof ctor === 'function') {
                    dependencies.push.apply(dependencies, getDependencies(ctor));
                    ctor = Object.getPrototypeOf(ctor);
                }
            }
            var invoker = classInvokers[dependencies.length] || classInvokers.fallback;
            return new InvocationHandler(fn, invoker, dependencies);
        };
        Container.prototype.createChild = function () {
            var child = new Container(this.configuration);
            child.parent = this;
            return child;
        };
        return Container;
    }());
    var container = new Container();
    container.createInterface = createInterface;
    container.getDesignParamTypes = getDesignParamTypes;
    exports.DI = container;
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
        factory: function (key, value) {
            return new Resolver(key, 3, value);
        },
        alias: function (originalKey, aliasKey) {
            return new Resolver(aliasKey, 5, originalKey);
        }
    };
    function validateKey(key) {
        if (key === null || key === undefined) {
            throw new Error('key/value cannot be null or undefined. Are you trying to inject/register something that doesn\'t exist with DI?');
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
        return [resolver.get(handler, requestor)];
    }
    function getDependencies(type) {
        if (!type.hasOwnProperty('inject')) {
            return pal_1.PLATFORM.emptyArray;
        }
        return type.inject;
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
                throw new Error('Constructor Parameter with index ' + i + ' cannot be null or undefined. Are you trying to inject/register something that doesn\'t exist with DI?');
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
    var _a;
});



define('runtime/interfaces',["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
});



define('runtime/pal',["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var global = (function () {
        if (typeof self !== 'undefined') {
            return self;
        }
        if (typeof global !== 'undefined') {
            return global;
        }
        return new Function('return this')();
    })();
    global.Element = typeof Element === 'undefined' ? function () { } : Element;
    global.HTMLElement = typeof HTMLElement === 'undefined' ? function () { } : HTMLElement;
    global.SVGElement = typeof SVGElement === 'undefined' ? function () { } : SVGElement;
    global.HTMLSelectElement = typeof HTMLSelectElement === 'undefined' ? function () { } : HTMLSelectElement;
    exports.PLATFORM = {
        global: global,
        emptyArray: Object.freeze([]),
        location: global.location,
        history: global.history,
        performance: global.performance,
        addEventListener: function (eventName, callback, capture) {
            global.addEventListener(eventName, callback, capture);
        },
        removeEventListener: function (eventName, callback, capture) {
            global.removeEventListener(eventName, callback, capture);
        },
        requestAnimationFrame: function (callback) {
            return global.requestAnimationFrame(callback);
        }
    };
    exports.FEATURE = {
        shadowDOM: !!global.HTMLElement.prototype.attachShadow
    };
    exports.DOM = {
        Element: global.Element,
        SVGElement: global.SVGElement,
        boundary: 'aurelia-dom-boundary',
        addEventListener: function (eventName, callback, capture) {
            document.addEventListener(eventName, callback, capture);
        },
        removeEventListener: function (eventName, callback, capture) {
            document.removeEventListener(eventName, callback, capture);
        },
        adoptNode: function (node) {
            return document.adoptNode(node);
        },
        createAttribute: function (name) {
            return document.createAttribute(name);
        },
        createElement: function (tagName) {
            return document.createElement(tagName);
        },
        createTextNode: function (text) {
            return document.createTextNode(text);
        },
        createComment: function (text) {
            return document.createComment(text);
        },
        createDocumentFragment: function () {
            return document.createDocumentFragment();
        },
        createTemplateElement: function () {
            return document.createElement('template');
        },
        createMutationObserver: function (callback) {
            return new MutationObserver(callback);
        },
        createCustomEvent: function (eventType, options) {
            return new CustomEvent(eventType, options);
        },
        dispatchEvent: function (evt) {
            document.dispatchEvent(evt);
        },
        getComputedStyle: function (element) {
            return global.getComputedStyle(element);
        },
        getElementById: function (id) {
            return document.getElementById(id);
        },
        querySelectorAll: function (query) {
            return document.querySelectorAll(query);
        },
        nextElementSibling: function (element) {
            if ('nextElementSibling' in element) {
                return element['nextElementSibling'];
            }
            do {
                element = element.nextSibling;
            } while (element && element.nodeType !== 1);
            return element;
        },
        createTemplateFromMarkup: function (markup) {
            var parser = document.createElement('div');
            parser.innerHTML = markup;
            var temp = parser.firstElementChild;
            if (!temp || temp.nodeName !== 'TEMPLATE') {
                throw new Error('Template markup must be wrapped in a <template> element e.g. <template> <!-- markup here --> </template>');
            }
            return temp;
        },
        appendNode: function (newNode, parentNode) {
            (parentNode || document.body).appendChild(newNode);
        },
        replaceNode: function (newNode, node, parentNode) {
            if (node.parentNode) {
                node.parentNode.replaceChild(newNode, node);
            }
            else {
                parentNode.replaceChild(newNode, node);
            }
        },
        removeNode: function (node, parentNode) {
            if (node.parentNode) {
                node.parentNode.removeChild(node);
            }
            else if (parentNode) {
                parentNode.removeChild(node);
            }
        },
        isAllWhitespace: function (node) {
            return !(node.auInterpolationTarget || (/[^\t\n\r ]/.test(node.textContent)));
        },
        treatNodeAsNonWhitespace: function (node) {
            node.auInterpolationTarget = true;
        },
        makeElementIntoAnchor: function (element, proxy) {
            if (proxy === void 0) { proxy = false; }
            var anchor = exports.DOM.createComment('anchor');
            if (proxy) {
                anchor._element = element;
                anchor.hasAttribute = hasAttribute;
                anchor.getAttribute = getAttribute;
                anchor.setAttribute = setAttribute;
            }
            exports.DOM.replaceNode(anchor, element);
            return anchor;
        },
        injectStyles: function (styles, destination, prepend, id) {
            if (id) {
                var oldStyle = document.getElementById(id);
                if (oldStyle) {
                    var isStyleTag = oldStyle.tagName.toLowerCase() === 'style';
                    if (isStyleTag) {
                        oldStyle.innerHTML = styles;
                        return;
                    }
                    throw new Error('The provided id does not indicate a style tag.');
                }
            }
            var node = document.createElement('style');
            node.innerHTML = styles;
            node.type = 'text/css';
            if (id) {
                node.id = id;
            }
            destination = destination || document.head;
            if (prepend && destination.childNodes.length > 0) {
                destination.insertBefore(node, destination.childNodes[0]);
            }
            else {
                destination.appendChild(node);
            }
            return node;
        }
    };
    function hasAttribute(name) {
        return this._element.hasAttribute(name);
    }
    function getAttribute(name) {
        return this._element.getAttribute(name);
    }
    function setAttribute(name, value) {
        this._element.setAttribute(name, value);
    }
});



define('runtime/reporter',["require", "exports"], function (require, exports) {
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



define('runtime/task-queue',["require", "exports", "./pal", "./di"], function (require, exports, pal_1, di_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var hasSetImmediate = typeof setImmediate === 'function';
    exports.ITaskQueue = di_1.DI.createInterface('ITaskQueue');
    function makeRequestFlushFromMutationObserver(flush) {
        var toggle = 1;
        var observer = pal_1.DOM.createMutationObserver(flush);
        var node = pal_1.DOM.createTextNode('');
        observer.observe(node, { characterData: true });
        return function requestFlush() {
            toggle = -toggle;
            node.data = toggle.toString();
        };
    }
    function makeRequestFlushFromTimer(flush) {
        return function requestFlush() {
            var timeoutHandle = setTimeout(handleFlushTimer, 0);
            var intervalHandle = setInterval(handleFlushTimer, 50);
            function handleFlushTimer() {
                clearTimeout(timeoutHandle);
                clearInterval(intervalHandle);
                flush();
            }
        };
    }
    var TaskQueueImplementation = (function () {
        function TaskQueueImplementation() {
            var _this = this;
            this.microTaskQueue = [];
            this.taskQueue = [];
            this.microTaskQueueCapacity = 1024;
            this.requestFlushMicroTaskQueue = makeRequestFlushFromMutationObserver(function () { return _this.flushMicroTaskQueue(); });
            this.requestFlushTaskQueue = makeRequestFlushFromTimer(function () { return _this.flushTaskQueue(); });
            this.flushing = false;
            this.longStacks = false;
        }
        TaskQueueImplementation.prototype.flushQueue = function (queue, capacity) {
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
        TaskQueueImplementation.prototype.queueMicroTask = function (task) {
            if (this.microTaskQueue.length < 1) {
                this.requestFlushMicroTaskQueue();
            }
            if (this.longStacks) {
                task.stack = this.prepareMicroTaskStack();
            }
            this.microTaskQueue.push(task);
        };
        TaskQueueImplementation.prototype.flushMicroTaskQueue = function () {
            var queue = this.microTaskQueue;
            this.flushQueue(queue, this.microTaskQueueCapacity);
            queue.length = 0;
        };
        TaskQueueImplementation.prototype.queueTask = function (task) {
            if (this.taskQueue.length < 1) {
                this.requestFlushTaskQueue();
            }
            if (this.longStacks) {
                task.stack = this.prepareTaskStack();
            }
            this.taskQueue.push(task);
        };
        TaskQueueImplementation.prototype.flushTaskQueue = function () {
            var queue = this.taskQueue;
            this.taskQueue = [];
            this.flushQueue(queue, Number.MAX_VALUE);
        };
        TaskQueueImplementation.prototype.prepareTaskStack = function () {
            throw new Error('TaskQueue long stack traces are only available in debug mode.');
        };
        TaskQueueImplementation.prototype.prepareMicroTaskStack = function () {
            throw new Error('TaskQueue long stack traces are only available in debug mode.');
        };
        TaskQueueImplementation.prototype.onError = function (error, task) {
            if ('onError' in task) {
                task.onError(error);
            }
            else if (hasSetImmediate) {
                setImmediate(function () { throw error; });
            }
            else {
                setTimeout(function () { throw error; }, 0);
            }
        };
        return TaskQueueImplementation;
    }());
    exports.TaskQueue = new TaskQueueImplementation();
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
            { type: AST.Chain, name: 'Chain' },
            { type: AST.Conditional, name: 'Conditional' },
            { type: AST.LiteralArray, name: 'LiteralArray' },
            { type: AST.LiteralObject, name: 'LiteralObject' },
            { type: AST.LiteralPrimitive, name: 'LiteralPrimitive' },
            { type: AST.LiteralString, name: 'LiteralString' },
            { type: AST.PrefixNot, name: 'Prefix' },
            { type: AST.TemplateLiteral, name: 'TemplateLiteral' },
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
        Unparser.prototype.visitChain = function (chain) {
            var expressions = chain.expressions;
            for (var i = 0, length_2 = expressions.length; i < length_2; ++i) {
                if (i !== 0) {
                    this.write(';');
                }
                expressions[i].accept(this);
            }
        };
        Unparser.prototype.visitBindingBehavior = function (behavior) {
            var args = behavior.args;
            behavior.expression.accept(this);
            this.write("&" + behavior.name);
            for (var i = 0, length_3 = args.length; i < length_3; ++i) {
                this.write(':');
                args[i].accept(this);
            }
        };
        Unparser.prototype.visitValueConverter = function (converter) {
            var args = converter.args;
            converter.expression.accept(this);
            this.write("|" + converter.name);
            for (var i = 0, length_4 = args.length; i < length_4; ++i) {
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
        Unparser.prototype.visitPrefix = function (prefix) {
            this.write("(" + prefix.operation);
            prefix.expression.accept(this);
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
            for (var i = 0, length_5 = elements.length; i < length_5; ++i) {
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
            for (var i = 0, length_6 = keys.length; i < length_6; ++i) {
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
            for (var i = 0, length_7 = parts.length; i < length_7; ++i) {
                parts[i].accept(this);
            }
        };
        return Unparser;
    }());
});



define('jit/binding/expression',["require", "exports", "../../runtime/binding/expression"], function (require, exports, expression_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.Expression = Object.assign(expression_1.Expression, {
        compile: function (expression) {
            throw new Error('Expression Compilation Not Implemented');
        }
    });
});



define('runtime/configuration/standard',["require", "exports", "../di", "../resources/if", "../resources/else", "../task-queue", "../binding/dirty-checker", "../binding/svg-analyzer", "../binding/event-manager", "../binding/observer-locator"], function (require, exports, di_1, if_1, else_1, task_queue_1, dirty_checker_1, svg_analyzer_1, event_manager_1, observer_locator_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.StandardConfiguration = {
        register: function (container) {
            container.register(if_1.If, else_1.Else);
            container.register(di_1.Registration.instance(dirty_checker_1.IDirtyChecker, dirty_checker_1.DirtyChecker));
            container.register(di_1.Registration.instance(task_queue_1.ITaskQueue, task_queue_1.TaskQueue));
            container.register(di_1.Registration.instance(svg_analyzer_1.ISVGAnalyzer, svg_analyzer_1.SVGAnalyzer));
            container.register(di_1.Registration.instance(event_manager_1.IEventManager, event_manager_1.EventManager));
            container.register(di_1.Registration.instance(observer_locator_1.IObserverLocator, observer_locator_1.ObserverLocator));
        }
    };
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
    function getArrayObserver(array) {
        return ModifyArrayObserver.for(array);
    }
    exports.getArrayObserver = getArrayObserver;
    var ModifyArrayObserver = (function (_super) {
        __extends(ModifyArrayObserver, _super);
        function ModifyArrayObserver(array) {
            return _super.call(this, array) || this;
        }
        ModifyArrayObserver.for = function (array) {
            if (!('__array_observer__' in array)) {
                Reflect.defineProperty(array, '__array_observer__', {
                    value: ModifyArrayObserver.create(array),
                    enumerable: false, configurable: false
                });
            }
            return array.__array_observer__;
        };
        ModifyArrayObserver.create = function (array) {
            return new ModifyArrayObserver(array);
        };
        return ModifyArrayObserver;
    }(collection_observation_1.ModifyCollectionObserver));
});



define('runtime/binding/ast',["require", "exports", "./binding-context", "./signal"], function (require, exports, binding_context_1, signal_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.AstKind = {
        Base: 1,
        Chain: 2,
        ValueConverter: 3,
        BindingBehavior: 4,
        Assign: 5,
        Conditional: 6,
        AccessThis: 7,
        AccessScope: 8,
        AccessMember: 9,
        AccessKeyed: 10,
        CallScope: 11,
        CallFunction: 12,
        CallMember: 13,
        PrefixNot: 14,
        Binary: 15,
        LiteralPrimitive: 16,
        LiteralArray: 17,
        LiteralObject: 18,
        LiteralString: 19,
        TemplateLiteral: 20,
    };
    var Chain = (function () {
        function Chain(expressions) {
            this.expressions = expressions;
        }
        Chain.prototype.evaluate = function (scope, container) {
            var result;
            var expressions = this.expressions;
            var last;
            for (var i = 0, length_1 = expressions.length; i < length_1; ++i) {
                last = expressions[i].evaluate(scope, container);
                if (last !== null) {
                    result = last;
                }
            }
            return result;
        };
        Chain.prototype.connect = function () { };
        return Chain;
    }());
    exports.Chain = Chain;
    var BindingBehavior = (function () {
        function BindingBehavior(expression, name, args) {
            this.expression = expression;
            this.name = name;
            this.args = args;
        }
        BindingBehavior.prototype.evaluate = function (scope, container) {
            return this.expression.evaluate(scope, container);
        };
        BindingBehavior.prototype.assign = function (scope, value, container) {
            return this.expression.assign(scope, value, container);
        };
        BindingBehavior.prototype.connect = function (binding, scope) {
            this.expression.connect(binding, scope);
        };
        BindingBehavior.prototype.bind = function (binding, scope) {
            if (this.expression['expression'] && this.expression.bind) {
                this.expression.bind(binding, scope);
            }
            var behavior = binding.container.get(this.name);
            if (!behavior) {
                throw new Error("No BindingBehavior named \"" + this.name + "\" was found!");
            }
            var behaviorKey = "behavior-" + this.name;
            if (binding[behaviorKey]) {
                throw new Error("A binding behavior named \"" + this.name + "\" has already been applied to \"" + this.expression + "\"");
            }
            binding[behaviorKey] = behavior;
            behavior.bind.apply(behavior, [binding, scope].concat(evalList(scope, this.args, binding.container)));
        };
        BindingBehavior.prototype.unbind = function (binding, scope) {
            var behaviorKey = "behavior-" + this.name;
            binding[behaviorKey].unbind(binding, scope);
            binding[behaviorKey] = null;
            if (this.expression['expression'] && this.expression.unbind) {
                this.expression.unbind(binding, scope);
            }
        };
        return BindingBehavior;
    }());
    exports.BindingBehavior = BindingBehavior;
    var ValueConverter = (function () {
        function ValueConverter(expression, name, args, allArgs) {
            this.expression = expression;
            this.name = name;
            this.args = args;
            this.allArgs = allArgs;
        }
        ValueConverter.prototype.evaluate = function (scope, container) {
            var converter = container.get(this.name);
            if (!converter) {
                throw new Error("No ValueConverter named \"" + this.name + "\" was found!");
            }
            if ('toView' in converter) {
                return converter.toView.apply(converter, evalList(scope, this.allArgs, container));
            }
            return this.allArgs[0].evaluate(scope, container);
        };
        ValueConverter.prototype.assign = function (scope, value, container) {
            var converter = container.get(this.name);
            if (!converter) {
                throw new Error("No ValueConverter named \"" + this.name + "\" was found!");
            }
            if ('fromView' in converter) {
                value = converter.fromView.apply(converter, [value].concat(evalList(scope, this.args, container)));
            }
            return this.allArgs[0].assign(scope, value, container);
        };
        ValueConverter.prototype.connect = function (binding, scope) {
            var expressions = this.allArgs;
            var i = expressions.length;
            while (i--) {
                expressions[i].connect(binding, scope);
            }
            var converter = binding.container.get(this.name);
            if (!converter) {
                throw new Error("No ValueConverter named \"" + this.name + "\" was found!");
            }
            var signals = converter.signals;
            if (signals === undefined) {
                return;
            }
            i = signals.length;
            while (i--) {
                signal_1.Signal.connect(binding, signals[i]);
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
        Assign.prototype.evaluate = function (scope, container) {
            return this.target.assign(scope, this.value.evaluate(scope, container), container);
        };
        Assign.prototype.connect = function () { };
        Assign.prototype.assign = function (scope, value, container) {
            this.value.assign(scope, value, container);
            this.target.assign(scope, value, container);
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
        Conditional.prototype.evaluate = function (scope, container) {
            return (!!this.condition.evaluate(scope, container))
                ? this.yes.evaluate(scope, container)
                : this.no.evaluate(scope, container);
        };
        Conditional.prototype.connect = function (binding, scope) {
            this.condition.connect(binding, scope);
            if (this.condition.evaluate(scope, null)) {
                this.yes.connect(binding, scope);
            }
            else {
                this.no.connect(binding, scope);
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
        AccessThis.prototype.evaluate = function (scope, container) {
            var oc = scope.overrideContext;
            var i = this.ancestor;
            while (i-- && oc) {
                oc = oc.parentOverrideContext;
            }
            return i < 1 && oc ? oc.bindingContext : undefined;
        };
        AccessThis.prototype.connect = function () { };
        return AccessThis;
    }());
    exports.AccessThis = AccessThis;
    var AccessScope = (function () {
        function AccessScope(name, ancestor) {
            if (ancestor === void 0) { ancestor = 0; }
            this.name = name;
            this.ancestor = ancestor;
        }
        AccessScope.prototype.evaluate = function (scope, container) {
            var context = binding_context_1.BindingContext.get(scope, this.name, this.ancestor);
            return context[this.name];
        };
        AccessScope.prototype.assign = function (scope, value) {
            var context = binding_context_1.BindingContext.get(scope, this.name, this.ancestor);
            return context ? (context[this.name] = value) : undefined;
        };
        AccessScope.prototype.connect = function (binding, scope) {
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
        AccessMember.prototype.evaluate = function (scope, container) {
            var instance = this.object.evaluate(scope, container);
            return instance === null || instance === undefined ? instance : instance[this.name];
        };
        AccessMember.prototype.assign = function (scope, value, container) {
            var instance = this.object.evaluate(scope, container);
            if (instance === null || instance === undefined) {
                instance = {};
                this.object.assign(scope, instance, container);
            }
            instance[this.name] = value;
            return value;
        };
        AccessMember.prototype.connect = function (binding, scope) {
            this.object.connect(binding, scope);
            var obj = this.object.evaluate(scope, null);
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
        AccessKeyed.prototype.evaluate = function (scope, container) {
            var instance = this.object.evaluate(scope, container);
            var lookup = this.key.evaluate(scope, container);
            return getKeyed(instance, lookup);
        };
        AccessKeyed.prototype.assign = function (scope, value, container) {
            var instance = this.object.evaluate(scope, container);
            var lookup = this.key.evaluate(scope, container);
            return setKeyed(instance, lookup, value);
        };
        AccessKeyed.prototype.connect = function (binding, scope) {
            this.object.connect(binding, scope);
            var obj = this.object.evaluate(scope, null);
            if (obj instanceof Object) {
                this.key.connect(binding, scope);
                var key = this.key.evaluate(scope, null);
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
            this.name = name;
            this.args = args;
            this.ancestor = ancestor;
        }
        CallScope.prototype.evaluate = function (scope, container, mustEvaluate) {
            var args = evalList(scope, this.args, container);
            var context = binding_context_1.BindingContext.get(scope, this.name, this.ancestor);
            var func = getFunction(context, this.name, mustEvaluate);
            if (func) {
                return func.apply(context, args);
            }
            return undefined;
        };
        CallScope.prototype.connect = function (binding, scope) {
            var args = this.args;
            var i = args.length;
            while (i--) {
                args[i].connect(binding, scope);
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
        CallMember.prototype.evaluate = function (scope, container, mustEvaluate) {
            var instance = this.object.evaluate(scope, container);
            var args = evalList(scope, this.args, container);
            var func = getFunction(instance, this.name, mustEvaluate);
            if (func) {
                return func.apply(instance, args);
            }
            return undefined;
        };
        CallMember.prototype.connect = function (binding, scope) {
            this.object.connect(binding, scope);
            var obj = this.object.evaluate(scope, null);
            if (getFunction(obj, this.name, false)) {
                var args = this.args;
                var i = args.length;
                while (i--) {
                    args[i].connect(binding, scope);
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
        CallFunction.prototype.evaluate = function (scope, container, mustEvaluate) {
            var func = this.func.evaluate(scope, container);
            if (typeof func === 'function') {
                return func.apply(null, evalList(scope, this.args, container));
            }
            if (!mustEvaluate && (func === null || func === undefined)) {
                return undefined;
            }
            throw new Error(this.func + " is not a function");
        };
        CallFunction.prototype.connect = function (binding, scope) {
            this.func.connect(binding, scope);
            var func = this.func.evaluate(scope, null);
            if (typeof func === 'function') {
                var args = this.args;
                var i = args.length;
                while (i--) {
                    args[i].connect(binding, scope);
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
        Binary.prototype.evaluate = function (scope, container) {
            var left = this.left.evaluate(scope, container);
            switch (this.operation) {
                case '&&': return left && this.right.evaluate(scope, container);
                case '||': return left || this.right.evaluate(scope, container);
            }
            var right = this.right.evaluate(scope, container);
            switch (this.operation) {
                case '==': return left == right;
                case '===': return left === right;
                case '!=': return left != right;
                case '!==': return left !== right;
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
                case '^': return left ^ right;
            }
            throw new Error("Internal error [" + this.operation + "] not handled");
        };
        Binary.prototype.connect = function (binding, scope) {
            this.left.connect(binding, scope);
            var left = this.left.evaluate(scope, null);
            if (this.operation === '&&' && !left || this.operation === '||' && left) {
                return;
            }
            this.right.connect(binding, scope);
        };
        return Binary;
    }());
    exports.Binary = Binary;
    var PrefixNot = (function () {
        function PrefixNot(operation, expression) {
            this.operation = operation;
            this.expression = expression;
        }
        PrefixNot.prototype.evaluate = function (scope, container) {
            return !this.expression.evaluate(scope, container);
        };
        PrefixNot.prototype.connect = function (binding, scope) {
            this.expression.connect(binding, scope);
        };
        return PrefixNot;
    }());
    exports.PrefixNot = PrefixNot;
    var LiteralPrimitive = (function () {
        function LiteralPrimitive(value) {
            this.value = value;
        }
        LiteralPrimitive.prototype.evaluate = function (scope, container) {
            return this.value;
        };
        LiteralPrimitive.prototype.connect = function (binding, scope) {
        };
        return LiteralPrimitive;
    }());
    exports.LiteralPrimitive = LiteralPrimitive;
    var LiteralString = (function () {
        function LiteralString(value) {
            this.value = value;
        }
        LiteralString.prototype.evaluate = function (scope, container) {
            return this.value;
        };
        LiteralString.prototype.connect = function (binding, scope) { };
        return LiteralString;
    }());
    exports.LiteralString = LiteralString;
    var TemplateLiteral = (function () {
        function TemplateLiteral(parts) {
            this.parts = parts;
        }
        TemplateLiteral.prototype.evaluate = function (scope, container) {
            var elements = this.parts;
            var result = '';
            for (var i = 0, length_2 = elements.length; i < length_2; ++i) {
                var value = elements[i].evaluate(scope, container);
                if (value === undefined || value === null) {
                    continue;
                }
                result += value;
            }
            return result;
        };
        TemplateLiteral.prototype.connect = function (binding, scope) {
            var length = this.parts.length;
            for (var i = 0; i < length; i++) {
                this.parts[i].connect(binding, scope);
            }
        };
        return TemplateLiteral;
    }());
    exports.TemplateLiteral = TemplateLiteral;
    var LiteralArray = (function () {
        function LiteralArray(elements) {
            this.elements = elements;
        }
        LiteralArray.prototype.evaluate = function (scope, container) {
            var elements = this.elements;
            var result = [];
            for (var i = 0, length_3 = elements.length; i < length_3; ++i) {
                result[i] = elements[i].evaluate(scope, container);
            }
            return result;
        };
        LiteralArray.prototype.connect = function (binding, scope) {
            var length = this.elements.length;
            for (var i = 0; i < length; i++) {
                this.elements[i].connect(binding, scope);
            }
        };
        return LiteralArray;
    }());
    exports.LiteralArray = LiteralArray;
    var LiteralObject = (function () {
        function LiteralObject(keys, values) {
            this.keys = keys;
            this.values = values;
        }
        LiteralObject.prototype.evaluate = function (scope, container) {
            var instance = {};
            var keys = this.keys;
            var values = this.values;
            for (var i = 0, length_4 = keys.length; i < length_4; ++i) {
                instance[keys[i]] = values[i].evaluate(scope, container);
            }
            return instance;
        };
        LiteralObject.prototype.connect = function (binding, scope) {
            var length = this.keys.length;
            for (var i = 0; i < length; i++) {
                this.values[i].connect(binding, scope);
            }
        };
        return LiteralObject;
    }());
    exports.LiteralObject = LiteralObject;
    function evalList(scope, list, container) {
        var length = list.length;
        var result = [];
        for (var i = 0; i < length; i++) {
            result[i] = list[i].evaluate(scope, container);
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
    function getFunction(obj, name, mustExist) {
        var func = obj === null || obj === undefined ? null : obj[name];
        if (typeof func === 'function') {
            return func;
        }
        if (!mustExist && (func === null || func === undefined)) {
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



define('runtime/binding/binding-context',["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.targetContext = 'Binding:target';
    exports.sourceContext = 'Binding:source';
    exports.BindingContext = {
        createOverride: function (bindingContext, parentOverrideContext) {
            return {
                bindingContext: bindingContext,
                parentOverrideContext: parentOverrideContext || null
            };
        },
        get: function (scope, name, ancestor) {
            var oc = scope.overrideContext;
            if (ancestor) {
                while (ancestor && oc) {
                    ancestor--;
                    oc = oc.parentOverrideContext;
                }
                if (ancestor || !oc) {
                    return undefined;
                }
                return name in oc ? oc : oc.bindingContext;
            }
            while (oc && !(name in oc) && !(oc.bindingContext && name in oc.bindingContext)) {
                oc = oc.parentOverrideContext;
            }
            if (oc) {
                return name in oc ? oc : oc.bindingContext;
            }
            return scope.bindingContext || scope.overrideContext;
        }
    };
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
define('runtime/binding/binding',["require", "exports", "./binding-mode", "./connectable-binding", "./connect-queue", "./observer-locator", "./binding-context"], function (require, exports, binding_mode_1, connectable_binding_1, connect_queue_1, observer_locator_1, binding_context_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var Binding = (function (_super) {
        __extends(Binding, _super);
        function Binding(sourceExpression, target, targetProperty, mode, container) {
            var _this = _super.call(this) || this;
            _this.sourceExpression = sourceExpression;
            _this.target = target;
            _this.targetProperty = targetProperty;
            _this.mode = mode;
            _this.container = container;
            _this.isBound = false;
            return _this;
        }
        Binding.prototype.updateTarget = function (value) {
            this.targetObserver.setValue(value, this.target, this.targetProperty);
        };
        Binding.prototype.updateSource = function (value) {
            this.sourceExpression.assign(this.source, value, this.container);
        };
        Binding.prototype.call = function (context, newValue, oldValue) {
            if (!this.isBound) {
                return;
            }
            if (context === binding_context_1.sourceContext) {
                oldValue = this.targetObserver.getValue(this.target, this.targetProperty);
                newValue = this.sourceExpression.evaluate(this.source, this.container);
                if (newValue !== oldValue) {
                    this.updateTarget(newValue);
                }
                if (this.mode !== binding_mode_1.BindingMode.oneTime) {
                    this.version++;
                    this.sourceExpression.connect(this, this.source);
                    this.unobserve(false);
                }
                return;
            }
            if (context === binding_context_1.targetContext) {
                if (newValue !== this.sourceExpression.evaluate(this.source, this.container)) {
                    this.updateSource(newValue);
                }
                return;
            }
            throw new Error("Unexpected call context " + context);
        };
        Binding.prototype.bind = function (source) {
            if (this.isBound) {
                if (this.source === source) {
                    return;
                }
                this.unbind();
            }
            this.isBound = true;
            this.source = source;
            if (this.sourceExpression.bind) {
                this.sourceExpression.bind(this, source);
            }
            var mode = this.mode;
            if (!this.targetObserver) {
                var method = mode === binding_mode_1.BindingMode.twoWay || mode === binding_mode_1.BindingMode.fromView ? 'getObserver' : 'getAccessor';
                this.targetObserver = observer_locator_1.ObserverLocator[method](this.target, this.targetProperty);
            }
            if ('bind' in this.targetObserver) {
                this.targetObserver.bind();
            }
            if (this.mode !== binding_mode_1.BindingMode.fromView) {
                var value = this.sourceExpression.evaluate(source, this.container);
                this.updateTarget(value);
            }
            if (mode === binding_mode_1.BindingMode.oneTime) {
                return;
            }
            else if (mode === binding_mode_1.BindingMode.toView) {
                connect_queue_1.enqueueBindingConnect(this);
            }
            else if (mode === binding_mode_1.BindingMode.twoWay) {
                this.sourceExpression.connect(this, source);
                this.targetObserver.subscribe(binding_context_1.targetContext, this);
            }
            else if (mode === binding_mode_1.BindingMode.fromView) {
                this.targetObserver.subscribe(binding_context_1.targetContext, this);
            }
        };
        Binding.prototype.unbind = function () {
            if (!this.isBound) {
                return;
            }
            this.isBound = false;
            if (this.sourceExpression.unbind) {
                this.sourceExpression.unbind(this, this.source);
            }
            this.source = null;
            if ('unbind' in this.targetObserver) {
                this.targetObserver.unbind();
            }
            if ('unsubscribe' in this.targetObserver) {
                this.targetObserver.unsubscribe(binding_context_1.targetContext, this);
            }
            this.unobserve(true);
        };
        Binding.prototype.connect = function (evaluate) {
            if (!this.isBound) {
                return;
            }
            if (evaluate) {
                var value = this.sourceExpression.evaluate(this.source, this.container);
                this.updateTarget(value);
            }
            this.sourceExpression.connect(this, this.source);
        };
        return Binding;
    }(connectable_binding_1.ConnectableBinding));
    exports.Binding = Binding;
});



define('runtime/binding/call',["require", "exports", "./observer-locator"], function (require, exports, observer_locator_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var Call = (function () {
        function Call(sourceExpression, target, targetProperty, container) {
            this.sourceExpression = sourceExpression;
            this.target = target;
            this.targetProperty = targetProperty;
            this.container = container;
            this.isBound = false;
            this.targetObserver = observer_locator_1.ObserverLocator.getObserver(target, targetProperty);
        }
        Call.prototype.callSource = function ($event) {
            var overrideContext = this.source.overrideContext;
            Object.assign(overrideContext, $event);
            overrideContext.$event = $event;
            var mustEvaluate = true;
            var result = this.sourceExpression.evaluate(this.source, this.container, mustEvaluate);
            delete overrideContext.$event;
            for (var prop in $event) {
                delete overrideContext[prop];
            }
            return result;
        };
        Call.prototype.bind = function (source) {
            var _this = this;
            if (this.isBound) {
                if (this.source === source) {
                    return;
                }
                this.unbind();
            }
            this.isBound = true;
            this.source = source;
            if (this.sourceExpression.bind) {
                this.sourceExpression.bind(this, source);
            }
            this.targetObserver.setValue(function ($event) { return _this.callSource($event); }, this.target, this.targetProperty);
        };
        Call.prototype.unbind = function () {
            if (!this.isBound) {
                return;
            }
            this.isBound = false;
            if (this.sourceExpression.unbind) {
                this.sourceExpression.unbind(this, this.source);
            }
            this.source = null;
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
define('runtime/binding/checked-observer',["require", "exports", "./subscriber-collection", "../task-queue"], function (require, exports, subscriber_collection_1, task_queue_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var checkedArrayContext = 'CheckedObserver:array';
    var checkedValueContext = 'CheckedObserver:value';
    var CheckedObserver = (function (_super) {
        __extends(CheckedObserver, _super);
        function CheckedObserver(element, handler, observerLocator) {
            var _this = _super.call(this) || this;
            _this.element = element;
            _this.handler = handler;
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
            if (this.element.type === 'checkbox' && Array.isArray(newValue)) {
                this.arrayObserver = this.observerLocator.getArrayObserver(newValue);
                this.arrayObserver.subscribe(checkedArrayContext, this);
            }
            this.oldValue = this.value;
            this.value = newValue;
            this.synchronizeElement();
            this.notify();
            if (!this.initialSync) {
                this.initialSync = true;
                task_queue_1.TaskQueue.queueMicroTask(this);
            }
        };
        CheckedObserver.prototype.call = function (context, splices) {
            this.synchronizeElement();
            if (!this.valueObserver) {
                this.valueObserver = this.element['$observers'].model || this.element['$observers'].value;
                if (this.valueObserver) {
                    this.valueObserver.subscribe(checkedValueContext, this);
                }
            }
        };
        CheckedObserver.prototype.synchronizeElement = function () {
            var value = this.value;
            var element = this.element;
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
            var element = this.element;
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
                this.handler.subscribe(this.element, this);
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



define('runtime/binding/class-observer',["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var ClassObserver = (function () {
        function ClassObserver(element) {
            this.element = element;
            this.doNotCache = true;
            this.value = '';
            this.version = 0;
        }
        ClassObserver.prototype.getValue = function () {
            return this.value;
        };
        ClassObserver.prototype.setValue = function (newValue) {
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
                    this.element.classList.add(name);
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
                this.element.classList.remove(name);
            }
        };
        ClassObserver.prototype.subscribe = function () {
            throw new Error("Observation of a \"" + this.element.nodeName + "\" element's \"class\" property is not supported.");
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
define('runtime/binding/collection-observation',["require", "exports", "./array-change-records", "./map-change-records", "./subscriber-collection", "../task-queue"], function (require, exports, array_change_records_1, map_change_records_1, subscriber_collection_1, task_queue_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var ModifyCollectionObserver = (function (_super) {
        __extends(ModifyCollectionObserver, _super);
        function ModifyCollectionObserver(collection) {
            var _this = _super.call(this) || this;
            _this.queued = false;
            _this.changeRecords = null;
            _this.oldCollection = null;
            _this.lengthObserver = null;
            _this.collection = collection;
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
                task_queue_1.TaskQueue.queueMicroTask(this);
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
                task_queue_1.TaskQueue.queueMicroTask(this);
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



define('runtime/binding/connect-queue',["require", "exports", "../pal"], function (require, exports, pal_1) {
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
            if (i % 100 === 0 && pal_1.PLATFORM.performance.now() - animationFrameStart > frameBudget) {
                break;
            }
        }
        queue.splice(0, i);
        if (queue.length) {
            pal_1.PLATFORM.requestAnimationFrame(flush);
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
            pal_1.PLATFORM.requestAnimationFrame(flush);
        }
    }
    exports.enqueueBindingConnect = enqueueBindingConnect;
});



define('runtime/binding/connectable-binding',["require", "exports", "./observer-locator", "./binding-context"], function (require, exports, observer_locator_1, binding_context_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var slotNames = [];
    var versionSlotNames = [];
    for (var i = 0; i < 100; i++) {
        slotNames.push("_observer" + i);
        versionSlotNames.push("_observerVersion" + i);
    }
    var ConnectableBinding = (function () {
        function ConnectableBinding() {
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
            var observer = observer_locator_1.ObserverLocator.getObserver(obj, propertyName);
            this.addObserver(observer);
        };
        ConnectableBinding.prototype.observeArray = function (array) {
            var observer = observer_locator_1.ObserverLocator.getArrayObserver(array);
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
define('runtime/binding/dirty-checker',["require", "exports", "./subscriber-collection", "../di"], function (require, exports, subscriber_collection_1, di_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.IDirtyChecker = di_1.DI.createInterface('IDirtyChecker');
    var Checker = {
        tracked: [],
        checkDelay: 120,
        createProperty: function (obj, propertyName) {
            return new DirtyCheckProperty(obj, propertyName);
        },
        addProperty: function (property) {
            var tracked = this.tracked;
            tracked.push(property);
            if (tracked.length === 1) {
                this.scheduleDirtyCheck();
            }
        },
        removeProperty: function (property) {
            var tracked = this.tracked;
            tracked.splice(tracked.indexOf(property), 1);
        },
        scheduleDirtyCheck: function () {
            var _this = this;
            setTimeout(function () { return _this.check(); }, this.checkDelay);
        },
        check: function () {
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
        }
    };
    var DirtyCheckProperty = (function (_super) {
        __extends(DirtyCheckProperty, _super);
        function DirtyCheckProperty(obj, propertyName) {
            var _this = _super.call(this) || this;
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
                Checker.addProperty(this);
            }
            this.addSubscriber(context, callable);
        };
        DirtyCheckProperty.prototype.unsubscribe = function (context, callable) {
            if (this.removeSubscriber(context, callable) && !this.hasSubscribers()) {
                Checker.removeProperty(this);
            }
        };
        return DirtyCheckProperty;
    }(subscriber_collection_1.SubscriberCollection));
    exports.DirtyChecker = Checker;
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
define('runtime/binding/element-observation',["require", "exports", "./subscriber-collection"], function (require, exports, subscriber_collection_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var XLinkAttributeObserver = (function () {
        function XLinkAttributeObserver(element, propertyName, attributeName) {
            this.element = element;
            this.propertyName = propertyName;
            this.attributeName = attributeName;
        }
        XLinkAttributeObserver.prototype.getValue = function () {
            return this.element.getAttributeNS('http://www.w3.org/1999/xlink', this.attributeName);
        };
        XLinkAttributeObserver.prototype.setValue = function (newValue) {
            return this.element.setAttributeNS('http://www.w3.org/1999/xlink', this.attributeName, newValue);
        };
        XLinkAttributeObserver.prototype.subscribe = function () {
            throw new Error("Observation of a \"" + this.element.nodeName + "\" element's \"" + this.propertyName + "\" property is not supported.");
        };
        return XLinkAttributeObserver;
    }());
    exports.XLinkAttributeObserver = XLinkAttributeObserver;
    exports.dataAttributeAccessor = {
        getValue: function (obj, propertyName) { return obj.getAttribute(propertyName); },
        setValue: function (value, obj, propertyName) {
            if (value === null || value === undefined) {
                obj.removeAttribute(propertyName);
            }
            else {
                obj.setAttribute(propertyName, value);
            }
        }
    };
    var DataAttributeObserver = (function () {
        function DataAttributeObserver(element, propertyName) {
            this.element = element;
            this.propertyName = propertyName;
        }
        DataAttributeObserver.prototype.getValue = function () {
            return this.element.getAttribute(this.propertyName);
        };
        DataAttributeObserver.prototype.setValue = function (newValue) {
            if (newValue === null || newValue === undefined) {
                return this.element.removeAttribute(this.propertyName);
            }
            return this.element.setAttribute(this.propertyName, newValue);
        };
        DataAttributeObserver.prototype.subscribe = function () {
            throw new Error("Observation of a \"" + this.element.nodeName + "\" element's \"" + this.propertyName + "\" property is not supported.");
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
        function ValueAttributeObserver(element, propertyName, handler) {
            var _this = _super.call(this) || this;
            _this.element = element;
            _this.propertyName = propertyName;
            _this.handler = handler;
            if (propertyName === 'files') {
                _this.setValue = function () { };
            }
            return _this;
        }
        ValueAttributeObserver.prototype.getValue = function () {
            return this.element[this.propertyName];
        };
        ValueAttributeObserver.prototype.setValue = function (newValue) {
            newValue = newValue === undefined || newValue === null ? '' : newValue;
            if (this.element[this.propertyName] !== newValue) {
                this.element[this.propertyName] = newValue;
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
                this.handler.subscribe(this.element, this);
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



define('runtime/binding/event-manager',["require", "exports", "../pal", "../di"], function (require, exports, pal_1, di_1) {
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
                pal_1.DOM.addEventListener(this.eventName, this.listener, this.capture);
            }
        };
        ListenerTracker.prototype.decrement = function () {
            this.count--;
            if (this.count === 0) {
                pal_1.DOM.removeEventListener(this.eventName, this.listener, this.capture);
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
            this.entry = this.lookup = this.targetEvent = null;
        };
        return DelegateOrCaptureSubscription;
    }());
    var TriggerSubscription = (function () {
        function TriggerSubscription(target, targetEvent, callback) {
            this.target = target;
            this.targetEvent = targetEvent;
            this.callback = callback;
            target.addEventListener(targetEvent, callback);
        }
        TriggerSubscription.prototype.dispose = function () {
            this.target.removeEventListener(this.targetEvent, this.callback);
            this.target = this.targetEvent = this.callback = null;
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
        EventSubscriber.prototype.subscribe = function (element, callbackOrListener) {
            this.target = element;
            this.handler = callbackOrListener;
            var events = this.events;
            for (var i = 0, ii = events.length; ii > i; ++i) {
                element.addEventListener(events[i], callbackOrListener);
            }
        };
        EventSubscriber.prototype.dispose = function () {
            var element = this.target;
            var callbackOrListener = this.handler;
            var events = this.events;
            for (var i = 0, ii = events.length; ii > i; ++i) {
                element.removeEventListener(events[i], callbackOrListener);
            }
            this.target = this.handler = null;
        };
        return EventSubscriber;
    }());
    exports.IEventManager = di_1.DI.createInterface('IEventManager');
    var EventManagerImplementation = (function () {
        function EventManagerImplementation() {
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
        EventManagerImplementation.prototype.registerElementConfiguration = function (config) {
            var tagName = config.tagName.toLowerCase();
            var properties = config.properties;
            var lookup = this.elementHandlerLookup[tagName] = {};
            for (var propertyName in properties) {
                if (properties.hasOwnProperty(propertyName)) {
                    lookup[propertyName] = properties[propertyName];
                }
            }
        };
        EventManagerImplementation.prototype.getElementHandler = function (target, propertyName) {
            var tagName;
            var lookup = this.elementHandlerLookup;
            if (target.tagName) {
                tagName = target.tagName.toLowerCase();
                if (lookup[tagName] && lookup[tagName][propertyName]) {
                    return new EventSubscriber(lookup[tagName][propertyName]);
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
        EventManagerImplementation.prototype.addEventListener = function (target, targetEvent, callbackOrListener, strategy) {
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
        return EventManagerImplementation;
    }());
    exports.EventManager = new EventManagerImplementation();
});



define('runtime/binding/expression',["require", "exports", "../reporter"], function (require, exports, reporter_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var cache = Object.create(null);
    exports.Expression = {
        from: function (expression) {
            var found = cache[expression];
            if (found === undefined) {
                found = this.compile(expression);
                cache[expression] = found;
            }
            return found;
        },
        primeCache: function (expressionCache) {
            Object.assign(cache, expressionCache);
        }
    };
    exports.Expression.compile = function (expression) {
        throw reporter_1.Reporter.error(3);
    };
});



define('runtime/binding/listener',["require", "exports", "./event-manager"], function (require, exports, event_manager_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var Listener = (function () {
        function Listener(targetEvent, delegationStrategy, sourceExpression, target, preventDefault, container) {
            this.targetEvent = targetEvent;
            this.delegationStrategy = delegationStrategy;
            this.sourceExpression = sourceExpression;
            this.target = target;
            this.preventDefault = preventDefault;
            this.container = container;
            this.isBound = false;
            this.targetEvent = targetEvent;
            this.delegationStrategy = delegationStrategy;
            this.sourceExpression = sourceExpression;
            this.target = target;
            this.preventDefault = preventDefault;
            this.container = container;
        }
        Listener.prototype.callSource = function (event) {
            var overrideContext = this.source.overrideContext;
            overrideContext['$event'] = event;
            var mustEvaluate = true;
            var result = this.sourceExpression.evaluate(this.source, this.container, mustEvaluate);
            delete overrideContext['$event'];
            if (result !== true && this.preventDefault) {
                event.preventDefault();
            }
            return result;
        };
        Listener.prototype.handleEvent = function (event) {
            this.callSource(event);
        };
        Listener.prototype.bind = function (source) {
            if (this.isBound) {
                if (this.source === source) {
                    return;
                }
                this.unbind();
            }
            this.isBound = true;
            this.source = source;
            if (this.sourceExpression.bind) {
                this.sourceExpression.bind(this, source);
            }
            this.handler = event_manager_1.EventManager.addEventListener(this.target, this.targetEvent, this, this.delegationStrategy);
        };
        Listener.prototype.unbind = function () {
            if (!this.isBound) {
                return;
            }
            this.isBound = false;
            if (this.sourceExpression.unbind) {
                this.sourceExpression.unbind(this, this.source);
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
    function getMapObserver(map) {
        return ModifyMapObserver.for(map);
    }
    exports.getMapObserver = getMapObserver;
    var ModifyMapObserver = (function (_super) {
        __extends(ModifyMapObserver, _super);
        function ModifyMapObserver(map) {
            return _super.call(this, map) || this;
        }
        ModifyMapObserver.for = function (map) {
            if (!('__map_observer__' in map)) {
                Reflect.defineProperty(map, '__map_observer__', {
                    value: ModifyMapObserver.create(map),
                    enumerable: false, configurable: false
                });
            }
            return map.__map_observer__;
        };
        ModifyMapObserver.create = function (map) {
            var observer = new ModifyMapObserver(map);
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
            return observer;
        };
        return ModifyMapObserver;
    }(collection_observation_1.ModifyCollectionObserver));
});



define('runtime/binding/observation',["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
});



define('runtime/binding/observer-locator',["require", "exports", "../pal", "./array-observation", "./map-observation", "./set-observation", "./event-manager", "./dirty-checker", "./property-observation", "./select-value-observer", "./checked-observer", "./element-observation", "./class-observer", "./svg-analyzer", "../reporter", "../di"], function (require, exports, pal_1, array_observation_1, map_observation_1, set_observation_1, event_manager_1, dirty_checker_1, property_observation_1, select_value_observer_1, checked_observer_1, element_observation_1, class_observer_1, svg_analyzer_1, reporter_1, di_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.IObserverLocator = di_1.DI.createInterface('IObserverLocator');
    function getPropertyDescriptor(subject, name) {
        var pd = Object.getOwnPropertyDescriptor(subject, name);
        var proto = Object.getPrototypeOf(subject);
        while (typeof pd === 'undefined' && proto !== null) {
            pd = Object.getOwnPropertyDescriptor(proto, name);
            proto = Object.getPrototypeOf(proto);
        }
        return pd;
    }
    var ObserverLocatorImplementation = (function () {
        function ObserverLocatorImplementation() {
            this.adapters = [];
        }
        ObserverLocatorImplementation.prototype.getObserver = function (obj, propertyName) {
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
        ObserverLocatorImplementation.prototype.getOrCreateObserversLookup = function (obj) {
            return obj.$observers || this.createObserversLookup(obj);
        };
        ObserverLocatorImplementation.prototype.createObserversLookup = function (obj) {
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
        ObserverLocatorImplementation.prototype.addAdapter = function (adapter) {
            this.adapters.push(adapter);
        };
        ObserverLocatorImplementation.prototype.getAdapterObserver = function (obj, propertyName, descriptor) {
            for (var i = 0, ii = this.adapters.length; i < ii; i++) {
                var adapter = this.adapters[i];
                var observer = adapter.getObserver(obj, propertyName, descriptor);
                if (observer) {
                    return observer;
                }
            }
            return null;
        };
        ObserverLocatorImplementation.prototype.createPropertyObserver = function (obj, propertyName) {
            var descriptor;
            var handler;
            var xlinkResult;
            if (!(obj instanceof Object)) {
                return new property_observation_1.PrimitiveObserver(obj, propertyName);
            }
            if (obj instanceof pal_1.DOM.Element) {
                if (propertyName === 'class') {
                    return new class_observer_1.ClassObserver(obj);
                }
                if (propertyName === 'style' || propertyName === 'css') {
                    return new element_observation_1.StyleObserver(obj, propertyName);
                }
                handler = event_manager_1.EventManager.getElementHandler(obj, propertyName);
                if (propertyName === 'value' && obj.tagName.toLowerCase() === 'select') {
                    return new select_value_observer_1.SelectValueObserver(obj, handler, this);
                }
                if (propertyName === 'checked' && obj.tagName.toLowerCase() === 'input') {
                    return new checked_observer_1.CheckedObserver(obj, handler, this);
                }
                if (handler) {
                    return new element_observation_1.ValueAttributeObserver(obj, propertyName, handler);
                }
                xlinkResult = /^xlink:(.+)$/.exec(propertyName);
                if (xlinkResult) {
                    return new element_observation_1.XLinkAttributeObserver(obj, propertyName, xlinkResult[1]);
                }
                if (propertyName === 'role' && (obj instanceof pal_1.DOM.Element || obj instanceof pal_1.DOM.SVGElement)
                    || /^\w+:|^data-|^aria-/.test(propertyName)
                    || obj instanceof pal_1.DOM.SVGElement && svg_analyzer_1.SVGAnalyzer.isStandardSvgAttribute(obj.nodeName, propertyName)) {
                    return new element_observation_1.DataAttributeObserver(obj, propertyName);
                }
            }
            descriptor = getPropertyDescriptor(obj, propertyName);
            if (descriptor) {
                var existingGetterOrSetter = descriptor.get || descriptor.set;
                if (existingGetterOrSetter) {
                    if (existingGetterOrSetter.getObserver) {
                        return existingGetterOrSetter.getObserver(obj);
                    }
                    var adapterObserver = this.getAdapterObserver(obj, propertyName, descriptor);
                    if (adapterObserver) {
                        return adapterObserver;
                    }
                    return dirty_checker_1.DirtyChecker.createProperty(obj, propertyName);
                }
            }
            if (obj instanceof Array) {
                if (propertyName === 'length') {
                    return this.getArrayObserver(obj).getLengthObserver();
                }
                return dirty_checker_1.DirtyChecker.createProperty(obj, propertyName);
            }
            else if (obj instanceof Map) {
                if (propertyName === 'size') {
                    return this.getMapObserver(obj).getLengthObserver();
                }
                return dirty_checker_1.DirtyChecker.createProperty(obj, propertyName);
            }
            else if (obj instanceof Set) {
                if (propertyName === 'size') {
                    return this.getSetObserver(obj).getLengthObserver();
                }
                return dirty_checker_1.DirtyChecker.createProperty(obj, propertyName);
            }
            return new property_observation_1.SetterObserver(obj, propertyName);
        };
        ObserverLocatorImplementation.prototype.getAccessor = function (obj, propertyName) {
            if (obj instanceof pal_1.DOM.Element) {
                if (propertyName === 'class'
                    || propertyName === 'style' || propertyName === 'css'
                    || propertyName === 'value' && (obj.tagName.toLowerCase() === 'input' || obj.tagName.toLowerCase() === 'select')
                    || propertyName === 'checked' && obj.tagName.toLowerCase() === 'input'
                    || propertyName === 'model' && obj.tagName.toLowerCase() === 'input'
                    || /^xlink:.+$/.exec(propertyName)) {
                    return this.getObserver(obj, propertyName);
                }
                if (/^\w+:|^data-|^aria-/.test(propertyName)
                    || obj instanceof pal_1.DOM.SVGElement && svg_analyzer_1.SVGAnalyzer.isStandardSvgAttribute(obj.nodeName, propertyName)
                    || obj.tagName.toLowerCase() === 'img' && propertyName === 'src'
                    || obj.tagName.toLowerCase() === 'a' && propertyName === 'href') {
                    return element_observation_1.dataAttributeAccessor;
                }
            }
            return property_observation_1.propertyAccessor;
        };
        ObserverLocatorImplementation.prototype.getArrayObserver = function (array) {
            return array_observation_1.getArrayObserver(array);
        };
        ObserverLocatorImplementation.prototype.getMapObserver = function (map) {
            return map_observation_1.getMapObserver(map);
        };
        ObserverLocatorImplementation.prototype.getSetObserver = function (set) {
            return set_observation_1.getSetObserver(set);
        };
        return ObserverLocatorImplementation;
    }());
    exports.ObserverLocator = new ObserverLocatorImplementation();
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
define('runtime/binding/property-observation',["require", "exports", "./subscriber-collection", "../task-queue", "../reporter"], function (require, exports, subscriber_collection_1, task_queue_1, reporter_1) {
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
            var type = typeof this.primitive;
            throw new Error("The " + this.propertyName + " property of a " + type + " (" + this.primitive + ") cannot be assigned.");
        };
        PrimitiveObserver.prototype.subscribe = function () { };
        PrimitiveObserver.prototype.unsubscribe = function () { };
        return PrimitiveObserver;
    }());
    exports.PrimitiveObserver = PrimitiveObserver;
    var SetterObserver = (function (_super) {
        __extends(SetterObserver, _super);
        function SetterObserver(obj, propertyName) {
            var _this = _super.call(this) || this;
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
                    task_queue_1.TaskQueue.queueMicroTask(this);
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
        function Observer(currentValue, selfCallback) {
            var _this = _super.call(this) || this;
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
                    task_queue_1.TaskQueue.queueMicroTask(this);
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



define('runtime/binding/ref',["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var Ref = (function () {
        function Ref(sourceExpression, target, container) {
            this.sourceExpression = sourceExpression;
            this.target = target;
            this.container = container;
            this.isBound = false;
        }
        Ref.prototype.bind = function (source) {
            if (this.isBound) {
                if (this.source === source) {
                    return;
                }
                this.unbind();
            }
            this.isBound = true;
            this.source = source;
            if (this.sourceExpression.bind) {
                this.sourceExpression.bind(this, source);
            }
            this.sourceExpression.assign(this.source, this.target, this.container);
        };
        Ref.prototype.unbind = function () {
            if (!this.isBound) {
                return;
            }
            this.isBound = false;
            if (this.sourceExpression.evaluate(this.source, this.container) === this.target) {
                this.sourceExpression.assign(this.source, null, this.container);
            }
            if (this.sourceExpression.unbind) {
                this.sourceExpression.unbind(this, this.source);
            }
            this.source = null;
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
define('runtime/binding/select-value-observer',["require", "exports", "./subscriber-collection", "../pal", "../task-queue"], function (require, exports, subscriber_collection_1, pal_1, task_queue_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var selectArrayContext = 'SelectValueObserver:array';
    var SelectValueObserver = (function (_super) {
        __extends(SelectValueObserver, _super);
        function SelectValueObserver(element, handler, observerLocator) {
            var _this = _super.call(this) || this;
            _this.element = element;
            _this.handler = handler;
            _this.observerLocator = observerLocator;
            _this.initialSync = false;
            _this.element = element;
            _this.handler = handler;
            _this.observerLocator = observerLocator;
            return _this;
        }
        SelectValueObserver.prototype.getValue = function () {
            return this.value;
        };
        SelectValueObserver.prototype.setValue = function (newValue) {
            if (newValue !== null && newValue !== undefined && this.element.multiple && !Array.isArray(newValue)) {
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
                task_queue_1.TaskQueue.queueMicroTask(this);
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
            var options = this.element.options;
            var i = options.length;
            var matcher = this.element.matcher || (function (a, b) { return a === b; });
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
            var options = this.element.options;
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
            if (this.element.multiple) {
                if (Array.isArray(this.value)) {
                    var matcher_1 = this.element.matcher || (function (a, b) { return a === b; });
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
                this.handler.subscribe(this.element, this);
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
            this.domObserver = pal_1.DOM.createMutationObserver(function () {
                _this.synchronizeOptions();
                _this.synchronizeValue();
            });
            this.domObserver.observe(this.element, { childList: true, subtree: true, characterData: true });
        };
        SelectValueObserver.prototype.unbind = function () {
            this.domObserver.disconnect();
            this.domObserver = null;
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
    function getSetObserver(set) {
        return ModifySetObserver.for(set);
    }
    exports.getSetObserver = getSetObserver;
    var ModifySetObserver = (function (_super) {
        __extends(ModifySetObserver, _super);
        function ModifySetObserver(set) {
            return _super.call(this, set) || this;
        }
        ModifySetObserver.for = function (set) {
            if (!('__set_observer__' in set)) {
                Reflect.defineProperty(set, '__set_observer__', {
                    value: ModifySetObserver.create(set),
                    enumerable: false, configurable: false
                });
            }
            return set.__set_observer__;
        };
        ModifySetObserver.create = function (set) {
            var observer = new ModifySetObserver(set);
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
        };
        return ModifySetObserver;
    }(collection_observation_1.ModifyCollectionObserver));
});



define('runtime/binding/signal',["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var signals = {};
    exports.Signal = {
        connect: function (binding, signalName) {
            if (!signals.hasOwnProperty(signalName)) {
                signals[signalName] = 0;
            }
            binding.observeProperty(signals, signalName);
        },
        notify: function (signalName) {
            if (signals.hasOwnProperty(signalName)) {
                signals[signalName]++;
            }
        }
    };
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
            if (callables === undefined || callables.length === 0) {
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
                    var context = contextsRest[i];
                    if (callable) {
                        callable.call(context, newValue, oldValue);
                    }
                    else {
                        context(newValue, oldValue);
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



define('runtime/binding/svg-analyzer',["require", "exports", "../di"], function (require, exports, di_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ISVGAnalyzer = di_1.DI.createInterface('ISVGAnalyzer');
    exports.SVGAnalyzer = {
        isStandardSvgAttribute: function (nodeName, attributeName) {
            return false;
        }
    };
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
define('runtime/resources/else',["require", "exports", "./if-core", "../templating/view-engine", "../templating/view-slot", "../decorators"], function (require, exports, if_core_1, view_engine_1, view_slot_1, decorators_1) {
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
            decorators_1.customAttribute('else'),
            decorators_1.templateController,
            decorators_1.inject(view_engine_1.IViewFactory, view_slot_1.ViewSlot)
        ], Else);
        return Else;
    }(if_core_1.IfCore));
    exports.Else = Else;
});



define('runtime/resources/if-core',["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var IfCore = (function () {
        function IfCore(viewFactory, viewSlot) {
            this.viewFactory = viewFactory;
            this.viewSlot = viewSlot;
            this.visual = null;
            this.$scope = null;
            this.showing = false;
        }
        IfCore.prototype.attached = function () {
            this.viewSlot.attach();
        };
        IfCore.prototype.detached = function () {
            this.viewSlot.detach();
        };
        IfCore.prototype.unbound = function () {
            if (this.visual === null) {
                return;
            }
            this.visual.unbind();
            if (this.showing) {
                this.showing = false;
                this.viewSlot.remove(this.visual, true);
            }
            this.visual = null;
        };
        IfCore.prototype.show = function () {
            if (this.showing) {
                if (!this.visual.$isBound) {
                    this.visual.bind(this.$scope);
                }
                return;
            }
            if (this.visual === null) {
                this.visual = this.viewFactory.create();
            }
            if (!this.visual.$isBound) {
                this.visual.bind(this.$scope);
            }
            this.showing = true;
            return this.viewSlot.add(this.visual);
        };
        IfCore.prototype.hide = function () {
            var _this = this;
            if (!this.showing) {
                return;
            }
            this.showing = false;
            var removed = this.viewSlot.remove(this.visual);
            if (removed instanceof Promise) {
                return removed.then(function () { return _this.visual.unbind(); });
            }
            this.visual.unbind();
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
define('runtime/resources/if',["require", "exports", "./if-core", "../templating/view-engine", "../templating/view-slot", "../decorators"], function (require, exports, if_core_1, view_engine_1, view_slot_1, decorators_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var If = (function (_super) {
        __extends(If, _super);
        function If() {
            var _this = _super !== null && _super.apply(this, arguments) || this;
            _this.animating = false;
            _this.swapOrder = 'after';
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
                case 'before':
                    return Promise.resolve(add.show()).then(function () { return remove.hide(); });
                case 'with':
                    return Promise.all([remove.hide(), add.show()]);
                default:
                    var promise = remove.hide();
                    return promise ? promise.then(function () { return add.show(); }) : add.show();
            }
        };
        __decorate([
            decorators_1.bindable,
            __metadata("design:type", String)
        ], If.prototype, "swapOrder", void 0);
        __decorate([
            decorators_1.bindable,
            __metadata("design:type", Boolean)
        ], If.prototype, "condition", void 0);
        If = __decorate([
            decorators_1.customAttribute('if'),
            decorators_1.templateController,
            decorators_1.inject(view_engine_1.IViewFactory, view_slot_1.ViewSlot)
        ], If);
        return If;
    }(if_core_1.IfCore));
    exports.If = If;
});



define('runtime/templating/animator',["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var Animator = (function () {
        function Animator() {
        }
        Animator.prototype.enter = function (element) {
            return Promise.resolve(false);
        };
        Animator.prototype.leave = function (element) {
            return Promise.resolve(false);
        };
        Animator.prototype.removeClass = function (element, className) {
            element.classList.remove(className);
            return Promise.resolve(false);
        };
        Animator.prototype.addClass = function (element, className) {
            element.classList.add(className);
            return Promise.resolve(false);
        };
        Animator.prototype.animate = function (element, className) {
            return Promise.resolve(false);
        };
        Animator.prototype.runSequence = function (animations) {
            return Promise.resolve(true);
        };
        Animator.prototype.registerEffect = function (effectName, properties) { };
        Animator.prototype.unregisterEffect = function (effectName) { };
        Animator.instance = new Animator();
        return Animator;
    }());
    exports.Animator = Animator;
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
define('runtime/templating/component',["require", "exports", "./view-engine", "./view", "../task-queue", "../binding/property-observation", "./shadow-dom", "../pal", "../di", "../binding/binding-context"], function (require, exports, view_engine_1, view_1, task_queue_1, property_observation_1, shadow_dom_1, pal_1, di_1, binding_context_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var RuntimeCharacteristics = (function () {
        function RuntimeCharacteristics() {
            this.observables = [];
            this.hasCreated = false;
            this.hasBound = false;
            this.hasAttaching = false;
            this.hasAttached = false;
            this.hasDetaching = false;
            this.hasDetached = false;
            this.hasUnbound = false;
        }
        RuntimeCharacteristics.for = function (instance, Component) {
            var characteristics = new RuntimeCharacteristics();
            var configuredObservables = Component.observables;
            var observables = [];
            for (var key in instance) {
                if (configuredObservables) {
                    var found = configuredObservables[key];
                    if (found) {
                        if (found.changeHandler in instance) {
                            observables.push(found);
                        }
                        continue;
                    }
                }
                if (key + "Changed" in instance) {
                    observables.push({
                        name: key,
                        changeHandler: key + "Changed"
                    });
                }
            }
            characteristics.observables = observables;
            characteristics.hasCreated = 'created' in instance;
            characteristics.hasBound = 'bound' in instance;
            characteristics.hasAttaching = 'attaching' in instance;
            characteristics.hasAttached = 'attached' in instance;
            characteristics.hasDetaching = 'detaching' in instance;
            characteristics.hasDetached = 'detached' in instance;
            characteristics.hasUnbound = 'unbound' in instance;
            return characteristics;
        };
        return RuntimeCharacteristics;
    }());
    exports.Component = {
        valueConverter: function (nameOrSource, ctor) {
            ctor.source = ensureSource(nameOrSource);
            ctor.register = function (container) {
                container.register(di_1.Registration.singleton(name, ctor));
            };
            return ctor;
        },
        bindingBehavior: function (nameOrSource, ctor) {
            ctor.source = ensureSource(nameOrSource);
            ctor.register = function (container) {
                container.register(di_1.Registration.singleton(name, ctor));
            };
            return ctor;
        },
        attribute: function (nameOrSource, ctor) {
            var source = ensureSource(nameOrSource);
            return _a = (function (_super) {
                    __extends(CustomAttribute, _super);
                    function CustomAttribute() {
                        var args = [];
                        for (var _i = 0; _i < arguments.length; _i++) {
                            args[_i] = arguments[_i];
                        }
                        var _this = _super.apply(this, args) || this;
                        _this.$changeCallbacks = [];
                        _this.$characteristics = null;
                        _this.$isBound = false;
                        _this.$scope = null;
                        discoverAndApplyCharacteristics(_this, CustomAttribute);
                        if (_this.$characteristics.hasCreated) {
                            _this.created();
                        }
                        return _this;
                    }
                    CustomAttribute.register = function (container) {
                        container.register(di_1.Registration.transient(source.name, CustomAttribute));
                        var aliases = source.aliases;
                        if (aliases) {
                            for (var i = 0, ii = aliases.length; i < ii; ++i) {
                                container.register(di_1.Registration.transient(aliases[i], CustomAttribute));
                            }
                        }
                    };
                    CustomAttribute.prototype.bind = function (scope) {
                        this.$scope = scope;
                        this.$isBound = true;
                        var changeCallbacks = this.$changeCallbacks;
                        for (var i = 0, ii = changeCallbacks.length; i < ii; ++i) {
                            changeCallbacks[i]();
                        }
                        if (this.$characteristics.hasBound) {
                            this.bound(scope);
                        }
                    };
                    CustomAttribute.prototype.attach = function () {
                        var _this = this;
                        if (this.$characteristics.hasAttaching) {
                            this.attaching();
                        }
                        if (this.$characteristics.hasAttached) {
                            task_queue_1.TaskQueue.queueMicroTask(function () { return _this.attached(); });
                        }
                    };
                    CustomAttribute.prototype.detach = function () {
                        var _this = this;
                        if (this.$characteristics.hasDetaching) {
                            this.detaching();
                        }
                        if (this.$characteristics.hasDetached) {
                            task_queue_1.TaskQueue.queueMicroTask(function () { return _this.detached(); });
                        }
                    };
                    CustomAttribute.prototype.unbind = function () {
                        if (this.$characteristics.hasUnbound) {
                            this.unbound();
                        }
                        this.$isBound = false;
                    };
                    return CustomAttribute;
                }(ctor)),
                _a.source = source,
                _a;
            var _a;
        },
        elementFromCompiledSource: function (source, ctor) {
            if (ctor === void 0) { ctor = null; }
            if (ctor === null) {
                ctor = (function () {
                    function HTMLOnlyElement() {
                    }
                    return HTMLOnlyElement;
                }());
            }
            source.shadowOptions = source.shadowOptions || ctor.shadowOptions || null;
            source.containerless = source.containerless || ctor.containerless || false;
            var observables = source.observables;
            if (observables) {
                var observableRecord = ctor.observables || {};
                for (var i = 0, ii = observables.length; i < ii; ++i) {
                    var current = observables[i];
                    observableRecord[current.name] = current;
                }
            }
            var template = view_engine_1.ViewEngine.templateFromCompiledSource(source);
            var CompiledComponent = (_a = (function (_super) {
                    __extends(class_1, _super);
                    function class_1() {
                        var args = [];
                        for (var _i = 0; _i < arguments.length; _i++) {
                            args[_i] = arguments[_i];
                        }
                        var _this = _super.apply(this, args) || this;
                        _this.$bindable = [];
                        _this.$attachable = [];
                        _this.$slots = source.hasSlots ? {} : null;
                        _this.$useShadowDOM = source.shadowOptions && pal_1.FEATURE.shadowDOM;
                        _this.$contentView = null;
                        _this.$isBound = false;
                        _this.$scope = {
                            bindingContext: _this,
                            overrideContext: binding_context_1.BindingContext.createOverride()
                        };
                        _this.$changeCallbacks = [];
                        _this.$characteristics = null;
                        discoverAndApplyCharacteristics(_this, CompiledComponent);
                        return _this;
                    }
                    class_1.register = function (container) {
                        container.register(di_1.Registration.transient(source.name, CompiledComponent));
                    };
                    class_1.prototype.applyTo = function (host) {
                        this.$host = source.containerless
                            ? pal_1.DOM.makeElementIntoAnchor(host, true)
                            : host;
                        this.$shadowRoot = this.$useShadowDOM
                            ? host.attachShadow(source.shadowOptions)
                            : this.$host;
                        this.$view = this.createView(this.$host);
                        if (this.$characteristics.hasCreated) {
                            this.created();
                        }
                        return this;
                    };
                    class_1.prototype.createView = function (host) {
                        return template.createFor(this, host);
                    };
                    class_1.prototype.bind = function () {
                        var scope = this.$scope;
                        var bindable = this.$bindable;
                        for (var i = 0, ii = bindable.length; i < ii; ++i) {
                            bindable[i].bind(scope);
                        }
                        if (this.$contentView !== view_1.View.none) {
                            shadow_dom_1.ShadowDOM.distributeView(this.$contentView, this.$slots);
                        }
                        this.$isBound = true;
                        var changeCallbacks = this.$changeCallbacks;
                        for (var i = 0, ii = changeCallbacks.length; i < ii; ++i) {
                            changeCallbacks[i]();
                        }
                        if (this.$characteristics.hasBound) {
                            this.bound();
                        }
                    };
                    class_1.prototype.attach = function () {
                        var _this = this;
                        if (this.$characteristics.hasAttaching) {
                            this.attaching();
                        }
                        var attachable = this.$attachable;
                        for (var i = 0, ii = attachable.length; i < ii; ++i) {
                            attachable[i].attach();
                        }
                        if (source.containerless) {
                            this.$view.insertBefore(this.$host);
                        }
                        else {
                            this.$view.appendTo(this.$shadowRoot);
                        }
                        if (this.$characteristics.hasAttached) {
                            task_queue_1.TaskQueue.queueMicroTask(function () { return _this.attached(); });
                        }
                    };
                    class_1.prototype.detach = function () {
                        var _this = this;
                        if (this.$characteristics.hasDetaching) {
                            this.detaching();
                        }
                        this.$view.remove();
                        var attachable = this.$attachable;
                        var i = attachable.length;
                        while (i--) {
                            attachable[i].detach();
                        }
                        if (this.$characteristics.hasDetached) {
                            task_queue_1.TaskQueue.queueMicroTask(function () { return _this.detached(); });
                        }
                    };
                    class_1.prototype.unbind = function () {
                        var bindable = this.$bindable;
                        var i = bindable.length;
                        while (i--) {
                            bindable[i].unbind();
                        }
                        if (this.$characteristics.hasUnbound) {
                            this.unbound();
                        }
                        this.$isBound = false;
                    };
                    return class_1;
                }(ctor)),
                _a.template = template,
                _a.source = source,
                _a);
            CompiledComponent.register(template.container);
            return CompiledComponent;
            var _a;
        }
    };
    function discoverAndApplyCharacteristics(instance, Component) {
        var characteristics = Component.characteristics;
        if (characteristics === undefined) {
            characteristics = Component.characteristics = RuntimeCharacteristics.for(instance, Component);
        }
        var observables = characteristics.observables;
        var observers = {};
        var _loop_1 = function (i, ii) {
            var observerConfig = observables[i];
            var name_1 = observerConfig.name;
            var changeHandler = observerConfig.changeHandler;
            observers[name_1] = new property_observation_1.Observer(instance[name_1], function (v) { return instance.$isBound ? instance[changeHandler](v) : void 0; });
            instance.$changeCallbacks.push(function () { return instance[changeHandler](instance[name_1]); });
            createGetterSetter(instance, name_1);
        };
        for (var i = 0, ii = observables.length; i < ii; ++i) {
            _loop_1(i, ii);
        }
        instance.$characteristics = characteristics;
        Object.defineProperty(instance, '$observers', {
            enumerable: false,
            value: observers
        });
    }
    function createGetterSetter(instance, name) {
        Object.defineProperty(instance, name, {
            enumerable: true,
            get: function () { return this.$observers[name].getValue(); },
            set: function (value) { this.$observers[name].setValue(value); }
        });
    }
    function ensureSource(nameOrSource) {
        var source;
        if (typeof nameOrSource === 'string') {
            source = { name: source };
        }
        else {
            source = nameOrSource;
        }
        return source;
    }
});



define('runtime/templating/shadow-dom',["require", "exports", "../pal"], function (require, exports, pal_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var noNodes = Object.freeze([]);
    var SlotCustomAttribute = (function () {
        function SlotCustomAttribute(element) {
            this.element = element;
            this.element = element;
            this.element.auSlotAttribute = this;
        }
        return SlotCustomAttribute;
    }());
    var PassThroughSlot = (function () {
        function PassThroughSlot(owner, anchor, name, destinationName, fallbackFactory) {
            this.owner = owner;
            this.anchor = anchor;
            this.name = name;
            this.destinationName = destinationName;
            this.fallbackFactory = fallbackFactory;
            this.projections = 0;
            this.contentView = null;
            this.destinationSlot = null;
            this.anchor.viewSlot = this;
            var attr = new SlotCustomAttribute(this.anchor);
            attr.value = this.destinationName;
        }
        Object.defineProperty(PassThroughSlot.prototype, "needsFallbackRendering", {
            get: function () {
                return this.fallbackFactory && this.projections === 0;
            },
            enumerable: true,
            configurable: true
        });
        PassThroughSlot.prototype.renderFallbackContent = function (view, nodes, projectionSource, index) {
            if (index === void 0) { index = 0; }
            if (this.contentView === null) {
                this.contentView = this.fallbackFactory.create();
                this.contentView.bind(this.owner.$scope);
                var slots = Object.create(null);
                slots[this.destinationSlot.name] = this.destinationSlot;
                exports.ShadowDOM.distributeView(this.contentView.$view, slots, projectionSource, index, this.destinationSlot.name);
            }
        };
        PassThroughSlot.prototype.passThroughTo = function (destinationSlot) {
            this.destinationSlot = destinationSlot;
        };
        PassThroughSlot.prototype.addNode = function (view, node, projectionSource, index) {
            if (this.contentView !== null) {
                this.contentView.$view.remove();
                this.contentView.detach();
                this.contentView.unbind();
                this.contentView = null;
            }
            if (node.viewSlot instanceof PassThroughSlot) {
                node.viewSlot.passThroughTo(this);
                return;
            }
            this.projections++;
            this.destinationSlot.addNode(view, node, projectionSource, index);
        };
        PassThroughSlot.prototype.removeView = function (view, projectionSource) {
            this.projections--;
            this.destinationSlot.removeView(view, projectionSource);
            if (this.needsFallbackRendering) {
                this.renderFallbackContent(null, noNodes, projectionSource);
            }
        };
        PassThroughSlot.prototype.removeAll = function (projectionSource) {
            this.projections = 0;
            this.destinationSlot.removeAll(projectionSource);
            if (this.needsFallbackRendering) {
                this.renderFallbackContent(null, noNodes, projectionSource);
            }
        };
        PassThroughSlot.prototype.projectFrom = function (view, projectionSource) {
            this.destinationSlot.projectFrom(view, projectionSource);
        };
        PassThroughSlot.prototype.bind = function (scope) {
            if (this.contentView !== null) {
                this.contentView.bind(scope);
            }
        };
        PassThroughSlot.prototype.attach = function () {
            if (this.contentView !== null) {
                this.contentView.attach();
            }
        };
        PassThroughSlot.prototype.detach = function () {
            if (this.contentView !== null) {
                this.contentView.detach();
            }
        };
        PassThroughSlot.prototype.unbind = function () {
            if (this.contentView !== null) {
                this.contentView.unbind();
            }
        };
        return PassThroughSlot;
    }());
    var ShadowSlot = (function () {
        function ShadowSlot(owner, anchor, name, fallbackFactory) {
            this.owner = owner;
            this.anchor = anchor;
            this.name = name;
            this.fallbackFactory = fallbackFactory;
            this.contentView = null;
            this.projections = 0;
            this.children = [];
            this.projectFromAnchors = null;
            this.destinationSlots = null;
            this.anchor.isContentProjectionSource = true;
            this.anchor.viewSlot = this;
        }
        Object.defineProperty(ShadowSlot.prototype, "needsFallbackRendering", {
            get: function () {
                return this.fallbackFactory && this.projections === 0;
            },
            enumerable: true,
            configurable: true
        });
        ShadowSlot.prototype.addNode = function (view, node, projectionSource, index, destination) {
            if (this.contentView !== null) {
                this.contentView.$view.remove();
                this.contentView.detach();
                this.contentView.unbind();
                this.contentView = null;
            }
            if (node.viewSlot instanceof PassThroughSlot) {
                node.viewSlot.passThroughTo(this);
                return;
            }
            if (this.destinationSlots !== null) {
                exports.ShadowDOM.distributeNodes(view, [node], this.destinationSlots, this, index);
            }
            else {
                node.auOwnerView = view;
                node.auProjectionSource = projectionSource;
                node.auAssignedSlot = this;
                var anchor = this.findAnchor(view, node, projectionSource, index);
                var parent_1 = anchor.parentNode;
                parent_1.insertBefore(node, anchor);
                this.children.push(node);
                this.projections++;
            }
        };
        ShadowSlot.prototype.removeView = function (view, projectionSource) {
            if (this.destinationSlots !== null) {
                exports.ShadowDOM.undistributeView(view, this.destinationSlots, this);
            }
            else if (this.contentView && this.contentView.$slots) {
                exports.ShadowDOM.undistributeView(view, this.contentView.$slots, projectionSource);
            }
            else {
                var found = this.children.find(function (x) { return x.auSlotProjectFrom === projectionSource; });
                if (found) {
                    var children = found.auProjectionChildren;
                    for (var i = 0, ii = children.length; i < ii; ++i) {
                        var child = children[i];
                        if (child.auOwnerView === view) {
                            children.splice(i, 1);
                            view.appendChild(child);
                            i--;
                            ii--;
                            this.projections--;
                        }
                    }
                    if (this.needsFallbackRendering) {
                        this.renderFallbackContent(view, noNodes, projectionSource);
                    }
                }
            }
        };
        ShadowSlot.prototype.removeAll = function (projectionSource) {
            if (this.destinationSlots !== null) {
                exports.ShadowDOM.undistributeAll(this.destinationSlots, this);
            }
            else if (this.contentView && this.contentView.$slots) {
                exports.ShadowDOM.undistributeAll(this.contentView.$slots, projectionSource);
            }
            else {
                var found = this.children.find(function (x) { return x.auSlotProjectFrom === projectionSource; });
                if (found) {
                    var children = found.auProjectionChildren;
                    for (var i = 0, ii = children.length; i < ii; ++i) {
                        var child = children[i];
                        child.auOwnerView.appendChild(child);
                        this.projections--;
                    }
                    found.auProjectionChildren = [];
                    if (this.needsFallbackRendering) {
                        this.renderFallbackContent(null, noNodes, projectionSource);
                    }
                }
            }
        };
        ShadowSlot.prototype.findAnchor = function (view, node, projectionSource, index) {
            if (projectionSource) {
                var found = this.children.find(function (x) { return x.auSlotProjectFrom === projectionSource; });
                if (found) {
                    if (index !== undefined) {
                        var children = found.auProjectionChildren;
                        var viewIndex = -1;
                        var lastView = void 0;
                        for (var i = 0, ii = children.length; i < ii; ++i) {
                            var current = children[i];
                            if (current.auOwnerView !== lastView) {
                                viewIndex++;
                                lastView = current.auOwnerView;
                                if (viewIndex >= index && lastView !== view) {
                                    children.splice(i, 0, node);
                                    return current;
                                }
                            }
                        }
                    }
                    found.auProjectionChildren.push(node);
                    return found;
                }
            }
            return this.anchor;
        };
        ShadowSlot.prototype.projectTo = function (slots) {
            this.destinationSlots = slots;
        };
        ShadowSlot.prototype.projectFrom = function (view, projectionSource) {
            var anchor = pal_1.DOM.createComment('anchor');
            var parent = this.anchor.parentNode;
            anchor.auSlotProjectFrom = projectionSource;
            anchor.auOwnerView = view;
            anchor.auProjectionChildren = [];
            parent.insertBefore(anchor, this.anchor);
            this.children.push(anchor);
            if (this.projectFromAnchors === null) {
                this.projectFromAnchors = [];
            }
            this.projectFromAnchors.push(anchor);
        };
        ShadowSlot.prototype.renderFallbackContent = function (view, nodes, projectionSource, index) {
            if (index === void 0) { index = 0; }
            if (this.contentView === null) {
                this.contentView = this.fallbackFactory.create();
                this.contentView.bind(this.owner.$scope);
                this.contentView.$view.insertBefore(this.anchor);
            }
            if (this.contentView.$slots) {
                var slots = this.contentView.$slots;
                var projectFromAnchors = this.projectFromAnchors;
                if (projectFromAnchors !== null) {
                    for (var slotName in slots) {
                        var slot = slots[slotName];
                        for (var i = 0, ii = projectFromAnchors.length; i < ii; ++i) {
                            var anchor = projectFromAnchors[i];
                            slot.projectFrom(anchor.auOwnerView, anchor.auSlotProjectFrom);
                        }
                    }
                }
                this.fallbackSlots = slots;
                exports.ShadowDOM.distributeNodes(view, nodes, slots, projectionSource, index);
            }
        };
        ShadowSlot.prototype.bind = function (scope) {
            if (this.contentView !== null) {
                this.contentView.bind(scope);
            }
        };
        ShadowSlot.prototype.attach = function () {
            if (this.contentView !== null) {
                this.contentView.attach();
            }
        };
        ShadowSlot.prototype.detach = function () {
            if (this.contentView !== null) {
                this.contentView.detach();
            }
        };
        ShadowSlot.prototype.unbind = function () {
            if (this.contentView !== null) {
                this.contentView.unbind();
            }
        };
        return ShadowSlot;
    }());
    exports.ShadowDOM = {
        defaultSlotKey: '__au-default-slot-key__',
        getSlotName: function (node) {
            if (node.auSlotAttribute === undefined) {
                return this.defaultSlotKey;
            }
            return node.auSlotAttribute.value;
        },
        createSlot: function (owner, name, destination, fallbackFactory) {
            var anchor = pal_1.DOM.createComment('slot');
            if (destination) {
                return new PassThroughSlot(owner, anchor, name, destination, fallbackFactory);
            }
            else {
                return new ShadowSlot(owner, anchor, name, fallbackFactory);
            }
        },
        distributeView: function (view, slots, projectionSource, index, destinationOverride) {
            if (projectionSource === void 0) { projectionSource = null; }
            if (index === void 0) { index = 0; }
            if (destinationOverride === void 0) { destinationOverride = null; }
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
            this.distributeNodes(view, nodes, slots, projectionSource, index, destinationOverride);
        },
        undistributeView: function (view, slots, projectionSource) {
            for (var slotName in slots) {
                slots[slotName].removeView(view, projectionSource);
            }
        },
        undistributeAll: function (slots, projectionSource) {
            for (var slotName in slots) {
                slots[slotName].removeAll(projectionSource);
            }
        },
        distributeNodes: function (view, nodes, slots, projectionSource, index, destinationOverride) {
            if (destinationOverride === void 0) { destinationOverride = null; }
            for (var i = 0, ii = nodes.length; i < ii; ++i) {
                var currentNode = nodes[i];
                var nodeType = currentNode.nodeType;
                if (currentNode.isContentProjectionSource) {
                    currentNode.viewSlot.projectTo(slots);
                    for (var slotName in slots) {
                        slots[slotName].projectFrom(view, currentNode.viewSlot);
                    }
                    nodes.splice(i, 1);
                    ii--;
                    i--;
                }
                else if (nodeType === 1 || nodeType === 3 || currentNode.viewSlot instanceof PassThroughSlot) {
                    if (nodeType === 3 && pal_1.DOM.isAllWhitespace(currentNode)) {
                        nodes.splice(i, 1);
                        ii--;
                        i--;
                    }
                    else {
                        var found = slots[destinationOverride || exports.ShadowDOM.getSlotName(currentNode)];
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
                if (slot.needsFallbackRendering) {
                    slot.renderFallbackContent(view, nodes, projectionSource, index);
                }
            }
        }
    };
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
define('runtime/templating/view-engine',["require", "exports", "../pal", "./view", "../binding/binding", "./view-slot", "./shadow-dom", "../binding/listener", "../binding/call", "../binding/ref", "../binding/expression", "../di", "../binding/binding-mode"], function (require, exports, pal_1, view_1, binding_1, view_slot_1, shadow_dom_1, listener_1, call_1, ref_1, expression_1, di_1, binding_mode_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var noViewTemplate = {
        container: di_1.DI,
        createFor: function (owner, host) {
            return view_1.View.none;
        }
    };
    exports.IViewFactory = di_1.DI.createInterface('IViewFactory');
    var DefaultViewFactory = (function () {
        function DefaultViewFactory(type) {
            this.type = type;
            this.cacheSize = -1;
            this.cache = null;
            this.isCaching = false;
        }
        DefaultViewFactory.prototype.setCacheSize = function (size, doNotOverrideIfAlreadySet) {
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
        DefaultViewFactory.prototype.returnToCache = function (visual) {
            if (visual.$isAttached) {
                visual.detach();
            }
            if (visual.$isBound) {
                visual.unbind();
            }
            if (this.cache !== null && this.cache.length < this.cacheSize) {
                this.cache.push(visual);
            }
        };
        DefaultViewFactory.prototype.create = function () {
            var cache = this.cache;
            var cachedVisual = cache !== null ? (cache.pop() || null) : null;
            if (cachedVisual !== null) {
                return cachedVisual;
            }
            return new this.type();
        };
        return DefaultViewFactory;
    }());
    exports.ViewEngine = {
        templateFromCompiledSource: function (source) {
            if (source && source.template) {
                return new CompiledTemplate(source);
            }
            return noViewTemplate;
        },
        factoryFromCompiledSource: function (source) {
            var template = exports.ViewEngine.templateFromCompiledSource(source);
            var CompiledVisual = (_a = (function (_super) {
                    __extends(class_1, _super);
                    function class_1() {
                        var _this = _super !== null && _super.apply(this, arguments) || this;
                        _this.$slots = source.hasSlots ? {} : null;
                        return _this;
                    }
                    class_1.prototype.createView = function () {
                        return template.createFor(this);
                    };
                    return class_1;
                }(Visual)),
                _a.template = template,
                _a.source = source,
                _a);
            return new DefaultViewFactory(CompiledVisual);
            var _a;
        }
    };
    function applyInstruction(owner, instruction, target, container) {
        switch (instruction.type) {
            case 'oneWayText':
                var next = target.nextSibling;
                pal_1.DOM.treatNodeAsNonWhitespace(next);
                pal_1.DOM.removeNode(target);
                owner.$bindable.push(new binding_1.Binding(expression_1.Expression.from(instruction.source), next, 'textContent', binding_mode_1.BindingMode.oneWay, container));
                break;
            case 'oneWay':
                owner.$bindable.push(new binding_1.Binding(expression_1.Expression.from(instruction.source), target, instruction.target, binding_mode_1.BindingMode.oneWay, container));
                break;
            case 'fromView':
                owner.$bindable.push(new binding_1.Binding(expression_1.Expression.from(instruction.source), target, instruction.target, binding_mode_1.BindingMode.fromView, container));
                break;
            case 'twoWay':
                owner.$bindable.push(new binding_1.Binding(expression_1.Expression.from(instruction.source), target, instruction.target, binding_mode_1.BindingMode.twoWay, container));
                break;
            case 'listener':
                owner.$bindable.push(new listener_1.Listener(instruction.source, instruction.strategy, expression_1.Expression.from(instruction.target), target, instruction.preventDefault, container));
                break;
            case 'call':
                owner.$bindable.push(new call_1.Call(expression_1.Expression.from(instruction.source), target, instruction.target, container));
                break;
            case 'ref':
                owner.$bindable.push(new ref_1.Ref(expression_1.Expression.from(instruction.source), target, container));
                break;
            case 'style':
                owner.$bindable.push(new binding_1.Binding(expression_1.Expression.from(instruction.source), target.style, instruction.target, binding_mode_1.BindingMode.oneWay, container));
                break;
            case 'property':
                target[instruction.target] = instruction.value;
                break;
            case 'slot':
                if (owner.$useShadowDOM) {
                    return;
                }
                var fallbackFactory = instruction.factory;
                if (fallbackFactory === undefined && instruction.fallback) {
                    instruction.factory = fallbackFactory = exports.ViewEngine.factoryFromCompiledSource(instruction.fallback);
                }
                var slot = shadow_dom_1.ShadowDOM.createSlot(owner, instruction.name, instruction.destination, fallbackFactory);
                owner.$slots[slot.name] = slot;
                owner.$bindable.push(slot);
                owner.$attachable.push(slot);
                pal_1.DOM.replaceNode(slot.anchor, target);
                break;
            case 'element':
                var elementInstructions = instruction.instructions;
                container.element.instance = target;
                var elementModel = container.get(instruction.resource);
                elementModel.$contentView = view_1.View.fromCompiledElementContent(elementModel, target);
                elementModel.applyTo(target);
                for (var i = 0, ii = elementInstructions.length; i < ii; ++i) {
                    var current = elementInstructions[i];
                    var realTarget = current.type === 'style' || current.type === 'listener' ? target : elementModel;
                    applyInstruction(owner, current, realTarget, container);
                }
                owner.$bindable.push(elementModel);
                owner.$attachable.push(elementModel);
                break;
            case 'attribute':
                var attributeInstructions = instruction.instructions;
                container.element.instance = target;
                var attributeModel = container.get(instruction.resource);
                for (var i = 0, ii = attributeInstructions.length; i < ii; ++i) {
                    applyInstruction(owner, attributeInstructions[i], attributeModel, container);
                }
                owner.$bindable.push(attributeModel);
                owner.$attachable.push(attributeModel);
                break;
            case 'templateController':
                var templateControllerInstructions = instruction.instructions;
                var factory = instruction.factory;
                if (factory === undefined) {
                    instruction.factory = factory = exports.ViewEngine.factoryFromCompiledSource(instruction.config);
                }
                container.element.instance = target;
                container.viewFactory.instance = factory;
                container.viewSlot.instance = new view_slot_1.ViewSlot(pal_1.DOM.makeElementIntoAnchor(target), false);
                var templateControllerModel = container.get(instruction.resource);
                if (instruction.link) {
                    templateControllerModel.link(owner.$attachable[owner.$attachable.length - 1]);
                }
                for (var i = 0, ii = templateControllerInstructions.length; i < ii; ++i) {
                    applyInstruction(owner, templateControllerInstructions[i], templateControllerModel, container);
                }
                owner.$bindable.push(templateControllerModel);
                owner.$attachable.push(templateControllerModel);
                break;
        }
    }
    var FastInstance = (function () {
        function FastInstance() {
        }
        FastInstance.prototype.get = function (handler, requestor) {
            return this.instance;
        };
        return FastInstance;
    }());
    function createTemplateContainer(dependencies) {
        var container = di_1.DI.createChild();
        container.registerResolver(Element, container.element = new FastInstance());
        container.registerResolver(exports.IViewFactory, container.viewFactory = new FastInstance());
        container.registerResolver(view_slot_1.ViewSlot, container.viewSlot = new FastInstance());
        if (dependencies) {
            container.register.apply(container, dependencies);
        }
        return container;
    }
    var CompiledTemplate = (function () {
        function CompiledTemplate(source) {
            this.source = source;
            this.container = createTemplateContainer(source.dependencies);
            this.element = pal_1.DOM.createTemplateElement();
            this.element.innerHTML = source.template;
        }
        CompiledTemplate.prototype.createFor = function (owner, host) {
            var source = this.source;
            var view = view_1.View.fromCompiledTemplate(this.element);
            var targets = view.findTargets();
            var container = this.container;
            var targetInstructions = source.targetInstructions;
            for (var i = 0, ii = targets.length; i < ii; ++i) {
                var instructions = targetInstructions[i];
                var target = targets[i];
                for (var j = 0, jj = instructions.length; j < jj; ++j) {
                    applyInstruction(owner, instructions[j], target, container);
                }
            }
            if (host) {
                var surrogateInstructions = source.surrogateInstructions;
                for (var i = 0, ii = surrogateInstructions.length; i < ii; ++i) {
                    applyInstruction(owner, surrogateInstructions[i], host, container);
                }
            }
            return view;
        };
        return CompiledTemplate;
    }());
    var Visual = (function () {
        function Visual() {
            this.$bindable = [];
            this.$attachable = [];
            this.$isBound = false;
            this.$isAttached = false;
            this.$view = this.createView();
        }
        Visual.prototype.bind = function (scope) {
            this.$scope = scope;
            var bindable = this.$bindable;
            for (var i = 0, ii = bindable.length; i < ii; ++i) {
                bindable[i].bind(scope);
            }
            this.$isBound = true;
        };
        Visual.prototype.attach = function () {
            var attachable = this.$attachable;
            for (var i = 0, ii = attachable.length; i < ii; ++i) {
                attachable[i].attach();
            }
            this.$isAttached = true;
        };
        Visual.prototype.detach = function () {
            var attachable = this.$attachable;
            var i = attachable.length;
            while (i--) {
                attachable[i].detach();
            }
            this.$isAttached = false;
        };
        Visual.prototype.unbind = function () {
            var bindable = this.$bindable;
            var i = bindable.length;
            while (i--) {
                bindable[i].unbind();
            }
            this.$isBound = false;
        };
        return Visual;
    }());
});



define('runtime/templating/view-slot',["require", "exports", "./animator", "./shadow-dom"], function (require, exports, animator_1, shadow_dom_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    function getAnimatableElement(visual) {
        var view = visual.$view;
        if (view['$animatableElement'] !== undefined) {
            return view['$animatableElement'];
        }
        var current = view.firstChild;
        while (current && current.nodeType !== 1) {
            current = current.nextSibling;
        }
        if (current && current.nodeType === 1) {
            return (view['$animatableElement'] = current.classList.contains('au-animate') ? current : null);
        }
        return (view['$animatableElement'] = null);
    }
    var ViewSlot = (function () {
        function ViewSlot(anchor, anchorIsContainer, animator) {
            if (animator === void 0) { animator = animator_1.Animator.instance; }
            this.anchor = anchor;
            this.anchorIsContainer = anchorIsContainer;
            this.animator = animator;
            this.children = [];
            this.isBound = false;
            this.isAttached = false;
            this.contentSelectors = null;
            anchor['viewSlot'] = this;
            anchor['isContentProjectionSource'] = false;
        }
        ViewSlot.prototype.animateView = function (visual, direction) {
            if (direction === void 0) { direction = 'enter'; }
            var animatableElement = getAnimatableElement(visual);
            if (animatableElement !== null) {
                switch (direction) {
                    case 'enter':
                        return this.animator.enter(animatableElement);
                    case 'leave':
                        return this.animator.leave(animatableElement);
                    default:
                        throw new Error('Invalid animation direction: ' + direction);
                }
            }
        };
        ViewSlot.prototype.bind = function (scope) {
            if (this.isBound) {
                if (this.scope === scope) {
                    return;
                }
                this.unbind();
            }
            this.isBound = true;
            this.scope = scope = scope || this.scope;
            var children = this.children;
            for (var i = 0, ii = children.length; i < ii; ++i) {
                children[i].bind(scope);
            }
        };
        ViewSlot.prototype.unbind = function () {
            if (this.isBound) {
                this.isBound = false;
                this.scope = null;
                var children = this.children;
                for (var i = 0, ii = children.length; i < ii; ++i) {
                    children[i].unbind();
                }
            }
        };
        ViewSlot.prototype.add = function (visual) {
            if (this.anchorIsContainer) {
                visual.$view.appendTo(this.anchor);
            }
            else {
                visual.$view.insertBefore(this.anchor);
            }
            this.children.push(visual);
            if (this.isAttached) {
                visual.attach();
                return this.animateView(visual, 'enter');
            }
        };
        ViewSlot.prototype.insert = function (index, visual) {
            var children = this.children;
            var length = children.length;
            if ((index === 0 && length === 0) || index >= length) {
                return this.add(visual);
            }
            visual.$view.insertBefore(children[index].$view.firstChild);
            children.splice(index, 0, visual);
            if (this.isAttached) {
                visual.attach();
                return this.animateView(visual, 'enter');
            }
        };
        ViewSlot.prototype.move = function (sourceIndex, targetIndex) {
            if (sourceIndex === targetIndex) {
                return;
            }
            var children = this.children;
            var component = children[sourceIndex];
            var view = component.$view;
            view.remove();
            view.insertBefore(children[targetIndex].$view.firstChild);
            children.splice(sourceIndex, 1);
            children.splice(targetIndex, 0, component);
        };
        ViewSlot.prototype.remove = function (visual, skipAnimation) {
            return this.removeAt(this.children.indexOf(visual), skipAnimation);
        };
        ViewSlot.prototype.removeMany = function (visualsToRemove, skipAnimation) {
            var _this = this;
            var children = this.children;
            var ii = visualsToRemove.length;
            var i;
            var rmPromises = [];
            visualsToRemove.forEach(function (child) {
                var view = child.$view;
                if (skipAnimation) {
                    view.remove();
                    return;
                }
                var animation = _this.animateView(child, 'leave');
                if (animation) {
                    rmPromises.push(animation.then(function () { return view.remove(); }));
                }
                else {
                    view.remove();
                }
            });
            var removeAction = function () {
                if (_this.isAttached) {
                    for (i = 0; i < ii; ++i) {
                        visualsToRemove[i].detach();
                    }
                }
                for (i = 0; i < ii; ++i) {
                    var index = children.indexOf(visualsToRemove[i]);
                    if (index >= 0) {
                        children.splice(index, 1);
                    }
                }
                return visualsToRemove;
            };
            if (rmPromises.length > 0) {
                return Promise.all(rmPromises).then(function () { return removeAction(); });
            }
            return removeAction();
        };
        ViewSlot.prototype.removeAt = function (index, skipAnimation) {
            var _this = this;
            var visual = this.children[index];
            var removeAction = function () {
                index = _this.children.indexOf(visual);
                visual.$view.remove();
                _this.children.splice(index, 1);
                if (_this.isAttached) {
                    visual.detach();
                }
                return visual;
            };
            if (!skipAnimation) {
                var animation = this.animateView(visual, 'leave');
                if (animation) {
                    return animation.then(function () { return removeAction(); });
                }
            }
            return removeAction();
        };
        ViewSlot.prototype.removeAll = function (skipAnimation) {
            var _this = this;
            var children = this.children;
            var ii = children.length;
            var i;
            var rmPromises = [];
            children.forEach(function (child) {
                var view = child.$view;
                if (skipAnimation) {
                    view.remove();
                    return;
                }
                var animation = _this.animateView(child, 'leave');
                if (animation) {
                    rmPromises.push(animation.then(function () { return view.remove(); }));
                }
                else {
                    view.remove();
                }
            });
            var removeAction = function () {
                if (_this.isAttached) {
                    for (i = 0; i < ii; ++i) {
                        children[i].detach();
                    }
                }
                _this.children = [];
            };
            if (rmPromises.length > 0) {
                return Promise.all(rmPromises).then(function () { return removeAction(); });
            }
            return removeAction();
        };
        ViewSlot.prototype.attach = function () {
            if (this.isAttached) {
                return;
            }
            this.isAttached = true;
            var children = this.children;
            for (var i = 0, ii = children.length; i < ii; ++i) {
                var child = children[i];
                child.attach();
                this.animateView(child, 'enter');
            }
        };
        ViewSlot.prototype.detach = function () {
            if (this.isAttached) {
                this.isAttached = false;
                var children = this.children;
                for (var i = 0, ii = children.length; i < ii; ++i) {
                    children[i].detach();
                }
            }
        };
        ViewSlot.prototype.projectTo = function (slots) {
            var _this = this;
            this.projectToSlots = slots;
            this.add = this._projectionAdd;
            this.insert = this._projectionInsert;
            this.move = this._projectionMove;
            this.remove = this._projectionRemove;
            this.removeAt = this._projectionRemoveAt;
            this.removeMany = this._projectionRemoveMany;
            this.removeAll = this._projectionRemoveAll;
            this.children.forEach(function (view) { return shadow_dom_1.ShadowDOM.distributeView(view.$view, slots, _this); });
        };
        ViewSlot.prototype._projectionAdd = function (visual) {
            shadow_dom_1.ShadowDOM.distributeView(visual.$view, this.projectToSlots, this);
            this.children.push(visual);
            if (this.isAttached) {
                visual.attach();
            }
        };
        ViewSlot.prototype._projectionInsert = function (index, visual) {
            if ((index === 0 && !this.children.length) || index >= this.children.length) {
                this.add(visual);
            }
            else {
                shadow_dom_1.ShadowDOM.distributeView(visual.$view, this.projectToSlots, this, index);
                this.children.splice(index, 0, visual);
                if (this.isAttached) {
                    visual.attach();
                }
            }
        };
        ViewSlot.prototype._projectionMove = function (sourceIndex, targetIndex) {
            if (sourceIndex === targetIndex) {
                return;
            }
            var children = this.children;
            var visual = children[sourceIndex];
            shadow_dom_1.ShadowDOM.undistributeView(visual.$view, this.projectToSlots, this);
            shadow_dom_1.ShadowDOM.distributeView(visual.$view, this.projectToSlots, this, targetIndex);
            children.splice(sourceIndex, 1);
            children.splice(targetIndex, 0, visual);
        };
        ViewSlot.prototype._projectionRemove = function (visual) {
            shadow_dom_1.ShadowDOM.undistributeView(visual.$view, this.projectToSlots, this);
            this.children.splice(this.children.indexOf(visual), 1);
            if (this.isAttached) {
                visual.detach();
            }
            return visual;
        };
        ViewSlot.prototype._projectionRemoveAt = function (index, skipAnimation) {
            var visual = this.children[index];
            shadow_dom_1.ShadowDOM.undistributeView(visual.$view, this.projectToSlots, this);
            this.children.splice(index, 1);
            if (this.isAttached) {
                visual.detach();
            }
            return visual;
        };
        ViewSlot.prototype._projectionRemoveMany = function (viewsToRemove, skipAnimation) {
            var _this = this;
            viewsToRemove.forEach(function (view) { return _this.remove(view); });
        };
        ViewSlot.prototype._projectionRemoveAll = function () {
            shadow_dom_1.ShadowDOM.undistributeAll(this.projectToSlots, this);
            var children = this.children;
            if (this.isAttached) {
                for (var i = 0, ii = children.length; i < ii; ++i) {
                    children[i].detach();
                }
            }
            this.children = [];
        };
        return ViewSlot;
    }());
    exports.ViewSlot = ViewSlot;
});



define('runtime/templating/view',["require", "exports", "../pal"], function (require, exports, pal_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var noNodes = Object.freeze([]);
    var noopView = {
        firstChild: Node = null,
        lastChild: Node = null,
        childNodes: noNodes,
        findTargets: function () { return noNodes; },
        insertBefore: function (refNode) { },
        appendTo: function (parent) { },
        remove: function () { },
        appendChild: function (child) { }
    };
    exports.View = {
        none: noopView,
        fromCompiledTemplate: function (element) {
            return new TemplateView(element);
        },
        fromCompiledElementContent: function (owner, element) {
            var contentElement = element.firstElementChild;
            if (contentElement !== null && contentElement !== undefined) {
                pal_1.DOM.removeNode(contentElement);
                if (owner.$useShadowDOM) {
                    while (contentElement.firstChild) {
                        element.appendChild(contentElement.firstChild);
                    }
                }
                else {
                    return new ContentView(contentElement);
                }
            }
            return noopView;
        }
    };
    var ContentView = (function () {
        function ContentView(element) {
            this.element = element;
            this.firstChild = this.element.firstChild;
            this.lastChild = this.element.lastChild;
        }
        Object.defineProperty(ContentView.prototype, "childNodes", {
            get: function () {
                return this.element.childNodes;
            },
            enumerable: true,
            configurable: true
        });
        ContentView.prototype.appendChild = function (child) {
            this.element.appendChild(child);
        };
        ContentView.prototype.findTargets = function () { return noNodes; };
        ContentView.prototype.insertBefore = function (refNode) { };
        ContentView.prototype.appendTo = function (parent) { };
        ContentView.prototype.remove = function () { };
        return ContentView;
    }());
    var TemplateView = (function () {
        function TemplateView(template) {
            this.fragment = template.cloneNode(true).content;
            this.firstChild = this.fragment.firstChild;
            this.lastChild = this.fragment.lastChild;
        }
        Object.defineProperty(TemplateView.prototype, "childNodes", {
            get: function () {
                return this.fragment.childNodes;
            },
            enumerable: true,
            configurable: true
        });
        TemplateView.prototype.appendChild = function (node) {
            this.fragment.appendChild(node);
        };
        TemplateView.prototype.findTargets = function () {
            return this.fragment.querySelectorAll('.au');
        };
        TemplateView.prototype.insertBefore = function (refNode) {
            refNode.parentNode.insertBefore(this.fragment, refNode);
        };
        TemplateView.prototype.appendTo = function (parent) {
            parent.appendChild(this.fragment);
        };
        TemplateView.prototype.remove = function () {
            var fragment = this.fragment;
            var current = this.firstChild;
            var end = this.lastChild;
            var next;
            while (current) {
                next = current.nextSibling;
                fragment.appendChild(current);
                if (current === end) {
                    break;
                }
                current = next;
            }
        };
        return TemplateView;
    }());
});



define('svg/binding/svg-analyzer',["require", "exports", "../../runtime/binding/svg-analyzer", "../../runtime/pal"], function (require, exports, svg_analyzer_1, pal_1) {
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
        var div = pal_1.DOM.createElement('div');
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
    exports.SVGAnalyzer = Object.assign(svg_analyzer_1.SVGAnalyzer, {
        isStandardSvgAttribute: function (nodeName, attributeName) {
            return svgPresentationElements[nodeName] && svgPresentationElements[attributeName]
                || svgElements[nodeName] && svgElements[nodeName].indexOf(attributeName) !== -1;
        }
    });
});



//# sourceMappingURL=app-bundle.js.map