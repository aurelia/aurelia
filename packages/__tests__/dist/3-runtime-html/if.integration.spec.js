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
import { CustomAttribute, customElement, } from '@aurelia/runtime-html';
import { tasksSettled } from '@aurelia/runtime';
import { assert, createFixture } from '@aurelia/testing';
describe(`3-runtime-html/if.integration.spec.ts`, function () {
    class EventLog {
        constructor() {
            this.events = [];
        }
        log(event) {
            this.events.push(event);
        }
    }
    describe('with caching', function () {
        it('disables cache with "false" string', async function () {
            let callCount = 0;
            const { appHost, component, tearDown } = await createFixture(`<div if="value.bind: condition; cache: false" abc>hello`, class App {
                constructor() {
                    this.condition = true;
                }
            }, [CustomAttribute.define('abc', class Abc {
                    constructor() {
                        callCount++;
                    }
                })]).started;
            assert.visibleTextEqual(appHost, 'hello');
            assert.strictEqual(callCount, 1);
            component.condition = false;
            assert.visibleTextEqual(appHost, '');
            component.condition = true;
            assert.visibleTextEqual(appHost, 'hello');
            assert.strictEqual(callCount, 2);
            await tearDown();
            assert.visibleTextEqual(appHost, '');
        });
        for (const falsyValue of [null, undefined, 0, NaN, false]) {
            it(`disables cache with fasly value: "${falsyValue}" string`, async function () {
                let callCount = 0;
                const { appHost, component, tearDown } = await createFixture(`<div if="value.bind: condition; cache.bind: ${falsyValue}" abc>hello`, class App {
                    constructor() {
                        this.condition = true;
                    }
                }, [CustomAttribute.define('abc', class Abc {
                        constructor() {
                            callCount++;
                        }
                    })]).started;
                assert.visibleTextEqual(appHost, 'hello');
                assert.strictEqual(callCount, 1);
                component.condition = false;
                assert.visibleTextEqual(appHost, '');
                component.condition = true;
                assert.visibleTextEqual(appHost, 'hello');
                assert.strictEqual(callCount, 2);
                await tearDown();
                assert.visibleTextEqual(appHost, '');
            });
        }
        it('disables cache on [else]', async function () {
            let callCount = 0;
            const { appHost, component, tearDown } = await createFixture(`<div if="value.bind: condition; cache: false" abc>hello</div><div else abc>world</div>`, class App {
                constructor() {
                    this.condition = true;
                }
            }, [CustomAttribute.define('abc', class Abc {
                    constructor() {
                        callCount++;
                    }
                })]).started;
            assert.visibleTextEqual(appHost, 'hello');
            assert.strictEqual(callCount, 1);
            component.condition = false;
            assert.visibleTextEqual(appHost, 'world');
            assert.strictEqual(callCount, 2);
            component.condition = true;
            assert.visibleTextEqual(appHost, 'hello');
            assert.strictEqual(callCount, 3);
            component.condition = false;
            assert.visibleTextEqual(appHost, 'world');
            assert.strictEqual(callCount, 4);
            await tearDown();
            assert.visibleTextEqual(appHost, '');
        });
        it('does not affected nested [if]', async function () {
            let callCount = 0;
            const { appHost, component, tearDown } = await createFixture(`<div if="value.bind: condition; cache: false" abc>hello<span if.bind="condition2" abc> span`, class App {
                constructor() {
                    this.condition = true;
                    this.condition2 = true;
                }
            }, [CustomAttribute.define('abc', class Abc {
                    constructor() {
                        callCount++;
                    }
                })]).started;
            assert.visibleTextEqual(appHost, 'hello span');
            assert.strictEqual(callCount, 2);
            // change to false
            component.condition2 = false;
            assert.visibleTextEqual(appHost, 'hello');
            // then true again
            component.condition2 = true;
            assert.visibleTextEqual(appHost, 'hello span');
            // wouldn't create another view
            assert.strictEqual(callCount, 2);
            component.condition = false;
            assert.visibleTextEqual(appHost, '');
            component.condition = true;
            assert.visibleTextEqual(appHost, 'hello span');
            assert.strictEqual(callCount, 4);
            await tearDown();
            assert.visibleTextEqual(appHost, '');
        });
        it('works on subsequent activation when nested inside other [if]', async function () {
            let callCount = 0;
            const { appHost, component, tearDown } = await createFixture(`<div if.bind="condition" abc>hello<span if="value.bind: condition2; cache: false" abc> span`, class App {
                constructor() {
                    this.condition = true;
                    this.condition2 = true;
                }
            }, [CustomAttribute.define('abc', class Abc {
                    constructor() {
                        callCount++;
                    }
                })]).started;
            assert.visibleTextEqual(appHost, 'hello span');
            assert.strictEqual(callCount, 2);
            // change to false
            component.condition2 = false;
            assert.visibleTextEqual(appHost, 'hello');
            // then true again
            component.condition2 = true;
            assert.visibleTextEqual(appHost, 'hello span');
            // wouldn't create another view
            assert.strictEqual(callCount, 3);
            component.condition = false;
            assert.visibleTextEqual(appHost, '');
            component.condition = true;
            assert.visibleTextEqual(appHost, 'hello span');
            assert.strictEqual(callCount, 4);
            await tearDown();
            assert.visibleTextEqual(appHost, '');
        });
        it('works with interpolation as only child of <template>', async function () {
            const { assertText, component, tearDown } = createFixture('<div><template if.bind="on">${name}</template>', { on: false, name: 'a' });
            assertText('');
            component.on = true;
            await tasksSettled();
            assertText('a');
            void tearDown();
            assertText('');
        });
        it('works with interpolation + leading + trailing text inside template', async function () {
            const { assertText, component, tearDown } = createFixture('<div><template if.bind="on">hey ${name}</template>', { on: false, name: 'a' });
            assertText('');
            component.on = true;
            await tasksSettled();
            assertText('hey a');
            void tearDown();
            assertText('');
        });
        it('works with interpolation as only child of <template> + else', async function () {
            const { assertText, component, tearDown } = createFixture('<template if.bind="on">${name}</template><template else>${name + 1}</template>', { on: false, name: 'a' });
            assertText('a1');
            component.on = true;
            await tasksSettled();
            assertText('a');
            void tearDown();
            assertText('');
        });
        {
            let CeOne = (() => {
                let _classDecorators = [customElement({ name: 'c-1', template: 'c-1' })];
                let _classDescriptor;
                let _classExtraInitializers = [];
                let _classThis;
                var CeOne = _classThis = class {
                    constructor(log) {
                        this.log = log;
                    }
                    binding(_initiator, _parent) {
                        this.log.log('c-1 binding enter');
                        const id = CeOne.id;
                        CeOne.id++;
                        if (id % 2 === 0)
                            throw new Error('Synthetic test error');
                        this.log.log('c-1 binding leave');
                    }
                };
                __setFunctionName(_classThis, "CeOne");
                (() => {
                    const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
                    __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
                    CeOne = _classThis = _classDescriptor.value;
                    if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
                })();
                _classThis.id = 0;
                _classThis.inject = [EventLog];
                (() => {
                    __runInitializers(_classThis, _classExtraInitializers);
                })();
                return CeOne = _classThis;
            })();
            class Root {
                constructor() {
                    this.showC1 = false;
                }
            }
            it('Once an activation errs, further successful activation of the same elements is still possible - without else', async function () {
                const { component, appHost, container, stop } = createFixture(`<c-1 if.bind="showC1"></c-1>`, Root, [EventLog, CeOne]);
                const eventLog = container.get(EventLog);
                assert.html.textContent(appHost, '', 'init');
                assert.deepStrictEqual(eventLog.events, [], 'init log');
                // trigger component activation - expect error
                await activateC1(false, 1);
                // deactivate c-1
                await deactivateC1(2);
                // activate c-1 again - expect success
                await activateC1(true, 3);
                // deactivate c-1
                await deactivateC1(4);
                // activate c-1 again - expect error
                await activateC1(false, 5);
                // deactivate c-1
                await deactivateC1(6);
                // activate c-1 again - expect success
                await activateC1(true, 7);
                await stop();
                async function deactivateC1(round) {
                    eventLog.events.length = 0;
                    component.showC1 = false;
                    await tasksSettled();
                    assert.html.textContent(appHost, '', `round#${round} - c-1 deactivation - DOM`);
                    assert.deepStrictEqual(eventLog.events, [], `round#${round} - c-1 deactivation - log`);
                }
                async function activateC1(success, round) {
                    try {
                        eventLog.events.length = 0;
                        component.showC1 = true;
                        if (!success)
                            assert.fail(`round#${round} - c-1 activation should have failed`);
                    }
                    catch (e) {
                        if (success)
                            throw e;
                    }
                    assert.html.textContent(appHost, success ? 'c-1' : '', `round#${round} - c-1 activation triggered - DOM`);
                    assert.deepStrictEqual(eventLog.events, ['c-1 binding enter', ...(success ? ['c-1 binding leave'] : [])], `round#${round} - c-1 activation triggered - log`);
                }
            });
        }
        {
            let CeOne = (() => {
                let _classDecorators = [customElement({ name: 'c-1', template: 'c-1' })];
                let _classDescriptor;
                let _classExtraInitializers = [];
                let _classThis;
                var CeOne = _classThis = class {
                    constructor(log) {
                        this.log = log;
                    }
                    binding(_initiator, _parent) {
                        this.log.log('c-1 binding enter');
                        const id = CeOne.id;
                        CeOne.id++;
                        if (id % 2 === 0)
                            throw new Error('Synthetic test error');
                        this.log.log('c-1 binding leave');
                    }
                };
                __setFunctionName(_classThis, "CeOne");
                (() => {
                    const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
                    __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
                    CeOne = _classThis = _classDescriptor.value;
                    if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
                })();
                _classThis.id = 0;
                _classThis.inject = [EventLog];
                (() => {
                    __runInitializers(_classThis, _classExtraInitializers);
                })();
                return CeOne = _classThis;
            })();
            let CeTwo = (() => {
                let _classDecorators = [customElement({ name: 'c-2', template: 'c-2' })];
                let _classDescriptor;
                let _classExtraInitializers = [];
                let _classThis;
                var CeTwo = _classThis = class {
                };
                __setFunctionName(_classThis, "CeTwo");
                (() => {
                    const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
                    __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
                    CeTwo = _classThis = _classDescriptor.value;
                    if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
                    __runInitializers(_classThis, _classExtraInitializers);
                })();
                return CeTwo = _classThis;
            })();
            class Root {
                constructor() {
                    this.showC1 = false;
                }
            }
            it('Once an activation errs, further successful activation of the same elements is still possible - with else', async function () {
                const { component, appHost, container, stop } = createFixture(`<c-1 if.bind="showC1"></c-1><c-2 else></c-2>`, Root, [EventLog, CeOne, CeTwo]);
                const eventLog = container.get(EventLog);
                assert.html.textContent(appHost, 'c-2', 'init');
                assert.deepStrictEqual(eventLog.events, [], 'init log');
                // trigger component activation - expect error
                await activateC1(false, 1);
                // deactivate c-1
                await deactivateC1(2);
                // activate c-1 again - expect success
                await activateC1(true, 3);
                // deactivate c-1
                await deactivateC1(4);
                // activate c-1 again - expect error
                await activateC1(false, 5);
                // deactivate c-1
                await deactivateC1(6);
                // activate c-1 again - expect success
                await activateC1(true, 7);
                await stop();
                async function deactivateC1(round) {
                    eventLog.events.length = 0;
                    component.showC1 = false;
                    await tasksSettled();
                    assert.html.textContent(appHost, 'c-2', `round#${round} - c-1 deactivation - DOM`);
                    assert.deepStrictEqual(eventLog.events, [], `round#${round} - c-1 deactivation - log`);
                }
                async function activateC1(success, round) {
                    try {
                        eventLog.events.length = 0;
                        component.showC1 = true;
                        if (!success)
                            assert.fail(`round#${round} - c-1 activation should have failed`);
                    }
                    catch (e) {
                        if (success)
                            throw e;
                    }
                    assert.html.textContent(appHost, success ? 'c-1' : '', `round#${round} - c-1 activation triggered - DOM`);
                    assert.deepStrictEqual(eventLog.events, ['c-1 binding enter', ...(success ? ['c-1 binding leave'] : [])], `round#${round} - c-1 activation triggered - log`);
                }
            });
        }
    });
});
//# sourceMappingURL=if.integration.spec.js.map