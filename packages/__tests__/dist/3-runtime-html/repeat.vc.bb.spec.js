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
import { valueConverter, bindingBehavior, Aurelia, CustomElement, IPlatform } from '@aurelia/runtime-html';
import { assert, TestContext } from '@aurelia/testing';
import { createSpecFunction } from '../util.js';
describe('3-runtime-html/repeat.vc.bb.spec.ts', function () {
    class RepeaterTestExecutionContext {
        constructor(ctx, au, container, host, app, error) {
            this.ctx = ctx;
            this.au = au;
            this.container = container;
            this.host = host;
            this.app = app;
            this.error = error;
        }
        get platform() { return this._scheduler ?? (this._scheduler = this.container.get(IPlatform)); }
    }
    async function testRepeaterVC(testFunction, { template, registrations = [] } = {}) {
        const ctx = TestContext.create();
        const host = ctx.doc.createElement('div');
        ctx.doc.body.appendChild(host);
        const container = ctx.container;
        const au = new Aurelia(container);
        let error = null;
        let app = null;
        try {
            await au
                .register(...registrations, IdentityValueConverter, OddEvenValueConverter, MultipleOfValueConverter, NoopBindingBehavior, MapOddEvenValueConverter)
                .app({
                host,
                component: CustomElement.define({ name: 'app', template }, App)
            })
                .start();
            app = au.root.controller.viewModel;
        }
        catch (e) {
            error = e;
        }
        assert.strictEqual(error, null);
        await testFunction(new RepeaterTestExecutionContext(ctx, au, container, host, app, error));
        if (error === null) {
            await au.stop();
        }
        ctx.doc.body.removeChild(host);
    }
    const $it = createSpecFunction(testRepeaterVC);
    class App {
        constructor() {
            this.arr = Array.from({ length: 10 }, (_, i) => i + 1);
            this.set = new Set(this.arr);
            this.mapSimple = new Map([['a', 1], ['b', 2], ['c', 3], ['d', 4]]);
            this.mapComplex = new Map([['a', [11, 12, 13, 14]], ['b', [21, 22, 23, 24]]]);
        }
        getArr() { return this.arr; }
    }
    let IdentityValueConverter = (() => {
        let _classDecorators = [valueConverter('identity')];
        let _classDescriptor;
        let _classExtraInitializers = [];
        let _classThis;
        var IdentityValueConverter = _classThis = class {
            toView(value) {
                return value;
            }
        };
        __setFunctionName(_classThis, "IdentityValueConverter");
        (() => {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
            IdentityValueConverter = _classThis = _classDescriptor.value;
            if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
            __runInitializers(_classThis, _classExtraInitializers);
        })();
        return IdentityValueConverter = _classThis;
    })();
    let OddEvenValueConverter = (() => {
        let _classDecorators = [valueConverter('oddEven')];
        let _classDescriptor;
        let _classExtraInitializers = [];
        let _classThis;
        var OddEvenValueConverter = _classThis = class {
            toView(value, even) {
                return (value instanceof Set ? Array.from(value) : value).filter((v) => v % 2 === (even ? 0 : 1));
            }
        };
        __setFunctionName(_classThis, "OddEvenValueConverter");
        (() => {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
            OddEvenValueConverter = _classThis = _classDescriptor.value;
            if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
            __runInitializers(_classThis, _classExtraInitializers);
        })();
        return OddEvenValueConverter = _classThis;
    })();
    let MapOddEvenValueConverter = (() => {
        let _classDecorators = [valueConverter('mapOddEven')];
        let _classDescriptor;
        let _classExtraInitializers = [];
        let _classThis;
        var MapOddEvenValueConverter = _classThis = class {
            toView(value, even) {
                const map = new Map();
                for (const [k, v] of value) {
                    if (v % 2 === (even ? 0 : 1)) {
                        map.set(k, v);
                    }
                }
                return map;
            }
        };
        __setFunctionName(_classThis, "MapOddEvenValueConverter");
        (() => {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
            MapOddEvenValueConverter = _classThis = _classDescriptor.value;
            if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
            __runInitializers(_classThis, _classExtraInitializers);
        })();
        return MapOddEvenValueConverter = _classThis;
    })();
    let MultipleOfValueConverter = (() => {
        let _classDecorators = [valueConverter('multipleOf')];
        let _classDescriptor;
        let _classExtraInitializers = [];
        let _classThis;
        var MultipleOfValueConverter = _classThis = class {
            toView(value, n) {
                return value.filter((v) => v % n === 0);
            }
        };
        __setFunctionName(_classThis, "MultipleOfValueConverter");
        (() => {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
            MultipleOfValueConverter = _classThis = _classDescriptor.value;
            if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
            __runInitializers(_classThis, _classExtraInitializers);
        })();
        return MultipleOfValueConverter = _classThis;
    })();
    let NoopBindingBehavior = (() => {
        let _classDecorators = [bindingBehavior('noop')];
        let _classDescriptor;
        let _classExtraInitializers = [];
        let _classThis;
        var NoopBindingBehavior = _classThis = class {
        };
        __setFunctionName(_classThis, "NoopBindingBehavior");
        (() => {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
            NoopBindingBehavior = _classThis = _classDescriptor.value;
            if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
            __runInitializers(_classThis, _classExtraInitializers);
        })();
        return NoopBindingBehavior = _classThis;
    })();
    const identityExpected = Array.from({ length: 10 }, (_, i) => `<span>${i + 1}</span>`).join('');
    const oddExpected = Array.from({ length: 10 }, (_, i) => i % 2 === 0 ? `<span>${i + 1}</span>` : '').join('');
    const evenExpected = Array.from({ length: 10 }, (_, i) => i % 2 === 1 ? `<span>${i + 1}</span>` : '').join('');
    class TestData {
        constructor(arg, template, expectedInitial, ...changes) {
            this.template = template;
            this.expectedInitial = expectedInitial;
            this.only = false;
            if (typeof arg === 'string') {
                this.name = arg;
            }
            else {
                [this.name, this.only] = arg;
            }
            this.changes = changes;
        }
    }
    function* getTestData() {
        const identityArrTmplt = `<span repeat.for="item of arr | identity">\${item}</span>`;
        yield new TestData('array mutation - identity VC', identityArrTmplt, identityExpected, [(ctx) => { ctx.app.arr.push(11); }, `${identityExpected}<span>11</span>`], [(ctx) => { ctx.app.arr.unshift(12); }, `<span>12</span>${identityExpected}<span>11</span>`], [(ctx) => { ctx.app.arr.pop(); }, `<span>12</span>${identityExpected}`], [(ctx) => { ctx.app.arr.shift(); }, identityExpected]);
        yield new TestData('array instance change - identity VC', identityArrTmplt, identityExpected, [
            (ctx) => { ctx.app.arr = Array.from({ length: 5 }, (_, i) => i * 5); },
            `<span>0</span><span>5</span><span>10</span><span>15</span><span>20</span>`
        ]);
        yield new TestData('array instance change -> array mutation - identity VC', identityArrTmplt, identityExpected, [
            (ctx) => { ctx.app.arr = Array.from({ length: 5 }, (_, i) => i * 5); },
            `<span>0</span><span>5</span><span>10</span><span>15</span><span>20</span>`
        ], [
            (ctx) => { ctx.app.arr.push(25, 30); },
            `<span>0</span><span>5</span><span>10</span><span>15</span><span>20</span><span>25</span><span>30</span>`
        ]);
        const oeVcTrueTmplt = `<span repeat.for="item of arr | oddEven:true">\${item}</span>`;
        yield new TestData('array mutation - oddEven VC', oeVcTrueTmplt, evenExpected, [(ctx) => { ctx.app.arr.push(11, 12); }, `${evenExpected}<span>12</span>`], [(ctx) => { ctx.app.arr.unshift(14, 13); }, `<span>14</span>${evenExpected}<span>12</span>`], [(ctx) => { ctx.app.arr.pop(); }, `<span>14</span>${evenExpected}`], [(ctx) => { ctx.app.arr.shift(); }, evenExpected]);
        yield new TestData('array instance change - oddEven VC', oeVcTrueTmplt, evenExpected, [(ctx) => { ctx.app.arr = Array.from({ length: 5 }, (_, i) => i * 5); }, `<span>0</span><span>10</span><span>20</span>`], [(ctx) => { ctx.app.arr = Array.from({ length: 5 }, (_, i) => i * 7); }, `<span>0</span><span>14</span><span>28</span>`]);
        yield new TestData('change to VC arg - oddEven VC', `<let even.bind="true"></let><span repeat.for="item of arr | oddEven:even">\${item}</span>`, evenExpected, [(ctx) => { ctx.app.$controller.scope.overrideContext.even = false; }, oddExpected,]);
        const twoVcTmplt = `<span repeat.for="item of arr | oddEven:true | multipleOf:3">\${item}</span>`;
        yield new TestData('array mutation - oddEven VC - multipleOf VC', twoVcTmplt, '<span>6</span>', [(ctx) => { ctx.app.arr.push(11, 12); }, '<span>6</span><span>12</span>',], [(ctx) => { ctx.app.arr.unshift(18, 19, 13, 14); }, '<span>18</span><span>6</span><span>12</span>',], [(ctx) => { ctx.app.arr.pop(); }, '<span>18</span><span>6</span>',], [(ctx) => { ctx.app.arr.shift(); }, '<span>6</span>',]);
        yield new TestData('array instance change - oddEven VC - multipleOf VC', twoVcTmplt, '<span>6</span>', [(ctx) => { ctx.app.arr = Array.from({ length: 10 }, (_, i) => i + 11); }, '<span>12</span><span>18</span>',], [(ctx) => { ctx.app.arr = Array.from({ length: 10 }, (_, i) => i + 21); }, '<span>24</span><span>30</span>',]);
        yield new TestData('change to VC arg - oddEven VC - multipleOf VC', `<let even.bind="false" n.bind="3"></let><span repeat.for="item of arr | oddEven:even | multipleOf:n">\${item}</span>`, '<span>3</span><span>9</span>', [
            (ctx) => {
                const oc = ctx.app.$controller.scope.overrideContext;
                oc.even = true;
                oc.n = 4;
            },
            '<span>4</span><span>8</span>',
        ]);
        const noopBBTmplt = `<span repeat.for="item of arr & noop">\${item}</span>`;
        yield new TestData('array mutation - noop BB', noopBBTmplt, identityExpected, [(ctx) => { ctx.app.arr.push(11); }, `${identityExpected}<span>11</span>`,]);
        yield new TestData('array instance change - noop BB', noopBBTmplt, identityExpected, [(ctx) => { ctx.app.arr = Array.from({ length: 5 }, (_, i) => i * 5); }, `<span>0</span><span>5</span><span>10</span><span>15</span><span>20</span>`,]);
        const twoVcBBTmplt = `<span repeat.for="item of arr | oddEven:true | multipleOf:3 & noop">\${item}</span>`;
        yield new TestData('array mutation - oddEven VC - multipleOf VC - noop BB', twoVcBBTmplt, '<span>6</span>', [(ctx) => { ctx.app.arr.push(11, 12); }, '<span>6</span><span>12</span>',], [(ctx) => { ctx.app.arr.push(13, 14, 18, 19); }, '<span>6</span><span>12</span><span>18</span>',]);
        yield new TestData('array instance change - oddEven VC - multipleOf VC - noop BB', twoVcBBTmplt, '<span>6</span>', [(ctx) => { ctx.app.arr = Array.from({ length: 10 }, (_, i) => i + 11); }, '<span>12</span><span>18</span>',], [(ctx) => { ctx.app.arr = Array.from({ length: 10 }, (_, i) => i + 21); }, '<span>24</span><span>30</span>',]);
        yield new TestData('change to VC arg - oddEven VC - multipleOf VC - noop BB', `<let even.bind="false" n.bind="3"></let><span repeat.for="item of arr | oddEven:even | multipleOf:n & noop">\${item}</span>`, '<span>3</span><span>9</span>', [
            (ctx) => {
                const oc = ctx.app.$controller.scope.overrideContext;
                oc.even = true;
                oc.n = 4;
            },
            '<span>4</span><span>8</span>',
        ]);
        yield new TestData('array instance change - array reverse - oddEven VC', `<span repeat.for="item of arr.reverse() | oddEven:true">\${item}</span>`, '<span>10</span><span>8</span><span>6</span><span>4</span><span>2</span>', [(ctx) => { ctx.app.arr = Array.from({ length: 5 }, (_, i) => i * 5); }, `<span>20</span><span>10</span><span>0</span>`,], [(ctx) => { ctx.app.arr = [...ctx.app.arr, 42]; }, `<span>42</span><span>20</span><span>10</span><span>0</span>`,], [(ctx) => { ctx.app.arr = Array.from({ length: 5 }, (_, i) => i * 7); }, `<span>28</span><span>14</span><span>0</span>`,]);
        yield new TestData('array instance change - array slice - oddEven VC', `<let end.bind="4"></let><span repeat.for="item of arr.slice(0, end) | oddEven:true">\${item}</span>`, '<span>2</span><span>4</span>', [(ctx) => { ctx.app.$controller.scope.overrideContext.end = 6; }, '<span>2</span><span>4</span><span>6</span>',], [(ctx) => { ctx.app.$controller.scope.overrideContext.end = 4; }, '<span>2</span><span>4</span>',], [(ctx) => { ctx.app.arr = Array.from({ length: 6 }, (_, i) => i * 5); }, `<span>0</span><span>10</span>`,], [(ctx) => { ctx.app.arr = [42, 43, ...ctx.app.arr]; }, `<span>42</span><span>0</span>`,], [(ctx) => { ctx.app.arr = Array.from({ length: 5 }, (_, i) => i * 7); }, `<span>0</span><span>14</span>`,]);
        yield new TestData('array mutation - array reverse - oddEven VC', `<span repeat.for="item of arr.reverse() | oddEven:true">\${item}</span>`, '<span>10</span><span>8</span><span>6</span><span>4</span><span>2</span>', [(ctx) => { ctx.app.arr.push(42); }, `<span>42</span><span>10</span><span>8</span><span>6</span><span>4</span><span>2</span>`,], [(ctx) => { ctx.app.arr.push(48); }, `<span>48</span><span>42</span><span>10</span><span>8</span><span>6</span><span>4</span><span>2</span>`,], [(ctx) => { ctx.app.arr.pop(); }, `<span>42</span><span>10</span><span>8</span><span>6</span><span>4</span><span>2</span>`,], [(ctx) => { ctx.app.arr.pop(); }, `<span>10</span><span>8</span><span>6</span><span>4</span><span>2</span>`,]);
        yield new TestData('array mutation + instance change - array reverse - oddEven VC', `<span repeat.for="item of arr.reverse() | oddEven:true">\${item}</span>`, '<span>10</span><span>8</span><span>6</span><span>4</span><span>2</span>', [(ctx) => { ctx.app.arr.push(42); }, `<span>42</span><span>10</span><span>8</span><span>6</span><span>4</span><span>2</span>`,], [(ctx) => { ctx.app.arr = [...ctx.app.arr, 48]; }, `<span>48</span><span>42</span><span>10</span><span>8</span><span>6</span><span>4</span><span>2</span>`,], [(ctx) => { ctx.app.arr = Array.from({ length: 5 }, (_, i) => i * 7); }, `<span>28</span><span>14</span><span>0</span>`,], [(ctx) => { ctx.app.arr.push(42); }, `<span>42</span><span>28</span><span>14</span><span>0</span>`,], [(ctx) => { ctx.app.arr.splice(ctx.app.arr.length - 1, 1, 44); }, `<span>44</span><span>28</span><span>14</span><span>0</span>`,]);
        yield new TestData('array mutation + instance change - array sort - oddEven VC', `<let fn.bind="undefined"></let><span repeat.for="item of arr.sort(fn) | oddEven:true">\${item}</span>`, 
        // Because: The default sort order is ascending, built upon converting the elements into strings, then comparing their sequences of UTF-16 code units values (refer: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/sort).
        '<span>10</span><span>2</span><span>4</span><span>6</span><span>8</span>', [(ctx) => { ctx.app.$controller.scope.overrideContext.fn = (a, b) => b - a; }, '<span>10</span><span>8</span><span>6</span><span>4</span><span>2</span>',], [(ctx) => { ctx.app.arr.push(42, 48); }, '<span>48</span><span>42</span><span>10</span><span>8</span><span>6</span><span>4</span><span>2</span>',], [(ctx) => { ctx.app.arr = Array.from({ length: 5 }, (_, i) => i * 7); }, '<span>28</span><span>14</span><span>0</span>',], [(ctx) => { ctx.app.$controller.scope.overrideContext.fn = (a, b) => a - b; }, '<span>0</span><span>14</span><span>28</span>',], [(ctx) => { ctx.app.arr.push(24); }, '<span>0</span><span>14</span><span>24</span><span>28</span>',]);
        yield new TestData('set mutation + instance change - oddEven VC', `<span repeat.for="item of set | oddEven:true">\${item}</span>`, evenExpected, [(ctx) => { const set = ctx.app.set; set.add(10); set.add(11); set.add(12); }, `${evenExpected}<span>12</span>`,], [(ctx) => { const set = ctx.app.set; set.delete(2); set.delete(4); }, '<span>6</span><span>8</span><span>10</span><span>12</span>',], [(ctx) => { ctx.app.set = new Set(Array.from({ length: 5 }, (_, i) => i * 7)); }, '<span>0</span><span>14</span><span>28</span>',], [(ctx) => { const set = ctx.app.set; set.add(28); set.add(10); set.add(12); }, '<span>0</span><span>14</span><span>28</span><span>10</span><span>12</span>',], [(ctx) => { const set = ctx.app.set; set.delete(14); set.delete(28); }, '<span>0</span><span>10</span><span>12</span>',]);
        yield new TestData('mapSimple mutation + instance change - oddEven VC', `<span repeat.for="item of mapSimple | mapOddEven:true">\${item[0]}:\${item[1]}</span>`, '<span>b:2</span><span>d:4</span>', [(ctx) => { const map = ctx.app.mapSimple; map.set('e', 6); map.set('f', 5); }, '<span>b:2</span><span>d:4</span><span>e:6</span>',], [(ctx) => { const map = ctx.app.mapSimple; map.set('a', 12); map.delete('b'); }, '<span>a:12</span><span>d:4</span><span>e:6</span>',], [(ctx) => { ctx.app.mapSimple = new Map([['a', 12], ['b', 13], ['c', 14], ['d', 15]]); }, '<span>a:12</span><span>c:14</span>',], [(ctx) => { const map = ctx.app.mapSimple; map.set('e', 6); map.set('f', 5); }, '<span>a:12</span><span>c:14</span><span>e:6</span>',], [(ctx) => { const map = ctx.app.mapSimple; map.set('a', 42); map.delete('c'); }, '<span>a:42</span><span>e:6</span>',]);
        yield new TestData('mapComplex - oddEven VC', `<span repeat.for="item of mapComplex">\${item[0]}: <template repeat.for="i of item[1] | oddEven:$index % 2===0">\${i} </template></span>`, '<span>a: 12 14 </span><span>b: 21 23 </span>', [
            (ctx) => { const map = ctx.app.mapComplex; map.set('d', [31, 32, 33, 34]); map.get('a').push(15, 16); },
            '<span>a: 12 14 16 </span><span>b: 21 23 </span><span>d: 32 34 </span>',
        ], [
            (ctx) => { const map = ctx.app.mapComplex; map.delete('b'); map.get('d').splice(3, 1, 35, 36); },
            '<span>a: 12 14 16 </span><span>d: 31 33 35 </span>',
        ]);
        yield new TestData('method call - reference - array mutation - oddEven VC', `<span repeat.for="item of getArr() | oddEven:true">\${item}</span>`, evenExpected, [(ctx) => { ctx.app.arr.push(42); }, `${evenExpected}<span>42</span>`,], [(ctx) => { ctx.app.arr.pop(); }, evenExpected,], [(ctx) => { ctx.app.arr = Array.from({ length: 10 }, (_, i) => i + 11); }, evenExpected,]);
        yield new TestData('method call + length hack - reference - array mutation - oddEven VC', `<span repeat.for="item of getArr() | oddEven:true:arr.length">\${item}</span>`, evenExpected, [(ctx) => { ctx.app.arr.push(42); }, `${evenExpected}<span>42</span>`,], [(ctx) => { ctx.app.arr.pop(); }, evenExpected,], [(ctx) => { ctx.app.arr = Array.from({ length: 5 }, (_, i) => i + 11); }, '<span>12</span><span>14</span>',]);
    }
    for (const { name, only, template, expectedInitial, changes } of getTestData()) {
        (only ? $it.only : $it)(name, async function (ctx) {
            const host = ctx.host;
            assert.html.innerEqual(host, expectedInitial, 'initial');
            let i = 1;
            for (const [change, expected] of changes) {
                await change(ctx);
                assert.html.innerEqual(host, expected, `post-mutation#${i++}`);
            }
        }, { template });
    }
});
//# sourceMappingURL=repeat.vc.bb.spec.js.map