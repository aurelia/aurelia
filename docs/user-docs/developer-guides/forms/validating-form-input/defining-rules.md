---
description: Creating and customing Aurelia Validation rules to ensure data is validated.
---

# Defining & Customizing Rules

Let us also consider the following `Person` class, and we want to define validation rules for this class or instance of this class.

```typescript
export interface Address {
  line1: string;
  line2?: string;
  city: string;
  pin: number;
}

export class Person {
  public constructor(
    public name: string,
    public age: number,
    public email: string,
    public pets: string[],
    public address: Address,
  ) { }
}
```

To define rules use the `IValidationRules` fluent API. In order to do that you need to inject the `IValidationRules` object. This is shown in the following example.

{% tabs %}
{% tab title="awesome-component.ts" %}
```typescript
import { resolve } from '@aurelia/kernel';
import { IValidationRules } from '@aurelia/validation';

export class AwesomeComponent {
  public constructor(
    validationRules: IValidationRules = resolve(IValidationRules)
  ) { }
}
```
{% endtab %}
{% endtabs %}

The fluent API syntax has following parts.

1. Start applying ruleset on a target using `.on`. The target can be an object instance or class.
2. Select a property from the target using `.ensure`.
3. Associate rules with the property using `.required`, `.matches` etc.
4. Customize the property rules using `.wthMessage`, `.when` etc.

## Specify validation target using `.on`

Be it is an object instance or class, both can be used as validation target using `.on`.

{% tabs %}
{% tab title="targeting instance" %}
```typescript
const person: Person = new Person(...);
validationRules
  .on(person);
```
{% endtab %}

{% tab title="targeting class" %}
```typescript
validationRules
  .on(Person);
```
{% endtab %}
{% endtabs %}

Specifying the target serves two purposes. Firstly, this initiates an empty collection of rules \(ruleset\) for the target. Secondly, this helps providing the typing information from the target to the subsequent methods which in turn provides with intellisense for the property names \(see next section\).

## Specifying target property for validation using `.ensure`

The `.ensure` method can be use used select a property of the target for validation. This adds an instance of `PropertyRule` to the ruleset for the object. The property can be defined using a string or an arrow function expression.

```typescript
validationRules
  .on(person)
  .ensure('name')                   // string literal
  //...
  .ensure((p) => p.age)             // arrow function expression
  //...
  .ensure("address.line1")          // nested property using string literal
  //...
  .ensure((p) => address.line2)     // nested property using an arrow function expression
  //...
```

With TypeScript support, intellisense is available for both the variants.

## Associating validation rules with property

After selecting a property with `.ensure` the next step is to associate rules. The rules can be built-in or custom. Irrespective of what kind of rule it is, at the low-level it is nothing but an instance of the rule class. For example, the "required" validation is implemented by the `RequiredRule` class. This will be more clear when you will define custom validation rules. However, let us take a look at the built-in rules first.

**`required`**

Considers the property to be valid if the value is not `null`, and not `undefined`. In case of string, it must not be empty.

```typescript
validationRules
  .on(person)
  .ensure('name')
    .required();
```

This instantiates a `RequiredRule` for the property.

{% embed url="https://stackblitz.com/edit/au2-validation-required?ctl=1" caption="" %}

> Note that this is the only built-in rule that considers `null`, `undefined`, or empty string as invalid value. The other built-in rules purposefully consider `null`, `undefined`, or empty string as valid value. This is done to ensure single responsibility for the built-in rules.

**`matches`**

Considers the string property to be valid if the value matches the given pattern described by a regular expression.

```typescript
validationRules
  .on(person)
  .ensure('name')
    .matches(/foo/); // name is valid if it contains the string 'foo'
```

This instantiates a `RegexRule` for the property.

{% embed url="https://stackblitz.com/edit/au2-validation-matches?ctl=1" caption="" %}

**`email`**

This also instantiates a `RegexRule` for the property, but with a specific regex for matching emails.

```typescript
validationRules
  .on(person)
  .ensure('email')
    .email();     // person's email need to be valid
```

{% embed url="https://stackblitz.com/edit/au2-validation-email?ctl=1" caption="" %}

**`minLength`**

Considers the string property to be valid if the value is at least of the specified length. Under the hood, it instantiates a `LengthRule` with minimum length constraint.

```typescript
validationRules
  .on(person)
  .ensure('name')
    .minLength(42);     // name must be at least 42 characters long
```

{% embed url="https://stackblitz.com/edit/au2-validation-minlength?ctl=1" caption="" %}

**`maxLength`**

Considers the string property to be valid if the value is at most of the specified length. Under the hood, it instantiates a `LengthRule` with maximum length constraint.

```typescript
validationRules
  .on(person)
  .ensure('name')
    .maxLength(42);     // name must be at most 42 characters long
```

{% embed url="https://stackblitz.com/edit/au2-validation-maxlength?ctl=1" caption="" %}

**`minItems`**

Considers the collection \(array\) property to be valid if the array has at least the number of items specified by the constraint. Under the hood, it instantiates a `SizeRule` with minimum size constraint.

```typescript
validationRules
  .on(person)
  .ensure('pets')
    .minItems(42);    // a person should have at least 42 pets
```

{% embed url="https://stackblitz.com/edit/au2-validation-minitems?ctl=1" caption="" %}

**`maxItems`**

Considers the collection \(array\) property to be valid if the array has at most the number of items specified by the constraint. Under the hood, it instantiates a `SizeRule` with maximum size constraint.

```typescript
validationRules
  .on(person)
  .ensure('pets')
    .maxItems(42);    // a person should have at most 42 pets
```

{% embed url="https://stackblitz.com/edit/au2-validation-maxitems?ctl=1" caption="" %}

**`min`**

Considers the numeric property to be valid if the value is greater than or equal to the given lower bound. Under the hood, it instantiates a `RangeRule` with `[min,]` interval \(if your unfamiliar with the interval notation, you can refer [this](https://en.wikipedia.org/wiki/Interval_%28mathematics%29#Classification_of_intervals).

```typescript
validationRules
  .on(person)
  .ensure('age')
   .min(42);     // a person should be at least 42 years old
```

{% embed url="https://stackblitz.com/edit/au2-validation-min?ctl=1" caption="" %}

**`max`**

Considers the numeric property to be valid if the value is less than or equal to the given upper bound. Under the hood, it instantiates a `RangeRule` with `[,max]` interval \(if your unfamiliar with the interval notation, you can refer [this](https://en.wikipedia.org/wiki/Interval_%28mathematics%29#Classification_of_intervals).

```typescript
validationRules
  .on(person)
  .ensure('age')
   .max(42);     // a person should be at most 42 years old
```

{% embed url="https://stackblitz.com/edit/au2-validation-max?ctl=1" caption="" %}

**`range`**

Considers the numeric property to be valid if the value is greater than or equal to the given lower bound and less than or equal to the given upper bound. Under the hood, it instantiates a `RangeRule` with `[min,max]` interval \(if your unfamiliar with the interval notation, you can refer [this](https://en.wikipedia.org/wiki/Interval_%28mathematics%29#Classification_of_intervals).

```typescript
validationRules
  .on(person)
  .ensure('age')
   .range(42, 84);     // a person's age should be between 42 and 84 or equal to these values
```

{% embed url="https://stackblitz.com/edit/au2-validation-range?ctl=1" caption="" %}

**`between`**

Considers the numeric property to be valid if the value is strictly greater than the given lower bound and strictly less than the given upper bound. If the value matches any of the boundary value, it is considered invalid. Under the hood, it instantiates a `RangeRule` with `(min,max)` interval \(if your unfamiliar with the interval notation, you can refer [this](https://en.wikipedia.org/wiki/Interval_%28mathematics%29#Classification_of_intervals).

```typescript
validationRules
  .on(person)
  .ensure('age')
   .between(42, 84);     // a person's age should be between 42 and 84, but cannot be equal to any these values
```

{% embed url="https://stackblitz.com/edit/au2-validation-between?ctl=1" caption="" %}

**`equals`**

Considers the property to be valid if the value is strictly equal to the expected value. Under the hood, it instantiates a `EqualsRule`.

```typescript
validationRules
  .on(person)
  .ensure('name')
   .equals('John Doe');  // Only people named 'John Doe' are valid
```

{% embed url="https://stackblitz.com/edit/au2-validation-equals?ctl=1" caption="" %}

> Have you noticed that the same rule implementation is "alias"ed for multiple validation rules? You will get know another aspect of aliasing rules in the [customizing validation messages](defining-rules.md#customizing-rules) section.

**Custom rules**

There are two ways custom rules can be defined.

* `satisfies`

  This is the easiest way of defining a custom rule using an arrow function that has loosely the following signature.

  ```typescript
    (value: any, object?: any) => boolean | Promise<boolean>;
  ```

  The value of the first argument provides the value being validated, whereas the value of the second argument provides the containing object. You can use it as follows.

  ```typescript
    // Let us assume that we do not want to accept "John Doe"s as the input for name
    const testNames = [ "John Doe", "Max Mustermann" ];
    validationRules
      .on(person)
      .ensure('name')
        .satisfies((name) => !testNames.includes(name));
  ```

  This is useful for the rules that are used only in one place. For example, in one of view-model you need to apply a very specific rule that is not needed elsewhere. However, if you want to reuse you rule, then you need to use the `satisfiesRule`.

{% embed url="https://stackblitz.com/edit/au2-validation-satisfies?ctl=1" caption="" %}

* `satisfiesRule`

  This lets reuse a rule implementation. For this we need to remember two things. Firstly, as mentioned before at the [start of this section](defining-rules.md#associating-validation-rules-with-property) any rule can be applied on a property just by instantiating the rule, and associating with the property. Secondly, every rule needs to be a subtype of `BaseValidationRule`, as discussed in [before](architecture.md#how-does-it-work).

  The method `satisfiesRule` accepts such an instance of a rule implementation and associates it with the property. It can be used as follows.

  ```typescript
  import { BaseValidationRule, IValidateable } from '@aurelia/validation';

  class NotTestName extends BaseValidationRule {
    public constructor(
      private testNames: string[],
    ) {
      super();
    }
    public execute(value: any, _object?: IValidateable): boolean {
      return !this.testNames.includes(value);
    }
  }

  //...

  validationRules
    .on(person)
    .ensure(name)
      .satisfiesRule(new NotTestName([ "John Doe", "Max Mustermann" ]));
  ```

{% embed url="https://stackblitz.com/edit/au2-validation-satisfiesrule?ctl=1" caption="" %}

You must have noticed that the API for the built rules instantiates a rule implementation. For example, the following two are synonymous.

```typescript
  validationRules
    .on(person)
    .ensure('name')
      .required();

  // same can be done by this as well
  import { RequiredRule } from "@aurelia/validation";

  validationRules
    .on(person)
    .ensure('name')
      .satisfiesRule(new RequiredRule());
```

Let us look at one last example before moving to next section. The following example implements a integer range rule by inheriting the `RangeRule`.

```typescript
  import { RangeRule } from "@aurelia/validation";

  class IntegerRangeRule extends RangeRule {
    public execute(value: any, object?: IValidateable): boolean {
      return value === null
      || value === undefined
      || (Number.isInteger(Number(value))
        && (this.isInclusive
          ? value >= this.min && value <= this.max
          : value > this.min && value < this.max
        ));
    }
  }

  //...

  validationRules
    .on(person)
    .ensure(age)
      .satisfiesRule(new IntegerRangeRule(true, { min:42, max: 84 })); // the age must between 42 and 84 (inclusive) and must be an integer.
```

{% embed url="https://stackblitz.com/edit/au2-validation-integerrangerule?ctl=1" caption="" %}

> In the light of using rule _instance_, note that the the lambda in `satisfies` is actually wrapped in an instance of anonymous subclass of `BaseValidationRule`.

**Defining rules for multiple objects**

Rules on multiple objects can be defined by simply using the API in sequence for multiple objects. An example is shown below.

```typescript
validationRules
  .on(person1)
  .ensure('name')
   .required()

  .on(person2)
  .ensure('age')
    .required()
```

Note that there is no limitation on how many times `on` is applied on an object or in what order. The following is a perfectly valid rule definition, although such definition can be difficult to understand.

```typescript
validationRules
  .on(person1)
  .ensure('name')
    .required()

  .on(person2)
  .ensure('name')
    .required()
  .ensure('age')
    .required()

  .on(person1)
  .ensure((o) => o.address.line1)
    .required()
  .on(person1)
    .ensure((o) => o.age)
      .required();
```

## Customizing rules

In this section you will learn about how to customize the rule definition. A common use-case of that will be to customize the validation messages, as in most of the cases, the default validation messages might not fit the real-life requirements. Apart from that this section also discusses further ways to change the chaining of the rules.

**Customize the display name**

By default, the display name of the property is computed by splitting on capital letters and capitalizing the first letter of the property name. For example, the property named `age` will appear as "Age" in the validation messages for `age`, or `firstName` becomes "First Name", etc. It is quite evident that this is limiting in a sense. However, the display name of the property can easily be changed using `.displayName`.

```typescript
validationRules
  .on(person)
  .ensure("address.line1")
    .displayName("First line of address")
    .required();  // results in validation message: "First line of address is required."
```

{% embed url="https://stackblitz.com/edit/au2-validation-displayname-navigationproperty?ctl=1" caption="" %}

Note that instead of a literal string, a function can also be used to customize the display name. The function signature is `() => string`; The following example shows a use case for this where the attempt for a guessing game is validated, and the attempt count is increased with each attempt and shown in the validation message. Note that some parts of the example is not yet discussed, but those will be addressed in respective sections.

{% embed url="https://stackblitz.com/edit/au2-validation-displayname-function?ctl=1" caption="" %}

**Customize the validation message**

Apart from customizing the display name, you can in fact customize the whole message. Messages can be customized on a per-instance basis or globally. Let us first consider the per-instance based customization.

For this, we need to use the `withMessage` method. The example below shows how it can be used to define different messages for different rule instances.

```typescript
validationRules
  .on(person)
  .ensure("address.line1")
    .required()
      .withMessage("Enter the address line1 to continue.")
    .maxLength(7)
      .withMessage("The address line1 is too long.");
```

{% embed url="https://stackblitz.com/edit/au2-validation-instance-based-message-customization?ctl=1" caption="" %}

The above examples shows usage of string literal as custom message. A message template can also be used instead. The expressions supported in the template are as follows.

* `$object`: The object being validated. Note that any property of the object can thus be accessed in the template.
* `$value`: The value being validated.
* `$displayName`: The display name of the property.
* `$propertyName`: The name of the property.
* `$rule`: The associated rule instance. This is useful to access the properties of the rule instance. For example, you have a custom validation rule, and you want to access the value of some of your rule property in the validation message, this property is what you need to use. This is used in the messages of `RangeRule` to access the "min", and "max" values of the rule instance.
* `$getDisplayName`: It is a function that returns the display name of another given property. This is useful if you want to create a message associating another property.

Let us look at the following example, to understand these better.

{% embed url="https://stackblitz.com/edit/au2-validation-message-template" caption="" %}

Apart from this the messages the can be customized globally. You must have noted that same rule implementations are aliased quite frequently. The same concept is used here as well.

The messages can be customized globally during registering the plugin, using the `CustomMessages` property of the configuration object.

{% tabs %}
{% tab title="main.ts" %}
```typescript
import { RequiredRule, RangeRule, } from '@aurelia/validation';
import { ValidationHtmlConfiguration } from '@aurelia/validation-html';
import Aurelia from 'aurelia';

const customMessages: ICustomMessage[] = [
  {
    rule: RequiredRule,
    aliases: [
      { name: 'required', defaultMessage: `\${$displayName} is non-optional.` }
    ],
  },
  {
    rule: RangeRule,
    aliases: [
      { name: 'min', defaultMessage: `\${$displayName} should be at least \${$rule.min}.` },
      { name: 'max', defaultMessage: `\${$displayName} should be at most \${$rule.max}.` },
      { name: 'range', defaultMessage: `\${$displayName} should be between or equal to \${$rule.min} and \${$rule.max}.` },
      { name: 'between', defaultMessage: `\${$displayName} should be between but not equal to \${$rule.min} and \${$rule.max}.` },
    ],
  },
  // ...
];

Aurelia
  .register(
    ValidationHtmlConfiguration
      .customize((options) => {
        options.CustomMessages = customMessages;
      })
  )
  .app(component)
  .start();
```
{% endtab %}
{% endtabs %}

You are encouraged to play with the following demo; define more rules, change the custom messages, etc. to see it in action.

{% embed url="https://stackblitz.com/edit/au2-validation-customizing-messages-globally?ctl=1" caption="" %}

Following is the complete list of default messages for the out of the box validation rules.

* `RequiredRule`

  | Alias | Message template |
  | :--- | :--- |
  | required | `${$displayName} is invalid.` |

* `RegexRule`

  | Alias | Message template |
  | :--- | :--- |
  | matches | `${$displayName} is not correctly formatted.` |
  | email | `${$displayName} is not a valid email.` |

* `LengthRule`

  | Alias | Message template |
  | :--- | :--- |
  | minLength | `${$displayName} must be at least ${$rule.length} character${$rule.length === 1 ? '' : 's'}.` |
  | maxLength | `${$displayName} cannot be longer than ${$rule.length} character${$rule.length === 1 ? '' : 's'}.` |

* `SizeRule`

  | Alias | Message template |
  | :--- | :--- |
  | minItems | `${$displayName} must contain at least ${$rule.count} item${$rule.count === 1 ? '' : 's'}.` |
  | maxItems | `${$displayName} cannot contain more than ${$rule.count} item${$rule.count === 1 ? '' : 's'}.` |

* `RangeRule`

  | Alias | Message template |
  | :--- | :--- |
  | min | `${$displayName} must be at least ${$rule.min}.` |
  | max | `${$displayName} must be at most ${$rule.max}.` |
  | range | `${$displayName} must be between or equal to ${$rule.min} and ${$rule.max}.` |
  | between | `${$displayName} must be between but not equal to ${$rule.min} and ${$rule.max}.` |

* `EqualsRule`

  | Alias | Message template |
  | :--- | :--- |
  | equals | `${$displayName} must be ${$rule.expectedValue}.` |

Note that a new key can also be added to any out of the box rule, and can be referred from the code using `withMessageKey`.

{% tabs %}
{% tab title="main.ts" %}
```typescript
import { RequiredRule, ICustomMessage } from '@aurelia/validation';
import { ValidationHtmlConfiguration } from '@aurelia/validation-html';
import Aurelia from 'aurelia';

const customMessages: ICustomMessage[] = [
  {
    rule: RequiredRule,
    aliases: [
      { name: 'foobar', defaultMessage: `\${$displayName} is required in foo bar.` }
    ],
  }
];

Aurelia
  .register(
    ValidationConfiguration
      .customize((options) => {
        options.CustomMessages = customMessages;
      })
  )
  .app(component)
  .start();
```
{% endtab %}

{% tab title="awesome-component.ts" %}
```typescript
// ...
validationRules
  .on(person)
  .ensure('name')
    .required()
      .withMessageKey('foobar');
// ...
```
{% endtab %}
{% endtabs %}

{% embed url="https://stackblitz.com/edit/au2-validation-withmessagekey?ctl=1" caption="" %}

If you want to define aliases for your custom rules, you need to decorate the rule class with `validationRule`.

```typescript
import { validationRule, BaseValidationRule } from '@aurelia/validation';

@validationRule({
  aliases: [
    { name: 'key1', defaultMessage: `Message1` },
    { name: 'key2', defaultMessage: `Message2` },
  ]
})
class CustomRule extends BaseValidationRule {
  //...
}
```

Then you can refer the second message by using `.withMessageKey('key2')`. Refer the demo below, to see this in action.

{% embed url="https://stackblitz.com/edit/au2-validation-withmessagekey-custom-rule?ctl=1" caption="" %}

**Conditional Rule**

Often you would want to execute a rule conditionally. This can be done using the `.when` method. This method takes a function, with signature `(object: any) => boolean`, as input which is later evaluated during rule evaluation to decide whether or not to execute this rule. The `object` in the argument of the function is the object being validated.

```typescript
validationRules
  .on(person)
    .ensure("guardianName")
      .required()
      .when((p) => p.age < 18 ); // guardianName is required for a minor
```

{% embed url="https://stackblitz.com/edit/au2-validation-conditional?ctl=1" caption="" %}

**Sequencing Rules**

When multiple rules are defined on a property, the rules are all executed on parallel. Using `then`, the rules can be chained and executed serially. This means that if the first rule fails, the second rule is not executed. A common example is shown below.

```typescript
validationRules
  .on(person)
    .ensure('email')
      .required()
      .email()
      .then()
      .satisfiesRule(new UniqueRule());
```

Assuming there is an implementation of `UniqueRule` that validates the data against the records, existing in data store/backend service. Such rules can be expensive in nature, and thus it makes sense to execute those when all other preconditions are validated. In the above example if either of the `required` or `email` rules fails, the `UniqueRule` will never be executed. Verify this in the demo shown below.

{% embed url="https://stackblitz.com/edit/au2-validation-sequence?ctl=1" caption="" %}

## Validating object

So far we have seen how to define validation rules on properties. Validation rules can also be applied on an object using `ensureObject`, and validate the object as a whole.

```typescript
validationRules
  .on(person)
    .ensureObject()
      .satisfies((p) => p.name === 'Foo' && p.age === 42);
```

{% embed url="https://stackblitz.com/edit/au2-validation-validating-object?ctl=1" caption="" %}

## Validator and validate instruction

In all the demos so far we have seen usage of validation controller. Under the hood, validation controller uses the `IValidator` API to perform the validation.

Loosely the interface looks as follows.

```typescript
interface IValidator {
  validate(instruction: ValidateInstruction<any>): Promise<ValidationResult[]>;
}
```

It has only a single method called `validate`, which accepts an instruction that describes what needs to be be validated.

The plugin ships a standard implementation of the `IValidator` interface. This can be injected to manually perform the validation on objects. Note that validator is the core component that executes the validation rules without any connection with the view. This is the main difference between validator and validation controller. The following example shows how to use it.

```typescript
export class AwesomeComponent {

  private person: Person;
  private errors: string[];

  public constructor(
     private validator: IValidator = resolve(IValidator),
     validationRules: IValidationRules = resolve(IValidationRules)
  ) {
      this.person = new Person();
      validationRules
        .on(this.person)
          .ensure("name")
            .required();
    }

  public async submit(){
    const result = await this.validator.validate(new ValidateInstruction(this.person));
    console.log(result);
    this.errors = result.filter((r) => !r.valid).map((r) => r.message);
  }
}
```

{% embed url="https://stackblitz.com/edit/au2-validation-validator?ctl=1" caption="" %}

> An important aspect of the demo above is that it shows how to use `@aurelia/validation` without the `@aurelia/validation-html`.

Let us now focus on the `ValidateInstruction`, which basically instructs the validator, on what to validate. The instruction can be manipulated using the following optional class properties.

* `object`: The object to validate.
* `propertyName`: The property name to validate.
* `rules`: The specific rules to execute.
* `objectTag`: When present instructs to validate only specific ruleset defined for a object. Tagging is discussed in detail in the respective [section](tagging-rules.md)
* `propertyTag`: When present instructs to validate only specific ruleset for a property. Tagging is discussed in detail in the respective [section](tagging-rules.md)

Some of the useful combinations are as follows.

| `object` | `propertyName` | `rules` | `objectTag` | `propertyTag` | Details |
| :--- | :--- | :--- | :--- | :--- | :--- |
| ✔ |  |  |  |  | The default ruleset defined on the instance or the class are used for validation. |
| ✔ | ✔ |  |  |  | Only the rules defined for the particular property are used for validation. |
| ✔ |  | ✔ | - |  | Only the specified rules are used for validation. |
| ✔ | ✔ | ✔ | - |  | Only the specified rules that are associated with the property are used for validation. |
| ✔ |  |  | ✔ |  | Only the tagged ruleset for the object is used for validation. |
| ✔ | ✔ |  | ✔ |  | Only the rules for the property in the tagged ruleset are used for validation. |
| ✔ | ✔ |  | ✔ | ✔ | Only the tagged rules for the property in the tagged ruleset for the object are validated. |

Note that in the presence of `rules` the `objectTag` is ignored. However, we strongly encourage the usage of tags for executing specific set of rules. You can find more details on tagging in [Tagging rules](tagging-rules.md) section. Note that the validate instruction is also respected by [validation controller](validation-controller.md).

