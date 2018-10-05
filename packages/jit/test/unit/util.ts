import { Unparser, Serializer } from './../../../debug/src/binding/unparser';
import { _, stringify, jsonStringify, htmlStringify, verifyEqual, createElement, padRight, massSpy, massStub, massReset, massRestore, ensureNotCalled, eachCartesianJoin, eachCartesianJoinFactory } from '../../../../scripts/test-lib';
import { expect } from 'chai';

const emptyArray = [];

export function h<T extends keyof HTMLElementTagNameMap, TChildren extends (string | number | boolean | null | undefined | Node)[]>(
  name: T,
  attrs: Record<string, any> = null,
  ...children: TChildren
) {
  let el = document.createElement<T>(name);
  for (let attr in attrs) {
    if (attr === 'class' || attr === 'className' || attr === 'cls') {
      let value: string[] = attrs[attr];
      value = value === undefined || value === null
        ? emptyArray
        : Array.isArray(value)
          ? value
          : ('' + value).split(' ');
      el.classList.add(...value.filter(Boolean));
    } else if (attr in el || attr === 'data' || attr[0] === '_') {
      el[attr] = attrs[attr];
    } else {
      el.setAttribute(attr, attrs[attr]);
    }
  }
  let childrenCt = el.tagName === 'TEMPLATE' ? (el as HTMLTemplateElement).content : el;
  for (let child of children) {
    if (child === null || child === undefined) {
      continue;
    }
    childrenCt.appendChild(isNodeOrTextOrComment(child)
      ? child
      : document.createTextNode('' + child)
    );
  }
  return el;
}

function isNodeOrTextOrComment(obj: any): obj is Text | Comment | Node {
  return obj instanceof Node || obj instanceof Text || obj instanceof Comment;
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
    expected = Serializer.serialize(expected);
    expect(actual).to.equal(expected);
  } else {
    actual = Serializer.serialize(actual);
    expected = Serializer.serialize(expected);
    if (actual !== expected) {
      expect(actual).to.equal(expected);
    }
  }
}


export { _, stringify, jsonStringify, htmlStringify, verifyEqual, createElement, padRight, massSpy, massStub, massReset, massRestore, ensureNotCalled, eachCartesianJoin, eachCartesianJoinFactory };
