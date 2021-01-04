import { RouterOptions } from '../router-options';
import { RoutingInstruction } from './routing-instruction';

export class InstructionParser {
  public static separators = RouterOptions.separators;

  public static parse(instructions: string, grouped: boolean = false): { instructions: RoutingInstruction[]; remaining: string } {
    const seps = InstructionParser.separators;
    if (!instructions) {
      return { instructions: [], remaining: '' };
    }
    if (instructions.startsWith(seps.scopeStart)) {
      instructions = `${seps.scope}${instructions}`;
    }
    const routingInstructions: RoutingInstruction[] = [];
    let guard = 1000;
    while (instructions.length && guard) {
      guard--;
      if (instructions.startsWith(seps.scope)) {
        instructions = instructions.slice(seps.scope.length);
        const scopeStart = instructions.startsWith(seps.scopeStart);
        if (scopeStart) {
          instructions = instructions.slice(seps.scopeStart.length);
        }
        const { instructions: found, remaining } = InstructionParser.parse(instructions, scopeStart);
        if (routingInstructions.length) {
          routingInstructions[routingInstructions.length - 1].nextScopeInstructions = found;
        } else {
          routingInstructions.push(...found);
        }
        instructions = remaining;

      } else if (instructions.startsWith(seps.scopeEnd)) {
        if (grouped) {
          instructions = instructions.slice(seps.scopeEnd.length);
        }
        return { instructions: routingInstructions, remaining: instructions };

      } else if (instructions.startsWith(seps.sibling) && !InstructionParser.isAdd(instructions)) {
        if (!grouped) {
          return { instructions: routingInstructions, remaining: instructions };
        }
        instructions = instructions.slice(seps.sibling.length);

      } else {
        const { instruction: routingInstruction, remaining } = InstructionParser.parseOne(instructions);
        routingInstructions.push(routingInstruction);
        instructions = remaining;
      }
    }

    return { instructions: routingInstructions, remaining: instructions };
  }

  private static isAdd(instruction: string): boolean {
    return (instruction === InstructionParser.separators.add ||
      instruction.startsWith(`${InstructionParser.separators.add}${InstructionParser.separators.viewport}`));
  }

  private static parseOne(instruction: string): { instruction: RoutingInstruction; remaining: string } {
    const seps = InstructionParser.separators;
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
      ({ token, pos } = InstructionParser.findNextToken(instruction, tokens));

      component = pos !== -1 ? instruction.slice(0, pos) : instruction;
      instruction = pos !== -1 ? instruction.slice(pos + token.length) : '';

      tokens.shift(); // parameters
      if (token === seps.parameters) {
        ({ token, pos } = InstructionParser.findNextToken(instruction, [seps.parametersEnd]));
        parametersString = instruction.slice(0, pos);
        instruction = instruction.slice(pos + token.length);

        ({ token } = InstructionParser.findNextToken(instruction, tokens));
        instruction = instruction.slice(token.length);
      }

      tokens.shift(); // viewport
    }
    if (token === seps.viewport) {
      ({ token, pos } = InstructionParser.findNextToken(instruction, tokens));
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

  private static findNextToken(instruction: string, tokens: string[]): { token: string; pos: number } {
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
}
