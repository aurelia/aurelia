/* eslint-disable no-constant-condition, mocha/no-sibling-hooks */
import { Metadata } from '@aurelia/metadata';
import {
  DI,
  ILogEvent,
  ISink,
  LogLevel,
  Protocol,
  Registration
} from '@aurelia/kernel';
import {
  Interpolation,
  PrimitiveLiteralExpression,
  IExpressionParser,
  ExpressionType,
  Scope,
  astEvaluate
} from '@aurelia/runtime';
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
  parsePropertyName,
  ValidationRuleAliasMessage,
  validationRulesRegistrar,
  rootObjectSymbol,
} from '@aurelia/validation';
import { Person } from './_test-resources.js';

describe('validation/rule-provider.spec.ts', function () {
  describe('ValidationRules', function () {

    function setup() {
      const container = DI.createContainer();
      container.register(ValidationConfiguration);
      return { sut: container.get(IValidationRules), container };
    }

    it('is transient', function () {
      const { sut: instance1, container } = setup();
      const instance2 = container.get(IValidationRules);
      assert.notEqual(instance1, instance2);
    });

    it('can be used to define validation rules fluently on string properties', function () {
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

    it('can be used to define validation rules fluently on number properties', function () {
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

    it('can be used to define validation rules fluently on collection properties', function () {
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

    it('can be used to define validation rules fluently using lambda', function () {
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

    it('can be used to define custom validation rules fluently', function () {
      const { sut } = setup();
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
        .satisfiesRule(new CustomRule())
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
      assert.instanceOf(rule1.$rules[0][0], RequiredRule, 'expected required rule');
      assert.instanceOf(rule1.$rules[0][1], RegexRule, 'expected regex rule');

      assert.instanceOf(rule2, PropertyRule);
      assert.equal((rule2 as PropertyRule).property.name, 'age');
      assert.instanceOf(rule2.$rules[0][0], RangeRule, 'expected range rule');
    });

    it('consolidates the rule based on property name', function () {
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
      assert.instanceOf(rule1.$rules[0][0], RequiredRule, 'expected required rule');
      assert.instanceOf(rule1.$rules[0][1], RegexRule, 'expected regex rule');

      assert.instanceOf(rule2, PropertyRule);
      assert.equal((rule2 as PropertyRule).property.name, 'age');
      assert.instanceOf(rule2.$rules[0][0], RangeRule, 'expected range rule');
    });

    it('can define metadata annotation for rules on an object', function () {
      const { sut } = setup();
      const obj: Person = new Person((void 0)!, (void 0)!);
      const rules = sut
        .on(obj)

        .ensure('name')
        .required()

        .ensure('age')
        .range(24, 42)

        .rules;

      assert.equal(Metadata.get(Protocol.annotation.keyFor('validation-rules', validationRulesRegistrar.defaultRuleSetName), obj), rules);

      sut.off();
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
      const person = new Person(void 0!, void 0!);

      assert.equal(Metadata.get(Protocol.annotation.keyFor('validation-rules', validationRulesRegistrar.defaultRuleSetName), Person), rules);

      const [rules1, rules2] = rules;
      assert.equal(rules1.property.name, 'name');
      assert.instanceOf(rules1.$rules[0][0], RequiredRule);
      assert.equal(rules2.property.name, 'age');
      assert.instanceOf(rules2.$rules[0][0], RangeRule);

      assert.equal(validationRulesRegistrar.get(person), rules);

      sut.off();
    });

    it('can define rules on properties of an object using lambda expression', function () {
      const { sut } = setup();
      const obj: Person = new Person((void 0)!, (void 0)!, (void 0)!);
      const rules = sut
        .on(obj)

        .ensure(function (o) { return o.name; })
        .required()

        .ensure((o) => o.age)
        .range(24, 42)

        .ensure((o) => o.address.line1)
        .required()

        .rules;

      assert.equal(Metadata.get(Protocol.annotation.keyFor('validation-rules', validationRulesRegistrar.defaultRuleSetName), obj), rules);

      const [rules1, rules2, rules3] = rules;
      assert.equal(rules1.property.name, 'name');
      assert.instanceOf(rules1.$rules[0][0], RequiredRule);
      assert.equal(rules2.property.name, 'age');
      assert.instanceOf(rules2.$rules[0][0], RangeRule);
      assert.equal(rules3.property.name, 'address.line1');
      assert.instanceOf(rules3.$rules[0][0], RequiredRule);

      sut.off();
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
      const person = new Person(void 0!, void 0!);

      assert.equal(Metadata.get(Protocol.annotation.keyFor('validation-rules', validationRulesRegistrar.defaultRuleSetName), Person), rules);

      const [rules1, rules2, rules3] = rules;
      assert.equal(rules1.property.name, 'name');
      assert.instanceOf(rules1.$rules[0][0], RequiredRule);
      assert.equal(rules2.property.name, 'age');
      assert.instanceOf(rules2.$rules[0][0], RangeRule);
      assert.equal(rules3.property.name, 'address.line1');
      assert.instanceOf(rules3.$rules[0][0], RequiredRule);

      assert.equal(validationRulesRegistrar.get(person), rules);

      sut.off();
    });

    it('can define rules on multiple objects', function () {
      const { sut } = setup();
      const obj1: Person = new Person((void 0)!, (void 0)!, (void 0)!);
      const obj2: Person = new Person((void 0)!, (void 0)!, (void 0)!);
      sut
        .on(obj1)
        .ensure('name')
        .required()

        .on(obj2)
        .ensure('name')
        .required()
        .ensure('age')
        .required()

        .on(obj1)
        .ensure((o) => o.address.line1)
        .required()
        .on(obj1)
        .ensure((o) => o.age)
        .required();

      const rules1 = validationRulesRegistrar.get(obj1);
      const rules2 = validationRulesRegistrar.get(obj2);

      assert.equal(rules1.length, 3, 'error1');
      const [name1Rule, line1Rule, age1Rule] = rules1;
      assert.equal(name1Rule.property.name, 'name', 'error3');
      assert.instanceOf(name1Rule.$rules[0][0], RequiredRule);
      assert.equal(line1Rule.property.name, 'address.line1', 'error4');
      assert.instanceOf(line1Rule.$rules[0][0], RequiredRule);
      assert.equal(age1Rule.property.name, 'age', 'error5');
      assert.instanceOf(age1Rule.$rules[0][0], RequiredRule);

      assert.equal(rules2.length, 2, 'error2');
      const [name2Rule, age2Rule] = rules2;
      assert.equal(name2Rule.property.name, 'name', 'error6');
      assert.instanceOf(name2Rule.$rules[0][0], RequiredRule);
      assert.equal(age2Rule.property.name, 'age', 'error7');
      assert.instanceOf(age2Rule.$rules[0][0], RequiredRule);

      sut.off();
    });

    it('calling .off on an object without rules does not cause error', function () {
      const { sut } = setup();
      const obj: Person = new Person((void 0)!, (void 0)!, (void 0)!);
      assert.equal(validationRulesRegistrar.get(obj), void 0);
      sut.off(obj);
      assert.equal(validationRulesRegistrar.get(obj), void 0);
    });

    it('can define multiple ruleset for the same object using tagging', function () {
      const { sut } = setup();
      const obj: Person = new Person((void 0)!, (void 0)!, (void 0)!);
      const tag1 = 'tag1', tag2 = 'tag2';
      sut
        .on(obj, tag1)
        .ensure('name')
        .required()

        .on(obj, tag2)
        .ensure('age')
        .required();

      const ruleset1 = validationRulesRegistrar.get(obj, tag1);
      const ruleset2 = validationRulesRegistrar.get(obj, tag2);

      assert.equal(ruleset1.length, 1, 'error1');
      assert.equal(ruleset1[0].property.name, 'name', 'error2');
      assert.equal(ruleset2.length, 1, 'error3');
      assert.equal(ruleset2[0].property.name, 'age', 'error4');

      sut.off(obj);

      assert.equal(validationRulesRegistrar.get(obj), void 0);
    });

    it('can be used to delete the rules defined for an object', function () {
      const { sut } = setup();
      const obj: Person = new Person((void 0)!, (void 0)!, (void 0)!);
      sut
        .on(obj)
        .ensure('name')
        .required();

      const rules1 = validationRulesRegistrar.get(obj);

      assert.equal(rules1.length, 1, 'error1');

      sut.off(obj);

      assert.equal(validationRulesRegistrar.get(obj), void 0);
    });

    it('can be used to delete specific ruleset', function () {
      const { sut } = setup();
      const obj: Person = new Person((void 0)!, (void 0)!, (void 0)!);
      const tag1 = 'tag1', tag2 = 'tag2';

      assert.equal(validationRulesRegistrar.isValidationRulesSet(obj), false);

      sut
        .on(obj, tag1)
        .ensure('name')
        .required()

        .on(obj, tag2)
        .ensure('age')
        .required();

      assert.notEqual(validationRulesRegistrar.get(obj, tag1), void 0);
      assert.notEqual(validationRulesRegistrar.get(obj, tag2), void 0);

      sut.off(obj, tag2);

      assert.notEqual(validationRulesRegistrar.get(obj, tag1), void 0);
      assert.equal(validationRulesRegistrar.get(obj, tag2), void 0);
      assert.equal(validationRulesRegistrar.isValidationRulesSet(obj), true);
      assert.equal(sut['targets'].has(obj), true);

      sut.off(obj, tag1);

      assert.equal(validationRulesRegistrar.get(obj, tag1), void 0);
      assert.equal(validationRulesRegistrar.get(obj, tag2), void 0);
      assert.equal(validationRulesRegistrar.isValidationRulesSet(obj), false);
      assert.equal(sut['targets'].has(obj), false);

      sut.off();
    });

    it('can be used to delete all ruleset by default for a given object', function () {
      const { sut } = setup();
      const obj: Person = new Person((void 0)!, (void 0)!, (void 0)!);
      const tag1 = 'tag1', tag2 = 'tag2';

      assert.equal(validationRulesRegistrar.isValidationRulesSet(obj), false);

      sut
        .on(obj, tag1)
        .ensure('name')
        .required()

        .on(obj, tag2)
        .ensure('age')
        .required();

      sut.off();
      assert.equal(validationRulesRegistrar.isValidationRulesSet(obj), false);
      assert.equal(sut['targets'].has(obj), false);
    });
  });

  describe('ValidationMessageProvider', function () {
    class EventLog implements ISink {
      public log: ILogEvent[] = [];
      public handleEvent(event: ILogEvent): void {
        this.log.push(event);
      }
    }
    function setup(customMessages?: ICustomMessage[]) {
      const container = TestContext.create().container;
      const eventLog = new EventLog();

      const configuration = customMessages !== (void 0)
        ? ValidationConfiguration.customize((options) => {
          options.CustomMessages = customMessages;
        })
        : ValidationConfiguration;
      container.register(
        configuration,
        Registration.instance(ISink, eventLog)
      );

      const originalMessages = customMessages?.map(({ rule }) => ({ rule, aliases: ValidationRuleAliasMessage.getDefaultMessages(rule) }));

      return {
        sut: container.get(IValidationMessageProvider),
        container,
        eventLog,
        originalMessages
      };
    }

    const messages1 = [
      { message: 'name is required', expectedType: PrimitiveLiteralExpression },
      { message: '${$displayName} is required', expectedType: Interpolation },
    ];
    for (const { message, expectedType } of messages1) {
      it(`#parseMessage parses message correctly - ${message}`, function () {
        const { sut } = setup();
        assert.instanceOf(sut.parseMessage(message), expectedType);
      });
    }
    const specialPropertyNames = ['displayName', 'propertyName', 'value', 'object', 'config', 'getDisplayName'];
    for (const property of specialPropertyNames) {
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
      });
    }

    const invalidMessages = ['${$parent} foo bar', '${$parent.prop} foo bar'];
    for (const message of invalidMessages) {
      it(`#parseMessage throws error if the message contains '$parent' - ${message}`, function () {
        const { sut } = setup();

        assert.throws(
          () => {
            sut.parseMessage(message);
          },
          '$parent is not permitted in validation message expressions.'
        );
      });
    }

    const rules = [
      {
        title: 'RequiredRule',
        getRule: () => new RequiredRule(),
      },
      {
        title: 'RegexRule',
        getRule: () => new RegexRule(/foo/),
      },
      {
        title: 'RegexRule - email',
        getRule: () => new RegexRule(/foo/, 'email'),
      },
      {
        title: 'LengthRule - minLength',
        getRule: () => new LengthRule(42, false),
      },
      {
        title: 'LengthRule - maxLength',
        getRule: () => new LengthRule(42, true),
      },
      {
        title: 'SizeRule - minItems',
        getRule: () => new SizeRule(42, false),
      },
      {
        title: 'SizeRule - maxItems',
        getRule: () => new SizeRule(42, true),
      },
      {
        title: 'RangeRule - min',
        getRule: () => new RangeRule(true, { min: 42 }),
      },
      {
        title: 'RangeRule - max',
        getRule: () => new RangeRule(true, { max: 42 }),
      },
      {
        title: 'RangeRule - range',
        getRule: () => new RangeRule(true, { min: 42, max: 43 }),
      },
      {
        title: 'RangeRule - between',
        getRule: () => new RangeRule(false, { min: 42, max: 43 }),
      },
      {
        title: 'EqualsRule',
        getRule: () => new EqualsRule(42),
      },
    ];

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
    for (let i = 0, ii = rules.length; i < ii; i++) {
      const { title, getRule } = rules[i];
      it(`rule.message returns the registered message for a rule instance - ${title}`, function () {
        const { sut } = setup();
        const message = 'FooBar';
        const $rule = getRule();
        sut.setMessage($rule, message);
        const scope = Scope.create({});
        const actual = astEvaluate(sut.getMessage($rule), scope, null, null);
        assert.equal(actual, message);
      });

      it(`rule.message returns the registered default message for a rule type when no message for the instance is registered - ${title}`, function () {
        const { sut } = setup();
        const $rule = getRule();
        const scope = Scope.create({ $displayName: 'FooBar', $rule });
        const actual = astEvaluate(sut.getMessage($rule), scope, null, null);
        assert.equal(actual, messages[i]);
      });

      it(`rule.message returns the default message the registered key is not found - ${title}`, function () {
        const { sut } = setup();
        const $rule = getRule();
        $rule.messageKey = 'foobar';
        const scope = Scope.create({ $displayName: 'FooBar', $rule });
        const actual = astEvaluate(sut.getMessage($rule), scope, null, null);
        assert.equal(actual, 'FooBar is invalid.');
      });
    }

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
            { name: 'minLength', defaultMessage: `\${$displayName} fails min. chars constraint.` },
            { name: 'maxLength', defaultMessage: `\${$displayName} fails max. chars constraint.` },
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
      const { sut, originalMessages } = setup(customMessages);
      for (const { getRule } of rules) {
        const $rule = getRule();
        const scope = Scope.create({ $displayName: 'FooBar', $rule });
        const actual = astEvaluate(sut.getMessage($rule), scope, null, null);
        const aliases = customMessages.find((item) => $rule instanceof item.rule).aliases;
        const template = aliases.length === 1 ? aliases[0].defaultMessage : aliases.find(({ name }) => name === $rule.messageKey)?.defaultMessage;
        const expected = astEvaluate(sut.parseMessage(template), scope, null!, null);
        assert.equal(actual, expected);
      }
      // reset the messages
      for (const { rule, aliases } of originalMessages) {
        ValidationRuleAliasMessage.setDefaultMessage(rule, { aliases });
      }
    });

    it('appending new custom key and messages is also possible', function () {

      const messageKey = 'fooBarFizBaz';
      const $displayName = 'FooBar';
      const customMessages: ICustomMessage[] = [
        {
          rule: RequiredRule,
          aliases: [
            { name: messageKey, defaultMessage: '${$displayName} foobar fizbaz' }
          ],
        }
      ];
      const { sut, originalMessages } = setup(customMessages);

      const $rule1 = new RequiredRule();
      $rule1.messageKey = 'required';

      const $rule2 = new RequiredRule();
      $rule2.messageKey = messageKey;

      const scope1 = Scope.create({ $displayName, $rule: $rule1 });
      const scope2 = Scope.create({ $displayName, $rule: $rule2 });

      const actual1 = astEvaluate(sut.getMessage($rule1), scope1, null, null);
      const actual2 = astEvaluate(sut.getMessage($rule2), scope2, null, null);

      assert.equal(actual1, 'FooBar is required.');
      assert.equal(actual2, 'FooBar foobar fizbaz');

      // reset the messages
      for (const { rule, aliases } of originalMessages) {
        ValidationRuleAliasMessage.setDefaultMessage(rule, { aliases }, false);
      }
    });

    const displayNames = [
      { arg1: 'foo', arg2: null, expected: 'Foo' },
      { arg1: 'fooBar', arg2: null, expected: 'Foo Bar' },
      { arg1: 'foo bar', arg2: null, expected: 'Foo bar' },
      { arg1: 'foo', arg2: void 0, expected: 'Foo' },
      { arg1: 'fooBar', arg2: void 0, expected: 'Foo Bar' },
      { arg1: 'foo bar', arg2: void 0, expected: 'Foo bar' },
      { arg1: 'foo', arg2: 'hello', expected: 'hello' },
      { arg1: 'foo', arg2: () => 'hello', expected: 'hello' },
    ];
    for (const { arg1, arg2, expected } of displayNames) {
      it(`#getDisplayName computes display name - (${arg1}, ${arg2?.toString() ?? Object.prototype.toString.call(arg2)}) => ${expected}`, function () {
        const { sut } = setup();
        assert.equal(sut.getDisplayName(arg1, arg2), expected);
      });
    }
  });

  describe('parsePropertyName', function () {

    function setup() {
      const container = TestContext.create().container;
      container.register(ValidationConfiguration);
      return {
        parser: container.get(IExpressionParser),
        container,
      };
    }

    const cov_1wjh4ld5ut: any = {};
    const cov_1wjh4ld5ut1: () => any = () => ({});
    const a: string = 'foo';
    const positiveDataRows = [
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
      { property: function (o: any) { cov_1wjh4ld5ut.s[50]++; return o.prop; },                                      expected: 'prop' },
      { property: function (o: any) { cov_1wjh4ld5ut.f[9]++;cov_1wjh4ld5ut.s[50]++; return o.prop; },                expected: 'prop' },
      { property: function (o: any) { "use strict"; cov_1wjh4ld5ut.s[50]++; return o.prop; },                        expected: 'prop' },
      { property: function (o: any) { "use strict"; cov_1wjh4ld5ut.f[9]++;cov_1wjh4ld5ut.s[50]++; return o.prop; },  expected: 'prop' },
      { property: function (o: any) { /* istanbul ignore next */ cov_1wjh4ld5ut.s[50]++; return o.prop; },                                      expected: 'prop' },
      { property: function (o: any) { /* istanbul ignore next */ cov_1wjh4ld5ut.f[9]++;cov_1wjh4ld5ut.s[50]++; return o.prop; },                expected: 'prop' },
      { property: function (o: any) { "use strict"; /* istanbul ignore next */ cov_1wjh4ld5ut.s[50]++; return o.prop; },                        expected: 'prop' },
      { property: function (o: any) { "use strict"; /* istanbul ignore next */ cov_1wjh4ld5ut.f[9]++;cov_1wjh4ld5ut.s[50]++; return o.prop; },  expected: 'prop' },

      // for the instrumenter: @jsdevtools/coverage-istanbul-loader
      { property: function (o: any) { cov_1wjh4ld5ut1().s[50]++; return o.prop; },                                      expected: 'prop' },
      { property: function (o: any) { cov_1wjh4ld5ut1().f[9]++;cov_1wjh4ld5ut1().s[50]++; return o.prop; },                expected: 'prop' },
      { property: function (o: any) { "use strict"; cov_1wjh4ld5ut1().s[50]++; return o.prop; },                        expected: 'prop' },
      { property: function (o: any) { "use strict"; cov_1wjh4ld5ut1().f[9]++;cov_1wjh4ld5ut1().s[50]++; return o.prop; },  expected: 'prop' },
      { property: function (o: any) { /* istanbul ignore next */ cov_1wjh4ld5ut1().s[50]++; return o.prop; },                                      expected: 'prop' },
      { property: function (o: any) { /* istanbul ignore next */ cov_1wjh4ld5ut1().f[9]++;cov_1wjh4ld5ut1().s[50]++; return o.prop; },                expected: 'prop' },
      { property: function (o: any) { "use strict"; /* istanbul ignore next */ cov_1wjh4ld5ut1().s[50]++; return o.prop; },                        expected: 'prop' },
      { property: function (o: any) { "use strict"; /* istanbul ignore next */ cov_1wjh4ld5ut1().f[9]++;cov_1wjh4ld5ut1().s[50]++; return o.prop; },  expected: 'prop' },

      // for the instrumenter: @jsdevtools/coverage-istanbul-loader - lambda
      { property: (o: any) => { cov_1wjh4ld5ut1().s[50]++; return o.prop; },                                      expected: 'prop' },
      { property: (o: any) => { cov_1wjh4ld5ut1().f[9]++;cov_1wjh4ld5ut1().s[50]++; return o.prop; },                expected: 'prop' },
      { property: (o: any) => { "use strict"; cov_1wjh4ld5ut1().s[50]++; return o.prop; },                        expected: 'prop' },
      { property: (o: any) => { "use strict"; cov_1wjh4ld5ut1().f[9]++;cov_1wjh4ld5ut1().s[50]++; return o.prop; },  expected: 'prop' },
      { property: (o: any) => { /* istanbul ignore next */ cov_1wjh4ld5ut1().s[50]++; return o.prop; },                                      expected: 'prop' },
      { property: (o: any) => { /* istanbul ignore next */ cov_1wjh4ld5ut1().f[9]++;cov_1wjh4ld5ut1().s[50]++; return o.prop; },                expected: 'prop' },
      { property: (o: any) => { "use strict"; /* istanbul ignore next */ cov_1wjh4ld5ut1().s[50]++; return o.prop; },                        expected: 'prop' },
      { property: (o: any) => { "use strict"; /* istanbul ignore next */ cov_1wjh4ld5ut1().f[9]++;cov_1wjh4ld5ut1().s[50]++; return o.prop; },  expected: 'prop' },
      { property: (o: any) => { cov_1wjh4ld5ut1().s[50]++; /* istanbul ignore next */ return o.prop; },                                      expected: 'prop' },
      { property: (o: any) => { cov_1wjh4ld5ut1().f[9]++;cov_1wjh4ld5ut1().s[50]++; /* istanbul ignore next */ return o.prop; },                expected: 'prop' },
      { property: (o: any) => { "use strict"; cov_1wjh4ld5ut1().s[50]++; /* istanbul ignore next */ return o.prop; },                        expected: 'prop' },
      { property: (o: any) => { "use strict"; cov_1wjh4ld5ut1().f[9]++;cov_1wjh4ld5ut1().s[50]++; /* istanbul ignore next */ return o.prop; },  expected: 'prop' },
    ];
    for(const { property, expected } of positiveDataRows) {
      it(`parses ${property.toString()} to ${expected}`, function () {
        const { parser } = setup();
        assert.deepStrictEqual(parsePropertyName(property, parser), [expected, parser.parse(`${rootObjectSymbol}.${expected}`, 'None')]);
      });
    }

    const negativeDataRows = [
      { property: 1 },
      { property: true },
      { property: false },
      { property: {} },
      { property: (_o) => { while (true) { /* noop */ } } },
      { property: (o) => { while (true) { /* noop */ } return o.prop; } },
      { property: function (_o) { while (true) { /* noop */ } } },
      { property: function (o) { while (true) { /* noop */ } return o.prop; } },
    ];
    for(const { property } of negativeDataRows) {
      it(`throws error when parsing ${property.toString()}`, function () {
        const { parser } = setup();
        assert.throws(
          () => {
            parsePropertyName(property as any, parser);
          },
          /Unable to parse accessor function/);
      });
    }
  });

  describe('PropertyRule', function () {

    function setup() {
      const container = TestContext.create().container;
      container.register(ValidationConfiguration);
      return { validationRules: container.get(IValidationRules), container };
    }

    it('can validate async rules', async function () {
      const { validationRules } = setup();
      const obj1: Person = new Person((void 0)!, (void 0)!, (void 0)!);
      const rules = validationRules
        .on(obj1)
        .ensure('name')
        .satisfies(async (value: string) => new Promise<boolean>((resolve) => { setTimeout(() => { resolve(value === 'foo'); }, 300); }))
        .rules;

      assert.equal(rules.length, 1, 'error1');
      const nameRule = rules[0];

      obj1.name = 'foobar';
      let result = await nameRule.validate(obj1);
      assert.equal(result.length, 1);
      assert.equal(result[0].valid, false);
      assert.equal(result[0].propertyName, 'name');

      obj1.name = 'foo';
      result = await nameRule.validate(obj1);
      assert.equal(result.length, 1);
      assert.equal(result[0].valid, true);
      assert.equal(result[0].propertyName, 'name');

      validationRules.off();
    });

    it('respects a function for displayName', async function () {
      const { validationRules } = setup();
      const obj: Person = new Person((void 0)!, (void 0)!, (void 0)!);
      let i = 0;
      const rules = validationRules
        .on(obj)
        .ensure('name')
        .displayName(() => { i++; return `Name${i}`; })
        .required()
        .rules;

      assert.equal(rules.length, 1, 'error1');
      const nameRule = rules[0];

      let result = await nameRule.validate(obj);
      assert.equal(result[0].valid, false);
      assert.equal(result[0].message, 'Name1 is required.');

      result = await nameRule.validate(obj);
      assert.equal(result[0].valid, false);
      assert.equal(result[0].message, 'Name2 is required.');

      validationRules.off();
    });

    it('respects execution condition', async function () {
      const { validationRules } = setup();
      const obj: Person = new Person((void 0)!, (void 0)!, (void 0)!);
      const rule = validationRules
        .on(obj)
        .ensure('name')
        .required()
        .when((o) => o.age > 5)
        .rules[0];

      let result = await rule.validate(obj);
      assert.equal(result.length, 0);

      obj.age = 10;
      result = await rule.validate(obj);
      assert.equal(result[0].valid, false);
      assert.equal(result[0].message, 'Name is required.');

      validationRules.off();
    });

    it('respects rule chaining', async function () {
      const { validationRules } = setup();
      const obj: Person = new Person('test', (void 0)!, (void 0)!);
      const rule = validationRules
        .on(obj)
        .ensure('name')
        .minLength(42)
        .then()
        .matches(/foo/)
        .rules[0];

      let result = await rule.validate(obj);
      assert.deepStrictEqual(result.filter(r => !r.valid).map((r) => r.toString()), ['Name must be at least 42 characters.']);

      obj.name = 'a'.repeat(42);
      result = await rule.validate(obj);
      assert.deepStrictEqual(result.filter(r => !r.valid).map((r) => r.toString()), ['Name is not correctly formatted.']);

      obj.name = 'foo'.repeat(14);
      result = await rule.validate(obj);
      assert.deepStrictEqual(result.filter(r => !r.valid).map((r) => r.toString()), []);

      validationRules.off();
    });

    it('can be used to tag the rules', function () {
      const { validationRules } = setup();
      const obj: Person = new Person((void 0)!, (void 0)!, (void 0)!);
      const tag = 'foo';
      const rules = validationRules
        .on(obj)
        .ensure('name')
        .required()
        .tag(tag)
        .ensure('age')
        .required()
        .rules;

      assert.equal(rules.flatMap((r) => r.$rules.flat()).filter((r) => r.tag === tag).length, 1);

      validationRules.off();
    });

    it('validates all rules by default despite some of those are tagged', async function () {
      const { validationRules } = setup();
      const obj: Person = new Person((void 0)!, (void 0)!, (void 0)!);
      const tag = 'foo';
      const msg = 'not foobar';
      const rule = validationRules
        .on(obj)
        .ensure('name')
        .required()
        .satisfies((value) => value === 'foobar')
        .withMessage(msg)
        .tag(tag)
        .rules[0];

      obj.name = '';
      const results = await rule.validate(obj);
      assert.equal(results.length, 2);
      assert.deepEqual(results.map((r) => r.message), ['Name is required.', msg]);

      validationRules.off();
    });

    it('validates only the tagged rules when provided', async function () {
      const { validationRules } = setup();
      const obj: Person = new Person((void 0)!, (void 0)!, (void 0)!);
      const tag = 'foo';
      const msg = 'not foobar';
      const rule = validationRules
        .on(obj)
        .ensure('name')
        .required()
        .satisfies((value) => value === 'foobar')
        .withMessage(msg)
        .tag(tag)
        .rules[0];

      obj.name = '';
      const results = await rule.validate(obj, tag);
      assert.equal(results.length, 1);
      assert.deepEqual(results[0].message, msg);

      validationRules.off();
    });
  });
});
