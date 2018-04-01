import { IInjectionPoint, IPair } from './interfaces';
import { DependencyType } from './types';

export class BasicInjectionPoint implements IInjectionPoint {
  public target: DependencyType = null;
  public type: DependencyType;
  public isOptional: boolean;
  public parameterIndex: number = -1;

  constructor(type: DependencyType, isOptional: boolean = false) {
    this.type = type;
    this.isOptional = isOptional;
  }

  public getMember(): IPair<PropertyKey, PropertyDescriptor> {
    return null;
  }
  public isEqualTo(other: BasicInjectionPoint): boolean {
    return other.type === this.type;
  }
}

export class RuntimeParameterInjectionPoint implements IInjectionPoint {
  public target: DependencyType;
  public type: DependencyType;
  public member: IPair<PropertyKey, PropertyDescriptor>;
  public isOptional: boolean;
  public parameterIndex: number;

  constructor(
    target: DependencyType,
    type: DependencyType,
    member: IPair<PropertyKey, PropertyDescriptor>,
    parameterIndex: number,
    isOptional: boolean = false
  ) {
    this.target = target;
    this.type = type;
    this.member = member;
    this.parameterIndex = parameterIndex;
    this.isOptional = isOptional;
  }

  public getMember(): IPair<PropertyKey, PropertyDescriptor> {
    return this.member;
  }
  public isEqualTo(other: RuntimeParameterInjectionPoint): boolean {
    return (
      other.type === this.type &&
      other.member.left === this.member.left &&
      other.parameterIndex === this.parameterIndex
    );
  }
}
