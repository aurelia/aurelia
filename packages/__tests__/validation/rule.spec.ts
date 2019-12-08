import { DI } from '@aurelia/kernel';
import { assert } from '@aurelia/testing';
import {
  ValidationConfiguration,
  IValidationRules,
  RequiredRule,
  LengthRule,
  RegexRule,
  RangeRule,
  EqualsRule,
  SizeRule,
  PropertyRule,
  ValidationRule,
  IValidateable,
  IValidationMessageProvider,
} from "@aurelia/validation";

describe.only('ValidationRules', function () {

  function setup() {
    const container = DI.createContainer();
    container.register(ValidationConfiguration);
    return { sut: container.get(IValidationRules), container };
  }

  it('is transient', function () {
    const { sut: instance1 } = setup();
    const { sut: instance2 } = setup();
    assert.equal(Object.is(instance1, instance2), false);
  });

  it('can be used to define validation rules fluenty on string properties', function () {
    const { sut } = setup();
    const propName = 'strProp';
    const rules = sut
      .ensure(propName)
      .required()
      .minLength(2)
      .maxLength(42)
      .matches(/foo/)
      .then()
      .email()
      .when(() => 'foo' as any === 'bar')
      .equals('foo@bar.com')
      .rules;

    assert.equal(rules.length, 1);
    const propertyRule = rules[0];
    assert.instanceOf(propertyRule, PropertyRule);
    assert.equal(propertyRule.property.name, propName);
    const propertyValidationRules = propertyRule.$rules;
    assert.equal(propertyValidationRules.length, 2);

    const [phase1Rules, phase2Rules] = propertyValidationRules;

    assert.equal(phase1Rules.length, 4);
    const [required, minLength, maxLength, matches] = phase1Rules as [RequiredRule, LengthRule, LengthRule, RegexRule];

    assert.instanceOf(required, RequiredRule);

    assert.instanceOf(minLength, LengthRule);
    assert.equal(minLength['isMax'], false);
    assert.equal(minLength['length'], 2);

    assert.instanceOf(maxLength, LengthRule);
    assert.equal(maxLength['isMax'], true);
    assert.equal(maxLength['length'], 42);

    assert.instanceOf(matches, RegexRule);
    assert.equal(matches['pattern'].source, 'foo');

    assert.equal(phase2Rules.length, 2);
    const [emailRule, equalRule] = phase2Rules as [RegexRule, EqualsRule];

    assert.instanceOf(emailRule, RegexRule);
    assert.notEqual(emailRule['pattern'], void 0);
    assert.equal(emailRule.canExecute(void 0), false);

    assert.instanceOf(equalRule, EqualsRule);
    assert.equal(equalRule['expectedValue'], 'foo@bar.com');
  });

  it('can be used to define validation rules fluenty on number properties', function () {
    const { sut } = setup();
    const propName = 'numProp';
    const rules = sut
      .ensure(propName)
      .required()
      .equals(40)
      .min(2)
      .max(42)
      .range(3, 41)
      .between(4, 40)
      .rules;

    assert.equal(rules.length, 1);
    const propertyRule = rules[0];
    assert.instanceOf(propertyRule, PropertyRule);
    assert.equal(propertyRule.property.name, propName);
    const propertyValidationRules = propertyRule.$rules;
    assert.equal(propertyValidationRules.length, 1);

    const [validationRules] = propertyValidationRules;

    assert.equal(validationRules.length, 6);
    const [required, equalRule, ...rangeRules] = validationRules as [RequiredRule, EqualsRule, RangeRule, RangeRule, RangeRule, RangeRule];

    assert.instanceOf(required, RequiredRule);
    assert.instanceOf(equalRule, EqualsRule);
    assert.equal(equalRule['expectedValue'], 40);

    const expected = [
      [2, Number.POSITIVE_INFINITY, true],
      [Number.NEGATIVE_INFINITY, 42, true],
      [3, 41, true],
      [4, 40, false],
    ];
    for (let i = 0, ii = expected.length; i < ii; i++) {
      const [min, max, isInclusive] = expected[i];
      const rule = rangeRules[i];
      assert.instanceOf(rule, RangeRule);
      assert.equal(rule['min'], min);
      assert.equal(rule['max'], max);
      assert.equal(rule['isInclusive'], isInclusive);
    }
  });

  it('can be used to define validation rules fluenty on collection properties', function () {
    const { sut } = setup();
    const propName = 'arrayProp';
    const rules = sut
      .ensure(propName)
      .minItems(24)
      .maxItems(42)
      .rules;

    assert.equal(rules.length, 1);
    const propertyRule = rules[0];
    assert.instanceOf(propertyRule, PropertyRule);
    assert.equal(propertyRule.property.name, propName);
    const propertyValidationRules = propertyRule.$rules;
    assert.equal(propertyValidationRules.length, 1);

    const [validationRules] = propertyValidationRules;
    assert.equal(validationRules.length, 2);

    const expected = [
      [24, false],
      [42, true],
    ];
    for (let i = 0, ii = expected.length; i < ii; i++) {
      const [count, isMax] = expected[i];
      const rule = validationRules[i] as SizeRule;
      assert.instanceOf(rule, SizeRule);
      assert.equal(rule['count'], count);
      assert.equal(rule['isMax'], isMax);
    }
  });

  it('can be used to define validation rules fluenty using lambda', function () {
    const { sut } = setup();
    const propName = 'fooBar';
    let executed = false;
    const rules = sut
      .ensure(propName)
      .satisfies((_value, _obj) => { executed = true; return 'foo' as any === 'bar'; })
      .rules;

    assert.equal(rules.length, 1);
    const propertyRule = rules[0];
    assert.instanceOf(propertyRule, PropertyRule);
    assert.equal(propertyRule.property.name, propName);
    const propertyValidationRules = propertyRule.$rules;
    assert.equal(propertyValidationRules.length, 1);

    const [validationRules] = propertyValidationRules;
    assert.equal(validationRules.length, 1);

    const customRule = validationRules[0];
    assert.instanceOf(customRule, ValidationRule);
    const result = customRule.execute(void 0, void 0);
    assert.equal(result, false);
    assert.equal(executed, true);
  });

  it('can be used to define custom validation rules fluenty', function () {
    const { sut, container } = setup();
    const propName = 'fooBar';
    let executed = false;
    class CustomRule extends ValidationRule {
      public executed: boolean = false;
      public execute(_value: any, _object?: IValidateable): boolean | Promise<boolean> {
        executed = true;
        return false;
      }
    }
    const rules = sut
      .ensure(propName)
      .satisfiesRule(new CustomRule(container.get(IValidationMessageProvider)))
      .rules;

    assert.equal(rules.length, 1);
    const propertyRule = rules[0];
    assert.instanceOf(propertyRule, PropertyRule);
    assert.equal(propertyRule.property.name, propName);
    const propertyValidationRules = propertyRule.$rules;
    assert.equal(propertyValidationRules.length, 1);

    const [validationRules] = propertyValidationRules;
    assert.equal(validationRules.length, 1);

    const customRule = validationRules[0];
    assert.instanceOf(customRule, CustomRule);
    const result = customRule.execute(void 0, void 0);
    assert.equal(result, false);
    assert.equal(executed, true);
  });

  it('can be used to define validation rules on different properties', function () {
    const { sut } = setup();
    const rules = sut

      .ensure('strProp')
      .required()
      .matches(/foo/)

      .ensure('numProp')
      .range(24, 42)

      .rules;

    assert.equal(rules.length, 2);
    const [rule1, rule2] = rules;
    assert.instanceOf(rule1, PropertyRule);
    assert.equal((rule1 as PropertyRule).property.name, 'strProp');
    assert.instanceOf(rule1.$rules[0][0], RequiredRule, 'exprected required rule');
    assert.instanceOf(rule1.$rules[0][1], RegexRule, 'exprected regex rule');

    assert.instanceOf(rule2, PropertyRule);
    assert.equal((rule2 as PropertyRule).property.name, 'numProp');
    assert.instanceOf(rule2.$rules[0][0], RangeRule, 'expected range rule');
  });
});
