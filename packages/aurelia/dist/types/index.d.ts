import { IContainer } from '@aurelia/kernel';
import { Aurelia as $Aurelia, IPlatform, CustomElementType, ICustomElementViewModel } from '@aurelia/runtime-html';
import { BrowserPlatform } from '@aurelia/platform-browser';
import type { ISinglePageAppConfig, IEnhancementConfig } from '@aurelia/runtime-html';
export declare const PLATFORM: BrowserPlatform<typeof globalThis>;
export { IPlatform };
export declare class Aurelia extends $Aurelia {
    constructor(container?: IContainer);
    static app(config: ISinglePageAppConfig | CustomElementType): Omit<Aurelia, 'register' | 'app' | 'enhance'>;
    static enhance<T extends ICustomElementViewModel>(config: IEnhancementConfig<T>): ReturnType<$Aurelia['enhance']>;
    static register(...params: readonly unknown[]): Aurelia;
    app(config: ISinglePageAppConfig | CustomElementType): Omit<this, 'register' | 'app' | 'enhance'>;
}
export default Aurelia;
export { type ITask, Platform, type QueueTaskOptions, Task, TaskAbortError, TaskQueue, type TaskStatus } from '@aurelia/platform';
export { all, DI, IContainer, type IFactory, inject, resolve, type IRegistration, type IRegistry, type IResolver, IServiceLocator, type Key, lazy, factory, newInstanceOf, newInstanceForScope, optional, resource, allResources, ignore, Registration, singleton, transient, InstanceProvider, type Resolved, type Class, type Constructable, type ConstructableClass, type IDisposable, type IIndexable, type ColorOptions, ILogger, ConsoleSink, LoggerConfiguration, emptyArray, emptyObject, noop, LogLevel, EventAggregator, IEventAggregator, isArrayIndex, camelCase, kebabCase, pascalCase, toArray, bound, } from '@aurelia/kernel';
export { IExpressionParser, CustomExpression, } from '@aurelia/expression-parser';
export { type CollectionKind, batch, ComputedObserver, IObservation, IObserverLocator, subscriberCollection, observable, type IndexMap, Scope, } from '@aurelia/runtime';
export { attributePattern, AttributePattern, IAttrMapper, IAttributeParser, IAttributePattern, bindingCommand, BindingCommand, type BindingCommandInstance, ITemplateCompiler, ITemplateElementFactory, ITemplateCompilerHooks, TemplateCompilerHooks, templateCompilerHooks, type BindingCommandStaticAuDefinition, } from '@aurelia/template-compiler';
export { type BindingBehaviorInstance, type ValueConverterInstance, customAttribute, CustomAttribute, templateController, IRepeatableHandlerResolver, IRepeatableHandler, ArrayLikeHandler, containerless, customElement, CustomElement, capture, useShadowDOM, AppTask, BindingMode, bindable, type PartialBindableDefinition, Bindable, coercer, type PartialChildrenDefinition, children, Controller, ViewFactory, type ISinglePageAppConfig, IAppRoot, INode, IEventTarget, IRenderLocation, type ICustomAttributeViewModel, type ICustomElementViewModel, IController, IViewFactory, IFlushQueue, FlushQueue, type IFlushable, renderer, IAurelia, NodeObserverLocator, type IAuSlot, IAuSlotsInfo, AuSlotsInfo, IAuSlotWatcher, slotted, ChildrenBinding, RuntimeTemplateCompilerImplementation, alias, registerAliases, bindingBehavior, BindingBehavior, valueConverter, ValueConverter, type IEnhancementConfig, type IHydratedParentController, ShortHandBindingSyntax, StyleConfiguration, type IShadowDOMConfiguration, cssModules, shadowCSS, processContent, ILifecycleHooks, type LifecycleHook, LifecycleHooks, lifecycleHooks, watch, IKeyMapping, IModifiedEventHandlerCreator, IEventModifier, type IModifiedEventHandler, ISignaler, IWindow, IHistory, refs, } from '@aurelia/runtime-html';
//# sourceMappingURL=index.d.ts.map