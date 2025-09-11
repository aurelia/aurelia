import { newInstanceForScope, newInstanceOf, resolve, toArray } from '@aurelia/kernel';
import { assert, createFixture, createSpy, getVisibleText, ISpy, TestContext } from '@aurelia/testing';
import { IValidationRules } from '@aurelia/validation';
import { CustomElement, customElement, IPlatform, Aurelia } from '@aurelia/runtime-html';
import {
  IValidationController,
  ValidationContainerCustomElement,
  ValidationController,
  ValidationHtmlConfiguration,
  ValidationResultsSubscriber,
} from '@aurelia/validation-html';
import { createSpecFunction, TestExecutionContext, TestFunction, ToNumberValueConverter } from '../../util.js';
import { Flight, Person } from '../../validation/_test-resources.js';
import { tasksSettled } from '@aurelia/runtime';

describe('validation-html/subscribers/validation-container-custom-element.spec.ts', function () {
  describe('validation-container-custom-element', function () {

    class App {
      public person: Person = new Person((void 0)!, (void 0)!);
      public controllerValidateSpy: ISpy;
      public controllerRemoveSubscriberSpy: ISpy;

      public readonly platform: IPlatform = resolve(IPlatform);
      public controller: ValidationController = resolve(newInstanceForScope(IValidationController)) as ValidationController;
      private readonly validationRules: IValidationRules = resolve(IValidationRules);
      public constructor() {
        this.controllerValidateSpy = createSpy(this.controller, 'validate', true);
        this.controllerRemoveSubscriberSpy = createSpy(this.controller, 'removeSubscriber', true);
        this.validationRules
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
    interface TestSetupContext {
      template: string;
      containerTemplate?: string;
    }
    async function runTest(
      testFunction: TestFunction<TestExecutionContext<App>>,
      { template, containerTemplate }: TestSetupContext
    ) {
      const ctx = TestContext.create();
      const container = ctx.container;
      const host = ctx.doc.createElement('app');
      ctx.doc.body.appendChild(host);
      const au = new Aurelia(container);
      await au
        .register(
          ValidationHtmlConfiguration.customize((options) => {
            if (containerTemplate) {
              options.SubscriberCustomElementTemplate = containerTemplate;
            }
          }),
          ToNumberValueConverter
        )
        .app({
          host,
          component: CustomElement.define({ name: 'app', template }, App)
        })
        .start();

      const app: App = au.root.controller.viewModel as App;
      await testFunction({ app, host, container, platform: app.platform, ctx });

      await au.stop();
      ctx.doc.body.removeChild(host);
      assert.equal(app.controllerRemoveSubscriberSpy.calls.length, template.match(/validation-container/g).length / 2 + template.match(/validate/g).length);

      au.dispose();
    }

    const $it = createSpecFunction(runTest);

    async function assertEventHandler(
      target: HTMLElement,
      platform: IPlatform,
      controllerValidateSpy: ISpy,
      handleValidationEventSpy: ISpy,
      ctx: TestContext,
      event: string = 'focusout',
    ) {
      handleValidationEventSpy.calls.splice(0);
      controllerValidateSpy.calls.splice(0);
      target.dispatchEvent(new ctx.Event(event));
      await tasksSettled();
      assert.equal(controllerValidateSpy.calls.length, 1, 'incorrect #calls for validate');
      assert.equal(handleValidationEventSpy.calls.length, 1, 'incorrect #calls for handleValidationEvent');
    }
    function assertSubscriber(controller: ValidationController, ce: ValidationContainerCustomElement) {
      const subscribers = (controller['subscribers'] as Set<ValidationResultsSubscriber>);
      assert.equal((subscribers).has(ce), true);
      assert.equal(ce['controller'], controller);
    }

    $it('shows the errors for the containing validation targets',
      async function ({ host, platform, app, ctx }) {
        const ceEl1 = host.querySelector('validation-container');
        const ceEl2 = host.querySelector('validation-container:nth-of-type(2)');
        const ceVm1: ValidationContainerCustomElement = CustomElement.for(ceEl1).viewModel as ValidationContainerCustomElement;
        const ceVm2: ValidationContainerCustomElement = CustomElement.for(ceEl2).viewModel as ValidationContainerCustomElement;

        const controller = app.controller;

        assertSubscriber(controller, ceVm1);
        assertSubscriber(controller, ceVm2);

        const input1: HTMLInputElement = ceEl1.querySelector('input#target1');
        const input2: HTMLInputElement = ceEl2.querySelector('input#target2');

        const controllerSpy = app.controllerValidateSpy;
        const spy1 = createSpy(ceVm1, 'handleValidationEvent', true);
        const spy2 = createSpy(ceVm2, 'handleValidationEvent', true);
        await assertEventHandler(input1, platform, controllerSpy, spy1, ctx);
        await assertEventHandler(input2, platform, controllerSpy, spy2, ctx);

        const errors1 = toArray(ceEl1.shadowRoot.querySelectorAll('span')).map((el) => getVisibleText(el, true));
        const errors2 = toArray(ceEl2.shadowRoot.querySelectorAll('span')).map((el) => getVisibleText(el, true));

        assert.deepStrictEqual(errors1, ['Name is required.']);
        assert.deepStrictEqual(errors2, ['Age is required.']);
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
      async function ({ host, platform, app, ctx }) {
        const ceEl = host.querySelector('validation-container');
        const ceVm: ValidationContainerCustomElement = CustomElement.for(ceEl).viewModel as ValidationContainerCustomElement;
        const spy = createSpy(ceVm, 'handleValidationEvent', true);

        const controller = app.controller;
        assertSubscriber(controller, ceVm);

        const target1 = ceEl.querySelector('#target1') as HTMLInputElement;
        const target2 = ceEl.querySelector('#target2') as HTMLInputElement;

        const controllerSpy = app.controllerValidateSpy;
        await assertEventHandler(target1, platform, controllerSpy, spy, ctx);
        await assertEventHandler(target2, platform, controllerSpy, spy, ctx);

        const errors = toArray(ceEl.shadowRoot.querySelectorAll('span')).map((el) => getVisibleText(el, true));
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
      async function ({ host, platform, app, ctx }) {
        const ceEl1 = host.querySelector('validation-container');
        const ceVm1: ValidationContainerCustomElement = CustomElement.for(ceEl1).viewModel as ValidationContainerCustomElement;

        const controller = app.controller;

        assertSubscriber(controller, ceVm1);

        const input1: HTMLInputElement = ceEl1.querySelector('input#target1');

        const controllerSpy = app.controllerValidateSpy;
        const spy1 = createSpy(ceVm1, 'handleValidationEvent', true);
        await assertEventHandler(input1, platform, controllerSpy, spy1, ctx);

        assert.deepStrictEqual(toArray(ceEl1.shadowRoot.querySelectorAll('span')).map((el) => getVisibleText(el, true)), ['Name is required.']);
        assert.deepStrictEqual(toArray(ceEl1.querySelectorAll('small')).map((el) => getVisibleText(el, true)), ['Name is required.']);
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

    $it('the template is customizable',
      async function ({ host, platform, app, ctx }) {
        const ceEl1 = host.querySelector('validation-container');
        const ceVm1: ValidationContainerCustomElement = CustomElement.for(ceEl1).viewModel as ValidationContainerCustomElement;

        const controller = app.controller;

        assertSubscriber(controller, ceVm1);

        const input1: HTMLInputElement = ceEl1.querySelector('input#target1');

        const controllerSpy = app.controllerValidateSpy;
        const spy1 = createSpy(ceVm1, 'handleValidationEvent', true);
        await assertEventHandler(input1, platform, controllerSpy, spy1, ctx);

        if (typeof getComputedStyle === 'function') { // seems not to work with jsdom
          assert.equal(getComputedStyle(ceEl1).display, 'flex');
          const spans = toArray(ceEl1.shadowRoot.querySelectorAll('span.error'));
          assert.equal(spans.every((span) => getComputedStyle(span).color === 'rgb(255, 0, 0)'), true, 'incorrect color');
        }
      },
      {
        template: `
        <validation-container>
          <input id="target1" type="text" value.two-way="person.name & validate">
        </validation-container>
        `,
        containerTemplate: `
        <style>
        :host {
          contain: content;
          display: flex;
          flex-direction: column;
        }
        :host .error {
          color: rgb(255, 0, 0);
        }
        </style>
        <slot></slot>
        <slot name='secondary'>
          <span class="error" repeat.for="error of errors">
            \${error.result.message}
          </span>
        </slot>
        `
      }
    );

    it('can be used without any available registration for scoped controller', async function () {
      @customElement({
        name: 'app',
        template: `
        <validation-container controller.bind="controller">
          <input id="target1" type="text" value.two-way="person.name & validate:undefined:controller">
        </validation-container>
      `})
      class App1 {
        public person: Person = new Person((void 0)!, (void 0)!);
        public controllerValidateSpy: ISpy;

        public readonly controller: ValidationController = resolve(newInstanceOf(IValidationController)) as ValidationController;
        private readonly validationRules: IValidationRules = resolve(IValidationRules);
        public constructor() {
          this.controllerValidateSpy = createSpy(this.controller, 'validate', true);

          this.validationRules
            .on(this.person)

            .ensure('name')
            .required();
        }

        public unbinding() {
          this.validationRules.off();
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
      const platform = container.get(IPlatform);

      const ceEl1 = host.querySelector('validation-container');
      const ceVm1: ValidationContainerCustomElement = CustomElement.for(ceEl1).viewModel as ValidationContainerCustomElement;

      const controller = app.controller;

      assertSubscriber(controller, ceVm1);

      const input1: HTMLInputElement = ceEl1.querySelector('input#target1');

      const controllerSpy = app.controllerValidateSpy;
      const spy1 = createSpy(ceVm1, 'handleValidationEvent', true);
      await assertEventHandler(input1, platform, controllerSpy, spy1, ctx);

      const errors1 = toArray(ceEl1.shadowRoot.querySelectorAll('span')).map((el) => getVisibleText(el, true));

      assert.deepStrictEqual(errors1, ['Name is required.']);

      await au.stop();
      ctx.doc.body.removeChild(host);

      au.dispose();
    });

    it('shows group validation errors correctly', async function () {
      const currentDate = new Date('2025-07-20T00:00:00Z');

      const msgInvalidFlightDirection = 'Invalid flight direction';
      const msgNoTimeTravelPossible = 'No time travel possible';
      const msgNotPossibleToGoBackInTime = 'Not possible to go back in time';
      const msgOneWayHasNoReturn = 'One way flight has no return';

      const { stop, component, appHost, ctx } = await createFixture(
        ` <validation-container>
          <input id="target1" type="text" value.two-way="flight.direction & validate">
        </validation-container>
        <validation-container>
          <input id="target2" type="text" value.two-way="flight.departureDate & validate">
        </validation-container>
        <validation-container>
          <input id="target3" type="text" value.two-way="flight.returnDate & validate">
        </validation-container>
        `,
        class App {
          private readonly flight = new Flight();
          private readonly validationRules: IValidationRules = resolve(IValidationRules);
          public readonly controller: IValidationController = resolve(newInstanceForScope(IValidationController));

          public constructor() {
            this.validationRules
              .on(this.flight)
              .ensure('direction')
              .required()
              .ensureGroup(
                ['direction', 'departureDate', 'returnDate'],
                (direction: 'one-way' | 'round-trip', departureDate: Date | string | undefined, returnDate: Date | string | undefined) => {
                  // if the direction is not yet specified, we don't have to validate anything
                  if (!direction) return true;
                  const $departureDate = departureDate ? new Date(departureDate) : undefined;
                  const $returnDate = returnDate ? new Date(returnDate) : undefined;
                  switch (direction) {
                    case 'round-trip':
                      return $departureDate > $returnDate
                        ? { property: 'departureDate', message: msgNotPossibleToGoBackInTime }
                        : true;
                    case 'one-way':
                      if ($departureDate < currentDate) return { property: 'departureDate', message: msgNoTimeTravelPossible };
                      if ($returnDate) return { property: 'returnDate', message: msgOneWayHasNoReturn };
                      return true;
                    default:
                      return { property: 'direction', message: msgInvalidFlightDirection };
                  }
                });
          }

          public unbinding() {
            this.validationRules.off();
          }
        },
        [ValidationHtmlConfiguration]
      ).started;

      await component.controller.validate();

      const containers = toArray(appHost.querySelectorAll('validation-container'));

      assert.deepStrictEqual(getErrors(), [['Direction is required.'], [], []], 'round#1');

      const [directionInput, departureInput, returnInput] = toArray(appHost.querySelectorAll('input'));

      // invalid direction
      directionInput.value = 'invalid';
      await triggerEvent(directionInput);
      assert.deepStrictEqual(getErrors(), [[msgInvalidFlightDirection], [], []], 'round#2');

      // one-way - departure date in past
      directionInput.value = 'one-way';
      departureInput.value = '2025-07-19T00:00:00Z';
      await triggerEvent(directionInput);
      await triggerEvent(departureInput);
      assert.deepStrictEqual(getErrors(), [[], [msgNoTimeTravelPossible], []], 'round#3');

      // one-way - return date set
      departureInput.value = '2025-07-21T00:00:00Z';
      returnInput.value = '2025-07-19T00:00:00Z';
      await triggerEvent(departureInput);
      await triggerEvent(returnInput);
      assert.deepStrictEqual(getErrors(), [[], [], [msgOneWayHasNoReturn]], 'round#4');

      // round-trip
      directionInput.value = 'round-trip';
      await triggerEvent(directionInput);
      assert.deepStrictEqual(getErrors(), [[], [msgNotPossibleToGoBackInTime], []], 'round#5');

      // round-trip - valid dates
      returnInput.value = '2025-07-23T00:00:00Z';
      await triggerEvent(returnInput);
      assert.deepStrictEqual(getErrors(), [[], [], []], 'round#6');

      await stop(true);

      function getErrors() {
        return toArray(
          containers.map(container => toArray(container.shadowRoot.querySelectorAll('span')))
        ).map((els) => toArray(els).map(el => getVisibleText(el, true)));
      }

      async function triggerEvent(target: HTMLElement) {
        target.dispatchEvent(new ctx.Event('input'));
        target.dispatchEvent(new ctx.Event('focusout'));
        await tasksSettled();
      }
    });
  });
});
