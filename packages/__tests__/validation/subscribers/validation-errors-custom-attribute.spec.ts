import { IContainer, Registration, toArray } from '@aurelia/kernel';
import { Aurelia, CustomElement, IScheduler, CustomAttribute } from '@aurelia/runtime';
import { TestContext, assert, createSpy, ISpy, getVisibleText } from '@aurelia/testing';
import {
  IValidationController,
  IValidationControllerFactory,
  IValidationRules,
  ValidationConfiguration,
  ValidationController,
  ValidationErrorsCustomAttribute,
  ValidationErrorsSubscriber,
} from '@aurelia/validation';
import { Spy } from '../../Spy';
import { createSpecFunction, TestExecutionContext, TestFunction, ToNumberValueConverter } from '../../util';
import { Person } from '../_test-resources';

describe.only('validation-errors-custom-attribute', function () {

  class App {
    public person: Person = new Person((void 0)!, (void 0)!);
    public controllerSpy: Spy;
    public controller2Spy: Spy;
    public readonly scheduler: IScheduler;
    public controller: ValidationController;
    public controller2: ValidationController;
    private readonly validationRules: IValidationRules;

    public constructor(container: IContainer) {
      const factory = container.get(IValidationControllerFactory);
      this.scheduler = container.get(IScheduler);
      this.controllerSpy = new Spy();
      this.controller2Spy = new Spy();

      // mocks ValidationControllerFactory#createForCurrentScope
      const controller = this.controller = this.controllerSpy.getMock(factory.create()) as unknown as ValidationController;
      Registration.instance(IValidationController, controller).register(container);

      this.controller2 = this.controller2Spy.getMock(factory.create()) as unknown as ValidationController;

      const validationRules = this.validationRules = container.get(IValidationRules);
      validationRules
        .on(this.person)

        .ensure('name')
        .displayName('Name')
        .required()

        .ensure('age')
        .displayName('Age')
        .required()
        .satisfies((age: any) => age !== '' && age % 3 === 0 && age % 5 === 0)
        .withMessage('\${$displayName} is not fizbaz');
    }

    public beforeUnbind() {
      this.validationRules.off();
    }
  }
  interface TestSetupContext {
    template: string;
    removeSubscriberSpies?: Record<string, number>;
  }
  async function runTest(
    testFunction: TestFunction<TestExecutionContext<App>>,
    { template, removeSubscriberSpies }: TestSetupContext
  ) {
    const ctx = TestContext.createHTMLTestContext();
    const container = ctx.container;
    const host = ctx.dom.createElement('app');
    ctx.doc.body.appendChild(host);
    let app: App;
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

    await testFunction({ app, host, container, scheduler: app.scheduler });

    await au.stop().wait();
    ctx.doc.body.removeChild(host);
    if (removeSubscriberSpies !== void 0) {
      for (const [spy, count] of Object.entries(removeSubscriberSpies)) {
        app[spy].methodCalledTimes('removeSubscriber', count);
      }
    } else {
      app.controllerSpy.methodCalledTimes('removeSubscriber', template.match(/validation-errors/g).length);
    }
  }

  const $it = createSpecFunction(runTest);

  async function assertEventHandler(
    target: HTMLElement,
    scheduler: IScheduler,
    controllerSpy: Spy,
    handleValidationEventSpy: ISpy,
    event: string = 'blur'
  ) {
    handleValidationEventSpy.calls.splice(0);
    controllerSpy.clearCallRecords();
    target.dispatchEvent(new Event(event));
    await scheduler.yieldAll(10);
    controllerSpy.methodCalledTimes('validate', 1);
    assert.equal(handleValidationEventSpy.calls.length, 1, 'incorrect #calls for handleValidationEvent');
  }
  function assertSubscriber(controller: ValidationController, ca: ValidationErrorsCustomAttribute) {
    const subscribers = (controller['subscribers'] as ValidationErrorsSubscriber[]);
    assert.equal((subscribers).includes(ca), true);
    assert.equal(Object.is(ca.controller, controller), true);
  }

  $it('registers only the errors targeted for the containing elements',
    async function ({ host, scheduler, app }) {
      const div1 = host.querySelector('#div1');
      const div2 = host.querySelector('#div2');
      const ca1: ValidationErrorsCustomAttribute = CustomAttribute.for(div1, 'validation-errors').viewModel as unknown as ValidationErrorsCustomAttribute;
      const ca2: ValidationErrorsCustomAttribute = CustomAttribute.for(div2, 'validation-errors').viewModel as unknown as ValidationErrorsCustomAttribute;
      const spy1 = createSpy(ca1, 'handleValidationEvent', true);
      const spy2 = createSpy(ca2, 'handleValidationEvent', true);
      const { controllerSpy, controller } = app;

      assertSubscriber(controller, ca1);
      assertSubscriber(controller, ca2);

      const target1 = div1.querySelector('#target1') as HTMLInputElement;
      const target2 = div2.querySelector('#target2') as HTMLInputElement;

      await assertEventHandler(target1, scheduler, controllerSpy, spy1);
      target2.value = "foo";
      target2.dispatchEvent(new Event('change'));
      await scheduler.yieldAll(10);
      await assertEventHandler(target2, scheduler, controllerSpy, spy2);

      let errors1 = ca1.errors;
      assert.deepEqual(app['nameErrors'], errors1);
      assert.equal(errors1.length, 1);
      assert.deepEqual(errors1[0].targets, [target1]);

      let errors2 = ca2.errors;
      assert.deepEqual(app['ageErrors'], errors2);
      assert.equal(errors2.length, 2);
      assert.deepEqual(errors2[0].targets, [target2]);
      assert.deepEqual(errors2[1].targets, [target2]);

      assert.html.textContent(div1.querySelector('span.error'), 'Name is required.');
      assert.deepEqual(
        toArray(div2.querySelectorAll('span.error'))
          .map((span) => getVisibleText((void 0)!, span, true)),
        ['Age is required.', 'Age is not fizbaz']
      );

      target1.value = "foo";
      target1.dispatchEvent(new Event('change'));
      await scheduler.yieldAll(10);
      await assertEventHandler(target1, scheduler, controllerSpy, spy1);

      target2.value = "15";
      target2.dispatchEvent(new Event('change'));
      await scheduler.yieldAll(10);
      await assertEventHandler(target2, scheduler, controllerSpy, spy2);

      errors1 = ca1.errors;
      assert.equal(errors1.length, 0);
      assert.equal(div1.querySelectorAll('span.error').length, 0);
      errors2 = ca2.errors;
      assert.equal(errors2.length, 0);
      assert.equal(div2.querySelectorAll('span.error').length, 0);
    },
    {
      template: `
    <div id="div1" validation-errors.bind="nameErrors">
      <input id="target1" type="text" value.two-way="person.name & validate">
      <span class="error" repeat.for="errorInfo of nameErrors">
        \${errorInfo.result.message}
      </span>
    </div>
    <div id="div2" validation-errors.bind="ageErrors">
      <input id="target2" type="text" value.two-way="person.age | toNumber & validate">
      <span class="error" repeat.for="errorInfo of ageErrors">
        \${errorInfo.result.message}
      </span>
    </div>    
    ` }
  );

  $it('sorts the errors according to the target position',
    async function ({ host, scheduler, app }) {
      const div = host.querySelector('div');
      const ca: ValidationErrorsCustomAttribute = CustomAttribute.for(div, 'validation-errors').viewModel as unknown as ValidationErrorsCustomAttribute;
      const spy = createSpy(ca, 'handleValidationEvent', true);
      const { controllerSpy, controller } = app;

      assertSubscriber(controller, ca);

      const target1 = div.querySelector('#target1') as HTMLInputElement;
      const target2 = div.querySelector('#target2') as HTMLInputElement;

      await assertEventHandler(target1, scheduler, controllerSpy, spy);
      target2.value = "foo";
      target2.dispatchEvent(new Event('change'));
      await scheduler.yieldAll(10);
      await assertEventHandler(target2, scheduler, controllerSpy, spy);

      const errors1 = ca.errors;
      assert.deepEqual(app['errors'], errors1);
      assert.equal(errors1.length, 3);
      assert.deepEqual(errors1[0].targets, [target1]);
      assert.deepEqual(errors1[1].targets, [target2]);
      assert.deepEqual(errors1[2].targets, [target2]);

      assert.deepEqual(
        toArray(div.querySelectorAll('span.error'))
          .map((span) => getVisibleText((void 0)!, span, true)),
        ['Name is required.', 'Age is required.', 'Age is not fizbaz']
      );
    },
    {
      template: `
    <div id="div" validation-errors.bind="errors">
      <input id="target1" type="text" value.two-way="person.name & validate">
      <input id="target2" type="text" value.two-way="person.age | toNumber & validate">
      <span class="error" repeat.for="errorInfo of errors">
        \${errorInfo.result.message}
      </span>
    </div>
    ` }
  );

  $it('respects bound controller',
    async function ({ host, scheduler, app }) {
      const div1 = host.querySelector('#div1');
      const div2 = host.querySelector('#div2');
      const ca1: ValidationErrorsCustomAttribute = CustomAttribute.for(div1, 'validation-errors').viewModel as unknown as ValidationErrorsCustomAttribute;
      const ca2: ValidationErrorsCustomAttribute = CustomAttribute.for(div2, 'validation-errors').viewModel as unknown as ValidationErrorsCustomAttribute;
      const spy1 = createSpy(ca1, 'handleValidationEvent', true);
      const spy2 = createSpy(ca2, 'handleValidationEvent', true);
      const { controllerSpy, controller, controller2Spy, controller2 } = app;

      assertSubscriber(controller, ca1);
      assertSubscriber(controller2, ca2);

      const target1 = div1.querySelector('#target1') as HTMLInputElement;
      const target2 = div2.querySelector('#target2') as HTMLInputElement;

      await assertEventHandler(target1, scheduler, controllerSpy, spy1);
      target2.value = "foo";
      target2.dispatchEvent(new Event('change'));
      await scheduler.yieldAll(10);
      await assertEventHandler(target2, scheduler, controller2Spy, spy2);

      let errors1 = ca1.errors;
      assert.deepEqual(app['nameErrors'], errors1);
      assert.equal(errors1.length, 1);
      assert.deepEqual(errors1[0].targets, [target1]);

      let errors2 = ca2.errors;
      assert.deepEqual(app['ageErrors'], errors2);
      assert.equal(errors2.length, 2);
      assert.deepEqual(errors2[0].targets, [target2]);
      assert.deepEqual(errors2[1].targets, [target2]);

      assert.html.textContent(div1.querySelector('span.error'), 'Name is required.');
      assert.deepEqual(
        toArray(div2.querySelectorAll('span.error'))
          .map((span) => getVisibleText((void 0)!, span, true)),
        ['Age is required.', 'Age is not fizbaz']
      );

      target1.value = "foo";
      target1.dispatchEvent(new Event('change'));
      await scheduler.yieldAll(10);
      await assertEventHandler(target1, scheduler, controllerSpy, spy1);

      target2.value = "15";
      target2.dispatchEvent(new Event('change'));
      await scheduler.yieldAll(10);
      await assertEventHandler(target2, scheduler, controller2Spy, spy2);

      errors1 = ca1.errors;
      assert.equal(errors1.length, 0);
      assert.equal(div1.querySelectorAll('span.error').length, 0);
      errors2 = ca2.errors;
      assert.equal(errors2.length, 0);
      assert.equal(div2.querySelectorAll('span.error').length, 0);
    },
    {
      template: `
    <div id="div1" validation-errors="errors.bind: nameErrors; controller.bind: controller;">
      <input id="target1" type="text" value.two-way="person.name & validate:'blur':controller">
      <span class="error" repeat.for="errorInfo of nameErrors">
        \${errorInfo.result.message}
      </span>
    </div>
    <div id="div2" validation-errors="errors.bind: ageErrors; controller.bind: controller2;">
      <input id="target2" type="text" value.two-way="person.age | toNumber & validate:'blur':controller2">
      <span class="error" repeat.for="errorInfo of ageErrors">
        \${errorInfo.result.message}
      </span>
    </div>    
    `,
      removeSubscriberSpies: { controllerSpy: 1, controller2Spy: 1 }
    }
  );

  $it('does not put the errors in VM when used with let',
    async function ({ host, scheduler, app }) {
      const div = host.querySelector('div');
      const ca: ValidationErrorsCustomAttribute = CustomAttribute.for(div, 'validation-errors').viewModel as unknown as ValidationErrorsCustomAttribute;
      const spy = createSpy(ca, 'handleValidationEvent', true);
      const { controllerSpy, controller } = app;

      assertSubscriber(controller, ca);

      const target = div.querySelector('#target1') as HTMLInputElement;

      await assertEventHandler(target, scheduler, controllerSpy, spy);

      const errors1 = ca.errors;
      assert.equal('errors' in app, false);
      assert.equal(errors1.length, 1);
      assert.deepEqual(errors1[0].targets, [target]);
      assert.html.textContent(div.querySelector('span.error'), 'Name is required.');
    },
    {
      template: `
    <let errors.bind="undefined"></let>
    <div id="div" validation-errors.bind="errors">
      <input id="target1" type="text" value.two-way="person.name & validate">
      <span class="error" repeat.for="errorInfo of errors">
        \${errorInfo.result.message}
      </span>
    </div>
    ` }
  );
});
