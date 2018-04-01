import { IRequirement, IInjectionPoint, IFulfillment } from './interfaces';
import { DependencyType, Pair, getParamTypes, registry } from './types';
import { ClassFulfillment, NullFulfillment } from './fulfillments';
import { RuntimeParameterInjectionPoint } from './injection-point';

export class RuntimeRequirement implements IRequirement {
  public readonly isRequirement: true = true;
  public readonly injectionPoint: IInjectionPoint;
  public readonly requiredType: DependencyType;
  private fulfillment: IFulfillment;

  constructor(injectionPoint: IInjectionPoint, requiredType?: DependencyType, fulfillment?: IFulfillment) {
    this.injectionPoint = injectionPoint;
    this.requiredType = requiredType || injectionPoint.type;
    if (fulfillment === undefined) {
      if (typeof this.requiredType === 'function') {
        fulfillment = new ClassFulfillment(this.requiredType);
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

    if (typeof type === 'function') {
      const paramRequirements = registry.getMetadata(type).requirements;
      if (paramRequirements) {
        return paramRequirements;
      }
      const member = new Pair('constructor', Object.getOwnPropertyDescriptor(type.prototype, 'constructor'));
      const paramTypes = getParamTypes(type);

      for (let i = 0; i < paramTypes.length; i++) {
        requirements.push(new RuntimeRequirement(new RuntimeParameterInjectionPoint(type, paramTypes[i], member, i)));
      }
    }

    return requirements;
  }
}
