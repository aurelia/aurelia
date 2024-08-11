import { IValidationRules } from '@aurelia/validation';
import { IValidationController } from '@aurelia/validation-html';
import {
  ICustomElementViewModel,
  bindable,
  customElement,
  newInstanceForScope,
  resolve,
} from 'aurelia';

@customElement({
  name: 'ed-it',
  containerless: true,
  template: `
  <form submit.trigger="submit()">
  <validation-container>
  <input value.bind="model.someProperty & validate">
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
    await this.validationController.validate();
  }
}

export interface Model {
  someProperty: number;
}
