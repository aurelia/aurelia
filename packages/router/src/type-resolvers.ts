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
import { Scope } from './scope.js';
import { InstructionComponent } from './instructions/instruction-component.js';

export interface IRoutingInstructionsOptions {
  context?: ICustomElementViewModel | Element | Node | ICustomElementController;
}

/**
 * If `loadInstructions` is a string it (or parts of it) can be a route so then we need to
 * return it as string for further processing.
 */
export const LoadInstructionResolver = {
  createRoutingInstructions(router: IRouter, loadInstructions: LoadInstruction | LoadInstruction[], options?: IRoutingInstructionsOptions | ILoadOptions, keepString = true): { instructions: string | RoutingInstruction[]; scope: Scope | null } {
    options = options ?? {};
    if ('origin' in options && !('context' in options)) {
      (options as IRoutingInstructionsOptions).context = options.origin;
    }
    let scope = router.findScope((options as IRoutingInstructionsOptions).context ?? null);
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
          scope = router.rootScope!.scope;
        }
      } else { // Specified root scope with /
        scope = router.rootScope!.scope;
      }
      if (!keepString) {
        loadInstructions = LoadInstructionResolver.toRoutingInstructions(router, loadInstructions);
        for (const instruction of loadInstructions as RoutingInstruction[]) {
          if (instruction.scope === null) {
            instruction.scope = scope;
          }
        }
      }
    } else {
      loadInstructions = LoadInstructionResolver.toRoutingInstructions(router, loadInstructions);
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
  toRoutingInstructions(router: IRouter, navigationInstructions: LoadInstruction | LoadInstruction[]): RoutingInstruction[] {
    if (!Array.isArray(navigationInstructions)) {
      return LoadInstructionResolver.toRoutingInstructions(router, [navigationInstructions]);
    }
    const instructions: RoutingInstruction[] = [];
    for (const instruction of navigationInstructions) {
      if (typeof instruction === 'string') {
        instructions.push(...router.instructionResolver.parseRoutingInstructions(instruction));
      } else if (instruction instanceof RoutingInstruction) {
        instructions.push(instruction);
      } else if (InstructionComponent.isAppelation(instruction)) {
        instructions.push(router.createRoutingInstruction(instruction));
      } else if (InstructionComponent.isDefinition(instruction)) {
        instructions.push(router.createRoutingInstruction(instruction.Type));
      } else if ('component' in instruction) {
        const viewportComponent = instruction;
        const newInstruction = router.createRoutingInstruction(viewportComponent.component, viewportComponent.viewport, viewportComponent.parameters);
        if (viewportComponent.children !== void 0 && viewportComponent.children !== null) {
          newInstruction.nextScopeInstructions = LoadInstructionResolver.toRoutingInstructions(router, viewportComponent.children);
        }
        instructions.push(newInstruction);
      } else if (typeof instruction === 'object' && instruction !== null) {
        const type = CustomElement.define(instruction);
        instructions.push(router.createRoutingInstruction(type));
      } else {
        instructions.push(router.createRoutingInstruction(instruction as ComponentAppellation));
      }
    }
    return instructions;
  },
};
