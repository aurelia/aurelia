/*
* Contains interfaces and types that aren't strongly connected
* to component(s) or that are considered an essential part
* of the API.
*/

import { ICustomElementType, INode, IViewModel } from '@aurelia/runtime';
import { INavigatorEntry, INavigatorFlags, IStoredNavigatorEntry } from './navigator';
import { Viewport } from './viewport';
import { ViewportInstruction } from './viewport-instruction';

export interface IComponent {

}

export interface IViewport {

}

export interface IRouteableComponentType extends Partial<ICustomElementType> {
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

export interface IViewportComponent {
  component: string | IRouteableComponentType;
  viewport?: string | Viewport;
  parameters?: Record<string, unknown> | string; // TODO: Allow unknown[] for parameters
}

export interface IGuardTarget {
  component?: IRouteableComponentType;
  componentName?: string;
  viewport?: Viewport;
  viewportName?: string;
}


export type NavigationInstruction = string | IRouteableComponentType | IViewportComponent | ViewportInstruction;

export type GuardFunction = (viewportInstructions?: ViewportInstruction[], navigationInstruction?: INavigatorInstruction) => boolean | ViewportInstruction[];
export type GuardTarget = IGuardTarget | IRouteableComponentType | string;
