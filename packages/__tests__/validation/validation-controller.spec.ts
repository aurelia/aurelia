import { IContainer, Registration } from '@aurelia/kernel';
import { Aurelia, CustomElement, IScheduler } from '@aurelia/runtime';
import { assert, TestContext } from '@aurelia/testing';
import {
  ControllerValidateResult,
  IValidationController,
  IValidationControllerFactory,
  IValidationRules,
  IValidator,
  PropertyRule,
  ValidateEventKind,
  ValidateInstruction,
  ValidationConfiguration,
  ValidationController,
  ValidationControllerFactory,
  ValidationErrorsSubscriber,
  ValidationEvent
} from '@aurelia/validation';
import { Spy } from '../Spy';
import { createSpecFunction, TestExecutionContext, TestFunction, ToNumberValueConverter } from '../util';
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
  class App {
    public person1: Person = new Person((void 0)!, (void 0)!);
    public person2: Person = new Person((void 0)!, (void 0)!);
    public controller: ValidationController;
    public controllerSpy: Spy;
    public person2rules: PropertyRule[];
    private readonly validationRules: IValidationRules;

    public constructor(container: IContainer) {
      const factory = container.get(IValidationControllerFactory);
      this.controllerSpy = new Spy();

      // mocks ValidationCOntrollerFactory#createForCurrentScope
      const controller = this.controller = this.controllerSpy.getMock(factory.create()) as unknown as ValidationController;
      Registration.instance(IValidationController, controller).register(container);

      const validationRules = this.validationRules = container.get(IValidationRules);
      validationRules
        .on(this.person1)

        .ensure('name')
        .displayName('Name')
        .required()

        .ensure('age')
        .displayName('Age')
        .required()
        .min(42);

      this.person2rules = validationRules
        .on(this.person2)

        .ensure('name')
        .displayName('Name')
        .required()
        .matches(/foo/)
        .maxLength(5)

        .ensure('age')
        .displayName('Age')
        .required()
        .max(42)

        .rules;
    }

    public beforeUnbind() {
      this.validationRules.off();
    }
  }
  class FooSubscriber implements ValidationErrorsSubscriber {
    public notifications: ValidationEvent[] = [];
    public handleValidationEvent(event: ValidationEvent): void {
      this.notifications.push(event);
    }
  }

  interface TestSetupContext {
    template: string;
  }

  async function runTest(
    testFunction: TestFunction<TestExecutionContext<App>>,
    { template = '' }: Partial<TestSetupContext> = {}
  ) {
    const ctx = TestContext.createHTMLTestContext();
    const container = ctx.container;
    const host = ctx.dom.createElement('app');
    ctx.doc.body.appendChild(host);
    let app;
    const au = new Aurelia(container);
    await au
      .register(
        ValidationConfiguration,
        ToNumberValueConverter
      )
      .app({
        host,
        component: app = (() => {
          const ca = CustomElement.define({ name: 'app', isStrictBinding: true, template }, App);
          return new ca(container);
        })()
      })
      .start()
      .wait();

    await testFunction({ app, container, host, scheduler: container.get(IScheduler) });

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
      assert.equal(sut.results.findIndex((r) => Object.is(person2, r.object)), -1);

      result = await sut.validate();
      assert.equal(result.results.findIndex((r) => Object.is(person2, r.object)), -1);
    },
    { template: `<input id="target" type="text" value.two-way="person1.name & validate">` }
  );

  $it(`can be used to add/remove subscriber of validation errors`,
    async function ({ app: { controller: sut, person2 } }) {
      const subscriber1 = new FooSubscriber();
      const subscriber2 = new FooSubscriber();
      sut.addSubscriber(subscriber1);
      sut.addSubscriber(subscriber2);

      sut.addObject(person2);

      await sut.validate();
      const notifications1 = subscriber1.notifications;
      const notifications2 = subscriber2.notifications;
      assert.equal(notifications1.length, 1);
      assert.equal(notifications2.length, 1);
      const validateEvent = notifications1[0];
      assert.equal(validateEvent, notifications2[0]);
      assert.equal(validateEvent.kind, ValidateEventKind.validate);
      assert.equal(validateEvent.addedResults.every((r) => r.result.valid), false);

      notifications1.splice(0);
      notifications2.splice(0);

      sut.removeSubscriber(subscriber2);

      person2.name = 'foo';
      person2.age = 41;
      await sut.validate();

      assert.equal(notifications2.length, 0);
      assert.equal(notifications1.length, 1);

      const removedResults = notifications1[0].removedResults.map((r) => r.result);
      assert.equal(validateEvent.addedResults.map((r) => r.result).every((r) => removedResults.includes(r)), true);
      assert.equal(notifications1[0].addedResults.every((r) => r.result.valid), true);
    }
  );

  [
    { text: 'with propertyName', property: 'name' },
    { text: 'without propertyName', property: undefined },
  ].map(({ text, property }) =>
    $it(`lets add custom error - ${text}`,
      async function ({ app: { controller: sut, person1 }, scheduler, host }) {
        const subscriber = new FooSubscriber();
        const msg = 'foobar';
        sut.addSubscriber(subscriber);
        sut.addError(msg, person1, property);
        await scheduler.yieldAll();

        const result = sut.results.find((r) => r.object === person1 && r.propertyName === property);
        assert.notEqual(result, void 0);
        assert.equal(result.message, msg);
        assert.equal(result.isManual, true);
        assert.equal(result.valid, false);

        const events = subscriber.notifications;
        assert.equal(events.length, 1);
        assert.equal(events[0].kind, ValidateEventKind.validate);
        const addedErrors = events[0].addedResults;
        assert.equal(addedErrors.length, 1);
        assert.equal(addedErrors[0].result, result);

        assert.html.textContent('span.error', msg, 'incorrect msg', host);
      },
      {
        template: `
    <input id="target" type="text" value.two-way="person1.name & validate">
    <span class="error" repeat.for="result of controller.results">
      \${result.message}
    </span>
    ` }
    ));

  [
    { text: 'with propertyName', property: 'name' },
    { text: 'without propertyName', property: undefined },
  ].map(({ text, property }) =>
    $it(`lets remove custom error - ${text}`,
      async function ({ app: { controller: sut, person1 }, scheduler, host }) {
        const subscriber = new FooSubscriber();
        const msg = 'foobar';
        sut.addSubscriber(subscriber);
        sut.addError(msg, person1, property);
        await scheduler.yieldAll();
        assert.html.textContent('span.error', msg, 'incorrect msg', host);

        const result = sut.results.find((r) => r.object === person1 && r.propertyName === property && r.isManual);
        const events = subscriber.notifications;
        events.splice(0);

        sut.removeError(result);
        await scheduler.yieldAll();

        assert.equal(events.length, 1);
        assert.equal(events[0].kind, ValidateEventKind.reset);
        const removedErrors = events[0].removedResults;
        assert.equal(removedErrors.length, 1);
        assert.equal(removedErrors[0].result, result);
      },
      {
        template: `
    <input id="target" type="text" value.two-way="person1.name & validate">
    <span class="error" repeat.for="result of controller.results">
      \${result.message}
    </span>
    ` }
    ));

  $it(`lets remove error`,
    async function ({ app: { controller: sut, person1 }, scheduler, host }) {
      const subscriber = new FooSubscriber();
      const msg = 'Name is required.';
      sut.addSubscriber(subscriber);
      await sut.validate();
      await scheduler.yieldAll();
      assert.html.textContent('span.error', msg, 'incorrect msg', host);

      const result = sut.results.find((r) => r.object === person1 && r.propertyName === 'name' && !r.valid);
      const events = subscriber.notifications;
      events.splice(0);

      sut.removeError(result);
      await scheduler.yieldAll();

      assert.equal(events.length, 1);
      assert.equal(events[0].kind, ValidateEventKind.reset);
      const removedErrors = events[0].removedResults;
      assert.equal(removedErrors.length, 1);
      assert.equal(removedErrors[0].result, result);
    },
    {
      template: `
      <input id="target" type="text" value.two-way="person1.name & validate">
      <span class="error" repeat.for="result of controller.results">
        \${result.message}
      </span>
      `
    }
  );

  $it(`can be used to re-validate the existing errors`,
    async function ({ app: { controller: sut, person2 } }) {
      sut.addObject(person2);

      await sut.validate();
      const results = sut.results;
      const errors = results.filter((r) => !r.valid);
      assert.equal(errors.length, 2);
      const nameError = errors[0];
      const ageError = errors[1];
      assert.equal(nameError.valid, false);
      assert.equal(nameError.message, `Name is required.`);
      assert.equal(nameError.object, person2);
      assert.equal(ageError.valid, false);
      assert.equal(ageError.message, `Age is required.`);
      assert.equal(ageError.object, person2);

      person2.name = 'foobar';
      person2.age = 43;

      await sut.revalidateErrors();
      assert.equal(results.filter((r) => !r.valid).length, 0);
    }
  );
});
