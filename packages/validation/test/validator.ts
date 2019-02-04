import { Container } from 'aurelia-dependency-injection';
import { BindingLanguage } from 'aurelia-templating';
import { TemplatingBindingLanguage } from 'aurelia-templating-binding';
import {
  StandardValidator,
  ValidationRules,
  ValidationMessageParser,
  ValidateResult,
  PropertyAccessorParser
} from '../src/aurelia-validation';

describe('Validator', () => {
  let validator: StandardValidator;

  beforeAll(() => {
    const container = new Container();
    container.registerInstance(BindingLanguage, container.get(TemplatingBindingLanguage));
    const messageParser = container.get(ValidationMessageParser);
    const propertyParser = container.get(PropertyAccessorParser);
    ValidationRules.initialize(messageParser, propertyParser);
    validator = container.get(StandardValidator);
  });

  it('validates email', (done: () => void) => {
    let obj = { prop: 'foo@bar.com' as any };
    let rules = ValidationRules.ensure('prop').email().rules;
    validator.validateProperty(obj, 'prop', rules)
      .then(results => {
        const expected = [new ValidateResult(rules[0][0], obj, 'prop', true, null)];
        expected[0].id = results[0].id;
        expect(results).toEqual(expected);
      })
      .then(() => {
        obj = { prop: 'foo' };
        rules = ValidationRules.ensure('prop').email().rules;
        return validator.validateProperty(obj, 'prop', rules);
      })
      .then(results => {
        const expected = [new ValidateResult(rules[0][0], obj, 'prop', false, 'Prop is not a valid email.')];
        expected[0].id = results[0].id;
        expect(results).toEqual(expected);
      })
      .then(() => {
        obj = { prop: null };
        rules = ValidationRules.ensure('prop').email().rules;
        return validator.validateProperty(obj, 'prop', rules);
      })
      .then(results => {
        const expected = [new ValidateResult(rules[0][0], obj, 'prop', true, null)];
        expected[0].id = results[0].id;
        expect(results).toEqual(expected);
      })
      .then(done);
  });

  it('validates equals', (done: () => void) => {
    let obj = { prop: 'test' as any };
    let rules = ValidationRules.ensure('prop').equals('test').rules;
    validator.validateProperty(obj, 'prop', rules)
      .then(results => {
        const expected = [new ValidateResult(rules[0][0], obj, 'prop', true, null)];
        expected[0].id = results[0].id;
        expect(results).toEqual(expected);
      })
      .then(() => {
        obj = { prop: 'foo' };
        rules = ValidationRules.ensure('prop').equals('test').rules;
        return validator.validateProperty(obj, 'prop', rules);
      })
      .then(results => {
        const expected = [new ValidateResult(rules[0][0], obj, 'prop', false, 'Prop must be test.')];
        expected[0].id = results[0].id;
        expect(results).toEqual(expected);
      })
      .then(() => {
        obj = { prop: null };
        rules = ValidationRules.ensure('prop').equals('test').rules;
        return validator.validateProperty(obj, 'prop', rules);
      })
      .then(results => {
        const expected = [new ValidateResult(rules[0][0], obj, 'prop', true, null)];
        expected[0].id = results[0].id;
        expect(results).toEqual(expected);
      })
      .then(done);
  });

  it('handles numeric properties', (done: () => void) => {
    const objStr = {} as any;
    objStr['2'] = 'test';
    const objNum = {} as any;
    objNum[2] = 'test';

    const rulesStr = ValidationRules.ensure('2').equals('test').rules;
    const rulesNum = ValidationRules.ensure(2).equals('test').rules;
    Promise.resolve()
      .then(() => {
        return validator.validateProperty(objStr, 2, rulesStr);
      })
      .then(results => {
        const expected = [new ValidateResult(rulesStr[0][0], objStr, '2', true, null)];
        expected[0].id = results[0].id;
        expect(results).toEqual(expected);
        return validator.validateProperty(objNum, 2, rulesStr);
      })
      .then(results => {
        const expected = [new ValidateResult(rulesStr[0][0], objNum, '2', true, null)];
        expected[0].id = results[0].id;
        expect(results).toEqual(expected);
        return validator.validateProperty(objStr, '2', rulesStr);
      })
      .then(results => {
        const expected = [new ValidateResult(rulesStr[0][0], objStr, '2', true, null)];
        expected[0].id = results[0].id;
        expect(results).toEqual(expected);
        return validator.validateProperty(objNum, '2', rulesStr);
      })
      .then(results => {
        const expected = [new ValidateResult(rulesStr[0][0], objNum, '2', true, null)];
        expected[0].id = results[0].id;
        expect(results).toEqual(expected);
        return validator.validateProperty(objStr, 2, rulesNum);
      })
      .then(results => {
        const expected = [new ValidateResult(rulesNum[0][0], objStr, 2, true, null)];
        expected[0].id = results[0].id;
        expect(results).toEqual(expected);
        return validator.validateProperty(objNum, 2, rulesNum);
      })
      .then(results => {
        const expected = [new ValidateResult(rulesNum[0][0], objNum, 2, true, null)];
        expected[0].id = results[0].id;
        expect(results).toEqual(expected);
        return validator.validateProperty(objStr, '2', rulesNum);
      })
      .then(results => {
        const expected = [new ValidateResult(rulesNum[0][0], objStr, 2, true, null)];
        expected[0].id = results[0].id;
        expect(results).toEqual(expected);
        return validator.validateProperty(objNum, '2', rulesNum);
      })
      .then(results => {
        const expected = [new ValidateResult(rulesNum[0][0], objNum, 2, true, null)];
        expected[0].id = results[0].id;
        expect(results).toEqual(expected);
      })
      .then(done);
  });

  it('bails', (done: () => void) => {
    let obj = { prop: 'invalid email', prop2: '' };
    const spy1 = jasmine.createSpy().and.returnValue(true);
    const spy2 = jasmine.createSpy().and.returnValue(true);
    const rules = ValidationRules
      .ensure('prop').email().then().satisfies(spy1)
      .ensure('prop2').satisfies(spy2)
      .rules;
    validator.validateProperty(obj, 'prop', rules)
      .then(results => {
        const expected = [new ValidateResult(rules[0][0], obj, 'prop', false, 'Prop is not a valid email.')];
        expected[0].id = results[0].id;
        expect(results).toEqual(expected);
        expect(spy1.calls.count()).toBe(0);
      })
      .then(() => validator.validateObject(obj, rules))
      .then(results => {
        const expected = [
          new ValidateResult(rules[0][0], obj, 'prop', false, 'Prop is not a valid email.'),
          new ValidateResult(rules[0][1], obj, 'prop2', true, null)];
        expected[0].id = results[0].id;
        expected[1].id = results[1].id;
        expect(results).toEqual(expected);
        expect(spy1.calls.count()).toBe(0);
        expect(spy2.calls.count()).toBe(1);
      })
      .then(() => {
        obj = { prop: 'foo@bar.com', prop2: '' };
        return validator.validateProperty(obj, 'prop', rules);
      })
      .then(results => {
        const expected = [
          new ValidateResult(rules[0][0], obj, 'prop', true),
          new ValidateResult(rules[1][0], obj, 'prop', true),
        ];
        expected[0].id = results[0].id;
        expected[1].id = results[1].id;
        expect(results).toEqual(expected);
        expect(spy1.calls.count()).toBe(1);
      })
      .then(done);
  });

  it('handles empty rulesets', (done: () => void) => {
    const obj = { prop: 'test', __rules__: [] };

    validator.validateProperty(obj, 'test', null)
      .then(done);
  });
});
