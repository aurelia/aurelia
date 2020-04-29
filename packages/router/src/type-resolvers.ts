import { Constructable } from '@aurelia/kernel';
import { CustomElement, IController, ICustomElementViewModel, INode } from '@aurelia/runtime';
import { ComponentAppellation, IRouteableComponent, RouteableComponentType, IViewportInstruction, NavigationInstruction, ViewportHandle } from './interfaces';
import { IRouter } from './router';
import { Viewport } from './viewport';
import { ViewportInstruction } from './viewport-instruction';
import { Scope } from './scope';

export const ComponentAppellationResolver = {
  isName<T extends INode>(component: ComponentAppellation<T>): component is string {
    return typeof component === 'string';
  },
  isType<T extends INode>(component: ComponentAppellation<T>): component is RouteableComponentType {
    return CustomElement.isType(component);
  },
  isInstance<T extends INode>(component: ComponentAppellation<T>): component is IRouteableComponent<T> {
    return !ComponentAppellationResolver.isName(component) && !ComponentAppellationResolver.isType(component);
  },

  getName<T extends INode>(component: ComponentAppellation<T>): string {
    if (ComponentAppellationResolver.isName(component)) {
      return component;
    } else if (ComponentAppellationResolver.isType(component)) {
      return CustomElement.getDefinition(component).name;
    } else {
      return ComponentAppellationResolver.getName(component.constructor as Constructable);
    }
  },
  getType<T extends INode>(component: ComponentAppellation<T>): RouteableComponentType | null {
    if (ComponentAppellationResolver.isName(component)) {
      return null;
    } else if (ComponentAppellationResolver.isType(component)) {
      return component;
    } else {
      return ((component as IRouteableComponent<T>).constructor as RouteableComponentType);
    }
  },
  getInstance<T extends INode>(component: ComponentAppellation<T>): IRouteableComponent<T> | null {
    if (ComponentAppellationResolver.isName(component) || ComponentAppellationResolver.isType(component)) {
      return null;
    } else {
      return component as IRouteableComponent<T>;
    }
  },
};

export const ViewportHandleResolver = {
  isName<T extends INode>(viewport: ViewportHandle<T>): viewport is string {
    return typeof viewport === 'string';
  },
  isInstance<T extends INode>(viewport: ViewportHandle<T>): viewport is Viewport<T> {
    return viewport instanceof Viewport;
  },
  getName<T extends INode>(viewport: ViewportHandle<T>): string | null {
    if (ViewportHandleResolver.isName(viewport)) {
      return viewport;
    } else {
      return viewport ? (viewport).name : null;
    }
  },
  getInstance<T extends INode>(viewport: ViewportHandle<T>): Viewport<T> | null {
    if (ViewportHandleResolver.isName(viewport)) {
      return null;
    } else {
      return viewport;
    }
  },
};

export interface IViewportInstructionsOptions<T extends INode> {
  context?: ICustomElementViewModel | T | IController;
}

export const NavigationInstructionResolver = {
  createViewportInstructions<T extends INode>(
    router: IRouter<T>,
    navigationInstructions: NavigationInstruction<T> | NavigationInstruction<T>[],
    options?: IViewportInstructionsOptions<T>,
  ): {
    instructions: string | ViewportInstruction<T>[];
    scope: Scope<T> | null;
  } {
    options = options || {};
    let scope: Scope<T> | null = null;
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
        for (const instruction of navigationInstructions as ViewportInstruction<T>[]) {
          if (instruction.scope === null) {
            instruction.scope = scope;
          }
        }
      }
    }

    return {
      instructions: navigationInstructions as string | ViewportInstruction<T>[],
      scope,
    };
  },

  toViewportInstructions<T extends INode>(
    router: IRouter<T>,
    navigationInstructions: NavigationInstruction<T> | NavigationInstruction<T>[],
  ): ViewportInstruction<T>[] {
    if (!Array.isArray(navigationInstructions)) {
      return NavigationInstructionResolver.toViewportInstructions(router, [navigationInstructions]);
    }
    const instructions: ViewportInstruction<T>[] = [];
    for (const instruction of navigationInstructions) {
      if (typeof instruction === 'string') {
        instructions.push(...router.instructionResolver.parseViewportInstructions(instruction));
      } else if (instruction instanceof ViewportInstruction) {
        instructions.push(instruction);
      } else if ((instruction as IViewportInstruction<T>).component) {
        const viewportComponent = instruction as IViewportInstruction<T>;
        const newInstruction = router.createViewportInstruction(viewportComponent.component, viewportComponent.viewport, viewportComponent.parameters);
        if (viewportComponent.children !== void 0 && viewportComponent.children !== null) {
          newInstruction.nextScopeInstructions = NavigationInstructionResolver.toViewportInstructions(router, viewportComponent.children);
        }
        instructions.push(newInstruction);
      } else {
        instructions.push(router.createViewportInstruction(instruction as ComponentAppellation<T>));
      }
    }
    return instructions;
  },
};
