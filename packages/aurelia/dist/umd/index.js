(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "./quick-start", "@aurelia/debug", "@aurelia/fetch-client", "@aurelia/jit", "@aurelia/jit-html-browser", "@aurelia/kernel", "@aurelia/router", "@aurelia/runtime", "@aurelia/runtime-html"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var quick_start_1 = require("./quick-start");
    exports.Aurelia = quick_start_1.Aurelia;
    exports.default = quick_start_1.Aurelia;
    var debug_1 = require("@aurelia/debug");
    exports.DebugConfiguration = debug_1.DebugConfiguration;
    exports.TraceConfiguration = debug_1.TraceConfiguration;
    var fetch_client_1 = require("@aurelia/fetch-client");
    // RetryConfiguration,
    // RetryableRequest,
    // ValidInterceptorMethodName,
    exports.json = fetch_client_1.json;
    // retryStrategy,
    // RetryInterceptor,
    exports.HttpClientConfiguration = fetch_client_1.HttpClientConfiguration;
    exports.HttpClient = fetch_client_1.HttpClient;
    var jit_1 = require("@aurelia/jit");
    // AttrSyntax,
    // IAttributeParser,
    exports.attributePattern = jit_1.attributePattern;
    // AttributePatternDefinition,
    exports.IAttributePattern = jit_1.IAttributePattern;
    // IAttributePatternHandler,
    // Interpretation,
    // ISyntaxInterpreter,
    // AtPrefixedTriggerAttributePattern,
    // ColonPrefixedBindAttributePattern,
    // DotSeparatedAttributePattern,
    // RefAttributePattern,
    exports.bindingCommand = jit_1.bindingCommand;
    // BindingCommandDefinition,
    // BindingCommandKind,
    // BindingCommandType,
    exports.getTarget = jit_1.getTarget;
    // CallBindingCommand,
    // DefaultBindingCommand,
    // ForBindingCommand,
    // FromViewBindingCommand,
    // OneTimeBindingCommand,
    // ToViewBindingCommand,
    // TwoWayBindingCommand,
    // IExpressionParserRegistration,
    // DefaultComponents as JitDefaultComponents,
    // RefAttributePatternRegistration,
    // DotSeparatedAttributePatternRegistration,
    // DefaultBindingSyntax,
    // AtPrefixedTriggerAttributePatternRegistration,
    // ColonPrefixedBindAttributePatternRegistration,
    exports.ShortHandBindingSyntax = jit_1.ShortHandBindingSyntax;
    var jit_html_browser_1 = require("@aurelia/jit-html-browser");
    exports.JitHtmlBrowserConfiguration = jit_html_browser_1.JitHtmlBrowserConfiguration;
    var kernel_1 = require("@aurelia/kernel");
    exports.all = kernel_1.all;
    exports.DI = kernel_1.DI;
    exports.IContainer = kernel_1.IContainer;
    // IDefaultableInterfaceSymbol,
    // IFactory,
    exports.inject = kernel_1.inject;
    exports.IServiceLocator = kernel_1.IServiceLocator;
    exports.lazy = kernel_1.lazy;
    exports.optional = kernel_1.optional;
    // RegisterSelf,
    exports.Registration = kernel_1.Registration;
    // ResolveCallback,
    exports.singleton = kernel_1.singleton;
    exports.transient = kernel_1.transient;
    // Injectable,
    // InterfaceSymbol,
    exports.InstanceProvider = kernel_1.InstanceProvider;
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
    // metadata,
    exports.Metadata = kernel_1.Metadata;
    // IConsoleLike,
    exports.ColorOptions = kernel_1.ColorOptions;
    // ILogConfig,
    // ILogEvent,
    // ILogEventFactory,
    // ISink,
    exports.ILogger = kernel_1.ILogger;
    // LogConfig,
    // DefaultLogEvent,
    // DefaultLogEventFactory,
    // DefaultLogger,
    // ConsoleSink,
    exports.LoggerConfiguration = kernel_1.LoggerConfiguration;
    // relativeToFile,
    // join,
    // parseQueryString,
    // IQueryParams,
    exports.PLATFORM = kernel_1.PLATFORM;
    // ITraceInfo,
    // ITraceWriter,
    // ILiveLoggingOptions,
    exports.Reporter = kernel_1.Reporter;
    exports.Tracer = kernel_1.Tracer;
    exports.LogLevel = kernel_1.LogLevel;
    exports.Profiler = kernel_1.Profiler;
    // IResourceDefinition,
    // IResourceDescriptions,
    // IResourceKind,
    // IResourceType,
    // ResourceDescription,
    // ResourcePartDescription,
    // fromAnnotationOrDefinitionOrTypeOrDefault,
    // fromAnnotationOrTypeOrDefault,
    // fromDefinitionOrDefault,
    exports.EventAggregator = kernel_1.EventAggregator;
    exports.IEventAggregator = kernel_1.IEventAggregator;
    exports.isArrayIndex = kernel_1.isArrayIndex;
    exports.camelCase = kernel_1.camelCase;
    exports.kebabCase = kernel_1.kebabCase;
    exports.pascalCase = kernel_1.pascalCase;
    exports.toArray = kernel_1.toArray;
    // nextId,
    // resetId,
    // compareNumber,
    // mergeDistinct,
    // isNumberOrBigInt,
    // isStringOrDate,
    exports.bound = kernel_1.bound;
    var router_1 = require("@aurelia/router");
    // Nav,
    exports.NavRoute = router_1.NavRoute;
    exports.IRouter = router_1.IRouter;
    exports.Router = router_1.Router;
    // IViewportOptions,
    // Viewport,
    // ContentStatus,
    // ViewportContent,
    exports.ViewportInstruction = router_1.ViewportInstruction;
    exports.RouterConfiguration = router_1.RouterConfiguration;
    exports.RouterRegistration = router_1.RouterRegistration;
    var runtime_1 = require("@aurelia/runtime");
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
    // HtmlLiteralExpression,
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
    // IForOfStatement,
    // IHtmlLiteralExpression,
    // IInterpolationExpression,
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
    // PropertyBinding,
    // CallBinding,
    // IPartialConnectableBinding,
    // IConnectableBinding,
    // connectable,
    // IExpressionParser,
    // BindingType,
    // MultiInterpolationBinding,
    // InterpolationBinding,
    // LetBinding,
    // RefBinding,
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
    // Scope,
    // OverrideContext,
    // CollectionLengthObserver,
    // CollectionSizeObserver,
    // ComputedOverrides,
    // ComputedLookup,
    exports.computed = runtime_1.computed;
    // createComputedObserver,
    // CustomSetterObserver,
    // GetterObserver,
    // IDirtyChecker,
    // DirtyCheckProperty,
    // DirtyCheckSettings,
    // IObjectObservationAdapter,
    exports.IObserverLocator = runtime_1.IObserverLocator;
    // ITargetObserverLocator,
    // ITargetAccessorLocator,
    // getCollectionObserver,
    // ObserverLocator,
    // PrimitiveObserver,
    // PropertyAccessor,
    // ProxyObserver,
    // BindableObserver,
    // SetterObserver,
    exports.ISignaler = runtime_1.ISignaler;
    exports.subscriberCollection = runtime_1.subscriberCollection;
    exports.collectionSubscriberCollection = runtime_1.collectionSubscriberCollection;
    exports.proxySubscriberCollection = runtime_1.proxySubscriberCollection;
    exports.bindingBehavior = runtime_1.bindingBehavior;
    exports.BindingBehavior = runtime_1.BindingBehavior;
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
    exports.customAttribute = runtime_1.customAttribute;
    // CustomAttributeDecorator,
    exports.CustomAttribute = runtime_1.CustomAttribute;
    // CustomAttributeDefinition
    // CustomAttributeKind,
    // CustomAttributeType,
    // PartialCustomAttributeDefinition,
    exports.templateController = runtime_1.templateController;
    // FrequentMutations,
    // InfrequentMutations,
    // ObserveShallow,
    // If,
    // Else,
    // Repeat,
    // Replaceable,
    // With,
    exports.containerless = runtime_1.containerless;
    exports.customElement = runtime_1.customElement;
    exports.CustomElement = runtime_1.CustomElement;
    // CustomElementDecorator,
    // CustomElementKind,
    // CustomElementType,
    // CustomElementDefinition,
    // PartialCustomElementDefinition,
    // IElementProjector,
    // IProjectorLocator,
    exports.useShadowDOM = runtime_1.useShadowDOM;
    exports.ValueConverter = runtime_1.ValueConverter;
    // ValueConverterType,
    exports.valueConverter = runtime_1.valueConverter;
    // ISanitizer,
    // SanitizeValueConverter,
    // ViewValueConverter,
    // Clock,
    // IClock,
    // IClockSettings,
    exports.IScheduler = runtime_1.IScheduler;
    // ITask,
    // ITaskQueue,
    // QueueTaskOptions,
    // Task,
    // TaskAbortError,
    // TaskCallback,
    // TaskQueue,
    exports.TaskQueuePriority = runtime_1.TaskQueuePriority;
    // TaskStatus,
    // QueueTaskTargetOptions,
    exports.bindable = runtime_1.bindable;
    // PartialBindableDefinition,
    // BindableDefinition,
    exports.Bindable = runtime_1.Bindable;
    // PartialChildrenDefinition,
    // ChildrenDefinition,
    // Children,
    exports.children = runtime_1.children;
    // These exports are temporary until we have a proper way to unit test them
    exports.Controller = runtime_1.Controller;
    exports.ViewFactory = runtime_1.ViewFactory;
    // IViewLocator,
    // ViewLocator,
    // view,
    // Views,
    // Aurelia, // Replaced by quick-start wrapper
    // IDOMInitializer,
    // ISinglePageApp,
    exports.CompositionRoot = runtime_1.CompositionRoot;
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
    // ILifecycleRegistration,
    // IRendererRegistration,
    // RuntimeConfiguration,
    // AttributeInstruction,
    // HooksDefinition,
    // ICallBindingInstruction,
    // IHydrateAttributeInstruction,
    // IHydrateElementInstruction,
    // IHydrateLetElementInstruction,
    // IHydrateTemplateController,
    // IInterpolationInstruction,
    // IIteratorBindingInstruction,
    // ILetBindingInstruction,
    // InstructionRow,
    // InstructionTypeName,
    // IPropertyBindingInstruction,
    // IRefBindingInstruction,
    // ISetPropertyInstruction,
    // isTargetedInstruction,
    // ITargetedInstruction,
    // NodeInstruction,
    // TargetedInstruction,
    // TargetedInstructionType,
    // PartialCustomElementDefinitionParts,
    exports.alias = runtime_1.alias;
    exports.registerAliases = runtime_1.registerAliases;
    // DOM, should expose the one exported in runtime-html
    exports.INode = runtime_1.INode;
    exports.IRenderLocation = runtime_1.IRenderLocation;
    exports.IDOM = runtime_1.IDOM;
    // NodeSequence,
    // INodeSequence,
    // INodeSequenceFactory,
    exports.BindingMode = runtime_1.BindingMode;
    exports.BindingStrategy = runtime_1.BindingStrategy;
    // ExpressionKind,
    // Hooks,
    exports.LifecycleFlags = runtime_1.LifecycleFlags;
    // State,
    // CallBindingInstruction,
    // FromViewBindingInstruction,
    // HydrateAttributeInstruction,
    // HydrateElementInstruction,
    // HydrateTemplateController,
    // InterpolationInstruction,
    // IteratorBindingInstruction,
    // LetBindingInstruction,
    // LetElementInstruction,
    // OneTimeBindingInstruction,
    // RefBindingInstruction,
    // SetPropertyInstruction,
    // ToViewBindingInstruction,
    // TwoWayBindingInstruction,
    // ViewModelKind,
    // IBinding,
    exports.ILifecycle = runtime_1.ILifecycle;
    // IController,
    // IContainer,
    // IViewCache,
    // IViewFactory,
    // MountStrategy,
    // PromiseOrTask,
    // MaybePromiseOrTask,
    exports.AggregateContinuationTask = runtime_1.AggregateContinuationTask;
    exports.TerminalTask = runtime_1.TerminalTask;
    exports.AggregateTerminalTask = runtime_1.AggregateTerminalTask;
    exports.ContinuationTask = runtime_1.ContinuationTask;
    exports.LifecycleTask = runtime_1.LifecycleTask;
    exports.PromiseTask = runtime_1.PromiseTask;
    exports.TaskSlot = runtime_1.TaskSlot;
    exports.StartTask = runtime_1.StartTask;
    exports.IStartTask = runtime_1.IStartTask;
    exports.IStartTaskManager = runtime_1.IStartTaskManager;
    exports.ProviderTask = runtime_1.ProviderTask;
    // IObservable,
    // IObservedArray,
    // IObservedMap,
    // IObservedSet,
    // IOverrideContext,
    // IPropertyChangeTracker,
    // IPropertyObserver,
    // IScope,
    // ISubscribable,
    // ISubscriberCollection,
    // ObservedCollection,
    // ObserversLookup,
    // PropertyObserver,
    // CollectionObserver,
    // ICollectionSubscriberCollection,
    // IProxyObserver,
    // IProxy,
    // IProxySubscribable,
    // IProxySubscriber,
    // IProxySubscriberCollection,
    // ICollectionSubscribable,
    // ISubscriber,
    // isIndexMap,
    // copyIndexMap,
    // cloneIndexMap,
    // createIndexMap,
    exports.instructionRenderer = runtime_1.instructionRenderer;
    exports.ensureExpression = runtime_1.ensureExpression;
    var runtime_html_1 = require("@aurelia/runtime-html");
    // Listener,
    // AttributeBinding,
    // AttributeNSAccessor,
    // IInputElement,
    // CheckedObserver,
    // ClassAttributeAccessor,
    // DataAttributeAccessor,
    // ElementPropertyAccessor,
    // IManagedEvent,
    // ListenerTracker,
    // DelegateOrCaptureSubscription,
    // TriggerSubscription,
    // IElementConfiguration,
    // IEventManager,
    // IEventSubscriber,
    // IEventTargetWithLookups,
    // EventSubscriber,
    // EventSubscription,
    // EventManager,
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
    // UpdateTriggerableBinding,
    // UpdateTriggerableObserver,
    // Blur,
    // BlurManager,
    // Focus,
    // Portal,
    // PortalTarget,
    // PortalLifecycleCallback,
    // Subject,
    // Compose,
    // IProjectorLocatorRegistration,
    // ITargetAccessorLocatorRegistration,
    // ITargetObserverLocatorRegistration,
    // ITemplateFactoryRegistration,
    // DefaultComponents as RuntimeHtmlDefaultComponents,
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
    // RuntimeHtmlConfiguration,
    exports.createElement = runtime_html_1.createElement;
    // RenderPlan,
    // HTMLAttributeInstruction,
    // HTMLInstructionRow,
    // HTMLNodeInstruction,
    // HTMLTargetedInstruction,
    // HTMLTargetedInstructionType,
    // IAttributeBindingInstruction,
    // IListenerBindingInstruction,
    // ISetAttributeInstruction,
    // isHTMLTargetedInstruction,
    // IStylePropertyBindingInstruction,
    // ITextBindingInstruction,
    // NodeType,
    exports.HTMLDOM = runtime_html_1.HTMLDOM;
    exports.DOM = runtime_html_1.DOM;
    // NodeSequenceFactory,
    // FragmentNodeSequence,
    // AttributeBindingInstruction,
    // CaptureBindingInstruction,
    // DelegateBindingInstruction,
    // SetAttributeInstruction,
    // SetClassAttributeInstruction,
    // SetStyleAttributeInstruction,
    // StylePropertyBindingInstruction,
    // TextBindingInstruction,
    // TriggerBindingInstruction,
    // ContainerlessProjector,
    // HostProjector,
    // HTMLProjectorLocator,
    // ShadowDOMProjector,
    exports.StyleConfiguration = runtime_html_1.StyleConfiguration;
    // CSSModulesProcessorRegistry,
    exports.cssModules = runtime_html_1.cssModules;
    // ShadowDOMRegistry,
    // IShadowDOMStyleFactory,
    exports.shadowCSS = runtime_html_1.shadowCSS;
});
//# sourceMappingURL=index.js.map