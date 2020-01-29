import { customElement } from '@aurelia/runtime';
import * as template from './sut-validation.html';
import { IValidationControllerFactory, IValidationController, IValidationRules, ValidationResultTarget } from '@aurelia/validation';

@customElement({ name: 'sut-validation', template })
export class SutValidation {
  private readonly controller: IValidationController;
  public errors: ValidationResultTarget[] = [];
  private person: Person;

  public constructor(
    @IValidationControllerFactory factory: IValidationControllerFactory,
    @IValidationRules validationRules: IValidationRules
  ) {
    this.controller = factory.createForCurrentScope();
    this.person = new Person(void 0, void 0, void 0);

    validationRules
      .on(this.person)
      .ensure((p) => p.name)
      .required()
      .ensure((p) => p.age)
      .required()
      .ensure((p) => p.profession)
      .required()
  }

  public async validate() {
    await this.controller.validate();
  }
}

class Person {
  public constructor(
    public name: string,
    public age: number,
    public profession: string,
  ) { }
}
