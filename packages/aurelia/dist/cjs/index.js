"use strict";

Object.defineProperty(exports, "t", {
    value: true
});

var e = require("@aurelia/kernel");

var t = require("@aurelia/runtime-html");

var r = require("@aurelia/platform-browser");

var n = require("@aurelia/fetch-client");

var u = require("@aurelia/router");

const o = r.BrowserPlatform.getOrCreate(globalThis);

function c() {
    return e.DI.createContainer().register(e.Registration.instance(t.IPlatform, o), t.StandardConfiguration);
}

class Aurelia extends t.Aurelia {
    constructor(e = c()) {
        super(e);
    }
    static start(e) {
        return (new Aurelia).start(e);
    }
    static app(e) {
        return (new Aurelia).app(e);
    }
    static enhance(e, t) {
        return (new Aurelia).enhance(e, t);
    }
    static register(...e) {
        return (new Aurelia).register(...e);
    }
    app(e) {
        if (t.CustomElement.isType(e)) {
            const r = t.CustomElement.getDefinition(e);
            let n = document.querySelector(r.name);
            if (null === n) n = document.body;
            return super.app({
                host: n,
                component: e
            });
        }
        return super.app(e);
    }
}

Object.defineProperty(exports, "ColorOptions", {
    enumerable: true,
    get: function() {
        return e.ColorOptions;
    }
});

Object.defineProperty(exports, "ConsoleSink", {
    enumerable: true,
    get: function() {
        return e.ConsoleSink;
    }
});

Object.defineProperty(exports, "DI", {
    enumerable: true,
    get: function() {
        return e.DI;
    }
});

Object.defineProperty(exports, "EventAggregator", {
    enumerable: true,
    get: function() {
        return e.EventAggregator;
    }
});

Object.defineProperty(exports, "IContainer", {
    enumerable: true,
    get: function() {
        return e.IContainer;
    }
});

Object.defineProperty(exports, "IEventAggregator", {
    enumerable: true,
    get: function() {
        return e.IEventAggregator;
    }
});

Object.defineProperty(exports, "ILogger", {
    enumerable: true,
    get: function() {
        return e.ILogger;
    }
});

Object.defineProperty(exports, "IServiceLocator", {
    enumerable: true,
    get: function() {
        return e.IServiceLocator;
    }
});

Object.defineProperty(exports, "InstanceProvider", {
    enumerable: true,
    get: function() {
        return e.InstanceProvider;
    }
});

Object.defineProperty(exports, "LogLevel", {
    enumerable: true,
    get: function() {
        return e.LogLevel;
    }
});

Object.defineProperty(exports, "LoggerConfiguration", {
    enumerable: true,
    get: function() {
        return e.LoggerConfiguration;
    }
});

Object.defineProperty(exports, "Metadata", {
    enumerable: true,
    get: function() {
        return e.Metadata;
    }
});

Object.defineProperty(exports, "Registration", {
    enumerable: true,
    get: function() {
        return e.Registration;
    }
});

Object.defineProperty(exports, "all", {
    enumerable: true,
    get: function() {
        return e.all;
    }
});

Object.defineProperty(exports, "bound", {
    enumerable: true,
    get: function() {
        return e.bound;
    }
});

Object.defineProperty(exports, "camelCase", {
    enumerable: true,
    get: function() {
        return e.camelCase;
    }
});

Object.defineProperty(exports, "emptyArray", {
    enumerable: true,
    get: function() {
        return e.emptyArray;
    }
});

Object.defineProperty(exports, "emptyObject", {
    enumerable: true,
    get: function() {
        return e.emptyObject;
    }
});

Object.defineProperty(exports, "inject", {
    enumerable: true,
    get: function() {
        return e.inject;
    }
});

Object.defineProperty(exports, "isArrayIndex", {
    enumerable: true,
    get: function() {
        return e.isArrayIndex;
    }
});

Object.defineProperty(exports, "kebabCase", {
    enumerable: true,
    get: function() {
        return e.kebabCase;
    }
});

Object.defineProperty(exports, "lazy", {
    enumerable: true,
    get: function() {
        return e.lazy;
    }
});

Object.defineProperty(exports, "noop", {
    enumerable: true,
    get: function() {
        return e.noop;
    }
});

Object.defineProperty(exports, "optional", {
    enumerable: true,
    get: function() {
        return e.optional;
    }
});

Object.defineProperty(exports, "pascalCase", {
    enumerable: true,
    get: function() {
        return e.pascalCase;
    }
});

Object.defineProperty(exports, "singleton", {
    enumerable: true,
    get: function() {
        return e.singleton;
    }
});

Object.defineProperty(exports, "toArray", {
    enumerable: true,
    get: function() {
        return e.toArray;
    }
});

Object.defineProperty(exports, "transient", {
    enumerable: true,
    get: function() {
        return e.transient;
    }
});

Object.defineProperty(exports, "AppTask", {
    enumerable: true,
    get: function() {
        return t.AppTask;
    }
});

Object.defineProperty(exports, "AuSlotsInfo", {
    enumerable: true,
    get: function() {
        return t.AuSlotsInfo;
    }
});

Object.defineProperty(exports, "Bindable", {
    enumerable: true,
    get: function() {
        return t.Bindable;
    }
});

Object.defineProperty(exports, "BindingBehavior", {
    enumerable: true,
    get: function() {
        return t.BindingBehavior;
    }
});

Object.defineProperty(exports, "BindingMode", {
    enumerable: true,
    get: function() {
        return t.BindingMode;
    }
});

Object.defineProperty(exports, "ComputedObserver", {
    enumerable: true,
    get: function() {
        return t.ComputedObserver;
    }
});

Object.defineProperty(exports, "ComputedWatcher", {
    enumerable: true,
    get: function() {
        return t.ComputedWatcher;
    }
});

Object.defineProperty(exports, "Controller", {
    enumerable: true,
    get: function() {
        return t.Controller;
    }
});

Object.defineProperty(exports, "CustomAttribute", {
    enumerable: true,
    get: function() {
        return t.CustomAttribute;
    }
});

Object.defineProperty(exports, "CustomElement", {
    enumerable: true,
    get: function() {
        return t.CustomElement;
    }
});

Object.defineProperty(exports, "ExpressionWatcher", {
    enumerable: true,
    get: function() {
        return t.ExpressionWatcher;
    }
});

Object.defineProperty(exports, "IAppRoot", {
    enumerable: true,
    get: function() {
        return t.IAppRoot;
    }
});

Object.defineProperty(exports, "IAttrMapper", {
    enumerable: true,
    get: function() {
        return t.IAttrMapper;
    }
});

Object.defineProperty(exports, "IAttributePattern", {
    enumerable: true,
    get: function() {
        return t.IAttributePattern;
    }
});

Object.defineProperty(exports, "IAuSlotsInfo", {
    enumerable: true,
    get: function() {
        return t.IAuSlotsInfo;
    }
});

Object.defineProperty(exports, "IAurelia", {
    enumerable: true,
    get: function() {
        return t.IAurelia;
    }
});

Object.defineProperty(exports, "IEventTarget", {
    enumerable: true,
    get: function() {
        return t.IEventTarget;
    }
});

Object.defineProperty(exports, "ILifecycleHooks", {
    enumerable: true,
    get: function() {
        return t.ILifecycleHooks;
    }
});

Object.defineProperty(exports, "INode", {
    enumerable: true,
    get: function() {
        return t.INode;
    }
});

Object.defineProperty(exports, "IObserverLocator", {
    enumerable: true,
    get: function() {
        return t.IObserverLocator;
    }
});

Object.defineProperty(exports, "IPlatform", {
    enumerable: true,
    get: function() {
        return t.IPlatform;
    }
});

Object.defineProperty(exports, "IRenderLocation", {
    enumerable: true,
    get: function() {
        return t.IRenderLocation;
    }
});

Object.defineProperty(exports, "ISignaler", {
    enumerable: true,
    get: function() {
        return t.ISignaler;
    }
});

Object.defineProperty(exports, "ITemplateCompilerHooks", {
    enumerable: true,
    get: function() {
        return t.ITemplateCompilerHooks;
    }
});

Object.defineProperty(exports, "IWorkTracker", {
    enumerable: true,
    get: function() {
        return t.IWorkTracker;
    }
});

Object.defineProperty(exports, "LifecycleFlags", {
    enumerable: true,
    get: function() {
        return t.LifecycleFlags;
    }
});

Object.defineProperty(exports, "LifecycleHooks", {
    enumerable: true,
    get: function() {
        return t.LifecycleHooks;
    }
});

Object.defineProperty(exports, "NodeObserverLocator", {
    enumerable: true,
    get: function() {
        return t.NodeObserverLocator;
    }
});

Object.defineProperty(exports, "ShortHandBindingSyntax", {
    enumerable: true,
    get: function() {
        return t.ShortHandBindingSyntax;
    }
});

Object.defineProperty(exports, "StyleConfiguration", {
    enumerable: true,
    get: function() {
        return t.StyleConfiguration;
    }
});

Object.defineProperty(exports, "TaskQueuePriority", {
    enumerable: true,
    get: function() {
        return t.TaskQueuePriority;
    }
});

Object.defineProperty(exports, "TemplateCompilerHooks", {
    enumerable: true,
    get: function() {
        return t.TemplateCompilerHooks;
    }
});

Object.defineProperty(exports, "ValueConverter", {
    enumerable: true,
    get: function() {
        return t.ValueConverter;
    }
});

Object.defineProperty(exports, "ViewFactory", {
    enumerable: true,
    get: function() {
        return t.ViewFactory;
    }
});

Object.defineProperty(exports, "Watch", {
    enumerable: true,
    get: function() {
        return t.Watch;
    }
});

Object.defineProperty(exports, "alias", {
    enumerable: true,
    get: function() {
        return t.alias;
    }
});

Object.defineProperty(exports, "attributePattern", {
    enumerable: true,
    get: function() {
        return t.attributePattern;
    }
});

Object.defineProperty(exports, "bindable", {
    enumerable: true,
    get: function() {
        return t.bindable;
    }
});

Object.defineProperty(exports, "bindingBehavior", {
    enumerable: true,
    get: function() {
        return t.bindingBehavior;
    }
});

Object.defineProperty(exports, "bindingCommand", {
    enumerable: true,
    get: function() {
        return t.bindingCommand;
    }
});

Object.defineProperty(exports, "children", {
    enumerable: true,
    get: function() {
        return t.children;
    }
});

Object.defineProperty(exports, "containerless", {
    enumerable: true,
    get: function() {
        return t.containerless;
    }
});

Object.defineProperty(exports, "createElement", {
    enumerable: true,
    get: function() {
        return t.createElement;
    }
});

Object.defineProperty(exports, "cssModules", {
    enumerable: true,
    get: function() {
        return t.cssModules;
    }
});

Object.defineProperty(exports, "customAttribute", {
    enumerable: true,
    get: function() {
        return t.customAttribute;
    }
});

Object.defineProperty(exports, "customElement", {
    enumerable: true,
    get: function() {
        return t.customElement;
    }
});

Object.defineProperty(exports, "lifecycleHooks", {
    enumerable: true,
    get: function() {
        return t.lifecycleHooks;
    }
});

Object.defineProperty(exports, "registerAliases", {
    enumerable: true,
    get: function() {
        return t.registerAliases;
    }
});

Object.defineProperty(exports, "renderer", {
    enumerable: true,
    get: function() {
        return t.renderer;
    }
});

Object.defineProperty(exports, "shadowCSS", {
    enumerable: true,
    get: function() {
        return t.shadowCSS;
    }
});

Object.defineProperty(exports, "subscriberCollection", {
    enumerable: true,
    get: function() {
        return t.subscriberCollection;
    }
});

Object.defineProperty(exports, "templateCompilerHooks", {
    enumerable: true,
    get: function() {
        return t.templateCompilerHooks;
    }
});

Object.defineProperty(exports, "templateController", {
    enumerable: true,
    get: function() {
        return t.templateController;
    }
});

Object.defineProperty(exports, "useShadowDOM", {
    enumerable: true,
    get: function() {
        return t.useShadowDOM;
    }
});

Object.defineProperty(exports, "valueConverter", {
    enumerable: true,
    get: function() {
        return t.valueConverter;
    }
});

Object.defineProperty(exports, "watch", {
    enumerable: true,
    get: function() {
        return t.watch;
    }
});

Object.defineProperty(exports, "HttpClient", {
    enumerable: true,
    get: function() {
        return n.HttpClient;
    }
});

Object.defineProperty(exports, "HttpClientConfiguration", {
    enumerable: true,
    get: function() {
        return n.HttpClientConfiguration;
    }
});

Object.defineProperty(exports, "IHttpClient", {
    enumerable: true,
    get: function() {
        return n.IHttpClient;
    }
});

Object.defineProperty(exports, "json", {
    enumerable: true,
    get: function() {
        return n.json;
    }
});

Object.defineProperty(exports, "IRouteContext", {
    enumerable: true,
    get: function() {
        return u.IRouteContext;
    }
});

Object.defineProperty(exports, "IRouter", {
    enumerable: true,
    get: function() {
        return u.IRouter;
    }
});

Object.defineProperty(exports, "IRouterEvents", {
    enumerable: true,
    get: function() {
        return u.IRouterEvents;
    }
});

Object.defineProperty(exports, "Route", {
    enumerable: true,
    get: function() {
        return u.Route;
    }
});

Object.defineProperty(exports, "RouteConfig", {
    enumerable: true,
    get: function() {
        return u.RouteConfig;
    }
});

Object.defineProperty(exports, "RouteNode", {
    enumerable: true,
    get: function() {
        return u.RouteNode;
    }
});

Object.defineProperty(exports, "Router", {
    enumerable: true,
    get: function() {
        return u.Router;
    }
});

Object.defineProperty(exports, "RouterConfiguration", {
    enumerable: true,
    get: function() {
        return u.RouterConfiguration;
    }
});

Object.defineProperty(exports, "RouterOptions", {
    enumerable: true,
    get: function() {
        return u.RouterOptions;
    }
});

Object.defineProperty(exports, "RouterRegistration", {
    enumerable: true,
    get: function() {
        return u.RouterRegistration;
    }
});

Object.defineProperty(exports, "route", {
    enumerable: true,
    get: function() {
        return u.route;
    }
});

exports.Aurelia = Aurelia;

exports.PLATFORM = o;

exports.default = Aurelia;
//# sourceMappingURL=index.js.map
