/**
 *
 * NOTE: This file is still WIP and will go through at least one more iteration of refactoring, commenting and clean up!
 * In its current state, it is NOT a good source for learning about the inner workings and design of the router.
 *
 */
import { CustomElement, ICustomElementController, ICustomElementViewModel } from '@aurelia/runtime-html';
import { ComponentAppellation, LoadInstruction } from './interfaces.js';
import { ILoadOptions, IRouter } from './router.js';
import { RoutingInstruction } from './instructions/routing-instruction.js';
import { RoutingScope } from './routing-scope.js';
import { InstructionComponent } from './instructions/instruction-component.js';

export interface IRoutingInstructionsOptions {
  context?: ICustomElementViewModel | Element | Node | ICustomElementController;
}

/**
 * If `loadInstructions` is a string it (or parts of it) can be a route so then we need to
 * return it as string for further processing.
 */
export const LoadInstructionResolver = {
  createRoutingInstructions(router: IRouter, loadInstructions: LoadInstruction | LoadInstruction[], options?: IRoutingInstructionsOptions | ILoadOptions, keepString = true): { instructions: string | RoutingInstruction[]; scope: RoutingScope | null } {
    options = options ?? {};
    if ('origin' in options && !('context' in options)) {
      (options as IRoutingInstructionsOptions).context = options.origin;
    }
    // let scope = router.findScope((options as IRoutingInstructionsOptions).context ?? null);
    let scope = RoutingScope.for((options as IRoutingInstructionsOptions).context ?? null) ?? null;
    if (typeof loadInstructions === 'string') {
      // If it's not from scope root, figure out which scope
      if (!(loadInstructions).startsWith('/')) {
        // Scope modifications
        if ((loadInstructions).startsWith('.')) {
          // The same as no scope modification
          if ((loadInstructions).startsWith('./')) {
            loadInstructions = (loadInstructions).slice(2);
          }
          // Find out how many scopes upwards we should move
          while ((loadInstructions as string).startsWith('../')) {
            scope = scope?.parent ?? scope;
            loadInstructions = (loadInstructions as string).slice(3);
          }
        }
        if (scope?.path != null) {
          loadInstructions = `${scope.path}/${loadInstructions as string}`;
          scope = null; // router.rootScope!.scope;
        }
      } else { // Specified root scope with /
        scope = null; // router.rootScope!.scope;
      }
      if (!keepString) {
        loadInstructions = LoadInstructionResolver.toRoutingInstructions(loadInstructions);
        for (const instruction of loadInstructions as RoutingInstruction[]) {
          if (instruction.scope === null) {
            instruction.scope = scope;
          }
        }
      }
    } else {
      loadInstructions = LoadInstructionResolver.toRoutingInstructions(loadInstructions);
      for (const instruction of loadInstructions as RoutingInstruction[]) {
        if (instruction.scope === null) {
          instruction.scope = scope;
        }
      }
    }

    return {
      instructions: loadInstructions as string | RoutingInstruction[],
      scope,
    };
  },

  // TODO: Fix definition part here!
  toRoutingInstructions(navigationInstructions: LoadInstruction | LoadInstruction[]): RoutingInstruction[] {
    if (!Array.isArray(navigationInstructions)) {
      navigationInstructions = [navigationInstructions];
    }
    const instructions: RoutingInstruction[] = [];
    for (const instruction of navigationInstructions as LoadInstruction[]) {
      if (typeof instruction === 'string') {
        instructions.push(...RoutingInstruction.parse(instruction));
      } else if (instruction instanceof RoutingInstruction) {
        instructions.push(instruction);
      } else if (InstructionComponent.isAppelation(instruction)) {
        instructions.push(RoutingInstruction.create(instruction) as RoutingInstruction);
      } else if (InstructionComponent.isDefinition(instruction)) {
        instructions.push(RoutingInstruction.create(instruction.Type) as RoutingInstruction);
      } else if ('component' in instruction) {
        const viewportComponent = instruction;
        const newInstruction = RoutingInstruction.create(viewportComponent.component, viewportComponent.viewport, viewportComponent.parameters) as RoutingInstruction;
        if (viewportComponent.children !== void 0 && viewportComponent.children !== null) {
          newInstruction.nextScopeInstructions = LoadInstructionResolver.toRoutingInstructions(viewportComponent.children);
        }
        instructions.push(newInstruction);
      } else if (typeof instruction === 'object' && instruction !== null) {
        const type = CustomElement.define(instruction);
        instructions.push(RoutingInstruction.create(type) as RoutingInstruction);
      } else {
        instructions.push(RoutingInstruction.create(instruction as ComponentAppellation) as RoutingInstruction);
      }
    }
    return instructions;
  },
};
