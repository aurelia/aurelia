import { Registration, toArray, newInstanceForScope, DI } from '@aurelia/kernel';
import { IPlatform, CustomElement, customElement, Aurelia } from '@aurelia/runtime-html';
import { PLATFORM, assert, ISpy, TestContext, createSpy, getVisibleText } from '@aurelia/testing';
import {
  IValidationRules,
  ValidationResult,
} from '@aurelia/validation';
import {
  IValidationController,
  ValidationController,
  ValidationHtmlConfiguration,
  ValidationResultsSubscriber,
  ValidationResultPresenterService,
} from '@aurelia/validation-html';
import { Person } from '../../validation/_test-resources.js';
import { TestFunction, TestExecutionContext, ToNumberValueConverter, createSpecFunction } from '../../util.js';

describe('validation-html/subscribers/validation-result-presenter-service.spec.ts/validation-result-presenter-service', function () {

  const IValidationResultPresenterService = DI.createInterface<ValidationResultPresenterService>('ValidationResultPresenterService');

  class App {
    public person: Person = new Person((void 0)!, (void 0)!);
    public controllerValidateSpy: ISpy;

    public constructor(
      @IPlatform public readonly platform: IPlatform,
      @newInstanceForScope(IValidationController) public controller: ValidationController,
      @IValidationResultPresenterService public presenterService: ValidationResultPresenterService,
      @IValidationRules private readonly validationRules: IValidationRules,
    ) {
      this.controllerValidateSpy = createSpy(controller, 'validate', true);
      controller.addSubscriber(presenterService);
      validationRules
        .on(this.person)

        .ensure('name')
        .displayName('Name')
        .required()

        .ensure('age')
        .displayName('Age')
        .required()
        .satisfies((age: any) => age % 3 === 0 && age % 5 === 0)
        .withMessage('${$displayName} is not fizbaz');
    }

    public unbinding() {
      this.validationRules.off();
      // mandatory cleanup in root
      this.controller.removeSubscriber(this.presenterService);
      this.controller.reset();
    }

    public dispose() {
      const controller = this.controller;
      assert.equal(controller.results.length, 0, 'the result should have been removed');
      assert.equal(controller.bindings.size, 0, 'the bindings should have been removed');
      assert.equal(controller.objects.size, 0, 'the objects should have been removed');
      assert.equal(controller.subscribers.size, 0, 'the subscribers should have been removed');
    }
  }
  interface TestSetupContext {
    template: string;
    presenterService?: ValidationResultPresenterService;
  }
  async function runTest(
    testFunction: TestFunction<TestExecutionContext<App>>,
    { template, presenterService = new ValidationResultPresenterService(PLATFORM) }: TestSetupContext
  ) {
    const ctx = TestContext.create();
    const container = ctx.container;
    const host = ctx.createElement('app');
    ctx.doc.body.appendChild(host);
    const au = new Aurelia(container);
    await au
      .register(
        ValidationHtmlConfiguration,
        ToNumberValueConverter,
        CustomValidationContainer,
        Registration.instance(IValidationResultPresenterService, presenterService),
      )
      .app({
        host,
        component: CustomElement.define({ name: 'app', isStrictBinding: true, template }, App)
      })
      .start();

    const app = au.root.controller.viewModel as App;
    await testFunction({ app, host, container, platform: app.platform, ctx });

    await au.stop();
    ctx.doc.body.removeChild(host);
    au.dispose();
  }

  const $it = createSpecFunction(runTest);
  function getResult(args: unknown) { return (args as ValidationResult[]).flatMap((arg) => [arg.valid, arg.message]); }

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
    await platform.domReadQueue.yield();
    assert.equal(controllerValidateSpy.calls.length, 1, 'incorrect #calls for validate');
    assert.equal(handleValidationEventSpy.calls.length, 1, 'incorrect #calls for handleValidationEvent');
  }
  function assertSubscriber(controller: ValidationController, subscriber: ValidationResultPresenterService) {
    const subscribers = (controller['subscribers'] as Set<ValidationResultsSubscriber>);
    assert.equal((subscribers).has(subscriber), true);
  }

  class CustomPresenterService extends ValidationResultPresenterService {

    private static readonly markerProperty: string = 'validation-result-id';

    public getValidationMessageContainer(target: Element) {
      return target.parentElement.shadowRoot.querySelector('small.validation-placeholder');
    }
    public showResults(messageContainer: HTMLElement, results: ValidationResult[]) {
      messageContainer.append(
        ...results.reduce((acc: Node[], result) => {
          if (!result.valid) {
            const text = PLATFORM.document.createTextNode(result.message) as Node;
            Reflect.set(text, CustomPresenterService.markerProperty, result.id);
            acc.push(text);
          }
          return acc;
        }, [])
      );
    }

    public removeResults(messageContainer: Element, results: ValidationResult[]) {
      const children = toArray(messageContainer.childNodes);
      for (const result of results) {
        if (!result.valid) {
          children.find((child) => Reflect.get(child, CustomPresenterService.markerProperty) === result.id)?.remove();
        }
      }
    }
  }

  @customElement({
    name: 'custom-validation-container',
    template: `<au-slot></au-slot><small class='validation-placeholder'></small>`,
    shadowOptions: { mode: 'open' }
  })
  class CustomValidationContainer { }

  $it('shows the errors for the associated validation targets',
    async function ({ host, platform, app, ctx }) {
      const div1 = host.querySelector('div');
      const div2 = host.querySelector('div:nth-of-type(2)');

      const nameError = 'Name is required.';
      const ageRequiredError = 'Age is required.';
      const ageFizbazError = 'Age is not fizbaz';

      const controller = app.controller;
      const presenterService = app.presenterService;

      assertSubscriber(controller, presenterService);
      assertSubscriber(controller, presenterService);

      const input1: HTMLInputElement = div1.querySelector('input#target1');
      const input2: HTMLInputElement = div2.querySelector('input#target2');

      const controllerSpy = app.controllerValidateSpy;
      const spy = createSpy(presenterService, 'handleValidationEvent', true);
      const addSpy = createSpy(presenterService, 'add', true);
      const removeSpy = createSpy(presenterService, 'remove', true);
      const showResultsSpy = createSpy(presenterService, 'showResults', true);
      const removeResultsSpy = createSpy(presenterService, 'removeResults', true);
      await assertEventHandler(input1, platform, controllerSpy, spy, ctx);
      await assertEventHandler(input2, platform, controllerSpy, spy, ctx);

      let addArgs = addSpy.calls;
      let removeArgs = removeSpy.calls;
      let showResultsArgs = showResultsSpy.calls;
      let removeResultsArgs = removeResultsSpy.calls;
      assert.equal(removeArgs.length, 0);
      assert.equal(addArgs.length, 2);
      assert.equal(removeResultsArgs.length, 0);
      assert.equal(showResultsArgs.length, 2);
      assert.deepStrictEqual([addArgs[0][0], ...getResult(addArgs[0][1])], [input1, false, nameError]);
      assert.deepStrictEqual([addArgs[1][0], ...getResult(addArgs[1][1])], [input2, false, ageRequiredError, false, ageFizbazError]);
      assert.deepStrictEqual([(showResultsArgs[0][0] as HTMLElement).tagName, ...getResult(showResultsArgs[0][1])], ['DIV', false, nameError]);
      assert.deepStrictEqual([(showResultsArgs[1][0] as HTMLElement).tagName, ...getResult(showResultsArgs[1][1])], ['DIV', false, ageRequiredError, false, ageFizbazError]);

      assert.deepStrictEqual(toArray(div1.querySelectorAll('span')).map((el) => getVisibleText(el, true)), [nameError]);
      assert.deepStrictEqual(toArray(div2.querySelectorAll('span')).map((el) => getVisibleText(el, true)), [ageRequiredError, ageFizbazError]);

      addSpy.reset();
      removeSpy.reset();
      showResultsSpy.reset();
      removeResultsSpy.reset();

      input2.value = '22';
      input2.dispatchEvent(new ctx.Event('change'));
      await platform.domReadQueue.yield();
      await assertEventHandler(input2, platform, controllerSpy, spy, ctx);

      addArgs = addSpy.calls;
      removeArgs = removeSpy.calls;
      showResultsArgs = showResultsSpy.calls;
      removeResultsArgs = removeResultsSpy.calls;
      assert.equal(removeArgs.length, 1);
      assert.equal(addArgs.length, 1);
      assert.equal(removeResultsArgs.length, 1);
      assert.equal(showResultsArgs.length, 1);
      assert.deepStrictEqual([removeArgs[0][0], ...getResult(removeArgs[0][1])], [input2, false, ageRequiredError, false, ageFizbazError]);
      assert.deepStrictEqual([addArgs[0][0], ...getResult(addArgs[0][1])], [input2, true, undefined, false, ageFizbazError]);
      assert.deepStrictEqual([(removeResultsArgs[0][0] as HTMLElement).tagName, ...getResult(removeResultsArgs[0][1])], ['DIV', false, ageRequiredError, false, ageFizbazError]);
      assert.deepStrictEqual([(showResultsArgs[0][0] as HTMLElement).tagName, ...getResult(showResultsArgs[0][1])], ['DIV', true, undefined, false, ageFizbazError]);

      assert.deepStrictEqual(toArray(div1.querySelectorAll('span')).map((el) => getVisibleText(el, true)), [nameError]);
      assert.deepStrictEqual(toArray(div2.querySelectorAll('span')).map((el) => getVisibleText(el, true)), [ageFizbazError]);

      addSpy.reset();
      removeSpy.reset();
      showResultsSpy.reset();
      removeResultsSpy.reset();

      input2.value = '15';
      input2.dispatchEvent(new ctx.Event('change'));
      await platform.domReadQueue.yield();
      await assertEventHandler(input2, platform, controllerSpy, spy, ctx);

      addArgs = addSpy.calls;
      removeArgs = removeSpy.calls;
      showResultsArgs = showResultsSpy.calls;
      removeResultsArgs = removeResultsSpy.calls;
      assert.equal(removeArgs.length, 1);
      assert.equal(addArgs.length, 1);
      assert.equal(removeResultsArgs.length, 1);
      assert.equal(showResultsArgs.length, 1);
      assert.deepStrictEqual([removeArgs[0][0], ...getResult(removeArgs[0][1])], [input2, true, undefined, false, ageFizbazError]);
      assert.deepStrictEqual([addArgs[0][0], ...getResult(addArgs[0][1])], [input2, true, undefined, true, undefined]);
      assert.deepStrictEqual([(removeResultsArgs[0][0] as HTMLElement).tagName, ...getResult(removeResultsArgs[0][1])], ['DIV', true, undefined, false, ageFizbazError]);
      assert.deepStrictEqual([(showResultsArgs[0][0] as HTMLElement).tagName, ...getResult(showResultsArgs[0][1])], ['DIV', true, undefined, true, undefined]);

      assert.deepStrictEqual(toArray(div1.querySelectorAll('span')).map((el) => getVisibleText(el, true)), [nameError]);
      assert.deepStrictEqual(toArray(div2.querySelectorAll('span')).map((el) => getVisibleText(el, true)), []);
    },
    {
      template: `
      <div>
        <input id="target1" type="text" value.two-way="person.name & validate">
      </div>
      <div>
        <input id="target2" type="text" value.two-way="person.age|toNumber & validate">
      </div>
    ` }
  );

  $it('custom presenter implementation can be used to tweak presentation',
    async function ({ host, platform, app, ctx }) {
      const validationContainer1 = host.querySelector('custom-validation-container');
      const validationContainer2 = host.querySelector('custom-validation-container:nth-of-type(2)');

      const nameError = 'Name is required.';
      const ageRequiredError = 'Age is required.';
      const ageFizbazError = 'Age is not fizbaz';

      const controller = app.controller;
      const presenterService = app.presenterService;

      assert.instanceOf(presenterService, CustomPresenterService);
      assertSubscriber(controller, presenterService);
      assertSubscriber(controller, presenterService);

      const input1: HTMLInputElement = validationContainer1.querySelector('input#target1');
      const input2: HTMLInputElement = validationContainer2.querySelector('input#target2');

      const controllerSpy = app.controllerValidateSpy;
      const spy = createSpy(presenterService, 'handleValidationEvent', true);
      const addSpy = createSpy(presenterService, 'add', true);
      const removeSpy = createSpy(presenterService, 'remove', true);
      const showResultsSpy = createSpy(presenterService, 'showResults', true);
      const removeResultsSpy = createSpy(presenterService, 'removeResults', true);
      await assertEventHandler(input1, platform, controllerSpy, spy, ctx);
      await assertEventHandler(input2, platform, controllerSpy, spy, ctx);

      let addArgs = addSpy.calls;
      let removeArgs = removeSpy.calls;
      let showResultsArgs = showResultsSpy.calls;
      let removeResultsArgs = removeResultsSpy.calls;
      assert.equal(removeArgs.length, 0);
      assert.equal(addArgs.length, 2);
      assert.equal(removeResultsArgs.length, 0);
      assert.equal(showResultsArgs.length, 2);
      assert.deepStrictEqual([addArgs[0][0], ...getResult(addArgs[0][1])], [input1, false, nameError]);
      assert.deepStrictEqual([addArgs[1][0], ...getResult(addArgs[1][1])], [input2, false, ageRequiredError, false, ageFizbazError]);
      assert.deepStrictEqual([(showResultsArgs[0][0] as HTMLElement).tagName, ...getResult(showResultsArgs[0][1])], ['SMALL', false, nameError]);
      assert.deepStrictEqual([(showResultsArgs[1][0] as HTMLElement).tagName, ...getResult(showResultsArgs[1][1])], ['SMALL', false, ageRequiredError, false, ageFizbazError]);

      assert.equal(getVisibleText(validationContainer1.shadowRoot.querySelector('small'), true), nameError);
      assert.equal(getVisibleText(validationContainer2.shadowRoot.querySelector('small'), true), `${ageRequiredError}${ageFizbazError}`);

      addSpy.reset();
      removeSpy.reset();
      showResultsSpy.reset();
      removeResultsSpy.reset();

      input2.value = '22';
      input2.dispatchEvent(new ctx.Event('change'));
      await platform.domReadQueue.yield();
      await assertEventHandler(input2, platform, controllerSpy, spy, ctx);

      addArgs = addSpy.calls;
      removeArgs = removeSpy.calls;
      showResultsArgs = showResultsSpy.calls;
      removeResultsArgs = removeResultsSpy.calls;
      assert.equal(removeArgs.length, 1);
      assert.equal(addArgs.length, 1);
      assert.equal(removeResultsArgs.length, 1);
      assert.equal(showResultsArgs.length, 1);
      assert.deepStrictEqual([removeArgs[0][0], ...getResult(removeArgs[0][1])], [input2, false, ageRequiredError, false, ageFizbazError]);
      assert.deepStrictEqual([addArgs[0][0], ...getResult(addArgs[0][1])], [input2, true, undefined, false, ageFizbazError]);
      assert.deepStrictEqual([(removeResultsArgs[0][0] as HTMLElement).tagName, ...getResult(removeResultsArgs[0][1])], ['SMALL', false, ageRequiredError, false, ageFizbazError]);
      assert.deepStrictEqual([(showResultsArgs[0][0] as HTMLElement).tagName, ...getResult(showResultsArgs[0][1])], ['SMALL', true, undefined, false, ageFizbazError]);

      assert.equal(getVisibleText(validationContainer1.shadowRoot.querySelector('small'), true), nameError);
      assert.equal(getVisibleText(validationContainer2.shadowRoot.querySelector('small'), true), ageFizbazError);

      addSpy.reset();
      removeSpy.reset();
      showResultsSpy.reset();
      removeResultsSpy.reset();

      input2.value = '15';
      input2.dispatchEvent(new ctx.Event('change'));
      await platform.domReadQueue.yield();
      await assertEventHandler(input2, platform, controllerSpy, spy, ctx);

      addArgs = addSpy.calls;
      removeArgs = removeSpy.calls;
      showResultsArgs = showResultsSpy.calls;
      removeResultsArgs = removeResultsSpy.calls;
      assert.equal(removeArgs.length, 1);
      assert.equal(addArgs.length, 1);
      assert.equal(removeResultsArgs.length, 1);
      assert.equal(showResultsArgs.length, 1);
      assert.deepStrictEqual([removeArgs[0][0], ...getResult(removeArgs[0][1])], [input2, true, undefined, false, ageFizbazError]);
      assert.deepStrictEqual([addArgs[0][0], ...getResult(addArgs[0][1])], [input2, true, undefined, true, undefined]);
      assert.deepStrictEqual([(removeResultsArgs[0][0] as HTMLElement).tagName, ...getResult(removeResultsArgs[0][1])], ['SMALL', true, undefined, false, ageFizbazError]);
      assert.deepStrictEqual([(showResultsArgs[0][0] as HTMLElement).tagName, ...getResult(showResultsArgs[0][1])], ['SMALL', true, undefined, true, undefined]);

      assert.equal(getVisibleText(validationContainer1.shadowRoot.querySelector('small'), true), nameError);
      assert.equal(getVisibleText(validationContainer2.shadowRoot.querySelector('small'), true), '');
    },
    {
      presenterService: new CustomPresenterService(PLATFORM),
      template: `
      <custom-validation-container>
        <input id="target1" type="text" value.two-way="person.name & validate">
      </custom-validation-container>
      <custom-validation-container>
        <input id="target2" type="text" value.two-way="person.age|toNumber & validate">
      </custom-validation-container>
    ` }
  );

  $it('does not add/remove results if the container returned is null',
    async function ({ host, platform, app, ctx }) {
      const validationContainer1 = host.querySelector('div');
      const validationContainer2 = host.querySelector('div:nth-of-type(2)');

      const controller = app.controller;
      const presenterService = app.presenterService;

      assertSubscriber(controller, presenterService);
      assertSubscriber(controller, presenterService);

      const input1: HTMLInputElement = validationContainer1.querySelector('input#target1');
      const input2: HTMLInputElement = validationContainer2.querySelector('input#target2');

      const controllerSpy = app.controllerValidateSpy;
      const spy = createSpy(presenterService, 'handleValidationEvent', true);
      const addSpy = createSpy(presenterService, 'add', true);
      const removeSpy = createSpy(presenterService, 'remove', true);
      const showResultsSpy = createSpy(presenterService, 'showResults', true);
      const removeResultsSpy = createSpy(presenterService, 'removeResults', true);
      await assertEventHandler(input1, platform, controllerSpy, spy, ctx);
      await assertEventHandler(input2, platform, controllerSpy, spy, ctx);

      let addArgs = addSpy.calls;
      let removeArgs = removeSpy.calls;
      let showResultsArgs = showResultsSpy.calls;
      let removeResultsArgs = removeResultsSpy.calls;
      assert.equal(removeArgs.length, 0);
      assert.equal(addArgs.length, 2);
      assert.equal(removeResultsArgs.length, 0);
      assert.equal(showResultsArgs.length, 0);

      addSpy.reset();
      removeSpy.reset();
      showResultsSpy.reset();
      removeResultsSpy.reset();

      input2.value = '22';
      input2.dispatchEvent(new ctx.Event('change'));
      await platform.domReadQueue.yield();
      await assertEventHandler(input2, platform, controllerSpy, spy, ctx);

      addArgs = addSpy.calls;
      removeArgs = removeSpy.calls;
      showResultsArgs = showResultsSpy.calls;
      removeResultsArgs = removeResultsSpy.calls;
      assert.equal(removeArgs.length, 1);
      assert.equal(addArgs.length, 1);
      assert.equal(removeResultsArgs.length, 0);
      assert.equal(showResultsArgs.length, 0);
    },
    {
      presenterService: new (
        class extends ValidationResultPresenterService {
          public getValidationMessageContainer() { return null; }
        }
      )(PLATFORM),
      template: `
      <div>
        <input id="target1" type="text" value.two-way="person.name & validate">
      </div>
      <div>
        <input id="target2" type="text" value.two-way="person.age|toNumber & validate">
      </div>
    ` }
  );
});
