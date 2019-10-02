import { I18nConfiguration, TranslationBinding, TranslationParametersAttributePattern, TranslationParametersBindingCommand, TranslationParametersBindingInstruction, TranslationParametersBindingRenderer, TranslationParametersInstructionType } from '@aurelia/i18n';
import { AttributePatternDefinition, AttrSyntax, BindingCommandResource, IAttributePattern, IBindingCommand, PlainAttributeSymbol } from '@aurelia/jit';
import { AttrBindingCommand } from '@aurelia/jit-html';
import { DI } from '@aurelia/kernel';
import { AnyBindingExpression, BindingType, IController, IExpressionParser, IInstructionRenderer, IObserverLocator, IRenderContext, LifecycleFlags, RuntimeConfiguration, ICallBindingInstruction } from '@aurelia/runtime';
import { DOM } from '@aurelia/runtime-html';
import { assert, TestContext } from '@aurelia/testing';

describe('TranslationParametersAttributePattern', function () {
  function setup() {
    const container = DI.createContainer();
    container.register(TranslationParametersAttributePattern);
    return container.get(IAttributePattern);
  }

  it('registers the `t-params.bind` attr. pattern', function () {
    const sut = setup();
    const pattern = 't-params.bind';

    assert.instanceOf(sut, TranslationParametersAttributePattern);
    assert.deepEqual(
      (TranslationParametersAttributePattern.prototype as unknown as IAttributePattern).$patternDefs,
      [{ pattern, symbols: '' }] as AttributePatternDefinition[]);

    assert.typeOf(sut[pattern], 'function');
  });

  it('creates attribute syntax without `to`', function () {
    const sut = setup();
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
  function setup() {
    const container = DI.createContainer();
    container.register(TranslationParametersBindingCommand);
    return container.get<IBindingCommand>(BindingCommandResource.keyFrom(`t-params.bind`));
  }

  it('registers the `t-params.bind` command', function () {
    const sut = setup();
    assert.instanceOf(sut, TranslationParametersBindingCommand);
  });

  it('compiles the binding to a TranslationParametersBindingInstruction', function () {
    const sut = setup();
    const syntax: AttrSyntax = { command: 't-params.bind', rawName: 't-params.bind', rawValue: '{foo: "bar"}', target: '' };

    const actual = sut.compile(
      {
        command: new AttrBindingCommand(),
        flags: (void 0)!,
        expression: { syntax } as unknown as AnyBindingExpression,
        syntax
      } as PlainAttributeSymbol
    );

    assert.instanceOf(actual, TranslationParametersBindingInstruction);
  });
});

describe('TranslationParametersBindingRenderer', function () {

  function setup() {
    const { container } = TestContext.createHTMLTestContext();
    container.register(RuntimeConfiguration, I18nConfiguration);
    return container as unknown as IRenderContext;
  }

  it('instantiated with instruction type', function () {
    const container = setup();
    const sut: IInstructionRenderer = new TranslationParametersBindingRenderer(container.get(IExpressionParser), container.get(IObserverLocator));
    assert.equal(sut.instructionType, TranslationParametersInstructionType);
  });

  it('#render instantiates TranslationBinding if there are none existing', function () {
    const container = setup();
    const sut: IInstructionRenderer = new TranslationParametersBindingRenderer(container.get(IExpressionParser), container.get(IObserverLocator));
    const expressionParser = container.get(IExpressionParser);
    const renderable = ({} as unknown as IController);

    sut.render(
      LifecycleFlags.none,
      DOM,
      container,
      renderable,
      DOM.createElement('span'),
      { from: expressionParser.parse('{foo: "bar"}', BindingType.BindCommand) } as ICallBindingInstruction
    );

    assert.instanceOf(renderable.bindings[0], TranslationBinding);
  });

  it('#render add the paramExpr to the existing TranslationBinding for the target element', function () {
    const container = setup();
    const sut: IInstructionRenderer = new TranslationParametersBindingRenderer(container.get(IExpressionParser), container.get(IObserverLocator));
    const expressionParser = container.get(IExpressionParser);
    const targetElement = DOM.createElement('span');
    const binding = new TranslationBinding(targetElement, container.get(IObserverLocator), container);
    const renderable = ({ bindings: [binding] } as unknown as IController);
    const paramExpr = expressionParser.parse('{foo: "bar"}', BindingType.BindCommand);

    sut.render(
      LifecycleFlags.none,
      DOM,
      container,
      renderable,
      targetElement,
      { from: paramExpr } as ICallBindingInstruction
    );

    assert.equal(binding.parametersExpr, paramExpr);
  });
});
