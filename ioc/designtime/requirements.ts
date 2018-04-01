import * as AST from './ast';
import { IRequirement, IInjectionPoint, IFulfillment } from '../runtime/interfaces';
import { RuntimeRequirement } from '../runtime/requirements';
import { DependencyType, Pair } from '../runtime/types';
import { SyntaxFulfillment } from './fulfillments';
import { NullFulfillment } from '../runtime/fulfillments';
import { DesigntimeParameterInjectionPoint } from './injection-point';
import { getTypeSourceFromCtorParameter } from './types';

export class DesigntimeRequirement implements IRequirement {
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
  public isEqualTo(other: DesigntimeRequirement): boolean {
    if (!(other instanceof DesigntimeRequirement)) {
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
          const ip = new DesigntimeParameterInjectionPoint(
            type,
            typeSource || param,
            param,
            type.ctor.parameters.indexOf(param),
            new Pair('constructor', null)
          );
          requirements.push(new DesigntimeRequirement(ip));
        }
      }
    }

    return requirements;
  }
}
