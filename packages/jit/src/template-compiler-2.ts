import { inject } from '@aurelia/kernel';
import {
  IExpressionParser,
  IResourceDescriptions,
  ITemplateCompiler,
  ITemplateDefinition,
  TemplateDefinition
} from '@aurelia/runtime';
import { IAttributeParser } from './attribute-parser';
import { IElementParser } from './element-parser';
import {
  InstructionBuilder,
  ISymbolVisitor,
  NodePreprocessor,
  ResourceLocator,
  SemanticModel,
  SymbolPreprocessor,
  TemplateFactory
} from './semantic-model-2';

@inject(IExpressionParser, IElementParser, IAttributeParser)
export class TemplateCompiler implements ITemplateCompiler {
  public exprParser: IExpressionParser;
  public elParser: IElementParser;
  public attrParser: IAttributeParser;

  public get name(): string {
    return 'default';
  }

  constructor(exprParser: IExpressionParser, elParser: IElementParser, attrParser: IAttributeParser) {
    this.exprParser = exprParser;
    this.elParser = elParser;
    this.attrParser = attrParser;
  }

  public compile(definition: ITemplateDefinition, resources: IResourceDescriptions): TemplateDefinition {
    const model = new SemanticModel(
      new ResourceLocator(resources),
      this.attrParser,
      new TemplateFactory(),
      this.exprParser
    );

    const target = model.createCompilationTarget(definition);

    const visitors: ISymbolVisitor[] = [
      new SymbolPreprocessor(model),
      new NodePreprocessor(model),
      new InstructionBuilder(model)
    ];

    visitors.forEach(visitor => {
      target.accept(visitor);
    });

    return <TemplateDefinition>target.definition;
  }
}
