/**
 *
 * NOTE: This file is still WIP and will go through at least one more iteration of refactoring, commenting and clean up!
 * In its current state, it is NOT a good source for learning about the inner workings and design of the router.
 *
 */

export {
  Endpoint,
  type IConnectedCustomElement,
  type IEndpointOptions,
} from './endpoints/endpoint';

export {
  EndpointContent,
} from './endpoints/endpoint-content';

export {
  FoundRoute,
} from './found-route';

export {
  // ILinkHandlerOptions,
  // AnchorEventInfo,

  ILinkHandler,
  LinkHandler,
} from './resources/link-handler';

export {
  InstructionParameters,
  type Parameters,
} from './instructions/instruction-parameters';

export {
  // Navigation,
  type ComponentAppellation,
  type IRouteableComponent,
  type RouteableComponentType,
  type IRoutingInstruction,
  type LoadInstruction,
  ReloadBehavior,
} from './interfaces';

export {
  Navigation,
  NavigationFlags,
} from './navigation';

export {
  NavigationCoordinator,
  type NavigationState,
} from './navigation-coordinator';

export {
  // IStoredNavigatorEntry,
  // INavigatorEntry,
  type INavigatorOptions,
  type INavigatorState,
  type INavigatorStore,
  type INavigatorViewer,
  Navigator,
} from './navigator';

export {
  Runner,
  Step,
} from './utilities/runner';

// export {
//   QueueItem,
//   IQueueOptions,
//   Queue,
// } from './utilities/queue';

export {
  type IRoute,
  Route,
} from './route';

export {
  route,
} from './decorators/route';

export {
  RouteRecognizer,
  type IConfigurableRoute,
  ConfigurableRoute,
  RecognizedRoute,
  Endpoint as RecognizerEndpoint,
} from './route-recognizer';

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
} from './router';

export {
  type IRouterOptions,
  type ITitleOptions,
  RouterOptions,
} from './router-options';

export {
  Routes,
  routes,
} from './decorators/routes';

export {
  RoutingHook,
  type RoutingHookType,
  type IRoutingHookDefinition,
  type RoutingHookFunction,
  type RoutingHookIdentity,
  type RoutingHookParameter,
  type RoutingHookResult,
  type IRoutingHookOptions,
  type RoutingHookTarget,
  type BeforeNavigationHookFunction,
  type TransformFromUrlHookFunction,
  type TransformToUrlHookFunction,
  type TransformTitleHookFunction,
} from './routing-hook';

export {
  RoutingInstruction,
} from './instructions/routing-instruction';

export {
  type TransitionAction,
  RoutingScope,
} from './routing-scope';

export {
  Viewport,
} from './endpoints/viewport';

export {
  type IViewportOptions,
  ViewportOptions,
} from './endpoints/viewport-options';

export {
  type IViewportScopeOptions,
  ViewportScope,
} from './endpoints/viewport-scope';

export {
  ViewportContent,
} from './endpoints/viewport-content';

export {
  ViewportScopeContent,
} from './endpoints/viewport-scope-content';

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
} from './configuration';

export { ViewportCustomElement } from './resources/viewport';
export { ViewportScopeCustomElement } from './resources/viewport-scope';
export { LoadCustomAttribute } from './resources/load';
export { HrefCustomAttribute } from './resources/href';
export { ConsideredActiveCustomAttribute } from './resources/considered-active';

