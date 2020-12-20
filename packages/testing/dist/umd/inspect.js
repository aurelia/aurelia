// Significant portion of this code is copy-pasted from the node.js source
// Modifications consist primarily of removing dependencies on v8 natives and adding typings
(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "@aurelia/kernel", "./util.js", "./test-context.js"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.inspectValue = exports.inspect = exports.formatValue = exports.formatRaw = exports.formatProperty = exports.formatPromise = exports.formatIterator = exports.formatWeakMap = exports.formatWeakSet = exports.formatWeakCollection = exports.formatMapIterInner = exports.formatSetIterInner = exports.formatMap = exports.formatSet = exports.formatTypedArray = exports.formatArray = exports.formatArrayBuffer = exports.formatSpecialArray = exports.formatError = exports.formatPrimitive = exports.formatNumber = exports.AssertionError = exports.customInspectSymbol = void 0;
    const kernel_1 = require("@aurelia/kernel");
    const util_js_1 = require("./util.js");
    const test_context_js_1 = require("./test-context.js");
    /* eslint-disable max-lines-per-function, @typescript-eslint/no-explicit-any, @typescript-eslint/ban-types, @typescript-eslint/no-non-null-assertion */
    let maxStack_ErrorName;
    let maxStack_ErrorMessage;
    function isStackOverflowError(err) {
        if (maxStack_ErrorMessage === undefined) {
            try {
                function overflowStack() { overflowStack(); }
                overflowStack();
            }
            catch (err) {
                maxStack_ErrorMessage = err.message;
                maxStack_ErrorName = err.name;
            }
        }
        return (err.name === maxStack_ErrorName
            && err.message === maxStack_ErrorMessage);
    }
    const defaultInspectOptions = util_js_1.Object_freeze({
        showHidden: false,
        depth: 2,
        colors: true,
        customInspect: true,
        showProxy: false,
        maxArrayLength: 100,
        breakLength: 60,
        compact: true,
        sorted: false,
        getters: false,
        userOptions: void 0,
        stylize: stylizeWithColor,
    });
    const mandatoryInspectKeys = util_js_1.Object_keys(defaultInspectOptions);
    function getUserOptions(ctx) {
        const obj = {};
        for (const key of mandatoryInspectKeys) {
            // @ts-ignore // TODO: https://github.com/microsoft/TypeScript/issues/31904
            obj[key] = ctx[key];
        }
        if (ctx.userOptions !== void 0) {
            util_js_1.Object_assign(obj, ctx.userOptions);
        }
        return obj;
    }
    function getInspectContext(ctx) {
        const obj = {
            ...defaultInspectOptions,
            budget: {},
            indentationLvl: 0,
            seen: [],
            currentDepth: 0,
            stylize: ctx.colors ? stylizeWithColor : stylizeNoColor,
        };
        for (const key of mandatoryInspectKeys) {
            if (util_js_1.hasOwnProperty(ctx, key)) {
                // @ts-ignore // TODO: https://github.com/microsoft/TypeScript/issues/31904
                obj[key] = ctx[key];
            }
        }
        if (obj.userOptions === void 0) {
            obj.userOptions = ctx;
        }
        return obj;
    }
    const styles = util_js_1.Object_freeze({
        special: 'cyan',
        number: 'yellow',
        boolean: 'yellow',
        undefined: 'grey',
        null: 'bold',
        string: 'green',
        symbol: 'green',
        date: 'magenta',
        regexp: 'red',
    });
    const operatorText = util_js_1.Object_freeze({
        deepStrictEqual: 'Expected values to be strictly deep-equal:',
        strictEqual: 'Expected values to be strictly equal:',
        strictEqualObject: 'Expected "actual" to be reference-equal to "expected":',
        deepEqual: 'Expected values to be loosely deep-equal:',
        equal: 'Expected values to be loosely equal:',
        notDeepStrictEqual: 'Expected "actual" not to be strictly deep-equal to:',
        notStrictEqual: 'Expected "actual" to be strictly unequal to:',
        notStrictEqualObject: 'Expected "actual" not to be reference-equal to "expected":',
        notDeepEqual: 'Expected "actual" not to be loosely deep-equal to:',
        notEqual: 'Expected "actual" to be loosely unequal to:',
        notIdentical: 'Values identical but not reference-equal:',
    });
    exports.customInspectSymbol = Symbol.for('customInspect');
    function stylizeWithColor(str, styleType) {
        const style = styles[styleType];
        if (util_js_1.isString(style)) {
            return util_js_1.colors[style](str);
        }
        else {
            return str;
        }
    }
    function stylizeNoColor(str, styleType) {
        return str;
    }
    class AssertionError extends Error {
        constructor(options) {
            const { actual, expected, message, operator, stackStartFn } = options;
            const limit = Error.stackTraceLimit;
            Error.stackTraceLimit = 0;
            let prefix = message == null ? '' : `${message} - `;
            if (operator === 'deepStrictEqual' || operator === 'strictEqual') {
                super(`${prefix}${createErrDiff(actual, expected, operator)}`);
            }
            else if (operator === 'notDeepStrictEqual'
                || operator === 'notStrictEqual') {
                let base = operatorText[operator];
                // eslint-disable-next-line prefer-const
                let res = inspectValue(actual).split('\n');
                if (operator === 'notStrictEqual'
                    && util_js_1.isObject(actual)) {
                    base = operatorText.notStrictEqualObject;
                }
                if (res.length > 30) {
                    res[26] = util_js_1.colors.blue('...');
                    while (res.length > 27) {
                        res.pop();
                    }
                }
                if (res.length === 1) {
                    super(`${prefix}${base} ${res[0]}`);
                }
                else {
                    super(`${prefix}${base}\n\n${util_js_1.join(res, '\n')}\n`);
                }
            }
            else {
                let res = inspectValue(actual);
                let other = '';
                const knownOperators = operatorText[operator];
                if (operator === 'notDeepEqual' || operator === 'notEqual') {
                    res = `${operatorText[operator]}\n\n${res}`;
                    if (res.length > 1024) {
                        res = `${res.slice(0, 1021)}...`;
                    }
                }
                else {
                    other = `${inspectValue(expected)}`;
                    if (res.length > 512) {
                        res = `${res.slice(0, 509)}...`;
                    }
                    if (other.length > 512) {
                        other = `${other.slice(0, 509)}...`;
                    }
                    if (operator === 'deepEqual' || operator === 'equal') {
                        res = `${knownOperators}\n\n${res}\n\nshould equal\n\n`;
                    }
                    else {
                        other = ` ${operator} ${other}`;
                    }
                }
                if (!operator) {
                    other = '';
                    res = '';
                    prefix = prefix.slice(0, -3);
                }
                super(`${prefix}${res}${other}`);
            }
            Error.stackTraceLimit = limit;
            this.generatedMessage = !message || message === 'Failed';
            util_js_1.defineProperty(this, 'name', {
                value: 'AssertionError [ERR_ASSERTION]',
                enumerable: false,
                writable: true,
                configurable: true
            });
            this.code = 'ERR_ASSERTION';
            this.actual = actual;
            this.expected = expected;
            this.operator = operator;
            if (typeof Error.captureStackTrace === 'function') {
                Error.captureStackTrace(this, stackStartFn);
                // eslint-disable-next-line @typescript-eslint/no-unused-expressions
                this.stack;
            }
            else {
                // eslint-disable-next-line @typescript-eslint/no-unused-expressions
                Error().stack;
            }
            this.name = 'AssertionError';
        }
        toString() {
            return `${this.name} [${this.code}]: ${this.message}`;
        }
        [exports.customInspectSymbol](recurseTimes, ctx) {
            return inspect(this, {
                ...ctx,
                customInspect: false,
                depth: 0,
            });
        }
    }
    exports.AssertionError = AssertionError;
    const kMaxShortLength = 10;
    function createErrDiff(actual, expected, operator) {
        let other = '';
        let res = '';
        let lastPos = 0;
        let end = '';
        let skipped = false;
        const actualInspected = inspectValue(actual);
        const actualLines = actualInspected.split('\n');
        const expectedLines = inspectValue(expected).split('\n');
        let i = 0;
        let indicator = '';
        if (operator === 'strictEqual'
            && util_js_1.isObject(actual)
            && util_js_1.isObject(expected)) {
            operator = 'strictEqualObject';
        }
        if (actualLines.length === 1
            && expectedLines.length === 1
            && actualLines[0] !== expectedLines[0]) {
            const inputLength = actualLines[0].length + expectedLines[0].length;
            if (inputLength <= kMaxShortLength) {
                if (!util_js_1.isObject(actual)
                    && !util_js_1.isObject(expected)
                    && (actual !== 0 || expected !== 0)) {
                    return `${operatorText[operator]}\n\n${actualLines[0]} !== ${expectedLines[0]}\n`;
                }
            }
            else if (operator !== 'strictEqualObject' && inputLength < 80) {
                while (actualLines[0][i] === expectedLines[0][i]) {
                    i++;
                }
                if (i > 2) {
                    indicator = `\n  ${' '.repeat(i)}^`;
                    i = 0;
                }
            }
        }
        let a = actualLines[actualLines.length - 1];
        let b = expectedLines[expectedLines.length - 1];
        while (a === b) {
            if (i++ < 2) {
                end = `\n  ${a}${end}`;
            }
            else {
                other = a;
            }
            actualLines.pop();
            expectedLines.pop();
            if (actualLines.length === 0 || expectedLines.length === 0) {
                break;
            }
            a = actualLines[actualLines.length - 1];
            b = expectedLines[expectedLines.length - 1];
        }
        const maxLines = Math.max(actualLines.length, expectedLines.length);
        if (maxLines === 0) {
            const $actualLines = actualInspected.split('\n');
            if ($actualLines.length > 30) {
                $actualLines[26] = util_js_1.colors.blue('...');
                while ($actualLines.length > 27) {
                    $actualLines.pop();
                }
            }
            return `${operatorText.notIdentical}\n\n${util_js_1.join($actualLines, '\n')}\n`;
        }
        if (i > 3) {
            end = `\n${util_js_1.colors.blue('...')}${end}`;
            skipped = true;
        }
        if (other !== '') {
            end = `\n  ${other}${end}`;
            other = '';
        }
        let printedLines = 0;
        const msg = `${operatorText[operator]}\n${util_js_1.colors.green('+ actual')} ${util_js_1.colors.red('- expected')}`;
        const skippedMsg = ` ${util_js_1.colors.blue('...')} Lines skipped`;
        for (i = 0; i < maxLines; i++) {
            const cur = i - lastPos;
            if (actualLines.length < i + 1) {
                if (cur > 1 && i > 2) {
                    if (cur > 4) {
                        res += `\n${util_js_1.colors.blue('...')}`;
                        skipped = true;
                    }
                    else if (cur > 3) {
                        res += `\n  ${expectedLines[i - 2]}`;
                        printedLines++;
                    }
                    res += `\n  ${expectedLines[i - 1]}`;
                    printedLines++;
                }
                lastPos = i;
                other += `\n${util_js_1.colors.red('-')} ${expectedLines[i]}`;
                printedLines++;
            }
            else if (expectedLines.length < i + 1) {
                if (cur > 1 && i > 2) {
                    if (cur > 4) {
                        res += `\n${util_js_1.colors.blue('...')}`;
                        skipped = true;
                    }
                    else if (cur > 3) {
                        res += `\n  ${actualLines[i - 2]}`;
                        printedLines++;
                    }
                    res += `\n  ${actualLines[i - 1]}`;
                    printedLines++;
                }
                lastPos = i;
                res += `\n${util_js_1.colors.green('+')} ${actualLines[i]}`;
                printedLines++;
            }
            else {
                const expectedLine = expectedLines[i];
                let actualLine = actualLines[i];
                let divergingLines = (actualLine !== expectedLine && (!actualLine.endsWith(',')
                    || actualLine.slice(0, -1) !== expectedLine) // eslint-disable-line @typescript-eslint/prefer-string-starts-ends-with
                );
                if (divergingLines
                    && expectedLine.endsWith(',')
                    && expectedLine.slice(0, -1) === actualLine // eslint-disable-line @typescript-eslint/prefer-string-starts-ends-with
                ) {
                    divergingLines = false;
                    actualLine += ',';
                }
                if (divergingLines) {
                    if (cur > 1 && i > 2) {
                        if (cur > 4) {
                            res += `\n${util_js_1.colors.blue('...')}`;
                            skipped = true;
                        }
                        else if (cur > 3) {
                            res += `\n  ${actualLines[i - 2]}`;
                            printedLines++;
                        }
                        res += `\n  ${actualLines[i - 1]}`;
                        printedLines++;
                    }
                    lastPos = i;
                    res += `\n${util_js_1.colors.green('+')} ${actualLine}`;
                    other += `\n${util_js_1.colors.red('-')} ${expectedLine}`;
                    printedLines += 2;
                }
                else {
                    res += other;
                    other = '';
                    if (cur === 1 || i === 0) {
                        res += `\n  ${actualLine}`;
                        printedLines++;
                    }
                }
            }
            if (printedLines > 1000 && i < maxLines - 2) {
                return `${msg}${skippedMsg}\n${res}\n${util_js_1.colors.blue('...')}${other}\n${util_js_1.colors.blue('...')}`;
            }
        }
        return `${msg}${skipped ? skippedMsg : ''}\n${res}${other}${end}${indicator}`;
    }
    const kObjectType = 0;
    const kArrayType = 1;
    const kArrayExtrasType = 2;
    const idStart = new Int8Array(0x80);
    const idPart = new Int8Array(0x80);
    for (let i = 0; i < 0x80; ++i) {
        if (i === 36 /* Dollar */
            || i === 95 /* Underscore */
            || (i >= 65 /* UpperA */ && i <= 90 /* UpperZ */)
            || (i >= 97 /* LowerA */ && i <= 122 /* LowerZ */)) {
            idStart[i] = idPart[i] = 1;
        }
        else if (i >= 49 /* One */ && i <= 57 /* Nine */) {
            idPart[i] = 1;
        }
    }
    function isValidIdentifier(str) {
        if (idStart[str.charCodeAt(0)] !== 1) {
            return false;
        }
        const { length } = str;
        for (let i = 1; i < length; ++i) {
            if (idPart[str.charCodeAt(i)] !== 1) {
                return false;
            }
        }
        return true;
    }
    const readableRegExps = {};
    const kMinLineLength = 16;
    // Constants to map the iterator state.
    const kWeak = 0;
    const kIterator = 1;
    const kMapEntries = 2;
    function groupArrayElements(ctx, output) {
        let totalLength = 0;
        let maxLength = 0;
        let i = 0;
        const dataLen = new Array(output.length);
        // Calculate the total length of all output entries and the individual max
        // entries length of all output entries. We have to remove colors first,
        // otherwise the length would not be calculated properly.
        for (; i < output.length; i++) {
            const len = ctx.colors ? util_js_1.removeColors(output[i]).length : output[i].length;
            dataLen[i] = len;
            totalLength += len;
            if (maxLength < len) {
                maxLength = len;
            }
        }
        // Add two to `maxLength` as we add a single whitespace character plus a comma
        // in-between two entries.
        const actualMax = maxLength + 2;
        // Check if at least three entries fit next to each other and prevent grouping
        // of arrays that contains entries of very different length (i.e., if a single
        // entry is longer than 1/5 of all other entries combined). Otherwise the
        // space in-between small entries would be enormous.
        if (actualMax * 3 + ctx.indentationLvl < ctx.breakLength
            && (totalLength / maxLength > 5 || maxLength <= 6)) {
            const approxCharHeights = 2.5;
            const bias = 1;
            // Dynamically check how many columns seem possible.
            const columns = Math.min(
            // Ideally a square should be drawn. We expect a character to be about 2.5
            // times as high as wide. This is the area formula to calculate a square
            // which contains n rectangles of size `actualMax * approxCharHeights`.
            // Divide that by `actualMax` to receive the correct number of columns.
            // The added bias slightly increases the columns for short entries.
            Math.round(Math.sqrt(approxCharHeights * (actualMax - bias) * output.length)
                / (actualMax - bias)), 
            // Limit array grouping for small `compact` modes as the user requested
            // minimal grouping.
            ctx.compact * 3, 
            // Limit the columns to a maximum of ten.
            10);
            // Return with the original output if no grouping should happen.
            if (columns <= 1) {
                return output;
            }
            // Calculate the maximum length of all entries that are visible in the first
            // column of the group.
            const tmp = [];
            let firstLineMaxLength = dataLen[0];
            for (i = columns; i < dataLen.length; i += columns) {
                if (dataLen[i] > firstLineMaxLength) {
                    firstLineMaxLength = dataLen[i];
                }
            }
            // Each iteration creates a single line of grouped entries.
            for (i = 0; i < output.length; i += columns) {
                // Calculate extra color padding in case it's active. This has to be done
                // line by line as some lines might contain more colors than others.
                let colorPadding = output[i].length - dataLen[i];
                // Add padding to the first column of the output.
                let str = output[i].padStart(firstLineMaxLength + colorPadding, ' ');
                // The last lines may contain less entries than columns.
                const max = Math.min(i + columns, output.length);
                for (let j = i + 1; j < max; j++) {
                    colorPadding = output[j].length - dataLen[j];
                    str += `, ${output[j].padStart(maxLength + colorPadding, ' ')}`;
                }
                tmp.push(str);
            }
            output = tmp;
        }
        return output;
    }
    function handleMaxCallStackSize(ctx, err, constructor, tag, indentationLvl) {
        if (isStackOverflowError(err)) {
            ctx.seen.pop();
            ctx.indentationLvl = indentationLvl;
            return ctx.stylize(`[${getCtxStyle(constructor, tag)}: Inspection interrupted prematurely. Maximum call stack size exceeded.]`, 'special');
        }
        throw err;
    }
    const typedArrayKeys = util_js_1.Object_freeze([
        'BYTES_PER_ELEMENT',
        'length',
        'byteLength',
        'byteOffset',
        'buffer'
    ]);
    function entriesToArray(value) {
        const ret = [];
        for (const [k, v] of value) {
            ret.push(k, v);
        }
        return ret;
    }
    function isBelowBreakLength(ctx, output, start) {
        let totalLength = output.length + start;
        if (totalLength + output.length > ctx.breakLength) {
            return false;
        }
        for (let i = 0; i < output.length; i++) {
            if (ctx.colors) {
                totalLength += util_js_1.removeColors(output[i]).length;
            }
            else {
                totalLength += output[i].length;
            }
            if (totalLength > ctx.breakLength) {
                return false;
            }
        }
        return true;
    }
    function reduceToSingleString(ctx, output, base, braces, combine = false) {
        if (ctx.compact !== true) {
            if (combine) {
                const start = (output.length
                    + ctx.indentationLvl
                    + braces[0].length
                    + base.length
                    + 10);
                if (isBelowBreakLength(ctx, output, start)) {
                    return `${base ? `${base} ` : ''}${braces[0]} ${util_js_1.join(output, ', ')} ${braces[1]}`;
                }
            }
            const indent = `\n${' '.repeat(ctx.indentationLvl)}`;
            return `${base ? `${base} ` : ''}${braces[0]}${indent}  ${util_js_1.join(output, `,${indent}  `)}${indent}${braces[1]}`;
        }
        if (isBelowBreakLength(ctx, output, 0)) {
            return `${braces[0]}${base ? ` ${base}` : ''} ${util_js_1.join(output, ', ')} ${braces[1]}`;
        }
        const indentation = ' '.repeat(ctx.indentationLvl);
        const ln = base === '' && braces[0].length === 1
            ? ' '
            : `${base ? ` ${base}` : ''}\n${indentation}  `;
        return `${braces[0]}${ln}${util_js_1.join(output, `,\n${indentation}  `)} ${braces[1]}`;
    }
    function getConstructorName(obj, ctx) {
        let firstProto;
        while (obj) {
            const descriptor = util_js_1.getOwnPropertyDescriptor(obj, 'constructor');
            if (!util_js_1.isUndefined(descriptor)
                && util_js_1.isFunction(descriptor.value)
                && descriptor.value.name !== '') {
                return descriptor.value.name;
            }
            obj = util_js_1.getPrototypeOf(obj);
            if (firstProto === void 0) {
                firstProto = obj;
            }
        }
        if (firstProto === null) {
            return null;
        }
        const newCtx = {
            ...ctx,
            customInspect: false,
        };
        return `<${inspect(firstProto, newCtx)}>`;
    }
    function getEmptyFormatArray() {
        return [];
    }
    function getPrefix(constructor, tag, fallback) {
        if (constructor === null) {
            if (tag !== '') {
                return `[${fallback}: null prototype] [${tag}] `;
            }
            return `[${fallback}: null prototype] `;
        }
        if (tag !== '' && constructor !== tag) {
            return `${constructor} [${tag}] `;
        }
        return `${constructor} `;
    }
    const getBoxedValue = formatPrimitive.bind(null, stylizeNoColor);
    function getKeys(value, showHidden) {
        let keys;
        const symbols = util_js_1.getOwnPropertySymbols(value);
        if (showHidden) {
            keys = util_js_1.getOwnPropertyNames(value);
            if (symbols.length !== 0) {
                keys.push(...symbols);
            }
        }
        else {
            keys = util_js_1.Object_keys(value);
            if (symbols.length !== 0) {
                keys.push(...symbols.filter((key) => util_js_1.propertyIsEnumerable(value, key)));
            }
        }
        return keys;
    }
    function getCtxStyle(constructor, tag) {
        return constructor || tag || 'Object';
    }
    const typedConstructorMap = util_js_1.Object_freeze([
        [util_js_1.isUint8Array, Uint8Array],
        [util_js_1.isUint8ClampedArray, Uint8ClampedArray],
        [util_js_1.isUint16Array, Uint16Array],
        [util_js_1.isUint32Array, Uint32Array],
        [util_js_1.isInt8Array, Int8Array],
        [util_js_1.isInt16Array, Int16Array],
        [util_js_1.isInt32Array, Int32Array],
        [util_js_1.isFloat32Array, Float32Array],
        [util_js_1.isFloat64Array, Float64Array],
    ]);
    const typedConstructorCount = typedConstructorMap.length;
    function findTypedConstructor(value) {
        for (let i = 0; i < typedConstructorCount; ++i) {
            const [isType, Type] = typedConstructorMap[i];
            if (isType(value)) {
                return Type;
            }
        }
        return (void 0);
    }
    function setIteratorBraces(type, tag) {
        if (tag !== `${type} Iterator`) {
            if (tag !== '') {
                tag += '] [';
            }
            tag += `${type} Iterator`;
        }
        return [`[${tag}] {`, '}'];
    }
    let lazyNullPrototypeCache;
    // Creates a subclass and name
    // the constructor as `${clazz} : null prototype`
    function clazzWithNullPrototype(clazz, name) {
        if (lazyNullPrototypeCache === undefined) {
            lazyNullPrototypeCache = new Map();
        }
        else {
            const cachedClass = lazyNullPrototypeCache.get(clazz);
            if (cachedClass !== undefined) {
                return cachedClass;
            }
        }
        class NullPrototype extends clazz {
            get [Symbol.toStringTag]() {
                return '';
            }
        }
        util_js_1.defineProperty(NullPrototype.prototype.constructor, 'name', { value: `[${name}: null prototype]` });
        lazyNullPrototypeCache.set(clazz, NullPrototype);
        return NullPrototype;
    }
    function noPrototypeIterator(ctx, value, recurseTimes) {
        let newVal;
        if (util_js_1.isSet(value)) {
            const clazz = clazzWithNullPrototype(Set, 'Set');
            newVal = new clazz(util_js_1.Set_values(value));
        }
        else if (util_js_1.isMap(value)) {
            const clazz = clazzWithNullPrototype(Map, 'Map');
            newVal = new clazz(util_js_1.Map_entries(value));
        }
        else if (Array.isArray(value)) {
            const clazz = clazzWithNullPrototype(Array, 'Array');
            newVal = new clazz(value.length);
        }
        else if (util_js_1.isTypedArray(value)) {
            const constructor = findTypedConstructor(value);
            const clazz = clazzWithNullPrototype(constructor, constructor.name);
            newVal = new clazz(value);
        }
        if (newVal !== undefined) {
            util_js_1.defineProperties(newVal, util_js_1.getOwnPropertyDescriptors(value));
            return formatRaw(ctx, newVal, recurseTimes);
        }
        return (void 0);
    }
    function getMessage(self) {
        return `${util_js_1.truncate(inspect(self.actual), 128)} ${self.operator} ${util_js_1.truncate(inspect(self.expected), 128)}`;
    }
    function formatNumber(fn, value) {
        return fn(util_js_1.Object_is(value, -0) ? '-0' : `${value}`, 'number');
    }
    exports.formatNumber = formatNumber;
    function formatPrimitive(fn, value, ctx) {
        switch (typeof value) {
            case 'string':
                if (ctx.compact !== true &&
                    ctx.indentationLvl + value.length > ctx.breakLength &&
                    value.length > kMinLineLength) {
                    const rawMaxLineLength = ctx.breakLength - ctx.indentationLvl;
                    const maxLineLength = Math.max(rawMaxLineLength, kMinLineLength);
                    const lines = Math.ceil(value.length / maxLineLength);
                    const averageLineLength = Math.ceil(value.length / lines);
                    const divisor = Math.max(averageLineLength, kMinLineLength);
                    if (readableRegExps[divisor] === void 0) {
                        readableRegExps[divisor] = new RegExp(`(.|\\n){1,${divisor}}(\\s|$)|(\\n|.)+?(\\s|$)`, 'gm');
                    }
                    // eslint-disable-next-line @typescript-eslint/prefer-regexp-exec
                    const matches = value.match(readableRegExps[divisor]);
                    if (matches.length > 1) {
                        const indent = ' '.repeat(ctx.indentationLvl);
                        let res = `${fn(util_js_1.escapeAndQuoteString(matches[0]), 'string')} +\n`;
                        let i = 1;
                        for (; i < matches.length - 1; i++) {
                            res += `${indent}  ${fn(util_js_1.escapeAndQuoteString(matches[i]), 'string')} +\n`;
                        }
                        res += `${indent}  ${fn(util_js_1.escapeAndQuoteString(matches[i]), 'string')}`;
                        return res;
                    }
                }
                return fn(util_js_1.escapeAndQuoteString(value), 'string');
            case 'number':
                return formatNumber(fn, value);
            case 'boolean':
                return fn(value.toString(), 'boolean');
            case 'undefined':
                return fn('undefined', 'undefined');
            case 'symbol':
                return fn(value.toString(), 'symbol');
        }
        throw new Error(`formatPrimitive only handles non-null primitives. Got: ${util_js_1.Object_toString(value)}`);
    }
    exports.formatPrimitive = formatPrimitive;
    function formatError(value) {
        return value.stack || util_js_1.Error_toString(value);
    }
    exports.formatError = formatError;
    function formatSpecialArray(ctx, value, recurseTimes, maxLength, output, i) {
        const keys = util_js_1.Object_keys(value);
        let index = i;
        for (; i < keys.length && output.length < maxLength; i++) {
            const key = keys[i];
            const tmp = +key;
            if (tmp > 2 ** 32 - 2) {
                break;
            }
            if (`${index}` !== key) {
                if (!kernel_1.isArrayIndex(key)) {
                    break;
                }
                const emptyItems = tmp - index;
                const ending = emptyItems > 1 ? 's' : '';
                const message = `<${emptyItems} empty item${ending}>`;
                output.push(ctx.stylize(message, 'undefined'));
                index = tmp;
                if (output.length === maxLength) {
                    break;
                }
            }
            output.push(formatProperty(ctx, value, recurseTimes, key, kArrayType));
            index++;
        }
        const remaining = value.length - index;
        if (output.length !== maxLength) {
            if (remaining > 0) {
                const ending = remaining > 1 ? 's' : '';
                const message = `<${remaining} empty item${ending}>`;
                output.push(ctx.stylize(message, 'undefined'));
            }
        }
        else if (remaining > 0) {
            output.push(`... ${remaining} more item${remaining > 1 ? 's' : ''}`);
        }
        return output;
    }
    exports.formatSpecialArray = formatSpecialArray;
    function formatArrayBuffer(ctx, value) {
        const buffer = new Uint8Array(value);
        let str = util_js_1.join(buffer.slice(0, Math.min(ctx.maxArrayLength, buffer.length)).map(val => val.toString(16)), ' ');
        const remaining = buffer.length - ctx.maxArrayLength;
        if (remaining > 0) {
            str += ` ... ${remaining} more byte${remaining > 1 ? 's' : ''}`;
        }
        return [`${ctx.stylize('[Uint8Contents]', 'special')}: <${str}>`];
    }
    exports.formatArrayBuffer = formatArrayBuffer;
    function formatArray(ctx, value, recurseTimes) {
        const valLen = value.length;
        const len = Math.min(Math.max(0, ctx.maxArrayLength), valLen);
        const remaining = valLen - len;
        const output = [];
        for (let i = 0; i < len; i++) {
            if (!util_js_1.hasOwnProperty(value, i)) {
                return formatSpecialArray(ctx, value, recurseTimes, len, output, i);
            }
            output.push(formatProperty(ctx, value, recurseTimes, i, kArrayType));
        }
        if (remaining > 0) {
            output.push(`... ${remaining} more item${remaining > 1 ? 's' : ''}`);
        }
        return output;
    }
    exports.formatArray = formatArray;
    function formatTypedArray(ctx, value, recurseTimes) {
        const maxLength = Math.min(Math.max(0, ctx.maxArrayLength), value.length);
        const remaining = value.length - maxLength;
        const output = new Array(maxLength);
        let i = 0;
        for (; i < maxLength; ++i) {
            output[i] = formatNumber(ctx.stylize, value[i]);
        }
        if (remaining > 0) {
            output[i] = `... ${remaining} more item${remaining > 1 ? 's' : ''}`;
        }
        if (ctx.showHidden) {
            ctx.indentationLvl += 2;
            for (const key of typedArrayKeys) {
                const str = formatValue(ctx, value[key], recurseTimes, true);
                output.push(`[${key}]: ${str}`);
            }
            ctx.indentationLvl -= 2;
        }
        return output;
    }
    exports.formatTypedArray = formatTypedArray;
    function formatSet(ctx, value, recurseTimes) {
        const output = [];
        ctx.indentationLvl += 2;
        for (const v of value) {
            output.push(formatValue(ctx, v, recurseTimes));
        }
        ctx.indentationLvl -= 2;
        if (ctx.showHidden) {
            output.push(`[size]: ${ctx.stylize(value.size.toString(), 'number')}`);
        }
        return output;
    }
    exports.formatSet = formatSet;
    function formatMap(ctx, value, recurseTimes) {
        const output = [];
        ctx.indentationLvl += 2;
        for (const [k, v] of value) {
            output.push(`${formatValue(ctx, k, recurseTimes)} => ${formatValue(ctx, v, recurseTimes)}`);
        }
        ctx.indentationLvl -= 2;
        if (ctx.showHidden) {
            output.push(`[size]: ${ctx.stylize(value.size.toString(), 'number')}`);
        }
        return output;
    }
    exports.formatMap = formatMap;
    function formatSetIterInner(ctx, recurseTimes, entries, state) {
        const maxArrayLength = Math.max(ctx.maxArrayLength, 0);
        const maxLength = Math.min(maxArrayLength, entries.length);
        const output = new Array(maxLength);
        ctx.indentationLvl += 2;
        for (let i = 0; i < maxLength; i++) {
            output[i] = formatValue(ctx, entries[i], recurseTimes);
        }
        ctx.indentationLvl -= 2;
        if (state === kWeak) {
            output.sort();
        }
        const remaining = entries.length - maxLength;
        if (remaining > 0) {
            output.push(`... ${remaining} more item${remaining > 1 ? 's' : ''}`);
        }
        return output;
    }
    exports.formatSetIterInner = formatSetIterInner;
    function formatMapIterInner(ctx, recurseTimes, entries, state) {
        const maxArrayLength = Math.max(ctx.maxArrayLength, 0);
        const len = entries.length / 2;
        const remaining = len - maxArrayLength;
        const maxLength = Math.min(maxArrayLength, len);
        const output = new Array(maxLength);
        let start = '';
        let end = '';
        let middle = ' => ';
        let i = 0;
        if (state === kMapEntries) {
            start = '[ ';
            end = ' ]';
            middle = ', ';
        }
        ctx.indentationLvl += 2;
        for (; i < maxLength; i++) {
            const pos = i * 2;
            output[i] = `${start}${formatValue(ctx, entries[pos], recurseTimes)}` +
                `${middle}${formatValue(ctx, entries[pos + 1], recurseTimes)}${end}`;
        }
        ctx.indentationLvl -= 2;
        if (state === kWeak) {
            output.sort();
        }
        if (remaining > 0) {
            output.push(`... ${remaining} more item${remaining > 1 ? 's' : ''}`);
        }
        return output;
    }
    exports.formatMapIterInner = formatMapIterInner;
    function formatWeakCollection(ctx) {
        return [ctx.stylize('<items unknown>', 'special')];
    }
    exports.formatWeakCollection = formatWeakCollection;
    function formatWeakSet(ctx, value, recurseTimes) {
        return formatSetIterInner(ctx, recurseTimes, [], kWeak);
    }
    exports.formatWeakSet = formatWeakSet;
    function formatWeakMap(ctx, value, recurseTimes) {
        return formatMapIterInner(ctx, recurseTimes, [], kWeak);
    }
    exports.formatWeakMap = formatWeakMap;
    function formatIterator(ctx, value, recurseTimes, braces) {
        const entries = entriesToArray(value.entries());
        if (value instanceof Map) {
            braces[0] = braces[0].replace(/ Iterator] {$/, ' Entries] {');
            return formatMapIterInner(ctx, recurseTimes, entries, kMapEntries);
        }
        return formatSetIterInner(ctx, recurseTimes, entries, kIterator);
    }
    exports.formatIterator = formatIterator;
    function formatPromise(ctx, value, recurseTimes) {
        return ['[object Promise]'];
    }
    exports.formatPromise = formatPromise;
    function formatProperty(ctx, value, recurseTimes, key, type) {
        switch (key) {
            // Aurelia-specific:
            case '$controller':
                return `$controller: { id: ${value.$controller.id} } (omitted for brevity)`;
            case 'overrideContext':
                return 'overrideContext: (omitted for brevity)';
        }
        let name, str;
        let extra = ' ';
        const desc = (util_js_1.getOwnPropertyDescriptor(value, key)
            || ({
                value: value[key],
                enumerable: true,
            }));
        if (desc.value !== void 0) {
            const diff = (type !== kObjectType
                || ctx.compact !== true) ? 2 : 3;
            ctx.indentationLvl += diff;
            str = formatValue(ctx, desc.value, recurseTimes);
            if (diff === 3) {
                const len = ctx.colors
                    ? util_js_1.removeColors(str).length
                    : str.length;
                if (ctx.breakLength < len) {
                    extra = `\n${' '.repeat(ctx.indentationLvl)}`;
                }
            }
            ctx.indentationLvl -= diff;
        }
        else if (desc.get !== void 0) {
            const label = desc.set !== void 0
                ? 'Getter/Setter'
                : 'Getter';
            const s = ctx.stylize;
            const sp = 'special';
            if (ctx.getters
                && (ctx.getters === true
                    || ctx.getters === 'get' && desc.set === void 0
                    || ctx.getters === 'set' && desc.set !== void 0)) {
                try {
                    const tmp = value[key];
                    ctx.indentationLvl += 2;
                    if (tmp === null) {
                        str = `${s(`[${label}:`, sp)} ${s('null', 'null')}${s(']', sp)}`;
                    }
                    else if (typeof tmp === 'object') {
                        str = `${s(`[${label}]`, sp)} ${formatValue(ctx, tmp, recurseTimes)}`;
                    }
                    else {
                        const primitive = formatPrimitive(s, tmp, ctx);
                        str = `${s(`[${label}:`, sp)} ${primitive}${s(']', sp)}`;
                    }
                    ctx.indentationLvl -= 2;
                }
                catch (err) {
                    const message = `<Inspection threw (${err.message})>`;
                    str = `${s(`[${label}:`, sp)} ${message}${s(']', sp)}`;
                }
            }
            else {
                str = ctx.stylize(`[${label}]`, sp);
            }
        }
        else if (desc.set !== void 0) {
            str = ctx.stylize('[Setter]', 'special');
        }
        else {
            str = ctx.stylize('undefined', 'undefined');
        }
        if (type === kArrayType) {
            return str;
        }
        if (util_js_1.isSymbol(key)) {
            const tmp = util_js_1.escapeString(key.toString());
            name = `[${ctx.stylize(tmp, 'symbol')}]`;
        }
        else if (desc.enumerable === false) {
            name = `[${util_js_1.escapeString(key.toString())}]`;
        }
        else if (isValidIdentifier(key)) {
            name = ctx.stylize(key, 'name');
        }
        else {
            name = ctx.stylize(util_js_1.escapeAndQuoteString(key), 'string');
        }
        return `${name}:${extra}${str}`;
    }
    exports.formatProperty = formatProperty;
    function formatRaw(ctx, value, recurseTimes, typedArray) {
        let keys = (void 0);
        const constructor = getConstructorName(value, ctx);
        switch (constructor) {
            // Aurelia-specific:
            // Skip some standard components as their difference will not matter in assertions, but they will
            // generate a lot of noise and slow down the inspection due to their size and property depth
            case 'Container':
            case 'ObserverLocator':
            // Also skip window object as it's not a node instance and therefore not filtered by formatProperty
            case 'Window':
                return ctx.stylize(`${constructor} (omitted for brevity)`, 'special');
            case 'Function':
                // It's likely a constructor, filter out some additional globals that don't matter in inspection
                if (value.name === 'Node') {
                    return ctx.stylize('Node constructor (omitted for brevity)', 'special');
                }
        }
        let tag = value[Symbol.toStringTag];
        if (!util_js_1.isString(tag)) {
            tag = '';
        }
        let base = '';
        let formatter = getEmptyFormatArray;
        let braces = (void 0);
        let noIterator = true;
        let i = 0;
        let extrasType = kObjectType;
        // Iterators and the rest are split to reduce checks.
        if (value[Symbol.iterator]) {
            noIterator = false;
            if (Array.isArray(value)) {
                keys = util_js_1.getOwnNonIndexProperties(value, ctx.showHidden);
                // Only set the constructor for non ordinary ("Array [...]") arrays.
                const prefix = getPrefix(constructor, tag, 'Array');
                braces = [`${prefix === 'Array ' ? '' : prefix}[`, ']'];
                if (value.length === 0 && keys.length === 0) {
                    return `${braces[0]}]`;
                }
                extrasType = kArrayExtrasType;
                formatter = formatArray;
            }
            else if (util_js_1.isSet(value)) {
                keys = getKeys(value, ctx.showHidden);
                const prefix = getPrefix(constructor, tag, 'Set');
                if (value.size === 0 && keys.length === 0) {
                    return `${prefix}{}`;
                }
                braces = [`${prefix}{`, '}'];
                formatter = formatSet;
            }
            else if (util_js_1.isMap(value)) {
                keys = getKeys(value, ctx.showHidden);
                const prefix = getPrefix(constructor, tag, 'Map');
                if (value.size === 0 && keys.length === 0) {
                    return `${prefix}{}`;
                }
                braces = [`${prefix}{`, '}'];
                formatter = formatMap;
            }
            else if (util_js_1.isTypedArray(value)) {
                keys = util_js_1.getOwnNonIndexProperties(value, ctx.showHidden);
                const prefix = constructor !== null
                    ? getPrefix(constructor, tag)
                    : getPrefix(constructor, tag, findTypedConstructor(value).name);
                braces = [`${prefix}[`, ']'];
                if (value.length === 0 && keys.length === 0 && !ctx.showHidden) {
                    return `${braces[0]}]`;
                }
                formatter = formatTypedArray;
                extrasType = kArrayExtrasType;
            }
            else if (util_js_1.isMapIterator(value)) {
                keys = getKeys(value, ctx.showHidden);
                braces = setIteratorBraces('Map', tag);
                formatter = formatIterator;
            }
            else if (util_js_1.isSetIterator(value)) {
                keys = getKeys(value, ctx.showHidden);
                braces = setIteratorBraces('Set', tag);
                formatter = formatIterator;
            }
            else {
                noIterator = true;
            }
        }
        if (noIterator) {
            keys = getKeys(value, ctx.showHidden);
            braces = ['{', '}'];
            if (constructor === 'Object') {
                if (util_js_1.isArgumentsObject(value)) {
                    braces[0] = '[Arguments] {';
                }
                else if (tag !== '') {
                    braces[0] = `${getPrefix(constructor, tag, 'Object')}{`;
                }
                if (keys.length === 0) {
                    return `${braces[0]}}`;
                }
            }
            else if (util_js_1.isFunction(value)) {
                const type = constructor || tag || 'Function';
                let name = `${type}`;
                if (value.name && util_js_1.isString(value.name)) {
                    name += `: ${value.name}`;
                }
                if (keys.length === 0) {
                    return ctx.stylize(`[${name}]`, 'special');
                }
                base = `[${name}]`;
            }
            else if (util_js_1.isRegExp(value)) {
                // Make RegExps say that they are RegExps
                base = util_js_1.RegExp_toString(constructor !== null ? value : new RegExp(value));
                const prefix = getPrefix(constructor, tag, 'RegExp');
                if (prefix !== 'RegExp ') {
                    base = `${prefix}${base}`;
                }
                if (keys.length === 0 || recurseTimes > ctx.depth && ctx.depth !== null) {
                    return ctx.stylize(base, 'regexp');
                }
            }
            else if (util_js_1.isDate(value)) {
                // Make dates with properties first say the date
                base = Number.isNaN(util_js_1.Date_getTime(value))
                    ? util_js_1.Date_toString(value)
                    : util_js_1.Date_toISOString(value);
                const prefix = getPrefix(constructor, tag, 'Date');
                if (prefix !== 'Date ') {
                    base = `${prefix}${base}`;
                }
                if (keys.length === 0) {
                    return ctx.stylize(base, 'date');
                }
            }
            else if (util_js_1.isError(value)) {
                // Make error with message first say the error.
                base = formatError(value);
                // Wrap the error in brackets in case it has no stack trace.
                const stackStart = base.indexOf('\n    at');
                if (stackStart === -1) {
                    base = `[${base}]`;
                }
                // The message and the stack have to be indented as well!
                if (ctx.indentationLvl !== 0) {
                    const indentation = ' '.repeat(ctx.indentationLvl);
                    base = formatError(value).replace(/\n/g, `\n${indentation}`);
                }
                if (keys.length === 0) {
                    return base;
                }
                if (ctx.compact === false && stackStart !== -1) {
                    braces[0] += `${base.slice(stackStart)}`;
                    base = `[${base.slice(0, stackStart)}]`;
                }
            }
            else if (util_js_1.isAnyArrayBuffer(value)) {
                // Fast path for ArrayBuffer and SharedArrayBuffer.
                // Can't do the same for DataView because it has a non-primitive
                // .buffer property that we need to recurse for.
                const arrayType = util_js_1.isArrayBuffer(value)
                    ? 'ArrayBuffer'
                    : 'SharedArrayBuffer';
                const prefix = getPrefix(constructor, tag, arrayType);
                if (typedArray === void 0) {
                    formatter = formatArrayBuffer;
                }
                else if (keys.length === 0) {
                    return `${prefix}{ byteLength: ${formatNumber(ctx.stylize, value.byteLength)} }`;
                }
                braces[0] = `${prefix}{`;
                keys.unshift('byteLength');
            }
            else if (util_js_1.isDataView(value)) {
                braces[0] = `${getPrefix(constructor, tag, 'DataView')}{`;
                // .buffer goes last, it's not a primitive like the others.
                keys.unshift('byteLength', 'byteOffset', 'buffer');
            }
            else if (util_js_1.isPromise(value)) {
                braces[0] = `${getPrefix(constructor, tag, 'Promise')}{`;
                formatter = formatPromise;
            }
            else if (util_js_1.isWeakSet(value)) {
                braces[0] = `${getPrefix(constructor, tag, 'WeakSet')}{`;
                formatter = ctx.showHidden ? formatWeakSet : formatWeakCollection;
            }
            else if (util_js_1.isWeakMap(value)) {
                braces[0] = `${getPrefix(constructor, tag, 'WeakMap')}{`;
                formatter = ctx.showHidden ? formatWeakMap : formatWeakCollection;
                // } else if (isModuleNamespaceObject(value)) {
                //   braces[0] = `[${tag}] {`;
                //   formatter = formatNamespaceObject;
            }
            else if (util_js_1.isBoxedPrimitive(value)) {
                let type;
                if (util_js_1.isNumberObject(value)) {
                    base = `[Number: ${getBoxedValue(util_js_1.Number_valueOf(value), ctx)}]`;
                    type = 'number';
                }
                else if (util_js_1.isStringObject(value)) {
                    base = `[String: ${getBoxedValue(util_js_1.String_valueOf(value), ctx)}]`;
                    type = 'string';
                    // For boxed Strings, we have to remove the 0-n indexed entries,
                    // since they just noisy up the output and are redundant
                    // Make boxed primitive Strings look like such
                    keys = keys.slice(value.length);
                }
                else if (util_js_1.isBooleanObject(value)) {
                    base = `[Boolean: ${getBoxedValue(util_js_1.Boolean_valueOf(value), ctx)}]`;
                    type = 'boolean';
                }
                else {
                    base = `[Symbol: ${getBoxedValue(util_js_1.Symbol_valueOf(value), ctx)}]`;
                    type = 'symbol';
                }
                if (keys.length === 0) {
                    return ctx.stylize(base, type);
                }
            }
            else {
                // The input prototype got manipulated. Special handle these. We have to
                // rebuild the information so we are able to display everything.
                if (constructor === null) {
                    const specialIterator = noPrototypeIterator(ctx, value, recurseTimes);
                    if (specialIterator) {
                        return specialIterator;
                    }
                }
                if (util_js_1.isMapIterator(value)) {
                    braces = setIteratorBraces('Map', tag);
                    formatter = formatIterator;
                }
                else if (util_js_1.isSetIterator(value)) {
                    braces = setIteratorBraces('Set', tag);
                    formatter = formatIterator;
                    // Handle other regular objects again.
                }
                else if (keys.length === 0) {
                    // if (isExternal(value)) {
                    //   return ctx.stylize('[External]', 'special');
                    // }
                    return `${getPrefix(constructor, tag, 'Object')}{}`;
                }
                else {
                    braces[0] = `${getPrefix(constructor, tag, 'Object')}{`;
                }
            }
        }
        if (recurseTimes > ctx.depth && ctx.depth !== null) {
            return ctx.stylize(`[${getCtxStyle(constructor, tag)}]`, 'special');
        }
        recurseTimes += 1;
        ctx.seen.push(value);
        ctx.currentDepth = recurseTimes;
        let output;
        const indentationLvl = ctx.indentationLvl;
        try {
            output = formatter(ctx, value, recurseTimes, keys, braces);
            let $key;
            const isNotNode = !(value instanceof test_context_js_1.PLATFORM.Node);
            for (i = 0; i < keys.length; i++) {
                $key = keys[i];
                if (
                // Aurelia-specific:
                // Don't deep inspect html nodes, they are huge, have many irrelevant properties and make the diff unreadable
                (isNotNode || $key === 'textContent' || $key === 'outerHTML')
                    // Aurelia-specific:
                    // By convention we use $$calls for the CallCollection tracker, never deep inspect that as it's never relevant to the assertion
                    && $key !== '$$calls') {
                    output.push(formatProperty(ctx, value, recurseTimes, keys[i], extrasType));
                }
            }
        }
        catch (err) {
            return handleMaxCallStackSize(ctx, err, constructor, tag, indentationLvl);
        }
        ctx.seen.pop();
        if (ctx.sorted) {
            const comparator = ctx.sorted === true ? undefined : ctx.sorted;
            if (extrasType === kObjectType) {
                output.sort(comparator);
            }
            else if (keys.length > 1) {
                const sorted = output.slice(output.length - keys.length).sort(comparator);
                output.splice(output.length - keys.length, keys.length, ...sorted);
            }
        }
        let combine = false;
        if (util_js_1.isNumber(ctx.compact)) {
            // Memorize the original output length. In case the the output is grouped,
            // prevent lining up the entries on a single line.
            const entries = output.length;
            // Group array elements together if the array contains at least six separate
            // entries.
            if (extrasType === kArrayExtrasType && output.length > 6) {
                output = groupArrayElements(ctx, output);
            }
            // `ctx.currentDepth` is set to the most inner depth of the currently
            // inspected object part while `recurseTimes` is the actual current depth
            // that is inspected.
            //
            // Example:
            //
            // const a = { first: [ 1, 2, 3 ], second: { inner: [ 1, 2, 3 ] } }
            //
            // The deepest depth of `a` is 2 (a.second.inner) and `a.first` has a max
            // depth of 1.
            //
            // Consolidate all entries of the local most inner depth up to
            // `ctx.compact`, as long as the properties are smaller than
            // `ctx.breakLength`.
            if (ctx.currentDepth - recurseTimes < ctx.compact
                && entries === output.length) {
                combine = true;
            }
        }
        const res = reduceToSingleString(ctx, output, base, braces, combine);
        const budget = ctx.budget[ctx.indentationLvl] || 0;
        const newLength = budget + res.length;
        ctx.budget[ctx.indentationLvl] = newLength;
        if (newLength > 2 ** 27) {
            ctx.stop = true;
        }
        return res;
    }
    exports.formatRaw = formatRaw;
    function formatValue(ctx, value, recurseTimes, typedArray) {
        if (typeof value !== 'object' && typeof value !== 'function') {
            return formatPrimitive(ctx.stylize, value, ctx);
        }
        if (value === null) {
            return ctx.stylize('null', 'null');
        }
        if (ctx.stop !== void 0) {
            const name = getConstructorName(value, ctx) || value[Symbol.toStringTag];
            return ctx.stylize(`[${name || 'Object'}]`, 'special');
        }
        if (ctx.customInspect) {
            const maybeCustom = value[exports.customInspectSymbol];
            if (util_js_1.isFunction(maybeCustom)
                && maybeCustom !== inspect
                && !(value.constructor && value.constructor.prototype === value)) {
                const depth = ctx.depth === null ? null : ctx.depth - recurseTimes;
                const ret = maybeCustom.call(value, depth, getUserOptions(ctx));
                if (ret !== value) {
                    if (!util_js_1.isString(ret)) {
                        return formatValue(ctx, ret, recurseTimes);
                    }
                    return ret.replace(/\n/g, `\n${' '.repeat(ctx.indentationLvl)}`);
                }
            }
        }
        if (ctx.seen.includes(value)) {
            return ctx.stylize('[Circular]', 'special');
        }
        return formatRaw(ctx, value, recurseTimes, typedArray);
    }
    exports.formatValue = formatValue;
    function inspect(value, opts = {}) {
        const ctx = getInspectContext(opts);
        return formatValue(ctx, value, 0);
    }
    exports.inspect = inspect;
    function inspectValue(val) {
        return inspect(val, {
            compact: false,
            customInspect: false,
            depth: 100,
            maxArrayLength: Infinity,
            showHidden: false,
            breakLength: Infinity,
            showProxy: false,
            sorted: true,
            getters: true,
        });
    }
    exports.inspectValue = inspectValue;
});
//# sourceMappingURL=inspect.js.map