import { I18nConfiguration, TranslationAttributePattern, TranslationBinding, TranslationBindingCommand, TranslationBindingInstruction, TranslationBindingRenderer, TranslationInstructionType } from '@aurelia/i18n';
import { AttributePatternDefinition, AttrSyntax, BindingCommandResource, IAttributePattern, PlainAttributeSymbol } from '@aurelia/jit';
import { AttrBindingCommand } from '@aurelia/jit-html';
import { DI } from '@aurelia/kernel';
import { AnyBindingExpression, BindingType, IController, IExpressionParser, IInstructionRenderer, IObserverLocator, IRenderContext, ITargetedInstruction, LifecycleFlags, RuntimeBasicConfiguration } from '@aurelia/runtime';
import { DOM } from '@aurelia/runtime-html';
import { assert } from '@aurelia/testing';

describe.only('TranslationAttributePattern', function () {
  let originalAliases: string[];
  afterEach(function () {
    TranslationAttributePattern.aliases = originalAliases;
  });
  function setup(aliases?: any[]) {
    aliases = aliases || TranslationAttributePattern.aliases;
    [originalAliases, TranslationAttributePattern.aliases] = [TranslationAttributePattern.aliases, aliases];
    const container = DI.createContainer();
    TranslationAttributePattern.register(container);
    return container.get(IAttributePattern);
  }

  it('registers the `t` attr. pattern by default', function () {
    const sut = setup();
    const pattern = 't';

    assert.instanceOf(sut, TranslationAttributePattern);
    assert.deepEqual(TranslationAttributePattern.prototype.$patternDefs, [
      { pattern: pattern, symbols: '' },
    ] as AttributePatternDefinition[]);

    assert.equal(typeof sut[pattern], 'function');
  });

  it('registers alias attribute patterns when provided', function () {
    const aliases = ['t', 'i18n'];
    const sut = setup(aliases);

    assert.instanceOf(sut, TranslationAttributePattern);
    assert.deepEqual(
      TranslationAttributePattern.prototype.$patternDefs,
      aliases.reduce(
        (acc, alias) => {
          acc.push({ pattern: alias, symbols: '' });
          return acc;
        },
        []));

    aliases.forEach((alias) => {
      assert.equal(typeof sut[alias], 'function');
    });
  });

  it('creates attribute syntax without `to` part when `T="expr"` is used', function () {
    const sut = setup();
    const pattern = 't';
    const value = 'simple.key';

    const actual: AttrSyntax = sut[pattern](pattern, value, []);
    assert.equal(actual.command, pattern);
    assert.equal(actual.rawName, pattern);
    assert.equal(actual.rawValue, value);
    assert.equal(actual.target, '');
  });

  // it('creates attribute syntax with `to` part when `T.bind="expr"` is used', function () {
  //   const sut = setup();
  //   const pattern = 't';
  //   const value = 'simple.key';

  //   const actual: AttrSyntax = sut[pattern](pattern, value, ['t', 'bind']);
  //   assert.equal(actual.command, pattern);
  //   assert.equal(actual.rawName, pattern);
  //   assert.equal(actual.rawValue, value);
  //   assert.equal(actual.target, 'bind');
  // });
});

describe.only('TranslationBindingCommand', function () {
  let originalAliases: string[];
  afterEach(function () {
    TranslationBindingCommand.aliases = originalAliases;
  });
  function setup(aliases?: string[]) {
    aliases = aliases || TranslationBindingCommand.aliases;
    [originalAliases, TranslationBindingCommand.aliases] = [TranslationBindingCommand.aliases, aliases];
    const container = DI.createContainer();
    TranslationBindingCommand.register(container);
    return aliases.reduce(
      (acc: TranslationBindingCommand[], alias) => {
        acc.push(
          container.get<TranslationBindingCommand>(BindingCommandResource.keyFrom(alias)),
        );
        return acc;
      },
      []);
  }

  it('registers the `t` command by default', function () {
    const suts = setup();

    assert.equal(suts.length, 1);
    assert.equal(
      suts.every((sut) => sut instanceof TranslationBindingCommand),
      true);
  });

  it('registers alias commands when provided', function () {
    const aliases = ['t', 'i18n'];
    const suts = setup(aliases);

    assert.equal(suts.length, aliases.length);
    assert.equal(
      suts.every((sut) => sut instanceof TranslationBindingCommand),
      true);
  });

  it('compiles the binding to a TranslationBindingInstruction', function () {
    const sut = setup()[0];
    const syntax: AttrSyntax = { command: 't', rawName: 't', rawValue: 'obj.key', target: '' };

    // tslint:disable: no-object-literal-type-assertion
    const actual = sut.compile({
      command: new AttrBindingCommand(),
      flags: (void 0)!,
      expression: { syntax } as unknown as AnyBindingExpression,
      syntax
    } as PlainAttributeSymbol);
    // tslint:enable: no-object-literal-type-assertion

    assert.instanceOf(actual, TranslationBindingInstruction);
  });
});

describe.only('TranslationBindingRenderer', function () {

  function setup() {
    const container = DI.createContainer();
    container.register(RuntimeBasicConfiguration, I18nConfiguration);
    return container;
  }

  it('instantiated with instruction type', function () {
    const container = setup();
    const sut: IInstructionRenderer = new TranslationBindingRenderer(container.get(IExpressionParser), {} as unknown as IObserverLocator);
    assert.equal(sut.instructionType, TranslationInstructionType);
  });

  it('#render instantiates TranslationBinding - simple string literal', function () {
    const container = setup();
    const sut: IInstructionRenderer = new TranslationBindingRenderer(container.get(IExpressionParser), {} as unknown as IObserverLocator);
    const expressionParser = container.get(IExpressionParser);
    const renderable = ({} as unknown as IController);

    sut.render(
      LifecycleFlags.none,
      DOM,
      container as unknown as IRenderContext,
      renderable,
      DOM.createElement('span'),
      { from: expressionParser.parse('simple.key', BindingType.BindCommand) } as unknown as ITargetedInstruction);

    assert.instanceOf(renderable.bindings[0], TranslationBinding);
  });

  it('#render instantiates TranslationBinding - .bind expr', function () {
    const container = setup();
    const sut: IInstructionRenderer = new TranslationBindingRenderer(container.get(IExpressionParser), {} as unknown as IObserverLocator);
    const expressionParser = container.get(IExpressionParser);
    const renderable = ({} as unknown as IController);

    sut.render(
      LifecycleFlags.none,
      DOM,
      container as unknown as IRenderContext,
      renderable,
      DOM.createElement('span'),
      {
        from: expressionParser.parse('simple.key', BindingType.BindCommand),
        to: '.bind'
      } as unknown as ITargetedInstruction);

    assert.instanceOf(renderable.bindings[0], TranslationBinding);
  });

  it('#render adds expr to the existing TranslationBinding for the target element', function () {
    const container = setup();
    const sut: IInstructionRenderer = new TranslationBindingRenderer(container.get(IExpressionParser), {} as unknown as IObserverLocator);
    const expressionParser = container.get(IExpressionParser);
    const targetElement = DOM.createElement('span');
    const binding = new TranslationBinding(targetElement, '', {} as unknown as IObserverLocator, container);
    const renderable = ({ bindings: [binding] } as unknown as IController);

    const expr = expressionParser.parse('simple.key', BindingType.BindCommand);
    sut.render(
      LifecycleFlags.none,
      DOM,
      container as unknown as IRenderContext,
      renderable,
      targetElement,
      {
        from: expr,
        to: '.bind'
      } as unknown as ITargetedInstruction);

    assert.equal(binding.expr, expr);
  });
});
