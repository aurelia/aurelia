(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "@aurelia/debug", "@aurelia/kernel", "./util"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const debug_1 = require("@aurelia/debug");
    const kernel_1 = require("@aurelia/kernel");
    const util_1 = require("./util");
    const RuntimeTracer = { ...kernel_1.Tracer };
    function enableTracing() {
        Object.assign(kernel_1.Tracer, debug_1.DebugTracer);
        kernel_1.Tracer.enabled = true;
    }
    exports.enableTracing = enableTracing;
    function disableTracing() {
        kernel_1.Tracer.flushAll(null);
        Object.assign(kernel_1.Tracer, RuntimeTracer);
        kernel_1.Tracer.enabled = false;
    }
    exports.disableTracing = disableTracing;
    exports.SymbolTraceWriter = {
        write(info) {
            let output = '(';
            const params = info.params;
            for (let i = 0, ii = params.length; i < ii; ++i) {
                const p = info.params[i];
                switch (typeof p) {
                    case 'string':
                    case 'boolean':
                        output += p.toString();
                        break;
                    case 'number':
                        output += p > 0 ? `flags=${debug_1.stringifyLifecycleFlags(p)}` : '0';
                        break;
                    case 'object':
                        if (p === null) {
                            output += 'null';
                        }
                        else {
                            if (p.flags !== undefined) {
                                const symbol = p;
                                if ('target' in symbol) {
                                    output += `attr: ${symbol.target}=${symbol.rawValue}`;
                                }
                                else if ('interpolation' in symbol) {
                                    output += `text: "${symbol.physicalNode.textContent}"`;
                                }
                                else {
                                    output += `element: ${symbol.physicalNode.outerHTML}`;
                                }
                            }
                            else {
                                if ('outerHTML' in p) {
                                    const el = p;
                                    output += `${Object.getPrototypeOf(el).constructor.name}=${el.outerHTML}`;
                                }
                                else {
                                    output += `[Object ${Object.getPrototypeOf(p).constructor.name || 'anonymous'}]`;
                                }
                            }
                        }
                        break;
                    case 'undefined':
                        output += 'undefined';
                        break;
                    default:
                        output += '?';
                }
                if (i + 1 < ii) {
                    output += ', ';
                }
            }
            output += ')';
            console.debug(`${'  '.repeat(info.depth)}${info.objName}.${info.methodName} - ${output}`);
        }
    };
    class Call {
        constructor(instance, args, method, index) {
            this.instance = instance;
            this.args = args;
            this.method = method;
            this.index = index;
        }
    }
    exports.Call = Call;
    class CallCollection {
        constructor() {
            this.calls = [];
        }
        static register(container) {
            container.register(kernel_1.Registration.singleton(this, this));
        }
        addCall(instance, method, ...args) {
            this.calls.push(new Call(instance, args, method, this.calls.length));
            return this;
        }
    }
    exports.CallCollection = CallCollection;
    function recordCalls(ctor, calls) {
        const proto = ctor.prototype;
        const properties = util_1.getOwnPropertyDescriptors(proto);
        for (const key in properties) {
            const property = properties[key];
            if (key !== 'constructor'
                && typeof property.value === 'function'
                && property.configurable === true
                && property.writable === true) {
                const original = property.value;
                const wrapper = function (...args) {
                    calls.addCall(this, key, ...args);
                    return util_1.Reflect_apply(original, this, args);
                };
                Reflect.defineProperty(wrapper, 'original', {
                    value: original,
                    writable: true,
                    configurable: true,
                    enumerable: false,
                });
                Reflect.defineProperty(proto, key, {
                    value: wrapper,
                    writable: property.writable,
                    configurable: property.configurable,
                    enumerable: property.enumerable,
                });
            }
            else {
                const { get, set } = property;
                let newGet, newSet;
                if (get) {
                    newGet = function () {
                        calls.addCall(this, `get ${key}`, kernel_1.PLATFORM.emptyArray);
                        return util_1.Reflect_apply(get, this, kernel_1.PLATFORM.emptyArray);
                    };
                    Reflect.defineProperty(newGet, 'original', { value: get });
                }
                if (set) {
                    newSet = function (valueToSet) {
                        calls.addCall(this, `get ${key}`, kernel_1.PLATFORM.emptyArray);
                        util_1.Reflect_apply(set, this, [valueToSet]);
                    };
                    Reflect.defineProperty(newSet, 'original', { value: set });
                }
                if (get || set) {
                    Reflect.defineProperty(proto, key, { ...property, get: newGet, set: newSet });
                }
            }
        }
    }
    exports.recordCalls = recordCalls;
    function stopRecordingCalls(ctor) {
        const proto = ctor.prototype;
        const properties = util_1.getOwnPropertyDescriptors(proto);
        for (const key in properties) {
            const property = properties[key];
            if (key !== 'constructor'
                && typeof property.value === 'function'
                && property.configurable === true
                && property.writable === true) {
                Reflect.defineProperty(proto, key, {
                    value: property.value.original,
                    writable: property.writable,
                    configurable: property.configurable,
                    enumerable: property.enumerable,
                });
            }
            else {
                const { get, set } = property;
                if (get || set) {
                    Reflect.defineProperty(proto, key, {
                        ...property,
                        get: get && Reflect.get(get, 'original'),
                        set: set && Reflect.get(set, 'original')
                    });
                }
            }
        }
    }
    exports.stopRecordingCalls = stopRecordingCalls;
    function trace(calls) {
        return function (ctor) {
            recordCalls(ctor, calls);
        };
    }
    exports.trace = trace;
});
//# sourceMappingURL=tracing.js.map