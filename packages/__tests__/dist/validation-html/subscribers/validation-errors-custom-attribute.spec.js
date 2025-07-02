var __esDecorate = (this && this.__esDecorate) || function (ctor, descriptorIn, decorators, contextIn, initializers, extraInitializers) {
    function accept(f) { if (f !== void 0 && typeof f !== "function") throw new TypeError("Function expected"); return f; }
    var kind = contextIn.kind, key = kind === "getter" ? "get" : kind === "setter" ? "set" : "value";
    var target = !descriptorIn && ctor ? contextIn["static"] ? ctor : ctor.prototype : null;
    var descriptor = descriptorIn || (target ? Object.getOwnPropertyDescriptor(target, contextIn.name) : {});
    var _, done = false;
    for (var i = decorators.length - 1; i >= 0; i--) {
        var context = {};
        for (var p in contextIn) context[p] = p === "access" ? {} : contextIn[p];
        for (var p in contextIn.access) context.access[p] = contextIn.access[p];
        context.addInitializer = function (f) { if (done) throw new TypeError("Cannot add initializers after decoration has completed"); extraInitializers.push(accept(f || null)); };
        var result = (0, decorators[i])(kind === "accessor" ? { get: descriptor.get, set: descriptor.set } : descriptor[key], context);
        if (kind === "accessor") {
            if (result === void 0) continue;
            if (result === null || typeof result !== "object") throw new TypeError("Object expected");
            if (_ = accept(result.get)) descriptor.get = _;
            if (_ = accept(result.set)) descriptor.set = _;
            if (_ = accept(result.init)) initializers.unshift(_);
        }
        else if (_ = accept(result)) {
            if (kind === "field") initializers.unshift(_);
            else descriptor[key] = _;
        }
    }
    if (target) Object.defineProperty(target, contextIn.name, descriptor);
    done = true;
};
var __runInitializers = (this && this.__runInitializers) || function (thisArg, initializers, value) {
    var useValue = arguments.length > 2;
    for (var i = 0; i < initializers.length; i++) {
        value = useValue ? initializers[i].call(thisArg, value) : initializers[i].call(thisArg);
    }
    return useValue ? value : void 0;
};
var __setFunctionName = (this && this.__setFunctionName) || function (f, name, prefix) {
    if (typeof name === "symbol") name = name.description ? "[".concat(name.description, "]") : "";
    return Object.defineProperty(f, "name", { configurable: true, value: prefix ? "".concat(prefix, " ", name) : name });
};
import { newInstanceForScope, newInstanceOf, resolve, toArray } from '@aurelia/kernel';
import { assert, createSpy, getVisibleText, TestContext } from '@aurelia/testing';
import { IValidationRules } from '@aurelia/validation';
import { CustomAttribute, CustomElement, customElement, IPlatform, Aurelia } from '@aurelia/runtime-html';
import { IValidationController, ValidationHtmlConfiguration, } from '@aurelia/validation-html';
import { createSpecFunction, ToNumberValueConverter } from '../../util.js';
import { Person } from '../../validation/_test-resources.js';
import { tasksSettled } from '@aurelia/runtime';
describe('validation-html/subscribers/validation-errors-custom-attribute.spec.ts', function () {
    describe('validation-errors-custom-attribute', function () {
        class App {
            constructor() {
                this.person = new Person((void 0), (void 0));
                this.platform = resolve(IPlatform);
                this.controller = resolve(newInstanceForScope(IValidationController));
                this.controller2 = resolve(newInstanceOf(IValidationController));
                this.validationRules = resolve(IValidationRules);
                this.controllerValidateSpy = createSpy(this.controller, 'validate', true);
                this.controllerRemoveSubscriberSpy = createSpy(this.controller, 'removeSubscriber', true);
                this.controller2ValidateSpy = createSpy(this.controller2, 'validate', true);
                this.controller2RemoveSubscriberSpy = createSpy(this.controller2, 'removeSubscriber', true);
                this.validationRules
                    .on(this.person)
                    .ensure('name')
                    .displayName('Name')
                    .required()
                    .ensure('age')
                    .displayName('Age')
                    .required()
                    .satisfies((age) => age !== '' && age % 3 === 0 && age % 5 === 0)
                    .withMessage('${$displayName} is not fizbaz');
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
        async function runTest(testFunction, { template, removeSubscriberSpies }) {
            const ctx = TestContext.create();
            const container = ctx.container;
            const host = ctx.doc.createElement('app');
            ctx.doc.body.appendChild(host);
            const au = new Aurelia(container);
            await au
                .register(ValidationHtmlConfiguration, ToNumberValueConverter)
                .app({
                host,
                component: CustomElement.define({ name: 'app', template }, App)
            })
                .start();
            const app = au.root.controller.viewModel;
            await testFunction({ app, host, container, platform: app.platform, ctx });
            await au.stop();
            ctx.doc.body.removeChild(host);
            if (removeSubscriberSpies !== void 0) {
                for (const [spy, count] of Object.entries(removeSubscriberSpies)) {
                    assert.equal(app[spy].calls.length, count);
                }
            }
            else {
                assert.equal(app.controllerRemoveSubscriberSpy.calls.length, template.match(/validation-errors|validate/g).length);
            }
            au.dispose();
        }
        const $it = createSpecFunction(runTest);
        async function assertEventHandler(target, platform, controllerValidateSpy, handleValidationEventSpy, ctx, event = 'focusout') {
            handleValidationEventSpy.calls.splice(0);
            controllerValidateSpy.calls.splice(0);
            target.dispatchEvent(new ctx.Event(event));
            await tasksSettled();
            assert.equal(controllerValidateSpy.calls.length, 1, 'incorrect #calls for validate');
            assert.equal(handleValidationEventSpy.calls.length, 1, 'incorrect #calls for handleValidationEvent');
        }
        function assertSubscriber(controller, ca) {
            const subscribers = controller['subscribers'];
            assert.equal((subscribers).has(ca), true);
            assert.equal(ca.controller, controller);
        }
        $it('registers only the errors targeted for the containing elements', async function ({ host, platform, app, ctx }) {
            const div1 = host.querySelector('#div1');
            const div2 = host.querySelector('#div2');
            const ca1 = CustomAttribute.for(div1, 'validation-errors').viewModel;
            const ca2 = CustomAttribute.for(div2, 'validation-errors').viewModel;
            const spy1 = createSpy(ca1, 'handleValidationEvent', true);
            const spy2 = createSpy(ca2, 'handleValidationEvent', true);
            const { controllerValidateSpy, controller } = app;
            // assert that things are correctly wired up
            assertSubscriber(controller, ca1);
            assertSubscriber(controller, ca2);
            const target1 = div1.querySelector('#target1');
            const target2 = div2.querySelector('#target2');
            await assertEventHandler(target1, platform, controllerValidateSpy, spy1, ctx);
            target2.value = 'foo';
            target2.dispatchEvent(new ctx.Event('change'));
            await assertEventHandler(target2, platform, controllerValidateSpy, spy2, ctx);
            // assert that errors are rendered in the respective containers
            let errors1 = ca1.errors;
            assert.deepEqual(app['nameErrors'], errors1);
            assert.equal(errors1.length, 1);
            assert.deepEqual(errors1[0].targets, [target1]);
            let errors2 = ca2.errors;
            assert.deepEqual(app['ageErrors'], errors2);
            assert.equal(errors2.length, 2);
            assert.deepEqual(errors2[0].targets, [target2]);
            assert.deepEqual(errors2[1].targets, [target2]);
            assert.html.textContent(div1.querySelector('span.error'), 'Name is required.');
            assert.deepEqual(toArray(div2.querySelectorAll('span.error'))
                .map((span) => getVisibleText(span, true)), ['Age is required.', 'Age is not fizbaz']);
            // assert that errors are removed
            target1.value = 'foo';
            target1.dispatchEvent(new ctx.Event('change'));
            await assertEventHandler(target1, platform, controllerValidateSpy, spy1, ctx);
            target2.value = '15';
            target2.dispatchEvent(new ctx.Event('change'));
            await assertEventHandler(target2, platform, controllerValidateSpy, spy2, ctx);
            errors1 = ca1.errors;
            assert.equal(errors1.length, 0, 'errors1.length');
            assert.equal(div1.querySelectorAll('span.error').length, 0, 'div1.querySelectorAll(span.error).length');
            errors2 = ca2.errors;
            assert.equal(errors2.length, 0, 'errors2.length');
            assert.equal(div2.querySelectorAll('span.error').length, 0, 'div2.querySelectorAll(span.error).length');
        }, {
            template: `
      <div id="div1" validation-errors.bind="nameErrors">
        <input id="target1" type="text" value.two-way="person.name & validate">
        <span class="error" repeat.for="errorInfo of nameErrors">
          \${errorInfo.result.message}
        </span>
      </div>
      <div id="div2" validation-errors.bind="ageErrors">
        <input id="target2" type="text" value.two-way="person.age | toNumber & validate">
        <span class="error" repeat.for="errorInfo of ageErrors">
          \${errorInfo.result.message}
        </span>
      </div>
      `
        });
        $it('sorts the errors according to the target position', async function ({ host, platform, app, ctx }) {
            const div = host.querySelector('div');
            const ca = CustomAttribute.for(div, 'validation-errors').viewModel;
            const spy = createSpy(ca, 'handleValidationEvent', true);
            const { controllerValidateSpy, controller } = app;
            assertSubscriber(controller, ca);
            const target1 = div.querySelector('#target1');
            const target2 = div.querySelector('#target2');
            await assertEventHandler(target1, platform, controllerValidateSpy, spy, ctx);
            target2.value = 'foo';
            target2.dispatchEvent(new ctx.Event('change'));
            await assertEventHandler(target2, platform, controllerValidateSpy, spy, ctx);
            const errors1 = ca.errors;
            assert.deepEqual(app['errors'], errors1);
            assert.equal(errors1.length, 3);
            assert.deepEqual(errors1[0].targets, [target1]);
            assert.deepEqual(errors1[1].targets, [target2]);
            assert.deepEqual(errors1[2].targets, [target2]);
            assert.deepEqual(toArray(div.querySelectorAll('span.error'))
                .map((span) => getVisibleText(span, true)), ['Name is required.', 'Age is required.', 'Age is not fizbaz']);
        }, {
            template: `
      <div id="div" validation-errors.bind="errors">
        <input id="target1" type="text" value.two-way="person.name & validate">
        <input id="target2" type="text" value.two-way="person.age | toNumber & validate">
        <span class="error" repeat.for="errorInfo of errors">
          \${errorInfo.result.message}
        </span>
      </div>
      `
        });
        $it('respects bound controller', async function ({ host, platform, app, ctx }) {
            const div1 = host.querySelector('#div1');
            const div2 = host.querySelector('#div2');
            const ca1 = CustomAttribute.for(div1, 'validation-errors').viewModel;
            const ca2 = CustomAttribute.for(div2, 'validation-errors').viewModel;
            const spy1 = createSpy(ca1, 'handleValidationEvent', true);
            const spy2 = createSpy(ca2, 'handleValidationEvent', true);
            const { controllerValidateSpy, controller, controller2ValidateSpy, controller2 } = app;
            // assert that things are correctly wired up
            assertSubscriber(controller, ca1);
            assertSubscriber(controller2, ca2);
            const target1 = div1.querySelector('#target1');
            const target2 = div2.querySelector('#target2');
            await assertEventHandler(target1, platform, controllerValidateSpy, spy1, ctx);
            target2.value = 'foo';
            target2.dispatchEvent(new ctx.Event('change'));
            await assertEventHandler(target2, platform, controller2ValidateSpy, spy2, ctx);
            // assert that errors are rendered in the respective containers
            let errors1 = ca1.errors;
            assert.deepEqual(app['nameErrors'], errors1);
            assert.equal(errors1.length, 1);
            assert.deepEqual(errors1[0].targets, [target1]);
            let errors2 = ca2.errors;
            assert.deepEqual(app['ageErrors'], errors2);
            assert.equal(errors2.length, 2);
            assert.deepEqual(errors2[0].targets, [target2]);
            assert.deepEqual(errors2[1].targets, [target2]);
            assert.html.textContent(div1.querySelector('span.error'), 'Name is required.');
            assert.deepEqual(toArray(div2.querySelectorAll('span.error'))
                .map((span) => getVisibleText(span, true)), ['Age is required.', 'Age is not fizbaz']);
            // assert that errors are removed
            target1.value = 'foo';
            target1.dispatchEvent(new ctx.Event('change'));
            await assertEventHandler(target1, platform, controllerValidateSpy, spy1, ctx);
            target2.value = '15';
            target2.dispatchEvent(new ctx.Event('change'));
            await assertEventHandler(target2, platform, controller2ValidateSpy, spy2, ctx);
            errors1 = ca1.errors;
            assert.equal(errors1.length, 0);
            assert.equal(div1.querySelectorAll('span.error').length, 0);
            errors2 = ca2.errors;
            assert.equal(errors2.length, 0);
            assert.equal(div2.querySelectorAll('span.error').length, 0);
        }, {
            template: `
      <div id="div1" validation-errors="errors.bind: nameErrors; controller.bind: controller;">
        <input id="target1" type="text" value.two-way="person.name & validate:'focusout':controller">
        <span class="error" repeat.for="errorInfo of nameErrors">
          \${errorInfo.result.message}
        </span>
      </div>
      <div id="div2" validation-errors="errors.bind: ageErrors; controller.bind: controller2;">
        <input id="target2" type="text" value.two-way="person.age | toNumber & validate:'focusout':controller2">
        <span class="error" repeat.for="errorInfo of ageErrors">
          \${errorInfo.result.message}
        </span>
      </div>
      `,
            removeSubscriberSpies: { controllerRemoveSubscriberSpy: 2, controller2RemoveSubscriberSpy: 2 }
        });
        $it('does not put the errors in VM when used with let', async function ({ host, platform, app, ctx }) {
            const div = host.querySelector('div');
            const ca = CustomAttribute.for(div, 'validation-errors').viewModel;
            const spy = createSpy(ca, 'handleValidationEvent', true);
            const { controllerValidateSpy, controller } = app;
            assertSubscriber(controller, ca);
            const target = div.querySelector('#target1');
            await assertEventHandler(target, platform, controllerValidateSpy, spy, ctx);
            const errors1 = ca.errors;
            assert.equal('errors' in app, false);
            assert.equal(errors1.length, 1);
            assert.deepEqual(errors1[0].targets, [target]);
            assert.html.textContent(div.querySelector('span.error'), 'Name is required.');
        }, {
            template: `
      <let errors.bind="undefined"></let>
      <div id="div" validation-errors.bind="errors">
        <input id="target1" type="text" value.two-way="person.name & validate">
        <span class="error" repeat.for="errorInfo of errors">
          \${errorInfo.result.message}
        </span>
      </div>
      `
        });
        it('can be used without any available registration for scoped controller', async function () {
            let App1 = (() => {
                let _classDecorators = [customElement({
                        name: 'app',
                        template: `
      <div id="div1" validation-errors="errors.bind: nameErrors; controller.bind: controller;">
        <input id="target1" type="text" value.two-way="person.name & validate:undefined:controller">
        <span class="error" repeat.for="errorInfo of nameErrors">
          \${errorInfo.result.message}
        </span>
      </div>
      `
                    })];
                let _classDescriptor;
                let _classExtraInitializers = [];
                let _classThis;
                var App1 = _classThis = class {
                    constructor() {
                        this.person = new Person((void 0), (void 0));
                        this.controller = resolve(newInstanceOf(IValidationController));
                        this.validationRules = resolve(IValidationRules);
                        this.controllerValidateSpy = createSpy(this.controller, 'validate', true);
                        this.validationRules
                            .on(this.person)
                            .ensure('name')
                            .required();
                    }
                    unbinding() {
                        this.validationRules.off();
                    }
                };
                __setFunctionName(_classThis, "App1");
                (() => {
                    const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
                    __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
                    App1 = _classThis = _classDescriptor.value;
                    if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
                    __runInitializers(_classThis, _classExtraInitializers);
                })();
                return App1 = _classThis;
            })();
            const ctx = TestContext.create();
            const container = ctx.container;
            const host = ctx.doc.createElement('app');
            ctx.doc.body.appendChild(host);
            const au = new Aurelia(container).register(ValidationHtmlConfiguration);
            await au
                .app({ host, component: App1 })
                .start();
            const app = au.root.controller.viewModel;
            const platform = container.get(IPlatform);
            const div1 = host.querySelector('#div1');
            const ca1 = CustomAttribute.for(div1, 'validation-errors').viewModel;
            const spy1 = createSpy(ca1, 'handleValidationEvent', true);
            const { controllerValidateSpy, controller } = app;
            // assert that things are correctly wired up
            assertSubscriber(controller, ca1);
            assert.equal(ca1['scopedController'], null);
            assert.notEqual(ca1['scopedController'], controller);
            const target1 = div1.querySelector('#target1');
            await assertEventHandler(target1, platform, controllerValidateSpy, spy1, ctx);
            // assert that errors are rendered in the respective containers
            let errors1 = ca1.errors;
            assert.deepEqual(app['nameErrors'], errors1);
            assert.equal(errors1.length, 1);
            assert.deepEqual(errors1[0].targets, [target1]);
            assert.html.textContent(div1.querySelector('span.error'), 'Name is required.');
            // assert that errors are removed
            target1.value = 'foo';
            target1.dispatchEvent(new ctx.Event('change'));
            await assertEventHandler(target1, platform, controllerValidateSpy, spy1, ctx);
            errors1 = ca1.errors;
            assert.equal(errors1.length, 0);
            assert.equal(div1.querySelectorAll('span.error').length, 0);
            await au.stop();
            ctx.doc.body.removeChild(host);
            au.dispose();
        });
    });
});
//# sourceMappingURL=validation-errors-custom-attribute.spec.js.map