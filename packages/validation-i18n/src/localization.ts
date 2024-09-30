import { I18N, Signals } from '@aurelia/i18n';
import { DI, EventAggregator, IContainer, IDisposable, IEventAggregator, Key, resolve } from '@aurelia/kernel';
import { Interpolation, PrimitiveLiteralExpression } from '@aurelia/expression-parser';
import { IPlatform } from '@aurelia/runtime-html';
import { IValidationRule, ValidationMessageProvider, ValidationRuleAliasMessage } from '@aurelia/validation';
import { IValidationController, ValidationController, ValidationControllerFactory, ValidationHtmlCustomizationOptions } from '@aurelia/validation-html';

const I18N_VALIDATION_EA_CHANNEL = 'i18n:locale:changed:validation';

export interface ValidationI18nCustomizationOptions extends ValidationHtmlCustomizationOptions {
  DefaultNamespace?: string;
  DefaultKeyPrefix?: string;
}

export type I18nKeyConfiguration = Pick<ValidationI18nCustomizationOptions, 'DefaultNamespace' | 'DefaultKeyPrefix'>;
export const I18nKeyConfiguration = /*@__PURE__*/DI.createInterface<I18nKeyConfiguration>('I18nKeyConfiguration');

export class LocalizedValidationController extends ValidationController {
  private readonly localeChangeSubscription: IDisposable;
  public constructor(
    ea: EventAggregator = resolve(IEventAggregator),
    platform: IPlatform = resolve(IPlatform),
  ) {
    super();
    this.localeChangeSubscription = ea.subscribe(
      I18N_VALIDATION_EA_CHANNEL,
      () => { platform.domQueue.queueTask(async () => { await this.revalidateErrors(); }); }
    );
  }
}

export class LocalizedValidationControllerFactory extends ValidationControllerFactory {
  public construct(container: IContainer, _dynamicDependencies?: Key[] | undefined): IValidationController {
    return container.invoke(LocalizedValidationController, _dynamicDependencies);
  }
}

const explicitMessageKey: unique symbol = Symbol.for('au:validation:explicit-message-key');
export class LocalizedValidationMessageProvider extends ValidationMessageProvider {
  private readonly keyPrefix?: string;

  private readonly i18n: I18N = resolve(I18N);
  public constructor(
    keyConfiguration: I18nKeyConfiguration = resolve(I18nKeyConfiguration),
    ea: EventAggregator = resolve(IEventAggregator),
  ) {
    super(undefined, []);

    const namespace = keyConfiguration.DefaultNamespace;
    const prefix = keyConfiguration.DefaultKeyPrefix;
    if (namespace !== void 0 || prefix !== void 0) {
      this.keyPrefix = namespace !== void 0 ? `${namespace}:` : '';
      this.keyPrefix = prefix !== void 0 ? `${this.keyPrefix}${prefix}.` : this.keyPrefix;
    }

    // as this is registered singleton, disposing the subscription does not make much sense.
    ea.subscribe(
      Signals.I18N_EA_CHANNEL,
      () => {
        this.registeredMessages = new WeakMap();
        ea.publish(I18N_VALIDATION_EA_CHANNEL);
      });
  }

  public getMessage(rule: IValidationRule): PrimitiveLiteralExpression | Interpolation {
    const messageKey = rule.messageKey;
    const lookup = this.registeredMessages.get(rule);
    if (lookup != null) {
      const parsedMessage = lookup.get(explicitMessageKey) ?? lookup.get(messageKey);
      if (parsedMessage !== void 0) { return parsedMessage; }
    }

    let key: string | undefined = messageKey;
    const i18nKey = key != null ? this.getKey(key) : [];
    const i18n = this.i18n;
    if (i18n.i18next.exists(i18nKey)) return this.setMessage(rule, i18n.tr(i18nKey));

    const validationMessages = ValidationRuleAliasMessage.getDefaultMessages(rule);
    const messageCount = validationMessages.length;
    if (messageCount === 1 && messageKey === void 0) {
      key = validationMessages[0].defaultMessage;
    } else {
      key = validationMessages.find(m => m.name === messageKey)?.defaultMessage;
    }
    key ??= messageKey;

    return this.setMessage(rule, i18n.tr(this.getKey(key)));
  }

  public getDisplayName(propertyName: string | number | undefined, displayName?: string | null | (() => string)): string | undefined {
    if (displayName !== null && displayName !== undefined) {
      return (displayName instanceof Function) ? displayName() : displayName;
    }

    if (propertyName === void 0) { return; }
    return this.i18n.tr(this.getKey(propertyName as string));
  }

  private getKey(key: string) {
    const keyPrefix = this.keyPrefix;
    return keyPrefix !== void 0 ? `${keyPrefix}${key}` : key;
  }
}
