import { Constructable } from '@aurelia/kernel';
import { CustomElement, ICustomElementType, INode, IViewModel } from '@aurelia/runtime';
import { ComponentHandle } from './interfaces';
import { INavigatorEntry, INavigatorFlags, IStoredNavigatorEntry } from './navigator';
import { IRouter } from './router';
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
  component: ComponentHandle<C>;
  viewport?: ViewportHandle;
  parameters?: ComponentParameters;
}

export interface IComponentAndOrViewportOrNothing<C extends Constructable = Constructable> {
  component?: ComponentHandle<C>;
  viewport?: ViewportHandle;
}

export type NavigationInstruction<C extends Constructable = Constructable> = ComponentHandle<C> | IViewportInstruction<C> | ViewportInstruction;

export type GuardFunction = (viewportInstructions?: ViewportInstruction[], navigationInstruction?: INavigatorInstruction) => boolean | ViewportInstruction[];
export type GuardTarget<C extends Constructable = Constructable> = ComponentHandle<C> | IComponentAndOrViewportOrNothing;

export type ComponentHandle<C extends Constructable = Constructable> = string | IRouteableComponentType<C> | Constructable; // TODO: , T extends INode = INode    | IRouteableComponent<T>;
export type ViewportHandle = string | Viewport;
export type ComponentParameters = string | Record<string, unknown>; // TODO: | unknown[];

export const ComponentHandleResolver = {
  isName: function <T>(component: T & ComponentHandle<Constructable>): component is T & ComponentHandle<Constructable> {
    return typeof component === 'string';
  },
  isType: function <T>(component: T & ComponentHandle<Constructable>): component is T & ComponentHandle<Constructable> {
    return CustomElement.isType(component);
  },
  getName: function <T>(component: T & ComponentHandle<Constructable>): string {
    if (ComponentHandleResolver.isName(component)) {
      return component as string;
    } else if (ComponentHandleResolver.isType(component)) {
      return (component as ICustomElementType).description.name;
    } else {
      return ((component as IRouteableComponent).constructor as ICustomElementType).description.name;
    }
  },
  getType: function <T extends Constructable>(component: T & ComponentHandle<Constructable>): ICustomElementType<T> {
    if (ComponentHandleResolver.isName(component)) {
      return null;
    } else if (ComponentHandleResolver.isType(component)) {
      return component;
    }
    // TODO: Fix resolve for instance
    // else {
    //   return (component as ICustomElementType).constructor;
    // }
  },
};

export const ViewportHandleResolver = {
  isName: function <T>(viewport: T & ViewportHandle): viewport is T & ViewportHandle {
    return typeof viewport === 'string';
  },
  isInstance: function <T>(viewport: T & ViewportHandle): viewport is T & ViewportHandle {
    return viewport instanceof Viewport;
  },
  getName: function <T>(viewport: T & ViewportHandle): string {
    if (ViewportHandleResolver.isName(viewport)) {
      return viewport as string;
    } else {
      return viewport ? (viewport as Viewport).name : null;
    }
  }
};

export const NavigationInstructionResolver = {
  toViewportInstructions: function <C extends Constructable>(router: IRouter, navigationInstructions: NavigationInstruction | NavigationInstruction[]): ViewportInstruction[] {
    if (!Array.isArray(navigationInstructions)) {
      return NavigationInstructionResolver.toViewportInstructions(router, [navigationInstructions]);
    }
    const instructions: ViewportInstruction[] = [];
    for (const instruction of navigationInstructions) {
      if (typeof instruction === 'string') {
        instructions.push(router.instructionResolver.parseViewportInstruction(instruction));
      } else if (instruction as ViewportInstruction instanceof ViewportInstruction) {
        instructions.push(instruction as ViewportInstruction);
      } else if (instruction['component']) {
        const viewportComponent = instruction as IViewportInstruction<C>;
        instructions.push(new ViewportInstruction(viewportComponent.component, viewportComponent.viewport, viewportComponent.parameters));
      } else {
        instructions.push(new ViewportInstruction(instruction as IRouteableComponentType<C>));
      }
    }
    return instructions;
  },
};
