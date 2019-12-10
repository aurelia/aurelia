import { DI, ILogger } from '@aurelia/kernel';
import { BindingType, IExpressionParser, IInterpolationExpression, PrimitiveLiteralExpression, Interpolation, AccessScopeExpression, AccessThisExpression } from '@aurelia/runtime';

const contextualProperties: Readonly<Set<string>> = new Set([
  "displayName",
  "propertyName",
  "value",
  "object",
  "config",
  "getDisplayName"
]);

export interface IValidationMessageProvider {
  getMessageByKey(key: string): IInterpolationExpression | PrimitiveLiteralExpression;
  parseMessage(message: string): IInterpolationExpression | PrimitiveLiteralExpression;
  getDisplayName(propertyName: string | number, displayName?: string | null | (() => string)): string;
}

export const IValidationMessageProvider = DI.createInterface<IValidationMessageProvider>("IValidationMessageProvider").noDefault();
/* @internal */
export const ICustomMessages = DI.createInterface("ICustomMessages").noDefault();
/**
 * Retrieves validation messages and property display names.
 */
export class ValidationMessageProvider implements IValidationMessageProvider {

  // TODO move the messages to rules as well as facilitate having custom message registration
  protected defaultMessages: Record<string, string> = {
    /**
     * The default validation message. Used with rules that have no standard message.
     */
    default: `\${$displayName} is invalid.`,
    required: `\${$displayName} is required.`,
    matches: `\${$displayName} is not correctly formatted.`,
    email: `\${$displayName} is not a valid email.`,
    minLength: `\${$displayName} must be at least \${$rule.length} character\${$rule.length === 1 ? '' : 's'}.`,
    maxLength: `\${$displayName} cannot be longer than \${$rule.length} character\${$rule.length === 1 ? '' : 's'}.`,
    minItems: `\${$displayName} must contain at least \${$rule.count} item\${$rule.count === 1 ? '' : 's'}.`,
    maxItems: `\${$displayName} cannot contain more than \${$rule.count} item\${$rule.count === 1 ? '' : 's'}.`,
    min: `\${$displayName} must be at least \${$rule.min}.`,
    max: `\${$displayName} must be at most \${$rule.max}.`,
    range: `\${$displayName} must be between or equal to \${$rule.min} and \${$rule.max}.`,
    between: `\${$displayName} must be between but not equal to \${$rule.min} and \${$rule.max}.`,
    equals: `\${$displayName} must be \${$rule.expectedValue}.`,
  };
  private readonly logger: ILogger;

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
    const validationMessages = this.defaultMessages;
    const message = validationMessages[key] ?? validationMessages['default'];
    return this.parseMessage(message);
  }

  public parseMessage(message: string): IInterpolationExpression | PrimitiveLiteralExpression {
    const parsed = this.parser.parse(message, BindingType.Interpolation);
    if (parsed instanceof Interpolation) {
      for (const expr of parsed.expressions) {
        const name = (expr as AccessScopeExpression).name;
        if (contextualProperties.has(name)) {
          this.logger.warn(`Did you mean to use "$${name}" instead of "${name}" in this validation message template: "${message}"?`);
        }
        if (expr instanceof AccessThisExpression || (expr as AccessScopeExpression).ancestor > 0) {
          throw new Error('$parent is not permitted in validation message expressions.'); // TODO use reporter
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
