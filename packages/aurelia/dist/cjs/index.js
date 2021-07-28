"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

var e = require("@aurelia/kernel");

var r = require("@aurelia/runtime-html");

var t = require("@aurelia/platform-browser");

var s = require("@aurelia/fetch-client");

var o = require("@aurelia/router");

const p = t.BrowserPlatform.getOrCreate(globalThis);

function x() {
    return e.DI.createContainer().register(e.Registration.instance(r.IPlatform, p), r.StandardConfiguration);
}

class Aurelia extends r.Aurelia {
    constructor(e = x()) {
        super(e);
    }
    static start(e) {
        return (new Aurelia).start(e);
    }
    static app(e) {
        return (new Aurelia).app(e);
    }
    static enhance(e, r) {
        return (new Aurelia).enhance(e, r);
    }
    static register(...e) {
        return (new Aurelia).register(...e);
    }
    app(e) {
        if (r.CustomElement.isType(e)) {
            const t = r.CustomElement.getDefinition(e);
            let s = document.querySelector(t.name);
            if (null === s) s = document.body;
            return super.app({
                host: s,
                component: e
            });
        }
        return super.app(e);
    }
}

exports.ColorOptions = e.ColorOptions;

exports.ConsoleSink = e.ConsoleSink;

exports.DI = e.DI;

exports.EventAggregator = e.EventAggregator;

exports.IContainer = e.IContainer;

exports.IEventAggregator = e.IEventAggregator;

exports.ILogger = e.ILogger;

exports.IServiceLocator = e.IServiceLocator;

exports.InstanceProvider = e.InstanceProvider;

exports.LogLevel = e.LogLevel;

exports.LoggerConfiguration = e.LoggerConfiguration;

exports.Metadata = e.Metadata;

exports.Registration = e.Registration;

exports.all = e.all;

exports.bound = e.bound;

exports.camelCase = e.camelCase;

exports.emptyArray = e.emptyArray;

exports.emptyObject = e.emptyObject;

exports.inject = e.inject;

exports.isArrayIndex = e.isArrayIndex;

exports.kebabCase = e.kebabCase;

exports.lazy = e.lazy;

exports.noop = e.noop;

exports.optional = e.optional;

exports.pascalCase = e.pascalCase;

exports.singleton = e.singleton;

exports.toArray = e.toArray;

exports.transient = e.transient;

exports.AppTask = r.AppTask;

exports.AuSlotsInfo = r.AuSlotsInfo;

exports.Bindable = r.Bindable;

exports.BindingBehavior = r.BindingBehavior;

exports.BindingMode = r.BindingMode;

exports.ComputedObserver = r.ComputedObserver;

exports.ComputedWatcher = r.ComputedWatcher;

exports.Controller = r.Controller;

exports.CustomAttribute = r.CustomAttribute;

exports.CustomElement = r.CustomElement;

exports.ExpressionWatcher = r.ExpressionWatcher;

exports.IAppRoot = r.IAppRoot;

exports.IAttrMapper = r.IAttrMapper;

exports.IAttributePattern = r.IAttributePattern;

exports.IAuSlotsInfo = r.IAuSlotsInfo;

exports.IAurelia = r.IAurelia;

exports.IEventTarget = r.IEventTarget;

exports.ILifecycleHooks = r.ILifecycleHooks;

exports.INode = r.INode;

exports.IObserverLocator = r.IObserverLocator;

exports.IPlatform = r.IPlatform;

exports.IRenderLocation = r.IRenderLocation;

exports.ISignaler = r.ISignaler;

exports.ITemplateCompilerHooks = r.ITemplateCompilerHooks;

exports.IWorkTracker = r.IWorkTracker;

exports.LifecycleFlags = r.LifecycleFlags;

exports.LifecycleHooks = r.LifecycleHooks;

exports.NodeObserverLocator = r.NodeObserverLocator;

exports.ShortHandBindingSyntax = r.ShortHandBindingSyntax;

exports.StyleConfiguration = r.StyleConfiguration;

exports.TaskQueuePriority = r.TaskQueuePriority;

exports.TemplateCompilerHooks = r.TemplateCompilerHooks;

exports.ValueConverter = r.ValueConverter;

exports.ViewFactory = r.ViewFactory;

exports.Watch = r.Watch;

exports.alias = r.alias;

exports.attributePattern = r.attributePattern;

exports.bindable = r.bindable;

exports.bindingBehavior = r.bindingBehavior;

exports.bindingCommand = r.bindingCommand;

exports.children = r.children;

exports.containerless = r.containerless;

exports.createElement = r.createElement;

exports.cssModules = r.cssModules;

exports.customAttribute = r.customAttribute;

exports.customElement = r.customElement;

exports.lifecycleHooks = r.lifecycleHooks;

exports.registerAliases = r.registerAliases;

exports.renderer = r.renderer;

exports.shadowCSS = r.shadowCSS;

exports.subscriberCollection = r.subscriberCollection;

exports.templateCompilerHooks = r.templateCompilerHooks;

exports.templateController = r.templateController;

exports.useShadowDOM = r.useShadowDOM;

exports.valueConverter = r.valueConverter;

exports.watch = r.watch;

exports.HttpClient = s.HttpClient;

exports.HttpClientConfiguration = s.HttpClientConfiguration;

exports.IHttpClient = s.IHttpClient;

exports.json = s.json;

exports.IRouteContext = o.IRouteContext;

exports.IRouter = o.IRouter;

exports.IRouterEvents = o.IRouterEvents;

exports.Route = o.Route;

exports.RouteConfig = o.RouteConfig;

exports.RouteNode = o.RouteNode;

exports.Router = o.Router;

exports.RouterConfiguration = o.RouterConfiguration;

exports.RouterOptions = o.RouterOptions;

exports.RouterRegistration = o.RouterRegistration;

exports.route = o.route;

exports.Aurelia = Aurelia;

exports.PLATFORM = p;

exports.default = Aurelia;
//# sourceMappingURL=index.js.map
