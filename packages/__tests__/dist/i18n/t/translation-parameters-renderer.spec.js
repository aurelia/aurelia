import { I18nConfiguration, TranslationBinding, TranslationParametersAttributePattern, TranslationParametersBindingCommand, TranslationParametersBindingInstruction, TranslationParametersBindingRenderer, TranslationParametersInstructionType } from '@aurelia/i18n';
import { DI, Registration } from '@aurelia/kernel';
import { ExpressionParser, IExpressionParser } from '@aurelia/expression-parser';
import { IObserverLocator, } from '@aurelia/runtime';
import { IPlatform, BindingMode, AttrMapper, } from '@aurelia/runtime-html';
import { BindingCommand, IAttributePattern, IAttrMapper, InstructionType, } from '@aurelia/template-compiler';
import { assert, PLATFORM, TestContext } from '@aurelia/testing';
const noopLocator = {};
describe('i18n/t/translation-parameters-renderer.spec.ts', function () {
    describe('TranslationParametersAttributePattern', function () {
        function createFixture() {
            const container = DI.createContainer();
            container.register(TranslationParametersAttributePattern);
            return container.get(IAttributePattern);
        }
        it('creates attribute syntax without `to`', function () {
            const sut = createFixture();
            const pattern = 't-params.bind';
            const value = '{foo: "bar"}';
            const actual = sut[pattern](pattern, value, []);
            assert.equal(actual.command, pattern);
            assert.equal(actual.rawName, pattern);
            assert.equal(actual.rawValue, value);
            assert.equal(actual.target, '');
        });
    });
    describe('TranslationParametersBindingCommand', function () {
        function createFixture() {
            const container = DI.createContainer();
            container.register(ExpressionParser, TranslationParametersBindingCommand, Registration.singleton(IAttrMapper, AttrMapper));
            return {
                sut: container.get(BindingCommand.keyFrom(`t-params.bind`)),
                parser: container.get(IExpressionParser),
                mapper: container.get(IAttrMapper),
            };
        }
        it('registers the `t-params.bind` command', function () {
            const { sut } = createFixture();
            assert.instanceOf(sut, TranslationParametersBindingCommand);
        });
        it('compiles the binding to a TranslationParametersBindingInstruction', function () {
            const { sut, parser, mapper } = createFixture();
            const syntax = { command: 't-params.bind', rawName: 't-params.bind', rawValue: '{foo: "bar"}', target: '', parts: null };
            const actual = sut.build({
                node: { nodeName: 'abc' },
                attr: syntax,
                bindable: null,
                def: null,
            }, parser, mapper);
            assert.instanceOf(actual, TranslationParametersBindingInstruction);
        });
    });
    describe('TranslationParametersBindingRenderer', function () {
        function createFixture() {
            const { container } = TestContext.create();
            container.register(ExpressionParser, I18nConfiguration);
            return container;
        }
        it('instantiated with instruction type', function () {
            const sut = new TranslationParametersBindingRenderer();
            assert.equal(sut.target, TranslationParametersInstructionType);
        });
        it('#render instantiates TranslationBinding if there are none existing', function () {
            const container = createFixture();
            const sut = new TranslationParametersBindingRenderer();
            const expressionParser = container.get(IExpressionParser);
            const controller = { container, bindings: [], addBinding(binding) { controller.bindings.push(binding); } };
            const callBindingInstruction = {
                type: InstructionType.propertyBinding,
                from: expressionParser.parse('{foo: "bar"}', 'IsProperty'),
                to: 'value',
                mode: BindingMode.oneTime
            };
            sut.render(controller, PLATFORM.document.createElement('span'), callBindingInstruction, PLATFORM, expressionParser, noopLocator);
            assert.instanceOf(controller.bindings[0], TranslationBinding);
        });
        it('#render add the paramExpr to the existing TranslationBinding for the target element', function () {
            const container = createFixture();
            const sut = new TranslationParametersBindingRenderer();
            const expressionParser = container.get(IExpressionParser);
            const targetElement = PLATFORM.document.createElement('span');
            const binding = new TranslationBinding({ state: 0 }, container, container.get(IObserverLocator), container.get(IPlatform), targetElement);
            const hydratable = { container, bindings: [binding] };
            const paramExpr = expressionParser.parse('{foo: "bar"}', 'IsProperty');
            const callBindingInstruction = {
                type: InstructionType.propertyBinding,
                from: expressionParser.parse('{foo: "bar"}', 'IsProperty'),
                to: 'value',
                mode: BindingMode.oneTime
            };
            sut.render(hydratable, targetElement, callBindingInstruction, PLATFORM, expressionParser, noopLocator);
            assert.equal(binding['parameter'].ast, paramExpr);
        });
    });
});
//# sourceMappingURL=translation-parameters-renderer.spec.js.map