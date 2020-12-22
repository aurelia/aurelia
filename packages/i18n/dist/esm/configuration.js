import { Registration } from '@aurelia/kernel';
import { AppTask, BindingCommand, AttributePattern } from '@aurelia/runtime-html';
import { DateFormatBindingBehavior } from './df/date-format-binding-behavior.js';
import { DateFormatValueConverter } from './df/date-format-value-converter.js';
import { I18N, I18nService } from './i18n.js';
import { I18nInitOptions } from './i18n-configuration-options.js';
import { I18nextWrapper, I18nWrapper } from './i18next-wrapper.js';
import { NumberFormatBindingBehavior } from './nf/number-format-binding-behavior.js';
import { NumberFormatValueConverter } from './nf/number-format-value-converter.js';
import { RelativeTimeBindingBehavior } from './rt/relative-time-binding-behavior.js';
import { RelativeTimeValueConverter } from './rt/relative-time-value-converter.js';
import { TranslationBindingBehavior } from './t/translation-binding-behavior.js';
import { TranslationParametersAttributePattern, TranslationParametersBindingCommand, TranslationParametersBindingRenderer } from './t/translation-parameters-renderer.js';
import { TranslationAttributePattern, TranslationBindAttributePattern, TranslationBindBindingCommand, TranslationBindBindingRenderer, TranslationBindingCommand, TranslationBindingRenderer } from './t/translation-renderer.js';
import { TranslationValueConverter } from './t/translation-value-converter.js';
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
            return container.register(Registration.callback(I18nInitOptions, () => options.initOptions), AppTask.with(I18N).beforeActivate().call(i18n => i18n.initPromise), Registration.singleton(I18nWrapper, I18nextWrapper), Registration.singleton(I18N, I18nService), ...renderers, ...translation);
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
export const I18nConfiguration = createI18nConfiguration(() => { });
//# sourceMappingURL=configuration.js.map