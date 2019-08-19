import { ICustomElementType, INode, IViewModel } from '@aurelia/runtime';
import { INavigatorEntry, INavigatorFlags, IStoredNavigatorEntry } from './navigator';
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

