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
import { Aurelia, customElement } from '@aurelia/runtime-html';
import { runTasks, tasksSettled } from '@aurelia/runtime';
import { assert, TestContext } from '@aurelia/testing';
function createFixture() {
    const ctx = TestContext.create();
    const au = new Aurelia(ctx.container);
    const host = ctx.createElement('div');
    const p = ctx.platform;
    return { au, host, p };
}
describe('3-runtime-html/show.integration.spec.ts', function () {
    describe('show/hide alias works properly', function () {
        it('show + hide', async function () {
            const { au, host } = createFixture();
            let App = (() => {
                let _classDecorators = [customElement({ name: 'app', template: '<div show.bind="show"></div><div hide.bind="hide"></div>' })];
                let _classDescriptor;
                let _classExtraInitializers = [];
                let _classThis;
                var App = _classThis = class {
                    constructor() {
                        this.show = true;
                        this.appliedShow = true;
                        this.hide = false;
                        this.appliedHide = false;
                    }
                    created() {
                        this.showDiv = this.$controller.nodes.firstChild;
                        this.hideDiv = this.$controller.nodes.lastChild;
                    }
                    assert(label) {
                        if (this.appliedShow) {
                            assert.strictEqual(this.showDiv.style.getPropertyValue('display'), '', `display should be '' at ${label} (show is ${this.show}, appliedShow is ${this.appliedShow})`);
                            assert.strictEqual(this.showDiv.style.getPropertyPriority('display'), '', `priority should be '' at ${label} (show is ${this.show}, appliedShow is ${this.appliedShow})`);
                        }
                        else {
                            assert.strictEqual(this.showDiv.style.getPropertyValue('display'), 'none', `display should be 'none' at ${label} (show is ${this.show}, appliedShow is ${this.appliedShow})`);
                            assert.strictEqual(this.showDiv.style.getPropertyPriority('display'), 'important', `priority should be 'important' at ${label} (show is ${this.show}, appliedShow is ${this.appliedShow})`);
                        }
                        if (this.appliedHide) {
                            assert.strictEqual(this.hideDiv.style.getPropertyValue('display'), 'none', `display should be 'none' at ${label} (hide is ${this.hide}, appliedHide is ${this.appliedHide})`);
                            assert.strictEqual(this.hideDiv.style.getPropertyPriority('display'), 'important', `priority should be 'important' at ${label} (hide is ${this.hide}, appliedHide is ${this.appliedHide})`);
                        }
                        else {
                            assert.strictEqual(this.hideDiv.style.getPropertyValue('display'), '', `display should be '' at ${label} (hide is ${this.hide}, appliedHide is ${this.appliedHide})`);
                            assert.strictEqual(this.hideDiv.style.getPropertyPriority('display'), '', `priority should be '' at ${label} (hide is ${this.hide}, appliedHide is ${this.appliedHide})`);
                        }
                    }
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
            const component = new App();
            au.app({ host, component });
            await au.start();
            component.show = false;
            component.hide = true;
            component.assert(`started after mutating`);
            await tasksSettled();
            component.appliedShow = false;
            component.appliedHide = true;
            component.assert(`started after flushing dom writes`);
            await au.stop();
        });
        it('hide + show', async function () {
            const { au, host } = createFixture();
            let App = (() => {
                let _classDecorators = [customElement({ name: 'app', template: '<div hide.bind="hide"></div><div show.bind="show"></div>' })];
                let _classDescriptor;
                let _classExtraInitializers = [];
                let _classThis;
                var App = _classThis = class {
                    constructor() {
                        this.show = true;
                        this.appliedShow = true;
                        this.hide = false;
                        this.appliedHide = false;
                    }
                    created() {
                        this.hideDiv = this.$controller.nodes.firstChild;
                        this.showDiv = this.$controller.nodes.lastChild;
                    }
                    assert(label) {
                        if (this.appliedShow) {
                            assert.strictEqual(this.showDiv.style.getPropertyValue('display'), '', `display should be '' at ${label} (show is ${this.show}, appliedShow is ${this.appliedShow})`);
                            assert.strictEqual(this.showDiv.style.getPropertyPriority('display'), '', `priority should be '' at ${label} (show is ${this.show}, appliedShow is ${this.appliedShow})`);
                        }
                        else {
                            assert.strictEqual(this.showDiv.style.getPropertyValue('display'), 'none', `display should be 'none' at ${label} (show is ${this.show}, appliedShow is ${this.appliedShow})`);
                            assert.strictEqual(this.showDiv.style.getPropertyPriority('display'), 'important', `priority should be 'important' at ${label} (show is ${this.show}, appliedShow is ${this.appliedShow})`);
                        }
                        if (this.appliedHide) {
                            assert.strictEqual(this.hideDiv.style.getPropertyValue('display'), 'none', `display should be 'none' at ${label} (hide is ${this.hide}, appliedHide is ${this.appliedHide})`);
                            assert.strictEqual(this.hideDiv.style.getPropertyPriority('display'), 'important', `priority should be 'important' at ${label} (hide is ${this.hide}, appliedHide is ${this.appliedHide})`);
                        }
                        else {
                            assert.strictEqual(this.hideDiv.style.getPropertyValue('display'), '', `display should be '' at ${label} (hide is ${this.hide}, appliedHide is ${this.appliedHide})`);
                            assert.strictEqual(this.hideDiv.style.getPropertyPriority('display'), '', `priority should be '' at ${label} (hide is ${this.hide}, appliedHide is ${this.appliedHide})`);
                        }
                    }
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
            const component = new App();
            au.app({ host, component });
            await au.start();
            component.show = false;
            component.hide = true;
            component.assert(`started after mutating`);
            await tasksSettled();
            component.appliedShow = false;
            component.appliedHide = true;
            component.assert(`started after flushing dom writes`);
            await au.stop();
        });
    });
    for (const style of [
        {
            tag: 'style="display:block"',
            display: 'block',
        },
        {
            tag: '',
            display: '',
        }
    ]) {
        // Invert value during 'attaching' hook
        for (const attaching of [true, false]) {
            // Invert value during 'attached' hook
            for (const attached of [true, false]) {
                // Invert value during 'detaching' hook
                for (const detaching of [true, false]) {
                    // Invert value during 'unbinding' hook
                    for (const unbinding of [true, false]) {
                        describe('show', function () {
                            // Initial value
                            for (const show of [true, false]) {
                                it(`display:'${style.display}',show:${show},attaching:${attaching},attached:${attached},detaching:${detaching},unbinding:${unbinding}`, async function () {
                                    const { au, host } = createFixture();
                                    let run = 1;
                                    let App = (() => {
                                        let _classDecorators = [customElement({ name: 'app', template: `<div ${style.tag} show.bind="show"></div>` })];
                                        let _classDescriptor;
                                        let _classExtraInitializers = [];
                                        let _classThis;
                                        var App = _classThis = class {
                                            constructor() {
                                                this.show = show;
                                                this.appliedShow = true;
                                            }
                                            created() {
                                                this.div = this.$controller.nodes.firstChild;
                                            }
                                            // No need to invert during 'binding' or 'bound' because child controller activation happens after 'attaching',
                                            // so these would never affect the test outcomes.
                                            binding() {
                                                this.assert(`binding (run ${run})`);
                                            }
                                            bound() {
                                                this.assert(`bound (run ${run})`);
                                            }
                                            attaching() {
                                                this.assert(`attaching initial (run ${run})`);
                                                if (attaching) {
                                                    this.show = !this.show;
                                                    this.assert(`attaching after mutating (run ${run})`);
                                                }
                                            }
                                            attached() {
                                                this.appliedShow = this.show;
                                                this.assert(`attached initial (run ${run})`);
                                                if (attached) {
                                                    this.show = !this.show;
                                                    this.assert(`attached after mutating (run ${run})`);
                                                }
                                                runTasks();
                                                this.appliedShow = this.show;
                                                this.assert(`attached after flushing dom writes (run ${run})`);
                                            }
                                            detaching() {
                                                this.assert(`detaching initial (run ${run})`);
                                                if (detaching) {
                                                    this.show = !this.show;
                                                    this.assert(`detaching after mutating (run ${run})`);
                                                }
                                            }
                                            unbinding() {
                                                this.assert(`unbinding initial (run ${run})`);
                                                if (unbinding) {
                                                    this.show = !this.show;
                                                    this.assert(`unbinding after mutating (run ${run})`);
                                                }
                                            }
                                            assert(label) {
                                                if (this.appliedShow) {
                                                    assert.strictEqual(this.div.style.getPropertyValue('display'), style.display, `display should be '' at ${label} (show is ${this.show}, appliedShow is ${this.appliedShow})`);
                                                    assert.strictEqual(this.div.style.getPropertyPriority('display'), '', `priority should be '' at ${label} (show is ${this.show}, appliedShow is ${this.appliedShow})`);
                                                }
                                                else {
                                                    assert.strictEqual(this.div.style.getPropertyValue('display'), 'none', `display should be 'none' at ${label} (show is ${this.show}, appliedShow is ${this.appliedShow})`);
                                                    assert.strictEqual(this.div.style.getPropertyPriority('display'), 'important', `priority should be 'important' at ${label} (show is ${this.show}, appliedShow is ${this.appliedShow})`);
                                                }
                                            }
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
                                    const component = new App();
                                    au.app({ host, component });
                                    await au.start();
                                    component.show = !component.show;
                                    component.assert(`started after mutating (run ${run})`);
                                    await tasksSettled();
                                    component.appliedShow = component.show;
                                    component.assert(`started after flushing dom writes (run ${run})`);
                                    await au.stop();
                                    ++run;
                                    await au.start();
                                    component.show = !component.show;
                                    component.assert(`started after mutating (run ${run})`);
                                    await tasksSettled();
                                    component.appliedShow = component.show;
                                    component.assert(`started after flushing dom writes (run ${run})`);
                                    await au.stop();
                                });
                            }
                        });
                        describe('hide', function () {
                            for (const hide of [true, false]) {
                                it(`display:'${style.display}',hide:${hide},attaching:${attaching},attached:${attached},detaching:${detaching},unbinding:${unbinding}`, async function () {
                                    const { au, host } = createFixture();
                                    let run = 1;
                                    let App = (() => {
                                        let _classDecorators = [customElement({ name: 'app', template: `<div ${style.tag} hide.bind="hide"></div>` })];
                                        let _classDescriptor;
                                        let _classExtraInitializers = [];
                                        let _classThis;
                                        var App = _classThis = class {
                                            constructor() {
                                                this.hide = hide;
                                                this.appliedHide = false;
                                            }
                                            created() {
                                                this.div = this.$controller.nodes.firstChild;
                                            }
                                            // No need to invert during 'binding' or 'bound' because child controller activation happens after 'attaching',
                                            // so these would never affect the test outcomes.
                                            binding() {
                                                this.assert(`binding (run ${run})`);
                                            }
                                            bound() {
                                                this.assert(`bound (run ${run})`);
                                            }
                                            attaching() {
                                                this.assert(`attaching initial (run ${run})`);
                                                if (attaching) {
                                                    this.hide = !this.hide;
                                                    this.assert(`attaching after mutating (run ${run})`);
                                                }
                                            }
                                            attached() {
                                                this.appliedHide = this.hide;
                                                this.assert(`attached initial (run ${run})`);
                                                if (attached) {
                                                    this.hide = !this.hide;
                                                    this.assert(`attached after mutating (run ${run})`);
                                                }
                                                runTasks();
                                                this.appliedHide = this.hide;
                                                this.assert(`attached after flushing dom writes (run ${run})`);
                                            }
                                            detaching() {
                                                this.assert(`detaching initial (run ${run})`);
                                                if (detaching) {
                                                    this.hide = !this.hide;
                                                    this.assert(`detaching after mutating (run ${run})`);
                                                }
                                            }
                                            unbinding() {
                                                this.assert(`unbinding initial (run ${run})`);
                                                if (unbinding) {
                                                    this.hide = !this.hide;
                                                    this.assert(`unbinding after mutating (run ${run})`);
                                                }
                                            }
                                            assert(label) {
                                                if (this.appliedHide) {
                                                    assert.strictEqual(this.div.style.getPropertyValue('display'), 'none', `display should be 'none' at ${label} (hide is ${this.hide}, appliedHide is ${this.appliedHide})`);
                                                    assert.strictEqual(this.div.style.getPropertyPriority('display'), 'important', `priority should be 'important' at ${label} (hide is ${this.hide}, appliedHide is ${this.appliedHide})`);
                                                }
                                                else {
                                                    assert.strictEqual(this.div.style.getPropertyValue('display'), style.display, `display should be '' at ${label} (hide is ${this.hide}, appliedHide is ${this.appliedHide})`);
                                                    assert.strictEqual(this.div.style.getPropertyPriority('display'), '', `priority should be '' at ${label} (hide is ${this.hide}, appliedHide is ${this.appliedHide})`);
                                                }
                                            }
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
                                    const component = new App();
                                    au.app({ host, component });
                                    await au.start();
                                    component.hide = !component.hide;
                                    component.assert(`started after mutating (run ${run})`);
                                    await tasksSettled();
                                    component.appliedHide = component.hide;
                                    component.assert(`started after flushing dom writes (run ${run})`);
                                    await au.stop();
                                    ++run;
                                    await au.start();
                                    component.hide = !component.hide;
                                    component.assert(`started after mutating (run ${run})`);
                                    await tasksSettled();
                                    component.appliedHide = component.hide;
                                    component.assert(`started after flushing dom writes (run ${run})`);
                                    await au.stop();
                                });
                            }
                        });
                    }
                }
            }
        }
    }
    // it.only('test', async function () {
    //   const ctx = TestContext.create();
    //   const { container } = ctx;
    //   const child = container.createChild();
    // });
});
//# sourceMappingURL=show.integration.spec.js.map