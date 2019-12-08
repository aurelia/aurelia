import { customElement } from '@aurelia/runtime';
import { IValidationController, IValidationControllerFactory, IValidator, ValidationRules } from '@aurelia/validation';
import template from './sut-validation.html';
import { IContainer } from '@aurelia/kernel';

@customElement({ name: 'sut-validation', template })
export class SutValidation {

  private readonly a: any = {
    b: {
      c: undefined
    },
    d: 1
  };
  private readonly controller: IValidationController;
  private readonly dstr = 'd';

  public constructor(
    @IContainer container: IContainer,
    @IValidationControllerFactory validationControllerFactory: IValidationControllerFactory,
    // @IValidationController private readonly controller: IValidationController,
    @IValidator private readonly validator: IValidator
  ) {
    this.controller = validationControllerFactory.createForCurrentScope();
    console.log('in SutValidation', this.controller['validator']);
    const controller: IValidationController = container.get(IValidationController);
    console.log(Object.is(controller, this.controller));
    console.log(Object.is(container, validationControllerFactory['container']));
  }

  public async binding() {
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

  private async validate() {
    const result = await this.controller.validate();
    console.log(result);
  }
}
