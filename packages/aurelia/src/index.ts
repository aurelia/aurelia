import { DI, IContainer, Registration } from '@aurelia/kernel';
import { StandardConfiguration, Aurelia as $Aurelia, IPlatform, IAppRoot, CustomElementType, CustomElement, ICustomElementViewModel } from '@aurelia/runtime-html';
import { BrowserPlatform } from '@aurelia/platform-browser';
import type { ISinglePageAppConfig, IEnhancementConfig } from '@aurelia/runtime-html';

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

  public static app(config: ISinglePageAppConfig<object> | CustomElementType): Omit<Aurelia, 'register' | 'app' | 'enhance'> {
    return new Aurelia().app(config);
  }

  public static enhance<T extends ICustomElementViewModel>(config: IEnhancementConfig<T>): ReturnType<$Aurelia['enhance']> {
    return new Aurelia().enhance(config);
  }

  public static register(...params: readonly unknown[]): Aurelia {
    return new Aurelia().register(...params);
  }

  public app(config: ISinglePageAppConfig<object> | CustomElementType): Omit<this, 'register' | 'app' | 'enhance'> {
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
        host: host as HTMLElement,
        component: config
      });
    }

    return super.app(config);
  }
}

export default Aurelia;

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
  type TaskStatus
} from '@aurelia/platform';

export {
  all,
  DI,
  IContainer,
  type IFactory,
  inject,
  resolve,
  type IRegistration,
  type IRegistry,
  type IResolver,
  IServiceLocator,
  type Key,
  lazy,
  factory,
  newInstanceOf,
  newInstanceForScope,
  optional,
  resource,
  allResources,
  ignore,
  Registration,
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
  type ColorOptions,
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
  type CollectionKind,
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

  // DefaultResources as RuntimeDefaultResources,
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
  // MountStrategy,

  // AccessorOrObserver,
  // Collection,
  // CollectionKind,
  // DelegationStrategy,
  // IAccessor,
  // IBindingContext,
  // ICollectionChangeTracker,
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

  type PartialChildrenDefinition,
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
  type ISinglePageAppConfig,
  IAppRoot,

  // DefaultResources as RuntimeDefaultResources,
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
  IController,
  // IContainer,
  // IViewCache,
  IViewFactory,
  // MountStrategy,

  // AccessorOrObserver,
  // Collection,
  // CollectionKind,
  // DelegationStrategy,
  // IAccessor,
  // IBindingContext,
  // ICollectionChangeTracker,
  // ICollectionSubscriber,

  IFlushQueue,
  FlushQueue,
  type IFlushable,

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

  // SelfBindingBehavior,

  // UpdateTriggerBindingBehavior,

  // Focus,

  // Portal,
  // PortalTarget,
  // PortalLifecycleCallback,

  // Subject,
  // Compose,
  type IAuSlot,
  IAuSlotsInfo,
  AuSlotsInfo,
  IAuSlotWatcher,
  slotted,

  // DefaultComponents as RuntimeHtmlDefaultComponents,

  // CompiledTemplate,
  ChildrenBinding,
  // IRenderer,
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

  // DefaultComponents as JitDefaultComponents,

  // DefaultBindingSyntax,

  ShortHandBindingSyntax,

  // DefaultResources as RuntimeHtmlDefaultResources,

  // DefaultRenderers,

  // StandardConfiguration,

  // AttributeInstruction,
  // IInstructionRow,
  // NodeInstruction,
  // IInstruction,
  // InstructionType,
  // IAttributeBindingInstruction,
  // ISetAttributeInstruction,
  // isInstruction,

  // NodeSequenceFactory,
  // FragmentNodeSequence,

  // AttributeBindingInstruction,
  // SetAttributeInstruction,
  // SetClassAttributeInstruction,
  // SetStyleAttributeInstruction,
  // StylePropertyBindingInstruction,

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
  processContent,

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

  // IAttrSyntaxTransformerRegistation,

  // DefaultComponents as JitHtmlDefaultComponents,

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

  watch,

  IKeyMapping,
  IModifiedEventHandlerCreator,
  IEventModifier,
  type IModifiedEventHandler,
} from '@aurelia/runtime-html';
