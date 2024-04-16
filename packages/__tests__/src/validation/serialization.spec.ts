/* eslint-disable mocha/no-sibling-hooks */
import { IExpressionParser } from '@aurelia/expression-parser';
import { assert, TestContext } from '@aurelia/testing';
import {
  EqualsRule,
  IValidationMessageProvider,
  IValidationRules,
  LengthRule,
  PropertyRule,
  RangeRule,
  RegexRule,
  RequiredRule,
  SizeRule,
  ValidationConfiguration,
  IValidationRule,
  parsePropertyName,
  ValidationSerializer,
  RuleProperty,
  ValidationDeserializer,
  ModelBasedRule,
  IValidator,
  ValidateInstruction,
  IValidationExpressionHydrator
} from '@aurelia/validation';
import { Person } from './_test-resources.js';

describe('validation/serialization.spec.ts', function () {

  describe('validation de/serialization', function () {
    function setup() {
      const container = TestContext.create().container;
      container.register(ValidationConfiguration.customize((options) => { options.HydratorType = ValidationDeserializer; }));
      return {
        container,
        parser: container.get(IExpressionParser),
        validationRules: container.get(IValidationRules),
        messageProvider: container.get(IValidationMessageProvider)
      };
    }
    class RuleTestData {
      public constructor(public readonly name: string, public readonly getRule: () => IValidationRule, public readonly serializedRule: string) { }
    }
    const simpleRuleList = [
      new RuleTestData(`required rule`, function () { return new RequiredRule(); }, '{"$TYPE":"RequiredRule","messageKey":"required","tag":"undefined"}'),
      new RuleTestData(`regex rule`, function () { return new RegexRule(/foo\d/); }, '{"$TYPE":"RegexRule","messageKey":"matches","tag":"undefined","pattern":{"source":"\\"foo\\\\d\\"","flags":""}}'),
      new RuleTestData(`regex rule with flags`, function () { return new RegexRule(/foo\d/gi); }, '{"$TYPE":"RegexRule","messageKey":"matches","tag":"undefined","pattern":{"source":"\\"foo\\\\d\\"","flags":"gi"}}'),
      new RuleTestData(`max length rule`, function () { return new LengthRule(42, true); }, '{"$TYPE":"LengthRule","messageKey":"maxLength","tag":"undefined","length":42,"isMax":true}'),
      new RuleTestData(`min length rule`, function () { return new LengthRule(42, false); }, '{"$TYPE":"LengthRule","messageKey":"minLength","tag":"undefined","length":42,"isMax":false}'),
      new RuleTestData(`max items rule`, function () { return new SizeRule(42, true); }, '{"$TYPE":"SizeRule","messageKey":"maxItems","tag":"undefined","count":42,"isMax":true}'),
      new RuleTestData(`min items rule`, function () { return new SizeRule(42, false); }, '{"$TYPE":"SizeRule","messageKey":"minItems","tag":"undefined","count":42,"isMax":false}'),
      new RuleTestData(`equals rule (numeric expectation)`, function () { return new EqualsRule(42); }, '{"$TYPE":"EqualsRule","messageKey":"equals","tag":"undefined","expectedValue":42}'),
      new RuleTestData(`equals rule (string expectation)`, function () { return new EqualsRule("42"); }, '{"$TYPE":"EqualsRule","messageKey":"equals","tag":"undefined","expectedValue":"\\"42\\""}'),
      new RuleTestData(`equals rule (boole expectation)`, function () { return new EqualsRule(true); }, '{"$TYPE":"EqualsRule","messageKey":"equals","tag":"undefined","expectedValue":true}'),
      new RuleTestData(`equals rule (object)`, function () { return new EqualsRule({ prop: 12 }); }, '{"$TYPE":"EqualsRule","messageKey":"equals","tag":"undefined","expectedValue":{"prop":12}}'),
      new RuleTestData(`equals rule (array)`, function () { return new EqualsRule([{ prop: 12 }]); }, '{"$TYPE":"EqualsRule","messageKey":"equals","tag":"undefined","expectedValue":[{"prop":12}]}'),
      new RuleTestData(`[min,] range rule`, function () { return new RangeRule(true, { min: 42 }); }, '{"$TYPE":"RangeRule","messageKey":"min","tag":"undefined","isInclusive":true,"min":42,"max":null}'),
      new RuleTestData(`[,max] range rule`, function () { return new RangeRule(true, { max: 42 }); }, '{"$TYPE":"RangeRule","messageKey":"max","tag":"undefined","isInclusive":true,"min":null,"max":42}'),
      new RuleTestData(`[min,max] range rule`, function () { return new RangeRule(true, { min: 40, max: 42 }); }, '{"$TYPE":"RangeRule","messageKey":"range","tag":"undefined","isInclusive":true,"min":40,"max":42}'),
      new RuleTestData(`(min,max) range rule`, function () { return new RangeRule(false, { min: 40, max: 42 }); }, '{"$TYPE":"RangeRule","messageKey":"between","tag":"undefined","isInclusive":false,"min":40,"max":42}'),
    ];
    const list = [
      ...simpleRuleList,
      ...simpleRuleList.map(({ name, getRule, serializedRule }) => new RuleTestData(`${name} with tag`, function () {
        const rule = getRule();
        rule.tag = "foo";
        return rule;
      }, serializedRule.replace('"tag":"undefined"', '"tag":"\\"foo\\""'))),
      ...simpleRuleList.map(({ name, getRule, serializedRule }) => new RuleTestData(`${name} with custom messageKey`, function () {
        const rule = getRule();
        rule.messageKey = "foo";
        return rule;
      }, serializedRule.replace(/"messageKey":"\w+"/, '"messageKey":"foo"'))),
    ];
    class RulePropertyTestData {
      public constructor(public readonly property: string, public readonly serializedProperty: string) { }
    }
    const properties = [
      new RulePropertyTestData('prop', '{"$TYPE":"RuleProperty","name":"\\"prop\\"","expression":{"$TYPE":"AccessMemberExpression","name":"prop","object":{"$TYPE":"AccessScopeExpression","name":"$root","ancestor":0}},"displayName":"undefined"}'),
      new RulePropertyTestData('obj.prop', '{"$TYPE":"RuleProperty","name":"\\"obj.prop\\"","expression":{"$TYPE":"AccessMemberExpression","name":"prop","object":{"$TYPE":"AccessMemberExpression","name":"obj","object":{"$TYPE":"AccessScopeExpression","name":"$root","ancestor":0}}},"displayName":"undefined"}'),
      new RulePropertyTestData('prop[0]', '{"$TYPE":"RuleProperty","name":"\\"prop[0]\\"","expression":{"$TYPE":"AccessKeyedExpression","object":{"$TYPE":"AccessMemberExpression","name":"prop","object":{"$TYPE":"AccessScopeExpression","name":"$root","ancestor":0}},"key":{"$TYPE":"PrimitiveLiteralExpression","value":0}},"displayName":"undefined"}'),
      new RulePropertyTestData('prop[0].prop2', '{"$TYPE":"RuleProperty","name":"\\"prop[0].prop2\\"","expression":{"$TYPE":"AccessMemberExpression","name":"prop2","object":{"$TYPE":"AccessKeyedExpression","object":{"$TYPE":"AccessMemberExpression","name":"prop","object":{"$TYPE":"AccessScopeExpression","name":"$root","ancestor":0}},"key":{"$TYPE":"PrimitiveLiteralExpression","value":0}}},"displayName":"undefined"}'),
      new RulePropertyTestData('obj.prop[0]', '{"$TYPE":"RuleProperty","name":"\\"obj.prop[0]\\"","expression":{"$TYPE":"AccessKeyedExpression","object":{"$TYPE":"AccessMemberExpression","name":"prop","object":{"$TYPE":"AccessMemberExpression","name":"obj","object":{"$TYPE":"AccessScopeExpression","name":"$root","ancestor":0}}},"key":{"$TYPE":"PrimitiveLiteralExpression","value":0}},"displayName":"undefined"}'),
      new RulePropertyTestData('prop[a]', '{"$TYPE":"RuleProperty","name":"\\"prop[a]\\"","expression":{"$TYPE":"AccessKeyedExpression","object":{"$TYPE":"AccessMemberExpression","name":"prop","object":{"$TYPE":"AccessScopeExpression","name":"$root","ancestor":0}},"key":{"$TYPE":"AccessScopeExpression","name":"a","ancestor":0}},"displayName":"undefined"}'),
      new RulePropertyTestData('prop[a].prop2', '{"$TYPE":"RuleProperty","name":"\\"prop[a].prop2\\"","expression":{"$TYPE":"AccessMemberExpression","name":"prop2","object":{"$TYPE":"AccessKeyedExpression","object":{"$TYPE":"AccessMemberExpression","name":"prop","object":{"$TYPE":"AccessScopeExpression","name":"$root","ancestor":0}},"key":{"$TYPE":"AccessScopeExpression","name":"a","ancestor":0}}},"displayName":"undefined"}'),
      new RulePropertyTestData('obj.prop[a]', '{"$TYPE":"RuleProperty","name":"\\"obj.prop[a]\\"","expression":{"$TYPE":"AccessKeyedExpression","object":{"$TYPE":"AccessMemberExpression","name":"prop","object":{"$TYPE":"AccessMemberExpression","name":"obj","object":{"$TYPE":"AccessScopeExpression","name":"$root","ancestor":0}}},"key":{"$TYPE":"AccessScopeExpression","name":"a","ancestor":0}},"displayName":"undefined"}'),
      new RulePropertyTestData('prop["a"]', '{"$TYPE":"RuleProperty","name":"\\"prop[\\"a\\"]\\"","expression":{"$TYPE":"AccessKeyedExpression","object":{"$TYPE":"AccessMemberExpression","name":"prop","object":{"$TYPE":"AccessScopeExpression","name":"$root","ancestor":0}},"key":{"$TYPE":"PrimitiveLiteralExpression","value":"\\"a\\""}},"displayName":"undefined"}'),
      new RulePropertyTestData('prop["a"].prop2', '{"$TYPE":"RuleProperty","name":"\\"prop[\\"a\\"].prop2\\"","expression":{"$TYPE":"AccessMemberExpression","name":"prop2","object":{"$TYPE":"AccessKeyedExpression","object":{"$TYPE":"AccessMemberExpression","name":"prop","object":{"$TYPE":"AccessScopeExpression","name":"$root","ancestor":0}},"key":{"$TYPE":"PrimitiveLiteralExpression","value":"\\"a\\""}}},"displayName":"undefined"}'),
      new RulePropertyTestData('obj.prop["a"]', '{"$TYPE":"RuleProperty","name":"\\"obj.prop[\\"a\\"]\\"","expression":{"$TYPE":"AccessKeyedExpression","object":{"$TYPE":"AccessMemberExpression","name":"prop","object":{"$TYPE":"AccessMemberExpression","name":"obj","object":{"$TYPE":"AccessScopeExpression","name":"$root","ancestor":0}}},"key":{"$TYPE":"PrimitiveLiteralExpression","value":"\\"a\\""}},"displayName":"undefined"}'),
      new RulePropertyTestData("prop['a']", `{"$TYPE":"RuleProperty","name":"\\"prop['a']\\"","expression":{"$TYPE":"AccessKeyedExpression","object":{"$TYPE":"AccessMemberExpression","name":"prop","object":{"$TYPE":"AccessScopeExpression","name":"$root","ancestor":0}},"key":{"$TYPE":"PrimitiveLiteralExpression","value":"\\"a\\""}},"displayName":"undefined"}`),
    ];
    const rulePropWithUndExpr = new RulePropertyTestData('prop', '{"$TYPE":"RuleProperty","name":"\\"prop\\"","expression":null,"displayName":"undefined"}');
    describe('serialization', function () {
      for (const { name, getRule, serializedRule } of list) {
        it(`works for ${name}`, function () {
          assert.strictEqual(ValidationSerializer.serialize(getRule()), serializedRule);
        });
      }
      for (const { property, serializedProperty } of properties) {
        it(`works for RuleProperty - ${property}`, function () {
          const { parser } = setup();
          const [name, expression] = parsePropertyName(property, parser);
          const ruleProperty = new RuleProperty(expression, name);
          assert.strictEqual(ValidationSerializer.serialize(ruleProperty), serializedProperty);
        });
        it(`works for RuleProperty - ${property} with display name`, function () {
          const { parser } = setup();
          const [name, expression] = parsePropertyName(property, parser);
          const ruleProperty = new RuleProperty(expression, name, 'foo');
          assert.strictEqual(ValidationSerializer.serialize(ruleProperty), serializedProperty.replace('"displayName":"undefined"', '"displayName":"\\"foo\\""'));
        });
      }
      it('works for RuleProperty with undefined expression', function () {
        setup();
        const ruleProperty = new RuleProperty(void 0, rulePropWithUndExpr.property);
        assert.strictEqual(ValidationSerializer.serialize(ruleProperty), rulePropWithUndExpr.serializedProperty);
      });
      it(`throws error serializing RuleProperty if the displayName is not a string`, function () {
        const { parser } = setup();
        assert.throws(() => {
          const [name, expression] = parsePropertyName('foo', parser);
          const ruleProperty = new RuleProperty(expression, name, () => 'foo');
          ValidationSerializer.serialize(ruleProperty);
        }, 'Serializing a non-string displayName for rule property is not supported.');
      });
      it(`works for PropertyRule`, function () {
        const { parser, messageProvider, validationRules, container } = setup();
        const { property, serializedProperty } = properties[0];
        const [name, expression] = parsePropertyName(property, parser);
        const ruleProperty = new RuleProperty(expression, name);
        const [req, regex, maxLen] = simpleRuleList;
        const propertyRule = new PropertyRule(container, validationRules, messageProvider, ruleProperty, [[req.getRule(), maxLen.getRule()], [regex.getRule()]]);
        assert.strictEqual(ValidationSerializer.serialize(propertyRule), `{"$TYPE":"PropertyRule","property":${serializedProperty},"$rules":[[${req.serializedRule},${maxLen.serializedRule}],[${regex.serializedRule}]]}`);
      });
    });
    describe('deserialization', function () {
      for (const { name, getRule, serializedRule } of list) {
        it(`works for ${name}`, function () {
          setup();
          const actual = ValidationDeserializer.deserialize(serializedRule, null!);
          const expected = getRule();
          assert.instanceOf(actual, expected.constructor);
          assert.deepEqual(actual, expected);
        });
      }
      for (const { property, serializedProperty } of properties) {
        it(`works for RuleProperty - ${property}`, function () {
          const { parser } = setup();
          const [name, expression] = parsePropertyName(property, parser);
          const expected = new RuleProperty(expression, name);
          const actual = ValidationDeserializer.deserialize(serializedProperty, null!);
          assert.instanceOf(actual, expected.constructor);
          assert.deepStrictEqual(actual, expected);
        });
        it(`works for RuleProperty - ${property} with display name`, function () {
          const { parser } = setup();
          const [name, expression] = parsePropertyName(property, parser);
          const expected = new RuleProperty(expression, name, 'foo');
          const actual = ValidationDeserializer.deserialize(serializedProperty.replace('"displayName":"undefined"', '"displayName":"\\"foo\\""'), null!);
          assert.instanceOf(actual, expected.constructor);
          assert.deepStrictEqual(actual, expected);
        });
      }
      it('works for RuleProperty with undefined expression', function () {
        const { parser } = setup();
        const [name, expression] = parsePropertyName(rulePropWithUndExpr.property, parser);
        const expected = new RuleProperty(expression, name);
        const actual = ValidationDeserializer.deserialize(rulePropWithUndExpr.serializedProperty, null!);
        assert.instanceOf(actual, expected.constructor);
        assert.deepStrictEqual(actual, expected);
      });
      it(`works for PropertyRule`, function () {
        const { parser, messageProvider, validationRules, container } = setup();
        const { property, serializedProperty } = properties[0];
        const [name, expression] = parsePropertyName(property, parser);
        const ruleProperty = new RuleProperty(expression, name);
        const [req, regex, maxLen] = simpleRuleList;
        const propertyRule = new PropertyRule(container, validationRules, messageProvider, ruleProperty, [[req.getRule(), maxLen.getRule()], [regex.getRule()]]);
        const actual = ValidationDeserializer.deserialize(`{"$TYPE":"PropertyRule","property":${serializedProperty},"$rules":[[${req.serializedRule},${maxLen.serializedRule}],[${regex.serializedRule}]]}`, propertyRule.validationRules);
        assert.instanceOf(actual, propertyRule.constructor);
        assert.deepStrictEqual(actual, propertyRule);
      });
    });
    describe('hydrated ruleset validation works for', function () {
      class RuleHydrationTestData {
        public constructor(public readonly name: string, public readonly displayName: string, public readonly ruleNameMatcher: RegExp, public readonly errorMessages: readonly string[], public readonly target: any) { }
      }
      const data1 = [
        new RuleHydrationTestData('"name"', '"Name"', /required/, ['Name is required.'], new Person(null!, null!)),
        new RuleHydrationTestData('"name"', '"Name"', /regex/, ['Name is not correctly formatted.'], new Person('test', null!)),
        new RuleHydrationTestData('"name"', '"Name"', /regex.*flags/, ['Name is not correctly formatted.'], new Person('test', null!)),
        new RuleHydrationTestData('"name"', '"Name"', /max length/, ['Name cannot be longer than 42 characters.'], new Person(new Array(43).fill('a').join(''), null!)),
        new RuleHydrationTestData('"name"', '"Name"', /min length/, ['Name must be at least 42 characters.'], new Person(new Array(41).fill('a').join(''), null!)),
        new RuleHydrationTestData('"name"', '"Name"', /equals.*string/, ['Name must be 42.'], new Person('test', null!)),
        new RuleHydrationTestData('"age"', '"Age"', /required/, ['Age is required.'], new Person(null!, null!)),
        new RuleHydrationTestData('"age"', '"Age"', /min,.*range/, ['Age must be at least 42.'], new Person(null!, 41)),
        new RuleHydrationTestData('"age"', '"Age"', /,max.*range/, ['Age must be at most 42.'], new Person(null!, 43)),
        new RuleHydrationTestData('"age"', '"Age"', /\[m.*x\].*range/, ['Age must be between or equal to 40 and 42.'], new Person(null!, 43)),
        new RuleHydrationTestData('"age"', '"Age"', /\(m.*x\).*range/, ['Age must be between but not equal to 40 and 42.'], new Person(null!, 42)),
        new RuleHydrationTestData('"age"', '"Age"', /equals.*numeric/, ['Age must be 42.'], new Person('test', 41)),
      ];
      const data2 = [
        new RuleHydrationTestData('"coll"', '"Collection"', /max items/, ['Collection cannot contain more than 42 items.'], { coll: new Array(43).fill(0) }),
        new RuleHydrationTestData('"coll"', '"Collection"', /min items/, ['Collection must contain at least 42 items.'], { coll: new Array(41).fill(0) }),
      ];
      const data3 = [
        new RuleHydrationTestData('"address.line1"', '"Address line1"', /required/, ['Address line1 is required.'], new Person(null!, null!, { line1: void 0, city: void 0, pin: void 0 })),
        new RuleHydrationTestData('"address.line1"', '"Address line1"', /regex/, ['Address line1 is not correctly formatted.'], new Person(null!, null!, { line1: "test", city: void 0, pin: void 0 })),
        new RuleHydrationTestData('"address.line1"', '"Address line1"', /regex.*flags/, ['Address line1 is not correctly formatted.'], new Person(null!, null!, { line1: "test", city: void 0, pin: void 0 })),
        new RuleHydrationTestData('"address.line1"', '"Address line1"', /max length/, ['Address line1 cannot be longer than 42 characters.'], new Person(null!, null!, { line1: new Array(43).fill('a').join(''), city: void 0, pin: void 0 })),
        new RuleHydrationTestData('"address.line1"', '"Address line1"', /min length/, ['Address line1 must be at least 42 characters.'], new Person(null!, null!, { line1: new Array(41).fill('a').join(''), city: void 0, pin: void 0 })),
        new RuleHydrationTestData('"address.line1"', '"Address line1"', /equals.*string/, ['Address line1 must be 42.'], new Person('test', null!, { line1: "test", city: void 0, pin: void 0 })),
        new RuleHydrationTestData('"address.pin"', '"Pin code"', /required/, ['Pin code is required.'], new Person(null!, null!, { line1: void 0, city: void 0, pin: void 0 })),
        new RuleHydrationTestData('"address.pin"', '"Pin code"', /min,.*range/, ['Pin code must be at least 42.'], new Person(null!, null!, { line1: void 0, city: void 0, pin: 41 })),
        new RuleHydrationTestData('"address.pin"', '"Pin code"', /,max.*range/, ['Pin code must be at most 42.'], new Person(null!, null!, { line1: void 0, city: void 0, pin: 43 })),
        new RuleHydrationTestData('"address.pin"', '"Pin code"', /\[m.*x\].*range/, ['Pin code must be between or equal to 40 and 42.'], new Person(null!, null!, { line1: void 0, city: void 0, pin: 43 })),
        new RuleHydrationTestData('"address.pin"', '"Pin code"', /\(m.*x\).*range/, ['Pin code must be between but not equal to 40 and 42.'], new Person(null!, null!, { line1: void 0, city: void 0, pin: 42 })),
        new RuleHydrationTestData('"address.pin"', '"Pin code"', /equals.*numeric/, ['Pin code must be 42.'], new Person(null!, null!, { line1: void 0, city: void 0, pin: 40 })),
      ];
      const data4 = [
        new RuleHydrationTestData('"address[\'line1\']"', '"Address line1"', /required/, ['Address line1 is required.'], new Person(null!, null!, { line1: void 0, city: void 0, pin: void 0 })),
        new RuleHydrationTestData('"address[\'line1\']"', '"Address line1"', /regex/, ['Address line1 is not correctly formatted.'], new Person(null!, null!, { line1: "test", city: void 0, pin: void 0 })),
        new RuleHydrationTestData('"address[\'line1\']"', '"Address line1"', /regex.*flags/, ['Address line1 is not correctly formatted.'], new Person(null!, null!, { line1: "test", city: void 0, pin: void 0 })),
        new RuleHydrationTestData('"address[\'line1\']"', '"Address line1"', /max length/, ['Address line1 cannot be longer than 42 characters.'], new Person(null!, null!, { line1: new Array(43).fill('a').join(''), city: void 0, pin: void 0 })),
        new RuleHydrationTestData('"address[\'line1\']"', '"Address line1"', /min length/, ['Address line1 must be at least 42 characters.'], new Person(null!, null!, { line1: new Array(41).fill('a').join(''), city: void 0, pin: void 0 })),
        new RuleHydrationTestData('"address[\'line1\']"', '"Address line1"', /equals.*string/, ['Address line1 must be 42.'], new Person('test', null!, { line1: "test", city: void 0, pin: void 0 })),
        new RuleHydrationTestData('"address[\'pin\']"', '"Pin code"', /required/, ['Pin code is required.'], new Person(null!, null!, { line1: void 0, city: void 0, pin: void 0 })),
        new RuleHydrationTestData('"address[\'pin\']"', '"Pin code"', /min,.*range/, ['Pin code must be at least 42.'], new Person(null!, null!, { line1: void 0, city: void 0, pin: 41 })),
        new RuleHydrationTestData('"address[\'pin\']"', '"Pin code"', /,max.*range/, ['Pin code must be at most 42.'], new Person(null!, null!, { line1: void 0, city: void 0, pin: 43 })),
        new RuleHydrationTestData('"address[\'pin\']"', '"Pin code"', /\[m.*x\].*range/, ['Pin code must be between or equal to 40 and 42.'], new Person(null!, null!, { line1: void 0, city: void 0, pin: 43 })),
        new RuleHydrationTestData('"address[\'pin\']"', '"Pin code"', /\(m.*x\).*range/, ['Pin code must be between but not equal to 40 and 42.'], new Person(null!, null!, { line1: void 0, city: void 0, pin: 42 })),
        new RuleHydrationTestData('"address[\'pin\']"', '"Pin code"', /equals.*numeric/, ['Pin code must be 42.'], new Person(null!, null!, { line1: void 0, city: void 0, pin: 40 })),
      ];
      for (const tag of [undefined, "foo-tag"]) {
        for (const { name, displayName, ruleNameMatcher, errorMessages, target } of data1) {
          const item = simpleRuleList.find((rule) => rule.name.match(ruleNameMatcher) !== null);
          it(`simple property - ${item.name} - tag: ${tag}`, async function () {
            const modelBasedRule = new ModelBasedRule([{ $TYPE: 'PropertyRule', property: { $TYPE: 'RuleProperty', name, displayName }, $rules: [[JSON.parse(item.serializedRule)]] }], tag);
            const { container, validationRules } = setup();
            validationRules.applyModelBasedRules(Person, [modelBasedRule]);
            const validator = container.get(IValidator);
            const results = await validator.validate(new ValidateInstruction(target, undefined, undefined, tag));
            assert.deepStrictEqual(results.filter((result) => !result.valid).map((result) => result.toString()), errorMessages);
            validationRules.off(Person);
          });
        }
        for (const { name, displayName, ruleNameMatcher, errorMessages, target } of data2) {
          const item = simpleRuleList.find((rule) => rule.name.match(ruleNameMatcher) !== null);
          it(`collection property - ${item.name} - tag: ${tag}`, async function () {
            const modelBasedRule = new ModelBasedRule([{ $TYPE: 'PropertyRule', property: { $TYPE: 'RuleProperty', name, displayName }, $rules: [[JSON.parse(item.serializedRule)]] }], tag);
            const { container, validationRules } = setup();
            validationRules.applyModelBasedRules(target, [modelBasedRule]);
            const validator = container.get(IValidator);
            const results = await validator.validate(new ValidateInstruction(target, undefined, undefined, tag));
            assert.deepStrictEqual(results.filter((result) => !result.valid).map((result) => result.toString()), errorMessages);
          });
        }
        for (const { name, displayName, ruleNameMatcher, errorMessages, target } of data3) {
          const item = simpleRuleList.find((rule) => rule.name.match(ruleNameMatcher) !== null);
          it(`nested property - ${item.name} - tag: ${tag}`, async function () {
            const modelBasedRule = new ModelBasedRule([{ $TYPE: 'PropertyRule', property: { $TYPE: 'RuleProperty', name, displayName }, $rules: [[JSON.parse(item.serializedRule)]] }], tag);
            const { container, validationRules } = setup();
            validationRules.applyModelBasedRules(Person, [modelBasedRule]);
            const validator = container.get(IValidator);
            const results = await validator.validate(new ValidateInstruction(target, undefined, undefined, tag));
            assert.deepStrictEqual(results.filter((result) => !result.valid).map((result) => result.toString()), errorMessages);
            validationRules.off(Person);
          });
        }
        for (const { name, displayName, ruleNameMatcher, errorMessages, target } of data4) {
          const item = simpleRuleList.find((rule) => rule.name.match(ruleNameMatcher) !== null);
          it(`keyed property - ${item.name} - tag: ${tag}`, async function () {
            const modelBasedRule = new ModelBasedRule([{ $TYPE: 'PropertyRule', property: { $TYPE: 'RuleProperty', name, displayName }, $rules: [[JSON.parse(item.serializedRule)]] }], tag);
            const { container, validationRules } = setup();
            validationRules.applyModelBasedRules(Person, [modelBasedRule]);
            const validator = container.get(IValidator);
            const results = await validator.validate(new ValidateInstruction(target, undefined, undefined, tag));
            assert.deepStrictEqual(results.filter((result) => !result.valid).map((result) => result.toString()), errorMessages);
            validationRules.off(Person);
          });
        }
      }
    });
  });
  describe('ModelValidationExpressionHydrator', function () {
    function setup() {
      const container = TestContext.create().container;
      container.register(ValidationConfiguration);
      return {
        container,
        expressionHydrator: container.get(IValidationExpressionHydrator),
        validationRules: container.get(IValidationRules),
        messageProvider: container.get(IValidationMessageProvider),
        parser: container.get(IExpressionParser)
      };
    }
    class RuleTestData {
      public constructor(public readonly name: string, public readonly getRule: () => IValidationRule, public readonly modelRule: Record<string, any>) { }
    }
    const simpleRuleList = [
      new RuleTestData(`required rule`, function () { return new RequiredRule(); }, { required: {} }),
      new RuleTestData(`regex rule`, function () { return new RegexRule(/foo\d/); }, { regex: { pattern: { source: 'foo\\d' } } }),
      new RuleTestData(`regex rule with flags`, function () { return new RegexRule(/foo\d/gi); }, { regex: { pattern: { source: 'foo\\d', flags: 'gi' } } }),
      new RuleTestData(`max length rule`, function () { return new LengthRule(42, true); }, { maxLength: { length: 42 } }),
      new RuleTestData(`min length rule`, function () { return new LengthRule(42, false); }, { minLength: { length: 42 } }),
      new RuleTestData(`max items rule`, function () { return new SizeRule(42, true); }, { maxItems: { count: 42 } }),
      new RuleTestData(`min items rule`, function () { return new SizeRule(42, false); }, { minItems: { count: 42 } }),
      new RuleTestData(`equals rule (numeric expectation)`, function () { return new EqualsRule(42); }, { equals: { expectedValue: 42 } }),
      new RuleTestData(`equals rule (string expectation)`, function () { return new EqualsRule("42"); }, { equals: { expectedValue: "42" } }),
      new RuleTestData(`equals rule (boole expectation)`, function () { return new EqualsRule(true); }, { equals: { expectedValue: true } }),
      new RuleTestData(`equals rule (object)`, function () { return new EqualsRule({ prop: 12 }); }, { equals: { expectedValue: { prop: 12 } } }),
      new RuleTestData(`equals rule (array)`, function () { return new EqualsRule([{ prop: 12 }]); }, { equals: { expectedValue: [{ prop: 12 }] } }),
      new RuleTestData(`[min,] range rule`, function () { return new RangeRule(true, { min: 42 }); }, { range: { min: 42 } }),
      new RuleTestData(`[,max] range rule`, function () { return new RangeRule(true, { max: 42 }); }, { range: { max: 42 } }),
      new RuleTestData(`[min,max] range rule`, function () { return new RangeRule(true, { min: 40, max: 42 }); }, { range: { min: 40, max: 42 } }),
      new RuleTestData(`(min,max) range rule`, function () { return new RangeRule(false, { min: 40, max: 42 }); }, { between: { min: 40, max: 42 } }),
    ];
    const list = [
      ...simpleRuleList,
      ...simpleRuleList.map(({ name, getRule, modelRule }) => {
        const [key, value] = Object.entries(modelRule)[0];
        return new RuleTestData(
          `${name} with tag`,
          function () {
            const rule = getRule();
            rule.tag = "foo";
            return rule;
          },
          { [key]: { ...value, tag: "foo" } }
        );
      }),
      ...simpleRuleList.map(({ name, getRule, modelRule }) => {
        const [key, value] = Object.entries(modelRule)[0];
        return new RuleTestData(
          `${name} with custom messageKey`,
          function () {
            const rule = getRule();
            rule.messageKey = "foo";
            return rule;
          },
          { [key]: { ...value, messageKey: "foo" } });
      }),
    ];
    for (const { name, getRule, modelRule } of list) {
      for (const displayName of [undefined, 'foo']) {
        it(`works for ${name} ${displayName === undefined ? 'w/o' : 'with'} display name`, function () {
          const { expressionHydrator, validationRules, messageProvider, parser, container } = setup();
          const ruleset = { prop: { displayName, rules: [{ ...modelRule }] } };
          const actual = expressionHydrator.hydrateRuleset(ruleset, validationRules);
          const [propertyName, propertyExpression] = parsePropertyName('prop', parser);
          const expected = [new PropertyRule(container, validationRules, messageProvider, new RuleProperty(propertyExpression, propertyName, displayName), [[getRule()]])];

          assert.deepStrictEqual(actual, expected);
          const actualPropRule = actual[0];
          const expectedPropRule = expected[0];
          assert.instanceOf(actualPropRule, expectedPropRule.constructor);
          assert.instanceOf(actualPropRule.property, expectedPropRule.property.constructor);
          assert.instanceOf(actualPropRule.$rules[0][0], expectedPropRule.$rules[0][0].constructor);
        });
      }
    }
    it(`works for nested property`, function () {
      const { expressionHydrator, validationRules, messageProvider, parser, container } = setup();
      const requiredModelRule = simpleRuleList.find((r) => r.name.includes('required')).modelRule;
      const regexModelRule = simpleRuleList.find((r) => r.name.includes('regex')).modelRule;
      const ruleset = {
        prop1: { rules: [{ ...requiredModelRule, ...regexModelRule, }] },
        prop2: {
          subProp1: { rules: [{ ...requiredModelRule, ...regexModelRule, }] },
          subProp2: { rules: [{ ...requiredModelRule }, { ...regexModelRule, }] },
        },
        prop3: {
          subProp1: {
            subSubProp1: { rules: [{ ...requiredModelRule, ...regexModelRule, }] }
          }
        }
      };
      const actual = expressionHydrator.hydrateRuleset(ruleset, validationRules);
      const parseProperty = (name: string) => {
        const [propName, expr] = parsePropertyName(name, parser);
        return [expr, propName] as const;
      };
      const requiredRule = simpleRuleList[0].getRule();
      const regexRule = simpleRuleList[1].getRule();
      const expected = [
        new PropertyRule(container, validationRules, messageProvider, new RuleProperty(...parseProperty('prop1')), [[requiredRule, regexRule]]),
        new PropertyRule(container, validationRules, messageProvider, new RuleProperty(...parseProperty('prop2.subProp1')), [[requiredRule, regexRule]]),
        new PropertyRule(container, validationRules, messageProvider, new RuleProperty(...parseProperty('prop2.subProp2')), [[requiredRule], [regexRule]]),
        new PropertyRule(container, validationRules, messageProvider, new RuleProperty(...parseProperty('prop3.subProp1.subSubProp1')), [[requiredRule, regexRule]]),
      ];

      assert.deepStrictEqual(actual, expected);
    });
    it(`works with validationRules`, async function () {
      const { validationRules, container } = setup();
      const requiredModelRule = simpleRuleList.find((r) => r.name.includes('required')).modelRule;
      const regexModelRule = simpleRuleList.find((r) => r.name.includes('regex')).modelRule;
      const minLengthModelRule = simpleRuleList.find((r) => r.name.includes('min length')).modelRule;
      const tag = 'foo';
      const rules = [
        new ModelBasedRule(
          {
            prop1: { displayName: 'prop1', rules: [{ ...requiredModelRule, ...regexModelRule, }] },
            prop2: {
              subProp1: { displayName: 'prop2 subProp1', rules: [{ ...requiredModelRule, ...regexModelRule, }] },
              subProp2: { displayName: 'prop2 subProp2', rules: [{ ...requiredModelRule }, { ...regexModelRule, }] },
            },
            prop3: {
              subProp1: {
                subSubProp1: { displayName: 'prop3 subProp1 subSubProp1', rules: [{ ...requiredModelRule, ...regexModelRule, }] }
              }
            }
          }),
        new ModelBasedRule(
          {
            prop1: { displayName: 'prop1', rules: [{ ...requiredModelRule, ...regexModelRule, }] },
            prop2: {
              subProp2: { displayName: 'prop2 subProp2', rules: [{ ...minLengthModelRule }, { ...regexModelRule, }] },
            },
            prop3: {
              subProp2: {
                subSubProp2: { displayName: 'prop3 subProp2 subSubProp2', rules: [{ ...requiredModelRule, ...regexModelRule, }] }
              }
            }
          },
          tag)
      ];
      const target = {
        prop1: void 0,
        prop2: {
          subProp1: void 0,
          subProp2: 'test'
        },
        prop3: {
          subProp1: { subSubProp1: void 0 },
          subProp2: { subSubProp2: void 0 },
        }
      };
      validationRules.applyModelBasedRules(target, rules);

      const validator = container.get(IValidator);

      assert.deepStrictEqual(
        (await validator.validate(new ValidateInstruction(target))).filter((r) => !r.valid).map((r) => r.toString()),
        ['prop1 is required.', 'prop2 subProp1 is required.', 'prop2 subProp2 is not correctly formatted.', 'prop3 subProp1 subSubProp1 is required.']
      );

      assert.deepStrictEqual(
        (await validator.validate(new ValidateInstruction(target, undefined, undefined, tag))).filter((r) => !r.valid).map((r) => r.toString()),
        ['prop1 is required.', 'prop2 subProp2 must be at least 42 characters.', 'prop3 subProp2 subSubProp2 is required.'],
        `incorrect error messages for tag ${tag}`
      );
    });
    const conditionals = [
      { text: 'string', when: '$object.age > 1' },
      { text: 'function', when: (object: Person) => object.age > 1 },
    ];
    for (const { text, when } of conditionals) {
      it(`works for conditional rule - ${text}`, async function () {
        const { validationRules, container } = setup();
        const requiredModelRule = simpleRuleList.find((r) => r.name.includes('required')).modelRule.required;
        const rules = [
          new ModelBasedRule({ name: { rules: [{ required: { ...requiredModelRule, when } }] } })
        ];
        validationRules.applyModelBasedRules(Person, rules);
        const person = new Person(void 0, 1);

        const validator = container.get(IValidator);

        const instruction = new ValidateInstruction(person);
        assert.deepStrictEqual(
          (await validator.validate(instruction)).filter((r) => !r.valid).map((r) => r.toString()),
          [],
          'error1'
        );

        person.age = 2;
        assert.deepStrictEqual(
          (await validator.validate(instruction)).filter((r) => !r.valid).map((r) => r.toString()),
          ['Name is required.'],
          'error2'
        );

        validationRules.off(Person);
      });
    }
  });
});
