import { DI, resolve, IEventAggregator, camelCase, toArray, registrableMetadataKey, Registration } from '../../../kernel/dist/native-modules/index.mjs';
import { BindingMode, State, ISignaler, BindingBehavior, mixinAstEvaluator, mixingBindingLimited, CustomElement, renderer, ValueConverter, AppTask } from '../../../runtime-html/dist/native-modules/index.mjs';
import { AttributePattern, AttrSyntax, BindingCommand } from '../../../template-compiler/dist/native-modules/index.mjs';
import { ValueConverterExpression, CustomExpression } from '../../../expression-parser/dist/native-modules/index.mjs';
import { nowrap, connectable, astEvaluate, astUnbind, AccessorType, astBind } from '../../../runtime/dist/native-modules/index.mjs';
import i18next from 'i18next';

const Signals = {
    I18N_EA_CHANNEL: 'i18n:locale:changed',
    I18N_SIGNAL: 'aurelia-translation-signal',
    RT_SIGNAL: 'aurelia-relativetime-signal'
};
/** @internal */
var ValueConverters;
(function (ValueConverters) {
    ValueConverters["translationValueConverterName"] = "t";
    ValueConverters["dateFormatValueConverterName"] = "df";
    ValueConverters["numberFormatValueConverterName"] = "nf";
    ValueConverters["relativeTimeValueConverterName"] = "rt";
})(ValueConverters || (ValueConverters = {}));
function createIntlFormatValueConverterExpression(name, binding) {
    const expression = binding.ast.expression;
    if (!(expression instanceof ValueConverterExpression)) {
        const vcExpression = new ValueConverterExpression(expression, name, binding.ast.args);
        binding.ast.expression = vcExpression;
    }
}
/** ExpressionType */
/** @internal */ const etInterpolation = 'Interpolation';
/** @internal */ const etIsProperty = 'IsProperty';
/** BindingMode */
/** @internal */ const bmToView = BindingMode.toView;
/** State */
/** @internal */ const stateActivating = State.activating;
/** @internal */ const behaviorTypeName = 'binding-behavior';
/** @internal */ const valueConverterTypeName = 'value-converter';

class DateFormatBindingBehavior {
    bind(_scope, binding) {
        createIntlFormatValueConverterExpression("df" /* ValueConverters.dateFormatValueConverterName */, binding);
    }
}
DateFormatBindingBehavior.$au = {
    type: behaviorTypeName,
    name: "df" /* ValueConverters.dateFormatValueConverterName */,
};

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

const I18nInitOptions = /*@__PURE__*/ DI.createInterface('I18nInitOptions');

const II18nextWrapper = /*@__PURE__*/ DI.createInterface('II18nextWrapper');
/**
 * A wrapper class over i18next to facilitate the easy testing and DI.
 */
class I18nextWrapper {
    constructor() {
        this.i18next = i18next;
    }
}

class I18nKeyEvaluationResult {
    constructor(keyExpr) {
        this.value = (void 0);
        const re = /\[([a-z\-, ]*)\]/ig;
        this.attributes = [];
        // check if a attribute was specified in the key
        const matches = re.exec(keyExpr);
        if (matches) {
            keyExpr = keyExpr.replace(matches[0], '');
            this.attributes = matches[1].split(',');
        }
        this.key = keyExpr;
    }
}
const I18N = /*@__PURE__*/ DI.createInterface('I18N');
/**
 * Translation service class.
 */
let I18nService = (() => {
    var _a;
    let _i18next_decorators;
    let _i18next_initializers = [];
    let _i18next_extraInitializers = [];
    return _a = class I18nService {
            constructor() {
                this.i18next = __runInitializers(this, _i18next_initializers, void 0);
                /**
                 * This is used for i18next initialization and awaited for before the bind phase.
                 * If need be (usually there is none), this can be awaited for explicitly in client code.
                 */
                this.initPromise = __runInitializers(this, _i18next_extraInitializers);
                this._localeSubscribers = new Set();
                this._signaler = resolve(ISignaler);
                this.ea = resolve(IEventAggregator);
                this.i18next = resolve(II18nextWrapper).i18next;
                this.initPromise = this._initializeI18next(resolve(I18nInitOptions));
            }
            evaluate(keyExpr, options) {
                const parts = keyExpr.split(';');
                const results = [];
                for (const part of parts) {
                    const result = new I18nKeyEvaluationResult(part);
                    const key = result.key;
                    const translation = this.tr(key, options);
                    if (this.options.skipTranslationOnMissingKey && translation === key) {
                        // TODO change this once the logging infra is there.
                        // eslint-disable-next-line no-console
                        console.warn(`[DEV:aurelia] Couldn't find translation for key: ${key}`);
                    }
                    else {
                        result.value = translation;
                        results.push(result);
                    }
                }
                return results;
            }
            tr(key, options) {
                return this.i18next.t(key, options);
            }
            getLocale() {
                return this.i18next.language;
            }
            async setLocale(newLocale) {
                const oldLocale = this.getLocale();
                const locales = { oldLocale, newLocale };
                await this.i18next.changeLanguage(newLocale);
                this.ea.publish(Signals.I18N_EA_CHANNEL, locales);
                this._localeSubscribers.forEach(sub => sub.handleLocaleChange(locales));
                this._signaler.dispatchSignal(Signals.I18N_SIGNAL);
            }
            createNumberFormat(options, locales) {
                // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
                return Intl.NumberFormat(locales || this.getLocale(), options);
            }
            nf(input, options, locales) {
                return this.createNumberFormat(options, locales).format(input);
            }
            createDateTimeFormat(options, locales) {
                // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
                return Intl.DateTimeFormat(locales || this.getLocale(), options);
            }
            df(input, options, locales) {
                return this.createDateTimeFormat(options, locales).format(input);
            }
            uf(numberLike, locale) {
                // Unfortunately the Intl specs does not specify a way to get the thousand and decimal separators for a given locale.
                // Only straightforward way would be to include the CLDR data and query for the separators, which certainly is a overkill.
                const comparer = this.nf(10000 / 3, undefined, locale);
                let thousandSeparator = comparer[1];
                const decimalSeparator = comparer[5];
                if (thousandSeparator === '.') {
                    thousandSeparator = '\\.';
                }
                // remove all thousand separators
                const result = numberLike.replace(new RegExp(thousandSeparator, 'g'), '')
                    // remove non-numeric signs except -> , .
                    .replace(/[^\d.,-]/g, '')
                    // replace original decimalSeparator with english one
                    .replace(decimalSeparator, '.');
                // return real number
                return Number(result);
            }
            createRelativeTimeFormat(options, locales) {
                // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
                return new Intl.RelativeTimeFormat(locales || this.getLocale(), options);
            }
            rt(input, options, locales) {
                let difference = input.getTime() - this.now();
                const epsilon = this.options.rtEpsilon * (difference > 0 ? 1 : 0);
                const formatter = this.createRelativeTimeFormat(options, locales);
                let value = difference / 31536000000 /* TimeSpan.Year */;
                if (Math.abs(value + epsilon) >= 1) {
                    return formatter.format(Math.round(value), 'year');
                }
                value = difference / 2592000000 /* TimeSpan.Month */;
                if (Math.abs(value + epsilon) >= 1) {
                    return formatter.format(Math.round(value), 'month');
                }
                value = difference / 604800000 /* TimeSpan.Week */;
                if (Math.abs(value + epsilon) >= 1) {
                    return formatter.format(Math.round(value), 'week');
                }
                value = difference / 86400000 /* TimeSpan.Day */;
                if (Math.abs(value + epsilon) >= 1) {
                    return formatter.format(Math.round(value), 'day');
                }
                value = difference / 3600000 /* TimeSpan.Hour */;
                if (Math.abs(value + epsilon) >= 1) {
                    return formatter.format(Math.round(value), 'hour');
                }
                value = difference / 60000 /* TimeSpan.Minute */;
                if (Math.abs(value + epsilon) >= 1) {
                    return formatter.format(Math.round(value), 'minute');
                }
                difference = Math.abs(difference) < 1000 /* TimeSpan.Second */ ? 1000 /* TimeSpan.Second */ : difference;
                value = difference / 1000 /* TimeSpan.Second */;
                return formatter.format(Math.round(value), 'second');
            }
            subscribeLocaleChange(subscriber) {
                this._localeSubscribers.add(subscriber);
            }
            unsubscribeLocaleChange(subscriber) {
                this._localeSubscribers.delete(subscriber);
            }
            now() {
                return new Date().getTime();
            }
            /** @internal */
            async _initializeI18next(options) {
                const defaultOptions = {
                    lng: 'en',
                    fallbackLng: ['en'],
                    debug: false,
                    plugins: [],
                    rtEpsilon: 0.01,
                    skipTranslationOnMissingKey: false,
                };
                this.options = { ...defaultOptions, ...options };
                for (const plugin of this.options.plugins) {
                    this.i18next.use(plugin);
                }
                await this.i18next.init(this.options);
            }
        },
        (() => {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            _i18next_decorators = [nowrap];
            __esDecorate(null, null, _i18next_decorators, { kind: "field", name: "i18next", static: false, private: false, access: { has: obj => "i18next" in obj, get: obj => obj.i18next, set: (obj, value) => { obj.i18next = value; } }, metadata: _metadata }, _i18next_initializers, _i18next_extraInitializers);
            if (_metadata) Object.defineProperty(_a, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        })(),
        _a;
})();

class DateFormatValueConverter {
    constructor() {
        this.signals = [Signals.I18N_SIGNAL];
        this.i18n = resolve(I18N);
    }
    toView(value, options, locale) {
        // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
        if ((!value && value !== 0) || (typeof value === 'string' && value.trim() === '')) {
            return value;
        }
        // convert '0' to 01/01/1970 or ISO string to Date and return the original value if invalid date is constructed
        if (typeof value === 'string') {
            const numValue = Number(value);
            const tempDate = new Date(Number.isInteger(numValue) ? numValue : value);
            if (isNaN(tempDate.getTime())) {
                return value;
            }
            value = tempDate;
        }
        return this.i18n.df(value, options, locale);
    }
}
DateFormatValueConverter.$au = {
    type: valueConverterTypeName,
    name: "df" /* ValueConverters.dateFormatValueConverterName */,
};

class NumberFormatBindingBehavior {
    bind(_scope, binding) {
        createIntlFormatValueConverterExpression("nf" /* ValueConverters.numberFormatValueConverterName */, binding);
    }
}
NumberFormatBindingBehavior.$au = {
    type: behaviorTypeName,
    name: "nf" /* ValueConverters.numberFormatValueConverterName */,
};

class NumberFormatValueConverter {
    constructor() {
        this.signals = [Signals.I18N_SIGNAL];
        this.i18n = resolve(I18N);
    }
    toView(value, options, locale) {
        if (typeof value !== 'number') {
            return value;
        }
        return this.i18n.nf(value, options, locale);
    }
}
NumberFormatValueConverter.$au = {
    type: valueConverterTypeName,
    name: "nf" /* ValueConverters.numberFormatValueConverterName */,
};

class RelativeTimeBindingBehavior {
    bind(_scope, binding) {
        createIntlFormatValueConverterExpression("rt" /* ValueConverters.relativeTimeValueConverterName */, binding);
    }
}
RelativeTimeBindingBehavior.$au = {
    type: behaviorTypeName,
    name: "rt" /* ValueConverters.relativeTimeValueConverterName */,
};

class RelativeTimeValueConverter {
    constructor() {
        this.signals = [Signals.I18N_SIGNAL, Signals.RT_SIGNAL];
        this.i18n = resolve(I18N);
    }
    toView(value, options, locale) {
        if (!(value instanceof Date)) {
            return value;
        }
        return this.i18n.rt(value, options, locale);
    }
}
RelativeTimeValueConverter.$au = {
    type: valueConverterTypeName,
    name: "rt" /* ValueConverters.relativeTimeValueConverterName */,
};

class TranslationBindingBehavior {
    bind(_scope, binding) {
        const expression = binding.ast.expression;
        if (!(expression instanceof ValueConverterExpression)) {
            const vcExpression = new ValueConverterExpression(expression, "t" /* ValueConverters.translationValueConverterName */, binding.ast.args);
            binding.ast.expression = vcExpression;
        }
    }
}
BindingBehavior.define("t" /* ValueConverters.translationValueConverterName */, TranslationBindingBehavior);

/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable prefer-template */
/** @internal */
const createMappedError = (code, ...details) => new Error(`AUR${String(code).padStart(4, '0')}: ${getMessageByCode(code, ...details)}`)
    ;

const errorsMap = {
    [99 /* ErrorNames.method_not_implemented */]: 'Method {{0}} not implemented',
    [4000 /* ErrorNames.i18n_translation_key_not_found */]: 'Translation key not found',
    [4001 /* ErrorNames.i18n_translation_parameter_existed */]: 'Translation parameter already existed',
    [4002 /* ErrorNames.i18n_translation_key_invalid */]: `Expected the i18n key to be a string, but got {{0}} of type {{1}}`,
};
const getMessageByCode = (name, ...details) => {
    let cooked = errorsMap[name];
    for (let i = 0; i < details.length; ++i) {
        const regex = new RegExp(`{{${i}(:.*)?}}`, 'g');
        let matches = regex.exec(cooked);
        while (matches != null) {
            const method = matches[1]?.slice(1);
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            let value = details[i];
            if (value != null) {
                switch (method) {
                    case 'join(!=)':
                        value = value.join('!=');
                        break;
                    case 'element':
                        value = value === '*' ? 'all elements' : `<${value} />`;
                        break;
                    default: {
                        // property access
                        if (method?.startsWith('.')) {
                            value = String(value[method.slice(1)]);
                        }
                        else {
                            value = String(value);
                        }
                    }
                }
            }
            cooked = cooked.slice(0, matches.index) + value + cooked.slice(regex.lastIndex);
            matches = regex.exec(cooked);
        }
    }
    return cooked;
};

const contentAttributes = ['textContent', 'innerHTML', 'prepend', 'append'];
const attributeAliases = new Map([['text', 'textContent'], ['html', 'innerHTML']]);
const forOpts = { optional: true };
const taskQueueOpts = {
    preempt: true,
};
class TranslationBinding {
    static create({ parser, observerLocator, context, controller, target, instruction, platform, isParameterContext, }) {
        const binding = this._getBinding({ observerLocator, context, controller, target, platform });
        const expr = typeof instruction.from === 'string'
            /* istanbul ignore next */
            ? parser.parse(instruction.from, etIsProperty)
            : instruction.from;
        if (isParameterContext) {
            binding.useParameter(expr);
        }
        else {
            const interpolation = expr instanceof CustomExpression ? parser.parse(expr.value, etInterpolation) : undefined;
            binding.ast = interpolation || expr;
        }
    }
    /** @internal */
    static _getBinding({ observerLocator, context, controller, target, platform, }) {
        let binding = controller.bindings && controller.bindings.find((b) => b instanceof TranslationBinding && b.target === target);
        if (!binding) {
            binding = new TranslationBinding(controller, context, observerLocator, platform, target);
            controller.addBinding(binding);
        }
        return binding;
    }
    constructor(controller, locator, observerLocator, platform, target) {
        this.isBound = false;
        /** @internal */
        this._contentAttributes = contentAttributes;
        /** @internal */
        this._task = null;
        this.parameter = null;
        // see Listener binding for explanation
        /** @internal */
        this.boundFn = false;
        this.strict = true;
        this.l = locator;
        this._controller = controller;
        this.target = target;
        this.i18n = locator.get(I18N);
        this._platform = platform;
        this._targetAccessors = new Set();
        this.oL = observerLocator;
        this._taskQueue = platform.domQueue;
    }
    bind(_scope) {
        if (this.isBound) {
            return;
        }
        const ast = this.ast;
        if (ast == null)
            throw createMappedError(4000 /* ErrorNames.i18n_translation_key_not_found */);
        this._scope = _scope;
        this.i18n.subscribeLocaleChange(this);
        this._keyExpression = astEvaluate(ast, _scope, this, this);
        this._ensureKeyExpression();
        this.parameter?.bind(_scope);
        this.updateTranslations();
        this.isBound = true;
    }
    unbind() {
        if (!this.isBound) {
            return;
        }
        this.i18n.unsubscribeLocaleChange(this);
        astUnbind(this.ast, this._scope, this);
        this.parameter?.unbind();
        this._targetAccessors.clear();
        if (this._task !== null) {
            this._task.cancel();
            this._task = null;
        }
        this._scope = (void 0);
        this.obs.clearAll();
        this.isBound = false;
    }
    handleChange(_newValue, _previousValue) {
        if (!this.isBound) {
            return;
        }
        this.obs.version++;
        this._keyExpression = astEvaluate(this.ast, this._scope, this, this);
        this.obs.clear();
        this._ensureKeyExpression();
        this.updateTranslations();
    }
    handleLocaleChange() {
        // todo:
        // no flag passed, so if a locale is updated during binding of a component
        // and the author wants to signal that locale change fromBind, then it's a bug
        this.updateTranslations();
    }
    useParameter(expr) {
        if (this.parameter != null) {
            throw createMappedError(4001 /* ErrorNames.i18n_translation_parameter_existed */);
        }
        this.parameter = new ParameterBinding(this, expr, () => this.updateTranslations());
    }
    updateTranslations() {
        const results = this.i18n.evaluate(this._keyExpression, this.parameter?.value);
        const content = Object.create(null);
        const accessorUpdateTasks = [];
        const task = this._task;
        this._targetAccessors.clear();
        for (const item of results) {
            const value = item.value;
            const attributes = this._preprocessAttributes(item.attributes);
            for (const attribute of attributes) {
                if (this._isContentAttribute(attribute)) {
                    content[attribute] = value;
                }
                else {
                    const controller = CustomElement.for(this.target, forOpts);
                    const accessor = controller?.viewModel
                        ? this.oL.getAccessor(controller.viewModel, camelCase(attribute))
                        : this.oL.getAccessor(this.target, attribute);
                    const shouldQueueUpdate = this._controller.state !== stateActivating && (accessor.type & AccessorType.Layout) > 0;
                    if (shouldQueueUpdate) {
                        accessorUpdateTasks.push(new AccessorUpdateTask(accessor, value, this.target, attribute));
                    }
                    else {
                        accessor.setValue(value, this.target, attribute);
                    }
                    this._targetAccessors.add(accessor);
                }
            }
        }
        let shouldQueueContent = false;
        if (Object.keys(content).length > 0) {
            shouldQueueContent = this._controller.state !== stateActivating;
            if (!shouldQueueContent) {
                this._updateContent(content);
            }
        }
        if (accessorUpdateTasks.length > 0 || shouldQueueContent) {
            this._task = this._taskQueue.queueTask(() => {
                this._task = null;
                for (const updateTask of accessorUpdateTasks) {
                    updateTask.run();
                }
                if (shouldQueueContent) {
                    this._updateContent(content);
                }
            }, taskQueueOpts);
        }
        task?.cancel();
    }
    /** @internal */
    _preprocessAttributes(attributes) {
        if (attributes.length === 0) {
            attributes = this.target.tagName === 'IMG' ? ['src'] : ['textContent'];
        }
        for (const [alias, attribute] of attributeAliases) {
            const aliasIndex = attributes.findIndex((attr) => attr === alias);
            if (aliasIndex > -1) {
                attributes.splice(aliasIndex, 1, attribute);
            }
        }
        return attributes;
    }
    /** @internal */
    _isContentAttribute(attribute) {
        return this._contentAttributes.includes(attribute);
    }
    /** @internal */
    _updateContent(content) {
        const children = toArray(this.target.childNodes);
        const fallBackContents = [];
        const marker = 'au-i18n';
        // extract the original content, not manipulated by au-i18n
        for (const child of children) {
            // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
            if (!Reflect.get(child, marker)) {
                fallBackContents.push(child);
            }
        }
        const template = this._prepareTemplate(content, marker, fallBackContents);
        // difficult to use the set property approach in this case, as most of the properties of Node is readonly
        // const observer = this.oL.getAccessor(this.target, '??');
        // observer.setValue(??);
        this.target.innerHTML = '';
        for (const child of toArray(template.content.childNodes)) {
            this.target.appendChild(child);
        }
    }
    /** @internal */
    _prepareTemplate(content, marker, fallBackContents) {
        const template = this._platform.document.createElement('template');
        this._addContentToTemplate(template, content.prepend, marker);
        // build content: prioritize [html], then textContent, and falls back to original content
        if (!this._addContentToTemplate(template, content.innerHTML ?? content.textContent, marker)) {
            for (const fallbackContent of fallBackContents) {
                template.content.append(fallbackContent);
            }
        }
        this._addContentToTemplate(template, content.append, marker);
        return template;
    }
    /** @internal */
    _addContentToTemplate(template, content, marker) {
        if (content !== void 0 && content !== null) {
            const parser = this._platform.document.createElement('div');
            parser.innerHTML = content;
            for (const child of toArray(parser.childNodes)) {
                Reflect.set(child, marker, true);
                template.content.append(child);
            }
            return true;
        }
        return false;
    }
    /** @internal */
    _ensureKeyExpression() {
        const expr = this._keyExpression ??= '';
        const exprType = typeof expr;
        if (exprType !== 'string') {
            throw createMappedError(4002 /* ErrorNames.i18n_translation_key_invalid */, expr, exprType);
        }
    }
}
connectable(TranslationBinding, null);
mixinAstEvaluator(TranslationBinding);
mixingBindingLimited(TranslationBinding, () => 'updateTranslations');
class AccessorUpdateTask {
    constructor(accessor, v, el, attr) {
        this.accessor = accessor;
        this.v = v;
        this.el = el;
        this.attr = attr;
    }
    run() {
        this.accessor.setValue(this.v, this.el, this.attr);
    }
}
class ParameterBinding {
    constructor(owner, ast, updater) {
        this.owner = owner;
        this.ast = ast;
        this.updater = updater;
        this.isBound = false;
        // see Listener binding for explanation
        /** @internal */
        this.boundFn = false;
        this.strict = true;
        this.oL = owner.oL;
        this.l = owner.l;
    }
    handleChange(_newValue, _previousValue) {
        // todo(test): add an integration/e2e for this
        //             setup: put this inside an if and switch on/off that if
        if (!this.isBound) {
            return;
        }
        this.obs.version++;
        this.value = astEvaluate(this.ast, this._scope, this, this);
        this.obs.clear();
        this.updater();
    }
    bind(_scope) {
        if (this.isBound) {
            return;
        }
        this._scope = _scope;
        astBind(this.ast, _scope, this);
        this.value = astEvaluate(this.ast, _scope, this, this);
        this.isBound = true;
    }
    unbind() {
        if (!this.isBound) {
            return;
        }
        astUnbind(this.ast, this._scope, this);
        this._scope = (void 0);
        this.obs.clearAll();
        this.isBound = false;
    }
}
(() => {
    connectable(ParameterBinding, null);
    mixinAstEvaluator(ParameterBinding);
})();

var _a;
const TranslationParametersInstructionType = 'tpt';
// `.bind` part is needed here only for vCurrent compliance
const attribute = 't-params.bind';
class TranslationParametersAttributePattern {
    [(_a = Symbol.metadata, attribute)](rawName, rawValue) {
        return new AttrSyntax(rawName, rawValue, '', attribute);
    }
}
TranslationParametersAttributePattern[_a] = {
    [registrableMetadataKey]: AttributePattern.create([{ pattern: attribute, symbols: '' }], TranslationParametersAttributePattern)
};
class TranslationParametersBindingInstruction {
    constructor(from, to) {
        this.from = from;
        this.to = to;
        this.type = TranslationParametersInstructionType;
        this.mode = bmToView;
    }
}
class TranslationParametersBindingCommand {
    constructor() {
        this.ignoreAttr = false;
    }
    build(info, exprParser, attrMapper) {
        const attr = info.attr;
        let target = attr.target;
        if (info.bindable == null) {
            target = attrMapper.map(info.node, target)
                // if the transformer doesn't know how to map it
                // use the default behavior, which is camel-casing
                ?? camelCase(target);
        }
        else {
            target = info.bindable.name;
        }
        return new TranslationParametersBindingInstruction(exprParser.parse(attr.rawValue, etIsProperty), target);
    }
}
TranslationParametersBindingCommand.$au = {
    type: 'binding-command',
    name: attribute,
};
const TranslationParametersBindingRenderer = /*@__PURE__*/ renderer(class TranslationParametersBindingRenderer {
    constructor() {
        this.target = TranslationParametersInstructionType;
    }
    render(renderingCtrl, target, instruction, platform, exprParser, observerLocator) {
        TranslationBinding.create({
            parser: exprParser,
            observerLocator,
            context: renderingCtrl.container,
            controller: renderingCtrl,
            target,
            instruction,
            isParameterContext: true,
            platform,
        });
    }
}, null);

const TranslationInstructionType = 'tt';
class TranslationBindingInstruction {
    constructor(from, to) {
        this.from = from;
        this.to = to;
        this.type = TranslationInstructionType;
        this.mode = bmToView;
    }
}
class TranslationBindingCommand {
    constructor() {
        this.ignoreAttr = false;
    }
    build(info, parser, attrMapper) {
        let target;
        if (info.bindable == null) {
            target = attrMapper.map(info.node, info.attr.target)
                // if the mapper doesn't know how to map it
                // use the default behavior, which is camel-casing
                ?? camelCase(info.attr.target);
        }
        else {
            target = info.bindable.name;
        }
        return new TranslationBindingInstruction(new CustomExpression(info.attr.rawValue), target);
    }
}
const TranslationBindingRenderer = /*@__PURE__*/ renderer(class TranslationBindingRenderer {
    constructor() {
        this.target = TranslationInstructionType;
    }
    render(renderingCtrl, target, instruction, platform, exprParser, observerLocator) {
        TranslationBinding.create({
            parser: exprParser,
            observerLocator,
            context: renderingCtrl.container,
            controller: renderingCtrl,
            target,
            instruction,
            platform,
        });
    }
}, null);
const TranslationBindInstructionType = 'tbt';
class TranslationBindBindingInstruction {
    constructor(from, to) {
        this.from = from;
        this.to = to;
        this.type = TranslationBindInstructionType;
        this.mode = bmToView;
    }
}
class TranslationBindBindingCommand {
    constructor() {
        this.ignoreAttr = false;
    }
    build(info, exprParser, attrMapper) {
        let target;
        if (info.bindable == null) {
            target = attrMapper.map(info.node, info.attr.target)
                // if the mapper doesn't know how to map it
                // use the default behavior, which is camel-casing
                ?? camelCase(info.attr.target);
        }
        else {
            target = info.bindable.name;
        }
        return new TranslationBindBindingInstruction(exprParser.parse(info.attr.rawValue, etIsProperty), target);
    }
}
const TranslationBindBindingRenderer = /*@__PURE__*/ renderer(class TranslationBindBindingRenderer {
    constructor() {
        this.target = TranslationBindInstructionType;
    }
    render(renderingCtrl, target, instruction, platform, exprParser, observerLocator) {
        TranslationBinding.create({
            parser: exprParser,
            observerLocator,
            context: renderingCtrl.container,
            controller: renderingCtrl,
            target,
            instruction,
            platform
        });
    }
}, null);

class TranslationValueConverter {
    constructor() {
        this.signals = [Signals.I18N_SIGNAL];
        this.i18n = resolve(I18N);
    }
    toView(value, options) {
        return this.i18n.tr(value, options);
    }
}
ValueConverter.define("t" /* ValueConverters.translationValueConverterName */, TranslationValueConverter);

const translation = [
    TranslationValueConverter,
    TranslationBindingBehavior,
];
function coreComponents(options) {
    const configuredAliases = options.translationAttributeAliases;
    const aliases = Array.isArray(configuredAliases) ? configuredAliases : ['t'];
    const patterns = [];
    const bindPatterns = [];
    const commandAliases = [];
    const bindCommandAliases = [];
    class TranslationAttributePattern {
    }
    class TranslationBindAttributePattern {
    }
    for (const alias of aliases) {
        patterns.push({ pattern: alias, symbols: '' });
        TranslationAttributePattern.prototype[alias] = function (rawName, rawValue, _parts) {
            return new AttrSyntax(rawName, rawValue, '', alias);
        };
        const bindAlias = `${alias}.bind`;
        bindPatterns.push({ pattern: bindAlias, symbols: '.' });
        TranslationBindAttributePattern.prototype[bindAlias] = function (rawName, rawValue, parts) {
            return new AttrSyntax(rawName, rawValue, parts[1], bindAlias);
        };
        if (alias !== 't') {
            commandAliases.push(alias);
            bindCommandAliases.push(bindAlias);
        }
    }
    const renderers = [
        AttributePattern.create(patterns, TranslationAttributePattern),
        BindingCommand.define({ name: 't', aliases: commandAliases }, TranslationBindingCommand),
        TranslationBindingRenderer,
        AttributePattern.create(bindPatterns, TranslationBindAttributePattern),
        BindingCommand.define({ name: 't.bind', aliases: bindCommandAliases }, TranslationBindBindingCommand),
        TranslationBindBindingRenderer,
        TranslationParametersAttributePattern,
        TranslationParametersBindingCommand,
        TranslationParametersBindingRenderer
    ];
    return {
        register(container) {
            const wrapperRegistration = options.i18nextWrapper != null && typeof options.i18nextWrapper === 'object'
                ? Registration.instance(II18nextWrapper, options.i18nextWrapper)
                : Registration.singleton(II18nextWrapper, I18nextWrapper);
            return container.register(Registration.callback(I18nInitOptions, () => options.initOptions), AppTask.activating(I18N, i18n => i18n.initPromise), wrapperRegistration, Registration.singleton(I18N, I18nService), ...renderers, ...translation);
        }
    };
}
const dateFormat = [
    DateFormatValueConverter,
    DateFormatBindingBehavior,
];
const numberFormat = [
    NumberFormatValueConverter,
    NumberFormatBindingBehavior,
];
const relativeTimeFormat = [
    RelativeTimeValueConverter,
    RelativeTimeBindingBehavior,
];
function createI18nConfiguration(optionsProvider) {
    return {
        optionsProvider,
        register(container) {
            const options = { initOptions: Object.create(null) };
            optionsProvider(options);
            return container.register(coreComponents(options), ...dateFormat, ...numberFormat, ...relativeTimeFormat);
        },
        customize(cb) {
            return createI18nConfiguration(cb || optionsProvider);
        },
    };
}
const I18nConfiguration = /*@__PURE__*/ createI18nConfiguration(() => { });

export { DateFormatBindingBehavior, DateFormatValueConverter, I18N, I18nConfiguration, I18nInitOptions, I18nKeyEvaluationResult, I18nService, II18nextWrapper, NumberFormatBindingBehavior, NumberFormatValueConverter, RelativeTimeBindingBehavior, RelativeTimeValueConverter, Signals, TranslationBindBindingCommand, TranslationBindBindingInstruction, TranslationBindBindingRenderer, TranslationBindInstructionType, TranslationBinding, TranslationBindingBehavior, TranslationBindingCommand, TranslationBindingInstruction, TranslationBindingRenderer, TranslationInstructionType, TranslationParametersAttributePattern, TranslationParametersBindingCommand, TranslationParametersBindingInstruction, TranslationParametersBindingRenderer, TranslationParametersInstructionType, TranslationValueConverter };
//# sourceMappingURL=index.dev.mjs.map
