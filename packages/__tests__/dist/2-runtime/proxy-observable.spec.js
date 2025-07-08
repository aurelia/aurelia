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
import { ProxyObservable, nowrap, ConnectableSwitcher } from '@aurelia/runtime';
import { assert } from '@aurelia/testing';
describe('2-runtime/proxy-observable.spec.ts', function () {
    for (const { title, v, canWrap } of [
        // cant do
        { title: 'date', v: new Date(), canWrap: false },
        { title: 'date subclass', v: new class extends Date {
            }(), canWrap: false },
        { title: 'number', v: 1, canWrap: false },
        { title: 'string', v: '', canWrap: false },
        { title: 'bool', v: false, canWrap: false },
        { title: 'int 16', v: new Int16Array(), canWrap: false },
        // can do
        { title: 'proxy', v: new Proxy({}, {}), canWrap: true },
        { title: 'normal object', v: {}, canWrap: true },
        { title: 'Array', v: [], canWrap: true },
        { title: 'Array subclass', v: new class extends Array {
            }(), canWrap: true },
        { title: 'Map', v: new Map(), canWrap: true },
        { title: 'Map subclass', v: new class extends Map {
            }(), canWrap: true },
        { title: 'Set', v: new Set(), canWrap: true },
        { title: 'Set subclass', v: new class extends Set {
            }(), canWrap: true },
    ]) {
        it(`it wraps/unwraps (${title}) (can${canWrap ? '' : 'not'} wrap)`, function () {
            const wrapped = ProxyObservable.wrap(v);
            if (canWrap) {
                assert.notStrictEqual(wrapped, v);
            }
            else {
                assert.strictEqual(wrapped, v);
            }
        });
    }
    it('does not rewrap a wrapped object', function () {
        const proxied = ProxyObservable.wrap({});
        assert.strictEqual(ProxyObservable.wrap(proxied), proxied);
    });
    it('does not rewrap a wrapped array', function () {
        const proxied = ProxyObservable.wrap([]);
        assert.strictEqual(ProxyObservable.wrap(proxied), proxied);
    });
    it('does not rewrap a wrapped map', function () {
        const proxied = ProxyObservable.wrap(new Map());
        assert.strictEqual(ProxyObservable.wrap(proxied), proxied);
    });
    it('does not rewrap a wrapped set', function () {
        const proxied = ProxyObservable.wrap(new Set());
        assert.strictEqual(ProxyObservable.wrap(proxied), proxied);
    });
    it('does not wrap object that has been marked as "nowrap"', function () {
        let MyModel = (() => {
            let _classDecorators = [nowrap];
            let _classDescriptor;
            let _classExtraInitializers = [];
            let _classThis;
            var MyModel = _classThis = class {
            };
            __setFunctionName(_classThis, "MyModel");
            (() => {
                const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
                __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
                MyModel = _classThis = _classDescriptor.value;
                if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
                __runInitializers(_classThis, _classExtraInitializers);
            })();
            return MyModel = _classThis;
        })();
        let MyModel2 = (() => {
            let _classDecorators = [nowrap];
            let _classDescriptor;
            let _classExtraInitializers = [];
            let _classThis;
            var MyModel2 = _classThis = class {
            };
            __setFunctionName(_classThis, "MyModel2");
            (() => {
                const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
                __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
                MyModel2 = _classThis = _classDescriptor.value;
                if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
                __runInitializers(_classThis, _classExtraInitializers);
            })();
            return MyModel2 = _classThis;
        })();
        const m1 = new MyModel();
        assert.strictEqual(m1, ProxyObservable.wrap(m1));
        const m2 = new MyModel2();
        assert.strictEqual(m2, ProxyObservable.wrap(m2));
    });
    it('does not wrap object inheriting from marked class', function () {
        let MyModel = (() => {
            let _classDecorators = [nowrap];
            let _classDescriptor;
            let _classExtraInitializers = [];
            let _classThis;
            var MyModel = _classThis = class {
            };
            __setFunctionName(_classThis, "MyModel");
            (() => {
                const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
                __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
                MyModel = _classThis = _classDescriptor.value;
                if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
                __runInitializers(_classThis, _classExtraInitializers);
            })();
            return MyModel = _classThis;
        })();
        class MyActualModel extends MyModel {
        }
        const m = new MyActualModel();
        assert.strictEqual(m, ProxyObservable.wrap(m));
    });
    it('does not wrap PROP marked @nowrap', function () {
        let MyModel = (() => {
            var _a;
            let _i18n_decorators;
            let _i18n_initializers = [];
            let _i18n_extraInitializers = [];
            return _a = class MyModel {
                    constructor() {
                        this.i18n = __runInitializers(this, _i18n_initializers, null);
                        __runInitializers(this, _i18n_extraInitializers);
                    }
                },
                (() => {
                    const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
                    _i18n_decorators = [nowrap];
                    __esDecorate(null, null, _i18n_decorators, { kind: "field", name: "i18n", static: false, private: false, access: { has: obj => "i18n" in obj, get: obj => obj.i18n, set: (obj, value) => { obj.i18n = value; } }, metadata: _metadata }, _i18n_initializers, _i18n_extraInitializers);
                    if (_metadata) Object.defineProperty(_a, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
                })(),
                _a;
        })();
        let count = 0;
        const m = ProxyObservable.wrap(new MyModel());
        const connectable = {
            observe() {
                count = 1;
            },
        };
        ConnectableSwitcher.enter(connectable);
        // eslint-disable-next-line @typescript-eslint/no-unused-expressions
        m.i18n;
        ConnectableSwitcher.exit(connectable);
        assert.strictEqual(count, 0);
    });
    it('does not wrap PROP marked from parent', function () {
        let BaseModel = (() => {
            var _a;
            let _i18n_decorators;
            let _i18n_initializers = [];
            let _i18n_extraInitializers = [];
            return _a = class BaseModel {
                    constructor() {
                        this.i18n = __runInitializers(this, _i18n_initializers, null);
                        __runInitializers(this, _i18n_extraInitializers);
                    }
                },
                (() => {
                    const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
                    _i18n_decorators = [nowrap];
                    __esDecorate(null, null, _i18n_decorators, { kind: "field", name: "i18n", static: false, private: false, access: { has: obj => "i18n" in obj, get: obj => obj.i18n, set: (obj, value) => { obj.i18n = value; } }, metadata: _metadata }, _i18n_initializers, _i18n_extraInitializers);
                    if (_metadata) Object.defineProperty(_a, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
                })(),
                _a;
        })();
        class MyModel extends BaseModel {
        }
        let count = 0;
        const m = ProxyObservable.wrap(new MyModel());
        const connectable = {
            observe() {
                count++;
            },
        };
        ConnectableSwitcher.enter(connectable);
        // eslint-disable-next-line @typescript-eslint/no-unused-expressions
        m.i18n;
        ConnectableSwitcher.exit(connectable);
        assert.strictEqual(count, 0);
    });
    it('does not wrap non-configurable and non-writable properties', function () {
        const obj = {};
        Reflect.defineProperty(obj, 'prop', { value: { test: 1 } });
        const proxied = ProxyObservable.wrap(obj);
        const connectable = {
            observe() { },
        };
        ConnectableSwitcher.enter(connectable);
        const proxiedValue = proxied['prop'];
        ConnectableSwitcher.exit(connectable);
        assert.strictEqual(proxiedValue, obj['prop']);
    });
});
//# sourceMappingURL=proxy-observable.spec.js.map