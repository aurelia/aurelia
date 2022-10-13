export {
  bindable,
  Bindable,
  BindableDefinition,
  type PartialBindableDefinition,
  coercer,
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
  bindingBehavior,
  BindingBehavior,
  BindingBehaviorDefinition,
  type PartialBindingBehaviorDefinition,
  type BindingBehaviorKind,
  type BindingBehaviorDecorator,
  type BindingBehaviorType,
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
} from './aurelia';
export {
  type ISinglePageApp,
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
  type ICommandBuildInfo,
  BindingCommand ,
  type BindingCommandInstance,
  BindingCommandDefinition,
  type BindingCommandKind,
  type BindingCommandType,
  CommandType,
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
} from './resources/binding-command';
export {
  IAttrMapper,
  type IsTwoWayPredicate,
} from './compiler/attribute-mapper';
export {
  BindingMode,
  type IBindingController,
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
} from './binding/listener-binding';
export {
  AttributeBinding,
} from './binding/attribute';
export {
  InterpolationBinding,
  InterpolationPartBinding,
  ContentBinding,
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
  type IInstructionTypeClassifier,
  ITemplateCompiler,
  type ICompliationInstruction,
  renderer,
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
  type InstructionTypeName,
  IInstruction,
  InstructionType,
} from './renderer';

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
  IProjections,
  AuSlotsInfo,
  IAuSlotsInfo,
} from './resources/slot-injectables';
export {
  DefinitionType,
} from './resources/resources-shared';

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
  strict,
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
  type ValueConverterKind,
  type ValueConverterDecorator,
  type ValueConverterType,
  valueConverter,
} from './resources/value-converter';

export {
  ISanitizer,
  SanitizeValueConverter,
} from './resources/value-converters/sanitize';

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

  DefaultBindingCommandRegistration,
  ForBindingCommandRegistration,
  RefBindingCommandRegistration,
  FromViewBindingCommandRegistration,
  OneTimeBindingCommandRegistration,
  ToViewBindingCommandRegistration,
  TwoWayBindingCommandRegistration,
  TriggerBindingCommandRegistration,
  CaptureBindingCommandRegistration,
  AttrBindingCommandRegistration,
  ClassBindingCommandRegistration,
  StyleBindingCommandRegistration,

  DefaultBindingLanguage,

  SanitizeValueConverterRegistration,
  IfRegistration,
  ElseRegistration,
  RepeatRegistration,
  WithRegistration,
  AttrBindingBehaviorRegistration,
  SelfBindingBehaviorRegistration,
  UpdateTriggerBindingBehaviorRegistration,

  DefaultResources,

  AttributeBindingRendererRegistration,
  ListenerBindingRendererRegistration,
  SetAttributeRendererRegistration,
  SetClassAttributeRendererRegistration,
  SetStyleAttributeRendererRegistration,
  StylePropertyBindingRendererRegistration,
  TextBindingRendererRegistration,

  RefBindingRendererRegistration,
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
} from './compiler/template-element-factory';
export {
  BindablesInfo,
  TemplateCompiler,
  ITemplateCompilerHooks,
  TemplateCompilerHooks,
  templateCompilerHooks,
} from './compiler/template-compiler';

export {
  allResources,
} from './utilities-di';

export {
  type PartialChildrenDefinition,
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
  HooksDefinition,
  State,
  LifecycleFlags,
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
  type IShadowDOMStyleFactory,
  shadowCSS,
  StyleConfiguration,
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
  alias,
  registerAliases,
} from './utilities-di';
