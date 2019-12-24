import { IContainer, Class } from '@aurelia/kernel';
import { INode, Aurelia, DOM, customElement, CustomElement, IBinding } from '@aurelia/runtime';
import { TestContext, assert } from '@aurelia/testing';
import { IValidationRules, ValidationConfiguration, IValidationControllerFactory, ValidationController, BindingWithBehavior } from '@aurelia/validation';
import { Person } from './_test-resources';
import { Unparser } from '@aurelia/debug';

describe.only('validate-biniding-behavior', function () {
  interface TestContext<TApp extends any> {
    container: IContainer;
    host: INode;
    app: TApp;
  }
  interface TestSetupContext<TApp> {
    appFn: Class<TApp> & { instantiate(container: IContainer): TApp };
  }
  type TestFunction = (ctx: TestContext<any>) => void | Promise<void>;
  async function runTest(
    testFunction: TestFunction,
    { appFn }: TestSetupContext<any>
  ) {
    const host = DOM.createElement('app');
    const container = TestContext.createHTMLTestContext().container;
    let app;
    await new Aurelia(container)
      .register(ValidationConfiguration)
      .app({ host, component: app = appFn.instantiate(container) })
      .start()
      .wait();

    await testFunction({ app, container, host });
  }

  function $it(title: string, testFunction: TestFunction, ctx: TestSetupContext<any>) {
    it(title, async function () {
      await runTest(testFunction, ctx);
    });
  }

  @customElement({ name: 'app', template: `<input id="target" type="text" value.bind="person.name & validate">`, isStrictBinding: true })
  class App {
    public static instantiate(container: IContainer) {
      return new App(
        container.get(IValidationRules),
        container.get(IValidationControllerFactory),
      );
    }
    public person: Person = new Person((void 0)!, (void 0)!);
    public controller: ValidationController;

    public constructor(
      @IValidationRules validationRules: IValidationRules,
      @IValidationControllerFactory factory: IValidationControllerFactory,
    ) {
      this.controller = factory.createForCurrentScope() as unknown as ValidationController;
      validationRules
        .on(this.person)
        .ensure('name')
        .required();
    }
  }

  $it('registers binding to the controller',
    function ({ app, container, host }: TestContext<App>) {
      const controller = app.controller;
      const bindings = Array.from((controller['bindings'] as Map<IBinding, any>).keys()) as BindingWithBehavior[];
      assert.equal(bindings.length, 1);
      const target = (host as Element).querySelector("#target");
      const binding = bindings[0];
      assert.equal(binding.target, target);
      assert.equal(Unparser.unparse(binding.sourceExpression.expression), 'person.name');
    },
    { appFn: App });
});
