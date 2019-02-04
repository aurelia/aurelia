import { inject } from 'aurelia-dependency-injection';
import { noView } from 'aurelia-templating';
import {
  ValidationRules,
  ValidationController,
  ValidationControllerFactory
} from '../../src/aurelia-validation';
import { InlineViewStrategy } from 'aurelia-framework';

@noView
@inject(ValidationControllerFactory)
export class ValidationErrorsFormOne {

  public controller: ValidationController;
  public model: any;
  public form: string;

  public standardInput: HTMLInputElement;
  public standardProp = '';

  constructor(public controllerFactory: ValidationControllerFactory) { }

  public activate(model: any) {
    this.form = model.form;
    this.model = model;
  }

  public created() {
    const controller = this.model.controller();
    this.controller = controller ? controller : this.controllerFactory.createForCurrentScope();
  }

  public getViewStrategy() {
    return new InlineViewStrategy(this.form);
  }
}

ValidationRules
  .ensure((f: ValidationErrorsFormOne) => f.standardProp).required()
  .on(ValidationErrorsFormOne);
