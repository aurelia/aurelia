import { IFulfillment, IRequirement, IActivator } from "./interfaces";
import { DependencyType, Lifetime } from "./types";
import { DependencyMap } from "./container";
import { StaticAnalysisRequirement } from "./requirements";
import { ClassActivator } from "./activators";

export class Fulfillments {
  public static type(type: DependencyType): IFulfillment {
    return new ClassFulfillment(type);
  }
}

export class ClassFulfillment implements IFulfillment {
  private type: DependencyType;

  constructor(type: DependencyType) {
    this.type = type;
  }

  public getType(): DependencyType {
    return this.type;
  }
  public getDefaultLifetime(): Lifetime {
    return Lifetime.Singleton;
  }
  public getRequirements(): IRequirement[] {
    return StaticAnalysisRequirement.getRequirements(this.type);
  }
  public makeActivator(dependencies: DependencyMap): IActivator {
    return new ClassActivator(this.type, this.getRequirements(), dependencies);
  }
}
