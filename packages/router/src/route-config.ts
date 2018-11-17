import { Constructable } from '@aurelia/kernel';
import { ICustomElementType } from '@aurelia/runtime';

interface IRouteConfig {
  // A string or array of strings of matching route paths.
  // (Renamed from route in vCurrent)
  path: string | string[];

  redirect?: string;

  // A constructor function for the view-model to attach for this route.
  // For route decorator and static routes approaches, Aurelia will set this
  // value under the hood.
  // (Repurposed from moduleId in vCurrent)
  component?: ICustomElementType;

  // A uniquely identifiable name for the route, for canonical navigation.
  // For route decorator and static routes approaches, Aurelia will try to
  // set this value by convention if not specified explicitly.
  name?: string;

  // Optional, the name of the viewport to attach the controller to. If not
  // specified, the default viewport will be used.
  viewport?: string;

  // Optional, the name of the parent route or routes, matched by the `name` property.
  parent?: string | string[];

  // Optional, flag to opt the route out of the navigation model. Defaults
  // to true.
  nav?: boolean;

  // Optional, an object with additional information available to the
  // view-model throughout the activation lifecycle.
  // (Renamed from settings in vCurrent)
  meta?: any;
}

type RouteDecorator = <T extends Constructable>(target: T & { routes?: IRouteConfig[] }) => T & { routes: IRouteConfig[] };

export function route(path: string): RouteDecorator;
export function route(paths: string[]): RouteDecorator;
export function route(config: IRouteConfig): RouteDecorator;
export function route(pathOrPathsOrConfig: string | string[] | IRouteConfig): RouteDecorator;
export function route(pathOrPathsOrConfig: string | string[] | IRouteConfig): RouteDecorator {
  return target => {
    if (target.routes === undefined) {
      target.routes = [];
    }
    if (typeof pathOrPathsOrConfig === 'string') {
      target.routes.push({
        path: pathOrPathsOrConfig,
        component: <ICustomElementType><unknown>target
      });
    } else if (Array.isArray(pathOrPathsOrConfig)) {
      pathOrPathsOrConfig.forEach(path => {
        target.routes.push({
          path: path,
          component: <ICustomElementType><unknown>target
        });
      });
    } else if (typeof pathOrPathsOrConfig === 'object' && pathOrPathsOrConfig !== null) {
      target.routes.push({ ...pathOrPathsOrConfig, component: <ICustomElementType><unknown>target });
    }

    return <typeof target & { routes: IRouteConfig[] }>target;
  };
}
