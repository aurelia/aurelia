import { BasicInjectionPoint, RuntimeParameterInjectionPoint, BuildtimeParameterInjectionPoint } from './injection-point';
import { IRequirement, IInjectionPoint, IFulfillment, IPair } from './interfaces';
import {
  DependencyType,
  isConstructor,
  getParamTypes,
  getTypeSourceFromCtorParameter,
  isASTNode,
  Pair
} from './types';
import { ClassFulfillment, NullFulfillment, Fulfillments, SyntaxFulfillment } from './fulfillments';
import { INode, getSourceFilePath } from './analysis/ast';
import { metadata } from 'aurelia-metadata';
import * as AST from './analysis/ast';

export class Requirements {
  public static create(type: DependencyType): IRequirement;
  public static create(astNode: INode): IRequirement;
  public static create(typeOrAstNode: DependencyType | INode): IRequirement {
    if (isASTNode(typeOrAstNode)) {
      return new BuildtimeRequirement(new BasicInjectionPoint(typeOrAstNode));
    } else {
      return new RuntimeRequirement(new BasicInjectionPoint(typeOrAstNode));
    }
  }
}

export class BuildtimeRequirement implements IRequirement {
  public readonly isRequirement: true = true;
  public readonly requiredType: AST.INode;
  public readonly injectionPoint: IInjectionPoint;
  private fulfillment: IFulfillment;

  constructor(injectionPoint: IInjectionPoint, requiredType?: AST.INode, fulfillment?: IFulfillment) {
    this.injectionPoint = injectionPoint;
    this.requiredType = requiredType || (injectionPoint.type as any);
    if (fulfillment === undefined) {
      if (
        this.requiredType !== null &&
        this.requiredType !== undefined &&
        this.requiredType.kind === AST.NodeKind.Class
      ) {
        fulfillment = new SyntaxFulfillment(this.requiredType);
      } else if (injectionPoint.isOptional) {
        fulfillment = new NullFulfillment(this.requiredType);
      }
    }
    this.fulfillment = fulfillment;
  }

  public isInstantiable(): boolean {
    return this.fulfillment !== undefined && this.fulfillment !== null;
  }
  public getFulfillment(): IFulfillment {
    return this.fulfillment;
  }
  public restrict(typeOrFulfillment: DependencyType | IFulfillment): IRequirement {
    if ((typeOrFulfillment as IFulfillment).isFulfillment) {
      return new RuntimeRequirement(this.injectionPoint, null, typeOrFulfillment as IFulfillment);
    } else {
      return new RuntimeRequirement(this.injectionPoint, typeOrFulfillment, null);
    }
  }
  public isEqualTo(other: BuildtimeRequirement): boolean {
    if (!(other instanceof BuildtimeRequirement)) {
      return false;
    }
    return (
      other.requiredType === this.requiredType &&
      other.injectionPoint.isEqualTo(this.injectionPoint) &&
      (!other.fulfillment ? !this.fulfillment : other.fulfillment.isEqualTo(this.fulfillment))
    );
  }

  public static getRequirements(type: AST.INode): IRequirement[] {
    const requirements: IRequirement[] = [];

    if (type.kind === AST.NodeKind.Class) {
      if (type.ctor !== undefined) {
        for (const param of type.ctor.parameters) {
          const typeSource = getTypeSourceFromCtorParameter(param);
          const ip = new BuildtimeParameterInjectionPoint(
            type,
            typeSource || param,
            param,
            type.ctor.parameters.indexOf(param),
            new Pair('constructor', null)
          );
          requirements.push(new BuildtimeRequirement(ip));
        }
      }
    }

    return requirements;
  }
}

export class RuntimeRequirement implements IRequirement {
  public readonly isRequirement: true = true;
  public readonly injectionPoint: IInjectionPoint;
  public readonly requiredType: DependencyType;
  private fulfillment: IFulfillment;

  constructor(injectionPoint: IInjectionPoint, requiredType?: DependencyType, fulfillment?: IFulfillment) {
    this.injectionPoint = injectionPoint;
    this.requiredType = requiredType || injectionPoint.type;
    if (fulfillment === undefined) {
      if (isConstructor(this.requiredType)) {
        fulfillment = new ClassFulfillment(this.requiredType as FunctionConstructor);
      } else if (injectionPoint.isOptional) {
        fulfillment = new NullFulfillment(this.requiredType);
      }
    }
    this.fulfillment = fulfillment;
  }
  public isInstantiable(): boolean {
    return this.fulfillment !== undefined;
  }
  public getFulfillment(): IFulfillment {
    return this.fulfillment;
  }
  public restrict(typeOrFulfillment: DependencyType | IFulfillment): IRequirement {
    if ((typeOrFulfillment as IFulfillment).isFulfillment) {
      return new RuntimeRequirement(this.injectionPoint, null, typeOrFulfillment as IFulfillment);
    } else {
      return new RuntimeRequirement(this.injectionPoint, typeOrFulfillment, null);
    }
  }
  public isEqualTo(other: RuntimeRequirement): boolean {
    if (!(other instanceof RuntimeRequirement)) {
      return false;
    }
    return (
      other.requiredType === this.requiredType &&
      other.injectionPoint.isEqualTo(this.injectionPoint) &&
      (!other.fulfillment ? !this.fulfillment : other.fulfillment.isEqualTo(this.fulfillment))
    );
  }

  public static getRequirements(type: DependencyType): IRequirement[] {
    const requirements: IRequirement[] = [];

    if (isConstructor(type)) {
      const ctor = type as FunctionConstructor;
      const member = new Pair('constructor', Object.getOwnPropertyDescriptor((ctor as any).prototype, 'constructor'));
      const paramTypes = getParamTypes(ctor);

      for (const paramType of paramTypes) {
        const ip = new RuntimeParameterInjectionPoint(type, paramType, member, paramTypes.indexOf(paramType));
        requirements.push(new RuntimeRequirement(ip));
      }
    }

    return requirements;
  }
}
