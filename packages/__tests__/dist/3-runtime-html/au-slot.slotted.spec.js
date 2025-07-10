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
import { CustomElement, customElement, slotted } from '@aurelia/runtime-html';
import { tasksSettled } from '@aurelia/runtime';
import { assert, createFixture } from '@aurelia/testing';
describe('3-runtime-html/au-slot.slotted.spec.ts', function () {
    describe('intitial rendering', function () {
        it('assigns value', async function () {
            let El = (() => {
                let _classDecorators = [customElement({
                        name: 'el',
                        template: '<au-slot>'
                    })];
                let _classDescriptor;
                let _classExtraInitializers = [];
                let _classThis;
                let _divs_decorators;
                let _divs_initializers = [];
                let _divs_extraInitializers = [];
                var El = _classThis = class {
                    constructor() {
                        this.divs = __runInitializers(this, _divs_initializers, void 0);
                        __runInitializers(this, _divs_extraInitializers);
                    }
                };
                __setFunctionName(_classThis, "El");
                (() => {
                    const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
                    _divs_decorators = [slotted('div')];
                    __esDecorate(null, null, _divs_decorators, { kind: "field", name: "divs", static: false, private: false, access: { has: obj => "divs" in obj, get: obj => obj.divs, set: (obj, value) => { obj.divs = value; } }, metadata: _metadata }, _divs_initializers, _divs_extraInitializers);
                    __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
                    El = _classThis = _classDescriptor.value;
                    if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
                    __runInitializers(_classThis, _classExtraInitializers);
                })();
                return El = _classThis;
            })();
            const { component: { el } } = createFixture('<el component.ref=el><div></div>', class App {
            }, [El,]);
            assert.strictEqual(el.divs.length, 1);
        });
        it('assigns only projected content', async function () {
            let El = (() => {
                let _classDecorators = [customElement({
                        name: 'el',
                        template: '<div>div count: ${divs.length}</div><au-slot>'
                    })];
                let _classDescriptor;
                let _classExtraInitializers = [];
                let _classThis;
                let _divs_decorators;
                let _divs_initializers = [];
                let _divs_extraInitializers = [];
                var El = _classThis = class {
                    constructor() {
                        this.divs = __runInitializers(this, _divs_initializers, void 0);
                        __runInitializers(this, _divs_extraInitializers);
                    }
                };
                __setFunctionName(_classThis, "El");
                (() => {
                    const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
                    _divs_decorators = [slotted('div')];
                    __esDecorate(null, null, _divs_decorators, { kind: "field", name: "divs", static: false, private: false, access: { has: obj => "divs" in obj, get: obj => obj.divs, set: (obj, value) => { obj.divs = value; } }, metadata: _metadata }, _divs_initializers, _divs_extraInitializers);
                    __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
                    El = _classThis = _classDescriptor.value;
                    if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
                    __runInitializers(_classThis, _classExtraInitializers);
                })();
                return El = _classThis;
            })();
            const { assertText } = await createFixture('<el><div></div>', class App {
            }, [El,]).started;
            assertText('div count: 1');
        });
        it('assigns only projected content from matching slot', async function () {
            let El = (() => {
                let _classDecorators = [customElement({
                        name: 'el',
                        template: '<div>div count: ${divs.length}</div><au-slot></au-slot><au-slot name="1">'
                    })];
                let _classDescriptor;
                let _classExtraInitializers = [];
                let _classThis;
                let _divs_decorators;
                let _divs_initializers = [];
                let _divs_extraInitializers = [];
                var El = _classThis = class {
                    constructor() {
                        this.divs = __runInitializers(this, _divs_initializers, void 0);
                        __runInitializers(this, _divs_extraInitializers);
                    }
                };
                __setFunctionName(_classThis, "El");
                (() => {
                    const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
                    _divs_decorators = [slotted('div', '1')];
                    __esDecorate(null, null, _divs_decorators, { kind: "field", name: "divs", static: false, private: false, access: { has: obj => "divs" in obj, get: obj => obj.divs, set: (obj, value) => { obj.divs = value; } }, metadata: _metadata }, _divs_initializers, _divs_extraInitializers);
                    __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
                    El = _classThis = _classDescriptor.value;
                    if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
                    __runInitializers(_classThis, _classExtraInitializers);
                })();
                return El = _classThis;
            })();
            const { assertText } = await createFixture(
            // projecting 3 divs to 2 different slots
            '<el><div au-slot="1"></div><div></div><div></div>', class App {
            }, [El,]).started;
            assertText('div count: 1');
        });
        it('calls change handler', async function () {
            let call = 0;
            let El = (() => {
                let _classDecorators = [customElement({
                        name: 'el',
                        template: '<au-slot>'
                    })];
                let _classDescriptor;
                let _classExtraInitializers = [];
                let _classThis;
                let _divs_decorators;
                let _divs_initializers = [];
                let _divs_extraInitializers = [];
                var El = _classThis = class {
                    divsChanged() {
                        call = 1;
                    }
                    constructor() {
                        this.divs = __runInitializers(this, _divs_initializers, void 0);
                        __runInitializers(this, _divs_extraInitializers);
                    }
                };
                __setFunctionName(_classThis, "El");
                (() => {
                    const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
                    _divs_decorators = [slotted('div')];
                    __esDecorate(null, null, _divs_decorators, { kind: "field", name: "divs", static: false, private: false, access: { has: obj => "divs" in obj, get: obj => obj.divs, set: (obj, value) => { obj.divs = value; } }, metadata: _metadata }, _divs_initializers, _divs_extraInitializers);
                    __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
                    El = _classThis = _classDescriptor.value;
                    if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
                    __runInitializers(_classThis, _classExtraInitializers);
                })();
                return El = _classThis;
            })();
            await createFixture('<el><div></div>', class App {
            }, [El,]).started;
            assert.strictEqual(call, 1);
        });
        it('calls specified change handler', async function () {
            let call = 0;
            let El = (() => {
                let _classDecorators = [customElement({
                        name: 'el',
                        template: '<au-slot>'
                    })];
                let _classDescriptor;
                let _classExtraInitializers = [];
                let _classThis;
                let _divs_decorators;
                let _divs_initializers = [];
                let _divs_extraInitializers = [];
                var El = _classThis = class {
                    changed() {
                        call = 1;
                    }
                    constructor() {
                        this.divs = __runInitializers(this, _divs_initializers, void 0);
                        __runInitializers(this, _divs_extraInitializers);
                    }
                };
                __setFunctionName(_classThis, "El");
                (() => {
                    const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
                    _divs_decorators = [slotted({
                            callback: 'changed'
                        })];
                    __esDecorate(null, null, _divs_decorators, { kind: "field", name: "divs", static: false, private: false, access: { has: obj => "divs" in obj, get: obj => obj.divs, set: (obj, value) => { obj.divs = value; } }, metadata: _metadata }, _divs_initializers, _divs_extraInitializers);
                    __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
                    El = _classThis = _classDescriptor.value;
                    if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
                    __runInitializers(_classThis, _classExtraInitializers);
                })();
                return El = _classThis;
            })();
            await createFixture('<el><div></div>', class App {
            }, [El,]).started;
            assert.strictEqual(call, 1);
        });
        it('does not call change handler if theres no slot', async function () {
            let call = 0;
            let El = (() => {
                let _classDecorators = [customElement({
                        name: 'el',
                        template: ''
                    })];
                let _classDescriptor;
                let _classExtraInitializers = [];
                let _classThis;
                let _divs_decorators;
                let _divs_initializers = [];
                let _divs_extraInitializers = [];
                var El = _classThis = class {
                    divsChanged() {
                        call = 1;
                    }
                    constructor() {
                        this.divs = __runInitializers(this, _divs_initializers, void 0);
                        __runInitializers(this, _divs_extraInitializers);
                    }
                };
                __setFunctionName(_classThis, "El");
                (() => {
                    const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
                    _divs_decorators = [slotted('div')];
                    __esDecorate(null, null, _divs_decorators, { kind: "field", name: "divs", static: false, private: false, access: { has: obj => "divs" in obj, get: obj => obj.divs, set: (obj, value) => { obj.divs = value; } }, metadata: _metadata }, _divs_initializers, _divs_extraInitializers);
                    __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
                    El = _classThis = _classDescriptor.value;
                    if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
                    __runInitializers(_classThis, _classExtraInitializers);
                })();
                return El = _classThis;
            })();
            await createFixture('<el><div></div>', class App {
            }, [El,]).started;
            assert.strictEqual(call, 0);
        });
        it('does not call change handler there are no matching nodes', async function () {
            let call = 0;
            let El = (() => {
                let _classDecorators = [customElement({
                        name: 'el',
                        template: '<au-slot>'
                    })];
                let _classDescriptor;
                let _classExtraInitializers = [];
                let _classThis;
                let _divs_decorators;
                let _divs_initializers = [];
                let _divs_extraInitializers = [];
                var El = _classThis = class {
                    divsChanged() {
                        call = 1;
                    }
                    constructor() {
                        this.divs = __runInitializers(this, _divs_initializers, void 0);
                        __runInitializers(this, _divs_extraInitializers);
                    }
                };
                __setFunctionName(_classThis, "El");
                (() => {
                    const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
                    _divs_decorators = [slotted('div')];
                    __esDecorate(null, null, _divs_decorators, { kind: "field", name: "divs", static: false, private: false, access: { has: obj => "divs" in obj, get: obj => obj.divs, set: (obj, value) => { obj.divs = value; } }, metadata: _metadata }, _divs_initializers, _divs_extraInitializers);
                    __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
                    El = _classThis = _classDescriptor.value;
                    if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
                    __runInitializers(_classThis, _classExtraInitializers);
                })();
                return El = _classThis;
            })();
            await createFixture('<el><input>', class App {
            }, [El,]).started;
            assert.strictEqual(call, 0);
        });
        it('assigns to multiple @slotted properties with same queries', async function () {
            let El = (() => {
                let _classDecorators = [customElement({
                        name: 'el',
                        template: '<au-slot>'
                    })];
                let _classDescriptor;
                let _classExtraInitializers = [];
                let _classThis;
                let _divs_decorators;
                let _divs_initializers = [];
                let _divs_extraInitializers = [];
                let _divs2_decorators;
                let _divs2_initializers = [];
                let _divs2_extraInitializers = [];
                var El = _classThis = class {
                    constructor() {
                        this.divs = __runInitializers(this, _divs_initializers, void 0);
                        this.divs2 = (__runInitializers(this, _divs_extraInitializers), __runInitializers(this, _divs2_initializers, void 0));
                        __runInitializers(this, _divs2_extraInitializers);
                    }
                };
                __setFunctionName(_classThis, "El");
                (() => {
                    const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
                    _divs_decorators = [slotted('div')];
                    _divs2_decorators = [slotted('div')];
                    __esDecorate(null, null, _divs_decorators, { kind: "field", name: "divs", static: false, private: false, access: { has: obj => "divs" in obj, get: obj => obj.divs, set: (obj, value) => { obj.divs = value; } }, metadata: _metadata }, _divs_initializers, _divs_extraInitializers);
                    __esDecorate(null, null, _divs2_decorators, { kind: "field", name: "divs2", static: false, private: false, access: { has: obj => "divs2" in obj, get: obj => obj.divs2, set: (obj, value) => { obj.divs2 = value; } }, metadata: _metadata }, _divs2_initializers, _divs2_extraInitializers);
                    __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
                    El = _classThis = _classDescriptor.value;
                    if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
                    __runInitializers(_classThis, _classExtraInitializers);
                })();
                return El = _classThis;
            })();
            const { component: { el: { divs, divs2 } } } = await createFixture('<el component.ref="el"><div>', class App {
            }, [El,]).started;
            assert.strictEqual(divs.length, 1);
            assert.strictEqual(divs2.length, 1);
        });
        it('assigns to multiple slotted properties with overlapping queries', async function () {
            let El = (() => {
                let _classDecorators = [customElement({
                        name: 'el',
                        template: 'Count: ${divs.length} ${divAndPs.length}<au-slot>'
                    })];
                let _classDescriptor;
                let _classExtraInitializers = [];
                let _classThis;
                let _divs_decorators;
                let _divs_initializers = [];
                let _divs_extraInitializers = [];
                let _divAndPs_decorators;
                let _divAndPs_initializers = [];
                let _divAndPs_extraInitializers = [];
                var El = _classThis = class {
                    constructor() {
                        this.divs = __runInitializers(this, _divs_initializers, void 0);
                        this.divAndPs = (__runInitializers(this, _divs_extraInitializers), __runInitializers(this, _divAndPs_initializers, void 0));
                        __runInitializers(this, _divAndPs_extraInitializers);
                    }
                };
                __setFunctionName(_classThis, "El");
                (() => {
                    const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
                    _divs_decorators = [slotted('div')];
                    _divAndPs_decorators = [slotted('div, p')];
                    __esDecorate(null, null, _divs_decorators, { kind: "field", name: "divs", static: false, private: false, access: { has: obj => "divs" in obj, get: obj => obj.divs, set: (obj, value) => { obj.divs = value; } }, metadata: _metadata }, _divs_initializers, _divs_extraInitializers);
                    __esDecorate(null, null, _divAndPs_decorators, { kind: "field", name: "divAndPs", static: false, private: false, access: { has: obj => "divAndPs" in obj, get: obj => obj.divAndPs, set: (obj, value) => { obj.divAndPs = value; } }, metadata: _metadata }, _divAndPs_initializers, _divAndPs_extraInitializers);
                    __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
                    El = _classThis = _classDescriptor.value;
                    if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
                    __runInitializers(_classThis, _classExtraInitializers);
                })();
                return El = _classThis;
            })();
            const { assertText } = await createFixture('<el><div></div><p>', class App {
            }, [El,]).started;
            assertText('Count: 1 2');
        });
        it('calls change handler of multiple slotted props with overlapping queries', async function () {
            let call1 = 0;
            let call2 = 0;
            let El = (() => {
                let _classDecorators = [customElement({
                        name: 'el',
                        template: 'Count: ${divs.length} ${divAndPs.length}<au-slot>'
                    })];
                let _classDescriptor;
                let _classExtraInitializers = [];
                let _classThis;
                let _divs_decorators;
                let _divs_initializers = [];
                let _divs_extraInitializers = [];
                let _divAndPs_decorators;
                let _divAndPs_initializers = [];
                let _divAndPs_extraInitializers = [];
                var El = _classThis = class {
                    divsChanged() {
                        call1 = 1;
                    }
                    divAndPsChanged() {
                        call2 = 1;
                    }
                    constructor() {
                        this.divs = __runInitializers(this, _divs_initializers, void 0);
                        this.divAndPs = (__runInitializers(this, _divs_extraInitializers), __runInitializers(this, _divAndPs_initializers, void 0));
                        __runInitializers(this, _divAndPs_extraInitializers);
                    }
                };
                __setFunctionName(_classThis, "El");
                (() => {
                    const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
                    _divs_decorators = [slotted('div')];
                    _divAndPs_decorators = [slotted('div, p')];
                    __esDecorate(null, null, _divs_decorators, { kind: "field", name: "divs", static: false, private: false, access: { has: obj => "divs" in obj, get: obj => obj.divs, set: (obj, value) => { obj.divs = value; } }, metadata: _metadata }, _divs_initializers, _divs_extraInitializers);
                    __esDecorate(null, null, _divAndPs_decorators, { kind: "field", name: "divAndPs", static: false, private: false, access: { has: obj => "divAndPs" in obj, get: obj => obj.divAndPs, set: (obj, value) => { obj.divAndPs = value; } }, metadata: _metadata }, _divAndPs_initializers, _divAndPs_extraInitializers);
                    __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
                    El = _classThis = _classDescriptor.value;
                    if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
                    __runInitializers(_classThis, _classExtraInitializers);
                })();
                return El = _classThis;
            })();
            await createFixture('<el><div></div><p>', class App {
            }, [El,]).started;
            assert.deepStrictEqual([call1, call2], [1, 1]);
        });
        it('assigns nodes rendered by repeat', async function () {
            let El = (() => {
                let _classDecorators = [customElement({
                        name: 'el',
                        template: 'Count: ${divs.length} ${divAndPs.length}<au-slot>'
                    })];
                let _classDescriptor;
                let _classExtraInitializers = [];
                let _classThis;
                let _divs_decorators;
                let _divs_initializers = [];
                let _divs_extraInitializers = [];
                let _divAndPs_decorators;
                let _divAndPs_initializers = [];
                let _divAndPs_extraInitializers = [];
                var El = _classThis = class {
                    constructor() {
                        this.divs = __runInitializers(this, _divs_initializers, void 0);
                        this.divAndPs = (__runInitializers(this, _divs_extraInitializers), __runInitializers(this, _divAndPs_initializers, void 0));
                        __runInitializers(this, _divAndPs_extraInitializers);
                    }
                };
                __setFunctionName(_classThis, "El");
                (() => {
                    const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
                    _divs_decorators = [slotted('div')];
                    _divAndPs_decorators = [slotted('div, p')];
                    __esDecorate(null, null, _divs_decorators, { kind: "field", name: "divs", static: false, private: false, access: { has: obj => "divs" in obj, get: obj => obj.divs, set: (obj, value) => { obj.divs = value; } }, metadata: _metadata }, _divs_initializers, _divs_extraInitializers);
                    __esDecorate(null, null, _divAndPs_decorators, { kind: "field", name: "divAndPs", static: false, private: false, access: { has: obj => "divAndPs" in obj, get: obj => obj.divAndPs, set: (obj, value) => { obj.divAndPs = value; } }, metadata: _metadata }, _divAndPs_initializers, _divAndPs_extraInitializers);
                    __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
                    El = _classThis = _classDescriptor.value;
                    if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
                    __runInitializers(_classThis, _classExtraInitializers);
                })();
                return El = _classThis;
            })();
            const { assertText } = await createFixture('<el><div repeat.for="i of 3"></div><p repeat.for="i of 3">', class App {
            }, [El,]).started;
            assertText('Count: 3 6');
        });
        it('assigns all nodes with $all', async function () {
            let El = (() => {
                let _classDecorators = [customElement({
                        name: 'el',
                        template: 'Count: ${nodes.length} <au-slot>'
                    })];
                let _classDescriptor;
                let _classExtraInitializers = [];
                let _classThis;
                let _nodes_decorators;
                let _nodes_initializers = [];
                let _nodes_extraInitializers = [];
                var El = _classThis = class {
                    constructor() {
                        this.nodes = __runInitializers(this, _nodes_initializers, void 0);
                        __runInitializers(this, _nodes_extraInitializers);
                    }
                };
                __setFunctionName(_classThis, "El");
                (() => {
                    const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
                    _nodes_decorators = [slotted('$all')];
                    __esDecorate(null, null, _nodes_decorators, { kind: "field", name: "nodes", static: false, private: false, access: { has: obj => "nodes" in obj, get: obj => obj.nodes, set: (obj, value) => { obj.nodes = value; } }, metadata: _metadata }, _nodes_initializers, _nodes_extraInitializers);
                    __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
                    El = _classThis = _classDescriptor.value;
                    if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
                    __runInitializers(_classThis, _classExtraInitializers);
                })();
                return El = _classThis;
            })();
            const { assertText } = await createFixture('<el>text<div></div><p></p><!--ha-->', class App {
            }, [El,]).started;
            // comments are filtered out by projection slot change notifier
            assertText('Count: 3 text');
        });
        it('assigns all elements with *', async function () {
            let El = (() => {
                let _classDecorators = [customElement({
                        name: 'el',
                        template: 'Count: ${nodes.length} <au-slot>'
                    })];
                let _classDescriptor;
                let _classExtraInitializers = [];
                let _classThis;
                let _nodes_decorators;
                let _nodes_initializers = [];
                let _nodes_extraInitializers = [];
                var El = _classThis = class {
                    constructor() {
                        this.nodes = __runInitializers(this, _nodes_initializers, void 0);
                        __runInitializers(this, _nodes_extraInitializers);
                    }
                };
                __setFunctionName(_classThis, "El");
                (() => {
                    const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
                    _nodes_decorators = [slotted('*')];
                    __esDecorate(null, null, _nodes_decorators, { kind: "field", name: "nodes", static: false, private: false, access: { has: obj => "nodes" in obj, get: obj => obj.nodes, set: (obj, value) => { obj.nodes = value; } }, metadata: _metadata }, _nodes_initializers, _nodes_extraInitializers);
                    __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
                    El = _classThis = _classDescriptor.value;
                    if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
                    __runInitializers(_classThis, _classExtraInitializers);
                })();
                return El = _classThis;
            })();
            const { assertText } = await createFixture('<el>text<div></div><p>', class App {
            }, [El,]).started;
            assertText('Count: 2 text');
        });
        it('works with slots when there are elements in between', async function () {
            let El = (() => {
                let _classDecorators = [customElement({
                        name: 'el',
                        template: '<div>div count: ${divs.length}</div><div><au-slot></au-slot></div><au-slot name="1">'
                    })];
                let _classDescriptor;
                let _classExtraInitializers = [];
                let _classThis;
                let _divs_decorators;
                let _divs_initializers = [];
                let _divs_extraInitializers = [];
                var El = _classThis = class {
                    constructor() {
                        this.divs = __runInitializers(this, _divs_initializers, void 0);
                        __runInitializers(this, _divs_extraInitializers);
                    }
                };
                __setFunctionName(_classThis, "El");
                (() => {
                    const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
                    _divs_decorators = [slotted('div', '*')];
                    __esDecorate(null, null, _divs_decorators, { kind: "field", name: "divs", static: false, private: false, access: { has: obj => "divs" in obj, get: obj => obj.divs, set: (obj, value) => { obj.divs = value; } }, metadata: _metadata }, _divs_initializers, _divs_extraInitializers);
                    __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
                    El = _classThis = _classDescriptor.value;
                    if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
                    __runInitializers(_classThis, _classExtraInitializers);
                })();
                return El = _classThis;
            })();
            const { assertText } = await createFixture(
            // projecting 3 divs to 2 different slots
            '<el><div au-slot="1"></div><div></div><div></div>', class App {
            }, [El,]).started;
            assertText('div count: 3');
        });
        it('assigns when more slots are generated in fallback of a slot', async function () {
            let El = (() => {
                let _classDecorators = [customElement({
                        name: 'el',
                        template: 'div count: ${divs.length}<au-slot><au-slot name="1">'
                    })];
                let _classDescriptor;
                let _classExtraInitializers = [];
                let _classThis;
                let _divs_decorators;
                let _divs_initializers = [];
                let _divs_extraInitializers = [];
                var El = _classThis = class {
                    constructor() {
                        this.divs = __runInitializers(this, _divs_initializers, void 0);
                        __runInitializers(this, _divs_extraInitializers);
                    }
                };
                __setFunctionName(_classThis, "El");
                (() => {
                    const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
                    _divs_decorators = [slotted('div', '*')];
                    __esDecorate(null, null, _divs_decorators, { kind: "field", name: "divs", static: false, private: false, access: { has: obj => "divs" in obj, get: obj => obj.divs, set: (obj, value) => { obj.divs = value; } }, metadata: _metadata }, _divs_initializers, _divs_extraInitializers);
                    __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
                    El = _classThis = _classDescriptor.value;
                    if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
                    __runInitializers(_classThis, _classExtraInitializers);
                })();
                return El = _classThis;
            })();
            const { assertText } = await createFixture('<el><div au-slot="1"></div>', class App {
            }, [El,]).started;
            assertText('div count: 1');
        });
        it('assigns when projection contains slot', async function () {
            let Parent = (() => {
                let _classDecorators = [customElement({
                        name: 'parent',
                        template: '<el><au-slot>'
                    })];
                let _classDescriptor;
                let _classExtraInitializers = [];
                let _classThis;
                var Parent = _classThis = class {
                };
                __setFunctionName(_classThis, "Parent");
                (() => {
                    const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
                    __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
                    Parent = _classThis = _classDescriptor.value;
                    if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
                    __runInitializers(_classThis, _classExtraInitializers);
                })();
                return Parent = _classThis;
            })();
            let El = (() => {
                let _classDecorators = [customElement({
                        name: 'el',
                        template: 'div count: ${divs.length}<au-slot>'
                    })];
                let _classDescriptor;
                let _classExtraInitializers = [];
                let _classThis;
                let _divs_decorators;
                let _divs_initializers = [];
                let _divs_extraInitializers = [];
                var El = _classThis = class {
                    constructor() {
                        this.divs = __runInitializers(this, _divs_initializers, void 0);
                        __runInitializers(this, _divs_extraInitializers);
                    }
                };
                __setFunctionName(_classThis, "El");
                (() => {
                    const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
                    _divs_decorators = [slotted('div', '*')];
                    __esDecorate(null, null, _divs_decorators, { kind: "field", name: "divs", static: false, private: false, access: { has: obj => "divs" in obj, get: obj => obj.divs, set: (obj, value) => { obj.divs = value; } }, metadata: _metadata }, _divs_initializers, _divs_extraInitializers);
                    __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
                    El = _classThis = _classDescriptor.value;
                    if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
                    __runInitializers(_classThis, _classExtraInitializers);
                })();
                return El = _classThis;
            })();
            const { assertText } = await createFixture('<parent><div></div>', class App {
            }, [Parent, El]).started;
            assertText('div count: 1');
        });
        it('assigns when projection fallbacks', async function () {
            let Parent = (() => {
                let _classDecorators = [customElement({
                        name: 'parent',
                        template: '<el><au-slot><div>'
                    })];
                let _classDescriptor;
                let _classExtraInitializers = [];
                let _classThis;
                var Parent = _classThis = class {
                };
                __setFunctionName(_classThis, "Parent");
                (() => {
                    const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
                    __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
                    Parent = _classThis = _classDescriptor.value;
                    if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
                    __runInitializers(_classThis, _classExtraInitializers);
                })();
                return Parent = _classThis;
            })();
            let El = (() => {
                let _classDecorators = [customElement({
                        name: 'el',
                        template: 'div count: ${divs.length}<au-slot>'
                    })];
                let _classDescriptor;
                let _classExtraInitializers = [];
                let _classThis;
                let _divs_decorators;
                let _divs_initializers = [];
                let _divs_extraInitializers = [];
                var El = _classThis = class {
                    constructor() {
                        this.divs = __runInitializers(this, _divs_initializers, void 0);
                        __runInitializers(this, _divs_extraInitializers);
                    }
                };
                __setFunctionName(_classThis, "El");
                (() => {
                    const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
                    _divs_decorators = [slotted('div', '*')];
                    __esDecorate(null, null, _divs_decorators, { kind: "field", name: "divs", static: false, private: false, access: { has: obj => "divs" in obj, get: obj => obj.divs, set: (obj, value) => { obj.divs = value; } }, metadata: _metadata }, _divs_initializers, _divs_extraInitializers);
                    __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
                    El = _classThis = _classDescriptor.value;
                    if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
                    __runInitializers(_classThis, _classExtraInitializers);
                })();
                return El = _classThis;
            })();
            const { assertText } = await createFixture('<parent>', class App {
            }, [Parent, El]).started;
            assertText('div count: 1');
        });
        it('assigns when projection fallbacks multiple slot', async function () {
            let Parent = (() => {
                let _classDecorators = [customElement({
                        name: 'parent',
                        template: '<el><au-slot au-slot=1><input><input>'
                    })];
                let _classDescriptor;
                let _classExtraInitializers = [];
                let _classThis;
                var Parent = _classThis = class {
                };
                __setFunctionName(_classThis, "Parent");
                (() => {
                    const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
                    __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
                    Parent = _classThis = _classDescriptor.value;
                    if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
                    __runInitializers(_classThis, _classExtraInitializers);
                })();
                return Parent = _classThis;
            })();
            let El = (() => {
                let _classDecorators = [customElement({
                        name: 'el',
                        template: 'inputs count: ${inputs.length}<au-slot></au-slot><div><au-slot name="1">'
                    })];
                let _classDescriptor;
                let _classExtraInitializers = [];
                let _classThis;
                let _inputs_decorators;
                let _inputs_initializers = [];
                let _inputs_extraInitializers = [];
                var El = _classThis = class {
                    constructor() {
                        this.inputs = __runInitializers(this, _inputs_initializers, void 0);
                        __runInitializers(this, _inputs_extraInitializers);
                    }
                };
                __setFunctionName(_classThis, "El");
                (() => {
                    const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
                    _inputs_decorators = [slotted('input', '1')];
                    __esDecorate(null, null, _inputs_decorators, { kind: "field", name: "inputs", static: false, private: false, access: { has: obj => "inputs" in obj, get: obj => obj.inputs, set: (obj, value) => { obj.inputs = value; } }, metadata: _metadata }, _inputs_initializers, _inputs_extraInitializers);
                    __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
                    El = _classThis = _classDescriptor.value;
                    if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
                    __runInitializers(_classThis, _classExtraInitializers);
                })();
                return El = _classThis;
            })();
            const { assertText } = await createFixture('<parent>', class App {
            }, [Parent, El]).started;
            assertText('inputs count: 2');
        });
        it('assigns values independently to different elements at root level', async function () {
            let El = (() => {
                let _classDecorators = [customElement({
                        name: 'el',
                        template: 'inputs count: ${inputs.length}<au-slot></au-slot><div>'
                    })];
                let _classDescriptor;
                let _classExtraInitializers = [];
                let _classThis;
                let _inputs_decorators;
                let _inputs_initializers = [];
                let _inputs_extraInitializers = [];
                var El = _classThis = class {
                    constructor() {
                        this.inputs = __runInitializers(this, _inputs_initializers, void 0);
                        __runInitializers(this, _inputs_extraInitializers);
                    }
                };
                __setFunctionName(_classThis, "El");
                (() => {
                    const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
                    _inputs_decorators = [slotted('input')];
                    __esDecorate(null, null, _inputs_decorators, { kind: "field", name: "inputs", static: false, private: false, access: { has: obj => "inputs" in obj, get: obj => obj.inputs, set: (obj, value) => { obj.inputs = value; } }, metadata: _metadata }, _inputs_initializers, _inputs_extraInitializers);
                    __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
                    El = _classThis = _classDescriptor.value;
                    if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
                    __runInitializers(_classThis, _classExtraInitializers);
                })();
                return El = _classThis;
            })();
            const { assertText } = await createFixture('<el><input></el> | <el><input><input>', class App {
            }, [El]).started;
            assertText('inputs count: 1 | inputs count: 2');
        });
        it('assigns values independently to different elements in a custom element', async function () {
            let Parent = (() => {
                let _classDecorators = [customElement({
                        name: 'parent',
                        template: '<el><input></el> | <el><input><input>'
                    })];
                let _classDescriptor;
                let _classExtraInitializers = [];
                let _classThis;
                var Parent = _classThis = class {
                };
                __setFunctionName(_classThis, "Parent");
                (() => {
                    const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
                    __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
                    Parent = _classThis = _classDescriptor.value;
                    if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
                    __runInitializers(_classThis, _classExtraInitializers);
                })();
                return Parent = _classThis;
            })();
            let El = (() => {
                let _classDecorators = [customElement({
                        name: 'el',
                        template: 'inputs count: ${inputs.length}<au-slot></au-slot><div>'
                    })];
                let _classDescriptor;
                let _classExtraInitializers = [];
                let _classThis;
                let _inputs_decorators;
                let _inputs_initializers = [];
                let _inputs_extraInitializers = [];
                var El = _classThis = class {
                    constructor() {
                        this.inputs = __runInitializers(this, _inputs_initializers, void 0);
                        __runInitializers(this, _inputs_extraInitializers);
                    }
                };
                __setFunctionName(_classThis, "El");
                (() => {
                    const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
                    _inputs_decorators = [slotted('input')];
                    __esDecorate(null, null, _inputs_decorators, { kind: "field", name: "inputs", static: false, private: false, access: { has: obj => "inputs" in obj, get: obj => obj.inputs, set: (obj, value) => { obj.inputs = value; } }, metadata: _metadata }, _inputs_initializers, _inputs_extraInitializers);
                    __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
                    El = _classThis = _classDescriptor.value;
                    if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
                    __runInitializers(_classThis, _classExtraInitializers);
                })();
                return El = _classThis;
            })();
            const { assertText } = await createFixture('<parent>', class App {
            }, [Parent, El]).started;
            assertText('inputs count: 1 | inputs count: 2');
        });
        it('assigns all node with custom slot name from definition object', async function () {
            let El = (() => {
                let _classDecorators = [customElement({
                        name: 'el',
                        template: 'Count: ${nodes.length}<au-slot name=1>'
                    })];
                let _classDescriptor;
                let _classExtraInitializers = [];
                let _classThis;
                let _nodes_decorators;
                let _nodes_initializers = [];
                let _nodes_extraInitializers = [];
                var El = _classThis = class {
                    constructor() {
                        this.nodes = __runInitializers(this, _nodes_initializers, void 0);
                        __runInitializers(this, _nodes_extraInitializers);
                    }
                };
                __setFunctionName(_classThis, "El");
                (() => {
                    const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
                    _nodes_decorators = [slotted({
                            slotName: '1'
                        })];
                    __esDecorate(null, null, _nodes_decorators, { kind: "field", name: "nodes", static: false, private: false, access: { has: obj => "nodes" in obj, get: obj => obj.nodes, set: (obj, value) => { obj.nodes = value; } }, metadata: _metadata }, _nodes_initializers, _nodes_extraInitializers);
                    __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
                    El = _classThis = _classDescriptor.value;
                    if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
                    __runInitializers(_classThis, _classExtraInitializers);
                })();
                return El = _classThis;
            })();
            const { assertText } = await createFixture('<el><div au-slot=1>', class App {
            }, [El,]).started;
            assertText('Count: 1');
        });
        it('assigns on dynamically generated <au-slot>', async function () {
            let El = (() => {
                let _classDecorators = [customElement({
                        name: 'el',
                        template: 'Count: ${nodes.length}<au-slot repeat.for="i of 3">'
                    })];
                let _classDescriptor;
                let _classExtraInitializers = [];
                let _classThis;
                let _nodes_decorators;
                let _nodes_initializers = [];
                let _nodes_extraInitializers = [];
                var El = _classThis = class {
                    constructor() {
                        this.nodes = __runInitializers(this, _nodes_initializers, void 0);
                        __runInitializers(this, _nodes_extraInitializers);
                    }
                };
                __setFunctionName(_classThis, "El");
                (() => {
                    const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
                    _nodes_decorators = [slotted()];
                    __esDecorate(null, null, _nodes_decorators, { kind: "field", name: "nodes", static: false, private: false, access: { has: obj => "nodes" in obj, get: obj => obj.nodes, set: (obj, value) => { obj.nodes = value; } }, metadata: _metadata }, _nodes_initializers, _nodes_extraInitializers);
                    __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
                    El = _classThis = _classDescriptor.value;
                    if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
                    __runInitializers(_classThis, _classExtraInitializers);
                })();
                return El = _classThis;
            })();
            const { assertText } = await createFixture('<el><div>', class App {
            }, [El,]).started;
            assertText('Count: 3');
        });
        it('does not call slotchange inititially', async function () {
            let call = 0;
            let El = (() => {
                let _classDecorators = [customElement({
                        name: 'el',
                        template: 'Count: ${nodes.length}<au-slot slotchange.bind="log">'
                    })];
                let _classDescriptor;
                let _classExtraInitializers = [];
                let _classThis;
                let _nodes_decorators;
                let _nodes_initializers = [];
                let _nodes_extraInitializers = [];
                var El = _classThis = class {
                    log() {
                        call = 1;
                    }
                    constructor() {
                        this.nodes = __runInitializers(this, _nodes_initializers, void 0);
                        __runInitializers(this, _nodes_extraInitializers);
                    }
                };
                __setFunctionName(_classThis, "El");
                (() => {
                    const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
                    _nodes_decorators = [slotted()];
                    __esDecorate(null, null, _nodes_decorators, { kind: "field", name: "nodes", static: false, private: false, access: { has: obj => "nodes" in obj, get: obj => obj.nodes, set: (obj, value) => { obj.nodes = value; } }, metadata: _metadata }, _nodes_initializers, _nodes_extraInitializers);
                    __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
                    El = _classThis = _classDescriptor.value;
                    if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
                    __runInitializers(_classThis, _classExtraInitializers);
                })();
                return El = _classThis;
            })();
            await createFixture('<el><div>', class App {
            }, [El,]).started;
            assert.strictEqual(call, 0);
        });
    });
    describe('mutation', function () {
        it('updates added/removed nodes on single node removal', async function () {
            let El = (() => {
                let _classDecorators = [customElement({
                        name: 'el',
                        template: 'Count: ${nodes.length}<au-slot>'
                    })];
                let _classDescriptor;
                let _classExtraInitializers = [];
                let _classThis;
                let _nodes_decorators;
                let _nodes_initializers = [];
                let _nodes_extraInitializers = [];
                var El = _classThis = class {
                    constructor() {
                        this.nodes = __runInitializers(this, _nodes_initializers, void 0);
                        __runInitializers(this, _nodes_extraInitializers);
                    }
                };
                __setFunctionName(_classThis, "El");
                (() => {
                    const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
                    _nodes_decorators = [slotted('*')];
                    __esDecorate(null, null, _nodes_decorators, { kind: "field", name: "nodes", static: false, private: false, access: { has: obj => "nodes" in obj, get: obj => obj.nodes, set: (obj, value) => { obj.nodes = value; } }, metadata: _metadata }, _nodes_initializers, _nodes_extraInitializers);
                    __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
                    El = _classThis = _classDescriptor.value;
                    if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
                    __runInitializers(_classThis, _classExtraInitializers);
                })();
                return El = _classThis;
            })();
            const { assertText, component } = await createFixture('<el><div if.bind="show"></div><p>', class App {
                constructor() {
                    this.show = false;
                }
            }, [El,]).started;
            assertText('Count: 1');
            component.show = true;
            await tasksSettled(); // flush binding
            await Promise.resolve(); // mutation observer tick
            assertText('Count: 2');
            component.show = false;
            await tasksSettled(); // flush binding
            await Promise.resolve(); // mutation observer tick
            assertText('Count: 1');
        });
        it('updates added/removed nodes on the removal of multiple nodes', async function () {
            let El = (() => {
                let _classDecorators = [customElement({
                        name: 'el',
                        template: 'Count: ${nodes.length}<au-slot>'
                    })];
                let _classDescriptor;
                let _classExtraInitializers = [];
                let _classThis;
                let _nodes_decorators;
                let _nodes_initializers = [];
                let _nodes_extraInitializers = [];
                var El = _classThis = class {
                    constructor() {
                        this.nodes = __runInitializers(this, _nodes_initializers, void 0);
                        __runInitializers(this, _nodes_extraInitializers);
                    }
                };
                __setFunctionName(_classThis, "El");
                (() => {
                    const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
                    _nodes_decorators = [slotted('*')];
                    __esDecorate(null, null, _nodes_decorators, { kind: "field", name: "nodes", static: false, private: false, access: { has: obj => "nodes" in obj, get: obj => obj.nodes, set: (obj, value) => { obj.nodes = value; } }, metadata: _metadata }, _nodes_initializers, _nodes_extraInitializers);
                    __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
                    El = _classThis = _classDescriptor.value;
                    if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
                    __runInitializers(_classThis, _classExtraInitializers);
                })();
                return El = _classThis;
            })();
            const { assertText, component } = await createFixture('<el><div repeat.for="_ of i">', class App {
                constructor() {
                    this.i = 0;
                }
            }, [El,]).started;
            assertText('Count: 0');
            component.i = 3;
            await tasksSettled(); // flush binding
            await Promise.resolve(); // mutation observer tick
            assertText('Count: 3');
            component.i = 0;
            await tasksSettled(); // flush binding
            await Promise.resolve(); // mutation observer tick
            assertText('Count: 0');
        });
        it('updates values independently for multiple <au-slot> in a custom element', async function () {
            let Parent = (() => {
                let _classDecorators = [customElement({
                        name: 'parent',
                        template: '<button click.trigger="show = true"></button><el><input></el> | <el><input><input>' +
                            '<template if.bind="show"><input>'
                    })];
                let _classDescriptor;
                let _classExtraInitializers = [];
                let _classThis;
                var Parent = _classThis = class {
                };
                __setFunctionName(_classThis, "Parent");
                (() => {
                    const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
                    __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
                    Parent = _classThis = _classDescriptor.value;
                    if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
                    __runInitializers(_classThis, _classExtraInitializers);
                })();
                return Parent = _classThis;
            })();
            let El = (() => {
                let _classDecorators = [customElement({
                        name: 'el',
                        template: 'inputs count: ${inputs.length}<au-slot></au-slot><div>'
                    })];
                let _classDescriptor;
                let _classExtraInitializers = [];
                let _classThis;
                let _inputs_decorators;
                let _inputs_initializers = [];
                let _inputs_extraInitializers = [];
                var El = _classThis = class {
                    constructor() {
                        this.inputs = __runInitializers(this, _inputs_initializers, void 0);
                        __runInitializers(this, _inputs_extraInitializers);
                    }
                };
                __setFunctionName(_classThis, "El");
                (() => {
                    const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
                    _inputs_decorators = [slotted('input')];
                    __esDecorate(null, null, _inputs_decorators, { kind: "field", name: "inputs", static: false, private: false, access: { has: obj => "inputs" in obj, get: obj => obj.inputs, set: (obj, value) => { obj.inputs = value; } }, metadata: _metadata }, _inputs_initializers, _inputs_extraInitializers);
                    __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
                    El = _classThis = _classDescriptor.value;
                    if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
                    __runInitializers(_classThis, _classExtraInitializers);
                })();
                return El = _classThis;
            })();
            const { assertText, trigger } = await createFixture('<parent>', class App {
            }, [Parent, El]).started;
            assertText('inputs count: 1 | inputs count: 2');
            trigger.click('button');
            await tasksSettled(); // flush binding
            await Promise.resolve(); // mutation observer tick
            assertText('inputs count: 1 | inputs count: 3');
        });
        it('calls slotchange after rendering', async function () {
            const calls = [];
            let El = (() => {
                let _classDecorators = [customElement({
                        name: 'el',
                        template: '<au-slot slotchange.bind="log">'
                    })];
                let _classDescriptor;
                let _classExtraInitializers = [];
                let _classThis;
                let _nodes_decorators;
                let _nodes_initializers = [];
                let _nodes_extraInitializers = [];
                var El = _classThis = class {
                    log(name, nodes) {
                        calls.push([name, nodes.length]);
                    }
                    constructor() {
                        this.nodes = __runInitializers(this, _nodes_initializers, void 0);
                        __runInitializers(this, _nodes_extraInitializers);
                    }
                };
                __setFunctionName(_classThis, "El");
                (() => {
                    const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
                    _nodes_decorators = [slotted('*')];
                    __esDecorate(null, null, _nodes_decorators, { kind: "field", name: "nodes", static: false, private: false, access: { has: obj => "nodes" in obj, get: obj => obj.nodes, set: (obj, value) => { obj.nodes = value; } }, metadata: _metadata }, _nodes_initializers, _nodes_extraInitializers);
                    __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
                    El = _classThis = _classDescriptor.value;
                    if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
                    __runInitializers(_classThis, _classExtraInitializers);
                })();
                return El = _classThis;
            })();
            const { component } = createFixture('<el><div if.bind="show"></div><p>', class App {
                constructor() {
                    this.show = false;
                }
            }, [El,]);
            component.show = true;
            await tasksSettled(); // flush binding
            await Promise.resolve(); // mutation observer tick
            assert.deepStrictEqual(calls, [['default', 2]]);
            component.show = false;
            await tasksSettled(); // flush binding
            await Promise.resolve(); // mutation observer tick
            assert.deepStrictEqual(calls, [['default', 2], ['default', 1]]);
        });
        it('calls slotchange without having to have @slotted gh #2071', async function () {
            const calls = [];
            let El = (() => {
                let _classDecorators = [customElement({
                        name: 'el',
                        template: '<au-slot slotchange.bind="log">'
                    })];
                let _classDescriptor;
                let _classExtraInitializers = [];
                let _classThis;
                var El = _classThis = class {
                    log(name, nodes) {
                        calls.push([name, nodes.length]);
                    }
                };
                __setFunctionName(_classThis, "El");
                (() => {
                    const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
                    __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
                    El = _classThis = _classDescriptor.value;
                    if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
                    __runInitializers(_classThis, _classExtraInitializers);
                })();
                return El = _classThis;
            })();
            const { component } = createFixture('<el><div if.bind="show"></div><p>', class App {
                constructor() {
                    this.show = false;
                }
            }, [El,]);
            component.show = true;
            await tasksSettled(); // flush binding
            await Promise.resolve(); // mutation observer tick
            assert.deepStrictEqual(calls, [['default', 2]]);
            component.show = false;
            await tasksSettled(); // flush binding
            await Promise.resolve(); // mutation observer tick
            assert.deepStrictEqual(calls, [['default', 2], ['default', 1]]);
        });
        it('[containerless] calls slotchange without having to have @slotted gh #2071', async function () {
            const calls = [];
            let El = (() => {
                let _classDecorators = [customElement({
                        name: 'el',
                        containerless: true,
                        template: '<au-slot slotchange.bind="log">'
                    })];
                let _classDescriptor;
                let _classExtraInitializers = [];
                let _classThis;
                var El = _classThis = class {
                    log(name, nodes) {
                        calls.push([name, nodes.length]);
                    }
                };
                __setFunctionName(_classThis, "El");
                (() => {
                    const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
                    __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
                    El = _classThis = _classDescriptor.value;
                    if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
                    __runInitializers(_classThis, _classExtraInitializers);
                })();
                return El = _classThis;
            })();
            const { component } = createFixture('<el><div if.bind="show"></div><p>', class App {
                constructor() {
                    this.show = false;
                }
            }, [El,]);
            component.show = true;
            await tasksSettled(); // flush binding
            await Promise.resolve(); // mutation observer tick
            assert.deepStrictEqual(calls, [['default', 2]]);
            component.show = false;
            await tasksSettled(); // flush binding
            await Promise.resolve(); // mutation observer tick
            assert.deepStrictEqual(calls, [['default', 2], ['default', 1]]);
        });
    });
    describe('with shadow dom', function () {
        it('works with shadow dom on', async function () {
            const { assertTextContain } = createFixture(`<modal-basic>
          <div au-slot=test>from \${$host.msg}</div>
        `, class {
            }, [CustomElement.define({
                    name: 'modal-basic',
                    shadowOptions: { mode: 'open' },
                    template: '<slot></slot><au-slot name="test"></au-slot>'
                }, class {
                    constructor() {
                        this.msg = 'modal';
                    }
                })]);
            assertTextContain('from modal');
        });
    });
    it('does not interfere with direct text child in shadow dom', async function () {
        const { assertTextContain } = createFixture(`<modal-basic>
        hi <div au-slot=test>from \${$host.msg}</div>
      `, class {
        }, [CustomElement.define({
                name: 'modal-basic',
                shadowOptions: { mode: 'open' },
                template: '<slot></slot><au-slot name="test"></au-slot>'
            }, class {
                constructor() {
                    this.msg = 'modal';
                }
            })]);
        assertTextContain('from modal');
    });
});
//# sourceMappingURL=au-slot.slotted.spec.js.map