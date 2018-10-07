import { Unparser } from './../../../debug/src/binding/unparser';
import { _, stringify, jsonStringify, htmlStringify, verifyEqual, createElement, padRight, massSpy, massStub, massReset, massRestore, ensureNotCalled, eachCartesianJoin, eachCartesianJoinFactory } from '../../../../scripts/test-lib';
import { h } from '../../../../scripts/test-lib-dom';
import { expect } from 'chai';

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
  actual = Unparser.unparse(actual);
  expected = Unparser.unparse(expected);
  if (actual !== expected) {
    expect(actual).to.equal(expected);
  }
}


export { _, h, stringify, jsonStringify, htmlStringify, verifyEqual, createElement, padRight, massSpy, massStub, massReset, massRestore, ensureNotCalled, eachCartesianJoin, eachCartesianJoinFactory };
