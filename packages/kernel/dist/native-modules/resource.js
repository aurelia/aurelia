import { Metadata } from '../../../metadata/dist/native-modules/index.js';
import { emptyArray } from './platform.js';
const annotation = {
    name: 'au:annotation',
    appendTo(target, key) {
        const keys = Metadata.getOwn(annotation.name, target);
        if (keys === void 0) {
            Metadata.define(annotation.name, [key], target);
        }
        else {
            keys.push(key);
        }
    },
    set(target, prop, value) {
        Metadata.define(annotation.keyFor(prop), value, target);
    },
    get(target, prop) {
        return Metadata.getOwn(annotation.keyFor(prop), target);
    },
    getKeys(target) {
        let keys = Metadata.getOwn(annotation.name, target);
        if (keys === void 0) {
            Metadata.define(annotation.name, keys = [], target);
        }
        return keys;
    },
    isKey(key) {
        return key.startsWith(annotation.name);
    },
    keyFor(name, context) {
        if (context === void 0) {
            return `${annotation.name}:${name}`;
        }
        return `${annotation.name}:${name}:${context}`;
    },
};
const resource = {
    name: 'au:resource',
    appendTo(target, key) {
        const keys = Metadata.getOwn(resource.name, target);
        if (keys === void 0) {
            Metadata.define(resource.name, [key], target);
        }
        else {
            keys.push(key);
        }
    },
    has(target) {
        return Metadata.hasOwn(resource.name, target);
    },
    getAll(target) {
        const keys = Metadata.getOwn(resource.name, target);
        if (keys === void 0) {
            return emptyArray;
        }
        else {
            return keys.map(k => Metadata.getOwn(k, target));
        }
    },
    getKeys(target) {
        let keys = Metadata.getOwn(resource.name, target);
        if (keys === void 0) {
            Metadata.define(resource.name, keys = [], target);
        }
        return keys;
    },
    isKey(key) {
        return key.startsWith(resource.name);
    },
    keyFor(name, context) {
        if (context === void 0) {
            return `${resource.name}:${name}`;
        }
        return `${resource.name}:${name}:${context}`;
    },
};
export const Protocol = {
    annotation,
    resource,
};
const hasOwn = Object.prototype.hasOwnProperty;
/**
 * The order in which the values are checked:
 * 1. Annotations (usually set by decorators) have the highest priority; they override the definition as well as static properties on the type.
 * 2. Definition properties (usually set by the customElement decorator object literal) come next. They override static properties on the type.
 * 3. Static properties on the type come last. Note that this does not look up the prototype chain (bindables are an exception here, but we do that differently anyway)
 * 4. The default property that is provided last. The function is only called if the default property is needed
 */
export function fromAnnotationOrDefinitionOrTypeOrDefault(name, def, Type, getDefault) {
    let value = Metadata.getOwn(Protocol.annotation.keyFor(name), Type);
    if (value === void 0) {
        value = def[name];
        if (value === void 0) {
            value = Type[name];
            if (value === void 0 || !hasOwn.call(Type, name)) { // First just check the value (common case is faster), but do make sure it doesn't come from the proto chain
                return getDefault();
            }
            return value;
        }
        return value;
    }
    return value;
}
/**
 * The order in which the values are checked:
 * 1. Annotations (usually set by decorators) have the highest priority; they override static properties on the type.
 * 2. Static properties on the typ. Note that this does not look up the prototype chain (bindables are an exception here, but we do that differently anyway)
 * 3. The default property that is provided last. The function is only called if the default property is needed
 */
export function fromAnnotationOrTypeOrDefault(name, Type, getDefault) {
    let value = Metadata.getOwn(Protocol.annotation.keyFor(name), Type);
    if (value === void 0) {
        value = Type[name];
        if (value === void 0 || !hasOwn.call(Type, name)) { // First just check the value (common case is faster), but do make sure it doesn't come from the proto chain
            return getDefault();
        }
        return value;
    }
    return value;
}
/**
 * The order in which the values are checked:
 * 1. Definition properties.
 * 2. The default property that is provided last. The function is only called if the default property is needed
 */
export function fromDefinitionOrDefault(name, def, getDefault) {
    const value = def[name];
    if (value === void 0) {
        return getDefault();
    }
    return value;
}
//# sourceMappingURL=resource.js.map