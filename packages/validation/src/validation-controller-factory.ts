import { Container } from 'aurelia-dependency-injection';
import { ValidationController } from './validation-controller';
import { Validator } from './validator';
import { PropertyAccessorParser } from './property-accessor-parser';

/**
 * Creates ValidationController instances.
 */
export class ValidationControllerFactory {
  public static get(container: Container) {
    return new ValidationControllerFactory(container);
  }

  constructor(private container: Container) { }

  /**
   * Creates a new controller instance.
   */
  public create(validator?: Validator) {
    if (!validator) {
      validator = this.container.get(Validator) as Validator;
    }
    const propertyParser = this.container.get(PropertyAccessorParser) as PropertyAccessorParser;
    return new ValidationController(validator, propertyParser);
  }

  /**
   * Creates a new controller and registers it in the current element's container so that it's
   * available to the validate binding behavior and renderers.
   */
  public createForCurrentScope(validator?: Validator) {
    const controller = this.create(validator);
    this.container.registerInstance(ValidationController, controller);
    return controller;
  }
}

(ValidationControllerFactory as any)['protocol:aurelia:resolver'] = true;
