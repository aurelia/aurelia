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
import { CustomElement, Aurelia, cssModules, customElement } from '@aurelia/runtime-html';
import { assert, createFixture, createSink, TestContext } from '@aurelia/testing';
describe('3-runtime-html/styles.integration.spec.ts', function () {
    describe('css module', function () {
        it(`CSS Modules don't inherit from parent`, async function () {
            function createFixture() {
                const ctx = TestContext.create();
                const au = new Aurelia(ctx.container);
                const host = ctx.createElement('div');
                return { ctx, au, host };
            }
            const { au, host } = createFixture();
            const cssClasses = { test: 'something-else' };
            const WithStyles = CustomElement.define({
                name: 'with-styles',
                template: `<div id="target" class="test"><slot></slot></div>`,
                dependencies: [cssModules(cssClasses)],
                shadowOptions: { mode: 'open' }
            });
            const WithoutStyles = CustomElement.define({
                name: 'without-styles',
                template: `<div id="target" class="test"><slot></slot></div>`,
                shadowOptions: { mode: 'open' }
            });
            const component = CustomElement.define({
                name: 'app',
                template: `<with-styles ref="withStyles"><without-styles ref="withoutStyles"></without-styles></with-styles>`,
                dependencies: [WithStyles, WithoutStyles]
            }, class {
            });
            await au.app({ host, component }).start();
            const withStyles = au.root.controller.viewModel.withStyles;
            const withStylesRoot = CustomElement.for(withStyles).shadowRoot;
            const withStyleDiv = withStylesRoot.getElementById('target');
            assert.equal(true, withStyleDiv.classList.contains(cssClasses.test));
            const withoutStyles = au.root.controller.viewModel.withoutStyles;
            const withoutStylesRoot = CustomElement.for(withoutStyles).shadowRoot;
            const withoutStylesDiv = withoutStylesRoot.getElementById('target');
            assert.equal(true, withoutStylesDiv.classList.contains('test'));
            await au.stop();
            au.dispose();
        });
        it('works with colon in classes when there is NO matching css', async function () {
            const { assertClass } = createFixture('<my-el>', undefined, [
                CustomElement.define({
                    name: 'my-el',
                    template: '<div class="hover:bg-white">',
                    dependencies: [cssModules({})]
                })
            ]);
            assertClass('div', 'hover:bg-white');
        });
        it('works with colon in classes when there is matching css', async function () {
            const { assertClass } = createFixture('<my-el>', undefined, [
                CustomElement.define({
                    name: 'my-el',
                    template: '<div class="hover:bg-white">',
                    dependencies: [cssModules({ 'hover:bg-white': 'abc' })]
                })
            ]);
            assertClass('div', 'abc');
        });
        it('works with class binding command - github #1684', function () {
            const template = `<p class="strike" selected.class="isSelected">
I am green if I am selected and red if I am not
</p>
<p selected.class="isSelected">
I am green if I am selected and red if I am not
</p>
<pre>\${isSelected}</pre>
<button type="button" click.trigger="toggle()">Toggle selected state</button>`;
            const { assertClass } = createFixture('<component>', void 0, [CustomElement.define({
                    name: 'component',
                    template,
                    dependencies: [cssModules({ selected: 'a_' })]
                }, class Component {
                    constructor() {
                        this.isSelected = true;
                    }
                })]);
            assertClass('p:nth-child(1)', 'a_', 'strike');
        });
        it('works with class on surrogate elements', function () {
            let El = (() => {
                let _classDecorators = [customElement({
                        name: 'el',
                        template: '<template class="b">Hey',
                        dependencies: [cssModules({ 'a': 'a_' }), cssModules({ 'b': 'b_' })]
                    })];
                let _classDescriptor;
                let _classExtraInitializers = [];
                let _classThis;
                var El = _classThis = class {
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
            let i = 0;
            const { assertClass } = createFixture('<el class="a" component.ref="el">', class {
            }, [El, createSink.warn(() => i = 1)]);
            assert.strictEqual(i, 0);
            assertClass('el', 'b_', 'a');
        });
        it('works with class with interpolation', function () {
            const { assertClass } = createFixture('<my-el>', undefined, [
                CustomElement.define({
                    name: 'my-el',
                    template: '<div class="some ${myClass}">',
                    dependencies: [cssModules({ 'hey': 'abc' })]
                }, class MyEl {
                    constructor() {
                        this.myClass = "hey";
                    }
                })
            ]);
            assertClass('div', 'abc', 'some');
        });
        it('works with bind command and an expression returning string value', function () {
            const { assertClass } = createFixture('<my-el>', undefined, [
                CustomElement.define({
                    name: 'my-el',
                    template: '<div class.bind="myClass">',
                    dependencies: [cssModules({ 'hey': 'abc' })]
                }, class MyEl {
                    constructor() {
                        this.myClass = "hey";
                    }
                })
            ]);
            assertClass('div', 'abc');
        });
        it('works with bind command and an expression returning an object', function () {
            const { assertClass } = createFixture('<my-el>', undefined, [
                CustomElement.define({
                    name: 'my-el',
                    template: '<div class.bind="myClass">',
                    dependencies: [cssModules({ 'hey': 'abc' })]
                }, class MyEl {
                    constructor() {
                        this.myClass = { "hey": true };
                    }
                })
            ]);
            assertClass('div', 'abc');
        });
        it('works with multi class binding syntax', function () {
            const { assertClass } = createFixture('<my-el>', undefined, [
                CustomElement.define({
                    name: 'my-el',
                    template: '<div my-class,some.class="true">',
                    dependencies: [cssModules({ 'my-class': 'abc', some: 'def' })]
                }, class MyEl {
                })
            ]);
            assertClass('div', 'abc', 'def');
        });
    });
});
//# sourceMappingURL=styles.integration.spec.js.map