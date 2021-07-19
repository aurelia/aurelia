import { DI, Registration } from '@aurelia/kernel';
export { ColorOptions, ConsoleSink, DI, EventAggregator, IContainer, IEventAggregator, ILogger, IServiceLocator, InstanceProvider, LogLevel, LoggerConfiguration, Metadata, Registration, all, bound, camelCase, emptyArray, emptyObject, inject, isArrayIndex, kebabCase, lazy, noop, optional, pascalCase, singleton, toArray, transient } from '@aurelia/kernel';
import { Aurelia as Aurelia$1, IPlatform, StandardConfiguration, CustomElement } from '@aurelia/runtime-html';
export { AppTask, AuSlotsInfo, Bindable, BindingBehavior, BindingMode, ComputedObserver, ComputedWatcher, Controller, CustomAttribute, CustomElement, ExpressionWatcher, IAppRoot, IAttrMapper, IAttributePattern, IAuSlotsInfo, IAurelia, IEventTarget, ILifecycleHooks, INode, IObserverLocator, IPlatform, IRenderLocation, ISignaler, ITemplateCompilerHooks, IWorkTracker, LifecycleFlags, LifecycleHooks, NodeObserverLocator, ShortHandBindingSyntax, StyleConfiguration, TaskQueuePriority, TemplateCompilerHooks, ValueConverter, ViewFactory, Watch, alias, attributePattern, bindable, bindingBehavior, bindingCommand, children, containerless, createElement, cssModules, customAttribute, customElement, lifecycleHooks, registerAliases, renderer, shadowCSS, subscriberCollection, templateCompilerHooks, templateController, useShadowDOM, valueConverter, watch } from '@aurelia/runtime-html';
import { BrowserPlatform } from '@aurelia/platform-browser';
export { HttpClient, HttpClientConfiguration, IHttpClient, json } from '@aurelia/fetch-client';
export { IRouteContext, IRouter, IRouterEvents, Route, RouteConfig, RouteNode, Router, RouterConfiguration, RouterOptions, RouterRegistration, route } from '@aurelia/router';

const PLATFORM = BrowserPlatform.getOrCreate(globalThis);
function createContainer() {
    return DI.createContainer()
        .register(Registration.instance(IPlatform, PLATFORM), StandardConfiguration);
}
class Aurelia extends Aurelia$1 {
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
        if (CustomElement.isType(config)) {
            // Default to custom element element name
            const definition = CustomElement.getDefinition(config);
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

export default Aurelia;
export { Aurelia, PLATFORM };
//# sourceMappingURL=index.js.map
