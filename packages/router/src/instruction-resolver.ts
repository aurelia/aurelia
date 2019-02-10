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
        parameters: '=',
        add: '+',
        clear: '-',
        action: '.',
      }, ...options.separators
    };
  }

  public get clearViewportInstruction(): string {
    return this.separators.clear;
  }

  public parseViewportInstruction(instruction: string): ViewportInstruction {
    let component, viewport, parameters;
    const [componentPart, rest] = instruction.split(this.separators.viewport);
    if (rest === undefined) {
      [component, parameters] = componentPart.split(this.separators.parameters);
    } else {
      component = componentPart;
      [viewport, parameters] = rest.split(this.separators.parameters);
    }
    return new ViewportInstruction(component, viewport, parameters);
  }

  public stringifyViewportInstruction(instruction: ViewportInstruction): string {
    let instructionString = instruction.componentName;
    if (instruction.viewportName) {
      instructionString += this.separators.viewport + instruction.viewportName;
    }
    if (instruction.parametersString) {
      // TODO: Review parameters in ViewportInstruction
      instructionString += this.separators.parameters + instruction.parametersString;
    }
    return instructionString;
  }

  public buildScopedLink(scopeContext: string, href: string): string {
    if (scopeContext) {
      href = `/${scopeContext}${this.separators.scope}${href}`;
    }
    return href;
  }

  public shouldClearViewports(path: string): { clearViewports: boolean; newPath: string } {
    const clearViewports = (path === this.separators.clear || path.startsWith(this.separators.clear + this.separators.add));
    const newPath = path.startsWith(this.separators.clear) ? path.substring(1) : path;
    return { clearViewports, newPath };
  }

  public findViews(path: string): Record<string, string> {
    const views: Record<string, string> = {};
    // TODO: Let this govern start of scope
    if (path.startsWith('/')) {
      path = path.substring(1);
    }
    const sections: string[] = path.split(this.separators.sibling);

    // TODO: Remove this once multi level recursiveness is fixed
    // Expand with instances for all containing views
    // const expandedSections: string[] = [];
    // while (sections.length) {
    //   const part = sections.shift();
    //   const parts = part.split(this.separators.scope);
    //   for (let i = 1; i <= parts.length; i++) {
    //     expandedSections.push(parts.slice(0, i).join(this.separators.scope));
    //   }
    // }
    // sections = expandedSections;

    let index = 0;
    while (sections.length) {
      const view = sections.shift();
      const scopes = view.split(this.separators.scope);
      const leaf = scopes.pop();
      const parts = leaf.split(this.separators.viewport);
      // Noooooo?
      const component = parts[0];
      scopes.push(parts.length ? parts.join(this.separators.viewport) : `?${index++}`);
      const name = scopes.join(this.separators.scope);
      if (component) {
        views[name] = component;
      }
    }
    return views;
  }

  public viewportInstructionsToString(instructions: ViewportInstruction[]): string {
    const stringInstructions: string[] = [];
    for (const instruction of instructions) {
      stringInstructions.push(this.stringifyViewportInstruction(instruction));
    }
    return stringInstructions.join(this.separators.sibling);
  }

  public viewportInstructionsFromString(instructionsString: string): ViewportInstruction[] {
    const instructions = [];
    const instructionStrings = instructionsString.split(this.separators.sibling);
    for (const instructionString of instructionStrings) {
      instructions.push(this.parseViewportInstruction(instructionString));
    }
    return instructions;
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
}
