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
  TerminatingBuilder,
  AndSpecification,
  OrSpecification
} from '../composition/core';
import { StaticModuleConfiguration } from '../static-module-configuration';
import { IInjector, IModuleConfiguration } from '../interfaces';
import { InjectorBuilder } from '../injector';
import { StaticDIConfiguration } from '../static-di-configuration';
import { SyntaxEmitResult } from '../activators';
import { IsTypeScriptSyntaxSpecification } from './specifications';
import { Pair } from '../types';

export class DependencyInjectionCodeGenerator {
  private readonly context: IObjectContext;

  constructor() {
    this.context = new ObjectContext(
      new CompositeObjectBuilderNode(
        new FilteringObjectBuilderNode(new ClassActivatorBuilder(), new IsSyntaxEmitResultSpecification()),
        new FilteringObjectBuilderNode(new ClassDependencyActivatorBuilder(), new IsActivatorRequestSpecification()),
        new FilteringObjectBuilderNode(new DependencyActivatorRegistrator(), new IsRegistratorRequestSpecification()),
        new TerminatingBuilder()
      )
    );
  }

  public create(moduleConfig: StaticModuleConfiguration): StaticDIConfiguration {
    const injector = InjectorBuilder.create(moduleConfig).build();
    const diConfig = new StaticDIConfiguration();

    const classes = moduleConfig.modules
      .map(m => m.items.filter(i => i.kind === AST.NodeKind.Class))
      .reduce((prev, cur) => prev.concat(cur), []) as AST.IClass[];

    for (const cls of classes) {
      const result = injector.getInstance<SyntaxEmitResult>(cls);
      if (cls !== result.node) {
        throw new Error('node mismatch');
      }

      const activatorDeclaration = this.context.resolve(result) as ts.ClassDeclaration;
      const activatorRegistrator = this.context.resolve(result) as ts.CallExpression;
      const sourceFile = getFile(cls);
      const newSourceFile = ts.updateSourceFileNode(sourceFile, [
        ...sourceFile.statements,
        activatorDeclaration,
        ts.createStatement(activatorRegistrator)
      ]);

      diConfig.fileMap.set(cls.parent, newSourceFile);
    }

    return diConfig;
  }
}

export class ClassActivatorBuilder implements IObjectBuilder {
  public create(request: SyntaxEmitResult, context: IObjectContext): ts.ClassDeclaration | symbol {
    if (request.node.kind !== AST.NodeKind.Class) return NoObject;

    const args: ts.Expression[] = [];
    for (const dep of request.dependencies) {
      const arg = context.resolve(new ActivatorRequest(dep.node));
      args.push(arg);
    }
    const output = ts.createClassDeclaration(
      [],
      [],
      `$${request.node.name}Activator`,
      [],
      [],
      ts.createNodeArray([
        ts.createProperty([], [], 'instance', null, null, null),
        ts.createMethod(
          [],
          [],
          null,
          'activate',
          null,
          [],
          [],
          null,
          ts.createBlock(
            ts.createNodeArray([
              ts.createIf(
                ts.createLogicalNot(ts.createPropertyAccess(ts.createThis(), 'instance')),
                ts.createStatement(
                  ts.createAssignment(
                    ts.createPropertyAccess(ts.createThis(), 'instance'),
                    ts.createNew(ts.createIdentifier(request.node.name), [], ts.createNodeArray(args))
                  )
                )
              ),
              ts.createReturn(ts.createPropertyAccess(ts.createThis(), 'instance'))
            ])
          )
        )
      ])
    );

    return output;
  }
}

export class ClassDependencyActivatorBuilder implements IObjectBuilder {
  public create(request: ActivatorRequest, context: IObjectContext): ts.Expression | symbol {
    if (
      request.node.kind !== AST.NodeKind.Class &&
      request.node.kind !== AST.NodeKind.ModuleImport &&
      request.node.kind !== AST.NodeKind.ModuleExport
    ) {
      return NoObject;
    }

    const output = ts.createCall(
      ts.createPropertyAccess(
        ts.createPropertyAccess(ts.createIdentifier('DefaultInjector'), 'INSTANCE'),
        'getInstance'
      ),
      [],
      ts.createNodeArray([ts.createIdentifier(request.node.name)])
    );

    return output;
  }
}

export class DependencyActivatorRegistrator implements IObjectBuilder {
  public create(request: RegistratorRequest, context: IObjectContext): ts.CallExpression | symbol {
    if (
      request.node.kind !== AST.NodeKind.Class &&
      request.node.kind !== AST.NodeKind.ModuleImport &&
      request.node.kind !== AST.NodeKind.ModuleExport
    ) {
      return NoObject;
    }

    const output = ts.createCall(
      ts.createPropertyAccess(ts.createIdentifier('DefaultInjector'), 'addActivator'),
      [],
      ts.createNodeArray([
        ts.createIdentifier(request.node.name),
        ts.createNew(ts.createIdentifier(`$${request.node.name}Activator`), [], [])
      ])
    );

    return output;
  }
}

export class RegistratorRequest {
  public readonly node: AST.INode;
  constructor(node: AST.INode) {
    this.node = node;
  }
}

export class ActivatorRequest {
  public readonly node: AST.INode;
  constructor(node: AST.INode) {
    this.node = node;
  }
}

export class IsRegistratorRequestSpecification implements IRequestSpecification {
  public isSatisfiedBy(request: any): boolean {
    return request instanceof RegistratorRequest;
  }
}

export class IsActivatorRequestSpecification implements IRequestSpecification {
  public isSatisfiedBy(request: any): boolean {
    return request instanceof ActivatorRequest;
  }
}

export class IsSyntaxEmitResultSpecification implements IRequestSpecification {
  public isSatisfiedBy(request: any): boolean {
    return request instanceof SyntaxEmitResult;
  }
}

function getFile(node: AST.INode): ts.SourceFile {
  let config: any = node;
  while (!(config as any).files) {
    config = config.parent;
  }
  let $module: any = node;
  while ($module.kind !== AST.NodeKind.Module) {
    $module = $module.parent;
  }
  const files = config.files as ts.SourceFile[];
  return files.find(f => f.fileName === $module.path);
}
