import 'aurelia-polyfills';
import { initialize } from 'aurelia-pal-nodejs';
import { Container } from 'aurelia-dependency-injection';
import { configure as configureBindingLanguage } from 'aurelia-templating-binding';
import {
  configure as configureValidation,
  ValidationRules,
  Validator
} from '../src/aurelia-validation';
import * as assert from 'assert';

initialize();
const container = new Container();
configureBindingLanguage({ container });
configureValidation({ container });

const rules = ValidationRules
  .ensure('firstName').required()
  .ensure('lastName').required()
  .rules;

const validator: Validator = container.get(Validator);

validator.validateObject({ firstName: '', lastName: 'test' }, rules)
  .then(result => {
    assert(result.length === 2);
    assert(result[0].propertyName === 'firstName');
    assert(result[0].valid === false);
    assert(result[1].propertyName === 'lastName');
    assert(result[1].valid === true);
  });

validator.validateProperty({ firstName: '', lastName: 'test' }, 'firstName', rules)
  .then(result => {
    assert(result.length === 1);
    assert(result[0].propertyName === 'firstName');
    assert(result[0].valid === false);
  });

validator.validateProperty({ firstName: '', lastName: 'test' }, 'lastName', rules)
  .then(result => {
    assert(result.length === 1);
    assert(result[0].propertyName === 'lastName');
    assert(result[0].valid === true);
  });
