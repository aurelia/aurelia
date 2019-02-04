import { inject, NewInstance } from 'aurelia-dependency-injection';
import { inlineView } from 'aurelia-templating';
import {
  ValidationRules,
  ValidationController
} from '../../src/aurelia-validation';

@inlineView(`
<template>
  <form novalidate autocomplete="off" if.bind="showForm">
    <input ref="standardInput"     type="text" value.bind="standardProp & validate">
    <input ref="blurInput"         type="text" value.bind="blurProp & validateOnBlur">
    <input ref="changeInput"       type="text" value.bind="changeProp & validateOnChange">
    <input ref="changeOrBlurInput" type="text" value.bind="changeOrBlurProp & validateOnChangeOrBlur">
    <input ref="manualInput"       type="text" value.bind="manualProp & validateManually">
  </form>
</template>`)
@inject(NewInstance.of(ValidationController))
export class TriggerForm {
  public standardInput: HTMLInputElement;
  public blurInput: HTMLInputElement;
  public changeInput: HTMLInputElement;
  public changeOrBlurInput: HTMLInputElement;
  public manualInput: HTMLInputElement;

  public standardProp = '';
  public blurProp = '';
  public changeProp = '';
  public changeOrBlurProp = '';
  public manualProp = '';
  public showForm = true;

  constructor(public controller: ValidationController) { }
}

ValidationRules
  .ensure((f: TriggerForm) => f.standardProp).required()
  .ensure(f => f.blurProp).required()
  .ensure(f => f.changeProp).required()
  .ensure(f => f.changeOrBlurProp).required()
  .ensure(f => f.manualProp).required()
  .on(TriggerForm);
