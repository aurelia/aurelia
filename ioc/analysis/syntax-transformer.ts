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
        new OptionalResidueCollector(),
        //new TerminatingBuilder()
      )
    );
  }

  public create(...sourceFiles: ts.SourceFile[]): StaticModuleConfiguration {
    const config = new StaticModuleConfiguration(
      ...sourceFiles.map(s => this.context.resolve(s))
    );
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

export class ModuleBuilder implements IObjectBuilder {
  public create(request: ts.Node, context: IObjectContext): Partial<AST.INode> | symbol {
    if (request.kind !== ts.SyntaxKind.SourceFile) return NoObject;

    const sourceFile = request as ts.SourceFile;
    const output: AST.IModule = {
      kind: AST.NodeKind.Module,
      items: [],
      parent: null,
      path: sourceFile.fileName
    };

    for (const statement of sourceFile.statements) {
      const result = context.resolve(ChildNode.of(statement).withParentOutput(output));
      if (Array.isArray(result)) {
        output.items.push(...result);
      } else {
        output.items.push(result);
      }
    }

    return output;
  }
}

export class ClassBuilder implements IObjectBuilder {
  public create(request: ts.Node, context: IObjectContext): Partial<AST.INode> | symbol {
    if (request.kind !== ts.SyntaxKind.ClassDeclaration) return NoObject;

    const classDeclaration = request as ts.ClassDeclaration;
    const output: Partial<AST.IClass> = {
      kind: AST.NodeKind.Class,
      name: context.resolve(classDeclaration.name),
      ctor: null,
      members: [],
      decorators: classDeclaration.decorators as any
    };

    for (const element of classDeclaration.members) {
      const member = context.resolve(ChildNode.of(element).withParentOutput(output));
      if (element.kind === ts.SyntaxKind.Constructor) {
        output.ctor = member;
      }
    }

    return output;
  }
}

export class FunctionBuilder implements IObjectBuilder {
  public create(request: ts.Node, context: IObjectContext): Partial<AST.INode> | symbol {
    if (request.kind !== ts.SyntaxKind.FunctionDeclaration) return NoObject;

    const functionDeclaration = request as ts.FunctionDeclaration;
    const output: Partial<AST.IFunction> = {
      kind: AST.NodeKind.Function,
      name: context.resolve(functionDeclaration.name),
      parameters: [],
      decorators: functionDeclaration.decorators as any
    };
    for (const parameterDeclaration of functionDeclaration.parameters) {
      const parameter = context.resolve(ChildNode.of(parameterDeclaration).withParentOutput(output));
      output.parameters.push(parameter);
    }

    return output;
  }
}

export class VariableBuilder implements IObjectBuilder {
  public create(request: ts.Node, context: IObjectContext): Partial<AST.INode>[] | symbol {
    if (request.kind !== ts.SyntaxKind.VariableDeclaration) return NoObject;

    const output: Partial<AST.IVariable>[] = [];
    const variableStatement = request as ts.VariableStatement;
    for (const declaration of variableStatement.declarationList.declarations) {
      if (declaration.name.kind === ts.SyntaxKind.Identifier) {
        output.push({
          kind: AST.NodeKind.Variable,
          name: context.resolve(declaration.name),
          decorators: variableStatement.decorators as any
        });
      }
    }

    return output;
  }
}

export class ModuleImportBuilder implements IObjectBuilder {
  public create(request: ts.Node, context: IObjectContext): Partial<AST.INode>[] | symbol {
    if (request.kind !== ts.SyntaxKind.ImportDeclaration) return NoObject;

    const output: Partial<AST.IModuleImport>[] = [];
    const importDeclaration = request as ts.ImportDeclaration;
    const namedBindings = importDeclaration.importClause.namedBindings;
    if (namedBindings) {
      const path = context.resolve(OptionalRequest.for(importDeclaration.moduleSpecifier));
      switch (namedBindings.kind) {
        case ts.SyntaxKind.NamedImports: {
          for (const element of namedBindings.elements) {
            output.push({
              kind: AST.NodeKind.ModuleImport,
              path: path,
              name: context.resolve(element.name)
            });
          }
          break;
        }
        default: {
          break;
        }
      }
    }

    return output;
  }
}

export class ModuleExportsBuilder implements IObjectBuilder {
  public create(request: ts.Node, context: IObjectContext): Partial<AST.INode>[] | symbol {
    if (request.kind !== ts.SyntaxKind.ExportDeclaration) return NoObject;

    const output: Partial<AST.IModuleExport>[] = [];
    const exportDeclaration = request as ts.ExportDeclaration;
    if (exportDeclaration.exportClause) {
      const path = context.resolve(OptionalRequest.for(exportDeclaration.moduleSpecifier));
      for (const element of exportDeclaration.exportClause.elements) {
        output.push({
          kind: AST.NodeKind.ModuleExport,
          declaration: null,
          path: path,
          name: context.resolve(element.name)
        });
      }
    }

    return output;
  }
}

export class CallExpressionBuilder implements IObjectBuilder {
  public create(request: ts.Node, context: IObjectContext): Partial<AST.INode> | symbol {
    if (request.kind !== ts.SyntaxKind.CallExpression) return NoObject;

    return {}; //todo
  }
}

export class DecoratorBuilder implements IObjectBuilder {
  public create(request: ts.Decorator, context: IObjectContext): Partial<AST.INode> | symbol {
    if (request.kind !== ts.SyntaxKind.Decorator) return NoObject;

    const callExpression = request.expression as ts.CallExpression;
    const expressionText = context.resolve(callExpression.expression);
    const output: Partial<AST.IDecorator> = {
      kind: AST.NodeKind.Decorator,
      name: expressionText,
      arguments: [],
      text: expressionText //todo: raw string?
    };

    return output;
  }
}

export class MethodBuilder implements IObjectBuilder {
  public create(request: ts.Node, context: IObjectContext): Partial<AST.INode> | symbol {
    if (request.kind !== ts.SyntaxKind.MethodDeclaration) return NoObject;

    const methodDeclaration = request as ts.MethodDeclaration;
    const output: Partial<AST.IMethod> = {
      kind: AST.NodeKind.Method,
      name: context.resolve(methodDeclaration.name),
      parameters: []
    };
    for (const parameterDeclaration of methodDeclaration.parameters) {
      const parameter = context.resolve(ChildNode.of(parameterDeclaration).withParentOutput(output));
      output.parameters.push(parameter);
    }

    return output;
  }
}

export class ConstructorBuilder implements IObjectBuilder {
  public create(request: ts.Node, context: IObjectContext): Partial<AST.INode> | symbol {
    if (request.kind !== ts.SyntaxKind.Constructor) return NoObject;

    const constructorDeclaration = request as ts.ConstructorDeclaration;
    const output: Partial<AST.IConstructor> = {
      kind: AST.NodeKind.Constructor,
      name: "constructor",
      parameters: []
    };
    for (const parameterDeclaration of constructorDeclaration.parameters) {
      const parameter = context.resolve(ChildNode.of(parameterDeclaration).withParentOutput(output));
      output.parameters.push(parameter);
    }

    return output;
  }
}

export class PropertyBuilder implements IObjectBuilder {
  public create(request: ts.Node, context: IObjectContext): Partial<AST.INode> | symbol {
    if (request.kind !== ts.SyntaxKind.PropertyDeclaration) return NoObject;

    const propertyDeclaration = request as ts.PropertyDeclaration;
    const output: Partial<AST.IProperty> = {
      kind: AST.NodeKind.Property,
      name: context.resolve(propertyDeclaration.name)
    };

    return output;
  }
}

export class ParameterBuilder implements IObjectBuilder {
  public create(request: ts.Node, context: IObjectContext): Partial<AST.INode> | symbol {
    if (request.kind !== ts.SyntaxKind.Parameter) return NoObject;

    const parameterDeclaration = request as ts.ParameterDeclaration;
    const name = context.resolve(parameterDeclaration.name);
    const typeName = context.resolve(parameterDeclaration.type);
    const output: Partial<AST.IParameter> = {
      kind: AST.NodeKind.Parameter,
      name: name,
      typeName: typeName,
      text: name,
      decorators: parameterDeclaration.decorators as any
    };

    return output;
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
