'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var kernel = require('@aurelia/kernel');
var runtimeHtml = require('@aurelia/runtime-html');
var platformBrowser = require('@aurelia/platform-browser');
var platform = require('@aurelia/platform');
var expressionParser = require('@aurelia/expression-parser');
var runtime = require('@aurelia/runtime');
var templateCompiler = require('@aurelia/template-compiler');

const PLATFORM = platformBrowser.BrowserPlatform.getOrCreate(globalThis);
function createContainer() {
    return kernel.DI.createContainer()
        .register(kernel.Registration.instance(runtimeHtml.IPlatform, PLATFORM), runtimeHtml.StandardConfiguration);
}
class Aurelia extends runtimeHtml.Aurelia {
    constructor(container = createContainer()) {
        super(container);
    }
    static app(config) {
        return new Aurelia().app(config);
    }
    static enhance(config) {
        return new Aurelia().enhance(config);
    }
    static register(...params) {
        return new Aurelia().register(...params);
    }
    app(config) {
        if (runtimeHtml.CustomElement.isType(config)) {
            // Default to custom element element name
            const definition = runtimeHtml.CustomElement.getDefinition(config);
            let host = document.querySelector(definition.name);
            if (host === null) {
                // When no target is found, default to body.
                // For example, when user forgot to write <my-app></my-app> in html.
                host = document.body;
            }
            return super.app({
                host: host,
                component: config
            });
        }
        return super.app(config);
    }
}

exports.ConsoleSink = kernel.ConsoleSink;
exports.DI = kernel.DI;
exports.EventAggregator = kernel.EventAggregator;
exports.IContainer = kernel.IContainer;
exports.IEventAggregator = kernel.IEventAggregator;
exports.ILogger = kernel.ILogger;
exports.IServiceLocator = kernel.IServiceLocator;
exports.InstanceProvider = kernel.InstanceProvider;
exports.LogLevel = kernel.LogLevel;
exports.LoggerConfiguration = kernel.LoggerConfiguration;
exports.Registration = kernel.Registration;
exports.all = kernel.all;
exports.allResources = kernel.allResources;
exports.bound = kernel.bound;
exports.camelCase = kernel.camelCase;
exports.emptyArray = kernel.emptyArray;
exports.emptyObject = kernel.emptyObject;
exports.factory = kernel.factory;
exports.ignore = kernel.ignore;
exports.inject = kernel.inject;
exports.isArrayIndex = kernel.isArrayIndex;
exports.kebabCase = kernel.kebabCase;
exports.lazy = kernel.lazy;
exports.newInstanceForScope = kernel.newInstanceForScope;
exports.newInstanceOf = kernel.newInstanceOf;
exports.noop = kernel.noop;
exports.optional = kernel.optional;
exports.pascalCase = kernel.pascalCase;
exports.resolve = kernel.resolve;
exports.resource = kernel.resource;
exports.singleton = kernel.singleton;
exports.toArray = kernel.toArray;
exports.transient = kernel.transient;
exports.AppTask = runtimeHtml.AppTask;
exports.ArrayLikeHandler = runtimeHtml.ArrayLikeHandler;
exports.AuSlotsInfo = runtimeHtml.AuSlotsInfo;
exports.Bindable = runtimeHtml.Bindable;
exports.BindingBehavior = runtimeHtml.BindingBehavior;
exports.BindingMode = runtimeHtml.BindingMode;
exports.ChildrenBinding = runtimeHtml.ChildrenBinding;
exports.Controller = runtimeHtml.Controller;
exports.CustomAttribute = runtimeHtml.CustomAttribute;
exports.CustomElement = runtimeHtml.CustomElement;
exports.FlushQueue = runtimeHtml.FlushQueue;
exports.IAppRoot = runtimeHtml.IAppRoot;
exports.IAuSlotWatcher = runtimeHtml.IAuSlotWatcher;
exports.IAuSlotsInfo = runtimeHtml.IAuSlotsInfo;
exports.IAurelia = runtimeHtml.IAurelia;
exports.IController = runtimeHtml.IController;
exports.IEventModifier = runtimeHtml.IEventModifier;
exports.IEventTarget = runtimeHtml.IEventTarget;
exports.IFlushQueue = runtimeHtml.IFlushQueue;
exports.IHistory = runtimeHtml.IHistory;
exports.IKeyMapping = runtimeHtml.IKeyMapping;
exports.ILifecycleHooks = runtimeHtml.ILifecycleHooks;
exports.IModifiedEventHandlerCreator = runtimeHtml.IModifiedEventHandlerCreator;
exports.INode = runtimeHtml.INode;
exports.IPlatform = runtimeHtml.IPlatform;
exports.IRenderLocation = runtimeHtml.IRenderLocation;
exports.IRepeatableHandler = runtimeHtml.IRepeatableHandler;
exports.IRepeatableHandlerResolver = runtimeHtml.IRepeatableHandlerResolver;
exports.ISignaler = runtimeHtml.ISignaler;
exports.IViewFactory = runtimeHtml.IViewFactory;
exports.IWindow = runtimeHtml.IWindow;
exports.LifecycleHooks = runtimeHtml.LifecycleHooks;
exports.NodeObserverLocator = runtimeHtml.NodeObserverLocator;
exports.RuntimeTemplateCompilerImplementation = runtimeHtml.RuntimeTemplateCompilerImplementation;
exports.ShortHandBindingSyntax = runtimeHtml.ShortHandBindingSyntax;
exports.StyleConfiguration = runtimeHtml.StyleConfiguration;
exports.ValueConverter = runtimeHtml.ValueConverter;
exports.ViewFactory = runtimeHtml.ViewFactory;
exports.alias = runtimeHtml.alias;
exports.bindable = runtimeHtml.bindable;
exports.bindingBehavior = runtimeHtml.bindingBehavior;
exports.capture = runtimeHtml.capture;
exports.children = runtimeHtml.children;
exports.coercer = runtimeHtml.coercer;
exports.containerless = runtimeHtml.containerless;
exports.cssModules = runtimeHtml.cssModules;
exports.customAttribute = runtimeHtml.customAttribute;
exports.customElement = runtimeHtml.customElement;
exports.lifecycleHooks = runtimeHtml.lifecycleHooks;
exports.processContent = runtimeHtml.processContent;
exports.refs = runtimeHtml.refs;
exports.registerAliases = runtimeHtml.registerAliases;
exports.renderer = runtimeHtml.renderer;
exports.shadowCSS = runtimeHtml.shadowCSS;
exports.slotted = runtimeHtml.slotted;
exports.templateController = runtimeHtml.templateController;
exports.useShadowDOM = runtimeHtml.useShadowDOM;
exports.valueConverter = runtimeHtml.valueConverter;
exports.watch = runtimeHtml.watch;
exports.Platform = platform.Platform;
exports.Task = platform.Task;
exports.TaskAbortError = platform.TaskAbortError;
exports.TaskQueue = platform.TaskQueue;
exports.CustomExpression = expressionParser.CustomExpression;
exports.IExpressionParser = expressionParser.IExpressionParser;
exports.ComputedObserver = runtime.ComputedObserver;
exports.IObservation = runtime.IObservation;
exports.IObserverLocator = runtime.IObserverLocator;
exports.Scope = runtime.Scope;
exports.batch = runtime.batch;
exports.observable = runtime.observable;
exports.subscriberCollection = runtime.subscriberCollection;
exports.AttributePattern = templateCompiler.AttributePattern;
exports.BindingCommand = templateCompiler.BindingCommand;
exports.IAttrMapper = templateCompiler.IAttrMapper;
exports.IAttributeParser = templateCompiler.IAttributeParser;
exports.IAttributePattern = templateCompiler.IAttributePattern;
exports.ITemplateCompiler = templateCompiler.ITemplateCompiler;
exports.ITemplateCompilerHooks = templateCompiler.ITemplateCompilerHooks;
exports.ITemplateElementFactory = templateCompiler.ITemplateElementFactory;
exports.TemplateCompilerHooks = templateCompiler.TemplateCompilerHooks;
exports.attributePattern = templateCompiler.attributePattern;
exports.bindingCommand = templateCompiler.bindingCommand;
exports.templateCompilerHooks = templateCompiler.templateCompilerHooks;
exports.Aurelia = Aurelia;
exports.PLATFORM = PLATFORM;
exports.default = Aurelia;
//# sourceMappingURL=index.dev.cjs.map
