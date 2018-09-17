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
export function verifyBindingInstructionsEqual(actual: any, expected: any, path?: string): any {
  if (path === undefined) {
    path = 'instruction';
  }
  if (typeof expected !== 'object' || expected === null || expected === undefined || typeof actual !== 'object' || actual === null || actual === undefined) {
    expect(actual).to.equal(expected, path);
    return;
  }
  if (expected instanceof Array) {
    for (let i = 0, ii = Math.max(expected.length, actual.length); i < ii; ++i) {
      verifyBindingInstructionsEqual(actual[i], expected[i], `${path}[${i}]`);
    }
    return;
  }
  if (expected instanceof Node) {
    if (expected.nodeType === 11) {
      for (let i = 0, ii = Math.max(expected.childNodes.length, actual.childNodes.length); i < ii; ++i) {
        verifyBindingInstructionsEqual(actual.childNodes.item(i), expected.childNodes.item(i), `${path}.childNodes[${i}]`);
      }
    } else {
      expect(actual.outerHTML).to.equal((<any>expected).outerHTML, `${path}.outerHTML`);
    }
    return;
  }

  if (actual) {
    for (const prop of (new Set(Object.keys(expected).concat(Object.keys(actual)))).keys()) {
      verifyBindingInstructionsEqual(actual[prop], expected[prop], `${path}.${prop}`);
    }
  }
}

export { _, stringify, jsonStringify, htmlStringify, verifyEqual, createElement, padRight, massSpy, massStub, massReset, massRestore, ensureNotCalled, eachCartesianJoin, eachCartesianJoinFactory };
