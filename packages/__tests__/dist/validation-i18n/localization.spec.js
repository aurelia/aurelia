import { I18N, I18nConfiguration } from '@aurelia/i18n';
import { Registration } from '@aurelia/kernel';
import { assert, TestContext } from '@aurelia/testing';
import { IValidationMessageProvider, IValidationRules, IValidator, StandardValidator, ValidationMessageProvider, } from '@aurelia/validation';
import { Unparser } from '@aurelia/expression-parser';
import { CustomElement, Aurelia, IPlatform } from '@aurelia/runtime-html';
import { IValidationController, } from '@aurelia/validation-html';
import { LocalizedValidationController, LocalizedValidationControllerFactory, LocalizedValidationMessageProvider, ValidationI18nConfiguration } from '@aurelia/validation-i18n';
import { Spy } from '../Spy.js';
import { createSpecFunction } from '../util.js';
describe('validation-i18n/localization.spec.ts', function () {
    describe('validation-i18n', function () {
        class Person {
            constructor(name, age) {
                this.name = name;
                this.age = age;
            }
        }
        class App {
            constructor(container) {
                this.person1 = new Person((void 0), (void 0));
                this.person2 = new Person((void 0), (void 0));
                this.person3 = new Person((void 0), (void 0));
                this.person4 = new Person((void 0), (void 0));
                this.model = { someProperty: 1 };
                this.stateError = 'none';
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
                    .satisfiesState('none', (_v, _o) => this.stateError, { foo: 'stateError.foo', bar: 'stateError.bar' });
                validationRules
                    .on(this.person4)
                    .ensure('name')
                    .satisfiesState('none', (_v, _o) => this.stateError, { foo: 'stateError.foo', bar: 'stateError.bar' })
                    .withMessageKey('customStateError');
                validationRules
                    .on(this.model)
                    .ensure('someProperty')
                    .range(3, 20);
            }
            unbinding() {
                this.validationRules.off();
                // mandatory cleanup in root
                this.controller.reset();
            }
            dispose() {
                const controller = this.controller;
                assert.equal(controller.results.length, 0, 'the result should have been removed');
                assert.equal(controller.bindings.size, 0, 'the bindings should have been removed');
                assert.equal(controller.objects.size, 0, 'the objects should have been removed');
            }
        }
        class FooMessageProvider extends ValidationMessageProvider {
        }
        class FooValidator extends StandardValidator {
        }
        async function runTest(testFunction, { template = '', toCustomize = false, defaultNS, defaultKeyPrefix } = {}) {
            const ctx = TestContext.create();
            const container = ctx.container;
            const host = ctx.doc.createElement('app');
            ctx.doc.body.appendChild(host);
            let app;
            const au = new Aurelia(container);
            await au
                .register(I18nConfiguration.customize((options) => {
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
            }), toCustomize
                ? ValidationI18nConfiguration
                    .customize((opts) => {
                    opts.MessageProviderType = FooMessageProvider;
                    opts.ValidatorType = FooValidator;
                })
                : (defaultNS !== void 0 || defaultKeyPrefix !== void 0
                    ? ValidationI18nConfiguration.customize((opts) => {
                        opts.DefaultNamespace = defaultNS;
                        opts.DefaultKeyPrefix = defaultKeyPrefix;
                    })
                    : ValidationI18nConfiguration))
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
        function assertControllerBinding(controller, rawExpression, target, controllerSpy) {
            controllerSpy.methodCalledTimes('registerBinding', 1);
            const bindings = Array.from(controller['bindings'].keys());
            assert.equal(bindings.length, 1);
            const binding = bindings[0];
            assert.equal(binding.target, target);
            assert.equal(Unparser.unparse(binding.ast.expression), rawExpression);
        }
        async function assertEventHandler(target, event, callCount, platform, controllerSpy, ctx) {
            controllerSpy.clearCallRecords();
            target.dispatchEvent(new ctx.Event(event));
            await platform.domQueue.yield();
            controllerSpy.methodCalledTimes('validateBinding', callCount);
            controllerSpy.methodCalledTimes('validate', callCount);
        }
        async function changeLocale(container, platform, controllerSpy, locale = 'de') {
            const i18n = container.get(I18N);
            await i18n.setLocale(locale);
            await platform.domQueue.yield();
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
        $it('provides localized validation failure messages - controller#validate', async function ({ app, container, platform }) {
            const controller = app.controller;
            const controllerSpy = app.controllerSpy;
            const person1 = app.person1;
            controller.addObject(person1);
            let { results } = await controller.validate();
            assert.deepStrictEqual(results.filter(r => !r.valid).map((r) => r.toString()), ['Name is mandatory', 'Enter a value for Age.']);
            await changeLocale(container, platform, controllerSpy);
            ({ results } = await controller.validate());
            assert.deepStrictEqual(results.filter(r => !r.valid).map((r) => r.toString()), ['Name ist notwendig', 'Geben Sie einen Wert für Alter ein.']);
            controller.removeObject(person1);
        });
        $it('provides localized validation failure messages', async function ({ app, container, host, platform, ctx }) {
            const controller = app.controller;
            const controllerSpy = app.controllerSpy;
            const target = host.querySelector('input');
            assertControllerBinding(controller, 'person1.age', target, controllerSpy);
            await assertEventHandler(target, 'focusout', 1, platform, controllerSpy, ctx);
            assert.deepStrictEqual(controller.results.filter(r => !r.valid).map((r) => r.toString()), ['Enter a value for Age.']);
            await changeLocale(container, platform, controllerSpy);
            assert.deepStrictEqual(controller.results.filter(r => !r.valid).map((r) => r.toString()), ['Geben Sie einen Wert für Alter ein.']);
        }, {
            template: `<input type="text" value.two-way="person1.age & validate">`
        });
        $it('provides localized validation failure messages for specific keys', async function ({ app, container, host, platform, ctx }) {
            const controller = app.controller;
            const controllerSpy = app.controllerSpy;
            const target = host.querySelector('input');
            assertControllerBinding(controller, 'person1.name', target, controllerSpy);
            await assertEventHandler(target, 'focusout', 1, platform, controllerSpy, ctx);
            assert.deepStrictEqual(controller.results.filter(r => !r.valid).map((r) => r.toString()), ['Name is mandatory']);
            await changeLocale(container, platform, controllerSpy);
            assert.deepStrictEqual(controller.results.filter(r => !r.valid).map((r) => r.toString()), ['Name ist notwendig']);
        }, {
            template: `<input type="text" value.two-way="person1.name & validate">`
        });
        $it('can provides localized validation failure messages from different namespace', async function ({ app, container, host, platform, ctx }) {
            const controller = app.controller;
            const controllerSpy = app.controllerSpy;
            const target = host.querySelector('input');
            assertControllerBinding(controller, 'person2.name', target, controllerSpy);
            await assertEventHandler(target, 'focusout', 1, platform, controllerSpy, ctx);
            assert.deepStrictEqual(controller.results.filter(r => !r.valid).map((r) => r.toString()), ['The value of the Name is required.']);
            await changeLocale(container, platform, controllerSpy);
            assert.deepStrictEqual(controller.results.filter(r => !r.valid).map((r) => r.toString()), ['Der Wert des Name ist erforderlich.']);
        }, {
            template: `<input type="text" value.two-way="person2.name & validate">`
        });
        $it('supports registration of default namespace', async function ({ app, container, host, platform, ctx }) {
            const controller = app.controller;
            const controllerSpy = app.controllerSpy;
            const target = host.querySelector('input');
            assertControllerBinding(controller, 'person1.age', target, controllerSpy);
            await assertEventHandler(target, 'focusout', 1, platform, controllerSpy, ctx);
            assert.deepStrictEqual(controller.results.filter(r => !r.valid).map((r) => r.toString()), ['The value of the age is required.']);
            await changeLocale(container, platform, controllerSpy);
            assert.deepStrictEqual(controller.results.filter(r => !r.valid).map((r) => r.toString()), ['Der Wert des age ist erforderlich.']);
        }, {
            template: `<input type="text" value.two-way="person1.age & validate">`,
            defaultNS: 'errorMessages'
        });
        $it('supports registration of default prefix', async function ({ app, container, host, platform, ctx }) {
            const controller = app.controller;
            const controllerSpy = app.controllerSpy;
            const target = host.querySelector('input');
            assertControllerBinding(controller, 'person1.age', target, controllerSpy);
            await assertEventHandler(target, 'focusout', 1, platform, controllerSpy, ctx);
            assert.deepStrictEqual(controller.results.filter(r => !r.valid).map((r) => r.toString()), ['The value is required']);
            await changeLocale(container, platform, controllerSpy);
            assert.deepStrictEqual(controller.results.filter(r => !r.valid).map((r) => r.toString()), ['Der Wert ist notwendig']);
        }, {
            template: `<input type="text" value.two-way="person1.age & validate">`,
            defaultKeyPrefix: 'errorMessages'
        });
        // Issue: https://discourse.aurelia.io/t/au2-validation-in-conditionally-rendered-component/5507/8
        $it('supports registration of default prefix - Discourse 5507', async function ({ app, container, host, platform, ctx }) {
            const controller = app.controller;
            const controllerSpy = app.controllerSpy;
            const target = host.querySelector('input');
            assertControllerBinding(controller, 'model.someProperty', target, controllerSpy);
            await assertEventHandler(target, 'focusout', 1, platform, controllerSpy, ctx);
            assert.deepStrictEqual(controller.results.filter(r => !r.valid).map((r) => r.toString()), ['FooBar should conform the interval [3, 20].']);
            await changeLocale(container, platform, controllerSpy);
            assert.deepStrictEqual(controller.results.filter(r => !r.valid).map((r) => r.toString()), ['FooBar sollte dem Intervall [3, 20] entsprechen.']);
        }, {
            template: `<input type="text" value.two-way="model.someProperty & validate">`,
            defaultKeyPrefix: 'validation'
        });
        $it('supports registration of default namespace and prefix', async function ({ app, container, host, platform, ctx }) {
            const controller = app.controller;
            const controllerSpy = app.controllerSpy;
            const target = host.querySelector('input');
            assertControllerBinding(controller, 'person1.age', target, controllerSpy);
            await assertEventHandler(target, 'focusout', 1, platform, controllerSpy, ctx);
            assert.deepStrictEqual(controller.results.filter(r => !r.valid).map((r) => r.toString()), ['The value of Age Foo is required in foo']);
            await changeLocale(container, platform, controllerSpy);
            assert.deepStrictEqual(controller.results.filter(r => !r.valid).map((r) => r.toString()), ['DerWert von Alter Foo wird in foo benötigt']);
        }, {
            template: `<input type="text" value.two-way="person1.age & validate">`,
            defaultNS: 'foo',
            defaultKeyPrefix: 'errorMessages'
        });
        $it('supports translating state rule', async function ({ app, container, host, platform, ctx }) {
            const controller = app.controller;
            const controllerSpy = app.controllerSpy;
            const target = host.querySelector('input');
            assertControllerBinding(controller, 'person3.name', target, controllerSpy);
            app.stateError = 'foo';
            await assertEventHandler(target, 'focusout', 1, platform, controllerSpy, ctx);
            assert.deepStrictEqual(controller.results.filter(r => !r.valid).map((r) => r.toString()), ['Foo Error']);
            await changeLocale(container, platform, controllerSpy);
            assert.deepStrictEqual(controller.results.filter(r => !r.valid).map((r) => r.toString()), ['Foo Fehler']);
            app.stateError = 'bar';
            await assertEventHandler(target, 'focusout', 1, platform, controllerSpy, ctx);
            assert.deepStrictEqual(controller.results.filter(r => !r.valid).map((r) => r.toString()), ['Bar Fehler']);
            await changeLocale(container, platform, controllerSpy, 'en');
            assert.deepStrictEqual(controller.results.filter(r => !r.valid).map((r) => r.toString()), ['Bar Error']);
            app.stateError = 'none';
            await assertEventHandler(target, 'focusout', 1, platform, controllerSpy, ctx);
            assert.deepStrictEqual(controller.results.filter(r => !r.valid), []);
        }, {
            template: `<input type="text" value.two-way="person3.name & validate">`
        });
        $it('supports translating state rule with explicit message key', async function ({ app, container, host, platform, ctx }) {
            const controller = app.controller;
            const controllerSpy = app.controllerSpy;
            const target = host.querySelector('input');
            assertControllerBinding(controller, 'person4.name', target, controllerSpy);
            app.stateError = 'foo';
            await assertEventHandler(target, 'focusout', 1, platform, controllerSpy, ctx);
            assert.deepStrictEqual(controller.results.filter(r => !r.valid).map((r) => r.toString()), ['Invalid state']);
            await changeLocale(container, platform, controllerSpy);
            assert.deepStrictEqual(controller.results.filter(r => !r.valid).map((r) => r.toString()), ['Ungültiger Status']);
            app.stateError = 'bar';
            await assertEventHandler(target, 'focusout', 1, platform, controllerSpy, ctx);
            assert.deepStrictEqual(controller.results.filter(r => !r.valid).map((r) => r.toString()), ['Ungültiger Status']);
            await changeLocale(container, platform, controllerSpy, 'en');
            assert.deepStrictEqual(controller.results.filter(r => !r.valid).map((r) => r.toString()), ['Invalid state']);
            app.stateError = 'none';
            await assertEventHandler(target, 'focusout', 1, platform, controllerSpy, ctx);
            assert.deepStrictEqual(controller.results.filter(r => !r.valid), []);
        }, {
            template: `<input type="text" value.two-way="person4.name & validate">`
        });
    });
});
//# sourceMappingURL=localization.spec.js.map