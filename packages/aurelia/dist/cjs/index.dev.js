'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var kernel = require('@aurelia/kernel');
var runtimeHtml = require('@aurelia/runtime-html');
var platformBrowser = require('@aurelia/platform-browser');
var fetchClient = require('@aurelia/fetch-client');
var router = require('@aurelia/router');

const PLATFORM = platformBrowser.BrowserPlatform.getOrCreate(globalThis);
function createContainer() {
    return kernel.DI.createContainer()
        .register(kernel.Registration.instance(runtimeHtml.IPlatform, PLATFORM), runtimeHtml.StandardConfiguration);
}
class Aurelia extends runtimeHtml.Aurelia {
    constructor(container = createContainer()) {
        super(container);
    }
    static start(root) {
        return new Aurelia().start(root);
    }
    static app(config) {
        return new Aurelia().app(config);
    }
    static enhance(config, parentController) {
        return new Aurelia().enhance(config, parentController);
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

exports.ColorOptions = kernel.ColorOptions;
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
exports.Metadata = kernel.Metadata;
exports.Registration = kernel.Registration;
exports.all = kernel.all;
exports.bound = kernel.bound;
exports.camelCase = kernel.camelCase;
exports.emptyArray = kernel.emptyArray;
exports.emptyObject = kernel.emptyObject;
exports.inject = kernel.inject;
exports.isArrayIndex = kernel.isArrayIndex;
exports.kebabCase = kernel.kebabCase;
exports.lazy = kernel.lazy;
exports.noop = kernel.noop;
exports.optional = kernel.optional;
exports.pascalCase = kernel.pascalCase;
exports.singleton = kernel.singleton;
exports.toArray = kernel.toArray;
exports.transient = kernel.transient;
exports.AppTask = runtimeHtml.AppTask;
exports.AuSlotsInfo = runtimeHtml.AuSlotsInfo;
exports.Bindable = runtimeHtml.Bindable;
exports.BindingBehavior = runtimeHtml.BindingBehavior;
exports.BindingMode = runtimeHtml.BindingMode;
exports.ComputedObserver = runtimeHtml.ComputedObserver;
exports.ComputedWatcher = runtimeHtml.ComputedWatcher;
exports.Controller = runtimeHtml.Controller;
exports.CustomAttribute = runtimeHtml.CustomAttribute;
exports.CustomElement = runtimeHtml.CustomElement;
exports.DefaultDialogDom = runtimeHtml.DefaultDialogDom;
exports.DefaultDialogDomRenderer = runtimeHtml.DefaultDialogDomRenderer;
exports.DefaultDialogGlobalSettings = runtimeHtml.DefaultDialogGlobalSettings;
exports.DialogCloseResult = runtimeHtml.DialogCloseResult;
exports.DialogConfiguration = runtimeHtml.DialogConfiguration;
exports.DialogController = runtimeHtml.DialogController;
exports.DialogDeactivationStatuses = runtimeHtml.DialogDeactivationStatuses;
exports.DialogDefaultConfiguration = runtimeHtml.DialogDefaultConfiguration;
exports.DialogOpenResult = runtimeHtml.DialogOpenResult;
exports.DialogService = runtimeHtml.DialogService;
exports.ExpressionWatcher = runtimeHtml.ExpressionWatcher;
exports.IAppRoot = runtimeHtml.IAppRoot;
exports.IAttrMapper = runtimeHtml.IAttrMapper;
exports.IAttributePattern = runtimeHtml.IAttributePattern;
exports.IAuSlotsInfo = runtimeHtml.IAuSlotsInfo;
exports.IAurelia = runtimeHtml.IAurelia;
exports.IDialogController = runtimeHtml.IDialogController;
exports.IDialogDom = runtimeHtml.IDialogDom;
exports.IDialogDomRenderer = runtimeHtml.IDialogDomRenderer;
exports.IDialogGlobalSettings = runtimeHtml.IDialogGlobalSettings;
exports.IDialogService = runtimeHtml.IDialogService;
exports.IEventTarget = runtimeHtml.IEventTarget;
exports.ILifecycleHooks = runtimeHtml.ILifecycleHooks;
exports.INode = runtimeHtml.INode;
exports.IObserverLocator = runtimeHtml.IObserverLocator;
exports.IPlatform = runtimeHtml.IPlatform;
exports.IRenderLocation = runtimeHtml.IRenderLocation;
exports.ISignaler = runtimeHtml.ISignaler;
exports.ITemplateCompiler = runtimeHtml.ITemplateCompiler;
exports.ITemplateCompilerHooks = runtimeHtml.ITemplateCompilerHooks;
exports.IWcElementRegistry = runtimeHtml.IWcElementRegistry;
exports.IWorkTracker = runtimeHtml.IWorkTracker;
exports.LifecycleFlags = runtimeHtml.LifecycleFlags;
exports.LifecycleHooks = runtimeHtml.LifecycleHooks;
exports.NodeObserverLocator = runtimeHtml.NodeObserverLocator;
exports.ShortHandBindingSyntax = runtimeHtml.ShortHandBindingSyntax;
exports.StyleConfiguration = runtimeHtml.StyleConfiguration;
exports.TaskQueuePriority = runtimeHtml.TaskQueuePriority;
exports.TemplateCompilerHooks = runtimeHtml.TemplateCompilerHooks;
exports.ValueConverter = runtimeHtml.ValueConverter;
exports.ViewFactory = runtimeHtml.ViewFactory;
exports.Watch = runtimeHtml.Watch;
exports.WcCustomElementRegistry = runtimeHtml.WcCustomElementRegistry;
exports.alias = runtimeHtml.alias;
exports.attributePattern = runtimeHtml.attributePattern;
exports.bindable = runtimeHtml.bindable;
exports.bindingBehavior = runtimeHtml.bindingBehavior;
exports.bindingCommand = runtimeHtml.bindingCommand;
exports.children = runtimeHtml.children;
exports.coercer = runtimeHtml.coercer;
exports.containerless = runtimeHtml.containerless;
exports.createElement = runtimeHtml.createElement;
exports.cssModules = runtimeHtml.cssModules;
exports.customAttribute = runtimeHtml.customAttribute;
exports.customElement = runtimeHtml.customElement;
exports.lifecycleHooks = runtimeHtml.lifecycleHooks;
exports.registerAliases = runtimeHtml.registerAliases;
exports.renderer = runtimeHtml.renderer;
exports.shadowCSS = runtimeHtml.shadowCSS;
exports.subscriberCollection = runtimeHtml.subscriberCollection;
exports.templateCompilerHooks = runtimeHtml.templateCompilerHooks;
exports.templateController = runtimeHtml.templateController;
exports.useShadowDOM = runtimeHtml.useShadowDOM;
exports.valueConverter = runtimeHtml.valueConverter;
exports.watch = runtimeHtml.watch;
exports.HttpClient = fetchClient.HttpClient;
exports.HttpClientConfiguration = fetchClient.HttpClientConfiguration;
exports.IHttpClient = fetchClient.IHttpClient;
exports.json = fetchClient.json;
exports.IRouteContext = router.IRouteContext;
exports.IRouter = router.IRouter;
exports.IRouterEvents = router.IRouterEvents;
exports.Route = router.Route;
exports.RouteConfig = router.RouteConfig;
exports.RouteNode = router.RouteNode;
exports.Router = router.Router;
exports.RouterConfiguration = router.RouterConfiguration;
exports.RouterOptions = router.RouterOptions;
exports.RouterRegistration = router.RouterRegistration;
exports.route = router.route;
exports.Aurelia = Aurelia;
exports.PLATFORM = PLATFORM;
exports['default'] = Aurelia;
//# sourceMappingURL=index.dev.js.map
