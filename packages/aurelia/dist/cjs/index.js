"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Watch = exports.ExpressionWatcher = exports.ComputedWatcher = exports.ComputedObserver = exports.RouterRegistration = exports.RouterConfiguration = exports.IRouteContext = exports.RouteConfig = exports.Route = exports.route = exports.RouteNode = exports.Router = exports.IRouterEvents = exports.IRouter = exports.RouterOptions = exports.bound = exports.toArray = exports.pascalCase = exports.kebabCase = exports.camelCase = exports.isArrayIndex = exports.IEventAggregator = exports.EventAggregator = exports.LogLevel = exports.noop = exports.emptyObject = exports.emptyArray = exports.LoggerConfiguration = exports.ConsoleSink = exports.ILogger = exports.ColorOptions = exports.Metadata = exports.InstanceProvider = exports.transient = exports.singleton = exports.Registration = exports.optional = exports.lazy = exports.IServiceLocator = exports.inject = exports.IContainer = exports.DI = exports.all = exports.IHttpClient = exports.HttpClient = exports.HttpClientConfiguration = exports.json = exports.Aurelia = exports.IPlatform = exports.PLATFORM = void 0;
exports.lifecycleHooks = exports.LifecycleHooks = exports.ILifecycleHooks = exports.shadowCSS = exports.cssModules = exports.StyleConfiguration = exports.createElement = exports.ShortHandBindingSyntax = exports.bindingCommand = exports.IAttrSyntaxTransformer = exports.IAttributePattern = exports.attributePattern = exports.AuSlotsInfo = exports.IAuSlotsInfo = exports.NodeObserverLocator = exports.IAurelia = exports.renderer = exports.LifecycleFlags = exports.BindingMode = exports.IRenderLocation = exports.IEventTarget = exports.INode = exports.registerAliases = exports.alias = exports.IWorkTracker = exports.IAppRoot = exports.ViewFactory = exports.Controller = exports.children = exports.Bindable = exports.bindable = exports.TaskQueuePriority = exports.AppTask = exports.valueConverter = exports.ValueConverter = exports.useShadowDOM = exports.CustomElement = exports.customElement = exports.containerless = exports.templateController = exports.CustomAttribute = exports.customAttribute = exports.BindingBehavior = exports.bindingBehavior = exports.subscriberCollection = exports.ISignaler = exports.IObserverLocator = exports.watch = void 0;
const kernel_1 = require("@aurelia/kernel");
const runtime_html_1 = require("@aurelia/runtime-html");
Object.defineProperty(exports, "IPlatform", { enumerable: true, get: function () { return runtime_html_1.IPlatform; } });
const platform_browser_1 = require("@aurelia/platform-browser");
exports.PLATFORM = platform_browser_1.BrowserPlatform.getOrCreate(globalThis);
function createContainer() {
    return kernel_1.DI.createContainer()
        .register(kernel_1.Registration.instance(runtime_html_1.IPlatform, exports.PLATFORM), runtime_html_1.StandardConfiguration);
}
class Aurelia extends runtime_html_1.Aurelia {
    constructor(container = createContainer()) {
        super(container);
    }
    static start(root) {
        return new Aurelia().start(root);
    }
    static app(config) {
        return new Aurelia().app(config);
    }
    static enhance(config) {
        return new Aurelia().enhance(config);
    }
    static register(...params) {
        return new Aurelia().register(...params);
    }
    app(config) {
        if (runtime_html_1.CustomElement.isType(config)) {
            // Default to custom element element name
            const definition = runtime_html_1.CustomElement.getDefinition(config);
            let host = document.querySelector(definition.name);
            if (host === null) {
                // When no target is found, default to body.
                // For example, when user forgot to write <my-app></my-app> in html.
                host = document.body;
            }
            return super.app({
                host: host,
                component: config
            });
        }
        return super.app(config);
    }
}
exports.Aurelia = Aurelia;
exports.default = Aurelia;
var fetch_client_1 = require("@aurelia/fetch-client");
// RetryConfiguration,
// RetryableRequest,
// ValidInterceptorMethodName,
Object.defineProperty(exports, "json", { enumerable: true, get: function () { return fetch_client_1.json; } });
// retryStrategy,
// RetryInterceptor,
Object.defineProperty(exports, "HttpClientConfiguration", { enumerable: true, get: function () { return fetch_client_1.HttpClientConfiguration; } });
Object.defineProperty(exports, "HttpClient", { enumerable: true, get: function () { return fetch_client_1.HttpClient; } });
Object.defineProperty(exports, "IHttpClient", { enumerable: true, get: function () { return fetch_client_1.IHttpClient; } });
var kernel_2 = require("@aurelia/kernel");
Object.defineProperty(exports, "all", { enumerable: true, get: function () { return kernel_2.all; } });
Object.defineProperty(exports, "DI", { enumerable: true, get: function () { return kernel_2.DI; } });
Object.defineProperty(exports, "IContainer", { enumerable: true, get: function () { return kernel_2.IContainer; } });
// IDefaultableInterfaceSymbol,
// IFactory,
Object.defineProperty(exports, "inject", { enumerable: true, get: function () { return kernel_2.inject; } });
Object.defineProperty(exports, "IServiceLocator", { enumerable: true, get: function () { return kernel_2.IServiceLocator; } });
Object.defineProperty(exports, "lazy", { enumerable: true, get: function () { return kernel_2.lazy; } });
Object.defineProperty(exports, "optional", { enumerable: true, get: function () { return kernel_2.optional; } });
// RegisterSelf,
Object.defineProperty(exports, "Registration", { enumerable: true, get: function () { return kernel_2.Registration; } });
// ResolveCallback,
Object.defineProperty(exports, "singleton", { enumerable: true, get: function () { return kernel_2.singleton; } });
Object.defineProperty(exports, "transient", { enumerable: true, get: function () { return kernel_2.transient; } });
// Injectable,
// InterfaceSymbol,
Object.defineProperty(exports, "InstanceProvider", { enumerable: true, get: function () { return kernel_2.InstanceProvider; } });
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
Object.defineProperty(exports, "Metadata", { enumerable: true, get: function () { return kernel_2.Metadata; } });
// IConsoleLike,
Object.defineProperty(exports, "ColorOptions", { enumerable: true, get: function () { return kernel_2.ColorOptions; } });
// ILogConfig,
// ILogEvent,
// ILogEventFactory,
// ISink,
Object.defineProperty(exports, "ILogger", { enumerable: true, get: function () { return kernel_2.ILogger; } });
// LogConfig,
// DefaultLogEvent,
// DefaultLogEventFactory,
// DefaultLogger,
Object.defineProperty(exports, "ConsoleSink", { enumerable: true, get: function () { return kernel_2.ConsoleSink; } });
Object.defineProperty(exports, "LoggerConfiguration", { enumerable: true, get: function () { return kernel_2.LoggerConfiguration; } });
// relativeToFile,
// join,
// parseQueryString,
// IQueryParams,
Object.defineProperty(exports, "emptyArray", { enumerable: true, get: function () { return kernel_2.emptyArray; } });
Object.defineProperty(exports, "emptyObject", { enumerable: true, get: function () { return kernel_2.emptyObject; } });
Object.defineProperty(exports, "noop", { enumerable: true, get: function () { return kernel_2.noop; } });
// ITraceInfo,
// ITraceWriter,
// ILiveLoggingOptions,
Object.defineProperty(exports, "LogLevel", { enumerable: true, get: function () { return kernel_2.LogLevel; } });
// IResourceDefinition,
// IResourceDescriptions,
// IResourceKind,
// IResourceType,
// ResourceDescription,
// ResourcePartDescription,
// fromAnnotationOrDefinitionOrTypeOrDefault,
// fromAnnotationOrTypeOrDefault,
// fromDefinitionOrDefault,
Object.defineProperty(exports, "EventAggregator", { enumerable: true, get: function () { return kernel_2.EventAggregator; } });
Object.defineProperty(exports, "IEventAggregator", { enumerable: true, get: function () { return kernel_2.IEventAggregator; } });
Object.defineProperty(exports, "isArrayIndex", { enumerable: true, get: function () { return kernel_2.isArrayIndex; } });
Object.defineProperty(exports, "camelCase", { enumerable: true, get: function () { return kernel_2.camelCase; } });
Object.defineProperty(exports, "kebabCase", { enumerable: true, get: function () { return kernel_2.kebabCase; } });
Object.defineProperty(exports, "pascalCase", { enumerable: true, get: function () { return kernel_2.pascalCase; } });
Object.defineProperty(exports, "toArray", { enumerable: true, get: function () { return kernel_2.toArray; } });
// nextId,
// resetId,
// compareNumber,
// mergeDistinct,
// isNumberOrBigInt,
// isStringOrDate,
Object.defineProperty(exports, "bound", { enumerable: true, get: function () { return kernel_2.bound; } });
var router_1 = require("@aurelia/router");
Object.defineProperty(exports, "RouterOptions", { enumerable: true, get: function () { return router_1.RouterOptions; } });
Object.defineProperty(exports, "IRouter", { enumerable: true, get: function () { return router_1.IRouter; } });
Object.defineProperty(exports, "IRouterEvents", { enumerable: true, get: function () { return router_1.IRouterEvents; } });
Object.defineProperty(exports, "Router", { enumerable: true, get: function () { return router_1.Router; } });
Object.defineProperty(exports, "RouteNode", { enumerable: true, get: function () { return router_1.RouteNode; } });
Object.defineProperty(exports, "route", { enumerable: true, get: function () { return router_1.route; } });
Object.defineProperty(exports, "Route", { enumerable: true, get: function () { return router_1.Route; } });
Object.defineProperty(exports, "RouteConfig", { enumerable: true, get: function () { return router_1.RouteConfig; } });
Object.defineProperty(exports, "IRouteContext", { enumerable: true, get: function () { return router_1.IRouteContext; } });
Object.defineProperty(exports, "RouterConfiguration", { enumerable: true, get: function () { return router_1.RouterConfiguration; } });
Object.defineProperty(exports, "RouterRegistration", { enumerable: true, get: function () { return router_1.RouterRegistration; } });
var runtime_html_2 = require("@aurelia/runtime-html");
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
// ForOfStatement,
// IHtmlLiteralExpression,
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
// OverrideContext,
// CollectionLengthObserver,
// CollectionSizeObserver,
// IDirtyChecker,
// DirtyCheckProperty,
// DirtyCheckSettings,
Object.defineProperty(exports, "ComputedObserver", { enumerable: true, get: function () { return runtime_html_2.ComputedObserver; } });
Object.defineProperty(exports, "ComputedWatcher", { enumerable: true, get: function () { return runtime_html_2.ComputedWatcher; } });
Object.defineProperty(exports, "ExpressionWatcher", { enumerable: true, get: function () { return runtime_html_2.ExpressionWatcher; } });
Object.defineProperty(exports, "Watch", { enumerable: true, get: function () { return runtime_html_2.Watch; } });
Object.defineProperty(exports, "watch", { enumerable: true, get: function () { return runtime_html_2.watch; } });
// IObjectObservationAdapter,
Object.defineProperty(exports, "IObserverLocator", { enumerable: true, get: function () { return runtime_html_2.IObserverLocator; } });
// ITargetObserverLocator,
// ITargetAccessorLocator,
// getCollectionObserver,
// ObserverLocator,
// PrimitiveObserver,
// PropertyAccessor,
// BindableObserver,
// SetterObserver,
Object.defineProperty(exports, "ISignaler", { enumerable: true, get: function () { return runtime_html_2.ISignaler; } });
Object.defineProperty(exports, "subscriberCollection", { enumerable: true, get: function () { return runtime_html_2.subscriberCollection; } });
Object.defineProperty(exports, "bindingBehavior", { enumerable: true, get: function () { return runtime_html_2.bindingBehavior; } });
Object.defineProperty(exports, "BindingBehavior", { enumerable: true, get: function () { return runtime_html_2.BindingBehavior; } });
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
Object.defineProperty(exports, "customAttribute", { enumerable: true, get: function () { return runtime_html_2.customAttribute; } });
// CustomAttributeDecorator,
Object.defineProperty(exports, "CustomAttribute", { enumerable: true, get: function () { return runtime_html_2.CustomAttribute; } });
// CustomAttributeDefinition
// CustomAttributeKind,
// CustomAttributeType,
// PartialCustomAttributeDefinition,
Object.defineProperty(exports, "templateController", { enumerable: true, get: function () { return runtime_html_2.templateController; } });
// FrequentMutations,
// InfrequentMutations,
// ObserveShallow,
// If,
// Else,
// Repeat,
// Replaceable,
// With,
Object.defineProperty(exports, "containerless", { enumerable: true, get: function () { return runtime_html_2.containerless; } });
Object.defineProperty(exports, "customElement", { enumerable: true, get: function () { return runtime_html_2.customElement; } });
Object.defineProperty(exports, "CustomElement", { enumerable: true, get: function () { return runtime_html_2.CustomElement; } });
// CustomElementDecorator,
// CustomElementKind,
// CustomElementType,
// CustomElementDefinition,
// PartialCustomElementDefinition,
// IElementProjector,
// IProjectorLocator,
Object.defineProperty(exports, "useShadowDOM", { enumerable: true, get: function () { return runtime_html_2.useShadowDOM; } });
Object.defineProperty(exports, "ValueConverter", { enumerable: true, get: function () { return runtime_html_2.ValueConverter; } });
// ValueConverterType,
Object.defineProperty(exports, "valueConverter", { enumerable: true, get: function () { return runtime_html_2.valueConverter; } });
// ISanitizer,
// SanitizeValueConverter,
// ViewValueConverter,
// Clock,
// IClock,
// IClockSettings,
// ITask,
// TaskQueue,
// QueueTaskOptions,
// Task,
// TaskAbortError,
// TaskCallback,
// TaskQueue,
Object.defineProperty(exports, "AppTask", { enumerable: true, get: function () { return runtime_html_2.AppTask; } });
Object.defineProperty(exports, "TaskQueuePriority", { enumerable: true, get: function () { return runtime_html_2.TaskQueuePriority; } });
// TaskStatus,
// QueueTaskTargetOptions,
Object.defineProperty(exports, "bindable", { enumerable: true, get: function () { return runtime_html_2.bindable; } });
// BindableDefinition,
Object.defineProperty(exports, "Bindable", { enumerable: true, get: function () { return runtime_html_2.Bindable; } });
// PartialChildrenDefinition,
// ChildrenDefinition,
// Children,
Object.defineProperty(exports, "children", { enumerable: true, get: function () { return runtime_html_2.children; } });
// These exports are temporary until we have a proper way to unit test them
Object.defineProperty(exports, "Controller", { enumerable: true, get: function () { return runtime_html_2.Controller; } });
Object.defineProperty(exports, "ViewFactory", { enumerable: true, get: function () { return runtime_html_2.ViewFactory; } });
// IViewLocator,
// ViewLocator,
// view,
// Views,
// Aurelia, // Replaced by quick-start wrapper
// IDOMInitializer,
// ISinglePageApp,
Object.defineProperty(exports, "IAppRoot", { enumerable: true, get: function () { return runtime_html_2.IAppRoot; } });
Object.defineProperty(exports, "IWorkTracker", { enumerable: true, get: function () { return runtime_html_2.IWorkTracker; } });
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
Object.defineProperty(exports, "alias", { enumerable: true, get: function () { return runtime_html_2.alias; } });
Object.defineProperty(exports, "registerAliases", { enumerable: true, get: function () { return runtime_html_2.registerAliases; } });
// DOM, should expose the one exported in runtime-html
Object.defineProperty(exports, "INode", { enumerable: true, get: function () { return runtime_html_2.INode; } });
Object.defineProperty(exports, "IEventTarget", { enumerable: true, get: function () { return runtime_html_2.IEventTarget; } });
Object.defineProperty(exports, "IRenderLocation", { enumerable: true, get: function () { return runtime_html_2.IRenderLocation; } });
// NodeSequence,
// INodeSequence,
// INodeSequenceFactory,
Object.defineProperty(exports, "BindingMode", { enumerable: true, get: function () { return runtime_html_2.BindingMode; } });
// ExpressionKind,
// Hooks,
Object.defineProperty(exports, "LifecycleFlags", { enumerable: true, get: function () { return runtime_html_2.LifecycleFlags; } });
// IObservable,
// IObservedArray,
// IObservedMap,
// IObservedSet,
// IOverrideContext,
// Scope,
// ISubscribable,
// ISubscriberCollection,
// ObservedCollection,
// CollectionObserver,
// ICollectionSubscriberCollection,
// ICollectionSubscribable,
// ISubscriber,
// isIndexMap,
// copyIndexMap,
// cloneIndexMap,
// createIndexMap,
Object.defineProperty(exports, "renderer", { enumerable: true, get: function () { return runtime_html_2.renderer; } });
// DefaultBindingLanguage as JitDefaultBindingLanguage,
// JitConfiguration,
// Access,
// Precedence,
// Char,
// These exports are temporary until we have a proper way to unit test them
// parseExpression,
// parse,
// ParserState,
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
Object.defineProperty(exports, "IAurelia", { enumerable: true, get: function () { return runtime_html_2.IAurelia; } });
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
// IEventDelegator,
// IEventSubscriber,
// IEventTargetWithLookups,
// EventSubscriber,
// EventSubscription,
// EventDelegator,
Object.defineProperty(exports, "NodeObserverLocator", { enumerable: true, get: function () { return runtime_html_2.NodeObserverLocator; } });
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
Object.defineProperty(exports, "IAuSlotsInfo", { enumerable: true, get: function () { return runtime_html_2.IAuSlotsInfo; } });
Object.defineProperty(exports, "AuSlotsInfo", { enumerable: true, get: function () { return runtime_html_2.AuSlotsInfo; } });
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
// ITemplateCompiler,
// ITemplateFactory,
// RenderContext
// AttrSyntax,
// IAttributeParser,
Object.defineProperty(exports, "attributePattern", { enumerable: true, get: function () { return runtime_html_2.attributePattern; } });
// AttributePatternDefinition,
Object.defineProperty(exports, "IAttributePattern", { enumerable: true, get: function () { return runtime_html_2.IAttributePattern; } });
// IAttributePatternHandler,
// Interpretation,
// ISyntaxInterpreter,
Object.defineProperty(exports, "IAttrSyntaxTransformer", { enumerable: true, get: function () { return runtime_html_2.IAttrSyntaxTransformer; } });
// AtPrefixedTriggerAttributePattern,
// ColonPrefixedBindAttributePattern,
// DotSeparatedAttributePattern,
// RefAttributePattern,
Object.defineProperty(exports, "bindingCommand", { enumerable: true, get: function () { return runtime_html_2.bindingCommand; } });
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
// IExpressionParserRegistration,
// DefaultComponents as JitDefaultComponents,
// RefAttributePatternRegistration,
// DotSeparatedAttributePatternRegistration,
// DefaultBindingSyntax,
// AtPrefixedTriggerAttributePatternRegistration,
// ColonPrefixedBindAttributePatternRegistration,
Object.defineProperty(exports, "ShortHandBindingSyntax", { enumerable: true, get: function () { return runtime_html_2.ShortHandBindingSyntax; } });
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
Object.defineProperty(exports, "createElement", { enumerable: true, get: function () { return runtime_html_2.createElement; } });
// RenderPlan,
// AttributeInstruction,
// IInstructionRow,
// NodeInstruction,
// IInstruction,
// InstructionType,
// IAttributeBindingInstruction,
// IListenerBindingInstruction,
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
Object.defineProperty(exports, "StyleConfiguration", { enumerable: true, get: function () { return runtime_html_2.StyleConfiguration; } });
// CSSModulesProcessorRegistry,
Object.defineProperty(exports, "cssModules", { enumerable: true, get: function () { return runtime_html_2.cssModules; } });
// ShadowDOMRegistry,
// IShadowDOMStyleFactory,
Object.defineProperty(exports, "shadowCSS", { enumerable: true, get: function () { return runtime_html_2.shadowCSS; } });
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
Object.defineProperty(exports, "ILifecycleHooks", { enumerable: true, get: function () { return runtime_html_2.ILifecycleHooks; } });
Object.defineProperty(exports, "LifecycleHooks", { enumerable: true, get: function () { return runtime_html_2.LifecycleHooks; } });
Object.defineProperty(exports, "lifecycleHooks", { enumerable: true, get: function () { return runtime_html_2.lifecycleHooks; } });
//# sourceMappingURL=index.js.map