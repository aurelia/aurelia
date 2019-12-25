import { IContainer, Class } from '@aurelia/kernel';
import { INode, Aurelia, DOM, customElement, CustomElement, IBinding, PartialCustomElementDefinition } from '@aurelia/runtime';
import { TestContext, assert } from '@aurelia/testing';
import { IValidationRules, ValidationConfiguration, IValidationControllerFactory, ValidationController, BindingWithBehavior } from '@aurelia/validation';
import { Person } from './_test-resources';
import { Unparser } from '@aurelia/debug';

describe.only('validate-biniding-behavior', function () {

  class App {
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

  interface TestContext<TApp extends any> {
    container: IContainer;
    host: INode;
    app: TApp;
  }
  interface TestSetupContext<TApp> {
    template: string;
  }
  type TestFunction = (ctx: TestContext<any>) => void | Promise<void>;
  async function runTest(
    testFunction: TestFunction,
    { template }: TestSetupContext<any>
  ) {
    const host = DOM.createElement('app');
    const container = TestContext.createHTMLTestContext().container;
    let app;
    await new Aurelia(container)
      .register(ValidationConfiguration)
      .app({
        host,
        component: app = (() => {
          const ca = CustomElement.define({ name: 'app', isStrictBinding: true, template }, App);
          return new ca(container.get(IValidationRules), container.get(IValidationControllerFactory));
        })()
      })
      .start()
      .wait();

    await testFunction({ app, container, host });
  }

  function $it(title: string, testFunction: TestFunction, ctx: TestSetupContext<any>) {
    it(title, async function () {
      await runTest(testFunction, ctx);
    });
  }

  $it('registers binding to the controller',
    function ({ app, host }: TestContext<App>) {
      const controller = app.controller;
      const bindings = Array.from((controller['bindings'] as Map<IBinding, any>).keys()) as BindingWithBehavior[];
      assert.equal(bindings.length, 1);
      const target = (host as Element).querySelector("#target");
      const binding = bindings[0];
      assert.equal(binding.target, target);
      assert.equal(Unparser.unparse(binding.sourceExpression.expression), 'person.name');
    },
    { template: `<input id="target" type="text" value.bind="person.name & validate">` }
  );
});
