export {
  Platform,
  TaskQueue,
  Task,
  TaskAbortError,
  TaskQueuePriority,
  TaskStatus,
  QueueTaskOptions,
  ITask,
} from '@aurelia/platform';
export {
  BrowserPlatform,
} from '@aurelia/platform-browser';

export {
  bindable,
  Bindable,
  BindableDefinition,
  PartialBindableDefinition,
} from './bindable';

export {
  BindableObserver,
} from './observation/bindable-observer';

export {
  DebounceBindingBehaviorRegistration,
  OneTimeBindingBehaviorRegistration,
  ToViewBindingBehaviorRegistration,
  FromViewBindingBehaviorRegistration,
  SignalBindingBehaviorRegistration,
  ThrottleBindingBehaviorRegistration,
  TwoWayBindingBehaviorRegistration,
} from './configuration';

export {
  BindingModeBehavior,
  OneTimeBindingBehavior,
  ToViewBindingBehavior,
  FromViewBindingBehavior,
  TwoWayBindingBehavior,
} from './binding-behaviors/binding-mode';
export {
  DebounceBindingBehavior,
} from './binding-behaviors/debounce';
export {
  SignalBindingBehavior,
} from './binding-behaviors/signals';
export {
  ThrottleBindingBehavior,
} from './binding-behaviors/throttle';

export {
  alias,
  registerAliases,

  CallFunctionExpression,
  CustomExpression,
  BindingBehaviorExpression,
  ValueConverterExpression,
  AssignExpression,
  ConditionalExpression,
  AccessThisExpression,
  AccessScopeExpression,
  AccessMemberExpression,
  AccessKeyedExpression,
  CallScopeExpression,
  CallMemberExpression,
  BinaryExpression,
  UnaryExpression,
  PrimitiveLiteralExpression,
  HtmlLiteralExpression,
  ArrayLiteralExpression,
  ObjectLiteralExpression,
  TemplateExpression,
  TaggedTemplateExpression,
  ArrayBindingPattern,
  ObjectBindingPattern,
  BindingIdentifier,
  ForOfStatement,
  Interpolation,
  AnyBindingExpression,
  IsPrimary,
  IsLiteral,
  IsLeftHandSide,
  IsUnary,
  IsBinary,
  IsConditional,
  IsAssign,
  IsValueConverter,
  IsBindingBehavior,
  IsAssignable,
  IsExpression,
  IsExpressionOrStatement,
  IVisitor,
  BinaryOperator,
  BindingIdentifierOrPattern,
  UnaryOperator,
  IExpressionHydrator,

  IObserverLocatorBasedConnectable,
  IConnectableBinding,
  connectable,
  BindingMediator,
  MediatedBinding,

  IExpressionParser,
  ExpressionType,
  parseExpression,
  Char,
  Access,
  Precedence,

  ArrayObserver,
  ArrayIndexObserver,
  enableArrayObservation,
  disableArrayObservation,
  applyMutationsToIndices,
  synchronizeIndices,

  MapObserver,
  enableMapObservation,
  disableMapObservation,

  SetObserver,
  enableSetObservation,
  disableSetObservation,

  BindingContext,
  Scope,
  OverrideContext,

  CollectionLengthObserver,

  CollectionSizeObserver,

  IDirtyChecker,
  DirtyCheckProperty,
  DirtyCheckSettings,

  ComputedObserver,

  IObservableDefinition,
  observable,

  IObjectObservationAdapter,
  IObserverLocator,
  INodeObserverLocator,
  getCollectionObserver,
  ObserverLocator,

  PrimitiveObserver,

  PropertyAccessor,

  SetterObserver,

  ISignaler,

  subscriberCollection,

  bindingBehavior,
  BindingBehavior,
  BindingBehaviorDefinition,
  PartialBindingBehaviorDefinition,
  BindingBehaviorKind,
  BindingBehaviorDecorator,
  BindingBehaviorInstance,
  BindingBehaviorType,
  BindingInterceptor,
  BindingBehaviorFactory,
  BindingBehaviorStrategy,
  IInterceptableBinding,

  ValueConverter,
  ValueConverterDefinition,
  PartialValueConverterDefinition,
  ValueConverterKind,
  ValueConverterDecorator,
  ValueConverterInstance,
  ValueConverterType,
  valueConverter,

  BindingMode,
  ExpressionKind,
  LifecycleFlags,

  IBinding,

  AccessorOrObserver,
  AccessorType,
  Collection,
  CollectionKind,
  DelegationStrategy,
  IAccessor,
  IBindingContext,
  ICollectionChangeTracker,
  ICollectionObserver,
  ICollectionSubscriber,
  IndexMap,
  IBatchable,
  IObservable,
  IOverrideContext,
  ISubscribable,
  ISubscriberCollection,
  CollectionObserver,
  ICollectionSubscriberCollection,
  ICollectionSubscribable,
  ISubscriber,
  isIndexMap,
  copyIndexMap,
  cloneIndexMap,
  createIndexMap,
} from '@aurelia/runtime';

export {
  Aurelia,
  IAurelia,
  IEnhancementConfig,
} from './aurelia';
export {
  ISinglePageApp,
  AppRoot,
  IAppRoot,
  IWorkTracker,
} from './app-root';
export {
  TaskSlot,
  AppTask,
  IAppTask,
  AppTaskCallback,
  AppTaskCallbackNoArg,
} from './app-task';
export {
  AttrSyntax,
  IAttributeParser,
  attributePattern,
  AttributePatternDefinition,
  IAttributePattern,
  AttributePattern,
  Interpretation,
  ISyntaxInterpreter,
  AtPrefixedTriggerAttributePattern,
  ColonPrefixedBindAttributePattern,
  DotSeparatedAttributePattern,
  RefAttributePattern,
} from './resources/attribute-pattern';
export {
  bindingCommand,
  ICommandBuildInfo,
  BindingCommand ,
  BindingCommandInstance,
  BindingCommandDefinition,
  BindingCommandKind,
  BindingCommandType,
  CallBindingCommand,
  CommandType,
  DefaultBindingCommand,
  ForBindingCommand,
  FromViewBindingCommand,
  OneTimeBindingCommand,
  ToViewBindingCommand,
  TwoWayBindingCommand,
  TriggerBindingCommand,
  DelegateBindingCommand,
  CaptureBindingCommand,
  AttrBindingCommand,
  ClassBindingCommand,
  StyleBindingCommand,
} from './resources/binding-command';
export {
  IAttrMapper,
} from './attribute-mapper';
export {
  Listener,
} from './binding/listener';
export {
  AttributeBinding,
} from './binding/attribute';
export {
  CallBinding,
} from './binding/call-binding';
export {
  InterpolationBinding,
} from './binding/interpolation-binding';
export {
  LetBinding,
} from './binding/let-binding';
export {
  PropertyBinding,
} from './binding/property-binding';
export {
  RefBinding,
} from './binding/ref-binding';

export {
  IRenderer,
  IInstructionTypeClassifier,
  ITemplateCompiler,
  ICompliationInstruction,
  renderer,
  CallBindingInstruction,
  HydrateAttributeInstruction,
  HydrateElementInstruction,
  HydrateTemplateController,
  InterpolationInstruction,
  IteratorBindingInstruction,
  LetBindingInstruction,
  HydrateLetElementInstruction,
  RefBindingInstruction,
  SetPropertyInstruction,
  AttributeBindingInstruction,
  ListenerBindingInstruction,
  PropertyBindingInstruction,
  SetAttributeInstruction,
  SetClassAttributeInstruction,
  SetStyleAttributeInstruction,
  StylePropertyBindingInstruction,
  TextBindingInstruction,
  isInstruction,
  InstructionTypeName,
  IInstruction,
  InstructionType,
} from './renderer';

export {
  AttributeNSAccessor,
} from './observation/attribute-ns-accessor';
export {
  IInputElement,
  CheckedObserver,
} from './observation/checked-observer';
export {
  ClassAttributeAccessor,
} from './observation/class-attribute-accessor';
export {
  DataAttributeAccessor,
} from './observation/data-attribute-accessor';
export {
  IEventDelegator,
  EventSubscriber,
  EventDelegator,
} from './observation/event-delegator';
export {
  NodeObserverConfig,
  NodeObserverLocator,
  INodeObserverConfig,
  IHtmlObserverConstructor,
} from './observation/observer-locator';
export {
  ISelectElement,
  IOptionElement,
  SelectValueObserver
} from './observation/select-value-observer';
export {
  StyleAttributeAccessor
} from './observation/style-attribute-accessor';
export {
  ISVGAnalyzer,
  SVGAnalyzer,
  NoopSVGAnalyzer,
} from './observation/svg-analyzer';
export {
  ValueAttributeObserver,
} from './observation/value-attribute-observer';

export {
  AttrBindingBehavior,
} from './resources/binding-behaviors/attr';
export {
  SelfableBinding,
  SelfBindingBehavior,
} from './resources/binding-behaviors/self';
export {
  UpdateTriggerBindingBehavior,
  UpdateTriggerableBinding,
  UpdateTriggerableObserver,
} from './resources/binding-behaviors/update-trigger';

export {
  customAttribute,
  CustomAttributeDecorator,
  CustomAttribute,
  CustomAttributeDefinition,
  CustomAttributeKind,
  CustomAttributeType,
  PartialCustomAttributeDefinition,
  templateController,
} from './resources/custom-attribute';
export {
  FrequentMutations,
  ObserveShallow,
} from './resources/template-controllers/flags';
export {
  If,
  Else,
} from './resources/template-controllers/if';
export {
  Repeat
} from './resources/template-controllers/repeat';
export {
  With
} from './resources/template-controllers/with';
export {
  Switch,
  Case,
  DefaultCase,
} from './resources/template-controllers/switch';
export {
  PromiseTemplateController,
  FulfilledTemplateController,
  PendingTemplateController,
  RejectedTemplateController,
} from './resources/template-controllers/promise';

export {
  Focus,
} from './resources/custom-attributes/focus';

export {
  Portal,
  PortalTarget,
  PortalLifecycleCallback,
} from './resources/template-controllers/portal';

export {
  AuSlot,
} from './resources/custom-elements/au-slot';
export {
  IProjections,
  AuSlotsInfo,
  IAuSlotsInfo,
} from './resources/slot-injectables';
export {
  DefinitionType,
} from './resources/resources-shared';

export {
  containerless,
  customElement,
  CustomElement,
  CustomElementDecorator,
  CustomElementKind,
  CustomElementType,
  CustomElementDefinition,
  PartialCustomElementDefinition,
  useShadowDOM,
  processContent,
} from './resources/custom-element';

export {
  Subject,
  AuRender,
} from './resources/custom-elements/au-render';
export {
  AuCompose,
  IDynamicComponentActivate,
} from './resources/custom-elements/au-compose';
export {
  ISanitizer,
  SanitizeValueConverter,
} from './resources/value-converters/sanitize';
export {
  ViewValueConverter,
} from './resources/value-converters/view';

export {
  ITemplateCompilerRegistration,
  INodeObserverLocatorRegistration,

  DefaultComponents,

  RefAttributePatternRegistration,
  DotSeparatedAttributePatternRegistration,

  DefaultBindingSyntax,

  AtPrefixedTriggerAttributePatternRegistration,
  ColonPrefixedBindAttributePatternRegistration,

  ShortHandBindingSyntax,

  SVGAnalyzerRegistration,

  CallBindingCommandRegistration,
  DefaultBindingCommandRegistration,
  ForBindingCommandRegistration,
  RefBindingCommandRegistration,
  FromViewBindingCommandRegistration,
  OneTimeBindingCommandRegistration,
  ToViewBindingCommandRegistration,
  TwoWayBindingCommandRegistration,
  TriggerBindingCommandRegistration,
  DelegateBindingCommandRegistration,
  CaptureBindingCommandRegistration,
  AttrBindingCommandRegistration,
  ClassBindingCommandRegistration,
  StyleBindingCommandRegistration,

  DefaultBindingLanguage,

  ViewValueConverterRegistration,
  SanitizeValueConverterRegistration,
  IfRegistration,
  ElseRegistration,
  RepeatRegistration,
  WithRegistration,
  AttrBindingBehaviorRegistration,
  SelfBindingBehaviorRegistration,
  UpdateTriggerBindingBehaviorRegistration,
  AuRenderRegistration,

  DefaultResources,

  AttributeBindingRendererRegistration,
  ListenerBindingRendererRegistration,
  SetAttributeRendererRegistration,
  SetClassAttributeRendererRegistration,
  SetStyleAttributeRendererRegistration,
  StylePropertyBindingRendererRegistration,
  TextBindingRendererRegistration,

  RefBindingRendererRegistration,
  CallBindingRendererRegistration,
  CustomAttributeRendererRegistration,
  CustomElementRendererRegistration,
  InterpolationBindingRendererRegistration,
  IteratorBindingRendererRegistration,
  LetElementRendererRegistration,
  PropertyBindingRendererRegistration,
  SetPropertyRendererRegistration,
  TemplateControllerRendererRegistration,

  DefaultRenderers,

  StandardConfiguration
} from './configuration';
export {
  ITemplateElementFactory
} from './template-element-factory';
export {
  BindablesInfo,
  TemplateCompiler,
  ITemplateCompilerHooks,
  TemplateCompilerHooks,
  templateCompilerHooks,
} from './template-compiler';

export {
  allResources,
} from './utilities-di';

export {
  PartialChildrenDefinition,
  ChildrenDefinition,
  Children,
  children,
  ChildrenObserver,
} from './templating/children';

// These exports are temporary until we have a proper way to unit test them
export {
  Controller,
  isCustomElementController,
  isCustomElementViewModel,
  ViewModelKind,
  ControllerVisitor,
  IViewModel,
  IController,
  IComponentController,
  IContextualCustomElementController,
  IControllerElementHydrationInstruction,
  IHydratableController,
  IHydrationContext,
  IDryCustomElementController,
  ICustomAttributeController,
  IHydratedController,
  IHydratedComponentController,
  IHydratedParentController,
  ICompiledCustomElementController,
  ICustomElementController,
  ICustomElementViewModel,
  ICustomAttributeViewModel,
  IHydratedCustomElementViewModel,
  IHydratedCustomAttributeViewModel,
  ISyntheticView,
} from './templating/controller';
export {
  ILifecycleHooks,
  LifecycleHooksEntry,
  LifecycleHooksDefinition,
  LifecycleHooksLookup,
  LifecycleHook,
  LifecycleHooks,
  lifecycleHooks,
} from './templating/lifecycle-hooks';
export {
  IRendering,
  Rendering,
} from './templating/rendering';
export {
  ViewFactory,
  IViewFactory,
  IViewLocator,
  ViewLocator,
  view,
  Views,
} from './templating/view';
export {
  createElement,
  RenderPlan
} from './create-element';
export {
  INode,
  IEventTarget,
  IRenderLocation,
  INodeSequence,
  NodeType,
  FragmentNodeSequence,
  IHistory,
  IWindow,
  ILocation,
  getEffectiveParentNode,
  setEffectiveParentNode,
  convertToRenderLocation,
  isRenderLocation,
  getRef,
  setRef,
} from './dom';
export {
  IPlatform,
} from './platform';

export {
  CSSModulesProcessorRegistry,
  cssModules,
  ShadowDOMRegistry,
  IShadowDOMStyleFactory,
  shadowCSS,
  StyleConfiguration,
  IShadowDOMConfiguration,
  AdoptedStyleSheetsStyles,
  StyleElementStyles,
  IShadowDOMStyles,
  IShadowDOMGlobalStyles,
} from './templating/styles';

export {
  Watch,
  watch,
  IWatchDefinition,
  IWatcherCallback,
  IDepCollectionFn,
} from './watch';

export {
  ComputedWatcher,
  ExpressionWatcher,
} from './templating/watchers';

export {
  // configurations
  DialogConfiguration,
  DialogConfigurationProvider,
  DialogDefaultConfiguration,

  // enums
  DialogActionKey,
  DialogMouseEventType,
  DialogDeactivationStatuses,

  // settings
  IDialogSettings,
  IDialogGlobalSettings,
  IDialogLoadedSettings,

  // main interfaces
  IDialogService,
  IDialogController,
  IDialogDomRenderer,
  IDialogDom,

  // dialog results
  DialogError,
  DialogOpenPromise,
  DialogOpenResult,
  DialogCancelError,
  DialogCloseError,
  DialogCloseResult,

  // default impls
  DialogService,
  DialogController,
  DefaultDialogDom,
  DefaultDialogDomRenderer,
  DefaultDialogGlobalSettings,

  // implementable for applications
  IDialogCustomElementViewModel,
  IDialogComponent,
  IDialogComponentActivate,
  IDialogComponentCanActivate,
  IDialogComponentDeactivate,
  IDialogComponentCanDeactivate,
} from './dialog';

export {
  IWcElementRegistry,
  WebComponentViewModelClass,
  WcCustomElementRegistry,
} from './plugins/web-components';
