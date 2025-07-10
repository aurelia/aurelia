'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var metadata = require('@aurelia/metadata');

/** @internal */ const objectFreeze = Object.freeze;
/** @internal */ const objectAssign = Object.assign;
/** @internal */ const safeString = String;
/** @internal */ const getMetadata = metadata.Metadata.get;
/** @internal */ metadata.Metadata.has;
/** @internal */ const defineMetadata = metadata.Metadata.define;
/**
 * Returns true if the value is a Promise via checking if it's an instance of Promise.
 * This does not work for objects across different realms (e.g., iframes).
 * An utility to be shared among core packages for better size optimization
 */
const isPromise = (v) => v instanceof Promise;
/**
 * Returns true if the value is an Array via checking if it's an instance of Array.
 * This does not work for objects across different realms (e.g., iframes).
 * An utility to be shared among core packages for better size optimization
 */
const isArray = (v) => v instanceof Array;
/**
 * Returns true if the value is a Set via checking if it's an instance of Set.
 * This does not work for objects across different realms (e.g., iframes).
 * An utility to be shared among core packages for better size optimization
 */
const isSet = (v) => v instanceof Set;
/**
 * Returns true if the value is a Map via checking if it's an instance of Map.
 * This does not work for objects across different realms (e.g., iframes).
 * An utility to be shared among core packages for better size optimization
 */
const isMap = (v) => v instanceof Map;
/**
 * Returns true if the value is an object via checking if it's an instance of Object.
 * This does not work for objects across different realms (e.g., iframes).
 * An utility to be shared among core packages only for better size optimization
 *
 * This is semi private to core packages and applications should not depend on this.
 */
const isObject = (v) => v instanceof Object;
/**
 * IMPORTANT: This is semi private to core packages and applications should not depend on this.
 *
 * Determine whether a value is an object.
 *
 * Uses `typeof` to guarantee this works cross-realm, which is where `instanceof Object` might fail.
 *
 * Some environments where these issues are known to arise:
 * - same-origin iframes (accessing the other realm via `window.top`)
 * - `jest`.
 *
 * The exact test is:
 * ```ts
 * typeof value === 'object' && value !== null || typeof value === 'function'
 * ```
 *
 * @param value - The value to test.
 * @returns `true` if the value is an object, otherwise `false`.
 * Also performs a type assertion that defaults to `value is Object | Function` which, if the input type is a union with an object type, will infer the correct type.
 * This can be overridden with the generic type argument.
 *
 * @example
 *
 * ```ts
 * class Foo {
 *   bar = 42;
 * }
 *
 * function doStuff(input?: Foo | null) {
 *   input.bar; // Object is possibly 'null' or 'undefined'
 *
 *   // input has an object type in its union (Foo) so that type will be extracted for the 'true' condition
 *   if (isObject(input)) {
 *     input.bar; // OK (input is now typed as Foo)
 *   }
 * }
 *
 * function doOtherStuff(input: unknown) {
 *   input.bar; // Object is of type 'unknown'
 *
 *   // input is 'unknown' so there is no union type to match and it will default to 'Object | Function'
 *   if (isObject(input)) {
 *     input.bar; // Property 'bar' does not exist on type 'Object | Function'
 *   }
 *
 *   // if we know for sure that, if input is an object, it must be a specific type, we can explicitly tell the function to assert that for us
 *   if (isObject<Foo>(input)) {
 *    input.bar; // OK (input is now typed as Foo)
 *   }
 * }
 * ```
 *
 */
// eslint-disable-next-line @typescript-eslint/ban-types
function isObjectOrFunction(value) {
    return typeof value === 'object' && value !== null || typeof value === 'function';
}
/**
 * Returns true if the value is a function
 * An utility to be shared among core packages for better size optimization
 */
// eslint-disable-next-line @typescript-eslint/ban-types
const isFunction = (v) => typeof v === 'function';
/**
 * Returns true if the value is a string
 * An utility to be shared among core packages for better size optimization
 */
const isString = (v) => typeof v === 'string';
/**
 * Returns true if the value is a symbol
 * An utility to be shared among core packages for better size optimization
 */
const isSymbol = (v) => typeof v === 'symbol';
/**
 * Returns true if the value is a number
 * An utility to be shared among core packages for better size optimization
 */
const isNumber = (v) => typeof v === 'number';
/**
 * Create an object with no prototype to be used as a record
 * An utility to be shared among core packages for better size optimization
 */
const createLookup = () => Object.create(null);
/**
 * Compare the 2 values without pitfall of JS ===, including NaN and +0/-0
 * An utility to be shared among core packages for better size optimization
 */
const areEqual = Object.is;

/* eslint-disable prefer-template */
/** @internal */
const createMappedError = (code, ...details) => {
        const paddedCode = safeString(code).padStart(4, '0');
        const message = getMessageByCode(code, ...details);
        const link = `https://docs.aurelia.io/developer-guides/error-messages/0001-to-0023/aur${paddedCode}`;
        return new Error(`AUR${paddedCode}: ${message}\\n\\nFor more information, see: ${link}`);
    }
    ;

const errorsMap = {
    [1 /* ErrorNames.no_registration_for_interface */]: `No registration for interface: '{{0}}'`,
    [2 /* ErrorNames.none_resolver_found */]: `'{{0}}' was registered with "none" resolver, are you injecting the right key?`,
    [3 /* ErrorNames.cyclic_dependency */]: `Cyclic dependency found: {{0}}`,
    [4 /* ErrorNames.no_factory */]: `Resolver for {{0}} returned a null factory`,
    [5 /* ErrorNames.invalid_resolver_strategy */]: `Invalid resolver strategy specified: {{0}}. Did you assign an invalid strategy value?`,
    [6 /* ErrorNames.unable_auto_register */]: `Unable to autoregister dependency: {{0}}`,
    [7 /* ErrorNames.resource_already_exists */]: `Resource key "{{0}}" already registered`,
    [8 /* ErrorNames.unable_resolve_key */]: `Unable to resolve key: {{0}}`,
    [9 /* ErrorNames.unable_jit_non_constructor */]: `Attempted to jitRegister something that is not a constructor: '{{0}}'. Did you forget to register this resource?`,
    [10 /* ErrorNames.no_jit_intrinsic_type */]: `Attempted to jitRegister an intrinsic type: "{{0}}". Did you forget to add @inject(Key)`,
    [11 /* ErrorNames.null_resolver_from_register */]: `Invalid resolver, null/undefined returned from the static register method.`,
    [12 /* ErrorNames.no_jit_interface */]: `Attempted to jitRegister an interface: {{0}}`,
    [13 /* ErrorNames.no_instance_provided */]: `Cannot call resolve '{{0}}' before calling prepare or after calling dispose.`,
    [14 /* ErrorNames.null_undefined_key */]: `Key cannot be null or undefined. Are you trying to inject/register something that doesn't exist with DI?` +
        `A common cause is circular dependency with bundler, did you accidentally introduce circular dependency into your module graph?`,
    [15 /* ErrorNames.no_construct_native_fn */]: `'{{0}}' is a native function and cannot be safely constructed by DI. If this is intentional, please use a callback or cachedCallback resolver.`,
    [16 /* ErrorNames.no_active_container_for_resolve */]: `There is not a currently active container to resolve "{{0}}". Are you trying to "new Class(...)" that has a resolve(...) call?`,
    [17 /* ErrorNames.invalid_new_instance_on_interface */]: `Failed to instantiate '{{0}}' via @newInstanceOf/@newInstanceForScope, there's no registration and no default implementation,`
        + ` or the default implementation does not result in factory for constructing the instances.`,
    [18 /* ErrorNames.event_aggregator_publish_invalid_event_name */]: `Invalid channel name or instance: '{{0}}'.`,
    [19 /* ErrorNames.event_aggregator_subscribe_invalid_event_name */]: `Invalid channel name or type: {{0}}.`,
    [20 /* ErrorNames.first_defined_no_value */]: `No defined value found when calling firstDefined()`,
    [21 /* ErrorNames.invalid_module_transform_input */]: `Invalid module transform input: {{0}}. Expected Promise or Object.`,
    [22 /* ErrorNames.invalid_inject_decorator_usage */]: `The @inject decorator on the target ('{{0}}') type '{{1}}' is not supported.`,
    [23 /* ErrorNames.resource_key_already_registered */]: `Resource key '{{0}}' has already been registered.`,
};
const getMessageByCode = (name, ...details) => {
    let cooked = errorsMap[name];
    for (let i = 0; i < details.length; ++i) {
        cooked = cooked.replace(`{{${i}}}`, String(details[i]));
    }
    return cooked;
};
/** @internal */
// eslint-disable-next-line
const logError = (...args) => globalThis.console.error(...args);

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
const isArrayIndex = (() => {
    const isNumericLookup = {};
    let result = false;
    let length = 0;
    let ch = 0;
    let i = 0;
    return (value) => {
        switch (typeof value) {
            case 'number':
                return value >= 0 && (value | 0) === value;
            case 'string':
                result = isNumericLookup[value];
                if (result !== void 0) {
                    return result;
                }
                length = value.length;
                if (length === 0) {
                    return isNumericLookup[value] = false;
                }
                ch = 0;
                i = 0;
                for (; i < length; ++i) {
                    ch = value.charCodeAt(i);
                    if (i === 0 && ch === 0x30 && length > 1 /* must not start with 0 */ || ch < 0x30 /* 0 */ || ch > 0x39 /* 9 */) {
                        return isNumericLookup[value] = false;
                    }
                }
                return isNumericLookup[value] = true;
            default:
                return false;
        }
    };
})();
/**
 * Base implementation of camel and kebab cases
 */
const baseCase = /*@__PURE__*/ (function () {
    
    // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
    const isDigit = objectAssign(createLookup(), {
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
    const charToKind = (char) => {
        if (char === '') {
            // We get this if we do charAt() with an index out of range
            return 0 /* CharKind.none */;
        }
        if (char !== char.toUpperCase()) {
            return 3 /* CharKind.lower */;
        }
        if (char !== char.toLowerCase()) {
            return 2 /* CharKind.upper */;
        }
        if (isDigit[char] === true) {
            return 1 /* CharKind.digit */;
        }
        return 0 /* CharKind.none */;
    };
    return (input, cb) => {
        const len = input.length;
        if (len === 0) {
            return input;
        }
        let sep = false;
        let output = '';
        let prevKind;
        let curChar = '';
        let curKind = 0 /* CharKind.none */;
        let nextChar = input.charAt(0);
        let nextKind = charToKind(nextChar);
        let i = 0;
        for (; i < len; ++i) {
            prevKind = curKind;
            curChar = nextChar;
            curKind = nextKind;
            nextChar = input.charAt(i + 1);
            nextKind = charToKind(nextChar);
            if (curKind === 0 /* CharKind.none */) {
                if (output.length > 0) {
                    // Only set sep to true if it's not at the beginning of output.
                    sep = true;
                }
            }
            else {
                if (!sep && output.length > 0 && curKind === 2 /* CharKind.upper */) {
                    // Separate UAFoo into UA Foo.
                    // Separate uaFOO into ua FOO.
                    sep = prevKind === 3 /* CharKind.lower */ || nextKind === 3 /* CharKind.lower */;
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
const camelCase = /*@__PURE__*/ (function () {
    const cache = createLookup();
    const callback = (char, sep) => {
        return sep ? char.toUpperCase() : char.toLowerCase();
    };
    return (input) => {
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
const pascalCase = /*@__PURE__*/ (function () {
    const cache = createLookup();
    return (input) => {
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
const kebabCase = /*@__PURE__*/ (function () {
    const cache = createLookup();
    const callback = (char, sep) => {
        return sep ? `-${char.toLowerCase()}` : char.toLowerCase();
    };
    return (input) => {
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
const toArray = (input) => {
    // benchmark: http://jsben.ch/xjsyF
    const length = input.length;
    const arr = Array(length);
    let i = 0;
    for (; i < length; ++i) {
        arr[i] = input[i];
    }
    return arr;
};
/**
 * Decorator. Bind the method to the class instance.
 */
const bound = (originalMethod, context) => {
    const methodName = context.name;
    context.addInitializer(function () {
        Reflect.defineProperty(this, methodName, {
            value: originalMethod.bind(this),
            writable: true,
            configurable: true,
            enumerable: false,
        });
    });
};
const mergeArrays = (...arrays) => {
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
};
const firstDefined = (...values) => {
    const len = values.length;
    let value;
    let i = 0;
    for (; len > i; ++i) {
        value = values[i];
        if (value !== void 0) {
            return value;
        }
    }
    throw createMappedError(20 /* ErrorNames.first_defined_no_value */);
};
/**
 * Get the prototypes of a class hierarchy. Es6 classes have their parent class as prototype
 * so this will return a list of constructors
 *
 * @example
 * ```ts
 * class A {}
 * class B extends A {}
 *
 * assert.deepStrictEqual(getPrototypeChain(A), [A])
 * assert.deepStrictEqual(getPrototypeChain(B), [B, A])
 * ```
 */
const getPrototypeChain = /*@__PURE__*/ (function () {
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
/** @internal */
function toLookup(...objs) {
    return objectAssign(createLookup(), ...objs);
}
/**
 * Determine whether the value is a native function.
 *
 * @param fn - The function to check.
 * @returns `true` is the function is a native function, otherwise `false`
 */
const isNativeFunction = /*@__PURE__*/ (() => {
    // eslint-disable-next-line @typescript-eslint/ban-types
    const lookup = new WeakMap();
    let isNative = false;
    let sourceText = '';
    let i = 0;
    // eslint-disable-next-line @typescript-eslint/ban-types
    return (fn) => {
        isNative = lookup.get(fn);
        if (isNative == null) {
            i = (sourceText = fn.toString()).length;
            isNative = i > 28 && sourceText.indexOf('[native code] }') === i - 15;
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
const onResolve 
// implementation
= (maybePromise, resolveCallback) => {
    if (isPromise(maybePromise)) {
        return maybePromise.then(resolveCallback);
    }
    return resolveCallback(maybePromise);
};
/**
 * Normalize an array of potential promises, to ensure things stay synchronous when they can.
 *
 * If exactly one value is a promise, then that promise is returned.
 *
 * If more than one value is a promise, a new `Promise.all` is returned.
 *
 * If none of the values is a promise, nothing is returned, to indicate that things can stay synchronous.
 */
const onResolveAll = (...maybePromises) => {
    let maybePromise = void 0;
    let firstPromise = void 0;
    let promises = void 0;
    let i = 0;
    // eslint-disable-next-line
    let ii = maybePromises.length;
    for (; i < ii; ++i) {
        maybePromise = maybePromises[i];
        if (isPromise(maybePromise = maybePromises[i])) {
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
};

/** @internal */
const instanceRegistration = (key, value) => new Resolver(key, 0 /* ResolverStrategy.instance */, value);
/** @internal */
const singletonRegistration = (key, value) => new Resolver(key, 1 /* ResolverStrategy.singleton */, value);
/** @internal */
const transientRegistation = (key, value) => new Resolver(key, 2 /* ResolverStrategy.transient */, value);
/** @internal */
const callbackRegistration = (key, callback) => new Resolver(key, 3 /* ResolverStrategy.callback */, callback);
/** @internal */
const cachedCallbackRegistration = (key, callback) => new Resolver(key, 3 /* ResolverStrategy.callback */, cacheCallbackResult(callback));
/** @internal */
const aliasToRegistration = (originalKey, aliasKey) => new Resolver(aliasKey, 5 /* ResolverStrategy.alias */, originalKey);
/** @internal */
const deferRegistration = (key, ...params) => new ParameterizedRegistry(key, params);
const containerLookup = new WeakMap();
/** @internal */
const cacheCallbackResult = (fun) => {
    return (handler, requestor, resolver) => {
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
};
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
     * @param key - key to register the instance with
     * @param value - the instance associated with the key
     */
    instance: instanceRegistration,
    /**
     * Creates an instance from the class.
     * Every time you request this {@linkcode Key} you will get the same one back.
     * ```
     * Registration.singleton(Foo, Foo);
     * ```
     *
     * @param key - key to register the singleton class with
     * @param value - the singleton class to instantiate when a container resolves the associated key
     */
    singleton: singletonRegistration,
    /**
     * Creates an instance from a class.
     * Every time you request this {@linkcode Key} you will get a new instance.
     * ```
     * Registration.instance(Foo, Foo);
     * ```
     *
     * @param key - key to register the transient class with
     * @param value - the class to instantiate when a container resolves the associated key
     */
    transient: transientRegistation,
    /**
     * Creates an instance from the method passed.
     * Every time you request this {@linkcode Key} you will get a new instance.
     * ```
     * Registration.callback(Foo, () => new Foo());
     * Registration.callback(Bar, (c: IContainer) => new Bar(c.get(Foo)));
     * ```
     *
     * @param key - key to register the callback with
     * @param callback - the callback to invoke when a container resolves the associated key
     */
    callback: callbackRegistration,
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
     * @param key - key to register the cached callback with
     * @param callback - the cache callback to invoke when a container resolves the associated key
     */
    cachedCallback: cachedCallbackRegistration,
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
     * @param originalKey - the real key to resolve the get call from a container
     * @param aliasKey - the key that a container allows to resolve the real key associated
     */
    aliasTo: aliasToRegistration,
    /**
     * @internal
     * @param key - the key to register a defer registration
     * @param params - the parameters that should be passed to the resolution of the key
     */
    defer: deferRegistration,
};
const createImplementationRegister = function (key) {
    return function register(container) {
        container.register(singletonRegistration(this, this), aliasToRegistration(this, key));
    };
};

const annoBaseName = 'au:annotation';
/** @internal */
const getAnnotationKeyFor = (name, context) => {
    if (context === void 0) {
        return `${annoBaseName}:${name}`;
    }
    return `${annoBaseName}:${name}:${context}`;
};
/** @internal */
const appendAnnotation = (target, key) => {
    const keys = getMetadata(annoBaseName, target);
    if (keys === void 0) {
        defineMetadata([key], target, annoBaseName);
    }
    else {
        keys.push(key);
    }
};
const annotation = /*@__PURE__*/ objectFreeze({
    name: 'au:annotation',
    appendTo: appendAnnotation,
    set(target, prop, value) {
        defineMetadata(value, target, getAnnotationKeyFor(prop));
    },
    get: (target, prop) => getMetadata(getAnnotationKeyFor(prop), target),
    getKeys(target) {
        let keys = getMetadata(annoBaseName, target);
        if (keys === void 0) {
            defineMetadata(keys = [], target, annoBaseName);
        }
        return keys;
    },
    isKey: (key) => key.startsWith(annoBaseName),
    keyFor: getAnnotationKeyFor,
});
const resourceBaseName = 'au:resource';
/**
 * Builds a resource key from the provided parts.
 */
const getResourceKeyFor = (type, name, context) => {
    if (name == null) {
        return `${resourceBaseName}:${type}`;
    }
    if (context == null) {
        return `${resourceBaseName}:${type}:${name}`;
    }
    return `${resourceBaseName}:${type}:${name}:${context}`;
};
const Protocol = {
    annotation,
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
    let value = getMetadata(getAnnotationKeyFor(name), Type);
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
    let value = getMetadata(getAnnotationKeyFor(name), Type);
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

/* eslint-disable @typescript-eslint/no-this-alias */
/* eslint-disable @typescript-eslint/strict-boolean-expressions, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-explicit-any */
const registrableMetadataKey = Symbol.for('au:registrable');
const DefaultResolver = {
    none(key) {
        throw createMappedError(2 /* ErrorNames.none_resolver_found */, key);
    },
    singleton: (key) => new Resolver(key, 1 /* ResolverStrategy.singleton */, key),
    transient: (key) => new Resolver(key, 2 /* ResolverStrategy.transient */, key),
};
class ContainerConfiguration {
    constructor(inheritParentResources, defaultResolver) {
        this.inheritParentResources = inheritParentResources;
        this.defaultResolver = defaultResolver;
    }
    static from(config) {
        if (config === void 0 ||
            config === ContainerConfiguration.DEFAULT) {
            return ContainerConfiguration.DEFAULT;
        }
        return new ContainerConfiguration(config.inheritParentResources ?? false, config.defaultResolver ?? DefaultResolver.singleton);
    }
}
ContainerConfiguration.DEFAULT = ContainerConfiguration.from({});
/** @internal */
const createContainer = (config) => new Container(null, ContainerConfiguration.from(config));
const InstrinsicTypeNames = new Set('Array ArrayBuffer Boolean DataView Date Error EvalError Float32Array Float64Array Function Int8Array Int16Array Int32Array Map Number Object Promise RangeError ReferenceError RegExp Set SharedArrayBuffer String SyntaxError TypeError Uint8Array Uint8ClampedArray Uint16Array Uint32Array URIError WeakMap WeakSet'.split(' '));
// const factoryKey = 'di:factory';
// const factoryAnnotationKey = Protocol.annotation.keyFor(factoryKey);
let containerId = 0;
let currentContainer = null;
/** @internal */
class Container {
    get depth() {
        return this._parent === null ? 0 : this._parent.depth + 1;
    }
    get parent() {
        return this._parent;
    }
    constructor(parent, config) {
        this.id = ++containerId;
        /** @internal */
        this._registerDepth = 0;
        /** @internal */
        this._disposableResolvers = new Map();
        this._parent = parent;
        this.config = config;
        this._resolvers = new Map();
        this.res = {};
        if (parent === null) {
            this.root = this;
            this._factories = new Map();
        }
        else {
            this.root = parent.root;
            this._factories = parent._factories;
            if (config.inheritParentResources) {
                // todo: when the simplify resource system work is commenced
                //       this resource inheritance can just be a Object.create() call
                //       with parent resources as the prototype of the child resources
                for (const key in parent.res) {
                    this.registerResolver(key, parent.res[key]);
                }
            }
        }
        this._resolvers.set(IContainer, containerResolver);
    }
    register(...params) {
        if (++this._registerDepth === 100) {
            throw createMappedError(6 /* ErrorNames.unable_auto_register */, ...params);
        }
        let current;
        let keys;
        let value;
        let j;
        let jj;
        let i = 0;
        // eslint-disable-next-line
        let ii = params.length;
        let def;
        for (; i < ii; ++i) {
            current = params[i];
            if (!isObjectOrFunction(current)) {
                continue;
            }
            if (isRegistry(current)) {
                current.register(this);
            }
            else if ((def = getMetadata(resourceBaseName, current)) != null) {
                def.register(this);
            }
            else if (isClass(current)) {
                const registrable = current[Symbol.metadata]?.[registrableMetadataKey];
                if (isRegistry(registrable)) {
                    registrable.register(this);
                }
                else if (isString((current).$au?.type)) {
                    const $au = current.$au;
                    const aliases = (current.aliases ?? emptyArray).concat($au.aliases ?? emptyArray);
                    let key = `${resourceBaseName}:${$au.type}:${$au.name}`;
                    if (this.has(key, false)) {
                        {
                            // eslint-disable-next-line @typescript-eslint/no-unsafe-call
                            globalThis.console?.warn(createMappedError(7 /* ErrorNames.resource_already_exists */, key));
                        }
                        continue;
                    }
                    aliasToRegistration(current, key).register(this);
                    if (!this.has(current, false)) {
                        singletonRegistration(current, current).register(this);
                    }
                    j = 0;
                    jj = aliases.length;
                    for (; j < jj; ++j) {
                        key = `${resourceBaseName}:${$au.type}:${aliases[j]}`;
                        if (this.has(key, false)) {
                            {
                                // eslint-disable-next-line @typescript-eslint/no-unsafe-call
                                globalThis.console?.warn(createMappedError(7 /* ErrorNames.resource_already_exists */, key));
                            }
                            continue;
                        }
                        aliasToRegistration(current, key).register(this);
                    }
                }
                else {
                    singletonRegistration(current, current).register(this);
                }
            }
            else {
                keys = Object.keys(current);
                j = 0;
                jj = keys.length;
                for (; j < jj; ++j) {
                    value = current[keys[j]];
                    if (!isObjectOrFunction(value)) {
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
                    throw createMappedError(7 /* ErrorNames.resource_already_exists */, key);
                }
                this.res[key] = resolver;
            }
        }
        else if (result instanceof Resolver && result._strategy === 4 /* ResolverStrategy.array */) {
            result._state.push(resolver);
        }
        else {
            resolvers.set(key, new Resolver(key, 4 /* ResolverStrategy.array */, [result, resolver]));
        }
        if (isDisposable) {
            this._disposableResolvers.set(key, resolver);
        }
        return resolver;
    }
    deregister(key) {
        validateKey(key);
        const resolver = this._resolvers.get(key);
        if (resolver != null) {
            this._resolvers.delete(key);
            if (isResourceKey(key)) {
                // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
                delete this.res[key];
            }
            if (this._disposableResolvers.has(key)) {
                resolver.dispose();
                this._disposableResolvers.delete(key);
            }
        }
    }
    // public deregisterResolverFor<K extends Key>(key: K, searchAncestors: boolean): void {
    //   validateKey(key);
    //   // eslint-disable-next-line @typescript-eslint/no-this-alias
    //   let current: Container | null = this;
    //   let resolver: IResolver | undefined;
    //   while (current != null) {
    //     resolver = current._resolvers.get(key);
    //     if (resolver != null) {
    //       current._resolvers.delete(key);
    //       break;
    //     }
    //     if (current.parent == null) { return; }
    //     current = searchAncestors ? current.parent : null;
    //   }
    //   if (resolver == null) { return; }
    //   if (resolver instanceof Resolver && resolver.strategy === ResolverStrategy.array) {
    //     throw createError('Cannot deregister a resolver with array strategy');
    //   }
    //   if (this._disposableResolvers.has(resolver as IDisposableResolver<K>)) {
    //     (resolver as IDisposableResolver<K>).dispose();
    //   }
    //   if (isResourceKey(key)) {
    //     // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
    //     delete this.res[key];
    //   }
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
        const previousContainer = currentContainer;
        let current = currentContainer = this;
        let resolver;
        let handler;
        try {
            while (current != null) {
                resolver = current._resolvers.get(key);
                if (resolver == null) {
                    if (current._parent == null) {
                        handler = (isRegisterInRequester(key)) ? this : current;
                        if (autoRegister) {
                            return this._jitRegister(key, handler);
                        }
                        return null;
                    }
                    current = current._parent;
                }
                else {
                    return resolver;
                }
            }
        }
        finally {
            currentContainer = previousContainer;
        }
        return null;
    }
    has(key, searchAncestors = false) {
        return this._resolvers.has(key)
            || isResourceKey(key) && key in this.res
            || ((searchAncestors && this._parent?.has(key, true)) ?? false);
    }
    get(key) {
        validateKey(key);
        if (key.$isResolver) {
            return key.resolve(this, this);
        }
        const previousContainer = currentContainer;
        let current = currentContainer = this;
        let resolver;
        let handler;
        try {
            while (current != null) {
                resolver = current._resolvers.get(key);
                if (resolver == null) {
                    if (current._parent == null) {
                        handler = (isRegisterInRequester(key)) ? this : current;
                        resolver = this._jitRegister(key, handler);
                        return resolver.resolve(current, this);
                    }
                    current = current._parent;
                }
                else {
                    return resolver.resolve(current, this);
                }
            }
        }
        finally {
            currentContainer = previousContainer;
        }
        throw createMappedError(8 /* ErrorNames.unable_resolve_key */, key);
    }
    getAll(key, searchAncestors = false) {
        validateKey(key);
        const previousContainer = currentContainer;
        const requestor = currentContainer = this;
        let current = requestor;
        let resolver;
        let resolutions = emptyArray;
        try {
            if (searchAncestors) {
                while (current != null) {
                    resolver = current._resolvers.get(key);
                    if (resolver != null) {
                        resolutions = resolutions.concat(buildAllResponse(resolver, current, requestor));
                    }
                    current = current._parent;
                }
                return resolutions;
            }
            while (current != null) {
                resolver = current._resolvers.get(key);
                if (resolver == null) {
                    current = current._parent;
                    if (current == null) {
                        return emptyArray;
                    }
                }
                else {
                    return buildAllResponse(resolver, current, requestor);
                }
            }
        }
        finally {
            currentContainer = previousContainer;
        }
        return emptyArray;
    }
    invoke(Type, dynamicDependencies) {
        if (isNativeFunction(Type)) {
            throw createMappedError(15 /* ErrorNames.no_construct_native_fn */, Type);
        }
        const previousContainer = currentContainer;
        currentContainer = this;
        {
            let resolvedDeps;
            let dep;
            try {
                resolvedDeps = getDependencies(Type).map(_ => this.get(dep = _));
            }
            catch (ex) {
                logError(`[DEV:aurelia] Error during construction of ${!Type.name ? `(Anonymous) ${String(Type)}` : Type.name}, caused by dependency: ${String(dep)}`);
                currentContainer = previousContainer;
                throw ex;
            }
            try {
                return dynamicDependencies === void 0
                    ? new Type(...resolvedDeps)
                    : new Type(...resolvedDeps, ...dynamicDependencies);
            }
            catch (ex) {
                logError(`[DEV:aurelia] Error during construction of ${!Type.name ? `(Anonymous) ${String(Type)}` : Type.name}`);
                throw ex;
            }
            finally {
                currentContainer = previousContainer;
            }
        }
        try {
            return dynamicDependencies === void 0
                ? new Type(...getDependencies(Type).map(containerGetKey, this))
                : new Type(...getDependencies(Type).map(containerGetKey, this), ...dynamicDependencies);
        }
        finally {
            currentContainer = previousContainer;
        }
    }
    hasFactory(key) {
        return this._factories.has(key);
    }
    getFactory(Type) {
        let factory = this._factories.get(Type);
        if (factory === void 0) {
            if (isNativeFunction(Type)) {
                throw createMappedError(15 /* ErrorNames.no_construct_native_fn */, Type);
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
        return new Container(this, ContainerConfiguration.from(config ?? this.config));
    }
    disposeResolvers() {
        const resolvers = this._resolvers;
        const disposableResolvers = this._disposableResolvers;
        let disposable;
        let key;
        for ([key, disposable] of disposableResolvers.entries()) {
            disposable.dispose?.();
            resolvers.delete(key);
        }
        disposableResolvers.clear();
    }
    useResources(container) {
        const res = container.res;
        for (const key in res) {
            this.registerResolver(key, res[key]);
        }
    }
    find(keyOrKind, name) {
        const key = isString(name) ? `${resourceBaseName}:${keyOrKind}:${name}` : keyOrKind;
        let container = this;
        let resolver = container.res[key];
        if (resolver == null) {
            container = container.root;
            resolver = container.res[key];
        }
        if (resolver == null) {
            return null;
        }
        return resolver.getFactory?.(container)?.Type ?? null;
    }
    dispose() {
        if (this._disposableResolvers.size > 0) {
            this.disposeResolvers();
        }
        this._resolvers.clear();
        if (this.root === this) {
            this._factories.clear();
            this.res = {};
        }
    }
    /** @internal */
    _jitRegister(keyAsValue, handler) {
        const $isRegistry = isRegistry(keyAsValue);
        if (!isFunction(keyAsValue) && !$isRegistry) {
            throw createMappedError(9 /* ErrorNames.unable_jit_non_constructor */, keyAsValue);
        }
        if (InstrinsicTypeNames.has(keyAsValue.name)) {
            throw createMappedError(10 /* ErrorNames.no_jit_intrinsic_type */, keyAsValue);
        }
        if ($isRegistry) {
            const registrationResolver = keyAsValue.register(handler, keyAsValue);
            if (!(registrationResolver instanceof Object) || registrationResolver.resolve == null) {
                const newResolver = handler._resolvers.get(keyAsValue);
                if (newResolver != null) {
                    return newResolver;
                }
                throw createMappedError(11 /* ErrorNames.null_resolver_from_register */, keyAsValue);
            }
            return registrationResolver;
        }
        // TODO(sayan): remove potential dead code
        if (keyAsValue.$isInterface) {
            throw createMappedError(12 /* ErrorNames.no_jit_interface */, keyAsValue.friendlyName);
        }
        const resolver = this.config.defaultResolver(keyAsValue, handler);
        handler._resolvers.set(keyAsValue, resolver);
        return resolver;
    }
}
/** @internal */
class Factory {
    constructor(Type, dependencies) {
        this.Type = Type;
        this.dependencies = dependencies;
        this.transformers = null;
    }
    construct(container, dynamicDependencies) {
        const previousContainer = currentContainer;
        currentContainer = container;
        let instance;
        /* istanbul ignore next */
        {
            let resolvedDeps;
            let dep;
            try {
                resolvedDeps = this.dependencies.map(_ => container.get(dep = _));
            }
            catch (ex) {
                logError(`[DEV:aurelia] Error during construction of ${!this.Type.name ? `(Anonymous) ${String(this.Type)}` : this.Type.name}, caused by dependency: ${String(dep)}`);
                currentContainer = previousContainer;
                throw ex;
            }
            try {
                if (dynamicDependencies === void 0) {
                    instance = new this.Type(...resolvedDeps);
                }
                else {
                    instance = new this.Type(...resolvedDeps, ...dynamicDependencies);
                }
                if (this.transformers == null) {
                    return instance;
                }
                return this.transformers.reduce(transformInstance, instance);
            }
            catch (ex) {
                logError(`[DEV:aurelia] Error during construction of ${!this.Type.name ? `(Anonymous) ${String(this.Type)}` : this.Type.name}`);
                throw ex;
            }
            finally {
                currentContainer = previousContainer;
            }
        }
        try {
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
        finally {
            currentContainer = previousContainer;
        }
    }
    registerTransformer(transformer) {
        (this.transformers ??= []).push(transformer);
    }
}
function transformInstance(inst, transform) {
    return transform(inst);
}
function validateKey(key) {
    if (key === null || key === void 0) {
        throw createMappedError(14 /* ErrorNames.null_undefined_key */);
    }
}
function containerGetKey(d) {
    return this.get(d);
}
function resolve(...keys) {
    if (currentContainer == null) {
        throw createMappedError(16 /* ErrorNames.no_active_container_for_resolve */, ...keys);
    }
    /* istanbul ignore next */
    {
        if (keys.length === 1) {
            try {
                return currentContainer.get(keys[0]);
            }
            catch (ex) {
                logError(`[DEV:aurelia] resolve() call error for: ${String(keys[0])}`);
                throw ex;
            }
        }
        else {
            let key;
            try {
                return keys.map(_ => currentContainer.get(key = _));
            }
            catch (ex) {
                logError(`[DEV:aurelia] resolve() call error for: ${String(key)}`);
                throw ex;
            }
        }
    }
    return keys.length === 1
        ? currentContainer.get(keys[0])
        : keys.map(containerGetKey, currentContainer);
}
const buildAllResponse = (resolver, handler, requestor) => {
    if (resolver instanceof Resolver && resolver._strategy === 4 /* ResolverStrategy.array */) {
        const state = resolver._state;
        const ii = state.length;
        const results = Array(ii);
        let i = 0;
        for (; i < ii; ++i) {
            results[i] = state[i].resolve(handler, requestor);
        }
        return results;
    }
    return [resolver.resolve(handler, requestor)];
};
const containerResolver = {
    $isResolver: true,
    resolve(handler, requestor) {
        return requestor;
    }
};
const isRegistry = (obj) => isFunction(obj?.register);
const isSelfRegistry = (obj) => isRegistry(obj) && typeof obj.registerInRequestor === 'boolean';
const isRegisterInRequester = (obj) => isSelfRegistry(obj) && obj.registerInRequestor;
const isClass = (obj) => obj.prototype !== void 0;
const isResourceKey = (key) => isString(key) && key.indexOf(':') > 0;

/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/prefer-nullish-coalescing */
/* eslint-disable @typescript-eslint/strict-boolean-expressions */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
class ResolverBuilder {
    constructor(
    /** @internal */ _container, 
    /** @internal */ _key) {
        this._container = _container;
        this._key = _key;
    }
    instance(value) {
        return this._registerResolver(0 /* ResolverStrategy.instance */, value);
    }
    singleton(value) {
        return this._registerResolver(1 /* ResolverStrategy.singleton */, value);
    }
    transient(value) {
        return this._registerResolver(2 /* ResolverStrategy.transient */, value);
    }
    callback(value) {
        return this._registerResolver(3 /* ResolverStrategy.callback */, value);
    }
    cachedCallback(value) {
        return this._registerResolver(3 /* ResolverStrategy.callback */, cacheCallbackResult(value));
    }
    aliasTo(destinationKey) {
        return this._registerResolver(5 /* ResolverStrategy.alias */, destinationKey);
    }
    /** @internal */
    _registerResolver(strategy, state) {
        const { _container: container, _key: key } = this;
        this._container = this._key = (void 0);
        return container.registerResolver(key, new Resolver(key, strategy, state));
    }
}
const cloneArrayWithPossibleProps = (source) => {
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
};
const diParamTypesKeys = getAnnotationKeyFor('di:paramtypes');
const getAnnotationParamtypes = (Type) => {
    return getMetadata(diParamTypesKeys, Type);
};
const getDesignParamtypes = (Type) => getMetadata('design:paramtypes', Type);
const getOrCreateAnnotationParamTypes = (context) => {
    return (context.metadata[diParamTypesKeys] ??= []);
};
/** @internal */
const getDependencies = (Type) => {
    // Note: Every detail of this getDependencies method is pretty deliberate at the moment, and probably not yet 100% tested from every possible angle,
    // so be careful with making changes here as it can have a huge impact on complex end user apps.
    // Preferably, only make changes to the dependency resolution process via a RFC.
    const key = getAnnotationKeyFor('di:dependencies');
    let dependencies = getMetadata(key, Type);
    if (dependencies === void 0) {
        // Type.length is the number of constructor parameters. If this is 0, it could mean the class has an empty constructor
        // but it could also mean the class has no constructor at all (in which case it inherits the constructor from the prototype).
        // Non-zero constructor length + no paramtypes means emitDecoratorMetadata is off, or the class has no decorator.
        // We're not doing anything with the above right now, but it's good to keep in mind for any future issues.
        const inject = Type.inject;
        if (inject === void 0) {
            // design:paramtypes is set by tsc when emitDecoratorMetadata is enabled.
            const designParamtypes = getDesignParamtypes(Type);
            // au:annotation:di:paramtypes is set by the parameter decorator from DI.createInterface or by @inject
            const annotationParamtypes = getAnnotationParamtypes(Type);
            if (designParamtypes === void 0) {
                if (annotationParamtypes === void 0) {
                    // Only go up the prototype if neither static inject nor any of the paramtypes is defined, as
                    // there is no sound way to merge a type's deps with its prototype's deps
                    const Proto = Object.getPrototypeOf(Type);
                    if (isFunction(Proto) && Proto !== Function.prototype) {
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
        defineMetadata(dependencies, Type, key);
    }
    return dependencies;
};
/**
 * @internal
 *
 * @param configureOrName - Use for improving error messaging
 */
const createInterface = (configureOrName, configuror) => {
    const configure = isFunction(configureOrName) ? configureOrName : configuror;
    const friendlyName = (isString(configureOrName) ? configureOrName : undefined) ?? '(anonymous)';
    const Interface = {
        // Old code kept with the hope that the argument decorator proposal will be standardized by TC39 (https://github.com/tc39/proposal-class-method-parameter-decorators)
        // function(_target: Injectable | AbstractInjectable, _property: string | symbol | undefined, _index: number | undefined): void {
        //    if (target == null || new.target !== undefined) {
        //     throw createMappedError(ErrorNames.no_registration_for_interface, friendlyName);
        //    }
        //    const annotationParamtypes = getOrCreateAnnotationParamTypes(target as Injectable);
        //    annotationParamtypes[index!] = Interface;
        // },
        $isInterface: true,
        friendlyName: friendlyName,
        toString: () => `InterfaceSymbol<${friendlyName}>`,
        register: configure != null
            ? (container, key) => configure(new ResolverBuilder(container, key ?? Interface))
            : void 0,
    };
    return Interface;
};
const inject = (...dependencies) => {
    return (decorated, context) => {
        switch (context.kind) {
            case 'class': {
                const annotationParamtypes = getOrCreateAnnotationParamTypes(context);
                let dep;
                let i = 0;
                for (; i < dependencies.length; ++i) {
                    dep = dependencies[i];
                    if (dep !== void 0) {
                        annotationParamtypes[i] = dep;
                    }
                }
                break;
            }
            case 'field': {
                const annotationParamtypes = getOrCreateAnnotationParamTypes(context);
                const dep = dependencies[0];
                if (dep !== void 0) {
                    annotationParamtypes[context.name] = dep;
                }
                break;
            }
            // TODO(sayan): support getter injection - new feature
            // TODO:
            //    support method parameter injection when the class-method-parameter-decorators proposal (https://github.com/tc39/proposal-class-method-parameter-decorators)
            //    reaches stage 4 and/or implemented by TS.
            default:
                throw createMappedError(22 /* ErrorNames.invalid_inject_decorator_usage */, String(context.name), context.kind);
        }
    };
};
const DI = /*@__PURE__*/ (() => {
    // putting this function inside this IIFE as we wants to call it without triggering side effect
    metadata.initializeTC39Metadata();
    return {
        createContainer,
        getDesignParamtypes,
        // getAnnotationParamtypes,
        // getOrCreateAnnotationParamTypes,
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
         * - @param configureOrName - supply a string to improve error messaging
         */
        createInterface,
        inject,
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
            target.register = function (container) {
                const registration = transientRegistation(target, target);
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
            target.register = function (container) {
                const registration = singletonRegistration(target, target);
                return registration.register(container, target);
            };
            target.registerInRequestor = options.scoped;
            return target;
        },
    };
})();
const IContainer = /*@__PURE__*/ createInterface('IContainer');
const IServiceLocator = IContainer;
function transientDecorator(target, context) {
    return DI.transient(target);
}
function transient(target, context) {
    return target == null ? transientDecorator : transientDecorator(target);
}
const defaultSingletonOptions = { scoped: false };
const decorateSingleton = DI.singleton;
function singleton(targetOrOptions, _context) {
    return isFunction(targetOrOptions)
        // The decorator is applied without options. Example: `@singleton()` or `@singleton`
        ? decorateSingleton(targetOrOptions)
        : function ($target, _ctx) {
            return decorateSingleton($target, targetOrOptions);
        };
}

/** @internal */
class Resolver {
    get $isResolver() { return true; }
    constructor(key, strategy, state) {
        /** @internal */
        this._resolving = false;
        /**
         * When resolving a singleton, the internal state is changed,
         * so cache the original constructable factory for future requests
         * @internal
         */
        this._cachedFactory = null;
        this._key = key;
        this._strategy = strategy;
        this._state = state;
    }
    register(container, key) {
        return container.registerResolver(key || this._key, this);
    }
    resolve(handler, requestor) {
        switch (this._strategy) {
            case 0 /* ResolverStrategy.instance */:
                return this._state;
            case 1 /* ResolverStrategy.singleton */: {
                if (this._resolving) {
                    throw createMappedError(3 /* ErrorNames.cyclic_dependency */, this._state.name);
                }
                this._resolving = true;
                this._state = (this._cachedFactory = handler.getFactory(this._state)).construct(requestor);
                this._strategy = 0 /* ResolverStrategy.instance */;
                this._resolving = false;
                return this._state;
            }
            case 2 /* ResolverStrategy.transient */: {
                // Always create transients from the requesting container
                const factory = handler.getFactory(this._state);
                if (factory === null) {
                    throw createMappedError(4 /* ErrorNames.no_factory */, this._key);
                }
                return factory.construct(requestor);
            }
            case 3 /* ResolverStrategy.callback */:
                return this._state(handler, requestor, this);
            case 4 /* ResolverStrategy.array */:
                return this._state[0].resolve(handler, requestor);
            case 5 /* ResolverStrategy.alias */:
                return requestor.get(this._state);
            default:
                throw createMappedError(5 /* ErrorNames.invalid_resolver_strategy */, this._strategy);
        }
    }
    getFactory(container) {
        switch (this._strategy) {
            case 1 /* ResolverStrategy.singleton */:
            case 2 /* ResolverStrategy.transient */:
                return container.getFactory(this._state);
            case 5 /* ResolverStrategy.alias */:
                return container.getResolver(this._state)?.getFactory?.(container) ?? null;
            case 0 /* ResolverStrategy.instance */:
                return this._cachedFactory;
            default:
                return null;
        }
    }
}
class InstanceProvider {
    get friendlyName() {
        return this._name;
    }
    constructor(name, 
    /**
     * if not undefined, then this is the value this provider will resolve to
     * until overridden by explicit prepare call
     */
    instance = null, Type = null) {
        this._name = name;
        this._instance = instance;
        this._Type = Type;
    }
    prepare(instance) {
        this._instance = instance;
    }
    get $isResolver() { return true; }
    resolve() {
        if (this._instance == null) {
            throw createMappedError(13 /* ErrorNames.no_instance_provided */, this._name);
        }
        return this._instance;
    }
    getFactory(container) {
        return this._Type == null ? null : container.getFactory(this._Type);
    }
    dispose() {
        this._instance = null;
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

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const emptyArray = objectFreeze([]);
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const emptyObject = objectFreeze({});
// eslint-disable-next-line @typescript-eslint/no-empty-function
function noop() { }
const IPlatform = /*@__PURE__*/ createInterface('IPlatform');

/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * ! Semi private API to avoid repetitive work creating resolvers.
 *
 * Naming isn't entirely correct, but it's good enough for internal usage.
 */
function createResolver(getter) {
    return function (key) {
        function Resolver(target, context) {
            inject(Resolver)(target, context);
        }
        Resolver.$isResolver = true;
        Resolver.resolve = function (handler, requestor) {
            return getter(key, handler, requestor);
        };
        return Resolver;
    };
}
/**
 * Create a resolver that will resolve all values of a key from resolving container
 */
const all = (key, searchAncestors = false) => {
    function resolver(decorated, context) {
        inject(resolver)(decorated, context);
    }
    resolver.$isResolver = true;
    resolver.resolve = (handler, requestor) => requestor.getAll(key, searchAncestors);
    return resolver;
};
/**
 * Create a resolver that will resolve the last instance of a key from the resolving container
 *
 * - @param key [[`Key`]]
 */
const last = (key) => ({
    $isResolver: true,
    resolve: handler => {
        const allInstances = handler.getAll(key);
        return allInstances.length > 0 ? allInstances[allInstances.length - 1] : undefined;
    }
});
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
const lazy = /*@__PURE__*/ createResolver((key, handler, requestor) => {
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
const optional = /*@__PURE__*/ createResolver((key, handler, requestor) => {
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
const ignore = /*@__PURE__*/ objectAssign((decorated, context) => {
    inject(ignore)(decorated, context);
}, { $isResolver: true, resolve: () => void 0 });
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
const factory = /*@__PURE__*/ createResolver((key, handler, requestor) => {
    return (...args) => handler.getFactory(key).construct(requestor, args);
});
/**
 * Create a resolver that will only resolve if the requesting container has the key pre-registered
 */
const own = /*@__PURE__*/ createResolver((key, handler, requestor) => {
    return requestor.has(key, false) ? requestor.get(key) : void 0;
});
/**
 * Create a resolver that will resolve a key based on resource semantic (leaf + root + ignore middle layer container)
 * Will resolve at the root level if the key is not registered in the requestor container
 */
const resource = /*@__PURE__*/ createResolver((key, handler, requestor) => requestor.has(key, false)
    ? requestor.get(key)
    : requestor.root.get(key));
/**
 * Create a resolver that will resolve a key based on resource semantic (leaf + root + ignore middle layer container)
 * only if the key is registered either in the requestor container or in the root container
 *
 * Returns `undefined` if the key is not registered in either container
 */
const optionalResource = /*@__PURE__*/ createResolver((key, handler, requestor) => requestor.has(key, false)
    ? requestor.get(key)
    : requestor.root.has(key, false)
        ? requestor.root.get(key)
        : void 0);
/**
 * Create a resolver for resolving all registrations of a key with resource semantic (leaf + root + ignore middle layer container)
 */
const allResources = /*@__PURE__*/ createResolver((key, handler, requestor) => 
// prevent duplicate retrieval
requestor === requestor.root
    ? requestor.getAll(key, false)
    : requestor.has(key, false)
        ? requestor.getAll(key, false).concat(requestor.root.getAll(key, false))
        : requestor.root.getAll(key, false));
/**
 * Create a resolver that will resolve a new instance of a key, and register the newly created instance with the requestor container
 */
const newInstanceForScope = /*@__PURE__*/ createResolver((key, handler, requestor) => {
    const instance = createNewInstance(key, handler, requestor);
    const instanceProvider = new InstanceProvider(safeString(key), instance);
    /**
     * By default the new instances for scope are disposable.
     * If need be, we can always enhance the `createNewInstance` to support a 'injection' context, to make a non/disposable registration here.
     */
    requestor.registerResolver(key, instanceProvider, true);
    return instance;
});
/**
 * Create a resolver that will resolve a new instance of a key
 */
const newInstanceOf = /*@__PURE__*/ createResolver((key, handler, requestor) => createNewInstance(key, handler, requestor));
const createNewInstance = (key, handler, requestor) => {
    // 1. if there's a factory registration for the key
    if (handler.hasFactory(key)) {
        return handler.getFactory(key).construct(requestor);
    }
    // 2. if key is an interface
    if (isInterface(key)) {
        const hasDefault = isFunction(key.register);
        const resolver = handler.getResolver(key, false);
        let factory;
        if (resolver == null) {
            if (hasDefault) {
                // creating a new container as we do not want to pollute the resolver registry
                factory = (newInstanceContainer ??= createContainer()).getResolver(key, true)?.getFactory?.(handler);
            }
            newInstanceContainer.dispose();
        }
        else {
            factory = resolver.getFactory?.(handler);
        }
        // 2.1 and has resolvable factory
        if (factory != null) {
            return factory.construct(requestor);
        }
        // 2.2 cannot instantiate a dummy interface
        throw createMappedError(17 /* ErrorNames.invalid_new_instance_on_interface */, key);
    }
    // 3. jit factory, in case of newInstanceOf(SomeClass)
    return handler.getFactory(key).construct(requestor);
};
const isInterface = (key) => key?.$isInterface === true;
let newInstanceContainer;

/******************************************************************************
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
/* global Reflect, Promise, SuppressedError, Symbol, Iterator */


function __esDecorate(ctor, descriptorIn, decorators, contextIn, initializers, extraInitializers) {
    function accept(f) { if (f !== void 0 && typeof f !== "function") throw new TypeError("Function expected"); return f; }
    var kind = contextIn.kind, key = kind === "getter" ? "get" : kind === "setter" ? "set" : "value";
    var target = !descriptorIn && ctor ? contextIn["static"] ? ctor : ctor.prototype : null;
    var descriptor = descriptorIn || (target ? Object.getOwnPropertyDescriptor(target, contextIn.name) : {});
    var _, done = false;
    for (var i = decorators.length - 1; i >= 0; i--) {
        var context = {};
        for (var p in contextIn) context[p] = p === "access" ? {} : contextIn[p];
        for (var p in contextIn.access) context.access[p] = contextIn.access[p];
        context.addInitializer = function (f) { if (done) throw new TypeError("Cannot add initializers after decoration has completed"); extraInitializers.push(accept(f || null)); };
        var result = (0, decorators[i])(kind === "accessor" ? { get: descriptor.get, set: descriptor.set } : descriptor[key], context);
        if (kind === "accessor") {
            if (result === void 0) continue;
            if (result === null || typeof result !== "object") throw new TypeError("Object expected");
            if (_ = accept(result.get)) descriptor.get = _;
            if (_ = accept(result.set)) descriptor.set = _;
            if (_ = accept(result.init)) initializers.unshift(_);
        }
        else if (_ = accept(result)) {
            if (kind === "field") initializers.unshift(_);
            else descriptor[key] = _;
        }
    }
    if (target) Object.defineProperty(target, contextIn.name, descriptor);
    done = true;
}
function __runInitializers(thisArg, initializers, value) {
    var useValue = arguments.length > 2;
    for (var i = 0; i < initializers.length; i++) {
        value = useValue ? initializers[i].call(thisArg, value) : initializers[i].call(thisArg);
    }
    return useValue ? value : void 0;
}
typeof SuppressedError === "function" ? SuppressedError : function (error, suppressed, message) {
    var e = new Error(message);
    return e.name = "SuppressedError", e.error = error, e.suppressed = suppressed, e;
};

/** @internal */ const trace = 0;
/** @internal */ const debug = 1;
/** @internal */ const info = 2;
/** @internal */ const warn = 3;
/** @internal */ const error = 4;
/** @internal */ const fatal = 5;
/** @internal */ const none = 6;
const LogLevel = objectFreeze({
    /**
     * The most detailed information about internal app state.
     *
     * Disabled by default and should never be enabled in a production environment.
     */
    trace,
    /**
     * Information that is useful for debugging during development and has no long-term value.
     */
    debug,
    /**
     * Information about the general flow of the application that has long-term value.
     */
    info,
    /**
     * Unexpected circumstances that require attention but do not otherwise cause the current flow of execution to stop.
     */
    warn,
    /**
     * Unexpected circumstances that cause the flow of execution in the current activity to stop but do not cause an app-wide failure.
     */
    error,
    /**
     * Unexpected circumstances that cause an app-wide failure or otherwise require immediate attention.
     */
    fatal,
    /**
     * No messages should be written.
     */
    none,
});
const ILogConfig = /*@__PURE__*/ createInterface('ILogConfig', x => x.instance(new LogConfig('no-colors', warn)));
const ISink = /*@__PURE__*/ createInterface('ISink');
const ILogEventFactory = /*@__PURE__*/ createInterface('ILogEventFactory', x => x.singleton(DefaultLogEventFactory));
const ILogger = /*@__PURE__*/ createInterface('ILogger', x => x.singleton(DefaultLogger));
const ILogScopes = /*@__PURE__*/ createInterface('ILogScope');
const LoggerSink = /*@__PURE__*/ objectFreeze({
    key: getAnnotationKeyFor('logger-sink-handles'),
    define(target, definition) {
        defineMetadata(definition.handles, target, this.key);
    },
    getHandles(target) {
        return getMetadata(this.key, target.constructor);
    },
});
const sink = (definition) => {
    return (_target, context) => context.addInitializer(function () {
        LoggerSink.define(this, definition);
    });
};
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
    const logLevelString = {
        'no-colors': toLookup({
            TRC: 'TRC',
            DBG: 'DBG',
            INF: 'INF',
            WRN: 'WRN',
            ERR: 'ERR',
            FTL: 'FTL',
            QQQ: '???',
        }),
        'colors': toLookup({
            TRC: format.grey('TRC'),
            DBG: format.grey('DBG'),
            INF: format.white('INF'),
            WRN: format.yellow('WRN'),
            ERR: format.red('ERR'),
            FTL: format.red('FTL'),
            QQQ: format.grey('???'),
        }),
    };
    return (level, colorOptions) => {
        if (level <= trace) {
            return logLevelString[colorOptions].TRC;
        }
        if (level <= debug) {
            return logLevelString[colorOptions].DBG;
        }
        if (level <= info) {
            return logLevelString[colorOptions].INF;
        }
        if (level <= warn) {
            return logLevelString[colorOptions].WRN;
        }
        if (level <= error) {
            return logLevelString[colorOptions].ERR;
        }
        if (level <= fatal) {
            return logLevelString[colorOptions].FTL;
        }
        return logLevelString[colorOptions].QQQ;
    };
})();
const getScopeString = (scope, colorOptions) => {
    if (colorOptions === 'no-colors') {
        return scope.join('.');
    }
    return scope.map(format.cyan).join('.');
};
const getIsoString = (timestamp, colorOptions) => {
    if (colorOptions === 'no-colors') {
        return new Date(timestamp).toISOString();
    }
    return format.grey(new Date(timestamp).toISOString());
};
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
    getFormattedLogInfo(forConsole = false) {
        const { severity, message: messageOrError, scope, colorOptions, timestamp, optionalParams } = this;
        let error = null;
        let message = '';
        if (forConsole && messageOrError instanceof Error) {
            error = messageOrError;
        }
        else {
            message = messageOrError;
        }
        const scopeInfo = scope.length === 0 ? '' : ` ${getScopeString(scope, colorOptions)}`;
        let msg = `${getIsoString(timestamp, colorOptions)} [${getLogLevelString(severity, colorOptions)}${scopeInfo}] ${message}`;
        if (optionalParams === void 0 || optionalParams.length === 0) {
            return error === null ? [msg] : [msg, error];
        }
        let offset = 0;
        while (msg.includes('%s')) {
            msg = msg.replace('%s', String(optionalParams[offset++]));
        }
        return error !== null ? [msg, error, ...optionalParams.slice(offset)] : [msg, ...optionalParams.slice(offset)];
    }
}
class DefaultLogEventFactory {
    constructor() {
        this.config = resolve(ILogConfig);
    }
    createLogEvent(logger, level, message, optionalParams) {
        return new DefaultLogEvent(level, message, optionalParams, logger.scope, this.config.colorOptions, Date.now());
    }
}
class ConsoleSink {
    static register(container) {
        singletonRegistration(ISink, ConsoleSink).register(container);
    }
    constructor(p = resolve(IPlatform)) {
        const $console = p.console;
        this.handleEvent = function emit(event) {
            const _info = event.getFormattedLogInfo(true);
            switch (event.severity) {
                case trace:
                case debug:
                    return $console.debug(..._info);
                case info:
                    return $console.info(..._info);
                case warn:
                    return $console.warn(..._info);
                case error:
                case fatal:
                    return $console.error(..._info);
            }
        };
    }
}
let DefaultLogger = (() => {
    var _a;
    let _instanceExtraInitializers = [];
    let _trace_decorators;
    let _debug_decorators;
    let _info_decorators;
    let _warn_decorators;
    let _error_decorators;
    let _fatal_decorators;
    return _a = class DefaultLogger {
            /* eslint-disable default-param-last */
            constructor(
            /**
             * The global logger configuration.
             */
            config = resolve(ILogConfig), factory = resolve(ILogEventFactory), sinks = resolve(all(ISink)), 
            /**
             * The scopes that this logger was created for, if any.
             */
            scope = resolve(optional(ILogScopes)) ?? [], parent = null) {
                this.scope = (__runInitializers(this, _instanceExtraInitializers), scope);
                /** @internal */
                this._scopedLoggers = createLookup();
                /* eslint-enable default-param-last */
                let traceSinks;
                let debugSinks;
                let infoSinks;
                let warnSinks;
                let errorSinks;
                let fatalSinks;
                this.config = config;
                this._factory = factory;
                this.sinks = sinks;
                if (parent === null) {
                    this.root = this;
                    this.parent = this;
                    traceSinks = this._traceSinks = [];
                    debugSinks = this._debugSinks = [];
                    infoSinks = this._infoSinks = [];
                    warnSinks = this._warnSinks = [];
                    errorSinks = this._errorSinks = [];
                    fatalSinks = this._fatalSinks = [];
                    for (const $sink of sinks) {
                        const handles = LoggerSink.getHandles($sink);
                        if (handles?.includes(trace) ?? true) {
                            traceSinks.push($sink);
                        }
                        if (handles?.includes(debug) ?? true) {
                            debugSinks.push($sink);
                        }
                        if (handles?.includes(info) ?? true) {
                            infoSinks.push($sink);
                        }
                        if (handles?.includes(warn) ?? true) {
                            warnSinks.push($sink);
                        }
                        if (handles?.includes(error) ?? true) {
                            errorSinks.push($sink);
                        }
                        if (handles?.includes(fatal) ?? true) {
                            fatalSinks.push($sink);
                        }
                    }
                }
                else {
                    this.root = parent.root;
                    this.parent = parent;
                    traceSinks = this._traceSinks = parent._traceSinks;
                    debugSinks = this._debugSinks = parent._debugSinks;
                    infoSinks = this._infoSinks = parent._infoSinks;
                    warnSinks = this._warnSinks = parent._warnSinks;
                    errorSinks = this._errorSinks = parent._errorSinks;
                    fatalSinks = this._fatalSinks = parent._fatalSinks;
                }
            }
            trace(messageOrGetMessage, ...optionalParams) {
                if (this.config.level <= trace) {
                    this._emit(this._traceSinks, trace, messageOrGetMessage, optionalParams);
                }
            }
            debug(messageOrGetMessage, ...optionalParams) {
                if (this.config.level <= debug) {
                    this._emit(this._debugSinks, debug, messageOrGetMessage, optionalParams);
                }
            }
            info(messageOrGetMessage, ...optionalParams) {
                if (this.config.level <= info) {
                    this._emit(this._infoSinks, info, messageOrGetMessage, optionalParams);
                }
            }
            warn(messageOrGetMessage, ...optionalParams) {
                if (this.config.level <= warn) {
                    this._emit(this._warnSinks, warn, messageOrGetMessage, optionalParams);
                }
            }
            error(messageOrGetMessage, ...optionalParams) {
                if (this.config.level <= error) {
                    this._emit(this._errorSinks, error, messageOrGetMessage, optionalParams);
                }
            }
            fatal(messageOrGetMessage, ...optionalParams) {
                if (this.config.level <= fatal) {
                    this._emit(this._fatalSinks, fatal, messageOrGetMessage, optionalParams);
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
                const scopedLoggers = this._scopedLoggers;
                let scopedLogger = scopedLoggers[name];
                if (scopedLogger === void 0) {
                    scopedLogger = scopedLoggers[name] = new _a(this.config, this._factory, null, this.scope.concat(name), this);
                }
                return scopedLogger;
            }
            /** @internal */
            _emit(sinks, level, msgOrGetMsg, optionalParams) {
                const message = (isFunction(msgOrGetMsg) ? msgOrGetMsg() : msgOrGetMsg);
                const event = this._factory.createLogEvent(this, level, message, optionalParams);
                for (let i = 0, ii = sinks.length; i < ii; ++i) {
                    sinks[i].handleEvent(event);
                }
            }
        },
        (() => {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            _trace_decorators = [bound];
            _debug_decorators = [bound];
            _info_decorators = [bound];
            _warn_decorators = [bound];
            _error_decorators = [bound];
            _fatal_decorators = [bound];
            __esDecorate(_a, null, _trace_decorators, { kind: "method", name: "trace", static: false, private: false, access: { has: obj => "trace" in obj, get: obj => obj.trace }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(_a, null, _debug_decorators, { kind: "method", name: "debug", static: false, private: false, access: { has: obj => "debug" in obj, get: obj => obj.debug }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(_a, null, _info_decorators, { kind: "method", name: "info", static: false, private: false, access: { has: obj => "info" in obj, get: obj => obj.info }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(_a, null, _warn_decorators, { kind: "method", name: "warn", static: false, private: false, access: { has: obj => "warn" in obj, get: obj => obj.warn }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(_a, null, _error_decorators, { kind: "method", name: "error", static: false, private: false, access: { has: obj => "error" in obj, get: obj => obj.error }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(_a, null, _fatal_decorators, { kind: "method", name: "fatal", static: false, private: false, access: { has: obj => "fatal" in obj, get: obj => obj.fatal }, metadata: _metadata }, null, _instanceExtraInitializers);
            if (_metadata) Object.defineProperty(_a, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        })(),
        _a;
})();
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
const LoggerConfiguration = /*@__PURE__*/ toLookup({
    /**
     * @param $console - The `console` object to use. Can be the native `window.console` / `global.console`, but can also be a wrapper or mock that implements the same interface.
     * @param level - The global `LogLevel` to configure. Defaults to `warn` or higher.
     * @param colorOptions - Whether to use colors or not. Defaults to `noColors`. Colors are especially nice in nodejs environments but don't necessarily work (well) in all environments, such as browsers.
     */
    create({ level = warn, colorOptions = 'no-colors', sinks = [], } = {}) {
        return toLookup({
            register(container) {
                container.register(instanceRegistration(ILogConfig, new LogConfig(colorOptions, level)));
                for (const $sink of sinks) {
                    if (isFunction($sink)) {
                        container.register(singletonRegistration(ISink, $sink));
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

const IModuleLoader = /*@__PURE__*/ createInterface(x => x.singleton(ModuleLoader));
const noTransform = (m) => m;
class ModuleTransformer {
    constructor(transform) {
        this._promiseCache = new Map();
        this._objectCache = new Map();
        this._transform = transform;
    }
    transform(objOrPromise) {
        if (objOrPromise instanceof Promise) {
            return this._transformPromise(objOrPromise);
        }
        else if (typeof objOrPromise === 'object' && objOrPromise !== null) {
            return this._transformObject(objOrPromise);
        }
        else {
            throw createMappedError(21 /* ErrorNames.invalid_module_transform_input */, objOrPromise);
        }
    }
    /** @internal */
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
    /** @internal */
    _transformObject(obj) {
        if (this._objectCache.has(obj)) {
            return this._objectCache.get(obj);
        }
        const ret = this._transform(this._analyze(obj));
        this._objectCache.set(obj, ret);
        if (ret instanceof Promise) {
            void ret.then(value => {
                // make it synchronous for future requests
                this._objectCache.set(obj, value);
            });
        }
        return ret;
    }
    /** @internal */
    _analyze(m) {
        if (m == null)
            throw createMappedError(21 /* ErrorNames.invalid_module_transform_input */, m);
        if (typeof m !== 'object')
            return new AnalyzedModule(m, []);
        let value;
        let isRegistry;
        let isConstructable;
        let definition;
        const items = [];
        for (const key in m) {
            switch (typeof (value = m[key])) {
                case 'object':
                    if (value === null) {
                        continue;
                    }
                    isRegistry = isFunction(value.register);
                    isConstructable = false;
                    definition = null;
                    break;
                case 'function':
                    isRegistry = isFunction(value.register);
                    isConstructable = value.prototype !== void 0;
                    definition = getMetadata(resourceBaseName, value) ?? null;
                    break;
                default:
                    continue;
            }
            items.push(new ModuleItem(key, value, isRegistry, isConstructable, definition));
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
    constructor(key, value, isRegistry, isConstructable, definition) {
        this.key = key;
        this.value = value;
        this.isRegistry = isRegistry;
        this.isConstructable = isConstructable;
        this.definition = definition;
    }
}
/**
 * Iterate through the exports of a module and register aliases for resources respectively
 */
const aliasedResourcesRegistry = (mod, mainKeyAlias, aliases = {}) => {
    return {
        register(container) {
            const analyzedModule = container.get(IModuleLoader).load(mod);
            let mainAliasRegistered = false;
            analyzedModule.items.forEach((item) => {
                const definition = item.definition;
                if (definition == null) {
                    container.register(item.value);
                    return;
                }
                if (!mainAliasRegistered && mainKeyAlias != null) {
                    mainAliasRegistered = true;
                    definition.register(container, mainKeyAlias);
                    return;
                }
                // cannot use item.key, since it could contain an uppercase letter
                // while if import as is used in html, then it'll be lowercase letters only
                // using definition name, however, comes with an issue, which is that it's not guaranteed to be unique
                //
                // for example: a module can export both an element and an attribute with the name "foo"
                // but if that's the case, devs can always split the exports into two modules
                const alias = aliases[definition.name];
                definition.register(container, alias);
            });
        },
    };
};
// or extract the registry part into a class?
//
// class AliasModuleKeysRegistry implements IRegistry {
//   /** @internal */ private readonly _mod: IModule;
//   /** @internal */ private readonly _mainKeyAlias: string | null;
//   /** @internal */ private readonly _otherAliases: Record<string, string>;
//   public constructor(
//     mod: IModule,
//     mainKeyAlias: string | null,
//     aliases: Record<string, string>,
//   ) {
//     this._mod = mod;
//     this._mainKeyAlias = mainKeyAlias;
//     this._otherAliases = aliases;
//   }
//   /** @internal */
//   private _getAliasedKeyForName(key: string, name: string): string {
//     // replace the part after the last : with the name
//     const parts = key.split(':');
//     parts[parts.length - 1] = name;
//     return parts.join(':');
//   }
//   public register(container: IContainer) {
//     const analyzedModule = container.get(IModuleLoader).load(this._mod);
//     let mainAliasRegistered = false;
//     analyzedModule.items.forEach((item) => {
//       const definition = item.definition;
//       if (definition == null) {
//         container.register(item.value);
//         return;
//       }
//       if (!mainAliasRegistered && this._mainKeyAlias != null) {
//         mainAliasRegistered = true;
//         aliasToRegistration(definition.key, this._mainKeyAlias).register(container);
//         return;
//       }
//       for (const aliasedExport in this._otherAliases) {
//         const aliasName = this._otherAliases[aliasedExport];
//         const aliasKey = this._getAliasedKeyForName(definition.key, aliasName);
//         if (item.key === aliasedExport) {
//           aliasToRegistration(definition.key, aliasKey).register(container);
//         }
//       }
//     });
//   }
// }

/**
 * Represents a handler for an EventAggregator event.
 */
class Handler {
    constructor(type, cb) {
        this.type = type;
        this.cb = cb;
    }
    handle(message) {
        if (message instanceof this.type) {
            this.cb.call(null, message);
        }
    }
}
const IEventAggregator = /*@__PURE__*/ createInterface('IEventAggregator', x => x.singleton(EventAggregator));
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
        // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
        if (!channelOrInstance) {
            throw createMappedError(18 /* ErrorNames.event_aggregator_publish_invalid_event_name */, channelOrInstance);
        }
        if (isString(channelOrInstance)) {
            let subscribers = this.eventLookup[channelOrInstance];
            if (subscribers !== void 0) {
                subscribers = subscribers.slice();
                const numSubscribers = subscribers.length;
                for (let i = 0; i < numSubscribers; i++) {
                    subscribers[i](message, channelOrInstance);
                }
            }
        }
        else {
            const subscribers = this.messageHandlers.slice();
            const numSubscribers = subscribers.length;
            for (let i = 0; i < numSubscribers; i++) {
                subscribers[i].handle(channelOrInstance);
            }
        }
    }
    subscribe(channelOrType, callback) {
        // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
        if (!channelOrType) {
            throw createMappedError(19 /* ErrorNames.event_aggregator_subscribe_invalid_event_name */, channelOrType);
        }
        let handler;
        let subscribers;
        if (isString(channelOrType)) {
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
        const sub = this.subscribe(channelOrType, (message, event) => {
            sub.dispose();
            callback(message, event);
        });
        return sub;
    }
}

exports.AnalyzedModule = AnalyzedModule;
exports.ConsoleSink = ConsoleSink;
exports.ContainerConfiguration = ContainerConfiguration;
exports.DI = DI;
exports.DefaultLogEvent = DefaultLogEvent;
exports.DefaultLogEventFactory = DefaultLogEventFactory;
exports.DefaultLogger = DefaultLogger;
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
exports.LogLevel = LogLevel;
exports.LoggerConfiguration = LoggerConfiguration;
exports.ModuleItem = ModuleItem;
exports.Protocol = Protocol;
exports.Registration = Registration;
exports.aliasedResourcesRegistry = aliasedResourcesRegistry;
exports.all = all;
exports.allResources = allResources;
exports.areEqual = areEqual;
exports.bound = bound;
exports.camelCase = camelCase;
exports.createImplementationRegister = createImplementationRegister;
exports.createLookup = createLookup;
exports.createResolver = createResolver;
exports.emptyArray = emptyArray;
exports.emptyObject = emptyObject;
exports.factory = factory;
exports.firstDefined = firstDefined;
exports.format = format;
exports.fromAnnotationOrDefinitionOrTypeOrDefault = fromAnnotationOrDefinitionOrTypeOrDefault;
exports.fromAnnotationOrTypeOrDefault = fromAnnotationOrTypeOrDefault;
exports.fromDefinitionOrDefault = fromDefinitionOrDefault;
exports.getPrototypeChain = getPrototypeChain;
exports.getResourceKeyFor = getResourceKeyFor;
exports.ignore = ignore;
exports.inject = inject;
exports.isArray = isArray;
exports.isArrayIndex = isArrayIndex;
exports.isFunction = isFunction;
exports.isMap = isMap;
exports.isNativeFunction = isNativeFunction;
exports.isNumber = isNumber;
exports.isObject = isObject;
exports.isObjectOrFunction = isObjectOrFunction;
exports.isPromise = isPromise;
exports.isSet = isSet;
exports.isString = isString;
exports.isSymbol = isSymbol;
exports.kebabCase = kebabCase;
exports.last = last;
exports.lazy = lazy;
exports.mergeArrays = mergeArrays;
exports.newInstanceForScope = newInstanceForScope;
exports.newInstanceOf = newInstanceOf;
exports.noop = noop;
exports.onResolve = onResolve;
exports.onResolveAll = onResolveAll;
exports.optional = optional;
exports.optionalResource = optionalResource;
exports.own = own;
exports.pascalCase = pascalCase;
exports.registrableMetadataKey = registrableMetadataKey;
exports.resolve = resolve;
exports.resource = resource;
exports.resourceBaseName = resourceBaseName;
exports.singleton = singleton;
exports.sink = sink;
exports.toArray = toArray;
exports.transient = transient;
//# sourceMappingURL=index.dev.cjs.map
