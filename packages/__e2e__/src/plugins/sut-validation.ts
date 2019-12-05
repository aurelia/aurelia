import { customElement } from '@aurelia/runtime';
import { IValidationControllerFactory, IValidator, ValidationRules, ValidationController, IValidationController } from '@aurelia/validation';
import template from './sut-validation.html';

@customElement({ name: 'sut-validation', template })
export class SutValidation {

  private readonly a: any = {
    b: {
      c: undefined
    },
    d: 1
  };
  // private readonly controller: ValidationController;
  private readonly dstr = 'd';

  public constructor(
    // @IValidationControllerFactory validationControllerFactory: IValidationControllerFactory,
    @IValidationController private readonly controller: IValidationController,
    @IValidator private readonly validator: IValidator
  ) {
    console.log('in SutValidation', controller['validator']);
    // this.controller = validationControllerFactory.createForCurrentScope();
  }

  public async binding(...arg: any[]) {
    console.log(arg)
    // const rules = new ValidationRules()
    //   .ensure("firstName")
    //   .required()
    //   .withMessage('hdhkjdah')
    //   .matches(/www/)
    //   .withMessageKey('re')

    //   .ensure("name.first.prop")
    //   .required()
    //   .withMessage('hdhkjdah')
    //   .matches(/www/)
    //   .withMessageKey('re')

    //   .ensure("items[0].prop")
    //   .required()
    //   .withMessage('hdhkjdah')
    //   .matches(/www/)
    //   .withMessageKey('re')

    //   .rules
    //   ;

    // console.log(rules);

    const rules1 = new ValidationRules()
      .ensure("b.c")
      .required()
      .ensure("d")
      .required()
      .on(this.a)
      .rules;
    const result = await this.validator.validateObject(this.a, rules1);
    console.log(result);
  }
  public bound(...args: any[]) {
    console.log(args);
  }

  private async validate() {
    const result = await this.controller.validate();
    console.log(result);
  }
}
