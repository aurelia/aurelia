import { DI, IContainer, Registration } from '@aurelia/kernel';
import { StandardConfiguration, Aurelia as $Aurelia, IPlatform, IAppRoot, CustomElementType, CustomElement, IHydratedParentController } from '@aurelia/runtime-html';
import { BrowserPlatform } from '@aurelia/platform-browser';
import type { ISinglePageApp, IEnhancementConfig } from '@aurelia/runtime-html';

export const PLATFORM = BrowserPlatform.getOrCreate(globalThis);
export { IPlatform };

function createContainer(): IContainer {
  return DI.createContainer()
    .register(
      Registration.instance(IPlatform, PLATFORM),
      StandardConfiguration,
    );
}

export class Aurelia extends $Aurelia {
  public constructor(container: IContainer = createContainer()) {
    super(container);
  }

  public static start(root: IAppRoot | undefined): void | Promise<void> {
    return new Aurelia().start(root);
  }

  public static app(config: ISinglePageApp | unknown): Omit<Aurelia, 'register' | 'app' | 'enhance'> {
    return new Aurelia().app(config);
  }

  public static enhance<T>(config: IEnhancementConfig<T>, parentController?: IHydratedParentController): ReturnType<$Aurelia['enhance']> {
    return new Aurelia().enhance(config, parentController);
  }

  public static register(...params: readonly unknown[]): Aurelia {
    return new Aurelia().register(...params);
  }

  public app(config: ISinglePageApp | unknown): Omit<this, 'register' | 'app' | 'enhance'> {
    if (CustomElement.isType(config as CustomElementType)) {
      // Default to custom element element name
      const definition = CustomElement.getDefinition(config as CustomElementType);
      let host = document.querySelector(definition.name);
      if (host === null) {
        // When no target is found, default to body.
        // For example, when user forgot to write <my-app></my-app> in html.
        host = document.body;
      }
      return super.app({
        host: host as HTMLElement,
        component: config as CustomElementType
      });
    }

    return super.app(config as ISinglePageApp);
  }
}

export default Aurelia;

export {
  type Interceptor,
  // RetryConfiguration,
  // RetryableRequest,
  // ValidInterceptorMethodName,

  json,

  // retryStrategy,
  // RetryInterceptor,

  HttpClientConfiguration,

  HttpClient,
  IHttpClient,
} from '@aurelia/fetch-client';

export {
  Metadata,
  // isNullOrUndefined,
  // isObject,
  // metadata,
  // applyMetadataPolyfill,
} from '@aurelia/metadata';

export {
  type ITask,
  Platform,
  type QueueTaskOptions,
  Task,
  TaskAbortError,
  TaskQueue,
  TaskQueuePriority,
  TaskStatus
} from '@aurelia/platform';

export {
  all,
  DI,
  IContainer,
  // IDefaultableInterfaceSymbol,
  // IFactory,
  inject,
  type IRegistration,
  type IRegistry,
  type IResolver,
  IServiceLocator,
  type Key,
  lazy,
  optional,
  // RegisterSelf,
  Registration,
  // ResolveCallback,
  singleton,
  transient,
  // Injectable,
  // InterfaceSymbol,
  InstanceProvider,
  type Resolved,
  // Transformer,

  type Class,
  type Constructable,
  type ConstructableClass,
  // Diff,
  type IDisposable,
  // IFrameRequestCallback,
  type IIndexable,
  // IPerformance,
  // ITimerHandler,
  // IWindowOrWorkerGlobalScope,
  // KnownKeys,
  // NoInfer,
  // Omit,
  // OptionalKnownKeys,
  // OptionalValuesOf,
  // Overwrite,
  // Param0,
  // Param1,
  // Param2,
  // Param3,
  // Pick2,
  // Pick3,
  // Primitive,
  // Public,
  // Purify,
  // RequiredKnownKeys,
  // RequiredValuesOf,
  // StrictPrimitive,
  // Unwrap,
  // ValuesOf,
  // Writable,
  // IfEquals,
  // ReadonlyKeys,
  // WritableKeys,

  // IConsoleLike,
  ColorOptions,
  // ILogConfig,
  // ILogEvent,
  // ILogEventFactory,
  // ISink,
  ILogger,
  // LogConfig,
  // DefaultLogEvent,
  // DefaultLogEventFactory,
  // DefaultLogger,
  ConsoleSink,
  LoggerConfiguration,

  // relativeToFile,
  // join,
  // parseQueryString,
  // IQueryParams,

  emptyArray,
  emptyObject,
  noop,

  // ITraceInfo,
  // ITraceWriter,
  // ILiveLoggingOptions,
  LogLevel,

  // IResourceDefinition,
  // IResourceDescriptions,
  // IResourceKind,
  // IResourceType,
  // ResourceDescription,
  // ResourcePartDescription,
  // fromAnnotationOrDefinitionOrTypeOrDefault,
  // fromAnnotationOrTypeOrDefault,
  // fromDefinitionOrDefault,

  EventAggregator,
  IEventAggregator,

  isArrayIndex,
  camelCase,
  kebabCase,
  pascalCase,
  toArray,
  bound,
  // mergeArrays,
  // firstDefined,
  // getPrototypeChain,
} from '@aurelia/kernel';

export {
  RouterOptions,
  IRouter,
  IRouterEvents,
  Router,
  RouteNode,
  route,
  Route,
  RouteConfig,
  IRouteContext,
  type IRouteViewModel,
  type NavigationInstruction,
  type Routeable,
  type Params,

  RouterConfiguration,
  RouterRegistration,
} from '@aurelia/router-lite';

export {
  CollectionKind,
  batch,
  // CallFunctionExpression,
  // connects,
  // observes,
  // callsFunction,
  // hasAncestor,
  // isAssignable,
  // isLeftHandSide,
  // isPrimary,
  // isResource,
  // hasBind,
  // hasUnbind,
  // isLiteral,
  // arePureLiterals,
  // isPureLiteral,
  // CustomExpression,
  // BindingBehaviorExpression,
  // ValueConverterExpression,
  // AssignExpression,
  // ConditionalExpression,
  // AccessThisExpression,
  // AccessScopeExpression,
  // AccessMemberExpression,
  // AccessKeyedExpression,
  // CallScopeExpression,
  // CallMemberExpression,
  // BinaryExpression,
  // UnaryExpression,
  // PrimitiveLiteralExpression,
  // ArrayLiteralExpression,
  // ObjectLiteralExpression,
  // TemplateExpression,
  // TaggedTemplateExpression,
  // ArrayBindingPattern,
  // ObjectBindingPattern,
  // BindingIdentifier,
  // ForOfStatement,
  // Interpolation,

  // AnyBindingExpression,
  // IsPrimary,
  // IsLiteral,
  // IsLeftHandSide,
  // IsUnary,
  // IsBinary,
  // IsConditional,
  // IsAssign,
  // IsValueConverter,
  // IsBindingBehavior,
  // IsAssignable,
  // IsExpression,
  // IsExpressionOrStatement,
  // Connects,
  // Observes,
  // CallsFunction,
  // IsResource,
  // HasBind,
  // HasUnbind,
  // HasAncestor,
  // IVisitor,
  // IExpression,
  // IAccessKeyedExpression,
  // IAccessMemberExpression,
  // IAccessScopeExpression,
  // IAccessThisExpression,
  // IArrayBindingPattern,
  // IArrayLiteralExpression,
  // IAssignExpression,
  // IBinaryExpression,
  // IBindingBehaviorExpression,
  // IBindingIdentifier,
  // ICallFunctionExpression,
  // ICallMemberExpression,
  // ICallScopeExpression,
  // IConditionalExpression,
  // ForOfStatement,
  // Interpolation,
  // IObjectBindingPattern,
  // IObjectLiteralExpression,
  // IPrimitiveLiteralExpression,
  // ITaggedTemplateExpression,
  // ITemplateExpression,
  // IUnaryExpression,
  // IValueConverterExpression,
  // BinaryOperator,
  // BindingIdentifierOrPattern,
  // UnaryOperator,

  // IObserverLocatorBasedConnectable,
  // IConnectableBinding,
  // connectable,

  // IExpressionParser,
  // ExpressionType,

  // ArrayObserver,
  // enableArrayObservation,
  // disableArrayObservation,
  // applyMutationsToIndices,
  // synchronizeIndices,

  // MapObserver,
  // enableMapObservation,
  // disableMapObservation,

  // SetObserver,
  // enableSetObservation,
  // disableSetObservation,

  // BindingContext,
  // OverrideContext,

  // CollectionLengthObserver,

  // CollectionSizeObserver,

  // IDirtyChecker,
  // DirtyCheckProperty,
  // DirtyCheckSettings,

  ComputedObserver,

  // IObjectObservationAdapter,
  IObserverLocator,
  // ITargetObserverLocator,
  // ITargetAccessorLocator,
  // getCollectionObserver,
  // ObserverLocator,

  // PrimitiveObserver,

  // PropertyAccessor,

  // BindableObserver,

  // SetterObserver,

  ISignaler,

  subscriberCollection,

  type BindingBehaviorInstance,
  // PartialBindingBehaviorDefinition,
  // BindingBehaviorKind,
  // BindingBehaviorDecorator,
  // BindingBehaviorInstance,
  // BindingBehaviorType,

  // BindingModeBehavior,
  // OneTimeBindingBehavior,
  // ToViewBindingBehavior,
  // FromViewBindingBehavior,
  // TwoWayBindingBehavior,

  // DebounceBindingBehavior,

  // SignalableBinding,
  // SignalBindingBehavior,

  // ObserveShallow,
  // ISanitizer,
  // SanitizeValueConverter,

  // ViewValueConverter,

  observable,

  // IfRegistration,
  // ElseRegistration,
  // RepeatRegistration,
  // ReplaceableRegistration,
  // WithRegistration,

  // DefaultResources as RuntimeDefaultResources,
  // IObserverLocatorRegistration,
  // IRendererRegistration,
  // RuntimeConfiguration,

  // ExpressionKind,
  // Hooks,
  // State,

  // CallBindingInstruction,
  // HydrateAttributeInstruction,
  // HydrateElementInstruction,
  // HydrateTemplateController,
  // InterpolationInstruction,
  // IteratorBindingInstruction,
  // LetBindingInstruction,
  // HydrateLetElementInstruction,
  // RefBindingInstruction,
  // SetPropertyInstruction,

  // ViewModelKind,
  // IBinding,
  // IViewModel,
  // IController,
  // IContainer,
  // IViewCache,
  // IViewFactory,
  // MountStrategy,

  // AccessorOrObserver,
  // Collection,
  // CollectionKind,
  // DelegationStrategy,
  // IAccessor,
  // IBindingContext,
  // ICollectionChangeTracker,
  // ICollectionObserver,
  // ICollectionSubscriber,

  // ValueConverterDefinition,
  // PartialValueConverterDefinition,
  // ValueConverterKind,
  // ValueConverterDecorator,
  type ValueConverterInstance,
  // ValueConverterType,
  type IndexMap,

} from '@aurelia/runtime';

export {
  LifecycleFlags,
  // PartialBindingBehaviorDefinition,
  // BindingBehaviorKind,
  // BindingBehaviorDecorator,
  // BindingBehaviorInstance,
  // BindingBehaviorType,

  // BindingModeBehavior,
  // OneTimeBindingBehavior,
  // ToViewBindingBehavior,
  // FromViewBindingBehavior,
  // TwoWayBindingBehavior,

  // DebounceBindingBehavior,

  // SignalableBinding,
  // SignalBindingBehavior,

  // ThrottleBindingBehavior,

  customAttribute,
  // CustomAttributeDecorator,
  CustomAttribute,
  // CustomAttributeDefinition
  // CustomAttributeKind,
  // CustomAttributeType,
  // PartialCustomAttributeDefinition,
  templateController,

  // ObserveShallow,

  // If,
  // Else,

  // Repeat,

  // Replaceable,

  // With,

  containerless,
  customElement,
  CustomElement,
  strict,
  capture,
  // CustomElementDecorator,
  // CustomElementKind,
  // CustomElementType,
  // CustomElementDefinition,
  // PartialCustomElementDefinition,
  // IElementProjector,
  // IProjectorLocator,
  useShadowDOM,

  // ISanitizer,
  // SanitizeValueConverter,

  // ViewValueConverter,

  AppTask,
  // TaskStatus,
  // QueueTaskTargetOptions,

  BindingMode,

  bindable,
  type PartialBindableDefinition,
  // BindableDefinition,
  Bindable,
  coercer,

  // PartialChildrenDefinition,
  // ChildrenDefinition,
  // Children,
  children,

  // These exports are temporary until we have a proper way to unit test them
  Controller,

  ViewFactory,
  // IViewLocator,
  // ViewLocator,
  // view,
  // Views,

  // Aurelia, // Replaced by quick-start wrapper
  // IDOMInitializer,
  // ISinglePageApp,
  IAppRoot,

  // IfRegistration,
  // ElseRegistration,
  // RepeatRegistration,
  // ReplaceableRegistration,
  // WithRegistration,

  // SanitizeValueConverterRegistration,

  // DebounceBindingBehaviorRegistration,
  // OneTimeBindingBehaviorRegistration,
  // ToViewBindingBehaviorRegistration,
  // FromViewBindingBehaviorRegistration,
  // SignalBindingBehaviorRegistration,
  // ThrottleBindingBehaviorRegistration,
  // TwoWayBindingBehaviorRegistration,

  // RefBindingRendererRegistration,
  // CallBindingRendererRegistration,
  // CustomAttributeRendererRegistration,
  // CustomElementRendererRegistration,
  // InterpolationBindingRendererRegistration,
  // IteratorBindingRendererRegistration,
  // LetElementRendererRegistration,
  // PropertyBindingRendererRegistration,
  // SetPropertyRendererRegistration,
  // TemplateControllerRendererRegistration,

  // DefaultResources as RuntimeDefaultResources,
  // IObserverLocatorRegistration,
  // IRendererRegistration,
  // RuntimeConfiguration,

  // AttributeInstruction,
  // ICallBindingInstruction,
  // IHydrateAttributeInstruction,
  // IHydrateElementInstruction,
  // IHydrateLetElementInstruction,
  // IHydrateTemplateController,
  // IInterpolationInstruction,
  // IIteratorBindingInstruction,
  // ILetBindingInstruction,
  // IInstructionRow,
  // InstructionTypeName,
  // IPropertyBindingInstruction,
  // IRefBindingInstruction,
  // ISetPropertyInstruction,
  // isInstruction,
  // IInstruction,
  // NodeInstruction,
  // IInstruction,
  // InstructionType,
  // PartialCustomElementDefinitionParts,

  // DOM, should expose the one exported in runtime-html
  INode,
  IEventTarget,
  IRenderLocation,

  // ViewModelKind,
  // IBinding,
  // IViewModel,
  type ICustomAttributeViewModel,
  type ICustomElementViewModel,
  // IController,
  // IContainer,
  // IViewCache,
  // IViewFactory,
  // MountStrategy,

  // AccessorOrObserver,
  // Collection,
  // CollectionKind,
  // DelegationStrategy,
  // IAccessor,
  // IBindingContext,
  // ICollectionChangeTracker,
  // ICollectionObserver,
  // ICollectionSubscriber,

  IFlushQueue,
  FlushQueue,
  IFlushable,

  renderer,

  // DefaultBindingLanguage as JitDefaultBindingLanguage,

  // JitConfiguration,

  // Access,
  // Precedence,
  // These exports are temporary until we have a proper way to unit test them

  // parseExpression,

  // BindableInfo,
  // ElementInfo,
  // AttrInfo,

  // AnySymbol,
  // BindingSymbol,
  // CustomAttributeSymbol,
  // CustomElementSymbol,
  // ElementSymbol,
  // LetElementSymbol,
  // NodeSymbol,
  // ParentNodeSymbol,
  // PlainAttributeSymbol,
  // PlainElementSymbol,
  // ReplacePartSymbol,
  // ResourceAttributeSymbol,
  // SymbolFlags,
  // SymbolWithBindings,
  // SymbolWithMarker,
  // SymbolWithTemplate,
  // TemplateControllerSymbol,
  // TextSymbol

  IAurelia,
  // Listener,

  // AttributeBinding,

  // AttributeNSAccessor,

  // IInputElement,
  // CheckedObserver,

  // ClassAttributeAccessor,

  // DataAttributeAccessor,

  // EventSubscriber,
  // EventDelegator,

  NodeObserverLocator,

  // TargetAccessorLocator,
  // TargetObserverLocator,

  // ISelectElement,
  // IOptionElement,
  // SelectValueObserver,

  // StyleAttributeAccessor,

  // ISVGAnalyzer,

  // ValueAttributeObserver,

  // AttrBindingBehavior,

  // SelfableBinding,
  // SelfBindingBehavior,

  // UpdateTriggerBindingBehavior,

  // Focus,

  // Portal,
  // PortalTarget,
  // PortalLifecycleCallback,

  // Subject,
  // Compose,
  IAuSlotsInfo,
  AuSlotsInfo,

  // IProjectorLocatorRegistration,
  // ITargetAccessorLocatorRegistration,
  // ITargetObserverLocatorRegistration,
  // ITemplateFactoryRegistration,

  // DefaultComponents as RuntimeHtmlDefaultComponents,

  // CompiledTemplate,
  // ChildrenObserver,
  // IRenderer,
  // IInstructionTypeClassifier,
  // IRenderingEngine,
  // ITemplate,
  ITemplateCompiler,
  // ITemplateFactory,
  ITemplateCompilerHooks,
  TemplateCompilerHooks,
  templateCompilerHooks,

  // RenderContext

  // AttrSyntax,

  // IAttributeParser,

  attributePattern,
  // AttributePatternDefinition,
  IAttributePattern,
  // IAttributePatternHandler,
  // Interpretation,
  // ISyntaxInterpreter,
  IAttrMapper,

  // AtPrefixedTriggerAttributePattern,
  // ColonPrefixedBindAttributePattern,
  // DotSeparatedAttributePattern,
  // RefAttributePattern,

  alias,
  registerAliases,

  bindingBehavior,
  BindingBehavior,

  valueConverter,
  ValueConverter,

  bindingCommand,
  // BindingCommand,
  type BindingCommandInstance,
  // BindingCommandDefinition,
  // BindingCommandKind,
  // BindingCommandType,

  // CallBindingCommand,
  // DefaultBindingCommand,
  // ForBindingCommand,
  // FromViewBindingCommand,
  // OneTimeBindingCommand,
  // ToViewBindingCommand,
  // TwoWayBindingCommand,

  type IEnhancementConfig,
  type IHydratedParentController,

  // IExpressionParserRegistration,

  // DefaultComponents as JitDefaultComponents,

  // RefAttributePatternRegistration,
  // DotSeparatedAttributePatternRegistration,

  // DefaultBindingSyntax,

  // AtPrefixedTriggerAttributePatternRegistration,
  // ColonPrefixedBindAttributePatternRegistration,

  ShortHandBindingSyntax,

  // CallBindingCommandRegistration,
  // DefaultBindingCommandRegistration,
  // ForBindingCommandRegistration,
  // FromViewBindingCommandRegistration,
  // OneTimeBindingCommandRegistration,
  // ToViewBindingCommandRegistration,
  // TwoWayBindingCommandRegistration,

  // AttrBindingBehaviorRegistration,
  // SelfBindingBehaviorRegistration,
  // UpdateTriggerBindingBehaviorRegistration,
  // ComposeRegistration,

  // DefaultResources as RuntimeHtmlDefaultResources,

  // AttributeBindingRendererRegistration,
  // ListenerBindingRendererRegistration,
  // SetAttributeRendererRegistration,
  // SetClassAttributeRendererRegistration,
  // SetStyleAttributeRendererRegistration,
  // StylePropertyBindingRendererRegistration,
  // TextBindingRendererRegistration,

  // DefaultRenderers,

  // StandardConfiguration,

  createElement,
  // RenderPlan,

  // AttributeInstruction,
  // IInstructionRow,
  // NodeInstruction,
  // IInstruction,
  // InstructionType,
  // IAttributeBindingInstruction,
  // ISetAttributeInstruction,
  // isInstruction,
  // IStylePropertyBindingInstruction,
  // ITextBindingInstruction,

  // NodeSequenceFactory,
  // FragmentNodeSequence,

  // AttributeBindingInstruction,
  // SetAttributeInstruction,
  // SetClassAttributeInstruction,
  // SetStyleAttributeInstruction,
  // StylePropertyBindingInstruction,
  // TextBindingInstruction,

  // ContainerlessProjector,
  // HostProjector,
  // HTMLProjectorLocator,
  // ShadowDOMProjector,

  StyleConfiguration,
  // styles,
  type IShadowDOMConfiguration,

  // CSSModulesProcessorRegistry,
  cssModules,

  // ShadowDOMRegistry,
  // IShadowDOMStyleFactory,
  shadowCSS,

  // AdoptedStyleSheetsStyles,
  // StyleElementStyles,
  // IShadowDOMStyles,
  // IShadowDOMGlobalStyles

  // IAttrSyntaxTransformer,

  // TriggerBindingCommand,
  // DelegateBindingCommand,
  // CaptureBindingCommand,
  // AttrBindingCommand,
  // ClassBindingCommand,
  // StyleBindingCommand,

  // ITemplateCompilerRegistration,
  // ITemplateElementFactoryRegistration,
  // IAttrSyntaxTransformerRegistation,

  // DefaultComponents as JitHtmlDefaultComponents,

  // TriggerBindingCommandRegistration,
  // DelegateBindingCommandRegistration,
  // CaptureBindingCommandRegistration,
  // AttrBindingCommandRegistration,
  // ClassBindingCommandRegistration,
  // StyleBindingCommandRegistration,

  // DefaultBindingLanguage as JitHtmlDefaultBindingLanguage,

  // StandardConfiguration,

  // stringifyDOM,
  // stringifyInstructions,
  // stringifyTemplateDefinition,

  // TemplateBinder,

  // ITemplateElementFactory,
  ILifecycleHooks,
  type LifecycleHook,
  LifecycleHooks,
  lifecycleHooks,

  // -------- dialog plugin -------------
  // configurations
  DialogConfiguration,
  type DialogConfigurationProvider,
  DialogDefaultConfiguration,

  // enums
  type DialogActionKey,
  type DialogMouseEventType,
  DialogDeactivationStatuses,

  // settings
  type IDialogSettings,
  IDialogGlobalSettings,
  type IDialogLoadedSettings,

  // main interfaces
  IDialogService,
  IDialogController,
  IDialogDomRenderer,
  IDialogDom,

  // dialog results
  type DialogError,
  type DialogOpenPromise,
  DialogOpenResult,
  type DialogCancelError,
  type DialogCloseError,
  DialogCloseResult,

  // default impls
  DialogService,
  DialogController,
  DefaultDialogDom,
  DefaultDialogDomRenderer,
  DefaultDialogGlobalSettings,

  // implementable for applications
  type IDialogCustomElementViewModel,
  type IDialogComponent,
  type IDialogComponentActivate,
  type IDialogComponentCanActivate,
  type IDialogComponentDeactivate,
  type IDialogComponentCanDeactivate,
  // -------- dialog plugin end -------------

  // -------- wc plugin -------------
  IWcElementRegistry,
  type WebComponentViewModelClass,
  WcCustomElementRegistry,
  // -------- wc plugin end -------------
} from '@aurelia/runtime-html';
