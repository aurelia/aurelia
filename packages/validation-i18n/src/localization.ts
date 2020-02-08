import { I18N, Signals } from "@aurelia/i18n";
import { IValidationController, IValidator, ValidationControllerFactory, ValidationController, ValidationMessageProvider, ICustomMessage, BaseValidationRule } from "@aurelia/validation";
import { IExpressionParser, IScheduler, PrimitiveLiteralExpression, IInterpolationExpression } from '@aurelia/runtime';
import { EventAggregator, IEventAggregator, ILogger, IDisposable } from '@aurelia/kernel';
import { ValidationCustomizationOptions } from '@aurelia/validation/dist/validation-customization-options';

const I18N_VALIDATION_EA_CHANNEL = 'i18n:locale:changed:validation';

export type ValidationI18nCustomizationOptions = Pick<ValidationCustomizationOptions, "MessageProviderType" | "ValidationControllerFactoryType">;

export class LocalizedValidationController extends ValidationController {
  private readonly localeChangeSubscription: IDisposable;
  public constructor(
    @IEventAggregator ea: EventAggregator,
    @IValidator validator: IValidator,
    @IExpressionParser parser: IExpressionParser,
    @IScheduler scheduler: IScheduler,
  ) {
    super(validator, parser, scheduler);
    this.localeChangeSubscription = ea.subscribe(I18N_VALIDATION_EA_CHANNEL, async () => { await this.revalidateErrors(); });
  }
  // TODO have dispose
}

export class LocalizedValidationControllerFactory extends ValidationControllerFactory {
  public create(validator?: IValidator): IValidationController {
    const container = this.container;
    return new LocalizedValidationController(
      container.get(IEventAggregator),
      validator ?? container.get<IValidator>(IValidator),
      container.get(IExpressionParser),
      container.get(IScheduler)
    );
  }
}

export class LocalizedValidationMessageProvider extends ValidationMessageProvider {
  public constructor(
    @I18N private readonly i18n: I18N,
    @IEventAggregator ea: EventAggregator,
    @IExpressionParser parser: IExpressionParser,
    @ILogger logger: ILogger,
  ) {
    super(parser, logger, []);
    // as this is registered singleton, disposing the subscription does not make much sense.
    ea.subscribe(
      Signals.I18N_EA_CHANNEL,
      () => {
        this.registeredMessages = new WeakMap<BaseValidationRule, IInterpolationExpression | PrimitiveLiteralExpression>();
        ea.publish(I18N_VALIDATION_EA_CHANNEL);
      });
  }

  public getMessage(rule: BaseValidationRule): IInterpolationExpression | PrimitiveLiteralExpression {
    const parsedMessage = this.registeredMessages.get(rule);
    if (parsedMessage !== void 0) { return parsedMessage; }

    return this.setMessage(rule, this.i18n.tr(rule.messageKey));
  }

  public getDisplayName(propertyName: string | number | undefined, displayName?: string | null | (() => string)): string | undefined {
    if (displayName !== null && displayName !== undefined) {
      return (displayName instanceof Function) ? displayName() : displayName as string;
    }

    if (propertyName === void 0) { return; }
    return this.i18n.tr(propertyName as string);
  }
}
