import { DOM } from '@aurelia/runtime';
import { expect } from 'chai';

export function verifyEqual(actual: any, expected: any, depth?: number, property?: string, index?: number): any {
  if (depth === undefined) {
    depth = 0;
  }
  if (typeof expected !== 'object' || expected === null || expected === undefined) {
    expect(actual).to.equal(expected, `depth=${depth}, prop=${property}, index=${index}`);
    return;
  }
  if (expected instanceof Array) {
    for (let i = 0; i < expected.length; i++) {
      verifyEqual(actual[i], expected[i], depth+1, property, i);
    }
    return;
  }
  if (expected instanceof Node) {
    if (expected.nodeType === 11) {
      for (let i = 0; i < expected.childNodes.length; i++) {
        verifyEqual(actual.childNodes.item(i), expected.childNodes.item(i), depth+1, property, i);
      }
    } else {
      expect(actual.outerHTML).to.equal((<any>expected).outerHTML, `depth=${depth}, prop=${property}, index=${index}`);
    }
    return;
  }

  if (actual) {
    expect(actual.constructor.name).to.equal(expected.constructor.name, `depth=${depth}, prop=${property}, index=${index}`);
    expect(actual.toString()).to.equal(expected.toString(), `depth=${depth}, prop=${property}, index=${index}`);
    for (const prop of Object.keys(expected)) {
      verifyEqual(actual[prop], expected[prop], depth+1, prop, index);
    }
  }
}

const domParser = <HTMLDivElement>DOM.createElement('div');
export function createElement(markup: string): Node {
  domParser.innerHTML = markup;
  const element = domParser.firstElementChild;
  return element;
}
