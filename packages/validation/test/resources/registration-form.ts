// tslint:disable:no-invalid-template-strings
import { inject } from 'aurelia-dependency-injection';
import { inlineView } from 'aurelia-templating';
import {
  ValidationRules,
  ValidationControllerFactory,
  ValidationController
} from '../../src/aurelia-validation';

@inlineView(`
<template>
  <form novalidate autocomplete="off" if.bind="showForm">
    <input        id="firstName" type="text" value.bind="firstName & validate">
    <input        id="lastName"  type="text" value.bind="lastName & validate">
    <input        id="email"     type="text" value.bind="email & validate">
    <input        id="number1"   type="text" number-value.bind="number1 & validate">
    <number-input id="number2"               value.bind="number2 & validate"></number-input>
    <input        id="password"        type="text" value.bind="password & validate">
    <input        id="confirmPassword" type="text" value.bind="confirmPassword & validate">
  </form>
</template>`)
@inject(ValidationControllerFactory)
export class RegistrationForm {
  public firstName = '';
  public lastName = '';
  public email = '';
  public number1 = 0;
  public number2 = 0;
  public password = '';
  public confirmPassword = '';
  public controller: ValidationController;
  public showForm = true;

  constructor(controllerFactory: ValidationControllerFactory) {
    this.controller = controllerFactory.createForCurrentScope();
  }
}

ValidationRules.customRule(
  'matchesProperty',
  (value, obj, otherPropertyName) =>
    value === null
    || value === undefined
    || value === ''
    || obj[otherPropertyName] === null
    || obj[otherPropertyName] === undefined
    || obj[otherPropertyName] === ''
    || value === obj[otherPropertyName],
  '${$displayName} must match ${$getDisplayName($config.otherPropertyName)}',
  otherPropertyName => ({ otherPropertyName })
);

ValidationRules
  .ensure((f: RegistrationForm) => f.firstName).required()
  .ensure(f => f.lastName).required()
  .ensure('email').required().email()
  .ensure(f => f.number1).satisfies(value => value > 0)
  .ensure(f => f.number2).satisfies(value => value > 0).withMessage('${displayName} gots to be greater than zero.')
  .ensure(f => f.password).required()
  .ensure(f => f.confirmPassword).required().satisfiesRule('matchesProperty', 'password')
  .on(RegistrationForm);
