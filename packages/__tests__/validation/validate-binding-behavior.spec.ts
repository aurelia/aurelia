import { Unparser } from '@aurelia/debug';
import { IContainer, Registration } from '@aurelia/kernel';
import { Aurelia, CustomElement, DOM, IBinding, INode, IScheduler } from '@aurelia/runtime';
import { assert, TestContext } from '@aurelia/testing';
import { BindingWithBehavior, IValidationControllerFactory, IValidationRules, ValidationConfiguration, ValidationController, IValidationController } from '@aurelia/validation';
import { Person } from './_test-resources';
import { Spy } from '../Spy';

describe.only('validate-biniding-behavior', function () {

  class App {
    public person: Person = new Person((void 0)!, (void 0)!);
    public controller: ValidationController;
    public controllerSpy: Spy;

    public constructor(
      @IContainer container: IContainer,
    ) {
      const factory = container.get(IValidationControllerFactory);
      this.controllerSpy = new Spy();
      const controller = this.controller = this.controllerSpy.getMock(factory.create()) as unknown as ValidationController;
      Registration.instance(IValidationController, controller).register(container);

      const validationRules = container.get(IValidationRules);
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
    const ctx = TestContext.createHTMLTestContext();
    const container = ctx.container;
    const host = ctx.dom.createElement('app');
    ctx.doc.body.appendChild(host);
    let app;
    const au = new Aurelia(container);
    await au
      .register(ValidationConfiguration)
      .app({
        host,
        component: app = (() => {
          const ca = CustomElement.define({ name: 'app', isStrictBinding: true, template }, App);
          return new ca(container);
        })()
      })
      .start()
      .wait();

    await testFunction({ app, container, host });

    await au.stop().wait();
    ctx.doc.body.removeChild(host);
  }

  function $it(title: string, testFunction: TestFunction, ctx: TestSetupContext<any>) {
    it(title, async function () {
      await runTest(testFunction, ctx);
    });
  }

  $it('registers binding to the controller with default blur trigger',
    async function ({ app, host, container }: TestContext<App>) {
      const scheduler = container.get(IScheduler);
      const controller = app.controller;
      const controllerSpy = app.controllerSpy;

      const bindings = Array.from((controller['bindings'] as Map<IBinding, any>).keys()) as BindingWithBehavior[];
      assert.equal(bindings.length, 1);

      const target: HTMLInputElement = (host as Element).querySelector("#target");
      const binding = bindings[0];
      assert.equal(binding.target, (host as Element).querySelector("#target"));
      assert.equal(Unparser.unparse(binding.sourceExpression.expression), 'person.name');

      assert.equal(controller.errors.length, 0);
      await controller.validate();
      assert.equal(controller.errors.length, 1);

      controllerSpy.clearCallRecords();
      target.value = 'foo';

      target.dispatchEvent(new Event('change'));
      await scheduler.yieldAll();
      controllerSpy.methodCalledTimes('validate', 0);

      controllerSpy.clearCallRecords();
      target.dispatchEvent(new Event('blur'));
      await scheduler.yieldAll();
      controllerSpy.methodCalledTimes('validate', 1);
      assert.equal(controller.errors.length, 0);
    },
    { template: `<input id="target" type="text" value.bind="person.name & validate">` }
  );
});
