"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.I18nConfiguration = void 0;
const kernel_1 = require("@aurelia/kernel");
const runtime_html_1 = require("@aurelia/runtime-html");
const date_format_binding_behavior_js_1 = require("./df/date-format-binding-behavior.js");
const date_format_value_converter_js_1 = require("./df/date-format-value-converter.js");
const i18n_js_1 = require("./i18n.js");
const i18n_configuration_options_js_1 = require("./i18n-configuration-options.js");
const i18next_wrapper_js_1 = require("./i18next-wrapper.js");
const number_format_binding_behavior_js_1 = require("./nf/number-format-binding-behavior.js");
const number_format_value_converter_js_1 = require("./nf/number-format-value-converter.js");
const relative_time_binding_behavior_js_1 = require("./rt/relative-time-binding-behavior.js");
const relative_time_value_converter_js_1 = require("./rt/relative-time-value-converter.js");
const translation_binding_behavior_js_1 = require("./t/translation-binding-behavior.js");
const translation_parameters_renderer_js_1 = require("./t/translation-parameters-renderer.js");
const translation_renderer_js_1 = require("./t/translation-renderer.js");
const translation_value_converter_js_1 = require("./t/translation-value-converter.js");
const translation = [
    translation_value_converter_js_1.TranslationValueConverter,
    translation_binding_behavior_js_1.TranslationBindingBehavior,
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
        translation_renderer_js_1.TranslationAttributePattern.registerAlias(alias);
        bindPatterns.push({ pattern: bindAlias, symbols: '.' });
        translation_renderer_js_1.TranslationBindAttributePattern.registerAlias(alias);
        if (alias !== 't') {
            commandAliases.push(alias);
            bindCommandAliases.push(bindAlias);
        }
    }
    const renderers = [
        runtime_html_1.AttributePattern.define(patterns, translation_renderer_js_1.TranslationAttributePattern),
        runtime_html_1.BindingCommand.define({ name: 't', aliases: commandAliases }, translation_renderer_js_1.TranslationBindingCommand),
        translation_renderer_js_1.TranslationBindingRenderer,
        runtime_html_1.AttributePattern.define(bindPatterns, translation_renderer_js_1.TranslationBindAttributePattern),
        runtime_html_1.BindingCommand.define({ name: 't.bind', aliases: bindCommandAliases }, translation_renderer_js_1.TranslationBindBindingCommand),
        translation_renderer_js_1.TranslationBindBindingRenderer,
        translation_parameters_renderer_js_1.TranslationParametersAttributePattern,
        translation_parameters_renderer_js_1.TranslationParametersBindingCommand,
        translation_parameters_renderer_js_1.TranslationParametersBindingRenderer
    ];
    return {
        register(container) {
            return container.register(kernel_1.Registration.callback(i18n_configuration_options_js_1.I18nInitOptions, () => options.initOptions), runtime_html_1.AppTask.with(i18n_js_1.I18N).beforeActivate().call(i18n => i18n.initPromise), kernel_1.Registration.singleton(i18next_wrapper_js_1.I18nWrapper, i18next_wrapper_js_1.I18nextWrapper), kernel_1.Registration.singleton(i18n_js_1.I18N, i18n_js_1.I18nService), ...renderers, ...translation);
        }
    };
}
const dateFormat = [
    date_format_value_converter_js_1.DateFormatValueConverter,
    date_format_binding_behavior_js_1.DateFormatBindingBehavior,
];
const numberFormat = [
    number_format_value_converter_js_1.NumberFormatValueConverter,
    number_format_binding_behavior_js_1.NumberFormatBindingBehavior,
];
const relativeTimeFormat = [
    relative_time_value_converter_js_1.RelativeTimeValueConverter,
    relative_time_binding_behavior_js_1.RelativeTimeBindingBehavior,
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
exports.I18nConfiguration = createI18nConfiguration(() => { });
//# sourceMappingURL=configuration.js.map