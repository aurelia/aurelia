import { customElement } from '@aurelia/runtime';
import template from './app.html';
import { IValidationControllerFactory, IValidationController, ValidationController } from '@aurelia/validation';
import { IContainer } from '@aurelia/kernel';

@customElement({ name: 'app', template })
export class App {
  public readonly message: string = 'Hello World!';

  public constructor(
    @IValidationControllerFactory validationControllerFactory: IValidationControllerFactory,
    @IContainer container: IContainer,
  ) {
    const controller = validationControllerFactory.createForCurrentScope();
    console.log('in app', controller['validator']);
    const c2 = container.get<IValidationController>(IValidationController) as unknown as ValidationController;
    console.log('in app, controller from DI', c2['validator']);
    console.log(Object.is(controller, c2));
  }
}
