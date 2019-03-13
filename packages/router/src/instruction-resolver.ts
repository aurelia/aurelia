import { ViewportInstruction } from './viewport-instruction';

export interface IInstructionResolverOptions {
  separators?: IRouteSeparators;
}

export interface IRouteSeparators {
  viewport: string;
  sibling: string;
  scope: string;
  ownsScope: string;
  parameters: string;
  parametersEnd: string;
  parameter: string;
  add: string;
  clear: string;
  action: string;
}

export class InstructionResolver {

  public separators: IRouteSeparators;

  public activate(options?: IInstructionResolverOptions): void {
    this.separators = {
      ... {
        viewport: '@', // ':',
        sibling: '+', // '/',
        scope: '/', // '+',
        ownsScope: '!',
        parameters: '(', // '='
        parametersEnd: ')', // ''
        parameter: '&',
        add: '+',
        clear: '-',
        action: '.',
      }, ...options.separators
    };
  }

  public get clearViewportInstruction(): string {
    return this.separators.clear;
  }

  public parseViewportInstructions(instructions: string): ViewportInstruction[] {
    if (instructions === null || instructions === '') {
      return [];
    }
    if (instructions.startsWith('/')) {
      instructions = instructions.slice(1);
    }
    return instructions.split(this.separators.sibling).map((instruction) => this.parseViewportInstruction(instruction));
  }

  public parseViewportInstruction(instruction: string): ViewportInstruction {
    const instructions = instruction.split(this.separators.scope).map((scopeInstruction) => this.parseAViewportInstruction(scopeInstruction));
    for (let i = 0; i < instructions.length - 1; i++) {
      instructions[i].nextScopeInstruction = instructions[i + 1];
    }
    return instructions[0];
  }

  public stringifyViewportInstructions(instructions: ViewportInstruction[]): string {
    return instructions.map((instruction) => this.stringifyViewportInstruction(instruction)).join(this.separators.sibling);
  }

  public stringifyViewportInstruction(instruction: ViewportInstruction | string, excludeViewport: boolean = false): string {
    if (typeof instruction === 'string') {
      return this.stringifyAViewportInstruction(instruction, excludeViewport);
    } else {
      const instructions = [instruction];
      while (instruction = instruction.nextScopeInstruction) {
        instructions.push(instruction);
      }
      return instructions.map((scopeInstruction) => this.stringifyAViewportInstruction(scopeInstruction, excludeViewport)).join(this.separators.scope);
    }
  }

  public parseScopedViewportInstruction(instruction: string): ViewportInstruction[] {
    return instruction.split(this.separators.scope).map((scopeInstruction) => this.parseViewportInstruction(scopeInstruction));
  }

  public stringifyScopedViewportInstruction(instructions: ViewportInstruction | string | (ViewportInstruction | string)[]): string {
    if (!Array.isArray(instructions)) {
      return this.stringifyScopedViewportInstruction([instructions]);
    }
    return instructions.map((instruction) => this.stringifyViewportInstruction(instruction)).join(this.separators.scope);
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

  public removeStateDuplicates(states: string[]): string[] {
    let sorted: string[] = states.slice().sort((a, b) => b.split(this.separators.scope).length - a.split(this.separators.scope).length);
    sorted = sorted.map((value) => `${this.separators.scope}${value}${this.separators.scope}`);

    let unique: string[] = [];
    if (sorted.length) {
      unique.push(sorted.shift());
      while (sorted.length) {
        const state = sorted.shift();
        if (unique.find((value) => {
          return value.indexOf(state) === -1;
        })) {
          unique.push(state);
        }
      }
    }
    unique = unique.map((value) => value.substring(1, value.length - 1));
    unique.sort((a, b) => a.split(this.separators.scope).length - b.split(this.separators.scope).length);

    return unique;
  }

  public stateStringsToString(stateStrings: string[], clear: boolean = false): string {
    const strings = stateStrings.slice();
    if (clear) {
      strings.unshift(this.clearViewportInstruction);
    }
    return strings.join(this.separators.sibling);
  }

  private parseAViewportInstruction(instruction: string): ViewportInstruction {
    let component: string;
    let viewport: string;
    let parameters: string[];
    let scope: boolean;
    const [componentPart, rest] = instruction.split(this.separators.viewport);
    if (rest === undefined) {
      [component, ...parameters] = componentPart.split(this.separators.parameters);
      if (component.endsWith(this.separators.ownsScope)) {
        scope = true;
        component = component.slice(0, -this.separators.ownsScope.length);
      }
    } else {
      component = componentPart;
      [viewport, ...parameters] = rest.split(this.separators.parameters);
      if (viewport.endsWith(this.separators.ownsScope)) {
        scope = true;
        viewport = viewport.slice(0, -this.separators.ownsScope.length);
      }
    }
    let parametersString = parameters.length ? parameters.join(this.separators.parameters) : undefined;
    // The parameter separator can be either a standalone character (such as / or =) or a pair of enclosing characters
    // (such as ()). The separating character is consumed but the end character is not, so we still need to remove that.
    if (this.separators.parametersEnd.length && parametersString && parametersString.endsWith(this.separators.parametersEnd)) {
      parametersString = parametersString.slice(0, -this.separators.parametersEnd.length);
    }
    return new ViewportInstruction(component, viewport, parametersString, scope);
  }

  private stringifyAViewportInstruction(instruction: ViewportInstruction | string, excludeViewport: boolean = false): string {
    if (typeof instruction === 'string') {
      return this.stringifyViewportInstruction(this.parseViewportInstruction(instruction), excludeViewport);
    } else {
      let instructionString = instruction.componentName;
      if (instruction.viewportName != null && !excludeViewport) {
        instructionString += this.separators.viewport + instruction.viewportName;
      }
      if (instruction.parametersString) {
        // TODO: Review parameters in ViewportInstruction
        instructionString += this.separators.parameters + instruction.parametersString + this.separators.parametersEnd;
      }
      return instructionString;
    }
  }
}
