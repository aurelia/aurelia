import { DI as e, Registration as t } from "@aurelia/kernel";

export { ColorOptions, ConsoleSink, DI, EventAggregator, IContainer, IEventAggregator, ILogger, IServiceLocator, InstanceProvider, LogLevel, LoggerConfiguration, Metadata, Registration, all, bound, camelCase, emptyArray, emptyObject, inject, isArrayIndex, kebabCase, lazy, noop, optional, pascalCase, singleton, toArray, transient } from "@aurelia/kernel";

import { Aurelia as r, IPlatform as o, StandardConfiguration as a, CustomElement as n } from "@aurelia/runtime-html";

export { AppTask, AuSlotsInfo, Bindable, BindingBehavior, BindingMode, ComputedObserver, ComputedWatcher, Controller, CustomAttribute, CustomElement, ExpressionWatcher, IAppRoot, IAttrMapper, IAttributePattern, IAuSlotsInfo, IAurelia, IEventTarget, ILifecycleHooks, INode, IObserverLocator, IPlatform, IRenderLocation, ISignaler, ITemplateCompilerHooks, IWorkTracker, LifecycleFlags, LifecycleHooks, NodeObserverLocator, ShortHandBindingSyntax, StyleConfiguration, TaskQueuePriority, TemplateCompilerHooks, ValueConverter, ViewFactory, Watch, alias, attributePattern, bindable, bindingBehavior, bindingCommand, children, containerless, createElement, cssModules, customAttribute, customElement, lifecycleHooks, registerAliases, renderer, shadowCSS, subscriberCollection, templateCompilerHooks, templateController, useShadowDOM, valueConverter, watch } from "@aurelia/runtime-html";

import { BrowserPlatform as i } from "@aurelia/platform-browser";

export { HttpClient, HttpClientConfiguration, IHttpClient, json } from "@aurelia/fetch-client";

export { IRouteContext, IRouter, IRouterEvents, Route, RouteConfig, RouteNode, Router, RouterConfiguration, RouterOptions, RouterRegistration, route } from "@aurelia/router";

const l = i.getOrCreate(globalThis);

function u() {
    return e.createContainer().register(t.instance(o, l), a);
}

class Aurelia extends r {
    constructor(e = u()) {
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
        if (n.isType(e)) {
            const t = n.getDefinition(e);
            let r = document.querySelector(t.name);
            if (null === r) r = document.body;
            return super.app({
                host: r,
                component: e
            });
        }
        return super.app(e);
    }
}

export default Aurelia;

export { Aurelia, l as PLATFORM };
//# sourceMappingURL=index.js.map
