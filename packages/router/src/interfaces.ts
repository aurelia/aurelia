/*
* Contains interfaces and types that aren't strongly connected
* to component(s) or that are considered an essential part
* of the API.
*/

import { Constructable } from '@aurelia/kernel';
import { ICustomElementType, INode, IViewModel } from '@aurelia/runtime';
import { INavigatorEntry, INavigatorFlags, IStoredNavigatorEntry } from './navigator';
import { Viewport } from './viewport';
import { ViewportInstruction } from './viewport-instruction';

export interface IRouteableComponentType<C extends Constructable = Constructable> extends Partial<ICustomElementType<C>> {
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

export interface IViewportInstruction {
  component: ComponentAppellation;
  viewport?: ViewportAppellation;
  parameters?: string | Record<string, unknown>; // TODO: | unknown[];
}

export interface IGuardTarget {
  component?: IRouteableComponentType;
  componentName?: string;
  viewport?: Viewport;
  viewportName?: string;
}

export type NavigationInstruction = ComponentAppellation | IViewportInstruction | ViewportInstruction;

export type GuardFunction = (viewportInstructions?: ViewportInstruction[], navigationInstruction?: INavigatorInstruction) => boolean | ViewportInstruction[];
export type GuardTarget = ComponentAppellation | IComponentAndOrViewportOrNothing;

export type ComponentAppellation<C extends Constructable = Constructable, T extends INode = INode> = string | IRouteableComponentType<C>; // TODO: | IRouteableComponent<T>;
export type ViewportAppellation = string | Viewport;

export interface IComponentAndOrViewportOrNothing<C extends Constructable = Constructable> {
  component?: ComponentAppellation<C>;
  viewport?: ViewportAppellation;
}
