import { I18nConfiguration, TranslationAttributePattern, TranslationBindAttributePattern, TranslationBindBindingCommand, TranslationBindBindingInstruction, TranslationBindBindingRenderer, TranslationBinding, TranslationBindingCommand, TranslationBindingInstruction, TranslationBindingRenderer, TranslationBindInstructionType, TranslationInstructionType } from '@aurelia/i18n';
import { AttributePatternDefinition, AttrSyntax, BindingCommand, IAttributePattern, PlainAttributeSymbol } from '@aurelia/jit';
import { AttrBindingCommand } from '@aurelia/jit-html';
import { DI } from '@aurelia/kernel';
import { AnyBindingExpression, BindingType, ICallBindingInstruction, IController, IExpressionParser, IInstructionRenderer, IObserverLocator, IRenderContext, LifecycleFlags, RuntimeConfiguration } from '@aurelia/runtime';
import { DOM } from '@aurelia/runtime-html';
import { assert } from '@aurelia/testing';

describe('TranslationAttributePattern', function () {
  let originalAliases: string[];
  // eslint-disable-next-line mocha/no-hooks
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

    assert.typeOf(sut[pattern], 'function');
  });

  it('registers alias attribute patterns when provided', function () {
    const aliases = ['t', 'i18n'];
    const sut = setup(aliases);

    assert.instanceOf(sut, TranslationAttributePattern);

    const patternDefs = [];
    for (const alias of aliases) {
      assert.typeOf(sut[alias], 'function');
      patternDefs.push({ pattern: alias, symbols: '' });
    }

    assert.deepEqual(TranslationAttributePattern.prototype.$patternDefs, patternDefs);
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
});

describe('TranslationBindingCommand', function () {
  let originalAliases: string[];
  // eslint-disable-next-line mocha/no-hooks
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
          container.get<TranslationBindingCommand>(BindingCommand.keyFrom(alias)),
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
    const [sut] = setup();
    const syntax: AttrSyntax = { command: 't', rawName: 't', rawValue: 'obj.key', target: '' };
    const plainAttributeSymbol: PlainAttributeSymbol = {
      command: new AttrBindingCommand(),
      flags: (void 0)!,
      expression: { syntax } as unknown as AnyBindingExpression,
      syntax
    };

    const actual = sut.compile(plainAttributeSymbol);

    assert.instanceOf(actual, TranslationBindingInstruction);
  });
});

describe('TranslationBindingRenderer', function () {

  function setup() {
    const container = DI.createContainer();
    container.register(RuntimeConfiguration, I18nConfiguration);
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

    const from = expressionParser.parse('simple.key', BindingType.CustomCommand);
    const callBindingInstruction: ICallBindingInstruction = { from } as unknown as ICallBindingInstruction;
    sut.render(
      LifecycleFlags.none,
      DOM,
      container as unknown as IRenderContext,
      renderable,
      DOM.createElement('span'),
      callBindingInstruction);

    assert.instanceOf(renderable.bindings[0], TranslationBinding);
  });

  it('#render adds expr to the existing TranslationBinding for the target element', function () {
    const container = setup();
    const sut: IInstructionRenderer = new TranslationBindingRenderer(container.get(IExpressionParser), {} as unknown as IObserverLocator);
    const expressionParser = container.get(IExpressionParser);
    const targetElement = DOM.createElement('span');
    const binding = new TranslationBinding(targetElement, {} as unknown as IObserverLocator, container);
    const renderable = ({ bindings: [binding] } as unknown as IController);

    const from = expressionParser.parse('simple.key', BindingType.CustomCommand);
    const callBindingInstruction: ICallBindingInstruction = { from } as unknown as ICallBindingInstruction;
    sut.render(
      LifecycleFlags.none,
      DOM,
      container as unknown as IRenderContext,
      renderable,
      targetElement,
      callBindingInstruction);

    assert.equal(binding.expr, from);
  });
});

describe('TranslationBindAttributePattern', function () {
  let originalAliases: string[];
  // eslint-disable-next-line mocha/no-hooks
  afterEach(function () {
    TranslationBindAttributePattern.aliases = originalAliases;
  });
  function setup(aliases?: any[]) {
    aliases = aliases || TranslationBindAttributePattern.aliases;
    [originalAliases, TranslationBindAttributePattern.aliases] = [TranslationBindAttributePattern.aliases, aliases];
    const container = DI.createContainer();
    TranslationBindAttributePattern.register(container);
    return container.get(IAttributePattern);
  }

  it('registers the `t.bind` attr. pattern by default', function () {
    const sut = setup();
    const pattern = 't.bind';

    assert.instanceOf(sut, TranslationBindAttributePattern);
    assert.deepEqual(TranslationBindAttributePattern.prototype.$patternDefs, [
      { pattern: pattern, symbols: '.' },
    ] as AttributePatternDefinition[]);

    assert.typeOf(sut[pattern], 'function');
  });

  it('registers alias attribute patterns when provided', function () {
    const aliases = ['t', 'i18n'];
    const sut = setup(aliases);

    assert.instanceOf(sut, TranslationBindAttributePattern);
    assert.deepEqual(
      TranslationBindAttributePattern.prototype.$patternDefs,
      aliases.reduce(
        (acc, alias) => {
          acc.push({ pattern: `${alias}.bind`, symbols: '.' });
          return acc;
        },
        []));

    aliases.forEach((alias) => {
      assert.typeOf(sut[`${alias}.bind`], 'function');
    });
  });

  it('creates attribute syntax with `to` part when `T.bind="expr"` is used', function () {
    const sut = setup();
    const pattern = 't.bind';
    const value = 'simple.key';

    const actual: AttrSyntax = sut[pattern](pattern, value, ['t', 'bind']);
    assert.equal(actual.command, pattern);
    assert.equal(actual.rawName, pattern);
    assert.equal(actual.rawValue, value);
    assert.equal(actual.target, 'bind');
  });
});

describe('TranslationBindBindingCommand', function () {
  let originalAliases: string[];
  // eslint-disable-next-line mocha/no-hooks
  afterEach(function () {
    TranslationBindBindingCommand.aliases = originalAliases;
  });
  function setup(aliases?: string[]) {
    aliases = aliases || TranslationBindBindingCommand.aliases;
    [originalAliases, TranslationBindBindingCommand.aliases] = [TranslationBindBindingCommand.aliases, aliases];
    const container = DI.createContainer();
    TranslationBindBindingCommand.register(container);
    return aliases.reduce(
      (acc: TranslationBindBindingCommand[], alias) => {
        acc.push(
          container.get<TranslationBindBindingCommand>(BindingCommand.keyFrom(`${alias}.bind`)),
        );
        return acc;
      },
      []);
  }

  it('registers the `t` command by default', function () {
    const suts = setup();

    assert.equal(suts.length, 1);
    assert.equal(
      suts.every((sut) => sut instanceof TranslationBindBindingCommand),
      true);
  });

  it('registers alias commands when provided', function () {
    const aliases = ['t', 'i18n'];
    const suts = setup(aliases);

    assert.equal(suts.length, aliases.length);
    assert.equal(
      suts.every((sut) => sut instanceof TranslationBindBindingCommand),
      true);
  });

  it('compiles the binding to a TranslationBindBindingInstruction', function () {
    const [sut] = setup();
    const syntax: AttrSyntax = { command: 't.bind', rawName: 't.bind', rawValue: 'obj.key', target: 'bind' };

    const actual = sut.compile({
      command: new AttrBindingCommand(),
      flags: (void 0)!,
      expression: { syntax } as unknown as AnyBindingExpression,
      syntax
    });

    assert.instanceOf(actual, TranslationBindBindingInstruction);
  });
});

describe('TranslationBindBindingRenderer', function () {

  function setup() {
    const container = DI.createContainer();
    container.register(RuntimeConfiguration, I18nConfiguration);
    return container;
  }

  it('instantiated with instruction type', function () {
    const container = setup();
    const sut: IInstructionRenderer = new TranslationBindBindingRenderer(container.get(IExpressionParser), {} as unknown as IObserverLocator);
    assert.equal(sut.instructionType, TranslationBindInstructionType);
  });

  it('#render instantiates TranslationBinding - simple string literal', function () {
    const container = setup();
    const sut: IInstructionRenderer = new TranslationBindBindingRenderer(container.get(IExpressionParser), {} as unknown as IObserverLocator);
    const expressionParser = container.get(IExpressionParser);
    const renderable = ({} as unknown as IController);

    const from = expressionParser.parse('simple.key', BindingType.BindCommand);
    const callBindingInstruction: ICallBindingInstruction = { from, to: '.bind' } as unknown as ICallBindingInstruction;
    sut.render(
      LifecycleFlags.none,
      DOM,
      container as unknown as IRenderContext,
      renderable,
      DOM.createElement('span'),
      callBindingInstruction);

    assert.instanceOf(renderable.bindings[0], TranslationBinding);
  });

  it('#render instantiates TranslationBinding - .bind expr', function () {
    const container = setup();
    const sut: IInstructionRenderer = new TranslationBindBindingRenderer(container.get(IExpressionParser), {} as unknown as IObserverLocator);
    const expressionParser = container.get(IExpressionParser);
    const renderable = ({} as unknown as IController);

    const from = expressionParser.parse('simple.key', BindingType.BindCommand);
    const callBindingInstruction: ICallBindingInstruction = { from, to: '.bind' } as unknown as ICallBindingInstruction;
    sut.render(
      LifecycleFlags.none,
      DOM,
      container as unknown as IRenderContext,
      renderable,
      DOM.createElement('span'),
      callBindingInstruction);

    assert.instanceOf(renderable.bindings[0], TranslationBinding);
  });

  it('#render adds expr to the existing TranslationBinding for the target element', function () {
    const container = setup();
    const sut: IInstructionRenderer = new TranslationBindBindingRenderer(container.get(IExpressionParser), {} as unknown as IObserverLocator);
    const expressionParser = container.get(IExpressionParser);
    const targetElement = DOM.createElement('span');
    const binding = new TranslationBinding(targetElement, {} as unknown as IObserverLocator, container);
    const renderable = ({ bindings: [binding] } as unknown as IController);

    const from = expressionParser.parse('simple.key', BindingType.BindCommand);
    const callBindingInstruction: ICallBindingInstruction = { from, to: '.bind' } as unknown as ICallBindingInstruction;
    sut.render(
      LifecycleFlags.none,
      DOM,
      container as unknown as IRenderContext,
      renderable,
      targetElement,
      callBindingInstruction);

    assert.equal(binding.expr, from);
  });
});
