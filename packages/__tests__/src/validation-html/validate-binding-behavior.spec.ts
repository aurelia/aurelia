import { callSyntax, delegateSyntax } from '@aurelia/compat-v1';
import { DI, IServiceLocator, newInstanceForScope, newInstanceOf, Registration, resolve } from '@aurelia/kernel';
import { Unparser } from '@aurelia/expression-parser';
import {
  type ArrayObserver,
  IObserverLocator,
  getCollectionObserver,
  Scope,
  tasksSettled,
  queueAsyncTask,
} from '@aurelia/runtime';
import {
  type BindingBehaviorInstance,
  type IBinding,
  bindable,
  bindingBehavior,
  customAttribute,
  valueConverter,
  CustomElement,
  customElement,
  IPlatform,
  INode,
  Aurelia,
} from '@aurelia/runtime-html';
import { assert, createFixture, createSpy, ISpy, TestContext } from '@aurelia/testing';
import { IValidationRules, PropertyRule, RangeRule, RequiredRule } from '@aurelia/validation';
import {
  BindingWithBehavior,
  IValidationController,
  ValidationController,
  ValidationHtmlConfiguration,
  ValidationTrigger,
  BindingMediator,
  type ControllerValidateResult,
  BindingInfo,
} from '@aurelia/validation-html';
import { createSpecFunction, TestExecutionContext, TestFunction, ToNumberValueConverter, $TestSetupContext } from '../util.js';
import { Address, Organization, Person } from '../validation/_test-resources.js';

describe('validation-html/validate-binding-behavior.spec.ts', function () {
  describe('validate-binding-behavior', function () {
    const $atob = typeof atob === 'function' ? atob : (b64: string) => Buffer.from(b64, 'base64').toString();
    const $btoa = typeof btoa === 'function' ? btoa : (plainText: string) => Buffer.from(plainText).toString('base64');
    const IObserveCollection = DI.createInterface('IObserveCollection');

    class App {
      public validatableProp: string = (void 0)!;
      public person: Person = new Person((void 0)!, (void 0)!);
      public tempController: ValidationController;
      public controllerRegisterBindingSpy: ISpy;
      public controllerUnregisterBindingSpy: ISpy;
      public controllerValidateBindingSpy: ISpy;
      public controllerValidateSpy: ISpy;
      public controller2RegisterBindingSpy: ISpy;
      public controller2UnregisterBindingSpy: ISpy;
      public controller2ValidateBindingSpy: ISpy;
      public controller2ValidateSpy: ISpy;

      public trigger: ValidationTrigger = ValidationTrigger.change;
      public ageMinRule: PropertyRule;
      public tempAgeRule: PropertyRule[] = (void 0)!;
      public org: Organization = new Organization([], void 0);
      public employeesMediator: BindingMediator<'handleEmployeesChange'>;
      public employeeObserver: ArrayObserver;
      private readonly obj: any;

      public readonly controller: ValidationController = resolve(newInstanceForScope(IValidationController)) as ValidationController;
      public readonly controller2: ValidationController = resolve(newInstanceOf(IValidationController)) as ValidationController;
      public readonly platform: IPlatform = resolve(IPlatform);
      private readonly validationRules: IValidationRules = resolve(IValidationRules);
      public constructor(
        observerLocator: IObserverLocator = resolve(IObserverLocator),
        serviceLocator: IServiceLocator = resolve(IServiceLocator),
        observeCollection = resolve(IObserveCollection) ?? false,
      ) {
        this.controllerRegisterBindingSpy = createSpy(this.controller, 'registerBinding', true);
        this.controllerUnregisterBindingSpy = createSpy(this.controller, 'unregisterBinding', true);
        this.controllerValidateBindingSpy = createSpy(this.controller, 'validateBinding', true);
        this.controllerValidateSpy = createSpy(this.controller, 'validate', true);
        this.controller2RegisterBindingSpy = createSpy(this.controller2, 'registerBinding', true);
        this.controller2UnregisterBindingSpy = createSpy(this.controller2, 'unregisterBinding', true);
        this.controller2ValidateBindingSpy = createSpy(this.controller2, 'validateBinding', true);
        this.controller2ValidateSpy = createSpy(this.controller2, 'validate', true);

        const validationRules = this.validationRules;
        const rules = validationRules
          .on(this.person)

          .ensure('name')
          .required()

          .ensure('age')
          .required()
          .min(42)

          .ensure((p) => p.address.pin)
          .satisfies((pin, _) => !Number.isNaN(Number(pin)))
          .rules;

        const { validationRules: vrs, messageProvider, property, $rules } = rules.find((rule) => rule.property.name === 'age')!;
        this.ageMinRule = new PropertyRule(vrs, messageProvider, property, [[$rules[0].find((rule) => rule instanceof RangeRule)]]);

        validationRules
          .on(this.org)

          .ensure('employees')
          .minItems(1)

          .ensure((o) => o.employees[0].address.pin)
          .satisfies((pin, _) => !Number.isNaN(Number(pin)));

        if (observeCollection) {
          this.employeesMediator = new BindingMediator('handleEmployeesChange', this, observerLocator, serviceLocator);
          this.employeeObserver = getCollectionObserver(this.org.employees);
          this.employeeObserver.getLengthObserver().subscribe(this.employeesMediator);
        }

        this.obj = { coll: [{ a: 1 }, { a: 2 }] };
        validationRules
          .on(this.obj)

          .ensure((o) => o.coll[0].a)
          .equals(11)

          .ensure('coll[1].a')
          .equals(11)

          .on(this)
          .ensure('validatableProp')
          .displayName('Property')
          .required();
      }

      public async handleEmployeesChange() {
        await queueAsyncTask(async () => {
          await this.controller.validate();
        }).result;
        // await this.platform.domQueue.queueTask(async () => {
        // }).result;
      }

      public unbinding() {
        this.validationRules.off();
      }

      public clearControllerCalls() {
        this.controllerRegisterBindingSpy.calls.splice(0);
        this.controllerUnregisterBindingSpy.calls.splice(0);
        this.controllerValidateBindingSpy.calls.splice(0);
        this.controllerValidateSpy.calls.splice(0);
      }

      public clearController2Calls() {
        this.controller2RegisterBindingSpy.calls.splice(0);
        this.controller2UnregisterBindingSpy.calls.splice(0);
        this.controller2ValidateBindingSpy.calls.splice(0);
        this.controller2ValidateSpy.calls.splice(0);
      }
    }

    @customElement({ name: 'text-box', template: `<input value.two-way="value"/>` })
    class TextBox {
      @bindable public value: unknown;
    }
    @customElement({
      name: 'employee-list',
      template: `
      <button id="hire-replace" click.delegate="hireReplace()">hire</button>
      <button id="fire-replace" click.delegate="fireReplace()">fire</button>
      <button id="hire-in-place" click.delegate="hireInPlace()">hire</button>
      <button id="fire-in-place" click.delegate="fireInPlace()">fire</button>
      <span repeat.for="employee of employees" style="display: block">\${$index}. \${employee.name}</span>
      `
    })
    class EmployeeList {
      @bindable public employees: Person[];
      private readonly names: string[] = [
        'Brigida Brayboy',
        'Anya Dinapoli',
        'Warren Asberry',
        'Rudy Melone',
        'Alexis Kinnaird',
        'Lisa Goines',
        'Carson Boyce',
        'Carolann Rosales',
        'Fabiola Jacome',
        'Leoma Metro',
      ];

      private createPerson() {
        const age = Math.floor(Math.random() * this.names.length);
        return new Person(this.names[age], age);
      }

    }
    @customAttribute({ name: 'foo-bar' })
    class FooBar {
      public static staticText: string = 'from foo-bar ca';
      @bindable public value: unknown;
      @bindable public triggeringEvents: string[];

      private readonly node: INode<Element> = resolve(INode) as INode<Element>;

      public binding() {
        for (const event of this.triggeringEvents) {
          this.node.addEventListener(event, this);
        }
      }

      public handleEvent(_event: Event) {
        this.value = FooBar.staticText;
      }
    }
    @valueConverter('b64ToPlainText')
    class B64ToPlainTextValueConverter {
      public fromView(b64: string): string { return $atob(b64); }
    }
    @bindingBehavior('vanilla')
    class VanillaBindingBehavior implements BindingBehaviorInstance {
      public bind(_scope: Scope, _binding: IBinding): void {
        return;
      }
      public unbind(_scope: Scope, _binding: IBinding): void {
        return;
      }
    }
    @customElement({ name: 'editor', template: `<au-slot name="content"></au-slot><div>static content</div>` })
    class Editor {
      public readonly person = new Person(void 0, void 0);
      public constructor(validationRules: IValidationRules = resolve(IValidationRules)) {
        validationRules
          .on(this.person)
          .ensure('name')
          .satisfies((name) => name === 'foo')
          .withMessage('Not foo');
      }
    }
    @customElement({ name: 'editor1', template: `<au-slot name="content"><input id="target" value.bind="person.name & validate"></au-slot>` })
    class Editor1 {
      public readonly person = new Person(void 0, void 0);
      public constructor(validationRules: IValidationRules = resolve(IValidationRules)) {
        validationRules
          .on(this.person)
          .ensure('name')
          .satisfies((name) => name === 'foo')
          .withMessage('Not foo');
      }
    }
    interface TestSetupContext extends $TestSetupContext {
      template: string;
      customDefaultTrigger?: ValidationTrigger;
      observeCollection?: boolean;
    }
    async function runTest(
      testFunction: TestFunction<TestExecutionContext<App>>,
      { template, customDefaultTrigger, observeCollection }: TestSetupContext
    ) {
      const ctx = TestContext.create();
      const container = ctx.container;
      const host = ctx.doc.createElement('app');
      ctx.doc.body.appendChild(host);
      // let app: App;
      const au = new Aurelia(container);
      await au
        .register(
          delegateSyntax,
          customDefaultTrigger
            ? ValidationHtmlConfiguration.customize((options) => {
              options.DefaultTrigger = customDefaultTrigger;
            })
            : ValidationHtmlConfiguration,
          TextBox,
          EmployeeList,
          FooBar,
          ToNumberValueConverter,
          B64ToPlainTextValueConverter,
          VanillaBindingBehavior,
          Editor,
          Editor1,
          Registration.instance(IObserveCollection, observeCollection),
        )
        .app({
          host,
          component: CustomElement.define({ name: 'app', template }, App)
        })
        .start();

      const app = au.root.controller.viewModel as App;
      await testFunction({ app, host, container, platform: app.platform, ctx });

      await au.stop();
      ctx.doc.body.removeChild(host);

      au.dispose();
    }

    const $it = createSpecFunction(runTest);

    function assertControllerBinding(controller: ValidationController, rawExpression: string, target: INode, registerBindingSpy: ISpy) {
      assert.equal(registerBindingSpy.calls.length, 1, 'registerBinding should have been called once');
      const bindings = Array.from((controller['bindings'] as Map<IBinding, any>).keys()) as BindingWithBehavior[];
      assert.equal(bindings.length, 1, 'one binding should have been registered');

      const binding = bindings[0];
      assert.equal(binding.target, target);
      assert.equal(Unparser.unparse(binding.ast.expression), rawExpression);
    }

    async function assertEventHandler(target: HTMLElement, event: 'change' | 'blur' | 'focusout', callCount: number, platform: IPlatform, validateBindingSpy: ISpy, validateSpy: ISpy, ctx: TestContext) {
      validateBindingSpy.calls.splice(0);
      validateSpy.calls.splice(0);
      target.dispatchEvent(new ctx.Event(event, { bubbles: event === 'focusout' }));
      await tasksSettled();
      assert.equal(validateBindingSpy.calls.length, callCount, 'incorrect validateBinding calls');
      assert.equal(validateSpy.calls.length, callCount, 'incorrect validate calls');
    }

    // #region trigger
    $it('registers binding to the controller with default **focusout** trigger',
      async function ({ app, host, platform, ctx }: TestExecutionContext<App>) {
        const controller = app.controller;

        const target: HTMLInputElement = host.querySelector('#target');
        assertControllerBinding(controller, 'person.name', target, app.controllerRegisterBindingSpy);

        assert.equal(controller.results.filter((r) => !r.valid).length, 0, 'error1');
        await controller.validate();
        assert.equal(controller.results.filter((r) => !r.valid).length, 1, 'error2');

        target.value = 'foo';
        await assertEventHandler(target, 'change', 0, platform, app.controllerValidateBindingSpy, app.controllerValidateSpy, ctx);
        await assertEventHandler(target, 'focusout', 1, platform, app.controllerValidateBindingSpy, app.controllerValidateSpy, ctx);
        assert.equal(controller.results.filter((e) => !e.valid && e.propertyName === 'name').length, 0, 'error3');
      },
      { template: `<input id="target" type="text" value.two-way="person.name & validate">` }
    );

    $it('registers binding to the controller with default **blur** trigger',
      async function ({ app, host, platform, ctx }: TestExecutionContext<App>) {
        const controller = app.controller;

        const target: HTMLInputElement = host.querySelector('#target');
        assertControllerBinding(controller, 'person.name', target, app.controllerRegisterBindingSpy);

        assert.equal(controller.results.filter((r) => !r.valid).length, 0, 'error1');
        await controller.validate();
        assert.equal(controller.results.filter((r) => !r.valid).length, 1, 'error2');

        target.value = 'foo';
        await assertEventHandler(target, 'change', 0, platform, app.controllerValidateBindingSpy, app.controllerValidateSpy, ctx);
        await assertEventHandler(target, 'blur', 1, platform, app.controllerValidateBindingSpy, app.controllerValidateSpy, ctx);
        assert.equal(controller.results.filter((e) => !e.valid && e.propertyName === 'name').length, 0, 'error3');
      },
      { template: `<input id="target" type="text" value.two-way="person.name & validate:'blur'">` }
    );

    $it('supports **change** validation trigger',
      async function ({ app, host, platform, ctx }: TestExecutionContext<App>) {
        const controller = app.controller;

        const target: HTMLInputElement = host.querySelector('#target');
        assertControllerBinding(controller, 'person.name', target, app.controllerRegisterBindingSpy);

        assert.equal(controller.results.filter((r) => !r.valid).length, 0, 'error1');
        await controller.validate();
        assert.equal(controller.results.filter((r) => !r.valid).length, 1, 'error2');

        target.value = 'foo';
        await assertEventHandler(target, 'focusout', 0, platform, app.controllerValidateBindingSpy, app.controllerValidateSpy, ctx);
        await assertEventHandler(target, 'change', 1, platform, app.controllerValidateBindingSpy, app.controllerValidateSpy, ctx);
        assert.equal(controller.results.filter((e) => !e.valid && e.propertyName === 'name').length, 0, 'error3');
      },
      { template: `<input id="target" type="text" value.two-way="person.name & validate:'change'">`, customDefaultTrigger: ValidationTrigger.change }
    );

    function* getChangeOrEventTestData() {
      yield { trigger: ValidationTrigger.changeOrBlur, event: 'blur' as const };
      yield { trigger: ValidationTrigger.changeOrFocusout, event: 'focusout' as const };
    }
    for (const { trigger, event } of getChangeOrEventTestData()) {
      $it(`supports **${trigger}** validation trigger`,
        async function ({ app, host, platform, ctx }: TestExecutionContext<App>) {
          const controller = app.controller;

          const target: HTMLInputElement = host.querySelector('#target');
          assertControllerBinding(controller, 'person.age|toNumber', target, app.controllerRegisterBindingSpy);

          // the first focus loss w/o change (dirty) does not trigger validation
          await assertEventHandler(target, event, 0, platform, app.controllerValidateBindingSpy, app.controllerValidateSpy, ctx);
          // the change, till the value is validated once before, does not trigger validation
          target.value = '24';
          await assertEventHandler(target, 'change', 0, platform, app.controllerValidateBindingSpy, app.controllerValidateSpy, ctx);
          // the focus loss event, after the property is dirty, should trigger validation
          await assertEventHandler(target, event, 1, platform, app.controllerValidateBindingSpy, app.controllerValidateSpy, ctx);
          assert.deepStrictEqual(controller.results.filter((e) => !e.valid).map((e) => e.toString()), ['Age must be at least 42.'], 'error3');

          target.value = '42';
          // as the property is validated once now, every change will trigger validation
          await assertEventHandler(target, 'change', 1, platform, app.controllerValidateBindingSpy, app.controllerValidateSpy, ctx);
          assert.deepStrictEqual(controller.results.filter((e) => !e.valid).map((e) => e.toString()), [], 'error4');
        },
        { template: `<input id="target" type="text" value.two-way="person.age | toNumber & validate:'${trigger}'">` }
      );

      $it(`for **${trigger}** validation trigger the change-trigger is activated after first validation`,
        async function ({ app, host, platform, ctx }: TestExecutionContext<App>) {
          const controller = app.controller;

          const target: HTMLInputElement = host.querySelector('#target');
          assertControllerBinding(controller, 'person.age|toNumber', target, app.controllerRegisterBindingSpy);

          await controller.validate();
          assert.deepStrictEqual(controller.results.filter((e) => !e.valid).map((e) => e.toString()), ['Age is required.'], 'error1');

          target.value = '24';
          await assertEventHandler(target, 'change', 1, platform, app.controllerValidateBindingSpy, app.controllerValidateSpy, ctx);
          assert.deepStrictEqual(controller.results.filter((e) => !e.valid).map((e) => e.toString()), ['Age must be at least 42.'], 'error2');

          target.value = '42';
          await assertEventHandler(target, 'change', 1, platform, app.controllerValidateBindingSpy, app.controllerValidateSpy, ctx);
          assert.deepStrictEqual(controller.results.filter((e) => !e.valid).map((e) => e.toString()), [], 'error4');
        },
        { template: `<input id="target" type="text" value.two-way="person.age | toNumber & validate:'${trigger}'">` }
      );

      $it(`GH#1470 - multiple rounds of validations involving multiple fields - **${trigger}** validation trigger`,
        async function ({ app, host, platform, ctx }: TestExecutionContext<App>) {
          const controller = app.controller;

          const t1: HTMLInputElement = host.querySelector('#t1');
          const t2: HTMLInputElement = host.querySelector('#t2');

          await controller.validate();
          assert.deepStrictEqual(controller.results.filter((e) => !e.valid).map((e) => e.toString()), ['Name is required.', 'Age is required.'], 'error1');

          t2.value = '24';
          await assertEventHandler(t2, 'change', 1, platform, app.controllerValidateBindingSpy, app.controllerValidateSpy, ctx);
          assert.deepStrictEqual(controller.results.filter((e) => !e.valid).map((e) => e.toString()), ['Name is required.', 'Age must be at least 42.'], 'error2');

          t1.value = 'foo';
          await assertEventHandler(t1, 'change', 1, platform, app.controllerValidateBindingSpy, app.controllerValidateSpy, ctx);
          assert.deepStrictEqual(controller.results.filter((e) => !e.valid).map((e) => e.toString()), ['Age must be at least 42.'], 'error3');

          t2.value = '42';
          await assertEventHandler(t2, 'change', 1, platform, app.controllerValidateBindingSpy, app.controllerValidateSpy, ctx);
          assert.deepStrictEqual(controller.results.filter((e) => !e.valid).map((e) => e.toString()), [], 'error4');
        },
        { template: `<input id="t1" type="text" value.two-way="person.name & validate:'${trigger}'"><input id="t2" type="text" value.two-way="person.age | toNumber & validate:'${trigger}'">` }
      );
    }

    $it('supports **manual** validation trigger',
      async function ({ app, host, platform, ctx }: TestExecutionContext<App>) {
        const controller = app.controller;

        const target: HTMLInputElement = host.querySelector('#target');
        assertControllerBinding(controller, 'person.name', target, app.controllerRegisterBindingSpy);

        app.clearControllerCalls();
        assert.equal(controller.results.filter((e) => !e.valid && e.propertyName === 'name').length, 0, 'error1');
        await controller.validate();
        assert.equal(controller.results.filter((e) => !e.valid && e.propertyName === 'name').length, 1, 'error2');

        await assertEventHandler(target, 'blur', 0, platform, app.controllerValidateBindingSpy, app.controllerValidateSpy, ctx);
        await assertEventHandler(target, 'focusout', 0, platform, app.controllerValidateBindingSpy, app.controllerValidateSpy, ctx);
        target.value = 'foo';
        await assertEventHandler(target, 'change', 0, platform, app.controllerValidateBindingSpy, app.controllerValidateSpy, ctx);

        app.clearControllerCalls();
        assert.equal(controller.results.filter((e) => !e.valid && e.propertyName === 'name').length, 1, 'error3');
        await controller.validate();
        assert.equal(controller.results.filter((e) => !e.valid && e.propertyName === 'name').length, 0, 'error4');
      },
      { template: `<input id="target" type="text" value.two-way="person.name & validate:'manual'">` }
    );

    $it('handles changes in dynamically bound trigger value',
      async function ({ app, host, platform, ctx }: TestExecutionContext<App>) {
        const controller = app.controller;

        const target: HTMLInputElement = host.querySelector('#target');
        assertControllerBinding(controller, 'person.name', target, app.controllerRegisterBindingSpy);

        assert.equal(app.trigger, ValidationTrigger.change);
        target.value = Math.random().toString();
        await assertEventHandler(target, 'change', 1, platform, app.controllerValidateBindingSpy, app.controllerValidateSpy, ctx);
        await assertEventHandler(target, 'blur', 0, platform, app.controllerValidateBindingSpy, app.controllerValidateSpy, ctx);
        await assertEventHandler(target, 'focusout', 0, platform, app.controllerValidateBindingSpy, app.controllerValidateSpy, ctx);

        app.trigger = ValidationTrigger.blur;
        await assertEventHandler(target, 'blur', 1, platform, app.controllerValidateBindingSpy, app.controllerValidateSpy, ctx);
        target.value = Math.random().toString();
        await assertEventHandler(target, 'change', 0, platform, app.controllerValidateBindingSpy, app.controllerValidateSpy, ctx);
        await assertEventHandler(target, 'focusout', 0, platform, app.controllerValidateBindingSpy, app.controllerValidateSpy, ctx);

        app.trigger = ValidationTrigger.focusout;
        await assertEventHandler(target, 'focusout', 1, platform, app.controllerValidateBindingSpy, app.controllerValidateSpy, ctx);
        target.value = Math.random().toString();
        await assertEventHandler(target, 'change', 0, platform, app.controllerValidateBindingSpy, app.controllerValidateSpy, ctx);
        await assertEventHandler(target, 'blur', 0, platform, app.controllerValidateBindingSpy, app.controllerValidateSpy, ctx);

        app.trigger = ValidationTrigger.changeOrBlur;
        await assertEventHandler(target, 'blur', 0, platform, app.controllerValidateBindingSpy, app.controllerValidateSpy, ctx);
        target.value = Math.random().toString();
        await assertEventHandler(target, 'change', 0, platform, app.controllerValidateBindingSpy, app.controllerValidateSpy, ctx);
        await assertEventHandler(target, 'blur', 1, platform, app.controllerValidateBindingSpy, app.controllerValidateSpy, ctx);
        target.value = Math.random().toString();
        await assertEventHandler(target, 'change', 1, platform, app.controllerValidateBindingSpy, app.controllerValidateSpy, ctx);

        app.trigger = ValidationTrigger.changeOrFocusout;
        await assertEventHandler(target, 'focusout', 0, platform, app.controllerValidateBindingSpy, app.controllerValidateSpy, ctx);
        target.value = Math.random().toString();
        await assertEventHandler(target, 'change', 0, platform, app.controllerValidateBindingSpy, app.controllerValidateSpy, ctx);
        await assertEventHandler(target, 'focusout', 1, platform, app.controllerValidateBindingSpy, app.controllerValidateSpy, ctx);
        target.value = Math.random().toString();
        await assertEventHandler(target, 'focusout', 1, platform, app.controllerValidateBindingSpy, app.controllerValidateSpy, ctx);

        app.trigger = ValidationTrigger.manual;
        await assertEventHandler(target, 'blur', 0, platform, app.controllerValidateBindingSpy, app.controllerValidateSpy, ctx);
        await assertEventHandler(target, 'focusout', 0, platform, app.controllerValidateBindingSpy, app.controllerValidateSpy, ctx);
        target.value = Math.random().toString();
        await assertEventHandler(target, 'change', 0, platform, app.controllerValidateBindingSpy, app.controllerValidateSpy, ctx);
      },
      { template: `<input id="target" type="text" value.two-way="person.name & validate:trigger">`, timeout: 10000 }
    );
    // #endregion

    // #region controller
    $it('respects bound controller',
      async function ({ app, host, platform, ctx }: TestExecutionContext<App>) {
        const controller = app.controller;
        const controller2 = app.controller2;

        const target1: HTMLInputElement = host.querySelector('#target1');
        const target2: HTMLInputElement = host.querySelector('#target2');
        assertControllerBinding(controller, 'person.name', target1, app.controllerRegisterBindingSpy);
        assertControllerBinding(controller2, 'person.age', target2, app.controller2RegisterBindingSpy);

        target1.value = 'foo';
        target2.value = '42';
        await assertEventHandler(target1, 'change', 1, platform, app.controllerValidateBindingSpy, app.controllerValidateSpy, ctx);
        await assertEventHandler(target2, 'change', 1, platform, app.controller2ValidateBindingSpy, app.controller2ValidateSpy, ctx);
        assert.equal(controller.results.filter((e) => !e.valid && e.propertyName === 'name').length, 0, 'error5');
        assert.equal(controller.results.filter((e) => e.propertyName === 'age').length, 0, 'error6');
        assert.equal(controller2.results.filter((e) => !e.valid && e.propertyName === 'name').length, 0, 'error7');
        assert.equal(controller2.results.filter((e) => e.propertyName === 'name').length, 0, 'error8');
      },
      {
        template: `
      <input id="target1" type="text" value.two-way="person.name & validate:'change'">
      <input id="target2" type="text" value.two-way="person.age & validate:'change':controller2">
      ` }
    );

    $it('handles value change of the bound controller',
      async function ({ app, host, platform, ctx }: TestExecutionContext<App>) {
        const controller = app.controller;
        const controller2 = app.controller2;

        const target1: HTMLInputElement = host.querySelector('#target1');
        assertControllerBinding(controller, 'person.name', target1, app.controllerRegisterBindingSpy);

        await assertEventHandler(target1, 'blur', 1, platform, app.controllerValidateBindingSpy, app.controllerValidateSpy, ctx);
        assert.equal(controller.results.filter((e) => !e.valid && e.propertyName === 'name').length, 1, 'error1');
        assert.equal(controller2.results.filter((e) => !e.valid && e.propertyName === 'name').length, 0, 'error2');

        app.tempController = controller2;
        await tasksSettled();
        assert.equal(app.controllerUnregisterBindingSpy.calls.length, 1);
        assertControllerBinding(controller2, 'person.name', target1, app.controller2RegisterBindingSpy);

        await assertEventHandler(target1, 'blur', 1, platform, app.controller2ValidateBindingSpy, app.controller2ValidateSpy, ctx);
        assert.equal(controller.results.filter((e) => !e.valid && e.propertyName === 'name').length, 0, 'error1');
        assert.equal(controller2.results.filter((e) => !e.valid && e.propertyName === 'name').length, 1, 'error2');
      },
      {
        template: `
      <input id="target1" type="text" value.two-way="person.name & validate:'blur':tempController">
      ` }
    );

    $it('handles the trigger-controller combo correctly',
      async function ({ app, host, platform, ctx }: TestExecutionContext<App>) {
        const controller = app.controller;
        const controller2 = app.controller2;

        const target1: HTMLInputElement = host.querySelector('#target1');
        const target2: HTMLInputElement = host.querySelector('#target2');
        assertControllerBinding(controller, 'person.name', target1, app.controllerRegisterBindingSpy);
        assertControllerBinding(controller2, 'person.age', target2, app.controller2RegisterBindingSpy);

        await assertEventHandler(target1, 'blur', 1, platform, app.controllerValidateBindingSpy, app.controllerValidateSpy, ctx);
        await assertEventHandler(target2, 'blur', 0, platform, app.controller2ValidateBindingSpy, app.controller2ValidateSpy, ctx);
        assert.equal(controller.results.filter((e) => !e.valid && e.propertyName === 'name').length, 1, 'error1');
        assert.equal(controller2.results.filter((e) => !e.valid && e.propertyName === 'age').length, 0, 'error2');

        target1.value = 'foo';
        target2.value = '41';
        await assertEventHandler(target1, 'change', 0, platform, app.controllerValidateBindingSpy, app.controllerValidateSpy, ctx);
        await assertEventHandler(target2, 'change', 1, platform, app.controller2ValidateBindingSpy, app.controller2ValidateSpy, ctx);
        assert.equal(controller.results.filter((e) => !e.valid && e.propertyName === 'name').length, 1, 'error3');
        assert.equal(controller2.results.filter((e) => !e.valid && e.propertyName === 'age').length, 1, 'error4');
      },
      {
        template: `
      <input id="target1" type="text" value.two-way="person.name & validate:'blur':controller">
      <input id="target2" type="text" value.two-way="person.age & validate:'change':controller2">
      ` }
    );
    // #endregion

    // #region rules
    $it('respects bound rules',
      async function ({ app, host, platform, ctx }: TestExecutionContext<App>) {
        const controller = app.controller;

        const target2: HTMLInputElement = host.querySelector('#target2');
        assertControllerBinding(controller, 'person.age', target2, app.controllerRegisterBindingSpy);

        target2.value = '41';
        await assertEventHandler(target2, 'change', 1, platform, app.controllerValidateBindingSpy, app.controllerValidateSpy, ctx);
        assert.equal(controller.results.filter((e) => e.propertyName === 'age').length, 1, 'error2');

        target2.value = '42';
        await assertEventHandler(target2, 'change', 1, platform, app.controllerValidateBindingSpy, app.controllerValidateSpy, ctx);
        assert.equal(controller.results.filter((e) => !e.valid && e.propertyName === 'age').length, 0, 'error3');
      },
      {
        template: `
      <input id="target2" type="text" value.two-way="person.age & validate:'change':controller1:[ageMinRule]">
      ` }
    );

    $it('respects change in value of bound rules',
      async function ({ app, host, platform, ctx }: TestExecutionContext<App>) {
        const controller = app.controller;

        const target2: HTMLInputElement = host.querySelector('#target2');
        assertControllerBinding(controller, 'person.age', target2, app.controllerRegisterBindingSpy);

        target2.value = '41';
        await assertEventHandler(target2, 'change', 1, platform, app.controllerValidateBindingSpy, app.controllerValidateSpy, ctx);
        assert.equal(controller.results.filter((e) => !e.valid && e.propertyName === 'age' && e.rule instanceof RangeRule).length, 1, 'error2');
        assert.equal(controller.results.filter((e) => !e.valid && e.propertyName === 'age' && e.rule instanceof RequiredRule).length, 0, 'error3');

        target2.value = '42';
        await assertEventHandler(target2, 'change', 1, platform, app.controllerValidateBindingSpy, app.controllerValidateSpy, ctx);
        assert.equal(controller.results.filter((e) => !e.valid && e.propertyName === 'age').length, 0, 'error4');

        app.tempAgeRule = [app.ageMinRule];
        await tasksSettled();

        target2.value = '';
        await assertEventHandler(target2, 'change', 1, platform, app.controllerValidateBindingSpy, app.controllerValidateSpy, ctx);
        assert.equal(controller.results.filter((e) => !e.valid && e.propertyName === 'age' && e.rule instanceof RequiredRule).length, 0, 'error5');

        target2.value = '41';
        await assertEventHandler(target2, 'change', 1, platform, app.controllerValidateBindingSpy, app.controllerValidateSpy, ctx);
        assert.equal(controller.results.filter((e) => !e.valid && e.propertyName === 'age' && e.rule instanceof RangeRule).length, 1, 'error6');

        target2.value = '42';
        await assertEventHandler(target2, 'change', 1, platform, app.controllerValidateBindingSpy, app.controllerValidateSpy, ctx);
        assert.equal(controller.results.filter((e) => !e.valid && e.propertyName === 'age').length, 0, 'error7');
      },
      {
        template: `
      <input id="target2" type="text" value.two-way="person.age & validate:'change':controller1:tempAgeRule">
      ` }
    );
    // #endregion

    // #region argument parsing
    const negativeTestData = [
      { args: `'chaos'`,                              code: 'AUR4202', expectedError: 'is not a supported validation trigger' },
      { args: `controller`,                           code: 'AUR4202', expectedError: 'is not a supported validation trigger' },
      { args: `ageMinRule`,                           code: 'AUR4202', expectedError: 'is not a supported validation trigger' },
      { args: `controller:'change'`,                  code: 'AUR4202', expectedError: 'is not a supported validation trigger' },
      { args: `'change':'foo'`,                       code: 'AUR4203', expectedError: 'foo is not of type ValidationController' },
      { args: `'change':{}`,                          code: 'AUR4203', expectedError: 'is not of type ValidationController' },
      { args: `'change':ageMinRule`,                  code: 'AUR4203', expectedError: 'is not of type ValidationController' },
      { args: `'change':controller:ageMinRule:'foo'`, code: 'AUR4201', expectedError: 'Unconsumed argument#4 for validate binding behavior: foo' },
    ];
    for (const { args, code } of negativeTestData) {
      it(`throws error if the arguments are not provided in correct order - ${args}`, async function () {
        const ctx = TestContext.create();
        const container = ctx.container;
        const host = ctx.doc.createElement('app');
        const template = `<input id="target2" type="text" value.two-way="person.age & validate:${args}">`;
        ctx.doc.body.appendChild(host);
        const au = new Aurelia(container);
        try {
          await au
            .register(
              ValidationHtmlConfiguration,
              Registration.instance(IObserveCollection, false),
            )
            .app({
              host,
              component: CustomElement.define({ name: 'app', template }, App)
            })
            .start();
        } catch (e) {
          assert.includes(e.message, code);
        }
        await au.stop();
        ctx.doc.body.removeChild(host);

        // TODO: there's a binding somewhere without a dispose() method, causing this to fail
        // au.dispose();
      });
    }

    // #endregion

    // #region custom element
    $it('can be used with custom element - change trigger',
      async function ({ app, host, platform, ctx }: TestExecutionContext<App>) {
        const controller = app.controller;
        const person = app.person;

        const ceHost: HTMLElement = host.querySelector('#target');
        const input: HTMLInputElement = ceHost.querySelector('input');

        assert.equal(controller.results.filter((r) => !r.valid && r.propertyName === 'name' && r.object === person).length, 0, 'error1');
        await controller.validate();
        assert.equal(controller.results.filter((r) => !r.valid && r.propertyName === 'name' && r.object === person).length, 1, 'error2');

        input.value = 'foo';
        await assertEventHandler(input, 'change', 1, platform, app.controllerValidateBindingSpy, app.controllerValidateSpy, ctx);
        assert.equal(controller.results.filter((r) => !r.valid && r.propertyName === 'name' && r.object === person).length, 0, 'error3');
      },
      { template: `<text-box id="target" value.two-way="person.name & validate:'change'"></text-box>` }
    );
    $it('can be used with custom element - blur trigger',
      async function ({ app, host, platform, ctx }: TestExecutionContext<App>) {
        const controller = app.controller;
        const person = app.person;

        const ceHost: HTMLElement = host.querySelector('#target');

        assert.equal(controller.results.filter((r) => !r.valid && r.propertyName === 'name' && r.object === person).length, 0, 'error1');
        await controller.validate();
        assert.equal(controller.results.filter((r) => !r.valid && r.propertyName === 'name' && r.object === person).length, 1, 'error2');

        app.clearControllerCalls();
        person.name = 'foo';
        await tasksSettled();
        assert.equal(app.controllerValidateBindingSpy.calls.length, 0);
        assert.equal(app.controllerValidateSpy.calls.length, 0);
        assert.equal(controller.results.filter((r) => !r.valid && r.propertyName === 'name' && r.object === person).length, 1, 'error3');

        app.clearControllerCalls();
        ceHost.focus();
        await tasksSettled();
        await assertEventHandler(ceHost.querySelector('input'), 'blur', 0, platform, app.controllerValidateBindingSpy, app.controllerValidateSpy, ctx);
        await assertEventHandler(ceHost, 'blur', 1, platform, app.controllerValidateBindingSpy, app.controllerValidateSpy, ctx);
        assert.equal(controller.results.filter((r) => !r.valid && r.propertyName === 'name' && r.object === person).length, 0, 'error4');
      },
      { template: `<text-box tabindex="-1" id="target" value.two-way="person.name & validate:'blur'"></text-box>` }
    );
    $it('can be used with custom element - focusout trigger',
      async function ({ app, host, platform, ctx }: TestExecutionContext<App>) {
        const controller = app.controller;
        const person = app.person;

        const ceHost: HTMLElement = host.querySelector('#target');
        const input: HTMLInputElement = ceHost.querySelector('input');

        assert.equal(controller.results.filter((r) => !r.valid && r.propertyName === 'name' && r.object === person).length, 0, 'error1');
        await controller.validate();
        assert.equal(controller.results.filter((r) => !r.valid && r.propertyName === 'name' && r.object === person).length, 1, 'error2');

        app.clearControllerCalls();
        input.value = 'foo';
        await assertEventHandler(input, 'change', 0, platform, app.controllerValidateBindingSpy, app.controllerValidateSpy, ctx);

        app.clearControllerCalls();
        await assertEventHandler(input, 'focusout', 1, platform, app.controllerValidateBindingSpy, app.controllerValidateSpy, ctx);
        assert.equal(controller.results.filter((r) => !r.valid && r.propertyName === 'name' && r.object === person).length, 0, 'error4');
      },
      { template: `<text-box id="target" value.two-way="person.name & validate:'focusout'"></text-box>` }
    );
    $it('can be used with custom element - changeOrBlur trigger',
      async function ({ app, host, platform, ctx }: TestExecutionContext<App>) {
        const controller = app.controller;
        const person = app.person;

        const ceHost: HTMLElement = host.querySelector('#target');
        const input: HTMLInputElement = ceHost.querySelector('input');

        assert.equal(controller.results.filter((r) => !r.valid && r.propertyName === 'name' && r.object === person).length, 0, 'error1');
        await controller.validate();
        assert.equal(controller.results.filter((r) => !r.valid && r.propertyName === 'name' && r.object === person).length, 1, 'error2');

        input.value = 'foo';
        await assertEventHandler(input, 'change', 1, platform, app.controllerValidateBindingSpy, app.controllerValidateSpy, ctx);

        app.clearControllerCalls();
        ceHost.focus();
        await tasksSettled();
        await assertEventHandler(input, 'blur', 0, platform, app.controllerValidateBindingSpy, app.controllerValidateSpy, ctx);
        await assertEventHandler(ceHost, 'blur', 1, platform, app.controllerValidateBindingSpy, app.controllerValidateSpy, ctx);
        assert.equal(controller.results.filter((r) => !r.valid && r.propertyName === 'name' && r.object === person).length, 0, 'error4');
      },
      { template: `<text-box tabindex="-1" id="target" value.two-way="person.name & validate:'changeOrBlur'"></text-box>` }
    );
    $it('can be used with custom element - changeOrFocusout trigger',
      async function ({ app, host, platform, ctx }: TestExecutionContext<App>) {
        const controller = app.controller;
        const person = app.person;

        const ceHost: HTMLElement = host.querySelector('#target');
        const input: HTMLInputElement = ceHost.querySelector('input');

        assert.equal(controller.results.filter((r) => !r.valid && r.propertyName === 'name' && r.object === person).length, 0, 'error1');
        await controller.validate();
        assert.equal(controller.results.filter((r) => !r.valid && r.propertyName === 'name' && r.object === person).length, 1, 'error2');

        input.value = 'foo';
        await assertEventHandler(input, 'change', 1, platform, app.controllerValidateBindingSpy, app.controllerValidateSpy, ctx);

        app.clearControllerCalls();
        await assertEventHandler(input, 'focusout', 1, platform, app.controllerValidateBindingSpy, app.controllerValidateSpy, ctx);
        assert.equal(controller.results.filter((r) => !r.valid && r.propertyName === 'name' && r.object === person).length, 0, 'error4');
      },
      { template: `<text-box tabindex="-1" id="target" value.two-way="person.name & validate:'changeOrFocusout'"></text-box>` }
    );
    $it('can be used with custom element - manual trigger',
      async function ({ app, host, platform, ctx }: TestExecutionContext<App>) {
        const controller = app.controller;
        const person = app.person;

        const ceHost: HTMLElement = host.querySelector('#target');
        const input: HTMLInputElement = ceHost.querySelector('input');

        assert.equal(controller.results.filter((r) => !r.valid && r.propertyName === 'name' && r.object === person).length, 0, 'error1');
        await controller.validate();
        assert.equal(controller.results.filter((r) => !r.valid && r.propertyName === 'name' && r.object === person).length, 1, 'error2');

        input.value = 'foo';
        await assertEventHandler(input, 'change', 0, platform, app.controllerValidateBindingSpy, app.controllerValidateSpy, ctx);

        app.clearControllerCalls();
        ceHost.focus();
        await tasksSettled();
        await assertEventHandler(ceHost, 'blur', 0, platform, app.controllerValidateBindingSpy, app.controllerValidateSpy, ctx);
        await controller.validate();
        assert.equal(controller.results.filter((r) => !r.valid && r.propertyName === 'name' && r.object === person).length, 0, 'error4');
      },
      { template: `<text-box tabindex="-1" id="target" value.two-way="person.name & validate:'manual'"></text-box>` }
    );
    // #endregion

    // #region custom attribute
    $it('can be used with custom attribute - change trigger',
      async function ({ app, host }: TestExecutionContext<App>) {
        const controller = app.controller;
        const person = app.person;

        const caHost: HTMLDivElement = host.querySelector('#target');

        assert.equal(controller.results.filter((r) => !r.valid && r.propertyName === 'name' && r.object === person).length, 0, 'error1');
        await controller.validate();
        assert.equal(controller.results.filter((r) => !r.valid && r.propertyName === 'name' && r.object === person).length, 1, 'error2');

        app.clearControllerCalls();
        caHost.click();
        await tasksSettled();
        assert.equal(app.controllerValidateBindingSpy.calls.length, 1);
        assert.equal(app.controllerValidateSpy.calls.length, 1);
        assert.equal(controller.results.filter((r) => !r.valid && r.propertyName === 'name' && r.object === person).length, 0, 'error3');
      },
      { template: `<div id="target" foo-bar="value.two-way:person.name & validate:'change'; triggering-events.bind:['click']"></div>` }
    );
    $it('can be used with custom attribute - blur trigger',
      async function ({ app, host, platform, ctx }: TestExecutionContext<App>) {
        const controller = app.controller;
        const person = app.person;

        const caHost: HTMLDivElement = host.querySelector('#target');

        assert.equal(controller.results.filter((r) => !r.valid && r.propertyName === 'name' && r.object === person).length, 0, 'error1');
        await controller.validate();
        assert.equal(controller.results.filter((r) => !r.valid && r.propertyName === 'name' && r.object === person).length, 1, 'error2');

        app.clearControllerCalls();
        caHost.focus();
        await tasksSettled();
        await assertEventHandler(caHost, 'blur', 1, platform, app.controllerValidateBindingSpy, app.controllerValidateSpy, ctx);
        assert.equal(controller.results.filter((r) => !r.valid && r.propertyName === 'name' && r.object === person).length, 0, 'error3');
      },
      { template: `<div id="target" tabindex="-1" foo-bar="value.two-way:person.name & validate:'blur'; triggering-events.bind:['blur']"></div>` }
    );
    $it('can be used with custom attribute - focusout trigger',
      async function ({ app, host, platform, ctx }: TestExecutionContext<App>) {
        const controller = app.controller;
        const person = app.person;

        const caHost: HTMLDivElement = host.querySelector('#target');

        assert.equal(controller.results.filter((r) => !r.valid && r.propertyName === 'name' && r.object === person).length, 0, 'error1');
        await controller.validate();
        assert.equal(controller.results.filter((r) => !r.valid && r.propertyName === 'name' && r.object === person).length, 1, 'error2');

        app.clearControllerCalls();
        caHost.focus();
        await tasksSettled();
        await assertEventHandler(caHost, 'focusout', 1, platform, app.controllerValidateBindingSpy, app.controllerValidateSpy, ctx);
        assert.equal(controller.results.filter((r) => !r.valid && r.propertyName === 'name' && r.object === person).length, 0, 'error3');
      },
      { template: `<div id="target" tabindex="-1" foo-bar="value.two-way:person.name & validate:'focusout'; triggering-events.bind:['focusout']"></div>` }
    );
    $it('can be used with custom attribute - changeOrBlur trigger',
      async function ({ app, host, platform, ctx }: TestExecutionContext<App>) {
        const controller = app.controller;
        const person = app.person;

        const caHost: HTMLDivElement = host.querySelector('#target');

        assert.equal(controller.results.filter((r) => !r.valid && r.propertyName === 'name' && r.object === person).length, 0, 'error1');
        await controller.validate();
        assert.equal(controller.results.filter((r) => !r.valid && r.propertyName === 'name' && r.object === person).length, 1, 'error2');

        // clicking the CE host triggers change in CA value
        app.clearControllerCalls();
        caHost.click();
        await tasksSettled();
        assert.equal(app.controllerValidateBindingSpy.calls.length, 1);
        assert.equal(app.controllerValidateSpy.calls.length, 1);
        assert.equal(controller.results.filter((r) => !r.valid && r.propertyName === 'name' && r.object === person).length, 0, 'error3');

        app.clearControllerCalls();
        caHost.focus();
        await tasksSettled();
        await assertEventHandler(caHost, 'blur', 1, platform, app.controllerValidateBindingSpy, app.controllerValidateSpy, ctx);
      },
      { template: `<div id="target" tabindex="-1" foo-bar="value.two-way:person.name & validate:'changeOrBlur'; triggering-events.bind:['click']"></div>` }
    );
    $it('can be used with custom attribute - changeOrFocusout trigger',
      async function ({ app, host, platform, ctx }: TestExecutionContext<App>) {
        const controller = app.controller;
        const person = app.person;

        const caHost: HTMLDivElement = host.querySelector('#target');

        assert.equal(controller.results.filter((r) => !r.valid && r.propertyName === 'name' && r.object === person).length, 0, 'error1');
        await controller.validate();
        assert.equal(controller.results.filter((r) => !r.valid && r.propertyName === 'name' && r.object === person).length, 1, 'error2');

        // clicking the CE host triggers change in CA value
        app.clearControllerCalls();
        caHost.click();
        await tasksSettled();
        assert.equal(app.controllerValidateBindingSpy.calls.length, 1);
        assert.equal(app.controllerValidateSpy.calls.length, 1);
        assert.equal(controller.results.filter((r) => !r.valid && r.propertyName === 'name' && r.object === person).length, 0, 'error3');

        app.clearControllerCalls();
        await assertEventHandler(caHost, 'focusout', 1, platform, app.controllerValidateBindingSpy, app.controllerValidateSpy, ctx);
      },
      { template: `<div id="target" tabindex="-1" foo-bar="value.two-way:person.name & validate:'changeOrFocusout'; triggering-events.bind:['click']"></div>` }
    );
    $it('can be used with custom attribute - manual trigger',
      async function ({ app, host, platform, ctx }: TestExecutionContext<App>) {
        const controller = app.controller;
        const person = app.person;

        const caHost: HTMLDivElement = host.querySelector('#target');

        assert.equal(controller.results.filter((r) => !r.valid && r.propertyName === 'name' && r.object === person).length, 0, 'error1');
        await controller.validate();
        assert.equal(controller.results.filter((r) => !r.valid && r.propertyName === 'name' && r.object === person).length, 1, 'error2');

        app.clearControllerCalls();
        caHost.click();
        await tasksSettled();
        assert.equal(app.controllerValidateBindingSpy.calls.length, 0);
        assert.equal(app.controllerValidateSpy.calls.length, 0);
        assert.equal(controller.results.filter((r) => !r.valid && r.propertyName === 'name' && r.object === person).length, 1, 'error3');

        app.clearControllerCalls();
        caHost.focus();
        await tasksSettled();
        await assertEventHandler(caHost, 'blur', 0, platform, app.controllerValidateBindingSpy, app.controllerValidateSpy, ctx);

        await controller.validate();
        assert.equal(controller.results.filter((r) => !r.valid && r.propertyName === 'name' && r.object === person).length, 0, 'error5');
      },
      { template: `<div id="target" tabindex="-1" foo-bar="value.two-way:person.name & validate:'manual'; triggering-events.bind:['click', 'blur']"></div>` }
    );
    // #endregion

    // #region VC, BB
    $it('can be used with value converter',
      async function ({ app, host, platform, ctx }: TestExecutionContext<App>) {
        const controller = app.controller;
        const person = app.person;

        const target: HTMLInputElement = host.querySelector('#target');
        assertControllerBinding(controller, 'person.age|toNumber', target, app.controllerRegisterBindingSpy);

        assert.equal(controller.results.filter((r) => !r.valid).length, 0, 'error1');
        await controller.validate();
        assert.equal(controller.results.filter((r) => !r.valid && r.propertyName === 'age').length, 1, 'error2');

        target.value = '123';
        await assertEventHandler(target, 'change', 1, platform, app.controllerValidateBindingSpy, app.controllerValidateSpy, ctx);
        assert.equal(controller.results.filter((r) => !r.valid && r.propertyName === 'age').length, 0, 'error3');
        assert.equal(person.age, 123);

        target.value = 'foo';
        await assertEventHandler(target, 'change', 1, platform, app.controllerValidateBindingSpy, app.controllerValidateSpy, ctx);
        assert.equal(controller.results.filter((r) => !r.valid && r.propertyName === 'age').length, 1, 'error4');
        assert.equal(person.age, undefined);
      },
      { template: `<input id="target" value.two-way="person.age | toNumber & validate:'change'">` }
    );
    $it('can be used with multiple value converters',
      async function ({ app, host, platform, ctx }: TestExecutionContext<App>) {
        const controller = app.controller;
        const person = app.person;

        const target: HTMLInputElement = host.querySelector('#target');
        assertControllerBinding(controller, 'person.age|toNumber|b64ToPlainText', target, app.controllerRegisterBindingSpy);

        assert.equal(controller.results.filter((r) => !r.valid).length, 0, 'error1');
        await controller.validate();
        assert.equal(controller.results.filter((r) => !r.valid && r.propertyName === 'age').length, 1, 'error2');

        target.value = $btoa('1234');
        await assertEventHandler(target, 'change', 1, platform, app.controllerValidateBindingSpy, app.controllerValidateSpy, ctx);
        assert.equal(controller.results.filter((r) => !r.valid && r.propertyName === 'age').length, 0, 'error3');
        assert.equal(person.age, 1234);

        target.value = $btoa('foobar');
        await assertEventHandler(target, 'change', 1, platform, app.controllerValidateBindingSpy, app.controllerValidateSpy, ctx);
        assert.equal(controller.results.filter((r) => !r.valid && r.propertyName === 'age').length, 1, 'error4');
        assert.equal(person.age, undefined);
      },
      { template: `<input id="target" value.two-way="person.age | toNumber | b64ToPlainText & validate:'change'">` }
    );
    const bindingBehaviorTestData = [
      { expr: `person.name & validate:'change' & vanilla`, rawExpr: 'person.name&validate:(\'change\')' },
      { expr: `person.name & vanilla & validate:'change'`, rawExpr: 'person.name&vanilla' },
    ];
    for (const { expr, rawExpr } of bindingBehaviorTestData) {
      $it(`can be used with other binding behavior - ${expr}`,
        async function ({ app, host, platform, ctx }: TestExecutionContext<App>) {
          const controller = app.controller;

          const target: HTMLInputElement = host.querySelector('#target');
          assertControllerBinding(controller, rawExpr, target, app.controllerRegisterBindingSpy);

          assert.equal(controller.results.filter((r) => !r.valid).length, 0, 'error1');
          await controller.validate();
          assert.equal(controller.results.filter((r) => !r.valid).length, 1, 'error2');

          target.value = 'foo';
          await assertEventHandler(target, 'change', 1, platform, app.controllerValidateBindingSpy, app.controllerValidateSpy, ctx);
          assert.equal(controller.results.filter((e) => !e.valid && e.propertyName === 'name').length, 0, 'error3');
        },
        { template: `<input id="target" value.two-way="${expr}">` }
      );
    }
    // #endregion

    $it('can be used to validate simple property',
      async function ({ app, host, platform, ctx }: TestExecutionContext<App>) {
        const controller = app.controller;

        const target: HTMLInputElement = host.querySelector('#target');
        assertControllerBinding(controller, 'validatableProp', target, app.controllerRegisterBindingSpy);

        assert.equal(controller.results.filter((r) => !r.valid).length, 0, 'error1');
        await controller.validate();
        assert.equal(controller.results.filter((r) => !r.valid).length, 1, 'error2');

        target.value = 'foo';
        await assertEventHandler(target, 'change', 1, platform, app.controllerValidateBindingSpy, app.controllerValidateSpy, ctx);
        assert.equal(controller.results.filter((e) => !e.valid && e.propertyName === 'validatableProp').length, 0, 'error3');
      },
      { template: `<input id="target" value.two-way="validatableProp & validate:'change'">` }
    );
    // #region collection and nested properties
    $it.skip('can be used to validate nested collection - collection replace',
      async function ({ app, host }: TestExecutionContext<App>) {
        const controller = app.controller;

        const target: HTMLInputElement = host.querySelector('#target');
        assert.equal(app.controllerRegisterBindingSpy.calls.length, 1);
        const bindings = Array.from((controller['bindings'] as Map<IBinding, any>).keys()) as BindingWithBehavior[];
        assert.equal(bindings.length, 1);

        const binding = bindings[0];
        assert.equal(Unparser.unparse(binding.ast.expression), 'org.employees');

        assert.equal(controller.results.filter((r) => !r.valid && r.propertyName === 'employees').length, 0, 'error1');
        await controller.validate();
        assert.equal(controller.results.filter((r) => !r.valid && r.propertyName === 'employees').length, 1, 'error2');

        app.clearControllerCalls();
        (target.querySelector('button#hire-replace') as HTMLButtonElement).click();
        await tasksSettled();
        assert.equal(app.controllerValidateBindingSpy.calls.length, 1);
        assert.equal(app.controllerValidateSpy.calls.length, 1);
        assert.equal(controller.results.filter((r) => !r.valid && r.propertyName === 'employees').length, 0, 'error3');

        app.clearControllerCalls();
        (target.querySelector('button#fire-replace') as HTMLButtonElement).click();
        await tasksSettled();
        assert.equal(app.controllerValidateBindingSpy.calls.length, 1);
        assert.equal(app.controllerValidateSpy.calls.length, 1);
        assert.equal(controller.results.filter((r) => !r.valid && r.propertyName === 'employees').length, 1, 'error4');
      },
      { template: `<employee-list id="target" employees.two-way="org.employees & validate:'change'"></employee-list>` }
    );
    $it.skip('can be used to validate nested collection - collection observer',
      async function ({ app, host }: TestExecutionContext<App>) {
        const controller = app.controller;

        assert.equal(!!app.employeesMediator, true, 'mediator should have been instantiated');
        assert.equal(!!app.employeeObserver, true, 'observer should have been instantiated');
        const target: HTMLInputElement = host.querySelector('#target');
        assert.equal(app.controllerRegisterBindingSpy.calls.length, 1);
        const bindings = Array.from((controller['bindings'] as Map<IBinding, any>).keys()) as BindingWithBehavior[];
        assert.equal(bindings.length, 1);

        const binding = bindings[0];
        assert.equal(Unparser.unparse(binding.ast.expression), 'org.employees');

        assert.equal(controller.results.filter((r) => !r.valid && r.propertyName === 'employees').length, 0, 'error1');
        await controller.validate();
        assert.equal(controller.results.filter((r) => !r.valid && r.propertyName === 'employees').length, 1, 'error2');

        app.clearControllerCalls();
        (target.querySelector('button#hire-in-place') as HTMLButtonElement).click();
        await tasksSettled();
        assert.equal(app.org.employees.length, 1, 'should have 1 employee');
        assert.equal(app.controllerValidateSpy.calls.length, 1, 'should have 1 controller.validate() call');
        assert.equal(controller.results.filter((r) => !r.valid && r.propertyName === 'employees').length, 0, 'error3');

        app.clearControllerCalls();
        (target.querySelector('button#fire-in-place') as HTMLButtonElement).click();
        await tasksSettled();
        assert.equal(app.org.employees.length, 0, 'should have no employees');
        assert.equal(app.controllerValidateSpy.calls.length, 1, 'should have 1 controller.validate() call');
        assert.equal(controller.results.filter((r) => !r.valid && r.propertyName === 'employees').length, 1, 'error4');
      },
      { template: `<employee-list id="target" employees.two-way="org.employees & validate:'change'"></employee-list>`, observeCollection: true }
    );
    $it('can be used to validate nested collection property by index',
      async function ({ app, host, platform, ctx }: TestExecutionContext<App>) {
        const controller = app.controller;

        const target1: HTMLInputElement = host.querySelector('#target1');
        const target2: HTMLInputElement = host.querySelector('#target2');

        assert.equal(app.controllerRegisterBindingSpy.calls.length, 2);
        const bindings = Array.from((controller['bindings'] as Map<IBinding, any>).keys()) as BindingWithBehavior[];
        assert.equal(bindings.length, 2);
        assert.equal(bindings[0].target, target1);
        assert.equal(Unparser.unparse(bindings[0].ast.expression), 'obj.coll[(0)].a|toNumber');
        assert.equal(bindings[1].target, target2);
        assert.equal(Unparser.unparse(bindings[1].ast.expression), 'obj.coll[(1)].a|toNumber');

        assert.equal(controller.results.filter((r) => !r.valid && (r.propertyName === 'coll[0].a' || r.propertyName === 'coll[1].a')).length, 0, 'error1');
        await controller.validate();
        assert.equal(controller.results.filter((r) => !r.valid && (r.propertyName === 'coll[0].a' || r.propertyName === 'coll[1].a')).length, 2, 'error2');

        target1.value = '42';
        await assertEventHandler(target1, 'change', 1, platform, app.controllerValidateBindingSpy, app.controllerValidateSpy, ctx);
        target2.value = '42';
        await assertEventHandler(target2, 'change', 1, platform, app.controllerValidateBindingSpy, app.controllerValidateSpy, ctx);
        assert.equal(controller.results.filter((r) => !r.valid && (r.propertyName === 'coll[0].a' || r.propertyName === 'coll[1].a')).length, 2, 'error3');

        target1.value = '11';
        await assertEventHandler(target1, 'change', 1, platform, app.controllerValidateBindingSpy, app.controllerValidateSpy, ctx);
        target2.value = '11';
        await assertEventHandler(target2, 'change', 1, platform, app.controllerValidateBindingSpy, app.controllerValidateSpy, ctx);
        assert.equal(controller.results.filter((r) => !r.valid && (r.propertyName === 'coll[0].a' || r.propertyName === 'coll[1].a')).length, 0, 'error4');
      },
      {
        template: `
      <input id="target1" value.two-way="obj.coll[0].a | toNumber & validate:'change'">
      <input id="target2" value.two-way="obj.coll[1].a | toNumber & validate:'change'">
      `
      }
    );
    $it('can be used to validate nested property - initial non-undefined',
      async function ({ app, host, platform, ctx }: TestExecutionContext<App>) {
        const controller = app.controller;
        const person = app.person;
        person.address = { pin: 'foobar' as unknown as number, city: 'foobar', line1: 'foobar' };
        // await tasksSettled();

        const target: HTMLInputElement = host.querySelector('#target');
        assertControllerBinding(controller, 'person.address.pin|toNumber', target, app.controllerRegisterBindingSpy);

        assert.equal(controller.results.filter((r) => !r.valid && r.propertyName === 'address.pin').length, 0, 'error1');
        await controller.validate();
        assert.equal(controller.results.filter((r) => !r.valid && r.propertyName === 'address.pin').length, 1, 'error2');

        target.value = '123456';
        await assertEventHandler(target, 'change', 1, platform, app.controllerValidateBindingSpy, app.controllerValidateSpy, ctx);
        assert.equal(controller.results.filter((e) => !e.valid && e.propertyName === 'address.pin').length, 0, 'error3');
      },
      {
        template: `<input id="target" value.two-way="person.address.pin | toNumber & validate:'change'">`
      }
    );
    $it('can be used to validate nested property - intial undefined',
      async function ({ app, host, platform, ctx }: TestExecutionContext<App>) {
        const controller = app.controller;

        const target: HTMLInputElement = host.querySelector('#target');
        assertControllerBinding(controller, 'person.address.pin|toNumber', target, app.controllerRegisterBindingSpy);

        assert.equal(controller.results.filter((r) => !r.valid && r.propertyName === 'address.pin').length, 0, 'error1');
        await controller.validate();
        assert.equal(controller.results.filter((r) => !r.valid && r.propertyName === 'address.pin').length, 1, 'error2');

        target.value = '123456';
        await assertEventHandler(target, 'change', 1, platform, app.controllerValidateBindingSpy, app.controllerValidateSpy, ctx);
        assert.equal(controller.results.filter((e) => !e.valid && e.propertyName === 'address.pin').length, 0, 'error3');
      },
      {
        template: `<input id="target" value.two-way="person.address.pin | toNumber & validate:'change'">`
      }
    );
    $it('can be used to validate multi-level nested property',
      async function ({ app, host, platform, ctx }: TestExecutionContext<App>) {
        const controller = app.controller;
        const org = app.org;
        org.employees.push(new Person((void 0)!, (void 0)!, { pin: 'foobar' as unknown as number, city: 'foobar', line1: 'foobar' }));
        // await tasksSettled();

        const target: HTMLInputElement = host.querySelector('#target');
        assertControllerBinding(controller, 'org.employees[(0)].address.pin|toNumber', target, app.controllerRegisterBindingSpy);

        assert.equal(controller.results.filter((r) => !r.valid && r.propertyName === 'employees[0].address.pin').length, 0, 'error1');
        await controller.validate();
        assert.equal(controller.results.filter((r) => !r.valid && r.propertyName === 'employees[0].address.pin').length, 1, 'error2');

        target.value = '123456';
        await assertEventHandler(target, 'change', 1, platform, app.controllerValidateBindingSpy, app.controllerValidateSpy, ctx);
        assert.equal(controller.results.filter((e) => !e.valid && e.propertyName === 'employees[0].address.pin').length, 0, 'error3');
      },
      {
        template: `<input id="target" value.two-way="org.employees[0].address.pin | toNumber & validate:'change'">`
      }
    );
    // #endregion

    // #region au-slot
    $it('works with au-slot - projected part w/o $host',
      async function ({ app, host, platform, ctx }: TestExecutionContext<App>) {
        const controller = app.controller;

        const target: HTMLInputElement = host.querySelector('editor #target');
        assertControllerBinding(controller, 'person.name', target, app.controllerRegisterBindingSpy);

        assert.deepStrictEqual(controller.results.filter((r) => !r.valid).map((r) => r.toString()), []);
        await controller.validate();
        assert.deepStrictEqual(controller.results.filter((r) => !r.valid).map((r) => r.toString()), ['Name is required.']);

        target.value = 'foo';
        await assertEventHandler(target, 'change', 0, platform, app.controllerValidateBindingSpy, app.controllerValidateSpy, ctx);
        await assertEventHandler(target, 'focusout', 1, platform, app.controllerValidateBindingSpy, app.controllerValidateSpy, ctx);
        assert.deepStrictEqual(controller.results.filter((r) => !r.valid).map((r) => r.toString()), []);
      },
      {
        template: `<editor><input au-slot="content" id="target" value.two-way="person.name & validate"></editor>`
      }
    );

    // todo: enable the following tests if we ever allow validating deeper than access 1 property level
    // ---------------------
    // $it('works with au-slot - projected part with $host',
    //   async function ({ app, host, platform, ctx }: TestExecutionContext<App>) {
    //     const controller = app.controller;

    //     const target: HTMLInputElement = host.querySelector('editor #target');
    //     assertControllerBinding(controller, '$host.person.name', target, app.controllerRegisterBindingSpy);

    //     assert.deepStrictEqual(controller.results.filter((r) => !r.valid).map((r) => r.toString()), []);
    //     await controller.validate();
    //     assert.deepStrictEqual(controller.results.filter((r) => !r.valid).map((r) => r.toString()), ['Not foo']);

    //     target.value = 'foo';
    //     await assertEventHandler(target, 'change', 0, platform, app.controllerValidateBindingSpy, app.controllerValidateSpy, ctx);
    //     await assertEventHandler(target, 'focusout', 1, platform, app.controllerValidateBindingSpy, app.controllerValidateSpy, ctx);
    //     assert.deepStrictEqual(controller.results.filter((r) => !r.valid).map((r) => r.toString()), []);
    //   },
    //   {
    //     template: `<editor><input au-slot="content" id="target" value.two-way="$host.person.name & validate"></editor>`
    //   }
    // );
    $it('works with au-slot - non-projected part',
      async function ({ app, host, platform, ctx }: TestExecutionContext<App>) {
        const controller = app.controller;

        const target: HTMLInputElement = host.querySelector('editor1 #target');
        assertControllerBinding(controller, 'person.name', target, app.controllerRegisterBindingSpy);

        assert.deepStrictEqual(controller.results.filter((r) => !r.valid).map((r) => r.toString()), []);
        await controller.validate();
        assert.deepStrictEqual(controller.results.filter((r) => !r.valid).map((r) => r.toString()), ['Not foo']);

        target.value = 'foo';
        await assertEventHandler(target, 'change', 0, platform, app.controllerValidateBindingSpy, app.controllerValidateSpy, ctx);
        await assertEventHandler(target, 'focusout', 1, platform, app.controllerValidateBindingSpy, app.controllerValidateSpy, ctx);
        assert.deepStrictEqual(controller.results.filter((r) => !r.valid).map((r) => r.toString()), []);
      },
      {
        template: `<editor1></editor1>`
      }
    );

    // $it('works with au-slot - mis-projected part',
    //   async function ({ app, host, platform, ctx }: TestExecutionContext<App>) {
    //     const controller = app.controller;

    //     const target: HTMLInputElement = host.querySelector('editor #target');
    //     assertControllerBinding(controller, 'person.name', target, app.controllerRegisterBindingSpy);

    //     assert.deepStrictEqual(controller.results.filter((r) => !r.valid).map((r) => r.toString()), []);
    //     await controller.validate();
    //     assert.deepStrictEqual(controller.results.filter((r) => !r.valid).map((r) => r.toString()), ['Name is required.']);

    //     target.value = 'foo';
    //     await assertEventHandler(target, 'change', 0, platform, app.controllerValidateBindingSpy, app.controllerValidateSpy, ctx);
    //     await assertEventHandler(target, 'focusout', 1, platform, app.controllerValidateBindingSpy, app.controllerValidateSpy, ctx);
    //     assert.deepStrictEqual(controller.results.filter((r) => !r.valid).map((r) => r.toString()), []);
    //   },
    //   {
    //     template: `<editor><input id="target" value.two-way="person.name & validate"></editor>`
    //   }
    // );
    // #endregion

    const negativeTestData1 = [
      { text: 'listener binding', template: `<button click.delegate="handleClick() & validate"></button>` },
      { text: 'call binding', template: `<button action.call="handleClick() & validate"></button>` },
    ];
    for (const { text, template } of negativeTestData1) {
      it(`cannot be used with ${text}`, async function () {
        const ctx = TestContext.create();
        const container = ctx.container;
        const host = ctx.doc.createElement('app');
        ctx.doc.body.appendChild(host);
        container.register(delegateSyntax);
        const au = new Aurelia(container).register(ValidationHtmlConfiguration);

        try {
          await au
            .register(
              Registration.instance(IObserveCollection, false),
              callSyntax,
            )
            .app({
              host,
              component: CustomElement.define({ name: 'app', template }, App)
            })
            .start();
        } catch (e) {
          assert.includes(e.message, 'AUR4200');
        }
        await au.stop();
        ctx.doc.body.removeChild(host);

        au.dispose();
      });
    }

    it('can be used without any available registration for scoped controller', async function () {
      @customElement({ name: 'app', template: '<input id="target" type="text" value.two-way="person.name & validate:undefined:controller">' })
      class App1 {
        public person: Person = new Person((void 0)!, (void 0)!);
        public controllerRegisterBindingSpy: ISpy;
        public controllerUnregisterBindingSpy: ISpy;
        public controllerValidateBindingSpy: ISpy;
        public controllerValidateSpy: ISpy;

        public readonly controller: ValidationController = resolve(newInstanceOf(IValidationController)) as ValidationController;
        private readonly validationRules: IValidationRules = resolve(IValidationRules);
        public constructor() {
          this.controllerRegisterBindingSpy = createSpy(this.controller, 'registerBinding', true);
          this.controllerUnregisterBindingSpy = createSpy(this.controller, 'unregisterBinding', true);
          this.controllerValidateBindingSpy = createSpy(this.controller, 'validateBinding', true);
          this.controllerValidateSpy = createSpy(this.controller, 'validate', true);

          this.validationRules
            .on(this.person)

            .ensure('name')
            .required();
        }

        public unbinding() {
          this.validationRules.off();
        }

        public clearControllerCalls() {
          this.controllerRegisterBindingSpy.calls.splice(0);
          this.controllerUnregisterBindingSpy.calls.splice(0);
          this.controllerValidateBindingSpy.calls.splice(0);
          this.controllerValidateSpy.calls.splice(0);
        }
      }

      const ctx = TestContext.create();
      const container = ctx.container;
      const host = ctx.doc.createElement('app');
      ctx.doc.body.appendChild(host);
      const au = new Aurelia(container).register(ValidationHtmlConfiguration);

      await au
        .app({ host, component: App1 })
        .start();

      const app: App1 = au.root.controller.viewModel as App1;
      const controller = app.controller;
      const platform = container.get(IPlatform);

      const target: HTMLInputElement = host.querySelector('#target');
      assertControllerBinding(controller, 'person.name', target, app.controllerRegisterBindingSpy);

      assert.equal(controller.results.filter((r) => !r.valid).length, 0, 'error1');
      await controller.validate();
      assert.equal(controller.results.filter((r) => !r.valid).length, 1, 'error2');

      target.value = 'foo';
      await assertEventHandler(target, 'change', 0, platform, app.controllerValidateBindingSpy, app.controllerValidateSpy, ctx);
      await assertEventHandler(target, 'focusout', 1, platform, app.controllerValidateBindingSpy, app.controllerValidateSpy, ctx);
      assert.equal(controller.results.filter((e) => !e.valid && e.propertyName === 'name').length, 0, 'error3');

      await au.stop();
      ctx.doc.body.removeChild(host);

      au.dispose();
    });

    it('tagged rules works with binding behavior', async function () {

      class App {
        public person: Person = new Person((void 0)!, (void 0)!);

        public readonly controller: ValidationController = resolve(newInstanceOf(IValidationController)) as ValidationController;
        private readonly validationRules: IValidationRules = resolve(IValidationRules);
        public constructor() {
          this.validationRules
            .on(this.person)

            .ensure('name')
            .required()
            .tag('t1')

            .ensure('age')
            .required()
            .tag('t2')
            ;
        }

        public unbinding() {
          this.validationRules.off();
        }
      }

      const { stop, component } = await createFixture(
        '<input id="target-name" type="text" value.two-way="person.name & validate:undefined:controller"><input id="target-age" type="text" value.two-way="person.age & validate:undefined:controller">',
        App,
        [ValidationHtmlConfiguration]
      ).started;

      const controller = component.controller;

      let result = await controller.validate({ propertyTag: 't1' });
      assert.strictEqual(result.valid, false, 'result.valid1');
      let results = result.results.filter(x => !x.valid);
      assert.strictEqual(results.every(x => x.propertyName === 'name'), true, 'results.every(x => x.propertyName === \'name\')');

      component.person.name = 'foo';
      result = await controller.validate({ propertyTag: 't1' });
      assert.strictEqual(result.valid, true, 'result.valid2');
      results = result.results.filter(x => !x.valid);
      assert.strictEqual(results.length, 0, 'results.length2');

      result = await controller.validate({ propertyTag: 't2' });
      assert.strictEqual(result.valid, false, 'result.valid3');
      results = result.results.filter(x => !x.valid);
      assert.strictEqual(results.every(x => x.propertyName === 'age'), true, 'results.every(x => x.propertyName === \'age\')');

      component.person.age = 42;
      result = await controller.validate({ propertyTag: 't2' });
      assert.strictEqual(result.valid, true, 'result.valid4');
      results = result.results.filter(x => !x.valid);
      assert.strictEqual(results.length, 0, 'results.length4');

      assert.strictEqual((await controller.validate()).valid, true, 'await controller.validate()');

      component.person.name = (void 0)!;
      component.person.age = (void 0)!;
      result = await controller.validate();
      assert.strictEqual(result.valid, false, 'result.valid5');
      assert.deepStrictEqual(
        result.results.map(x => [x.propertyName, x.valid]),
        [['name', false], ['age', false]],
        'result.results.every(x => !x.valid)'
      );

      await stop(true);
    });

    it('works for conditionally rendered components with newly defined rules - GH issue 2025', async function () {
      type Model = { someProperty: number };

      @customElement({ name: 'ce-one', template: `<input value.bind="model.someProperty & validate">` })
      class CeOne {
        @bindable public model: Model;

        public readonly validationController: IValidationController = resolve(newInstanceForScope(IValidationController));
        private readonly validationRules: IValidationRules = resolve(IValidationRules);

        public bound() {
          this.model = structuredClone(this.model);
        }

        public attached() {
          this.setupValidationRules();
        }

        public detaching() {
          this.validationController.reset();
          this.validationRules.off();
        }

        private setupValidationRules() {
          this.validationRules
            .on(this.model)
            .ensure((x) => x.someProperty)
            .range(3, 20);
        }
      }

      class AppRoot {
        public isEditing: boolean = false;
        public model: Model = { someProperty: 1 };
      }

      const { stop, component, appHost } = await createFixture(
        `<ce-one if.bind="isEditing" model.bind></ce-one>`,
        AppRoot,
        [ValidationHtmlConfiguration, CeOne]
      ).started;

      component.isEditing = true;
      await tasksSettled();
      const ceOne: CeOne = CustomElement.for<CeOne>(appHost.querySelector('ce-one')).viewModel;
      const validationController = ceOne.validationController;
      let result = await validationController.validate();
      assertInvalidResult(result, 1);

      component.isEditing = false;
      await tasksSettled();
      result = await validationController.validate();
      assert.strictEqual(result.valid, true, 'result.valid 2');

      component.isEditing = true;
      await tasksSettled();
      result = await validationController.validate();
      assertInvalidResult(result, 3);

      await stop(true);

      function assertInvalidResult(result: ControllerValidateResult, iteration: number): void {
        assert.strictEqual(result.valid, false, `result.valid ${iteration}`);
        assert.strictEqual(result.results.length, 1, `result.results.length ${iteration}`);
        assert.strictEqual(result.results[0].propertyName, 'someProperty', `result.results[0].propertyName ${iteration}`);
        assert.strictEqual(result.results[0].message, 'Some Property must be between or equal to 3 and 20.', `result.results[0].message ${iteration}`);
      }
    });

    it('bindings are removed when composed components are removed', async function () {

      type EditorModel = { x: unknown };
      type LineItem = { editor: string; model: EditorModel };

      @customElement({
        name: 'edi-tor1',
        template: `editor1: <input type="text" value.bind="x & validate"></input>`,
      })
      class Editor1 {
        private x: unknown;
        public activate({ x }: EditorModel) {
          this.x = x;
        }
      }

      @customElement({
        name: 'edi-tor2',
        template: `editor2: <input type="text" value.bind="x & validate"></input>`,
      })
      class Editor2 {
        private x: unknown;
        public activate({ x }: EditorModel) {
          this.x = x;
        }
      }

      class MyApp {
        private editorMap: Map<string, string> = new Map<string, string>([
          ['editor1', 'edi-tor1'],
          ['editor2', 'edi-tor2'],
        ]);

        public lineItems: LineItem[] = [];
        public editor: string = '';

        public readonly validationController: IValidationController = resolve(newInstanceForScope(IValidationController));

        public addItem() {
          this.lineItems.push({
            editor: this.editorMap.get(this.editor),
            model: { x: undefined },
          });
          this.editor = null;
        }

        public removeItem(item: LineItem) {
          this.lineItems.splice(this.lineItems.indexOf(item), 1);
        }
      }

      const { stop, component } = await createFixture(
        `<div repeat.for="item of lineItems" style="display: flex; flex-direction: row;">
  \${item.editor}
  <au-compose component.bind="item.editor" model.bind="item.model"></au-compose>
  <button click.trigger="() => removeItem(item)">Remove</button>
</div>`,
        MyApp,
        [ValidationHtmlConfiguration, Editor1, Editor2]
      ).started;
      const validationController = component.validationController;
      assert.strictEqual(validationController.bindings.size, 0, 'validationController.bindings.size 1');

      // round#1 - add item
      component.editor = 'editor1';
      component.addItem();
      await tasksSettled();
      assert.strictEqual(validationController.bindings.size, 1, 'validationController.bindings.size 2');

      // round#2 - add item
      component.editor = 'editor2';
      component.addItem();
      await tasksSettled();
      assert.strictEqual(validationController.bindings.size, 2, 'validationController.bindings.size 3');

      // round#3 - add item
      component.editor = 'editor1';
      component.addItem();
      await tasksSettled();
      assert.strictEqual(validationController.bindings.size, 3, 'validationController.bindings.size 4');

      // round#4 - remove item
      component.removeItem(component.lineItems[1]);
      await tasksSettled();
      assert.strictEqual(validationController.bindings.size, 2, 'validationController.bindings.size 5');

      // round#5 - add item
      component.editor = 'editor2';
      component.addItem();
      await tasksSettled();
      assert.strictEqual(validationController.bindings.size, 3, 'validationController.bindings.size 6');

      // round#6 - add item
      component.editor = 'editor2';
      component.addItem();
      await tasksSettled();
      assert.strictEqual(validationController.bindings.size, 4, 'validationController.bindings.size 7');

      // round#7 - remove item
      component.removeItem(component.lineItems[0]);
      await tasksSettled();
      assert.strictEqual(validationController.bindings.size, 3, 'validationController.bindings.size 8');

      // round#8 - remove item
      component.removeItem(component.lineItems[0]);
      await tasksSettled();
      assert.strictEqual(validationController.bindings.size, 2, 'validationController.bindings.size 9');

      // round#9 - remove item
      component.removeItem(component.lineItems[0]);
      await tasksSettled();
      assert.strictEqual(validationController.bindings.size, 1, 'validationController.bindings.size 10');

      // round#10 - remove item
      component.removeItem(component.lineItems[0]);
      await tasksSettled();
      assert.strictEqual(validationController.bindings.size, 0, 'validationController.bindings.size 11');

      await stop(true);
    });

    it('works for conditionally accessed fields', async function () {
      class MyApp {
        public readonly person: Person = new Person((void 0)!, (void 0)!);
        public readonly validationController: IValidationController = resolve(newInstanceForScope(IValidationController));
        private readonly fields: (keyof Person)[] = ['name', 'age'];
        private readonly addressField: keyof Person = 'address';
        private readonly line1Field: keyof Address = 'line1';
        public constructor()  {
          resolve(IValidationRules)
          .on(this.person)
          .ensure(x => x.name)
          .required()
          .ensure(x => x.age)
          .required()
          .min(18)
          .ensure(x => x.address.line1)
          .required()
          .withMessage('Line1 is required.');
        }
      }

      const { stop, component, platform } = await createFixture(
        `<input repeat.for="field of fields" value.two-way="person[field] & validate"></input><input value.two-way="person[addressField][line1Field] & validate"></input>`,
        MyApp,
        [ValidationHtmlConfiguration]
      ).started;
      const domQueue = platform.domQueue;

      // round #1
      const validationController = component.validationController;
      let validationResult = await validationController.validate();
      assert.strictEqual(validationResult.valid, false, 'validationResult.valid 1');
      assert.deepStrictEqual(
        validationResult.results.map(x => [x.propertyName, x.valid, x.message]),
        [['address.line1', false, 'Line1 is required.'], ['name', false, 'Name is required.'], ['age', false, 'Age is required.'], ['age', true, undefined]],
        'validationResult.results 1'
      );

      // round #2
      component.person.age = 7;
      await domQueue.yield();

      validationResult = await validationController.validate();
      assert.strictEqual(validationResult.valid, false, 'validationResult2.valid 2');
      assert.deepStrictEqual(
        validationResult.results.map(x => [x.propertyName, x.valid, x.message]),
        [['address.line1', false, 'Line1 is required.'], ['name', false, 'Name is required.'], ['age', true, undefined], ['age', false, 'Age must be at least 18.']],
        'validationResult.results 2'
      );

      // round #3
      component.person.name = 'foo';
      component.person.age = 18;
      component.person.address = { pin: 123, city: 'foo', line1: 'foo' };
      await domQueue.yield();

      validationResult = await validationController.validate();
      assert.strictEqual(validationResult.valid, true, 'validationResult.valid 3');
      assert.deepStrictEqual(
        validationResult.results.map(x => [x.propertyName, x.valid, x.message]),
        [['address.line1', true, undefined], ['name', true, undefined], ['age', true, undefined], ['age', true, undefined]],
        'validationResult.results 3'
      );

      await stop(true);
    });

    class MyAppReplaceableSource {
      private _rules: IValidationRules;
      public person: Person = new Person((void 0)!, (void 0)!);
      public readonly validationController: IValidationController = resolve(newInstanceForScope(IValidationController));
      public constructor()  {
        this._rules = resolve(IValidationRules);
        this.applyValidation();
      }

      replaceBindingSource(person: Person){
        this._rules.off(this.person);
        this.person = person;
        this.applyValidation();
      }

      private applyValidation() {
        this._rules
        .on(this.person)
        .ensure(x => x.name)
        .required();
      }
    }

    it('replaced binding source validates', async function () {
      const { stop, component, platform } = await createFixture(
        `<input value.two-way="person.name & validate"></input>`,
        MyAppReplaceableSource,
        [ValidationHtmlConfiguration]
      ).started;
      const domQueue = platform.domQueue;

      // round #1
      const validationController = component.validationController;
      let validationResult = await validationController.validate();
      assert.strictEqual(validationResult.valid, false, 'validationResult.valid 1');
      assert.deepStrictEqual(
        validationResult.results.map(x => [x.propertyName, x.valid, x.message]),
        [['name', false, 'Name is required.']],
        'validationResult.results 1'
      );

      // round #2
      component.person.name = 'Aurelia';
      await domQueue.yield();

      validationResult = await validationController.validate();
      assert.strictEqual(validationResult.valid, true, 'validationResult2.valid 2');
      assert.deepStrictEqual(
        validationResult.results.map(x => [x.propertyName, x.valid, x.message]),
        [['name', true, undefined]],
        'validationResult.results 2'
      );

      // round #3 - replace the binding source
      component.replaceBindingSource(new Person(void 0, void 0));
      await domQueue.yield();

      validationResult = await validationController.validate();
      assert.strictEqual(validationResult.valid, false, 'validationResult.valid 1');
      assert.deepStrictEqual(
        validationResult.results.map(x => [x.propertyName, x.valid, x.message]),
        [['name', false, 'Name is required.']],
        'validationResult.results 3'
      );

      // round #4 - make new binding source valid
      component.person.name = 'Replaced Aurelia';
      await domQueue.yield();

      validationResult = await validationController.validate();
      assert.strictEqual(validationResult.valid, true, 'validationResult2.valid 2');
      assert.deepStrictEqual(
        validationResult.results.map(x => [x.propertyName, x.valid, x.message]),
        [['name', true, undefined]],
        'validationResult.results 2'
      );

      await stop(true);
    });

    it('replaced binding source invalidates cached property info', async function () {
      const { stop, component, platform } = await createFixture(
        `<input value.two-way="person.name & validate"></input>`,
        MyAppReplaceableSource,
        [ValidationHtmlConfiguration]
      ).started;
      const domQueue = platform.domQueue;
      const controller = component.validationController;

      let bindings = Array.from((controller['bindings'] as Map<IBinding, BindingInfo>).values()) as BindingInfo[];
      let binding = bindings[0];

      // round #1 nothing cached before validation
      assert.equal(binding.propertyInfo, undefined);

      // round #2
      await controller.validate();
      bindings = Array.from((controller['bindings'] as Map<IBinding, BindingInfo>).values()) as BindingInfo[];
      binding = bindings[0];
      assert.equal(binding.propertyInfo.object, component.person);

      // round #3 - replace the binding source, property info removed
      const replacement = new Person(void 0, void 0);
      component.replaceBindingSource(replacement);
      await domQueue.yield();
      bindings = Array.from((controller['bindings'] as Map<IBinding, BindingInfo>).values()) as BindingInfo[];
      binding = bindings[0];
      assert.equal(binding.propertyInfo, undefined);

      // round #4 - after validate, new source is cached
      await controller.validate();
      bindings = Array.from((controller['bindings'] as Map<IBinding, BindingInfo>).values()) as BindingInfo[];
      binding = bindings[0];
      assert.equal(binding.propertyInfo.object, replacement);

      await stop(true);
    });
  });
});
