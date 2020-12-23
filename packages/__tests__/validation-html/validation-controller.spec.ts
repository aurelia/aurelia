import { IServiceLocator, newInstanceForScope } from '@aurelia/kernel';
import { Aurelia, CustomElement, IPlatform, customElement } from '@aurelia/runtime-html';
import { assert, TestContext } from '@aurelia/testing';
import {
  IValidationRules,
  PropertyRule,
  ValidateInstruction,
} from '@aurelia/validation';
import {
  ControllerValidateResult,
  IValidationController,
  ValidateEventKind,
  ValidationController,
  ValidationResultsSubscriber,
  ValidationEvent,
  ValidationHtmlConfiguration,
} from '@aurelia/validation-html';
import { createSpecFunction, TestExecutionContext, TestFunction, ToNumberValueConverter } from '../util.js';
import { Person } from '../validation/_test-resources.js';

describe('validation controller factory', function () {
  @customElement({
    name: 'app',
    isStrictBinding: true,
    template: `<vc-root></vc-root>`
  })
  class App { }
  @customElement({
    name: 'vc-root',
    isStrictBinding: true,
    template: `
  <custom-stuff1></custom-stuff1>
  <custom-stuff2></custom-stuff2>
  <new-vc-root></new-vc-root>
  `
  })
  class VcRoot {
    public constructor(
      @newInstanceForScope(IValidationController) public controller1: ValidationController,
      @newInstanceForScope(IValidationController) public controller2: ValidationController,
      @IValidationController public controller3: ValidationController,
    ) { }
  }

  @customElement({ name: 'new-vc-root', template: `<custom-stuff3></custom-stuff3>` })
  class NewVcRoot {
    public constructor(
      @newInstanceForScope(IValidationController) public controller: ValidationController
    ) { }
  }

  @customElement({ name: 'custom-stuff1', template: `custom stuff1` })
  class CustomStuff1 {
    public constructor(
      @IValidationController public controller: ValidationController
    ) { }
  }

  @customElement({ name: 'custom-stuff2', template: `custom stuff2` })
  class CustomStuff2 {
    public constructor(
      @IValidationController public controller: ValidationController
    ) { }
  }

  @customElement({ name: 'custom-stuff3', template: `custom stuff3` })
  class CustomStuff3 {
    public constructor(
      @IValidationController public controller: ValidationController
    ) { }
  }

  async function runTest(
    testFunction: TestFunction<TestExecutionContext<VcRoot>>,
  ) {
    const ctx = TestContext.create();
    const container = ctx.container;
    const host = ctx.doc.createElement('div');
    ctx.doc.body.appendChild(host);
    const au = new Aurelia(container);
    await au
      .register(
        ValidationHtmlConfiguration,
        VcRoot,
        NewVcRoot,
        CustomStuff1,
        CustomStuff2,
        CustomStuff3
      )
      .app({ host, component: App })
      .start();

    await testFunction({ app: void 0, container, host, platform: container.get(IPlatform), ctx });

    await au.stop();
    ctx.doc.body.removeChild(host);

    au.dispose();
  }
  const $it = createSpecFunction(runTest);

  $it('injection of validation controller is done properly', function ({ host }) {
    const vcRootEl: HTMLElement = host.querySelector('vc-root');
    const vcRootVm: VcRoot = CustomElement.for(vcRootEl).viewModel as any;

    const cs1: CustomStuff1 = CustomElement.for(host.querySelector('custom-stuff1')).viewModel as any;
    const cs2: CustomStuff2 = CustomElement.for(host.querySelector('custom-stuff2')).viewModel as any;

    const newVcRootEl = host.querySelector('new-vc-root');
    const newVcRoot: NewVcRoot = CustomElement.for(newVcRootEl).viewModel as any;
    const cs3: CustomStuff3 = CustomElement.for(newVcRootEl.querySelector('custom-stuff3')).viewModel as any;

    assert.equal(!!vcRootVm.controller1, true, 'error8');
    assert.equal(!!vcRootVm.controller2, true, 'error9');
    assert.equal(!!vcRootVm.controller3, true, 'error10');

    assert.equal(vcRootVm.controller1, vcRootVm.controller3, 'error1');
    assert.notEqual(vcRootVm.controller1, vcRootVm.controller2, 'error2');

    assert.equal(!!cs1.controller, true, 'error11');
    assert.equal(!!cs2.controller, true, 'error12');
    assert.equal(vcRootVm.controller1, cs1.controller, 'error3');
    assert.equal(vcRootVm.controller1, cs2.controller, 'error4');

    assert.notEqual(vcRootVm.controller1, newVcRoot.controller, 'error5');
    assert.notEqual(vcRootVm.controller2, newVcRoot.controller, 'error6');

    assert.equal(!!cs3.controller, true, 'error13');
    assert.equal(newVcRoot.controller, cs3.controller, 'error7');
  });
});

describe('validation-controller', function () {
  class App {
    public person1: Person = new Person((void 0)!, (void 0)!);
    public person2: Person = new Person((void 0)!, (void 0)!);
    public person2rules: PropertyRule[];

    public constructor(
      @IServiceLocator public locator: IServiceLocator,
      @newInstanceForScope(IValidationController) public controller: ValidationController,
      @IValidationRules public readonly validationRules: IValidationRules,
    ) {
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

    public unbinding() {
      this.validationRules.off();
      // mandatory cleanup in root
      this.controller.reset();
    }

    public dispose() {
      const controller = this.controller;
      assert.equal(controller.results.length, 0, 'the result should have been removed');
      assert.equal(controller.bindings.size, 0, 'the bindings should have been removed');
      assert.equal(controller.objects.size, 0, 'the objects should have been removed');
    }
  }
  class FooSubscriber implements ValidationResultsSubscriber {
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
    const ctx = TestContext.create();
    const container = ctx.container;
    const host = ctx.doc.createElement('app');
    ctx.doc.body.appendChild(host);
    const au = new Aurelia(container);
    await au
      .register(
        ValidationHtmlConfiguration,
        ToNumberValueConverter
      )
      .app({
        host,
        component: CustomElement.define({ name: 'app', isStrictBinding: true, template }, App)
      })
      .start();

    const app = au.root.controller.viewModel as App;
    await testFunction({ app, container, host, platform: container.get(IPlatform), ctx });

    await au.stop();
    ctx.doc.body.removeChild(host);

    au.dispose();
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

      // cleanup
      sut.removeObject(person2);
    },
    { template: `<input id="target" type="text" value.two-way="person1.name & validate">` }
  );

  const instructionTestData = [
    {
      text: '{ object }',
      getValidationInstruction: (app: App) => { return new ValidateInstruction(app.person2); },
      assertResult: (result: ControllerValidateResult, instruction: ValidateInstruction<Person>) => {
        const results = result.results;
        assert.equal(results.every((r) => Object.is(instruction.object, r.object)), true);
        assert.equal(results.filter((r) => r.propertyName === 'name').length, 3);
        assert.equal(results.filter((r) => r.propertyName === 'age').length, 2);
      }
    },
    {
      text: '{ object, propertyName }',
      getValidationInstruction: (app: App) => { return new ValidateInstruction(app.person2, 'age'); },
      assertResult: (result: ControllerValidateResult, instruction: ValidateInstruction<Person>) => {
        const results = result.results;
        assert.equal(results.every((r) => Object.is(instruction.object, r.object)), true);
        assert.equal(results.filter((r) => r.propertyName === 'name').length, 0);
        assert.equal(results.filter((r) => r.propertyName === 'age').length, 2);
      }
    },
    {
      text: '{ object, rules }',
      getValidationInstruction: (app: App) => { return new ValidateInstruction(app.person2, void 0, [app.person2rules[1]]); },
      assertResult: (result: ControllerValidateResult, instruction: ValidateInstruction<Person>) => {
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
        const rule = new PropertyRule(app.locator, validationRules, messageProvider, property, [[required]]);
        return new ValidateInstruction(app.person2, void 0, [rule]);
      },
      assertResult: (result: ControllerValidateResult, instruction: ValidateInstruction<Person>) => {
        const results = result.results;
        assert.equal(results.every((r) => Object.is(instruction.object, r.object)), true);
        assert.equal(results.filter((r) => r.propertyName === 'name').length, 0);
        assert.equal(results.filter((r) => r.propertyName === 'age').length, 1);
      }
    },
  ];
  for (const { text, getValidationInstruction, assertResult } of instructionTestData) {
    $it(`#validate respects explicit validation instruction - ${text}`,
      async function ({ app }) {
        const sut = app.controller;
        const instruction: ValidateInstruction<Person> = getValidationInstruction(app);
        const result = await sut.validate(instruction);
        assertResult(result, instruction);
      },
      { template: `<input id="target" type="text" value.two-way="person1.name & validate">` }
    );
  }

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

      // cleanup
      sut.removeObject(person2);
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

      // cleanup
      sut.removeObject(person2);
    }
  );

  const testData1 = [
    { text: 'with propertyName', property: 'name' },
    { text: 'without propertyName', property: undefined },
  ];
  for (const { text, property } of testData1) {
    $it(`lets add custom error - ${text}`,
      async function ({ app: { controller: sut, person1 }, platform, host }) {
        const subscriber = new FooSubscriber();
        const msg = 'foobar';
        sut.addSubscriber(subscriber);
        sut.addError(msg, person1, property);
        await platform.domReadQueue.yield();

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
    );

    $it(`lets remove custom error - ${text}`,
      async function ({ app: { controller: sut, person1 }, platform, host }) {
        const subscriber = new FooSubscriber();
        const msg = 'foobar';
        sut.addSubscriber(subscriber);
        const result = sut.addError(msg, person1, property);
        await platform.domReadQueue.yield();
        assert.html.textContent('span.error', msg, 'incorrect msg', host);

        const events = subscriber.notifications;
        events.splice(0);

        sut.removeError(result);
        await platform.domReadQueue.yield();

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
    );
  }

  $it(`lets remove error`,
    async function ({ app: { controller: sut, person1 }, platform, host }) {
      const subscriber = new FooSubscriber();
      const msg = 'Name is required.';
      sut.addSubscriber(subscriber);
      await sut.validate();
      await platform.domReadQueue.yield();
      assert.html.textContent('span.error', msg, 'incorrect msg', host);

      const result = sut.results.find((r) => r.object === person1 && r.propertyName === 'name' && !r.valid);
      const events = subscriber.notifications;
      events.splice(0);

      sut.removeError(result);
      await platform.domReadQueue.yield();

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

      // cleanup
      sut.removeObject(person2);
    }
  );

  $it(`revalidateErrors does not remove the manually added errors - w/o pre-existing errors`,
    async function ({ app: { controller: sut, person1 }, platform, host }) {
      const msg = 'foobar';
      const result = sut.addError(msg, person1);
      await platform.domReadQueue.yield();
      assert.html.textContent('span.error', msg, 'incorrect msg', host);

      await sut.revalidateErrors();
      assert.includes(sut.results, result);
    },
    {
      template: `
  <input id="target" type="text" value.two-way="person1.name & validate">
  <span class="error" repeat.for="result of controller.results">
    \${result.message}
  </span>
  ` }
  );

  $it(`revalidateErrors does not remove the manually added errors - with pre-exiting errors`,
    async function ({ app: { controller: sut, person1 } }) {
      await sut.validate();
      const msg = 'foobar';
      sut.addError(msg, person1);
      assert.deepStrictEqual(sut.results.filter((r) => !r.valid).map((r) => r.toString()), ['Name is required.', msg]);

      person1.name = "test";
      await sut.revalidateErrors();
      assert.deepStrictEqual(sut.results.filter((r) => !r.valid).map((r) => r.toString()), [msg]);
    },
    {
      template: `<input id="target" type="text" value.two-way="person1.name & validate">`
    }
  );

  $it(`validate removes the manually added errors`,
    async function ({ app: { controller: sut, person1 } }) {
      await sut.validate();
      const msg = 'foobar';
      sut.addError(msg, person1);
      assert.deepStrictEqual(sut.results.filter((r) => !r.valid).map((r) => r.toString()), ['Name is required.', msg]);

      await sut.validate();
      assert.deepStrictEqual(sut.results.filter((r) => !r.valid).map((r) => r.toString()), ['Name is required.']);
    },
    {
      template: `<input id="target" type="text" value.two-way="person1.name & validate">`
    }
  );

  $it(`can be used to validate all the tagged objects registered`,
    async function ({ app: { controller: sut, validationRules } }) {
      const obj1 = { a: 1, b: 2 };
      const tag = 'tag';
      validationRules
        .on(obj1, tag)
        .ensure('a')
        .equals(42);
      sut.addObject(obj1);

      await sut.validate(new ValidateInstruction((void 0)!, (void 0)!, (void 0)!, tag));

      assert.deepEqual(sut.results.map((r) => r.toString()), ['A must be 42.']);

      // cleanup
      sut.removeObject(obj1);
    }
  );

  $it(`validates object only based on specific ruleset when specified`,
    async function ({ app: { controller: sut, validationRules } }) {
      const obj: Person = new Person((void 0)!, (void 0)!, (void 0)!);
      const tag1 = 'tag1', tag2 = 'tag2';
      validationRules
        .on(obj, tag1)
        .ensure('name')
        .required()

        .on(obj, tag2)
        .ensure('age')
        .required();

      const { valid, results } = await sut.validate(new ValidateInstruction(obj, void 0, void 0, tag1));

      assert.equal(valid, false);
      const messages = ['Name is required.'];
      assert.deepEqual(results.map((r) => r.toString()), messages);
      assert.deepEqual(sut.results.filter((r) => !r.valid).map((r) => r.toString()), messages);

      validationRules.off();
    });

  $it(`validates object property only based on the tagged rules when specified`,
    async function ({ app: { controller: sut, validationRules } }) {
      const obj: Person = new Person((void 0)!, (void 0)!, (void 0)!);
      const tag1 = 'tag1', tag2 = 'tag2';
      const msg1 = 'msg1', msg2 = 'msg2';
      validationRules
        .on(obj)
        .ensure('name')
        .satisfies((value) => value === 'fizbaz')
        .withMessage(msg1)
        .tag(tag1)
        .satisfies((value) => value === 'foobar')
        .withMessage(msg2)
        .tag(tag2);

      const { valid, results } = await sut.validate(new ValidateInstruction(obj, void 0, void 0, void 0, tag1));

      assert.equal(valid, false);
      assert.deepEqual(results.map((r) => r.toString()), [msg1]);
      assert.deepEqual(sut.results.filter((r) => !r.valid).map((r) => r.toString()), [msg1]);

      validationRules.off();
    });

  $it(`validates object based on both the object and property tags`,
    async function ({ app: { controller: sut, validationRules } }) {
      const obj: Person = new Person((void 0)!, (void 0)!, (void 0)!);
      const tag1 = 'tag1', tag2 = 'tag2';
      const pTag1 = 'ptag1', pTag2 = 'ptag2';
      const msg1 = 'msg1', msg2 = 'msg2';

      validationRules
        .on(obj, tag1)
        .ensure('name')
        .satisfies((value) => value === 'fizbaz')
        .withMessage(msg1)
        .tag(pTag1)
        .satisfies((value) => value === 'foobar')
        .withMessage(msg2)
        .tag(pTag2)

        .on(obj, tag2)
        .ensure('age')
        .required();

      const { valid, results } = await sut.validate(new ValidateInstruction(obj, void 0, void 0, tag1, pTag1));

      assert.equal(valid, false);
      assert.deepEqual(results.map((r) => r.toString()), [msg1]);
      assert.deepEqual(sut.results.filter((r) => !r.valid).map((r) => r.toString()), [msg1]);

      validationRules.off();
    });

  $it('#validate does not produce duplicate result if the same object is also registered as well as used in binding',
    async function ({ app: { controller: sut, person1 } }) {
      assert.equal(sut['objects'].has(person1), false);

      sut.addObject(person1);
      assert.equal(sut['objects'].has(person1), true);

      const result = await sut.validate();
      assert.deepStrictEqual(result.results.filter((r) => !r.valid).map((r) => r.toString()), ['Name is required.', 'Age is required.']);

      // cleanup
      sut.removeObject(person1);
    },
    { template: `<input id="target" type="text" value.two-way="person1.name & validate">` }
  );
});
