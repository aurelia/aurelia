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
import { I18N, I18nConfiguration, Signals } from '@aurelia/i18n';
import { ISignaler, Aurelia, bindable, customElement, IPlatform } from '@aurelia/runtime-html';
import { assert, PLATFORM, TestContext } from '@aurelia/testing';
import { createSpecFunction } from '../../util.js';
describe('i18n/t/translation-integration.spec.ts', function () {
    let CustomMessage = (() => {
        let _classDecorators = [customElement({ name: 'custom-message', template: `<div>\${message}</div>` })];
        let _classDescriptor;
        let _classExtraInitializers = [];
        let _classThis;
        let _message_decorators;
        let _message_initializers = [];
        let _message_extraInitializers = [];
        var CustomMessage = _classThis = class {
            constructor() {
                this.message = __runInitializers(this, _message_initializers, void 0);
                __runInitializers(this, _message_extraInitializers);
            }
        };
        __setFunctionName(_classThis, "CustomMessage");
        (() => {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            _message_decorators = [bindable];
            __esDecorate(null, null, _message_decorators, { kind: "field", name: "message", static: false, private: false, access: { has: obj => "message" in obj, get: obj => obj.message, set: (obj, value) => { obj.message = value; } }, metadata: _metadata }, _message_initializers, _message_extraInitializers);
            __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
            CustomMessage = _classThis = _classDescriptor.value;
            if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
            __runInitializers(_classThis, _classExtraInitializers);
        })();
        return CustomMessage = _classThis;
    })();
    let CeWithCamelCaseBindable = (() => {
        let _classDecorators = [customElement({ name: 'camel-ce', template: `<div>\${someMessage}</div>` })];
        let _classDescriptor;
        let _classExtraInitializers = [];
        let _classThis;
        let _someMessage_decorators;
        let _someMessage_initializers = [];
        let _someMessage_extraInitializers = [];
        var CeWithCamelCaseBindable = _classThis = class {
            constructor() {
                this.someMessage = __runInitializers(this, _someMessage_initializers, void 0);
                __runInitializers(this, _someMessage_extraInitializers);
            }
        };
        __setFunctionName(_classThis, "CeWithCamelCaseBindable");
        (() => {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            _someMessage_decorators = [bindable];
            __esDecorate(null, null, _someMessage_decorators, { kind: "field", name: "someMessage", static: false, private: false, access: { has: obj => "someMessage" in obj, get: obj => obj.someMessage, set: (obj, value) => { obj.someMessage = value; } }, metadata: _metadata }, _someMessage_initializers, _someMessage_extraInitializers);
            __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
            CeWithCamelCaseBindable = _classThis = _classDescriptor.value;
            if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
            __runInitializers(_classThis, _classExtraInitializers);
        })();
        return CeWithCamelCaseBindable = _classThis;
    })();
    let FooBar = (() => {
        let _classDecorators = [customElement({ name: 'foo-bar', template: `<au-slot><span t="status" t-params.bind="{context: status, date: date}"></span></au-slot>` })];
        let _classDescriptor;
        let _classExtraInitializers = [];
        let _classThis;
        let _status_decorators;
        let _status_initializers = [];
        let _status_extraInitializers = [];
        let _date_decorators;
        let _date_initializers = [];
        let _date_extraInitializers = [];
        var FooBar = _classThis = class {
            constructor() {
                this.status = __runInitializers(this, _status_initializers, void 0);
                this.date = (__runInitializers(this, _status_extraInitializers), __runInitializers(this, _date_initializers, void 0));
                __runInitializers(this, _date_extraInitializers);
            }
        };
        __setFunctionName(_classThis, "FooBar");
        (() => {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            _status_decorators = [bindable];
            _date_decorators = [bindable];
            __esDecorate(null, null, _status_decorators, { kind: "field", name: "status", static: false, private: false, access: { has: obj => "status" in obj, get: obj => obj.status, set: (obj, value) => { obj.status = value; } }, metadata: _metadata }, _status_initializers, _status_extraInitializers);
            __esDecorate(null, null, _date_decorators, { kind: "field", name: "date", static: false, private: false, access: { has: obj => "date" in obj, get: obj => obj.date, set: (obj, value) => { obj.date = value; } }, metadata: _metadata }, _date_initializers, _date_extraInitializers);
            __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
            FooBar = _classThis = _classDescriptor.value;
            if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
            __runInitializers(_classThis, _classExtraInitializers);
        })();
        return FooBar = _classThis;
    })();
    class I18nIntegrationTestContext {
        constructor(en, de, ctx, au, i18n, host, error) {
            this.en = en;
            this.de = de;
            this.ctx = ctx;
            this.au = au;
            this.i18n = i18n;
            this.host = host;
            this.error = error;
            this.container = au.container;
        }
        get app() {
            return this.au.root.controller.viewModel;
        }
        get platform() {
            return this.container.get(IPlatform);
        }
        async teardown() {
            if (this.error === null) {
                await this.au.stop();
            }
        }
    }
    async function runTest(testFunction, { component, aliases, skipTranslationOnMissingKey = false }) {
        const translation = {
            simple: {
                text: 'simple text',
                attr: 'simple attribute'
            },
            status: 'status is unknown',
            status_dispatched: 'dispatched on {{date}}',
            status_delivered: 'delivered on {{date}}',
            custom_interpolation_brace: 'delivered on {date}',
            custom_interpolation_es6_syntax: `delivered on \${date}`,
            interpolation_greeting: 'hello {{name}}',
            itemWithCount: '{{count}} item',
            itemWithCount_other: '{{count}} items',
            html: 'this is a <i>HTML</i> content',
            pre: 'tic ',
            preHtml: '<b>tic</b><span>foo</span> ',
            mid: 'tac',
            midHtml: '<i>tac</i>',
            post: ' toe',
            postHtml: ' <b>toe</b><span>bar</span>',
            imgPath: 'foo.jpg',
            projectedContent: 'content',
            firstandMore: '{{firstItem}} and {{restCount}} more',
        };
        const deTranslation = {
            simple: {
                text: 'Einfacher Text',
                attr: 'Einfaches Attribut'
            },
            status: 'Status ist unbekannt',
            status_dispatched: 'Versand am {{datetime}}',
            status_delivered: 'geliefert am {{date}}',
            custom_interpolation_brace: 'geliefert am {date}',
            custom_interpolation_es6_syntax: `geliefert am \${date}`,
            interpolation_greeting: 'Hallo {{name}}',
            itemWithCount: '{{count}} Artikel',
            itemWithCount_other: '{{count}} Artikel',
            itemWithCount_interval: '(0)$t(itemWithCount_other);(1)$t(itemWithCount);(2-7)$t(itemWithCount_other);(7-inf){viele Artikel};',
            html: 'Dies ist ein <i>HTML</i> Inhalt',
            pre: 'Tic ',
            mid: 'Tac',
            midHtml: '<i>Tac</i>',
            post: ' Toe',
            imgPath: 'bar.jpg',
            projectedContent: 'Inhalt',
            firstandMore: '{{firstItem}} und {{restCount}} mehr',
        };
        const ctx = TestContext.create();
        const host = PLATFORM.document.createElement('app');
        const au = new Aurelia(ctx.container).register(I18nConfiguration.customize((config) => {
            config.initOptions = {
                resources: { en: { translation }, de: { translation: deTranslation } },
                skipTranslationOnMissingKey,
            };
            config.translationAttributeAliases = aliases;
        }));
        const i18n = au.container.get(I18N);
        let error = null;
        try {
            await au
                .register(CustomMessage, CeWithCamelCaseBindable, FooBar)
                .app({ host, component })
                .start();
            await i18n.setLocale('en');
        }
        catch (e) {
            error = e;
        }
        const testContext = new I18nIntegrationTestContext(translation, deTranslation, ctx, au, i18n, host, error);
        await testFunction(testContext);
        await testContext.teardown();
    }
    const $it = createSpecFunction(runTest);
    function assertTextContent(host, selector, translation, message) {
        assert.equal(host.querySelector(selector).textContent, translation, message);
    }
    {
        let App = (() => {
            let _classDecorators = [customElement({ name: 'app', template: `<span t='simple.text'></span>` })];
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
        $it('works for simple string literal key', function ({ host, en: translation }) {
            assertTextContent(host, 'span', translation.simple.text);
        }, { component: App });
    }
    {
        let App = (() => {
            let _classDecorators = [customElement({
                    name: 'app',
                    template: `<p t.bind="undef" id="undefined">
        Undefined value
      </p>
      <p t.bind="nullul" id="null">
        Null value
      </p>`,
                })];
            let _classDescriptor;
            let _classExtraInitializers = [];
            let _classThis;
            var App = _classThis = class {
                constructor() {
                    this.nullul = null;
                    this.undef = undefined;
                    // private readonly zero: 0 = 0;
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
        $it('works for null/undefined bound values', function ({ host }) {
            assertTextContent(host, '#undefined', '');
            assertTextContent(host, '#null', '');
        }, { component: App });
    }
    {
        let App = (() => {
            let _classDecorators = [customElement({
                    name: 'app',
                    template: `<p t.bind="undef" id="undefined" t-params.bind="{defaultValue:'foo'}">
      Undefined value
    </p>
    <p t.bind="nullul" id="null" t-params.bind="{defaultValue:'bar'}">
      Null value
    </p>`,
                })];
            let _classDescriptor;
            let _classExtraInitializers = [];
            let _classThis;
            var App = _classThis = class {
                constructor() {
                    this.nullul = null;
                    this.undef = undefined;
                    // private readonly zero: 0 = 0;
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
        $it('works for null/undefined bound values - default value', function ({ host }) {
            assertTextContent(host, '#undefined', 'foo');
            assertTextContent(host, '#null', 'bar');
        }, { component: App });
    }
    {
        let App = (() => {
            let _classDecorators = [customElement({
                    name: 'app',
                    template: `<p t.bind="undef" id="undefined">
      Undefined value
    </p>
    <p t.bind="nullul" id="null">
      Null value
    </p>`,
                })];
            let _classDescriptor;
            let _classExtraInitializers = [];
            let _classThis;
            var App = _classThis = class {
                constructor() {
                    this.nullul = 'simple.text';
                    this.undef = 'simple.text';
                }
                changeKey() {
                    this.nullul = null;
                    this.undef = undefined;
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
        $it('works if the keyExpression is changed to null/undefined', function ({ host, app, ctx }) {
            app.changeKey();
            assertTextContent(host, '#undefined', 'simple text', 'changeKey(), before flush');
            assertTextContent(host, '#null', 'simple text', 'changeKey, before flush');
            ctx.platform.domQueue.flush();
            assertTextContent(host, '#undefined', '', 'changeKey() & flush');
            assertTextContent(host, '#null', '', 'changeKey() & flush');
            ctx.platform.domQueue.flush();
            assertTextContent(host, '#undefined', '', 'changeKey() & 2nd flush');
            assertTextContent(host, '#null', '', 'changeKey() & 2nd flush');
        }, { component: App });
    }
    {
        let App = (() => {
            let _classDecorators = [customElement({
                    name: 'app',
                    template: `<p t.bind="undef" id="undefined" t-params.bind="{defaultValue:'foo'}">
        Undefined value
      </p>
      <p t.bind="nullul" id="null" t-params.bind="{defaultValue:'bar'}">
        Null value
      </p>`,
                })];
            let _classDescriptor;
            let _classExtraInitializers = [];
            let _classThis;
            var App = _classThis = class {
                constructor() {
                    this.nullul = 'simple.text';
                    this.undef = 'simple.text';
                }
                changeKey() {
                    this.nullul = null;
                    this.undef = undefined;
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
        $it('works if the keyExpression is changed to null/undefined - default value', function ({ host, app, ctx }) {
            app.changeKey();
            assertTextContent(host, '#undefined', 'simple text', 'changeKey(), before flush');
            assertTextContent(host, '#null', 'simple text', 'changeKey, before flush');
            ctx.platform.domQueue.flush();
            assertTextContent(host, '#undefined', 'foo');
            assertTextContent(host, '#null', 'bar');
        }, { component: App });
    }
    for (const value of [true, false, 0]) {
        let App = (() => {
            let _classDecorators = [customElement({ name: 'app', template: `<p t.bind="key" id="undefined"></p>` })];
            let _classDescriptor;
            let _classExtraInitializers = [];
            let _classThis;
            var App = _classThis = class {
                constructor() {
                    this.key = value;
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
        $it(`throws error if the key expression is evaluated to ${value}`, function ({ error }) {
            assert.match(error?.message, /AUR4002/);
        }, { component: App });
    }
    for (const value of [true, false, 0]) {
        let App = (() => {
            let _classDecorators = [customElement({
                    name: 'app',
                    template: `<p t.bind="key" id="undefined"></p>`,
                })];
            let _classDescriptor;
            let _classExtraInitializers = [];
            let _classThis;
            var App = _classThis = class {
                constructor() {
                    this.key = 'simple.text';
                }
                changeKey() {
                    this.key = value;
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
        $it(`throws error if the key expression is changed to ${value}`, function ({ app }) {
            try {
                app.changeKey();
            }
            catch (e) {
                assert.match(e.message, /AUR4002/);
            }
        }, { component: App });
    }
    {
        let App = (() => {
            let _classDecorators = [customElement({ name: 'app', template: `<span t='simple.text' t='simple.attr'></span>` })];
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
        $it('with multiple `t` attribute only the first one is considered', function ({ host, en: translation }) {
            assertTextContent(host, 'span', translation.simple.text);
        }, { component: App });
    }
    {
        let App = (() => {
            let _classDecorators = [customElement({
                    name: 'app', template: `
    <span id='t' t='simple.text'></span>
    <span id='i18n' i18n='simple.text'></span>
    <span id='i18n-bind' i18n.bind='key'></span>
    `
                })];
            let _classDescriptor;
            let _classExtraInitializers = [];
            let _classThis;
            var App = _classThis = class {
                constructor() {
                    this.key = 'simple.text';
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
        $it('works with aliases', function ({ host, en: translation }) {
            assertTextContent(host, 'span#t', translation.simple.text);
            assertTextContent(host, 'span#i18n', translation.simple.text);
            assertTextContent(host, 'span#i18n-bind', translation.simple.text);
        }, { component: App, aliases: ['t', 'i18n'] });
    }
    {
        let App = (() => {
            let _classDecorators = [customElement({ name: 'app', template: `<span t.bind='obj.key'></span>` })];
            let _classDescriptor;
            let _classExtraInitializers = [];
            let _classThis;
            var App = _classThis = class {
                constructor() {
                    this.obj = { key: 'simple.text' };
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
        $it('works for bound key', function ({ host, en: translation }) {
            assertTextContent(host, 'span', translation.simple.text);
        }, { component: App });
    }
    {
        let App = (() => {
            let _classDecorators = [customElement({ name: 'app', template: `<span if.bind='obj.condition'><span t.bind='obj.key'></span></span>` })];
            let _classDescriptor;
            let _classExtraInitializers = [];
            let _classThis;
            var App = _classThis = class {
                constructor() {
                    this.obj = { key: 'simple.text', condition: true };
                }
                changeCondition() {
                    this.obj = { key: 'simple.text', condition: false };
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
        $it('does not throw AUR0203 when handleChange is called after unbind in if.bind/t.bind scenario', function ({ host, app, ctx, en: translation }) {
            assertTextContent(host, 'span > span', translation.simple.text, 'initial rendering');
            assert.doesNotThrow(() => {
                app.changeCondition();
                ctx.platform.domQueue.flush();
                app.obj.key = 'simple.attr';
                ctx.platform.domQueue.flush();
            }, 'AUR0203 error should not be thrown');
            assert.equal(host.querySelector('span > span'), null, 'inner span removed after unbind');
            app.obj.condition = true;
            ctx.platform.domQueue.flush();
            assertTextContent(host, 'span > span', translation.simple.attr, 'final rendering');
        }, { component: App });
    }
    describe('translation can be manipulated by using t-params', function () {
        {
            let App = (() => {
                let _classDecorators = [customElement({ name: 'app', template: `<span t-params.bind="{context: 'dispatched'}"></span>` })];
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
            $it('throws error if used without `t` attribute', function ({ error }) {
                assert.includes(error?.message, 'AUR4000');
            }, { component: App });
        }
        {
            let App = (() => {
                let _classDecorators = [customElement({
                        name: 'app', template: `
    <span id="i18n-ctx-vm" t="status" t-params.bind="tParams"></span><br>
    <span id="i18n-ctx-dispatched" t="status" t-params.bind="{context: 'dispatched', date: dispatchedOn}"></span><br>
    <span id="i18n-ctx-delivered" t="status" t-params.bind="{context: 'delivered', date: deliveredOn}"></span><br>

    <span id="i18n-interpolation" t="status_delivered" t-params.bind="{date: deliveredOn}"></span>
    <span id="i18n-interpolation-custom" t="custom_interpolation_brace" t-params.bind="{date: deliveredOn, interpolation: { prefix: '{', suffix: '}' }}"></span>
    <span id="i18n-interpolation-es6" t="custom_interpolation_es6_syntax" t-params.bind="{date: deliveredOn, interpolation: { prefix: '\${', suffix: '}' }}"></span>
    <span id="i18n-interpolation-string-direct" t="interpolation_greeting" t-params.bind="nameParams"></span>
    <span id="i18n-interpolation-string-obj" t="interpolation_greeting" t-params.bind="{name: name}"></span>

    <span id="i18n-items-plural-0"  t="itemWithCount" t-params.bind="{count: 0}"></span>
    <span id="i18n-items-plural-1"  t="itemWithCount" t-params.bind="{count: 1}"></span>
    <span id="i18n-items-plural-10" t="itemWithCount" t-params.bind="{count: 10}"></span>`
                    })];
                let _classDescriptor;
                let _classExtraInitializers = [];
                let _classThis;
                var App = _classThis = class {
                    constructor() {
                        this.dispatchedOn = new Date(2020, 1, 10, 5, 15);
                        this.deliveredOn = new Date(2021, 1, 10, 5, 15);
                        this.tParams = { context: 'dispatched', date: this.dispatchedOn };
                        this.name = 'john';
                        this.nameParams = { name: this.name };
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
            $it('works when a vm property is bound as t-params', function ({ host, en: translation, app }) {
                assertTextContent(host, '#i18n-ctx-vm', translation.status_dispatched.replace('{{date}}', app.dispatchedOn.toString()));
            }, { component: App });
            $it('works when a vm property is bound as t-params and changes', function ({ host, en: translation, app, ctx }) {
                const currDate = app.dispatchedOn;
                assertTextContent(host, '#i18n-ctx-vm', translation.status_dispatched.replace('{{date}}', currDate.toString()), 'before change t-params');
                app.tParams = { context: 'dispatched', date: new Date(2020, 2, 10, 5, 15) };
                assertTextContent(host, '#i18n-ctx-vm', translation.status_dispatched.replace('{{date}}', currDate.toString()), 'after change t-params, before flush');
                ctx.platform.domQueue.flush();
                assertTextContent(host, '#i18n-ctx-vm', translation.status_dispatched.replace('{{date}}', app.tParams.date.toString()), 'after change t-params & flush');
            }, { component: App });
            $it('works for context-sensitive translations', function ({ host, en: translation, app }) {
                assertTextContent(host, '#i18n-ctx-dispatched', translation.status_dispatched.replace('{{date}}', app.dispatchedOn.toString()));
                assertTextContent(host, '#i18n-ctx-delivered', translation.status_delivered.replace('{{date}}', app.deliveredOn.toString()));
            }, { component: App });
            $it('works for interpolation, including custom marker for interpolation placeholder', function ({ host, en: translation, app }) {
                assertTextContent(host, '#i18n-interpolation', translation.status_delivered.replace('{{date}}', app.deliveredOn.toString()));
                assertTextContent(host, '#i18n-interpolation-custom', translation.custom_interpolation_brace.replace('{date}', app.deliveredOn.toString()));
                assertTextContent(host, '#i18n-interpolation-es6', translation.custom_interpolation_es6_syntax.replace(`\${date}`, app.deliveredOn.toString()));
            }, { component: App });
            $it('works for interpolation when the interpolation changes', function ({ host, en: translation, app, ctx }) {
                const currDate = app.deliveredOn;
                assertTextContent(host, '#i18n-interpolation', translation.status_delivered.replace('{{date}}', currDate.toString()), 'before change');
                app.deliveredOn = new Date(2022, 1, 10, 5, 15);
                assertTextContent(host, '#i18n-interpolation', translation.status_delivered.replace('{{date}}', currDate.toString()), 'after change, before flush');
                ctx.platform.domQueue.flush();
                assertTextContent(host, '#i18n-interpolation', translation.status_delivered.replace('{{date}}', app.deliveredOn.toString()));
            }, { component: App });
            $it('works for interpolation when a string changes', function ({ ctx, host, en: translation, app }) {
                assertTextContent(host, '#i18n-interpolation-string-direct', translation.interpolation_greeting.replace('{{name}}', app.name));
                assertTextContent(host, '#i18n-interpolation-string-obj', translation.interpolation_greeting.replace('{{name}}', app.name));
                const currName = app.name;
                app.name = 'Jane';
                app.nameParams = { name: 'Jane' };
                assertTextContent(host, '#i18n-interpolation-string-direct', translation.interpolation_greeting.replace('{{name}}', currName));
                assertTextContent(host, '#i18n-interpolation-string-obj', translation.interpolation_greeting.replace('{{name}}', currName));
                ctx.platform.domQueue.flush();
                assertTextContent(host, '#i18n-interpolation-string-direct', translation.interpolation_greeting.replace('{{name}}', 'Jane'));
                assertTextContent(host, '#i18n-interpolation-string-obj', translation.interpolation_greeting.replace('{{name}}', 'Jane'));
            }, { component: App });
            $it('works for pluralization', function ({ host }) {
                assertTextContent(host, '#i18n-items-plural-0', '0 items');
                assertTextContent(host, '#i18n-items-plural-1', '1 item');
                assertTextContent(host, '#i18n-items-plural-10', '10 items');
            }, { component: App });
        }
    });
    {
        let App = (() => {
            let _classDecorators = [customElement({ name: 'app', template: `<img t='imgPath'></img>` })];
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
        $it('`src` attribute of img element is translated by default', function ({ host, en: translation }) {
            assert.equal(host.querySelector('img').src.endsWith(translation.imgPath), true);
        }, { component: App });
    }
    {
        let App = (() => {
            let _classDecorators = [customElement({ name: 'app', template: `<span t='[title]simple.attr'></span>` })];
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
        $it('can translate attributes - t=\'[title]simple.attr\'', function ({ host, en: translation }) {
            assertTextContent(host, `span[title='${translation.simple.attr}']`, '');
        }, { component: App });
    }
    {
        let App = (() => {
            let _classDecorators = [customElement({ name: 'app', template: `<span t='[title]simple.attr;[title]simple.text'></span>` })];
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
        $it('value of last key takes effect if multiple keys target same attribute - t=\'[title]simple.attr;[title]simple.text\'', function ({ host, en: translation }) {
            assertTextContent(host, `span[title='${translation.simple.text}']`, '');
        }, { component: App });
    }
    {
        let App = (() => {
            let _classDecorators = [customElement({ name: 'app', template: `<span t='[title]simple.attr;simple.text'></span>` })];
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
        $it('works for a mixture of attribute targeted key and textContent targeted key - t=\'[title]simple.attr;simple.text\'', function ({ host, en: translation }) {
            assertTextContent(host, `span[title='${translation.simple.attr}']`, translation.simple.text);
        }, { component: App });
    }
    {
        let App = (() => {
            let _classDecorators = [customElement({ name: 'app', template: `<span t='[title,data-foo]simple.attr;simple.text'></span>` })];
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
        $it('works when multiple attributes are targeted by the same key - `t="[title,data-foo]simple.attr;simple.text"`', function ({ host, en: translation }) {
            assertTextContent(host, `span[title='${translation.simple.attr}'][data-foo='${translation.simple.attr}']`, translation.simple.text);
        }, { component: App });
    }
    {
        let App = (() => {
            let _classDecorators = [customElement({
                    name: 'app', template: `
    <span id='a' t='\${obj.key1}'></span>
    <span id='b' t='[title]\${obj.key2};simple.text'></span>
    <span id='c' t='[title]\${obj.key2};\${obj.key1}'></span>
    <span id='d' t='status_\${status}'></span>
    `
                })];
            let _classDescriptor;
            let _classExtraInitializers = [];
            let _classThis;
            var App = _classThis = class {
                constructor() {
                    this.obj = { key1: 'simple.text', key2: 'simple.attr' };
                    this.status = 'dispatched';
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
        $it(`works for interpolated keys are used - t="\${obj.key1}"`, function ({ host, en: translation }) {
            assertTextContent(host, `span#a`, translation.simple.text);
            assertTextContent(host, `span#b[title='${translation.simple.attr}']`, translation.simple.text);
            assertTextContent(host, `span#c[title='${translation.simple.attr}']`, translation.simple.text);
            // v20 and before of i18next, non existing params will be relaced with empty string
            // though it seems v21+ is leaving it as is
            // so the next assertion works with before, now it doesn't
            //
            // assertTextContent(host, `span#d`, 'dispatched on ');
            assertTextContent(host, `span#d`, 'dispatched on {{date}}');
        }, { component: App });
    }
    {
        let App = (() => {
            let _classDecorators = [customElement({ name: 'app', template: `<span t="$t(simple.text) $t(simple.attr)"></span>` })];
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
        $it('works nested key - t="$t(simple.text) $t(simple.attr)"', function ({ host, en: translation }) {
            assertTextContent(host, `span`, `${translation.simple.text} ${translation.simple.attr}`);
        }, { component: App });
    }
    {
        let App = (() => {
            let _classDecorators = [customElement({
                    name: 'app', template: `
    <span id='a' t.bind='"simple."+"text"'></span>
    <span id='b' t.bind='"simple."+part'></span>
    `
                })];
            let _classDescriptor;
            let _classExtraInitializers = [];
            let _classThis;
            var App = _classThis = class {
                constructor() {
                    this.part = 'text';
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
        $it('works for explicit concatenation expression as key - `t.bind="string+string"`', function ({ host, en: translation }) {
            assertTextContent(host, `span#a`, translation.simple.text);
            assertTextContent(host, `span#b`, translation.simple.text);
        }, { component: App });
    }
    {
        let App = (() => {
            let _classDecorators = [customElement({
                    name: 'app', template: `<span id='a' t='[text]simple.text'></span>`
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
        $it('works for textContent replacement with explicit [text] attribute - `t="[text]key"`', function ({ host, en: translation }) {
            assertTextContent(host, 'span', translation.simple.text);
        }, { component: App });
    }
    {
        let App = (() => {
            let _classDecorators = [customElement({
                    name: 'app', template: `<span id='a' t='[html]html'></span>`
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
        $it('works for innerHTML replacement - `t="[html]key"`', function ({ host, en: translation }) {
            assert.equal(host.querySelector('span').innerHTML, translation.html);
        }, { component: App });
    }
    describe('prepends/appends the translated value to the element content - `t="[prepend]key1;[append]key2"`', function () {
        {
            let App = (() => {
                let _classDecorators = [customElement({
                        name: 'app', template: `<span t='[prepend]pre'>tac</span>`
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
            $it('works for [prepend] only', function ({ host }) {
                assertTextContent(host, 'span', 'tic tac');
            }, { component: App });
        }
        {
            let App = (() => {
                let _classDecorators = [customElement({
                        name: 'app', template: `<span t='[prepend]pre;mid'></span>`
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
            $it('works for [prepend] + textContent', function ({ host }) {
                assertTextContent(host, 'span', 'tic tac');
            }, { component: App });
        }
        {
            let App = (() => {
                let _classDecorators = [customElement({
                        name: 'app', template: `<span t='[prepend]pre;[html]midHtml'></span>`
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
            $it('works for [prepend] + html', function ({ host }) {
                assert.equal(host.querySelector('span').innerHTML, 'tic <i>tac</i>');
            }, { component: App });
        }
        {
            let App = (() => {
                let _classDecorators = [customElement({
                        name: 'app', template: `<span t='[prepend]preHtml;[html]mid'></span>`
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
            $it('works for html content for [prepend] + textContent', function ({ host }) {
                assert.equal(host.querySelector('span').innerHTML, '<b>tic</b><span>foo</span> tac');
            }, { component: App });
        }
        {
            let App = (() => {
                let _classDecorators = [customElement({
                        name: 'app', template: `<span t='[prepend]preHtml;[html]midHtml'></span>`
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
            $it('works for html content for [prepend] + innerHtml', function ({ host }) {
                assert.equal(host.querySelector('span').innerHTML, '<b>tic</b><span>foo</span> <i>tac</i>');
            }, { component: App });
        }
        {
            let App = (() => {
                let _classDecorators = [customElement({
                        name: 'app', template: `<span t='[append]post'>tac</span>`
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
            $it('works for [append] only', function ({ host }) {
                assertTextContent(host, 'span', 'tac toe');
            }, { component: App });
        }
        {
            let App = (() => {
                let _classDecorators = [customElement({
                        name: 'app', template: `<span t='[append]post;mid'></span>`
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
            $it('works for [append] + textContent', function ({ host }) {
                assertTextContent(host, 'span', 'tac toe');
            }, { component: App });
        }
        {
            let App = (() => {
                let _classDecorators = [customElement({
                        name: 'app', template: `<span t='[append]post;[html]midHtml'></span>`
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
            $it('works for [append] + html', function ({ host }) {
                assert.equal(host.querySelector('span').innerHTML, '<i>tac</i> toe');
            }, { component: App });
        }
        {
            let App = (() => {
                let _classDecorators = [customElement({
                        name: 'app', template: `<span t='[append]postHtml;[html]mid'></span>`
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
            $it('works for html content for [append] + textContent', function ({ host }) {
                assert.equal(host.querySelector('span').innerHTML, 'tac <b>toe</b><span>bar</span>');
            }, { component: App });
        }
        {
            let App = (() => {
                let _classDecorators = [customElement({
                        name: 'app', template: `<span t='[append]postHtml;[html]midHtml'></span>`
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
            $it('works for html content for [append]', function ({ host }) {
                assert.equal(host.querySelector('span').innerHTML, '<i>tac</i> <b>toe</b><span>bar</span>');
            }, { component: App });
        }
        {
            let App = (() => {
                let _classDecorators = [customElement({
                        name: 'app', template: `<span t='[prepend]pre;[append]post'>tac</span>`
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
            $it('works for [prepend] and [append]', function ({ host }) {
                assertTextContent(host, 'span', 'tic tac toe');
            }, { component: App });
        }
        {
            let App = (() => {
                let _classDecorators = [customElement({
                        name: 'app', template: `<span t='[prepend]pre;[append]post;mid'></span>`
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
            $it('works for [prepend] + [append] + textContent', function ({ host }) {
                assertTextContent(host, 'span', 'tic tac toe');
            }, { component: App });
        }
        {
            let App = (() => {
                let _classDecorators = [customElement({
                        name: 'app', template: `<span t='[prepend]pre;[append]post;[html]midHtml'></span>`
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
            $it('works for [prepend] + [append] + innerHtml', function ({ host }) {
                assert.equal(host.querySelector('span').innerHTML, 'tic <i>tac</i> toe');
            }, { component: App });
        }
        {
            let App = (() => {
                let _classDecorators = [customElement({
                        name: 'app', template: `<span t='[prepend]preHtml;[append]postHtml;mid'></span>`
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
            $it('works for html resource for [prepend] and [append] + textContent', function ({ host }) {
                assert.equal(host.querySelector('span').innerHTML, '<b>tic</b><span>foo</span> tac <b>toe</b><span>bar</span>');
            }, { component: App });
        }
        {
            let App = (() => {
                let _classDecorators = [customElement({
                        name: 'app', template: `<span t='[prepend]preHtml;[append]postHtml;[html]midHtml'></span>`
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
            $it('works for html resource for [prepend] and [append] + innerHtml', function ({ host }) {
                assert.equal(host.querySelector('span').innerHTML, '<b>tic</b><span>foo</span> <i>tac</i> <b>toe</b><span>bar</span>');
            }, { component: App });
        }
        {
            let App = (() => {
                let _classDecorators = [customElement({
                        name: 'app', template: `<span t.bind='keyExpr'>tac</span>`
                    })];
                let _classDescriptor;
                let _classExtraInitializers = [];
                let _classThis;
                var App = _classThis = class {
                    constructor() {
                        this.keyExpr = '[prepend]preHtml;[append]postHtml';
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
            $it('works correctly for html with the change of both [prepend], and [append] - textContent', function ({ host, app, platform }) {
                assert.equal(host.querySelector('span').innerHTML, '<b>tic</b><span>foo</span> tac <b>toe</b><span>bar</span>');
                app.keyExpr = '[prepend]pre;[append]post';
                platform.domQueue.flush();
                assert.equal(host.querySelector('span').innerHTML, 'tic tac toe');
                app.keyExpr = '[prepend]preHtml;[append]postHtml';
                platform.domQueue.flush();
                assert.equal(host.querySelector('span').innerHTML, '<b>tic</b><span>foo</span> tac <b>toe</b><span>bar</span>');
            }, { component: App });
        }
        {
            let App = (() => {
                let _classDecorators = [customElement({
                        name: 'app', template: `<span t.bind='keyExpr'>tac</span>`
                    })];
                let _classDescriptor;
                let _classExtraInitializers = [];
                let _classThis;
                var App = _classThis = class {
                    constructor() {
                        this.keyExpr = '[prepend]pre;[append]post';
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
            $it('works correctly with the change of both [prepend], and [append] - textContent', function ({ host, app, platform }) {
                assert.equal(host.querySelector('span').innerHTML, 'tic tac toe');
                app.keyExpr = '[prepend]preHtml;[append]postHtml';
                platform.domQueue.flush();
                assert.equal(host.querySelector('span').innerHTML, '<b>tic</b><span>foo</span> tac <b>toe</b><span>bar</span>');
            }, { component: App });
        }
        {
            let App = (() => {
                let _classDecorators = [customElement({
                        name: 'app', template: `<span t.bind='keyExpr'>tac</span>`
                    })];
                let _classDescriptor;
                let _classExtraInitializers = [];
                let _classThis;
                var App = _classThis = class {
                    constructor() {
                        this.keyExpr = '[prepend]preHtml;[append]postHtml';
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
            $it('works correctly with the removal of [append]', function ({ host, app, platform }) {
                assert.equal(host.querySelector('span').innerHTML, '<b>tic</b><span>foo</span> tac <b>toe</b><span>bar</span>');
                app.keyExpr = '[prepend]preHtml';
                platform.domQueue.flush();
                assert.equal(host.querySelector('span').innerHTML, '<b>tic</b><span>foo</span> tac');
            }, { component: App });
        }
        {
            let App = (() => {
                let _classDecorators = [customElement({
                        name: 'app', template: `<span t.bind='keyExpr'>tac</span>`
                    })];
                let _classDescriptor;
                let _classExtraInitializers = [];
                let _classThis;
                var App = _classThis = class {
                    constructor() {
                        this.keyExpr = '[prepend]preHtml;[append]postHtml';
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
            $it('works correctly with the removal of [prepend]', function ({ host, app, platform }) {
                assert.equal(host.querySelector('span').innerHTML, '<b>tic</b><span>foo</span> tac <b>toe</b><span>bar</span>');
                app.keyExpr = '[append]postHtml';
                platform.domQueue.flush();
                assert.equal(host.querySelector('span').innerHTML, 'tac <b>toe</b><span>bar</span>');
            }, { component: App });
        }
        {
            let App = (() => {
                let _classDecorators = [customElement({
                        name: 'app', template: `<span t.bind='keyExpr'>tac</span>`
                    })];
                let _classDescriptor;
                let _classExtraInitializers = [];
                let _classThis;
                var App = _classThis = class {
                    constructor() {
                        this.keyExpr = '[prepend]preHtml;[append]postHtml';
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
            $it('works correctly with the removal of both [prepend] and [append]', function ({ host, app, platform }) {
                assert.equal(host.querySelector('span').innerHTML, '<b>tic</b><span>foo</span> tac <b>toe</b><span>bar</span>');
                app.keyExpr = '[html]midHtml';
                platform.domQueue.flush();
                assert.equal(host.querySelector('span').innerHTML, '<i>tac</i>');
            }, { component: App });
        }
    });
    describe('updates translation', function () {
        {
            let App = (() => {
                let _classDecorators = [customElement({
                        name: 'app', template: `<span t='\${obj.key}'></span>`
                    })];
                let _classDescriptor;
                let _classExtraInitializers = [];
                let _classThis;
                var App = _classThis = class {
                    constructor() {
                        this.obj = { key: 'simple.text' };
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
            $it('when the key expression changed - interpolation', function ({ host, en: translation, app, ctx }) {
                app.obj.key = 'simple.attr';
                ctx.platform.domQueue.flush();
                assertTextContent(host, `span`, translation.simple.attr);
            }, { component: App });
        }
        {
            let App = (() => {
                let _classDecorators = [customElement({
                        name: 'app', template: `<span t='\${obj.base}\${obj.key}'></span>`
                    })];
                let _classDescriptor;
                let _classExtraInitializers = [];
                let _classThis;
                var App = _classThis = class {
                    constructor() {
                        this.obj = { base: 'simple.', key: 'text' };
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
            $it('when the key expression changed - multi-interpolation', function ({ ctx, host, en: translation, app }) {
                const currText = translation.simple.text;
                assertTextContent(host, `span`, currText);
                app.obj.base = 'simple';
                app.obj.key = '.attr';
                assertTextContent(host, `span`, currText);
                ctx.platform.domQueue.flush();
                assertTextContent(host, `span`, translation.simple.attr);
            }, { component: App });
        }
        {
            let App = (() => {
                let _classDecorators = [customElement({
                        name: 'app', template: `<span t.bind='obj.key'></span>`
                    })];
                let _classDescriptor;
                let _classExtraInitializers = [];
                let _classThis;
                var App = _classThis = class {
                    constructor() {
                        this.obj = { key: 'simple.text' };
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
            $it('when the key expression changed - access-member', function ({ ctx, host, en: translation, app }) {
                app.obj.key = 'simple.attr';
                ctx.platform.domQueue.flush();
                assertTextContent(host, `span`, translation.simple.attr);
            }, { component: App });
        }
        {
            let App = (() => {
                let _classDecorators = [customElement({
                        name: 'app', template: `<span t.bind='key'></span>`
                    })];
                let _classDescriptor;
                let _classExtraInitializers = [];
                let _classThis;
                var App = _classThis = class {
                    constructor() {
                        this.key = 'simple.text';
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
            $it('when the key expression changed - property', function ({ ctx, host, en: translation, app }) {
                app.key = 'simple.attr';
                ctx.platform.domQueue.flush();
                assertTextContent(host, `span`, translation.simple.attr);
                app.key = 'simple.text';
                ctx.platform.domQueue.flush();
                assertTextContent(host, `span`, translation.simple.text);
                app.key = 'simple.attr';
                ctx.platform.domQueue.flush();
                assertTextContent(host, `span`, translation.simple.attr);
            }, { component: App });
        }
        {
            let MyCe = (() => {
                let _classDecorators = [customElement({ name: 'my-ce', template: '${value}' })];
                let _classDescriptor;
                let _classExtraInitializers = [];
                let _classThis;
                let _value_decorators;
                let _value_initializers = [];
                let _value_extraInitializers = [];
                var MyCe = _classThis = class {
                    constructor() {
                        this.value = __runInitializers(this, _value_initializers, void 0);
                        __runInitializers(this, _value_extraInitializers);
                    }
                };
                __setFunctionName(_classThis, "MyCe");
                (() => {
                    const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
                    _value_decorators = [bindable];
                    __esDecorate(null, null, _value_decorators, { kind: "field", name: "value", static: false, private: false, access: { has: obj => "value" in obj, get: obj => obj.value, set: (obj, value) => { obj.value = value; } }, metadata: _metadata }, _value_initializers, _value_extraInitializers);
                    __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
                    MyCe = _classThis = _classDescriptor.value;
                    if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
                    __runInitializers(_classThis, _classExtraInitializers);
                })();
                return MyCe = _classThis;
            })();
            let App = (() => {
                let _classDecorators = [customElement({
                        name: 'app',
                        template: `<my-ce t.bind='"[value]"+key'></my-ce>`,
                        dependencies: [MyCe]
                    })];
                let _classDescriptor;
                let _classExtraInitializers = [];
                let _classThis;
                var App = _classThis = class {
                    constructor() {
                        this.key = 'simple.text';
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
            $it('when the key expression changed - property - custom element', function ({ ctx, host, en: translation, app }) {
                app.key = 'simple.attr';
                ctx.platform.domQueue.flush();
                assertTextContent(host, `my-ce`, translation.simple.attr);
                app.key = 'simple.text';
                ctx.platform.domQueue.flush();
                assertTextContent(host, `my-ce`, translation.simple.text);
                app.key = 'simple.attr';
                ctx.platform.domQueue.flush();
                assertTextContent(host, `my-ce`, translation.simple.attr);
            }, { component: App });
        }
        {
            let App = (() => {
                let _classDecorators = [customElement({
                        name: 'app', template: `<span t.bind='"[data-foo]"+key'></span>`
                    })];
                let _classDescriptor;
                let _classExtraInitializers = [];
                let _classThis;
                var App = _classThis = class {
                    constructor() {
                        this.key = 'simple.text';
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
            $it('when the key expression changed - property - DOM Element attribute', function ({ ctx, host, en: translation, app }) {
                const span = host.querySelector('span');
                assert.strictEqual(span.dataset.foo, translation.simple.text);
                app.key = 'simple.attr';
                ctx.platform.domQueue.flush();
                assert.strictEqual(span.dataset.foo, translation.simple.attr);
                app.key = 'simple.text';
                ctx.platform.domQueue.flush();
                assert.strictEqual(span.dataset.foo, translation.simple.text);
                app.key = 'simple.attr';
                ctx.platform.domQueue.flush();
                assert.strictEqual(span.dataset.foo, translation.simple.attr);
            }, { component: App });
        }
        {
            let MyCe = (() => {
                let _classDecorators = [customElement({ name: 'my-ce', template: '${foo} ${bar}' })];
                let _classDescriptor;
                let _classExtraInitializers = [];
                let _classThis;
                let _foo_decorators;
                let _foo_initializers = [];
                let _foo_extraInitializers = [];
                let _bar_decorators;
                let _bar_initializers = [];
                let _bar_extraInitializers = [];
                var MyCe = _classThis = class {
                    constructor() {
                        this.foo = __runInitializers(this, _foo_initializers, void 0);
                        this.bar = (__runInitializers(this, _foo_extraInitializers), __runInitializers(this, _bar_initializers, void 0));
                        __runInitializers(this, _bar_extraInitializers);
                    }
                };
                __setFunctionName(_classThis, "MyCe");
                (() => {
                    const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
                    _foo_decorators = [bindable];
                    _bar_decorators = [bindable];
                    __esDecorate(null, null, _foo_decorators, { kind: "field", name: "foo", static: false, private: false, access: { has: obj => "foo" in obj, get: obj => obj.foo, set: (obj, value) => { obj.foo = value; } }, metadata: _metadata }, _foo_initializers, _foo_extraInitializers);
                    __esDecorate(null, null, _bar_decorators, { kind: "field", name: "bar", static: false, private: false, access: { has: obj => "bar" in obj, get: obj => obj.bar, set: (obj, value) => { obj.bar = value; } }, metadata: _metadata }, _bar_initializers, _bar_extraInitializers);
                    __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
                    MyCe = _classThis = _classDescriptor.value;
                    if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
                    __runInitializers(_classThis, _classExtraInitializers);
                })();
                return MyCe = _classThis;
            })();
            let App = (() => {
                let _classDecorators = [customElement({
                        name: 'app',
                        template: `<my-ce t.bind='"[foo]"+key1+";[bar]"+key2'></my-ce>`,
                        dependencies: [MyCe]
                    })];
                let _classDescriptor;
                let _classExtraInitializers = [];
                let _classThis;
                var App = _classThis = class {
                    constructor() {
                        this.key1 = 'simple.text';
                        this.key2 = 'simple.attr';
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
            $it('when the key expression changed - property - custom element - multiple bindables', function ({ ctx, host, en: translation, app }) {
                const r = translation.simple;
                assertTextContent(host, `my-ce`, `${r.text} ${r.attr}`);
                app.key1 = 'simple.attr';
                ctx.platform.domQueue.flush();
                assertTextContent(host, `my-ce`, `${r.attr} ${r.attr}`);
                app.key2 = 'simple.text';
                ctx.platform.domQueue.flush();
                assertTextContent(host, `my-ce`, `${r.attr} ${r.text}`);
                app.key1 = 'simple.text';
                ctx.platform.domQueue.flush();
                assertTextContent(host, `my-ce`, `${r.text} ${r.text}`);
            }, { component: App });
        }
        {
            let App = (() => {
                let _classDecorators = [customElement({
                        name: 'app', template: `<span t.bind='"[data-foo]"+key1+";[bar]"+key2'></span>`
                    })];
                let _classDescriptor;
                let _classExtraInitializers = [];
                let _classThis;
                var App = _classThis = class {
                    constructor() {
                        this.key1 = 'simple.text';
                        this.key2 = 'simple.attr';
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
            $it('when the key expression changed - property - multiple DOM Element attributes', function ({ ctx, host, en: translation, app }) {
                const r = translation.simple;
                const span = host.querySelector('span');
                assert.strictEqual(span.dataset.foo, r.text);
                assert.strictEqual(span.bar, r.attr);
                app.key1 = 'simple.attr';
                ctx.platform.domQueue.flush();
                assert.strictEqual(span.dataset.foo, r.attr);
                assert.strictEqual(span.bar, r.attr);
                app.key2 = 'simple.text';
                ctx.platform.domQueue.flush();
                assert.strictEqual(span.dataset.foo, r.attr);
                assert.strictEqual(span.bar, r.text);
                app.key1 = 'simple.text';
                ctx.platform.domQueue.flush();
                assert.strictEqual(span.dataset.foo, translation.simple.text);
                assert.strictEqual(span.bar, r.text);
            }, { component: App });
        }
        {
            let App = (() => {
                let _classDecorators = [customElement({
                        name: 'app', template: `<span t="status" t-params.bind="params"></span>`
                    })];
                let _classDescriptor;
                let _classExtraInitializers = [];
                let _classThis;
                var App = _classThis = class {
                    constructor() {
                        this.deliveredOn = new Date(2021, 1, 10, 5, 15);
                        this.params = { context: 'delivered', date: this.deliveredOn };
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
            $it('when the translation parameters changed', function ({ ctx, host, en: translation, app }) {
                app.params = { ...app.params, context: 'dispatched' };
                ctx.platform.domQueue.flush();
                assertTextContent(host, `span`, translation.status_dispatched.replace('{{date}}', app.deliveredOn.toString()));
            }, { component: App });
        }
        {
            let App = (() => {
                let _classDecorators = [customElement({
                        name: 'app', template: `<span id='a' t='simple.text'></span>`
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
            $it('when the locale is changed', async function ({ ctx, host, de, i18n }) {
                await i18n.setLocale('de');
                ctx.platform.domQueue.flush();
                assertTextContent(host, 'span', de.simple.text);
            }, { component: App });
        }
    });
    describe('works with custom elements', function () {
        {
            let App = (() => {
                let _classDecorators = [customElement({
                        name: 'app', template: `<custom-message t="[message]simple.text"></custom-message>`
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
            $it('can bind to custom elements attributes', function ({ host, en }) {
                assertTextContent(host, 'custom-message div', en.simple.text);
            }, { component: App });
        }
        {
            let App = (() => {
                let _classDecorators = [customElement({
                        name: 'app', template: `<custom-message component.ref="cm" t="[message]itemWithCount" t-params.bind="{count}">`
                    })];
                let _classDescriptor;
                let _classExtraInitializers = [];
                let _classThis;
                var App = _classThis = class {
                    constructor() {
                        this.count = 0;
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
            $it('should support params', function ({ app, host, en, ctx }) {
                assertTextContent(host, 'custom-message div', en.itemWithCount_other.replace('{{count}}', '0'));
                app.count = 10;
                assert.strictEqual(app.cm.message, en.itemWithCount_other.replace('{{count}}', '10'), '<CustomMessage/> message prop should have been updated immediately');
                assertTextContent(host, 'custom-message div', en.itemWithCount_other.replace('{{count}}', '0'));
                ctx.platform.domQueue.flush();
                assertTextContent(host, 'custom-message div', en.itemWithCount_other.replace('{{count}}', '10'));
            }, { component: App });
        }
        {
            let App = (() => {
                let _classDecorators = [customElement({
                        name: 'app', template: `<custom-message t="[message]simple.text"></custom-message>`
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
            $it('should support locale changes', async function ({ host, de, i18n, platform }) {
                await i18n.setLocale('de');
                platform.domQueue.flush();
                assertTextContent(host, 'custom-message div', de.simple.text);
            }, { component: App });
        }
        {
            let App = (() => {
                let _classDecorators = [customElement({
                        name: 'app', template: `<camel-ce some-message="ignored" t="[some-message]simple.text"></camel-ce>`
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
            $it('can bind to custom elements attributes with camelCased bindable', function ({ host, en }) {
                assertTextContent(host, 'camel-ce div', en.simple.text);
            }, { component: App });
        }
        {
            let App = (() => {
                let _classDecorators = [customElement({
                        name: 'app', template: `<camel-ce component.ref="cm" t="[some-message]itemWithCount" t-params.bind="{count}">`
                    })];
                let _classDescriptor;
                let _classExtraInitializers = [];
                let _classThis;
                var App = _classThis = class {
                    constructor() {
                        this.count = 0;
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
            $it('should support params', function ({ app, host, en, ctx }) {
                assertTextContent(host, 'camel-ce div', en.itemWithCount_other.replace('{{count}}', '0'));
                app.count = 10;
                assert.strictEqual(app.cm.someMessage, en.itemWithCount_other.replace('{{count}}', '10'), '<camel-ce/> message prop should have been updated immediately');
                assertTextContent(host, 'camel-ce div', en.itemWithCount_other.replace('{{count}}', '0'));
                ctx.platform.domQueue.flush();
                assertTextContent(host, 'camel-ce div', en.itemWithCount_other.replace('{{count}}', '10'));
            }, { component: App });
        }
        {
            let App = (() => {
                let _classDecorators = [customElement({
                        name: 'app', template: `<camel-ce some-message="ignored" t="[some-message]simple.text"></camel-ce>`
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
            $it('should support locale changes with camelCased bindable', async function ({ host, de, i18n, platform }) {
                await i18n.setLocale('de');
                platform.domQueue.flush();
                assertTextContent(host, 'camel-ce div', de.simple.text);
            }, { component: App });
        }
    });
    describe('`t` value-converter works for', function () {
        {
            let App = (() => {
                let _classDecorators = [customElement({ name: 'app', template: `<span>\${'simple.text' | t}</span>` })];
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
            $it('key as string literal', function ({ host, en: translation }) {
                assertTextContent(host, 'span', translation.simple.text);
            }, { component: App });
        }
        {
            let App = (() => {
                let _classDecorators = [customElement({ name: 'app', template: `<span>\${key | t}</span>` })];
                let _classDescriptor;
                let _classExtraInitializers = [];
                let _classThis;
                var App = _classThis = class {
                    constructor() {
                        this.key = 'simple.text';
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
            $it('key bound from vm property', function ({ host, en: translation }) {
                assertTextContent(host, 'span', translation.simple.text);
            }, { component: App });
        }
        {
            let App = (() => {
                let _classDecorators = [customElement({ name: 'app', template: `<span>\${'itemWithCount' | t: {count:10}}</span>` })];
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
            $it('with `t-params`', function ({ host, en: translation }) {
                assertTextContent(host, 'span', translation.itemWithCount_other.replace('{{count}}', '10'));
            }, { component: App });
        }
        {
            let App = (() => {
                let _classDecorators = [customElement({
                        name: 'app', template: `
      <span id="a" title.bind="'simple.text' | t">t-vc-attr-target</span>
      <span id="b" title="\${'simple.text' | t}">t-vc-attr-target</span>
      <span id="c" title.bind="'itemWithCount' | t : {count:10}">t-vc-attr-target</span>
      `
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
            $it('attribute translation', function ({ host, en: translation }) {
                assertTextContent(host, `span#a[title='${translation.simple.text}']`, 't-vc-attr-target');
                assertTextContent(host, `span#b[title='${translation.simple.text}']`, 't-vc-attr-target');
                assertTextContent(host, `span#c[title='${translation.itemWithCount_other.replace('{{count}}', '10')}']`, 't-vc-attr-target');
            }, { component: App });
        }
        {
            let App = (() => {
                let _classDecorators = [customElement({ name: 'app', template: `<span>\${'simple.text' | t}</span>` })];
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
            $it('change of locale', async function ({ host, de, platform, i18n }) {
                await i18n.setLocale('de');
                platform.domQueue.flush();
                assertTextContent(host, 'span', de.simple.text);
            }, { component: App });
        }
    });
    describe('`t` binding-behavior works for', function () {
        {
            let App = (() => {
                let _classDecorators = [customElement({ name: 'app', template: `<span>\${'simple.text' & t}</span>` })];
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
            $it('key as string literal', function ({ host, en: translation }) {
                assertTextContent(host, 'span', translation.simple.text);
            }, { component: App });
        }
        {
            let App = (() => {
                let _classDecorators = [customElement({ name: 'app', template: `<span>\${key & t}</span>` })];
                let _classDescriptor;
                let _classExtraInitializers = [];
                let _classThis;
                var App = _classThis = class {
                    constructor() {
                        this.key = 'simple.text';
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
            $it('key bound from vm property', function ({ host, en: translation }) {
                assertTextContent(host, 'span', translation.simple.text);
            }, { component: App });
        }
        {
            let App = (() => {
                let _classDecorators = [customElement({ name: 'app', template: `<span>\${'itemWithCount' & t : {count:10}}</span>` })];
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
            $it('with `t-params`', function ({ host, en: translation }) {
                assertTextContent(host, 'span', translation.itemWithCount_other.replace('{{count}}', '10'));
            }, { component: App });
        }
        {
            let App = (() => {
                let _classDecorators = [customElement({
                        name: 'app', template: `
      <span id="a" title.bind="'simple.text' & t">t-vc-attr-target</span>
      <span id="b" title="\${'simple.text' & t}">t-vc-attr-target</span>
      <span id="c" title.bind="'itemWithCount' & t : {count:10}">t-vc-attr-target</span>
      `
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
            $it('attribute translation', function ({ host, en: translation }) {
                assertTextContent(host, `span#a[title='${translation.simple.text}']`, 't-vc-attr-target');
                assertTextContent(host, `span#b[title='${translation.simple.text}']`, 't-vc-attr-target');
                assertTextContent(host, `span#c[title='${translation.itemWithCount_other.replace('{{count}}', '10')}']`, 't-vc-attr-target');
            }, { component: App });
        }
        {
            let App = (() => {
                let _classDecorators = [customElement({ name: 'app', template: `<span>\${'simple.text' & t}</span>` })];
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
            $it('change of locale', async function ({ host, de, platform, i18n }) {
                await i18n.setLocale('de');
                platform.domQueue.flush();
                assertTextContent(host, 'span', de.simple.text);
            }, { component: App });
        }
    });
    describe('`df` value-converter', function () {
        const cases = [
            { name: 'works for date object', input: new Date(2019, 7, 20), output: new Date('8/20/2019').toLocaleDateString('en') },
            { name: 'works for ISO 8601 date string', input: new Date(2019, 7, 20).toISOString(), output: new Date('8/20/2019').toLocaleDateString('en') },
            { name: 'works for integer', input: 0, output: new Date(0).toLocaleDateString('en') },
            { name: 'works for integer string', input: '0', output: new Date(0).toLocaleDateString('en') },
            { name: 'returns undefined for undefined', input: undefined, output: undefined },
            { name: 'returns null for null', input: null, output: null },
            { name: 'returns empty string for empty string', input: '', output: '' },
            { name: 'returns whitespace for whitespace', input: '  ', output: '  ' },
            { name: 'returns `invalidValueForDate` for `invalidValueForDate`', input: 'invalidValueForDate', output: 'invalidValueForDate' },
        ];
        for (const { name, input, output } of cases) {
            const baseDef = { name: `app`, template: `<span>\${ dt | df }</span>` };
            let App = (() => {
                let _classDecorators = [customElement(baseDef)];
                let _classDescriptor;
                let _classExtraInitializers = [];
                let _classThis;
                var App = _classThis = class {
                    constructor() {
                        this.dt = input;
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
            $it(`${name} STRICT`, function ({ host }) {
                assertTextContent(host, 'span', `${output ?? ''}`);
            }, { component: App });
            let App1 = (() => {
                let _classDecorators = [customElement({ ...baseDef })];
                let _classDescriptor;
                let _classExtraInitializers = [];
                let _classThis;
                var App1 = _classThis = class {
                    constructor() {
                        this.dt = input;
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
            $it(name, function ({ host }) {
                assertTextContent(host, 'span', (output ?? '').toString());
            }, { component: App1 });
        }
        {
            let App = (() => {
                let _classDecorators = [customElement({ name: 'app', template: `<span>\${ dt | df : {year:'2-digit', month:'2-digit', day:'2-digit'} : 'de' }</span>` })];
                let _classDescriptor;
                let _classExtraInitializers = [];
                let _classThis;
                var App = _classThis = class {
                    constructor() {
                        this.dt = new Date(2019, 7, 20);
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
            $it('respects provided locale and formatting options', function ({ host }) {
                assertTextContent(host, 'span', '20.08.19');
            }, { component: App });
        }
        {
            let App = (() => {
                let _classDecorators = [customElement({ name: 'app', template: `<span>\${ dt | df }</span>` })];
                let _classDescriptor;
                let _classExtraInitializers = [];
                let _classThis;
                var App = _classThis = class {
                    constructor() {
                        this.dt = new Date(2019, 7, 20);
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
            $it('works for change of locale', async function ({ host, i18n, platform }) {
                await i18n.setLocale('de');
                platform.domQueue.flush();
                assertTextContent(host, 'span', '20.8.2019');
            }, { component: App });
            $it('works for change of source value', function ({ host, platform, app }) {
                app.dt = new Date(2019, 7, 21);
                platform.domQueue.flush();
                assertTextContent(host, 'span', '8/21/2019');
            }, { component: App });
        }
    });
    describe('`df` binding-behavior', function () {
        const cases = [
            { name: 'works for date object', input: new Date(2019, 7, 20), output: new Date('8/20/2019').toLocaleDateString('en') },
            { name: 'works for ISO 8601 date string', input: new Date(2019, 7, 20).toISOString(), output: new Date('8/20/2019').toLocaleDateString('en') },
            { name: 'works for integer', input: 0, output: new Date(0).toLocaleDateString('en') },
            { name: 'works for integer string', input: '0', output: new Date(0).toLocaleDateString('en') },
            { name: 'returns undefined for undefined', input: undefined, output: undefined },
            { name: 'returns null for null', input: null, output: null },
            { name: 'returns empty string for empty string', input: '', output: '' },
            { name: 'returns whitespace for whitespace', input: '  ', output: '  ' },
            { name: 'returns `invalidValueForDate` for `invalidValueForDate`', input: 'invalidValueForDate', output: 'invalidValueForDate' },
        ];
        for (const { name, input, output } of cases) {
            const baseDef = { name: 'app', template: `<span>\${ dt & df }</span>` };
            let App = (() => {
                let _classDecorators = [customElement(baseDef)];
                let _classDescriptor;
                let _classExtraInitializers = [];
                let _classThis;
                var App = _classThis = class {
                    constructor() {
                        this.dt = input;
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
            $it(`${name} STRICT`, function ({ host }) {
                assertTextContent(host, 'span', `${output ?? ''}`);
            }, { component: App });
            let App1 = (() => {
                let _classDecorators = [customElement({ ...baseDef })];
                let _classDescriptor;
                let _classExtraInitializers = [];
                let _classThis;
                var App1 = _classThis = class {
                    constructor() {
                        this.dt = input;
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
            $it(name, function ({ host }) {
                assertTextContent(host, 'span', (output ?? '').toString());
            }, { component: App1 });
        }
        {
            let App = (() => {
                let _classDecorators = [customElement({ name: 'app', template: `<span>\${ dt & df : {year:'2-digit', month:'2-digit', day:'2-digit'} : 'de' }</span>` })];
                let _classDescriptor;
                let _classExtraInitializers = [];
                let _classThis;
                var App = _classThis = class {
                    constructor() {
                        this.dt = new Date(2019, 7, 20);
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
            $it('respects provided locale and formatting options', function ({ host }) {
                assertTextContent(host, 'span', '20.08.19');
            }, { component: App });
        }
        {
            let App = (() => {
                let _classDecorators = [customElement({ name: 'app', template: `<span>\${ dt & df }</span>` })];
                let _classDescriptor;
                let _classExtraInitializers = [];
                let _classThis;
                var App = _classThis = class {
                    constructor() {
                        this.dt = new Date(2019, 7, 20);
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
            $it('works for change of locale', async function ({ host, i18n, platform }) {
                await i18n.setLocale('de');
                platform.domQueue.flush();
                assertTextContent(host, 'span', '20.8.2019');
            }, { component: App });
        }
        {
            let App = (() => {
                let _classDecorators = [customElement({ name: 'app', template: `<span>\${ dt & df }</span>` })];
                let _classDescriptor;
                let _classExtraInitializers = [];
                let _classThis;
                var App = _classThis = class {
                    constructor() {
                        this.dt = new Date(2019, 7, 20);
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
            $it('works for change of source value', function ({ host, platform, app }) {
                app.dt = new Date(2019, 7, 21);
                platform.domQueue.flush();
                assertTextContent(host, 'span', '8/21/2019');
            }, { component: App });
        }
    });
    describe('`nf` value-converter', function () {
        const def = { name: 'app', template: `<span>\${ num | nf }</span>` };
        const strictDef = { ...def };
        for (const value of [undefined, null, 'chaos', new Date(), true]) {
            let App = (() => {
                let _classDecorators = [customElement(strictDef)];
                let _classDescriptor;
                let _classExtraInitializers = [];
                let _classThis;
                var App = _classThis = class {
                    constructor() {
                        this.num = value;
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
            $it(`returns the value itself if the value is not a number STRICT binding, for example: ${value}`, function ({ host }) {
                assertTextContent(host, 'span', `${value ?? ''}`);
            }, { component: App });
            let App1 = (() => {
                let _classDecorators = [customElement(def)];
                let _classDescriptor;
                let _classExtraInitializers = [];
                let _classThis;
                var App1 = _classThis = class {
                    constructor() {
                        this.num = value;
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
            $it(`returns the value itself if the value is not a number, for example: ${value}`, function ({ host }) {
                assertTextContent(host, 'span', `${value ?? ''}`);
            }, { component: App1 });
        }
        {
            let App = (() => {
                let _classDecorators = [customElement({ name: 'app', template: `<span>\${ num | nf }</span>` })];
                let _classDescriptor;
                let _classExtraInitializers = [];
                let _classThis;
                var App = _classThis = class {
                    constructor() {
                        this.num = 123456789.12;
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
            $it('formats number by default as per current locale and default formatting options', function ({ host }) {
                assertTextContent(host, 'span', '123,456,789.12');
            }, { component: App });
            $it('works for change of locale', async function ({ host, i18n, platform }) {
                await i18n.setLocale('de');
                platform.domQueue.flush();
                assertTextContent(host, 'span', '123.456.789,12');
            }, { component: App });
            $it('works for change of source value', function ({ host, platform, app }) {
                app.num = 123456789.21;
                platform.domQueue.flush();
                assertTextContent(host, 'span', '123,456,789.21');
            }, { component: App });
        }
        {
            let App = (() => {
                let _classDecorators = [customElement({ name: 'app', template: `<span>\${ num | nf : { style: 'currency', currency: 'EUR' } }</span>` })];
                let _classDescriptor;
                let _classExtraInitializers = [];
                let _classThis;
                var App = _classThis = class {
                    constructor() {
                        this.num = 123456789.12;
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
            $it('formats a given number as per given formatting options', function ({ host }) {
                assertTextContent(host, 'span', '€123,456,789.12');
            }, { component: App });
        }
        {
            let App = (() => {
                let _classDecorators = [customElement({ name: 'app', template: `<span>\${ num | nf : undefined : 'de' }</span>` })];
                let _classDescriptor;
                let _classExtraInitializers = [];
                let _classThis;
                var App = _classThis = class {
                    constructor() {
                        this.num = 123456789.12;
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
            $it('formats a given number as per given locale', function ({ host }) {
                assertTextContent(host, 'span', '123.456.789,12');
            }, { component: App });
        }
        {
            let App = (() => {
                let _classDecorators = [customElement({ name: 'app', template: `<span>\${ num | nf : { style: 'currency', currency: 'EUR' } : 'de' }</span>` })];
                let _classDescriptor;
                let _classExtraInitializers = [];
                let _classThis;
                var App = _classThis = class {
                    constructor() {
                        this.num = 123456789.12;
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
            $it('formats a given number as per given locale and formatting options', function ({ host }) {
                assertTextContent(host, 'span', '123.456.789,12\u00A0€');
            }, { component: App });
        }
    });
    describe('`nf` binding-behavior', function () {
        const def = { name: 'app', template: `<span>\${ num & nf }</span>` };
        const strictDef = { ...def };
        for (const value of [undefined, null, 'chaos', new Date(), true]) {
            let App = (() => {
                let _classDecorators = [customElement(strictDef)];
                let _classDescriptor;
                let _classExtraInitializers = [];
                let _classThis;
                var App = _classThis = class {
                    constructor() {
                        this.num = value;
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
            $it(`returns the value itself if the value is not a number STRICT binding, for example: ${value}`, function ({ host }) {
                assertTextContent(host, 'span', `${value ?? ''}`);
            }, { component: App });
            let App1 = (() => {
                let _classDecorators = [customElement(def)];
                let _classDescriptor;
                let _classExtraInitializers = [];
                let _classThis;
                var App1 = _classThis = class {
                    constructor() {
                        this.num = value;
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
            $it(`returns the value itself if the value is not a number, for example: ${value}`, function ({ host }) {
                assertTextContent(host, 'span', `${value ?? ''}`);
            }, { component: App1 });
        }
        {
            let App = (() => {
                let _classDecorators = [customElement({ name: 'app', template: `<span>\${ num & nf }</span>` })];
                let _classDescriptor;
                let _classExtraInitializers = [];
                let _classThis;
                var App = _classThis = class {
                    constructor() {
                        this.num = 123456789.12;
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
            $it('formats number by default as per current locale and default formatting options', function ({ host }) {
                assertTextContent(host, 'span', '123,456,789.12');
            }, { component: App });
        }
        {
            let App = (() => {
                let _classDecorators = [customElement({ name: 'app', template: `<span>\${ num & nf : { style: 'currency', currency: 'EUR' } }</span>` })];
                let _classDescriptor;
                let _classExtraInitializers = [];
                let _classThis;
                var App = _classThis = class {
                    constructor() {
                        this.num = 123456789.12;
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
            $it('formats a given number as per given formatting options', function ({ host }) {
                assertTextContent(host, 'span', '€123,456,789.12');
            }, { component: App });
        }
        {
            let App = (() => {
                let _classDecorators = [customElement({ name: 'app', template: `<span>\${ num & nf : undefined : 'de' }</span>` })];
                let _classDescriptor;
                let _classExtraInitializers = [];
                let _classThis;
                var App = _classThis = class {
                    constructor() {
                        this.num = 123456789.12;
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
            $it('formats a given number as per given locale', function ({ host }) {
                assertTextContent(host, 'span', '123.456.789,12');
            }, { component: App });
        }
        {
            let App = (() => {
                let _classDecorators = [customElement({ name: 'app', template: `<span>\${ num & nf : { style: 'currency', currency: 'EUR' } : 'de' }</span>` })];
                let _classDescriptor;
                let _classExtraInitializers = [];
                let _classThis;
                var App = _classThis = class {
                    constructor() {
                        this.num = 123456789.12;
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
            $it('formats a given number as per given locale and formating options', function ({ host }) {
                assertTextContent(host, 'span', '123.456.789,12\u00A0€');
            }, { component: App });
        }
        {
            let App = (() => {
                let _classDecorators = [customElement({ name: 'app', template: `<span>\${ num & nf }</span>` })];
                let _classDescriptor;
                let _classExtraInitializers = [];
                let _classThis;
                var App = _classThis = class {
                    constructor() {
                        this.num = 123456789.12;
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
            $it('works for change of locale', async function ({ host, i18n, platform }) {
                await i18n.setLocale('de');
                platform.domQueue.flush();
                assertTextContent(host, 'span', '123.456.789,12');
            }, { component: App });
        }
        {
            let App = (() => {
                let _classDecorators = [customElement({ name: 'app', template: `<span>\${ num & nf }</span>` })];
                let _classDescriptor;
                let _classExtraInitializers = [];
                let _classThis;
                var App = _classThis = class {
                    constructor() {
                        this.num = 123456789.12;
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
            $it('works for change of source value', function ({ host, app, platform }) {
                app.num = 123456789.21;
                platform.domQueue.flush();
                assertTextContent(host, 'span', '123,456,789.21');
            }, { component: App });
        }
    });
    describe('`rt` value-converter', function () {
        for (const value of [undefined, null, 'chaos', 123, true]) {
            const def = { name: 'app', template: `<span>\${ dt | rt }</span>` };
            const strictDef = { ...def };
            let App = (() => {
                let _classDecorators = [customElement(strictDef)];
                let _classDescriptor;
                let _classExtraInitializers = [];
                let _classThis;
                var App = _classThis = class {
                    constructor() {
                        this.dt = value;
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
            $it(`returns the value itself if the value is not a number STRICT, for example: ${value}`, function ({ host }) {
                assertTextContent(host, 'span', `${value ?? ''}`);
            }, { component: App });
            let App1 = (() => {
                let _classDecorators = [customElement(def)];
                let _classDescriptor;
                let _classExtraInitializers = [];
                let _classThis;
                var App1 = _classThis = class {
                    constructor() {
                        this.dt = value;
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
            $it(`returns the value itself if the value is not a number, for example: ${value}`, function ({ host }) {
                assertTextContent(host, 'span', `${value ?? ''}`);
            }, { component: App1 });
        }
        {
            let App = (() => {
                let _classDecorators = [customElement({ name: 'app', template: `<span>\${ dt | rt }</span>` })];
                let _classDescriptor;
                let _classExtraInitializers = [];
                let _classThis;
                var App = _classThis = class {
                    constructor() {
                        this.dt = new Date();
                        this.dt.setHours(this.dt.getHours() - 2);
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
            $it('formats date by default as per current locale and default formatting options', function ({ host }) {
                assertTextContent(host, 'span', '2 hours ago');
            }, { component: App });
        }
        {
            let App = (() => {
                let _classDecorators = [customElement({ name: 'app', template: `<span>\${ dt | rt : undefined : 'de' }</span>` })];
                let _classDescriptor;
                let _classExtraInitializers = [];
                let _classThis;
                var App = _classThis = class {
                    constructor() {
                        this.dt = new Date();
                        this.dt.setHours(this.dt.getHours() - 2);
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
            $it('formats a given number as per given locale', function ({ host }) {
                assertTextContent(host, 'span', 'vor 2 Stunden');
            }, { component: App });
        }
        {
            let App = (() => {
                let _classDecorators = [customElement({ name: 'app', template: `<span>\${ dt | rt : { style: 'short' } : 'de' }</span>` })];
                let _classDescriptor;
                let _classExtraInitializers = [];
                let _classThis;
                var App = _classThis = class {
                    constructor() {
                        this.dt = new Date();
                        this.dt.setHours(this.dt.getHours() - 2);
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
            $it('formats a given number as per given locale and formating options', function ({ host }) {
                assertTextContent(host, 'span', 'vor 2 Std.');
            }, { component: App });
        }
        {
            let App = (() => {
                let _classDecorators = [customElement({ name: 'app', template: `<span>\${ dt | rt }</span>` })];
                let _classDescriptor;
                let _classExtraInitializers = [];
                let _classThis;
                var App = _classThis = class {
                    constructor() {
                        this.dt = new Date();
                        this.dt.setHours(this.dt.getHours() - 2);
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
            $it('works for change of locale', async function ({ host, i18n, platform }) {
                await i18n.setLocale('de');
                platform.domQueue.flush();
                assertTextContent(host, 'span', 'vor 2 Stunden');
            }, { component: App });
        }
        {
            let App = (() => {
                let _classDecorators = [customElement({ name: 'app', template: `<span>\${ dt | rt }</span>` })];
                let _classDescriptor;
                let _classExtraInitializers = [];
                let _classThis;
                var App = _classThis = class {
                    constructor() {
                        this.dt = new Date();
                        this.dt.setHours(this.dt.getHours() - 2);
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
            $it('works for change of source value', function ({ host, platform, app }) {
                app.dt = new Date(app.dt.setHours(app.dt.getHours() - 3));
                platform.domQueue.flush();
                assertTextContent(host, 'span', '5 hours ago');
            }, { component: App });
        }
        it('updates formatted value if rt_signal', async function () {
            this.timeout(10000);
            const offset = 2000; // reduce the amount of time the test takes to run
            let App = (() => {
                let _classDecorators = [customElement({ name: 'app', template: `<span>\${ dt | rt }</span>` })];
                let _classDescriptor;
                let _classExtraInitializers = [];
                let _classThis;
                var App = _classThis = class {
                    constructor() {
                        this.dt = new Date(Date.now() - offset);
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
            await runTest(async function ({ platform, host, container }) {
                await platform.taskQueue.queueTask(delta => {
                    container.get(ISignaler).dispatchSignal(Signals.RT_SIGNAL);
                    platform.domQueue.flush();
                    assertTextContent(host, 'span', `${Math.round((delta + offset) / 1000)} seconds ago`);
                }, { delay: 1000 }).result;
            }, { component: App });
        });
    });
    describe('`rt` binding-behavior', function () {
        const def = { name: 'app', template: `<span>\${ dt & rt }</span>` };
        const strictDef = { ...def };
        for (const value of [undefined, null, 'chaos', 123, true]) {
            let App = (() => {
                let _classDecorators = [customElement(strictDef)];
                let _classDescriptor;
                let _classExtraInitializers = [];
                let _classThis;
                var App = _classThis = class {
                    constructor() {
                        this.dt = value;
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
            $it(`returns the value itself if the value is not a number STRICT binding, for example: ${value}`, function ({ host }) {
                assertTextContent(host, 'span', `${value ?? ''}`);
            }, { component: App });
            let App1 = (() => {
                let _classDecorators = [customElement(def)];
                let _classDescriptor;
                let _classExtraInitializers = [];
                let _classThis;
                var App1 = _classThis = class {
                    constructor() {
                        this.dt = value;
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
            $it(`returns the value itself if the value is not a number, for example: ${value}`, function ({ host }) {
                assertTextContent(host, 'span', `${value ?? ''}`);
            }, { component: App1 });
        }
        {
            let App = (() => {
                let _classDecorators = [customElement(def)];
                let _classDescriptor;
                let _classExtraInitializers = [];
                let _classThis;
                var App = _classThis = class {
                    constructor() {
                        this.dt = new Date();
                        this.dt.setHours(this.dt.getHours() - 2);
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
            $it('formats date by default as per current locale and default formatting options', function ({ host }) {
                assertTextContent(host, 'span', '2 hours ago');
            }, { component: App });
        }
        {
            let App = (() => {
                let _classDecorators = [customElement({ name: 'app', template: `<span>\${ dt & rt : undefined : 'de' }</span>` })];
                let _classDescriptor;
                let _classExtraInitializers = [];
                let _classThis;
                var App = _classThis = class {
                    constructor() {
                        this.dt = new Date();
                        this.dt.setHours(this.dt.getHours() - 2);
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
            $it('formats a given number as per given locale', function ({ host }) {
                assertTextContent(host, 'span', 'vor 2 Stunden');
            }, { component: App });
        }
        {
            let App = (() => {
                let _classDecorators = [customElement({ name: 'app', template: `<span>\${ dt & rt : { style: 'short' } : 'de' }</span>` })];
                let _classDescriptor;
                let _classExtraInitializers = [];
                let _classThis;
                var App = _classThis = class {
                    constructor() {
                        this.dt = new Date();
                        this.dt.setHours(this.dt.getHours() - 2);
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
            $it('formats a given number as per given locale and formating options', function ({ host }) {
                assertTextContent(host, 'span', 'vor 2 Std.');
            }, { component: App });
        }
        {
            let App = (() => {
                let _classDecorators = [customElement({ name: 'app', template: `<span>\${ dt & rt }</span>` })];
                let _classDescriptor;
                let _classExtraInitializers = [];
                let _classThis;
                var App = _classThis = class {
                    constructor() {
                        this.dt = new Date();
                        this.dt.setHours(this.dt.getHours() - 2);
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
            $it('works for change of locale', async function ({ host, i18n, platform }) {
                await i18n.setLocale('de');
                platform.domQueue.flush();
                assertTextContent(host, 'span', 'vor 2 Stunden');
            }, { component: App });
        }
        {
            let App = (() => {
                let _classDecorators = [customElement({ name: 'app', template: `<span>\${ dt & rt }</span>` })];
                let _classDescriptor;
                let _classExtraInitializers = [];
                let _classThis;
                var App = _classThis = class {
                    constructor() {
                        this.dt = new Date();
                        this.dt.setHours(this.dt.getHours() - 2);
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
            $it('works for change of source value', function ({ host, platform, app }) {
                app.dt = new Date(app.dt.setHours(app.dt.getHours() - 3));
                platform.domQueue.flush();
                assertTextContent(host, 'span', '5 hours ago');
            }, { component: App });
        }
        it('updates formatted value if rt_signal', async function () {
            this.timeout(10000);
            const offset = 2000; // reduce the amount of time the test takes to run
            let App = (() => {
                let _classDecorators = [customElement({ name: 'app', template: `<span>\${ dt & rt }</span>` })];
                let _classDescriptor;
                let _classExtraInitializers = [];
                let _classThis;
                var App = _classThis = class {
                    constructor() {
                        this.dt = new Date(Date.now() - offset);
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
            await runTest(async function ({ host, platform, container }) {
                await platform.taskQueue.queueTask(delta => {
                    container.get(ISignaler).dispatchSignal(Signals.RT_SIGNAL);
                    platform.domQueue.flush();
                    assertTextContent(host, 'span', `${Math.round((delta + offset) / 1000)} seconds ago`);
                }, { delay: 1000 }).result;
            }, { component: App });
        });
    });
    describe('`skipTranslationOnMissingKey`', function () {
        {
            const key = 'lost-in-translation';
            let App = (() => {
                let _classDecorators = [customElement({ name: 'app', template: `<span t='${key}'></span>` })];
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
            $it('is disabled by default, and the given key is rendered if the key is missing from i18next resource', function ({ host }) {
                assertTextContent(host, 'span', key);
            }, { component: App });
        }
        {
            const key = 'lost-in-translation', text = 'untranslated text';
            let App = (() => {
                let _classDecorators = [customElement({ name: 'app', template: `<span t='${key}'>${text}</span>` })];
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
            $it('enables skipping translation when set', function ({ host }) {
                assertTextContent(host, 'span', text);
            }, { component: App, skipTranslationOnMissingKey: true });
        }
    });
    describe('works with au-slot', function () {
        {
            let App = (() => {
                let _classDecorators = [customElement({ name: 'app', template: `<foo-bar status="delivered" date="1971-12-25"></foo-bar>` })];
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
            $it('w/o projection', function ({ host }) {
                assertTextContent(host, 'span', 'delivered on 1971-12-25');
            }, { component: App });
        }
        {
            let App = (() => {
                let _classDecorators = [customElement({ name: 'app', template: `<foo-bar status="delivered" date="1971-12-25"><div au-slot t="status" t-params.bind="{context: status, date: date}"></div></foo-bar>` })];
                let _classDescriptor;
                let _classExtraInitializers = [];
                let _classThis;
                var App = _classThis = class {
                    constructor() {
                        this.status = 'dispatched';
                        this.date = '1972-12-26';
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
            $it('with projection', function ({ host }) {
                assertTextContent(host, 'div', 'dispatched on 1972-12-26');
            }, { component: App });
        }
        {
            let App = (() => {
                let _classDecorators = [customElement({ name: 'app', template: `<foo-bar status="delivered" date="1971-12-25"><div au-slot t="status" t-params.bind="{context: status, date: $host.date}"></div></foo-bar>` })];
                let _classDescriptor;
                let _classExtraInitializers = [];
                let _classThis;
                var App = _classThis = class {
                    constructor() {
                        this.status = 'dispatched';
                        this.date = '1972-12-26';
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
            $it('with projection - mixed', function ({ host }) {
                assertTextContent(host, 'div', 'dispatched on 1971-12-25');
            }, { component: App });
        }
        {
            let Ce1 = (() => {
                let _classDecorators = [customElement({ name: 'ce-1', template: '<au-slot></au-slot>' })];
                let _classDescriptor;
                let _classExtraInitializers = [];
                let _classThis;
                var Ce1 = _classThis = class {
                };
                __setFunctionName(_classThis, "Ce1");
                (() => {
                    const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
                    __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
                    Ce1 = _classThis = _classDescriptor.value;
                    if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
                    __runInitializers(_classThis, _classExtraInitializers);
                })();
                return Ce1 = _classThis;
            })();
            let Ce2 = (() => {
                let _classDecorators = [customElement({ name: 'ce-2', template: '${value}' })];
                let _classDescriptor;
                let _classExtraInitializers = [];
                let _classThis;
                let _value_decorators;
                let _value_initializers = [];
                let _value_extraInitializers = [];
                var Ce2 = _classThis = class {
                    constructor() {
                        this.value = __runInitializers(this, _value_initializers, void 0);
                        __runInitializers(this, _value_extraInitializers);
                    }
                };
                __setFunctionName(_classThis, "Ce2");
                (() => {
                    const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
                    _value_decorators = [bindable];
                    __esDecorate(null, null, _value_decorators, { kind: "field", name: "value", static: false, private: false, access: { has: obj => "value" in obj, get: obj => obj.value, set: (obj, value) => { obj.value = value; } }, metadata: _metadata }, _value_initializers, _value_extraInitializers);
                    __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
                    Ce2 = _classThis = _classDescriptor.value;
                    if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
                    __runInitializers(_classThis, _classExtraInitializers);
                })();
                return Ce2 = _classThis;
            })();
            let App = (() => {
                let _classDecorators = [customElement({
                        name: 'app',
                        template: `<ce-1 if.bind="show">
        <ce-2 au-slot value="foo" t="[value]projectedContent"></ce-2>
      </ce-1>`,
                        dependencies: [Ce1, Ce2]
                    })];
                let _classDescriptor;
                let _classExtraInitializers = [];
                let _classThis;
                var App = _classThis = class {
                    constructor() {
                        this.show = false;
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
            $it('with projection - if.bind on host', async function ({ host, app, platform: { domQueue }, i18n }) {
                assert.strictEqual(host.querySelector('ce-1'), null, 'ce-1 should not be rendered');
                app.show = true;
                domQueue.flush();
                assert.html.textContent(host, 'content', 'round #1');
                // change locale
                await i18n.setLocale('de');
                domQueue.flush();
                assert.html.textContent(host, 'Inhalt', 'round #2');
                // toggle visibility
                app.show = false;
                domQueue.flush();
                assert.strictEqual(host.querySelector('ce-1'), null, 'ce-1 should not be rendered');
                // toggle visibility
                app.show = true;
                domQueue.flush();
                assert.html.textContent(host, 'Inhalt', 'round #3');
                // change locale
                await i18n.setLocale('en');
                domQueue.flush();
                assert.html.textContent(host, 'content', 'round #4');
            }, { component: App });
        }
        {
            let Ce1 = (() => {
                let _classDecorators = [customElement({ name: 'ce-1', template: '<au-slot></au-slot>' })];
                let _classDescriptor;
                let _classExtraInitializers = [];
                let _classThis;
                var Ce1 = _classThis = class {
                };
                __setFunctionName(_classThis, "Ce1");
                (() => {
                    const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
                    __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
                    Ce1 = _classThis = _classDescriptor.value;
                    if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
                    __runInitializers(_classThis, _classExtraInitializers);
                })();
                return Ce1 = _classThis;
            })();
            let Ce2 = (() => {
                let _classDecorators = [customElement({ name: 'ce-2', template: '${value}' })];
                let _classDescriptor;
                let _classExtraInitializers = [];
                let _classThis;
                let _value_decorators;
                let _value_initializers = [];
                let _value_extraInitializers = [];
                var Ce2 = _classThis = class {
                    constructor() {
                        this.value = __runInitializers(this, _value_initializers, void 0);
                        __runInitializers(this, _value_extraInitializers);
                    }
                };
                __setFunctionName(_classThis, "Ce2");
                (() => {
                    const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
                    _value_decorators = [bindable];
                    __esDecorate(null, null, _value_decorators, { kind: "field", name: "value", static: false, private: false, access: { has: obj => "value" in obj, get: obj => obj.value, set: (obj, value) => { obj.value = value; } }, metadata: _metadata }, _value_initializers, _value_extraInitializers);
                    __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
                    Ce2 = _classThis = _classDescriptor.value;
                    if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
                    __runInitializers(_classThis, _classExtraInitializers);
                })();
                return Ce2 = _classThis;
            })();
            let App = (() => {
                let _classDecorators = [customElement({
                        name: 'app',
                        template: `<ce-1>
        <ce-2 au-slot if.bind="show" value="foo" t="[value]projectedContent"></ce-2>
      </ce-1>`,
                        dependencies: [Ce1, Ce2]
                    })];
                let _classDescriptor;
                let _classExtraInitializers = [];
                let _classThis;
                var App = _classThis = class {
                    constructor() {
                        this.show = false;
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
            $it('with projection - if.bind on content', async function ({ host, app, platform: { domQueue }, i18n }) {
                assert.strictEqual(host.querySelector('ce-2'), null, 'ce-2 should not be rendered');
                app.show = true;
                domQueue.flush();
                assert.html.textContent(host, 'content', 'round #1');
                // change locale
                await i18n.setLocale('de');
                domQueue.flush();
                assert.html.textContent(host, 'Inhalt', 'round #2');
                // toggle visibility
                app.show = false;
                domQueue.flush();
                assert.strictEqual(host.querySelector('ce-2'), null, 'ce-2 should not be rendered');
                // toggle visibility
                app.show = true;
                domQueue.flush();
                assert.html.textContent(host, 'Inhalt', 'round #3');
                // change locale
                await i18n.setLocale('en');
                domQueue.flush();
                assert.html.textContent(host, 'content', 'round #4');
            }, { component: App });
        }
        {
            let Ce1 = (() => {
                let _classDecorators = [customElement({ name: 'ce-1', template: '<au-slot></au-slot>' })];
                let _classDescriptor;
                let _classExtraInitializers = [];
                let _classThis;
                var Ce1 = _classThis = class {
                };
                __setFunctionName(_classThis, "Ce1");
                (() => {
                    const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
                    __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
                    Ce1 = _classThis = _classDescriptor.value;
                    if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
                    __runInitializers(_classThis, _classExtraInitializers);
                })();
                return Ce1 = _classThis;
            })();
            let Ce2 = (() => {
                let _classDecorators = [customElement({ name: 'ce-2', template: '${value}' })];
                let _classDescriptor;
                let _classExtraInitializers = [];
                let _classThis;
                let _value_decorators;
                let _value_initializers = [];
                let _value_extraInitializers = [];
                var Ce2 = _classThis = class {
                    constructor() {
                        this.value = __runInitializers(this, _value_initializers, void 0);
                        __runInitializers(this, _value_extraInitializers);
                    }
                };
                __setFunctionName(_classThis, "Ce2");
                (() => {
                    const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
                    _value_decorators = [bindable];
                    __esDecorate(null, null, _value_decorators, { kind: "field", name: "value", static: false, private: false, access: { has: obj => "value" in obj, get: obj => obj.value, set: (obj, value) => { obj.value = value; } }, metadata: _metadata }, _value_initializers, _value_extraInitializers);
                    __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
                    Ce2 = _classThis = _classDescriptor.value;
                    if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
                    __runInitializers(_classThis, _classExtraInitializers);
                })();
                return Ce2 = _classThis;
            })();
            let App = (() => {
                let _classDecorators = [customElement({
                        name: 'app',
                        template: `<ce-1 if.bind="show">
        <ce-2 au-slot value="foo" t="[value]firstandMore" t-params.bind="{firstItem, restCount}"></ce-2>
      </ce-1>`,
                        dependencies: [Ce1, Ce2]
                    })];
                let _classDescriptor;
                let _classExtraInitializers = [];
                let _classThis;
                var App = _classThis = class {
                    constructor() {
                        this.show = false;
                        this.restCount = 1;
                        this.firstItem = 'foo';
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
            $it('with projection - if.bind on host - changes in t-params', async function ({ host, app, platform: { domQueue }, i18n }) {
                assert.strictEqual(host.querySelector('ce-1'), null, 'ce-1 should not be rendered');
                app.show = true;
                domQueue.flush();
                assert.html.textContent(host, 'foo and 1 more', 'round #1');
                // change locale
                await i18n.setLocale('de');
                domQueue.flush();
                assert.html.textContent(host, 'foo und 1 mehr', 'round #2');
                // toggle visibility
                app.show = false;
                domQueue.flush();
                assert.strictEqual(host.querySelector('ce-1'), null, 'ce-1 should not be rendered');
                // toggle visibility
                app.firstItem = 'bar';
                app.restCount = 2;
                app.show = true;
                domQueue.flush();
                assert.html.textContent(host, 'bar und 2 mehr', 'round #3');
                // change locale
                await i18n.setLocale('en');
                domQueue.flush();
                assert.html.textContent(host, 'bar and 2 more', 'round #4');
            }, { component: App });
        }
        {
            let Ce1 = (() => {
                let _classDecorators = [customElement({ name: 'ce-1', template: '<au-slot></au-slot>' })];
                let _classDescriptor;
                let _classExtraInitializers = [];
                let _classThis;
                var Ce1 = _classThis = class {
                };
                __setFunctionName(_classThis, "Ce1");
                (() => {
                    const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
                    __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
                    Ce1 = _classThis = _classDescriptor.value;
                    if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
                    __runInitializers(_classThis, _classExtraInitializers);
                })();
                return Ce1 = _classThis;
            })();
            let Ce2 = (() => {
                let _classDecorators = [customElement({ name: 'ce-2', template: '${value}' })];
                let _classDescriptor;
                let _classExtraInitializers = [];
                let _classThis;
                let _value_decorators;
                let _value_initializers = [];
                let _value_extraInitializers = [];
                var Ce2 = _classThis = class {
                    constructor() {
                        this.value = __runInitializers(this, _value_initializers, void 0);
                        __runInitializers(this, _value_extraInitializers);
                    }
                };
                __setFunctionName(_classThis, "Ce2");
                (() => {
                    const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
                    _value_decorators = [bindable];
                    __esDecorate(null, null, _value_decorators, { kind: "field", name: "value", static: false, private: false, access: { has: obj => "value" in obj, get: obj => obj.value, set: (obj, value) => { obj.value = value; } }, metadata: _metadata }, _value_initializers, _value_extraInitializers);
                    __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
                    Ce2 = _classThis = _classDescriptor.value;
                    if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
                    __runInitializers(_classThis, _classExtraInitializers);
                })();
                return Ce2 = _classThis;
            })();
            let App = (() => {
                let _classDecorators = [customElement({
                        name: 'app',
                        template: `<ce-1>
        <ce-2 au-slot if.bind="show" value="foo" t="[value]firstandMore" t-params.bind="{firstItem, restCount}"></ce-2>
      </ce-1>`,
                        dependencies: [Ce1, Ce2]
                    })];
                let _classDescriptor;
                let _classExtraInitializers = [];
                let _classThis;
                var App = _classThis = class {
                    constructor() {
                        this.show = false;
                        this.restCount = 1;
                        this.firstItem = 'foo';
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
            $it('with projection - if.bind on content - changes in t-params', async function ({ host, app, platform: { domQueue }, i18n }) {
                assert.strictEqual(host.querySelector('ce-2'), null, 'ce-2 should not be rendered');
                app.show = true;
                domQueue.flush();
                assert.html.textContent(host, 'foo and 1 more', 'round #1');
                // change locale
                await i18n.setLocale('de');
                domQueue.flush();
                assert.html.textContent(host, 'foo und 1 mehr', 'round #2');
                // toggle visibility
                app.show = false;
                domQueue.flush();
                assert.strictEqual(host.querySelector('ce-2'), null, 'ce-2 should not be rendered');
                // toggle visibility
                app.firstItem = 'bar';
                app.restCount = 2;
                app.show = true;
                domQueue.flush();
                assert.html.textContent(host, 'bar und 2 mehr', 'round #3');
                // change locale
                await i18n.setLocale('en');
                domQueue.flush();
                assert.html.textContent(host, 'bar and 2 more', 'round #4');
            }, { component: App });
        }
    });
    // This test doubles down as the containerization of the attribute patterns; that is not global registry of patterns other than the container.
    it('different aliases can be used for different apps', async function () {
        let AppOne = (() => {
            let _classDecorators = [customElement({ name: 'app-one', template: `<span t="\${key11}"></span><span t.bind="key12"></span>` })];
            let _classDescriptor;
            let _classExtraInitializers = [];
            let _classThis;
            var AppOne = _classThis = class {
                constructor() {
                    this.key11 = 'key11';
                    this.key12 = 'key12';
                }
            };
            __setFunctionName(_classThis, "AppOne");
            (() => {
                const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
                __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
                AppOne = _classThis = _classDescriptor.value;
                if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
                __runInitializers(_classThis, _classExtraInitializers);
            })();
            return AppOne = _classThis;
        })();
        let AppTwo = (() => {
            let _classDecorators = [customElement({ name: 'app-two', template: `<span i18n="\${key21}"></span><span i18n.bind="key22"></span>` })];
            let _classDescriptor;
            let _classExtraInitializers = [];
            let _classThis;
            var AppTwo = _classThis = class {
                constructor() {
                    this.key21 = 'key21';
                    this.key22 = 'key22';
                }
            };
            __setFunctionName(_classThis, "AppTwo");
            (() => {
                const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
                __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
                AppTwo = _classThis = _classDescriptor.value;
                if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
                __runInitializers(_classThis, _classExtraInitializers);
            })();
            return AppTwo = _classThis;
        })();
        const translation = {
            key11: 'a',
            key12: 'b',
            key21: 'c',
            key22: 'd',
            key13: 'e',
            key14: 'f',
            key23: 'g',
            key24: 'h',
        };
        const i18nInitOptions = {
            fallbackLng: 'en',
            fallbackNS: 'translation',
            resources: { en: { translation } },
        };
        let checkPoint1 = false;
        let checkPoint2 = false;
        async function createAppOne() {
            const ctx = TestContext.create();
            const host = PLATFORM.document.createElement('app-one');
            const au = new Aurelia(ctx.container);
            au.register(I18nConfiguration.customize((opt) => {
                opt.translationAttributeAliases = ['t'];
                opt.initOptions = i18nInitOptions;
            }));
            checkPoint1 = true;
            while (!checkPoint2) {
                await new Promise((res) => setTimeout(res, 1));
            }
            au.app({ host, component: AppOne });
            await au.start();
            return { au, host, vm: au.root.controller.viewModel, queue: ctx.platform.domQueue };
        }
        async function createAppTwo() {
            while (!checkPoint1) {
                await new Promise((res) => setTimeout(res, 1));
            }
            const ctx = TestContext.create();
            const host = PLATFORM.document.createElement('app-two');
            const au = new Aurelia(ctx.container);
            au.register(I18nConfiguration.customize((opt) => {
                opt.translationAttributeAliases = ['i18n'];
                opt.initOptions = i18nInitOptions;
            }));
            checkPoint2 = true;
            au.app({ host, component: AppTwo });
            await au.start();
            return { au, host, vm: au.root.controller.viewModel, queue: ctx.platform.domQueue };
        }
        const [{ au: au1, host: host1, vm: appOne, queue: q1 }, { au: au2, host: host2, vm: appTwo, queue: q2 },] = await Promise.all([createAppOne(), createAppTwo()]);
        assert.html.textContent(host1, 'ab');
        assert.html.textContent(host2, 'cd');
        appOne.key11 = 'key13';
        appOne.key12 = 'key14';
        q1.flush();
        appTwo.key21 = 'key23';
        appTwo.key22 = 'key24';
        q2.flush();
        assert.html.textContent(host1, 'ef');
        assert.html.textContent(host2, 'gh');
        await Promise.all([au1.stop(), au2.stop()]);
    });
});
//# sourceMappingURL=translation-integration.spec.js.map