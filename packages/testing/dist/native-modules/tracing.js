import { Registration, emptyArray, } from '../../../kernel/dist/native-modules/index.js';
import { getOwnPropertyDescriptors, Reflect_apply } from './util.js';
export class Call {
    constructor(instance, args, method, index) {
        this.instance = instance;
        this.args = args;
        this.method = method;
        this.index = index;
    }
}
export class CallCollection {
    constructor() {
        this.calls = [];
    }
    static register(container) {
        container.register(Registration.singleton(this, this));
    }
    addCall(instance, method, ...args) {
        this.calls.push(new Call(instance, args, method, this.calls.length));
        return this;
    }
}
export function recordCalls(ctor, calls) {
    const proto = ctor.prototype;
    const properties = getOwnPropertyDescriptors(proto);
    for (const key in properties) {
        const property = properties[key];
        if (key !== 'constructor'
            && typeof property.value === 'function'
            && property.configurable === true
            && property.writable === true) {
            const original = property.value;
            const wrapper = function (...args) {
                calls.addCall(this, key, ...args);
                return Reflect_apply(original, this, args);
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
                    calls.addCall(this, `get ${key}`, emptyArray);
                    return Reflect_apply(get, this, emptyArray);
                };
                Reflect.defineProperty(newGet, 'original', { value: get });
            }
            if (set) {
                newSet = function (valueToSet) {
                    calls.addCall(this, `get ${key}`, emptyArray);
                    Reflect_apply(set, this, [valueToSet]);
                };
                Reflect.defineProperty(newSet, 'original', { value: set });
            }
            if (get || set) {
                Reflect.defineProperty(proto, key, { ...property, get: newGet, set: newSet });
            }
        }
    }
}
export function stopRecordingCalls(ctor) {
    const proto = ctor.prototype;
    const properties = getOwnPropertyDescriptors(proto);
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
export function trace(calls) {
    return function (ctor) {
        recordCalls(ctor, calls);
    };
}
//# sourceMappingURL=tracing.js.map