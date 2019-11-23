import { Class } from '@aurelia/kernel';

export type IValidateable<T = any> = (Class<T> | object) & { [key in PropertyKey]: any };
export type ValidationDisplayNameAccessor = () => string;

/**
 * Information related to a property that is the subject of validation.
 */
export interface RuleProperty {
  /**
   * The property name. null indicates the rule targets the object itself.
   */
  name: string | number | null;

  /**
   * The displayName of the property (or object).
   */
  displayName: string | ValidationDisplayNameAccessor | null;
}
export type RuleCondition<TObject extends IValidateable = IValidateable, TValue = any> = (value: TValue, object?: TObject) => boolean | Promise<boolean>;
/**
 * A rule definition. Associations a rule with a property or object.
 */
export interface Rule<TObject extends IValidateable = IValidateable, TValue = any> {
  property: RuleProperty;
  condition: RuleCondition<TObject, TValue>;
  config: object;
  when?: ((object: TObject) => boolean);
  messageKey: string;
  message?: any; // Expression; // TODO fix typing
  sequence: number;
  tag?: string;
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
