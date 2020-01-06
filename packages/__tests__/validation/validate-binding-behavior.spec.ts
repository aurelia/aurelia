import { Unparser } from '@aurelia/debug';
import { IContainer, Registration } from '@aurelia/kernel';
import { Aurelia, CustomElement, IBinding, INode, IScheduler } from '@aurelia/runtime';
import { assert, TestContext } from '@aurelia/testing';
import {
  BindingWithBehavior,
  IValidationController,
  IValidationControllerFactory,
  IValidationRules,
  ValidationConfiguration,
  ValidationController,
  ValidationTrigger,
  PropertyRule,
  RangeRule,
  RequiredRule
} from '@aurelia/validation';
import { Spy } from '../Spy';
import { Person } from './_test-resources';

describe.only('validate-biniding-behavior', function () {

  class App {
    public person: Person = new Person((void 0)!, (void 0)!);
    public tempController: ValidationController;
    public controller: ValidationController;
    public controller2: ValidationController;
    public controllerSpy: Spy;
    public controller2Spy: Spy;
    public trigger: ValidationTrigger = ValidationTrigger.change;
    public ageMinRule: PropertyRule;
    public tempAgeRule: PropertyRule[] = (void 0)!;

    public constructor(
      @IContainer container: IContainer,
    ) {
      const factory = container.get(IValidationControllerFactory);
      this.controllerSpy = new Spy();
      this.controller2Spy = new Spy();

      // mocks ValidationCOntrollerFactory#createForCurrentScope
      const controller = this.controller = this.controllerSpy.getMock(factory.create()) as unknown as ValidationController;
      Registration.instance(IValidationController, controller).register(container);

      this.controller2 = this.controller2Spy.getMock(factory.create()) as unknown as ValidationController;

      const validationRules = container.get(IValidationRules);
      const rules = validationRules
        .on(this.person)

        .ensure('name')
        .required()

        .ensure('age')
        .required()
        .min(42)
        .rules;

      const ageRule = rules.find((rule) => rule.property.name === 'age')!;
      this.ageMinRule = new PropertyRule(ageRule.validationRules, ageRule.messageProvider, ageRule.property, [[ageRule.$rules[0].find((rule) => rule instanceof RangeRule)]]);
    }
  }

  interface TestContext<TApp extends any> {
    container: IContainer;
    host: INode;
    app: TApp;
  }
  interface TestSetupContext<TApp> {
    template: string;
    customDefaultTrigger?: ValidationTrigger;
  }
  type TestFunction = (ctx: TestContext<any>) => void | Promise<void>;
  async function runTest(
    testFunction: TestFunction,
    { template, customDefaultTrigger }: TestSetupContext<any>
  ) {
    const ctx = TestContext.createHTMLTestContext();
    const container = ctx.container;
    const host = ctx.dom.createElement('app');
    ctx.doc.body.appendChild(host);
    let app;
    const au = new Aurelia(container);
    await au
      .register(
        customDefaultTrigger
          ? ValidationConfiguration.customize((options) => {
            options.defaultTrigger = customDefaultTrigger;
          })
          : ValidationConfiguration
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

    await testFunction({ app, container, host });

    await au.stop().wait();
    ctx.doc.body.removeChild(host);
  }

  function $it(title: string, testFunction: TestFunction, ctx: TestSetupContext<any>) {
    it(title, async function () {
      await runTest(testFunction, ctx);
    });
  }
  $it.only = function (title: string, testFunction: TestFunction, ctx: TestSetupContext<any>) {
    it.only(title, async function () {
      await runTest(testFunction, ctx);
    });
  };

  function assertControllerBinding(controller: ValidationController, rawExpression: string, target: INode, controllerSpy: Spy) {
    controllerSpy.methodCalledTimes('registerBinding', 1);
    const bindings = Array.from((controller['bindings'] as Map<IBinding, any>).keys()) as BindingWithBehavior[];
    assert.equal(bindings.length, 1);

    const binding = bindings[0];
    assert.equal(binding.target, target);
    assert.equal(Unparser.unparse(binding.sourceExpression.expression), rawExpression);
  }

  async function assertEventHandler(target: HTMLElement, event: 'change' | 'blur', callCount: number, scheduler: IScheduler, controllerSpy: Spy) {
    controllerSpy.clearCallRecords();
    target.dispatchEvent(new Event(event));
    await scheduler.yieldAll(10);
    controllerSpy.methodCalledTimes('validateBinding', callCount);
    controllerSpy.methodCalledTimes('validate', callCount);
  }

  $it('registers binding to the controller with default **blur** trigger',
    async function ({ app, host, container }: TestContext<App>) {
      const scheduler = container.get(IScheduler);
      const controller = app.controller;
      const controllerSpy = app.controllerSpy;

      const target: HTMLInputElement = (host as Element).querySelector("#target");
      assertControllerBinding(controller, 'person.name', target, controllerSpy);

      assert.equal(controller.errors.length, 0, 'error1');
      await controller.validate();
      assert.equal(controller.errors.length, 1, 'error2');

      target.value = 'foo';
      await assertEventHandler(target, 'change', 0, scheduler, controllerSpy);
      await assertEventHandler(target, 'blur', 1, scheduler, controllerSpy);
      assert.equal(controller.errors.filter((e) => !e.valid && e.propertyName === 'name').length, 0, 'error3');
    },
    { template: `<input id="target" type="text" value.two-way="person.name & validate">` }
  );

  $it('a default trigger can be registered - **change**',
    async function ({ app, host, container }: TestContext<App>) {
      const scheduler = container.get(IScheduler);
      const controller = app.controller;
      const controllerSpy = app.controllerSpy;

      const target: HTMLInputElement = (host as Element).querySelector("#target");
      assertControllerBinding(controller, 'person.name', target, controllerSpy);

      assert.equal(controller.errors.length, 0, 'error1');
      await controller.validate();
      assert.equal(controller.errors.length, 1, 'error2');

      target.value = 'foo';
      await assertEventHandler(target, 'blur', 0, scheduler, controllerSpy);
      await assertEventHandler(target, 'change', 1, scheduler, controllerSpy);
      assert.equal(controller.errors.filter((e) => !e.valid && e.propertyName === 'name').length, 0, 'error3');
    },
    { template: `<input id="target" type="text" value.two-way="person.name & validate:'change'">`, customDefaultTrigger: ValidationTrigger.change }
  );

  $it('supports **changeOrBlur** validation trigger',
    async function ({ app, host, container }: TestContext<App>) {
      const scheduler = container.get(IScheduler);
      const controller = app.controller;
      const controllerSpy = app.controllerSpy;

      const target: HTMLInputElement = (host as Element).querySelector("#target");
      assertControllerBinding(controller, 'person.name', target, controllerSpy);

      await assertEventHandler(target, 'blur', 1, scheduler, controllerSpy);
      assert.equal(controller.errors.filter((e) => !e.valid && e.propertyName === 'name').length, 1, 'error3');

      target.value = 'foo';
      await assertEventHandler(target, 'change', 1, scheduler, controllerSpy);
      assert.equal(controller.errors.filter((e) => !e.valid && e.propertyName === 'name').length, 0, 'error4');
    },
    { template: `<input id="target" type="text" value.two-way="person.name & validate:'changeOrBlur'">` }
  );

  $it('supports **manual** validation trigger',
    async function ({ app, host, container }: TestContext<App>) {
      const scheduler = container.get(IScheduler);
      const controller = app.controller;
      const controllerSpy = app.controllerSpy;

      const target: HTMLInputElement = (host as Element).querySelector("#target");
      assertControllerBinding(controller, 'person.name', target, controllerSpy);

      controllerSpy.clearCallRecords();
      assert.equal(controller.errors.filter((e) => !e.valid && e.propertyName === 'name').length, 0, 'error1');
      await controller.validate();
      assert.equal(controller.errors.filter((e) => !e.valid && e.propertyName === 'name').length, 1, 'error2');

      await assertEventHandler(target, 'blur', 0, scheduler, controllerSpy);
      target.value = 'foo';
      await assertEventHandler(target, 'change', 0, scheduler, controllerSpy);

      controllerSpy.clearCallRecords();
      assert.equal(controller.errors.filter((e) => !e.valid && e.propertyName === 'name').length, 1, 'error3');
      await controller.validate();
      assert.equal(controller.errors.filter((e) => !e.valid && e.propertyName === 'name').length, 0, 'error4');
    },
    { template: `<input id="target" type="text" value.two-way="person.name & validate:'manual'">` }
  );

  $it('handles changes in dynamically bound trigger value',
    async function ({ app, host, container }: TestContext<App>) {
      const scheduler = container.get(IScheduler);
      const controller = app.controller;
      const controllerSpy = app.controllerSpy;

      const target: HTMLInputElement = (host as Element).querySelector("#target");
      assertControllerBinding(controller, 'person.name', target, controllerSpy);

      assert.equal(app.trigger, ValidationTrigger.change);
      target.value = 'foo';
      await assertEventHandler(target, 'change', 1, scheduler, controllerSpy);
      await assertEventHandler(target, 'blur', 0, scheduler, controllerSpy);

      app.trigger = ValidationTrigger.blur;
      await assertEventHandler(target, 'blur', 1, scheduler, controllerSpy);
      target.value = 'bar';
      await assertEventHandler(target, 'change', 0, scheduler, controllerSpy);

      app.trigger = ValidationTrigger.changeOrBlur;
      await assertEventHandler(target, 'blur', 1, scheduler, controllerSpy);
      target.value = 'foo';
      await assertEventHandler(target, 'change', 1, scheduler, controllerSpy);

      app.trigger = ValidationTrigger.manual;
      await assertEventHandler(target, 'blur', 0, scheduler, controllerSpy);
      target.value = 'bar';
      await assertEventHandler(target, 'change', 0, scheduler, controllerSpy);
    },
    { template: `<input id="target" type="text" value.two-way="person.name & validate:trigger">` }
  );

  $it('respects bound controller',
    async function ({ app, host, container }: TestContext<App>) {
      const scheduler = container.get(IScheduler);
      const controller = app.controller;
      const controllerSpy = app.controllerSpy;
      const controller2 = app.controller2;
      const controller2Spy = app.controller2Spy;

      const target1: HTMLInputElement = (host as Element).querySelector("#target1");
      const target2: HTMLInputElement = (host as Element).querySelector("#target2");
      assertControllerBinding(controller, 'person.name', target1, controllerSpy);
      assertControllerBinding(controller2, 'person.age', target2, controller2Spy);

      target1.value = 'foo';
      target2.value = '42';
      await assertEventHandler(target1, 'change', 1, scheduler, controllerSpy);
      await assertEventHandler(target2, 'change', 1, scheduler, controller2Spy);
      assert.equal(controller.errors.filter((e) => !e.valid && e.propertyName === 'name').length, 0, 'error5');
      assert.equal(controller.errors.filter((e) => e.propertyName === 'age').length, 0, 'error6');
      assert.equal(controller2.errors.filter((e) => !e.valid && e.propertyName === 'name').length, 0, 'error7');
      assert.equal(controller2.errors.filter((e) => e.propertyName === 'name').length, 0, 'error8');
    },
    {
      template: `
    <input id="target1" type="text" value.two-way="person.name & validate:'change'">
    <input id="target2" type="text" value.two-way="person.age & validate:'change':controller2">
    ` }
  );

  $it('handles value change of the bound controller',
    async function ({ app, host, container }: TestContext<App>) {
      const scheduler = container.get(IScheduler);
      const controller = app.controller;
      const controllerSpy = app.controllerSpy;
      const controller2 = app.controller2;
      const controller2Spy = app.controller2Spy;

      const target1: HTMLInputElement = (host as Element).querySelector("#target1");
      assertControllerBinding(controller, 'person.name', target1, controllerSpy);

      await assertEventHandler(target1, 'blur', 1, scheduler, controllerSpy);
      assert.equal(controller.errors.filter((e) => !e.valid && e.propertyName === 'name').length, 1, 'error1');
      assert.equal(controller2.errors.filter((e) => !e.valid && e.propertyName === 'name').length, 0, 'error2');

      app.tempController = controller2;
      await scheduler.yieldAll(10);
      controllerSpy.methodCalledTimes('deregisterBinding', 1);
      assertControllerBinding(controller2, 'person.name', target1, controller2Spy);

      await assertEventHandler(target1, 'blur', 1, scheduler, controller2Spy);
      assert.equal(controller.errors.filter((e) => !e.valid && e.propertyName === 'name').length, 0, 'error1');
      assert.equal(controller2.errors.filter((e) => !e.valid && e.propertyName === 'name').length, 1, 'error2');
    },
    {
      template: `
    <input id="target1" type="text" value.two-way="person.name & validate:'blur':tempController">
    ` }
  );

  $it('handles the trigger-controller combo correctly',
    async function ({ app, host, container }: TestContext<App>) {
      const scheduler = container.get(IScheduler);
      const controller = app.controller;
      const controllerSpy = app.controllerSpy;
      const controller2 = app.controller2;
      const controller2Spy = app.controller2Spy;

      const target1: HTMLInputElement = (host as Element).querySelector("#target1");
      const target2: HTMLInputElement = (host as Element).querySelector("#target2");
      assertControllerBinding(controller, 'person.name', target1, controllerSpy);
      assertControllerBinding(controller2, 'person.age', target2, controller2Spy);

      await assertEventHandler(target1, 'blur', 1, scheduler, controllerSpy);
      await assertEventHandler(target2, 'blur', 0, scheduler, controller2Spy);
      assert.equal(controller.errors.filter((e) => !e.valid && e.propertyName === 'name').length, 1, 'error1');
      assert.equal(controller2.errors.filter((e) => !e.valid && e.propertyName === 'age').length, 0, 'error2');

      target1.value = 'foo';
      target2.value = '41';
      await assertEventHandler(target1, 'change', 0, scheduler, controllerSpy);
      await assertEventHandler(target2, 'change', 1, scheduler, controller2Spy);
      assert.equal(controller.errors.filter((e) => !e.valid && e.propertyName === 'name').length, 1, 'error3');
      assert.equal(controller2.errors.filter((e) => !e.valid && e.propertyName === 'age').length, 1, 'error4');
    },
    {
      template: `
    <input id="target1" type="text" value.two-way="person.name & validate:'blur':controller">
    <input id="target2" type="text" value.two-way="person.age & validate:'change':controller2">
    ` }
  );

  $it('respects bound rules',
    async function ({ app, host, container }: TestContext<App>) {
      const scheduler = container.get(IScheduler);
      const controller = app.controller;
      const controllerSpy = app.controllerSpy;

      const target2: HTMLInputElement = (host as Element).querySelector("#target2");
      assertControllerBinding(controller, 'person.age', target2, controllerSpy);

      target2.value = '41';
      await assertEventHandler(target2, 'change', 1, scheduler, controllerSpy);
      assert.equal(controller.errors.filter((e) => e.propertyName === 'age').length, 1, 'error2');

      target2.value = '42';
      await assertEventHandler(target2, 'change', 1, scheduler, controllerSpy);
      assert.equal(controller.errors.filter((e) => e.propertyName === 'age').length, 0, 'error3');
    },
    {
      template: `
    <input id="target2" type="text" value.two-way="person.age & validate:'change':controller1:[ageMinRule]">
    ` }
  );

  $it('respects change in value of bound rules',
    async function ({ app, host, container }: TestContext<App>) {
      const scheduler = container.get(IScheduler);
      const controller = app.controller;
      const controllerSpy = app.controllerSpy;

      const target2: HTMLInputElement = (host as Element).querySelector("#target2");
      assertControllerBinding(controller, 'person.age', target2, controllerSpy);

      target2.value = '41';
      await assertEventHandler(target2, 'change', 1, scheduler, controllerSpy);
      assert.equal(controller.errors.filter((e) => e.propertyName === 'age' && e.rule instanceof RangeRule).length, 1, 'error2');
      assert.equal(controller.errors.filter((e) => e.propertyName === 'age' && e.rule instanceof RequiredRule).length, 0, 'error3');

      target2.value = '42';
      await assertEventHandler(target2, 'change', 1, scheduler, controllerSpy);
      assert.equal(controller.errors.filter((e) => e.propertyName === 'age').length, 0, 'error4');

      app.tempAgeRule = [app.ageMinRule];
      await scheduler.yieldAll();

      target2.value = '';
      await assertEventHandler(target2, 'change', 1, scheduler, controllerSpy);
      assert.equal(controller.errors.filter((e) => e.propertyName === 'age' && e.rule instanceof RequiredRule).length, 0, 'error4');

      target2.value = '41';
      await assertEventHandler(target2, 'change', 1, scheduler, controllerSpy);
      assert.equal(controller.errors.filter((e) => e.propertyName === 'age' && e.rule instanceof RangeRule).length, 1, 'error5');

      target2.value = '42';
      await assertEventHandler(target2, 'change', 1, scheduler, controllerSpy);
      assert.equal(controller.errors.filter((e) => e.propertyName === 'age').length, 0, 'error6');
    },
    {
      template: `
    <input id="target2" type="text" value.two-way="person.age & validate:'change':controller1:tempAgeRule">
    ` }
  );
  [
    { args: `'chaos'`, expectedError: 'is not a supported validation trigger' },
    { args: `controller`, expectedError: 'is not a supported validation trigger' },
    { args: `ageMinRule`, expectedError: 'is not a supported validation trigger' },
    { args: `controller:'change'`, expectedError: 'is not a supported validation trigger' },
    { args: `'change':'foo'`, expectedError: 'foo is not of type ValidationController' },
    { args: `'change':{}`, expectedError: 'is not of type ValidationController' },
    { args: `'change':ageMinRule`, expectedError: 'is not of type ValidationController' },
    { args: `'change':controller:ageMinRule:'foo'`, expectedError: 'Unconsumed argument#4 for validate binding behavior: foo' },
  ].map(({ args, expectedError }) =>
    it(`throws error if the arguments are not provided in correct order - ${args}`, async function () {
      const ctx = TestContext.createHTMLTestContext();
      const container = ctx.container;
      const host = ctx.dom.createElement('app');
      const template = `<input id="target2" type="text" value.two-way="person.age & validate:${args}">`;
      ctx.doc.body.appendChild(host);
      const au = new Aurelia(container);
      try {
        await au
          .register(ValidationConfiguration)
          .app({
            host,
            component: (() => {
              const ca = CustomElement.define({ name: 'app', isStrictBinding: true, template }, App);
              return new ca(container);
            })()
          })
          .start()
          .wait();
      } catch (e) {
        assert.equal(e.message.endsWith(expectedError), true);
      }
      await au.stop().wait();
      ctx.doc.body.removeChild(host);
    }));
});
