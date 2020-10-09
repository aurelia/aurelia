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
  CallBindingCommand,
  DefaultBindingCommand,
  ForBindingCommand,
  FromViewBindingCommand,
  OneTimeBindingCommand,
  ToViewBindingCommand,
  TwoWayBindingCommand
} from './binding-commands';
export {
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
  IHydrator,
} from './binding/ast';
export {
  PropertyBinding
} from './binding/property-binding';
export {
  CallBinding
} from './binding/call-binding';
export {
  IPartialConnectableBinding,
  IConnectableBinding,
  connectable,
  BindingMediator,
  MediatedBinding
} from './binding/connectable';
export {
  IExpressionParser,
  BindingType,
  parseExpression,
  Char,
  Access,
  Precedence,
  parse,
  ParserState,
} from './binding/expression-parser';
export {
  MultiInterpolationBinding,
  InterpolationBinding
} from './binding/interpolation-binding';
export {
  LetBinding
} from './binding/let-binding';
export {
  RefBinding
} from './binding/ref-binding';

export {
  ArrayObserver,
  ArrayIndexObserver,
  enableArrayObservation,
  disableArrayObservation,
  applyMutationsToIndices,
  synchronizeIndices,
} from './observation/array-observer';
export {
  MapObserver,
  enableMapObservation,
  disableMapObservation
} from './observation/map-observer';
export {
  SetObserver,
  enableSetObservation,
  disableSetObservation
} from './observation/set-observer';
export {
  BindingContext,
  Scope,
  OverrideContext
} from './observation/binding-context';
export {
  CollectionLengthObserver,
} from './observation/collection-length-observer';
export {
  CollectionSizeObserver,
} from './observation/collection-size-observer';
export {
  ComputedOverrides,
  ComputedLookup,
  computed,
  createComputedObserver,
  CustomSetterObserver,
  GetterObserver
} from './observation/computed-observer';
export {
  IDirtyChecker,
  DirtyCheckProperty,
  DirtyCheckSettings
} from './observation/dirty-checker';
export {
  IObjectObservationAdapter,
  IObserverLocator,
  ITargetObserverLocator,
  ITargetAccessorLocator,
  getCollectionObserver,
  ObserverLocator
} from './observation/observer-locator';
export {
  PrimitiveObserver
} from './observation/primitive-observer';
export {
  PropertyAccessor
} from './observation/property-accessor';
export {
  ProxyObserver
} from './observation/proxy-observer';
export {
  BindableObserver
} from './observation/bindable-observer';
export {
  SetterObserver
} from './observation/setter-observer';
export {
  ISignaler
} from './observation/signaler';
export {
  subscriberCollection,
  collectionSubscriberCollection,
  proxySubscriberCollection,
} from './observation/subscriber-collection';

export {
  bindingBehavior,
  BindingBehavior,
  BindingBehaviorDefinition,
  PartialBindingBehaviorDefinition,
  BindingBehaviorKind,
  BindingBehaviorDecorator,
  BindingBehaviorInstance,
  BindingBehaviorType,
  BindingInterceptor,
  IInterceptableBinding
} from './resources/binding-behavior';
export {
  BindingModeBehavior,
  OneTimeBindingBehavior,
  ToViewBindingBehavior,
  FromViewBindingBehavior,
  TwoWayBindingBehavior
} from './resources/binding-behaviors/binding-mode';
export {
  DebounceBindingBehavior
} from './resources/binding-behaviors/debounce';
export {
  SignalBindingBehavior
} from './resources/binding-behaviors/signals';
export {
  ThrottleBindingBehavior
} from './resources/binding-behaviors/throttle';

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
  IElementProjector,
  IProjectorLocator,
  useShadowDOM
} from './resources/custom-element';

export {
  ValueConverter,
  ValueConverterDefinition,
  PartialValueConverterDefinition,
  ValueConverterKind,
  ValueConverterDecorator,
  ValueConverterInstance,
  ValueConverterType,
  valueConverter,
} from './resources/value-converter';
export {
  ISanitizer,
  SanitizeValueConverter
} from './resources/value-converters/sanitize';
export {
  ViewValueConverter
} from './resources/value-converters/view';

export {
  Now,
  IScheduler,
  ITask,
  ITaskQueue,
  QueueTaskOptions,
  Task,
  TaskAbortError,
  TaskCallback,
  TaskQueue,
  TaskQueuePriority,
  TaskStatus,
  QueueTaskTargetOptions,
} from '@aurelia/scheduler';

export {
  bindable,
  PartialBindableDefinition,
  BindableDefinition,
  Bindable,
} from './templating/bindable';

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
  ViewFactory,
  IViewLocator,
  ViewLocator,
  view,
  Views,
} from './templating/view';

export {
  Aurelia,
  IDOMInitializer,
  ISinglePageApp,
  CompositionRoot,
} from './aurelia';
export {
  RefAttributePatternRegistration,
  DotSeparatedAttributePatternRegistration,

  DefaultBindingSyntax,

  AtPrefixedTriggerAttributePatternRegistration,
  ColonPrefixedBindAttributePatternRegistration,

  ShortHandBindingSyntax,

  CallBindingCommandRegistration,
  DefaultBindingCommandRegistration,
  ForBindingCommandRegistration,
  FromViewBindingCommandRegistration,
  OneTimeBindingCommandRegistration,
  ToViewBindingCommandRegistration,
  TwoWayBindingCommandRegistration,

  DefaultBindingLanguage,

  IfRegistration,
  ElseRegistration,
  RepeatRegistration,
  WithRegistration,

  SanitizeValueConverterRegistration,

  DebounceBindingBehaviorRegistration,
  OneTimeBindingBehaviorRegistration,
  ToViewBindingBehaviorRegistration,
  FromViewBindingBehaviorRegistration,
  SignalBindingBehaviorRegistration,
  ThrottleBindingBehaviorRegistration,
  TwoWayBindingBehaviorRegistration,

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

  DefaultResources,
  IExpressionParserRegistration,
  IObserverLocatorRegistration,
  ILifecycleRegistration,
  IRendererRegistration,
  IStartTaskManagerRegistration,
  IViewLocatorRegistration,
  IProjectionProviderRegistration,
  RuntimeConfiguration
} from './configuration';
export {
  AttributeInstruction,
  HooksDefinition,
  ICallBindingInstruction,
  IHydrateAttributeInstruction,
  IHydrateElementInstruction,
  IHydrateLetElementInstruction,
  IHydrateTemplateController,
  IInterpolationInstruction,
  IIteratorBindingInstruction,
  ILetBindingInstruction,
  InstructionRow,
  InstructionTypeName,
  IPropertyBindingInstruction,
  IRefBindingInstruction,
  ISetPropertyInstruction,
  isTargetedInstruction,
  ITargetedInstruction,
  NodeInstruction,
  TargetedInstruction,
  TargetedInstructionType,
  alias,
  registerAliases
} from './definitions';
export {
  DOM,
  INode,
  IRenderLocation,
  IDOM,
  NodeSequence,
  INodeSequence,
  INodeSequenceFactory
} from './dom';
export {
  BindingMode,
  BindingStrategy,
  ExpressionKind,
  LifecycleFlags,
} from './flags';
export {
  CallBindingInstruction,
  FromViewBindingInstruction,
  HydrateAttributeInstruction,
  HydrateElementInstruction,
  HydrateTemplateController,
  InterpolationInstruction,
  IteratorBindingInstruction,
  LetBindingInstruction,
  LetElementInstruction,
  OneTimeBindingInstruction,
  RefBindingInstruction,
  SetPropertyInstruction,
  ToViewBindingInstruction,
  TwoWayBindingInstruction
} from './instructions';
export {
  ViewModelKind,
  ControllerVisitor,
  IBinding,
  ILifecycle,
  IViewModel,
  IController,
  IComponentController,
  IContextualCustomElementController,
  IRenderableController,
  IDryCustomElementController,
  ICustomAttributeController,
  IHydratedController,
  IHydratedComponentController,
  IHydratedParentController,
  ICompiledCustomElementController,
  ICustomElementController,
  IViewCache,
  IViewFactory,
  MountStrategy,
  ICustomElementViewModel,
  ICustomAttributeViewModel,
  IHydratedCustomElementViewModel,
  IHydratedCustomAttributeViewModel,
  ISyntheticView,
} from './lifecycle';
export {
  getRenderContext,
  isRenderContext,
  IRenderContext,
  ICompiledRenderContext,
  IComponentFactory,
} from './templating/render-context';
export {
  PromiseOrTask,
  MaybePromiseOrTask,
  AggregateContinuationTask,
  TerminalTask,
  AggregateTerminalTask,
  ContinuationTask,
  ILifecycleTask,
  LifecycleTask,
  PromiseTask,
  TaskSlot,
  AppTask,
  IStartTask,
  IStartTaskManager,
  ProviderTask,
} from './lifecycle-task';
export {
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
  IObservable,
  IObservedArray,
  IObservedMap,
  IObservedSet,
  IOverrideContext,
  IPropertyChangeTracker,
  IPropertyObserver,
  IScope,
  ISubscribable,
  ISubscriberCollection,
  ObservedCollection,
  ObserversLookup,
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
} from './observation';
export {
  applyBindingBehavior,
  IInstructionRenderer,
  IInstructionTypeClassifier,
  IRenderer,
  ITemplateCompiler,
  instructionRenderer,
  ensureExpression,
} from './renderer';
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
