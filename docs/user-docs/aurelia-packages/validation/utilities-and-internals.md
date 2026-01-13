# Utilities and Internals

This guide covers the internal APIs and utilities of the Aurelia validation system. These are primarily intended for plugin authors, advanced users, and those building custom validation extensions.

## Overview

The validation system exposes several utilities and internal APIs that can be useful when building:
- Custom validation rules
- Custom validation result presenters
- Integration plugins
- Advanced validation scenarios

## Metadata Registry

### validationRulesRegistrar

The `validationRulesRegistrar` is a metadata registry that stores and retrieves validation rules associated with objects and classes.

**Purpose:** Manages the association between objects/classes and their validation rules using metadata annotations.

**API:**

```typescript
const validationRulesRegistrar = {
  // Store validation rules for a target
  set(target: IValidateable, rules: IPropertyRule[], tag?: string): void;

  // Retrieve validation rules for a target
  get(target: IValidateable, tag?: string): PropertyRule[] | undefined;

  // Remove validation rules from a target
  unset(target: IValidateable, tag?: string): void;

  // Check if validation rules are set for a target
  isValidationRulesSet(target: IValidateable): boolean;

  // Default rule set name
  defaultRuleSetName: '__default';
}
```

**Example Usage:**

```typescript
import { validationRulesRegistrar, PropertyRule, Property } from '@aurelia/validation';

export class CustomValidationManager {
  public registerRulesForObject(target: any, rules: PropertyRule[]): void {
    // Store rules with default tag
    validationRulesRegistrar.set(target, rules);
  }

  public registerRulesWithTag(target: any, rules: PropertyRule[], tag: string): void {
    // Store rules with specific tag
    validationRulesRegistrar.set(target, rules, tag);
  }

  public getRules(target: any): PropertyRule[] | undefined {
    // Retrieve rules with default tag
    return validationRulesRegistrar.get(target);
  }

  public getTaggedRules(target: any, tag: string): PropertyRule[] | undefined {
    // Retrieve rules with specific tag
    return validationRulesRegistrar.get(target, tag);
  }

  public clearRules(target: any): void {
    // Remove all rules from target
    validationRulesRegistrar.unset(target);
  }

  public hasRules(target: any): boolean {
    // Check if target has any validation rules
    return validationRulesRegistrar.isValidationRulesSet(target);
  }
}
```

**Key Concepts:**

- **Tags**: Validation rules can be organized using tags, allowing multiple rule sets for the same object
- **Default Tag**: When no tag is specified, the default tag `'__default'` is used
- **Metadata Storage**: Rules are stored using Aurelia's metadata system, attached to objects or their constructors
- **Inheritance**: Rules can be retrieved from an object instance or its constructor

## Validation Event System

### ValidationEvent

The `ValidationEvent` class describes validation events that are sent to subscribers when validation state changes.

**Structure:**

```typescript
class ValidationEvent {
  public constructor(
    public kind: 'validate' | 'reset',
    public addedResults: ValidationResultTarget[],
    public removedResults: ValidationResultTarget[]
  ) {}
}
```

**Properties:**

- `kind`: Type of event - either `'validate'` (validation occurred) or `'reset'` (validation was cleared)
- `addedResults`: New validation results that were added
- `removedResults`: Previous validation results that were removed

### ValidationResultTarget

Links a validation result with the DOM elements it affects.

**Structure:**

```typescript
class ValidationResultTarget {
  public constructor(
    public result: ValidationResult,
    public targets: Element[]
  ) {}
}
```

**Properties:**

- `result`: The validation result (contains valid/invalid state, message, etc.)
- `targets`: Array of DOM elements associated with this validation result

**Example: Custom Subscriber:**

```typescript
import {
  ValidationEvent,
  ValidationResultTarget,
  ValidationResultsSubscriber
} from '@aurelia/validation-html';

export class CustomErrorLogger implements ValidationResultsSubscriber {
  public handleValidationEvent(event: ValidationEvent): void {
    if (event.kind === 'validate') {
      // Log new validation errors
      for (const target of event.addedResults) {
        if (!target.result.valid) {
          console.error(
            `Validation error on ${target.result.propertyName}:`,
            target.result.message,
            'Elements:', target.targets
          );
        }
      }
    } else if (event.kind === 'reset') {
      // Log cleared errors
      console.log(`${event.removedResults.length} validation errors cleared`);
    }
  }
}
```

### BindingInfo

Describes a binding that's registered with the validation controller. This class is used internally by the `& validate` binding behavior.

**Structure:**

```typescript
class BindingInfo {
  public constructor(
    public sourceObserver: IConnectable,
    public target: Element,
    public scope: Scope,
    public rules?: PropertyRule[],
    public propertyInfo: PropertyInfo | undefined = void 0
  ) {}
}
```

**Properties:**

- `sourceObserver`: Observer for the binding source that detects changes
- `target`: The HTML element associated with the binding
- `scope`: The binding scope containing the binding context
- `rules`: Optional property rules bound to this binding
- `propertyInfo`: Cached information about the property being validated

**Use Case:**

This class is primarily used internally, but can be useful when building custom validation triggers or integrating with the validation controller at a low level.

## Validation Result Classes

### ValidationResult

Represents the result of validating a single rule.

**Structure:**

```typescript
class ValidationResult {
  public constructor(
    public valid: boolean,
    public message: string | undefined,
    public propertyName: string | undefined,
    public object: any,
    public rule: IValidationRule | undefined,
    public propertyRule: PropertyRule | undefined,
    public isManual: boolean = false
  ) {}

  // Unique identifier for this result
  public id: number;
}
```

**Properties:**

- `valid`: `true` if validation passed, `false` if it failed
- `message`: Error message (only present when `valid` is `false`)
- `propertyName`: Name of the property that was validated
- `object`: The object that was validated
- `rule`: The individual rule that was evaluated
- `propertyRule`: The property rule containing this rule
- `isManual`: `true` if the result was added manually via `addError()`
- `id`: Auto-generated unique identifier for this result

### ControllerValidateResult

The result returned by the validation controller's `validate()` method.

**Structure:**

```typescript
class ControllerValidateResult {
  public constructor(
    public valid: boolean,
    public results: ValidationResult[],
    public instruction?: Partial<ValidateInstruction>
  ) {}
}
```

**Properties:**

- `valid`: `true` if all validation passed, `false` if any failed
- `results`: Array of all validation results
- `instruction`: Optional instruction that was passed to validate

**Example:**

```typescript
import { newInstanceForScope, resolve } from '@aurelia/kernel';
import { IValidationController } from '@aurelia/validation-html';

export class FormHandler {
  private validationController = resolve(newInstanceForScope(IValidationController));

  public async submit(): Promise<void> {
    const result = await this.validationController.validate();

    // Access overall validation state
    if (result.valid) {
      console.log('All validation passed!');
    }

    // Access individual validation results
    for (const validationResult of result.results) {
      if (!validationResult.valid) {
        console.error(
          `${validationResult.propertyName}: ${validationResult.message}`
        );
      }
    }

    // Check what was validated
    if (result.instruction) {
      console.log('Validated object:', result.instruction.object);
      console.log('Validated property:', result.instruction.propertyName);
    }
  }
}
```

## Utility Functions

### parsePropertyName

Parses a property name string or accessor function into a property name and expression.

**Signature:**

```typescript
function parsePropertyName(
  property: string | PropertyAccessor,
  parser: IExpressionParser
): [name: string | number, expression: IsBindingBehavior];
```

**Parameters:**

- `property`: A property name string (e.g., `'name'`, `'address.city'`) or a property accessor function
- `parser`: Expression parser instance

**Returns:** A tuple containing:
1. The property name (string or number)
2. The parsed expression

**Example:**

```typescript
import { parsePropertyName } from '@aurelia/validation';
import { IExpressionParser } from '@aurelia/expression-parser';
import { resolve } from '@aurelia/kernel';

export class PropertyParser {
  private parser = resolve(IExpressionParser);

  public parseProperty(propertyPath: string): void {
    const [name, expression] = parsePropertyName(propertyPath, this.parser);

    console.log('Property name:', name);
    console.log('Expression:', expression);
  }
}

// Example usage:
const parser = new PropertyParser();
parser.parseProperty('user.address.city');
// Property name: "user.address.city"
// Expression: AccessScope expression for the property path
```

**Use Cases:**

- Parsing nested property paths
- Converting property accessor functions to expressions
- Building custom validation rule implementations

## Property Accessor

### PropertyAccessor

A type that represents a function for accessing properties. Used in the validation API to allow type-safe property selection.

**Type Definition:**

```typescript
type PropertyAccessor<TObject = any, TValue = any> =
  (object: TObject) => TValue;
```

**Example:**

```typescript
import { IValidationRules } from '@aurelia/validation';
import { resolve } from '@aurelia/kernel';

interface User {
  username: string;
  profile: {
    email: string;
    age: number;
  };
}

export class UserValidation {
  private validationRules = resolve(IValidationRules);

  public setupRules(): void {
    this.validationRules
      .on<User>(this as any)

      // Using string property names
      .ensure('username')
      .required()

      // Using property accessor for nested properties (type-safe)
      .ensure((u: User) => u.profile.email)
      .required()
      .email();
  }
}
```

## Interfaces for Plugin Authors

### IValidationVisitor

Interface for implementing visitors that process validation rules. Used for serialization, transformation, or analysis of rules.

```typescript
interface IValidationVisitor {
  visitRequiredRule(rule: RequiredRule): any;
  visitRegexRule(rule: RegexRule): any;
  visitLengthRule(rule: LengthRule): any;
  visitSizeRule(rule: SizeRule): any;
  visitRangeRule(rule: RangeRule): any;
  visitEqualsRule(rule: EqualsRule): any;
  visitProperty(property: Property): any;
  visitPropertyRule(propertyRule: PropertyRule): any;
}
```

**Example: Custom Rule Inspector:**

```typescript
import {
  IValidationVisitor,
  RequiredRule,
  RegexRule,
  LengthRule,
  SizeRule,
  RangeRule,
  EqualsRule,
  Property,
  PropertyRule
} from '@aurelia/validation';

export class ValidationRuleInspector implements IValidationVisitor {
  private ruleCount = 0;

  public visitRequiredRule(rule: RequiredRule): string {
    this.ruleCount++;
    return `Required rule with message key: ${rule.messageKey}`;
  }

  public visitRegexRule(rule: RegexRule): string {
    this.ruleCount++;
    return `Regex rule with pattern: ${rule.pattern}`;
  }

  public visitLengthRule(rule: LengthRule): string {
    this.ruleCount++;
    return `Length rule: ${rule.isMax ? 'max' : 'min'} ${rule.length}`;
  }

  public visitSizeRule(rule: SizeRule): string {
    this.ruleCount++;
    return `Size rule: ${rule.isMax ? 'max' : 'min'} ${rule.count}`;
  }

  public visitRangeRule(rule: RangeRule): string {
    this.ruleCount++;
    return `Range rule: ${rule.min} to ${rule.max} (${rule.isInclusive ? 'inclusive' : 'exclusive'})`;
  }

  public visitEqualsRule(rule: EqualsRule): string {
    this.ruleCount++;
    return `Equals rule: must equal ${rule.expectedValue}`;
  }

  public visitProperty(property: Property): string {
    return `Property: ${property.name} (display name: ${property.displayName})`;
  }

  public visitPropertyRule(propertyRule: PropertyRule): string {
    const propertyInfo = propertyRule.property.accept(this);
    const rulesInfo = propertyRule.$rules
      .flat()
      .map(rule => rule.accept(this))
      .join(', ');

    return `${propertyInfo} with rules: [${rulesInfo}]`;
  }

  public getRuleCount(): number {
    return this.ruleCount;
  }
}
```

### ValidationResultsSubscriber

Interface for receiving validation event notifications.

```typescript
interface ValidationResultsSubscriber {
  handleValidationEvent(event: ValidationEvent): void;
}
```

**Example: Analytics Tracker:**

```typescript
import {
  ValidationEvent,
  ValidationResultsSubscriber
} from '@aurelia/validation-html';

export class ValidationAnalyticsTracker implements ValidationResultsSubscriber {
  public handleValidationEvent(event: ValidationEvent): void {
    if (event.kind === 'validate') {
      const errorCount = event.addedResults.filter(
        r => !r.result.valid
      ).length;

      if (errorCount > 0) {
        // Track validation errors in analytics
        this.analytics.track('ValidationError', {
          errorCount,
          fields: event.addedResults
            .filter(r => !r.result.valid)
            .map(r => r.result.propertyName)
        });
      }
    }
  }

  private analytics = {
    track(eventName: string, data: any) {
      console.log(`Analytics: ${eventName}`, data);
    }
  };
}
```

## Best Practices

### When to Use Internals

Use these internal APIs when:

1. **Building Custom Rules**: Implementing complex custom validation rules that need deep integration
2. **Creating Plugins**: Building validation extensions or integrations
3. **Custom Presenters**: Implementing custom error display logic
4. **Analytics**: Tracking validation events for analytics or monitoring
5. **Testing**: Writing advanced tests that need access to validation internals

### When NOT to Use Internals

Avoid using internal APIs for:

1. **Standard Validation**: Use the fluent API instead
2. **Simple Custom Rules**: Use `.satisfies()` or `.satisfiesState()` instead
3. **Basic Error Display**: Use the built-in presenters or `validation-errors` attribute
4. **Configuration**: Use the configuration API instead

### Important Considerations

- **Stability**: Internal APIs may change between minor versions
- **Documentation**: Internal APIs have less documentation than public APIs
- **Support**: Internal API usage may not be supported in community forums
- **Alternatives**: Always check if a public API can accomplish your goal first

## See Also

- [Defining Rules](defining-rules.md) - Creating validation rules
- [Custom Rules](defining-rules.md#custom-rules) - Building custom validation rules
- [Configuration and Customization](configuration-and-customization.md) - Customizing the validation system
- [Validation Result Presentation](validation-result-presentation.md) - Custom error presentation
