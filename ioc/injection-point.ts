import { IInjectionPoint, IPair } from "./interfaces";
import { DependencyType } from "./types";

export class BasicInjectionPoint implements IInjectionPoint {
  public type: DependencyType;
  public isOptional: boolean;

  constructor(type: DependencyType, isOptional: boolean = false) {
    this.type = type;
    this.isOptional = isOptional;
  }

  public getMember(): IPair<PropertyKey, PropertyDescriptor> {
    return null;
  }
}
