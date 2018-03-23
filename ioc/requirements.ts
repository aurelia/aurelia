import { BasicInjectionPoint, SourceFileInjectionPoint, ParameterInjectionPoint } from './injection-point';
import { IRequirement, IInjectionPoint, IFulfillment, IPair } from './interfaces';
import { DependencyType, isConstructor, getParamTypes, getClassSyntaxFromCtorParameter } from './types';
import { ClassFulfillment, NullFulfillment } from './fulfillments';
import { INode, getSourceFilePath } from './analysis/ast';
import { metadata } from 'aurelia-metadata';
import * as AST from './analysis/ast';

export class Requirements {
  public static create(type: DependencyType | INode): IRequirement {
    if ((type as INode).isAnalysisASTNode) {
      const node = type as INode;
      return new BuildtimeRequirement(new BasicInjectionPoint(type));
    } else {
      return new RuntimeRequirement(new BasicInjectionPoint(type));
    }
  }
}

export class BuildtimeRequirement implements IRequirement {
  public readonly isRequirement: true = true;
  public readonly requiredType: DependencyType;
  public readonly injectionPoint: IInjectionPoint;
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
          const $class = getClassSyntaxFromCtorParameter(param);
          const ip = new SourceFileInjectionPoint(type, $class, param, type.ctor.parameters.indexOf(param), {
            left: 'constructor',
            right: null
          });
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
      const member: IPair<PropertyKey, PropertyDescriptor> = {
        left: 'constructor',
        right: Object.getOwnPropertyDescriptor((ctor as any).prototype, 'constructor')
      };
      const paramTypes = getParamTypes(ctor);

      for (const paramType of paramTypes) {
        const ip = new ParameterInjectionPoint(type, paramType, member, paramTypes.indexOf(paramType));
        requirements.push(new RuntimeRequirement(ip));
      }
    }

    return requirements;
  }
}
