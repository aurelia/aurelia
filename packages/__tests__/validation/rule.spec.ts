import { DI, ILogEvent, ISink, LogLevel, Metadata, Protocol, Registration } from '@aurelia/kernel';
import { Interpolation, PrimitiveLiteralExpression, LifecycleFlags } from '@aurelia/runtime';
import { assert, TestContext } from '@aurelia/testing';
import {
  EqualsRule,
  IValidateable,
  IValidationMessageProvider,
  IValidationRules,
  LengthRule,
  PropertyRule,
  RangeRule,
  RegexRule,
  RequiredRule,
  SizeRule,
  ValidationConfiguration,
  BaseValidationRule
} from "@aurelia/validation";
import { IPerson, Person } from './_test-resources';

describe.only('ValidationRules', function () {

  function setup() {
    const container = DI.createContainer();
    container.register(ValidationConfiguration);
    return { sut: container.get(IValidationRules), container };
  }

  it('is transient', function () {
    const { sut: instance1, container } = setup();
    const instance2 = container.get(IValidationRules);
    assert.equal(Object.is(instance1, instance2), false);
  });

  it('can be used to define validation rules fluenty on string properties', function () {
    const { sut } = setup();
    const propName = 'name';
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
    const propName = 'age';
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
    assert.instanceOf(customRule, BaseValidationRule);
    const result = customRule.execute(void 0, void 0);
    assert.equal(result, false);
    assert.equal(executed, true);
  });

  it('can be used to define custom validation rules fluenty', function () {
    const { sut, container } = setup();
    const propName = 'fooBar';
    let executed = false;
    class CustomRule extends BaseValidationRule {
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

      .ensure('name')
      .required()
      .matches(/foo/)

      .ensure('age')
      .range(24, 42)

      .rules;

    assert.equal(rules.length, 2);
    const [rule1, rule2] = rules;
    assert.instanceOf(rule1, PropertyRule);
    assert.equal((rule1 as PropertyRule).property.name, 'name');
    assert.instanceOf(rule1.$rules[0][0], RequiredRule, 'exprected required rule');
    assert.instanceOf(rule1.$rules[0][1], RegexRule, 'exprected regex rule');

    assert.instanceOf(rule2, PropertyRule);
    assert.equal((rule2 as PropertyRule).property.name, 'age');
    assert.instanceOf(rule2.$rules[0][0], RangeRule, 'expected range rule');
  });

  it('conslidates the rule based on property name', function () {
    const { sut } = setup();
    const rules = sut

      .ensure('name')
      .required()

      .ensure('age')
      .range(24, 42)

      .ensure('name')
      .matches(/foo/)

      .rules;

    assert.equal(rules.length, 2);
    const [rule1, rule2] = rules;
    assert.instanceOf(rule1, PropertyRule);
    assert.equal((rule1 as PropertyRule).property.name, 'name');
    assert.instanceOf(rule1.$rules[0][0], RequiredRule, 'exprected required rule');
    assert.instanceOf(rule1.$rules[0][1], RegexRule, 'exprected regex rule');

    assert.instanceOf(rule2, PropertyRule);
    assert.equal((rule2 as PropertyRule).property.name, 'age');
    assert.instanceOf(rule2.$rules[0][0], RangeRule, 'expected range rule');
  });

  it('can define metadata annotation for rules on an object', function () {
    const { sut } = setup();
    const obj: IPerson = { name: undefined, age: undefined };
    const rules = sut
      .on(obj)

      .ensure('name')
      .required()

      .ensure('age')
      .range(24, 42)

      .rules;

    assert.equal(Metadata.get(Protocol.annotation.keyFor('validation-rules'), obj), rules);
  });

  it('can define metadata annotation for rules on a class', function () {
    const { sut } = setup();
    const rules = sut
      .on(Person)

      .ensure('name')
      .required()

      .ensure('age')
      .range(24, 42)

      .rules;

    assert.equal(Metadata.get(Protocol.annotation.keyFor('validation-rules'), Person), rules);
  });

  it('can define rules on properties of an object using lambda expression', function () {
    const { sut } = setup();
    const obj: IPerson = { name: undefined, age: undefined, address: undefined };
    const rules = sut
      .on(obj)

      .ensure(function (o) { return o.name; })
      .required()

      .ensure((o) => o.age)
      .range(24, 42)

      .ensure((o) => o.address.line1)
      .required()

      .rules;

    assert.equal(Metadata.get(Protocol.annotation.keyFor('validation-rules'), obj), rules);

    const [rules1, rules2, rules3] = rules;
    assert.equal(rules1.property.name, 'name');
    assert.instanceOf(rules1.$rules[0][0], RequiredRule);
    assert.equal(rules2.property.name, 'age');
    assert.instanceOf(rules2.$rules[0][0], RangeRule);
    assert.equal(rules3.property.name, 'address.line1');
    assert.instanceOf(rules3.$rules[0][0], RequiredRule);
  });

  it('can define rules on properties of a class using lambda expression', function () {
    const { sut } = setup();

    const rules = sut
      .on(Person)

      .ensure((p) => p.name)
      .required()

      .ensure(function (p) { return p.age; })
      .range(24, 42)

      .ensure((o) => o.address.line1)
      .required()

      .rules;

    assert.equal(Metadata.get(Protocol.annotation.keyFor('validation-rules'), Person), rules);

    const [rules1, rules2, rules3] = rules;
    assert.equal(rules1.property.name, 'name');
    assert.instanceOf(rules1.$rules[0][0], RequiredRule);
    assert.equal(rules2.property.name, 'age');
    assert.instanceOf(rules2.$rules[0][0], RangeRule);
    assert.equal(rules3.property.name, 'address.line1');
    assert.instanceOf(rules3.$rules[0][0], RequiredRule);
  });
});

describe.only('ValidationMessageProvider', function () {
  class EventLog implements ISink {
    public log: ILogEvent[] = [];
    public emit(event: ILogEvent): void {
      this.log.push(event);
    }
  }
  function setup() {
    const container = TestContext.createHTMLTestContext().container;
    const eventLog = new EventLog();
    container.register(
      ValidationConfiguration,
      Registration.instance(ISink, eventLog)
    );
    return {
      sut: container.get(IValidationMessageProvider),
      container,
      eventLog
    };
  }

  [
    { message: "name is required", expectedType: PrimitiveLiteralExpression },
    { message: "${$displayName} is required", expectedType: Interpolation },
  ].map(({ message, expectedType }) =>
    it(`#parseMessage parses message correctly - ${message}`, function () {
      const { sut } = setup();
      assert.instanceOf(sut.parseMessage(message), expectedType);
    }));
  [
    "displayName",
    "propertyName",
    "value",
    "object",
    "config",
    "getDisplayName",
  ].map((property) =>
    it(`#parseMessage logs warning if the message contains contextual property expression w/o preceeding '$' - ${property}`, function () {
      const { sut, eventLog } = setup();

      const message = `\${${property}} foo bar`;
      sut.parseMessage(message);
      const log = eventLog.log;
      assert.equal(log.length, 1);
      assert.equal(log[0].severity, LogLevel.warn);
      assert.equal(
        log[0]
          .toString()
          .endsWith(`[WRN ValidationMessageProvider] Did you mean to use "$${property}" instead of "${property}" in this validation message template: "${message}"?`),
        true
      );
    }));

  ["${$parent} foo bar", "${$parent.prop} foo bar"].map((message) =>
    it(`#parseMessage throws error if the message contains '$parent' - ${message}`, function () {
      const { sut } = setup();

      assert.throws(
        () => {
          sut.parseMessage(message);
        },
        '$parent is not permitted in validation message expressions.'
      );
    }));

  [
    {
      title: 'RequiredRule',
      getRule: (sut: IValidationMessageProvider) => new RequiredRule(sut),
      bindingContext: { $displayName: 'FooBar' },
      expected: 'FooBar is required.',
    }
  ].map(({ title, getRule, bindingContext, expected }) =>
    it(`#getMessage returns the registered default message for a rule type - ${title}`, function () {
      const { sut, container } = setup();
      const scope = { bindingContext, overrideContext: (void 0)!, parentScope: (void 0)!, scopeParts: [] };
      const actual = sut.getMessage(getRule(sut)).evaluate(LifecycleFlags.none, scope, container);
      assert.equal(actual, expected);
    }));

  // it('#getMessageByKey returns t he default message if the key is not found', function () {
  //   const { sut } = setup();
  //   const actual: Interpolation = sut.getMessage('foobar') as Interpolation;
  //   assert.instanceOf(actual, Interpolation);
  //   assert.equal(actual.parts[1], ' is invalid.');
  // });
  [
    { arg1: 'foo', arg2: null, expected: 'Foo' },
    { arg1: 'fooBar', arg2: null, expected: 'Foo Bar' },
    { arg1: 'foo bar', arg2: null, expected: 'Foo bar' },
    { arg1: 'foo', arg2: undefined, expected: 'Foo' },
    { arg1: 'fooBar', arg2: undefined, expected: 'Foo Bar' },
    { arg1: 'foo bar', arg2: undefined, expected: 'Foo bar' },
    { arg1: 'foo', arg2: 'hello', expected: 'hello' },
    { arg1: 'foo', arg2: () => 'hello', expected: 'hello' },
  ].map(({ arg1, arg2, expected }) =>
    it(`#getDisplayName computes display name - (${arg1}, ${arg2?.toString() ?? Object.prototype.toString.call(arg2)}) => ${expected}`, function () {
      const { sut } = setup();
      assert.equal(sut.getDisplayName(arg1, arg2), expected);
    }));
});
