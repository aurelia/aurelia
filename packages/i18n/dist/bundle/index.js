import { DI, IEventAggregator, toArray, Registration } from '@aurelia/kernel';
import { ValueConverterExpression as ValueConverterExpression$1, bindingBehavior as bindingBehavior$1, CustomExpression, Interpolation, CustomElement, connectable, AttrSyntax, attributePattern, BindingMode, getTarget, bindingCommand, renderer, IExpressionParser, IObserverLocator, IPlatform, valueConverter as valueConverter$1, AppTask, AttributePattern, BindingCommand } from '@aurelia/runtime-html';
import { ValueConverterExpression, bindingBehavior, ISignaler, valueConverter } from '@aurelia/runtime';
import i18next from 'i18next';

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

var Signals;
(function (Signals) {
    Signals["I18N_EA_CHANNEL"] = "i18n:locale:changed";
    Signals["I18N_SIGNAL"] = "aurelia-translation-signal";
    Signals["RT_SIGNAL"] = "aurelia-relativetime-signal";
})(Signals || (Signals = {}));
var ValueConverters;
(function (ValueConverters) {
    ValueConverters["translationValueConverterName"] = "t";
    ValueConverters["dateFormatValueConverterName"] = "df";
    ValueConverters["numberFormatValueConverterName"] = "nf";
    ValueConverters["relativeTimeValueConverterName"] = "rt";
})(ValueConverters || (ValueConverters = {}));
function createIntlFormatValueConverterExpression(name, binding) {
    const expression = binding.sourceExpression.expression;
    if (!(expression instanceof ValueConverterExpression)) {
        const vcExpression = new ValueConverterExpression(expression, name, binding.sourceExpression.args);
        binding.sourceExpression.expression = vcExpression;
    }
}

let DateFormatBindingBehavior = class DateFormatBindingBehavior {
    bind(flags, _scope, _hostScope, binding) {
        createIntlFormatValueConverterExpression("df" /* dateFormatValueConverterName */, binding);
    }
};
DateFormatBindingBehavior = __decorate([
    bindingBehavior("df" /* dateFormatValueConverterName */)
], DateFormatBindingBehavior);

const I18nInitOptions = DI.createInterface('I18nInitOptions');

const I18nWrapper = DI.createInterface('I18nextWrapper');
/**
 * A wrapper class over i18next to facilitate the easy testing and DI.
 */
class I18nextWrapper {
    constructor() {
        this.i18next = i18next;
    }
}

var TimeSpan;
(function (TimeSpan) {
    TimeSpan[TimeSpan["Second"] = 1000] = "Second";
    TimeSpan[TimeSpan["Minute"] = 60000] = "Minute";
    TimeSpan[TimeSpan["Hour"] = 3600000] = "Hour";
    TimeSpan[TimeSpan["Day"] = 86400000] = "Day";
    TimeSpan[TimeSpan["Week"] = 604800000] = "Week";
    TimeSpan[TimeSpan["Month"] = 2592000000] = "Month";
    TimeSpan[TimeSpan["Year"] = 31536000000] = "Year";
})(TimeSpan || (TimeSpan = {}));
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
const I18N = DI.createInterface('I18N');
/**
 * Translation service class.
 */
let I18nService = class I18nService {
    constructor(i18nextWrapper, options, ea, signaler) {
        this.ea = ea;
        this.signaler = signaler;
        this.localeSubscribers = new Set();
        this.i18next = i18nextWrapper.i18next;
        this.initPromise = this.initializeI18next(options);
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
                console.warn(`Couldn't find translation for key: ${key}`);
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
        this.ea.publish("i18n:locale:changed" /* I18N_EA_CHANNEL */, locales);
        this.localeSubscribers.forEach(sub => sub.handleLocaleChange(locales));
        this.signaler.dispatchSignal("aurelia-translation-signal" /* I18N_SIGNAL */);
    }
    createNumberFormat(options, locales) {
        return Intl.NumberFormat(locales || this.getLocale(), options);
    }
    nf(input, options, locales) {
        return this.createNumberFormat(options, locales).format(input);
    }
    createDateTimeFormat(options, locales) {
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
        return new Intl.RelativeTimeFormat(locales || this.getLocale(), options);
    }
    rt(input, options, locales) {
        let difference = input.getTime() - this.now();
        const epsilon = this.options.rtEpsilon * (difference > 0 ? 1 : 0);
        const formatter = this.createRelativeTimeFormat(options, locales);
        let value = difference / 31536000000 /* Year */;
        if (Math.abs(value + epsilon) >= 1) {
            return formatter.format(Math.round(value), 'year');
        }
        value = difference / 2592000000 /* Month */;
        if (Math.abs(value + epsilon) >= 1) {
            return formatter.format(Math.round(value), 'month');
        }
        value = difference / 604800000 /* Week */;
        if (Math.abs(value + epsilon) >= 1) {
            return formatter.format(Math.round(value), 'week');
        }
        value = difference / 86400000 /* Day */;
        if (Math.abs(value + epsilon) >= 1) {
            return formatter.format(Math.round(value), 'day');
        }
        value = difference / 3600000 /* Hour */;
        if (Math.abs(value + epsilon) >= 1) {
            return formatter.format(Math.round(value), 'hour');
        }
        value = difference / 60000 /* Minute */;
        if (Math.abs(value + epsilon) >= 1) {
            return formatter.format(Math.round(value), 'minute');
        }
        difference = Math.abs(difference) < 1000 /* Second */ ? 1000 /* Second */ : difference;
        value = difference / 1000 /* Second */;
        return formatter.format(Math.round(value), 'second');
    }
    subscribeLocaleChange(subscriber) {
        this.localeSubscribers.add(subscriber);
    }
    now() {
        return new Date().getTime();
    }
    async initializeI18next(options) {
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
};
I18nService = __decorate([
    __param(0, I18nWrapper),
    __param(1, I18nInitOptions),
    __param(2, IEventAggregator),
    __param(3, ISignaler)
], I18nService);

let DateFormatValueConverter = class DateFormatValueConverter {
    constructor(i18n) {
        this.i18n = i18n;
        this.signals = ["aurelia-translation-signal" /* I18N_SIGNAL */];
    }
    toView(value, options, locale) {
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
};
DateFormatValueConverter = __decorate([
    valueConverter("df" /* dateFormatValueConverterName */),
    __param(0, I18N)
], DateFormatValueConverter);

let NumberFormatBindingBehavior = class NumberFormatBindingBehavior {
    bind(flags, _scope, _hostScope, binding) {
        createIntlFormatValueConverterExpression("nf" /* numberFormatValueConverterName */, binding);
    }
};
NumberFormatBindingBehavior = __decorate([
    bindingBehavior("nf" /* numberFormatValueConverterName */)
], NumberFormatBindingBehavior);

let NumberFormatValueConverter = class NumberFormatValueConverter {
    constructor(i18n) {
        this.i18n = i18n;
        this.signals = ["aurelia-translation-signal" /* I18N_SIGNAL */];
    }
    toView(value, options, locale) {
        if (typeof value !== 'number') {
            return value;
        }
        return this.i18n.nf(value, options, locale);
    }
};
NumberFormatValueConverter = __decorate([
    valueConverter("nf" /* numberFormatValueConverterName */),
    __param(0, I18N)
], NumberFormatValueConverter);

let RelativeTimeBindingBehavior = class RelativeTimeBindingBehavior {
    bind(flags, _scope, _hostScope, binding) {
        createIntlFormatValueConverterExpression("rt" /* relativeTimeValueConverterName */, binding);
    }
};
RelativeTimeBindingBehavior = __decorate([
    bindingBehavior("rt" /* relativeTimeValueConverterName */)
], RelativeTimeBindingBehavior);

let RelativeTimeValueConverter = class RelativeTimeValueConverter {
    constructor(i18n) {
        this.i18n = i18n;
        this.signals = ["aurelia-translation-signal" /* I18N_SIGNAL */, "aurelia-relativetime-signal" /* RT_SIGNAL */];
    }
    toView(value, options, locale) {
        if (!(value instanceof Date)) {
            return value;
        }
        return this.i18n.rt(value, options, locale);
    }
};
RelativeTimeValueConverter = __decorate([
    valueConverter("rt" /* relativeTimeValueConverterName */),
    __param(0, I18N)
], RelativeTimeValueConverter);

let TranslationBindingBehavior = class TranslationBindingBehavior {
    bind(flags, _scope, _hostScope, binding) {
        const expression = binding.sourceExpression.expression;
        if (!(expression instanceof ValueConverterExpression$1)) {
            const vcExpression = new ValueConverterExpression$1(expression, "t" /* translationValueConverterName */, binding.sourceExpression.args);
            binding.sourceExpression.expression = vcExpression;
        }
    }
};
TranslationBindingBehavior = __decorate([
    bindingBehavior$1("t" /* translationValueConverterName */)
], TranslationBindingBehavior);

var TranslationBinding_1;
const contentAttributes = ['textContent', 'innerHTML', 'prepend', 'append'];
const attributeAliases = new Map([['text', 'textContent'], ['html', 'innerHTML']]);
const forOpts = { optional: true };
const taskQueueOpts = {
    reusable: false,
    preempt: true,
};
let TranslationBinding = TranslationBinding_1 = class TranslationBinding {
    constructor(target, observerLocator, locator, platform) {
        this.observerLocator = observerLocator;
        this.locator = locator;
        this.interceptor = this;
        this.isBound = false;
        this.contentAttributes = contentAttributes;
        this.hostScope = null;
        this.task = null;
        this.parameter = null;
        this.target = target;
        this.i18n = this.locator.get(I18N);
        this.platform = platform;
        this.targetAccessors = new Set();
        this.i18n.subscribeLocaleChange(this);
    }
    static create({ parser, observerLocator, context, controller, target, instruction, platform, isParameterContext, }) {
        const binding = this.getBinding({ observerLocator, context, controller, target, platform });
        const expr = typeof instruction.from === 'string'
            ? parser.parse(instruction.from, 53 /* BindCommand */)
            : instruction.from;
        if (isParameterContext) {
            binding.useParameter(expr);
        }
        else {
            const interpolation = expr instanceof CustomExpression ? parser.parse(expr.value, 2048 /* Interpolation */) : undefined;
            binding.expr = interpolation || expr;
        }
    }
    static getBinding({ observerLocator, context, controller, target, platform, }) {
        let binding = controller.bindings && controller.bindings.find((b) => b instanceof TranslationBinding_1 && b.target === target);
        if (!binding) {
            binding = new TranslationBinding_1(target, observerLocator, context, platform);
            controller.addBinding(binding);
        }
        return binding;
    }
    $bind(flags, scope, hostScope) {
        var _a;
        if (!this.expr) {
            throw new Error('key expression is missing');
        }
        this.scope = scope;
        this.hostScope = hostScope;
        this.isInterpolation = this.expr instanceof Interpolation;
        this.keyExpression = this.expr.evaluate(flags, scope, hostScope, this.locator, this);
        this.ensureKeyExpression();
        (_a = this.parameter) === null || _a === void 0 ? void 0 : _a.$bind(flags, scope, hostScope);
        this.updateTranslations(flags);
        this.isBound = true;
    }
    $unbind(flags) {
        var _a;
        if (!this.isBound) {
            return;
        }
        if (this.expr.hasUnbind) {
            this.expr.unbind(flags, this.scope, this.hostScope, this);
        }
        (_a = this.parameter) === null || _a === void 0 ? void 0 : _a.$unbind(flags);
        this.targetAccessors.clear();
        if (this.task !== null) {
            this.task.cancel();
            this.task = null;
        }
        this.scope = (void 0);
        this.obs.clear(true);
    }
    handleChange(newValue, _previousValue, flags) {
        this.obs.version++;
        this.keyExpression = this.isInterpolation
            ? this.expr.evaluate(flags, this.scope, this.hostScope, this.locator, this)
            : newValue;
        this.obs.clear(false);
        this.ensureKeyExpression();
        this.updateTranslations(flags);
    }
    handleLocaleChange() {
        // todo:
        // no flag passed, so if a locale is updated during binding of a component
        // and the author wants to signal that locale change fromBind, then it's a bug
        this.updateTranslations(0 /* none */);
    }
    useParameter(expr) {
        if (this.parameter != null) {
            throw new Error('This translation parameter has already been specified.');
        }
        this.parameter = new ParameterBinding(this, expr, (flags) => this.updateTranslations(flags));
    }
    updateTranslations(flags) {
        var _a;
        const results = this.i18n.evaluate(this.keyExpression, (_a = this.parameter) === null || _a === void 0 ? void 0 : _a.value);
        const content = Object.create(null);
        const accessorUpdateTasks = [];
        const task = this.task;
        this.targetAccessors.clear();
        for (const item of results) {
            const value = item.value;
            const attributes = this.preprocessAttributes(item.attributes);
            for (const attribute of attributes) {
                if (this.isContentAttribute(attribute)) {
                    content[attribute] = value;
                }
                else {
                    const controller = CustomElement.for(this.target, forOpts);
                    const accessor = controller && controller.viewModel
                        ? this.observerLocator.getAccessor(controller.viewModel, attribute)
                        : this.observerLocator.getAccessor(this.target, attribute);
                    const shouldQueueUpdate = (flags & 2 /* fromBind */) === 0 && (accessor.type & 4 /* Layout */) > 0;
                    if (shouldQueueUpdate) {
                        accessorUpdateTasks.push(new AccessorUpdateTask(accessor, value, flags, this.target, attribute));
                    }
                    else {
                        accessor.setValue(value, flags, this.target, attribute);
                    }
                    this.targetAccessors.add(accessor);
                }
            }
        }
        let shouldQueueContent = false;
        if (Object.keys(content).length > 0) {
            shouldQueueContent = (flags & 2 /* fromBind */) === 0;
            if (!shouldQueueContent) {
                this.updateContent(content, flags);
            }
        }
        if (accessorUpdateTasks.length > 0 || shouldQueueContent) {
            this.task = this.platform.domWriteQueue.queueTask(() => {
                this.task = null;
                for (const updateTask of accessorUpdateTasks) {
                    updateTask.run();
                }
                if (shouldQueueContent) {
                    this.updateContent(content, flags);
                }
            }, taskQueueOpts);
        }
        task === null || task === void 0 ? void 0 : task.cancel();
    }
    preprocessAttributes(attributes) {
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
    isContentAttribute(attribute) {
        return this.contentAttributes.includes(attribute);
    }
    updateContent(content, flags) {
        const children = toArray(this.target.childNodes);
        const fallBackContents = [];
        const marker = 'au-i18n';
        // extract the original content, not manipulated by au-i18n
        for (const child of children) {
            if (!Reflect.get(child, marker)) {
                fallBackContents.push(child);
            }
        }
        const template = this.prepareTemplate(content, marker, fallBackContents);
        // difficult to use the set property approach in this case, as most of the properties of Node is readonly
        // const observer = this.observerLocator.getAccessor(LifecycleFlags.none, this.target, '??');
        // observer.setValue(??, flags);
        this.target.innerHTML = '';
        for (const child of toArray(template.content.childNodes)) {
            this.target.appendChild(child);
        }
    }
    prepareTemplate(content, marker, fallBackContents) {
        var _a;
        const template = this.platform.document.createElement('template');
        this.addContentToTemplate(template, content.prepend, marker);
        // build content: prioritize [html], then textContent, and falls back to original content
        if (!this.addContentToTemplate(template, (_a = content.innerHTML) !== null && _a !== void 0 ? _a : content.textContent, marker)) {
            for (const fallbackContent of fallBackContents) {
                template.content.append(fallbackContent);
            }
        }
        this.addContentToTemplate(template, content.append, marker);
        return template;
    }
    addContentToTemplate(template, content, marker) {
        if (content !== void 0 && content !== null) {
            const parser = this.platform.document.createElement('div');
            parser.innerHTML = content;
            for (const child of toArray(parser.childNodes)) {
                Reflect.set(child, marker, true);
                template.content.append(child);
            }
            return true;
        }
        return false;
    }
    ensureKeyExpression() {
        var _a;
        const expr = (_a = this.keyExpression) !== null && _a !== void 0 ? _a : (this.keyExpression = '');
        const exprType = typeof expr;
        if (exprType !== 'string') {
            throw new Error(`Expected the i18n key to be a string, but got ${expr} of type ${exprType}`); // TODO use reporter/logger
        }
    }
};
TranslationBinding = TranslationBinding_1 = __decorate([
    connectable()
], TranslationBinding);
class AccessorUpdateTask {
    constructor(accessor, v, f, el, attr) {
        this.accessor = accessor;
        this.v = v;
        this.f = f;
        this.el = el;
        this.attr = attr;
    }
    run() {
        this.accessor.setValue(this.v, this.f, this.el, this.attr);
    }
}
let ParameterBinding = class ParameterBinding {
    constructor(owner, expr, updater) {
        this.owner = owner;
        this.expr = expr;
        this.updater = updater;
        this.interceptor = this;
        this.isBound = false;
        this.hostScope = null;
        this.observerLocator = owner.observerLocator;
        this.locator = owner.locator;
    }
    handleChange(newValue, _previousValue, flags) {
        this.obs.version++;
        this.value = this.expr.evaluate(flags, this.scope, this.hostScope, this.locator, this);
        this.obs.clear(false);
        this.updater(flags);
    }
    $bind(flags, scope, hostScope) {
        if (this.isBound) {
            return;
        }
        this.scope = scope;
        this.hostScope = hostScope;
        if (this.expr.hasBind) {
            this.expr.bind(flags, scope, hostScope, this);
        }
        this.value = this.expr.evaluate(flags, scope, hostScope, this.locator, this);
        this.isBound = true;
    }
    $unbind(flags) {
        if (!this.isBound) {
            return;
        }
        if (this.expr.hasUnbind) {
            this.expr.unbind(flags, this.scope, this.hostScope, this);
        }
        this.scope = (void 0);
        this.obs.clear(true);
    }
};
ParameterBinding = __decorate([
    connectable()
], ParameterBinding);

const TranslationParametersInstructionType = 'tpt';
// `.bind` part is needed here only for vCurrent compliance
const attribute = 't-params.bind';
let TranslationParametersAttributePattern = class TranslationParametersAttributePattern {
    [attribute](rawName, rawValue, parts) {
        return new AttrSyntax(rawName, rawValue, '', attribute);
    }
};
TranslationParametersAttributePattern = __decorate([
    attributePattern({ pattern: attribute, symbols: '' })
], TranslationParametersAttributePattern);
class TranslationParametersBindingInstruction {
    constructor(from, to) {
        this.from = from;
        this.to = to;
        this.type = TranslationParametersInstructionType;
        this.mode = BindingMode.toView;
    }
}
let TranslationParametersBindingCommand = class TranslationParametersBindingCommand {
    constructor() {
        this.bindingType = 53 /* BindCommand */;
    }
    compile(binding) {
        return new TranslationParametersBindingInstruction(binding.expression, getTarget(binding, false));
    }
};
TranslationParametersBindingCommand = __decorate([
    bindingCommand(attribute)
], TranslationParametersBindingCommand);
let TranslationParametersBindingRenderer = class TranslationParametersBindingRenderer {
    constructor(parser, observerLocator, platform) {
        this.parser = parser;
        this.observerLocator = observerLocator;
        this.platform = platform;
    }
    render(flags, context, controller, target, instruction) {
        TranslationBinding.create({ parser: this.parser, observerLocator: this.observerLocator, context, controller: controller, target, instruction, isParameterContext: true, platform: this.platform });
    }
};
TranslationParametersBindingRenderer = __decorate([
    renderer(TranslationParametersInstructionType),
    __param(0, IExpressionParser),
    __param(1, IObserverLocator),
    __param(2, IPlatform)
], TranslationParametersBindingRenderer);

const TranslationInstructionType = 'tt';
class TranslationAttributePattern {
    static registerAlias(alias) {
        this.prototype[alias] = function (rawName, rawValue, parts) {
            return new AttrSyntax(rawName, rawValue, '', alias);
        };
    }
}
class TranslationBindingInstruction {
    constructor(from, to) {
        this.from = from;
        this.to = to;
        this.type = TranslationInstructionType;
        this.mode = BindingMode.toView;
    }
}
class TranslationBindingCommand {
    constructor() {
        this.bindingType = 284 /* CustomCommand */;
    }
    compile(binding) {
        return new TranslationBindingInstruction(binding.expression, getTarget(binding, false));
    }
}
let TranslationBindingRenderer = class TranslationBindingRenderer {
    constructor(parser, observerLocator, platform) {
        this.parser = parser;
        this.observerLocator = observerLocator;
        this.platform = platform;
    }
    render(flags, context, controller, target, instruction) {
        TranslationBinding.create({
            parser: this.parser,
            observerLocator: this.observerLocator,
            context,
            controller,
            target,
            instruction,
            platform: this.platform,
        });
    }
};
TranslationBindingRenderer = __decorate([
    renderer(TranslationInstructionType),
    __param(0, IExpressionParser),
    __param(1, IObserverLocator),
    __param(2, IPlatform)
], TranslationBindingRenderer);
const TranslationBindInstructionType = 'tbt';
class TranslationBindAttributePattern {
    static registerAlias(alias) {
        const bindPattern = `${alias}.bind`;
        this.prototype[bindPattern] = function (rawName, rawValue, parts) {
            return new AttrSyntax(rawName, rawValue, parts[1], bindPattern);
        };
    }
}
class TranslationBindBindingInstruction {
    constructor(from, to) {
        this.from = from;
        this.to = to;
        this.type = TranslationBindInstructionType;
        this.mode = BindingMode.toView;
    }
}
class TranslationBindBindingCommand {
    constructor() {
        this.bindingType = 53 /* BindCommand */;
    }
    compile(binding) {
        return new TranslationBindBindingInstruction(binding.expression, getTarget(binding, false));
    }
}
let TranslationBindBindingRenderer = class TranslationBindBindingRenderer {
    constructor(parser, observerLocator, platform) {
        this.parser = parser;
        this.observerLocator = observerLocator;
        this.platform = platform;
    }
    render(flags, context, controller, target, instruction) {
        TranslationBinding.create({
            parser: this.parser,
            observerLocator: this.observerLocator,
            context,
            controller,
            target,
            instruction,
            platform: this.platform
        });
    }
};
TranslationBindBindingRenderer = __decorate([
    renderer(TranslationBindInstructionType),
    __param(0, IExpressionParser),
    __param(1, IObserverLocator),
    __param(2, IPlatform)
], TranslationBindBindingRenderer);

let TranslationValueConverter = class TranslationValueConverter {
    constructor(i18n) {
        this.i18n = i18n;
        this.signals = ["aurelia-translation-signal" /* I18N_SIGNAL */];
    }
    toView(value, options) {
        return this.i18n.tr(value, options);
    }
};
TranslationValueConverter = __decorate([
    valueConverter$1("t" /* translationValueConverterName */),
    __param(0, I18N)
], TranslationValueConverter);

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
    for (const alias of aliases) {
        const bindAlias = `${alias}.bind`;
        patterns.push({ pattern: alias, symbols: '' });
        TranslationAttributePattern.registerAlias(alias);
        bindPatterns.push({ pattern: bindAlias, symbols: '.' });
        TranslationBindAttributePattern.registerAlias(alias);
        if (alias !== 't') {
            commandAliases.push(alias);
            bindCommandAliases.push(bindAlias);
        }
    }
    const renderers = [
        AttributePattern.define(patterns, TranslationAttributePattern),
        BindingCommand.define({ name: 't', aliases: commandAliases }, TranslationBindingCommand),
        TranslationBindingRenderer,
        AttributePattern.define(bindPatterns, TranslationBindAttributePattern),
        BindingCommand.define({ name: 't.bind', aliases: bindCommandAliases }, TranslationBindBindingCommand),
        TranslationBindBindingRenderer,
        TranslationParametersAttributePattern,
        TranslationParametersBindingCommand,
        TranslationParametersBindingRenderer
    ];
    return {
        register(container) {
            return container.register(Registration.callback(I18nInitOptions, () => options.initOptions), AppTask.beforeActivate(I18N, i18n => i18n.initPromise), Registration.singleton(I18nWrapper, I18nextWrapper), Registration.singleton(I18N, I18nService), ...renderers, ...translation);
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
const I18nConfiguration = createI18nConfiguration(() => { });

export { DateFormatBindingBehavior, DateFormatValueConverter, I18N, I18nConfiguration, I18nInitOptions, I18nKeyEvaluationResult, I18nService, NumberFormatBindingBehavior, NumberFormatValueConverter, RelativeTimeBindingBehavior, RelativeTimeValueConverter, Signals, TranslationAttributePattern, TranslationBindAttributePattern, TranslationBindBindingCommand, TranslationBindBindingInstruction, TranslationBindBindingRenderer, TranslationBindInstructionType, TranslationBinding, TranslationBindingBehavior, TranslationBindingCommand, TranslationBindingInstruction, TranslationBindingRenderer, TranslationInstructionType, TranslationParametersAttributePattern, TranslationParametersBindingCommand, TranslationParametersBindingInstruction, TranslationParametersBindingRenderer, TranslationParametersInstructionType, TranslationValueConverter };
//# sourceMappingURL=index.js.map
