"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var TranslationBinding_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.TranslationBinding = void 0;
const kernel_1 = require("@aurelia/kernel");
const runtime_html_1 = require("@aurelia/runtime-html");
const i18n_js_1 = require("../i18n.js");
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
        this.i18n = this.locator.get(i18n_js_1.I18N);
        this.platform = platform;
        this.targetAccessors = new Set();
        this.i18n.subscribeLocaleChange(this);
        runtime_html_1.connectable.assignIdTo(this);
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
            const interpolation = expr instanceof runtime_html_1.CustomExpression ? parser.parse(expr.value, 2048 /* Interpolation */) : undefined;
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
        this.isInterpolation = this.expr instanceof runtime_html_1.Interpolation;
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
                    const controller = runtime_html_1.CustomElement.for(this.target, forOpts);
                    const accessor = controller && controller.viewModel
                        ? this.observerLocator.getAccessor(controller.viewModel, attribute)
                        : this.observerLocator.getAccessor(this.target, attribute);
                    const shouldQueueUpdate = (flags & 8 /* fromBind */) === 0 && (accessor.type & 4 /* Layout */) > 0;
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
            shouldQueueContent = (flags & 8 /* fromBind */) === 0;
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
        const children = kernel_1.toArray(this.target.childNodes);
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
        for (const child of kernel_1.toArray(template.content.childNodes)) {
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
            for (const child of kernel_1.toArray(parser.childNodes)) {
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
    runtime_html_1.connectable()
], TranslationBinding);
exports.TranslationBinding = TranslationBinding;
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
        runtime_html_1.connectable.assignIdTo(this);
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
    runtime_html_1.connectable()
], ParameterBinding);
//# sourceMappingURL=translation-binding.js.map