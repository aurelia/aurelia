/**
 *
 * NOTE: This file is still WIP and will go through at least one more iteration of refactoring, commenting and clean up!
 * In its current state, it is NOT a good source for learning about the inner workings and design of the router.
 *
 */
import { Constructable } from '@aurelia/kernel';
import { CustomElementType, ICustomElementController, ICustomElementViewModel } from '@aurelia/runtime-html';
import { Viewport } from './endpoints/viewport';
import { RoutingInstruction } from './instructions/routing-instruction';
import { Navigation } from './navigation';
import { IRoute } from './route';
import { ILoadOptions } from './router';
import { Parameters } from './instructions/instruction-parameters';

// These interfaces exclusively exist to prevent TS decorator metadata emission from having the runtime
// side-effect of causing a ReferenceError in node, because these are not defined as globals there.
// We will have a cleaner solution for this once AOT is done, as we can do arbitrary transforms then.
export interface IPopStateEvent extends PopStateEvent { }
export interface IHashChangeEvent extends HashChangeEvent { }
export interface IMouseEvent extends MouseEvent { }
export interface IElement extends Element { }
export interface IHTMLElement extends HTMLElement { }

/*
* Contains interfaces and types that aren't strongly connected
* to component(s) or that are considered an essential part
* of the API.
*/

export type RouteableComponentType<C extends Constructable = Constructable> = CustomElementType<C> & {
  parameters?: string[];
  title?: string | TitleFunction;
  routes?: IRoute[];
};
export type TitleFunction = (viewModel: IRouteableComponent, instruction: Navigation) => string;

export interface IRouteableComponent extends ICustomElementViewModel {
  reloadBehavior?: ReloadBehavior;
  canLoad?(parameters: Parameters, instruction: RoutingInstruction, navigation: Navigation): boolean | LoadInstruction | LoadInstruction[] | Promise<boolean | LoadInstruction | LoadInstruction[]>;
  load?(parameters: Parameters, instruction: RoutingInstruction, navigation: Navigation): void | Promise<void>;
  canUnload?(instruction: RoutingInstruction, navigation: Navigation | null): boolean | Promise<boolean>;
  unload?(instruction: RoutingInstruction, navigation: Navigation | null): void | Promise<void>;
  readonly $controller?: ICustomElementController<this>;
}

export const enum ReloadBehavior {
  default = 'default',
  disallow = 'disallow',
  reload = 'reload',
  refresh = 'refresh',
}

export interface IRoutingInstruction {
  component: ComponentAppellation;
  viewport?: ViewportHandle;
  parameters?: ComponentParameters;
  children?: LoadInstruction[];
  options?: ILoadOptions;
}

// export interface IRoute extends Partial<IRoutingInstruction> {
//   path: string;
//   id?: string;
//   instructions?: LoadInstruction[] | RoutingInstruction[];
//   title?: string | any;
// }

export interface IComponentAndOrViewportOrNothing {
  component?: ComponentAppellation;
  viewport?: ViewportHandle;
}

export type LoadInstruction = ComponentAppellation | IRoutingInstruction | RoutingInstruction;

export type ComponentAppellation = string | RouteableComponentType | IRouteableComponent | Constructable;
export type ViewportHandle = string | Viewport;
export type ComponentParameters = string | Record<string, unknown> | unknown[];
