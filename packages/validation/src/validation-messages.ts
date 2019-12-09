import { DI, ILogger } from '@aurelia/kernel';
import { BindingType, IExpressionParser, IInterpolationExpression, PrimitiveLiteralExpression, Interpolation, AccessScopeExpression, AccessThisExpression } from '@aurelia/runtime';

export interface ValidationMessages {
  [key: string]: string;
}

const contextualProperties: Readonly<Set<string>> = new Set([
  "displayName",
  "propertyName",
  "value",
  "object",
  "config",
  "getDisplayName"
]);
/**
 * Dictionary of validation messages. [messageKey]: messageExpression
 */
export const validationMessages: ValidationMessages = {
  /**
   * The default validation message. Used with rules that have no standard message.
   */
  default: `\${$displayName} is invalid.`,
  required: `\${$displayName} is required.`,
  matches: `\${$displayName} is not correctly formatted.`,
  email: `\${$displayName} is not a valid email.`,
  minLength: `\${$displayName} must be at least \${$config.length} character\${$config.length === 1 ? '' : 's'}.`,
  maxLength: `\${$displayName} cannot be longer than \${$config.length} character\${$config.length === 1 ? '' : 's'}.`,
  minItems: `\${$displayName} must contain at least \${$config.count} item\${$config.count === 1 ? '' : 's'}.`,
  maxItems: `\${$displayName} cannot contain more than \${$config.count} item\${$config.count === 1 ? '' : 's'}.`,
  min: `\${$displayName} must be at least \${$config.constraint}.`,
  max: `\${$displayName} must be at most \${$config.constraint}.`,
  range: `\${$displayName} must be between or equal to \${$config.min} and \${$config.max}.`,
  between: `\${$displayName} must be between but not equal to \${$config.min} and \${$config.max}.`,
  equals: `\${$displayName} must be \${$config.expectedValue}.`,
};

export interface IValidationMessageProvider {
  getMessageByKey(key: string): IInterpolationExpression | PrimitiveLiteralExpression;
  parseMessage(message: string): IInterpolationExpression | PrimitiveLiteralExpression;
  getDisplayName(propertyName: string | number, displayName?: string | null | (() => string)): string;
}

export const IValidationMessageProvider = DI.createInterface<IValidationMessageProvider>("IValidationMessageProvider").noDefault();

/**
 * Retrieves validation messages and property display names.
 */
export class ValidationMessageProvider implements IValidationMessageProvider {

  private logger: ILogger;
  public constructor(
    @IExpressionParser public parser: IExpressionParser,
    @ILogger logger: ILogger,
  ) {
    this.logger = logger.scopeTo(ValidationMessageProvider.name);
  }

  /**
   * Returns a message binding expression that corresponds to the key.
   */
  public getMessageByKey(key: string): IInterpolationExpression | PrimitiveLiteralExpression {
    let message: string;
    if (key in validationMessages) {
      message = validationMessages[key];
    } else {
      message = validationMessages['default'];
    }
    return this.parseMessage(message);
  }

  public parseMessage(message: string): IInterpolationExpression | PrimitiveLiteralExpression {
    const parsed = this.parser.parse(message, BindingType.Interpolation);
    if (parsed instanceof Interpolation) {
      for (const expr of parsed.expressions) {
        const name = (expr as AccessScopeExpression).name;
        if (contextualProperties.has(name)) {
          this.logger.warn(`Did you mean to use "$${name}" instead of "${name}" in this validation message template: "${message}"?`)
        }
        if (expr instanceof AccessThisExpression || (expr as AccessScopeExpression).ancestor > 0) {
          throw new Error('$parent is not permitted in validation message expressions.'); // use reporter
        }
      }
      return parsed;
    }
    return new PrimitiveLiteralExpression(message);
  }

  /**
   * Formulates a property display name using the property name and the configured
   * displayName (if provided).
   * Override this with your own custom logic.
   *
   * @param propertyName - The property name.
   */
  public getDisplayName(propertyName: string | number, displayName?: string | null | (() => string)): string {
    if (displayName !== null && displayName !== undefined) {
      return (displayName instanceof Function) ? displayName() : displayName as string;
    }

    // split on upper-case letters.
    const words = propertyName.toString().split(/(?=[A-Z])/).join(' ');
    // capitalize first letter.
    return words.charAt(0).toUpperCase() + words.slice(1);
  }
}

export class LocalizedValidationMessageProvider extends ValidationMessageProvider {
  // TODO no more monkey patching prototype in user code, rather a standard i18n validation message provider impl
}
