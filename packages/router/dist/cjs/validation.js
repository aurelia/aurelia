"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.shallowEquals = exports.validateComponent = exports.validateRedirectRouteConfig = exports.validateRouteConfig = exports.expectType = exports.isPartialViewportInstruction = exports.isPartialRedirectRouteConfig = exports.isPartialChildRouteConfig = exports.isPartialCustomElementDefinition = exports.isNotNullishOrTypeOrViewModel = void 0;
const runtime_html_1 = require("@aurelia/runtime-html");
const util_js_1 = require("./util.js");
function isNotNullishOrTypeOrViewModel(value) {
    return (typeof value === 'object' &&
        value !== null &&
        !runtime_html_1.isCustomElementViewModel(value));
}
exports.isNotNullishOrTypeOrViewModel = isNotNullishOrTypeOrViewModel;
function isPartialCustomElementDefinition(value) {
    // 'name' is the only mandatory property of a CustomElementDefinition.
    // It overlaps with RouteType and may overlap with CustomElementViewModel, so this ducktype check is only valid when those are ruled out *first*
    return (isNotNullishOrTypeOrViewModel(value) &&
        Object.prototype.hasOwnProperty.call(value, 'name') === true);
}
exports.isPartialCustomElementDefinition = isPartialCustomElementDefinition;
function isPartialChildRouteConfig(value) {
    // 'component' is the only mandatory property of a ChildRouteConfig
    // It may overlap with RouteType and CustomElementViewModel, so this ducktype check is only valid when those are ruled out *first*
    return (isNotNullishOrTypeOrViewModel(value) &&
        Object.prototype.hasOwnProperty.call(value, 'component') === true);
}
exports.isPartialChildRouteConfig = isPartialChildRouteConfig;
function isPartialRedirectRouteConfig(value) {
    // 'redirectTo' and 'path' are mandatory properties of a RedirectRouteConfig
    // It may overlap with RouteType and CustomElementViewModel, so this ducktype check is only valid when those are ruled out *first*
    return (isNotNullishOrTypeOrViewModel(value) &&
        Object.prototype.hasOwnProperty.call(value, 'redirectTo') === true);
}
exports.isPartialRedirectRouteConfig = isPartialRedirectRouteConfig;
// Yes, `isPartialChildRouteConfig` and `isPartialViewportInstruction` have identical logic but since that is coincidental,
// and the two are intended to be used in specific contexts, we keep these as two separate functions for now.
function isPartialViewportInstruction(value) {
    // 'component' is the only mandatory property of a INavigationInstruction
    // It may overlap with RouteType and CustomElementViewModel, so this ducktype check is only valid when those are ruled out *first*
    return (isNotNullishOrTypeOrViewModel(value) &&
        Object.prototype.hasOwnProperty.call(value, 'component') === true);
}
exports.isPartialViewportInstruction = isPartialViewportInstruction;
function expectType(expected, prop, value) {
    throw new Error(`Invalid route config property: "${prop}". Expected ${expected}, but got ${util_js_1.tryStringify(value)}.`);
}
exports.expectType = expectType;
/**
 * Validate a `IRouteConfig` or `IChildRouteConfig`.
 *
 * The validation of these types is the same, except that `component` is a mandatory property of `IChildRouteConfig`.
 * This property is checked for in `validateComponent`.
 */
function validateRouteConfig(config, parentPath) {
    if (config === null || config === void 0) {
        throw new Error(`Invalid route config: expected an object or string, but got: ${String(config)}.`);
    }
    const keys = Object.keys(config);
    for (const key of keys) {
        const value = config[key];
        const path = [parentPath, key].join('.');
        switch (key) {
            case 'id':
            case 'viewport':
            case 'redirectTo':
                if (typeof value !== 'string') {
                    expectType('string', path, value);
                }
                break;
            case 'caseSensitive':
                if (typeof value !== 'boolean') {
                    expectType('boolean', path, value);
                }
                break;
            case 'data':
                if (typeof value !== 'object' || value === null) {
                    expectType('object', path, value);
                }
                break;
            case 'title':
                switch (typeof value) {
                    case 'string':
                    case 'function':
                        break;
                    default:
                        expectType('string or function', path, value);
                }
                break;
            case 'path':
                if (value instanceof Array) {
                    for (let i = 0; i < value.length; ++i) {
                        if (typeof value[i] !== 'string') {
                            expectType('string', `${path}[${i}]`, value[i]);
                        }
                    }
                }
                else if (typeof value !== 'string') {
                    expectType('string or Array of strings', path, value);
                }
                break;
            case 'component':
                validateComponent(value, path);
                break;
            case 'routes': {
                if (!(value instanceof Array)) {
                    expectType('Array', path, value);
                }
                for (const route of value) {
                    const childPath = `${path}[${value.indexOf(route)}]`; // TODO(fkleuver): remove 'any' (this type got very messy for some reason)
                    validateComponent(route, childPath);
                }
                break;
            }
            case 'transitionPlan':
                switch (typeof value) {
                    case 'string':
                        switch (value) {
                            case 'none':
                            case 'replace':
                            case 'invoke-lifecycles':
                                break;
                            default:
                                expectType('string(\'none\'|\'replace\'|\'invoke-lifecycles\') or function', path, value);
                        }
                        break;
                    case 'function':
                        break;
                    default:
                        expectType('string(\'none\'|\'replace\'|\'invoke-lifecycles\') or function', path, value);
                }
                break;
            default:
                // We don't *have* to throw here, but let's be as strict as possible until someone gives a valid reason for not doing so.
                throw new Error(`Unknown route config property: "${parentPath}.${key}". Please specify known properties only.`);
        }
    }
}
exports.validateRouteConfig = validateRouteConfig;
function validateRedirectRouteConfig(config, parentPath) {
    if (config === null || config === void 0) {
        throw new Error(`Invalid route config: expected an object or string, but got: ${String(config)}.`);
    }
    const keys = Object.keys(config);
    for (const key of keys) {
        const value = config[key];
        const path = [parentPath, key].join('.');
        switch (key) {
            case 'path':
            case 'redirectTo':
                if (typeof value !== 'string') {
                    expectType('string', path, value);
                }
                break;
            default:
                // We don't *have* to throw here, but let's be as strict as possible until someone gives a valid reason for not doing so.
                throw new Error(`Unknown redirect config property: "${parentPath}.${key}". Only 'path' and 'redirectTo' should be specified for redirects.`);
        }
    }
}
exports.validateRedirectRouteConfig = validateRedirectRouteConfig;
function validateComponent(component, parentPath) {
    switch (typeof component) {
        case 'function':
            break;
        case 'object':
            if (component instanceof Promise) {
                break;
            }
            if (isPartialRedirectRouteConfig(component)) {
                validateRedirectRouteConfig(component, parentPath);
                break;
            }
            if (isPartialChildRouteConfig(component)) {
                validateRouteConfig(component, parentPath);
                break;
            }
            if (!runtime_html_1.isCustomElementViewModel(component) &&
                !isPartialCustomElementDefinition(component)) {
                expectType(`an object with at least a 'component' property (see Routeable)`, parentPath, component);
            }
            break;
        case 'string':
            break;
        default:
            expectType('function, object or string (see Routeable)', parentPath, component);
    }
}
exports.validateComponent = validateComponent;
function shallowEquals(a, b) {
    if (a === b) {
        return true;
    }
    if (typeof a !== typeof b) {
        return false;
    }
    if (a === null || b === null) {
        return false;
    }
    if (Object.getPrototypeOf(a) !== Object.getPrototypeOf(b)) {
        return false;
    }
    const aKeys = Object.keys(a);
    const bKeys = Object.keys(b);
    if (aKeys.length !== bKeys.length) {
        return false;
    }
    for (let i = 0, ii = aKeys.length; i < ii; ++i) {
        const key = aKeys[i];
        if (key !== bKeys[i]) {
            return false;
        }
        if (a[key] !== b[key]) {
            return false;
        }
    }
    return true;
}
exports.shallowEquals = shallowEquals;
//# sourceMappingURL=validation.js.map