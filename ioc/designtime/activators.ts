import * as AST from './ast';
import { DependencyType } from '../runtime/types';
import { IActivator, IRequirement } from '../runtime/interfaces';
import { DependencyMap } from '../runtime/container';

export class EmitSyntaxActivator implements IActivator {
  public readonly type: DependencyType;
  private requirements: IRequirement[];
  private providers: DependencyMap;

  constructor(type: AST.INode, requirements: IRequirement[], providers: DependencyMap) {
    this.type = type;
    this.requirements = requirements;
    this.providers = providers;
  }

  public activate(): SyntaxEmitResult {
    const dependencyGroups = new Map<string, IRequirement[]>();
    for (const req of this.requirements) {
      const key = req.injectionPoint.getMember().left.toString();
      if (dependencyGroups.has(key)) {
        dependencyGroups.get(key).push(req);
      } else {
        dependencyGroups.set(key, [req]);
      }
    }
    const result = new SyntaxEmitResult(this.type as any);
    const constructorDeps = dependencyGroups.get('constructor');
    if (constructorDeps) {
      const providers = constructorDeps.map(d => this.providers.get(d));
      for (const dep of constructorDeps) {
        const provider = this.providers.get(dep);
        if (!provider) {
          throw new Error(
            `No provider found for dependency ${AST.toJSON(dep.requiredType as any)} -- ${
              (this.providers as any).requirements.size
            }`
          );
        }
        const depResult = provider.activate();
        result.dependencies.push(depResult);
      }
    }
    return result;
  }
}

export class SyntaxEmitResult {
  public node: AST.INode;
  public dependencies: SyntaxEmitResult[];
  constructor(node: AST.INode) {
    this.node = node;
    this.dependencies = [];
  }
}
