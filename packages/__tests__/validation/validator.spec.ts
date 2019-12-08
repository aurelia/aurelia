import { DI, Class } from '@aurelia/kernel';
import {
  ValidationConfiguration,
  IValidator,
  StandardValidator,
  PropertyRule,
  IValidateable,
  ValidationResult,
  IValidationRules,
  RequiredRule,
  RegexRule
} from '@aurelia/validation';
import { assert } from '@aurelia/testing';
import { Person } from './_test-resources';

describe.only('IValidator', function () {
  function setup(validator?: Class<IValidator>) {
    const container = DI.createContainer();
    container.register(
      validator
        ? ValidationConfiguration.customize((options) => {
          options.validator = validator
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
      validateProperty(object: IValidateable<any>, propertyName: string, rules?: PropertyRule<IValidateable<any>, unknown>[]): Promise<ValidationResult[]> {
        throw new Error('Method not implemented.');
      }
      validateObject(object: IValidateable<any>, rules?: PropertyRule<IValidateable<any>, unknown>[]): Promise<ValidationResult[]> {
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

  it('validates an object property against all specified rules by default', async function () {
    const { sut, validationRules } = setup();
    const requiredMessage = 'name is required';
    const patternMessage = 'name must contain foo';

    const obj: Person = new Person((void 0)!, (void 0)!, (void 0)!);
    validationRules
      .on(obj)
      .ensure(o => o.name)
      .required()
      .withMessage(requiredMessage)
      // .matches(/foo/)
      // .withMessage(patternMessage)
      ;

    const result = await sut.validateProperty(obj, 'name');
    assert.equal(result.length, 1);
    // assert.equal(result.length, 2);

    assert.equal(result[0].valid, false);
    assert.equal(result[0].propertyName, 'name');
    assert.equal(result[0].message, requiredMessage);
    assert.equal(result[0].object, obj);
    assert.instanceOf(result[0].rule, RequiredRule);

    // assert.equal(result[1].valid, false);
    // assert.equal(result[1].propertyName, 'name');
    // assert.equal(result[1].message, patternMessage);
    // assert.equal(result[1].object, obj);
    // assert.instanceOf(result[1].rule, RegexRule);
  });
});
