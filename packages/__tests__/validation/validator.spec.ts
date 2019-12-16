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
  LengthRule
} from '@aurelia/validation';
import { assert } from '@aurelia/testing';
import { Person } from './_test-resources';

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

  it('validates only given rules for an object property', async function () {
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
});
