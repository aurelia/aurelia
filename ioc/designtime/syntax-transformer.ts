import * as ts from 'typescript';
import * as AST from './ast';
import { IObjectBuilder, IObjectContext, IRequestSpecification, IObjectCommand, IObjectQuery } from './interfaces';
import {
  NoObject,
  ObjectContext,
  FilteringObjectBuilderNode,
  CompositeObjectBuilderNode,
  Postprocessor,
  TerminatingBuilder,
  OrSpecification,
  NotSpecification,
  OmitObject,
  SomeSpecification
} from './core';
import { StaticModuleConfiguration } from './configuration';
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
  ModuleBuilder,
  ArgumentBuilder
} from './node-builders';
import { TypeNameSpecification, PropertySpecification, IsTypeScriptSyntaxSpecification } from './specifications';

export class SyntaxTransformer {
  private readonly context: IObjectContext;

  constructor() {
    const hasParentSymbol = new PropertySpecification(
      parentSymbol,
      new NotSpecification(new TypeNameSpecification(/Undefined/))
    );

    const isBindingBehavior = new OrSpecification(
      new ClassNameSpecification(/(BindingBehavior|ValueConverter)$/),
      new PropertySpecification(
        'decorators',
        new SomeSpecification(new DecoratorNameSpecification(/bindingBehavior|valueConverter/))
      )
    );

    const graphNodeBuilder = new FilteringObjectBuilderNode(
      new Postprocessor(
        new CompositeObjectBuilderNode(
          new ClassBuilder(),
          new FunctionBuilder(),
          new VariableBuilder(),
          new ModuleImportBuilder(),
          new ModuleExportsBuilder(),
          new MethodBuilder(),
          new ConstructorBuilder(),
          new PropertyBuilder(),
          new ParameterBuilder()
        ),
        new DecoratorAssigner(new DecoratorsQuery())
      ),
      hasParentSymbol
    );
    const graphBuilder = new CompositeObjectBuilderNode(
      new ModuleBuilder(),
      new DecoratorBuilder(),
      new FilteringObjectBuilderNode(new OmitObjectRelay(), isBindingBehavior),
      graphNodeBuilder,
      new NameBuilder(),
      new ExpressionResidueCollector(),
      new SkippableNodeResidueCollector()
    );

    this.context = new ObjectContext(
      new CompositeObjectBuilderNode(
        new ParentChildLinker(),
        new FilteringObjectBuilderNode(graphBuilder, new IsTypeScriptSyntaxSpecification()),
        new ArgumentBuilder(),
        new TextResidueCollector(),
        new OptionalResidueCollector(),
        new TerminatingBuilder()
      )
    );
  }

  public create(...sourceFiles: ts.SourceFile[]): StaticModuleConfiguration {
    const config = new StaticModuleConfiguration();
    for (const sourceFile of sourceFiles) {
      const mod = this.context.resolve(sourceFile) as AST.IModule;
      if (!(mod instanceof OmitObject) && mod.items.some(i => i.kind === AST.NodeKind.Class)) {
        config.modules.push(mod);
        mod.parent = config;
      }
    }
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

export class ExpressionResidueCollector implements IObjectBuilder {
  public create(request: ts.Node, context: IObjectContext): any[] | object | string | symbol {
    switch (request.kind) {
      case ts.SyntaxKind.StringLiteral:
      case ts.SyntaxKind.NumericLiteral:
      case ts.SyntaxKind.RegularExpressionLiteral: {
        const expr = request as ts.RegularExpressionLiteral;
        return expr.text;
      }
      case ts.SyntaxKind.ArrayLiteralExpression: {
        const expr = request as ts.ArrayLiteralExpression;
        const output: any[] = [];
        for (const element of expr.elements) {
          output.push(context.resolve(OptionalRequest.for(element)));
        }
        return output;
      }
      case ts.SyntaxKind.ObjectLiteralExpression: {
        const expr = request as ts.ObjectLiteralExpression;
        const output = {};
        for (const property of expr.properties) {
          let propertyName: string;
          let propertyValue: any;
          switch (property.kind) {
            case ts.SyntaxKind.PropertyAssignment: {
              propertyName = context.resolve(property.name);
              const defaultSymbol = Symbol();
              propertyValue = context.resolve(OptionalRequest.for(property.initializer).withDefault(defaultSymbol));
              if (propertyValue !== defaultSymbol) {
                output[propertyName] = propertyValue;
              }
            }
            default: {
              continue;
            }
          }
        }
      }
      default: {
        return NoObject;
      }
    }
  }
}

/**
 * Tries to retrieve raw text from syntax nodes that could not be resolved by other builders
 */
export class TextResidueCollector implements IObjectBuilder {
  public create(request: any, context: IObjectContext): string | symbol {
    if (request === undefined) {
      return undefined;
    }
    if (!!request.text && request.text.length) {
      return request.text;
    }
    if (!!request.escapedText && request.escapedText.length) {
      return request.escapedText;
    }

    switch (request.kind) {
      case ts.SyntaxKind.AnyKeyword: {
        return undefined;
      }
      case ts.SyntaxKind.BooleanKeyword: {
        return 'boolean';
      }
      case ts.SyntaxKind.NumberKeyword: {
        return 'number';
      }
      case ts.SyntaxKind.StringKeyword: {
        return 'string';
      }
      case ts.SyntaxKind.NullKeyword: {
        return 'null';
      }
      case ts.SyntaxKind.UndefinedKeyword: {
        return 'undefined';
      }
      case ts.SyntaxKind.TrueKeyword: {
        return 'true';
      }
      case ts.SyntaxKind.FalseKeyword: {
        return 'false';
      }
      case ts.SyntaxKind.UnionType: {
        const union = request as ts.UnionType;
        const types: string[] = [];
        for (const type of union.types) {
          types.push(context.resolve(type));
        }
        return types.join('|');
      }
      case ts.SyntaxKind.IntersectionType: {
        const union = request as ts.UnionType;
        const types: string[] = [];
        for (const type of union.types) {
          types.push(context.resolve(type));
        }
        return types.join('&');
      }
      default: {
        return NoObject;
      }
    }
  }
}

export class OptionalResidueCollector implements IObjectBuilder {
  public readonly defaultValue: any;

  private requestStack: OptionalRequest[] = [];
  private currentRequest: OptionalRequest;

  constructor(defaultValue: any = null) {
    this.defaultValue = defaultValue;
  }

  public create(request: OptionalRequest, context: IObjectContext): string | symbol {
    if (!(request instanceof OptionalRequest)) {
      if (request === this.currentRequest.innerRequest) {
        let defaultValue = this.defaultValue;
        if (this.currentRequest.defaultValue !== undefined) {
          defaultValue = this.currentRequest.defaultValue;
        }
        this.currentRequest = this.requestStack.pop();
        return defaultValue;
      }
      return NoObject;
    }

    this.requestStack.push((this.currentRequest = request));
    return context.resolve(request.innerRequest);
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

export class SkippableNodeResidueCollector implements IObjectBuilder {
  public create(request: ts.Node, context: IObjectContext): any {
    if (!request[parentSymbol]) {
      return NoObject;
    }
    const parent = request[parentSymbol] as AST.INode;
    // Make sure we can only return OmitObject to builders that know about it
    if (
      request.kind !== ts.SyntaxKind.SourceFile &&
      parent.kind !== AST.NodeKind.Module &&
      parent.kind !== AST.NodeKind.Class
    ) {
      return NoObject;
    }
    switch (request.kind) {
      case ts.SyntaxKind.GetAccessor:
      case ts.SyntaxKind.SetAccessor:
      case ts.SyntaxKind.ExpressionStatement:
      case ts.SyntaxKind.ModuleDeclaration:
      case ts.SyntaxKind.ExportAssignment: {
        return new OmitObject(request);
      }
      default: {
        return NoObject;
      }
    }
  }
}

export class OmitObjectRelay implements IObjectBuilder {
  public create(request: any, context: IObjectContext): OmitObject {
    return new OmitObject(request);
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

export class ClassNameSpecification implements IRequestSpecification {
  public name: RegExp;
  constructor(name: RegExp) {
    this.name = name;
  }

  public isSatisfiedBy(request: ts.ClassDeclaration): boolean {
    if (request.kind !== ts.SyntaxKind.ClassDeclaration || !request.name) {
      return false;
    }
    const name = request.name.text || (request.name.escapedText as string);
    return this.name.test(name);
  }
}

export class DecoratorNameSpecification implements IRequestSpecification {
  public name: RegExp;
  constructor(name: RegExp) {
    this.name = name;
  }

  public isSatisfiedBy(request: ts.Decorator): boolean {
    if (request.kind !== ts.SyntaxKind.Decorator || request.expression.kind !== ts.SyntaxKind.CallExpression) {
      return false;
    }
    const callExpression = request.expression as ts.CallExpression;
    const callee = callExpression.expression as any;
    const name = callee.text || (callee.escapedText as string);
    return this.name.test(name);
  }
}
