import {
  SemanticModel,
  SymbolKind,
  SlotElementSymbol,
  SurrogateElementSymbol,
  AttributeInterpolationSymbol,
  AttributeSymbol,
  BindingCommandSymbol,
  BoundAttributeSymbol,
  CustomAttributeSymbol,
  CustomElementSymbol,
  ElementSymbol,
  LetElementSymbol,
  NodeSymbol,
  ParentElementSymbol,
  PlainElementSymbol,
  TemplateControllerAttributeSymbol,
  TextInterpolationSymbol,
  CompilationTarget,
  ISymbol
} from '../../src/semantic-model';
import {
  ITemplateFactory,
  TemplateFactory
} from '../../src/template-factory';
import {
  stringifyTemplateDefinition,
  stringifySymbol
} from '../../src/debugging';
import {
  DefaultBindingLanguage,
  GlobalResources,
  ParserRegistration,
  IElementParser,
  BasicConfiguration,
  IAttributeParser
} from '../../../jit/src/index';
import {
  DI,
  IRegistry,
  IContainer,
  PLATFORM,
  Tracer,
  ITraceInfo,
  Container,
  Resolver
} from '../../../kernel/src/index';
import {
  Tracer as DebugTracer
} from '../../../debug/src/index';
import {
  IExpressionParser,
  RuntimeCompilationResources,
  IResourceDescriptions,
  ILifecycle,
  HtmlRenderer,
  CustomElementResource,
  Aurelia,
  DOM,
  IHTMLElement,
  INode,
  NodeType,
  IElement,
  IText,
  TargetedInstruction,
  TargetedInstructionType,
  ITemplateDefinition,
  IHTMLTemplateElement
} from '../../../runtime/src/index';
import { expect } from 'chai';
import {
  TemplateCompiler,
  SymbolPreprocessor,
  NodePreprocessor,
} from '../../src/template-compiler';
import { enableTracing, disableTracing, SymbolTraceWriter } from '../unit/util';
import { MetadataModel } from '../../src/metadata-model';

function setup() {
  const container = DI.createContainer();
  container.register(
    ...(<IRegistry[]>DefaultBindingLanguage),
    ...(<IRegistry[]>GlobalResources),
    <IRegistry>ParserRegistration
  );

  const attrParser = container.get<IAttributeParser>(IAttributeParser);
  const elParser = container.get<IElementParser>(IElementParser);
  const exprParser = container.get<IExpressionParser>(IExpressionParser);
  const factory = container.get<ITemplateFactory>(ITemplateFactory);
  const resources = new RuntimeCompilationResources(<any>container);
  const metadata = new MetadataModel(<any>resources);
  const model = new SemanticModel(metadata, attrParser, factory, <any>exprParser);
  const symbolPreprocessor = new SymbolPreprocessor(model);
  const nodePreprocessor = new NodePreprocessor(model);
  return { model, symbolPreprocessor, nodePreprocessor, container, attrParser, elParser, exprParser, factory, metadata, resources };
}

describe('SemanticModel', () => {
  it('works 1', () => {
    const { model, symbolPreprocessor, nodePreprocessor } = setup();
    const target = model.createCompilationTarget({ name: 'app', template: `<template><div></div></template>` });

    target.accept(symbolPreprocessor);

    //console.log(stringifySymbol(target));

    target.accept(nodePreprocessor);

    //console.log(stringifySymbol(target));
  });

  it('works 2', () => {
    const { model, symbolPreprocessor, nodePreprocessor } = setup();
    const target = model.createCompilationTarget({ name: 'app', template: "<template><template if.bind=\"false\" repeat.for=\"item of ['a', 'b', 'c']\">${item}</template><template else repeat.for=\"item of ['a', 'b', 'c']\" if.bind=\"false\">${item}</template><template if.bind=\"false\" repeat.for=\"item of ['a', 'b', 'c']\"></template><template else repeat.for=\"item of ['a', 'b', 'c']\">${item}</template></template>" });

    target.accept(symbolPreprocessor);

    //console.log(stringifySymbol(target));

    target.accept(nodePreprocessor);

    //console.log(stringifySymbol(target));
  });

  it('works 3', () => {
    const { model, symbolPreprocessor, nodePreprocessor, exprParser, elParser, attrParser, resources } = setup();
    const compiler = new TemplateCompiler(<any>exprParser, elParser, attrParser);
    const def = { name: 'app', template: "<template><template if.bind=\"false\" repeat.for=\"item of ['a', 'b', 'c']\">${item}</template><template else repeat.for=\"item of ['a', 'b', 'c']\" if.bind=\"false\">${item}</template><template if.bind=\"false\" repeat.for=\"item of ['a', 'b', 'c']\"></template><template else repeat.for=\"item of ['a', 'b', 'c']\">${item}</template></template>" };

    const output = compiler.compile(def, <any>resources);
  });

  it('works 4', () => {
    enableTracing();
    Tracer.enableLiveLogging(SymbolTraceWriter);
    const container = DI.createContainer();
    container.register(<any>BasicConfiguration);
    const def = { name: 'app', template: "<template><div repeat.for=\"i of 2\">${msg}</div></template>" };
    const App = CustomElementResource.define(def, class { msg = 'aa'});
    const component = new App();
    const host = <any>DOM.createElement('div');

    const au = new Aurelia(<any>container);

    au.app({ component, host });
    try {
      au.start();

    } catch(e) {

    } finally {
    }

    console.log('\n'+stringifyTemplateDefinition(App.description, 0));
    disableTracing();
    expect(host.textContent).to.equal('aaaa');
  });

  it('works 5', () => {
    enableTracing();
    Tracer.enableLiveLogging(SymbolTraceWriter);
    const container = DI.createContainer();
    container.register(<any>BasicConfiguration);
    const def = { name: 'app', template: "<template><template if.bind=\"false\" repeat.for=\"item of ['a', 'b', 'c']\">${item}</template><template else repeat.for=\"item of ['a', 'b', 'c']\" if.bind=\"false\">${item}</template><template if.bind=\"false\" repeat.for=\"item of ['a', 'b', 'c']\"></template><template else repeat.for=\"item of ['a', 'b', 'c']\">${item}</template></template>" };
    const App = CustomElementResource.define(def, class { msg = 'a'});
    const component = new App();
    const host = <any>DOM.createElement('div');

    const au = new Aurelia(<any>container);

    au.app({ component, host });
    try {
      au.start();

    } catch(e) {
      console.log(e);
    } finally {
    }

    console.log('\n'+stringifyTemplateDefinition(App.description, 0));
    disableTracing();

    expect(host.textContent).to.equal('abc');
  });

  it('works 6', () => {
    enableTracing();
    Tracer.enableLiveLogging(SymbolTraceWriter);
    const container = DI.createContainer();
    container.register(<any>BasicConfiguration);
    const def = { name: 'app', template: "<template><template repeat.for=\"item of ['a', 'b', 'c']\">${item}</template></template>" };
    const App = CustomElementResource.define(def, class { msg = 'a'});
    const component = new App();
    const host = <any>DOM.createElement('div');

    const au = new Aurelia(<any>container);

    au.app({ component, host });
    try {
      au.start();

    } catch(e) {
      console.log(e);
    } finally {
    }

    console.log('\n'+stringifyTemplateDefinition(App.description, 0));
    disableTracing();

    expect(host.textContent).to.equal('abc');
  });

  it('works 7', () => {
    enableTracing();
    Tracer.enableLiveLogging(SymbolTraceWriter);
    const container = DI.createContainer();
    container.register(<any>BasicConfiguration);
    const def = { name: 'app', template: "<template><div repeat.for=\"item of ['a', 'b', 'c']\">${item}</div></template>" };
    const App = CustomElementResource.define(def, class { msg = 'a'});
    const component = new App();
    const host = <any>DOM.createElement('div');

    const au = new Aurelia(<any>container);

    au.app({ component, host });
    try {
      au.start();

    } catch(e) {
      console.log(e);
    } finally {
    }

    console.log('\n'+stringifyTemplateDefinition(App.description, 0));
    disableTracing();

    expect(host.textContent).to.equal('abc');
  });

  it('works 8', () => {

    enableTracing();
    Tracer.enableLiveLogging(SymbolTraceWriter);
    const container = DI.createContainer();
    container.register(<any>BasicConfiguration);
    const def = { name: 'app', template: "<template>${msg}</template>" };
    const App = CustomElementResource.define(def, class { msg = 'a'});
    const component = new App();
    const host = <any>DOM.createElement('div');

    const au = new Aurelia(<any>container);

    au.app({ component, host });
    try {
      au.start();

    } catch(e) {
      console.log(e);
    } finally {
    }

    console.log('\n'+stringifyTemplateDefinition(App.description, 0));
    disableTracing();

    expect(host.textContent).to.equal('a');
  });

  it('works 9', () => {

    enableTracing();
    Tracer.enableLiveLogging(SymbolTraceWriter);
    const container = DI.createContainer();
    container.register(<any>BasicConfiguration);
    const def = { name: 'app', template: "<template><template if.bind=\"true\">${msg}</template></template>" };
    const App = CustomElementResource.define(def, class { msg = 'a'});
    const component = new App();
    const host = <any>DOM.createElement('div');

    const au = new Aurelia(<any>container);

    au.app({ component, host });
    try {
      au.start();

    } catch(e) {
      console.log(e);
    } finally {
    }

    console.log('\n'+stringifyTemplateDefinition(App.description, 0));
    disableTracing();

    expect(host.textContent).to.equal('a');
  });

  it('works 10', () => {
    enableTracing();
    Tracer.enableLiveLogging(SymbolTraceWriter);
    const container = DI.createContainer();
    container.register(<any>BasicConfiguration);
    const def = { name: 'app', template: "<template><template if.bind=\"true\" repeat.for=\"item of ['a', 'b', 'c']\">${item}</template></template>" };
    const App = CustomElementResource.define(def, class { msg = 'a'});
    const component = new App();
    const host = <any>DOM.createElement('div');

    const au = new Aurelia(<any>container);

    au.app({ component, host });
    try {
      au.start();

    } catch(e) {
      console.log(e);
    } finally {
    }

    console.log('\n'+stringifyTemplateDefinition(App.description, 0));
    disableTracing();

    expect(host.textContent).to.equal('abc');
  });

  it('works 11', () => {
    enableTracing();
    Tracer.enableLiveLogging(SymbolTraceWriter);
    const container = DI.createContainer();
    container.register(<any>BasicConfiguration);
    const def = { name: 'app', template: "<template><div if.bind=\"true\" repeat.for=\"item of ['a', 'b', 'c']\">${item}</div></template>" };
    const App = CustomElementResource.define(def, class { msg = 'a'});
    const component = new App();
    const host = <any>DOM.createElement('div');

    const au = new Aurelia(<any>container);

    au.app({ component, host });
    try {
      au.start();

    } catch(e) {
      console.log(e);
    } finally {
    }

    console.log('\n'+stringifyTemplateDefinition(App.description, 0));
    disableTracing();

    expect(host.textContent).to.equal('abc');
  });
});

