import { Constructable } from '@aurelia/kernel';
import { ICustomElementType, INode, IViewModel } from '@aurelia/runtime';
import { ComponentAppellation } from './interfaces';
import { INavigatorEntry, INavigatorFlags, IStoredNavigatorEntry } from './navigator';
import { Viewport } from './viewport';
import { ViewportInstruction } from './viewport-instruction';

/*
* Contains interfaces and types that aren't strongly connected
* to component(s) or that are considered an essential part
* of the API.
*/

export interface IRouteableComponentType<C extends Constructable> extends ICustomElementType<C> {
  parameters?: string[];
}

export interface IRouteableComponent<T extends INode = INode> extends IViewModel<T> {
  reentryBehavior?: ReentryBehavior;
  canEnter?(parameters?: string[] | Record<string, string>, nextInstruction?: INavigatorInstruction, instruction?: INavigatorInstruction): boolean | string | ViewportInstruction[] | Promise<boolean | string | ViewportInstruction[]>;
  enter?(parameters?: string[] | Record<string, string>, nextInstruction?: INavigatorInstruction, instruction?: INavigatorInstruction): void | Promise<void>;
  canLeave?(nextInstruction?: INavigatorInstruction, instruction?: INavigatorInstruction): boolean | Promise<boolean>;
  leave?(nextInstruction?: INavigatorInstruction, instruction?: INavigatorInstruction): void | Promise<void>;
}

export const enum ReentryBehavior {
  default = 'default',
  disallow = 'disallow',
  enter = 'enter',
  refresh = 'refresh',
}

export interface INavigatorInstruction extends INavigatorEntry {
  navigation?: INavigatorFlags;
  previous?: IStoredNavigatorEntry;
  repeating?: boolean;
}

export interface IViewportInstruction<C extends Constructable> {
  component: ComponentAppellation<C>;
  viewport?: ViewportHandle;
  parameters?: ComponentParameters;
}

export interface IComponentAndOrViewportOrNothing<C extends Constructable = Constructable> {
  component?: ComponentAppellation<C>;
  viewport?: ViewportHandle;
}

export type NavigationInstruction<C extends Constructable = Constructable> = ComponentAppellation<C> | IViewportInstruction<C> | ViewportInstruction;

export type GuardFunction = (viewportInstructions?: ViewportInstruction[], navigationInstruction?: INavigatorInstruction) => boolean | ViewportInstruction[];
export type GuardTarget<C extends Constructable = Constructable> = ComponentAppellation<C> | IComponentAndOrViewportOrNothing;

export type ComponentAppellation<C extends Constructable = Constructable> = string | IRouteableComponentType<C> | Constructable; // TODO: , T extends INode = INode    | IRouteableComponent<T>;
export type ViewportHandle = string | Viewport;
export type ComponentParameters = string | Record<string, unknown>; // TODO: | unknown[];
