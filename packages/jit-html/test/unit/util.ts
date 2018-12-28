import {
  IAttributeSymbol,
  INodeSymbol,
  ISymbol
} from '@aurelia/jit';
import {
  ITraceInfo,
  PLATFORM,
  Tracer
} from '@aurelia/kernel';
import {
  stringifyLifecycleFlags,
  TargetedInstructionType
} from '@aurelia/runtime';
import { HTMLTargetedInstructionType } from '@aurelia/runtime-html';
import {
  _,
  eachCartesianJoin,
  eachCartesianJoinFactory,
  ensureNotCalled,
  htmlStringify,
  jsonStringify,
  massReset,
  massRestore,
  massSpy,
  massStub,
  padRight,
  stringify,
  verifyEqual
} from '../../../../scripts/test-lib';
import {
  createElement,
  h
} from '../../../../scripts/test-lib-dom';
import {
  Tracer as DebugTracer
} from '../../../debug/src/index';

export const SymbolTraceWriter = {
  write(info: ITraceInfo): void {
    let output: string = '(';
    const params = info.params;
    for (let i = 0, ii = params.length; i < ii; ++i) {
      const p = info.params[i];
      switch (typeof p) {
        case 'string':
        case 'boolean':
          output += p.toString();
          break;
        case 'number':
          output += p > 0 ? `flags=${stringifyLifecycleFlags(p)}` : '0';
          break;
        case 'object':
          if (p === null) {
            output += 'null';
          } else {
            if ((p as ISymbol).kind) {
              const symbol = p as INodeSymbol | IAttributeSymbol;
              if ('attr' in symbol) {
                output += `attr: ${symbol.attr.name}=${symbol.attr.value}`;
              } else if ('text' in symbol) {
                output += `text: "${symbol.text.textContent}"`;
              } else {
                output += `element: ${symbol.element.outerHTML}`;
              }
            } else {
              if ('outerHTML' in (p as HTMLElement)) {
                const el = p as HTMLElement;
                output += `${Object.getPrototypeOf(el).constructor.name}=${el.outerHTML}`;
              } else {
                output += `[Object ${Object.getPrototypeOf(p).constructor.name || 'anonymous'}]`;
              }
            }
          }
          break;
        case 'undefined':
          output += 'undefined';
          break;
        default:
          output += '?';
      }
      if (i + 1 < ii) {
        output += ', ';
      }
    }
    output += ')';
    console.debug(`${'  '.repeat(info.depth)}${info.name} - ${output}`);
  }
};

const RuntimeTracer = { ...Tracer };
export function enableTracing() {
  Object.assign(Tracer, DebugTracer);
  Tracer.enabled = true;
}
export function disableTracing() {
  Tracer.flushAll(null);
  Object.assign(Tracer, RuntimeTracer);
  Tracer.enabled = false;
}

export function targetedInstructionTypeName(type: string): string {
  switch (type) {
    case HTMLTargetedInstructionType.textBinding:
      return 'textBinding';
    case TargetedInstructionType.interpolation:
      return 'interpolation';
    case TargetedInstructionType.propertyBinding:
      return 'propertyBinding';
    case TargetedInstructionType.iteratorBinding:
      return 'iteratorBinding';
    case HTMLTargetedInstructionType.listenerBinding:
      return 'listenerBinding';
    case TargetedInstructionType.callBinding:
      return 'callBinding';
    case TargetedInstructionType.refBinding:
      return 'refBinding';
    case HTMLTargetedInstructionType.stylePropertyBinding:
      return 'stylePropertyBinding';
    case TargetedInstructionType.setProperty:
      return 'setProperty';
    case HTMLTargetedInstructionType.setAttribute:
      return 'setAttribute';
    case TargetedInstructionType.hydrateElement:
      return 'hydrateElement';
    case TargetedInstructionType.hydrateAttribute:
      return 'hydrateAttribute';
    case TargetedInstructionType.hydrateTemplateController:
      return 'hydrateTemplateController';
    case TargetedInstructionType.hydrateLetElement:
      return 'hydrateLetElement';
    case TargetedInstructionType.letBinding:
      return 'letBinding';
    default:
      return type;
  }
}

export function verifyBindingInstructionsEqual(actual: any, expected: any, errors?: string[], path?: string): any {
  if (path === undefined) {
    path = 'instruction';
  }
  if (errors === undefined) {
    errors = [];
  }
  if (typeof expected !== 'object' || expected === null || expected === undefined || typeof actual !== 'object' || actual === null || actual === undefined) {
    if (actual !== expected) {
      if (typeof expected === 'object' && expected !== null) {
        expected = JSON.stringify(expected);
      }
      if (typeof actual === 'object' && actual !== null) {
        actual = JSON.stringify(actual);
      }
      if (path.endsWith('type')) {
        expected = targetedInstructionTypeName(expected);
        actual = targetedInstructionTypeName(actual);
      }
      errors.push(`WRONG: ${path} === ${actual} (expected: ${expected})`);
    } else {
      errors.push(`OK   : ${path} === ${expected}`);
    }
  } else if (expected instanceof Array) {
    for (let i = 0, ii = Math.max(expected.length, actual.length); i < ii; ++i) {
      verifyBindingInstructionsEqual(actual[i], expected[i], errors, `${path}[${i}]`);
    }
  } else if (expected instanceof Node) {
    if (expected.nodeType === 11) {
      for (let i = 0, ii = Math.max(expected.childNodes.length, actual.childNodes.length); i < ii; ++i) {
        verifyBindingInstructionsEqual(actual.childNodes.item(i), expected.childNodes.item(i), errors, `${path}.childNodes[${i}]`);
      }
    } else {
      if (actual.outerHTML !== expected['outerHTML']) {
        errors.push(`WRONG: ${path}.outerHTML === ${actual.outerHTML} (expected: ${expected['outerHTML']})`);
      } else {
        errors.push(`OK   : ${path}.outerHTML === ${expected}`);
      }
    }
  } else if (actual) {
    const seen = {};
    for (const prop in expected) {
      verifyBindingInstructionsEqual(actual[prop], expected[prop], errors, `${path}.${prop}`);
      seen[prop] = true;
    }
    for (const prop in actual) {
      if (!seen[prop]) {
        verifyBindingInstructionsEqual(actual[prop], expected[prop], errors, `${path}.${prop}`);
      }
    }
  }
  if (path === 'instruction' && errors.some(e => e[0] === 'W')) {
    throw new Error('Failed assertion: binding instruction mismatch\n  - ' + errors.join('\n  - '));
  }
}

export { _, h, stringify, jsonStringify, htmlStringify, verifyEqual, createElement, padRight, massSpy, massStub, massReset, massRestore, ensureNotCalled, eachCartesianJoin, eachCartesianJoinFactory };
