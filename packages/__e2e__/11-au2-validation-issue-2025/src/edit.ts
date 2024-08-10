import {
  bindable,
  newInstanceForScope,
  resolve,
  ICustomElementViewModel,
  customElement,
} from 'aurelia';
import { IValidationController } from '@aurelia/validation-html';
import { IValidationRules } from '@aurelia/validation';

@customElement({
  name: 'ed-it',
  containerless: true,
  template: `
  <form submit.trigger="submit()">
  <validation-container>
  <input value.bind="model.someProperty & validate:undefined:validationController">
  <br>
</validation-container>
<br>
<button>Submit</button>
</form>
  `,
})
export class Edit implements ICustomElementViewModel {
  @bindable public model!: Model;

  private readonly validationController = resolve(
    newInstanceForScope(IValidationController)
  );
  private readonly validationRules = resolve(IValidationRules);

  public bound() {
    this.model = structuredClone(this.model);
  }

  public attached() {
    this.setupValidationRules();
  }

  public detaching() {
    this.validationController.reset();
    this.validationRules.off();
  }

  private setupValidationRules() {
    this.validationRules
      .on(this.model)
      .ensure((x) => x.someProperty)
      .range(3, 20);
  }

  private async submit() {
    const result = await this.validationController.validate();
    console.log(result);
  }
}

export interface Model {
  someProperty: number;
}
