(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "@aurelia/kernel", "@aurelia/runtime-html"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const kernel_1 = require("@aurelia/kernel");
    const runtime_html_1 = require("@aurelia/runtime-html");
    const emptyArray = kernel_1.PLATFORM.emptyArray;
    function h(name, attrs = null, ...children) {
        const el = runtime_html_1.DOM.createElement(name);
        for (const attr in attrs) {
            if (attr === 'class' || attr === 'className' || attr === 'cls') {
                let value = attrs[attr];
                value = value === undefined || value === null
                    ? emptyArray
                    : Array.isArray(value)
                        ? value
                        : (`${value}`).split(' ');
                el.classList.add(...value.filter(Boolean));
            }
            else if (attr in el || attr === 'data' || attr.startsWith('_')) {
                el[attr.replace(/^_/, '')] = attrs[attr];
            }
            else {
                el.setAttribute(attr, attrs[attr]);
            }
        }
        const childrenCt = el.tagName === 'TEMPLATE' ? el.content : el;
        for (const child of children) {
            if (child === null || child === undefined) {
                continue;
            }
            childrenCt.appendChild(isNodeOrTextOrComment(child)
                ? child
                : runtime_html_1.DOM.createTextNode(`${child}`));
        }
        return el;
    }
    exports.h = h;
    function isNodeOrTextOrComment(obj) {
        return obj.nodeType > 0;
    }
    const eventCmds = { delegate: 1, capture: 1, call: 1 };
    /**
     * jsx with aurelia binding command friendly version of h
     */
    exports.hJsx = function (name, attrs, ...children) {
        const el = runtime_html_1.DOM.createElement(name === 'let$' ? 'let' : name);
        if (attrs != null) {
            let value;
            for (const attr in attrs) {
                value = attrs[attr];
                // if attr is class or its alias
                // split up by splace and add to element via classList API
                if (attr === 'class' || attr === 'className' || attr === 'cls') {
                    value = value == null
                        ? []
                        : Array.isArray(value)
                            ? value
                            : (`${value}`).split(' ');
                    el.classList.add(...value);
                }
                // for attributes with matching properties, simply assign
                // other if special attribute like data, or ones start with _
                // assign as well
                else if (attr in el || attr === 'data' || attr.startsWith('_')) {
                    // @ts-ignore // TODO: https://github.com/microsoft/TypeScript/issues/31904
                    el[attr] = value;
                }
                // if it's an asElement attribute, camel case it
                else if (attr === 'asElement') {
                    el.setAttribute('as-element', value);
                }
                // ortherwise do fallback check
                else {
                    // is it an event handler?
                    if (attr.startsWith('o') && attr[1] === 'n' && !attr.endsWith('$')) {
                        const decoded = kernel_1.kebabCase(attr.slice(2));
                        const parts = decoded.split('-');
                        if (parts.length > 1) {
                            const lastPart = parts[parts.length - 1];
                            const cmd = eventCmds[lastPart] ? lastPart : 'trigger';
                            el.setAttribute(`${parts.slice(0, -1).join('-')}.${cmd}`, value);
                        }
                        else {
                            el.setAttribute(`${parts[0]}.trigger`, value);
                        }
                    }
                    else {
                        const parts = attr.split('$');
                        if (parts.length === 1) {
                            el.setAttribute(kernel_1.kebabCase(attr), value);
                        }
                        else {
                            if (parts[parts.length - 1] === '') {
                                parts[parts.length - 1] = 'bind';
                            }
                            el.setAttribute(parts.map(kernel_1.kebabCase).join('.'), value);
                        }
                        // const lastIdx = attr.lastIndexOf('$');
                        // if (lastIdx === -1) {
                        //   el.setAttribute(kebabCase(attr), value);
                        // } else {
                        //   let cmd = attr.slice(lastIdx + 1);
                        //   cmd = cmd ? kebabCase(cmd) : 'bind';
                        //   el.setAttribute(`${kebabCase(attr.slice(0, lastIdx))}.${cmd}`, value);
                        // }
                    }
                }
            }
        }
        const appender = el.content != null ? el.content : el;
        for (const child of children) {
            if (child == null) {
                continue;
            }
            if (Array.isArray(child)) {
                for (const child_child of child) {
                    appender.appendChild(runtime_html_1.DOM.isNodeInstance(child_child) ? child_child : runtime_html_1.DOM.createTextNode(`${child_child}`));
                }
            }
            else {
                appender.appendChild(runtime_html_1.DOM.isNodeInstance(child) ? child : runtime_html_1.DOM.createTextNode(`${child}`));
            }
        }
        return el;
    };
});
//# sourceMappingURL=h.js.map