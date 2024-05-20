import { IContainer, Registration } from '@aurelia/kernel';
import { AppTask } from '@aurelia/runtime-html';
import { AttributePatternDefinition, BindingCommand, AttributePattern, AttrSyntax } from '@aurelia/template-compiler';
import { DateFormatBindingBehavior } from './df/date-format-binding-behavior';
import { DateFormatValueConverter } from './df/date-format-value-converter';
import { I18N, I18nService } from './i18n';
import { I18nConfigurationOptions, I18nInitOptions } from './i18n-configuration-options';
import { I18nextWrapper, II18nextWrapper } from './i18next-wrapper';
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
  class TranslationAttributePattern {
    [key: string]: ((rawName: string, rawValue: string, parts: readonly string[]) => AttrSyntax);
  }
  class TranslationBindAttributePattern {
    [key: string]: ((rawName: string, rawValue: string, parts: readonly string[]) => AttrSyntax);
  }
  for (const alias of aliases) {

    patterns.push({ pattern: alias, symbols: '' });
    TranslationAttributePattern.prototype[alias] = function (rawName: string, rawValue: string, _parts: readonly string[]): AttrSyntax {
      return new AttrSyntax(rawName, rawValue, '', alias);
    };

    const bindAlias = `${alias}.bind`;
    bindPatterns.push({ pattern: bindAlias, symbols: '.' });
    TranslationBindAttributePattern.prototype[bindAlias] = function (rawName: string, rawValue: string, parts: readonly string[]): AttrSyntax {
      return new AttrSyntax(rawName, rawValue, parts[1], bindAlias);
    };

    if (alias !== 't') {
      commandAliases.push(alias);
      bindCommandAliases.push(bindAlias);
    }
  }
  const renderers = [
    AttributePattern.create(patterns, TranslationAttributePattern),
    BindingCommand.define({name:'t', aliases: commandAliases}, TranslationBindingCommand),
    TranslationBindingRenderer,
    AttributePattern.create(bindPatterns, TranslationBindAttributePattern),
    BindingCommand.define({name:'t.bind', aliases: bindCommandAliases}, TranslationBindBindingCommand),
    TranslationBindBindingRenderer,
    TranslationParametersAttributePattern,
    TranslationParametersBindingCommand,
    TranslationParametersBindingRenderer
  ];

  return {
    register(container: IContainer) {
      const wrapperRegistration = options.i18nextWrapper != null && typeof options.i18nextWrapper === 'object'
        ? Registration.instance(II18nextWrapper, options.i18nextWrapper)
        : Registration.singleton(II18nextWrapper, I18nextWrapper);
      return container.register(
        Registration.callback(I18nInitOptions, () => options.initOptions),
        AppTask.activating(I18N, i18n => i18n.initPromise),
        wrapperRegistration,
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

export const I18nConfiguration = /*@__PURE__*/ createI18nConfiguration(() => { /* noop */ });
