/**
 *
 * NOTE: This file is still WIP and will go through at least one more iteration of refactoring, commenting and clean up!
 * In its current state, it is NOT a good source for learning about the inner workings and design of the router.
 *
 */

export {
  EventManager,
  IEventManager,
} from './event-manager.js';

export {
  EndpointContent,
} from './endpoints/endpoint-content.js';

export {
  // ILinkHandlerOptions,
  // AnchorEventInfo,

  ILinkHandler,
  LinkHandler,
} from './resources/link-handler.js';

export {
  InstructionParameters,
  Parameters,
} from './instructions/instruction-parameters.js';

export {
  // Navigation,
  IRouteableComponent,
  RouteableComponentType,
  IRoutingInstruction,
  LoadInstruction,
  ReloadBehavior,
} from './interfaces.js';

export {
  lifecycleLogger,
  LifecycleClass,
} from './utilities/lifecycle-logger.js';

export {
  INavRoute,
  Nav,
} from './nav.js';

export {
  NavRoute,
} from './nav-route.js';

export {
  Navigation,
} from './navigation.js';

export {
  NavigationCoordinator,
  NavigationState,
} from './navigation-coordinator.js';

export {
  // IStoredNavigatorEntry,
  // INavigatorEntry,
  INavigatorOptions,
  INavigationFlags,
  INavigatorState,
  INavigatorStore,
  INavigatorViewer,
  Navigator,
} from './navigator.js';

export {
  Runner,
  Step,
} from './utilities/runner.js';

export {
  QueueItem,
  IQueueOptions,
  Queue,
} from './utilities/queue.js';

export {
  IRoute,
  Route,
} from './route.js';

export {
  route,
} from './decorators/route.js';

export {
  RouteRecognizer,
  IConfigurableRoute,
  ConfigurableRoute,
  RecognizedRoute,
  Endpoint,
} from './route-recognizer.js';

export {
  IRouter,
  Router,

  RouterStartEvent,
  RouterStopEvent,
  RouterNavigationStartEvent,
  RouterNavigationEndEvent,
  RouterNavigationCancelEvent,
  RouterNavigationCompleteEvent,
  RouterNavigationErrorEvent,
} from './router.js';

export {
  IRouterOptions,
  IRouterTitle,
  RouterOptions,
} from './router-options.js';

export {
  Routes,
  routes,
} from './decorators/routes.js';

export {
  RoutingHook,
  RoutingHookType,
  IRoutingHookDefinition,
  RoutingHookFunction,
  RoutingHookParameter,
  RoutingHookResult,
  RoutingHookTarget,
  BeforeNavigationHookFunction,
  TransformFromUrlHookFunction,
  TransformToUrlHookFunction,
  TransformTitleHookFunction,
} from './routing-hook.js';

export {
  RoutingInstruction,
} from './instructions/routing-instruction.js';

export {
  TransitionAction,
  RoutingScope,
} from './routing-scope.js';

export {
  Viewport,
} from './endpoints/viewport.js';

export {
  IViewportOptions,
} from './endpoints/viewport-options.js';

export {
  IViewportScopeOptions,
  ViewportScope,
} from './endpoints/viewport-scope.js';

export {
  ViewportContent,
} from './endpoints/viewport-content.js';

export {
  RouterConfiguration,
  RouterRegistration,
  DefaultComponents,
  DefaultResources,
  ViewportCustomElement,
  ViewportCustomElementRegistration,
  ViewportScopeCustomElement,
  ViewportScopeCustomElementRegistration,
  NavCustomElement,
  NavCustomElementRegistration,
  GotoCustomAttribute,
  GotoCustomAttributeRegistration,
  LoadCustomAttribute,
  LoadCustomAttributeRegistration,
  HrefCustomAttribute,
  HrefCustomAttributeRegistration,
} from './configuration.js';

export {
  IRouteViewModel,
  ComponentAgent,
} from './component-agent.js';
export {
  RouteableComponent,
  NavigationInstruction,
  IViewportInstruction,
  Params,
} from './instructions.js';
export {
  ILocationManager,
  IBaseHrefProvider,
} from './location-manager.js';
export {
  Routeable,
  IRouteConfig,
  IChildRouteConfig,
  RouteConfig,
  ChildRouteConfig,
  Route,
  RouteType,
  route,
} from './route.js';
export {
  IRouteContext,
  RouteContext,
} from './route-context.js';
export {
  RouteDefinition,
} from './route-definition.js';
export {
  AST,
  RouteExpression,
  CompositeSegmentExpression,
  ScopedSegmentExpression,
  SegmentGroupExpression,
  SegmentExpression,
  ComponentExpression,
  ActionExpression,
  ViewportExpression,
  ParameterListExpression,
  ParameterExpression,
  ExpressionKind,
} from './route-expression.js';
export {
  RouteNode,
  RouteTree,
} from './route-tree.js';
export {
  AuNavId,
  ManagedState,
  isManagedState,
  toManagedState,
  IRouter,
  Router,
  IRouterOptions,
  INavigationOptions,
  RouterOptions,
  NavigationOptions,
  Transition,
  Navigation,
  RoutingMode,
  ResolutionMode,
  SwapStrategy,
  QueryParamsStrategy,
  FragmentStrategy,
  HistoryStrategy,
  SameUrlStrategy,
} from './router.js';
export {
  IRouterEvents,
  RouterEvent,
  LocationChangeEvent,
  NavigationStartEvent,
  NavigationEndEvent,
  NavigationCancelEvent,
  NavigationErrorEvent,
} from './router-events.js';
export {
  IStateManager,
} from './state-manager.js';
export {
  ViewportAgent,
} from './viewport-agent.js';
