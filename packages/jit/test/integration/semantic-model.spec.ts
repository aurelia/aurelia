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
  ParserRegistration
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
  IResourceDescriptions
} from '../../../runtime/src/index';
import { expect } from 'chai';

function setup() {
  const container = DI.createContainer();
  container.register(
    ...(<IRegistry[]>DefaultBindingLanguage),
    ...(<IRegistry[]>GlobalResources),
    <IRegistry>ParserRegistration
  );

  const attrParser = container.get<IAttributeParser>(IAttributeParser);
  const exprParser = container.get<IExpressionParser>(IExpressionParser);
  const factory = container.get<ITemplateFactory>(ITemplateFactory);
  const resources = new RuntimeCompilationResources(<any>container);
  const locator = new ResourceLocator(<any>resources);
  const model = new SemanticModel(locator, attrParser, factory, <any>exprParser);
  const symbolPreprocessor = new SymbolPreprocessor(model);
  const nodePreprocessor = new NodePreprocessor(model);
  return { model, symbolPreprocessor, nodePreprocessor };
}


describe('SemanticModel', () => {
  it('works 1', () => {
    const { model, symbolPreprocessor, nodePreprocessor } = setup();
    const target = model.createCompilationTarget({ name: 'app', template: `<template><div></div></template>` });

    target.accept(symbolPreprocessor);

    console.log(stringifySymbol(target));

    target.accept(nodePreprocessor);

    console.log(stringifySymbol(target));
  });

  it('works 2', () => {
    const { model, symbolPreprocessor, nodePreprocessor } = setup();
    const target = model.createCompilationTarget({ name: 'app', template: "<template><template if.bind=\"false\" repeat.for=\"item of ['a', 'b', 'c']\">${item}</template><template else repeat.for=\"item of ['a', 'b', 'c']\" if.bind=\"false\">${item}</template><template if.bind=\"false\" repeat.for=\"item of ['a', 'b', 'c']\"></template><template else repeat.for=\"item of ['a', 'b', 'c']\">${item}</template></template>" });

    target.accept(symbolPreprocessor);

    console.log(stringifySymbol(target));

    target.accept(nodePreprocessor);

    console.log(stringifySymbol(target));
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
