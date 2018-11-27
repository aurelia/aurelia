import { Unparser, Serializer } from './../../../debug/src/binding/unparser';
import { _, stringify, jsonStringify, htmlStringify, verifyEqual, createElement, padRight, massSpy, massStub, massReset, massRestore, ensureNotCalled, eachCartesianJoin, eachCartesianJoinFactory } from '../../../../scripts/test-lib';
import { h } from '../../../../scripts/test-lib-dom';
import { expect } from 'chai';
import {
  Tracer as DebugTracer
} from '../../../debug/src/index';
import {
  Tracer, ITraceInfo
} from '../../../kernel/src/index';
import { NodeSymbol, AttributeSymbol, ISymbol } from '../../src/index';



export const SymbolTraceWriter = {
  write(info: ITraceInfo): void {
    let output: string = '';

    if (info.params.length > 0 && info.params[0]) {
      const p = info.params[0];
      if ((<ISymbol>p).kind) {
        const symbol = info.params[0] as NodeSymbol | AttributeSymbol;
        if ('attr' in symbol) {
          output = `attr: ${symbol.attr.name}=${symbol.attr.value}`;
        } else if ('text' in symbol) {
          output = `text: "${symbol.text.textContent}"`;
        } else {
          output = `element: ${symbol.element.outerHTML}`;
        }
      } else if (typeof p !== 'object') {
        output = p;
      }
    }
    console.debug(`${' '.repeat(info.depth)}${info.name} ${output}`);
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
      errors.push(`Expected ${path} === ${expected}, but got: ${actual}`)
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
        errors.push(`Expected ${path}.outerHTML === ${expected['outerHTML']}, but got: ${actual.outerHTML}`)
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
  if (path === 'instruction' && errors.length) {
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
