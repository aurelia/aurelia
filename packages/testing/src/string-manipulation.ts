
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

const toStringTag = Object.prototype.toString;

/**
 * stringify primitive value (null -> 'null' and undefined -> 'undefined') or complex values with recursion guard
 */
export function stringify(value: any): string {
  const Type = toStringTag.call(value);
  switch (Type) {
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
      return `[${value.map(stringify).join(',')}]`;
    case '[object Event]':
      return `'${value.type}'`;
    case '[object Object]': {
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

export function jsonStringify(o: unknown): string {
  try {
    let cache: string[] = [];
    const result = JSON.stringify(o, function(_key: string, value: any): string {
      if (typeof value === 'object' && value !== null) {
        if (value.nodeType > 0) {
          return htmlStringify(value);
        }
        if (cache.includes(value)) {
          try {
            return JSON.parse(JSON.stringify(value));
          } catch (error) {
            return void 0 as unknown as string;
          }
        }
        cache.push(value);
      }
      return value;
    });
    cache = void 0 as unknown as string[];
    return result.replace(newline, '');
  } catch (e) {
    return `error stringifying to json: ${e}`;
  }
}

export function htmlStringify(node: object & { nodeName?: string; content?: any; innerHTML?: string; textContent?: string; childNodes?: ArrayLike<object>; nodeType?: number }): string {
  if (node === null) {
    return 'null';
  }
  if (node === undefined) {
    return 'undefined';
  }
  if ((node.textContent != null && node.textContent.length) || node.nodeType === 3 /* Text */ || node.nodeType === 8 /* Comment */) {
    return node.textContent!.replace(newline, '');
  }
  if (node.nodeType === 1/* Element */) {
    if (node.innerHTML!.length) {
      return node.innerHTML!.replace(newline, '');
    }
    if (node.nodeName === 'TEMPLATE') {
      return htmlStringify(node.content);
    }
  }
  let val = '';
  for (let i = 0, ii = node.childNodes!.length; i < ii; ++i) {
    const child = node.childNodes![i];
    val += htmlStringify(child);
  }
  return val;
}

/**
 * pad a string with spaces on the right-hand side until it's the specified length
 */
export function padRight(str: any, len: number): string {
  str = `${str}`;
  const strLen = str.length;
  if (strLen >= len) {
    return str;
  }
  return str + new Array(len - strLen + 1).join(' ');
}

/**
 * pad a string with spaces on the left-hand side until it's the specified length
 */
export function padLeft(str: any, len: number): string {
  str = `${str}`;
  const strLen = str.length;
  if (strLen >= len) {
    return str;
  }
  return new Array(len - strLen + 1).join(' ') + str;
}
