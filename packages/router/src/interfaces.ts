import { Constructable } from '@aurelia/kernel';
import { CustomElementType, INode, ICustomElementViewModel, ICustomElementController } from '@aurelia/runtime';
import { INavigatorEntry, INavigatorFlags, IStoredNavigatorEntry } from './navigator';
import { Viewport } from './viewport';
import { ViewportInstruction } from './viewport-instruction';

/*
* Contains interfaces and types that aren't strongly connected
* to component(s) or that are considered an essential part
* of the API.
*/

export interface IStateManager<T extends INode> {
  saveState(controller: ICustomElementController<T>): void;
  restoreState(controller: ICustomElementController<T>): void;
}

export type RouteableComponentType<C extends Constructable = Constructable> = CustomElementType<C> & {
  parameters?: string[];
};

export interface IRouteableComponent<T extends INode> extends ICustomElementViewModel<T> {
  reentryBehavior?: ReentryBehavior;
  canEnter?(
    parameters: Record<string, unknown>,
    nextInstruction: INavigatorInstruction<T>,
    instruction: INavigatorInstruction<T>,
  ): boolean | string | ViewportInstruction<T>[] | Promise<boolean | string | ViewportInstruction<T>[]>;
  enter?(
    parameters: Record<string, unknown>,
    nextInstruction: INavigatorInstruction<T>,
    instruction: INavigatorInstruction<T>,
  ): void | Promise<void>;
  canLeave?(
    nextInstruction: INavigatorInstruction<T> | null,
    instruction: INavigatorInstruction<T>,
  ): boolean | Promise<boolean>;
  leave?(
    nextInstruction: INavigatorInstruction<T> | null,
    instruction: INavigatorInstruction<T>,
  ): void | Promise<void>;
}

export const enum ReentryBehavior {
  default = 'default',
  disallow = 'disallow',
  enter = 'enter',
  refresh = 'refresh',
}

export interface INavigatorInstruction<T extends INode> extends INavigatorEntry<T> {
  navigation?: INavigatorFlags;
  previous?: IStoredNavigatorEntry<T>;
  repeating?: boolean;
}

export interface IViewportInstruction<T extends INode> {
  component: ComponentAppellation<T>;
  viewport?: ViewportHandle<T>;
  parameters?: ComponentParameters;
  children?: NavigationInstruction<T>[];
}

export interface IRoute<T extends INode> {
  path: string;
  id?: string;
  instructions: NavigationInstruction<T>[] | ViewportInstruction<T>[];
}

export interface IComponentAndOrViewportOrNothing<T extends INode> {
  component?: ComponentAppellation<T>;
  viewport?: ViewportHandle<T>;
}

export type NavigationInstruction<T extends INode> = ComponentAppellation<T> | IViewportInstruction<T> | ViewportInstruction<T>;

export type ComponentAppellation<T extends INode> = string | RouteableComponentType | IRouteableComponent<T> | Constructable;
export type ViewportHandle<T extends INode> = string | Viewport<T>;
export type ComponentParameters = string | Record<string, unknown> | unknown[];
