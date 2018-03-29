import { IFulfillment, IRequirement, IActivator } from './interfaces';
import { DependencyType, Lifetime } from './types';
import { RuntimeRequirement } from './requirements';
import { DependencyMap } from './container';
import { ClassActivator, Activators } from './activators';

export class Fulfillments {
  public static type(type: Function): IFulfillment {
    return new ClassFulfillment(type);
  }

  public static null(type: DependencyType): IFulfillment {
    return new NullFulfillment(type);
  }

  public static instance(type: DependencyType, instance: any): IFulfillment {
    return new InstanceFulfillment(type, instance);
  }

  public static decorator(decorator: ParameterDecorator, fulfillment: IFulfillment): IFulfillment {
    return new DecoratorFulfillment(decorator, fulfillment);
  }
}

export class ClassFulfillment implements IFulfillment {
  public readonly isFulfillment: true = true;
  public readonly type: Function;

  constructor(type: Function) {
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
    return other.type === this.type;
  }
}

export class DecoratorFulfillment implements IFulfillment {
  public readonly isFulfillment: true = true;
  public readonly type: DependencyType;
  private fulfillment: IFulfillment;
  private decorator: ParameterDecorator;

  constructor(decorator: ParameterDecorator, fulfillment: IFulfillment) {
    this.decorator = decorator;
    this.fulfillment = fulfillment;
    this.type = fulfillment.type;
  }

  public getDefaultLifetime(): Lifetime {
    return this.fulfillment.getDefaultLifetime();
  }
  public getDependencies(): IRequirement[] {
    return this.fulfillment.getDependencies();
  }
  public makeActivator(dependencies: DependencyMap): IActivator {
    return this.fulfillment.makeActivator(dependencies);
  }
  public isEqualTo(other: DecoratorFulfillment): boolean {
    return other.decorator === this.decorator && other.isEqualTo(this);
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
    return other.instance === this.instance;
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
    return other.type === this.type;
  }
}
