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

Object.defineProperty(exports, 'ColorOptions', {
    enumerable: true,
    get: function () {
        return kernel.ColorOptions;
    }
});
Object.defineProperty(exports, 'ConsoleSink', {
    enumerable: true,
    get: function () {
        return kernel.ConsoleSink;
    }
});
Object.defineProperty(exports, 'DI', {
    enumerable: true,
    get: function () {
        return kernel.DI;
    }
});
Object.defineProperty(exports, 'EventAggregator', {
    enumerable: true,
    get: function () {
        return kernel.EventAggregator;
    }
});
Object.defineProperty(exports, 'IContainer', {
    enumerable: true,
    get: function () {
        return kernel.IContainer;
    }
});
Object.defineProperty(exports, 'IEventAggregator', {
    enumerable: true,
    get: function () {
        return kernel.IEventAggregator;
    }
});
Object.defineProperty(exports, 'ILogger', {
    enumerable: true,
    get: function () {
        return kernel.ILogger;
    }
});
Object.defineProperty(exports, 'IServiceLocator', {
    enumerable: true,
    get: function () {
        return kernel.IServiceLocator;
    }
});
Object.defineProperty(exports, 'InstanceProvider', {
    enumerable: true,
    get: function () {
        return kernel.InstanceProvider;
    }
});
Object.defineProperty(exports, 'LogLevel', {
    enumerable: true,
    get: function () {
        return kernel.LogLevel;
    }
});
Object.defineProperty(exports, 'LoggerConfiguration', {
    enumerable: true,
    get: function () {
        return kernel.LoggerConfiguration;
    }
});
Object.defineProperty(exports, 'Metadata', {
    enumerable: true,
    get: function () {
        return kernel.Metadata;
    }
});
Object.defineProperty(exports, 'Registration', {
    enumerable: true,
    get: function () {
        return kernel.Registration;
    }
});
Object.defineProperty(exports, 'all', {
    enumerable: true,
    get: function () {
        return kernel.all;
    }
});
Object.defineProperty(exports, 'bound', {
    enumerable: true,
    get: function () {
        return kernel.bound;
    }
});
Object.defineProperty(exports, 'camelCase', {
    enumerable: true,
    get: function () {
        return kernel.camelCase;
    }
});
Object.defineProperty(exports, 'emptyArray', {
    enumerable: true,
    get: function () {
        return kernel.emptyArray;
    }
});
Object.defineProperty(exports, 'emptyObject', {
    enumerable: true,
    get: function () {
        return kernel.emptyObject;
    }
});
Object.defineProperty(exports, 'inject', {
    enumerable: true,
    get: function () {
        return kernel.inject;
    }
});
Object.defineProperty(exports, 'isArrayIndex', {
    enumerable: true,
    get: function () {
        return kernel.isArrayIndex;
    }
});
Object.defineProperty(exports, 'kebabCase', {
    enumerable: true,
    get: function () {
        return kernel.kebabCase;
    }
});
Object.defineProperty(exports, 'lazy', {
    enumerable: true,
    get: function () {
        return kernel.lazy;
    }
});
Object.defineProperty(exports, 'noop', {
    enumerable: true,
    get: function () {
        return kernel.noop;
    }
});
Object.defineProperty(exports, 'optional', {
    enumerable: true,
    get: function () {
        return kernel.optional;
    }
});
Object.defineProperty(exports, 'pascalCase', {
    enumerable: true,
    get: function () {
        return kernel.pascalCase;
    }
});
Object.defineProperty(exports, 'singleton', {
    enumerable: true,
    get: function () {
        return kernel.singleton;
    }
});
Object.defineProperty(exports, 'toArray', {
    enumerable: true,
    get: function () {
        return kernel.toArray;
    }
});
Object.defineProperty(exports, 'transient', {
    enumerable: true,
    get: function () {
        return kernel.transient;
    }
});
Object.defineProperty(exports, 'AppTask', {
    enumerable: true,
    get: function () {
        return runtimeHtml.AppTask;
    }
});
Object.defineProperty(exports, 'AuSlotsInfo', {
    enumerable: true,
    get: function () {
        return runtimeHtml.AuSlotsInfo;
    }
});
Object.defineProperty(exports, 'Bindable', {
    enumerable: true,
    get: function () {
        return runtimeHtml.Bindable;
    }
});
Object.defineProperty(exports, 'BindingBehavior', {
    enumerable: true,
    get: function () {
        return runtimeHtml.BindingBehavior;
    }
});
Object.defineProperty(exports, 'BindingMode', {
    enumerable: true,
    get: function () {
        return runtimeHtml.BindingMode;
    }
});
Object.defineProperty(exports, 'ComputedObserver', {
    enumerable: true,
    get: function () {
        return runtimeHtml.ComputedObserver;
    }
});
Object.defineProperty(exports, 'ComputedWatcher', {
    enumerable: true,
    get: function () {
        return runtimeHtml.ComputedWatcher;
    }
});
Object.defineProperty(exports, 'Controller', {
    enumerable: true,
    get: function () {
        return runtimeHtml.Controller;
    }
});
Object.defineProperty(exports, 'CustomAttribute', {
    enumerable: true,
    get: function () {
        return runtimeHtml.CustomAttribute;
    }
});
Object.defineProperty(exports, 'CustomElement', {
    enumerable: true,
    get: function () {
        return runtimeHtml.CustomElement;
    }
});
Object.defineProperty(exports, 'ExpressionWatcher', {
    enumerable: true,
    get: function () {
        return runtimeHtml.ExpressionWatcher;
    }
});
Object.defineProperty(exports, 'IAppRoot', {
    enumerable: true,
    get: function () {
        return runtimeHtml.IAppRoot;
    }
});
Object.defineProperty(exports, 'IAttrMapper', {
    enumerable: true,
    get: function () {
        return runtimeHtml.IAttrMapper;
    }
});
Object.defineProperty(exports, 'IAttributePattern', {
    enumerable: true,
    get: function () {
        return runtimeHtml.IAttributePattern;
    }
});
Object.defineProperty(exports, 'IAuSlotsInfo', {
    enumerable: true,
    get: function () {
        return runtimeHtml.IAuSlotsInfo;
    }
});
Object.defineProperty(exports, 'IAurelia', {
    enumerable: true,
    get: function () {
        return runtimeHtml.IAurelia;
    }
});
Object.defineProperty(exports, 'IEventTarget', {
    enumerable: true,
    get: function () {
        return runtimeHtml.IEventTarget;
    }
});
Object.defineProperty(exports, 'ILifecycleHooks', {
    enumerable: true,
    get: function () {
        return runtimeHtml.ILifecycleHooks;
    }
});
Object.defineProperty(exports, 'INode', {
    enumerable: true,
    get: function () {
        return runtimeHtml.INode;
    }
});
Object.defineProperty(exports, 'IObserverLocator', {
    enumerable: true,
    get: function () {
        return runtimeHtml.IObserverLocator;
    }
});
Object.defineProperty(exports, 'IPlatform', {
    enumerable: true,
    get: function () {
        return runtimeHtml.IPlatform;
    }
});
Object.defineProperty(exports, 'IRenderLocation', {
    enumerable: true,
    get: function () {
        return runtimeHtml.IRenderLocation;
    }
});
Object.defineProperty(exports, 'ISignaler', {
    enumerable: true,
    get: function () {
        return runtimeHtml.ISignaler;
    }
});
Object.defineProperty(exports, 'ITemplateCompilerHooks', {
    enumerable: true,
    get: function () {
        return runtimeHtml.ITemplateCompilerHooks;
    }
});
Object.defineProperty(exports, 'IWorkTracker', {
    enumerable: true,
    get: function () {
        return runtimeHtml.IWorkTracker;
    }
});
Object.defineProperty(exports, 'LifecycleFlags', {
    enumerable: true,
    get: function () {
        return runtimeHtml.LifecycleFlags;
    }
});
Object.defineProperty(exports, 'LifecycleHooks', {
    enumerable: true,
    get: function () {
        return runtimeHtml.LifecycleHooks;
    }
});
Object.defineProperty(exports, 'NodeObserverLocator', {
    enumerable: true,
    get: function () {
        return runtimeHtml.NodeObserverLocator;
    }
});
Object.defineProperty(exports, 'ShortHandBindingSyntax', {
    enumerable: true,
    get: function () {
        return runtimeHtml.ShortHandBindingSyntax;
    }
});
Object.defineProperty(exports, 'StyleConfiguration', {
    enumerable: true,
    get: function () {
        return runtimeHtml.StyleConfiguration;
    }
});
Object.defineProperty(exports, 'TaskQueuePriority', {
    enumerable: true,
    get: function () {
        return runtimeHtml.TaskQueuePriority;
    }
});
Object.defineProperty(exports, 'TemplateCompilerHooks', {
    enumerable: true,
    get: function () {
        return runtimeHtml.TemplateCompilerHooks;
    }
});
Object.defineProperty(exports, 'ValueConverter', {
    enumerable: true,
    get: function () {
        return runtimeHtml.ValueConverter;
    }
});
Object.defineProperty(exports, 'ViewFactory', {
    enumerable: true,
    get: function () {
        return runtimeHtml.ViewFactory;
    }
});
Object.defineProperty(exports, 'Watch', {
    enumerable: true,
    get: function () {
        return runtimeHtml.Watch;
    }
});
Object.defineProperty(exports, 'alias', {
    enumerable: true,
    get: function () {
        return runtimeHtml.alias;
    }
});
Object.defineProperty(exports, 'attributePattern', {
    enumerable: true,
    get: function () {
        return runtimeHtml.attributePattern;
    }
});
Object.defineProperty(exports, 'bindable', {
    enumerable: true,
    get: function () {
        return runtimeHtml.bindable;
    }
});
Object.defineProperty(exports, 'bindingBehavior', {
    enumerable: true,
    get: function () {
        return runtimeHtml.bindingBehavior;
    }
});
Object.defineProperty(exports, 'bindingCommand', {
    enumerable: true,
    get: function () {
        return runtimeHtml.bindingCommand;
    }
});
Object.defineProperty(exports, 'children', {
    enumerable: true,
    get: function () {
        return runtimeHtml.children;
    }
});
Object.defineProperty(exports, 'containerless', {
    enumerable: true,
    get: function () {
        return runtimeHtml.containerless;
    }
});
Object.defineProperty(exports, 'createElement', {
    enumerable: true,
    get: function () {
        return runtimeHtml.createElement;
    }
});
Object.defineProperty(exports, 'cssModules', {
    enumerable: true,
    get: function () {
        return runtimeHtml.cssModules;
    }
});
Object.defineProperty(exports, 'customAttribute', {
    enumerable: true,
    get: function () {
        return runtimeHtml.customAttribute;
    }
});
Object.defineProperty(exports, 'customElement', {
    enumerable: true,
    get: function () {
        return runtimeHtml.customElement;
    }
});
Object.defineProperty(exports, 'lifecycleHooks', {
    enumerable: true,
    get: function () {
        return runtimeHtml.lifecycleHooks;
    }
});
Object.defineProperty(exports, 'registerAliases', {
    enumerable: true,
    get: function () {
        return runtimeHtml.registerAliases;
    }
});
Object.defineProperty(exports, 'renderer', {
    enumerable: true,
    get: function () {
        return runtimeHtml.renderer;
    }
});
Object.defineProperty(exports, 'shadowCSS', {
    enumerable: true,
    get: function () {
        return runtimeHtml.shadowCSS;
    }
});
Object.defineProperty(exports, 'subscriberCollection', {
    enumerable: true,
    get: function () {
        return runtimeHtml.subscriberCollection;
    }
});
Object.defineProperty(exports, 'templateCompilerHooks', {
    enumerable: true,
    get: function () {
        return runtimeHtml.templateCompilerHooks;
    }
});
Object.defineProperty(exports, 'templateController', {
    enumerable: true,
    get: function () {
        return runtimeHtml.templateController;
    }
});
Object.defineProperty(exports, 'useShadowDOM', {
    enumerable: true,
    get: function () {
        return runtimeHtml.useShadowDOM;
    }
});
Object.defineProperty(exports, 'valueConverter', {
    enumerable: true,
    get: function () {
        return runtimeHtml.valueConverter;
    }
});
Object.defineProperty(exports, 'watch', {
    enumerable: true,
    get: function () {
        return runtimeHtml.watch;
    }
});
Object.defineProperty(exports, 'HttpClient', {
    enumerable: true,
    get: function () {
        return fetchClient.HttpClient;
    }
});
Object.defineProperty(exports, 'HttpClientConfiguration', {
    enumerable: true,
    get: function () {
        return fetchClient.HttpClientConfiguration;
    }
});
Object.defineProperty(exports, 'IHttpClient', {
    enumerable: true,
    get: function () {
        return fetchClient.IHttpClient;
    }
});
Object.defineProperty(exports, 'json', {
    enumerable: true,
    get: function () {
        return fetchClient.json;
    }
});
Object.defineProperty(exports, 'IRouteContext', {
    enumerable: true,
    get: function () {
        return router.IRouteContext;
    }
});
Object.defineProperty(exports, 'IRouter', {
    enumerable: true,
    get: function () {
        return router.IRouter;
    }
});
Object.defineProperty(exports, 'IRouterEvents', {
    enumerable: true,
    get: function () {
        return router.IRouterEvents;
    }
});
Object.defineProperty(exports, 'Route', {
    enumerable: true,
    get: function () {
        return router.Route;
    }
});
Object.defineProperty(exports, 'RouteConfig', {
    enumerable: true,
    get: function () {
        return router.RouteConfig;
    }
});
Object.defineProperty(exports, 'RouteNode', {
    enumerable: true,
    get: function () {
        return router.RouteNode;
    }
});
Object.defineProperty(exports, 'Router', {
    enumerable: true,
    get: function () {
        return router.Router;
    }
});
Object.defineProperty(exports, 'RouterConfiguration', {
    enumerable: true,
    get: function () {
        return router.RouterConfiguration;
    }
});
Object.defineProperty(exports, 'RouterOptions', {
    enumerable: true,
    get: function () {
        return router.RouterOptions;
    }
});
Object.defineProperty(exports, 'RouterRegistration', {
    enumerable: true,
    get: function () {
        return router.RouterRegistration;
    }
});
Object.defineProperty(exports, 'route', {
    enumerable: true,
    get: function () {
        return router.route;
    }
});
exports.Aurelia = Aurelia;
exports.PLATFORM = PLATFORM;
exports.default = Aurelia;
//# sourceMappingURL=index.js.map
