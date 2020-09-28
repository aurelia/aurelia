import {
  I18nConfiguration,
  TranslationAttributePattern,
  TranslationBindAttributePattern,
  TranslationBindBindingCommand,
  TranslationBindBindingInstruction,
  TranslationBindBindingRenderer,
  TranslationBinding,
  TranslationBindingCommand,
  TranslationBindingInstruction,
  TranslationBindingRenderer,
  TranslationBindInstructionType,
  TranslationInstructionType,
} from '@aurelia/i18n';
import {
  AttributePattern,
  AttributePatternDefinition,
  AttrSyntax,
  BindingCommand,
  IAttributePattern,
  PlainAttributeSymbol,
} from '@aurelia/jit';
import { AttrBindingCommand } from '@aurelia/jit-html';
import { Constructable, DI } from '@aurelia/kernel';
import {
  AnyBindingExpression,
  BindingType,
  IBinding,
  ICallBindingInstruction,
  ICompiledRenderContext,
  IExpressionParser,
  IInstructionRenderer,
  IObserverLocator,
  IRenderableController,
  LifecycleFlags,
  RuntimeConfiguration,
} from '@aurelia/runtime';
import { DOM } from '@aurelia/runtime-html';
import { assert } from '@aurelia/testing';

describe('TranslationAttributePattern', function () {
  function createFixture(aliases: string[] = ['t']) {
    const patterns: AttributePatternDefinition[] = [];
    for (const pattern of aliases) {
      patterns.push({ pattern, symbols: '' });
      TranslationAttributePattern.registerAlias(pattern);
    }
    const container = DI.createContainer().register(AttributePattern.define(patterns, TranslationAttributePattern));
    return container.get(IAttributePattern);
  }

  it('registers alias attribute patterns when provided', function () {
    const aliases = ['t', 'i18n'];
    const sut = createFixture(aliases);

    assert.instanceOf(sut, TranslationAttributePattern);

    const patternDefs = [];
    for (const alias of aliases) {
      assert.typeOf(sut[alias], 'function');
      patternDefs.push({ pattern: alias, symbols: '' });
    }

    assert.deepEqual(AttributePattern.getPatternDefinitions(sut.constructor as Constructable), patternDefs);
  });

  it('creates attribute syntax without `to` part when `T="expr"` is used', function () {
    const sut = createFixture();
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
  function createFixture(aliases?: string[]) {
    aliases = aliases || [];
    const container = DI.createContainer().register(
      BindingCommand.define({name: 't', aliases}, TranslationBindingCommand)
    );
    if (!aliases.includes('t')) {
      aliases.push('t');
    }
    return aliases.reduce(
      (acc: TranslationBindingCommand[], alias) => {
        acc.push(
          container.get<TranslationBindingCommand>(BindingCommand.keyFrom(alias)),
        );
        return acc;
      },
      []);
  }

  it('registers alias commands when provided', function () {
    const aliases = ['t', 'i18n'];
    const suts = createFixture(aliases);

    assert.equal(suts.length, aliases.length);
    assert.equal(
      suts.every((sut) => sut instanceof TranslationBindingCommand),
      true);
  });

  it('compiles the binding to a TranslationBindingInstruction', function () {
    const [sut] = createFixture();
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

  function createFixture() {
    const container = DI.createContainer();
    container.register(RuntimeConfiguration, I18nConfiguration);
    return container;
  }

  it('instantiated with instruction type', function () {
    const container = createFixture();
    const sut: IInstructionRenderer = new TranslationBindingRenderer(container.get(IExpressionParser), {} as unknown as IObserverLocator);
    assert.equal(sut.instructionType, TranslationInstructionType);
  });

  it('#render instantiates TranslationBinding - simple string literal', function () {
    const container = createFixture();
    const sut: IInstructionRenderer = new TranslationBindingRenderer(container.get(IExpressionParser), {} as unknown as IObserverLocator);
    const expressionParser = container.get(IExpressionParser);
    const controller = ({ bindings: [], addBinding(binding) { (controller.bindings as unknown as IBinding[]).push(binding); } } as unknown as IRenderableController);

    const from = expressionParser.parse('simple.key', BindingType.CustomCommand);
    const callBindingInstruction: ICallBindingInstruction = { from } as unknown as ICallBindingInstruction;
    sut.render(
      LifecycleFlags.none,
      container as unknown as ICompiledRenderContext,
      controller,
      DOM.createElement('span'),
      callBindingInstruction,
      void 0,
    );

    assert.instanceOf(controller.bindings[0], TranslationBinding);
  });

  it('#render adds expr to the existing TranslationBinding for the target element', function () {
    const container = createFixture();
    const sut: IInstructionRenderer = new TranslationBindingRenderer(container.get(IExpressionParser), {} as unknown as IObserverLocator);
    const expressionParser = container.get(IExpressionParser);
    const targetElement = DOM.createElement('span');
    const binding = new TranslationBinding(targetElement, {} as unknown as IObserverLocator, container);
    const controller = ({ bindings: [binding], addBinding(binding) { (controller.bindings as unknown as IBinding[]).push(binding); } } as unknown as IRenderableController);

    const from = expressionParser.parse('simple.key', BindingType.CustomCommand);
    const callBindingInstruction: ICallBindingInstruction = { from } as unknown as ICallBindingInstruction;
    sut.render(
      LifecycleFlags.none,
      container as unknown as ICompiledRenderContext,
      controller,
      targetElement,
      callBindingInstruction,
      void 0,
    );

    assert.equal(binding.expr, from);
  });
});

describe('TranslationBindAttributePattern', function () {
  function createFixture(aliases: string[] = ['t']) {
    const patterns: AttributePatternDefinition[] = [];
    for (const pattern of aliases) {
      patterns.push({ pattern: `${pattern}.bind`, symbols: '.' });
      TranslationBindAttributePattern.registerAlias(pattern);
    }
    const container = DI.createContainer().register(
      AttributePattern.define(patterns, TranslationBindAttributePattern)
    );
    return container.get(IAttributePattern);
  }

  it('registers alias attribute patterns when provided', function () {
    const aliases = ['t', 'i18n'];
    const sut = createFixture(aliases);

    assert.instanceOf(sut, TranslationBindAttributePattern);
    assert.deepEqual(
      AttributePattern.getPatternDefinitions(sut.constructor as Constructable),
      aliases.reduce(
        (acc, alias) => {
          acc.push({ pattern: `${alias}.bind`, symbols: '.' });
          return acc;
        },
        []));

    aliases.forEach((alias) => {
      assert.typeOf(sut[`${alias}.bind`], 'function', `${alias}.bind`);
    });
  });

  it('creates attribute syntax with `to` part when `T.bind="expr"` is used', function () {
    const sut = createFixture();
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
  function createFixture(aliases?: string[]) {
    aliases = aliases || [];
    aliases = aliases.map(alias => `${alias}.bind`);
    const container = DI.createContainer().register(
      BindingCommand.define({name: 't.bind', aliases}, TranslationBindBindingCommand)
    );
    if (!aliases.includes('t.bind')) {
      aliases.push('t.bind');
    }
    return aliases.reduce(
      (acc: TranslationBindBindingCommand[], alias) => {
        acc.push(
          container.get<TranslationBindBindingCommand>(BindingCommand.keyFrom(alias)),
        );
        return acc;
      },
      []);
  }

  it('registers alias commands when provided', function () {
    const aliases = ['t', 'i18n'];
    const suts = createFixture(aliases);

    assert.equal(suts.length, aliases.length);
    assert.equal(
      suts.every((sut) => sut instanceof TranslationBindBindingCommand),
      true);
  });

  it('compiles the binding to a TranslationBindBindingInstruction', function () {
    const [sut] = createFixture();
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

  function createFixture() {
    const container = DI.createContainer();
    container.register(RuntimeConfiguration, I18nConfiguration);
    return container;
  }

  it('instantiated with instruction type', function () {
    const container = createFixture();
    const sut: IInstructionRenderer = new TranslationBindBindingRenderer(container.get(IExpressionParser), {} as unknown as IObserverLocator);
    assert.equal(sut.instructionType, TranslationBindInstructionType);
  });

  it('#render instantiates TranslationBinding - simple string literal', function () {
    const container = createFixture();
    const sut: IInstructionRenderer = new TranslationBindBindingRenderer(container.get(IExpressionParser), {} as unknown as IObserverLocator);
    const expressionParser = container.get(IExpressionParser);
    const controller = ({ bindings: [], addBinding(binding) { (controller.bindings as unknown as IBinding[]).push(binding); } } as unknown as IRenderableController);

    const from = expressionParser.parse('simple.key', BindingType.BindCommand);
    const callBindingInstruction: ICallBindingInstruction = { from, to: '.bind' } as unknown as ICallBindingInstruction;
    sut.render(
      LifecycleFlags.none,
      container as unknown as ICompiledRenderContext,
      controller,
      DOM.createElement('span'),
      callBindingInstruction,
      void 0,
    );

    assert.instanceOf(controller.bindings[0], TranslationBinding);
  });

  it('#render instantiates TranslationBinding - .bind expr', function () {
    const container = createFixture();
    const sut: IInstructionRenderer = new TranslationBindBindingRenderer(container.get(IExpressionParser), {} as unknown as IObserverLocator);
    const expressionParser = container.get(IExpressionParser);
    const controller = ({ bindings: [], addBinding(binding) { (controller.bindings as unknown as IBinding[]).push(binding); } } as unknown as IRenderableController);

    const from = expressionParser.parse('simple.key', BindingType.BindCommand);
    const callBindingInstruction: ICallBindingInstruction = { from, to: '.bind' } as unknown as ICallBindingInstruction;
    sut.render(
      LifecycleFlags.none,
      container as unknown as ICompiledRenderContext,
      controller,
      DOM.createElement('span'),
      callBindingInstruction,
      void 0,
    );

    assert.instanceOf(controller.bindings[0], TranslationBinding);
  });

  it('#render adds expr to the existing TranslationBinding for the target element', function () {
    const container = createFixture();
    const sut: IInstructionRenderer = new TranslationBindBindingRenderer(container.get(IExpressionParser), {} as unknown as IObserverLocator);
    const expressionParser = container.get(IExpressionParser);
    const targetElement = DOM.createElement('span');
    const binding = new TranslationBinding(targetElement, {} as unknown as IObserverLocator, container);
    const controller = ({ bindings: [binding], addBinding(binding) { (controller.bindings as unknown as IBinding[]).push(binding); } } as unknown as IRenderableController);

    const from = expressionParser.parse('simple.key', BindingType.BindCommand);
    const callBindingInstruction: ICallBindingInstruction = { from, to: '.bind' } as unknown as ICallBindingInstruction;
    sut.render(
      LifecycleFlags.none,
      container as unknown as ICompiledRenderContext,
      controller,
      targetElement,
      callBindingInstruction,
      void 0,
    );

    assert.equal(binding.expr, from);
  });
});
