import { DI, Class } from '@aurelia/kernel';
import {
  ValidationConfiguration,
  IValidator,
  StandardValidator,
  PropertyRule,
  IValidateable,
  ValidationResult,
  IValidationRules,
  RegexRule,
  LengthRule,
  RequiredRule,
  SizeRule,
  EqualsRule
} from '@aurelia/validation';
import { assert } from '@aurelia/testing';
import { Person, Address, Organization } from './_test-resources';

describe.only('IValidator', function () {
  function setup(validator?: Class<IValidator>) {
    const container = DI.createContainer();
    container.register(
      validator
        ? ValidationConfiguration.customize((options) => {
          options.validator = validator;
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
      public validateProperty(object: IValidateable, propertyName: string, rules?: PropertyRule[]): Promise<ValidationResult[]> {
        throw new Error('Method not implemented.');
      }
      public validateObject(object: IValidateable, rules?: PropertyRule[]): Promise<ValidationResult[]> {
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

describe.only('StandardValidator', function () {
  function setup() {
    const container = DI.createContainer();
    container.register(ValidationConfiguration);
    return {
      sut: container.get(IValidator),
      validationRules: container.get(IValidationRules),
      container
    };
  }

  it('validates all rules by default for an object property', async function () {
    const { sut, validationRules } = setup();
    const message1 = 'message1', message2 = 'message2';
    const obj: Person = new Person('test', (void 0)!, (void 0)!);
    validationRules
      .on(obj)
      .ensure(o => o.name)
      .matches(/foo/)
      .withMessage(message1)
      .minLength(42)
      .withMessage(message2);

    const result = await sut.validateProperty(obj, 'name');
    assert.equal(result.length, 2);

    assert.equal(result[0].valid, false);
    assert.equal(result[0].propertyName, 'name');
    assert.equal(result[0].message, message1);
    assert.equal(result[0].object, obj);
    assert.instanceOf(result[0].rule, RegexRule);

    assert.equal(result[1].valid, false);
    assert.equal(result[1].propertyName, 'name');
    assert.equal(result[1].message, message2);
    assert.equal(result[1].object, obj);
    assert.instanceOf(result[1].rule, LengthRule);
  });

  it('if given, validates only the specific rules for an object property', async function () {
    const { sut, validationRules } = setup();
    const message1 = 'message1', message2 = 'message2';
    const obj: Person = new Person('test', (void 0)!, (void 0)!);
    const rules = validationRules
      .on(obj)
      .ensure(o => o.name)
      .matches(/foo/)
      .withMessage(message1)
      .minLength(42)
      .withMessage(message2)
      .rules[0];
    const rule = new PropertyRule(
      rules['validationRules'],
      rules['messageProvider'],
      rules.property,
      [[rules.$rules[0][0]]]);

    const result = await sut.validateProperty(obj, 'name', [rule]);
    assert.equal(result.length, 1);

    assert.equal(result[0].valid, false);
    assert.equal(result[0].propertyName, 'name');
    assert.equal(result[0].message, message1);
    assert.equal(result[0].object, obj);
    assert.instanceOf(result[0].rule, RegexRule);
  });

  it('validates all rules by default for an object', async function () {
    const { sut, validationRules } = setup();
    const message1 = 'message1', message2 = 'message2';
    const obj: Person = new Person((void 0)!, (void 0)!, { line1: 'invalid' } as any as Address);
    validationRules
      .on(obj)

      .ensure(o => o.name)
      .required()
      .withMessage(message1)

      .ensure(o => o.age)
      .required()
      .withMessage(message2)

      .ensure(o => o.address.line1)
      .matches(/foo/)
      .withMessage("\${$value} does not match pattern");

    const result = await sut.validateObject(obj);
    assert.equal(result.length, 3);

    assert.equal(result[0].valid, false, 'expected name to be invalid');
    assert.equal(result[0].propertyName, 'name');
    assert.equal(result[0].message, message1);
    assert.equal(result[0].object, obj);
    assert.instanceOf(result[0].rule, RequiredRule);

    assert.equal(result[1].valid, false, 'expected age to be invalid');
    assert.equal(result[1].propertyName, 'age');
    assert.equal(result[1].message, message2);
    assert.equal(result[1].object, obj);
    assert.instanceOf(result[1].rule, RequiredRule);

    assert.equal(result[2].valid, false, 'expected address.line1 to be invalid');
    assert.equal(result[2].propertyName, 'address.line1');
    assert.equal(result[2].message, "invalid does not match pattern");
    assert.equal(result[2].object, obj);
    assert.instanceOf(result[2].rule, RegexRule);
  });

  it('if given, validates only the specific rules for an object', async function () {
    const { sut, validationRules } = setup();
    const message1 = 'message1', message2 = 'message2';
    const obj: Person = new Person((void 0)!, (void 0)!, (void 0)!);
    const rules = validationRules
      .on(obj)

      .ensure(o => o.name)
      .required()
      .withMessage(message1)

      .ensure(o => o.age)
      .required()
      .withMessage(message2)

      .rules;

    const result = await sut.validateObject(obj, [rules[0]]);
    assert.equal(result.length, 1);

    assert.equal(result[0].valid, false);
    assert.equal(result[0].propertyName, 'name');
    assert.equal(result[0].message, message1);
    assert.equal(result[0].object, obj);
    assert.instanceOf(result[0].rule, RequiredRule);
  });

  it('can validate collection', async function () {
    const { sut, validationRules } = setup();
    const message1 = 'message1';
    const obj: Organization = new Organization([], (void 0)!);
    validationRules
      .on(obj)

      .ensure(o => o.employees)
      .minItems(1)
      .withMessage(message1);

    const result = await sut.validateObject(obj);
    assert.equal(result.length, 1);

    assert.equal(result[0].valid, false);
    assert.equal(result[0].propertyName, 'employees');
    assert.equal(result[0].message, message1);
    assert.equal(result[0].object, obj);
    assert.instanceOf(result[0].rule, SizeRule);
  });

  it('can validate collection by index', async function () {
    const { sut, validationRules } = setup();
    const message1 = 'message1', message2 = 'message2';
    const obj = { coll: [{ a: 1 }, { a: 2 }] };
    validationRules
      .on(obj)

      .ensure(o => o.coll[0].a)
      .equals(11)
      .withMessage(message1)

      .ensure(o => o.coll[1].a)
      .equals(11)
      .withMessage(message2);

    const result = await sut.validateObject(obj);
    assert.equal(result.length, 2);

    assert.equal(result[0].valid, false);
    assert.equal(result[0].propertyName, 'coll[0].a');
    assert.equal(result[0].message, message1);
    assert.equal(result[0].object, obj);
    assert.instanceOf(result[0].rule, EqualsRule);

    assert.equal(result[1].valid, false);
    assert.equal(result[1].propertyName, 'coll[1].a');
    assert.equal(result[1].message, message2);
    assert.equal(result[1].object, obj);
    assert.instanceOf(result[1].rule, EqualsRule);
  });
});
