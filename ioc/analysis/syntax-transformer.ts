import * as ts from 'typescript';
import * as AST from './ast';
import {
  IObjectBuilder,
  IObjectContext,
  IRequestSpecification,
  IObjectCommand,
  IObjectQuery
} from '../composition/interfaces';
import {
  NoObject,
  ObjectContext,
  FilteringObjectBuilderNode,
  CompositeObjectBuilderNode,
  Postprocessor,
  TerminatingBuilder
} from '../composition/core';
import { StaticModuleConfiguration } from '../static-module-configuration';
import {
  ClassBuilder,
  FunctionBuilder,
  VariableBuilder,
  ModuleImportBuilder,
  ModuleExportsBuilder,
  DecoratorBuilder,
  MethodBuilder,
  ConstructorBuilder,
  PropertyBuilder,
  ParameterBuilder,
  ModuleBuilder
} from './node-builders';

export class TypeScriptSyntaxTransformer {
  private readonly context: IObjectContext;

  constructor() {
    const isTypeScriptSyntax = new AndSpecification(
      new TypeNameSpecification(/Object/),
      new OrSpecification(
        new PropertySpecification('kind', new TypeNameSpecification(/Number/)),
        new PropertySpecification('flags', new TypeNameSpecification(/Number/))
      )
    );

    const hasParentSymbol = new PropertySpecification(
      parentSymbol,
      new NotSpecification(new TypeNameSpecification(/Undefined/))
    );

    const graphNodeBuilder = new FilteringObjectBuilderNode(
      new Postprocessor(
        new CompositeObjectBuilderNode(
          new ClassBuilder(),
          new FunctionBuilder(),
          new VariableBuilder(),
          new ModuleImportBuilder(),
          new ModuleExportsBuilder(),
          new DecoratorBuilder(),
          new MethodBuilder(),
          new ConstructorBuilder(),
          new PropertyBuilder(),
          new ParameterBuilder(),
          new ArgumentBuilder()
        ),
        new DecoratorAssigner(new DecoratorsQuery())
      ),
      hasParentSymbol
    );
    const graphBuilder = new CompositeObjectBuilderNode(new ModuleBuilder(), graphNodeBuilder, new NameBuilder());

    this.context = new ObjectContext(
      new CompositeObjectBuilderNode(
        new ParentChildLinker(),
        new FilteringObjectBuilderNode(graphBuilder, isTypeScriptSyntax),
        new TextResidueCollector(),
        new OptionalResidueCollector()
        //new TerminatingBuilder()
      )
    );
  }

  public create(...sourceFiles: ts.SourceFile[]): StaticModuleConfiguration {
    const config = new StaticModuleConfiguration(...sourceFiles.map(s => this.context.resolve(s)));
    return config;
  }
}

export class ParentChildLinker implements IObjectBuilder {
  public create(request: ChildNode, context: IObjectContext): AST.INode | symbol {
    if (!(request instanceof ChildNode)) {
      return NoObject;
    }
    if (request.parentOutput) {
      request.innerRequest[parentSymbol] = request.parentOutput;
    } else if (request.parentRequest[parentSymbol]) {
      request.innerRequest[parentSymbol] = request.parentOutput = request.parentRequest[parentSymbol];
    }
    const output = context.resolve(request.innerRequest);
    request.innerRequest[parentSymbol] = null;
    if (output === NoObject) {
      return output;
    }
    output.parent = request.parentOutput;
    request.parentOutput = null;
    request.parentRequest = null;
    return output;
  }
}

export class DecoratorAssigner implements IObjectCommand {
  public readonly query: IObjectQuery;
  constructor(query: IObjectQuery) {
    this.query = query;
  }

  public execute(obj: any, context: IObjectContext): any {
    const unresolvedDecorators = this.query.select(obj);
    obj.decorators = [];
    for (const unresolvedDecorator of unresolvedDecorators) {
      const resolvedDecorator = context.resolve(unresolvedDecorator);
      obj.decorators.push(resolvedDecorator);
    }
    return obj;
  }
}

export class PropertySpecification implements IRequestSpecification {
  public readonly propertyKey: PropertyKey;
  public readonly specification: IRequestSpecification;
  constructor(propertyKey: PropertyKey, specification: IRequestSpecification) {
    this.propertyKey = propertyKey;
    this.specification = specification;
  }

  public isSatisfiedBy(request: any): boolean {
    return this.specification.isSatisfiedBy(request[this.propertyKey]);
  }
}

export class TypeNameSpecification implements IRequestSpecification {
  public readonly typeName: RegExp;
  constructor(typeName: RegExp) {
    this.typeName = typeName;
  }

  public isSatisfiedBy(request: any): boolean {
    return this.typeName.test(Object.prototype.toString.call(request));
  }
}

export class AndSpecification implements IRequestSpecification {
  public readonly specifications: IRequestSpecification[];
  constructor(...specifications: IRequestSpecification[]) {
    this.specifications = specifications;
  }

  public isSatisfiedBy(request: any): boolean {
    return this.specifications.every(s => s.isSatisfiedBy(request));
  }
}

export class OrSpecification implements IRequestSpecification {
  public readonly specifications: IRequestSpecification[];
  constructor(...specifications: IRequestSpecification[]) {
    this.specifications = specifications;
  }

  public isSatisfiedBy(request: any): boolean {
    return this.specifications.some(s => s.isSatisfiedBy(request));
  }
}

export class NotSpecification implements IRequestSpecification {
  public readonly specification: IRequestSpecification;
  constructor(specification: IRequestSpecification) {
    this.specification = specification;
  }

  public isSatisfiedBy(request: any): boolean {
    return !this.specification.isSatisfiedBy(request);
  }
}

export class NameBuilder implements IObjectBuilder {
  public create(request: ts.BindingName | ts.TypeNode | ts.EntityName, context: IObjectContext): any {
    switch (request.kind) {
      case ts.SyntaxKind.Identifier: {
        return (request as ts.Identifier).text || (request as ts.Identifier).escapedText;
      }
      case ts.SyntaxKind.TypeReference: {
        return context.resolve((request as ts.TypeReferenceNode).typeName);
      }
      case ts.SyntaxKind.QualifiedName: {
        return `${context.resolve((request as ts.QualifiedName).left)}.${context.resolve(
          (request as ts.QualifiedName).right
        )}`;
      }
      case ts.SyntaxKind.ObjectBindingPattern:
      case ts.SyntaxKind.ArrayBindingPattern:
      default: {
        return NoObject;
      }
    }
  }
}

/**
 * Returns arguments if they have text (simple class references), e.g. for @inject(ClassA, ClassB)
 * CallExpressions such as @inject(Factory.of(ClassA)) are simply unwrapped (for the time being)
 */
export class ArgumentBuilder implements IObjectBuilder {
  public create(request: ts.Node, context: IObjectContext): Partial<AST.INode> | symbol {
    if (request.kind === ts.SyntaxKind.CallExpression) {
      const callExpression = request as ts.CallExpression;
      if (callExpression.arguments.length === 1) {
        const firstArg = callExpression.arguments[0];
        return context.resolve(ChildNode.of(firstArg).withParentRequest(request));
      }
      return NoObject;
    }

    return {
      kind: AST.NodeKind.Argument,
      text: (request as any).text || (request as any).escapedText
    };
  }
}

/**
 * Tries to retrieve raw text from syntax nodes that could not be resolved by other builders
 */
export class TextResidueCollector implements IObjectBuilder {
  public create(request: any, context: IObjectContext): string | symbol {
    if (!!request.text && request.text.length) {
      return request.text;
    }
    if (!!request.escapedText && request.escapedText.length) {
      return request.escapedText;
    }

    return NoObject;
  }
}

export class OptionalResidueCollector implements IObjectBuilder {
  public readonly defaultValue: any;
  constructor(defaultValue: any = null) {
    this.defaultValue = defaultValue;
  }

  public create(request: OptionalRequest, context: IObjectContext): string | symbol {
    if (!(request instanceof OptionalRequest)) {
      return NoObject;
    }

    const output = context.resolve(request.innerRequest);
    if (output !== NoObject) {
      return output;
    }
    if (request.defaultValue !== undefined) {
      return request.defaultValue;
    }
    return this.defaultValue;
  }
}

export class OptionalRequest {
  public defaultValue: any;
  public readonly innerRequest: any;
  constructor(innerRequest: any) {
    this.innerRequest = innerRequest;
  }

  public static for(request: any): OptionalRequest {
    return new OptionalRequest(request);
  }

  public withDefault(value: any): OptionalRequest {
    this.defaultValue = value;
    return this;
  }
}

export class ChildNode {
  public parentOutput: any;
  public parentRequest: any;
  public readonly innerRequest: any;
  constructor(innerRequest: any) {
    this.innerRequest = innerRequest;
  }

  public static of(request: any): ChildNode {
    return new ChildNode(request);
  }

  public withParentOutput(output: any): ChildNode {
    this.parentOutput = output;
    return this;
  }

  public withParentRequest(request: any): ChildNode {
    this.parentRequest = request;
    return this;
  }
}

export class DecoratorsQuery implements IObjectQuery {
  public select(obj: ts.Node): ts.Decorator[] {
    if (obj.decorators && obj.decorators.length) {
      return Array.from(obj.decorators);
    } else {
      return [];
    }
  }
}

const parentSymbol = Symbol('parent');
