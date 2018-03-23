import { IInjectionPoint, IPair } from './interfaces';
import { DependencyType } from './types';
import * as AST from './analysis/ast';

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
    if (!(other instanceof BasicInjectionPoint)) {
      return false;
    }
    return other.type === this.type && other.isOptional === this.isOptional;
  }
}

export class SourceFileInjectionPoint implements IInjectionPoint {
  /**
   * The target that needs to be instantiated
   */
  public target: AST.INode | null;

  /**
   * The type of the dependency to be injected
   */
  public type: AST.INode | null;

  /**
   * The target (typically parameter) node on which the dependency needs to be injected
   */
  public targetNode: AST.INode;
  public isOptional: boolean;
  public parameterIndex: number;
  public member: IPair<PropertyKey, PropertyDescriptor>;

  constructor(
    target: AST.INode | null,
    type: AST.INode | null,
    targetNode: AST.INode,
    parameterIndex: number,
    member: IPair<PropertyKey, PropertyDescriptor>,
    isOptional: boolean = false
  ) {
    this.target = target;
    this.type = type;
    this.targetNode = targetNode;
    this.isOptional = isOptional;
    this.parameterIndex = parameterIndex;
    this.member = member;
  }

  public getMember(): IPair<PropertyKey, PropertyDescriptor> {
    return this.member;
  }
  public isEqualTo(other: SourceFileInjectionPoint): boolean {
    if (!(other instanceof SourceFileInjectionPoint)) {
      return false;
    }
    return other.type === this.type && other.isOptional === this.isOptional && other.targetNode === this.targetNode;
  }
}

export class ParameterInjectionPoint implements IInjectionPoint {
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
