(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
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
    function _(strings, ...vars) {
        let retVal = '';
        const length = vars.length;
        for (let i = 0; i < length; ++i) {
            retVal = retVal + strings[i] + stringify(vars[i]);
        }
        return retVal + strings[length];
    }
    exports._ = _;
    const newline = /\r?\n/g;
    const whitespace = /\s+/g;
    const toStringTag = Object.prototype.toString;
    /**
     * stringify primitive value (null -> 'null' and undefined -> 'undefined') or complex values with recursion guard
     */
    function stringify(value) {
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
    exports.stringify = stringify;
    function jsonStringify(o) {
        try {
            let cache = [];
            const result = JSON.stringify(o, function (_key, value) {
                if (typeof value === 'object' && value !== null) {
                    if (value.nodeType > 0) {
                        return htmlStringify(value);
                    }
                    if (cache.includes(value)) {
                        try {
                            return JSON.parse(JSON.stringify(value));
                        }
                        catch (error) {
                            return void 0;
                        }
                    }
                    cache.push(value);
                }
                return value;
            });
            cache = void 0;
            return result.replace(newline, '');
        }
        catch (e) {
            return `error stringifying to json: ${e}`;
        }
    }
    exports.jsonStringify = jsonStringify;
    function htmlStringify(node) {
        if (node === null) {
            return 'null';
        }
        if (node === undefined) {
            return 'undefined';
        }
        if ((node.textContent != null && node.textContent.length) || node.nodeType === 3 /* Text */ || node.nodeType === 8 /* Comment */) {
            return node.textContent.replace(newline, '');
        }
        if (node.nodeType === 1 /* Element */) {
            if (node.innerHTML.length) {
                return node.innerHTML.replace(newline, '');
            }
            if (node.nodeName === 'TEMPLATE') {
                return htmlStringify(node.content);
            }
        }
        let val = '';
        for (let i = 0, ii = node.childNodes.length; i < ii; ++i) {
            const child = node.childNodes[i];
            val += htmlStringify(child);
        }
        return val;
    }
    exports.htmlStringify = htmlStringify;
    /**
     * pad a string with spaces on the right-hand side until it's the specified length
     */
    function padRight(str, len) {
        str = `${str}`;
        const strLen = str.length;
        if (strLen >= len) {
            return str;
        }
        return str + new Array(len - strLen + 1).join(' ');
    }
    exports.padRight = padRight;
    /**
     * pad a string with spaces on the left-hand side until it's the specified length
     */
    function padLeft(str, len) {
        str = `${str}`;
        const strLen = str.length;
        if (strLen >= len) {
            return str;
        }
        return new Array(len - strLen + 1).join(' ') + str;
    }
    exports.padLeft = padLeft;
});
//# sourceMappingURL=string-manipulation.js.map