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
import { inject, newInstanceForScope, resolve } from '@aurelia/kernel';
import { BindingMode, Aurelia, AuSlotsInfo, bindable, customElement, CustomElement, IAuSlotsInfo, IPlatform, ValueConverter } from '@aurelia/runtime-html';
import { assert, createFixture, hJsx, TestContext } from '@aurelia/testing';
import { createSpecFunction } from '../util.js';
import { runTasks } from '@aurelia/runtime';
describe('3-runtime-html/au-slot.spec.tsx', function () {
    class AuSlotTestExecutionContext {
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
    async function testAuSlot(testFunction, { template, registrations } = {}) {
        const ctx = TestContext.create();
        const host = ctx.doc.createElement('div');
        ctx.doc.body.appendChild(host);
        const container = ctx.container;
        const au = new Aurelia(container);
        let error = null;
        let app = null;
        try {
            await au
                .register(...registrations, delegateSyntax)
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
        await testFunction(new AuSlotTestExecutionContext(ctx, au, container, host, app, error));
        if (error === null) {
            await au.stop();
        }
        ctx.doc.body.removeChild(host);
    }
    const $it = createSpecFunction(testAuSlot);
    class App {
        constructor() {
            this.message = 'root';
            this.people = [
                new Person('John', 'Doe', ['Browny', 'Smokey']),
                new Person('Max', 'Mustermann', ['Sea biscuit', 'Swift Thunder']),
            ];
            this.callCount = 0;
        }
        fn() { this.callCount++; }
    }
    class Person {
        constructor(firstName, lastName, pets) {
            this.firstName = firstName;
            this.lastName = lastName;
            this.pets = pets;
        }
    }
    class TestData {
        constructor(spec, template, registrations, expected, additionalAssertion, only = false) {
            this.spec = spec;
            this.template = template;
            this.registrations = registrations;
            this.expected = expected;
            this.additionalAssertion = additionalAssertion;
            this.only = only;
        }
    }
    function* getTestData() {
        var _a, _b, _c;
        const createMyElement = (template, containerless = false) => {
            class MyElement {
                constructor() {
                    this.slots = resolve(IAuSlotsInfo);
                    assert.instanceOf(this.slots, AuSlotsInfo);
                }
            }
            return CustomElement.define({ name: 'my-element', template, bindables: { people: { mode: BindingMode.default } }, containerless }, MyElement);
        };
        // #region simple templating
        yield new TestData('shows fallback content', `<my-element></my-element>`, [
            createMyElement(`static <au-slot>default</au-slot> <au-slot name="s1">s1</au-slot> <au-slot name="s2">s2</au-slot>`),
        ], { 'my-element': ['static default s1 s2', new AuSlotsInfo([])] });
        yield new TestData('shows projected content', `<my-element><div au-slot="default">d</div><div au-slot="s1">p1</div></my-element>`, [
            createMyElement(`static <au-slot>default</au-slot> <au-slot name="s1">s1</au-slot> <au-slot name="s2">s2</au-slot>`),
        ], { 'my-element': ['static <div>d</div> <div>p1</div> s2', new AuSlotsInfo(['default', 's1'])] });
        yield new TestData('shows projected content - with template', `<my-element><template au-slot="default">d</template><template au-slot="s1">p1</template></my-element>`, [
            createMyElement(`static <au-slot>default</au-slot> <au-slot name="s1">s1</au-slot> <au-slot name="s2">s2</au-slot>`),
        ], { 'my-element': ['static d p1 s2', new AuSlotsInfo(['default', 's1'])] });
        yield new TestData('supports n-1 projections', `<my-element> <div au-slot="s2">p20</div><div au-slot="s1">p11</div><div au-slot="s2">p21</div><div au-slot="s1">p12</div> </my-element>`, [
            createMyElement(`static <au-slot>default</au-slot> <au-slot name="s1">s1</au-slot> <au-slot name="s2">s2</au-slot>`),
        ], { 'my-element': [`static default <div>p11</div><div>p12</div> <div>p20</div><div>p21</div>`, new AuSlotsInfo(['s2', 's1'])] });
        for (const sep of [' ', '~', '`', '!', '@', '#', '$', '%', '^', '&', '*', '[', '{', '(', ')', '}', ']', '<', '>', '-', '_', '+', '=', '.', ',', '/', '\\\\', '|', '?', ':', ';', '&quot;']) {
            const slotName = `slot${sep}one`;
            yield new TestData(`au-slot name with special character works - ${slotName}`, `<my-element><div au-slot="${slotName}">p</div></my-element>`, [
                createMyElement(`<au-slot name="${slotName}"></au-slot>`),
            ], { 'my-element': ['<div>p</div>', new AuSlotsInfo([slotName.replace('&quot;', '"')])] });
        }
        yield new TestData('projection w/o slot name goes to the default slot', `<my-element><div au-slot>p</div></my-element>`, [
            createMyElement(`<au-slot></au-slot><au-slot name="s1">s1fb</au-slot>`),
        ], { 'my-element': ['<div>p</div>s1fb', new AuSlotsInfo(['default'])] });
        // tag: mis-projection
        // yield new TestData(
        //   'projection w/o [au-slot] causes mis-projection',
        //   `<my-element><div>p</div></my-element>`,
        //   [
        //     createMyElement(`<au-slot name="s1">s1fb</au-slot>|<au-slot>d</au-slot>`),
        //   ],
        //   { 'my-element': ['<div>p</div>s1fb|d', new SlotsInfo([])] },
        // );
        yield new TestData('projections for multiple instances works correctly', `<my-element><div au-slot>p1</div></my-element>
       <my-element><div au-slot>p2</div></my-element>`, [
            createMyElement(`<au-slot></au-slot>`),
        ], { 'my-element': ['<div>p1</div>', new AuSlotsInfo(['default'])], 'my-element+my-element': ['<div>p2</div>', new AuSlotsInfo(['default'])] });
        // #endregion
        // #region interpolation
        yield new TestData('supports interpolations', `<my-element><div au-slot="s2">\${message}</div><div au-slot="s1">p11</div><div au-slot="s2">p21</div><div au-slot="s1">\${message}</div></my-element>`, [
            createMyElement(`static <au-slot>default</au-slot> <au-slot name="s1">s1</au-slot> <au-slot name="s2">s2</au-slot>`),
        ], { 'my-element': [`static default <div>p11</div><div>root</div> <div>root</div><div>p21</div>`, new AuSlotsInfo(['s2', 's1'])] });
        yield new TestData('supports interpolations inside <template>', `<my-element> <template au-slot="s2">\${message}</template> <template au-slot="s1">p11</template> <template au-slot="s2">p21</template> <template au-slot="s1">\${message}</template> </my-element>`, [
            createMyElement(`static <au-slot>default</au-slot> <au-slot name="s1">s1</au-slot> <au-slot name="s2">s2</au-slot>`),
        ], { 'my-element': [`static default p11root rootp21`, new AuSlotsInfo(['s2', 's1'])] });
        {
            class MyElement {
                constructor() {
                    this.message = 'inner';
                    this.slots = resolve(IAuSlotsInfo);
                    assert.instanceOf(this.slots, AuSlotsInfo);
                }
            }
            yield new TestData('supports accessing inner scope with $host', `<my-element> <div au-slot="s2">\${message}</div><div au-slot="s1">\${$host.message}</div> </my-element>`, [
                CustomElement.define({ name: 'my-element', template: `<au-slot name="s1">s1</au-slot> <au-slot name="s2">s2</au-slot>` }, MyElement),
            ], { 'my-element': [`<div>inner</div> <div>root</div>`, new AuSlotsInfo(['s2', 's1'])] });
        }
        {
            class MyElement {
                constructor() {
                    this.message = 'inner';
                    this.slots = resolve(IAuSlotsInfo);
                    assert.instanceOf(this.slots, AuSlotsInfo);
                }
            }
            yield new TestData('uses inner scope by default if no projection is provided', `<my-element> <div au-slot="s2">\${message}</div> </my-element>`, [
                CustomElement.define({ name: 'my-element', template: `<au-slot name="s1">\${message}</au-slot> <au-slot name="s2">s2</au-slot>` }, MyElement),
            ], { 'my-element': [`inner <div>root</div>`, new AuSlotsInfo(['s2'])] });
        }
        // #endregion
        // #region template controllers
        {
            let MyElement = (() => {
                let _classDecorators = [customElement({ name: 'my-element', template: `static <au-slot>default</au-slot> <au-slot name="s1" if.bind="showS1">s1</au-slot> <au-slot name="s2">s2</au-slot>` })];
                let _classDescriptor;
                let _classExtraInitializers = [];
                let _classThis;
                let _showS1_decorators;
                let _showS1_initializers = [];
                let _showS1_extraInitializers = [];
                var MyElement = _classThis = class {
                    constructor() {
                        this.showS1 = __runInitializers(this, _showS1_initializers, true);
                        this.slots = (__runInitializers(this, _showS1_extraInitializers), resolve(IAuSlotsInfo));
                    }
                };
                __setFunctionName(_classThis, "MyElement");
                (() => {
                    const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
                    _showS1_decorators = [bindable];
                    __esDecorate(null, null, _showS1_decorators, { kind: "field", name: "showS1", static: false, private: false, access: { has: obj => "showS1" in obj, get: obj => obj.showS1, set: (obj, value) => { obj.showS1 = value; } }, metadata: _metadata }, _showS1_initializers, _showS1_extraInitializers);
                    __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
                    MyElement = _classThis = _classDescriptor.value;
                    if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
                    __runInitializers(_classThis, _classExtraInitializers);
                })();
                return MyElement = _classThis;
            })();
            yield new TestData('works with template controller - if', `<my-element show-s1.bind="false"> <div au-slot="s2">p20</div> <div au-slot="s1">p11</div> <div au-slot="s2">p21</div> <div au-slot="s1">p12</div> </my-element>`, [
                MyElement,
            ], { 'my-element': [`static default <div>p20</div><div>p21</div>`, new AuSlotsInfo(['s2', 's1'])] }, async function ({ host }) {
                const el = host.querySelector('my-element');
                const vm = CustomElement.for(el).viewModel;
                vm.showS1 = true;
                runTasks();
                assert.html.innerEqual(el, `static default <div>p11</div><div>p12</div> <div>p20</div><div>p21</div>`, 'my-element.innerHTML');
            });
        }
        {
            let MyElement = (() => {
                let _classDecorators = [customElement({ name: 'my-element', template: `static <au-slot>default</au-slot> <au-slot name="s1" if.bind="showS1">s1</au-slot> <au-slot else name="s2">s2</au-slot>` })];
                let _classDescriptor;
                let _classExtraInitializers = [];
                let _classThis;
                let _showS1_decorators;
                let _showS1_initializers = [];
                let _showS1_extraInitializers = [];
                var MyElement = _classThis = class {
                    constructor() {
                        this.showS1 = __runInitializers(this, _showS1_initializers, true);
                        this.slots = (__runInitializers(this, _showS1_extraInitializers), resolve(IAuSlotsInfo));
                    }
                };
                __setFunctionName(_classThis, "MyElement");
                (() => {
                    const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
                    _showS1_decorators = [bindable];
                    __esDecorate(null, null, _showS1_decorators, { kind: "field", name: "showS1", static: false, private: false, access: { has: obj => "showS1" in obj, get: obj => obj.showS1, set: (obj, value) => { obj.showS1 = value; } }, metadata: _metadata }, _showS1_initializers, _showS1_extraInitializers);
                    __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
                    MyElement = _classThis = _classDescriptor.value;
                    if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
                    __runInitializers(_classThis, _classExtraInitializers);
                })();
                return MyElement = _classThis;
            })();
            yield new TestData('works with template controller - if-else', `
        <my-element show-s1.bind="false"> <div au-slot="s2">p21</div> <div au-slot="s1">p11</div> </my-element>
        <my-element show-s1.bind="true" > <div au-slot="s2">p22</div> <div au-slot="s1">p12</div> </my-element>
        `, [
                MyElement,
            ], { 'my-element': [`static default <div>p21</div>`, new AuSlotsInfo(['s2', 's1'])], 'my-element+my-element': [`static default <div>p12</div>`, new AuSlotsInfo(['s2', 's1'])] }, async function ({ host }) {
                const el1 = host.querySelector('my-element');
                const el2 = host.querySelector('my-element+my-element');
                const vm1 = CustomElement.for(el1).viewModel;
                const vm2 = CustomElement.for(el2).viewModel;
                vm1.showS1 = !vm1.showS1;
                vm2.showS1 = !vm2.showS1;
                runTasks();
                assert.html.innerEqual(el1, `static default <div>p11</div>`, 'my-element.innerHTML');
                assert.html.innerEqual(el2, `static default <div>p22</div>`, 'my-element+my-element.innerHTML');
            });
        }
        {
            let MyElement = (() => {
                let _classDecorators = [customElement({ name: 'my-element', template: `<ul if.bind="someCondition"><au-slot></au-slot></ul> <div else><au-slot></au-slot></div>` })];
                let _classDescriptor;
                let _classExtraInitializers = [];
                let _classThis;
                let _someCondition_decorators;
                let _someCondition_initializers = [];
                let _someCondition_extraInitializers = [];
                var MyElement = _classThis = class {
                    constructor() {
                        this.someCondition = __runInitializers(this, _someCondition_initializers, true);
                        this.slots = (__runInitializers(this, _someCondition_extraInitializers), resolve(IAuSlotsInfo));
                    }
                };
                __setFunctionName(_classThis, "MyElement");
                (() => {
                    const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
                    _someCondition_decorators = [bindable];
                    __esDecorate(null, null, _someCondition_decorators, { kind: "field", name: "someCondition", static: false, private: false, access: { has: obj => "someCondition" in obj, get: obj => obj.someCondition, set: (obj, value) => { obj.someCondition = value; } }, metadata: _metadata }, _someCondition_initializers, _someCondition_extraInitializers);
                    __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
                    MyElement = _classThis = _classDescriptor.value;
                    if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
                    __runInitializers(_classThis, _classExtraInitializers);
                })();
                return MyElement = _classThis;
            })();
            yield new TestData('works with template controller - if-else - same slot name', `
        <my-element some-condition.bind="true"> <template au-slot><li>1</li><li>2</li></template> </my-element>
        <my-element some-condition.bind="false"> <template au-slot><span>1</span><span>2</span></template> </my-element>
        `, [
                MyElement,
            ], { 'my-element': [`<ul><li>1</li><li>2</li></ul>`, new AuSlotsInfo(['default'])], 'my-element+my-element': [`<div><span>1</span><span>2</span></div>`, new AuSlotsInfo(['default'])] });
        }
        // new behavior from the new compiler
        // template controller on [au-slot]
        {
            yield new TestData('works with template controller(if) - same element (<template/>)', `
        <my-element><template au-slot if.bind="true"><li>1</li><li>2</li></template></my-element>
        `, [createMyElement('<ul><au-slot></au-slot></ul>')], { 'my-element': [`<ul><li>1</li><li>2</li></ul>`, new AuSlotsInfo(['default'])] });
            yield new TestData('works with template controller(if) - same element (<template/>) - TC before [au-slot]', `
        <my-element><template au-slot if.bind="true"><li>1</li><li>2</li></template></my-element>
        `, [createMyElement('<ul><au-slot></au-slot></ul>')], { 'my-element': [`<ul><li>1</li><li>2</li></ul>`, new AuSlotsInfo(['default'])] });
            yield new TestData('works with template controller(repeat) - same element (<template/>)', `
        <my-element><template au-slot repeat.for="i of 3"><li>\${i}</li></template></my-element>
        `, [createMyElement('<ul><au-slot></au-slot></ul>')], { 'my-element': [`<ul><li>0</li><li>1</li><li>2</li></ul>`, new AuSlotsInfo(['default'])] });
            yield new TestData('works with template controller(repeat) - same element (<template/>) - TC before au-slot', `
        <my-element><template repeat.for="i of 3" au-slot><li>\${i}</li></template></my-element>
        `, [createMyElement('<ul><au-slot></au-slot></ul>')], { 'my-element': [`<ul><li>0</li><li>1</li><li>2</li></ul>`, new AuSlotsInfo(['default'])] });
        }
        // #region containerless
        {
            yield new TestData('works with [containerless] + child (normal element + [au-slot])', `<my-element><div au-slot>Hello</div></my-element>`, [createMyElement('<au-slot></au-slot>', /* containerless */ true)], {}, (ctx) => {
                assert.html.innerEqual(ctx.host, '<div>Hello</div>');
            });
        }
        {
            yield new TestData('works with [containerless] + child (custom element + [au-slot])', `<my-element><my-child au-slot></my-child></my-element>`, [
                createMyElement('<au-slot></au-slot>', /* containerless */ true),
                CustomElement.define({ name: 'my-child', template: 'hello' })
            ], {}, (ctx) => {
                assert.html.innerEqual(ctx.host, '<my-child>hello</my-child>');
            });
        }
        {
            yield new TestData('works with [containerless] + ([repeat] + normal element + [au-slot])', `<my-element><template au-slot repeat.for="i of 3"><li>\${i}</li></template></my-element>`, [createMyElement('<ul><au-slot></au-slot></ul>', /* containerless */ true)], {}, (ctx) => {
                assert.html.innerEqual(ctx.host, '<ul><li>0</li><li>1</li><li>2</li></ul>');
            });
        }
        {
            yield new TestData('works with [containerless] + ([repeat] + custom element + [au-slot])', `<my-element><my-child au-slot repeat.for="i of 3" value.bind="i"></my-child></my-element>`, [
                createMyElement('<au-slot></au-slot>', /* containerless */ true),
                CustomElement.define({ name: 'my-child', template: `\${value}`, bindables: ['value'] }),
            ], {}, (ctx) => {
                assert.html.innerEqual(ctx.host, '<my-child>0</my-child><my-child>1</my-child><my-child>2</my-child>');
            });
        }
        {
            yield new TestData('works with [if][containerless] + ([repeat] + custom element + [au-slot])', `<my-element if.bind="true"><my-child au-slot repeat.for="i of 3" value.bind="i"></my-child></my-element>`, [
                createMyElement('<au-slot></au-slot>', /* containerless */ true),
                CustomElement.define({ name: 'my-child', template: `\${value}`, bindables: ['value'] })
            ], {}, async (ctx) => {
                assert.html.innerEqual(ctx.host, '<my-child>0</my-child><my-child>1</my-child><my-child>2</my-child>');
            });
        }
        {
            yield new TestData('works with [repeat][containerless] + ([repeat] + custom element + [au-slot])', `<my-element repeat.for="i of 3"><my-child au-slot value.bind="i"></my-child></my-element>`, [
                createMyElement('<au-slot></au-slot>', /* containerless */ true),
                CustomElement.define({ name: 'my-child', template: `\${value}`, bindables: ['value'] })
            ], {}, async (ctx) => {
                assert.html.innerEqual(ctx.host, '<my-child>0</my-child><my-child>1</my-child><my-child>2</my-child>');
            });
        }
        // #endregion
        // #region `repeat.for`
        {
            let MyElement = (() => {
                let _classDecorators = [customElement({
                        name: 'my-element', template: `
      <au-slot name="grid">
        <au-slot name="header">
          <h4>First Name</h4>
          <h4>Last Name</h4>
        </au-slot>
        <template repeat.for="person of people">
          <au-slot name="content" expose.bind="{ person, $index, $even, $odd }">
            <div>\${person.firstName}</div>
            <div>\${person.lastName}</div>
          </au-slot>
        </template>
      </au-slot>`
                    })];
                let _classDescriptor;
                let _classExtraInitializers = [];
                let _classThis;
                let _people_decorators;
                let _people_initializers = [];
                let _people_extraInitializers = [];
                var MyElement = _classThis = class {
                    constructor() {
                        this.people = __runInitializers(this, _people_initializers, void 0);
                        this.slots = (__runInitializers(this, _people_extraInitializers), resolve(IAuSlotsInfo));
                    }
                };
                __setFunctionName(_classThis, "MyElement");
                (() => {
                    const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
                    _people_decorators = [bindable];
                    __esDecorate(null, null, _people_decorators, { kind: "field", name: "people", static: false, private: false, access: { has: obj => "people" in obj, get: obj => obj.people, set: (obj, value) => { obj.people = value; } }, metadata: _metadata }, _people_initializers, _people_extraInitializers);
                    __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
                    MyElement = _classThis = _classDescriptor.value;
                    if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
                    __runInitializers(_classThis, _classExtraInitializers);
                })();
                return MyElement = _classThis;
            })();
            yield new TestData('works with template controller - repeater', `<my-element people.bind="people"></my-element>`, [
                MyElement,
            ], { 'my-element': [`<h4>First Name</h4><h4>Last Name</h4> <div>John</div><div>Doe</div> <div>Max</div><div>Mustermann</div>`, new AuSlotsInfo([])] }, async function ({ app, host }) {
                app.people.push(new Person('Jane', 'Doe', []));
                runTasks();
                assert.html.innerEqual('my-element', `<h4>First Name</h4><h4>Last Name</h4> <div>John</div><div>Doe</div> <div>Max</div><div>Mustermann</div> <div>Jane</div><div>Doe</div>`, 'my-element.innerHTML', host);
            });
            yield new TestData('supports replacing the parts of repeater template', `<my-element people.bind="people">
          <template au-slot="header">
            <h4>Meta</h4>
            <h4>Surname</h4>
            <h4>Given name</h4>
          </template><template au-slot="content">
            <div>\${$host.$index}-\${$host.$even}-\${$host.$odd}</div>
            <div>\${$host.person.lastName}</div>
            <div>\${$host.person.firstName}</div>
          </template>
        </my-element>`, [
                MyElement,
            ], { 'my-element': [`<h4>Meta</h4> <h4>Surname</h4> <h4>Given name</h4> <div>0-true-false</div> <div>Doe</div> <div>John</div> <div>1-false-true</div> <div>Mustermann</div> <div>Max</div>`, new AuSlotsInfo(['header', 'content'])] });
            yield new TestData('supports replacing the repeater template', `<my-element people.bind="people">
          <template au-slot="grid">
            <ul><li repeat.for="person of people">\${person.lastName}, \${person.firstName}</li></ul>
          </template>
        </my-element>
        <my-element people.bind="people">
          <template au-slot="grid">
            <ul><li repeat.for="person of $host.people">\${person.firstName} \${person.lastName}</li></ul>
          </template>
        </my-element>`, [
                MyElement,
            ], {
                'my-element': [`<ul><li>Doe, John</li><li>Mustermann, Max</li></ul>`, new AuSlotsInfo(['grid'])],
                'my-element:nth-of-type(2)': [`<ul><li>John Doe</li><li>Max Mustermann</li></ul>`, new AuSlotsInfo(['grid'])],
            });
            yield new TestData('works with a directly applied repeater', `<my-element></my-element>`, [
                createMyElement(`<au-slot repeat.for="i of 5">\${i}</au-slot>`),
            ], { 'my-element': [`01234`, new AuSlotsInfo([])], });
            yield new TestData('works with a directly applied repeater - with projection', `<my-element><template au-slot>\${$host.i*2}</template></my-element>`, [
                createMyElement(`<au-slot repeat.for="i of 5">\${i}</au-slot>`),
            ], { 'my-element': [`02468`, new AuSlotsInfo(['default'])], });
            yield new TestData('projection works for [repeat]>au-slot,[repeat]>au-slot', `<my-element><template au-slot>\${$host.i*2}</template></my-element>`, [
                createMyElement(`
            <template repeat.for="i of 5">
              <au-slot>\${i}</au-slot>
            </template>|
            <template repeat.for="i of 5">
              <au-slot>\${i + 2}</au-slot>
            </template>
            `),
            ], { 'my-element': [`0 2 4 6 8 | 0 2 4 6 8`, new AuSlotsInfo(['default'])], });
            yield new TestData('projection works for au-slot[repeat],au-slot[repeat]', `<my-element><template au-slot>\${$host.i*2}</template></my-element>`, [
                createMyElement(`<au-slot repeat.for="i of 5">\${i}</au-slot>|<au-slot repeat.for="i of 5">\${i + 2}</au-slot>`),
            ], { 'my-element': [`02468|02468`, new AuSlotsInfo(['default'])], });
            yield new TestData('projection works for [repeat]>au-slot[name="s1"]>au-slot[name="s2"],[repeat]>au-slot[name="s1"]>au-slot[name="s2"]', `<my-element><template au-slot="s2">\${$host.i*2}</template></my-element>`, [
                createMyElement(`
            <template>
              <template repeat.for="i of 5">
                <au-slot name="s1">\${i}<au-slot name="s2">\${i+2}</au-slot></au-slot>
                <au-slot name="s1">\${i+3}<au-slot name="s2">\${i+4}</au-slot></au-slot>
              </template>
            </template>`),
            ], { 'my-element': [`00 30 12 42 24 54 36 66 48 78`, new AuSlotsInfo(['s2'])], });
            yield new TestData('projection works for [repeat]>au-slot with another repeat', `<my-element><template au-slot="s1"><template repeat.for="i of 3">\${i*2}</template></template></my-element>`, [
                createMyElement(`
            <template>
              <template repeat.for="i of 2">
                <au-slot name="s1">\${i}</au-slot>
              </template>
            </template>`),
            ], { 'my-element': [`024 024`, new AuSlotsInfo(['s1'])], });
            yield new TestData('projection works for au-slot[repeat] with another repeat', `<my-element><template au-slot="s1"><template repeat.for="i of 3">\${i*2}</template></template></my-element>`, [
                createMyElement(`<au-slot name="s1" repeat.for="i of 2">\${i}</au-slot>`),
            ], { 'my-element': [`024024`, new AuSlotsInfo(['s1'])], });
            yield new TestData('projection works for au-slot[repeat] with another repeat', `<my-element><div au-slot="bar">First</div></my-element>
         <my-element><div au-slot="bar">Second</div></my-element>`, [
                createMyElement(`<let items.bind="[1,2]"></let>S<div repeat.for="item of items">\${item}<au-slot name="bar"></au-slot></div>E`),
            ], {
                'my-element': [`S<div>1<div>First</div></div><div>2<div>First</div></div>E`, new AuSlotsInfo(['bar'])],
                'my-element+my-element': [`S<div>1<div>Second</div></div><div>2<div>Second</div></div>E`, new AuSlotsInfo(['bar'])],
            });
            {
                let MyElement = (() => {
                    let _classDecorators = [customElement({
                            name: 'my-element', template: `
        <au-slot name="grid">
          <au-slot name="header">
            <h4>First Name</h4>
            <h4>Last Name</h4>
          </au-slot>
          <template repeat.for="person of people">
            <au-slot name="content" expose.bind="{ p: person, i: $index }">
              <div>\${person.firstName}</div>
              <div>\${person.lastName}</div>
            </au-slot>
          </template>
        </au-slot>`
                        })];
                    let _classDescriptor;
                    let _classExtraInitializers = [];
                    let _classThis;
                    let _people_decorators;
                    let _people_initializers = [];
                    let _people_extraInitializers = [];
                    var MyElement = _classThis = class {
                        constructor() {
                            this.people = __runInitializers(this, _people_initializers, void 0);
                            this.slots = (__runInitializers(this, _people_extraInitializers), resolve(IAuSlotsInfo));
                        }
                    };
                    __setFunctionName(_classThis, "MyElement");
                    (() => {
                        const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
                        _people_decorators = [bindable];
                        __esDecorate(null, null, _people_decorators, { kind: "field", name: "people", static: false, private: false, access: { has: obj => "people" in obj, get: obj => obj.people, set: (obj, value) => { obj.people = value; } }, metadata: _metadata }, _people_initializers, _people_extraInitializers);
                        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
                        MyElement = _classThis = _classDescriptor.value;
                        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
                        __runInitializers(_classThis, _classExtraInitializers);
                    })();
                    return MyElement = _classThis;
                })();
                yield new TestData('works when <au-slot/> re-defines properties', `<my-element people.bind="people">
            <template au-slot="header">
              <h4>Meta</h4>
              <h4>Surname</h4>
              <h4>Given name</h4>
            </template><template au-slot="content">
              <div>index: \${$host.i} \${$host.$index}</div>
              <div>\${$host.p.lastName}</div>
              <div>\${$host.p.firstName}</div>
            </template>
          </my-element>`, [
                    MyElement,
                ], {
                    'my-element': [
                        `<h4>Meta</h4> <h4>Surname</h4> <h4>Given name</h4> <div>index: 0 </div> <div>Doe</div> <div>John</div> <div>index: 1 </div> <div>Mustermann</div> <div>Max</div>`,
                        new AuSlotsInfo(['header', 'content'])
                    ]
                });
            }
            {
                class MyElement {
                    constructor() {
                        this.slots = resolve(IAuSlotsInfo);
                    }
                }
                yield new TestData('works with table', `<my-element items.bind="[{p1: 1, p2: 2}, {p1: 11, p2: 22}]"><template au-slot="header"><th>p1</th><th>p2</th></template><template au-slot="content"><td>\${$host.item.p1}</td><td>\${$host.item.p2}</td></template></my-element>`, [
                    CustomElement.define({
                        name: 'my-element',
                        template: `<table><thead><tr><template as-element="au-slot" name="header"></template></tr></thead><tbody><tr repeat.for="item of items"><template as-element="au-slot" name="content"></template></tr></tbody></table>`,
                        bindables: ['items'],
                    }, MyElement),
                ], {
                    'my-element': [`<table><thead><tr><th>p1</th><th>p2</th></tr></thead><tbody><tr><td>1</td><td>2</td></tr><tr><td>11</td><td>22</td></tr></tbody></table>`, new AuSlotsInfo(['header', 'content'])],
                });
            }
            yield new TestData('works with data from repeater scope - template[repeat.for]>custom-element - source: override context in outer scope', `<let items.bind="['1', '2']"></let>
         <template repeat.for="item of items">
          <my-element>
            <template au-slot>
              \${item}
            </template>
          </my-element>
         </template>`, [
                createMyElement('<au-slot></au-slot>')
            ], {
                'my-element': [`1`, new AuSlotsInfo(['default'])],
                'my-element+my-element': [`2`, new AuSlotsInfo(['default'])],
            });
            yield new TestData('works with data from repeater scope - custom-element[repeat.for] - source: override context in outer scope', `<let items.bind="['1', '2']"></let>
        <my-element repeat.for="item of items">
          <template au-slot>
            \${item}
          </template>
        </my-element>`, [
                createMyElement('<au-slot></au-slot>')
            ], {
                'my-element': [`1`, new AuSlotsInfo(['default'])],
                'my-element+my-element': [`2`, new AuSlotsInfo(['default'])],
            });
            yield new TestData('works with data from repeater scope - template[repeat.for]>custom-element - source: binding context in outer scope', `<template>
          <template repeat.for="person of people">
            <my-element>
              <template au-slot>
                \${person.firstName}
              </template>
            </my-element>
          </template>
         </template>`, [
                createMyElement('<au-slot></au-slot>')
            ], {
                'my-element': [`John`, new AuSlotsInfo(['default'])],
                'my-element+my-element': [`Max`, new AuSlotsInfo(['default'])],
            });
            yield new TestData('works with data from repeater scope - custom-element[repeat.for] - source: binding context in outer scope', `<my-element repeat.for="person of people">
          <template au-slot>
            \${person.firstName}
          </template>
        </my-element>`, [
                createMyElement('<au-slot></au-slot>')
            ], {
                'my-element': [`John`, new AuSlotsInfo(['default'])],
                'my-element+my-element': [`Max`, new AuSlotsInfo(['default'])],
            });
            {
                let counter = 0;
                const expected = Object.fromEntries(new Array(3)
                    .fill(0)
                    .flatMap((_, i) => new Array(3)
                    .fill(0)
                    .map((__, j) => [
                    new Array(++counter).fill('my-element').join('+'),
                    [String(i * j), new AuSlotsInfo(['default'])]
                ])));
                yield new TestData('works with data from repeater scope - template[repeat.for]>template[repeat.for]>custom-element - nested repeater', `<template>
          <template repeat.for="i of 3">
            <template repeat.for="j of 3">
              <my-element>
                <template au-slot>
                  \${i*j}
                </template>
              </my-element>
            </template>
          </template>
         </template>`, [
                    createMyElement('<au-slot></au-slot>')
                ], expected);
                yield new TestData('works with data from repeater scope - template[repeat.for]>custom-element[repeat.for] - nested repeater', `<template>
          <template repeat.for="i of 3">
            <my-element repeat.for="j of 3">
              <template au-slot>
                \${i*j}
              </template>
            </my-element>
          </template>
         </template>`, [
                    createMyElement('<au-slot></au-slot>')
                ], expected);
                yield new TestData('works with data from repeater scope - template[repeat.for]>template[repeat.for]>custom-element - nested repeater - source: override context', `<let rows.bind="3" cols.bind="3"></let>
          <template repeat.for="i of rows">
            <template repeat.for="j of cols">
              <my-element>
                <template au-slot>
                  \${i*j}
                </template>
              </my-element>
            </template>
          </template>`, [
                    createMyElement('<au-slot></au-slot>')
                ], expected);
                yield new TestData('works with data from repeater scope - template[repeat.for]>custom-element[repeat.for] - nested repeater - source: override context', `<let rows.bind="3" cols.bind="3"></let>
          <template repeat.for="i of rows">
            <my-element repeat.for="j of cols">
              <template au-slot>
                \${i*j}
              </template>
            </my-element>
          </template>`, [
                    createMyElement('<au-slot></au-slot>')
                ], expected);
            }
            {
                const expected = {
                    'my-element': ['John Mustermann', new AuSlotsInfo(['default'])],
                    'my-element+my-element': ['John Doe', new AuSlotsInfo(['default'])],
                    'my-element+my-element+my-element': ['Max Mustermann', new AuSlotsInfo(['default'])],
                    'my-element+my-element+my-element+my-element': ['Max Doe', new AuSlotsInfo(['default'])],
                };
                yield new TestData('works with data from repeater scope - template[repeat.for]>template[repeat.for]>custom-element - nested repeater - source: binding context', `<template>
          <template repeat.for="i of people">
            <template repeat.for="j of people.slice().reverse()">
              <my-element>
                <template au-slot>
                  \${i.firstName} \${j.lastName}
                </template>
              </my-element>
            </template>
          </template>
        </template>`, [
                    createMyElement('<au-slot></au-slot>')
                ], expected);
                yield new TestData('works with data from repeater scope - template[repeat.for]>custom-element[repeat.for] - nested repeater - source: binding context', `<template>
          <template repeat.for="i of people">
            <my-element repeat.for="j of people.slice().reverse()">
              <template au-slot>
                \${i.firstName} \${j.lastName}
              </template>
            </my-element>
          </template>
        </template>
        `, [
                    createMyElement('<au-slot></au-slot>')
                ], expected);
            }
            {
                let ListBox = (() => {
                    let _classDecorators = [customElement({
                            name: 'list-box',
                            template: `<div><au-slot></au-slot></div>`
                        })];
                    let _classDescriptor;
                    let _classExtraInitializers = [];
                    let _classThis;
                    let _value_decorators;
                    let _value_initializers = [];
                    let _value_extraInitializers = [];
                    var ListBox = _classThis = class {
                        constructor() {
                            this.value = __runInitializers(this, _value_initializers, void 0);
                            __runInitializers(this, _value_extraInitializers);
                        }
                    };
                    __setFunctionName(_classThis, "ListBox");
                    (() => {
                        const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
                        _value_decorators = [bindable];
                        __esDecorate(null, null, _value_decorators, { kind: "field", name: "value", static: false, private: false, access: { has: obj => "value" in obj, get: obj => obj.value, set: (obj, value) => { obj.value = value; } }, metadata: _metadata }, _value_initializers, _value_extraInitializers);
                        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
                        ListBox = _classThis = _classDescriptor.value;
                        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
                        __runInitializers(_classThis, _classExtraInitializers);
                    })();
                    return ListBox = _classThis;
                })();
                let i = 0;
                let Assignee = (() => {
                    let _classDecorators = [customElement({
                            name: 'assignee',
                            template: `<list-box value.two-way="value">
          <template au-slot>
            \${value}
          </template>
        </list-box>`
                        })];
                    let _classDescriptor;
                    let _classExtraInitializers = [];
                    let _classThis;
                    var Assignee = _classThis = class {
                        binding() {
                            this.value = i++;
                        }
                    };
                    __setFunctionName(_classThis, "Assignee");
                    (() => {
                        const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
                        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
                        Assignee = _classThis = _classDescriptor.value;
                        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
                        __runInitializers(_classThis, _classExtraInitializers);
                    })();
                    return Assignee = _classThis;
                })();
                let ItemRow = (() => {
                    let _classDecorators = [customElement({
                            name: 'item-row',
                            template: `<div><assignee></assignee></div>`
                        })];
                    let _classDescriptor;
                    let _classExtraInitializers = [];
                    let _classThis;
                    var ItemRow = _classThis = class {
                    };
                    __setFunctionName(_classThis, "ItemRow");
                    (() => {
                        const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
                        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
                        ItemRow = _classThis = _classDescriptor.value;
                        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
                        __runInitializers(_classThis, _classExtraInitializers);
                    })();
                    return ItemRow = _classThis;
                })();
                yield new TestData('coping works correctly in conjunction with repeat.for', `<item-row repeat.for="_ of 3"></item-row>`, [
                    ListBox, Assignee, ItemRow
                ], {
                    'item-row': ['<div><assignee><list-box><div> 0 </div></list-box></assignee></div>', null],
                    'item-row+item-row': ['<div><assignee><list-box><div> 1 </div></list-box></assignee></div>', null],
                    'item-row+item-row+item-row': ['<div><assignee><list-box><div> 2 </div></list-box></assignee></div>', null],
                });
            }
        }
        // #endregion
        // #region `with`
        {
            yield new TestData('works with "with" on parent', `<my-element people.bind="people"> <div au-slot>\${$host.item.lastName}</div> </my-element>`, [
                createMyElement(`<div with.bind="{item: people[0]}"><au-slot>\${item.firstName}</au-slot></div>`),
            ], { 'my-element': [`<div><div>Doe</div></div>`, new AuSlotsInfo(['default'])] });
            yield new TestData('works with "with" on parent - outer scope', `<let item.bind="people[1]"></let><my-element people.bind="people"> <div au-slot>\${item.lastName}</div> </my-element>`, [
                createMyElement(`<div with.bind="{item: people[0]}"><au-slot>\${item.firstName}</au-slot></div>`),
            ], { 'my-element': [`<div><div>Mustermann</div></div>`, new AuSlotsInfo(['default'])] });
            yield new TestData('works with "with" on self', `<my-element people.bind="people"> <div au-slot>\${$host.item.lastName}</div> </my-element>`, [
                createMyElement(`<au-slot with.bind="{item: people[0]}">\${item.firstName}</au-slot>`),
            ], { 'my-element': [`<div>Doe</div>`, new AuSlotsInfo(['default'])] });
            yield new TestData('works with "with" on self - outer scope', `<let item.bind="people[1]"></let><my-element people.bind="people"> <div au-slot>\${item.lastName}</div> </my-element>`, [
                createMyElement(`<au-slot with.bind="{item: people[0]}">\${item.firstName}</au-slot>`),
            ], { 'my-element': [`<div>Mustermann</div>`, new AuSlotsInfo(['default'])] });
            yield new TestData('works replacing div[with]>au-slot[name=s1]>au-slot[name=s2]', `<my-element people.bind="people"> <div au-slot="s2">\${$host.item.firstName}</div> </my-element>`, [
                createMyElement(`<div with.bind="{item: people[0]}"><au-slot name="s1">\${item.firstName}<au-slot name="s2">\${item.lastName}</au-slot></au-slot></div>`),
            ], { 'my-element': [`<div>John<div>John</div></div>`, new AuSlotsInfo(['s2'])] });
            yield new TestData('works replacing div[with]>au-slot[name=s1]>au-slot[name=s2] - outer scope', `<let item.bind="people[1]"></let><my-element people.bind="people"> <div au-slot="s2">\${item.firstName}</div> </my-element>`, [
                createMyElement(`<div with.bind="{item: people[0]}"><au-slot name="s1">\${item.firstName}<au-slot name="s2">\${item.lastName}</au-slot></au-slot></div>`),
            ], { 'my-element': [`<div>John<div>Max</div></div>`, new AuSlotsInfo(['s2'])] });
            yield new TestData('works replacing au-slot[name=s1]>div[with]>au-slot[name=s2]', `<my-element people.bind="people"> <div au-slot="s2">\${$host.item.firstName}</div> </my-element>`, [
                createMyElement(`<au-slot name="s1">\${people[0].firstName}<div with.bind="{item: people[0]}"><au-slot name="s2">\${item.lastName}</au-slot></div></au-slot>`),
            ], { 'my-element': [`John<div><div>John</div></div>`, new AuSlotsInfo(['s2'])] });
            yield new TestData('works replacing au-slot[name=s1]>div[with]>au-slot[name=s2] - outer scope', `<let item.bind="people[1]"></let><my-element people.bind="people"> <div au-slot="s2">\${item.firstName}</div> </my-element>`, [
                createMyElement(`<au-slot name="s1">\${people[0].firstName}<div with.bind="{item: people[0]}"><au-slot name="s2">\${item.lastName}</au-slot></div></au-slot>`),
            ], { 'my-element': [`John<div><div>Max</div></div>`, new AuSlotsInfo(['s2'])] });
            yield new TestData('works replacing au-slot[name=s1]>au-slot[name=s2][with]', `<my-element people.bind="people"> <div au-slot="s2">\${$host.item.firstName}</div> </my-element>`, [
                createMyElement(`<au-slot name="s1">\${people[0].firstName}<au-slot name="s2" with.bind="{item: people[0]}">\${item.lastName}</au-slot></au-slot>`),
            ], { 'my-element': [`John<div>John</div>`, new AuSlotsInfo(['s2'])] });
            yield new TestData('works replacing au-slot[name=s1]>au-slot[name=s2][with] - outer scope', `<let item.bind="people[1]"></let><my-element people.bind="people"> <div au-slot="s2">\${item.firstName}</div> </my-element>`, [
                createMyElement(`<au-slot name="s1">\${people[0].firstName}<au-slot name="s2" with.bind="{item: people[0]}">\${item.lastName}</au-slot></au-slot>`),
            ], { 'my-element': [`John<div>Max</div>`, new AuSlotsInfo(['s2'])] });
            yield new TestData('works replacing div[with]>au-slot,div[with]au-slot', `<my-element people.bind="people"> <template au-slot>\${$host.item.lastName}</template> </my-element>`, [
                createMyElement(`<div with.bind="{item: people[0]}"><au-slot>\${item.firstName}</au-slot></div><div with.bind="{item: people[1]}"><au-slot>\${item.firstName}</au-slot></div>`),
            ], { 'my-element': [`<div>Doe</div><div>Mustermann</div>`, new AuSlotsInfo(['default'])] });
            yield new TestData('works replacing au-slot[with],au-slot[with]', `<my-element people.bind="people"> <div au-slot>\${$host.item.lastName}</div> </my-element>`, [
                createMyElement(`<au-slot with.bind="{item: people[0]}">\${item.firstName}</au-slot><au-slot with.bind="{item: people[1]}">\${item.firstName}</au-slot>`),
            ], { 'my-element': [`<div>Doe</div><div>Mustermann</div>`, new AuSlotsInfo(['default'])] }, void 0);
        }
        // #endregion
        // #endregion
        // #region complex templating
        {
            let CollVwr = (() => {
                let _classDecorators = [customElement({ name: 'coll-vwr', template: `<au-slot name="colleslawt"><div repeat.for="item of collection">\${item}</div></au-slot>` })];
                let _classDescriptor;
                let _classExtraInitializers = [];
                let _classThis;
                let _collection_decorators;
                let _collection_initializers = [];
                let _collection_extraInitializers = [];
                var CollVwr = _classThis = class {
                    constructor() {
                        this.collection = __runInitializers(this, _collection_initializers, void 0);
                        __runInitializers(this, _collection_extraInitializers);
                    }
                };
                __setFunctionName(_classThis, "CollVwr");
                (() => {
                    const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
                    _collection_decorators = [bindable];
                    __esDecorate(null, null, _collection_decorators, { kind: "field", name: "collection", static: false, private: false, access: { has: obj => "collection" in obj, get: obj => obj.collection, set: (obj, value) => { obj.collection = value; } }, metadata: _metadata }, _collection_initializers, _collection_extraInitializers);
                    __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
                    CollVwr = _classThis = _classDescriptor.value;
                    if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
                    __runInitializers(_classThis, _classExtraInitializers);
                })();
                return CollVwr = _classThis;
            })();
            let MyElement = (() => {
                let _classDecorators = [customElement({
                        name: 'my-element', template: `
      <au-slot name="grid">
        <au-slot name="header">
          <h4>First Name</h4>
          <h4>Last Name</h4>
          <h4>Pets</h4>
        </au-slot>
        <template repeat.for="person of people">
          <au-slot name="content">
            <div>\${person.firstName}</div>
            <div>\${person.lastName}</div>
            <coll-vwr collection.bind="person.pets"></coll-vwr>
          </au-slot>
        </template>
      </au-slot>`
                    })];
                let _classDescriptor;
                let _classExtraInitializers = [];
                let _classThis;
                let _people_decorators;
                let _people_initializers = [];
                let _people_extraInitializers = [];
                var MyElement = _classThis = class {
                    constructor() {
                        this.people = __runInitializers(this, _people_initializers, void 0);
                        this.slots = (__runInitializers(this, _people_extraInitializers), resolve(IAuSlotsInfo));
                    }
                };
                __setFunctionName(_classThis, "MyElement");
                (() => {
                    const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
                    _people_decorators = [bindable];
                    __esDecorate(null, null, _people_decorators, { kind: "field", name: "people", static: false, private: false, access: { has: obj => "people" in obj, get: obj => obj.people, set: (obj, value) => { obj.people = value; } }, metadata: _metadata }, _people_initializers, _people_extraInitializers);
                    __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
                    MyElement = _classThis = _classDescriptor.value;
                    if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
                    __runInitializers(_classThis, _classExtraInitializers);
                })();
                return MyElement = _classThis;
            })();
            yield new TestData('simple nesting', `<my-element people.bind="people"></my-element>`, [
                CollVwr,
                MyElement,
            ], { 'my-element': ['<h4>First Name</h4><h4>Last Name</h4><h4>Pets</h4> <div>John</div><div>Doe</div><coll-vwr><div>Browny</div><div>Smokey</div></coll-vwr> <div>Max</div><div>Mustermann</div><coll-vwr><div>Sea biscuit</div><div>Swift Thunder</div></coll-vwr>', new AuSlotsInfo([])] });
            yield new TestData('transitive projections works', `<my-element people.bind="people">
          <template au-slot="content">
            <div>\${$host.person.firstName}</div>
            <div>\${$host.person.lastName}</div>
            <coll-vwr collection.bind="$host.person.pets">
              <ul au-slot="colleslawt"><li repeat.for="item of $host.collection">\${item}</li></ul>
            </coll-vwr>
          </template>
        </my-element>`, [
                CollVwr,
                MyElement,
            ], { 'my-element': [
                    '<h4>First Name</h4><h4>Last Name</h4><h4>Pets</h4> <div>John</div> <div>Doe</div> <coll-vwr><ul><li>Browny</li><li>Smokey</li></ul></coll-vwr> <div>Max</div> <div>Mustermann</div> <coll-vwr><ul><li>Sea biscuit</li><li>Swift Thunder</li></ul></coll-vwr>',
                    new AuSlotsInfo(['content'])
                ] });
            yield new TestData('transitive projections with let-binding works - 1', `<my-element people.bind="people">
          <template au-slot="content">
            <let person.bind="$host.person"></let>
            <div>\${person.firstName}</div>
            <div>\${person.lastName}</div>
            <coll-vwr collection.bind="person.pets">
              <ul au-slot="colleslawt"><li repeat.for="item of $host.collection">\${item}</li></ul>
            </coll-vwr>
          </template>
        </my-element>`, [
                CollVwr,
                MyElement,
            ], { 'my-element': ['<h4>First Name</h4><h4>Last Name</h4><h4>Pets</h4> <div>John</div> <div>Doe</div> <coll-vwr><ul><li>Browny</li><li>Smokey</li></ul></coll-vwr> <div>Max</div> <div>Mustermann</div> <coll-vwr><ul><li>Sea biscuit</li><li>Swift Thunder</li></ul></coll-vwr>', new AuSlotsInfo(['content'])] });
            yield new TestData('transitive projections with let-binding works - 2', `<my-element people.bind="people">
          <template au-slot="content">
            <let h.bind="$host"></let>
            <div>\${h.person.firstName}</div>
            <div>\${h.person.lastName}</div>
            <coll-vwr collection.bind="h.person.pets">
              <ul au-slot="colleslawt"><li repeat.for="item of $host.collection">\${item}</li></ul>
            </coll-vwr>
          </template>
        </my-element>`, [
                CollVwr,
                MyElement,
            ], {
                'my-element': [
                    '<h4>First Name</h4><h4>Last Name</h4><h4>Pets</h4> <div>John</div> <div>Doe</div> <coll-vwr><ul><li>Browny</li><li>Smokey</li></ul></coll-vwr> <div>Max</div> <div>Mustermann</div> <coll-vwr><ul><li>Sea biscuit</li><li>Swift Thunder</li></ul></coll-vwr>',
                    new AuSlotsInfo(['content'])
                ],
            });
            // tag: nonsense-example
            yield new TestData('direct projection attempt for a transitive slot does not work', `<my-element people.bind="people">
          <ul au-slot="colleslawt"><li repeat.for="item of $host.collection">\${item}</li></ul>
        </my-element>`, [
                CollVwr,
                MyElement,
            ], { 'my-element': ['<h4>First Name</h4><h4>Last Name</h4><h4>Pets</h4> <div>John</div><div>Doe</div><coll-vwr><div>Browny</div><div>Smokey</div></coll-vwr> <div>Max</div><div>Mustermann</div><coll-vwr><div>Sea biscuit</div><div>Swift Thunder</div></coll-vwr>', new AuSlotsInfo(['colleslawt'])] });
            yield new TestData('duplicate slot works', `<my-element></my-element>`, [
                createMyElement(`<au-slot>d1</au-slot>|<au-slot name="s1">s11</au-slot>|<au-slot>d2</au-slot>|<au-slot name="s1">s12</au-slot>`),
            ], { 'my-element': ['d1|s11|d2|s12', new AuSlotsInfo([])] });
            yield new TestData('projection to duplicate slots results in repetitions', `<my-element><template au-slot="default">dp</template><template au-slot="s1">s1p</template></my-element>`, [
                createMyElement(`<au-slot>d1</au-slot>|<au-slot name="s1">s11</au-slot>|<au-slot>d2</au-slot>|<au-slot name="s1">s12</au-slot>`),
            ], { 'my-element': ['dp|s1p|dp|s1p', new AuSlotsInfo(['default', 's1'])] });
            yield new TestData('projection works correctly with nested elements with same slot name', `<my-element-s11>
          <template au-slot="s1">
          p1
          <my-element-s12>
            <template au-slot="s1">
              p2
            </template>
          </my-element-s12>
          </template>
        </my-element-s11>`, [
                CustomElement.define({ name: 'my-element-s11', template: `<au-slot name="s1">s11</au-slot>` }, class MyElement {
                }),
                CustomElement.define({ name: 'my-element-s12', template: `<au-slot name="s1">s12</au-slot>` }, class MyElement {
                }),
            ], { 'my-element-s11': ['p1 <my-element-s12> p2 </my-element-s12>', null] });
            yield new TestData('au-slot>CE works - fallback', `<my-element></my-element>`, [
                CustomElement.define({ name: 'my-element', template: `<au-slot name="s1"><foo-bar foo.bind="message"></foo-bar></au-slot>` }, class MyElement {
                    constructor() {
                        this.message = 'inner';
                    }
                }),
                CustomElement.define({ name: 'foo-bar', template: `\${foo}`, bindables: ['foo'] }, class MyElement {
                }),
            ], { 'my-element': ['<foo-bar>inner</foo-bar>', null] });
            yield new TestData('CE[au-slot] works - non $host', `<my-element>
          <foo-bar au-slot="s1" foo.bind="message"></foo-bar>
        </my-element>`, [
                createMyElement(`<au-slot name="s1">s1fb</au-slot>`),
                CustomElement.define({ name: 'foo-bar', template: `\${foo}`, bindables: ['foo'] }, class MyElement {
                }),
            ], { 'my-element': ['<foo-bar>root</foo-bar>', new AuSlotsInfo(['s1'])] });
            {
                class MyElement {
                    constructor() {
                        this.message = 'inner';
                        this.slots = resolve(IAuSlotsInfo);
                    }
                }
                yield new TestData('CE[au-slot] works - $host', `<my-element>
          <foo-bar au-slot="s1" foo.bind="$host.message"></foo-bar>
        </my-element>`, [
                    CustomElement.define({ name: 'my-element', template: `<au-slot name="s1">s1fb</au-slot>` }, MyElement),
                    CustomElement.define({ name: 'foo-bar', template: `\${foo}`, bindables: ['foo'] }, class MyElement {
                    }),
                ], { 'my-element': ['<foo-bar>inner</foo-bar>', new AuSlotsInfo(['s1'])] });
            }
            // tag: nonsense-example
            yield new TestData('projection to a non-existing slot has no effect', `<my-element-s11>
          <template au-slot="s2">
          p1
          </template>
        </my-element-s11>`, [
                CustomElement.define({ name: 'my-element-s11', template: `<au-slot name="s1">s11</au-slot>` }, class MyElement {
                }),
                CustomElement.define({ name: 'my-element-s12', template: `<au-slot name="s1">s12</au-slot>` }, class MyElement {
                }),
            ], { 'my-element-s11': ['s11', null] });
            // tag: nonsense-example, mis-projection
            yield new TestData('projection attempted using <au-slot> instead of [au-slot] results in mis-projection', `<my-element>
          <au-slot name="s1">
            mis-projected
          </au-slot>
          <au-slot name="foo">
            bar
          </au-slot>
        </my-element>`, [
                createMyElement(`<au-slot>dfb</au-slot>|<au-slot name="s1">s1fb</au-slot>`),
            ], 
            // 2 au slots should go into the default slot
            // causing the default to disappear
            // so the projection should be
            // fallback of <au-slot name=s1>
            // + fallback of <au-slot name=foo>
            // + |
            // + fallback of <au-slot name=s1>
            { 'my-element': ['mis-projected bar |s1fb', new AuSlotsInfo(['default'])] });
            // tag: nonsense-example
            yield new TestData('[au-slot] in <au-slot> is no-op', `<my-element></my-element>`, [
                createMyElement(`<au-slot name="s1"><div au-slot="s1">no-op</div></au-slot>`),
            ], { 'my-element': ['', new AuSlotsInfo([])] });
            yield new TestData('<au-slot> in [au-slot] works', `<my-element>
          <div au-slot="s1">
            <au-slot name="does-not-matter">
              projection
            </au-slot>
          </div>
        </my-element>`, [
                createMyElement(`<au-slot name="s1"></au-slot>`),
            ], { 'my-element': ['<div> projection </div>', new AuSlotsInfo(['s1'])] });
            // tag: nonsense-example
            yield new TestData('[au-slot] -> <au-slot> -> [au-slot](ignored)', `<my-element>
          <div au-slot="s1">
            <au-slot name="does-not-matter">
              projection
              <span au-slot="s1">ignored</span>
            </au-slot>
          </div>
        </my-element>`, [
                createMyElement(`<au-slot name="s1"></au-slot>`),
            ], { 'my-element': ['<div> projection </div>', new AuSlotsInfo(['s1'])] });
            // tag: nonsense-example
            yield new TestData('[au-slot] -> <au-slot> -> [au-slot](ignored) -> <au-slot>(ignored)', `<my-element>
          <div au-slot="s1">
            <au-slot name="does-not-matter">
              projection
              <span au-slot="s1">
                ignored
                <au-slot name="dnc">fb</au-slot>
              </span>
            </au-slot>
          </div>
        </my-element>`, [
                createMyElement(`<au-slot name="s1"></au-slot>`),
            ], { 'my-element': ['<div> projection </div>', new AuSlotsInfo(['s1'])] });
            // tag: chained-projection
            yield new TestData('chain of [au-slot] and <au-slot> can be used to project content to a nested inner CE', `<lvl-one><div au-slot="s1">p</div></lvl-one>`, [
                CustomElement.define({ name: 'lvl-zero', template: `<au-slot name="s0"></au-slot>` }, class LvlZero {
                }),
                CustomElement.define({ name: 'lvl-one', template: `<lvl-zero><template au-slot="s0"><au-slot name="s1"></au-slot></template></lvl-zero>` }, class LvlOne {
                }),
            ], { '': ['<lvl-one><lvl-zero><div>p</div></lvl-zero></lvl-one>', null] });
            yield new TestData('chain of [au-slot] and <au-slot> can be used to project content to a nested inner CE - with same slot name', `<lvl-one><div au-slot="x">p</div></lvl-one>`, [
                CustomElement.define({ name: 'lvl-zero', template: `<au-slot name="x"></au-slot>` }, class LvlZero {
                }),
                CustomElement.define({ name: 'lvl-one', template: `<lvl-zero><template au-slot="x"><au-slot name="x"></au-slot></template></lvl-zero>` }, class LvlOne {
                }),
            ], { '': ['<lvl-one><lvl-zero><div>p</div></lvl-zero></lvl-one>', null] });
            // tag: nonsense-example, utterly-complex
            yield new TestData('projection does not work using <au-slot> or to non-existing slot', `<parent-element>
          <div id="1" au-slot="x">
            <au-slot name="x"> p </au-slot>
          </div>
          <au-slot id="2" name="x">
            <div au-slot="x"></div>
          </au-slot>
        </parent-element>`, [
                CustomElement.define({ name: 'child-element', template: `<au-slot name="x"></au-slot>` }, class ChildElement {
                }),
                CustomElement.define({
                    name: 'parent-element',
                    template: `<child-element>
              <div id="3" au-slot="x"><au-slot name="x">p1</au-slot></div>
              <au-slot au-slot="x" name="x"><div id="4" au-slot="x">p2</div></au-slot>
            </child-element>`
                }, class ParentElement {
                }),
            ], 
            /**
             * Explanation:
             * - The `<div id="3"><div id="1"> p </div></div>` is caused by the `chained-projection`.
             * - The 2nd `<div id="1"> p </div>` is caused by `mis-projection`.
             * See the respective tagged test cases to understand the simpler examples first.
             * The `ROOT>parent-element>au-slot` in this case is a no-op, as `<au-slot>` cannot be used provide projection.
             * However if the root instead is used a normal CE in another CE, the same au-slot then advertise projection slot.
             */
            {
                // '': ['<parent-element><child-element> <div id="1">p</div><div id="3"><div id="1">p</div></div></child-element></parent-element>', null],
                '': [
                    hJsx("parent-element", null,
                        hJsx("child-element", null,
                            hJsx("div", { id: "3" },
                                hJsx("div", { id: "1" }, " p ")),
                            hJsx("div", { id: "1" }, " p "))),
                    null
                ],
            });
            {
                const createAuSlot = (level) => {
                    let currentLevel = 0;
                    let template = '';
                    while (level > currentLevel) {
                        template += `<au-slot name="s${currentLevel + 1}">s${currentLevel + 1}fb`;
                        ++currentLevel;
                    }
                    while (currentLevel > 0) {
                        template += '</au-slot>';
                        --currentLevel;
                    }
                    return template;
                };
                const buildExpectedTextContent = (level) => {
                    if (level === 1) {
                        return 'p';
                    }
                    let content = '';
                    let i = 1;
                    while (level >= i) {
                        content += i === level ? 'p' : `s${i}fb`;
                        ++i;
                    }
                    return content;
                };
                class MyElement {
                    constructor() {
                        this.slots = resolve(IAuSlotsInfo);
                    }
                }
                for (let i = 1; i < 11; i++) {
                    yield new TestData(`projection works for deeply nested <au-slot>; nesting level: ${i}`, `<my-element><template au-slot="s${i}">p</template></my-element>`, [
                        CustomElement.define({ name: 'my-element', template: createAuSlot(i) }, MyElement),
                    ], { 'my-element': [buildExpectedTextContent(i), new AuSlotsInfo([`s${i}`])] });
                }
            }
            {
                const createAuSlot = (level) => {
                    let currentLevel = 0;
                    let template = '';
                    while (level > currentLevel) {
                        template += `<au-slot name="s${currentLevel + 1}">s${currentLevel + 1}fb</au-slot>`;
                        ++currentLevel;
                    }
                    return template;
                };
                const buildProjection = (level) => {
                    if (level === 1) {
                        return '<template au-slot="s1">p1</template>';
                    }
                    let content = '';
                    let i = 1;
                    while (level >= i) {
                        content += `<template au-slot="s${i}">p${i}</template>`;
                        ++i;
                    }
                    return content;
                };
                const buildExpectation = (level) => {
                    if (level === 1) {
                        return ['p1', new AuSlotsInfo(['s1'])];
                    }
                    const slots = [];
                    let content = '';
                    let i = 1;
                    while (level >= i) {
                        content += `p${i}`;
                        slots.push(`s${i}`);
                        ++i;
                    }
                    return [content, new AuSlotsInfo(slots)];
                };
                for (let i = 1; i < 11; i++) {
                    class MyElement {
                        constructor() {
                            this.slots = resolve(IAuSlotsInfo);
                        }
                    }
                    yield new TestData(`projection works for all non-nested <au-slot>; count: ${i}`, `<my-element>${buildProjection(i)}</my-element>`, [
                        CustomElement.define({ name: 'my-element', template: createAuSlot(i) }, MyElement),
                    ], { 'my-element': buildExpectation(i) });
                }
            }
            {
                let Elem = (() => {
                    let _classDecorators = [customElement({
                            name: 'elem',
                            template: `Parent \${text}
          <notch>
            <child au-slot text.bind="text" view-model.ref="child"></child>
          </notch>
          \${child.id}`,
                        })];
                    let _classDescriptor;
                    let _classExtraInitializers = [];
                    let _classThis;
                    let _text_decorators;
                    let _text_initializers = [];
                    let _text_extraInitializers = [];
                    var Elem = _classThis = class {
                        constructor() {
                            this.text = __runInitializers(this, _text_initializers, void 0);
                            __runInitializers(this, _text_extraInitializers);
                        }
                    };
                    __setFunctionName(_classThis, "Elem");
                    (() => {
                        const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
                        _text_decorators = [bindable];
                        __esDecorate(null, null, _text_decorators, { kind: "field", name: "text", static: false, private: false, access: { has: obj => "text" in obj, get: obj => obj.text, set: (obj, value) => { obj.text = value; } }, metadata: _metadata }, _text_initializers, _text_extraInitializers);
                        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
                        Elem = _classThis = _classDescriptor.value;
                        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
                        __runInitializers(_classThis, _classExtraInitializers);
                    })();
                    return Elem = _classThis;
                })();
                let Notch = (() => {
                    let _classDecorators = [customElement({
                            name: 'notch',
                            template: `Notch <au-slot></au-slot>`,
                        })];
                    let _classDescriptor;
                    let _classExtraInitializers = [];
                    let _classThis;
                    var Notch = _classThis = class {
                    };
                    __setFunctionName(_classThis, "Notch");
                    (() => {
                        const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
                        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
                        Notch = _classThis = _classDescriptor.value;
                        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
                        __runInitializers(_classThis, _classExtraInitializers);
                    })();
                    return Notch = _classThis;
                })();
                let id = 0;
                let Child = (() => {
                    let _classDecorators = [customElement({
                            name: 'child',
                            template: `Id: \${id}. Child \${text}`,
                        })];
                    let _classDescriptor;
                    let _classExtraInitializers = [];
                    let _classThis;
                    let _text_decorators;
                    let _text_initializers = [];
                    let _text_extraInitializers = [];
                    var Child = _classThis = class {
                        constructor() {
                            this.text = __runInitializers(this, _text_initializers, void 0);
                            this.id = (__runInitializers(this, _text_extraInitializers), id++);
                        }
                    };
                    __setFunctionName(_classThis, "Child");
                    (() => {
                        const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
                        _text_decorators = [bindable];
                        __esDecorate(null, null, _text_decorators, { kind: "field", name: "text", static: false, private: false, access: { has: obj => "text" in obj, get: obj => obj.text, set: (obj, value) => { obj.text = value; } }, metadata: _metadata }, _text_initializers, _text_extraInitializers);
                        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
                        Child = _classThis = _classDescriptor.value;
                        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
                        __runInitializers(_classThis, _classExtraInitializers);
                    })();
                    return Child = _classThis;
                })();
                yield new TestData('multiple usage of slotted custom element', `<elem text="1"></elem><elem text="2"></elem>`, [Elem, Notch, Child], {
                    'elem': ['Parent 1 <notch>Notch <child>Id: 0. Child 1</child></notch> 0', null],
                    'elem+elem': ['Parent 2 <notch>Notch <child>Id: 1. Child 2</child></notch> 1', null],
                });
            }
            {
                let TabBar = (() => {
                    let _classDecorators = [customElement({ name: 'tab-bar', template: '<au-slot></au-slot>' })];
                    let _classDescriptor;
                    let _classExtraInitializers = [];
                    let _classThis;
                    var TabBar = _classThis = class {
                    };
                    __setFunctionName(_classThis, "TabBar");
                    (() => {
                        const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
                        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
                        TabBar = _classThis = _classDescriptor.value;
                        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
                        __runInitializers(_classThis, _classExtraInitializers);
                    })();
                    return TabBar = _classThis;
                })();
                let MyTab = (() => {
                    let _classDecorators = [customElement({
                            name: 'my-tab',
                            template: `<button active.class="active">\${label}</button>`
                        })];
                    let _classDescriptor;
                    let _classExtraInitializers = [];
                    let _classThis;
                    let _active_decorators;
                    let _active_initializers = [];
                    let _active_extraInitializers = [];
                    let _label_decorators;
                    let _label_initializers = [];
                    let _label_extraInitializers = [];
                    var MyTab = _classThis = class {
                        constructor() {
                            this.active = __runInitializers(this, _active_initializers, void 0);
                            this.label = (__runInitializers(this, _active_extraInitializers), __runInitializers(this, _label_initializers, void 0));
                            __runInitializers(this, _label_extraInitializers);
                        }
                    };
                    __setFunctionName(_classThis, "MyTab");
                    (() => {
                        const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
                        _active_decorators = [bindable];
                        _label_decorators = [bindable];
                        __esDecorate(null, null, _active_decorators, { kind: "field", name: "active", static: false, private: false, access: { has: obj => "active" in obj, get: obj => obj.active, set: (obj, value) => { obj.active = value; } }, metadata: _metadata }, _active_initializers, _active_extraInitializers);
                        __esDecorate(null, null, _label_decorators, { kind: "field", name: "label", static: false, private: false, access: { has: obj => "label" in obj, get: obj => obj.label, set: (obj, value) => { obj.label = value; } }, metadata: _metadata }, _label_initializers, _label_extraInitializers);
                        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
                        MyTab = _classThis = _classDescriptor.value;
                        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
                        __runInitializers(_classThis, _classExtraInitializers);
                    })();
                    return MyTab = _classThis;
                })();
                let Parent = (() => {
                    let _classDecorators = [customElement({
                            name: 'parent',
                            template: `<tab-bar>
              <template au-slot>
                <my-tab repeat.for="t of tabs" label.bind="t" active.bind="selected===t"
                        click.trigger="selected=t"></my-tab>
              </template>
            </tab-bar>`
                        })];
                    let _classDescriptor;
                    let _classExtraInitializers = [];
                    let _classThis;
                    var Parent = _classThis = class {
                        constructor() {
                            this.tabs = ['tab 1', 'tab 2'];
                            this.selected = 'tab 1';
                        }
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
                yield new TestData('tab-bar', `<parent></parent><parent></parent>`, [MyTab, TabBar, Parent], {}, async ({ host }) => {
                    const myTabs = Array.from(host.querySelectorAll('button'));
                    assert.strictEqual(myTabs.length, 4, 'there should be 4 tabs');
                    const [tab1, tab2, tab3, tab4] = myTabs;
                    assert.contains(tab1.classList, 'active');
                    assert.contains(tab3.classList, 'active');
                    tab2.click();
                    runTasks();
                    assert.notContains(tab1.classList, 'active');
                    assert.contains(tab2.classList, 'active');
                    assert.contains(tab3.classList, 'active');
                    assert.notContains(tab4.classList, 'active');
                });
            }
        }
        // #endregion
        // #region data binding
        {
            class MyElement {
                constructor() {
                    this.foo = "foo";
                    this.slots = resolve(IAuSlotsInfo);
                }
            }
            yield new TestData('works with input value binding - $host', `<my-element>
        <input au-slot type="text" value.two-way="$host.foo">
      </my-element>`, [CustomElement.define({ name: 'my-element', template: `<au-slot></au-slot>` }, MyElement)], { 'my-element': ['<input type="text">', new AuSlotsInfo(['default'])] }, async function ({ host }) {
                const el = host.querySelector('my-element');
                const vm = CustomElement.for(el).viewModel;
                const input = el.querySelector('input');
                assert.strictEqual(input.value, "foo");
                vm.foo = "bar";
                runTasks();
                assert.strictEqual(input.value, "bar");
            });
        }
        yield new TestData('works with input value binding - non $host', `<my-element>
        <input au-slot type="text" value.two-way="people[0].firstName">
      </my-element>`, [createMyElement(`<au-slot></au-slot>`)], { 'my-element': ['<input type="text">', new AuSlotsInfo(['default'])] }, async function ({ app, host }) {
            const el = host.querySelector('my-element');
            const input = el.querySelector('input');
            assert.strictEqual(input.value, app.people[0].firstName);
            app.people[0].firstName = "Jane";
            runTasks();
            assert.strictEqual(input.value, "Jane");
        });
        {
            const fooValue = '42';
            let MyElementUser = (() => {
                let _classDecorators = [customElement({ name: 'my-element-user', template: `<my-element><div au-slot>\${foo}</div></my-element>` })];
                let _classDescriptor;
                let _classExtraInitializers = [];
                let _classThis;
                var MyElementUser = _classThis = class {
                    attached() {
                        this.foo = fooValue;
                    }
                };
                __setFunctionName(_classThis, "MyElementUser");
                (() => {
                    const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
                    __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
                    MyElementUser = _classThis = _classDescriptor.value;
                    if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
                    __runInitializers(_classThis, _classExtraInitializers);
                })();
                return MyElementUser = _classThis;
            })();
            yield new TestData('works with non-strictly-initialized property - non $host', '<my-element-user></my-element-user>', [MyElementUser, createMyElement('<au-slot></au-slot>')], {}, async function ({ host }) {
                runTasks();
                const meu = host.querySelector('my-element-user');
                const me = host.querySelector('my-element');
                assert.html.innerEqual(meu, `<my-element><div>${fooValue}</div></my-element>`, 'my-element-user.innerHtml');
                const meuScope = CustomElement.for(meu).scope;
                const meScope = CustomElement.for(me).scope;
                assert.strictEqual(meuScope.bindingContext.foo, fooValue, 'meuScope.bc.foo');
                assert.strictEqual(meuScope.overrideContext.foo, undefined, 'meuScope.oc.foo');
                assert.strictEqual(meScope.bindingContext.foo, undefined, 'meScope.bc.foo');
                assert.strictEqual(meScope.overrideContext.foo, undefined, 'meScope.oc.foo');
            });
        }
        {
            const fooValue = '42';
            let MyElement = (() => {
                let _classDecorators = [customElement({ name: 'my-element', template: `<au-slot></au-slot>` })];
                let _classDescriptor;
                let _classExtraInitializers = [];
                let _classThis;
                var MyElement = _classThis = class {
                    attached() {
                        this.foo = fooValue;
                    }
                };
                __setFunctionName(_classThis, "MyElement");
                (() => {
                    const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
                    __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
                    MyElement = _classThis = _classDescriptor.value;
                    if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
                    __runInitializers(_classThis, _classExtraInitializers);
                })();
                return MyElement = _classThis;
            })();
            let MyElementUser = (() => {
                let _classDecorators = [customElement({ name: 'my-element-user', template: `<my-element><div au-slot>\${$host.foo}</div></my-element>` })];
                let _classDescriptor;
                let _classExtraInitializers = [];
                let _classThis;
                var MyElementUser = _classThis = class {
                };
                __setFunctionName(_classThis, "MyElementUser");
                (() => {
                    const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
                    __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
                    MyElementUser = _classThis = _classDescriptor.value;
                    if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
                    __runInitializers(_classThis, _classExtraInitializers);
                })();
                return MyElementUser = _classThis;
            })();
            yield new TestData('works with non-strictly-initialized property - $host', '<my-element-user></my-element-user>', [MyElementUser, MyElement], {}, async function ({ host }) {
                runTasks();
                const meu = host.querySelector('my-element-user');
                const me = host.querySelector('my-element');
                assert.html.innerEqual(meu, `<my-element><div>${fooValue}</div></my-element>`, 'my-element-user.innerHtml');
                const meuScope = CustomElement.for(meu).scope;
                const meScope = CustomElement.for(me).scope;
                assert.strictEqual(meuScope.bindingContext.foo, undefined, 'meuScope.bc.foo');
                assert.strictEqual(meuScope.overrideContext.foo, undefined, 'meuScope.oc.foo');
                assert.strictEqual(meScope.bindingContext.foo, fooValue, 'meScope.bc.foo');
                assert.strictEqual(meScope.overrideContext.foo, undefined, 'meScope.oc.foo');
            });
        }
        // #endregion
        yield new TestData('works in combination with local template', `<ce-with-au-slot>
        <div au-slot="x">p</div>
      </ce-with-au-slot>
      <template as-custom-element="ce-with-au-slot">
        <au-slot name="x">d</au-slot>
      </template>
      `, [], { '': ['<ce-with-au-slot> <div>p</div> </ce-with-au-slot>', null] });
        {
            class Base {
                constructor() {
                    this.slots = resolve(IAuSlotsInfo);
                }
            }
            let MyElement1 = (() => {
                let _classDecorators = [customElement({
                        name: 'my-element',
                        template: '<au-slot>dfb</au-slot><au-slot name="s1">s1fb</au-slot>'
                    })];
                let _classDescriptor;
                let _classExtraInitializers = [];
                let _classThis;
                let _classSuper = Base;
                var MyElement1 = _classThis = class extends _classSuper {
                };
                __setFunctionName(_classThis, "MyElement1");
                (() => {
                    const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
                    __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
                    MyElement1 = _classThis = _classDescriptor.value;
                    if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
                    __runInitializers(_classThis, _classExtraInitializers);
                })();
                return MyElement1 = _classThis;
            })();
            yield new TestData('@ISlotsInfo works with inheritance - #1', '<my-element><div au-slot="s1">s1p</div></my-element>', [MyElement1], { 'my-element': ['dfb<div>s1p</div>', new AuSlotsInfo(['s1'])] });
            class Base2 extends Base {
            }
            let MyElement2 = (() => {
                let _classDecorators = [customElement({
                        name: 'my-element',
                        template: '<au-slot>dfb</au-slot><au-slot name="s1">s1fb</au-slot>'
                    })];
                let _classDescriptor;
                let _classExtraInitializers = [];
                let _classThis;
                let _classSuper = Base2;
                var MyElement2 = _classThis = class extends _classSuper {
                };
                __setFunctionName(_classThis, "MyElement2");
                (() => {
                    const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
                    __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
                    MyElement2 = _classThis = _classDescriptor.value;
                    if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
                    __runInitializers(_classThis, _classExtraInitializers);
                })();
                return MyElement2 = _classThis;
            })();
            yield new TestData('@ISlotsInfo works with inheritance - #2', '<my-element><div au-slot="s1">s1p</div></my-element>', [MyElement2], { 'my-element': ['dfb<div>s1p</div>', new AuSlotsInfo(['s1'])] });
        }
        {
            let CeOne = (() => {
                let _classDecorators = [customElement({
                        name: 'ce-one',
                        template: '<au-slot>dfb</au-slot><au-slot name="s1">s1fb</au-slot>',
                    })];
                let _classDescriptor;
                let _classExtraInitializers = [];
                let _classThis;
                var CeOne = _classThis = class {
                    constructor() {
                        this.slots = resolve(IAuSlotsInfo);
                        assert.instanceOf(this.slots, AuSlotsInfo);
                    }
                };
                __setFunctionName(_classThis, "CeOne");
                (() => {
                    const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
                    __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
                    CeOne = _classThis = _classDescriptor.value;
                    if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
                    __runInitializers(_classThis, _classExtraInitializers);
                })();
                return CeOne = _classThis;
            })();
            let CeTwo = (() => {
                let _classDecorators = [customElement({
                        name: 'ce-two',
                        template: 'ce two',
                    })];
                let _classDescriptor;
                let _classExtraInitializers = [];
                let _classThis;
                var CeTwo = _classThis = class {
                    constructor() {
                        this.slots = resolve(IAuSlotsInfo);
                        assert.instanceOf(this.slots, AuSlotsInfo);
                    }
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
            let CeThree = (() => {
                let _classDecorators = [customElement({
                        name: 'ce-three',
                        template: '<au-slot name="s1">s1fb</au-slot><ce-one><span au-slot>dp</span></ce-one><ce-two></ce-two>',
                    })];
                let _classDescriptor;
                let _classExtraInitializers = [];
                let _classThis;
                var CeThree = _classThis = class {
                    constructor() {
                        this.slots = resolve(IAuSlotsInfo);
                        assert.instanceOf(this.slots, AuSlotsInfo);
                    }
                };
                __setFunctionName(_classThis, "CeThree");
                (() => {
                    const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
                    __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
                    CeThree = _classThis = _classDescriptor.value;
                    if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
                    __runInitializers(_classThis, _classExtraInitializers);
                })();
                return CeThree = _classThis;
            })();
            yield new TestData('@ISlotsInfo works correctly with element nesting', '<ce-one><span au-slot="s1">s1p</span></ce-one><ce-two></ce-two><ce-three><div au-slot="s1">s1p</div></ce-three>', [CeOne, CeTwo, CeThree], {
                'ce-one': ['dfb<span>s1p</span>', new AuSlotsInfo(['s1'])],
                'ce-two': ['ce two', new AuSlotsInfo([])],
                'ce-three': ['<div>s1p</div><ce-one><span>dp</span>s1fb</ce-one><ce-two>ce two</ce-two>', new AuSlotsInfo(['s1'])],
                'ce-three>ce-one': ['<span>dp</span>s1fb', new AuSlotsInfo(['default'])],
                'ce-three>ce-two': ['ce two', new AuSlotsInfo([])],
            });
        }
        {
            class MyElement {
            }
            yield new TestData('works with as-element', `<div as-element="my-element"><template au-slot>content</template></div>`, [
                CustomElement.define({
                    name: 'my-element',
                    template: `<au-slot>default content</au-slot>`
                }, MyElement),
            ], {
                'div': [`content`, undefined],
            });
        }
        {
            yield new TestData('updates expose binding on <au-slot/> dynamically', `<my-element><div au-slot>\${$host.value}</div>`, [createMyElement('<input value.bind="message"/><au-slot expose.bind="{ value: message }">')], {
                'my-element': ['<input><div></div>', undefined]
            }, function ({ host, platform }) {
                const input = host.querySelector('input');
                input.value = 'hello';
                input.dispatchEvent(new platform.CustomEvent('change'));
                runTasks();
                assert.strictEqual(host.querySelector('div').textContent, 'hello');
            });
            yield new TestData('exposure of host context does not affect inner binding contexts', `<my-element>`, [createMyElement(`<input value.bind="message"/><au-slot expose.bind="{ value: message }">\${message}</au-slot>`)], {
                'my-element': ['<input>', undefined]
            }, function ({ host, platform }) {
                const input = host.querySelector('input');
                input.value = 'hello';
                input.dispatchEvent(new platform.CustomEvent('change'));
                runTasks();
                assert.strictEqual(host.querySelector('my-element').textContent, 'hello');
            });
        }
        {
            yield new TestData('works with 2 layers of slot[default] pass through', `<mdc-tab-bar>
          <template au-slot><mdc-tab click.trigger="fn()">\${callCount}`, [
                CustomElement.define({ name: 'mdc-tab-scroller', template: '<au-slot>' }),
                CustomElement.define({ name: 'mdc-tab-bar', template: '<mdc-tab-scroller><template au-slot><au-slot></au-slot></template></mdc-tab-scroller>' }),
                CustomElement.define({ name: 'mdc-tab', template: '<button><au-slot></au-slot>Tab</button>' }),
            ], {
                'mdc-tab': ['<button>0Tab</button>', undefined]
            }, function ({ host }) {
                host.querySelector('mdc-tab').click();
                runTasks();
                assert.html.innerEqual(host.querySelector('mdc-tab'), '<button>1Tab</button>');
            });
        }
        {
            yield new TestData('works with 3 layers of slot[default] pass through, no projections', `<mdc></mdc><mdc></mdc>`, [
                CustomElement.define({
                    name: 'mdc', template: `<mdc-tab-bar
            ><template au-slot
              ><mdc-tab id="mdc-\${id}" click.trigger="increase()">\${count}</mdc-tab>`
                }, (_a = class Mdc {
                        constructor() {
                            this.id = _a.id++;
                            this.count = 0;
                        }
                        increase() {
                            this.count++;
                        }
                    },
                    _a.id = 0,
                    _a)),
                CustomElement.define({ name: 'mdc-tab-scroller', template: '<au-slot>' }),
                CustomElement.define({ name: 'mdc-tab-bar', template: '<mdc-tab-scroller><template au-slot><au-slot></au-slot></template></mdc-tab-scroller>' }),
                CustomElement.define({ name: 'mdc-tab', template: '<button><au-slot></au-slot>Tab</button>' }),
            ], {
                '#mdc-0': ['<button>0Tab</button>', undefined],
                '#mdc-1': ['<button>0Tab</button>', undefined]
            }, function ({ host }) {
                host.querySelector('#mdc-0').click();
                runTasks();
                assert.html.innerEqual(host.querySelector('#mdc-0'), '<button>1Tab</button>');
                assert.html.innerEqual(host.querySelector('#mdc-1'), '<button>0Tab</button>');
                host.querySelector('#mdc-1').click();
                runTasks();
                assert.html.innerEqual(host.querySelector('#mdc-0'), '<button>1Tab</button>');
                assert.html.innerEqual(host.querySelector('#mdc-1'), '<button>1Tab</button>');
            });
        }
        {
            yield new TestData('works with 3 layers of slot[default] pass through + template controller', `<mdc></mdc><mdc></mdc>`, [
                CustomElement.define({
                    name: 'mdc', template: `<mdc-tab-bar
            ><mdc-tab au-slot repeat.for="i of 3" id="mdc-\${id}-\${i}" click.trigger="increase()">\${count + i}</mdc-tab>`
                }, (_b = class Mdc {
                        constructor() {
                            this.id = _b.id++;
                            this.count = 0;
                        }
                        increase() {
                            this.count++;
                        }
                    },
                    _b.id = 0,
                    _b)),
                CustomElement.define({ name: 'mdc-tab-scroller', template: '<au-slot>' }),
                CustomElement.define({ name: 'mdc-tab-bar', template: '<mdc-tab-scroller><au-slot au-slot></au-slot></mdc-tab-scroller>' }),
                CustomElement.define({ name: 'mdc-tab', template: '<button><au-slot></au-slot>Tab</button>' }),
            ], {
                '#mdc-0-0': ['<button>0Tab</button>', undefined],
                '#mdc-0-1': ['<button>1Tab</button>', undefined],
                '#mdc-0-2': ['<button>2Tab</button>', undefined],
                '#mdc-1-0': ['<button>0Tab</button>', undefined],
                '#mdc-1-1': ['<button>1Tab</button>', undefined],
                '#mdc-1-2': ['<button>2Tab</button>', undefined],
            }, function ({ host }) {
                const [tab00, tab01, tab02, tab10, tab11, tab12] = Array.from(host.querySelectorAll('mdc-tab'));
                tab00.click();
                runTasks();
                assert.html.innerEqual(tab00, '<button>1Tab</button>');
                assert.html.innerEqual(tab01, '<button>2Tab</button>');
                assert.html.innerEqual(tab02, '<button>3Tab</button>');
                assert.html.innerEqual(tab10, '<button>0Tab</button>');
                assert.html.innerEqual(tab11, '<button>1Tab</button>');
                assert.html.innerEqual(tab12, '<button>2Tab</button>');
                tab10.click();
                runTasks();
                assert.html.innerEqual(tab00, '<button>1Tab</button>');
                assert.html.innerEqual(tab01, '<button>2Tab</button>');
                assert.html.innerEqual(tab02, '<button>3Tab</button>');
                assert.html.innerEqual(tab10, '<button>1Tab</button>');
                assert.html.innerEqual(tab11, '<button>2Tab</button>');
                assert.html.innerEqual(tab12, '<button>3Tab</button>');
            });
        }
        {
            yield new TestData('picks the right scope of component [ref] bindings', `<my-component>
          <template au-slot>
            <my-component>
            </my-component>
          </template>
        </my-component>`, [
                CustomElement.define({
                    name: 'my-component',
                    template: `<div ref="container" id="div-\${id}"> ref.id=\${container.id} <au-slot></au-slot></div>`
                }, (_c = class MyComponent {
                        constructor() {
                            this.id = _c.count++;
                        }
                    },
                    _c.count = 0,
                    _c))
            ], {}, function ({ host }) {
                assert.notStrictEqual(host.querySelector('#div-0'), null);
                assert.notStrictEqual(host.querySelector('#div-1'), null);
                assert.strictEqual(host.querySelector('#div-0').textContent.replace(/\s/g, ''), 'ref.id=div-0ref.id=div-1');
                assert.strictEqual(host.querySelector('#div-1').textContent.replace(/\s/g, ''), 'ref.id=div-1');
            });
        }
    }
    for (const { spec, template, expected, registrations, additionalAssertion, only } of getTestData()) {
        (only ? $it.only : $it)(spec, async function (ctx) {
            const { host, error } = ctx;
            try {
                assert.deepEqual(error, null);
                for (const [selector, [expectedInnerHtml, expectedSlotsInfo]] of Object.entries(expected)) {
                    if (selector) {
                        assert.html.innerEqual(selector, typeof expectedInnerHtml === 'string' ? expectedInnerHtml : expectedInnerHtml.outerHTML, `${selector}.innerHTML`, host);
                    }
                    else {
                        assert.html.innerEqual(host, typeof expectedInnerHtml === 'string' ? expectedInnerHtml : expectedInnerHtml.outerHTML, `root.innerHTML`);
                    }
                    if (expectedSlotsInfo != null) {
                        const slots = CustomElement.for(host.querySelector(selector)).viewModel.slots;
                        assert.deepStrictEqual(slots, expectedSlotsInfo);
                    }
                }
                if (additionalAssertion != null) {
                    await additionalAssertion(ctx);
                }
            }
            catch (ex) {
                host.remove();
                throw ex;
            }
        }, { template, registrations });
    }
    for (const listener of ['capture', 'trigger', 'delegate']) {
        describe(listener, function () {
            let MyElement = (() => {
                let _classDecorators = [customElement({ name: 'my-element', template: `<au-slot><button click.${listener}="fn()">Click</button></au-slot>` })];
                let _classDescriptor;
                let _classExtraInitializers = [];
                let _classThis;
                var MyElement = _classThis = class {
                    constructor() {
                        this.callCount = 0;
                    }
                    fn() { this.callCount++; }
                };
                __setFunctionName(_classThis, "MyElement");
                (() => {
                    const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
                    __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
                    MyElement = _classThis = _classDescriptor.value;
                    if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
                    __runInitializers(_classThis, _classExtraInitializers);
                })();
                return MyElement = _classThis;
            })();
            $it('w/o projection', async function ({ host, app }) {
                const ce = host.querySelector('my-element');
                const button = ce.querySelector('button');
                button.click();
                runTasks();
                assert.equal(CustomElement.for(ce).viewModel.callCount, 1);
                assert.equal(app.callCount, 0);
            }, { template: `<my-element></my-element>`, registrations: [MyElement] });
            $it('with projection - with $host', async function ({ host, app }) {
                const ce = host.querySelector('my-element');
                const button = ce.querySelector('button');
                button.click();
                runTasks();
                assert.equal(CustomElement.for(ce).viewModel.callCount, 1);
                assert.equal(app.callCount, 0);
            }, { template: `<my-element><button au-slot="default" click.${listener}="$host.fn()">Click</button></my-element>`, registrations: [MyElement] });
            $it('with projection - w/o $host', async function ({ host, app }) {
                const ce = host.querySelector('my-element');
                const button = ce.querySelector('button');
                button.click();
                runTasks();
                assert.equal(CustomElement.for(ce).viewModel.callCount, 0);
                assert.equal(app.callCount, 1);
            }, { template: `<my-element><button au-slot="default" click.${listener}="fn()">Click</button></my-element>`, registrations: [MyElement] });
        });
    }
    let El = (() => {
        let _classDecorators = [customElement({
                name: 'my-el',
                template: '<p>my-el content: <au-slot></au-slot></p>'
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
    it('treats CE content without slot as default slotting', async function () {
        const { assertText } = await createFixture
            .html `<my-el>hello</my-el>`
            .deps(El)
            .build().started;
        assertText('my-el content: hello');
    });
    it('treats interpolation without slot as default slotting', async function () {
        const { assertText } = await createFixture
            .component({ message: 'hello' })
            .html('<my-el>${message}</my-el>')
            .deps(El)
            .build().started;
        assertText('my-el content: hello');
    });
    it('treats CE content without slot inside TC as default slotting', async function () {
        const { assertText, assertHtml } = await createFixture
            .html `<my-el><a if.bind="true">hello</a></my-el>`
            .deps(El)
            .build().started;
        assertText('p', 'my-el content: hello');
        assertHtml('p > a', 'hello');
    });
    // bug reported by @MaxB on Discord
    // https://discord.com/channels/448698263508615178/1236855768058302526
    it('rightly chooses the scope for projected content', function () {
        let MdcLookup = (() => {
            let _classDecorators = [customElement({
                    name: 'mdc-lookup',
                    template: '<div repeat.for="option of options">' +
                        '<mdc-option>' +
                        '<au-slot>${$parent.option} -- ${option}</au-slot>' +
                        '</mdc-option>' +
                        '</div>',
                })];
            let _classDescriptor;
            let _classExtraInitializers = [];
            let _classThis;
            var MdcLookup = _classThis = class {
                constructor() {
                    this.options = ['option1'];
                }
            };
            __setFunctionName(_classThis, "MdcLookup");
            (() => {
                const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
                __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
                MdcLookup = _classThis = _classDescriptor.value;
                if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
                __runInitializers(_classThis, _classExtraInitializers);
            })();
            return MdcLookup = _classThis;
        })();
        let MdcOption = (() => {
            let _classDecorators = [customElement({ name: 'mdc-option', template: '<au-slot></au-slot>' })];
            let _classDescriptor;
            let _classExtraInitializers = [];
            let _classThis;
            var MdcOption = _classThis = class {
            };
            __setFunctionName(_classThis, "MdcOption");
            (() => {
                const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
                __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
                MdcOption = _classThis = _classDescriptor.value;
                if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
                __runInitializers(_classThis, _classExtraInitializers);
            })();
            return MdcOption = _classThis;
        })();
        const { assertHtml } = createFixture('<mdc-lookup></mdc-lookup>', class {
        }, [MdcLookup, MdcOption]);
        assertHtml('<mdc-lookup><div><mdc-option>option1 -- option1</mdc-option></div></mdc-lookup>', { compact: true });
    });
    describe('with multi layers of repeaters', function () {
        // au-slot creates a layer of scope
        // making $parent from the inner repeater not reaching to the outer repeater
        // but to this au-slot scope layer
        // doing $parent.$parent will reach to the outer repeater
        // it could be confusing, but maybe the doc can do a decent job explaining this,
        // since this intermediate scope layer of au-slot is necessary to support $host
        it('works with 2 layers of repeaters', function () {
            const { assertText } = createFixture('<my-el>', class App {
            }, [
                CustomElement.define({
                    name: 'my-el',
                    template: `<div repeat.for="i of 1">
            <my-child-el>
              <div repeat.for="i of 1">
                \${$parent.$parent.$index}-\${$index}
              </div>
            </my-child-el>
          </div>`
                }),
                CustomElement.define({
                    name: 'my-child-el',
                    template: `<au-slot>`
                }),
            ]);
            assertText('0-0', { compact: true });
        });
        it('works with 3 or more layers of repeaters + au slot', function () {
            const { assertText } = createFixture('<my-el>', class App {
            }, [
                CustomElement.define({
                    name: 'my-el',
                    template: `<div repeat.for="i of 1">
            <my-child-el>
              <div repeat.for="i of 1">
                <my-child-el>
                  <div repeat.for="i of 1">
                    \${$parent.$parent.$parent.$parent.$index}-\${$parent.$parent.$index}-\${$index}
                  </div>
                </my-child-el>
              </div>
            </my-child-el>
          </div>`
                }),
                CustomElement.define({
                    name: 'my-child-el',
                    template: `<au-slot>`
                }),
            ]);
            assertText('0-0-0', { compact: true });
        });
    });
    // bug discorvered by @MaxB on Discord
    // https://discord.com/channels/448698263508615178/448699089513611266/1234665951467929666
    it('passes $host value through 1 layer of <au-slot>', function () {
        var _a;
        let MdcFilter = (() => {
            let _classDecorators = [customElement({
                    name: 'mdc-filter',
                    template: 
                    // '<mdc-lookup><au-slot>mdc-filter ${$host | json:"mdc-lookup"}</au-slot></mdc-lookup>',
                    '<mdc-lookup><template au-slot><au-slot>mdc-filter ${$host.option}</au-slot></template></mdc-lookup>',
                    dependencies: [],
                })];
            let _classDescriptor;
            let _classExtraInitializers = [];
            let _classThis;
            var MdcFilter = _classThis = class {
            };
            __setFunctionName(_classThis, "MdcFilter");
            (() => {
                const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
                __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
                MdcFilter = _classThis = _classDescriptor.value;
                if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
                __runInitializers(_classThis, _classExtraInitializers);
            })();
            return MdcFilter = _classThis;
        })();
        let MdcLookup = (() => {
            let _classDecorators = [customElement({
                    name: 'mdc-lookup',
                    template: `<au-slot repeat.for="option of options">mdc-lookup $\{option}</au-slot>`
                })];
            let _classDescriptor;
            let _classExtraInitializers = [];
            let _classThis;
            var MdcLookup = _classThis = class {
                constructor() {
                    this.options = ['option1'];
                }
            };
            __setFunctionName(_classThis, "MdcLookup");
            (() => {
                const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
                __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
                MdcLookup = _classThis = _classDescriptor.value;
                if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
                __runInitializers(_classThis, _classExtraInitializers);
            })();
            return MdcLookup = _classThis;
        })();
        let MdcOption = (() => {
            let _classDecorators = [customElement({ name: 'mdc-option', template: '<au-slot></au-slot>' })];
            let _classDescriptor;
            let _classExtraInitializers = [];
            let _classThis;
            var MdcOption = _classThis = class {
            };
            __setFunctionName(_classThis, "MdcOption");
            (() => {
                const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
                __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
                MdcOption = _classThis = _classDescriptor.value;
                if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
                __runInitializers(_classThis, _classExtraInitializers);
            })();
            return MdcOption = _classThis;
        })();
        const { assertHtml } = createFixture(`<mdc-filter>
        <template au-slot>my-app>mdc-filter \${$host.option | json:'app'}</template>
      </mdc-filter>`, class MyApp {
        }, [MdcLookup, MdcFilter, MdcOption, (_a = class {
                    constructor() {
                        this.toView = (v) => v;
                    }
                },
                _a.$au = { type: 'value-converter', name: 'json' },
                _a)]);
        assertHtml(`<mdc-filter><mdc-lookup>my-app&gt;mdc-filter option1</mdc-lookup></mdc-filter>`, { compact: true });
    });
    it('passes $host value through 2 layers of <au-slot>', function () {
        let Layer0 = (() => {
            let _classDecorators = [customElement({
                    name: 'layer0',
                    template: '<layer1><au-slot>layer0 ${$host.value}</au-slot></layer2>',
                })];
            let _classDescriptor;
            let _classExtraInitializers = [];
            let _classThis;
            var Layer0 = _classThis = class {
            };
            __setFunctionName(_classThis, "Layer0");
            (() => {
                const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
                __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
                Layer0 = _classThis = _classDescriptor.value;
                if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
                __runInitializers(_classThis, _classExtraInitializers);
            })();
            return Layer0 = _classThis;
        })();
        let Layer1 = (() => {
            let _classDecorators = [customElement({
                    name: 'layer1',
                    template: '<layer2><au-slot>layer1 ${$host.value}</au-slot></layer2>',
                })];
            let _classDescriptor;
            let _classExtraInitializers = [];
            let _classThis;
            var Layer1 = _classThis = class {
            };
            __setFunctionName(_classThis, "Layer1");
            (() => {
                const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
                __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
                Layer1 = _classThis = _classDescriptor.value;
                if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
                __runInitializers(_classThis, _classExtraInitializers);
            })();
            return Layer1 = _classThis;
        })();
        let Layer2 = (() => {
            let _classDecorators = [customElement({
                    name: 'layer2',
                    template: `<au-slot repeat.for="value of options">layer2 $\{value}</au-slot>`
                })];
            let _classDescriptor;
            let _classExtraInitializers = [];
            let _classThis;
            var Layer2 = _classThis = class {
                constructor() {
                    this.options = ['option1'];
                }
            };
            __setFunctionName(_classThis, "Layer2");
            (() => {
                const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
                __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
                Layer2 = _classThis = _classDescriptor.value;
                if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
                __runInitializers(_classThis, _classExtraInitializers);
            })();
            return Layer2 = _classThis;
        })();
        const { assertHtml } = createFixture(`<layer0>
        my-app>layer0 \${$host.value}
      </layer0>`, class MyApp {
        }, [Layer0, Layer1, Layer2]);
        assertHtml(`<layer0><layer1><layer2> my-app&gt;layer0 option1 </layer2></layer1></layer0>`, { compact: true });
    });
    it('passes $host value through 3 layers of <au-slot>', function () {
        let Layer0 = (() => {
            let _classDecorators = [customElement({
                    name: 'layer0',
                    template: '<layer1><au-slot>layer0 ${$host.value}</au-slot></layer2>',
                })];
            let _classDescriptor;
            let _classExtraInitializers = [];
            let _classThis;
            var Layer0 = _classThis = class {
            };
            __setFunctionName(_classThis, "Layer0");
            (() => {
                const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
                __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
                Layer0 = _classThis = _classDescriptor.value;
                if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
                __runInitializers(_classThis, _classExtraInitializers);
            })();
            return Layer0 = _classThis;
        })();
        let Layer1 = (() => {
            let _classDecorators = [customElement({
                    name: 'layer1',
                    template: '<layer2><au-slot>layer1 ${$host.value}</au-slot></layer2>',
                })];
            let _classDescriptor;
            let _classExtraInitializers = [];
            let _classThis;
            var Layer1 = _classThis = class {
            };
            __setFunctionName(_classThis, "Layer1");
            (() => {
                const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
                __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
                Layer1 = _classThis = _classDescriptor.value;
                if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
                __runInitializers(_classThis, _classExtraInitializers);
            })();
            return Layer1 = _classThis;
        })();
        let Layer2 = (() => {
            let _classDecorators = [customElement({
                    name: 'layer2',
                    template: '<layer3><au-slot>layer 2 ${host.value}</au-slot></layer3>'
                })];
            let _classDescriptor;
            let _classExtraInitializers = [];
            let _classThis;
            var Layer2 = _classThis = class {
            };
            __setFunctionName(_classThis, "Layer2");
            (() => {
                const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
                __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
                Layer2 = _classThis = _classDescriptor.value;
                if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
                __runInitializers(_classThis, _classExtraInitializers);
            })();
            return Layer2 = _classThis;
        })();
        let Layer3 = (() => {
            let _classDecorators = [customElement({
                    name: 'layer3',
                    template: `<au-slot repeat.for="value of [1]">layer3 $\{value}</au-slot>`
                })];
            let _classDescriptor;
            let _classExtraInitializers = [];
            let _classThis;
            var Layer3 = _classThis = class {
            };
            __setFunctionName(_classThis, "Layer3");
            (() => {
                const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
                __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
                Layer3 = _classThis = _classDescriptor.value;
                if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
                __runInitializers(_classThis, _classExtraInitializers);
            })();
            return Layer3 = _classThis;
        })();
        const { assertHtml } = createFixture(`<layer0>
        my-app>layer0 \${$host.value}
      </layer0>`, class MyApp {
        }, [Layer0, Layer1, Layer2, Layer3]);
        assertHtml(`<layer0><layer1><layer2><layer3> my-app&gt;layer0 1 </layer3></layer2></layer1></layer0>`, { compact: true });
    });
    describe('with dependency injection', function () {
        it('injects the right parent component', async function () {
            let id = 0;
            let Parent = (() => {
                let _classDecorators = [customElement({
                        name: 'parent',
                        template: '<au-slot>'
                    })];
                let _classDescriptor;
                let _classExtraInitializers = [];
                let _classThis;
                var Parent = _classThis = class {
                    constructor() {
                        this.id = ++id;
                    }
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
            let parent = null;
            let Child = (() => {
                let _classDecorators = [inject(Parent), customElement({
                        name: 'child'
                    })];
                let _classDescriptor;
                let _classExtraInitializers = [];
                let _classThis;
                var Child = _classThis = class {
                    constructor($parent) {
                        parent = $parent;
                    }
                };
                __setFunctionName(_classThis, "Child");
                (() => {
                    const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
                    __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
                    Child = _classThis = _classDescriptor.value;
                    if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
                    __runInitializers(_classThis, _classExtraInitializers);
                })();
                return Child = _classThis;
            })();
            createFixture('<parent view-model.ref=parent><child>', class App {
            }, [Parent, Child]);
            assert.instanceOf(parent, Parent);
            assert.strictEqual(parent.id, 1);
        });
        it('provides right resources for slotted view', function () {
            const { assertText } = createFixture('<el></el>', {}, [
                CustomElement.define({
                    name: 'el',
                    template: '<el-with-slot>${"hey" | upper}</el-with-slot>',
                    dependencies: [
                        CustomElement.define({ name: 'el-with-slot', template: '<au-slot>' }, class ElWithSlot {
                        }),
                        ValueConverter.define('upper', class {
                            constructor() {
                                this.toView = v => v.toUpperCase();
                            }
                        }),
                    ]
                }, class El {
                }),
            ]);
            assertText('HEY');
        });
        it('provides right resources for passed through <au-slot>', function () {
            const { assertText } = createFixture('<el></el>', {}, [
                CustomElement.define({
                    name: 'el',
                    template: '<el-with-slot><au-slot>${"hey" | upper}</au-slot></el-with-slot>',
                    dependencies: [
                        CustomElement.define({ name: 'el-with-slot', template: '<au-slot>' }, class ElWithSlot {
                        }),
                        ValueConverter.define('upper', class {
                            constructor() {
                                this.toView = v => v.toUpperCase();
                            }
                        }),
                    ]
                }, class El {
                }),
            ]);
            assertText('HEY');
        });
        it('injects right CE instance in nested projection', function () {
            let l1Id = 0;
            let l2Id = 0;
            let l3Id = 0;
            let CeL1 = (() => {
                let _classDecorators = [customElement({ name: 'ce-l1', template: '<au-slot>' })];
                let _classDescriptor;
                let _classExtraInitializers = [];
                let _classThis;
                var CeL1 = _classThis = class {
                    constructor() {
                        this.id = ++l1Id;
                    }
                };
                __setFunctionName(_classThis, "CeL1");
                (() => {
                    const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
                    __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
                    CeL1 = _classThis = _classDescriptor.value;
                    if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
                    __runInitializers(_classThis, _classExtraInitializers);
                })();
                return CeL1 = _classThis;
            })();
            let CeL2 = (() => {
                let _classDecorators = [customElement({ name: 'ce-l2', template: '<au-slot>' })];
                let _classDescriptor;
                let _classExtraInitializers = [];
                let _classThis;
                var CeL2 = _classThis = class {
                    constructor() {
                        this.id = ++l2Id;
                    }
                };
                __setFunctionName(_classThis, "CeL2");
                (() => {
                    const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
                    __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
                    CeL2 = _classThis = _classDescriptor.value;
                    if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
                    __runInitializers(_classThis, _classExtraInitializers);
                })();
                return CeL2 = _classThis;
            })();
            let CeL3 = (() => {
                let _classDecorators = [customElement({ name: 'ce-l3', template: 'id: ${l1.id}-${l2.id}' })];
                let _classDescriptor;
                let _classExtraInitializers = [];
                let _classThis;
                var CeL3 = _classThis = class {
                    constructor() {
                        this.l1 = resolve(CeL1);
                        this.l2 = resolve(CeL2);
                        this.id = ++l3Id;
                    }
                };
                __setFunctionName(_classThis, "CeL3");
                (() => {
                    const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
                    __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
                    CeL3 = _classThis = _classDescriptor.value;
                    if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
                    __runInitializers(_classThis, _classExtraInitializers);
                })();
                return CeL3 = _classThis;
            })();
            const { assertTextContain } = createFixture(`<ce-l1><span au-slot>foo</span></ce-l1> <!-- ce-l1#1 -->
        <ce-l1> <!-- ce-l1#2 -->
          <template au-slot>
            <span>bar</span>
            <ce-l2>
              <ce-l3>
              </ce-l3>
            </ce-l2>
          </template>
        </ce-l1>
        <ce-l1> <!-- ce-l1#3 -->
          <template au-slot>
            <span>bar</span>
            <ce-l2>
              <ce-l3>
              </ce-l3>
            </ce-l2>
          </template>
        </ce-l1>`, class {
            }, [CeL1, CeL2, CeL3]);
            assertTextContain('id: 2-1');
            assertTextContain('id: 3-2');
            assert.strictEqual(l1Id, 3, '3 instances of CeL1');
            assert.strictEqual(l2Id, 2, '2 instances of CeL2');
            assert.strictEqual(l3Id, 2, '2 instances of CeL3');
            l1Id = l2Id = l3Id = 0;
            const { assertTextContain: assertApp2TextContain } = createFixture(`<ce-l1><span au-slot>foo</span></ce-l1> <!-- ce-l1#1 -->
        <ce-l1> <!-- ce-l1#2 -->
          <template au-slot>
            <span>bar</span>
            <ce-l2>
              <ce-l3>
              </ce-l3>
            </ce-l2>
          </template>
        </ce-l1>
        <ce-l1> <!-- ce-l1#3 -->
          <template au-slot>
            <span>bar</span>
            <ce-l2>
              <ce-l3>
              </ce-l3>
            </ce-l2>
          </template>
        </ce-l1>`, CustomElement.define({
                name: 'app',
                dependencies: [CeL1, CeL2, CeL3]
            }));
            assertApp2TextContain('id: 2-1');
            assertApp2TextContain('id: 3-2');
            assert.strictEqual(l1Id, 3, '3 instances of CeL1');
            assert.strictEqual(l2Id, 2, '2 instances of CeL2');
            assert.strictEqual(l3Id, 2, '2 instances of CeL3');
        });
        it('injects right instance when used together with newInstance & newInstanceForScope', function () {
            class Foo {
                constructor() {
                    this.id = ++Foo.id;
                }
            }
            Foo.id = 0;
            let CeL1 = (() => {
                let _classDecorators = [customElement({ name: 'ce-l1', template: 'ce foo: ${foo.id} <br><au-slot></au-slot>' })];
                let _classDescriptor;
                let _classExtraInitializers = [];
                let _classThis;
                var CeL1 = _classThis = class {
                    constructor() {
                        this.foo = resolve(newInstanceForScope(Foo));
                    }
                };
                __setFunctionName(_classThis, "CeL1");
                (() => {
                    const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
                    __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
                    CeL1 = _classThis = _classDescriptor.value;
                    if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
                    __runInitializers(_classThis, _classExtraInitializers);
                })();
                return CeL1 = _classThis;
            })();
            let CeL2 = (() => {
                let _classDecorators = [customElement({ name: 'ce-l2', template: 'ce2 foo: ${foo.id}' })];
                let _classDescriptor;
                let _classExtraInitializers = [];
                let _classThis;
                var CeL2 = _classThis = class {
                    constructor() {
                        this.foo = resolve(Foo);
                    }
                };
                __setFunctionName(_classThis, "CeL2");
                (() => {
                    const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
                    __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
                    CeL2 = _classThis = _classDescriptor.value;
                    if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
                    __runInitializers(_classThis, _classExtraInitializers);
                })();
                return CeL2 = _classThis;
            })();
            const { assertTextContain } = createFixture(`app foo: \${foo.id}
        <ce-l1>
          <ce-l2 au-slot>
          </ce-l2>
        </ce-l1>`, class MyApp {
                constructor() {
                    this.foo = resolve(Foo);
                }
            }, [CeL1, CeL2]);
            assertTextContain('app foo: 1');
            assertTextContain('ce foo: 2');
            assertTextContain('ce2 foo: 2');
        });
    });
});
//# sourceMappingURL=au-slot.spec.js.map