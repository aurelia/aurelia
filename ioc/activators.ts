import { IActivator, IRequirement, IPair } from './interfaces';
import { DependencyType, isConstructor } from './types';
import { DependencyMap } from './container';
import * as AST from './analysis/ast';

export class Activators {
  public static ofInstance(instance: any): IActivator {
    return new InstanceActivator(instance);
  }

  public static ofNull(type: DependencyType): IActivator {
    return new InstanceActivator(null, type);
  }

  public static ofSingleton(instantiator: IActivator): IActivator {
    return new SingletonActivator(instantiator);
  }
}

export class SingletonActivator implements IActivator {
  private delegate: IActivator;
  private instantiated: boolean = false;
  private instance: any = null;

  constructor(instantiator: IActivator) {
    this.delegate = instantiator;
  }

  public activate(): any {
    if (!this.instantiated) {
      this.instance = this.delegate.activate();
      this.instantiated = true;
    }

    return this.instance;
  }

  public getType(): DependencyType {
    return this.delegate.getType();
  }
}

export class InstanceActivator implements IActivator {
  private instance: any;
  private type: DependencyType;

  constructor(instance: any, type?: DependencyType) {
    this.instance = instance;
    this.type = type;
  }

  public activate(): any {
    return this.instance;
  }

  public getType(): DependencyType {
    return this.type;
  }
}

export class ClassActivator implements IActivator {
  private type: FunctionConstructor;
  private requirements: IRequirement[];
  private providers: DependencyMap;

  constructor(type: FunctionConstructor, requirements: IRequirement[], providers: DependencyMap) {
    this.type = type;
    this.requirements = requirements;
    this.providers = providers;
  }

  public activate(): any {
    let constructorKey: IPair<PropertyKey, PropertyDescriptor>;
    const dependencyGroups = new Map<IPair<PropertyKey, PropertyDescriptor>, IRequirement[]>();
    for (const req of this.requirements) {
      const key = req.injectionPoint.getMember();
      if (dependencyGroups.has(key)) {
        dependencyGroups.get(key).push(req);
      } else {
        dependencyGroups.set(key, [req]);
      }
      if (key.left.toString() === 'constructor') {
        constructorKey = key;
      }
    }
    //const type = isConstructor(this.type) ? this.type as any : null;
    if (constructorKey !== undefined) {
      const constructorDeps = dependencyGroups.get(constructorKey);
      const providers = constructorDeps.map(d => this.providers.get(d));
      const deps = providers.map(p => p.activate());
      if (isConstructor(this.type)) {
        return new this.type(...deps);
      }
    }
    if (this.requirements.length === 0) {
      return new this.type();
    }
    throw new Error(`Could not activate class ${this.type.name}`);
  }
  public getType(): DependencyType {
    return this.type;
  }
}

export class EmitSyntaxActivator implements IActivator {
  private type: AST.INode;
  private requirements: IRequirement[];
  private providers: DependencyMap;

  constructor(type: AST.INode, requirements: IRequirement[], providers: DependencyMap) {
    this.type = type;
    this.requirements = requirements;
    this.providers = providers;
  }

  public activate(): EmitResult {
    let constructorKey: IPair<PropertyKey, PropertyDescriptor>;
    const dependencyGroups = new Map<IPair<PropertyKey, PropertyDescriptor>, IRequirement[]>();
    for (const req of this.requirements) {
      const key = req.injectionPoint.getMember();
      if (dependencyGroups.has(key)) {
        dependencyGroups.get(key).push(req);
      } else {
        dependencyGroups.set(key, [req]);
      }
      if (key.left.toString() === 'constructor') {
        constructorKey = key;
      }
    }
    if (this.type.kind === AST.NodeKind.Class) {
      if (constructorKey !== undefined) {
        const constructorDeps = dependencyGroups.get(constructorKey);
        const providers = constructorDeps.map(d => this.providers.get(d));
        const deps = providers.map(p => p.activate()) as EmitResult[];
        const innerEmitResult = deps.map(d => (!!d ? d.text : 'null')).join(', ');
        return new EmitResult(`new ${this.type.name}(${innerEmitResult})`);
      }
      if (this.requirements.length === 0) {
        return new EmitResult(`new ${this.type.name}()`);
      }
    } else {
      return new EmitResult(''); // todo
    }
    throw new Error(`Could not activate class ${this.type.name}`);
  }
  public getType(): DependencyType {
    return this.type;
  }
}

export class EmitResult {
  public text: string;
  constructor(text: string) {
    this.text = text;
  }
}
