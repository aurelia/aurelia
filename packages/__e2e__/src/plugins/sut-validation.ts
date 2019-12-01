import { customElement } from '@aurelia/runtime';
import { IValidationControllerFactory, IValidator, ValidationRules, ValidationController } from '@aurelia/validation';
import template from './sut-validation.html';

@customElement({ name: 'sut-validation', template })
export class SutValidation {

  private readonly a: any = {
    b: {
      c: undefined
    },
    d: 1
  };
  private readonly controller: ValidationController;

  public constructor(
    @IValidationControllerFactory validationControllerFactory: IValidationControllerFactory,
    @IValidator private readonly validator: IValidator
  ) {
    this.controller = validationControllerFactory.createForCurrentScope();
  }

  public async binding() {
    const rules = new ValidationRules()
      .ensure("firstName")
      .required()
      .withMessage('hdhkjdah')
      .matches(/www/)
      .withMessageKey('re')

      .ensure("name.first.prop")
      .required()
      .withMessage('hdhkjdah')
      .matches(/www/)
      .withMessageKey('re')

      .ensure("items[0].prop")
      .required()
      .withMessage('hdhkjdah')
      .matches(/www/)
      .withMessageKey('re')

      .rules
      ;

    // console.log(rules);

    const rules1 = new ValidationRules()
      .ensure("b.c")
      .required()
      .ensure("d")
      .required()
      .rules;
    const result = await this.validator.validateObject(this.a, rules1);
    console.log(result);
  }

  private async validate() {
    const result = await this.controller.validate();
    console.log(result);
  }
}
