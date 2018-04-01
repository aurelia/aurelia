import { IActivator } from './interfaces';
import { DependencyType } from './types';
import { IRequirement } from './interfaces';
import { DependencyMap } from './container';
import { IPair } from './interfaces';

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
  public readonly type: DependencyType;
  private delegate: IActivator;
  private instantiated: boolean = false;
  private instance: any = null;

  constructor(instantiator: IActivator) {
    this.delegate = instantiator;
    this.type = instantiator.type;
  }

  public activate(): any {
    if (!this.instantiated) {
      this.instance = this.delegate.activate();
      this.instantiated = true;
    }

    return this.instance;
  }
}

export class InstanceActivator implements IActivator {
  public readonly type: DependencyType;
  private instance: any;

  constructor(instance: any, type?: DependencyType) {
    this.instance = instance;
    this.type = type;
  }

  public activate(): any {
    return this.instance;
  }
}

export class ClassActivator implements IActivator {
  public readonly type: DependencyType;
  private requirements: IRequirement[];
  private providers: DependencyMap;

  constructor(type: Function, requirements: IRequirement[], providers: DependencyMap) {
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
      const depInstances = [];
      for (const dep of constructorDeps) {
        const provider = this.providers.get(dep);
        if (!provider) {
          throw new Error(`No provider found for dependency ${JSON.stringify(dep)}`);
        }
        const depInstance = provider.activate();
        depInstances.push(depInstance);
      }
      return new (this.type as any)(...depInstances);
    }
    if (this.requirements.length === 0) {
      return new (this.type as any)();
    }
    throw new Error(`Could not activate class ${(this.type as any).name}`);
  }
}
