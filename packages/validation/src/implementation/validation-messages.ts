import { DI } from '@aurelia/kernel';
import { BindingType, IExpressionParser, IInterpolationExpression } from '@aurelia/runtime';

export interface ValidationMessages {
  [key: string]: string;
}

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
  getMessageByKey(key: string): IInterpolationExpression;
  parseMessage(message: string): IInterpolationExpression;
  getDisplayName(propertyName: string | number, displayName?: string | null | (() => string)): string;
}

export const IValidationMessageProvider = DI.createInterface<IValidationMessageProvider>("IValidationMessageProvider").noDefault();

/**
 * Retrieves validation messages and property display names.
 */
export class ValidationMessageProvider implements IValidationMessageProvider {

  public constructor(@IExpressionParser public parser: IExpressionParser) { }

  /**
   * Returns a message binding expression that corresponds to the key.
   */
  public getMessageByKey(key: string): IInterpolationExpression {
    let message: string;
    if (key in validationMessages) {
      message = validationMessages[key];
    } else {
      message = validationMessages['default'];
    }
    return this.parseMessage(message);
  }

  public parseMessage(message: string): IInterpolationExpression {
    /*
    // TODO
     if (access.ancestor !== 0) {
      throw new Error('$parent is not permitted in validation message expressions.');
    }
    if (['displayName', 'propertyName', 'value', 'object', 'config', 'getDisplayName'].indexOf(access.name) !== -1) {
      LogManager.getLogger('aurelia-validation')
        // tslint:disable-next-line:max-line-length
        .warn(`Did you mean to use "$${access.name}" instead of "${access.name}" in this validation message template: "${this.originalMessage}"?`);
    }
    */
    return this.parser.parse(message, BindingType.Interpolation);
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
