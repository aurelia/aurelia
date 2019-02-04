import { Expression } from 'aurelia-binding';

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

/**
 * A rule definition. Associations a rule with a property or object.
 */
export interface Rule<TObject, TValue> {
  property: RuleProperty;
  condition: (value: TValue, object?: TObject) => boolean | Promise<boolean>;
  config: object;
  when: ((object: TObject) => boolean) | null;
  messageKey: string;
  message: Expression | null;
  sequence: number;
  tag?: string;
}
