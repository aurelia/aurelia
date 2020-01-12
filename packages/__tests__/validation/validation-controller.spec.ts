import { assert, TestContext } from '@aurelia/testing';
import { IValidationController, IValidationControllerFactory, IValidationRules, IValidator, ValidationConfiguration, ValidationController, ValidationControllerFactory, ValidationTrigger, ValidateInstruction, IValidateable, BaseValidationRule, ValidationResult, ControllerValidateResult, ValidationRules, PropertyRule } from '@aurelia/validation';
import { createSpecFunction, TestFunction, TestExecutionContext } from '../util';
import { Person } from './_test-resources';
import { Spy } from '../Spy';
import { IContainer, Registration } from '@aurelia/kernel';
import { Aurelia, CustomElement } from '@aurelia/runtime';

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
  class App {
    public person1: Person = new Person((void 0)!, (void 0)!);
    public person2: Person = new Person((void 0)!, (void 0)!);
    public controller: ValidationController;
    public controllerSpy: Spy;
    public person2rules: PropertyRule[];

    public constructor(@IContainer container: IContainer) {
      const factory = container.get(IValidationControllerFactory);
      this.controllerSpy = new Spy();

      // mocks ValidationCOntrollerFactory#createForCurrentScope
      const controller = this.controller = this.controllerSpy.getMock(factory.create()) as unknown as ValidationController;
      Registration.instance(IValidationController, controller).register(container);

      container.get(IValidationRules)
        .on(this.person1)

        .ensure('name')
        .required()

        .ensure('age')
        .required()
        .min(42);

      this.person2rules = container.get(IValidationRules)
        .on(this.person2)

        .ensure('name')
        .required()
        .matches(/foo/)
        .maxLength(5)

        .ensure('age')
        .required()
        .max(42)

        .rules;
    }
  }

  interface TestSetupContext {
    template: string;
  }

  async function runTest(
    testFunction: TestFunction<TestExecutionContext<App>>,
    { template }: TestSetupContext
  ) {
    const ctx = TestContext.createHTMLTestContext();
    const container = ctx.container;
    const host = ctx.dom.createElement('app');
    ctx.doc.body.appendChild(host);
    let app;
    const au = new Aurelia(container);
    await au
      .register(ValidationConfiguration)
      .app({
        host,
        component: app = (() => {
          const ca = CustomElement.define({ name: 'app', isStrictBinding: true, template }, App);
          return new ca(container);
        })()
      })
      .start()
      .wait();

    await testFunction({ app, container, host, scheduler: void 0  });

    await au.stop().wait();
    ctx.doc.body.removeChild(host);
  }
  const $it = createSpecFunction(runTest);

  $it('#validate validates both added objects and the registered bindings',
    async function ({ app: { controller: sut, person2, person1 } }) {

      assert.equal(sut['objects'].has(person2), false);

      sut.addObject(person2);
      assert.equal(sut['objects'].has(person2), true);

      const result = await sut.validate();
      assert.greaterThan(result.results.findIndex((r) => Object.is(person1, r.object)), -1);
      assert.greaterThan(result.results.findIndex((r) => Object.is(person2, r.object)), -1);
    },
    { template: `<input id="target" type="text" value.two-way="person1.name & validate">` }
  );

  [
    {
      text: '{ object }',
      getValidationInstruction: (app: App) => { return new ValidateInstruction(app.person2); },
      assertResult: (result: ControllerValidateResult, instruction: ValidateInstruction) => {
        const results = result.results;
        assert.equal(results.every((r) => Object.is(instruction.object, r.object)), true);
        assert.equal(results.filter((r) => r.propertyName === 'name').length, 3);
        assert.equal(results.filter((r) => r.propertyName === 'age').length, 2);
      }
    },
    {
      text: '{ object, propertyName }',
      getValidationInstruction: (app: App) => { return new ValidateInstruction(app.person2, 'age'); },
      assertResult: (result: ControllerValidateResult, instruction: ValidateInstruction) => {
        const results = result.results;
        assert.equal(results.every((r) => Object.is(instruction.object, r.object)), true);
        assert.equal(results.filter((r) => r.propertyName === 'name').length, 0);
        assert.equal(results.filter((r) => r.propertyName === 'age').length, 2);
      }
    },
    {
      text: '{ object, rules }',
      getValidationInstruction: (app: App) => { return new ValidateInstruction(app.person2, void 0, [app.person2rules[1]]); },
      assertResult: (result: ControllerValidateResult, instruction: ValidateInstruction) => {
        const results = result.results;
        assert.equal(results.every((r) => Object.is(instruction.object, r.object)), true);
        assert.equal(results.filter((r) => r.propertyName === 'name').length, 0);
        assert.equal(results.filter((r) => r.propertyName === 'age').length, 2);
      }
    },
    {
      text: '{ object, propertyName, rules }',
      getValidationInstruction: (app: App) => {
        const { validationRules, messageProvider, property, $rules: [[required,]] } = app.person2rules[1];
        const rule = new PropertyRule(validationRules, messageProvider, property, [[required]]);
        return new ValidateInstruction(app.person2, void 0, [rule]);
      },
      assertResult: (result: ControllerValidateResult, instruction: ValidateInstruction) => {
        const results = result.results;
        assert.equal(results.every((r) => Object.is(instruction.object, r.object)), true);
        assert.equal(results.filter((r) => r.propertyName === 'name').length, 0);
        assert.equal(results.filter((r) => r.propertyName === 'age').length, 1);
      }
    },
  ].map(({ text, getValidationInstruction, assertResult }) =>
    $it(`#validate respects explicit validation instruction - ${text}`,
      async function ({ app }) {
        const sut = app.controller;
        const instruction = getValidationInstruction(app);
        const result = await sut.validate(instruction);
        assertResult(result, instruction);
      },
      { template: `<input id="target" type="text" value.two-way="person1.name & validate">` }
    ));

  $it('does not validate objects if it is removed',
    async function ({ app: { controller: sut, person2 } }) {

      assert.equal(sut['objects'].has(person2), false);

      sut.addObject(person2);
      assert.equal(sut['objects'].has(person2), true);

      let result = await sut.validate();
      assert.greaterThan(result.results.findIndex((r) => Object.is(person2, r.object)), -1);

      sut.removeObject(person2);
      assert.equal(sut['objects'].has(person2), false);

      result = await sut.validate();
      assert.equal(result.results.findIndex((r) => Object.is(person2, r.object)), -1);
    },
    { template: `<input id="target" type="text" value.two-way="person1.name & validate">` }
  );
});
