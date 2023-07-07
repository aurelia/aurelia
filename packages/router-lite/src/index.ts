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
  type IRouterConfigurationOptions,
} from './configuration';

export {
  type IRouteViewModel,
} from './component-agent';

export {
  type RouteableComponent,
  type NavigationInstruction,
  type IViewportInstruction,
  type Params,
  type ViewportInstruction,
  type ITypedNavigationInstruction,
  type ITypedNavigationInstruction_string,
  type ITypedNavigationInstruction_ViewportInstruction,
  type ITypedNavigationInstruction_CustomElementDefinition,
  type ITypedNavigationInstruction_Promise,
  type ITypedNavigationInstruction_IRouteViewModel,
} from './instructions';

export {
  ILocationManager,
} from './location-manager';

export {
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
  Transition,
} from './router';

export {
  IRouterOptions,
  type INavigationOptions,
  RouterOptions,
  NavigationOptions,
  type HistoryStrategy,
  type FallbackFunction,
  type Routeable,
  type IRouteConfig,
  type IChildRouteConfig,
} from './options';

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
