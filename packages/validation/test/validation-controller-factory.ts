import { Container, Optional } from 'aurelia-dependency-injection';
import {
  ValidationControllerFactory,
  ValidationController,
  Validator
} from '../src/aurelia-validation';

describe('ValidationControllerFactory', () => {
  it('createForCurrentScope', () => {
    const container = new Container();
    const standardValidator = {};
    container.registerInstance(Validator, standardValidator);
    const childContainer = container.createChild();
    const factory = childContainer.get(ValidationControllerFactory);
    const controller = factory.createForCurrentScope();
    expect(controller.validator).toBe(standardValidator);
    expect(container.get(Optional.of(ValidationController))).toBe(null);
    expect(childContainer.get(Optional.of(ValidationController))).toBe(controller);
    const customValidator = {};
    expect(factory.createForCurrentScope(customValidator).validator).toBe(customValidator);
  });
});
