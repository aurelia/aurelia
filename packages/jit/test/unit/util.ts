import { Unparser, Serializer } from './../../../debug/src/binding/unparser';
import { _, stringify, jsonStringify, htmlStringify, verifyEqual, createElement, padRight, massSpy, massStub, massReset, massRestore, ensureNotCalled, eachCartesianJoin, eachCartesianJoinFactory } from '../../../../scripts/test-lib';
import { h } from '../../../../scripts/test-lib-dom';
import { expect } from 'chai';
import {
  Tracer as DebugTracer
} from '../../../debug/src/index';
import {
  Tracer, ITraceInfo, PLATFORM
} from '../../../kernel/src/index';
import {
  stringifyLifecycleFlags, IHTMLElement, isTargetedInstruction, TargetedInstructionType
} from '../../../runtime/src/index';
import { NodeSymbol, AttributeSymbol, ISymbol } from '../../src/index';



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
            if ((<ISymbol>p).kind) {
              const symbol = p as NodeSymbol | AttributeSymbol;
              if ('attr' in symbol) {
                output += `attr: ${symbol.attr.name}=${symbol.attr.value}`;
              } else if ('text' in symbol) {
                output += `text: "${symbol.text.textContent}"`;
              } else {
                output += `element: ${symbol.element.outerHTML}`;
              }
            } else {
              if ('outerHTML' in (p as IHTMLElement)) {
                const el = p as IHTMLElement;
                output += `${Object.getPrototypeOf(el).constructor.name}=${el.outerHTML}`
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
    case TargetedInstructionType.textBinding:
      return 'textBinding';
    case TargetedInstructionType.interpolation:
      return 'interpolation';
    case TargetedInstructionType.propertyBinding:
      return 'propertyBinding';
    case TargetedInstructionType.iteratorBinding:
      return 'iteratorBinding';
    case TargetedInstructionType.listenerBinding:
      return 'listenerBinding';
    case TargetedInstructionType.callBinding:
      return 'callBinding';
    case TargetedInstructionType.refBinding:
      return 'refBinding';
    case TargetedInstructionType.stylePropertyBinding:
      return 'stylePropertyBinding';
    case TargetedInstructionType.setProperty:
      return 'setProperty';
    case TargetedInstructionType.setAttribute:
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
    throw new Error('Failed assertion: binding instruction mismatch\n  - '+errors.join('\n  - '));
  }
}
export function verifyASTEqual(actual: any, expected: any, errors?: string[], path?: string): any {
  if (expected === null) {
    if (actual !== null) {
      expect(actual).to.be.null;
    }
  } else if (actual === null) {
    const expectedSerialized = Serializer.serialize(expected);
    expect(actual).to.equal(expectedSerialized);
  } else {
    const expectedSerialized = Serializer.serialize(expected);
    const expectedUnparsed = Unparser.unparse(expected);
    const actualSerialized = Serializer.serialize(actual);
    const actualUnparsed = Unparser.unparse(actual);
    if (actualSerialized !== expectedSerialized) {
      expect(actualSerialized).to.equal(expectedSerialized);
    }
    if (actualUnparsed !== expectedUnparsed) {
      expect(actualUnparsed).to.equal(expectedUnparsed);
    }
  }
}


export { _, h, stringify, jsonStringify, htmlStringify, verifyEqual, createElement, padRight, massSpy, massStub, massReset, massRestore, ensureNotCalled, eachCartesianJoin, eachCartesianJoinFactory };
