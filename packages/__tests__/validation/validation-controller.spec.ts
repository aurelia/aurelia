import { IContainer } from '@aurelia/kernel';
import { assert, TestContext } from '@aurelia/testing';
import { IValidationController, IValidationControllerFactory, IValidationRules, IValidator, ValidationConfiguration, ValidationController, ValidationControllerFactory } from '@aurelia/validation';
import { Person } from './_test-resources';

describe.only('validation-controller-factory', function () {
  function setup() {
    const container = TestContext.createHTMLTestContext().container;
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

describe.only('validation-controller', function () {
  interface TestContext {
    sut: ValidationController;
    container: IContainer;
  }
  type TestFunction = (ctx: TestContext) => void | Promise<void>;
  async function runTest(testFunction: TestFunction) {
    const container = TestContext.createHTMLTestContext().container;
    container.register(ValidationConfiguration);
    const validationRules = container.get(IValidationRules);
    validationRules
      .on(Person)
      .ensure((o) => o.name)
      .required()
      .matches(/foo/);

    await testFunction({
      sut: container.get(IValidationControllerFactory).create() as unknown as ValidationController,
      container
    });

    validationRules.off(Person);
  }

  function $it(title: string, testFunction: TestFunction) {
    it(title, async function () {
      await runTest(testFunction);
    });
  }

  $it('#addObject registers an object to controller', function ({sut}) {
    const obj = new Person((void 0)!, (void 0)!);
    assert.equal(sut['objects'].has(obj), false);
    sut.addObject(obj);
    assert.equal(sut['objects'].has(obj), true);
  });
});
