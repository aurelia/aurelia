import { Constructable } from '@aurelia/kernel';
import { CustomElement, ICustomElementType } from '@aurelia/runtime';
import { ComponentHandle, IRouteableComponent, IRouteableComponentType, IViewportInstruction, NavigationInstruction, ViewportHandle } from './interfaces';
import { IRouter } from './router';
import { Viewport } from './viewport';
import { ViewportInstruction } from './viewport-instruction';

export const ComponentHandleResolver = {
  isName: function <T>(component: T & ComponentHandle<Constructable>): component is T & ComponentHandle<Constructable> {
    return typeof component === 'string';
  },
  isType: function <T>(component: T & ComponentHandle<Constructable>): component is T & ComponentHandle<Constructable> & IRouteableComponentType<Constructable> {
    return CustomElement.isType(component);
  },
  isInstance: function <T>(component: T & ComponentHandle<Constructable>): component is T & ComponentHandle<Constructable> & IRouteableComponent<Constructable> {
    return !ComponentHandleResolver.isName(component) && !ComponentHandleResolver.isType(component);
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
  getType: function <T extends Constructable>(component: T & ComponentHandle<Constructable>): IRouteableComponentType<T> {
    if (ComponentHandleResolver.isName(component)) {
      return null;
    } else if (ComponentHandleResolver.isType(component)) {
      return component;
    } else {
      return ((component as IRouteableComponent).constructor as IRouteableComponentType<T>);
    }
  },
  getInstance: function <T extends Constructable>(component: T & ComponentHandle<Constructable>): IRouteableComponent<T> {
    if (ComponentHandleResolver.isName(component) || ComponentHandleResolver.isType(component)) {
      return null;
    } else {
      return component;
    }
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
