import { spy, SinonStub } from 'sinon';
import { expect } from "chai";
import sinon from 'sinon';

const toStringTag = Object.prototype.toString;

const wrappedObjects = new Map<any, string[]>();

export function massSpy(obj: any, ...properties: string[]): void {
  if (properties.length === 0) {
    for (const prop in obj) {
      if (typeof obj[prop] === 'function') {
        if (obj[prop].restore) {
          obj[prop].restore();
        }
        spy(obj, prop);
      }
    }
  } else {
    for (let i = 0, ii = properties.length; i < ii; ++i) {
      const prop = properties[i];
      if (obj[prop].restore) {
        obj[prop].restore();
      }
      spy(obj, prop);
    }
  }
}

export function ensureNotCalled(obj: any, ...properties: string[]): void {
  massStub(obj, (stub, prop) => stub.throws(`${obj.constructor.name}.${prop} should not be called`), ...properties);
}

export function massStub(obj: any, configure: (stub: SinonStub, prop: string) => void, ...properties: string[]): void {
  if (properties.length === 0) {
    for (const prop in obj) {
      if (typeof obj[prop] === 'function') {
        if (obj[prop].restore) {
          obj[prop].restore();
        }
        configure(sinon.stub(obj, prop), prop);
      }
    }
  } else {
    for (let i = 0, ii = properties.length; i < ii; ++i) {
      const prop = properties[i];
      if (obj[prop].restore) {
        obj[prop].restore();
      }
      configure(sinon.stub(obj, prop), prop);
    }
  }
}

export function massRestore(obj: any, ...properties: string[]): void {
  if (properties.length === 0) {
    for (const prop in obj) {
      if (typeof obj[prop] === 'function') {
        if (obj[prop].restore) {
          obj[prop].restore();
        }
      }
    }
  } else {
    for (let i = 0, ii = properties.length; i < ii; ++i) {
      const prop = properties[i];
      if (obj[prop].restore) {
        obj[prop].restore();
      }
    }
  }
}

export function massReset(obj: any, ...properties: string[]): void {
  if (properties.length === 0) {
    for (const prop in obj) {
      if (typeof obj[prop] === 'function') {
        if (obj[prop].resetHistory) {
          obj[prop].resetHistory();
        }
      }
    }
  } else {
    for (let i = 0, ii = properties.length; i < ii; ++i) {
      const prop = properties[i];
      if (obj[prop].resetHistory) {
        obj[prop].resetHistory();
      }
    }
  }
}

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
 * - Object (returns json representation)
 * - Class constructor (returns class name)
 * - Instance of custom class (returns class name + json representation)
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
const whitespace = /\s+/g;

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
    case '[object Object]':
    {
      const proto = Object.getPrototypeOf(value);
      if (!proto || !proto.constructor || proto.constructor.name === 'Object') {
        return jsonStringify(value);
      }
      return `class ${proto.constructor.name}${jsonStringify(value)}`;
    }
    case '[object Function]':
      if (value.name && value.name.length) {
        return `class ${value.name}`;
      }
      return value.toString().replace(whitespace, '');
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

export function lazyProduct(sets: any[][], f: (...args: any[]) => void, context?: any): void {
  if (context === undefined) {
    context = this;
  }
  const product = [];
  const max = sets.length - 1;
  const lens = [];
  for (let i = sets.length; i--; ) {
    lens[i] = sets[i].length;
  }

  function dive(depth: number): void {
    const a = sets[depth];
    const len = lens[depth];
    if (depth == max) {
      for (let i = 0; i < len; ++i) {
        product[depth] = a[i];
        f.apply(context, product);
      }
    } else {
      for (let i = 0; i < len; ++i) {
        product[depth] = a[i];
        dive(depth + 1);
      }
    }
    product.pop();
  }
  dive(0);
}

const returnTrue = () => true;
const pdCache = new Map<Object, PropertyDescriptorMap>();
const filterCache = new Map<string, Map<Object, PropertyDescriptorMap>>();

export function getAllPropertyDescriptors(proto: Object, filter: (pd: PropertyDescriptor) => boolean = returnTrue): PropertyDescriptorMap {
  if (filter === returnTrue) {
    let pdMap = pdCache.get(proto);
    if (pdMap === undefined) {
      pdMap = $getAllPropertyDescriptors(proto, filter);
      pdCache.set(proto, pdMap);
    }
    return pdMap;
  } else {
    const filterStr = filter.toString();
    let pdCache = filterCache.get(filterStr);
    let pdMap;
    if (pdCache === undefined) {
      pdCache = new Map();
      filterCache.set(filterStr, pdCache);
      pdMap = $getAllPropertyDescriptors(proto, filter);
      pdCache.set(proto, pdMap);
    } else {
      pdMap = pdCache.get(proto);
      if (pdMap === undefined) {
        pdMap = $getAllPropertyDescriptors(proto, filter);
        pdCache.set(proto, pdMap);
      }
    }
    return pdMap;
  }
}

function $getAllPropertyDescriptors(proto: Object, filter: (pd: PropertyDescriptor) => boolean = returnTrue): PropertyDescriptorMap {
  const allDescriptors: PropertyDescriptorMap = {};
  while (proto !== Object.prototype) {
    const descriptors = Object.getOwnPropertyDescriptors(proto);
    for (const prop in descriptors) {
      if (allDescriptors.hasOwnProperty(prop)) {
        continue;
      }
      const descriptor = descriptors[prop];
      if (filter(descriptor)) {
        allDescriptors[prop] = descriptor;
      }
    }
    proto = Object.getPrototypeOf(proto);
  }
  return allDescriptors;
}


export function eachCartesianJoinFactory<T1, U>(
  arrays: [(()=>T1)[]],
  callback: (arg1: T1) => U): void;

export function eachCartesianJoinFactory<T1, T2, U>(
  arrays: [(()=>T1)[], ((arg1: T1)=>T2)[]],
  callback: (arg1: T1, arg2: T2) => U): void;

export function eachCartesianJoinFactory<T1, T2, T3, U>(
  arrays: [(()=>T1)[], ((arg1: T1)=>T2)[], ((arg1: T1, arg2: T2)=>T3)[]],
  callback: (arg1: T1, arg2: T2, arg3: T3) => U): void;

export function eachCartesianJoinFactory<T1, T2, T3, T4, U>(
  arrays: [(()=>T1)[], ((arg1: T1)=>T2)[], ((arg1: T1, arg2: T2)=>T3)[], ((arg1: T1, arg2: T2, arg3: T3)=>T4)[]],
  callback: (arg1: T1, arg2: T2, arg3: T3, arg4: T4) => U): void;

export function eachCartesianJoinFactory<T1, T2, T3, T4, T5, U>(
  arrays: [(()=>T1)[], ((arg1: T1)=>T2)[], ((arg1: T1, arg2: T2)=>T3)[], ((arg1: T1, arg2: T2, arg3: T3)=>T4)[], ((arg1: T1, arg2: T2, arg3: T3, arg4: T4)=>T5)[]],
  callback: (arg1: T1, arg2: T2, arg3: T3, arg4: T4, arg5: T5) => U): void

export function eachCartesianJoinFactory<T1, T2, T3, T4, T5, T6, U>(
  arrays: [(()=>T1)[], ((arg1: T1)=>T2)[], ((arg1: T1, arg2: T2)=>T3)[], ((arg1: T1, arg2: T2, arg3: T3)=>T4)[], ((arg1: T1, arg2: T2, arg3: T3, arg4: T4)=>T5)[], ((arg1: T1, arg2: T2, arg3: T3, arg4: T4, arg5: T5)=>T6)[]],
  callback: (arg1: T1, arg2: T2, arg3: T3, arg4: T4, arg5: T5, arg6: T6) => U): void;

export function eachCartesianJoinFactory<T1, T2, T3, T4, T5, T6, T7, U>(
  arrays: [(()=>T1)[], ((arg1: T1)=>T2)[], ((arg1: T1, arg2: T2)=>T3)[], ((arg1: T1, arg2: T2, arg3: T3)=>T4)[], ((arg1: T1, arg2: T2, arg3: T3, arg4: T4)=>T5)[], ((arg1: T1, arg2: T2, arg3: T3, arg4: T4, arg5: T5)=>T6)[], ((arg1: T1, arg2: T2, arg3: T3, arg4: T4, arg5: T5, arg6: T6)=>T7)[]],
  callback: (arg1: T1, arg2: T2, arg3: T3, arg4: T4, arg5: T5, arg6: T6, arg7: T7) => U): void;

export function eachCartesianJoinFactory<T1, T2, T3, T4, T5, T6, T7, T8, U>(
  arrays: [(()=>T1)[], ((arg1: T1)=>T2)[], ((arg1: T1, arg2: T2)=>T3)[], ((arg1: T1, arg2: T2, arg3: T3)=>T4)[], ((arg1: T1, arg2: T2, arg3: T3, arg4: T4)=>T5)[], ((arg1: T1, arg2: T2, arg3: T3, arg4: T4, arg5: T5)=>T6)[], ((arg1: T1, arg2: T2, arg3: T3, arg4: T4, arg5: T5, arg6: T6)=>T7)[], ((arg1: T1, arg2: T2, arg3: T3, arg4: T4, arg5: T5, arg6: T6, arg7: T7)=>T8)[]],
  callback: (arg1: T1, arg2: T2, arg3: T3, arg4: T4, arg5: T5, arg6: T6, arg7: T7, arg8: T8) => U): void;

export function eachCartesianJoinFactory<T1, T2, T3, T4, T5, T6, T7, T8, T9, U>(
  arrays: [(()=>T1)[], ((arg1: T1)=>T2)[], ((arg1: T1, arg2: T2)=>T3)[], ((arg1: T1, arg2: T2, arg3: T3)=>T4)[], ((arg1: T1, arg2: T2, arg3: T3, arg4: T4)=>T5)[], ((arg1: T1, arg2: T2, arg3: T3, arg4: T4, arg5: T5)=>T6)[], ((arg1: T1, arg2: T2, arg3: T3, arg4: T4, arg5: T5, arg6: T6)=>T7)[], ((arg1: T1, arg2: T2, arg3: T3, arg4: T4, arg5: T5, arg6: T6, arg7: T7)=>T8)[], ((arg1: T1, arg2: T2, arg3: T3, arg4: T4, arg5: T5, arg6: T6, arg7: T7, arg8: T8)=>T9)[]],
  callback: (arg1: T1, arg2: T2, arg3: T3, arg4: T4, arg5: T5, arg6: T6, arg7: T7, arg8: T8, arg9: T9) => U): void;

export function eachCartesianJoinFactory<T1, T2, T3, T4, T5, T6, T7, T8, T9, T10, U>(
  arrays: [(()=>T1)[], ((arg1: T1)=>T2)[], ((arg1: T1, arg2: T2)=>T3)[], ((arg1: T1, arg2: T2, arg3: T3)=>T4)[], ((arg1: T1, arg2: T2, arg3: T3, arg4: T4)=>T5)[], ((arg1: T1, arg2: T2, arg3: T3, arg4: T4, arg5: T5)=>T6)[], ((arg1: T1, arg2: T2, arg3: T3, arg4: T4, arg5: T5, arg6: T6)=>T7)[], ((arg1: T1, arg2: T2, arg3: T3, arg4: T4, arg5: T5, arg6: T6, arg7: T7)=>T8)[], ((arg1: T1, arg2: T2, arg3: T3, arg4: T4, arg5: T5, arg6: T6, arg7: T7, arg8: T8)=>T9)[], ((arg1: T1, arg2: T2, arg3: T3, arg4: T4, arg5: T5, arg6: T6, arg7: T7, arg8: T8, arg9: T9)=>T10)[]],
  callback: (arg1: T1, arg2: T2, arg3: T3, arg4: T4, arg5: T5, arg6: T6, arg7: T7, arg8: T8, arg9: T9, arg10: T10) => U): void;

export function eachCartesianJoinFactory<T1, T2, T3, T4, T5, T6, T7, T8, T9, T10, T11, U>(
  arrays: [(()=>T1)[], ((arg1: T1)=>T2)[], ((arg1: T1, arg2: T2)=>T3)[], ((arg1: T1, arg2: T2, arg3: T3)=>T4)[], ((arg1: T1, arg2: T2, arg3: T3, arg4: T4)=>T5)[], ((arg1: T1, arg2: T2, arg3: T3, arg4: T4, arg5: T5)=>T6)[], ((arg1: T1, arg2: T2, arg3: T3, arg4: T4, arg5: T5, arg6: T6)=>T7)[], ((arg1: T1, arg2: T2, arg3: T3, arg4: T4, arg5: T5, arg6: T6, arg7: T7)=>T8)[], ((arg1: T1, arg2: T2, arg3: T3, arg4: T4, arg5: T5, arg6: T6, arg7: T7, arg8: T8)=>T9)[], ((arg1: T1, arg2: T2, arg3: T3, arg4: T4, arg5: T5, arg6: T6, arg7: T7, arg8: T8, arg9: T9)=>T10)[], ((arg1: T1, arg2: T2, arg3: T3, arg4: T4, arg5: T5, arg6: T6, arg7: T7, arg8: T8, arg9: T9, arg10: T10)=>T11)[]],
  callback: (arg1: T1, arg2: T2, arg3: T3, arg4: T4, arg5: T5, arg6: T6, arg7: T7, arg8: T8, arg9: T9, arg10: T10, arg11: T11) => U): void;

export function eachCartesianJoinFactory<T1, T2, T3, T4, T5, T6, T7, T8, T9, T10, T11, T12, U>(
  arrays: [(()=>T1)[], ((arg1: T1)=>T2)[], ((arg1: T1, arg2: T2)=>T3)[], ((arg1: T1, arg2: T2, arg3: T3)=>T4)[], ((arg1: T1, arg2: T2, arg3: T3, arg4: T4)=>T5)[], ((arg1: T1, arg2: T2, arg3: T3, arg4: T4, arg5: T5)=>T6)[], ((arg1: T1, arg2: T2, arg3: T3, arg4: T4, arg5: T5, arg6: T6)=>T7)[], ((arg1: T1, arg2: T2, arg3: T3, arg4: T4, arg5: T5, arg6: T6, arg7: T7)=>T8)[], ((arg1: T1, arg2: T2, arg3: T3, arg4: T4, arg5: T5, arg6: T6, arg7: T7, arg8: T8)=>T9)[], ((arg1: T1, arg2: T2, arg3: T3, arg4: T4, arg5: T5, arg6: T6, arg7: T7, arg8: T8, arg9: T9)=>T10)[], ((arg1: T1, arg2: T2, arg3: T3, arg4: T4, arg5: T5, arg6: T6, arg7: T7, arg8: T8, arg9: T9, arg10: T10)=>T11)[], ((arg1: T1, arg2: T2, arg3: T3, arg4: T4, arg5: T5, arg6: T6, arg7: T7, arg8: T8, arg9: T9, arg10: T10, arg11: T11)=>T12)[]],
  callback: (arg1: T1, arg2: T2, arg3: T3, arg4: T4, arg5: T5, arg6: T6, arg7: T7, arg8: T8, arg9: T9, arg10: T10, arg11: T11, arg12: T12) => U): void;

export function eachCartesianJoinFactory<T extends any, U>(
  arrays: ((...args: T[]) => T)[][],
  callback: (...args: any[]) => U): void {

  arrays = arrays.slice(0).filter(arr => arr.length > 0);
  if (typeof callback !== 'function') {
    throw new Error('Callback is not a function');
  }
  if (arrays.length === 0) {
    return;
  }
  const totalCallCount: number = arrays.reduce((count: number, arr: ((...args: T[])=>T)[]) => count *= arr.length, 1);
  const argsIndices = Array(arrays.length).fill(0);
  const args: T[] = updateElementByIndicesFactory(arrays, Array(arrays.length), argsIndices);
  callback(...args);
  let callCount = 1;
  if (totalCallCount === callCount) {
    return;
  }
  while (true) {
    const hasUpdate = updateIndices(arrays, argsIndices);
    if (hasUpdate) {
      callback(...updateElementByIndicesFactory(arrays, args, argsIndices));
      callCount++;
      if (totalCallCount < callCount) {
        throw new Error('Invalid loop implementation.');
      }
    } else {
      break;
    }
  }
}
function updateElementByIndicesFactory<T extends any>(arrays: ((...args: T[])=>T)[][], args: T[], indices: number[]): T[] {
  for (let i = 0, ii = arrays.length; ii > i; ++i) {
    args[i] = arrays[i][indices[i]](...args);
  }
  return args;
}

export function eachCartesianJoin<T1, U>(
  arrays: [T1[]],
  callback: (arg1: T1) => U): void;

export function eachCartesianJoin<T1, T2, U>(
  arrays: [T1[], T2[]],
  callback: (arg1: T1, arg2: T2) => U): void;

export function eachCartesianJoin<T1, T2, T3, U>(
  arrays: [T1[], T2[], T3[]],
  callback: (arg1: T1, arg2: T2, arg3: T3) => U): void;

export function eachCartesianJoin<T1, T2, T3, T4, U>(
  arrays: [T1[], T2[], T3[], T4[]],
  callback: (arg1: T1, arg2: T2, arg3: T3, arg4: T4) => U): void;

export function eachCartesianJoin<T1, T2, T3, T4, T5, U>(
  arrays: [T1[], T2[], T3[], T4[], T5[]],
  callback: (arg1: T1, arg2: T2, arg3: T3, arg4: T4, arg5: T5) => U): void

export function eachCartesianJoin<T1, T2, T3, T4, T5, T6, U>(
  arrays: [T1[], T2[], T3[], T4[], T5[], T6[]],
  callback: (arg1: T1, arg2: T2, arg3: T3, arg4: T4, arg5: T5, arg6: T6) => U): void;

export function eachCartesianJoin<T1, T2, T3, T4, T5, T6, T7, U>(
  arrays: [T1[], T2[], T3[], T4[], T5[], T6[], T7[]],
  callback: (arg1: T1, arg2: T2, arg3: T3, arg4: T4, arg5: T5, arg6: T6, arg7: T7) => U): void;

export function eachCartesianJoin<T1, T2, T3, T4, T5, T6, T7, T8, U>(
  arrays: [T1[], T2[], T3[], T4[], T5[], T6[], T7[], T8[]],
  callback: (arg1: T1, arg2: T2, arg3: T3, arg4: T4, arg5: T5, arg6: T6, arg7: T7, arg8: T8) => U): void;

export function eachCartesianJoin<T1, T2, T3, T4, T5, T6, T7, T8, T9, U>(
  arrays: [T1[], T2[], T3[], T4[], T5[], T6[], T7[], T8[], T9[]],
  callback: (arg1: T1, arg2: T2, arg3: T3, arg4: T4, arg5: T5, arg6: T6, arg7: T7, arg8: T8, arg9: T9) => U): void;

export function eachCartesianJoin<T extends any, U>(
  arrays: T[][],
  callback: (...args: any[]) => U): void {

  arrays = arrays.slice(0).filter(arr => arr.length > 0);
  if (typeof callback !== 'function') {
    throw new Error('Callback is not a function');
  }
  if (arrays.length === 0) {
    return;
  }
  const totalCallCount: number = arrays.reduce((count: number, arr: T[]) => count *= arr.length, 1);
  const argsIndices = Array(arrays.length).fill(0);
  const args: T[] = updateElementByIndices(arrays, Array(arrays.length), argsIndices);
  callback(...args);
  let callCount = 1;
  if (totalCallCount === callCount) {
    return;
  }
  while (true) {
    const hasUpdate = updateIndices(arrays, argsIndices);
    if (hasUpdate) {
      callback(...updateElementByIndices(arrays, args, argsIndices));
      callCount++;
      if (totalCallCount < callCount) {
        throw new Error('Invalid loop implementation.');
      }
    } else {
      break;
    }
  }
}
function updateIndices<T extends any>(arrays: T[][], indices: number[]) {
  let arrIndex = arrays.length;
  while (arrIndex--) {
    if (indices[arrIndex] === arrays[arrIndex].length - 1) {
      if (arrIndex === 0) {
        return false;
      }
      continue;
    }

    indices[arrIndex] += 1;
    for (let i = arrIndex + 1, ii = arrays.length; ii > i; ++i) {
      indices[i] = 0;
    }
    return true;
  }
  return false;
}
function updateElementByIndices<T extends any>(arrays: T[][], args: T[], indices: number[]): T[] {
  for (let i = 0, ii = arrays.length; ii > i; ++i) {
    args[i] = arrays[i][indices[i]];
  }
  return args;
}
