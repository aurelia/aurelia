import { I18N, I18nConfiguration, I18nConfigurationOptions } from '@aurelia/i18n';
import { IContainer, Registration } from '@aurelia/kernel';
import { assert, TestContext } from '@aurelia/testing';
import {
  IValidationMessageProvider,
  IValidationRules,
  IValidator,
  StandardValidator,
  ValidationMessageProvider,
} from '@aurelia/validation';
import { Unparser } from '@aurelia/expression-parser';
import { IBinding, CustomElement, INode, Aurelia, IPlatform } from '@aurelia/runtime-html';
import {
  BindingWithBehavior,
  IValidationController,
  ValidationController,
} from '@aurelia/validation-html';
import { LocalizedValidationController, LocalizedValidationControllerFactory, LocalizedValidationMessageProvider, ValidationI18nConfiguration } from '@aurelia/validation-i18n';
import { Spy } from '../Spy.js';
import { createSpecFunction, TestExecutionContext, TestFunction } from '../util.js';

describe('validation-i18n/localization.spec.ts', function () {
  describe('validation-i18n', function () {

    interface TestSetupContext {
      template: string;
      toCustomize: boolean;
      defaultNS?: string;
      defaultKeyPrefix?: string;
    }

    class Person {
      public constructor(public name: string, public age: number) { }
    }

    class App {
      public person1: Person = new Person((void 0)!, (void 0)!);
      public person2: Person = new Person((void 0)!, (void 0)!);
      public factory: LocalizedValidationControllerFactory;
      public controller: IValidationController;
      public controllerSpy: Spy;
      public readonly validationRules: IValidationRules;

      public constructor(container: IContainer) {
        const factory = this.factory = new LocalizedValidationControllerFactory();
        this.controllerSpy = new Spy();

        // mocks LocalizedValidationControllerFactory#createForCurrentScope
        const controller = this.controller = this.controllerSpy.getMock(factory.construct(container));
        Registration.instance(IValidationController, controller).register(container);

        const validationRules = this.validationRules = container.get(IValidationRules);
        validationRules
          .on(this.person1)

          .ensure('name')
          .required()
          .withMessageKey('nameRequired')

          .ensure('age')
          .required();

        validationRules
          .on(this.person2)

          .ensure('name')
          .required()
          .withMessageKey('errorMessages:required');
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

    class FooMessageProvider extends ValidationMessageProvider { }
    class FooValidator extends StandardValidator { }

    async function runTest(
      testFunction: TestFunction<TestExecutionContext<App>>,
      { template = '', toCustomize = false, defaultNS, defaultKeyPrefix }: Partial<TestSetupContext> = {}
    ) {
      const ctx = TestContext.create();
      const container = ctx.container;
      const host = ctx.doc.createElement('app');
      ctx.doc.body.appendChild(host);
      let app: App;
      const au = new Aurelia(container);
      await au
        .register(
          I18nConfiguration.customize((options: I18nConfigurationOptions) => {
            options.initOptions.resources = {
              en: {
                translation: {
                  required: `Enter a value for \${$displayName}.`,
                  name: 'Name',
                  age: 'Age',
                  nameRequired: 'Name is mandatory',
                  errorMessages: {
                    required: 'The value is required'
                  }
                },
                errorMessages: {
                  required: `The value of the \${$displayName} is required.`,
                },
                foo: {
                  errorMessages: {
                    age: 'Age Foo',
                    required: `The value of \${$displayName} is required in foo`
                  }
                }
              },
              de: {
                translation: {
                  required: `Geben Sie einen Wert für \${$displayName} ein.`,
                  name: 'Name',
                  age: 'Alter',
                  nameRequired: 'Name ist notwendig',
                  errorMessages: {
                    required: 'Der Wert ist notwendig'
                  }
                },
                errorMessages: {
                  required: `Der Wert des \${$displayName} ist erforderlich.`,
                },
                foo: {
                  errorMessages: {
                    age: 'Alter Foo',
                    required: `DerWert von \${$displayName} wird in foo benötigt`
                  }
                }
              }
            };
          }),
          toCustomize
            ? ValidationI18nConfiguration
              .customize((opts) => {
                opts.MessageProviderType = FooMessageProvider;
                opts.ValidatorType = FooValidator;
              })
            : (
              defaultNS !== void 0 || defaultKeyPrefix !== void 0
                ? ValidationI18nConfiguration.customize((opts) => {
                  opts.DefaultNamespace = defaultNS;
                  opts.DefaultKeyPrefix = defaultKeyPrefix;
                })
                : ValidationI18nConfiguration
            )
        )
        .app({
          host,
          component: app = (() => {
            const ca = CustomElement.define({ name: 'app', template }, App);
            return new ca(container);
          })()
        })
        .start();

      await testFunction({ app, container, host, platform: container.get(IPlatform), ctx });

      await au.stop();
      ctx.doc.body.removeChild(host);

      au.dispose();
    }

    const $it = createSpecFunction(runTest);

    function assertControllerBinding(controller: ValidationController, rawExpression: string, target: INode, controllerSpy: Spy) {
      controllerSpy.methodCalledTimes('registerBinding', 1);
      const bindings = Array.from((controller['bindings'] as Map<IBinding, any>).keys()) as BindingWithBehavior[];
      assert.equal(bindings.length, 1);

      const binding = bindings[0];
      assert.equal(binding.target, target);
      assert.equal(Unparser.unparse(binding.ast.expression), rawExpression);
    }

    async function assertEventHandler(target: HTMLElement, event: 'change' | 'focusout', callCount: number, platform: IPlatform, controllerSpy: Spy, ctx: TestContext) {
      controllerSpy.clearCallRecords();
      target.dispatchEvent(new ctx.Event(event));
      await platform.domReadQueue.yield();
      controllerSpy.methodCalledTimes('validateBinding', callCount);
      controllerSpy.methodCalledTimes('validate', callCount);
    }

    async function changeLocale(container: IContainer, platform: IPlatform, controllerSpy: Spy) {
      const i18n = container.get(I18N);
      await i18n.setLocale('de');
      await platform.domReadQueue.yield();
      controllerSpy.methodCalledTimes('validate', 1);
    }

    $it('registers localized implementations', function ({ app, container }) {
      assert.instanceOf(app.factory, LocalizedValidationControllerFactory);
      assert.instanceOf(app.controller, LocalizedValidationController);
      assert.instanceOf(container.get(IValidationMessageProvider), LocalizedValidationMessageProvider);
    });

    $it('allows customization of validation plugin', function ({ app, container }) {
      assert.instanceOf(app.factory, LocalizedValidationControllerFactory);
      assert.instanceOf(app.controller, LocalizedValidationController);
      assert.instanceOf(container.get(IValidationMessageProvider), FooMessageProvider);
      assert.instanceOf(container.get(IValidator), FooValidator);
    }, { toCustomize: true });

    $it('provides localized validation failure messages - controller#validate',
      async function ({ app, container, platform }) {
        const controller = app.controller;
        const controllerSpy = app.controllerSpy;
        const person1 = app.person1;

        controller.addObject(person1);
        let { results } = await controller.validate();
        assert.deepStrictEqual(
          results.filter(r => !r.valid).map((r) => r.toString()),
          ['Name is mandatory', 'Enter a value for Age.']
        );

        await changeLocale(container, platform, controllerSpy);

        ({ results } = await controller.validate());
        assert.deepStrictEqual(
          results.filter(r => !r.valid).map((r) => r.toString()),
          ['Name ist notwendig', 'Geben Sie einen Wert für Alter ein.']
        );

        controller.removeObject(person1);
      });

    $it('provides localized validation failure messages',
      async function ({ app, container, host, platform, ctx }) {
        const controller = app.controller;
        const controllerSpy = app.controllerSpy;

        const target = host.querySelector('input');
        assertControllerBinding(controller as ValidationController, 'person1.age', target, controllerSpy);

        await assertEventHandler(target, 'focusout', 1, platform, controllerSpy, ctx);
        assert.deepStrictEqual(
          controller.results.filter(r => !r.valid).map((r) => r.toString()),
          ['Enter a value for Age.']
        );

        await changeLocale(container, platform, controllerSpy);

        assert.deepStrictEqual(
          controller.results.filter(r => !r.valid).map((r) => r.toString()),
          ['Geben Sie einen Wert für Alter ein.']
        );
      },
      {
        template: `<input type="text" value.two-way="person1.age & validate">`
      }
    );

    $it('provides localized validation failure messages for specific keys',
      async function ({ app, container, host, platform, ctx }) {
        const controller = app.controller;
        const controllerSpy = app.controllerSpy;

        const target = host.querySelector('input');
        assertControllerBinding(controller as ValidationController, 'person1.name', target, controllerSpy);

        await assertEventHandler(target, 'focusout', 1, platform, controllerSpy, ctx);
        assert.deepStrictEqual(
          controller.results.filter(r => !r.valid).map((r) => r.toString()),
          ['Name is mandatory']
        );

        await changeLocale(container, platform, controllerSpy);

        assert.deepStrictEqual(
          controller.results.filter(r => !r.valid).map((r) => r.toString()),
          ['Name ist notwendig']
        );
      },
      {
        template: `<input type="text" value.two-way="person1.name & validate">`
      }
    );

    $it('can provides localized validation failure messages from different namespace',
      async function ({ app, container, host, platform, ctx }) {
        const controller = app.controller;
        const controllerSpy = app.controllerSpy;

        const target = host.querySelector('input');
        assertControllerBinding(controller as ValidationController, 'person2.name', target, controllerSpy);

        await assertEventHandler(target, 'focusout', 1, platform, controllerSpy, ctx);
        assert.deepStrictEqual(
          controller.results.filter(r => !r.valid).map((r) => r.toString()),
          ['The value of the Name is required.']
        );

        await changeLocale(container, platform, controllerSpy);

        assert.deepStrictEqual(
          controller.results.filter(r => !r.valid).map((r) => r.toString()),
          ['Der Wert des Name ist erforderlich.']
        );
      },
      {
        template: `<input type="text" value.two-way="person2.name & validate">`
      }
    );

    $it('supports registration of default namespace',
      async function ({ app, container, host, platform, ctx }) {
        const controller = app.controller;
        const controllerSpy = app.controllerSpy;

        const target = host.querySelector('input');
        assertControllerBinding(controller as ValidationController, 'person1.age', target, controllerSpy);

        await assertEventHandler(target, 'focusout', 1, platform, controllerSpy, ctx);
        assert.deepStrictEqual(
          controller.results.filter(r => !r.valid).map((r) => r.toString()),
          ['The value of the age is required.']
        );

        await changeLocale(container, platform, controllerSpy);

        assert.deepStrictEqual(
          controller.results.filter(r => !r.valid).map((r) => r.toString()),
          ['Der Wert des age ist erforderlich.']
        );
      },
      {
        template: `<input type="text" value.two-way="person1.age & validate">`,
        defaultNS: 'errorMessages'
      }
    );

    $it('supports registration of default prefix',
      async function ({ app, container, host, platform, ctx }) {
        const controller = app.controller;
        const controllerSpy = app.controllerSpy;

        const target = host.querySelector('input');
        assertControllerBinding(controller as ValidationController, 'person1.age', target, controllerSpy);

        await assertEventHandler(target, 'focusout', 1, platform, controllerSpy, ctx);
        assert.deepStrictEqual(
          controller.results.filter(r => !r.valid).map((r) => r.toString()),
          ['The value is required']
        );

        await changeLocale(container, platform, controllerSpy);

        assert.deepStrictEqual(
          controller.results.filter(r => !r.valid).map((r) => r.toString()),
          ['Der Wert ist notwendig']
        );
      },
      {
        template: `<input type="text" value.two-way="person1.age & validate">`,
        defaultKeyPrefix: 'errorMessages'
      }
    );

    $it('supports registration of default namespace and prefix',
      async function ({ app, container, host, platform, ctx }) {
        const controller = app.controller;
        const controllerSpy = app.controllerSpy;

        const target = host.querySelector('input');
        assertControllerBinding(controller as ValidationController, 'person1.age', target, controllerSpy);

        await assertEventHandler(target, 'focusout', 1, platform, controllerSpy, ctx);
        assert.deepStrictEqual(
          controller.results.filter(r => !r.valid).map((r) => r.toString()),
          ['The value of Age Foo is required in foo']
        );

        await changeLocale(container, platform, controllerSpy);

        assert.deepStrictEqual(
          controller.results.filter(r => !r.valid).map((r) => r.toString()),
          ['DerWert von Alter Foo wird in foo benötigt']
        );
      },
      {
        template: `<input type="text" value.two-way="person1.age & validate">`,
        defaultNS: 'foo',
        defaultKeyPrefix: 'errorMessages'
      }
    );
  });
});
