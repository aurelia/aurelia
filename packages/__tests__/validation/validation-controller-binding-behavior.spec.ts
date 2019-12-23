import { DI } from '@aurelia/kernel';
import { ValidationConfiguration, IValidationControllerFactory, IValidator, ValidationController, IValidationController, ValidationControllerFactory } from '@aurelia/validation';
import { assert } from '@aurelia/testing';

describe.only('validation-controller-factory', function () {
  function setup() {
    const container = DI.createContainer();
    container.register(ValidationConfiguration);
    return {
      sut: container.get(IValidationControllerFactory),
      container
    };
  }

  it('registered to be singleton', function () {
    const { sut, container } = setup();
    const sut1 = container.get(IValidationControllerFactory);
    assert.equal(sut, sut1);
    assert.equal((sut as ValidationControllerFactory)['container'], container);
    assert.equal((sut1 as ValidationControllerFactory)['container'], container);
  });

  it('#create instantiates transient validation-controller', function () {
    const { sut } = setup();
    const controller1 = sut.create();
    const controller2 = sut.create();
    assert.notEqual(controller1, controller2);
  });

  it('#create instantiates validation-controller with specific validator', function () {
    const { sut } = setup();
    const validator = {} as unknown as IValidator;
    const controller = sut.create(validator);
    assert.equal(controller.validator, validator);
  });

  it('#createForCurrentScope registers an instance of validation-controller to the the container', function () {
    const { sut, container } = setup();
    const controller1 = sut.createForCurrentScope();
    const controller2 = container.get(IValidationController);
    assert.equal(controller1, controller2);
  });

  it('#createForCurrentScope registers an instance of validation-controller to the the container with specific validator', function () {
    const { sut, container } = setup();
    const validator = {} as unknown as IValidator;
    const controller1 = sut.createForCurrentScope(validator);
    const controller2 = container.get(IValidationController);
    assert.equal(controller1.validator, validator);
    assert.equal(controller2.validator, validator);
  });
});
