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
    public readonly scheduler: IScheduler;
    public controller: ValidationController;

    public constructor(@IContainer container: IContainer) {
      const factory = container.get(IValidationControllerFactory);
      this.scheduler = container.get(IScheduler);
      this.controllerSpy = new Spy();

      // mocks ValidationControllerFactory#createForCurrentScope
      const controller = this.controller = this.controllerSpy.getMock(factory.create()) as unknown as ValidationController;
      Registration.instance(IValidationController, controller).register(container);

      container.get(IValidationRules)
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
    app.controllerSpy.methodCalledTimes('removeSubscriber', template.match(/validation-errors/g).length);
  }

  const $it = createSpecFunction(runTest);

  async function assertEventHandler(
    target: HTMLElement,
    scheduler: IScheduler,
    controllerSpy: Spy,
    handleValidationEventSpy: ISpy
  ) {
    handleValidationEventSpy.calls.splice(0);
    controllerSpy.clearCallRecords();
    target.dispatchEvent(new Event('blur'));
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
});
