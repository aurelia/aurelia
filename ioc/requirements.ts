import { BasicInjectionPoint } from "./injection-point";
import { IRequirement, IInjectionPoint, IFulfillment } from "./interfaces";
import { DependencyType, Types, NullFulfillment } from "./types";
import { ClassFulfillment } from "./fulfillments";

export class Requirements {
  public static create(type: DependencyType): IRequirement {
    return new StaticAnalysisRequirement(Requirements.createInjectionPoint(type));
  }

  public static createInjectionPoint(type: DependencyType): IInjectionPoint {
    return new BasicInjectionPoint(type);
  }
}

export class StaticAnalysisRequirement implements IRequirement {
  public readonly injectionPoint: IInjectionPoint;
  public readonly requiredType: DependencyType;
  private fulfillment: IFulfillment;

  constructor(injectionPoint: IInjectionPoint, requiredType?: DependencyType, fulfillment?: IFulfillment) {
    this.injectionPoint = injectionPoint;
    this.requiredType = requiredType || injectionPoint.type;
    if (fulfillment === undefined) {
      if (Types.isActivatable(this.requiredType)) {
        fulfillment = new ClassFulfillment(this.requiredType);
      } else if (injectionPoint.isOptional) {
        fulfillment = new NullFulfillment(this.requiredType);
      }
    }
    this.fulfillment = fulfillment;
  }
  public isInstantiable(): boolean {
    return true; // 
  }
  public getFulfillment(): IFulfillment {
    return this.fulfillment;
  }
  public restrict(typeOrFulfillment: DependencyType | IFulfillment): IRequirement {
    if (typeOrFulfillment instanceof DependencyType) {
      return new StaticAnalysisRequirement(this.injectionPoint, typeOrFulfillment, null);
    } else {
      return new StaticAnalysisRequirement(this.injectionPoint, null, typeOrFulfillment);
    }
  }

  public static getRequirements(type: DependencyType): IRequirement[] {
    // static code analysis stuff inc
    return [];
  }
}
