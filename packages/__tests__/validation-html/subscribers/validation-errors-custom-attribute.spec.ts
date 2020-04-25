import { newInstanceForScope, newInstanceOf, toArray } from '@aurelia/kernel';
import { Aurelia, CustomAttribute, CustomElement, customElement, IScheduler } from '@aurelia/runtime';
import { assert, createSpy, getVisibleText, HTMLTestContext, ISpy, TestContext } from '@aurelia/testing';
import { IValidationRules } from '@aurelia/validation';
import {
  IValidationController,
  ValidationController,
  ValidationErrorsCustomAttribute,
  ValidationHtmlConfiguration,
  ValidationResultsSubscriber,
} from '@aurelia/validation-html';
import { createSpecFunction, TestExecutionContext, TestFunction, ToNumberValueConverter } from '../../util';
import { Person } from '../../validation/_test-resources';

describe('validation-errors-custom-attribute', function () {

  class App {
    public person: Person = new Person((void 0)!, (void 0)!);
    public controllerValidateSpy: ISpy;
    public controllerRemoveSubscriberSpy: ISpy;
    public controller2ValidateSpy: ISpy;
    public controller2RemoveSubscriberSpy: ISpy;
    public constructor(
      @IScheduler public readonly scheduler: IScheduler,
      @newInstanceForScope(IValidationController) public controller: ValidationController,
      @newInstanceOf(IValidationController) public controller2: ValidationController,
      @IValidationRules private readonly validationRules: IValidationRules,
    ) {
      this.controllerValidateSpy = createSpy(controller, 'validate', true);
      this.controllerRemoveSubscriberSpy = createSpy(controller, 'removeSubscriber', true);
      this.controller2ValidateSpy = createSpy(controller2, 'validate', true);
      this.controller2RemoveSubscriberSpy = createSpy(controller2, 'removeSubscriber', true);
      validationRules
        .on(this.person)

        .ensure('name')
        .displayName('Name')
        .required()

        .ensure('age')
        .displayName('Age')
        .required()
        .satisfies((age: any) => age !== '' && age % 3 === 0 && age % 5 === 0)
        .withMessage('${$displayName} is not fizbaz');
    }

    public beforeUnbind() {
      this.validationRules.off();
      // mandatory cleanup in root
      this.controller.reset();
    }

    public afterUnbind() {
      const controller = this.controller;
      assert.equal(controller.results.length, 0, 'the result should have been removed');
      assert.equal(controller.bindings.size, 0, 'the bindings should have been removed');
      assert.equal(controller.objects.size, 0, 'the objects should have been removed');
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
      .start()
      .wait();

    const app = au.root.viewModel as App;
    await testFunction({ app, host, container, scheduler: app.scheduler, ctx });

    await au.stop().wait();
    ctx.doc.body.removeChild(host);
    if (removeSubscriberSpies !== void 0) {
      for (const [spy, count] of Object.entries(removeSubscriberSpies)) {
        assert.equal(app[spy].calls.length, count);
      }
    } else {
      assert.equal(app.controllerRemoveSubscriberSpy.calls.length, template.match(/validation-errors|validate/g).length);
    }
  }

  const $it = createSpecFunction(runTest);

  async function assertEventHandler(
    target: HTMLElement,
    scheduler: IScheduler,
    controllerValidateSpy: ISpy,
    handleValidationEventSpy: ISpy,
    ctx: HTMLTestContext,
    event: string = 'focusout',
  ) {
    handleValidationEventSpy.calls.splice(0);
    controllerValidateSpy.calls.splice(0);
    target.dispatchEvent(new ctx.Event(event));
    await scheduler.yieldAll(10);
    assert.equal(controllerValidateSpy.calls.length, 1, 'incorrect #calls for validate');
    assert.equal(handleValidationEventSpy.calls.length, 1, 'incorrect #calls for handleValidationEvent');
  }
  function assertSubscriber(controller: ValidationController, ca: ValidationErrorsCustomAttribute) {
    const subscribers = (controller['subscribers'] as Set<ValidationResultsSubscriber>);
    assert.equal((subscribers).has(ca), true);
    assert.equal(ca.controller, controller);
  }

  $it('registers only the errors targeted for the containing elements',
    async function ({ host, scheduler, app, ctx }) {
      const div1 = host.querySelector('#div1');
      const div2 = host.querySelector('#div2');
      const ca1: ValidationErrorsCustomAttribute = CustomAttribute.for(div1, 'validation-errors').viewModel as unknown as ValidationErrorsCustomAttribute;
      const ca2: ValidationErrorsCustomAttribute = CustomAttribute.for(div2, 'validation-errors').viewModel as unknown as ValidationErrorsCustomAttribute;
      const spy1 = createSpy(ca1, 'handleValidationEvent', true);
      const spy2 = createSpy(ca2, 'handleValidationEvent', true);
      const { controllerValidateSpy, controller } = app;

      // assert that things are correctly wired up
      assertSubscriber(controller, ca1);
      assertSubscriber(controller, ca2);

      const target1 = div1.querySelector('#target1') as HTMLInputElement;
      const target2 = div2.querySelector('#target2') as HTMLInputElement;

      await assertEventHandler(target1, scheduler, controllerValidateSpy, spy1, ctx);
      target2.value = 'foo';
      target2.dispatchEvent(new ctx.Event('change'));
      await scheduler.yieldAll(10);
      await assertEventHandler(target2, scheduler, controllerValidateSpy, spy2, ctx);

      // assert that errors are rendered in the respective containers
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

      // assert that errors are removed
      target1.value = 'foo';
      target1.dispatchEvent(new ctx.Event('change'));
      await scheduler.yieldAll(10);
      await assertEventHandler(target1, scheduler, controllerValidateSpy, spy1, ctx);

      target2.value = '15';
      target2.dispatchEvent(new ctx.Event('change'));
      await scheduler.yieldAll(10);
      await assertEventHandler(target2, scheduler, controllerValidateSpy, spy2, ctx);

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
    async function ({ host, scheduler, app, ctx }) {
      const div = host.querySelector('div');
      const ca: ValidationErrorsCustomAttribute = CustomAttribute.for(div, 'validation-errors').viewModel as unknown as ValidationErrorsCustomAttribute;
      const spy = createSpy(ca, 'handleValidationEvent', true);
      const { controllerValidateSpy, controller } = app;

      assertSubscriber(controller, ca);

      const target1 = div.querySelector('#target1') as HTMLInputElement;
      const target2 = div.querySelector('#target2') as HTMLInputElement;

      await assertEventHandler(target1, scheduler, controllerValidateSpy, spy, ctx);
      target2.value = 'foo';
      target2.dispatchEvent(new ctx.Event('change'));
      await scheduler.yieldAll(10);
      await assertEventHandler(target2, scheduler, controllerValidateSpy, spy, ctx);

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
    async function ({ host, scheduler, app, ctx }) {
      const div1 = host.querySelector('#div1');
      const div2 = host.querySelector('#div2');
      const ca1: ValidationErrorsCustomAttribute = CustomAttribute.for(div1, 'validation-errors').viewModel as unknown as ValidationErrorsCustomAttribute;
      const ca2: ValidationErrorsCustomAttribute = CustomAttribute.for(div2, 'validation-errors').viewModel as unknown as ValidationErrorsCustomAttribute;
      const spy1 = createSpy(ca1, 'handleValidationEvent', true);
      const spy2 = createSpy(ca2, 'handleValidationEvent', true);
      const { controllerValidateSpy, controller, controller2ValidateSpy, controller2 } = app;

      // assert that things are correctly wired up
      assertSubscriber(controller, ca1);
      assertSubscriber(controller2, ca2);

      const target1 = div1.querySelector('#target1') as HTMLInputElement;
      const target2 = div2.querySelector('#target2') as HTMLInputElement;

      await assertEventHandler(target1, scheduler, controllerValidateSpy, spy1, ctx);
      target2.value = 'foo';
      target2.dispatchEvent(new ctx.Event('change'));
      await scheduler.yieldAll(10);
      await assertEventHandler(target2, scheduler, controller2ValidateSpy, spy2, ctx);

      // assert that errors are rendered in the respective containers
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

      // assert that errors are removed
      target1.value = 'foo';
      target1.dispatchEvent(new ctx.Event('change'));
      await scheduler.yieldAll(10);
      await assertEventHandler(target1, scheduler, controllerValidateSpy, spy1, ctx);

      target2.value = '15';
      target2.dispatchEvent(new ctx.Event('change'));
      await scheduler.yieldAll(10);
      await assertEventHandler(target2, scheduler, controller2ValidateSpy, spy2, ctx);

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
      <input id="target1" type="text" value.two-way="person.name & validate:'focusout':controller">
      <span class="error" repeat.for="errorInfo of nameErrors">
        \${errorInfo.result.message}
      </span>
    </div>
    <div id="div2" validation-errors="errors.bind: ageErrors; controller.bind: controller2;">
      <input id="target2" type="text" value.two-way="person.age | toNumber & validate:'focusout':controller2">
      <span class="error" repeat.for="errorInfo of ageErrors">
        \${errorInfo.result.message}
      </span>
    </div>
    `,
      removeSubscriberSpies: { controllerRemoveSubscriberSpy: 2, controller2RemoveSubscriberSpy: 2 }
    }
  );

  $it('does not put the errors in VM when used with let',
    async function ({ host, scheduler, app, ctx }) {
      const div = host.querySelector('div');
      const ca: ValidationErrorsCustomAttribute = CustomAttribute.for(div, 'validation-errors').viewModel as unknown as ValidationErrorsCustomAttribute;
      const spy = createSpy(ca, 'handleValidationEvent', true);
      const { controllerValidateSpy, controller } = app;

      assertSubscriber(controller, ca);

      const target = div.querySelector('#target1') as HTMLInputElement;

      await assertEventHandler(target, scheduler, controllerValidateSpy, spy, ctx);

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

  it.skip('can be used without any available registration for scoped controller', async function () {
    @customElement({
      name: 'app',
      template: `
    <div id="div1" validation-errors="errors.bind: nameErrors; controller.bind: controller;">
      <input id="target1" type="text" value.two-way="person.name & validate:undefined:controller">
      <span class="error" repeat.for="errorInfo of nameErrors">
        \${errorInfo.result.message}
      </span>
    </div>
    `})
    class App1 {
      public person: Person = new Person((void 0)!, (void 0)!);
      public controllerValidateSpy: ISpy;

      public constructor(
        @newInstanceOf(IValidationController) public readonly controller: ValidationController,
        @IValidationRules private readonly validationRules: IValidationRules,
      ) {
        this.controllerValidateSpy = createSpy(controller, 'validate', true);

        validationRules
          .on(this.person)

          .ensure('name')
          .required();
      }

      public beforeUnbind() {
        this.validationRules.off();
      }
    }

    const ctx = TestContext.createHTMLTestContext();
    const container = ctx.container;
    const host = ctx.dom.createElement('app');
    ctx.doc.body.appendChild(host);
    const au = new Aurelia(container).register(ValidationHtmlConfiguration);

    await au
      .app({ host, component: App1 })
      .start()
      .wait();

    const app: App1 = au.root.viewModel as App1;
    const scheduler = container.get(IScheduler);

    const div1 = host.querySelector('#div1');
    const ca1: ValidationErrorsCustomAttribute = CustomAttribute.for(div1, 'validation-errors').viewModel as unknown as ValidationErrorsCustomAttribute;
    const spy1 = createSpy(ca1, 'handleValidationEvent', true);
    const { controllerValidateSpy, controller } = app;

    // assert that things are correctly wired up
    assertSubscriber(controller, ca1);
    assert.equal(ca1['scopedController'], null);
    assert.notEqual(ca1['scopedController'], controller);

    const target1 = div1.querySelector('#target1') as HTMLInputElement;

    await assertEventHandler(target1, scheduler, controllerValidateSpy, spy1, ctx);
    await scheduler.yieldAll(10);

    // assert that errors are rendered in the respective containers
    let errors1 = ca1.errors;
    assert.deepEqual(app['nameErrors'], errors1);
    assert.equal(errors1.length, 1);
    assert.deepEqual(errors1[0].targets, [target1]);

    assert.html.textContent(div1.querySelector('span.error'), 'Name is required.');

    // assert that errors are removed
    target1.value = 'foo';
    target1.dispatchEvent(new ctx.Event('change'));
    await scheduler.yieldAll(10);
    await assertEventHandler(target1, scheduler, controllerValidateSpy, spy1, ctx);

    errors1 = ca1.errors;
    assert.equal(errors1.length, 0);
    assert.equal(div1.querySelectorAll('span.error').length, 0);

    await au.stop().wait();
    ctx.doc.body.removeChild(host);
  });
});
