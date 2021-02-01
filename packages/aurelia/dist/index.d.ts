import { IContainer } from '@aurelia/kernel';
import { Aurelia as $Aurelia, IPlatform, IAppRoot, ISinglePageApp } from '@aurelia/runtime-html';
import { BrowserPlatform } from '@aurelia/platform-browser';
export declare const PLATFORM: BrowserPlatform<typeof globalThis>;
export { IPlatform };
export declare class Aurelia extends $Aurelia {
    constructor(container?: IContainer);
    static start(root: IAppRoot | undefined): void | Promise<void>;
    static app(config: ISinglePageApp | unknown): Omit<Aurelia, 'register' | 'app' | 'enhance'>;
    static enhance(config: ISinglePageApp): Omit<Aurelia, 'register' | 'app' | 'enhance'>;
    static register(...params: readonly unknown[]): Aurelia;
    app(config: ISinglePageApp | unknown): Omit<this, 'register' | 'app' | 'enhance'>;
}
export default Aurelia;
export { Interceptor, json, HttpClientConfiguration, HttpClient, IHttpClient, } from '@aurelia/fetch-client';
export { all, DI, IContainer, inject, IRegistration, IRegistry, IResolver, IServiceLocator, Key, lazy, optional, Registration, singleton, transient, InstanceProvider, Resolved, Class, Constructable, ConstructableClass, IDisposable, IIndexable, Metadata, ColorOptions, ILogger, ConsoleSink, LoggerConfiguration, emptyArray, emptyObject, noop, LogLevel, EventAggregator, IEventAggregator, isArrayIndex, camelCase, kebabCase, pascalCase, toArray, bound, } from '@aurelia/kernel';
export { RouterOptions, IRouter, IRouterEvents, Router, RouteNode, route, Route, RouteConfig, IRouteContext, IRouteViewModel, NavigationInstruction, Routeable, Params, RouterConfiguration, RouterRegistration, } from '@aurelia/router';
export { ComputedObserver, ComputedWatcher, ExpressionWatcher, Watch, watch, IObserverLocator, ISignaler, subscriberCollection, bindingBehavior, BindingBehavior, BindingBehaviorInstance, customAttribute, CustomAttribute, templateController, containerless, customElement, CustomElement, useShadowDOM, ValueConverter, ValueConverterInstance, valueConverter, AppTask, TaskQueuePriority, bindable, PartialBindableDefinition, Bindable, children, Controller, ViewFactory, IAppRoot, IWorkTracker, alias, registerAliases, INode, IEventTarget, IRenderLocation, BindingMode, LifecycleFlags, ICustomAttributeViewModel, ICustomElementViewModel, IndexMap, renderer, IAurelia, NodeObserverLocator, IAuSlotsInfo, AuSlotsInfo, attributePattern, IAttributePattern, IAttrSyntaxTransformer, bindingCommand, BindingCommandInstance, getTarget, ShortHandBindingSyntax, createElement, StyleConfiguration, IShadowDOMConfiguration, cssModules, shadowCSS, ILifecycleHooks, LifecycleHook, LifecycleHooks, lifecycleHooks, } from '@aurelia/runtime-html';
//# sourceMappingURL=index.d.ts.map