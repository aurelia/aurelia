import { IContainer, Registration } from '@aurelia/kernel';
import { AppTask, AttributePatternDefinition, BindingCommand, AttributePattern } from '@aurelia/runtime-html';
import { DateFormatBindingBehavior } from './df/date-format-binding-behavior';
import { DateFormatValueConverter } from './df/date-format-value-converter';
import { I18N, I18nService } from './i18n';
import { I18nConfigurationOptions, I18nInitOptions } from './i18n-configuration-options';
import { I18nextWrapper, I18nWrapper } from './i18next-wrapper';
import { NumberFormatBindingBehavior } from './nf/number-format-binding-behavior';
import { NumberFormatValueConverter } from './nf/number-format-value-converter';
import { RelativeTimeBindingBehavior } from './rt/relative-time-binding-behavior';
import { RelativeTimeValueConverter } from './rt/relative-time-value-converter';
import { TranslationBindingBehavior } from './t/translation-binding-behavior';
import {
  TranslationParametersAttributePattern,
  TranslationParametersBindingCommand,
  TranslationParametersBindingRenderer
} from './t/translation-parameters-renderer';
import {
  TranslationAttributePattern,
  TranslationBindAttributePattern,
  TranslationBindBindingCommand,
  TranslationBindBindingRenderer,
  TranslationBindingCommand,
  TranslationBindingRenderer
} from './t/translation-renderer';
import { TranslationValueConverter } from './t/translation-value-converter';

export type I18NConfigOptionsProvider = (options: I18nConfigurationOptions) => void;

const translation = [
  TranslationValueConverter,
  TranslationBindingBehavior,
];

function coreComponents(options: I18nConfigurationOptions) {
  const configuredAliases = options.translationAttributeAliases;
  const aliases = Array.isArray(configuredAliases) ? configuredAliases : ['t'];

  const patterns: AttributePatternDefinition[] = [];
  const bindPatterns: AttributePatternDefinition[] = [];
  const commandAliases: string[] = [];
  const bindCommandAliases: string[] = [];
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
    BindingCommand.define({name:'t', aliases: commandAliases}, TranslationBindingCommand),
    TranslationBindingRenderer,
    AttributePattern.define(bindPatterns, TranslationBindAttributePattern),
    BindingCommand.define({name:'t.bind', aliases: bindCommandAliases}, TranslationBindBindingCommand),
    TranslationBindBindingRenderer,
    TranslationParametersAttributePattern,
    TranslationParametersBindingCommand,
    TranslationParametersBindingRenderer
  ];

  return {
    register(container: IContainer) {
      return container.register(
        Registration.callback(I18nInitOptions, () => options.initOptions),
        AppTask.beforeActivate(I18N, i18n => i18n.initPromise),
        Registration.singleton(I18nWrapper, I18nextWrapper),
        Registration.singleton(I18N, I18nService),

        ...renderers,
        ...translation);
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

function createI18nConfiguration(optionsProvider: I18NConfigOptionsProvider) {
  return {
    optionsProvider,
    register(container: IContainer) {
      const options: I18nConfigurationOptions = { initOptions: Object.create(null) };
      optionsProvider(options);

      return container.register(
        coreComponents(options),
        ...dateFormat,
        ...numberFormat,
        ...relativeTimeFormat
      );
    },
    customize(cb?: I18NConfigOptionsProvider) {
      return createI18nConfiguration(cb || optionsProvider);
    },
  };
}

export const I18nConfiguration = createI18nConfiguration(() => { /* noop */ });
