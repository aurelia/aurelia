import { expect } from "chai";

const toStringTag = Object.prototype.toString;

/**
 * Template tag function that properly stringifies the template parameters. Currently supports:
 *
 * - undefined
 * - null
 * - boolean
 * - number
 * - Array (recurses through the items and wraps them in brackets)
 * - Event (returns the type name)
 * - Node (returns textContent or innerHTML)
 */
export function _(strings: TemplateStringsArray, ...vars: any[]): string {
  let retVal = '';
  const length = vars.length;
  for (let i = 0; i < length; ++i) {
    retVal = retVal + strings[i] + stringify(vars[i]);
  }
  return retVal + strings[length];
}

const newline = /\r?\n/g;

/**
 * stringify primitive value (null -> 'null' and undefined -> 'undefined') or complex values with recursion guard
 */
export function stringify(value: any): string {
  const type = toStringTag.call(value);
  switch (type) {
    case '[object Undefined]':
      return 'undefined';
    case '[object Null]':
      return 'null';
    case '[object String]':
      return `'${value}'`;
    case '[object Boolean]':
    case '[object Number]':
      return value;
    case '[object Array]':
      return `[${value.map(i => stringify(i)).join(',')}]`;
    case '[object Event]':
      return `'${value.type}'`;
    default:
      return jsonStringify(value);
  }
}

export function jsonStringify(o: any): string {
  let cache = [];
  const result = JSON.stringify(o, function(key, value) {
    if (typeof value === 'object' && value !== null) {
      if (value instanceof Node) {
        return htmlStringify(value);
      }
      if (cache.indexOf(value) !== -1) {
        try {
          return JSON.parse(JSON.stringify(value));
        } catch (error) {
          return;
        }
      }
      cache.push(value);
    }
    return value;
  });
  cache = null;
  return result.replace(newline, '');
}

export function htmlStringify(node: Node): string {
  if (node.textContent.length || node instanceof Text || node instanceof Comment) {
    return node.textContent.replace(newline, '');
  }
  if (node instanceof Element) {
    if (node.innerHTML.length) {
      return node.innerHTML.replace(newline, '');
    }
    if (node.nodeName === 'TEMPLATE') {
      return htmlStringify((<HTMLTemplateElement>node).content);
    }
  }
  let val = '';
  for (let i = 0, ii = node.childNodes.length; i < ii; ++i) {
    const child = node.childNodes[i];
    val += htmlStringify(child);
  }
  return val;
}

/**
 * pad a string with spaces on the right-hand side until it's the specified length
 */
export function padRight(str: any, len: number): string {
  str = str + '';
  const strLen = str.length;
  if (strLen >= len) {
    return str;
  }
  return str + new Array(len - strLen + 1).join(' ');
}

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

// lazy initializing this in case the consuming test doesn't need this and doesn't have DOM available
let domParser: HTMLDivElement;
export function createElement(markup: string): Node {
  if (domParser === undefined) {
    domParser = document.createElement('div');
  }
  domParser.innerHTML = markup;
  const element = domParser.firstElementChild;
  return element;
}
