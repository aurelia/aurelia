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
import { delegateSyntax } from '@aurelia/compat-v1';
import { newInstanceForScope, Registration, resolve } from '@aurelia/kernel';
import { IRouter, route, RouterConfiguration } from '@aurelia/router';
import { Aurelia, CustomAttribute, CustomElement, customElement, IHistory, ILocation, IPlatform, } from '@aurelia/runtime-html';
import { assert, MockBrowserHistoryLocation, TestContext } from '@aurelia/testing';
import { IValidationRules } from '@aurelia/validation';
import { IValidationController, ValidationHtmlConfiguration } from '@aurelia/validation-html';
import { createSpecFunction } from '../util.js';
import { Person } from '../validation/_test-resources.js';
import { tasksSettled } from '@aurelia/runtime';
describe('validation-html/validation-router.integration.spec.ts', function () {
    describe('integration', function () {
        let ViewWithValidation = (() => {
            let _classDecorators = [customElement({
                    name: 'view-with-val',
                    template: `<form submit.trigger="submit($event)">
        <div id="container" validation-errors.from-view="errors">
          <input id="name" type="text" value.bind="person.name & validate">
          <div id="errors">
            <span repeat.for="error of errors">\${error.result.message}</span>
          </div>
        </div>
        <button id="submit" click.trigger="submit($event)"></button>
      </form>`,
                })];
            let _classDescriptor;
            let _classExtraInitializers = [];
            let _classThis;
            var ViewWithValidation = _classThis = class {
                constructor() {
                    this.validationController = resolve(newInstanceForScope(IValidationController));
                    this.router = resolve(IRouter);
                    resolve(IValidationRules).on(this.person = new Person(void 0, void 0))
                        .ensure('name')
                        .required();
                }
                async submit(event) {
                    event.preventDefault();
                    event.stopPropagation();
                    if (!(await this.validationController.validate()).valid) {
                        return;
                    }
                    await this.router.load('redirecting-view');
                }
            };
            __setFunctionName(_classThis, "ViewWithValidation");
            (() => {
                const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
                __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
                ViewWithValidation = _classThis = _classDescriptor.value;
                if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
                __runInitializers(_classThis, _classExtraInitializers);
            })();
            return ViewWithValidation = _classThis;
        })();
        let RedirectingView = (() => {
            let _classDecorators = [customElement({
                    name: 'redirecting-view',
                    template: `<button id="navigate" click.delegate="navigate()"></button>`
                })];
            let _classDescriptor;
            let _classExtraInitializers = [];
            let _classThis;
            var RedirectingView = _classThis = class {
                constructor() {
                    this.router = resolve(IRouter);
                }
                async navigate() {
                    await this.router.load('view-with-val');
                }
            };
            __setFunctionName(_classThis, "RedirectingView");
            (() => {
                const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
                __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
                RedirectingView = _classThis = _classDescriptor.value;
                if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
                __runInitializers(_classThis, _classExtraInitializers);
            })();
            return RedirectingView = _classThis;
        })();
        let App = (() => {
            let _classDecorators = [customElement({
                    name: 'app',
                    template: '<au-viewport></au-viewport>'
                }), route({
                    routes: [
                        { path: ['', 'view-with-val'], component: ViewWithValidation },
                        { path: 'redirecting-view', component: RedirectingView },
                    ]
                })];
            let _classDescriptor;
            let _classExtraInitializers = [];
            let _classThis;
            var App = _classThis = class {
            };
            __setFunctionName(_classThis, "App");
            (() => {
                const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
                __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
                App = _classThis = _classDescriptor.value;
                if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
                __runInitializers(_classThis, _classExtraInitializers);
            })();
            return App = _classThis;
        })();
        async function runTest(testFunction) {
            const ctx = TestContext.create();
            const container = ctx.container;
            const host = ctx.doc.createElement('div');
            ctx.doc.body.appendChild(host);
            const au = new Aurelia(container);
            const mockBrowserHistoryLocation = new MockBrowserHistoryLocation();
            await au
                .register(Registration.instance(IHistory, mockBrowserHistoryLocation), Registration.instance(ILocation, mockBrowserHistoryLocation), RouterConfiguration, ValidationHtmlConfiguration, delegateSyntax, ViewWithValidation, RedirectingView)
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
                const vm = CustomElement.for(node).viewModel;
                const attr = CustomAttribute.for(node.querySelector('#container'), 'validation-errors').viewModel;
                assert.strictEqual(vm.validationController, attr.controller, 'controller');
            }
            assertController();
            const input = host.querySelector('#name');
            assert.notEqual(input, null, 'input');
            assert.strictEqual(host.querySelector('#navigate'), null, 'navigate');
            let submit = host.querySelector('#submit');
            assert.notEqual(submit, null, 'submit');
            submit.click();
            await tasksSettled();
            // step#1: validation error
            assert.html.textContent('#errors', 'Name is required.', 'error', host);
            // step#2: valid value and navigate
            input.value = 'foo';
            input.dispatchEvent(new ctx.Event('change'));
            await tasksSettled();
            submit.click();
            await tasksSettled();
            // step#3: go back
            const navigate = host.querySelector('#navigate');
            assert.notEqual(navigate, null, 'navigate');
            assert.strictEqual(host.querySelector('#name'), null, 'input');
            assert.strictEqual(host.querySelector('#submit'), null, 'submit');
            navigate.click();
            // step#4: validate
            assertController();
            submit = host.querySelector('#submit');
            assert.notEqual(submit, null, 'submit');
            submit.click();
            await tasksSettled();
            assert.html.textContent('#errors', 'Name is required.', 'error', host);
        });
    });
});
//# sourceMappingURL=validation-router.integration.spec.js.map