import { Constructable } from '@aurelia/kernel';
import { CustomElement } from '@aurelia/runtime';
import { ComponentAppellation, IRouteableComponent, RouteableComponentType, IViewportInstruction, NavigationInstruction, ViewportHandle } from './interfaces';
import { IRouter } from './router';
import { Viewport } from './viewport';
import { ViewportInstruction } from './viewport-instruction';

export const ComponentAppellationResolver = {
  isName: function (component: ComponentAppellation): component is string {
    return typeof component === 'string';
  },
  isType: function (component: ComponentAppellation): component is RouteableComponentType {
    return CustomElement.isType(component);
  },
  isInstance: function (component: ComponentAppellation): component is IRouteableComponent {
    return !ComponentAppellationResolver.isName(component) && !ComponentAppellationResolver.isType(component);
  },

  getName: function (component: ComponentAppellation): string {
    if (ComponentAppellationResolver.isName(component)) {
      return component;
    } else if (ComponentAppellationResolver.isType(component)) {
      return CustomElement.getDefinition(component).name;
    } else {
      return ComponentAppellationResolver.getName(component.constructor as Constructable);
    }
  },
  getType: function (component: ComponentAppellation): RouteableComponentType | null {
    if (ComponentAppellationResolver.isName(component as Constructable & string)) {
      return null;
    } else if (ComponentAppellationResolver.isType(component as RouteableComponentType)) {
      return component as RouteableComponentType;
    } else {
      return ((component as IRouteableComponent).constructor as RouteableComponentType);
    }
  },
  getInstance: function (component: ComponentAppellation): IRouteableComponent | null {
    if (ComponentAppellationResolver.isName(component as Constructable & string) || ComponentAppellationResolver.isType(component as Constructable & string)) {
      return null;
    } else {
      return component as IRouteableComponent;
    }
  },
};

export const ViewportHandleResolver = {
  isName: function (viewport: ViewportHandle): viewport is string {
    return typeof viewport === 'string';
  },
  isInstance: function (viewport: ViewportHandle): viewport is Viewport {
    return viewport instanceof Viewport;
  },
  getName: function (viewport: ViewportHandle): string | null {
    if (ViewportHandleResolver.isName(viewport)) {
      return viewport;
    } else {
      return viewport ? (viewport).name : null;
    }
  },
  getInstance: function (viewport: ViewportHandle): Viewport | null {
    if (ViewportHandleResolver.isName(viewport)) {
      return null;
    } else {
      return viewport;
    }
  },
};

export const NavigationInstructionResolver = {
  toViewportInstructions: function (router: IRouter, navigationInstructions: NavigationInstruction | NavigationInstruction[]): ViewportInstruction[] {
    if (!Array.isArray(navigationInstructions)) {
      return NavigationInstructionResolver.toViewportInstructions(router, [navigationInstructions]);
    }
    const instructions: ViewportInstruction[] = [];
    for (const instruction of navigationInstructions) {
      if (typeof instruction === 'string') {
        instructions.push(...router.instructionResolver.parseViewportInstructions(instruction));
      } else if (instruction instanceof ViewportInstruction) {
        instructions.push(instruction);
      } else if ((instruction as IViewportInstruction).component) {
        const viewportComponent = instruction as IViewportInstruction;
        instructions.push(new ViewportInstruction(viewportComponent.component, viewportComponent.viewport, viewportComponent.parameters));
      } else {
        instructions.push(new ViewportInstruction(instruction as ComponentAppellation));
      }
    }
    return instructions;
  },
};
