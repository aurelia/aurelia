import { I18N, I18nConfiguration, I18nConfigurationOptions } from '@aurelia/i18n';
import { IContainer, newInstanceForScope, Registration, resolve, toArray } from '@aurelia/kernel';
import { assert, createFixture, getVisibleText, TestContext } from '@aurelia/testing';
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
import { tasksSettled } from '@aurelia/runtime';
import { Flight } from '../validation/_test-resources.js';

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

    interface Model {
      someProperty: number;
    }
    type StateError = 'none' | 'foo' | 'bar';
    class App {
      public person1: Person = new Person((void 0)!, (void 0)!);
      public person2: Person = new Person((void 0)!, (void 0)!);
      public person3: Person = new Person((void 0)!, (void 0)!);
      public person4: Person = new Person((void 0)!, (void 0)!);
      public model: Partial<Model> = { someProperty: 1 };
      public factory: LocalizedValidationControllerFactory;
      public controller: IValidationController;
      public controllerSpy: Spy;
      public readonly validationRules: IValidationRules;
      public stateError: StateError = 'none';

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

        validationRules
          .on(this.person3)
          .ensure('name')
          .satisfiesState<StateError, string>('none', (_v, _o) => this.stateError, { foo: 'stateError.foo', bar: 'stateError.bar' });

        validationRules
          .on(this.person4)
          .ensure('name')
          .satisfiesState<StateError, string>('none', (_v, _o) => this.stateError, { foo: 'stateError.foo', bar: 'stateError.bar' })
          .withMessageKey('customStateError');

        validationRules
          .on(this.model)
          .ensure('someProperty')
          .range(3, 20);
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
                  },
                  validation: {
                    range: "${$displayName} should conform the interval [${$rule.min}, ${$rule.max}].",
                    someProperty: "FooBar"
                  },
                  stateError: {
                    foo: 'Foo Error',
                    bar: 'Bar Error'
                  },
                  customStateError: 'Invalid state',
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
                  },
                  validation: {
                    range: "${$displayName} sollte dem Intervall [${$rule.min}, ${$rule.max}] entsprechen.",
                    someProperty: "FooBar"
                  },
                  stateError: {
                    foo: 'Foo Fehler',
                    bar: 'Bar Fehler'
                  },
                  customStateError: 'Ungültiger Status'
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
            options.initOptions.fallbackLng = false;
            if (defaultNS != null) options.initOptions.fallbackNS = false;
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
      await tasksSettled();
      controllerSpy.methodCalledTimes('validateBinding', callCount);
      controllerSpy.methodCalledTimes('validate', callCount);
    }

    async function changeLocale(container: IContainer, platform: IPlatform, controllerSpy: Spy, locale: string = 'de') {
      const i18n = container.get(I18N);
      await i18n.setLocale(locale);
      await tasksSettled();
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

    // Issue: https://discourse.aurelia.io/t/au2-validation-in-conditionally-rendered-component/5507/8
    $it('supports registration of default prefix - Discourse 5507',
      async function ({ app, container, host, platform, ctx }) {
        const controller = app.controller;
        const controllerSpy = app.controllerSpy;

        const target = host.querySelector('input');
        assertControllerBinding(controller as ValidationController, 'model.someProperty', target, controllerSpy);

        await assertEventHandler(target, 'focusout', 1, platform, controllerSpy, ctx);
        assert.deepStrictEqual(
          controller.results.filter(r => !r.valid).map((r) => r.toString()),
          ['FooBar should conform the interval [3, 20].']
        );

        await changeLocale(container, platform, controllerSpy);

        assert.deepStrictEqual(
          controller.results.filter(r => !r.valid).map((r) => r.toString()),
          ['FooBar sollte dem Intervall [3, 20] entsprechen.']
        );
      },
      {
        template: `<input type="text" value.two-way="model.someProperty & validate">`,
        defaultKeyPrefix: 'validation'
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

    $it('supports translating state rule',
      async function ({ app, container, host, platform, ctx }) {
        const controller = app.controller;
        const controllerSpy = app.controllerSpy;

        const target = host.querySelector('input');
        assertControllerBinding(controller as ValidationController, 'person3.name', target, controllerSpy);

        app.stateError = 'foo';
        await assertEventHandler(target, 'focusout', 1, platform, controllerSpy, ctx);
        assert.deepStrictEqual(
          controller.results.filter(r => !r.valid).map((r) => r.toString()),
          ['Foo Error']
        );

        await changeLocale(container, platform, controllerSpy);

        assert.deepStrictEqual(
          controller.results.filter(r => !r.valid).map((r) => r.toString()),
          ['Foo Fehler']
        );

        app.stateError = 'bar';
        await assertEventHandler(target, 'focusout', 1, platform, controllerSpy, ctx);
        assert.deepStrictEqual(
          controller.results.filter(r => !r.valid).map((r) => r.toString()),
          ['Bar Fehler']
        );

        await changeLocale(container, platform, controllerSpy, 'en');

        assert.deepStrictEqual(
          controller.results.filter(r => !r.valid).map((r) => r.toString()),
          ['Bar Error']
        );

        app.stateError = 'none';
        await assertEventHandler(target, 'focusout', 1, platform, controllerSpy, ctx);
        assert.deepStrictEqual(
          controller.results.filter(r => !r.valid),
          []
        );
      },
      {
        template: `<input type="text" value.two-way="person3.name & validate">`
      }
    );

    $it('supports translating state rule with explicit message key',
      async function ({ app, container, host, platform, ctx }) {
        const controller = app.controller;
        const controllerSpy = app.controllerSpy;

        const target = host.querySelector('input');
        assertControllerBinding(controller as ValidationController, 'person4.name', target, controllerSpy);

        app.stateError = 'foo';
        await assertEventHandler(target, 'focusout', 1, platform, controllerSpy, ctx);
        assert.deepStrictEqual(
          controller.results.filter(r => !r.valid).map((r) => r.toString()),
          ['Invalid state']
        );

        await changeLocale(container, platform, controllerSpy);

        assert.deepStrictEqual(
          controller.results.filter(r => !r.valid).map((r) => r.toString()),
          ['Ungültiger Status']
        );

        app.stateError = 'bar';
        await assertEventHandler(target, 'focusout', 1, platform, controllerSpy, ctx);
        assert.deepStrictEqual(
          controller.results.filter(r => !r.valid).map((r) => r.toString()),
          ['Ungültiger Status']
        );

        await changeLocale(container, platform, controllerSpy, 'en');

        assert.deepStrictEqual(
          controller.results.filter(r => !r.valid).map((r) => r.toString()),
          ['Invalid state']
        );

        app.stateError = 'none';
        await assertEventHandler(target, 'focusout', 1, platform, controllerSpy, ctx);
        assert.deepStrictEqual(
          controller.results.filter(r => !r.valid),
          []
        );
      },
      {
        template: `<input type="text" value.two-way="person4.name & validate">`
      }
    );

    it('shows group validation errors correctly', async function () {
      const currentDate = new Date('2025-07-20T00:00:00Z');

      const translationEn = {
        required: '${$displayName} is required.',
        flight: {
          direction: 'Invalid flight direction',
          timeTravel: 'No time travel possible',
          backToPast: 'Not possible to go back in time',
          noReturnOneWay: 'One way flight has no return',
        }
      };

      const translationDe = {
        required: '${$displayName} ist erforderlich.',
        flight: {
          direction: 'Ungültige Flugrichtung',
          timeTravel: 'Keine Zeitreise möglich',
          backToPast: 'Rückkehr in die Vergangenheit nicht möglich',
          noReturnOneWay: 'Einzelne Reise hat keine Rückkehr',
        }
      };

      for (const locale of ['en', 'de']) {

        const isEn = locale === 'en';
        const translation = isEn ? translationEn : translationDe;

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
                          ? { property: 'departureDate', message: 'flight.backToPast' }
                          : true;
                      case 'one-way':
                        if ($departureDate < currentDate) return { property: 'departureDate', message: 'flight.timeTravel' };
                        if ($returnDate) return { property: 'returnDate', message: 'flight.noReturnOneWay' };
                        return true;
                      default:
                        return { property: 'direction', message: 'flight.direction' };
                    }
                  });
            }

            public unbinding() {
              this.validationRules.off();
            }
          },
          [
            ValidationI18nConfiguration,
            I18nConfiguration.customize(options => {
              options.initOptions.lng = locale;
              options.initOptions.resources = {
                en: { translation: translationEn },
                de: { translation: translationDe },
              };
            })
          ]
        ).started;

        await component.controller.validate();

        const containers = toArray(appHost.querySelectorAll('validation-container'));

        assert.deepStrictEqual(getErrors(), [[isEn ? 'direction is required.' : 'direction ist erforderlich.'], [], []], 'round#1');

        const [directionInput, departureInput, returnInput] = toArray(appHost.querySelectorAll('input'));

        // invalid direction
        directionInput.value = 'invalid';
        await triggerEvent(directionInput);
        assert.deepStrictEqual(getErrors(), [[translation.flight.direction], [], []], 'round#2');

        // one-way - departure date in past
        directionInput.value = 'one-way';
        departureInput.value = '2025-07-19T00:00:00Z';
        await triggerEvent(directionInput);
        await triggerEvent(departureInput);
        assert.deepStrictEqual(getErrors(), [[], [translation.flight.timeTravel], []], 'round#3');

        // one-way - return date set
        departureInput.value = '2025-07-21T00:00:00Z';
        returnInput.value = '2025-07-19T00:00:00Z';
        await triggerEvent(departureInput);
        await triggerEvent(returnInput);
        assert.deepStrictEqual(getErrors(), [[], [], [translation.flight.noReturnOneWay]], 'round#4');

        // round-trip
        directionInput.value = 'round-trip';
        await triggerEvent(directionInput);
        assert.deepStrictEqual(getErrors(), [[], [translation.flight.backToPast], []], 'round#5');

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
      }
    });
  });
});
