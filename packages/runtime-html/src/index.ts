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

  PropertyBinding,

  CallBinding,

  IPartialConnectableBinding,
  IConnectableBinding,
  connectable,
  BindingMediator,
  MediatedBinding,

  IExpressionParser,
  BindingType,
  parseExpression,
  Char,
  Access,
  Precedence,
  parse,
  ParserState,

  ContentBinding,
  InterpolationBinding,

  LetBinding,

  RefBinding,

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

  ComputedOverrides,
  ComputedLookup,
  computed,
  createComputedObserver,
  CustomSetterObserver,
  GetterObserver,

  IDirtyChecker,
  DirtyCheckProperty,
  DirtyCheckSettings,

  IObservableDefinition,
  observable,

  IObjectObservationAdapter,
  IObserverLocator,
  ITargetObserverLocator,
  ITargetAccessorLocator,
  getCollectionObserver,
  ObserverLocator,

  PrimitiveObserver,

  PropertyAccessor,

  ProxyObserver,

  BindableObserver,

  SetterObserver,

  ISignaler,

  subscriberCollection,
  collectionSubscriberCollection,
  proxySubscriberCollection,

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

  BindingModeBehavior,
  OneTimeBindingBehavior,
  ToViewBindingBehavior,
  FromViewBindingBehavior,
  TwoWayBindingBehavior,

  DebounceBindingBehavior,

  SignalBindingBehavior,

  ThrottleBindingBehavior,

  ValueConverter,
  ValueConverterDefinition,
  PartialValueConverterDefinition,
  ValueConverterKind,
  ValueConverterDecorator,
  ValueConverterInstance,
  ValueConverterType,
  valueConverter,

  bindable,
  PartialBindableDefinition,
  BindableDefinition,
  Bindable,

  DebounceBindingBehaviorRegistration,
  OneTimeBindingBehaviorRegistration,
  ToViewBindingBehaviorRegistration,
  FromViewBindingBehaviorRegistration,
  SignalBindingBehaviorRegistration,
  ThrottleBindingBehaviorRegistration,
  TwoWayBindingBehaviorRegistration,

  BindingMode,
  BindingStrategy,
  ExpressionKind,
  LifecycleFlags,

  IBinding,
  ILifecycle,

  AccessorOrObserver,
  AccessorType,
  Collection,
  CollectionKind,
  DelegationStrategy,
  IAccessor,
  INodeAccessor,
  IBindingContext,
  IBindingTargetAccessor,
  IBindingTargetObserver,
  ICollectionChangeTracker,
  ICollectionObserver,
  ICollectionIndexObserver,
  ICollectionSubscriber,
  IndexMap,
  IBatchable,
  IObservable,
  IObservedArray,
  IObservedMap,
  IObservedSet,
  IOverrideContext,
  IPropertyChangeTracker,
  IPropertyObserver,
  ISubscribable,
  ISubscriberCollection,
  ObservedCollection,
  PropertyObserver,
  CollectionObserver,
  ICollectionSubscriberCollection,
  IProxyObserver,
  IProxy,
  IProxySubscribable,
  IProxySubscriber,
  IProxySubscriberCollection,
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
} from './aurelia';
export {
  ISinglePageApp,
  AppRoot,
  IAppRoot,
} from './app-root';
export {
  TaskSlot,
  AppTask,
  IAppTask,
} from './app-task';
export {
  AttrSyntax,
  IAttributeParser,
} from './attribute-parser';
export {
  attributePattern,
  AttributePatternDefinition,
  IAttributePattern,
  AttributePattern,
  Interpretation,
  ISyntaxInterpreter,
} from './attribute-pattern';
export {
  AtPrefixedTriggerAttributePattern,
  ColonPrefixedBindAttributePattern,
  DotSeparatedAttributePattern,
  RefAttributePattern,
} from './attribute-patterns';
export {
  bindingCommand,
  BindingCommand ,
  BindingCommandInstance,
  BindingCommandDefinition,
  BindingCommandKind,
  BindingCommandType,
  getTarget,
} from './binding-command';
export {
  IAttrSyntaxTransformer
} from './attribute-syntax-transformer';
export {
  CallBindingCommand,
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
} from './binding-commands';
export {
  Listener
} from './binding/listener';
export {
  AttributeBinding
} from './binding/attribute';

export {
  IInstructionComposer,
  IInstructionTypeClassifier,
  IComposer,
  ITemplateCompiler,
  instructionComposer,
} from './composer';

export {
  AttributeNSAccessor
} from './observation/attribute-ns-accessor';
export {
  IInputElement,
  CheckedObserver
} from './observation/checked-observer';
export {
  ClassAttributeAccessor
} from './observation/class-attribute-accessor';
export {
  DataAttributeAccessor
} from './observation/data-attribute-accessor';
export {
  ElementPropertyAccessor
} from './observation/element-property-accessor';
export {
  IEventDelegator,
  EventSubscriber,
  EventDelegator
} from './observation/event-delegator';
export {
  TargetAccessorLocator,
  TargetObserverLocator
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
  ValueAttributeObserver
} from './observation/value-attribute-observer';

export {
  AttrBindingBehavior
} from './resources/binding-behaviors/attr';
export {
  SelfableBinding,
  SelfBindingBehavior
} from './resources/binding-behaviors/self';
export {
  UpdateTriggerBindingBehavior,
  UpdateTriggerableBinding,
  UpdateTriggerableObserver
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
  InfrequentMutations,
  ObserveShallow,
} from './resources/custom-attributes/flags';
export {
  If,
  Else
} from './resources/custom-attributes/if';
export {
  Repeat
} from './resources/custom-attributes/repeat';
export {
  With
} from './resources/custom-attributes/with';
export {
  Switch,
  Case,
  DefaultCase,
} from './resources/custom-attributes/switch';

export {
  Blur,
  BlurManager
} from './resources/custom-attributes/blur';

export {
  Focus
} from './resources/custom-attributes/focus';

export {
  Portal,
  PortalTarget,
  PortalLifecycleCallback
} from './resources/custom-attributes/portal';

export {
  AuSlot,
  IProjections,
  SlotInfo,
  AuSlotContentType,
  RegisteredProjections,
  IProjectionProvider,
  ProjectionContext,
} from './resources/custom-elements/au-slot';

export {
  containerless,
  customElement,
  CustomElementHost,
  CustomElement,
  CustomElementDecorator,
  CustomElementKind,
  CustomElementType,
  CustomElementDefinition,
  PartialCustomElementDefinition,
  useShadowDOM
} from './resources/custom-element';

export {
  Subject,
  Compose
} from './resources/custom-elements/compose';
export {
  ISanitizer,
  SanitizeValueConverter,
} from './resources/value-converters/sanitize';
export {
  ViewValueConverter,
} from './resources/value-converters/view';

export {
  ITemplateCompilerRegistration,
  ITargetAccessorLocatorRegistration,
  ITargetObserverLocatorRegistration,

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
  ComposeRegistration,

  DefaultResources,

  AttributeBindingComposerRegistration,
  ListenerBindingComposerRegistration,
  SetAttributeComposerRegistration,
  SetClassAttributeComposerRegistration,
  SetStyleAttributeComposerRegistration,
  StylePropertyBindingComposerRegistration,
  TextBindingComposerRegistration,

  RefBindingComposerRegistration,
  CallBindingComposerRegistration,
  CustomAttributeComposerRegistration,
  CustomElementComposerRegistration,
  InterpolationBindingComposerRegistration,
  IteratorBindingComposerRegistration,
  LetElementComposerRegistration,
  PropertyBindingComposerRegistration,
  SetPropertyComposerRegistration,
  TemplateControllerComposerRegistration,

  DefaultComposers,

  StandardConfiguration
} from './configuration';
export {
  HooksDefinition,
  InstructionTypeName,
  IInstruction,
} from './definitions';
export {
  stringifyDOM,
  stringifyInstructions,
  stringifyTemplateDefinition
} from './debugging';
export {
  TemplateBinder,
} from './template-binder';
export {
  ITemplateElementFactory
} from './template-element-factory';

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
} from './templating/controller';
export {
  getCompositionContext,
  isCompositionContext,
  ICompositionContext,
  ICompiledCompositionContext,
  IComponentFactory,
} from './templating/composition-context';
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
  CompositionPlan
} from './create-element';
export {
  INode,
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
} from './dom';
export {
  CallBindingInstruction,
  FromViewBindingInstruction,
  HydrateAttributeInstruction,
  HydrateElementInstruction,
  HydrateTemplateController,
  InterpolationInstruction,
  IteratorBindingInstruction,
  LetBindingInstruction,
  HydrateLetElementInstruction,
  OneTimeBindingInstruction,
  RefBindingInstruction,
  SetPropertyInstruction,
  ToViewBindingInstruction,
  TwoWayBindingInstruction,
  AttributeBindingInstruction,
  CaptureBindingInstruction,
  DelegateBindingInstruction,
  SetAttributeInstruction,
  SetClassAttributeInstruction,
  SetStyleAttributeInstruction,
  StylePropertyBindingInstruction,
  TextBindingInstruction,
  TriggerBindingInstruction,
  AttributeInstruction,
  InstructionRow,
  isInstruction,
  NodeInstruction,
  Instruction,
  InstructionType,
} from './instructions';
export {
  ViewModelKind,
  ControllerVisitor,
  IViewModel,
  IController,
  IComponentController,
  IContextualCustomElementController,
  IComposableController,
  IDryCustomElementController,
  ICustomAttributeController,
  IHydratedController,
  IHydratedComponentController,
  IHydratedParentController,
  ICompiledCustomElementController,
  ICustomElementController,
  MountStrategy,
  ICustomElementViewModel,
  ICustomAttributeViewModel,
  IHydratedCustomElementViewModel,
  IHydratedCustomAttributeViewModel,
  ISyntheticView,
} from './lifecycle';
export {
  IPlatform,
} from './platform';
export {
  ContainerlessProjector,
  HostProjector,
  ProjectorLocator,
  IProjectorLocator,
  ShadowDOMProjector,
  ElementProjector,
} from './projectors';

export {
  ResourceModel,
  BindableInfo,
  ElementInfo,
  AttrInfo
} from './resource-model';
export {
  AnySymbol,
  BindingSymbol,
  CustomAttributeSymbol,
  CustomElementSymbol,
  ElementSymbol,
  LetElementSymbol,
  NodeSymbol,
  ParentNodeSymbol,
  PlainAttributeSymbol,
  PlainElementSymbol,
  ResourceAttributeSymbol,
  SymbolFlags,
  SymbolWithBindings,
  SymbolWithMarker,
  SymbolWithTemplate,
  TemplateControllerSymbol,
  TextSymbol,
  ProjectionSymbol,
} from './semantic-model';

export {
  StyleConfiguration,
  IShadowDOMConfiguration
} from './styles/style-configuration';
export {
  CSSModulesProcessorRegistry,
  cssModules
} from './styles/css-modules-registry';
export {
  ShadowDOMRegistry,
  IShadowDOMStyleFactory,
  shadowCSS
} from './styles/shadow-dom-registry';
export {
  AdoptedStyleSheetsStyles,
  StyleElementStyles,
  IShadowDOMStyles,
  IShadowDOMGlobalStyles
} from './styles/shadow-dom-styles';
