import * as AST from './ast';
import { IInjectionPoint, IPair } from '../runtime/interfaces';

export class DesigntimeParameterInjectionPoint implements IInjectionPoint {
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
  public isEqualTo(other: DesigntimeParameterInjectionPoint): boolean {
    return other.type === this.type && other.targetNode === this.targetNode;
  }
}
