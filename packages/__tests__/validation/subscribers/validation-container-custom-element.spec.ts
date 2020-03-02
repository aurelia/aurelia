import { IContainer, Registration, toArray } from '@aurelia/kernel';
import { IScheduler, Aurelia, CustomElement } from '@aurelia/runtime';
import { assert, TestContext, ISpy, HTMLTestContext, createSpy, getVisibleText } from '@aurelia/testing';
import {
  IValidationController,
  IValidationControllerFactory,
  IValidationRules,
  ValidationController,
  ValidationConfiguration,
  ValidationResultsSubscriber,
  ValidationContainerCustomElement
} from '@aurelia/validation';
import { Spy } from '../../Spy';
import { Person } from '../_test-resources';
import { TestFunction, TestExecutionContext, ToNumberValueConverter, createSpecFunction } from '../../util';

describe('validation-container-custom-element', function () {

  class App {
    public person: Person = new Person((void 0)!, (void 0)!);
    public controllerSpy: Spy;
    public readonly scheduler: IScheduler;
    public controller: ValidationController;
    private readonly validationRules: IValidationRules;

    public constructor(container: IContainer) {
      const factory = container.get(IValidationControllerFactory);
      this.scheduler = container.get(IScheduler);
      this.controllerSpy = new Spy();

      // mocks ValidationControllerFactory#createForCurrentScope
      const controller = this.controller = this.controllerSpy.getMock(factory.create()) as unknown as ValidationController;
      Registration.instance(IValidationController, controller).register(container);

      const validationRules = this.validationRules = container.get(IValidationRules);
      validationRules
        .on(this.person)

        .ensure('name')
        .displayName('Name')
        .required()

        .ensure('age')
        .displayName('Age')
        .required()
        .satisfies((age: any) => age === null || age === void 0 || age % 3 === 0 && age % 5 === 0)
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

    await testFunction({ app, host, container, scheduler: app.scheduler, ctx });

    await au.stop().wait();
    ctx.doc.body.removeChild(host);
    if (removeSubscriberSpies !== void 0) {
      for (const [spy, count] of Object.entries(removeSubscriberSpies)) {
        app[spy].methodCalledTimes('removeSubscriber', count);
      }
    } else {
      app.controllerSpy.methodCalledTimes('removeSubscriber', template.match(/validation-container/g).length / 2);
    }
  }

  const $it = createSpecFunction(runTest);

  async function assertEventHandler(
    target: HTMLElement,
    scheduler: IScheduler,
    controllerSpy: Spy,
    handleValidationEventSpy: ISpy,
    ctx: HTMLTestContext,
    event: string = 'blur',
  ) {
    handleValidationEventSpy.calls.splice(0);
    controllerSpy.clearCallRecords();
    target.dispatchEvent(new ctx.Event(event));
    await scheduler.yieldAll(10);
    controllerSpy.methodCalledTimes('validate', 1);
    assert.equal(handleValidationEventSpy.calls.length, 1, 'incorrect #calls for handleValidationEvent');
  }
  function assertSubscriber(controller: ValidationController, ce: ValidationContainerCustomElement) {
    const subscribers = (controller['subscribers'] as Set<ValidationResultsSubscriber>);
    assert.equal((subscribers).has(ce), true);
    assert.equal(ce['controller'], controller);
  }

  $it('shows the errors for the containing validation targets',
    async function ({ host, scheduler, app, ctx }) {
      const ceEl1 = host.querySelector('validation-container');
      const ceEl2 = host.querySelector('validation-container:nth-of-type(2)');
      const ceVm1: ValidationContainerCustomElement = CustomElement.for(ceEl1).viewModel as ValidationContainerCustomElement;
      const ceVm2: ValidationContainerCustomElement = CustomElement.for(ceEl2).viewModel as ValidationContainerCustomElement;

      const controller = app.controller;

      assertSubscriber(controller, ceVm1);
      assertSubscriber(controller, ceVm2);

      const input1: HTMLInputElement = ceEl1.querySelector('input#target1');
      const input2: HTMLInputElement = ceEl2.querySelector('input#target2');

      const controllerSpy = app.controllerSpy;
      const spy1 = createSpy(ceVm1, 'handleValidationEvent', true);
      const spy2 = createSpy(ceVm2, 'handleValidationEvent', true);
      await assertEventHandler(input1, scheduler, controllerSpy, spy1, ctx);
      await assertEventHandler(input2, scheduler, controllerSpy, spy2, ctx);

      const errors1 = toArray(ceEl1.shadowRoot.querySelectorAll("span")).map((el) => getVisibleText(void 0, el, true));
      const errors2 = toArray(ceEl2.shadowRoot.querySelectorAll("span")).map((el) => getVisibleText(void 0, el, true));

      assert.deepStrictEqual(errors1, ["Name is required."]);
      assert.deepStrictEqual(errors2, ["Age is required."]);
    },
    {
      template: `
      <validation-container>
        <input id="target1" type="text" value.two-way="person.name & validate">
      </validation-container>
      <validation-container>
        <input id="target2" type="text" value.two-way="person.age & validate">
      </validation-container>
    ` }
  );

  $it('sorts the errors according to the target position',
    async function ({ host, scheduler, app, ctx }) {
      const ceEl = host.querySelector('validation-container');
      const ceVm: ValidationContainerCustomElement = CustomElement.for(ceEl).viewModel as ValidationContainerCustomElement;
      const spy = createSpy(ceVm, 'handleValidationEvent', true);

      const controller = app.controller;
      assertSubscriber(controller, ceVm);

      const target1 = ceEl.querySelector('#target1') as HTMLInputElement;
      const target2 = ceEl.querySelector('#target2') as HTMLInputElement;

      const controllerSpy = app.controllerSpy;
      await assertEventHandler(target1, scheduler, controllerSpy, spy, ctx);
      await assertEventHandler(target2, scheduler, controllerSpy, spy, ctx);

      const errors = toArray(ceEl.shadowRoot.querySelectorAll("span")).map((el) => getVisibleText(void 0, el, true));
      assert.deepStrictEqual(errors, ['Age is required.', 'Name is required.']);
    },
    {
      template: `
    <validation-container>
      <input id="target2" type="text" value.two-way="person.age & validate">
      <input id="target1" type="text" value.two-way="person.name & validate">
    </validation-container>
    ` }
  );

  $it('lets injection of error template via Light DOM',
    async function ({ host, scheduler, app, ctx }) {
      const ceEl1 = host.querySelector('validation-container');
      const ceVm1: ValidationContainerCustomElement = CustomElement.for(ceEl1).viewModel as ValidationContainerCustomElement;

      const controller = app.controller;

      assertSubscriber(controller, ceVm1);

      const input1: HTMLInputElement = ceEl1.querySelector('input#target1');

      const controllerSpy = app.controllerSpy;
      const spy1 = createSpy(ceVm1, 'handleValidationEvent', true);
      await assertEventHandler(input1, scheduler, controllerSpy, spy1, ctx);

      assert.deepStrictEqual(toArray(ceEl1.shadowRoot.querySelectorAll("span")).map((el) => getVisibleText(void 0, el, true)),  ["Name is required."]);
      assert.deepStrictEqual(toArray(ceEl1.querySelectorAll("small")).map((el) => getVisibleText(void 0, el, true)),  ["Name is required."]);
    },
    {
      template: `
      <validation-container errors.from-view="errors">
        <input id="target1" type="text" value.two-way="person.name & validate">
        <div slot="secondary">
          <small repeat.for="error of errors">
            \${error.result.message}
          </small>
        </div>
      </validation-container>
    ` }
  );
});
