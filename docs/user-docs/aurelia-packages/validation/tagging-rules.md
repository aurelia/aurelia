---
description: >-
  Creating groups of tagged rules to allow for re-use of Aurelia Validation
  rules.
---

# Tagging Rules

Tagging rules involves marking a rule or ruleset for a property or an object with a string identifier, namely a tag. Later, the tag can be used to execute a specific set of rules selectively. Note that every set of rules defined on an object has a tag. When the tag is omitted, a default tag for the ruleset is used for the objects.

Tags can be defined both with objects and properties. Refer to the following examples.

```typescript
/* tagged rule definition */

// default tag
validationRules
  .on(person)
  .ensure('name')

// specific tags on object
validationRules
  .on(person, 'ruleset1')
  //...
  .on(person, 'ruleset2')
  //...

// specific tag on property rules
validationRules
  .on(person)
    .ensure('name')
      .minLength(42)
        .tag('ruleset1')
      .minLength(84)
        .tag('ruleset2')


/* executing tagged rules */

// default tag
validator.validate(new ValidateInstruction(person));
validator.validate(new ValidateInstruction(person, 'name'));

// specific object tag
validator.validate(new ValidateInstruction(person, undefined, 'ruleset1'));

// specific property tag
validator.validate(new ValidateInstruction(person, 'name', undefined, 'ruleset1'));
```

{% embed url="https://stackblitz.com/edit/au2-validation-tagging-rules?ctl=1" %}
