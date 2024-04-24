export {
  type IAstEvaluator,
  astAssign,
  astBind,
  astEvaluate,
  astUnbind,
} from './ast.eval';

export {
  bindable,
  Bindable,
  BindableDefinition,
  type PartialBindableDefinition,
  coercer,
} from './bindable';

export {
  bindingBehavior,
  BindingBehavior,
  BindingBehaviorDefinition,
  type PartialBindingBehaviorDefinition,
  type BindingBehaviorStaticAuDefinition,
  type BindingBehaviorKind,
  type BindingBehaviorDecorator,
  type BindingBehaviorType,
  type BindingBehaviorInstance,
} from './resources/binding-behavior';

export {
  BindingModeBehavior,
  OneTimeBindingBehavior,
  ToViewBindingBehavior,
  FromViewBindingBehavior,
  TwoWayBindingBehavior,
} from './resources/binding-behaviors/binding-mode';
export {
  DebounceBindingBehavior,
} from './resources/binding-behaviors/debounce';
export {
  SignalBindingBehavior,
} from './resources/binding-behaviors/signals';
export {
  ThrottleBindingBehavior,
} from './resources/binding-behaviors/throttle';

export {
  Aurelia,
  IAurelia,
  type IEnhancementConfig,
  /**
   * @deprecated
   * Use `ISinglePageAppConfig` instead
   */
  type ISinglePageAppConfig as ISinglePageApp,
  type ISinglePageAppConfig,
} from './aurelia';
export {
  type IAppRootConfig,
  AppRoot,
  IAppRoot,
} from './app-root';
export {
  type TaskSlot,
  AppTask,
  IAppTask,
  type AppTaskCallback,
  type AppTaskCallbackNoArg,
} from './app-task';
export {
  AttrSyntax,
  IAttributeParser,
  attributePattern,
  type AttributePatternDefinition,
  IAttributePattern,
  type AttributePatternKind,
  AttributePattern,
  Interpretation,
  ISyntaxInterpreter,
  AtPrefixedTriggerAttributePattern,
  ColonPrefixedBindAttributePattern,
  DotSeparatedAttributePattern,
  RefAttributePattern,
} from '@aurelia/template-compiler';

export {
  bindingCommand,
  type ICommandBuildInfo,
  BindingCommand ,
  type BindingCommandInstance,
  type PartialBindingCommandDefinition,
  type BindingCommandStaticAuDefinition,
  BindingCommandDefinition,
  type BindingCommandKind,
  type BindingCommandType,
  DefaultBindingCommand,
  ForBindingCommand,
  FromViewBindingCommand,
  OneTimeBindingCommand,
  ToViewBindingCommand,
  TwoWayBindingCommand,
  TriggerBindingCommand,
  CaptureBindingCommand,
  AttrBindingCommand,
  ClassBindingCommand,
  StyleBindingCommand,
} from '@aurelia/template-compiler';
export {
  IAttrMapper,
  type IsTwoWayPredicate,
} from '@aurelia/template-compiler';
export {
  BindingMode,
  type IBindingController,
  type IBinding,
  type IRateLimitOptions,
} from './binding/interfaces-bindings';
export {
  IFlushQueue,
  FlushQueue,
  type IFlushable,
  BindingTargetSubscriber,
  mixinAstEvaluator,
  mixingBindingLimited,
  mixinUseScope,
} from './binding/binding-utils';
export {
  ListenerBinding,
  ListenerBindingOptions,
  type IModifiedEventHandler,
  IEventModifier,
  EventModifier,
  EventModifierRegistration,
  IModifiedEventHandlerCreator,
  IKeyMapping,
} from './binding/listener-binding';
export {
  AttributeBinding,
} from './binding/attribute';
export {
  InterpolationBinding,
  InterpolationPartBinding,
} from './binding/interpolation-binding';
export {
  ContentBinding,
} from './binding/content-binding';
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
  Scope,
  BindingContext,
  type IBindingContext,
  type IOverrideContext
} from './binding/scope';

export {
  IRenderer,
  renderer,

  PropertyBindingRenderer,
  TextBindingRenderer,
  ListenerBindingRenderer,
  IListenerBindingOptions,
  LetElementRenderer,
  TemplateControllerRenderer,
  AttributeBindingRenderer,
  CustomAttributeRenderer,
  CustomElementRenderer,
  InterpolationBindingRenderer,
  IteratorBindingRenderer,
  RefBindingRenderer,
  SetAttributeRenderer,
  SetClassAttributeRenderer,
  SetPropertyRenderer,
  SetStyleAttributeRenderer,
  SpreadRenderer,
  StylePropertyBindingRenderer,
} from './renderer';

export {
  ITemplateCompiler,
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
  SpreadBindingInstruction,
  SpreadElementPropBindingInstruction,
  MultiAttrInstruction,

  IInstruction,
  InstructionType,
} from '@aurelia/template-compiler';

export {
  AttributeNSAccessor,
} from './observation/attribute-ns-accessor';
export {
  type IInputElement,
  CheckedObserver,
} from './observation/checked-observer';
export {
  ClassAttributeAccessor,
} from './observation/class-attribute-accessor';
export {
  DataAttributeAccessor,
} from './observation/data-attribute-accessor';
export {
  NodeObserverLocator,
  type INodeObserverConfig,
  type INodeObserverConstructor as IHtmlObserverConstructor,
} from './observation/observer-locator';
export {
  type ISelectElement,
  type IOptionElement,
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
  SelfBindingBehavior,
} from './resources/binding-behaviors/self';
export {
  UpdateTriggerBindingBehavior,
} from './resources/binding-behaviors/update-trigger';

export {
  customAttribute,
  type CustomAttributeDecorator,
  CustomAttribute,
  CustomAttributeDefinition,
  type CustomAttributeKind,
  type CustomAttributeType,
  type PartialCustomAttributeDefinition,
  type CustomAttributeStaticAuDefinition,
  templateController,
} from './resources/custom-attribute';
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
  type PortalTarget,
  type PortalLifecycleCallback,
} from './resources/template-controllers/portal';

export {
  AuSlot,
} from './resources/custom-elements/au-slot';

export {
  capture,
  containerless,
  customElement,
  CustomElement,
  type CustomElementDecorator,
  type CustomElementKind,
  type CustomElementType,
  CustomElementDefinition,
  type PartialCustomElementDefinition,
  type CustomElementStaticAuDefinition,
  useShadowDOM,
  processContent,
} from './resources/custom-element';

export {
  AuCompose,
  type IDynamicComponentActivate,
} from './resources/custom-elements/au-compose';

export {
  ValueConverter,
  ValueConverterDefinition,
  type PartialValueConverterDefinition,
  type ValueConverterStaticAuDefinition,
  type ValueConverterKind,
  type ValueConverterDecorator,
  type ValueConverterType,
  type ValueConverterInstance,
  valueConverter,
} from './resources/value-converter';

export {
  ISanitizer,
  SanitizeValueConverter,
} from './resources/value-converters/sanitize';

export {
  type ConfigurationOptionsProvider,

  DefaultComponents,

  DefaultBindingSyntax,

  ShortHandBindingSyntax,

  DefaultBindingLanguage,

  DefaultResources,

  DefaultRenderers,

  StandardConfiguration,
} from './configuration';
export {
  ITemplateElementFactory
} from '@aurelia/template-compiler';
export {
  TemplateCompiler,
  ITemplateCompilerHooks,
  TemplateCompilerHooks,
  templateCompilerHooks,
  type IAttributeBindablesInfo,
  type IElementBindablesInfo,
  IBindablesInfoResolver,
} from '@aurelia/template-compiler';

export {
  type PartialChildrenDefinition,
  children,
  ChildrenBinding,
} from './templating/children';

// These exports are temporary until we have a proper way to unit test them
export {
  Controller,
  isCustomElementController,
  isCustomElementViewModel,
  type ViewModelKind,
  State,
  type ControllerVisitor,
  type IViewModel,
  IController,
  type IComponentController,
  type IContextualCustomElementController,
  type IControllerElementHydrationInstruction,
  type IHydratableController,
  IHydrationContext,
  type IDryCustomElementController,
  type ICustomAttributeController,
  type IHydratedController,
  type IHydratedComponentController,
  type IHydratedParentController,
  type ICompiledCustomElementController,
  type ICustomElementController,
  type ICustomElementViewModel,
  type ICustomAttributeViewModel,
  type IHydratedCustomElementViewModel,
  type IHydratedCustomAttributeViewModel,
  type ISyntheticView,
} from './templating/controller';
export {
  type IAuSlotProjections,
  type IAuSlot,
  type IAuSlotSubscriber,
  IAuSlotWatcher,
  IAuSlotsInfo,
  type PartialSlottedDefinition,
  AuSlotsInfo,
  slotted,
} from './templating/controller.projection';
export {
  ILifecycleHooks,
  LifecycleHooksEntry,
  LifecycleHooksDefinition,
  type LifecycleHooksLookup,
  type LifecycleHook,
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
} from './templating/view';
export {
  INode,
  IEventTarget,
  IRenderLocation,
  type INodeSequence,
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
  shadowCSS,
  StyleConfiguration,
  IShadowDOMStyleFactory,
  type IShadowDOMConfiguration,
  AdoptedStyleSheetsStyles,
  StyleElementStyles,
  IShadowDOMStyles,
  IShadowDOMGlobalStyles,
} from './templating/styles';

export {
  Watch,
  watch,
  type IWatchDefinition,
  type IWatcherCallback,
  type IDepCollectionFn,
} from './watch';

export {
  ComputedWatcher,
  ExpressionWatcher,
} from './templating/watchers';

export {
  ISignaler,
} from './signaler';

export {
  alias,
  registerAliases,
} from './utilities-di';
