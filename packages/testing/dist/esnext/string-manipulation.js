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
export function _(strings, ...vars) {
    const ctx = { result: '' };
    const length = vars.length;
    for (let i = 0; i < length; ++i) {
        ctx.result = ctx.result + strings[i] + stringify(vars[i], ctx);
    }
    return ctx.result + strings[length];
}
const newline = /\r?\n/g;
const whitespace = /\s+/g;
const toStringTag = Object.prototype.toString;
/**
 * stringify primitive value (null -> 'null' and undefined -> 'undefined') or complex values with recursion guard
 */
export function stringify(value, ctx) {
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
            return `[${value.map((x) => stringify(x, ctx)).join(',')}]`;
        case '[object Event]':
            return `'${value.type}'`;
        case '[object Object]': {
            const proto = Object.getPrototypeOf(value);
            if (!proto || !proto.constructor || proto.constructor.name === 'Object') {
                return jsonStringify(value, ctx);
            }
            return `class ${proto.constructor.name}${jsonStringify(value, ctx)}`;
        }
        case '[object Function]':
            if (value.name && value.name.length) {
                return `class ${value.name}`;
            }
            return value.toString().replace(whitespace, '');
        default:
            return jsonStringify(value, ctx);
    }
}
export function jsonStringify(o, ctx) {
    if (ctx.result.length > 100) {
        return '(json string)';
    }
    try {
        let cache = [];
        let depth = 0;
        const result = JSON.stringify(o, function (_key, value) {
            if (_key === 'dom') {
                return '(dom)';
            }
            if (++depth === 2) {
                return String(value);
            }
            if (typeof value === 'object' && value !== null) {
                if (value.nodeType > 0) {
                    --depth;
                    return htmlStringify(value, ctx);
                }
                if (cache.includes(value)) {
                    try {
                        --depth;
                        return JSON.parse(JSON.stringify(value));
                    }
                    catch (error) {
                        return void 0;
                    }
                }
                cache.push(value);
            }
            --depth;
            return value;
        });
        cache = void 0;
        let ret = result.replace(newline, '');
        if (ret.length > 25) {
            const len = ret.length;
            ret = `${ret.slice(0, 25)}...(+${len - 25})`;
        }
        ctx.result += ret;
        return ret;
    }
    catch (e) {
        return `error stringifying to json: ${e}`;
    }
}
export function htmlStringify(node, ctx) {
    if (ctx.result.length > 100) {
        return '(html string)';
    }
    if (node === null) {
        return 'null';
    }
    if (node === undefined) {
        return 'undefined';
    }
    if ((node.textContent != null && node.textContent.length) || node.nodeType === 3 /* Text */ || node.nodeType === 8 /* Comment */) {
        const ret = node.textContent.replace(newline, '');
        if (ret.length > 10) {
            const len = ret.length;
            return `${ret.slice(0, 10)}...(+${len - 10})`;
        }
        return ret;
    }
    if (node.nodeType === 1 /* Element */) {
        if (node.innerHTML.length) {
            const ret = node.innerHTML.replace(newline, '');
            if (ret.length > 10) {
                const len = ret.length;
                return `${ret.slice(0, 10)}...(+${len - 10})`;
            }
            return ret;
        }
        if (node.nodeName === 'TEMPLATE') {
            return htmlStringify(node.content, ctx);
        }
    }
    let val = '';
    for (let i = 0, ii = node.childNodes.length; i < ii; ++i) {
        const child = node.childNodes[i];
        val += htmlStringify(child, ctx);
    }
    return val;
}
/**
 * pad a string with spaces on the right-hand side until it's the specified length
 */
export function padRight(input, len) {
    const str = `${input}`;
    const strLen = str.length;
    if (strLen >= len) {
        return str;
    }
    return str + new Array(len - strLen + 1).join(' ');
}
/**
 * pad a string with spaces on the left-hand side until it's the specified length
 */
export function padLeft(input, len) {
    const str = `${input}`;
    const strLen = str.length;
    if (strLen >= len) {
        return str;
    }
    return new Array(len - strLen + 1).join(' ') + str;
}
//# sourceMappingURL=string-manipulation.js.map