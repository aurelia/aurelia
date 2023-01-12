---
description: Performing validation on data models using Aurelia Validation.
---

# Model Based Validation

It is a commonly known best practice to perform data validation both on the server and the client. Validating the data on the server reduces the coupling between the client and the server as then the service does not have to depend on the data quality, solely on the client.&#x20;

On the other hand, client-side validation is equally important to ensure a better user experience so that the client can quickly provide feedback to the end users without making a round trip to the server. For this reason, it is often the case that the validation rules are defined on the server, and the client ends up duplicating those definitions.

With the support of model-based validation, `@aurelia/validation` plugin tries to reduce duplication. We assume the server can communicate the validation rules with the client in JSON data. The plugin uses an implementation of `IValidationHydrator` to adapt the JSON data to Aurelia validation rules. Let us see an example of this.

{% embed url="https://stackblitz.com/edit/au2-validation-model-based-validation" %}

```typescript
import { ModelBasedRule } from "@aurelia/validation";

export const personRules = [
  new ModelBasedRule(
    {
      name: { rules: [ { required: {}, regex: { pattern: { source: 'foo\\d' } } } ] },
      age:  { rules: [ { required: { tag: 'foo' }, range: { min: 42 } } ] }
    }
  ),
  new ModelBasedRule(
    {
      name: { rules: [ { required: {}, regex: { pattern: { source: 'bar' } } } ] },
      age:  { rules: [ { range: { max: 42 } } ] }
    },
    "tag"
  )
]
```

In the next step, these rules need to be associated with targets. The method that applies the model-based rules is the following (refer `my-app.ts`).

```typescript
validationRules.applyModelBasedRules(Person, personRules);
```

The first argument to the method can be a class or an object instance. The second argument must be an array of `ModelBasedRule` instances. This registers the rules for the target class or object instance. After this, the normal validation works as expected without any further changes.

The `ModelBasedRule` is a simple class that describes the ruleset definition or the JSON data that describes the validation rules.

```typescript
export class ModelBasedRule {
  public constructor(
    public ruleset: any,
    public tag: string = '__default'
  ) { }
}
```

The constructor of the class, as shown above, takes 2 arguments. The first is the ruleset. The second is an optional object tag (refer to the [validate instruction](validate-binding-behavior.md)). The ruleset, although typically a plain javascript object, can take any shape that is supported by the implementation of `IValidationHydrator`.

## Default model-based ruleset schema

The out-of-the-box implementation of `IValidationHydrator` supports plain javascript objects with a specific schema. The expected schema is explained below.

```javascript
{
  "propertyName": {
    // rule definition for this property
    "displayName": "Optional display name for the property",
    "rules": [ // <-- the rules needs to be an array
      // the rules to be validated on parallel needs to go in one object
      {
        "ruleKey1": {  // <-- for the out-of-the-box rule keys see later
          // common properties
          "messageKey": "optional message key",
          "tag": "optional tag",
          "when": "boolean > expression"|function() { return boolean; }, // see later

          // rule specific properties, see later
        },
        "ruleKey2": { /*... */ }
      },
      /**
       * multiple items in the `rules` array means that the subsequent set of rules won't be validated
       * till the preceding rules are successfully validated.
       * It has same effect of sequencing rules using `.then`
       */
      {
        "ruleKey11" : { /*... */ },
        "ruleKey22" : { /*... */ },
      }
    ]
  },
  "navigationProperty": {
    "subProperty": {
      "subSubProperty": { /* rule definition */ } // <-- rules for navigationProperty.subProperty.subSubProperty
    }
  }
}
```

The default implementation also supports defining all the out-of-the-box rules.

| Rule                    | Key         | Rule-specific properties                                                                                                                                                                                                                                                                                                                                  |
| ----------------------- | ----------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Required                | `required`  | None. Example: `{ required: { } }`                                                                                                                                                                                                                                                                                                                        |
| Regex                   | `regex`     | `pattern`: object describing a `RegExp`. Example: `{ regex: { pattern: { source: 'foo\\d', flag: 'gi' } } }` is equivalent to `/foo\d/gi`                                                                                                                                                                                                                 |
| Maximum length          | `maxLength` | `length`: numeric; maximum length constraint. Example: `{ maxLength: { length: 42 } }`.                                                                                                                                                                                                                                                                   |
| Minimum length          | `minLength` | `length`: numeric; minimum length constraint. Example: `{ minLength: { length: 42 } }`.                                                                                                                                                                                                                                                                   |
| Maximum size            | `maxItems`  | `count`: numeric; maximum size constraint. Example: `{ maxItems: { count: 42 } }`.                                                                                                                                                                                                                                                                        |
| Minimum size            | `minItems`  | `count`: numeric; minimum size constraint. Example: `{ minItems: { count: 42 } }`.                                                                                                                                                                                                                                                                        |
| Inclusive numeric range | `range`     | `min`: numeric; lower boundary, optional. `max`: numeric; upper boundary, optional. `isInclusive`: boolean; whether it is an inclusive or exclusive range, defaults to exclusive. Note that either of the `min` or `max` is required. Examples: `{ range: { isInclusive: true, min: 42 } }`, `{ range: { max: 42 } }`, `{ range: { min: 42, max: 84 } }`. |
| Exclusive numeric range | `between`   | Same as `range`. Examples: `{ between: { isInclusive: true, min: 42 } }`, `{ between: { max: 42 } }`, `{ between: { min: 42, max: 84 } }`.                                                                                                                                                                                                                |
| Equality                | `equals`    | `expectedValue`: any. Examples: `{ equals: { expectedValue: 42 } }`.                                                                                                                                                                                                                                                                                      |

Specifying a conditional rule by using a string value representing a boolean expression is also possible.

```javascript
{ ruleKey: { when: "$object.age > 18" } }
```

Loosely speaking, the expression in `when` will be hydrated to this function expression: `($object) => $object.age > 18`. Alternatively, if the ruleset is not a plain JSON but rather a javascript object, a function can be used as well.

```javascript
{ ruleKey: { when: function(person) { return object.age > 18; } } }
```

## Custom rule hydrator

If you have either use-case, you would want to create a custom rule hydrator.

1. You have custom rules and want to use those in model-based rule JSON data.
2. You have your own schema for rules, or the rules metadata is not even a JSON data.

Implementing a custom hydrator ends up implementing the following interface.

```typescript
export interface IValidationHydrator {
  readonly astDeserializer: Deserializer;
  readonly parser: IExpressionParser;
  readonly messageProvider: IValidationMessageProvider;
  hydrate(raw: any, validationRules: IValidationRules): any;
  hydrateRuleset(ruleset: any, validationRules: IValidationRules): IPropertyRule[];
}
```

Additionally, you need to register your custom hydrator implementation using the `HydratorType` customization option, as shown below.

```typescript
import Aurelia from 'aurelia';
import { ValidationConfiguration } from '@aurelia/validation';
import { CustomModelValidationHydrator } './custom-model-validation-hydrator';

Aurelia
  .register(
    ValidationConfiguration.customize((options) => {
      options.HydratorType = CustomModelValidationHydrator; // <-- register the hydrator
    })
  )
  //...
```

Note that the second use case, as stated above, probably needs a completely new implementation of this interface, which is in its own merit out-of-the-scope of this documentation. To that end, you can easily subclass the default implementation to support your custom rule. Refer to the example and the demo below.

{% tabs %}
{% tab title="model-based-rules.ts" %}
```typescript
import { ModelBasedRule } from "@aurelia/validation";

export const personRules = [
  new ModelBasedRule(
    {
      //...
      age:  { rules: [ { required: { tag: 'foo' }, customRule1: { /* rule configuration */ } } ] } //<-- custom rule
      //...
    }
  ),
]
```
{% endtab %}

{% tab title="custom-model-validation-hydrator.ts" %}
```typescript
import { ModelValidationHydrator } from "@aurelia/validation";

export class CustomModelValidationHydrator extends ModelValidationHydrator {

  protected hydrateRule(ruleName: string, ruleConfig: any): IValidationRule {
    switch (ruleName) {
      case 'customRule1': //<- handle custom rule hydration
        return this.hydrateCustomRule1(ruleConfig);

      // here goes more cases for other custom rules

      default:
        return super.hydrateRule(ruleName, ruleConfig);
    }
  }

  private hydrateCustomRule1(ruleConfig: any) {
    const rule = new CustomRule1(ruleConfig.ruleProperty1, ruleConfig.rulePropertyN);
    this.setCommonRuleProperties(ruleConfig, rule);
    return rule;
  }
}
```
{% endtab %}

{% tab title="main.ts" %}
```typescript
import Aurelia from 'aurelia';
import { ValidationConfiguration } from '@aurelia/validation';
import { MyApp } from './my-app';
import { CustomModelValidationHydrator } './custom-model-validation-hydrator';

Aurelia
  .register(
    ValidationConfiguration.customize((options) => {
      options.HydratorType = CustomModelValidationHydrator; // <-- register the hydrator
    })
  )
  .app(MyApp)
  .start();
```
{% endtab %}
{% endtabs %}

{% embed url="https://stackblitz.com/edit/au2-validation-model-based-validation-custom-rule-hydration?ctl=1" %}
