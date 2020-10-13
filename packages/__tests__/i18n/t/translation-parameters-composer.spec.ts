import { I18nConfiguration, TranslationBinding, TranslationParametersAttributePattern, TranslationParametersBindingCommand, TranslationParametersBindingInstruction, TranslationParametersBindingComposer, TranslationParametersInstructionType } from '@aurelia/i18n';
import { DI } from '@aurelia/kernel';
import {
  AnyBindingExpression,
  BindingType,
  ICallBindingInstruction,
  IExpressionParser,
  IInstructionComposer,
  IObserverLocator,
  LifecycleFlags,
  RuntimeConfiguration,
  ICompiledRenderContext,
  IRenderableController,
  IBinding,
  AttrSyntax,
  BindingCommand,
  BindingCommandInstance,
  IAttributePattern,
  PlainAttributeSymbol,
} from '@aurelia/runtime';
import { AttrBindingCommand, DOM } from '@aurelia/runtime-html';
import { assert, TestContext } from '@aurelia/testing';

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
    return container.get<BindingCommandInstance>(BindingCommand.keyFrom(`t-params.bind`));
  }

  it('registers the `t-params.bind` command', function () {
    const sut = createFixture();
    assert.instanceOf(sut, TranslationParametersBindingCommand);
  });

  it('compiles the binding to a TranslationParametersBindingInstruction', function () {
    const sut = createFixture();
    const syntax: AttrSyntax = { command: 't-params.bind', rawName: 't-params.bind', rawValue: '{foo: "bar"}', target: '' };
    const plainAttributesymbol: PlainAttributeSymbol = {
      command: new AttrBindingCommand(),
      flags: (void 0)!,
      expression: { syntax } as unknown as AnyBindingExpression,
      syntax
    };

    const actual = sut.compile(plainAttributesymbol);

    assert.instanceOf(actual, TranslationParametersBindingInstruction);
  });
});

describe('TranslationParametersBindingComposer', function () {

  function createFixture() {
    const { container } = TestContext.createHTMLTestContext();
    container.register(RuntimeConfiguration, I18nConfiguration);
    return container;
  }

  it('instantiated with instruction type', function () {
    const container = createFixture();
    const sut: IInstructionComposer = new TranslationParametersBindingComposer(container.get(IExpressionParser), container.get(IObserverLocator));
    assert.equal(sut.instructionType, TranslationParametersInstructionType);
  });

  it('#render instantiates TranslationBinding if there are none existing', function () {
    const container = createFixture();
    const sut: IInstructionComposer = new TranslationParametersBindingComposer(container.get(IExpressionParser), container.get(IObserverLocator));
    const expressionParser = container.get(IExpressionParser);
    const controller = ({ bindings: [], addBinding(binding) { (controller.bindings as unknown as IBinding[]).push(binding); }} as unknown as IRenderableController);
    const callBindingInstruction: ICallBindingInstruction = { from: expressionParser.parse('{foo: "bar"}', BindingType.BindCommand) } as unknown as ICallBindingInstruction;

    sut.render(
      LifecycleFlags.none,
      container as unknown as ICompiledRenderContext,
      controller,
      DOM.createElement('span'),
      callBindingInstruction,
    );

    assert.instanceOf(controller.bindings[0], TranslationBinding);
  });

  it('#render add the paramExpr to the existing TranslationBinding for the target element', function () {
    const container = createFixture();
    const sut: IInstructionComposer = new TranslationParametersBindingComposer(container.get(IExpressionParser), container.get(IObserverLocator));
    const expressionParser = container.get(IExpressionParser);
    const targetElement = DOM.createElement('span');
    const binding = new TranslationBinding(targetElement, container.get(IObserverLocator), container);
    const renderable = ({ bindings: [binding] } as unknown as IRenderableController);
    const paramExpr = expressionParser.parse('{foo: "bar"}', BindingType.BindCommand);
    const callBindingInstruction: ICallBindingInstruction = { from: paramExpr } as unknown as ICallBindingInstruction;

    sut.render(
      LifecycleFlags.none,
      container as unknown as ICompiledRenderContext,
      renderable,
      targetElement,
      callBindingInstruction,
    );

    assert.equal(binding.parametersExpr, paramExpr);
  });
});
