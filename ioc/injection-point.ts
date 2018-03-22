import { IInjectionPoint, IPair } from './interfaces';
import { DependencyType } from './types';

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
  public isEqualTo(other: BasicInjectionPoint): boolean {
    if (!(other instanceof BasicInjectionPoint)) {
      return false;
    }
    return other.type === this.type && other.isOptional === this.isOptional;
  }
}

export class SourceFileInjectionPoint implements IInjectionPoint {
  public type: DependencyType;
  public filePath: string;
  public isOptional: boolean;

  constructor(type: DependencyType, filePath: string, isOptional: boolean = false) {
    this.type = type;
    this.filePath = filePath;
    this.isOptional = isOptional;
  }

  public getMember(): IPair<PropertyKey, PropertyDescriptor> {
    return null;
  }
  public isEqualTo(other: SourceFileInjectionPoint): boolean {
    if (!(other instanceof SourceFileInjectionPoint)) {
      return false;
    }
    return other.type === this.type && other.isOptional === this.isOptional && other.filePath === this.filePath;
  }
}

export class ParameterInjectionPoint implements IInjectionPoint {
  public type: DependencyType;
  public member: IPair<PropertyKey, PropertyDescriptor>;
  public isOptional: boolean;

  constructor(type: DependencyType, member: IPair<PropertyKey, PropertyDescriptor>, isOptional: boolean = false) {
    this.type = type;
    this.member = member;
    this.isOptional = isOptional;
  }

  public getMember(): IPair<PropertyKey, PropertyDescriptor> {
    return this.member;
  }
  public isEqualTo(other: ParameterInjectionPoint): boolean {
    if (!(other instanceof ParameterInjectionPoint)) {
      return false;
    }
    return (
      other.type === this.type &&
      other.isOptional === this.isOptional &&
      other.member.left === this.member.left &&
      other.member.right.value === this.member.right.value
    );
  }
}
