import { delegateSyntax } from '@aurelia/compat-v1';
import {
  newInstanceForScope,
  Registration
} from '@aurelia/kernel';
import {
  IRouter,
  route,
  RouterConfiguration
} from '@aurelia/router-lite';
import {
  Aurelia,
  CustomAttribute,
  CustomElement,
  customElement,
  IHistory,
  ILocation,
  IPlatform,
  StandardConfiguration
} from '@aurelia/runtime-html';
import {
  assert,
  MockBrowserHistoryLocation,
  TestContext
} from '@aurelia/testing';
import {
  IValidationRules
} from '@aurelia/validation';
import {
  IValidationController,
  ValidationErrorsCustomAttribute,
  ValidationHtmlConfiguration
} from '@aurelia/validation-html';
import {
  createSpecFunction,
  TestExecutionContext,
  TestFunction
} from '../util.js';
import {
  Person
} from '../validation/_test-resources.js';

describe('validation-html/validation-router.integration.spec.ts/integration', function () {

  @customElement({
    name: 'view-with-val',
    isStrictBinding: true,
    template: `<form submit.trigger="submit($event)">
      <div id="container" validation-errors.from-view="errors">
        <input id="name" type="text" value.bind="person.name & validate">
        <div id="errors">
          <span repeat.for="error of errors">\${error.result.message}</span>
        </div>
      </div>
      <button id="submit" click.trigger="submit($event)"></button>
    </form>`,
  })
  class ViewWithValidation {
    public person: Person;
    public constructor(
      @newInstanceForScope(IValidationController) public readonly validationController: IValidationController,
      @IRouter public readonly router: IRouter,
      @IValidationRules rules: IValidationRules,
    ) {
      rules.on(this.person = new Person(void 0, void 0))
        .ensure('name')
        .required();
    }
    public async submit(event: Event) {
      event.preventDefault();
      event.stopPropagation();

      if (!(await this.validationController.validate()).valid) { return; }
      await this.router.load('redirecting-view');
    }
  }

  @customElement({
    name: 'redirecting-view',
    isStrictBinding: true,
    template: `<button id="navigate" click.delegate="navigate()"></button>`
  })
  class RedirectingView {
    public constructor(
      @IRouter public readonly router: IRouter,
    ) { }

    public async navigate() {
      await this.router.load('view-with-val');
    }
  }

  @customElement({
    name: 'app',
    isStrictBinding: true,
    template: '<au-viewport></au-viewport>'
  })
  @route({
    routes: [
      { path: ['', 'view-with-val'], component: ViewWithValidation },
      { path: 'redirecting-view', component: RedirectingView },
    ]
  })
  class App { }

  async function runTest(
    testFunction: TestFunction<TestExecutionContext<App>>,
  ) {
    const ctx = TestContext.create();
    const container = ctx.container;
    const host = ctx.doc.createElement('div');
    ctx.doc.body.appendChild(host);
    const au = new Aurelia(container);
    const mockBrowserHistoryLocation = new MockBrowserHistoryLocation();

    await au
      .register(
        StandardConfiguration,
        Registration.instance(IHistory, mockBrowserHistoryLocation),
        Registration.instance(ILocation, mockBrowserHistoryLocation),
        RouterConfiguration,
        ValidationHtmlConfiguration,
        delegateSyntax,
        ViewWithValidation,
        RedirectingView,
      )
      .app({ host, component: App })
      .start();

    await testFunction({ app: void 0, container, host, platform: container.get(IPlatform), ctx });

    await au.stop();
    ctx.doc.body.removeChild(host);

    au.dispose();
  }
  const $it = createSpecFunction(runTest);

  $it('navigating back to the view with validation works', async function ({ host, platform, ctx }) {
    function assertController() {
      const node = host.querySelector('view-with-val');
      const vm = CustomElement.for<ViewWithValidation>(node).viewModel;
      const attr = CustomAttribute.for<ValidationErrorsCustomAttribute>(node.querySelector('#container'), 'validation-errors').viewModel;
      assert.strictEqual(vm.validationController, attr.controller, 'controller');
    }
    assertController();

    const input = host.querySelector<HTMLInputElement>('#name');
    assert.notEqual(input, null, 'input');

    assert.strictEqual(host.querySelector('#navigate'), null, 'navigate');

    let submit = host.querySelector<HTMLButtonElement>('#submit');
    assert.notEqual(submit, null, 'submit');
    submit.click();

    await platform.domReadQueue.yield();

    // step#1: validation error
    assert.html.textContent('#errors', 'Name is required.', 'error', host);

    // step#2: valid value and navigate
    input.value = 'foo';
    input.dispatchEvent(new ctx.Event('change'));
    await platform.domReadQueue.yield();

    submit.click();
    await platform.domReadQueue.yield();
    await platform.domWriteQueue.yield();

    // step#3: go back
    const navigate = host.querySelector<HTMLButtonElement>('#navigate');
    assert.notEqual(navigate, null, 'navigate');
    assert.strictEqual(host.querySelector('#name'), null, 'input');
    assert.strictEqual(host.querySelector('#submit'), null, 'submit');
    navigate.click();

    // step#4: validate
    assertController();
    submit = host.querySelector<HTMLButtonElement>('#submit');
    assert.notEqual(submit, null, 'submit');
    submit.click();

    await platform.domReadQueue.yield();

    assert.html.textContent('#errors', 'Name is required.', 'error', host);
  });
});
