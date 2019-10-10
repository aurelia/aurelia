import { ViewportInstruction } from './viewport-instruction';

export interface IInstructionResolverOptions {
  separators?: IRouteSeparators;
}

export interface IRouteSeparators extends Partial<ISeparators> { }

interface ISeparators {
  viewport: string;
  sibling: string;
  scope: string;
  scopeStart: string;
  scopeEnd: string;
  noScope: string;
  parameters: string;
  parametersEnd: string;
  parameter?: string;
  add: string;
  clear: string;
  action: string;
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
    parameter: '&',
    add: '+',
    clear: '-',
    action: '.',
  };

  public activate(options?: IInstructionResolverOptions): void {
    options = options || {};
    this.separators = { ...this.separators, ...options.separators };
  }

  public get clearViewportInstruction(): string {
    return this.separators.clear;
  }

  public isClearViewportInstruction(instruction: string | ViewportInstruction): boolean {
    return instruction instanceof ViewportInstruction
      ? instruction.componentName === this.clearViewportInstruction && !!instruction.viewportName
      : instruction.startsWith(this.clearViewportInstruction) && instruction !== this.clearViewportInstruction;
  }

  public isClearAllViewportsInstruction(instruction: string | ViewportInstruction): boolean {
    return instruction instanceof ViewportInstruction
      ? instruction.componentName === this.clearViewportInstruction && !instruction.viewportName
      : instruction === this.clearViewportInstruction;
  }

  public parseViewportInstructions(instructions: string): ViewportInstruction[] {
    return this.parseViewportInstructionsWorker(instructions, true).instructions;
  }

  public parseViewportInstruction(instruction: string): ViewportInstruction {
    const instructions = this.parseViewportInstructions(instruction);
    if (instructions.length) {
      return instructions[0];
    }
    return new ViewportInstruction('');
  }

  public stringifyViewportInstructions(instructions: ViewportInstruction[], excludeViewport: boolean = false, viewportContext: boolean = false): string {
    return instructions
      .map(instruction => this.stringifyViewportInstruction(instruction, excludeViewport, viewportContext))
      .filter(instruction => instruction && instruction.length)
      .join(this.separators.sibling);
  }

  public stringifyViewportInstruction(instruction: ViewportInstruction | string, excludeViewport: boolean = false, viewportContext: boolean = false): string {
    if (typeof instruction === 'string') {
      return this.stringifyAViewportInstruction(instruction, excludeViewport);
    } else {
      let excludeCurrentViewport = excludeViewport;
      if (viewportContext) {
        if (instruction.viewport && instruction.viewport.options.noLink) {
          return '';
        }
        if (!instruction.needsViewportDescribed && instruction.viewport && !instruction.viewport.options.forceDescription) {
          excludeCurrentViewport = true;
        }
      }
      let stringified = this.stringifyAViewportInstruction(instruction, excludeCurrentViewport);
      if (instruction.nextScopeInstructions && instruction.nextScopeInstructions.length) {
        stringified += instruction.nextScopeInstructions.length === 1
          ? `${this.separators.scope}${this.stringifyViewportInstructions(instruction.nextScopeInstructions, excludeViewport, viewportContext)}`
          : `${this.separators.scope}${this.separators.scopeStart}${this.stringifyViewportInstructions(instruction.nextScopeInstructions, excludeViewport, viewportContext)}${this.separators.scopeEnd}`;
      }
      return stringified;
    }
  }

  public stringifyScopedViewportInstructions(instructions: ViewportInstruction | string | (ViewportInstruction | string)[]): string {
    if (!Array.isArray(instructions)) {
      return this.stringifyScopedViewportInstructions([instructions]);
    }
    return instructions.map((instruction) => this.stringifyViewportInstruction(instruction)).join(this.separators.scope);
  }

  public encodeViewportInstructions(instructions: ViewportInstruction[]): string {
    return encodeURIComponent(this.stringifyViewportInstructions(instructions)).replace(/\(/g, '%28').replace(/\)/g, '%29');
  }
  public decodeViewportInstructions(instructions: string): ViewportInstruction[] {
    return this.parseViewportInstructions(decodeURIComponent(instructions));
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

  public mergeViewportInstructions(instructions: (string | ViewportInstruction)[]): ViewportInstruction[] {
    const merged: ViewportInstruction[] = [];

    for (let instruction of instructions) {
      if (typeof instruction === 'string') {
        instruction = this.parseViewportInstruction(instruction);
      }
      const index = merged.findIndex(merge => merge.sameViewport(instruction as ViewportInstruction));
      if (index >= 0) {
        merged.splice(index, 1, instruction);
      } else {
        merged.push(instruction);
      }
    }
    return merged;
  }

  public flattenViewportInstructions(instructions: ViewportInstruction[]): ViewportInstruction[] {
    const flat: ViewportInstruction[] = [];
    for (const instruction of instructions) {
      flat.push(instruction);
      if (instruction.nextScopeInstructions) {
        flat.push(...this.flattenViewportInstructions(instruction.nextScopeInstructions));
      }
    }
    return flat;
  }

  public cloneViewportInstructions(instructions: ViewportInstruction[], viewportInstances: boolean = false): ViewportInstruction[] {
    const clones: ViewportInstruction[] = [];
    for (const instruction of instructions) {
      const clone = new ViewportInstruction(
        instruction.componentInstance || instruction.componentType || instruction.componentName!,
        viewportInstances ? instruction.viewport || instruction.viewportName! : instruction.viewportName!,
        instruction.parametersString!
      );
      clone.needsViewportDescribed = instruction.needsViewportDescribed;
      clone.scope = viewportInstances ? instruction.scope : null;
      if (instruction.nextScopeInstructions) {
        clone.nextScopeInstructions = this.cloneViewportInstructions(instruction.nextScopeInstructions, viewportInstances);
      }
      clones.push(clone);
    }
    return clones;
  }

  private parseViewportInstructionsWorker(instructions: string, grouped: boolean = false): { instructions: ViewportInstruction[]; remaining: string } {
    if (!instructions) {
      return { instructions: [], remaining: '' };
    }
    if (instructions.startsWith(this.separators.scopeStart)) {
      instructions = `${this.separators.scope}${instructions}`;
    }
    const viewportInstructions: ViewportInstruction[] = [];
    let guard = 10;
    while (instructions.length && guard) {
      guard--;
      if (instructions.startsWith(this.separators.scope)) {
        instructions = instructions.slice(this.separators.scope.length);
        const scopeStart = instructions.startsWith(this.separators.scopeStart);
        if (scopeStart) {
          instructions = instructions.slice(this.separators.scopeStart.length);
        }
        const { instructions: found, remaining } = this.parseViewportInstructionsWorker(instructions, scopeStart);
        if (viewportInstructions.length) {
          viewportInstructions[viewportInstructions.length - 1].nextScopeInstructions = found;
        } else {
          viewportInstructions.push(...found);
        }
        instructions = remaining;

      } else if (instructions.startsWith(this.separators.scopeEnd)) {
        if (grouped) {
          instructions = instructions.slice(this.separators.scopeEnd.length);
        }
        return { instructions: viewportInstructions, remaining: instructions };

      } else if (instructions.startsWith(this.separators.sibling)) {
        if (!grouped) {
          return { instructions: viewportInstructions, remaining: instructions };
        }
        instructions = instructions.slice(this.separators.sibling.length);

      } else {
        const { instruction: viewportInstruction, remaining } = this.parseAViewportInstruction(instructions);
        viewportInstructions.push(viewportInstruction);
        instructions = remaining;
      }
    }

    return { instructions: viewportInstructions, remaining: instructions };
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

  private parseAViewportInstruction(instruction: string): { instruction: ViewportInstruction; remaining: string } {
    const seps = this.separators;
    const tokens = [seps.parameters, seps.viewport, seps.noScope, seps.scopeEnd, seps.scope, seps.sibling];

    let { token, pos } = this.findNextToken(instruction, tokens);

    const component = pos !== -1 ? instruction.slice(0, pos) : instruction;
    instruction = pos !== -1 ? instruction.slice(pos + token.length) : '';

    let parametersString: string | undefined = void 0;
    tokens.shift(); // parameters
    if (token === seps.parameters) {
      ({ token, pos } = this.findNextToken(instruction, [seps.parametersEnd]));
      parametersString = instruction.slice(0, pos);
      instruction = instruction.slice(pos + token.length);

      ({ token } = this.findNextToken(instruction, tokens));
      instruction = instruction.slice(token.length);
    }

    let viewport: string | undefined = void 0;
    tokens.shift(); // viewport
    if (token === seps.viewport) {
      ({ token, pos } = this.findNextToken(instruction, tokens));
      viewport = pos !== -1 ? instruction.slice(0, pos) : instruction;
      instruction = pos !== -1 ? instruction.slice(pos + token.length) : '';
    }

    let scope: boolean = true;
    tokens.shift(); // noScope
    if (token === seps.noScope) {
      scope = false;
    }

    // Restore token that belongs to next instruction
    if (token === seps.scopeEnd || token === seps.scope || token === seps.sibling) {
      instruction = `${token}${instruction}`;
    }

    return { instruction: new ViewportInstruction(component, viewport, parametersString, scope), remaining: instruction };
  }

  private stringifyAViewportInstruction(instruction: ViewportInstruction | string, excludeViewport: boolean = false): string {
    if (typeof instruction === 'string') {
      return this.stringifyViewportInstruction(this.parseViewportInstruction(instruction), excludeViewport);
    } else {
      let instructionString = instruction.componentName;
      if (instruction.parametersString) {
        // TODO: Review parameters in ViewportInstruction
        instructionString += this.separators.parameters + instruction.parametersString + this.separators.parametersEnd;
      }
      if (instruction.viewportName !== null && !excludeViewport) {
        instructionString += this.separators.viewport + instruction.viewportName;
      }
      if (!instruction.ownsScope) {
        instructionString += this.separators.noScope;
      }
      return instructionString || '';
    }
  }
}
