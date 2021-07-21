'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var metadata = require('@aurelia/metadata');
var platform = require('@aurelia/platform');

const isNumericLookup = {};
/**
 * Efficiently determine whether the provided property key is numeric
 * (and thus could be an array indexer) or not.
 *
 * Always returns true for values of type `'number'`.
 *
 * Otherwise, only returns true for strings that consist only of positive integers.
 *
 * Results are cached.
 */
function isArrayIndex(value) {
    switch (typeof value) {
        case 'number':
            return value >= 0 && (value | 0) === value;
        case 'string': {
            const result = isNumericLookup[value];
            if (result !== void 0) {
                return result;
            }
            const length = value.length;
            if (length === 0) {
                return isNumericLookup[value] = false;
            }
            let ch = 0;
            let i = 0;
            for (; i < length; ++i) {
                ch = value.charCodeAt(i);
                if (i === 0 && ch === 0x30 && length > 1 /* must not start with 0 */ || ch < 0x30 /* 0 */ || ch > 0x39 /* 9 */) {
                    return isNumericLookup[value] = false;
                }
            }
            return isNumericLookup[value] = true;
        }
        default:
            return false;
    }
}
/**
 * Determines if the value passed is a number or bigint for parsing purposes
 *
 * @param value - Value to evaluate
 */
function isNumberOrBigInt(value) {
    switch (typeof value) {
        case 'number':
        case 'bigint':
            return true;
        default:
            return false;
    }
}
/**
 * Determines if the value passed is a number or bigint for parsing purposes
 *
 * @param value - Value to evaluate
 */
function isStringOrDate(value) {
    switch (typeof value) {
        case 'string':
            return true;
        case 'object':
            return value instanceof Date;
        default:
            return false;
    }
}
/**
 * Base implementation of camel and kebab cases
 */
const baseCase = (function () {
    let CharKind;
    (function (CharKind) {
        CharKind[CharKind["none"] = 0] = "none";
        CharKind[CharKind["digit"] = 1] = "digit";
        CharKind[CharKind["upper"] = 2] = "upper";
        CharKind[CharKind["lower"] = 3] = "lower";
    })(CharKind || (CharKind = {}));
    // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
    const isDigit = Object.assign(Object.create(null), {
        '0': true,
        '1': true,
        '2': true,
        '3': true,
        '4': true,
        '5': true,
        '6': true,
        '7': true,
        '8': true,
        '9': true,
    });
    function charToKind(char) {
        if (char === '') {
            // We get this if we do charAt() with an index out of range
            return 0 /* none */;
        }
        if (char !== char.toUpperCase()) {
            return 3 /* lower */;
        }
        if (char !== char.toLowerCase()) {
            return 2 /* upper */;
        }
        if (isDigit[char] === true) {
            return 1 /* digit */;
        }
        return 0 /* none */;
    }
    return function (input, cb) {
        const len = input.length;
        if (len === 0) {
            return input;
        }
        let sep = false;
        let output = '';
        let prevKind;
        let curChar = '';
        let curKind = 0 /* none */;
        let nextChar = input.charAt(0);
        let nextKind = charToKind(nextChar);
        let i = 0;
        for (; i < len; ++i) {
            prevKind = curKind;
            curChar = nextChar;
            curKind = nextKind;
            nextChar = input.charAt(i + 1);
            nextKind = charToKind(nextChar);
            if (curKind === 0 /* none */) {
                if (output.length > 0) {
                    // Only set sep to true if it's not at the beginning of output.
                    sep = true;
                }
            }
            else {
                if (!sep && output.length > 0 && curKind === 2 /* upper */) {
                    // Separate UAFoo into UA Foo.
                    // Separate uaFOO into ua FOO.
                    sep = prevKind === 3 /* lower */ || nextKind === 3 /* lower */;
                }
                output += cb(curChar, sep);
                sep = false;
            }
        }
        return output;
    };
})();
/**
 * Efficiently convert a string to camelCase.
 *
 * Non-alphanumeric characters are treated as separators.
 *
 * Primarily used by Aurelia to convert DOM attribute names to ViewModel property names.
 *
 * Results are cached.
 */
const camelCase = (function () {
    const cache = Object.create(null);
    function callback(char, sep) {
        return sep ? char.toUpperCase() : char.toLowerCase();
    }
    return function (input) {
        let output = cache[input];
        if (output === void 0) {
            output = cache[input] = baseCase(input, callback);
        }
        return output;
    };
})();
/**
 * Efficiently convert a string to PascalCase.
 *
 * Non-alphanumeric characters are treated as separators.
 *
 * Primarily used by Aurelia to convert element names to class names for synthetic types.
 *
 * Results are cached.
 */
const pascalCase = (function () {
    const cache = Object.create(null);
    return function (input) {
        let output = cache[input];
        if (output === void 0) {
            output = camelCase(input);
            if (output.length > 0) {
                output = output[0].toUpperCase() + output.slice(1);
            }
            cache[input] = output;
        }
        return output;
    };
})();
/**
 * Efficiently convert a string to kebab-case.
 *
 * Non-alphanumeric characters are treated as separators.
 *
 * Primarily used by Aurelia to convert ViewModel property names to DOM attribute names.
 *
 * Results are cached.
 */
const kebabCase = (function () {
    const cache = Object.create(null);
    function callback(char, sep) {
        return sep ? `-${char.toLowerCase()}` : char.toLowerCase();
    }
    return function (input) {
        let output = cache[input];
        if (output === void 0) {
            output = cache[input] = baseCase(input, callback);
        }
        return output;
    };
})();
/**
 * Efficiently (up to 10x faster than `Array.from`) convert an `ArrayLike` to a real array.
 *
 * Primarily used by Aurelia to convert DOM node lists to arrays.
 */
function toArray(input) {
    // benchmark: http://jsben.ch/xjsyF
    const { length } = input;
    const arr = Array(length);
    let i = 0;
    for (; i < length; ++i) {
        arr[i] = input[i];
    }
    return arr;
}
const ids = {};
/**
 * Retrieve the next ID in a sequence for a given string, starting with `1`.
 *
 * Used by Aurelia to assign unique ID's to controllers and resources.
 *
 * Aurelia will always prepend the context name with `au$`, so as long as you avoid
 * using that convention you should be safe from collisions.
 */
function nextId(context) {
    if (ids[context] === void 0) {
        ids[context] = 0;
    }
    return ++ids[context];
}
/**
 * Reset the ID for the given string, so that `nextId` will return `1` again for the next call.
 *
 * Used by Aurelia to reset ID's in between unit tests.
 */
function resetId(context) {
    ids[context] = 0;
}
/**
 * A compare function to pass to `Array.prototype.sort` for sorting numbers.
 * This is needed for numeric sort, since the default sorts them as strings.
 */
function compareNumber(a, b) {
    return a - b;
}
/**
 * Efficiently merge and deduplicate the (primitive) values in two arrays.
 *
 * Does not deduplicate existing values in the first array.
 *
 * Guards against null or undefined arrays.
 *
 * Returns `emptyArray` if both arrays are either `null`, `undefined` or `emptyArray`
 *
 * @param slice - If `true`, always returns a new array copy (unless neither array is/has a value)
 */
function mergeDistinct(arr1, arr2, slice) {
    if (arr1 === void 0 || arr1 === null || arr1 === emptyArray) {
        if (arr2 === void 0 || arr2 === null || arr2 === emptyArray) {
            return emptyArray;
        }
        else {
            return slice ? arr2.slice(0) : arr2;
        }
    }
    else if (arr2 === void 0 || arr2 === null || arr2 === emptyArray) {
        return slice ? arr1.slice(0) : arr1;
    }
    const lookup = {};
    const arr3 = slice ? arr1.slice(0) : arr1;
    let len1 = arr1.length;
    let len2 = arr2.length;
    while (len1-- > 0) {
        lookup[arr1[len1]] = true;
    }
    let item;
    while (len2-- > 0) {
        item = arr2[len2];
        if (lookup[item] === void 0) {
            arr3.push(item);
            lookup[item] = true;
        }
    }
    return arr3;
}
/**
 * Decorator. (lazily) bind the method to the class instance on first call.
 */
// eslint-disable-next-line @typescript-eslint/ban-types
function bound(target, key, descriptor) {
    return {
        configurable: true,
        enumerable: descriptor.enumerable,
        get() {
            const boundFn = descriptor.value.bind(this);
            Reflect.defineProperty(this, key, {
                value: boundFn,
                writable: true,
                configurable: true,
                enumerable: descriptor.enumerable,
            });
            return boundFn;
        },
    };
}
function mergeArrays(...arrays) {
    const result = [];
    let k = 0;
    const arraysLen = arrays.length;
    let arrayLen = 0;
    let array;
    let i = 0;
    for (; i < arraysLen; ++i) {
        array = arrays[i];
        if (array !== void 0) {
            arrayLen = array.length;
            let j = 0;
            for (; j < arrayLen; ++j) {
                result[k++] = array[j];
            }
        }
    }
    return result;
}
function mergeObjects(...objects) {
    const result = {};
    const objectsLen = objects.length;
    let object;
    let key;
    let i = 0;
    for (; objectsLen > i; ++i) {
        object = objects[i];
        if (object !== void 0) {
            for (key in object) {
                result[key] = object[key];
            }
        }
    }
    return result;
}
function firstDefined(...values) {
    const len = values.length;
    let value;
    let i = 0;
    for (; len > i; ++i) {
        value = values[i];
        if (value !== void 0) {
            return value;
        }
    }
    throw new Error(`No default value found`);
}
const getPrototypeChain = (function () {
    const functionPrototype = Function.prototype;
    const getPrototypeOf = Object.getPrototypeOf;
    const cache = new WeakMap();
    let proto = functionPrototype;
    let i = 0;
    let chain = void 0;
    return function (Type) {
        chain = cache.get(Type);
        if (chain === void 0) {
            cache.set(Type, chain = [proto = Type]);
            i = 0;
            while ((proto = getPrototypeOf(proto)) !== functionPrototype) {
                chain[++i] = proto;
            }
        }
        return chain;
    };
})();
function toLookup(...objs) {
    return Object.assign(Object.create(null), ...objs);
}
/**
 * Determine whether the value is a native function.
 *
 * @param fn - The function to check.
 * @returns `true` is the function is a native function, otherwise `false`
 */
const isNativeFunction = (function () {
    // eslint-disable-next-line @typescript-eslint/ban-types
    const lookup = new WeakMap();
    let isNative = false;
    let sourceText = '';
    let i = 0;
    // eslint-disable-next-line @typescript-eslint/ban-types
    return function (fn) {
        isNative = lookup.get(fn);
        if (isNative === void 0) {
            sourceText = fn.toString();
            i = sourceText.length;
            // http://www.ecma-international.org/ecma-262/#prod-NativeFunction
            isNative = (
            // 29 is the length of 'function () { [native code] }' which is the smallest length of a native function string
            i >= 29 &&
                // 100 seems to be a safe upper bound of the max length of a native function. In Chrome and FF it's 56, in Edge it's 61.
                i <= 100 &&
                // This whole heuristic *could* be tricked by a comment. Do we need to care about that?
                sourceText.charCodeAt(i - 1) === 0x7D && // }
                // TODO: the spec is a little vague about the precise constraints, so we do need to test this across various browsers to make sure just one whitespace is a safe assumption.
                sourceText.charCodeAt(i - 2) <= 0x20 && // whitespace
                sourceText.charCodeAt(i - 3) === 0x5D && // ]
                sourceText.charCodeAt(i - 4) === 0x65 && // e
                sourceText.charCodeAt(i - 5) === 0x64 && // d
                sourceText.charCodeAt(i - 6) === 0x6F && // o
                sourceText.charCodeAt(i - 7) === 0x63 && // c
                sourceText.charCodeAt(i - 8) === 0x20 && //
                sourceText.charCodeAt(i - 9) === 0x65 && // e
                sourceText.charCodeAt(i - 10) === 0x76 && // v
                sourceText.charCodeAt(i - 11) === 0x69 && // i
                sourceText.charCodeAt(i - 12) === 0x74 && // t
                sourceText.charCodeAt(i - 13) === 0x61 && // a
                sourceText.charCodeAt(i - 14) === 0x6E && // n
                sourceText.charCodeAt(i - 15) === 0x58 // [
            );
            lookup.set(fn, isNative);
        }
        return isNative;
    };
})();
/**
 * Normalize a potential promise via a callback, to ensure things stay synchronous when they can.
 *
 * If the value is a promise, it is `then`ed before the callback is invoked. Otherwise the callback is invoked synchronously.
 */
function onResolve(maybePromise, resolveCallback) {
    if (maybePromise instanceof Promise) {
        return maybePromise.then(resolveCallback);
    }
    return resolveCallback(maybePromise);
}
/**
 * Normalize an array of potential promises, to ensure things stay synchronous when they can.
 *
 * If exactly one value is a promise, then that promise is returned.
 *
 * If more than one value is a promise, a new `Promise.all` is returned.
 *
 * If none of the values is a promise, nothing is returned, to indicate that things can stay synchronous.
 */
function resolveAll(...maybePromises) {
    let maybePromise = void 0;
    let firstPromise = void 0;
    let promises = void 0;
    let i = 0;
    // eslint-disable-next-line
    let ii = maybePromises.length;
    for (; i < ii; ++i) {
        maybePromise = maybePromises[i];
        if ((maybePromise = maybePromises[i]) instanceof Promise) {
            if (firstPromise === void 0) {
                firstPromise = maybePromise;
            }
            else if (promises === void 0) {
                promises = [firstPromise, maybePromise];
            }
            else {
                promises.push(maybePromise);
            }
        }
    }
    if (promises === void 0) {
        return firstPromise;
    }
    return Promise.all(promises);
}

const annoBaseName = 'au:annotation';
const annotation = {
    name: 'au:annotation',
    appendTo(target, key) {
        const keys = metadata.Metadata.getOwn(annoBaseName, target);
        if (keys === void 0) {
            metadata.Metadata.define(annoBaseName, [key], target);
        }
        else {
            keys.push(key);
        }
    },
    set(target, prop, value) {
        metadata.Metadata.define(annotation.keyFor(prop), value, target);
    },
    get(target, prop) {
        return metadata.Metadata.getOwn(annotation.keyFor(prop), target);
    },
    getKeys(target) {
        let keys = metadata.Metadata.getOwn(annoBaseName, target);
        if (keys === void 0) {
            metadata.Metadata.define(annoBaseName, keys = [], target);
        }
        return keys;
    },
    isKey(key) {
        return key.startsWith(annoBaseName);
    },
    keyFor(name, context) {
        if (context === void 0) {
            return `${annoBaseName}:${name}`;
        }
        return `${annoBaseName}:${name}:${context}`;
    },
};
const resBaseName = 'au:resource';
const resource = Object.freeze({
    name: resBaseName,
    appendTo(target, key) {
        const keys = metadata.Metadata.getOwn(resBaseName, target);
        if (keys === void 0) {
            metadata.Metadata.define(resBaseName, [key], target);
        }
        else {
            keys.push(key);
        }
    },
    has(target) {
        return metadata.Metadata.hasOwn(resBaseName, target);
    },
    getAll(target) {
        const keys = metadata.Metadata.getOwn(resBaseName, target);
        if (keys === void 0) {
            return emptyArray;
        }
        else {
            return keys.map(k => metadata.Metadata.getOwn(k, target));
        }
    },
    getKeys(target) {
        let keys = metadata.Metadata.getOwn(resBaseName, target);
        if (keys === void 0) {
            metadata.Metadata.define(resBaseName, keys = [], target);
        }
        return keys;
    },
    isKey(key) {
        return key.startsWith(resBaseName);
    },
    keyFor(name, context) {
        if (context === void 0) {
            return `${resBaseName}:${name}`;
        }
        return `${resBaseName}:${name}:${context}`;
    },
});
const Protocol = {
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
function fromAnnotationOrDefinitionOrTypeOrDefault(name, def, Type, getDefault) {
    let value = metadata.Metadata.getOwn(Protocol.annotation.keyFor(name), Type);
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
function fromAnnotationOrTypeOrDefault(name, Type, getDefault) {
    let value = metadata.Metadata.getOwn(Protocol.annotation.keyFor(name), Type);
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
function fromDefinitionOrDefault(name, def, getDefault) {
    const value = def[name];
    if (value === void 0) {
        return getDefault();
    }
    return value;
}

metadata.applyMetadataPolyfill(Reflect, false, false);
class ResolverBuilder {
    constructor(container, key) {
        this.container = container;
        this.key = key;
    }
    instance(value) {
        return this.registerResolver(0 /* instance */, value);
    }
    singleton(value) {
        return this.registerResolver(1 /* singleton */, value);
    }
    transient(value) {
        return this.registerResolver(2 /* transient */, value);
    }
    callback(value) {
        return this.registerResolver(3 /* callback */, value);
    }
    cachedCallback(value) {
        return this.registerResolver(3 /* callback */, cacheCallbackResult(value));
    }
    aliasTo(destinationKey) {
        return this.registerResolver(5 /* alias */, destinationKey);
    }
    registerResolver(strategy, state) {
        const { container, key } = this;
        this.container = this.key = (void 0);
        return container.registerResolver(key, new Resolver(key, strategy, state));
    }
}
function cloneArrayWithPossibleProps(source) {
    const clone = source.slice();
    const keys = Object.keys(source);
    const len = keys.length;
    let key;
    for (let i = 0; i < len; ++i) {
        key = keys[i];
        if (!isArrayIndex(key)) {
            clone[key] = source[key];
        }
    }
    return clone;
}
const DefaultResolver = {
    none(key) {
        {
            throw Error(`AUR0002:${key.toString()}`);
        }
    },
    singleton(key) { return new Resolver(key, 1 /* singleton */, key); },
    transient(key) { return new Resolver(key, 2 /* transient */, key); },
};
class ContainerConfiguration {
    constructor(inheritParentResources, defaultResolver) {
        this.inheritParentResources = inheritParentResources;
        this.defaultResolver = defaultResolver;
    }
    static from(config) {
        var _a, _b;
        if (config === void 0 ||
            config === ContainerConfiguration.DEFAULT) {
            return ContainerConfiguration.DEFAULT;
        }
        return new ContainerConfiguration((_a = config.inheritParentResources) !== null && _a !== void 0 ? _a : false, (_b = config.defaultResolver) !== null && _b !== void 0 ? _b : DefaultResolver.singleton);
    }
}
ContainerConfiguration.DEFAULT = ContainerConfiguration.from({});
const DI = {
    createContainer(config) {
        return new Container(null, ContainerConfiguration.from(config));
    },
    getDesignParamtypes(Type) {
        return metadata.Metadata.getOwn('design:paramtypes', Type);
    },
    getAnnotationParamtypes(Type) {
        const key = Protocol.annotation.keyFor('di:paramtypes');
        return metadata.Metadata.getOwn(key, Type);
    },
    getOrCreateAnnotationParamTypes: getOrCreateAnnotationParamTypes,
    getDependencies: getDependencies,
    /**
     * creates a decorator that also matches an interface and can be used as a {@linkcode Key}.
     * ```ts
     * const ILogger = DI.createInterface<Logger>('Logger');
     * container.register(Registration.singleton(ILogger, getSomeLogger()));
     * const log = container.get(ILogger);
     * log.info('hello world');
     * class Foo {
     *   constructor( @ILogger log: ILogger ) {
     *     log.info('hello world');
     *   }
     * }
     * ```
     * you can also build default registrations into your interface.
     * ```ts
     * export const ILogger = DI.createInterface<Logger>('Logger', builder => builder.cachedCallback(LoggerDefault));
     * const log = container.get(ILogger);
     * log.info('hello world');
     * class Foo {
     *   constructor( @ILogger log: ILogger ) {
     *     log.info('hello world');
     *   }
     * }
     * ```
     * but these default registrations won't work the same with other decorators that take keys, for example
     * ```ts
     * export const MyStr = DI.createInterface<string>('MyStr', builder => builder.instance('somestring'));
     * class Foo {
     *   constructor( @optional(MyStr) public readonly str: string ) {
     *   }
     * }
     * container.get(Foo).str; // returns undefined
     * ```
     * to fix this add this line somewhere before you do a `get`
     * ```ts
     * container.register(MyStr);
     * container.get(Foo).str; // returns 'somestring'
     * ```
     *
     * - @param friendlyName used to improve error messaging
     */
    createInterface(configureOrName, configuror) {
        const configure = typeof configureOrName === 'function' ? configureOrName : configuror;
        const friendlyName = typeof configureOrName === 'string' ? configureOrName : undefined;
        const Interface = function (target, property, index) {
            if (target == null || new.target !== undefined) {
                {
                    throw new Error(`AUR0001:${Interface.friendlyName}`);
                }
            }
            const annotationParamtypes = getOrCreateAnnotationParamTypes(target);
            annotationParamtypes[index] = Interface;
        };
        Interface.$isInterface = true;
        Interface.friendlyName = friendlyName == null ? '(anonymous)' : friendlyName;
        if (configure != null) {
            Interface.register = function (container, key) {
                return configure(new ResolverBuilder(container, key !== null && key !== void 0 ? key : Interface));
            };
        }
        Interface.toString = function toString() {
            return `InterfaceSymbol<${Interface.friendlyName}>`;
        };
        return Interface;
    },
    inject(...dependencies) {
        return function (target, key, descriptor) {
            if (typeof descriptor === 'number') { // It's a parameter decorator.
                const annotationParamtypes = getOrCreateAnnotationParamTypes(target);
                const dep = dependencies[0];
                if (dep !== void 0) {
                    annotationParamtypes[descriptor] = dep;
                }
            }
            else if (key) { // It's a property decorator. Not supported by the container without plugins.
                const annotationParamtypes = getOrCreateAnnotationParamTypes(target.constructor);
                const dep = dependencies[0];
                if (dep !== void 0) {
                    annotationParamtypes[key] = dep;
                }
            }
            else if (descriptor) { // It's a function decorator (not a Class constructor)
                const fn = descriptor.value;
                const annotationParamtypes = getOrCreateAnnotationParamTypes(fn);
                let dep;
                for (let i = 0; i < dependencies.length; ++i) {
                    dep = dependencies[i];
                    if (dep !== void 0) {
                        annotationParamtypes[i] = dep;
                    }
                }
            }
            else { // It's a class decorator.
                const annotationParamtypes = getOrCreateAnnotationParamTypes(target);
                let dep;
                for (let i = 0; i < dependencies.length; ++i) {
                    dep = dependencies[i];
                    if (dep !== void 0) {
                        annotationParamtypes[i] = dep;
                    }
                }
            }
        };
    },
    /**
     * Registers the `target` class as a transient dependency; each time the dependency is resolved
     * a new instance will be created.
     *
     * @param target - The class / constructor function to register as transient.
     * @returns The same class, with a static `register` method that takes a container and returns the appropriate resolver.
     *
     * @example ```ts
     * // On an existing class
     * class Foo { }
     * DI.transient(Foo);
     *
     * // Inline declaration
     * const Foo = DI.transient(class { });
     * // Foo is now strongly typed with register
     * Foo.register(container);
     * ```
     */
    transient(target) {
        target.register = function register(container) {
            const registration = Registration.transient(target, target);
            return registration.register(container, target);
        };
        target.registerInRequestor = false;
        return target;
    },
    /**
     * Registers the `target` class as a singleton dependency; the class will only be created once. Each
     * consecutive time the dependency is resolved, the same instance will be returned.
     *
     * @param target - The class / constructor function to register as a singleton.
     * @returns The same class, with a static `register` method that takes a container and returns the appropriate resolver.
     * @example ```ts
     * // On an existing class
     * class Foo { }
     * DI.singleton(Foo);
     *
     * // Inline declaration
     * const Foo = DI.singleton(class { });
     * // Foo is now strongly typed with register
     * Foo.register(container);
     * ```
     */
    singleton(target, options = defaultSingletonOptions) {
        target.register = function register(container) {
            const registration = Registration.singleton(target, target);
            return registration.register(container, target);
        };
        target.registerInRequestor = options.scoped;
        return target;
    },
};
function getDependencies(Type) {
    // Note: Every detail of this getDependencies method is pretty deliberate at the moment, and probably not yet 100% tested from every possible angle,
    // so be careful with making changes here as it can have a huge impact on complex end user apps.
    // Preferably, only make changes to the dependency resolution process via a RFC.
    const key = Protocol.annotation.keyFor('di:dependencies');
    let dependencies = metadata.Metadata.getOwn(key, Type);
    if (dependencies === void 0) {
        // Type.length is the number of constructor parameters. If this is 0, it could mean the class has an empty constructor
        // but it could also mean the class has no constructor at all (in which case it inherits the constructor from the prototype).
        // Non-zero constructor length + no paramtypes means emitDecoratorMetadata is off, or the class has no decorator.
        // We're not doing anything with the above right now, but it's good to keep in mind for any future issues.
        const inject = Type.inject;
        if (inject === void 0) {
            // design:paramtypes is set by tsc when emitDecoratorMetadata is enabled.
            const designParamtypes = DI.getDesignParamtypes(Type);
            // au:annotation:di:paramtypes is set by the parameter decorator from DI.createInterface or by @inject
            const annotationParamtypes = DI.getAnnotationParamtypes(Type);
            if (designParamtypes === void 0) {
                if (annotationParamtypes === void 0) {
                    // Only go up the prototype if neither static inject nor any of the paramtypes is defined, as
                    // there is no sound way to merge a type's deps with its prototype's deps
                    const Proto = Object.getPrototypeOf(Type);
                    if (typeof Proto === 'function' && Proto !== Function.prototype) {
                        dependencies = cloneArrayWithPossibleProps(getDependencies(Proto));
                    }
                    else {
                        dependencies = [];
                    }
                }
                else {
                    // No design:paramtypes so just use the au:annotation:di:paramtypes
                    dependencies = cloneArrayWithPossibleProps(annotationParamtypes);
                }
            }
            else if (annotationParamtypes === void 0) {
                // No au:annotation:di:paramtypes so just use the design:paramtypes
                dependencies = cloneArrayWithPossibleProps(designParamtypes);
            }
            else {
                // We've got both, so merge them (in case of conflict on same index, au:annotation:di:paramtypes take precedence)
                dependencies = cloneArrayWithPossibleProps(designParamtypes);
                let len = annotationParamtypes.length;
                let auAnnotationParamtype;
                let i = 0;
                for (; i < len; ++i) {
                    auAnnotationParamtype = annotationParamtypes[i];
                    if (auAnnotationParamtype !== void 0) {
                        dependencies[i] = auAnnotationParamtype;
                    }
                }
                const keys = Object.keys(annotationParamtypes);
                let key;
                i = 0;
                len = keys.length;
                for (i = 0; i < len; ++i) {
                    key = keys[i];
                    if (!isArrayIndex(key)) {
                        dependencies[key] = annotationParamtypes[key];
                    }
                }
            }
        }
        else {
            // Ignore paramtypes if we have static inject
            dependencies = cloneArrayWithPossibleProps(inject);
        }
        metadata.Metadata.define(key, dependencies, Type);
        Protocol.annotation.appendTo(Type, key);
    }
    return dependencies;
}
function getOrCreateAnnotationParamTypes(Type) {
    const key = Protocol.annotation.keyFor('di:paramtypes');
    let annotationParamtypes = metadata.Metadata.getOwn(key, Type);
    if (annotationParamtypes === void 0) {
        metadata.Metadata.define(key, annotationParamtypes = [], Type);
        Protocol.annotation.appendTo(Type, key);
    }
    return annotationParamtypes;
}
const IContainer = DI.createInterface('IContainer');
const IServiceLocator = IContainer;
function createResolver(getter) {
    return function (key) {
        const resolver = function (target, property, descriptor) {
            DI.inject(resolver)(target, property, descriptor);
        };
        resolver.$isResolver = true;
        resolver.resolve = function (handler, requestor) {
            return getter(key, handler, requestor);
        };
        return resolver;
    };
}
const inject = DI.inject;
function transientDecorator(target) {
    return DI.transient(target);
}
function transient(target) {
    return target == null ? transientDecorator : transientDecorator(target);
}
const defaultSingletonOptions = { scoped: false };
function singleton(targetOrOptions) {
    if (typeof targetOrOptions === 'function') {
        return DI.singleton(targetOrOptions);
    }
    return function ($target) {
        return DI.singleton($target, targetOrOptions);
    };
}
function createAllResolver(getter) {
    return function (key, searchAncestors) {
        searchAncestors = !!searchAncestors;
        const resolver = function (target, property, descriptor) {
            DI.inject(resolver)(target, property, descriptor);
        };
        resolver.$isResolver = true;
        resolver.resolve = function (handler, requestor) {
            return getter(key, handler, requestor, searchAncestors);
        };
        return resolver;
    };
}
const all = createAllResolver((key, handler, requestor, searchAncestors) => requestor.getAll(key, searchAncestors));
/**
 * Lazily inject a dependency depending on whether the [[`Key`]] is present at the time of function call.
 *
 * You need to make your argument a function that returns the type, for example
 * ```ts
 * class Foo {
 *   constructor( @lazy('random') public random: () => number )
 * }
 * const foo = container.get(Foo); // instanceof Foo
 * foo.random(); // throws
 * ```
 * would throw an exception because you haven't registered `'random'` before calling the method. This, would give you a
 * new [['Math.random()']] number each time.
 * ```ts
 * class Foo {
 *   constructor( @lazy('random') public random: () => random )
 * }
 * container.register(Registration.callback('random', Math.random ));
 * container.get(Foo).random(); // some random number
 * container.get(Foo).random(); // another random number
 * ```
 * `@lazy` does not manage the lifecycle of the underlying key. If you want a singleton, you have to register as a
 * `singleton`, `transient` would also behave as you would expect, providing you a new instance each time.
 *
 * - @param key [[`Key`]]
 * see { @link DI.createInterface } on interactions with interfaces
 */
const lazy = createResolver((key, handler, requestor) => {
    return () => requestor.get(key);
});
/**
 * Allows you to optionally inject a dependency depending on whether the [[`Key`]] is present, for example
 * ```ts
 * class Foo {
 *   constructor( @inject('mystring') public str: string = 'somestring' )
 * }
 * container.get(Foo); // throws
 * ```
 * would fail
 * ```ts
 * class Foo {
 *   constructor( @optional('mystring') public str: string = 'somestring' )
 * }
 * container.get(Foo).str // somestring
 * ```
 * if you use it without a default it will inject `undefined`, so rember to mark your input type as
 * possibly `undefined`!
 *
 * - @param key: [[`Key`]]
 *
 * see { @link DI.createInterface } on interactions with interfaces
 */
const optional = createResolver((key, handler, requestor) => {
    if (requestor.has(key, true)) {
        return requestor.get(key);
    }
    else {
        return undefined;
    }
});
/**
 * ignore tells the container not to try to inject a dependency
 */
function ignore(target, property, descriptor) {
    DI.inject(ignore)(target, property, descriptor);
}
ignore.$isResolver = true;
ignore.resolve = () => undefined;
/**
 * Inject a function that will return a resolved instance of the [[key]] given.
 * Also supports passing extra parameters to the invocation of the resolved constructor of [[key]]
 *
 * For typings, it's a function that take 0 or more arguments and return an instance. Example:
 * ```ts
 * class Foo {
 *   constructor( @factory(MyService) public createService: (...args: unknown[]) => MyService)
 * }
 * const foo = container.get(Foo); // instanceof Foo
 * const myService_1 = foo.createService('user service')
 * const myService_2 = foo.createService('content service')
 * ```
 *
 * ```ts
 * class Foo {
 *   constructor( @factory('random') public createRandomizer: () => Randomizer)
 * }
 * container.get(Foo).createRandomizer(); // create a randomizer
 * ```
 * would throw an exception because you haven't registered `'random'` before calling the method. This, would give you a
 * new instance of Randomizer each time.
 *
 * `@factory` does not manage the lifecycle of the underlying key. If you want a singleton, you have to register as a
 * `singleton`, `transient` would also behave as you would expect, providing you a new instance each time.
 *
 * - @param key [[`Key`]]
 * see { @link DI.createInterface } on interactions with interfaces
 */
const factory = createResolver((key, handler, requestor) => {
    return (...args) => handler.getFactory(key).construct(requestor, args);
});
const newInstanceForScope = createResolver((key, handler, requestor) => {
    const instance = createNewInstance(key, handler, requestor);
    const instanceProvider = new InstanceProvider(String(key), instance);
    requestor.registerResolver(key, instanceProvider);
    return instance;
});
const newInstanceOf = createResolver((key, handler, requestor) => createNewInstance(key, handler, requestor));
function createNewInstance(key, handler, requestor) {
    return handler.getFactory(key).construct(requestor);
}
/** @internal */
var ResolverStrategy;
(function (ResolverStrategy) {
    ResolverStrategy[ResolverStrategy["instance"] = 0] = "instance";
    ResolverStrategy[ResolverStrategy["singleton"] = 1] = "singleton";
    ResolverStrategy[ResolverStrategy["transient"] = 2] = "transient";
    ResolverStrategy[ResolverStrategy["callback"] = 3] = "callback";
    ResolverStrategy[ResolverStrategy["array"] = 4] = "array";
    ResolverStrategy[ResolverStrategy["alias"] = 5] = "alias";
})(ResolverStrategy || (ResolverStrategy = {}));
/** @internal */
class Resolver {
    constructor(key, strategy, state) {
        this.key = key;
        this.strategy = strategy;
        this.state = state;
        this.resolving = false;
    }
    get $isResolver() { return true; }
    register(container, key) {
        return container.registerResolver(key || this.key, this);
    }
    resolve(handler, requestor) {
        switch (this.strategy) {
            case 0 /* instance */:
                return this.state;
            case 1 /* singleton */: {
                if (this.resolving) {
                    {
                        throw new Error(`AUR0003:${this.state.name}`);
                    }
                }
                this.resolving = true;
                this.state = handler.getFactory(this.state).construct(requestor);
                this.strategy = 0 /* instance */;
                this.resolving = false;
                return this.state;
            }
            case 2 /* transient */: {
                // Always create transients from the requesting container
                const factory = handler.getFactory(this.state);
                if (factory === null) {
                    {
                        throw new Error(`AUR0004:${String(this.key)}`);
                    }
                }
                return factory.construct(requestor);
            }
            case 3 /* callback */:
                return this.state(handler, requestor, this);
            case 4 /* array */:
                return this.state[0].resolve(handler, requestor);
            case 5 /* alias */:
                return requestor.get(this.state);
            default:
                {
                    throw new Error(`AUR0005:${this.strategy}`);
                }
        }
    }
    getFactory(container) {
        var _a, _b, _c;
        switch (this.strategy) {
            case 1 /* singleton */:
            case 2 /* transient */:
                return container.getFactory(this.state);
            case 5 /* alias */:
                return (_c = (_b = (_a = container.getResolver(this.state)) === null || _a === void 0 ? void 0 : _a.getFactory) === null || _b === void 0 ? void 0 : _b.call(_a, container)) !== null && _c !== void 0 ? _c : null;
            default:
                return null;
        }
    }
}
function containerGetKey(d) {
    return this.get(d);
}
function transformInstance(inst, transform) {
    return transform(inst);
}
/** @internal */
class Factory {
    constructor(Type, dependencies) {
        this.Type = Type;
        this.dependencies = dependencies;
        this.transformers = null;
    }
    construct(container, dynamicDependencies) {
        let instance;
        if (dynamicDependencies === void 0) {
            instance = new this.Type(...this.dependencies.map(containerGetKey, container));
        }
        else {
            instance = new this.Type(...this.dependencies.map(containerGetKey, container), ...dynamicDependencies);
        }
        if (this.transformers == null) {
            return instance;
        }
        return this.transformers.reduce(transformInstance, instance);
    }
    registerTransformer(transformer) {
        var _a;
        ((_a = this.transformers) !== null && _a !== void 0 ? _a : (this.transformers = [])).push(transformer);
    }
}
const containerResolver = {
    $isResolver: true,
    resolve(handler, requestor) {
        return requestor;
    }
};
function isRegistry(obj) {
    return typeof obj.register === 'function';
}
function isSelfRegistry(obj) {
    return isRegistry(obj) && typeof obj.registerInRequestor === 'boolean';
}
function isRegisterInRequester(obj) {
    return isSelfRegistry(obj) && obj.registerInRequestor;
}
function isClass(obj) {
    return obj.prototype !== void 0;
}
function isResourceKey(key) {
    return typeof key === 'string' && key.indexOf(':') > 0;
}
const InstrinsicTypeNames = new Set([
    'Array',
    'ArrayBuffer',
    'Boolean',
    'DataView',
    'Date',
    'Error',
    'EvalError',
    'Float32Array',
    'Float64Array',
    'Function',
    'Int8Array',
    'Int16Array',
    'Int32Array',
    'Map',
    'Number',
    'Object',
    'Promise',
    'RangeError',
    'ReferenceError',
    'RegExp',
    'Set',
    'SharedArrayBuffer',
    'String',
    'SyntaxError',
    'TypeError',
    'Uint8Array',
    'Uint8ClampedArray',
    'Uint16Array',
    'Uint32Array',
    'URIError',
    'WeakMap',
    'WeakSet',
]);
const factoryKey = 'di:factory';
Protocol.annotation.keyFor(factoryKey);
let containerId = 0;
/** @internal */
class Container {
    constructor(parent, config) {
        this.parent = parent;
        this.config = config;
        this.id = ++containerId;
        this._registerDepth = 0;
        this._disposableResolvers = new Set();
        if (parent === null) {
            this.root = this;
            this._resolvers = new Map();
            this._factories = new Map();
            this.res = Object.create(null);
        }
        else {
            this.root = parent.root;
            this._resolvers = new Map();
            this._factories = parent._factories;
            if (config.inheritParentResources) {
                this.res = Object.assign(Object.create(null), parent.res, this.root.res);
            }
            else {
                this.res = Object.create(null);
            }
        }
        this._resolvers.set(IContainer, containerResolver);
    }
    get depth() {
        return this.parent === null ? 0 : this.parent.depth + 1;
    }
    register(...params) {
        if (++this._registerDepth === 100) {
            // TODO: change to reporter.error and add various possible causes in description.
            // Most likely cause is trying to register a plain object that does not have a
            // register method and is not a class constructor
            {
                throw new Error(`AUR0006:${params.map(String)}`);
            }
        }
        let current;
        let keys;
        let value;
        let j;
        let jj;
        let i = 0;
        // eslint-disable-next-line
        let ii = params.length;
        for (; i < ii; ++i) {
            current = params[i];
            if (!metadata.isObject(current)) {
                continue;
            }
            if (isRegistry(current)) {
                current.register(this);
            }
            else if (Protocol.resource.has(current)) {
                const defs = Protocol.resource.getAll(current);
                if (defs.length === 1) {
                    // Fast path for the very common case
                    defs[0].register(this);
                }
                else {
                    j = 0;
                    jj = defs.length;
                    while (jj > j) {
                        defs[j].register(this);
                        ++j;
                    }
                }
            }
            else if (isClass(current)) {
                Registration.singleton(current, current).register(this);
            }
            else {
                keys = Object.keys(current);
                j = 0;
                jj = keys.length;
                for (; j < jj; ++j) {
                    value = current[keys[j]];
                    if (!metadata.isObject(value)) {
                        continue;
                    }
                    // note: we could remove this if-branch and call this.register directly
                    // - the extra check is just a perf tweak to create fewer unnecessary arrays by the spread operator
                    if (isRegistry(value)) {
                        value.register(this);
                    }
                    else {
                        this.register(value);
                    }
                }
            }
        }
        --this._registerDepth;
        return this;
    }
    registerResolver(key, resolver, isDisposable = false) {
        validateKey(key);
        const resolvers = this._resolvers;
        const result = resolvers.get(key);
        if (result == null) {
            resolvers.set(key, resolver);
            if (isResourceKey(key)) {
                if (this.res[key] !== void 0) {
                    {
                        throw new Error(`AUR0007:${key}`);
                    }
                }
                this.res[key] = resolver;
            }
        }
        else if (result instanceof Resolver && result.strategy === 4 /* array */) {
            result.state.push(resolver);
        }
        else {
            resolvers.set(key, new Resolver(key, 4 /* array */, [result, resolver]));
        }
        if (isDisposable) {
            this._disposableResolvers.add(resolver);
        }
        return resolver;
    }
    // public deregisterResolverFor<K extends Key, T = K>(key: K): void {
    //   // const console =  (globalThis as any).console;
    //   // console.group("deregisterResolverFor");
    //   validateKey(key);
    //   let current: Container = this;
    //   let resolver: IResolver | undefined;
    //   while (current != null) {
    //     resolver = current.resolvers.get(key);
    //     if (resolver != null) { break; }
    //     if (current.parent == null) { return; }
    //     current = current.parent;
    //   }
    //   if (resolver === void 0) { return; }
    //   if (resolver instanceof Resolver && resolver.strategy === ResolverStrategy.array) {
    //     throw new Error('Cannot deregister a resolver with array strategy');
    //   }
    //   if (this.disposableResolvers.has(resolver as IDisposableResolver<T>)) {
    //     (resolver as IDisposableResolver<T>).dispose();
    //   }
    //   if (isResourceKey(key)) {
    //     // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
    //     delete this.resourceResolvers[key];
    //   }
    //   // console.log(`BEFORE delete ${Array.from(current.resolvers.keys()).map((k) => k.toString())}`);
    //   current.resolvers.delete(key);
    //   // console.log(`AFTER delete ${Array.from(current.resolvers.keys()).map((k) => k.toString())}`);
    //   // console.groupEnd();
    // }
    registerTransformer(key, transformer) {
        const resolver = this.getResolver(key);
        if (resolver == null) {
            return false;
        }
        if (resolver.getFactory) {
            const factory = resolver.getFactory(this);
            if (factory == null) {
                return false;
            }
            // This type cast is a bit of a hacky one, necessary due to the duplicity of IResolverLike.
            // Problem is that that interface's type arg can be of type Key, but the getFactory method only works on
            // type Constructable. So the return type of that optional method has this additional constraint, which
            // seems to confuse the type checker.
            factory.registerTransformer(transformer);
            return true;
        }
        return false;
    }
    getResolver(key, autoRegister = true) {
        validateKey(key);
        if (key.resolve !== void 0) {
            return key;
        }
        let current = this;
        let resolver;
        while (current != null) {
            resolver = current._resolvers.get(key);
            if (resolver == null) {
                if (current.parent == null) {
                    const handler = (isRegisterInRequester(key)) ? this : current;
                    return autoRegister ? this._jitRegister(key, handler) : null;
                }
                current = current.parent;
            }
            else {
                return resolver;
            }
        }
        return null;
    }
    has(key, searchAncestors = false) {
        return this._resolvers.has(key)
            ? true
            : searchAncestors && this.parent != null
                ? this.parent.has(key, true)
                : false;
    }
    get(key) {
        validateKey(key);
        if (key.$isResolver) {
            return key.resolve(this, this);
        }
        let current = this;
        let resolver;
        while (current != null) {
            resolver = current._resolvers.get(key);
            if (resolver == null) {
                if (current.parent == null) {
                    const handler = (isRegisterInRequester(key)) ? this : current;
                    resolver = this._jitRegister(key, handler);
                    return resolver.resolve(current, this);
                }
                current = current.parent;
            }
            else {
                return resolver.resolve(current, this);
            }
        }
        {
            throw new Error(`AUR0008:${key}`);
        }
    }
    getAll(key, searchAncestors = false) {
        validateKey(key);
        const requestor = this;
        let current = requestor;
        let resolver;
        if (searchAncestors) {
            let resolutions = emptyArray;
            while (current != null) {
                resolver = current._resolvers.get(key);
                if (resolver != null) {
                    resolutions = resolutions.concat(buildAllResponse(resolver, current, requestor));
                }
                current = current.parent;
            }
            return resolutions;
        }
        else {
            while (current != null) {
                resolver = current._resolvers.get(key);
                if (resolver == null) {
                    current = current.parent;
                    if (current == null) {
                        return emptyArray;
                    }
                }
                else {
                    return buildAllResponse(resolver, current, requestor);
                }
            }
        }
        return emptyArray;
    }
    invoke(Type, dynamicDependencies) {
        if (isNativeFunction(Type)) {
            throw createNativeInvocationError(Type);
        }
        if (dynamicDependencies === void 0) {
            return new Type(...getDependencies(Type).map(containerGetKey, this));
        }
        else {
            return new Type(...getDependencies(Type).map(containerGetKey, this), ...dynamicDependencies);
        }
    }
    getFactory(Type) {
        let factory = this._factories.get(Type);
        if (factory === void 0) {
            if (isNativeFunction(Type)) {
                throw createNativeInvocationError(Type);
            }
            this._factories.set(Type, factory = new Factory(Type, getDependencies(Type)));
        }
        return factory;
    }
    registerFactory(key, factory) {
        this._factories.set(key, factory);
    }
    createChild(config) {
        if (config === void 0 && this.config.inheritParentResources) {
            if (this.config === ContainerConfiguration.DEFAULT) {
                return new Container(this, this.config);
            }
            return new Container(this, ContainerConfiguration.from({
                ...this.config,
                inheritParentResources: false,
            }));
        }
        return new Container(this, ContainerConfiguration.from(config !== null && config !== void 0 ? config : this.config));
    }
    disposeResolvers() {
        let disposeable;
        for (disposeable of this._disposableResolvers) {
            disposeable.dispose();
        }
    }
    find(kind, name) {
        const key = kind.keyFrom(name);
        let resolver = this.res[key];
        if (resolver === void 0) {
            resolver = this.root.res[key];
            if (resolver === void 0) {
                return null;
            }
        }
        if (resolver === null) {
            return null;
        }
        if (typeof resolver.getFactory === 'function') {
            const factory = resolver.getFactory(this);
            if (factory === null || factory === void 0) {
                return null;
            }
            const definition = metadata.Metadata.getOwn(kind.name, factory.Type);
            if (definition === void 0) {
                // TODO: we may want to log a warning here, or even throw. This would happen if a dependency is registered with a resource-like key
                // but does not actually have a definition associated via the type's metadata. That *should* generally not happen.
                return null;
            }
            return definition;
        }
        return null;
    }
    create(kind, name) {
        var _a, _b;
        const key = kind.keyFrom(name);
        let resolver = this.res[key];
        if (resolver === void 0) {
            resolver = this.root.res[key];
            if (resolver === void 0) {
                return null;
            }
            return (_a = resolver.resolve(this.root, this)) !== null && _a !== void 0 ? _a : null;
        }
        return (_b = resolver.resolve(this, this)) !== null && _b !== void 0 ? _b : null;
    }
    dispose() {
        if (this._disposableResolvers.size > 0) {
            this.disposeResolvers();
        }
        this._resolvers.clear();
    }
    _jitRegister(keyAsValue, handler) {
        if (typeof keyAsValue !== 'function') {
            {
                throw new Error(`AUR0009:${keyAsValue}`);
            }
        }
        if (InstrinsicTypeNames.has(keyAsValue.name)) {
            {
                throw new Error(`AUR0010:${keyAsValue.name}`);
            }
        }
        if (isRegistry(keyAsValue)) {
            const registrationResolver = keyAsValue.register(handler, keyAsValue);
            if (!(registrationResolver instanceof Object) || registrationResolver.resolve == null) {
                const newResolver = handler._resolvers.get(keyAsValue);
                if (newResolver != void 0) {
                    return newResolver;
                }
                {
                    throw new Error(`AUR0011`);
                }
            }
            return registrationResolver;
        }
        else if (Protocol.resource.has(keyAsValue)) {
            const defs = Protocol.resource.getAll(keyAsValue);
            if (defs.length === 1) {
                // Fast path for the very common case
                defs[0].register(handler);
            }
            else {
                const len = defs.length;
                for (let d = 0; d < len; ++d) {
                    defs[d].register(handler);
                }
            }
            const newResolver = handler._resolvers.get(keyAsValue);
            if (newResolver != void 0) {
                return newResolver;
            }
            {
                throw new Error(`AUR0011`);
            }
        }
        else if (keyAsValue.$isInterface) {
            {
                throw new Error(`AUR0012:${keyAsValue.friendlyName}`);
            }
        }
        else {
            const resolver = this.config.defaultResolver(keyAsValue, handler);
            handler._resolvers.set(keyAsValue, resolver);
            return resolver;
        }
    }
}
/**
 * An implementation of IRegistry that delegates registration to a
 * separately registered class. The ParameterizedRegistry facilitates the
 * passing of parameters to the final registry.
 */
class ParameterizedRegistry {
    constructor(key, params) {
        this.key = key;
        this.params = params;
    }
    register(container) {
        if (container.has(this.key, true)) {
            const registry = container.get(this.key);
            registry.register(container, ...this.params);
        }
        else {
            container.register(...this.params.filter(x => typeof x === 'object'));
        }
    }
}
const containerLookup = new WeakMap();
function cacheCallbackResult(fun) {
    return function (handler, requestor, resolver) {
        let resolverLookup = containerLookup.get(handler);
        if (resolverLookup === void 0) {
            containerLookup.set(handler, resolverLookup = new WeakMap());
        }
        if (resolverLookup.has(resolver)) {
            return resolverLookup.get(resolver);
        }
        const t = fun(handler, requestor, resolver);
        resolverLookup.set(resolver, t);
        return t;
    };
}
/**
 * you can use the resulting {@linkcode IRegistration} of any of the factory methods
 * to register with the container, e.g.
 * ```
 * class Foo {}
 * const container = DI.createContainer();
 * container.register(Registration.instance(Foo, new Foo()));
 * container.get(Foo);
 * ```
 */
const Registration = {
    /**
     * allows you to pass an instance.
     * Every time you request this {@linkcode Key} you will get this instance back.
     * ```
     * Registration.instance(Foo, new Foo()));
     * ```
     *
     * @param key
     * @param value
     */
    instance(key, value) {
        return new Resolver(key, 0 /* instance */, value);
    },
    /**
     * Creates an instance from the class.
     * Every time you request this {@linkcode Key} you will get the same one back.
     * ```
     * Registration.singleton(Foo, Foo);
     * ```
     *
     * @param key
     * @param value
     */
    singleton(key, value) {
        return new Resolver(key, 1 /* singleton */, value);
    },
    /**
     * Creates an instance from a class.
     * Every time you request this {@linkcode Key} you will get a new instance.
     * ```
     * Registration.instance(Foo, Foo);
     * ```
     *
     * @param key
     * @param value
     */
    transient(key, value) {
        return new Resolver(key, 2 /* transient */, value);
    },
    /**
     * Creates an instance from the method passed.
     * Every time you request this {@linkcode Key} you will get a new instance.
     * ```
     * Registration.callback(Foo, () => new Foo());
     * Registration.callback(Bar, (c: IContainer) => new Bar(c.get(Foo)));
     * ```
     *
     * @param key
     * @param callback
     */
    callback(key, callback) {
        return new Resolver(key, 3 /* callback */, callback);
    },
    /**
     * Creates an instance from the method passed.
     * On the first request for the {@linkcode Key} your callback is called and returns an instance.
     * subsequent requests for the {@linkcode Key}, the initial instance returned will be returned.
     * If you pass the same {@linkcode Registration} to another container the same cached value will be used.
     * Should all references to the resolver returned be removed, the cache will expire.
     * ```
     * Registration.cachedCallback(Foo, () => new Foo());
     * Registration.cachedCallback(Bar, (c: IContainer) => new Bar(c.get(Foo)));
     * ```
     *
     * @param key
     * @param callback
     */
    cachedCallback(key, callback) {
        return new Resolver(key, 3 /* callback */, cacheCallbackResult(callback));
    },
    /**
     * creates an alternate {@linkcode Key} to retrieve an instance by.
     * Returns the same scope as the original {@linkcode Key}.
     * ```
     * Register.singleton(Foo, Foo)
     * Register.aliasTo(Foo, MyFoos);
     *
     * container.getAll(MyFoos) // contains an instance of Foo
     * ```
     *
     * @param originalKey
     * @param aliasKey
     */
    aliasTo(originalKey, aliasKey) {
        return new Resolver(aliasKey, 5 /* alias */, originalKey);
    },
    /**
     * @internal
     * @param key
     * @param params
     */
    defer(key, ...params) {
        return new ParameterizedRegistry(key, params);
    }
};
class InstanceProvider {
    constructor(_name, 
    /**
     * if not undefined, then this is the value this provider will resolve to
     * until overridden by explicit prepare call
     */
    instance) {
        this._instance = null;
        this._name = _name;
        if (instance !== void 0) {
            this._instance = instance;
        }
    }
    get friendlyName() {
        return this._name;
    }
    prepare(instance) {
        this._instance = instance;
    }
    get $isResolver() { return true; }
    resolve() {
        if (this._instance == null) {
            {
                throw new Error(`AUR0013:${this._name}`);
            }
        }
        return this._instance;
    }
    dispose() {
        this._instance = null;
    }
}
/** @internal */
function validateKey(key) {
    if (key === null || key === void 0) {
        {
            throw new Error(`AUR0014`);
        }
    }
}
function buildAllResponse(resolver, handler, requestor) {
    if (resolver instanceof Resolver && resolver.strategy === 4 /* array */) {
        const state = resolver.state;
        let i = state.length;
        const results = new Array(i);
        while (i--) {
            results[i] = state[i].resolve(handler, requestor);
        }
        return results;
    }
    return [resolver.resolve(handler, requestor)];
}
function createNativeInvocationError(Type) {
    return new Error(`AUR0015:${Type.name}`);
}

/* eslint-disable @typescript-eslint/no-unsafe-assignment,@typescript-eslint/no-explicit-any */
const emptyArray = Object.freeze([]);
const emptyObject = Object.freeze({});
/* eslint-enable @typescript-eslint/no-unsafe-assignment,@typescript-eslint/no-explicit-any */
// eslint-disable-next-line @typescript-eslint/no-empty-function
function noop() { }
const IPlatform = DI.createInterface('IPlatform');

/*! *****************************************************************************
Copyright (c) Microsoft Corporation.

Permission to use, copy, modify, and/or distribute this software for any
purpose with or without fee is hereby granted.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
PERFORMANCE OF THIS SOFTWARE.
***************************************************************************** */

function __decorate(decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
}

function __param(paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
}

exports.LogLevel = void 0;
(function (LogLevel) {
    /**
     * The most detailed information about internal app state.
     *
     * Disabled by default and should never be enabled in a production environment.
     */
    LogLevel[LogLevel["trace"] = 0] = "trace";
    /**
     * Information that is useful for debugging during development and has no long-term value.
     */
    LogLevel[LogLevel["debug"] = 1] = "debug";
    /**
     * Information about the general flow of the application that has long-term value.
     */
    LogLevel[LogLevel["info"] = 2] = "info";
    /**
     * Unexpected circumstances that require attention but do not otherwise cause the current flow of execution to stop.
     */
    LogLevel[LogLevel["warn"] = 3] = "warn";
    /**
     * Unexpected circumstances that cause the flow of execution in the current activity to stop but do not cause an app-wide failure.
     */
    LogLevel[LogLevel["error"] = 4] = "error";
    /**
     * Unexpected circumstances that cause an app-wide failure or otherwise require immediate attention.
     */
    LogLevel[LogLevel["fatal"] = 5] = "fatal";
    /**
     * No messages should be written.
     */
    LogLevel[LogLevel["none"] = 6] = "none";
})(exports.LogLevel || (exports.LogLevel = {}));
/**
 * Flags to enable/disable color usage in the logging output.
 */
exports.ColorOptions = void 0;
(function (ColorOptions) {
    /**
     * Do not use ASCII color codes in logging output.
     */
    ColorOptions[ColorOptions["noColors"] = 0] = "noColors";
    /**
     * Use ASCII color codes in logging output. By default, timestamps and the TRC and DBG prefix are colored grey. INF white, WRN yellow, and ERR and FTL red.
     */
    ColorOptions[ColorOptions["colors"] = 1] = "colors";
})(exports.ColorOptions || (exports.ColorOptions = {}));
const ILogConfig = DI.createInterface('ILogConfig', x => x.instance(new LogConfig(0 /* noColors */, 3 /* warn */)));
const ISink = DI.createInterface('ISink');
const ILogEventFactory = DI.createInterface('ILogEventFactory', x => x.singleton(exports.DefaultLogEventFactory));
const ILogger = DI.createInterface('ILogger', x => x.singleton(exports.DefaultLogger));
const ILogScopes = DI.createInterface('ILogScope');
const LoggerSink = Object.freeze({
    key: Protocol.annotation.keyFor('logger-sink-handles'),
    define(target, definition) {
        metadata.Metadata.define(this.key, definition.handles, target.prototype);
        return target;
    },
    getHandles(target) {
        return metadata.Metadata.get(this.key, target);
    },
});
function sink(definition) {
    return function (target) {
        return LoggerSink.define(target, definition);
    };
}
// http://en.wikipedia.org/wiki/ANSI_escape_code#graphics
const format = toLookup({
    red(str) {
        return `\u001b[31m${str}\u001b[39m`;
    },
    green(str) {
        return `\u001b[32m${str}\u001b[39m`;
    },
    yellow(str) {
        return `\u001b[33m${str}\u001b[39m`;
    },
    blue(str) {
        return `\u001b[34m${str}\u001b[39m`;
    },
    magenta(str) {
        return `\u001b[35m${str}\u001b[39m`;
    },
    cyan(str) {
        return `\u001b[36m${str}\u001b[39m`;
    },
    white(str) {
        return `\u001b[37m${str}\u001b[39m`;
    },
    grey(str) {
        return `\u001b[90m${str}\u001b[39m`;
    },
});
class LogConfig {
    constructor(colorOptions, level) {
        this.colorOptions = colorOptions;
        this.level = level;
    }
}
const getLogLevelString = (function () {
    const logLevelString = [
        toLookup({
            TRC: 'TRC',
            DBG: 'DBG',
            INF: 'INF',
            WRN: 'WRN',
            ERR: 'ERR',
            FTL: 'FTL',
            QQQ: '???',
        }),
        toLookup({
            TRC: format.grey('TRC'),
            DBG: format.grey('DBG'),
            INF: format.white('INF'),
            WRN: format.yellow('WRN'),
            ERR: format.red('ERR'),
            FTL: format.red('FTL'),
            QQQ: format.grey('???'),
        }),
    ];
    return function (level, colorOptions) {
        if (level <= 0 /* trace */) {
            return logLevelString[colorOptions].TRC;
        }
        if (level <= 1 /* debug */) {
            return logLevelString[colorOptions].DBG;
        }
        if (level <= 2 /* info */) {
            return logLevelString[colorOptions].INF;
        }
        if (level <= 3 /* warn */) {
            return logLevelString[colorOptions].WRN;
        }
        if (level <= 4 /* error */) {
            return logLevelString[colorOptions].ERR;
        }
        if (level <= 5 /* fatal */) {
            return logLevelString[colorOptions].FTL;
        }
        return logLevelString[colorOptions].QQQ;
    };
})();
function getScopeString(scope, colorOptions) {
    if (colorOptions === 0 /* noColors */) {
        return scope.join('.');
    }
    return scope.map(format.cyan).join('.');
}
function getIsoString(timestamp, colorOptions) {
    if (colorOptions === 0 /* noColors */) {
        return new Date(timestamp).toISOString();
    }
    return format.grey(new Date(timestamp).toISOString());
}
class DefaultLogEvent {
    constructor(severity, message, optionalParams, scope, colorOptions, timestamp) {
        this.severity = severity;
        this.message = message;
        this.optionalParams = optionalParams;
        this.scope = scope;
        this.colorOptions = colorOptions;
        this.timestamp = timestamp;
    }
    toString() {
        const { severity, message, scope, colorOptions, timestamp } = this;
        if (scope.length === 0) {
            return `${getIsoString(timestamp, colorOptions)} [${getLogLevelString(severity, colorOptions)}] ${message}`;
        }
        return `${getIsoString(timestamp, colorOptions)} [${getLogLevelString(severity, colorOptions)} ${getScopeString(scope, colorOptions)}] ${message}`;
    }
}
exports.DefaultLogEventFactory = class DefaultLogEventFactory {
    constructor(config) {
        this.config = config;
    }
    createLogEvent(logger, level, message, optionalParams) {
        return new DefaultLogEvent(level, message, optionalParams, logger.scope, this.config.colorOptions, Date.now());
    }
};
exports.DefaultLogEventFactory = __decorate([
    __param(0, ILogConfig)
], exports.DefaultLogEventFactory);
exports.ConsoleSink = class ConsoleSink {
    constructor(p) {
        const $console = p.console;
        this.handleEvent = function emit(event) {
            const optionalParams = event.optionalParams;
            if (optionalParams === void 0 || optionalParams.length === 0) {
                const msg = event.toString();
                switch (event.severity) {
                    case 0 /* trace */:
                    case 1 /* debug */:
                        return $console.debug(msg);
                    case 2 /* info */:
                        return $console.info(msg);
                    case 3 /* warn */:
                        return $console.warn(msg);
                    case 4 /* error */:
                    case 5 /* fatal */:
                        return $console.error(msg);
                }
            }
            else {
                let msg = event.toString();
                let offset = 0;
                // console.log in chrome doesn't call .toString() on object inputs (https://bugs.chromium.org/p/chromium/issues/detail?id=1146817)
                while (msg.includes('%s')) {
                    msg = msg.replace('%s', String(optionalParams[offset++]));
                }
                switch (event.severity) {
                    case 0 /* trace */:
                    case 1 /* debug */:
                        return $console.debug(msg, ...optionalParams.slice(offset));
                    case 2 /* info */:
                        return $console.info(msg, ...optionalParams.slice(offset));
                    case 3 /* warn */:
                        return $console.warn(msg, ...optionalParams.slice(offset));
                    case 4 /* error */:
                    case 5 /* fatal */:
                        return $console.error(msg, ...optionalParams.slice(offset));
                }
            }
        };
    }
    static register(container) {
        Registration.singleton(ISink, ConsoleSink).register(container);
    }
};
exports.ConsoleSink = __decorate([
    __param(0, IPlatform)
], exports.ConsoleSink);
exports.DefaultLogger = class DefaultLogger {
    constructor(
    /**
     * The global logger configuration.
     */
    config, factory, sinks, 
    /**
     * The scopes that this logger was created for, if any.
     */
    scope = [], parent = null) {
        var _a, _b, _c, _d, _e, _f;
        this.config = config;
        this.factory = factory;
        this.scope = scope;
        this.scopedLoggers = Object.create(null);
        let traceSinks;
        let debugSinks;
        let infoSinks;
        let warnSinks;
        let errorSinks;
        let fatalSinks;
        if (parent === null) {
            this.root = this;
            this.parent = this;
            traceSinks = this.traceSinks = [];
            debugSinks = this.debugSinks = [];
            infoSinks = this.infoSinks = [];
            warnSinks = this.warnSinks = [];
            errorSinks = this.errorSinks = [];
            fatalSinks = this.fatalSinks = [];
            for (const $sink of sinks) {
                const handles = LoggerSink.getHandles($sink);
                if ((_a = handles === null || handles === void 0 ? void 0 : handles.includes(0 /* trace */)) !== null && _a !== void 0 ? _a : true) {
                    traceSinks.push($sink);
                }
                if ((_b = handles === null || handles === void 0 ? void 0 : handles.includes(1 /* debug */)) !== null && _b !== void 0 ? _b : true) {
                    debugSinks.push($sink);
                }
                if ((_c = handles === null || handles === void 0 ? void 0 : handles.includes(2 /* info */)) !== null && _c !== void 0 ? _c : true) {
                    infoSinks.push($sink);
                }
                if ((_d = handles === null || handles === void 0 ? void 0 : handles.includes(3 /* warn */)) !== null && _d !== void 0 ? _d : true) {
                    warnSinks.push($sink);
                }
                if ((_e = handles === null || handles === void 0 ? void 0 : handles.includes(4 /* error */)) !== null && _e !== void 0 ? _e : true) {
                    errorSinks.push($sink);
                }
                if ((_f = handles === null || handles === void 0 ? void 0 : handles.includes(5 /* fatal */)) !== null && _f !== void 0 ? _f : true) {
                    fatalSinks.push($sink);
                }
            }
        }
        else {
            this.root = parent.root;
            this.parent = parent;
            traceSinks = this.traceSinks = parent.traceSinks;
            debugSinks = this.debugSinks = parent.debugSinks;
            infoSinks = this.infoSinks = parent.infoSinks;
            warnSinks = this.warnSinks = parent.warnSinks;
            errorSinks = this.errorSinks = parent.errorSinks;
            fatalSinks = this.fatalSinks = parent.fatalSinks;
        }
    }
    trace(messageOrGetMessage, ...optionalParams) {
        if (this.config.level <= 0 /* trace */) {
            this.emit(this.traceSinks, 0 /* trace */, messageOrGetMessage, optionalParams);
        }
    }
    debug(messageOrGetMessage, ...optionalParams) {
        if (this.config.level <= 1 /* debug */) {
            this.emit(this.debugSinks, 1 /* debug */, messageOrGetMessage, optionalParams);
        }
    }
    info(messageOrGetMessage, ...optionalParams) {
        if (this.config.level <= 2 /* info */) {
            this.emit(this.infoSinks, 2 /* info */, messageOrGetMessage, optionalParams);
        }
    }
    warn(messageOrGetMessage, ...optionalParams) {
        if (this.config.level <= 3 /* warn */) {
            this.emit(this.warnSinks, 3 /* warn */, messageOrGetMessage, optionalParams);
        }
    }
    error(messageOrGetMessage, ...optionalParams) {
        if (this.config.level <= 4 /* error */) {
            this.emit(this.errorSinks, 4 /* error */, messageOrGetMessage, optionalParams);
        }
    }
    fatal(messageOrGetMessage, ...optionalParams) {
        if (this.config.level <= 5 /* fatal */) {
            this.emit(this.fatalSinks, 5 /* fatal */, messageOrGetMessage, optionalParams);
        }
    }
    /**
     * Create a new logger with an additional permanent prefix added to the logging outputs.
     * When chained, multiple scopes are separated by a dot.
     *
     * This is preliminary API and subject to change before alpha release.
     *
     * @example
     *
     * ```ts
     * export class MyComponent {
     *   constructor(@ILogger private logger: ILogger) {
     *     this.logger.debug('before scoping');
     *     // console output: '[DBG] before scoping'
     *     this.logger = logger.scopeTo('MyComponent');
     *     this.logger.debug('after scoping');
     *     // console output: '[DBG MyComponent] after scoping'
     *   }
     *
     *   public doStuff(): void {
     *     const logger = this.logger.scopeTo('doStuff()');
     *     logger.debug('doing stuff');
     *     // console output: '[DBG MyComponent.doStuff()] doing stuff'
     *   }
     * }
     * ```
     */
    scopeTo(name) {
        const scopedLoggers = this.scopedLoggers;
        let scopedLogger = scopedLoggers[name];
        if (scopedLogger === void 0) {
            scopedLogger = scopedLoggers[name] = new DefaultLogger(this.config, this.factory, (void 0), this.scope.concat(name), this);
        }
        return scopedLogger;
    }
    emit(sinks, level, msgOrGetMsg, optionalParams) {
        const message = typeof msgOrGetMsg === 'function' ? msgOrGetMsg() : msgOrGetMsg;
        const event = this.factory.createLogEvent(this, level, message, optionalParams);
        for (let i = 0, ii = sinks.length; i < ii; ++i) {
            sinks[i].handleEvent(event);
        }
    }
};
__decorate([
    bound
], exports.DefaultLogger.prototype, "trace", null);
__decorate([
    bound
], exports.DefaultLogger.prototype, "debug", null);
__decorate([
    bound
], exports.DefaultLogger.prototype, "info", null);
__decorate([
    bound
], exports.DefaultLogger.prototype, "warn", null);
__decorate([
    bound
], exports.DefaultLogger.prototype, "error", null);
__decorate([
    bound
], exports.DefaultLogger.prototype, "fatal", null);
exports.DefaultLogger = __decorate([
    __param(0, ILogConfig),
    __param(1, ILogEventFactory),
    __param(2, all(ISink)),
    __param(3, optional(ILogScopes)),
    __param(4, ignore)
], exports.DefaultLogger);
/**
 * A basic `ILogger` configuration that configures a single `console` sink based on provided options.
 *
 * NOTE: You *must* register the return value of `.create` with the container / au instance, not this `LoggerConfiguration` object itself.
 *
 * @example
 * ```ts
 * container.register(LoggerConfiguration.create());
 *
 * container.register(LoggerConfiguration.create({sinks: [ConsoleSink]}))
 *
 * container.register(LoggerConfiguration.create({sinks: [ConsoleSink], level: LogLevel.debug}))
 *
 * ```
 */
const LoggerConfiguration = toLookup({
    /**
     * @param $console - The `console` object to use. Can be the native `window.console` / `global.console`, but can also be a wrapper or mock that implements the same interface.
     * @param level - The global `LogLevel` to configure. Defaults to `warn` or higher.
     * @param colorOptions - Whether to use colors or not. Defaults to `noColors`. Colors are especially nice in nodejs environments but don't necessarily work (well) in all environments, such as browsers.
     */
    create({ level = 3 /* warn */, colorOptions = 0 /* noColors */, sinks = [], } = {}) {
        return toLookup({
            register(container) {
                container.register(Registration.instance(ILogConfig, new LogConfig(colorOptions, level)));
                for (const $sink of sinks) {
                    if (typeof $sink === 'function') {
                        container.register(Registration.singleton(ISink, $sink));
                    }
                    else {
                        container.register($sink);
                    }
                }
                return container;
            },
        });
    },
});

const IModuleLoader = DI.createInterface(x => x.singleton(ModuleLoader));
function noTransform(m) {
    return m;
}
class ModuleTransformer {
    constructor($transform) {
        this.$transform = $transform;
        this._promiseCache = new Map();
        this._objectCache = new Map();
    }
    transform(objOrPromise) {
        if (objOrPromise instanceof Promise) {
            return this._transformPromise(objOrPromise);
        }
        else if (typeof objOrPromise === 'object' && objOrPromise !== null) {
            return this._transformObject(objOrPromise);
        }
        else {
            throw new Error(`Invalid input: ${String(objOrPromise)}. Expected Promise or Object.`);
        }
    }
    _transformPromise(promise) {
        if (this._promiseCache.has(promise)) {
            return this._promiseCache.get(promise);
        }
        const ret = promise.then(obj => {
            return this._transformObject(obj);
        });
        this._promiseCache.set(promise, ret);
        void ret.then(value => {
            // make it synchronous for future requests
            this._promiseCache.set(promise, value);
        });
        return ret;
    }
    _transformObject(obj) {
        if (this._objectCache.has(obj)) {
            return this._objectCache.get(obj);
        }
        const ret = this.$transform(this._analyze(obj));
        this._objectCache.set(obj, ret);
        if (ret instanceof Promise) {
            void ret.then(value => {
                // make it synchronous for future requests
                this._objectCache.set(obj, value);
            });
        }
        return ret;
    }
    _analyze(m) {
        let value;
        let isRegistry;
        let isConstructable;
        let definitions;
        const items = [];
        for (const key in m) {
            switch (typeof (value = m[key])) {
                case 'object':
                    if (value === null) {
                        continue;
                    }
                    isRegistry = typeof value.register === 'function';
                    isConstructable = false;
                    definitions = emptyArray;
                    break;
                case 'function':
                    isRegistry = typeof value.register === 'function';
                    isConstructable = value.prototype !== void 0;
                    definitions = Protocol.resource.getAll(value);
                    break;
                default:
                    continue;
            }
            items.push(new ModuleItem(key, value, isRegistry, isConstructable, definitions));
        }
        return new AnalyzedModule(m, items);
    }
}
class ModuleLoader {
    constructor() {
        this.transformers = new Map();
    }
    load(objOrPromise, transform = noTransform) {
        const transformers = this.transformers;
        let transformer = transformers.get(transform);
        if (transformer === void 0) {
            transformers.set(transform, transformer = new ModuleTransformer(transform));
        }
        return transformer.transform(objOrPromise);
    }
    dispose() {
        this.transformers.clear();
    }
}
class AnalyzedModule {
    constructor(raw, items) {
        this.raw = raw;
        this.items = items;
    }
}
class ModuleItem {
    constructor(key, value, isRegistry, isConstructable, definitions) {
        this.key = key;
        this.value = value;
        this.isRegistry = isRegistry;
        this.isConstructable = isConstructable;
        this.definitions = definitions;
    }
}

/* eslint-disable @typescript-eslint/restrict-template-expressions */
/**
 * Represents a handler for an EventAggregator event.
 */
class Handler {
    constructor(messageType, callback) {
        this.messageType = messageType;
        this.callback = callback;
    }
    handle(message) {
        if (message instanceof this.messageType) {
            this.callback.call(null, message);
        }
    }
}
const IEventAggregator = DI.createInterface('IEventAggregator', x => x.singleton(EventAggregator));
/**
 * Enables loosely coupled publish/subscribe messaging.
 */
class EventAggregator {
    constructor() {
        /** @internal */
        this.eventLookup = {};
        /** @internal */
        this.messageHandlers = [];
    }
    publish(channelOrInstance, message) {
        if (!channelOrInstance) {
            throw new Error(`Invalid channel name or instance: ${channelOrInstance}.`);
        }
        if (typeof channelOrInstance === 'string') {
            let subscribers = this.eventLookup[channelOrInstance];
            if (subscribers !== void 0) {
                subscribers = subscribers.slice();
                let i = subscribers.length;
                while (i-- > 0) {
                    subscribers[i](message, channelOrInstance);
                }
            }
        }
        else {
            const subscribers = this.messageHandlers.slice();
            let i = subscribers.length;
            while (i-- > 0) {
                subscribers[i].handle(channelOrInstance);
            }
        }
    }
    subscribe(channelOrType, callback) {
        if (!channelOrType) {
            throw new Error(`Invalid channel name or type: ${channelOrType}.`);
        }
        let handler;
        let subscribers;
        if (typeof channelOrType === 'string') {
            if (this.eventLookup[channelOrType] === void 0) {
                this.eventLookup[channelOrType] = [];
            }
            handler = callback;
            subscribers = this.eventLookup[channelOrType];
        }
        else {
            handler = new Handler(channelOrType, callback);
            subscribers = this.messageHandlers;
        }
        subscribers.push(handler);
        return {
            dispose() {
                const idx = subscribers.indexOf(handler);
                if (idx !== -1) {
                    subscribers.splice(idx, 1);
                }
            }
        };
    }
    subscribeOnce(channelOrType, callback) {
        const sub = this.subscribe(channelOrType, function (message, event) {
            sub.dispose();
            callback(message, event);
        });
        return sub;
    }
}

Object.defineProperty(exports, 'Metadata', {
    enumerable: true,
    get: function () {
        return metadata.Metadata;
    }
});
Object.defineProperty(exports, 'applyMetadataPolyfill', {
    enumerable: true,
    get: function () {
        return metadata.applyMetadataPolyfill;
    }
});
Object.defineProperty(exports, 'isNullOrUndefined', {
    enumerable: true,
    get: function () {
        return metadata.isNullOrUndefined;
    }
});
Object.defineProperty(exports, 'isObject', {
    enumerable: true,
    get: function () {
        return metadata.isObject;
    }
});
Object.defineProperty(exports, 'metadata', {
    enumerable: true,
    get: function () {
        return metadata.metadata;
    }
});
Object.defineProperty(exports, 'Platform', {
    enumerable: true,
    get: function () {
        return platform.Platform;
    }
});
Object.defineProperty(exports, 'Task', {
    enumerable: true,
    get: function () {
        return platform.Task;
    }
});
Object.defineProperty(exports, 'TaskAbortError', {
    enumerable: true,
    get: function () {
        return platform.TaskAbortError;
    }
});
Object.defineProperty(exports, 'TaskQueue', {
    enumerable: true,
    get: function () {
        return platform.TaskQueue;
    }
});
Object.defineProperty(exports, 'TaskQueuePriority', {
    enumerable: true,
    get: function () {
        return platform.TaskQueuePriority;
    }
});
Object.defineProperty(exports, 'TaskStatus', {
    enumerable: true,
    get: function () {
        return platform.TaskStatus;
    }
});
exports.AnalyzedModule = AnalyzedModule;
exports.ContainerConfiguration = ContainerConfiguration;
exports.DI = DI;
exports.DefaultLogEvent = DefaultLogEvent;
exports.DefaultResolver = DefaultResolver;
exports.EventAggregator = EventAggregator;
exports.IContainer = IContainer;
exports.IEventAggregator = IEventAggregator;
exports.ILogConfig = ILogConfig;
exports.ILogEventFactory = ILogEventFactory;
exports.ILogger = ILogger;
exports.IModuleLoader = IModuleLoader;
exports.IPlatform = IPlatform;
exports.IServiceLocator = IServiceLocator;
exports.ISink = ISink;
exports.InstanceProvider = InstanceProvider;
exports.LogConfig = LogConfig;
exports.LoggerConfiguration = LoggerConfiguration;
exports.ModuleItem = ModuleItem;
exports.Protocol = Protocol;
exports.Registration = Registration;
exports.all = all;
exports.bound = bound;
exports.camelCase = camelCase;
exports.compareNumber = compareNumber;
exports.emptyArray = emptyArray;
exports.emptyObject = emptyObject;
exports.factory = factory;
exports.firstDefined = firstDefined;
exports.format = format;
exports.fromAnnotationOrDefinitionOrTypeOrDefault = fromAnnotationOrDefinitionOrTypeOrDefault;
exports.fromAnnotationOrTypeOrDefault = fromAnnotationOrTypeOrDefault;
exports.fromDefinitionOrDefault = fromDefinitionOrDefault;
exports.getPrototypeChain = getPrototypeChain;
exports.ignore = ignore;
exports.inject = inject;
exports.isArrayIndex = isArrayIndex;
exports.isNativeFunction = isNativeFunction;
exports.isNumberOrBigInt = isNumberOrBigInt;
exports.isStringOrDate = isStringOrDate;
exports.kebabCase = kebabCase;
exports.lazy = lazy;
exports.mergeArrays = mergeArrays;
exports.mergeDistinct = mergeDistinct;
exports.mergeObjects = mergeObjects;
exports.newInstanceForScope = newInstanceForScope;
exports.newInstanceOf = newInstanceOf;
exports.nextId = nextId;
exports.noop = noop;
exports.onResolve = onResolve;
exports.optional = optional;
exports.pascalCase = pascalCase;
exports.resetId = resetId;
exports.resolveAll = resolveAll;
exports.singleton = singleton;
exports.sink = sink;
exports.toArray = toArray;
exports.transient = transient;
//# sourceMappingURL=index.dev.js.map
