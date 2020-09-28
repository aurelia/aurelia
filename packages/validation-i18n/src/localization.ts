import { I18N, Signals } from '@aurelia/i18n';
import { DI, EventAggregator, IContainer, IDisposable, IEventAggregator, ILogger, Key } from '@aurelia/kernel';
import { IExpressionParser, IInterpolationExpression, IScheduler, PrimitiveLiteralExpression } from '@aurelia/runtime';
import { IValidationRule, IValidator, ValidationMessageProvider } from '@aurelia/validation';
import { IValidationController, ValidationController, ValidationControllerFactory, ValidationHtmlCustomizationOptions } from '@aurelia/validation-html';

const I18N_VALIDATION_EA_CHANNEL = 'i18n:locale:changed:validation';

export interface ValidationI18nCustomizationOptions extends ValidationHtmlCustomizationOptions {
  DefaultNamespace?: string;
  DefaultKeyPrefix?: string;
}

export type I18nKeyConfiguration = Pick<ValidationI18nCustomizationOptions, 'DefaultNamespace' | 'DefaultKeyPrefix'>;
export const I18nKeyConfiguration = DI.createInterface<I18nKeyConfiguration>('I18nKeyConfiguration').noDefault();

export class LocalizedValidationController extends ValidationController {
  private readonly localeChangeSubscription: IDisposable;
  public constructor(
    @IEventAggregator ea: EventAggregator,
    @IValidator validator: IValidator,
    @IExpressionParser parser: IExpressionParser,
    @IScheduler scheduler: IScheduler,
  ) {
    super(validator, parser, scheduler);
    this.localeChangeSubscription = ea.subscribe(
      I18N_VALIDATION_EA_CHANNEL,
      () => { scheduler.getPostRenderTaskQueue().queueTask(async () => { await this.revalidateErrors(); }); }
    );
  }
}

export class LocalizedValidationControllerFactory extends ValidationControllerFactory {
  public construct(container: IContainer, _dynamicDependencies?: Key[] | undefined): IValidationController {
    return _dynamicDependencies !== void 0
      ? Reflect.construct(LocalizedValidationController, _dynamicDependencies)
      : new LocalizedValidationController(
        container.get(IEventAggregator),
        container.get<IValidator>(IValidator),
        container.get(IExpressionParser),
        container.get(IScheduler)
      );
  }
}

export class LocalizedValidationMessageProvider extends ValidationMessageProvider {
  private readonly keyPrefix?: string;

  public constructor(
    @I18nKeyConfiguration keyConfiguration: I18nKeyConfiguration,
    @I18N private readonly i18n: I18N,
    @IEventAggregator ea: EventAggregator,
    @IExpressionParser parser: IExpressionParser,
    @ILogger logger: ILogger,
  ) {
    super(parser, logger, []);

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
        this.registeredMessages = new WeakMap<IValidationRule, IInterpolationExpression | PrimitiveLiteralExpression>();
        ea.publish(I18N_VALIDATION_EA_CHANNEL);
      });
  }

  public getMessage(rule: IValidationRule): IInterpolationExpression | PrimitiveLiteralExpression {
    const parsedMessage = this.registeredMessages.get(rule);
    if (parsedMessage !== void 0) { return parsedMessage; }

    return this.setMessage(rule, this.i18n.tr(this.getKey(rule.messageKey)));
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
