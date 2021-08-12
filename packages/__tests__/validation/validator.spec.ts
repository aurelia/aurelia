/* eslint-disable mocha/no-hooks, mocha/no-sibling-hooks */
import { DI, Class } from '@aurelia/kernel';
import {
  ValidationConfiguration,
  IValidator,
  StandardValidator,
  PropertyRule,
  ValidationResult,
  IValidationRules,
  RegexRule,
  LengthRule,
  RequiredRule,
  SizeRule,
  EqualsRule,
  PropertyAccessor,
  ValidateInstruction,
  ValidationRuleAliasMessage,
  IValidationRule,
} from '@aurelia/validation';
import { assert } from '@aurelia/testing';
import { Person, Address, Organization } from './_test-resources.js';

describe('validation/validator.spec.ts/IValidator', function () {
  function setup(validator?: Class<IValidator>) {
    const container = DI.createContainer();
    container.register(
      validator
        ? ValidationConfiguration.customize((options) => {
          options.ValidatorType = validator;
        })
        : ValidationConfiguration);
    return { sut: container.get(IValidator), container };
  }

  it('registered to Singleton StandardValidator by default', function () {
    const { sut: sut1, container } = setup();
    const sut2 = container.get(IValidator);

    assert.instanceOf(sut1, StandardValidator);
    assert.instanceOf(sut2, StandardValidator);
    assert.equal(Object.is(sut1, sut2), true);
  });

  it('can be registered to Singleton custom validator', function () {
    class CustomValidator implements IValidator {
      public validate(_: ValidateInstruction): Promise<ValidationResult[]> {
        throw new Error('Method not implemented.');
      }
    }
    const { sut: sut1, container } = setup(CustomValidator);
    const sut2 = container.get(IValidator);

    assert.instanceOf(sut1, CustomValidator);
    assert.instanceOf(sut2, CustomValidator);
    assert.equal(Object.is(sut1, sut2), true);
  });
});

describe('validation/validator.spec.ts/StandardValidator', function () {
  function setup() {
    const container = DI.createContainer();
    container.register(ValidationConfiguration);
    return {
      sut: container.get(IValidator),
      validationRules: container.get(IValidationRules),
      container
    };
  }

  function assertValidationResult<T extends IValidationRule>(
    result: ValidationResult,
    isValid: boolean,
    propertyName: string,
    obj: any,
    rule: Class<T>,
    message?: string,
  ) {
    assert.equal(result.valid, isValid);
    assert.equal(result.propertyName, propertyName);
    assert.equal(result.message, isValid ? void 0 : message);
    assert.equal(result.object, obj);
    assert.instanceOf(result.rule, rule);
  }

  for (const defineRuleOnClass of [true, false]) {
    const properties1 = [
      { title: 'string property', getProperty: () => 'name' as const },
      { title: 'lambda property', getProperty: () => ((o) => o.name) as PropertyAccessor },
    ];
    for (const { title, getProperty } of properties1) {
      it(`validates all rules by default for an object property - ${title}`, async function () {
        const { sut, validationRules } = setup();
        const message1 = 'message1', message2 = 'message2';
        const obj: Person = new Person('test', (void 0)!, (void 0)!);
        validationRules
          .on(defineRuleOnClass ? Person : obj)
          .ensure(getProperty() as any)
          .matches(/foo/)
          .withMessage(message1)
          .minLength(42)
          .withMessage(message2);

        let result = await sut.validate(new ValidateInstruction(obj, 'name'));
        assert.equal(result.length, 2);

        assertValidationResult(result[0], false, 'name', obj, RegexRule, message1);
        assertValidationResult(result[1], false, 'name', obj, LengthRule, message2);

        obj.name = 'foo'.repeat(15);
        result = await sut.validate(new ValidateInstruction(obj, 'name'));
        assert.equal(result.length, 2);

        assertValidationResult(result[0], true, 'name', obj, RegexRule);
        assertValidationResult(result[1], true, 'name', obj, LengthRule);

        validationRules.off();
      });

      it(`if given, validates only the specific rules for an object property - ${title}`, async function () {
        const { sut, validationRules, container } = setup();
        const message1 = 'message1', message2 = 'message2';
        const obj: Person = new Person('test', (void 0)!, (void 0)!);
        const rules = validationRules
          .on(defineRuleOnClass ? Person : obj)
          .ensure(getProperty() as any)
          .matches(/foo/)
          .withMessage(message1)
          .minLength(42)
          .withMessage(message2)
          .rules[0];
        const rule = new PropertyRule(
          container,
          rules['validationRules'],
          rules['messageProvider'],
          rules.property,
          [[rules.$rules[0][0]]]);

        let result = await sut.validate(new ValidateInstruction(obj, 'name', [rule]));
        assert.equal(result.length, 1);

        assertValidationResult(result[0], false, 'name', obj, RegexRule, message1);

        obj.name = 'foo';
        result = await sut.validate(new ValidateInstruction(obj, 'name', [rule]));
        assert.equal(result.length, 1);

        assertValidationResult(result[0], true, 'name', obj, RegexRule);

        validationRules.off();
      });
    }

    const properties2 = [
      {
        title: 'string property',
        getProperty1: () => 'name' as const,
        getProperty2: () => 'age' as const,
        getProperty3: () => 'address.line1' as const
      },
      {
        title: 'lambda property',
        getProperty1: () => ((o) => o.name) as PropertyAccessor,
        getProperty2: () => ((o) => o.age) as PropertyAccessor,
        getProperty3: () => ((o) => o.address.line1) as PropertyAccessor,
      },
    ];
    for (const { title, getProperty1, getProperty2, getProperty3 } of properties2) {
      it(`validates all rules by default for an object - ${title}`, async function () {
        const { sut, validationRules } = setup();
        const message1 = 'message1', message2 = 'message2';
        const obj: Person = new Person((void 0)!, (void 0)!, { line1: 'invalid' } as any as Address);
        validationRules
          .on(defineRuleOnClass ? Person : obj)

          .ensure(getProperty1() as any)
          .required()
          .withMessage(message1)

          .ensure(getProperty2() as any)
          .required()
          .withMessage(message2)

          .ensure(getProperty3() as any)
          .matches(/foo/)
          .withMessage('${$value} does not match pattern');

        let result = await sut.validate(new ValidateInstruction(obj));
        assert.equal(result.length, 3);

        assertValidationResult(result[0], false, 'name', obj, RequiredRule, message1);
        assertValidationResult(result[1], false, 'age', obj, RequiredRule, message2);
        assertValidationResult(result[2], false, 'address.line1', obj, RegexRule, 'invalid does not match pattern');

        obj.name = 'foo';
        obj.age = 42;
        obj.address.line1 = 'foo';
        result = await sut.validate(new ValidateInstruction(obj));
        assert.equal(result.length, 3);

        assertValidationResult(result[0], true, 'name', obj, RequiredRule);
        assertValidationResult(result[1], true, 'age', obj, RequiredRule);
        assertValidationResult(result[2], true, 'address.line1', obj, RegexRule);

        validationRules.off();
      });

      it(`if given, validates only the specific rules for an object - ${title}`, async function () {
        const { sut, validationRules } = setup();
        const message1 = 'message1', message2 = 'message2';
        const obj: Person = new Person((void 0)!, (void 0)!, (void 0)!);
        const rules = validationRules
          .on(defineRuleOnClass ? Person : obj)

          .ensure(getProperty1() as any)
          .required()
          .withMessage(message1)

          .ensure(getProperty2() as any)
          .required()
          .withMessage(message2)

          .rules;

        let result = await sut.validate(new ValidateInstruction(obj, void 0, [rules[0]]));
        assert.equal(result.length, 1);

        assertValidationResult(result[0], false, 'name', obj, RequiredRule, message1);

        obj.name = 'foo';
        result = await sut.validate(new ValidateInstruction(obj, void 0, [rules[0]]));
        assert.equal(result.length, 1);

        assertValidationResult(result[0], true, 'name', obj, RequiredRule);

        validationRules.off();
      });
    }

    const properties3 = [
      {
        title: 'string property',
        getProperty1: () => 'employees' as const,
      },
      {
        title: 'lambda property',
        getProperty1: () => ((o) => o.employees) as PropertyAccessor,
      },
    ];
    for (const { title, getProperty1 } of properties3) {
      it(`can validate collection - ${title}`, async function () {
        const { sut, validationRules } = setup();
        const message1 = 'message1';
        const obj: Organization = new Organization([], (void 0)!);
        validationRules
          .on(defineRuleOnClass ? Organization : obj)

          .ensure(getProperty1() as any)
          .minItems(1)
          .withMessage(message1);

        let result = await sut.validate(new ValidateInstruction(obj));
        assert.equal(result.length, 1);

        assertValidationResult(result[0], false, 'employees', obj, SizeRule, message1);

        obj.employees.push(new Person((void 0)!, (void 0)!, (void 0)!));
        result = await sut.validate(new ValidateInstruction(obj));
        assert.equal(result.length, 1);

        assertValidationResult(result[0], true, 'employees', obj, SizeRule);

        validationRules.off();
      });
    }

    it(`validates only tagged rules for property when provided`, async function () {
      const { sut, validationRules } = setup();
      const message1 = 'message1', message2 = 'message2';
      const obj: Person = new Person('test', (void 0)!, (void 0)!);
      const tag = 'foo';
      validationRules
        .on(defineRuleOnClass ? Person : obj)
        .ensure('name')
        .matches(/foo/)
        .withMessage(message1)
        .tag(tag)
        .minLength(42)
        .withMessage(message2);

      const result = await sut.validate(new ValidateInstruction(obj, 'name', void 0, void 0, tag));
      assert.equal(result.length, 1);

      assertValidationResult(result[0], false, 'name', obj, RegexRule, message1);
      validationRules.off();
    });

    it(`validates only tagged rules for property when provided with specific rules`, async function () {
      const { sut, validationRules } = setup();
      const message1 = 'message1', message2 = 'message2';
      const obj: Person = new Person('test', (void 0)!, (void 0)!);
      const tag = 'foo';
      const rules = validationRules
        .on(defineRuleOnClass ? Person : obj)
        .ensure('name')
        .matches(/foo/)
        .withMessage(message1)
        .tag(tag)
        .minLength(42)
        .withMessage(message2)
        .rules;

      const result = await sut.validate(new ValidateInstruction(obj, 'name', rules, void 0, tag));
      assert.equal(result.length, 1);

      assertValidationResult(result[0], false, 'name', obj, RegexRule, message1);
      validationRules.off();
    });

    it(`validates only tagged rules for object when provided with specific rules`, async function () {
      const { sut, validationRules: rules } = setup();
      const obj: Person = new Person((void 0)!, (void 0)!, (void 0)!);
      const tag1 = 'tag1', tag2 = 'tag2';

      rules
        .on(defineRuleOnClass ? Person : obj, tag1)
        .ensure('name')
        .required()

        .on(defineRuleOnClass ? Person : obj, tag2)
        .ensure('age')
        .required();

      const result1 = await sut.validate(new ValidateInstruction(obj, void 0, void 0, tag1));
      const result2 = await sut.validate(new ValidateInstruction(obj, void 0, void 0, tag2));

      assert.deepEqual(result1.map((r) => r.toString()), ['Name is required.']);
      assert.deepEqual(result2.map((r) => r.toString()), ['Age is required.']);

      rules.off();
    });

    it(`validates the default ruleset by default`, async function () {
      const { sut, validationRules: rules } = setup();
      const obj: Person = new Person((void 0)!, (void 0)!, (void 0)!);
      const tag1 = 'tag1';

      rules
        .on(defineRuleOnClass ? Person : obj)
        .ensure('name')
        .required()

        .on(obj, tag1)
        .ensure('age')
        .required();

      const result1 = await sut.validate(new ValidateInstruction(obj));

      assert.deepEqual(result1.map((r) => r.toString()), ['Name is required.']);

      rules.off();
    });

    it(`respects registered custom message key`, async function () {
      const { sut, validationRules: rules } = setup();

      const messageKey = 'fooBarFizBaz';
      const displayName = 'FooBar';
      const defaultRequiredRulesMessages = ValidationRuleAliasMessage.getDefaultMessages(RequiredRule);
      const customMessages = {
        rule: RequiredRule,
        aliases: [
          { name: messageKey, defaultMessage: '${$displayName} foobar fizbaz' }
        ],
      };
      ValidationRuleAliasMessage.setDefaultMessage(RequiredRule, customMessages);

      const person: Person = new Person((void 0)!, (void 0)!, { line1: (void 0)!, city: (void 0)!, pin: (void 0)! });

      rules
        .on(defineRuleOnClass ? Person : person)
        .ensure('name')
        .displayName(displayName)
        .required()
        .withMessageKey(messageKey)
        .ensure('age')
        .required()
        .withMessageKey('required')
        .ensure((p) => p.address.line1)
        .required()
        ;

      const result1 = await sut.validate(new ValidateInstruction(person));

      assert.deepEqual(result1.map((r) => r.toString()), ['FooBar foobar fizbaz', 'Age is required.', 'Address.line1 is required.']);

      ValidationRuleAliasMessage.setDefaultMessage(RequiredRule, { aliases: defaultRequiredRulesMessages }, false);

      rules.off();
    });
  }

  const properties4 = [
    {
      title: 'string property',
      getProperty1: () => 'coll[0].a' as const,
      getProperty2: () => 'coll[1].a' as const,
    },
    {
      title: 'lambda property',
      getProperty1: () => ((o) => o.coll[0].a) as PropertyAccessor,
      getProperty2: () => ((o) => o.coll[1].a) as PropertyAccessor,
    },
  ];
  for (const { title, getProperty1, getProperty2 } of properties4) {
    it(`can validate collection by index - ${title}`, async function () {
      const { sut, validationRules } = setup();
      const message1 = 'message1', message2 = 'message2';
      const obj = { coll: [{ a: 1 }, { a: 2 }] };
      validationRules
        .on(obj)

        .ensure(getProperty1() as any)
        .equals(11)
        .withMessage(message1)

        .ensure(getProperty2() as any)
        .equals(11)
        .withMessage(message2);

      let result = await sut.validate(new ValidateInstruction(obj));
      assert.equal(result.length, 2);

      assertValidationResult(result[0], false, 'coll[0].a', obj, EqualsRule, message1);
      assertValidationResult(result[1], false, 'coll[1].a', obj, EqualsRule, message2);

      obj.coll[0].a = 11;
      obj.coll[1].a = 11;
      result = await sut.validate(new ValidateInstruction(obj));
      assert.equal(result.length, 2);

      assertValidationResult(result[0], true, 'coll[0].a', obj, EqualsRule);
      assertValidationResult(result[1], true, 'coll[1].a', obj, EqualsRule);

      validationRules.off();
    });
  }

  const properties5 = [
    { title: 'string property', getProperty1: () => 'subprop[\'a\']' as const },
    { title: 'lambda property', getProperty1: () => ((o) => o.subprop['a']) as PropertyAccessor },
  ];
  for (const { title, getProperty1 } of properties5) {
    it(`can validate indexed property - ${title}`, async function () {
      const { sut, validationRules } = setup();
      const message1 = 'message1';
      const obj = { subprop: { a: 1 } };
      validationRules
        .on(obj)

        .ensure(getProperty1() as any)
        .equals(11)
        .withMessage(message1);

      let result = await sut.validate(new ValidateInstruction(obj));
      assert.equal(result.length, 1);

      assertValidationResult(result[0], false, 'subprop[\'a\']', obj, EqualsRule, message1);

      obj.subprop.a = 11;
      result = await sut.validate(new ValidateInstruction(obj));
      assert.equal(result.length, 1);

      assertValidationResult(result[0], true, 'subprop[\'a\']', obj, EqualsRule);

      validationRules.off();
    });
  }

  it(`can be used to validate an object with custom validation rule`, async function () {
    const { sut, validationRules: rules } = setup();
    const people: Person[] = [new Person((void 0)!, (void 0)!, (void 0)!), new Person((void 0)!, (void 0)!, (void 0)!)];
    const obj = { a: 1, b: 1 };
    const msg1 = 'not foobar';
    const msg2 = 'not the answer';

    rules
      .on(people)
      .ensureObject()
      .satisfies((o: Person[]) => o[0].name === 'foo' && o[1].name === 'bar')
      .withMessage(msg1)

      .on(obj)
      .ensure('b')
      .equals(42)
      .ensureObject()
      .satisfies((o: typeof obj) => o.a === 42)
      .withMessage(msg2);

    const result1 = await sut.validate(new ValidateInstruction(people));
    const result2 = await sut.validate(new ValidateInstruction(obj));

    assert.deepEqual(result1.map((r) => r.toString()), [msg1]);
    assert.deepEqual(result2.map((r) => r.toString()), ['B must be 42.', msg2]);

    rules.off();
  });
});
