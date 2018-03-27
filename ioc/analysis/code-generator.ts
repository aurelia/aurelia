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

export class CodeGeneratorRequest {
  public readonly config: StaticModuleConfiguration;
  public readonly result: SyntaxEmitResult;
  public readonly node: AST.INode;
  constructor(config: StaticModuleConfiguration, result: SyntaxEmitResult, node?: AST.INode) {
    this.config = config;
    this.result = result;
    this.node = node;
  }

  public of<T extends CodeGeneratorRequest>(
    type: { new (config: StaticModuleConfiguration, result: SyntaxEmitResult, node?: AST.INode): T },
    node: AST.INode
  ): T {
    return new type(this.config, this.result, node);
  }
}

export class DependencyInjectionCodeGenerator {
  private readonly context: IObjectContext;

  constructor() {
    this.context = new ObjectContext(
      new CompositeObjectBuilderNode(
        new ModuleImportBuilder(),
        new DIImportBuilder(),
        new ClassActivatorBuilder(),
        new DependencyActivatorInvocationBuilder(),
        new ActivatorRegistratorBuilder(),
        new TerminatingBuilder()
      )
    );
  }

  public create(config: StaticModuleConfiguration): StaticDIConfiguration {
    const injector = InjectorBuilder.create(config).build();
    const diConfig = new StaticDIConfiguration();

    const classes = config.modules
      .map(m => m.items.filter(i => i.kind === AST.NodeKind.Class))
      .reduce((prev, cur) => prev.concat(cur), []) as AST.IClass[];

    for (const cls of classes) {
      const result = injector.getInstance<SyntaxEmitResult>(cls);
      if (cls !== result.node) {
        throw new Error('node mismatch');
      }
      const request = new CodeGeneratorRequest(config, result);

      const imports = result.dependencies
        .concat(result)
        .map(d => this.context.resolve(request.of(ModuleImportRequest, d.node)))
        .concat(this.context.resolve(request.of(DIImportRequest, cls)));

      const activatorDeclaration = this.context.resolve(request.of(ClassActivatorRequest, cls));
      const activatorRegistrator = this.context.resolve(request.of(ActivatorRegistratorRequest, cls));
      const newSourceFile = ts.updateSourceFileNode(ts.createSourceFile(cls.parent.path, '', ts.ScriptTarget.Latest), [
        ...imports,
        activatorDeclaration,
        ts.createStatement(activatorRegistrator)
      ]);

      diConfig.fileMap.set(cls.parent, newSourceFile);
    }

    return diConfig;
  }
}

export class ClassActivatorRequest extends CodeGeneratorRequest {}
export class ClassActivatorBuilder implements IObjectBuilder {
  public create(request: ClassActivatorRequest, context: IObjectContext): ts.ClassDeclaration | symbol {
    if (!(request instanceof ClassActivatorRequest)) return NoObject;

    let name: string;
    switch (request.node.kind) {
      case AST.NodeKind.Class: {
        name = request.node.name;
        break;
      }
      default: {
        return NoObject;
      }
    }

    const args: ts.Expression[] = [];
    for (const dep of request.result.dependencies) {
      const arg = context.resolve(request.of(DependencyActivatorInvocationRequest, dep.node));
      args.push(arg);
    }
    const output = ts.createClassDeclaration(
      [],
      [],
      `$${name}Activator`,
      [],
      [],
      [
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
            [
              ts.createIf(
                ts.createBinary(
                  ts.createPropertyAccess(ts.createThis(), 'instance'),
                  ts.SyntaxKind.EqualsEqualsEqualsToken,
                  ts.createIdentifier('undefined')
                ),
                ts.createBlock(
                  [
                    ts.createStatement(
                      ts.createAssignment(
                        ts.createPropertyAccess(ts.createThis(), 'instance'),
                        ts.createNew(ts.createIdentifier(name), [], args)
                      )
                    )
                  ],
                  true
                )
              ),
              ts.createReturn(ts.createPropertyAccess(ts.createThis(), 'instance'))
            ],
            true
          )
        )
      ]
    );

    return output;
  }
}

export class DIImportRequest extends CodeGeneratorRequest {}
export class DIImportBuilder implements IObjectBuilder {
  public create(request: DIImportRequest, context: IObjectContext): ts.ImportDeclaration | symbol {
    if (!(request instanceof DIImportRequest)) return NoObject;

    const iocDir = request.config.rootDir.replace(/[\/\\]/g, '/');
    const iocDirParts = iocDir.split('/');
    let classPathParts: string[];
    switch (request.node.kind) {
      case AST.NodeKind.Class: {
        const classPath = request.node.parent.path.replace(/[\/\\]/g, '/');
        classPathParts = classPath.split('/');
        break;
      }
      default: {
        return NoObject;
      }
    }

    while (iocDirParts[0] === classPathParts[0]) {
      iocDirParts.shift();
      classPathParts.shift();
    }

    // remove the filename.ts part
    classPathParts.pop();

    // remove the /test part
    iocDirParts.pop();
    iocDirParts.push('injector');

    for (let i = 0; i < classPathParts.length; i++) {
      iocDirParts.unshift('..');
    }

    const iocPath = iocDirParts.join('/');
    const output = ts.createImportDeclaration(
      [],
      [],
      ts.createImportClause(
        null,
        ts.createNamedImports([ts.createImportSpecifier(null, ts.createIdentifier('DefaultInjector'))])
      ),
      ts.createLiteral(iocPath)
    );

    return output;
  }
}

export class ModuleImportRequest extends CodeGeneratorRequest {}
export class ModuleImportBuilder implements IObjectBuilder {
  public create(request: ModuleImportRequest, context: IObjectContext): ts.ImportDeclaration | symbol {
    if (!(request instanceof ModuleImportRequest)) return NoObject;

    let name: string;
    let path: string;
    switch (request.node.kind) {
      case AST.NodeKind.Class: {
        name = request.node.name;
        path = request.node.parent.path;
        break;
      }
      case AST.NodeKind.ModuleImport:
      case AST.NodeKind.ModuleExport: {
        name = request.node.name;
        path = request.node.path;
        break;
      }
      default: {
        return NoObject;
      }
    }

    if (request.node === request.result.node) {
      // this is the class for which we're generating the activator, which will have an absolute path + file extension
      // todo: should move this logic to the resolver that generates the emitresult
      path = path.split('/').pop();
      const ext = path.split('.').pop();
      path = path.substr(0, path.length - ext.length - 1);
      path = `./${path}`;
    }

    const output = ts.createImportDeclaration(
      [],
      [],
      ts.createImportClause(null, ts.createNamedImports([ts.createImportSpecifier(null, ts.createIdentifier(name))])),
      ts.createLiteral(path)
    );

    return output;
  }
}

export class DependencyActivatorInvocationRequest extends CodeGeneratorRequest {}
export class DependencyActivatorInvocationBuilder implements IObjectBuilder {
  public create(request: DependencyActivatorInvocationRequest, context: IObjectContext): ts.Expression | symbol {
    if (!(request instanceof DependencyActivatorInvocationRequest)) return NoObject;

    let name: string;
    switch (request.node.kind) {
      case AST.NodeKind.Class:
      case AST.NodeKind.ModuleImport:
      case AST.NodeKind.ModuleExport: {
        name = request.node.name;
        break;
      }
      default: {
        return NoObject;
      }
    }

    const output = ts.createCall(
      ts.createPropertyAccess(
        ts.createPropertyAccess(ts.createIdentifier('DefaultInjector'), 'INSTANCE'),
        'getInstance'
      ),
      [],
      [ts.createIdentifier(name)]
    );

    return output;
  }
}

export class ActivatorRegistratorRequest extends CodeGeneratorRequest {}
export class ActivatorRegistratorBuilder implements IObjectBuilder {
  public create(request: ActivatorRegistratorRequest, context: IObjectContext): ts.CallExpression | symbol {
    if (!(request instanceof ActivatorRegistratorRequest)) return NoObject;

    let name: string;
    switch (request.node.kind) {
      case AST.NodeKind.Class:
      case AST.NodeKind.ModuleImport:
      case AST.NodeKind.ModuleExport: {
        name = request.node.name;
        break;
      }
      default: {
        return NoObject;
      }
    }

    const output = ts.createCall(
      ts.createPropertyAccess(ts.createIdentifier('DefaultInjector'), 'addActivator'),
      [],
      [ts.createIdentifier(name), ts.createNew(ts.createIdentifier(`$${name}Activator`), [], [])]
    );

    return output;
  }
}
