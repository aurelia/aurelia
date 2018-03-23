import { IFulfillment, IRequirement, IActivator } from './interfaces';
import { DependencyType, Lifetime } from './types';
import { DependencyMap } from './container';
import { RuntimeRequirement, BuildtimeRequirement } from './requirements';
import { ClassActivator, Activators, EmitSyntaxActivator } from './activators';
import * as AST from './analysis/ast';

export class Fulfillments {
  public static type(type: FunctionConstructor): IFulfillment {
    return new ClassFulfillment(type);
  }

  public static null(type: DependencyType): IFulfillment {
    return new NullFulfillment(type);
  }

  public static instance(type: DependencyType, instance: any): IFulfillment {
    return new InstanceFulfillment(type, instance);
  }

  public static syntax(type: AST.INode): IFulfillment {
    return new SyntaxFulfillment(type);
  }
}

export class ClassFulfillment implements IFulfillment {
  public readonly isFulfillment: true = true;
  public readonly type: FunctionConstructor;

  constructor(type: FunctionConstructor) {
    this.type = type;
  }

  public getDefaultLifetime(): Lifetime {
    return Lifetime.Singleton;
  }
  public getDependencies(): IRequirement[] {
    return RuntimeRequirement.getRequirements(this.type);
  }
  public makeActivator(dependencies: DependencyMap): IActivator {
    return new ClassActivator(this.type, this.getDependencies(), dependencies);
  }
  public isEqualTo(other: ClassFulfillment): boolean {
    if (!(other instanceof ClassFulfillment)) {
      return false;
    }
    return other.type === this.type;
  }
}

export class InstanceFulfillment implements IFulfillment {
  public readonly isFulfillment: true = true;
  public readonly type: DependencyType;
  private instance: any;

  constructor(type: DependencyType, instance: any) {
    this.type = type;
    this.instance = instance;
  }

  public getDefaultLifetime(): Lifetime {
    return Lifetime.Singleton;
  }
  public getDependencies(): IRequirement[] {
    return [];
  }
  public makeActivator(dependencies: DependencyMap): IActivator {
    return Activators.ofInstance(this.instance);
  }
  public isEqualTo(other: InstanceFulfillment): boolean {
    if (!(other instanceof InstanceFulfillment)) {
      return false;
    }
    return other.type === this.type && other.instance === this.instance;
  }
}

export class NullFulfillment implements IFulfillment {
  public readonly isFulfillment: true = true;
  public type: DependencyType;

  constructor(type: DependencyType) {
    this.type = type;
  }

  public getType(): DependencyType {
    return this.type;
  }
  public getDefaultLifetime(): Lifetime {
    return Lifetime.Singleton;
  }
  public getDependencies(): IRequirement[] {
    return [];
  }
  public makeActivator(dependencies: DependencyMap): IActivator {
    return Activators.ofNull(this.type);
  }
  public isEqualTo(other: NullFulfillment): boolean {
    if (!(other instanceof NullFulfillment)) {
      return false;
    }
    return other.type === this.type;
  }
}

export class SyntaxFulfillment implements IFulfillment {
  public readonly isFulfillment: true = true;
  public readonly type: AST.INode;

  constructor(type: AST.INode) {
    this.type = type;
  }

  public getDefaultLifetime(): Lifetime {
    return Lifetime.Singleton;
  }
  public getDependencies(): IRequirement[] {
    return BuildtimeRequirement.getRequirements(this.type);
  }
  public makeActivator(dependencies: DependencyMap): IActivator {
    return new EmitSyntaxActivator(this.type, this.getDependencies(), dependencies);
  }
  public isEqualTo(other: SyntaxFulfillment): boolean {
    if (!(other instanceof InstanceFulfillment)) {
      return false;
    }
    return other.type === this.type;
  }
}
