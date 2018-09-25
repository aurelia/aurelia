import { Constructable, IContainer, IIndexable, Registration, Reporter, Writable } from '@aurelia/kernel';
import {  ICustomElement, IResourceKind, IResourceType, ITemplateSource, IView, IViewFactory, PotentialRenderable, ResourceDescription } from '@aurelia/runtime';
import { IPipelineBehavior } from './pipeline-behavior';
import { IRouter } from './router';
import { RouterView } from './router-view';

export type RouteTarget = ITemplateSource | IViewFactory | IView | PotentialRenderable | Constructable;

export interface IRoute {
  /**
   * A string or array of strings of matching route paths.
   * (Renamed from route in vCurrent)
   */
  path: string | string[];

  /**
   * Something that can produce a view/view-model to attach for this route.
   * For route decorator and static routes approaches, Aurelia will set this
   * value under the hood.
   * (Repurposed from moduleId in vCurrent)
   */
  target: RouteTarget;

  /**
   * A uniquely identifiable name for the route, for canonical navigation.
   * For route decorator and static routes approaches, Aurelia will try to
   * set this value by convention if not specified explicitly.
   */
  name?: string;

  /**
   * Optional, the name of the viewport to attach the controller to. If not
   * specified, the default viewport will be used.
   */
  viewport?: string;

  /**
   * Optional, the name of the parent route, matched by the `name` property.
   */
  parent?: string;

  /**
   * Optional, flag to opt the route out of the navigation model. Defaults
   * to true.
   */
  nav?: boolean;

  /**
   * Optional, an object with additional information available to the
   * view-model throughout the activation lifecycle.
   * (Renamed from settings in vCurrent)
   */
  meta?: IIndexable;
}

export const enum RouteFlags {
  none           = 0b000,
  fromActivate   = 0b001,
  fromDeactivate = 0b010
}

export interface IRouteContext {
  target: RouteTarget;
  routerView: RouterView;
  route: IRoute;
  router: IRouter;
}

export interface IActivatable  {
  readonly $behavior: IPipelineBehavior;
  readonly $isActivated: boolean;
  readonly $isConfigured: boolean;
  readonly $router: IRouter;
  readonly $viewport: RouterView;
  $configureRoute(context: IRouteContext, flags: RouteFlags): void;
  $activate(context: IRouteContext, flags: RouteFlags): void;
  $deactivate(context: IRouteContext, flags: RouteFlags): void;
}

export type IActivatableType = IResourceType<IRoute, IActivatable>;

export function route(pathOrRoute: string | IRoute) {
  return function<T extends Constructable>(target: T) {
    return RouteResource.define(pathOrRoute, target);
  };
}

export const RouteResource: IResourceKind<IRoute, IActivatableType> = {
  name: 'route',

  keyFrom(name: string): string {
    return `${this.name}:${name}`;
  },

  isType<T extends Constructable>(type: T): type is T & IActivatableType {
    return (type as any).kind === this;
  },

  define<T extends Constructable>(pathOrRoute: string | IRoute, ctor: T): T & IActivatableType {
    const Type = ctor as IActivatableType & T;
    const proto: IActivatable = Type.prototype;
    const description = createRouteDescription(
      typeof pathOrRoute === 'string' ? { path: pathOrRoute, target: Type } : pathOrRoute,
      Type
    );

    (Type as Writable<IActivatableType>).kind = RouteResource;
    (Type as Writable<IActivatableType>).description = description;
    Type.register = register;

    proto.$configureRoute = configureRoute;
    proto.$activate = activate;
    proto.$deactivate = deactivate;

    return Type;
  }
}

function register(this: IActivatableType, container: IContainer): void {
  const description = this.description;
  const resourceKey = RouteResource.keyFrom(description.name);

  container.register(Registration.transient(resourceKey, this));
  const router = container.get<IRouter>(IRouter);
  router.addRoute(description);
}

function configureRoute(this: Writable<IActivatable>, context: IRouteContext, flags: RouteFlags): void {
  const Type = this.constructor as IActivatableType;
  context.router.applyPipelineBehavior(Type, this);

  const behavior = this.$behavior;

  if (behavior.hasConfiguringRoute) {
    (this as any).configuringRoute(context, flags);
  }

  this.$isActivated = false;
  this.$router = context.router;
  this.$viewport = context.routerView;
  this.$isConfigured = true;

  if (behavior.hasConfiguredRoute) {
    (this as any).configuredRoute(context, flags);
  }
}

function activate(this: Writable<IActivatable>, context: IRouteContext, flags: RouteFlags): void {
  const behavior = this.$behavior;

  if (behavior.hasActivating) {
    (this as any).activating(context, flags);
  }

  if (behavior.hasCanActivate) {
    if (!(this as any).canActivate(context, flags)) {
      return;
    }
  }

  context.routerView.target = context.route.target;

  this.$isActivated = true;
  if (behavior.hasActivated) {
    (this as any).activated(context, flags);
  }
}

function deactivate(this: Writable<IActivatable>, context: IRouteContext, flags: RouteFlags): void {
  const behavior = this.$behavior;

  if (behavior.hasDeactivating) {
    (this as any).deactivating(context, flags);
  }

  if (behavior.hasCanDeactivate) {
    if (!(this as any).canDeactivate(context, flags)) {
      return;
    }
  }

  this.$isActivated = false;
  if (behavior.hasDeactivated) {
    (this as any).deactivated(context, flags);
  }
}

/*@internal*/
export function createRouteDescription(route: IRoute, Type: IActivatableType): ResourceDescription<IRoute> {
  validateRoute(route);

  return {
    path: Array.isArray(route.path) ? route.path : [route.path],
    target: route.target || Type,
    name: route.name || Type.name,
    viewport: route.viewport || 'default',
    parent: route.parent || null,
    nav: route.nav !== false,
    meta: route.meta || {}
  };
}

/*@internal*/
export function validateRoute(route: IRoute): void {
  if (!validatePath(route)) {
    throw Reporter.error(460);
  }
  if (!validateTarget(route)) {
    throw Reporter.error(461);
  }
  if (!validateName(route)) {
    throw Reporter.error(462);
  }
  if (!validateViewport(route)) {
    throw Reporter.error(463);
  }
  if (!validateParent(route)) {
    throw Reporter.error(464);
  }
  if (!validateNav(route)) {
    throw Reporter.error(465);
  }
  if (!validateMeta(route)) {
    throw Reporter.error(466);
  }
}

/*@internal*/
export function validatePath(route: IRoute): boolean {
  if (!hasValue(route, 'path')) {
    return false;
  }
  if (Array.isArray(route)) {
    for (let i = 0, ii = route.length; i < ii; ++i) {
      if (typeof route[i] !== 'string') {
        return false;
      }
    }
    return true;
  } else if (typeof route.path === 'string') {
    return true;
  }
}

/*@internal*/
export function validateTarget(route: IRoute): boolean {
  if (!hasValue(route, 'target')) {
    return false;
  }
  const target = route.target;
  return isTemplateDefinition(target)
    || isViewFactory(target)
    || isPotentialRenderable(target)
    || isView(target);
}

/*@internal*/
export function validateName(route: IRoute): boolean {
  if (hasValue(route, 'name')) {
    return isAttributeLike(route.name);
  }
  return true;
}

/*@internal*/
export function validateViewport(route: IRoute): boolean {
  if (hasValue(route, 'viewport')) {
    return isAttributeLike(route.viewport);
  }
  return true;
}

/*@internal*/
export function validateParent(route: IRoute): boolean {
  if (hasValue(route, 'parent')) {
    return isAttributeLike(route.parent);
  }
  return true;
}

/*@internal*/
export function validateNav(route: IRoute): boolean {
  if (hasValue(route, 'nav')) {
    return typeof route.nav === 'boolean';
  }
  return true;
}

/*@internal*/
export function validateMeta(route: IRoute): boolean {
  if (hasValue(route, 'meta')) {
    return typeof route.meta === 'object';
  }
  return true;
}

/*@internal*/
export function isTemplateDefinition(target: RouteTarget): target is ITemplateSource {
  return 'templateOrNode' in target;
}
/*@internal*/
export function isViewFactory(target: RouteTarget): target is IViewFactory {
  return 'create' in target;
}
/*@internal*/
export function isPotentialRenderable(target: RouteTarget): target is PotentialRenderable {
  return 'createView' in target;
}
/*@internal*/
export function isView(target: RouteTarget): target is IView {
  return 'lockScope' in target;
}
/*@internal*/
export function hasValue(route: IRoute, prop: string): boolean {
  if (route.hasOwnProperty(prop)) {
    return route[prop] !== null && route[prop] !== undefined;
  }
  return false;
}
/*@internal*/
export function isAttributeLike(value: string): boolean {
  if (typeof value !== 'string' || value.length === 0) {
    return false;
  }
  for (let i = 0, ii = value.length; i < ii; ++i) {
    const char = value.charCodeAt(i);
    if (char !== 45 /*-*/ && (char < 97 /*a*/ || char > 122 /*z*/)) {
      return false;
    }
  }
  return true;
}
