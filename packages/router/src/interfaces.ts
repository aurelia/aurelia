import { ComponentAppellation } from './interfaces';
/*
* Contains interfaces and types that aren't strongly connected
* to component(s) or that are considered an essential part
* of the API.
*/

import { Constructable } from '@aurelia/kernel';
import { CustomElement, ICustomElementType, INode, IViewModel } from '@aurelia/runtime';
import { INavigatorEntry, INavigatorFlags, IStoredNavigatorEntry } from './navigator';
import { IRouter } from './router';
import { Viewport } from './viewport';
import { ViewportInstruction } from './viewport-instruction';

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

export interface IViewportInstruction {
  component: ComponentAppellation;
  viewport?: ViewportAppellation;
  parameters?: ComponentParameters;
}

export interface IComponentAndOrViewportOrNothing<C extends Constructable = Constructable> {
  component?: ComponentAppellation<C>;
  viewport?: ViewportAppellation;
}

export type NavigationInstruction = ComponentAppellation | IViewportInstruction | ViewportInstruction;

export type GuardFunction = (viewportInstructions?: ViewportInstruction[], navigationInstruction?: INavigatorInstruction) => boolean | ViewportInstruction[];
export type GuardTarget = ComponentAppellation | IComponentAndOrViewportOrNothing;

export type ComponentAppellation<C extends Constructable = Constructable, T extends INode = INode> = string | IRouteableComponentType<C>; // TODO: | IRouteableComponent<T>;
export type ViewportAppellation = string | Viewport;
export type ComponentParameters = string | Record<string, unknown>; // TODO: | unknown[];

export const ComponentAppellationResolver = {
  isName: function <T>(component: T & ComponentAppellation<Constructable>): component is T & ComponentAppellation<Constructable> {
    return typeof component === 'string';
  },
  isType: function <T>(component: T & ComponentAppellation<Constructable>): component is T & ComponentAppellation<Constructable> {
    return CustomElement.isType(component);
  },
  getName: function <T>(component: T & ComponentAppellation<Constructable>): string {
    if (ComponentAppellationResolver.isName(component)) {
      return component as string;
    } else if (ComponentAppellationResolver.isType(component)) {
      return (component as ICustomElementType).description.name;
    } else {
      return ((component as IRouteableComponent).constructor as ICustomElementType).description.name;
    }
  },
  getType: function <T extends Constructable>(component: T & ComponentAppellation<Constructable>): ICustomElementType<T> {
    if (ComponentAppellationResolver.isName(component)) {
      return null;
    } else if (ComponentAppellationResolver.isType(component)) {
      return component;
    }
    // TODO: Fix resolve for instance
    // else {
    //   return (component as ICustomElementType).constructor;
    // }
  },
};

export const ViewportAppellationResolver = {
  isName: function <T>(viewport: T & ViewportAppellation): viewport is T & ViewportAppellation {
    return typeof viewport === 'string';
  },
  isInstance: function <T>(viewport: T & ViewportAppellation): viewport is T & ViewportAppellation {
    return viewport instanceof Viewport;
  },
  getName: function <T>(viewport: T & ViewportAppellation): string {
    if (ViewportAppellationResolver.isName(viewport)) {
      return viewport as string;
    } else {
      return (viewport as Viewport).name;
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
        const viewportComponent = instruction as IViewportInstruction;
        instructions.push(new ViewportInstruction(viewportComponent.component, viewportComponent.viewport, viewportComponent.parameters));
      } else {
        instructions.push(new ViewportInstruction(instruction as IRouteableComponentType<C>));
      }
    }
    return instructions;
  },
};
