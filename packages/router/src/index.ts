/**
 *
 * NOTE: This file is still WIP and will go through at least one more iteration of refactoring, commenting and clean up!
 * In its current state, it is NOT a good source for learning about the inner workings and design of the router.
 *
 */

export {
  Endpoint,
  IConnectedCustomElement,
  IEndpointOptions,
} from './endpoints/endpoint.js';

export {
  EndpointContent,
} from './endpoints/endpoint-content.js';

export {
  FoundRoute,
} from './found-route.js';

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
  ComponentAppellation,
  IRouteableComponent,
  RouteableComponentType,
  IRoutingInstruction,
  LoadInstruction,
  ReloadBehavior,
} from './interfaces.js';

export {
  Navigation,
  NavigationFlags,
} from './navigation.js';

export {
  NavigationCoordinator,
  NavigationState,
} from './navigation-coordinator.js';

export {
  // IStoredNavigatorEntry,
  // INavigatorEntry,
  INavigatorOptions,
  INavigatorState,
  INavigatorStore,
  INavigatorViewer,
  Navigator,
} from './navigator.js';

export {
  Runner,
  Step,
} from './utilities/runner.js';

// export {
//   QueueItem,
//   IQueueOptions,
//   Queue,
// } from './utilities/queue.js';

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
  Endpoint as RecognizerEndpoint,
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
  ITitleOptions,
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
  RoutingHookIdentity,
  RoutingHookParameter,
  RoutingHookResult,
  IRoutingHookOptions,
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
  ViewportOptions,
} from './endpoints/viewport-options.js';

export {
  IViewportScopeOptions,
  ViewportScope,
} from './endpoints/viewport-scope.js';

export {
  ViewportContent,
} from './endpoints/viewport-content.js';

export {
  ViewportScopeContent,
} from './endpoints/viewport-scope-content.js';

export {
  RouterConfiguration,
  IRouterConfiguration,
  RouterRegistration,
  DefaultComponents,
  DefaultResources,
  ViewportCustomElementRegistration,
  ViewportScopeCustomElementRegistration,
  LoadCustomAttributeRegistration,
  HrefCustomAttributeRegistration,
} from './configuration.js';

export { ViewportCustomElement } from './resources/viewport.js';
export { ViewportScopeCustomElement } from './resources/viewport-scope.js';
export { LoadCustomAttribute } from './resources/load.js';
export { HrefCustomAttribute } from './resources/href.js';
export { ConsideredActiveCustomAttribute } from './resources/considered-active.js';

