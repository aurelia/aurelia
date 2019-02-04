import { IContainer, IFactory, IResolver, Registration } from '@aurelia/kernel';
import { PropertyAccessorParser } from './property-accessor-parser';
import { ValidationController } from './validation-controller';
import { Validator } from './validator';

/**
 * Creates ValidationController instances.
 */
export class ValidationControllerFactory implements IResolver<ValidationController> {
  private readonly container: IContainer;

  constructor(container: IContainer) {
    this.container = container;
  }

  public static get(container: IContainer): ValidationControllerFactory {
    return new ValidationControllerFactory(container);
  }

  /**
   * Creates a new controller instance.
   */
  public create(validator?: Validator): ValidationController {
    if (!validator) {
      validator = this.container.get<Validator>(Validator);
    }
    const propertyParser = this.container.get(PropertyAccessorParser);
    return new ValidationController(validator, propertyParser);
  }

  /**
   * Creates a new controller and registers it in the current element's container so that it's
   * available to the validate binding behavior and renderers.
   */
  public createForCurrentScope(validator?: Validator): ValidationController {
    const controller = this.create(validator);
    Registration.instance(ValidationController, controller).register(this.container);
    return controller;
  }

  public resolve(handler: IContainer, requestor: IContainer): ValidationController {
    const validator = handler.get<Validator>(Validator);
    const propertyParser = handler.get(PropertyAccessorParser);
    return new ValidationController(validator, propertyParser);
  }

  public getFactory(container: IContainer): IFactory<ValidationController> {
    throw new Error('Method not implemented.');
  }
}

