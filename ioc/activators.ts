import { IActivator, IRequirement, IPair } from "./interfaces";
import { DependencyType } from "./types";
import { DependencyMap } from "./container";

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
  private type: DependencyType;
  private requirements: IRequirement[];
  private providers: DependencyMap;

  constructor(type: DependencyType, requirements: IRequirement[], providers: DependencyMap) {
    this.type = type;
    this.requirements = requirements;
    this.providers = providers;
  }

  public activate(): any {
    // static code analysis stuff inc
    // for now, just naively (and inefficiently) go for the constructor
    let constructorKey: IPair<PropertyKey, PropertyDescriptor>;
    const dependencyGroups = new Map<IPair<PropertyKey, PropertyDescriptor>, IRequirement[]>();
    for (const req of this.requirements) {
      const key = req.injectionPoint.getMember();
      if (dependencyGroups.has(key)) {
        dependencyGroups.get(key).push(req);
      } else {
        dependencyGroups.set(key, [req]);
      }
      if (key.left.toString() === "constructor") {
        constructorKey = key;
      }
    }
    const type = this.type.ctor as any;
    if (constructorKey !== undefined) {
      const constructorDeps = dependencyGroups.get(constructorKey);
      const deps = constructorDeps.map(d => this.providers.get(d).activate());
      if (type !== undefined) {
        return new type(...deps);
      }
    }
    if (this.requirements.length === 0) {
      return new type();
    }
    throw new Error(`Could not activate class ${this.type.name}`);
  }
  public getType(): DependencyType {
    return this.type;
  }
}
