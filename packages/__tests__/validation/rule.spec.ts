/* eslint-disable no-constant-condition */
import { DI, ILogEvent, ISink, LogLevel, Metadata, Protocol, Registration } from '@aurelia/kernel';
import { Interpolation, PrimitiveLiteralExpression, LifecycleFlags, IExpressionParser, BindingType } from '@aurelia/runtime';
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
  BaseValidationRule,
  ICustomMessage,
  parsePropertyName
} from '@aurelia/validation';
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
  function setup(customMessages?: ICustomMessage[]) {
    const container = TestContext.createHTMLTestContext().container;
    const eventLog = new EventLog();

    const configuration = customMessages !== (void 0)
      ? ValidationConfiguration.customize((options) => {
        options.customMessages = customMessages;
      })
      : ValidationConfiguration;
    container.register(
      configuration,
      Registration.instance(ISink, eventLog)
    );
    return {
      sut: container.get(IValidationMessageProvider),
      container,
      eventLog
    };
  }

  [
    { message: 'name is required', expectedType: PrimitiveLiteralExpression },
    { message: '${$displayName} is required', expectedType: Interpolation },
  ].map(({ message, expectedType }) =>
    it(`#parseMessage parses message correctly - ${message}`, function () {
      const { sut } = setup();
      assert.instanceOf(sut.parseMessage(message), expectedType);
    }));
  [
    'displayName',
    'propertyName',
    'value',
    'object',
    'config',
    'getDisplayName',
  ].map((property) =>
    it(`#parseMessage logs warning if the message contains contextual property expression w/o preceeding '$' - ${property}`, function () {
      const { sut, eventLog } = setup();

      const message = `\${${property}} foo bar`;
      sut.parseMessage(message);
      const log = eventLog.log;
      assert.equal(log.length, 1);
      const entry = log[0];
      assert.equal(entry.severity, LogLevel.warn);
      assert.equal(
        entry
          .toString()
          .endsWith(`[WRN ValidationMessageProvider] Did you mean to use "$${property}" instead of "${property}" in this validation message template: "${message}"?`),
        true
      );
    }));

  ['${$parent} foo bar', '${$parent.prop} foo bar'].map((message) =>
    it(`#parseMessage throws error if the message contains '$parent' - ${message}`, function () {
      const { sut } = setup();

      assert.throws(
        () => {
          sut.parseMessage(message);
        },
        '$parent is not permitted in validation message expressions.'
      );
    }));

  const rules = [
    {
      title: 'RequiredRule',
      getRule: (sut: IValidationMessageProvider) => new RequiredRule(sut),
    },
    {
      title: 'RegexRule',
      getRule: (sut: IValidationMessageProvider) => new RegexRule(sut, /foo/),
    },
    {
      title: 'RegexRule - email',
      getRule: (sut: IValidationMessageProvider) => new RegexRule(sut, /foo/, 'email'),
    },
    {
      title: 'LengthRule - minLength',
      getRule: (sut: IValidationMessageProvider) => new LengthRule(sut, 42, false),
    },
    {
      title: 'LengthRule - maxLength',
      getRule: (sut: IValidationMessageProvider) => new LengthRule(sut, 42, true),
    },
    {
      title: 'SizeRule - minItems',
      getRule: (sut: IValidationMessageProvider) => new SizeRule(sut, 42, false),
    },
    {
      title: 'SizeRule - maxItems',
      getRule: (sut: IValidationMessageProvider) => new SizeRule(sut, 42, true),
    },
    {
      title: 'RangeRule - min',
      getRule: (sut: IValidationMessageProvider) => new RangeRule(sut, true, { min: 42 }),
    },
    {
      title: 'RangeRule - max',
      getRule: (sut: IValidationMessageProvider) => new RangeRule(sut, true, { max: 42 }),
    },
    {
      title: 'RangeRule - range',
      getRule: (sut: IValidationMessageProvider) => new RangeRule(sut, true, { min: 42, max: 43 }),
    },
    {
      title: 'RangeRule - between',
      getRule: (sut: IValidationMessageProvider) => new RangeRule(sut, false, { min: 42, max: 43 }),
    },
    {
      title: 'EqualsRule',
      getRule: (sut: IValidationMessageProvider) => new EqualsRule(sut, 42),
    },
  ];
  rules.map(({ title, getRule }) =>
    it(`rule.message returns the registered message for a rule instance - ${title}`, function () {
      const { sut, container } = setup();
      const message = 'FooBar';
      const $rule = getRule(sut);
      $rule.setMessage(message);
      const scope = { bindingContext: {}, overrideContext: (void 0)!, parentScope: (void 0)!, scopeParts: [] };
      const actual = $rule.message.evaluate(LifecycleFlags.none, scope, container);
      assert.equal(actual, message);
    }));

  const messages = [
    'FooBar is required.',
    'FooBar is not correctly formatted.',
    'FooBar is not a valid email.',
    'FooBar must be at least 42 characters.',
    'FooBar cannot be longer than 42 characters.',
    'FooBar must contain at least 42 items.',
    'FooBar cannot contain more than 42 items.',
    'FooBar must be at least 42.',
    'FooBar must be at most 42.',
    'FooBar must be between or equal to 42 and 43.',
    'FooBar must be between but not equal to 42 and 43.',
    'FooBar must be 42.',
  ];
  rules.map((r, i) => ({ ...r, expected: messages[i] })).map(({ title, getRule, expected }) =>
    it(`rule.message returns the registered default message for a rule type when no message for the instance is registered - ${title}`, function () {
      const { sut, container } = setup();
      const $rule = getRule(sut);
      const scope = { bindingContext: { $displayName: 'FooBar', $rule }, overrideContext: (void 0)!, parentScope: (void 0)!, scopeParts: [] };
      const actual = $rule.message.evaluate(LifecycleFlags.none, scope, container);
      assert.equal(actual, expected);
    }));

  rules.map(({ title, getRule }) =>
    it(`rule.message returns the default message the registered key is not found - ${title}`, function () {
      const { sut, container } = setup();
      const $rule = getRule(sut);
      $rule.messageKey = 'foobar';
      const scope = { bindingContext: { $displayName: 'FooBar', $rule }, overrideContext: (void 0)!, parentScope: (void 0)!, scopeParts: [] };
      const actual = $rule.message.evaluate(LifecycleFlags.none, scope, container);
      assert.equal(actual, 'FooBar is invalid.');
    }));

  it('default messages can be overwritten by registering custom messages', function () {

    const customMessages: ICustomMessage[] = [
      {
        rule: RequiredRule,
        aliases: [
          { name: 'required', defaultMessage: `\${$displayName} is non-optional.` }
        ],
      },
      {
        rule: RegexRule,
        aliases: [
          { name: 'matches', defaultMessage: `\${$displayName} does not matches the pattern.` },
          { name: 'email', defaultMessage: `\${$displayName} must be an email` },
        ],
      },
      {
        rule: LengthRule,
        aliases: [
          { name: 'minLength', defaultMessage: `\${$displayName} fails min. chars contraint.` },
          { name: 'maxLength', defaultMessage: `\${$displayName} fails max. chars contraint.` },
        ],
      },
      {
        rule: SizeRule,
        aliases: [
          { name: 'minItems', defaultMessage: `\${$displayName} should contain at least \${$rule.count} item\${$rule.count === 1 ? '' : 's'}.` },
          { name: 'maxItems', defaultMessage: `\${$displayName} should not contain more than \${$rule.count} item\${$rule.count === 1 ? '' : 's'}.` },
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
      {
        rule: EqualsRule,
        aliases: [
          { name: 'equals', defaultMessage: `\${$displayName} should be \${$rule.expectedValue}.` },
        ],
      },
    ];
    const { sut, container } = setup(customMessages);
    for (const { getRule } of rules) {
      const $rule = getRule(sut);
      const scope = { bindingContext: { $displayName: 'FooBar', $rule }, overrideContext: (void 0)!, parentScope: (void 0)!, scopeParts: [] };
      const actual = $rule.message.evaluate(LifecycleFlags.none, scope, container);
      const aliases = customMessages.find((item) => $rule instanceof item.rule).aliases;
      const template = aliases.length === 1 ? aliases[0].defaultMessage : aliases.find(({ name }) => name === $rule.messageKey)?.defaultMessage;
      const expected = sut.parseMessage(template).evaluate(LifecycleFlags.none, scope, null!);
      assert.equal(actual, expected);
    }
  });
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

describe.only('rule execution', function () {
  [
    { value: null,      isValid: false  },
    { value: undefined, isValid: false  },
    { value: '',        isValid: false  },
    { value: true,      isValid: true   },
    { value: false,     isValid: true   },
    { value: "1",       isValid: true   },
    { value: "chaos",   isValid: true   },
    { value: 0,         isValid: true   },
    { value: 1,         isValid: true   },
  ].map(({ value, isValid }) =>
    it(`RequiredRule#execute validates ${value} to be ${isValid}`, function () {
      const sut = new RequiredRule((void 0)!);
      assert.equal(sut.execute(value), isValid);
    })
  );

  [
    { value: null,      isValid: true   },
    { value: undefined, isValid: true   },
    { value: '',        isValid: true   },
    { value: 'foobar',  isValid: true   },
    { value: 'barbar',  isValid: false  },
  ].map(({ value, isValid }) =>
    it(`RegexRule#execute validates ${value} to be ${isValid}`, function () {
      const sut = new RegexRule((void 0)!, /foo/);
      assert.equal(sut.execute(value), isValid);
    })
  );

  [
    { value: null,      length: void 0,   isMax: true,    isValid: true   },
    { value: null,      length: void 0,   isMax: false,   isValid: true   },
    { value: undefined, length: void 0,   isMax: true,    isValid: true   },
    { value: undefined, length: void 0,   isMax: false,   isValid: true   },
    { value: '',        length: 1,        isMax: true,    isValid: true   },
    { value: '',        length: 1,        isMax: false,   isValid: true   },
    { value: 'foo',     length: 5,        isMax: true,    isValid: true   },
    { value: 'foobar',  length: 5,        isMax: true,    isValid: false  },
    { value: 'fooba',   length: 5,        isMax: true,    isValid: true   },
    { value: 'foo',     length: 5,        isMax: false,   isValid: false  },
    { value: 'foobar',  length: 5,        isMax: false,   isValid: true   },
    { value: 'fooba',   length: 5,        isMax: false,   isValid: true   },
  ].map(({ value, length, isMax, isValid }) =>
    it(`LengthRule#execute validates ${value} to be ${isValid} for length constraint ${length}`, function () {
      const sut = new LengthRule((void 0)!, length, isMax);
      assert.equal(sut.messageKey, isMax ? 'maxLength' : 'minLength');
      assert.equal(sut.execute(value), isValid);
    })
  );

  [
    { value: null,                      count: void 0,   isMax: true,    isValid: true   },
    { value: null,                      count: void 0,   isMax: false,   isValid: true   },
    { value: undefined,                 count: void 0,   isMax: true,    isValid: true   },
    { value: undefined,                 count: void 0,   isMax: false,   isValid: true   },
    { value: [],                        count: 1,        isMax: true,    isValid: true   },
    { value: [],                        count: 1,        isMax: false,   isValid: false  },
    { value: ['foobar'],                count: 2,        isMax: true,    isValid: true   },
    { value: ['foobar'],                count: 2,        isMax: false,   isValid: false  },
    { value: ['foo', 'bar'],            count: 2,        isMax: true,    isValid: true   },
    { value: ['foo', 'bar', 'fu'],      count: 2,        isMax: true,    isValid: false  },
    { value: ['foo', 'bar'],            count: 2,        isMax: false,   isValid: true   },
    { value: ['foo', 'bar', 'fu'],      count: 2,        isMax: false,   isValid: true   },
  ].map(({ value, count, isMax, isValid }) =>
    it(`SizeRule#execute validates ${value} to be ${isValid} for count constraint ${count}`, function () {
      const sut = new SizeRule((void 0)!, count, isMax);
      assert.equal(sut.messageKey, isMax ? 'maxItems' : 'minItems');
      assert.equal(sut.execute(value), isValid);
    })
  );

  [
    { value: null,                      range: { min: 42,        max: undefined  },        isInclusive: true,    isValid: true,   key: 'min'      },
    { value: null,                      range: { min: 42,        max: undefined  },        isInclusive: false,   isValid: true,   key: 'min'      },
    { value: null,                      range: { min: undefined, max: 42         },        isInclusive: true,    isValid: true,   key: 'max'      },
    { value: null,                      range: { min: undefined, max: 42         },        isInclusive: false,   isValid: true,   key: 'max'      },
    { value: undefined,                 range: { min: 42,        max: undefined  },        isInclusive: true,    isValid: true,   key: 'min'      },
    { value: undefined,                 range: { min: 42,        max: undefined  },        isInclusive: false,   isValid: true,   key: 'min'      },
    { value: undefined,                 range: { min: undefined, max: 42         },        isInclusive: true,    isValid: true,   key: 'max'      },
    { value: undefined,                 range: { min: undefined, max: 42         },        isInclusive: false,   isValid: true,   key: 'max'      },
    { value: -41000,                    range: { min: 42,        max: undefined  },        isInclusive: true,    isValid: false,  key: 'min'      },
    { value: 41,                        range: { min: 42,        max: undefined  },        isInclusive: true,    isValid: false,  key: 'min'      },
    { value: 42,                        range: { min: 42,        max: undefined  },        isInclusive: true,    isValid: true,   key: 'min'      },
    { value: 43,                        range: { min: 42,        max: undefined  },        isInclusive: true,    isValid: true,   key: 'min'      },
    { value: 43000,                     range: { min: 42,        max: undefined  },        isInclusive: true,    isValid: true,   key: 'min'      },
    { value: -41000,                    range: { min: 42,        max: undefined  },        isInclusive: false,   isValid: false,  key: 'min'      },
    { value: 41,                        range: { min: 42,        max: undefined  },        isInclusive: false,   isValid: false,  key: 'min'      },
    { value: 42,                        range: { min: 42,        max: undefined  },        isInclusive: false,   isValid: false,  key: 'min'      },
    { value: 43,                        range: { min: 42,        max: undefined  },        isInclusive: false,   isValid: true,   key: 'min'      },
    { value: 43000,                     range: { min: 42,        max: undefined  },        isInclusive: false,   isValid: true,   key: 'min'      },
    { value: -41000,                    range: { min: undefined, max: 42         },        isInclusive: true,    isValid: true,   key: 'max'      },
    { value: 41,                        range: { min: undefined, max: 42         },        isInclusive: true,    isValid: true,   key: 'max'      },
    { value: 42,                        range: { min: undefined, max: 42         },        isInclusive: true,    isValid: true,   key: 'max'      },
    { value: 43,                        range: { min: undefined, max: 42         },        isInclusive: true,    isValid: false,  key: 'max'      },
    { value: 43000,                     range: { min: undefined, max: 42         },        isInclusive: true,    isValid: false,  key: 'max'      },
    { value: -41000,                    range: { min: undefined, max: 42         },        isInclusive: false,   isValid: true,   key: 'max'      },
    { value: 41,                        range: { min: undefined, max: 42         },        isInclusive: false,   isValid: true,   key: 'max'      },
    { value: 42,                        range: { min: undefined, max: 42         },        isInclusive: false,   isValid: false,  key: 'max'      },
    { value: 43,                        range: { min: undefined, max: 42         },        isInclusive: false,   isValid: false,  key: 'max'      },
    { value: 43000,                     range: { min: undefined, max: 42         },        isInclusive: false,   isValid: false,  key: 'max'      },
    { value: 38,                        range: { min: 39,        max: 42         },        isInclusive: false,   isValid: false,  key: 'between'  },
    { value: 39,                        range: { min: 39,        max: 42         },        isInclusive: false,   isValid: false,  key: 'between'  },
    { value: 40,                        range: { min: 39,        max: 42         },        isInclusive: false,   isValid: true,   key: 'between'  },
    { value: 41,                        range: { min: 39,        max: 42         },        isInclusive: false,   isValid: true,   key: 'between'  },
    { value: 42,                        range: { min: 39,        max: 42         },        isInclusive: false,   isValid: false,  key: 'between'  },
    { value: 43,                        range: { min: 39,        max: 42         },        isInclusive: false,   isValid: false,  key: 'between'  },
    { value: 38,                        range: { min: 39,        max: 42         },        isInclusive: true,    isValid: false,  key: 'range'    },
    { value: 39,                        range: { min: 39,        max: 42         },        isInclusive: true,    isValid: true,   key: 'range'    },
    { value: 40,                        range: { min: 39,        max: 42         },        isInclusive: true,    isValid: true,   key: 'range'    },
    { value: 41,                        range: { min: 39,        max: 42         },        isInclusive: true,    isValid: true,   key: 'range'    },
    { value: 42,                        range: { min: 39,        max: 42         },        isInclusive: true,    isValid: true,   key: 'range'    },
    { value: 43,                        range: { min: 39,        max: 42         },        isInclusive: true,    isValid: false,  key: 'range'    },
  ].map(({ value, range, isInclusive, isValid, key }) =>
    it(`RangeRule#execute validates ${value} to be ${isValid} for range ${isInclusive ? `[${range.min}, ${range.max}]` : `(${range.min}, ${range.max})`}`, function () {
      const sut = new RangeRule((void 0)!, isInclusive, range);
      assert.equal(sut.messageKey, key);
      assert.equal(sut.execute(value), isValid);
    })
  );

  [
    { value: null,                      expectedValue: 42,     isValid: true   },
    { value: undefined,                 expectedValue: 42,     isValid: true   },
    { value: '',                        expectedValue: 42,     isValid: true   },
    { value: '42',                      expectedValue: 42,     isValid: false  },
    { value: 42,                        expectedValue: 42,     isValid: true  },
  ].map(({ value, expectedValue, isValid }) =>
    it(`EqualsRule#execute validates ${value} to be ${isValid} for expected value ${expectedValue}`, function () {
      const sut = new EqualsRule((void 0)!, expectedValue);
      assert.equal(sut.execute(value), isValid);
    })
  );
});

describe.only('parsePropertyName', function () {

  function setup() {
    const container = TestContext.createHTMLTestContext().container;
    container.register(ValidationConfiguration);
    return {
      parser: container.get(IExpressionParser),
      container,
    };
  }

  const a: string = 'foo';
  [
    { property: 'prop',                   expected: 'prop' },
    { property: 'obj.prop',               expected: 'obj.prop' },
    { property: 'obj.prop1.prop2',        expected: 'obj.prop1.prop2' },
    { property: 'prop[0]',                expected: 'prop[0]' },
    { property: 'prop[0].prop2',          expected: 'prop[0].prop2' },
    { property: 'obj.prop[0]',            expected: 'obj.prop[0]' },
    { property: 'obj.prop[0].prop2',      expected: 'obj.prop[0].prop2' },
    { property: 'prop[a]',                expected: 'prop[a]' },
    { property: 'prop[a].prop2',          expected: 'prop[a].prop2' },
    { property: 'obj.prop[a]',            expected: 'obj.prop[a]' },
    { property: 'obj.prop[a].prop2',      expected: 'obj.prop[a].prop2' },
    { property: 'prop[\'a\']',            expected: 'prop[\'a\']' },
    { property: 'prop[\'a\'].prop2',      expected: 'prop[\'a\'].prop2' },
    { property: 'obj.prop[\'a\']',        expected: 'obj.prop[\'a\']' },
    { property: 'obj.prop[\'a\'].prop2',  expected: 'obj.prop[\'a\'].prop2' },
    { property: 'prop["a"]',              expected: 'prop["a"]' },
    { property: 'prop["a"].prop2',        expected: 'prop["a"].prop2' },
    { property: 'obj.prop["a"]',          expected: 'obj.prop["a"]' },
    { property: 'obj.prop["a"].prop2',    expected: 'obj.prop["a"].prop2' },
    { property: (o: any) => o.prop,                 expected: 'prop' },
    { property: (o: any) => o.obj.prop,             expected: 'obj.prop' },
    { property: (o: any) => o.obj.prop1.prop2,      expected: 'obj.prop1.prop2' },
    { property: (o: any) => o.prop[0],              expected: 'prop[0]' },
    { property: (o: any) => o.prop[0].prop2,        expected: 'prop[0].prop2' },
    { property: (o: any) => o.obj.prop[0],          expected: 'obj.prop[0]' },
    { property: (o: any) => o.obj.prop[0].prop2,    expected: 'obj.prop[0].prop2' },
    { property: (o: any) => o.prop[a],              expected: 'prop[a]' },
    { property: (o: any) => o.prop[a].prop2,        expected: 'prop[a].prop2' },
    { property: (o: any) => o.obj.prop[a],          expected: 'obj.prop[a]' },
    { property: (o: any) => o.obj.prop[a].prop2,    expected: 'obj.prop[a].prop2' },
    { property: (o: any) => o.prop['a'],            expected: 'prop[\'a\']' },
    { property: (o: any) => o.prop['a'].prop2,      expected: 'prop[\'a\'].prop2' },
    { property: (o: any) => o.obj.prop['a'],        expected: 'obj.prop[\'a\']' },
    { property: (o: any) => o.obj.prop['a'].prop2,  expected: 'obj.prop[\'a\'].prop2' },
    { property: (o: any) => o.prop["a"],            expected: 'prop["a"]' },
    { property: (o: any) => o.prop["a"].prop2,      expected: 'prop["a"].prop2' },
    { property: (o: any) => o.obj.prop["a"],        expected: 'obj.prop["a"]' },
    { property: (o: any) => o.obj.prop["a"].prop2,  expected: 'obj.prop["a"].prop2' },
    { property: function (o: any) { return o.prop; },                 expected: 'prop' },
    { property: function (o: any) { return o.obj.prop; },             expected: 'obj.prop' },
    { property: function (o: any) { return o.obj.prop1.prop2; },      expected: 'obj.prop1.prop2' },
    { property: function (o: any) { return o.prop[0]; },              expected: 'prop[0]' },
    { property: function (o: any) { return o.prop[0].prop2; },        expected: 'prop[0].prop2' },
    { property: function (o: any) { return o.obj.prop[0]; },          expected: 'obj.prop[0]' },
    { property: function (o: any) { return o.obj.prop[0].prop2; },    expected: 'obj.prop[0].prop2' },
    { property: function (o: any) { return o.prop[a]; },              expected: 'prop[a]' },
    { property: function (o: any) { return o.prop[a].prop2; },        expected: 'prop[a].prop2' },
    { property: function (o: any) { return o.obj.prop[a]; },          expected: 'obj.prop[a]' },
    { property: function (o: any) { return o.obj.prop[a].prop2; },    expected: 'obj.prop[a].prop2' },
    { property: function (o: any) { return o.prop['a']; },            expected: 'prop[\'a\']' },
    { property: function (o: any) { return o.prop['a'].prop2; },      expected: 'prop[\'a\'].prop2' },
    { property: function (o: any) { return o.obj.prop['a']; },        expected: 'obj.prop[\'a\']' },
    { property: function (o: any) { return o.obj.prop['a'].prop2; },  expected: 'obj.prop[\'a\'].prop2' },
    { property: function (o: any) { return o.prop["a"]; },            expected: 'prop["a"]' },
    { property: function (o: any) { return o.prop["a"].prop2; },      expected: 'prop["a"].prop2' },
    { property: function (o: any) { return o.obj.prop["a"]; },        expected: 'obj.prop["a"]' },
    { property: function (o: any) { return o.obj.prop["a"].prop2; },  expected: 'obj.prop["a"].prop2' },
    { property: function (o: any) { 'use strict'; return o.prop; },                 expected: 'prop' },
    { property: function (o: any) { 'use strict'; return o.obj.prop; },             expected: 'obj.prop' },
    { property: function (o: any) { 'use strict'; return o.obj.prop1.prop2; },      expected: 'obj.prop1.prop2' },
    { property: function (o: any) { 'use strict'; return o.prop[0]; },              expected: 'prop[0]' },
    { property: function (o: any) { 'use strict'; return o.prop[0].prop2; },        expected: 'prop[0].prop2' },
    { property: function (o: any) { 'use strict'; return o.obj.prop[0]; },          expected: 'obj.prop[0]' },
    { property: function (o: any) { 'use strict'; return o.obj.prop[0].prop2; },    expected: 'obj.prop[0].prop2' },
    { property: function (o: any) { 'use strict'; return o.prop[a]; },              expected: 'prop[a]' },
    { property: function (o: any) { 'use strict'; return o.prop[a].prop2; },        expected: 'prop[a].prop2' },
    { property: function (o: any) { 'use strict'; return o.obj.prop[a]; },          expected: 'obj.prop[a]' },
    { property: function (o: any) { 'use strict'; return o.obj.prop[a].prop2; },    expected: 'obj.prop[a].prop2' },
    { property: function (o: any) { 'use strict'; return o.prop['a']; },            expected: 'prop[\'a\']' },
    { property: function (o: any) { 'use strict'; return o.prop['a'].prop2; },      expected: 'prop[\'a\'].prop2' },
    { property: function (o: any) { 'use strict'; return o.obj.prop['a']; },        expected: 'obj.prop[\'a\']' },
    { property: function (o: any) { 'use strict'; return o.obj.prop['a'].prop2; },  expected: 'obj.prop[\'a\'].prop2' },
    { property: function (o: any) { 'use strict'; return o.prop["a"]; },            expected: 'prop["a"]' },
    { property: function (o: any) { 'use strict'; return o.prop["a"].prop2; },      expected: 'prop["a"].prop2' },
    { property: function (o: any) { 'use strict'; return o.obj.prop["a"]; },        expected: 'obj.prop["a"]' },
    { property: function (o: any) { 'use strict'; return o.obj.prop["a"].prop2; },  expected: 'obj.prop["a"].prop2' },
    { property: function (o: any) { "use strict"; return o.prop; },                 expected: 'prop' },
    { property: function (o: any) { "use strict"; return o.obj.prop; },             expected: 'obj.prop' },
    { property: function (o: any) { "use strict"; return o.obj.prop1.prop2; },      expected: 'obj.prop1.prop2' },
    { property: function (o: any) { "use strict"; return o.prop[0]; },              expected: 'prop[0]' },
    { property: function (o: any) { "use strict"; return o.prop[0].prop2; },        expected: 'prop[0].prop2' },
    { property: function (o: any) { "use strict"; return o.obj.prop[0]; },          expected: 'obj.prop[0]' },
    { property: function (o: any) { "use strict"; return o.obj.prop[0].prop2; },    expected: 'obj.prop[0].prop2' },
    { property: function (o: any) { "use strict"; return o.prop[a]; },              expected: 'prop[a]' },
    { property: function (o: any) { "use strict"; return o.prop[a].prop2; },        expected: 'prop[a].prop2' },
    { property: function (o: any) { "use strict"; return o.obj.prop[a]; },          expected: 'obj.prop[a]' },
    { property: function (o: any) { "use strict"; return o.obj.prop[a].prop2; },    expected: 'obj.prop[a].prop2' },
    { property: function (o: any) { "use strict"; return o.prop['a']; },            expected: 'prop[\'a\']' },
    { property: function (o: any) { "use strict"; return o.prop['a'].prop2; },      expected: 'prop[\'a\'].prop2' },
    { property: function (o: any) { "use strict"; return o.obj.prop['a']; },        expected: 'obj.prop[\'a\']' },
    { property: function (o: any) { "use strict"; return o.obj.prop['a'].prop2; },  expected: 'obj.prop[\'a\'].prop2' },
    { property: function (o: any) { "use strict"; return o.prop["a"]; },            expected: 'prop["a"]' },
    { property: function (o: any) { "use strict"; return o.prop["a"].prop2; },      expected: 'prop["a"].prop2' },
    { property: function (o: any) { "use strict"; return o.obj.prop["a"]; },        expected: 'obj.prop["a"]' },
    { property: function (o: any) { "use strict"; return o.obj.prop["a"].prop2; },  expected: 'obj.prop["a"].prop2' },
  ].map(({ property, expected }) =>
    it(`parses ${property.toString()} to ${expected}`, function () {
      const { parser } = setup();
      assert.deepEqual(parsePropertyName(property, parser), [expected, parser.parse(expected, BindingType.None)]);
    }));

  [
    { property: 1 },
    { property: true },
    { property: false },
    { property: {} },
    { property: (o) => { while (true) { /* noop */ } } },
    { property: (o) => { while (true) { /* noop */ } return o.prop; } },
    { property: function (o) { while (true) { /* noop */ } } },
    { property: function (o) { while (true) { /* noop */ } return o.prop; } },
  ].map(({ property }) =>
    it(`throws error when parsing ${property.toString()}`, function () {
      const { parser } = setup();
      assert.throws(
        () => {
          parsePropertyName(property as any, parser);
        },
        /Unable to parse accessor function/);
    }));
});
