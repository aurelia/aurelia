import { DOM } from '@aurelia/runtime';
import { expect } from 'chai';

export function verifyEqual(actual: any, expected: any): any {
  if (typeof expected === 'symbol') {
    return;
  }
  if (typeof expected !== 'object' || expected === null || expected === undefined) {
    expect(actual).to.equal(expected);
    return;
  }
  if (expected instanceof Array) {
    for (let i = 0; i < expected.length; i++) {
      verifyEqual(actual[i], expected[i]);
    }
    return;
  }
  if (expected instanceof Node) {
    if (expected.nodeType === 11) {
      for (let i = 0; i < expected.childNodes.length; i++) {
        verifyEqual(actual.childNodes.item(i), expected.childNodes.item(i));
      }
    } else {
      expect(actual.outerHTML).to.equal((<any>expected).outerHTML);
    }
    return;
  }

  if (actual) {
    expect(actual.constructor.name).to.equal(expected.constructor.name);
    expect(actual.toString()).to.equal(expected.toString());
    for (const prop of Object.keys(expected)) {
      verifyEqual(actual[prop], expected[prop]);
    }
  }
}

const domParser = <HTMLDivElement>DOM.createElement('div');
export function createElement(markup: string): Node {
  domParser.innerHTML = markup;
  const element = domParser.firstElementChild;
  return element;
}
