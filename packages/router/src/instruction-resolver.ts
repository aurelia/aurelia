/**
 *
 * NOTE: This file is still WIP and will go through at least one more iteration of refactoring, commenting and clean up!
 * In its current state, it is NOT a good source for learning about the inner workings and design of the router.
 *
 */
import { ComponentParameters, ComponentAppellation, ViewportHandle } from './interfaces.js';
import { RoutingInstruction } from './instructions/routing-instruction.js';
import { RoutingScope } from './routing-scope.js';
import { FoundRoute } from './found-route.js';
import { IRouteSeparators, ISeparators } from './router-options.js';

export interface IInstructionResolverOptions {
  separators?: IRouteSeparators;
}

// export interface IRouteSeparators extends Partial<ISeparators> { }

// interface ISeparators {
//   viewport: string;
//   sibling: string;
//   scope: string;
//   scopeStart: string;
//   scopeEnd: string;
//   noScope: string;
//   parameters: string;
//   parametersEnd: string;
//   parameterSeparator: string;
//   parameterKeySeparator: string;
//   parameter?: string;
//   add: string;
//   clear: string;
//   action: string;
// }

export interface IComponentParameter {
  key?: string | undefined;
  value: unknown;
}

export class InstructionResolver {
  public separators: ISeparators = {
    viewport: '@', // ':',
    sibling: '+', // '/',
    scope: '/', // '+',
    scopeStart: '(', // ''
    scopeEnd: ')', // ''
    noScope: '!',
    parameters: '(', // '='
    parametersEnd: ')', // ''
    parameterSeparator: ',',
    parameterKeySeparator: '=',
    parameter: '&',
    add: '+',
    clear: '-',
    action: '.',
  };

  public start(options?: IInstructionResolverOptions): void {
    options = options || {};
    this.separators = { ...this.separators, ...options.separators };
  }

  public get clearRoutingInstruction(): string {
    return this.separators.clear;
  }

  public get addRoutingInstruction(): string {
    return this.separators.add;
  }

  public isClearRoutingInstruction(instruction: string | RoutingInstruction): boolean {
    return instruction instanceof RoutingInstruction
      ? instruction.component.name === this.clearRoutingInstruction && !!instruction.viewport.name
      : instruction.startsWith(this.clearRoutingInstruction) && instruction !== this.clearRoutingInstruction;
  }

  public isAddRoutingInstruction(instruction: string | RoutingInstruction): boolean {
    return instruction instanceof RoutingInstruction
      ? instruction.component.name === this.addRoutingInstruction
      : (instruction === this.addRoutingInstruction
        || instruction.startsWith(`${this.separators.add}${this.separators.viewport}`));
  }

  public isClearViewportScopeInstruction(instruction: string | RoutingInstruction): boolean {
    return instruction instanceof RoutingInstruction
      ? instruction.component.name === this.clearRoutingInstruction && !!instruction.viewportScope
      : instruction.startsWith(this.clearRoutingInstruction) && instruction !== this.clearRoutingInstruction;
  }

  public isClearAllViewportsInstruction(instruction: string | RoutingInstruction): boolean {
    return instruction instanceof RoutingInstruction
      ? instruction.component.name === this.clearRoutingInstruction && !instruction.viewport.name
      : instruction === this.clearRoutingInstruction;
  }

  public isAddAllViewportsInstruction(instruction: string | RoutingInstruction): boolean {
    return instruction instanceof RoutingInstruction
      ? instruction.component.name === this.addRoutingInstruction && !instruction.viewport.name
      : instruction === this.addRoutingInstruction;
  }

  public parseRoutingInstructions(instructions: string): RoutingInstruction[] {
    const match = /^[./]+/.exec(instructions);
    let context = '';
    if (Array.isArray(match) && match.length > 0) {
      context = match[0];
      instructions = instructions.slice(context.length);
    }
    const parsedInstructions: RoutingInstruction[] = this.parseRoutingInstructionsWorker(instructions, true).instructions;
    for (const instruction of parsedInstructions) {
      instruction.context = context;
    }
    return parsedInstructions;
  }

  public parseRoutingInstruction(instruction: string): RoutingInstruction {
    const instructions = this.parseRoutingInstructions(instruction);
    if (instructions.length) {
      return instructions[0];
    }
    return RoutingInstruction.create('') as RoutingInstruction;
  }

  public stringifyRoutingInstructions(instructions: RoutingInstruction[] | string, excludeViewport: boolean = false, viewportContext: boolean = false): string {
    return typeof (instructions) === 'string'
      ? instructions
      : instructions
        .map(instruction => this.stringifyRoutingInstruction(instruction, excludeViewport, viewportContext))
        .filter(instruction => instruction && instruction.length)
        .join(this.separators.sibling);
  }

  public stringifyRoutingInstruction(instruction: RoutingInstruction | string, excludeViewport: boolean = false, viewportContext: boolean = false): string {
    if (typeof instruction === 'string') {
      return this.stringifyARoutingInstruction(instruction, excludeViewport);
    } else {
      let excludeCurrentViewport = excludeViewport;
      let excludeCurrentComponent = false;
      if (viewportContext) {
        if (instruction.viewport.instance?.options?.noLink) {
          return '';
        }
        if (!instruction.needsViewportDescribed && instruction.viewport.instance && !instruction.viewport.instance.options.forceDescription) {
          excludeCurrentViewport = true;
        }
        if (instruction.viewport && instruction.viewport.instance?.options.fallback === instruction.component.name) {
          excludeCurrentComponent = true;
        }
        if (!instruction.needsViewportDescribed && instruction.viewportScope) {
          excludeCurrentViewport = true;
        }
      }
      let route = instruction.route ?? null;
      const nextInstructions: RoutingInstruction[] | null = instruction.nextScopeInstructions;
      let stringified: string = instruction.context;
      // It's a configured route
      if (route !== null) {
        // Already added as part of a configuration, skip to next scope
        if (route === '') {
          return Array.isArray(nextInstructions)
            ? this.stringifyRoutingInstructions(nextInstructions, excludeViewport, viewportContext)
            : '';
        }
        route = (route as FoundRoute).matching;
        stringified += route.endsWith(this.separators.scope) ? route.slice(0, -this.separators.scope.length) : route;
      } else {
        stringified += this.stringifyARoutingInstruction(instruction, excludeCurrentViewport, excludeCurrentComponent);
      }
      if (Array.isArray(nextInstructions) && nextInstructions.length) {
        const nextStringified: string = this.stringifyRoutingInstructions(nextInstructions, excludeViewport, viewportContext);
        if (nextStringified.length > 0) {
          stringified += nextInstructions.length === 1 // TODO: This should really also check that the instructions have value
            ? `${this.separators.scope}${nextStringified}`
            : `${this.separators.scope}${this.separators.scopeStart}${nextStringified}${this.separators.scopeEnd}`;
        }
      }
      return stringified;
    }
  }

  public stringifyScopedRoutingInstructions(instructions: RoutingInstruction | string | (RoutingInstruction | string)[]): string {
    if (!Array.isArray(instructions)) {
      return this.stringifyScopedRoutingInstructions([instructions]);
    }
    return instructions.map((instruction) => this.stringifyRoutingInstruction(instruction)).join(this.separators.scope);
  }

  public encodeRoutingInstructions(instructions: RoutingInstruction[]): string {
    return encodeURIComponent(this.stringifyRoutingInstructions(instructions)).replace(/\(/g, '%28').replace(/\)/g, '%29');
  }
  public decodeRoutingInstructions(instructions: string): RoutingInstruction[] {
    return this.parseRoutingInstructions(decodeURIComponent(instructions));
  }

  public buildScopedLink(scopeContext: string, href: string): string {
    if (scopeContext) {
      href = `/${scopeContext}${this.separators.scope}${href}`;
    }
    return href;
  }

  public shouldClearViewports(path: string): { clearViewports: boolean; newPath: string } {
    const clearViewports = (path === this.separators.clear || path.startsWith(this.separators.clear + this.separators.add));
    const newPath = path.startsWith(this.separators.clear) ? path.slice(2) : path;
    return { clearViewports, newPath };
  }

  public mergeRoutingInstructions(instructions: (string | RoutingInstruction)[]): RoutingInstruction[] {
    const merged: RoutingInstruction[] = [];

    for (let instruction of instructions) {
      if (typeof instruction === 'string') {
        instruction = this.parseRoutingInstruction(instruction);
      }
      const index = merged.findIndex(merge => merge.sameViewport(instruction as RoutingInstruction));
      if (index >= 0) {
        merged.splice(index, 1, instruction);
      } else {
        merged.push(instruction);
      }
    }
    return merged;
  }

  public flattenRoutingInstructions(instructions: RoutingInstruction[]): RoutingInstruction[] {
    const flat: RoutingInstruction[] = [];
    for (const instruction of instructions) {
      flat.push(instruction);
      if (instruction.nextScopeInstructions) {
        flat.push(...this.flattenRoutingInstructions(instruction.nextScopeInstructions));
      }
    }
    return flat;
  }

  public cloneRoutingInstructions(instructions: RoutingInstruction[], keepInstances: boolean = false, context: boolean = false): RoutingInstruction[] {
    const clones: RoutingInstruction[] = [];
    for (const instruction of instructions) {
      const clone = RoutingInstruction.create(
        instruction.component.type ?? instruction.component.name!,
        instruction.viewport.name!,
        instruction.parameters.typedParameters !== null ? instruction.parameters.typedParameters : void 0,
      ) as RoutingInstruction;
      if (keepInstances) {
        clone.component.set(instruction.component.instance ?? instruction.component.type ?? instruction.component.name!);
        clone.viewport.set(instruction.viewport.instance ?? instruction.viewport.name!);
      }
      clone.needsViewportDescribed = instruction.needsViewportDescribed;
      clone.route = instruction.route;
      if (context) {
        clone.context = instruction.context;
      }
      clone.viewportScope = keepInstances ? instruction.viewportScope : null;
      clone.scope = keepInstances ? instruction.scope : null;
      if (instruction.nextScopeInstructions) {
        clone.nextScopeInstructions = this.cloneRoutingInstructions(instruction.nextScopeInstructions, keepInstances, context);
      }
      clones.push(clone);
    }
    return clones;
  }

  // TODO: Deal with separators in data and complex types
  public parseComponentParameters(parameters: ComponentParameters | null, uriComponent: boolean = false): IComponentParameter[] {
    if (parameters === undefined || parameters === null || parameters.length === 0) {
      return [];
    }
    if (typeof parameters === 'string') {
      const list: IComponentParameter[] = [];
      const params = parameters.split(this.separators.parameterSeparator);
      for (const param of params) {
        let key: string | undefined;
        let value: string;
        [key, value] = param.split(this.separators.parameterKeySeparator);
        if (value === void 0) {
          value = uriComponent ? decodeURIComponent(key) : key;
          key = void 0;
        } else if (uriComponent) {
          key = decodeURIComponent(key);
          value = decodeURIComponent(value);
        }
        list.push({ key, value });
      }
      return list;
    }
    if (Array.isArray(parameters)) {
      return parameters.map(param => ({ key: void 0, value: param }));
    }
    const keys = Object.keys(parameters);
    keys.sort();
    return keys.map(key => ({ key, value: parameters[key] }));
  }
  // TODO: Deal with separators in data and complex types
  public stringifyComponentParameters(parameters: IComponentParameter[], uriComponent: boolean = false): string {
    if (!Array.isArray(parameters) || parameters.length === 0) {
      return '';
    }
    const seps = this.separators;
    return parameters
      .map(param => {
        const key = param.key !== void 0 && uriComponent ? encodeURIComponent(param.key) : param.key;
        const value = uriComponent ? encodeURIComponent(param.value as string) : param.value as string;
        return key !== void 0 && key !== value ? key + seps.parameterKeySeparator + value : value;
      })
      .join(seps.parameterSeparator);
  }

  public matchScope(instructions: RoutingInstruction[], scope: RoutingScope): RoutingInstruction[] {
    const matching: RoutingInstruction[] = [];

    matching.push(...instructions.filter(instruction => instruction.scope === scope));
    matching.push(...instructions
      .filter(instr => instr.scope !== scope)
      .map(instr => Array.isArray(instr.nextScopeInstructions) ? this.matchScope(instr.nextScopeInstructions!, scope) : [])
      .flat()
    );
    return matching;
  }

  public matchChildren(instructions: RoutingInstruction[], active: RoutingInstruction[]): boolean {
    for (const instruction of instructions) {
      const matching = active.filter(instr => instr.sameComponent(instruction));
      if (matching.length === 0) {
        return false;
      }
      if (Array.isArray(instruction.nextScopeInstructions)
        && instruction.nextScopeInstructions.length > 0
        && this.matchChildren(
          instruction.nextScopeInstructions,
          matching.map(instr => Array.isArray(instr.nextScopeInstructions) ? instr.nextScopeInstructions : []).flat()
        ) === false) {
        return false;
      }
    }
    return true;
  }

  private parseRoutingInstructionsWorker(instructions: string, grouped: boolean = false): { instructions: RoutingInstruction[]; remaining: string } {
    if (!instructions) {
      return { instructions: [], remaining: '' };
    }
    if (instructions.startsWith(this.separators.scopeStart)) {
      instructions = `${this.separators.scope}${instructions}`;
    }
    const routingInstructions: RoutingInstruction[] = [];
    let guard = 1000;
    while (instructions.length && guard) {
      guard--;
      if (instructions.startsWith(this.separators.scope)) {
        instructions = instructions.slice(this.separators.scope.length);
        const scopeStart = instructions.startsWith(this.separators.scopeStart);
        if (scopeStart) {
          instructions = instructions.slice(this.separators.scopeStart.length);
        }
        const { instructions: found, remaining } = this.parseRoutingInstructionsWorker(instructions, scopeStart);
        if (routingInstructions.length) {
          routingInstructions[routingInstructions.length - 1].nextScopeInstructions = found;
        } else {
          routingInstructions.push(...found);
        }
        instructions = remaining;

      } else if (instructions.startsWith(this.separators.scopeEnd)) {
        if (grouped) {
          instructions = instructions.slice(this.separators.scopeEnd.length);
        }
        return { instructions: routingInstructions, remaining: instructions };

      } else if (instructions.startsWith(this.separators.sibling) && !this.isAddRoutingInstruction(instructions)) {
        if (!grouped) {
          return { instructions: routingInstructions, remaining: instructions };
        }
        instructions = instructions.slice(this.separators.sibling.length);

      } else {
        const { instruction: routingInstruction, remaining } = this.parseARoutingInstruction(instructions);
        routingInstructions.push(routingInstruction);
        instructions = remaining;
      }
    }

    return { instructions: routingInstructions, remaining: instructions };
  }

  private findNextToken(instruction: string, tokens: string[]): { token: string; pos: number } {
    const matches: Record<string, number> = {};
    // Tokens can have length > 1
    for (const token of tokens) {
      const tokenPos = instruction.indexOf(token);
      if (tokenPos > -1) {
        matches[token] = instruction.indexOf(token);
      }
    }
    const pos = Math.min(...Object.values(matches));
    for (const token in matches) {
      if (matches[token] === pos) {
        return { token, pos };
      }
    }
    return { token: '', pos: -1 };
  }

  private parseARoutingInstruction(instruction: string): { instruction: RoutingInstruction; remaining: string } {
    const seps = this.separators;
    const tokens = [seps.parameters, seps.viewport, seps.noScope, seps.scopeEnd, seps.scope, seps.sibling];
    let component: string | undefined = void 0;
    let parametersString: string | undefined = void 0;
    let viewport: string | undefined = void 0;
    let scope = true;
    let token!: string;
    let pos: number;

    const specials = [seps.add, seps.clear];
    for (const special of specials) {
      if (instruction === special) {
        component = instruction;
        instruction = '';
        tokens.shift(); // parameters
        tokens.shift(); // viewport
        token = seps.viewport;
        break;
      }
    }
    if (component === void 0) {
      for (const special of specials) {
        if (instruction.startsWith(`${special}${seps.viewport}`)) {
          component = special;
          instruction = instruction.slice(`${special}${seps.viewport}`.length);
          tokens.shift(); // parameters
          tokens.shift(); // viewport
          token = seps.viewport;
          break;
        }
      }
    }

    if (component === void 0) {
      ({ token, pos } = this.findNextToken(instruction, tokens));

      component = pos !== -1 ? instruction.slice(0, pos) : instruction;
      instruction = pos !== -1 ? instruction.slice(pos + token.length) : '';

      tokens.shift(); // parameters
      if (token === seps.parameters) {
        ({ token, pos } = this.findNextToken(instruction, [seps.parametersEnd]));
        parametersString = instruction.slice(0, pos);
        instruction = instruction.slice(pos + token.length);

        ({ token } = this.findNextToken(instruction, tokens));
        instruction = instruction.slice(token.length);
      }

      tokens.shift(); // viewport
    }
    if (token === seps.viewport) {
      ({ token, pos } = this.findNextToken(instruction, tokens));
      viewport = pos !== -1 ? instruction.slice(0, pos) : instruction;
      instruction = pos !== -1 ? instruction.slice(pos + token.length) : '';
    }

    tokens.shift(); // noScope
    if (token === seps.noScope) {
      scope = false;
    }

    // Restore token that belongs to next instruction
    if (token === seps.scopeEnd || token === seps.scope || token === seps.sibling) {
      instruction = `${token}${instruction}`;
    }

    const routingInstruction: RoutingInstruction = RoutingInstruction.create(component, viewport, parametersString, scope) as RoutingInstruction;

    return { instruction: routingInstruction, remaining: instruction };
  }

  private stringifyARoutingInstruction(instruction: RoutingInstruction | string, excludeViewport: boolean = false, excludeComponent: boolean = false): string {
    if (typeof instruction === 'string') {
      return this.stringifyRoutingInstruction(this.parseRoutingInstruction(instruction), excludeViewport, excludeComponent);
    } else {
      let instructionString = !excludeComponent ? instruction.component.name : '';
      const specification = instruction.component.type ? instruction.component.type.parameters : null;
      const parameters = this.stringifyComponentParameters(instruction.parameters.toSortedParameters(specification));
      if (parameters.length > 0) {
        instructionString += !excludeComponent
          ? `${this.separators.parameters}${parameters}${this.separators.parametersEnd}`
          : parameters;
      }
      if (instruction.viewport.name !== null && !excludeViewport) {
        instructionString += this.separators.viewport + instruction.viewport.name;
      }
      if (!instruction.ownsScope) {
        instructionString += this.separators.noScope;
      }
      return instructionString || '';
    }
  }
}
