import { Constructable, Protocol, Metadata, Class, DI, toArray } from '@aurelia/kernel';
import { Interpolation, PrimitiveLiteralExpression } from '@aurelia/runtime';
import {
  IValidateable,
  IValidationRule,
  IRequiredRule,
  IRegexRule,
  ILengthRule,
  ISizeRule,
  IRangeRule,
  IEqualsRule,
  IValidationVisitor,
  ValidationDisplayNameAccessor,
} from './rule-interfaces';

/**
 * Retrieves validation messages and property display names.
 */
export interface IValidationMessageProvider {
  /**
   * Gets the parsed message for the `rule`.
   */
  getMessage(rule: IValidationRule): Interpolation | PrimitiveLiteralExpression;
  /**
   * Gets the parsed message for the `rule`.
   */
  setMessage(rule: IValidationRule, message: string): Interpolation | PrimitiveLiteralExpression;
  /**
   * Core message parsing function.
   */
  parseMessage(message: string): Interpolation | PrimitiveLiteralExpression;
  /**
   * Formulates a property display name using the property name and the configured displayName (if provided).
   */
  getDisplayName(propertyName: string | number | undefined, displayName?: string | null | ValidationDisplayNameAccessor): string | undefined;
}

export const IValidationMessageProvider = DI.createInterface<IValidationMessageProvider>('IValidationMessageProvider');

export interface ValidationRuleAlias {
  name: string;
  defaultMessage?: string;
}
export interface ValidationRuleDefinition {
  aliases: ValidationRuleAlias[];
}
export type RuleType<TRule extends IValidationRule> = Class<TRule, { $TYPE: string }>;
export const ValidationRuleAliasMessage = Object.freeze({
  aliasKey: Protocol.annotation.keyFor('validation-rule-alias-message'),
  define<TRule extends IValidationRule>(target: RuleType<TRule>, definition: ValidationRuleDefinition): RuleType<TRule> {
    ValidationRuleAliasMessage.setDefaultMessage(target, definition);
    return target;
  },
  setDefaultMessage<TRule extends IValidationRule>(rule: Constructable<TRule>, { aliases }: ValidationRuleDefinition, append: boolean = true) {
    // conditionally merge
    const defaultMessages = append ? Metadata.getOwn(this.aliasKey, rule.prototype) as ValidationRuleAlias[] : void 0;
    if (defaultMessages !== void 0) {
      // TODO: have polyfill for `Object.fromEntries` as IE does not yet support it
      const allMessages: Record<string, string> = {
        ...Object.fromEntries(defaultMessages.map(({ name, defaultMessage }) => [name, defaultMessage])) as Record<string, string>,
        ...Object.fromEntries(aliases.map(({ name, defaultMessage }) => [name, defaultMessage])) as Record<string, string>,
      };
      aliases = toArray(Object.entries(allMessages)).map(([name, defaultMessage]) => ({ name, defaultMessage }));
    }
    Metadata.define(ValidationRuleAliasMessage.aliasKey, aliases, rule instanceof Function ? rule.prototype : rule);
  },
  getDefaultMessages<TRule extends IValidationRule>(rule: Constructable<TRule> | TRule): ValidationRuleAlias[] {
    return Metadata.get(this.aliasKey, rule instanceof Function ? rule.prototype : rule);
  }
});

export function validationRule(definition: ValidationRuleDefinition) {
  return function <TRule extends IValidationRule>(target: RuleType<TRule>) {
    return ValidationRuleAliasMessage.define(target, definition);
  };
}

/**
 * Abstract validation rule.
 */
@validationRule({ aliases: [{ name: (void 0)!, defaultMessage: `\${$displayName} is invalid.` }] })
export class BaseValidationRule<TValue = any, TObject extends IValidateable = IValidateable> implements IValidationRule<TValue, TObject> {
  public static readonly $TYPE: string = '';
  public tag?: string = (void 0)!;
  public constructor(
    public messageKey: string = (void 0)!,
  ) { }
  public canExecute(_object?: IValidateable): boolean { return true; }
  public execute(_value: TValue, _object?: TObject): boolean | Promise<boolean> {
    throw new Error('No base implementation of execute. Did you forget to implement the execute method?'); // TODO: reporter
  }
  public accept(_visitor: IValidationVisitor): any {
    throw new Error('No base implementation of accept. Did you forget to implement the accept method?'); // TODO: reporter
  }
}

/**
 * Passes the validation if the value is not `null`, and not `undefined`.
 * In case of string, it must not be empty.
 *
 * @see PropertyRule#required
 */
@validationRule({ aliases: [{ name: 'required', defaultMessage: `\${$displayName} is required.` }] })
export class RequiredRule extends BaseValidationRule implements IRequiredRule {
  public static readonly $TYPE: string = 'RequiredRule';
  public constructor() { super('required'); }
  public execute(value: unknown): boolean | Promise<boolean> {
    return value !== null
      && value !== void 0
      && !(typeof value === 'string' && !/\S/.test(value));
  }
  public accept(visitor: IValidationVisitor) {
    return visitor.visitRequiredRule(this);
  }
}

/**
 * Passes the validation if the non-`null`, non-`undefined`, and non-empty string value matches the given pattern described by a regular expression.
 * There are 2 aliases: 'matches' (any random regex), and 'email' (with email regex).
 *
 * @see PropertyRule#matches
 * @see PropertyRule#email
 */
@validationRule({
  aliases: [
    { name: 'matches', defaultMessage: `\${$displayName} is not correctly formatted.` },
    { name: 'email', defaultMessage: `\${$displayName} is not a valid email.` },
  ]
})
export class RegexRule extends BaseValidationRule<string> implements IRegexRule {
  public static readonly $TYPE: string = 'RegexRule';
  public constructor(public readonly pattern: RegExp, messageKey: string = 'matches') {
    super(messageKey);
  }
  public execute(value: string): boolean | Promise<boolean> {
    return value === null
      || value === undefined
      || value.length === 0
      || this.pattern.test(value);
  }
  public accept(visitor: IValidationVisitor) {
    return visitor.visitRegexRule(this);
  }
}

/**
 * Passes the validation if the non-`null`, non-`undefined`, and non-empty string value matches the given length constraint.
 * There are 2 aliases: 'minLength', and 'maxLength'.
 *
 * @see PropertyRule#minLength
 * @see PropertyRule#maxLength
 */
@validationRule({
  aliases: [
    { name: 'minLength', defaultMessage: `\${$displayName} must be at least \${$rule.length} character\${$rule.length === 1 ? '' : 's'}.` },
    { name: 'maxLength', defaultMessage: `\${$displayName} cannot be longer than \${$rule.length} character\${$rule.length === 1 ? '' : 's'}.` },
  ]
})
export class LengthRule extends BaseValidationRule<string> implements ILengthRule {
  public static readonly $TYPE: string = 'LengthRule';
  public constructor(public readonly length: number, public readonly isMax: boolean) {
    super(isMax ? 'maxLength' : 'minLength');
  }
  public execute(value: string): boolean | Promise<boolean> {
    return value === null
      || value === undefined
      || value.length === 0
      || (this.isMax ? value.length <= this.length : value.length >= this.length);
  }
  public accept(visitor: IValidationVisitor) {
    return visitor.visitLengthRule(this);
  }
}

/**
 * Passes the validation if the non-`null`, and non-`undefined` array value matches the given count constraint.
 * There are 2 aliases: 'minItems', and 'maxItems'.
 *
 * @see PropertyRule#minItems
 * @see PropertyRule#maxItems
 */
@validationRule({
  aliases: [
    { name: 'minItems', defaultMessage: `\${$displayName} must contain at least \${$rule.count} item\${$rule.count === 1 ? '' : 's'}.` },
    { name: 'maxItems', defaultMessage: `\${$displayName} cannot contain more than \${$rule.count} item\${$rule.count === 1 ? '' : 's'}.` },
  ]
})
export class SizeRule extends BaseValidationRule<unknown[]> implements ISizeRule {
  public static readonly $TYPE: string = 'SizeRule';
  public constructor(public readonly count: number, public readonly isMax: boolean) {
    super(isMax ? 'maxItems' : 'minItems');
  }
  public execute(value: unknown[]): boolean | Promise<boolean> {
    return value === null
      || value === undefined
      || (this.isMax ? value.length <= this.count : value.length >= this.count);
  }
  public accept(visitor: IValidationVisitor) {
    return visitor.visitSizeRule(this);
  }
}

type Range = {
  min?: number;
  max?: number;
};

/**
 * Passes the validation if the non-`null`, and non-`undefined` numeric value matches the given interval constraint.
 * There are 2 aliases: 'min' (`[min,]`), 'max' (`[, max]`), range (`[min, max]`), and 'between' (`(min, max)`).
 *
 * @see PropertyRule#min
 * @see PropertyRule#max
 * @see PropertyRule#range
 * @see PropertyRule#between
 */
@validationRule({
  aliases: [
    { name: 'min', defaultMessage: `\${$displayName} must be at least \${$rule.min}.` },
    { name: 'max', defaultMessage: `\${$displayName} must be at most \${$rule.max}.` },
    { name: 'range', defaultMessage: `\${$displayName} must be between or equal to \${$rule.min} and \${$rule.max}.` },
    { name: 'between', defaultMessage: `\${$displayName} must be between but not equal to \${$rule.min} and \${$rule.max}.` },
  ]
})
export class RangeRule extends BaseValidationRule<number> implements IRangeRule {
  public static readonly $TYPE: string = 'RangeRule';
  public readonly min: number = Number.NEGATIVE_INFINITY;
  public readonly max: number = Number.POSITIVE_INFINITY;
  public constructor(public readonly isInclusive: boolean, { min, max }: Range) {
    super(
      min !== void 0 && max !== void 0
        ? (isInclusive ? 'range' : 'between')
        : (min !== void 0 ? 'min' : 'max')
    );
    this.min = min ?? this.min;
    this.max = max ?? this.max;
  }
  public execute(value: number, _object?: IValidateable): boolean | Promise<boolean> {
    return value === null
      || value === undefined
      || (this.isInclusive
        ? value >= this.min && value <= this.max
        : value > this.min && value < this.max
      );
  }
  public accept(visitor: IValidationVisitor) {
    return visitor.visitRangeRule(this);
  }
}

/**
 * Passes the validation if the the non-`null`, non-`undefined`, non-empty value matches given expected value.
 *
 * @see PropertyRule#equals
 */
@validationRule({
  aliases: [
    { name: 'equals', defaultMessage: `\${$displayName} must be \${$rule.expectedValue}.` },
  ]
})
export class EqualsRule extends BaseValidationRule implements IEqualsRule {
  public static readonly $TYPE: string = 'EqualsRule';
  public constructor(public readonly expectedValue: unknown) { super('equals'); }
  public execute(value: unknown): boolean | Promise<boolean> {
    return value === null
      || value === undefined
      || value as any === ''
      || value === this.expectedValue;
  }
  public accept(visitor: IValidationVisitor) {
    return visitor.visitEqualsRule(this);
  }
}
