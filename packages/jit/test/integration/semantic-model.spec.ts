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
  PartAttributeSymbol,
  PlainElementSymbol,
  ReplacePartAttributeSymbol,
  TemplateControllerAttributeSymbol,
  TextInterpolationSymbol,
  IAttributeParser,
  ITemplateFactory,
  AttributeParser,
  TemplateFactory,
  CompilationTarget,
  ResourceLocator,
  IResourceLocator,
  SymbolPreprocessor,
  NodePreprocessor,
  ISymbol
} from '../../src/semantic-model-2';
import {
  DefaultBindingLanguage,
  GlobalResources,
  ParserRegistration,
  IElementParser,
  BasicConfiguration
} from '../../../jit/src/index';
import {
  DI,
  IRegistry,
  IContainer,
  PLATFORM
} from '../../../kernel/src/index';
import {
  IExpressionParser,
  RuntimeCompilationResources,
  IResourceDescriptions,
  ILifecycle,
  HtmlRenderer,
  CustomElementResource,
  Aurelia,
  DOM,
  IHTMLElement
} from '../../../runtime/src/index';
import { expect } from 'chai';
import { TemplateCompiler } from '../../src/template-compiler-2';

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
  const locator = new ResourceLocator(<any>resources);
  const model = new SemanticModel(locator, attrParser, factory, <any>exprParser);
  const symbolPreprocessor = new SymbolPreprocessor(model);
  const nodePreprocessor = new NodePreprocessor(model);
  return { model, symbolPreprocessor, nodePreprocessor, container, attrParser, elParser, exprParser, factory, locator, resources };
}


describe('SemanticModel', () => {
  xit('works 1', () => {
    const { model, symbolPreprocessor, nodePreprocessor } = setup();
    const target = model.createCompilationTarget({ name: 'app', template: `<template><div></div></template>` });

    target.accept(symbolPreprocessor);

    //console.log(stringifySymbol(target));

    target.accept(nodePreprocessor);

    //console.log(stringifySymbol(target));
  });

  xit('works 2', () => {
    const { model, symbolPreprocessor, nodePreprocessor } = setup();
    const target = model.createCompilationTarget({ name: 'app', template: "<template><template if.bind=\"false\" repeat.for=\"item of ['a', 'b', 'c']\">${item}</template><template else repeat.for=\"item of ['a', 'b', 'c']\" if.bind=\"false\">${item}</template><template if.bind=\"false\" repeat.for=\"item of ['a', 'b', 'c']\"></template><template else repeat.for=\"item of ['a', 'b', 'c']\">${item}</template></template>" });

    target.accept(symbolPreprocessor);

    //console.log(stringifySymbol(target));

    target.accept(nodePreprocessor);

    //console.log(stringifySymbol(target));
  });

  xit('works 3', () => {
    const { model, symbolPreprocessor, nodePreprocessor, exprParser, elParser, attrParser, resources } = setup();
    const compiler = new TemplateCompiler(<any>exprParser, elParser, attrParser);
    const def = { name: 'app', template: "<template><template if.bind=\"false\" repeat.for=\"item of ['a', 'b', 'c']\">${item}</template><template else repeat.for=\"item of ['a', 'b', 'c']\" if.bind=\"false\">${item}</template><template if.bind=\"false\" repeat.for=\"item of ['a', 'b', 'c']\"></template><template else repeat.for=\"item of ['a', 'b', 'c']\">${item}</template></template>" };

    const output = compiler.compile(def, <any>resources);
  });

  it('works 4', () => {
    const container = DI.createContainer();
    container.register(<any>BasicConfiguration);
    const def = { name: 'app', template: "<template><div repeat.for=\"i of 2\">${msg}</div></template>" };
    const App = CustomElementResource.define(def, class { msg = 'a'});
    const component = new App();
    const host = <any>DOM.createElement('div');

    const au = new Aurelia(<any>container);

    au.app({ component, host });
    try {
      au.start();

    } catch(e) {

    } finally {

      console.log((<IHTMLElement>App.description.template).outerHTML)
    }

    expect(host.textContent).to.equal('a');
  });
});

export function stringifySymbol(symbol: any): string {
  return JSON.stringify(
    { name: symbol.definition.name, headAttr: symbol.headAttr, headNode: symbol.headNode },
    (key: string, value: any): any => {
      if (!value) {
        return undefined;
      }
      switch (key) {
        case 'headAttr':
          return `${value.attr.name}=${value.attr.value} (${value.expr === null ? null : {}})`;
        case 'nextAttr':
          return undefined;
        case 'tailAttr':
          return `${value.attr.name}=${value.attr.value} (${value.expr === null ? null : {}})`;
        case 'headNode':
          return { el: value.element ? value.element.nodeName : value.text.nodeName, headAttr: value.headAttr, headNode: value.headNode, nextNode: value.nextNode };
        case 'nextNode':
          return { el: value.element ? value.element.nodeName : value.text.nodeName, headAttr: value.headAttr, headNode: value.headNode, nextNode: value.nextNode };
        case 'tailNode':
          return undefined;
        default:
          return value;
      }
    },
    2
  );
}
