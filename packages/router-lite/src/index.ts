export {
  type IViewport,
} from './resources/viewport';

export {
  RouterConfiguration,
  RouterRegistration,
  DefaultComponents,
  DefaultResources,
  ViewportCustomElement,
  ViewportCustomElementRegistration,
  LoadCustomAttribute,
  LoadCustomAttributeRegistration,
  HrefCustomAttribute,
  HrefCustomAttributeRegistration,
} from './configuration';

export {
  type IRouteViewModel,
  ComponentAgent,
} from './component-agent';

export {
  type RouteableComponent,
  type NavigationInstruction,
  IViewportInstruction,
  type Params,
} from './instructions';

export {
  ILocationManager,
} from './location-manager';

export {
  type Routeable,
  type IRouteConfig,
  type IChildRouteConfig,
  RouteConfig,
  Route,
  type RouteType,
  route,
} from './route';

export {
  IRouteContext,
  RouteContext,
  type INavigationModel,
  type INavigationRoute,
} from './route-context';

export {
  RouteDefinition,
} from './route-definition';

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
} from './route-expression';

export {
  RouteNode,
  RouteTree,
} from './route-tree';

export {
  isManagedState,
  toManagedState,
  IRouter,
  Router,
  type IRouterOptions,
  type INavigationOptions,
  RouterOptions,
  NavigationOptions,
  Transition,
  Navigation,
  type ResolutionMode,
  type HistoryStrategy,
  type SameUrlStrategy,
} from './router';

export {
  AuNavId,
  type ManagedState,
  IRouterEvents,
  type RouterEvent,
  LocationChangeEvent,
  NavigationStartEvent,
  NavigationEndEvent,
  NavigationCancelEvent,
  NavigationErrorEvent,
} from './router-events';

export {
  IStateManager,
} from './state-manager';

export {
  ViewportAgent,
} from './viewport-agent';
