# Serialization and Deserialization

Aurelia's validation system supports serializing and deserializing validation rules to and from JSON. This is particularly useful for scenarios where validation rules are defined on the server and need to be transmitted to the client, or when you need to persist validation rules for later use.

## Overview

The validation system provides three main tools for working with serialized rules:

1. **ValidationSerializer** - Converts validation rules to JSON strings
2. **ValidationDeserializer** - Converts JSON strings back to validation rules
3. **ModelValidationExpressionHydrator** - Converts model-based rule definitions (covered in [Model-Based Validation](model-based-validation.md))

## ValidationSerializer

The `ValidationSerializer` class converts validation rules and property rules into JSON format that can be transmitted, stored, or logged.

### Supported Rule Types

The serializer supports all built-in validation rules:
- `RequiredRule`
- `RegexRule` (including email)
- `LengthRule` (minLength, maxLength)
- `SizeRule` (minItems, maxItems)
- `RangeRule` (min, max, range, between)
- `EqualsRule`

### Basic Serialization

```typescript
import { ValidationSerializer } from '@aurelia/validation';
import { IValidationRules } from '@aurelia/validation';
import { resolve } from '@aurelia/kernel';

export class Person {
  private validationRules = resolve(IValidationRules);

  public name: string = '';
  public email: string = '';
  public age: number = 0;

  public constructor() {
    this.validationRules
      .on(this)
      .ensure('name')
      .required()
      .minLength(3)
      .ensure('email')
      .required()
      .email()
      .ensure('age')
      .required()
      .range({ min: 18, max: 120 });
  }

  public serializeRules(): string {
    const rules = this.validationRules.getRules(this);
    const serialized = rules.map(rule => ValidationSerializer.serialize(rule));
    return JSON.stringify(serialized, null, 2);
  }
}
```

### Serialized Rule Format

Here's an example of what serialized rules look like:

```json
[
  {
    "$TYPE": "PropertyRule",
    "property": {
      "$TYPE": "Property",
      "name": "name",
      "expression": {
        "$TYPE": "AccessScope",
        "name": "name"
      },
      "displayName": null
    },
    "$rules": [
      [
        {
          "$TYPE": "RequiredRule",
          "messageKey": "required",
          "tag": null
        },
        {
          "$TYPE": "LengthRule",
          "messageKey": "minLength",
          "tag": null,
          "length": 3,
          "isMax": false
        }
      ]
    ]
  },
  {
    "$TYPE": "PropertyRule",
    "property": {
      "$TYPE": "Property",
      "name": "email",
      "expression": {
        "$TYPE": "AccessScope",
        "name": "email"
      },
      "displayName": null
    },
    "$rules": [
      [
        {
          "$TYPE": "RequiredRule",
          "messageKey": "required",
          "tag": null
        },
        {
          "$TYPE": "RegexRule",
          "messageKey": "email",
          "tag": null,
          "pattern": {
            "source": "^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$",
            "flags": ""
          }
        }
      ]
    ]
  }
]
```

### Serializing Individual Rules

You can serialize individual rules, properties, or property rules:

```typescript
import { ValidationSerializer } from '@aurelia/validation';
import { RequiredRule, RegexRule, LengthRule } from '@aurelia/validation';

// Serialize a single rule
const requiredRule = new RequiredRule();
const serialized = ValidationSerializer.serialize(requiredRule);
console.log(serialized);
// {"$TYPE":"RequiredRule","messageKey":"required","tag":null}

// Serialize a regex rule
const emailRule = new RegexRule(/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'email');
const serialized2 = ValidationSerializer.serialize(emailRule);
console.log(serialized2);
// {"$TYPE":"RegexRule","messageKey":"email","tag":null,"pattern":{"source":"^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$","flags":""}}
```

## ValidationDeserializer

The `ValidationDeserializer` class converts JSON strings back into validation rules that can be used at runtime.

### Setup

Before using the deserializer, you must register it with your DI container:

```typescript
import Aurelia from 'aurelia';
import { ValidationConfiguration, ValidationDeserializer } from '@aurelia/validation';
import { ValidationHtmlConfiguration } from '@aurelia/validation-html';
import { MyApp } from './my-app';

Aurelia
  .register(
    ValidationHtmlConfiguration,
    ValidationDeserializer  // Register the deserializer
  )
  .app(MyApp)
  .start();
```

### Basic Deserialization

```typescript
import { ValidationDeserializer } from '@aurelia/validation';
import { IValidationRules } from '@aurelia/validation';
import { resolve } from '@aurelia/kernel';

export class DynamicValidation {
  private validationRules = resolve(IValidationRules);

  public applyServerRules(rulesJson: string): void {
    // Parse and deserialize rules from server
    const deserializedRules = ValidationDeserializer.deserialize(
      rulesJson,
      this.validationRules
    );

    // Apply the deserialized rules
    // Note: You'll typically need to apply these to your validation rules registry
    console.log('Deserialized rules:', deserializedRules);
  }
}
```

### Complete Round-Trip Example

Here's an example showing serialization on one component and deserialization on another:

```typescript
// rule-provider.ts
import { ValidationSerializer } from '@aurelia/validation';
import { IValidationRules } from '@aurelia/validation';
import { resolve } from '@aurelia/kernel';

export class RuleProvider {
  private validationRules = resolve(IValidationRules);

  public name: string = '';
  public age: number = 0;

  public constructor() {
    // Define rules
    this.validationRules
      .on(this)
      .ensure('name')
      .required()
      .minLength(3)
      .maxLength(50)
      .ensure('age')
      .required()
      .range({ min: 0, max: 120 });
  }

  public exportRules(): string {
    const rules = this.validationRules.getRules(this);
    return JSON.stringify(
      rules.map(rule => ValidationSerializer.serialize(rule))
    );
  }
}

// rule-consumer.ts
import { ValidationDeserializer } from '@aurelia/validation';
import { IValidationRules, PropertyRule } from '@aurelia/validation';
import { resolve } from '@aurelia/kernel';

export class RuleConsumer {
  private validationRules = resolve(IValidationRules);

  public name: string = '';
  public age: number = 0;

  public importRules(rulesJson: string): void {
    const rulesArray = JSON.parse(rulesJson);

    for (const ruleJson of rulesArray) {
      const deserializedRule = ValidationDeserializer.deserialize(
        JSON.stringify(ruleJson),
        this.validationRules
      ) as PropertyRule;

      // The deserialized rules can now be used
      // Note: You would typically need additional logic to apply these
      // to your validation controller or rules registry
    }
  }
}
```

## Server-Side Validation Rules

A common use case is receiving validation rules from a server API:

```typescript
import { resolve } from '@aurelia/kernel';
import { ValidationDeserializer, IValidationRules, PropertyRule } from '@aurelia/validation';

export class ServerDrivenForm {
  private validationRules = resolve(IValidationRules);
  private http = resolve(IHttpClient);

  public async loadValidationRules(formType: string): Promise<void> {
    // Fetch rules from server
    const response = await this.http.get(`/api/validation-rules/${formType}`);
    const rulesJson = await response.json();

    // Apply server-provided rules
    this.applyRules(rulesJson);
  }

  private applyRules(rulesData: any[]): void {
    for (const ruleData of rulesData) {
      const rule = ValidationDeserializer.deserialize(
        JSON.stringify(ruleData),
        this.validationRules
      ) as PropertyRule;

      // Apply the rule to your object
      // The exact approach depends on your application architecture
    }
  }
}
```

## Limitations and Considerations

### Unsupported Rule Types

The following rule types **cannot** be serialized:

1. **StateRule** - State-based validation rules use functions that cannot be serialized to JSON
2. **GroupRule** - Group validation rules also use functions
3. **Custom rules with function properties** - Any custom validation rule that includes functions

When attempting to serialize these rules in development mode, you'll receive a warning in the console.

### Functions and Closures

Since JSON cannot represent functions, any rule that depends on function execution cannot be fully serialized:

```typescript
// This rule CANNOT be serialized
validationRules
  .on(this)
  .ensure('username')
  .required()
  .when((obj) => obj.accountType === 'premium'); // Function cannot be serialized

// This rule CAN be serialized
validationRules
  .on(this)
  .ensure('username')
  .required()
  .minLength(3);
```

### Tagged Rules

Rules with tags are fully supported in serialization:

```typescript
validationRules
  .on(this)
  .ensure('email')
  .required()
  .tag('registration')
  .email()
  .tag('registration');

// Tags are preserved in serialization
const serialized = ValidationSerializer.serialize(rules);
// The tag property will be included in the JSON
```

## Advanced: Custom Rule Serialization

If you have custom validation rules that you want to serialize, you'll need to extend both the serializer and deserializer.

### Extending the Serializer

```typescript
import { ValidationSerializer } from '@aurelia/validation';
import { IValidationVisitor } from '@aurelia/validation';

export class CustomRule extends BaseValidationRule {
  public static readonly $TYPE: string = 'CustomRule';

  public constructor(public customProperty: string) {
    super('customRule');
  }

  public execute(value: unknown): boolean {
    // Custom validation logic
    return true;
  }

  public accept(visitor: IValidationVisitor): string {
    if (visitor instanceof ValidationSerializer) {
      return `{"$TYPE":"${CustomRule.$TYPE}","messageKey":"${this.messageKey}","tag":${JSON.stringify(this.tag)},"customProperty":${JSON.stringify(this.customProperty)}}`;
    }
    return '';
  }
}
```

### Extending the Deserializer

```typescript
import {
  ValidationDeserializer,
  IValidationRules,
  IValidationRule
} from '@aurelia/validation';

export class CustomValidationDeserializer extends ValidationDeserializer {
  public hydrate(raw: any, validationRules: IValidationRules): any {
    if (raw.$TYPE === 'CustomRule') {
      const rule = new CustomRule(raw.customProperty);
      rule.messageKey = raw.messageKey;
      rule.tag = this.astDeserializer.hydrate(raw.tag);
      return rule;
    }

    return super.hydrate(raw, validationRules);
  }
}
```

Then register your custom deserializer:

```typescript
import Aurelia from 'aurelia';
import { ValidationConfiguration } from '@aurelia/validation';
import { ValidationHtmlConfiguration } from '@aurelia/validation-html';

Aurelia
  .register(
    ValidationHtmlConfiguration,
    CustomValidationDeserializer
  )
  .app(MyApp)
  .start();
```

## Use Cases

### 1. Storing Validation Rules

Persist validation rules to a database and load them dynamically:

```typescript
export class ValidationRuleRepository {
  public async saveRules(entityType: string, rules: PropertyRule[]): Promise<void> {
    const serialized = rules.map(r => ValidationSerializer.serialize(r));
    await this.db.collection('validationRules').insertOne({
      entityType,
      rules: serialized,
      createdAt: new Date()
    });
  }

  public async loadRules(entityType: string): Promise<PropertyRule[]> {
    const doc = await this.db.collection('validationRules').findOne({ entityType });
    return doc.rules.map(r =>
      ValidationDeserializer.deserialize(r, this.validationRules) as PropertyRule
    );
  }
}
```

### 2. Sharing Validation Rules

Share validation rules between client and server to ensure consistency:

```typescript
// shared/validation-rules.json
{
  "User": [
    {
      "$TYPE": "PropertyRule",
      "property": {
        "$TYPE": "Property",
        "name": "email",
        "expression": { "$TYPE": "AccessScope", "name": "email" },
        "displayName": "Email Address"
      },
      "$rules": [[
        { "$TYPE": "RequiredRule", "messageKey": "required", "tag": null },
        { "$TYPE": "RegexRule", "messageKey": "email", "tag": null, "pattern": { "source": "^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$", "flags": "" }}
      ]]
    }
  ]
}

// Both client and server can load and use these rules
```

### 3. API-Driven Validation

Build forms dynamically based on API responses that include validation rules:

```typescript
export class DynamicForm {
  public async loadForm(formId: string): Promise<void> {
    const formConfig = await this.api.getFormConfiguration(formId);

    // formConfig includes field definitions and validation rules
    for (const field of formConfig.fields) {
      // Deserialize and apply validation rules
      const rules = field.validationRules.map(r =>
        ValidationDeserializer.deserialize(JSON.stringify(r), this.validationRules)
      );

      // Apply to form
      this.applyFieldRules(field.name, rules);
    }
  }
}
```

## See Also

- [Model-Based Validation](model-based-validation.md) - Using JSON to define validation rules
- [Defining Rules](defining-rules.md) - Creating validation rules programmatically
- [Configuration and Customization](configuration-and-customization.md) - Customizing the hydrator
