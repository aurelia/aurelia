import { Constructable } from '@aurelia/kernel';
import { CustomElement, IController, ICustomElementViewModel } from '@aurelia/runtime';
import { ComponentAppellation, IRouteableComponent, RouteableComponentType, IViewportInstruction, NavigationInstruction, ViewportHandle } from './interfaces';
import { IRouter } from './router';
import { Viewport } from './viewport';
import { ViewportInstruction } from './viewport-instruction';
import { Scope } from './scope';

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

export interface IViewportInstructionsOptions {
  context?: ICustomElementViewModel | Element | IController;
}

export const NavigationInstructionResolver = {
  createViewportInstructions: function (router: IRouter, navigationInstructions: NavigationInstruction | NavigationInstruction[], options?: IViewportInstructionsOptions): { instructions: string | ViewportInstruction[]; scope: Scope | null } {
    options = options || {};
    let scope: Scope | null = null;
    if (options.context) {
      scope = router.findScope(options.context);
      if (typeof navigationInstructions === 'string') {
        // If it's not from scope root, figure out which scope
        if (!(navigationInstructions as string).startsWith('/')) {
          // Scope modifications
          if ((navigationInstructions as string).startsWith('.')) {
            // The same as no scope modification
            if ((navigationInstructions as string).startsWith('./')) {
              navigationInstructions = (navigationInstructions as string).slice(2);
            }
            // Find out how many scopes upwards we should move
            while ((navigationInstructions as string).startsWith('../')) {
              scope = scope.parent || scope;
              navigationInstructions = (navigationInstructions as string).slice(3);
            }
          }
          if (scope.path !== null) {
            navigationInstructions = `${scope.path}/${navigationInstructions}`;
            scope = router.rootScope!.scope;
          }
        } else { // Specified root scope with /
          scope = router.rootScope!.scope;
        }
      } else {
        navigationInstructions = NavigationInstructionResolver.toViewportInstructions(router, navigationInstructions);
        for (const instruction of navigationInstructions as ViewportInstruction[]) {
          if (instruction.scope === null) {
            instruction.scope = scope;
          }
        }
      }
    }

    return {
      instructions: navigationInstructions as string | ViewportInstruction[],
      scope,
    };
  },

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
        const newInstruction = router.createViewportInstruction(viewportComponent.component, viewportComponent.viewport, viewportComponent.parameters);
        if (viewportComponent.children !== void 0 && viewportComponent.children !== null) {
          newInstruction.nextScopeInstructions = NavigationInstructionResolver.toViewportInstructions(router, viewportComponent.children);
        }
        instructions.push(newInstruction);
      } else {
        instructions.push(router.createViewportInstruction(instruction as ComponentAppellation));
      }
    }
    return instructions;
  },
};
