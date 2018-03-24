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
import { IInjector } from '../interfaces';
import { InjectorBuilder } from '../injector';
import { StaticDIConfiguration, StaticDependencyRegistration } from '../static-di-configuration';
import { SyntaxEmitResult } from '../activators';
import { IsTypeScriptSyntaxSpecification } from './specifications';
import { Pair } from '../types';

export class DependencyInjectionCodeGenerator {
  private readonly context: IObjectContext;

  constructor() {
    this.context = new ObjectContext(
      new CompositeObjectBuilderNode(
        new FilteringObjectBuilderNode(
          new CompositeObjectBuilderNode(
            new SiblingClassDependencyBuilder(),
            new InternalModuleDependencyBuilder(),
            new ExternalModuleDependencyBuilder()
          ),
          new IsTypeScriptSyntaxSpecification()
        ),
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

      const imports: string[] = [];
      const registrations: string[] = [];
      for (const dep of result.dependencies) {
        switch (dep.node.kind) {
          case AST.NodeKind.Class: {
            registrations.push(`DefaultInjector.INSTANCE.getInstance(${dep.node.name})`);
            break;
          }
          case AST.NodeKind.ModuleImport: {
            registrations.push(`DefaultInjector.INSTANCE.getInstance(${dep.node.name})`);
            break;
          }
          case AST.NodeKind.ModuleExport: {
            registrations.push(`DefaultInjector.INSTANCE.getInstance(${dep.node.name})`);
            break;
          }
        }
      }

      const registration = new StaticDependencyRegistration();
      const depActivation = registrations.join(',');
      registration.activatorClassDeclaration = `
      export class $${cls.name}Activator {
        instance;
        activate() {
          if (!this.instance) {
            this.instance = new ${cls.name}(${depActivation});
          }
          return this.instance;
        }
      }
    `;
      registration.activatorRegistrationExpression = `DefaultInjector.addActivator(${cls.name}, new $${
        cls.name
      }Activator());`;

      if (!diConfig.registrations.has(cls.parent)) {
        diConfig.registrations.set(cls.parent, []);
      }
      diConfig.registrations.get(cls.parent).push(registration);
    }

    return diConfig;
  }
}

export class SiblingClassDependencyBuilder implements IObjectBuilder {
  public create(request: AST.IClass, context: IObjectContext): string | symbol {
    if (request.kind !== AST.NodeKind.Class) return NoObject;

    return ''; //todo
  }
}

export class InternalModuleDependencyBuilder implements IObjectBuilder {
  public create(request: AST.IModuleImport, context: IObjectContext): string | symbol {
    if (request.kind !== AST.NodeKind.ModuleImport) return NoObject;

    return ''; //todo
  }
}

export class ExternalModuleDependencyBuilder implements IObjectBuilder {
  public create(request: AST.IModuleExport, context: IObjectContext): string | symbol {
    if (request.kind !== AST.NodeKind.ModuleExport) return NoObject;

    return ''; //todo
  }
}
