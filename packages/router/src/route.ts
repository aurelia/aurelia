import { Constructable, IIndexable } from '@aurelia/kernel';
import { ITemplateSource, IView, IViewFactory, PotentialRenderable } from '@aurelia/runtime';

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
