import { Constructable, DI } from '@aurelia/kernel';
import { CustomElementType, INode, ICustomElementViewModel } from '@aurelia/runtime';
import { HTMLDOM } from '@aurelia/runtime-html';
import { Viewport } from './viewport';
import { ViewportInstruction } from './viewport-instruction';
import { Navigation } from './navigation';

// These interfaces exclusively exist to prevent TS decorator metadata emission from having the runtime
// side-effect of causing a ReferenceError in node, because these are not defined as globals there.
// We will have a cleaner solution for this once AOT is done, as we can do arbitrary transforms then.
export interface IPopStateEvent extends PopStateEvent {}
export interface IHashChangeEvent extends HashChangeEvent {}
export interface IMouseEvent extends MouseEvent {}
export interface IElement extends Element {}
export interface IHTMLElement extends HTMLElement {}

/*
* Contains interfaces and types that aren't strongly connected
* to component(s) or that are considered an essential part
* of the API.
*/

export type RouteableComponentType<C extends Constructable = Constructable> = CustomElementType<C> & {
  parameters?: string[];
  title?: string | TitleFunction;
};
export type TitleFunction = (viewModel: IRouteableComponent, instruction: NavigationInstruction) => string;

export interface IRouteableComponent<T extends INode = INode> extends ICustomElementViewModel<T> {
  reentryBehavior?: ReentryBehavior;
  canLoad?(parameters: Record<string, unknown>, nextInstruction: Navigation, instruction: Navigation): boolean | NavigationInstruction | NavigationInstruction[] | Promise<boolean | NavigationInstruction | NavigationInstruction[]>;
  load?(parameters: Record<string, unknown>, nextInstruction: Navigation, instruction: Navigation): void | Promise<void>;
  canUnload?(nextInstruction: Navigation | null, instruction: Navigation): boolean | Promise<boolean>;
  unload?(nextInstruction: Navigation | null, instruction: Navigation): void | Promise<void>;
}

export const enum ReentryBehavior {
  default = 'default',
  disallow = 'disallow',
  load = 'load',
  refresh = 'refresh',
}

export interface IViewportInstruction {
  component: ComponentAppellation;
  viewport?: ViewportHandle;
  parameters?: ComponentParameters;
  children?: NavigationInstruction[];
}

export interface IRoute extends Partial<IViewportInstruction> {
  path: string;
  id?: string;
  instructions?: NavigationInstruction[] | ViewportInstruction[];
  title?: string | any;
}

export interface IComponentAndOrViewportOrNothing {
  component?: ComponentAppellation;
  viewport?: ViewportHandle;
}

export type NavigationInstruction = ComponentAppellation | IViewportInstruction | ViewportInstruction;

export type ComponentAppellation = string | RouteableComponentType | IRouteableComponent | Constructable;
export type ViewportHandle = string | Viewport;
export type ComponentParameters = string | Record<string, unknown> | unknown[];
