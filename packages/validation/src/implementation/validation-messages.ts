import { Expression } from 'aurelia-binding';
import { ValidationMessageParser } from './validation-message-parser';

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

/**
 * Retrieves validation messages and property display names.
 */
export class ValidationMessageProvider {
  public static inject = [ValidationMessageParser];

  constructor(public parser: ValidationMessageParser) { }

  /**
   * Returns a message binding expression that corresponds to the key.
   * @param key The message key.
   */
  public getMessage(key: string): Expression {
    let message: string;
    if (key in validationMessages) {
      message = validationMessages[key];
    } else {
      message = validationMessages['default'];
    }
    return this.parser.parse(message);
  }

  /**
   * Formulates a property display name using the property name and the configured
   * displayName (if provided).
   * Override this with your own custom logic.
   * @param propertyName The property name.
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
