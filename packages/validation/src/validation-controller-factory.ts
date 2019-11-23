import { ValidationController } from './validation-controller';
import { IValidator } from './validator';
import { PropertyAccessorParser } from './property-accessor-parser';
import { IContainer, Registration } from '@aurelia/kernel';

/**
 * Creates ValidationController instances.
 */
export class ValidationControllerFactory {
  public static get(container: IContainer) {
    return new ValidationControllerFactory(container);
  }

  public constructor(
    @IContainer private readonly container: IContainer,
  ) { }

  /**
   * Creates a new controller instance.
   */
  public create(validator?: IValidator) {
    validator = validator ?? this.container.get<IValidator>(IValidator);
    const propertyParser = this.container.get(PropertyAccessorParser);
    return new ValidationController(validator, propertyParser);
  }

  /**
   * Creates a new controller and registers it in the current element's container so that it's
   * available to the validate binding behavior and renderers.
   */
  public createForCurrentScope(validator?: IValidator) {
    const controller = this.create(validator);
    this.container.register(Registration.instance(ValidationController, controller));
    return controller;
  }
}
