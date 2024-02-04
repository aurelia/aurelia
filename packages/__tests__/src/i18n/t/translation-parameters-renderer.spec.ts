import { I18nConfiguration, TranslationBinding, TranslationParametersAttributePattern, TranslationParametersBindingCommand, TranslationParametersBindingInstruction, TranslationParametersBindingRenderer, TranslationParametersInstructionType } from '@aurelia/i18n';
import { DI } from '@aurelia/kernel';
import {
  IExpressionParser,
  IObserverLocator,
  IBinding,
} from '@aurelia/runtime';
import {
  IRenderer,
  StandardConfiguration,
  IHydratableController,
  AttrSyntax,
  BindingCommand,
  BindingCommandInstance,
  IAttributePattern,
  IPlatform,
  IAttrMapper,
  PropertyBindingInstruction,
  InstructionType,
  BindingMode,
} from '@aurelia/runtime-html';
import { assert, PLATFORM, TestContext } from '@aurelia/testing';

const noopLocator = {} as unknown as IObserverLocator;

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

      const actual: AttrSyntax = sut[pattern](pattern, value, []);
      assert.equal(actual.command, pattern);
      assert.equal(actual.rawName, pattern);
      assert.equal(actual.rawValue, value);
      assert.equal(actual.target, '');
    });
  });

  describe('TranslationParametersBindingCommand', function () {
    function createFixture() {
      const container = DI.createContainer();
      container.register(TranslationParametersBindingCommand);
      return {
        sut: container.get<BindingCommandInstance>(BindingCommand.keyFrom(`t-params.bind`)),
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
      const syntax: AttrSyntax = { command: 't-params.bind', rawName: 't-params.bind', rawValue: '{foo: "bar"}', target: '', parts: null };
      const actual = sut.build({
        node: { nodeName: 'abc' } as unknown as Element,
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
      container.register(StandardConfiguration, I18nConfiguration);
      return container;
    }

    it('instantiated with instruction type', function () {
      const sut: IRenderer = new TranslationParametersBindingRenderer();
      assert.equal(sut.target, TranslationParametersInstructionType);
    });

    it('#render instantiates TranslationBinding if there are none existing', function () {
      const container = createFixture();
      const sut: IRenderer = new TranslationParametersBindingRenderer();
      const expressionParser = container.get(IExpressionParser);
      const controller = ({ container, bindings: [], addBinding(binding) { (controller.bindings as unknown as IBinding[]).push(binding); } } as unknown as IHydratableController);
      const callBindingInstruction: PropertyBindingInstruction = {
        type: InstructionType.propertyBinding,
        from: expressionParser.parse('{foo: "bar"}', 'IsProperty'),
        to: 'value',
        mode: BindingMode.oneTime
      };

      sut.render(
        controller,
        PLATFORM.document.createElement('span'),
        callBindingInstruction,
        PLATFORM,
        expressionParser,
        noopLocator
      );

      assert.instanceOf(controller.bindings[0], TranslationBinding);
    });

    it('#render add the paramExpr to the existing TranslationBinding for the target element', function () {
      const container = createFixture();
      const sut: IRenderer = new TranslationParametersBindingRenderer();
      const expressionParser = container.get(IExpressionParser);
      const targetElement = PLATFORM.document.createElement('span');
      const binding = new TranslationBinding({ state: 0 }, container, container.get(IObserverLocator), container.get(IPlatform), targetElement);
      const hydratable = ({ container, bindings: [binding] } as unknown as IHydratableController);
      const paramExpr = expressionParser.parse('{foo: "bar"}', 'IsProperty');
      const callBindingInstruction: PropertyBindingInstruction = {
        type: InstructionType.propertyBinding,
        from: expressionParser.parse('{foo: "bar"}', 'IsProperty'),
        to: 'value',
        mode: BindingMode.oneTime
      };

      sut.render(
        hydratable,
        targetElement,
        callBindingInstruction,
        PLATFORM,
        expressionParser,
        noopLocator
      );

      assert.equal(binding['parameter'].ast, paramExpr);
    });
  });
});
