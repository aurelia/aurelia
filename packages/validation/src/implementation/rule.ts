import { Class } from '@aurelia/kernel';
import { IInterpolationExpression } from '@aurelia/runtime';
import { IValidationMessageProvider } from './validation-messages';

export type IValidateable<T = any> = (Class<T> | object) & { [key in PropertyKey]: any };
export type ValidationDisplayNameAccessor = () => string;

/**
 * Information related to a property that is the subject of validation.
 */
export class RuleProperty {
  /**
   * @param {(string | number | null)} [name=null] - The property name. null indicates the rule targets the object itself.
   * @param {(string | ValidationDisplayNameAccessor | null)} [displayName=null] - The displayName of the property (or object).
   * @memberof RuleProperty
   */
  public constructor(
    public name: string | number | null = null,
    public displayName: string | ValidationDisplayNameAccessor | null = null,
  ) { }
}
export type RuleCondition<TObject extends IValidateable = IValidateable, TValue = any> = (value: TValue, object?: TObject) => boolean | Promise<boolean>;
/**
 * A rule definition. Associations a rule with a property or object.
 */
export class Rule<TObject extends IValidateable = IValidateable, TValue = any> {
  private message: IInterpolationExpression;

  public constructor(
    private readonly messageProvider: IValidationMessageProvider,
    public property: RuleProperty,
    public condition: RuleCondition<TObject, TValue>,
    public config: object,
    public sequence: number,
    public messageKey: string = 'default',
    public when?: ((object: TObject) => boolean),
    public tag?: string,
  ) {
    this.message = (void 0)!;
  }

  public setMessageKey(key: string) {
    this.messageKey = key;
    this.message = (void 0)!;
  }

  public setMessage(message: string) {
    this.messageKey = 'custom';
    this.message = this.messageProvider.parseMessage(message);
  }

  public getMessage() {
    let message = this.message;
    if (message !== void 0) {
      return message;
    }
    message = this.message = this.messageProvider.getMessageByKey(this.messageKey);
    return message;
  }
}

// TODO use metadata service for this.
/**
 * Sets, unsets and retrieves rules on an object or constructor function.
 */
export class Rules {
  /**
   * The name of the property that stores the rules.
   */
  private static key = '__rules__';

  /**
   * Applies the rules to a target.
   */
  public static set(target: IValidateable, rules: Rule[][]): void {
    if (target instanceof Function) {
      target = target.prototype;
    }
    Object.defineProperty(
      target,
      Rules.key,
      { enumerable: false, configurable: false, writable: true, value: rules });
  }

  /**
   * Removes rules from a target.
   */
  public static unset(target: IValidateable): void {
    if (target instanceof Function) {
      target = target.prototype;
    }
    target[Rules.key] = null;
  }

  /**
   * Retrieves the target's rules.
   */
  public static get(target: IValidateable): Rule[][] {
    return target[Rules.key];
  }
}
