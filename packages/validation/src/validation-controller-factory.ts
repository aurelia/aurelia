import { ValidationController } from './validation-controller';
import { IValidator } from './validator';
import { IContainer, Registration } from '@aurelia/kernel';
import { IExpressionParser } from '@aurelia/runtime';

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
    const parser = this.container.get<IExpressionParser>(IExpressionParser);
    return new ValidationController(validator, parser);
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
