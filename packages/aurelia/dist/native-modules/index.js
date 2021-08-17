import { DI as e, Registration as t } from "../../../@aurelia/kernel/dist/native-modules/index.js";

export { ColorOptions, ConsoleSink, DI, EventAggregator, IContainer, IEventAggregator, ILogger, IServiceLocator, InstanceProvider, LogLevel, LoggerConfiguration, Metadata, Registration, all, bound, camelCase, emptyArray, emptyObject, inject, isArrayIndex, kebabCase, lazy, noop, optional, pascalCase, singleton, toArray, transient } from "../../../@aurelia/kernel/dist/native-modules/index.js";

import { Aurelia as o, IPlatform as r, StandardConfiguration as a, CustomElement as i } from "../../../@aurelia/runtime-html/dist/native-modules/index.js";

export { AppTask, AuSlotsInfo, Bindable, BindingBehavior, BindingMode, ComputedObserver, ComputedWatcher, Controller, CustomAttribute, CustomElement, DefaultDialogDom, DefaultDialogDomRenderer, DefaultDialogGlobalSettings, DialogCloseResult, DialogConfiguration, DialogController, DialogDeactivationStatuses, DialogDefaultConfiguration, DialogOpenResult, DialogService, ExpressionWatcher, IAppRoot, IAttrMapper, IAttributePattern, IAuSlotsInfo, IAurelia, IDialogController, IDialogDom, IDialogDomRenderer, IDialogGlobalSettings, IDialogService, IEventTarget, ILifecycleHooks, INode, IObserverLocator, IPlatform, IRenderLocation, ISignaler, ITemplateCompilerHooks, IWcElementRegistry, IWorkTracker, LifecycleFlags, LifecycleHooks, NodeObserverLocator, ShortHandBindingSyntax, StyleConfiguration, TaskQueuePriority, TemplateCompilerHooks, ValueConverter, ViewFactory, Watch, WcCustomElementRegistry, alias, attributePattern, bindable, bindingBehavior, bindingCommand, children, containerless, createElement, cssModules, customAttribute, customElement, lifecycleHooks, registerAliases, renderer, shadowCSS, subscriberCollection, templateCompilerHooks, templateController, useShadowDOM, valueConverter, watch } from "../../../@aurelia/runtime-html/dist/native-modules/index.js";

import { BrowserPlatform as n } from "../../../@aurelia/platform-browser/dist/native-modules/index.js";

export { HttpClient, HttpClientConfiguration, IHttpClient, json } from "../../../@aurelia/fetch-client/dist/native-modules/index.js";

export { IRouteContext, IRouter, IRouterEvents, Route, RouteConfig, RouteNode, Router, RouterConfiguration, RouterOptions, RouterRegistration, route } from "../../../@aurelia/router/dist/native-modules/index.js";

const l = n.getOrCreate(globalThis);

function u() {
    return e.createContainer().register(t.instance(r, l), a);
}

class Aurelia extends o {
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
        if (i.isType(e)) {
            const t = i.getDefinition(e);
            let o = document.querySelector(t.name);
            if (null === o) o = document.body;
            return super.app({
                host: o,
                component: e
            });
        }
        return super.app(e);
    }
}

export { Aurelia, l as PLATFORM, Aurelia as default };
//# sourceMappingURL=index.js.map
