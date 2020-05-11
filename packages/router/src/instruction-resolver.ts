/* eslint-disable @typescript-eslint/strict-boolean-expressions */
import { ComponentParameters, ComponentAppellation, ViewportHandle } from './interfaces';
import { ViewportInstruction } from './viewport-instruction';
import { Scope } from './scope';

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
  parameterSeparator: string;
  parameterKeySeparator: string;
  parameter?: string;
  add: string;
  clear: string;
  action: string;
}

export interface IComponentParameter {
  key?: string | undefined;
  value: unknown;
}

export function isClearViewportInstruction(instruction: string | ViewportInstruction): boolean {
  return instruction instanceof ViewportInstruction
    ? instruction.componentName === '-' && !!instruction.viewportName
    : instruction.startsWith('-') && instruction !== '-';
}

export function isAddViewportInstruction(instruction: string | ViewportInstruction): boolean {
  return instruction instanceof ViewportInstruction
    ? instruction.componentName === '+'
    : (instruction === '+' || instruction.startsWith('+@'));
}

export function isClearViewportScopeInstruction(instruction: string | ViewportInstruction): boolean {
  return instruction instanceof ViewportInstruction
    ? instruction.componentName === '-' && !!instruction.viewportScope
    : instruction.startsWith('-') && instruction !== '-';
}

export function isClearAllViewportsInstruction(instruction: string | ViewportInstruction): boolean {
  return instruction instanceof ViewportInstruction
    ? instruction.componentName === '-' && !instruction.viewportName
    : instruction === '-';
}

export function isAddAllViewportsInstruction(instruction: string | ViewportInstruction): boolean {
  return instruction instanceof ViewportInstruction
    ? instruction.componentName === '+' && !instruction.viewportName
    : instruction === '+';
}

export function createViewportInstruction(
  component: ComponentAppellation,
  viewport?: ViewportHandle,
  parameters?: ComponentParameters,
  ownsScope: boolean = true,
  nextScopeInstructions: ViewportInstruction[] | null = null,
): ViewportInstruction {
  return new ViewportInstruction(component, viewport, parameters, ownsScope, nextScopeInstructions);
}

export function createClearViewportInstruction(
  viewport?: ViewportHandle,
  parameters?: ComponentParameters,
  ownsScope: boolean = true,
  nextScopeInstructions: ViewportInstruction[] | null = null,
): ViewportInstruction {
  return new ViewportInstruction('-', viewport, parameters, ownsScope, nextScopeInstructions);
}

export function parseViewportInstructions(instructions: string): ViewportInstruction[] {
  const match = /^[./]+/.exec(instructions);
  let context = '';
  if (Array.isArray(match) && match.length > 0) {
    context = match[0];
    instructions = instructions.slice(context.length);
  }
  const parsedInstructions: ViewportInstruction[] = parseViewportInstructionsWorker(instructions, true).instructions;
  for (const instruction of parsedInstructions) {
    instruction.context = context;
  }
  return parsedInstructions;
}

export function parseViewportInstruction(instruction: string): ViewportInstruction {
  const instructions = parseViewportInstructions(instruction);
  if (instructions.length) {
    return instructions[0];
  }
  return createViewportInstruction('');
}

export function stringifyViewportInstructions(
  instructions: ViewportInstruction[],
  excludeViewport: boolean = false,
  viewportContext: boolean = false,
): string {
  return instructions
    .map(instruction => stringifyViewportInstruction(instruction, excludeViewport, viewportContext))
    .filter(instruction => instruction?.length > 0)
    .join('+');
}

export function stringifyViewportInstruction(
  instruction: ViewportInstruction | string,
  excludeViewport: boolean = false,
  viewportContext: boolean = false,
): string {
  if (typeof instruction === 'string') {
    return stringifyAViewportInstruction(instruction, excludeViewport);
  } else {
    let excludeCurrentViewport = excludeViewport;
    let excludeCurrentComponent = false;
    if (viewportContext) {
      if (instruction.viewport && instruction.viewport.options.noLink) {
        return '';
      }
      if (!instruction.needsViewportDescribed && instruction.viewport && !instruction.viewport.options.forceDescription) {
        excludeCurrentViewport = true;
      }
      if (instruction.viewport && instruction.viewport.options.fallback === instruction.componentName) {
        excludeCurrentComponent = true;
      }
      if (!instruction.needsViewportDescribed && instruction.viewportScope) {
        excludeCurrentViewport = true;
      }
    }
    const route: string | null = instruction.route;
    const nextInstructions: ViewportInstruction[] | null = instruction.nextScopeInstructions;
    let stringified: string = instruction.context;
    // It's a configured route
    if (route !== null) {
      // Already added as part of a configuration, skip to next scope
      if (route === '') {
        return Array.isArray(nextInstructions)
          ? stringifyViewportInstructions(nextInstructions, excludeViewport, viewportContext)
          : '';
      }
      stringified += route.endsWith('/') ? route.slice(0, -'/'.length) : route;
    } else {
      stringified += stringifyAViewportInstruction(instruction, excludeCurrentViewport, excludeCurrentComponent);
    }
    if (Array.isArray(nextInstructions) && nextInstructions.length) {
      const nextStringified: string = stringifyViewportInstructions(nextInstructions, excludeViewport, viewportContext);
      if (nextStringified.length > 0) {
        stringified += nextInstructions.length === 1 // TODO: This should really also check that the instructions have value
          ? `/${nextStringified}`
          : `/(${nextStringified})`;
      }
    }
    return stringified;
  }
}

export function stringifyScopedViewportInstructions(
  instructions: ViewportInstruction | string | (ViewportInstruction | string)[],
): string {
  if (!Array.isArray(instructions)) {
    return stringifyScopedViewportInstructions([instructions]);
  }
  return instructions.map((instruction) => stringifyViewportInstruction(instruction)).join('/');
}

export function encodeViewportInstructions(instructions: ViewportInstruction[]): string {
  return encodeURIComponent(stringifyViewportInstructions(instructions)).replace(/\(/g, '%28').replace(/\)/g, '%29');
}
export function decodeViewportInstructions(instructions: string): ViewportInstruction[] {
  return parseViewportInstructions(decodeURIComponent(instructions));
}

export function buildScopedLink(scopeContext: string, href: string): string {
  if (scopeContext) {
    href = `/${scopeContext}/${href}`;
  }
  return href;
}

export function shouldClearViewports(path: string): { clearViewports: boolean; newPath: string } {
  const clearViewports = (path === '-' || path.startsWith('-+'));
  const newPath = path.startsWith('-') ? path.slice(2) : path;
  return { clearViewports, newPath };
}

export function mergeViewportInstructions(instructions: (string | ViewportInstruction)[]): ViewportInstruction[] {
  const merged: ViewportInstruction[] = [];

  for (let instruction of instructions) {
    if (typeof instruction === 'string') {
      instruction = parseViewportInstruction(instruction);
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

export function flattenViewportInstructions(instructions: ViewportInstruction[]): ViewportInstruction[] {
  const flat: ViewportInstruction[] = [];
  for (const instruction of instructions) {
    flat.push(instruction);
    if (instruction.nextScopeInstructions) {
      flat.push(...flattenViewportInstructions(instruction.nextScopeInstructions));
    }
  }
  return flat;
}

export function cloneViewportInstructions(
  instructions: ViewportInstruction[],
  keepInstances: boolean = false,
  context: boolean = false,
): ViewportInstruction[] {
  const clones: ViewportInstruction[] = [];
  for (const instruction of instructions) {
    const clone = createViewportInstruction(
      (keepInstances ? instruction.componentInstance : null) || instruction.componentType || instruction.componentName!,
      keepInstances ? instruction.viewport || instruction.viewportName! : instruction.viewportName!,
      instruction.typedParameters !== null ? instruction.typedParameters : void 0,
    );
    clone.needsViewportDescribed = instruction.needsViewportDescribed;
    clone.route = instruction.route;
    if (context) {
      clone.context = instruction.context;
    }
    clone.viewportScope = keepInstances ? instruction.viewportScope : null;
    clone.scope = keepInstances ? instruction.scope : null;
    if (instruction.nextScopeInstructions) {
      clone.nextScopeInstructions = cloneViewportInstructions(instruction.nextScopeInstructions, keepInstances, context);
    }
    clones.push(clone);
  }
  return clones;
}

// TODO: Deal with separators in data and complex types
export function parseComponentParameters(
  parameters: ComponentParameters | null,
  uriComponent: boolean = false,
): IComponentParameter[] {
  if (parameters === undefined || parameters === null || parameters.length === 0) {
    return [];
  }
  if (typeof parameters === 'string') {
    const list: IComponentParameter[] = [];
    const params = parameters.split(',');
    for (const param of params) {
      let key: string | undefined;
      let value: string;
      [key, value] = param.split('=');
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
export function stringifyComponentParameters(parameters: IComponentParameter[], uriComponent: boolean = false): string {
  if (!Array.isArray(parameters) || parameters.length === 0) {
    return '';
  }
  return parameters
    .map(param => {
      const key = param.key !== void 0 && uriComponent ? encodeURIComponent(param.key) : param.key;
      const value = uriComponent ? encodeURIComponent(param.value as string) : param.value as string;
      return key !== void 0 && key !== value ? `${key}=${value}` : value;
    })
    .join(',');
}

export function matchScope(
  instructions: ViewportInstruction[],
  scope: Scope,
): ViewportInstruction[] {
  const matching: ViewportInstruction[] = [];

  matching.push(...instructions.filter(instruction => instruction.scope === scope));
  matching.push(...instructions
    .filter(instr => instr.scope !== scope)
    .map(instr => Array.isArray(instr.nextScopeInstructions) ? matchScope(instr.nextScopeInstructions!, scope) : [])
    .flat()
  );
  return matching;
}

export function matchChildren(
  instructions: ViewportInstruction[],
  active: ViewportInstruction[],
): boolean {
  for (const instruction of instructions) {
    const matching = active.filter(instr => instr.sameComponent(instruction));
    if (matching.length === 0) {
      return false;
    }
    if (
      Array.isArray(instruction.nextScopeInstructions) &&
      instruction.nextScopeInstructions.length > 0 &&
      matchChildren(
        instruction.nextScopeInstructions,
        matching.map(instr => Array.isArray(instr.nextScopeInstructions) ? instr.nextScopeInstructions : []).flat()
      ) === false
    ) {
      return false;
    }
  }
  return true;
}

function parseViewportInstructionsWorker(
  instructions: string,
  grouped: boolean = false,
): {
  instructions: ViewportInstruction[];
  remaining: string;
} {
  if (!instructions) {
    return { instructions: [], remaining: '' };
  }
  if (instructions.startsWith('(')) {
    instructions = `/${instructions}`;
  }
  const viewportInstructions: ViewportInstruction[] = [];
  let guard = 1000;
  while (instructions.length && guard) {
    guard--;
    if (instructions.startsWith('/')) {
      instructions = instructions.slice(1);
      const scopeStart = instructions.startsWith('(');
      if (scopeStart) {
        instructions = instructions.slice(1);
      }
      const { instructions: found, remaining } = parseViewportInstructionsWorker(instructions, scopeStart);
      if (viewportInstructions.length) {
        viewportInstructions[viewportInstructions.length - 1].nextScopeInstructions = found;
      } else {
        viewportInstructions.push(...found);
      }
      instructions = remaining;

    } else if (instructions.startsWith(')')) {
      if (grouped) {
        instructions = instructions.slice(1);
      }
      return { instructions: viewportInstructions, remaining: instructions };

    } else if (instructions.startsWith('+') && !isAddViewportInstruction(instructions)) {
      if (!grouped) {
        return { instructions: viewportInstructions, remaining: instructions };
      }
      instructions = instructions.slice(1);

    } else {
      const { instruction: viewportInstruction, remaining } = parseAViewportInstruction(instructions);
      viewportInstructions.push(viewportInstruction);
      instructions = remaining;
    }
  }

  return { instructions: viewportInstructions, remaining: instructions };
}

function findNextToken(
  instruction: string,
  tokens: string[],
): {
  token: string;
  pos: number;
} {
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

function parseAViewportInstruction(
  instruction: string,
): {
  instruction: ViewportInstruction;
  remaining: string;
} {
  const tokens = ['(', '@', '!', ')', '/', '+'];
  let component: string | undefined = void 0;
  let parametersString: string | undefined = void 0;
  let viewport: string | undefined = void 0;
  let scope = true;
  let token!: string;
  let pos: number;

  const specials = ['+', '-'];
  for (const special of specials) {
    if (instruction === special) {
      component = instruction;
      instruction = '';
      tokens.shift(); // parameters
      tokens.shift(); // viewport
      token = '@';
      break;
    }
  }
  if (component === void 0) {
    for (const special of specials) {
      if (instruction.startsWith(`${special}@`)) {
        component = special;
        instruction = instruction.slice(2);
        tokens.shift(); // parameters
        tokens.shift(); // viewport
        token = '@';
        break;
      }
    }
  }

  if (component === void 0) {
    ({ token, pos } = findNextToken(instruction, tokens));

    component = pos !== -1 ? instruction.slice(0, pos) : instruction;
    instruction = pos !== -1 ? instruction.slice(pos + token.length) : '';

    tokens.shift(); // parameters
    if (token === '(') {
      ({ token, pos } = findNextToken(instruction, [')']));
      parametersString = instruction.slice(0, pos);
      instruction = instruction.slice(pos + token.length);

      ({ token } = findNextToken(instruction, tokens));
      instruction = instruction.slice(token.length);
    }

    tokens.shift(); // viewport
  }
  if (token === '@') {
    ({ token, pos } = findNextToken(instruction, tokens));
    viewport = pos !== -1 ? instruction.slice(0, pos) : instruction;
    instruction = pos !== -1 ? instruction.slice(pos + token.length) : '';
  }

  tokens.shift(); // noScope
  if (token === '!') {
    scope = false;
  }

  // Restore token that belongs to next instruction
  if (token === ')' || token === '/' || token === '+') {
    instruction = `${token}${instruction}`;
  }

  const viewportInstruction = createViewportInstruction(component, viewport, parametersString, scope);

  return { instruction: viewportInstruction, remaining: instruction };
}

function stringifyAViewportInstruction(
  instruction: ViewportInstruction | string,
  excludeViewport: boolean = false,
  excludeComponent: boolean = false,
): string {
  if (typeof instruction === 'string') {
    return stringifyViewportInstruction(parseViewportInstruction(instruction), excludeViewport, excludeComponent);
  } else {
    let instructionString = !excludeComponent ? instruction.componentName : '';
    const specification = instruction.componentType ? instruction.componentType.parameters : null;
    const parameters = stringifyComponentParameters(instruction.toSortedParameters(specification));
    if (parameters.length > 0) {
      instructionString = `${instructionString}${excludeComponent ? parameters : `(${parameters})`}`;
    }
    if (instruction.viewportName !== null && !excludeViewport) {
      instructionString = `${instructionString}@${instruction.viewportName}`;
    }
    if (!instruction.ownsScope) {
      instructionString = `${instructionString}!`;
    }
    return instructionString || '';
  }
}

export const InstructionResolver = {
  stringifyComponentParameters,
  isClearViewportInstruction,
  isAddViewportInstruction,
  isClearViewportScopeInstruction,
  isClearAllViewportsInstruction,
  isAddAllViewportsInstruction,
  createViewportInstruction,
  createClearViewportInstruction,
  parseViewportInstructions,
  parseViewportInstruction,
  stringifyViewportInstructions,
  stringifyViewportInstruction,
  stringifyScopedViewportInstructions,
  encodeViewportInstructions,
  decodeViewportInstructions,
  buildScopedLink,
  shouldClearViewports,
  mergeViewportInstructions,
  flattenViewportInstructions,
  cloneViewportInstructions,
  parseComponentParameters,
  matchScope,
  matchChildren,
};
