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
  Aurelia,
  IAurelia,
  type IEnhancementConfig,
} from './aurelia';
export {
  type ISinglePageApp,
  AppRoot,
  IAppRoot,
  IWorkTracker,
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
  type IInstructionTypeClassifier,
  ITemplateCompiler,
  type ICompliationInstruction,
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
  type InstructionTypeName,
  type IInstruction,
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
  IEventDelegator,
  EventSubscriber,
  EventDelegator,
} from './observation/event-delegator';
export {
  NodeObserverConfig,
  NodeObserverLocator,
  type INodeObserverConfig,
  type IHtmlObserverConstructor,
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
  type SelfableBinding,
  SelfBindingBehavior,
} from './resources/binding-behaviors/self';
export {
  UpdateTriggerBindingBehavior,
  type UpdateTriggerableBinding,
  type UpdateTriggerableObserver,
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
  containerless,
  customElement,
  CustomElement,
  type CustomElementDecorator,
  type CustomElementKind,
  type CustomElementType,
  CustomElementDefinition,
  type PartialCustomElementDefinition,
  useShadowDOM,
  processContent,
} from './resources/custom-element';

export {
  type Subject,
  AuRender,
} from './resources/custom-elements/au-render';
export {
  AuCompose,
  type IDynamicComponentActivate,
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
  type INodeSequence,
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
  type DialogOpenResult,
  type DialogCancelError,
  type DialogCloseError,
  type DialogCloseResult,

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
} from './dialog';

export {
  IWcElementRegistry,
  type WebComponentViewModelClass,
  WcCustomElementRegistry,
} from './plugins/web-components';
