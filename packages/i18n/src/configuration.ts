import { IContainer, Registration } from '@aurelia/kernel';
import { StartTask } from '@aurelia/runtime';
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

const renderers = [
  TranslationAttributePattern,
  TranslationBindingCommand,
  TranslationBindingRenderer,
  TranslationBindAttributePattern,
  TranslationBindBindingCommand,
  TranslationBindBindingRenderer,
  TranslationParametersAttributePattern,
  TranslationParametersBindingCommand,
  TranslationParametersBindingRenderer
];

const translation = [
  TranslationValueConverter,
  TranslationBindingBehavior,
];

function coreComponents(options: I18nConfigurationOptions) {
  if (Array.isArray(options.translationAttributeAliases)) {
    TranslationAttributePattern.aliases = options.translationAttributeAliases;
    TranslationBindingCommand.aliases = options.translationAttributeAliases;
    TranslationBindAttributePattern.aliases = options.translationAttributeAliases;
    TranslationBindBindingCommand.aliases = options.translationAttributeAliases;
  }
  return {
    register(container: IContainer) {
      return container.register(
        Registration.callback(I18nInitOptions, () => options.initOptions),
        StartTask.with(I18N).beforeBind().call(i18n => i18n.task),
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
