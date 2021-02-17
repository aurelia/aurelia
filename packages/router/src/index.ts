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
  IViewportOptions,
  Viewport,
} from './endpoints/viewport.js';

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
