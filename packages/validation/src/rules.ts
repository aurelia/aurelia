// import { IValidationMessageProvider, IValidateable } from './rule';
import { Constructable, Protocol, Metadata, Class, DI } from '@aurelia/kernel';
import { IInterpolationExpression, PrimitiveLiteralExpression } from '@aurelia/runtime';

export type IValidateable<T = any> = (Class<T> | object) & { [key in PropertyKey]: any };

export interface IValidationMessageProvider {
  getMessage(rule: BaseValidationRule): IInterpolationExpression | PrimitiveLiteralExpression;
  parseMessage(message: string): IInterpolationExpression | PrimitiveLiteralExpression;
  getDisplayName(propertyName: string | number, displayName?: string | null | (() => string)): string;
}

export const IValidationMessageProvider = DI.createInterface<IValidationMessageProvider>("IValidationMessageProvider").noDefault();

export interface ValidationRuleAlias {
  name: string;
  defaultMessage?: string;
}
export interface ValidationRuleDefinition {
  aliases: ValidationRuleAlias[];
}

export const ValidationRuleAliasMessage = Object.freeze({
  aliasKey: Protocol.annotation.keyFor('validation-rule-alias-message'),
  define<TRule extends BaseValidationRule>(target: Constructable<TRule>, definition: ValidationRuleDefinition): Constructable<TRule> {
    ValidationRuleAliasMessage.setDefaultMessage(target, definition);
    return target;
  },
  setDefaultMessage<TRule extends BaseValidationRule>(rule: Constructable<TRule> | TRule, { aliases }: ValidationRuleDefinition) {
    Metadata.define(ValidationRuleAliasMessage.aliasKey, aliases, rule instanceof Function ? rule.prototype : rule);
  },
  getDefaultMessages<TRule extends BaseValidationRule>(rule: Constructable<TRule> | TRule): ValidationRuleAlias[] {
    return Metadata.get(this.aliasKey, rule instanceof Function ? rule.prototype : rule);
  }
});

export type ValidationRuleExecutionPredicate = (object?: IValidateable) => boolean;

export function validationRule(definition: ValidationRuleDefinition) {
  return function <TRule extends BaseValidationRule>(target: Constructable<TRule>) {
    return ValidationRuleAliasMessage.define(target, definition);
  };
}

@validationRule({ aliases: [{ name: (void 0)!, defaultMessage: `\${$displayName} is invalid.` }] })
export class BaseValidationRule<TValue = any, TObject extends IValidateable = IValidateable> {
  public tag?: string = (void 0)!;
  protected _message: IInterpolationExpression | PrimitiveLiteralExpression = (void 0)!;

  protected _messageKey: string = (void 0)!;
  public get messageKey() { return this._messageKey; }
  public set messageKey(key: string) {
    this._messageKey = key;
    this._message = (void 0)!;
  }

  public get message(): IInterpolationExpression | PrimitiveLiteralExpression {
    let message = this._message;
    if (message !== void 0) {
      return message;
    }
    message = this._message = this.messageProvider.getMessage(this);
    return message;
  }

  public setMessage(message: string) {
    this._messageKey = 'custom';
    this._message = this.messageProvider.parseMessage(message);
  }

  public constructor(protected readonly messageProvider: IValidationMessageProvider) { }

  public canExecute: ValidationRuleExecutionPredicate = () => true;
  public execute(value: TValue, object?: TObject): boolean | Promise<boolean> {
    throw new Error('No base implementation of execute. Did you forget to implement the excute method?'); // TODO reporter
  }
}

@validationRule({ aliases: [{ name: 'required', defaultMessage: `\${$displayName} is required.` }] })
export class RequiredRule extends BaseValidationRule {
  public execute(value: unknown): boolean | Promise<boolean> {
    return value !== null
      && value !== void 0
      && !(typeof value === 'string' && !/\S/.test(value));
  }
}

@validationRule({
  aliases: [
    { name: 'matches', defaultMessage: `\${$displayName} is not correctly formatted.` },
    { name: 'email', defaultMessage: `\${$displayName} is not a valid email.` },
  ]
})
export class RegexRule extends BaseValidationRule<string> {
  public constructor(messageProvider: IValidationMessageProvider, private readonly pattern: RegExp, protected readonly _messageKey: string = 'matches') {
    super(messageProvider);
  }
  public execute(value: string): boolean | Promise<boolean> {
    return value === null || value === undefined || value.length === 0 || this.pattern.test(value);
  }
}

@validationRule({
  aliases: [
    { name: 'minLength', defaultMessage: `\${$displayName} must be at least \${$rule.length} character\${$rule.length === 1 ? '' : 's'}.` },
    { name: 'maxLength', defaultMessage: `\${$displayName} cannot be longer than \${$rule.length} character\${$rule.length === 1 ? '' : 's'}.` },
  ]
})
export class LengthRule extends BaseValidationRule<string> {
  public constructor(messageProvider: IValidationMessageProvider, private readonly length: number, private readonly isMax: boolean) {
    super(messageProvider);
    this.messageKey = isMax ? 'maxLength' : 'minLength';
  }
  public execute(value: string): boolean | Promise<boolean> {
    return value === null || value === undefined || value.length === 0 || (this.isMax ? value.length <= this.length : value.length >= this.length);
  }
}

@validationRule({
  aliases: [
    { name: 'minItems', defaultMessage: `\${$displayName} must contain at least \${$rule.count} item\${$rule.count === 1 ? '' : 's'}.` },
    { name: 'maxItems', defaultMessage: `\${$displayName} cannot contain more than \${$rule.count} item\${$rule.count === 1 ? '' : 's'}.` },
  ]
})
export class SizeRule extends BaseValidationRule<unknown[]> {
  public constructor(messageProvider: IValidationMessageProvider, private readonly count: number, private readonly isMax: boolean) {
    super(messageProvider);
    this.messageKey = isMax ? 'maxItems' : 'minItems';
  }
  public execute(value: unknown[]): boolean | Promise<boolean> {
    return value === null || value === undefined || (this.isMax ? value.length <= this.count : value.length >= this.count);
  }
}

type Range = {
  min?: number;
  max?: number;
};
@validationRule({
  aliases: [
    { name: 'min', defaultMessage: `\${$displayName} must be at least \${$rule.min}.` },
    { name: 'max', defaultMessage: `\${$displayName} must be at most \${$rule.max}.` },
    { name: 'range', defaultMessage: `\${$displayName} must be between or equal to \${$rule.min} and \${$rule.max}.` },
    { name: 'between', defaultMessage: `\${$displayName} must be between but not equal to \${$rule.min} and \${$rule.max}.` },
  ]
})
export class RangeRule extends BaseValidationRule<number> {
  private readonly min: number = Number.NEGATIVE_INFINITY;
  private readonly max: number = Number.POSITIVE_INFINITY;
  public constructor(messageProvider: IValidationMessageProvider, private readonly isInclusive: boolean, { min, max }: Range) {
    super(messageProvider);
    if (min !== void 0 && max !== void 0) {
      this._messageKey = this.isInclusive ? 'range' : 'between';
    } else {
      this._messageKey = min !== void 0 ? 'min' : 'max';
    }
    this.min = min ?? this.min;
    this.max = max ?? this.max;
  }
  public execute(value: number, _object?: IValidateable): boolean | Promise<boolean> {
    return value === null || value === undefined || (this.isInclusive
      ? value >= this.min && value <= this.max
      : value > this.min && value < this.max);
  }
}

@validationRule({
  aliases: [
    { name: 'equals', defaultMessage: `\${$displayName} must be \${$rule.expectedValue}.` },
  ]
})
export class EqualsRule extends BaseValidationRule {
  public constructor(messageProvider: IValidationMessageProvider, private readonly expectedValue: unknown) { super(messageProvider); }
  public execute(value: unknown): boolean | Promise<boolean> {
    return value === null || value === undefined || value as any === '' || value === this.expectedValue;
  }
}
